---
sidebar_label: "Configuration"
sidebar_position: 3
---

# Configuration

Every `appsettings.json` key for Lacuna Bulk Signer — type, default, environment-variable override,
and whether it is required.

## Configuration sources, in precedence order

Later sources override earlier ones:

1. `appsettings.json` (built-in defaults)
2. `appsettings.{Environment}.json` (e.g. `appsettings.Production.json`)
3. `appsettings.json` + `appsettings.{Environment}.json` found under `BULK_SIGNER_CONFIG_DIR`
4. Environment variables (`Section__Sub__Key`)

The `BULK_SIGNER_CONFIG_DIR` step is what lets the binary live in a read-only install location
(`/opt/bulksigner`, `%ProgramFiles%\Lacuna\BulkSigner`) while the operator-edited production config
lives elsewhere (`/etc/bulksigner`, `%ProgramData%\Lacuna\BulkSigner\config`). The install scripts
set this variable; if you change install paths, update the variable in lockstep.

Environment-variable mapping follows the ASP.NET Core rule: a JSON key like
`Signing:Certificate:Pfx:Password` maps to `Signing__Certificate__Pfx__Password` (double underscore
is the separator).

## Markers used in the tables

| Marker | Meaning |
|--------|---------|
| **REQUIRED** | The service refuses to start (or signing refuses to run) without a non-empty value. |
| **SECRET** | Sensitive — prefer the environment-variable override over a value committed to a file. |

## `Logging` / `Logging:File`

Standard `Microsoft.Extensions.Logging` knobs (`Logging:LogLevel:*`) work as usual; the
`Logging:File` block configures the file sink.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Logging:LogLevel:Default` | string | `Information` | `Logging__LogLevel__Default` | Standard logging level. |
| `Logging:LogLevel:Microsoft.AspNetCore` | string | `Warning` | `Logging__LogLevel__Microsoft.AspNetCore` | Lowers framework chatter. |
| `Logging:File:Path` | string | `data/logs/bulksigner-.log` | `Logging__File__Path` | **REQUIRED.** File-sink path template. The trailing `-` before `.log` plus daily rolling produces `bulksigner-yyyyMMdd.log`. |
| `Logging:File:RollingInterval` | string | `Day` | `Logging__File__RollingInterval` | One of `Day`, `Hour`, `Minute`, `Infinite`. |
| `Logging:File:FileSizeLimitBytes` | long | `50000000` | `Logging__File__FileSizeLimitBytes` | Per-file cap; the sink rolls to `…_001.log` past this. Bounds: 64 KB to 10 GB. |
| `Logging:File:RetainedFileCountLimit` | int | `14` | `Logging__File__RetainedFileCountLimit` | Older files are deleted as rotation advances. Bounds: 1–365. |
| `Logging:File:MinimumLevel` | string | `Information` | `Logging__File__MinimumLevel` | One of `Verbose`, `Debug`, `Information`, `Warning`, `Error`, `Fatal`. |
| `Logging:File:WriteToConsole` | bool | `true` | `Logging__File__WriteToConsole` | When true, also writes to stdout. The same redacting formatter runs on both sinks. |

## `Logging:AzureTable` — a second log sink

A deployment on an ephemeral filesystem — a container that is replaced rather than restarted — loses
`data/logs/` every time. This block sends log events to an Azure Storage table as well, so the
diagnostic stream survives the host. It is the last of three places state can move into Azure: files
can already live on an Azure Files share
([`Storage:Provider`](#storageprovider--storageazurefiles--the-work-share)) and the operational record
in Azure SQL ([`Database`](#database-and-connectionstrings)).

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Logging:AzureTable:Enabled` | bool | `false` | `Logging__AzureTable__Enabled` | Off unless set. `true` over an incomplete block is a **boot refusal** naming the missing key, not a silently inert sink. |
| `Logging:AzureTable:TableName` | string | `bulksignerlogs` | `Logging__AzureTable__TableName` | Must already exist — the service does not create it. Alphanumeric only, 3–63 characters, must not start with a digit; a bad name is refused at boot rather than on the first write. |
| `Logging:AzureTable:MinimumLevel` | string | *(inherits `Logging:File:MinimumLevel`)* | `Logging__AzureTable__MinimumLevel` | Narrow the table without narrowing the file. **Setting it *below* the global minimum does nothing** — that gate runs before any sink. |
| `Logging:AzureTable:ServiceUri` | string | — | `Logging__AzureTable__ServiceUri` | **REQUIRED when enabled.** The table endpoint, e.g. `https://contosologs.table.core.windows.net`. A URL carrying a **query string is refused** — that is how a shared-access signature arrives, and SAS is deliberately not among this product's storage credentials. Refusing it also keeps this value non-secret, which is what makes it safe to print on the startup banner. |
| `Logging:AzureTable:Credential` | string | — | `Logging__AzureTable__Credential` | **REQUIRED when enabled.** `ManagedIdentity`, `ServicePrincipal` or `AccountKey`. **Never defaulted** — see below. |
| `Logging:AzureTable:AccountName` | string | — | `Logging__AzureTable__AccountName` | Required for `AccountKey` **and that mode only**: the shared-key credential needs the account by name, and it cannot be read off `ServiceUri` without guessing whether that URL is a production endpoint or an emulator one. |
| `Logging:AzureTable:AccountKey` | string | — | `Logging__AzureTable__AccountKey` | **SECRET.** `AccountKey` mode only. |
| `Logging:AzureTable:TenantId` | string | — | `Logging__AzureTable__TenantId` | `ServicePrincipal` mode only. |
| `Logging:AzureTable:AppId` | string | — | `Logging__AzureTable__AppId` | `ServicePrincipal` mode only. |
| `Logging:AzureTable:AppSecret` | string | — | `Logging__AzureTable__AppSecret` | **SECRET.** `ServicePrincipal` mode only. Env override recommended. |
| `Logging:AzureTable:QueueLimit` | int | `10000` | `Logging__AzureTable__QueueLimit` | Events held in memory while the table is unreachable. Beyond it events are **dropped and counted** — reported on `/api/ready` and on `bulksigner_log_sink_dropped_total`. The bound exists because an unbounded buffer against a long outage is an out-of-memory kill of a signing service because *logging* broke. |
| `Logging:AzureTable:BatchSizeLimit` | int | `100` | `Logging__AzureTable__BatchSizeLimit` | Events per write. Capped at 100, the documented ceiling on an entity-group transaction; above it a batch stops being one transaction rather than merely being slower. |
| `Logging:AzureTable:BatchPeriodSeconds` | int | `5` | `Logging__AzureTable__BatchPeriodSeconds` | How long a partial batch waits before being written. |

**The credential keys are the same ones `Storage:AzureFiles` and a profile's signing material blob
use**, so an operator who has configured one storage credential in this product has configured them
all. The identity needs **Storage Table Data Contributor** on the table or its account.

**A block naming no credential is refused at boot.** Falling back to a development identity would mean
a missing or unassigned managed identity working on a laptop and failing only in production.

**Prefer `ManagedIdentity` to `AccountKey`.** Microsoft recommends disallowing Shared Key
authorization, and many organisations set `allowSharedKeyAccess = false` at the account — on such an
account `AccountKey` cannot be configured at all. An account key also grants full data-plane access to
the *whole* account, so a key used for a log table has also handed out access to any Azure Files share
the same account holds.

### Two rules that are enforced, not advisory

**The table may never be the only sink.** `Logging:File:Enabled` is the off switch (for a read-only
root filesystem), but a configuration where **both local sinks are off** is refused at boot: if the
table stops accepting writes, the failure to log is itself unloggable. Keep the file sink, or keep
`WriteToConsole` — in a container that is stdout, which `docker logs` and App Service log streaming
already capture.

