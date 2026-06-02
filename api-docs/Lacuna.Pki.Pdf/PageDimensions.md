---
sidebar_label: "PageDimensions"
---

# PageDimensions

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

PDF dimensions class

```csharp
public class PageDimensions : BaseDimensions
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`BaseDimensions`](./BaseDimensions.md) → `PageDimensions`

## Construtores

### `PageDimensions()` {#ctor}

```csharp
public PageDimensions()
```

---

## Propriedades

### `Rotation` {#rotation}

The PDF page rotation in degrees

```csharp
public double Rotation { get; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

## Métodos

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object obj)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `obj` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Operadores

### `operator !=(PageDimensions, PageDimensions)` {#op-inequality-lacuna-pki-pdf-pagedimensions-lacuna-pki-pdf-pagedimensions}

```csharp
public static bool operator !=(PageDimensions a, PageDimensions b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`PageDimensions`](./PageDimensions.md) |  |
| `b` | [`PageDimensions`](./PageDimensions.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `operator ==(PageDimensions, PageDimensions)` {#op-equality-lacuna-pki-pdf-pagedimensions-lacuna-pki-pdf-pagedimensions}

```csharp
public static bool operator ==(PageDimensions a, PageDimensions b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`PageDimensions`](./PageDimensions.md) |  |
| `b` | [`PageDimensions`](./PageDimensions.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`MeasurementUnits`](./BaseDimensions.md#measurementunits), [`Width`](./BaseDimensions.md#width), [`Height`](./BaseDimensions.md#height), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
