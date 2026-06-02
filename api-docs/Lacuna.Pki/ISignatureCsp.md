---
sidebar_label: "ISignatureCsp"
---

# ISignatureCsp

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface ISignatureCsp
```

## Propriedades

### `CanSign` {#cansign}

```csharp
bool CanSign { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `SignData(byte[], int, int)` {#signdata-system-byte-system-int32-system-int32}

```csharp
byte[] SignData(byte[] buffer, int offset, int count)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `buffer` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `offset` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `count` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignData(byte[])` {#signdata-system-byte}

```csharp
byte[] SignData(byte[] buffer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `buffer` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignData(Stream)` {#signdata-system-io-stream}

```csharp
byte[] SignData(Stream inputStream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `inputStream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignHash(byte[])` {#signhash-system-byte}

```csharp
byte[] SignHash(byte[] hash)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `hash` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `VerifyData(byte[], byte[])` {#verifydata-system-byte-system-byte}

```csharp
bool VerifyData(byte[] dataSigned, byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `dataSigned` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `VerifyHash(byte[], byte[])` {#verifyhash-system-byte-system-byte}

```csharp
bool VerifyHash(byte[] hashSigned, byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `hashSigned` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---
