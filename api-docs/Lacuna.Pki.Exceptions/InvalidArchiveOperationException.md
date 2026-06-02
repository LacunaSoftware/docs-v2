---
sidebar_label: "InvalidArchiveOperationException"
---

# InvalidArchiveOperationException

**Namespace:** `Lacuna.Pki.Exceptions`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class InvalidArchiveOperationException : InvalidOperationException, ISerializable, _Exception
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`Exception`](https://learn.microsoft.com/dotnet/api/system.exception) → [`SystemException`](https://learn.microsoft.com/dotnet/api/system.systemexception) → [`InvalidOperationException`](https://learn.microsoft.com/dotnet/api/system.invalidoperationexception) → `InvalidArchiveOperationException`

## Construtores

### `InvalidArchiveOperationException(string, Exception)` {#ctor-system-string-system-exception}

```csharp
public InvalidArchiveOperationException(string message, Exception innerException)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `innerException` | [`Exception`](https://learn.microsoft.com/dotnet/api/system.exception) |  |

---

### `InvalidArchiveOperationException(string)` {#ctor-system-string}

```csharp
public InvalidArchiveOperationException(string message)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Membros herdados

[`GetBaseException()`](https://learn.microsoft.com/dotnet/api/system.exception.getbaseexception), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.exception.tostring), [`GetObjectData(SerializationInfo, StreamingContext)`](https://learn.microsoft.com/dotnet/api/system.exception.getobjectdata), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.exception.gettype), [`Message`](https://learn.microsoft.com/dotnet/api/system.exception.message), [`Data`](https://learn.microsoft.com/dotnet/api/system.exception.data), [`InnerException`](https://learn.microsoft.com/dotnet/api/system.exception.innerexception), [`TargetSite`](https://learn.microsoft.com/dotnet/api/system.exception.targetsite), [`StackTrace`](https://learn.microsoft.com/dotnet/api/system.exception.stacktrace), [`HelpLink`](https://learn.microsoft.com/dotnet/api/system.exception.helplink), [`Source`](https://learn.microsoft.com/dotnet/api/system.exception.source), [`HResult`](https://learn.microsoft.com/dotnet/api/system.exception.hresult), [`SerializeObjectState`](https://learn.microsoft.com/dotnet/api/system.exception.serializeobjectstate), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
