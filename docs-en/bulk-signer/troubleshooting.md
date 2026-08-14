---
sidebar_label: "Troubleshooting"
sidebar_position: 16
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

### `Signing:PkiSdkLicense is required`

**Symptom.** The bootstrap throws a validation exception complaining about `Signing:PkiSdkLicense`.

**Root cause.** Neither `Signing__PkiSdkLicense` (env) nor `Signing:PkiSdkLicense` (config) carries a non-empty
value.

**Fix.** Set the env var on the install target:

| Target | Command |
|--------|---------|
| Linux | Add `Signing__PkiSdkLicense=<base64>` to `/etc/bulksigner/bulksigner.env`, then `sudo systemctl restart bulksigner`. |
| Windows | `[Environment]::SetEnvironmentVariable("Signing__PkiSdkLicense", "<base64>", "Machine"); Restart-Service LacunaBulkSigner` |
| Docker | Add `Signing__PkiSdkLicense=<base64>` to `deploy/docker/.env`, then `docker compose up -d`. |

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

**Fix.** Switch the source. For Linux / Docker, use `Pfx`, `Pkcs11`, or `AzureKeyVault`.

### `AzureKeyVault:Endpoint must be an absolute https:// URL`

**Symptom.** Bootstrap fails validating the Azure Key Vault block.

**Root cause.** `Signing:Certificate:AzureKeyVault:Endpoint` was given a bare DNS name
(`my-vault.vault.azure.net`) or an `http://` URL. The connector needs the full vault URL, and a bare
name would otherwise fail deep inside the Azure client with a far less helpful message.

**Fix.** Use the vault URL exactly as the Azure portal shows it, e.g.
`https://my-vault.vault.azure.net/`.

### `Certificate '<path>' does not match Azure Key Vault key '<name>'`

**Symptom.** Bootstrap fails reporting that the `.cer`'s public key differs from the vault key's.

**Root cause.** `CerPath` and `KeyName` refer to different key pairs. Usually the certificate was
renewed against a **new** vault key while `KeyName` still points at the old one, or `CerPath` was left
pointing at an unrelated certificate after a config edit.

This check exists because the alternative is worse: without it the service starts happily and
produces signatures that no verifier accepts, and the failure surfaces only per job — and only for
profiles with `Verify = true`.

**Fix.** Confirm which side is stale by comparing the two public keys directly:

```bash
openssl x509 -in signer.cer -noout -pubkey
az keyvault key download --vault-name my-vault --name bulk-signer-signing-key --encoding PEM --file -
```

The two PEM blocks must be byte-identical. Then update whichever side is wrong.

### Azure Key Vault authentication or authorization failure at startup

**Symptom.** Bootstrap fails while loading the certificate, with an Azure error such as
`AADSTS7000215` (invalid client secret), `AADSTS700016` (application not found), or a `Forbidden` on
the key operation.

**Possible causes.**

- **Expired client secret.** Entra ID secrets have a finite lifetime; expiry looks like a sudden boot
  failure after a restart that previously worked. Rotate in Azure and update
  `Signing__Certificate__AzureKeyVault__AppSecret`.
- **Wrong `AppId`,** or the app registration lives in a different tenant than the vault.
- **Missing key permissions.** The app registration needs *get* on the key plus the *sign*
  cryptographic operation — the built-in **Key Vault Crypto User** role on an RBAC vault. A
  `Forbidden` with otherwise valid credentials points here.
- **No network path.** The host must reach `*.vault.azure.net` and `login.microsoftonline.com`. Check
  egress rules and proxy configuration.

Failures are reported per profile and aggregated, so a multi-profile deployment sees every
misconfigured profile in one boot error rather than one per restart.

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
| `database` | Under `Sqlite`: is the path under `Storage:Root` writable by the service account? Under `SqlServer`: is the server reachable, and did the boot probe answer? The check's detail names the store it checked. |
| `input-folder:<name>` | Does the folder exist? Is the service account allowed to enumerate it? Strict semantics — any missing or `Stopped` folder fails the whole response. |
| `storage-share:<account>/<share>` | Remote work share only. Credential, network reach, or the role assignment's scope string — see [Security](security.md#azure-files-storage-credentials). |
| `work-share-owner` | Remote work share only. Another instance held the marker at startup, or the claim could not be made. See below. |
| `license` | Was the PKI license loaded? The fingerprint is in the ready-summary banner; missing means the license string was rejected at boot. |

