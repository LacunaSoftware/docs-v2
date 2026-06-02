---
sidebar_label: "PdfMarker.Context"
---

# PdfMarker.Context

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PdfMarker.Context : IDisposable
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMarker.Context`

## Construtores

### `Context()` {#ctor}

```csharp
public Context()
```

---

## Propriedades

### `FormFields` {#formfields}

```csharp
public List<PdfFormField> FormFields { get; }
```

**Retorno**

[`List<PdfFormField>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `HasFullPermissions` {#hasfullpermissions}

```csharp
public bool HasFullPermissions { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Metadata` {#metadata}

```csharp
public IDictionary<string, string> Metadata { get; }
```

**Retorno**

[`IDictionary<string, string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.idictionary-2)

---

### `PagesCount` {#pagescount}

```csharp
public int PagesCount { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `PdfAStandard` {#pdfastandard}

```csharp
public PdfAStandards? PdfAStandard { get; }
```

**Retorno**

`PdfAStandards?`

---

### `SignatureFieldNames` {#signaturefieldnames}

```csharp
public List<string> SignatureFieldNames { get; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `Dispose()` {#dispose}

```csharp
public void Dispose()
```

---

### `GetPageDimensions(int, PadesMeasurementUnits)` {#getpagedimensions-system-int32-lacuna-pki-pades-padesmeasurementunits}

```csharp
public PageDimensions GetPageDimensions(int pageNumber, PadesMeasurementUnits measurementUnits = PadesMeasurementUnits.PdfPoints)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pageNumber` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `measurementUnits` | [`PadesMeasurementUnits`](../Lacuna.Pki.Pades/PadesMeasurementUnits.md) |  |

**Retorno**

[`PageDimensions`](./PageDimensions.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
