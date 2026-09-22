---
sidebar_label: "Admin console"
sidebar_position: 8
---

# Admin console

The admin console lives at `/admin` on the Server. It is a Blazor web application read in **English
or Brazilian Portuguese**, following the browser's `Accept-Language` and a switcher on top of it; two
people can read the same deployment in different languages at the same moment. Certificate verdicts,
audit event names, log lines and Signer's own messages stay English on every screen.

Everything the console shows is read from the platform's database, and everything it changes is
written to the Audit Log with the signed-in account as the actor.

## Signing in

An **Admin Account** is a local login: an e-mail address, a password of at least twelve characters,
and a **Second Factor** from an authenticator app. There is no external identity provider and no reset
mail. The first account is created from `Admin:Bootstrap:*` on a Server whose account table is empty;
every later one is created by an Administrator on the Settings screen, who hands the initial password
over in person.

On first sign-in an account **enrolls** its second factor: the console shows a QR code for the
authenticator app, and then a set of **Recovery Codes**, shown once. A Recovery Code is a single-use
substitute for the authenticator; a new set replaces the whole old one. Keep them where a lost phone
cannot take them too.

Two roles:

| Role | May |
|---|---|
| **Administrator** | Read everything and change platform state: admit and revoke machines, register applications and issue keys, import and disable Vault Certificates, add and remove Trusted CAs, change settings, manage accounts. |
| **Auditor** | Read everything, change nothing. |

The Landing Page at `/` is what a browser sees before signing in. It says what the Server is and links
onward; it shows no platform state.

## Monitoring

### Audit Log

`/admin/audit`. The append-only record of platform events: API access, session and signing lifecycle,
workstation and PIN events, callback deliveries, admin actions. One row per event with the moment
(UTC), the event name, the actor, the subject and the outcome, plus details. PINs, document content
and signature bytes never appear.

