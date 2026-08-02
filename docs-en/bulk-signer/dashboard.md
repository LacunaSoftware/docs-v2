---
sidebar_label: "Dashboard"
sidebar_position: 7
---

# Dashboard

The operator dashboard is a web application served at the root path. It reads the same database the
REST API reads and triggers the same actions — there is one set of business rules behind two
surfaces, so a fix or change lands in both at once.

```
http://<host>:8080/
```

Sign in once with the configured `Auth:ApiKey`; the login page exchanges it for a `SameSite=Strict`
session cookie.

## Common chrome

Every page has a top app bar and a left navigation drawer:

| Element | What it does |
|---------|--------------|
| App bar (top) | Theme toggle (light / dark) and an account menu with Logout. |
| Drawer (left) | The nav links: Dashboard, Jobs, Input folder, Recent exceptions, System. (The Recent exceptions link is hidden when `LogViewer:Enabled = false`.) |
| Refresh indicator | A small widget showing the last refresh time and the active polling cadence. |

Live pages refresh on a server-side timer driven by `Dashboard:PollIntervalSeconds` (default 5). The
Job detail page stops polling once the job reaches a terminal state — there is no point refreshing a
`Completed` or `Failed` row.

## `/` — Dashboard

Landing page. Stat cards and the last few jobs:

| Card | Value |
|------|-------|
| Queued | Count of jobs in `Queued` |
| In flight / Slots busy | When `Pipeline:MaxConcurrency = 1`: count of jobs in `Processing` + `Verifying`. When `MaxConcurrency > 1`: rendered as `N / M slots busy`. |
| Completed (24 h) | Jobs whose terminal transition was in the last 24 h |
| Failed (24 h) | Jobs that failed in the last 24 h |
| Canceled (24 h) | Operator-canceled jobs in the last 24 h |
| Encrypted output (24 h) | Subset of completed jobs whose output was encrypted |
| Pipeline state | "Running" or "Paused" (clickable, opens the System page) |

When `Pipeline:MaxConcurrency > 1`, a small **In flight by format** panel breaks the in-flight count
down by `Pades` / `Cades` / `Xades`. In sequential mode (the default) the panel is hidden.

### Processing performance panel

Below the stat cards sits a **Processing performance** panel with per-stage elapsed-time statistics —
average job time, average signing and verification time, rolling and peak throughput, min/avg/max
totals, a per-stage breakdown, and a Local vs Remote split. The numbers are held in process memory
and reset on restart.

Hidden entirely when `Statistics:Enabled = false`. Full reading guide, including how to use the stage
split to localise a slowdown: [Job statistics](statistics.md).

Below that: a throughput chart for the last 24 hours and a table of the last few jobs. This page is a
read-only overview — for actions, go to Jobs.

## `/jobs` — Jobs

A filterable, paged table of every job:

| Filter | Type |
|--------|------|
| Status | Multi-select from `Queued / Processing / Verifying / Completed / Failed / Canceled` |
| Profile | Drop-down of every profile name declared in `Signing:Profiles[]`, or just `default` in legacy mode. |
| Format | Multi-select from `Pades / Cades / Xades` |
| File name | Free text (contains-match) |
| Created date range | Two-date picker |

Columns include a status badge, format, the resolved profile name, source (Watcher / Upload / Retry),
created time, and a row click that navigates to the job detail page.

## `/jobs/{id}` — Job detail

Header card with file name, status badge, format, source, created/updated, parent job link (if this
job is a retry), and error message (if `Failed`).

- **Encrypted-output chip** — visible only when the job was signed with encryption enabled. Tells
  operators that downloading will yield a `.enc` envelope, not a cleartext signed artifact.
- **Profile section** — the resolved signing profile: name, declared format (or `auto` for the
  synthesised legacy default), cert source, and the `Verify` / `Encrypt` / `Validate certificate`
  posture flags. If the job's profile name was removed from config after the job ran, a warning is
  shown — the job stays viewable but a retry would fail until the profile is restored.
- **Timeline** — every history entry in chronological order, one row per state transition, each with
  the timestamp, status badge, and message text.

Action buttons (visibility gated by status):

| Button | Visible when status is… | What it does |
|--------|-------------------------|--------------|
| Retry | `Failed` | Creates a new job with `ParentJobId = this.Id`; navigates to the new job. |
| Cancel | `Queued` (or `AwaitingSigner`) | Moves the job to `Canceled`; the watcher will not auto-resurrect the file. |
| Download | `Completed` (or `Failed` with output) | Streams the output. `application/octet-stream` with a `.enc` filename when encrypted. |

Each result renders as a toast — success, warning (e.g. `job.not-queued`), or error.

## `/input` — Input folders

Operational view of every configured `Storage:Inputs[]` folder, one card per folder, plus a global
`Rescan all` button. Each card shows:

| Element | Value |
|---------|-------|
| Folder name chip | The `Name` from `Storage:Inputs[]`. |
| Status chip | `running` (green) / `initializing` (amber) / `stopped` (red) / `folder missing` (red). |
| Profile chips | The resolved profile name and its declared signature format (or `auto` for the legacy default). |
| Watched path | The **absolute** path on disk. |
| File count | Number of files awaiting pickup (capped at 50; shown as `50+` past the cap). |
| Lifetime processed | Every candidate the watcher has handled since process start, regardless of outcome. |
| Last error alert | Shown only when `Status = stopped`. |
| `Rescan this folder` button | Re-enqueues only this folder. |

`Rescan all` (top of page) re-enqueues every folder. The toast reports per-folder totals when more
than one folder is configured.

:::warning
**Stopped watchers do not auto-revive.** When the per-folder consecutive-enqueue-failure threshold
trips, that folder's watcher exits while the rest of the service keeps running. Fix the underlying
cause (mount, disk, permissions) and restart the service to bring the watcher back up.
:::

