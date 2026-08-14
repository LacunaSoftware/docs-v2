---
sidebar_label: "CNAB240 payment files"
sidebar_position: 13
---

# CNAB240 payment files

Lacuna Bulk Signer can treat a file as a **Banco do Brasil CNAB240 remessa** rather than as opaque
bytes: parse it, refuse to sign it if it is not a compliant remessa, and record what it moves so an
operator can see the money without opening the file.

The check is **opt-in per signing profile and off by default**. It is also the precondition for the
[approval gate](approvals.md) — an approver who cannot be shown the amount is not approving anything
meaningful, so a profile with an `Approval` block must also carry `CheckCNAB240`.

## Enabling the check

```json
{
  "Signing": {
    "Profiles": [
      {
        "Name": "folha",
        "Format": "Cades",
        "CheckCNAB240": true
      }
    ]
  }
}
```

Every file routed through that profile is parsed before it is signed. Turn it on for the folder that
receives remessas and leave it off everywhere else — a PDF routed through a `CheckCNAB240` profile is
refused, because it is not a remessa.

The startup banner appends `cnab240=on` to the profile's row, so the posture is visible at boot.

The key binds case-insensitively: `CheckCNAB240` and `CheckCnab240` are the same key.

## What a remessa is

A CNAB240 file is fixed-width: **240 bytes per record**, records separated by a line delimiter (the
parser accepts CRLF, LF, or no delimiter at all). Position 8 of each record carries the *Tipo de
Registro*:

| Tipo | Record |
|------|--------|
| `0` | Header do Arquivo — one, first |
| `1` | Header do Lote |
| `3` | Detalhe — the payment records |
| `5` | Trailer do Lote |
| `9` | Trailer do Arquivo — one, last |

A **remessa** (*Código Remessa / Retorno* = `'1'`) is a payment order you send to the bank. A
**retorno** (`'2'`) is the bank's receipt coming back. Only remessas are signed; a retorno is refused
by name, because signing a bank receipt is meaningless and dropping one into a watched folder is a
real operator mistake.

Detail records carry a *Código de Segmento* at position 14. **Primary** segments instruct a payment
and carry its value:

| Segment | Pays |
|---------|------|
| `A` | Crédito em conta, DOC/TED, Pix, depósito judicial |
| `J` | Boleto (títulos), FGTS Digital |
| `N` | Tributos (DARF, GPS, IPVA, DPVAT, …) |
| `O` | Boleto de concessionária (água, luz, telefone), tributos com código de barras |

**Complementary** segments — `B`, `C`, `J-52`, `W`, `W1`, `Z` — carry extra information about the
payment on the primary record before them. Some have an amount field; **it is never counted.** BB does
not process those amounts, and adding them would double a payment already counted on its primary
record.

Each detail record also carries a *Tipo de Movimento*: `'0'` is an **inclusão** (a payment) and `'9'`
is an **exclusão** (the withdrawal of a previously-sent instruction).

## What is validated

Structure and format only:

- Every record is exactly 240 bytes, delimiter excluded.
- Record types appear in order: `0` … (`1` … `3`* … `5`)+ … `9`.
- *Código do Banco na Compensação* is `001`.
- *Código Remessa / Retorno* is `'1'`.
- The Trailer do Lote's record count matches the records actually in the lote, and the Trailer do
  Arquivo's lote and record counts match the file.
- Every *Código de Segmento* is one the parser recognises — an unknown one is a **hard failure**, not
  a skipped record.
- *Tipo de Movimento* on a value-bearing segment is `'0'` or `'9'`.
- *Valor do Pagamento* on a value-bearing segment is 15 ASCII digits. A blank or space-padded amount
  means the record is misaligned, not that the payment is worth nothing.

## What is *not* validated

Check digits, CPF/CNPJ validity, barcode DV, agência/conta plausibility, convênio rules, and every
per-field "Instrução BB" note.