Filters: an actor (display name or exact id), an API key (one key's own trail, refused calls
included), a correlation id (one request's whole trail), an event, a time window. Other screens link
into the trail through a **Trail** column, so a Signing Session or an API key row is one click from
its history. A row the database refused was written to the Server log at `Critical` instead, and the
console raises an alert when that has happened.

Retention is `Audit:RetentionDays` (365 by default), one of the seven settings an Administrator can
change on the Settings screen.

## Fleet

### Workstations

`/admin/fleet`. Every admitted machine: hostname, operating system, Workstation Service version,
number of certificates, last seen, and its standing with this Server's Trusted CAs. A machine's panel
shows its key fingerprint and posture, its certificates, and the actions on it: **send back to
Pending** (keeps its key and history) or **Revoke** (refused permanently, no way back). Revoking is the
control that does not need the machine's cooperation, and the right response to a machine that was
lost, stolen or decommissioned without an uninstall.

The trust-standing column reads one of five words per machine:

| Standing | Meaning |
|---|---|
| Up to date | The machine holds the Trusted CA set currently in force. |
| Behind | The machine still holds a previous set. |
| Refuses | The machine is configured not to take the Server's set (`UseServerTrustedCas` off). |
| Needs update | The machine's components predate protocol 2 and cannot ask for the set. |
| Not reported | The machine has not said which set it holds. |

### Admission queue

`/admin/admission`. Machines that have asked to join and are waiting for a person. Each row shows the
hostname, operating system, versions, the key's posture (**in hardware** or **in software**) and its
fingerprint, and how long it has been waiting. **Admit** lets it in; on its next reconnect the machine
connects and moves to the fleet screen.

The screen says above the table what admitting means: with no out-of-band channel to check a
fingerprint against, admitting is a decision rather than a verification. Read the hostname and the
posture, and if the deployment sets `Admission:RequireHardwareBackedKeys`, the Admit control refuses a
software-keyed machine and the row says why. A request nobody acts on lapses after
`Admission:PendingExpiry` counted from the machine's last request.

### Certificate Registry

`/admin/certificates`. Every Workstation Certificate the fleet has announced: thumbprint, subject
CPF, subject, issuer, validity, verdict, and which workstations hold it with each one's online state
and last-seen time. Filter by status. Entries are last-known state; a disconnected workstation's
certificates stay listed and flagged offline.

An `UNTRUSTED` row offers **Trust the issuer**: the Server walks the certificate's chain, names the
authority it could not reach a root through, and offers to add it as a Trusted CA. A machine on an
older Workstation Service sends no encoding, so its rows cannot offer this.

### Signing Sessions

`/admin/sessions`. Every Signing Session: the CPF, what it is **bound to** (a certificate on a named
workstation, or the vault), its state (active, expired, deactivated, replaced, exhausted, stranded),
when it was created and when it expires, the number of documents signed under it and, where the
deployment set a Signature Allowance, the spend against it. Each row links to its trail.

### Signing Operations

`/admin/operations`. One row per document submitted for signing: the document name, the session, where
it ran (a workstation or the vault), when it was submitted, its state (`Pending`, `Completed`,
`Failed`), the failure code and the stage reached when it failed, and the correlation id a client can
quote. A run interrupted by a Server restart is ended by a sweep as `Failed` with `RUN_STRANDED`.

## Access

### Client Applications

`/admin/applications`. The external systems that call the SignSession Contract, each with its API
keys. Register an application with a name (what the Audit Log will call it) and a description, then
**Issue key**: give the key a name saying where it is deployed and an optional expiry date. **The
key's value is shown once**, in a dialog, and only its SHA-256 is stored; nothing recovers it
afterwards. Each key row shows its age, last use, and its own trail.

A key can be **revoked** (the next request bearing it is refused, permanently) and its expiry edited.
An application can be **disabled**, which refuses every one of its keys at once while keeping them,
and **enabled** again. Missing, unknown, revoked, expired and disabled-application keys are all
rejected identically on the wire with `UNAUTHORIZED`.

### Vault Certificates

`/admin/vault`. Present only on a Server with `Vault:Enabled`; otherwise the screen says the vault is
off and names the setting. Lists every certificate the Server holds itself: CPF, subject, issuer,
validity, verdict, when it was imported, and whether it is in use.

**Import a PFX**: one certificate and its private key per file, holding an ICP-Brasil CPF, with the
file's password. The import proves the bag can be opened by the reader that will sign with it; a file
whose key is shrouded under `pkcs5PBES2` is refused with a message naming the legacy re-export
(`openssl pkcs12 -export -legacy`). The password is used once and never stored: a client application
supplies it as the `pin` at every session creation. An unlicensed Server refuses every import.

Two actions per certificate. **Disable** takes it **out of use**: it creates no session and signs
nothing until enabled again, while the file, its key and its history stay. **Destroy** deletes the
private key material and cannot be undone; the confirmation asks you to type the CPF. Neither reaches
a live session already bound to the certificate, except that the secret retained for that session is
dropped at once, so its next signature is refused. There is no export or download path anywhere.

### Trusted CAs

`/admin/trusted-cas`. The certification authorities an Administrator told this Server to trust, on
top of the ICP-Brasil roots the deployment already vouches for. Each row: the authority, its kind
(**root** or **intermediate**), how many certificates depend on it, and since when.

**Trust a certification authority**: upload one file, DER, PEM or a PKCS#7 bundle, decided by what is
in it rather than by its name. A file may carry a whole chain, and every authority in it is offered. A
holder's certificate is also accepted: the Server reads its issuer, follows the certificate's own
`caIssuers` pointers over the web where it has to (at most four fetches), and offers what it found,
flagging an authority fetched from a URL the untrusted certificate itself named as one whose fingerprint
to check especially carefully. Nothing is trusted until you confirm the offer.

Adding takes effect on the running Server with no restart and reaches every admitted machine on
protocol 2 within seconds. **Removing** one can turn Workstation Certificates and Vault Certificates
`UNTRUSTED`, so the confirmation says how many depend on it first. A machine that is offline keeps
trusting a removed CA until it reconnects. Removed rows are kept rather than erased so the Audit Log
can name them.

## System

### Settings

`/admin/settings`. Two things.

**Platform settings**: the seven keys an Administrator can override at runtime, each with a help text
and the deployed default beside it. A saved value beats the deployment's configuration and takes
effect without a restart; **Restore the deployed defaults** clears the overrides.

| Setting | Default |
|---|---|
| Default session duration | 1 h |
| Maximum session duration | 24 h |
| PIN prompt timeout | 60 s |
| Maximum PIN failures | 5 |
| PIN failure window | 15 min |
| Workstation reconnect grace | 15 s |
| Audit retention (days) | 365 |

Two switches are deliberately **not** here: `Admin:SecondFactor:Required` and `Vault:Enabled`. Both are
deployment configuration, because a switch that weakens the console's protection or turns on
server-held private keys must not be reachable from inside the console.

**Admin accounts**: every account with its role, access state, last sign-in and second-factor
enrollment. An Administrator can create an account, set a password (their existing sessions end within
five minutes), make an account an Auditor or an Administrator, **disable** it (kept, because the Audit
Log attributes its past actions to it) and enable it again, and **clear** somebody's second factor,
which also invalidates their Recovery Codes and leaves them to enroll again at their next sign-in. No
one can read or set another person's second factor.

### Server log

`/admin/logs`. The newest lines of one UTC day of the Server's own log, read from the rolling file
under `Logging:File:Directory`, filtered by level and text: when, level, source category, message,
and the correlation id that leads to the matching Audit Log rows. A convenience for whoever is at the
console, not a record: the console output is the record, and the file is deleted after
`Logging:File:RetainedDays`. On a deployment that turned the file off, the screen says so and names
the key.

### Your account

`/admin/account`. The one credential on the platform a person manages themselves: change the
password, **replace the authenticator** when changing device, and **mint a fresh set of Recovery
Codes**, with a Recovery Code accepted in place of the authenticator for that action.

## Banners

Two conditions put a banner on every page of the console for as long as they last: the Lacuna Test
PKI is trusted (`Certificates:Validation:UseLacunaTestPki`, a development switch that makes anybody's
sample certificate sign as `ACTIVE`), and an audit row could not reach the database.
