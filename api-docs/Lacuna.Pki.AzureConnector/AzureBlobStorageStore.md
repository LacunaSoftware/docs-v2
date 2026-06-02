---
sidebar_label: "AzureBlobStorageStore"
---

# AzureBlobStorageStore

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Class_

```csharp
public class AzureBlobStorageStore : ISimpleStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AzureBlobStorageStore`

## Campos

### `DefaultContainerName` {#defaultcontainername}

```csharp
public const string DefaultContainerName = "lacuna-pki-store"
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `CreateFromBlobClient(CloudBlobClient, string)` {#createfromblobclient-microsoft-windowsazure-storage-blob-cloudblobclient-system-string}

```csharp
public static AzureBlobStorageStore CreateFromBlobClient(CloudBlobClient blobClient, string containerName = "lacuna-pki-store")
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `blobClient` | `CloudBlobClient` |  |
| `containerName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`AzureBlobStorageStore`](./AzureBlobStorageStore.md)

---

### `CreateFromConnectionString(string, string)` {#createfromconnectionstring-system-string-system-string}

```csharp
public static AzureBlobStorageStore CreateFromConnectionString(string connectionString, string containerName = "lacuna-pki-store")
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `connectionString` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `containerName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`AzureBlobStorageStore`](./AzureBlobStorageStore.md)

---

### `CreateFromContainerReference(CloudBlobContainer)` {#createfromcontainerreference-microsoft-windowsazure-storage-blob-cloudblobcontainer}

```csharp
public static AzureBlobStorageStore CreateFromContainerReference(CloudBlobContainer container)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `container` | `CloudBlobContainer` |  |

**Retorno**

[`AzureBlobStorageStore`](./AzureBlobStorageStore.md)

---

### `CreateFromSettingName(string, string)` {#createfromsettingname-system-string-system-string}

```csharp
public static AzureBlobStorageStore CreateFromSettingName(string settingName, string containerName = "lacuna-pki-store")
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `settingName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `containerName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`AzureBlobStorageStore`](./AzureBlobStorageStore.md)

---

### `CreateFromStorageAccount(CloudStorageAccount, string)` {#createfromstorageaccount-microsoft-windowsazure-storage-cloudstorageaccount-system-string}

```csharp
public static AzureBlobStorageStore CreateFromStorageAccount(CloudStorageAccount storageAccount, string containerName = "lacuna-pki-store")
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `storageAccount` | `CloudStorageAccount` |  |
| `containerName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`AzureBlobStorageStore`](./AzureBlobStorageStore.md)

---

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

### `GetAsync(byte[])` {#getasync-system-byte}

```csharp
public Task<byte[]> GetAsync(byte[] index)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `index` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Task<byte[]>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `GetContainerAsync()` {#getcontainerasync}

```csharp
protected Task<CloudBlobContainer> GetContainerAsync()
```

**Retorno**

[`Task<CloudBlobContainer>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

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

### `PutAsync(byte[], byte[])` {#putasync-system-byte-system-byte}

```csharp
public Task PutAsync(byte[] index, byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `index` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Task`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
