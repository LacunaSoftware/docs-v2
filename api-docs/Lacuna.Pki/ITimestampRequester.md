---
sidebar_label: "ITimestampRequester"
---

# ITimestampRequester

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface ITimestampRequester
```

## Métodos

### `GetTimestamp(DigestAlgorithmAndValue)` {#gettimestamp-lacuna-pki-digestalgorithmandvalue}

Requestes the timestamp-token

```csharp
CadesTimestamp GetTimestamp(DigestAlgorithmAndValue digest)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md) | Digest algorithm and value for message-imprint |

**Retorno**

[`CadesTimestamp`](../Lacuna.Pki.Cades/CadesTimestamp.md) — CadesTimestamp signature

---