:::info Bulk Signer is not the bank
BB has a critique engine, it publishes its occurrence codes, and it returns them in a retorno. A file
this product wrongly rejects blocks a payroll with no recourse; a file it wrongly accepts comes back
from BB naming the exact problem — a better diagnostic than anything this parser could produce.
:::

Two consequences worth knowing:

- **Payment dates are parsed but never validated here.** A zero-filled or malformed *Data do
  Pagamento* yields no date rather than a violation. Staleness is a question for the signature
  boundary, and it is asked there — see
  [Payment dates that have passed](#payment-dates-that-have-passed).
- **The Trailer do Lote value checksum is not enforced.** BB defines *Somatória dos Valores* as a
  Segmento-J-only sum, but real files populate it with a lote-wide total; implementing it literally
  would reject valid remessas. The count reconciliations, which do validate exactly, are enforced
  instead.

## How the total is defined

> **Total** = the sum of *Valor do Pagamento* across primary segments **A, J, N and O** where
> *Tipo de Movimento* = `'0'`.

Three rules follow, and each changes the number:

**Complementary segments contribute nothing.** Their optional amounts describe a payment already
counted on its primary record.

**Exclusões are counted separately and never netted.** An exclusão record carries a populated amount
field, so a naive sum counts a cancellation as a payment. Subtracting it instead is no better: an
exclusão is *the withdrawal of an instruction*, not negative money. Netting a R$ 500,00 exclusão
against a R$ 1.000,00 payment produces R$ 500,00 — a figure matching neither what leaves the account
nor what the file instructs. So the total is R$ 1.000,00 and the cancellation count is 1, displayed
side by side.

**Money is centavos in an integer, never a decimal.** CNAB240 amounts are `13,2`, so the fifteen raw
digits already *are* the centavos — no scaling, no decimal separator to parse. Conversion to reais
happens only at the display boundary.

Alongside the total, the pipeline records the payment count, the cancellation count, the earliest and
latest payment dates, the payer, and a **SHA-256 of the exact bytes parsed**. The hash is the anchor
the [approval gate](approvals.md#what-is-approved) binds to — an approval is a statement about
*bytes*, not about a job id — and it is written in the same database update as the figures precisely
so the hash and the figures can never describe different bytes. It is re-checked immediately before
signing.

### Who is paying

*Nome da Empresa* (positions 73–102) and *Número de Inscrição da Empresa* (positions 19–32, typed by
*Tipo de Inscrição* at 18) are read from the Header do Arquivo and recorded with the figures. The tax
id is stored as bare digits — eleven for a CPF, fourteen for a CNPJ — with punctuation applied only at
the display boundary.

A blank or zero-filled payer block is **not** a violation: refusing a file BB would accept is the
expensive direction. Zero-filled reads as absent rather than as fourteen zeroes.

The payer exists for the approval page: "R$ 1.240.000,00 leaves an account" is a different question
from "R$ 1.240.000,00 leaves *this* account", and only the second one is answerable.

:::note
Figures are recorded **only on a clean parse.** On a file that fails validation, whatever the parser
read before giving up is discarded rather than persisted — a number nobody can trust is worse than no
number.
:::

## Payment dates that have passed

A remessa can be perfectly well-formed and still be the wrong thing to sign. A file exported on the
3rd for payments dated the 5th that only reaches the signer on the 11th is stale: BB will either
refuse it or process it on a date nobody intended, and a signature makes the wrong date look
deliberate.

> Immediately before signing, the **earliest** *Data do Pagamento* recorded for the file is compared
> against today. If it has passed, the job fails and no signature is produced.

The comparison is on the earliest date, not the latest — one already-due payment in a file that also
pays out next week is still one payment BB will reject or misdate. A file with no dated payments is
unaffected and signs normally.

| | |
|---|---|
| Job status | `Failed`, `ErrorMessage = cnab240.payment-date-passed` |
| Staged copy | relocated to `error/<jobId>/` |
| Job history | `CNAB240 payment date has passed: earliest payment date 05/08/2026, today 11/08/2026.` |
| Operational event | `Cnab240PaymentDatePassed` |

The code is deliberately distinct from `cnab240.invalid`: an invalid file needs its framing fixed, a
stale one needs re-exporting with current dates. **Retrying the same file fails the same way**,
because the dates inside it have not changed — re-export from the originating system and run the new
file through Upload, Retry or Rescan.

### Why the guard sits at the sign call

The check runs at the signature, not next to the parse, and the two are not the same place. The
guard's value is exactly proportional to how long a file waits between being read and being signed,
and that gap can be very long — the [approval gate](approvals.md) parks a job on a human for an
open-ended stretch at precisely that point. Putting the check at the signature means the approval work
inherits it for free, with no chance of a parse-time copy and a sign-time copy disagreeing. A released
job re-enters the ordinary queue and passes back through this guard on its way to the signer.

The same reasoning puts it on both signing paths. For a [Lacuna Signer](lacuna-signer.md) profile the
guard runs at **dispatch**, since that is the moment the file leaves for a remote signature. A file
this product refuses to sign locally is a file it must not hand to a remote signer either.

### Timezone

*Data do Pagamento* is a banking-calendar date, not an instant, so "today" is the **host's local
date**.

:::warning
On a host running in UTC while the payer sits in `America/Sao_Paulo`, the local date rolls over three
hours early and a file due today starts being refused at 21:00 local. Set the host timezone to the
payer's — `TZ=America/Sao_Paulo` on the container or systemd unit — so the boundary lands where an
operator expects it.
:::

## What the operator sees

A **Payment file** panel on `/jobs/{id}`, above the profile details:

| Field | Shown as |
|-------|----------|
| Total | `R$ 3.879.613,26` |
| Payments | count of inclusões |
| Cancellations | count of exclusões, amber when non-zero, `none` otherwise |
| Payment dates | `05/08/2026`, or `05/08/2026 – 20/08/2026` when the file pays out over a spread |
| Content SHA-256 | the hex digest |

The panel appears only on jobs that were parsed as payment files. Currency and dates are rendered from
a format the application pins itself rather than from the host's culture, so the digits read
identically on a Windows service, a Debian container and a developer's machine — and they stay in
Brazilian form whatever [display language](dashboard.md#display-language) the reader chose.

## The individual payments

Below the summary, a **Payments** table lists every value-bearing record in the file — record number,
lote, segment, the name on the record, the beneficiary's CPF/CNPJ, the destination account, payment
date and amount. Exclusão rows are labelled and their amount struck through, because the amount is
real but no money moves.

The same table is rendered on the approver-facing page, where the identification and account columns
are masked for an anonymous reader — see
[Approvals](approvals.md#the-individual-payments). On the operator page nothing is masked: an
operator chasing a payment BB rejected needs the digits BB is complaining about, and they signed in to
get them.

:::warning The name column is "the name on the record"
BB labels the field differently on every segment, and on **Segmento N it is the taxpayer, not the
payee** — a tribute is paid to the government, and the name on the record is whoever owes it. Read
"beneficiary" as "the name on the record" unless the file is segment A, J or O.
:::

A blank name is shown as *(not given)*. BB does not require the field, so a blank one is a valid file
rather than a defect.

### Where the identification and the account come from

Neither is on the primary record for a credit transfer, which is the layout's own doing rather than a
quirk of this parser:

| Segment | Beneficiary CPF / CNPJ | Destination account |
|---------|------------------------|---------------------|
| **A** — crédito em conta, TED, Pix | from the **Segmento B** that follows it (18 / 19–32) | Agência 24–28 + DV 29, conta 30–41 + DV 42 |
| **J** — boleto | not read — see below | none; paid against a barcode |
| **N** — tributos | inline, in the overlay window (117–118 / 119–132) | none; paid to the government |
| **O** — concessionárias | none on the record | none; paid against a barcode |

Three things about that table are worth knowing:

- **Segmento B is the one complementary segment the parser reads.** It still produces no payment of
  its own, but it carries the only statement a remessa makes about who the favorecido is beyond a
  30-character name. It is attached only to an immediately-preceding Segmento A of the same lote, and
  only once. A B after a J, an N, an O or another B is ignored — attaching it would put a stranger's
  CPF beside somebody else's payment.
- **The *Tipo de Inscrição* codes are inverted on Segmento N.** Everywhere else in the layout CPF is
  `'1'` and CNPJ is `'2'`. On every Segmento N overlay it is **CNPJ = `'1'`, CPF = `'2'`**.
- **A Segmento N identification is only surfaced when it is a CPF or a CNPJ.** The same field also
  carries NIT/PIS/PASEP, CEI, NB, Nº Título, DEBCAD and a free-text reference; those identify the
  filing rather than a taxpayer, and those rows show an em-dash instead.

**Segmento J-52 is deliberately not read.** The beneficiary's inscription for a boleto lives there,
but the record carries three separate inscription blocks — sacado, cedente/beneficiário and sacador
avalista — and the published layout does not let this product pin down which is which with the
confidence an approver's screen requires.

Values are stored as the file wrote them, with the check digit hyphen-separated (`00551-7`,
`000000249149-4`). Leading-zero padding is stripped for display and nowhere else. The hyphen is data
rather than punctuation: without it nothing downstream can tell "conta 24914, DV 94" from "conta
249149, DV 4".

None of this is validated — a CPF that fails its own check digit, an agência that does not exist and
an account that is closed all pass, for the reason the whole page gives: this application is not the
bank.

### This table is temporary, by design

The line-level parse is stored in its own 1:1 table beside the job. **The row is deleted the moment
the job reaches `Completed`, `Failed` or `Canceled`** — at the transition itself, not on a schedule.
This is the only operational data in Bulk Signer that prunes itself; see
[Retention](retention.md#the-one-exception-cnab240-line-detail).

In short: once the job is terminal the detail is redundant (the file itself survives in `output/` or
`error/`, and the content hash proves which file it was), while it holds every beneficiary's name in
every payroll and would otherwise accumulate forever with no consumer.

Open a terminal payment job and the panel says so, rather than showing an empty table. The summary
figures, the content hash and the job history are untouched.

## What the REST API returns

`GET /api/jobs/{id}` carries a `cnab240` object, `null` on any job that was not parsed as a payment
file:

```json
{
  "id": "…",
  "status": "Completed",
  "cnab240": {
    "totalCentavos": 387961326,
    "totalFormatted": "R$ 3.879.613,26",
    "paymentCount": 44,
    "cancellationCount": 0,
    "earliestPaymentDate": "2026-08-05",
    "latestPaymentDate": "2026-08-20",
    "contentSha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
  }
}
```

`totalCentavos` is the authoritative integer — clients divide by 100 to display. `totalFormatted` is
provided so a report does not have to reimplement Brazilian currency formatting to agree with the
operator console.

The summary is on the **detail** representation only, not on `GET /api/jobs` list rows.

:::note
The individual payment lines are **not** exposed over REST. They are rendered-surface-only, they exist
only while a job is in flight, and putting a list of beneficiary names, CPFs and bank accounts behind
an API key would widen the personal-data surface the purge exists to keep narrow.
:::

## When a file is refused

A non-compliant file never reaches a signer — local or Lacuna Signer, since the gate runs ahead of the
method choice:

| | |
|---|---|
| Job status | `Failed`, `ErrorMessage = cnab240.invalid` |
| Staged copy | relocated to `error/<jobId>/` |
| Violations | listed on the job history, visible on the job timeline |
| Operational event | `Cnab240ValidationFailed` |

The violation list is capped so a badly framed file cannot write unbounded text into the audit trail;
when it is truncated the message says so rather than implying the list is exhaustive.

Fix the file and re-run it through Upload, Retry or Rescan. A compliant file can still be refused for
being stale — that is a separate code and a separate remedy, covered in
[Payment dates that have passed](#payment-dates-that-have-passed).

---

**Next:** [Approvals](approvals.md) — parking a payment file on a human before it is signed.
**Previous:** [Lacuna Signer integration](lacuna-signer.md).
