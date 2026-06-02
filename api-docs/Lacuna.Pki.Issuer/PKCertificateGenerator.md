---
sidebar_label: "PKCertificateGenerator"
---

# PKCertificateGenerator

**Namespace:** `Lacuna.Pki.Issuer`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PKCertificateGenerator : BasePKCertificateGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`BasePKCertificateGenerator`](./BasePKCertificateGenerator.md) → `PKCertificateGenerator`

## Construtores

### `PKCertificateGenerator()` {#ctor}

```csharp
public PKCertificateGenerator()
```

---

## Propriedades

### `Issuer` {#issuer}

Issuer certificate with key

```csharp
public PKCertificateWithKey Issuer { get; set; }
```

**Retorno**

[`PKCertificateWithKey`](../Lacuna.Pki/PKCertificateWithKey.md)

---

## Métodos

### `GenerateCertificate()` {#generatecertificate}

Generates the X509 certificate

```csharp
public PKCertificate GenerateCertificate()
```

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md) — Issued PKCertificate

---

## Membros herdados

[`AddCertificatePolicy(string, Uri)`](./BasePKCertificateGenerator.md#addcertificatepolicy-system-string-system-uri), [`AddCertificatePolicy(string)`](./BasePKCertificateGenerator.md#addcertificatepolicy-system-string), [`AddCertificatePolicy(string, Uri, IEnumerable<string>)`](./BasePKCertificateGenerator.md#addcertificatepolicy-system-string-system-uri-system-collections-generic-ienumerable-system-string), [`AddQualifiedCertificateStatement(QualifiedCertificateStatement)`](./BasePKCertificateGenerator.md#addqualifiedcertificatestatement-lacuna-pki-qualifiedcertificatestatement), [`SetStartAndEndValidityFromNow(TimeSpan)`](./BasePKCertificateGenerator.md#setstartandendvalidityfromnow-system-timespan), [`AddIssuerCertificateUri(Uri)`](./BasePKCertificateGenerator.md#addissuercertificateuri-system-uri), [`AddIssuerOcspUri(Uri)`](./BasePKCertificateGenerator.md#addissuerocspuri-system-uri), [`AddCrlDistributionPoint(Uri)`](./BasePKCertificateGenerator.md#addcrldistributionpoint-system-uri), `AddCustomExtension<T>(string, bool, T)`, [`AddRawCustomExtension(string, bool, byte[])`](./BasePKCertificateGenerator.md#addrawcustomextension-system-string-system-boolean-system-byte), [`SubjectName`](./BasePKCertificateGenerator.md#subjectname), [`ValidityStart`](./BasePKCertificateGenerator.md#validitystart), [`ValidityEnd`](./BasePKCertificateGenerator.md#validityend), [`IncludeAuthorityKeyId`](./BasePKCertificateGenerator.md#includeauthoritykeyid), [`IncludeSubjectKeyId`](./BasePKCertificateGenerator.md#includesubjectkeyid), [`EndEntityBasicConstraintsCritical`](./BasePKCertificateGenerator.md#endentitybasicconstraintscritical), [`ExtendedKeyUsageCritical`](./BasePKCertificateGenerator.md#extendedkeyusagecritical), [`QualifiedCertificateStatementsCritical`](./BasePKCertificateGenerator.md#qualifiedcertificatestatementscritical), [`IsFinalCA`](./BasePKCertificateGenerator.md#isfinalca), [`IsSelfSigned`](./BasePKCertificateGenerator.md#isselfsigned), [`SerialNumber`](./BasePKCertificateGenerator.md#serialnumber), [`SignatureAlgorithm`](./BasePKCertificateGenerator.md#signaturealgorithm), [`KeyUsage`](./BasePKCertificateGenerator.md#keyusage), [`ExtendedKeyUsage`](./BasePKCertificateGenerator.md#extendedkeyusage), [`SanFields`](./BasePKCertificateGenerator.md#sanfields), [`CertificateLevel`](./BasePKCertificateGenerator.md#certificatelevel), [`Csr`](./BasePKCertificateGenerator.md#csr), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
