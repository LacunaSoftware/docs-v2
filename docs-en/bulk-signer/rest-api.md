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

The approver surfaces (the approver portal and its Excel export) use their own browser sessions — the
approver link's cookie, or a Microsoft Entra sign-in carrying the `Approver` role — and those sessions
**never** satisfy the operator policy: an approver is not an operator.

Anonymous endpoints:

- `GET  /api/health`
- `GET  /api/ready` — the readiness **verdict** only, each check's `name` and `ok`. Its detail is on the
  authenticated `GET /api/ready/details`, and `Readiness:RequireApiKey` puts the verdict itself behind
  the key where the prober can carry a header. See [System](#system).
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/entra-login` (begins a Microsoft Entra sign-in; serves only a redirect)
- `POST /api/culture` (display-language preference)
- `GET  /login` (dashboard, anonymous layout)
- `GET  /branding/customer-logo` (the customer's logo on the sign-in and approver pages; `404` with
  `branding.customer-logo-not-available` when none is configured or it did not load)
- `GET  /approvals/link/{token}` — the approver portal's link exchange: anonymous because the link *is*
  the credential.
- `POST /api/approvals/{id}` and `GET /approve/{id}` — used only when a signing profile carries an
  [approval rule](approvals.md). The one anonymous mutating route in the product, anonymous by
  explicit decision. See [Security](security.md#the-per-job-approval-page-is-not-authenticated).

One browser route is neither anonymous nor REST: `GET /approvals/cloud/return`, where a cloud
certificate provider sends an approver's browser back after a cloud signature. It sits behind the
approver session (never an API key), records the signed approval in that request, answers nothing but a
redirect, and shares the `Approval` rate-limit budget below.

Every other endpoint requires authentication. No anonymous route serves job data.

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
localized. The full inventory (a `—` status means the code is never an HTTP response: it is recorded on
the job, or shown on an approver's page, instead):

| Code | Typical status | What it means |
|------|----------------|---------------|
| `job.not-found` | 404 | No job with the given id. |
| `job.not-queued` | 409 | Cancel attempted on a job that is no longer `Queued` (in-flight jobs are sacred). |
| `job.race-lost` | 409 | The worker picked the job up before the action committed; retry. |
| `job.not-failed` | 409 | Retry attempted on a job that is not in `Failed` state. |
| `job.rejected-not-retriable` | 409 | Retry attempted on a job an approver rejected. A veto is not a failure to recover from; the file was returned to `output/` with `.reject` in its name. |
| `job.input-missing` | 409 | Retry attempted but the original input file is no longer on disk. |
| `job.output-unavailable` | 409 | Output download requested on a job that is not `Completed`. On the archive route, at least one named job is not `Completed`; the `detail` names each. |
| `job.output-gone` | 410 | The job is `Completed` but its file is no longer in `output/` under the name the profile's *current* naming rules produce — moved out, or still there under an earlier name because `PreserveFileExtension` or `SaveAsPem` changed after the job completed. On the archive route, returned only when *none* of the named jobs still has its file. |
| `job.archive-empty` | 400 | The archive route was called with no `id`. |
| `job.archive-too-large` | 400 | The archive route was asked for more than 50 distinct jobs. Split the selection. |
| `job.already-processing` | 409 | Upload conflicted with an active job for the same on-disk file. |
| `file.already-processed` | 409 | A `Completed` or still-active job already carries this file name (compared host-wide, ignoring case). `POST /api/files` answers `409` and stores nothing; a retry of a job that failed with this code answers `409` too. From a watched folder or a rescan the file instead becomes a job `Failed` with this code, moved to `error/`. The remedy is to delete the job holding the name from the dashboard's `/jobs` page (there is no REST route for that) or to rename the file. Governed by `Pipeline:RejectAlreadyProcessedFileNames`. |
| `job.path-too-long` | 400 / 409 | The file's path exceeds 850 characters, so no job was created. `POST /api/files` answers `400`; a retry of a row stored before the limit existed answers `409`; a watched folder or rescan reports it to the console and the log. Refused **when the file is taken in** rather than accepted and failed later, on every database provider. Shorten the directory nesting or the file name — retrying the same path changes nothing. |
| `job.input-held` | — | Audited on the failed job. Something else held an exclusive lease on the input file when the pipeline went to stage it — in practice a second instance watching the same Azure Files folder. Nothing was signed and the file is left alone. |
| `job.input-diverged` | — | Audited on the *completed* job, not a failure. The input file was rewritten during the job, so it was left in place rather than deleted. See [Operations](operations.md#when-an-input-file-changes-mid-job). |
| `upload.disabled` | 409 | This host takes no uploads: [`Upload:Enabled`](configuration.md#upload) is `false`. Answered before the profile is resolved, so the response says nothing about which profiles exist. Only a configuration change and a restart turn uploads back on; watched folders, rescan and retry are unaffected. |
| `upload.empty` | 400 | Multipart `file` field is missing or zero bytes. |
| `upload.too-large` | 413 | Upload exceeds `Upload:MaxBytes`. |
| `upload.invalid-name` | 400 | Multipart `file` part is missing a `filename` header. |
| `upload.format-unsupported` | 400 | `?format=…` value is not a recognized signature format. |
| `validation.reason-too-long` | 400 | A `reason` field on pause/cancel exceeds the max length. |
| `validation.filter-invalid` | 400 | A query-string value is not acceptable: an unrecognized filter value (e.g. `?status=…`), a date that does not parse, a `page` past the cap, an archive `id` that is not a GUID. The `detail` names the value. A bad filter is refused, never widened to the whole table. |
| `auth.misconfigured` | 401 | `Auth:ApiKey` is empty at runtime — fix the config, not the request. |
| `auth.invalid-credentials` | 401 | Wrong API key or expired cookie. |
| `folder.not-found` | 404 | `POST /api/rescan?folder=<name>` named a folder not in `Storage:Inputs[]`. |
| `profile.not-found` | 400 / 404 | A profile name nobody has. `POST /api/files?profile=<name>` answers `400` (the name is a parameter of a request to create a job); `GET /api/profiles/{name}` answers `404` (the profile *is* the resource). `GET /api/profiles` lists the names that exist. |
| `profile.disabled` | 409 | The profile exists, but an operator has stopped new work being routed at it. `POST /api/files?profile=<name>` and `POST /api/jobs/{id}/retry` both answer `409`. A rescan still answers `200`, counting the refused files as `ignored`. **Jobs already queued on the profile run to completion.** Re-enable the profile from its dashboard page, or route the work elsewhere. |
| `profile.degraded` | — | Audited on the failed job. The job's profile exists but cannot sign — its certificate could not be opened at startup, or its stored secrets could not be decrypted. The reason is on the job's history and the profile's page. The remedy ends in a **restart**, not in retrying the job or touching the file; every other profile keeps signing. See [Certificates](certificates.md). |
| `profile.key-unavailable` | — | Audited on the failed job. The job was frozen to be signed with the profile key, but the profile's approval rule has since moved to approver signatures only, and this instance holds no key for it. Retry on an instance that still holds the key, or move the rule back and restart. |
| `pipeline.race-lost` | 409 | A concurrent pause or resume committed first, so this one wrote nothing. Read `GET /api/pipeline/state` and retry if the intent still stands. |
| `signer.document-rejected` | — | Audited on the failed job. Set when Lacuna Signer reports the document `Refused`, `Expired`, or `Canceled`. |
| `signer.timeout` | — | Audited on the failed job. Set when an `AwaitingSigner` row exceeds `Signer:TimeoutHours`. |
| `signer.unreachable` | — | Audited on the failed job. Set when the Lacuna Signer API returned a permanent error (e.g. invalid API key). |
| `cnab240.invalid` | — | Audited on the failed job. The file was not a compliant Banco do Brasil remessa. See [CNAB240](cnab240.md#when-a-file-is-refused). |
| `cnab240.payment-date-passed` | — | Audited on the failed job. The remessa's earliest payment date is in the past. Re-export with current dates; retrying the same file fails identically. Never set on a profile with `CheckCnab240PaymentDates = false`, where such a file signs instead. See [CNAB240](cnab240.md#payment-dates-that-have-passed). |
| `approval.not-required` | 404 | `GET /api/jobs/{id}/approvals` on a job that never parked. Distinct from a parked job nobody has decided on, which is `200` with an empty list. |
| `approval.not-pending` | 409 | The job accepts no decision in its current status. |
| `approval.unknown-approver` | 403 | The address is not in the job's frozen pool — also returned for a malformed address, deliberately. |
| `approval.already-decided` | 409 | This approver has already decided; decisions are final. |
| `approval.unknown-decision` | 400 | `decision` was present and was neither `approved` nor `rejected`. |
| `approval.signature-required` | 403 | An approval on a job whose frozen signer set includes the approvers: there, approving means **co-signing the payment file** with the approver's own certificate, which this route cannot carry. A rejection on such a job is still accepted here. The approval itself is made from the approver portal or the per-job page. |
| `approval.second-factor-required` | 403 | `ApproverSecondFactor:Enabled` is on, which **withdraws `POST /api/approvals/{id}` entirely** — every call refuses and no header, key or body field satisfies it, because only a browser session can carry a proven presence. Deciding moves to the approver portal; `GET /api/jobs/{id}/approvals` is unaffected. See [Approvals](approvals.md#proving-it-is-you). |
| `approval.job-incomplete` | 500 | The job is parked but its frozen rule or content hash is missing — the row was modified outside the application. |
| `approval.rejected` | — | Audited on the failed job. A rejection landed after a worker had already claimed the job, so the pipeline refused the signature. |
| `approval.content-changed` | — | Audited on the failed job. The staged copy changed between being approved and being signed. **Should never be seen.** |
| `approval.content-unmeasured` | — | Audited on the failed job. The profile carries an approval rule but the job carries no content hash — the profile's CNAB240 check was off, so nothing parsed the file. A job parked without a hash could never be decided, so it fails by name instead. |
| `approval.signer-set-unsupported` | — | Audited on the failed job. The frozen signer set cannot be produced for this job — for example approver signatures on a job whose format is not CAdES, or the profile key and the approvers together on a profile that signs through Lacuna Signer. The job is never signed under the profile key instead. |
| `approval.signatures-missing` | — | Audited on the failed job. The frozen signer set requires the approvers' signatures and they are not there to promote. |
| `approval.certificate-invalid`, `approval.certificate-without-cpf`, `approval.certificate-cpf-mismatch`, `approval.signature-invalid`, `approval.signature-conflict` | — | Shown to an approver who is signing an approval, never returned by a route. The certificate failed its full check; carries no CPF; carries a CPF other than the one frozen for that approver; the signature did not validate; a colleague signed first (start again). See [Certificates](certificates.md#the-approvers-certificate). |
| `approval.second-factor-invalid-code`, `approval.second-factor-locked-out` | — | Shown on the approver portal's code prompt: a code that did not match (or was already used), and five wrong codes in a row closing that approver's enrolment for five minutes. |
| `backup.disabled` | 409 | `POST /api/backup` on a deployment that takes no backup: `Backup:Enabled` is off, or the database provider is SQL Server, where backup is your own DBMS regime's job. |
| `backup.already-running` | 409 | One backup runs at a time per instance. |
| `backup.not-running` | 409 | `POST /api/backup/cancel` with nothing in flight. |
| `branding.customer-logo-not-available` | 404 | `GET /branding/customer-logo` with no logo configured, or one that did not load at startup. |
| `culture.not-supported` | 400 | `POST /api/culture` named a culture other than `en-US` or `pt-BR`. |
| `rate-limited` | 429 | Per-IP fixed-window limit exceeded. |
| `internal` | 500 | Framework-generated 500 (no business code involved). |

:::note Correction — output refusals are 409 and 410
Earlier editions of this page documented `job.output-unavailable` and `job.output-gone` as `404`.
The route has always answered `409` and `410`; only `job.not-found` is a `404`. Dispatch on `code`
rather than on the status.
:::

In `Production`, the error customizer strips `detail`, `instance`, and any extension other than
`code`, `traceId`, `requestId`, `errors`. No stack traces escape. In `Development`, full details flow
through.

A `code` value is never renamed or repurposed — new codes are only added, so a client matching on
`code` is safe across upgrades.

## Rate limiting

Per-IP fixed-window limiters, configured under `RateLimiting:` (see
[Configuration](configuration.md#ratelimiting)). Four policies:

| Policy | Default | Endpoints |
|--------|---------|-----------|
| `Upload` | 30 / 60 s | `POST /api/files` |
| `Actions` | 60 / 60 s | `POST /api/jobs/{id}/retry`, `POST /api/jobs/{id}/cancel`, `DELETE /api/jobs`, `POST /api/pipeline/pause`, `POST /api/pipeline/resume`, `GET /api/pipeline/state`, `POST /api/rescan`, `POST /api/cleanup`, `POST /api/backup`, `POST /api/backup/cancel` |
| `Approval` | 10 / 60 s | `POST /api/approvals/{id}`, `GET /approvals/link/{token}`, `GET /approvals/cloud/return` — its own budget, separate from the operator actions, because the routes are reachable without an operator credential. Job ids are v4 GUIDs, and this is what keeps them (and link tokens) unguessable against a machine rather than a person. |
| `Export` | 10 / 60 s | `GET /approvals/export/{list}` (the approver portal's Excel export) and `GET /api/jobs/export` (the Jobs page's). An export runs a whole list query and builds a workbook, so it has a budget of its own that cannot spend the permits a cancel or an approval draws on. |

Over-limit responses are `429 Too Many Requests` with `code = "rate-limited"` and a `Retry-After`
header.

## Endpoint groups

### Authentication

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/auth/login` | Form POST. Exchanges an API key for a session cookie. Anonymous. Issues no cookie when the Entra mode is configured. |
| `GET` | `/api/auth/entra-login` | Begins a Microsoft Entra sign-in. Redirects to `/login` when the mode is not configured. |
| `POST` | `/api/auth/logout` | Clears Bulk Signer's session and redirects to `/login` (to `/approvals/link-required` for a session held on an approver link alone). Local only: a Microsoft session is untouched. |

Form fields for `/api/auth/login`:

| Field | Required | Notes |
|-------|----------|-------|
| `ApiKey` | yes | Matched against `Auth:ApiKey` in constant time. |
| `ReturnUrl` | no | Local-relative path to land on after login. Open-redirect attempts are rewritten to `/`. |

Programmatic clients usually skip cookies and send `X-API-Key` directly on every request.

### Files

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/files` | Multipart upload of one file for signing. `Upload` rate-limited. The dashboard's **Upload files** dialog on the [Jobs page](dashboard.md#jobs--jobs) goes through the same handler, so the two refuse a file on identical terms. Off under [`Upload:Enabled = false`](configuration.md#upload), answering `409 upload.disabled`. |

Query parameters:

| Parameter | Type | Notes |
|-----------|------|-------|
| `format` | enum | Optional override (`Pades`, `Cades`, `Xades`). Default: extension-based auto-detect. |
| `profile` | string | Optional. Names a signing profile (case-insensitive; `GET /api/profiles` lists them). Null/omitted falls back to the `default` profile. Unknown names return `400` with `code = "profile.not-found"`; a profile an operator has disabled returns `409` with `code = "profile.disabled"`, before any bytes are staged. |

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

Possible errors: `upload.disabled`, `upload.empty`, `upload.too-large`, `upload.invalid-name`,
`upload.format-unsupported`, `profile.not-found`, `profile.disabled`, `file.already-processed`,
`job.already-processing`, `job.path-too-long`, `rate-limited`.

:::note New in 2.13.0 — a file name is signed once
With `Pipeline:RejectAlreadyProcessedFileNames` on (the default), a file arriving under a name that a
`Completed` or still-active job already carries is refused with `file.already-processed` instead of
being signed a second time. Deleting the job that holds the name, from the dashboard's `/jobs` page,
accepts the name again.
:::

### Jobs

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/jobs` | List jobs, newest first. Query: `status`, `profile`, `page` (at most 10,737,418 — beyond it `400 validation.filter-invalid`), `pageSize` (max 200). |
| `GET` | `/api/jobs/{id}` | One job + its history. |
| `GET` | `/api/jobs/{id}/output` | Stream the signed (and possibly encrypted) output of a `Completed` job. `.enc` filename when encrypted. `409 job.output-unavailable` on any other status; `410 job.output-gone` when the file has left `output/`. |
| `GET` | `/api/jobs/archive?id=…&id=…` | The **signed-output archive**: one ZIP of the signed outputs of the named `Completed` jobs. See [below](#the-signed-output-archive). |
| `GET` | `/api/jobs/export` | The job list as an Excel workbook, cut by the Jobs page's filters. `Export` rate-limited. See [below](#exporting-the-job-list). |
| `POST` | `/api/jobs/{id}/retry` | Create a new job with the same input and `ParentJobId = {id}`. Only valid when the source job is `Failed`. `Actions` rate-limited. |
| `POST` | `/api/jobs/{id}/cancel` | Cancel a `Queued`, `AwaitingSigner` **or** `AwaitingApproval` job. In-flight local jobs return `409` with `code = "job.not-queued"`. `Actions` rate-limited. |
| `GET` | `/api/jobs/{id}/approvals` | **Read only.** The job's approval record: the frozen rule, the frozen pool with each member's decision, and the decision list. `404` with `approval.not-required` on a job that never parked. |
| `DELETE` | `/api/jobs` | **Destructive — Clear Jobs.** Delete **every** job record, in every status, with its history, every file those jobs left behind, and every operational event recorded before the clear. See [below](#clear-jobs). `Actions` rate-limited. |

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
`{ id, timestamp, status, message }` entries (one per state transition, oldest first), and — on the
**detail** representation only, never on list rows — two objects that are `null` on jobs they do not
apply to:

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
    "expiresAfterSeconds": 172800,
    "signers": "ProfileKey"
  }
}
```

- `totalCentavos` is the authoritative integer — divide by 100 to display. `totalFormatted` is provided
  so a report agrees with the operator console without reimplementing Brazilian currency formatting.
  The individual payment lines are **not** exposed over REST — see
  [CNAB240](cnab240.md#what-the-rest-api-returns).
- Every `approval` figure is the rule **frozen onto the job**, never the profile's current one.
  `approved` and `rejected` count distinct people, not rows.
- `signers` is the frozen **signer set** — whose signatures the output carries: `ProfileKey`,
  `Approvers` or `ProfileKeyAndApprovers`. A job that parked before the field existed reports
  `ProfileKey`.
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

Possible retry errors: `job.not-found`, `job.not-failed`, `job.rejected-not-retriable`,
`job.input-missing`, `profile.disabled`, `file.already-processed`, `job.path-too-long`, `job.race-lost`,
`rate-limited`.

#### The signed-output archive

`GET /api/jobs/archive?id=…&id=…` returns one `application/zip` holding the signed outputs of the named
`Completed` jobs — what the Jobs page's **Download N selected** serves.

- At most **50** distinct ids (duplicates collapse). Entries are stored uncompressed under the names
  `output/` holds them — an encrypted output as its `.enc` envelope, as-is. When two outputs share a
  name, the later entry carries its job id before the last extension.
- **Every refusal is decided before the first byte**: `400 validation.filter-invalid` (an `id` that is
  not a GUID), `404 job.not-found`, `409 job.output-unavailable`, `400 job.archive-empty`,
  `400 job.archive-too-large`. Refusals about particular jobs name them.
- A `Completed` job whose file is no longer in `output/` under its expected name does **not** fail the
  batch: it is listed (job id and expected name) in a `MISSING.txt` entry inside the archive.
  `410 job.output-gone` is returned only when none of the named jobs still has its file.
- A read that fails after the download started aborts the connection, so a failed download is a stream
  no ZIP reader opens — never a well-formed archive with a short entry.
- File name `bulksigner-signed-yyyyMMdd-HHmmss.zip` (UTC). The download writes no operational event;
  one log line records the operator and the counts.

```bash
curl -o signed.zip "http://localhost:8080/api/jobs/archive?id=$ID1&id=$ID2" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

#### Exporting the job list

`GET /api/jobs/export` returns the job list as an `.xlsx` workbook, one row per job, newest first — the
Jobs page's **Export to Excel**. It exports **every job the filters admit**, not one page.

- Query: `status`, `profile`, `fileName` (contains-match), `from` and `to` (`yyyy-MM-dd`, inclusive UTC
  days) — the Jobs page's five filters, matched by the same rule as the page and `GET /api/jobs`. A
  value that does not parse, or `from` after `to`, is `400 validation.filter-invalid` naming it — never
  widened to the whole table.
- At most **10,000** rows. A title block states who exported, when (with the server's UTC offset), each
  filter in force, how many jobs matched, and — in red — whether the cap cut the list short.
- Columns: file name, format, profile, source, status (in the reader's display language), created,
  updated, input folder, original path, CNAB240 total and payment count (empty when the job was not a
  remessa), encrypted output, error, parent job id, job id. Every value comes from the job itself; no
  individual payment line is ever exported.
- File name `jobs-yyyyMMdd-HHmmss.xlsx` (UTC). `Export` rate-limited. No operational event; one log line
  records the operator and the counts.

```bash
curl -o jobs.xlsx "http://localhost:8080/api/jobs/export?status=Failed&from=2026-09-01" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

#### Clear Jobs

`DELETE /api/jobs` is a system maintenance action — irreversible, and the same one as **Clear Jobs** on
the dashboard's [System page](dashboard.md#system--system). It deletes:

- **every** job record, in every status — `Queued`, parked on an approver, waiting on Lacuna Signer, or
  being signed at that moment (that job is abandoned) — with its history;
- every file those jobs left behind: the input, the `processing/<id>/` and `error/<id>/` folders, and the
  signed output;
- every operational event recorded before the clear started, leaving the `JobsCleared` event this call
  writes as the oldest one there is.

Pipeline state, signing profiles, configuration and logs are left intact. The response:

```json
{
  "deleted": 1234,
  "filesDeleted": 2410,
  "foldersDeleted": 57,
  "eventsDeleted": 312,
  "itemsFailed": 0,
  "message": "…"
}
```

`itemsFailed` counts files and folders that were there and could not be removed (a leased file, a
refused folder) — each is named in the server log, and their job records are gone regardless. Files are
swept before rows are touched, so an unreachable storage fails the call before any record is deleted;
a database failure after the sweep rolls the rows back and surfaces as a generic `500` with no specific
`code` — run the clear again. The call also moves the deployment-wide statistics reset marker forward.
See [Clear Jobs](operations.md#clear-jobs).

:::warning Changed in 2.9.0 and 2.10.0 — Clear Jobs takes everything
Until 2.9.0, Clear Jobs deleted only finished jobs, left files and operational events alone, and
answered `{ "deleted", "skipped", "message" }`. It now deletes every job and its files (2.9.0) and the
operational events (2.10.0). **`skipped` is gone**; `filesDeleted`, `foldersDeleted`, `itemsFailed`
and `eventsDeleted` are new. A client that read only `deleted` keeps working.
:::

### Pipeline

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/pipeline/state` | Current `paused / pausedAtUtc / resumedAtUtc / pausedBy / reason` plus live worker capacity. `Actions` rate-limited. |
| `POST` | `/api/pipeline/pause` | Idempotent hold on the worker — a repeat while already paused returns `200`. Survives restart. Optional `reason`. `Actions` rate-limited. A *simultaneous* pause and resume is not a repeat: exactly one wins, and the other is answered `409 pipeline.race-lost` having recorded nothing. |
| `POST` | `/api/pipeline/resume` | Idempotent resume, same rules. `Actions` rate-limited. |

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
      "scanned": 4, "enqueued": 3, "alreadyActive": 0, "ignored": 1, "errors": 0, "alreadyProcessed": 0,
      "enqueuedFiles": ["a.pdf", "b.pdf", "c.xml"],
      "unassigned": false
    },
    {
      "name": "contratos",
      "path": "/srv/contratos",
      "scanned": 0, "enqueued": 0, "alreadyActive": 0, "ignored": 0, "errors": 0, "alreadyProcessed": 0,
      "enqueuedFiles": [],
      "unassigned": true
    }
  ],
  "totals": { "folders": 2, "scanned": 4, "enqueued": 3, "alreadyActive": 0, "ignored": 1, "errors": 0, "unassigned": 1, "alreadyProcessed": 0 }
}
```

- **A folder no signing profile has chosen is skipped whole**: its row carries `unassigned: true` with
  every count at zero, and `totals.unassigned` counts such folders. It is neither an error nor
  `ignored` — nobody has asked to sign from that folder yet — and the call is still a `200`. Choose the
  folder on a signing profile's dashboard page and it is watched without a further rescan.
- `alreadyProcessed` counts files refused as `file.already-processed`: each became a `Failed` job and
  was moved to `error/`.
- Files refused because their profile is disabled are counted as `ignored`.
- `unassigned` and `alreadyProcessed` were added with zero/false defaults, so a reader of the earlier
  shape is unaffected.

An unknown `?folder=<name>` returns `404` with `code = "folder.not-found"` and the configured names
in `detail`. `Cleanup` returns `200 OK` while the retention service is the null stub.

### Approvals

Used only when a signing profile carries an [approval rule](approvals.md).

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/approvals/{id}` | **Anonymous** | Record one approver's decision on a job parked in `AwaitingApproval`. Reaching the frozen quorum returns it to `Queued` and wakes the pipeline; a single rejection cancels the job outright. `Approval` rate-limited. Refuses every call with `403 approval.second-factor-required` while `ApproverSecondFactor:Enabled`, and refuses an *approval* with `403 approval.signature-required` on a job whose frozen signer set includes the approvers. |
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

