---
sidebar_label: "Job statistics"
sidebar_position: 8
---

# Job statistics

In-memory, per-stage elapsed-time statistics on the dashboard — what is collected, how each number
is calculated, and how to read them when processing feels slow.

## At a glance

| Question | Answer |
|----------|--------|
| Where do the numbers live? | **Process memory only** — never the database. They reset to zero on every restart, and when an operator runs [Clear Jobs](operations.md#clear-jobs). |
| How do I turn it on or off? | `Statistics:Enabled` (default `true`). When `false`, nothing is collected and the dashboard panel disappears. |
| What is measured? | Four stages per job — **queue wait, signing, verification, output creation** — plus a **total** (their sum). |
| What is *not* measured? | The Lacuna Signer **`AwaitingSigner` wait** (time a human takes to sign). Deliberately excluded — see [below](#why-the-awaiting-signer-wait-is-excluded). |
| Where do I see it? | The **Dashboard** home page, "Processing performance" panel. Refreshes on the normal dashboard poll (`Dashboard:PollIntervalSeconds`). |
| Want durable history? | Scrape `/api/metrics` — `bulksigner_signing_duration_seconds` is the long-term record (see [REST API](rest-api.md)). |

## What is collected

For every job the collector times four stages, measured with a monotonic clock at exact code
boundaries:

| Stage | Starts at | Ends at |
|-------|-----------|---------|
| **Queue wait** | Job enqueued | Worker picks the job up (transition to `Processing`) |
| **Signing** | Local: just before the signature call. Remote: just before document creation (dispatch) **and** just before the signed download (poll) | Immediately after each of those calls returns |
| **Verification** | Just before the signature is verified | Immediately after it returns (skipped jobs contribute no sample) |
| **Output creation** | Encrypt (if enabled) + write to `processing/` | After promote-to-`output/` and delete-original |

**Total = queue wait + signing + verification + output.** This is the active machine time the job
cost end to end. It is **not** the created-to-completed wall clock for a remote job, because that
would include the human-signing wait.

Each stage keeps a running **count, sum, minimum, and maximum**, plus a bounded queue of recent
completion timestamps used for the rolling throughput rate. The **total** is additionally tracked
split by signing method — **Local** vs **Remote (Lacuna Signer)** — so the two never blur together.

## What each dashboard metric means

The "Processing performance" panel shows:

| Metric | Meaning |
|--------|---------|
| **Avg job time** | Mean of the per-job total (active time). |
| **Avg signing** | Mean signing-stage time. For remote jobs this is dispatch + download, *not* the wait between them. |
| **Avg verification** | Mean verification-stage time. Jobs that skip verification (`Verify = false`) are not counted, so this average reflects only jobs that actually verified. |
| **Throughput (last min)** | Completions in the trailing 60 seconds, expressed per minute — a responsive "right now" rate. |
| **Max throughput/sec** | The busiest single wall-clock second since boot — the most job completions ever observed in one second. A high-water mark, so it only climbs (until a restart or Clear Jobs). Useful for sizing: it shows what the deployment achieved at its best, not what it is doing now. |
| **Total processing time — Min / Avg / Max** | The extreme and mean per-job totals, in `hh:mm:ss.fff` form. Min and Max are single-job observations, useful for spotting outliers. |
| **Average by stage — Queue wait / Output** | Mean intake-backlog time and mean output-materialisation time (encryption + promote). |
| **By method — Local (n) / Remote (n)** | Mean total for locally-signed vs Lacuna-Signer jobs, with the sample count in parentheses. |
| **Lifetime** | Completed jobs ÷ uptime, expressed per minute — the long-run average rate since boot. |

The caption shows how many jobs have completed and how long ago the process booted — that is the
window the numbers cover. **Restarting the service clears all of it.**

Durations render in two forms: rounded prose on the stat cards (`2 min 14 sec`, `3.4 sec`, `421 ms`)
and fixed `hh:mm:ss.fff` in the min/avg/max row (`00:00:03.421`). A stage with no samples yet shows
an em dash (`—`).

## How elapsed time is calculated

Timing uses a monotonic clock source, unaffected by wall-clock adjustments (NTP steps, DST), so a
clock change mid-job cannot produce a negative or wildly wrong span. Each measured span wraps exactly
one operation; negative spans from clock edge cases are floored at zero before entering an
accumulator.

A job's partial timings are held in an in-flight entry keyed by job id while it processes. The remote
path spans two workers — one records the dispatch span, the other records the download, verify, and
output spans onto the *same* entry once the document comes back. On successful completion the entry
is folded into the global aggregates; on any failure, cancel, or timeout it is discarded, so a job
that never finishes neither leaks memory nor skews the averages.

### Why the awaiting-signer wait is excluded

A Lacuna Signer document can sit in `AwaitingSigner` for hours or days while a person signs it
(`Signer:TimeoutHours` defaults to a full week). If that wait were folded into "average signing
time", a single slow human would dominate every number and the panel would stop telling you anything
about *system* performance. So the wait between dispatch and download is never timed.

To see how long documents are parked awaiting signature, use the `AwaitingSigner` count on the
dashboard, the per-job `AwaitingSignerSince` timestamp, or the `bulksigner_jobs_awaiting_signer`
metric — see [Lacuna Signer integration](lacuna-signer.md).

## Using the statistics to diagnose slow processing

Read the stage split to localise a slowdown:

| Symptom | Likely cause | Where to look next |
|---------|--------------|--------------------|
| **Queue wait** high, everything else normal | Backlog — files arrive faster than the worker drains them | Raise `Pipeline:MaxConcurrency` (mind the PKCS#11 / Windows-store caveat in [Configuration](configuration.md)); check the Queued count |
| **Signing** high on **Local** jobs | Slow certificate source — HSM/PKCS#11 round-trips, a contended token at `MaxConcurrency > 1`, or Key Vault latency | [Certificates](certificates.md); consider keeping token-backed profiles at `MaxConcurrency = 1` |
| **Signing** high on **Remote** jobs | Slow Lacuna Signer API (create/download), not the human wait | `bulksigner_signer_api_errors_total`, network to the Signer endpoint; [Lacuna Signer integration](lacuna-signer.md) |
| **Verification** high | Large artifacts or slow revocation/chain checks during verify | Profile `Verify` settings; artifact sizes |
| **Output** high | Encryption cost or slow `output/` storage (network share, slow disk) | [Encryption](encryption.md); the `output/` volume |
| **Max** ≫ **Avg** | A few outliers (large files, a transient stall) | Sort recent jobs by size; check logs around the spike |
| **Throughput (last min)** ≪ **Lifetime** | A current stall or pause | Pipeline pause state; the live "In progress" / "Slots busy" card |

Because the numbers are in memory and reset on restart, treat them as a **live** signal. For trend
analysis across restarts, scrape the Prometheus endpoint into Grafana — the
`bulksigner_signing_duration_seconds` histogram is the durable counterpart.

The aggregates are also reset when an operator runs [Clear Jobs](operations.md#clear-jobs): clearing
the job table empties the in-memory aggregates and re-anchors the "since" marker to that moment, so
the panel returns to zero alongside the now-empty Jobs table. The Prometheus histogram is a
monotonic counter and is **not** reset by Clear Jobs.

## Configuration

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Statistics:Enabled` | bool | `true` | `Statistics__Enabled` | Master switch. `false` makes the collector a no-op and hides the dashboard panel. |

---

**Next:** [Telemetry](telemetry.md) — optional Application Insights integration.
**Previous:** [Dashboard](dashboard.md).
