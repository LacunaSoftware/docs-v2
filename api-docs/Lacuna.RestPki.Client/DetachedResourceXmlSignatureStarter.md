---
sidebar_label: "DetachedResourceXmlSignatureStarter"
---

# DetachedResourceXmlSignatureStarter

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class DetachedResourceXmlSignatureStarter : XmlSignatureStarter
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureStarter`](./SignatureStarter.md) → [`XmlSignatureStarter`](./XmlSignatureStarter.md) → `DetachedResourceXmlSignatureStarter`

## Construtores

### `DetachedResourceXmlSignatureStarter(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public DetachedResourceXmlSignatureStarter(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Métodos

### `SetToSignDetachedResource(byte[], string)` {#settosigndetachedresource-system-byte-system-string}

```csharp
public void SetToSignDetachedResource(byte[] content, string uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `uri` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetToSignDetachedResource(Stream, string)` {#settosigndetachedresource-system-io-stream-system-string}

```csharp
public void SetToSignDetachedResource(Stream contentStream, string uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `contentStream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |
| `uri` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetToSignDetachedResource(string, string)` {#settosigndetachedresource-system-string-system-string}

```csharp
public void SetToSignDetachedResource(string path, string uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `uri` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

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

[`Xml`](./XmlSignatureStarter.md#xml), [`XPath`](./XmlSignatureStarter.md#xpath), [`InsertionOption`](./XmlSignatureStarter.md#insertionoption), [`SignatureElementId`](./XmlSignatureStarter.md#signatureelementid), [`Nsm`](./XmlSignatureStarter.md#nsm), [`SetXml(byte[])`](./XmlSignatureStarter.md#setxml-system-byte), [`SetXml(string)`](./XmlSignatureStarter.md#setxml-system-string), [`SetSignatureElementLocation(string, XmlInsertionOptions, NamespaceManager)`](./XmlSignatureStarter.md#setsignatureelementlocation-system-string-lacuna-restpki-api-xmlsignature-xmlinsertionoptions-lacuna-restpki-client-namespacemanager), [`SetSignatureElementId(string)`](./XmlSignatureStarter.md#setsignatureelementid-system-string), [`Client`](./SignatureStarter.md#client), [`Done`](./SignatureStarter.md#done), [`CertificateInfo`](./SignatureStarter.md#certificateinfo), [`SetSignerCertificate(byte[])`](./SignatureStarter.md#setsignercertificate-system-byte), [`SetSignaturePolicy(Guid)`](./SignatureStarter.md#setsignaturepolicy-system-guid), [`SetSecurityContext(Guid)`](./SignatureStarter.md#setsecuritycontext-system-guid), [`SetCallbackArgument(string)`](./SignatureStarter.md#setcallbackargument-system-string), [`GetCertificateInfo()`](./SignatureStarter.md#getcertificateinfo), [`SignerCertificate`](./SignatureStarter.md#signercertificate), [`SignaturePolicyId`](./SignatureStarter.md#signaturepolicyid), [`SecurityContextId`](./SignatureStarter.md#securitycontextid), [`CallbackArgument`](./SignatureStarter.md#callbackargument), [`IgnoreRevocationStatusUnknown`](./SignatureStarter.md#ignorerevocationstatusunknown), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
