---
sidebar_label: "PkiLogEntry"
---

# PkiLogEntry

**Namespace:** `Lacuna.Pki.EntityFrameworkConnector`  
**Assembly:** `Lacuna.Pki.EntityFrameworkConnector`  
_Class_

```csharp
[Table("LacunaPkiLog")]
public class PkiLogEntry
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PkiLogEntry`

## Construtores

### `PkiLogEntry()` {#ctor}

```csharp
public PkiLogEntry()
```

---

## Propriedades

### `Id` {#id}

```csharp
[DatabaseGenerated(DatabaseGeneratedOption.Identity)]
[Key]
public int Id { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `Level` {#level}

```csharp
public LogLevels Level { get; set; }
```

**Retorno**

[`LogLevels`](../Lacuna.Pki/LogLevels.md)

---

### `Message` {#message}

```csharp
public string Message { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Source` {#source}

```csharp
public string Source { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `UTCDate` {#utcdate}

```csharp
public DateTime UTCDate { get; set; }
```

**Retorno**

[`DateTime`](https://learn.microsoft.com/dotnet/api/system.datetime)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
