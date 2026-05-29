---
sidebar_label: "Samples — decrypt scripts"
sidebar_position: 13
---

# Samples — decrypt scripts

Two reference implementations of the BSENC v1 decrypt recipe (see [Encryption](encryption.md)). Both
accept the password, salt, and iteration count via CLI flags, read the `.enc` envelope from a path,
and write the decrypted (cleartext) signed artifact to a path.

They are reference implementations — adapt them, or write your own in any language with
PBKDF2-HMAC-SHA256 and AES-256-GCM primitives. Both use these exit codes:

| Exit code | Meaning |
|-----------|---------|
| `0` | success |
| `1` | unrecoverable format error (bad magic, unsupported version, truncated file) |
| `2` | decryption failed (wrong password / salt / iterations, or corrupted file) |
| `3` | CLI / I/O error |

## Python 3 — `decrypt-bsenc.py`

Requires the `cryptography` package (`pip install cryptography`).

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

Standard library only — PowerShell 7+ is required for `System.Security.Cryptography.AesGcm` and the
static `Rfc2898DeriveBytes.Pbkdf2` overload.

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

---

**Back to:** [Encryption](encryption.md).
