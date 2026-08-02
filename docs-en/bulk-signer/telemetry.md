---
sidebar_label: "Telemetry"
sidebar_position: 9
---

# Application Insights telemetry

Optional Azure Application Insights telemetry over the signing pipeline — how to enable it, what is
collected, what is intentionally excluded, and the KQL queries to find bottlenecks.

:::note
Telemetry is **off by default**. With it disabled the service has no Application Insights dependency
and makes no outbound connections on its behalf. Everything on this page describes an opt-in feature.
:::

## At a glance

| Question | Answer |
|----------|--------|
| How do I turn it on? | Set `Telemetry:Enabled = true` **and** supply a connection string (`Telemetry:ConnectionString` or the `APPLICATIONINSIGHTS_CONNECTION_STRING` env var). |
| Default state? | **Off.** |
| What is the SDK? | The **Azure Monitor OpenTelemetry distro** — standard OpenTelemetry activities and meters, not the classic Application Insights SDK. |
| What is collected? | A correlated per-job trace, the lifecycle steps as span events, PKI SDK calls as dependencies, signing and total-processing duration metrics, and processing exceptions. |
| What is excluded? | Logs (structured logs are not forwarded), secrets (scrubbed), file contents, certificate material, and the Lacuna Signer remote path. |
| Which Application Insights tables? | Spans → `dependencies`; metrics → `customMetrics`; exceptions → `exceptions`; auto-collected web requests → `requests`. There is **no `customEvents`** — see [below](#why-no-customevents). |

Scope note: this covers **local signing**. The Lacuna Signer remote flow is only partially traced —
see [What is intentionally excluded](#what-is-intentionally-excluded).

## Enabling Application Insights

### 1. Create the resource and copy the connection string

Create an Application Insights resource in the Azure portal and copy its **connection string**
(Overview blade → *Connection String*). It looks like:

```
InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://<region>.in.applicationinsights.azure.com/;LiveEndpoint=https://<region>.livediagnostics.monitor.azure.com/
```

### 2. Configure Bulk Signer

The connection string carries the instrumentation key and is treated as a **secret** — never commit
it. Prefer the environment variable.

**Option A — environment variable (recommended):**

```bash
# Linux / Docker
export Telemetry__Enabled=true
export APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=https://.../"
```

```powershell
# Windows
[Environment]::SetEnvironmentVariable("Telemetry__Enabled", "true", "Machine")
[Environment]::SetEnvironmentVariable("APPLICATIONINSIGHTS_CONNECTION_STRING", "InstrumentationKey=...;IngestionEndpoint=https://.../", "Machine")
```

**Option B — operator config file** (e.g. `appsettings.Production.json`):

```json
{
  "Telemetry": {
    "Enabled": true,
    "ConnectionString": "InstrumentationKey=...;IngestionEndpoint=https://.../",
    "RoleName": "Lacuna.BulkSigner"
  }
}
```

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Telemetry:Enabled` | bool | `false` | `Telemetry__Enabled` | Master switch. When `true`, a connection string is **required** — the service refuses to start otherwise. |
| `Telemetry:ConnectionString` | string | `""` | `Telemetry__ConnectionString` | **SECRET.** Leave empty to use the standard env var below instead. |
| _(standard env var)_ | string | _(unset)_ | `APPLICATIONINSIGHTS_CONNECTION_STRING` | Read by the distro directly and honoured by the startup validator. Use this to keep the secret out of config files. |
| `Telemetry:RoleName` | string | `Lacuna.BulkSigner` | `Telemetry__RoleName` | Reported as `cloud_RoleName` so multiple services on one resource stay distinguishable. |

### 3. Restart and verify

Restart the service. Within a minute or two of processing a job you should see entries in the
Application Insights resource: a `dependencies` row named `signing.job` per job, child `Lacuna.Pki …`
dependencies, and `customMetrics` rows for `bulksigner.signing.duration` and
`bulksigner.job.duration`.

## What is collected

### Traces — per-job span plus lifecycle events

Each job opens a root span (`signing.job`, kind `Internal`, surfacing in Application Insights as
`dependencies`) at pickup, tagged with `job.id`, `signing.profile`, `signing.method`, and
`signing.format`. Every step below is recorded as a **span event** on that span, so all of them share
its `operation_Id` for correlation:

| Event | When |
|-------|------|
| `JobCreated` | At enqueue (a standalone `signing.job.created` trace — the worker span does not exist yet) |
| `JobPickedForProcessing` | Worker claims the job |
| `SigningStarted` / `SigningCompleted` | Around the local sign call |
| `VerificationStarted` / `VerificationCompleted` | Around the verify call (only when the profile has `Verify = true`) |
| `OutputFileCreated` | Signed artifact promoted to `output/` |
| `JobCompleted` | Terminal success (span status `Ok`) |
| `JobFailed` | Terminal failure (span status `Error`) |
| `JobCanceled` | Operator cancel (a standalone `signing.job.canceled` trace) |
| `DispatchedToSigner` | Lacuna Signer job handed off (remote path — partial coverage) |

### Dependencies — PKI SDK calls

The Lacuna PKI SDK sign and verify calls are wrapped in `Client`-kind child spans named
`Lacuna.Pki SignAsync` and `Lacuna.Pki VerifyAsync`, surfacing as `dependencies`. Each carries its own
duration and a success flag; a failed call is marked `Error` with a scrubbed message, so broken
external calls are visible with troubleshooting context.

### Metrics — `customMetrics`

| Metric | Unit | Dimensions |
|--------|------|------------|
| `bulksigner.signing.duration` | ms | `signing.method`, `signing.profile`, `signing.format`, `job.status` (`Success` / `Failed`) |
| `bulksigner.job.duration` | ms | `job.status` (`Success` / `Failed`), `signing.profile`, `signing.method` |

`bulksigner.signing.duration` is the elapsed time of the signing operation itself;
`bulksigner.job.duration` is the total from job creation to terminal state.

### Exceptions — `exceptions`

Handled and unhandled processing exceptions are recorded on the job span with the job id, profile,
signing method, and the **processing step** where the error occurred. Messages and stack traces are
scrubbed before they leave the process.

## What is intentionally excluded

- **Secrets.** The PKI license, certificate and PFX passwords, PKCS#11 PIN, Azure Key Vault client
  secret, API keys, encryption password, and connection strings are scrubbed from every value
  attached to telemetry — including exception messages and stack traces. See
  [Security](security.md#log-redaction--two-layers).
- **File contents and certificate material.** Never attached to any span, event, or metric.
- **Application logs.** Structured logs are **not** forwarded to Application Insights. Only spans,
  metrics, and explicitly recorded exceptions are sent; logs remain in the file and console sinks.
- **Job id as a metric dimension.** Kept off the histograms to bound cardinality; per-job timing
  lives on the correlated spans instead.
- **The Lacuna Signer remote path.** Coverage is local-signing-first. A remote job emits only a
  pickup-to-dispatch span; the awaiting-signer wait and remote completion are not traced.

## Example queries (KQL)

Run these in the Application Insights resource (*Logs* blade). Adjust the time range as needed.

**Average signing time (local), last 24h:**

```kusto
customMetrics
| where name == "bulksigner.signing.duration"
| where timestamp > ago(24h)
| summarize avg(value), percentiles(value, 50, 95) by tostring(customDimensions["signing.profile"])
```

**Slowest signing jobs:**

```kusto
dependencies
| where name == "signing.job"
| where timestamp > ago(24h)
| project timestamp, jobId = tostring(customDimensions["job.id"]),
          profile = tostring(customDimensions["signing.profile"]), duration, success
| top 20 by duration desc
```

**Signing failures by signing method:**

```kusto
customMetrics
| where name == "bulksigner.signing.duration"
| where tostring(customDimensions["job.status"]) == "Failed"
| summarize failures = count() by method = tostring(customDimensions["signing.method"])
```

**Average total processing time:**

```kusto
customMetrics
| where name == "bulksigner.job.duration"
| where tostring(customDimensions["job.status"]) == "Success"
| summarize avg(value), percentiles(value, 50, 95)
```

**Failed PKI SDK calls (troubleshooting external calls):**

```kusto
dependencies
| where name startswith "Lacuna.Pki"
| where success == false
| project timestamp, name, jobId = tostring(customDimensions["job.id"]),
          operation = tostring(customDimensions["pki.operation"]), resultCode
| order by timestamp desc
```

**Processing exceptions by step:**

```kusto
exceptions
| where timestamp > ago(24h)
| summarize count() by step = tostring(customDimensions["processing.step"]), type
| order by count_ desc
```

## Why no `customEvents`

Bulk Signer uses the **Azure Monitor OpenTelemetry distro**, which has no `TrackEvent` equivalent —
OpenTelemetry has no "custom event" primitive. The lifecycle steps are therefore modelled as **span
events** on the per-job span and queried via the `dependencies` table and its `customDimensions`, not
via `customEvents`. Queries written against a classic-SDK application will need adapting.

## Related

- [Job statistics](statistics.md) — the in-memory dashboard statistics, a separate always-local surface.
- [REST API](rest-api.md) — the Prometheus `/api/metrics` endpoint, the durable scrape-based record.
- [Configuration](configuration.md) — every configuration key.
- [Security](security.md) — secret handling and the two-layer log redaction.

---

**Next:** [REST API](rest-api.md) — endpoints, auth, and the error envelope.
**Previous:** [Job statistics](statistics.md).
