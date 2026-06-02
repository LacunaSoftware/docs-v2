---
sidebar_label: "XmlSigner"
---

# XmlSigner

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class XmlSigner
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlSigner`

## Construtores

### `XmlSigner()` {#ctor}

```csharp
public XmlSigner()
```

---

## Campos

### `namespaceMan` {#namespaceman}

```csharp
protected NamespaceManager namespaceMan
```

**Retorno**

[`NamespaceManager`](./NamespaceManager.md)

---

### `xmlDocument` {#xmldocument}

```csharp
protected XmlDocument xmlDocument
```

**Retorno**

[`XmlDocument`](https://learn.microsoft.com/dotnet/api/system.xml.xmldocument)

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

### `AddReferences(SignedXml, DigestAlgorithm, XmlPolicySpec)` {#addreferences-system-security-cryptography-xml-signedxml-lacuna-pki-digestalgorithm-lacuna-pki-xml-xmlpolicyspec}

```csharp
protected abstract void AddReferences(SignedXml signedXml, DigestAlgorithm digestAlgorithm, XmlPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signedXml` | [`SignedXml`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.xml.signedxml) |  |
| `digestAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |
| `policy` | [`XmlPolicySpec`](./XmlPolicySpec.md) |  |

---

### `ComputeSignature()` {#computesignature}

Computes the XML signature

```csharp
public void ComputeSignature()
```

---

### `FulfillTransformations(Reference)` {#fulfilltransformations-system-security-cryptography-xml-reference}

```csharp
protected void FulfillTransformations(Reference reference)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `reference` | [`Reference`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.xml.reference) |  |

---

### `GenerateToSignHash(out SignatureAlgorithm, out byte[])` {#generatetosignhash-lacuna-pki-signaturealgorithm-system-byte}

Generates the hash to be signed by the user in an asynchronous signature. In the next step, in possesion of the signed hash and the persisted transferData, you must call the SetPrecomputedSignature method

```csharp
public byte[] GenerateToSignHash(out SignatureAlgorithm signatureAlgorithm, out byte[] transferData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlgorithm` | [`SignatureAlgorithm`](../Lacuna.Pki/SignatureAlgorithm.md) | The signature algorithm to be used in the user signature |
| `transferData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The data to be persisted until the next step |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The hash to be signed by the user

---

### `GetSignatureElement()` {#getsignatureelement}

Returns the computed XML signature element only

```csharp
public XmlElement GetSignatureElement()
```

**Retorno**

[`XmlElement`](https://learn.microsoft.com/dotnet/api/system.xml.xmlelement)

---

### `GetSignedXml()` {#getsignedxml}

Returns the XML document containing the computed signature element

```csharp
public byte[] GetSignedXml()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — XML document bytes

---

### `GetToSignEntityTransferData()` {#gettosignentitytransferdata}

```csharp
protected abstract byte[] GetToSignEntityTransferData()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `InsertSignatureElement()` {#insertsignatureelement}

Inserts the computed signature element in the XML document

```csharp
public virtual void InsertSignatureElement()
```

---

### `InsertSignatureElement(XmlElement, string, XmlInsertionOptions)` {#insertsignatureelement-system-xml-xmlelement-system-string-lacuna-pki-xml-xmlinsertionoptions}

```csharp
protected virtual void InsertSignatureElement(XmlElement signatureElement, string xpath, XmlInsertionOptions insertionOption)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureElement` | [`XmlElement`](https://learn.microsoft.com/dotnet/api/system.xml.xmlelement) |  |
| `xpath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `insertionOption` | [`XmlInsertionOptions`](./XmlInsertionOptions.md) |  |

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

### `SetClassicEnvelopedTransformation(bool)` {#setclassicenvelopedtransformation-system-boolean}

Sets whether or not to use classic enveloped transformation on enveloped signatures.
By default XML Signers adds an XPath transformation along with enveloped transformation, which allows
multiple new signatures to the XML. Case true, the default XPath transformation is not included,
therefore, adding new signatures to the XML is not allowed and will break previous signatures validation.

```csharp
public void SetClassicEnvelopedTransformation(bool useClassicEnveloped)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `useClassicEnveloped` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `SetCommitmentType(CommitmentType)` {#setcommitmenttype-lacuna-pki-commitmenttype}

Sets the signer commitment type signed attribute for all signed data. If executing a remote signature, the commitment type
must be passed again in the compute signature step

```csharp
public void SetCommitmentType(CommitmentType commitmentType)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `commitmentType` | [`CommitmentType`](../Lacuna.Pki/CommitmentType.md) |  |

---

### `SetDataObjectFormat(string)` {#setdataobjectformat-system-string}

Sets a custom text describing the signing operation. If set, it will be inlcuded as
a DataObjectFormat signed data property

```csharp
public void SetDataObjectFormat(string description)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `description` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetPolicy(IXmlPolicyMapper)` {#setpolicy-lacuna-pki-xml-ixmlpolicymapper}

Sets the XML signature policy mapper

```csharp
public void SetPolicy(IXmlPolicyMapper policyMapper)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`IXmlPolicyMapper`](./IXmlPolicyMapper.md) |  |

---

### `SetPolicy(XmlPolicySpec)` {#setpolicy-lacuna-pki-xml-xmlpolicyspec}

Sets the XML signature policy

```csharp
public void SetPolicy(XmlPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`XmlPolicySpec`](./XmlPolicySpec.md) |  |

---

### `SetPrecomputedSignature(byte[], byte[])` {#setprecomputedsignature-system-byte-system-byte}

Sets the precomputed signture and persisted data in an asynchronous signature

```csharp
public void SetPrecomputedSignature(byte[] signature, byte[] transferData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The user signature of the hash given by the method GenerateToSignHash |
| `transferData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The data given by the method GenerateToSignHash |

---

### `SetSignatureElementId(string)` {#setsignatureelementid-system-string}

Sets the computed signature element ID

```csharp
public void SetSignatureElementId(string id)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `id` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetSignatureElementLocation(string, NamespaceManager, XmlInsertionOptions)` {#setsignatureelementlocation-system-string-lacuna-pki-xml-namespacemanager-lacuna-pki-xml-xmlinsertionoptions}

Sets the location of the computed signature element to be inserted in the XML document

```csharp
public void SetSignatureElementLocation(string xpath, NamespaceManager namespaceMan, XmlInsertionOptions insertionOption)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xpath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The xpath to select the target element which the insertion will be related to. If null, XML root element will be selected. |
| `namespaceMan` | [`NamespaceManager`](./NamespaceManager.md) | The namespaces and prefixes of the XML used in the xpath |
| `insertionOption` | [`XmlInsertionOptions`](./XmlInsertionOptions.md) | The insertion option that will be applied over the target element define by xpath |

---

### `SetSigningCertificate(PKCertificate)` {#setsigningcertificate-lacuna-pki-pkcertificate}

Sets the signing certificate. Used in an asynchronous signature

```csharp
public void SetSigningCertificate(PKCertificate signingCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signingCertificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) |  |

---

### `SetSigningCertificate(PKCertificateWithKey)` {#setsigningcertificate-lacuna-pki-pkcertificatewithkey}

Sets the signing certificate with private key. Used in a synchronous signature

```csharp
public void SetSigningCertificate(PKCertificateWithKey signingCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signingCertificate` | [`PKCertificateWithKey`](../Lacuna.Pki/PKCertificateWithKey.md) |  |

---

### `SetTimestampRequester(ITimestampRequester)` {#settimestamprequester-lacuna-pki-itimestamprequester}

Sets a timestamp requester. Must be set if the policy specification requires any type of timestamp

```csharp
public void SetTimestampRequester(ITimestampRequester timestampRequester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `timestampRequester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |

---

### `SetToSignEntityTransferData(byte[])` {#settosignentitytransferdata-system-byte}

```csharp
protected abstract void SetToSignEntityTransferData(byte[] transferData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `transferData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetXml(byte[])` {#setxml-system-byte}

Sets the XML document bytes

```csharp
public void SetXml(byte[] xmlDocumentBytes)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlDocumentBytes` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | XML document bytes |

---

### `SetXml(XmlDocument)` {#setxml-system-xml-xmldocument}

Sets the XML document

```csharp
public void SetXml(XmlDocument xmlDoc)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlDoc` | [`XmlDocument`](https://learn.microsoft.com/dotnet/api/system.xml.xmldocument) | XML document |

---

### `VerifyParameters(bool)` {#verifyparameters-system-boolean}

```csharp
protected virtual void VerifyParameters(bool computeSignature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `computeSignature` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `VerifySignerParameters(bool)` {#verifysignerparameters-system-boolean}

Verifies if the Xml signer necessary parameters are set. If not, throws Exception.

```csharp
public void VerifySignerParameters(bool computingSignature = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `computingSignature` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) | Whether or not you will call the ComputeSignature() method to complete the siganture process in this step. |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
