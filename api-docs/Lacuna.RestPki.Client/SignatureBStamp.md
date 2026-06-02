---
sidebar_label: "SignatureBStamp"
---

# SignatureBStamp

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
[Obsolete]
public class SignatureBStamp
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignatureBStamp`

## Propriedades

### `Blockchain` {#blockchain}

```csharp
public Blockchains Blockchain { get; set; }
```

**Retorno**

`Blockchains`

---

### `BlockDate` {#blockdate}

```csharp
public DateTimeOffset BlockDate { get; set; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `BlockNumber` {#blocknumber}

```csharp
public long BlockNumber { get; set; }
```

**Retorno**

[`long`](https://learn.microsoft.com/dotnet/api/system.int64)

---

### `DocumentDigests` {#documentdigests}

```csharp
public List<DigestAlgorithmAndValue> DocumentDigests { get; set; }
```

**Retorno**

[`List<DigestAlgorithmAndValue>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `IndexDigests` {#indexdigests}

```csharp
public List<DigestAlgorithmAndValue> IndexDigests { get; set; }
```

**Retorno**

[`List<DigestAlgorithmAndValue>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `IndexFile` {#indexfile}

```csharp
public FileResult IndexFile { get; set; }
```

**Retorno**

[`FileResult`](./FileResult.md)

---

### `TransactionId` {#transactionid}

```csharp
public string TransactionId { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
