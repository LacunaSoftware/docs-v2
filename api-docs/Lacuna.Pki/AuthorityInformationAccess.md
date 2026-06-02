---
sidebar_label: "AuthorityInformationAccess"
---

# AuthorityInformationAccess

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class AuthorityInformationAccess
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AuthorityInformationAccess`

## Propriedades

### `CAIssuersUri` {#caissuersuri}

```csharp
public Uri CAIssuersUri { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `CAIssuersUris` {#caissuersuris}

```csharp
public List<Uri> CAIssuersUris { get; }
```

**Retorno**

[`List<Uri>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Descriptions` {#descriptions}

```csharp
[Obsolete("Use DescriptionsMap instead")]
public Dictionary<string, GeneralName> Descriptions { get; }
```

**Retorno**

[`Dictionary<string, GeneralName>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `DescriptionsMap` {#descriptionsmap}

```csharp
public Dictionary<string, List<GeneralName>> DescriptionsMap { get; }
```

**Retorno**

[`Dictionary<string, List<GeneralName>>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `OcspUri` {#ocspuri}

```csharp
public Uri OcspUri { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
