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

Since 2.1.0 signing profiles live in the operational store, so on a deployment that uploads
certificate material through the dashboard the store may also hold **a private key** — encrypted, under
a key held outside it. See [the signing profile secrets key](#the-signing-profile-secrets-key-signingprofilesecretskey).

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
| `CloudHub:ApiKey` | Lacuna CloudHub (`CloudHub:Endpoint`, Lacuna's public instance by default) — only when an approver signs with a cloud certificate. Nothing probes it at boot or on readiness. |
| `Branding:CustomerLogo:Blob` | `*.blob.core.windows.net` — one read at boot. |
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
`/api/ready`, `/login`, `/api/auth/login`, `/api/auth/entra-login`, `/api/auth/logout`,
`/access-denied`, `/api/culture` and `/branding/customer-logo` are anonymous, plus the approval surfaces
described [below](#the-per-job-approval-page-is-not-authenticated). Every endpoint states its posture
explicitly, so a route cannot arrive public by accident.

`/branding/customer-logo` serves the customer logo the sign-in and approver pages show before anybody
has authenticated: one image this instance read at boot, and nothing about any job. An SVG logo is
served under `Content-Security-Policy: default-src 'none'`, so a script the file carries cannot run even
when somebody opens the URL directly. With no logo loaded the route answers `404`
(`branding.customer-logo-not-available`).

### Readiness: the verdict is anonymous, the diagnosis is not

:::warning Changed in 2.6.0 — `/api/ready` no longer carries `detail`
The anonymous probe used to carry, per check, prose written for the operator who would fix it: the SQL
Server host and catalogue, every input folder's path or share URL, the storage SDK's own failure
sentence, a degraded certificate's path or vault endpoint. None of it was a credential; together it was a
map of the deployment, readable by anyone who could reach the port. A monitor that parsed `detail` moves
to `/api/ready/details` and adds the API key header.
:::

- **`GET /api/ready`** answers with the verdict alone: `ready`, and each check's `name` and `ok`. The
  `detail` field is absent, not null, so an orchestrator reading the status code is unaffected, and
  whoever watches it still sees *which* row went red.
- **`GET /api/ready/details`** carries the same report with every check's detail, behind the API key or
  an operator session, with the same 200 / 503 rule.
- **`Readiness:RequireApiKey`** (default `false`) puts `/api/ready` itself behind the same policy, for a
  host whose prober can carry `X-API-Key` or that nothing probes. It is off by default, unlike
  `Metrics:RequireApiKey`, because the Azure App Service health check cannot carry the key and reads a
  `401` as unhealthy. It changes who may ask, never what is answered; the ready-summary banner's `ready`
  and `metrics` rows say `(anonymous)` or `(API key)`, so a key that did not bind is visible at boot.
- Because the anonymous body used to be, for whatever polled it, the record of a transient fault, a
  check's **change** of verdict is written to the durable log once per change — `went red` with its
  detail at Warning, `recovered` at Information — never per poll.

Nothing on either route is written for a public audience. Keep the probe off any network beyond your
monitoring whether or not `Readiness:RequireApiKey` gates it.

### The dashboard is fenced twice: at the endpoint, and inside the circuit

:::note Fixed in 2.2.1
Before 2.2.1 an anonymous browser could reach the operator pages by navigating *inside* the dashboard,
where the endpoint authorization was never consulted. Upgrade any 2.0.x or 2.1.x deployment whose
dashboard is reachable by people who are not operators.
:::

The policy on a page's endpoint is what turns a direct `GET /backup` into a redirect to `/login`. It is
not what protects the page once a browser holds a live dashboard connection: every page is interactive,
and an internal navigation — a click on a link, or history pushed from the browser console — resolves
inside that connection *without an HTTP request*, so the endpoint is never asked. Three mechanisms hold
the second fence, and each is needed:

- **The router honours the page's policy.** Every navigation is authorized against the connection's
  identity. A refusal reloads the page through HTTP, so the server answers exactly as it would a direct
  request — a challenge to `/login`, or with Entra on a forbid to `/access-denied` or to the portal. The
  refusal is logged at Warning with the path and the scheme names, and nothing else.
- **The connection knows who you are.** It carries the browser session — the operator's, the approver's
  or the Entra one — and the pages decide.
- **Being signed in is not being an operator.** With Entra off, each operator policy asserts which scheme
  issued the identity, so an approver's portal session — legitimately admitted to `/jobs/{id}` — does not
  satisfy the operator pages by being merely authenticated. With Entra on, the role checks already did
  this.

The drawer and the button that opens it render for operators only, so an approver on the one page both
audiences share is not offered operator destinations. *Sign out* — the account menu's, and the one in
the approver portal's header — ends whichever browser session is present, the approver's link session
included. A link session lands on `/approvals/link-required`, which names the way back in; every other
session lands on `/login`.

One caveat is deliberate and worth knowing: the identity is captured when the dashboard connection
opens and is not re-validated while it lives, so a session that expires mid-connection keeps the page it
is on until the next full load. The next HTTP request, and every REST call, sees the expiry at once.

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

The key must be at least 16 characters; the service refuses to start with a shorter value — and with
none at all: since 2.3.1 the shipped `appsettings.json` carries no placeholder key, so a deployment that
never set `Auth:ApiKey` refuses to start naming it. Use a random string from a CSPRNG — for example
`openssl rand -base64 32` on Linux/Mac, or on PowerShell:

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

### The Web PKI licence is not a secret (`WebPki:License`)

The one licence in the product that is **not** handled as a secret, and deliberately so. Lacuna Web PKI
runs in an approver's browser when they sign an approval, and the licence is sent there in clear: it is
bound to the deployment's domains, not to a bearer, and possession of it lets nobody sign anything. So
it is given to neither redaction layer, it may sit in `appsettings.Production.json` beside the
non-secret keys, and no surface masks it. The ready-summary banner and the System page report it
configured-or-not. The file ACLs on this page are still worth having for it, but as **integrity** rather
than confidentiality: a licence swapped for another deployment's would send approvers to a page whose
Web PKI refuses to run. The key itself: [Configuration](configuration.md).

## Certificate-source secrets

:::warning Changed in 2.1.0 — certificate configuration is a seed
Signing profiles, and the certificate each one signs with, now live in the operational store.
`Signing:Certificate` and `Signing:Profiles[]` are read **once**, on the first boot against an empty
profile table, and ignored afterwards; from then on a certificate — and its password or application
secret — is entered on the profile's page in the dashboard and stored **encrypted** under
[`Signing:ProfileSecretsKey`](#the-signing-profile-secrets-key-signingprofilesecretskey). The rules below
still govern what the seed may contain, and every secret-bearing key in it stays registered with log
redaction, so an old deployment's leftover password still scrubs after it stops being used.
:::

### PFX password

PFX passwords behave like other config secrets — set in `Signing:Certificate:Pfx:Password`, or
override via `Signing__Certificate__Pfx__Password`. The PFX file itself sits at the path in
`Signing:Certificate:Pfx:Path`; secure it with restrictive file ACLs.

### PKCS#11 PIN — environment variable only

By design, the PKCS#11 PIN is **never accepted in config files**. The validator refuses to start if a
literal `Pin` key appears under `Signing:Certificate:Pkcs11`. The same rule applies inside every
entry of `Signing:Profiles[]`, and to stored profile data. The PIN is read at runtime from the
environment variable named by `Signing:Certificate:Pkcs11:PinEnvVar` (default `BULK_SIGNER_PKCS11_PIN`),
and multiple profiles can either share the same env var or set distinct ones via `PinEnvVar` per
profile. The dashboard's profile page shows the *name* of that variable, never a value.

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

### Lacuna's test root, and why production refuses it (`Signing:TrustLacunaTestRoot`)

A release build trusts the ICP-Brasil roots. `Signing:TrustLacunaTestRoot = true` (added in 2.3.0,
off by default) widens that trust set with the **Lacuna test PKI root** — the issuer of the Turing /
Fermat test certificates — plus the PKI SDK's Windows trust set, so a homologation can run the
published image with test certificates instead of a real e-CPF per approver. Three things to know:

- **It is refused at boot when `ASPNETCORE_ENVIRONMENT` is `Production`.** A production host that
  inherited the setting therefore refuses to start, naming the key, rather than trusting a root anyone
  can download. On a homologation host, set the environment name to `Staging` (or any other name).
- **It is one trust set for the whole host.** Every profile's key at sign time, every verification
  afterwards and every approver's certificate are held to the same roots.
- **It is loud.** The ready-summary banner's `trust set` row names it, and the console and the durable
  log carry a warning at every boot. The key is not a secret.

See [Certificates](certificates.md) for the full description.

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
Downloads are streamed through the application, so `GET /api/jobs/{id}/output` — and the multi-job
signed-output archive, `GET /api/jobs/archive` — have the same response shape, the same authorization
and the same problem codes on a share as on local disk.

## The operational store connection string

Under `Database:Provider = Sqlite` — the default — `ConnectionStrings:Default` names a file and carries
no credential; the protection is the file ACL on `db/`, [below](#db-deserves-the-same-care-as-keys-and-the-product-does-not-set-it-for-you).
Under `SqlServer` the same key becomes **the whole of the credential**.

**Prefer a shape with no secret in it.** The three are not equivalent:

| Shape | Secret held by the host | Blast radius if the host is compromised |
|-------|-------------------------|------------------------------------------|
| Managed identity (`Authentication=Active Directory Managed Identity`) | **None** | The identity's own database grants, and nothing portable |
| Windows integrated (`Integrated Security=True`) | **None** | What that principal is granted, and only from a domain-joined host that can obtain a ticket |
| SQL login, or Entra service principal (`User ID` + `Password`) | The password | The database, from anywhere that can reach the server, until the password is rotated |

The boot refusals quote the data source and never the string, and the key is registered at both
redaction layers. The ready-summary banner, the console and `/api/ready/details` name the store as
engine, server and database — never by quoting the connection string.

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
envelope — including why, with encryption on, the password is also the only way back to a file an
approver rejected.

## The signing profile secrets key (`Signing:ProfileSecretsKey`)

**A deployment whose profiles carry a secret needs it.** Signing profiles are rows in the operational
store, and the secrets they carry are encrypted under a key derived from this one. A deployment whose
profiles carry no secret at all — a passwordless PFX, a PKCS#11 token whose PIN is an environment
variable, a Windows store certificate — needs no key and is never asked for one.

Five values in the store are encrypted under it: a **PKCS#12 password**, an **Azure Key Vault
application secret**, **uploaded PKCS#12 bytes**, and a signing material blob's **service-principal
secret** and **account key**. PBKDF2-HMAC-SHA256 once at startup, then AES-256-GCM per value with a
random nonce — the same vocabulary as [BSENC v1](encryption.md). Set it via `Signing__ProfileSecretsKey`
and keep it out of source control.

**The key is held outside the database, and that is the whole of the design.** What it protects is
*in* the database: uploaded certificate material lives in the operational store rather than on the host
filesystem, because a clustered instance's disk is ephemeral and never shared. So the store may hold
private keys, and a copied database file or a leaked connection string must not amount to a stolen
signing credential. A key stored beside its ciphertext would deliver none of that — which is also why
the session key ring is deliberately not reused: under `Cluster:Enabled` that ring is itself rows in
this same store.

**The host refuses to start when stored profile secrets exist and the key is absent** — only that
pair, which describes a host that would come up unable to honour what it says it protects. The refusal
names the key and the environment variable, on the console and in the durable log.

**The profile import refuses on the same ground, one moment earlier.** On the first boot that seeds
profiles from configuration, a profile carrying a password, an application secret or a blob credential
is refused rather than written in the clear — naming the key, the environment variable, and which
profiles carry a secret. This is the one upgrade step 2.1.0 may need: set the key, start again, and the
import completes. A deployment with no profile secret never meets it.

**A key that is set but wrong degrades the profiles it cannot read, and the host starts.** A key that
has been **rotated, restored from another deployment, or mistyped** does not open the envelopes already
in the store. Each affected profile is reported as degraded — on its page, in the boot banner, in the
durable log and as a readiness row; a job routed to one fails with `profile.degraded`; and every profile
carrying no secret keeps signing. **There is no recovery of the value itself**: put the original key
back if it exists anywhere, or re-enter that profile's certificate material and restart. See
[Troubleshooting](troubleshooting.md).

**Losing it means re-entering every affected profile's certificate material.** No escrow, no second
key, no recovery path, and none intended — a secret that could be read without this value would not have
been protected by it. Rotating has exactly the same effect as losing, and the deployment signs nothing on
the affected profiles in between. Back it up wherever the encryption password,
`ApproverPortal:LinkSecret` and `ApproverSecondFactor:SeedSecret` are backed up, and treat changing it as
an operation you schedule rather than one you try.

How the dashboard handles these values:

- **A secret reads as *configured* or *not configured*, never as a value** — on the profile page and
  over `GET /api/profiles`, which carries no secret, credential or uploaded material at all.
- **A secret typed into a profile form is registered with log redaction before the row commits**, so
  there is no window in which it is stored and unscrubbed. One shorter than 12 characters is refused at
  the save, because the literal-value scrub cannot mask a value that short. Leaving a password field
  blank keeps what the store holds.
- **The profile pages take a browser session, not a bare API key.** They show a standing approver pool
  with CPFs and a certificate's coordinates, which the REST route withholds; refusing the header-only
  read keeps a key replayed out of a proxy log from reading them in one step. It is a narrowing rather
  than a boundary — `POST /api/auth/login` takes the same key and returns a session.

Three things it is **not**:

- **Not a protector of the PKCS#11 PIN.** That stays
  [environment-variable only](#pkcs11-pin--environment-variable-only), never stored — and a PIN present
  in stored profile data is refused exactly as one present in configuration is.
- **Not a replacement for the certificate-source secrets in configuration.** Referencing a certificate
  by local path or by a signing material blob stays fully supported.
- **Not something a wrong value silently tolerates.** Decryption is authenticated, so a rotated key, an
  edited row, or a value moved between columns fails loudly rather than yielding a plausible-looking
  password.

### What a degraded profile discloses

A profile whose certificate will not open is reported on four surfaces, one of which is readiness. The
anonymous `/api/ready` carries the row's name — `signing-profile:<name>` — and `ok: false`, and nothing
else, because whoever watches the orchestrator has to see *which* row went red and the name is the one
thing on the row an operator chose. The authenticated `/api/ready/details` carries the reason, which
routinely names a PKCS#12 or PKCS#11 module path, a vault endpoint or a thumbprint. A profile whose
stored **secrets** would not decrypt reaches the same row; that reason names `Signing:ProfileSecretsKey`
and the kind of value involved, and carries no path and no credential. Every reason passes through the
literal-value scrub, so a password, application secret, blob credential or the profile secrets key is
masked if a provider ever echoes one into a message.

## File ACLs per target

| Target | Path | Mode | Owner |
|--------|------|------|-------|
| Linux | `/etc/bulksigner` | `0750` | `bulksigner:bulksigner` |
| Linux | `/etc/bulksigner/bulksigner.env` | `0640` | `bulksigner:bulksigner` |
| Linux | `/etc/bulksigner/appsettings.Production.json` | `0640` | `bulksigner:bulksigner` |
| Linux | `/var/lib/bulksigner` | `0750` | `bulksigner:bulksigner` |
| Linux | `/var/lib/bulksigner/db` | `0700` — **set it yourself**, see below | `bulksigner:bulksigner` |
| Windows | `C:\ProgramData\Lacuna\BulkSigner` | Inherits the `ProgramData` ACL, plus a `Modify` rule for `NT SERVICE\LacunaBulkSigner` — see below | `NT SERVICE\LacunaBulkSigner` (effective) |
| Docker | `./config/appsettings.Production.json` | OS-dependent on host | UID 1654 reads as a `:ro` mount |
| Docker | `./data/db` on the host | `0700`, owned by UID 1654 — **set it yourself** | UID 1654 |

The Linux install script creates the system user, sets the ACLs, and never touches `/opt/bulksigner`
after the initial install (binary is `root:root`, mode `0755`). The Windows install script **adds** one
`Modify` rule for the virtual account `NT SERVICE\LacunaBulkSigner` to the data tree and removes
nothing: whatever `C:\ProgramData` grants is still in force beneath it, and on a default installation
that includes **`BUILTIN\Users` with read access**. Narrow it yourself, as below.

### `db/` deserves the same care as `keys/`, and the product does not set it for you

Under `Database:Provider = Sqlite` — the default — the whole operational store is one file under `db/`,
and since signing profiles moved into it that file may hold **an uploaded PKCS#12's private key**, plus
every stored PKCS#12 password, Key Vault application secret and blob credential. It stopped being only a
record of what happened and became part of the signing identity's custody chain.

**Two facts to hold together.** The values in it are encrypted, and `Signing:ProfileSecretsKey` is
deliberately held outside it — so a copied database file alone is not a usable signing credential. But
read access is still every payment's beneficiaries, every approver's CPF and email, and one half of a
two-part secret; and the two halves are routinely captured together, because the key is an environment
variable on the same host.

**Linux: the boot creates `db/` at the process umask — not `0700`.** Under the usual `0022` umask it
lands at `0755`, and what actually stops anyone reading it is that the `0750` parent
`/var/lib/bulksigner` cannot be traversed. That is protection by containment rather than by intent, and
one `chmod` on the parent is all it takes to lose it:

```bash
chmod 0700 /var/lib/bulksigner/db && chown -R bulksigner:bulksigner /var/lib/bulksigner/db
```

**Windows: check before assuming.**

```powershell
icacls C:\ProgramData\Lacuna\BulkSigner\data\db
```

If `BUILTIN\Users` or `Everyone` appears, every interactive account on that host can read the
operational store — the signed-job history, approver names, CPFs and email addresses, and the encrypted
profile secrets. Cut inheritance and keep only the three principals that need it:

```powershell
icacls C:\ProgramData\Lacuna\BulkSigner\data\db /inheritance:r `
  /grant "NT SERVICE\LacunaBulkSigner:(OI)(CI)M" `
  /grant "SYSTEM:(OI)(CI)F" /grant "Administrators:(OI)(CI)F"
```

Apply the same to `data\keys`, the session key ring, which has always deserved it.

**Docker is the case where containment does not hold**, because the bind mount's permissions are the
host's and no unit file governs them. Set them on the host, and remember that anything with read access
to that directory — a backup agent, another container mounting the same path, a `docker cp` — has read
access to the store.

**Then look past the file.** Under `SqlServer` there is no `db/` at all and this becomes your DBMS's
concern, on the same footing: [the connection string *is* the credential](#the-operational-store-connection-string).
And on every provider, a [database backup](retention.md#backup-discipline) is **neither encrypted nor
BSENC** — so a backup destination inherits everything above, and an uploaded private key travels in it.

## Log redaction — two layers

Durable structured logs flow through a redacting pipeline. Secrets are scrubbed at two complementary
layers:

1. **Property-name redaction.** Every log event's properties are walked and values whose name
   contains `Password`, `Pin`, `License`, `ApiKey`, `Secret`, `AccountKey`, `Salt`, `Token`,
   `ConnectionString`, `Authorization`, `Cookie` or `Cpf` (case-insensitive) are replaced with `***`.
   Matching is on *substring*, so `AppSecret` and `ClientSecret` are both caught by the `Secret` token.
   This catches the structured path:
   ```
   logger.Information("Loaded {ApiKey}", apiKey);
   // → "Loaded ***"
   ```
2. **Literal-value redaction.** At startup the service loads the literal text of every configured
   secret value (PKI license, the API key, the Lacuna Signer API key, the CloudHub API key, PFX
   passwords, Azure Key Vault client secrets, blob, Azure Files, backup-destination and table-log-sink
   credentials, the Entra ID client secret, the approver-portal link secret, the second-factor seed
   secret, the signing profile secrets key, the encryption password, the PKCS#11 PIN, the
   operational-store and Application Insights connection strings) and scrubs those exact strings from
   every rendered log line. Secrets declared on *every* signing profile are collected, not just those
   in the global `Signing:Certificate` block, and a secret saved on a profile page joins the list the
   moment it is saved. This catches the stray-interpolation path:
   ```
   logger.Error($"Failure with config: {appSettingsBlob}");
   // → "Failure with config: { … Auth.ApiKey: ***, Signing.PkiSdkLicense: ***, … }"
   ```
   Literal-value redaction skips secrets shorter than 12 characters to avoid pathological matches.

Both file and console output pass through the same redaction pipeline. The Web PKI licence is
deliberately [not a secret](#the-web-pki-licence-is-not-a-secret-webpkilicense) and is not masked.

:::warning Fixed in 2.1.0 — approver links were written to the durable log
Every log entry written while serving a request carries the request path, and on
`/approvals/link/{token}` that path ends in the approver's permanent bearer token — so from the approver
portal's first release until 2.1.0, successful link exchanges recorded whole tokens in the log files
and, under `Logging:AzureTable`, in a table nothing prunes. The redaction now masks that path's secret
segment. **Anything already written stays written**, and the token cannot be rotated per person: if your
logs from before 2.1.0 have been readable by anyone who should not be able to approve payment files,
treat those links as disclosed and change `ApproverPortal:LinkSecret`, which reissues every link at once.
:::

**Both layers sit on the logging path, so everything that shows you a failure somewhere else scrubs it
itself.** Masked rather than withheld, because these are the only places you learn why something went
wrong without opening a log file:

| Where you read it | Worth knowing |
|---|---|
| **The dashboard** — a page's refresh-failure tooltip, a red snackbar after a Rescan, Retry or Cancel that failed, a watched folder's last error on the Input page, the backup destination's unreachable reason | The provider's own sentence, with every configured secret masked to `***`. A folder's last error is also `lastError` on `GET /api/system/folders` |
| **Console narration** — which a Windows Service, a systemd unit or a container hands to Event Viewer, journald or `docker logs` | Every line, including the boot summary panels. As durable a place as the log file |
| A **job's failure text** in its timeline, on the job page and over `GET /api/jobs/{id}` | Masked before it is stored, so the audit row itself is clean rather than only its rendering |
| The **`/api/ready/details` rows** and the same details on the System page | Where an Azure table or SQL Server credential problem surfaces after a rotation |

What that scrub can catch is bounded exactly as the durable log's is: it masks values the host was
configured with, so a credential you have never given the product is one it cannot recognise. One place
deliberately shows you *less*: a connection string the product cannot parse is reported as unparseable
without quoting it, because the fragment it would quote is whatever you typed.

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

**On an approval recorded by signing, the row also records the certificate**: the subject and issuer,
the serial number, the SHA-256 thumbprint, the CPF the certificate carries and, on a company's
certificate, its CNPJ — all empty on a clicked decision. They answer a different question from the pool:
the pool says who was *permitted* to decide, and the name and CPF still come from it; the certificate
says which *key confirmed* it. Everywhere the certificate's CPF leaves the row — the timeline, the
operational event, the log, and the `certificate` object on `GET /api/jobs/{id}/approvals` — it is masked
to its check digits, **inside the subject too**, since an ICP-Brasil common name often spells
`NAME:CPF`. The CNPJ is never masked, since it names a company. The signature bytes are not on the row:
the delivered file in `output/` is the proof.

### The per-job approval page is not authenticated

**Anyone who can open a job's approval link can approve — or reject — as anyone in that job's frozen
pool.** The page at `/approve/{jobId}` and the route behind it (`POST /api/approvals/{id}`) require no
credential, and nothing verifies that the person selecting an address owns it.

- **Treat the approval URL as a capability.** Send it only to the people in the pool, through a channel
  you would use for the payment file itself, and tell them not to forward it — one forwarded link is
  enough for one person to satisfy a multi-person quorum. The product sends no mail and, since 2.9.0,
  the operator's job page no longer hands the link out; an approver with portal access reaches a parked
  file from their own queue.
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
- **On a job whose frozen signer set includes the approvers, an approval is a signature, not a click.**
  The anonymous route refuses a click on such a job with `approval.signature-required`; the approver
  signs from the portal, or from this page under an identified session.

If a deployment cannot accept that exposure, keep the service off any network the approvers' browsers
can reach, or enable the [approver portal](#the-approver-portal-and-what-a-durable-link-is-worth),
[Entra ID sign-in](#microsoft-entra-id-sign-in-mode-optional), the
[second factor](#the-second-factor-and-what-it-is-worth) or approver signatures, each of which narrows it
considerably.

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
  processing. `GET /api/jobs/{id}/output` requires operator credentials. So does the operator's
  **signed-output archive** — `GET /api/jobs/archive`, one ZIP of several `Completed` jobs' signed files,
  offered from the Jobs page — which no approver credential satisfies: it is the same files the operator
  already collects from `output/`, several at a time, and changes nothing about who may have the bytes.
  Unmasking the table for an identified approver did **not** unlock the bytes.
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

The **operator's** export — `GET /api/jobs/export`, the [Jobs page](dashboard.md#jobs--jobs)'s *Export
to Excel* — is the same shape on the other credential: one row per job, every value off the job row, no
payment line, behind the operator policy and offered on no approval surface. It changes the container of
a list the operator already reads, not who may have it.

:::warning
A workbook is a forwardable copy the product cannot recall. Job-level rows still name a company's
payment files, their amounts and its payer identification. The rate limit bounds how fast copies can be
made; nothing bounds what happens to one. Treat a workbook the way you treat the payment files
themselves.
:::

### The approver portal, and what a durable link is worth

When `ApproverPortal:Enabled`, each approver in a pool has a permanent personal URL, exchanged once per
device for a session cookie, opening a queue scoped to their pool memberships.

- **The link is a bearer credential with no expiry.** It is materially stronger than the per-job link
  in one respect — the holder cannot decide *as somebody else*, because the portal offers no address
  field — and weaker in another: it does not expire with a payment file.
- **Distribute it like a password.** One link per person, sent privately. The System page shows them as
  read-only fields to copy rather than clickable anchors.
- **A pool is edited from the profile's page and nowhere else.** No route writes one, because a key
  that can add an address to a payment-approval pool is a key that can approve payments. Since profiles
  live in the operational store, editing `Signing:Profiles[].Approval.Approvers[]` in configuration
  revokes **nobody** — that section is an inert seed after the first boot.
- **Revoking one person** means removing them from every profile's approver pool on the profile page.
  Resolution reads the pools as the store holds them at that moment, so their token stops resolving at
  once, with no restart. Disabling a profile revokes nobody — only removal does. **Revoking everybody**
  means changing `ApproverPortal:LinkSecret`.
- **A session already exchanged is a separate credential that neither of those reaches.** It lasts
  `ApproverPortal:SessionLifetime` (30 days by default) on a **sliding** clock, so an approver still
  using the portal is never timed out, and changing `ApproverPortal:LinkSecret` revokes links, not
  cookies. What such a session can still decide stays bounded by each job's frozen approval snapshot. To
  end one sooner, shorten the session lifetime or rotate the [session key ring](#the-session-key-ring-and-where-it-lives)
  — which signs operators out too.
- **`ApproverPortal:LinkSecret` is the single most valuable secret this feature introduces.** Reading
  it is equivalent to holding every approver's link. Set it by environment variable, keep it out of
  source control, and rotate it if you suspect exposure. Minimum 32 characters, enforced at boot.
- **The session is its own authentication scheme.** An operator's API key or dashboard cookie does not
  open the portal, and an approver's session satisfies no operator policy — with one deliberate
  exception: `/jobs/{id}`, behind its own policy, reachable only for jobs whose frozen pool names them,
  and with the pool's CPFs and Retry / Cancel / Download all withheld. Since 2.9.0 that page renders no
  per-job approval link for **any** reader; it was once withheld from approvers as a **quorum** control,
  because it lets its holder approve as any pool member.
- **The Decided tab is bounded** by `ApproverPortal:DecidedLookback` (90 days by default), which is
  what stops a stolen link from being worth a deployment's entire payment history.

### There is no REST approve endpoint

Approval state is **readable** over REST — `GET /api/jobs/{id}` carries an `approval` summary and
`GET /api/jobs/{id}/approvals` returns the frozen pool and the decision list, both behind the ordinary
API-key-or-cookie policy. On a decision recorded by signing, a `certificate` object carries the subject,
issuer, serial number and thumbprint, the certificate's CPF masked and its CNPJ whole; `null` on a
clicked one. **No *authenticated* REST route records a decision**, and that asymmetry is a decision
rather than a gap in the surface. Behind the API key it would be *worse* than the unauthenticated page:
the key already sits in an ERP's configuration, a deploy pipeline and a production settings file, so "an
approver decided" would mean "something holding the operator credential decided".

The one route that does record a decision, `POST /api/approvals/{id}`, is anonymous and carries the same
capability the approval link does. Enabling the second factor **withdraws it entirely** rather than
authenticating it, for the same reason — see [below](#the-second-factor-and-what-it-is-worth).

A **signed** approval is on the same side of the line. No route accepts a signature: the signature is
made through the browser, from the portal or the per-job page under an approver session, and the only
browser route involved is the cloud signature callback below.

### The cloud signature callback is a GET that mutates, deliberately

When an approver signs with a certificate a cloud provider holds, through Lacuna CloudHub (added in
2.7.0), the provider sends their browser back to `GET /approvals/cloud/return?state=…&session=…`, and the
whole signed approval runs in that request. A provider redirect can only be a `GET`, so the route
mutates on one, and four things stand in for what a `POST` would have given:

- **The route is behind the approver session** — the portal's cookie or an Entra approver, never an API
  key and never anonymous. Both cookies are `SameSite=Lax`, which is why a top-level navigation back from
  the provider carries them. Off the session the route answers the approver login path **bare**, with no
  return address, so the `session` value never lands in the browser's history.
- **The `state` value is a random token minted when the approver chose the cloud**, stored on the
  pending request and nowhere else, and matched against a request that must name the same approver the
  cookie does. A forged link carries the victim's cookie and not a token their request issued; a stolen
  token carries no cookie. Either is one coarse refusal to the portal with nothing recorded — the portal
  says once that the signature could not be matched (`?cloud=unmatched`, never the reason). The four
  reasons — unknown, another approver's, already consumed, older than fifteen minutes — are told apart
  in the log only. The request is claimed before the signature runs, so a replayed callback is refused
  rather than run twice.
- **The `session` value is a bearer for the CloudHub session** — whoever holds it can sign with the
  certificate the provider opened — so no error response echoes the request's address and neither query
  value reaches a log line.
- **`CloudHub:ApiKey` is a secret**, unlike the Web PKI licence: a bearer for every session this host
  creates. Set it through the environment variable on a service install; it is registered with both
  redaction layers. See [Configuration](configuration.md).

The CloudHub session is created under the CPF frozen for the approver on that file — the approver types
no CPF and cannot open a session under anybody else's from this product — and the certificate that comes
back is checked exactly as a browser's is: chain, validity, revocation, CPF present, CPF the frozen
member's, all before anything is signed. The outcome is shown once on the page the approver left from;
there is no result page and no outcome in a URL.

:::note Fixed in 2.14.0
When reading a cloud certificate failed, the reason logged at Warning, written to the table log sink
and shown to the approver used to quote the request address — whose query is the CloudHub session id,
a bearer for signing under the approver's cloud certificate until CloudHub expires it. The reason now
names the call by its path and status, and is scrubbed of the session id wherever CloudHub's own words
might echo it.
:::

### A bulk approval's CloudHub session is parked, encrypted, for minutes

A batch approved with a cloud certificate (added in 2.14.0) returns through the same callback, with the
same refusals, but the callback **signs nothing**: it stores the `session` value on the approver's
pending batch and redirects to the portal, which runs the batch. For those minutes the store holds a
bearer that can sign under the approver's cloud certificate, and three things bound it:

- **It is encrypted under the session key ring** the approver cookies already ride, with a purpose of its
  own. Off `Cluster:Enabled` the ring is in `keys/`, outside the database file, so a backup or a copied
  database taken in those minutes does not carry what opens it. Under cluster mode the ring is rows in
  the same store, and a copy of the store opens it — the same copy already forges an approver's cookie.
- **It is cleared by the claim that takes it.** The portal claims the batch with one update that
  succeeds for exactly one caller and empties the column in the same write; from then on the session
  lives in memory for one run and nowhere else. A batch not back within fifteen minutes approves nothing,
  and its session is cleared too.
- **The session's own lifetime is a request, not a guarantee.** The product asks CloudHub for a session
  of fifteen minutes; CloudHub passes that to the provider and cannot end a session early. A session a
  provider granted for longer stays valid there after the product has discarded it — which is why the
  product's own side is what bounds it.

A single file's cloud signature never parks its session: it runs in the callback request, as above, on a
session that can sign once.

### The second factor, and what it is worth

`ApproverSecondFactor:Enabled` adds a TOTP prompt before an approver's decision, once per verification
window per browser session. What it closes is precisely the **unattended session**: a machine left signed
in, or a portal link read by somebody who should not have it, no longer decides on its own. The window is
absolute and belongs to the browser rather than to the person, which is what makes that true. Under
Entra sign-in, signing out deletes the session's window, so a colleague's silent re-sign-in on a shared
workstation starts without one.

Three limits to hold onto, because each is a claim this control does **not** support:

- **It does not make an operator unable to be an approver.** TOTP is symmetric, an operator can read every
  approver link and reset every enrolment, so an operator can still be any approver. What does close that
  is key material only the approver holds: on a profile whose signer set includes the approvers, each
  approval is an ICP-Brasil signature checked against the CPF in the frozen pool, which an operator cannot
  make — and such a signed approval satisfies the second factor by itself. On a profile whose approvals are
  clicked, the second factor must not be described as having closed it.
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

On a profile whose signer set includes the approvers, the binding is **cryptographic as well**: each
approver's own key signs the staged bytes, and the sign stage promotes the result only if it verifies
**exactly** the recorded approvers' certificates, by thumbprint, plus the profile key where the frozen
rule says so — a missing signer fails the job, and so does an extra one.

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
- `/api/ready` is anonymous by default and carries no detail;
  [`Readiness:RequireApiKey = true`](#readiness-the-verdict-is-anonymous-the-diagnosis-is-not) gates it
  where the prober can send the key.
- `Upload:Enabled = false` removes the upload surface: `POST /api/files` answers `409 upload.disabled`
  before it resolves a profile, and the Jobs page renders no upload button. The host then takes files
  from its watched folders alone.
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
  believe two.

The ready-summary banner prints `forwarded headers = …` naming the trust set rather than only `on`. Under
[cluster mode](high-availability.md#rate-limit-budgets-are-per-instance-so-the-effective-limit-is-n),
remember that each instance enforces its own budget, so the effective per-client limit is ×N.

## Forensic posture

- **Audit trail.** Every state transition writes a job-history entry to the operational database;
  every pause/resume, profile edit, approval decision and Clear Jobs writes an operational event. These
  are durable across restart and survive uninstall (unless `--purge` is used), and since 2.13.0 the
  events are readable by operators on the `/events` page and over `GET /api/events`.
- **What removes them.** Inside the product, only an operator's order. **Clear Jobs** deletes every job
  row and every operational event recorded before the clear started, and writes a `JobsCleared` event —
  who, when, and how many of each went — as the record of the cut. **Deleting a job** removes that job's
  rows and keeps every event, adding a `JobDeleted` one that summarises the approvals it carried; it has
  no REST route, so a leaked API key cannot use it. See
  [Retention](retention.md#what-an-operator-can-delete-clear-jobs-and-job-deletion).
- **Per-request correlation.** Error responses include `traceId` and `requestId`; the same IDs appear
  in the file logs so client-side failures can be traced to the line they generated.
- **Backup before upgrade — and before a Clear Jobs.** Always back up the operational store before an
  upgrade: the migration runs at startup and is one-way. Under `Sqlite` the service can take the backup
  for you; otherwise copy `db/bulksigner.db` with the service stopped. A backup artifact is a complete
  copy of the audit trail, so it inherits the store's sensitivity wherever it lands.

---

**Next:** [Operations](operations.md) — day-2 operations and the job lifecycle.
**Previous:** [Certificates](certificates.md).
