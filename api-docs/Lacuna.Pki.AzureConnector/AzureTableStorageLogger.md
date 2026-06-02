---
sidebar_label: "AzureTableStorageLogger"
---

# AzureTableStorageLogger

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Class_

```csharp
public class AzureTableStorageLogger : ILogger
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AzureTableStorageLogger`

## Campos

### `DefaultTableName` {#defaulttablename}

```csharp
public const string DefaultTableName = "LacunaPkiLog"
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `PartitionKey` {#partitionkey}

```csharp
public const string PartitionKey = "pkilog"
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `Configure()` {#configure}

```csharp
public void Configure()
```

---

### `CreateFromConnectionString(string, string, LogLevels)` {#createfromconnectionstring-system-string-system-string-lacuna-pki-loglevels}

```csharp
public static AzureTableStorageLogger CreateFromConnectionString(string connectionString, string tableName = "LacunaPkiLog", LogLevels minLevel = LogLevels.Info)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `connectionString` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `tableName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `minLevel` | [`LogLevels`](../Lacuna.Pki/LogLevels.md) |  |

**Retorno**

[`AzureTableStorageLogger`](./AzureTableStorageLogger.md)

---

### `CreateFromSettingName(string, string, LogLevels)` {#createfromsettingname-system-string-system-string-lacuna-pki-loglevels}

```csharp
public static AzureTableStorageLogger CreateFromSettingName(string settingName, string tableName = "LacunaPkiLog", LogLevels minLevel = LogLevels.Info)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `settingName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `tableName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `minLevel` | [`LogLevels`](../Lacuna.Pki/LogLevels.md) |  |

**Retorno**

[`AzureTableStorageLogger`](./AzureTableStorageLogger.md)

---

### `CreateFromStorageAccount(CloudStorageAccount, string, LogLevels)` {#createfromstorageaccount-microsoft-windowsazure-storage-cloudstorageaccount-system-string-lacuna-pki-loglevels}

```csharp
public static AzureTableStorageLogger CreateFromStorageAccount(CloudStorageAccount storageAccount, string tableName = "LacunaPkiLog", LogLevels minLevel = LogLevels.Info)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `storageAccount` | `CloudStorageAccount` |  |
| `tableName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `minLevel` | [`LogLevels`](../Lacuna.Pki/LogLevels.md) |  |

**Retorno**

[`AzureTableStorageLogger`](./AzureTableStorageLogger.md)

---

### `CreateFromTableClient(CloudTableClient, string, LogLevels)` {#createfromtableclient-microsoft-windowsazure-storage-table-cloudtableclient-system-string-lacuna-pki-loglevels}

```csharp
public static AzureTableStorageLogger CreateFromTableClient(CloudTableClient tableClient, string tableName = "LacunaPkiLog", LogLevels minLevel = LogLevels.Info)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tableClient` | `CloudTableClient` |  |
| `tableName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `minLevel` | [`LogLevels`](../Lacuna.Pki/LogLevels.md) |  |

**Retorno**

[`AzureTableStorageLogger`](./AzureTableStorageLogger.md)

---

### `CreateFromTableReference(CloudTable, LogLevels)` {#createfromtablereference-microsoft-windowsazure-storage-table-cloudtable-lacuna-pki-loglevels}

```csharp
public static AzureTableStorageLogger CreateFromTableReference(CloudTable tableReference, LogLevels minLevel = LogLevels.Info)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tableReference` | `CloudTable` |  |
| `minLevel` | [`LogLevels`](../Lacuna.Pki/LogLevels.md) |  |

**Retorno**

[`AzureTableStorageLogger`](./AzureTableStorageLogger.md)

---

### `Flush()` {#flush}

```csharp
public void Flush()
```

---

### `GetTableAsync()` {#gettableasync}

```csharp
protected Task<CloudTable> GetTableAsync()
```

**Retorno**

[`Task<CloudTable>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

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
