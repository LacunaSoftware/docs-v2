---
sidebar_label: "PadesVisualPositioning"
---

# PadesVisualPositioning

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class PadesVisualPositioning
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesVisualPositioning`

## Construtores

### `PadesVisualPositioning()` {#ctor}

```csharp
public PadesVisualPositioning()
```

---

### `PadesVisualPositioning(int, PadesMeasurementUnits)` {#ctor-system-int32-lacuna-restpki-api-padessignature-padesmeasurementunits}

```csharp
[Obsolete("Specify measurement units directly on PadesSignatureStarter instead")]
public PadesVisualPositioning(int pageNumber, PadesMeasurementUnits measurementUnits)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `measurementUnits` | `PadesMeasurementUnits` |  |

---

### `PadesVisualPositioning(int)` {#ctor-system-int32}

```csharp
public PadesVisualPositioning(int pageNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

---

## Propriedades

### `MeasurementUnits` {#measurementunits}

```csharp
[Obsolete("Use the property MeasurementUnits on PadesSignatureStarter instead")]
public PadesMeasurementUnits MeasurementUnits { get; set; }
```

**Retorno**

`PadesMeasurementUnits`

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
[Obsolete("Use the property PageOptimization on PadesSignatureStarter instead")]
public PadesPageOptimization PageOptimization { get; set; }
```

**Retorno**

[`PadesPageOptimization`](./PadesPageOptimization.md)

---

## Métodos

### `CreateFromModel(PadesVisualPositioningModel)` {#createfrommodel-lacuna-restpki-api-padessignature-padesvisualpositioningmodel}

```csharp
public static PadesVisualPositioning CreateFromModel(PadesVisualPositioningModel model)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `model` | `PadesVisualPositioningModel` |  |

**Retorno**

[`PadesVisualPositioning`](./PadesVisualPositioning.md)

---

### `GetFootnote(RestPkiClient, int?, int?)` {#getfootnote-lacuna-restpki-client-restpkiclient-system-nullable-system-int32-system-nullable-system-int32}

```csharp
public static PadesVisualAutoPositioning GetFootnote(RestPkiClient client, int? pageNumber = null, int? rows = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |
| `pageNumber` | [`int?`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `rows` | [`int?`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`PadesVisualAutoPositioning`](./PadesVisualAutoPositioning.md)

---

### `GetFootnoteAsync(RestPkiClient, int?, int?)` {#getfootnoteasync-lacuna-restpki-client-restpkiclient-system-nullable-system-int32-system-nullable-system-int32}

```csharp
public static Task<PadesVisualAutoPositioning> GetFootnoteAsync(RestPkiClient client, int? pageNumber = null, int? rows = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |
| `pageNumber` | [`int?`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `rows` | [`int?`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`Task<PadesVisualAutoPositioning>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `GetNewPage(RestPkiClient)` {#getnewpage-lacuna-restpki-client-restpkiclient}

```csharp
public static PadesVisualAutoPositioning GetNewPage(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

**Retorno**

[`PadesVisualAutoPositioning`](./PadesVisualAutoPositioning.md)

---

### `GetNewPageAsync(RestPkiClient)` {#getnewpageasync-lacuna-restpki-client-restpkiclient}

```csharp
public static Task<PadesVisualAutoPositioning> GetNewPageAsync(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

**Retorno**

[`Task<PadesVisualAutoPositioning>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `ToModel()` {#tomodel}

```csharp
public virtual PadesVisualPositioningModel ToModel()
```

**Retorno**

`PadesVisualPositioningModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
