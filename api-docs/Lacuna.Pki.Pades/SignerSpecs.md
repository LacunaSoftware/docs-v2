---
sidebar_label: "SignerSpecs"
---

# SignerSpecs

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class SignerSpecs
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignerSpecs`

## Construtores

### `SignerSpecs()` {#ctor}

```csharp
public SignerSpecs()
```

---

## Propriedades

### `AttributeGeneration` {#attributegeneration}

```csharp
public SignerSpecs.AttributeGenerationSpec AttributeGeneration { get; set; }
```

**Retorno**

[`SignerSpecs.AttributeGenerationSpec`](./SignerSpecs.AttributeGenerationSpec.md)

---

### `AttributeValidation` {#attributevalidation}

```csharp
public SignerSpecs.AttributeValidationSpec AttributeValidation { get; set; }
```

**Retorno**

[`SignerSpecs.AttributeValidationSpec`](./SignerSpecs.AttributeValidationSpec.md)

---

### `CmsSignatureTimestampPolicy` {#cmssignaturetimestamppolicy}

```csharp
public CadesPolicySpec CmsSignatureTimestampPolicy { get; set; }
```

**Retorno**

[`CadesPolicySpec`](../Lacuna.Pki.Cades/CadesPolicySpec.md)

---

### `PolicyDigest` {#policydigest}

```csharp
public DigestAlgorithmAndValue PolicyDigest { get; set; }
```

**Retorno**

[`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md)

---

### `PolicyOid` {#policyoid}

```csharp
public string PolicyOid { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `PolicyUri` {#policyuri}

```csharp
public Uri PolicyUri { get; set; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
