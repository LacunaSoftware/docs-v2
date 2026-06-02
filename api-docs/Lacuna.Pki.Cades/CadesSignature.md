---
sidebar_label: "CadesSignature"
---

# CadesSignature

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CadesSignature : ICertificateStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesSignature`

## Propriedades

### `Certificates` {#certificates}

```csharp
public IEnumerable<PKCertificate> Certificates { get; }
```

**Retorno**

[`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---

### `Crls` {#crls}

```csharp
public IEnumerable<Crl> Crls { get; }
```

**Retorno**

[`IEnumerable<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---

### `EncapsulatedContentType` {#encapsulatedcontenttype}

```csharp
public CmsContentType EncapsulatedContentType { get; }
```

**Retorno**

[`CmsContentType`](../Lacuna.Pki/CmsContentType.md)

---

### `EncodedValue` {#encodedvalue}

```csharp
public byte[] EncodedValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `HasEncapsulatedContent` {#hasencapsulatedcontent}

```csharp
public bool HasEncapsulatedContent { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Signers` {#signers}

```csharp
public List<CadesSignerInfo> Signers { get; }
```

**Retorno**

[`List<CadesSignerInfo>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `GetEncapsulatedContent()` {#getencapsulatedcontent}

```csharp
public byte[] GetEncapsulatedContent()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Open(byte[])` {#open-system-byte}

Open a CAdES signature

```csharp
public static CadesSignature Open(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | CAdES signature content bytes |

**Retorno**

[`CadesSignature`](./CadesSignature.md) — CAdES signature object

---

### `Open(Stream)` {#open-system-io-stream}

Open a CAdES signature

```csharp
public static CadesSignature Open(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | CAdES signature stream |

**Retorno**

[`CadesSignature`](./CadesSignature.md) — CAdES signature object

---

### `Open(string)` {#open-system-string}

Open a CAdES signature

```csharp
public static CadesSignature Open(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | CAdES signature file path |

**Retorno**

[`CadesSignature`](./CadesSignature.md) — CAdES signature object

---

### `SetExternalData(byte[])` {#setexternaldata-system-byte}

```csharp
public void SetExternalData(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetExternalData(Stream)` {#setexternaldata-system-io-stream}

```csharp
public void SetExternalData(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `SetExternalData(string)` {#setexternaldata-system-string}

```csharp
public void SetExternalData(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetExternalDataDigest(DigestAlgorithm, byte[])` {#setexternaldatadigest-lacuna-pki-digestalgorithm-system-byte}

Provides a digest of the data that was signed, so that the validation of the signatures can be performed without
reading the original data. Multiple calls to this method will be necessary if there are multiple signers with
different digest algorithms.

WARNING: if this method is used, it is the caller's responsibility to make sure that the digest provided actually
matches the original signed data.

```csharp
public void SetExternalDataDigest(DigestAlgorithm digestAlgorithm, byte[] digestValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |
| `digestValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `ValidateAllSignatures(CadesPolicySpec, DateTimeOffset?, IReferencedCrlStore)` {#validateallsignatures-lacuna-pki-cades-cadespolicyspec-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public Dictionary<CadesSignerInfo, ValidationResults> ValidateAllSignatures(CadesPolicySpec policy, DateTimeOffset? dateReference = null, IReferencedCrlStore crlStore = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `crlStore` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

**Retorno**

[`Dictionary<CadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(CadesPolicySpec, ValidationContext)` {#validateallsignatures-lacuna-pki-cades-cadespolicyspec-lacuna-pki-stores-validationcontext}

```csharp
public Dictionary<CadesSignerInfo, ValidationResults> ValidateAllSignatures(CadesPolicySpec policy, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`Dictionary<CadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(ICadesPolicyMapper, DateTimeOffset?, IReferencedCrlStore)` {#validateallsignatures-lacuna-pki-cades-icadespolicymapper-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public Dictionary<CadesSignerInfo, ValidationResults> ValidateAllSignatures(ICadesPolicyMapper policyMapper, DateTimeOffset? dateReference = null, IReferencedCrlStore crlStore = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`ICadesPolicyMapper`](./ICadesPolicyMapper.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `crlStore` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

**Retorno**

[`Dictionary<CadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(ICadesPolicyMapper, ValidationContext)` {#validateallsignatures-lacuna-pki-cades-icadespolicymapper-lacuna-pki-stores-validationcontext}

```csharp
public Dictionary<CadesSignerInfo, ValidationResults> ValidateAllSignatures(ICadesPolicyMapper policyMapper, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`ICadesPolicyMapper`](./ICadesPolicyMapper.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`Dictionary<CadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(ICadesPolicyMapperBySignerInfo, DateTimeOffset?, IReferencedCrlStore)` {#validateallsignatures-lacuna-pki-cades-icadespolicymapperbysignerinfo-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public Dictionary<CadesSignerInfo, ValidationResults> ValidateAllSignatures(ICadesPolicyMapperBySignerInfo policyMapper, DateTimeOffset? dateReference = null, IReferencedCrlStore crlStore = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `crlStore` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

**Retorno**

[`Dictionary<CadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(ICadesPolicyMapperBySignerInfo, ValidationContext)` {#validateallsignatures-lacuna-pki-cades-icadespolicymapperbysignerinfo-lacuna-pki-stores-validationcontext}

```csharp
public Dictionary<CadesSignerInfo, ValidationResults> ValidateAllSignatures(ICadesPolicyMapperBySignerInfo policyMapper, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`Dictionary<CadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateSignature(CadesSignerInfo, CadesPolicySpec, DateTimeOffset?, IReferencedCrlStore)` {#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-cadespolicyspec-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public ValidationResults ValidateSignature(CadesSignerInfo signerInfo, CadesPolicySpec policy, DateTimeOffset? dateReference = null, IReferencedCrlStore crlStore = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `crlStore` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(CadesSignerInfo, CadesPolicySpec, ValidationContext)` {#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-cadespolicyspec-lacuna-pki-stores-validationcontext}

```csharp
public ValidationResults ValidateSignature(CadesSignerInfo signerInfo, CadesPolicySpec policy, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(CadesSignerInfo, ICadesPolicyMapper, DateTimeOffset?, IReferencedCrlStore)` {#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-icadespolicymapper-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public ValidationResults ValidateSignature(CadesSignerInfo signerInfo, ICadesPolicyMapper policyMapper, DateTimeOffset? dateReference = null, IReferencedCrlStore crlStore = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `policyMapper` | [`ICadesPolicyMapper`](./ICadesPolicyMapper.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `crlStore` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(CadesSignerInfo, ICadesPolicyMapper, ValidationContext)` {#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-icadespolicymapper-lacuna-pki-stores-validationcontext}

```csharp
public ValidationResults ValidateSignature(CadesSignerInfo signerInfo, ICadesPolicyMapper policyMapper, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `policyMapper` | [`ICadesPolicyMapper`](./ICadesPolicyMapper.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(CadesSignerInfo, ICadesPolicyMapperBySignerInfo, DateTimeOffset?, IReferencedCrlStore)` {#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-icadespolicymapperbysignerinfo-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public ValidationResults ValidateSignature(CadesSignerInfo signerInfo, ICadesPolicyMapperBySignerInfo policyMapper, DateTimeOffset? dateReference = null, IReferencedCrlStore crlStore = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `policyMapper` | [`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `crlStore` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(CadesSignerInfo, ICadesPolicyMapperBySignerInfo, ValidationContext)` {#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-icadespolicymapperbysignerinfo-lacuna-pki-stores-validationcontext}

```csharp
public ValidationResults ValidateSignature(CadesSignerInfo signerInfo, ICadesPolicyMapperBySignerInfo policyMapper, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `policyMapper` | [`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `WriteEncapsulatedContent(Stream)` {#writeencapsulatedcontent-system-io-stream}

```csharp
public void WriteEncapsulatedContent(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
