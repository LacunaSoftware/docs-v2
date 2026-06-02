---
sidebar_label: "EntityFrameworkLogger"
---

# EntityFrameworkLogger

**Namespace:** `Lacuna.Pki.EntityFrameworkConnector`  
**Assembly:** `Lacuna.Pki.EntityFrameworkConnector`  
_Class_

```csharp
public class EntityFrameworkLogger : ILogger
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `EntityFrameworkLogger`

## Construtores

### `EntityFrameworkLogger(IPkiLogContext, LogLevels)` {#ctor-lacuna-pki-entityframeworkconnector-ipkilogcontext-lacuna-pki-loglevels}

```csharp
public EntityFrameworkLogger(IPkiLogContext dbContext, LogLevels minLevel = LogLevels.Info)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `dbContext` | [`IPkiLogContext`](./IPkiLogContext.md) |  |
| `minLevel` | [`LogLevels`](../Lacuna.Pki/LogLevels.md) |  |

---

## Métodos

### `Configure(IPkiLogContext, LogLevels)` {#configure-lacuna-pki-entityframeworkconnector-ipkilogcontext-lacuna-pki-loglevels}

```csharp
public static void Configure(IPkiLogContext context, LogLevels minLevel = LogLevels.Info)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `context` | [`IPkiLogContext`](./IPkiLogContext.md) |  |
| `minLevel` | [`LogLevels`](../Lacuna.Pki/LogLevels.md) |  |

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
