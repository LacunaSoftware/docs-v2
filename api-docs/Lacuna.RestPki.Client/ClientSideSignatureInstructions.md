---
sidebar_label: "ClientSideSignatureInstructions"
---

# ClientSideSignatureInstructions

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class ClientSideSignatureInstructions
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ClientSideSignatureInstructions`

## Construtores

### `ClientSideSignatureInstructions()` {#ctor}

```csharp
public ClientSideSignatureInstructions()
```

---

## Propriedades

### `DigestAlgorithm` {#digestalgorithm}

```csharp
public DigestAlgorithm DigestAlgorithm { get; }
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `DigestAlgorithmOid` {#digestalgorithmoid}

```csharp
public string DigestAlgorithmOid { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Token` {#token}

```csharp
public string Token { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `ToSignData` {#tosigndata}

```csharp
public byte[] ToSignData { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `ToSignHash` {#tosignhash}

```csharp
public byte[] ToSignHash { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
