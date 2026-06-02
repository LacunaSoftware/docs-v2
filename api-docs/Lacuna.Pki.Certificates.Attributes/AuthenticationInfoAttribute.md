---
sidebar_label: "AuthenticationInfoAttribute"
---

# AuthenticationInfoAttribute

**Namespace:** `Lacuna.Pki.Certificates.Attributes`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class AuthenticationInfoAttribute
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AuthenticationInfoAttribute`

## Propriedades

### `AuthInfo` {#authinfo}

```csharp
public byte[] AuthInfo { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Identity` {#identity}

```csharp
public GeneralName Identity { get; }
```

**Retorno**

[`GeneralName`](../Lacuna.Pki/GeneralName.md)

---

### `Service` {#service}

```csharp
public GeneralName Service { get; }
```

**Retorno**

[`GeneralName`](../Lacuna.Pki/GeneralName.md)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

```csharp
public static AuthenticationInfoAttribute Decode(byte[] rawAttribute)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `rawAttribute` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`AuthenticationInfoAttribute`](./AuthenticationInfoAttribute.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
