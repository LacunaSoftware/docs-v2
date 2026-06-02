---
sidebar_label: "PdfMarkExtensions"
---

# PdfMarkExtensions

**Namespace:** `Lacuna.RestPki.Client.FluentApi`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public static class PdfMarkExtensions
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMarkExtensions`

## Métodos

### `AddElement(PdfMark, PdfMarkElement)` {#addelement-lacuna-restpki-client-pdfmark-lacuna-restpki-client-pdfmarkelement}

```csharp
public static PdfMark AddElement(this PdfMark pdfMark, PdfMarkElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |
| `element` | [`PdfMarkElement`](../Lacuna.RestPki.Client/PdfMarkElement.md) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

### `OnAllPages(PdfMark)` {#onallpages-lacuna-restpki-client-pdfmark}

```csharp
public static PdfMark OnAllPages(this PdfMark pdfMark)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

### `OnContainer(PdfMark, PadesVisualRectangle)` {#oncontainer-lacuna-restpki-client-pdfmark-lacuna-restpki-client-padesvisualrectangle}

```csharp
public static PdfMark OnContainer(this PdfMark pdfMark, PadesVisualRectangle container)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |
| `container` | [`PadesVisualRectangle`](../Lacuna.RestPki.Client/PadesVisualRectangle.md) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

### `OnNewPage(PdfMark)` {#onnewpage-lacuna-restpki-client-pdfmark}

```csharp
public static PdfMark OnNewPage(this PdfMark pdfMark)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

### `OnSinglePage(PdfMark, int)` {#onsinglepage-lacuna-restpki-client-pdfmark-system-int32}

```csharp
public static PdfMark OnSinglePage(this PdfMark pdfMark, int pageNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

### `OnSinglePageFromEnd(PdfMark, int)` {#onsinglepagefromend-lacuna-restpki-client-pdfmark-system-int32}

```csharp
public static PdfMark OnSinglePageFromEnd(this PdfMark pdfMark, int pageNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

### `WithBackgroundColor(PdfMark, Color)` {#withbackgroundcolor-lacuna-restpki-client-pdfmark-system-drawing-color}

```csharp
public static PdfMark WithBackgroundColor(this PdfMark pdfMark, Color backgroundColor)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |
| `backgroundColor` | [`Color`](https://learn.microsoft.com/dotnet/api/system.drawing.color) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

### `WithBorderColor(PdfMark, Color)` {#withbordercolor-lacuna-restpki-client-pdfmark-system-drawing-color}

```csharp
public static PdfMark WithBorderColor(this PdfMark pdfMark, Color borderColor)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |
| `borderColor` | [`Color`](https://learn.microsoft.com/dotnet/api/system.drawing.color) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

### `WithBorderWidth(PdfMark, double)` {#withborderwidth-lacuna-restpki-client-pdfmark-system-double}

```csharp
public static PdfMark WithBorderWidth(this PdfMark pdfMark, double borderWidth)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfMark` | [`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md) |  |
| `borderWidth` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

**Retorno**

[`PdfMark`](../Lacuna.RestPki.Client/PdfMark.md)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
