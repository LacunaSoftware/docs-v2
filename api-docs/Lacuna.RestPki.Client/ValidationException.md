---
sidebar_label: "ValidationException"
---

# ValidationException

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class ValidationException : RestException
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ValidationException`

## Construtores

### `ValidationException(HttpMethod, Uri, ValidationResults)` {#ctor-system-net-http-httpmethod-system-uri-lacuna-restpki-client-validationresults}

```csharp
public ValidationException(HttpMethod verb, Uri uri, ValidationResults vr)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `verb` | [`HttpMethod`](https://learn.microsoft.com/dotnet/api/system.net.http.httpmethod) |  |
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `vr` | [`ValidationResults`](./ValidationResults.md) |  |

---

## Propriedades

### `ValidationResults` {#validationresults}

```csharp
public ValidationResults ValidationResults { get; }
```

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---
