---
sidebar_label: "PadesAcceptablePoliciesCatalog"
---

# PadesAcceptablePoliciesCatalog

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for creating a catalog of allowed PAdES policies for signature validation

```csharp
public class PadesAcceptablePoliciesCatalog : IPadesPolicyMapperBySignerInfo
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesAcceptablePoliciesCatalog`

## Construtores

### `PadesAcceptablePoliciesCatalog(IEnumerable<PadesAcceptablePoliciesCatalog>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-pades-padesacceptablepoliciescatalog}

Instantiates a PAdES acceptable explicit policies catalog from existing catalogs

```csharp
public PadesAcceptablePoliciesCatalog(IEnumerable<PadesAcceptablePoliciesCatalog> catalogs)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `catalogs` | [`IEnumerable<PadesAcceptablePoliciesCatalog>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `PadesAcceptablePoliciesCatalog(IEnumerable<PadesPolicySpec>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-pades-padespolicyspec}

Instatiates a PAdES acceptable explicit policies catalog

```csharp
public PadesAcceptablePoliciesCatalog(IEnumerable<PadesPolicySpec> policies = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policies` | [`IEnumerable<PadesPolicySpec>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | List of explicit policies |

---

## Métodos

### `AddPolicies(IEnumerable<PadesPolicySpec>)` {#addpolicies-system-collections-generic-ienumerable-lacuna-pki-pades-padespolicyspec}

Add allowed explicit signature policies

```csharp
public void AddPolicies(IEnumerable<PadesPolicySpec> policies)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policies` | [`IEnumerable<PadesPolicySpec>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | Explicit policies |

---

### `AddPolicy(PadesPolicySpec)` {#addpolicy-lacuna-pki-pades-padespolicyspec}

Add an allowed explicit signature policy

```csharp
public void AddPolicy(PadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) | Explicit policy (signature policy with OID) |

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

### `GetPolicy(PadesSignerInfo)` {#getpolicy-lacuna-pki-pades-padessignerinfo}

```csharp
public PadesPolicySpec GetPolicy(PadesSignerInfo signerInfo)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`PadesSignerInfo`](./PadesSignerInfo.md) |  |

**Retorno**

[`PadesPolicySpec`](./PadesPolicySpec.md)

---

### `MergeWith(PadesAcceptablePoliciesCatalog)` {#mergewith-lacuna-pki-pades-padesacceptablepoliciescatalog}

```csharp
public void MergeWith(PadesAcceptablePoliciesCatalog catalog)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `catalog` | [`PadesAcceptablePoliciesCatalog`](./PadesAcceptablePoliciesCatalog.md) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
