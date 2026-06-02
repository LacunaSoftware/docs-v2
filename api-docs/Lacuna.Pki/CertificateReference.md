---
sidebar_label: "CertificateReference"
---

# CertificateReference

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CertificateReference
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CertificateReference`

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

### `Issuer` {#issuer}

Optitional parameter. It can be null

```csharp
public GeneralNames Issuer { get; }
```

**Retorno**

[`GeneralNames`](./GeneralNames.md)

---

### `SerialNumber` {#serialnumber}

Optional parameter. It can be null

```csharp
public BigInteger? SerialNumber { get; }
```

**Retorno**

[`BigInteger?`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
