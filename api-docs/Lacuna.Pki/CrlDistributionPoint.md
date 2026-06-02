---
sidebar_label: "CrlDistributionPoint"
---

# CrlDistributionPoint

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CrlDistributionPoint
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CrlDistributionPoint`

## Propriedades

### `FullName` {#fullname}

```csharp
public GeneralNames FullName { get; }
```

**Retorno**

[`GeneralNames`](./GeneralNames.md)

---

### `Issuer` {#issuer}

```csharp
public Name Issuer { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `Reasons` {#reasons}

```csharp
public List<RevocationReasons> Reasons { get; }
```

**Retorno**

[`List<RevocationReasons>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Uri` {#uri}

Returns the distribution point URI if its FullName contains a URI, or null otherwise.

```csharp
public Uri Uri { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
