---
sidebar_label: "SignatureExplorer"
---

# SignatureExplorer

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class SignatureExplorer
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignatureExplorer`

## Construtores

### `SignatureExplorer(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public SignatureExplorer(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Campos

### `Client` {#client}

```csharp
protected RestPkiClient Client
```

**Retorno**

[`RestPkiClient`](./RestPkiClient.md)

---

## Propriedades

### `AcceptableExplicitPolicies` {#acceptableexplicitpolicies}

List of explicit policies that should be accepted when validating signatures with a explicit validation policy attribute.
If a signature being validated has an explicit validation policy attribute which is not among the values passed, then the
policy specified in DefaultSignaturePolicyId is used. In order to accept only the given list of explicit policies, omit
the value DefaultSignaturePolicyId.

```csharp
public SignaturePolicyCatalog AcceptableExplicitPolicies { get; set; }
```

**Retorno**

[`SignaturePolicyCatalog`](./SignaturePolicyCatalog.md)

---

### `DefaultSignaturePolicyId` {#defaultsignaturepolicyid}

Default signature policy to be used to validate signature. This value is used to validate signatures without an
explicit validation policy attribute and also signatures with an explicit validation policy attribute that is not
among the policies specified in AcceptableExplicitPolicies. In order to accept only a certain list of explicit
policies, this value should be omitted.

```csharp
public Guid? DefaultSignaturePolicyId { get; set; }
```

**Retorno**

[`Guid?`](https://learn.microsoft.com/dotnet/api/system.guid)

---

### `IgnoreRevocationStatusUnknown` {#ignorerevocationstatusunknown}

Whether validation errors due to the revocation status of a certificate being
unknown should be ignored. Defaults to false.

```csharp
public bool IgnoreRevocationStatusUnknown { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `SecurityContextId` {#securitycontextid}

```csharp
public Guid? SecurityContextId { get; set; }
```

**Retorno**

[`Guid?`](https://learn.microsoft.com/dotnet/api/system.guid)

---

### `TrustUncertifiedSigningTime` {#trustuncertifiedsigningtime}

```csharp
public bool TrustUncertifiedSigningTime { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Validate` {#validate}

```csharp
public bool Validate { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `FillRequest(OpenSignatureRequestModel)` {#fillrequest-lacuna-restpki-api-signature-opensignaturerequestmodel}

```csharp
protected virtual OpenSignatureRequestModel FillRequest(OpenSignatureRequestModel request)
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
protected virtual Task<OpenSignatureRequestModel> FillRequestAsync(OpenSignatureRequestModel request)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `request` | `OpenSignatureRequestModel` |  |

**Retorno**

[`Task<OpenSignatureRequestModel>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `SetSignatureFile(BlobReference)` {#setsignaturefile-lacuna-restpki-client-blobreference}

```csharp
public void SetSignatureFile(BlobReference fileBlob)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `fileBlob` | [`BlobReference`](./BlobReference.md) |  |

---

### `SetSignatureFile(byte[])` {#setsignaturefile-system-byte}

```csharp
public void SetSignatureFile(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetSignatureFile(FileResult)` {#setsignaturefile-lacuna-restpki-client-fileresult}

```csharp
public void SetSignatureFile(FileResult fileResult)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `fileResult` | [`FileResult`](./FileResult.md) |  |

---

### `SetSignatureFile(Stream)` {#setsignaturefile-system-io-stream}

```csharp
public void SetSignatureFile(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `SetSignatureFile(string)` {#setsignaturefile-system-string}

```csharp
public void SetSignatureFile(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
