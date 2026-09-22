---
sidebar_label: "Server installation"
sidebar_position: 3
---

# Server installation

The TrustBridge Server is distributed as a Linux container image, `trustbridge-server:<version>`,
with two supported hosting postures. Both run **exactly one instance**.

| | Docker on Linux (this page) | [Azure App Service](azure.md) |
|---|---|---|
| Database | SQL Server, beside the Server or an instance you already run | Azure SQL, with a managed identity and no password |
| TLS | The Server terminates its own | The platform terminates it |
| Certificate Vault | Available | Available |
| Who schedules a restart | You | The platform, for its own maintenance |

Lacuna Software provides a **deployment package** containing the image reference, the compose file
(`docker-compose.yml`), an annotated environment sample (`.env.example`) and the Group Policy templates
for the fleet. The instructions below assume you have that package on the target host.

## Before you choose a posture

Four things are true of every deployment and shape how you verify it.

**One instance is a rule, not a recommendation.** Workstations hold a persistent SignalR connection
and there is no backplane, so a second instance knows nothing of the workstations connected to the
first. The failure is silent: sessions fail against machines that are connected and invisible. Never
scale out.

**Every deployment needs a Key Ring Protector.** Both of the Server's key rings, the one behind admin
cookies and the one behind the Certificate Vault, are rows in its own database sealed under one X.509
certificate you supply as configuration (`KeyRingProtector:Certificate`). The Server refuses to start
without it, vault or no vault. Back up the PKCS#12 permanently, somewhere the platform cannot reach.
See [Security](security.md#the-key-ring-protector).

**The Server brings its own schema up.** At every start, before it listens, it applies any pending
migration to its database (`Database:MigrateOnStart`, default `true`). A deployment is an image and a
connection string; an upgrade is a new image tag. What that costs is a standing DDL grant
(`db_ddladmin`) for the identity the Server connects as, or the switch set to `false` and a DBA
applying migrations first.

| The database is | What the Server does |
|---|---|
| Up to date | Starts. No DDL is issued. |
| Behind | Applies the missing migrations, names them in the log, then starts. |
| Behind, with `MigrateOnStart=false` | **Refuses to start**, naming the migrations and the command to run. |
| Ahead of this build (a rollback across a migration) | **Refuses to start.** Old code on a newer schema would answer wrongly rather than fail. |
| Unreachable | Waits about ninety seconds, then **refuses to start**. |

Each migration command has a thirty-minute limit of its own; nothing bounds an upgrade as a whole.

**"It started" is not "it works".** A running Server answers `GET /` with 200 while its database is
unreachable, on purpose, so that a database blip is not an outage a human has to end. The check that
touches the database is `GET /healthz`: it makes one SQL round trip and answers `Healthy` (200) or
`Unhealthy` (503), needs no credential and writes no Audit Log row. Point your monitoring at it.

## Prerequisites

- A Linux host with Docker Engine and the Compose plugin.
- **A TLS certificate as a PKCS#12 whose chain every workstation already trusts.** The Workstation
  Service refuses an untrusted chain, and the symptom is workstations that never appear, with no
  error on the Server. A self-signed certificate will not do. Use your internal CA or a public one.
- **A Key Ring Protector**, a second and quite different PKCS#12. Step 3 below makes it.
- **Lacuna Signer** credentials: the base address and the API key in the `application|secret` form
  Signer publishes. Both or neither. An address with no key refuses the start.
- **The Lacuna PKI SDK licence**, only if you will turn on the Certificate Vault. The image carries
  no licence.
- A SQL Server. The compose file can run one beside the Server, but read the note on its edition.

## 1. The host directory

One directory, which the Server only reads, as uid **1654**:

```bash
sudo mkdir -p /etc/trustbridge/tls /opt/trustbridge
```

The Server writes nothing to your disk. The only directory it writes is `/tmp` inside the container,
holding the PKI SDK's caches of fetched issuers and CRLs (`/tmp/trustbridge-pki`) and its own rolling
log file (`/tmp/trustbridge-logs`). Both are caches of something already said elsewhere, and losing
them costs nothing but latency and the Server log screen's rows. Nothing there belongs in a backup.

## 2. TLS

Nothing sits in front of this Server, so it terminates its own TLS:

```bash
sudo cp your-certificate.pfx /etc/trustbridge/tls/server.pfx
sudo chown 1654:1654 /etc/trustbridge/tls/server.pfx
sudo chmod 400 /etc/trustbridge/tls/server.pfx
```

The container listens on **8443**; the host publishes **443**. An unprivileged process cannot bind
443, so `dockerd` does and forwards. That mapping is already in the compose file.

If you would rather terminate TLS in a reverse proxy you already run, point it at the container's 8443
and drop the `Kestrel__Certificates__*` variables from the compose file, but then also set
`ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, or every audit row records your proxy's address as the
caller.

## 3. Configuration

```bash
cd /opt/trustbridge
cp <package>/docker-compose.yml .
cp <package>/.env.example .env
chmod 600 .env
```

The compose file belongs in version control and holds no secret; `.env` holds every secret and must
not be committed. [Server configuration](configuration.md) lists every key the Server takes; the ones
this posture needs are below.

| `.env` variable | What it is |
|---|---|
| `TRUSTBRIDGE_IMAGE` | The image, with a **specific tag**. Never `latest`. |
| `MSSQL_SA_PASSWORD` | The bundled SQL Server's `sa` password (8+ characters from three character classes). |
| `TLS_CERT_PASSWORD` | The password on `/etc/trustbridge/tls/server.pfx`. |
| `KEY_RING_PROTECTOR_CERTIFICATE` | The Key Ring Protector, one line of base64. **Required.** |
| `KEY_RING_PROTECTOR_PASSWORD` | Only if that PKCS#12 has a password. |
| `VAULT_ENABLED` | `false` unless this Server will hold Vault Certificates. |
| `PKI_LICENSE` | The Lacuna PKI SDK licence, base64 on one line. Needed with the vault on. |
| `SIGNER_BASEADDRESS`, `SIGNER_APIKEY` | Lacuna Signer. Both or neither. |
| `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` | The first administrator. Read only while the account table is empty; remove after the first sign-in. |

### Using a SQL Server you already run

That is the normal production shape. Delete the `sqlserver` service from the compose file, drop the
`depends_on`, and point `ConnectionStrings__TrustBridge` at the real instance:

```yaml
ConnectionStrings__TrustBridge: >-
  Server=sql.example.com,1433;Database=TrustBridge;User Id=trustbridge;
  Password=${DB_PASSWORD};Encrypt=True
```

The identity needs `db_datareader`, `db_datawriter` and, for the Server to apply its own migrations,
`db_ddladmin`. The database itself must exist. Applying a migration never creates a database, except
on the bundled posture where the Server connects as `sa` and can.

:::caution
If you keep the bundled database, note that the compose file sets `MSSQL_PID=Developer`, which
Microsoft licenses for development and test only, **not for production**. Set an edition you hold a
licence for, or use a SQL Server your organization already runs and backs up. Nothing will warn you.
:::

### The Key Ring Protector

Make one. A self-signed **RSA** certificate is the right shape: nothing ever validates it as a
certificate, so there is nothing for a CA to attest. It is a key pair with a thumbprint on it.

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 18250 \
  -keyout protector.key -out protector.crt \
  -subj "/CN=TrustBridge Key Ring Protector"
openssl pkcs12 -export -inkey protector.key -in protector.crt -out protector.pfx -passout pass:
base64 -w0 protector.pfx
```

- **RSA, not ECDSA.** The framework seals key material through `EncryptedXml`, which uses RSA only.
  An ECDSA certificate is refused at start.
- **Fifty years of validity.** A protector's dates are never checked, but a protector you feel
  obliged to replace is one you then have to keep forever anyway.
- **`base64 -w0`**: one line, no PEM header, which is what the setting reads.
- **No password** is the honest choice: the only place to keep one would be the same `.env` as the
  bytes it opens.

Paste the base64 into `.env` as `KEY_RING_PROTECTOR_CERTIFICATE`. Then put `protector.pfx` somewhere
this host cannot reach, and remove it from the host:

```bash
shred -u protector.key protector.pfx      # only after copying the .pfx somewhere safe
```

:::danger
Losing the protector destroys the Certificate Vault, and nothing recovers it. Not Lacuna, not you.
There is deliberately no escrow. It is one small file that never changes: put it wherever your
organization keeps the things it cannot re-create.
:::

Rotation is additive. See [Operations](operations.md#rotating-the-key-ring-protector).

### Turning the Certificate Vault on

`VAULT_ENABLED=false` is the default and the majority posture: every private key on a workstation.
Set it to `true` only for a Server that will hold Vault Certificates, and set `PKI_LICENSE` with it.
Read [Security](security.md#the-certificate-vault) first: with the tier on, the PKI SDK licence is on
the critical path, and a PKCS#12 to import has to be in the legacy PFX shape.

```bash
echo "PKI_LICENSE=$(base64 -w0 LacunaPkiLicense.config)" >> .env
```

## 4. The schema

**Nothing to do.** The Server creates and migrates its own schema at start. Skip to step 5.

Two reasons you might do it yourself: your change control will not grant DDL to the running Server, or
a DBA wants to read the SQL first. In either case set `Database__MigrateOnStart: "false"` in the
compose file and, before each start on a new version, either apply migrations with the .NET SDK and a
checkout at the deployed version, or generate an idempotent script and apply it with `sqlcmd`:

```bash
dotnet tool restore
dotnet ef migrations script --idempotent --project src/TrustBridge.Server -o schema.sql
sqlcmd -S <host> -U <user> -P <password> -C -I -b -d TrustBridge -i schema.sql
```

`-I` is required (`QUOTED_IDENTIFIER ON`, or the first filtered index fails with `Msg 1934`), and so
is `-b` (or a partial apply reports success). If you run `dotnet ef database update` instead, append
`Command Timeout=3600` to the connection string: the tool's default is thirty seconds, which an index
build over a large `AuditEvents` table outlasts.

With the switch off, the Server **refuses to start** on a pending migration rather than starting
without it. That is the point of the switch.

## 5. Start it

```bash
cd /opt/trustbridge && docker compose up -d
docker compose logs -f server
```

A healthy first start:

```
info: TrustBridge.Server.Common.KeyRings.KeyRingPosture[0]
      Every key ring this Server keeps in its database is encrypted with the Key Ring Protector
      76766DC2741A8DA070CC47E3830D34023D9ED885, and 0 retired protector(s) are kept readable beside
      it. Losing a protector makes every key ever sealed under it — and so every Vault Certificate
      it wrapped — unrecoverable, so backing them all up, permanently, is part of running this
      Server (ADR-0024).
info: TrustBridge.Server.Common.Vault.VaultReadiness[0]
      The Certificate Vault is off on this Server, so it holds no certificates of its own. Every
      private key it signs with is on a workstation (ADR-0020).
info: TrustBridge.Server.Common.Admin.AdminAccountBootstrap[0]
      Created the first admin account admin@example.com in the Administrator role.
info: Now listening on: https://[::]:8443
info: Application started. Press Ctrl+C to shut down.
```

**The first line is the one to read.** It names the protector thumbprint your backup has to contain
and counts the retired protectors this Server can still read with. If you have rotated once and it
says `0 retired protector(s)`, the old one is not configured and everything sealed under it is
unreadable.

With the vault on, the second line reads *The Certificate Vault is open: its key ring holds N key(s)…*
instead. A `warn` in its place saying the vault is *closed until they have run* means the Server came
up before its database did. That is the [vault latch](operations.md#the-vault-latch).

## 6. Check it actually works

```bash
curl -s https://trustbridge.example.com/healthz                                        # Healthy
curl -o /dev/null -w '%{http_code}\n' https://trustbridge.example.com/                 # 200 front door
curl -o /dev/null -w '%{http_code}\n' https://trustbridge.example.com/admin            # 302 to login
curl -o /dev/null -w '%{http_code}\n' https://trustbridge.example.com/api/v1/sessions  # 401 no API key
```

Then **sign in at `/admin`** with the bootstrap account. That reads the database through the path a
real request takes rather than the one a probe does. Set a real password, enroll the second factor,
then remove `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` from `.env` and recreate the
container. They are inert after the first start; removing them is hygiene.

Finally, register a Client Application at `/admin/applications`, issue an API key, and drive the
[REST API](rest-api.md) once end to end.

## Backups

| What | How | If you lose it |
|---|---|---|
| The database | `BACKUP DATABASE`, or your existing SQL Server backups | Sessions, Audit Log, Certificate Registry, **both key rings** and the vault's ciphertext |
| The Key Ring Protector `.pfx` | Copy the file once. It never changes | **Every Vault Certificate is unopenable, permanently**, and every administrator signs in again |
| Every **retired** protector `.pfx` | The same, kept forever | Whatever was sealed under that one, permanently |
| `/etc/trustbridge/tls` | Wherever your certificates live | Reissue |
| **The container's log**, wherever your logging driver sends it | Your log retention, not a file copy | Audit rows the database could not take. The trail has a hole exactly where the database was down |

The compose file's `json-file` logging driver keeps lines under the container's own directory, and
Docker deletes them **with the container**, so `docker compose down` and the upgrade below both
discard them. Point the `logging:` driver at something off this box, or run a log agent over the
files, before you need them.

Restoring is two things arriving together. A database without its protector is a refused start; a
protector without the whole database (vault rows present, key ring rows absent) is refused for the
mirror-image reason.

## Upgrades

```bash
docker compose pull && docker compose up -d
```

The new image applies whatever migrations it needs on its way up and names them in the log. If you set
`Database__MigrateOnStart: "false"`, apply the migrations **first**; the new image refuses to start
against a schema that is behind.

Expect visible downtime of a minute or two: one instance means no rolling restart. Workstations
reconnect by themselves and workstation-bound sessions survive verbatim. Sessions bound to a **Vault
Certificate** do not; they end as `Stranded` and clients create new ones.

Upgrade the **Server first, then the workstations** within one release. A Server accepts the current
workstation protocol and the one before it; a workstation ahead of its Server cannot connect at all.
See [Operations](operations.md#rollout-order-server-first-then-the-fleet).

A database created by Server **1.2.0 or earlier** cannot be upgraded: the migration history was
squashed into one baseline afterwards, and such a database is refused at start as one carrying
migrations this build does not contain. Drop it and let the Server create a new one.

## When it will not start

| Log says | Cause |
|---|---|
| `KeyRingProtector:Certificate is not configured` | No protector. Every deployment needs one. |
| `… is not base64, so it cannot be a PKCS#12` | The value has a PEM header or line breaks. Use `base64 -w0`. |
| `… could not be opened as a PKCS#12` | Wrong `CertificatePassword`, or the bytes are not a PKCS#12. The Server cannot tell those apart. |
| `… carries no RSA private key this process can use` | An ECDSA certificate, or one exported without its key. |
| `The Certificate Vault's key ring holds N key(s) and the Key Ring Protector configured here opens none of them` | A swapped protector. Put the old one back, or add it to `RetiredCertificates`. |
| `The Certificate Vault holds N certificate(s) and its key ring is empty` | A partial restore. Restore the whole database. |
| `Signer:ApiKey is required when Signer:BaseAddress is configured` | Half-configured Signer. Set both or neither. |
| `… is behind the build pointed at it by N migration(s)` | `MigrateOnStart` is off and the schema needs those migrations. |
| `… has N migration(s) applied that this build does not contain` | An older image against a newer schema, or a database from 1.2.0 or earlier. |
| `… could not be reached in 90 seconds` | The database never answered. Check the connection string and that SQL Server is up. |
| `… could not apply N pending migration(s)` | Usually no DDL rights for the connecting identity. |
| `… ran out of time applying N pending migration(s)` | One migration command outlasted thirty minutes. Nothing was half-applied. |
| Starts, but workstations never connect | The TLS chain is not trusted by the workstations. |

Two framework lines that look like protector faults and are not: `KeyRingProvider[48] An error
occurred while reading the key ring` and `XmlKeyManager[24] … Unable to retrieve the decryption key`.
On a Server that started cleanly they mean the **database** is unreachable. The protector's own
refusals all name `KeyRingProtector:` and stop the host.
