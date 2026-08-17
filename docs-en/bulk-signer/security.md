---
sidebar_label: "Security"
sidebar_position: 5
---

# Security

The operator-facing security model for Lacuna Bulk Signer — how secrets are stored, how
authentication works, and what the service does to prevent accidental disclosure.

## Threat model in one paragraph

Bulk Signer is an on-premises service that holds four classes of secret: the **PKI SDK license**,
**certificate material, PINs, and cloud credentials**, the **encryption password** (when encryption
is enabled), and the **API key**. It exposes a REST API and a web dashboard, both behind that single
API key with a cookie-based session for operators. There is no auto-update. The threat model assumes
the service runs on a trusted host inside a trusted network with TLS terminated at a reverse proxy.

A deployment that enables the [approval gate](approvals.md) additionally holds **personal data about
its own approvers** (name, email, CPF) and, while a payment job is in flight, about every beneficiary
in the file.

A default install makes **no outbound connections**. Every opt-in feature that changes that is off
unless you enable it:

| Feature | Outbound dependency |
|---------|---------------------|
| `Signing:Certificate:Source = AzureKeyVault` | `*.vault.azure.net` + `login.microsoftonline.com` — one sign call per signature. See [Certificates](certificates.md#source--azurekeyvault). |
| `Signing:Certificate:…:Blob` | `*.blob.core.windows.net` — one read at boot. See [Certificates](certificates.md#reading-the-file-from-a-blob). |
| `Signing:Profiles[].Method = LacunaSigner` | Your Lacuna Signer tenant. See [Lacuna Signer integration](lacuna-signer.md). |
| `Storage:Provider = AzureFiles` | `*.file.core.windows.net` — every staging, promote and relocate. |
| `Database:Provider = SqlServer` | Your SQL Server or Azure SQL instance. |
| `Auth:EntraId` | `login.microsoftonline.com` — interactive sign-in only. |
| `Telemetry:Enabled = true` | Azure Application Insights. See [Telemetry](telemetry.md). |

## Authentication

Two authentication schemes share one authorization policy:

- **`X-API-Key` header.** Programmatic clients send the configured `Auth:ApiKey` in the header named
  by `Auth:ApiKeyHeader` (default `X-API-Key`). The handler compares values in constant time to avoid
  timing oracles.
- **Cookie.** Operators paste the same API key at `/login`; the login endpoint exchanges it for a
  cookie (`Auth:CookieName`, default `lbs-auth`) with `SameSite=Strict` + `HttpOnly`. Subsequent
  dashboard requests carry the cookie.

Both schemes back the same authorization policy on every protected endpoint. `/api/health`,
`/api/ready`, `/login`, `/api/auth/login`, `/api/auth/logout` and `/api/culture` are anonymous, plus
the approval surfaces described [below](#the-per-job-approval-page-is-not-authenticated).

### Microsoft Entra ID sign-in mode (optional)

When [`Auth:EntraId`](configuration.md#authentraid--optional-microsoft-entra-id-sign-in) is configured,
the browser story changes and the automation story does not:

- **The legacy API-key login is off, not de-emphasized.** `/login` renders the Microsoft sign-in; a
  hand-crafted POST to `/api/auth/login` is refused even with a correct key; and the operator policy
  stops accepting legacy-cookie sessions, so turning the mode on **retires every API-key-minted browser
  session at once** rather than leaving an eight-hour tail. Plan the cutover as a sign-everyone-out.
  `X-API-Key` for REST callers is untouched — automation cannot do an interactive sign-in.
- **Access is decided by app roles, from the roles claim only.** `Administrator` is the operator;
  `Approver` opens the approver surfaces, where the frozen pool still scopes which jobs the person
  sees. An authenticated account with no role — and an Approver whose account carries no email claim,
  since pools bind on email — is refused at `/access-denied`. **No security-group mapping:** a
  tenant-side group edit must never be an invisible authorization change.
- **One session may carry both roles**, and separation of duties is held by the role checks: an
  Administrator-only session satisfies no approver policy, and vice versa.
- **Sessions are 8-hour sliding cookies on their own scheme** (`SameSite=Lax`, because the sign-in
  returns via a cross-site redirect from the tenant; `HttpOnly`). Sign-out is local-only — it clears
  Bulk Signer's session and deliberately does not end the person's Microsoft session, so an immediate
  re-sign-in succeeds silently. That is normal SSO behaviour, not a bug.
- **Recommended tenant hardening:** set **Assignment required** on the enterprise application so
  unassigned accounts fail at Microsoft's door. The app enforces role presence regardless — relying on
  tenant config alone would make a tenant-side toggle an authorization bypass.

Walkthrough: [Installation](installation.md#microsoft-entra-id-sign-in-optional).

#### `Auth:EntraId:ClientSecret`

The mode makes the host a **confidential OIDC client**, and the credential for that is the app
registration's client secret. It follows the same rules as the Key Vault `AppSecret` below: permitted
in config, environment variable recommended.

| Where it may live | Allowed? |
|-------------------|----------|
| `appsettings.json` (committed) | Technically binds — **never do this** |
| `appsettings.Production.json` (gitignored) | Yes |
| `Auth__EntraId__ClientSecret` | Yes — **recommended** |

What the secret is worth to an attacker is bounded: it authenticates the *application*, not any user.
Holding it does not sign anyone in by itself and it grants none of the app roles. Rotate it in the
tenant on a schedule; an expired secret fails the OIDC handshake, not the boot.

A half-written `Auth:EntraId` section is refused at boot with an error naming the missing key. A
partially-configured authentication mode is a door whose lock nobody finished installing.

### API-key rotation

The API key is static. To rotate:

| Target | Steps |
|--------|-------|
| Linux | Edit `Auth__ApiKey=<new>` in `/etc/bulksigner/bulksigner.env`, then `sudo systemctl restart bulksigner`. |
| Windows | `[Environment]::SetEnvironmentVariable("Auth__ApiKey", "<new>", "Machine")`, then `Restart-Service LacunaBulkSigner`. |
| Docker | Edit `Auth__ApiKey=<new>` in `deploy/docker/.env`, then `docker compose up -d` (recreates the container). |

The key must be at least 16 characters; the service refuses to start with a shorter value. Use a
random string from a CSPRNG — for example `openssl rand -base64 32` on Linux/Mac, or on PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

:::warning
Rotation is disruptive: every existing operator cookie and programmatic client immediately starts
failing on the next request. Schedule it during a maintenance window, or use a brief overlap period
where two known keys are accepted by a reverse-proxy filter (Bulk Signer itself accepts exactly one
key).
:::

### Cookie session lifetime

Cookies are issued with `HttpOnly`, `SameSite=Strict`, and are marked `Secure` when the request was
HTTPS. The auth ticket has an **8-hour sliding expiration** — every authenticated request resets the
clock; eight idle hours and the operator is logged out. There is no longer-lived "remember me"
option. Operators can log out explicitly via the account menu in the dashboard.

### The session key ring, and where it lives

Both session cookies — the operator's and the approver's — are ASP.NET Data Protection payloads, so the
key ring that protects them decides who can validate a cookie. **Its location follows
`Cluster:Enabled` rather than a setting of its own**, deliberately: a deployment able to choose the
placement independently of the topology is a deployment able to choose the broken combination.

| `Cluster:Enabled` | Where the ring lives | At rest |
|---|---|---|
| `false` (default) | `keys/` under `Storage:Root` | DPAPI-encrypted on Windows; unencrypted on Linux |
| `true` | Rows in the operational store | **Plaintext**, guarded by the database's own access control |

Two consequences of the clustered form, and the second is easy to miss:

- **The Windows DPAPI encryptor is dropped under the switch.** Machine-scoped DPAPI is exactly the
  property that makes a copy of `keys/` useless on another host — and exactly the property that makes a
  ring unreadable by a sibling, so keeping it would be keeping the defect. On Windows this is weaker at
  rest. It costs nothing on the supported topology, whose Linux container has no encryption at rest for
  the on-disk ring either, and it is the one place turning cluster mode on trades a control away rather
  than adding one.
- **An unreachable store fails the request, with no fallback.** A host that quietly minted sessions from
  a per-instance ring would issue cookies its siblings reject — the intermittent sign-out the shared ring
  exists to remove.

Either way, **read access to the ring is a session as anyone**: treat `keys/` with the same ACLs as the
database, and treat the connection string as the credential it is. See
[the operational store connection string](#the-operational-store-connection-string) and
[High availability](high-availability.md#the-session-key-ring-is-plaintext-in-the-store).

## License storage

The Lacuna PKI SDK license is a base64 string. Two ways to load it:

| Where | Persists across | Preferred? |
|-------|-----------------|------------|
| `Signing:PkiSdkLicense` in `appsettings.Production.json` | Service restart | Acceptable if the file is gitignored and the install location is ACL'd to the service account |
| `Signing__PkiSdkLicense` environment variable | Service restart | **Yes** — keeps the literal license out of the file tree |

The env var takes precedence at boot. Per-target wiring:

- **Linux:** `/etc/bulksigner/bulksigner.env` (mode `0640`, owner `bulksigner`).
- **Windows:** machine-scope environment variable set by `Install-Service.ps1`.
- **Docker:** `deploy/docker/.env`.

## Certificate-source secrets

### PFX password

PFX passwords behave like other config secrets — set in `Signing:Certificate:Pfx:Password`, or
override via `Signing__Certificate__Pfx__Password`. The PFX file itself sits at the path in
`Signing:Certificate:Pfx:Path`; secure it with restrictive file ACLs.

### PKCS#11 PIN — environment variable only

By design, the PKCS#11 PIN is **never accepted in config files**. The validator refuses to start if a
literal `Pin` key appears under `Signing:Certificate:Pkcs11`. The same rule applies inside every
entry of `Signing:Profiles[]`. The PIN is read at runtime from the environment variable named by
`Signing:Certificate:Pkcs11:PinEnvVar` (default `BULK_SIGNER_PKCS11_PIN`), and multiple profiles can
either share the same env var or set distinct ones via `PinEnvVar` per profile.

This is the strictest of the secret-handling rules:

| Where the PIN may live | Allowed? |
|------------------------|----------|
| `appsettings.json` (committed) | No |
| `appsettings.Production.json` (gitignored) | No — the validator fails the boot |
| Environment variable | Yes (the only path) |

### Azure Key Vault credentials

`Signing:Certificate:AzureKeyVault:AppSecret` is a Microsoft Entra ID client secret. Unlike the
PKCS#11 PIN it **is** permitted in a config file — the validator does not refuse it — but the
environment-variable form is recommended:

```bash
export Signing__Certificate__AzureKeyVault__AppSecret='…'
```

| Where the client secret may live | Allowed? |
|----------------------------------|----------|
| `appsettings.json` (committed) | Never — it would land in source control |
| `appsettings.Production.json` (gitignored) | Yes, and the validator permits it |
| Environment variable | Yes — **preferred** |

What this source *removes* from the host is the more important point: there is no private key on
disk, so no PFX file to ACL and no key material in a backup. What it *adds* is a rotatable cloud
credential. Rotate it in Azure (create a new client secret, update the env var, restart, then delete
the old secret in Azure) — the credential is far easier to rotate than a certificate, so prefer a
short expiry.

The `.cer` file at `CerPath` is **not** a secret. It holds only public material; protect its
integrity, not its confidentiality.

The client secret is registered with both redaction layers described below, so it is scrubbed from
durable logs whether it appears as a structured property or interpolated into an exception message.

### Signing material blob credentials

Optional, and absent from every deployment that keeps its certificate files on the host.
[`Pfx:Blob` and `AzureKeyVault:Blob`](certificates.md#reading-the-file-from-a-blob) let those two
sources read their file out of Azure Blob Storage instead. The credential is chosen per block from the
same three modes as the storage provider below, and its `AppSecret` / `AccountKey` follow exactly the
`AppSecret` rules above.

Two things about it are security decisions rather than configuration detail.

**The credential is separate from the vault's, even where it is the same application.**
`AzureKeyVault:AppSecret` authorises *use of a key*; `AzureKeyVault:Blob:AppSecret` authorises *reading
one blob*. Nothing inherits: the block restates `TenantId` / `AppId` / `AppSecret` even when they name
the identical Entra app. Two credentials granting different things are configured separately, and a
missed rotation makes the boot refuse loudly rather than working with one of them.

**What an account key costs depends on what the blob holds.**

| Blob under | What it holds | What a leaked `AccountKey` yields |
|------------|---------------|-----------------------------------|
| `AzureKeyVault:Blob` | the `.cer` — public material | a public certificate; the private key stays in the vault |
| `Pfx:Blob` | the PKCS#12 file | **the signing key** |

A token credential needs only **Storage Blob Data Reader** on the container. Nothing in Bulk Signer
writes, lists, moves or leases a blob, so nothing wider is ever required.

### Windows certificate store

No secret in config — selection is by store location, store name, and SHA-1 thumbprint. The
certificate itself was imported with whatever protection the OS offered at import time. Use
`LocalMachine` when the service virtual account must reach the key, and grant the virtual account
access to the private key via `certlm.msc` → certificate → All Tasks → Manage Private Keys.

## Azure Files storage credentials

Optional, and absent from every deployment that keeps its storage local. When `Storage:Provider` — or
any `Storage:Inputs[].Provider` — is `AzureFiles`, the host holds a credential that can read and write
the shares it is pointed at. The three modes are not equivalent:

| Mode | Secret held by the host | Blast radius if the host is compromised |
|------|-------------------------|------------------------------------------|
| `ManagedIdentity` | **None** | The identity's own role assignments, and nothing portable — there is no value to steal and replay elsewhere |
| `ServicePrincipal` | `AppSecret` | The app registration's role assignments, until the secret is rotated |
| `AccountKey` | `AccountKey` | **The entire storage account** — every share in it, read, write and delete, with no expiry and no way to scope it down |

**Prefer `ManagedIdentity` wherever the host runs inside Azure.** It is the only mode with no secret at
all. It is **system-assigned only**, and it is deliberately not `DefaultAzureCredential`, so it never
falls back to a developer's `az login` identity and cannot appear to work on a laptop while being
absent in production.

Both token modes authenticate through OAuth, which for Azure Files needs one of the **privileged file
data** roles: grant `Storage File Data Privileged Contributor`, scoped to the share rather than the
account. Least privilege has a floor worth stating: a read-only role is **not** enough even for an
input folder, since the pipeline leases the input file while staging it and deletes it after
verification.

:::warning One trap when scoping the assignment to a single share
The data-plane scope string is:

```
/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<account>/fileServices/default/fileshares/<share>
```

`fileshares`, one word and lowercase. An assignment built with the management-plane spelling `shares`
binds without complaint and then grants nothing — and it fails as `AuthorizationPermissionMismatch` at
the first call, which reads like a wrong role rather than a wrong scope. Compare the scope string
before rotating anything.
:::

`AccountKey` exists for hosts that cannot reach the tenant at all. It is the one mode the host **warns
about at startup**, on the console and in the durable log. Put it in the environment variable rather
than the config file and rotate it on the same schedule as any other account-wide credential.

Both secrets are registered with both redaction layers — from the top-level block *and* from every
per-folder override, so a credential left behind by a folder that has moved back to local storage is
still scrubbed. A partial credential block fails the boot naming the missing key.

### No signed artifact is ever reachable by URL

No shared-access-signature URL is minted for a signed artifact, whichever provider holds `output/`.
Downloads are streamed through the application, so `GET /api/jobs/{id}/output` has the same response
shape, the same authorization and the same problem codes on a share as on local disk.

## The operational store connection string

Under `Database:Provider = Sqlite` — the default — `ConnectionStrings:Default` names a file and carries
no credential; the protection is the file ACL on `db/`, in the table below. Under `SqlServer` the same
key becomes **the whole of the credential**.

**Prefer a shape with no secret in it.** The three are not equivalent:

| Shape | Secret held by the host | Blast radius if the host is compromised |
|-------|-------------------------|------------------------------------------|
| Managed identity (`Authentication=Active Directory Managed Identity`) | **None** | The identity's own database grants, and nothing portable |
| Windows integrated (`Integrated Security=True`) | **None** | What that principal is granted, and only from a domain-joined host that can obtain a ticket |
| SQL login, or Entra service principal (`User ID` + `Password`) | The password | The database, from anywhere that can reach the server, until the password is rotated |

The boot refusals quote the data source and never the string, and the key is registered at both
redaction layers.

**Encrypt the connection.** `Encrypt` defaults to `True` in the SQL client, which is what you want.
`TrustServerCertificate=True` keeps the encryption and drops the identity check, so it re-opens the
man-in-the-middle it was closing; use it knowingly, on a trusted segment, and prefer installing a
certificate the host trusts. `Encrypt=False` should not appear in a production string.

## Encryption password

When `Encryption:Enabled = true`, the encryption password derives the AES-256-GCM key at startup via
PBKDF2-HMAC-SHA256. Unlike the PKCS#11 PIN, the password **is** allowed in config (the
`Encryption:Password` key) — operators are expected to put it in `appsettings.Production.json`, which
is gitignored. The env var `BULK_SIGNER_ENCRYPTION_PASSWORD` (or the name configured by
`Encryption:PasswordEnvVar`) is the preferred override and takes precedence at boot.

Committing the password to the unencrypted `appsettings.json` is not blocked by the validator but is
the wrong location — keep it in `appsettings.Production.json` or the env var.

The derived key lives in process memory only — never written to disk, never logged, never returned
through any endpoint. See [Encryption](encryption.md) for the algorithm details and the on-disk
envelope.

## File ACLs per target

| Target | Path | Mode | Owner |
|--------|------|------|-------|
| Linux | `/etc/bulksigner` | `0750` | `bulksigner:bulksigner` |
| Linux | `/etc/bulksigner/bulksigner.env` | `0640` | `bulksigner:bulksigner` |
| Linux | `/etc/bulksigner/appsettings.Production.json` | `0640` | `bulksigner:bulksigner` |
| Linux | `/var/lib/bulksigner` | `0750` | `bulksigner:bulksigner` |
| Windows | `C:\ProgramData\Lacuna\BulkSigner` | ACL: SYSTEM, Administrators, `NT SERVICE\LacunaBulkSigner` | `NT SERVICE\LacunaBulkSigner` (effective) |
| Docker | `./config/appsettings.Production.json` | OS-dependent on host | UID 1654 reads as a `:ro` mount |

The Linux install script creates the system user, sets the ACLs, and never touches `/opt/bulksigner`
after the initial install (binary is `root:root`, mode `0755`). The Windows install script grants the
virtual account `NT SERVICE\LacunaBulkSigner` access to `ProgramData` so operators with Administrators
rights can see the files but other users cannot.

## Log redaction — two layers

Durable structured logs flow through a redacting pipeline. Secrets are scrubbed at two complementary
layers:

1. **Property-name redaction.** Every log event's properties are walked and values whose name
   contains `Password`, `Pin`, `License`, `ApiKey`, `Secret`, `Salt`, `ConnectionString`,
   `Authorization`, or `Cookie` (case-insensitive) are replaced with `***`. Matching is on
   *substring*, so `AppSecret` and `ClientSecret` are both caught by the `Secret` token. This catches
   the structured path:
   ```
   logger.Information("Loaded {ApiKey}", apiKey);
   // → "Loaded ***"
   ```
2. **Literal-value redaction.** At startup the service loads the literal text of every configured
   secret value (PKI license, PFX passwords, Azure Key Vault client secrets, blob and Azure Files
   credentials, the Entra ID client secret, the approver-portal link secret, the API key, the
   encryption password, the PKCS#11 PIN, the operational-store connection string) and scrubs those
   exact strings from every
   rendered log line. Secrets declared on *every* signing profile are collected, not just those in
   the global `Signing:Certificate` block. This catches the stray-interpolation path:
   ```
   logger.Error($"Failure with config: {appSettingsBlob}");
   // → "Failure with config: { … Auth.ApiKey: ***, Signing.PkiSdkLicense: ***, … }"
   ```
   Literal-value redaction skips secrets shorter than 12 characters to avoid pathological matches.

Both file and console output pass through the same redaction pipeline.

## The approval surfaces

Only relevant when a signing profile carries an [`Approval` block](approvals.md). Everything in this
section is absent from a deployment that does not use the gate.

### Approver personal data — CPF and email

Approvers bring the first personal data the product holds about *its own operators* rather than about a
payment file's beneficiaries. Three rules apply, and they are not the same rule:

- **CPF is redacted on the structured path.** `Cpf` is in the property-name token list — for a different
  reason from everything else there: leaking it does not let an attacker in, it exposes a private
  individual.
- **CPF is display and audit only.** Nothing branches on it and no lookup is keyed by it. It exists so
  an audit record identifies a legal person rather than a mailbox.
- **Email is masked for display, not redacted.** `maria@empresa.com.br` renders as
  `m***@empresa.com.br` in terminal narration and log lines, which outlive the job in scrollback. The
  full address stays recoverable from the job's approval snapshot — never mask something you also need
  to look up.

Both values are retained on the job's approval snapshot after the job reaches a terminal status, and
copied again onto every recorded approval row. That is the opposite call to the CNAB240 line detail,
which *is* purged — see [Retention](retention.md).

### The per-job approval page is not authenticated

**Anyone who can open a job's approval link can approve — or reject — as anyone in that job's frozen
pool.** The page at `/approve/{jobId}` and the route behind it (`POST /api/approvals/{id}`) require no
credential, and nothing verifies that the person selecting an address owns it.

- **Treat the approval URL as a capability.** Send it only to the people in the pool, through a channel
  you would use for the payment file itself, and tell them not to forward it — one forwarded link is
  enough for one person to satisfy a multi-person quorum.
- **The same URL can also stop a payment file.** The consequences are asymmetric — an unauthorised
  approval moves money, an unauthorised rejection delays it and costs a re-submission — which makes
  rejection the less dangerous half of the capability, not a harmless one.
- **Job ids are v4 GUIDs**, so the URL is not guessable in practice, and the route has its own
  rate-limit budget (`RateLimiting:Approval`, ten per minute per address by default).
- **Refusals are deliberately coarse.** A well-formed address not in the pool and a string that is not
  an address at all both return `approval.unknown-approver`.
- **Every decision records how weak its identification was** — `SelfDeclaredEmail`, plus the request's
  IP address and user agent. `IpAddress` is the connection's remote address: behind a reverse proxy
  that is the proxy, unless forwarded headers are configured.
- **Name and CPF on an approval row come from the frozen pool, never from the request.**
- **The startup banner warns on every approval-configured profile**, at every boot.

If a deployment cannot accept that exposure, keep the service off any network the approvers' browsers
can reach, or enable the [approver portal](#the-approver-portal-and-what-a-durable-link-is-worth) or
[Entra ID sign-in](#microsoft-entra-id-sign-in-mode-optional), both of which narrow it considerably.

### What the anonymous surface discloses, and what it withholds

The approval page shows the individual payments, because a total alone gives a human nothing to check.
That makes it a deliberate disclosure of beneficiary names and amounts to whoever holds the link. Three
rules bound it:

- **Masked: identification and account.** Beneficiary CPF/CNPJ is reduced to its check digits
  (`***.***.***-09`) and the destination account to its last digits with the branch omitted
  (`***149-4`) — enough to tell two same-named people apart and to see that an account has changed, not
  enough to identify or to pay anybody.
- **Unmasked, on purpose: name, amount, payment date, segment.** These *are* the judgement. Masking
  them would make the page useless — and a useless approval gate is a worse security outcome than a
  disclosive one, because it gets rubber-stamped.
- **Masking is not authentication and is not offered as one.** It bounds what a stranger with the link
  learns; it does not stop them learning it. Two accounts differing only in their leading digits mask
  identically.

Two capabilities are withheld from every approval surface — the anonymous page, the portal, and the job
page an approver may open:

- **No raw file download.** The rendered table is bounded and serves the decision; the file is a
  complete machine-readable dump of every beneficiary's CPF and bank account in a format built for bulk
  processing. `GET /api/jobs/{id}/output` requires operator credentials. Unmasking the table for an
  identified approver did **not** unlock the bytes.
- **No *anonymous* index of pending approvals.** The approver portal is an index, but it carries an
  authorization policy and lists only the jobs whose frozen pool names the person reading it. Nobody
  short of an operator can obtain the map of every payment file in the queue.

### The queue export is on the other side of that rule, not an exception to it

An approver can download the portal tab they are reading as an `.xlsx` workbook, behind the `Approver`
policy and its own rate-limit budget. The distinction from the withheld download is **the unit of what
leaves**:

- **The withheld raw download** is every beneficiary in one payment file — name, CPF/CNPJ, branch,
  account — in a format built for machines.
- **The queue export** is one row per payment *file*: file name, profile, status, payer name and
  CPF/CNPJ, grand total, payment and exclusão counts, largest single payment, timestamps, the approval
  tally, and the reader's own decision. **No payment line reaches it** — no beneficiary name, tax id,
  branch or account appears in the workbook at all.

It is scoped by the session and nothing else: there is no route value, query parameter or header
through which a caller could export as somebody else, and an operator's API key or dashboard cookie
does not open it. It is read-only and audited as one log line naming the list, the row count and the
approver's masked address.

:::warning
A workbook is a forwardable copy the product cannot recall. Job-level rows still name a company's
payment files, their amounts and its payer identification. The rate limit bounds how fast copies can be
made; nothing bounds what happens to one. Treat a workbook the way you treat the payment files
themselves.
:::

### The approver portal, and what a durable link is worth

When `ApproverPortal:Enabled`, each configured approver has a permanent personal URL, exchanged once
per device for a session cookie, opening a queue scoped to their pool memberships.

- **The link is a bearer credential with no expiry.** It is materially stronger than the per-job link
  in one respect — the holder cannot decide *as somebody else*, because the portal offers no address
  field — and weaker in another: it does not expire with a payment file.
- **Distribute it like a password.** One link per person, sent privately. The System page shows them as
  read-only fields to copy rather than clickable anchors.
- **Revoking one person** means removing them from every profile's `Approvers`; their token stops
  resolving at once. **Revoking everybody** means changing `ApproverPortal:LinkSecret`.
- **`ApproverPortal:LinkSecret` is the single most valuable secret this feature introduces.** Reading
  it is equivalent to holding every approver's link. Set it by environment variable, keep it out of
  source control, and rotate it if you suspect exposure. Minimum 32 characters, enforced at boot.
- **The session is its own authentication scheme.** An operator's API key or dashboard cookie does not
  open the portal, and an approver's session satisfies no operator policy — with one deliberate
  exception: `/jobs/{id}`, behind its own policy, reachable only for jobs whose frozen pool names them,
  and with the approval link, the pool's CPFs and Retry / Cancel / Download all withheld. Withholding
  the link there is a **quorum** control, not a disclosure one: it lets its holder approve as any pool
  member, so a member holding it would satisfy `MinimumApprovers = 3` alone.
- **The Decided tab is bounded** by `ApproverPortal:DecidedLookback` (90 days by default), which is
  what stops a stolen link from being worth a deployment's entire payment history.

### There is no REST approve endpoint

Approval state is **readable** over REST — `GET /api/jobs/{id}` carries an `approval` summary and
`GET /api/jobs/{id}/approvals` returns the frozen pool and the decision list, both behind the ordinary
API-key-or-cookie policy. **No *authenticated* REST route records a decision**, and that asymmetry is a
decision rather than a gap in the surface. Behind the API key it would be *worse* than the unauthenticated
page: the key already sits in an ERP's configuration, a deploy pipeline and a production settings file, so
"an approver decided" would mean "something holding the operator credential decided".

The one route that does record a decision, `POST /api/approvals/{id}`, is anonymous and carries the same
capability the approval link does. Enabling the second factor **withdraws it entirely** rather than
authenticating it, for the same reason — see [below](#the-second-factor-and-what-it-is-worth).

### The second factor, and what it is worth

`ApproverSecondFactor:Enabled` adds a TOTP prompt before an approver's decision, once per verification
window per browser session. What it closes is precisely the **unattended session**: a machine left signed
in, or a portal link read by somebody who should not have it, no longer decides on its own. The window is
absolute and belongs to the browser rather than to the person, which is what makes that true.

Three limits to hold onto, because each is a claim this control does **not** support:

- **It does not make an operator unable to be an approver.** TOTP is symmetric, an operator can read every
  approver link and reset every enrolment, so an operator can still be any approver. Binding an approver
  to the CPF in the frozen pool via an ICP-Brasil certificate remains outstanding, and the second factor
  must not be described as having closed that.
- **It does not narrow what a forwarded link discloses.** With the factor on, an unidentified reader of
  `/approve/{jobId}` gets the same read-only view with the same masking as before — only the *capability*
  to decide is withheld.
- **It withdraws `POST /api/approvals/{id}` entirely** rather than gating it, because only a browser
  session can carry a proven presence. See [Approvals](approvals.md#proving-it-is-you).

**`ApproverSecondFactor:SeedSecret` is a secret with no rotation story.** It is the key every approver's
authenticator seed is encrypted at rest under (PBKDF2-HMAC-SHA256 → AES-256-GCM), minimum 32 characters,
and it is required whenever the factor is on — the store may be the customer's own DBMS, so seeds are
never held in the clear there. Seeds are random per approver rather than derived, so holding the first
factor cannot mint the second. **Losing or changing it means every approver enrols again**, which is a
coordinated operation rather than a config edit. Supply it by environment variable and register it with
the same care as `ApproverPortal:LinkSecret`.

### An approval is bound to bytes

Immediately before signing, the staged copy is re-hashed and compared against the hash recorded at
parse time. A mismatch fails the job with `approval.content-changed` — never a silent re-parse, never a
proceed. Without it, "these people authorised this payment file" would stop being true at the exact
moment a signature makes it authoritative.

## REST error envelope — what is and is not exposed

Every error response carries a stable machine-readable slug in the `code` extension (e.g.
`job.not-found`, `upload.too-large`, `rate-limited`, `auth.invalid-credentials`, `internal`). See
[REST API](rest-api.md) for the full table.

In `Production`:

- The error customizer strips `detail`, `instance`, and any extension other than `code`, `traceId`,
  `requestId`, `errors`. No stack traces escape to clients.
- `code = "internal"` is stamped on framework-generated 500s, `code = "auth.invalid-credentials"` on
  401s, `code = "rate-limited"` on 429s.

In `Development`, full details (including exception messages) flow through to make debugging
tractable — **never run with `ASPNETCORE_ENVIRONMENT=Development` on a production host.**

## Network exposure

- The service listens on plain HTTP on `0.0.0.0:8080` by default — terminate TLS at a reverse proxy
  (nginx, IIS, Traefik).
- `Hosting:RequireHttps = true` activates the in-process HTTPS redirect; pair it with a Kestrel
  certificate configuration.
- The ready-summary banner at startup prints `https redirect = on/off` so a mistyped key shows up
  immediately.
- `/api/metrics` is gated by the same policy by default (`Metrics:RequireApiKey = true`). Set it
  `false` only when the Prometheus scraper sits inside the trust boundary.
- Rate limiting is on by default (`RateLimiting:Enabled = true`). Disable only for closed-network
  installs.

### Whose client address the product believes

Two things act on the client address, so behind a proxy or load balancer this is a security setting rather
than a detail: the **rate-limit partition**, and the **address recorded on every approval** — one of the
compensating controls for the anonymous approval route. Behind a proxy with no forwarded-header handling,
every caller arrives from one address: the per-client budget becomes a single shared one for the whole
world, and the recorded address says nothing about who decided.

`Hosting:ForwardedHeaders:Enabled = true` fixes that, and **requires a trust set** — one of
`TrustAnyProxy`, `KnownProxies` or `KnownNetworks`, or the boot is refused rather than defaulting to the
wide answer. Two rules worth stating plainly:

- **`TrustAnyProxy = true` is correct on Azure App Service and dangerous on a reverse proxy.** App
  Service's front end has no stable address to list; a reverse-proxy deployment that trusts anyone means
  whoever can reach Kestrel directly can name themselves any client address. Lock the origin if you use
  it — see [Azure App Service](azure.md#inbound--front-door-in-front-of-the-app).
- **Setting the framework's `ASPNETCORE_FORWARDEDHEADERS_ENABLED` alongside it is refused at boot.** Each
  adds its own processing, so headers would be handled twice and a `ForwardLimit` of one would silently
  believe two hops.

The ready-summary banner prints `forwarded headers = …` naming the trust set rather than only `on`. Under
[cluster mode](high-availability.md#rate-limit-budgets-are-per-instance-so-the-effective-limit-is-n),
remember that each instance enforces its own budget, so the effective per-client limit is ×N.

## Forensic posture

- **Audit trail.** Every state transition writes a job-history entry to the operational database;
  every pause/resume writes a system event. These are durable across restart and survive uninstall
  (unless `--purge` is used).
- **Per-request correlation.** Error responses include `traceId` and `requestId`; the same IDs appear
  in the file logs so client-side failures can be traced to the line they generated.
- **Backup before upgrade.** Always back up `db/bulksigner.db` before an upgrade — the migration runs
  at startup and is one-way.

---

**Next:** [Operations](operations.md) — day-2 operations and the job lifecycle.
**Previous:** [Certificates](certificates.md).
