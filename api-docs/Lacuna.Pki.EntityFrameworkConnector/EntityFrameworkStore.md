---
sidebar_label: "EntityFrameworkStore"
---

# EntityFrameworkStore

**Namespace:** `Lacuna.Pki.EntityFrameworkConnector`  
**Assembly:** `Lacuna.Pki.EntityFrameworkConnector`  
_Class_

```csharp
public class EntityFrameworkStore : ISimpleStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `EntityFrameworkStore`

## Construtores

### `EntityFrameworkStore(IDbSet<PkiStoreObject>)` {#ctor-system-data-entity-idbset-lacuna-pki-entityframeworkconnector-pkistoreobject}

```csharp
public EntityFrameworkStore(IDbSet<PkiStoreObject> dbSet)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `dbSet` | `IDbSet<PkiStoreObject>` |  |

---

### `EntityFrameworkStore(IPkiStoreContext)` {#ctor-lacuna-pki-entityframeworkconnector-ipkistorecontext}

```csharp
public EntityFrameworkStore(IPkiStoreContext dbContext)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `dbContext` | [`IPkiStoreContext`](./IPkiStoreContext.md) |  |

---

## Métodos

### `Get(byte[])` {#get-system-byte}

```csharp
public byte[] Get(byte[] index)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `index` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Put(byte[], byte[])` {#put-system-byte-system-byte}

```csharp
public void Put(byte[] index, byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `index` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
