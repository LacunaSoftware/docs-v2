---
sidebar_label: "XmlSignatureExplorer"
---

# XmlSignatureExplorer

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class XmlSignatureExplorer : SignatureExplorer
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureExplorer`](./SignatureExplorer.md) → `XmlSignatureExplorer`

## Construtores

### `XmlSignatureExplorer(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public XmlSignatureExplorer(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Propriedades

### `IdResolutionTable` {#idresolutiontable}

```csharp
public XmlIdResolutionTable IdResolutionTable { get; set; }
```

**Retorno**

[`XmlIdResolutionTable`](./XmlIdResolutionTable.md)

---

## Métodos

### `Open()` {#open}

```csharp
public List<XmlSignature> Open()
```

**Retorno**

[`List<XmlSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `OpenAsync()` {#openasync}

```csharp
public Task<List<XmlSignature>> OpenAsync()
```

**Retorno**

[`Task<List<XmlSignature>>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`Client`](./SignatureExplorer.md#client), [`SetSignatureFile(Stream)`](./SignatureExplorer.md#setsignaturefile-system-io-stream), [`SetSignatureFile(string)`](./SignatureExplorer.md#setsignaturefile-system-string), [`SetSignatureFile(byte[])`](./SignatureExplorer.md#setsignaturefile-system-byte), [`SetSignatureFile(FileResult)`](./SignatureExplorer.md#setsignaturefile-lacuna-restpki-client-fileresult), [`SetSignatureFile(BlobReference)`](./SignatureExplorer.md#setsignaturefile-lacuna-restpki-client-blobreference), [`FillRequestAsync(OpenSignatureRequestModel)`](./SignatureExplorer.md#fillrequestasync-lacuna-restpki-api-signature-opensignaturerequestmodel), [`FillRequest(OpenSignatureRequestModel)`](./SignatureExplorer.md#fillrequest-lacuna-restpki-api-signature-opensignaturerequestmodel), [`Validate`](./SignatureExplorer.md#validate), [`DefaultSignaturePolicyId`](./SignatureExplorer.md#defaultsignaturepolicyid), [`AcceptableExplicitPolicies`](./SignatureExplorer.md#acceptableexplicitpolicies), [`SecurityContextId`](./SignatureExplorer.md#securitycontextid), [`IgnoreRevocationStatusUnknown`](./SignatureExplorer.md#ignorerevocationstatusunknown), [`TrustUncertifiedSigningTime`](./SignatureExplorer.md#trustuncertifiedsigningtime), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
