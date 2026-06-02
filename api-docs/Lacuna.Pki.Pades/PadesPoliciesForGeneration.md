---
sidebar_label: "PadesPoliciesForGeneration"
---

# PadesPoliciesForGeneration

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Static class with a collection of PAdES policies commonly used for signature generation.

```csharp
public static class PadesPoliciesForGeneration
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesPoliciesForGeneration`

## Métodos

### `GetPadesBasic(ITrustArbitrator)` {#getpadesbasic-lacuna-pki-itrustarbitrator}

```csharp
public static IPadesPolicyMapper GetPadesBasic(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`IPadesPolicyMapper`](./IPadesPolicyMapper.md)

---

### `GetPadesT(ITrustArbitrator)` {#getpadest-lacuna-pki-itrustarbitrator}

```csharp
public static IPadesPolicyMapper GetPadesT(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`IPadesPolicyMapper`](./IPadesPolicyMapper.md)

---

### `GetPkiBrazilAdrArquivamento()` {#getpkibraziladrarquivamento}

```csharp
public static IPadesPolicyMapper GetPkiBrazilAdrArquivamento()
```

**Retorno**

[`IPadesPolicyMapper`](./IPadesPolicyMapper.md)

---

### `GetPkiBrazilAdrBasica()` {#getpkibraziladrbasica}

```csharp
public static IPadesPolicyMapper GetPkiBrazilAdrBasica()
```

**Retorno**

[`IPadesPolicyMapper`](./IPadesPolicyMapper.md)

---

### `GetPkiBrazilAdrCompleta()` {#getpkibraziladrcompleta}

```csharp
public static IPadesPolicyMapper GetPkiBrazilAdrCompleta()
```

**Retorno**

[`IPadesPolicyMapper`](./IPadesPolicyMapper.md)

---

### `GetPkiBrazilAdrTempo()` {#getpkibraziladrtempo}

```csharp
public static IPadesPolicyMapper GetPkiBrazilAdrTempo()
```

**Retorno**

[`IPadesPolicyMapper`](./IPadesPolicyMapper.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
