---
sidebar_label: "REST API"
sidebar_position: 9
---

# REST API: the SignSession Contract

The Server implements the **SignSession Contract**, the API a client application calls to open a
CPF-bound Signing Session and sign documents under it. This page covers authentication, the session
lifecycle, every operation, the error envelope, and where this Server deliberately answers differently
from the contract's other implementation.

:::tip
While the Server is running, the **machine-readable contract** is served at `/openapi/v1.json` (OpenAPI
3.1) and a **browsable reference** at `/scalar`. Both answer without a credential. This page is the
conceptual guide; the published document is the source of truth for field-level detail.
:::

## Contract version and base path

Every operation is served under **`/v1`**, and nothing else answers: a call to a bare route is refused
with `404 ENDPOINT_NOT_FOUND`. `v1` is the **contract version**, the only version a client should pin
to. The `version` field in the OpenAPI document is the Server's build version and says nothing about
wire compatibility.

## Authentication

Every operation requires the **`X-API-Key`** header, carrying an API key issued to a **Client
Application** in the admin console. Any of an application's keys authenticates the full surface; the
key scopes nothing within it. Missing, unknown, revoked, expired and disabled-application keys are all
rejected identically with `401 UNAUTHORIZED`.

Treat a `sessionId` and a `signatureId` as **bearer tokens** for the things they name: any accepted
key can use a session or fetch a document whose id it holds.

Every response, errors included, carries a Server-minted **`X-Correlation-Id`**. Quote it when
reporting a problem; it leads an operator to the request's whole trail.

## The session lifecycle

```
POST /v1/sessions  (cpf, pin)  ──▶  201 { sessionId, expiresIn, expiresAt }
        │
        ├──▶ GET  /v1/sessions/status?sessionId=…      is it still active?   (never extends it)
        ├──▶ GET  /v1/certificates/info?sessionId=…    which certificate, which verdict
        ├──▶ POST /v1/signatures        (sessionId, document)   ──▶ 202 { signatureId }
        ├──▶ POST /v1/signatures/batch  (sessionId, files[])    ──▶ 202 { results[] }
        │         └──▶ GET /v1/signatures/{signatureId}/document ──▶ 200 PDF | 409 | 422
        └──▶ POST /v1/sessions/deactivate (sessionId) ──▶ 200
```

1. **Create a session** with the holder's CPF and PIN. The Server tries the Vault Certificates held
   for that CPF first; failing that, it offers the PIN to the workstations holding a certificate for
   the CPF, where it is compared against the PIN in use there and never presented to the token. If no
   workstation has that PIN cached, the holder is prompted at their Tray App and **this request stays
   open until they answer or the prompt times out** (60 s by default). Allow for that in your client's
   timeout. Whichever certificate confirms the PIN binds the session.
2. **Sign** under the session, one document at a time or in a batch. The whole signature runs inside
   the request and typically takes a few seconds.
3. **Fetch** the signed PDF by the signature id. This is also where a signature's **outcome** is read.
4. **Deactivate** the session when the work is done, or let its idle window lapse.

At most one session is active per CPF; creating another replaces it. Signing **extends** the idle
window; reading status does not. A session also ends when the deployment's optional Signature
Allowance is spent.

## Operations

### `POST /v1/sessions`: create a Signing Session

```bash
curl -s https://trustbridge.example.com/v1/sessions \
  -H "X-API-Key: $API_KEY" -H "Content-Type: application/json" \
  -d '{ "cpf": "12345678909", "pin": "1234", "sessionDuration": 3600, "email": "holder@example.com" }'
```

| Field | | |
|---|---|---|
| `cpf` | required | Eleven digits, no punctuation. **Check digits are verified**, and the eleven repeated-digit values are refused, with `400 INVALID_REQUEST`. |
| `pin` | required | The certificate's PIN, whichever custody it is under. For a Vault Certificate, the password that opens its file. |
| `sessionDuration` | optional | Seconds. Omitted grants the Server's default window; above the maximum is **clamped**, not refused. |
| `email` | optional | A fallback address for the signer, used only where the bound certificate names none. Without it such a certificate is refused at signing time with `CERT_INCOMPLETE_IDENTITY`. |

```json
{ "sessionId": "8f3c…", "cpf": "12345678909", "expiresIn": 3600, "expiresAt": "2026-09-21T15:04:05Z" }
```