When an approval was recorded **by signing** — on a profile whose signer set includes the approvers —
the decision carries a `certificate` object: `subject`, `issuer`, `serialNumber`, `thumbprintSha256`,
the certificate's `cpf` (masked like the pool's), the `cnpj` in full on an e-CNPJ, and `cloudService` —
the provider the certificate was reached through when the approver signed in the cloud, `null` for a
signature made in the browser. `certificate` is `null` on a clicked decision and on every decision
recorded before approver signatures existed. See
[Certificates](certificates.md#the-approvers-certificate).

:::danger This is the only anonymous mutating route in the product
Anyone who can reach the URL can approve *or reject* as anyone in the job's frozen pool. The approver's
address must appear in that pool, but nothing verifies that they are that person. **There is no REST
route that approves behind the API key**, and adding one is not a planned improvement — see
[Security](security.md#there-is-no-rest-approve-endpoint).
:::

### Profiles

Two routes, both `GET`, and **no way to write a profile from any of them**. Signing profiles live in
the operational store and are created and edited from the dashboard.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/profiles` | Every signing profile this deployment holds. |
| `GET` | `/api/profiles/{name}` | One profile. The name is matched case-insensitively, exactly as `POST /api/files?profile=` matches it. `404` with `code = "profile.not-found"` for a name nobody has. |

The use case is validating a profile name before uploading a file to it, and seeing which profiles
still accept new work. Both routes read the same registry `POST /api/files` validates against, so a
name reported here is a name an upload will accept.

```bash
curl -s http://localhost:8080/api/profiles -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

```json
{
  "profiles": [
    {
      "name": "folha",
      "enabled": true,
      "inputFolder": "remessas",
      "format": "Cades",
      "method": "Local",
      "certificateSource": "Pkcs11",
      "verify": true,
      "encrypt": true,
      "validateCertificate": true,
      "checkCnab240": true,
      "checkCnab240PaymentDates": true,
      "preserveFileExtension": false,
      "saveAsPem": false,
      "approval": { "required": 2, "poolSize": 3, "expiresAfterSeconds": 172800, "signers": "ProfileKey" }
    }
  ]
}
```

- **A disabled profile is listed, not hidden** — historical jobs name it and already-queued jobs run to
  completion. Read `enabled` before routing new work at a profile: the flag is enforced, and an upload
  or a retry naming a disabled profile answers `409 profile.disabled`.
- **`inputFolder`** is the watched folder the profile feeds from, by its `Storage:Inputs[].Name`, or
  `null` for a profile reached only by uploads naming it. One folder per profile and one profile per
  folder, so a client that drops files into `remessas` can confirm here which profile — which
  certificate and which approval rule — will sign them. `GET /api/folders` has the folder's own state.
- **`checkCnab240PaymentDates`** is whether a remessa whose earliest payment date has passed is refused
  (`true`, the default) or let through for signing (`false`). It only matters beside
  `checkCnab240 = true`.
- **Two nulls carry meaning.** `format: null` says the profile dispatches by file extension (only the
  derived `default` profile does). `certificateSource: null` says there is no local certificate to
  name: the key lives at Lacuna Signer (`method: "LacunaSigner"`), or the profile is **keyless** — its
  `approval.signers` is `Approvers`, so each approver signs with their own certificate and this host
  holds no key. `approval: null` says jobs go straight to the signer.
- **`certificateSource` names the key in force, not the stored row.** A certificate is opened once, at
  startup, so after a profile is edited from one source to another this route goes on reporting the
  old source until the service restarts — the source reported is the one that will sign.

Deliberately absent: the approver pool's members (a pool is named people — `GET /api/jobs/{id}/approvals`
gives a pool scoped to one job, with CPFs masked, and `poolSize` here is a count), a remote signer's
participant, and the certificate's coordinates (file paths, module paths, thumbprints, vault
endpoints). No route writes a profile: an API key that could rewrite who may approve payments would be
a weaker control than the dashboard behind an operator's session.