## `/system` — System

Read-only service info:

| Field | Source |
|-------|--------|
| Build version | Assembly version |
| Host mode | Windows Service / systemd / console / docker |
| Environment | `ASPNETCORE_ENVIRONMENT` |
| Storage root | `Storage:Root` |
| Pipeline | Running / Paused; click to navigate to the Pause/Resume action |
| License fingerprint | SHA-256 of the loaded license, first 16 hex chars |
| Certificate source | `Signing:Certificate:Source` + the relevant subtree field |
| Signature policy | ADR-Básica (default; see [Certificates](certificates.md)) |
| Encryption | Enabled / Disabled |
| Queue length | Snapshot of `Queued` count |

Pipeline pause/resume buttons are here, gated by the current state. The optional `reason` field lands
in the audit trail.

The `Cleanup` button is currently a no-op while the retention story is finalized. See
[Retention](retention.md).

### Danger zone — Clear Jobs

Permanently deletes **every job record** — the Jobs table and its history timelines. A confirmation
dialog gates the action and spells out that it is irreversible, that only job records are affected,
and that files already staged in `processing/` for in-flight jobs may be left orphaned. Cancelling or
dismissing the dialog deletes nothing.

On confirm it records a `JobsCleared` audit event (actor + count), resets the in-memory
[statistics](statistics.md) aggregates, and refreshes the page.

Untouched by Clear Jobs: operational events, pipeline state, profiles, configuration, signed output
files, and log files. The Prometheus counters at `/api/metrics` are also unaffected — they are
monotonic.

:::warning
There is no undo and no export step. If you need the job history for an audit, back up
`db/bulksigner.db` first.
:::

See [Operations](operations.md#clear-jobs).

## `/logs` — Recent exceptions

A read-only viewer over the most recent error-level log entries, held in a bounded in-memory buffer.
It is **not** a query over the log files on disk — the buffer is cleared on restart, so use the file
sink for anything historical.

| Aspect | Behaviour |
|--------|-----------|
| Source | In-memory bounded FIFO buffer fed by the logging pipeline. Cleared on restart. |
| Entries | Newest first, capped at `LogViewer:MaxEntries` (default 20). Only levels listed in `LogViewer:Levels` (default `Error`, `Fatal`) are captured. |
| Per entry | Collapsed: level chip, message, timestamp, source context, exception type. Expanded: full message, exception type and message, and the stack trace in a scrollable monospace block. |
| Refresh | Auto-refresh on `LogViewer:RefreshIntervalSeconds` (default 5), plus a manual refresh button. |
| Redaction | Every text field is scrubbed as the entry is captured, so secrets do not surface on the page. See [Security](security.md#log-redaction--two-layers). |
| Disabled | When `LogViewer:Enabled = false` the nav link is hidden and the page renders a disabled notice. |

:::note
The global file-sink minimum level applies **first**. Widening `LogViewer:Levels` below that minimum
(for example adding `Debug` while the minimum is `Information`) captures nothing, because those events
never reach the sink.
:::

## Audit-trail conventions

Every action records:

| Action | Where it lands |
|--------|----------------|
| Pause / resume | A system event + the pause reason |
| Cancel | A history entry on the canceled job |
| Retry | A history entry on the parent + an initial history entry on the child |
| Rescan | A system event summarizing the result |
| Clear Jobs | A `JobsCleared` system event recording the actor and how many records were deleted |

Messages follow consistent formats, e.g. `"Pipeline paused by operator. Reason: Quarterly
maintenance."` and `"Operator canceled: still investigating."`.

## Theme

The dashboard uses the Lacuna Software brand palette — navy (`#000F29`) plus accent orange
(`#F15A31`). Operators can toggle light / dark mode via the app bar; the choice persists for the
session.

## Console Dashboard (foreground runs only)

When the service runs as a foreground console process on an interactive terminal, a live status panel
replaces the streaming log. Operators get one always-current snapshot — paused state, queue length,
in-flight count + per-format breakdown, completed/failed/canceled totals since boot, uptime, and the
listening address — refreshed on the same `Dashboard:PollIntervalSeconds` tick the web dashboard
uses.

**Activation predicate** (all three must hold):

| Condition | |
|-----------|--|
| `Console:Dashboard:Enabled = true` | default `true` |
| Host is not a Windows Service / systemd unit | detected automatically |
| stdout is an interactive terminal | not redirected to a file or pipe |

When the predicate is false (any service host, or output redirected, or `Enabled = false`), the
service keeps streaming structured log events to stdout instead.

- **Boot output is unaffected.** The banner and the `Service ready` summary print before the live
  region starts; they remain visible at the top of the terminal buffer.
- **Forensic detail still lives in the file sink.** The live panel omits per-job detail (file names,
  error messages) to stay legible. Tail the log file for the durable record.
- **Opt-out.** Set `Console:Dashboard:Enabled = false` to keep the streaming log view in foreground
  runs.
- **Terminal requirements.** Any modern terminal works (Windows Terminal, Alacritty, iTerm2,
  gnome-terminal, macOS Terminal). Legacy `conhost.exe` and some restricted SSH clients fall back to
  scrolling output.

## Behind a reverse proxy

The dashboard uses a real-time server connection (WebSockets). If you put it behind a reverse proxy,
ensure WebSockets are proxied (most proxies enable them by default; check that `Upgrade: websocket`
survives). Also forward the `Set-Cookie` and `Cookie` headers unmodified, and set
`X-Forwarded-Proto: https` when terminating TLS at the proxy so the session cookie is marked
`Secure`.

---

**Next:** [Job statistics](statistics.md) — reading the performance panel. **Previous:** [Operations](operations.md).
