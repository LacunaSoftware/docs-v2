---
sidebar_label: "PadesPoliciesForValidation"
---

# PadesPoliciesForValidation

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Static class with a collection of PAdES policies commonly used for signature validation.

```csharp
public static class PadesPoliciesForValidation
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesPoliciesForValidation`

## Métodos

### `GetPadesBasic(ITrustArbitrator)` {#getpadesbasic-lacuna-pki-itrustarbitrator}

```csharp
public static IPadesPolicyMapperBySignerInfo GetPadesBasic(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md)

---

### `GetPadesWithSignerCertificateProtection(ITrustArbitrator)` {#getpadeswithsignercertificateprotection-lacuna-pki-itrustarbitrator}

```csharp
public static IPadesPolicyMapperBySignerInfo GetPadesWithSignerCertificateProtection(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md)

---

### `GetPkiBrazil()` {#getpkibrazil}

```csharp
public static IPadesPolicyMapperBySignerInfo GetPkiBrazil()
```

**Retorno**

[`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md)

---

### `GetPkiBrazilWithSignerCertificateProtection()` {#getpkibrazilwithsignercertificateprotection}

```csharp
public static IPadesPolicyMapperBySignerInfo GetPkiBrazilWithSignerCertificateProtection()
```

**Retorno**

[`IPadesPolicyMapperBySignerInfo`](./IPadesPolicyMapperBySignerInfo.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
