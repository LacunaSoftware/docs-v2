---
sidebar_label: "ECDsaEncoding"
---

# ECDsaEncoding

**Namespace:** `Lacuna.Pki.Asn1`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class with helper methods to encode and decode ECDSA signatures

```csharp
public static class ECDsaEncoding
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ECDsaEncoding`

## Comentários

RFC 6979 -- Deterministic Usage of the Digital Signature Algorithm (DSA) and Elliptic Curve Digital Signature Algorithm (ECDSA)
-- does not specify an encoding for ECDSA signatures. Section 2.4 states:
The pair (r, s) is the signature.  How a signature is to be encoded is not covered by the DSA and ECDSA standards themselves;
a common way is to use a DER-encoded ASN.1 structure (a SEQUENCE of two INTEGERs, for r and s, in that order).

Therefore, each protocol is responsible for defining the encoding of ECDSA signatures.

This class contains methods for encoding and decoding ECDSA signatures between protocol-specific encodings
from/to .NET's native representation of signatures.

## Métodos

### `DecodeX509Signature(byte[], int)` {#decodex509signature-system-byte-system-int32}

Decodes an ECDSA signature encoded according to the X.509 standard into .NET's representation of an ECDSA signature

```csharp
public static byte[] DecodeX509Signature(byte[] berSignature, int qLength)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `berSignature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The X.509 encoded ECDSA signature |
| `qLength` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) | Length of the EC field, in bytes |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The ECDSA signature encoded in .NET's native encoding

**Comentários**

If you only have the length in bits of the key, use the method GetFieldLength to get the length in bytes of the field
and pass it on the qLength parameter.

---

### `EncodeX509Signature(byte[])` {#encodex509signature-system-byte}

Encodes an ECDSA signature encoded in .NET's native encoding to X.509 encoding

```csharp
public static byte[] EncodeX509Signature(byte[] netSignature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `netSignature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The ECDSA signature encoded in .NET's native encoding |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The ECDSA signature encoded in X.509 encoding

---

### `GetFieldLength(int)` {#getfieldlength-system-int32}

```csharp
public static int GetFieldLength(int keyBitSize)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `keyBitSize` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `TryDecodeX509Signature(byte[], int, out byte[])` {#trydecodex509signature-system-byte-system-int32-system-byte}

Decodes an ECDSA signature encoded according to the X.509 standard into .NET's representation of an ECDSA signature.
A return value indicates whether the conversion succeeded.

```csharp
public static bool TryDecodeX509Signature(byte[] berSignature, int qLength, out byte[] netSignature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `berSignature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The X.509 encoded ECDSA signature |
| `qLength` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) | Length of the EC field, in bytes |
| `netSignature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The ECDSA signature encoded in .NET's native encoding |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) — true if berSignature was decoded successfully; otherwise, false.

**Comentários**

If you only have the length in bits of the key, use the method GetFieldLength to get the length in bytes of the field
and pass it on the qLength parameter.

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
