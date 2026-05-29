---
sidebar_label: "Certificates"
sidebar_position: 4
---

# Certificates

Lacuna Bulk Signer signs with X.509 certificates exposed by one of three sources. This page explains
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

All three sources select the signing certificate by **SHA-1 thumbprint**. Subject-based matching is
never used because tokens and stores routinely hold multiple identities, and a "first match" rule
would make the audit trail dishonest.

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

The service warns at startup when `MaxConcurrency > 1` is configured alongside `Source = Pkcs11` or
`Source = WindowsStore`:

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

## Hot-swapping the source

Changing `Signing:Certificate:Source` (and the matching subtree) requires a restart — the
certificate is loaded once at boot. Procedure:

1. Stage the new source (import the cert into the Windows store, copy the new PFX, install the
   PKCS#11 driver).
2. Edit `appsettings.Production.json` to point at the new source and set the new thumbprint / path.
3. If the new source needs a new environment variable (PKCS#11 PIN, encryption password), set it
   before the restart.
4. Restart the service. The bootstrap banner prints `cert source = …` — verify it matches your
   intent.
5. Send a smoke-test job through the queue (drop a file in `input/`, or POST to `/api/files`).
   Inspect the resulting job history to confirm the new identity is the signer.

## Troubleshooting

| Symptom | Diagnosis |
|---------|-----------|
| Boot fails with "Signing:License is required" | Set `Signing__License` (env) or `Signing:License` (config). See [Security](security.md). |
| Boot fails with "Pkcs11 PIN env var … is empty" | The env var named by `PinEnvVar` is unset. Set it before restarting. |
| Boot fails with "WindowsStore source is not supported on this OS" | You configured `Source = WindowsStore` on Linux. Switch source. |
| Signing fails immediately with "Certificate not found by thumbprint" | The thumbprint does not match any cert in the configured source. Recheck with the discovery commands above. |
| Signing fails with PKCS#11 "module load failed" / "C_Initialize" error | The driver `.so`/`.dll` could not be loaded — vendor library missing on host or not mounted into the container. |
| Signing fails with "Access is denied" reading a Windows private key | Service virtual account lacks key access — grant it via `certlm.msc → Manage Private Keys`. |
| Signed PDF rejected by a downstream verifier | Check the policy version is current — ADR-Básica policy files are versioned by ITI. Downstream verifiers must accept the version Bulk Signer emits. |

See [Troubleshooting](troubleshooting.md) for the broader failure-mode catalog.

---

**Next:** [Security](security.md) — secret handling and the threat model.
**Previous:** [Configuration](configuration.md).
