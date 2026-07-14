---
sidebar_label: "Encryption (BSENC v1)"
sidebar_position: 9
---

# Encryption — BSENC v1

Optional post-signing encryption. **Off by default.** When enabled, Bulk Signer encrypts the signed
artifact between verify-success and promote-to-output. The cleartext signed bytes never reach
`output/`; only an encrypted envelope (BSENC v1) is written. Recipients decrypt with the configured
password, salt, and iteration count using the documented PBKDF2-HMAC-SHA256 + AES-256-GCM recipe —
there is no server-side decrypt endpoint.

## When to enable encryption

- **Enable** when the operational `output/` directory may be read by parties who must not see the
  signed-artifact content (multi-tenant disk, a less-trusted backup destination, a lower-trust
  replication target).
- **Leave disabled** when only authorized operators reach `output/` and downstream automation
  expects cleartext signed artifacts ready to forward. This is the more common case.
- **Encryption is orthogonal to signing.** The signature is computed on the cleartext document,
  exactly as if encryption were off. Encryption wraps the signed bytes in a private container for
  transport / at-rest protection. Recipients decrypt first, then verify the signature using normal
  PKI tooling (`openssl cms`, the Lacuna PKI SDK, Adobe Reader, etc.).

## Configuration

```json
"Encryption": {
  "Enabled": true,
  "Password": "",
  "PasswordEnvVar": "BULK_SIGNER_ENCRYPTION_PASSWORD",
  "Salt": "<base64-of-32-random-bytes>",
  "Iterations": 600000
}
```

(Prefer the env var `BULK_SIGNER_ENCRYPTION_PASSWORD` over a value in the config file.)

