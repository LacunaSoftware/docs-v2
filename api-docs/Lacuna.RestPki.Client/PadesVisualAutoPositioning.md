---
sidebar_label: "PadesVisualAutoPositioning"
---

# PadesVisualAutoPositioning

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
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

### `PadesVisualAutoPositioning(int, PadesMeasurementUnits, PadesVisualRectangle, PadesSize, double)` {#ctor-system-int32-lacuna-restpki-api-padessignature-padesmeasurementunits-lacuna-restpki-client-padesvisualrectangle-lacuna-restpki-client-padessize-system-double}

```csharp
[Obsolete("Specify measurement units directly on PadesSignatureStarter instead")]
public PadesVisualAutoPositioning(int pageNumber, PadesMeasurementUnits measurementUnits, PadesVisualRectangle container, PadesSize signatureRectangleSize, double rowSpacing)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `measurementUnits` | `PadesMeasurementUnits` |  |
| `container` | [`PadesVisualRectangle`](./PadesVisualRectangle.md) |  |
| `signatureRectangleSize` | [`PadesSize`](./PadesSize.md) |  |
| `rowSpacing` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `PadesVisualAutoPositioning(int, PadesVisualRectangle, PadesSize, double)` {#ctor-system-int32-lacuna-restpki-client-padesvisualrectangle-lacuna-restpki-client-padessize-system-double}

```csharp
public PadesVisualAutoPositioning(int pageNumber, PadesVisualRectangle container, PadesSize signatureRectangleSize, double rowSpacing)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `container` | [`PadesVisualRectangle`](./PadesVisualRectangle.md) |  |
| `signatureRectangleSize` | [`PadesSize`](./PadesSize.md) |  |
| `rowSpacing` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

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

```csharp
public AutoPositioningHorizontalDirections HorizontalDirection { get; set; }
```

**Retorno**

`AutoPositioningHorizontalDirections`

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

```csharp
public AutoPositioningVerticalDirections VerticalDirection { get; set; }
```

**Retorno**

`AutoPositioningVerticalDirections`

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
