---
sidebar_label: "SignedXmlInfo"
---

# SignedXmlInfo

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class SignedXmlInfo : BaseSignature
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`BaseSignature`](./BaseSignature.md) → `SignedXmlInfo`

## Construtores

### `SignedXmlInfo(RestPkiClient, XmlSignatureResponseModel)` {#ctor-lacuna-restpki-client-restpkiclient-lacuna-restpki-api-xmlsignature-xmlsignatureresponsemodel}

```csharp
public SignedXmlInfo(RestPkiClient client, XmlSignatureResponseModel model)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |
| `model` | `XmlSignatureResponseModel` |  |

---

## Propriedades

### `Signatures` {#signatures}

```csharp
public List<XmlSignature> Signatures { get; }
```

**Retorno**

[`List<XmlSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Membros herdados

[`BStamp`](./BaseSignature.md#bstamp), [`AuditPackage`](./BaseSignature.md#auditpackage), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
