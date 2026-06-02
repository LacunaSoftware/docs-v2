---
sidebar_label: "INonceStore"
---

# INonceStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Interface_

External store that can store cryptographic nonces for certificate authentication.

```csharp
public interface INonceStore
```

## Métodos

### `CheckAndRemove(byte[])` {#checkandremove-system-byte}

Check that the given nonce is in the store and remove it if so.

```csharp
bool CheckAndRemove(byte[] nonce)
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
void Store(byte[] nonce)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | A 16-byte byte array. |

---
