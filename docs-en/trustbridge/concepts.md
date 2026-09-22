---
sidebar_label: "Concepts"
sidebar_position: 2
---

# Concepts

TrustBridge uses a small, precise vocabulary, and the admin console, the API and the logs all use
it the same way. This page defines each term once. The Portuguese term shown beside some entries is
what the admin console and the Tray App display when read in Brazilian Portuguese.

## The platform

### TrustBridge

The platform as a whole: the Server, the Workstation Service and the Tray App. The SignSession
specification uses "Trust Bridge" for the certificate-monitoring Windows service specifically; in
this documentation the unqualified name means the platform, and the service is always the
**Workstation Service**.

### Server (*Servidor*) {#server}

The central web application: the SignSession Contract REST API, the admin console, the Landing Page,
the workstation channel and the health probe, all on one port and told apart by path. It holds the
platform's only database: sessions, operations, the Certificate Registry, the Certificate Vault, the
Audit Log, admin accounts, both key rings and the settings an Administrator saved.

### Workstation Service

The Windows Service installed on a user's machine. It is the only access path to the certificates on
that machine and to their private keys, through PKCS#11 vendor middleware and the Lacuna PKI SDK. It
connects **outbound** to the Server over SignalR/WebSockets, so no inbound port is opened on the
machine. The private key of a Workstation Certificate never leaves the workstation.

### Tray App

The Windows tray application running in the signed-in user's session on the same machine. It shows
certificate status and the certificate list, collects the PIN when a Signing Session needs one, shows
whether the machine is waiting to be admitted, and has a diagnostics pane with the service's recent
log lines. It talks to the Workstation Service over a local named pipe and never to the Server.

### Landing Page

The Server's unauthenticated front door at `/`. It says what this Server is and links to the admin
console, the published documentation and Lacuna Software. It names no platform state, because
everyone who can reach the Server can read it.

### Signer

Lacuna Signer, the external signature service that owns document flow: it computes the hash to sign,
assembles the signed PDF and serves it for download. TrustBridge signs hashes; it never assembles or
stores documents.

## Sessions and signatures

### Signing Session (*Sessão de Assinatura*) {#signing-session}

The CPF-bound authorization that permits signing with a user's certificate. At most one is active
per CPF; creating a new one replaces it. It is addressed by an opaque `sessionId` that its creation
answers. The CPF binds a session but does not address one, and no call recovers the id from a CPF.

A session is created when the PIN supplied by the client application proves the holder of a
certificate for that CPF:

- for a **Workstation Certificate**, by matching the PIN entered at a single workstation's Tray App;
- for a **Vault Certificate**, by opening the certificate's own key.

From creation it is bound to that one certificate and its holder, and signing under it routes only
there. It expires after an **idle window** that only signing activity extends; reading its status
never extends it. Where the deployment granted a **Signature Allowance**, it also ends after that many
signing calls.

A workstation-bound session survives the workstation disconnecting (it is inert while the machine is
offline) and survives Server restarts. A vault-bound session does **not** survive a Server restart,
because the secret that opens the certificate is held only in memory; such sessions end as
`Stranded` and the client creates a new one.

"Session" on its own always means Signing Session. A PKCS#11 token session, a Windows logon session
and an admin's web login session are different things and are always qualified.

### Signing Operation (*Operação de Assinatura*) {#signing-operation}

The Server-side record of one document's signing run under a Signing Session, created at submission
and driven to completed or failed. One session may cover many Signing Operations. The id a client is
answered with, and fetches the signed document by, is the Signer document's own id.

### Signature Allowance (*Franquia de Assinaturas*) {#signature-allowance}

An optional second bound on a Signing Session: how many signing **calls** may be made under it. It is
granted at creation from `Sessions:SignatureAllowance`, fixed for the session's life, and absent by
default. One charge is spent per call, whatever the number of documents: a batch of fifty spends one,
and a call whose documents all failed before the key was used spends none. A session that runs out is
**Exhausted**. An allowance of 1 reproduces the single-use sessions of the reference implementation.

The bound is a policy bound rather than a security boundary: concurrent calls are each authorized
before any of them has spent a charge. The Audit Log's per-signature rows are the exact record.

### Console Session (*sessão de console*) {#console-session}

The Windows logon session attached to the machine's physical console. A workstation can hold several
logon sessions at once (remote desktop, fast user switching); a PIN prompt is shown only in this one,
a PIN may be entered only from it, and the Workstation Service's log can be read only from it.

### PIN Cache (*Cache de PIN*) {#pin-cache}

The Workstation Service's secure store of token PINs, keyed per certificate and populated only by
PIN entry at the Tray App. Entering a PIN once covers every certificate on the same token. Entries
expire after a sliding idle TTL and are purged on explicit forget, on deactivation of the session they
authorized, or on a wrong-PIN failure, but not on token removal. The cache is memory-only by default
and can optionally survive reboots. Creating a session or signing consumes a cached PIN when present;
neither lifetime governs the other.

