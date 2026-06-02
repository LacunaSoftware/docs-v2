---
sidebar_label: "CadesSigner"
---

# CadesSigner

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for creating CAdES signatures

```csharp
public class CadesSigner : IDisposable
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesSigner`

## Construtores

### `CadesSigner()` {#ctor}

```csharp
public CadesSigner()
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

### `Warnings` {#warnings}

```csharp
public List<string> Warnings { get; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `AddAttributeCertificate(AttributeCertificate)` {#addattributecertificate-lacuna-pki-attributecertificate}

Adds attribute certificates in the signed attributes

```csharp
public void AddAttributeCertificate(AttributeCertificate attributeCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `attributeCertificate` | [`AttributeCertificate`](../Lacuna.Pki/AttributeCertificate.md) | Certificate attribute |

---

### `AddAttributeCertificate(IEnumerable<AttributeCertificate>)` {#addattributecertificate-system-collections-generic-ienumerable-lacuna-pki-attributecertificate}

Adds attribute certificates in the signed attributes

```csharp
public void AddAttributeCertificate(IEnumerable<AttributeCertificate> attributeCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `attributeCertificate` | [`IEnumerable<AttributeCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | Certificate attribute |

---

### `ComputeSignature()` {#computesignature}

Computes the CAdES signature elements. Call after all parameters set

```csharp
public void ComputeSignature()
```

---

### `Dispose()` {#dispose}

Disposes streams used

```csharp
public void Dispose()
```

---

### `GenerateToSignBytes(out SignatureAlgorithm)` {#generatetosignbytes-lacuna-pki-signaturealgorithm}

Generates the bytes to be signed

```csharp
public byte[] GenerateToSignBytes(out SignatureAlgorithm signatureAlg)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlg` | [`SignatureAlgorithm`](../Lacuna.Pki/SignatureAlgorithm.md) | Signature algorithm to be used |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — To sign bytes

---

### `GetSignature()` {#getsignature}

Gets the completed signature content

```csharp
public byte[] GetSignature()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetSignatureFinisher()` {#getsignaturefinisher}

Gets the signature finisher. Used in a three-step signature

```csharp
public CadesSignatureFinisher GetSignatureFinisher()
```

**Retorno**

[`CadesSignatureFinisher`](./CadesSignatureFinisher.md) — Signature finisher. An element that will handle the timestamps and revocation elements of the signature

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

### `SetContentType(CmsContentType)` {#setcontenttype-lacuna-pki-cmscontenttype}

Sets the encapsulated content type of the SignedData. Note: only use this if you are not signing a Data type

```csharp
public void SetContentType(CmsContentType contentType)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `contentType` | [`CmsContentType`](../Lacuna.Pki/CmsContentType.md) |  |

---

### `SetCrlStore(IReferencedCrlStore)` {#setcrlstore-lacuna-pki-stores-ireferencedcrlstore}

Sets a trusted CRL store indexed by CRL digest values.

```csharp
public void SetCrlStore(IReferencedCrlStore crlStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `crlStore` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) | CRL store |

---

### `SetDataDigestToSign(DigestAlgorithm, byte[])` {#setdatadigesttosign-lacuna-pki-digestalgorithm-system-byte}

Sets the message digest that is going to be signed. Using this method instead of SetDataToSign will mandatorily result in a detached signature, without encapsulated content.

```csharp
public void SetDataDigestToSign(DigestAlgorithm digestAlgorithm, byte[] digestValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |
| `digestValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetDataToSign(byte[])` {#setdatatosign-system-byte}

Sets the data content that is going to be signed

```csharp
public void SetDataToSign(byte[] data)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `data` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The data content bytes to be signed |

---

### `SetDataToSign(Stream)` {#setdatatosign-system-io-stream}

Sets the data that is going to be signed

```csharp
public void SetDataToSign(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `SetEncapsulatedContent(bool)` {#setencapsulatedcontent-system-boolean}

Wheter or not to include the encapsulated content in the signature. If not set, default value is true

```csharp
public void SetEncapsulatedContent(bool includeEncapsulatedContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `includeEncapsulatedContent` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `SetFinishSignature(bool)` {#setfinishsignature-system-boolean}

Sets if the signature will be closed after the signing process ends. Default is true. Set false if it is a three-step signature

```csharp
public void SetFinishSignature(bool finishSignature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `finishSignature` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `SetPolicy(CadesPolicySpec)` {#setpolicy-lacuna-pki-cades-cadespolicyspec}

Sets the signature policy specification

```csharp
public void SetPolicy(CadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) | Policy specification |

---

### `SetPolicy(ICadesPolicyMapper)` {#setpolicy-lacuna-pki-cades-icadespolicymapper}

Sets a policy specification mapper

```csharp
public void SetPolicy(ICadesPolicyMapper policyMapper)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`ICadesPolicyMapper`](./ICadesPolicyMapper.md) | Policy mapper |

---

### `SetPrecomputedSignature(byte[], byte[])` {#setprecomputedsignature-system-byte-system-byte}

Sets the signed bytes from the client. Used in a two-step signature

```csharp
public void SetPrecomputedSignature(byte[] signature, byte[] toSignBytes)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Signed bytes |
| `toSignBytes` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | To sign bytes used in the signing process |

---

### `SetPrecomputedSignature(byte[])` {#setprecomputedsignature-system-byte}

Sets the signed bytes from the client. Used in a two-step signature

```csharp
public void SetPrecomputedSignature(byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Signed bytes |

---

### `SetSignatureToCoSign(byte[])` {#setsignaturetocosign-system-byte}

Sets the signature to create a co-signature

```csharp
public bool SetSignatureToCoSign(byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Signature content bytes |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `SetSignatureToCoSign(Stream)` {#setsignaturetocosign-system-io-stream}

Sets the signature to create a co-signature

```csharp
public bool SetSignatureToCoSign(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | Signature stream |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `SetSigningCertificate(PKCertificate)` {#setsigningcertificate-lacuna-pki-pkcertificate}

Sets the signing certificate. Used in a two-step signature

```csharp
public void SetSigningCertificate(PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) | Certificate |

---

### `SetSigningCertificate(PKCertificateWithKey)` {#setsigningcertificate-lacuna-pki-pkcertificatewithkey}

Sets the signing certificate with private key. Used in a one-step signature

```csharp
public void SetSigningCertificate(PKCertificateWithKey certWithKey)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certWithKey` | [`PKCertificateWithKey`](../Lacuna.Pki/PKCertificateWithKey.md) | Certificate with private key |

---

### `SetSigningDescription(string)` {#setsigningdescription-system-string}

Sets a custom text describing the signing operation. If set, it will be inlcuded as
a signingDescription signed attribute

```csharp
public void SetSigningDescription(string description)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `description` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetTimestampRequester(ITimestampRequester)` {#settimestamprequester-lacuna-pki-itimestamprequester}

Sets a timestamp requester. Must be set if the policy specification requires any type of timestamp attribute

```csharp
public void SetTimestampRequester(ITimestampRequester tsRequester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tsRequester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) | Timestamp requester |

---

### `VerifyParameters(bool)` {#verifyparameters-system-boolean}

Verifies if CadesSigner necessary parameters are set. If not, throws Exception.

```csharp
public void VerifyParameters(bool computingSignature = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `computingSignature` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) | Whether or not you will call the ComputeSignature() method to complete the siganture process in this step. |

---

### `WriteSignature(Stream)` {#writesignature-system-io-stream}

Writes the completed signature content to a stream

```csharp
public void WriteSignature(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | Stream |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
