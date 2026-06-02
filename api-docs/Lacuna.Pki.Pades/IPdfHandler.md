---
sidebar_label: "IPdfHandler"
---

# IPdfHandler

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
[Obsolete("There is no need for setting an external Pdf Handler")]
public interface IPdfHandler
```

## Propriedades

### `CanHandleDss` {#canhandledss}

```csharp
bool CanHandleDss { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `CanHandleVisualRepresentation` {#canhandlevisualrepresentation}

```csharp
bool CanHandleVisualRepresentation { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `AddTimestamp(ITimestampRequester)` {#addtimestamp-lacuna-pki-itimestamprequester}

```csharp
void AddTimestamp(ITimestampRequester tsRequester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tsRequester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |

---

### `AddToDss(IEnumerable<DssEntry>)` {#addtodss-system-collections-generic-ienumerable-lacuna-pki-pades-dssentry}

```csharp
void AddToDss(IEnumerable<DssEntry> entries)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `entries` | [`IEnumerable<DssEntry>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `CreateSignatureDictionary(PadesFilters)` {#createsignaturedictionary-lacuna-pki-pades-padesfilters}

```csharp
void CreateSignatureDictionary(PadesFilters filter)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `filter` | [`PadesFilters`](./PadesFilters.md) |  |

---

### `Finalize(byte[])` {#finalize-system-byte}

```csharp
void Finalize(byte[] cms)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `cms` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `GenarateRangeBytes(int)` {#genaraterangebytes-system-int32}

```csharp
Stream GenarateRangeBytes(int estimatedCmsLength)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `estimatedCmsLength` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream)

---

### `GetBlankSignaturesNames()` {#getblanksignaturesnames}

```csharp
ICollection<string> GetBlankSignaturesNames()
```

**Retorno**

[`ICollection<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.icollection-1)

---

### `GetCertificateStoreFromDss()` {#getcertificatestorefromdss}

```csharp
ICertificateStore GetCertificateStoreFromDss()
```

**Retorno**

[`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md)

---

### `GetDss(string)` {#getdss-system-string}

```csharp
Dss GetDss(string signatureFieldName = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureFieldName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Dss`](./Dss.md)

---

### `GetRangeBytes(string)` {#getrangebytes-system-string}

```csharp
byte[] GetRangeBytes(string signatureFieldName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureFieldName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetSignatureFieldName()` {#getsignaturefieldname}

```csharp
string GetSignatureFieldName()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GetSignedPdf()` {#getsignedpdf}

```csharp
byte[] GetSignedPdf()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetSigners()` {#getsigners}

```csharp
ICollection<PadesSignerInfo> GetSigners()
```

**Retorno**

[`ICollection<PadesSignerInfo>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.icollection-1)

---

### `SetCertificationLevel(PadesCertificationLevel)` {#setcertificationlevel-lacuna-pki-pades-padescertificationlevel}

```csharp
void SetCertificationLevel(PadesCertificationLevel level)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `level` | [`PadesCertificationLevel`](./PadesCertificationLevel.md) |  |

---

### `SetPdf(byte[])` {#setpdf-system-byte}

```csharp
void SetPdf(byte[] pdf)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdf` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetSigningDateM(DateTimeOffset)` {#setsigningdatem-system-datetimeoffset}

```csharp
void SetSigningDateM(DateTimeOffset signingDate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signingDate` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

---

### `SetVisualRepresentation(PadesVisualRepresentation, DateTimeOffset?)` {#setvisualrepresentation-lacuna-pki-pades-padesvisualrepresentation-system-nullable-system-datetimeoffset}

```csharp
void SetVisualRepresentation(PadesVisualRepresentation visual, DateTimeOffset? signingTime)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `visual` | [`PadesVisualRepresentation`](./PadesVisualRepresentation.md) |  |
| `signingTime` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

---
