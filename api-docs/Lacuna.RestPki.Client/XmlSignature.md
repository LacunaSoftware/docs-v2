---
sidebar_label: "XmlSignature"
---

# XmlSignature

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class XmlSignature
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlSignature`

## Propriedades

### `BStamp` {#bstamp}

```csharp
public SignerBStamp BStamp { get; }
```

**Retorno**

[`SignerBStamp`](./SignerBStamp.md)

---

### `Certificate` {#certificate}

```csharp
public PKCertificate Certificate { get; }
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `CertifiedDateReference` {#certifieddatereference}

```csharp
public DateTimeOffset? CertifiedDateReference { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `Signature` {#signature}

```csharp
public SignatureAlgorithmAndValue Signature { get; }
```

**Retorno**

[`SignatureAlgorithmAndValue`](./SignatureAlgorithmAndValue.md)

---

### `SignaturePolicy` {#signaturepolicy}

```csharp
public SignaturePolicyIdentifier SignaturePolicy { get; }
```

**Retorno**

[`SignaturePolicyIdentifier`](./SignaturePolicyIdentifier.md)

---

### `SignedElement` {#signedelement}

```csharp
public XmlElementInfo SignedElement { get; }
```

**Retorno**

[`XmlElementInfo`](./XmlElementInfo.md)

---

### `SigningTime` {#signingtime}

```csharp
public DateTimeOffset? SigningTime { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `Timestamps` {#timestamps}

```csharp
public List<CadesTimestamp> Timestamps { get; }
```

**Retorno**

[`List<CadesTimestamp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Type` {#type}

```csharp
public XmlSignedEntityTypes Type { get; }
```

**Retorno**

`XmlSignedEntityTypes`

---

### `ValidationResults` {#validationresults}

```csharp
public ValidationResults ValidationResults { get; }
```

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
