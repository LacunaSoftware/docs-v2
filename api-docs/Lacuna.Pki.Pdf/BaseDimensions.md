---
sidebar_label: "BaseDimensions"
---

# BaseDimensions

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class BaseDimensions
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `BaseDimensions`

## Construtores

### `BaseDimensions()` {#ctor}

```csharp
protected BaseDimensions()
```

---

## Propriedades

### `Height` {#height}

The height in MeasurementUnits

```csharp
public double Height { get; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `MeasurementUnits` {#measurementunits}

The measurement units of Width and Height

```csharp
public PadesMeasurementUnits MeasurementUnits { get; }
```

**Retorno**

[`PadesMeasurementUnits`](../Lacuna.Pki.Pades/PadesMeasurementUnits.md)

---

### `Width` {#width}

The width in MeasurementUnits

```csharp
public double Width { get; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
