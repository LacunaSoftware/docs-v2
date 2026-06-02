---
sidebar_label: "PrivateKey"
---

# PrivateKey

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class PrivateKey : IPrivateKey
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PrivateKey`

## Construtores

### `PrivateKey()` {#ctor}

```csharp
protected PrivateKey()
```

---

## Propriedades

### `Algorithm` {#algorithm}

```csharp
public abstract PKAlgorithm Algorithm { get; }
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

## Métodos

### `Decode(byte[], string)` {#decode-system-byte-system-string}

Decodes encrypted private key from ASN1 DER content or PEM file content

```csharp
public static PrivateKey Decode(byte[] content, string password)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `password` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PrivateKey`](./PrivateKey.md)

---

### `Decode(byte[])` {#decode-system-byte}

Decodes private key from ASN1 DER content or PEM file content

```csharp
public static PrivateKey Decode(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`PrivateKey`](./PrivateKey.md)

---

### `Decode(string, string)` {#decode-system-string-system-string}

Decodes encrypted private key from PEM string or ASN1 DER base64 string

```csharp
public static PrivateKey Decode(string pem, string password)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pem` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `password` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PrivateKey`](./PrivateKey.md)

---

### `Decode(string)` {#decode-system-string}

Decodes private key from PEM string or ASN1 DER base64 string

```csharp
public static PrivateKey Decode(string pem)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pem` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PrivateKey`](./PrivateKey.md)

---

### `Export()` {#export}

Returns the DER-encoded (unencrypted) private key (PKCS #8)

```csharp
public byte[] Export()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

**Comentários**

Not all private keys are exportable. For such keys, an exception will be thrown.

---

### `ExportPem()` {#exportpem}

Returns the PEM-encoded (unencrypted) private key (PKCS #8)

```csharp
public string ExportPem()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

**Comentários**

Not all private keys are exportable. For such keys, an exception will be thrown.

---

### `GetEncryptionCsp()` {#getencryptioncsp}

```csharp
public abstract IEncryptionCsp GetEncryptionCsp()
```

**Retorno**

[`IEncryptionCsp`](./IEncryptionCsp.md)

---

### `GetInstance(AsymmetricAlgorithm)` {#getinstance-system-security-cryptography-asymmetricalgorithm}

```csharp
public static PrivateKey GetInstance(AsymmetricAlgorithm underlyingPrivateKey)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `underlyingPrivateKey` | [`AsymmetricAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricalgorithm) |  |

**Retorno**

[`PrivateKey`](./PrivateKey.md)

---

### `GetInstance(X509Certificate2)` {#getinstance-system-security-cryptography-x509certificates-x509certificate2}

```csharp
public static IPrivateKey GetInstance(X509Certificate2 x509Certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `x509Certificate` | [`X509Certificate2`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.x509certificates.x509certificate2) |  |

**Retorno**

[`IPrivateKey`](./IPrivateKey.md)

---

### `GetSignatureCsp(DigestAlgorithm)` {#getsignaturecsp-lacuna-pki-digestalgorithm}

```csharp
public abstract ISignatureCsp GetSignatureCsp(DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`ISignatureCsp`](./ISignatureCsp.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
