---
sidebar_label: "Server configuration"
sidebar_position: 5
---

# Server configuration

Every key the Server binds, its default, whether an Administrator can change it at runtime, and
whether a change needs a restart. The Workstation Service and the Tray App are configured
separately: see [Workstation configuration](workstation-configuration.md).

## Where a value comes from

Six sources, lowest precedence first. A later one beats an earlier one, key by key:

| | Source | Where it exists |
|---|---|---|
| 1 | `appsettings.json` | Baked into the image. Not a file a deployment edits. |
| 2 | `appsettings.{ASPNETCORE_ENVIRONMENT}.json` | `appsettings.Development.json` is in the image and inert because a deployment is not the Development environment. **Never run a deployment as `Development`**: that file carries the sample PKI SDK licence and the credentials of a shared test Signer. |
| 3 | User secrets | A developer's machine only. |
| 4 | Environment variables | The container: Compose's `environment:` or App Service's application settings. `__` stands for `:`. |
| 5 | Command line | Neither posture uses it. |
| 6 | **The overrides an Administrator saved** | A table in the platform's database, read at start and re-read whenever a setting is saved on the Settings screen. |

**Source 6 is silent and wins.** Setting one of the seven overridable keys in the deployment and
watching it have no effect means somebody saved a value on the Settings screen; your value is the
default it falls back to when the override is cleared.

| Key an Administrator can override | Default |
|---|---|
| `Sessions:DefaultDuration` | 1 h |
| `Sessions:MaxDuration` | 24 h |
| `Sessions:PinPromptTimeout` | 60 s |
| `Sessions:MaxPinFailures` | 5 |
| `Sessions:PinFailureWindow` | 15 min |
| `Signing:WorkstationReconnectGrace` | 15 s |
| `Audit:RetentionDays` | 365 |

Those seven take effect without a restart. A row saved under any other key is ignored rather than
honoured. **Treat every other key on this page as restart-only.**

## How a key is written

`:` in a file, `__` in the environment:

```json
{ "Sessions": { "MaxDuration": "12:00:00" } }
```

```yaml
environment:
  Sessions__MaxDuration: "12:00:00"
```

```bash
az webapp config appsettings set -g <rg> -n <app> --settings Sessions__MaxDuration=12:00:00
```

- A single underscore does nothing: `Sessions_MaxDuration` is a variable the Server never reads.
- **A list is indexed**, and the index is part of the key: `KeyRingProtector__RetiredCertificates__0__Certificate`.
- **A duration is `[d.]hh:mm:ss`, and hours must stay under 24.** `24:00:00` is twenty-four *days*;
  one day is `1.00:00:00`.
- A size is a plain count of bytes. A boolean is `true` or `false`, lower case.
- A logging category keeps its dots: `Logging__LogLevel__TrustBridge.Server.Common.Vault`.

## Database and key rings

### `ConnectionStrings:TrustBridge`

**Default** a dev-only local Windows-authentication string · **Admin can override** no · **Restart** yes

The platform's only database: schema, Audit Log, both key rings and the Administrator overrides. The
image's default cannot work on Linux, so a deployment that forgets this key gets a refused start after
about ninety seconds of trying it.

```yaml
# Docker on Linux, SQL Server beside it
ConnectionStrings__TrustBridge: >-
  Server=sqlserver,1433;Database=TrustBridge;User Id=sa;
  Password=${MSSQL_SA_PASSWORD};Encrypt=True;TrustServerCertificate=True
```

```bash
# Azure App Service, managed identity
ConnectionStrings__TrustBridge="Server=tcp:<sqlserver>.database.windows.net,1433;Database=TrustBridge;Authentication=Active Directory Managed Identity;Encrypt=True"
```

### `Database:MigrateOnStart`

**Default** `true` · **Admin can override** no · **Restart** yes

