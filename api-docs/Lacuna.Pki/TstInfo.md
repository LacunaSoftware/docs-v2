---
sidebar_label: "TstInfo"
---

# TstInfo

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class TstInfo
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `TstInfo`

## Propriedades

### `EncodedValue` {#encodedvalue}

```csharp
public byte[] EncodedValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GenTime` {#gentime}

```csharp
public DateTimeOffset GenTime { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `MessageImprint` {#messageimprint}

```csharp
public DigestAlgorithmAndValue MessageImprint { get; }
```

**Retorno**

[`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md)

---

### `Nonce` {#nonce}

```csharp
public BigInteger? Nonce { get; }
```

**Retorno**

[`BigInteger?`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `NonceBytes` {#noncebytes}

Nonce DER INTEGER value raw bytes

```csharp
public byte[] NonceBytes { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `PolicyId` {#policyid}

```csharp
public string PolicyId { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SerialNumber` {#serialnumber}

```csharp
public BigInteger SerialNumber { get; }
```

**Retorno**

[`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

```csharp
public static TstInfo Decode(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`TstInfo`](./TstInfo.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
