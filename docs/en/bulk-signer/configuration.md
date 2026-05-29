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

## `ConnectionStrings`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `ConnectionStrings:Default` | string | `Data Source=data/db/bulksigner.db` | `ConnectionStrings__Default` | **REQUIRED.** SQLite connection string. Point at a path under `Storage:Root` so one mount covers both data and DB. |

## `Signing`

Validation fails fast at startup if any required key is missing or invalid.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:License` | string | `""` | `Signing__License` | **REQUIRED, SECRET.** Lacuna PKI SDK license string (base64). Environment-variable form preferred. |
| `Signing:Certificate:Source` | enum | `Pfx` | `Signing__Certificate__Source` | **REQUIRED.** One of `Pfx`, `Pkcs11`, `WindowsStore`. Only the matching subtree below is consulted. |

### `Signing:Certificate:Pfx` — when `Source = Pfx`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:Certificate:Pfx:Path` | string | `""` | `Signing__Certificate__Pfx__Path` | **REQUIRED.** Absolute path to the `.pfx`/`.p12` file. |
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

See [Certificates](certificates.md) for thumbprint discovery commands and a deeper walkthrough.

## `Signing:Profiles[]` — per-folder signing profiles

A **signing profile** bundles every per-folder decision (format, certificate, verify, encrypt,
certificate validation) under a name. Watched folders reference the profile by name via
`Storage:Inputs[].Profile`. Two configuration modes are supported:

- **Legacy mode** (default — `Signing:Profiles[]` omitted or empty). The service synthesises one
  profile named `default` from the existing `Signing:Certificate` block. No config changes are
  needed for a simple single-certificate install.
- **Profile mode** (declare `Signing:Profiles[]`). Each entry is a named profile with its own
  certificate and posture. `Signing:Certificate` is ignored. Every entry validates as if it were
  the global certificate block — the same `Pfx` / `Pkcs11` / `WindowsStore` rules apply per profile.

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Signing:Profiles[].Name` | string | n/a | `Signing__Profiles__0__Name` | **REQUIRED.** Same regex as folder names: `^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$`. Unique across the list. The name is referenced from `Storage:Inputs[].Profile` and surfaces in metric labels, dashboard chips, and audit messages. |
| `Signing:Profiles[].Format` | enum | n/a | `Signing__Profiles__0__Format` | **REQUIRED** for every operator-declared profile: `Pades`, `Cades`, `Xades`, or `XmlNFe`. Only the synthesised legacy default may leave this unset — in which case the format is detected per file by extension. |
| `Signing:Profiles[].Method` | enum | `Local` | `Signing__Profiles__0__Method` | `Local` (sign with the configured local certificate) or `LacunaSigner` (dispatch to Lacuna Signer for a human participant). See [Lacuna Signer integration](lacuna-signer.md). |
| `Signing:Profiles[].Verify` | bool | `true` | `Signing__Profiles__0__Verify` | When false, the worker skips the post-sign verification round-trip. The startup banner emits a warning so the low-trust posture is operator-visible. |
| `Signing:Profiles[].Encrypt` | bool | `false` | `Signing__Profiles__0__Encrypt` | When true, the worker AES-256-GCM-encrypts the signed output. Requires `Encryption:Enabled = true` (the validator refuses the broken combination at startup). |
| `Signing:Profiles[].ValidateCertificate` | bool | `true` | `Signing__Profiles__0__ValidateCertificate` | When false, the worker skips the pre-sign certificate chain / revocation check. The startup banner emits a warning. **Must be `false` when `Method = LacunaSigner`** — there is no local cert to validate. |
| `Signing:Profiles[].Certificate.*` | nested | n/a | `Signing__Profiles__0__Certificate__…` | **REQUIRED when `Method = Local`.** Same shape as the global `Signing:Certificate` block. Each profile loads its own certificate at boot; misconfiguration on any profile fails startup with an aggregated error. **Refused when `Method = LacunaSigner`.** |
| `Signing:Profiles[].Signer.Name` | string | n/a | `Signing__Profiles__0__Signer__Name` | **REQUIRED when `Method = LacunaSigner`.** Display name of the participant Lacuna Signer will send the document to. |
| `Signing:Profiles[].Signer.Email` | string | n/a | `Signing__Profiles__0__Signer__Email` | **REQUIRED when `Method = LacunaSigner`.** Participant's email address — must contain `@`. |
| `Signing:Profiles[].Signer.Identifier` | string | n/a | `Signing__Profiles__0__Signer__Identifier` | **REQUIRED when `Method = LacunaSigner`.** Participant's national identifier (CPF in Brazil). |

### `Storage:Inputs[].Profile` — per-folder routing

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Storage:Inputs[].Profile` | string? | `null` (→ "default") | `Storage__Inputs__0__Profile` | Optional. References a `Signing:Profiles[].Name`. Null or empty falls back to the `default` profile. Unknown names fail validation at startup. |

