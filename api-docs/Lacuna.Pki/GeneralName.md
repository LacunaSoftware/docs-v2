---
sidebar_label: "GeneralName"
---

# GeneralName

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class GeneralName
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `GeneralName`

## Propriedades

### `Choice` {#choice}

```csharp
public GeneralName.Choices Choice { get; }
```

**Retorno**

[`GeneralName.Choices`](./GeneralName.Choices.md)

---

### `Value` {#value}

```csharp
public object Value { get; }
```

**Retorno**

[`object`](https://learn.microsoft.com/dotnet/api/system.object)

---

## Métodos

### `Matches(GeneralName)` {#matches-lacuna-pki-generalname}

```csharp
public bool Matches(GeneralName other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`GeneralName`](./GeneralName.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
