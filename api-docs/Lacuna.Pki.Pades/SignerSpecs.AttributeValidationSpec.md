---
sidebar_label: "SignerSpecs.AttributeValidationSpec"
---

# SignerSpecs.AttributeValidationSpec

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class SignerSpecs.AttributeValidationSpec
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignerSpecs.AttributeValidationSpec`

## Construtores

### `AttributeValidationSpec()` {#ctor}

```csharp
public AttributeValidationSpec()
```

---

## Propriedades

### `CmsSignatureTimestamp` {#cmssignaturetimestamp}

```csharp
public ValidationRequirementLevels CmsSignatureTimestamp { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `CmsSigningTime` {#cmssigningtime}

```csharp
public ValidationRequirementLevels CmsSigningTime { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `DocumentTimestamp` {#documenttimestamp}

```csharp
public ValidationRequirementLevels DocumentTimestamp { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `Dss` {#dss}

```csharp
public Dictionary<PadesDssEntries, ValidationRequirementLevels> Dss { get; set; }
```

**Retorno**

[`Dictionary<PadesDssEntries, ValidationRequirementLevels>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `SignaturePolicyIdentifier` {#signaturepolicyidentifier}

```csharp
public ValidationRequirementLevels SignaturePolicyIdentifier { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `SigningCertificateAttribute` {#signingcertificateattribute}

```csharp
public ValidationRequirementLevels SigningCertificateAttribute { get; set; }
```

**Retorno**

[`ValidationRequirementLevels`](../Lacuna.Pki/ValidationRequirementLevels.md)

---

### `Vri` {#vri}

```csharp
public Dictionary<PadesVriEntries, ValidationRequirementLevels> Vri { get; set; }
```

**Retorno**

[`Dictionary<PadesVriEntries, ValidationRequirementLevels>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
