---
sidebar_label: "ISimpleStore"
---

# ISimpleStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface ISimpleStore
```

## Métodos

### `Get(byte[])` {#get-system-byte}

```csharp
byte[] Get(byte[] index)
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
void Put(byte[] index, byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `index` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---