:::danger Nothing prunes the table
No TTL, no lifecycle rule, no bulk delete — the table grows until you delete from it. Read
[Retention](retention.md#logs-in-a-table--nothing-prunes-them) *before* enabling this, and schedule the
pruning script. If two deployments share a storage account, give each its own table.
:::

## `Database` and `ConnectionStrings`

The **operational store** — jobs, their history, operational events, the pipeline's pause flag, the
frozen approval rules and the recorded approvals — lives in SQLite by default. It can instead live in
your own SQL Server 2022+ or Azure SQL Database.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Database:Provider` | enum | `Sqlite` | `Database__Provider` | `Sqlite` or `SqlServer`. Case-insensitive; absent means `Sqlite`, so an existing deployment configures nothing. An unrecognised value is refused at boot, naming the key, your value, and the valid names. |
| `ConnectionStrings:Default` | string | `Data Source=data/db/bulksigner.db` | `ConnectionStrings__Default` | **REQUIRED under `SqlServer`** — and **SECRET** there, because it is the whole of the credential (SQL login, Entra ID, managed identity, Windows integrated; there is no separate credential key). Under `Sqlite` it may be omitted — the default above is real. Point a SQLite path under `Storage:Root` so one mount covers both the data tree and the DB. |

There is deliberately **no `Database:Credential` discriminator**: SQL Server has expressed
authentication in the connection string for thirty years, and adding a second mechanism beside one that
already works would only add a way for the two to disagree.

The store's provider is independent of `Storage:Provider` — files on an Azure Files share with the
store in SQLite, or the reverse, are both ordinary. **Neither combination makes running more than one
instance supported on its own**: that is [`Cluster:Enabled`](#cluster--multi-instance-deployment), which
*requires* `SqlServer` and `AzureFiles` but is not implied by them. Off that switch, see
[Operations](operations.md#when-another-instance-appears-to-own-the-work-share).

Azure SQL Managed Instance and SQL Server on a VM are *configure as `SqlServer`, untested* — the same
implementation reaches them and nothing about them is known to differ, but neither is exercised.

**Three boot refusals sit on `ConnectionStrings:Default`,** and which apply depends on the provider:

- Under `Sqlite`, a connection string naming an Azure Files location — a database file reached over SMB
  is the documented way to corrupt one.
- Under `SqlServer`, the reverse: a data source naming a *file* rather than a server, which is what a
  deployment that flipped the provider and left the SQLite path behind produces.
- Under `SqlServer`, an **absent** string. No server is guessed at, where under `Sqlite` a real default
  file path is.

No refusal ever echoes the connection string, because it may carry a password; only the data source is
quoted.

### Before you point it at SQL Server

1. **The database has to exist already.** Bulk Signer creates its *tables*, not its database. The boot
   probe opens a connection to the database the connection string names, so an absent one reads as an
   unreachable store and the migration is skipped.
2. **A login with the rights below,** mapped to a user in that database.
3. **Encryption the client will accept.** `Encrypt` defaults to `True` in the SQL client, so an
   on-premises server whose TLS certificate the host does not trust fails the login with a
   *certificate chain … not trusted* error. Install a trusted certificate on the server (the correct
   fix) or, knowingly and only where a man-in-the-middle is not a concern, add
   `TrustServerCertificate=True`. Azure SQL needs neither.

**Least privilege.** The service reads and writes its own tables and applies migrations at boot. That
is `db_datareader` + `db_datawriter` + `db_ddladmin` — **not** `db_owner`:

```sql
-- Once, by a DBA, in the database Bulk Signer will use.
CREATE USER [bulksigner] FOR LOGIN [bulksigner];   -- a SQL login
-- On Azure SQL with a managed identity or service principal, instead:
-- CREATE USER [<identity-or-app-name>] FROM EXTERNAL PROVIDER;

ALTER ROLE db_datareader ADD MEMBER [bulksigner];
ALTER ROLE db_datawriter ADD MEMBER [bulksigner];
ALTER ROLE db_ddladmin   ADD MEMBER [bulksigner];  -- for the boot that applies a migration
```

That block assumes the database and login already exist and that you are connected **to that
database**. Creating them differs by engine:

```sql
-- SQL Server: from master, then switch.
CREATE DATABASE [BulkSigner];
GO
ALTER DATABASE [BulkSigner] SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
GO
CREATE LOGIN [bulksigner] WITH PASSWORD = '<a strong password>';
-- or, for Windows integrated auth:  CREATE LOGIN [DOMAIN\HOSTNAME$] FROM WINDOWS;
GO
USE [BulkSigner];
GO
-- …then the CREATE USER + ALTER ROLE block above.
```

```sql
-- Azure SQL: TWO connections, because USE cannot switch databases there and
-- CREATE DATABASE must run from master on its own.
--   Connection 1, to master:
CREATE DATABASE [BulkSigner];
GO
--   Connection 2, to BulkSigner itself: the CREATE USER + ALTER ROLE block above.
```

`READ_COMMITTED_SNAPSHOT` is **already on** in Azure SQL. Without it, the dashboard's reads take shared
locks and block behind the pipeline's writes — which arrives as "the dashboard hangs while a batch
signs" rather than as a database setting. Bulk Signer reports it and **never issues the statement that
changes it**: that needs exclusive access to a database that is yours.

`db_ddladmin` is what creates the tables and indexes, so it is needed on the **first** boot and on any
boot after an upgrade that ships a migration. Leaving all three roles in place is the simpler and safer
default; the migration runs at every boot and is a no-op when there is nothing to apply.

### The two credential shapes

The connection string carries it either way. **Prefer the passwordless shape wherever the host can
authenticate as itself** — there is then no secret to rotate, to leak into a log, or to find in a
backup.

```
# Passwordless — Azure SQL, from a host with a system-assigned managed identity
Server=tcp:sqlsrv01.database.windows.net,1433;Initial Catalog=BulkSigner;Authentication=Active Directory Managed Identity;Encrypt=True;

# Passwordless — on-premises, from a Windows service account (integrated auth)
Server=sqlsrv01;Initial Catalog=BulkSigner;Integrated Security=True;Encrypt=True;

# With a secret — a SQL login
Server=sqlsrv01;Initial Catalog=BulkSigner;User ID=bulksigner;Password=<secret>;Encrypt=True;

# With a secret — an Entra service principal
Server=tcp:sqlsrv01.database.windows.net,1433;Initial Catalog=BulkSigner;Authentication=Active Directory Service Principal;User ID=<app-id>;Password=<client-secret>;Encrypt=True;
```

A **user-assigned** identity is reached by adding its client id as `User Id=<client-id>` — unlike
`Storage:AzureFiles`, whose `ManagedIdentity` mode is system-assigned only, because the SQL client
acquires the token itself.

Under the Windows Service target the service runs as the virtual account
`NT SERVICE\LacunaBulkSigner`, which reaches the network as the **computer account** — so the login to
create on SQL Server is `DOMAIN\HOSTNAME$`, not the virtual account's own name.

:::warning The environment variable replaces the whole value — it does not merge with the JSON
`ConnectionStrings:Default` is a single configuration key, so there is no way to keep the server in
`appsettings.Production.json` and supply only the password from the environment. Either the JSON holds
the complete string (fine when it is passwordless) or the environment does. A JSON value left in place
alongside the environment variable is silently ignored.
:::

### Switching provider starts with an empty store

There is no importer and no boot-time check for a SQLite file left behind. A deployment that sets
`Database:Provider = SqlServer` comes up against an empty schema: no jobs, no history, no operational
events — **and no approval snapshots and no recorded approvals**, which are the two things the product
otherwise retains for ever precisely because they are evidence of who authorised a payment file.

:::danger
**Archive the old `db/bulksigner.db` deliberately, before the switch**, and keep it as long as your
retention policy requires the evidence in it. Copy it while the service is stopped, and keep a SQLite
client to hand. The reverse switch has the same property. See
[Installation](installation.md#switching-from-sqlite--archive-the-old-file-first).
:::

### What the boot tells you about the store

Every deployment gets one `operational store` row on the ready-summary banner naming the provider, and
under `SqlServer` the server and the database with it — never the connection string. A `SqlServer`
deployment gets two more rows:

- **`store status`**, from one probe at boot. An unreachable store is **reported and does not stop the
  host** (a database down during a maintenance window must not turn a restart into an outage); the
  migration is skipped, `/api/ready` stays red until it answers, and the next boot that finds it
  applies the schema.
- **`store isolation`**, plus an ops-console warning, when `READ_COMMITTED_SNAPSHOT` is off. When it is
  on, nothing is reported.

### Engine-specific behaviour you do not configure

- **Under `Sqlite`,** every connection gets `journal_mode=WAL`, `synchronous=NORMAL` and
  `busy_timeout=30000`. WAL keeps the pipeline's per-job status writes from serializing on SQLite's
  single-writer fsync (the throughput ceiling at higher `Pipeline:MaxConcurrency`).
- **Under `SqlServer`, transient-fault retry is on and has no knob** — the initial attempt plus up to
  six retries against the error numbers the SQL client classifies as transient, each delay growing
  exponentially and capped at 30 seconds. It is on because running against Azure SQL effectively
  requires it. There is no configuration key, deliberately: a retry budget an operator can tune is a
  retry budget that gets tuned to zero during an incident.

## `Signing`

Validation fails fast at startup if any required key is missing or invalid.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:PkiSdkLicense` | string | `""` | `Signing__PkiSdkLicense` | **REQUIRED, SECRET.** Lacuna PKI SDK license string (base64). Environment-variable form preferred. |
| `Signing:Certificate:Source` | enum | `Pfx` | `Signing__Certificate__Source` | **REQUIRED.** One of `Pfx`, `Pkcs11`, `WindowsStore`, `AzureKeyVault`. Only the matching subtree below is consulted. |

### `Signing:Certificate:Pfx` — when `Source = Pfx`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:Certificate:Pfx:Path` | string | `""` | `Signing__Certificate__Pfx__Path` | **REQUIRED unless `Blob` is set** — exactly one of the two. Absolute path to the `.pfx`/`.p12` file. |
| `Signing:Certificate:Pfx:Password` | string | `""` | `Signing__Certificate__Pfx__Password` | **SECRET.** Empty string is allowed for passwordless test fixtures. Prefer the env-var form. |

### `Signing:Certificate:Pkcs11` — when `Source = Pkcs11`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:Certificate:Pkcs11:ModulePath` | string | `""` | `Signing__Certificate__Pkcs11__ModulePath` | **REQUIRED.** Absolute path to the vendor PKCS#11 driver (`.so`/`.dll`/`.dylib`). |
| `Signing:Certificate:Pkcs11:Thumbprint` | string | `""` | `Signing__Certificate__Pkcs11__Thumbprint` | **REQUIRED.** SHA-1 thumbprint (hex, no spaces) of the signing cert on the token. Required even when the token holds a single identity. |
| `Signing:Certificate:Pkcs11:PinEnvVar` | string | `BULK_SIGNER_PKCS11_PIN` | `Signing__Certificate__Pkcs11__PinEnvVar` | Name of the env var that supplies the PIN. The validator refuses to start if a literal `Pin` key appears under `Pkcs11`. |

### `Signing:Certificate:WindowsStore` — when `Source = WindowsStore`

Windows-only. The validator refuses this source on non-Windows hosts at startup.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:Certificate:WindowsStore:StoreLocation` | string | `CurrentUser` | `Signing__Certificate__WindowsStore__StoreLocation` | `CurrentUser` or `LocalMachine`. Use `LocalMachine` when the cert was imported machine-wide; the service account does not see the operator's `CurrentUser` store. |
| `Signing:Certificate:WindowsStore:StoreName` | string | `My` | `Signing__Certificate__WindowsStore__StoreName` | Logical store name. `My` is the personal store. |
| `Signing:Certificate:WindowsStore:Thumbprint` | string | `""` | `Signing__Certificate__WindowsStore__Thumbprint` | **REQUIRED.** SHA-1 thumbprint (hex, no spaces). |

### `Signing:Certificate:AzureKeyVault` — when `Source = AzureKeyVault`

The private key stays in the vault and each signature is a remote sign call; the matching public
certificate is supplied separately as a `.cer`. `Endpoint`, `AppId`, `AppSecret` and `KeyName` are
always required, plus **exactly one** of `CerPath` (a file on this host) or
[`Blob`](#blob--reading-the-file-from-azure-blob-storage) (an object in Azure Blob Storage). Startup
fails naming each missing one.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:Certificate:AzureKeyVault:Endpoint` | string | `""` | `Signing__Certificate__AzureKeyVault__Endpoint` | **REQUIRED.** Vault URL. Must be an absolute `https://` URL — a bare DNS name is refused at startup. |
| `Signing:Certificate:AzureKeyVault:AppId` | string | `""` | `Signing__Certificate__AzureKeyVault__AppId` | **REQUIRED.** Application (client) ID of the Microsoft Entra ID app registration. |
| `Signing:Certificate:AzureKeyVault:AppSecret` | string | `""` | `Signing__Certificate__AzureKeyVault__AppSecret` | **REQUIRED, SECRET.** Entra ID client secret. Unlike the PKCS#11 PIN this *is* permitted in a config file, but the env-var form is recommended. |
| `Signing:Certificate:AzureKeyVault:KeyName` | string | `""` | `Signing__Certificate__AzureKeyVault__KeyName` | **REQUIRED.** Name of the **key** object in the vault that performs the signature. A vault *certificate* object is not accepted. |
| `Signing:Certificate:AzureKeyVault:CerPath` | string | `""` | `Signing__Certificate__AzureKeyVault__CerPath` | **REQUIRED unless `Blob` is set** — exactly one of the two. Path to the `.cer` holding the public certificate for `KeyName`. Boot fails if its public key does not match the vault key. |

### `…:Blob` — reading the file from Azure Blob Storage

A host with **no durable local disk** — a container, an App Service, an AKS pod — has nowhere to keep a
`.pfx` or a `.cer`. The two sources that name a file can instead name a blob.

Available on **`Pfx`** (holding the `.pfx`, instead of `Path`) and on **`AzureKeyVault`** (holding the
`.cer`, instead of `CerPath`), in the legacy block and in every `Signing:Profiles[]` entry. Exactly one
of the local path or this block; **both set, or neither, is refused at boot.** Nothing here inherits
from the `AzureKeyVault` credential beside it or from `Storage:AzureFiles`.

Replace `<SRC>` below with `Pfx` or `AzureKeyVault`.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:Certificate:<SRC>:Blob:Url` | string | *(unset)* | `Signing__Certificate__<SRC>__Blob__Url` | **REQUIRED when the block is present.** Full blob URL, e.g. `https://contoso.blob.core.windows.net/certificates/signer.cer`. Must be absolute `https://`, must name a container *and* a blob, and **must not carry a query string** — that would be a shared-access signature, which is not an accepted credential. Because of that rule the URL is never secret and is printed on the startup banner. Any host is accepted, so sovereign clouds need no extra key. |
| `Signing:Certificate:<SRC>:Blob:Credential` | enum | *(unset)* | `Signing__Certificate__<SRC>__Blob__Credential` | **REQUIRED when the block is present.** One of `ManagedIdentity`, `ServicePrincipal`, `AccountKey`. **Never defaulted** — silently using the host's own Azure identity is not a decision made on your behalf. |
| `Signing:Certificate:<SRC>:Blob:TenantId` | string | *(unset)* | `Signing__Certificate__<SRC>__Blob__TenantId` | **REQUIRED for `ServicePrincipal`.** Required even when `AppId` matches the `AzureKeyVault` block's — that block has no tenant key, and nothing inherits. |
| `Signing:Certificate:<SRC>:Blob:AppId` | string | *(unset)* | `Signing__Certificate__<SRC>__Blob__AppId` | **REQUIRED for `ServicePrincipal`.** Needs **Storage Blob Data Reader** on the container. |
| `Signing:Certificate:<SRC>:Blob:AppSecret` | string | *(unset)* | `Signing__Certificate__<SRC>__Blob__AppSecret` | **REQUIRED for `ServicePrincipal`, SECRET.** Env-var form recommended. |
| `Signing:Certificate:<SRC>:Blob:AccountKey` | string | *(unset)* | `Signing__Certificate__<SRC>__Blob__AccountKey` | **REQUIRED for `AccountKey`, SECRET.** Grants full data-plane access to the whole account and cannot be scoped down; warned about at startup. |

:::danger Under `Pfx`, the blob is the signing key
An account key grants full data-plane access to the entire storage account, cannot be scoped down, and
does not expire. Under `AzureKeyVault` the blob holds a `.cer` — public material. Under `Pfx` it holds
a PKCS#12 file, so **a leaked account key is your signing key.** Prefer `ManagedIdentity`, or
`ServicePrincipal` where the host can reach a tenant.
:::

The file is read **once, at boot** — a renewed blob needs a restart, exactly as a renewed local file
does — and an unreachable blob **stops the host from starting**, because a profile with no signing
material cannot sign at all. See [Certificates](certificates.md#reading-the-file-from-a-blob).

See [Certificates](certificates.md) for thumbprint discovery commands, the Azure setup walkthrough,
and a deeper look at each source.

## `Signing:Profiles[]` — per-folder signing profiles

A **signing profile** bundles every per-folder decision (format, certificate, verify, encrypt,
certificate validation) under a name. Watched folders reference the profile by name via
`Storage:Inputs[].Profile`. Two configuration modes are supported:

- **Legacy mode** (default — `Signing:Profiles[]` omitted or empty). The service synthesises one
  profile named `default` from the existing `Signing:Certificate` block. No config changes are
  needed for a simple single-certificate install.
- **Profile mode** (declare `Signing:Profiles[]`). Each entry is a named profile with its own
  certificate and posture. `Signing:Certificate` is ignored. Every entry validates as if it were
  the global certificate block — the same `Pfx` / `Pkcs11` / `WindowsStore` / `AzureKeyVault` rules
  apply per profile.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:Profiles[].Name` | string | n/a | `Signing__Profiles__0__Name` | **REQUIRED.** Same regex as folder names: `^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$`. Unique across the list. The name is referenced from `Storage:Inputs[].Profile` and surfaces in metric labels, dashboard chips, and audit messages. |
| `Signing:Profiles[].Format` | enum | n/a | `Signing__Profiles__0__Format` | **REQUIRED** for every operator-declared profile: `Pades`, `Cades`, `Xades`, or `XmlNFe`. Only the synthesised legacy default may leave this unset — in which case the format is detected per file by extension. |
| `Signing:Profiles[].Method` | enum | `Local` | `Signing__Profiles__0__Method` | `Local` (sign with the configured local certificate) or `LacunaSigner` (dispatch to Lacuna Signer for a human participant). See [Lacuna Signer integration](lacuna-signer.md). |
| `Signing:Profiles[].Verify` | bool | `true` | `Signing__Profiles__0__Verify` | When false, the worker skips the post-sign verification round-trip. The startup banner emits a warning so the low-trust posture is operator-visible. |
| `Signing:Profiles[].Encrypt` | bool | `false` | `Signing__Profiles__0__Encrypt` | When true, the worker AES-256-GCM-encrypts the signed output. Requires `Encryption:Enabled = true` (the validator refuses the broken combination at startup). |
| `Signing:Profiles[].ValidateCertificate` | bool | `true` | `Signing__Profiles__0__ValidateCertificate` | When false, the worker skips the pre-sign certificate chain / revocation check. The startup banner emits a warning. **Must be `false` when `Method = LacunaSigner`** — there is no local cert to validate. |
| `Signing:Profiles[].PreserveFileExtension` | bool | `false` | `Signing__Profiles__0__PreserveFileExtension` | When true, the signed output keeps the original file's extension using the PAdES-style `.signed` infix: CAdES writes `remessa.signed.rem` instead of `remessa.rem.p7m`; XAdES writes `nota.signed.nfe` instead of `nota.signed.xml`. **Only valid when `Format = Cades` or `Xades`** — PAdES output already preserves `.pdf`, so the validator refuses the flag there. Use when a downstream system (a bank ingesting signed remessas, say) requires the original extension. |
| `Signing:Profiles[].SaveAsPem` | bool | `false` | `Signing__Profiles__0__SaveAsPem` | When true, the CAdES signature is written PEM-encoded (`-----BEGIN PKCS7-----` armor) instead of raw DER, and the output name becomes `<name>.pem` instead of `<name>.p7m`. **Only valid when `Format = Cades`.** Verification always runs on the DER bytes before the PEM encoding; with `Encrypt = true` the BSENC envelope wraps the PEM text. May be combined with `PreserveFileExtension`, in which case the name follows that flag and only the content is PEM. |
| `Signing:Profiles[].CheckCNAB240` | bool | `false` | `Signing__Profiles__0__CheckCNAB240` | When true, every file routed through this profile is parsed and validated as a Banco do Brasil CNAB240 **remessa** before it is signed. A non-compliant file never reaches the signer: the job goes to `Failed` with `ErrorMessage = cnab240.invalid`, the staged copy is relocated to the error folder, and the violations are recorded on the job history. Applies to both `Local` and `LacunaSigner`. Validation is structural only — see [CNAB240 payment files](cnab240.md). Key matching is case-insensitive, so `CheckCnab240` also binds. |
| `Signing:Profiles[].Approval` | nested | absent | `Signing__Profiles__0__Approval__…` | Optional. Present means jobs on this profile park in `AwaitingApproval` before any signature exists. **Only valid alongside `CheckCNAB240 = true`.** See below. |
| `Signing:Profiles[].Certificate.*` | nested | n/a | `Signing__Profiles__0__Certificate__…` | **REQUIRED when `Method = Local`.** Same shape as the global `Signing:Certificate` block. Each profile loads its own certificate at boot; misconfiguration on any profile fails startup with an aggregated error. **Refused when `Method = LacunaSigner`.** |
| `Signing:Profiles[].Signer.Name` | string | n/a | `Signing__Profiles__0__Signer__Name` | **REQUIRED when `Method = LacunaSigner`.** Display name of the participant Lacuna Signer will send the document to. |
| `Signing:Profiles[].Signer.Email` | string | n/a | `Signing__Profiles__0__Signer__Email` | **REQUIRED when `Method = LacunaSigner`.** Participant's email address — must contain `@`. |
| `Signing:Profiles[].Signer.Identifier` | string | n/a | `Signing__Profiles__0__Signer__Identifier` | **REQUIRED when `Method = LacunaSigner`.** Participant's national identifier (CPF in Brazil). |

### `Signing:Profiles[].Approval` — the approval gate

Present means jobs on this profile stop before any signature exists and wait for a human. Only valid
alongside `CheckCNAB240 = true` — an approver who cannot be shown the amount is not approving anything
meaningful, and the validator refuses the combination at startup. Applies to both `Local` and
`LacunaSigner`. Full walkthrough: [Approvals](approvals.md).

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `…Approval.MinimumApprovers` | int | `1` | `Signing__Profiles__0__Approval__MinimumApprovers` | The **quorum**: how many distinct members of the pool must approve. At least 1 and no larger than the pool — a quorum bigger than the pool can never be reached, so every job would park forever, and the validator refuses it. |
| `…Approval.ExpiresAfter` | TimeSpan | absent | `Signing__Profiles__0__Approval__ExpiresAfter` | Optional wait budget in the `d.hh:mm:ss` form — `"2.00:00:00"` is forty-eight hours. Must be positive. A job parked longer is **canceled** with the reason `Approval window expired.` and its staged copy moved to `error/`. Absent (the default) means a parked job waits indefinitely. The window is measured against the budget frozen onto the job at park time. |
| `…Approval.Approvers[]` | array | `[]` | `Signing__Profiles__0__Approval__Approvers__0__…` | **REQUIRED and non-empty** when `Approval` is present. The **pool** of people permitted to approve — *not* a list of people who must all approve. With three entries and `MinimumApprovers: 1`, no individual is required. |
| `…Approval.Approvers[].Name` | string | n/a | `…__Approvers__0__Name` | **REQUIRED.** Display name. It is what the audit record shows for this approver. |
| `…Approval.Approvers[].Email` | string | n/a | `…__Approvers__0__Email` | **REQUIRED**, must contain `@`, and must be unique within the pool (case-insensitively). A duplicate would let one human occupy two pool slots and satisfy a quorum of two alone. Masked in console narration and durable logs; stored in full on the job's approval snapshot. |
| `…Approval.Approvers[].Cpf` | string | n/a | `…__Approvers__0__Cpf` | **REQUIRED.** Eleven digits, with or without punctuation (`123.456.789-09` and `12345678909` both bind). Check digits are validated at startup — a typo names a different legal person, and the resulting audit row looks exactly as authoritative as a correct one. Display and audit only: nothing branches on it. Redacted from durable logs. |

:::warning Write `ExpiresAfter` with its days component
A three-component value is `hh:mm:ss` only while the first number is 23 or less; at 24 and above .NET
reads it as **days**, so `"48:00:00"` binds to forty-eight *days* and satisfies the positive-duration
check. It is not refused — a long window may be deliberate — but the **startup banner warns at or above
24 days**, quoting both the resolved figure (`expires=1152h`) and the spelling that fixes it. Boot is
the only moment this is catchable.
:::

#### Example: a payment profile that parks for approval

```json
{
  "Name": "pagamentos-bb",
  "Format": "Cades",
  "Method": "Local",
  "CheckCNAB240": true,
  "Certificate": {
    "Source": "Pfx",
    "Pfx": { "Path": "/etc/bulksigner/pagamentos.pfx", "Password": "" }
  },
  "Approval": {
    "MinimumApprovers": 2,
    "ExpiresAfter": "2.00:00:00",
    "Approvers": [
      { "Name": "Maria Silva",  "Email": "maria@empresa.com.br", "Cpf": "12345678909" },
      { "Name": "João Souza",   "Email": "joao@empresa.com.br",  "Cpf": "111.444.777-35" },
      { "Name": "Ana Ferreira", "Email": "ana@empresa.com.br",   "Cpf": "52998224725" }
    ]
  }
}
```

Startup refuses, before the first job runs: an `Approval` block without `CheckCNAB240`; an empty pool;
a `MinimumApprovers` below 1 or larger than the pool; a malformed email, or the same email twice; a CPF
whose check digits do not match; a non-positive `ExpiresAfter`.

:::danger The per-job approval page is anonymous
The gate is real — a job genuinely does not sign until enough people approve — but `/approve/{jobId}`
requires no credential: anyone who can reach the link can approve *or reject* as anyone in the job's
pool. The startup banner warns on every approval-configured profile, at every boot. Enable
[`ApproverPortal`](#approverportal) or [Entra ID sign-in](#authentraid--optional-microsoft-entra-id-sign-in)
to narrow this, and read [Approvals](approvals.md#security) before exposing the host to a network the
approvers' browsers can reach.
:::

### `Storage:Inputs[].Profile` — per-folder routing

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Storage:Inputs[].Profile` | string? | `null` (→ "default") | `Storage__Inputs__0__Profile` | Optional. References a `Signing:Profiles[].Name`. Null or empty falls back to the `default` profile. Unknown names fail validation at startup. |

### Example: three profiles routed by folder, one per certificate source

```json
"Signing": {
  "PkiSdkLicense": "<env-var>",
  "Profiles": [
    {
      "Name": "nfe",
      "Format": "Xades",
      "Verify": true,
      "Encrypt": false,
      "ValidateCertificate": true,
      "Certificate": {
        "Source": "Pkcs11",
        "Pkcs11": { "ModulePath": "/usr/lib/x86_64-linux-gnu/pkcs11/libsofthsm2.so", "Thumbprint": "...", "PinEnvVar": "BULK_SIGNER_PKCS11_PIN" }
      }
    },
    {
      "Name": "contracts",
      "Format": "Pades",
      "Verify": true,
      "Encrypt": true,
      "ValidateCertificate": true,
      "Certificate": {
        "Source": "Pfx",
        "Pfx": { "Path": "/etc/bulksigner/contracts.pfx", "Password": "" }
      }
    },
    {
      "Name": "invoices",
      "Format": "Pades",
      "Verify": true,
      "Encrypt": false,
      "ValidateCertificate": true,
      "Certificate": {
        "Source": "AzureKeyVault",
        "AzureKeyVault": {
          "Endpoint": "https://my-vault.vault.azure.net/",
          "AppId": "8f2c1b3e-1111-2222-3333-444455556666",
          "AppSecret": "",
          "KeyName": "bulk-signer-invoices-key",
          "CerPath": "/etc/bulksigner/certificates/invoices.cer"
        }
      }
    }
  ]
},
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Inputs": [
    { "Name": "nfe-incoming",       "Path": "/var/lib/bulksigner/input-nfe",       "Profile": "nfe" },
    { "Name": "contracts-incoming", "Path": "/var/lib/bulksigner/input-contracts", "Profile": "contracts" },
    { "Name": "invoices-incoming",  "Path": "/var/lib/bulksigner/input-invoices",  "Profile": "invoices" }
  ]
}
```

The `invoices` profile leaves `AppSecret` empty in the file and takes it from the environment
instead. Array elements are bound by **positional index**, so the secret for the third profile is:

```bash
export Signing__Profiles__2__Certificate__AzureKeyVault__AppSecret='…'
```

:::warning
That index is positional, not name-based. Inserting a new profile *above* `invoices` shifts it to
index `3`, the index-`2` variable stops reaching it, and startup fails with
`Signing:Profiles[3].Certificate.AzureKeyVault.AppSecret is required`. Re-check every indexed
environment variable after reordering the list.
:::

The startup banner lists every resolved profile with its format, certificate source, and
verify/encrypt/validate-cert flags. Profiles with `Verify=false` or `ValidateCertificate=false`
emit additional warnings so the low-trust posture is captured in durable logs.

## `Signer` — Lacuna Signer connection

One Lacuna Signer tenant per host — the endpoint and API key are global, not per-profile. The
validator is **self-gating**: it only enforces `Endpoint` + `ApiKey` when at least one
`Signing:Profiles[]` entry has `Method = LacunaSigner`. Local-only deployments don't need to
configure any of this. See [Lacuna Signer integration](lacuna-signer.md).

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signer:Endpoint` | string | `""` | `Signer__Endpoint` | **REQUIRED** when any profile uses `LacunaSigner`. Base URL for the Lacuna Signer instance. Cloud default: `https://signer.lacunasoftware.com`. On-prem deployments point at the customer's instance. |
| `Signer:ApiKey` | string | `""` | `Signer__ApiKey` | **REQUIRED, SECRET** when any profile uses `LacunaSigner`. Expected shape: `application-id\|secret`. The literal value is scrubbed from logs. |
| `Signer:PollIntervalSeconds` | int | `30` | `Signer__PollIntervalSeconds` | How often the poll worker walks every `AwaitingSigner` row. Bounds: 1–3600. |
| `Signer:TimeoutHours` | int | `168` (7 days) | `Signer__TimeoutHours` | How long a job may sit in `AwaitingSigner` before it is failed with `code = signer.timeout`. Bounds: 1–8760. |
| `Signer:MaxConsecutiveApiFailures` | int | `5` | `Signer__MaxConsecutiveApiFailures` | Per-document consecutive transient-error budget before the poll worker gives up on that document. In-memory counter — restart resets it. |

## `Encryption`

Off by default. The validator runs only when `Enabled = true`.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Encryption:Enabled` | bool | `false` | `Encryption__Enabled` | Master switch. When true, the worker AES-256-GCM-encrypts the signed artifact between verify and promote. |
| `Encryption:Password` | string | `""` | `Encryption__Password` | **SECRET.** PBKDF2 password. Allowed in config (use `appsettings.Production.json`, which is gitignored) but env-var form is preferred. |
| `Encryption:PasswordEnvVar` | string | `BULK_SIGNER_ENCRYPTION_PASSWORD` | `Encryption__PasswordEnvVar` | Name of the env var that supplies the password. If non-empty at boot, it overrides `Encryption:Password`. |
| `Encryption:Salt` | string | `""` | `Encryption__Salt` | **REQUIRED** when `Enabled = true`. Base64-encoded PBKDF2 salt; must decode to at least 16 bytes. Salts are not secret. Changing the salt invalidates every prior envelope. |
| `Encryption:Iterations` | int | `600000` | `Encryption__Iterations` | PBKDF2-HMAC-SHA256 iteration count. Rejected below `10000`. |

:::danger
Password loss is **unrecoverable** — there is no server-side decrypt endpoint and no escrow. See
[Encryption](encryption.md).
:::

## `Auth`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Auth:ApiKey` | string | `""` | `Auth__ApiKey` | **REQUIRED, SECRET.** Static API key, minimum 16 characters. Sent in the `X-API-Key` header by programmatic clients; pasted at `/login` by operators to receive a cookie. |
| `Auth:CookieName` | string | `lbs-auth` | `Auth__CookieName` | Cookie name issued by `/api/auth/login`. `SameSite=Strict`, `HttpOnly`, secure when the request was HTTPS. |
| `Auth:ApiKeyHeader` | string | `X-API-Key` | `Auth__ApiKeyHeader` | HTTP header the API-key scheme reads. Rename only if a reverse-proxy convention forces it. |

See [Security](security.md) for API-key rotation and cookie session lifetime.

### `Auth:EntraId` — optional Microsoft Entra ID sign-in

**Presence-gated — there is no `Enabled` flag.** Omit the section (the default) and every surface
behaves exactly as without it; an air-gapped deployment never needs a Microsoft tenant. Write the
section and all three keys become required: a partially-filled section **fails the host at boot**,
naming the missing key. "Present but empty" silently meaning *off* is exactly how an operator ends up
believing a control is active when it is not.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Auth:EntraId:TenantId` | string | *(absent)* | `Auth__EntraId__TenantId` | **REQUIRED when the section is present.** The directory (tenant) GUID, or a verified domain (e.g. `contoso.onmicrosoft.com`). The multi-tenant pseudo-tenants `common` / `organizations` / `consumers` are refused — the mode is single-tenant by design. |
| `Auth:EntraId:ClientId` | string | *(absent)* | `Auth__EntraId__ClientId` | **REQUIRED when the section is present.** The app registration's application (client) id. Must parse as a GUID — a typo here would otherwise surface only at sign-in time as an opaque `AADSTS` error. |
| `Auth:EntraId:ClientSecret` | string | *(absent)* | `Auth__EntraId__ClientSecret` | **REQUIRED when the section is present, SECRET.** The confidential-client secret for the authorization-code flow. Set it via the environment variable; never commit it. |

There is no fourth key. The authority, the callback path, the scopes, the cookie and its lifetime are
all derived.

#### What turning it on changes

| Surface | Section absent (default) | Section present |
|---------|--------------------------|-----------------|
| `/login` | API-key form | **Sign in with Microsoft** button. The API-key form is gone. |
| `POST /api/auth/login` | Exchanges the API key for a cookie | **Issues no cookie even for a correct key.** Off, not hidden. |
| Existing operator cookies | Valid for their 8-hour sliding window | **Stop satisfying policies immediately.** Plan the cutover as a sign-everyone-out. |
| REST `X-API-Key` | Works | **Unchanged.** Automated clients never notice the mode. |
| Operator pages | Any authenticated cookie | Requires the `Administrator` app role. |
| `/approvals` and the per-job approval page | Approver-portal link only | Link **or** an `Approver` role session; the frozen pool still scopes which jobs are visible. |
| Recorded approval identification | `SelfDeclaredEmail` / `LinkDerivedEmail` | Adds `EntraIdEmail` for decisions made in an Entra session. |
| Sign-out | Clears the cookie | Clears **Bulk Signer's** session only. The Microsoft session survives, so clicking "sign in" again succeeds silently — normal SSO behaviour, not a bug. |

#### The two app roles

Roles come from the token's role claims — app-role assignments and nothing else. There is no
security-group mapping, deliberately: a group mapping would make a tenant-side group edit an invisible
authorization change. Values in the app-registration manifest must match these strings exactly:

| Role value | Opens | Landing page after sign-in |
|------------|-------|----------------------------|
| `Administrator` | Every operator page and action the API-key cookie grants today. No tiers. | `/` |
| `Approver` | The approver surfaces only. The role opens the door; the **frozen pool still decides which jobs** the person sees, matched on their email claim. | `/approvals` |
| *(both)* | Both. Dual-hatting is allowed; separation of duties is held by the role checks. | `/` |
| *(neither)* | Nothing. An account that authenticates but holds no role is **refused** at `/access-denied`. | — |

A validated `returnUrl` always wins over the role-based landing, so deep links keep working.

#### Example — minimal configuration

```json
{
  "Auth": {
    "ApiKey": "…",
    "EntraId": {
      "TenantId": "11112222-3333-4444-5555-666677778888",
      "ClientId": "99990000-aaaa-bbbb-cccc-ddddeeeeffff",
      "ClientSecret": ""
    }
  }
}
```

```bash
Auth__EntraId__ClientSecret='<the client secret from the app registration>'
```

`Auth:ApiKey` is still required — the REST surface's `X-API-Key` is untouched by this mode. All three
Entra keys also bind from the environment alone, which is the natural form for a container or a systemd
unit. The app-registration walkthrough is in
[Installation](installation.md#microsoft-entra-id-sign-in-optional).

## `Storage`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Storage:Root` | string | `data` | `Storage__Root` | **REQUIRED.** Root under which `processing/`, `output/`, `error/`, `db/`, `logs/` are created. Override per target — `/var/lib/bulksigner` on Linux, `C:\ProgramData\Lacuna\BulkSigner\data` on Windows, `/var/lib/bulksigner` in Docker. |
| `Storage:Provider` | enum | `LocalFileSystem` | `Storage__Provider` | `LocalFileSystem` or `AzureFiles`. Chooses where the **work share** — `processing/`, `output/`, `error/` — lives. `logs/` and `db/` always stay local. See below. |
| `Storage:Inputs[]` | array of `{Name, Path, Provider?, AzureFiles?, PollIntervalSeconds?, IgnoredExtensions?, IgnoredPrefixes?, Profile?}` | `[{Name="default", Path="{Root}/input"}]` | `Storage__Inputs__0__Name`, `Storage__Inputs__0__Path`, … | One or more watched input folders. Jobs are tagged with the folder's `Name` and resolved `Profile`. See below for validation rules. |

### `Storage:Inputs[]` — validation rules (enforced at startup)

- `Name` must match `^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$` and be unique across the list —
  lowercase letters, digits, and internal hyphens only, 1–40 characters, starting and ending with
  an alphanumeric. Names appear in URL query strings, metric labels, and the dashboard UI.
- `Path` must be non-empty and resolve to a directory that is **not the same as** and **not a
  sub-/super-directory of** any other entry's path. Overlapping folders would produce
  double-enqueues and ambiguous attribution.
- Soft cap: 16 entries. Higher counts inflate metric cardinality and the Input page beyond useful
  density.
- When `Storage:Inputs` is omitted entirely, the service creates one folder named `default` at
  `{Storage:Root}/input`.

### `Storage:Provider` / `Storage:AzureFiles` — the work share

Optional, and absent from every deployment that keeps its storage local. Setting
`Storage:Provider = AzureFiles` moves the **work share** — `processing/`, `output/` and `error/` — into
an Azure Files share reached through the service's own SDK, with no SMB mount and no host-level
dependency. `Storage:Root` stays local and keeps holding `logs/` and `db/`.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Storage:AzureFiles:AccountName` | string | n/a | `Storage__AzureFiles__AccountName` | **REQUIRED** when a provider resolves to `AzureFiles`. Account name with no suffix; the endpoint is `https://<AccountName>.file.core.windows.net`. |
| `Storage:AzureFiles:ShareName` | string | n/a | `Storage__AzureFiles__ShareName` | **REQUIRED.** The work share. SMB protocol only — an NFS share is refused at boot **by name**. |
| `Storage:AzureFiles:Directory` | string? | `null` (share root) | `Storage__AzureFiles__Directory` | Optional prefix within the share, under which `processing/`, `output/` and `error/` are created. Lets several deployments share one share. **Work-share only** — writing it on a `Storage:Inputs[]` entry is refused at boot, because a folder's directory is its `Path`. |
| `Storage:AzureFiles:Credential` | enum | n/a | `Storage__AzureFiles__Credential` | **REQUIRED**, never defaulted. `ManagedIdentity`, `ServicePrincipal` or `AccountKey`. A partial block for the chosen mode fails the host at boot naming the missing key. |
| `Storage:AzureFiles:TenantId` / `:AppId` | string | n/a | `Storage__AzureFiles__TenantId`, `…__AppId` | `ServicePrincipal` mode only. |
| `Storage:AzureFiles:AppSecret` | string | n/a | `Storage__AzureFiles__AppSecret` | **SECRET.** `ServicePrincipal` mode only. Permitted in config, environment override recommended. |
| `Storage:AzureFiles:AccountKey` | string | n/a | `Storage__AzureFiles__AccountKey` | **SECRET.** `AccountKey` mode only. **Warns at startup**: a shared key is full data-plane access to the whole account, cannot be scoped to one share, and never expires. |

`ManagedIdentity` is **system-assigned only** — a user-assigned identity is not read, and naming one
produces an authentication failure at the first call rather than a configuration error. The credential
is deliberately not `DefaultAzureCredential`, so it never falls back to a developer's own `az login`
identity.

Both token modes need one of the **privileged file data** roles: grant
`Storage File Data Privileged Contributor`, scoped to the share. A read-only role is **not** enough even
for an input folder, since the pipeline leases the input file while staging it and deletes it after
verification. See [Security](security.md#azure-files-storage-credentials).

**One work share, not many.** `processing/`, `output/` and `error/` must sit together, because
promoting a verified artifact and relocating a failed job's staged copy are **renames**, and Azure's
rename cannot cross shares or storage accounts. Input folders stay plural and independent — each may
name its own account and share — because staging from one is a *copy*.

**What startup refuses, and what it only reports.** An unrecognised provider or credential mode, a
partial credential block, an NFS share, an `azurefiles://` path in `Storage:Root`, `Logging:File:Path`
or — while `Database:Provider` is `Sqlite` — `ConnectionStrings:Default`, and an input folder that
collides with one of the work roots on the work share all **stop the host**. An **unreachable** share
does not: it is reported on the ops console, on the System page and by `/api/ready`, and the host comes
up — a share that is down at 03:00 must not turn a restart into a service that will not start.

:::note A fourth thing appears in the work share, and it is not a folder
`bulksigner-instance.json` sits beside `processing/`, `output/` and `error/`. It records the host name
and process id of the instance that claimed the share, and is held under a non-expiring lease for that
instance's life. Leave it alone: it is what tells you at the next boot that a second instance is
signing from this share. See
[Operations](operations.md#when-another-instance-appears-to-own-the-work-share).
:::

Downloads are always streamed through the application — no shared-access-signature URL is ever minted
for a signed artifact, so `GET /api/jobs/{id}/output` behaves identically whichever provider holds
`output/`. There is no retry knob, deliberately: the SDK policy is stated in code (three attempts,
exponential from 500 ms to 5 s, 30-second network timeout) and this product already retries above it.

#### Per-folder overrides

Each watched input folder chooses its own provider and inherits the rest, so reading a customer's share
in *their* account while the work share stays in yours is a per-folder override rather than a second
deployment.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Storage:Inputs[N].Provider` | enum? | inherits `Storage:Provider` | `Storage__Inputs__N__Provider` | `LocalFileSystem` or `AzureFiles`, per folder. One folder can read a share while another stays on local disk during a migration. |
| `Storage:Inputs[N].Path` | string | n/a | `Storage__Inputs__N__Path` | **REQUIRED.** A filesystem path on a local folder; on an `AzureFiles` folder, the **directory within the share**, `/`-separated. A backslash is refused at boot — it is a local separator with no meaning on a share. |
| `Storage:Inputs[N].AzureFiles:*` | object | inherits `Storage:AzureFiles` field by field | `Storage__Inputs__N__AzureFiles__AccountName`, … | Same members as the block above, minus `Directory`. Inheritance tests **null, not empty**: an omitted key is inherited, and an empty string is this folder saying it has no such value. `Directory` is **refused** here. |
| `Storage:Inputs[N].PollIntervalSeconds` | int? | inherits `WatchedFolder:PollIntervalSeconds` | `Storage__Inputs__N__PollIntervalSeconds` | **REQUIRED in effect on an `AzureFiles` folder** — one that resolves to no interval at all is refused at boot. On a **local** folder, *presence here is the opt-in*: writing an interval adds periodic enumeration to the folder's watcher behaviour, which is the fix for a folder mounted from a network share. Bounds: 5–3600. |

:::info Whether a folder polls and how often are two separate questions
Presence of `Storage:Inputs[N].PollIntervalSeconds` is what opts a *local* folder in; the global
`WatchedFolder:PollIntervalSeconds` (default `30`) is consulted only for the **cadence**. An existing
local deployment that writes no per-folder interval keeps its event-driven behaviour unchanged.
:::

#### Example: the work share on Azure Files, inputs still local

```json
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Provider": "AzureFiles",
  "AzureFiles": {
    "AccountName": "contosofiles",
    "ShareName": "bulksigner",
    "Directory": "prod",
    "Credential": "ManagedIdentity"
  },
  "Inputs": [
    { "Name": "default", "Path": "/var/lib/bulksigner/input", "Provider": "LocalFileSystem" }
  ]
}
```

Signed artifacts land in `bulksigner/prod/output` in the `contosofiles` account; `logs/` and `db/` stay
under `/var/lib/bulksigner`. Drop the `Provider` line from the input folder and it inherits
`AzureFiles`, in which case its `Path` becomes a directory within the share and it is enumerated on
`WatchedFolder:PollIntervalSeconds` — Azure Files publishes no change notifications, so a folder that
resolves to no interval at all is refused at boot.

#### Example: input folders on a share too, authenticating with an account key

For a host that cannot reach the tenant at all — an on-premises server with no managed identity and no
app registration — `AccountKey` is the remaining mode:

```json
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Provider": "AzureFiles",
  "AzureFiles": {
    "AccountName": "contosofiles",
    "ShareName": "bulksigner",
    "Credential": "AccountKey"
  },
  "Inputs": [
    { "Name": "remessas", "Provider": "AzureFiles", "Path": "entrada/remessas", "PollIntervalSeconds": 30 },
    { "Name": "contabil", "Path": "entrada/contabil", "AzureFiles": { "ShareName": "financeiro" }, "PollIntervalSeconds": 300 },
    { "Name": "legacy",   "Provider": "LocalFileSystem", "Path": "/mnt/legacy/incoming" }
  ]
}
```

```bash
Storage__AzureFiles__AccountKey=<storage account key>   # env var recommended; never commit
```

Five things this example shows:

- **The key is one secret for every share it opens.** `contabil` overrides `ShareName` and nothing
  else, so `AccountName`, `Credential` and the key are inherited field by field. Writing
  `"AccountKey": ""` on a folder is that folder saying it has *no* key, not a request to inherit one.
- **`AccountKey` warns at every boot**, on the ops console and in the durable log, naming each share it
  opens.
- **No `Directory` prefix, so the work roots sit at the share root.** Input folders may share the work
  share, but an entry whose `Path` *is*, sits inside, or contains one of the three roots is refused at
  boot — that collision would otherwise delete one signed artifact per iteration while reporting every
  job `Completed`.
- **Both remote folders name their own interval, and the local one deliberately names none.** `legacy`
  writing no interval is what keeps it event-driven.
- **The banner confirms it,** printing `azure credential = AccountKey`,
  `work share = contosofiles/bulksigner`, the per-folder providers, and `azure shares = 2 reachable` —
  the shares are probed separately, so a key that opens one and not the other is visible at startup.

### `Storage:Inputs[].IgnoredExtensions` / `Storage:Inputs[].IgnoredPrefixes` (per-folder)

Optional arrays. The effective ignore list is the **union** of the global
`WatchedFolder:IgnoredExtensions` / `WatchedFolder:IgnoredPrefixes` baseline and the per-folder
additions. Per-folder lists *add* to the baseline; they cannot un-ignore something the global list
already filters. Example: with the default baseline (`.tmp`, `.part`, `.crdownload`, `.swp`), a
folder declaring `IgnoredExtensions: [".bak"]` filters `.bak` *and* `.tmp` etc.

### Example: two folders, one with an extra ignore rule

```json
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Inputs": [
    { "Name": "default", "Path": "/var/lib/bulksigner/input" },
    {
      "Name": "legal",
      "Path": "/mnt/legal/incoming",
      "IgnoredExtensions": [".bak"]
    }
  ]
}
```

## `Pipeline`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Pipeline:PollIntervalSeconds` | int | `2` | `Pipeline__PollIntervalSeconds` | How often the worker polls the queue when idle. Lower = faster pickup, more SQLite reads. Bounds: 1–3600. |
| `Pipeline:MaxConcurrency` | int | `1` | `Pipeline__MaxConcurrency` | Upper bound on concurrent in-flight jobs. Default `1` is sequential. Increase for throughput on PFX-backed deployments. Bounds: 1–32. **PKCS#11 / WindowsStore: keep at 1 unless the token / CSP allows concurrent sessions — see [Certificates](certificates.md).** |

