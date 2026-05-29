---
sidebar_label: "Operations"
sidebar_position: 6
---

# Operations

Day-2 operations for Lacuna Bulk Signer. How to start, stop, restart, observe, pause, and reason
about the signing pipeline.

## Lifecycle commands per target

| Target | Start | Stop | Restart | Status |
|--------|-------|------|---------|--------|
| Linux (systemd) | `sudo systemctl start bulksigner` | `sudo systemctl stop bulksigner` | `sudo systemctl restart bulksigner` | `systemctl status bulksigner` |
| Windows | `Start-Service LacunaBulkSigner` | `Stop-Service LacunaBulkSigner` | `Restart-Service LacunaBulkSigner` | `Get-Service LacunaBulkSigner` |
| Docker | `docker compose up -d` | `docker compose stop` | `docker compose restart` | `docker compose ps` |
| Console | run the published executable | `Ctrl+C` | rerun | `/api/health` |

The systemd unit uses `Type=notify` — `systemctl status bulksigner` reports `active (running)` only
**after** the full bootstrap (license load + migrations + pipeline recovery) succeeds. The same is
true on Windows: the service is marked "Started" only after the ready-summary banner has been
printed.

## Where logs live

| Target | Path |
|--------|------|
| Linux | `/var/log/bulksigner/bulksigner-yyyyMMdd.log` |
| Windows | `C:\ProgramData\Lacuna\BulkSigner\logs\bulksigner-yyyyMMdd.log` |
| Docker | `/var/log/bulksigner/` inside the container — bind-mounted to `deploy/docker/logs/` on the host |
| Console | `data/logs/bulksigner-yyyyMMdd.log` (relative to the working directory) |

Logs roll daily, 50 MB per file (configurable), 14 files retained by default. Each line is plain text
with structured properties at the end:

```
2026-05-26T15:42:11.1234567+00:00 [INF] Worker started job 9b62…  {JobId: "9b62…", Format: "Pades"}
```

This format is `tail -f`-friendly for operators and structurally parseable for forensic tooling.

Service-level events go to:

| Target | Where |
|--------|-------|
| Linux | `journalctl -u bulksigner` (lifecycle + stdout) |
| Windows | Event Viewer → Windows Logs → Application (service lifecycle only — app-level logs are in the file sink) |
| Docker | `docker compose logs -f bulksigner` |
| Console | The terminal |

