---
sidebar_label: "Troubleshooting"
sidebar_position: 12
---

# Troubleshooting

A field guide to the failure modes operators encounter most. Each entry has a symptom, the most
likely root cause, and the commands to diagnose.

If the bootstrap fails, the ready-summary banner does **not** print — the service exits before
reaching it. Look at the per-target log location for the bootstrap exception:

| Target | Where to look |
|--------|---------------|
| Linux | `journalctl -u bulksigner -n 200` |
| Windows | Event Viewer → Windows Logs → Application (`Lacuna.BulkSigner` source) — bootstrap exceptions land there before the file sink is wired |
| Docker | `docker compose logs bulksigner --tail=200` |
| Console | The terminal output |

## Service won't start

### `Signing:License is required`

**Symptom.** The bootstrap throws a validation exception complaining about `Signing:License`.

**Root cause.** Neither `Signing__License` (env) nor `Signing:License` (config) carries a non-empty
value.

**Fix.** Set the env var on the install target:

| Target | Command |
|--------|---------|
| Linux | Add `Signing__License=<base64>` to `/etc/bulksigner/bulksigner.env`, then `sudo systemctl restart bulksigner`. |
| Windows | `[Environment]::SetEnvironmentVariable("Signing__License", "<base64>", "Machine"); Restart-Service LacunaBulkSigner` |
| Docker | Add `Signing__License=<base64>` to `deploy/docker/.env`, then `docker compose up -d`. |

### `Auth:ApiKey is required`

**Symptom.** Bootstrap throws complaining about `Auth:ApiKey`.

**Root cause.** Either no value, or the value is shorter than the 16-character minimum.