## `WatchedFolder`

The stability detector guards against picking up a file that is still being written — the watcher
waits until size and last-write-time stay identical across `StabilityRequiredSamples` consecutive
polls.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `WatchedFolder:StabilityPollIntervalMs` | int | `500` | `WatchedFolder__StabilityPollIntervalMs` | Interval between stability checks. Bounds: 50–10000. |
| `WatchedFolder:StabilityRequiredSamples` | int | `3` | `WatchedFolder__StabilityRequiredSamples` | Consecutive identical samples needed before enqueue. Bounds: 1–100. |
| `WatchedFolder:StabilityConcurrency` | int | `8` | `WatchedFolder__StabilityConcurrency` | How many candidate files each folder stabilizes and enqueues concurrently. The stability check blocks roughly `StabilityRequiredSamples × StabilityPollIntervalMs` per file, so processing them one at a time caps ingestion to about one file per that interval; overlapping the waits keeps the pipeline fed on bulk drops. Bounds: 1–64. |
| `WatchedFolder:StabilityTimeoutSeconds` | int | `60` | `WatchedFolder__StabilityTimeoutSeconds` | Maximum wait before giving up on a never-stable file. Bounds: 1–3600. |
| `WatchedFolder:PollIntervalSeconds` | int? | `30` | `WatchedFolder__PollIntervalSeconds` | **How often a folder that polls is enumerated — not whether it polls.** Overridden per folder by `Storage:Inputs[N].PollIntervalSeconds`, and it is *that* key's presence which turns polling on for a local folder; setting this one alone changes nothing anywhere. An `AzureFiles` folder always polls and takes this value unless it names its own. Bounds: 5–3600. |
| `WatchedFolder:IgnoredExtensions` | array | `[".tmp", ".part", ".crdownload", ".swp"]` | n/a (use config) | File extensions the watcher ignores entirely. |
| `WatchedFolder:IgnoredPrefixes` | array | `[".", "~$"]` | n/a (use config) | File-name prefixes the watcher ignores (dotfiles, Office lock files). |

