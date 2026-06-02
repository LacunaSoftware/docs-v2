---
sidebar_label: "PdfMark"
---

# PdfMark

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

PDF mark or stamp that is applied on PDF pages

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

[`PadesVisualRectangle`](../Lacuna.Pki.Pades/PadesVisualRectangle.md)

---

### `Elements` {#elements}

```csharp
public List<PdfMarkElement> Elements { get; set; }
```

**Retorno**

[`List<PdfMarkElement>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `MeasurementUnits` {#measurementunits}

```csharp
public PadesMeasurementUnits MeasurementUnits { get; set; }
```

**Retorno**

[`PadesMeasurementUnits`](../Lacuna.Pki.Pades/PadesMeasurementUnits.md)

---

### `PageOptimization` {#pageoptimization}

```csharp
public PadesPageOptimization PageOptimization { get; set; }
```

**Retorno**

[`PadesPageOptimization`](../Lacuna.Pki.Pades/PadesPageOptimization.md)

---

### `PageOption` {#pageoption}

```csharp
public PdfMarkPageOptions PageOption { get; set; }
```

**Retorno**

[`PdfMarkPageOptions`](./PdfMarkPageOptions.md)

---

### `PageOptionNumber` {#pageoptionnumber}

```csharp
public int PageOptionNumber { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
