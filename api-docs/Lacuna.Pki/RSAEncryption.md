---
sidebar_label: "RSAEncryption"
---

# RSAEncryption

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

RSA encryption padding parameters

```csharp
public class RSAEncryption : EncryptionParameters
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`EncryptionParameters`](./EncryptionParameters.md) → `RSAEncryption`

## Propriedades

### `OaepSHA1` {#oaepsha1}

```csharp
public static RSAEncryption OaepSHA1 { get; }
```

**Retorno**

[`RSAEncryption`](./RSAEncryption.md)

---

### `OaepSHA256` {#oaepsha256}

```csharp
public static RSAEncryption OaepSHA256 { get; }
```

**Retorno**

[`RSAEncryption`](./RSAEncryption.md)

---

### `OaepSHA384` {#oaepsha384}

```csharp
public static RSAEncryption OaepSHA384 { get; }
```

**Retorno**

[`RSAEncryption`](./RSAEncryption.md)

---

### `OaepSHA512` {#oaepsha512}

```csharp
public static RSAEncryption OaepSHA512 { get; }
```

**Retorno**

[`RSAEncryption`](./RSAEncryption.md)

---

### `Pkcs1` {#pkcs1}

```csharp
public static RSAEncryption Pkcs1 { get; }
```

**Retorno**

[`RSAEncryption`](./RSAEncryption.md)

---

## Métodos

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

### `Equals(RSAEncryption)` {#equals-lacuna-pki-rsaencryption}

```csharp
public bool Equals(RSAEncryption other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`RSAEncryption`](./RSAEncryption.md) |  |

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

## Operadores

### `operator !=(RSAEncryption, RSAEncryption)` {#op-inequality-lacuna-pki-rsaencryption-lacuna-pki-rsaencryption}

```csharp
public static bool operator !=(RSAEncryption a, RSAEncryption b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`RSAEncryption`](./RSAEncryption.md) |  |
| `b` | [`RSAEncryption`](./RSAEncryption.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `operator ==(RSAEncryption, RSAEncryption)` {#op-equality-lacuna-pki-rsaencryption-lacuna-pki-rsaencryption}

```csharp
public static bool operator ==(RSAEncryption a, RSAEncryption b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`RSAEncryption`](./RSAEncryption.md) |  |
| `b` | [`RSAEncryption`](./RSAEncryption.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
