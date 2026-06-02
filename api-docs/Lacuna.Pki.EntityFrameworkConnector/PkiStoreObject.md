---
sidebar_label: "PkiStoreObject"
---

# PkiStoreObject

**Namespace:** `Lacuna.Pki.EntityFrameworkConnector`  
**Assembly:** `Lacuna.Pki.EntityFrameworkConnector`  
_Class_

```csharp
[Table("LacunaPkiStore")]
public class PkiStoreObject
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PkiStoreObject`

## Construtores

### `PkiStoreObject()` {#ctor}

```csharp
public PkiStoreObject()
```

---

## Propriedades

### `Content` {#content}

```csharp
[Required]
public byte[] Content { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Index` {#index}

```csharp
[MaxLength(32)]
[Key]
[MinLength(32)]
public byte[] Index { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
