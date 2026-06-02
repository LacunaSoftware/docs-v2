---
sidebar_label: "PadesSigner"
---

# PadesSigner

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for creating PAdES signatures

```csharp
public class PadesSigner
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesSigner`

## Construtores

### `PadesSigner()` {#ctor}

```csharp
public PadesSigner()
```

---

## Propriedades

### `ValidationResults` {#validationresults}

```csharp
public ValidationResults ValidationResults { get; }
```

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

## Métodos

### `AddAttributeCertificate(AttributeCertificate)` {#addattributecertificate-lacuna-pki-attributecertificate}

```csharp
public void AddAttributeCertificate(AttributeCertificate attributeCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `attributeCertificate` | [`AttributeCertificate`](../Lacuna.Pki/AttributeCertificate.md) |  |

---

### `AddMetadata(string, string)` {#addmetadata-system-string-system-string}

Adds a PDF metdata key and value

```csharp
public void AddMetadata(string key, string value)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `key` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Metadata key |
| `value` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Metadata value |

---

### `ComputeSignature()` {#computesignature}

```csharp
public void ComputeSignature()
```

---

### `GetPadesSignature()` {#getpadessignature}

```csharp
public byte[] GetPadesSignature()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetToSignBytes(out SignatureAlgorithm, out byte[])` {#gettosignbytes-lacuna-pki-signaturealgorithm-system-byte}

```csharp
public byte[] GetToSignBytes(out SignatureAlgorithm signatureAlgorithm, out byte[] transferData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](../Lacuna.Pki/SignatureAlgorithm.md) |  |
| `transferData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SetCertificateStore(ICertificateStore)` {#setcertificatestore-lacuna-pki-stores-icertificatestore}

```csharp
public void SetCertificateStore(ICertificateStore certStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certStore` | [`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) |  |

---

### `SetCertificateValidationConfigurator(Action<CertificateValidationOptions>)` {#setcertificatevalidationconfigurator-system-action-lacuna-pki-certificatevalidationoptions}

Sets an action for configuring the signer certificate validation

```csharp
public void SetCertificateValidationConfigurator(Action<CertificateValidationOptions> configureCertificateValidation)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `configureCertificateValidation` | [`Action<CertificateValidationOptions>`](https://learn.microsoft.com/dotnet/api/system.action-1) |  |

---

### `SetCertificationLevel(PadesCertificationLevel)` {#setcertificationlevel-lacuna-pki-pades-padescertificationlevel}

```csharp
public void SetCertificationLevel(PadesCertificationLevel certLevel)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certLevel` | [`PadesCertificationLevel`](./PadesCertificationLevel.md) |  |

---

### `SetCommitmentType(CommitmentType)` {#setcommitmenttype-lacuna-pki-commitmenttype}

Sets the signer commitment type signed attribute

```csharp
public void SetCommitmentType(CommitmentType commitmentType)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `commitmentType` | [`CommitmentType`](../Lacuna.Pki/CommitmentType.md) |  |

---

### `SetCustomSignatureFieldName(string)` {#setcustomsignaturefieldname-system-string}

(Optional) Sets a custom signature unique field name. Default is "SignatureX" where X is incremental on each signer starting at 1.

```csharp
public void SetCustomSignatureFieldName(string name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetLocation(string)` {#setlocation-system-string}

(Optional) Sets the PDF signing location. The CPU host name or physical location of the signing.

```csharp
public void SetLocation(string location)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `location` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetPdfToSign(byte[])` {#setpdftosign-system-byte}

```csharp
public void SetPdfToSign(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetPdfToSign(Stream)` {#setpdftosign-system-io-stream}

```csharp
public void SetPdfToSign(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `SetPdfToSign(string)` {#setpdftosign-system-string}

```csharp
public void SetPdfToSign(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetPolicy(IPadesPolicyMapper)` {#setpolicy-lacuna-pki-pades-ipadespolicymapper}

```csharp
public void SetPolicy(IPadesPolicyMapper mapper)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `mapper` | [`IPadesPolicyMapper`](./IPadesPolicyMapper.md) |  |

---

### `SetPolicy(PadesPolicySpec)` {#setpolicy-lacuna-pki-pades-padespolicyspec}

```csharp
public void SetPolicy(PadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) |  |

---

### `SetPreComputedSignature(byte[], byte[])` {#setprecomputedsignature-system-byte-system-byte}

Sets pre-computed signature from the client. Used in a remote key signature

```csharp
public void SetPreComputedSignature(byte[] signature, byte[] padesTransferData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `padesTransferData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetReason(string)` {#setreason-system-string}

(Optional) Sets the PDF signing reason field

```csharp
public void SetReason(string reason)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `reason` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetSignerName(string)` {#setsignername-system-string}

(Optional) Sets the PDF signer name.
PDF 32000-1:2008: The name of the person or authority signing the document.
This value should be used ONLY WHEN it is not possible to extract the name from the signature (From the certificate of the signer.)

```csharp
public void SetSignerName(string name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetSigningCertificate(PKCertificate)` {#setsigningcertificate-lacuna-pki-pkcertificate}

```csharp
public void SetSigningCertificate(PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) |  |

---

### `SetSigningCertificate(PKCertificateWithKey)` {#setsigningcertificate-lacuna-pki-pkcertificatewithkey}

```csharp
public void SetSigningCertificate(PKCertificateWithKey certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificateWithKey`](../Lacuna.Pki/PKCertificateWithKey.md) |  |

---

### `SetTimestampRequester(ITimestampRequester)` {#settimestamprequester-lacuna-pki-itimestamprequester}

```csharp
public void SetTimestampRequester(ITimestampRequester tsRequester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tsRequester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |

---

### `SetUseRandomAccessArrayMethod(bool)` {#setuserandomaccessarraymethod-system-boolean}

Use in case of huge PDF files passed as byte array

```csharp
public void SetUseRandomAccessArrayMethod(bool useRandomAccessMethod)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `useRandomAccessMethod` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `SetVisualRepresentation(PadesVisualRepresentation)` {#setvisualrepresentation-lacuna-pki-pades-padesvisualrepresentation}

```csharp
[Obsolete("Use SetVisualRepresentation(PadesVisualSignature2 visualRepresentation) instead")]
public void SetVisualRepresentation(PadesVisualRepresentation visualRepresentation)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `visualRepresentation` | [`PadesVisualRepresentation`](./PadesVisualRepresentation.md) |  |

---

### `SetVisualRepresentation(PadesVisualRepresentation2)` {#setvisualrepresentation-lacuna-pki-pades-padesvisualrepresentation2}

```csharp
public void SetVisualRepresentation(PadesVisualRepresentation2 visualRepresentation)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `visualRepresentation` | [`PadesVisualRepresentation2`](./PadesVisualRepresentation2.md) |  |

---

### `VerifyParameters(bool)` {#verifyparameters-system-boolean}

Verifies if PadesSigner necessary parameters are set. If not, throws Exception.

```csharp
public void VerifyParameters(bool computingSignature = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `computingSignature` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) | Whether or not you will call the ComputeSignature() method to complete the siganture process in this step. |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
