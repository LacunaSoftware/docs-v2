---
sidebar_label: "Asn1Util"
---

# Asn1Util

**Namespace:** `Lacuna.Pki.Asn1`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public static class Asn1Util
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Asn1Util`

## Métodos

### `DecodeAs<T>(byte[])` {#decodeas-1-system-byte}

Decodes a byte array to an instance of a ASN1 decorated class

```csharp
public static T DecodeAs<T>(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The ASN1 encoded content |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` | The ASN1 attribute decorated class type to instantiate |

**Retorno**

`T` — An instance of T decoded

---

### `DecodeIA5String(byte[])` {#decodeia5string-system-byte}

Decodes an ASN1 IA5String primitive content to string

```csharp
public static string DecodeIA5String(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DecodeIntegerAsBigInteger(byte[])` {#decodeintegerasbiginteger-system-byte}

Decodes an ASN1 Integer primitive content as BigInteger

```csharp
public static BigInteger DecodeIntegerAsBigInteger(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `DecodeIntegerAsInt32(byte[])` {#decodeintegerasint32-system-byte}

Decodes an ASN1 Integer primitive content as int

```csharp
public static int DecodeIntegerAsInt32(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `DecodeObjectIdentifier(byte[])` {#decodeobjectidentifier-system-byte}

Decodes an ASN1 ObjectIdentifier primitive content to OID string

```csharp
public static string DecodeObjectIdentifier(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DecodeOctetString(byte[])` {#decodeoctetstring-system-byte}

Decodes an ASN1 OctetString primitive content to byte array

```csharp
public static byte[] DecodeOctetString(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DecodePrintableString(byte[])` {#decodeprintablestring-system-byte}

Decodes an ASN1 PrintableString primitive content to string

```csharp
public static string DecodePrintableString(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DecodeString(byte[])` {#decodestring-system-byte}

Decodes any of ASN1 string primitives content to string

```csharp
public static string DecodeString(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DecodeUtcTimeAsDateTime(byte[])` {#decodeutctimeasdatetime-system-byte}

Decodes an ASN1 UTCTime primitive content as DateTime

```csharp
public static DateTime DecodeUtcTimeAsDateTime(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`DateTime`](https://learn.microsoft.com/dotnet/api/system.datetime)

---

### `DecodeUtcTimeAsDateTimeOffset(byte[])` {#decodeutctimeasdatetimeoffset-system-byte}

Decodes an ASN1 UTCTime primitive content as DateTimeOffset

```csharp
public static DateTimeOffset DecodeUtcTimeAsDateTimeOffset(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `DecodeUtf8String(byte[])` {#decodeutf8string-system-byte}

Decodes an ASN1 UTF8String primitive content to string

```csharp
public static string DecodeUtf8String(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DerEncode(object)` {#derencode-system-object}

Encodes an ASN1 attribute decorated class instance to DER

```csharp
public static byte[] DerEncode(object obj)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `obj` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) | The instance of a ASN1 class |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The DER encoded content

---

### `DerEncodeIA5String(string)` {#derencodeia5string-system-string}

Encodes a string to ASN1 DER IA5String

```csharp
public static byte[] DerEncodeIA5String(string s)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `s` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DerEncodeInteger(BigInteger)` {#derencodeinteger-system-numerics-biginteger}

Encodes a BigInteger to ASN1 DER Integer

```csharp
public static byte[] DerEncodeInteger(BigInteger i)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `i` | [`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DerEncodeInteger(int)` {#derencodeinteger-system-int32}

Encodes an int to ASN1 DER Integer

```csharp
public static byte[] DerEncodeInteger(int i)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `i` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DerEncodeObjectIdentifier(string)` {#derencodeobjectidentifier-system-string}

Encodes an OID string to ASN1 DER ObjectIdentifier

```csharp
public static byte[] DerEncodeObjectIdentifier(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DerEncodeOctetString(byte[])` {#derencodeoctetstring-system-byte}

Encodes a byte array to ASN1 DER OctetString

```csharp
public static byte[] DerEncodeOctetString(byte[] octetString)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `octetString` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DerEncodePrintableString(string)` {#derencodeprintablestring-system-string}

Encodes a string to ASN1 DER PrintableString

```csharp
public static byte[] DerEncodePrintableString(string s)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `s` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DerEncodeUtcTime(DateTime)` {#derencodeutctime-system-datetime}

Encodes a DateTime to ASN1 DER UTCTime

```csharp
public static byte[] DerEncodeUtcTime(DateTime time)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `time` | [`DateTime`](https://learn.microsoft.com/dotnet/api/system.datetime) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DerEncodeUtcTime(DateTimeOffset)` {#derencodeutctime-system-datetimeoffset}

Encodes a DateTimeOffset to ASN1 DER UTCTime

```csharp
public static byte[] DerEncodeUtcTime(DateTimeOffset time)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `time` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DerEncodeUtf8String(string)` {#derencodeutf8string-system-string}

Encodes a string to ASN1 DER UTF8String

```csharp
public static byte[] DerEncodeUtf8String(string s)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `s` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
