---
sidebar_label: "PdfMark"
---

# PdfMark

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PdfMark
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMark`

## Construtores

### `PdfMark()` {#ctor}

```csharp
public PdfMark()
```

---

## Propriedades

### `BackgroundColor` {#backgroundcolor}

```csharp
public Color BackgroundColor { get; set; }
```

**Retorno**

[`Color`](https://learn.microsoft.com/dotnet/api/system.drawing.color)

---

### `BorderColor` {#bordercolor}

```csharp
public Color BorderColor { get; set; }
```

**Retorno**

[`Color`](https://learn.microsoft.com/dotnet/api/system.drawing.color)

---

### `BorderWidth` {#borderwidth}

```csharp
public double BorderWidth { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Container` {#container}

```csharp
public PadesVisualRectangle Container { get; set; }
```

**Retorno**

[`PadesVisualRectangle`](./PadesVisualRectangle.md)

---

### `Elements` {#elements}

```csharp
public List<PdfMarkElement> Elements { get; set; }
```

**Retorno**

[`List<PdfMarkElement>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `PageOption` {#pageoption}

```csharp
public PdfMarkPageOptions PageOption { get; set; }
```

**Retorno**

`PdfMarkPageOptions`

---

### `PageOptionNumber` {#pageoptionnumber}

```csharp
public int PageOptionNumber { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Métodos

### `ToModel()` {#tomodel}

```csharp
public virtual PdfMarkModel ToModel()
```

**Retorno**

`PdfMarkModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
