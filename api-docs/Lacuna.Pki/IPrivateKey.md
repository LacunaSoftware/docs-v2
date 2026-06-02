---
sidebar_label: "IPrivateKey"
---

# IPrivateKey

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface IPrivateKey
```

## Métodos

### `GetEncryptionCsp()` {#getencryptioncsp}

```csharp
IEncryptionCsp GetEncryptionCsp()
```

**Retorno**

[`IEncryptionCsp`](./IEncryptionCsp.md)

---

### `GetSignatureCsp(DigestAlgorithm)` {#getsignaturecsp-lacuna-pki-digestalgorithm}

```csharp
ISignatureCsp GetSignatureCsp(DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`ISignatureCsp`](./ISignatureCsp.md)

---
