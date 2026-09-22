---
sidebar_label: "Operations"
sidebar_position: 11
---

# Operations

Day-2 operations for a deployed TrustBridge: what to monitor, what to read in the logs, how a restart
behaves, and the recurring maintenance a deployment owes.

## Health and monitoring

| Probe | What it proves | Use it for |
|---|---|---|
| `GET /healthz` | One SQL round trip. `Healthy` (200) or `Unhealthy` (503), and nothing else in the body. Anonymous, unaudited. | Uptime monitoring and alerting. A 503 is a container that is up and a database that is not. |
| `GET /` | The container is alive. Answers 200 with the database gone. | A restart trigger, where the platform has one (App Service Health Check). |
| Sign in at `/admin` | The path a real request takes, through the database. | The check after every deployment and upgrade. |

`/healthz` does **not** report the fleet: a Server with no workstations connected is `Healthy`. The
fleet screen is where a machine's presence belongs.

**The Server starts and stays up with its database unreachable after start**, so that a database blip
is not an outage a human has to end. While the database is away, the front door answers 200, the
contract fails, and the vault is closed. Alert on `/healthz`, not on the container.

Since the Server applies its own schema at start, a container that is running has proved it reached
SQL once; a database unreachable **at** start is a refused start after about ninety seconds.

### The vault latch

On a Server with `Vault:Enabled`, the vault's start-time checks read the database. Where the Server
comes up before its database answers, the vault **latches shut** rather than the host refusing:

```
warn: TrustBridge.Server.Common.Vault.VaultReadiness[0]
      The Certificate Vault is on, but its start-time checks could not read the database, so the
      vault is closed until they have run. Nothing will be signed with a certificate this Server
      holds and nothing new will be imported until then; the checks are retried at the first
      attempt to use it (ADR-0024 §8).
```

A closed vault is a healthy-looking Server that refuses every signature with a server-held certificate
and every import, while the workstation tier works normally. The checks are retried at the first
attempt to use the vault, and a database that has come back settles them open. What a closed vault
must never do is mint a fresh key, which would orphan everything stored: that is the reason the latch
exists.

## Reading the logs

The **console is the record.** Ship it somewhere with a retention you chose: the container's logging
driver on Docker, Application Insights or a Log Analytics workspace on App Service. The rolling file
under `/tmp/trustbridge-logs` feeds the admin console's Server log screen and is a convenience, not a
copy to keep.

Six categories carry the lines an operator should recognise, all visible at the default level:

| Line | Category | When |
|---|---|---|
| Which migrations were applied, or why the schema was refused | `…Persistence.SchemaUpgrade` | Every start |
| Which Key Ring Protector is sealing, its thumbprint, and how many retired ones are readable | `…KeyRings.KeyRingPosture` | Every start |
| Whether the vault is off, open, or latched shut | `…Vault.VaultReadiness` | Every start, and when the latch opens |
| An audit row could not reach the database, **carrying the row** | `…Audit.AuditLog`, at `Critical` | Whenever the database refuses a write |
| The PKI SDK licence is absent or lapsed | `TrustBridge.Pki.Validation.LacunaPkiRuntime` | Every start, with the vault on |
| The Administrator overrides could not be re-read after the schema step | `…Persistence.SchemaGate` | A start where the settings table did not answer |

Every HTTP response carries an `X-Correlation-Id`, and every log line written while serving it carries
the same id, as do the Audit Log rows it produced. A client's complaint, a log line and an audit row
meet on that id.

**Audit fallback belongs in your log retention, not your backups.** An audit row the database would not
take is written to the Server log at `Critical` and nowhere else, and the admin console raises an
alert. The trail has a hole exactly where the database was down; the `Critical` lines are what fill it.

## The Audit Log

Retention is `Audit:RetentionDays` (365), overridable on the Settings screen. A daily purge deletes
older rows. Match it to the deployment's dispute window. The purge over a large `AuditEvents` table is
also what makes the occasional migration long, which is what `WEBSITES_CONTAINER_START_TIME_LIMIT=1800`
on App Service and the thirty-minute per-command budget are for.

## Restarts and upgrades

**One instance, so every restart is visible downtime of a minute or two.** What survives:

| | Survives a Server restart |
|---|---|
| Workstation connections | Machines reconnect by themselves with backoff |
| Workstation-bound Signing Sessions | **Yes**, verbatim: the PIN they rest on is cached at the machine |
| Vault-bound Signing Sessions | **No.** They end as `Stranded`; clients meet `SESSION_EXPIRED` and create new ones with the same PIN |
| Administrator sign-ins | Yes: the web-session key ring is in the database |
| In-flight signing requests | No; they fail retryably. A Signing Operation left `Pending` is ended by a sweep as `Failed` with `RUN_STRANDED` |
| Administrator settings overrides | Yes |

On App Service the platform restarts containers for its own maintenance, so a restart cadence that is
not yours is a visible one for vault signing. Leave `DOCKER_ENABLE_CI` off and deploy deliberately.

**Upgrading the Server** is a new image tag: `docker compose pull && docker compose up -d`, or a new
image on the App Service. The new image applies its own migrations at start and names them in the
log. With `Database:MigrateOnStart=false`, apply them first or the new image refuses to start.

### Rollout order: Server first, then the fleet

A Server and a fleet are never upgraded in the same minute. The Server accepts the current workstation
protocol version (**2**) and the one before it, and the rule with teeth is: **upgrade the Server
first, then the workstations, within one release.**

