---
sidebar_label: "Pkcs12Generator"
---

# Pkcs12Generator

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for PKCS#12 store generation

```csharp
public class Pkcs12Generator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Pkcs12Generator`

## Construtores

### `Pkcs12Generator()` {#ctor}

```csharp
public Pkcs12Generator()
```

---

## Métodos

### `AddCertificateEntry(string, PKCertificate)` {#addcertificateentry-system-string-lacuna-pki-pkcertificate}

Adds a certificate entry to PKCS#12 store

```csharp
public void AddCertificateEntry(string alias, PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `alias` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Alias entry |
| `certificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) | Certifcate |

---

### `AddCertificateEntry(string, X509Certificate)` {#addcertificateentry-system-string-system-security-cryptography-x509certificates-x509certificate}

Adds a certificate entry to PKCS#12 store

```csharp
public void AddCertificateEntry(string alias, X509Certificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `alias` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Alias entry |
| `certificate` | [`X509Certificate`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.x509certificates.x509certificate) | Certifcate |

---

### `AddKeyEntry(string, AsymmetricAlgorithm, IEnumerable<PKCertificate>)` {#addkeyentry-system-string-system-security-cryptography-asymmetricalgorithm-system-collections-generic-ienumerable-lacuna-pki-pkcertificate}

Adds a key entry to PKCS#12 store

```csharp
[Obsolete("Use overload with separate certificate and CA certificates")]
public void AddKeyEntry(string alias, AsymmetricAlgorithm privateKey, IEnumerable<PKCertificate> certificates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `alias` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Alias entry |
| `privateKey` | [`AsymmetricAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricalgorithm) | Private key |
| `certificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | Certificate chain. If more than one certificate, the certificate associated with the privateKey MUST come in the first position |

---

### `AddKeyEntry(string, AsymmetricAlgorithm, IEnumerable<X509Certificate>)` {#addkeyentry-system-string-system-security-cryptography-asymmetricalgorithm-system-collections-generic-ienumerable-system-security-cryptography-x509certificates-x509certificate}

Adds a key entry to PKCS#12 store

```csharp
[Obsolete("Use overload with separate certificate and CA certificates")]
public void AddKeyEntry(string alias, AsymmetricAlgorithm privateKey, IEnumerable<X509Certificate> certificates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `alias` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Alias entry |
| `privateKey` | [`AsymmetricAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricalgorithm) | Private key |
| `certificates` | [`IEnumerable<X509Certificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | Certificate chain. If more than one certificate, the certificate associated with the privateKey MUST come in the first position |

---

### `AddKeyEntry(string, AsymmetricAlgorithm, PKCertificate, IEnumerable<PKCertificate>)` {#addkeyentry-system-string-system-security-cryptography-asymmetricalgorithm-lacuna-pki-pkcertificate-system-collections-generic-ienumerable-lacuna-pki-pkcertificate}

Adds a key entry to PKCS#12 store

```csharp
public void AddKeyEntry(string alias, AsymmetricAlgorithm privateKey, PKCertificate certificate, IEnumerable<PKCertificate> caCertificates = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `alias` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Alias entry |
| `privateKey` | [`AsymmetricAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricalgorithm) | Private key |
| `certificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) | Certificate associated with the private key |
| `caCertificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | CA certificates chain |

---

### `AddKeyEntry(string, PrivateKey, PKCertificate, IEnumerable<PKCertificate>)` {#addkeyentry-system-string-lacuna-pki-privatekey-lacuna-pki-pkcertificate-system-collections-generic-ienumerable-lacuna-pki-pkcertificate}

Adds a key entry to PKCS#12 store

```csharp
public void AddKeyEntry(string alias, PrivateKey privateKey, PKCertificate certificate, IEnumerable<PKCertificate> caCertificates = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `alias` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Alias entry |
| `privateKey` | [`PrivateKey`](../Lacuna.Pki/PrivateKey.md) | Private key |
| `certificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) | Certificate associated with the private key |
| `caCertificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | CA certificates chain |

---

### `Generate(string)` {#generate-system-string}

Generates the PKCS#12 content

```csharp
public byte[] Generate(string password)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `password` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Password for key encryption |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — PKCS#12 content bytes

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
