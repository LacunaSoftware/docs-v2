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

Eight states: one terminal "good" outcome (`Completed`), two terminal "bad" outcomes (`Failed`,
`Canceled`). Two of the eight are **waits, and both are opt-in**: `AwaitingSigner` is only visited by
jobs whose profile uses `Method = LacunaSigner` (see
[Lacuna Signer integration](lacuna-signer.md)), and `AwaitingApproval` only by jobs whose profile
carries an [`Approval` block](approvals.md).

```
                  ┌─────────┐  operator cancel   ┌──────────┐
                  │ Queued  ├───────────────────▶│ Canceled │ (terminal)
                  └────┬────┘                    └──────────┘
          worker pickup│
                       ▼
                ┌────────────┐  local sign ok   ┌───────────┐  verify ok   ┌───────────┐
                │ Processing ├─────────────────▶│ Verifying ├─────────────▶│ Completed │
                └─┬────────┬─┘                  └─────┬─────┘              └───────────┘
                  │        │                          │ verify fail
   profile requires│        │dispatch to               ▼
   approval        │        │Lacuna Signer         ┌────────┐
                   ▼        ▼                      │ Failed │ (terminal)
    ┌──────────────────┐  ┌────────────────┐       └────────┘
    │ AwaitingApproval │  │ AwaitingSigner │
    └──────────────────┘  └────────────────┘
        │         │           │        │
        │         │           │        └─ refused / expired / timeout ─▶ Failed
        │         │           └─ concluded → bytes downloaded ─────────▶ Verifying
        │         └─ rejected / operator cancel / budget expired ──────▶ Canceled
        └─ quorum met ──▶ back to Queued (re-enters the ordinary queue)

   Failed ──operator retry──▶ a NEW Queued job (ParentJobId set; the failed job stays Failed)
```

Key rules:

- **`AwaitingApproval` has exactly three transitions**, and `Failed` is deliberately not one of them.
  Nothing holds a parked job — no worker, no slot, no remote service — so nothing is in a position to
  fail it. It is released back to `Queued`, cancelled, or it waits. Three different things arrive on
  that one cancel edge: an approver's **rejection**, an operator's cancel, and — on a profile that sets
  `Approval.ExpiresAfter` — the wait budget running out. All three mean "this file will not be signed,
  deliberately"; the audit trail is what tells them apart.
