---
sidebar_label: "CommitmentType"
---

# CommitmentType

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CommitmentType
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CommitmentType`

## Campos

### `ProofOfApproval` {#proofofapproval}

Proof of approval indicates that the signer has approved the content of the message.

```csharp
public static readonly CommitmentType ProofOfApproval
```

**Retorno**

[`CommitmentType`](./CommitmentType.md)

---

### `ProofOfCreation` {#proofofcreation}

Proof of creation indicates that the signer has created the message (but not necessarily approved, nor sent it).

```csharp
public static readonly CommitmentType ProofOfCreation
```

**Retorno**

[`CommitmentType`](./CommitmentType.md)

---

### `ProofOfDelivery` {#proofofdelivery}

Proof of delivery indicates that the TSP providing that indication has delivered a message in a local store	accessible to the recipient of the message.

```csharp
public static readonly CommitmentType ProofOfDelivery
```

**Retorno**

[`CommitmentType`](./CommitmentType.md)

---

### `ProofOfOrigin` {#proofoforigin}

Proof of origin indicates that the signer recognizes to have created, approved, and sent the message.

```csharp
public static readonly CommitmentType ProofOfOrigin
```

**Retorno**

[`CommitmentType`](./CommitmentType.md)

---

### `ProofOfReceipt` {#proofofreceipt}

Proof of receipt indicates that signer recognizes to have received the content of the message.

```csharp
public static readonly CommitmentType ProofOfReceipt
```

**Retorno**

[`CommitmentType`](./CommitmentType.md)

---

### `ProofOfSender` {#proofofsender}

Proof of sender indicates that the entity providing that indication has sent the message(but not necessarily created it).

```csharp
public static readonly CommitmentType ProofOfSender
```

**Retorno**

[`CommitmentType`](./CommitmentType.md)

---

## Propriedades

### `Oid` {#oid}

```csharp
public string Oid { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `Equals(CommitmentType)` {#equals-lacuna-pki-commitmenttype}

```csharp
public bool Equals(CommitmentType other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`CommitmentType`](./CommitmentType.md) |  |

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

### `ToString()` {#tostring}

```csharp
public override string ToString()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Operadores

### `operator !=(CommitmentType, CommitmentType)` {#op-inequality-lacuna-pki-commitmenttype-lacuna-pki-commitmenttype}

```csharp
public static bool operator !=(CommitmentType a, CommitmentType b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`CommitmentType`](./CommitmentType.md) |  |
| `b` | [`CommitmentType`](./CommitmentType.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `operator ==(CommitmentType, CommitmentType)` {#op-equality-lacuna-pki-commitmenttype-lacuna-pki-commitmenttype}

```csharp
public static bool operator ==(CommitmentType a, CommitmentType b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`CommitmentType`](./CommitmentType.md) |  |
| `b` | [`CommitmentType`](./CommitmentType.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
