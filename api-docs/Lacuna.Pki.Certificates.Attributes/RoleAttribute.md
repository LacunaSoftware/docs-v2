---
sidebar_label: "RoleAttribute"
---

# RoleAttribute

**Namespace:** `Lacuna.Pki.Certificates.Attributes`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class RoleAttribute
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `RoleAttribute`

## Propriedades

### `RoleAuthority` {#roleauthority}

```csharp
public GeneralNames RoleAuthority { get; }
```

**Retorno**

[`GeneralNames`](../Lacuna.Pki/GeneralNames.md)

---

### `RoleName` {#rolename}

```csharp
public GeneralName RoleName { get; }
```

**Retorno**

[`GeneralName`](../Lacuna.Pki/GeneralName.md)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

```csharp
public static RoleAttribute Decode(byte[] rawAttribute)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `rawAttribute` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`RoleAttribute`](./RoleAttribute.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
