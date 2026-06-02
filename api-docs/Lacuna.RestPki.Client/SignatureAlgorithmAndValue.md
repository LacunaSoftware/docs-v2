---
sidebar_label: "SignatureAlgorithmAndValue"
---

# SignatureAlgorithmAndValue

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class SignatureAlgorithmAndValue
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignatureAlgorithmAndValue`

## Construtores

### `SignatureAlgorithmAndValue(SignatureAlgorithmAndValueModel)` {#ctor-lacuna-restpki-api-signaturealgorithmandvaluemodel}

```csharp
public SignatureAlgorithmAndValue(SignatureAlgorithmAndValueModel model)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `model` | `SignatureAlgorithmAndValueModel` |  |

---

## Propriedades

### `Algorithm` {#algorithm}

```csharp
public SignatureAlgorithm Algorithm { get; }
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `Value` {#value}

```csharp
public byte[] Value { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
