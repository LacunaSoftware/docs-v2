---
sidebar_label: "RestPkiClient"
---

# RestPkiClient

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class RestPkiClient : IRestExceptionBuilderPortable, IRestExceptionBuilder
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `RestPkiClient`

## Construtores

### `RestPkiClient(string, string, NameValueCollection)` {#ctor-system-string-system-string-system-collections-specialized-namevaluecollection}

```csharp
public RestPkiClient(string endpointUrl, string authToken, NameValueCollection requestTags)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `endpointUrl` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `authToken` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `requestTags` | [`NameValueCollection`](https://learn.microsoft.com/dotnet/api/system.collections.specialized.namevaluecollection) |  |

---

### `RestPkiClient(string, string)` {#ctor-system-string-system-string}

```csharp
public RestPkiClient(string endpointUrl, string authToken)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `endpointUrl` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `authToken` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Propriedades

### `AuthToken` {#authtoken}

```csharp
public string AuthToken { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `EndpointUri` {#endpointuri}

```csharp
public Uri EndpointUri { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `MultipartUploadDoubleCheck` {#multipartuploaddoublecheck}

```csharp
public bool MultipartUploadDoubleCheck { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `MultipartUploadThreshold` {#multipartuploadthreshold}

```csharp
public int MultipartUploadThreshold { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `RestPkiVersion` {#restpkiversion}

```csharp
public Version RestPkiVersion { get; set; }
```

**Retorno**

[`Version`](https://learn.microsoft.com/dotnet/api/system.version)

---

## Métodos

### `BuildException(HttpMethod, Uri, HttpResponsePortable)` {#buildexception-system-net-http-httpmethod-system-uri-lacuna-restclient-httpresponseportable}

```csharp
public Exception BuildException(HttpMethod verb, Uri uri, HttpResponsePortable response)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `verb` | [`HttpMethod`](https://learn.microsoft.com/dotnet/api/system.net.http.httpmethod) |  |
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `response` | `HttpResponsePortable` |  |

**Retorno**

[`Exception`](https://learn.microsoft.com/dotnet/api/system.exception)

---

### `BuildExceptionAsync(HttpMethod, Uri, HttpContent)` {#buildexceptionasync-system-net-http-httpmethod-system-uri-system-net-http-httpcontent}

```csharp
public Task<Exception> BuildExceptionAsync(HttpMethod verb, Uri uri, HttpContent content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `verb` | [`HttpMethod`](https://learn.microsoft.com/dotnet/api/system.net.http.httpmethod) |  |
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `content` | [`HttpContent`](https://learn.microsoft.com/dotnet/api/system.net.http.httpcontent) |  |

**Retorno**

[`Task<Exception>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `CertificateExplorer()` {#certificateexplorer}

```csharp
public CertificateExplorer CertificateExplorer()
```

**Retorno**

[`CertificateExplorer`](./CertificateExplorer.md)

---

### `GetAuthentication()` {#getauthentication}

```csharp
public Authentication GetAuthentication()
```

**Retorno**

[`Authentication`](./Authentication.md)

---

### `GetCadesSignatureExplorer()` {#getcadessignatureexplorer}

```csharp
public CadesSignatureExplorer GetCadesSignatureExplorer()
```

**Retorno**

[`CadesSignatureExplorer`](./CadesSignatureExplorer.md)

---

### `GetCadesSignatureFinisher()` {#getcadessignaturefinisher}

```csharp
public CadesSignatureFinisher GetCadesSignatureFinisher()
```

**Retorno**

[`CadesSignatureFinisher`](./CadesSignatureFinisher.md)

---

### `GetCadesSignatureStarter()` {#getcadessignaturestarter}

```csharp
public CadesSignatureStarter GetCadesSignatureStarter()
```

**Retorno**

[`CadesSignatureStarter`](./CadesSignatureStarter.md)

---

### `GetPadesSignatureExplorer()` {#getpadessignatureexplorer}

```csharp
public PadesSignatureExplorer GetPadesSignatureExplorer()
```

**Retorno**

[`PadesSignatureExplorer`](./PadesSignatureExplorer.md)

---

### `GetPadesSignatureFinisher()` {#getpadessignaturefinisher}

```csharp
public PadesSignatureFinisher GetPadesSignatureFinisher()
```

**Retorno**

[`PadesSignatureFinisher`](./PadesSignatureFinisher.md)

---

### `GetPadesSignatureStarter()` {#getpadessignaturestarter}

```csharp
public PadesSignatureStarter GetPadesSignatureStarter()
```

**Retorno**

[`PadesSignatureStarter`](./PadesSignatureStarter.md)

---

### `GetPkiBrazilTimestamper()` {#getpkibraziltimestamper}

```csharp
public Timestamper GetPkiBrazilTimestamper()
```

**Retorno**

[`Timestamper`](./Timestamper.md)

---

### `UploadFile(byte[])` {#uploadfile-system-byte}

```csharp
public BlobReference UploadFile(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`BlobReference`](./BlobReference.md)

---

### `UploadFile(Stream)` {#uploadfile-system-io-stream}

```csharp
public BlobReference UploadFile(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

**Retorno**

[`BlobReference`](./BlobReference.md)

---

### `UploadFile(string)` {#uploadfile-system-string}

```csharp
public BlobReference UploadFile(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`BlobReference`](./BlobReference.md)

---

### `UploadFileAsync(byte[])` {#uploadfileasync-system-byte}

```csharp
public Task<BlobReference> UploadFileAsync(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Task<BlobReference>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `UploadFileAsync(Stream)` {#uploadfileasync-system-io-stream}

```csharp
public Task<BlobReference> UploadFileAsync(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

**Retorno**

[`Task<BlobReference>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `UploadFileAsync(string)` {#uploadfileasync-system-string}

```csharp
public Task<BlobReference> UploadFileAsync(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Task<BlobReference>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