| State | What happens |
|---|---|
| Server ahead of a machine | Supported. The machine connects, signs and reports verdicts as before. A Trusted CA added on the Server does not reach it, and the fleet screen shows *Needs update* against its row. |
| Machine ahead of its Server | **The machine cannot connect at all.** The older Server refuses the handshake, records it on the machine's fleet row and in the Audit Log as a failed `workstation.connect`, and the machine signs nothing until the Server catches up. |

Upgrading a Server to protocol 2 is also what starts a ready fleet taking trust policy from it: a
machine with `Certificates:Validation:UseServerTrustedCas` at its default takes the Server's Trusted
CAs within seconds of its next handshake, and stops honouring its own anchor files while it holds a
non-empty set. A fleet that must keep its own anchor pipeline turns that switch off on the machines
**before** they meet the upgraded Server.

**Upgrading workstations** is a newer MSI installed over the older one, with no properties. See
[Workstation installation](workstation-installation.md#upgrading).

## Rotating the Key Ring Protector

Rotation is **additive**: a new protector seals new keys and never re-wraps what is already stored.

1. Move the outgoing protector's base64 into `KeyRingProtector__RetiredCertificates__0__Certificate`
   (with `…__0__CertificatePassword` beside it if it has one). A second retired protector takes index
   `1`, and so on.
2. Put the new one in `KeyRingProtector__Certificate`.
3. Restart. The `KeyRingPosture` line should now name the new thumbprint and `1 retired protector(s)`.
4. Keep the old PKCS#12 in your backups, **permanently**. There is no moment at which rotation
   "completes".

Never template an empty retired entry: an entry binding to an empty string is a refused start.

## Renewing the PKI SDK licence

The Lacuna PKI SDK licence expires on a date, and nothing fails loudly when it does: every
certificate reports `UNTRUSTED`, session creation is refused with `CERT_NOT_ACTIVE`, and a `Critical`
line at start is the only notice. Read the expiry out of the file and put it on whatever calendar
tracks certificate renewals:

```bash
base64 -d license.base64 | grep -o '<Expiration>[^<]*'
```

- **On the Server** (only with the vault on): set `Certificates__Validation__License` to the new
  base64 and restart. On App Service with a Key Vault reference, a new secret version and a restart.
- **On the fleet**: publish the new value through the Group Policy template's licence setting, then
  restart the Workstation Service on each machine, since the registry is read once at start. Without
  Group Policy, a silent MSI repair with `PKI_LICENSE=<base64>` on each machine.

## Rotating the Installer Key

Only for a deployment that minted an Installer Key of its own. A Server accepts every key it lists, so
a change is a rollout rather than a flag day: add the new public key beside the old one under
`Admission:InstallerKeys`, restart the Server, re-point the machines' `INSTALLER_KEY` by a silent
repair at their own pace, then drop the old entry and restart again.

## Rotating API keys

Issue a new key for the Client Application on the Client Applications screen, deploy it to the
client, then revoke the old one. Every accepted key of an application is equivalent, so the switch is
invisible to sessions in flight.

## Managing the fleet

- **A machine that never appears in the queue** is almost always a URL or a TLS chain problem; read
  its Application event log first. See
  [Workstation installation](workstation-installation.md#if-the-machine-never-appears-in-the-queue).
- **A decommissioned machine** should be revoked on the fleet screen whether or not it was
  uninstalled. Revocation does not need the machine's cooperation.
- **A reinstalled machine** is a new machine with a new fingerprint and arrives in the queue again.
  An upgrade or a repair is the same machine.
- **A machine reporting *Behind*** on the Trusted CAs column reconnects and re-pulls on its own; one
  reporting *Needs update* needs the current workstation components installed.
- **Clock drift.** A machine whose clock is more than `Workstations:ClockSkewTolerance` (60 s) out
  cannot connect, and the Server's log names it: `A workstation assertion was refused: Expired` or
  `NotYetValid`, with the offset. Time synchronisation is the fix.

## The temporary directories

The Server writes two directories under `/tmp` inside the container and nothing else:

| Path | Holds | If lost |
|---|---|---|
| `/tmp/trustbridge-pki` | The PKI SDK's cache of fetched issuers and CRLs, and the licence handed to the SDK as a file | Nothing. Validation re-downloads what it needs, at about 1.15 s per pass instead of 140 ms |
| `/tmp/trustbridge-logs` | The rolling log file the Server log screen reads | Nothing. Every line was written to the console first |

A read-only filesystem is tolerated, with one exception: the SDK will only read a licence from a
file, so a container with **no** writable temporary directory at all starts a Server whose every
Vault Certificate is `UNTRUSTED`. Mount a `tmpfs` over `/tmp`. To move both, set `TMPDIR`.

Delete the log directory only with the Server stopped: the sink holds the day's file open, and a file
removed from under it keeps taking lines nobody can read until the next roll.

## Backups, in one table

| What | Where | Frequency |
|---|---|---|
| The database | Your SQL Server backups | Continuous or daily, to your policy |
| The Key Ring Protector `.pfx` and every retired one | Off the platform, where irreplaceable things go | Once each; they never change |
| The TLS certificate (Docker) | Wherever your certificates live | Per issuance |
| The Server log stream | Your log pipeline's retention | Continuous |

Restore the database and the protector together. Nothing else needs restoring; workstations
reconnect, and their state lives on the machines.
