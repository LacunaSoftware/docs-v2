---
sidebar_label: "Bulk Signer"
sidebar_position: 1
---

# Lacuna Bulk Signer

Lacuna Bulk Signer is an **on-premises bulk digital-signing service** for ICP-Brasil-compatible
scenarios. It receives files from automated sources (watched folders or a REST upload), processes
them through a controlled signing pipeline, and produces verified signed outputs — with a full
operational history, an operator dashboard, and automatic recovery on restart.

Bulk Signer is designed to run inside your own infrastructure: a single service that watches folders
(or accepts uploads), signs, verifies, and promotes the results to an output folder. There is no
auto-update, and a default install makes no outbound connections — remote signing, Azure Key Vault,
and telemetry are each opt-in.

## Features

- **Signature formats.** CAdES (`.p7m`), PAdES (PDF), and XAdES (XML) — all under the ICP-Brasil
  **ADR-Básica** policy by default. Per-profile output naming keeps the original extension
  (`remessa.signed.rem`) or writes PEM-armored CAdES where a downstream system requires it.
- **Certificate sources.** PKCS#12 files (`.pfx` / `.p12`), PKCS#11 HSMs and smart cards, the
  Windows certificate store, and **Azure Key Vault** (the key stays in the vault and signs remotely).
  The `.pfx` or `.cer` can be read from **Azure Blob Storage** instead of local disk. The source is
  chosen entirely through configuration, globally or per signing profile.
- **Two ingestion paths.** A watched input folder (with a stability detector so half-written files
  are not picked up early) and a `POST /api/files` endpoint for programmatic clients.
- **CNAB240 payment files.** Opt-in per profile: parse a Banco do Brasil remessa, refuse to sign one
  that is not compliant or whose payment dates have passed, and show an operator the total, the
  payer and every individual payment.
- **Approval gate.** Park a payment file on a quorum of named approvers before any signature exists.
  One rejection is a veto; approvals are bound to the file's bytes, and the rule is frozen onto the
  job so editing configuration can never release a parked file. Approvers get their own queue, with
  batch approval and an Excel export — and an optional **TOTP second factor** that asks an approver to
  prove they are present before a decision.
- **Recoverable pipeline.** Jobs flow through a durable queue with pause/resume that survives a
  restart. If the service is stopped mid-flight, a startup recovery sweep moves any interrupted job
  aside so nothing is silently lost.
- **Optional post-signing encryption (BSENC v1).** AES-256-GCM-encrypts signed artifacts at rest
  when enabled. Ships with reference Python and PowerShell decryption scripts.
