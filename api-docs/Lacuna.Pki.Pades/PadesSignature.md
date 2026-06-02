---
sidebar_label: "PadesSignature"
---

# PadesSignature

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for viewing PAdES signature elements

```csharp
public class PadesSignature
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesSignature`

## Propriedades

### `Metadata` {#metadata}

The PDF metadata

```csharp
public IDictionary<string, string> Metadata { get; }
```

**Retorno**

[`IDictionary<string, string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.idictionary-2)

---

### `PagesCount` {#pagescount}

The PDF number of pages

```csharp
public int PagesCount { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `PdfAStandard` {#pdfastandard}

The PDF/A standard, part and conformance level, of the document. Null if not a PDF/A document.
Note: This value is recovered from PDF/A-specific metadata, which represents a claim of conformance, not assurance of full PDF/A standard conformance.

```csharp
public PdfAStandards? PdfAStandard { get; }
```

**Retorno**

`PdfAStandards?`

---

### `PdfVersion` {#pdfversion}

PDF format version. Null if it is an invalid or unknown PDF version.

```csharp
public Version PdfVersion { get; }
```

**Retorno**

[`Version`](https://learn.microsoft.com/dotnet/api/system.version)

---

### `Signers` {#signers}

```csharp
public List<PadesSignerInfo> Signers { get; }
```

**Retorno**

[`List<PadesSignerInfo>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `GetBlankSignatureNames()` {#getblanksignaturenames}

```csharp
public List<string> GetBlankSignatureNames()
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetDss(string)` {#getdss-system-string}

Gets a DSS (Document Security Store) dictionary for a signature or for all PAdES signatures context

```csharp
public Dss GetDss(string signaturefieldName = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signaturefieldName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | A specific DSS protected by signature or by all signatures context case no field name passed |

**Retorno**

[`Dss`](./Dss.md)

---

### `GetRangeBytes(string)` {#getrangebytes-system-string}

```csharp
public byte[] GetRangeBytes(string signaturefieldName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signaturefieldName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `HasSignatureField(string)` {#hassignaturefield-system-string}

```csharp
public bool HasSignatureField(string signatureFieldName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureFieldName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Open(byte[])` {#open-system-byte}

Opens a PAdES signature

```csharp
public static PadesSignature Open(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | PAdES signature content bytes |

**Retorno**

[`PadesSignature`](./PadesSignature.md) — PAdES signature object

---

### `Open(Stream)` {#open-system-io-stream}

Opens a PAdES signature

```csharp
public static PadesSignature Open(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

**Retorno**

[`PadesSignature`](./PadesSignature.md) — The PDF file stream

---

### `Open(string)` {#open-system-string}

Opens a PAdES signature

```csharp
public static PadesSignature Open(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | PAdES signature file path |

**Retorno**

[`PadesSignature`](./PadesSignature.md) — PAdES signature object

---

### `ValidateAllSignatures(IPadesPolicyMapper, DateTimeOffset?)` {#validateallsignatures-lacuna-pki-pades-ipadespolicymapper-system-nullable-system-datetimeoffset}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(IPadesPolicyMapper policyMapper, DateTimeOffset? dateReference)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IPadesPolicyMapper`](./IPadesPolicyMapper.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(IPadesPolicyMapper, ValidationContext)` {#validateallsignatures-lacuna-pki-pades-ipadespolicymapper-lacuna-pki-stores-validationcontext}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(IPadesPolicyMapper policyMapper, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IPadesPolicyMapper`](./IPadesPolicyMapper.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(IPadesPolicyMapper)` {#validateallsignatures-lacuna-pki-pades-ipadespolicymapper}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(IPadesPolicyMapper policyMapper)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IPadesPolicyMapper`](./IPadesPolicyMapper.md) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(IPadesPolicyMapperBySignerInfo, DateTimeOffset?)` {#validateallsignatures-lacuna-pki-pades-ipadespolicymapperbysignerinfo-system-nullable-system-datetimeoffset}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(IPadesPolicyMapperBySignerInfo policy, DateTimeOffset? dateReference)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(IPadesPolicyMapperBySignerInfo, ValidationContext)` {#validateallsignatures-lacuna-pki-pades-ipadespolicymapperbysignerinfo-lacuna-pki-stores-validationcontext}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(IPadesPolicyMapperBySignerInfo policy, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(IPadesPolicyMapperBySignerInfo)` {#validateallsignatures-lacuna-pki-pades-ipadespolicymapperbysignerinfo}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(IPadesPolicyMapperBySignerInfo policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(PadesPolicySpec, DateTimeOffset?)` {#validateallsignatures-lacuna-pki-pades-padespolicyspec-system-nullable-system-datetimeoffset}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(PadesPolicySpec policy, DateTimeOffset? dateReference)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(PadesPolicySpec, ValidationContext)` {#validateallsignatures-lacuna-pki-pades-padespolicyspec-lacuna-pki-stores-validationcontext}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(PadesPolicySpec policy, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(PadesPolicySpec)` {#validateallsignatures-lacuna-pki-pades-padespolicyspec}

```csharp
public Dictionary<PadesSignerInfo, ValidationResults> ValidateAllSignatures(PadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) |  |

**Retorno**

[`Dictionary<PadesSignerInfo, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateSignature(PadesSignerInfo, IPadesPolicyMapper, DateTimeOffset?)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-ipadespolicymapper-system-nullable-system-datetimeoffset}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, IPadesPolicyMapper policyMapper, DateTimeOffset? dateReference)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policyMapper` | [`IPadesPolicyMapper`](./IPadesPolicyMapper.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(PadesSignerInfo, IPadesPolicyMapper, ValidationContext)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-ipadespolicymapper-lacuna-pki-stores-validationcontext}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, IPadesPolicyMapper policyMapper, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policyMapper` | [`IPadesPolicyMapper`](./IPadesPolicyMapper.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(PadesSignerInfo, IPadesPolicyMapper)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-ipadespolicymapper}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, IPadesPolicyMapper policyMapper)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policyMapper` | [`IPadesPolicyMapper`](./IPadesPolicyMapper.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(PadesSignerInfo, IPadesPolicyMapperBySignerInfo, DateTimeOffset?)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-ipadespolicymapperbysignerinfo-system-nullable-system-datetimeoffset}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, IPadesPolicyMapperBySignerInfo policyMapper, DateTimeOffset? dateReference)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policyMapper` | [`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(PadesSignerInfo, IPadesPolicyMapperBySignerInfo, ValidationContext)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-ipadespolicymapperbysignerinfo-lacuna-pki-stores-validationcontext}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, IPadesPolicyMapperBySignerInfo policyMapper, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policyMapper` | [`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(PadesSignerInfo, IPadesPolicyMapperBySignerInfo)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-ipadespolicymapperbysignerinfo}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, IPadesPolicyMapperBySignerInfo policyMapper)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policyMapper` | [`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(PadesSignerInfo, PadesPolicySpec, DateTimeOffset?)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-padespolicyspec-system-nullable-system-datetimeoffset}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, PadesPolicySpec policy, DateTimeOffset? dateReference)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(PadesSignerInfo, PadesPolicySpec, ValidationContext)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-padespolicyspec-lacuna-pki-stores-validationcontext}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, PadesPolicySpec policy, ValidationContext validationContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) |  |
| `validationContext` | [`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

### `ValidateSignature(PadesSignerInfo, PadesPolicySpec)` {#validatesignature-lacuna-pki-pades-padessignerinfo-lacuna-pki-pades-padespolicyspec}

```csharp
public ValidationResults ValidateSignature(PadesSignerInfo signerInfo, PadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) |  |

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
