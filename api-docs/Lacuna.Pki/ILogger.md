---
sidebar_label: "ILogger"
---

# ILogger

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface ILogger
```

## Métodos

### `Flush()` {#flush}

```csharp
void Flush()
```

---

### `Log(LogLevels, string, string)` {#log-lacuna-pki-loglevels-system-string-system-string}

```csharp
void Log(LogLevels level, string message, string source)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `level` | [`LogLevels`](./LogLevels.md) |  |
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `source` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---
