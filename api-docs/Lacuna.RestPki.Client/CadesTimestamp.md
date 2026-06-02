---
sidebar_label: "CadesTimestamp"
---

# CadesTimestamp

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class CadesTimestamp : CadesSignature
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`BaseSignature`](./BaseSignature.md) → [`CadesSignature`](./CadesSignature.md) → `CadesTimestamp`

## Propriedades

### `GenTime` {#gentime}

```csharp
public DateTimeOffset GenTime { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `MessageImprint` {#messageimprint}

```csharp
public DigestAlgorithmAndValue MessageImprint { get; }
```

**Retorno**

[`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md)

---

### `SerialNumber` {#serialnumber}

```csharp
public string SerialNumber { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`EncapsulatedContentType`](./CadesSignature.md#encapsulatedcontenttype), [`HasEncapsulatedContent`](./CadesSignature.md#hasencapsulatedcontent), [`Signers`](./CadesSignature.md#signers), [`BStamp`](./BaseSignature.md#bstamp), [`AuditPackage`](./BaseSignature.md#auditpackage), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
