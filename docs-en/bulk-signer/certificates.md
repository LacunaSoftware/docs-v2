---
sidebar_label: "Certificates"
sidebar_position: 4
---

# Certificates

Lacuna Bulk Signer signs with X.509 certificates exposed by one of four sources. This page explains
how to pick a source, where to put the certificate material, and how to find the SHA-1 thumbprints
the configuration requires.

Every signing profile carries its own certificate. Profiles live in the operational store and are
created and edited from the dashboard's signing-profile pages, which ask for exactly the fields shown
below. The configuration blocks on this page — the global `Signing:Certificate` block (single-cert
deployments) **or** each entry of `Signing:Profiles[].Certificate` (multi-profile deployments — see
[Configuration](configuration.md#signingprofiles--per-folder-signing-profiles)) — are the
**one-time seed** a first boot imports into the store. Every rule below applies identically to the
seed and to the profile page.

Each profile opens its certificate once, at boot, so a mistake surfaces at startup rather than at the
first matching file. **A certificate that will not open leaves that profile *degraded* and the host
running**: the reason is on the startup banner, in the durable log, on the profile's page and as its own
`signing-profile:<name>` readiness row; every other profile keeps signing, and jobs routed to the
broken one fail with `profile.degraded`. Fixing the certificate takes a restart, because the handle is
opened once and never reloaded.

:::warning Changed in 2.1.0 — a broken certificate no longer stops the boot
Earlier versions refused to start when any profile's certificate would not open. Now that profiles are
edited from the dashboard, refusing the boot would take away the page the fix is made on — so the
profile is reported degraded instead and the rest of the deployment keeps signing.
:::

## Choosing a source

| Source | Use when | Avoid when |
|--------|----------|------------|
| `Pfx` | The private key is exportable and stored as a `.pfx`/`.p12` file on disk. | The procurement policy forbids exportable keys (then HSM/store). |
| `Pkcs11` | The key lives in an HSM, smart card, or USB token with a vendor PKCS#11 driver. The audit policy requires that the key never leaves the device. | Containerized installs where the vendor driver cannot be mounted; non-Windows targets where the vendor only ships a Windows driver. |
| `WindowsStore` | Windows targets where the cert was imported into the certificate store ahead of time. | Linux or Docker targets — the validator refuses this source on non-Windows hosts. |
| `AzureKeyVault` | The key must never touch the host but an on-premises HSM is not an option — Azure holds the key and signs remotely. Works on every target, Docker included. | Air-gapped installs, or when adding per-signature network latency to Azure is unacceptable. |

How the signing identity gets *selected* differs by source, and the difference matters whenever a
token, store, or vault holds more than one identity:

| Source | Identity selected by |
|--------|----------------------|
| `Pfx` | Nothing to select — the file holds a single identity. |
| `Pkcs11`, `WindowsStore` | **SHA-1 thumbprint.** Subject-based matching is never used, because tokens and stores routinely hold multiple identities and a "first match" rule would make the audit trail dishonest. |
| `AzureKeyVault` | The vault **key name** for the private key, plus a `.cer` for the public certificate. The pair is cross-checked at boot. |

The two sources that name a *file* — `Pfx` and `AzureKeyVault` — can read that file from
[Azure Blob Storage](#reading-the-file-from-a-blob) instead of local disk, which is what makes them
usable on a host with no durable filesystem.

A PKCS#12 has a **third** place it can be: [uploaded through the dashboard](#uploading-the-file-through-the-dashboard)
and held in the operational store, for the operator who cannot reach the host's filesystem at all. The
three locations are mutually exclusive and refused every way round — a path, a blob and an upload are
never combined and never resolved by precedence, because *which certificate signed* must not depend on
which location happened to be readable.

One kind of certificate is deliberately **not** on this map: the one an **approver** co-signs a payment
file with, which lives with the approver and is never configured on the host. See
[The approver's certificate](#the-approvers-certificate).

## ICP-Brasil and ADR-Básica

Bulk Signer is designed for ICP-Brasil-compatible scenarios. The default signature policy applied by
the signers is **ADR-Básica** (Assinatura Digital de Referência — Básica), the baseline policy from
ITI's policy catalog. ADR-Básica covers CAdES (`.p7m`), PAdES (PDF), and XAdES (XML) and is the right
default for invoices, contracts, and other transactional documents.

| Concept | Where to read more |
|---------|--------------------|
| ITI (Instituto Nacional de Tecnologia da Informação) — the policy authority | [gov.br/iti](https://www.gov.br/iti/pt-br) |
| ICP-Brasil-authorized CA (certification authority) list | [ICP-Brasil entities](https://www.gov.br/iti/pt-br/assuntos/icp-brasil/entidades-icp-brasil) |
| Signature policies (ADR-Básica, ADR-T, ADR-V, ADR-C, ADR-A) | Look up the current versions on ITI's policy site before any deployment that needs a non-default policy. |
| Lacuna PKI SDK documentation | [docs.lacunasoftware.com](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/index.html) |

Bulk Signer does not bundle, recommend, or endorse any specific commercial CA. You acquire ICP-Brasil
certificates from any AC/AR (autoridade certificadora / de registro) on ITI's authoritative list
according to your own procurement policy. Once issued, the certificate plus its private key arrives
as a PFX file (for software-protected certs) or pre-installed on an HSM or token (for
hardware-protected ones) — at which point the configuration matrix below applies.

### Test certificates and the trust set

Lacuna publishes a **test PKI** for development and homologation without a real certificate: a root
(*Lacuna Root Test v3*), a CA (*Lacuna CA Test v7*) and a bundle of mock ICP-Brasil certificates, of
which *Alan Mathison Turing* and *Pierre de Fermat* are the usual ones, with the password `1234`. They
are described in Lacuna's
[PKI SDK samples](https://github.com/LacunaSoftware/PkiSdkSamples/blob/master/TestCertificates.md).
They carry a CPF and validate like the real thing, **under a root that is not an authority** — which is
the whole point of them.

Whether a host accepts them is decided by its **trust set**: the roots every signature is made under,
checked against afterwards, and that an approver's certificate is held to before the PIN prompt. There
is one per host, the same for every profile, and the startup banner names it on its `trust set` row:

| `Signing:TrustLacunaTestRoot` | Trust set | Turing / Fermat |
|-------------------------------|-----------|-----------------|
| unset (the default) | `production` — the ICP-Brasil roots alone, as the SDK's ICP-Brasil policies ship them; nothing from the operating system | **Refused.** A job signed with one fails; an approver presenting one is refused as `approval.certificate-invalid`. |
| `true` | `production + Lacuna test root` — ICP-Brasil, the SDK's Windows trust set (the machine store on Windows) and the test root | Accepted |

The key exists for a **homologation host that runs the published image** and wants the test
certificates rather than a real e-CPF per approver. It is **refused at boot under the environment name
`Production`**: set `ASPNETCORE_ENVIRONMENT=Staging` (or any other name) on that host, or the boot fails
naming the key and the remedy. A production host that inherited the setting therefore refuses to start
rather than trusting a root anyone can download. A host with the key set also logs a warning at every
boot. See [Configuration](configuration.md#signing) for the key itself.

:::note New in 2.3.0
Before 2.3.0 a release build could not trust the Lacuna test root at all.
:::

## Source = Pfx

```json
"Signing": {
  "Certificate": {
    "Source": "Pfx",
    "Pfx": {
      "Path": "/etc/bulksigner/signing.pfx",
      "Password": ""
    }
  }
}
```

(Prefer the env var `Signing__Certificate__Pfx__Password` over a value in the config file.)

### Placing the file

Put the `.pfx` file in a location:

- Readable by the service account: `bulksigner` on Linux, `NT SERVICE\LacunaBulkSigner` on Windows,
  UID 1654 in the Docker container.
- Not readable by other users on the host. On Linux:
  `chown bulksigner:bulksigner signing.pfx && chmod 0640 signing.pfx`. On Windows, the install
  script's ACL on `ProgramData` is sufficient.
- Not under source control.

### Password handling

The password can sit in `Signing:Certificate:Pfx:Password` in `appsettings.Production.json`
(gitignored) or — preferred — in the env var `Signing__Certificate__Pfx__Password`. Empty string is
allowed for passwordless test fixtures; production PFX files should always have a password.

Those are the **seed** locations. Once imported — or when the profile is created on the dashboard —
the password is stored with the profile, encrypted under `Signing:ProfileSecretsKey`, a host secret held
outside the database; the profile's page shows it only as *configured* or *not configured*. A
deployment whose profiles carry any secret (a PKCS#12 password, an Azure Key Vault application secret,
a blob credential, an uploaded file) needs that key set before the first boot that imports them. See
[Security](security.md#certificate-source-secrets).

### Verifying the file is loadable

**Export with the classic envelope.** The signing library opens the classic PKCS#12 envelope
(PBE-SHA1-3DES and RC2), not PBES2 with AES. PBES2 is what `openssl pkcs12 -export` writes **by
default** on OpenSSL 3, and what a Windows export writes when **AES256-SHA256** is picked instead of the
default TripleDES-SHA1. A file exported that way comes up as a degraded profile whose reason names
PBES2 and the fix. From OpenSSL, export with `-legacy` in the first place; on Windows, keep the export
wizard or `Export-PfxCertificate` on TripleDES-SHA1. OpenSSL 1.x always wrote the classic envelope; a
file refused for PBES2 can be re-exported through OpenSSL:

```bash
openssl pkcs12 -in modern.pfx -nodes -passin pass:<password> -out tmp.pem
openssl pkcs12 -export -legacy -in tmp.pem -passout pass:<password> -out signing.pfx
shred -u tmp.pem   # the private key is in clear in tmp.pem
```

Before pointing Bulk Signer at it, confirm the file decrypts with the password you intend to
configure. On OpenSSL 3 the `-legacy` flag is needed to *read* a classic-envelope file as well as to
write one:

```bash
# Linux / Mac
openssl pkcs12 -legacy -in signing.pfx -nokeys -info -passin pass:<password>
```

```powershell
# Windows — load into a transient cert object
$pwd = ConvertTo-SecureString -String '<password>' -AsPlainText -Force
$cert = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new("signing.pfx", $pwd)
$cert.Thumbprint
```

The Windows command prints the SHA-1 thumbprint as a side effect — you'll need it for the
WindowsStore source if you import the same certificate later, but the Pfx source does **not** require
a thumbprint (the file holds a single identity).

When a PKCS#12 will not open, the degraded profile's reason says why in the product's own words, with
the signing library's sentence kept behind it:

| Reason starts with | Cause and fix |
|--------------------|---------------|
| *PFX … did not open with the PKCS#12 password given* | The password on the profile is wrong — or the file is damaged, which a PKCS#12 cannot tell apart from a wrong password. Check the password; if it is right, supply the file again. The password itself is never quoted. |
| *PFX … is encrypted with PBES2, which the signing library does not open* | The modern envelope. Re-export with the classic one, as above. |
| *Certificate … is empty (0 bytes)* | A zero-byte file at the path, in the blob, or uploaded. Supply the file again. |

## Concurrency considerations per source

`Pipeline:MaxConcurrency > 1` lets the worker process several signing jobs in parallel. Whether that
is *safe* depends on the cert source's thread-safety model — each spawned signing task shares the
loaded cert. Picking the wrong combination can silently deadlock or return vendor-specific errors.

| Source | Thread-safe under concurrent signing? | Recommended `MaxConcurrency` |
|--------|---------------------------------------|------------------------------|
| **Pfx** | Yes (the key is held in memory). | Up to the cap of 32; typical sweet spot is 4–8 on PFX-backed deployments. |
| **Pkcs11** | **Usually no.** Most consumer tokens expose a single session per login; concurrent signing calls deadlock or fail. Server HSMs often support multi-session, but the count is vendor-specific. | `1` unless the vendor documentation explicitly states concurrent session support and you have measured it. |
| **WindowsStore** | Vendor-dependent. Software CSPs are typically thread-safe; smart-card-backed CSPs vary. | `1` by default; raise only after verifying the provider behaves under concurrent calls. |
| **AzureKeyVault** | Yes. Each signature is an independent, stateless HTTPS call — there is no session to contend for. | Up to the cap of 32. Watch for HTTP 429 throttling from Azure rather than for deadlocks. |

The service warns at startup when `MaxConcurrency > 1` is configured alongside `Source = Pkcs11` or
`Source = WindowsStore`. `AzureKeyVault` is deliberately **not** warned about, for the reason in the
table above:

```
[WARN] Pipeline:MaxConcurrency = 4 with Signing:Certificate:Source = Pkcs11 — verify your
       token / CSP allows concurrent sessions or set MaxConcurrency = 1.
```

If you ignore the warning and the token doesn't support concurrent sessions, the symptom will be
in-flight jobs hanging indefinitely or failing with the vendor's session-state error. See
[Troubleshooting](troubleshooting.md) for the diagnostic recipe.

## Source = Pkcs11

```json
"Signing": {
  "Certificate": {
    "Source": "Pkcs11",
    "Pkcs11": {
      "ModulePath": "/usr/lib/softhsm/libsofthsm2.so",
      "Thumbprint": "0123456789abcdef0123456789abcdef01234567",
      "PinEnvVar": "BULK_SIGNER_PKCS11_PIN"
    }
  }
}
```

### Module path

Absolute path to the vendor's PKCS#11 driver. Examples (operator-provided):

| Vendor / device | Linux | Windows |
|-----------------|-------|---------|
| SoftHSM v2 (testing) | `/usr/lib/softhsm/libsofthsm2.so` | n/a |
| SafeNet eToken / Authentication Client | `/usr/lib/x86_64-linux-gnu/pkcs11/libeToken.so` | `C:\Windows\System32\eTPKCS11.dll` |
| Thales SafeNet HSM (PCI) | (vendor-provided path) | (vendor-provided path) |
| Gemalto / Thales IDPrime smart-card | (vendor-provided path) | `C:\Windows\System32\IDPrimePKCS11.dll` |
| Yubico YubiHSM 2 | `/usr/local/lib/pkcs11/yubihsm_pkcs11.so` | (vendor-provided path) |

Bulk Signer does not ship vendor drivers. Install the driver on the host before pointing the config
at it. On Docker targets, mount the vendor `.so` into the container via `volumes:` — commented
examples are in `deploy/docker/docker-compose.yml`.

### Finding the thumbprint

The configured thumbprint must match a certificate visible to the configured driver. Use
`pkcs11-tool` (from the `opensc` package — shipped in the Docker image):

```bash
# Linux: list certs on the token, with their SHA-1 thumbprints
pkcs11-tool --module /usr/lib/softhsm/libsofthsm2.so --list-objects --type cert --login --pin <pin>
```

For each certificate listed, compute the SHA-1 thumbprint by exporting the DER and hashing:

```bash
pkcs11-tool --module /usr/lib/softhsm/libsofthsm2.so --read-object --type cert --id <id> --login --pin <pin> --output-file cert.der
openssl dgst -sha1 cert.der
# → SHA1(cert.der)= 0123456789abcdef0123456789abcdef01234567
```

Copy that lowercase hex (no spaces, no colons) into `Signing:Certificate:Pkcs11:Thumbprint`.

### PIN handling

The PIN **never** sits in a config file — the validator refuses to boot if a `Pin` key appears under
`Signing:Certificate:Pkcs11`. Set the environment variable named by `PinEnvVar` (default
`BULK_SIGNER_PKCS11_PIN`). Per-target:

- **Linux:** `BULK_SIGNER_PKCS11_PIN=<pin>` in `/etc/bulksigner/bulksigner.env`.
- **Windows:** `[Environment]::SetEnvironmentVariable("BULK_SIGNER_PKCS11_PIN", "<pin>", "Machine")`.
- **Docker:** `BULK_SIGNER_PKCS11_PIN=<pin>` in `deploy/docker/.env`.

See [Security](security.md) for the broader secrets story.

### Docker mounting example

```yaml
# deploy/docker/docker-compose.yml
services:
  bulksigner:
    # ...
    volumes:
      - ./config/appsettings.Production.json:/app/appsettings.Production.json:ro
      - ./data:/var/lib/bulksigner
      - ./logs:/var/log/bulksigner
      # Vendor PKCS#11 driver (uncomment and adjust per your HSM):
      - /usr/lib/softhsm:/usr/lib/softhsm:ro
      # Or, for a SafeNet eToken on the host:
      # - /usr/lib/x86_64-linux-gnu/pkcs11:/usr/lib/x86_64-linux-gnu/pkcs11:ro
      # USB tokens also need access to PCSC:
      - /var/run/pcscd/pcscd.comm:/var/run/pcscd/pcscd.comm
    environment:
      - BULK_SIGNER_PKCS11_PIN=${BULK_SIGNER_PKCS11_PIN}
```

The image is Debian-slim and ships `libpcsclite1` + `opensc` so smart-card tooling works out of the
box. Most vendor `.so` libraries are not musl-compatible, which is why the image is not Alpine-based.

## Source = WindowsStore

```json
"Signing": {
  "Certificate": {
    "Source": "WindowsStore",
    "WindowsStore": {
      "StoreLocation": "LocalMachine",
      "StoreName": "My",
      "Thumbprint": "0123456789ABCDEF0123456789ABCDEF01234567"
    }
  }
}
```

Windows-only. The validator throws on non-Windows hosts at startup.

### StoreLocation: CurrentUser vs LocalMachine

The Windows service runs under the virtual account `NT SERVICE\LacunaBulkSigner`. That account has
its own `CurrentUser` store — it is **not** the operator's `CurrentUser` store. The simplest rule:

| You imported the cert as… | Use |
|---------------------------|-----|
| Local Machine (machine-wide via `certlm.msc` or `Import-Certificate -CertStoreLocation Cert:\LocalMachine\My`) | `LocalMachine` + grant the virtual account access to the private key |
| Your own user (via `certmgr.msc` or `Import-PfxCertificate -CertStoreLocation Cert:\CurrentUser\My`) | Move it to `LocalMachine` first — the service will not see it under your `CurrentUser` |

To grant the virtual account access to a `LocalMachine\My` private key, open `certlm.msc`, right-click
the certificate, **All Tasks → Manage Private Keys…**, add `NT SERVICE\LacunaBulkSigner`, and grant
**Read**.

### Finding the thumbprint

PowerShell on the service host:

```powershell
Get-ChildItem -Path Cert:\LocalMachine\My | Format-Table Thumbprint, Subject, NotAfter
```

The thumbprint column is the SHA-1 hex. Strip any spaces before copying into the config; case does
not matter (the validator compares hex case-insensitively).

## Source = AzureKeyVault

```json
"Signing": {
  "Certificate": {
    "Source": "AzureKeyVault",
    "AzureKeyVault": {
      "Endpoint": "https://my-vault.vault.azure.net/",
      "AppId": "8f2c1b3e-1111-2222-3333-444455556666",
      "AppSecret": "",
      "KeyName": "bulk-signer-signing-key",
      "CerPath": "/etc/bulksigner/certificates/signer.cer"
    }
  }
}
```

(Prefer the env var `Signing__Certificate__AzureKeyVault__AppSecret` over a value in the config file.)

The private key is a Key Vault **key** object and never leaves Azure: each signature sends a digest
to the vault and receives the signature back. The matching **public certificate** is a local `.cer`
file — put it wherever you would have put the `.pfx`. That file holds only public material, so it
needs no protection beyond integrity.

This is the *key-only* flavour. Vault-hosted **certificate** objects are deliberately not supported:
a vault certificate would still have to be downloaded to the host to be used, which defeats the
reason for choosing Key Vault in the first place.

### Azure setup

If you are starting from an existing PFX, the `Import-PfxToKeyVault.ps1` script on the
[Samples](samples.md#powershell-7--import-pfxtokeyvaultps1) page performs every step below in one
pass — it imports the key non-exportably, writes the `.cer`, registers the application, grants it
sign permission, verifies the pair, and prints the config block to paste in.

The manual steps follow, for the cases the script does not cover (a key generated inside the vault,
or a CA-issued certificate obtained against a CSR).

1. **Create or import the key.** In the target key vault, create a key (RSA 2048+ or EC) — or import
   one. Note its **name**; that becomes `KeyName`. It must be a key object, not a certificate object.
2. **Register an application.** In Microsoft Entra ID, register an application and note its
   **Application (client) ID** (`AppId`). Under **Certificates & secrets**, create a client secret
   and note the value (`AppSecret`) — Azure displays it only once.
3. **Grant vault access.** Give that app registration permission to *get* the key and to *sign* with
   it. On an RBAC vault the built-in **Key Vault Crypto User** role covers both; on an access-policy
   vault, grant the **Get** key permission plus the **Sign** cryptographic operation. Nothing more is
   needed — Bulk Signer never creates, wraps, or exports keys.
4. **Obtain the certificate.** Generate a CSR against the vault key, have your CA issue the
   certificate, and save the issued certificate as a `.cer` (DER or PEM) at `CerPath`.

### The certificate and the key must match

At boot, Bulk Signer compares the `.cer`'s public key against the vault key's public key and, if they
differ, refuses to use the pair — the profile comes up degraded with this reason:

```
Certificate '/etc/bulksigner/certificates/signer.cer' does not match Azure Key Vault key
'bulk-signer-signing-key' — their public keys differ. Point CerPath at the certificate issued
for this key, or correct KeyName.
```

This is the failure mode the two-artifact design invites: renewing a certificate against a *new*
vault key while `KeyName` still points at the old one, or vice versa. Without the check the service
would start happily and emit signatures that no verifier can validate. With it, the mismatch is a
degraded profile whose reason names both halves of the pair.

### Verifying the pair before you deploy

To confirm a `.cer` and a vault key belong together without starting the service, compare their
public keys with the Azure CLI and OpenSSL:

```bash
# Public key as recorded in the certificate
openssl x509 -in signer.cer -noout -pubkey

# Public key as held by the vault
az keyvault key download --vault-name my-vault --name bulk-signer-signing-key --encoding PEM --file -
```

The two PEM blocks must be byte-identical.

### Credential handling

`AppSecret` is an Entra ID client secret. Unlike the PKCS#11 PIN it *may* live in a config file, but
the environment-variable form is recommended:

```bash
export Signing__Certificate__AzureKeyVault__AppSecret='…'
```

It is registered with both log-redaction layers, so it is scrubbed from the durable log whether it
appears as a structured property or interpolated into an exception message. Rotate it in Azure and
restart the service. See [Security](security.md#azure-key-vault-credentials) for the full posture.

### Network and throttling

Every signature is an outbound HTTPS call, so the host needs a reliable path to `*.vault.azure.net`
(and to `login.microsoftonline.com` for token acquisition). Vault latency is added to each job's
signing stage. A vault outage **stalls** the pipeline rather than corrupting it — affected jobs fail
with the Azure error and can be retried once access is restored.

Concurrency is safe (see the table above), but sustained high `MaxConcurrency` can draw HTTP 429
throttling responses from Azure. Those surface as failed jobs carrying the Azure error, not as hangs.

## Reading the file from a blob

A host with **no durable local disk** — a container, an App Service, an AKS pod — has nowhere to keep a
`.pfx` or a `.cer`. Baking it into the image works but makes certificate renewal an image rebuild, and
puts certificate-shaped material in your registry. So the two sources that name a file can instead name
a blob in Azure Blob Storage:

```json
"Signing": {
  "Certificate": {
    "Source": "Pfx",
    "Pfx": {
      "Password": "",
      "Blob": {
        "Url": "https://contoso.blob.core.windows.net/certificates/signer.pfx",
        "Credential": "ManagedIdentity"
      }
    }
  }
}
```

`Path` is omitted — **exactly one of `Path` or `Blob`, never both, never neither.** The same block works
under `AzureKeyVault` (holding the `.cer` instead of `CerPath`), and under any
`Signing:Profiles[].Certificate` entry.

| Key | Required | Notes |
|-----|----------|-------|
| `Url` | yes | The full blob URL — exactly what the portal's **Copy URL** button gives you. A URL carrying a **query string is refused at boot**: that is how a shared-access signature arrives, and SAS is not an accepted credential. Because of that rule the URL is never secret, so it is printed whole on the startup banner. |
| `Credential` | yes | `ManagedIdentity`, `ServicePrincipal` or `AccountKey`. **Never defaulted** — reaching for the host's own Azure identity unasked would authenticate as somebody nobody named. |
| `TenantId`, `AppId`, `AppSecret` | `ServicePrincipal` only | `TenantId` is required even when `AppId` names the same Entra application as the `AzureKeyVault` block beside it: that block has no tenant key, and **nothing here inherits**. |
| `AccountKey` | `AccountKey` only | Warned about at startup. See below. |

Because you supply the host, a **sovereign-cloud endpoint works with no extra configuration** — write
the endpoint you actually use.

### What the credential needs

For `ManagedIdentity` and `ServicePrincipal`, grant the identity **Storage Blob Data Reader** on the
container (or the account). Read access to one blob is all this ever needs — nothing in Bulk Signer
writes, lists, moves or leases a blob. `ManagedIdentity` is **system-assigned only**; a host outside
Azure has no identity endpoint at all.

### `AccountKey` and what it costs

An account key grants **full data-plane access to the entire storage account** and cannot be scoped
down or expired. It is accepted anyway, because an on-premises `Pfx` deployment may have no path to a
Microsoft Entra tenant at all — and unlike `AzureKeyVault`, which cannot work without Entra
reachability in the first place, that host has no other option.

The startup warning therefore says different things depending on what the blob holds:

| Blob under | What it holds | What a leaked `AccountKey` yields |
|------------|---------------|-----------------------------------|
| `AzureKeyVault:Blob` | the `.cer` — public material | a public certificate; the private key stays in the vault |
| `Pfx:Blob` | the PKCS#12 file | **the signing key** |

:::danger
If you can reach a tenant, use `ManagedIdentity` or `ServicePrincipal` — especially for a PFX.
`Pfx:Blob` is the **only** configuration in this product under which private key material travels over
a network; `Pkcs11` and `AzureKeyVault` both exist to prevent that, and neither is weakened by its
existence.
:::

### What this does not change

- **The file is read once, at boot.** A renewed blob needs a restart, exactly as a renewed local file
  does. Nothing polls it.
- **An unreachable blob leaves that profile degraded and the host running** — like every other
  certificate that will not open: reported on the banner, in the durable log and as a readiness row,
  with jobs routed there failing `profile.degraded` while every other profile keeps signing. What is
  **still** boot-fatal is a malformed `Blob` block *stated in configuration* (the seed), such as a URL
  with a query string or a missing `Credential`, because that is a mistake in the configuration file
  rather than in a stored profile.
- **The PFX password is not fetchable from anywhere.** It stays a config value with an environment
  override. A password retrieved from the same store as the file it opens is not a second factor.
- **Nothing about signing moves.** With `Pfx`, the key is still loaded into this host's memory and
  signing is still local; with `AzureKeyVault`, the key still never leaves the vault. Putting the file
  in a blob is a statement about where bytes are stored and nothing else.

:::warning Changed in 2.1.0 — an unreachable blob no longer stops the boot
An unreachable blob used to stop the host from starting. Since profiles moved into the operational
store, a profile that exists and cannot sign is an ordinary state, and refusing the boot would take
away the page the fix is made on.
:::

The startup banner names the blob on the profile's row, so you can confirm which object this process
actually paired against rather than which one the config file currently names:

```
signer  cades · cert=AzureKeyVault · blob=contoso/certificates/signer.cer · verify=on · …
```

## Uploading the file through the dashboard

A path and a blob both assume you can *put a file somewhere the host will read it*. The operator who
owns signing for a department frequently cannot: the binary tree is read-only, the image is built by
another team, or the host is an App Service instance with no durable disk. For that case a PKCS#12 can
be handed to the product **in the browser** — **New profile** on the dashboard's signing-profiles page,
`Pfx` as the source, then **Upload it now** as the location — and the bytes are stored in the operational store
rather than on the host's filesystem.

- **`Pfx` only.** A token and the host's certificate store hold a key that was never a file, so there
  is nothing to upload; and the `AzureKeyVault` source's file is the *public* `.cer`, whose private half
  stays in the vault.
- **The store becomes the custody boundary, and that is the cost.** The bytes are encrypted under
  `Signing:ProfileSecretsKey` before they are written, and that key is held **outside** the database —
  which is the whole design, because what it protects is *in* the database. Once a private key is
  uploaded, a copied database file or a leaked connection string is a stolen signing credential unless
  the key is somewhere else. Keep that in mind on any deployment whose store is backed up, replicated or
  copied to a developer machine — and note that the built-in
  [database backup](retention.md#the-built-in-backup-feature--sqlite-only) writes an artifact that is
  not encrypted, so an uploaded key travels in it protected only by `Signing:ProfileSecretsKey`.
- **Local disk was rejected rather than overlooked.** Writing the upload to the host's filesystem fails
  on exactly the deployment the feature exists for: a clustered instance's disk is ephemeral, so the
  file would be lost on recycle and never reach the other instances.
- **It is capped at 256 KiB**, and the page refuses an oversized file before reading it.
- **It is never readable again.** There is no download, and no page or endpoint shows the bytes or the
  password; both read as *configured* or *not configured*. Keep your own copy of the `.pfx` somewhere
  you control — the store is where the product keeps it, not an archive to retrieve from.
- **The edit form's three choices are keep, replace and drop.** **Edit certificate** on an existing
  profile offers the upload as a location whether or not the profile already holds a file, with a
  picker under it and a note saying what the save will do: an empty picker **keeps** the stored file, a
  chosen one **replaces** it, and pointing the profile at a path or a blob **removes** it. Removal is
  warned about before the save, and none of the three happens by omission.
- **A new profile signs at once; a changed certificate waits for a restart.** Uploading while
  *creating* a profile opens the certificate during the save, so a wrong password is reported in the
  form and the profile signs straight away. Uploading from the *edit* form opens nothing — a wrong
  password on replaced material surfaces at the next startup, as a degraded profile on the page that
  fixes it. [Hot-swapping the source](#hot-swapping-the-source) explains why.

## The approver's certificate

Everything above is about the certificate **this host** signs with. On a profile whose approval rule
names a **signer set** of `Approvers` or `ProfileKeyAndApprovers` (see [Approvals](approvals.md)), a
second kind of certificate enters the picture, and none of it is configured here: each approver
**co-signs the payment file with a certificate of their own**, and the product never holds that key.
Under `Approvers` the profile itself is **keyless** — no certificate, nothing opened at startup, and not
degraded for lacking one.

The approver reaches their certificate in one of two ways, and the host needs at least one of them
configured — a profile whose signer set includes the approvers is refused on save while neither is:

- **In the browser**, through the **Lacuna Web PKI** browser extension, for a certificate in the
  operating system's store or on a token or smart card. The host needs a `WebPki:License` (not a
  secret); each approver installs the extension once, from Lacuna's install page. A missing, outdated or
  unsupported extension is reported in the signing dialog, with the install route, before anything
  else happens.
- **In the cloud**, through **Lacuna CloudHub**, for a certificate a provider holds in its HSM (a
  *certificado em nuvem*). The host needs `CloudHub:ApiKey` and `CloudHub:PublicBaseUrl`; the approver
  picks their provider and authenticates there.

**Which certificate: e-CPF or e-CNPJ.** The product accepts an ICP-Brasil certificate that carries a CPF,
and reads the CPF where ICP-Brasil places it:

| Certificate | Whose CPF the product reads | Usual form |
|-------------|-----------------------------|------------|
| **e-CPF** — issued to a natural person | The holder's. | A1 (a file installed in the browser or the OS store) or A3 (a smart card or USB token, PIN-protected). |
| **e-CNPJ** — issued to a company | The **responsible person's**: the natural person the certificate names as the company's representative. | Usually A3. |

Either is accepted. A certificate carrying **no CPF at all** — a non-ICP-Brasil certificate, a server
certificate — is refused as such (`approval.certificate-without-cpf`), a distinct answer from a mismatch
so the approver is told the real reason. The certificates come from any AC on ITI's list, exactly as the
host's own does.

**The CPF has to match the pool.** The approver pool on the profile names each approver's CPF, and a job
freezes that pool when it parks. The certificate's CPF must equal **the frozen CPF of the member the
session names** — the person signed in through their portal link or with Microsoft Entra. It never
*picks* the member: a valid certificate belonging to a colleague in the same pool is refused under your
session (`approval.certificate-cpf-mismatch`). So the CPF an operator types into the pool has to be the
CPF on the certificate that approver will present — check it against the certificate before the first
file parks, because a job already parked keeps the pool it froze. The certificate picker shows the
approver only the certificates carrying that frozen CPF, so a wrong CPF in the pool shows up as a picker
that offers nothing and names the CPF it wanted by its check digits.

**It is checked in full, against the same trust set as the host's own key.** Chain, validity period and
revocation, through the PKI SDK, against the [trust set](#test-certificates-and-the-trust-set) the
profile key is held to when it signs. Any failure is refused as `approval.certificate-invalid` with the
SDK's reasons, before the token asks for a PIN and before any signature exists. The check is not
best-effort: this is authorisation of a payment, and a revoked certificate approving one is the case
revocation exists for. The reasons reach the operational log, so an approver refused for a reason they
cannot read on screen has an operator who can.

**What is recorded.** The approval keeps the certificate's subject, issuer, serial number, SHA-256
thumbprint, CPF and — on an e-CNPJ — CNPJ, plus the cloud provider's name when the signature was made in
the cloud, with the CPF masked wherever the record is shown
([Security](security.md#approver-personal-data--cpf-and-email)). `GET /api/jobs/{id}/approvals` reports
it as each decision's [`certificate`](rest-api.md#approvals) object. The delivered file carries the
signature itself; the product keeps no signature bytes on the record.

## Hot-swapping the source

Changing a profile's certificate requires a restart — the certificate is loaded once at boot, and the
open private-key handle is never swapped underneath a job that may be mid-signature. The change itself
is made on the profile's dashboard page, not in a settings file. Procedure:

1. Stage the new source (import the cert into the Windows store, copy the new PFX, install the
   PKCS#11 driver, provision the vault key and its `.cer`).
2. On the profile's page, press **Edit certificate**, point it at the new source, and save. A password
   field left blank keeps the stored password; type one to replace it. A profile whose PKCS#12 was
   **uploaded** keeps that file while the picker is left empty, takes a new one when you choose it, and
   loses it when you point the profile at a path or a blob — the form states which before the save.
   Nothing is written if the coordinates are refused.
3. If the new source needs a new environment variable (PKCS#11 PIN, encryption password), set it before
   the restart.
4. The profile now carries a **pending-restart marker** naming the fields that moved, and it keeps
   signing with the previous certificate until you restart. That is the honest state, not a delay to work
   around: it is what keeps *which certificate signed this file* answerable.
5. Restart the service. The bootstrap banner prints `cert source = …` — verify it matches your intent,
   and the marker is gone. If the new certificate will not open, the profile comes up **degraded** with
   the reason on that same page; correct the coordinates and restart again.
6. Send a smoke-test job through the queue (drop a file in `input/`, or POST to `/api/files`).
   Inspect the resulting job history to confirm the new identity is the signer.

`Signing:Profiles[]` and the global `Signing:Certificate` block are a **one-time seed** and are inert on
a deployment that has already booted once, so editing them changes nothing. A deployment whose store is
still empty — a first boot, or a switch of database provider — is seeded from them as before.

:::warning Changed in 2.1.0 — certificates are changed on the profile page
Before 2.1.0 a certificate was changed by editing `appsettings.Production.json` and restarting. The
settings file is now read only to seed an empty store.
:::

## Troubleshooting

| Symptom | Diagnosis |
|---------|-----------|
| Boot fails with "Signing:PkiSdkLicense is required" | Set `Signing__PkiSdkLicense` (env) or `Signing:PkiSdkLicense` (config). See [Security](security.md). |
| A profile is degraded saying "PKCS#11 PIN environment variable … is empty" | The env var named by `PinEnvVar` is unset for the service. Set it and restart. |
| Boot fails with "WindowsStore source is not supported on this OS" | You configured `Source = WindowsStore` on Linux. Switch source. |
| A profile is degraded saying "does not match Azure Key Vault key … their public keys differ" | `CerPath` (or the blob) and `KeyName` refer to different key pairs. Verify them with the OpenSSL / Azure CLI recipe above. |
| Boot fails with "Endpoint must be an absolute https:// URL" | `Endpoint` is a bare vault DNS name or uses `http://`. Use the full form, e.g. `https://my-vault.vault.azure.net/`. |
| Boot fails saying both a path and a blob are configured | `Path`/`CerPath` and `Blob` are mutually exclusive. Remove one. The same refusal fires when neither is set. |
| Boot fails with a blob URL rejected for carrying a query string | The URL is a shared-access signature. SAS is not an accepted credential — use `Credential` with `ManagedIdentity`, `ServicePrincipal` or `AccountKey` and a bare blob URL. |
| A profile is degraded saying the signing material blob does not exist, or its credential was refused | Check the identity holds **Storage Blob Data Reader** on the container, and that the blob exists at the URL on the banner (container and blob names are case-sensitive). For `AccountKey`, the key is wrong or has been rotated. The host keeps running; fix the coordinates on the profile's page and restart. |
| A profile is degraded saying the PKCS#12 password did not open the file | Wrong password on the profile, or a damaged file. See [Verifying the file is loadable](#verifying-the-file-is-loadable). |
| A profile is degraded saying the PFX is encrypted with PBES2 | Re-export with the classic envelope (`openssl pkcs12 -export -legacy`, or TripleDES-SHA1 on Windows). |
| A profile is degraded saying the certificate file is empty (0 bytes) | Supply the file again. |
| Jobs fail with `profile.degraded` | The profile's certificate did not open at startup, or its stored secrets could not be decrypted (a wrong `Signing:ProfileSecretsKey`). The reason is on the profile's page and the job's history. Fix it and restart — retrying the job before then fails the same way. |
| Signing fails with an Azure `403` / `Forbidden` | The app registration lacks the **sign** permission on the key. Grant **Key Vault Crypto User** (RBAC) or the **Sign** operation (access policy). |
| Signing fails with an Azure `429` | Vault throttling under load. Lower `Pipeline:MaxConcurrency` or request a higher vault limit. |
| Signing fails immediately with "Certificate not found by thumbprint" | The thumbprint does not match any cert in the configured source. Recheck with the discovery commands above. |
| Signing fails with PKCS#11 "module load failed" / "C_Initialize" error | The driver `.so`/`.dll` could not be loaded — vendor library missing on host or not mounted into the container. |
| Signing fails with "Access is denied" reading a Windows private key | Service virtual account lacks key access — grant it via `certlm.msc → Manage Private Keys`. |
| Signed PDF rejected by a downstream verifier | Check the policy version is current — ADR-Básica policy files are versioned by ITI. Downstream verifiers must accept the version Bulk Signer emits. |
| A **Turing / Fermat test certificate** is refused on the published image | The release trust set is ICP-Brasil alone — see [Test certificates and the trust set](#test-certificates-and-the-trust-set). On a homologation host, set `Signing:TrustLacunaTestRoot = true` **and** `ASPNETCORE_ENVIRONMENT=Staging`; the key alone is refused under `Production`. |
| Boot fails with "Signing:TrustLacunaTestRoot is true while the environment is 'Production'" | Deliberate. Unset the key on a production host; on a homologation host, name the environment `Staging`. |
| Every approver's **Sign and approve** is refused as `approval.certificate-invalid` | Usually the deployment rather than the certificates: the host cannot check revocation (no outbound path to the CAs' lists), or the certificates are test ones under the production trust set. The reasons are in the operational log. See [Approvals](approvals.md#troubleshooting). |
| One approver is always refused as `approval.certificate-cpf-mismatch` | The pool's CPF and the certificate's differ — see [The approver's certificate](#the-approvers-certificate). Correct the CPF in the profile's approver pool; a job already parked keeps the pool it froze. |

See [Troubleshooting](troubleshooting.md) for the broader failure-mode catalog.

---

**Next:** [Security](security.md) — secret handling and the threat model.
**Previous:** [Configuration](configuration.md).
