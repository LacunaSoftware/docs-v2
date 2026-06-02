---
sidebar_label: "CrlReference"
---

# CrlReference

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CrlReference
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CrlReference`

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

Optional parameter. It can be null.

```csharp
public DateTimeOffset? IssuedTime { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `Issuer` {#issuer}

Optional parameter. It can be null.

```csharp
public Name Issuer { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `Number` {#number}

Optional parameter. It can be null.

```csharp
public BigInteger? Number { get; }
```

**Retorno**

[`BigInteger?`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
