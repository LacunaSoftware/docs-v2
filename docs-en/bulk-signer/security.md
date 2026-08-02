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

A default install makes **no outbound connections**. Three opt-in features change that, each
off unless you enable it:

| Feature | Outbound dependency |
|---------|---------------------|
| `Signing:Certificate:Source = AzureKeyVault` | `*.vault.azure.net` + `login.microsoftonline.com` — one sign call per signature. See [Certificates](certificates.md#source--azurekeyvault). |
| `Signing:Profiles[].Method = LacunaSigner` | Your Lacuna Signer tenant. See [Lacuna Signer integration](lacuna-signer.md). |
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
`/api/ready`, `/login`, `/api/auth/login`, and `/api/auth/logout` are anonymous.

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

### Windows certificate store

No secret in config — selection is by store location, store name, and SHA-1 thumbprint. The
certificate itself was imported with whatever protection the OS offered at import time. Use
`LocalMachine` when the service virtual account must reach the key, and grant the virtual account
access to the private key via `certlm.msc` → certificate → All Tasks → Manage Private Keys.

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
   secret value (PKI license, PFX passwords, Azure Key Vault client secrets, API key, encryption
   password, PKCS#11 PIN, SQLite connection string) and scrubs those exact strings from every
   rendered log line. Secrets declared on *every* signing profile are collected, not just those in
   the global `Signing:Certificate` block. This catches the stray-interpolation path:
   ```
   logger.Error($"Failure with config: {appSettingsBlob}");
   // → "Failure with config: { … Auth.ApiKey: ***, Signing.PkiSdkLicense: ***, … }"
   ```
   Literal-value redaction skips secrets shorter than 12 characters to avoid pathological matches.

Both file and console output pass through the same redaction pipeline.

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
