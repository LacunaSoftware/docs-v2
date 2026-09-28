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

When the optional **Microsoft Entra ID sign-in** is configured, `/login` renders **Sign in with
Microsoft** instead of the API-key form — the API-key form is off, not merely hidden — and the operator
pages require the `Administrator` app role. Signing out clears Bulk Signer's own session only, so
signing in again succeeds silently; that is normal single-sign-on behaviour. See
[Security](security.md#microsoft-entra-id-sign-in-mode-optional).

**Where a sign-in lands.** A link somebody followed always wins: if the sign-in was triggered while
opening a specific page, the person returns there. Only when no page was asked for does the role decide
— an `Administrator` (including one who also holds `Approver`) lands on the Dashboard, and an
`Approver`-only sign-in lands on the [approver portal](#approvals--approver-portal). An approver who opens
an operator page such as `/jobs` or `/system` is refused on `/access-denied`, which says so. The landing
is a default, not a fence: what keeps non-operators out of operator pages is the authorization on those
pages.

**Authorization is enforced inside the live connection too.** Moving between dashboard pages does not
make a new HTTP request, so each page's access rule is also checked against the signed-in identity of
the live connection, and a refusal reloads the page so the ordinary sign-in redirect applies. The
navigation drawer renders for operators only. Since 2.2.1 the live connection carries the operator's
identity, which is also what lets audit events written from a dashboard action name the operator. A
dashboard session left open across an upgrade from an earlier version keeps its old ticket — sign out and
back in once. See
[Security](security.md#the-dashboard-is-fenced-twice-at-the-endpoint-and-inside-the-circuit).

**The customer's logo.** With a [`Branding:CustomerLogo`](configuration.md#branding--the-customers-logo-on-the-sign-in-and-approver-pages)
configured, the login card shows it above a reduced product mark, and the three
approver surfaces show it beside one; with none, the pages show the product mark as before. The logo is
read once at startup, so a new file needs a restart and nothing else. A configured logo that could not be
read does **not** stop the service: the pages fall back to the product mark, and the reason is on the
ready-summary banner and as an alert on the **System** page — a missing logo is a cosmetic fault, not a
reason to refuse to sign.

## Common chrome

Every page has a top app bar and a left navigation drawer:

| Element | What it does |
|---------|--------------|
| App bar (top) | The **running version**, language selector (globe icon, see below), theme toggle (light / dark) and an account menu with Logout. |
| Drawer (left) | The nav links: Dashboard, Jobs, Input folder, Signing profiles, Events, Exceptions, Backup, System. The Exceptions link is hidden when `LogViewer:Enabled = false`. The Backup link is present on every deployment, including SQL Server ones — see [`/backup`](#backup--database-backup). |
| Refresh indicator | A small widget showing the last refresh time and the active polling cadence, plus a **Refresh now** button. |

**The running version is in the app bar on every page**, so somebody reporting a problem is already
looking at it. The bar shows the short form; the full informational version — which carries the commit
SHA the SDK appends, and which will not fit in a bar — is the element's tooltip *and* its accessible
name, so it can be hovered or read out without widening anything. The diagnostic surfaces print it whole:
the ready-summary boot panel and `/system`. A prerelease label is never dropped, since that is identity
rather than metadata. The same version also appears under the branded console banner on every start, and
as a row in the live console dashboard.

Live pages refresh on a server-side timer driven by `Dashboard:PollIntervalSeconds` (default 5). The
Job detail page stops polling once the job reaches a terminal state — there is no point refreshing a
`Completed` or `Failed` row.

**A page that has stopped refreshing says so.** A failed load leaves what is already on screen and
turns the indicator into a red *refresh failed*, with the reason in its tooltip and the time of the last
load that did succeed. The reason is the provider's own sentence with every configured secret masked out
of it, on the same layer the durable log uses (see
[Security](security.md#log-redaction--two-layers)). If the auto-refresh loop itself stops, so the page
will not update again on its own, the indicator says that too. The Refresh button is **always**
available, including while a load is running: a click during one is ignored, and the spinner beside it
is what says *not yet*. Every one of these also lands in the durable log. An operator action that times
out — a backup start, a profile save, Clear Jobs — likewise reports the failure instead of returning
quietly to an unchanged page.

### Display language

The web surfaces render in **American English or Brazilian Portuguese**, chosen per browser via the
language selector — in the app bar on the operator pages, pinned top-right on the bare-layout pages
(`/login`, the approver surfaces). The choice is stored in the standard ASP.NET Core culture cookie for
a year; switching is a full page reload. Resolution order is **cookie → the browser's `Accept-Language`
→ `en-US`**, so a Brazilian browser gets Portuguese on first visit with no interaction.

There is no configuration knob — the reader chooses, the server does not.

What the language deliberately does **not** change: audit-trail sentences on the job timeline and on
[`/events`](#events--operational-events) (evidence stays English, exactly as written), REST wire values
(`JobStatus` names, problem `code`s and prose), durable logs, the console dashboard, and everything
CNAB240 — `R$` amounts, `dd/MM/yyyy` payment dates and the remessa vocabulary are properties of the file,
not of the reader.

## `/` — Dashboard

Landing page. Stat cards and the last few jobs:

| Card | Value |
|------|-------|
| Queued | Count of jobs in `Queued` |
| In flight / Slots busy | When `Pipeline:MaxConcurrency = 1`: count of jobs in `Processing` + `Verifying`. When `MaxConcurrency > 1`: rendered as `N / M slots busy`. |
| Running for / Longest running | The in-flight job the pipeline has held the longest, as a live figure ticking once a second, with the file name linked to its page. Measured from the job's most recent pickup — or, on a job back from Lacuna Signer, from the download — so neither an approver's deliberation nor a signer's days are in it. Shown only while something is in flight; labelled *Longest running* when `MaxConcurrency > 1`. Not a statistic, so it does not depend on `Statistics:Enabled`. |
| Completed (24 h) | Jobs whose terminal transition was in the last 24 h |
| Failed (24 h) | Jobs that failed in the last 24 h |
| Canceled (24 h) | Operator-canceled jobs in the last 24 h |
| Encrypted output (24 h) | Subset of completed jobs whose output was encrypted |
| Pipeline state | "Running" or "Paused" (clickable, opens the System page) |

When `Pipeline:MaxConcurrency > 1`, a small **In flight by format** panel breaks the in-flight count
down by `Pades` / `Cades` / `Xades`. In sequential mode (the default) the panel is hidden.

### Processing performance panel

Below the stat cards sits a **Processing performance** panel with per-stage elapsed-time statistics —
average job time, average signing and verification time, rolling throughput, min/avg/max totals, a
per-stage breakdown, a Local vs Remote split, and the **slowest job**: the completed job behind *Max*,
named and linked to its page. The numbers are rows in the operational store, so they **survive a
restart**, and in a cluster the panel describes the whole deployment rather than whichever instance
answered your request.

The former **Max throughput/sec** card was retired rather than reworked: it measured one process's
lifetime, which under a cluster would have described one instance's luck. "Throughput (last min)"
answers what it was mostly read for.

Hidden entirely when `Statistics:Enabled = false`. Full reading guide, including how to use the stage
split to localise a slowdown: [Job statistics](statistics.md#what-each-dashboard-metric-means).

Below that: a throughput chart for the last 24 hours and a table of the last five jobs. This page is a
read-only overview — for actions, go to Jobs.

## `/jobs` — Jobs

A filterable, paged table of every job:

| Filter | Type |
|--------|------|
| Status | One status from `Queued / Processing / AwaitingApproval / AwaitingSigner / Verifying / Completed / Failed / Canceled`, or none |
| Profile | Drop-down of every signing profile the deployment holds — a disabled profile included, since looking at what a retired profile signed is a reason to keep it. |
| File name contains | Free text (contains-match) |
| Created from / Created to | Two date pickers, inclusive of both days |

Server-side paging, **50** a page, newest first. The columns: a tick (on `Completed` rows only — see
below), the file name with an `enc` chip when the output was encrypted, format, the resolved profile
name, source (Watcher / Upload / Retry), the status badge, the **Approvals** chip (below), the last
update, and a download icon on `Completed` rows. A row click navigates to the job detail page; the tick
and the download icon do not, so using either leaves you on the list.

A job in `AwaitingApproval` carries its **wait duration** beside the status badge ("waiting 3 h 12 min",
with the exact park time in the tooltip): an approval wait is open-ended, and how long it has run is the
only thing an operator can judge it by.

### The approvals column

One chip, on an `AwaitingApproval` row and on no other — how many more people have to decide before the
file can be signed, so a queue of parked payment files can be scanned without opening each one. A job
that never reached the approval gate has no rule to report, and one that has left it has an outcome the
status badge already names.

| Chip | When |
|------|------|
| *N* more needed (amber) | The frozen quorum still wants *N* decisions. Hover for "*x* of *y* approvals recorded, from a pool of *z*". |
| quorum met (green) | Enough people have approved; the job is released on the pipeline's next poll. |
| rejected (red) | Somebody in the pool vetoed it. A rejection is a veto, not a withheld vote, so no further approval can release the file — the chip reads the outcome rather than the arithmetic. The row is caught in the moment between the veto and the move to `Canceled`. |

Every figure comes from the rule **frozen onto the job** when it parked and the decisions recorded against
it — never from the live profile — through the same evaluation the approver's page, the job page and
`GET /api/jobs/{id}/approvals` use. See [Approvals](approvals.md#the-frozen-rule).

### Downloading signed outputs

Two controls, both offered on a `Completed` row and on no other:

| Control | What it does |
|---------|--------------|
| Download icon, on the row | The same `GET /api/jobs/{id}/output` download the job page offers, opening in a new tab, without leaving the list. An `.enc` envelope is served as-is when the profile encrypts. |
| Tick, on the row; tick, in the header | Selects the row, or every `Completed` row on the current page. The selection is **this page only** and is cleared by every page move and every filter change, so the count on the button always names rows you can see ticked. |
| **Download N selected**, in the header | One ZIP — the **signed-output archive** — of the ticked jobs' signed files, through `GET /api/jobs/archive`, stored uncompressed under the names `output/` holds them. Disabled while nothing is ticked. |

A ticked job whose signed file is no longer in `output/` under its expected name — moved out by an
operator or their automation, or left under an earlier name because the profile's `PreserveFileExtension`
or `SaveAsPem` flag changed after the job completed — is listed by job id and expected name in a
`MISSING.txt` entry inside the ZIP, and the rest of the batch is served. The download is refused with
`410 job.output-gone` only when none of the ticked jobs still has its file. The cap is the page — 50
jobs. Two jobs whose outputs share a name both land in the archive, the later one with its job id before
the extension. If a read fails part-way through, the browser reports the transfer as failed and the
partial file does not open as a ZIP — deliberately, rather than a well-formed archive with one short file
inside.

Neither control writes an operational event: a download is a read, and the audit trail records what
changed a job, never who looked at one. One structured log line per download records the operator and
the counts. This is **not** the raw-file download withheld from approvers, and does not weaken it: that
rule is about a payment file reaching a link-identified approver, while the operator is the party
`output/` exists for and already collects these same files from it.

### Exporting the list

The header's **Export to Excel** button downloads the job list as an `.xlsx` workbook — **every job the
current filters admit, not this page and not the ticks** (the ticks belong to the archive above). It
carries the page's filters — status, profile, file-name fragment and created-date range — so the workbook
is cut by exactly what the table is showing, and `GET /api/jobs/export` applies them through the same rule
the table and `GET /api/jobs` use. Disabled rather than hidden while nothing matches.

What is in it: one row per job, newest first — file name, format, profile, source, status (in your
display language), created and updated, input folder, original path, the CNAB240 total and payment count
when the job was parsed as a remessa (an empty cell otherwise, never `0`), whether the output was
encrypted, the error message, the parent job id and the job id. Every value comes off the job row; **no
payment line reaches the workbook** — one row per *file*, never one per beneficiary, the same line the
approver portal's export keeps. A title block above the table names who generated it, when (with the
server's UTC offset), each filter in force — or *None* — and how many jobs matched. The export is capped
at **10,000 rows**; when the cap bites, the block says so in red, and a created-date range is how the
rest is reached. Contents follow your display language; the file name (`jobs-yyyyMMdd-HHmmss.xlsx`, UTC)
does not.

Like the archive, it writes no operational event and leaves one log line — the operator, the row count,
how many matched, and whether a filter was in force; never a file name. It requires an operator
credential and draws on the `Export` rate-limit budget it shares with the approver portal's export.

### Upload files

The header's **Upload files** button is the dashboard's way in for a file that no watched folder will
deliver — a one-off, a test, a file an integrating system dropped somewhere else. It opens a dialog with
two choices and one action: the **signing profile** (enabled profiles only, `default` preselected when it
is among them — a disabled profile is refused at ingestion, so offering it would be offering a refusal),
the **files** (one or more, up to `Upload:MaxBytes` each, the figure stated in the dialog), and
**Upload**.

Every file goes through exactly the path `POST /api/files` uses — the same size cap, the same file-name
sanitising, the same staging into the first input folder under a minted name, the same enqueue — so the
two surfaces cannot answer one file differently, and a dashboard upload is a job like any other. What the
dialog does *not* offer is the `?format=` override: the profile's pinned format or the file's extension
decides, as it does for a folder drop.

Files are transferred one at a time, in the order they were picked. A file is refused **from the size the
browser declared, before its transfer starts**, and the transfer is then held to the same ceiling, so a
browser that misreports the size runs into the second limit rather than into this host's disk. A file
that fails does not stop the ones after it. While the run is in flight the dialog cannot be dismissed —
not by Escape, not by the backdrop, and Cancel is disabled — because a dismissal would cancel a transfer
that has already queued some of the files, with no report left to say which.

When the run ends the dialog becomes a **report**: one row per file, in pick order, each saying what
became of it — *Open job* for the ones queued, the refusal in words for the rest (the same reasons the
REST route answers with `upload.empty`, `upload.too-large`, `upload.invalid-name`, `profile.disabled`,
`job.path-too-long` or `file.already-processed`; a transfer that broke reads *the transfer failed*, its
detail in the server log). Closing the report with exactly one file picked and queued opens that job's
page; any other outcome returns the list to its first page with the filters kept. A pick of more than 100
files is refused in words, with nothing kept.

**A host that takes no uploads has no button.** Under [`Upload:Enabled = false`](configuration.md#upload)
the header renders nothing where the button was, rather than a disabled control — nothing on the page
could turn it back on. The upload path refuses on the same value (`upload.disabled` on the REST route), so
hiding the button withholds nothing. Watched folders, rescan and retry are untouched.

The per-IP `Upload` rate limit applies to the REST route, not to this dialog: the operator behind it has
already authenticated.

### Deleting a job

**Each row has a Delete button**, except a job a worker is running (`Processing` / `Verifying`), which
runs to completion. It opens a confirmation dialog — naming the file, with an optional reason — and then
deletes the job's record and timeline **and its files**: the artifact it recorded writing to `output/`
(signed file, `.enc` envelope or `.reject` hand-back), its `processing/` and `error/` folders, and its
input file when that is still the file the job staged and no other unfinished job (a queued retry, say)
still names it. A job that has not finished (`Queued`, `AwaitingApproval`, `AwaitingSigner`) is canceled
first; if a worker picks it up before that happens, nothing is deleted.

The operational event log keeps a `JobDeleted` entry naming what was removed, what was kept, and a
summary of any approvals the job carried. There is one row at a time — no bulk delete — and no REST
route.

**Deleting a job is also how a file name is accepted again.** Since 2.13.0 a file arriving under a name
that a `Completed` or still-active job already carries — compared across the whole host, ignoring case —
is refused rather than signed twice (`file.already-processed`; on by default, turned off with
`Pipeline:RejectAlreadyProcessedFileNames = false`). Once the job holding the name is deleted, a file with
that name is accepted again. See
[Operations](operations.md#already-processed-file-names).

## `/jobs/{id}` — Job detail

Header card with file name, status badge, format, source, created/updated, parent job link (if this
job is a retry), and error message (if `Failed`).

- **Encrypted-output chip** — visible only when the job was signed with encryption enabled. Tells
  operators that downloading will yield a `.enc` envelope, not a cleartext signed artifact.
- **Processing time section** — on a `Completed` job with recorded timings: the total and the four
  stage timings (queue wait, signing, verification, output) in `hh:mm:ss.fff`, when the pipeline picked
  the job up and when it completed, captioned with whether the job was signed locally or through Lacuna
  Signer and that no wait for a person is in the figures. A stage that did not happen reads *skipped*. On
  a job in `Processing` or `Verifying`: how long the pipeline has held it, live. Absent on every other
  job. `Statistics:Enabled = false` removes the completed job's breakdown; the live figure is not a
  statistic and stays. See [Job statistics](statistics.md#one-jobs-own-numbers).
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
  required" chip, how many approvals are in, when the job parked, the frozen **signer set** (whose
  signatures the output carries), the frozen wait budget, and the approver pool — name, email and CPF —
  **as it stood at park time**, each row carrying that person's decision, its reason, and when they made
  it. The decision chip's tooltip names how the approver was identified (`SelfDeclaredEmail`,
  `LinkDerivedEmail` or `EntraIdEmail`), and on an approval recorded by signing the timeline names the
  certificate that made it, with its CPF masked. Editing the profile's approval rule does **not** change
  what is shown here; that is the whole point of the snapshot. A rejected job reads *"2 of 2 approvals —
  rejected"*, with a banner above the pool saying why the job is `Canceled`.
- **Approval record section** — **operator only**, present while the job is `AwaitingApproval`,
  including when the Approval section above cannot render because the frozen rule is missing. It runs the
  checks an approval decision is subject to and shows each with a verdict: the frozen rule; the recorded
  content hash; the staged copy in `processing/<jobid>/` and whether it still hashes to that value; the
  running CMS beside it (*not checked* when there is none, which is normal unless the approvers sign) and
  whether it wraps the recorded content; and whether every approved row's certificate thumbprint can be
  read. A failed row is the reason an approver is told the record is incomplete
  (`approval.job-incomplete`), and the panel says what to do about it: Cancel and a fresh run, since
  nothing repairs a record in that state (see
  [Troubleshooting](troubleshooting.md#an-approver-is-told-the-approval-record-is-incomplete)). A missing content hash names its likely cause — the profile's
  CNAB240 check was off when the job parked, so nothing parsed the file. The panel names the processing
  folder so the operator can look at the files themselves. It is inspected once per visit, because it
  reads and hashes the staged copy; **Check again** re-runs it.
- **Profile section** — the resolved signing profile: name, declared format (or `auto` for a profile
  with no fixed format), cert source, and the `Verify` / `Encrypt` / `Validate certificate` posture
  flags. If the job's profile no longer exists, a warning is shown — the job stays viewable but a retry
  would fail until the profile is restored.
- **Timeline** — every history entry in chronological order, one row per state transition, each with
  the timestamp, status badge, and message text.

:::note Changed in 2.9.0 — no per-job approval link
The Approval section used to render the job's approval link (`/approve/{jobId}`) in a read-only field
for the operator to copy and hand out. That field is gone, for every reader. An approver finds a parked
file on their own queue, through a [portal link](approvals.md#the-approver-portal) or an Entra sign-in,
and the operator's page hands out nothing to forward. The anonymous page at `/approve/{jobId}` still
exists and works as [before](#approveid--approval-anonymous); it is simply no longer offered here.
:::

Action buttons (visibility gated by status):

| Button | Visible when status is… | What it does |
|--------|-------------------------|--------------|
| Retry | `Failed` | Creates a new job with `ParentJobId = this.Id`; navigates to the new job. |
| Cancel | `Queued`, `AwaitingSigner`, `AwaitingApproval` | Opens a confirmation dialog first, naming the file and saying what the cancel does to it from the job's current status; **Keep job**, Escape or the backdrop cancel nothing. On confirm, moves the job to `Canceled`; the watcher will not auto-resurrect the file, and a canceled job has no Retry, so the file needs a rescan or an upload to be signed again. From `AwaitingSigner` it also best-effort cancels the remote document; from `AwaitingApproval` it relocates the staged copy to `error/<jobid>/`. |
| Download | `Completed` | Opens `GET /api/jobs/{id}/output` in a new tab. `application/octet-stream` with a `.enc` filename when encrypted; `410 job.output-gone` if the file has left `output/`. The Jobs list offers the same download on each `Completed` row, and a ZIP of several — see [Downloading signed outputs](#downloading-signed-outputs). |

Retry and Cancel results render as a toast — success, warning (e.g. `job.not-queued`), or error.
Download is a navigation, so a refusal arrives as the route's problem response in the new tab.

:::note This is the one page an approver may open too
An approver arrives here from the tally chip on their [queue](#approvals--approver-portal), and only
for a job whose *frozen pool* names them; any other job id is refused with the same *Job not found.* a
nonexistent one gets. They see the record and none of the operator's capabilities — no approver CPFs, no
Approval record section, and no Retry, Cancel or Download. The Processing time section is shown to both,
being a record about the job rather than a capability.

Everything else on `/jobs`, `/input`, `/profiles`, `/events`, `/system` and the whole REST surface
remains operator-only.
:::

## `/input` — Input folders

Operational view of every configured `Storage:Inputs[]` folder, one card per folder, plus a global
`Rescan all` button. Each card shows:

| Element | Value |
|---------|-------|
| Folder name chip | The `Name` from `Storage:Inputs[]`. |
| Status chip | `running` (green) / `initializing` (amber) / `stopped` (red) / `folder missing` (red) / `unassigned — no profile has chosen this folder` (grey). |
| Profile chips | The signing profile that chose this folder and its declared signature format (or `auto` for a profile with no fixed format). The profile chip links to that profile's page, which is where the folder is chosen or moved. A folder no profile has chosen shows a single *unassigned* chip instead. |
| Watched path | The **absolute** path on disk. |
| File count | Number of files awaiting pickup (capped at 50; shown as `50+` past the cap). |
| Lifetime processed | Every candidate the watcher has handled since process start, regardless of outcome. |
| Last error alert | Shown only when `Status = stopped`. |
| `Rescan this folder` button | Re-enqueues only this folder. |

`Rescan all` (top of page) re-enqueues every folder. The toast reports per-folder totals when more
than one folder is configured, and ends with how many folders were **unassigned and skipped**; it turns
amber when that count is above zero, so a rescan that did nothing is not reported as a success.

:::warning Changed in 2.2.0 — a profile chooses its folder
A folder's signing profile is no longer set on the folder in configuration: each profile chooses the one
watched folder it feeds from, on its own page (see [`/profiles/{name}`](#profilesname--signing-profile-detail)).
`Storage:Inputs[].Profile` is read only once, as seed input, on the first boot against an empty profile
table. **`unassigned` is not a fault**: no profile has chosen the folder, so nothing is watching it and
files dropped there wait until one does. It does not count against readiness. A binding moved on a
profile's page shows here on the next reload.
:::

:::warning
**Stopped watchers do not auto-revive.** When the per-folder consecutive-enqueue-failure threshold
trips, that folder's watcher exits while the rest of the service keeps running. Fix the underlying
cause (mount, disk, permissions) and restart the service to bring the watcher back up.
:::

## `/profiles` — Signing profiles

Since 2.1.0 the signing profiles live in the operational store and are created and edited from the
dashboard. `Signing:Profiles[]` in configuration is a **one-time seed**, read on the first boot against an
empty profile table and reported as ignored afterwards — a banner on this page says so, because editing
that section now changes nothing. See [Configuration](configuration.md).

This page lists every profile, and carries the one button that creates one, **New profile**. There is no
REST route that writes a profile; `GET /api/profiles` reads them. The profile pages require an operator
**browser session** — not a bare `X-API-Key` header — because the detail page renders approver pools
whole; an approver does not reach them.

Above the table, two kinds of condition are named with their reason rather than only as a chip:

- **A profile that cannot sign** (`degraded`), with the certificate provider's own sentence.
- **A profile bound to a folder this host has not configured**, naming the profile and the folder. The
  profile still serves uploads, but nothing arrives for it from a folder here. It arises only *after* a
  save — the save itself refuses a folder the saving host lacks — from a folder renamed or removed in
  configuration, or from a cluster host whose configuration differs. The fix is to configure the folder
  on this host, or open the profile and choose another. The startup banner and `/api/ready/details`
  report the same list.

The table:

| Column | Value |
|---|---|
| Profile | The name, plus a `default` chip on the resolution target of last resort and a `disabled` chip on a profile not accepting new work. |
| Format | `Pades` / `Cades` / `Xades`, or `auto (by file extension)`. |
| Method | `Local` or `LacunaSigner` — or *n/a* on a **keyless** profile (see State). |
| Certificate | The certificate source in force — `Pfx` / `Pkcs11` / `WindowsStore` / `AzureKeyVault` — *at the remote signer* under `LacunaSigner`, or *none — approvers sign* on a keyless profile. |
| Checks | Chips for verify, chain, encrypt and CNAB240, each stated in both directions. The chain chip is withheld under `LacunaSigner` and on a keyless profile, where the check cannot apply. Only *verify* is coloured when off: verification off means an original input is deleted on the strength of a signature nothing checked, while the other three are off by default, so colouring them would train an operator to ignore the colour. |
| Approval | The quorum and the pool's size, with the signer set and the wait budget beneath it, or *none — signs straight away*. |
| State | `ready`, `keyless` or `degraded`. `degraded` is a certificate that would not open, a profile whose behaviour could not be resolved, or a row the store gained since startup. `keyless` is a **third state, not a degraded one**: the profile's signer set is `Approvers`, so each approving pool member signs with their own certificate and the profile holds no key. A **Restart pending** chip appears beside `ready` or `degraded` when the store holds a certificate change this instance has not opened yet. |

A `disabled` profile is refused at ingestion — folders, uploads, rescans and retries alike — while
everything already queued on it runs to completion. It is never deleted. Opening a row goes to the
profile.

## `/profiles/_new` — New signing profile

The form that creates a profile. Everything on it is typed once and saved once; there is no draft
state.

**The certificate is opened while the save runs**, for a profile that has one. A wrong password, an
unreachable vault, a PKCS#11 module this host does not have, or a public certificate that does not match
the vault key is reported here, in the form, rather than by the first job routed at the profile — and
**nothing is written when it fails**. It is also what lets a new profile sign immediately, with no
restart. A profile signed at the remote Lacuna Signer service has no local key, so there is nothing to
open; the equivalent failure — a participant the service does not know — surfaces with the first file.
Nor does it apply to a **keyless** profile, whose approvers sign.

| Field | Notes |
|---|---|
| Name | Lowercase letters, digits and internal hyphens, up to 40 characters. **Fixed once accepted** — watched folders bind by name and every job keeps a copy of it, so there is no rename. A name already taken is refused, compared case-insensitively. |
| Signature format | `Pades` / `Cades` / `Xades`. `auto` is not offered: only the `default` profile may dispatch by file extension. |
| Input folder | The watched folder whose files this profile signs, or *None — reached only by uploads naming this profile*. Offers the folders this host has configured that no profile feeds from yet. Refused for a folder this host lacks, and for one another profile took in the meantime, naming the owner. The folder's watcher picks files up within one poll interval of the save, with no restart. |
| The checks | Verify, chain, encrypt, CNAB240 (and, while CNAB240 is on, whether payment dates are checked), keep original extension, write PEM — the same set the detail page edits, refused by the same rules. Turning verification off asks for confirmation. |
| Signing method | **Local signing**, the remote **Lacuna Signer** service, or **None — the approvers sign**. It is the first control, because it decides whether the rest of the form asks for a certificate at all. Lacuna Signer replaces the certificate fields with the participant — name, email, identifier — and is refused if this host has no `Signer:*` settings. |
| None — the approvers sign | Creates a **keyless** profile: the signer set `Approvers`, under which each approving pool member signs the file with their own certificate. The certificate fields are replaced by the approval rule such a profile cannot do without — **the pool** (name, address, CPF per member), **the number of approvers required** and **the wait budget**. Refused without a `WebPki:License` or `CloudHub:ApiKey` on the host, on a host with neither the approver portal nor an Entra sign-in (nobody could present a certificate), for a signature format other than `Cades` (an approver's signature is a CAdES co-signature), and without CNAB240 validation, which every approval rule needs. Confirmed past a warning that the delivered file carries the approvers' signatures and not the profile's. |
| Certificate source | Under local signing: `Pfx` / `AzureKeyVault` / `Pkcs11` / `WindowsStore`, each exposing only its own fields. |
| Where is the file? | For `Pfx` and `AzureKeyVault`: **on this host** (a path), **in an Azure Storage blob**, or — for a PKCS#12 only — **uploaded now**. Exactly one; which certificate signs must never depend on which coordinate happened to be readable. Under `AzureKeyVault` what is named is the *public* `.cer`; the private key never leaves the vault. |
| Upload the PKCS#12 | The file is sent to the service, encrypted under `Signing:ProfileSecretsKey` and stored **in the operational store** — never written to the host's filesystem, and never shown or downloadable again. It is what lets an operator who cannot reach the host's disk, or a clustered instance with an ephemeral disk, install a certificate at all. Capped at **256 KiB**. Whoever holds both the database and that key holds this signing credential, so keep the key outside the database and out of its backups (see [Security](security.md#the-signing-profile-secrets-key-signingprofilesecretskey)); name a path or a blob instead if the key must never leave the machine it is on. |
| PKCS#11 PIN | **Not on this page and not stored anywhere.** The form takes the *name* of the environment variable the PIN is read from, and the save refuses a variable this host does not have set. |
| Secrets | A PKCS#12 password, a vault application secret and a blob credential are encrypted before storage and scrubbed from log output from the moment they are saved. They are never shown again — only whether they are set. A secret shorter than twelve characters is refused, because the log scrub cannot mask a value that short without rewriting unrelated text. |

A keyed profile is created without an approval rule; gate it afterwards from its detail page. Every
accepted creation records one operational event naming the operator, the format, the certificate source
(or the signing method, or for a keyless profile the signer set, pool size and quorum) and whether
verification is on — and deliberately no path, thumbprint, secret, or approver's name, address or CPF.

## `/profiles/{name}` — Signing profile detail

Everything the deployment holds about one profile. The name is matched case-insensitively, as
`POST /api/files?profile=` matches it. An unknown name renders a notice pointing at the list.

Four panels, three of them editable — and **the three take effect on three different schedules**:
**behaviour** reaches the next job the pipeline claims, an **approval rule** the next file that parks,
and a **certificate** the next restart. Only one edit form is open at a time.

**Every save follows the same rules.** Illegal combinations are refused when you save, in your language,
from the same rules that refuse them at boot, and nothing is written when a save is refused. A save that
changes nothing writes nothing. If somebody else saved while your form was open, **your save is refused
rather than applied**, instead of silently reverting a colleague. Every accepted save records one
operational event (see [Audit-trail conventions](#audit-trail-conventions)) that never carries a secret,
a path or a certificate identifier.

### Behaviour

Format, method, whether the profile **accepts new work**, the **input folder**, and the checks — verify,
chain, encrypt, CNAB240 (with, while it is on, **check payment dates**), keep original extension, write
PEM. This is the rule in force: the next job the pipeline claims signs under it. A profile with
verification off carries a warning.

**Edit behaviour** covers the format, the accept-new-work switch, the input folder and the checks. Save
it and the change reaches the next job claimed, and every instance in a cluster converges within one poll
interval — no restart. Refusals worth knowing:

- Encryption cannot be turned on while the host's `Encryption:Enabled` is false.
- *Write PEM* stays confined to CAdES, and *keep original extension* to CAdES and XAdES.
- The format cannot leave `Cades` while the approvers sign.
- **CNAB240 cannot be turned off while the profile carries an approval rule** — a file routed there
  would park with nothing parsed, and no approver could decide it. Remove the rule from *Edit approval*
  first.

**Three changes ask before they are accepted:** disabling the profile (files then pile up in a folder
nobody is looking at), turning verification off, and pinning a format on `default` (which turns per-file
detection off for every bare upload).

**Check payment dates** (2.15.0, on by default) decides whether a remessa whose earliest payment date
has passed is refused at signature (`cnab240.payment-date-passed`) or let through — for a bank that
processes a past-dated payment on the next business day. Off, the file is signed and the job history, an
operational event and a metric record that the check was skipped. Read at signature time, so a change
reaches the next job — a parked one included — with no restart. See
[CNAB240](cnab240.md#payment-dates-that-have-passed).

**The input folder picker** offers *None*, every folder this host has configured that no other profile
feeds from, and the profile's own — marked *not configured on this host* when the host no longer has it.
A folder another profile feeds from is refused, naming the owner; two saves choosing one folder in the
same instant leave exactly one owner. A move reaches the watchers within a poll interval or two on every
instance, with no restart: the old folder goes *unassigned* on the Input page and the new one starts
listing.

**Retiring a profile is the accept-new-work switch; there is no delete.** Turn it off and nothing is
routed there again — a watched folder, an upload, a rescan and a retry are each refused with
`profile.disabled`. **Everything already queued runs to completion.** The profile stays listed and stays
a filter on the jobs list. Disabling is refused while the profile feeds from a watched folder, naming the
folder — clear the folder (in the same save is fine) first. `default` offers no switch at all: it is
where a bare upload lands.

The name and the signing method are not edited here; the method is part of the certificate form.

### Certificate

Where the signing material comes from, **as stored**: a PKCS#12 path, a PKCS#11 module and thumbprint, a
Windows store location and thumbprint, or a key vault endpoint, application id, key name and
public-certificate path — plus a signing material blob's URL and credential mode when one is configured.
An unset coordinate says *not set* rather than vanishing. Under `LacunaSigner` the panel names the remote
participant instead. **Every secret reads as *configured* or *not configured*, never as a value**; the
PKCS#11 PIN is shown only as the name of the environment variable it is read from.

**Edit certificate** takes the same method and source choices the create form does, and the signing
method is its first control:

- **To Lacuna Signer**: no key is opened, so the change applies to the next job claimed with no restart,
  and the stored certificate coordinates — password included — are cleared. Refused if this host has no
  `Signer:*` settings. See [Lacuna Signer integration](lacuna-signer.md#choosing-the-method-from-the-dashboard).
- **To local signing, or any other certificate change**: saved to the store, but **read at the next
  restart**. Until then the profile keeps signing with the key it already opened — a resolved profile
  holds an open private-key handle, and swapping one underneath a signature in progress cannot be made
  safe. A profile moved from Lacuna Signer to local signing has no key yet, so it is reported
  **degraded**, and jobs routed to it fail with `profile.degraded`, until the restart.

**Nothing opens the certificate during an edit**, so a wrong password is reported at the next startup
rather than in the form: the profile comes up **degraded** on this page with the provider's own sentence,
and the remedy is to correct the coordinates and restart again. Verifying at save time was declined on
purpose: on a PKCS#11 token or a Windows store it would mean opening a second session against hardware
that may not be re-entrant, while the pipeline holds one and may be mid-signature.

**An uploaded PKCS#12 can be kept, replaced or removed.** Under *Uploaded into this service*, leaving the
picker empty **keeps** the stored file, choosing one **replaces** it, and choosing a path, a blob, another
source or Lacuna Signer **removes** it — which is warned about before you save. A save cannot destroy a
private key by omission.

**A secret is kept unless you say otherwise.** Leaving a password field blank keeps what the store holds,
so somebody can change a certificate's path without knowing the password. A **Remove the stored value**
switch appears where there is something to remove. If the host cannot read a stored secret — a rotated
or removed `Signing:ProfileSecretsKey` — a save that would keep it is refused, and typing the secret again
is the way out; such a profile also comes up degraded. See
[Troubleshooting](troubleshooting.md#a-profile-is-degraded-saying-a-stored-secret-could-not-be-decrypted).

**A pending certificate change is marked until a restart picks it up.** The marker names the fields that
moved — never their values — sits above the panels, and appears as the **Restart pending** chip on
`/profiles`. It is derived from the store, so it survives reloads, and **in a cluster each instance
answers for itself**: an instance that has restarted and one that has not are signing with different
keys, and each says so. Nothing dismisses it; it stops being true when a restart reads the stored
certificate.

**A keyless profile's certificate panel lists no coordinates** and offers no edit, and the signing method
is shown nowhere on the page. Moving the signer set **into** `Approvers` from the approval form opens
nothing and is live on the next file that parks. Moving it **out** of `Approvers`, or removing the gate,
gives the profile a key of its own again, opened at the next restart — the form warns, and the Restart
pending marker names *Signer set*.

### Approval

The quorum, the signer set, the wait budget, and the pool whole — name, address and CPF — on the same
terms the job page shows them to an operator. `GET /api/profiles` reports a count instead. This is the
rule in force; a job that has already parked is decided against the rule frozen onto it. An implausibly
long wait budget carries the same warning the boot banner raises.

**Edit approval** opens a form over the whole rule: the pool (add, remove, edit a member), the quorum,
the **signer set** (whose signatures the output carries), and the wait budget. A profile with no gate can
be given one from the same button, and a gate can be removed entirely. A signer set with approvers in it
needs a Web PKI licence or CloudHub, plus the approver portal or an Entra sign-in, on the host; it is
confirmed past a warning that the delivered file will carry several signatures. See
[Approvals](approvals.md).

- **The wait budget is typed in hours**, deliberately not in the `d.hh:mm:ss` spelling configuration
  takes, where `"48:00:00"` means forty-eight *days*. A *No time limit* switch clears it; a budget at or
  beyond 24 days asks before it is saved.
- **Removing somebody takes effect immediately** — no restart, no poll interval: an approver's link is
  resolved against the pool in the store on every use, so deleting the row is the revocation. Adding
  somebody hands them the same link they had before, since links are derived rather than issued.
- **Jobs already parked are untouched.** Each is decided against its frozen rule; somebody added today
  cannot approve a file that parked yesterday.
- **Refusals name the row they are about**: a quorum larger than the pool, a quorum below one, two rows
  sharing an address, a blank name, a CPF failing its check digits. An approval rule is refused on a
  profile that does not check CNAB240 payment files, and the form says so before you save.
- **Removing the gate asks first**, because the pool goes with it. Adding one does not ask.

The audit event carries counts — how many people were added, removed and amended — **never a roster**.

### Input folder

The one watched folder this profile feeds from, by name and path, or none — the blast radius of a
change, before any change is possible. A folder this host has not configured is marked *not configured
on this host*, because the binding is the profile's and configuration is per host. The folder is chosen
or moved from *Edit behaviour*.

## `/system` — System

Read-only service info:

| Field | Source |
|-------|--------|
| Build version | Assembly version, in full |
| Host mode | Windows Service / systemd / console / docker |
| Environment | `ASPNETCORE_ENVIRONMENT` |
| Storage root | `Storage:Root` |
| Pipeline | Running / Paused; click to navigate to the Pause/Resume action |
| License fingerprint | SHA-256 of the loaded license, first 16 hex chars |
| Web PKI license | `WebPki:License` configured / not configured, never the value. *Not configured* is a neutral chip: it is legal wherever no signer set includes the approvers. |
| Cloud certificates (CloudHub) | `CloudHub:ApiKey` configured / not configured, never the value — it is a secret. Same neutral chip when absent. |
| Certificate source | `Signing:Certificate:Source` + the relevant subtree field |
| Signature policy | ADR-Básica (default; see [Certificates](certificates.md)) |
| Encryption | Enabled / Disabled |
| Last shutdown | The most recent `ServiceStopping` operational event, if any. Empty after a Clear Jobs until the next shutdown. |
| Queue length | Snapshot of `Queued` count |

A configured customer logo that could not be read shows here as an alert, with the reason.

**Recent events.** Beneath the pipeline card, the newest ten entries of the operational event log —
relative time, event type, message as recorded — with a **View all events** link to
[`/events`](#events--operational-events). Refreshed on every poll. An empty log says so; after a Clear
Jobs, the `JobsCleared` entry is the first there is.

**Where the operational store is** is *not* on this page. The storage-paths table shows the local
directories under `Storage:Root`, `db/` among them — which under `Database:Provider = SqlServer` is
simply unused. The surfaces that name the store are the ready-summary banner's `operational store` row
and the `database` check on `/api/ready/details` (behind the API key or an operator session), both of
which name provider, server and database and never the connection string.

**Who owns the work share** — above the storage-paths table, and **only** when
`Storage:Provider = AzureFiles`. Ordinarily one caption naming the marker this instance claimed. When
another instance held it at startup, a red alert instead, naming that instance's host and process id.
It is a boot-time snapshot rather than a live check: the marker is claimed once and held for the
process's life, so a row that refreshed would be implying a freshness it cannot have. See
[Operations](operations.md#when-another-instance-appears-to-own-the-work-share).

**Instances** — **only** when `Cluster:Enabled = true`. One row per instance identity that has registered
with the operational store: its derived identity with this boot's incarnation beneath it, a **Live**,
**Stopped** or **Stale** chip, the application version it is running, and when it started and last beat.
*Stopped* is an instance that said goodbye on a clean shutdown — the ordinary trace of a redeploy; *stale*
is one that fell silent without saying so. The row for the instance answering your request is badged as
such — and because the load balancer picks per request, reloading the page moves that badge, which is the
cheapest confirmation available that traffic really is spread. The caption names the heartbeat cadence and
staleness threshold in force. The dead are listed deliberately: an operator diagnosing a scale-in wants to
see the instance that went away and when it last spoke.

**Redeploys in place** (2.5.0): a row whose incarnation **displaced** a live predecessor — the previous
container of an in-place redeploy on App Service — names that displaced incarnation, and when, under the
identity. On the page served by the *displaced* process itself, a **warning banner above the table** says
that this process has stood down and since when — it claims no new work and finishes what it holds — and
that it resumes on its own if its successor's row becomes stopped or stale.

Two readings matter here. **Stale is a presumption, not a confirmed death** — an instance alive but unable
to write heartbeats appears the same way. And **two different versions outside a deploy window** is the
mixed-version condition, which is reported as a Critical at the newer instance's boot and is never
prevented. See [Operations](operations.md#which-instances-are-alive-cluster-mode-only) and
[High availability](high-availability.md#upgrades-are-stop-the-world).

**Approver links** — when `ApproverPortal:Enabled`, a section listing every approver in a profile's pool
with their personal portal URL and which profiles' pools they belong to. Read from the operational store
when the page loads, so an offboarding shows up on the next reload. It lives here and deliberately *not*
on a job page: a durable link rendered beside one job reads as being about that job, and an operator
would forward it expecting it to expire with the file. Each is shown as a read-only field to copy rather
than a clickable anchor, since clicking one would open somebody else's queue in the operator's own
browser. The section carries the capability warning: treat each link as that person's password, send
each approver only their own, and revoke by removing them from every pool (one person) or by changing
`ApproverPortal:LinkSecret` (everyone). With the portal off, it says so instead. See
[Approvals](approvals.md#the-approver-portal).

**Approver second factor** — when `ApproverSecondFactor:Enabled`, a list with one row per approver in a
pool, enrolled or not, with the enrolment date. Each enrolled row carries a **Reset** button, which is the
lost-phone path: behind a confirmation dialog, it clears that approver's enrolment so they bind a new
authenticator on their next visit, and is recorded under the operator's name as its own audit event. See
[Approvals](approvals.md#proving-it-is-you).

Pipeline pause/resume buttons are here, gated by the current state. The optional `reason` field lands
in the audit trail.

The `Cleanup` button is currently a no-op while the retention story is finalized. See
[Retention](retention.md).

### Danger zone — Clear Jobs

Permanently deletes **every** job record — in every status, `Queued`, parked and in-flight included —
with its history timeline, approval evidence and parsed payment lines, and **every file those jobs left
behind**: the input, the `processing/<jobid>/` folder, the `error/<jobid>/` folder, and the signed output
(or a vetoed file's `.reject` hand-back). It also deletes **every operational event** recorded before the
clear started. A confirmation dialog gates the action and spells out that it is irreversible, that
unfinished jobs go too and a job being worked on is abandoned, which files go, and what is left intact.
Cancelling or dismissing the dialog deletes nothing.

:::warning Changed in 2.9.0 and 2.10.0 — Clear Jobs takes everything
Until 2.9.0, Clear Jobs deleted only finished job records, skipped `Queued`, parked and in-flight jobs,
and left files and operational events alone. It now deletes every job whatever its status — under
`Cluster:Enabled`, a sibling's running job too — and the files those jobs left behind (2.9.0), and every
operational event recorded before the clear (2.10.0). The result no longer reports a *skipped* count.
:::

On confirm, files are removed first and rows second, so an unreachable storage fails the clear before any
record is gone. Nothing is forced: a file that is locked or a folder that refuses deletion is left in
place, counted, and named in a warning log line, and its row still goes. It then writes one `JobsCleared`
audit event as the record of the cut — actor, and how many jobs, files, folders and operational events
were deleted, plus how many items could not be — moves the deployment-wide
[statistics](statistics.md#resetting-the-panel) reset marker inside the same transaction, and refreshes
the page. The result message reports every count, as a warning when something could not be deleted and
as information rather than success when there was nothing to delete.

**The clear runs to completion even if you leave the page** (2.11.1). It can take several storage round
trips per job, so an operator who confirms and then navigates to `/jobs` to watch the table empty no
longer cancels it; only a service stop interrupts it, and that interruption is logged.

Untouched by Clear Jobs: pipeline state, signing profiles, configuration, and log files. The Prometheus
counters at `/api/metrics` are also unaffected — they are monotonic.

:::warning
There is no undo. If you need the job history or the audit trail, back up the operational store first —
`db/bulksigner.db` under SQLite, or your DBMS regime's backup under SQL Server. See
[Retention](retention.md#backup-discipline). **Export to Excel** on the Jobs page gives a job-level list,
but not the timelines or the operational events. To remove one job rather than all of them, use
[Delete on the Jobs page](#deleting-a-job).
:::

See [Operations](operations.md#clear-jobs).

## `/events` — Operational events

The host-wide audit trail (2.13.0): every operational event the product records — pipeline pause and
resume, profile creation and edits, approval decisions, rejections and expiry, hand-backs, input
divergence, cluster takeovers, Lacuna Signer dispatch and refusal, CNAB240 validation failures and
skipped payment-date checks, job deletions, Clear Jobs, approver enrolment and reset, service shutdown.

| Aspect | Behaviour |
|--------|-----------|
| Access | Every operator, an Entra `Administrator` included. **Never** an approver — several messages name approvers, pools and profile changes. |
| Order | Newest first, 50 per page, with **Prev** / **Next** and an *x–y of n* count. Each time is shown in the host's local time **with its offset**, so an event near midnight is legible against the UTC-day filters. |
| Filters | **Event type** — a multi-select of the types actually present in the store. **Message contains** — a literal substring (`%` and `_` are not wildcards). **From** / **To** — whole UTC days, inclusive, as on the Jobs page; a start after the end says so rather than showing an empty table. |
| Messages | Exactly as recorded, in **English** whatever the display language — persisted audit text is evidence. |
| Refresh | Manual only, via the **Refresh** button: auto-refresh under a reader paging back through history would shift the rows beneath them. |
| Writes | None. Nothing on this page deletes, edits or exports an event. The one thing that removes events is **Clear Jobs** on `/system`. |
| Cluster mode | The table is shared, so every instance shows the same rows. |

The same log is available over REST as `GET /api/events` and `GET /api/events/types` — see
[REST API](rest-api.md#events).

## `/backup` — Database backup

Where an operator answers one question — "are my backups working?" — and takes one on demand. **The nav
link is present on every deployment**, including SQL Server ones: a deployment where backup does not
apply needs somewhere to read *why*. The page renders in one of three shapes:

| When | What it shows |
|------|---------------|
| `Database:Provider = SqlServer` | An informational alert and nothing else: the store is in your own database, under your own backup, HA and DR rules. `Backup:Enabled = true` under `SqlServer` refuses the boot. |
| `Sqlite`, `Backup:Enabled = false` | An alert saying what to switch on, plus the settings that *would* apply. No action buttons. |
| `Sqlite`, enabled | The full page, below. |

| Element | What it does |
|---------|--------------|
| Destination summary | The configured `Backup:Destination` (`Disk`, `S3` or `AzureBlob`) and where artifacts land. A destination that cannot be reached gets a warning alert with the reason; it is probed when the page opens and on refresh. |
| Back up now | Runs one backup immediately. Refuses with `backup.disabled` when the feature is off. |
| Cancel run | While a run is in flight, behind a confirmation dialog — a canceled run is not resumed; the next one starts from the beginning. |
| Schedule | The configured `Backup:IntervalHours`, or "manual only" when absent, plus when the next run is due — anchored on the last **successful** run, so a restart does not reset it and a failed run does not consume it. |
| History | Recent runs with their outcome, size and duration. |
| Retention | `Backup:RetainCount` and what will be pruned. The prune runs only after a successful store and cannot fail the run. |

There is deliberately no restore button: a restore is an operator action taken with the service stopped.
Every key, including each destination's credential shape, is in [Configuration](configuration.md#backup);
how it fits the wider picture is [Retention](retention.md#backup-discipline).

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
Present only when a signing profile carries an [approval rule](approvals.md).

| Aspect | Behaviour |
|--------|-----------|
| Auth | **None by default.** Anyone who can reach the URL can approve — or reject — as anyone in the job's frozen pool, with the warning stated on the page itself. If the visitor already holds an [approver-portal](#approvals--approver-portal) session or a Microsoft Entra `Approver` session, the page **recognises them**: it names them instead of offering the picker, records the stronger identification method, and shows the identifiers unmasked. |
| Decisions | **Approve** or **Reject**, with an optional shared reason field. Rejecting takes a confirming second click. One rejection stops the job whatever the quorum says. |
| Shows | File name, grand total, payment count, cancellation count, payment-date range, payer, the frozen pool with each member's decision, progress toward the quorum, the wait budget, and the content hash. |
| Payment date passed | When the pending file's earliest payment date is before today, a warning says so — and whether the profile will refuse the file at signature (it needs re-exporting with current dates) or sign it anyway. |
| Individual payments | The **same** payment table the operator's job page renders, paginated. Which disclosure applies follows the *reader*, not the page: an anonymous visitor sees CPF/CNPJ reduced to its check digits and the account to its last digits, both captioned *(partial)*; an identified one sees them whole. Absent once the job is terminal, because the line detail is purged at that transition. |
| Not offered | **No raw file download**, on any approval surface. |
| Retry context | When the job is a retry of a previously approved one: who approved the parent, and whether the file is byte-for-byte identical. Those approvals do **not** count toward this job's quorum. |
| Not found | A job that does not exist and a job that never parked render the same message, so a guessed id reveals nothing. |

**On a job whose frozen signer set includes the approvers**, the page splits by reader: an identified
reader gets **Sign and approve** — the same certificate step the portal opens — and an unidentified
reader gets the page read-only, with a button to the approver portal. With the approver second factor
on, an unidentified reader likewise gets the page read-only. Reject is unchanged. See
[Approvals](approvals.md).

Full walkthrough: [Approvals](approvals.md).

## `/approvals` — Approver portal

One approver's queue, reached through their own durable link or a Microsoft Entra `Approver` sign-in.
Like `/approve/{id}` it renders on the bare layout. Off unless `ApproverPortal:Enabled` — see
[Configuration](configuration.md#approverportal).

| Aspect | Behaviour |
|--------|-----------|
| Auth | An **approver session**, on its own cookie scheme. Not the operator cookie and not the API key. Because it carries an authorization policy, `/approvals` is **not** an anonymous route — which is what makes an index of pending approvals permissible at all. A **Sign out** beside the approver's name ends the session; a session held on the link alone lands on the page that names the way back in. |
| Getting in | `/approvals/link/{token}` — the durable link, anonymous because it is how a credential is obtained. It validates, sets the cookie, and redirects; from then on the approver bookmarks `/approvals`. An unresolvable token and an absent one land on the same page, which says nothing about why. |
| Tabs | **Needs you**, **Waiting on others**, **Decided** — cut by *your decision*, not job status. The first two are both `AwaitingApproval`. |
| Scope | Only jobs whose **frozen pool** names you. |
| Each row | One line: file name, status, grand total, payment and exclusão counts, the quorum tally, when it parked, the decide-by deadline — plus one risk signal, the **largest single payment**, where an extra zero shows. The payer appears only when the list holds more than one distinct payer. A row whose frozen signer set includes the approvers carries a **Signature required** chip. |
| Approving | One click from the row. Ticked rows on **Needs you** can be approved as one batch from the toolbar; every ticked file is attempted whatever the ones before it returned, and the result names each file that did not go through and why. |
| Signing | On a *Signature required* row the control reads **Sign and approve**: the approver signs with their own certificate — in the browser through Lacuna Web PKI, or held by a cloud provider through Lacuna CloudHub where `CloudHub:ApiKey` is set — and only certificates carrying the CPF the frozen pool records for them are offered. A batch may mix both kinds of file. See [Approvals](approvals.md). |
| Rejecting | On the row, behind a **modal dialog** carrying the irreversibility warning and an optional reason — the row button only asks. **There is no bulk reject**, here or anywhere. |
| Who gets paid | Expands the row in place to the payment table, identifiers **whole** — the reader is a specific person rather than whoever holds a forwarded URL. |
| Decided reach | Bounded by `ApproverPortal:DecidedLookback` (90 days by default) and capped at 200 rows. When the cap bites the page says so. |
| Export | **Export to Excel**, in the same place on every tab, disabled rather than hidden when the tab is empty. Downloads the whole tab, not the ticked rows. **Job-level: one row per payment file, never one per beneficiary.** A title block above the table names the reader, the moment and the list, and on **Decided** its lookback window and whether the cap bit. |
| Not offered | No raw file download. No route to a job outside your pools. |

Where operators get the links: the **System** page, one per approver in a pool. Never the job page.

## Audit-trail conventions

Every action records:

| Action | Where it lands |
|--------|----------------|
| Pause / resume | A system event + the pause reason |
| Cancel | A history entry on the canceled job |
| Retry | A history entry on the parent + an initial history entry on the child |
| Rescan | A system event summarizing the result |
| Delete a job | A `JobDeleted` system event naming what was removed and kept, the reason if given, and a summary of any approvals |
| Clear Jobs | A `JobsCleared` system event recording the actor and how many jobs, files, folders and operational events were deleted (and how many items could not be) — the first event of the trail after the clear |
| Create a profile | A system event naming the actor, the format, the certificate source or signing method, and whether verification is on |
| Edit a profile's behaviour | A `SigningProfileEdited` system event: actor, profile, and each changed field with the values it moved between (a folder by name, e.g. `InputFolder (none) → remessas`) |
| Edit a profile's certificate | A `SigningProfileCertificateEdited` system event: actor, profile, the names of the fields that moved, and that the change takes effect on restart — never a value |
| Edit a profile's approval rule | A `SigningProfileApprovalEdited` system event: actor, profile, the quorum and wait budget it moved between, and how many approvers were added, removed and amended — counts, never a roster |

Messages follow consistent formats, e.g. `"Pipeline paused by operator. Reason: Quarterly
maintenance."` and `"Operator canceled: still investigating."`. All of them are readable on
[`/events`](#events--operational-events).

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
