---
sidebar_label: "TrustBridge"
sidebar_position: 1
---

# Lacuna TrustBridge

Lacuna TrustBridge is a **remote digital-signature platform for ICP-Brasil certificates held by
people**. It lets a client application sign PDF documents with a user's certificate through a REST
API, while the certificate's private key stays exactly where it lives: on a smart card or USB token
plugged into the holder's Windows workstation, or, when a deployment opts in, in a server-side
vault the platform administers.

TrustBridge implements the **SignSession Contract**, an existing API contract that client
applications already integrate against. It is the second implementation of that contract, and it
matches the first on the wire wherever it can. Where it deliberately differs, the differences are
listed on the [REST API](rest-api.md#where-this-server-differs-from-the-reference-implementation)
page.

## The three components

| Component | Runs on | What it does |
|-----------|---------|--------------|
| **Server** | A Linux container: Docker on a Linux host, or Azure App Service | The central web application. Serves the SignSession Contract to client applications, coordinates the fleet of workstations, holds the Certificate Registry, the Audit Log and the optional Certificate Vault, and hosts the admin console. |
| **Workstation Service** | A Windows Service on each user's machine | The only path to the certificates on that machine and to their private keys, through PKCS#11 and the Lacuna PKI SDK. Connects **outbound** to the Server over SignalR/WebSockets, announces the certificates it sees, validates them, and signs hashes when a session authorizes it. |
| **Tray App** | The same Windows machine, in the user's session | The holder's window onto the service: certificate status, the certificate list, PIN entry. It never talks to the Server directly. |

The Workstation Service and the Tray App ship together in one MSI. The Server ships as a container
image. The two lines release on their own schedules, and a Server accepts the current workstation
protocol version and the one before it, so a fleet is upgraded **after** its Server and within one
release of it.

## Features

- **Two custodies for a certificate, one API.** A **Workstation Certificate** is on a token or in
  the Windows store of a machine, and its key never leaves that machine. A **Vault Certificate** is
  an A1 file an Administrator imported into the Server's Certificate Vault. A client application
  calls the same endpoints either way and never learns which custody answered.
- **CPF-bound Signing Sessions.** A client supplies a CPF and the holder's PIN once. TrustBridge
  confirms the PIN against a certificate for that CPF, either by opening a Vault Certificate or by
  comparing against the PIN entered at the holder's Tray App, and answers an opaque session id. Every
  later call names the session by that id.
- **The PIN never reaches the token from the network.** On a workstation, the PIN a client sends is
  *compared* against the PIN the holder typed locally. A wrong value from a client cannot burn the
  token's retry counter.
- **Synchronous document signing, single or batch.** `POST /v1/signatures` signs one PDF inside the
  request. `POST /v1/signatures/batch` signs up to 50 in one call. Documents are held only in
  transit: TrustBridge signs hashes and never stores documents.
- **Lacuna Signer does the document work.** Hash computation, PDF assembly and download of the
  signed document are delegated to [Lacuna Signer](https://docs.lacunasoftware.com/en-us/articles/signer/).
- **Real certificate validation.** Trust chain, validity period and revocation are checked, with a
  configurable grace window when a certification authority cannot be reached. Only an `ACTIVE`
  certificate can open a session or sign.
- **Administered trust.** An Administrator adds a **Trusted CA** from a screen. It takes effect on
  the running Server with no restart and is pushed to every admitted workstation.
- **Machine admission with no shared secret.** A workstation mints its own key, ideally in the TPM,
  announces itself and waits in a queue. An Administrator admits it. Nothing an installer writes to a
  machine can join the fleet by itself.
- **Admin console in English or Brazilian Portuguese.** Fleet, admission queue, Certificate
  Registry, Signing Sessions, Signing Operations, Client Applications and API keys, Vault
  Certificates, Trusted CAs, Settings, the Audit Log and the Server log.
- **Local admin accounts with a mandatory second factor.** Two roles, Administrator and Auditor,
  TOTP enrollment, recovery codes, and a deployment-level break-glass.
- **An append-only Audit Log** of API access, session and signing lifecycle, workstation and PIN
  events and every administrative action, with a configurable retention.
- **No writable state on local disk.** Both of the Server's key rings live in its own SQL Server
  database, sealed under a certificate you supply. A deployment is an image, a connection string
  and a Key Ring Protector; an upgrade is a new image tag, and the Server applies its own schema
  migrations at start.
- **Group Policy support for the fleet.** An ADMX template publishes the Server URL and the PKI SDK
  licence to every machine.

## How it works

```
                                     ┌──────────────────────────────┐
  Client application ── X-API-Key ──▶│           Server             │──▶ Lacuna Signer
   POST /v1/sessions  (CPF + PIN)    │  SignSession Contract  /v1   │    (hash, PDF assembly,
   POST /v1/signatures               │  Certificate Registry        │     signed document)
   GET  /v1/signatures/{id}/document │  Certificate Vault (opt-in)  │
                                     │  Audit Log · admin console   │
                                     └──────────────┬───────────────┘
                                                    │ SignalR / WebSockets (outbound from the machine)
                          ┌─────────────────────────┼─────────────────────────┐
                          ▼                         ▼                         ▼
                 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
                 │ Workstation Svc │       │ Workstation Svc │  ...  │ Workstation Svc │
                 │ + Tray App      │       │ + Tray App      │       │ + Tray App      │
                 │ token / A1 cert │       │ token / A1 cert │       │ token / A1 cert │
                 └─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. A **Workstation Service** connects outbound to the Server, announces the certificates on its
   machine and their validation verdicts, and keeps the connection open.
2. A **client application** calls `POST /v1/sessions` with a CPF and a PIN. The Server tries the
   Vault Certificates for that CPF first; failing that, it relays the PIN to the workstations that
   hold a certificate for the CPF. If no workstation has that PIN cached, the holder is prompted at
   the Tray App. Whichever certificate confirms the PIN binds the **Signing Session**.
3. The client calls `POST /v1/signatures` with the session id and a PDF. The Server uploads the
   document to Lacuna Signer, gets the hash to sign, has it signed where the key lives, completes the
   signature at Signer, and answers the signature id.
4. The client fetches the signed PDF with `GET /v1/signatures/{signatureId}/document`.

Every step lands in the Audit Log, and the admin console reads the same records.

## Quickstart: the Server on Docker

Using the deployment package and image provided by Lacuna Software:

```bash
sudo mkdir -p /etc/trustbridge/tls /opt/trustbridge
sudo cp your-certificate.pfx /etc/trustbridge/tls/server.pfx     # TLS, trusted by every workstation
sudo chown 1654:1654 /etc/trustbridge/tls/server.pfx && sudo chmod 400 /etc/trustbridge/tls/server.pfx

cd /opt/trustbridge
cp <package>/docker-compose.yml . && cp <package>/.env.example .env && chmod 600 .env

# Mint the Key Ring Protector (required, keep the .pfx forever, off this host)
openssl req -x509 -newkey rsa:2048 -nodes -days 18250 -keyout protector.key -out protector.crt \
  -subj "/CN=TrustBridge Key Ring Protector"
openssl pkcs12 -export -inkey protector.key -in protector.crt -out protector.pfx -passout pass:
echo "KEY_RING_PROTECTOR_CERTIFICATE=$(base64 -w0 protector.pfx)" >> .env

# Edit .env: MSSQL_SA_PASSWORD, TLS_CERT_PASSWORD, SIGNER_BASEADDRESS, SIGNER_APIKEY,
#            ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD
docker compose up -d
curl -s https://trustbridge.example.com/healthz     # Healthy
```

Then sign in at `https://trustbridge.example.com/admin`, enroll the second factor, and remove the
two bootstrap variables from `.env`. The full procedure, with what each step is for, is on
**[Server installation](server-installation.md)**.

## Quickstart: a workstation

```powershell
msiexec /i TrustBridge-Workstation-1.0.1-x64.msi /qn SERVER_URL=https://trustbridge.example.com PKI_LICENSE=<base64>
```

The machine appears in the admission queue at `/admin/admission`. An Administrator admits it, and
it connects. See **[Workstation installation](workstation-installation.md)**.

## Documentation

| Topic | Page |
|-------|------|
| The vocabulary: sessions, custodies, registry, vault, admission, key rings, trust anchors | [Concepts](concepts.md) |
| Deploying the Server on Docker, what to back up, upgrades | [Server installation](server-installation.md) |
| Deploying the Server on Azure App Service with Azure SQL | [Azure App Service](azure.md) |
| Every Server setting, its default and an example | [Server configuration](configuration.md) |
| Installing, admitting, upgrading and removing workstations; Group Policy | [Workstation installation](workstation-installation.md) |
| Every Workstation Service setting and how a fleet supplies it | [Workstation configuration](workstation-configuration.md) |
| The admin console, screen by screen | [Admin console](admin-console.md) |
| The SignSession Contract: endpoints, error codes, examples, divergences | [REST API](rest-api.md) |
| Key Ring Protector, API keys, second factor, PIN handling, admission, audit | [Security](security.md) |
| Day-2 operations: health, logs, restarts, rotation, licence renewal, rollout order | [Operations](operations.md) |
| Failure modes and how to read them | [Troubleshooting](troubleshooting.md) |

While the Server is running, the machine-readable contract is served at `/openapi/v1.json` and a
browsable reference at `/scalar`. Both answer without a credential.

## Reading order

| If you are… | Start at |
|-------------|----------|
| Deploying the Server for the first time | [Concepts](concepts.md) → [Server installation](server-installation.md) → [Server configuration](configuration.md) |
| Deploying on Azure | [Server installation](server-installation.md#before-you-choose-a-posture) → [Azure App Service](azure.md) → [Security](security.md#the-key-ring-protector) |
| Rolling out workstations | [Workstation installation](workstation-installation.md) → [Admin console](admin-console.md#admission-queue) → [Workstation configuration](workstation-configuration.md) |
| Integrating a client application | [Concepts](concepts.md#signing-session) → [REST API](rest-api.md) → [Troubleshooting](troubleshooting.md#client-application-errors) |
| Turning on server-held certificates | [Concepts](concepts.md#vault-certificate) → [Security](security.md#the-certificate-vault) → [Server configuration](configuration.md#the-certificate-vault) |
| Operating an existing deployment | [Operations](operations.md) → [Admin console](admin-console.md) → [Troubleshooting](troubleshooting.md) |
| Trusting a private certification authority | [Concepts](concepts.md#trusted-ca-and-trust-anchor-set) → [Admin console](admin-console.md#trusted-cas) → [Workstation configuration](workstation-configuration.md#certificatesvalidationuseservertrustedcas) |
