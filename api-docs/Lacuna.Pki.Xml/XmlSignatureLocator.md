---
sidebar_label: "XmlSignatureLocator"
---

# XmlSignatureLocator

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class XmlSignatureLocator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlSignatureLocator`

## Construtores

### `XmlSignatureLocator(byte[], XmlIdResolutionTable)` {#ctor-system-byte-lacuna-pki-xml-xmlidresolutiontable}

```csharp
public XmlSignatureLocator(byte[] xmlDocument, XmlIdResolutionTable idResolutionTable = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlDocument` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `idResolutionTable` | [`XmlIdResolutionTable`](./XmlIdResolutionTable.md) |  |

---

### `XmlSignatureLocator(XmlDocument, XmlIdResolutionTable)` {#ctor-system-xml-xmldocument-lacuna-pki-xml-xmlidresolutiontable}

```csharp
public XmlSignatureLocator(XmlDocument xmlDocument, XmlIdResolutionTable idResolutionTable = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlDocument` | [`XmlDocument`](https://learn.microsoft.com/dotnet/api/system.xml.xmldocument) |  |
| `idResolutionTable` | [`XmlIdResolutionTable`](./XmlIdResolutionTable.md) |  |

---

## Métodos

### `GetFullXmlSignatures()` {#getfullxmlsignatures}

```csharp
public List<XmlSignature> GetFullXmlSignatures()
```

**Retorno**

[`List<XmlSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetSignatures()` {#getsignatures}

```csharp
public List<XmlSignature> GetSignatures()
```

**Retorno**

[`List<XmlSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetSignaturesOfElement(XmlElement)` {#getsignaturesofelement-system-xml-xmlelement}

```csharp
public List<XmlSignature> GetSignaturesOfElement(XmlElement element)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `element` | [`XmlElement`](https://learn.microsoft.com/dotnet/api/system.xml.xmlelement) |  |

**Retorno**

[`List<XmlSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetSignedEntities()` {#getsignedentities}

```csharp
public List<XmlSignedEntity> GetSignedEntities()
```

**Retorno**

[`List<XmlSignedEntity>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
