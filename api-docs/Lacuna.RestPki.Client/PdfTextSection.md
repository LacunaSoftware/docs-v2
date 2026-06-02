---
sidebar_label: "PdfTextSection"
---

# PdfTextSection

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PdfTextSection
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfTextSection`

## Construtores

### `PdfTextSection()` {#ctor}

```csharp
public PdfTextSection()
```

---

### `PdfTextSection(string, Color, double?)` {#ctor-system-string-system-drawing-color-system-nullable-system-double}

```csharp
public PdfTextSection(string text, Color color, double? fontSize = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `text` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `color` | [`Color`](https://learn.microsoft.com/dotnet/api/system.drawing.color) |  |
| `fontSize` | [`double?`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `PdfTextSection(string)` {#ctor-system-string}

```csharp
public PdfTextSection(string text)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `text` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Propriedades

### `Color` {#color}

```csharp
public Color Color { get; set; }
```

**Retorno**

[`Color`](https://learn.microsoft.com/dotnet/api/system.drawing.color)

---

### `FontSize` {#fontsize}

```csharp
public double? FontSize { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Style` {#style}

```csharp
public PdfTextStyle Style { get; set; }
```

**Retorno**

`PdfTextStyle`

---

### `Text` {#text}

```csharp
public string Text { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `ToModel()` {#tomodel}

```csharp
public PdfTextSectionModel ToModel()
```

**Retorno**

`PdfTextSectionModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
