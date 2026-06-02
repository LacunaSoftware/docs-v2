---
sidebar_label: "PdfMarkImageElement"
---

# PdfMarkImageElement

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PdfMarkImageElement : PdfMarkElement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PdfMarkElement`](./PdfMarkElement.md) → `PdfMarkImageElement`

## Construtores

### `PdfMarkImageElement()` {#ctor}

```csharp
public PdfMarkImageElement()
```

---

### `PdfMarkImageElement(PadesVisualRectangle, PdfMarkImage)` {#ctor-lacuna-restpki-client-padesvisualrectangle-lacuna-restpki-client-pdfmarkimage}

```csharp
public PdfMarkImageElement(PadesVisualRectangle relativeContainer, PdfMarkImage image)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `relativeContainer` | [`PadesVisualRectangle`](./PadesVisualRectangle.md) |  |
| `image` | [`PdfMarkImage`](./PdfMarkImage.md) |  |

---

## Propriedades

### `Image` {#image}

```csharp
public PdfMarkImage Image { get; set; }
```

**Retorno**

[`PdfMarkImage`](./PdfMarkImage.md)

---

## Métodos

### `ToModel()` {#tomodel}

```csharp
public override PdfMarkElementModel ToModel()
```

**Retorno**

`PdfMarkElementModel`

---

## Membros herdados

[`ElementType`](./PdfMarkElement.md#elementtype), [`RelativeContainer`](./PdfMarkElement.md#relativecontainer), [`Rotation`](./PdfMarkElement.md#rotation), [`Opacity`](./PdfMarkElement.md#opacity), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
