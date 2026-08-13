---
sidebar_label: "Retention"
sidebar_position: 15
---

# Retention

What ages out automatically, what does not, and how to plan disk capacity.

## At a glance

| What | Auto-pruned? | How |
|------|--------------|-----|
| Log files (`/var/log/bulksigner/bulksigner-*.log`) | **Yes** | The file sink rotates daily and retains 14 files (`Logging:File:RetainedFileCountLimit`). |
| `data/input/` files | No | Removed only after a successful sign-verify-promote, or by operator action. |
| `data/processing/` directories | No | Created and removed by the worker per job. Lingering directories belong to failed/crashed jobs and are moved to `error/` by the startup recovery sweep. |
| `data/output/` files (signed or `.enc` envelopes) | **No** | The cleanup action is currently a no-op stub. |
| `data/error/` directories | **No** | Same. |
| Job / history / event rows in the operational store | **No** | Same. |
| Frozen approval rules and recorded approvals | **No — never** | Who authorised a payment, and under what rule, is exactly what an audit asks for after the fact. Retained even once the job is terminal. |
| **CNAB240 line detail** (one row per payment) | **Yes** | Deleted at the transition into `Completed`, `Failed` or `Canceled`. The one exception — see [below](#the-one-exception-cnab240-line-detail). |

## What is retained is unchanged; where it is retained can differ

Everything in that table is true on **both** database providers. Choosing
[`Database:Provider = SqlServer`](configuration.md#database-and-connectionstrings) moves the rows out of
the SQLite file and into your own SQL Server or Azure SQL database; it changes nothing about which of
them prune themselves, when, or why.

Two consequences follow from *where*, and both are yours rather than the service's:

- **Backup and size are your DBMS regime's concern under `SqlServer`** — see
  [Backup discipline](#backup-discipline) below.
- **Switching database provider does not carry the record across.** There is no importer. A deployment
  that switches comes up against an **empty store** — including the frozen approval rules and the
  recorded approvals, the two things this table keeps for ever precisely because they are the evidence
  of who authorised a payment file. Archive the old `db/bulksigner.db` deliberately, before the switch:
  [Installation](installation.md#switching-from-sqlite--archive-the-old-file-first).

## Logs — what the file sink does

The file sink is configured under `Logging:File:*` (see
[Configuration](configuration.md#logging--loggingfile)):

| Knob | Default | Effect |
|------|---------|--------|
| `RollingInterval` | `Day` | A new file is created at the start of each UTC day. |
| `FileSizeLimitBytes` | 50 MB | If a file hits this size before the day rolls, the sink rolls to a sibling file. |
| `RetainedFileCountLimit` | 14 | Older rolled files are deleted by the sink. |
| `MinimumLevel` | `Information` | Anything below this level is filtered out before reaching the file. |

Net effect at the defaults: ~14 days of structured logs at ≤ 50 MB per day-file. Raise
`RetainedFileCountLimit` for a longer forensic window or lower it for constrained disks. The sink
flushes frequently, so concurrent readers (`tail -f`, `journalctl -fu bulksigner`) see writes in
near-real-time.

## Operational data — not auto-pruned

The cleanup action (`POST /api/cleanup` and the dashboard's System-page Cleanup button) is currently
a **no-op stub**: it returns successfully with a "retention policy is not configured" message and
removes nothing.

### Why a stub and not "delete by age" by default?

The shape of retention is deliberately operator-controlled. The audit trail (`output/`, `error/`, job
history rows) is **valuable** for compliance: deleting a signed PDF a downstream verifier may still
want to fetch, or a history row an auditor may still want to read, is a destructive action that
should reflect a deliberate operator policy — not a default that surprises someone six months in.

Default behavior:

- Signed outputs accumulate in `output/`. Operators or downstream automation move them out.
- Error directories accumulate in `error/`. Operators inspect, then delete with normal filesystem
  commands.
- Job rows accumulate in the operational store, which grows linearly with throughput. The one built-in
  tool for reclaiming that space is [Clear Jobs](operations.md#clear-jobs) — an all-or-nothing delete
  of every job record. There is no age-based or selective pruning of job history in this version.

## The one exception: CNAB240 line detail

The line-level parse of a payment file is the **first and only operational data in the product that
prunes itself.** That is a deliberate departure from the stance above, and it is narrow on purpose.

When a job is parsed as a [CNAB240 remessa](cnab240.md), the pipeline stores one row per payment —
carrying the beneficiary's name, their CPF/CNPJ where the file states one, and the destination account
— in a 1:1 table beside the job. It serves two screens while the job is in flight and somebody may
still act on it: the **Payments** table on `/jobs/{id}`, and the same table on the
[approval page](approvals.md#the-individual-payments).

**The row is deleted at the transition into `Completed`, `Failed` or `Canceled`.** Not on a schedule,
not by the cleanup endpoint — at the transition itself, so there is no sweeper to fall behind and no
window in which a terminal job still carries the data. Every route to a terminal status purges,
including an operator's cancel, an approver's rejection, and an approval window expiring.

Two reasons, and the first is why this does not contradict the stance above:

1. **It is redundant once the job is terminal, not merely old.** Everything else in the retention table
   is the *only* copy of what it records — delete a history row and the audit trail has a hole. The
   line detail is a cache of what is already in the file, and the file survives every terminal outcome:
   `output/` when the job completes, `error/` when it fails or is rejected. The job also keeps its
   content SHA-256, so the surviving artifact can be proved to be the one that was parsed. Nothing
   becomes unknowable.
2. **It is the largest concentration of personal data the product holds** — every beneficiary in every
   payroll, accumulating forever, with no remaining consumer once the job is done. An LGPD exposure
   that grows with throughput and buys nothing.

What is *not* touched by the purge: the job's summary figures (total, payment and cancellation counts,
payment-date range), the content hash, and the job history. Those are permanent. The **Payments** panel
says so plainly when the row is gone, rather than rendering an empty table that reads as data loss.

If a deployment needs the line detail to outlive the job, the artifact in `output/` is the source of
truth — archive that, not the database row.

## Estimating disk growth

Rough ballpark for a single instance:

| Per-job artifact | Typical size |
|------------------|--------------|
| Cleartext signed PDF | ~ source size + signature dictionary (~10–50 KB) |
| BSENC v1 envelope | source size + 37 bytes |
| Job row | ~ 1 KB |
| History row | ~ 200–500 bytes; 2–4 per successful job, more for retries / failures |

For 10 000 jobs / day on average documents, expect roughly:

| Surface | 30-day growth |
|---------|---------------|
| `output/` | dominated by document size (10 000 × 30 × source size) |
| `db/bulksigner.db` | < 100 MB (rows are small) |
| `logs/` | bounded by `RetainedFileCountLimit` × `FileSizeLimitBytes` (= 700 MB at defaults) |
| `error/` | proportional to failure rate; usually small |

The DB file rarely becomes the bottleneck. The output tree is the big surface — plan disk capacity
(or external archival) accordingly.

## Manual retention recipes

Operators script their own retention. A few patterns:

### Move-and-archive `output/` (recommended)

```bash
# Linux: nightly cron that moves files older than 7 days into an archive tree.
find /var/lib/bulksigner/output -type f -mtime +7 \
  -exec mv {} /archive/bulksigner/output/ \;
```

```powershell
# Windows: scheduled task that moves files older than 7 days.
Get-ChildItem C:\ProgramData\Lacuna\BulkSigner\data\output `
    -Recurse -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
    Move-Item -Destination D:\archive\bulksigner\output\
```

Moving (not deleting) preserves the audit trail in an off-instance location.

### Prune `error/` after triage

```bash
# Delete error/ directories older than 30 days. Review first.
find /var/lib/bulksigner/error -mindepth 1 -maxdepth 1 -type d -mtime +30 -print
# review the output, then drop the -print and add -exec rm -rf {} \;
```

Prefer manual review here — `error/` often contains the only forensic copy of what went wrong.

### Trim history rows

The integrity of the audit trail depends on the full history chain. If row volume becomes an
operational problem, prefer archiving the SQLite file (`mv bulksigner.db bulksigner-2026Q1.db`,
restart with a fresh DB) over partial deletes.

## Backup discipline

Independent of retention:

- **Back up `db/bulksigner.db` before every service upgrade.** Schema migrations run automatically at
  startup and are one-way.
- **Snapshot `output/` if it carries audit-significant artifacts.** Especially when encryption is
  enabled — losing an encrypted file is doubly irrecoverable (no password = no plaintext).
- **Treat `data/` as a unit when backing up.** `input/`, `processing/`, `output/`, `error/`, `db/`,
  `logs/` together describe the full operational state. A snapshot is consistent if taken with the
  service stopped or paused (and the in-flight job count at zero).
- **Under `Database:Provider = SqlServer`, the store is not in `data/`** and is your DBMS regime's
  concern — which is one of the two reasons a customer chooses that provider. Back it up on the same
  schedule as any other database of record, and keep the file-tree snapshot in step with it: a
  restored store whose `processing/` directories no longer exist is a startup recovery sweep with
  nothing to reconcile against.
- **Under `Storage:Provider = AzureFiles`, `processing/`, `output/` and `error/` are not in `data/`**
  either. Back the share up through Azure Files' own snapshot or backup facilities; `logs/` and, under
  `Sqlite`, `db/` remain on the host.

See [Operations](operations.md) for the pause / upgrade / backup procedure.

---

**Next:** [Troubleshooting](troubleshooting.md). **Previous:** [Approvals](approvals.md).
