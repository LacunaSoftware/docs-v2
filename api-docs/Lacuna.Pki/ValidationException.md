---
sidebar_label: "ValidationException"
---

# ValidationException

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class ValidationException : Exception, ISerializable, _Exception
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`Exception`](https://learn.microsoft.com/dotnet/api/system.exception) → `ValidationException`

## Construtores

### `ValidationException(ValidationResults)` {#ctor-lacuna-pki-validationresults}

```csharp
public ValidationException(ValidationResults vr)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
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

## Membros herdados

[`GetBaseException()`](https://learn.microsoft.com/dotnet/api/system.exception.getbaseexception), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.exception.tostring), [`GetObjectData(SerializationInfo, StreamingContext)`](https://learn.microsoft.com/dotnet/api/system.exception.getobjectdata), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.exception.gettype), [`Message`](https://learn.microsoft.com/dotnet/api/system.exception.message), [`Data`](https://learn.microsoft.com/dotnet/api/system.exception.data), [`InnerException`](https://learn.microsoft.com/dotnet/api/system.exception.innerexception), [`TargetSite`](https://learn.microsoft.com/dotnet/api/system.exception.targetsite), [`StackTrace`](https://learn.microsoft.com/dotnet/api/system.exception.stacktrace), [`HelpLink`](https://learn.microsoft.com/dotnet/api/system.exception.helplink), [`Source`](https://learn.microsoft.com/dotnet/api/system.exception.source), [`HResult`](https://learn.microsoft.com/dotnet/api/system.exception.hresult), [`SerializeObjectState`](https://learn.microsoft.com/dotnet/api/system.exception.serializeobjectstate), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
