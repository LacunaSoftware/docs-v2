---
sidebar_label: "ValidationItem"
---

# ValidationItem

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class ValidationItem
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ValidationItem`

## Construtores

### `ValidationItem(ValidationItemTypes, string, params object[])` {#ctor-lacuna-pki-validationitemtypes-system-string-system-object}

```csharp
public ValidationItem(ValidationItemTypes type, string detail, params object[] args)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `type` | [`ValidationItemTypes`](./ValidationItemTypes.md) |  |
| `detail` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `args` | [`object[]`](https://learn.microsoft.com/dotnet/api/system.object) |  |

---

### `ValidationItem(ValidationItemTypes, ValidationResults, string, params object[])` {#ctor-lacuna-pki-validationitemtypes-lacuna-pki-validationresults-system-string-system-object}

```csharp
public ValidationItem(ValidationItemTypes type, ValidationResults innerVR, string detail, params object[] args)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `type` | [`ValidationItemTypes`](./ValidationItemTypes.md) |  |
| `innerVR` | [`ValidationResults`](./ValidationResults.md) |  |
| `detail` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `args` | [`object[]`](https://learn.microsoft.com/dotnet/api/system.object) |  |

---

### `ValidationItem(ValidationItemTypes, ValidationResults)` {#ctor-lacuna-pki-validationitemtypes-lacuna-pki-validationresults}

```csharp
public ValidationItem(ValidationItemTypes type, ValidationResults innerVR)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `type` | [`ValidationItemTypes`](./ValidationItemTypes.md) |  |
| `innerVR` | [`ValidationResults`](./ValidationResults.md) |  |

---

### `ValidationItem(ValidationItemTypes)` {#ctor-lacuna-pki-validationitemtypes}

```csharp
public ValidationItem(ValidationItemTypes type)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `type` | [`ValidationItemTypes`](./ValidationItemTypes.md) |  |

---

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

[`ValidationItemTypes`](./ValidationItemTypes.md)

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

[`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
