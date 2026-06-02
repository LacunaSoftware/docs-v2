---
sidebar_label: "XmlSignatureFinisher"
---

# XmlSignatureFinisher

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class XmlSignatureFinisher : SignatureFinisher
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureFinisher`](./SignatureFinisher.md) → `XmlSignatureFinisher`

## Construtores

### `XmlSignatureFinisher(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public XmlSignatureFinisher(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Métodos

### `Finish()` {#finish}

```csharp
public override byte[] Finish()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `FinishAsync()` {#finishasync}

```csharp
public override Task<byte[]> FinishAsync()
```

**Retorno**

[`Task<byte[]>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `GetSignedXml()` {#getsignedxml}

```csharp
public byte[] GetSignedXml()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `WriteSignedXmlToFile(string)` {#writesignedxmltofile-system-string}

```csharp
public void WriteSignedXmlToFile(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Membros herdados

[`Client`](./SignatureFinisher.md#client), [`Done`](./SignatureFinisher.md#done), [`CallbackArgument`](./SignatureFinisher.md#callbackargument), [`CertificateInfo`](./SignatureFinisher.md#certificateinfo), [`SetToken(string)`](./SignatureFinisher.md#settoken-system-string), [`SetSignature(byte[])`](./SignatureFinisher.md#setsignature-system-byte), [`GetCallbackArgument()`](./SignatureFinisher.md#getcallbackargument), [`GetCertificateInfo()`](./SignatureFinisher.md#getcertificateinfo), [`Token`](./SignatureFinisher.md#token), [`Signature`](./SignatureFinisher.md#signature), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
