---
sidebar_label: "IReferencedCrlStore"
---

# IReferencedCrlStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface IReferencedCrlStore
```

## Métodos

### `GetCrl(DigestAlgorithm, byte[])` {#getcrl-lacuna-pki-digestalgorithm-system-byte}

Recovers a CRL based on its digest value. The digest algorithm it's based on signerInfo or policy message digest Algorithm

```csharp
Crl GetCrl(DigestAlgorithm hashAlgorithm, byte[] crlHash)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `hashAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |
| `crlHash` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Crl`](../Lacuna.Pki/Crl.md)

---

### `PutCrl(DigestAlgorithm, byte[])` {#putcrl-lacuna-pki-digestalgorithm-system-byte}

```csharp
void PutCrl(DigestAlgorithm hashAlgorithm, byte[] crl)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `hashAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |
| `crl` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---
