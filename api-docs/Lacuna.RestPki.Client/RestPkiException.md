---
sidebar_label: "RestPkiException"
---

# RestPkiException

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class RestPkiException : RestException
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `RestPkiException`

## Construtores

### `RestPkiException(HttpMethod, Uri, ErrorCodes, string)` {#ctor-system-net-http-httpmethod-system-uri-lacuna-restpki-api-errorcodes-system-string}

```csharp
[Obsolete("Use RestPkiException(HttpMethod, Uri, ErrorModel) instead")]
public RestPkiException(HttpMethod verb, Uri uri, ErrorCodes errorCode, string detail = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `verb` | [`HttpMethod`](https://learn.microsoft.com/dotnet/api/system.net.http.httpmethod) |  |
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `errorCode` | `ErrorCodes` |  |
| `detail` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `RestPkiException(HttpMethod, Uri, ErrorModel)` {#ctor-system-net-http-httpmethod-system-uri-lacuna-restpki-api-errormodel}

```csharp
public RestPkiException(HttpMethod verb, Uri uri, ErrorModel errorModel)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `verb` | [`HttpMethod`](https://learn.microsoft.com/dotnet/api/system.net.http.httpmethod) |  |
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `errorModel` | `ErrorModel` |  |

---

## Propriedades

### `Detail` {#detail}

```csharp
public string Detail { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `ErrorCode` {#errorcode}

```csharp
public ErrorCodes ErrorCode { get; }
```

**Retorno**

`ErrorCodes`

---

### `ErrorCodeStr` {#errorcodestr}

```csharp
public string ErrorCodeStr { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---
