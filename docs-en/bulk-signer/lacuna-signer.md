---
sidebar_label: "Lacuna Signer integration"
sidebar_position: 12
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
| `Signer:Endpoint` | string | `""` | `Signer__Endpoint` | Any part of `Signer:*` is set. Cloud default: `https://signer.lacunasoftware.com`. |
| `Signer:ApiKey` | string | `""` | `Signer__ApiKey` | **REQUIRED, SECRET**, same condition. Format: `application-id\|secret`. |
| `Signer:PollIntervalSeconds` | int | `30` | `Signer__PollIntervalSeconds` | optional |
| `Signer:TimeoutHours` | int | `168` (7 days) | `Signer__TimeoutHours` | optional |
| `Signer:MaxConsecutiveApiFailures` | int | `5` | `Signer__MaxConsecutiveApiFailures` | optional |

The validator is **self-gating on this section** — omit `Signer:*` entirely and nothing here is
enforced, which is what a pure Local deployment does. Write any part of it and the whole block is
validated.

:::warning Changed in 2.1.0 — the `Signer:*` block is judged on its own
Up to 2.0.x the block was validated only when some profile selected `Method = LacunaSigner`. Profiles now
live in the operational store and can be switched to Lacuna Signer from the dashboard with no restart, so
the rule is stated the other way round:

- **A half-written `Signer:` block refuses the boot** even if no profile uses it — an endpoint with no
  API key, say, left behind for later. The message names both keys and offers removing the section as
  the remedy.
- **Selecting `Method = LacunaSigner` is refused when the host has no `Signer:*` settings** — at boot
  for a profile still being seeded from configuration, and on the profile page for one being saved.
- **Whether the host has `Signer:*` settings is what starts the remote-signer gateway and the poll
  worker**, so a profile switched over to Lacuna Signer after boot starts dispatching without a restart.
  On a host with the whole block set and no profile using it, the poll worker runs and finds nothing to
  do each interval — remove the section if this host signs everything locally.
:::

:::warning The API key is a secret.
Set it as `Signer__ApiKey` in `bulksigner.env` (Linux) / a Machine env var (Windows) / `.env`
(Docker). The literal value is scrubbed from logs.
:::

### Choosing the method from the dashboard

**This is where you pick the method on a running deployment.** `Signing:Profiles[]` is a one-time seed
imported on the first boot (see [Configuration](configuration.md#signingprofiles--per-folder-signing-profiles)),
so the next section describes what a seed looks like rather than where you go to change one.

The **Certificate** panel on `/profiles/{name}` carries the method, and so does the form at
`/profiles/_new`. It sits on that panel rather than the Behaviour one because the method decides whether
the profile has a local key at all: pick **Lacuna Signer** and the certificate source and its
coordinates are replaced by the three participant fields — name, email, identifier — which is the whole
of where such a profile's signature comes from.

The two directions differ, and the form says which before you save:

| Switching | When it takes effect | What happens to the other block |
|---|---|---|
| Local → **Lacuna Signer** | The next job claimed. **No restart** — the gateway runs on every host that has `Signer:*` settings, not only for the profiles that existed at boot. | The certificate coordinates are cleared, password included: a credential at rest for a key that lives at the service is one nothing will ever open. |
| **Lacuna Signer** → Local | The next **restart**, because a private key has to be opened and no save opens one. Until then the profile is reported as **degraded** on its own page, and jobs routed to it fail with `profile.degraded`. | The participant is cleared. |

Refusals happen at the save, in your display language: a participant missing any of its three fields,
an email with no `@`, and **selecting Lacuna Signer on a host with no `Signer:*` settings** — the one
refusal whose remedy is a configuration change and a restart rather than a form field, which is why its
wording names the keys.

The participant's identifier is **not** check-digit validated. Unlike an approver's CPF — which this
product writes into its own audit records — this one is handed to the remote service, and the service is
the authority on whether it knows the participant.

### `Signing:Profiles[].Method` + `Signer` block

Per-profile method selection **as a seed**, imported on the first boot against an empty profile table.
The default is `Method = Local`, so pre-existing profiles need no change.

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
- `Method = LacunaSigner` cannot be combined with an approval rule whose signer set is
  `ProfileKeyAndApprovers` — the remote signer would be handed an envelope of approver signatures
  rather than the payment file. See [Approvals](approvals.md#the-signer-set).

The same rules refuse a save on the profile page. The derived `default` profile (seeded when
`Signing:Profiles[]` is omitted) is always `Method = Local`.

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

The **Cancel** button on the job page asks first: its confirmation dialog names the file and says what
the cancel does from the job's current status — for a job waiting on Lacuna Signer, that its remote
document is canceled best-effort. `POST /api/jobs/{id}/cancel` asks nothing.

:::warning Clear Jobs does not cancel remote documents
**Clear Jobs** deletes every job record whatever its status, `AwaitingSigner` included, but it makes no
call to Lacuna Signer: a document already dispatched stays in the participant's inbox. Cancel those jobs
first if the participant should not sign them. See [Operations](operations.md#clear-jobs).
:::

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

## Under cluster mode

With cluster mode on, **each instance polls Lacuna Signer only about the documents it dispatched**, so
two instances never download the same signed bytes. Two consequences for dashboards and alerts:
`bulksigner_jobs_awaiting_signer` is per instance — sum it across the fleet — and a job an instance
dispatched before it died is reassigned to a survivor by the takeover sweep. A row carrying no owner
at all is polled by nobody. See [High availability](high-availability.md) for the details and the remedy.

## Troubleshooting cross-links

See [Troubleshooting](troubleshooting.md) for diagnosis steps on:

- Signer API unreachable / 5xx storm
- Wrong API key — `401`s from every call
- Document stuck `Pending` past `Signer:TimeoutHours`
- Operator canceled but the participant still sees the document
- The dashboard does not show the Lacuna Signer panel even though a profile uses it

---

**Next:** [CNAB240 payment files](cnab240.md). **Previous:** [Encryption](encryption.md).
