---
sidebar_label: "CsrGenerator"
---

# CsrGenerator

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CsrGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CsrGenerator`

## Construtores

### `CsrGenerator()` {#ctor}

```csharp
public CsrGenerator()
```

---

## Propriedades

### `DefaultSubject` {#defaultsubject}

```csharp
public static Name DefaultSubject { get; set; }
```

**Retorno**

[`Name`](./Name.md)

---

### `PublicKey` {#publickey}

```csharp
public PublicKey PublicKey { get; set; }
```

**Retorno**

[`PublicKey`](./PublicKey.md)

---

### `Subject` {#subject}

```csharp
public Name Subject { get; set; }
```

**Retorno**

[`Name`](./Name.md)

---

## Métodos

### `AddExtensions(X509Extensions)` {#addextensions-lacuna-pki-x509extensions}

```csharp
public void AddExtensions(X509Extensions extensions)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `extensions` | [`X509Extensions`](./X509Extensions.md) |  |

---

### `Generate(bool)` {#generate-system-boolean}

Generates a PEM encoded CSR

```csharp
public string Generate(bool verifySignature = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `verifySignature` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GenerateCsr(bool)` {#generatecsr-system-boolean}

Generates a CSR decoded object

```csharp
public Csr GenerateCsr(bool verifySignature = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `verifySignature` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`Csr`](./Csr.md)

---

### `GetToSignBytes()` {#gettosignbytes}

```csharp
public byte[] GetToSignBytes()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SetPrecomputedSignature(SignatureAlgorithm, byte[], byte[])` {#setprecomputedsignature-lacuna-pki-signaturealgorithm-system-byte-system-byte}

```csharp
public void SetPrecomputedSignature(SignatureAlgorithm signatureAlgorithm, byte[] signature, byte[] toSignBytes = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `toSignBytes` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetPublicKeyParameters(RSAParameters)` {#setpublickeyparameters-system-security-cryptography-rsaparameters}

```csharp
public void SetPublicKeyParameters(RSAParameters publicKeyParameters)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `publicKeyParameters` | [`RSAParameters`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.rsaparameters) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
