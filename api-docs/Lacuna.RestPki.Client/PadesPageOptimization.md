---
sidebar_label: "PadesPageOptimization"
---

# PadesPageOptimization

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PadesPageOptimization
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesPageOptimization`

## Construtores

### `PadesPageOptimization()` {#ctor}

```csharp
public PadesPageOptimization()
```

---

### `PadesPageOptimization(PadesSize)` {#ctor-lacuna-restpki-client-padessize}

```csharp
public PadesPageOptimization(PadesSize customPaperSize)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `customPaperSize` | [`PadesSize`](./PadesSize.md) |  |

---

### `PadesPageOptimization(PaperSizes)` {#ctor-lacuna-restpki-api-padessignature-papersizes}

```csharp
public PadesPageOptimization(PaperSizes paperSize)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `paperSize` | `PaperSizes` |  |

---

## Propriedades

### `CustomPaperSize` {#custompapersize}

```csharp
public PadesSize CustomPaperSize { get; set; }
```

**Retorno**

[`PadesSize`](./PadesSize.md)

---

### `PageOrientation` {#pageorientation}

```csharp
public PageOrientations PageOrientation { get; set; }
```

**Retorno**

`PageOrientations`

---

## Métodos

### `CreateFromModel(PadesPageOptimizationModel)` {#createfrommodel-lacuna-restpki-api-padessignature-padespageoptimizationmodel}

```csharp
public static PadesPageOptimization CreateFromModel(PadesPageOptimizationModel model)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `model` | `PadesPageOptimizationModel` |  |

**Retorno**

[`PadesPageOptimization`](./PadesPageOptimization.md)

---

### `ToModel()` {#tomodel}

```csharp
public PadesPageOptimizationModel ToModel()
```

**Retorno**

`PadesPageOptimizationModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
