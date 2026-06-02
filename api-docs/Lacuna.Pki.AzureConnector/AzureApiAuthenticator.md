---
sidebar_label: "AzureApiAuthenticator"
---

# AzureApiAuthenticator

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Class_

```csharp
public class AzureApiAuthenticator : IAzureApiAuthenticator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AzureApiAuthenticator`

## Construtores

### `AzureApiAuthenticator(AzureKeyVaultOptions)` {#ctor-lacuna-pki-azureconnector-azurekeyvaultoptions}

```csharp
public AzureApiAuthenticator(AzureKeyVaultOptions options)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `options` | [`AzureKeyVaultOptions`](./AzureKeyVaultOptions.md) |  |

---

## Métodos

### `GetAccessTokenAsync(string, string, string)` {#getaccesstokenasync-system-string-system-string-system-string}

```csharp
public Task<string> GetAccessTokenAsync(string authority, string resource, string scope)
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

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
