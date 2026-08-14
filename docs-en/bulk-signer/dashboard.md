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
| App bar (top) | Language selector (globe icon, see below), theme toggle (light / dark) and an account menu with Logout. |
| Drawer (left) | The nav links: Dashboard, Jobs, Input folder, Recent exceptions, System. (The Recent exceptions link is hidden when `LogViewer:Enabled = false`.) |
| Refresh indicator | A small widget showing the last refresh time and the active polling cadence. |

Live pages refresh on a server-side timer driven by `Dashboard:PollIntervalSeconds` (default 5). The
Job detail page stops polling once the job reaches a terminal state — there is no point refreshing a
`Completed` or `Failed` row.

### Display language

The web surfaces render in **American English or Brazilian Portuguese**, chosen per browser via the
language selector — in the app bar on the operator pages, pinned top-right on the bare-layout pages
(`/login`, the approver surfaces). The choice is stored in the standard ASP.NET Core culture cookie for
a year; switching is a full page reload. Resolution order is **cookie → the browser's `Accept-Language`
→ `en-US`**, so a Brazilian browser gets Portuguese on first visit with no interaction.

There is no configuration knob — the reader chooses, the server does not.

What the language deliberately does **not** change: audit-trail sentences on the job timeline (evidence
stays English, exactly as written), REST wire values (`JobStatus` names, problem `code`s and prose),
durable logs, the console dashboard, and everything CNAB240 — `R$` amounts, `dd/MM/yyyy` payment dates
and the remessa vocabulary are properties of the file, not of the reader.

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
- **Payment file section** — present only on jobs parsed as a [CNAB240 remessa](cnab240.md). Shows the
  file's total in BRL, the payment count, the cancellation count, the payment-date range, and the
  SHA-256 of the parsed bytes. Cancellations render as an amber chip only when there are any.
