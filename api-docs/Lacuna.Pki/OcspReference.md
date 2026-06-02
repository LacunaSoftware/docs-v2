---
sidebar_label: "OcspReference"
---

# OcspReference

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class OcspReference
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `OcspReference`

## Propriedades

### `HashAlgorithm` {#hashalgorithm}

```csharp
public DigestAlgorithm HashAlgorithm { get; }
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `HashValue` {#hashvalue}

```csharp
public byte[] HashValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `IssuedTime` {#issuedtime}

```csharp
public DateTimeOffset IssuedTime { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `IssuerName` {#issuername}

Can be null

```csharp
public Name IssuerName { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `KeyIdentifier` {#keyidentifier}

Can be null

```csharp
public byte[] KeyIdentifier { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
