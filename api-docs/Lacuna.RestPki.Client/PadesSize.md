---
sidebar_label: "PadesSize"
---

# PadesSize

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PadesSize
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesSize`

## Construtores

### `PadesSize()` {#ctor}

```csharp
public PadesSize()
```

---

### `PadesSize(double, double)` {#ctor-system-double-system-double}

```csharp
public PadesSize(double width, double height)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `width` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `height` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

## Propriedades

### `Height` {#height}

```csharp
public double Height { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Width` {#width}

```csharp
public double Width { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

## Métodos

### `CreateFromModel(PadesSizeModel)` {#createfrommodel-lacuna-restpki-api-padessignature-padessizemodel}

```csharp
public static PadesSize CreateFromModel(PadesSizeModel model)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `model` | `PadesSizeModel` |  |

**Retorno**

[`PadesSize`](./PadesSize.md)

---

### `ToModel()` {#tomodel}

```csharp
public PadesSizeModel ToModel()
```

**Retorno**

`PadesSizeModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
