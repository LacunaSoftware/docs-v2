---
sidebar_label: "Retention"
sidebar_position: 11
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
| Job / history / event rows in SQLite | **No** | Same. |

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
- Job rows accumulate in SQLite. The DB file grows linearly with throughput.

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

See [Operations](operations.md) for the pause / upgrade / backup procedure.

---

**Next:** [Troubleshooting](troubleshooting.md). **Previous:** [Lacuna Signer integration](lacuna-signer.md).
