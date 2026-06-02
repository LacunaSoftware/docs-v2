---
sidebar_label: "XmlAcceptablePoliciesCatalog"
---

# XmlAcceptablePoliciesCatalog

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for creating a catalog of allowed XML policies for signature validation

```csharp
public class XmlAcceptablePoliciesCatalog : IXmlPolicyMapperBySignature
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlAcceptablePoliciesCatalog`

## Construtores

### `XmlAcceptablePoliciesCatalog(IEnumerable<XmlAcceptablePoliciesCatalog>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-xml-xmlacceptablepoliciescatalog}

Instantiates a XML acceptable explicit policies catalog from existing catalogs

```csharp
public XmlAcceptablePoliciesCatalog(IEnumerable<XmlAcceptablePoliciesCatalog> catalogs)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `catalogs` | [`IEnumerable<XmlAcceptablePoliciesCatalog>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `XmlAcceptablePoliciesCatalog(IEnumerable<XmlPolicySpec>)` {#ctor-system-collections-generic-ienumerable-lacuna-pki-xml-xmlpolicyspec}

Instatiates a XML acceptable explicit policies catalog

```csharp
public XmlAcceptablePoliciesCatalog(IEnumerable<XmlPolicySpec> policies = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policies` | [`IEnumerable<XmlPolicySpec>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | List of explicit policies |

---

## Métodos

### `AddPolicies(IEnumerable<XmlPolicySpec>)` {#addpolicies-system-collections-generic-ienumerable-lacuna-pki-xml-xmlpolicyspec}

Add allowed explicit signature policies

```csharp
public void AddPolicies(IEnumerable<XmlPolicySpec> policies)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policies` | [`IEnumerable<XmlPolicySpec>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | Explicit policies |

---

### `AddPolicy(XmlPolicySpec)` {#addpolicy-lacuna-pki-xml-xmlpolicyspec}

Add an allowed explicit signature policy

```csharp
public void AddPolicy(XmlPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`XmlPolicySpec`](./XmlPolicySpec.md) | Explicit policy (signature policy with OID) |

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

### `GetPolicy(XmlSignature)` {#getpolicy-lacuna-pki-xml-xmlsignature}

```csharp
public XmlPolicySpec GetPolicy(XmlSignature signerInfo)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`XmlSignature`](./XmlSignature.md) |  |

**Retorno**

[`XmlPolicySpec`](./XmlPolicySpec.md)

---

### `MergeWith(XmlAcceptablePoliciesCatalog)` {#mergewith-lacuna-pki-xml-xmlacceptablepoliciescatalog}

```csharp
public void MergeWith(XmlAcceptablePoliciesCatalog catalog)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `catalog` | [`XmlAcceptablePoliciesCatalog`](./XmlAcceptablePoliciesCatalog.md) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
