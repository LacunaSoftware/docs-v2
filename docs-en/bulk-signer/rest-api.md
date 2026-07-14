---
sidebar_label: "REST API"
sidebar_position: 8
---

# REST API

Lacuna Bulk Signer exposes a small REST surface alongside the operator dashboard. This page covers
authentication, the error envelope, rate limiting, and what each endpoint group does — with curl
examples for the common shapes.

:::tip
The **live OpenAPI reference** with full request/response schemas is served at `/scalar/v1` while
the service is running. This page is the conceptual guide; the live reference is the source of truth
for field-level detail.
:::

## Authentication

Two schemes share one authorization policy:

| Scheme | Header / cookie | Issued via | Used by |
|--------|-----------------|------------|---------|
| API key | `X-API-Key: <key>` (header name from `Auth:ApiKeyHeader`) | Set in `Auth:ApiKey` config / env | Programmatic clients |
| Cookie | `Cookie: lbs-auth=<token>` (name from `Auth:CookieName`) | `POST /api/auth/login` form submit | Operators / dashboard |

The API-key comparison runs in constant time. Both schemes back the same policy on every protected
endpoint. See [Security](security.md) for rotation and ACLs.

Anonymous endpoints:

- `GET  /api/health`
- `GET  /api/ready`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /login` (dashboard, anonymous layout)

Every other endpoint requires authentication.

## Error envelope

Every error response is a `ProblemDetails` body (RFC 9457) with a stable machine-readable slug in the
`code` extension:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Job not found.",
  "status": 404,
  "code": "job.not-found",
  "traceId": "00-…-00",
  "requestId": "0HMV…"
}
```

**Programmatic clients should dispatch on `code`** — `title` is human prose and may be rephrased or
localized. The full inventory:

| Code | Typical status | What it means |
|------|----------------|---------------|
| `job.not-found` | 404 | No job with the given id. |
| `job.not-queued` | 409 | Cancel attempted on a job that is no longer `Queued` (in-flight jobs are sacred). |
| `job.race-lost` | 409 | The worker picked the job up before the action committed; retry. |
| `job.not-failed` | 409 | Retry attempted on a job that is not in `Failed` state. |
| `job.input-missing` | 409 | Retry attempted but the original input file is no longer on disk. |
| `job.output-unavailable` | 404 | Output download requested on a job that has no output yet (not completed). |
| `job.output-gone` | 404 | Output download requested but the file is missing from `output/`. |
| `job.already-processing` | 409 | Upload conflicted with an active job for the same on-disk file. |
| `upload.empty` | 400 | Multipart `file` field is missing or zero bytes. |
| `upload.too-large` | 413 | Upload exceeds `Upload:MaxBytes`. |
| `upload.invalid-name` | 400 | Multipart `file` part is missing a `filename` header. |
| `upload.format-unsupported` | 400 | `?format=…` value is not a recognized signature format. |
| `validation.reason-too-long` | 400 | A `reason` field on pause/cancel exceeds the max length. |
| `validation.filter-invalid` | 400 | A query-string filter (e.g. `?status=…`) is not a recognized value. |
| `auth.misconfigured` | 401 | `Auth:ApiKey` is empty at runtime — fix the config, not the request. |
| `auth.invalid-credentials` | 401 | Wrong API key or expired cookie. |
| `folder.not-found` | 404 | `POST /api/rescan?folder=<name>` named a folder not in `Storage:Inputs[]`. |
| `profile.not-found` | 400 | `POST /api/files?profile=<name>` named a profile not in `Signing:Profiles[]`. |
| `signer.document-rejected` | — | Audited on the failed job. Set when Lacuna Signer reports the document `Refused`, `Expired`, or `Canceled`. |
| `signer.timeout` | — | Audited on the failed job. Set when an `AwaitingSigner` row exceeds `Signer:TimeoutHours`. |
| `signer.unreachable` | — | Audited on the failed job. Set when the Lacuna Signer API returned a permanent error (e.g. invalid API key). |
| `rate-limited` | 429 | Per-IP fixed-window limit exceeded. |
| `internal` | 500 | Framework-generated 500 (no business code involved). |

In `Production`, the error customizer strips `detail`, `instance`, and any extension other than
`code`, `traceId`, `requestId`, `errors`. No stack traces escape. In `Development`, full details flow
through.

A `code` value is never renamed or repurposed — new codes are only added, so a client matching on
`code` is safe across upgrades.

## Rate limiting

