---
sidebar_label: "PKCertificate"
---

# PKCertificate

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PKCertificate : Certificate
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`Certificate`](./Certificate.md) → `PKCertificate`

## Construtores

### `PKCertificate(byte[], bool, ICertificateStore)` {#ctor-system-byte-system-boolean-lacuna-pki-stores-icertificatestore}

```csharp
protected PKCertificate(byte[] certContent, bool fillChain, ICertificateStore certStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `fillChain` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |
| `certStore` | [`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) |  |

---

## Propriedades

### `DnsNames` {#dnsnames}

SSL Certificate DNS Names

```csharp
public List<string> DnsNames { get; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `EmailAddress` {#emailaddress}

```csharp
public string EmailAddress { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `ExtendedKeyUsage` {#extendedkeyusage}

The subject's extended key usage, or null if the extension is not present.

```csharp
public ExtendedKeyUsage? ExtendedKeyUsage { get; }
```

**Retorno**

`ExtendedKeyUsage?`

---

### `IsCA` {#isca}

Denotes whether this certificate is a Certification Authority certificate, that is,
if it may be used to verify certificate signatures, as defined in RFC 5280 item 4.2.1.9.

```csharp
public bool IsCA { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsSelfSigned` {#isselfsigned}

Denotes whether this is a self-signed certificate (root certificate) or not.

NOTICE: never test the condition Issuer==null to assertain if a certificate is self-signed,
since that condition may throw an exception in case the certificate is not a self-signed certificate but its
issuer could not be located. For such purposes, use this property instead.

```csharp
public override bool IsSelfSigned { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IssuerDisplayName` {#issuerdisplayname}

```csharp
public override string IssuerDisplayName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `IssuerDN` {#issuerdn}

```csharp
protected override Name IssuerDN { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `IssuerName` {#issuername}

The certificate's issuer name

```csharp
public Name IssuerName { get; protected set; }
```

**Retorno**

[`Name`](./Name.md)

---

### `KeyUsage` {#keyusage}

The subject's key usage, or null if the KeyUsage extension is not present.

```csharp
public KeyUsage? KeyUsage { get; }
```

**Retorno**

`KeyUsage?`

---

### `PkiArgentina` {#pkiargentina}

Argentina PKI fields (INFRAESTRUCTURA DE FIRMA DIGITAL – REPÚBLICA ARGENTINA)

```csharp
public ArgentinaCertificateFields PkiArgentina { get; }
```

**Retorno**

[`ArgentinaCertificateFields`](./ArgentinaCertificateFields.md)

---

### `PkiBrazil` {#pkibrazil}

Brazil PKI fields

```csharp
public IcpBrasilCertificateFields PkiBrazil { get; }
```

**Retorno**

[`IcpBrasilCertificateFields`](./IcpBrasilCertificateFields.md)

---

### `PkiEcuador` {#pkiecuador}

Ecuador PKI common certificate fields among BCE (Banco Central Del Ecuador) and Security Data entities

```csharp
public EcuadorCertificateFields PkiEcuador { get; }
```

**Retorno**

[`EcuadorCertificateFields`](./EcuadorCertificateFields.md)

---

### `PkiItaly` {#pkiitaly}

Italy PKI fields

```csharp
public ItalyCertificateFields PkiItaly { get; }
```

**Retorno**

[`ItalyCertificateFields`](./ItalyCertificateFields.md)

---

### `PkiParaguay` {#pkiparaguay}

Paraguay PKI fields

```csharp
public ParaguayCertificateFields PkiParaguay { get; }
```

**Retorno**

[`ParaguayCertificateFields`](./ParaguayCertificateFields.md)

---

### `PkiPeru` {#pkiperu}

Peru PKI fields

```csharp
public PeruCertificateFields PkiPeru { get; }
```

**Retorno**

[`PeruCertificateFields`](./PeruCertificateFields.md)

---

### `SubjectDisplayName` {#subjectdisplayname}

```csharp
public override string SubjectDisplayName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SubjectKeyIdentifier` {#subjectkeyidentifier}

Returns the bytes of the SubjectKeyIdentifier extension, or null if the extension is not present.

```csharp
public byte[] SubjectKeyIdentifier { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SubjectName` {#subjectname}

The subject's name

```csharp
public Name SubjectName { get; protected set; }
```

**Retorno**

[`Name`](./Name.md)

---

### `SubjectPKAlgorithm` {#subjectpkalgorithm}

The public-key algorithm of the subject's public key

```csharp
public PKAlgorithm SubjectPKAlgorithm { get; protected set; }
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

### `SubjectPublicKey` {#subjectpublickey}

The subject's public key

```csharp
public PublicKey SubjectPublicKey { get; protected set; }
```

**Retorno**

[`PublicKey`](./PublicKey.md)

---

## Métodos

### `Decode(byte[], ICertificateStore)` {#decode-system-byte-lacuna-pki-stores-icertificatestore}

Decodes and creates a certificate object from certificate bytes BER, DER, Base64 or PEM encoded. With certificate chain loading.

```csharp
public static PKCertificate Decode(byte[] certContent, ICertificateStore certStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Certificate bytes BER, DER, Base64 or PEM encoded |
| `certStore` | [`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) | Certificate store to assist the chain loading |

**Retorno**

[`PKCertificate`](./PKCertificate.md) — PKCertificate object

---

### `Decode(byte[])` {#decode-system-byte}

Decodes and creates a certificate object from certificate bytes BER, DER, Base64 or PEM encoded. Without loading the certificate chain.

```csharp
public static PKCertificate Decode(byte[] certContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Certificate bytes BER, DER, Base64 or PEM encoded |

**Retorno**

[`PKCertificate`](./PKCertificate.md) — PKCertificate object

---

### `Decode(string, ICertificateStore)` {#decode-system-string-lacuna-pki-stores-icertificatestore}

Decodes and creates a certificate object from certificate Base64 or PEM encoded. With certificate chain loading.

```csharp
public static PKCertificate Decode(string certContent, ICertificateStore certStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Certificate Base64 or PEM encoded |
| `certStore` | [`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) | Certificate store to assist the chain loading |

**Retorno**

[`PKCertificate`](./PKCertificate.md) — PKCertificate object

---

### `Decode(string)` {#decode-system-string}

Decodes and creates a certificate object from certificate Base64 or PEM encoded. Without loading the certificate chain.

```csharp
public static PKCertificate Decode(string certContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Certificate Base64 or PEM encoded |

**Retorno**

[`PKCertificate`](./PKCertificate.md) — PKCertificate object

---

### `DecodeWithoutChainLoading(byte[])` {#decodewithoutchainloading-system-byte}

Decodes and creates a certificate object without chain loading from certificate bytes BER, DER, Base64 or PEM encoded. Without loading the certificate chain.

```csharp
[Obsolete("Use PKCertificate.Decode(certContent) instead")]
public static PKCertificate DecodeWithoutChainLoading(byte[] certContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Certificate bytes BER, DER, Base64 or PEM encoded |

**Retorno**

[`PKCertificate`](./PKCertificate.md) — PKCertificate object

---

### `DecodeWithoutChainLoading(string)` {#decodewithoutchainloading-system-string}

Decodes and creates a certificate object without chain loading from certificate Base64 or PEM encoded. Without loading the certificate chain.

```csharp
[Obsolete("Use PKCertificate.Decode(certContent) instead")]
public static PKCertificate DecodeWithoutChainLoading(string certContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Certificate Base64 or PEM encoded |

**Retorno**

[`PKCertificate`](./PKCertificate.md) — PKCertificate object

---

### `GetCertificateChain()` {#getcertificatechain}

```csharp
public List<PKCertificate> GetCertificateChain()
```

**Retorno**

[`List<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetOrGenerateSubjectKeyIdentifier()` {#getorgeneratesubjectkeyidentifier}

If the certificate contains a Subject Key Identifier extension, returns the value of the key identifier. Otherwise,
generates a key identifier using the SHA-1 digest algorithm, as specified in RFC 5280. NOTE: in some cases, one must
only reference a certificate by its SubjectKeyIdentifier if the EXTENSION is present. If such cases, use the property
SubjectKeyIdentifier instead, that returns a value only if the extension is present.

```csharp
public byte[] GetOrGenerateSubjectKeyIdentifier()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

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

### `GetTbsCertificateEncoded()` {#gettbscertificateencoded}

```csharp
protected override byte[] GetTbsCertificateEncoded()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `IsFinalCA()` {#isfinalca}

Returns whether or not the certificate is a final CA. That is, if the certificate is a CA that can issue end entities certificates only.
This method may require certificate chain loading, which can throw exceptions.

```csharp
public bool IsFinalCA()
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) — Whether or not the certificate is a final CA

**Exceções**

| Tipo | Condição |
|---|---|
| [`InvalidOperationException`](https://learn.microsoft.com/dotnet/api/system.invalidoperationexception) | Thrown when the current certificate is not a CA |
| [`CertificateIssuerNotFoundException`](./CertificateIssuerNotFoundException.md) | Thrown when certificate chain loading is required but fails |
| [`CertificateChainException`](./CertificateChainException.md) | Thrown when the certificate chain does not have a valid path length |

---

### `ToString()` {#tostring}

```csharp
public override string ToString()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`issuer`](./Certificate.md#issuer), [`Validate(ITrustArbitrator)`](./Certificate.md#validate-lacuna-pki-itrustarbitrator), [`Validate(CertificateValidationOptions)`](./Certificate.md#validate-lacuna-pki-certificatevalidationoptions), [`TryFillIssuer(ICertificateStore)`](./Certificate.md#tryfillissuer-lacuna-pki-stores-icertificatestore), [`Equals(object)`](./Certificate.md#equals-system-object), [`GetHashCode()`](./Certificate.md#gethashcode), [`EncodedValue`](./Certificate.md#encodedvalue), [`ValidityStart`](./Certificate.md#validitystart), [`ValidityEnd`](./Certificate.md#validityend), [`SignatureValue`](./Certificate.md#signaturevalue), [`SerialNumber`](./Certificate.md#serialnumber), [`Extensions`](./Certificate.md#extensions), [`SignatureAlgorithm`](./Certificate.md#signaturealgorithm), [`Issuer`](./Certificate.md#issuer), [`IssuerFound`](./Certificate.md#issuerfound), [`IssuerNotFound`](./Certificate.md#issuernotfound), [`TrustAnchor`](./Certificate.md#trustanchor), [`TbsCertificateEncoded`](./Certificate.md#tbscertificateencoded), [`ThumbprintSHA1`](./Certificate.md#thumbprintsha1), [`ThumbprintSHA256`](./Certificate.md#thumbprintsha256), [`AuthorityInformationAccess`](./Certificate.md#authorityinformationaccess), [`CAIssuersUri`](./Certificate.md#caissuersuri), [`OcspUri`](./Certificate.md#ocspuri), [`IssuerKeyIdentifier`](./Certificate.md#issuerkeyidentifier), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
