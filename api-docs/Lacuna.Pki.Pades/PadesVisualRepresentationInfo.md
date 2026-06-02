---
sidebar_label: "PadesVisualRepresentationInfo"
---

# PadesVisualRepresentationInfo

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PadesVisualRepresentationInfo
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesVisualRepresentationInfo`

## Propriedades

### `PageNumber` {#pagenumber}

```csharp
public int PageNumber { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Métodos

### `GetSignatureRectangle(PadesMeasurementUnits, PadesPageOptimization)` {#getsignaturerectangle-lacuna-pki-pades-padesmeasurementunits-lacuna-pki-pades-padespageoptimization}

```csharp
public PadesVisualRectangle GetSignatureRectangle(PadesMeasurementUnits measurementUnits, PadesPageOptimization pageOptimization)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `measurementUnits` | [`PadesMeasurementUnits`](./PadesMeasurementUnits.md) |  |
| `pageOptimization` | [`PadesPageOptimization`](./PadesPageOptimization.md) |  |

**Retorno**

[`PadesVisualRectangle`](./PadesVisualRectangle.md)

---

### `GetSignatureRectangle(PadesMeasurementUnits)` {#getsignaturerectangle-lacuna-pki-pades-padesmeasurementunits}

```csharp
public PadesVisualRectangle GetSignatureRectangle(PadesMeasurementUnits measurementUnits)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `measurementUnits` | [`PadesMeasurementUnits`](./PadesMeasurementUnits.md) |  |

**Retorno**

[`PadesVisualRectangle`](./PadesVisualRectangle.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
