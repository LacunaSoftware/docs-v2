---
sidebar_label: "Job statistics"
sidebar_position: 8
---

# Job statistics

Per-stage elapsed-time statistics on the dashboard — what is collected, how each number is calculated,
and how to read them when processing feels slow.

## At a glance

| Question | Answer |
|----------|--------|
| Where do the numbers live? | **The operational store** — one row per completed job. They survive restarts, and in a cluster every instance shows the same deployment-wide figures. |
| How do I turn it on or off? | `Statistics:Enabled` (default `true`). When `false`, nothing is recorded and the dashboard panel disappears. |
| What is measured? | Four stages per job — **queue wait, signing, verification, output creation** — plus a **total** (their sum). |
| What is *not* measured? | The two human waits: the Lacuna Signer **`AwaitingSigner` wait** and the **`AwaitingApproval` wait**. Both are deliberately excluded — see [below](#why-the-human-waits-are-excluded). |
| Where do I see it? | The **Dashboard** home page, "Processing performance" panel. Refreshes on the normal dashboard poll (`Dashboard:PollIntervalSeconds`). |
| How do I clear it? | [Clear Jobs](operations.md#clear-jobs) moves a deployment-wide **reset marker**. Nothing is deleted — see [Resetting the panel](#resetting-the-panel). |
| Want durable history *outside* the product? | Scrape `/api/metrics` — `bulksigner_signing_duration_seconds` is the external record (see [REST API](rest-api.md)). |

:::note Changed in 2.0.0
The numbers used to live in process memory and reset on every restart. They are now rows in the
operational store, which is what makes the panel survive a restart and describe a whole cluster rather
than whichever instance answered. One card was retired in the move — see
["Max throughput/sec" is gone](#max-throughputsec-is-gone).
:::

## What is collected

For every job the pipeline times four stages, measured with a monotonic clock at exact code boundaries:

| Stage | Starts at | Ends at |
|-------|-----------|---------|
| **Queue wait** | Job entered the queue (`QueuedAt`) | Worker picks the job up (transition to `Processing`) |
| **Signing** | Local: just before the signature call. Remote: just before document creation (dispatch) **and** just before the signed download (poll) | Immediately after each of those calls returns |
| **Verification** | Just before the signature is verified | Immediately after it returns (skipped jobs contribute no sample) |
| **Output creation** | Encrypt (if enabled) + write to `processing/` | After promote-to-`output/` and delete-original |

**Total = queue wait + signing + verification + output.** This is the active machine time the job cost
end to end. It is **not** the created-to-completed wall clock for a remote job, because that would
include the human-signing wait.

When the job reaches `Completed`, those four durations are written to the store as one row, alongside
the completion timestamp and whether the job was signed **Local** or **Remote (Lacuna Signer)**. Every
figure on the panel is an aggregate over those rows.

A stage that did not happen is stored as **null**, never as zero: a job whose profile sets
`Verify = false` has no verification sample, so it neither drags that stage's average down nor inflates
its count. The total still sums the stages that did happen.

## Where the numbers live, and what that buys

One row per **completed** job, in the same database as the jobs themselves, cascaded away with its job.
Three consequences worth knowing:

- **They survive a restart.** There is no "since boot" window any more. The caption says how many jobs
  have completed and since when, where "since when" is the last reset if there has been one and
  otherwise the oldest completion still on record.
- **Every instance shows the same numbers.** Under [cluster mode](azure.md) the dashboard you reach is
  whichever instance the load balancer picked, and the panel describes the whole deployment rather than
  that instance's share of it.
- **They grow with completed jobs and nothing else.** A handful of numeric columns per job, bounded by
  a job count the store already carries.

**A job in flight is still measured in process memory** and only becomes a row when it completes. So a
host killed mid-job loses that job's partial timings: the job records **nothing** rather than something
wrong, and every job that finished before the restart is unaffected.

## What each dashboard metric means

The "Processing performance" panel shows:

| Metric | Meaning |
|--------|---------|
| **Avg job time** | Mean of the per-job total (active time). |
| **Avg signing** | Mean signing-stage time. For remote jobs this is dispatch + download, *not* the wait between them. |
| **Avg verification** | Mean verification-stage time. Jobs that skip verification (`Verify = false`) are not counted, so this average reflects only jobs that actually verified. |
| **Throughput (last min)** | Completions in the trailing 60 seconds, expressed per minute — a responsive "right now" rate. |
| **Total processing time — Min / Avg / Max** | The extreme and mean per-job totals, in `hh:mm:ss.fff` form. Min and Max are single-job observations, useful for spotting outliers. |
| **Average by stage — Queue wait / Output** | Mean intake-backlog time and mean output-materialisation time (encryption + promote). |
| **By method — Local (n) / Remote (n)** | Mean total for locally-signed vs Lacuna-Signer jobs, with the sample count in parentheses. |
| **Lifetime** | Completed jobs ÷ the window the rows cover, expressed per minute. |

The caption shows how many jobs have completed and the start of that window.

Durations render in two forms: rounded prose on the stat cards (`2 min 14 sec`, `3.4 sec`, `421 ms`) and
fixed `hh:mm:ss.fff` in the min/avg/max row (`00:00:03.421`). A stage with no samples yet shows an em
dash (`—`). Durations are stored to the millisecond, which is exactly the finest resolution either
rendering shows.

### "Max throughput/sec" is gone

There used to be a card showing the busiest single wall-clock second observed. It measured one process's
lifetime, so under a cluster it would have described one instance's luck, and there is no honest way to
reconstruct a deployment-wide equivalent from completion timestamps. It was **retired rather than
approximated**. "Throughput (last min)" answers the question it was mostly being read for, and
`bulksigner_signing_duration_seconds` on `/api/metrics` is unchanged and still the external record.

## How elapsed time is calculated

Timing uses a monotonic clock source, unaffected by wall-clock adjustments (NTP steps, DST), so a clock
change mid-job cannot produce a negative or wildly wrong span. Each measured span wraps exactly one
operation; negative spans from clock edge cases are floored at zero before they are stored.

A job's partial timings are held in an in-flight entry keyed by job id while it processes. The remote
path spans two workers — one records the dispatch span, the other records the download, verify and
output spans onto the *same* entry once the document comes back, **on the same instance**, because a job
is owned by one instance from pickup to terminal status. On successful completion the entry becomes a
row; on any failure, cancel or timeout it is discarded, so a job that never finishes neither leaks
memory nor skews the averages.

### Why the human waits are excluded

A Lacuna Signer document can sit in `AwaitingSigner` for hours or days while a person signs it
(`Signer:TimeoutHours` defaults to a full week). If that wait were folded into "average signing time", a
single slow human would dominate every number and the panel would stop telling you anything about
*system* performance. So the wait between dispatch and download is never timed. To see how long
documents are parked awaiting signature, use the `AwaitingSigner` count on the dashboard, the per-job
`AwaitingSignerSince` timestamp, or the `bulksigner_jobs_awaiting_signer` metric — see
[Lacuna Signer integration](lacuna-signer.md).

The **`AwaitingApproval` wait** is excluded for the same reason, and more bluntly: parking discards the
job's in-flight entry outright, so a parked job contributes nothing at all. To see how long jobs have
been parked, use the "Awaiting approval" card and the per-row wait duration on `/jobs`, the per-job
`AwaitingApprovalSince` timestamp, or the `bulksigner_jobs_awaiting_approval` metric — see
[Approvals](approvals.md).

**A released job is measured from the release, not from when the file arrived.** Once the quorum is met
the job re-enters the queue and is picked up fresh, opening a *second* timing entry — and that entry's
queue wait is anchored on `QueuedAt`, which the release re-stamps. Without that anchor the second pickup
would measure from `CreatedAt` and quietly re-import the whole approval wait the exclusion above exists
to keep out. So a job that waited two days for a quorum and then signed in 400 ms contributes a 400 ms
job, which is the honest reading of what the pipeline did.

## Resetting the panel

Running [Clear Jobs](operations.md#clear-jobs) records a **deployment-wide reset marker**: from then on
the aggregates count only jobs that completed after it. It takes effect on every instance at once,
because the marker is a row rather than a variable in one process.

Three things follow, and the second one is the point:

- **Nothing is deleted to clear the panel.** The rows a reset hides are still stored and still queryable.
  What *does* remove a row is the job going — a deleted job takes its timings with it, through the
  foreign key.
- **A job the clear left alone keeps its measurement.** Clear Jobs deletes only jobs the pipeline has
  finished with; an unfinished one survives, and when it later completes its row lands after the marker
  and counts.
- **The reset rolls back with the clear.** The marker moves inside the clear's transaction, so a clear
  that fails leaves the panel exactly as it was.

The Prometheus histogram is a monotonic counter and is **not** affected by any of this.

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

Because the rows persist, the panel is now a trend signal as well as a live one — the window it covers is
however long you have been keeping completed jobs. For analysis outside the product, scrape the
Prometheus endpoint into Grafana; the `bulksigner_signing_duration_seconds` histogram is the durable
counterpart, and it is unaffected by resets.

:::note In a cluster, read the panel and `/api/metrics` differently
The panel is deployment-wide because it aggregates rows. `/api/metrics` is **per process** and a scrape
reaches an arbitrary instance, so a per-instance gauge read as a fleet total under-reports — see
[High availability](high-availability.md#metrics-scraping-reaches-an-arbitrary-instance).
:::

## Configuration

| Key | Type | Default | Env override | Notes |
|-----|------|---------|--------------|-------|
| `Statistics:Enabled` | bool | `true` | `Statistics__Enabled` | Master switch. `false` makes the collector a no-op, writes no row, and hides the dashboard panel. Turning it off does not delete rows already recorded — turning it back on shows them again. |

---

**Next:** [Telemetry](telemetry.md) — optional Application Insights integration.
**Previous:** [Dashboard](dashboard.md).
