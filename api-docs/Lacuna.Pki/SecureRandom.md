---
sidebar_label: "SecureRandom"
---

# SecureRandom

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class SecureRandom : Random
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`Random`](https://learn.microsoft.com/dotnet/api/system.random) → `SecureRandom`

## Construtores

### `SecureRandom()` {#ctor}

```csharp
public SecureRandom()
```

---

### `SecureRandom(RandomNumberGenerator)` {#ctor-system-security-cryptography-randomnumbergenerator}

```csharp
public SecureRandom(RandomNumberGenerator rng)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `rng` | [`RandomNumberGenerator`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.randomnumbergenerator) |  |

---

## Métodos

### `Next()` {#next}

```csharp
public override int Next()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `Next(int, int)` {#next-system-int32-system-int32}

```csharp
public override int Next(int minValue, int maxValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `minValue` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `maxValue` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `Next(int)` {#next-system-int32}

```csharp
public override int Next(int maxValue)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `maxValue` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `NextBytes(byte[])` {#nextbytes-system-byte}

```csharp
public override void NextBytes(byte[] buffer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `buffer` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `NextDouble()` {#nextdouble}

```csharp
public override double NextDouble()
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `NextPassword(IEnumerable<char>, int)` {#nextpassword-system-collections-generic-ienumerable-system-char-system-int32}

Given a set of characters and a length, generates a random password.

```csharp
public string NextPassword(IEnumerable<char> charset, int length)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `charset` | [`IEnumerable<char>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) | Set of characters to choose each character from |
| `length` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) | Length of the password |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string) — A random password of the given length with only the characters in the given set choosen randomly

---

### `Sample()` {#sample}

```csharp
protected override double Sample()
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
