---
sidebar_label: "PKCertificateWithKey"
---

# PKCertificateWithKey

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PKCertificateWithKey
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PKCertificateWithKey`

## Construtores

### `PKCertificateWithKey(PKCertificate, IPrivateKey)` {#ctor-lacuna-pki-pkcertificate-lacuna-pki-iprivatekey}

```csharp
public PKCertificateWithKey(PKCertificate certificate, IPrivateKey privateKey)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](./PKCertificate.md) |  |
| `privateKey` | [`IPrivateKey`](./IPrivateKey.md) |  |

---

## Propriedades

### `Certificate` {#certificate}

```csharp
public PKCertificate Certificate { get; }
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `PrivateKey` {#privatekey}

```csharp
public IPrivateKey PrivateKey { get; }
```

**Retorno**

[`IPrivateKey`](./IPrivateKey.md)

---

## Métodos

### `GetEncryptionCsp()` {#getencryptioncsp}

```csharp
public IEncryptionCsp GetEncryptionCsp()
```

**Retorno**

[`IEncryptionCsp`](./IEncryptionCsp.md)

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

### `GetSignatureCsp(SignatureAlgorithm)` {#getsignaturecsp-lacuna-pki-signaturealgorithm}

```csharp
public ISignatureCsp GetSignatureCsp(SignatureAlgorithm signatureAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

**Retorno**

[`ISignatureCsp`](./ISignatureCsp.md)

---

### `SignData(DigestAlgorithm, byte[])` {#signdata-lacuna-pki-digestalgorithm-system-byte}

```csharp
public byte[] SignData(DigestAlgorithm digestAlgorithm, byte[] buffer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `buffer` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignData(SignatureAlgorithm, byte[])` {#signdata-lacuna-pki-signaturealgorithm-system-byte}

```csharp
public byte[] SignData(SignatureAlgorithm signatureAlgorithm, byte[] buffer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
| `buffer` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignHash(DigestAlgorithm, byte[])` {#signhash-lacuna-pki-digestalgorithm-system-byte}

```csharp
public byte[] SignHash(DigestAlgorithm digestAlgorithm, byte[] hash)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `hash` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignHash(SignatureAlgorithm, byte[])` {#signhash-lacuna-pki-signaturealgorithm-system-byte}

```csharp
public byte[] SignHash(SignatureAlgorithm signatureAlgorithm, byte[] hash)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
| `hash` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

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

### `VerifyData(SignatureAlgorithm, byte[], byte[])` {#verifydata-lacuna-pki-signaturealgorithm-system-byte-system-byte}

```csharp
public bool VerifyData(SignatureAlgorithm signatureAlgorithm, byte[] dataSigned, byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
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

### `VerifyHash(SignatureAlgorithm, byte[], byte[])` {#verifyhash-lacuna-pki-signaturealgorithm-system-byte-system-byte}

```csharp
public bool VerifyHash(SignatureAlgorithm signatureAlgorithm, byte[] hashSigned, byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
| `hashSigned` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
