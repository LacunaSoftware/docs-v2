---
sidebar_label: "XmlSignatureStarter"
---

# XmlSignatureStarter

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class XmlSignatureStarter : SignatureStarter
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureStarter`](./SignatureStarter.md) → `XmlSignatureStarter`

## Construtores

### `XmlSignatureStarter(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public XmlSignatureStarter(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Campos

### `InsertionOption` {#insertionoption}

```csharp
protected XmlInsertionOptions? InsertionOption
```

**Retorno**

`XmlInsertionOptions?`

---

### `Nsm` {#nsm}

```csharp
protected NamespaceManager Nsm
```

**Retorno**

[`NamespaceManager`](./NamespaceManager.md)

---

### `SignatureElementId` {#signatureelementid}

```csharp
protected string SignatureElementId
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Xml` {#xml}

```csharp
protected byte[] Xml
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `XPath` {#xpath}

```csharp
protected string XPath
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `SetSignatureElementId(string)` {#setsignatureelementid-system-string}

```csharp
public void SetSignatureElementId(string id)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `id` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetSignatureElementLocation(string, XmlInsertionOptions, NamespaceManager)` {#setsignatureelementlocation-system-string-lacuna-restpki-api-xmlsignature-xmlinsertionoptions-lacuna-restpki-client-namespacemanager}

```csharp
public void SetSignatureElementLocation(string xpath, XmlInsertionOptions insertionOption, NamespaceManager nsm = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xpath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `insertionOption` | `XmlInsertionOptions` |  |
| `nsm` | [`NamespaceManager`](./NamespaceManager.md) |  |

---

### `SetXml(byte[])` {#setxml-system-byte}

```csharp
public void SetXml(byte[] xmlDocumentBytes)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlDocumentBytes` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetXml(string)` {#setxml-system-string}

```csharp
public void SetXml(string XmlDocumentPath)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `XmlDocumentPath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Membros herdados

[`Client`](./SignatureStarter.md#client), [`Done`](./SignatureStarter.md#done), [`CertificateInfo`](./SignatureStarter.md#certificateinfo), [`SetSignerCertificate(byte[])`](./SignatureStarter.md#setsignercertificate-system-byte), [`SetSignaturePolicy(Guid)`](./SignatureStarter.md#setsignaturepolicy-system-guid), [`SetSecurityContext(Guid)`](./SignatureStarter.md#setsecuritycontext-system-guid), [`SetCallbackArgument(string)`](./SignatureStarter.md#setcallbackargument-system-string), [`GetCertificateInfo()`](./SignatureStarter.md#getcertificateinfo), [`StartAsync()`](./SignatureStarter.md#startasync), [`Start()`](./SignatureStarter.md#start), [`StartWithWebPkiAsync()`](./SignatureStarter.md#startwithwebpkiasync), [`StartWithWebPki()`](./SignatureStarter.md#startwithwebpki), [`SignerCertificate`](./SignatureStarter.md#signercertificate), [`SignaturePolicyId`](./SignatureStarter.md#signaturepolicyid), [`SecurityContextId`](./SignatureStarter.md#securitycontextid), [`CallbackArgument`](./SignatureStarter.md#callbackargument), [`IgnoreRevocationStatusUnknown`](./SignatureStarter.md#ignorerevocationstatusunknown), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