## `Upload`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Upload:MaxBytes` | long | `104857600` (100 MiB) | `Upload__MaxBytes` | Hard cap on the `POST /api/files` request body. Raise for scan-heavy PDFs. Minimum 1024. |

## `Dashboard`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Dashboard:PollIntervalSeconds` | int | `5` | `Dashboard__PollIntervalSeconds` | Server-side refresh tick for live dashboard pages. Bounds: 1–60. |

## `ApproverPortal`

Backs the per-approver queue at `/approvals`. **Off by default**, so a deployment that already uses the
[approval gate](approvals.md) upgrades without touching configuration. Read once at startup — change
any of it and restart.

A top-level section rather than a per-profile block on purpose: a link identifies a *person*, and the
same person routinely sits in the pools of several profiles.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `ApproverPortal:Enabled` | bool | `false` | `ApproverPortal__Enabled` | Master switch. When false no link resolves, no session is issued, and the only approval surface is the per-job link. |
| `ApproverPortal:LinkSecret` | string | — | `ApproverPortal__LinkSecret` | **REQUIRED when enabled, SECRET — never commit it.** Every approver's link is `HMAC-SHA256(this, their email)`, so anyone who reads it can approve payment files as any configured approver. Minimum 32 characters, enforced at startup. Must be durable: generating one per boot would invalidate every approver's bookmark on every restart. **Changing it revokes every approver's link at once** — the intended blunt instrument for "the secret leaked". |
| `ApproverPortal:DecidedLookback` | TimeSpan | `90.00:00:00` | `ApproverPortal__DecidedLookback` | How far back the portal's *Decided* tab reaches. Bounds what a stolen link is worth. The tab is also capped at 200 rows per load and says so when the cap bites. |
| `ApproverPortal:SessionLifetime` | TimeSpan | `30.00:00:00` | `ApproverPortal__SessionLifetime` | Lifetime of the cookie issued by the link exchange. Sliding, so an approver working through a queue is not signed out mid-decision. |

