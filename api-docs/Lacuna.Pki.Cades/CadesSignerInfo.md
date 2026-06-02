---
sidebar_label: "CadesSignerInfo"
---

# CadesSignerInfo

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CadesSignerInfo
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesSignerInfo`

## Propriedades

### `ArchiveTimestamps` {#archivetimestamps}

```csharp
public List<CadesTimestamp> ArchiveTimestamps { get; }
```

**Retorno**

[`List<CadesTimestamp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `AttributeCertificates` {#attributecertificates}

```csharp
public List<AttributeCertificate> AttributeCertificates { get; }
```

**Retorno**

[`List<AttributeCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `CadesCTimestamps` {#cadesctimestamps}

```csharp
public List<CadesTimestamp> CadesCTimestamps { get; }
```

**Retorno**

[`List<CadesTimestamp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `CertCrlTimestamp` {#certcrltimestamp}

```csharp
public List<CadesTimestamp> CertCrlTimestamp { get; }
```

**Retorno**

[`List<CadesTimestamp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `CertificateValues` {#certificatevalues}

```csharp
public List<PKCertificate> CertificateValues { get; }
```

**Retorno**

[`List<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `CommitmentType` {#commitmenttype}

```csharp
public CommitmentType CommitmentType { get; }
```

**Retorno**

[`CommitmentType`](../Lacuna.Pki/CommitmentType.md)

---

### `CompleteCertificateRefs` {#completecertificaterefs}

```csharp
public List<CertificateReference> CompleteCertificateRefs { get; }
```

**Retorno**

[`List<CertificateReference>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `CompleteRevocationRefs` {#completerevocationrefs}

```csharp
public CompleteRevocationReferences CompleteRevocationRefs { get; }
```

**Retorno**

[`CompleteRevocationReferences`](../Lacuna.Pki/CompleteRevocationReferences.md)

---

### `DigestAlgorithm` {#digestalgorithm}

```csharp
public DigestAlgorithm DigestAlgorithm { get; }
```

**Retorno**

[`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md)

---

### `EncapsultedContentType` {#encapsultedcontenttype}

```csharp
public CmsContentType EncapsultedContentType { get; }
```

**Retorno**

[`CmsContentType`](../Lacuna.Pki/CmsContentType.md)

---

### `MessageDigest` {#messagedigest}

```csharp
public byte[] MessageDigest { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `RevocationValues` {#revocationvalues}

```csharp
public RevocationValues RevocationValues { get; }
```

**Retorno**

[`RevocationValues`](../Lacuna.Pki/RevocationValues.md)

---

### `SignatureAlgorithm` {#signaturealgorithm}

```csharp
public SignatureAlgorithm SignatureAlgorithm { get; }
```

**Retorno**

[`SignatureAlgorithm`](../Lacuna.Pki/SignatureAlgorithm.md)

---

### `SignaturePolicy` {#signaturepolicy}

```csharp
public CadesSignaturePolicyInfo SignaturePolicy { get; }
```

**Retorno**

[`CadesSignaturePolicyInfo`](./CadesSignaturePolicyInfo.md)

---

### `SignatureTimeStamps` {#signaturetimestamps}

```csharp
public List<CadesTimestamp> SignatureTimeStamps { get; }
```

**Retorno**

[`List<CadesTimestamp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `SignatureValue` {#signaturevalue}

```csharp
public byte[] SignatureValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignedAttributesEncoded` {#signedattributesencoded}

```csharp
public byte[] SignedAttributesEncoded { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SigningCertificate` {#signingcertificate}

```csharp
public PKCertificate SigningCertificate { get; }
```

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md)

---

### `SigningCertificateDigest` {#signingcertificatedigest}

```csharp
public DigestAlgorithmAndValue SigningCertificateDigest { get; }
```

**Retorno**

[`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md)

---

### `SigningDescription` {#signingdescription}

```csharp
public string SigningDescription { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SigningTime` {#signingtime}

```csharp
public DateTimeOffset? SigningTime { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Métodos

### `GetDateReference()` {#getdatereference}

```csharp
public DateTimeOffset? GetDateReference()
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `GetDateReference(out bool)` {#getdatereference-system-boolean}

Get the signing date of the signature

```csharp
public DateTimeOffset GetDateReference(out bool isCertified)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `isCertified` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) | If the date is based in a certified timestamp authority |

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
