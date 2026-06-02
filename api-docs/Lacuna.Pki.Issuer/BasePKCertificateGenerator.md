---
sidebar_label: "BasePKCertificateGenerator"
---

# BasePKCertificateGenerator

**Namespace:** `Lacuna.Pki.Issuer`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class BasePKCertificateGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `BasePKCertificateGenerator`

## Construtores

### `BasePKCertificateGenerator()` {#ctor}

```csharp
public BasePKCertificateGenerator()
```

---

## Propriedades

### `CertificateLevel` {#certificatelevel}

```csharp
public CertificateChainLevels CertificateLevel { get; set; }
```

**Retorno**

[`CertificateChainLevels`](./CertificateChainLevels.md)

---

### `Csr` {#csr}

Certificate Signing Request with PEM or Base64 over DER encoding

```csharp
public string Csr { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `EndEntityBasicConstraintsCritical` {#endentitybasicconstraintscritical}

```csharp
public bool EndEntityBasicConstraintsCritical { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ExtendedKeyUsage` {#extendedkeyusage}

```csharp
public ExtendedKeyUsage? ExtendedKeyUsage { get; set; }
```

**Retorno**

`ExtendedKeyUsage?`

---

### `ExtendedKeyUsageCritical` {#extendedkeyusagecritical}

```csharp
public bool ExtendedKeyUsageCritical { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeAuthorityKeyId` {#includeauthoritykeyid}

```csharp
public bool IncludeAuthorityKeyId { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeSubjectKeyId` {#includesubjectkeyid}

```csharp
public bool IncludeSubjectKeyId { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsFinalCA` {#isfinalca}

```csharp
public bool IsFinalCA { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsSelfSigned` {#isselfsigned}

```csharp
public bool IsSelfSigned { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `KeyUsage` {#keyusage}

```csharp
public KeyUsage? KeyUsage { get; set; }
```

**Retorno**

`KeyUsage?`

---

### `QualifiedCertificateStatementsCritical` {#qualifiedcertificatestatementscritical}

```csharp
public bool QualifiedCertificateStatementsCritical { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `SanFields` {#sanfields}

Subject ALternative Names field encoding object

```csharp
public ISanEncoding SanFields { get; set; }
```

**Retorno**

[`ISanEncoding`](./ISanEncoding.md)

---

### `SerialNumber` {#serialnumber}

The Certificate serial number. If null, uses a random serial number

```csharp
public BigInteger? SerialNumber { get; set; }
```

**Retorno**

[`BigInteger?`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `SignatureAlgorithm` {#signaturealgorithm}

Signature algorithm which will be used by the Issuer

```csharp
public SignatureAlgorithm SignatureAlgorithm { get; set; }
```

**Retorno**

[`SignatureAlgorithm`](../Lacuna.Pki/SignatureAlgorithm.md)

---

### `SubjectName` {#subjectname}

The Certificate subject name. It is advised to use NameGenerator class for name object generation.

```csharp
public Name SubjectName { get; set; }
```

**Retorno**

[`Name`](../Lacuna.Pki/Name.md)

---

### `ValidityEnd` {#validityend}

```csharp
public DateTimeOffset? ValidityEnd { get; set; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `ValidityStart` {#validitystart}

```csharp
public DateTimeOffset? ValidityStart { get; set; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Métodos

### `AddCertificatePolicy(string, Uri, IEnumerable<string>)` {#addcertificatepolicy-system-string-system-uri-system-collections-generic-ienumerable-system-string}

Adds a Certificate Policy field

```csharp
public void AddCertificatePolicy(string policyOid, Uri cpsUri, IEnumerable<string> userNotices)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyOid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The policy OID |
| `cpsUri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) | URI to reach the Certification Practice Statement document |
| `userNotices` | [`IEnumerable<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | User Notices explicit text qualifier info |

---

### `AddCertificatePolicy(string, Uri)` {#addcertificatepolicy-system-string-system-uri}

Adds a Certificate Policy field

```csharp
public void AddCertificatePolicy(string policyOid, Uri cpsUri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyOid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The policy OID |
| `cpsUri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) | URI to reach the Certification Practice Statement document |

---

### `AddCertificatePolicy(string)` {#addcertificatepolicy-system-string}

Adds a Certificate Policy field

```csharp
public void AddCertificatePolicy(string policyOid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyOid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The policy OID |

---

### `AddCrlDistributionPoint(Uri)` {#addcrldistributionpoint-system-uri}

Adds an URI for the issuer CRL download

```csharp
public void AddCrlDistributionPoint(Uri uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) | The URI to reach the latest CRL |

---

### `AddCustomExtension<T>(string, bool, T)` {#addcustomextension-1-system-string-system-boolean-0}

Adds a custom X509 Extension with a value to be encoded as DER and wrapped in the extension's OCTETSTRING

```csharp
public void AddCustomExtension<T>(string oid, bool isCritical, T value)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |
| `value` | `T` | Value to be DER encoded and wrapped |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

---

### `AddIssuerCertificateUri(Uri)` {#addissuercertificateuri-system-uri}

Adds an Authority Information Access URI, where the issuer(s) certificates(s) can be downloaded

```csharp
public void AddIssuerCertificateUri(Uri issuersUri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuersUri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |

---

### `AddIssuerOcspUri(Uri)` {#addissuerocspuri-system-uri}

Adds an URI which the issuer responds OCSP requests from

```csharp
public void AddIssuerOcspUri(Uri ocspUri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `ocspUri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |

---

### `AddQualifiedCertificateStatement(QualifiedCertificateStatement)` {#addqualifiedcertificatestatement-lacuna-pki-qualifiedcertificatestatement}

```csharp
public void AddQualifiedCertificateStatement(QualifiedCertificateStatement statement)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `statement` | [`QualifiedCertificateStatement`](../Lacuna.Pki/QualifiedCertificateStatement.md) |  |

---

### `AddRawCustomExtension(string, bool, byte[])` {#addrawcustomextension-system-string-system-boolean-system-byte}

Adds a custom X509 Extension with a DER encoded value to be wrapped in the extension's OCTETSTRING

```csharp
public void AddRawCustomExtension(string oid, bool isCritical, byte[] encodedValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `isCritical` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |
| `encodedValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | DER encoded value to be wrapped |

---

### `SetStartAndEndValidityFromNow(TimeSpan)` {#setstartandendvalidityfromnow-system-timespan}

Sets the the certificate validity start and end by the span value from now

```csharp
public void SetStartAndEndValidityFromNow(TimeSpan span)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `span` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) | Validity time from now |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