Whether the Server applies pending migrations to its database at start, before it serves anything.
`false` does not mean "start anyway": a pending migration then **refuses the start**, naming the
migrations and the command to run. Two states refuse the start whichever way this is set: a database
with migrations this build does not contain, and a database that cannot be reached within about ninety
seconds. Applying migrations needs `db_ddladmin`; an up-to-date database needs no DDL at all.

Three time limits are constants rather than keys: about ninety seconds for a database to start
answering, five minutes for another process's migration to finish, and **thirty minutes for any single
command of a migration**. On Azure App Service, `WEBSITES_CONTAINER_START_TIME_LIMIT` (default 230 s)
binds first; raise it to 1800.

### `KeyRingProtector:Certificate`

**Default** unset · **Admin can override** no · **Restart** yes

**Required of every deployment**, including one that holds no certificates of its own. A
**base64-encoded PKCS#12 on one line with no PEM header**, carrying an **RSA** private key. Not a
path and not a thumbprint. Four refusals stop the host: not configured, not base64, could not be
opened (wrong password or not a PKCS#12), and no usable RSA private key. See
[Security](security.md#the-key-ring-protector).

```yaml
environment:
  KeyRingProtector__Certificate: ${KEY_RING_PROTECTOR_CERTIFICATE:?set KEY_RING_PROTECTOR_CERTIFICATE in .env}
```

```bash
# App Service: an app setting, or better, a Key Vault reference
KeyRingProtector__Certificate="@Microsoft.KeyVault(SecretUri=https://<vault>.vault.azure.net/secrets/<name>/)"
```

### `KeyRingProtector:CertificatePassword`

**Default** unset · **Admin can override** no · **Restart** yes

The password that opens the protector. Absent means the PKCS#12 needs none, which is the honest
default for a protector supplied as configuration.

### `KeyRingProtector:RetiredCertificates:{n}:Certificate` and `…:{n}:CertificatePassword`

**Default** empty · **Admin can override** no · **Restart** yes

Protectors this deployment used to seal with, kept so that key material sealed under one of them stays
readable. **Decrypt-only**, and kept **permanently**: rotation never re-wraps stored keys. A list of
objects, because each retired PKCS#12 has its own password, paired by index. **Do not template an empty
entry**: an entry whose `Certificate` binds to an empty string is a refused start.

```yaml
environment:
  KeyRingProtector__Certificate: <the new one>
  KeyRingProtector__RetiredCertificates__0__Certificate: <the one it replaced>
  KeyRingProtector__RetiredCertificates__0__CertificatePassword: <if that one had a password>
```

## Logging

### `Logging:LogLevel:{category}`

**Default** `Information`, with `Microsoft.AspNetCore` at `Warning` · **Admin can override** no · **Restart** yes

The framework's logging levels, and the one place a level is decided: the console, the rolling file
and Application Insights all receive exactly the lines these levels let through. Six categories carry
the lines worth recognising, all at `Information` or above, so the default already shows them:

| Category | What it says |
|---|---|
| `TrustBridge.Server.Common.Persistence.SchemaUpgrade` | Which migrations were applied at this start, or why the schema was refused |
| `TrustBridge.Server.Common.Persistence.SchemaGate` | That the Administrator overrides could not be re-read after the schema step |
| `TrustBridge.Server.Common.KeyRings.KeyRingPosture` | Which protector is sealing now, with its thumbprint and the retired count |
| `TrustBridge.Server.Common.Vault.VaultReadiness` | Whether the vault is off, open, or latched shut |
| `TrustBridge.Server.Common.Audit.AuditLog` | An audit row that could not reach the database, at `Critical`, carrying the row |
| `TrustBridge.Pki.Validation.LacunaPkiRuntime` | That the PKI SDK licence is absent or lapsed |

Raise a category, not the floor: framework debug logging buries these six lines.

### `Logging:File:Directory`

**Default** `trustbridge-logs` under the process's temporary directory (`/tmp/trustbridge-logs`) · **Admin can override** no · **Restart** yes

Where the rolling compact-JSON file is written, one per day, rolled again past one gigabyte. The admin
console's **Server log** screen reads it. **Empty turns the file off**, which is what a read-only
filesystem sets. A directory the Server cannot create leaves the file off for the life of the process
with a `Warning`; the console is untouched.

### `Logging:File:RetainedDays`

**Default** 14 · **Admin can override** no · **Restart** yes

How many days of files are kept. Below 1 refuses the start. A bound on disk rather than a retention
policy: the console pipeline is the record.

### `Logging:ApplicationInsights:ConnectionString`

**Default** unset · **Admin can override** no · **Restart** yes

An Application Insights connection string. When set, every line is also sent there as a trace with
the correlation id and category as custom dimensions. **When unset, `APPLICATIONINSIGHTS_CONNECTION_STRING`
is read instead**, so a workspace attached through the App Service portal needs no second setting. A
value that is not a connection string refuses the start.

### `AllowedHosts`

**Default** `*` · **Admin can override** no · **Restart** yes

The framework's Host header filter. Neither posture needs it.

## The signature service

Where Lacuna Signer is and how TrustBridge authenticates to it. **Both or neither**: an unconfigured
Signer is a supported deployment where `/v1/signatures` refuses and everything else works; an address
with no key **refuses the start**.

```yaml
environment:
  Signer__BaseAddress: https://signer.example.com
  Signer__ApiKey: My Application|43fc0da834e48b4b840fd6e8c371…
  Signer__ApplicationName: My Application    # only for a key that is the secret half alone
  Signer__FolderId: f81d4fae-7dec-11d0-a765-00a0c91e6bf6
  Signer__RequestTimeout: "00:00:10"
```

| Key | Default | Meaning |
|---|---|---|
| `Signer:BaseAddress` | unset | Signer's base address. Setting it makes `ApiKey` required. |
| `Signer:ApiKey` | unset | The single Signer API key TrustBridge holds on behalf of every Client Application, in the whole `application\|secret` form Signer publishes. |
| `Signer:ApplicationName` | unset | The application half, only for a key that carries just the secret. Ignored when the key contains `\|`. |
| `Signer:FolderId` | unset | The Signer folder every document lands in, as a GUID. Unset is the organization's root. |
| `Signer:RequestTimeout` | 10 s | The bound on one Signer call. Non-positive refuses the start. |

All restart-only, none overridable.

## Signing sessions

Five of the seven Administrator-overridable keys are here. `Sessions:SignatureAllowance` has no
default and is deliberately absent from the sample.

```yaml
environment:
  Sessions__DefaultDuration: "01:00:00"
  Sessions__MaxDuration: "1.00:00:00"
  Sessions__MaxPinFailures: "5"
  Sessions__PinFailureWindow: "00:15:00"
  Sessions__PinPromptTimeout: "00:01:00"
  Sessions__PinRelayTimeout: "00:00:05"
  Sessions__ExpirySweepInterval: "00:05:00"
```

| Key | Default | Override | Restart | Meaning |
|---|---|---|---|---|
| `Sessions:DefaultDuration` | 1 h | **yes** | no | The idle window granted when the client requests none. Non-positive refuses the start. |
| `Sessions:MaxDuration` | 24 h (`1.00:00:00`) | **yes** | no | The longest window a client may request; a longer request is clamped and the clamped value is echoed. Below `DefaultDuration` refuses the start. |
| `Sessions:MaxPinFailures` | 5 | **yes** | no | Failed PIN comparisons inside the window that lock a CPF out of session creation, counted per CPF across all API keys. Zero refuses the start. |
| `Sessions:PinFailureWindow` | 15 min | **yes** | no | The lockout's rolling window and cooldown. |
| `Sessions:PinPromptTimeout` | 60 s | **yes** | no | How long a Tray prompt stays up before creation gives up. The workstation's own `Tray:PromptTimeout` (90 s) is deliberately looser, because a Server that has given up cannot take the prompt off the screen. |
| `Sessions:PinRelayTimeout` | 5 s | no | yes | The budget for the whole PIN relay across every candidate certificate on the cached path. |
| `Sessions:ExpirySweepInterval` | 5 min | no | yes | How often the sweep closes out lapsed sessions in the record. Changes no verdict. Not validated at start. |

### `Sessions:SignatureAllowance`

**Default** unset (no bound) · **Admin can override** no · **Restart** yes

How many signing **calls** a Signing Session may make before it ends as **Exhausted**, whichever of
its two bounds arrives first. One charge per call, not per document: a batch of fifty spends one, and
a call whose documents all failed before the certificate signed spends none. An allowance of `1`
reproduces the reference implementation's single-use session. Zero or less refuses the start. Granted
at creation, so a change governs only sessions created afterwards. The wire carries no remaining
count; the Signing Sessions screen shows the spend.

## The signing surface

```yaml
environment:
  Signing__RequestBudget: "00:01:00"
  Signing__HashSignTimeout: "00:00:25"
  Signing__SignerCancelBudget: "00:00:03"
  Signing__StrandedAfter: "00:10:00"
  Signing__StrandedSweepInterval: "00:05:00"
  Signing__WorkstationReconnectGrace: "00:00:15"
  Signing__ReconnectPollInterval: "00:00:00.250"
  Signing__MaxDocumentBytes: "10485760"
  Signing__TransportHeadroomBytes: "65536"
  Signing__MaxBatchItems: "50"
  Signing__SignerConcurrency: "32"
```

| Key | Default | Override | Meaning |
|---|---|---|---|
| `Signing:RequestBudget` | 60 s | no | The whole of one synchronous signature, from admission to the signed bytes. A breach answers `SIGN_TIMEOUT`. `HashSignTimeout` plus `WorkstationReconnectGrace` must fit inside it, or the start is refused. |
| `Signing:HashSignTimeout` | 25 s | no | How long a dispatched hash-sign may take before the machine counts as unreachable. Far above the ~340 ms a token spends, because the machine may be busy with someone else's document. |
| `Signing:SignerCancelBudget` | 3 s | no | How long the tidy-up may take when a run that signed nothing ends its document at Signer. |
| `Signing:StrandedAfter` | 10 min | no | How long a Signing Operation may sit `Pending` before the sweep ends it as `Failed` with `RUN_STRANDED`. Must exceed `RequestBudget` plus `SignerCancelBudget`. |
| `Signing:StrandedSweepInterval` | 5 min | no | How often that sweep runs. A pass also runs at start. Not validated at start. |
| `Signing:WorkstationReconnectGrace` | 15 s | **yes** | How long a sign waits for its bound workstation to come back before `WORKSTATION_OFFLINE`. Zero refuses at once and is legal; negative refuses the start. |
| `Signing:ReconnectPollInterval` | 250 ms | no | How often that grace re-checks presence. Non-positive refuses the start. |
| `Signing:MaxDocumentBytes` | 10 MB (`10485760`) | no | The largest document the Server signs, measured on the **decoded** bytes. Over-cap answers 413 in the contract's envelope. Bounds memory, not storage. The transport limits underneath are derived from it. |
| `Signing:TransportHeadroomBytes` | 64 KB | no | Headroom over the encoded document for the rest of the request body. |
| `Signing:MaxBatchItems` | 50 | no | How many documents one batch call may name. A call with more is refused before any is signed. With `MaxDocumentBytes`, what a batch in flight can occupy: 500 MB on the defaults. |
| `Signing:SignerConcurrency` | 32 | no | How many signing runs may be in flight against Signer at once, across the whole Server. A larger batch runs in waves. Zero refuses the start. |

All restart-only except `WorkstationReconnectGrace`.

## The global throttle

One bound on how many contract calls the Server runs at once, with a short queue in front of it. A
shed call answers `429 SERVER_BUSY` with no `Retry-After`. It applies to the SignSession Contract
surface only; the workstation channel, the admin console, the health probe, the Landing Page, the
documentation and workstation admission are outside it. The defaults sit nearly seven times above the
designed load: a circuit breaker, not a throughput cap.

| Key | Default | Meaning |
|---|---|---|
| `Throttle:ConcurrencyLimit` | 200 | How many contract calls may run at once. Zero refuses the start; there is deliberately no way to switch it off. `Signing:SignerConcurrency` is the knob that shapes signing throughput, not this. |
| `Throttle:QueueLimit` | 50 | How many calls may wait for a place before the next one is shed. Zero is legal and means no queue; negative refuses the start. |

## Workstation admission

Which machines may ask to join, how much of the queue a stranger can fill, and how long an abandoned
request stays. A default deployment sets none of these. All restart-only, none on the Settings screen.

```yaml
environment:
  Admission__InstallerKeys__0: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE…"
  Admission__MaxPending: "500"
  Admission__RequestsPerAddress: "300"
  Admission__RequestWindow: "00:01:00"
  Admission__PendingExpiry: "7.00:00:00"
  Admission__RequireHardwareBackedKeys: "false"
```

| Key | Default | Meaning |
|---|---|---|
| `Admission:InstallerKeys` | The Installer Key that ships with TrustBridge | The Installer Keys this Server accepts admission requests signed with, each a base64 DER `SubjectPublicKeyInfo` for an ECDSA P-256 public key. **Setting this replaces the default rather than adding to it.** Name two while changing one: add the new key beside the old, update the fleet, then drop the old entry. A value that will not parse refuses the start. |
| `Admission:MaxPending` | 500 | How many machines may be waiting for an Administrator at once. Past it, a request from a machine this Server has never seen is refused. Zero refuses the start. |
| `Admission:RequestsPerAddress` | 300 | How many admission requests one source address may make per window. A nuisance bound; behind NAT a whole office is one address, and no forwarded header is honoured. |
| `Admission:RequestWindow` | 1 min | The fixed window for the above. |
| `Admission:PendingExpiry` | 7 days | How long a machine's request stays in the queue after the Server last heard from it. Counted from the **last** request, so a machine still asking never lapses. Expiry is not a refusal. |
| `Admission:RequireHardwareBackedKeys` | `false` | Whether to refuse admitting a machine whose Workstation Key is not in hardware. Such a machine still appears in the queue, with the screen saying why the Admit control refuses it. The posture is the machine's own claim; nothing attests it. |

## The admin console

```yaml
environment:
  Admin__Bootstrap__Email: admin@example.com
  Admin__Bootstrap__Password: ${ADMIN_BOOTSTRAP_PASSWORD}
  Admin__Bootstrap__DisplayName: Platform Administrator
  Admin__SecondFactor__Required: "true"
```

### `Admin:Bootstrap:Email`, `Admin:Bootstrap:Password`, `Admin:Bootstrap:DisplayName`

**Default** unset · **Admin can override** no · **Restart** yes

The first Administrator. Read on a Server whose account table is **empty**, and inert on every start
after that: a configured password never re-creates a deleted account or resets a live one. The
password must satisfy the identity password rules or the account is not created and the reason is
logged. Remove both once you have signed in. With these unset on an empty table, the Server logs a
`Warning` and creates nothing; the console cannot be signed into until something puts an account there.

### `Admin:SecondFactor:Required`

**Default** `true` · **Admin can override** **no, deliberately** · **Restart** yes

Whether an Admin Account must present a second factor as well as its password. **Deployment
configuration and never a screen**: a switch that disables the second factor, reachable from inside
the console it protects, is a switch an intruder flips on the way past. A row saved in the database
under this key is ignored. Platform-wide, with no per-account exemption.

It is also the **break-glass** for an Administrator who has lost their authenticator; the procedure is
in [Security](security.md#break-glass-a-lost-authenticator). The weakened posture is announced at every
start while it is off.

## The Audit Log

### `Audit:RetentionDays`

**Default** 365 · **Admin can override** **yes** · **Restart** no

How long audit events are kept; a daily purge deletes older rows. Below 1 refuses the start: a
retention of zero would delete the whole trail on the next pass.

There is no setting for where a failed audit write goes. An entry the database will not take is
written to the Server log at `Critical`, carrying the row itself, and the admin console raises an
alert. It reaches you through whatever log pipeline the deployment has, so audit fallback belongs in
your **log retention**, not your backups.

## Languages

```yaml
environment:
  Language__DefaultCulture: pt-BR
  Language__SupportedCultures__0: en
  Language__SupportedCultures__1: pt-BR
```

| Key | Default | Meaning |
|---|---|---|
| `Language:DefaultCulture` | `en` | What a request with no usable `Accept-Language` is answered in. Not a deployment-wide language: the reader's browser preference and the switcher win. A value outside the supported set, or a typo, refuses the start. |
| `Language:SupportedCultures` | empty, meaning `en` and `pt-BR` | Every language the page realms answer in. Naming a set replaces it. |

The contract surface, the logs and the Audit Log stay English permanently.

## The published documentation

### `Documentation:ApiReferenceEnabled`

**Default** `true` · **Admin can override** no · **Restart** yes

Whether the browsable reference is served at `/scalar`. The machine-readable document at
`/openapi/v1.json` is the integration contract, is always served, and is not affected. Both answer
without a credential.

## The workstation channel

How an admitted machine proves it is itself on every connection: a short-lived assertion signed by its
Workstation Key. Neither key is a knob a healthy deployment touches.

| Key | Default | Meaning |
|---|---|---|
| `Workstations:ClockSkewTolerance` | 60 s | How far apart the Server's clock and a workstation's may be before that machine cannot connect. Applied at both ends. The Server's log names the drifting machine and the offset (`A workstation assertion was refused: Expired` or `NotYetValid`). Negative or over one hour refuses the start. |
| `Workstations:MaxAssertionLifetime` | 5 min | The longest validity window honoured on an assertion; a longer claim is refused. Bounds the nonce cache, which holds at most 100 000 nonces and refuses rather than forgets when full. Non-positive or over one hour refuses the start. |

The channel is at **protocol 2**. The Server accepts protocol N and N-1. See
[Operations](operations.md#rollout-order-server-first-then-the-fleet).

## The Certificate Vault

```yaml
environment:
  Vault__Enabled: "true"
  Vault__RevalidationInterval: "01:00:00"
```

### `Vault:Enabled`

**Default** `false` · **Admin can override** **no, deliberately** · **Restart** yes

Whether the Certificate Vault exists on this Server, that is, whether it may hold a private key of
its own. Off by default because the tier makes the platform's founding claim conditional; an operator
opts in. A row saved in the database under this key is ignored, for the same reason as
`Admin:SecondFactor:Required`. Turning it on puts the PKI SDK licence on the critical path and brings
the vault latch with it. Turning it off deletes nothing: the rows stay, revalidation stops, and the
paths that would read them answer that this Server holds no key ring.

### `Vault:RevalidationInterval`

**Default** 1 h · **Admin can override** no · **Restart** yes

How often the Server rechecks the verdict of what the vault holds. Not validated at start: a
non-positive value is reported at `Critical` and the worker declines to run.

## Certificate validation and the PKI SDK licence

The same section name the Workstation Service reads, with two keys that mean something only there.
On the Server, only a deployment with the vault on resolves the licence and the anchor set; the
timeouts and grace window are validated at every start regardless.

```yaml
environment:
  Certificates__Validation__License: ${PKI_LICENSE}
  Certificates__Validation__UseIcpBrasil: "true"
  Certificates__Validation__UseMachineRootStore: "false"
  Certificates__Validation__UseLacunaTestPki: "false"
  Certificates__Validation__RevocationGraceWindow: "1.00:00:00"
  Certificates__Validation__RevocationTimeout: "00:00:05"
  Certificates__Validation__CheckTimeout: "00:00:30"
```

### `Certificates:Validation:License`

**Default** unset · **Admin can override** no · **Restart** yes

**Effectively required once the vault is on.** The whole `LacunaPkiLicense.config` Lacuna issues,
base64-encoded on one line, not a path. The image carries no licence, so a renewal is a settings
change and a restart rather than a rebuild.

```bash
base64 -w0 LacunaPkiLicense.config
```

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("LacunaPkiLicense.config"))
```

An unlicensed vault deployment **starts**: one `Critical` line, every Vault Certificate reporting
`UNTRUSTED`, and imports refused outright. Absent, malformed and lapsed all converge on that line. Put
its expiry on whatever calendar tracks certificate renewals. The SDK only reads a licence from a file,
so the value is written to `/tmp/trustbridge-pki` and deleted in the same call; a read-only filesystem
with no writable `/tmp` cannot load one.

### The anchor sources

| Key | Default | Meaning |
|---|---|---|
| `Certificates:Validation:UseIcpBrasil` | `true` | Trust the ICP-Brasil roots the PKI SDK carries: the production anchor set, embedded, no download. Turning it off is a trust decision. |
| `Certificates:Validation:UseMachineRootStore` | `false` | Also trust the machine's own root store. On the Server, a Linux container, this does nothing; it is the workstation's knob. |
| `Certificates:Validation:UseLacunaTestPki` | `false` | Also trust the Lacuna Test PKI. **Development only**: Lacuna publishes the private keys of those sample certificates. A Server with this on logs `Critical` at start and shows a **warning banner on every admin page**. |
| `Certificates:Validation:UseServerTrustedCas` | `true` | A **workstation's** switch. Inert on the Server. |
| `Certificates:Validation:TrustedRootPaths` | empty | **Not honoured on the Server.** A Server that finds it set starts anyway and logs one `Critical` line naming the key and the admin page that replaced it. Add a **Trusted CA** at `/admin/trusted-cas` instead. |

Two `Critical` lines describe an anchor set that anchors nothing: no anchors at all, and anchors that
are only intermediates with no self-signed root, so no chain can terminate. Both make every
certificate `UNTRUSTED`.

### The revocation bounds

| Key | Default | Meaning |
|---|---|---|
| `Certificates:Validation:RevocationGraceWindow` | 24 h (`1.00:00:00`) | How long the last successful revocation check keeps a certificate `ACTIVE` while its CA cannot be reached; past it the certificate goes `STALE`. **This is the trust decision**: exactly how long a certificate keeps signing after its CA stopped answering, revoked or not. Zero is legal and strictest; negative refuses the start. |
| `Certificates:Validation:RevocationTimeout` | 5 s | How long one CRL download or issuer fetch may take before the CA counts as unreachable. Also bounds each fetch of the Trusted CA discovery's AIA walk. Non-positive refuses the start. |
| `Certificates:Validation:CheckTimeout` | 30 s | The outer bound on one certificate's whole check, including the SDK's OCSP fallback, which has no bound of its own. Zero waits indefinitely and is not refused. |

## Settings that are not appsettings keys

| Setting | Belongs to | Where |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | The framework | **Unset in both postures**, and unset means `Production`, which keeps `appsettings.Development.json` inert. |
| `ASPNETCORE_URLS` | Kestrel | `https://+:8443` on Docker, HTTPS only. Not set on App Service. |
| `Kestrel__Certificates__Default__Path` / `__Password` | Kestrel | The Server's own TLS certificate on Docker. Nothing to set on App Service. |
| `WEBSITES_PORT` | App Service | `8080`. |
| `WEBSITES_CONTAINER_START_TIME_LIMIT` | App Service | `1800`, so a long migration is not killed and restarted in a loop. |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | The framework | `true` behind any TLS-terminating proxy, or every audit row records the proxy instead of the caller. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Service | Read when `Logging:ApplicationInsights:ConnectionString` is unset. |
| `TMPDIR` | The process | Moves both temporary directories. There is deliberately no TrustBridge setting for it. |
