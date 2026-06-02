---
sidebar_label: "ValidationResults"
---

# ValidationResults

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class ValidationResults
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ValidationResults`

## Propriedades

### `ChecksPerformed` {#checksperformed}

```csharp
public int ChecksPerformed { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `Errors` {#errors}

```csharp
public List<ValidationItem> Errors { get; }
```

**Retorno**

[`List<ValidationItem>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `HasErrors` {#haserrors}

```csharp
public bool HasErrors { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `HasWarnings` {#haswarnings}

```csharp
public bool HasWarnings { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsValid` {#isvalid}

```csharp
public bool IsValid { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `PassedChecks` {#passedchecks}

```csharp
public List<ValidationItem> PassedChecks { get; }
```

**Retorno**

[`List<ValidationItem>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Summary` {#summary}

```csharp
public string Summary { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Warnings` {#warnings}

```csharp
public List<ValidationItem> Warnings { get; }
```

**Retorno**

[`List<ValidationItem>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `ToString()` {#tostring}

```csharp
public override string ToString()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
