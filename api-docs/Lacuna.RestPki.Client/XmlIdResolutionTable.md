---
sidebar_label: "XmlIdResolutionTable"
---

# XmlIdResolutionTable

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class XmlIdResolutionTable
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlIdResolutionTable`

## Construtores

### `XmlIdResolutionTable(bool)` {#ctor-system-boolean}

```csharp
public XmlIdResolutionTable(bool includeXmlIdGlobalAttribute = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `includeXmlIdGlobalAttribute` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

## Métodos

### `AddGlobalIdAttribute(string, string)` {#addglobalidattribute-system-string-system-string}

Specify an attribute to be globally considered as the ID attribute. This rule has less precedence than rules set with the SetElementIdAttribute method.

```csharp
public void AddGlobalIdAttribute(string idAttributeLocalName, string idAttributeNamespace = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `idAttributeLocalName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Name of the attribute (e.g.: "id") |
| `idAttributeNamespace` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Namespace URI of the attribute. If null, the attribute is regarded as having no namespace. The special value "xml" may be used to represent the http://www.w3.org/XML/1998/namespace namespace. |

---

### `SetElementIdAttribute(string, string, string, string)` {#setelementidattribute-system-string-system-string-system-string-system-string}

Specify the attribute to be considered as the ID attribute for a certain element. This rule takes precedence over a global ID attribute specified
with the SetGlobalIdAttribute method.

```csharp
public void SetElementIdAttribute(string elementLocalName, string elementNamespace, string idAttributeLocalName, string idAttributeNamespace = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `elementLocalName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `elementNamespace` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `idAttributeLocalName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `idAttributeNamespace` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `ToModel()` {#tomodel}

```csharp
public XmlIdResolutionTableModel ToModel()
```

**Retorno**

`XmlIdResolutionTableModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
