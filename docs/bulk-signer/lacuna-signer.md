---
sidebar_label: "Lacuna Signer integration"
sidebar_position: 10
---

# Lacuna Signer integration

Operator walkthrough for routing a profile through **Lacuna Signer** instead of a locally-held
certificate. Local certificate signing (PFX / PKCS#11 / Windows store) and Lacuna Signer signing
**coexist per profile** — different watched folders can use different signing methods in the same
instance.

## When to use this

Pick **`Method = LacunaSigner`** for a profile when:

- A human (not a certificate held by the server) must sign each document — e.g. counter-signed
  contracts, employment agreements, HR onboarding paperwork.
- The signer's identity is the participant's, not the service's. Each dispatched document is owned by
  the participant on the Signer side.
- The audit trail you want is the one Signer keeps (signer identity, signature evidence, refusal
  reasons, expiry).

Pick **`Method = Local`** (the default) when:

- The signature is the *service's* — automated invoice signing with the company's signing cert, NFe
  runtime signing on a PKCS#11 token, batch counter-signing.
- The cert lives on the host (PFX / HSM / Windows store) and there's no human in the loop.

Both can run side by side. A single instance can watch `input/contracts/` (LacunaSigner) and
`input/nfe/` (Local PKCS#11) at the same time.

## Architecture summary

```
input/ ─▶ Watcher ─▶ Queued ─▶ worker claims
                                    │
                profile.Method?  ───┤
                                    │
   Local ───────────────────────────▶ sign in-slot ─▶ Verifying ─▶ Completed
                                    │
   LacunaSigner ─▶ upload + create-document ─▶ AwaitingSigner  (concurrency slot RELEASED)
                                                     │
                            poll worker tick ────────┤
                                                     │
                              Pending      → stays AwaitingSigner
                              Concluded    → download bytes ─▶ Verifying ─▶ Completed
                              Refused/Expired/Canceled → Failed
                              timeout      → Failed
```

Two **cooperating workers** instead of one:

1. **The pipeline worker** claims `Queued` jobs and, for LacunaSigner profiles, *only* dispatches
   them to Signer (upload + create-document) and transitions them to `AwaitingSigner`. The pipeline
   slot is **released immediately after dispatch** — the job is now parked on the remote side and the
   worker is free to pick the next item up.
2. **A separate poll worker** wakes every `Signer:PollIntervalSeconds` (default 30 s) and walks every
   `AwaitingSigner` row. For each row it checks the document status on the Signer API; concluded
   documents are downloaded and pushed through the same verify → encrypt → promote tail the Local
   path uses.

This split matters: holding a `Pipeline:MaxConcurrency` slot while a human takes days to sign would
defeat the queue entirely.

## The state machine, extended

`AwaitingSigner` slots between `Processing` and `Verifying` for LacunaSigner profiles:

```
Queued ─▶ Processing ─┬─ Local sign ok ─────────────▶ Verifying ─▶ Completed
                      │                                            └▶ Failed
                      └─ dispatched to Signer ─▶ AwaitingSigner
                                                      │
                          concluded → download ───────┼──▶ Verifying ─▶ Completed
                          refused/expired/timeout ────┴──▶ Failed
                          operator cancel ───────────────▶ Canceled (best-effort remote cancel)
```

Local-only profiles never enter `AwaitingSigner`. LacunaSigner profiles never take the local
`Processing → Verifying` direct path.

## Configuration

### `Signer:*` — one tenant per host

The Signer connection is **global** — one endpoint + one API key for the host, shared by every
profile that uses `Method = LacunaSigner`.

| Key | Type | Default | Env override | Required when |
|-----|------|---------|--------------|---------------|
| `Signer:Endpoint` | string | `""` | `Signer__Endpoint` | At least one profile has `Method = LacunaSigner`. Cloud default: `https://signer.lacunasoftware.com`. |
| `Signer:ApiKey` | string | `""` | `Signer__ApiKey` | **REQUIRED, SECRET**, same condition. Format: `application-id\|secret`. |
| `Signer:PollIntervalSeconds` | int | `30` | `Signer__PollIntervalSeconds` | optional |
| `Signer:TimeoutHours` | int | `168` (7 days) | `Signer__TimeoutHours` | optional |
| `Signer:MaxConsecutiveApiFailures` | int | `5` | `Signer__MaxConsecutiveApiFailures` | optional |

The validator is **self-gating** — it only enforces `Endpoint` + `ApiKey` when at least one profile
has `Method = LacunaSigner`. Pure Local deployments don't need to set anything under `Signer:*`.

:::warning The API key is a secret.
Set it as `Signer__ApiKey` in `bulksigner.env` (Linux) / a Machine env var (Windows) / `.env`
(Docker). The literal value is scrubbed from logs.
:::

### `Signing:Profiles[].Method` + `Signer` block

Per-profile method selection. The default is `Method = Local`, so pre-existing profiles need no
change.

```json
"Signing": {
  "Profiles": [
    {
      "Name": "contracts",
      "Format": "Pades",
      "Method": "LacunaSigner",
      "Verify": true,
      "Encrypt": false,
      "ValidateCertificate": false,
      "Signer": {
        "Name": "Jack Bauer",
        "Email": "jack.bauer@example.com",
        "Identifier": "75502846369"
      }
    }
  ]
}
```

Profile-level validation:

- `Method = LacunaSigner` **requires** a non-empty `Signer:{Name, Email, Identifier}` block. The
  validator refuses partial blocks.
- `Method = LacunaSigner` **forbids** a `Certificate:*` block (no local cert involved).
- `Method = LacunaSigner` **forbids** `ValidateCertificate = true` (there's no local cert to
  validate).
- `Method = Local` rules are unchanged: cert block required, `Signer` block ignored if present.

The synthesised `default` profile (when `Signing:Profiles[]` is omitted) is always `Method = Local`.

## Operator flow

1. **Operator drops a file** into a folder watched by a LacunaSigner profile (or
   `POST /api/files?profile=contracts`).
2. **Watcher / endpoint** enqueues the job; `Status = Queued`.
3. **The pipeline worker** claims the next slot, transitions the job to `Processing`, then uploads
   and creates the document on Signer. On success the job transitions to `AwaitingSigner` with the
   remote document id recorded; the slot is released.
4. **Signer** emails the participant; the participant signs through the Signer UI on their own time.
5. **The poll worker** ticks every `Signer:PollIntervalSeconds`. On each tick it loads every
   `AwaitingSigner` row, oldest-first, and for each:
   - **Pending** → leaves the row alone.
   - **Concluded** → downloads the signed bytes, transitions to `Verifying`, runs the same verify →
     optionally-encrypt → promote tail, transitions to `Completed`.
   - **Refused / Expired / Canceled** → transitions to `Failed` with `signer.document-rejected`.
   - **Local timeout** (`AwaitingSigner` longer than `Signer:TimeoutHours`) → transitions to `Failed`
     with `signer.timeout`. The remote document is left as-is on the Signer side.

The dashboard surfaces `AwaitingSigner` as a distinct status (yellow chip, hourglass icon). The Job
detail page shows the remote document id and the dispatch time, and an **Awaiting signer** stat tile
appears when any LacunaSigner profile is configured.

## Cancel semantics

Operator cancel is widened to **`{Queued, AwaitingSigner}`** for LacunaSigner profiles. `Processing`
and `Verifying` remain sacred.

When an operator cancels an `AwaitingSigner` job:

1. The job transitions to `Canceled` locally — same handler, same audit trail.
2. The handler then makes a **best-effort** remote-cancel call to Signer. Failures are logged at
   Warning but do **not** roll back the local cancel.
3. If the remote cancel failed, the participant may still see the document in their Signer inbox. The
   local job is correctly `Canceled` regardless.

:::note Best-effort cancel is a deliberate trade-off.
Rolling back the local cancel because a network round-trip failed would leave the operator in limbo
and contradict the "cancel returns closure" behavior. The orphaned-remote-document case is rare and
benign — the participant can ignore the email, or the operator can clean up in the Signer admin.
:::

## API failures and the per-job budget

The Signer integration distinguishes two failure shapes:

- **Transient** — network blip, 5xx, rate-limit, timeout. The poll worker increments a per-document
  failure counter and continues to the next row. The counter resets on the first successful call.
  Once `Signer:MaxConsecutiveApiFailures` is exceeded for a single document, that job is failed with
  `code = signer.unreachable`. Other rows are unaffected.
- **Permanent** — a 4xx that won't be fixed by retrying (invalid API key, unknown document,
  malformed request). The job is failed immediately with `code = signer.unreachable`.

A process restart resets the in-memory failure counters. If the underlying outage cleared between
failures and restart, polling resumes normally on next boot.

:::note Dispatch vs poll asymmetry.
`Signer:MaxConsecutiveApiFailures` only protects the **poll** path. A transient failure during
**dispatch** fails the job on the first error rather than being retried against a budget — by design,
since dispatch is a single short call at the start of the job. If your Signer endpoint is flaky
enough that dispatch failures matter, retry from the dashboard or REST
(`POST /api/jobs/{id}/retry`) once the upstream is back.
:::

## Restart recovery — `AwaitingSigner` rows are NOT swept

The startup recovery sweep transitions any stuck `Processing` / `Verifying` job to `Failed` (those
were mid-flight when the previous process died). **`AwaitingSigner` rows are explicitly excluded** —
the work is parked on the remote side; sweeping them locally would lose data the host has no business
invalidating. The poll worker resumes polling them on next boot, exactly where it left off.

## What lands in `output/`

For LacunaSigner profiles, the bytes promoted to `output/` are the bytes **Signer signed** — the
participant's signature on the original document, downloaded after the document concludes. The verify
and encrypt stages run on those bytes exactly as they would for a Local profile, so:

- `Verify = true` (default) — the signature is verified against the configured policy after download.
- `Encrypt = true` + `Encryption:Enabled = true` — the downloaded bytes are AES-256-GCM-encrypted into
  a BSENC v1 envelope; the cleartext is never written to `output/`.

Original input files are deleted from `input/` only after the verify stage succeeds — the same
invariant as the Local path.

## Metrics

Signer-specific Prometheus instruments are exposed at `/api/metrics`:

| Metric | Kind | What it tracks |
|--------|------|----------------|
| `bulksigner_jobs_dispatched_to_signer_total{profile}` | Counter | Successful dispatches to Signer, labeled by profile name. |
| `bulksigner_jobs_awaiting_signer` | Gauge | Live count of `AwaitingSigner` rows. |
| `bulksigner_signer_poll_duration_seconds` | Histogram | Per-tick duration for one full pass over `AwaitingSigner` rows. |
| `bulksigner_signer_api_errors_total{op}` | Counter | Signer API failures, labeled by operation. |

## Troubleshooting cross-links

See [Troubleshooting](troubleshooting.md) for diagnosis steps on:

- Signer API unreachable / 5xx storm
- Wrong API key — `401`s from every call
- Document stuck `Pending` past `Signer:TimeoutHours`
- Operator canceled but the participant still sees the document
- The dashboard does not show the Lacuna Signer panel even though a profile uses it

---

**Next:** [Retention](retention.md). **Previous:** [Encryption](encryption.md).