`expiresIn` is always the window actually granted. Refusals: `404 CERT_NOT_FOUND` (no certificate
for the CPF anywhere), `422 CERT_NOT_ACTIVE` (every certificate for the CPF carries a non-active
verdict), `401 INVALID_PIN`, `422 PIN_NOT_AVAILABLE` (prompt timed out, declined or could not be
shown), `422 WORKSTATION_OFFLINE` (every machine holding an active certificate is offline),
`429 TOO_MANY_PIN_ATTEMPTS` (per-CPF lockout).

### `GET /v1/sessions/status?sessionId=…`: check a session

Answers the session's state and how long it has left. An id that names nothing active still answers
`200` with `active: false`; omitting the id is `400`. Safe to poll; never extends the window. There is
no way to ask whether a CPF has a session: a client that lost the id creates a new session.

```json
{ "active": true, "sessionId": "8f3c…", "expiresIn": 3412, "expiresAt": "2026-09-21T15:04:05Z" }
```

### `POST /v1/sessions/deactivate`: end a session

```bash
curl -s https://trustbridge.example.com/v1/sessions/deactivate \
  -H "X-API-Key: $API_KEY" -H "Content-Type: application/json" -d '{ "sessionId": "8f3c…" }'
```

Ends the session immediately and drops the secret it rested on (the PIN a workstation had cached for
it, or the password the Server held to open a Vault Certificate). **Not idempotent**: with nothing
active it answers `401 SESSION_EXPIRED`. The response reports the CPF read off the session, the id,
`active: false` and `endedAt`.

### `GET /v1/certificates/info?sessionId=…`: describe the bound certificate

