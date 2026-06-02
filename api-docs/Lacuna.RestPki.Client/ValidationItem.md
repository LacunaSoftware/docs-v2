---
sidebar_label: "ValidationItem"
---

# ValidationItem

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class ValidationItem
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ValidationItem`

## Propriedades

### `Detail` {#detail}

```csharp
public string Detail { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `InnerValidationResults` {#innervalidationresults}

```csharp
public ValidationResults InnerValidationResults { get; set; }
```

**Retorno**

[`ValidationResults`](./ValidationResults.md)

---

### `Message` {#message}

```csharp
public string Message { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Type` {#type}

```csharp
public ValidationItemTypes Type { get; }
```

**Retorno**

`ValidationItemTypes`

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
