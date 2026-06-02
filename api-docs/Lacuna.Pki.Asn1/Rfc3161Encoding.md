---
sidebar_label: "Rfc3161Encoding"
---

# Rfc3161Encoding

**Namespace:** `Lacuna.Pki.Asn1`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public static class Rfc3161Encoding
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Rfc3161Encoding`

## Métodos

### `DecodeRequest(byte[], out byte[], out string)` {#decoderequest-system-byte-system-byte-system-string}

Decodes a RFC 3161 timestamp request into a digest algorithm and value

```csharp
public static DigestAlgorithmAndValue DecodeRequest(byte[] request, out byte[] nonce, out string tsaPolicyId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `request` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The DER-encoded request to be decoded |
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Receives the nonce that might be present in the request |
| `tsaPolicyId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Receives the TSA policy ID that might be present in the request |

**Retorno**

[`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md) — The digest algorithm and value ("message imprint") contained in the request

---

### `DecodeRequest(byte[], out byte[])` {#decoderequest-system-byte-system-byte}

Decodes a RFC 3161 timestamp request into a digest algorithm and value

```csharp
public static DigestAlgorithmAndValue DecodeRequest(byte[] request, out byte[] nonce)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `request` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The DER-encoded request to be decoded |
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Outputs the nonce that might be present in the request |

**Retorno**

[`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md) — The digest algorithm and value ("message imprint") contained in the request

---

### `DecodeRequest(byte[])` {#decoderequest-system-byte}

Decodes a RFC 3161 timestamp request into a digest algorithm and value

```csharp
public static DigestAlgorithmAndValue DecodeRequest(byte[] request)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `request` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The DER-encoded request to be decoded |

**Retorno**

[`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md) — The digest algorithm and value ("message imprint") contained in the request

---

### `DecodeResponse(byte[])` {#decoderesponse-system-byte}

Decodes a RFC 3161 timestamp response (TimeStampResp)

```csharp
public static CadesTimestamp DecodeResponse(byte[] response)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `response` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The response content |

**Retorno**

[`CadesTimestamp`](../Lacuna.Pki.Cades/CadesTimestamp.md) — The cades timestamp signture

---

### `EncodeRequest(DigestAlgorithmAndValue, byte[], string)` {#encoderequest-lacuna-pki-digestalgorithmandvalue-system-byte-system-string}

Encodes an RFC 3161 timestamp request in DER with an optional nonce and TSA policy ID

```csharp
public static byte[] EncodeRequest(DigestAlgorithmAndValue digest, byte[] nonce, string tsaPolicyId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md) | The digest algorithm and value to be timestamped |
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The nonce to be included on the request (optional). This value can be used to confirm the matching between requests and responses. |
| `tsaPolicyId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The OID of the policy to be passed to the TSA when requesting timestamps (optional). Some TSAs use this parameter to distinguish between types of timestamps. |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The DER-encoded request according to RFC 3161 (Timestamp Protocol)

---

### `EncodeRequest(DigestAlgorithmAndValue, byte[])` {#encoderequest-lacuna-pki-digestalgorithmandvalue-system-byte}

Encodes an RFC 3161 timestamp request in DER with an optional nonce

```csharp
public static byte[] EncodeRequest(DigestAlgorithmAndValue digest, byte[] nonce)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md) | The digest algorithm and value to be timestamped |
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The nonce to be included on the request (optional). This value can be used to confirm the matching between requests and responses. |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The DER-encoded request according to RFC 3161 (Timestamp Protocol)

---

### `EncodeRequest(DigestAlgorithmAndValue)` {#encoderequest-lacuna-pki-digestalgorithmandvalue}

Encodes an RFC 3161 timestamp request in DER

```csharp
public static byte[] EncodeRequest(DigestAlgorithmAndValue digest)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md) | The digest algorithm and value to be timestamped |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The DER-encoded request according to RFC 3161 (Timestamp Protocol)

---

### `EncodeResponse(byte[], int, string)` {#encoderesponse-system-byte-system-int32-system-string}

```csharp
[Obsolete("Use EncodeResponse method with enum parameters instead of int")]
public static byte[] EncodeResponse(byte[] timestampToken, int statusCode = 0, string statusString = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `timestampToken` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `statusCode` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `statusString` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `EncodeResponse(byte[], Rfc3161StatusCodes, string, Rfc3161FailureInfos?)` {#encoderesponse-system-byte-lacuna-pki-asn1-rfc3161statuscodes-system-string-system-nullable-lacuna-pki-asn1-rfc3161failureinfos}

Encodes a RFC 3161 timestamp response

```csharp
public static byte[] EncodeResponse(byte[] timestampToken, Rfc3161StatusCodes statusCode, string statusString = null, Rfc3161FailureInfos? failureInfo = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `timestampToken` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `statusCode` | [`Rfc3161StatusCodes`](./Rfc3161StatusCodes.md) |  |
| `statusString` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `failureInfo` | `Rfc3161FailureInfos?` |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
