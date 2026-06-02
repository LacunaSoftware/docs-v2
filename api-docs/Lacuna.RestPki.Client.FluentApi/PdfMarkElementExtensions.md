---
sidebar_label: "PdfMarkElementExtensions"
---

# PdfMarkElementExtensions

**Namespace:** `Lacuna.RestPki.Client.FluentApi`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public static class PdfMarkElementExtensions
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMarkElementExtensions`

## Métodos

### `AddSection(PdfMarkTextElement, PdfTextSection)` {#addsection-lacuna-restpki-client-pdfmarktextelement-lacuna-restpki-client-pdftextsection}

```csharp
public static PdfMarkTextElement AddSection(this PdfMarkTextElement element, PdfTextSection section)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md) |  |
| `section` | [`PdfTextSection`](../Lacuna.RestPki.Client/PdfTextSection.md) |  |

**Retorno**

[`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md)

---

### `AddSection(PdfMarkTextElement, string)` {#addsection-lacuna-restpki-client-pdfmarktextelement-system-string}

```csharp
public static PdfMarkTextElement AddSection(this PdfMarkTextElement element, string text)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md) |  |
| `text` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md)

---

### `AlignTextCenter(PdfMarkTextElement)` {#aligntextcenter-lacuna-restpki-client-pdfmarktextelement}

```csharp
public static PdfMarkTextElement AlignTextCenter(this PdfMarkTextElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md) |  |

**Retorno**

[`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md)

---

### `AlignTextLeft(PdfMarkTextElement)` {#aligntextleft-lacuna-restpki-client-pdfmarktextelement}

```csharp
public static PdfMarkTextElement AlignTextLeft(this PdfMarkTextElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md) |  |

**Retorno**

[`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md)

---

### `AlignTextRight(PdfMarkTextElement)` {#aligntextright-lacuna-restpki-client-pdfmarktextelement}

```csharp
public static PdfMarkTextElement AlignTextRight(this PdfMarkTextElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md) |  |

**Retorno**

[`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md)

---

### `DrawQuietZones(PdfMarkQRCodeElement)` {#drawquietzones-lacuna-restpki-client-pdfmarkqrcodeelement}

```csharp
public static PdfMarkQRCodeElement DrawQuietZones(this PdfMarkQRCodeElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkQRCodeElement`](../Lacuna.RestPki.Client/PdfMarkQRCodeElement.md) |  |

**Retorno**

[`PdfMarkQRCodeElement`](../Lacuna.RestPki.Client/PdfMarkQRCodeElement.md)

---

### `OnContainer<T>(T, PadesVisualRectangle)` {#oncontainer-1-0-lacuna-restpki-client-padesvisualrectangle}

```csharp
public static T OnContainer<T>(this T element, PadesVisualRectangle relativeContainer) where T : PdfMarkElement
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | `T` |  |
| `relativeContainer` | [`PadesVisualRectangle`](../Lacuna.RestPki.Client/PadesVisualRectangle.md) |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

**Retorno**

`T`

---

### `Rotate180<T>(T)` {#rotate180-1-0}

```csharp
public static T Rotate180<T>(this T element) where T : PdfMarkElement
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | `T` |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

**Retorno**

`T`

---

### `Rotate90Clockwise<T>(T)` {#rotate90clockwise-1-0}

```csharp
public static T Rotate90Clockwise<T>(this T element) where T : PdfMarkElement
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | `T` |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

**Retorno**

`T`

---

### `Rotate90Counterclockwise<T>(T)` {#rotate90counterclockwise-1-0}

```csharp
public static T Rotate90Counterclockwise<T>(this T element) where T : PdfMarkElement
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | `T` |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

**Retorno**

`T`

---

### `VerticalAlignTextBottom(PdfMarkTextElement)` {#verticalaligntextbottom-lacuna-restpki-client-pdfmarktextelement}

```csharp
public static PdfMarkTextElement VerticalAlignTextBottom(this PdfMarkTextElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md) |  |

**Retorno**

[`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md)

---

### `VerticalAlignTextCenter(PdfMarkTextElement)` {#verticalaligntextcenter-lacuna-restpki-client-pdfmarktextelement}

```csharp
public static PdfMarkTextElement VerticalAlignTextCenter(this PdfMarkTextElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md) |  |

**Retorno**

[`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md)

---

### `VerticalAlignTextTop(PdfMarkTextElement)` {#verticalaligntexttop-lacuna-restpki-client-pdfmarktextelement}

```csharp
public static PdfMarkTextElement VerticalAlignTextTop(this PdfMarkTextElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md) |  |

**Retorno**

[`PdfMarkTextElement`](../Lacuna.RestPki.Client/PdfMarkTextElement.md)

---

### `WithImage(PdfMarkImageElement, byte[], string)` {#withimage-lacuna-restpki-client-pdfmarkimageelement-system-byte-system-string}

```csharp
public static PdfMarkImageElement WithImage(this PdfMarkImageElement element, byte[] imageContent, string mimeType)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkImageElement`](../Lacuna.RestPki.Client/PdfMarkImageElement.md) |  |
| `imageContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `mimeType` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PdfMarkImageElement`](../Lacuna.RestPki.Client/PdfMarkImageElement.md)

---

### `WithImage(PdfMarkImageElement, PdfMarkImage)` {#withimage-lacuna-restpki-client-pdfmarkimageelement-lacuna-restpki-client-pdfmarkimage}

```csharp
public static PdfMarkImageElement WithImage(this PdfMarkImageElement element, PdfMarkImage image)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkImageElement`](../Lacuna.RestPki.Client/PdfMarkImageElement.md) |  |
| `image` | [`PdfMarkImage`](../Lacuna.RestPki.Client/PdfMarkImage.md) |  |

**Retorno**

[`PdfMarkImageElement`](../Lacuna.RestPki.Client/PdfMarkImageElement.md)

---

### `WithOpacity<T>(T, double)` {#withopacity-1-0-system-double}

```csharp
public static T WithOpacity<T>(this T element, double opacity) where T : PdfMarkElement
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | `T` |  |
| `opacity` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

**Retorno**

`T`

---

### `WithQRCodeData(PdfMarkQRCodeElement, string)` {#withqrcodedata-lacuna-restpki-client-pdfmarkqrcodeelement-system-string}

```csharp
public static PdfMarkQRCodeElement WithQRCodeData(this PdfMarkQRCodeElement element, string qrCodeData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`PdfMarkQRCodeElement`](../Lacuna.RestPki.Client/PdfMarkQRCodeElement.md) |  |
| `qrCodeData` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PdfMarkQRCodeElement`](../Lacuna.RestPki.Client/PdfMarkQRCodeElement.md)

---

### `WithRotation<T>(T, int)` {#withrotation-1-0-system-int32}

```csharp
public static T WithRotation<T>(this T element, int rotation) where T : PdfMarkElement
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | `T` |  |
| `rotation` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

**Retorno**

`T`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
