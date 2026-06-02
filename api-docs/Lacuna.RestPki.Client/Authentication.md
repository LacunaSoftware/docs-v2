---
sidebar_label: "Authentication"
---

# Authentication

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class Authentication
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Authentication`

## Construtores

### `Authentication(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public Authentication(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Métodos

### `Complete(byte[], byte[], byte[], AuthenticationOptions)` {#complete-system-byte-system-byte-system-byte-lacuna-restpki-client-authenticationoptions}

```csharp
public ValidationResults Complete(byte[] nonce, byte[] certificateContent, byte[] signature, AuthenticationOptions options)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `certificateContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `options` | [`AuthenticationOptions`](./AuthenticationOptions.md) |  |

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---

### `Complete(byte[], byte[], byte[], Guid)` {#complete-system-byte-system-byte-system-byte-system-guid}

```csharp
public ValidationResults Complete(byte[] nonce, byte[] certificateContent, byte[] signature, Guid securityContextId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `certificateContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `securityContextId` | [`Guid`](https://learn.microsoft.com/dotnet/api/system.guid) |  |

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---

### `CompleteAsync(byte[], byte[], byte[], AuthenticationOptions)` {#completeasync-system-byte-system-byte-system-byte-lacuna-restpki-client-authenticationoptions}

```csharp
public Task<ValidationResults> CompleteAsync(byte[] nonce, byte[] certificateContent, byte[] signature, AuthenticationOptions options)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `certificateContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `options` | [`AuthenticationOptions`](./AuthenticationOptions.md) |  |

**Retorno**

[`Task<ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `CompleteAsync(byte[], byte[], byte[], Guid)` {#completeasync-system-byte-system-byte-system-byte-system-guid}

```csharp
public Task<ValidationResults> CompleteAsync(byte[] nonce, byte[] certificateContent, byte[] signature, Guid securityContextId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `certificateContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `securityContextId` | [`Guid`](https://learn.microsoft.com/dotnet/api/system.guid) |  |

**Retorno**

[`Task<ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `CompleteWithWebPki(string)` {#completewithwebpki-system-string}

```csharp
public ValidationResults CompleteWithWebPki(string token)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `token` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---

### `CompleteWithWebPkiAsync(string)` {#completewithwebpkiasync-system-string}

```csharp
public Task<ValidationResults> CompleteWithWebPkiAsync(string token)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `token` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Task<ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `GetCertificate()` {#getcertificate}

```csharp
public PKCertificate GetCertificate()
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `Start()` {#start}

```csharp
public byte[] Start()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `StartAsync()` {#startasync}

```csharp
public Task<byte[]> StartAsync()
```

**Retorno**

[`Task<byte[]>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `StartWithWebPki(AuthenticationOptions)` {#startwithwebpki-lacuna-restpki-client-authenticationoptions}

```csharp
public string StartWithWebPki(AuthenticationOptions options)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `options` | [`AuthenticationOptions`](./AuthenticationOptions.md) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StartWithWebPki(Guid)` {#startwithwebpki-system-guid}

```csharp
public string StartWithWebPki(Guid securityContextId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `securityContextId` | [`Guid`](https://learn.microsoft.com/dotnet/api/system.guid) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StartWithWebPkiAsync(AuthenticationOptions)` {#startwithwebpkiasync-lacuna-restpki-client-authenticationoptions}

```csharp
public Task<string> StartWithWebPkiAsync(AuthenticationOptions options)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `options` | [`AuthenticationOptions`](./AuthenticationOptions.md) |  |

**Retorno**

[`Task<string>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `StartWithWebPkiAsync(Guid)` {#startwithwebpkiasync-system-guid}

```csharp
public Task<string> StartWithWebPkiAsync(Guid securityContextId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `securityContextId` | [`Guid`](https://learn.microsoft.com/dotnet/api/system.guid) |  |

**Retorno**

[`Task<string>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
