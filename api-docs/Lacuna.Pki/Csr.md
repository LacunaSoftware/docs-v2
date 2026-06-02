---
sidebar_label: "Csr"
---

# Csr

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

Represents a high level Certificate Signing Request (PKCS#10) object

```csharp
public class Csr
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Csr`

## Propriedades

### `EncodedValue` {#encodedvalue}

The CSR in DER encoded format

```csharp
public byte[] EncodedValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SignatureAlgorithm` {#signaturealgorithm}

CSR Signature algorithm used for the SignatureValue

```csharp
public SignatureAlgorithm SignatureAlgorithm { get; }
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SignatureValue` {#signaturevalue}

CSR signature value

```csharp
public byte[] SignatureValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Subject` {#subject}

CSR subject name

```csharp
public Name Subject { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `SubjectPublicKey` {#subjectpublickey}

CSR public key

```csharp
public PublicKey SubjectPublicKey { get; }
```

**Retorno**

[`PublicKey`](./PublicKey.md)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

Decodes a CSR from a DER, PEM or DER Base64 encoded bytes

```csharp
public static Csr Decode(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Csr`](./Csr.md)

---

### `Decode(string)` {#decode-system-string}

Decodes a CSR from a PEM or DER Base64 encoded string

```csharp
public static Csr Decode(string content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | PEM or DER Base64 encoded string |

**Retorno**

[`Csr`](./Csr.md)

---

### `GetPemEncoded()` {#getpemencoded}

Returns the CSR in PEM encoded format

```csharp
public string GetPemEncoded()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Verify()` {#verify}

Verifies if the CSR is valid

```csharp
public bool Verify()
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `VerifyCertificate(PKCertificate)` {#verifycertificate-lacuna-pki-pkcertificate}

Verifies if a certificate corresponds to this CSR

```csharp
public bool VerifyCertificate(PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](./PKCertificate.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
