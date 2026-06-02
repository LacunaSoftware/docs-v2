---
sidebar_label: "XmlPoliciesForValidation"
---

# XmlPoliciesForValidation

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

Static class with a collection of XML policies commonly used for signature validation.

```csharp
public static class XmlPoliciesForValidation
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlPoliciesForValidation`

## Métodos

### `GetNFePadraoNacional()` {#getnfepadraonacional}

```csharp
public static IXmlPolicyMapperBySignature GetNFePadraoNacional()
```

**Retorno**

[`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md)

---

### `GetPkiBrazil()` {#getpkibrazil}

```csharp
public static IXmlPolicyMapperBySignature GetPkiBrazil()
```

**Retorno**

[`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md)

---

### `GetPkiBrazilWithSignerCertificateProtection()` {#getpkibrazilwithsignercertificateprotection}

```csharp
public static IXmlPolicyMapperBySignature GetPkiBrazilWithSignerCertificateProtection()
```

**Retorno**

[`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md)

---

### `GetXadesBasic(ITrustArbitrator)` {#getxadesbasic-lacuna-pki-itrustarbitrator}

```csharp
public static IXmlPolicyMapperBySignature GetXadesBasic(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md)

---

### `GetXmlDSigBasic(ITrustArbitrator)` {#getxmldsigbasic-lacuna-pki-itrustarbitrator}

```csharp
public static IXmlPolicyMapperBySignature GetXmlDSigBasic(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
