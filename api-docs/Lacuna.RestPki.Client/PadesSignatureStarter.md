---
sidebar_label: "PadesSignatureStarter"
---

# PadesSignatureStarter

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

Utility class to facilitate the startup of a PADeS signature process with Rest PKI

```csharp
public class PadesSignatureStarter : SignatureStarter
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureStarter`](./SignatureStarter.md) → `PadesSignatureStarter`

## Construtores

### `PadesSignatureStarter(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public PadesSignatureStarter(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Propriedades

### `BypassMarksIfSigned` {#bypassmarksifsigned}

```csharp
public bool BypassMarksIfSigned { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `CertificationLevel` {#certificationlevel}

```csharp
public PadesCertificationLevel CertificationLevel { get; set; }
```

**Retorno**

`PadesCertificationLevel`

---

### `CustomSignatureFieldName` {#customsignaturefieldname}

```csharp
public string CustomSignatureFieldName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `MeasurementUnits` {#measurementunits}

```csharp
public PadesMeasurementUnits MeasurementUnits { get; set; }
```

**Retorno**

`PadesMeasurementUnits`

---

### `PageOptimization` {#pageoptimization}

```csharp
public PadesPageOptimization PageOptimization { get; set; }
```

**Retorno**

[`PadesPageOptimization`](./PadesPageOptimization.md)

---

### `PdfMarks` {#pdfmarks}

```csharp
public List<PdfMark> PdfMarks { get; set; }
```

**Retorno**

[`List<PdfMark>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Reason` {#reason}

```csharp
public string Reason { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `VisualRepresentation` {#visualrepresentation}

```csharp
public PadesVisualRepresentation VisualRepresentation { get; set; }
```

**Retorno**

[`PadesVisualRepresentation`](./PadesVisualRepresentation.md)

---

## Métodos

### `SetPdfToSign(byte[])` {#setpdftosign-system-byte}

Sets the content to sign via a byte array

```csharp
public void SetPdfToSign(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The byte array representing the content to be signed |

---

### `SetPdfToSign(FileResult)` {#setpdftosign-lacuna-restpki-client-fileresult}

Sets the PDf to sign from a file result from a previous call to Rest PKI

```csharp
public void SetPdfToSign(FileResult pdf)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdf` | [`FileResult`](./FileResult.md) |  |

---

### `SetPdfToSign(Stream)` {#setpdftosign-system-io-stream}

Sets the content to sign via a stream object

```csharp
public void SetPdfToSign(Stream pdfStream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `pdfStream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | The stream representing thye content to be signed |

---

### `SetPdfToSign(string)` {#setpdftosign-system-string}

Sets the content to sign via a file path string

```csharp
public void SetPdfToSign(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The path where the file will be found |

**Exceções**

| Tipo | Condição |
|---|---|
| [`FileNotFoundException`](https://learn.microsoft.com/dotnet/api/system.io.filenotfoundexception) | In case a file cannot be found with the given path string |

---

### `SetVisualRepresentation(PadesVisualRepresentation)` {#setvisualrepresentation-lacuna-restpki-client-padesvisualrepresentation}

Indicates that the signature created with this starter will have a visual representation indicated by

```csharp
visualRepresentation
```

```csharp
public void SetVisualRepresentation(PadesVisualRepresentation visualRepresentation)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `visualRepresentation` | [`PadesVisualRepresentation`](./PadesVisualRepresentation.md) | The visual representation that should be added to the result pdf |

---

### `Start()` {#start}

Starts the signature without the web pki support

```csharp
public override ClientSideSignatureInstructions Start()
```

**Retorno**

[`ClientSideSignatureInstructions`](./ClientSideSignatureInstructions.md) — The instructions to proceed with the signature

---

### `StartAsync()` {#startasync}

Starts the signature without the web pki support

```csharp
public override Task<ClientSideSignatureInstructions> StartAsync()
```

**Retorno**

[`Task<ClientSideSignatureInstructions>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1) — The instructions to proceed with the signature

---

### `StartWithWebPki()` {#startwithwebpki}

Starts the signature leveraging the presence of the web pki

```csharp
public override string StartWithWebPki()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string) — The signature token

---

### `StartWithWebPkiAsync()` {#startwithwebpkiasync}

Starts the signature leveraging the presence of the web pki

```csharp
public override Task<string> StartWithWebPkiAsync()
```

**Retorno**

[`Task<string>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1) — The signature token

---

## Membros herdados

[`Client`](./SignatureStarter.md#client), [`Done`](./SignatureStarter.md#done), [`CertificateInfo`](./SignatureStarter.md#certificateinfo), [`SetSignerCertificate(byte[])`](./SignatureStarter.md#setsignercertificate-system-byte), [`SetSignaturePolicy(Guid)`](./SignatureStarter.md#setsignaturepolicy-system-guid), [`SetSecurityContext(Guid)`](./SignatureStarter.md#setsecuritycontext-system-guid), [`SetCallbackArgument(string)`](./SignatureStarter.md#setcallbackargument-system-string), [`GetCertificateInfo()`](./SignatureStarter.md#getcertificateinfo), [`SignerCertificate`](./SignatureStarter.md#signercertificate), [`SignaturePolicyId`](./SignatureStarter.md#signaturepolicyid), [`SecurityContextId`](./SignatureStarter.md#securitycontextid), [`CallbackArgument`](./SignatureStarter.md#callbackargument), [`IgnoreRevocationStatusUnknown`](./SignatureStarter.md#ignorerevocationstatusunknown), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
