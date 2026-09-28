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
[Microsoft Entra ID sign-in](#signing-in-with-microsoft-entra-id) both narrow this considerably, and
the [second factor](#proving-it-is-you) and a [signer set in which the approvers sign](#the-signer-set)
each take the decision away from an unidentified reader altogether.
:::

## Turning it on

Add an `Approval` block to a signing profile. It requires
[`CheckCNAB240: true`](cnab240.md) on the same profile — an approver who cannot be shown the amount is
not approving anything meaningful, so the parse is a precondition rather than a recommendation. The
pairing is refused from both sides of the profile page: **Edit approval** refuses a rule on a profile
whose check is off, and **Edit behaviour** refuses turning the check off while a rule stands, naming the
remedy — remove the rule first. A job that reaches the gate without the parse anyway, on a profile
stored before that second refusal existed, fails by name (`approval.content-unmeasured`) rather than
parking as a job no approver could ever decide.

:::warning Changed in 2.1.0 — on a running deployment the rule is edited from the profile page
Signing profiles live in the operational store, and `Signing:Profiles[]` is a one-time seed imported on
the first boot. On a deployment that has already booted once, the JSON below is **inert**: it describes
the shape of a *first* boot. Afterwards the rule is edited from **Edit approval** on
`/profiles/{name}` — the pool (add, remove and edit members), the quorum and the wait budget, with the
same refusals and no restart — and the gate can be added to or removed from a profile there too. A
profile whose approvers sign, and which therefore holds no key of its own, is **created with its rule**
from `/profiles/_new` by choosing **None — the approvers sign** as its signing method. Everything this
page says about what a rule *means* holds on every surface; what differs is where you type it.

A change saved there reaches the next file that parks. Jobs already parked keep the rule they froze —
see [The frozen rule](#the-frozen-rule).
:::

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
          "Signers": "ProfileKey",
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

### The signer set

:::tip New in 2.1.0 — approvers can sign the payment file themselves
Up to 2.0.x an approval was always a click, and the profile's own certificate signed the file. The
signer set lets the approvers co-sign it with their own ICP-Brasil certificates instead of, or as well
as, the profile key.
:::

`Signers` says **whose signatures the delivered file carries**. One of three values, and there is no
fourth:

| Value | Who signs the delivered file | What an approval is |
|---|---|---|
| `ProfileKey` | The profile's own certificate, as every profile did before the value existed. The default, and what every existing profile and every job parked before the value existed reads as. | A click — on the portal, the per-job page or the anonymous route. |
| `Approvers` | Each approving pool member's own ICP-Brasil certificate, and the profile's **not at all**. Such a profile is **keyless**: it holds no certificate, nothing is opened for it at startup, and it is not degraded for lacking one. It can be created as such, pool and all, from `/profiles/_new` — no certificate is asked for — and it needs the `Cades` format, since an approver's signature is a CAdES co-signature. | A signature — see [Approving by signing](#approving-by-signing). |
| `ProfileKeyAndApprovers` | Both: the approvers sign while the job waits, and the profile key co-signs what they signed once the job is released. Refused alongside `Method: LacunaSigner`, where the remote signer would be handed an envelope rather than a remessa. | A signature. |

It is one value rather than two switches so that "nobody signs" cannot be written, and it lives under
`Approval` because two of its three values mean nothing without a pool. Like the pool, the quorum and
the wait budget it is **frozen whole onto the job** the moment it parks: an approver signing a file is
making a statement about a known final shape, and switching the profile key off underneath them would
turn "we co-signed with the company" into "we alone signed" — see [The frozen rule](#the-frozen-rule).

Choosing either set with approvers in it is a save-time rule, never a boot refusal. It needs:

- **a signature means** — a [`WebPki:License`](configuration.md#webpki--lacuna-web-pki-in-the-approvers-browser)
  for a certificate in the approver's browser, or a
  [`CloudHub:ApiKey`](configuration.md#cloudhub--lacuna-cloudhub-for-cloud-certificates) for one in
  the cloud; either is enough;
- **a way to identify an approver** — `ApproverPortal:Enabled`, or an `Auth:EntraId` section, the only
  two credentials a signature is recorded for;
- **`CheckCNAB240`**, like any approval rule, and the **`Cades`** format.

Each approver then needs a certificate of their own, described in
[Certificates](certificates.md#the-approvers-certificate). The value is seeded from `Signers` above or,
after the first boot, chosen on the profile page's approval form, where crossing into a set with
approvers in it is confirmed past a warning — see the end of [Approving by signing](#approving-by-signing).

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

The banner is where this is catchable in configuration — every other read-only surface shows the
deadline once a job has already parked under it. Read the banner after editing the value.

**The profile page sidesteps the spelling entirely**: its wait budget is a number of hours, which cannot
be read two ways, and a budget already stored under the mistake shows there as the 1,152 hours it really
is. It asks before saving one at or beyond the same 24-day threshold.
:::

Every key, its type and its default is in
[Configuration](configuration.md#signingprofilesapproval--the-approval-gate). Startup refuses a seed,
before the first job runs, with: an `Approval` block without `CheckCNAB240`; an empty pool; a
`MinimumApprovers` below 1 or larger than the pool; a malformed email, or the same email twice; a CPF
whose check digits do not match; a non-positive `ExpiresAfter`. **Edit approval** refuses the same
shapes at save time — plus a blank name — naming the row they are about, in your display language, and
writes nothing. A half-configured authorisation rule is not a degraded feature — it is a gate that looks
closed and is not.

## The life of a parked job

1. **Parse.** The worker stages a copy of the file in `processing/<jobid>/`, parses it as a
   [CNAB240 remessa](cnab240.md), and records the total, the payment and cancellation counts, the
   payment-date range, the payer, and a SHA-256 of the exact bytes it read.
2. **Park.** The profile's approval rule — pool, quorum, wait budget and signer set — is **copied onto
   the job** and the job moves to `AwaitingApproval`. The worker's concurrency slot is released
   immediately, so a parked payroll costs nothing while it waits and a `MaxConcurrency = 1` deployment
   keeps working.
3. **Wait.** Approvers decide — from their portal queue, the per-job page, or the anonymous route. Each
   gets exactly one decision. On a profile whose approvers sign, each approval is a co-signature added
   to the file while it waits.
4. **Release, or stop.** The moment the quorum is met the job returns to `Queued` and the pipeline is
   woken. A single rejection instead ends the job as `Canceled` — see
   [Rejection is a veto](#rejection-is-a-veto) — and so does the wait budget running out, if the
   profile set one.
5. **Sign.** The ordinary claim path picks it up, **resumes on the staged copy**, re-checks the
   payment dates and the content hash, and signs — with the profile key, or by promoting the
   approvers' own signatures (with the profile key's beside them under `ProfileKeyAndApprovers`). The
   signed file is verified against exactly the signers the frozen set names.

There is no background worker for any of this. Approval state lives in the same database the handler
writes to, so the instant the quorum is satisfied is known where it happens; the one thing driven by a
clock — expiry — rides the pipeline's existing poll loop.

On the operator's side, `/jobs` has an **Approvals** column (new in 2.12.0) carrying one chip on every
`AwaitingApproval` row: how many approvals are still needed, *quorum met*, or *rejected* — read from
the rule frozen onto the job, never from the live profile. See [Dashboard](dashboard.md).

### The wait budget

`ExpiresAfter` is optional and **absent by default**, in which case a parked job waits indefinitely.
Set it and a job nobody decides on inside the window is canceled:

- The reason recorded on the timeline is **`Approval window expired.`**, followed by how long it
  waited and how many approvals it had collected.
- The staged copy moves to `error/`, exactly as an operator's cancel does — and **unlike a rejection**,
  which returns the file to `output/` instead. The difference is deliberate: a veto is a statement about
  the file, while an expiry is the product giving up on waiting. The original stays in `input/` and the
  watcher will not auto-resurrect it.
- An `ApprovalExpired` operational event is recorded, and `bulksigner_approvals_expired_total{profile}`
  increments.
- **Approvals already recorded are kept.** So is the frozen rule. An expiry ends the waiting; it does
  not erase the part that happened.

The window is measured against the budget **frozen onto that job**, never the one currently on the
profile, so shortening the value does not retroactively expire jobs people are still deciding on. The
check runs on the pipeline's poll loop, so a job is canceled within one `Pipeline:PollIntervalSeconds`
of its deadline rather than exactly on it.

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
A profile can turn that guard off (`CheckCnab240PaymentDates = false`, for a bank that processes
past-dated payments on the next business day — see [Turning the guard off](cnab240.md#turning-the-guard-off));
then nothing stands there but the approvers, which is why the approval page warns them when a date has
passed — see [What the approver sees](#what-the-approver-sees).
:::

### The frozen rule

When a job parks, the approver pool, the quorum, the wait budget and the [signer set](#the-signer-set)
are snapshotted onto the job and **never re-read from the profile**. Editing `appsettings.json` and
restarting does not change what a parked job requires — and neither does editing the rule from
`/profiles/{name}`, which is the same property meeting a faster surface.

This is deliberate and load-bearing. Without it, dropping `MinimumApprovers` from 3 to 1 would satisfy
every parked job's quorum at once — the profile page would be an authorisation bypass, and one that no
longer needs even a restart. It would also make the audit trail lie: somebody who approved under "2 of
3" would afterwards appear to have approved under "1 of 3". Likewise, somebody added to the pool today
cannot approve a file that parked yesterday.

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
| **Deadline** | when the request expires and the job is canceled unsigned — shown only when the profile sets a wait budget |

Plus, on a job still waiting whose earliest payment date is already before today, a **Payment date has
passed** warning (new in 2.15.0). Its wording follows the profile's payment-date guard as the profile
holds it *now* — the guard runs at the signature, not at the park, so it is read live rather than from
the frozen rule. With the guard on, the warning says the file will fail at signature even if approved
and needs re-exporting; with it off (or with CNAB240 itself off), that the file will be signed if
approved. A profile this instance does not hold yet — created on another instance within the last poll
— gets the date and no prediction. It changes nothing about whether a decision is accepted. See
[Turning the guard off](cnab240.md#turning-the-guard-off).

Plus, when the job is a retry of a previously approved one, a line saying who approved the parent and
whether the file is byte-for-byte identical to what they saw. **Those approvals do not carry over** —
a retry needs its own.

An approver picks their address from the pool, optionally writes a reason, and clicks **Approve** or
**Reject**. Rejecting takes a second confirming click. A decision is final either way; changing one
means asking an operator to cancel the job and re-run it.

The picker is the anonymous path. A reader the server can already name — a portal-link session, or a
Microsoft Entra sign-in carrying the Approver role — is told who they are instead of being asked, and
their decision records the method that identified them. On a job whose frozen signer set includes the
approvers, the picker is gone: an unidentified reader gets the page read-only, and an identified one
gets **Sign and approve** — see [Approving by signing](#approving-by-signing).

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
startup. Then open the **System** dashboard page: every approver in every profile's pool is listed with
their personal link. Send each person only their own, once — the link does not expire and does not
change.

The portal, the per-file page and the link-required page carry the product mark in their header — and,
when the deployment names a
[customer logo](configuration.md#branding--the-customers-logo-on-the-sign-in-and-approver-pages), that
logo beside it. An approver is usually the customer's own finance person, and the mark they recognise
is their employer's.

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
the decide-by deadline if the profile sets one. A row whose profile's [signer set](#the-signer-set)
includes the approvers carries a **Signature required** chip beside its status: its approval is a
co-signature with your own certificate, its button reads **Sign and approve**, and it carries a checkbox
like any other, so it may be part of a batch. The payer appears only when the queue holds more than
one. Plus one figure chosen because it catches the error this gate exists for:

- **Largest single payment** — where an extra zero shows. A grand total is a number nobody holds a
  prior for; one payment an order of magnitude above its neighbours is visible at a glance.

**The queue refreshes itself.** Every `ApproverPortal:PollInterval` — ten seconds by default — the page
re-reads your queue, so you do not have to reload it to find out whether a colleague has acted. The
header carries the proof: *Updated 4 seconds ago*, a spinner while it reads, and a refresh button for
when you want it now. If a read fails, **the queue you are looking at stays on screen** and the header
says the refresh failed and when it last succeeded; the decide buttons keep working, because a decision
is checked against the database when you make it regardless. The one exception is the very first load:
with no queue to keep, a failure there is an error message.

A refresh never happens part-way through a batch, or while the second-factor prompt is open. It **is**
free to run underneath the two confirmation dialogs, so if a colleague takes one of your selected files
to quorum while you are reading the restatement, that file leaves the batch before it runs: the
direction is always safe — a file that has moved is never acted on — but the count you confirmed can be
one tick out of date. The progress line counts the batch that actually ran.

**Sign out is in the header too**, beside your name. It ends this browser's session — the link session,
or the Microsoft sign-in — and nothing else: your link is untouched, and opening it again issues a new
session. Where you land says how to come back in: the *approval link required* page for a link, the
Microsoft sign-in for an Entra account. Use it on a shared machine: left alone, a link session lasts
`ApproverPortal:SessionLifetime` (30 days by default, sliding) and a Microsoft sign-in eight hours,
sliding.

**The tally chip is a link.** `1 of 2 approvals` tells you how many; clicking it opens the job's own
page in a new tab, which is the only place that answers *which* of you, when, and — on a rejection —
why. What an approver sees there is not the operator's view: only jobs their frozen pool names them
in, no pool CPFs, and no Retry, Cancel or Download. Approving and rejecting stay on the row.

:::warning No duplicate detection
A comparison against the same payer's previous file was removed in favour of a queue that reads at a
glance, so **nothing in the product now flags a file resent twice**. The payment-date range came off
the row too, but that one was belt-and-braces over a machine check — the pipeline still refuses a
remessa whose payment dates have passed, on every profile that keeps the payment-date guard on. On a
profile that turns it off, the per-job page — not the row — says so before anybody approves.
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
you are looking at it — approved to quorum by a colleague, rejected, or expired. Because the queue
reloads on its own, that can happen with your hands nowhere near the keyboard, so it is **said rather
than done quietly**: a dismissable note above the list names the files that left, newest first, and
coarsely what became of each — released for signing, stopped before it was signed, or simply no longer
waiting on you. A status alone cannot tell a veto from a lapsed deadline, and the note does not pretend
otherwise; the job's own page holds the precise answer, and you reach it from the row's tally chip — so
open a file you are unsure about **while it is still on your list**. The oldest entries fall off past
ten.

**Files with no grand total are excluded from the sum** and disclosed beside it as a count — *2 files
have no total and are not in this figure* — rather than counted as zero. If every ticked file lacks a
total the figure is an em-dash, never `R$ 0,00`; a remessa of nothing but exclusões still shows
`R$ 0,00`.

### Approving a batch

**Approve N selected** acts on the ticked rows and on nothing else. There is no separate "approve all"
— ticking the header checkbox and pressing this button is what that means.

It confirms first, in a dialog that restates the count, the total, the largest single file in the
batch, and — when any are in it — **how many of the files are approved by signing** rather than by
clicking. There is no undo behind it.

A selection may mix the two kinds freely. If any file in it is approved by signing, the confirmation
also asks **where your certificate is** — on a deployment with [CloudHub](#signing-with-a-cloud-certificate)
it offers **Certificate in this browser** and **Cloud certificate** as its two confirming buttons, and on
one with no Web PKI licence the cloud is the only one. With the browser chosen, the next thing you see is
the certificate picker, **once for the whole batch**: pick the certificate issued to you and press
**Continue**. With the cloud chosen, see
[Approving a batch with a cloud certificate](#approving-a-batch-with-a-cloud-certificate) below.

As on a single file, only the certificates issued to your CPF are listed — the CPF the files' frozen
pools record for you — and the rest are counted, not offered. Normally that is one CPF. If the approver
pool was edited between some of the files parking, they may have frozen **different** CPFs for you: then
a certificate issued to any of them is listed, the dialog says so, and each file is still checked
against the CPF it recorded — a file the certificate does not match is refused in the report. The
second-factor code, where one is required, is asked for after that and only if the batch also holds
files approved by clicking; the signed ones are your signature's own proof of presence.

Then the approvals run one after another, and **every selected file is attempted** regardless of what
the ones before it returned — *Approving 3 of 12* while it works. A file approved by clicking is
recorded exactly as a single click would be. A file approved by signing goes through the same checks the
row's **Sign and approve** makes, and then your browser signs it; the PIN prompt, if your token asks for
one, appears for each such file in turn. If you cancel the PIN prompt on one file, the remaining files
approved by signing are left unsigned and named in the report rather than prompting you again one by
one; the files approved by clicking still go through.

The report has two parts: an aggregate (*9 of 12 approved; 6 went on to signing*), and **a list naming
every file that did not go through, and why.**

Expect some. Each approval is an independent call, and a colleague may have acted while you were
reading — so *already decided*, *no longer awaiting approval — it is Canceled* (which is what a
colleague's rejection looks like from here), and *you are not in this file's approver pool* are all
ordinary outcomes. On a file approved by signing, the certificate refusals and a browser that could not
sign are reported in the same words the row's button would use, and a colleague signing the same file
while you were signing it is a *conflict* — refused with nothing recorded.

Files that were approved untick themselves; **files that failed stay ticked**, so pressing the button
again retries exactly those. When every failure in the report is a conflict, the message also offers
**Sign again** for exactly those files — the colleague's signature is now part of the file, and signing
it as it now stands is the whole remedy. If the queue has refreshed and those files are no longer in it
— the colleague's signature met the quorum — the button says so instead.

#### Approving a batch with a cloud certificate

:::tip New in 2.14.0 — one provider login for a whole batch
Where `CloudHub:ApiKey` is set, **Approve N selected** offers the cloud beside the browser, so a host
with no Web PKI licence can approve signed files in bulk.
:::

With the cloud chosen, you authenticate with your provider **once for the whole batch**. The dialog
that opens lists the providers holding a certificate for your CPF, exactly as the row's does; pick yours
and the browser leaves for it. **Nothing is approved before you come back** — neither the signed files
nor the clicked ones. When the provider sends you back to the portal, the files you left with are ticked
again, the second-factor code is asked for if the batch holds clicked files and the factor is on, and
then the whole batch runs on its own, with the same per-file report as a browser batch. Each signed file
is checked against the CPF it recorded, and its decision names the provider you signed through.

Three things are particular to the cloud:

- **The signed files must share one CPF for you.** A cloud session is opened under one CPF, so a batch
  whose signed files froze different CPFs for you has its cloud button replaced by a sentence naming how
  many CPFs; sign it in the browser, or untick files until the signed ones agree. Normally this never
  appears.
- **The batch lives for fifteen minutes.** Come back from the provider later than that and nothing in
  the batch is approved; the files are ticked again and approving them is another provider login.
  Closing the code prompt on the way back approves nothing either.
- **A provider failure part-way stops the cloud calls.** If CloudHub or your provider fails on one file
  — the session expired, the provider is down — the remaining signed files are named in the report as
  not signed rather than each trying and failing, and the clicked files still go through. Signing them
  again is another provider login, as is the report's **Sign again** after a conflict.

Files that left your queue while you were at the provider — a colleague's decision, an expired wait —
are not run, and the report says how many.

**On a deployment with neither a Web PKI licence nor CloudHub**, a batch holding files approved by
signing is refused in the confirmation, before anything runs, naming how many; the clicked files in it
are not run either. That is a profile whose signer set was chosen while one of the two existed, on a
host that has since lost it.

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

On a file whose approvers sign, the button reads **Sign and approve** and opens the certificate picker
in a modal of the same kind instead of recording a click — [Approving by signing](#approving-by-signing)
walks through it. Reject on that row is exactly what it is on every other.

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
- **To revoke one person**, remove them from every profile's pool with **Edit approval**. Their link
  stops working **immediately** — on the very next request, with no restart and no poll interval in
  between — and they are frozen into no further job. Jobs already parked with them in the pool keep
  their entry — the frozen rule does not move. Links are derived from the address, never issued, so
  somebody added back later gets the same link they already had.
- **To revoke everybody**, change `ApproverPortal:LinkSecret`. Every link breaks at once.

:::warning Revoking a link does not end a session already opened with it
Opening a link exchanges it for a browser session, and that session is a separate credential: it lasts
`ApproverPortal:SessionLifetime` (30 days by default) on a **sliding** clock, so an approver who keeps
using the portal is never timed out. Neither removing someone from a pool nor changing
`ApproverPortal:LinkSecret` ends it — they revoke links, not cookies. What such a session can still
decide stays bounded by each job's frozen pool, so it reaches only jobs whose rule already named that
person. To end sessions sooner, shorten `ApproverPortal:SessionLifetime`, or rotate the data-protection
key ring — which signs out operators too. A disabled profile's pool still counts: disabling a profile
stops new work and withdraws nobody's authority.
:::

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

## Proving it is you

`ApproverSecondFactor:Enabled` puts an RFC 6238 authenticator app between an approver and a decision.
**Off by default**, so nothing about an existing deployment changes until somebody chooses it. Host-wide
rather than per profile, deliberately: a per-profile rule would be frozen onto the job at the park, and
authentication must not be in that snapshot — otherwise editing configuration could be an authorisation
bypass.

**Each approver binds one authenticator, once, through the portal**: a QR code, a manual-entry secret,
and a live code confirmed before anything is stored. Afterwards the first decision made on a browser asks
for the current six digits. Entering them opens a **verification window**
(`ApproverSecondFactor:VerificationWindow`, twenty minutes by default) during which nothing on that
browser asks again, however many files are cleared.

The window is **absolute from the moment the code was typed, and belongs to the browser session rather
than to the person** — proving the factor on a laptop at home does nothing for the machine left signed in
at the office, which is precisely the unattended session the control exists to close. Zero is a legitimate
setting and means "prompt on every decision".

Other behaviour worth knowing:

- **A code is single-use.** Five consecutive wrong ones close that approver's enrolment for five minutes.
  Both counters live on the enrolment row, so a restart clears neither.
- **A signed approval is never asked for a code.** On a file whose approvers sign, using the private key
  on your token (or at your cloud provider, after its own authentication) is the proof of presence, and
  the certificate recorded on the row is the record of it. Rejecting the same file is unsigned and still
  asks.
- **Operators get an `Approver second factor` list** on the [System page](dashboard.md#system--system) —
  one row per configured approver, enrolled or not, with the date — and a **Reset** button. That is the
  lost-phone path, and it is recorded under the operator's name as its own audit event.
- **Seeds are encrypted at rest** under a key derived from the required `ApproverSecondFactor:SeedSecret`.
  Seeds are random per approver, so holding the first factor cannot mint the second. **Losing or rotating
  that secret means every approver enrols again.**
- **Every decision row records whether a factor was verified**, and when.
- **The window crosses instances.** It lives in the operational store keyed by an identifier carried
  inside the cookie, so a window opened via one instance is honoured via another with nothing added.

:::danger Breaking, on opt-in: enabling the factor withdraws `POST /api/approvals/{id}`
That route refuses **every** call while the setting is on, with `403` and
`approval.second-factor-required`, and there is nothing a caller can send that would satisfy it — no
header, no key, no body field — because what is missing is a proven presence and only a browser session
can carry one.

**Any approval driven from an ERP, a scheduler or a script stops on the day the setting is flipped**, and
the operator flipping it is usually not the person whose integration stops. Treat it as a coordinated
change rather than a configuration tweak.

There is deliberately **no authenticated approve endpoint to move to**: an approve route behind the API
key would be *weaker* than the anonymous page, since that key lives in the ERP's configuration, the
deploy pipeline and a production settings file — so "an approver decided" would mean "something holding
the operator credential decided". `GET /api/jobs/{id}/approvals` is untouched, so a system that
[watches approval state](#reading-the-state-from-another-system) keeps working. It is only the deciding
that moves to the portal.
:::

**The anonymous per-job page splits by reader rather than by route.** With the factor on,
`/approve/{jobId}` opened by somebody the host cannot identify renders **read-only**: every figure, every
payment line, and exactly the masking it used before — this narrows nothing about what a forwarded link
discloses and must not be read as having improved it — with the decision panel replaced by a route to the
portal (**Go to the approver portal**), and the self-declared warning gone with it, because there is no
longer a self-declared decision for it to warn about. The same URL opened by a reader holding a portal
link or an Entra session behaves exactly as the portal does: the same controls, the same code prompt, and
the *same* window, so verifying in the portal and then following a link from last week's mail does not
ask twice.

The boot banner follows the same rule. The warning that fires on every approval-configured profile —
"decisions on this build are self-declared" — is false once the factor is on, so with the setting enabled
it becomes an informational line stating the actual posture, including that the REST route now refuses
every call.

:::warning The second factor alone does not make an operator unable to be an approver
TOTP is symmetric, and an operator can read every approver link and reset every enrolment, so under a
click-based rule an operator can still be any approver. What closes that is key material only the
approver holds: a [signer set in which the approvers sign](#the-signer-set), where each approval is a
signature made with the approver's own ICP-Brasil certificate, whose CPF must match the frozen pool, and
the certificate is recorded on the decision. This control must not be described as having closed that
gap on its own.
:::

Every key, its bounds and the three boot refusals are in
[Configuration](configuration.md#approversecondfactor).

## Approving by signing

On a profile whose [signer set](#the-signer-set) includes the approvers, an approver does not click.
They **co-sign the payment file** with their own ICP-Brasil certificate — through Lacuna Web PKI in
their browser, or [through Lacuna CloudHub](#signing-with-a-cloud-certificate) for a cloud certificate —
and that signature *is* their approval: the file the bank receives carries it, beside the company's own
where the set says so. The certificate's CPF must be the CPF registered for that approver in the pool —
the holder's on a pessoa física certificate, the responsible person's on a company's — and the session
they hold (a portal link, or a Microsoft Entra sign-in) still says who is deciding. The certificate
proves it; it never picks the approver.

**From the portal**, the row's button reads **Sign and approve** and opens a modal: what is about to
happen is restated, your browser's certificates are listed through Lacuna Web PKI — with the install
route if the extension is missing, out of date or unsupported — and the button acts once you have picked
one. **Only the certificates issued to your CPF are listed** — the CPF registered for you in the pool
frozen onto that file, which is the one the server will check the certificate against. Any other
certificate your browser holds is counted in one line under the list, naming your CPF by its check
digits, and is not offered: picking it could only end in a refusal. If your browser holds certificates
but none carries that CPF, the modal says so; the remedy is the token holding your own certificate. The
narrowing is a convenience: the checks below are made whatever the list showed. The modal cannot be
dismissed while a signature is in progress; its **Cancel** is the way out, and closing your token's PIN
prompt cancels quietly too, with nothing recorded.

**From the per-job page**, the same modal opens for a reader signed in through their own link or with
Microsoft Entra. Somebody nobody has identified gets the page **read-only** — every figure and every
payment line under the same masking, and the decision controls replaced by a route to the portal —
exactly as under the second factor, but decided per file from the rule frozen onto it rather than for
the whole deployment. A file approved by clicking, on the same deployment, behaves as it always has.

The order matters, and it is built so that **a wrong certificate is refused before the token asks for
a PIN**:

1. The certificate is checked in full — chain, validity period and revocation, through the PKI SDK
   against the same trust the profile key is held to. An invalid one is refused with the SDK's reason.
2. A valid certificate carrying no CPF at all is refused as such — a distinct answer from a mismatch,
   so somebody holding the wrong *kind* of certificate is told that rather than that their CPF is wrong.
3. A CPF that is not the session's approver's is refused. A colleague's certificate, valid and in the
   pool, is still refused under your session.
4. Only then is the hash to sign produced — over the file as it stands, including any colleague's
   signature already on it — and the browser asks the token to sign it.

After the signature, the finished envelope is validated, checked against the bytes the approval is
bound to, written beside the staged copy, and the approval recorded — the envelope and the row as one
unit. **If a colleague signed the same file while you were signing it**, your signature was made over
an envelope that is no longer the envelope: it is refused, nothing is recorded, and the message offers
**Sign again**, which signs the file as it now stands. Every other refusal is said in its own words in
the same place the page reports a click's outcome, and you answer it by pressing the row's button again
and picking differently. A file whose approvers sign may be part of a batch — see
[Approving a batch](#approving-a-batch).

**The six refusals, and what each asks of you.** Each is said where the page reports a click's outcome
— the alert on the portal, the panel on the per-job page, the per-file list of a batch — and only the
first is also a REST response: the anonymous route carries no certificate, so the other five cannot
arise there:

| Refusal | What happened | What to do |
|---|---|---|
| `approval.signature-required` | A click landed on a job whose approvers sign — from the anonymous route, or from a client written for clicks. | Approve from the portal, or from the per-job page while signed in. A rejection is still a click. |
| `approval.certificate-invalid` | The certificate did not pass the full check: expired, not chained to a trusted root, revoked, or its revocation status could not be established. The SDK's reason is shown. | Pick a current certificate, or renew yours. If every approver is refused at once it is the deployment and not you — see [Troubleshooting](#troubleshooting). |
| `approval.certificate-without-cpf` | A valid certificate that carries no CPF — not an ICP-Brasil e-CPF, nor an e-CNPJ naming a responsible person. | Pick the certificate issued to you as a person, or your company's that names you as its responsible person. |
| `approval.certificate-cpf-mismatch` | The certificate's CPF is not the CPF registered for you in this file's pool. A colleague's certificate is refused under your session even when they are in the pool. Rare from the picker, which lists only certificates carrying your CPF; it can still arise when the browser's reading and the server's disagree, or from a batch whose files froze different CPFs for you. | Pick your own certificate. If the CPF in the pool is wrong, the operator corrects the profile; a job already parked keeps the pool it froze and has to be re-run. |
| `approval.signature-invalid` | The signature your browser produced did not finish into an envelope the SDK validates, or wraps bytes other than the file you were shown. Nothing was written or recorded. | Press the button again. If it repeats, the token or the extension is at fault — try another browser, and tell the operator. |
| `approval.signature-conflict` | A colleague signed the same file while you were signing it, so your signature was made over an envelope that no longer exists. Nothing was written or recorded. | **Sign again**, offered on the spot: it signs the file as it now stands, colleague's signature included. |

Two more outcomes come from the browser rather than the server, and are not refusals: closing your
token's PIN prompt **abandons** the attempt quietly, and a failure Web PKI reports — a licence that is
not for this domain, a module the extension could not load — is shown in Web PKI's own words. Both are
counted on the same metric as the refusals ([Metrics](#metrics)).

The same conflict refusal covers a file a colleague is signing *right now*: their envelope is held while
their approval is recorded, and approving again a moment later goes through. If approving again keeps
being refused on one file, look at the job's page. In the rare case where the product could not undo a
signature whose approval failed to record — the share went away mid-write, or an instance died holding
the envelope — the job's history says so in one line ending *cancel the job to recover*. Cancel the job;
its input stays in the input folder, as any canceled file's does, and Retry or Rescan starts it over
with its approvals from scratch.

A signed approval **satisfies the second factor** where one is required: using a private key on a
token is presence, and the certificate columns on the row are the record. A rejection on the same job
is unchanged — unsigned, one click and a modal, and still asked for a code where the factor is on. The
veto stays cheaper than the approval on purpose.

What is recorded: the row's certificate columns ([What every approval records](#what-every-approval-records)),
a timeline entry — *Approved by Maria Silva with certificate Maria Silva, CPF \*\*\*.\*\*\*.\*\*\*-09.* —
and the operational event, each naming the certificate with the CPF masked to its check digits. The
signature bytes are not kept on the row; the artifact in `output/` is the proof.

Choosing such a signer set on the profile page asks you to confirm past a one-line warning: the
delivered file will carry the approvers' own signatures, and whether the recipient accepts a file
signed by several people is yours to establish with them before the first file goes out. The warning
is asked once, on the save that crosses into such a set, and the audit entry names the field.

:::warning Two limits to know before choosing such a signer set
**Every approver in the pool needs a certificate**, and the quorum needs enough of them: a pool of
three with a quorum of two where one member holds a certificate parks every job forever, and the
product cannot know who holds one until they present it — keep the wait budget set. And **the host must
reach the ICP-Brasil repositories**, because the certificate check is not best-effort; an air-gapped
deployment cannot use these signer sets.
:::

### Signing with a cloud certificate

:::tip New in 2.7.0 — cloud certificates through Lacuna CloudHub
Before 2.7.0 an approver could sign only with a certificate their browser could reach.
:::

An approver whose certificate was issued into a provider's HSM — a *certificado em nuvem* — has nothing
a browser can reach, so the modal above cannot list it. Where the deployment has
[`CloudHub`](configuration.md#cloudhub--lacuna-cloudhub-for-cloud-certificates) configured, the same
modal opens with a **first step**: **Certificate in this browser** or **Cloud certificate**. The choice
is made per signature, by you, at the moment of signing — it is stored on no profile and on no pool
member, because which key you hold is a fact about you on the day. On a deployment with CloudHub and no
Web PKI licence the step is skipped and the modal goes straight to the cloud; on one with no CloudHub
there is no step and the modal is the picker above. The row keeps one button either way.

Choosing the cloud asks Lacuna CloudHub which providers hold a certificate for **your CPF as frozen on
that file** — the same CPF the picker narrows to, and for the same reason: you type no CPF, cannot start
a session under anybody else's, and the certificate that comes back is still checked. Every provider
CloudHub names is listed, and you pick yours; if none holds a certificate for that CPF the modal says so,
naming the CPF by its check digits, and the remedy is a certificate in this browser or a word with your
provider. The browser then leaves for the provider, where you authenticate — usually on your phone —
and is sent back to the deployment at `/approvals/cloud/return`, an authenticated route that runs **the
whole signed approval in that one request**: the same order of checks as above, with the certificate
read from CloudHub instead of from the browser. The one thing the cloud costs is that a wrong
certificate is discovered after the provider's login rather than before a PIN prompt; the CPF narrowing
makes that rare, and nothing is signed under a refused certificate either way.

You land back on the page you left from — the portal, or the per-job page — and it says what happened,
**once**, in the same words it uses for a browser signature: recorded, or one of the refusals in the
table above, with **Sign again** offered on a conflict. There is no result page and nothing about the
outcome in the address. A return that cannot be matched to a signature you started within the last
fifteen minutes — the wrong session, a link followed twice, a login that took too long, a start replaced
from another tab — lands on the portal, which says so in one sentence and never why, and records
nothing; start again from the file's row. A failure on CloudHub's side — the key refused, the service
unreachable, an answer the product cannot use — is reported as a provider failure, in CloudHub's own
words, and nothing is recorded.

What is recorded differs in one column: the decision row names the **cloud service** the certificate was
reached through, and the timeline and the audit event read *Approved by Maria Silva with cloud
certificate (ProviderName) Maria Silva, CPF \*\*\*.\*\*\*.\*\*\*-09.* The certificate columns beside it
mean the same whichever means produced them, and the signed file is verified against exactly the
recorded signers. A cloud signature satisfies the second factor as a browser signature does. A rejection
is never signed by either means.

**A batch signs in the cloud with one provider login** — see
[Approving a batch with a cloud certificate](#approving-a-batch-with-a-cloud-certificate).

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

- **The file is handed back to `output/`** as `<name>.reject<ext>` — `folha.rem` becomes
  `folha.reject.rem` — preserving the exact bytes that were rejected. See
  [The rejected file comes back to `output/`](#the-rejected-file-comes-back-to-output) below.
- **The original is removed from `input/`**, once the handed-back copy is safely in `output/`.
- **Retry does not apply**, and it says so by name: `POST /api/jobs/{id}/retry` refuses with
  `409 { code: "job.rejected-not-retriable" }`, and the Retry button is withheld on the job page. A
  veto is not a failure to recover from. Finance corrects the file and re-submits, which is the
  intended loop.

Rejections are told apart from operator cancellations by the audit trail, not by the status: the job's
timeline names the rejecting approver and their reason, and an `ApprovalRejected` operational event is
recorded.

### The rejected file comes back to `output/`

:::warning Changed in 2.1.0 — a vetoed file goes to `output/`, not `error/`
Up to 2.0.x a rejection relocated the staged copy to `error/<jobid>/` and left the original in
`input/`. A producer that drops remessas into a watched folder collects from one place, and that place
is `output/` — so a vetoed file is now returned there, and its input removed.
:::

A vetoed file is returned to `output/` rather than left in `error/` among the machine failures, under a
name carrying `.reject` before its original extension — the same slot `.signed` occupies, so a `.rem`
stays a `.rem` and a downstream parser still recognises it.

Two things are worth knowing before you build on it:

- **The returned file is not signed.** A rejection happens at the gate, before signing. What arrives in
  `output/` is the customer's own bytes, marked. Anything that treated `output/` as a folder of
  signatures has to read the name. In exchange, `error/` holds genuine failures again.
- **Where the profile encrypts, so is the returned file**: `folha.reject.rem.enc`, a BSENC v1 envelope
  like every other artifact in that folder. See [Encryption](encryption.md).

The timeline entry names the file (`Rejected file returned to output as folha.reject.rem; input
removed.`), a `RejectedFileHandedBack` operational event records it, and the job page shows the name —
which it derives and then checks against the folder, so it never names a file that is not there.

**If the name is already taken**, the hand-back refuses rather than overwriting somebody's earlier
file. That is not a corner: a vetoed file is one finance corrects and resubmits under the same name, so
a second rejection of it collides. The job then behaves as it did before this feature — the staged copy
goes to `error/<jobid>/` and **the input stays in `input/`** — the veto stands either way, and the
console and the log say which happened. See
[Troubleshooting](troubleshooting.md#a-rejected-file-was-not-returned-to-output).

**If a veto was a mistake**, the file is not lost — it is in `output/`. Fetch it, decrypt it if the
profile encrypts, and re-submit it (upload, or drop it back into the watched folder). A Rescan will
**not** bring it back, because the input is gone; that is deliberate, since a veto an unrelated button
undoes is not much of a veto.

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
proceed. The check runs on the local sign path and the remote-signer upload path alike, and an
approvers' envelope that wraps bytes other than the staged copy fails the same way.

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

`POST /api/jobs/{id}/cancel`, or the Cancel button on the job page — which asks first, in a dialog
naming the file and saying what the cancel does to it. A parked job is cancelable precisely because
nothing is holding it. The staged copy moves to `error/` and the file stays in `input/`; the watcher
honours the cancel and will not auto-resurrect it, though a Rescan deliberately will.

**A cancel is not a rejection, and the files end up in different places.** A veto returns the file to
`output/` and removes the input; a cancel leaves both where a pre-sign refusal leaves them. That is
because a cancel is usually a mistake being undone, and leaving the input in place is what makes the
re-run possible.

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

:::note Changed in 2.9.0 — the job page no longer hands out the per-job link
The copyable `/approve/{jobId}` field on the operator's job page is gone, for every reader. The product
sends no mail; an approver reaches a parked file from their own [portal](#the-approver-portal) queue,
and the operator's page hands out nothing to forward. The anonymous page itself is unchanged, and a
link somebody already holds still opens it.
:::

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
| `IpAddress` | the connection's remote address, or null. **Behind a reverse proxy this is the proxy** unless [`Hosting:ForwardedHeaders`](configuration.md#hosting) is configured |
| `UserAgent` | verbatim, truncated to 512 characters, or null |
| `SecondFactorVerifiedAt` | when the deciding browser session proved a second factor, or null when none was in force (and on every signed approval, which needs none) |
| `CertificateSubject`, `CertificateIssuer`, `CertificateSerialNumber`, `CertificateThumbprintSha256`, `CertificateCpf`, `CertificateCnpj` | the certificate a **signed** approval was made with: the subject and issuer as the PKI SDK renders them, the serial as uppercase hex, the SHA-256 thumbprint, the CPF the certificate carries — the holder's, or the responsible person's on a company's — and the CNPJ when it is a company's. Null on every clicked decision and on every row written before approver signatures existed. `ApproverName` and `ApproverCpf` still come from the frozen pool: the pool says who was allowed to decide, the certificate says what key confirmed it |
| `CloudService` | the cloud service the certificate was reached through — Lacuna CloudHub's name for the provider — or null for a signature made in the browser and for every clicked decision |

`IdentificationMethod` exists so that as stronger identification arrives, earlier approvals stay
visibly what they were in the same table rather than being retroactively blessed. Members are added,
never repurposed, and no row is ever migrated onto a new value.

Approvals recorded from the dashboard or the portal carry no IP or user agent: those paths run over
the Blazor circuit, where there is no HTTP request to read them from. The REST route records both.

### Personal data

The pool holds a name, an email and a CPF per approver, and every approval row copies them. The CPF is
validated for check digits, normalized to eleven bare digits, and used for exactly one decision: on a
profile whose approvers sign, it is what the approver's certificate must match. On a click-based rule
it is display and audit only.

`Cpf` is in the structured-property redaction allowlist, so it cannot reach a durable log. Approver
addresses are masked (`m***@empresa.com.br`) in console narration and operational events, and a
certificate's CPF is masked to its check digits in timelines and events — inside the subject too; the
full addresses live in the frozen snapshot and the approval rows. Saving a pool records counts in the
event log — how many people were added, removed and amended — never a roster. See
[Security](security.md).

### Retention

Approval rows and the frozen rule are **never purged**, including when the job reaches a terminal
status. Who authorised a payment, and under what rule, is exactly what an audit asks for after the
fact. This is the deliberate opposite of the CNAB240 line detail, which *is* purged at terminal status
— see [Retention](retention.md).

## REST

:::danger This route is withdrawn when the second factor is on
`ApproverSecondFactor:Enabled = true` makes `POST /api/approvals/{id}` refuse **every** call with `403`
and `approval.second-factor-required`, and no header, key or body field satisfies it. If an ERP or
scheduler drives approvals here, read [Proving it is you](#proving-it-is-you) before enabling the factor.
`GET /api/jobs/{id}/approvals` is unaffected.
:::

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

On a job whose frozen signer set includes the approvers, this route can still **reject** but cannot
approve: an approval there is a signature, and the route carries no certificate.

Refusals carry a stable `code`:

| Code | Status | Meaning |
|------|--------|---------|
| `job.not-found` | 404 | no job with that id |
| `approval.not-pending` | 409 | the job accepts no decision in its current status |
| `approval.unknown-approver` | 403 | the address is not in the job's frozen pool (also returned for a malformed address, deliberately) |
| `approval.already-decided` | 409 | this approver has decided; decisions are final |
| `approval.unknown-decision` | 400 | `decision` was neither `approved` nor `rejected` |
| `validation.reason-too-long` | 400 | `reason` exceeds 512 characters. Refused rather than truncated |
| `approval.job-incomplete` | 500 | the job is parked but its frozen rule or content hash is missing. A missing rule means the row was modified outside the application; a missing hash most likely means the profile's CNAB240 check was off when the job parked — a state the profile page and the gate now refuse, so it is a job parked before that ([Troubleshooting](troubleshooting.md#an-approver-is-told-the-approval-record-is-incomplete)) |
| `approval.signature-required` | 403 | the job's frozen signer set is `Approvers` or `ProfileKeyAndApprovers`, so its approval is a co-signature and this route carries no certificate ([Approving by signing](#approving-by-signing)). Decided per job from the snapshot; a rejection on the same job is still recorded here |

### Reading the state from another system

*Reading* is two authenticated routes, for compliance reporting, an external dashboard, or a monitor
watching for jobs parked longer than some threshold:

- `GET /api/jobs/{id}` carries an `approval` summary — the frozen quorum, the pool size, how many
  people have approved and rejected, `vetoed`, `parkedSince` and the expiry deadline if the rule set
  one. `null` on any job that never parked. Branch on `vetoed`, not on arithmetic of your own:
  `quorumReached` can be `true` on a job a veto has already stopped.
- `GET /api/jobs/{id}/approvals` returns the frozen pool with each member's decision, and the decision
  list — and, on a decision recorded by signing, a `certificate` object with the subject, issuer,
  serial number, SHA-256 thumbprint, the certificate's CPF masked and its CNPJ whole, plus the
  `cloudService` when it was a cloud signature; `null` on a clicked decision. CPF is masked to its
  check digits on both. `404` with `approval.not-required` on a job that never parked — a distinct
  answer from a parked job nobody has decided on, which is `200` with an empty list.

Every figure comes from the rule frozen onto the job, never from the live profile.

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
| `bulksigner_approver_signatures_total` | counter | `outcome`, `means` | approver signature attempts on jobs whose frozen signer set includes the approvers. `outcome`: `signed`, `cpf-mismatch`, `without-cpf`, `certificate-invalid`, `signature-invalid`, `conflict`, `abandoned` (the approver closed the PIN prompt or Web PKI's dialog), `browser-failed` (Web PKI reported a failure that was not a cancellation), `provider-failed` (Lacuna CloudHub failed, sent the browser back with no session, or would not list providers). `means`: `browser` (Web PKI) or `cloud` (CloudHub). Flat at zero until a profile's signer set includes the approvers |

An *expiry* rate that climbs usually says something about your distribution of the approval link — the
product sends no mail, so a lapsed window generally means the link never reached anybody.

On the approver-signature counter: a mismatch rate climbing against a flat signed rate is one person
presenting the wrong certificate; `conflict` above zero is two approvers habitually deciding the same
file in the same minute; `browser-failed` climbing across several approvers is a licence or module
problem on the deployment, not a person; `provider-failed` climbing is the CloudHub key or a provider
outage. `means` answers "cloud signatures failing while browser ones succeed".

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
park time, not the profile's current one. If the people listed are wrong, cancel the job, fix the pool
with **Edit approval** on the profile page, and re-run the file.

**An approver gets "not an approver for this job".** Their address is not in the frozen pool. Compare
it against the pool shown on the job page — leading/trailing spaces and capitalisation do not matter,
anything else does.

**A released job failed with `approval.content-changed`.** The staged copy in `processing/<jobid>/` was
modified after the approvers saw it. The job's folder is now under `error/`. Do not re-sign it — find
out what wrote to `processing/`, then re-run the original file from `input/` so it is parsed, totalled
and approved afresh.

**A job failed with `approval.content-unmeasured` instead of parking.** The profile carries an approval
rule but its CNAB240 check is off, so the file was never parsed and there is no content hash to bind a
decision to. Turn **check CNAB240** back on from **Edit behaviour** (or remove the rule from **Edit
approval**), then re-run the file. The profile page refuses saving that pairing, so a profile in this
state was stored before the refusal existed or edited outside the application.

**An approver is told the record is incomplete, and the job page's Approval record section marks the
content hash.** The same cause, on a job that parked before the gate refused it: the profile's CNAB240
check was off when it parked. Cancel the job, turn the check back on, and re-ingest the file — see
[Troubleshooting](troubleshooting.md#an-approver-is-told-the-approval-record-is-incomplete).

**A job says "2 of 2 approvals — rejected".** Both readings are true. The count is the arithmetic and
the outcome is the veto. The timeline names the rejecting approver and their reason.

**A job failed with `approval.rejected` instead of being cancelled.** The rejection landed after a
worker had already claimed the job, so the pipeline refused the signature rather than the approval
handler cancelling it. The file is unsigned, which is the point.

**A rejected file is not in `output/`.** A file of that name was already there, so the hand-back
refused to overwrite it: the staged copy is under `error/<jobid>/` and the input is still in `input/`.
See [Troubleshooting](troubleshooting.md#a-rejected-file-was-not-returned-to-output).

**A job was canceled with "Approval window expired."** Nobody decided inside the profile's
`ExpiresAfter` window. The staged copy is under `error/<jobid>/`, the original is still in `input/`,
and any approvals that *were* recorded are still on the job page. Retry does not apply — re-run the
file through Rescan or Upload. If windows keep lapsing, either the link is not reaching people or the
budget is shorter than your approvers' working rhythm.

**A parked job expired while the pipeline was paused.** Expected — see
[The wait budget](#the-wait-budget).

**An approver wants to undo a rejection.** They cannot, and neither can an operator. A decision is
immutable. Fetch the handed-back file from `output/` and re-submit it; the new job parks and the pool is
asked again.

**A removed approver can still open their queue.** Their link stopped working the moment they left the
pool, but a browser session they opened with it earlier lasts `ApproverPortal:SessionLifetime` — see
[The link is a password](#the-link-is-a-password). It can reach only jobs whose frozen pool still names
them.

**Sign and approve says the Web PKI extension is missing, out of date or unsupported.** The approver's
browser needs the Lacuna Web PKI extension, installed once per person; the modal carries the install
route, and nothing else can happen until it is there. See
[Certificates](certificates.md#the-approvers-certificate).

**Every approver's certificate is refused as invalid at once.** Read the operational log: each refusal
carries the SDK's reasons. When all of them say a revocation list or an OCSP responder could not be
reached, the deployment's network is what is wrong, not anybody's certificate — the check is not
best-effort and cannot be relaxed. When they say the root is not trusted and the approvers are
presenting Lacuna's **test** certificates, it is the trust set: the published image holds them to
ICP-Brasil alone unless the host opts in with `Signing:TrustLacunaTestRoot` under an environment name
other than `Production` — see
[Certificates](certificates.md#test-certificates-and-the-trust-set).

**One approver is always refused with a CPF mismatch.** The CPF the pool records for them is not the
CPF on the certificate they present — a typo in the pool, or a colleague's certificate. Compare the
pool's CPF on the job page with the certificate's subject. Correcting the profile fixes the jobs that
park from then on; a job already parked froze the wrong CPF and has to be cancelled and re-run.

**A released job failed with `approval.signatures-missing`.** The job's frozen signer set includes the
approvers, but the envelope carrying their signatures was not beside the staged copy when the pipeline
went to promote it, or could not be opened as CAdES, or an approval on the job recorded no certificate.
The folder is under `error/` with whatever was in it. Something removed or rewrote the file in
`processing/` — find out what, then re-run the original from `input/` so it is approved afresh.

More failure modes in [Troubleshooting](troubleshooting.md).

---

**Next:** [Retention](retention.md). **Previous:** [CNAB240 payment files](cnab240.md).
