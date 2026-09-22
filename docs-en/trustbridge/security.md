---
sidebar_label: "Security"
sidebar_position: 10
---

# Security

What protects what on the platform, where each secret lives, and what an operator has to keep.

## The founding claim, and its one exception

**The private key of a Workstation Certificate never leaves the workstation.** The Workstation Service
is the only path to the certificates on a machine, the key only ever sees a hash, and signing with an
A3 certificate happens on the hardware that holds it. Nothing on the Server can sign with a
Workstation Certificate, and nothing in the product exports one.

The **Certificate Vault** is the deliberate exception, off by default. With `Vault:Enabled=true` an
Administrator can import an A1 certificate, key and all, and the Server signs with it. That trades
custody for convenience: a key at rest in the platform's own store rather than on a card that cannot
give it up. Which custody a certificate uses is an operator's and an auditor's concern; a client
application is never told.

## PIN handling

A PIN is what authenticates a holder to their token so a signature can be made. Four rules govern it:

- **The PIN is entered locally.** The holder types it at the Tray App on the machine the token is
  plugged into, in the console session only. The Workstation Service caches it, encrypted, in the PIN
  Cache, keyed per certificate, with a sliding idle TTL (8 h by default).
- **The PIN a client sends is compared, not presented.** When `POST /v1/sessions` relays a PIN to a
  workstation, the service compares it against the PIN already in use there. A wrong value from the
  network cannot burn the token's retry counter. Only PINs the holder typed reach the hardware.
- **Two lockouts bound guessing.** The Server locks a CPF out of session creation after
  `Sessions:MaxPinFailures` (5) failures inside `Sessions:PinFailureWindow` (15 min), counted across
  every API key and answered `429 TOO_MANY_PIN_ATTEMPTS`. The workstation refuses entries for a
  certificate after `Tray:MaxConsecutivePinFailures` (3) token rejections in a row, for
  `Tray:PinFailureCooldown` (5 min). Neither can make hardware lockout impossible: a holder can still
  lock their own token by mistyping.
- **PINs never appear in the Audit Log, the Server log or the wire beyond the relay.** The
  Workstation Service's PIN Cache is memory-only by default; `PinCache:SurviveRestart` persists it
  under DPAPI machine scope in a SYSTEM-and-Administrators-only file, a documented deviation an
  administrator opts into.

For a Vault Certificate, the `pin` a client sends is the password that opens the certificate's file.
The Server uses it to open the key at session creation, holds it in memory for that one session, and
never writes it down. Deactivating the session, or restarting the Server, drops it.

## The Key Ring Protector

Both of the Server's key rings are rows in its database:

| Key ring | Protects | If it cannot be read |
|---|---|---|
| `web-sessions` | Admin cookies, antiforgery tokens, Blazor circuits | Every administrator signs in again, and nothing else |
| `certificate-vault` | The private key of every Vault Certificate | **The host stops.** Minting a fresh key would silently orphan every certificate already stored |