### Startup fails with `Signing:Profiles[N].Approval …`

**Symptom.** The host refuses to start with a message naming an approval key.

**Root causes**, all refused before the first job runs:

| Message names | Fix |
|---------------|-----|
| `Approval` without `CheckCNAB240` | Add `"CheckCNAB240": true` to the same profile. An approver who cannot be shown the amount is not approving anything meaningful. |
| An empty `Approvers` pool | The pool is required and non-empty when `Approval` is present. |
| `MinimumApprovers` below 1 or larger than the pool | A quorum bigger than the pool can never be reached, so every job would park forever. |
| A malformed email, or the same email twice | One human in two pool slots could satisfy a quorum of two alone. |
| A CPF whose check digits do not match | A typo names a different legal person, and the resulting audit row looks exactly as authoritative as a correct one. |
| A non-positive `ExpiresAfter` | Use the `d.hh:mm:ss` form, e.g. `"2.00:00:00"`. |

### Startup warns `has an approval wait budget of …`, or a parked job's deadline is weeks away

**Symptom.** The banner warns about a long wait budget, or a job's decide-by deadline is much further
out than intended.

**Root cause.** The TimeSpan spelling. A three-component value is `hh:mm:ss` only while the first
number is 23 or less; at 24 and above .NET reads it as **days**, so `"48:00:00"` is forty-eight *days*.

**Fix.** Write the days component: `"2.00:00:00"`. Boot is the only moment this is catchable — every
other surface shows the deadline once a job has already parked under it, and the budget is frozen onto
those jobs. Cancel and re-run anything already parked under the wrong window.

### Startup is refused because both a path and a blob are configured

**Symptom.** Boot fails saying `Path`/`CerPath` and `Blob` are mutually exclusive — or that neither is
set.

