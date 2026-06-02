---
sidebar_label: "PdfPageContentScale"
---

# PdfPageContentScale

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PdfPageContentScale
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfPageContentScale`

## Construtores

### `PdfPageContentScale()` {#ctor}

```csharp
public PdfPageContentScale()
```

---

## Propriedades

### `HorizontalAlign` {#horizontalalign}

```csharp
public PadesHorizontalAlign HorizontalAlign { get; set; }
```

**Retorno**

[`PadesHorizontalAlign`](../Lacuna.Pki.Pades/PadesHorizontalAlign.md)

---

### `MeasurementUnits` {#measurementunits}

Measurement units of parameters set

```csharp
public PadesMeasurementUnits MeasurementUnits { get; set; }
```

**Retorno**

[`PadesMeasurementUnits`](../Lacuna.Pki.Pades/PadesMeasurementUnits.md)

---

### `PageOption` {#pageoption}

Page option to apply scaling. PdfMarkPageOptions.NewPage option is not a valid for this operation.

```csharp
public PdfMarkPageOptions PageOption { get; set; }
```

**Retorno**

[`PdfMarkPageOptions`](./PdfMarkPageOptions.md)

---

### `PageOptionNumber` {#pageoptionnumber}

Page number of selected PageOption. Only used for PageOptions PdfMarkPageOptions.SinglePage and PdfMarkPageOptions.SinglePageFromEnd

```csharp
public int PageOptionNumber { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `ResizeRectangle` {#resizerectangle}

Relative rectangle size for scaling page content.

```csharp
public PadesVisualRectangle ResizeRectangle { get; set; }
```

**Retorno**

[`PadesVisualRectangle`](../Lacuna.Pki.Pades/PadesVisualRectangle.md)

---

### `ResizeScale` {#resizescale}

The scale value to resize page content. Value must be greater than 0.0 and less then 1.0

```csharp
public double? ResizeScale { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `VerticalAlign` {#verticalalign}

```csharp
public PadesVerticalAlign VerticalAlign { get; set; }
```

**Retorno**

[`PadesVerticalAlign`](../Lacuna.Pki.Pades/PadesVerticalAlign.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
