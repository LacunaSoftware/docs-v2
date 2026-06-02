---
sidebar_label: "PdfMarkText"
---

# PdfMarkText

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PdfMarkText : PdfMarkElement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PdfMarkElement`](./PdfMarkElement.md) → `PdfMarkText`

## Construtores

### `PdfMarkText()` {#ctor}

```csharp
public PdfMarkText()
```

---

## Propriedades

### `Align` {#align}

```csharp
public PadesHorizontalAlign Align { get; set; }
```

**Retorno**

[`PadesHorizontalAlign`](../Lacuna.Pki.Pades/PadesHorizontalAlign.md)

---

### `LineSpacing` {#linespacing}

The line spacing multiplier based on the font size.

```csharp
public double? LineSpacing { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Texts` {#texts}

```csharp
public List<PdfTextSection> Texts { get; set; }
```

**Retorno**

[`List<PdfTextSection>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `VerticalAlign` {#verticalalign}

```csharp
public PadesVerticalAlign VerticalAlign { get; set; }
```

**Retorno**

[`PadesVerticalAlign`](../Lacuna.Pki.Pades/PadesVerticalAlign.md)

---

## Métodos

### `AddSection(PdfTextSection)` {#addsection-lacuna-pki-pdf-pdftextsection}

```csharp
public void AddSection(PdfTextSection text)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `text` | [`PdfTextSection`](./PdfTextSection.md) |  |

---

### `AddSections(IEnumerable<PdfTextSection>)` {#addsections-system-collections-generic-ienumerable-lacuna-pki-pdf-pdftextsection}

```csharp
public void AddSections(IEnumerable<PdfTextSection> texts)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `texts` | [`IEnumerable<PdfTextSection>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `AddSections(params PdfTextSection[])` {#addsections-lacuna-pki-pdf-pdftextsection}

```csharp
public void AddSections(params PdfTextSection[] text)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `text` | `PdfTextSection[]` |  |

---

## Membros herdados

[`Opacity`](./PdfMarkElement.md#opacity), [`RelativeContainer`](./PdfMarkElement.md#relativecontainer), [`Rotation`](./PdfMarkElement.md#rotation), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
