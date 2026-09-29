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

:::warning Changed in 2.1.0 — a certificate that will not open no longer stops the host
Signing profiles live in the operational store, and the place a broken certificate is fixed is the
profile's own page on the dashboard. A host that refused to start could not serve that page, so a
profile whose certificate cannot be opened — a missing file, a wrong password, a thumbprint that matches
nothing, an unreachable or unauthorised Key Vault, an unreadable blob — is now reported as **`DEGRADED`**
and the host starts. That profile alone cannot sign; its jobs fail with `profile.degraded` (see
[A job fails with `profile.degraded`](#a-job-fails-with-profiledegraded)) and every other profile keeps
working.

What still refuses the boot is configuration *validation*: the rules below that are checked against the
configuration file or environment — the PKI licence, the `Blob` block's shape, a PKCS#11 PIN written into
a file, a Windows store source on a non-Windows host, and the checks on a `Signing:Profiles[]` section
that is being imported on a first boot. The same rules refuse a save on the profile's page.
:::

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

### `Signing:TrustLacunaTestRoot is true while the environment is 'Production'`

**Symptom.** Boot refused with that sentence, ending "unset the key, or run the homologation host as
Staging (ASPNETCORE_ENVIRONMENT=Staging)".

**Root cause.** The host was told to trust the Lacuna **test** PKI root — the issuer of the Turing /
Fermat test certificates (see [Certificates](certificates.md#test-certificates-and-the-trust-set)) — and also calls itself production. The
two are refused together, deliberately: a production host is never trusted with a root that is not a
certification authority. On Azure App Service the environment name defaults to `Production` when nothing
sets it, so a homologation host that copied a production settings block and added the key hits this.

**Fix.** One of two, depending on what the host is:

- A production host: remove `Signing__TrustLacunaTestRoot` (or set it `false`). Real certificates need
  nothing.
- A homologation host: set `ASPNETCORE_ENVIRONMENT=Staging` beside the key. Any name but `Production` is
  accepted; the banner's `environment` and `trust set` rows then say what the host is.

### `Auth:ApiKey is required`

**Symptom.** Bootstrap throws complaining about `Auth:ApiKey`.

**Root cause.** Either no value, or the value is shorter than the 16-character minimum.

**Fix.** Generate a strong key (see [Security](security.md#api-key-rotation)) and set the matching
env var.

:::note After upgrading to 2.3.1 or later
Images before 2.3.1 shipped a placeholder API key inside their own default settings file. A deployment
that never set `Auth:ApiKey` was silently running on that placeholder, and refuses to start after the
upgrade, naming the key. Set `Auth__ApiKey` as every install path documents.
:::

### `Pkcs11 PIN env var <name> is empty`

**Symptom.** The service starts, but the profile is reported `DEGRADED` — on the startup banner, on
`/profiles` and in `/api/ready/details` — with the reason
`PKCS#11 PIN environment variable '<name>' is empty`. Before 2.1.0 this stopped the boot.

**Root cause.** `Signing:Certificate:Source = Pkcs11` but the configured env var is unset or empty.

**Fix.** Set the env var named by `Signing:Certificate:Pkcs11:PinEnvVar` (default
`BULK_SIGNER_PKCS11_PIN`) and restart. See [Certificates](certificates.md#pin-handling).

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

**Symptom.** The startup banner reports the profile as `DEGRADED`, with a reason saying that the
certificate's public key differs from the vault key's, and the profile's jobs fail with
`profile.degraded`. (Before 2.1.0 this stopped the boot.)

**Root cause.** `CerPath` — or `Blob:Url`, when the certificate is read
[from a blob](certificates.md#reading-the-file-from-a-blob) — and `KeyName` refer to different key pairs.
Usually the certificate was renewed against a **new** vault key while `KeyName` still points at the old
one, or the certificate location was left pointing at an unrelated certificate after an edit. The message
names whichever location the profile uses, as `file '<path>'` or `blob '<account>/<container>/<blob>'`.

This check exists because the alternative is worse: without it the profile would sign happily and
produce signatures that no verifier accepts, and the failure would surface only per job — and only for
profiles with `Verify = true`.

**Fix.** Confirm which side is stale by comparing the two public keys directly:

```bash
openssl x509 -in signer.cer -noout -pubkey
az keyvault key download --vault-name my-vault --name bulk-signer-signing-key --encoding PEM --file -
```

The two PEM blocks must be byte-identical. Then update whichever side is wrong — the certificate
location or the key name is corrected on the profile's page with **Edit certificate** — and restart.

### Azure Key Vault authentication or authorization failure at startup

**Symptom.** The startup banner reports the profile as `DEGRADED` while loading its certificate, with an
Azure error such as `AADSTS7000215` (invalid client secret), `AADSTS700016` (application not found), or a
`Forbidden` on the key operation. The host starts; the profile's jobs fail with `profile.degraded`.
(Before 2.1.0 this stopped the boot.)

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

Failures are reported per profile, and every failing profile is named on the same banner, so a
multi-profile deployment sees every misconfigured profile in one boot rather than one per restart. After
correcting the secret or the role assignment, **restart** — a certificate is opened once at startup.

### A signing material blob cannot be read at startup

**Symptom.** The startup banner reports a profile as `DEGRADED`, quoting a blob as
`<account>/<container>/<blob>`. **The host starts.** The profile cannot sign until the blob is readable
and the service is restarted; every other profile is unaffected, and jobs routed to this one fail with
`profile.degraded`.

:::warning Changed in 2.1.0
Before 2.1.0 an unreadable blob stopped the boot. It now degrades the one profile, for the reason given at
the top of this section.
:::

Three distinct messages, because they have three distinct fixes:

| Message | Root cause | Fix |
|---|---|---|
| `… does not exist` | The container or the blob name is wrong. Both are case-sensitive, and the URL is read exactly as written. | Correct `Blob:Url`. Confirm with `az storage blob exists --account-name <a> --container-name <c> --name <b>`. |
| `… credential was refused (HTTP 403)` | The credential authenticated but may not read the blob. | For `ManagedIdentity` / `ServicePrincipal`, grant **Storage Blob Data Reader** on the container or the account — nothing wider is ever needed. For `AccountKey`, the key is wrong or was rotated. |
| `… the <mode> credential could not be obtained` | The credential could not be acquired at all, before any request was made. | `ManagedIdentity`: the host needs a **system-assigned** identity, and a host outside Azure has none. `ServicePrincipal`: check `TenantId` / `AppId` / `AppSecret` — an expired secret reports identically. |

Anything else (a 5xx, a transport fault) is reported with the status the service returned and points at
reachability: the host needs outbound HTTPS to the blob endpoint. The read was already retried three
times with exponential backoff, so a single hiccup does not reach this message.

**Renewal does not fix itself.** The blob is read once, at boot, so replacing its contents requires a
restart exactly as replacing a local file does — and fixing the blob does not un-degrade a running host.

### The customer logo is not showing on the login or approver pages

The service is up and the pages render the product mark alone. This is by design: a configured logo
(`Branding:CustomerLogo`, see [Configuration](configuration.md#branding--the-customers-logo-on-the-sign-in-and-approver-pages)) whose **bytes** could not be used does
not stop the service. Read the reason in any of three places:

- the ready-summary banner's `customer logo` row — `not loaded from file '…': <reason>`;
- the startup log, a Warning reading `Customer logo not loaded from …`;
- the **System** page, an alert at the top of the storage panel.

The reason is one of: the file or blob is missing or cannot be read (check the path, the mount on Docker,
the blob's role assignment); the file is empty or over **256 KiB** (export a smaller one — it is rendered
at most 80 px tall); or the bytes are not what the extension says (a JPEG renamed to `.png`, an HTML page
saved as `.svg` — rename or re-export). Fix it and **restart**: the logo is read once at boot.

If the service did *not* start, the message names `Branding:CustomerLogo:…` and one of the shape rules:
both `Path` and `Blob` set, an extension outside `.png` / `.jpg` / `.jpeg` / `.webp` / `.svg`, or a blob
block missing its `Url` or `Credential`. Those are refused at boot like every other configuration mistake.

### Startup is refused because `Signing:ProfileSecretsKey` is not set

**Symptom.** One of two refusals, and which one tells you where the deployment is:

```
Refusing to start: this deployment's operational store holds signing profile secrets that were
encrypted under Signing:ProfileSecretsKey, and that key is not set. …
```

```
Refusing to start: signing profiles are being imported into the operational store for the first
time, and some of them carry a secret — 'folha', 'nfe' — while Signing:ProfileSecretsKey is not set. …
```

The first is a host that already holds encrypted profile data. The second is the **first boot** after an
upgrade, refusing at the moment the data would come into existence — so the store never comes to hold a
value nothing can open. The second names the profiles.

**Root cause.** Signing profiles are rows in the operational store, and a PKCS#12 password, a Key Vault
application secret, a signing material blob credential and **uploaded PKCS#12 bytes** are encrypted at
rest under a key held *outside* the database. The refusal is the **pair** — data that was encrypted, and
nothing to decrypt it with — never either half alone. A deployment whose profiles carry no secret is never
asked for a key, which is why most installs upgrade without meeting this at all.

**Why this refuses when a bad certificate merely degrades.** The fix here is an environment variable, not
something on a dashboard page, so refusing creates no deadlock — and a missing key would disable every
secret-bearing profile at once, a host that reports itself healthy while unable to sign for anybody.

**Fix.** Set the key and start again:

```bash
Signing__ProfileSecretsKey='<the value the secrets were saved under>'
```

It must be the **same value** the secrets were saved under — see
[A profile is degraded saying a stored secret could not be decrypted](#a-profile-is-degraded-saying-a-stored-secret-could-not-be-decrypted)
if you no longer have it. Keep it out of source control, off the same backup as the database, and
wherever the other irrecoverable secrets live (see [Security](security.md#the-signing-profile-secrets-key-signingprofilesecretskey)).

**If the second refusal names a profile you never declared** — or names yours beside one you did not —
the host is reading a `Signing:Profiles[]` array from a settings file *underneath* yours. Configuration
merges arrays by index and can override a key but never remove one: your `Signing__Profiles__0__*`
settings merge over whatever that file declares at index 0 and inherit every key they did not name, a PFX
password included. Images before 2.3.1 shipped developer sample profiles in their own default settings
file this way. Upgrade the image, or remove the file that declares them. **Do not answer by setting the
key**: the import is one-time and nothing deletes a profile, so that would import the stray profiles
permanently. Nothing was written — the refusal fires before the import — so the next boot imports
cleanly.

**A related warning that is not this refusal.** If the operational store did not answer at startup *and*
the key is unset, the host **starts** and warns that it could not check whether any profile secrets
exist, and that the next boot which reaches the store may refuse. Treat it as a prompt to set the key
before the store comes back.

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

**Root cause.** A readiness probe is failing. The response body lists each probe by name, with `ok`
true or false — DB, input folder, license.

:::warning Changed in 2.6.0 — the detail moved to `/api/ready/details`
The anonymous `/api/ready` now carries only the verdict: `ready`, and each check's `name` and `ok`. The
per-check `detail` — which named the SQL Server host, every input share and a degraded certificate's
location — is on `GET /api/ready/details`, behind the API key (`X-API-Key`) or an operator session, with
the same 200 / 503 rule. A monitor that parsed `detail` off the anonymous route moves to the details route
and adds the header. `Readiness:RequireApiKey = true` puts `/api/ready` itself behind the key too — leave
it off where the prober cannot send the header (the App Service health check cannot).
:::

**If it has already cleared** by the time you look, the durable log has it: every change of a check's
verdict is written once, as `Readiness check <name> went red: <detail>` at Warning and
`Readiness check <name> recovered` at Information. A steady red is written once, not per poll, so search
for the check's name rather than reading the latest lines.

**Fix.** Inspect `/api/ready/details`, then:

| Failed probe | Where to look |
|--------------|---------------|
| `database` | The detail names the store it checked — `SQLite (…)` or `SQL Server (server/database)`. Under `Sqlite`: is the path under `Storage:Root` writable by the service account? Under `SqlServer`: is the server reachable, and does the login still authenticate? When the detail reads `unreachable` with an exception type after the store's name, the durable log carries that exception, message included, at Warning — one line per failed probe, so read the first. |
| `input-folder:<name>` | Does the folder exist? Is the service account allowed to enumerate it? Strict semantics — any missing or `Stopped` folder fails the whole response. |
| `storage-share:<account>/<share>` | Remote work share only. Credential, network reach, or the role assignment's scope string — see [Security](security.md#azure-files-storage-credentials). |
| `work-share-owner` | Remote work share only. Another instance held the marker at startup, or the claim could not be made. See below. |
| `license` | Was the PKI license loaded? The fingerprint is in the ready-summary banner; missing means the license string was rejected at boot. |

Some rows report `ok: false` **without** making the response a 503, deliberately, because a 503 would pull
the instance out of its load balancer while the dashboard needed to fix the problem is served by that very
instance: `signing-profile:<name>` (a degraded profile — see
[A job fails with `profile.degraded`](#a-job-fails-with-profiledegraded)), `profile-input-folder:<name>`
(a profile bound to a folder this host does not configure) and, in cluster mode, `cluster-instance` (a
displaced instance standing down). A `signing-profile-keyless:<name>` row is `ok: true` by design, and an
input folder no profile has chosen is reported green. **Alert on the individual `checks[]` entries, not
only on the top-level `ready` boolean.**

### Startup fails with `Signing:Profiles[N].Approval …`

**Symptom.** The host refuses to start with a message naming an approval key.

**When this can happen.** Since profiles moved into the operational store (2.1.0), `Signing:Profiles[]`
is imported only on the **first boot against an empty profile table**, and these rules are checked then.
After that, the same rules refuse a save of the profile's `Edit approval` form on the dashboard, with the
same wording; editing the configuration file no longer changes a profile at all.

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

**Fix.** Write the days component: `"2.00:00:00"` — in the profile's `Edit approval` form on the
dashboard, since after the first boot the configuration file no longer changes a stored profile. Boot is
the only moment this is flagged — every other surface shows the deadline once a job has already parked
under it, and the budget is frozen onto those jobs. The correction applies to **new** jobs only: cancel and
re-run anything already parked under the wrong window.

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

### A deployment that used to start now refuses, naming a watched input folder

**Symptom.** After upgrading, boot fails naming a `Storage:Inputs[N]` path that collides with one of the
work roots — `output/`, `processing/` or `error/`.

**Diagnosis.** This refusal applies on **every** storage provider, not just Azure Files, and it is a
deliberate change: such a configuration was watching the directory it writes finished artifacts into, so
each signed file was re-ingested, re-signed and then **deleted** as the "original" of the next iteration.
The deployment appeared healthy and reported every job `Completed` throughout.

**Fix.** Point the input folder somewhere outside the work roots. Before editing, **check `output/` against
what recipients actually collected** — the refusal tells you the configuration was wrong, not how long it
had been destroying artifacts.

### A file is refused with `job.path-too-long`

**Symptom.** An upload or a watched file is rejected, naming a path length limit of 850 characters.

**Diagnosis.** The job's original path is recorded in the operational store, and a path past that bound
cannot be. It is now refused **when the file is taken in** rather than accepted and failed later, on every
database provider, so the failure arrives at the caller that can still do something about it.

**Fix.** Shorten the directory nesting or the file name. Deeply nested date-partitioned trees under an
Azure Files `Directory` prefix are the usual cause, since the prefix counts toward the total.

### The share probe reports a share as unreachable at startup

**Symptom.** The banner reads `azure shares = 1 of 2 reachable`, `/api/ready` is red on a
`storage-share:` row (whose detail, on `/api/ready/details`, is the storage service's own sentence), and
the host started anyway.

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

### An Entra operator's audit events say `(anonymous)`, and so does the user menu

**Symptom.** A signed-in `Administrator` creates or edits a profile, pauses the pipeline or runs a backup,
and the operational event names `(anonymous)`. The user menu reads *Signed in as (anonymous)*, and a
manual backup run on the Backup page reads *manual · (anonymous)*.

**Root cause.** Since 2.2.1 the operator's recorded name is the token's `preferred_username` claim (the
UPN), and the session this operator holds was not named by it. Before 2.2.1 every Entra operator's events
read this way regardless of the token, and **those rows cannot be repaired** — only events written by a
session signed in after the upgrade carry the actor.

**Possible causes, in order of likelihood:**

- **A session that predates the upgrade.** The name lives in the session cookie, and the cookie slides for
  eight hours, so an operator who stayed signed in across the upgrade keeps the old session. **Sign out
  and back in once.** No log line accompanies this case.
- **The token carried no `preferred_username`.** Bulk Signer always requests the `profile` scope, which
  carries the claim, so the tenant withheld it — user consent to `profile` refused or restricted, or a
  token customisation on the app registration. This case is announced: the sign-in writes a warning to the
  log naming the claim types it did receive (never their values), so search the log for
  `preferred_username`. A guest `Administrator` is recorded under the `#EXT#` form of the UPN, which is
  correct.
- **The host predates 2.2.1.** Upgrade; then sign out and back in.

The display name is deliberately not used as a fallback, so the events stay `(anonymous)` rather than
being recorded under a name two people may share.

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
the person's Microsoft session. That is normal SSO behaviour. Since 2.2.1 signing out does end an
approver's second-factor verification window, so a colleague's silent re-sign-in on a shared workstation
is asked for the code again.

## Signing fails

### A job fails with `profile.degraded`

**Symptom.** Jobs go `Queued → Failed` with the error `profile.degraded`. The job history says the
profile is degraded and quotes the reason. Jobs on other profiles keep completing normally. The startup
banner reported the same profile as `DEGRADED`, and `/api/ready` carries a `signing-profile:<name>` row
with `ok: false` — the reason is on `/api/ready/details`, with the API key.

**Root cause.** That profile's certificate could not be opened when the host started — a missing PKCS#12
file, a wrong password, a thumbprint that matches nothing on the token or in the store, an unreachable Key
Vault, or an unreadable signing material blob. The reason names which. Three wordings worth knowing:

- **A wrong PKCS#12 password** reads *did not open with the PKCS#12 password given — check the PKCS#12
  password on the profile, and if it is right, supply the file again*, followed by the PKI SDK's own
  sentence, which speaks of an incorrect **PIN**: the SDK uses one word for a PKCS#12 password and a token
  PIN, and the profile has no PIN to correct. The second half is there because the check behind it is the
  file's integrity tag, which a damaged file fails with the right password just the same.
- **A PKCS#12 with the modern envelope** reads *is encrypted with PBES2, which the signing library does
  not open*. The signing library opens the classic envelope only, and both OpenSSL 3 by default and a
  Windows export set to AES256-SHA256 write PBES2 / AES-256. On Windows, re-export from the certificate
  store with the TripleDES-SHA1 option. From the `.pfx` you have, re-export through OpenSSL and supply the
  new file:

  ```bash
  openssl pkcs12 -in modern.pfx -nodes -passin pass:<password> -out tmp.pem
  openssl pkcs12 -export -legacy -in tmp.pem -passout pass:<password> -out signing.pfx
  shred -u tmp.pem   # the private key is in clear in tmp.pem
  ```

  (`-legacy` needs OpenSSL 3's legacy provider; on a build without it,
  `-keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES` produces a classic envelope the library also opens.) The
  same sentence comes back on a wrong password too, deliberately — the envelope is the blocker whatever the
  password is.
- **An empty file, blob or upload** is refused before anything decodes it, as
  *Certificate file '…' is empty (0 bytes)* naming the location — usually a placeholder created while
  waiting for the real file, or a copy that never finished.

**This is not a bad file.** `profile.degraded` and `cnab240.invalid` are the two failures most easily
confused, and the remedies have nothing in common: a degraded profile means every file routed to it will
fail until the deployment is fixed, whereas a refused file means that one file needs re-exporting.
Retrying the job before fixing the certificate fails identically.

**Nor is it a keyless profile.** A profile whose approval rule has the **approvers** sign
(`Approval.Signers = Approvers`) holds no certificate of its own by design: the banner prefixes its row
`KEYLESS` rather than `DEGRADED`, `/api/ready` reports it on a `signing-profile-keyless:<name>` row with
`ok: true`, and no job on it fails with `profile.degraded`. What fails there by name is a missing approver
signature envelope (`approval.signatures-missing`) or a frozen signer set the pipeline cannot honour
(`approval.signer-set-unsupported`). One more code belongs to this case: a job that parked **before** the
rule moved to `Approvers` was frozen onto the profile key, and on an instance that booted after the move —
and so never opened a key — it fails with `profile.key-unavailable`. Moving the rule back to a keyed set
and restarting is a remedy; so is a retry on an instance that still holds the key.

**Fix.**

1. Read the reason. It is on the startup banner, in the log at `Critical`, on
   `/api/ready/details`, on the profile's own page at `/profiles/<name>`, and in the failed job's
   history — all five say the same thing.
2. Fix the certificate. If the coordinates are wrong — a mistyped path, a thumbprint that matches
   nothing, the wrong vault — correct them on that page with **Edit certificate**; the save stores them
   and marks the profile as waiting for a restart. If the coordinates are right and the material is not,
   the failure modes are the ordinary ones: see
   [Boot succeeds but every job fails with "Certificate not found by thumbprint"](#boot-succeeds-but-every-job-fails-with-certificate-not-found-by-thumbprint),
   [Azure Key Vault authentication or authorization failure at startup](#azure-key-vault-authentication-or-authorization-failure-at-startup)
   and [A signing material blob cannot be read at startup](#a-signing-material-blob-cannot-be-read-at-startup).
3. **Restart the service.** A certificate is opened once at startup and never reloaded, so neither fixing
   the file nor saving new coordinates changes anything underneath a running host — the marker on the
   profile says exactly that.
4. Retry the failed jobs, or drop the files back into their watched folder. Their inputs were left in
   place: nothing was signed, so nothing earned the right to delete them.

**Not a reason to take the instance out of service.** The `/api/ready` row reports `ok: false` but does
**not** make the response a 503 — see
[Service starts but `/api/ready` 503s persistently](#service-starts-but-apiready-503s-persistently).

### A profile is degraded saying a stored secret could not be decrypted

**Symptom.** The startup banner reports one or more profiles as `DEGRADED` with a reason naming
`Signing:ProfileSecretsKey` — *"A stored signing profile secret (Pkcs12Password) could not be
decrypted"* — and `/api/ready` carries a `signing-profile:<name>` row with `ok: false`. Jobs routed to
those profiles fail with `profile.degraded`. **The host started**, and every profile that carries no secret
keeps signing normally. On the profile's page the certificate panel shows the coordinates — the path, the
thumbprint, the vault endpoint — and no secret rows at all.

**Root cause.** `Signing:ProfileSecretsKey` is set, but it is not the value those profiles' secrets were
saved under. Four things do it, and they are deliberately indistinguishable — the decryption is
authenticated, so a wrong key and a tampered row look identical:

- the key was **rotated** and the stored material was not re-entered afterwards;
- the operational store was **restored** from, or copied out of, a deployment with a different key;
- the key is **mistyped**, most often via `Signing__ProfileSecretsKey`, where the double underscore is easy
  to get wrong;
- somebody **edited a protected column** directly, or a restore moved bytes between columns.

**This is not the missing-key refusal**
([Startup is refused because `Signing:ProfileSecretsKey` is not set](#startup-is-refused-because-signingprofilesecretskey-is-not-set)).
Here the key *is* set, and setting a different one will not help: the stored values were written under
the old one.

**Fix, if you still have the original key.**

1. Put it back — `Signing__ProfileSecretsKey`, exactly as it was. Check for trailing whitespace and for a
   single underscore where two are needed.
2. **Restart the service.** A certificate is opened once at startup and never reloaded.

**Fix, if the key is lost or was deliberately rotated.** There is no recovery of the values themselves; that
is by construction, not a gap. For each profile the banner named:

1. Open the profile's page on the dashboard and press **Edit certificate**.
2. Type the PKCS#12 password, the Key Vault application secret or the blob credential again, or upload the
   PKCS#12 again. A blank field *keeps* the stored value, which is not what you want here — type it.
3. Save. The profile is marked as waiting for a restart.
4. **Restart the service** once every affected profile has been re-entered.
5. Retry the failed jobs, or drop the files back into their watched folder. Nothing was signed, so the
   inputs are still in `input/`.

A profile with no secret — a passwordless PFX, a PKCS#11 token, a Windows store certificate — is unaffected
and needs nothing done to it.

:::tip Treat key rotation as a scheduled operation
Rotating `Signing:ProfileSecretsKey` invalidates every stored profile secret at once. Rotate by re-entering
each profile's material under the new key *while the old key still works*, and retire the old value only
once nothing is protected under it.
:::

### Lacuna test certificates (Turing / Fermat) are refused

**Symptom.** With Lacuna's test certificates, every job under the profile fails with a chain or trust error,
or every approver's **Sign and approve** is refused as `approval.certificate-invalid` naming an untrusted
root. The banner's `trust set` row reads `production`.

**Root cause.** Not a fault. The published product holds every signature to the ICP-Brasil roots alone; the
Lacuna test root is trusted only under `Signing:TrustLacunaTestRoot = true` (available from 2.3.0). One
trust set applies to the whole host: the profile key at signing time, the verifier afterwards, and an
approver's certificate.

**Fix.** On a homologation host, set `Signing__TrustLacunaTestRoot=true` **and**
`ASPNETCORE_ENVIRONMENT=Staging` — the key alone is refused under the name `Production` (see
[the entry under *Service won't start*](#signingtrustlacunatestroot-is-true-while-the-environment-is-production)).
On anything that signs real documents, use real certificates; the key is not for that.

### Boot succeeds but every job fails with "Certificate not found by thumbprint"

**Symptom.** Every job goes `Queued → Failed`. The error message mentions a thumbprint mismatch. Since
2.1.0 this is caught when the profile's certificate is opened at startup: the banner reports the profile
as `DEGRADED` with the thumbprint in its reason, and its jobs fail with `profile.degraded`.

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

### Pause answers `pipeline.state-missing` (SQL Server)

**Symptom.** On a `Database:Provider = SqlServer` deployment, `POST /api/pipeline/pause` answers
`pipeline.state-missing`, the log carries `PipelineState singleton row is missing` at Critical, and the
pipeline keeps running whatever an operator asks.

**Root cause.** SQL Server stores created before 2.4.3 never received the pipeline-state row that pause
and resume act on. **Fix.** Upgrade to 2.4.3 or later: the row is inserted by a migration applied at the
next boot.

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
  `POST /api/rescan` (or `POST /api/rescan?folder=<name>` for just one folder) after the writer finishes.
- **The folder's watcher is in `Status: Stopped`.** See below.
- **No signing profile has chosen the folder.** Its card shows a grey `unassigned` chip where the
  profile's would be. See [Files sit in a folder whose card says `unassigned`](#files-sit-in-a-folder-whose-card-says-unassigned).
- **The folder's signing profile is disabled.** See
  [Files are refused with `profile.disabled`](#files-are-refused-with-profiledisabled).
- **The file's most recent job ended `Failed` or `Canceled`.** The watcher does not offer such a file
  again on its own (since 2.11.0 for `Failed`: before, a polling folder produced a new `Failed` job every
  tick for as long as the cause stood). Run it again with Retry, Rescan or Upload — this applies to a
  corrected file dropped under the same name, too.
- **The name is already taken by a completed job.** The file does become a job, but one that fails at once —
  see [A file fails at once with `file.already-processed`](#a-file-fails-at-once-with-filealready-processed).
- (Docker) Bind-mount permission issue — the container UID (1654) must be able to read files dropped
  by the host process. `chown -R 1654:1654 ./data` on the host.

### Files sit in a folder whose card says `unassigned`

**Symptom.** Files pile up in a configured folder and no jobs are created. The Input page shows the folder
with a grey chip reading `unassigned — no profile has chosen this folder`; `/api/folders` returns
`profileName: null` and, once the watcher has noticed, `"status": "Unassigned"`; `/api/ready` is **green**
for that folder; a rescan reports the folder as `unassigned: true` with every count at zero; and the log
carries one Warning, `Watched folder '<name>' is unassigned — no signing profile has chosen it`.

**Root cause.** Since 2.2.0 a watched folder is signed under the profile that chose it, one folder per
profile, and none has. Either the first boot's import left it so — the folder named a profile
`Signing:Profiles[]` did not declare, or an earlier folder had already taken the profile it named, and the
startup banner said which — or a profile has since let the folder go from its page, or the profile table
was imported by a version before 2.2.0, which recorded no folder bindings. An unassigned folder does
**not** fall back to `default`.

**Why the folder is not reported as broken.** It is not broken: the storage answers, the watcher is
waiting rather than failed, and a red readiness row would tell an orchestrator to pull an instance for a
folder nobody has asked it to watch yet. The files are where the producer left them and are listed the
moment a profile chooses the folder.

**Fix.** Open a profile on the dashboard's signing-profiles page, click **Edit behaviour**, choose the folder
under **Input folder** and save; or create a profile with the folder chosen. The watcher starts within a
poll interval or two and lists everything sitting there — no restart and no rescan. Editing
`Storage:Inputs[].Profile` does **not** fix it after the first boot: that key is only read by the first
import, and the boot says it is being ignored. See
[Operations](operations.md#routing-a-watched-folder-to-a-signing-profile).

### Files are refused with `profile.disabled`

**Symptom.** Files pile up in a configured folder and no jobs are created, but the folder is *not*
stopped: its card is green, `/api/ready` is happy, and the console carried one line reading
`files are not being enqueued — signing profile '<name>' is disabled`. An upload to that profile answers
`409` with `code = "profile.disabled"`; so does a retry of a job that named it.

**Root cause.** Somebody turned the profile's **accept new work** switch off on its page. That stops new
work being routed there and nothing else: jobs already queued on the profile ran to completion, and no file
has been modified — each one is sitting where the producer left it.

**Fix.** Either re-enable the profile on its page — the folder's next pass ingests everything sitting in
it, including files refused while it was off — or choose the folder on another profile's page. (The save
refuses to disable a profile that feeds from a folder, naming it, so this state arises only from a folder
binding made *after* the profile was disabled.)

### A file fails at once with `file.already-processed`

**Symptom.** A file dropped into a watched folder becomes a job that is `Failed` from the start with
`file.already-processed`, naming the job that holds the name, and the file is moved into the new job's
`error/<jobid>/` folder. An upload answers `409` with the same code and stores nothing. A rescan counts
these under `alreadyProcessed`.

**Root cause.** Since 2.13.0 a file arriving under a name a `Completed` or still-active job already
carries is **never signed**. The comparison is host-wide — every watched folder, profile and upload — and
ignores case, because they all write into the one `output/` folder. A `Failed` or `Canceled` job reserves
no name.

**Fix.** Retry is refused for this failure (a retry is exempt from the rule, so it would sign the file the
rule refused). To accept the name again, **delete the job that holds it** from the Jobs page. For a
producer that legitimately reuses one fixed file name every day, turn the rule off with
`Pipeline:RejectAlreadyProcessedFileNames = false`. See
[Operations](operations.md#already-processed-file-names).

### Uploads are refused with `upload.disabled`, or there is no Upload files button

**Not a fault.** `Upload:Enabled = false` (available from 2.10.0) turns the upload surface off on both
sides at once: `POST /api/files` answers `409` with `upload.disabled`, and the Jobs page renders no
**Upload files** button. The host takes files from its watched folders alone; Rescan and Retry are
unaffected. The key is read once at boot, so turning uploads back on is a restart.

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

If your bank processes a past-dated payment on the next business day, the profile can turn the guard off
instead (from 2.15.0): `CheckCnab240PaymentDates = false` on the profile's behaviour (or
`Signing:Profiles[].CheckCnab240PaymentDates` for a profile being imported on a first boot). The file is
then let through and the decision is recorded — in the job history, a `Cnab240PaymentDateCheckSkipped`
operational event, the `bulksigner_cnab240_payment_date_checks_skipped_total` counter and a Warning log
line. The setting is read at signing time, so a change reaches the next job without a restart. See
[CNAB240](cnab240.md#turning-the-guard-off).

:::tip Check the host timezone first
"Today" is the host's local date. On a host running in UTC while the payer sits in
`America/Sao_Paulo`, the boundary rolls over three hours early and a file due today starts being
refused at 21:00 local. Set `TZ=America/Sao_Paulo` on the container or systemd unit.
:::

### An approver is told the approval record is incomplete

**Symptom.** An approver's click or signature is refused with *cannot be decided — its approval record is
incomplete. Contact whoever operates the service.* Over REST the code is `approval.job-incomplete`. The
job stays `AwaitingApproval`.

**Diagnosis.** Before accepting a decision, Bulk Signer checks the record the decision is bound to, and
something it needs is missing or no longer agrees: the frozen rule, the job's content hash, the staged copy
in `processing/<jobid>/` or its bytes, the approver signature envelope beside it, or an approved row's
certificate thumbprint. Open the job page as an operator: since 2.8.0 its **Approval record** section runs
the same checks and marks the one that failed, with the value it found and the processing folder's path.

Which check failed says what happened. **A missing content hash** most likely means the job parked under a
profile whose `CheckCNAB240` was off — the CNAB240 parse is the only thing that records it. The profile's
history will show the check being turned off (`Changed: CheckCNAB240 on → off`) while the approval rule
stood. Since 2.9.0 the profile page refuses that save, and the gate fails such a job by name instead of
parking it (see [the entry below](#a-job-failed-with-approvalcontent-unmeasured-instead-of-parking)), so a
job in this state parked before either refusal existed. **Every other check** failing means the row or the
folder was modified outside the application — a restored backup, an antivirus quarantine-and-restore, a
sync client, a manual edit.

**Fix.** Cancel the job (the Cancel button, or `POST /api/jobs/{id}/cancel`). For the content hash, turn
`CheckCNAB240` back on from the profile's **Edit behaviour** first — or remove the approval rule, if the
profile is not meant to gate — and then re-run the file through Rescan or Upload, so it is parsed,
totalled and approved afresh; the original is still in `input/`. Nothing repairs the record in place, by
design. For the other checks, find what has write access to the operational store or to `processing/`
outside the application and stop it, or the next parked job will follow.

### A job sits in `AwaitingApproval` and nothing happens

**Not a fault by itself** — the job is waiting on a person, and it will wait indefinitely unless the
profile sets `Approval.ExpiresAfter`. Things to check:

- **Does anybody know?** The product sends no mail. Approvers reach a parked file from their own queue at
  `/approvals` — through their durable portal link (listed per approver on the System page) or an Entra
  sign-in. Since 2.9.0 the job page no longer shows a per-job approval link to copy; the anonymous page at
  `/approve/<jobId>` still exists for a deployment that relies on it, and everything in
  [Security](security.md#the-per-job-approval-page-is-not-authenticated) about handing it out applies.
- **Is the pool right?** The job page shows the pool **frozen at park time**, not the profile's current
  rule. If the people listed are wrong, cancel the job, fix the profile, and re-run the file — editing a
  profile never changes what a parked job requires. The Jobs page's **Approvals** column (from 2.12.0)
  shows how many approvals each parked job still needs.
- **Watch `bulksigner_approvals_expired_total`.** A climbing expiry rate is the signal that approvers are
  not looking at their queue.

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

### A job failed with `approval.content-unmeasured` instead of parking

**Symptom.** A file routed at an approval-gated profile goes to `Failed` rather than `AwaitingApproval`.
The history says it was refused before parking because the profile's CNAB240 check is off, the folder is
under `error/<jobid>/`, and the log carries `Job … was refused before parking for approval: profile …
requires approval but its CNAB240 check is off`. Every file on that profile fails the same way.

**Diagnosis.** The profile carries an approval rule and `CheckCNAB240 = false`. The parse is the only thing
that records the content hash a decision is bound to, so without it the job has nothing to park under —
and a job parked without one could never be decided. Since 2.9.0 the gate refuses it by name instead, and
the profile page refuses saving that pairing from either side, so a profile in this state was edited
before that refusal existed, or its row was edited outside the application.

**Fix.** On the profile's page, turn `CheckCNAB240` back on from **Edit behaviour**, or remove the approval
rule from **Edit approval** if the profile is not meant to gate. No restart: the next job claimed runs
under the corrected rule. Then re-run the failed files through Rescan or Upload; the originals are still
in `input/`.

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
the job is in flight. The hold normally ends when the job does; if the job is terminal and the lease is
still held, ending the hold failed — the share was unreachable, the credential had been rotated, or the
relocation was refused — and the log said so when the job finished (for example
`Cancel of job … could not end the hold on its staged copy`, or `Recovery: failed to relocate
processing/…`).

**Fix.** The lease lives on the storage account, not in this process, so **restarting Bulk Signer does not
clear it.** Confirm from the job page that the job is terminal, then break the lease and delete or move
the file as normal:

```bash
az storage file lease break --account-name <account> --share-name <share> --path 'processing/<jobid>/<filename>'
```

or, in the portal, select the file and use **Break lease**. Never break the lease on a *live* job's staged
copy: that removes the protection the pre-signature re-hash then has to catch, and the job will fail with
`approval.content-changed` rather than sign the wrong bytes. A local work tree has no such lease — its
hold is gone the moment the service restarts.

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

If the row's detail on `/api/ready/details` instead reads `not claimed cleanly at startup: …`, the
marker could not be reached at all — an unreachable share or a rotated credential. Whether another
instance holds it is then simply unknown, and unknown is not reported as the reassuring answer. The
share's own `storage-share:` row usually says why. The claim is retried on the next boot, not in the
background.

### A rejected file was not returned to `output/`

**Symptom.** An approver rejected a file. The job is `Canceled`, but `output/` has no
`<name>.reject<ext>` and the job page says *"The file could not be returned to the output folder, so the
staged copy is in the error folder and the original is still in its input folder."* The console carries a
warning and the log a `RejectionHandbackFailed` entry naming the reason.

**Overwhelmingly the most likely cause: the name was already taken.** A vetoed file is one finance corrects
and resubmits under the same name, so a second rejection of it tries to write `folha.reject.rem` where the
first one already sits. Bulk Signer refuses rather than overwriting — those are somebody's bytes — and
falls back to leaving the staged copy in `error/`. The log message names the destination.

**What is true when this happens**, and it is the reassuring part: the veto stands, nothing was signed,
the earlier file in `output/` is untouched, this rejection's bytes are intact in `error/<jobid>/`, and **the
input is still in its watched folder** — its deletion is only ever earned by a successful hand-back.

**What to do.** Collect or archive the older `output/<name>.reject<ext>`, then either leave the current
copy in `error/` (the audit trail points at it) or move it to `output/` yourself under a name you choose.
Nothing needs restarting.

**Other causes**, all rarer and all naming themselves in the log: the work share stopped answering between
the write and the move; the process lacks write permission on `output/`; on a share, a lease somebody
else holds on the destination. If instead you see `RejectionHandbackFallbackFailed`, neither destination
worked — the job is still terminal and correct, and `processing/<jobid>/` needs clearing by hand. A
`RejectionHandbackUnavailable` at Error is a product defect rather than an operational failure: report it
to Lacuna Software support.

## Dashboard

### Every page renders but no button does anything, and the browser console shows `_framework/blazor.web.js` 404

**Symptom.** On a Docker deployment the dashboard loads and the tables fill, but *Upload files*, *Retry*,
*Cancel*, the filters and every other control are inert. The browser console has exactly one error: a 404
for `/_framework/blazor.web.js`. `/api/ready` is green and the server log records nothing.

**Cause.** Container images before 2.4.1 built on .NET 10 — 2.3.2 and 2.4.0 among them — were
published without the dashboard's client script, so the pages rendered but never became interactive. Windows Service, systemd and foreground installs were never
affected.

**Fix.** Pull image 2.4.1 or later and redeploy. To check an image before deploying it:
`docker run --rm --entrypoint ls <image> /app/wwwroot/_framework` must list `blazor.web.js`.

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

**Root cause.** Part of the `Signer:*` block is set and the rest is not. The validator self-gates on the
section: omit it entirely and nothing is enforced; write any of it and the whole block is validated,
because a half-configured connection is one that would fail at its first handoff rather than at boot.

:::warning Changed in 2.1.0
This check no longer looks at which profiles exist — profiles live in the operational store and can be
switched to Lacuna Signer from the dashboard at any moment. The requirement moved onto the profile: see the
next entry.
:::

**Fix.** Set both `Signer__Endpoint` and `Signer__ApiKey` (env vars), or remove the section if this host
signs everything locally. The API key format is `application-id|secret`.

### `Method = LacunaSigner, but this host has no Signer: settings`

**Symptom.** A boot refusal naming a profile's `Method`, or the same sentence in the profile form when a
save is refused.

**Root cause.** A signing profile selects the remote service and this host has never been told where it
is. The refusal is the same wherever the profile comes from — a `Signing:Profiles[]` entry being imported
on a first boot, or a save from the dashboard's profile pages.

**Fix.** Set `Signer__Endpoint` + `Signer__ApiKey` and restart, or give the profile `Method = Local`.

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
2. **The poll worker is not running.** Check the log for `SignerPollWorker started`. If absent, the host
   has no `Signer:*` settings, so neither the gateway nor the poll worker is registered — set
   `Signer__Endpoint` + `Signer__ApiKey` and restart. (Since 2.1.0 registration follows those settings,
   not the profiles, so a host that has them is ready for a profile switched to Lacuna Signer after it
   booted.)
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

**Root cause.** Since 2.1.0 profiles live in the operational store, and `Signing:Profiles[]` is only
imported on the first boot against an empty profile table. If you added or changed the profile in
`appsettings.Production.json` after that first boot, the edit had no effect — the startup banner says the
section is being ignored — and no stored profile has `Method = LacunaSigner`.

**Fix.** Check the dashboard's [signing-profiles page](dashboard.md#profiles--signing-profiles), which shows what the store actually holds. Create
the profile there, or switch an existing one to Lacuna Signer (the host needs `Signer:*` settings — see
above). A saved profile reaches the running host within a poll interval, with no restart; reload the
Dashboard or System page to see the tile and the panel.

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
the host comes up, the migration is **skipped**, and `/api/ready` stays red (the `database` check's detail,
on `/api/ready/details`, names the store).

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

### Store commands time out at 35 s a few seconds after App Service replaced the container

**Symptom.** On Azure App Service with `Database:Provider = SqlServer`, one to three commands fail with
`Execution Timeout Expired` a few seconds after the platform stops the *previous* container on the same
worker — each measuring 35 s, never 30 — and nothing fails after that. The victims are whatever asked
next: `Takeover sweep failed`, `Pipeline worker iteration failed`, a heartbeat tick, or one page load.
`/api/ready` stays green and the next poll succeeds.

**Cause.** Not the store. When the platform removes the old container, connections the new container
pooled during its warm-up can go dead on the wire without being closed, and still look alive to the
connection pool. The first command on one waits the full 30 s command timeout, then 5 s for the server to
acknowledge a cancel it never receives — 35 s is the signature of a connection that has stopped answering,
where a query the server is actually blocking fails at 30 s. The dead connection then leaves the pool,
which is why the episode ends by itself; a timeout is not retried, so each dead connection costs exactly
one failure.

**Fix.** None in the product: the sweep re-asks on its next poll, a lost heartbeat tick is 15 s from the
next, and a page load succeeds on reload. When the window matters, deploy with a stop — stopped first, the
old container is gone before the new one opens a connection (see
[High availability](high-availability.md#upgrades-are-stop-the-world)). Do not raise the command timeout
or add a retry for this — the one lengthens the wait and the other repeats it. A real store stall looks
different: failures at 30 s, and DTU, deadlock or `blocked_by_firewall` signal in Azure Monitor.

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

Under `Database:Provider = SqlServer` the growth is the same and the recipe is not: there is no file to
move, and starting a fresh store by hand would discard the recorded approvals along with everything else.
Archive rows with your own DBMS tooling.

:::warning Clear Jobs is not an archive
**Clear Jobs** on the System page (or `DELETE /api/jobs`) deletes **every** job record whatever its status
(since 2.9.0), the files those jobs left behind — inputs, staged copies, error folders and signed outputs —
and (since 2.10.0) every operational event recorded before it. Nothing is kept to query later. See
[Operations](operations.md#clear-jobs).
:::

## Cluster mode

Everything in this section requires `Cluster:Enabled = true`. Off the switch none of it applies — see
[Azure App Service (cluster mode)](azure.md) for the deployment and
[High availability](high-availability.md) for what the mode does and does not buy.

### `Cluster mode refused to start`, naming configuration keys

**Symptom.** The host exits at boot with a message naming one or more of `Database:Provider`,
`Storage:Provider`, `Storage:Inputs[]` or a certificate `Source`.

**Diagnosis.** These are the configurations that could not have worked, refused rather than half-run.
The message names **every** failing key at once rather than one per attempt, so one read is enough:

| Named key | What it must be | Why |
|---|---|---|
| `Database:Provider` | `SqlServer` | The store is the cluster's coordination point; a SQLite file cannot be shared between hosts. |
| `Storage:Provider` | `AzureFiles` | The local file store's lease excludes nothing outside its own process. |
| every `Storage:Inputs[]` entry | on `AzureFiles` | A folder local to one instance is invisible to its siblings. The zero-config synthesised `default` folder is local, so a first run with the switch on refuses too. |
| a certificate `Source` | not `Pkcs11`, not `WindowsStore` | A token or a machine store lives on one machine, and cluster instances are fungible. Use `Pfx` (ideally read from a blob) or `AzureKeyVault`. |

**Fix.** Correct the named keys, or turn `Cluster:Enabled` off — off is the single-instance product
unchanged. An NFS Azure Files share is refused by name; the work share must be SMB.

### Boot refused: an instance identity `could not be registered in 3 attempts`

**Symptom.** The host exits naming its own derived instance identity, the log carries the same at
`Critical`, and the message says the identity could not be registered — every write of this boot's
heartbeat row lost a race to another incarnation — giving the last beat and version of whatever won.

:::warning Changed in 2.5.0 — a live identity is displaced, not refused
Up to 2.4.x a boot that found its own identity with a live heartbeat refused to start (2.4.3 waited first).
Since 2.5.0 it **displaces** the holder instead — see the next entry. The refusal above is the only one
left.
:::

**Diagnosis.** Something is rewriting this identity's row faster than a boot can take it: two hosts
presenting the same name **and booting at the same moment** against one database, or a store fault.
Identity is the App Service instance id where the platform sets one, and the machine name where it does
not. The refusal is fatal on purpose: a boot that cannot get its row written cannot be told apart from
anything else by recovery, takeover or the Instances view.

**Fix.** Read the Instances view on the System page of an instance that *is* running, find the row holding
that identity, and either stop whatever else is presenting it or point it at its own database. Do **not**
delete the row to get past the refusal while the holder is still running — that removes the report, not
the condition.

### After a redeploy, the old instance logs `has been displaced` and stands down

**Symptom.** Changing the image of a running app (`az webapp config container set`) produces, in the log,
a Warning `displaced the previous incarnation … which was still live` and, about three seconds later, a
Critical `has been displaced`. One container's `/api/ready` carries a red `cluster-instance` row (and
stays 200), its System page shows a banner, and an `InstanceStoodDown` operational event is recorded.

**Diagnosis. This is a normal in-place redeploy on App Service (since 2.5.0).** The platform starts the new
container **beside** the old one on the same instance — both derive the same identity — and keeps the old
one serving until the new one passes its warm-up probe. The new container takes the identity at once and
records which incarnation it displaced; the old one finds out on its next beat and **stands down**: it
claims no new job, runs no takeover, polls Lacuna Signer for nothing, finishes what it holds, and serves
the web until the platform stops it. Whatever it leaves unfinished is taken over one
`Cluster:StaleAfterSeconds` after the displacement, under the ordinary takeover policy. No failed start
and no `ContainerStartupFailure`; the Instances view shows the displaced incarnation under the
successor's row. See [Operations](operations.md#when-a-boot-finds-its-own-identity-already-live).

**Reading the overlap log.** While both containers run, App Service writes both processes' output into one
log with nothing saying which container a line came from, so the old container's Critical sits between
the new one's boot lines and reads as if the *new* container had stood down. It has not: the Critical in
an overlap log is always the old container's — the newcomer logs a Warning naming the incarnation it
displaced.

**If the new container then fails its warm-up** — a bad image, a configuration error caught after
registration — App Service stops the **whole site**, the stood-down old container included, and restarts
it with the *new* image in a loop of 503s. On App Service the remedy is yours: point the app back at the
previous tag with `az webapp config container set`, and it is ready again within about two minutes.
Stopping the app before changing the image and starting it after (see
[High availability](high-availability.md#upgrades-are-stop-the-world)) avoids the overlap altogether and
is still the tidier deploy.

**A genuine duplicate — two hosts presenting one name, or a deployment slot carrying production's
connection string — is no longer refused either.** The later boot displaces the earlier, and a restart of
the displaced host takes the identity back, so the two ping-pong loudly: a Warning on each newcomer, a
Critical on each process standing down, and a displaced incarnation on the Instances view that keeps
changing. At every moment exactly one of them claims work. Find the host that should not be presenting
this identity, and rename it or point it at its own database. Slots are not supported on this topology.

### Boot refused naming two operational stores

**Symptom.** The host exits saying the work share's marker names a different operational store than the
one this instance is configured with, naming both.

**Diagnosis.** Two clusters are pointed at one work share. This is the one catastrophe no database can
see — each store believes it owns the tree, and they overwrite each other's staging, output and error
directories — which is exactly what the marker exists to catch.

**Fix.** Decide which store is authoritative and repoint or retire the other. Do **not** delete the
marker to make the message go away; it is the only guard against this condition.

:::note What the gate does not catch
It refuses on evidence and never on the absence of it, so a share carrying no marker yet, and the instant
of a naming write, are both narrowed rather than closed — and a check that runs once at boot cannot see a
rival cluster arriving afterwards. The gate is also **not** what stops two instances signing one file;
the per-file lease and the database claim are. See
[High availability](high-availability.md#the-work-share-gate-is-narrower-than-the-catastrophe-it-is-named-for).
:::

### Operators (or approvers) are bounced to sign-in intermittently

**Symptom.** Sessions work, then do not, seemingly at random — and more often the more instances are
running.

**Diagnosis.** The instances are not sharing one Data Protection key ring, so a cookie minted by one is
rejected by the next. Both session cookies ride that ring, so this strands approvers as well as
operators. Two causes:

- **One host has `Cluster:Enabled = false`.** The ring placement follows the switch, so that host is
  still using its local `keys/` directory.
- **Instances are pointed at different operational stores.** Different store, different ring.

**Fix.** Make the switch and the connection string identical across every instance — which on App
Service is automatic, since app settings are per app. Note that **ARR affinity does not fix this**:
affinity is for the Blazor circuit, the shared ring is for the cookie.

### Startup logs a Critical about instances on a different application version

**Symptom.** A Critical at boot naming live heartbeats carrying a different version, and the host starts
anyway.

**Diagnosis.** Mixed versions are sharing one store, one queue and one work share. It is a warning
rather than a refusal on purpose: refusing would block instances from coming up for as long as a *dead*
old-version heartbeat took to go stale, which is exactly the moment after a failed deploy.

**Fix.** Finish the deploy — stop every instance, deploy, start. If nothing is deploying, look for a
slot or a second deployment on this database. Treat the Critical as the alarm it is; nothing else will
stop this. (An old container being displaced during an in-place redeploy does not trigger it: that is the
identity's own previous life, not a sibling.)

### A job is stuck and no instance will touch it

**Symptom.** A row sits in `Processing`, `Verifying` or `AwaitingSigner` indefinitely. No takeover event
appears, and boot recovery does not clear it.

**Diagnosis.** The row has **no owner**, or names an instance with no heartbeat row at all. Boot recovery
takes only this instance's own identity and takeover follows an owner's heartbeat, so a row with neither
is a row nobody reconciles. Ownerless rows are left by a build older than the ownership column, or by a
run with the mode off. Such a job dispatched to Lacuna Signer is worse than it looks: `Signer:TimeoutHours`
is only enforced while a row is being polled, so a row nothing polls is a row nothing bounds.

**Fix.** **Boot once with `Cluster:Enabled = false`** and let ordinary
[startup recovery](operations.md#startup-recovery) sweep every in-progress row whoever owns it, then turn
the mode back on. Do this at the upgrade, before the first cluster boot, and it stops being a concern.
This is the remedy every surface that meets one of these rows names.

### Log lines about lost claims and lease conflicts, on a healthy cluster

**Symptom.** Steady "claim lost to a concurrent writer" and input lease-conflict lines whenever files
arrive in batches.

**Diagnosis.** **This is the system working.** Every instance watches every folder, so they race on each
arrival, and in cluster mode the losing side is logged at the expected-outcome level under its own event
id. Every file still becomes exactly one job — the losing enqueue is refused by a partial unique index
and answered `AlreadyActive`.

**Fix.** None. Neither outcome counts against a folder's consecutive-failure budget, so a busy cluster
cannot trip the per-folder breaker by being busy. See
[Operations](operations.md#contention-between-instances-is-not-a-failure).

### Prometheus series jump between instances

**Symptom.** Gauges on `/api/metrics` are discontinuous, and `bulksigner_jobs_awaiting_signer` reads
lower than the dashboard's count.

**Diagnosis.** `/api/metrics` is per-process and App Service's front door cannot target an instance, so
each scrape lands on whichever instance the load balancer picked. **No configuration recovers scrape
continuity.** The gauge is also per-instance by design: it counts the rows *this* instance polls.

**Fix.** `sum()` across the fleet for a cluster-wide total — nothing is double-counted, a job having
exactly one owner. For a supported path, use the Application Insights distro, which is instance-aware
natively ([Telemetry](telemetry.md)). See
[High availability](high-availability.md#metrics-scraping-reaches-an-arbitrary-instance).

### A pause held every instance, and that was not expected

**Symptom.** `POST /api/pipeline/pause` stopped the whole fleet rather than the instance it was sent to.

**Diagnosis.** Not a fault. The pause flag is one row every worker reads each poll iteration, so pause is
cluster-wide — which is what an operator pausing "the pipeline" means. **There is no per-instance
drain**, and it was deliberately not built.

**Fix.** To take one instance out, stop it and let
[takeover](operations.md#when-an-instance-stops-answering-a-survivor-takes-its-jobs-over) reconcile its
work. Note that takeover sits *behind* the pause gate, so a paused cluster does not declare its siblings
dead.

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

### Uploads fail with `Access to the path '/app/entrada' is denied`

**Symptom.** A dashboard or `POST /api/files` upload fails with `System.UnauthorizedAccessException:
Access to the path '/app/<first segment of Storage:Inputs[0].Path>' is denied`, on a container whose first
watched folder is on an Azure Files share. Files dropped into the share are picked up normally.

**Root cause.** Before 2.4.2 the upload landing folder was derived as a *local* path from the first
folder's `Path`, whatever provider the folder was on, so `entrada/remessas` on the share became
`/app/entrada/remessas` on the container's disk — the working directory, owned by root. On a Windows
Service or systemd install the same fault was quieter: the upload was accepted into a local folder no
watcher reads.

**Fix.** Upgrade to 2.4.2 or later and restart. No configuration change: uploads land in the first
watched folder, on its own provider.

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
4. **Read the operational event log.** Since 2.13.0 the dashboard's [**Events** page](dashboard.md#events--operational-events) (and
   `GET /api/events`) lists every operational event — pause and resume, profile edits, approval decisions,
   takeovers, service starts and stops — newest first, with filters by type, date range and text. A trail
   that begins with a `JobsCleared` event begins there because Clear Jobs deleted what came before.
5. **Inspect the database.** `sqlite3 db/bulksigner.db` and queries like
   `SELECT * FROM Jobs ORDER BY CreatedAt DESC LIMIT 20;` give a full picture of recent activity.

If after all that the symptom remains unexplained, contact Lacuna Software support with the bootstrap
banner, the relevant log excerpts (the application redacts secrets, but verify before sending), and
the exact reproduction steps.

---

**Previous:** [Retention](retention.md). **Back to:** [overview](index.md).
