---
sidebar_label: "SignaturePolicyCatalog"
---

# SignaturePolicyCatalog

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class SignaturePolicyCatalog
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignaturePolicyCatalog`

## Construtores

### `SignaturePolicyCatalog()` {#ctor}

```csharp
public SignaturePolicyCatalog()
```

---

### `SignaturePolicyCatalog(IEnumerable<Guid>)` {#ctor-system-collections-generic-ienumerable-system-guid}

```csharp
public SignaturePolicyCatalog(IEnumerable<Guid> policies)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policies` | [`IEnumerable<Guid>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

## Propriedades

### `Policies` {#policies}

```csharp
public List<Guid> Policies { get; }
```

**Retorno**

[`List<Guid>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `GetPkiBrazilCades()` {#getpkibrazilcades}

```csharp
public static SignaturePolicyCatalog GetPkiBrazilCades()
```

**Retorno**

[`SignaturePolicyCatalog`](./SignaturePolicyCatalog.md)

---

### `GetPkiBrazilCadesWithCACertificateProtection()` {#getpkibrazilcadeswithcacertificateprotection}

```csharp
public static SignaturePolicyCatalog GetPkiBrazilCadesWithCACertificateProtection()
```

**Retorno**

[`SignaturePolicyCatalog`](./SignaturePolicyCatalog.md)

---

### `GetPkiBrazilCadesWithSignerCertificateProtection()` {#getpkibrazilcadeswithsignercertificateprotection}

```csharp
public static SignaturePolicyCatalog GetPkiBrazilCadesWithSignerCertificateProtection()
```

**Retorno**

[`SignaturePolicyCatalog`](./SignaturePolicyCatalog.md)

---

### `GetPkiBrazilPades()` {#getpkibrazilpades}

```csharp
public static SignaturePolicyCatalog GetPkiBrazilPades()
```

**Retorno**

[`SignaturePolicyCatalog`](./SignaturePolicyCatalog.md)

---

### `GetPkiBrazilPadesWithSignerCertificateProtection()` {#getpkibrazilpadeswithsignercertificateprotection}

```csharp
public static SignaturePolicyCatalog GetPkiBrazilPadesWithSignerCertificateProtection()
```

**Retorno**

[`SignaturePolicyCatalog`](./SignaturePolicyCatalog.md)

---

### `GetPkiBrazilXades()` {#getpkibrazilxades}

```csharp
public static SignaturePolicyCatalog GetPkiBrazilXades()
```

**Retorno**

[`SignaturePolicyCatalog`](./SignaturePolicyCatalog.md)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
