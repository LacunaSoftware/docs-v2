---
sidebar_label: "AzureCertificateProvider"
---

# AzureCertificateProvider

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Class_

```csharp
public class AzureCertificateProvider : IAzureCertificateProvider
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AzureCertificateProvider`

## Construtores

### `AzureCertificateProvider(AzureKeyVaultOptions, IAzureApiAuthenticator)` {#ctor-lacuna-pki-azureconnector-azurekeyvaultoptions-lacuna-pki-azureconnector-iazureapiauthenticator}

```csharp
public AzureCertificateProvider(AzureKeyVaultOptions options, IAzureApiAuthenticator azureApiAuthenticator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `options` | [`AzureKeyVaultOptions`](./AzureKeyVaultOptions.md) |  |
| `azureApiAuthenticator` | [`IAzureApiAuthenticator`](./IAzureApiAuthenticator.md) |  |

---

## Métodos

### `GetCertificateWithKeyAsync(string)` {#getcertificatewithkeyasync-system-string}

```csharp
public Task<PKCertificateWithKey> GetCertificateWithKeyAsync(string certificateName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificateName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`Task<PKCertificateWithKey>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
