---
sidebar_label: "CadesSignatureStarter"
---

# CadesSignatureStarter

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class CadesSignatureStarter : SignatureStarter
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureStarter`](./SignatureStarter.md) → `CadesSignatureStarter`

## Construtores

### `CadesSignatureStarter(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public CadesSignatureStarter(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Propriedades

### `DigestAlgorithmsForDetachedSignature` {#digestalgorithmsfordetachedsignature}

```csharp
public List<DigestAlgorithm> DigestAlgorithmsForDetachedSignature { get; set; }
```

**Retorno**

[`List<DigestAlgorithm>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `EncapsulateContent` {#encapsulatecontent}

```csharp
public bool? EncapsulateContent { get; set; }
```

**Retorno**

[`bool?`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `SetCmsToCoSign(byte[])` {#setcmstocosign-system-byte}

```csharp
public void SetCmsToCoSign(byte[] cmsToCoSign)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `cmsToCoSign` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetCmsToCoSign(FileResult)` {#setcmstocosign-lacuna-restpki-client-fileresult}

```csharp
public void SetCmsToCoSign(FileResult fileResult)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `fileResult` | [`FileResult`](./FileResult.md) |  |

---

### `SetCmsToCoSign(Stream)` {#setcmstocosign-system-io-stream}

```csharp
public void SetCmsToCoSign(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `SetCmsToCoSign(string)` {#setcmstocosign-system-string}

```csharp
public void SetCmsToCoSign(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetContentToSign(byte[])` {#setcontenttosign-system-byte}

```csharp
public void SetContentToSign(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetContentToSign(Stream)` {#setcontenttosign-system-io-stream}

```csharp
public void SetContentToSign(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `SetEncapsulateContent(bool?)` {#setencapsulatecontent-system-nullable-system-boolean}

```csharp
public void SetEncapsulateContent(bool? encapsulateContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `encapsulateContent` | [`bool?`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `SetFileToSign(string)` {#setfiletosign-system-string}

```csharp
public void SetFileToSign(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `Start()` {#start}

```csharp
public override ClientSideSignatureInstructions Start()
```

**Retorno**

[`ClientSideSignatureInstructions`](./ClientSideSignatureInstructions.md)

---

### `StartAsync()` {#startasync}

```csharp
public override Task<ClientSideSignatureInstructions> StartAsync()
```

**Retorno**

[`Task<ClientSideSignatureInstructions>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `StartWithWebPki()` {#startwithwebpki}

```csharp
public override string StartWithWebPki()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StartWithWebPkiAsync()` {#startwithwebpkiasync}

```csharp
public override Task<string> StartWithWebPkiAsync()
```

**Retorno**

[`Task<string>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`Client`](./SignatureStarter.md#client), [`Done`](./SignatureStarter.md#done), [`CertificateInfo`](./SignatureStarter.md#certificateinfo), [`SetSignerCertificate(byte[])`](./SignatureStarter.md#setsignercertificate-system-byte), [`SetSignaturePolicy(Guid)`](./SignatureStarter.md#setsignaturepolicy-system-guid), [`SetSecurityContext(Guid)`](./SignatureStarter.md#setsecuritycontext-system-guid), [`SetCallbackArgument(string)`](./SignatureStarter.md#setcallbackargument-system-string), [`GetCertificateInfo()`](./SignatureStarter.md#getcertificateinfo), [`SignerCertificate`](./SignatureStarter.md#signercertificate), [`SignaturePolicyId`](./SignatureStarter.md#signaturepolicyid), [`SecurityContextId`](./SignatureStarter.md#securitycontextid), [`CallbackArgument`](./SignatureStarter.md#callbackargument), [`IgnoreRevocationStatusUnknown`](./SignatureStarter.md#ignorerevocationstatusunknown), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
