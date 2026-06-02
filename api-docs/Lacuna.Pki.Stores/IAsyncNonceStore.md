---
sidebar_label: "IAsyncNonceStore"
---

# IAsyncNonceStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Interface_

External asynchronous store that can store cryptographic nonces for certificate authentication.

```csharp
public interface IAsyncNonceStore
```

## Métodos

### `CheckAndRemoveAsync(byte[], CancellationToken)` {#checkandremoveasync-system-byte-system-threading-cancellationtoken}

Check that the given nonce is in the store and remove it if so.

```csharp
Task<bool> CheckAndRemoveAsync(byte[] nonce, CancellationToken cancellationToken = default)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `cancellationToken` | [`CancellationToken`](https://learn.microsoft.com/dotnet/api/system.threading.cancellationtoken) |  |

**Retorno**

[`Task<bool>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `StoreAsync(byte[], CancellationToken)` {#storeasync-system-byte-system-threading-cancellationtoken}

Store a cryptographic nonce.

```csharp
Task StoreAsync(byte[] nonce, CancellationToken cancellationToken = default)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `cancellationToken` | [`CancellationToken`](https://learn.microsoft.com/dotnet/api/system.threading.cancellationtoken) |  |

**Retorno**

[`Task`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task)

---
