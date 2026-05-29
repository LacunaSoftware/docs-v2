---
sidebar_label: "Bulk Signer"
sidebar_position: 1
---

# Lacuna Bulk Signer

Lacuna Bulk Signer is an **on-premises bulk digital-signing service** for ICP-Brasil-compatible
scenarios. It receives files from automated sources (watched folders or a REST upload), processes
them through a controlled signing pipeline, and produces verified signed outputs — with a full
operational history, an operator dashboard, and automatic recovery on restart.

Bulk Signer is designed to run inside your own infrastructure. It has no remote dependency, no
telemetry, and no auto-update: a single service that watches folders (or accepts uploads), signs,
verifies, and promotes the results to an output folder.

## Features

- **Signature formats.** CAdES (`.p7m`), PAdES (PDF), and XAdES (XML) — all under the ICP-Brasil
  **ADR-Básica** policy by default.
- **Certificate sources.** PKCS#12 files (`.pfx` / `.p12`), PKCS#11 HSMs and smart cards, and the
  Windows certificate store. The source is chosen entirely through configuration.
- **Two ingestion paths.** A watched input folder (with a stability detector so half-written files
  are not picked up early) and a `POST /api/files` endpoint for programmatic clients.
- **Recoverable pipeline.** Jobs flow through a durable queue with pause/resume that survives a
  restart. If the service is stopped mid-flight, a startup recovery sweep moves any interrupted job
  aside so nothing is silently lost.
- **Optional post-signing encryption (BSENC v1).** AES-256-GCM-encrypts signed artifacts at rest
  when enabled. Ships with reference Python and PowerShell decryption scripts.
- **Lacuna Signer integration (per profile).** Route a folder to [Lacuna Signer](https://www.lacunasoftware.com/)
  for human signing instead of signing with a host-held certificate.
- **Hybrid authentication.** A single API key backs both the operator dashboard (via a session
  cookie) and programmatic clients (via the `X-API-Key` header).
- **Operator dashboard.** A web console with live status, job history, retry/cancel/rescan actions,
  and an audit trail.
- **Observability.** Structured logs with automatic secret redaction, a Prometheus metrics
  endpoint, and an RFC 9457 `ProblemDetails` error envelope with stable machine-readable codes.
- **Per-IP rate limiting.** Configurable fixed-window limits on the upload and action endpoints.
- **Multi-target deployment.** The same service runs as a Linux systemd unit, a Windows Service, a
  Docker container, or a foreground console process.

## How it works

```
   input/ folder ─┐
                  ├─▶ Queue ─▶ Sign ─▶ Verify ─┬─▶ output/        (encryption off)
   POST /api/files ┘                           └─▶ output/*.enc   (encryption on)
                                                  │
                                        on failure └─▶ error/
```

Every step is recorded in the operational database (job history + system events) and in the
structured log file. The dashboard and the REST API read the same data and trigger the same
actions.

## Quickstart — Docker

Using the deployment package provided by Lacuna Software:

```bash
cd deploy/docker

cp .env.sample .env
mkdir -p data logs config
cp ../appsettings.Production.json.sample config/appsettings.Production.json

# Edit config/appsettings.Production.json and .env — at minimum:
#   - Signing__License            (base64 license string from Lacuna Software)
#   - Auth__ApiKey                (>= 16 characters; use a random value)
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
| Every `appsettings.json` key (type, default, environment override) | [Configuration](configuration.md) |
| Picking and configuring a certificate source (PFX / PKCS#11 / Windows store) | [Certificates](certificates.md) |
| Secret handling, API-key rotation, file ACLs, log redaction | [Security](security.md) |
| Day-2 operations and the job lifecycle | [Operations](operations.md) |
| The Blazor operator console | [Dashboard](dashboard.md) |
| The REST surface and the `code`-tagged error envelope | [REST API](rest-api.md) |
| Post-signing encryption (BSENC v1) | [Encryption](encryption.md) |
| Routing a folder through Lacuna Signer for human signing | [Lacuna Signer integration](lacuna-signer.md) |
| Retention defaults and what is (and is not) auto-pruned today | [Retention](retention.md) |
| Failure modes and diagnosis | [Troubleshooting](troubleshooting.md) |
| Reference decrypt scripts (Python + PowerShell) | [Samples](samples.md) |

When the service is running, a live OpenAPI reference is served at `/scalar/v1`.

## Reading order

| If you are… | Start at |
|-------------|----------|
| Installing the service for the first time | [Installation](installation.md) → [Configuration](configuration.md) → [Certificates](certificates.md) |
| Wiring an automated system to the REST API | [REST API](rest-api.md) → [Security](security.md) → [Troubleshooting](troubleshooting.md) |
| Operating an existing install | [Operations](operations.md) → [Dashboard](dashboard.md) → [Troubleshooting](troubleshooting.md) |
| Enabling encryption | [Encryption](encryption.md) → [Security](security.md) → [Samples](samples.md) |
| Routing a folder through Lacuna Signer (human signing) | [Lacuna Signer integration](lacuna-signer.md) → [Configuration](configuration.md) → [Operations](operations.md) |
