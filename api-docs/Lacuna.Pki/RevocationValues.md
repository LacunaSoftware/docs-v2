---
sidebar_label: "RevocationValues"
---

# RevocationValues

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class RevocationValues
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `RevocationValues`

## Propriedades

### `Crls` {#crls}

```csharp
public List<Crl> Crls { get; }
```

**Retorno**

[`List<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Ocsps` {#ocsps}

```csharp
public List<Ocsp> Ocsps { get; }
```

**Retorno**

[`List<Ocsp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `GetInstance(byte[])` {#getinstance-system-byte}

```csharp
public static RevocationValues GetInstance(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`RevocationValues`](./RevocationValues.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
