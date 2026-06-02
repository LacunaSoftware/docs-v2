---
sidebar_label: "IAzureKeyProvider"
---

# IAzureKeyProvider

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Interface_

```csharp
public interface IAzureKeyProvider
```

## Métodos

### `GetKeyAsync(string)` {#getkeyasync-system-string}

```csharp
Task<AzureKey> GetKeyAsync(string keyName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `keyName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Task<AzureKey>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---