## Certificates and custody

### Workstation Certificate (*Certificado de Estação de Trabalho*) {#workstation-certificate}

A certificate held on a machine, reachable only through that machine's Workstation Service, and
recorded in the Certificate Registry. Its private key never leaves the workstation, and signing with
it happens there. An **A3 Certificate** (smart card or USB token) is always a Workstation
Certificate. An **A1 Certificate** installed in the machine's Windows store is also one.

### Vault Certificate (*Certificado do Cofre*) {#vault-certificate}

A certificate the Server itself holds, private key and all, imported by an Administrator as a PKCS#12
and kept in the Certificate Vault. It belongs to no machine and needs nothing online to open a session
or sign. The password that unlocks it is supplied by the client application as the `pin` at every
session creation and is never written down: the platform persists what it cannot sign without, and
nothing that would let it sign unasked.

This is deliberately the more convenient and the weaker of the two custodies. Which custody a
certificate uses is an operator's and an auditor's concern and is not told to a client application.
An Administrator may take a Vault Certificate **out of use** (*Fora de uso*), which stops it opening
sessions and signing while keeping the certificate and its history, or destroy its key material,
which cannot be undone. There is no export or download path anywhere on the platform.

### Certificate Registry (*Registro de Certificados*) {#certificate-registry}

The Server-side, persisted mapping of certificate to workstation: which certificates (thumbprint,
subject CPF, status) are present on which connected Workstation Services. Each service announces its
certificates on connect and on every insertion or removal. A certificate's status is the latest
validation verdict its workstation reported, and only `ACTIVE` can open sessions or sign. Entries are
last-known state: a disconnected workstation's certificates stay visible, flagged offline with a
last-seen time. The same certificate may legitimately be registered on several workstations.

### Certificate Vault (*Cofre de Certificados*) {#certificate-vault}

The Server-side store of Vault Certificates: what the platform holds, for whom, the latest verdict on
each, and whether it is out of use. The counterpart of the Certificate Registry. A certificate may be
in one, the other, or both.

### Certificate Directory and Signing Target

The Server's reading of both stores as one: what can sign for a CPF and in what order the platform
tries them. Vault Certificates are tried first, then workstations. A **Signing Target** is one thing
that can sign, resolved once per call: a certificate, the verdict it last carried and the custody that
holds it. Past that point the two custodies are one thing to the rest of the Server.

### Certificate verdicts

Every certificate carries one of five verdicts, and they stay English on every screen because they
also travel on the wire:

| Verdict | Meaning |
|---------|---------|
| `ACTIVE` | Chain builds to a trust anchor, inside its validity period, revocation checked and clear. The only verdict that can open a session or sign. |
| `EXPIRED` | Outside its validity period. |
| `REVOKED` | Revoked by its certification authority. |
| `UNTRUSTED` | Its chain does not build to any anchor this component trusts. Also what every certificate reports when the PKI SDK licence is missing or lapsed. |
| `STALE` | No successful revocation check within the grace window; the CA has been unreachable too long. |

### A3 Certificate and A1 Certificate

ICP-Brasil certificate classes. An **A3** private key lives on removable hardware that performs
signatures itself and never yields the key; reaching it takes the holder's PIN, and the hardware
counts wrong entries. An **A1** is a software file whose private key is data, travelling under a
password; once installed it presents no PIN. The same A1 may live on several machines at once, each a
Workstation Certificate, or be imported to the Certificate Vault.

### CPF

The Brazilian natural-person taxpayer id, eleven digits with two check digits. It is the key that
binds a Signing Session to a certificate. TrustBridge verifies the check digits of a CPF a client
sends and refuses the eleven repeated-digit values; it never asks the Receita Federal whether the CPF
was issued.

## Actors and credentials

### Client Application (*Aplicação Cliente*) {#client-application}

An external system integrating against the SignSession Contract, registered in the admin console. It
holds one or more **API keys**, presented as `X-API-Key`, any of which authenticates it to the full
contract surface. Signing Sessions are not bound to the Client Application that created them: any key
may check, use or end a session whose id it holds.

### Admin Account (*Conta Administrativa*) {#admin-account}

A person's local login to the admin console. There is no external identity provider. It holds one of
two roles: **Administrator** may change platform state; **Auditor** may only read. Every account also
carries a **Second Factor**.

### Second Factor (*Segundo Fator*) and Recovery Code (*Código de Recuperação*) {#second-factor}

The TOTP code an Admin Account presents besides its password, enrolled by its owner on their own
device. No administrator can read, set or hand over somebody else's; the only thing another
Administrator can do is clear it, which forces re-enrollment. **Recovery Codes** are single-use
substitutes issued as a set at enrollment and shown once; a new set replaces the whole old one. A
deployment may declare that it requires no second factor, and that is a deployment-wide posture set
in configuration, never a per-account exemption.

