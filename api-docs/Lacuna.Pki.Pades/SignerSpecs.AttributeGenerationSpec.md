---
sidebar_label: "SignerSpecs.AttributeGenerationSpec"
---

# SignerSpecs.AttributeGenerationSpec

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class SignerSpecs.AttributeGenerationSpec
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignerSpecs.AttributeGenerationSpec`

## Construtores

### `AttributeGenerationSpec()` {#ctor}

```csharp
public AttributeGenerationSpec()
```

---

## Propriedades

### `CmsSignatureTimestamp` {#cmssignaturetimestamp}

Denotes whether a signature-timestamp attribute MUST be added (failure throws exception), or SHOULD be added
(failure generates a warning) or SHOULD NOT be added.

```csharp
public GenerationRequirementLevels CmsSignatureTimestamp { get; set; }
```

**Retorno**

[`GenerationRequirementLevels`](../Lacuna.Pki/GenerationRequirementLevels.md)

---

### `EnableLtv` {#enableltv}

Whether or not to create the signature with Long Term Validation elements. Default is true

```csharp
public bool EnableLtv { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

**Comentários**

If you intend to create a
document timestamp extending the life-time protection of the PDF, it is not recommended to enable this in
the PadesSigner usage moment but in the PadesTimestamper usage.

---

### `Filter` {#filter}

The preferred signature handler to use when validating this signature. If not set, the default
is AdobePPKLite filter.

```csharp
public PadesFilters Filter { get; set; }
```

**Retorno**

[`PadesFilters`](./PadesFilters.md)

---

### `IncludeCmsSigningCertificateAttribute` {#includecmssigningcertificateattribute}

Whether or not to include the signing-certificate attribute (or signing-certificate-v2, depending on the digest
algorithm being used).

```csharp
public bool IncludeCmsSigningCertificateAttribute { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

**Comentários**

Please note that the signing certificate attribute is mandated by CAdES. A signature without a signing certificate
attribute cannot truly be considered a CAdES signature and is subject to known attacks (signer substitution attack). The
default value for this property is true on all policies returned by the SDK. We highly recommend that you do not set
this property to false.

---

### `IncludeSignaturePolicyIdentifier` {#includesignaturepolicyidentifier}

Wheter or not to include the signature-policy-identifier signed attribute (CAdES-BES vs CADES-EPES)

```csharp
public bool IncludeSignaturePolicyIdentifier { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeSigningDateM` {#includesigningdatem}

Whether or not to include the signing time date M in the PDF signature. This signing time is not a trusted
time and should not be used if your internal Cades signatures already has a trusted signing time value.
Default is true

```csharp
public bool IncludeSigningDateM { get; set; }
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

[`CadesPolicySpec.SignaturePolicyQualifiers`](../Lacuna.Pki.Cades/CadesPolicySpec.SignaturePolicyQualifiers.md)

---

### `SubFilter` {#subfilter}

The preferred signature validation plugin to be used in PDF readers. If note set, default is none.

```csharp
public PadesSubFilters SubFilter { get; set; }
```

**Retorno**

[`PadesSubFilters`](./PadesSubFilters.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