Both are sealed under one X.509 certificate with an RSA key that the platform does **not** keep: the
**Key Ring Protector**, supplied as `KeyRingProtector:Certificate` (base64 PKCS#12). Every Server needs
one, vault or no vault, because the web-session ring needs it too. Whoever can read the protector and
the database can read every Vault Certificate, so the protector is a secret in its own right, and the
`.env` or app setting holding it deserves the same care as a private key.

**Back up the PKCS#12 permanently, somewhere the platform cannot reach.** Losing it makes every Vault
Certificate unopenable by anyone, this platform included. There is deliberately no escrow. A Key Vault
reference on Azure is a convenient home for the running Server and is not a backup.

**Rotation is additive.** A new protector seals new keys; it never re-wraps what is already stored. The
outgoing protector moves to `KeyRingProtector:RetiredCertificates:{n}:Certificate` and its PKCS#12 is
kept **forever**. Delete a retired protector and you have destroyed everything sealed under it, with
every symptom pointing at the database. The Server states the posture at every start: the current
thumbprint and the retired count.

## The Certificate Vault

Turning the tier on brings three things a vault-off deployment never meets:

- **The Lacuna PKI SDK licence is on the critical path.** The Server validates what it holds through
  the SDK, which reads nothing unlicensed. Without a current licence every Vault Certificate reports
  `UNTRUSTED` and every import is refused. The image carries no licence; it arrives as
  `Certificates:Validation:License`, and it expires without anything failing loudly beyond a
  `Critical` line at start.
- **A PKCS#12 must be in the legacy PFX shape.** The library the platform signs with cannot read a
  key shrouded under `pkcs5PBES2`, which is what `openssl pkcs12 -export` writes unless told `-legacy`,
  and what recent Windows export paths write too. Such a file is refused at import, naming the
  re-export:
  ```bash
  openssl pkcs12 -export -legacy -in holder.pem -inkey holder.key -out holder.pfx
  ```
- **The vault can latch shut** when the Server starts before its database answers. See
  [Operations](operations.md#the-vault-latch).

The import password is used to prove the bag opens and is **never stored**: nothing can open a stored
bag unattended, which is also why no unattended pass can check old bags for the legacy shape. There is
no export or download path. A certificate leaves the vault by being **destroyed**, which cannot be
undone, and the confirmation asks for the CPF to be typed. **Out of use** stops a certificate opening
sessions and signing while keeping it.

A vault-bound Signing Session does not survive a Server restart, because the secret that opens the
certificate is held only in memory. That is a property of the custody, not a fault.

## API keys

An **API key** authenticates a Client Application to the whole contract surface. It is issued on the
Client Applications screen with a name and an optional expiry, **shown once**, and stored only as its
SHA-256. Every accepted key of an application is equivalent; the key scopes nothing.

- **Revoke** a key and the next request bearing it is refused, permanently.
- **Disable** an application and every one of its keys is refused at once; enabling restores them.
- **Expire** a key at the end of a UTC day, or clear the date to make it open-ended again.
- Rotate by issuing a new key beside the old one, deploying it, then revoking the old one.

Missing, unknown, revoked, expired and disabled-application keys are all refused identically with
`401 UNAUTHORIZED`, so a caller learns nothing about which it was. Each key has its own trail in the
Audit Log, refused calls included.

A `sessionId` and a `signatureId` are bearer tokens for what they name: any accepted key can use a
session or fetch a document whose id it holds. Do not hand either to a party who should not have it.

## Admin accounts and the second factor

Admin Accounts are local. Every account carries a **Second Factor** (TOTP from an authenticator app)
in both roles, enrolled by its owner and known to nobody else. **Recovery Codes** are single-use
substitutes, issued as a set at enrollment and shown once. An Administrator can clear somebody's second
factor, which invalidates their Recovery Codes and forces re-enrollment, but can never read or set it.

`Admin:SecondFactor:Required` (default `true`) is deployment configuration and is deliberately absent
from the Settings screen: a switch that disables the second factor, reachable from inside the console
it protects, is a switch an intruder flips on the way past. A row saved in the database under that key
is ignored. The same guard applies to `Vault:Enabled`.

Passwords are at least twelve characters. There is no reset mail; an Administrator sets a new password
on the Settings screen and hands it over in person, and the account's existing sessions end within
five minutes. Disabling an account keeps it, because the Audit Log attributes its past actions to it.

### Break-glass: a lost authenticator

An Administrator who has lost their device can be locked out even while the platform believes another
Administrator can sign in. The way back is from the deployment, not the screens:

1. Set `Admin:SecondFactor:Required=false` and restart the Server.
2. Let them sign in with their password and enroll a new authenticator.
3. Set it back to `true` and restart.

The Server announces the weakened posture at **every** start while it is off, not just the first,
because a break-glass nobody closed again is the failure worth warning about.

## Workstation admission

A machine has **no shared secret** to join with, and looking for one is looking for something the
product deliberately lacks. It mints a **Workstation Key** in its TPM where one is usable (otherwise in
software), announces itself, and waits for an Administrator to admit it. Once admitted, it proves
itself on every connection with a short-lived signed **Workstation Assertion** rather than a
credential: nothing is issued, nothing is stored, and a captured assertion has already been spent.

The **Installer Key** that also signs an admission request is anti-abuse, not authentication: every
copy of TrustBridge holds the product's private half. A deployment that wants a key nobody else holds
mints one, names its public half under `Admission:InstallerKeys` (which replaces the product's key),
and delivers the private half through its own installer.

What admission is worth is bounded and said on the screen: with no out-of-band channel to check a
fingerprint against, a machine is noticed rather than verified. The controls around it:
`Admission:MaxPending` bounds the queue, `Admission:RequestsPerAddress` bounds a source address,
`Admission:PendingExpiry` lapses abandoned requests, and `Admission:RequireHardwareBackedKeys` refuses
software-keyed machines. The key posture is the machine's own claim; TPM attestation is out of scope.

**Revocation** on the fleet screen refuses a machine permanently and does not need its cooperation. A
machine whose disk was cloned with a software key is a cloned identity, which is what the
hardware-only posture exists to refuse.

## Trust anchors

The platform trusts the **ICP-Brasil roots** the PKI SDK carries by default. A private certification
authority is added as a **Trusted CA** on the admin console, in force on the running Server and pushed
to every admitted machine. Anyone who can add a Trusted CA can make certificates of their own validate
as `ACTIVE`, which is why the action is an Administrator's and is audited, and why an authority
discovered over the web from a URL the untrusted certificate itself named is flagged for fingerprint
checking before it is confirmed.

On a workstation, anchor files under `C:\ProgramData\TrustBridge\anchors\` are the equivalent, behind
an ACL the installer owns, and are disregarded while the machine holds a non-empty set from the Server.

Two switches widen trust and are worth knowing about: `UseMachineRootStore` (every public CA in the
Windows root program, on a workstation) and `UseLacunaTestPki` (**development only**: Lacuna publishes
the private keys of those sample certificates, and a Server with it on shows a warning banner on every
admin page).

`Certificates:Validation:RevocationGraceWindow` (24 h) is the other trust decision: exactly how long a
certificate keeps signing after its CA stopped answering, revoked or not. Zero is the strictest
posture.

## Network posture

- **Workstations connect outbound only**, over HTTPS to the Server. No inbound port is opened on a
  machine, and the Service–Tray channel is a local named pipe whose ACL is its whole access control.
- **The Server terminates its own TLS** on Docker and must present a chain every workstation trusts;
  on App Service the platform terminates it, and `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` is what
  keeps the caller's address in the Audit Log. Behind any proxy, the same setting applies.
- **Seven realms share one port**, told apart by path: the contract under `/v1`, the workstation
  channel, workstation admission, the published documentation, the Landing Page, the health probe and
  the admin pages. A path outside every realm is answered with an API-key `401` before a browser sees
  it. `/healthz`, `/` and the documentation answer without a credential and deliberately reveal
  nothing about platform state.
- **The global throttle** (`Throttle:ConcurrencyLimit`, 200) is a circuit breaker over the contract
  surface against a runaway client, and cannot be switched off.
- **Never run a deployment as `ASPNETCORE_ENVIRONMENT=Development`**: the image carries a
  development settings file with a sample licence and a shared test Signer's credentials, inert only
  because a deployment is Production.

## What is written where

| Record | Holds | Never holds |
|---|---|---|
| **Audit Log** (database) | Actor, subject ids, outcome, timestamps for every API call, session and signing event, workstation and PIN event, admin action | PINs, document content, signature bytes |
| **Server log** (console, rolling file, Application Insights) | What the Server was doing, with a correlation id; audit rows the database refused, at `Critical` | PINs, key material |
| **Workstation Service log** (Application event log, Tray diagnostics pane) | Where each install-time value came from, connection state, refusals, verdicts | PINs |
| **Database** | Sessions, operations, registry, vault ciphertext, both key rings, admin accounts, settings overrides | The Key Ring Protector, any Signer document |

Nothing on either component writes a document to disk. Documents are held in transit only, in memory,
bounded by `Signing:MaxDocumentBytes` times `Signing:MaxBatchItems`.
