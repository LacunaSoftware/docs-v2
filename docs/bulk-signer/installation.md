---
sidebar_label: "Installation"
sidebar_position: 2
---

# Installation

Lacuna Bulk Signer is a single service that can run as four supported targets:

| Target | Process model | Lifecycle managed by |
|--------|---------------|----------------------|
| Linux systemd | Background service | `systemctl` |
| Windows Service | Background service | `services.msc` / `sc.exe` |
| Docker / Compose | Container | `docker compose` |
| Console (one-off / test) | Foreground | Operator (`Ctrl+C`) |

The same binary supports all four. The startup banner prints a `host mode = …` line that tells you
which lifetime is actually active.

Lacuna Software provides a **deployment package** containing the published application bundle (the
`publish/` directory), the per-target install scripts (the `deploy/` directory), and an annotated
sample configuration file (`appsettings.Production.json.sample`). The instructions below assume you
have that package on (or copied to) the target machine.

## Choose your target

| Where will the service run? | Use |
|-----------------------------|-----|
| Linux server | systemd — `deploy/linux/install.sh` |
| Windows server | Windows Service — `deploy/windows/Install-Service.ps1` |
| Any host with Docker | Container — `deploy/docker/docker-compose.yml` |
| Just testing locally | Console — run the published executable in the foreground |

## Prerequisites — common to every target

