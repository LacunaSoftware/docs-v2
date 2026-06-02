---
sidebar_label: "XmlSignatureEditor"
---

# XmlSignatureEditor

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class XmlSignatureEditor
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlSignatureEditor`

## Propriedades

### `Signatures` {#signatures}

```csharp
public List<XmlSignature> Signatures { get; }
```

**Retorno**

[`List<XmlSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `ExtendArchiving(XmlSignature, ITimestampRequester, IXmlPolicyMapperBySignature, bool)` {#extendarchiving-lacuna-pki-xml-xmlsignature-lacuna-pki-itimestamprequester-lacuna-pki-xml-ixmlpolicymapperbysignature-system-boolean}

```csharp
public byte[] ExtendArchiving(XmlSignature signature, ITimestampRequester requester, IXmlPolicyMapperBySignature policyMapper, bool ignoreSameTsSigner = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`XmlSignature`](./XmlSignature.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |
| `policyMapper` | [`IXmlPolicyMapperBySignature`](./IXmlPolicyMapperBySignature.md) |  |
| `ignoreSameTsSigner` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Open(byte[], XmlIdResolutionTable)` {#open-system-byte-lacuna-pki-xml-xmlidresolutiontable}

```csharp
public static XmlSignatureEditor Open(byte[] xmlDocument, XmlIdResolutionTable idResolutionTable = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlDocument` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `idResolutionTable` | [`XmlIdResolutionTable`](./XmlIdResolutionTable.md) |  |

**Retorno**

[`XmlSignatureEditor`](./XmlSignatureEditor.md)

---

### `Open(XmlDocument, XmlIdResolutionTable)` {#open-system-xml-xmldocument-lacuna-pki-xml-xmlidresolutiontable}

```csharp
public static XmlSignatureEditor Open(XmlDocument xmlDocument, XmlIdResolutionTable idResolutionTable = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlDocument` | [`XmlDocument`](https://learn.microsoft.com/dotnet/api/system.xml.xmldocument) |  |
| `idResolutionTable` | [`XmlIdResolutionTable`](./XmlIdResolutionTable.md) |  |

**Retorno**

[`XmlSignatureEditor`](./XmlSignatureEditor.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