Per-IP fixed-window limiters, configured under `RateLimiting:` (see
[Configuration](configuration.md#ratelimiting)). Two policies:

| Policy | Default | Endpoints |
|--------|---------|-----------|
| `Upload` | 30 / 60 s | `POST /api/files` |
| `Actions` | 60 / 60 s | `POST /api/jobs/{id}/retry`, `POST /api/jobs/{id}/cancel`, `POST /api/pipeline/pause`, `POST /api/pipeline/resume`, `GET /api/pipeline/state`, `POST /api/rescan`, `POST /api/cleanup` |

Over-limit responses are `429 Too Many Requests` with `code = "rate-limited"` and a `Retry-After`
header.

## Endpoint groups

### Authentication

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth/login` | Form POST. Exchanges an API key for a session cookie. Anonymous. |
| `POST` | `/api/auth/logout` | Clears the cookie and redirects to `/login`. |

Form fields for `/api/auth/login`:

| Field | Required | Notes |
|-------|----------|-------|
| `ApiKey` | yes | Matched against `Auth:ApiKey` in constant time. |
| `ReturnUrl` | no | Local-relative path to land on after login. Open-redirect attempts are rewritten to `/`. |

Programmatic clients usually skip cookies and send `X-API-Key` directly on every request.

### Files

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/files` | Multipart upload of one file for signing. `Upload` rate-limited. |

Query parameters:

| Parameter | Type | Notes |
|-----------|------|-------|
| `format` | enum | Optional override (`Pades`, `Cades`, `Xades`). Default: extension-based auto-detect. |
| `profile` | string | Optional. Names an entry in `Signing:Profiles[]`. Null/omitted falls back to the `default` profile. Unknown names return `400` with `code = "profile.not-found"`. |

```bash
curl -X POST http://localhost:8080/api/files \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" \
  -F "file=@report.pdf" \
  -F "format=Pades"   # optional override; default is auto-detect by extension

# Route an upload through a specific profile (e.g. contracts):
curl -X POST "http://localhost:8080/api/files?profile=contracts" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" \
  -F "file=@nda.pdf"
```

Response (`202 Accepted`):

```json
{
  "jobId": "9b62…",
  "fileName": "report.pdf",
  "originalPath": "/var/lib/bulksigner/input/<guid>.pdf",
  "format": "Pades",
  "status": "Queued"
}
```

Possible errors: `upload.empty`, `upload.too-large`, `upload.invalid-name`,
`upload.format-unsupported`, `profile.not-found`, `job.already-processing`, `rate-limited`.

### Jobs

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/jobs` | List jobs, newest first. Query: `status`, `profile`, `page`, `pageSize` (max 200). |
| `GET` | `/api/jobs/{id}` | One job + its history. |
| `GET` | `/api/jobs/{id}/output` | Stream the signed (and possibly encrypted) output. `.enc` filename when encrypted. |
| `POST` | `/api/jobs/{id}/retry` | Create a new job with the same input and `ParentJobId = {id}`. Only valid when the source job is `Failed`. `Actions` rate-limited. |
| `POST` | `/api/jobs/{id}/cancel` | Cancel a `Queued` **or** `AwaitingSigner` job. In-flight local jobs return `409` with `code = "job.not-queued"`. `Actions` rate-limited. |

List `Queued` jobs:

```bash
curl "http://localhost:8080/api/jobs?status=Queued&page=1&pageSize=50" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Response:

```json
{
  "items": [
    {
      "id": "9b62…",
      "fileName": "report.pdf",
      "originalPath": "/var/lib/bulksigner/input/<guid>.pdf",
      "format": "Pades",
      "source": "Upload",
      "status": "Queued",
      "createdAt": "2026-05-26T13:42:11Z",
      "updatedAt": "2026-05-26T13:42:11Z",
      "parentJobId": null,
      "errorMessage": null,
      "profileName": "default"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalCount": 1
}
```

`GET /api/jobs/{id}` returns the same shape plus a `history` array of
`{ id, timestamp, status, message }` entries (one per state transition).

Retry / cancel are POST with no body required:

```bash
curl -X POST "http://localhost:8080/api/jobs/$ID/retry" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

curl -X POST "http://localhost:8080/api/jobs/$ID/cancel" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Retry on success returns:

```json
{ "newJobId": "fc12…", "parentJobId": "9b62…", "status": "Queued" }
```

### Pipeline

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/pipeline/state` | Current `paused / pausedAtUtc / resumedAtUtc / pausedBy / reason` plus live worker capacity. `Actions` rate-limited. |
| `POST` | `/api/pipeline/pause` | Idempotent hold on the worker. Survives restart. Optional `reason`. `Actions` rate-limited. |
| `POST` | `/api/pipeline/resume` | Idempotent resume. `Actions` rate-limited. |

Pause / resume accept an optional JSON body `{ "reason": "…" }` (max length enforced — over-limit
returns `validation.reason-too-long`):

```bash
curl -X POST "http://localhost:8080/api/pipeline/pause" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Quarterly maintenance"}'
```

State response:

```json
{
  "paused": true,
  "pausedAtUtc": "2026-05-26T15:00:00Z",
  "resumedAtUtc": null,
  "pausedBy": "operator",
  "reason": "Quarterly maintenance",
  "maxConcurrency": 4,
  "jobsInFlight": 2,
  "jobsInFlightByFormat": {
    "pades": 1,
    "cades": 1,
    "xades": 0,
    "total": 2
  }
}
```

`maxConcurrency` is the configured `Pipeline:MaxConcurrency` (read once at startup; restart to
change). `jobsInFlight` and `jobsInFlightByFormat` count rows currently in `Processing` or
`Verifying`. Operators watching a drain after a pause will see `paused: true` while `jobsInFlight`
counts down to `0`.

### Actions

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/rescan` | Re-enqueue every file in every configured input folder. Accepts `?folder=<name>` to scope to one folder. `Actions` rate-limited. |
| `POST` | `/api/cleanup` | Apply retention to `processing/`, `output/`, `error/`. Currently a no-op stub; see [Retention](retention.md). `Actions` rate-limited. |

```bash
# Rescan every configured folder
curl -X POST "http://localhost:8080/api/rescan" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

# Rescan just one folder
curl -X POST "http://localhost:8080/api/rescan?folder=legal" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Rescan response shape:

```json
{
  "folders": [
    {
      "name": "default",
      "path": "/var/lib/bulksigner/input",
      "scanned": 4, "enqueued": 3, "alreadyActive": 0, "ignored": 1, "errors": 0,
      "enqueuedFiles": ["a.pdf", "b.pdf", "c.xml"]
    }
  ],
  "totals": { "folders": 1, "scanned": 4, "enqueued": 3, "alreadyActive": 0, "ignored": 1, "errors": 0 }
}
```

An unknown `?folder=<name>` returns `404` with `code = "folder.not-found"` and the configured names
in `detail`. `Cleanup` returns `200 OK` while the retention service is the null stub.

### System

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/health` | Anonymous | Liveness — `200 OK` if the host process is up. |
| `GET` | `/api/ready` | Anonymous | Readiness — JSON body listing DB / per-folder / license probes. `503` if any probe fails. |
| `GET` | `/api/folders` | Authorized | Per-folder runtime state: name, absolute path, exists, status, last enqueue time, last error, lifetime processed count, file count (capped at 50). |
| `GET` | `/api/metrics` | Authorized when `Metrics:RequireApiKey = true` (default) | Prometheus exposition. |
| `GET` | `/api/whoami` | Authorized | Echoes the authenticated identity (operator + scheme used). |

`/api/health` is always anonymous so external health checkers (load balancers, Docker `HEALTHCHECK`,
Kubernetes `livenessProbe`) need no credentials. `/api/ready` is anonymous and returns a structured
body — examine the body for which probe failed.

## Metrics

`/api/metrics` exposes the following instruments (Prometheus format):

| Metric | Kind | What it tracks |
|--------|------|----------------|
| `bulksigner_jobs_enqueued_total{folder=...}` | Counter | Every successful enqueue. The `folder` label is the `Storage:Inputs[].Name`, or `"(upload)"` for REST uploads. |
| `bulksigner_jobs_completed_total` | Counter | Job reached `Completed`. |
| `bulksigner_jobs_failed_total` | Counter | Job reached `Failed`. |
| `bulksigner_jobs_canceled_total` | Counter | Operator-canceled jobs. |
| `bulksigner_pipeline_pause_total` | Counter | Pause transitions. |
| `bulksigner_pipeline_resume_total` | Counter | Resume transitions. |
| `bulksigner_pipeline_paused` | Gauge | 1 paused / 0 running. |
| `bulksigner_files_encrypted_total` | Counter | BSENC v1 envelopes written. |
| `bulksigner_jobs_in_flight` | Gauge | Live count of `Processing` + `Verifying`. |
| `bulksigner_signing_duration_seconds{format=Pades\|Cades\|Xades}` | Histogram | Sign + verify + promote duration. |
| `bulksigner_jobs_dispatched_to_signer_total{profile}` | Counter | Successful dispatches to Lacuna Signer, labeled by profile. |
| `bulksigner_jobs_awaiting_signer` | Gauge | Live count of `AwaitingSigner` rows. |
| `bulksigner_signer_poll_duration_seconds` | Histogram | Per-tick duration of one full pass over `AwaitingSigner` rows. |
| `bulksigner_signer_api_errors_total{op}` | Counter | Lacuna Signer API errors, labeled by operation. |

A minimal Prometheus scrape config (assuming the scraper sits inside the trust boundary and
`Metrics:RequireApiKey = false`):

```yaml
scrape_configs:
  - job_name: bulksigner
    static_configs:
      - targets: ['bulksigner:8080']
    metrics_path: /api/metrics
```

When `Metrics:RequireApiKey = true`, set the API key on the scraper. Prometheus supports
`authorization`/`basic_auth`; for the `X-API-Key` header, use a sidecar reverse proxy that injects
the header, or set `Metrics:RequireApiKey = false` after locking the network down.

## Live reference

The OpenAPI reference UI is served at `http://<host>:8080/scalar/v1`. It carries the canonical schema
for every endpoint, including request/response shapes and query parameter lists. If a programmatic
client needs anything not covered here, the live reference is the next stop.

---

**Next:** [Encryption](encryption.md) — optional post-signing encryption.
**Previous:** [Dashboard](dashboard.md).
