---
sidebar_label: "ValidationContext"
---

# ValidationContext

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Class_

Representes a trusted validation artifacts object

```csharp
public class ValidationContext
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ValidationContext`

## Construtores

### `ValidationContext()` {#ctor}

```csharp
public ValidationContext()
```

---

## Propriedades

### `CertificateStore` {#certificatestore}

A trusted certificate store

```csharp
public ICertificateStore CertificateStore { get; set; }
```

**Retorno**

[`ICertificateStore`](./ICertificateStore.md)

---

### `CrlStore` {#crlstore}

A trusted CRL store holding valid CRLs for the alleged DateReference

```csharp
public ICrlStore CrlStore { get; set; }
```

**Retorno**

[`ICrlStore`](./ICrlStore.md)

---

### `DateReference` {#datereference}

A trusted date reference for the validation context

```csharp
public DateTimeOffset DateReference { get; set; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Métodos

### `Create(Dss, DateTimeOffset)` {#create-lacuna-pki-pades-dss-system-datetimeoffset}

Creates a validation context with all DSS dictionary artifact stores and a date reference

```csharp
public static ValidationContext Create(Dss padesDss, DateTimeOffset dateReference)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `padesDss` | [`Dss`](../Lacuna.Pki.Pades/Dss.md) |  |
| `dateReference` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`ValidationContext`](./ValidationContext.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
