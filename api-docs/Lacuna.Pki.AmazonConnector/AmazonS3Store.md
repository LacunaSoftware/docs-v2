---
sidebar_label: "AmazonS3Store"
---

# AmazonS3Store

**Namespace:** `Lacuna.Pki.AmazonConnector`  
**Assembly:** `Lacuna.Pki.AmazonConnector`  
_Class_

```csharp
public class AmazonS3Store : ISimpleStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AmazonS3Store`

## Métodos

### `CreateFromAccessCredentials(string, string, RegionEndpoint, string, string)` {#createfromaccesscredentials-system-string-system-string-amazon-regionendpoint-system-string-system-string}

```csharp
public static AmazonS3Store CreateFromAccessCredentials(string awsAccessKey, string awsSecretAccessKey, RegionEndpoint regionEndpoint, string bucketName, string basePath = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `awsAccessKey` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `awsSecretAccessKey` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `regionEndpoint` | `RegionEndpoint` |  |
| `bucketName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `basePath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`AmazonS3Store`](./AmazonS3Store.md)

---

### `CreateFromS3Client(IAmazonS3, string, string)` {#createfroms3client-amazon-s3-iamazons3-system-string-system-string}

```csharp
public static AmazonS3Store CreateFromS3Client(IAmazonS3 s3Client, string bucketName, string basePath = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `s3Client` | `IAmazonS3` |  |
| `bucketName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `basePath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`AmazonS3Store`](./AmazonS3Store.md)

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
