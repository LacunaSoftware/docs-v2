---
sidebar_label: "Crl"
---

# Crl

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class Crl
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Crl`

## Propriedades

### `AuthorityInformationAccess` {#authorityinformationaccess}

```csharp
protected AuthorityInformationAccess AuthorityInformationAccess { get; }
```

**Retorno**

[`AuthorityInformationAccess`](./AuthorityInformationAccess.md)

---

### `CAIssuersUri` {#caissuersuri}

```csharp
public Uri CAIssuersUri { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `CrlNumber` {#crlnumber}

```csharp
public BigInteger? CrlNumber { get; }
```

**Retorno**

[`BigInteger?`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `DistributionPointFullName` {#distributionpointfullname}

```csharp
public GeneralNames DistributionPointFullName { get; }
```

**Retorno**

[`GeneralNames`](./GeneralNames.md)

---

### `EncodedValue` {#encodedvalue}

```csharp
public byte[] EncodedValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Extensions` {#extensions}

```csharp
public X509Extensions Extensions { get; }
```

**Retorno**

[`X509Extensions`](./X509Extensions.md)

---

### `IsIndirectCrl` {#isindirectcrl}

```csharp
public bool IsIndirectCrl { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IssuerKeyIdentifier` {#issuerkeyidentifier}

```csharp
public byte[] IssuerKeyIdentifier { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `IssuerName` {#issuername}

```csharp
public Name IssuerName { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `NextUpdate` {#nextupdate}

```csharp
public DateTimeOffset NextUpdate { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `OnlyContainsAttributeCerts` {#onlycontainsattributecerts}

```csharp
public bool OnlyContainsAttributeCerts { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `OnlyContainsCACerts` {#onlycontainscacerts}

```csharp
public bool OnlyContainsCACerts { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `OnlyContainsUserCerts` {#onlycontainsusercerts}

```csharp
public bool OnlyContainsUserCerts { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `OnlyReasons` {#onlyreasons}

```csharp
public List<RevocationReasons> OnlyReasons { get; }
```

**Retorno**

[`List<RevocationReasons>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `SignatureAlgorithm` {#signaturealgorithm}

```csharp
public SignatureAlgorithm SignatureAlgorithm { get; }
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SignatureValue` {#signaturevalue}

```csharp
public byte[] SignatureValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `ThisUpdate` {#thisupdate}

```csharp
public DateTimeOffset ThisUpdate { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

```csharp
public static Crl Decode(byte[] crlContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `crlContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Crl`](./Crl.md)

---

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
