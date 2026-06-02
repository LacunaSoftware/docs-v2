---
sidebar_label: "RemotePKCertificateGenerator"
---

# RemotePKCertificateGenerator

**Namespace:** `Lacuna.Pki.Issuer`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class RemotePKCertificateGenerator : BasePKCertificateGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`BasePKCertificateGenerator`](./BasePKCertificateGenerator.md) → `RemotePKCertificateGenerator`

## Construtores

### `RemotePKCertificateGenerator()` {#ctor}

```csharp
public RemotePKCertificateGenerator()
```

---

## Propriedades

### `Issuer` {#issuer}

Issuer certificate

```csharp
public PKCertificate Issuer { get; set; }
```

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md)

---

## Métodos

### `GenerateCertificate(SignatureAlgorithm, byte[], byte[], PKCertificate)` {#generatecertificate-lacuna-pki-signaturealgorithm-system-byte-system-byte-lacuna-pki-pkcertificate}

Generates a X509 certificate after Issuer signature

```csharp
public static PKCertificate GenerateCertificate(SignatureAlgorithm signatureAlgorithm, byte[] toSignData, byte[] signature, PKCertificate issuer = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](../Lacuna.Pki/SignatureAlgorithm.md) | Issuer signature algorithm |
| `toSignData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Data submitted to issuer signature |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Issuer's signature |
| `issuer` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) | Issuer's certificate. If not set, the signature verification will be bypassed |

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md) — Issued PKCertificate

---

### `GenerateToSignData()` {#generatetosigndata}

Generates the data that shall be signed by the Issuer

```csharp
public byte[] GenerateToSignData()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`AddCertificatePolicy(string, Uri)`](./BasePKCertificateGenerator.md#addcertificatepolicy-system-string-system-uri), [`AddCertificatePolicy(string)`](./BasePKCertificateGenerator.md#addcertificatepolicy-system-string), [`AddCertificatePolicy(string, Uri, IEnumerable<string>)`](./BasePKCertificateGenerator.md#addcertificatepolicy-system-string-system-uri-system-collections-generic-ienumerable-system-string), [`AddQualifiedCertificateStatement(QualifiedCertificateStatement)`](./BasePKCertificateGenerator.md#addqualifiedcertificatestatement-lacuna-pki-qualifiedcertificatestatement), [`SetStartAndEndValidityFromNow(TimeSpan)`](./BasePKCertificateGenerator.md#setstartandendvalidityfromnow-system-timespan), [`AddIssuerCertificateUri(Uri)`](./BasePKCertificateGenerator.md#addissuercertificateuri-system-uri), [`AddIssuerOcspUri(Uri)`](./BasePKCertificateGenerator.md#addissuerocspuri-system-uri), [`AddCrlDistributionPoint(Uri)`](./BasePKCertificateGenerator.md#addcrldistributionpoint-system-uri), `AddCustomExtension<T>(string, bool, T)`, [`AddRawCustomExtension(string, bool, byte[])`](./BasePKCertificateGenerator.md#addrawcustomextension-system-string-system-boolean-system-byte), [`SubjectName`](./BasePKCertificateGenerator.md#subjectname), [`ValidityStart`](./BasePKCertificateGenerator.md#validitystart), [`ValidityEnd`](./BasePKCertificateGenerator.md#validityend), [`IncludeAuthorityKeyId`](./BasePKCertificateGenerator.md#includeauthoritykeyid), [`IncludeSubjectKeyId`](./BasePKCertificateGenerator.md#includesubjectkeyid), [`EndEntityBasicConstraintsCritical`](./BasePKCertificateGenerator.md#endentitybasicconstraintscritical), [`ExtendedKeyUsageCritical`](./BasePKCertificateGenerator.md#extendedkeyusagecritical), [`QualifiedCertificateStatementsCritical`](./BasePKCertificateGenerator.md#qualifiedcertificatestatementscritical), [`IsFinalCA`](./BasePKCertificateGenerator.md#isfinalca), [`IsSelfSigned`](./BasePKCertificateGenerator.md#isselfsigned), [`SerialNumber`](./BasePKCertificateGenerator.md#serialnumber), [`SignatureAlgorithm`](./BasePKCertificateGenerator.md#signaturealgorithm), [`KeyUsage`](./BasePKCertificateGenerator.md#keyusage), [`ExtendedKeyUsage`](./BasePKCertificateGenerator.md#extendedkeyusage), [`SanFields`](./BasePKCertificateGenerator.md#sanfields), [`CertificateLevel`](./BasePKCertificateGenerator.md#certificatelevel), [`Csr`](./BasePKCertificateGenerator.md#csr), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