- **Release re-enters the ordinary queue** rather than resuming in place, so a released job passes
  through the same claim and the same pre-sign gates as any other — including the
  [payment-date staleness guard](cnab240.md#payment-dates-that-have-passed), which is exactly the check
  an open-ended human delay needs re-run. It resumes on the copy it parked with, and the staged bytes
  are re-hashed immediately before the signature exists; a mismatch fails the job with
  `approval.content-changed`. See [Approvals](approvals.md#what-is-approved).
- **Cancel is valid only from `Queued`, `AwaitingSigner` or `AwaitingApproval`.** In-flight local jobs
  (`Processing`, `Verifying`) cannot be canceled — they run to natural completion or failure. The
  cancel endpoint returns `409` with `code = "job.not-queued"` against an in-flight local job. For
  LacunaSigner profiles, cancelling an `AwaitingSigner` job also makes a best-effort remote-cancel call
  *after* the local `Canceled` transition has committed — a remote failure does **not** roll back the
  local cancel. See [Cancel semantics](lacuna-signer.md#cancel-semantics).
- **`Canceled` is terminal.** Files for canceled jobs remain in `input/`; the watcher honors recent
  cancellations and will not auto-resurrect them. Operator-driven actions (Upload, Retry, Rescan)
  will re-enqueue.
- **`Failed → Queued` is not a transition — it is a new job.** Retry creates a fresh job with
  `ParentJobId = (the failed job).Id`, copying the original input. The failed job stays `Failed`
  forever for audit purposes.

## When an input file changes mid-job

A producer sometimes re-sends a file under the same name while Bulk Signer is still working on the
previous one — a corrected amount, a re-exported batch, an ERP retry. When that happens **the
correction is not ingested**: the watcher sees an active job already holding that path and refuses the
duplicate enqueue, which is the same rule that stops one file being enqueued twice.

What the pipeline does about it is refuse to destroy it. Before deleting the original input, the worker
compares the file against what was recorded while it was being copied into `processing/` — length and
SHA-256 always, plus the storage service's entity tag where the file is on a share. If they match, the
input is deleted as always. If they do not, **the file is left exactly where it is** and the divergence
is recorded in three places:

- an `InputDiverged` operational event, carrying the code `job.input-diverged`;
- an entry in the job's own history, visible on `/jobs/{id}`, carrying the same code;
- the `bulksigner_inputs_diverged_total{profile}` counter.

:::note A divergence is not a signing failure
The signature is valid, the artifact is in `output/`, and the job completes normally — what was signed
is the file that was staged and, where an approval gate applies, approved. Nothing about the job needs
fixing.
:::

**The rewritten file is then handed back to its watched folder and signed as a job of its own.** The
watcher's change event fired *during* the job's flight and was correctly dropped, and no further event
will ever arrive for a file that is simply sitting there — so the pipeline hands the path back
explicitly, **after** the job reaches a terminal status. It re-enters through the watcher's *ordinary*
candidate route, so the stability detector, the folder's ignore lists and its profile all apply exactly
as they do to any arrival.

Two cases still need you. The hand-back is dropped, and the console says so, when:

- **The job did not come from a watched folder** — a REST upload has no watcher that owns its path.
  Re-submit the file if it should be signed.
- **No watcher is running for that folder** — either the process is still booting (which resolves
  itself moments later), or the folder's watcher stopped after repeated failures. Check the Input page;
  a **Rescan** ingests the folder's contents once the underlying problem is fixed.

**What to check when you see a divergence:**

1. **Was the correction meant to replace something already signed?** The first signature covers the
   superseded content, and it is valid; if a downstream consumer must not act on it, that is a business
   decision to make explicitly. Note that the second artifact is named from the input file's name, so
   it is named identically to the first: if you have not yet collected the first from `output/`, the
   second job fails on promote with `Output already exists at … resolve manually before re-queueing`.
   Move or collect the first, then retry the job.
2. **Is the producer re-sending routinely?** A count that tracks the parked-job rate means files are
   being re-exported during approval windows, and each one costs a duplicate signature and a second
   trip through the gate. The fix is on the producer's side — write each remessa under a unique name.
3. **Was the file merely unreadable, or held?** A producer holding its own file open for write is
   retried a few times and then reported as a divergence (`unreadable: …`). So is a file another
   process has taken an exclusive hold on (`held by another lease: …`). In both cases nothing is
   forced. A **hold** that never clears usually means a second Bulk Signer instance is watching the
   same folder — a configuration to fix rather than a producer to wait for.

The window this closes is widest on the flows that put a human in the loop. An ordinary local job
stages and deletes seconds apart; a job in `AwaitingApproval` with no `ExpiresAfter` waits
indefinitely.

### The two holds on an input file

Bulk Signer takes an exclusive hold on a file in your input folder **twice, briefly, and never in
between**:

1. **While it stages the file.** Taken when the pipeline commits to copying, released as soon as the
   copy is done. Under it, nothing can write to the file between the read that copies it and the
   reading of the identifier that will later identify it.
2. **While it deletes the file.** A separate hold, so that on a share the comparison and the delete are
   a single act.

**Nothing holds your file while a job waits on a human.** A job parked in `AwaitingApproval` or
`AwaitingSigner` keeps an exclusive hold on its own staged copy in `processing/`, for as long as the
wait takes — but not on the file in your input folder, because a quorum can take days and your ERP
writes to that folder.

**A hold is never broken and a file is never force-deleted.** If something else holds your input file
when Bulk Signer wants to stage it, the job **fails** with a message naming the file. If something else
holds it at deletion time, the deletion is deferred, retried, and then reported as a divergence.

:::info What a hold is worth depends on where the folder is
On an **Azure Files** input folder the hold is a real service-side lease: it denies writes and deletes
to every other client of that share, including another Bulk Signer instance. On a **local** input
folder it is Bulk Signer's own bookkeeping and excludes nothing outside this process — a filesystem
cannot express "deny writes to everyone but admit my own delete". What protects a local input is the
comparison rather than the hold, and **the comparison is equally strong on both**.
:::

## What changes day to day on a share

`Storage:Provider = AzureFiles`, or a single input folder that names it, changes four things. Pause,
cancel, retry, rescan, the download button, the job state machine, the approval gate, encryption and
what an approver is shown all behave identically — this feature moves bytes and nothing else.

**1. Ingestion is on a timer, so it is no longer near-instant.** A local folder is event-driven: the OS
reports a new file within milliseconds. Azure Files publishes no change notifications, so a remote
folder is **enumerated on its poll interval**. Worst case from a producer closing a file to a job
appearing in `Queued` is the poll interval (30 s by default) plus the stability window plus one round
trip — **about half a minute on the defaults**, and up to a full interval on a bad tick.

- It is per folder, so a payroll folder can poll every 10 s while an archive folder polls every 5
  minutes.
- The floor is 5 s, and the trade is money: every tick is a listing transaction whether or not anything
  arrived. A folder polled at 5 s costs six times what the same folder costs at 30 s, idle or not.
- Two paths are **not** on the timer and stay immediate: `POST /api/files` and `POST /api/rescan`. If
  somebody needs a file signed *now*, rescan that folder rather than lowering the interval for ever.

Do not read a slow first job as a broken folder. Read the Input page: a folder that is `Running` with
no error and a recent scan is doing exactly this.

**2. A quiet folder and an unreachable one look identical from the share, so read the surfaces
instead.** A folder that cannot be listed, cannot be opened, or whose credential has been refused shows
up on the Input page, in `GET /api/folders` (`status`, `lastError`) and in `GET /api/ready` — it is
never reported as a folder that simply has nothing new. **The one to alert on is `/api/ready`**: a
degraded folder can otherwise sit unnoticed for as long as nobody opens the dashboard, and payment
files piling up unsigned is a phone call rather than a page.

**3. Inspecting files means a storage client, not a shell.** `error/<jobid>/`, `processing/<jobid>/`
and `output/` are in the share, so wherever this documentation says "look at the file in `error/`" it
means Azure Storage Explorer, `az storage file download`, or a mount on your own workstation. A live
job's staged copy carries an infinite lease, so it refuses writes and deletes from everything including
your own tooling. `logs/` and the SQLite database are **not** in the share and never can be.

**4. The share is marked, and the mark is read at boot.** See the next section.

## When another instance appears to own the work share

**This section applies only when `Storage:Provider = AzureFiles`.** A local work tree is not shared
storage — two instances pointed at one host's `data/` are the same instance twice. Local deployments
have no marker, no row and no warning.

:::note This whole section describes cluster mode **off**
With `Cluster:Enabled = true` the marker means something different: the share is claimed by *the
cluster* rather than by one instance, siblings share it deliberately, and the `work share owner` row
reads `this cluster (one marker, shared between instances)`. What the marker guards under the switch is
the one catastrophe below that no database can see — two operational stores over one share — and an
instance whose store does not match the marker **refuses to start**. See
[High availability](high-availability.md#the-work-share-gate-is-narrower-than-the-catastrophe-it-is-named-for).
:::

A work share is shared storage, which invites the assumption that two hosts may now serve one
deployment. **Off cluster mode they may not** — and moving the operational store to SQL Server does not
change that on its own, because none of the blockers are in the store:

- the pipeline's **pause flag is a singleton row** read each poll iteration by *the* worker, so two
  workers read the same row and both act on it;
- the **watchers are per-instance and event-driven**, so both see a file arrive and both enqueue it,
  with the loser recording an enqueue failure against that folder;
- **nothing records which instance owns a job**, so a boot sweeps rows a sibling is still working.

Cluster mode is the supported answer to each of those three, and it is a deliberate opt-in rather than
something inferred from the storage provider — see
[Azure App Service (cluster mode)](azure.md).

**How the mark works.** The instance takes an exclusive, non-expiring lease on
`bulksigner-instance.json`, a small file beside `processing/`, `output/` and `error/`. It records the
host name, the process id and the moment of the claim. A graceful shutdown gives the lease up; the file
stays behind as the record of who ran last.

**What happens when the marker is already held.** Startup is never blocked. Instead:

1. a `Critical` entry lands in the log naming the prior holder's **host and process id**;
2. the same line is printed to stdout, and the banner's `work share owner` row reads
   `CONTENDED at startup by …`;
3. the System page shows it above the storage paths;
4. `/api/ready` returns **503** with a red `work-share-owner` check;
5. the lease is broken, taken, and the boot carries on.

**Why a warning and not a refusal.** A lease lives on the storage service, not in the process that took
it — so a crash, a `docker kill`, a power cut or an OOM leaves the marker held by a process that no
longer exists. Refusing to start would turn every one of those into a manual recovery in the middle of
the night. This product cannot tell a dead holder from a live sibling, so it hands you the two facts
that can, and keeps signing.

**What to do when you see it.** Ask whether the named host and process are still running.

- **It is this host, and that process is gone.** Your previous instance did not shut down gracefully.
  Nothing is wrong now.
- **It is a different host, or that process is alive.** You have two instances on one work share. Stop
  one of them, then decide which database is authoritative.

:::note The readiness row does not clear by itself, and that is deliberate
The marker is claimed once at boot; nothing re-reads it, because there is no fresher answer to be had —
this instance holds it now. So an ungraceful stop costs one red readiness cycle, and the boot after a
graceful stop is green again.
:::

**What actually diverges.** Two instances signing from one work share do **not** sign the same file
twice: the per-file lease on an input file is refused rather than broken. What diverges is everything
in each instance's own store:

- **Approval state** — a job parked at the gate exists in one instance's store only. The other knows
  nothing about it, its approvers, or the quorum it is waiting on. This is the one worth acting on
  quickly.
- **Pause state** — `POST /api/pipeline/pause` holds one instance. The other keeps signing.
- **Statistics and job history** — each instance reports its own, so neither dashboard is the whole
  picture.

**If the marker cannot be claimed at all** — an unreachable share, a rotated credential — the row reads
`not claimed cleanly at startup: …` and readiness goes red for that reason instead. Whether another
instance holds it is then simply unknown, and unknown is not reported as the reassuring answer.

## Which instances are alive (cluster mode only)

With `Cluster:Enabled = true`, each instance keeps one row in the operational store — who it is, when it
last beat, and which application version it is running — and every instance can read every other's.
**System → Instances** on the dashboard is that table.

| Column | What it tells you |
|---|---|
| Instance | The derived identity. On App Service this comes from the platform's `WEBSITE_INSTANCE_ID`, so it is stable for the life of the instance and distinct between siblings. |
| State | **Live** while the last heartbeat is inside `Cluster:StaleAfterSeconds`; **Stale** past it. Stale is a presumption, not a confirmed death — see [the wager](high-availability.md#a-presumed-death-is-a-wager). |
| Version | The application version that instance is running. Two different values here during anything but a deploy window is the mixed-version condition, and it is reported as a Critical at the newer instance's boot. |
| Last beat | Age of the most recent heartbeat. The caption under the table names the cadence (`Cluster:HeartbeatSeconds`, default 15) and the staleness threshold (default 60) actually in force. |

One row is badged as the instance answering your request. Because the load balancer picks per request,
reloading the page moves that badge between rows — which is the cheapest confirmation available that
traffic really is spread.

`GET /api/folders` carries an `instance` field for the same reason: a machine client polling it needs to
tell "the folder changed" from "a different instance answered".

## When an instance stops answering, a survivor takes its jobs over

Every surviving instance watches the heartbeat table. When a sibling goes stale, one survivor claims its
in-flight rows and reconciles each one **by where it had got to**, not by retrying it:

| The dead instance's job was… | What the survivor does | Why |
|---|---|---|
| Claimed, but had not reached the sign call | **Re-enqueued** | Nothing was attempted, so nothing is being retried. |
| Past the sign call | **Failed**, conservatively | A signature is never re-attempted without a human deciding it. `Failed` is an honest terminal outcome, not "stuck" — the operator's [manual retry](#retrying-failed-jobs) remains the retry. |
| `AwaitingSigner` (dispatched to Lacuna Signer) | **Reassigned** to the survivor, which resumes polling it | The remote side holds the work; only the poll needs a new owner. |

Each takeover writes a `JobTakenOver` operational event naming **both** instances, so the audit trail
records who lost the work and who picked it up.

:::warning Takeover sits behind the pause gate
`POST /api/pipeline/pause` holds every instance, and takeover does not run while the pipeline is paused.
That is deliberate: an operator pausing a cluster to investigate a store that has gone slow is exactly
the person who must not have every instance declare every sibling dead.
:::

Two rows nothing will ever take over, both reported rather than adopted:

- **A job with no owner at all**, left by a build older than the ownership column or by a run with the
  mode off. The remedy is named on every surface that meets one — boot once with `Cluster:Enabled =
  false` so ordinary [startup recovery](#startup-recovery) sweeps it, then turn the mode back on.
- **A job owned by a named instance that has no heartbeat row.** Absence of a heartbeat is not evidence
  of death, so this is reported once and left rather than read as a licence to fail live work.

Both cases, and why adopting them would reintroduce the defect the feature removes, are in
[High availability](high-availability.md#rows-nobody-owns-are-reconciled-by-nobody).

## Contention between instances is not a failure

Every instance watches every input folder, so on each arrival they race. That is the design, and the
losing side of the race is classified as an **expected outcome** rather than an error:

- The losing enqueue is refused by a partial unique index over active original paths and answered
  `AlreadyActive`. Every file becomes exactly one job.
- A lease conflict on an input file is logged at the expected-outcome level, under its own event id, so
  "a sibling got there first" and "something else on this instance did" stay different facts.
- **Neither counts against the folder's consecutive-failure budget**, and an `AlreadyActive` outcome
  resets that counter exactly as a successful enqueue does. A busy cluster therefore cannot trip the
  [per-folder breaker](#per-folder-watcher-failure-isolation) simply by being busy.

The batch claim degrades under contention too — it falls back to claiming one row at a time and logs the
lost race. That is a small, known cost rather than a fault.

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

## Clear Jobs

A maintenance action that **permanently deletes finished job records** — the job rows and their history
timelines — for administrative cleanup. It does **not** touch operational events, pipeline state,
signing profiles, configuration, signed or processed files, or logs.

:::warning Changed in 2.0.0 — finished records only
Clear Jobs now deletes **terminal** jobs only. A `Queued`, parked or in-flight job survives the action,
and both surfaces report what they left behind alongside what they removed. A script that clears the
table and then expects it to be empty has to drain or cancel the unfinished jobs first.

Deleting the row under a running job was the sharpest operator-action hazard in the product — under a
cluster it would be a *sibling's* running job — so the narrowing is not gated on `Cluster:Enabled` and
applies to every deployment.
:::

From the dashboard: **System → Danger zone → Clear Jobs**. A confirmation dialog gates the action;
cancelling deletes nothing. From REST:

```bash
curl -X DELETE http://localhost:8080/api/jobs \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
# → {"deleted": 1230, "skipped": 4, "message": "Cleared 1230 job record(s); skipped 4 unfinished."}
```

What happens on confirm:

- Every **terminal** job row and its history is deleted in one transaction (retry-chain parent links
  are dissolved first so the self-referencing foreign key does not block the delete).
- Unfinished rows are counted and reported as `skipped` — on the dashboard as a line in the result
  message, in the REST response as its own field.
- A `JobsCleared` operational event records the actor (cookie or API-key identity), timestamp, and both
  counts; the same is emitted to the structured log. On failure the transaction rolls back, an error is
  logged, and the operator stays on the page.
- A deployment-wide **reset marker** moves inside the same transaction, so the
  [performance panel](statistics.md#resetting-the-panel) counts only jobs completed after it. Nothing
  is deleted to clear the panel, and a clear that fails leaves it exactly as it was.

:::warning There is no undo
Back up the operational store first if the job history has audit value — `db/bulksigner.db` under
SQLite, or your DBMS regime's backup under SQL Server. See [Retention](retention.md#backup-discipline).
:::

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

:::note Under cluster mode a boot sweeps only its own rows
A job records the instance that claimed it, and with `Cluster:Enabled = true` recovery is filtered to
this instance's own identity — otherwise a boot would fail work a live sibling is still doing. A
sibling's interrupted rows are handled by
[takeover](#when-an-instance-stops-answering-a-survivor-takes-its-jobs-over) instead, which follows the
owner's heartbeat rather than the boot.

The consequence is the one thing to do at the upgrade: a row left in progress by an older build carries
**no** owner, and nothing under the switch will ever sweep it. Boot once with `Cluster:Enabled = false`
before the first cluster boot and this sweep clears them all.
:::

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
