---
sidebar_label: "PadesSignatureFinisher"
---

# PadesSignatureFinisher

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PadesSignatureFinisher : SignatureFinisher
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureFinisher`](./SignatureFinisher.md) → `PadesSignatureFinisher`

## Construtores

### `PadesSignatureFinisher(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public PadesSignatureFinisher(RestPkiClient client)
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

### `GetSignedPdf()` {#getsignedpdf}

```csharp
public byte[] GetSignedPdf()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `WriteSignedPdfToFile(string)` {#writesignedpdftofile-system-string}

```csharp
public void WriteSignedPdfToFile(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Membros herdados

[`Client`](./SignatureFinisher.md#client), [`Done`](./SignatureFinisher.md#done), [`CallbackArgument`](./SignatureFinisher.md#callbackargument), [`CertificateInfo`](./SignatureFinisher.md#certificateinfo), [`SetToken(string)`](./SignatureFinisher.md#settoken-system-string), [`SetSignature(byte[])`](./SignatureFinisher.md#setsignature-system-byte), [`GetCallbackArgument()`](./SignatureFinisher.md#getcallbackargument), [`GetCertificateInfo()`](./SignatureFinisher.md#getcertificateinfo), [`Token`](./SignatureFinisher.md#token), [`Signature`](./SignatureFinisher.md#signature), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
