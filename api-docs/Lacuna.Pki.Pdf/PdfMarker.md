---
sidebar_label: "PdfMarker"
---

# PdfMarker

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PdfMarker
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMarker`

## Construtores

### `PdfMarker()` {#ctor}

```csharp
public PdfMarker()
```

---

## Propriedades

### `NewPagesTemplate` {#newpagestemplate}

A page size and orientation template for creating new pages on the PDF.
If not set, the current PDF pages most common paper size portrait will be used as template.

```csharp
public PdfPageTemplate NewPagesTemplate { get; set; }
```

**Retorno**

[`PdfPageTemplate`](./PdfPageTemplate.md)

---

### `PreserveSignaturesVisualRepresentation` {#preservesignaturesvisualrepresentation}

Whether or not to preserve images of signatures visual representations on the PDF, when present.

```csharp
public bool PreserveSignaturesVisualRepresentation { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ThrowIfSignedPdf` {#throwifsignedpdf}

Throws SignedPdfToMarkException if the PDF has any signature. Default is true.

```csharp
public bool ThrowIfSignedPdf { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `AddMark(PdfMark)` {#addmark-lacuna-pki-pdf-pdfmark}

```csharp
public void AddMark(PdfMark mark)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `mark` | [`PdfMark`](./PdfMark.md) |  |

---

### `AddMarkRange(IEnumerable<PdfMark>)` {#addmarkrange-system-collections-generic-ienumerable-lacuna-pki-pdf-pdfmark}

```csharp
public void AddMarkRange(IEnumerable<PdfMark> marks)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `marks` | [`IEnumerable<PdfMark>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `AddMetadata(string, string)` {#addmetadata-system-string-system-string}

```csharp
public void AddMetadata(string key, string value)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `key` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `value` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `ComputeRequiredArea(Context, PdfMark, IEnumerable<PdfTextSection>, PadesVisualRectangle, PdfMarkRotation, double?)` {#computerequiredarea-lacuna-pki-pdf-pdfmarker-context-lacuna-pki-pdf-pdfmark-system-collections-generic-ienumerable-lacuna-pki-pdf-pdftextsection-lacuna-pki-pades-padesvisualrectangle-lacuna-pki-pdf-pdfmarkrotation-system-nullable-system-double}

Computes the required area which can fit the text in

```csharp
public TextRequiredArea ComputeRequiredArea(PdfMarker.Context context, PdfMark mark, IEnumerable<PdfTextSection> textSections, PadesVisualRectangle textRelativeMaxWidth = null, PdfMarkRotation textRotation = PdfMarkRotation.D0, double? lineSpacing = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `context` | [`PdfMarker.Context`](./PdfMarker.Context.md) | A current PDF to mark context from method CreateContext |
| `mark` | [`PdfMark`](./PdfMark.md) | The text PDF mark parent |
| `textSections` | [`IEnumerable<PdfTextSection>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | The text in sections |
| `textRelativeMaxWidth` | [`PadesVisualRectangle`](../Lacuna.Pki.Pades/PadesVisualRectangle.md) | The text relative max width dimensions. Only needed any two of (Left, Right, Width) parameters |
| `textRotation` | [`PdfMarkRotation`](./PdfMarkRotation.md) | The text rotation inside the container, if any |
| `lineSpacing` | [`double?`](https://learn.microsoft.com/dotnet/api/system.double) | The line spacing multiplier based on the font size |

**Retorno**

[`TextRequiredArea`](./TextRequiredArea.md)

---

### `ComputeRequiredArea(Context, PdfMark, IEnumerable<PdfTextSection>, PadesVisualRectangle, PdfMarkRotation)` {#computerequiredarea-lacuna-pki-pdf-pdfmarker-context-lacuna-pki-pdf-pdfmark-system-collections-generic-ienumerable-lacuna-pki-pdf-pdftextsection-lacuna-pki-pades-padesvisualrectangle-lacuna-pki-pdf-pdfmarkrotation}

Computes the required area which can fit the text in

```csharp
public TextRequiredArea ComputeRequiredArea(PdfMarker.Context context, PdfMark mark, IEnumerable<PdfTextSection> textSections, PadesVisualRectangle textRelativeMaxWidth = null, PdfMarkRotation textRotation = PdfMarkRotation.D0)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `context` | [`PdfMarker.Context`](./PdfMarker.Context.md) | A current PDF to mark context from method CreateContext |
| `mark` | [`PdfMark`](./PdfMark.md) | The text PDF mark parent |
| `textSections` | [`IEnumerable<PdfTextSection>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | The text in sections |
| `textRelativeMaxWidth` | [`PadesVisualRectangle`](../Lacuna.Pki.Pades/PadesVisualRectangle.md) | The text relative max width dimensions. Only needed any two of (Left, Right, Width) parameters |
| `textRotation` | [`PdfMarkRotation`](./PdfMarkRotation.md) | The text rotation inside the container, if any |

**Retorno**

[`TextRequiredArea`](./TextRequiredArea.md)

---

### `ComputeRequiredArea(Context, PdfMark, PdfMarkText)` {#computerequiredarea-lacuna-pki-pdf-pdfmarker-context-lacuna-pki-pdf-pdfmark-lacuna-pki-pdf-pdfmarktext}

Computes the required area which can fit the text in

```csharp
public TextRequiredArea ComputeRequiredArea(PdfMarker.Context context, PdfMark mark, PdfMarkText markText)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `context` | [`PdfMarker.Context`](./PdfMarker.Context.md) | A current PDF to mark context from method CreateContext |
| `mark` | [`PdfMark`](./PdfMark.md) | The text PDF mark parent |
| `markText` | [`PdfMarkText`](./PdfMarkText.md) | The text parameters |

**Retorno**

[`TextRequiredArea`](./TextRequiredArea.md)

---

### `CreateContext(byte[])` {#createcontext-system-byte}

Creates a previous context with the PDF which will be marked

```csharp
public PdfMarker.Context CreateContext(byte[] pdf)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdf` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The PDF to be marked |

**Retorno**

[`PdfMarker.Context`](./PdfMarker.Context.md)

---

### `CreateContext(Stream)` {#createcontext-system-io-stream}

Creates a previous context with the PDF which will be marked

```csharp
public PdfMarker.Context CreateContext(Stream pdf)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdf` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | The PDF to be marked |

**Retorno**

[`PdfMarker.Context`](./PdfMarker.Context.md)

---

### `SetFormField(string, string)` {#setformfield-system-string-system-string}

```csharp
public void SetFormField(string name, string value)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `value` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetPageContentScale(PdfPageContentScale)` {#setpagecontentscale-lacuna-pki-pdf-pdfpagecontentscale}

```csharp
public void SetPageContentScale(PdfPageContentScale scaleParameters)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `scaleParameters` | [`PdfPageContentScale`](./PdfPageContentScale.md) |  |

---

### `WriteMarks(byte[])` {#writemarks-system-byte}

Writes marks to a PDF

```csharp
public byte[] WriteMarks(byte[] pdf)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdf` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The PDF file content to be marked |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — PDF content withs marks

---

### `WriteMarks(Context, Stream)` {#writemarks-lacuna-pki-pdf-pdfmarker-context-system-io-stream}

Writes marks to a PDF

```csharp
public void WriteMarks(PdfMarker.Context context, Stream output)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `context` | [`PdfMarker.Context`](./PdfMarker.Context.md) | A previously created Context through method CreateContext and the PDF to be marked |
| `output` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | PDF with marks |

---

### `WriteMarks(Context)` {#writemarks-lacuna-pki-pdf-pdfmarker-context}

Writes marks to a PDF

```csharp
public byte[] WriteMarks(PdfMarker.Context context)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `context` | [`PdfMarker.Context`](./PdfMarker.Context.md) | A previously created Context through method CreateContext and the PDF to be marked |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `WriteMarks(Stream, Stream)` {#writemarks-system-io-stream-system-io-stream}

Writes marks to a PDF

```csharp
public void WriteMarks(Stream pdf, Stream output)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdf` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | The PDF to be marked |
| `output` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | PDF with marks |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