Possible errors: `profile.not-found`.

### Backup

Three routes, and **no restore** — restoring a backup is an operator procedure, never a route. All three
require the operator policy; the two `POST`s carry the `Actions` budget. Backup is available only
under the SQLite provider; see [Retention](retention.md#the-built-in-backup-feature--sqlite-only).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/backup` | Configuration, the run in flight if any, `lastSuccessAtUtc`, and the newest 50 finished runs. Reports `supported: false` under SQL Server, separately from `enabled`. The destination string never carries a credential. |
| `POST` | `/api/backup` | Start a run now. `202` with the run's id as soon as it is admitted; poll the `GET` for the outcome. |
| `POST` | `/api/backup/cancel` | Ask the run in flight to stop. `202` with the run's id. |

Possible errors: `backup.disabled`, `backup.already-running`, `backup.not-running`, `rate-limited`.

### Events

The operational event log — the host-wide audit trail that pausing and resuming, profile edits,
approval decisions, Clear Jobs and service shutdown write to. Two `GET`s and nothing else: no route
deletes, edits or exports an event. Both require the operator policy (an Entra `Administrator`
included); an approver's session gets `401`. The dashboard shows the same log on its `/events` page.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/events` | One page of events, newest first: `{ items: [{ id, timestamp, eventType, message }], page, pageSize, totalCount }`. |
| `GET` | `/api/events/types` | The distinct event types present in the store — the values to pass as `eventType`. It never offers a type with no rows. |

Query parameters of `GET /api/events`:

| Parameter | Notes |
|-----------|-------|
| `eventType` | Repeat it to include several types; omitted, every type. |
| `from`, `to` | ISO 8601 instants, `from` inclusive and `to` exclusive. A value with no offset is read as UTC. |
| `contains` | A literal substring of the message — `%` and `_` are not wildcards. |
| `page` | Default 1, at most 10,737,418. |
| `pageSize` | Default 50, capped at 200. A page or size below 1 is read as 1. |

Refused with `400 validation.filter-invalid`: a `from` / `to` that does not parse, `from` not earlier
than `to`, a `page` or `pageSize` that is not a whole number, a `page` past the cap, and an `eventType`
given only as blanks.

```bash
# Who paused the pipeline this month, and why
curl -s "http://localhost:8080/api/events?eventType=PipelinePaused&from=2026-09-01T00:00:00Z" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" | jq '.items[] | {timestamp, message}'
```

**Messages are the audit sentences exactly as recorded, in English**, whatever the reader's language.
Dispatch on `eventType`, never on the message; `contains` is a search for a person, not a contract for a
program. Events recorded before the last **Clear Jobs** are gone — the `JobsCleared` event is then the
oldest one there is.

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
| `GET` | `/api/ready` | Anonymous unless `Readiness:RequireApiKey = true` | Readiness **verdict** — `{ ready, checks: [{ name, ok }] }`. `503` if any gating check fails. No `detail` field: an orchestrator reads the status code, whoever watches it reads which `name` went red, and the explanation is on the route below. |
| `GET` | `/api/ready/details` | Authorized | The same report with each check's `detail`, and the same `200` / `503` rule. See [the check families](#readiness-checks) below. |
| `GET` | `/api/folders` | Authorized | Per-folder runtime state: name, absolute path, exists, status (`Initializing` / `Running` / `Stopped` / `Unassigned`), last enqueue time, last error, lifetime processed count, file count (capped at 50), and the signing profile that feeds from the folder as `profileName` with its declared format as `profileFormat` (`auto` for a profile with none) — both `null` while no profile has chosen the folder. Plus a top-level `instance` field naming the instance that answered in cluster mode (`null` on a single instance). |
| `GET` | `/api/metrics` | Authorized when `Metrics:RequireApiKey = true` (default) | Prometheus exposition. |
| `GET` | `/api/whoami` | Authorized | Echoes the authenticated identity (operator + scheme used). |

`/api/health` is always anonymous so external health checkers (load balancers, Docker `HEALTHCHECK`,
Kubernetes `livenessProbe`) need no credentials. `/api/ready` is anonymous by default for the same
reason — the Azure App Service health check cannot carry a credential. Read `checks[].name` and
`checks[].ok` for which check failed, then call `GET /api/ready/details` with the key for why. Turn
`Readiness:RequireApiKey` on where the prober can carry `X-API-Key` (a Kubernetes probe's
`httpHeaders`, a monitoring agent) or where nothing probes the host.

`Unassigned` on `/api/folders` means no signing profile has chosen the folder: nothing is watching it
and files there wait. It is not a fault; the remedy is on a profile's dashboard page. For a moment
after a profile picks a folder, the row can carry a `profileName` while its status still reads
`Unassigned`; the next poll reconciles them.

:::warning Changed in 2.6.0 — `/api/ready` is a verdict only
The anonymous `/api/ready` used to carry a `detail` sentence per check — together, a map of the
deployment (the SQL Server host, every input share, a certificate's location) readable by anyone who
could reach the port. It now carries only `ready`, `name` and `ok`; the `detail` field is absent, not
null. An orchestrator reading the status code is unaffected. A monitor that parsed `detail` moves to
`GET /api/ready/details` and sends the API key. A check's change of verdict is written to the durable
log once per change, so the record of a transient fault is not lost.
:::

#### Readiness checks

The check families, by `name`, as `/api/ready/details` explains them:

- **`database`** — names the store it checked (`reachable (SQLite (data/db/bulksigner.db))`,
  `reachable (SQL Server (sqlsrv01/BulkSigner))`), never the connection string; a red row carries the
  exception's type name. The verdict is taken per request, but also stays red for the life of an
  instance whose boot found the store unreachable and skipped the migration — that clears on the next
  boot.
- **`input-folder:<name>`** — one per configured input folder; any missing or `Stopped` folder fails the
  response. A folder no profile has chosen stays `ok: true`, with a detail saying it is unassigned.
- **`storage-share:<account>/<share>`** and **`work-share-owner`** — on a remote work share only. The
  latter goes red when another instance held the work share's marker at startup, or the claim could
  not be made. Both report what was true **at startup** and say so.
- **`signing-profile:<name>`** — a degraded signing profile. Reports `ok: false` **without** failing the
  response: a `503` would pull the instance out of its load balancer, and the dashboard page that fixes
  the certificate is served by that instance. **Alert on the individual `checks[]` entries**, not only on
  the top-level `ready`.
- **`signing-profile-keyless:<name>`** — a profile whose signer set is `Approvers` and so holds no key.
  `ok: true`, with a detail explaining the state.
- **`profile-input-folder:<profile>`** — a profile bound to an input folder this host has not
  configured. Red, and likewise not gating.

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
| `bulksigner_signer_api_errors_total{op}` | Counter | Lacuna Signer API errors while polling and downloading, labeled by operation (`poll`, `download`). |
| `bulksigner_jobs_parked_for_approval_total{profile}` | Counter | Successful `Processing → AwaitingApproval` transitions. |
| `bulksigner_jobs_awaiting_approval` | Gauge | Live count of `AwaitingApproval` rows. Set from a scan, so it is correct after a restart while jobs are still parked. |
| `bulksigner_approvals_recorded_total{profile}` | Counter | Decisions recorded, one per person per job — approvals **and** rejections. The only metric covering the anonymous approval route as a whole, so it is also how an operator notices that route being used at all. |
| `bulksigner_approvals_rejected_total{profile}` | Counter | The rejection subset; each one vetoes its job. Separate from `bulksigner_jobs_canceled_total`, which counts what an *operator* did. |
| `bulksigner_jobs_released_by_approval_total{profile}` | Counter | Parked jobs whose quorum was met, returning them to `Queued`. |
| `bulksigner_approvals_expired_total{profile}` | Counter | Parked jobs canceled because their frozen wait budget elapsed — the series that counts *nobody* acting, which makes it the one to alert on. Flat at zero unless a profile sets `Approval.ExpiresAfter`. |
| `bulksigner_jobs_content_changed_total{profile}` | Counter | Jobs refused by the pre-sign content-binding guard. **Should be flat at zero forever** — anything else means an artifact changed between being measured and being signed. |
| `bulksigner_inputs_diverged_total{profile}` | Counter | Input files left in place after signing because the file on disk was no longer the copy that was staged. **Not a failure** — the job completed and its output is good. See [Operations](operations.md#when-an-input-file-changes-mid-job). |
| `bulksigner_cnab240_payment_date_checks_skipped_total{profile}` | Counter | CNAB240 remessas whose earliest payment date had passed and which were let through because the profile's `CheckCnab240PaymentDates` (or `CheckCnab240`) is off. Counts decisions, not signatures. Flat at zero on every profile that keeps the guard on. |
| `bulksigner_approver_signatures_total{outcome,means}` | Counter | Approver signature attempts on jobs whose frozen signer set includes the approvers. `outcome` ∈ `signed`, `cpf-mismatch`, `without-cpf`, `certificate-invalid`, `signature-invalid`, `conflict`, `abandoned`, `browser-failed`, `provider-failed`; `means` ∈ `browser`, `cloud` — where the certificate was reached. Flat at zero until a profile's signer set includes the approvers. |
| `bulksigner_second_factor_verifications_total{outcome}` | Counter | Approver second-factor verification attempts, labeled by outcome and never by approver. |
| `bulksigner_second_factor_enrolments_total` | Counter | Authenticator enrolments confirmed. Rises again after an operator resets an approver's factor. |
| `bulksigner_backup_runs_total{result}` | Counter | Database backup runs that finished, labeled `Succeeded` / `Failed` / `Canceled`. |
| `bulksigner_backup_duration_seconds` | Histogram | Wall-clock duration of a backup run that succeeded. |
| `bulksigner_backup_last_size_bytes` | Gauge | Size of the most recent backup artifact this instance stored. |
| `bulksigner_backup_last_success_timestamp_seconds` | Gauge | Unix timestamp of the last backup this process completed; `0` until it completes one. Alert with `bulksigner_backup_last_success_timestamp_seconds > 0 and time() - bulksigner_backup_last_success_timestamp_seconds > 172800`. |
| `bulksigner_backup_prune_failures_total` | Counter | Runs that stored their artifact but failed to delete older ones at the destination. |
| `bulksigner_log_sink_outages_total` | Counter | Azure table log sink outages — incremented once when writes begin failing, not per failed batch. How an operator learns the sink is down. |
| `bulksigner_log_sink_dropped_total` | Counter | Log events dropped because the table sink's queue was full. Non-zero means the log in the table has holes. |

:::warning Changed in 2.7.0 — `bulksigner_approver_signatures_total` gained a `means` label
Adding the label changes the series identity for anyone scraping the counter; a query written against
the `outcome` label alone should aggregate with `sum by (outcome)`.
:::

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
