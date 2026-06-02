---
sidebar_label: "XmlSignedEntity"
---

# XmlSignedEntity

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class XmlSignedEntity
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlSignedEntity`

## Propriedades

### `Element` {#element}

```csharp
public XmlElement Element { get; }
```

**Retorno**

[`XmlElement`](https://learn.microsoft.com/dotnet/api/system.xml.xmlelement)

---

### `Signatures` {#signatures}

```csharp
public List<XmlSignature> Signatures { get; }
```

**Retorno**

[`List<XmlSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Type` {#type}

```csharp
public XmlSignedEntityTypes Type { get; set; }
```

**Retorno**

[`XmlSignedEntityTypes`](./XmlSignedEntityTypes.md)

---

## Métodos

### `ValidateAllSignatures(IXmlPolicyMapper, DateTimeOffset?)` {#validateallsignatures-lacuna-pki-xml-ixmlpolicymapper-system-nullable-system-datetimeoffset}

```csharp
public Dictionary<XmlSignature, ValidationResults> ValidateAllSignatures(IXmlPolicyMapper policyMapper, DateTimeOffset? dateReference = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IXmlPolicyMapper`](./IXmlPolicyMapper.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`Dictionary<XmlSignature, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(IXmlPolicyMapperBySignature, DateTimeOffset?)` {#validateallsignatures-lacuna-pki-xml-ixmlpolicymapperbysignature-system-nullable-system-datetimeoffset}

```csharp
public Dictionary<XmlSignature, ValidationResults> ValidateAllSignatures(IXmlPolicyMapperBySignature policyMapper, DateTimeOffset? dateReference = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`Dictionary<XmlSignature, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `ValidateAllSignatures(XmlPolicySpec, DateTimeOffset?)` {#validateallsignatures-lacuna-pki-xml-xmlpolicyspec-system-nullable-system-datetimeoffset}

```csharp
public Dictionary<XmlSignature, ValidationResults> ValidateAllSignatures(XmlPolicySpec policy, DateTimeOffset? dateReference = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`XmlPolicySpec`](./XmlPolicySpec.md) |  |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`Dictionary<XmlSignature, ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
