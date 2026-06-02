---
sidebar_label: "AttributeCertificate"
---

# AttributeCertificate

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class AttributeCertificate : Certificate
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`Certificate`](./Certificate.md) → `AttributeCertificate`

## Construtores

### `AttributeCertificate(byte[], ICertificateStore)` {#ctor-system-byte-lacuna-pki-stores-icertificatestore}

```csharp
protected AttributeCertificate(byte[] certContent, ICertificateStore certStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `certStore` | [`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) |  |

---

## Propriedades

### `Attributes` {#attributes}

```csharp
public X509Attributes Attributes { get; protected set; }
```

**Retorno**

[`X509Attributes`](./X509Attributes.md)

---

### `HolderName` {#holdername}

```csharp
public GeneralNames HolderName { get; protected set; }
```

**Retorno**

[`GeneralNames`](./GeneralNames.md)

---

### `HolderPKCertificate` {#holderpkcertificate}

```csharp
public AttributeCertificateBaseCertificateId HolderPKCertificate { get; protected set; }
```

**Retorno**

[`AttributeCertificateBaseCertificateId`](./AttributeCertificateBaseCertificateId.md)

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

```csharp
public GeneralNames IssuerName { get; protected set; }
```

**Retorno**

[`GeneralNames`](./GeneralNames.md)

---

### `PkiBrazil` {#pkibrazil}

```csharp
public IcpBrasilAttributeCertificateFields PkiBrazil { get; }
```

**Retorno**

[`IcpBrasilAttributeCertificateFields`](./IcpBrasilAttributeCertificateFields.md)

---

### `SubjectDisplayName` {#subjectdisplayname}

```csharp
public override string SubjectDisplayName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `Decode(byte[], ICertificateStore)` {#decode-system-byte-lacuna-pki-stores-icertificatestore}

```csharp
public static AttributeCertificate Decode(byte[] certContent, ICertificateStore certStore = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `certStore` | [`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) |  |

**Retorno**

[`AttributeCertificate`](./AttributeCertificate.md)

---

### `GetTbsCertificateEncoded()` {#gettbscertificateencoded}

```csharp
protected override byte[] GetTbsCertificateEncoded()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`issuer`](./Certificate.md#issuer), [`Validate(ITrustArbitrator)`](./Certificate.md#validate-lacuna-pki-itrustarbitrator), [`Validate(CertificateValidationOptions)`](./Certificate.md#validate-lacuna-pki-certificatevalidationoptions), [`TryFillIssuer(ICertificateStore)`](./Certificate.md#tryfillissuer-lacuna-pki-stores-icertificatestore), [`GetCertificateChain()`](./Certificate.md#getcertificatechain), [`Equals(object)`](./Certificate.md#equals-system-object), [`GetHashCode()`](./Certificate.md#gethashcode), [`EncodedValue`](./Certificate.md#encodedvalue), [`ValidityStart`](./Certificate.md#validitystart), [`ValidityEnd`](./Certificate.md#validityend), [`SignatureValue`](./Certificate.md#signaturevalue), [`SerialNumber`](./Certificate.md#serialnumber), [`Extensions`](./Certificate.md#extensions), [`SignatureAlgorithm`](./Certificate.md#signaturealgorithm), [`Issuer`](./Certificate.md#issuer), [`IssuerFound`](./Certificate.md#issuerfound), [`IssuerNotFound`](./Certificate.md#issuernotfound), [`TrustAnchor`](./Certificate.md#trustanchor), [`TbsCertificateEncoded`](./Certificate.md#tbscertificateencoded), [`ThumbprintSHA1`](./Certificate.md#thumbprintsha1), [`ThumbprintSHA256`](./Certificate.md#thumbprintsha256), [`AuthorityInformationAccess`](./Certificate.md#authorityinformationaccess), [`CAIssuersUri`](./Certificate.md#caissuersuri), [`OcspUri`](./Certificate.md#ocspuri), [`IssuerKeyIdentifier`](./Certificate.md#issuerkeyidentifier), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
