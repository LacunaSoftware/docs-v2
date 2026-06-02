---
sidebar_label: "CadesSignatureEditor"
---

# CadesSignatureEditor

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for editing a Cades Signature

```csharp
public class CadesSignatureEditor
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesSignatureEditor`

## Propriedades

### `Signature` {#signature}

```csharp
public CadesSignature Signature { get; }
```

**Retorno**

[`CadesSignature`](./CadesSignature.md)

---

## Métodos

### `AddArchiveTimestamp(CadesSignerInfo, ITimestampRequester, CadesPolicySpec, IReferencedCrlStore)` {#addarchivetimestamp-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester-lacuna-pki-cades-cadespolicyspec-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public void AddArchiveTimestamp(CadesSignerInfo signerInfo, ITimestampRequester requester, CadesPolicySpec policy, IReferencedCrlStore store)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |
| `store` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

---

### `AddArchiveTimestamp(CadesSignerInfo, ITimestampRequester, CadesPolicySpec)` {#addarchivetimestamp-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester-lacuna-pki-cades-cadespolicyspec}

```csharp
public void AddArchiveTimestamp(CadesSignerInfo signerInfo, ITimestampRequester requester, CadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |

---

### `AddCadesCTimestamp(CadesSignerInfo, ITimestampRequester, CadesPolicySpec, IReferencedCrlStore)` {#addcadesctimestamp-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester-lacuna-pki-cades-cadespolicyspec-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public void AddCadesCTimestamp(CadesSignerInfo signerInfo, ITimestampRequester requester, CadesPolicySpec policy, IReferencedCrlStore store)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |
| `store` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

---

### `AddCadesCTimestamp(CadesSignerInfo, ITimestampRequester, CadesPolicySpec)` {#addcadesctimestamp-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester-lacuna-pki-cades-cadespolicyspec}

```csharp
public void AddCadesCTimestamp(CadesSignerInfo signerInfo, ITimestampRequester requester, CadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |

---

### `AddCadesCTimestamp(CadesSignerInfo, ITimestampRequester)` {#addcadesctimestamp-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester}

```csharp
public void AddCadesCTimestamp(CadesSignerInfo signerInfo, ITimestampRequester requester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |

---

### `AddCertCrlTimestampReferences(CadesSignerInfo, ITimestampRequester, CadesPolicySpec)` {#addcertcrltimestampreferences-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester-lacuna-pki-cades-cadespolicyspec}

```csharp
public void AddCertCrlTimestampReferences(CadesSignerInfo signerInfo, ITimestampRequester requester, CadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |

---

### `AddCertCrlTimestampReferences(CadesSignerInfo, ITimestampRequester)` {#addcertcrltimestampreferences-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester}

```csharp
public void AddCertCrlTimestampReferences(CadesSignerInfo signerInfo, ITimestampRequester requester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |

---

### `AddCertificates(IEnumerable<PKCertificate>)` {#addcertificates-system-collections-generic-ienumerable-lacuna-pki-pkcertificate}

```csharp
public void AddCertificates(IEnumerable<PKCertificate> certificates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `AddCrl(IEnumerable<Crl>)` {#addcrl-system-collections-generic-ienumerable-lacuna-pki-crl}

```csharp
public void AddCrl(IEnumerable<Crl> crls)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `crls` | [`IEnumerable<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `AddEncapsulatedContent(byte[])` {#addencapsulatedcontent-system-byte}

```csharp
public void AddEncapsulatedContent(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `AddEncapsulatedContent(CadesSignature, byte[], bool)` {#addencapsulatedcontent-lacuna-pki-cades-cadessignature-system-byte-system-boolean}

```csharp
public static byte[] AddEncapsulatedContent(CadesSignature signature, byte[] encapsulatedContent, bool bypassDigestVerifcation = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`CadesSignature`](./CadesSignature.md) |  |
| `encapsulatedContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `bypassDigestVerifcation` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `AddEncapsulatedContent(Stream)` {#addencapsulatedcontent-system-io-stream}

```csharp
public void AddEncapsulatedContent(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `AddSignatureTimestamp(CadesSignerInfo, ITimestampRequester, CadesPolicySpec, IReferencedCrlStore)` {#addsignaturetimestamp-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester-lacuna-pki-cades-cadespolicyspec-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public void AddSignatureTimestamp(CadesSignerInfo signerInfo, ITimestampRequester requester, CadesPolicySpec policy, IReferencedCrlStore store)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |
| `store` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

---

### `AddSignatureTimestamp(CadesSignerInfo, ITimestampRequester, CadesPolicySpec)` {#addsignaturetimestamp-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester-lacuna-pki-cades-cadespolicyspec}

```csharp
public void AddSignatureTimestamp(CadesSignerInfo signerInfo, ITimestampRequester requester, CadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |

---

### `AddSignatureTimestamp(CadesSignerInfo, ITimestampRequester)` {#addsignaturetimestamp-lacuna-pki-cades-cadessignerinfo-lacuna-pki-itimestamprequester}

```csharp
public void AddSignatureTimestamp(CadesSignerInfo signerInfo, ITimestampRequester requester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `requester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |

---

### `AdjustReferencesAndValues(CadesSignerInfo, CadesPolicySpec, IReferencedCrlStore)` {#adjustreferencesandvalues-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-cadespolicyspec-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public void AdjustReferencesAndValues(CadesSignerInfo signerInfo, CadesPolicySpec policy, IReferencedCrlStore store)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |
| `store` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

---

### `AdjustReferencesAndValues(CadesSignerInfo, CadesPolicySpec)` {#adjustreferencesandvalues-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-cadespolicyspec}

```csharp
public void AdjustReferencesAndValues(CadesSignerInfo signerInfo, CadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |

---

### `GetSignature()` {#getsignature}

```csharp
public CadesSignature GetSignature()
```

**Retorno**

[`CadesSignature`](./CadesSignature.md)

---

### `GetSignature(Stream)` {#getsignature-system-io-stream}

```csharp
public void GetSignature(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `GetSignatureEncoded()` {#getsignatureencoded}

Get the signature bytes with current editions applied

```csharp
public byte[] GetSignatureEncoded()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — Edited signature bytes

---

### `MergeSignatures(IEnumerable<CadesSignature>, byte[])` {#mergesignatures-system-collections-generic-ienumerable-lacuna-pki-cades-cadessignature-system-byte}

```csharp
public static byte[] MergeSignatures(IEnumerable<CadesSignature> signatures, byte[] encapsulatedContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatures` | [`IEnumerable<CadesSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `encapsulatedContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `MergeSignatures(IEnumerable<CadesSignature>)` {#mergesignatures-system-collections-generic-ienumerable-lacuna-pki-cades-cadessignature}

```csharp
public static byte[] MergeSignatures(IEnumerable<CadesSignature> signatures)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatures` | [`IEnumerable<CadesSignature>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `MergeSignatures(params CadesSignature[])` {#mergesignatures-lacuna-pki-cades-cadessignature}

```csharp
public static byte[] MergeSignatures(params CadesSignature[] signatures)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatures` | `CadesSignature[]` |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Open(byte[])` {#open-system-byte}

```csharp
public static CadesSignatureEditor Open(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`CadesSignatureEditor`](./CadesSignatureEditor.md)

---

### `Open(CadesSignature)` {#open-lacuna-pki-cades-cadessignature}

```csharp
public static CadesSignatureEditor Open(CadesSignature signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`CadesSignature`](./CadesSignature.md) |  |

**Retorno**

[`CadesSignatureEditor`](./CadesSignatureEditor.md)

---

### `Open(Stream)` {#open-system-io-stream}

```csharp
public static CadesSignatureEditor Open(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

**Retorno**

[`CadesSignatureEditor`](./CadesSignatureEditor.md)

---

### `Open(string)` {#open-system-string}

```csharp
public static CadesSignatureEditor Open(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`CadesSignatureEditor`](./CadesSignatureEditor.md)

---

### `RemoveAllRevocationValues()` {#removeallrevocationvalues}

```csharp
public List<Crl> RemoveAllRevocationValues()
```

**Retorno**

[`List<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `RemoveCertificates()` {#removecertificates}

```csharp
public List<PKCertificate> RemoveCertificates()
```

**Retorno**

[`List<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `RemoveCrls()` {#removecrls}

```csharp
public List<Crl> RemoveCrls()
```

**Retorno**

[`List<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `RemoveEncapsulatedContent()` {#removeencapsulatedcontent}

```csharp
public byte[] RemoveEncapsulatedContent()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `RemoveRevocationValues(CadesSignerInfo)` {#removerevocationvalues-lacuna-pki-cades-cadessignerinfo}

```csharp
public List<Crl> RemoveRevocationValues(CadesSignerInfo signer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signer` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |

**Retorno**

[`List<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `RemoveUnsignedAttributes(CadesSignerInfo)` {#removeunsignedattributes-lacuna-pki-cades-cadessignerinfo}

```csharp
public void RemoveUnsignedAttributes(CadesSignerInfo signerInfo)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |

---

### `SplitSignature(byte[])` {#splitsignature-system-byte}

Splits the signature into signatures for each signer-info.

```csharp
public static Dictionary<CadesSignerInfo, byte[]> SplitSignature(byte[] signatureContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Dictionary<CadesSignerInfo, byte[]>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2) — A dictionary with the signer-info and its split signature

---

### `SplitSignature(CadesSignature)` {#splitsignature-lacuna-pki-cades-cadessignature}

Splits the signature into signatures for each signer-info.

```csharp
public static Dictionary<CadesSignerInfo, byte[]> SplitSignature(CadesSignature signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`CadesSignature`](./CadesSignature.md) |  |

**Retorno**

[`Dictionary<CadesSignerInfo, byte[]>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2) — A dictionary with the signer-info and its split signature

---

### `UpdateReferencesAndValues(CadesSignerInfo, IEnumerable<Certificate>, IEnumerable<UsedRevocationValues>, DigestAlgorithm)` {#updatereferencesandvalues-lacuna-pki-cades-cadessignerinfo-system-collections-generic-ienumerable-lacuna-pki-certificate-system-collections-generic-ienumerable-lacuna-pki-usedrevocationvalues-lacuna-pki-digestalgorithm}

```csharp
public void UpdateReferencesAndValues(CadesSignerInfo signerInfo, IEnumerable<Certificate> caCertificates, IEnumerable<UsedRevocationValues> revocationValues, DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `caCertificates` | [`IEnumerable<Certificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `revocationValues` | [`IEnumerable<UsedRevocationValues>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |
| `digestAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |

---

### `UpdateReferencesAndValues(CadesSignerInfo, ValidationResults, DigestAlgorithm)` {#updatereferencesandvalues-lacuna-pki-cades-cadessignerinfo-lacuna-pki-validationresults-lacuna-pki-digestalgorithm}

```csharp
public void UpdateReferencesAndValues(CadesSignerInfo signerInfo, ValidationResults validationResults, DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signerInfo` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |
| `validationResults` | [`ValidationResults`](../Lacuna.Pki/ValidationResults.md) |  |
| `digestAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
