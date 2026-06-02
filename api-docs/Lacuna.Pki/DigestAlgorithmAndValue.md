---
sidebar_label: "DigestAlgorithmAndValue"
---

# DigestAlgorithmAndValue

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class DigestAlgorithmAndValue
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `DigestAlgorithmAndValue`

## Construtores

### `DigestAlgorithmAndValue(DigestAlgorithm, byte[])` {#ctor-lacuna-pki-digestalgorithm-system-byte}

```csharp
public DigestAlgorithmAndValue(DigestAlgorithm digestAlgorithm, byte[] digestValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |
| `digestValue` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

## Propriedades

### `Algorithm` {#algorithm}

```csharp
public DigestAlgorithm Algorithm { get; }
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `Value` {#value}

```csharp
public byte[] Value { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Métodos

### `CheckValueLength()` {#checkvaluelength}

```csharp
public void CheckValueLength()
```

---

### `Equals(DigestAlgorithmAndValue)` {#equals-lacuna-pki-digestalgorithmandvalue}

```csharp
public bool Equals(DigestAlgorithmAndValue other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object obj)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `obj` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
