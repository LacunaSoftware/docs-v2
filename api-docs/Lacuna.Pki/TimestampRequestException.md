---
sidebar_label: "TimestampRequestException"
---

# TimestampRequestException

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class TimestampRequestException : TimestampException, ISerializable, _Exception
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`Exception`](https://learn.microsoft.com/dotnet/api/system.exception) → [`TimestampException`](./TimestampException.md) → `TimestampRequestException`

## Construtores

### `TimestampRequestException(string, Exception, int, List<string>)` {#ctor-system-string-system-exception-system-int32-system-collections-generic-list-system-string}

```csharp
[Obsolete("Use constructor with enum parameters instead of int")]
public TimestampRequestException(string message, Exception innerException, int statusCode, List<string> statusStrings)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `innerException` | [`Exception`](https://learn.microsoft.com/dotnet/api/system.exception) |  |
| `statusCode` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `statusStrings` | [`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) |  |

---

### `TimestampRequestException(string, Exception, Rfc3161StatusCodes, List<string>, Rfc3161FailureInfos?)` {#ctor-system-string-system-exception-lacuna-pki-asn1-rfc3161statuscodes-system-collections-generic-list-system-string-system-nullable-lacuna-pki-asn1-rfc3161failureinfos}

```csharp
public TimestampRequestException(string message, Exception innerException, Rfc3161StatusCodes statusCode, List<string> statusStrings = null, Rfc3161FailureInfos? failureInfo = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `innerException` | [`Exception`](https://learn.microsoft.com/dotnet/api/system.exception) |  |
| `statusCode` | [`Rfc3161StatusCodes`](../Lacuna.Pki.Asn1/Rfc3161StatusCodes.md) |  |
| `statusStrings` | [`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) |  |
| `failureInfo` | `Rfc3161FailureInfos?` |  |

---

### `TimestampRequestException(string, int, List<string>)` {#ctor-system-string-system-int32-system-collections-generic-list-system-string}

```csharp
[Obsolete("Use constructor with enum parameters instead of int")]
public TimestampRequestException(string message, int statusCode, List<string> statusStrings)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `statusCode` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `statusStrings` | [`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) |  |

---

### `TimestampRequestException(string, Rfc3161StatusCodes, List<string>, Rfc3161FailureInfos?)` {#ctor-system-string-lacuna-pki-asn1-rfc3161statuscodes-system-collections-generic-list-system-string-system-nullable-lacuna-pki-asn1-rfc3161failureinfos}

```csharp
public TimestampRequestException(string message, Rfc3161StatusCodes statusCode, List<string> statusStrings = null, Rfc3161FailureInfos? failureInfo = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `statusCode` | [`Rfc3161StatusCodes`](../Lacuna.Pki.Asn1/Rfc3161StatusCodes.md) |  |
| `statusStrings` | [`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) |  |
| `failureInfo` | `Rfc3161FailureInfos?` |  |

---

## Propriedades

### `FailureInfo` {#failureinfo}

```csharp
public Rfc3161FailureInfos? FailureInfo { get; set; }
```

**Retorno**

`Rfc3161FailureInfos?`

---

### `Status` {#status}

```csharp
public Rfc3161StatusCodes Status { get; set; }
```

**Retorno**

[`Rfc3161StatusCodes`](../Lacuna.Pki.Asn1/Rfc3161StatusCodes.md)

---

### `StatusCode` {#statuscode}

```csharp
[Obsolete("Use Status property instead")]
public int StatusCode { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `StatusStrings` {#statusstrings}

```csharp
public List<string> StatusStrings { get; set; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Membros herdados

[`GetBaseException()`](https://learn.microsoft.com/dotnet/api/system.exception.getbaseexception), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.exception.tostring), [`GetObjectData(SerializationInfo, StreamingContext)`](https://learn.microsoft.com/dotnet/api/system.exception.getobjectdata), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.exception.gettype), [`Message`](https://learn.microsoft.com/dotnet/api/system.exception.message), [`Data`](https://learn.microsoft.com/dotnet/api/system.exception.data), [`InnerException`](https://learn.microsoft.com/dotnet/api/system.exception.innerexception), [`TargetSite`](https://learn.microsoft.com/dotnet/api/system.exception.targetsite), [`StackTrace`](https://learn.microsoft.com/dotnet/api/system.exception.stacktrace), [`HelpLink`](https://learn.microsoft.com/dotnet/api/system.exception.helplink), [`Source`](https://learn.microsoft.com/dotnet/api/system.exception.source), [`HResult`](https://learn.microsoft.com/dotnet/api/system.exception.hresult), [`SerializeObjectState`](https://learn.microsoft.com/dotnet/api/system.exception.serializeobjectstate), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
