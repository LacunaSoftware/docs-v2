---
sidebar_label: "AmbiguousXmlReference"
---

# AmbiguousXmlReference

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class AmbiguousXmlReference : Exception, ISerializable, _Exception
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`Exception`](https://learn.microsoft.com/dotnet/api/system.exception) → `AmbiguousXmlReference`

## Construtores

### `AmbiguousXmlReference(string, IEnumerable<XmlElement>)` {#ctor-system-string-system-collections-generic-ienumerable-system-xml-xmlelement}

```csharp
public AmbiguousXmlReference(string referencedId, IEnumerable<XmlElement> matches)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `referencedId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `matches` | [`IEnumerable<XmlElement>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

## Propriedades

### `MatchedElements` {#matchedelements}

```csharp
public List<XmlElement> MatchedElements { get; }
```

**Retorno**

[`List<XmlElement>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `ReferencedId` {#referencedid}

```csharp
public string ReferencedId { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`GetBaseException()`](https://learn.microsoft.com/dotnet/api/system.exception.getbaseexception), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.exception.tostring), [`GetObjectData(SerializationInfo, StreamingContext)`](https://learn.microsoft.com/dotnet/api/system.exception.getobjectdata), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.exception.gettype), [`Message`](https://learn.microsoft.com/dotnet/api/system.exception.message), [`Data`](https://learn.microsoft.com/dotnet/api/system.exception.data), [`InnerException`](https://learn.microsoft.com/dotnet/api/system.exception.innerexception), [`TargetSite`](https://learn.microsoft.com/dotnet/api/system.exception.targetsite), [`StackTrace`](https://learn.microsoft.com/dotnet/api/system.exception.stacktrace), [`HelpLink`](https://learn.microsoft.com/dotnet/api/system.exception.helplink), [`Source`](https://learn.microsoft.com/dotnet/api/system.exception.source), [`HResult`](https://learn.microsoft.com/dotnet/api/system.exception.hresult), [`SerializeObjectState`](https://learn.microsoft.com/dotnet/api/system.exception.serializeobjectstate), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