- **Payments panel** — on payment-file jobs only: a paginated table of every value-bearing record
  (record number, lote, segment, name, beneficiary CPF/CNPJ, branch and account, payment date,
  amount), with exclusão rows labelled and struck through. **Nothing is masked for an operator** — an
  operator chasing a payment BB rejected needs the digits BB is complaining about. Present only while
  the job is in flight; the panel explains itself once the job is terminal and the line detail has been
  [purged](retention.md#the-one-exception-cnab240-line-detail).
- **Approval section** — present only on jobs that parked, and it survives the job going terminal
  (neither the snapshot nor the approval rows are purged). Shows the frozen quorum as an "N of M
  required" chip, how many approvals are in, when the job parked, the frozen wait budget, and the
  approver pool — name, email and CPF — **as it stood at park time**, each row carrying that person's
  decision, its reason, and when they made it. Editing the profile's `Approval` block does **not**
  change what is shown here; that is the whole point of the snapshot. A rejected job reads
  *"2 of 2 approvals — rejected"*, with a banner above the pool saying why the job is `Canceled`. While
  the job is parked, the section also renders the **approval link** in a read-only field to copy, with
  the capability warning directly above it.
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
| Cancel | `Queued`, `AwaitingSigner`, `AwaitingApproval` | Moves the job to `Canceled`; the watcher will not auto-resurrect the file. From `AwaitingApproval` it also relocates the staged copy to `error/<jobid>/`. |
| Download | `Completed` (or `Failed` with output) | Streams the output. `application/octet-stream` with a `.enc` filename when encrypted. |

Each result renders as a toast — success, warning (e.g. `job.not-queued`), or error.

:::note This is the one page an approver may open too
An approver arrives here from the tally chip on their [queue](#approvals--approver-portal), and only
for a job whose *frozen pool* names them; any other job id is refused with the same *Job not found.* a
nonexistent one gets. They see the record and none of the operator's capabilities — no approval link,
no approver CPFs, and no Retry, Cancel or Download. Withholding the link is a **quorum** control, not a
disclosure one: it lets its holder approve as any pool member, so a member holding it could satisfy
`MinimumApprovers = 3` alone.

Everything else on `/jobs`, `/input`, `/system` and the whole REST surface remains operator-only.
:::

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

**Where the operational store is** is *not* on this page. The storage-paths table shows the local
directories under `Storage:Root`, `db/` among them — which under `Database:Provider = SqlServer` is
simply unused. The surfaces that name the store are the ready-summary banner's `operational store` row
and `/api/ready`'s `database` check, both of which name provider, server and database and never the
connection string.

**Who owns the work share** — above the storage-paths table, and **only** when
`Storage:Provider = AzureFiles`. Ordinarily one caption naming the marker this instance claimed. When
another instance held it at startup, a red alert instead, naming that instance's host and process id.
It is a boot-time snapshot rather than a live check: the marker is claimed once and held for the
process's life, so a row that refreshed would be implying a freshness it cannot have. See
[Operations](operations.md#when-another-instance-appears-to-own-the-work-share).

**Approver links** — when `ApproverPortal:Enabled`, a section listing every configured approver with
their personal portal URL and which profiles' pools they belong to. Config-derived, which is why it
lives here and deliberately *not* on a job page: a durable link rendered beside one job reads as being
about that job, and an operator would forward it expecting it to expire with the file. Each is shown as
a read-only field to copy rather than a clickable anchor, since clicking one would open somebody else's
queue in the operator's own browser. The section carries the capability warning. With the portal off,
it says so instead. See [Approvals](approvals.md#the-approver-portal).

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

## `/approve/{id}` — Approval (anonymous)

The one page in the application that is **not** behind the operator policy. It renders on a bare layout
— no nav drawer, no app bar — because the person opening it is an approver rather than an operator.
Present only when a signing profile carries an [`Approval` block](approvals.md).

| Aspect | Behaviour |
|--------|-----------|
| Auth | **None by default.** Anyone who can reach the URL can approve — or reject — as anyone in the job's frozen pool, with the warning stated on the page itself. If the visitor already holds an [approver-portal](#approvals--approver-portal) session or a Microsoft Entra `Approver` session, the page **recognises them**: it names them instead of offering the picker, records the stronger identification method, and shows the identifiers unmasked. |
| Decisions | **Approve** or **Reject**, with an optional shared reason field. Rejecting takes a confirming second click. One rejection stops the job whatever the quorum says. |
| Shows | File name, grand total, payment count, cancellation count, payment-date range, payer, the frozen pool with each member's decision, progress toward the quorum, the wait budget, and the content hash. |
| Individual payments | The **same** payment table the operator's job page renders, paginated. Which disclosure applies follows the *reader*, not the page: an anonymous visitor sees CPF/CNPJ reduced to its check digits and the account to its last digits, both captioned *(partial)*; an identified one sees them whole. Absent once the job is terminal, because the line detail is purged at that transition. |
| Not offered | **No raw file download**, on any approval surface. |
| Retry context | When the job is a retry of a previously approved one: who approved the parent, and whether the file is byte-for-byte identical. Those approvals do **not** count toward this job's quorum. |
| Not found | A job that does not exist and a job that never parked render the same message, so a guessed id reveals nothing. |

Full walkthrough: [Approvals](approvals.md).

## `/approvals` — Approver portal

One approver's queue, reached through their own durable link or a Microsoft Entra `Approver` sign-in.
Like `/approve/{id}` it renders on the bare layout. Off unless `ApproverPortal:Enabled` — see
[Configuration](configuration.md#approverportal).

| Aspect | Behaviour |
|--------|-----------|
| Auth | An **approver session**, on its own cookie scheme. Not the operator cookie and not the API key. Because it carries an authorization policy, `/approvals` is **not** an anonymous route — which is what makes an index of pending approvals permissible at all. |
| Getting in | `/approvals/link/{token}` — the durable link, anonymous because it is how a credential is obtained. It validates, sets the cookie, and redirects; from then on the approver bookmarks `/approvals`. An unresolvable token and an absent one land on the same page, which says nothing about why. |
| Tabs | **Needs you**, **Waiting on others**, **Decided** — cut by *your decision*, not job status. The first two are both `AwaitingApproval`. |
| Scope | Only jobs whose **frozen pool** names you. |
| Each row | One line: file name, status, grand total, payment and exclusão counts, the quorum tally, when it parked, the decide-by deadline — plus one risk signal, the **largest single payment**, where an extra zero shows. The payer appears only when the list holds more than one distinct payer. |
| Approving | One click from the row. Ticked rows on **Needs you** can be approved as one batch from the toolbar; every ticked file is attempted whatever the ones before it returned, and the result names each file that did not go through and why. |
| Rejecting | On the row, behind a **modal dialog** carrying the irreversibility warning and an optional reason — the row button only asks. **There is no bulk reject**, here or anywhere. |
| Who gets paid | Expands the row in place to the payment table, identifiers **whole** — the reader is a specific person rather than whoever holds a forwarded URL. |
| Decided reach | Bounded by `ApproverPortal:DecidedLookback` (90 days by default) and capped at 200 rows. When the cap bites the page says so. |
| Export | **Export to Excel**, in the same place on every tab, disabled rather than hidden when the tab is empty. Downloads the whole tab, not the ticked rows. **Job-level: one row per payment file, never one per beneficiary.** A title block above the table names the reader, the moment and the list, and on **Decided** its lookback window and whether the cap bit. |
| Not offered | No raw file download. No route to a job outside your pools. |

Where operators get the links: the **System** page, one per configured approver. Never the job page.

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
