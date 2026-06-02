---
sidebar_label: "SignatureAlgorithm"
---

# SignatureAlgorithm

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class SignatureAlgorithm
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignatureAlgorithm`

## Construtores

### `SignatureAlgorithm()` {#ctor}

```csharp
protected SignatureAlgorithm()
```

---

## Campos

### `MD5WithRSA` {#md5withrsa}

```csharp
public static readonly SignatureAlgorithm MD5WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA1WithDSA` {#sha1withdsa}

```csharp
public static readonly SignatureAlgorithm SHA1WithDSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA1WithRSA` {#sha1withrsa}

```csharp
public static readonly SignatureAlgorithm SHA1WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA256WithDSA` {#sha256withdsa}

```csharp
public static readonly SignatureAlgorithm SHA256WithDSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA256WithECDsa` {#sha256withecdsa}

```csharp
public static readonly SignatureAlgorithm SHA256WithECDsa
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA256WithRSA` {#sha256withrsa}

```csharp
public static readonly SignatureAlgorithm SHA256WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA384WithECDsa` {#sha384withecdsa}

```csharp
public static readonly SignatureAlgorithm SHA384WithECDsa
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA384WithRSA` {#sha384withrsa}

```csharp
public static readonly SignatureAlgorithm SHA384WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA512WithECDsa` {#sha512withecdsa}

```csharp
public static readonly SignatureAlgorithm SHA512WithECDsa
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA512WithRSA` {#sha512withrsa}

```csharp
public static readonly SignatureAlgorithm SHA512WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

## Propriedades

### `DigestAlgorithm` {#digestalgorithm}

```csharp
public abstract DigestAlgorithm DigestAlgorithm { get; }
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

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

### `PKAlgorithm` {#pkalgorithm}

```csharp
public abstract PKAlgorithm PKAlgorithm { get; }
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

### `XmlUri` {#xmluri}

```csharp
public abstract string XmlUri { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

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

### `Equals(SignatureAlgorithm)` {#equals-lacuna-pki-signaturealgorithm}

```csharp
public bool Equals(SignatureAlgorithm other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetCsp(PublicKey)` {#getcsp-lacuna-pki-publickey}

```csharp
public abstract ISignatureCsp GetCsp(PublicKey publicKey)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `publicKey` | [`PublicKey`](./PublicKey.md) |  |

**Retorno**

[`ISignatureCsp`](./ISignatureCsp.md)

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `GetInstanceByName(string)` {#getinstancebyname-system-string}

```csharp
public static SignatureAlgorithm GetInstanceByName(string name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `GetInstanceByOid(string)` {#getinstancebyoid-system-string}

```csharp
public static SignatureAlgorithm GetInstanceByOid(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `GetInstanceByXmlUri(string)` {#getinstancebyxmluri-system-string}

```csharp
public static SignatureAlgorithm GetInstanceByXmlUri(string xmlUri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlUri` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `VerifyData(PublicKey, byte[], byte[])` {#verifydata-lacuna-pki-publickey-system-byte-system-byte}

```csharp
public bool VerifyData(PublicKey publicKey, byte[] dataSigned, byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `publicKey` | [`PublicKey`](./PublicKey.md) |  |
| `dataSigned` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `VerifyHash(PublicKey, byte[], byte[])` {#verifyhash-lacuna-pki-publickey-system-byte-system-byte}

```csharp
public bool VerifyHash(PublicKey publicKey, byte[] hashSigned, byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `publicKey` | [`PublicKey`](./PublicKey.md) |  |
| `hashSigned` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Operadores

### `operator !=(SignatureAlgorithm, SignatureAlgorithm)` {#op-inequality-lacuna-pki-signaturealgorithm-lacuna-pki-signaturealgorithm}

```csharp
public static bool operator !=(SignatureAlgorithm a, SignatureAlgorithm b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
| `b` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `operator ==(SignatureAlgorithm, SignatureAlgorithm)` {#op-equality-lacuna-pki-signaturealgorithm-lacuna-pki-signaturealgorithm}

```csharp
public static bool operator ==(SignatureAlgorithm a, SignatureAlgorithm b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
| `b` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
