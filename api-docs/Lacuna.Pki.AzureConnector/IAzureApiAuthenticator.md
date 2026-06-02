---
sidebar_label: "IAzureApiAuthenticator"
---

# IAzureApiAuthenticator

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Interface_

```csharp
public interface IAzureApiAuthenticator
```

## Métodos

### `GetAccessTokenAsync(string, string, string)` {#getaccesstokenasync-system-string-system-string-system-string}

```csharp
Task<string> GetAccessTokenAsync(string authority, string resource, string scope)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `authority` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `resource` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `scope` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Task<string>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---
