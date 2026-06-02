---
sidebar_label: "PadesVisualPositioning"
---

# PadesVisualPositioning

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class PadesVisualPositioning
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesVisualPositioning`

## Construtores

### `PadesVisualPositioning()` {#ctor}

```csharp
protected PadesVisualPositioning()
```

---

## Propriedades

### `MeasurementUnits` {#measurementunits}

```csharp
public PadesMeasurementUnits MeasurementUnits { get; set; }
```

**Retorno**

[`PadesMeasurementUnits`](./PadesMeasurementUnits.md)

---

### `PageNumber` {#pagenumber}

Page on which to insert the visual representation. Negative values denote pages counted
from the end of the document (-1 means last page). Zero denotes that, if no signatures are
present, the signature should be inserted in a new page appended to the document.

```csharp
public int PageNumber { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `PageOptimization` {#pageoptimization}

```csharp
public PadesPageOptimization PageOptimization { get; set; }
```

**Retorno**

[`PadesPageOptimization`](./PadesPageOptimization.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
