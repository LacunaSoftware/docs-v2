---
sidebar_label: "CadesPoliciesForValidation"
---

# CadesPoliciesForValidation

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Static class with a collection of CAdES policies commonly used for signature validation.

```csharp
public static class CadesPoliciesForValidation
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesPoliciesForValidation`

## Métodos

### `GetCadesBasic(ITrustArbitrator)` {#getcadesbasic-lacuna-pki-itrustarbitrator}

```csharp
public static ICadesPolicyMapperBySignerInfo GetCadesBasic(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md)

---

### `GetCadesWithCACertificateProtection(ITrustArbitrator)` {#getcadeswithcacertificateprotection-lacuna-pki-itrustarbitrator}

```csharp
public static ICadesPolicyMapperBySignerInfo GetCadesWithCACertificateProtection(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md)

---

### `GetCadesWithSignerCertificateProtection(ITrustArbitrator)` {#getcadeswithsignercertificateprotection-lacuna-pki-itrustarbitrator}

```csharp
public static ICadesPolicyMapperBySignerInfo GetCadesWithSignerCertificateProtection(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md)

---

### `GetPkiBrazil()` {#getpkibrazil}

```csharp
public static ICadesPolicyMapperBySignerInfo GetPkiBrazil()
```

**Retorno**

[`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md)

---

### `GetPkiBrazilWithCACertificateProtection()` {#getpkibrazilwithcacertificateprotection}

```csharp
public static ICadesPolicyMapperBySignerInfo GetPkiBrazilWithCACertificateProtection()
```

**Retorno**

[`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md)

---

### `GetPkiBrazilWithSignerCertificateProtection()` {#getpkibrazilwithsignercertificateprotection}

```csharp
public static ICadesPolicyMapperBySignerInfo GetPkiBrazilWithSignerCertificateProtection()
```

**Retorno**

[`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
