---
sidebar_label: "NLogLogger"
---

# NLogLogger

**Namespace:** `Lacuna.Pki.NLogConnector`  
**Assembly:** `Lacuna.Pki.NLogConnector`  
_Class_

```csharp
public class NLogLogger : ILogger
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `NLogLogger`

## Construtores

### `NLogLogger()` {#ctor}

```csharp
public NLogLogger()
```

---

## Métodos

### `Configure()` {#configure}

```csharp
public static void Configure()
```

---

### `Flush()` {#flush}

```csharp
public void Flush()
```

---

### `Log(LogLevels, string, string)` {#log-lacuna-pki-loglevels-system-string-system-string}

```csharp
public void Log(LogLevels level, string message, string source)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `level` | [`LogLevels`](../Lacuna.Pki/LogLevels.md) |  |
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `source` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
