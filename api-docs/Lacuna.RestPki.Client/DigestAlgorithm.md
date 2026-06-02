---
sidebar_label: "DigestAlgorithm"
---

# DigestAlgorithm

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class DigestAlgorithm
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `DigestAlgorithm`

## Construtores

### `DigestAlgorithm()` {#ctor}

```csharp
protected DigestAlgorithm()
```

---

## Campos

### `MD5` {#md5}

```csharp
public static readonly DigestAlgorithm MD5
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `SHA1` {#sha1}

```csharp
public static readonly DigestAlgorithm SHA1
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `SHA256` {#sha256}

```csharp
public static readonly DigestAlgorithm SHA256
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `SHA3_256` {#sha3-256}

```csharp
public static readonly DigestAlgorithm SHA3_256
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `SHA384` {#sha384}

```csharp
public static readonly DigestAlgorithm SHA384
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `SHA512` {#sha512}

```csharp
public static readonly DigestAlgorithm SHA512
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

## Propriedades

### `ApiModel` {#apimodel}

```csharp
public abstract DigestAlgorithms ApiModel { get; }
```

**Retorno**

`DigestAlgorithms`

---

### `ByteLength` {#bytelength}

```csharp
public abstract int ByteLength { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `HashAlgorithmName` {#hashalgorithmname}

```csharp
public abstract HashAlgorithmName HashAlgorithmName { get; }
```

**Retorno**

[`HashAlgorithmName`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.hashalgorithmname)

---

### `Name` {#name}

```csharp
public abstract string Name { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Oid` {#oid}

```csharp
public abstract string Oid { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `XmlUri` {#xmluri}

```csharp
public abstract string XmlUri { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `CheckLength(byte[])` {#checklength-system-byte}

```csharp
public void CheckLength(byte[] digestValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `ComputeHash(byte[], int, int)` {#computehash-system-byte-system-int32-system-int32}

```csharp
public byte[] ComputeHash(byte[] buffer, int offset, int count)
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

### `ComputeHash(byte[])` {#computehash-system-byte}

```csharp
public byte[] ComputeHash(byte[] buffer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `buffer` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `ComputeHash(Stream)` {#computehash-system-io-stream}

```csharp
public byte[] ComputeHash(Stream inputStream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `inputStream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Equals(DigestAlgorithm)` {#equals-lacuna-restpki-client-digestalgorithm}

```csharp
public bool Equals(DigestAlgorithm other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object obj)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `obj` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetCsp()` {#getcsp}

```csharp
public abstract HashAlgorithm GetCsp()
```

**Retorno**

[`HashAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.hashalgorithm)

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `GetInstanceByApiModel(DigestAlgorithms)` {#getinstancebyapimodel-lacuna-restpki-api-digestalgorithms}

```csharp
public static DigestAlgorithm GetInstanceByApiModel(DigestAlgorithms algorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `algorithm` | `DigestAlgorithms` |  |

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `GetInstanceByName(string)` {#getinstancebyname-system-string}

```csharp
public static DigestAlgorithm GetInstanceByName(string name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `GetInstanceByOid(string)` {#getinstancebyoid-system-string}

```csharp
public static DigestAlgorithm GetInstanceByOid(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `GetInstanceByXmlUri(string)` {#getinstancebyxmluri-system-string}

```csharp
public static DigestAlgorithm GetInstanceByXmlUri(string xmlUri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlUri` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

## Operadores

### `operator !=(DigestAlgorithm, DigestAlgorithm)` {#op-inequality-lacuna-restpki-client-digestalgorithm-lacuna-restpki-client-digestalgorithm}

```csharp
public static bool operator !=(DigestAlgorithm a, DigestAlgorithm b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `b` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `operator ==(DigestAlgorithm, DigestAlgorithm)` {#op-equality-lacuna-restpki-client-digestalgorithm-lacuna-restpki-client-digestalgorithm}

```csharp
public static bool operator ==(DigestAlgorithm a, DigestAlgorithm b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `b` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals)
