---
sidebar_label: "MemoryCertificateStore"
---

# MemoryCertificateStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class MemoryCertificateStore : ICertificateStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `MemoryCertificateStore`

## Construtores

### `MemoryCertificateStore()` {#ctor}

```csharp
public MemoryCertificateStore()
```

---

### `MemoryCertificateStore(IEnumerable<PKCertificate>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-pkcertificate}

```csharp
public MemoryCertificateStore(IEnumerable<PKCertificate> certificates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

## Métodos

### `Add(PKCertificate)` {#add-lacuna-pki-pkcertificate}

```csharp
public void Add(PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) |  |

---

### `AddRange(IEnumerable<PKCertificate>)` {#addrange-system-collections-generic-ienumerable-lacuna-pki-pkcertificate}

```csharp
public void AddRange(IEnumerable<PKCertificate> certificates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

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

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
