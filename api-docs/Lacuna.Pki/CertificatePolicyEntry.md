---
sidebar_label: "CertificatePolicyEntry"
---

# CertificatePolicyEntry

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CertificatePolicyEntry
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CertificatePolicyEntry`

## Construtores

### `CertificatePolicyEntry()` {#ctor}

```csharp
public CertificatePolicyEntry()
```

---

## Propriedades

### `CpsUri` {#cpsuri}

Certification Practice Statement document URI

```csharp
public Uri CpsUri { get; set; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `Oid` {#oid}

Policy OID

```csharp
public string Oid { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `UserNotices` {#usernotices}

User Notices Display Texts

```csharp
public IEnumerable<string> UserNotices { get; set; }
```

**Retorno**

[`IEnumerable<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
