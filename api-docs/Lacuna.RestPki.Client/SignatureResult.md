---
sidebar_label: "SignatureResult"
---

# SignatureResult

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class SignatureResult : FileResult
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`FileResult`](./FileResult.md) → `SignatureResult`

## Propriedades

### `CallbackArgument` {#callbackargument}

```csharp
public string CallbackArgument { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Certificate` {#certificate}

```csharp
public PKCertificate Certificate { get; }
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

## Membros herdados

[`OpenReadAsync()`](./FileResult.md#openreadasync), [`OpenRead()`](./FileResult.md#openread), [`WriteToAsync(Stream)`](./FileResult.md#writetoasync-system-io-stream), [`WriteTo(Stream)`](./FileResult.md#writeto-system-io-stream), [`WriteToFileAsync(string)`](./FileResult.md#writetofileasync-system-string), [`WriteToFile(string)`](./FileResult.md#writetofile-system-string), [`GetContentAsync()`](./FileResult.md#getcontentasync), [`GetContent()`](./FileResult.md#getcontent), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
