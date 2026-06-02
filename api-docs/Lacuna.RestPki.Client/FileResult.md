---
sidebar_label: "FileResult"
---

# FileResult

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class FileResult
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `FileResult`

## Métodos

### `GetContent()` {#getcontent}

```csharp
public byte[] GetContent()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetContentAsync()` {#getcontentasync}

```csharp
public Task<byte[]> GetContentAsync()
```

**Retorno**

[`Task<byte[]>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `OpenRead()` {#openread}

```csharp
public Stream OpenRead()
```

**Retorno**

[`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream)

---

### `OpenReadAsync()` {#openreadasync}

```csharp
public Task<Stream> OpenReadAsync()
```

**Retorno**

[`Task<Stream>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `WriteTo(Stream)` {#writeto-system-io-stream}

```csharp
public void WriteTo(Stream outStream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `outStream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `WriteToAsync(Stream)` {#writetoasync-system-io-stream}

```csharp
public Task WriteToAsync(Stream outStream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `outStream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

**Retorno**

[`Task`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task)

---

### `WriteToFile(string)` {#writetofile-system-string}

```csharp
public void WriteToFile(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `WriteToFileAsync(string)` {#writetofileasync-system-string}

```csharp
public Task WriteToFileAsync(string path)
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
