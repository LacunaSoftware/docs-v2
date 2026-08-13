---
sidebar_label: "Approvals"
sidebar_position: 14
---

# Approvals

Some payment files should not be signed until a person has looked at them. A signing profile can
require that: a job routed through it stops before the signer, parks in `AwaitingApproval`, and waits
until enough people from a fixed list have approved. Then it signs.

:::danger Read this first
The per-job approval page is **not authenticated**. Anyone who can open a job's approval link can
approve — or reject — as anyone in that job's pool. That is a deliberate design decision for this
version, not an oversight, and it changes how you must handle the link. See [Security](#security).

The optional [approver portal](#the-approver-portal) and
[Microsoft Entra ID sign-in](#signing-in-with-microsoft-entra-id) both narrow this considerably.
:::

## Turning it on

Add an `Approval` block to a signing profile. It requires
[`CheckCNAB240: true`](cnab240.md) on the same profile — an approver who cannot be shown the amount is
not approving anything meaningful, so the parse is a precondition rather than a recommendation.

```json
{
  "Signing": {
    "Profiles": [
      {
        "Name": "pagamentos-bb",
        "Format": "Cades",
        "Method": "Local",
        "CheckCNAB240": true,
        "Certificate": {
          "Source": "Pfx",
          "Pfx": { "Path": "/etc/bulksigner/pagamentos.pfx", "Password": "" }
        },
        "Approval": {
          "MinimumApprovers": 2,
          "ExpiresAfter": "2.00:00:00",
          "Approvers": [
            { "Name": "Maria Silva", "Email": "maria@empresa.com.br", "Cpf": "123.456.789-09" },
            { "Name": "João Souza",  "Email": "joao@empresa.com.br",  "Cpf": "111.444.777-35" },
            { "Name": "Ana Costa",   "Email": "ana@empresa.com.br",   "Cpf": "529.982.247-25" }
          ]
        }
      }
    ]
  }
}
```

**`Approvers` is a pool, not a checklist.** With three entries and `MinimumApprovers: 2`, any two of
the three satisfy the job; no individual is required.

:::warning Write `ExpiresAfter` with its days component
`"2.00:00:00"` is the forty-eight-hour window above. A three-component value is `hh:mm:ss` only while
the first number is 23 or less; at 24 and above .NET reads that number as **days**, so `"48:00:00"` is
forty-eight *days*. The validator does not refuse it — a long window may be deliberate — but the
**startup banner warns at or above 24 days**, naming the resolved figure and the spelling that fixes
it:

```
  pagamentos-bb   Cades · cert=Pfx · verify=on · encrypt=off · validate-cert=on · cnab240=on · approval=2/3 · expires=1152h

WARN  Profile 'pagamentos-bb' has an approval wait budget of 1152h (48 days) …
      Forty-eight hours is "2.00:00:00". Ignore this if the long window is deliberate.
```

Boot is the only moment this is catchable — every other surface shows the deadline once a job has
already parked under it. Read the banner after editing the value.
:::

Every key, its type and its default is in
[Configuration](configuration.md#signingprofilesapproval--the-approval-gate). Startup refuses, before
the first job runs: an `Approval` block without `CheckCNAB240`; an empty pool; a `MinimumApprovers`
below 1 or larger than the pool; a malformed email, or the same email twice; a CPF whose check digits
do not match; a non-positive `ExpiresAfter`. A half-configured authorisation rule is not a degraded
feature — it is a gate that looks closed and is not.

## The life of a parked job

1. **Parse.** The worker stages a copy of the file in `processing/<jobid>/`, parses it as a
   [CNAB240 remessa](cnab240.md), and records the total, the payment and cancellation counts, the
   payment-date range, the payer, and a SHA-256 of the exact bytes it read.
2. **Park.** The profile's approval rule — pool, quorum and wait budget — is **copied onto the job**
   and the job moves to `AwaitingApproval`. The worker's concurrency slot is released immediately, so
   a parked payroll costs nothing while it waits and a `MaxConcurrency = 1` deployment keeps working.
3. **Wait.** Approvers open the link and decide. Each gets exactly one decision.
4. **Release, or stop.** The moment the quorum is met the job returns to `Queued` and the pipeline is
   woken. A single rejection instead ends the job as `Canceled` — see
   [Rejection is a veto](#rejection-is-a-veto) — and so does the wait budget running out, if the
   profile set one.
5. **Sign.** The ordinary claim path picks it up, **resumes on the staged copy**, re-checks the
   payment dates and the content hash, and signs.

There is no background worker for any of this. Approval state lives in the same database the handler
writes to, so the instant the quorum is satisfied is known where it happens; the one thing driven by a
clock — expiry — rides the pipeline's existing poll loop.

### The wait budget

`ExpiresAfter` is optional and **absent by default**, in which case a parked job waits indefinitely.
Set it and a job nobody decides on inside the window is canceled:

- The reason recorded on the timeline is **`Approval window expired.`**, followed by how long it
  waited and how many approvals it had collected.
- The staged copy moves to `error/`, exactly as a rejection's and an operator's cancel do. The
  original stays in `input/` and the watcher will not auto-resurrect it.
- An `ApprovalExpired` operational event is recorded, and `bulksigner_approvals_expired_total{profile}`
  increments.
- **Approvals already recorded are kept.** So is the frozen rule. An expiry ends the waiting; it does
  not erase the part that happened.

The window is measured against the budget **frozen onto that job**, never the one currently in
`appsettings.json`, so shortening the value in configuration does not retroactively expire jobs people
are still deciding on. The check runs on the pipeline's poll loop, so a job is canceled within one
`Pipeline:PollIntervalSeconds` of its deadline rather than exactly on it.

Two properties worth knowing before you set it:

- **A pause does not extend it.** The budget is a wall-clock deadline, not a budget of pipeline
  uptime, so a pipeline paused across a window will expire the jobs whose windows closed during the
  pause.
- **A race is resolved in the humans' favour.** If a quorum is met, a rejection lands, or an operator
  cancels at the same moment the sweep runs, whoever got there first wins.

:::note Expiry is housekeeping, not a correctness control
What protects the money in a payment file that sat too long is the
[payment-date guard](cnab240.md#payment-dates-that-have-passed), which refuses to sign a remessa whose
payment dates have passed however the delay arose — including on a profile with no wait budget at all.
:::

### The frozen rule

When a job parks, the approver pool, the quorum and the wait budget are snapshotted onto the job and
**never re-read from configuration**. Editing `appsettings.json` and restarting does not change what a
parked job requires.

This is deliberate and load-bearing. Without it, dropping `MinimumApprovers` from 3 to 1 and
restarting would satisfy every parked job's quorum at once — configuration would be an authorisation
bypass. It would also make the audit trail lie: somebody who approved under "2 of 3" would afterwards
appear to have approved under "1 of 3".

## What the approver sees

The per-job page lives at `/approve/{jobId}` and shows:

| | |
|---|---|
| **File name** | as it arrived |
| **Grand total** | sum of inclusão records, in reais; exclusões are counted, never netted |
| **Payments** | number of inclusão records |
| **Cancellations** | number of exclusão records |
| **Payment dates** | earliest–latest, or a single date when the whole file pays out on one day |
| **Payer** | *Nome da Empresa* and *Número de Inscrição* from the Header do Arquivo |
| **Progress** | "1 of 2 approvals", who has decided, and who has not |
| **Content hash** | the SHA-256 the approval will be bound to |
| **Deadline** | when the request expires — shown only when the profile sets a wait budget |

Plus, when the job is a retry of a previously approved one, a line saying who approved the parent and
whether the file is byte-for-byte identical to what they saw. **Those approvals do not carry over** —
a retry needs its own.

An approver picks their address from the pool, optionally writes a reason, and clicks **Approve** or
**Reject**. Rejecting takes a second confirming click. A decision is final either way; changing one
means asking an operator to cancel the job and re-run it.

The picker is the anonymous path. A reader the server can already name — a portal-link session, or a
Microsoft Entra sign-in carrying the Approver role — is told who they are instead of being asked, and
their decision records the method that identified them.

### The individual payments

Under the figures, the same paginated payment table the operator's job page uses — every value-bearing
record in the file, one row each.

**A total alone is not an approval; it is a rubber stamp.** "R$ 1.240.000 across 312 payments, yes or
no" gives a human no way to spot the extra zero in a payroll lote, the beneficiary who appears twice,
or the account number that quietly changed since last month. Those are precisely the errors this gate
exists to catch, and every one of them is invisible in a grand total.

| Column | On the anonymous approval page | Why |
|--------|-------------------------------|-----|
| Record, lote, segment | in full | Where in the file this is, and what kind of payment |
| Name on the record | in full | **This is the decision.** A duplicated or unexpected beneficiary is only visible here |
| Payment date | in full | Part of the decision — a date nobody expected is a reason to reject |
| Amount | in full | The decision. Exclusão rows are labelled and struck through, and are not in the total |
| CPF / CNPJ | **check digits only** — `***.***.***-09` | Not needed to decide. Enough to tell two same-named people apart |
| Account | **last digits only** — `***149-4`, branch omitted | Not needed to decide. Enough to answer "has this account changed?" |

Masked columns are captioned *(partial)* — an unqualified "CPF" heading over a masked value reads as
the whole number, and an approver comparing it against a document would conclude the file is wrong.

**The masking rule follows the reader, not the page.** An approver the server can name — through a
portal link or an Entra sign-in — sees the identifiers whole, on this page and in their queue. The
reduction exists for the surface reachable by whoever holds a forwarded URL.

Some rows legitimately have neither identifier nor account: a boleto (segment J), a tribute (N) and a
concessionária payment (O) are paid against a barcode or to the government. Those cells show an
em-dash — an absence, not a mask. On a **tribute** line the name is the *taxpayer*, not the recipient,
and the page says so above the table.

:::note
The table is only there while the job is in flight. The line detail is purged at the transition into
any terminal status ([Retention](retention.md#the-one-exception-cnab240-line-detail)), so an approver
opening a link for a job that has already been decided sees the totals and a note saying the lines are
gone.
:::

### What the approval page deliberately does not offer

- **No raw file download**, on any approval surface. A rendered, paginated table is a bounded
  disclosure in service of one decision; the file itself is a complete machine-readable dump of every
  beneficiary's CPF and bank account. Raw bytes stay behind the authenticated operator surface
  (`GET /api/jobs/{id}/output`). Unmasking the table for an identified approver did not unlock the
  bytes.
- **No *anonymous* index of pending approvals.** No unauthenticated route lists jobs awaiting
  approval; the page is reachable only with a specific job id, and job ids are v4 GUIDs. The
  [approver portal](#the-approver-portal) *is* an index, but it carries an authorization policy and
  lists only the jobs whose frozen pool names the person reading it.

## The approver portal

One link per payment file, forwarded by an operator, works for one file and stops working for somebody
who approves forty a month. Turn on `ApproverPortal`
([Configuration](configuration.md#approverportal)) and each approver gets **one durable link
instead**, which opens their own queue at `/approvals`:

```json
{
  "ApproverPortal": {
    "Enabled": true,
    "LinkSecret": "…"
  }
}
```

In practice set `LinkSecret` via `ApproverPortal__LinkSecret` — 32 characters minimum, enforced at
startup. Then open the **System** dashboard page: every configured approver is listed with their
personal link. Send each person only their own, once — the link does not expire and does not change.

### What it shows

Three tabs, cut by **the approver's own decision** rather than by job status:

| Tab | Holds |
|-----|-------|
| **Needs you** | Parked files you have not decided about. Your actual work. |
| **Waiting on others** | Parked files you *have* decided about, still short of quorum. |
| **Decided** | Files you decided that have left the gate, within `DecidedLookback` (90 days by default). |

The first two are both `AwaitingApproval` — a job with one of three approvals is simultaneously
"pending" and "partially approved" — which is why the page is not cut on status.

Each row is one line: the file name, the grand total, the payment and exclusão counts, the tally, and
the decide-by deadline if the profile sets one. The payer appears only when the queue holds more than
one. Plus one figure chosen because it catches the error this gate exists for:

- **Largest single payment** — where an extra zero shows. A grand total is a number nobody holds a
  prior for; one payment an order of magnitude above its neighbours is visible at a glance.

**The tally chip is a link.** `1 of 2 approvals` tells you how many; clicking it opens the job's own
page in a new tab, which is the only place that answers *which* of you, when, and — on a rejection —
why. What an approver sees there is not the operator's view: only jobs their frozen pool names them
in, no approval link, no pool CPFs, and no Retry, Cancel or Download.

:::warning No duplicate detection
A comparison against the same payer's previous file was removed in favour of a queue that reads at a
glance, so **nothing in the product now flags a file resent twice**. The payment-date range came off
the row too, but that one was belt-and-braces over a machine check — the pipeline still refuses a
remessa whose payment dates have passed, on every profile.
:::

### Selecting what to act on

Each row on **Needs you** carries a checkbox, and a bar above the list totals what you have ticked.
The select-all box shows three states — none, some, all. The other two tabs have neither checkbox nor
bar.

The bar carries two figures: **Selected total** is the money; **Selected payments** is how many
payments those files come to, with any exclusões counted separately — *(+3 exclusão)* — never netted
off. An extra zero shows up in the amount; a file sent twice or cut off half way through shows up in
the count.

Ticking survives expanding and collapsing a row, and clears for any file that leaves the list while
you are looking at it.

**Files with no grand total are excluded from the sum** and disclosed beside it as a count — *2 files
have no total and are not in this figure* — rather than counted as zero. A profile can gate a job for
approval without checking CNAB240, so a parked file need not be a remessa. If every ticked file lacks
a total the figure is an em-dash, never `R$ 0,00`; a remessa of nothing but exclusões still shows
`R$ 0,00`.

### Approving a batch

**Approve N selected** acts on the ticked rows and on nothing else. There is no separate "approve all"
— ticking the header checkbox and pressing this button is what that means.

It confirms first, in a dialog that restates the count, the total, and the largest single file in the
batch. There is no undo behind it.

Then the approvals run one after another, and **every selected file is attempted** regardless of what
the ones before it returned. The report has two parts: an aggregate (*9 of 12 approved; 6 went on to
signing*), and **a list naming every file that did not go through, and why.**

Expect some. Each approval is an independent call, and a colleague may have acted while you were
reading — so *already decided*, *no longer awaiting approval — it is Canceled* (which is what a
colleague's rejection looks like from here), and *you are not in this file's approver pool* are all
ordinary outcomes. Files that were approved untick themselves; **files that failed stay ticked**, so
pressing the button again retries exactly those.

:::info There is no bulk reject
On this or any other surface. Rejecting is a judgement about one file's contents, and it destroys the
job irreversibly; N of those in one click is a different act with no reviewable subject.
:::

### Approving or rejecting one file

**Approve** is one click from the row. **Reject** is on the row too, but opens a modal dialog carrying
the irreversibility warning and an optional reason, and its **Yes, reject** is the act — the button on
the row only asks. An approval releases a file the pipeline will still content-check; a rejection
destroys the job irreversibly, and from a list of near-identical rows a misplaced click cancels the
wrong payroll.

**Who gets paid** expands the row into the payment table, with identifiers whole.

### Taking a list with you

Every tab carries an **Export to Excel** button, in the same place on all three, disabled rather than
hidden when the tab is empty. It downloads the tab you are on as an `.xlsx` workbook: one row per
payment **file**, never one per beneficiary.

It exports **the whole tab**, not your ticked rows — the tick marks belong to
[approving a batch](#approving-a-batch) and exist on *Needs you* alone.

| Tab | What the export is for |
|-----|------------------------|
| **Needs you** | Planning a morning's approvals before you start clicking |
| **Waiting on others** | Chasing the colleagues holding up files you already decided |
| **Decided** | Answering "what did I approve last month" without asking an operator |

Above the table, the workbook states who generated it, at what moment, from which list, and which
clock the timestamps are on. **On the Decided export it also states its two bounds** — the lookback
window it covers, and, when the 200-row cap bit, that the list was cut short. The decided list is a
window, never a complete history, and a truncated list circulated as a complete one is how somebody
concludes a file they approved was never sent.

Practical notes:

- **Money and counts are real numbers**, so they sum, filter and pivot. A file with no CNAB240 total
  leaves those cells **empty** rather than `0`.
- **The payer's CPF/CNPJ is text**, punctuated, so leading zeros survive. Dates are real date cells.
- **The contents are in your display language; the file name is not.** It is an accent-free slug with
  an ISO date — `approvals-needs-you-2026-08-12.xlsx`.
- **Nothing changes when you export.** No job moves and no decision is recorded. The service logs one
  line saying you did.
- **No payment line reaches the workbook.** No beneficiary name, tax id, branch or account; the only
  identification document on the sheet is the payer's.

### The link is a password

There is no account and no password behind the portal. **Anyone holding an approver's link is that
approver**, as far as the product can tell.

- **Send each link privately, to one person.** A forwarded link is a delegated approval.
- **To revoke one person**, remove them from every profile's `Approvers`. Their link stops working
  immediately. Jobs already parked with them in the pool keep their entry — the frozen rule does not
  move.
- **To revoke everybody**, change `ApproverPortal:LinkSecret`. Every link breaks at once.

Decisions made through the portal record `LinkDerivedEmail` rather than `SelfDeclaredEmail`. That is
stronger in the way that matters most in practice — the person deciding **could not have named
somebody else**, because the portal never offers the choice — and it is still not authentication.

## Signing in with Microsoft Entra ID

When the deployment enables the optional [Entra sign-in](installation.md#microsoft-entra-id-sign-in-optional),
an approver with the **Approver app role** reaches the same portal by signing in with their Microsoft
account — no link needed.

- **The role opens the door; the pool still scopes the jobs.** Which payment files the person sees and
  may decide remains the frozen pool, matched by the **email their directory asserts**. An Entra
  Approver whose address is in no pool sees an empty portal; an account whose token carries no email
  claim is refused outright.
- **Decisions record `EntraIdEmail`** — the first identification method that is *authentication*: the
  directory verified who was present, where a link only narrows who could have been impersonated. When
  one person holds both a link session and an Entra session, the stronger method is recorded.
- **Links coexist, deliberately.** Pools name arbitrary emails, and a client's finance manager need
  hold no account in the deployment's tenant.
- **The per-job page recognises them too.** An Entra-signed-in Approver opening `/approve/{jobId}` is
  named instead of asked, and shown the beneficiary identifiers whole when the job's frozen pool
  includes their email. An **Administrator-only** sign-in gets none of this — the page treats them as
  anonymous, because recognising an operator there would be operator-on-behalf-of approval.

## Rejection is a veto

**One rejection stops the job, whatever the quorum arithmetic says.** A pool of three with a quorum of
one still stops when one person rejects, even though two people who have not decided could each have
released it on their own.

This is not how a vote works, and deliberately so. A rejection is not a withheld vote to be made up by
others — it is a person asserting that the file is wrong, and a quorum does not get to outvote that.

So a vetoed job reports its approval count honestly — "2 of 2 approvals — **rejected**" is not a
contradiction, it is what happened — but it never proceeds.

### What happens to the job

It becomes **`Canceled`**, not `Failed`:

- The staged copy moves to `error/`, preserving the exact bytes that were rejected.
- The original **stays in `input/`**, and the watcher will not auto-resurrect it.
- **Retry does not apply.** Retry only accepts `Failed`. A rejected file comes back only through a
  deliberate rescan or re-upload — finance corrects it and re-submits.

Rejections are told apart from operator cancellations by the audit trail, not by the status: the job's
timeline names the rejecting approver and their reason, and an `ApprovalRejected` operational event is
recorded.

### The narrow race, and what covers it

| Where the job is | What stops it |
|------------------|---------------|
| Still parked in `AwaitingApproval` | the rejection cancels it directly |
| Released to `Queued` but not yet claimed | the same cancel — its status guard covers `Queued` too |
| Already claimed by a worker (`Processing`) | the pipeline's own pre-sign veto check refuses to sign it |

On the third path the job ends as **`Failed`** with `approval.rejected` rather than `Canceled`, since
`Processing` has no legal transition to `Canceled`. Both outcomes leave the file unsigned, which is
the property that matters.

A rejection that arrives after the signature has been computed cannot un-compute it. Nothing short of
holding a lock across somebody's deliberation would close that.

## What is approved

**Bytes, not a job id.**

The copy staged at parse time is the canonical artifact for the whole approval window. The input file
is never re-read **as the artifact to be signed**, and the parse never runs a second time — so a file
changed in `input/` during the wait cannot take the place of the one that was approved.

Immediately before signing, the staged bytes are re-hashed and compared against the hash recorded at
parse. A mismatch fails the job hard with `approval.content-changed`: never a silent re-parse, never a
proceed. The check runs on the local sign path and the remote-signer upload path alike.

The input file *is* read once more, but only after the signature exists and only to answer a different
question: is this still the file that was staged, and may it therefore be deleted? See
[Operations](operations.md#when-an-input-file-changes-mid-job).

**If the staged copy disappears** the job fails. There is no honest way to continue — rebuilding it
from `input/` would sign something nobody approved. Retry the job; a retry is a new job, and it parks
again.

**If the service restarts mid-wait** nothing happens, which is the point. Startup recovery
deliberately skips `AwaitingApproval`: a parked job is not "in progress at last shutdown", it is a job
waiting on a person. The row and the staged copy both survive.

## Cancelling a parked job

`POST /api/jobs/{id}/cancel`, or the Cancel button on the job page. A parked job is cancelable
precisely because nothing is holding it. The staged copy moves to `error/` and the file stays in
`input/`; the watcher honours the cancel and will not auto-resurrect it.

## Security

### The approval link is a capability

It confers the power to release a payment file for signature — **and to stop one** — and it checks
nothing about who is using it.

- **Send it only to the people in the pool**, and only through a channel you would use for the payment
  file itself.
- **Do not forward it, and tell approvers not to.** One forwarded link is enough for one person to
  satisfy a multi-person quorum, because all they need is two addresses from the list.
- **Do not put the service on a network the approvers' browsers can reach if you cannot accept that.**
  Distribute the figures another way and cancel/re-run instead.

Rejection is the gentler half of that capability: whoever holds the link can also stop a legitimate
payment file, and the remedy — correct and re-submit — is an inconvenience rather than a loss. It is
still an unauthenticated denial of service against a specific payroll.

Job ids are v4 GUIDs, so the URL is not guessable in practice, and the route has its own rate-limit
budget (`RateLimiting:Approval`, ten requests per minute per address by default).

Refusals are deliberately coarse: an address that is well-formed but not in the pool and an address
that is not an address at all both return `approval.unknown-approver`.

### What every approval records

| Field | Meaning |
|-------|---------|
| `ApproverEmail` | normalized (trimmed, lower-cased); unique per job, enforced by a database index |
| `ApproverName`, `ApproverCpf` | copied from the **frozen pool**, never from the request |
| `Decision` | `Approved` or `Rejected` |
| `Reason` | free text the decider typed, or null; repeated in the job's timeline |
| `IdentificationMethod` | `SelfDeclaredEmail` on the anonymous page, `LinkDerivedEmail` through a portal-link session, `EntraIdEmail` through a Microsoft Entra sign-in |
| `ContentSha256` | the bytes this decision is about |
| `DecidedAt` | UTC |
| `IpAddress` | the connection's remote address, or null. **Behind a reverse proxy this is the proxy** unless forwarded headers are configured |
| `UserAgent` | verbatim, truncated to 512 characters, or null |

`IdentificationMethod` exists so that as stronger identification arrives, earlier approvals stay
visibly what they were in the same table rather than being retroactively blessed. Members are added,
never repurposed, and no row is ever migrated onto a new value.

Approvals recorded from the dashboard or the portal carry no IP or user agent: those paths run over
the Blazor circuit, where there is no HTTP request to read them from. The REST route records both.

### Personal data

The pool holds a name, an email and a CPF per approver, and every approval row copies them. The CPF is
**display and audit only**: validated for check digits at boot, normalized to eleven bare digits, and
nothing branches on it.

`Cpf` is in the structured-property redaction allowlist, so it cannot reach a durable log. Approver
addresses are masked (`m***@empresa.com.br`) in console narration and operational events; the full
addresses live in the frozen snapshot and the approval rows. See [Security](security.md).

### Retention

Approval rows and the frozen rule are **never purged**, including when the job reaches a terminal
status. Who authorised a payment, and under what rule, is exactly what an audit asks for after the
fact. This is the deliberate opposite of the CNAB240 line detail, which *is* purged at terminal status
— see [Retention](retention.md).

## REST

Deciding is one anonymous route:

```bash
curl -X POST http://localhost:8080/api/approvals/3f2a…/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"maria@empresa.com.br"}'
```

```json
{
  "jobId": "3f2a…",
  "approverName": "Maria Silva",
  "approved": 2,
  "required": 2,
  "outstanding": 0,
  "quorumMet": true,
  "released": true
}
```

To reject, add `decision` (and optionally `reason`):

```bash
curl -X POST http://localhost:8080/api/approvals/3f2a…/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"maria@empresa.com.br","decision":"rejected","reason":"valor errado no lote 2"}'
```

```json
{
  "jobId": "3f2a…",
  "approverName": "Maria Silva",
  "reason": "valor errado no lote 2",
  "terminated": true
}
```

`decision` accepts `approved` or `rejected`, case-insensitively. **Omitting it means `approved`** — a
client written before rejection existed keeps working unchanged. Anything else is refused rather than
interpreted: `"reject"` — plausible, wrong, one letter away — must not resolve to either.

A rejection returns **200**, not a 4xx. It is what the caller asked for and it succeeded.
`terminated` is false only in the narrow race where a worker had already claimed the job.

Refusals carry a stable `code`:

| Code | Status | Meaning |
|------|--------|---------|
| `job.not-found` | 404 | no job with that id |
| `approval.not-pending` | 409 | the job accepts no decision in its current status |
| `approval.unknown-approver` | 403 | the address is not in the job's frozen pool (also returned for a malformed address, deliberately) |
| `approval.already-decided` | 409 | this approver has decided; decisions are final |
| `approval.unknown-decision` | 400 | `decision` was neither `approved` nor `rejected` |
| `validation.reason-too-long` | 400 | `reason` exceeds 512 characters. Refused rather than truncated |
| `approval.job-incomplete` | 500 | the job is parked but its frozen rule or content hash is missing |

### Reading the state from another system

*Reading* is two authenticated routes, for compliance reporting, an external dashboard, or a monitor
watching for jobs parked longer than some threshold:

- `GET /api/jobs/{id}` carries an `approval` summary — the frozen quorum, the pool size, how many
  people have approved and rejected, `vetoed`, `parkedSince` and the expiry deadline if the rule set
  one. `null` on any job that never parked. Branch on `vetoed`, not on arithmetic of your own:
  `quorumReached` can be `true` on a job a veto has already stopped.
- `GET /api/jobs/{id}/approvals` returns the frozen pool with each member's decision, and the decision
  list. CPF is masked to its check digits on both. `404` with `approval.not-required` on a job that
  never parked — a distinct answer from a parked job nobody has decided on, which is `200` with an
  empty list.

Every figure comes from the rule frozen onto the job, never from `appsettings.json`.

:::info There is no REST approve endpoint
Behind the API key it would be worse than the anonymous page: the key sits in an ERP's configuration,
a deploy pipeline and a production settings file, so it would become an approve-anything credential
for everyone holding any of those. Anonymous it would be a scriptable bulk-approve loop over every
parked job. The actor this gate exists for is a person reading a payment breakdown, not an
integration.
:::

## Metrics

| Metric | Type | Labels | Meaning |
|--------|------|--------|---------|
| `bulksigner_jobs_awaiting_approval` | gauge | — | jobs currently parked; set from a scan, so it is right after a restart |
| `bulksigner_jobs_parked_for_approval_total` | counter | `profile` | jobs that parked |
| `bulksigner_approvals_recorded_total` | counter | `profile` | decisions recorded, one per person per job — approvals **and** rejections |
| `bulksigner_approvals_rejected_total` | counter | `profile` | the rejection subset. Deliberately separate from `bulksigner_jobs_canceled_total`, which counts what an *operator* did |
| `bulksigner_jobs_released_by_approval_total` | counter | `profile` | parked jobs whose quorum was met |
| `bulksigner_approvals_expired_total` | counter | `profile` | parked jobs canceled because their frozen wait budget elapsed. The one series that counts *nobody* acting — the one to alert on |
| `bulksigner_jobs_content_changed_total` | counter | `profile` | pre-sign content-binding failures. **Should be flat at zero forever** |

An *expiry* rate that climbs usually says something about your distribution of the approval link — the
product sends no mail, so a lapsed window generally means the link never reached anybody.

## Statistics

Approval waits are excluded from the pipeline's elapsed-time statistics, the same way the
`AwaitingSigner` wait is. An approval wait is measured in hours of somebody's attention, and folding
it into the queue/sign/verify averages would swamp every number with a quantity the pipeline neither
caused nor can improve.

Concretely: parking discards the job's in-flight timing entry, and a released job opens a fresh one
whose queue wait is measured from the moment it re-entered the queue. See
[Job statistics](statistics.md).

## Troubleshooting

**A job is parked and nobody can approve it.** Check the pool on the job page: it is the pool frozen at
park time, not the one in your configuration file. If the people listed are wrong, cancel the job, fix
the profile, and re-run the file.

**An approver gets "not an approver for this job".** Their address is not in the frozen pool. Compare
it against the pool shown on the job page — leading/trailing spaces and capitalisation do not matter,
anything else does.

**A released job failed with `approval.content-changed`.** The staged copy in `processing/<jobid>/` was
modified after the approvers saw it. The job's folder is now under `error/`. Do not re-sign it — find
out what wrote to `processing/`, then re-run the original file from `input/` so it is parsed, totalled
and approved afresh.

**A job says "2 of 2 approvals — rejected".** Both readings are true. The count is the arithmetic and
the outcome is the veto. The timeline names the rejecting approver and their reason.

**A job failed with `approval.rejected` instead of being cancelled.** The rejection landed after a
worker had already claimed the job, so the pipeline refused the signature rather than the approval
handler cancelling it. The file is unsigned, which is the point.

**A job was canceled with "Approval window expired."** Nobody decided inside the profile's
`ExpiresAfter` window. The staged copy is under `error/<jobid>/`, the original is still in `input/`,
and any approvals that *were* recorded are still on the job page. Retry does not apply — re-run the
file through Rescan or Upload. If windows keep lapsing, either the link is not reaching people or the
budget is shorter than your approvers' working rhythm.

**A parked job expired while the pipeline was paused.** Expected — see
[The wait budget](#the-wait-budget).

**An approver wants to undo a rejection.** They cannot, and neither can an operator. A decision is
immutable. Re-submit the file; the new job parks and the pool is asked again.

More failure modes in [Troubleshooting](troubleshooting.md).

---

**Next:** [Retention](retention.md). **Previous:** [CNAB240 payment files](cnab240.md).
