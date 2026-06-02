---
sidebar_label: "DetachedResourceXmlSigner"
---

# DetachedResourceXmlSigner

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

Provides methods for creating a XML signature of a detached resource

```csharp
public class DetachedResourceXmlSigner : XmlSigner
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`XmlSigner`](./XmlSigner.md) → `DetachedResourceXmlSigner`

## Construtores

### `DetachedResourceXmlSigner()` {#ctor}

```csharp
public DetachedResourceXmlSigner()
```

---

## Métodos

### `AddReferences(SignedXml, DigestAlgorithm, XmlPolicySpec)` {#addreferences-system-security-cryptography-xml-signedxml-lacuna-pki-digestalgorithm-lacuna-pki-xml-xmlpolicyspec}

```csharp
protected override void AddReferences(SignedXml signedXml, DigestAlgorithm digestAlgorithm, XmlPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signedXml` | [`SignedXml`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.xml.signedxml) |  |
| `digestAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |
| `policy` | [`XmlPolicySpec`](./XmlPolicySpec.md) |  |

---

### `GetToSignEntityTransferData()` {#gettosignentitytransferdata}

```csharp
protected override byte[] GetToSignEntityTransferData()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SetToSignDetachedResource(byte[], string)` {#settosigndetachedresource-system-byte-system-string}

Sets the detached resource to be signed

```csharp
public void SetToSignDetachedResource(byte[] content, string uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `uri` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetToSignEntityTransferData(byte[])` {#settosignentitytransferdata-system-byte}

```csharp
protected override void SetToSignEntityTransferData(byte[] transferData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `transferData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `VerifyParameters(bool)` {#verifyparameters-system-boolean}

```csharp
protected override void VerifyParameters(bool computeSignature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `computeSignature` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

## Membros herdados

[`xmlDocument`](./XmlSigner.md#xmldocument), [`namespaceMan`](./XmlSigner.md#namespaceman), [`SetXml(byte[])`](./XmlSigner.md#setxml-system-byte), [`SetXml(XmlDocument)`](./XmlSigner.md#setxml-system-xml-xmldocument), [`SetPolicy(XmlPolicySpec)`](./XmlSigner.md#setpolicy-lacuna-pki-xml-xmlpolicyspec), [`SetPolicy(IXmlPolicyMapper)`](./XmlSigner.md#setpolicy-lacuna-pki-xml-ixmlpolicymapper), [`SetSigningCertificate(PKCertificateWithKey)`](./XmlSigner.md#setsigningcertificate-lacuna-pki-pkcertificatewithkey), [`SetSigningCertificate(PKCertificate)`](./XmlSigner.md#setsigningcertificate-lacuna-pki-pkcertificate), [`SetSignatureElementLocation(string, NamespaceManager, XmlInsertionOptions)`](./XmlSigner.md#setsignatureelementlocation-system-string-lacuna-pki-xml-namespacemanager-lacuna-pki-xml-xmlinsertionoptions), [`SetSignatureElementId(string)`](./XmlSigner.md#setsignatureelementid-system-string), [`SetCommitmentType(CommitmentType)`](./XmlSigner.md#setcommitmenttype-lacuna-pki-commitmenttype), [`SetDataObjectFormat(string)`](./XmlSigner.md#setdataobjectformat-system-string), [`SetTimestampRequester(ITimestampRequester)`](./XmlSigner.md#settimestamprequester-lacuna-pki-itimestamprequester), [`SetClassicEnvelopedTransformation(bool)`](./XmlSigner.md#setclassicenvelopedtransformation-system-boolean), [`SetCertificateValidationConfigurator(Action<CertificateValidationOptions>)`](./XmlSigner.md#setcertificatevalidationconfigurator-system-action-lacuna-pki-certificatevalidationoptions), [`GenerateToSignHash(out SignatureAlgorithm, out byte[])`](./XmlSigner.md#generatetosignhash-lacuna-pki-signaturealgorithm-system-byte), [`SetPrecomputedSignature(byte[], byte[])`](./XmlSigner.md#setprecomputedsignature-system-byte-system-byte), [`ComputeSignature()`](./XmlSigner.md#computesignature), [`VerifySignerParameters(bool)`](./XmlSigner.md#verifysignerparameters-system-boolean), [`GetSignatureElement()`](./XmlSigner.md#getsignatureelement), [`GetSignedXml()`](./XmlSigner.md#getsignedxml), [`InsertSignatureElement()`](./XmlSigner.md#insertsignatureelement), [`InsertSignatureElement(XmlElement, string, XmlInsertionOptions)`](./XmlSigner.md#insertsignatureelement-system-xml-xmlelement-system-string-lacuna-pki-xml-xmlinsertionoptions), [`FulfillTransformations(Reference)`](./XmlSigner.md#fulfilltransformations-system-security-cryptography-xml-reference), [`Warnings`](./XmlSigner.md#warnings), [`ValidationResults`](./XmlSigner.md#validationresults), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
