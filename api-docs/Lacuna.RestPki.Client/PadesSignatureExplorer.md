---
sidebar_label: "PadesSignatureExplorer"
---

# PadesSignatureExplorer

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PadesSignatureExplorer : SignatureExplorer2<PadesSignature>
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureExplorer`](./SignatureExplorer.md) → [`SignatureExplorer2`](./SignatureExplorer2.md) → `SignatureExplorer2<PadesSignature>` → `PadesSignatureExplorer`

## Construtores

### `PadesSignatureExplorer(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public PadesSignatureExplorer(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Métodos

### `Open()` {#open}

```csharp
public override PadesSignature Open()
```

**Retorno**

[`PadesSignature`](./PadesSignature.md)

---

### `OpenAsync()` {#openasync}

```csharp
public override Task<PadesSignature> OpenAsync()
```

**Retorno**

[`Task<PadesSignature>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`FillRequest(OpenSignatureRequestModel)`](./SignatureExplorer2.md#fillrequest-lacuna-restpki-api-signature-opensignaturerequestmodel), [`FillRequestAsync(OpenSignatureRequestModel)`](./SignatureExplorer2.md#fillrequestasync-lacuna-restpki-api-signature-opensignaturerequestmodel), [`CheckCompatibility()`](./SignatureExplorer2.md#checkcompatibility), [`CheckCompatibilityAsync()`](./SignatureExplorer2.md#checkcompatibilityasync), [`GenerateAuditPackage`](./SignatureExplorer2.md#generateauditpackage), [`IncludeSignedFileInAuditPackage`](./SignatureExplorer2.md#includesignedfileinauditpackage), [`Client`](./SignatureExplorer.md#client), [`SetSignatureFile(Stream)`](./SignatureExplorer.md#setsignaturefile-system-io-stream), [`SetSignatureFile(string)`](./SignatureExplorer.md#setsignaturefile-system-string), [`SetSignatureFile(byte[])`](./SignatureExplorer.md#setsignaturefile-system-byte), [`SetSignatureFile(FileResult)`](./SignatureExplorer.md#setsignaturefile-lacuna-restpki-client-fileresult), [`SetSignatureFile(BlobReference)`](./SignatureExplorer.md#setsignaturefile-lacuna-restpki-client-blobreference), [`Validate`](./SignatureExplorer.md#validate), [`DefaultSignaturePolicyId`](./SignatureExplorer.md#defaultsignaturepolicyid), [`AcceptableExplicitPolicies`](./SignatureExplorer.md#acceptableexplicitpolicies), [`SecurityContextId`](./SignatureExplorer.md#securitycontextid), [`IgnoreRevocationStatusUnknown`](./SignatureExplorer.md#ignorerevocationstatusunknown), [`TrustUncertifiedSigningTime`](./SignatureExplorer.md#trustuncertifiedsigningtime), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