Both file and console output pass through the secret-redaction pipeline. See
[Security](security.md#log-redaction--two-layers).

## The job state machine

Seven states: one terminal "good" outcome (`Completed`), two terminal "bad" outcomes (`Failed`,
`Canceled`). `AwaitingSigner` is only visited by jobs whose profile uses `Method = LacunaSigner` (see
[Lacuna Signer integration](lacuna-signer.md)).

```
                ┌─────────┐  operator cancel   ┌──────────┐
                │ Queued  ├───────────────────▶│ Canceled │ (terminal)
                └────┬────┘                     └──────────┘
        worker pickup│
                     ▼
              ┌────────────┐  local sign ok   ┌───────────┐  verify ok   ┌───────────┐
              │ Processing ├─────────────────▶│ Verifying ├─────────────▶│ Completed │ (terminal)
              └─────┬──────┘                  └─────┬─────┘              └───────────┘
   dispatch to      │                               │ verify fail
   Lacuna Signer    │                               ▼
                    ▼                          ┌────────┐
            ┌────────────────┐  concluded →    │ Failed │ (terminal)
            │ AwaitingSigner ├── bytes ─────────▶ (Verifying) ...
            └────────────────┘  refused/expired/
                                 timeout → Failed

   Failed ──operator retry──▶ a NEW Queued job (ParentJobId set; the failed job stays Failed)
```

Key rules:

- **Cancel is valid only from `Queued` or `AwaitingSigner`.** In-flight local jobs (`Processing`,
  `Verifying`) cannot be canceled — they run to natural completion or failure. The cancel endpoint
  returns `409` with `code = "job.not-queued"` against an in-flight local job. For LacunaSigner
  profiles, cancelling an `AwaitingSigner` job also makes a best-effort remote-cancel call *after*
  the local `Canceled` transition has committed — a remote failure does **not** roll back the local
  cancel. See [Cancel semantics](lacuna-signer.md#cancel-semantics).
- **`Canceled` is terminal.** Files for canceled jobs remain in `input/`; the watcher honors recent
  cancellations and will not auto-resurrect them. Operator-driven actions (Upload, Retry, Rescan)
  will re-enqueue.
- **`Failed → Queued` is not a transition — it is a new job.** Retry creates a fresh job with
  `ParentJobId = (the failed job).Id`, copying the original input. The failed job stays `Failed`
  forever for audit purposes.

## The signing pipeline

```
input/file.pdf
      │  Watcher (or POST /api/files)
      ▼
   Queued ──▶ worker claims ──▶ move input → processing/ ──▶ Sign ──▶ Verify
                                                                       │
                                            Encryption.Enabled?  ──────┤
                                              yes → output/file.signed.pdf.enc
                                              no  → output/file.signed.pdf
                                            on failure → error/
```

The worker is single-instance per configured folder set and processes up to
`Pipeline:MaxConcurrency` jobs in parallel. Default `1` is sequential; operators opt in to `N > 1`
for throughput (PFX-only — see the PKCS#11 / WindowsStore caveat in [Certificates](certificates.md)).
The worker:

1. Polls the queue every `Pipeline:PollIntervalSeconds` seconds, gated by the configured concurrency.
   When all slots are busy, polling pauses until a slot frees up.
2. Checks the pause flag. When paused, the worker loops idle without picking work up; existing
   in-flight jobs drain to natural completion. The pause flag is observed each poll iteration and
   survives restart.
3. Claims the next `Queued` job atomically (transitions `Queued → Processing`). If a racing writer
   (a cancel, or a peer worker) modified the row first, the worker skips to the next iteration.
4. For each claimed job, moves the input into `processing/<jobid>/`, signs, verifies, optionally
   encrypts, then promotes to `output/`. Each job runs in isolation with its own processing folder.
5. On any failure: moves the `processing/<jobid>/` content to `error/<jobid>/`, marks the job
   `Failed`, and records the exception message in the job's error field and history.
6. **The original input is removed from `input/` only after successful verification.** Verification
   happens before delete, never the other way around.

**Drain on pause.** When an operator pauses while jobs are in flight, the worker stops claiming new
ones but already-running jobs run to completion. The dashboard's "Slots busy" card counts down as
they drain.

### LacunaSigner profiles — separate poll worker

When a profile uses `Method = LacunaSigner`, the worker only **dispatches** the job to Lacuna Signer
(upload + create-document) and immediately transitions it to `AwaitingSigner` — the concurrency slot
is released as soon as dispatch succeeds. A separate poll worker walks every `AwaitingSigner` row on
its own cadence (`Signer:PollIntervalSeconds`, default 30 s), downloads the bytes when the remote
document concludes, and runs the same verify → optionally-encrypt → promote tail. See
[Lacuna Signer integration](lacuna-signer.md).

## Pause and resume

```bash
# Hold the worker (idempotent — already-paused returns 200 too)
curl -X POST http://localhost:8080/api/pipeline/pause \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Quarterly maintenance"}'

# Resume (also idempotent)
curl -X POST http://localhost:8080/api/pipeline/resume \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

# Inspect current state
curl http://localhost:8080/api/pipeline/state \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Pause / resume are durable — the pause flag survives a service restart. A paused worker still accepts
uploads and watcher pickups (jobs go to `Queued`); they just do not advance. Operators see
"Pipeline: Paused" on the dashboard System page.

When a pause is in effect:

- Jobs already in `Processing` / `Verifying` complete normally. Pause stops the **next** pickup, not
  the in-flight work.
- The `bulksigner_pipeline_paused` gauge flips to `1`.
- A system event is written with the optional `reason`:
  `"Pipeline paused by operator. Reason: Quarterly maintenance."`. The same convention applies to
  resume.

## Canceling jobs

```bash
curl -X POST http://localhost:8080/api/jobs/$JOB_ID/cancel \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Valid for `Queued` and `AwaitingSigner` (the latter only exists for LacunaSigner profiles). The
endpoint returns `409 { code: "job.not-queued" }` if the job has already advanced past those states
(e.g. a local job the worker picked up between the operator's decision and the request). In-flight
local jobs are sacred — removing them mid-sign would leave orphaned `processing/` content and an
unverified output.

After cancel:

- The job becomes `Canceled` (terminal).
- An audit history entry is added: `"Operator canceled: <reason>."` (or `"Operator canceled."` if no
  reason was supplied).
- The file stays in `input/`. The watcher's recent-cancellation memory prevents auto-resurrection;
  operator-driven re-runs via Upload, Retry, or Rescan will re-enqueue.

## Retrying failed jobs

```bash
curl -X POST http://localhost:8080/api/jobs/$JOB_ID/retry \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Creates a new job with a fresh `Id`, the same `FileName` / `OriginalPath` / `Format`,
`ParentJobId = (the failed job).Id`, and initial state `Queued`. The failed job stays `Failed`; the
chain is reconstructable from `ParentJobId`.

Returns `404 { code: "job.not-found" }` for unknown ids, `409 { code: "job.not-failed" }` for jobs
that are not `Failed`, `409 { code: "job.input-missing" }` if the original input file is no longer on
disk.

The dashboard's Job detail page surfaces parent/child links so operators can walk a retry chain back
to the root failure.

## Rescan

```bash
# Every configured folder
curl -X POST http://localhost:8080/api/rescan \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

# Just one folder
curl -X POST "http://localhost:8080/api/rescan?folder=legal" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Re-enqueues every file currently in the configured input folder(s) that is not already an active job.
Useful after a long pause or after manually placing files. The response is a per-folder breakdown plus
aggregate counts. Each rescanned file is tagged with the matching folder's name.

Rescan **does** re-enqueue files that were recently canceled (unlike the watcher's auto-pickup path,
which leaves canceled files alone).

## Per-folder watcher failure isolation

Each `Storage:Inputs[]` entry has its own watcher with its own consecutive-enqueue-failure budget
(default 10). When the budget trips for a folder, that watcher marks itself `Stopped` and exits —
**the process keeps running and other folders' watchers are unaffected**.

A `Stopped` watcher does not auto-revive. The state surfaces in three places:

- The Input dashboard card for that folder shows a red "stopped" chip and the last-error text.
- `GET /api/folders` returns `"status": "Stopped"` with `lastError` populated.
- `GET /api/ready` returns `503` with `input-folder:<name>` failing in the `checks` array.

To recover: fix the underlying cause (mount, disk, permissions) and restart the service.

:::note
A degraded folder is easy to miss if you don't watch `/api/ready` or the Input page. Set up an
external monitor that probes `/api/ready` so a single bad mount doesn't go unnoticed.
:::

## Startup recovery

A recovery sweep runs after migrations and before the worker starts. For every job still in
`Processing` or `Verifying` at startup (i.e. the previous run was killed mid-flight):

- The job is marked `Failed` with message
  `"Service restarted while job was in flight; marked as failed during recovery."`.
- The matching `processing/<jobid>/` directory is moved to `error/<jobid>/` so the in-flight content
  is preserved for forensics.
- The original input file (if it still exists in `input/`) is left where it is — operators can re-run
  via Rescan or Upload.

**`AwaitingSigner` rows are explicitly NOT swept.** Those jobs are parked on the remote Lacuna Signer
side — the local host has no way to know whether the participant has signed yet, and sweeping them to
`Failed` would invalidate work the host did not perform. The poll worker picks up polling again on
its first tick after boot, exactly where it left off.

The recovery sweep is idempotent — a clean restart finds no in-flight jobs and is a no-op.

## The ready-summary banner

On every startup, after the bootstrap completes, the service prints a panel summarizing the most
decision-critical state:

```
================================ Service ready ================================
host mode      = systemd
environment    = Production
https redirect = off (terminate TLS at reverse proxy)
content root   = /opt/bulksigner
storage root   = /var/lib/bulksigner
db             = /var/lib/bulksigner/db/bulksigner.db
pki license    = <16-hex-char SHA-256 fingerprint>
cert source    = Pkcs11 (module=/usr/lib/...)
signing policy = ADR-Básica (PAdES + CAdES + XAdES)
encryption     = enabled (BSENC v1, salt loaded)
poll interval  = 2s
pipeline       = running
================================================================================
```

This is the fastest way to verify a config change took effect. A mistyped key surfaces as the default
value rather than the value you intended.

A second panel — **Signing profiles** — lists every resolved profile (or the synthesised legacy
`default` profile). Profiles configured with `Verify=false` or `ValidateCertificate=false` emit
additional `WARN` lines (to both stdout and the log file) so the low-trust posture is captured
durably.

### Foreground console runs: live dashboard

Under a foreground invocation on an interactive terminal, the streaming log is replaced by an
in-place live panel showing paused state, queue length, in-flight count + per-format breakdown,
completed/failed/canceled totals since boot, uptime, and the listening address. Service-host
deployments (Windows Service, systemd, Docker) are unaffected. See
[Console dashboard](dashboard.md#console-dashboard-foreground-runs-only).

## Observability summary

| Surface | What you get |
|---------|--------------|
| `journalctl -u bulksigner` / Event Viewer / `docker compose logs` | Bootstrap, lifecycle events, fatal errors, stdout |
| `/var/log/bulksigner/bulksigner-yyyyMMdd.log` (etc.) | The durable structured log; secrets redacted |
| `GET /api/metrics` | Prometheus exposition — see [REST API](rest-api.md#metrics) |
| `GET /api/ready` | Per-probe readiness JSON (DB, input folder, license) |
| Dashboard System page | License fingerprint, certificate source, queue length, pause state |
| Job history (in the database) | One row per state transition for every job |

## Routine operator tasks

| Task | Where |
|------|-------|
| Watch live ingestion | Dashboard's "Pipeline status" card or `tail -f bulksigner-*.log` |
| Investigate a failure | Dashboard Job detail → timeline → click the error message; or `error/<jobid>/` on disk |
| Re-run a failed job | Dashboard `Retry` button or `POST /api/jobs/{id}/retry` |
| Plan downtime | `POST /api/pipeline/pause` with a `reason`; wait for in-flight jobs to clear; then stop the service |
| Apply an upgrade | Back up `db/bulksigner.db`, run the install script with the new bundle, watch the bootstrap banner |

See [Troubleshooting](troubleshooting.md) for the failure-mode catalog.

---

**Next:** [Dashboard](dashboard.md) — the operator UI. **Previous:** [Security](security.md).