**Fix.** Exactly one of the two. See [Certificates](certificates.md#reading-the-file-from-a-blob).

### Startup fails with an Azure Files configuration message

**Symptom.** Boot fails naming a `Storage:AzureFiles` or `Storage:Inputs[N]` key.

**Root causes.** An unrecognised provider or credential mode; a partial credential block for the chosen
mode; an NFS share (SMB only); an `azurefiles://` path in `Storage:Root`, `Logging:File:Path` or — under
`Database:Provider = Sqlite` — `ConnectionStrings:Default`; a backslash in a remote folder's `Path`;
`Directory` written on an input folder; an `AzureFiles` folder that resolves to no poll interval; or an
input folder whose path collides with one of the work roots (`output`, or `prod/output` under a
`Directory` prefix).

That last one is refused because it would otherwise delete one signed artifact per iteration while
reporting every job `Completed`.

### The share probe reports a share as unreachable at startup

**Symptom.** The banner reads `azure shares = 1 of 2 reachable`, `/api/ready` is red on a
`storage-share:` row, and the host started anyway.

**Root cause.** Credential, network reach, or role scope. The most common is the **scope string**: an
assignment built with the management-plane spelling `shares` instead of the data-plane `fileshares`
binds without complaint and grants nothing, then fails as `AuthorizationPermissionMismatch`.

**Fix.** Compare the scope string before rotating anything, and confirm the identity holds
`Storage File Data Privileged Contributor` — a read-only role is **not** enough even for an input
folder. The host coming up degraded rather than refusing to start is deliberate: a share down at 03:00
must not turn a restart into a service that will not start.

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

### Startup fails with `Auth:EntraId:… is required when the Auth:EntraId section is present`

**Root cause.** The section is **presence-gated** — writing it makes all three keys required. "Present
but empty" does not mean *off*.

**Fix.** Supply the missing key, or remove the whole `Auth:EntraId` section to go back to API-key
sign-in.

### Entra sign-in fails at Microsoft with `AADSTS50011` (redirect URI mismatch)

**Root cause.** The app registration's redirect URI does not match the host's callback.

**Fix.** Register a **Web** redirect URI of exactly `https://<your-host>/signin-oidc` — scheme, host,
port and path all have to match what the browser actually reaches.

### Entra sign-in succeeds but lands on `/access-denied`

**Root cause.** The account authenticated but carries **neither app role**. The app enforces role
presence regardless of tenant configuration.

**Fix.** Assign `Administrator` or `Approver` (or both) in the enterprise application. The role values
in the manifest must match those strings exactly. There is no security-group mapping, deliberately.

### An Entra `Approver` signs in but the portal is empty

**Root cause.** The role opens the door; the **frozen pool** still decides which jobs the person sees,
matched by the email their directory asserts. Their address is in no pool.

**Fix.** Compare the address in the profile's `Approvers` list against the account's mail attribute.
For **guest accounts**, make sure the mail attribute carries the business address configured in the
pool — the mangled `#EXT#` UPN is deliberately not used as a fallback. An account whose token carries
no email claim at all is refused outright with a page that says so.

### After enabling the Entra mode, operators are logged out and `/api/auth/login` stops working

**Not a fault.** Turning the mode on retires every API-key-minted browser session at once, and a POST
to `/api/auth/login` issues no cookie even for a correct key — off, not hidden. Plan the cutover as a
sign-everyone-out. REST clients using `X-API-Key` are unaffected.

### Signing out and back in happens instantly, without a password prompt

**Not a fault.** Sign-out is local-only: it clears Bulk Signer's session and deliberately does not end
the person's Microsoft session. That is normal SSO behaviour.

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

### Azure Key Vault jobs fail with throttling (HTTP 429) or transient network errors

**Symptom.** With `Source = AzureKeyVault`, jobs **fail rather than hang**, carrying an Azure error —
HTTP 429 (`Too many requests`), a timeout, or a name-resolution failure. Often correlated with a burst
of ingested files.

**Root cause.** Every signature is a remote Key Vault call, so throughput is bounded by the vault's
request limits rather than by local CPU. A high `Pipeline:MaxConcurrency` plus a large batch can
exceed those limits. A vault outage or lost egress produces the same shape.

**Fix.**

- Lower `Pipeline:MaxConcurrency` (start around 4–8) and re-measure. Unlike the PKCS#11 case there is
  no *correctness* reason to drop to `1` — this is a rate limit, not a session conflict.
- Retry the affected jobs once the vault is reachable. Throttling and outages are transient and the
  input files are untouched; retry is manual by design (see [Operations](operations.md)).
- Confirm egress to `*.vault.azure.net` and `login.microsoftonline.com` is stable, including any proxy.
- If sustained throughput is the goal, check the vault's documented transaction limits for the key
  type in use — RSA operations have lower ceilings than EC.

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

### A CNAB240 job fails with `cnab240.invalid`

**Symptom.** The job never reached a signer; the timeline lists the structural violations.

**Root cause.** The file routed through a `CheckCNAB240` profile is not a compliant Banco do Brasil
remessa — wrong record length, records out of order, a bank code other than `001`, an unrecognised
segment, a mismatched trailer count, or a **retorno** (`Código Remessa / Retorno = '2'`) dropped into a
watched folder by mistake.

**Fix.** Correct the file at the originating system and re-run it through Upload, Retry or Rescan. The
violation list on the timeline is capped, and says so when truncated. See
[CNAB240](cnab240.md#when-a-file-is-refused).

### A CNAB240 job fails with `cnab240.payment-date-passed`

**Symptom.** A structurally valid remessa is refused just before signing.

**Root cause.** The file's **earliest** payment date is in the past. BB would either refuse it or
process it on a date nobody intended, and a signature would make the wrong date look deliberate.

**Fix.** Re-export from the originating system with current dates. **Retrying the same file fails the
same way** — the dates inside it have not changed.

:::tip Check the host timezone first
"Today" is the host's local date. On a host running in UTC while the payer sits in
`America/Sao_Paulo`, the boundary rolls over three hours early and a file due today starts being
refused at 21:00 local. Set `TZ=America/Sao_Paulo` on the container or systemd unit.
:::

### A job sits in `AwaitingApproval` and nothing happens

**Not a fault by itself** — the job is waiting on a person, and it will wait indefinitely unless the
profile sets `Approval.ExpiresAfter`. Things to check:

- **Did the link reach anybody?** The product sends no mail. The approval link is on the job page while
  the job is parked; the durable per-approver links are on the System page.
- **Is the pool right?** The job page shows the pool **frozen at park time**, not the one in your
  configuration file. If the people listed are wrong, cancel the job, fix the profile, and re-run the
  file — editing configuration never changes what a parked job requires.
- **Watch `bulksigner_approvals_expired_total`.** A climbing expiry rate is the signal that links are
  not reaching people.

### An approver gets "That address is not in this job's approver pool"

**Root cause.** Their address is not in the **frozen** pool. Leading/trailing spaces and capitalisation
do not matter; anything else does.

**Fix.** Compare against the pool shown on the job page. The refusal is deliberately coarse — a
malformed address returns the same code — so somebody who guessed a job id learns nothing about who the
approvers are.

### A released job failed with `approval.content-changed`

**Symptom.** The quorum was met, the job returned to `Queued`, and it then failed instead of signing.

**Root cause.** The staged copy in `processing/<jobid>/` was modified after the approvers saw it. The
pre-sign hash check refused to produce a signature over bytes nobody approved.

**Fix.** Do **not** re-sign it. Find out what wrote to `processing/`, then re-run the original file
from `input/` so it is parsed, totalled and approved afresh. This counter should be flat at zero
forever; anything else is worth investigating rather than retrying past.

### A job failed with `approval.rejected` instead of being cancelled

**Root cause.** The rejection landed after a worker had already claimed the job, so the pipeline
refused the signature rather than the approval handler cancelling it. `Processing` has no legal
transition to `Canceled`.

**Not a fault.** The file is unsigned, which is the property that matters. Correct and re-submit.

### A job was canceled with "Approval window expired."

**Root cause.** Nobody decided inside the profile's `ExpiresAfter` window.

**Fix.** The staged copy is under `error/<jobid>/`, the original is still in `input/`, and any
approvals that *were* recorded are still on the job page. Retry does not apply (it accepts only
`Failed`) — re-run the file through Rescan or Upload, which creates a new job that parks and asks the
pool again.

A **pause does not extend the window**: the budget is a wall-clock deadline, not a budget of pipeline
uptime, so a pipeline paused across a window expires the jobs whose windows closed during the pause.

### A job completed but its input file is still in `input/`

**Not a fault.** The file was rewritten while the job held it, so the pipeline refused to delete
something it could not show was the file it processed. Look for `job.input-diverged` on the job's
timeline. The rewritten file is handed back to its watched folder and signed as a job of its own.

Two cases where the hand-back is dropped and the console says so: a REST upload (no watcher owns its
path), and a folder whose watcher is not running. See
[Operations](operations.md#when-an-input-file-changes-mid-job).

### A file under `processing/` or `error/` cannot be written or deleted

**Root cause.** On an Azure Files work share, a live job's staged copy carries an infinite lease that
refuses writes and deletes from everything, including your own storage tooling. That is the point while
the job is in flight.

**Fix.** If the job is terminal and the lease is still held, that is a fault — restart the service,
which releases leases it holds, and report it.

### `/api/ready` is 503 with `work-share-owner` red

**Root cause.** Another instance held the work share's marker at startup. The banner, the log, the
System page and this check all name the prior holder's **host and process id**.

**Fix.** Ask whether that host and process are still running.

- **This host, and the process is gone** — your previous instance did not shut down gracefully. Nothing
  is wrong now. The row stays red for the life of this instance and clears on the next boot after a
  graceful stop; the marker is claimed once and nothing re-reads it, so there is no fresher answer to
  be had.
- **A different host, or that process is alive** — you have two instances on one work share, which is
  not supported. Stop one, then decide which store is authoritative. **Approval state is the one to act
  on quickly**: a parked job exists in one instance's store only.

If the row instead reads `not claimed cleanly at startup: …`, the marker could not be reached at all —
an unreachable share or a rotated credential. Whether another instance holds it is then simply unknown,
and unknown is not reported as the reassuring answer. The share's own `storage-share:` row usually says
why.

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

### The dashboard freezes while a batch signs (SQL Server)

**Symptom.** The dashboard hangs, or pages take tens of seconds, but only while the pipeline is
working. No job fails.

**Root cause.** `READ_COMMITTED_SNAPSHOT` is **off** on the database. Without it, the dashboard's reads
take shared locks and block behind the pipeline's writes. Azure SQL enables it by default; on-premises
SQL Server does not.

**Fix.** The banner says so at boot (`store isolation = READ_COMMITTED_SNAPSHOT off …`) and warns on
the ops console. Bulk Signer reports it and **never issues the statement that changes it** — that needs
exclusive access to a database that is yours:

```sql
ALTER DATABASE [BulkSigner] SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
```

`WITH ROLLBACK IMMEDIATE` terminates other connections, so stop the service first. Then restart it and
confirm the banner no longer reports the row — when it is on, nothing is reported.

### The store row says `UNREACHABLE` and the service started anyway

**Not a fault.** A database down during a maintenance window must not turn a restart into an outage, so
the host comes up, the migration is **skipped**, and `/api/ready` stays red.

**Fix.** Fix the store, then **restart**. The readiness verdict is taken per request, but it also stays
red for the life of an instance whose boot skipped the migration — that clears on the next boot, not
when the store comes back.

Common causes: the database does not exist (Bulk Signer creates its *tables*, not its database); the
login is not mapped to a user in it; TLS the client will not accept (`Encrypt` defaults to `True`, so
an untrusted server certificate fails the login with *certificate chain … not trusted*); or, on Azure
SQL from inside Azure, only TCP 1433 opened when the `Redirect` connection policy also needs TCP
11000–11999.

### The service refuses to start with `Database migration failed`

**Root cause.** A migration could not be applied. Most often the login lacks `db_ddladmin`, which is
needed on the first boot and on any boot after an upgrade that ships a migration.

**Fix.** Grant the role and restart. This failure is fatal by design — running against a schema the
code does not match is worse than not starting.

### A job or a page fails once and then works (SQL Server)

**Not a fault.** Transient-fault retry is on under `SqlServer` with EF Core's defaults — the initial
attempt plus up to six retries against the error numbers the SQL client classifies as transient, each
delay capped at 30 seconds. It is on because running against Azure SQL effectively requires it, and
there is deliberately no configuration key: a retry budget an operator can tune is a retry budget that
gets tuned to zero during an incident.

If retries are exhausting, look at the network path rather than the budget.

### Startup is refused because the connection string does not match the provider

**Root cause.** One of two refusals, and which one depends on `Database:Provider`:

- Under `SqlServer`, a data source naming a **file** rather than a server — what a deployment that
  flipped the provider and left the SQLite path behind produces. Without the refusal it would arrive as
  a login failure against a server named after a path.
- Under `Sqlite`, a connection string naming an Azure Files location — a database file reached over SMB
  is the documented way to corrupt one.

Also under `SqlServer`: an **absent** connection string is refused rather than guessed at. No refusal
ever echoes the string, because it may carry a password; only the data source is quoted.

:::warning The environment variable replaces the whole value
`ConnectionStrings:Default` is a single key, so there is no way to keep the server in
`appsettings.Production.json` and supply only the password from the environment. A JSON value left in
place alongside the environment variable is silently ignored rather than combined with it.
:::

### After switching to SQL Server, every job and approval is gone

**Not recoverable from the new store — and not a fault.** There is no importer and no boot-time check
for a SQLite file left behind, so the new store comes up with an empty schema: no jobs, no history, no
operational events, and **no approval snapshots and no recorded approvals**.

**Fix.** The old `db/bulksigner.db` is still on disk unless something removed it. Archive it and keep a
SQLite client to hand for the day somebody asks who approved a payment file from before the move. See
[Installation](installation.md#switching-from-sqlite--archive-the-old-file-first) for the order to do
this in next time.

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