The validator refuses `Enabled = true` when **no** signing profile declares an `Approval` block — a
portal over no pools shows every approver an empty queue and looks broken.

```json
{
  "ApproverPortal": {
    "Enabled": true,
    "LinkSecret": "replace-with-32+-random-characters-kept-secret",
    "DecidedLookback": "90.00:00:00",
    "SessionLifetime": "30.00:00:00"
  }
}
```

Each approver's link is shown on the **System** dashboard page, one per configured person. Send each
approver only their own; treat it as that person's password. See
[Approvals](approvals.md#the-approver-portal).

## `Console:Dashboard`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Console:Dashboard:Enabled` | bool | `true` | `Console__Dashboard__Enabled` | Whether the live terminal dashboard may replace per-job log narration on stdout. It activates only when this is true **and** the process is a foreground console (not Windows Service / systemd / Docker) **and** stdout is an interactive terminal. Service and container installs are therefore unaffected by this key. Set it to `false` when you run the binary in the foreground and want plain streaming logs. |

## Display language — deliberately not configurable

There is no configuration section for the UI language, and that is a decision rather than a gap. The
web surfaces render in `en-US` or `pt-BR` as a **per-browser presentation preference**: the language
selector posts to the anonymous `POST /api/culture`, which writes the standard ASP.NET Core culture
cookie for a year. Resolution order is **cookie → the browser's `Accept-Language` → `en-US`**, so a
Brazilian operator gets Portuguese on first load without anyone configuring anything, and there is no
server-wide setting to override what an individual reader chose.

What stays English permanently regardless of the reader's choice: persisted audit messages (they are
evidence), log output, the console dashboard, REST problem prose, `JobStatus` wire values, and all
CNAB240 vocabulary and formatting. See [Dashboard](dashboard.md#display-language).

## `LogViewer`

Backs the in-memory recent-exception store and the `/logs` dashboard page. All values are read once at
startup — change them and restart.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `LogViewer:Enabled` | bool | `true` | `LogViewer__Enabled` | Master switch. When false the in-memory sink is not wired, the `/logs` page shows a disabled notice, and the nav link is hidden. |
| `LogViewer:MaxEntries` | int | `20` | `LogViewer__MaxEntries` | Size of the bounded in-memory buffer and the ceiling on rendered entries. Oldest entries are evicted past this limit. Bounds: 1–1000. |
| `LogViewer:RefreshIntervalSeconds` | int | `5` | `LogViewer__RefreshIntervalSeconds` | Automatic refresh tick for the `/logs` page. Bounds: 1–60. The page also has a manual refresh button. |
| `LogViewer:Levels` | string[] | `["Error","Fatal"]` | `LogViewer__Levels__0`, … | Log levels the store captures (case-insensitive). Valid names: `Verbose`, `Debug`, `Information`, `Warning`, `Error`, `Fatal`. Empty or unknown names fail startup. **`Logging:File:MinimumLevel` still applies first** — widening this below that minimum captures nothing, because those events never reach the sink. |

See [Dashboard](dashboard.md#logs--recent-exceptions).

## `Metrics`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Metrics:RequireApiKey` | bool | `true` | `Metrics__RequireApiKey` | When true, `/api/metrics` requires API-key or cookie auth. Set false only if your Prometheus scraper sits inside the trust boundary and the network is locked down. |

See [REST API](rest-api.md) for the full inventory of metrics instruments.

## `Statistics`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Statistics:Enabled` | bool | `true` | `Statistics__Enabled` | Master switch. When false the collector is a no-op (no recording, no locking), no row is written, and the dashboard panel is hidden. Statistics are one row per completed job in the operational store: they **survive restarts**, and every instance of a cluster reads the same figures. Turning the switch off does not delete rows already recorded — turning it back on shows them again; clearing the panel is [Clear Jobs](operations.md#clear-jobs). |

See [Job statistics](statistics.md) for what each number means.

## `Backup`

Backs the database backup feature: the `/backup` dashboard page, `GET|POST /api/backup`, and the
scheduler. **Off by default, and SQLite only** — with `Database:Provider = SqlServer`,
`Backup:Enabled = true` is a **boot refusal** rather than a silent no-op, because backing up the store
is that DBMS regime's job. Since cluster mode requires `SqlServer`, the combination is unreachable
there by construction.

Read once at startup. Only the selected destination's block is read at all.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Backup:Enabled` | bool | `false` | `Backup__Enabled` | Master switch. When false nothing is scheduled, the start button and `POST /api/backup` refuse with `backup.disabled`, and the page explains what to turn on. **`true` under `Database:Provider = SqlServer` refuses the boot**, naming both keys and the remedy. |
| `Backup:Destination` | string | `Disk` | `Backup__Destination` | `Disk`, `S3` or `AzureBlob`. Absent means `Disk` — the destination that needs no credential. Case-insensitive; an unrecognised value is refused at boot naming the key, your value and the valid names. |
| `Backup:IntervalHours` | int? | *(absent)* | `Backup__IntervalHours` | How often a backup runs automatically. **Absent means manual only** — the feature is on, the button works, nothing runs on a timer. Bounds 1–8760. An interval rather than a time of day, deliberately: a time of day needs a timezone, which this product does not have. Anchored on the last **successful** run, so a restart does not reset it and a failed run does not consume it. Never having backed up means a backup is due immediately. |
| `Backup:RetainCount` | int | `14` | `Backup__RetainCount` | How many artifacts to keep at the destination. `0` keeps **every** one — and does not even list the destination — for a bucket or container whose own lifecycle rules prune. Bounds 0–1000. A count rather than an age, because a count survives somebody changing `IntervalHours`. The prune runs only after a successful store and **cannot fail the run**. |
| `Backup:Disk:Path` | string | — | `Backup__Disk__Path` | **REQUIRED when `Destination = Disk`.** No default, on purpose: every plausible one would put the backup on the same disk as the database it is a backup of. A UNC path or mounted network volume is fine. Four boot refusals: absent; the product's own `azurefiles://` scheme (a backup destination is deliberately **not** a storage provider); a path inside a **watched input folder** (the pipeline would ingest, sign and then *delete* the backup); and a path inside `processing/`, `output/`, `error/` or `db/`. |
| `Backup:S3:BucketName` | string | — | `Backup__S3__BucketName` | **REQUIRED when `Destination = S3`.** |
| `Backup:S3:Region` | string | — | `Backup__S3__Region` | **REQUIRED when `Destination = S3` and no `ServiceUrl` is set.** The region's system name, e.g. `sa-east-1`. Not defaulted: the SDK would fall back to the host's environment or shared profile, so an omitted region decides where a copy of the payment-approval record is stored by accident. |
| `Backup:S3:Prefix` | string | `""` | `Backup__S3__Prefix` | Key prefix within the bucket. Normalised — `bulksigner`, `bulksigner/` and `/bulksigner/` all mean the same thing. |
| `Backup:S3:Credential` | string | — | `Backup__S3__Credential` | **REQUIRED when `Destination = S3`.** `AccessKey` or `InstanceRole`. **Never defaulted** — the AWS SDK's own chain would authenticate as whoever the host happens to be. A presigned URL is not an accepted credential. |
| `Backup:S3:AccessKeyId` | string | — | `Backup__S3__AccessKeyId` | **REQUIRED when `Credential = AccessKey`.** Deliberately **not** redacted from logs: it is the identifier half of the pair, and masking it would remove the one value that says which key a refused request used. Setting it under `InstanceRole` is a boot refusal. |
| `Backup:S3:SecretAccessKey` | string | — | `Backup__S3__SecretAccessKey` | **REQUIRED when `Credential = AccessKey`. SECRET.** Setting it under `InstanceRole` is a boot refusal. |
| `Backup:S3:ServiceUrl` | string | — | `Backup__S3__ServiceUrl` | An S3-compatible **API** endpoint instead of AWS — MinIO, Ceph, Wasabi, Backblaze B2. Absolute `http://` or `https://`. When set, `Region` becomes optional. |
| `Backup:S3:ForcePathStyle` | bool | `false` | `Backup__S3__ForcePathStyle` | Address buckets as a path segment (`host/bucket/key`) rather than as a subdomain. `false` is what AWS itself wants; **almost every S3-compatible endpoint needs `true`** — leaving it false against MinIO or Ceph produces a DNS failure naming a hostname you never configured. |
| `Backup:AzureBlob:ContainerUrl` | string | — | `Backup__AzureBlob__ContainerUrl` | **REQUIRED when `Destination = AzureBlob`.** The full https URL of the container, e.g. `https://contoso.blob.core.windows.net/bulksigner-backups`. Refused at boot when it is not absolute https, does not name an account, names more than one path segment (put a path in `Prefix`), or **carries a query string** — which is how a SAS arrives, and refusing one keeps this value permanently non-secret. The container is **not** created for you. |
| `Backup:AzureBlob:Prefix` | string | `""` | `Backup__AzureBlob__Prefix` | Blob-name prefix within the container. Normalised like the S3 one. |
| `Backup:AzureBlob:Credential` | string | — | `Backup__AzureBlob__Credential` | **REQUIRED when `Destination = AzureBlob`.** `ManagedIdentity`, `ServicePrincipal` or `AccountKey` — spelled exactly as `Storage:AzureFiles`' is. **Never defaulted.** `ManagedIdentity` is **system-assigned only**. The identity needs **`Storage Blob Data Contributor`** — write, not the `Storage Blob Data Reader` a certificate blob needs. |
| `Backup:AzureBlob:TenantId` / `AppId` | string | — | `Backup__AzureBlob__TenantId`, … | **REQUIRED when `Credential = ServicePrincipal`.** |
| `Backup:AzureBlob:AppSecret` | string | — | `Backup__AzureBlob__AppSecret` | **REQUIRED when `Credential = ServicePrincipal`. SECRET.** Setting it under another mode is a boot refusal — a secret this deployment does not use is one nobody will rotate. |
| `Backup:AzureBlob:AccountKey` | string | — | `Backup__AzureBlob__AccountKey` | **REQUIRED when `Credential = AccountKey`. SECRET.** Grants full data-plane access to the **entire** storage account and cannot be scoped to one container. Setting it under another mode is a boot refusal. |

Nothing inherits from `Storage:AzureFiles` or from a signing material blob's block, even where the same
Entra application is named: those credentials grant read access to different resources, and this one
needs **write**.

### Example: an interval to a local volume

```jsonc
{
  "Backup": {
    "Enabled": true,
    "Destination": "Disk",
    "IntervalHours": 24,
    "RetainCount": 14,
    "Disk": { "Path": "/backup/bulksigner" }
  }
}
```

### Example: an S3-compatible endpoint (MinIO)

```jsonc
{
  "Backup": {
    "Enabled": true,
    "Destination": "S3",
    "IntervalHours": 12,
    "RetainCount": 0,                      // the bucket's lifecycle rules prune
    "S3": {
      "BucketName": "bulksigner-backups",
      "ServiceUrl": "https://minio.internal:9000",
      "ForcePathStyle": true,
      "Credential": "AccessKey",
      "AccessKeyId": "…",
      // In practice set via Backup__S3__SecretAccessKey, not here.
      "SecretAccessKey": ""
    }
  }
}
```

See [Retention](retention.md#backup-discipline) for how this fits the wider retention picture.

## `Cluster` — multi-instance deployment

Cluster mode — more than one active instance cooperating over one operational store and one work
share. **Off by default, and off is byte-for-byte the single-instance product**: a deployment that
never writes this section needs nothing and changes nothing on upgrade.

These three keys are the smallest part of turning the mode on. What it costs is in
[High availability and its limits](high-availability.md) — read that before setting `Enabled = true` —
and how to deploy it is [Azure App Service (cluster mode)](azure.md), which also carries the platform
settings (session affinity, the health-check path, Always On) that have no key here because they are
not this product's to set.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Cluster:Enabled` | bool | `false` | `Cluster__Enabled` | Master switch. When true the boot refusals below apply; when false or absent, no cluster mechanism is registered and nothing changes. The supported multi-instance topology is exactly one: an Azure Web App (Linux container) scaled out on one App Service Plan. |
| `Cluster:HeartbeatSeconds` | int | `15` | `Cluster__HeartbeatSeconds` | How often this instance writes one row saying it is alive. Range `[5, 300]`, refused at boot outside it. Read only when the mode is on. |
| `Cluster:StaleAfterSeconds` | int | `60` | `Cluster__StaleAfterSeconds` | How long an instance may go quiet before its siblings presume it dead. Range `[15, 3600]`, and refused at boot when it is worth **under three cadences** — a threshold that short presumes death on one or two missed beats, and a beat goes missing for reasons that are not death (a collection pause, a store that took a moment, a container the platform briefly starved). The default is four cadences. |

### What `Enabled = true` refuses at boot

Every cluster configuration that could not have worked is a refusal naming the keys and the remedy:

- **`Database:Provider` must be `SqlServer`.** The store is the cluster's coordination point, and a
  SQLite file cannot be shared between hosts.
- **The work share and every watched input folder must be on `AzureFiles`.** The local file store's
  lease excludes nothing outside its own process, and a folder local to one instance is invisible to
  its siblings. The zero-config synthesised `default` folder is local, so a first run with the switch
  on refuses too.
- **The per-host certificate sources `Pkcs11` and `WindowsStore` are refused.** A token or a machine
  store lives on one machine, and cluster instances are fungible. Use `Pfx` (ideally
  [read from a blob](#blob--reading-the-file-from-azure-blob-storage)) or `AzureKeyVault`. A stale
  `Certificate` block on a `Method = LacunaSigner` profile stays tolerated, as it is everywhere else.

One refusal is **not** about configuration at all, and is listed here because it reads like one: with
the mode on, the work share's own marker records which operational store the share belongs to, and an
instance whose store does not match refuses to start naming both. That is a fact about the share rather
than about `appsettings.json`, and it is the one thing that catches two clusters pointed at one work
share.

One cluster condition is deliberately a **warning, not a refusal**: cluster mode with
`Logging:AzureTable:Enabled = false` logs a Critical at startup, because on the supported topology the
instance disk is ephemeral and rolled log files are discarded on every recycle. The never-only-sink
rule keeps the local file sink on either way.

### Identity and liveness

**Identity is derived, never configured, and there is deliberately no key for it.** An instance calls
itself by the platform's own instance id (`WEBSITE_INSTANCE_ID`, which App Service sets on every
instance) or by the machine name where there is no such variable, plus a fresh **incarnation**
identifier for each boot. App Service creates and destroys instances by scale rule, so a name an
operator typed would be a key nobody could keep truthful; the incarnation is what lets an instance tell
*its own previous life* from a stranger.

Each instance keeps one row in the operational store — identity, incarnation, application version, when
it started, when it last said it was alive — refreshed on `Cluster:HeartbeatSeconds` and presumed dead
past `Cluster:StaleAfterSeconds`. The [System page](dashboard.md#system--system) renders that table as
its **Instances** view. Two guards ride on it, deliberately different in kind:

- **A booting instance that finds its own identity already beating refuses to start**, naming the
  identity on the console and in the log. Identity is what recovery, takeover and every per-instance
  surface are built on, so two processes answering to one name makes all of them wrong at once and
  there is no degraded mode to offer.
- **Live instances on a different application version log a Critical and the boot continues.** Upgrades
  on the supported topology are stop-the-world, so this is a deployment slot swapped into a running
  cluster, or a deploy that did not stop every instance. It is a warning rather than a refusal on
  purpose: refusing would block instances from coming up for as long as a *dead* old-version heartbeat
  took to go stale, which is exactly when an operator needs them up.

If the operational store is unreachable at boot the registration is skipped along with the migration,
the host still starts, and the instance is simply absent from the Instances view until it is restarted
with the store reachable.

### The session key ring has no key of its own, and needs none

Off the switch, the Data Protection ring is `keys/` under `Storage:Root`, DPAPI-encrypted on Windows.
On, it is rows in the operational store, in plaintext, guarded by the database's own access control —
because a ring derived from a local root is structurally one host's, so behind a load balancer a cookie
minted by one instance is rejected by the next, which reaches people as an intermittent sign-out with
nothing anywhere reporting it. Both cookies ride it, so it strands operators and approvers alike.

It follows the switch rather than a setting deliberately: a deployment that can choose the placement
independently of the topology is a deployment that can choose the broken combination. See
[Security](security.md) and
[High availability](high-availability.md#the-session-key-ring-is-plaintext-in-the-store).

## `Telemetry`

Opt-in Azure Application Insights export. Off by default; when off, the service has no Application
Insights dependency and makes no outbound calls on its behalf.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Telemetry:Enabled` | bool | `false` | `Telemetry__Enabled` | Master switch. When `true`, a connection string is **required** — startup fails without one. |
| `Telemetry:ConnectionString` | string? | `null` | `Telemetry__ConnectionString` | **SECRET.** Application Insights connection string. Leave unset to supply it via the standard `APPLICATIONINSIGHTS_CONNECTION_STRING` environment variable instead. |
| `Telemetry:RoleName` | string | `Lacuna.BulkSigner` | `Telemetry__RoleName` | Reported as the `cloud_RoleName` dimension, so several services sharing one resource stay distinguishable. |

See [Telemetry](telemetry.md) for what is collected and the KQL queries to read it.

## `RateLimiting`

Per-IP fixed-window policies.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `RateLimiting:Enabled` | bool | `true` | `RateLimiting__Enabled` | Master switch. Disable for closed-network installs. |
| `RateLimiting:Upload:PermitsPerWindow` | int | `30` | `RateLimiting__Upload__PermitsPerWindow` | Requests allowed per window for `POST /api/files`. |
| `RateLimiting:Upload:WindowSeconds` | int | `60` | `RateLimiting__Upload__WindowSeconds` | Window length for the upload policy. |
| `RateLimiting:Upload:QueueLimit` | int | `0` | `RateLimiting__Upload__QueueLimit` | How many over-limit requests wait vs. being rejected immediately. 0 = reject immediately. |
| `RateLimiting:Actions:PermitsPerWindow` | int | `60` | `RateLimiting__Actions__PermitsPerWindow` | Requests allowed per window for action endpoints (retry, cancel, rescan, cleanup, pause, resume). |
| `RateLimiting:Actions:WindowSeconds` | int | `60` | `RateLimiting__Actions__WindowSeconds` | Window length for the actions policy. |
| `RateLimiting:Actions:QueueLimit` | int | `0` | `RateLimiting__Actions__QueueLimit` | Queue depth for the actions policy. |
| `RateLimiting:Approval:*` | same shape | `10` per `60` s | `RateLimiting__Approval__PermitsPerWindow`, … | Budget for the anonymous `POST /api/approvals/{id}` route, separate from the operator actions. Job ids are v4 GUIDs, and this policy is what keeps them unguessable against a machine rather than a person. |
| `RateLimiting:Export:*` | same shape | — | `RateLimiting__Export__PermitsPerWindow`, … | Budget for the approver portal's Excel export. Bounds how fast copies of a queue can be made. |

Rate-limited responses carry `code = "rate-limited"` in the error envelope.

## `Hosting`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Hosting:RequireHttps` | bool | `false` | `Hosting__RequireHttps` | Gates the in-process HTTPS redirect. `false` (default) for service and Docker installs that terminate TLS at a reverse proxy. Surfaced in the ready-summary banner as `https redirect = on/off`. |
| `Hosting:ForwardedHeaders:Enabled` | bool | `false` | `Hosting__ForwardedHeaders__Enabled` | Read the client's address and scheme from `X-Forwarded-For` and `X-Forwarded-Proto`. Off by default, and off is byte-for-byte the product as it shipped — no middleware is added at all. Turning it on **requires a trust set**: one of `TrustAnyProxy`, `KnownProxies` or `KnownNetworks`, or the boot is refused. Surfaced in the ready-summary banner as `forwarded headers = …`, naming the trust set rather than only `on`. |
| `Hosting:ForwardedHeaders:TrustAnyProxy` | bool | `false` | `Hosting__ForwardedHeaders__TrustAnyProxy` | Believe a forwarded header from **any** upstream address. The intended setting on Azure App Service, whose front door has no stable address to list. ⚠️ On a reverse-proxy deployment it means anybody who can reach Kestrel directly can name themselves any client address. Cannot be combined with the two keys below — a list beside it would be ignored, so it is refused at boot rather than resolved by precedence. |
| `Hosting:ForwardedHeaders:KnownProxies` | string[] | `[]` | `Hosting__ForwardedHeaders__KnownProxies__0` | Bare IP addresses whose forwarded headers are believed (`10.4.0.7`, `::1`). A value that is not an IP address is refused at boot, naming it. **The framework's loopback defaults are not kept** — when this section names a trust set, that set is the whole of it, so a proxy on this host must be listed. |
| `Hosting:ForwardedHeaders:KnownNetworks` | string[] | `[]` | `Hosting__ForwardedHeaders__KnownNetworks__0` | CIDR ranges whose forwarded headers are believed (`10.4.0.0/16`). Refused at boot if it is not a CIDR range, or if the address carries bits below its prefix length — `10.4.0.7/16` describes `10.4.0.0/16`, and a file that says one range while the host trusts another is worth failing over. |
| `Hosting:ForwardedHeaders:ForwardLimit` | int | `1` | `Hosting__ForwardedHeaders__ForwardLimit` | How many entries are taken off the right-hand end of each forwarded header — one per proxy the request genuinely passes through, which is `1` for both a platform load balancer and a single reverse proxy. Range `[1, 16]`, refused at boot outside it; the framework's "unlimited" is deliberately not reachable, because an unlimited chain is one whose far end the client wrote. |

### Why forwarded headers are a product key and not just the framework's switch

ASP.NET Core has its own switch, `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, and it trusts **any**
upstream with no way to narrow that. Setting both it and `Hosting:ForwardedHeaders:Enabled` is
**refused at boot**, naming both: each adds forwarded-headers processing, so every header would be
processed twice and a `ForwardLimit` of one would silently believe two hops.

Two things in the product act on the client address, which is why whose headers you believe is a
configuration question rather than a detail:

- **The rate-limit partition.** Behind a load balancer every caller arrives from one address, so the
  anonymous approval route's per-client budget becomes a single shared one for the whole world.
- **The address recorded on an approval**, which is one of the compensating controls for the anonymous
  approval route. An address that is really the load balancer's records nothing about who decided.

On Azure App Service the intended setting is `Enabled = true` with `TrustAnyProxy = true`, and the
hazard that carries is closed by locking the origin — see
[Azure App Service](azure.md#inbound--front-door-in-front-of-the-app).

## `ApproverSecondFactor`

A TOTP second factor for approvers — a code from an authenticator app, held against a per-person
enrolment. **Off by default**, so upgrading changes nothing. Read once at startup; change any of it and
restart.

Host-wide rather than per signing profile, and that is the load-bearing choice rather than a
convenience: a per-profile rule is frozen onto the job when it parks, and authentication must not be in
that snapshot — the snapshot records *which rule applied*, so editing this file can never be an
authorisation bypass. A host-wide switch has nothing per-profile to freeze, so a job that parked before
the factor was enabled needs no migration and no special case.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `ApproverSecondFactor:Enabled` | bool | `false` | `ApproverSecondFactor__Enabled` | Master switch. When false nothing about any approver surface changes and no `ApproverSecondFactor:*` value is read. When true: the enrolment panel appears on `/approvals`, **every decision on the portal asks for a code once per verification window**, and the two surfaces that carry no browser session — `POST /api/approvals/{id}` and a decision from `/approve/{jobId}` — **refuse outright**. That last part breaks any ERP driving approvals over REST; see [Approvals](approvals.md#proving-it-is-you). |
| `ApproverSecondFactor:SeedSecret` | string | — | `ApproverSecondFactor__SeedSecret` | **REQUIRED when enabled. SECRET — never commit it.** The key every approver's authenticator seed is encrypted at rest under (PBKDF2-HMAC-SHA256 → AES-256-GCM). Minimum 32 characters, the same floor `ApproverPortal:LinkSecret` carries. It **encrypts** the seeds; it does not derive them — seeds are random per approver, deliberately, so that holding the first factor cannot mint the second. **Losing or rotating it means every approver enrols again.** |
| `ApproverSecondFactor:VerificationWindow` | TimeSpan | `00:20:00` | `ApproverSecondFactor__VerificationWindow` | How long a proven factor stands before it must be proven again. **Zero is legitimate and means "prompt on every decision"** — the strictest setting, not a disabled one. Absolute, never sliding, and scoped to one browser session. Bounds `00:00:00` to `08:00:00`. **Frozen onto each window when the code is entered**, so editing it governs windows opened afterwards and changes nothing about ones already open. |
| `ApproverSecondFactor:Issuer` | string | `Lacuna Bulk Signer` | `ApproverSecondFactor__Issuer` | The label an authenticator app shows above the code. Carried in the provisioning URI's `issuer` parameter and repeated in its label, because apps disagree about which they read. Set it when one directory holds several environments and an approver would otherwise see two identically-named accounts. |

:::warning Always write the days component in `VerificationWindow`
A three-component value is `hh:mm:ss` only while the first number is 23 or less; at 24 and above the
binder reads it as *days*, so `"24:00:00"` means twenty-four days. Unlike `ExpiresAfter`, which accepts
that silently, the eight-hour ceiling here turns it into a boot refusal that names the mistake.
:::

### Three boot refusals

`Enabled = true` fails startup, naming the key, when:

1. **`SeedSecret` is missing or shorter than 32 characters.** Enrolments are unreadable without it, so a
   half-configured factor is not a weaker control — it is one whose strength nobody has stated.
2. **`VerificationWindow` is negative or above eight hours.** Beyond a shift the value stops describing
   presence at a keyboard and starts describing a session, which is what a sliding window was rejected
   for being.
3. **`ApproverPortal:Enabled` is false *and* no `Auth:EntraId` section is configured.** Those are the
   only two surfaces that produce an identified session, and the factor is proven inside one. With
   neither, nobody could enrol, every job on an approval-configured profile would park indefinitely, and
   no payment file would be signed.

## `AllowedHosts`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `AllowedHosts` | string | `*` | `AllowedHosts` | Standard ASP.NET Core host filtering. Override to a comma-separated list if the install is reverse-proxied with a fixed external host name. |

## Environment variables that have no JSON counterpart

| Variable | Purpose |
|----------|---------|
| `BULK_SIGNER_CONFIG_DIR` | Tells the binary where the production config lives when the binary is in a read-only install location. Set by the install scripts. |
| `BULK_SIGNER_PKCS11_PIN` | The HSM/token PIN — read at the env-var name configured by `Signing:Certificate:Pkcs11:PinEnvVar`. |
| `BULK_SIGNER_ENCRYPTION_PASSWORD` | PBKDF2 password — read at the env-var name configured by `Encryption:PasswordEnvVar`. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Standard Azure Monitor variable. Read directly by the exporter and honoured by the startup validator, so `Telemetry:ConnectionString` can be left unset. See [Telemetry](telemetry.md). |
| `ASPNETCORE_ENVIRONMENT` | Standard ASP.NET Core environment name (`Development`, `Production`). The install scripts set `Production`. |
| `ASPNETCORE_URLS` | Standard. The install scripts set `http://0.0.0.0:8080`. |
| `ASPNETCORE_CONTENTROOT` | Standard. The Windows install sets it to `C:\ProgramData\Lacuna\BulkSigner` so file-path resolution lands on operator-writable disk. |

## Verifying configuration at runtime

The ready-summary banner printed on startup lists the most decision-critical settings (host mode,
environment, https redirect, content root, storage root, license fingerprint, cert source, signing
policy, encryption status, poll interval, pipeline mode, and one `operational store` row naming the
database provider). A mistyped key surfaces there as a default value rather than the value you
intended.

Rows that appear only when the matching feature is configured:

| Banner row | Appears when |
|------------|--------------|
| `store status`, `store isolation` | `Database:Provider = SqlServer` |
| `work share`, `azure credential`, `azure shares`, `input providers`, `work share owner` | `Storage:Provider = AzureFiles`, or any input folder that names it |
| `blob=…` on a profile row | that profile's certificate is read from Azure Blob Storage |
| `cnab240=on`, `approval=N/M`, `expires=…` on a profile row | `CheckCNAB240` / `Approval` on that profile |

`/api/ready` returns a JSON body describing each probe (operational store, per-folder, license, plus
`storage-share:` and `work-share-owner` rows on a remote work share). A `503` with a body listing the
failed probe is the fast feedback loop for config mistakes — see
[Troubleshooting](troubleshooting.md).

---

**Next:** [Certificates](certificates.md) — choosing and configuring a certificate source.
**Previous:** [Installation](installation.md).