The certificate the session is bound to, as the platform last recorded it: `cpf` (the certificate's
subject, which need not equal the session's CPF), `subjectName`, `issuer`, `serialNumber`,
`notBefore`, `notAfter` and `status`. **Check `status` before signing**: a verdict can turn while a
session is live, and only `ACTIVE` can sign. Requires an active session; never extends it.

### `POST /v1/signatures`: sign a document

Two body shapes. JSON with the document base64-encoded:

```bash
curl -s https://trustbridge.example.com/v1/signatures \
  -H "X-API-Key: $API_KEY" -H "Content-Type: application/json" \
  -d "{ \"sessionId\": \"8f3c…\", \"document\": \"$(base64 -w0 contract.pdf)\", \"fileName\": \"contract.pdf\" }"
```

Or multipart, with a `sessionId` field and the PDF as a file part (the file name is taken from the
part):

```bash
curl -s https://trustbridge.example.com/v1/signatures \
  -H "X-API-Key: $API_KEY" \
  -F "sessionId=8f3c…" -F "document=@contract.pdf"
```

Answers `202`:

```json
{ "signatureId": "a1b2…", "status": "PROCESSING", "acceptedAt": "2026-09-21T14:10:00Z" }
```

**A `202` is not "it worked".** Once the document has reached the signature service this operation
answers the id whatever happens afterwards, because the id is the only way back to a document that may
have been signed. The fetch is where the outcome is read. `signatureId` is Lacuna Signer's own document
id. Only PDFs are signed (`422 UNSUPPORTED_DOCUMENT`); a document over `Signing:MaxDocumentBytes`
(10 MB by default, measured on decoded bytes) answers `413 DOCUMENT_TOO_LARGE`; no document at all is
`400 INVALID_DOCUMENT`; a missing `sessionId` is `400 INVALID_REQUEST`.

### `POST /v1/signatures/batch`: sign several documents

`multipart/form-data` only: a `sessionId` field and one file part per document, up to
`Signing:MaxBatchItems` (50 by default).

```bash
curl -s https://trustbridge.example.com/v1/signatures/batch \
  -H "X-API-Key: $API_KEY" \
  -F "sessionId=8f3c…" -F "files=@a.pdf" -F "files=@b.pdf" -F "files=@c.pdf"
```

Answers `202` with one result per document, **in the order the parts arrived**:

```json
{
  "results": [
    { "fileName": "a.pdf", "signatureId": "a1b2…", "status": "PROCESSING", "error": null },
    { "fileName": "b.pdf", "signatureId": null,    "status": "ERROR",
      "error": { "code": "DOCUMENT_TOO_LARGE", "message": "…" } },
    { "fileName": "c.pdf", "signatureId": "c3d4…", "status": "PROCESSING", "error": null }
  ],
  "acceptedAt": "2026-09-21T14:10:00Z"
}
```

Each document is independent: one that failed carries `status: "ERROR"` and a code from the same
vocabulary while its siblings carry ids. **Read the results, not the status code.** The whole call
fails only for something true of all of them: no live session, a certificate that cannot sign, more
documents than the limit (`400 INVALID_REQUEST`), or none (`400 INVALID_DOCUMENT`). Documents are
signed several at a time up to `Signing:SignerConcurrency`, and the whole call is awaited, so a large
batch takes as long as signing every document in it. A batch is **one** call for the throttle and for
the Signature Allowance.

### `GET /v1/signatures/{signatureId}/document`: fetch the signed document

```bash
curl -s https://trustbridge.example.com/v1/signatures/a1b2…/document \
  -H "X-API-Key: $API_KEY" -o signed.pdf -w '%{http_code}\n'
```

| Status | Meaning |
|---|---|
| `200` | The signed PDF, as the response body. |
| `409 DOCUMENT_NOT_READY` | Still being signed. Ask again. |
| `422 DOCUMENT_UNAVAILABLE` | Ended without a signed version: refused, cancelled or expired. `details` says which. Nothing to wait for. |
| `404 DOCUMENT_NOT_FOUND` | No document goes by this id. |
| `502 SIGNER_ERROR` | The signature service could not be asked; says nothing about the document. |

Nothing is stored by the Server, so how long a document stays fetchable is Lacuna Signer's retention.
Any valid API key may fetch any document whose id it knows, including one created by a different
Client Application, matching the reference implementation deliberately.

## The error envelope

Every error arrives in one envelope. `code` is a string, not a closed set: treat an unrecognised one
as a failure you did not expect rather than a parse error. Branch on `code`, never on `message`.

```json
{ "error": { "code": "CERT_NOT_ACTIVE", "message": "…", "details": "…" } }
```

| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_REQUEST` | 400, 415 | Malformed request, or a media type the operation does not read. `details` names the field. |
| `INVALID_DOCUMENT` | 400 | No document arrived, or it was empty. |
| `UNAUTHORIZED` | 401 | The API key was not accepted. |
| `SESSION_EXPIRED` | 401 | No active Signing Session goes by the `sessionId` named: expired, deactivated, replaced, exhausted or stranded. Create a new session. |
| `INVALID_PIN` | 401 | The PIN opened no Vault Certificate for the CPF and differs from the one in use at every workstation holding one. |
| `CERT_NOT_FOUND` | 404 | Creating: no certificate for the CPF anywhere. Reading or signing: the bound certificate is no longer held. |
| `DOCUMENT_NOT_FOUND` | 404 | No document goes by this signature id. |
| `ENDPOINT_NOT_FOUND` | 404 | No operation answers this method and path. Check the `/v1` prefix. |
| `DOCUMENT_NOT_READY` | 409 | Still being signed. Worth asking again. |
| `DOCUMENT_TOO_LARGE` | 413 | The document or the request body exceeds the Server's limit; `details` gives both sizes. |
| `CERT_NOT_ACTIVE` | 422 | Every certificate for the CPF, or the bound one, carries a non-active verdict (`EXPIRED`, `REVOKED`, `UNTRUSTED`, `STALE`). |
| `DOCUMENT_UNAVAILABLE` | 422 | The document ended without a signed version. |
| `PIN_NOT_AVAILABLE` | 422 | No comparison could be made: a prompt timed out, was declined or could not be shown, or a Vault Certificate could not be opened. |
| `WORKSTATION_OFFLINE` | 422 | Every active certificate for the CPF is on a workstation, and every one of those is offline (after the reconnect grace, on a sign). |
| `CERT_DATA_UNAVAILABLE` | 422 | The certificate's own data is not held for it. |
| `CERT_INCOMPLETE_IDENTITY` | 422 | The certificate does not name its holder well enough to sign; `details` names the field. An address is the one field the session's `email` can supply. |
| `UNSUPPORTED_DOCUMENT` | 422 | Not a PDF. |
| `SIGNER_REJECTED` | 422 | The signature service refused the document; `details` carries its account. |
| `SIGN_TIMEOUT` | 422 | The signature did not finish inside the request budget (60 s by default); nothing was signed. |
| `SERVER_BUSY` | 429 | The Server is running as many contract calls as it accepts and its queue is full. Nothing about the request was refused: **retry with a backoff of your own, with jitter**. No `Retry-After` is sent. |
| `TOO_MANY_PIN_ATTEMPTS` | 429 | The per-CPF failed-PIN lockout is in force. About one CPF, across every API key; retrying makes it worse. Clears as the oldest failures age out (15 min window by default). |
| `INTERNAL_ERROR` | 500 | The request could not be completed; safe to retry. |
| `SIGNER_ERROR` | 502 | The signature service could not be asked. On a sign this only arrives before the document reached it, so nothing was signed. |

**Two different 429s.** `SERVER_BUSY` is about the Server at this moment and clears on its own;
`TOO_MANY_PIN_ATTEMPTS` is about one person's certificate and does not clear by retrying. A client that
branches on the status alone will treat them alike, which is why they are separate codes.

## Where this Server differs from the reference implementation

The contract's other implementation, **CertSession**, is deployed and integrated against, and this
Server matches it almost everywhere. Seven answers differ on purpose. Two are silent: they produce
different behaviour without any error saying so.

| # | What differs | How a client meets it |
|---|---|---|
| 1 | **`expiresIn` is never null.** An omitted `sessionDuration` grants the Server's default window rather than an unlimited one. There is no unlimited session. | Silent. Read `expiresIn` and `expiresAt` off the response rather than assuming the window you asked for. |
| 2 | **Signing does not end the session; it extends it**, unless the deployment set a Signature Allowance. The reference ends a session after every signature, so a client written against it creates a session per document. | Silent. Such a client notices nothing except that its extra sessions cost the holder another PIN confirmation. To end a session with the document, call `POST /v1/sessions/deactivate`. An allowance of 1 on the Server reproduces the reference. |
| 3 | **Certificate validation checks the chain and revocation**, not only the expiry date. | Refused with `CERT_NOT_ACTIVE` where the reference would sign. A certificate that signs against CertSession can be `UNTRUSTED` here if the deployment's anchors do not cover its issuer. |
| 4 | **Fetching a signed document is not scoped to the creating Client Application.** | Nothing on the wire; the reference behaves identically. Listed because parity was chosen over isolation, knowingly, for this contract generation. |
| 5 | **A `cpf` has to be a real CPF**: check digits verified, repeated-digit values refused. | Refused with `400 INVALID_REQUEST` where the reference would create a session. Validate check digits in your form too. The schema's `pattern` is still `^[0-9]{11}$`, because a modulus is not a regular expression. |
| 6 | **A signing request with no `sessionId` is malformed**, not expired. | `400 INVALID_REQUEST` rather than `401 SESSION_EXPIRED`. A 401 means create a session and retry; this 400 means the request was built wrong. |
| 7 | **This Server sheds load.** A call arriving while the Server is already running as many as it accepts is refused rather than queued indefinitely. | `429 SERVER_BUSY`, which the reference never answers. Retry after a backoff of your own. Batching reduces how often you meet it. |

Where this Server answers **more** than the reference describes (seven fields on `certificates/info`,
an `acceptedAt` on the batch, a wider error vocabulary), nothing a client expects is missing.

**The Certificate Vault** is a capability the reference lacks rather than an answer that differs:
`POST /v1/sessions` tries the PIN against Vault Certificates before any machine, so a session can bind
with no workstation involved and no prompt shown. The one visible asymmetry: a vault-bound session
rests on a secret held only in the Server's memory, so a Server restart ends it and the client meets
`SESSION_EXPIRED` on its next call, recovering by creating a new session with the same PIN. A
workstation-bound session survives the same restart.

## Writing a robust client

- **Store the `sessionId`.** No call recovers it from a CPF.
- **Be ready for `SESSION_EXPIRED` on any call**, and recover by creating a new session. You cannot
  tell whether a deployment set a Signature Allowance, and are not meant to.
- **Read the outcome at the fetch.** A `202` says the document was accepted, not signed. Poll the
  document endpoint on `409`; stop on `200` or `422`.
- **Set a generous timeout on `POST /v1/sessions`.** A creation that goes to a Tray prompt waits for a
  human, up to the prompt timeout plus a few seconds.
- **Branch on `error.code`**, and handle the two 429s differently.
- **Batch when you have many documents.** One call, one throttle slot, one allowance charge.
- **Send `email`** if any certificate you sign with might carry no address.

## Trying the contract by hand

Lacuna Software can provide a Postman collection of the contract as this Server implements it, with
an environment carrying a small base64-encoded PDF. Import both, paste an API key issued on the
Client Applications screen into `apiKey`, and run the requests in order: create a session (watch the
Tray App prompt if no PIN is cached), sign a document, fetch it. The collection captures `sessionId`
and `signatureId` into the environment so nothing needs pasting between steps. `Docs/openapi` in the
product repository holds the committed contract and the divergence notes the collection was built
from.
