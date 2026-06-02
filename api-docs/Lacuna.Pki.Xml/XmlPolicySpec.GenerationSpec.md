---
sidebar_label: "XmlPolicySpec.GenerationSpec"
---

# XmlPolicySpec.GenerationSpec

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class XmlPolicySpec.GenerationSpec
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlPolicySpec.GenerationSpec`

## Construtores

### `GenerationSpec()` {#ctor}

```csharp
public GenerationSpec()
```

---

## Propriedades

### `ArchiveTimestamp` {#archivetimestamp}

```csharp
public GenerationRequirementLevels ArchiveTimestamp { get; set; }
```

**Retorno**

[`GenerationRequirementLevels`](../Lacuna.Pki/GenerationRequirementLevels.md)

---

### `IncludeCertificateValues` {#includecertificatevalues}

Whether or not to include a CertificateValues property.

```csharp
public bool IncludeCertificateValues { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeCompleteCertificateReferences` {#includecompletecertificatereferences}

Whether or not to include the CompleteCertificateRefs property.

```csharp
public bool IncludeCompleteCertificateReferences { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeCompleteRevocationReferences` {#includecompleterevocationreferences}

Whether or not to include the CompleteRevocationRefs property.

```csharp
public bool IncludeCompleteRevocationReferences { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeKeyValue` {#includekeyvalue}

```csharp
public bool IncludeKeyValue { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeRevocationValues` {#includerevocationvalues}

Whether or not to include a RevocationValues property.

```csharp
public bool IncludeRevocationValues { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeSignaturePolicyIdentifierProperty` {#includesignaturepolicyidentifierproperty}

```csharp
public bool IncludeSignaturePolicyIdentifierProperty { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeSigningCertificateProperty` {#includesigningcertificateproperty}

```csharp
public InclusionLevel IncludeSigningCertificateProperty { get; set; }
```

**Retorno**

[`InclusionLevel`](../Lacuna.Pki/InclusionLevel.md)

---

### `IncludeSigningTimeProperty` {#includesigningtimeproperty}

Whether or not to include the SigningTime XAdES signed property containing the time taken from the local machine.

```csharp
public bool IncludeSigningTimeProperty { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeX509Data` {#includex509data}

```csharp
[Obsolete("The name of this property is misleading. It has been renamed to X509DataCertificates. See also X509DataFields.")]
public InclusionLevel IncludeX509Data { get; set; }
```

**Retorno**

[`InclusionLevel`](../Lacuna.Pki/InclusionLevel.md)

---

### `OmitSignatureElementIds` {#omitsignatureelementids}

```csharp
public bool OmitSignatureElementIds { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `SigAndRefsTimestamp` {#sigandrefstimestamp}

```csharp
public GenerationRequirementLevels SigAndRefsTimestamp { get; set; }
```

**Retorno**

[`GenerationRequirementLevels`](../Lacuna.Pki/GenerationRequirementLevels.md)

---

### `SignatureTimestamp` {#signaturetimestamp}

```csharp
public GenerationRequirementLevels SignatureTimestamp { get; set; }
```

**Retorno**

[`GenerationRequirementLevels`](../Lacuna.Pki/GenerationRequirementLevels.md)

---

### `X509DataCertificates` {#x509datacertificates}

```csharp
public InclusionLevel X509DataCertificates { get; set; }
```

**Retorno**

[`InclusionLevel`](../Lacuna.Pki/InclusionLevel.md)

---

### `X509DataFields` {#x509datafields}

```csharp
public X509DataFields X509DataFields { get; set; }
```

**Retorno**

[`X509DataFields`](../Lacuna.Pki/X509DataFields.md)

---

### `XmlTransformations` {#xmltransformations}

```csharp
public List<XmlTransformation> XmlTransformations { get; set; }
```

**Retorno**

[`List<XmlTransformation>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
