---
sidebar_label: "AttributeCertificateGenerator"
---

# AttributeCertificateGenerator

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class AttributeCertificateGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AttributeCertificateGenerator`

## Construtores

### `AttributeCertificateGenerator()` {#ctor}

```csharp
public AttributeCertificateGenerator()
```

---

## Propriedades

### `IncludeAuthorityKeyIdExtension` {#includeauthoritykeyidextension}

```csharp
public bool IncludeAuthorityKeyIdExtension { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Warnings` {#warnings}

```csharp
public List<string> Warnings { get; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `AddAttribute<T>(string, IEnumerable<T>)` {#addattribute-1-system-string-system-collections-generic-ienumerable-0}

```csharp
public void AddAttribute<T>(string oid, IEnumerable<T> values)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `values` | [`IEnumerable<T>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

---

### `AddAttribute<T>(string, T)` {#addattribute-1-system-string-0}

```csharp
public void AddAttribute<T>(string oid, T value)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `value` | `T` |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

---

### `AddRawAttribute(string, byte[])` {#addrawattribute-system-string-system-byte}

```csharp
public void AddRawAttribute(string oid, byte[] encodedValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `encodedValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `AddRawAttribute(string, IEnumerable<byte[]>)` {#addrawattribute-system-string-system-collections-generic-ienumerable-system-byte}

```csharp
public void AddRawAttribute(string oid, IEnumerable<byte[]> encodedValues)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `encodedValues` | [`IEnumerable<byte[]>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `Generate(bool)` {#generate-system-boolean}

```csharp
public AttributeCertificate Generate(bool validate = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `validate` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`AttributeCertificate`](./AttributeCertificate.md)

---

### `GenerateToSignBytes()` {#generatetosignbytes}

```csharp
public byte[] GenerateToSignBytes()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GenerateUniqueSerialNumber()` {#generateuniqueserialnumber}

```csharp
public BigInteger GenerateUniqueSerialNumber()
```

**Retorno**

[`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `SetCAIssuersUri(Uri)` {#setcaissuersuri-system-uri}

```csharp
public void SetCAIssuersUri(Uri caIssuersUri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `caIssuersUri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |

---

### `SetCrlDistributionPoint(Uri)` {#setcrldistributionpoint-system-uri}

```csharp
public void SetCrlDistributionPoint(Uri uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |

---

### `SetExtensionNoRevocationAvailable()` {#setextensionnorevocationavailable}

```csharp
public void SetExtensionNoRevocationAvailable()
```

---

### `SetHolderName(Name)` {#setholdername-lacuna-pki-name}

```csharp
public void SetHolderName(Name name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`Name`](./Name.md) |  |

---

### `SetHolderPKCertificate(PKCertificate)` {#setholderpkcertificate-lacuna-pki-pkcertificate}

```csharp
public void SetHolderPKCertificate(PKCertificate holderCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `holderCertificate` | [`PKCertificate`](./PKCertificate.md) |  |

---

### `SetIssuer(PKCertificate)` {#setissuer-lacuna-pki-pkcertificate}

```csharp
public void SetIssuer(PKCertificate issuer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuer` | [`PKCertificate`](./PKCertificate.md) |  |

---

### `SetIssuer(PKCertificateWithKey)` {#setissuer-lacuna-pki-pkcertificatewithkey}

```csharp
public void SetIssuer(PKCertificateWithKey issuerWithKey)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuerWithKey` | [`PKCertificateWithKey`](./PKCertificateWithKey.md) |  |

---

### `SetOcspUri(Uri)` {#setocspuri-system-uri}

```csharp
public void SetOcspUri(Uri ocspUri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `ocspUri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |

---

### `SetPrecomputedSignature(byte[], byte[])` {#setprecomputedsignature-system-byte-system-byte}

```csharp
public void SetPrecomputedSignature(byte[] signature, byte[] toSignBytes)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `toSignBytes` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetSerialNumber(BigInteger)` {#setserialnumber-system-numerics-biginteger}

```csharp
public void SetSerialNumber(BigInteger serialNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `serialNumber` | [`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger) |  |

---

### `SetSignatureAlgorithm(SignatureAlgorithm)` {#setsignaturealgorithm-lacuna-pki-signaturealgorithm}

```csharp
public void SetSignatureAlgorithm(SignatureAlgorithm signatureAlg)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlg` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

---

### `SetValidity(DateTimeOffset, DateTimeOffset)` {#setvalidity-system-datetimeoffset-system-datetimeoffset}

```csharp
public void SetValidity(DateTimeOffset start, DateTimeOffset end)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `start` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `end` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

---

### `SetValidityFromNow(TimeSpan)` {#setvalidityfromnow-system-timespan}

```csharp
public void SetValidityFromNow(TimeSpan period)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `period` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
