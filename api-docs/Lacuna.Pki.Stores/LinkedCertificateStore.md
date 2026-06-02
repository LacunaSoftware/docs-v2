---
sidebar_label: "LinkedCertificateStore"
---

# LinkedCertificateStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class LinkedCertificateStore : ICertificateStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `LinkedCertificateStore`

## Construtores

### `LinkedCertificateStore()` {#ctor}

```csharp
public LinkedCertificateStore()
```

---

### `LinkedCertificateStore(IEnumerable<ICertificateStore>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-stores-icertificatestore}

```csharp
public LinkedCertificateStore(IEnumerable<ICertificateStore> stores)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stores` | [`IEnumerable<ICertificateStore>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `LinkedCertificateStore(params ICertificateStore[])` {#ctor-lacuna-pki-stores-icertificatestore}

```csharp
public LinkedCertificateStore(params ICertificateStore[] stores)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stores` | `ICertificateStore[]` |  |

---

## Métodos

### `Add(ICertificateStore)` {#add-lacuna-pki-stores-icertificatestore}

```csharp
public void Add(ICertificateStore store)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `store` | [`ICertificateStore`](./ICertificateStore.md) |  |

---

### `AddRange(IEnumerable<ICertificateStore>)` {#addrange-system-collections-generic-ienumerable-lacuna-pki-stores-icertificatestore}

```csharp
public void AddRange(IEnumerable<ICertificateStore> stores)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stores` | [`IEnumerable<ICertificateStore>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

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
