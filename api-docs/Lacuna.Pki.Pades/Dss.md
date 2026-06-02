---
sidebar_label: "Dss"
---

# Dss

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

A DSS (Document Security Store) PDF dictionary object with PKI validation artificats stores

```csharp
public class Dss : ICertificateStore, ICrlStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Dss`

## Construtores

### `Dss(IEnumerable<PKCertificate>, IEnumerable<Crl>, IEnumerable<Ocsp>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-pkcertificate-system-collections-generic-ienumerable-lacuna-pki-crl-system-collections-generic-ienumerable-lacuna-pki-ocsp}

```csharp
public Dss(IEnumerable<PKCertificate> certificates, IEnumerable<Crl> trustedCrls, IEnumerable<Ocsp> trustedOcsps)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `trustedCrls` | [`IEnumerable<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `trustedOcsps` | [`IEnumerable<Ocsp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `Dss(IEnumerable<PKCertificate>, IEnumerable<Crl>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-pkcertificate-system-collections-generic-ienumerable-lacuna-pki-crl}

```csharp
public Dss(IEnumerable<PKCertificate> certificates, IEnumerable<Crl> trustedCrls)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `trustedCrls` | [`IEnumerable<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

## Propriedades

### `Certificates` {#certificates}

```csharp
public IEnumerable<PKCertificate> Certificates { get; }
```

**Retorno**

[`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---

### `Crls` {#crls}

```csharp
public IEnumerable<Crl> Crls { get; }
```

**Retorno**

[`IEnumerable<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---

### `Ocsps` {#ocsps}

```csharp
public IEnumerable<Ocsp> Ocsps { get; }
```

**Retorno**

[`IEnumerable<Ocsp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---

## Métodos

### `GetCertificate(byte[])` {#getcertificate-system-byte}

Find a certificate by its Key Identifier

```csharp
public PKCertificate GetCertificate(byte[] keyIdentifier)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `keyIdentifier` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md)

---

### `GetCertificate(Name, BigInteger)` {#getcertificate-lacuna-pki-name-system-numerics-biginteger}

Find a certificate by its Issuer Name and Serial Number

```csharp
public PKCertificate GetCertificate(Name issuerName, BigInteger serialNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuerName` | [`Name`](../Lacuna.Pki/Name.md) | Certificate's issuer name |
| `serialNumber` | [`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger) | Certificate's serial number |

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md)

---

### `GetCertificates(Name)` {#getcertificates-lacuna-pki-name}

Find one or more certificates by its Subject Name

```csharp
public List<PKCertificate> GetCertificates(Name subjectName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `subjectName` | [`Name`](../Lacuna.Pki/Name.md) |  |

**Retorno**

[`List<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetExpiringAfter(Uri, Name, DateTimeOffset, DateTimeOffset, TimeSpan)` {#getexpiringafter-system-uri-lacuna-pki-name-system-datetimeoffset-system-datetimeoffset-system-timespan}

Recovers a CRL based on the publishing URI with a maximum issuing date and a minimum expiring date.

```csharp
public Crl GetExpiringAfter(Uri uri, Name issuer, DateTimeOffset issuedBefore, DateTimeOffset expiringAfter, TimeSpan timeout)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `issuer` | [`Name`](../Lacuna.Pki/Name.md) |  |
| `issuedBefore` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | Maximum issuing date of the CRL. The returned CRL (if any) must have a ThisUpdate date value from before this parameter. |
| `expiringAfter` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | Minimum expiring date of the CRL. The returned CRL (if any) must have a NextUpdate date value after this parameter. |
| `timeout` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) | The maximum time that the implementing class should take to return a CRL. If TimeSpan.Zero, the implementing class should only             return a CRL if it does not depend on any network latency or other external factors. |

**Retorno**

[`Crl`](../Lacuna.Pki/Crl.md) — A CRL that matches the requirements, or null if none can be found.

---

### `GetIssuedAfter(Uri, Name, DateTimeOffset, DateTimeOffset, TimeSpan)` {#getissuedafter-system-uri-lacuna-pki-name-system-datetimeoffset-system-datetimeoffset-system-timespan}

Recovers a CRL based on the publishing URI with a minimum and maximum issuing date.

```csharp
public Crl GetIssuedAfter(Uri uri, Name issuer, DateTimeOffset issuedBefore, DateTimeOffset issuedAfter, TimeSpan timeout)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `issuer` | [`Name`](../Lacuna.Pki/Name.md) |  |
| `issuedBefore` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | Maximum issuing date of the CRL. The returned CRL (if any) must have a ThisUpdate date value from before this parameter. |
| `issuedAfter` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | Minimum issuing date of the CRL. The returned CRL (if any) must have a ThisUpdate date value after this parameter. |
| `timeout` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) | The maximum time that the implementing class should take to return a CRL. If TimeSpan.Zero, the implementing class should only             return a CRL if it does not depend on any network latency or other external factors. |

**Retorno**

[`Crl`](../Lacuna.Pki/Crl.md) — A CRL that matches the requirements, or null if none can be found.

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
