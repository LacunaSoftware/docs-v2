---
sidebar_label: "IEncryptionCsp"
---

# IEncryptionCsp

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface IEncryptionCsp
```

## Propriedades

### `CanDecrypt` {#candecrypt}

```csharp
bool CanDecrypt { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `Decrypt(byte[], EncryptionParameters)` {#decrypt-system-byte-lacuna-pki-encryptionparameters}

```csharp
byte[] Decrypt(byte[] data, EncryptionParameters parameters)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `data` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `parameters` | [`EncryptionParameters`](./EncryptionParameters.md) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Encrypt(byte[], EncryptionParameters)` {#encrypt-system-byte-lacuna-pki-encryptionparameters}

```csharp
byte[] Encrypt(byte[] data, EncryptionParameters parameters)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `data` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `parameters` | [`EncryptionParameters`](./EncryptionParameters.md) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---