See [Configuration](configuration.md#encryption) for the full key reference. The validator runs only
when `Enabled = true` and fails fast on:

- Empty password (env var + `Password` both empty).
- Missing salt.
- Salt that decodes to fewer than 16 bytes.
- `Iterations` below 10 000 (catches the typo `600` instead of `600000`).

### Generating the salt

The salt is not secret; it must be stable across the lifetime of the encrypted output (changing it
invalidates every prior envelope). 32 random bytes is the right size:

```bash
# Linux / Mac
openssl rand 32 | base64
```

```powershell
# Windows (PowerShell)
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copy the base64 output into `Encryption:Salt`.

### Generating the password

Strong, high-entropy, recorded once in a place recipients can also read (a sealed envelope, a secrets
manager, a printed copy in a safe).

```bash
openssl rand -base64 32
```

Place the result in `BULK_SIGNER_ENCRYPTION_PASSWORD` (env var, preferred) or in
`Encryption:Password` in `appsettings.Production.json` (gitignored).

:::danger Loss of the password means loss of every encrypted output, forever.
There is no recovery mechanism. Store the password in a secret manager and/or a sealed physical
backup.
:::

## The key derivation

```
password (env or config) ─┐
salt (base64-decoded, ≥16 bytes) ─┼─▶ PBKDF2-HMAC-SHA256 ─▶ 32-byte derived key (in memory only)
iterations (default 600000) ─┘
```

Derivation runs **once at startup**. The derived 32-byte key lives in process memory for the lifetime
of the process. It is never written to disk, never logged, never returned by any endpoint.

The exact derivation:

```text
password   = (env var is non-empty) ? env value : Encryption:Password
saltBytes  = base64-decode(Encryption:Salt)
key        = PBKDF2-HMAC-SHA256(password, saltBytes, Iterations, 32 bytes)
```

OWASP 2023 guidance for PBKDF2-HMAC-SHA256 is 600 000 iterations; that's the default. Higher = slower
startup (a one-shot cost) and harder to brute-force; lower = faster startup and weaker. Do not lower
below the OWASP guidance without a specific reason.

## The on-disk envelope (BSENC v1)

Byte-exact layout:

| Offset | Length | Field | Notes |
|--------|--------|-------|-------|
| 0 | 8 | Magic | ASCII `"BSENC\0\0\0"` (`0x42 0x53 0x45 0x4E 0x43 0x00 0x00 0x00`) |
| 8 | 1 | Version | `0x01` for v1 |
| 9 | 12 | Nonce | Per-file random (CSPRNG) |
| 21 | N | Ciphertext | `AES-256-GCM(plaintext = signed bytes, key, nonce, aad = empty)` |
| 21 + N | 16 | AuthTag | AES-256-GCM authentication tag |

Header overhead is **37 bytes per file** (8 magic + 1 version + 12 nonce + 16 tag). The GCM
associated-data (AAD) is intentionally empty in v1 — the recipient needs only the password, salt, and
iteration count to decrypt. Recipient code should reject any file that does not start with the exact
9-byte magic + version prefix.

## Filename convention

The encrypted envelope name simply appends `.enc` to the cleartext signed name:

| Signature format | Cleartext signed name | Encrypted envelope name |
|------------------|------------------------|--------------------------|
| PAdES | `report.signed.pdf` | `report.signed.pdf.enc` |
| CAdES | `data.bin.p7m` | `data.bin.p7m.enc` |
| XAdES | `contract.signed.xml` | `contract.signed.xml.enc` |

`GET /api/jobs/{id}/output` switches its response to `Content-Type: application/octet-stream` and the
`.enc` filename when the job's output is encrypted. The dashboard's Job detail page shows an "Output
is encrypted" chip on the same condition.

## The decrypt recipe

The exact algorithm recipients must implement:

```text
1. Read first 8 bytes; reject if != "BSENC\0\0\0".
2. Read 1 byte; reject if != 0x01.
3. Read 12-byte nonce.
4. Read remaining bytes; split the tail 16 bytes off as the tag, head is the ciphertext.
5. key       = PBKDF2-HMAC-SHA256(password, salt, iterations, 32 bytes)
6. plaintext = AES-256-GCM-Decrypt(key, nonce, ciphertext, tag)   -- throws on tag mismatch
```

Tag mismatch (step 6) means one of: wrong password, wrong salt, wrong iteration count, or a wrong /
corrupted / truncated file.

Two reference implementations ship with this documentation — see **[Samples](samples.md)**:

- A Python 3 tool (requires the `cryptography` package).
- A PowerShell 7+ counterpart (standard library only).

Both accept the password, salt, and iteration count via CLI flags, read the envelope from a path, and
write the plaintext to a path. They are reference implementations — adapt them or write your own in
any language with PBKDF2-SHA256 and AES-256-GCM primitives.

### Python — quick example

```bash
pip install cryptography
python decrypt-bsenc.py \
  --password "$BULK_SIGNER_ENCRYPTION_PASSWORD" \
  --salt-b64 "$BULK_SIGNER_ENCRYPTION_SALT" \
  --iterations 600000 \
  --in report.signed.pdf.enc \
  --out report.signed.pdf
```

### PowerShell — quick example

```powershell
pwsh ./Decrypt-Bsenc.ps1 `
  -Password $env:BULK_SIGNER_ENCRYPTION_PASSWORD `
  -SaltBase64 $env:BULK_SIGNER_ENCRYPTION_SALT `
  -Iterations 600000 `
  -InputPath .\report.signed.pdf.enc `
  -OutputPath .\report.signed.pdf
```

## What happens during signing when encryption is on

```
input/file.pdf ─▶ Sign ─▶ Verify ─┬─ encryption on  ─▶ encrypt ─▶ output/file.signed.pdf.enc
                                   └─ encryption off ──────────────▶ output/file.signed.pdf
                       on failure ─▶ error/
```

The encryption step happens **after** successful verification — by the time bytes reach the
encryptor, they are known-good signed bytes. If signing or verification fails, encryption never runs
and the file ends up under `error/` with the failure recorded in the job's history.

## Versioning policy

The envelope version byte is currently `0x01`. The byte layout above is the v1 contract recipient
tooling builds against. A future v2 envelope would carry a new version byte, and v1 readers must keep
being able to read v1 files written before any upgrade. The reference decrypt scripts check the
version byte and reject anything they do not understand.

## Operational caveats

- **Disk usage.** Encrypted files are 37 bytes larger than their cleartext source. Negligible at
  typical document sizes.
- **Streaming.** Encryption is done in one shot; the whole signed artifact is in memory during
  encryption (and during decryption on the recipient side). For very large files (multi-GB), consider
  whether the pipeline is the right tool for the workload.
- **Throughput.** Encryption is roughly free per file on modern hardware (AES-NI). PBKDF2 dominates
  **at startup**, not during steady-state signing.
- **Password rotation.** Rotating the password requires re-encrypting every output that needs to
  remain readable under the new password. Bulk Signer offers no built-in re-encryption tool; script
  it externally using the decrypt samples plus a custom encryption step.

## Failure modes

| Symptom | Likely cause |
|---------|--------------|
| Boot fails: "Encryption.Salt must decode to at least 16 bytes" | The configured base64 salt is too short. Regenerate with 32 bytes of randomness. |
| Boot fails: "Encryption.Iterations must be at least 10000" | Typo in iteration count (`600` instead of `600000`). |
| Boot fails: "Encryption password is empty" | Neither the env var nor the `Password` config key is set. Set one. |
| Recipient decrypt fails: tag mismatch | Wrong password, wrong salt, wrong iteration count, or a damaged file. |
| Recipient decrypt fails: "Unknown magic" | Not a BSENC envelope — the operator may have downloaded the cleartext from a non-encrypted job by mistake. |
| Recipient decrypt fails: "Unsupported version" | Envelope is a newer version than the recipient script understands. Update the script. |

See [Troubleshooting](troubleshooting.md) for failure modes that affect the signing pipeline itself.

---

**Next:** [Lacuna Signer integration](lacuna-signer.md). **Previous:** [REST API](rest-api.md).
