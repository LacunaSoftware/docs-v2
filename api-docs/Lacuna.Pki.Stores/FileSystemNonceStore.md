---
sidebar_label: "FileSystemNonceStore"
---

# FileSystemNonceStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class FileSystemNonceStore : INonceStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `FileSystemNonceStore`

## Construtores

### `FileSystemNonceStore(string)` {#ctor-system-string}

```csharp
public FileSystemNonceStore(string basePath)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `basePath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Métodos

### `CheckAndRemove(byte[])` {#checkandremove-system-byte}

Check that the given nonce is in the store and remove it if so.

```csharp
public bool CheckAndRemove(byte[] nonce)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Nonce to search for, a 16-byte byte array. |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) — True if the nonce is found, false otherwise.

---

### `Store(byte[])` {#store-system-byte}

Store a cryptographic nonce.

```csharp
public void Store(byte[] nonce)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | A 16-byte byte array. |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
