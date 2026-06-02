---
sidebar_label: "PdfMarkTextElement"
---

# PdfMarkTextElement

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PdfMarkTextElement : PdfMarkElement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PdfMarkElement`](./PdfMarkElement.md) → `PdfMarkTextElement`

## Construtores

### `PdfMarkTextElement()` {#ctor}

```csharp
public PdfMarkTextElement()
```

---

### `PdfMarkTextElement(PadesVisualRectangle, params PdfTextSection[])` {#ctor-lacuna-restpki-client-padesvisualrectangle-lacuna-restpki-client-pdftextsection}

```csharp
public PdfMarkTextElement(PadesVisualRectangle relativeContainer, params PdfTextSection[] sections)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `relativeContainer` | [`PadesVisualRectangle`](./PadesVisualRectangle.md) |  |
| `sections` | `PdfTextSection[]` |  |

---

## Propriedades

### `Align` {#align}

```csharp
public PadesHorizontalAlign Align { get; set; }
```

**Retorno**

`PadesHorizontalAlign`

---

### `TextSections` {#textsections}

```csharp
public List<PdfTextSection> TextSections { get; set; }
```

**Retorno**

[`List<PdfTextSection>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `VerticalAlign` {#verticalalign}

```csharp
public PadesVerticalAlign? VerticalAlign { get; set; }
```

**Retorno**

`PadesVerticalAlign?`

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
