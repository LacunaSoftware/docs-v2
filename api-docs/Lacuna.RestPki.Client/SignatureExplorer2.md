---
sidebar_label: "SignatureExplorer2"
---

# SignatureExplorer2

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class SignatureExplorer2 : SignatureExplorer
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureExplorer`](./SignatureExplorer.md) → `SignatureExplorer2`

## Construtores

### `SignatureExplorer2(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public SignatureExplorer2(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Propriedades

### `GenerateAuditPackage` {#generateauditpackage}

```csharp
public bool GenerateAuditPackage { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IncludeSignedFileInAuditPackage` {#includesignedfileinauditpackage}

```csharp
public bool IncludeSignedFileInAuditPackage { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `CheckCompatibility()` {#checkcompatibility}

```csharp
protected void CheckCompatibility()
```

---

### `CheckCompatibilityAsync()` {#checkcompatibilityasync}

```csharp
protected Task CheckCompatibilityAsync()
```

**Retorno**

[`Task`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task)

---

### `FillRequest(OpenSignatureRequestModel)` {#fillrequest-lacuna-restpki-api-signature-opensignaturerequestmodel}

```csharp
protected override OpenSignatureRequestModel FillRequest(OpenSignatureRequestModel request)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `request` | `OpenSignatureRequestModel` |  |

**Retorno**

`OpenSignatureRequestModel`

---

### `FillRequestAsync(OpenSignatureRequestModel)` {#fillrequestasync-lacuna-restpki-api-signature-opensignaturerequestmodel}

```csharp
protected override Task<OpenSignatureRequestModel> FillRequestAsync(OpenSignatureRequestModel request)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `request` | `OpenSignatureRequestModel` |  |

**Retorno**

[`Task<OpenSignatureRequestModel>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`Client`](./SignatureExplorer.md#client), [`SetSignatureFile(Stream)`](./SignatureExplorer.md#setsignaturefile-system-io-stream), [`SetSignatureFile(string)`](./SignatureExplorer.md#setsignaturefile-system-string), [`SetSignatureFile(byte[])`](./SignatureExplorer.md#setsignaturefile-system-byte), [`SetSignatureFile(FileResult)`](./SignatureExplorer.md#setsignaturefile-lacuna-restpki-client-fileresult), [`SetSignatureFile(BlobReference)`](./SignatureExplorer.md#setsignaturefile-lacuna-restpki-client-blobreference), [`Validate`](./SignatureExplorer.md#validate), [`DefaultSignaturePolicyId`](./SignatureExplorer.md#defaultsignaturepolicyid), [`AcceptableExplicitPolicies`](./SignatureExplorer.md#acceptableexplicitpolicies), [`SecurityContextId`](./SignatureExplorer.md#securitycontextid), [`IgnoreRevocationStatusUnknown`](./SignatureExplorer.md#ignorerevocationstatusunknown), [`TrustUncertifiedSigningTime`](./SignatureExplorer.md#trustuncertifiedsigningtime), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
