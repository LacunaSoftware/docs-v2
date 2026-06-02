---
sidebar_label: "CadesPolicySpec.AttributeGenerationSpec"
---

# CadesPolicySpec.AttributeGenerationSpec

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CadesPolicySpec.AttributeGenerationSpec
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesPolicySpec.AttributeGenerationSpec`

## Construtores

### `AttributeGenerationSpec()` {#ctor}

```csharp
public AttributeGenerationSpec()
```

---

## Propriedades

### `ArchiveTimestamp` {#archivetimestamp}

Denotes whether an archive timestamp MUST be added (failure throws exception), or SHOULD be added
(failure generates a warning) or SHOULD NOT be added.

```csharp
public GenerationRequirementLevels ArchiveTimestamp { get; set; }
```

**Retorno**

[`GenerationRequirementLevels`](../Lacuna.Pki/GenerationRequirementLevels.md)

---

### `CadesCTimeStamp` {#cadesctimestamp}

Denotes whether a cades-c-timestamp attribute MUST be added (failure throws exception), or SHOULD be added
(failure generates a warning) or SHOULD NOT added. NOTE: if CadesCTimeStamp is set to Must or Should,
then the properties IncludeCompleteCertificateReferences and IncludeCompleteRevocationReferences must be
set to true.

```csharp
public GenerationRequirementLevels CadesCTimeStamp { get; set; }
```

**Retorno**

[`GenerationRequirementLevels`](../Lacuna.Pki/GenerationRequirementLevels.md)

---

### `CertCrlsReferencesTimestamp` {#certcrlsreferencestimestamp}

Denotes whether a certificates and CRLs references timestamp MUST be added (failure throws exception), or SHOULD be added
(failure generates a warning) or SHOULD NOT be added.

```csharp
public GenerationRequirementLevels CertCrlsReferencesTimestamp { get; set; }
```

**Retorno**

[`GenerationRequirementLevels`](../Lacuna.Pki/GenerationRequirementLevels.md)

---

### `IncludeCertificatesInSignedData` {#includecertificatesinsigneddata}

The certificates to be included in the SignedData Certificates Set

```csharp
public InclusionLevel IncludeCertificatesInSignedData { get; set; }
```

**Retorno**

[`InclusionLevel`](../Lacuna.Pki/InclusionLevel.md)

---

### `IncludeCertificateValues` {#includecertificatevalues}

Whether or not to include a certificate-values attribute.

```csharp
public bool IncludeCertificateValues { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeCompleteCertificateReferences` {#includecompletecertificatereferences}

Whether or not to include the complete-certificate-references attribute.

```csharp
public bool IncludeCompleteCertificateReferences { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeCompleteRevocationReferences` {#includecompleterevocationreferences}

Whether or not to include the complete-revocation-references attribute.

```csharp
public bool IncludeCompleteRevocationReferences { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeCrlsInSignedData` {#includecrlsinsigneddata}

Whether or not to include the used CRLs in the SignedData Revocation Info Choices

```csharp
public bool IncludeCrlsInSignedData { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeFullPathReferenceInSigningCertificateAttribute` {#includefullpathreferenceinsigningcertificateattribute}

Whether or not to include the certification full path on the SigningCertificate attribute

```csharp
public bool IncludeFullPathReferenceInSigningCertificateAttribute { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeRevocationValues` {#includerevocationvalues}

Whether or not to include a revocation-values attribute.

```csharp
public bool IncludeRevocationValues { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeSignaturePolicyIdentifier` {#includesignaturepolicyidentifier}

Wheter or not to include the signature-policy-identifier signed attribute (CAdES-BES vs CADES-EPES)

```csharp
public bool IncludeSignaturePolicyIdentifier { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeSigningCertificateAttribute` {#includesigningcertificateattribute}

Whether or not to include the signing-certificate attribute (or signing-certificate-v2, depending on the digest
algorithm being used).

```csharp
public bool IncludeSigningCertificateAttribute { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

**Comentários**

Please note that the signing certificate attribute is mandated by CAdES. A signature without a signing certificate
attribute cannot truly be considered a CAdES signature and is subject to known attacks (signer substitution attack). The
default value for this property is true on all policies returned by the SDK. We highly recommend that you do not set
this property to false.

---

### `IncludeSigningTime` {#includesigningtime}

Whether or not to include the signing-time signed attribute containing the time taken from the local machine.

```csharp
public bool IncludeSigningTime { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `SignaturePolicyQualifiers` {#signaturepolicyqualifiers}

In case IncludeSignaturePolicyIdentifier is set to true, denotes which signature policy qualifiers should
be included in the signature-policy-identifier attribute. Currently, only the Uri qualifier is supported.

```csharp
public CadesPolicySpec.SignaturePolicyQualifiers SignaturePolicyQualifiers { get; set; }
```

**Retorno**

[`CadesPolicySpec.SignaturePolicyQualifiers`](./CadesPolicySpec.SignaturePolicyQualifiers.md)

---

### `SignatureTimestamp` {#signaturetimestamp}

Denotes whether a signature-timestamp attribute MUST be added (failure throws exception), or SHOULD be added
(failure generates a warning) or SHOULD NOT be added.

```csharp
public GenerationRequirementLevels SignatureTimestamp { get; set; }
```

**Retorno**

[`GenerationRequirementLevels`](../Lacuna.Pki/GenerationRequirementLevels.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
