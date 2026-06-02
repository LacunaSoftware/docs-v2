---
sidebar_label: "XmlPolicySpec.ValidationSpec"
---

# XmlPolicySpec.ValidationSpec

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class XmlPolicySpec.ValidationSpec
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlPolicySpec.ValidationSpec`

## Construtores

### `ValidationSpec()` {#ctor}

```csharp
public ValidationSpec()
```

---

## Propriedades

### `ArchiveTimestamp` {#archivetimestamp}

```csharp
public ValidationRequirementLevels ArchiveTimestamp { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `CertificateValues` {#certificatevalues}

```csharp
public ValidationRequirementLevels CertificateValues { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `CompleteCertificateReferences` {#completecertificatereferences}

```csharp
public ValidationRequirementLevels CompleteCertificateReferences { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `CompleteRevocationReferences` {#completerevocationreferences}

```csharp
public ValidationRequirementLevels CompleteRevocationReferences { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `OptionalXmlTransformations` {#optionalxmltransformations}

```csharp
public List<XmlTransformation> OptionalXmlTransformations { get; set; }
```

**Retorno**

[`List<XmlTransformation>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `RequiredXmlTransformations` {#requiredxmltransformations}

```csharp
public List<XmlTransformation> RequiredXmlTransformations { get; set; }
```

**Retorno**

[`List<XmlTransformation>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `RevocationValues` {#revocationvalues}

```csharp
public ValidationRequirementLevels RevocationValues { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `SigAndRefsTimestamp` {#sigandrefstimestamp}

```csharp
public ValidationRequirementLevels SigAndRefsTimestamp { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `SignaturePolicyIdentifierProperty` {#signaturepolicyidentifierproperty}

```csharp
public ValidationRequirementLevels SignaturePolicyIdentifierProperty { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `SignatureTimestamp` {#signaturetimestamp}

```csharp
public ValidationRequirementLevels SignatureTimestamp { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `SigningCertificateProperty` {#signingcertificateproperty}

```csharp
public ValidationRequirementLevels SigningCertificateProperty { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `SigningTimeProperty` {#signingtimeproperty}

Denotes wheter to require signatures to contain a SigningTime XAdES signed property

```csharp
public ValidationRequirementLevels SigningTimeProperty { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
