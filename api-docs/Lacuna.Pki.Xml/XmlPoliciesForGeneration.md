---
sidebar_label: "XmlPoliciesForGeneration"
---

# XmlPoliciesForGeneration

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

Static class with a collection of XML policies commonly used for signature generation.

```csharp
public static class XmlPoliciesForGeneration
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlPoliciesForGeneration`

## Métodos

### `GetNFePadraoNacional()` {#getnfepadraonacional}

```csharp
public static IXmlPolicyMapper GetNFePadraoNacional()
```

**Retorno**

[`IXmlPolicyMapper`](./IXmlPolicyMapper.md)

---

### `GetPkiBrazilAdrArquivamento()` {#getpkibraziladrarquivamento}

```csharp
public static IXmlPolicyMapper GetPkiBrazilAdrArquivamento()
```

**Retorno**

[`IXmlPolicyMapper`](./IXmlPolicyMapper.md)

---

### `GetPkiBrazilAdrBasica(bool)` {#getpkibraziladrbasica-system-boolean}

```csharp
public static IXmlPolicyMapper GetPkiBrazilAdrBasica(bool includeSigningTime = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `includeSigningTime` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`IXmlPolicyMapper`](./IXmlPolicyMapper.md)

---

### `GetPkiBrazilAdrCompleta()` {#getpkibraziladrcompleta}

```csharp
public static IXmlPolicyMapper GetPkiBrazilAdrCompleta()
```

**Retorno**

[`IXmlPolicyMapper`](./IXmlPolicyMapper.md)

---

### `GetPkiBrazilAdrTempo()` {#getpkibraziladrtempo}

```csharp
public static IXmlPolicyMapper GetPkiBrazilAdrTempo()
```

**Retorno**

[`IXmlPolicyMapper`](./IXmlPolicyMapper.md)

---

### `GetXadesBasic(ITrustArbitrator)` {#getxadesbasic-lacuna-pki-itrustarbitrator}

```csharp
public static IXmlPolicyMapper GetXadesBasic(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`IXmlPolicyMapper`](./IXmlPolicyMapper.md)

---

### `GetXmlDSigBasic(ITrustArbitrator)` {#getxmldsigbasic-lacuna-pki-itrustarbitrator}

```csharp
public static IXmlPolicyMapper GetXmlDSigBasic(ITrustArbitrator trustArbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`IXmlPolicyMapper`](./IXmlPolicyMapper.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
