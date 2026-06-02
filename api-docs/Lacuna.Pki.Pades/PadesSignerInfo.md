---
sidebar_label: "PadesSignerInfo"
---

# PadesSignerInfo

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PadesSignerInfo
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesSignerInfo`

## Propriedades

### `HasLtv` {#hasltv}

Wheter or not the signer has a VRI dictionary with certificate validation artifacts
from the signing time (Long Term Validation)

```csharp
public bool HasLtv { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsTsp` {#istsp}

Whether or not the signer is a Document Timestamp

```csharp
public bool IsTsp { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Location` {#location}

The signing location, if set

```csharp
public string Location { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Reason` {#reason}

Signers signing reason, if set

```csharp
public string Reason { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Signature` {#signature}

```csharp
public CadesSignature Signature { get; }
```

**Retorno**

[`CadesSignature`](../Lacuna.Pki.Cades/CadesSignature.md)

---

### `SignatureFieldName` {#signaturefieldname}

```csharp
public string SignatureFieldName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Signer` {#signer}

```csharp
public CadesSignerInfo Signer { get; }
```

**Retorno**

[`CadesSignerInfo`](../Lacuna.Pki.Cades/CadesSignerInfo.md)

---

### `SigningTime` {#signingtime}

```csharp
public DateTimeOffset? SigningTime { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `VisualRepresentationInfo` {#visualrepresentationinfo}

```csharp
public PadesVisualRepresentationInfo VisualRepresentationInfo { get; }
```

**Retorno**

[`PadesVisualRepresentationInfo`](./PadesVisualRepresentationInfo.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
