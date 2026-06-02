---
sidebar_label: "PKCertificate"
---

# PKCertificate

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PKCertificate
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PKCertificate`

## Propriedades

### `EmailAddress` {#emailaddress}

```csharp
public string EmailAddress { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Issuer` {#issuer}

```csharp
public PKCertificate Issuer { get; }
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `IssuerName` {#issuername}

```csharp
public Name IssuerName { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `PkiBrazil` {#pkibrazil}

```csharp
public PkiBrazilCertificateFields PkiBrazil { get; }
```

**Retorno**

[`PkiBrazilCertificateFields`](./PkiBrazilCertificateFields.md)

---

### `PkiItaly` {#pkiitaly}

```csharp
public PkiItalyCertificateFields PkiItaly { get; }
```

**Retorno**

[`PkiItalyCertificateFields`](./PkiItalyCertificateFields.md)

---

### `SerialNumber` {#serialnumber}

```csharp
public BigInteger SerialNumber { get; }
```

**Retorno**

[`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `SerialNumberDecimal` {#serialnumberdecimal}

```csharp
public string SerialNumberDecimal { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SubjectName` {#subjectname}

```csharp
public Name SubjectName { get; }
```

**Retorno**

[`Name`](./Name.md)

---

### `ThumbprintSHA1` {#thumbprintsha1}

```csharp
public DigestAlgorithmAndValue ThumbprintSHA1 { get; }
```

**Retorno**

[`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md)

---

### `ThumbprintSHA256` {#thumbprintsha256}

```csharp
public DigestAlgorithmAndValue ThumbprintSHA256 { get; }
```

**Retorno**

[`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md)

---

### `TrustAnchor` {#trustanchor}

```csharp
public PKCertificate TrustAnchor { get; }
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `ValidityEnd` {#validityend}

```csharp
public DateTimeOffset ValidityEnd { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `ValidityStart` {#validitystart}

```csharp
public DateTimeOffset ValidityStart { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
