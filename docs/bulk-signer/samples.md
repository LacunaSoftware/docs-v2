---
sidebar_label: "Exemplos — scripts"
sidebar_position: 17
---

# Exemplos — scripts

| Script | Finalidade |
|--------|------------|
| [`decrypt-bsenc.py`](#python-3--decrypt-bsencpy) | Descriptografar um envelope BSENC v1 — Python 3 |
| [`Decrypt-Bsenc.ps1`](#powershell-7--decrypt-bsencps1) | Descriptografar um envelope BSENC v1 — PowerShell 7+ |
| [`Import-PfxToKeyVault.ps1`](#powershell-7--import-pfxtokeyvaultps1) | Provisionar um PFX para a origem de certificado do Azure Key Vault |
| [`New-BulkSignerEntraApp.ps1`](#powershell-7--new-bulksignerentraappps1) | Provisionar o registro de aplicativo do Microsoft Entra ID para o modo de login opcional |

## Descriptografando envelopes BSENC

Os dois primeiros scripts são implementações de referência da receita de descriptografia do BSENC v1
(veja [Criptografia](encryption.md)). Ambos aceitam a senha, o salt e a contagem de iterações por flags
de linha de comando, leem o envelope `.enc` de um caminho, e escrevem o artefato assinado
descriptografado (em texto claro) em um caminho.

Eles são implementações de referência — adapte-os, ou escreva o seu próprio em qualquer linguagem com
primitivas de PBKDF2-HMAC-SHA256 e AES-256-GCM. Ambos usam estes códigos de saída:

| Código de saída | Significado |
|-----------------|-------------|
| `0` | sucesso |
| `1` | erro de formato irrecuperável (magic inválido, versão não suportada, arquivo truncado) |
| `2` | a descriptografia falhou (senha / salt / iterações errados, ou arquivo corrompido) |
| `3` | erro de linha de comando / E/S |

:::note Os scripts abaixo são reproduzidos exatamente como são entregues
O código, seus comentários e o texto que eles imprimem permanecem em inglês, para que o que você lê aqui
seja idêntico, byte a byte, aos arquivos do pacote de implantação.
:::

## Python 3 — `decrypt-bsenc.py`

Requer o pacote `cryptography` (`pip install cryptography`).

```python
#!/usr/bin/env python3
# Reference decryption tool for the Lacuna Bulk Signer BSENC v1 envelope.
#
# Envelope layout (see the Encryption page for the authoritative reference):
#
#     offset  length  field
#       0       8     magic       = b"BSENC\0\0\0"
#       8       1     version     = 0x01
#       9      12     nonce       = per-file random (CSPRNG)
#      21      N      ciphertext  = AES-256-GCM(plaintext, key, nonce, aad=empty)
#   21 + N     16     auth tag    = AES-256-GCM tag
#
# Requirements:
#   pip install cryptography
#
# Usage:
#   python decrypt-bsenc.py \
#       --password "$BULK_SIGNER_ENCRYPTION_PASSWORD" \
#       --salt-b64 "$BULK_SIGNER_ENCRYPTION_SALT" \
#       --iterations 600000 \
#       --in report.signed.pdf.enc \
#       --out report.signed.pdf
#
# Exit codes:
#   0  success
#   1  unrecoverable format error (bad magic, unsupported version, truncated file)
#   2  decryption failed (wrong password / salt / iterations, or corrupted file)
#   3  CLI / I/O error

from __future__ import annotations

import argparse
import base64
import hashlib
import sys
from pathlib import Path

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.exceptions import InvalidTag
except ImportError as e:
    print(
        f"error: the 'cryptography' package is required. Install with: pip install cryptography\n"
        f"detail: {e}",
        file=sys.stderr,
    )
    sys.exit(3)


BSENC_MAGIC = b"BSENC\x00\x00\x00"
BSENC_VERSION = 0x01
NONCE_LENGTH = 12
TAG_LENGTH = 16
HEADER_LENGTH = len(BSENC_MAGIC) + 1 + NONCE_LENGTH  # = 21
FIXED_OVERHEAD = HEADER_LENGTH + TAG_LENGTH          # = 37


def derive_key(password: str, salt: bytes, iterations: int) -> bytearray:
    """PBKDF2-HMAC-SHA256, 32-byte output.

    Returns a mutable bytearray so callers can zeroize the key after use; CPython's
    immutable ``bytes`` cannot be overwritten in place.
    """
    return bytearray(hashlib.pbkdf2_hmac(
        hash_name="sha256",
        password=password.encode("utf-8"),
        salt=salt,
        iterations=iterations,
        dklen=32,
    ))


def decrypt_envelope(envelope: bytes, key: "bytes | bytearray") -> bytes:
    """Parse a BSENC v1 envelope and return the plaintext signed bytes."""
    if len(envelope) < FIXED_OVERHEAD:
        raise ValueError(
            f"envelope is too short ({len(envelope)} bytes); minimum {FIXED_OVERHEAD}"
        )
    if envelope[: len(BSENC_MAGIC)] != BSENC_MAGIC:
        raise ValueError("unknown magic; not a BSENC envelope")
    version = envelope[len(BSENC_MAGIC)]
    if version != BSENC_VERSION:
        raise ValueError(
            f"unsupported envelope version 0x{version:02x}; this tool only reads v1"
        )

    nonce = envelope[HEADER_LENGTH - NONCE_LENGTH : HEADER_LENGTH]
    body = envelope[HEADER_LENGTH:]
    # AESGCM.decrypt expects ciphertext-with-tag concatenated, which is exactly what the
    # envelope stores after the header — no manual split is needed.
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, body, associated_data=None)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Decrypt a Lacuna Bulk Signer BSENC v1 envelope.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--password",
        required=True,
        help="PBKDF2 password (matches Encryption:Password / BULK_SIGNER_ENCRYPTION_PASSWORD).",
    )
    parser.add_argument(
        "--salt-b64",
        required=True,
        help="Base64-encoded PBKDF2 salt (matches Encryption:Salt).",
    )
    parser.add_argument(
        "--iterations",
        type=int,
        default=600_000,
        help="PBKDF2 iteration count (matches Encryption:Iterations). Default: 600000.",
    )
    parser.add_argument(
        "--in",
        dest="input_path",
        required=True,
        type=Path,
        help="Path to the .enc envelope.",
    )
    parser.add_argument(
        "--out",
        dest="output_path",
        required=True,
        type=Path,
        help="Path to write the decrypted (cleartext) signed artifact.",
    )

    args = parser.parse_args(argv)

    try:
        salt = base64.b64decode(args.salt_b64, validate=True)
    except (ValueError, base64.binascii.Error) as e:  # type: ignore[attr-defined]
        print(f"error: --salt-b64 is not valid base64: {e}", file=sys.stderr)
        return 3
    if len(salt) < 16:
        print(
            f"error: salt decoded to {len(salt)} bytes; minimum 16 (NIST SP 800-132)",
            file=sys.stderr,
        )
        return 3
    if args.iterations < 10_000:
        print(
            f"error: --iterations {args.iterations} is implausibly low; "
            "the server validator rejects anything below 10000",
            file=sys.stderr,
        )
        return 3

    try:
        envelope = args.input_path.read_bytes()
    except OSError as e:
        print(f"error: could not read {args.input_path}: {e}", file=sys.stderr)
        return 3

    key = derive_key(args.password, salt, args.iterations)
    try:
        try:
            plaintext = decrypt_envelope(envelope, key)
        except ValueError as e:
            print(f"error: {e}", file=sys.stderr)
            return 1
        except InvalidTag:
            print(
                "error: authentication-tag mismatch. The password, salt, iteration count, "
                "or envelope itself is wrong.",
                file=sys.stderr,
            )
            return 2

        try:
            args.output_path.write_bytes(plaintext)
        except OSError as e:
            print(f"error: could not write {args.output_path}: {e}", file=sys.stderr)
            return 3

        print(
            f"decrypted {len(plaintext)} bytes -> {args.output_path}",
            file=sys.stderr,
        )
        return 0
    finally:
        # Best-effort scrub of the derived 32-byte key.
        key[:] = b"\x00" * len(key)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

## PowerShell 7+ — `Decrypt-Bsenc.ps1`

Somente biblioteca padrão — o PowerShell 7+ é necessário para o
`System.Security.Cryptography.AesGcm` e para a sobrecarga estática `Rfc2898DeriveBytes.Pbkdf2`.

```powershell
#requires -Version 7.0
<#
.SYNOPSIS
    Reference decryption tool for the Lacuna Bulk Signer BSENC v1 envelope.

.DESCRIPTION
    Envelope layout (see the Encryption page for the authoritative reference):

        offset  length  field
          0       8     magic       = "BSENC\0\0\0"
          8       1     version     = 0x01
          9      12     nonce       = per-file random
         21      N      ciphertext  = AES-256-GCM(plaintext, key, nonce, aad=empty)
      21 + N     16     auth tag    = AES-256-GCM tag

    PowerShell 7+ is required for System.Security.Cryptography.AesGcm and
    Rfc2898DeriveBytes.Pbkdf2 (the static one-shot, not the constructor form).

.PARAMETER Password
    PBKDF2 password (matches Encryption:Password / BULK_SIGNER_ENCRYPTION_PASSWORD).

.PARAMETER SaltBase64
    Base64-encoded PBKDF2 salt (matches Encryption:Salt). Must decode to >= 16 bytes.

.PARAMETER Iterations
    PBKDF2 iteration count. Default 600000 (OWASP 2023 for HMAC-SHA256).

.PARAMETER InputPath
    Path to the .enc envelope.

.PARAMETER OutputPath
    Path to write the decrypted (cleartext) signed artifact.

.EXAMPLE
    pwsh ./Decrypt-Bsenc.ps1 `
        -Password $env:BULK_SIGNER_ENCRYPTION_PASSWORD `
        -SaltBase64 $env:BULK_SIGNER_ENCRYPTION_SALT `
        -Iterations 600000 `
        -InputPath .\report.signed.pdf.enc `
        -OutputPath .\report.signed.pdf

.NOTES
    Exit codes:
      0  success
      1  unrecoverable format error (bad magic, unsupported version, truncated file)
      2  decryption failed (wrong password / salt / iterations, or corrupted file)
      3  CLI / I/O error
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $Password,

    [Parameter(Mandatory = $true)]
    [string] $SaltBase64,

    [Parameter()]
    [int] $Iterations = 600000,

    [Parameter(Mandatory = $true)]
    [string] $InputPath,

    [Parameter(Mandatory = $true)]
    [string] $OutputPath
)

$ErrorActionPreference = 'Stop'

# Envelope constants
$BsencMagic     = [byte[]](0x42, 0x53, 0x45, 0x4E, 0x43, 0x00, 0x00, 0x00)  # "BSENC\0\0\0"
$BsencVersion   = [byte]0x01
$NonceLength    = 12
$TagLength      = 16
$HeaderLength   = $BsencMagic.Length + 1 + $NonceLength   # 21
$FixedOverhead  = $HeaderLength + $TagLength              # 37

function Write-ErrorMessage {
    param([string] $Message)
    [Console]::Error.WriteLine("error: $Message")
}

# --- Validate inputs --------------------------------------------------------------------------

try {
    $salt = [Convert]::FromBase64String($SaltBase64)
} catch {
    Write-ErrorMessage "--SaltBase64 is not valid base64: $($_.Exception.Message)"
    exit 3
}

if ($salt.Length -lt 16) {
    Write-ErrorMessage "salt decoded to $($salt.Length) bytes; minimum 16 (NIST SP 800-132)"
    exit 3
}

if ($Iterations -lt 10000) {
    Write-ErrorMessage "Iterations $Iterations is implausibly low; the server validator rejects anything below 10000"
    exit 3
}

if (-not (Test-Path -LiteralPath $InputPath -PathType Leaf)) {
    Write-ErrorMessage "input file not found: $InputPath"
    exit 3
}

# --- Read and validate the envelope -----------------------------------------------------------

try {
    $envelope = [System.IO.File]::ReadAllBytes($InputPath)
} catch {
    Write-ErrorMessage "could not read ${InputPath}: $($_.Exception.Message)"
    exit 3
}

if ($envelope.Length -lt $FixedOverhead) {
    Write-ErrorMessage "envelope is too short ($($envelope.Length) bytes); minimum $FixedOverhead"
    exit 1
}

for ($i = 0; $i -lt $BsencMagic.Length; $i++) {
    if ($envelope[$i] -ne $BsencMagic[$i]) {
        Write-ErrorMessage "unknown magic; not a BSENC envelope"
        exit 1
    }
}

if ($envelope[$BsencMagic.Length] -ne $BsencVersion) {
    $found = "0x{0:x2}" -f $envelope[$BsencMagic.Length]
    Write-ErrorMessage "unsupported envelope version $found; this tool only reads v1"
    exit 1
}

# Slice fields out of the envelope.
$nonce = New-Object byte[] $NonceLength
[Array]::Copy($envelope, $HeaderLength - $NonceLength, $nonce, 0, $NonceLength)

$ciphertextLength = $envelope.Length - $HeaderLength - $TagLength
$ciphertext = New-Object byte[] $ciphertextLength
[Array]::Copy($envelope, $HeaderLength, $ciphertext, 0, $ciphertextLength)

$tag = New-Object byte[] $TagLength
[Array]::Copy($envelope, $envelope.Length - $TagLength, $tag, 0, $TagLength)

# --- Derive the key and decrypt ---------------------------------------------------------------

try {
    $passwordBytes = [System.Text.Encoding]::UTF8.GetBytes($Password)
    $key = [System.Security.Cryptography.Rfc2898DeriveBytes]::Pbkdf2(
        $passwordBytes,
        $salt,
        $Iterations,
        [System.Security.Cryptography.HashAlgorithmName]::SHA256,
        32
    )
} catch {
    Write-ErrorMessage "key derivation failed: $($_.Exception.Message)"
    exit 3
}

$plaintext = New-Object byte[] $ciphertextLength
$aesGcm = $null
try {
    $aesGcm = [System.Security.Cryptography.AesGcm]::new($key, $TagLength)
    $aesGcm.Decrypt($nonce, $ciphertext, $tag, $plaintext)
} catch [System.Security.Cryptography.AuthenticationTagMismatchException] {
    Write-ErrorMessage "authentication-tag mismatch. The password, salt, iteration count, or envelope itself is wrong."
    exit 2
} catch [System.Security.Cryptography.CryptographicException] {
    Write-ErrorMessage "cryptographic error during decryption: $($_.Exception.Message)"
    exit 2
} catch {
    Write-ErrorMessage "unexpected error during decryption: $($_.Exception.Message)"
    exit 3
} finally {
    if ($null -ne $aesGcm) { $aesGcm.Dispose() }
    # Best-effort scrub of secret-bearing buffers from managed memory.
    if ($null -ne $key)           { [Array]::Clear($key,           0, $key.Length)           }
    if ($null -ne $passwordBytes) { [Array]::Clear($passwordBytes, 0, $passwordBytes.Length) }
}

# --- Write the plaintext ----------------------------------------------------------------------

try {
    [System.IO.File]::WriteAllBytes($OutputPath, $plaintext)
} catch {
    Write-ErrorMessage "could not write ${OutputPath}: $($_.Exception.Message)"
    exit 3
} finally {
    if ($null -ne $plaintext) { [Array]::Clear($plaintext, 0, $plaintext.Length) }
}

[Console]::Error.WriteLine("decrypted $($plaintext.Length) bytes -> $OutputPath")
exit 0
```

## PowerShell 7+ — `Import-PfxToKeyVault.ps1`

Provisiona um PFX existente para uso com a origem de certificado `AzureKeyVault` (veja
[Certificados](certificates.md#origem--azurekeyvault)). Em uma passada, ele importa a chave privada
para o cofre como uma **chave não exportável**, grava o certificado público como um `.cer`, registra uma
aplicação do Microsoft Entra ID, concede a ela permissão para assinar com aquela chave, verifica o par, e
imprime um bloco de configuração pronto para colar.

Requer PowerShell 7+ e os módulos `Az.Accounts`, `Az.KeyVault` e `Az.Resources`. Autentique-se antes com
`Connect-AzAccount`. Suporta `-WhatIf` — rode-o assim uma vez para ver o que ele faria.

O script **não** cria o cofre; aponte-o para um que já exista.

:::warning Por que um objeto key e não um objeto certificate
O Key Vault pode guardar um PFX das duas formas, e apenas uma delas é genuinamente não exportável.
Importada como **key**, o material privado nunca pode ser recuperado — a assinatura acontece dentro do
cofre. Importada como **certificate**, ela é marcada como exportável e o PFX inteiro pode ser baixado do
segredo que o respalda, então qualquer um com `secrets/get` pode ir embora com a chave. Este script
importa uma chave, e é por isso que o Bulk Signer precisa que o certificado público seja fornecido
separadamente, como um `.cer` local.
:::

:::warning Guarde o PFX
O PFX continua existindo em disco depois que isto roda. Uma vez confirmado que a assinatura funciona,
mova-o para backup offline e remova-o do host — deixá-lo no lugar derruba o propósito de colocar a chave
em um cofre. **Não destrua sua única cópia:** o Key Vault não devolverá a chave, então o PFX (ou um blob
de `Backup-AzKeyVaultKey`) é seu único artefato de recuperação de desastre.
:::

O operador que o executa precisa de: **Key Vault Crypto Officer** no cofre (para importar uma chave),
**Application Developer** ou superior no Entra ID (para registrar uma aplicação), e **User Access
Administrator** ou **Owner** no cofre (para criar a atribuição de role — não necessário em um cofre com
políticas de acesso).

```powershell
#requires -Version 7.0
#requires -Modules Az.Accounts, Az.KeyVault, Az.Resources
<#
.SYNOPSIS
    Provisions a PFX for use with Bulk Signer's `Source = AzureKeyVault` certificate source:
    imports the private key into Azure Key Vault as a non-exportable key, writes the public
    certificate out as a .cer, registers a Microsoft Entra ID application, and grants that
    application permission to sign with the key.

.DESCRIPTION
    Produces everything the AzureKeyVault certificate source needs (see the Certificates page),
    in one pass:

        1. Reads the PFX locally and verifies it carries a private key.
        2. Writes the public certificate to a .cer file — this is `CerPath`.
        3. Imports the private key into the vault as a KEY object      — this is `KeyName`.
        4. Confirms the imported key's public half matches the .cer, the same check the service
           performs at boot, so a mismatch is caught here rather than at startup.
        5. Registers an Entra ID application + service principal      — this is `AppId`.
        6. Creates a client secret on it                              — this is `AppSecret`.
        7. Grants the service principal permission to read and sign with that key.
        8. Prints a ready-to-paste configuration block.

    WHY A KEY OBJECT AND NOT A CERTIFICATE OBJECT
    Key Vault can hold this PFX either way, and only one of them is actually non-exportable:

      * As a KEY (what this script does). Key Vault never returns private key material for a key
        object under any permission. Signing happens inside the vault.
      * As a CERTIFICATE. A certificate imported from a PFX is marked exportable, and its private
        key can then be downloaded in full from the secret that backs it
        (`Get-AzKeyVaultSecret -Name <certName>` returns a complete PFX). Anyone holding the
        secrets/get permission can walk away with the key.

    Bulk Signer's AzureKeyVault source is deliberately key-only for exactly this reason, which is
    also why the public certificate has to be supplied separately as a local .cer.

    PERMISSIONS THE OPERATOR RUNNING THIS NEEDS
      * On the vault: import a key — "Key Vault Crypto Officer" (RBAC), or a "create/import" key
        access policy on a legacy access-policy vault.
      * In Entra ID: register applications — "Application Developer" or higher.
      * On the vault or its resource group: create role assignments — "User Access Administrator"
        or "Owner". Not needed on an access-policy vault.

.PARAMETER PfxPath
    Path to the .pfx / .p12 holding the signing certificate and its private key.

.PARAMETER PfxPassword
    Password protecting the PFX. Prompted for securely when omitted. Pass
    `(ConvertTo-SecureString -String '' -AsPlainText -Force)` for a passwordless PFX.

.PARAMETER VaultName
    Name of an existing Azure Key Vault. The script does not create the vault.

.PARAMETER KeyName
    Name to give the imported key inside the vault. Becomes `KeyName` in configuration.

.PARAMETER AppDisplayName
    Display name for the Entra ID application to register.

.PARAMETER CerPath
    Where to write the public certificate. Defaults to the PFX path with a .cer extension.
    Becomes `CerPath` in configuration — place it where the service can read it.

.PARAMETER SecretValidityYears
    Lifetime of the generated client secret, in years. Default 1. An expired secret fails the
    service at boot with an Azure authentication error, so pair rotation with a restart.

.PARAMETER GrantScope
    `Key` (default) scopes the role assignment to this one key — the tightest grant, and what you
    want when a vault holds keys for more than one consumer. `Vault` scopes it to the whole vault,
    which is Microsoft's recommendation for manageability when the vault serves a single
    application. Ignored on access-policy vaults, which can only grant at vault level.

.PARAMETER Destination
    `Software` (default) or `HSM` for the imported key. `HSM` requires a Premium vault.

.PARAMETER ExistingAppId
    Reuse an existing application instead of registering a new one. A fresh client secret is still
    created. Use when several vault keys should share one identity.

.EXAMPLE
    pwsh ./Import-PfxToKeyVault.ps1 `
        -PfxPath ./signer.pfx `
        -VaultName my-vault `
        -KeyName bulk-signer-signing-key `
        -AppDisplayName bulk-signer-prod

.EXAMPLE
    # Least-privilege variant on a vault shared with other consumers, HSM-backed, 2-year secret.
    pwsh ./Import-PfxToKeyVault.ps1 `
        -PfxPath ./signer.pfx -VaultName shared-vault -KeyName bulksigner-key `
        -AppDisplayName bulk-signer-prod -GrantScope Key -Destination HSM -SecretValidityYears 2

.NOTES
    The client secret is printed once and never written to disk. Capture it before closing the
    session; if it is lost, create a replacement with `New-AzADAppCredential`.

    The PFX still exists on disk after this runs. Once you have verified signing works, move it to
    offline backup and remove it from the host — leaving it in place defeats the point of putting
    the key in a vault. Do not destroy your only copy: Key Vault will not give the key back, so the
    PFX is your disaster-recovery artifact (as is `Backup-AzKeyVaultKey`).

    Exit codes:
      0  success
      1  precondition failed (bad PFX, missing vault, not signed in)
      2  Azure operation failed (import, app registration, or role assignment)
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
    [string]$PfxPath,

    [Parameter()]
    [System.Security.SecureString]$PfxPassword,

    [Parameter(Mandatory)]
    [string]$VaultName,

    [Parameter(Mandatory)]
    [string]$KeyName,

    [Parameter(Mandatory, ParameterSetName = 'NewApp')]
    [string]$AppDisplayName,

    [Parameter(Mandatory, ParameterSetName = 'ExistingApp')]
    [string]$ExistingAppId,

    [Parameter()]
    [string]$CerPath,

    [Parameter()]
    [ValidateRange(1, 2)]
    [int]$SecretValidityYears = 1,

    [Parameter()]
    [ValidateSet('Key', 'Vault')]
    [string]$GrantScope = 'Key',

    [Parameter()]
    [ValidateSet('Software', 'HSM')]
    [string]$Destination = 'Software'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:CryptoUserRole = 'Key Vault Crypto User'

function Write-Step { param([string]$Message) Write-Host "==> $Message" -ForegroundColor Cyan }
function Write-Ok { param([string]$Message) Write-Host "    $Message" -ForegroundColor Green }
function Write-Note { param([string]$Message) Write-Host "    $Message" -ForegroundColor DarkGray }

function Stop-WithError {
    param([string]$Message, [int]$Code = 1)
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit $Code
}

# ---------------------------------------------------------------------------------------------
# 1. Preconditions
# ---------------------------------------------------------------------------------------------
Write-Step 'Checking prerequisites'

$context = Get-AzContext
if (-not $context) {
    Stop-WithError 'Not signed in to Azure. Run Connect-AzAccount (and Set-AzContext to pick the subscription holding the vault).'
}
Write-Ok "Subscription: $($context.Subscription.Name) ($($context.Subscription.Id))"
Write-Ok "Tenant:       $($context.Tenant.Id)"

$vault = Get-AzKeyVault -VaultName $VaultName -ErrorAction SilentlyContinue
if (-not $vault) {
    Stop-WithError "Key vault '$VaultName' not found in subscription $($context.Subscription.Id). Create it first, or Set-AzContext to the right subscription."
}
# EnableRbacAuthorization decides how step 6 grants access; the two models are mutually exclusive.
$usesRbac = [bool]$vault.EnableRbacAuthorization
Write-Ok "Vault:        $($vault.VaultName) (permission model: $(if ($usesRbac) { 'Azure RBAC' } else { 'access policy' }))"

if (-not $PfxPassword) {
    $PfxPassword = Read-Host -AsSecureString "Password for '$([System.IO.Path]::GetFileName($PfxPath))' (empty if none)"
}

if (-not $CerPath) {
    $CerPath = [System.IO.Path]::ChangeExtension((Resolve-Path -LiteralPath $PfxPath).Path, '.cer')
}

# ---------------------------------------------------------------------------------------------
# 2. Read the PFX locally, before touching Azure
# ---------------------------------------------------------------------------------------------
Write-Step 'Reading the PFX'

$pfxFullPath = (Resolve-Path -LiteralPath $PfxPath).Path
$certificate = $null
try {
    $pfxBytes = [System.IO.File]::ReadAllBytes($pfxFullPath)
    # EphemeralKeySet keeps the private key out of the OS key store while we inspect it. Some
    # PFX/platform combinations reject it, so fall back to default handling.
    try {
        $certificate = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new(
            $pfxBytes, $PfxPassword, [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet)
    }
    catch {
        $certificate = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new($pfxBytes, $PfxPassword)
    }
}
catch {
    Stop-WithError "Could not open '$pfxFullPath'. Wrong password, or the file is not a PKCS#12 archive. ($($_.Exception.Message))"
}

if (-not $certificate.HasPrivateKey) {
    Stop-WithError "'$pfxFullPath' contains no private key. Re-export the PFX including the private key."
}

$thumbprint = $certificate.Thumbprint
Write-Ok "Subject:    $($certificate.Subject)"
Write-Ok "Thumbprint: $thumbprint"
Write-Ok "Valid:      $($certificate.NotBefore.ToString('yyyy-MM-dd')) .. $($certificate.NotAfter.ToString('yyyy-MM-dd'))"
if ($certificate.NotAfter -lt (Get-Date)) {
    Write-Warning "This certificate expired on $($certificate.NotAfter.ToString('yyyy-MM-dd')). Signatures produced with it will not validate."
}

$certRsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPublicKey($certificate)
if (-not $certRsa) {
    Write-Warning 'Certificate does not carry an RSA public key. The automatic key-match check in step 5 will be skipped; verify manually per the Certificates page.'
}

# ---------------------------------------------------------------------------------------------
# 3. Write the public certificate (CerPath)
# ---------------------------------------------------------------------------------------------
Write-Step "Writing the public certificate to $CerPath"

if ($PSCmdlet.ShouldProcess($CerPath, 'Write DER-encoded public certificate')) {
    $derBytes = $certificate.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    [System.IO.File]::WriteAllBytes($CerPath, $derBytes)
    Write-Ok "$($derBytes.Length) bytes (DER). Public material only — no private key."
}

# ---------------------------------------------------------------------------------------------
# 4. Import the private key as a non-exportable vault KEY
# ---------------------------------------------------------------------------------------------
Write-Step "Importing the private key into '$VaultName' as key '$KeyName'"

$existingKey = Get-AzKeyVaultKey -VaultName $VaultName -Name $KeyName -ErrorAction SilentlyContinue
if ($existingKey) {
    Write-Warning "Key '$KeyName' already exists in '$VaultName'. Importing creates a NEW VERSION; the current version is retained and reachable by its version-specific id."
}

$vaultKey = $null
if ($PSCmdlet.ShouldProcess("$VaultName/keys/$KeyName", 'Import key from PFX')) {
    try {
        # KeyOps is restricted to sign/verify so the key cannot be used to encrypt, decrypt, wrap,
        # or unwrap even by a caller who holds a broader role than intended. Bulk Signer only ever
        # signs; the public-key side of verification happens locally from the .cer.
        $vaultKey = Add-AzKeyVaultKey `
            -VaultName $VaultName `
            -Name $KeyName `
            -KeyFilePath $pfxFullPath `
            -KeyFilePassword $PfxPassword `
            -Destination $Destination `
            -KeyOps 'sign', 'verify'
    }
    catch {
        Stop-WithError "Key import failed: $($_.Exception.Message)`nThe signed-in identity needs 'Key Vault Crypto Officer' (RBAC) or key create/import permission (access policy) on '$VaultName'." 2
    }

    Write-Ok "Key id:   $($vaultKey.Id)"
    Write-Ok "Key ops:  $($vaultKey.Key.KeyOps -join ', ')"
    Write-Ok 'Exportable: no — Key Vault never returns private key material for a key object.'
}

# ---------------------------------------------------------------------------------------------
# 5. Confirm the imported key matches the certificate (mirrors the service's boot check)
# ---------------------------------------------------------------------------------------------
if ($vaultKey -and $certRsa) {
    Write-Step 'Verifying the vault key matches the certificate'

    $certModulus = $certRsa.ExportParameters($false).Modulus
    # JWK 'n' and RSAParameters.Modulus are both unsigned big-endian with no leading zero padding,
    # so a direct byte comparison is valid.
    $vaultModulus = $vaultKey.Key.N

    $matches = $vaultModulus -and $certModulus.Length -eq $vaultModulus.Length
    if ($matches) {
        for ($i = 0; $i -lt $certModulus.Length; $i++) {
            if ($certModulus[$i] -ne $vaultModulus[$i]) { $matches = $false; break }
        }
    }

    if (-not $matches) {
        Stop-WithError "The imported key's public half does not match '$CerPath'. This should not happen when both come from the same PFX — inspect key '$KeyName' in '$VaultName' before configuring the service." 2
    }
    Write-Ok 'Public keys match. The service will accept this CerPath + KeyName pair at boot.'
}

# ---------------------------------------------------------------------------------------------
# 6. Register the application and create a client secret
# ---------------------------------------------------------------------------------------------
$appId = $null
$servicePrincipalObjectId = $null
$clientSecret = $null

if ($PSCmdlet.ParameterSetName -eq 'ExistingApp') {
    Write-Step "Reusing existing application $ExistingAppId"
    $app = Get-AzADApplication -ApplicationId $ExistingAppId -ErrorAction SilentlyContinue
    if (-not $app) { Stop-WithError "No application with appId '$ExistingAppId' in tenant $($context.Tenant.Id)." }
    $appId = $app.AppId

    $sp = Get-AzADServicePrincipal -ApplicationId $appId -ErrorAction SilentlyContinue
    if (-not $sp) {
        Write-Note 'Application has no service principal in this tenant; creating one.'
        $sp = New-AzADServicePrincipal -ApplicationId $appId
    }
    $servicePrincipalObjectId = $sp.Id
    Write-Ok "Display name: $($app.DisplayName)"
}
else {
    Write-Step "Registering Entra ID application '$AppDisplayName'"
    if ($PSCmdlet.ShouldProcess($AppDisplayName, 'Register Entra ID application and service principal')) {
        try {
            $app = New-AzADApplication -DisplayName $AppDisplayName
            $appId = $app.AppId
            Write-Ok "Application (client) id: $appId"

            # The service principal is the security object role assignments target; the application
            # alone cannot hold one.
            $sp = New-AzADServicePrincipal -ApplicationId $appId
            $servicePrincipalObjectId = $sp.Id
            Write-Ok "Service principal object id: $servicePrincipalObjectId"
        }
        catch {
            Stop-WithError "Application registration failed: $($_.Exception.Message)`nThe signed-in identity needs the 'Application Developer' Entra role (or higher)." 2
        }
    }
}

if ($appId -and $PSCmdlet.ShouldProcess("application $appId", 'Create client secret')) {
    Write-Step 'Creating a client secret'
    try {
        $startDate = Get-Date
        $credential = New-AzADAppCredential `
            -ApplicationId $appId `
            -StartDate $startDate `
            -EndDate $startDate.AddYears($SecretValidityYears)
        $clientSecret = $credential.SecretText
        Write-Ok "Expires: $($startDate.AddYears($SecretValidityYears).ToString('yyyy-MM-dd'))"
    }
    catch {
        Stop-WithError "Client secret creation failed: $($_.Exception.Message)" 2
    }
}

# ---------------------------------------------------------------------------------------------
# 7. Grant sign permission on the key
# ---------------------------------------------------------------------------------------------
if ($servicePrincipalObjectId) {
    Write-Step 'Granting permission to sign with the key'

    if ($usesRbac) {
        $scope = if ($GrantScope -eq 'Key') { "$($vault.ResourceId)/keys/$KeyName" } else { $vault.ResourceId }
        Write-Note "Role '$script:CryptoUserRole' at scope: $scope"
        Write-Note "'$script:CryptoUserRole' is the narrowest built-in role granting keys/sign; restricting the key to sign+verify in step 4 is what actually bounds it to signing."

        if ($PSCmdlet.ShouldProcess($scope, "Assign '$script:CryptoUserRole'")) {
            # A freshly created service principal is not immediately visible to the role-assignment
            # API ("Principal {id} does not exist in the directory"). Retry rather than fail.
            $assigned = $false
            foreach ($attempt in 1..12) {
                try {
                    New-AzRoleAssignment -ObjectId $servicePrincipalObjectId `
                        -RoleDefinitionName $script:CryptoUserRole -Scope $scope -ErrorAction Stop | Out-Null
                    $assigned = $true
                    break
                }
                catch {
                    if ($_.Exception.Message -match 'already exists') { $assigned = $true; break }
                    if ($attempt -eq 12) { Stop-WithError "Role assignment failed after $attempt attempts: $($_.Exception.Message)`nThe signed-in identity needs 'User Access Administrator' or 'Owner' on the vault." 2 }
                    Write-Note "Directory replication pending (attempt $attempt/12); retrying in 5s."
                    Start-Sleep -Seconds 5
                }
            }
            if ($assigned) { Write-Ok 'Role assigned.' }
        }
    }
    else {
        Write-Note 'Access-policy vault: granting key get + sign. This model cannot scope to an individual key.'
        if ($PSCmdlet.ShouldProcess($VaultName, 'Set key access policy (get, sign)')) {
            try {
                Set-AzKeyVaultAccessPolicy -VaultName $VaultName `
                    -ObjectId $servicePrincipalObjectId -PermissionsToKeys get, sign
                Write-Ok 'Access policy set.'
            }
            catch {
                Stop-WithError "Setting the access policy failed: $($_.Exception.Message)" 2
            }
        }
    }
}

# ---------------------------------------------------------------------------------------------
# 8. Report
# ---------------------------------------------------------------------------------------------
if (-not $WhatIfPreference) {
    $vaultUri = $vault.VaultUri
    if (-not $vaultUri.EndsWith('/')) { $vaultUri += '/' }

    Write-Host ''
    Write-Host '─────────────────────────────────────────────────────────────────────────' -ForegroundColor Cyan
    Write-Host ' Bulk Signer configuration' -ForegroundColor Cyan
    Write-Host '─────────────────────────────────────────────────────────────────────────' -ForegroundColor Cyan
    Write-Host @"

"Signing": {
  "Certificate": {
    "Source": "AzureKeyVault",
    "AzureKeyVault": {
      "Endpoint": "$vaultUri",
      "AppId": "$appId",
      "AppSecret": "",
      "KeyName": "$KeyName",
      "CerPath": "$CerPath"
    }
  }
}

Supply the secret via environment variable rather than the config file:

  Signing__Certificate__AzureKeyVault__AppSecret

"@
    Write-Host '─────────────────────────────────────────────────────────────────────────' -ForegroundColor Yellow
    Write-Host ' Client secret — shown once, not stored anywhere' -ForegroundColor Yellow
    Write-Host '─────────────────────────────────────────────────────────────────────────' -ForegroundColor Yellow
    Write-Host ''
    Write-Host "  $clientSecret"
    Write-Host ''
    Write-Host 'Next steps:' -ForegroundColor Cyan
    Write-Host "  1. Copy the secret above into your secret store or the environment variable now."
    Write-Host "  2. Place $CerPath where the service account can read it."
    Write-Host "  3. Start the service. It verifies the certificate/key pair at boot and fails loudly on mismatch."
    Write-Host "  4. Once signing is confirmed, move $pfxFullPath to offline backup and remove it from this host."
    Write-Host "     Keep that backup: Key Vault will not return the key, so the PFX is your only recovery path."
    Write-Host ''

    if ($usesRbac) {
        Write-Host 'Role assignments can take a minute or two to propagate; an immediate first sign attempt may fail with Forbidden.' -ForegroundColor DarkGray
    }
}

exit 0
```

## PowerShell 7+ — `New-BulkSignerEntraApp.ps1`

Acompanha o pacote de implantação, ao lado dos dois acima. Ele automatiza os passos 1, 2 e 4 do
[passo a passo do Microsoft Entra ID](installation.md#login-pelo-microsoft-entra-id-opcional) através do
Microsoft Graph, cria o client secret, e imprime um bloco de configuração pronto para colar. **O passo 3
— atribuir pessoas às roles — permanece manual**, no centro de administração do Entra, em Aplicativos
empresariais → Usuários e grupos.

**Pré-requisitos:**

```powershell
Install-Module Microsoft.Graph.Applications -Scope CurrentUser
```

mais uma conta capaz de consentir com o escopo delegado `Application.ReadWrite.All` (Application
Administrator ou Global Administrator).

```bash
pwsh ./New-BulkSignerEntraApp.ps1 -BaseUrl https://signer.example.com
```

| Parâmetro | Obrigatório | Padrão | Observações |
|-----------|-------------|--------|-------------|
| `-BaseUrl` | sim | — | A origem pública a partir da qual o dashboard é servido. A URI de redirecionamento é derivada dela como `<BaseUrl>/signin-oidc`. Precisa ser uma origem `http(s)` absoluta. |
| `-DisplayName` | não | `Lacuna Bulk Signer` | Nome de exibição do registro de aplicativo. |
| `-SecretValidityMonths` | não | `12` | Tempo de vida do client secret, 1–24. |

O que ele cria:

- Uma aplicação de **tenant único**, com as permissões delegadas `openid` / `profile` / `email` que o
  handler OIDC requisita. A claim `email` também é declarada como claim opcional do ID token, porque o
  casamento com o pool de aprovadores vincula por ela e não há alternativa por UPN.
- As **duas app roles** com os valores exatos com que o host faz o casamento — `Administrator` e
  `Approver`.
- A **aplicação empresarial** com *Atribuição necessária = Sim*, para que contas não atribuídas falhem já
  na porta da Microsoft. O host impõe a presença da role de qualquer forma.

Ele **se recusa a criar uma duplicata**: um segundo registro com o mesmo nome de exibição é quase sempre
uma reexecução, e dois aplicativos carregando as mesmas roles são uma armadilha de gestão, e não
redundância. Passe um `-DisplayName` diferente, ou apague o registro existente primeiro.

:::danger O client secret é exibido uma única vez, por este script
Guarde-o como a variável de ambiente `Auth__EntraId__ClientSecret` (recomendado) ou em um
`appsettings.Production.json` não versionado — nunca no controle de versão. Veja
[Segurança](security.md#authentraidclientsecret) para onde cada alvo de implantação deve guardá-lo.

Um segredo expirado falha no momento do login com um erro `AADSTS`, e não no boot. Rotacione-o antes de
ele expirar.
:::

---

**Voltar para:** [Criptografia](encryption.md) · [Certificados](certificates.md) ·
[Instalação](installation.md).
