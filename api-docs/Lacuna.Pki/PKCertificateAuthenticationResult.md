---
sidebar_label: "PKCertificateAuthenticationResult"
---

# PKCertificateAuthenticationResult

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PKCertificateAuthenticationResult
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PKCertificateAuthenticationResult`

## Construtores

### `PKCertificateAuthenticationResult(ValidationResults, PKCertificate)` {#ctor-lacuna-pki-validationresults-lacuna-pki-pkcertificate}

```csharp
public PKCertificateAuthenticationResult(ValidationResults validationResults, PKCertificate certificate = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `validationResults` | [`ValidationResults`](./ValidationResults.md) |  |
| `certificate` | [`PKCertificate`](./PKCertificate.md) |  |

---

## Propriedades

### `Certificate` {#certificate}

```csharp
public PKCertificate Certificate { get; }
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `ValidationResults` {#validationresults}

```csharp
public ValidationResults ValidationResults { get; }
```

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
