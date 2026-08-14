---
sidebar_label: "Certificates"
sidebar_position: 4
---

# Certificates

Lacuna Bulk Signer signs with X.509 certificates exposed by one of four sources. This page explains
how to pick a source, where to put the certificate material, and how to find the SHA-1 thumbprints
the configuration requires.

The certificate configuration shown here lives either under the global `Signing:Certificate` block
(single-cert deployments) **or** inside each entry of `Signing:Profiles[].Certificate` (multi-profile
deployments — see [Configuration](configuration.md#signingprofiles--per-folder-signing-profiles)).
Every rule below applies identically to both shapes; in profile mode each profile loads its own cert
at boot and misconfiguration on any profile fails startup with an aggregated error.

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

### Verifying the file is loadable

Before pointing Bulk Signer at it, confirm the file decrypts with the password you intend to
configure:

```bash
# Linux / Mac
openssl pkcs12 -in signing.pfx -nokeys -info -passin pass:<password>
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

At boot, Bulk Signer compares the `.cer`'s public key against the vault key's public key and refuses
to start if they differ:

```
Certificate '/etc/bulksigner/certificates/signer.cer' does not match Azure Key Vault key
'bulk-signer-signing-key' — their public keys differ. Point CerPath at the certificate issued
for this key, or correct KeyName.
```

This is the failure mode the two-artifact design invites: renewing a certificate against a *new*
vault key while `KeyName` still points at the old one, or vice versa. Without the check the service
would start happily and emit signatures that no verifier can validate. With it, the mismatch is a
startup refusal that names both halves of the pair.

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
- **An unreachable blob stops the host from starting**, deliberately: a profile with no signing
  material cannot sign at all, so there is no useful degraded state. This is the opposite of an
  unreachable work share or operational store, both of which let the host start and report themselves
  degraded.
- **The PFX password is not fetchable from anywhere.** It stays a config value with an environment
  override. A password retrieved from the same store as the file it opens is not a second factor.
- **Nothing about signing moves.** With `Pfx`, the key is still loaded into this host's memory and
  signing is still local; with `AzureKeyVault`, the key still never leaves the vault. Putting the file
  in a blob is a statement about where bytes are stored and nothing else.

The startup banner names the blob on the profile's row, so you can confirm which object this process
actually paired against rather than which one the config file currently names:

```
signer  cades · cert=AzureKeyVault · blob=contoso/certificates/signer.cer · verify=on · …
```

## Hot-swapping the source

Changing `Signing:Certificate:Source` (and the matching subtree) requires a restart — the
certificate is loaded once at boot. Procedure:

1. Stage the new source (import the cert into the Windows store, copy the new PFX, install the
   PKCS#11 driver, provision the vault key and its `.cer`).
2. Edit `appsettings.Production.json` to point at the new source and set the new thumbprint / path /
   key name.
3. If the new source needs a new environment variable (PKCS#11 PIN, Key Vault client secret,
   encryption password), set it before the restart.
4. Restart the service. The bootstrap banner prints `cert source = …` — verify it matches your
   intent.
5. Send a smoke-test job through the queue (drop a file in `input/`, or POST to `/api/files`).
   Inspect the resulting job history to confirm the new identity is the signer.

## Troubleshooting

| Symptom | Diagnosis |
|---------|-----------|
| Boot fails with "Signing:PkiSdkLicense is required" | Set `Signing__PkiSdkLicense` (env) or `Signing:PkiSdkLicense` (config). See [Security](security.md). |
| Boot fails with "Pkcs11 PIN env var … is empty" | The env var named by `PinEnvVar` is unset. Set it before restarting. |
| Boot fails with "WindowsStore source is not supported on this OS" | You configured `Source = WindowsStore` on Linux. Switch source. |
| Boot fails with "does not match Azure Key Vault key … their public keys differ" | `CerPath` and `KeyName` refer to different key pairs. Verify them with the OpenSSL / Azure CLI recipe above. |
| Boot fails with "Endpoint must be an absolute https:// URL" | `Endpoint` is a bare vault DNS name or uses `http://`. Use the full form, e.g. `https://my-vault.vault.azure.net/`. |
| Boot fails saying both a path and a blob are configured | `Path`/`CerPath` and `Blob` are mutually exclusive. Remove one. The same refusal fires when neither is set. |
| Boot fails with a blob URL rejected for carrying a query string | The URL is a shared-access signature. SAS is not an accepted credential — use `Credential` with `ManagedIdentity`, `ServicePrincipal` or `AccountKey` and a bare blob URL. |
| Boot fails reading the signing material blob | Check the identity holds **Storage Blob Data Reader** on the container, and that the blob exists at the URL on the banner. An unreachable blob is fatal by design. |
| Signing fails with an Azure `403` / `Forbidden` | The app registration lacks the **sign** permission on the key. Grant **Key Vault Crypto User** (RBAC) or the **Sign** operation (access policy). |
| Signing fails with an Azure `429` | Vault throttling under load. Lower `Pipeline:MaxConcurrency` or request a higher vault limit. |
| Signing fails immediately with "Certificate not found by thumbprint" | The thumbprint does not match any cert in the configured source. Recheck with the discovery commands above. |
| Signing fails with PKCS#11 "module load failed" / "C_Initialize" error | The driver `.so`/`.dll` could not be loaded — vendor library missing on host or not mounted into the container. |
| Signing fails with "Access is denied" reading a Windows private key | Service virtual account lacks key access — grant it via `certlm.msc → Manage Private Keys`. |
| Signed PDF rejected by a downstream verifier | Check the policy version is current — ADR-Básica policy files are versioned by ITI. Downstream verifiers must accept the version Bulk Signer emits. |

See [Troubleshooting](troubleshooting.md) for the broader failure-mode catalog.

---

**Next:** [Security](security.md) — secret handling and the threat model.
**Previous:** [Configuration](configuration.md).
