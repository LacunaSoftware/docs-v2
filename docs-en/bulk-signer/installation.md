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
| Environment variable (preferred) | Set `Signing__PkiSdkLicense=<base64-license>` |
| Config file | Set `Signing:PkiSdkLicense` in `appsettings.Production.json` |

The environment variable takes precedence at boot. The install scripts read the environment
variable from the per-target file (`/etc/bulksigner/bulksigner.env` on Linux, machine-scope
environment variables on Windows, `.env` on Docker) so the license never lands in a committed file.
See [Security](security.md) for the full secrets-handling story.

:::warning Upgrading from 1.0.x
This key was named `Signing:License` (`Signing__License`) in 1.0.x and was renamed in **1.1.0**. The
old name is no longer read, so an upgraded install that still sets it fails at startup with
`Signing:PkiSdkLicense is required`. Rename the key in your config file or environment file as part
of the upgrade.
:::

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
[Environment]::SetEnvironmentVariable("Signing__PkiSdkLicense",                "<base64-license>", "Machine")
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

## Azure Files storage (optional)

Every install above keeps the whole `data/` tree on the host. Setting
[`Storage:Provider = AzureFiles`](configuration.md#storageprovider--storageazurefiles--the-work-share)
moves the **work share** — `processing/`, `output/` and `error/` — into an Azure Files share reached
through the service's own SDK. No SMB mount, no host-level dependency, no change to any install step
above.

What you decide before installing:

| Decision | Notes |
|----------|-------|
| **Which share holds the work roots** | One share, not several: promoting a verified artifact and relocating a failed job's staged copy are *renames*, and Azure's rename cannot cross shares or accounts. Add a `Directory` prefix if several deployments share one share. |
| **Where the input folders live** | Independent of the above and per folder — staging from an input folder is a *copy*, and a copy may cross anything. A folder can stay local while the work share is remote, or read a customer's share in their own account. |
| **The credential** | `ManagedIdentity` (system-assigned, no secret) where the host runs in Azure; `ServicePrincipal` on-premises; `AccountKey` only where the host cannot reach the tenant at all. See [Security](security.md#azure-files-storage-credentials). |
| **The poll interval per remote folder** | Azure Files publishes no change notifications, so a remote folder is **enumerated on a timer**. A folder that resolves to no interval is refused at boot. |

Host requirements are the same on every target: outbound HTTPS to
`https://<account>.file.core.windows.net`, and — for `ManagedIdentity` — a reachable IMDS endpoint,
which on the Docker target means the container can reach `169.254.169.254`.

:::warning `logs/` and the SQLite database can never move to a share
`Logging:File:Path` is always a local path, and startup **refuses** a configuration that moves it: the
file sink reaches the filesystem through its own API and cannot be handed a share. Under
`Database:Provider = Sqlite`, `ConnectionStrings:Default` is refused on a share for the reason a
database file reached over SMB is the documented way to corrupt one. Under `SqlServer` the `db/`
directory is simply unused.
:::

**What changes operationally.** Ingestion moves from event-driven to a timer (about half a minute on
the defaults, worst case), inspecting `error/` and `processing/` means a storage client rather than an
SSH session, and the share is marked at boot so a second instance is visible. All three are covered in
[Operations](operations.md#what-changes-day-to-day-on-a-share).

**Verifying.** The boot banner gains `work share`, `azure credential`, `input providers` and
`azure shares = N reachable` rows; `/api/ready` gains one `storage-share:<account>/<share>` check per
share plus a `work-share-owner` row. Drop a file in a remote input folder and watch it appear as a job
within one poll interval.

## The certificate file in Azure Blob Storage (optional)

A host with no durable local disk also has nowhere to keep the `.pfx` or `.cer`. Both sources that name
a file can name a blob instead — see
[Certificates](certificates.md#reading-the-file-from-a-blob). Two things to plan for at install time:

- The identity needs **Storage Blob Data Reader** on the container, and nothing wider.
- **An unreachable blob stops the host from starting**, unlike an unreachable work share or
  operational store. A profile with no signing material cannot sign at all, so there is no useful
  degraded state.

## Choosing where the operational store lives

Every install above put the **operational store** — jobs, their history, operational events, the
pipeline's pause flag, the frozen approval rules and the recorded approvals — in a SQLite file under
`Storage:Root`. That is the default, it stays the default, and a deployment that says nothing keeps it.

| Choose | When |
|--------|------|
| **`Sqlite`** (default) | Anything with durable local disk. No external dependency, nothing to provision, and correct for an air-gapped install. |
| **`SqlServer`** | Your policy puts operational data in your own DBMS, under your own backup, HA and DR regime — the recorded approvals in particular are the evidence an auditor asks for. Or the host has **no durable local disk**, where a SQLite file is not a record but a record that disappears on the next revision. |

:::info Neither is a throughput decision
SQLite is not this pipeline's ceiling — the bound is cryptography and I/O — and nothing about
`SqlServer` makes signing faster. It matters because "we moved to SQL Server" reads as a scaling story,
and that leads to the wrong inference about instances: **more than one instance is still unsupported**
on either provider, for reasons that have nothing to do with the store. See
[Operations](operations.md#when-another-instance-appears-to-own-the-work-share).
:::

### What to have in place before the first boot

1. **The database, created.** Bulk Signer creates its *tables*, not its database. The boot probe opens
   a connection to the database the connection string names, so an absent one reads as an unreachable
   store and the migration is skipped — the service starts, and `/api/ready` stays red.
2. **A login mapped to a user in it**, in `db_datareader` + `db_datawriter` + `db_ddladmin` — not
   `db_owner`. The `ALTER ROLE` script is in
   [Configuration](configuration.md#before-you-point-it-at-sql-server).
3. **Network reach and TLS the host accepts.** The SQL client encrypts by default, so an on-premises
   server whose certificate the host does not trust refuses the login with a *certificate chain … not
   trusted* error.

   Azure SQL additionally needs a server firewall rule (or a private endpoint / VNet rule) for this
   host, plus the outbound ports its **connection policy** implies — the prerequisite most easily
   missed, because the default policy is not one thing:

   | Where the host runs | Default policy | Outbound ports to allow |
   |---------------------|----------------|-------------------------|
   | **Inside Azure** (VM, VMSS, container app, App Service) | `Redirect` | TCP **1433** to the gateway **and TCP 11000–11999** to the region's SQL addresses. Use the `Sql.<region>` service tag on an NSG rather than enumerating IPs. |
   | **Outside Azure** (on-premises host reaching Azure SQL) | `Proxy` | TCP **1433** only. |

   Allowing 1433 alone from inside Azure is enough to establish the TCP session and not enough to use
   it, which is exactly the shape of failure this list exists to prevent.

### Per target — where the connection string lives

The connection string may be the whole of the credential, so it belongs wherever that target already
keeps secrets — the same places, and for the same reasons, as the PKI license.

| Target | Where to put `ConnectionStrings__Default` | Passwordless option |
|--------|-------------------------------------------|---------------------|
| **Linux systemd** | `/etc/bulksigner/bulksigner.env` (`0640`, owned by `bulksigner`). Or `appsettings.Production.json` when it carries no password. | On an Azure VM or VMSS: `Authentication=Active Directory Managed Identity`. Not on-premises — use a SQL login there. |
| **Windows Service** | Machine-scope environment variable, set the same way as the PKI license. | Windows integrated authentication. The service runs as `NT SERVICE\LacunaBulkSigner`, which reaches the network as the **computer account**, so the login to create is `DOMAIN\HOSTNAME$`. Run the service as a gMSA or a domain user for a per-service identity. |
| **Docker / Compose** | `deploy/docker/.env`. | Only where the container can reach the host's IMDS endpoint (`169.254.169.254`). Unlike the Azure Files provider, a **user-assigned** identity also works here (`User Id=<client-id>`). |
| **Console (dev)** | `appsettings.Development.json` or an ordinary shell environment variable. | `Authentication=Active Directory Default` picks up your own `az login` — convenient locally, and not what you want in production. |

### Switching from SQLite — archive the old file first

Setting `Database:Provider = SqlServer` on an existing install comes up against an **empty store**.
There is no importer and no boot-time check for the file left behind: no jobs, no history, no
operational events, and **no approval snapshots and no recorded approvals**.

In order:

1. **Drain the pipeline** — pause it, let the in-flight count reach zero, then stop the service.
   Release or reject any job parked at the approval gate first: in the new store it does not exist, and
   its approvers' decisions are in the file you are about to archive.
2. Copy `db/bulksigner.db` somewhere your retention policy covers, and keep a SQLite client to hand.
   From this point it is your archive, not the service's.
3. Create the database and the login, set `Database:Provider` and `ConnectionStrings:Default`, start
   the service, and verify below.

Files in `input/`, `output/` and `error/` are untouched by the switch — but startup recovery reconciles
`processing/` **from job rows**, and the new store has none. Inspect and clear any leftovers by hand,
against the archived database, before the first boot on the new store.

### Verifying a SQL Server store

Check the boot banner, which names the store on **every** deployment:

```
operational store = SQL Server (sqlsrv01/BulkSigner)
store status      = reachable
```

A local install reads `operational store = SQLite (data/db/bulksigner.db)` and gets neither of the
other two rows — nothing was probed. Neither row ever carries the connection string.

Two rows are the ones to act on:

- **`store status = UNREACHABLE: …`** — the store did not answer. The host started anyway on purpose (a
  database down during a maintenance window must not turn a restart into an outage), the migration was
  skipped, and `/api/ready` is red. Fix the store and **restart**.
- **`store isolation = READ_COMMITTED_SNAPSHOT off …`** — the one setting that makes the product feel
  broken without failing anything: the dashboard's reads will block behind the pipeline's writes. Azure
  SQL enables it by default, on-premises SQL Server does not. Bulk Signer reports it and **never
  changes it** — the statement needs exclusive access to a database that is yours. One `ALTER DATABASE`
  by a DBA, then restart.

Then `curl http://localhost:8080/api/ready` — its `database` check names the store it actually checked.

## Microsoft Entra ID sign-in (optional)

By default the dashboard sign-in is the API key, and nothing here is needed — an air-gapped deployment
never touches a Microsoft tenant. To let people sign in with their organization's Microsoft Entra ID
accounts instead:

:::tip Scripted alternative
`New-BulkSignerEntraApp.ps1` (shipped with the deployment package, see [Samples](samples.md)) performs
steps 1, 2 and 4 through Microsoft Graph, creates the client secret, and prints the exact configuration
block for step 5. Only step 3 stays manual.

```bash
pwsh New-BulkSignerEntraApp.ps1 -BaseUrl https://signer.example.com
```
:::

**1. Register the application** in the tenant (Entra admin center → App registrations → New):

- **Supported account types:** *Accounts in this organizational directory only* — single tenant; the
  app refuses the multi-tenant pseudo-tenants at boot.
- **Redirect URI:** type *Web*, value `https://<your-host>/signin-oidc`.
- Under **Certificates & secrets**, create a **client secret** and copy its value immediately — it is
  shown once.

**2. Create the two app roles** (App registration → App roles → Create):

| Display name | Value (must match exactly) | Allowed member types | Grants |
|--------------|---------------------------|----------------------|--------|
| Administrator | `Administrator` | Users/Groups | The operator dashboard — every page and action the API-key cookie grants today. |
| Approver | `Approver` | Users/Groups | The approver surfaces. Which payment files the person may decide is still governed by the frozen approver pool, matched by email — the role only opens the door. |

**3. Assign people** (Enterprise application → Users and groups → Add). One person may hold both roles
and is genuinely both. An account with **neither role is refused** by the app even when it
authenticates.

**4. Require assignment** (Enterprise application → Properties → **Assignment required = Yes**), so
unassigned accounts fail at Microsoft's door. The app enforces role presence regardless — tenant
configuration alone must never be the only fence.

**5. Configure the host** — see
[Configuration](configuration.md#authentraid--optional-microsoft-entra-id-sign-in):

```bash
Auth__EntraId__TenantId=<directory (tenant) GUID or verified domain>
Auth__EntraId__ClientId=<application (client) id>
Auth__EntraId__ClientSecret=<the secret from step 1>   # env var recommended; never commit
```

Restart. `/login` now offers **Sign in with Microsoft**, and the API-key form is off — a half-filled
section refuses to boot naming the missing key. Approvers who match a pool by their directory email
land on `/approvals`; the durable approver links keep working for people outside the tenant.

:::warning Email matters for approvers
Pool matching binds on the token's email claim. For guest accounts — external approvers invited into
the tenant — make sure the account's **mail attribute** carries the business address configured in the
pool. The mangled `#EXT#` UPN is deliberately not used as a fallback.
:::

:::danger Turning this on signs everyone out
Existing operator cookies stop satisfying policies immediately — there is no eight-hour tail of
sessions minted by a login form that no longer exists. Plan the cutover accordingly. REST clients using
`X-API-Key` are unaffected.
:::

## Upgrades

The database schema migrates automatically at startup. To upgrade in place:

| Target | Steps |
|--------|-------|
| Linux | `sudo bash deploy/linux/install.sh --from <new-publish-dir>` — stops the unit, redeploys the binary, restarts. |
| Windows | `.\deploy\windows\Install-Service.ps1 -From <new-publish-dir>` — stops the service, mirrors the binary tree, restarts. |
| Docker | `docker compose pull && docker compose up -d`. |

:::warning Always back up the operational database before upgrading.

Under `Database:Provider = Sqlite`:

| Target | Backup command |
|--------|----------------|
| Linux | `sudo cp /var/lib/bulksigner/db/bulksigner.db /var/lib/bulksigner/db/bulksigner.db.bak` |
| Windows | `Copy-Item C:\ProgramData\Lacuna\BulkSigner\data\db\bulksigner.db -Dest .\bulksigner.db.bak` |
| Docker | `cp deploy/docker/data/db/bulksigner.db deploy/docker/data/db/bulksigner.db.bak` |

Under `SqlServer`, backup is your DBMS regime's concern — which is one of the two reasons a customer
chooses that provider. `db_ddladmin` must be in place for the boot that applies the migration; a boot
against a schema that is already current creates nothing.
:::

The startup recovery sweep moves any job left in flight by the previous version aside automatically
— no manual cleanup needed. See [Operations](operations.md#startup-recovery).

## Quick health checks

After installing on any target:

| URL | What it tells you |
|-----|-------------------|
| `http://localhost:8080/api/health` | Liveness — anonymous, returns `200 OK` if the host process is up. |
| `http://localhost:8080/api/ready` | Readiness — anonymous, returns a body listing each probe (operational store, per input folder, license, plus `storage-share:` and `work-share-owner` rows on a remote work share). `503` if any probe failed. |
| `http://localhost:8080/` | The operator dashboard. Sign in with the API key from `Auth:ApiKey` — or with Microsoft, when [Entra ID sign-in](#microsoft-entra-id-sign-in-optional) is configured. |
| `http://localhost:8080/scalar/v1` | The live OpenAPI reference UI for the REST surface. |

`/api/health` is always anonymous so external health checkers do not need credentials. `/api/ready`
is anonymous too and returns a structured body. `/api/metrics` is API-key-gated by default — see
[Security](security.md).

---

**Next:** [Configuration](configuration.md) — what every `appsettings.json` key does.