- **Lacuna Signer integration (per profile).** Route a folder to [Lacuna Signer](https://www.lacunasoftware.com/)
  for human signing instead of signing with a host-held certificate.
- **Authentication, two ways.** A single API key backs both the operator dashboard (via a session
  cookie) and programmatic clients (via the `X-API-Key` header) — or turn on optional **Microsoft
  Entra ID** sign-in with `Administrator` and `Approver` app roles, leaving the REST API key
  untouched.
- **Operator dashboard, in English or Brazilian Portuguese.** A web console with live status, job
  history, retry/cancel/rescan actions, a recent-exception viewer, and an audit trail. The language
  is the reader's per-browser choice, not a server setting.
- **Storage and store, local or in Azure.** The work tree can stay on local disk or live in an
  **Azure Files** share; the operational store can stay in SQLite or move to **SQL Server / Azure
  SQL** under your own backup and DR regime. The two choices are independent.
- **Scale-out on Azure App Service (opt-in).** `Cluster:Enabled` runs more than one active instance over
  one operational store and one work share: a job is never processed twice, a dying instance's work is
  taken over rather than stranded, and the pipeline keeps signing while a host is gone. Off by default,
  and off is byte-for-byte the single-instance product. See
  **[Azure App Service](azure.md)** and, first, **[its limits](high-availability.md)**.
- **Database backup (SQLite deployments).** Scheduled or on-demand backups of the operational store to a
  local path, an S3-compatible bucket or an Azure Blob container, with a retention count.
- **Performance visibility.** A per-stage timing panel (queue wait, signing, verification, output)
  with throughput and a Local vs Remote split — held in the operational store, so it survives restarts
  and describes a whole cluster — plus optional Azure Application Insights export.
- **Observability.** Structured logs with automatic secret redaction and an optional **Azure Table**
  sink for hosts whose disk does not survive a restart, a Prometheus metrics endpoint, and an RFC 9457
  `ProblemDetails` error envelope with stable machine-readable codes.
- **Per-IP rate limiting.** Configurable fixed-window limits on the upload, action, approval and
  export endpoints, with optional forwarded-header support so the real client is counted behind a proxy
  or load balancer.
- **Multi-target deployment.** The same service runs as a Linux systemd unit, a Windows Service, a
  Docker container, an Azure Web App, or a foreground console process.

## How it works

```
  input/ folder ──┐
                  ├──▶ Queue ──▶ Claim ──▶ [gates] ──▶ Sign ──▶ Verify ──┬──▶ output/
  POST /api/files ┘                                                      │    (output/*.enc
                                                            on failure   │     when encryption
                                                                         └──▶ error/    is on)

  [gates], both opt-in per signing profile and skipped entirely when unconfigured:
      CNAB240 parse   — refuse a non-compliant remessa, or one whose payment dates have passed
      Approval gate   — park in AwaitingApproval until a quorum of named people approves
```

Every step is recorded in the operational store (job history + system events) and in the structured
log file. The dashboard and the REST API read the same data and trigger the same actions.

## Quickstart — Docker

Using the deployment package provided by Lacuna Software:

```bash
cd deploy/docker

cp .env.sample .env
mkdir -p data logs config
cp ../appsettings.Production.json.sample config/appsettings.Production.json

# Edit config/appsettings.Production.json and .env — at minimum:
#   - Signing__PkiSdkLicense       (base64 license string from Lacuna Software)
#   - Auth__ApiKey                 (>= 16 characters; use a random value)
#   - Signing:Certificate:Pfx:Path (and a sibling .pfx file in config/) — or pick another source

sudo chown -R 1654:1654 data logs   # the container runs as UID 1654 on Linux hosts
docker compose up -d
curl http://localhost:8080/api/health
```

Sign in to the dashboard at `http://localhost:8080/` using the configured `Auth:ApiKey`.

For Linux systemd, Windows Service, and foreground installs, see **[Installation](installation.md)**.

## Documentation

| Topic | Page |
|-------|------|
| Install the service on any supported target | [Installation](installation.md) |
| Scale out on Azure App Service, step by step | [Azure App Service (cluster mode)](azure.md) |
| What running more than one instance does *not* give you | [High availability and its limits](high-availability.md) |
| Every `appsettings.json` key (type, default, environment override) | [Configuration](configuration.md) |
| Picking and configuring a certificate source (PFX / PKCS#11 / Windows store / Azure Key Vault) | [Certificates](certificates.md) |
| Secret handling, API-key rotation, file ACLs, log redaction | [Security](security.md) |
| Day-2 operations and the job lifecycle | [Operations](operations.md) |
| The Blazor operator console | [Dashboard](dashboard.md) |
| Reading the per-stage timing panel | [Job statistics](statistics.md) |
| Optional Azure Application Insights export | [Telemetry](telemetry.md) |
| The REST surface and the `code`-tagged error envelope | [REST API](rest-api.md) |
| Post-signing encryption (BSENC v1) | [Encryption](encryption.md) |
| Routing a folder through Lacuna Signer for human signing | [Lacuna Signer integration](lacuna-signer.md) |
| Parsing and validating Banco do Brasil payment files | [CNAB240 payment files](cnab240.md) |
| Parking a payment file on a quorum of approvers | [Approvals](approvals.md) |
| Retention defaults and what is (and is not) auto-pruned today | [Retention](retention.md) |
| Failure modes and diagnosis | [Troubleshooting](troubleshooting.md) |
| Reference scripts — decrypt, Key Vault provisioning, Entra app registration | [Samples](samples.md) |

When the service is running, a live OpenAPI reference is served at `/scalar/v1`.

## Reading order

| If you are… | Start at |
|-------------|----------|
| Installing the service for the first time | [Installation](installation.md) → [Configuration](configuration.md) → [Certificates](certificates.md) |
| Wiring an automated system to the REST API | [REST API](rest-api.md) → [Security](security.md) → [Troubleshooting](troubleshooting.md) |
| Operating an existing install | [Operations](operations.md) → [Dashboard](dashboard.md) → [Troubleshooting](troubleshooting.md) |
| Diagnosing slow throughput | [Job statistics](statistics.md) → [Certificates](certificates.md) → [Telemetry](telemetry.md) |
| Keeping the signing key off the host | [Certificates](certificates.md#source--azurekeyvault) → [Samples](samples.md) → [Security](security.md) |
| Enabling encryption | [Encryption](encryption.md) → [Security](security.md) → [Samples](samples.md) |
| Routing a folder through Lacuna Signer (human signing) | [Lacuna Signer integration](lacuna-signer.md) → [Configuration](configuration.md) → [Operations](operations.md) |
| Signing bank payment files | [CNAB240 payment files](cnab240.md) → [Approvals](approvals.md) → [Security](security.md) |
| Putting an approval step in front of the signer | [Approvals](approvals.md) → [Configuration](configuration.md#signingprofilesapproval--the-approval-gate) → [Security](security.md) |
| Signing in with organizational accounts | [Installation](installation.md#microsoft-entra-id-sign-in-optional) → [Configuration](configuration.md#authentraid--optional-microsoft-entra-id-sign-in) → [Security](security.md) |
| Running with no durable local disk | [Configuration](configuration.md#storageprovider--storageazurefiles--the-work-share) → [Installation](installation.md#choosing-where-the-operational-store-lives) → [Certificates](certificates.md#reading-the-file-from-a-blob) |
| Running more than one instance | [High availability and its limits](high-availability.md) → [Azure App Service](azure.md) → [Configuration](configuration.md#cluster--multi-instance-deployment) |
| Keeping the log stream when the host's disk does not survive | [Configuration](configuration.md#loggingazuretable--a-second-log-sink) → [Retention](retention.md#logs-in-a-table--nothing-prunes-them) |
| Asking approvers for a second factor | [Approvals](approvals.md#proving-it-is-you) → [Configuration](configuration.md#approversecondfactor) → [Security](security.md) |
| Backing up the operational store | [Retention](retention.md#backup-discipline) → [Configuration](configuration.md#backup) |
