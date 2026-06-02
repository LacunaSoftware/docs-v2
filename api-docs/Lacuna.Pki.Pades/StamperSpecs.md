---
sidebar_label: "StamperSpecs"
---

# StamperSpecs

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class StamperSpecs
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `StamperSpecs`

## Construtores

### `StamperSpecs()` {#ctor}

```csharp
public StamperSpecs()
```

---

## Propriedades

### `EnableLtv` {#enableltv}

Enable LTV for previous signatures before the timestamping. This action can
extend the life-time protection of the signed PDF

```csharp
public bool EnableLtv { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `TimestampValidationSpec` {#timestampvalidationspec}

Validation policy spec for any previous timestamp in the signed PDF

```csharp
public CadesPolicySpec TimestampValidationSpec { get; set; }
```

**Retorno**

[`CadesPolicySpec`](../Lacuna.Pki.Cades/CadesPolicySpec.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
