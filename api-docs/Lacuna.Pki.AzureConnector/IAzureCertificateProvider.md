---
sidebar_label: "IAzureCertificateProvider"
---

# IAzureCertificateProvider

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Interface_

```csharp
public interface IAzureCertificateProvider
```

## Métodos

### `GetCertificateWithKeyAsync(string)` {#getcertificatewithkeyasync-system-string}

```csharp
Task<PKCertificateWithKey> GetCertificateWithKeyAsync(string certificateName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificateName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Task<PKCertificateWithKey>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---
