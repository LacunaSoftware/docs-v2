---
sidebar_label: "AzureKeyProvider"
---

# AzureKeyProvider

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Class_

```csharp
public class AzureKeyProvider : IAzureKeyProvider
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AzureKeyProvider`

## Construtores

### `AzureKeyProvider(AzureKeyVaultOptions, IAzureApiAuthenticator)` {#ctor-lacuna-pki-azureconnector-azurekeyvaultoptions-lacuna-pki-azureconnector-iazureapiauthenticator}

```csharp
public AzureKeyProvider(AzureKeyVaultOptions options, IAzureApiAuthenticator azureApiAuthenticator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `options` | [`AzureKeyVaultOptions`](./AzureKeyVaultOptions.md) |  |
| `azureApiAuthenticator` | [`IAzureApiAuthenticator`](./IAzureApiAuthenticator.md) |  |

---

## Métodos

### `GetKeyAsync(string)` {#getkeyasync-system-string}

```csharp
public Task<AzureKey> GetKeyAsync(string keyName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `keyName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Task<AzureKey>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
