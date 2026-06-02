---
sidebar_label: "Timestamper"
---

# Timestamper

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class Timestamper
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Timestamper`

## Construtores

### `Timestamper(RestPkiClient, Guid)` {#ctor-lacuna-restpki-client-restpkiclient-system-guid}

```csharp
public Timestamper(RestPkiClient client, Guid timestampPlan)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |
| `timestampPlan` | [`Guid`](https://learn.microsoft.com/dotnet/api/system.guid) |  |

---

## Métodos

### `GetTimestamp(DigestAlgorithm, byte[])` {#gettimestamp-lacuna-restpki-client-digestalgorithm-system-byte}

```csharp
public TimestampResult GetTimestamp(DigestAlgorithm digestAlgorithm, byte[] digestValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `digestValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`TimestampResult`](./TimestampResult.md)

---

### `GetTimestamp(DigestAlgorithmAndValue)` {#gettimestamp-lacuna-restpki-client-digestalgorithmandvalue}

```csharp
public TimestampResult GetTimestamp(DigestAlgorithmAndValue digest)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md) |  |

**Retorno**

[`TimestampResult`](./TimestampResult.md)

---

### `GetTimestampAsync(DigestAlgorithm, byte[])` {#gettimestampasync-lacuna-restpki-client-digestalgorithm-system-byte}

```csharp
public Task<TimestampResult> GetTimestampAsync(DigestAlgorithm digestAlgorithm, byte[] digestValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `digestValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Task<TimestampResult>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `GetTimestampAsync(DigestAlgorithmAndValue)` {#gettimestampasync-lacuna-restpki-client-digestalgorithmandvalue}

```csharp
public Task<TimestampResult> GetTimestampAsync(DigestAlgorithmAndValue digest)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md) |  |

**Retorno**

[`Task<TimestampResult>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