1. **Lacuna PKI SDK license string** (base64), supplied by Lacuna Software. Required at startup;
   without it, the service refuses to boot. See [Obtaining the PKI SDK license](#obtaining-the-pki-sdk-license).
2. **A signing certificate source.** Pick one of:
   - **PFX** — a `.pfx` / `.p12` file plus the password that unlocks it.
   - **PKCS#11** — a vendor driver (`.so` on Linux, `.dll` on Windows) plus the SHA-1 thumbprint of
     the signing certificate on the token, plus the PIN supplied through an environment variable.
   - **Windows certificate store** — Windows targets only, plus the SHA-1 thumbprint.

   See [Certificates](certificates.md) for details.
3. **Encryption decision.** Leave disabled (default) or enable BSENC v1. If you enable encryption,
   decide where the password and salt will live before first boot. See [Encryption](encryption.md).
4. **TLS termination.** The service listens on plain HTTP by default. The recommended deployment
   terminates TLS at a reverse proxy (nginx, IIS, Traefik). The `Hosting:RequireHttps` flag
   (default `false`) gates the in-process HTTPS redirect — set it to `true` only if you have
   configured a Kestrel certificate.
5. **Watched input folders.** Decide whether you need one input folder (default) or several. With a
   single folder, omit `Storage:Inputs[]` entirely — the service creates one named `default` at
   `{Root}/input`. For multiple folders, populate `Storage:Inputs[]` with one entry per folder; see
   [Configuration](configuration.md#storage).

Every install seeds an editable production config from the provided
`appsettings.Production.json.sample`. The sample is annotated with `REQUIRED` and `SECRET` markers;
review it before first start.

## Obtaining the PKI SDK license

The license is a base64 string supplied by Lacuna Software. Two ways to load it:

| Where | How |
|-------|-----|
| Environment variable (preferred) | Set `Signing__License=<base64-license>` |
| Config file | Set `Signing:License` in `appsettings.Production.json` |

The environment variable takes precedence at boot. The install scripts read the environment
variable from the per-target file (`/etc/bulksigner/bulksigner.env` on Linux, machine-scope
environment variables on Windows, `.env` on Docker) so the license never lands in a committed file.
See [Security](security.md) for the full secrets-handling story.

## Linux — systemd

```bash
# 1. Copy the publish/ bundle and deploy/ scripts to the target machine, then:
sudo bash deploy/linux/install.sh --from publish

# 2. Edit the production config and the secrets env file.
sudo nano /etc/bulksigner/appsettings.Production.json
sudo nano /etc/bulksigner/bulksigner.env

# 3. Restart so config changes take effect.
sudo systemctl restart bulksigner

# 4. Verify the service is up.
curl http://localhost:8080/api/health
curl http://localhost:8080/api/ready
systemctl --no-pager status bulksigner
journalctl -u bulksigner -f
```

Install paths (FHS conventions):

| Path | Purpose | Mode | Owner |
|------|---------|------|-------|
| `/opt/bulksigner` | Binary (read-only after install) | `0755` | `root:root` |
| `/var/lib/bulksigner` | Data: `input` / `processing` / `output` / `db` | `0750` | `bulksigner:bulksigner` |
| `/var/log/bulksigner` | Durable log files | `0750` | `bulksigner:bulksigner` |
| `/etc/bulksigner` | `appsettings.Production.json` + `bulksigner.env` | `0750` | `bulksigner:bulksigner` |

The systemd unit uses `Type=notify` so `systemctl status` reports `active (running)` only after the
full bootstrap (license load + database migration + pipeline recovery) succeeds. Hardening flags
(`NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`) are on by default.

**Uninstall:**

```bash
sudo bash deploy/linux/uninstall.sh          # stop + remove the unit, preserve data
sudo bash deploy/linux/uninstall.sh --purge  # also wipe data, logs, config, and the system user
```

## Windows — Windows Service

```powershell
# 1. Copy the publish/ bundle and deploy/ scripts to the target machine, then in an
#    ELEVATED PowerShell prompt:
.\deploy\windows\Install-Service.ps1 -From publish

# 2. Edit the production config:
notepad C:\ProgramData\Lacuna\BulkSigner\config\appsettings.Production.json

# 3. Set secrets as machine-scope environment variables:
[Environment]::SetEnvironmentVariable("Signing__License",                "<base64-license>", "Machine")
[Environment]::SetEnvironmentVariable("Auth__ApiKey",                    "<api-key>",        "Machine")
[Environment]::SetEnvironmentVariable("BULK_SIGNER_PKCS11_PIN",          "<hsm-pin>",        "Machine")
[Environment]::SetEnvironmentVariable("BULK_SIGNER_ENCRYPTION_PASSWORD", "<password>",       "Machine")
Restart-Service LacunaBulkSigner

# 4. Verify.
Invoke-WebRequest http://localhost:8080/api/health
Invoke-WebRequest http://localhost:8080/api/ready
Get-Service LacunaBulkSigner
Get-Content C:\ProgramData\Lacuna\BulkSigner\logs\bulksigner-*.log -Tail 50 -Wait
```

Install paths (Windows conventions):

| Path | Purpose |
|------|---------|
| `C:\Program Files\Lacuna\BulkSigner` | Binary (read-only after install) |
| `C:\ProgramData\Lacuna\BulkSigner\config` | `appsettings.Production.json` |
| `C:\ProgramData\Lacuna\BulkSigner\data` | Operational data (`input` / `processing` / `output` / `db`) |
| `C:\ProgramData\Lacuna\BulkSigner\logs` | Log files |

The service runs under a **virtual account** (`NT SERVICE\LacunaBulkSigner`) — no operator password
to manage, no domain account to permission. The install script grants this account access to the
`ProgramData` tree and configures crash recovery (restart after 5 s on the first and second
failure, 30 s on the third).

:::note
Application-level logs go through the file sink only. The Windows Application event log carries
service lifecycle entries (start / stop / failure) for this service — not the per-job log lines.
Look in the log file for those.
:::

**Uninstall:**

```powershell
.\deploy\windows\Uninstall-Service.ps1         # stop + remove the service, preserve data
.\deploy\windows\Uninstall-Service.ps1 -Purge  # also wipe ProgramData and the machine env vars
```

## Docker / Compose

```bash
cd deploy/docker

# 1. Prepare working directories on the host.
cp .env.sample .env
mkdir -p data logs config
cp ../appsettings.Production.json.sample config/appsettings.Production.json

# 2. Edit the config and the env file.
nano config/appsettings.Production.json
nano .env

# 3. The container runs as UID 1654. On Linux hosts:
sudo chown -R 1654:1654 data logs

# 4. Start.
docker compose up -d

# 5. Verify.
curl http://localhost:8080/api/health
docker compose ps                       # should show "healthy" after ~30 s
docker compose logs -f bulksigner
```

The image is Debian-slim based — **not** Alpine. HSM `.so` libraries are generally not
musl-compatible, so Alpine is off the table. The image ships generic PKCS#11 tooling
(`libpcsclite1` + `opensc`); vendor HSM drivers (SafeNet, Thales, Entrust, Yubico) are
operator-mounted at runtime via `volumes:` in the compose file. See the commented examples in
`deploy/docker/docker-compose.yml`.

A `HEALTHCHECK` polls `/api/health` every 30 seconds, so `docker ps` and orchestrators see accurate
`(healthy)` / `(unhealthy)` status.

Bind mounts and host paths:

| Container path | Host path | Purpose |
|----------------|-----------|---------|
| `/app/appsettings.Production.json` | `./config/appsettings.Production.json` (read-only) | Operator-edited config |
| `/var/lib/bulksigner` | `./data` | Operational data tree (input / processing / output / db) |
| `/var/log/bulksigner` | `./logs` | Durable log files |

## Foreground console (one-off / test)

Run the published executable directly to start the service in the foreground — useful for a quick
local test or to see bootstrap errors immediately:

```bash
# Linux
./publish/Lacuna.BulkSigner

# Windows
.\publish\Lacuna.BulkSigner.exe
```

- The `data/` tree is created relative to the working directory.
- Use `Ctrl+C` to stop. The bootstrap banner prints `host mode = console`.
- On an interactive terminal, a live status panel replaces the streaming log. See
  [Console dashboard](dashboard.md#console-dashboard-foreground-runs-only).

## Upgrades

The database schema migrates automatically at startup. To upgrade in place:

| Target | Steps |
|--------|-------|
| Linux | `sudo bash deploy/linux/install.sh --from <new-publish-dir>` — stops the unit, redeploys the binary, restarts. |
| Windows | `.\deploy\windows\Install-Service.ps1 -From <new-publish-dir>` — stops the service, mirrors the binary tree, restarts. |
| Docker | `docker compose pull && docker compose up -d`. |

:::warning Always back up the operational database before upgrading.

| Target | Backup command |
|--------|----------------|
| Linux | `sudo cp /var/lib/bulksigner/db/bulksigner.db /var/lib/bulksigner/db/bulksigner.db.bak` |
| Windows | `Copy-Item C:\ProgramData\Lacuna\BulkSigner\data\db\bulksigner.db -Dest .\bulksigner.db.bak` |
| Docker | `cp deploy/docker/data/db/bulksigner.db deploy/docker/data/db/bulksigner.db.bak` |
:::

The startup recovery sweep moves any job left in flight by the previous version aside automatically
— no manual cleanup needed. See [Operations](operations.md#startup-recovery).

## Quick health checks

After installing on any target:

| URL | What it tells you |
|-----|-------------------|
| `http://localhost:8080/api/health` | Liveness — anonymous, returns `200 OK` if the host process is up. |
| `http://localhost:8080/api/ready` | Readiness — anonymous, returns a body listing each probe (DB, input folder, license). `503` if any probe failed. |
| `http://localhost:8080/` | The operator dashboard. Sign in with the API key from `Auth:ApiKey`. |
| `http://localhost:8080/scalar/v1` | The live OpenAPI reference UI for the REST surface. |

`/api/health` is always anonymous so external health checkers do not need credentials. `/api/ready`
is anonymous too and returns a structured body. `/api/metrics` is API-key-gated by default — see
[Security](security.md).

---

**Next:** [Configuration](configuration.md) — what every `appsettings.json` key does.
