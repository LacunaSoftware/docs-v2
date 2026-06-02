---
sidebar_label: "TemporaryDownloadLink"
---

# TemporaryDownloadLink

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
[Obsolete]
public class TemporaryDownloadLink
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `TemporaryDownloadLink`

## Construtores

### `TemporaryDownloadLink(string)` {#ctor-system-string}

```csharp
[Obsolete]
public TemporaryDownloadLink(string url)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `url` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Propriedades

### `Url` {#url}

```csharp
public Uri Url { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

## Métodos

### `CopyTo(Stream)` {#copyto-system-io-stream}

```csharp
[Obsolete]
public void CopyTo(Stream outStream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `outStream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `CopyToAsync(Stream)` {#copytoasync-system-io-stream}

```csharp
[Obsolete]
public Task CopyToAsync(Stream outStream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `outStream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

**Retorno**

[`Task`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task)

---

### `GetStream()` {#getstream}

```csharp
[Obsolete]
public Stream GetStream()
```

**Retorno**

[`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream)

---

### `GetStreamAsync()` {#getstreamasync}

```csharp
[Obsolete]
public Task<Stream> GetStreamAsync()
```

**Retorno**

[`Task<Stream>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `Save(string)` {#save-system-string}

```csharp
[Obsolete]
public void Save(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SaveAsync(string)` {#saveasync-system-string}

```csharp
[Obsolete]
public Task SaveAsync(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Task`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
