---
sidebar_label: "AuthenticationOptions"
---

# AuthenticationOptions

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class AuthenticationOptions
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AuthenticationOptions`

## Construtores

### `AuthenticationOptions()` {#ctor}

```csharp
public AuthenticationOptions()
```

---

## Propriedades

### `IgnoreRevocationStatusUnknown` {#ignorerevocationstatusunknown}

Whether validation errors due to the revocation status of a certificate being
unknown should be ignored. Defaults to false.

```csharp
public bool IgnoreRevocationStatusUnknown { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `SecurityContextId` {#securitycontextid}

```csharp
public Guid SecurityContextId { get; set; }
```

**Retorno**

[`Guid`](https://learn.microsoft.com/dotnet/api/system.guid)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