### Example: two profiles routed by folder

```json
"Signing": {
  "License": "<env-var>",
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
    }
  ]
},
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Inputs": [
    { "Name": "nfe-incoming",       "Path": "/var/lib/bulksigner/input-nfe",       "Profile": "nfe" },
    { "Name": "contracts-incoming", "Path": "/var/lib/bulksigner/input-contracts", "Profile": "contracts" }
  ]
}
```

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

## `Storage`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Storage:Root` | string | `data` | `Storage__Root` | **REQUIRED.** Root under which `processing/`, `output/`, `error/`, `db/`, `logs/` are created. Override per target — `/var/lib/bulksigner` on Linux, `C:\ProgramData\Lacuna\BulkSigner\data` on Windows, `/var/lib/bulksigner` in Docker. |
| `Storage:Inputs[]` | array of `{Name, Path, IgnoredExtensions?, IgnoredPrefixes?, Profile?}` | `[{Name="default", Path="{Root}/input"}]` | `Storage__Inputs__0__Name`, `Storage__Inputs__0__Path`, … | One or more watched input folders. Jobs are tagged with the folder's `Name` and resolved `Profile`. See below for validation rules. |

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
| `WatchedFolder:StabilityTimeoutSeconds` | int | `60` | `WatchedFolder__StabilityTimeoutSeconds` | Maximum wait before giving up on a never-stable file. Bounds: 1–3600. |
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

## `Metrics`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Metrics:RequireApiKey` | bool | `true` | `Metrics__RequireApiKey` | When true, `/api/metrics` requires API-key or cookie auth. Set false only if your Prometheus scraper sits inside the trust boundary and the network is locked down. |

See [REST API](rest-api.md) for the full inventory of metrics instruments.

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

Rate-limited responses carry `code = "rate-limited"` in the error envelope.

## `Hosting`

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Hosting:RequireHttps` | bool | `false` | `Hosting__RequireHttps` | Gates the in-process HTTPS redirect. `false` (default) for service and Docker installs that terminate TLS at a reverse proxy. Surfaced in the ready-summary banner as `https redirect = on/off`. |

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
| `ASPNETCORE_ENVIRONMENT` | Standard ASP.NET Core environment name (`Development`, `Production`). The install scripts set `Production`. |
| `ASPNETCORE_URLS` | Standard. The install scripts set `http://0.0.0.0:8080`. |
| `ASPNETCORE_CONTENTROOT` | Standard. The Windows install sets it to `C:\ProgramData\Lacuna\BulkSigner` so file-path resolution lands on operator-writable disk. |

## Verifying configuration at runtime

The ready-summary banner printed on startup lists the most decision-critical settings (host mode,
environment, https redirect, content root, storage root, license fingerprint, cert source, signing
policy, encryption status, poll interval, pipeline mode). A mistyped key surfaces there as a default
value rather than the value you intended.

`/api/ready` returns a JSON body describing each probe (DB, input folder, license). A `503` with a
body listing the failed probe is the fast feedback loop for config mistakes — see
[Troubleshooting](troubleshooting.md).

---

**Next:** [Certificates](certificates.md) — choosing and configuring a certificate source.
**Previous:** [Installation](installation.md).
