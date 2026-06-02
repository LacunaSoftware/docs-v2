---
sidebar_label: "PublicKey"
---

# PublicKey

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class PublicKey
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PublicKey`

## Propriedades

### `Algorithm` {#algorithm}

```csharp
public abstract PKAlgorithm Algorithm { get; }
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

### `KeySize` {#keysize}

```csharp
public abstract int KeySize { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

```csharp
public static PublicKey Decode(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`PublicKey`](./PublicKey.md)

---

### `Decode(string)` {#decode-system-string}

```csharp
public static PublicKey Decode(string pem)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pem` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PublicKey`](./PublicKey.md)

---

### `GetEncodedValue()` {#getencodedvalue}

Returns the DER encoding of the X.509 structure SubjectPublicKeyInfo

```csharp
public byte[] GetEncodedValue()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetEncryptionCsp()` {#getencryptioncsp}

```csharp
public IEncryptionCsp GetEncryptionCsp()
```

**Retorno**

[`IEncryptionCsp`](./IEncryptionCsp.md)

---

### `GetInstance(AsymmetricAlgorithm)` {#getinstance-system-security-cryptography-asymmetricalgorithm}

```csharp
public static PublicKey GetInstance(AsymmetricAlgorithm csp)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `csp` | [`AsymmetricAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricalgorithm) |  |

**Retorno**

[`PublicKey`](./PublicKey.md)

---

### `GetPemEncoded()` {#getpemencoded}

Returns the PEM encoding of the public key

```csharp
public string GetPemEncoded()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GetSignatureCsp(DigestAlgorithm)` {#getsignaturecsp-lacuna-pki-digestalgorithm}

```csharp
public ISignatureCsp GetSignatureCsp(DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`ISignatureCsp`](./ISignatureCsp.md)

---

### `IsEquivalent(PublicKey)` {#isequivalent-lacuna-pki-publickey}

```csharp
public bool IsEquivalent(PublicKey other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`PublicKey`](./PublicKey.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `VerifyData(DigestAlgorithm, byte[], byte[])` {#verifydata-lacuna-pki-digestalgorithm-system-byte-system-byte}

```csharp
public bool VerifyData(DigestAlgorithm digestAlgorithm, byte[] dataSigned, byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `dataSigned` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `VerifyHash(DigestAlgorithm, byte[], byte[])` {#verifyhash-lacuna-pki-digestalgorithm-system-byte-system-byte}

```csharp
public bool VerifyHash(DigestAlgorithm digestAlgorithm, byte[] hashSigned, byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `hashSigned` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
