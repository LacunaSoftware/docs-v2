---
sidebar_label: "CadesSignature"
---

# CadesSignature

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class CadesSignature : BaseSignature
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`BaseSignature`](./BaseSignature.md) → `CadesSignature`

## Propriedades

### `EncapsulatedContentType` {#encapsulatedcontenttype}

```csharp
public CmsContentTypes EncapsulatedContentType { get; }
```

**Retorno**

`CmsContentTypes`

---

### `HasEncapsulatedContent` {#hasencapsulatedcontent}

```csharp
public bool HasEncapsulatedContent { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Signers` {#signers}

```csharp
public List<CadesSignerInfo> Signers { get; }
```

**Retorno**

[`List<CadesSignerInfo>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Membros herdados

[`BStamp`](./BaseSignature.md#bstamp), [`AuditPackage`](./BaseSignature.md#auditpackage), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
