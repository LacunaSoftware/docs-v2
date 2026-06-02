---
sidebar_label: "PdfMarker"
---

# PdfMarker

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PdfMarker
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMarker`

## Construtores

### `PdfMarker(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public PdfMarker(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Propriedades

### `AbortIfSigned` {#abortifsigned}

```csharp
public bool AbortIfSigned { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ForceBlobResult` {#forceblobresult}

```csharp
public bool ForceBlobResult { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Marks` {#marks}

```csharp
public List<PdfMark> Marks { get; set; }
```

**Retorno**

[`List<PdfMark>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `MeasurementUnits` {#measurementunits}

```csharp
public PadesMeasurementUnits MeasurementUnits { get; set; }
```

**Retorno**

`PadesMeasurementUnits`

---

### `PageOptimization` {#pageoptimization}

```csharp
public PadesPageOptimization PageOptimization { get; set; }
```

**Retorno**

[`PadesPageOptimization`](./PadesPageOptimization.md)

---

### `PreserveSignaturesVisualRepresentation` {#preservesignaturesvisualrepresentation}

```csharp
public bool PreserveSignaturesVisualRepresentation { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `Apply()` {#apply}

```csharp
public FileResult Apply()
```

**Retorno**

[`FileResult`](./FileResult.md)

---

### `ApplyAsync()` {#applyasync}

```csharp
public Task<FileResult> ApplyAsync()
```

**Retorno**

[`Task<FileResult>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `SetFile(BlobReference)` {#setfile-lacuna-restpki-client-blobreference}

Sets the PDf from a file previously uploaded with one of the RestPkiClient.UploadFile methods

```csharp
public void SetFile(BlobReference fileBlob)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `fileBlob` | [`BlobReference`](./BlobReference.md) |  |

---

### `SetFile(byte[])` {#setfile-system-byte}

Sets the PDF via a byte array

```csharp
public void SetFile(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The byte array representing the PDF file |

---

### `SetFile(FileResult)` {#setfile-lacuna-restpki-client-fileresult}

Sets the PDf from a file result from a previous call to Rest PKI

```csharp
public void SetFile(FileResult fileResult)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `fileResult` | [`FileResult`](./FileResult.md) |  |

---

### `SetFile(Stream)` {#setfile-system-io-stream}

Sets the PDF via a stream object

```csharp
public void SetFile(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | The stream representing the PDF |

---

### `SetFile(string)` {#setfile-system-string}

Sets the PDF via a file path string

```csharp
public void SetFile(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The path where the file will be found |

**Exceções**

| Tipo | Condição |
|---|---|
| [`FileNotFoundException`](https://learn.microsoft.com/dotnet/api/system.io.filenotfoundexception) | In case a file cannot be found with the given path string |

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