### Workstation Key (*Chave da Estação de Trabalho*) {#workstation-key}

The key a machine makes for itself, in its TPM where one is usable and otherwise in software, and
cannot give up. It **is** the machine's identity: nothing is issued to it in exchange, so there is no
workstation secret to copy off a disk. A machine that keeps its key across a reinstall is the same
workstation; a machine that lost its key is a new one asking to join. Whether the key is in hardware
or software is the machine's **key posture**, which an Administrator reads before admitting it.

### Workstation Assertion

What an admitted machine puts on the wire in place of a secret when it connects: a short-lived
statement of its key's fingerprint, when it was minted, when it expires and a nonce, signed by the
Workstation Key. One assertion opens one connection; presented again it is refused. It is a proof, not
a credential, so a captured copy is worthless.

### Admission (*admissão*) {#admission}

The lifecycle a workstation is in. A machine announces itself (its key, hostname, operating system,
versions and key posture) and waits for a person. It is in exactly one of three states:

| State | Portuguese | Meaning |
|-------|-----------|---------|
| **Pending** | *Pendente* | Has asked and not yet been answered. |
| **Admitted** | *Admitida* | May connect. |
| **Revoked** | *Revogada* | Refused permanently. A revoked machine that asks again is refused and never walks back to Pending. |

A machine may be sent from Admitted back to Pending without losing its key or its history. An
abandoned Pending request from a machine nobody ever admitted **lapses** after a configurable period
and is deleted; the machine simply asks again as a machine the platform has never seen.

Admitting is a rate-limited human gate over a queue: with no out-of-band channel to check a
fingerprint against, a machine is *noticed* rather than *verified*. That is acceptable because
admission is not optional and nothing a machine holds admits it on its own.

### Installer Key

A key the Workstation Service signs its admission request with, besides its own, to show that the
request came from the genuine product. Every copy of TrustBridge holds the same private half, so it is
anti-abuse and not authentication of anything. A deployment may be given a key of its own instead.

## Secrets and trust

### Key Ring (*Chaveiro*) {#key-ring}

The set of keys one part of the platform encrypts a secret with. There are three and no two are the
same: the Workstation Service's, protecting PIN Cache entries; and the Server's two, one protecting
the Certificate Vault (`certificate-vault`) and one protecting its own web sessions
(`web-sessions`). Losing the vault's makes every Vault Certificate unopenable by anyone, this platform
included; losing the web-session one costs a round of sign-ins.

### Key Ring Protector (*Protetor do Chaveiro*) {#key-ring-protector}

The X.509 certificate with an RSA private key that makes the Server's two key rings readable, supplied
as configuration and never kept by the platform. Required of **every** Server, including one with no
Vault Certificates, because the web-session ring needs it too. Losing it is the most expensive way to
misoperate the platform. It may be rotated, but a retired protector is never discarded: the Server
still needs every protector any stored key was ever sealed under, permanently.

### Trusted CA and Trust Anchor Set

A **Trusted CA** (*Autoridade Certificadora Confiável*) is one certification authority an
Administrator told this Server to trust, added and removed on the admin console, in force without a
restart on the Server and on every admitted machine that has heard from it since. It is not a synonym
for "certification authority": every CA in ICP-Brasil is trusted and none of them is a Trusted CA.
Removing one can turn certificates `UNTRUSTED`, so the platform says how many depend on it first.

A component's **Trust Anchor Set** is what a chain must build to before that component calls a
certificate trusted. It is composed from several sources, any one of which suffices: the ICP-Brasil
roots the PKI SDK carries, optionally the machine's own root store, anchor files configured on a
workstation, and the Trusted CAs from the Server. A workstation holding a non-empty Trusted CA set
from the Server composes it **instead of** its own anchor files. Only a self-signed certificate can
terminate a chain, so a set holding only intermediates anchors nothing.

## Records

### Audit Log (*Trilha de Auditoria*) {#audit-log}

The Server's append-only record of platform events: API access, session and signing lifecycle,
workstation and PIN events, and admin actions, one entry per event with actor, subject identifiers
and outcome. PINs, document content and signature bytes never appear in it. An entry the database
will not take is written to the Server log at `Critical`, carrying the row itself.

### Server log (*Log do Servidor*) {#server-log}

The Server's own account of what it was doing, one line per event with a level, a category and a
correlation id that also appears on every HTTP response and ties a line to its Audit Log rows. The
console is the record; a rolling file under the temporary directory feeds the admin console's Server
log screen, and Application Insights is the retained copy when configured. Log lines, Audit Log rows,
certificate verdicts and the API's `error.message` stay English permanently, whatever language a
screen is read in.
