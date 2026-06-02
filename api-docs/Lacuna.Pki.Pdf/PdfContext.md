---
sidebar_label: "PdfContext"
---

# PdfContext

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PdfContext : PdfMarker.Context, IDisposable
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PdfMarker.Context`](./PdfMarker.Context.md) → `PdfContext`

## Métodos

### `Create(byte[])` {#create-system-byte}

Creates a previous context with the PDF which will be operated

```csharp
public static PdfContext Create(byte[] pdf)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdf` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The PDF to operate with |

**Retorno**

[`PdfContext`](./PdfContext.md)

---

### `Create(PadesSignature)` {#create-lacuna-pki-pades-padessignature}

Creates a PDF Context from a PDF PadesSignature

```csharp
public static PdfContext Create(PadesSignature pades)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pades` | [`PadesSignature`](../Lacuna.Pki.Pades/PadesSignature.md) | The PadesSignature to get the PDF context from |

**Retorno**

[`PdfContext`](./PdfContext.md)

---

### `Create(Stream)` {#create-system-io-stream}

Creates a previous context with the PDF which will be operated

```csharp
public static PdfContext Create(Stream pdf)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdf` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | The PDF to operate with |

**Retorno**

[`PdfContext`](./PdfContext.md)

---

## Membros herdados

[`GetPageDimensions(int, PadesMeasurementUnits)`](./PdfMarker.Context.md#getpagedimensions-system-int32-lacuna-pki-pades-padesmeasurementunits), [`Dispose()`](./PdfMarker.Context.md#dispose), [`PagesCount`](./PdfMarker.Context.md#pagescount), [`PdfAStandard`](./PdfMarker.Context.md#pdfastandard), [`Metadata`](./PdfMarker.Context.md#metadata), [`HasFullPermissions`](./PdfMarker.Context.md#hasfullpermissions), [`SignatureFieldNames`](./PdfMarker.Context.md#signaturefieldnames), [`FormFields`](./PdfMarker.Context.md#formfields), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
