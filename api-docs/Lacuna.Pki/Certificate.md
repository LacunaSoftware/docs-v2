---
sidebar_label: "Certificate"
---

# Certificate

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class Certificate
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Certificate`

## Construtores

### `Certificate()` {#ctor}

```csharp
protected Certificate()
```

---

## Campos

### `issuer` {#issuer}

```csharp
protected PKCertificate issuer
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

## Propriedades

### `AuthorityInformationAccess` {#authorityinformationaccess}

```csharp
protected AuthorityInformationAccess AuthorityInformationAccess { get; }
```

**Retorno**

[`AuthorityInformationAccess`](./AuthorityInformationAccess.md)

---

### `CAIssuersUri` {#caissuersuri}

```csharp
public Uri CAIssuersUri { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `EncodedValue` {#encodedvalue}

```csharp
public byte[] EncodedValue { get; protected set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Extensions` {#extensions}

```csharp
public X509Extensions Extensions { get; protected set; }
```

**Retorno**

[`X509Extensions`](./X509Extensions.md)

---

### `IsSelfSigned` {#isselfsigned}

Denotes whether this is a self-signed certificate (root certificate) or not.

NOTICE: never test the condition Issuer==null to assertain if a certificate is self-signed,
since that condition may throw an exception in case the certificate is not a self-signed certificate but its
issuer could not be located. For such purposes, use this property instead.

```csharp
public abstract bool IsSelfSigned { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Issuer` {#issuer}

The certificate's issuer public key certificate, or null if the certificate is self-signed. If
the certificate is not self signed but the issuer cannot be found, this property throws a
CertificateIssuerNotFoundException. In order to check if the issuer was found, use the property
IssuerFound before calling this property.

NOTICE: never test the condition Issuer==null to assertain if a PKCertificate is self-signed. For
such purposes, use the property IsSelfSigned instead.

```csharp
public PKCertificate Issuer { get; }
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `IssuerDisplayName` {#issuerdisplayname}

```csharp
public abstract string IssuerDisplayName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `IssuerDN` {#issuerdn}

```csharp
protected abstract Name IssuerDN { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `IssuerFound` {#issuerfound}

Denotes whether the certificate's issuer was found. Returns false for self-signed certificates.

NOTICE: this property is not exactly a negation of the IssuerNotFound property, since both properties
return false for self-signed certificates.

```csharp
public bool IssuerFound { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IssuerKeyIdentifier` {#issuerkeyidentifier}

```csharp
public byte[] IssuerKeyIdentifier { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `IssuerNotFound` {#issuernotfound}

Denothes whether the certificate's issuer was not found. Returns false for self-signed certificates.

NOTICE: this property is not exactly a negation of the IssuerFound property, since both properties
return false for self-signed certificates.

```csharp
public bool IssuerNotFound { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `OcspUri` {#ocspuri}

```csharp
public Uri OcspUri { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `SerialNumber` {#serialnumber}

```csharp
public BigInteger SerialNumber { get; protected set; }
```

**Retorno**

[`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `SignatureAlgorithm` {#signaturealgorithm}

```csharp
public SignatureAlgorithm SignatureAlgorithm { get; protected set; }
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SignatureValue` {#signaturevalue}

```csharp
public byte[] SignatureValue { get; protected set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SubjectDisplayName` {#subjectdisplayname}

```csharp
public abstract string SubjectDisplayName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TbsCertificateEncoded` {#tbscertificateencoded}

```csharp
protected byte[] TbsCertificateEncoded { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `ThumbprintSHA1` {#thumbprintsha1}

```csharp
public byte[] ThumbprintSHA1 { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `ThumbprintSHA256` {#thumbprintsha256}

```csharp
public byte[] ThumbprintSHA256 { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `TrustAnchor` {#trustanchor}

Returns the trust anchor for this certificate, that is, the root certificate at the top of the
certification chain. Throws a CertificateIssuerNotFoundException if the certification chain cannot
be determined all the way to a root certificate.

```csharp
public PKCertificate TrustAnchor { get; }
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `ValidityEnd` {#validityend}

```csharp
public DateTimeOffset ValidityEnd { get; protected set; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `ValidityStart` {#validitystart}

```csharp
public DateTimeOffset ValidityStart { get; protected set; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Métodos

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetCertificateChain()` {#getcertificatechain}

Returns the certificate chain from this certificate up to the root certificate

```csharp
public List<Certificate> GetCertificateChain()
```

**Retorno**

[`List<Certificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) — The complete certificate chain, starting with this certificate and ending on the root certificate.

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `GetTbsCertificateEncoded()` {#gettbscertificateencoded}

```csharp
protected abstract byte[] GetTbsCertificateEncoded()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `TryFillIssuer(ICertificateStore)` {#tryfillissuer-lacuna-pki-stores-icertificatestore}

```csharp
protected void TryFillIssuer(ICertificateStore certStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certStore` | [`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) |  |

---

### `Validate(CertificateValidationOptions)` {#validate-lacuna-pki-certificatevalidationoptions}

```csharp
public ValidationResults Validate(CertificateValidationOptions validationOptions)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `validationOptions` | [`CertificateValidationOptions`](./CertificateValidationOptions.md) |  |

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---

### `Validate(ITrustArbitrator)` {#validate-lacuna-pki-itrustarbitrator}

```csharp
public ValidationResults Validate(ITrustArbitrator trustArbitrator)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](./ITrustArbitrator.md) |  |

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
