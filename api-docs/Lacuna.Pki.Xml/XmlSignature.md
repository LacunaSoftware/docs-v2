---
sidebar_label: "XmlSignature"
---

# XmlSignature

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class XmlSignature : ICertificateStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlSignature`

## Construtores

### `XmlSignature(XmlElement, XmlIdResolutionTable)` {#ctor-system-xml-xmlelement-lacuna-pki-xml-xmlidresolutiontable}

```csharp
public XmlSignature(XmlElement signatureElement, XmlIdResolutionTable idResolutionTable = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureElement` | [`XmlElement`](https://learn.microsoft.com/dotnet/api/system.xml.xmlelement) |  |
| `idResolutionTable` | [`XmlIdResolutionTable`](./XmlIdResolutionTable.md) |  |

---

## Propriedades

### `ArchiveTimestamps` {#archivetimestamps}

```csharp
public List<XadesTimestamp> ArchiveTimestamps { get; }
```

**Retorno**

[`List<XadesTimestamp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

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

### `DataObjectFormat` {#dataobjectformat}

```csharp
public DataObjectFormat DataObjectFormat { get; }
```

**Retorno**

[`DataObjectFormat`](./DataObjectFormat.md)

---

### `PolicyIdentifier` {#policyidentifier}

```csharp
public XmlPolicyIdentifier PolicyIdentifier { get; }
```

**Retorno**

[`XmlPolicyIdentifier`](./XmlPolicyIdentifier.md)

---

### `RevocationValues` {#revocationvalues}

```csharp
public RevocationValues RevocationValues { get; }
```

**Retorno**

[`RevocationValues`](../Lacuna.Pki/RevocationValues.md)

---

### `SigAndRefsTimestamps` {#sigandrefstimestamps}

```csharp
public List<XadesTimestamp> SigAndRefsTimestamps { get; }
```

**Retorno**

[`List<XadesTimestamp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `SignatureAlgorithm` {#signaturealgorithm}

```csharp
public SignatureAlgorithm SignatureAlgorithm { get; set; }
```

**Retorno**

[`SignatureAlgorithm`](../Lacuna.Pki/SignatureAlgorithm.md)

---

### `SignatureElementId` {#signatureelementid}

```csharp
public string SignatureElementId { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SignatureTimestamps` {#signaturetimestamps}

```csharp
public List<XadesTimestamp> SignatureTimestamps { get; }
```

**Retorno**

[`List<XadesTimestamp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `SignatureValue` {#signaturevalue}

```csharp
public byte[] SignatureValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignedDetachedResourceContent` {#signeddetachedresourcecontent}

```csharp
public byte[] SignedDetachedResourceContent { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignedDetachedResourceUri` {#signeddetachedresourceuri}

```csharp
public string SignedDetachedResourceUri { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SignedElement` {#signedelement}

```csharp
public XmlElement SignedElement { get; }
```

**Retorno**

[`XmlElement`](https://learn.microsoft.com/dotnet/api/system.xml.xmlelement)

---

### `SignedEntityType` {#signedentitytype}

```csharp
public XmlSignedEntityTypes SignedEntityType { get; set; }
```

**Retorno**

[`XmlSignedEntityTypes`](./XmlSignedEntityTypes.md)

---

### `SigningCertificate` {#signingcertificate}

```csharp
public PKCertificate SigningCertificate { get; set; }
```

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md)

---

### `SigningCertificateReferences` {#signingcertificatereferences}

```csharp
public List<CertificateReference> SigningCertificateReferences { get; }
```

**Retorno**

[`List<CertificateReference>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `SigningTime` {#signingtime}

```csharp
public DateTimeOffset? SigningTime { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Métodos

### `Validate(IXmlPolicyMapper, DateTimeOffset?, Func<string, byte[]>)` {#validate-lacuna-pki-xml-ixmlpolicymapper-system-nullable-system-datetimeoffset-system-func-system-string-system-byte}

```csharp
public ValidationResults Validate(IXmlPolicyMapper policyMapper, DateTimeOffset? dateReference = null, Func<string, byte[]> detachedResourceResolver = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IXmlPolicyMapper`](./IXmlPolicyMapper.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `detachedResourceResolver` | [`Func<string, byte[]>`](https://learn.microsoft.com/dotnet/api/system.func-2) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `Validate(IXmlPolicyMapper, ValidationContext, Func<string, byte[]>)` {#validate-lacuna-pki-xml-ixmlpolicymapper-lacuna-pki-stores-validationcontext-system-func-system-string-system-byte}

```csharp
public ValidationResults Validate(IXmlPolicyMapper policyMapper, ValidationContext validationContext, Func<string, byte[]> detachedResourceResolver = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IXmlPolicyMapper`](./IXmlPolicyMapper.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |
| `detachedResourceResolver` | [`Func<string, byte[]>`](https://learn.microsoft.com/dotnet/api/system.func-2) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `Validate(IXmlPolicyMapperBySignature, DateTimeOffset?, Func<string, byte[]>)` {#validate-lacuna-pki-xml-ixmlpolicymapperbysignature-system-nullable-system-datetimeoffset-system-func-system-string-system-byte}

```csharp
public ValidationResults Validate(IXmlPolicyMapperBySignature policyMapper, DateTimeOffset? dateReference = null, Func<string, byte[]> detachedResourceResolver = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `detachedResourceResolver` | [`Func<string, byte[]>`](https://learn.microsoft.com/dotnet/api/system.func-2) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `Validate(IXmlPolicyMapperBySignature, ValidationContext, Func<string, byte[]>)` {#validate-lacuna-pki-xml-ixmlpolicymapperbysignature-lacuna-pki-stores-validationcontext-system-func-system-string-system-byte}

```csharp
public ValidationResults Validate(IXmlPolicyMapperBySignature policyMapper, ValidationContext validationContext, Func<string, byte[]> detachedResourceResolver = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |
| `detachedResourceResolver` | [`Func<string, byte[]>`](https://learn.microsoft.com/dotnet/api/system.func-2) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `Validate(XmlPolicySpec, DateTimeOffset?, Func<string, byte[]>)` {#validate-lacuna-pki-xml-xmlpolicyspec-system-nullable-system-datetimeoffset-system-func-system-string-system-byte}

```csharp
public ValidationResults Validate(XmlPolicySpec policy, DateTimeOffset? dateReference = null, Func<string, byte[]> detachedResourceResolver = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`XmlPolicySpec`](./XmlPolicySpec.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `detachedResourceResolver` | [`Func<string, byte[]>`](https://learn.microsoft.com/dotnet/api/system.func-2) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `Validate(XmlPolicySpec, ValidationContext, Func<string, byte[]>)` {#validate-lacuna-pki-xml-xmlpolicyspec-lacuna-pki-stores-validationcontext-system-func-system-string-system-byte}

```csharp
public ValidationResults Validate(XmlPolicySpec policy, ValidationContext validationContext, Func<string, byte[]> detachedResourceResolver = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`XmlPolicySpec`](./XmlPolicySpec.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |
| `detachedResourceResolver` | [`Func<string, byte[]>`](https://learn.microsoft.com/dotnet/api/system.func-2) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
