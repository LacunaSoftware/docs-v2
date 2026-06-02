---
sidebar_label: "PadesVisualAutoPositioning"
---

# PadesVisualAutoPositioning

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PadesVisualAutoPositioning : PadesVisualPositioning
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PadesVisualPositioning`](./PadesVisualPositioning.md) → `PadesVisualAutoPositioning`

## Construtores

### `PadesVisualAutoPositioning()` {#ctor}

```csharp
public PadesVisualAutoPositioning()
```

---

## Propriedades

### `Container` {#container}

```csharp
public PadesVisualRectangle Container { get; set; }
```

**Retorno**

[`PadesVisualRectangle`](./PadesVisualRectangle.md)

---

### `HorizontalDirection` {#horizontaldirection}

Visual representation rectangles auto positioning grid fulfillment horizontal direction. Default is LeftToRight.

```csharp
public AutoPositioningHorizontalDirections HorizontalDirection { get; set; }
```

**Retorno**

[`AutoPositioningHorizontalDirections`](./AutoPositioningHorizontalDirections.md)

---

### `RowSpacing` {#rowspacing}

```csharp
public double RowSpacing { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `SignatureRectangleSize` {#signaturerectanglesize}

```csharp
public PadesSize SignatureRectangleSize { get; set; }
```

**Retorno**

[`PadesSize`](./PadesSize.md)

---

### `VerticalDirection` {#verticaldirection}

Visual representation rectangles auto positioning grid fulfillment vertical direction. Default is TopDown.

```csharp
public AutoPositioningVerticalDirections VerticalDirection { get; set; }
```

**Retorno**

[`AutoPositioningVerticalDirections`](./AutoPositioningVerticalDirections.md)

---

## Métodos

### `GetFootnote(int, int)` {#getfootnote-system-int32-system-int32}

```csharp
public static PadesVisualAutoPositioning GetFootnote(int pageNumber = -1, int rows = 1)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `rows` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`PadesVisualAutoPositioning`](./PadesVisualAutoPositioning.md)

---

### `GetNewPage()` {#getnewpage}

```csharp
public static PadesVisualAutoPositioning GetNewPage()
```

**Retorno**

[`PadesVisualAutoPositioning`](./PadesVisualAutoPositioning.md)

---

## Membros herdados

[`PageNumber`](./PadesVisualPositioning.md#pagenumber), [`MeasurementUnits`](./PadesVisualPositioning.md#measurementunits), [`PageOptimization`](./PadesVisualPositioning.md#pageoptimization), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
