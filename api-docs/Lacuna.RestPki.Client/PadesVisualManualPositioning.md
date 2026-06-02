---
sidebar_label: "PadesVisualManualPositioning"
---

# PadesVisualManualPositioning

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PadesVisualManualPositioning : PadesVisualPositioning
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PadesVisualPositioning`](./PadesVisualPositioning.md) → `PadesVisualManualPositioning`

## Construtores

### `PadesVisualManualPositioning()` {#ctor}

```csharp
public PadesVisualManualPositioning()
```

---

### `PadesVisualManualPositioning(int, PadesMeasurementUnits, PadesVisualRectangle)` {#ctor-system-int32-lacuna-restpki-api-padessignature-padesmeasurementunits-lacuna-restpki-client-padesvisualrectangle}

```csharp
[Obsolete("Specify measurement units directly on PadesSignatureStarter instead")]
public PadesVisualManualPositioning(int pageNumber, PadesMeasurementUnits measurementUnits, PadesVisualRectangle position)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `measurementUnits` | `PadesMeasurementUnits` |  |
| `position` | [`PadesVisualRectangle`](./PadesVisualRectangle.md) |  |

---

### `PadesVisualManualPositioning(int, PadesVisualRectangle)` {#ctor-system-int32-lacuna-restpki-client-padesvisualrectangle}

```csharp
public PadesVisualManualPositioning(int pageNumber, PadesVisualRectangle position)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `position` | [`PadesVisualRectangle`](./PadesVisualRectangle.md) |  |

---

## Propriedades

### `SignatureRectangle` {#signaturerectangle}

```csharp
public PadesVisualRectangle SignatureRectangle { get; set; }
```

**Retorno**

[`PadesVisualRectangle`](./PadesVisualRectangle.md)

---

## Métodos

### `ToModel()` {#tomodel}

```csharp
public override PadesVisualPositioningModel ToModel()
```

**Retorno**

`PadesVisualPositioningModel`

---

## Membros herdados

[`CreateFromModel(PadesVisualPositioningModel)`](./PadesVisualPositioning.md#createfrommodel-lacuna-restpki-api-padessignature-padesvisualpositioningmodel), [`GetFootnote(RestPkiClient, int?, int?)`](./PadesVisualPositioning.md#getfootnote-lacuna-restpki-client-restpkiclient-system-nullable-system-int32-system-nullable-system-int32), [`GetFootnoteAsync(RestPkiClient, int?, int?)`](./PadesVisualPositioning.md#getfootnoteasync-lacuna-restpki-client-restpkiclient-system-nullable-system-int32-system-nullable-system-int32), [`GetNewPage(RestPkiClient)`](./PadesVisualPositioning.md#getnewpage-lacuna-restpki-client-restpkiclient), [`GetNewPageAsync(RestPkiClient)`](./PadesVisualPositioning.md#getnewpageasync-lacuna-restpki-client-restpkiclient), [`PageNumber`](./PadesVisualPositioning.md#pagenumber), [`MeasurementUnits`](./PadesVisualPositioning.md#measurementunits), [`PageOptimization`](./PadesVisualPositioning.md#pageoptimization), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
