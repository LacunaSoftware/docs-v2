---
sidebar_label: "CadesSignatureExplorer"
---

# CadesSignatureExplorer

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class CadesSignatureExplorer : SignatureExplorer2<CadesSignature>
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureExplorer`](./SignatureExplorer.md) → [`SignatureExplorer2`](./SignatureExplorer2.md) → `SignatureExplorer2<CadesSignature>` → `CadesSignatureExplorer`

## Construtores

### `CadesSignatureExplorer(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public CadesSignatureExplorer(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Métodos

### `Open()` {#open}

```csharp
public override CadesSignature Open()
```

**Retorno**

[`CadesSignature`](./CadesSignature.md)

---

### `OpenAndExtractContent()` {#openandextractcontent}

```csharp
public CadesSignatureWithEncapsulatedContent OpenAndExtractContent()
```

**Retorno**

[`CadesSignatureWithEncapsulatedContent`](./CadesSignatureWithEncapsulatedContent.md)

---

### `OpenAndExtractContentAsync()` {#openandextractcontentasync}

```csharp
public Task<CadesSignatureWithEncapsulatedContent> OpenAndExtractContentAsync()
```

**Retorno**

[`Task<CadesSignatureWithEncapsulatedContent>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `OpenAsync()` {#openasync}

```csharp
public override Task<CadesSignature> OpenAsync()
```

**Retorno**

[`Task<CadesSignature>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `SetDataFile(byte[])` {#setdatafile-system-byte}

```csharp
public void SetDataFile(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetDataFile(Stream)` {#setdatafile-system-io-stream}

```csharp
public void SetDataFile(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `SetDataFile(string)` {#setdatafile-system-string}

```csharp
public void SetDataFile(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Membros herdados

[`FillRequest(OpenSignatureRequestModel)`](./SignatureExplorer2.md#fillrequest-lacuna-restpki-api-signature-opensignaturerequestmodel), [`FillRequestAsync(OpenSignatureRequestModel)`](./SignatureExplorer2.md#fillrequestasync-lacuna-restpki-api-signature-opensignaturerequestmodel), [`CheckCompatibility()`](./SignatureExplorer2.md#checkcompatibility), [`CheckCompatibilityAsync()`](./SignatureExplorer2.md#checkcompatibilityasync), [`GenerateAuditPackage`](./SignatureExplorer2.md#generateauditpackage), [`IncludeSignedFileInAuditPackage`](./SignatureExplorer2.md#includesignedfileinauditpackage), [`Client`](./SignatureExplorer.md#client), [`SetSignatureFile(Stream)`](./SignatureExplorer.md#setsignaturefile-system-io-stream), [`SetSignatureFile(string)`](./SignatureExplorer.md#setsignaturefile-system-string), [`SetSignatureFile(byte[])`](./SignatureExplorer.md#setsignaturefile-system-byte), [`SetSignatureFile(FileResult)`](./SignatureExplorer.md#setsignaturefile-lacuna-restpki-client-fileresult), [`SetSignatureFile(BlobReference)`](./SignatureExplorer.md#setsignaturefile-lacuna-restpki-client-blobreference), [`Validate`](./SignatureExplorer.md#validate), [`DefaultSignaturePolicyId`](./SignatureExplorer.md#defaultsignaturepolicyid), [`AcceptableExplicitPolicies`](./SignatureExplorer.md#acceptableexplicitpolicies), [`SecurityContextId`](./SignatureExplorer.md#securitycontextid), [`IgnoreRevocationStatusUnknown`](./SignatureExplorer.md#ignorerevocationstatusunknown), [`TrustUncertifiedSigningTime`](./SignatureExplorer.md#trustuncertifiedsigningtime), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
