---
sidebar_label: "FileSystemSimpleStore"
---

# FileSystemSimpleStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class FileSystemSimpleStore : ISimpleStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `FileSystemSimpleStore`

## Construtores

### `FileSystemSimpleStore(string)` {#ctor-system-string}

```csharp
public FileSystemSimpleStore(string basePath)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `basePath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

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
