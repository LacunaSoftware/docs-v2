---
sidebar_label: "CadesAcceptablePoliciesCatalog"
---

# CadesAcceptablePoliciesCatalog

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for creating a catalog of allowed CAdES policies for signature validation

```csharp
public class CadesAcceptablePoliciesCatalog : ICadesPolicyMapperBySignerInfo
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesAcceptablePoliciesCatalog`

## Construtores

### `CadesAcceptablePoliciesCatalog(IEnumerable<CadesAcceptablePoliciesCatalog>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-cades-cadesacceptablepoliciescatalog}

Instantiates a CAdES acceptable explicit policies catalog from existing catalogs

```csharp
public CadesAcceptablePoliciesCatalog(IEnumerable<CadesAcceptablePoliciesCatalog> catalogs)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `catalogs` | [`IEnumerable<CadesAcceptablePoliciesCatalog>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `CadesAcceptablePoliciesCatalog(IEnumerable<CadesPolicySpec>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-cades-cadespolicyspec}

Instatiates a CAdES acceptable explicit policies catalog

```csharp
public CadesAcceptablePoliciesCatalog(IEnumerable<CadesPolicySpec> policies = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policies` | [`IEnumerable<CadesPolicySpec>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | List of explicit policies |

---

## Métodos

### `AddPolicies(IEnumerable<CadesPolicySpec>)` {#addpolicies-system-collections-generic-ienumerable-lacuna-pki-cades-cadespolicyspec}

Add allowed explicit signature policies

```csharp
public void AddPolicies(IEnumerable<CadesPolicySpec> policies)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policies` | [`IEnumerable<CadesPolicySpec>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | Explicit policies |

---

### `AddPolicy(CadesPolicySpec)` {#addpolicy-lacuna-pki-cades-cadespolicyspec}

Add an allowed explicit signature policy

```csharp
public void AddPolicy(CadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) | Explicit policy (signature policy with OID) |

---

### `AddTrustArbitrator(ITrustArbitrator, bool)` {#addtrustarbitrator-lacuna-pki-itrustarbitrator-system-boolean}

Add a trust arbitrator to all accepted policies.

```csharp
public void AddTrustArbitrator(ITrustArbitrator arbitrator, bool propagateToTimestampPolicies = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |
| `propagateToTimestampPolicies` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `ClearTrustArbitrators(bool)` {#cleartrustarbitrators-system-boolean}

Clear the trust arbitrators in all accepted policies

```csharp
public void ClearTrustArbitrators(bool propagateToTimestampPolicies = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `propagateToTimestampPolicies` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `GetPolicy(CadesSignerInfo)` {#getpolicy-lacuna-pki-cades-cadessignerinfo}

```csharp
public CadesPolicySpec GetPolicy(CadesSignerInfo signerInfo)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `MergeWith(CadesAcceptablePoliciesCatalog)` {#mergewith-lacuna-pki-cades-cadesacceptablepoliciescatalog}

```csharp
public void MergeWith(CadesAcceptablePoliciesCatalog catalog)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `catalog` | [`CadesAcceptablePoliciesCatalog`](./CadesAcceptablePoliciesCatalog.md) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
