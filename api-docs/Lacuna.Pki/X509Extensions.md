---
sidebar_label: "X509Extensions"
---

# X509Extensions

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class X509Extensions
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `X509Extensions`

## Propriedades

### `this[string]` {#item-system-string}

```csharp
public X509Extension this[string oid] { get; }
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`X509Extension`](./X509Extension.md)

---

## Métodos

### `CheckForUnprocessedCritical(IEnumerable<string>)` {#checkforunprocessedcritical-system-collections-generic-ienumerable-system-string}

```csharp
public void CheckForUnprocessedCritical(IEnumerable<string> processedExtensions)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `processedExtensions` | [`IEnumerable<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `Contains(string)` {#contains-system-string}

```csharp
public bool Contains(string extensionId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `extensionId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Get(string, bool)` {#get-system-string-system-boolean}

```csharp
public X509Extension Get(string extensionId, bool throwOnNotFound = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `extensionId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `throwOnNotFound` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`X509Extension`](./X509Extension.md)

---

### `GetAllExtensions()` {#getallextensions}

```csharp
public List<X509Extension> GetAllExtensions()
```

**Retorno**

[`List<X509Extension>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetAuthorityInformationAccess()` {#getauthorityinformationaccess}

Returns an object that allows access to the fields of the AuthorityInformationAccess extension,
or null if the extension is not present.

```csharp
public AuthorityInformationAccess GetAuthorityInformationAccess()
```

**Retorno**

[`AuthorityInformationAccess`](./AuthorityInformationAccess.md)

---

### `GetAuthorityKeyIdentifier()` {#getauthoritykeyidentifier}

Returns the bytes of the key identifier in the AuthorityKeyIdentifier extension, or null if the extension
is not present.

```csharp
public byte[] GetAuthorityKeyIdentifier()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetCertificatePolicies()` {#getcertificatepolicies}

```csharp
public List<CertificatePolicy> GetCertificatePolicies()
```

**Retorno**

[`List<CertificatePolicy>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetCrlDistributionPoints()` {#getcrldistributionpoints}

Returns the distribution points in the CRLDistributionPoints extension, or null if the extension is not present.

```csharp
public List<CrlDistributionPoint> GetCrlDistributionPoints()
```

**Retorno**

[`List<CrlDistributionPoint>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetCrlNumber()` {#getcrlnumber}

Returns the number in the CRLNumber extension, or null if the extension is not present.

```csharp
public BigInteger? GetCrlNumber()
```

**Retorno**

[`BigInteger?`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `GetDnsNames()` {#getdnsnames}

```csharp
public List<string> GetDnsNames()
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetExtendedKeyUsage()` {#getextendedkeyusage}

```csharp
public ExtendedKeyUsage? GetExtendedKeyUsage()
```

**Retorno**

`ExtendedKeyUsage?`

---

### `GetKeyUsage()` {#getkeyusage}

```csharp
public KeyUsage? GetKeyUsage()
```

**Retorno**

`KeyUsage?`

---

### `GetQualifiedCertificateStatements()` {#getqualifiedcertificatestatements}

```csharp
public QualifiedCertificateStatementsExtension GetQualifiedCertificateStatements()
```

**Retorno**

[`QualifiedCertificateStatementsExtension`](./QualifiedCertificateStatementsExtension.md)

---

### `GetRfc822Names()` {#getrfc822names}

```csharp
public List<string> GetRfc822Names()
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetSubjectKeyIdentifier()` {#getsubjectkeyidentifier}

Returns the bytes of the key identifier in the SubjectKeyIdentifier extension, or null if the extension
is not present.

```csharp
public byte[] GetSubjectKeyIdentifier()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `TryGet(string, out X509Extension)` {#tryget-system-string-lacuna-pki-x509extension}

```csharp
public bool TryGet(string extensionId, out X509Extension extension)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `extensionId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `extension` | [`X509Extension`](./X509Extension.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
