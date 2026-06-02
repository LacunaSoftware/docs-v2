---
sidebar_label: "X509ExtensionsGenerator"
---

# X509ExtensionsGenerator

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class X509ExtensionsGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `X509ExtensionsGenerator`

## Construtores

### `X509ExtensionsGenerator()` {#ctor}

```csharp
public X509ExtensionsGenerator()
```

---

## Métodos

### `AddAuthorityInfoAccess(IEnumerable<AuthorityInfoAccessEntry>, bool)` {#addauthorityinfoaccess-system-collections-generic-ienumerable-lacuna-pki-authorityinfoaccessentry-system-boolean}

```csharp
public void AddAuthorityInfoAccess(IEnumerable<AuthorityInfoAccessEntry> authorityInfoAccessEntries, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `authorityInfoAccessEntries` | [`IEnumerable<AuthorityInfoAccessEntry>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddAuthorityKeyIdentifier(byte[], bool)` {#addauthoritykeyidentifier-system-byte-system-boolean}

```csharp
public void AddAuthorityKeyIdentifier(byte[] authorityKeyId, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `authorityKeyId` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddAuthorityKeyIdentifier(PublicKey, bool)` {#addauthoritykeyidentifier-lacuna-pki-publickey-system-boolean}

```csharp
public void AddAuthorityKeyIdentifier(PublicKey authorityPublicKey, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `authorityPublicKey` | [`PublicKey`](./PublicKey.md) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddCertificatePolicies(IEnumerable<CertificatePolicyEntry>, bool)` {#addcertificatepolicies-system-collections-generic-ienumerable-lacuna-pki-certificatepolicyentry-system-boolean}

```csharp
public void AddCertificatePolicies(IEnumerable<CertificatePolicyEntry> policies, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policies` | [`IEnumerable<CertificatePolicyEntry>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddCrlDistributionPoints(IEnumerable<Uri>, bool)` {#addcrldistributionpoints-system-collections-generic-ienumerable-system-uri-system-boolean}

```csharp
public void AddCrlDistributionPoints(IEnumerable<Uri> crlUris, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `crlUris` | [`IEnumerable<Uri>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddCrlDistributionPoints(Uri, bool)` {#addcrldistributionpoints-system-uri-system-boolean}

```csharp
public void AddCrlDistributionPoints(Uri crlUri, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `crlUri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddCustomExtension<T>(string, T, bool)` {#addcustomextension-1-system-string-0-system-boolean}

Adds a custom X509 Extension with a value to be encoded as DER and wrapped in the extension's OCTETSTRING

```csharp
public void AddCustomExtension<T>(string oid, T value, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `value` | `T` | Value to be DER encoded and wrapped |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

---

### `AddExtendedKeyUsage(ExtendedKeyUsage, bool)` {#addextendedkeyusage-lacuna-pki-extendedkeyusage-system-boolean}

```csharp
public void AddExtendedKeyUsage(ExtendedKeyUsage extendedKeyUsage, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `extendedKeyUsage` | [`ExtendedKeyUsage`](./ExtendedKeyUsage.md) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddIssuingDistributionPoint(Uri, DistributionPointConstraints, bool, IEnumerable<RevocationReasons>, bool)` {#addissuingdistributionpoint-system-uri-lacuna-pki-distributionpointconstraints-system-boolean-system-collections-generic-ienumerable-lacuna-pki-revocationreasons-system-boolean}

```csharp
public void AddIssuingDistributionPoint(Uri uri, DistributionPointConstraints dpConstraint, bool isIndirectCrl = false, IEnumerable<RevocationReasons> onlyReasons = null, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `dpConstraint` | [`DistributionPointConstraints`](./DistributionPointConstraints.md) |  |
| `isIndirectCrl` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |
| `onlyReasons` | [`IEnumerable<RevocationReasons>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddKeyUsage(KeyUsage, bool)` {#addkeyusage-lacuna-pki-keyusage-system-boolean}

```csharp
public void AddKeyUsage(KeyUsage keyUsage, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `keyUsage` | [`KeyUsage`](./KeyUsage.md) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddRawCustomExtension(string, byte[], bool)` {#addrawcustomextension-system-string-system-byte-system-boolean}

Adds a custom X509 Extension with a DER encoded value to be wrapped in the extension's OCTETSTRING

```csharp
public void AddRawCustomExtension(string oid, byte[] encodedValue, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `encodedValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | DER encoded value to be wrapped |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddSubjectKeyIdentifier(byte[], bool)` {#addsubjectkeyidentifier-system-byte-system-boolean}

```csharp
public void AddSubjectKeyIdentifier(byte[] subjectKeyId, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `subjectKeyId` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddSubjectKeyIdentifier(PublicKey, bool)` {#addsubjectkeyidentifier-lacuna-pki-publickey-system-boolean}

```csharp
public void AddSubjectKeyIdentifier(PublicKey subjectPublicKey, bool isCritical = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `subjectPublicKey` | [`PublicKey`](./PublicKey.md) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `Generate()` {#generate}

```csharp
public X509Extensions Generate()
```

**Retorno**

[`X509Extensions`](./X509Extensions.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