**Fix.** Generate a strong key (see [Security](security.md#api-key-rotation)) and set the matching
env var.

### `Pkcs11 PIN env var <name> is empty`

**Symptom.** Bootstrap fails with a message referencing the configured `PinEnvVar`.

**Root cause.** `Signing:Certificate:Source = Pkcs11` but the configured env var is unset or empty.

**Fix.** Set the env var named by `Signing:Certificate:Pkcs11:PinEnvVar` (default
`BULK_SIGNER_PKCS11_PIN`). See [Certificates](certificates.md#pin-handling).

### `WindowsStore source is not supported on this OS`

**Symptom.** Bootstrap fails immediately on a Linux or Docker host.

**Root cause.** `Signing:Certificate:Source = WindowsStore` configured on a non-Windows host.

**Fix.** Switch the source. For Linux / Docker, use `Pfx` or `Pkcs11`.

### `Encryption.Salt must decode to at least 16 bytes`

**Symptom.** Bootstrap fails when `Encryption:Enabled = true`.

**Root cause.** The configured base64 salt is missing, malformed, or shorter than 16 bytes decoded.

**Fix.** Regenerate with 32 random bytes (see [Encryption](encryption.md#generating-the-salt)).

### `Encryption.Iterations must be at least 10000`

**Symptom.** Bootstrap fails with a low-iteration message.

**Root cause.** Typo — `600` instead of `600000` in `Encryption:Iterations`.

**Fix.** Use 600 000 (OWASP 2023 guidance) or higher.

### Service starts but `/api/ready` 503s persistently

**Symptom.** `Get-Service` shows Started / `systemctl` shows active, but `/api/ready` returns 503.

**Root cause.** A readiness probe is failing. The response body lists each probe — DB, input folder,
license.

**Fix.** Inspect the body, then:

| Failed probe | Where to look |
|--------------|---------------|
| `db` | Is the SQLite path under `Storage:Root` writable by the service account? Did the migration succeed? Check the bootstrap log. |
| `input` | Does `data/input/` exist? Is the service account allowed to enumerate it? |
| `license` | Was the PKI license loaded? The fingerprint is in the ready-summary banner; missing means the license string was rejected at boot. |

## Authentication fails

### `401 Unauthorized` from every endpoint

**Symptom.** Every request returns `401 { code: "auth.invalid-credentials" }` or
`{ code: "auth.misconfigured" }`.

**Possible causes:**

- Wrong API key in the `X-API-Key` header. Compare byte-for-byte against `Auth:ApiKey` /
  `Auth__ApiKey`.
- `Auth:ApiKey` empty at runtime (the misconfigured case). Search the log for
  `Auth:ApiKey is empty at runtime`.
- The cookie expired — 8-hour sliding expiration. Sign in again at `/login`.

### Login at `/login` redirects in a loop

**Symptom.** Submitting the login form lands on `/login?error=...`.

**Possible causes:**

- `?error=invalid` — wrong API key. Re-check.
- `?error=server` — `Auth:ApiKey` is empty at runtime. Fix the config and restart.

### Login works but the dashboard immediately logs out

**Symptom.** Sign in succeeds, the page lands on `/`, and the next navigation kicks back to `/login`.

**Root cause.** The session cookie is not making it back through a reverse proxy that strips the
`Set-Cookie` header, or the cookie is being marked `Secure` while the request reached the app as
plain HTTP.

**Fix.** Ensure the reverse proxy forwards `Set-Cookie` and `Cookie` headers unmodified. If
terminating TLS at the proxy, set `X-Forwarded-Proto: https` so the app marks the cookie `Secure`.

## Signing fails

### Boot succeeds but every job fails with "Certificate not found by thumbprint"

**Symptom.** Every job goes `Queued → Failed`. The error message mentions a thumbprint mismatch.

**Root cause.** The configured thumbprint doesn't match any certificate visible to the configured
source.

**Diagnosis:**

| Source | Command |
|--------|---------|
| `Pfx` | `openssl pkcs12 -in /etc/bulksigner/signing.pfx -nokeys -passin pass:<password>` — does the file load? |
| `Pkcs11` | `pkcs11-tool --module /path/to/driver.so --list-objects --type cert --login --pin <pin>` — does the cert exist on the token? |
| `WindowsStore` | `Get-ChildItem -Path Cert:\LocalMachine\My \| Where-Object Thumbprint -eq <thumbprint>` |

Fix the configured thumbprint or import the missing certificate.

### Signing fails with PKCS#11 "module load failed" / "C_Initialize"

**Symptom.** Bootstrap succeeds but the first sign attempt errors with a PKCS#11 initialization
failure.

**Possible causes:**

- Vendor `.so` / `.dll` not present on the host at the path in `ModulePath`.
- (Docker) Vendor library not mounted into the container — see
  [Certificates](certificates.md#docker-mounting-example).
- (Linux) Token requires `pcscd` running — `sudo systemctl start pcscd`.

### Signing fails with "Access is denied" reading a Windows private key

**Symptom.** Signing throws `CryptographicException: Access is denied.` from the Windows store.

**Root cause.** The service virtual account `NT SERVICE\LacunaBulkSigner` does not have access to the
private key.

**Fix.** `certlm.msc` → certificate → All Tasks → Manage Private Keys → Add
`NT SERVICE\LacunaBulkSigner` → grant Read.

### Downstream verifier rejects a Bulk Signer signature

**Symptom.** A signed PDF verifies in the Lacuna PKI SDK but a third-party verifier reports the policy
is unknown or the chain is incomplete.

**Possible causes:**

- The verifier requires a non-default policy (Bulk Signer signs with ADR-Básica by default).
  Coordinate with the downstream system on the expected policy.
- The verifier is missing an intermediate CA. Bulk Signer signs with the chain implicit in the
  certificate; the verifier resolves the chain via its own trust store.

## Pipeline / worker

### Jobs queue but never enter Processing

**Symptom.** `bulksigner_jobs_in_flight` stays at zero; jobs sit at `Queued`.

**Possible causes:**

- The pipeline is paused. `GET /api/pipeline/state` returns `{ paused: true }`. Resume:
  `POST /api/pipeline/resume`.
- The worker is unhealthy. The log shows the worker's iteration lines; if they stopped, the worker
  may have crashed (rare; check for a logged exception).

### Jobs deadlock when `MaxConcurrency > 1` with a PKCS#11 token or Windows CSP

**Symptom.** With `Pipeline:MaxConcurrency > 1` and `Signing:Certificate:Source = Pkcs11` (or
`WindowsStore`), in-flight jobs hang past their normal sign latency, or fail with errors like
`CKR_SESSION_HANDLE_INVALID`, `Provider is busy`, or `Key container is in use`.

**Cause.** Most PKCS#11 tokens (consumer smart cards, USB tokens) expose a single session per login.
Concurrent signing calls from multiple worker tasks contend for that one session. Windows software
CSPs are usually thread-safe; smart-card-backed CSPs are not. The startup banner warns when this
combination is configured.

**Fix.** Set `Pipeline:MaxConcurrency: 1` in `appsettings.Production.json` (or unset for the default),
restart the service. If the vendor documentation states the token supports multi-session and you want
concurrent throughput, contact the vendor with the failing log lines to confirm the configuration.
See [Certificates](certificates.md#concurrency-considerations-per-source).

### Log line: "claim lost to a concurrent writer"

**Symptom.** The log shows a job's claim being lost to a concurrent writer at `Information` level. The
job is in some terminal state (typically `Canceled` if an operator canceled it).

**Cause.** This is expected behavior, not an error. It fires when the worker had loaded a `Queued` row
but, between the load and the save, another writer (the cancel endpoint, or a peer worker) updated the
row. The optimistic-concurrency protection catches the race and the worker yields. Frequency should be
very low — seeing it dozens of times per day suggests a client retry-spamming the cancel endpoint.

**Fix.** None needed. If volumes are unusually high, audit the calling clients.

### Watcher does not pick up files dropped into a configured input folder

**Symptom.** Files appear in one of the `Storage:Inputs[].Path` folders but no job is created.

**Possible causes:**

- File extension is in the effective ignore list — global `WatchedFolder:IgnoredExtensions` baseline
  (`.tmp`, `.part`, `.crdownload`, `.swp`) unioned with any per-folder `IgnoredExtensions`. Rename or
  move out and back in.
- File name prefix is in the effective prefix list (global default: `.`, `~$`).
- File is still being written by the producer. The stability detector requires
  `WatchedFolder:StabilityRequiredSamples` consecutive identical samples before enqueue. Wait, or
  `POST /api/rescan` after the writer finishes.
- **The folder's watcher is in `Status: Stopped`.** See below.
- (Docker) Bind-mount permission issue — the container UID (1654) must be able to read files dropped
  by the host process. `chown -R 1654:1654 ./data` on the host.

### A folder watcher is in `Status: Stopped`

**Symptom.** Files pile up in one configured folder but no jobs are created; the Input page shows the
folder card with a red "stopped" chip and a last-error message. `/api/folders` returns
`"status": "Stopped"` for that folder. `/api/ready` returns 503 with the offending folder in the
`checks` array.

**Root cause.** That folder's watcher hit the per-folder consecutive-enqueue-failure threshold (10 by
default) — typically a poisoned storage path (NFS dropped, share went read-only, disk full on the
SQLite mount).

:::note
The watcher failure is isolated to that folder — other folders keep ingesting and the host stays up.
The trade-off is that an operator who doesn't read `/api/ready` or the Input page can miss a degraded
folder for a long time. Probe `/api/ready` from an external monitor.
:::

**Diagnosis & fix:**

1. Read the last-error text from `GET /api/folders` (or the Input page card).
2. Fix the underlying cause (remount the share, free the disk, repair the path).
3. Restart the service — the watcher does **not** auto-revive after a stop, because the underlying
   poison usually isn't transient.

### A file landed in `error/<jobid>/`

**Symptom.** The Job detail page shows `Failed` with an error message; the `processing/` directory has
moved to `error/<jobid>/`.

**Diagnosis:**

- Read the job's error message (Dashboard or `GET /api/jobs/{id}`).
- Inspect `error/<jobid>/` for the in-flight file — it is preserved exactly as the worker last touched
  it.
- Read the job's history for the full transition timeline.

**Fix:** Resolve the underlying cause, then `POST /api/jobs/{id}/retry`. The retry creates a new
`Queued` job with `ParentJobId` set; the failed job stays for audit.

## Encryption

### Decryption fails with a tag-mismatch error

**Symptom.** Recipient runs the decrypt sample, gets an authentication-tag-mismatch error.

**Possible causes (any one is enough):**

- Wrong password. Verify against the configured `Encryption:Password` / env var.
- Wrong salt. The recipient must use the **same** base64 salt the server used; rotating the salt
  invalidates every prior envelope.
- Wrong iteration count. Match `Encryption:Iterations` exactly.
- The envelope was truncated in transit (e.g. a tool that re-encodes line endings on a binary file).
  Re-fetch the bytes byte-exactly.

### Decryption fails with "Unknown magic"

**Symptom.** Recipient script reports `unknown magic`.

**Root cause.** The downloaded file is not a BSENC envelope — most often, the operator downloaded the
cleartext from a non-encrypted job by mistake.

**Fix.** Confirm the job's `outputEncrypted` flag via `GET /api/jobs/{id}`. If the job was signed with
encryption off, the `.signed.pdf` (etc.) is the file to read, not a `.enc`.

### Lost encryption password

**Symptom.** Operator forgot the password; encrypted outputs exist and need to be readable.

**Reality.** Unrecoverable. Bulk Signer has no escrow, no recovery, no decrypt endpoint. With the salt
and iterations stable, brute-forcing PBKDF2 over a strong password is computationally infeasible
(that's the point).

Forward planning:

- Store the password in a secret manager that supports retrieval (HashiCorp Vault, AWS Secrets
  Manager, Azure Key Vault).
- Print and seal a copy in physical storage as a backup-of-last-resort.

## Lacuna Signer integration

The full operator walkthrough is in [Lacuna Signer integration](lacuna-signer.md). The entries below
are the failure modes specific to that path.

### `Signer:Endpoint is required` / `Signer:ApiKey is required` at startup

**Symptom.** Bootstrap fails with a validation exception against `Signer:Endpoint` or `Signer:ApiKey`.

**Root cause.** At least one `Signing:Profiles[]` entry has `Method = LacunaSigner` but the top-level
`Signer:*` block is empty. The validator is self-gating: it only enforces those keys when a profile
actually needs them.

**Fix.** Either set `Signer__Endpoint` + `Signer__ApiKey` (env vars) or remove the
`Method = LacunaSigner` profile if it was added by mistake. The API key format is
`application-id|secret`.

### Every dispatched document fails with `signer.unreachable`

**Symptom.** Jobs reach `Processing` and immediately transition to `Failed` with audit code
`signer.unreachable`.

**Possible causes:**

- **Wrong API key.** The literal API key is scrubbed from logs, but a permanent error from the SDK
  with a `401` status is the giveaway. Re-generate the key in the Lacuna Signer admin and update
  `Signer__ApiKey`.
- **Network not reachable.** `curl -v "$SIGNER_ENDPOINT/api/version"` from the host. If `curl` fails,
  fix the firewall / proxy / DNS first.
- **Endpoint typo.** `Signer:Endpoint` must include the scheme (`https://`). The startup banner shows
  the configured value — re-read it.

### Documents stuck in `AwaitingSigner` past `Signer:TimeoutHours`

**Symptom.** The Dashboard's **Awaiting signer** tile climbs steadily; nothing transitions to
`Completed`.

**Possible causes:**

1. **The participant has not signed.** Open the Lacuna Signer admin and check the document status for
   the matching id. If it is `Pending` past `Signer:TimeoutHours`, the poll worker will fail the local
   job with `signer.timeout` on its next tick — that is the contract.
2. **The poll worker is not running.** Check the log for `SignerPollWorker started`. If absent, no
   profile has `Method = LacunaSigner`, so the worker is not registered — fix the profile config and
   restart.
3. **The pipeline is paused.** `GET /api/pipeline/state` returns `{ paused: true }`. The poll worker
   honors the pause flag. `POST /api/pipeline/resume` to unblock.

### Operator canceled, but the participant still sees the document

**Symptom.** Job is locally `Canceled`; the signer participant still receives a reminder email or sees
the document in their Signer inbox.

**Root cause.** Cancel is *best-effort* on the remote side. If the remote-cancel call failed at the
moment of local cancel, the local transition was honored but the remote document was not canceled. The
log carries a `Warning` line about the best-effort cancel failure.

**Fix.** Cancel the document manually in the Lacuna Signer admin. The local job is correctly
`Canceled` and needs no further action.

### Dashboard does not show the "Awaiting signer" tile or "Lacuna Signer" panel

**Symptom.** A profile is configured with `Method = LacunaSigner` but the Dashboard does not show the
Awaiting signer tile and the System page does not show the Lacuna Signer panel.

**Root cause.** The profile set is read once at boot. If you edited `appsettings.Production.json` after
the service started, the page sees the pre-edit set of profiles.

**Fix.** Restart the service. Watch the banner — the new LacunaSigner profile should appear in the
**Signing profiles** panel.

### Transient-error counter climbs but no jobs fail

**Symptom.** `bulksigner_signer_api_errors_total{op="poll"}` increases but jobs stay in
`AwaitingSigner`.

**Cause.** This is expected for a brief outage. The per-document failure counter is in-memory and
budgeted by `Signer:MaxConsecutiveApiFailures` (default 5). A successful poll resets the counter. Once
a single document's counter exceeds the budget, that job is failed with `signer.unreachable` and
leaves `AwaitingSigner`. Other rows are unaffected.

**Fix.** If the upstream outage is sustained, fix that first. A restart resets the in-memory counters;
jobs already failed are not auto-retried (the operator drives retry).

## Network / HTTPS

### `https redirect = on` in a service install — clients can't reach the API

**Symptom.** The ready-summary banner shows `https redirect = on`, the install is behind a reverse
proxy terminating TLS, and clients now get `308 → https://localhost:8080/...`.

**Root cause.** `Hosting:RequireHttps = true` is set somewhere, and the service is listening on plain
HTTP, so the redirect target points at a port that does not serve HTTPS.

**Fix.** Set `Hosting:RequireHttps = false` (the service default), or configure a Kestrel certificate
and listen on HTTPS in-process.

### Port 8080 conflict

**Symptom.** Bootstrap fails with `Failed to bind to address http://0.0.0.0:8080: address already in
use`.

**Root cause.** Another service is already bound to port 8080.

**Fix.** Change `ASPNETCORE_URLS` to a free port (e.g. `http://0.0.0.0:18080`). Per-target:

| Target | Where |
|--------|-------|
| Linux | Add `ASPNETCORE_URLS=http://0.0.0.0:18080` to `/etc/bulksigner/bulksigner.env`. |
| Windows | `[Environment]::SetEnvironmentVariable("ASPNETCORE_URLS", "http://0.0.0.0:18080", "Machine")` and restart. |
| Docker | Edit the `ports:` line in `deploy/docker/docker-compose.yml`. |

## Database

### SQLite "database is locked"

**Symptom.** Sporadic errors mentioning "database is locked".

**Possible causes:**

- An external process (e.g. a SQLite GUI tool) has the DB open and is holding a write lock.
- The filesystem does not support locking (some network mounts).

**Fix.** Close the external tool. Avoid network-mounted SQLite — keep the DB on local disk.

### DB grew too large

**Symptom.** `db/bulksigner.db` is several gigabytes.

**Diagnosis.** Check the history and job row counts. There is no automatic retention (see
[Retention](retention.md)).

**Fix.** Manually archive the DB: stop the service, move `db/bulksigner.db` to
`db/bulksigner-archive-YYYYMM.db`, start the service. A fresh DB is initialized; the archive is
read-only. Open the archive in a SQLite client for historical queries.

## Docker-specific

### `docker compose ps` shows `(unhealthy)`

**Symptom.** Container is running but reports `(unhealthy)`.

**Diagnosis.** `docker compose exec bulksigner curl -v http://localhost:8080/api/health` from inside
the container. The base image ships `curl`; the `HEALTHCHECK` line in the Dockerfile is the
authoritative version of the check command.

### `chown -R 1654:1654` fails / file ownership mismatch

**Symptom.** Container logs show permission-denied on `data/` or `logs/`.

**Root cause.** The image runs as UID 1654. On Linux hosts bind-mounting `./data` and `./logs`, those
directories must be owned by UID 1654.

**Fix.** Before first start: `sudo chown -R 1654:1654 ./data ./logs`.

## Windows-specific

### Service won't start with no Application Log entry

**Symptom.** `Start-Service LacunaBulkSigner` fails; Event Viewer shows nothing useful.

**Diagnosis steps:**

1. Run the binary in console mode from the install location:
   `cd "C:\Program Files\Lacuna\BulkSigner"; .\Lacuna.BulkSigner.exe`. Bootstrap exceptions surface
   immediately.
2. Look at `C:\ProgramData\Lacuna\BulkSigner\logs\bulksigner-*.log`.
3. The Application log carries service-level events only; app-level events are in the file sink.

### Service starts but the log file is empty

**Symptom.** `Get-Service` shows Started; the dashboard works; but `bulksigner-yyyyMMdd.log` is empty.

**Root cause.** The service virtual account cannot write to
`C:\ProgramData\Lacuna\BulkSigner\logs\`. The install script grants Modify, but a tampered ACL or
third-party security software may have undone it.

**Fix:**

```powershell
icacls "C:\ProgramData\Lacuna\BulkSigner" /grant "NT SERVICE\LacunaBulkSigner:(OI)(CI)M" /T
```

## Linux-specific

### `systemctl status bulksigner` shows `active (running)` but `/api/health` returns nothing

**Symptom.** The unit is active but no HTTP responses come back.

**Diagnosis.** `journalctl -u bulksigner -f` and look for the `Service ready` banner. If the banner
never appeared, the bootstrap is hanging on something. The `Type=notify` unit will not flip to active
until the bootstrap completes, so if you see `active (running)` the bootstrap finished — check
`ASPNETCORE_URLS` is set correctly in `bulksigner.env`.

### The service is in a `failed` state after a host reboot

**Symptom.** After a host reboot, `systemctl status bulksigner` is `failed`.

**Diagnosis.** `journalctl -u bulksigner -b` (since this boot). Common causes:

- A required env var was not loaded — the `EnvironmentFile` is optional (leading `-`), so the unit
  starts without it, and the validator then fails.
- The PKCS#11 token was not connected at boot. Reconnect and `sudo systemctl restart bulksigner`.

## Console output

### Foreground run shows an empty / mostly blank terminal

**Symptom.** A foreground run shows the boot banner and Service-ready summary, then the terminal seems
silent — no per-job log lines, no streaming output.

**Likely cause.** This is the intended behavior of the
[Console dashboard](dashboard.md#console-dashboard-foreground-runs-only): on an interactive terminal it
suppresses the streaming console output and renders a live panel that redraws in place.

**Diagnosis.**

1. Resize / scroll back in the terminal — the live panel may be a few rows below the visible area.
2. Check `data/logs/bulksigner-*.log` (or your configured `Logging:File:Path`) — the file sink is
   always active and captures everything.
3. Verify the terminal supports cursor positioning. Modern terminals work; legacy `conhost.exe` and
   some restricted SSH clients fall back to scrolling output.
4. To opt out and get the streaming log view back, set `Console:Dashboard:Enabled = false` and
   restart.

### Service-mode deployments aren't getting any stdout

**Symptom.** `journalctl -u bulksigner` or `docker logs <container>` shows the bootstrap banner but no
further events.

**Likely cause.** The live dashboard activation predicate should refuse to activate on a service host.
If you suspect it is misfiring on your host, force-disable it: set `Console:Dashboard:Enabled = false`
in `appsettings.Production.json` and restart. The streaming console output will resume.

## Last-resort diagnosis

When the above doesn't help:

1. **Increase log verbosity.** Set `Logging:File:MinimumLevel = "Debug"` (or `Verbose`) and restart.
   Reproduce. Read the file log.
2. **Read the bootstrap banner.** It tells you which step was misconfigured (license fingerprint vs.
   cert source vs. encryption).
3. **Bisect by environment.** Run the same binary in the foreground in `Development` mode — the
   terminal shows full exception detail (the Production error envelope strips it).
4. **Inspect the database.** `sqlite3 db/bulksigner.db` and queries like
   `SELECT * FROM Jobs ORDER BY CreatedAt DESC LIMIT 20;` give a full picture of recent activity.

If after all that the symptom remains unexplained, contact Lacuna Software support with the bootstrap
banner, the relevant log excerpts (the application redacts secrets, but verify before sending), and
the exact reproduction steps.

---

**Previous:** [Retention](retention.md). **Back to:** [overview](index.md).
