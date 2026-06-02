---
sidebar_label: "PkiNonce"
---

# PkiNonce

**Namespace:** `Lacuna.Pki.EntityFrameworkConnector`  
**Assembly:** `Lacuna.Pki.EntityFrameworkConnector`  
_Class_

```csharp
[Table("LacunaPkiNonces")]
public class PkiNonce
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PkiNonce`

## Construtores

### `PkiNonce()` {#ctor}

```csharp
public PkiNonce()
```

---

## Propriedades

### `Nonce` {#nonce}

```csharp
[MaxLength(16)]
[Key]
[MinLength(16)]
public byte[] Nonce { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
