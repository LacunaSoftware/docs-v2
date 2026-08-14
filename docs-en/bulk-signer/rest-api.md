---
sidebar_label: "REST API"
sidebar_position: 10
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
- `POST /api/culture` (display-language preference)
- `GET  /login` (dashboard, anonymous layout)
- `POST /api/approvals/{id}` and `GET /approve/{id}` — **only when a signing profile carries an
  [`Approval` block](approvals.md).** The one anonymous mutating route in the product, anonymous by
  explicit decision. See [Security](security.md#the-per-job-approval-page-is-not-authenticated).

Every other endpoint requires authentication.

When [Microsoft Entra ID sign-in](configuration.md#authentraid--optional-microsoft-entra-id-sign-in)
is configured, `POST /api/auth/login` issues no cookie even for a correct key and the operator policy
requires the `Administrator` app role. **`X-API-Key` is untouched** — automation cannot do an
interactive sign-in, so programmatic clients never notice the mode.

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
| `cnab240.invalid` | — | Audited on the failed job. The file was not a compliant Banco do Brasil remessa. See [CNAB240](cnab240.md#when-a-file-is-refused). |
| `cnab240.payment-date-passed` | — | Audited on the failed job. The remessa's earliest payment date is in the past. Re-export with current dates; retrying the same file fails identically. |
| `approval.not-required` | 404 | `GET /api/jobs/{id}/approvals` on a job that never parked. Distinct from a parked job nobody has decided on, which is `200` with an empty list. |
| `approval.not-pending` | 409 | The job accepts no decision in its current status. |
| `approval.unknown-approver` | 403 | The address is not in the job's frozen pool — also returned for a malformed address, deliberately. |
| `approval.already-decided` | 409 | This approver has already decided; decisions are final. |
| `approval.unknown-decision` | 400 | `decision` was present and was neither `approved` nor `rejected`. |
| `approval.job-incomplete` | 500 | The job is parked but its frozen rule or content hash is missing — the row was modified outside the application. |
| `approval.rejected` | — | Audited on the failed job. A rejection landed after a worker had already claimed the job, so the pipeline refused the signature. |
| `approval.content-changed` | — | Audited on the failed job. The staged copy changed between being approved and being signed. **Should never be seen.** |
| `job.input-diverged` | — | Audited on the *completed* job, not a failure. The input file was rewritten during the job, so it was left in place rather than deleted. See [Operations](operations.md#when-an-input-file-changes-mid-job). |
| `culture.not-supported` | 400 | `POST /api/culture` named a culture other than `en-US` or `pt-BR`. |
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
| `Actions` | 60 / 60 s | `POST /api/jobs/{id}/retry`, `POST /api/jobs/{id}/cancel`, `DELETE /api/jobs`, `POST /api/pipeline/pause`, `POST /api/pipeline/resume`, `GET /api/pipeline/state`, `POST /api/rescan`, `POST /api/cleanup` |
| `Approval` | 10 / 60 s | `POST /api/approvals/{id}` — its own budget, separate from the operator actions, because the route is anonymous. Job ids are v4 GUIDs, and this is what keeps them unguessable against a machine rather than a person. |
| `Export` | — | `GET /approvals/export/{list}` — the approver portal's Excel export. Bounds how fast copies of a queue can be made. |

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
| `POST` | `/api/jobs/{id}/cancel` | Cancel a `Queued`, `AwaitingSigner` **or** `AwaitingApproval` job. In-flight local jobs return `409` with `code = "job.not-queued"`. `Actions` rate-limited. |
| `GET` | `/api/jobs/{id}/approvals` | **Read only.** The job's approval record: the frozen rule, the frozen pool with each member's decision, and the decision list. `404` with `approval.not-required` on a job that never parked. |
| `DELETE` | `/api/jobs` | **Destructive.** Delete every job record and its history. Returns `{"deleted": N, "message": "…"}`. Leaves events, files, and configuration untouched. `Actions` rate-limited. See [Clear Jobs](operations.md#clear-jobs). |

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
`{ id, timestamp, status, message }` entries (one per state transition), and — on the **detail**
representation only, never on list rows — two objects that are `null` on jobs they do not apply to:

```json
{
  "cnab240": {
    "totalCentavos": 387961326,
    "totalFormatted": "R$ 3.879.613,26",
    "paymentCount": 44,
    "cancellationCount": 0,
    "earliestPaymentDate": "2026-08-05",
    "latestPaymentDate": "2026-08-20",
    "contentSha256": "9f86d081…"
  },
  "approval": {
    "required": 2,
    "poolSize": 3,
    "approved": 1,
    "rejected": 0,
    "outstanding": 1,
    "quorumReached": false,
    "vetoed": false,
    "frozenAt": "2026-08-01T09:12:44Z",
    "parkedSince": "2026-08-01T09:12:44Z",
    "expiresAt": "2026-08-03T09:12:44Z",
    "expiresAfterSeconds": 172800
  }
}
```

- `totalCentavos` is the authoritative integer — divide by 100 to display. `totalFormatted` is provided
  so a report agrees with the operator console without reimplementing Brazilian currency formatting.
  The individual payment lines are **not** exposed over REST — see
  [CNAB240](cnab240.md#what-the-rest-api-returns).
- Every `approval` figure is the rule **frozen onto the job**, never the one currently in
  `appsettings.json`. `approved` and `rejected` count distinct people, not rows.
- **Branch on `vetoed`, not on `rejected > 0` arithmetic of your own**: one rejection stops the job
  whatever the quorum says, and `quorumReached` can be `true` on a job a veto has already stopped.
- `parkedSince` is **not cleared** when the job leaves `AwaitingApproval` — subtract it from now for
  "how long has this been waiting", the figure a stalled-approval monitor alerts on.

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

### Approvals

Present only when a signing profile carries an [`Approval` block](approvals.md).

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/approvals/{id}` | **Anonymous** | Record one approver's decision on a job parked in `AwaitingApproval`. Reaching the frozen quorum returns it to `Queued` and wakes the pipeline; a single rejection cancels the job outright. `Approval` rate-limited. |
| `GET` | `/api/jobs/{id}/approvals` | API key or cookie | **Read only.** The frozen rule, the frozen pool with each member's decision, and the decision list. |

Body: `email` (required), `decision` (`approved` \| `rejected`, case-insensitive, **default
`approved`**), `reason` (optional, ≤ 512 chars).

```bash
curl -X POST "http://localhost:8080/api/approvals/3f2a…" \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@empresa.com.br"}'
```

```json
{ "jobId": "3f2a…", "approverName": "Maria Silva", "approved": 2, "required": 2, "outstanding": 0, "quorumMet": true, "released": true }
```

Rejecting returns a differently shaped `200` — there is no tally, because no arithmetic was consulted:

```json
{ "jobId": "3f2a…", "approverName": "Maria Silva", "reason": "valor errado no lote 2", "terminated": true }
```

`terminated` is false only in the narrow race where a worker had already claimed the job; the pipeline
then refuses the signature itself and the job ends `Failed` with `approval.rejected`. Either way the
file is not signed. Omitting `decision` still means `approved`, so clients written before rejection
existed are unaffected.

Name and CPF on the recorded row come from the frozen pool, never from the request body — the only
fields a caller supplies are the address, the decision and the reason.

The read side returns the pool alongside the decisions, because "who has decided" only means something
against "who could have". **CPF is masked to its check digits** on both, and the recorded IP address
and user agent are deliberately not reported — they are investigation material read from the host,
not fields for whoever holds an API key. The endpoint answers on terminal jobs too, which is when a
compliance report is most likely to ask.

:::danger This is the only anonymous mutating route in the product
Anyone who can reach the URL can approve *or reject* as anyone in the job's frozen pool. The approver's
address must appear in that pool, but nothing verifies that they are that person. **There is no REST
route that approves behind the API key**, and adding one is not a planned improvement — see
[Security](security.md#there-is-no-rest-approve-endpoint).
:::

### Preferences

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/culture?culture=<en-US\|pt-BR>&redirectUri=<local path>` | Anonymous | Writes the caller's display-language choice to the standard ASP.NET Core culture cookie (one year, `HttpOnly`, `SameSite=Lax`) and redirects back. Anything that is not a local path falls back to `/` rather than becoming an open redirect. An unsupported culture returns `400` with `code = "culture.not-supported"`. |

Anonymous by necessity rather than convenience: its primary audience is the credential-less approver on
`/approve/{id}`, who needs the switch *before* authenticating. It exists for the dashboard's language
selector; there is no reason for a programmatic client to call it, and it changes **nothing** about the
API — problem prose, `JobStatus` wire values and audit messages are English regardless.

### System

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/health` | Anonymous | Liveness — `200 OK` if the host process is up. |
| `GET` | `/api/ready` | Anonymous | Readiness — JSON body listing operational-store / per-folder / license probes. `503` if any probe fails. The `database` check names the store it checked (`reachable (SQLite (data/db/bulksigner.db))`, `reachable (SQL Server (sqlsrv01/BulkSigner))`) and never carries the connection string. Each configured input folder appears as its own `input-folder:<name>` check. On a remote work share, two further families appear: one `storage-share:<account>/<share>` row per share, and a single `work-share-owner` row that goes red when another instance held the marker at startup. Both report what was true **at startup** and say so. |
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
| `bulksigner_jobs_canceled_total` | Counter | Operator-canceled jobs (from `Queued`, `AwaitingSigner` or `AwaitingApproval`). |
| `bulksigner_jobs_verify_skipped_total{profile}` | Counter | Jobs whose post-sign verification was skipped because their profile carries `Verify = false`. A non-zero series is the low-trust posture showing up in monitoring rather than only in the startup banner. |
| `bulksigner_cert_validation_failed_total{profile}` | Counter | Pre-sign certificate-validation failures. Rises when a chain stops validating — an expired or revoked signing certificate looks like this before it looks like anything else. |
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
| `bulksigner_jobs_parked_for_approval_total{profile}` | Counter | Successful `Processing → AwaitingApproval` transitions. |
| `bulksigner_jobs_awaiting_approval` | Gauge | Live count of `AwaitingApproval` rows. Set from a scan, so it is correct after a restart while jobs are still parked. |
| `bulksigner_approvals_recorded_total{profile}` | Counter | Decisions recorded, one per person per job — approvals **and** rejections. The only metric covering the anonymous approval route as a whole, so it is also how an operator notices that route being used at all. |
| `bulksigner_approvals_rejected_total{profile}` | Counter | The rejection subset; each one vetoes its job. Separate from `bulksigner_jobs_canceled_total`, which counts what an *operator* did. |
| `bulksigner_jobs_released_by_approval_total{profile}` | Counter | Parked jobs whose quorum was met, returning them to `Queued`. |
| `bulksigner_approvals_expired_total{profile}` | Counter | Parked jobs canceled because their frozen wait budget elapsed — the series that counts *nobody* acting, which makes it the one to alert on. Flat at zero unless a profile sets `Approval.ExpiresAfter`. |
| `bulksigner_jobs_content_changed_total{profile}` | Counter | Jobs refused by the pre-sign content-binding guard. **Should be flat at zero forever** — anything else means an artifact changed between being measured and being signed. |
| `bulksigner_inputs_diverged_total{profile}` | Counter | Input files left in place after signing because the file on disk was no longer the copy that was staged. **Not a failure** — the job completed and its output is good. See [Operations](operations.md#when-an-input-file-changes-mid-job). |

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
**Previous:** [Telemetry](telemetry.md).
