---
sidebar_label: "RSAPublicKey"
---

# RSAPublicKey

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class RSAPublicKey : PublicKey
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PublicKey`](./PublicKey.md) → `RSAPublicKey`

## Construtores

### `RSAPublicKey(RSAParameters)` {#ctor-system-security-cryptography-rsaparameters}

```csharp
public RSAPublicKey(RSAParameters rsaParameters)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `rsaParameters` | [`RSAParameters`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.rsaparameters) |  |

---

## Propriedades

### `Algorithm` {#algorithm}

```csharp
public override PKAlgorithm Algorithm { get; }
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

### `KeySize` {#keysize}

```csharp
public override int KeySize { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `RSAParameters` {#rsaparameters}

```csharp
public RSAParameters RSAParameters { get; }
```

**Retorno**

[`RSAParameters`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.rsaparameters)

---

## Métodos

### `IsEquivalent(RSAPublicKey)` {#isequivalent-lacuna-pki-rsapublickey}

```csharp
public bool IsEquivalent(RSAPublicKey other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`RSAPublicKey`](./RSAPublicKey.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`GetInstance(AsymmetricAlgorithm)`](./PublicKey.md#getinstance-system-security-cryptography-asymmetricalgorithm), [`Decode(string)`](./PublicKey.md#decode-system-string), [`Decode(byte[])`](./PublicKey.md#decode-system-byte), [`IsEquivalent(PublicKey)`](./PublicKey.md#isequivalent-lacuna-pki-publickey), [`GetSignatureCsp(DigestAlgorithm)`](./PublicKey.md#getsignaturecsp-lacuna-pki-digestalgorithm), [`GetEncryptionCsp()`](./PublicKey.md#getencryptioncsp), [`VerifyData(DigestAlgorithm, byte[], byte[])`](./PublicKey.md#verifydata-lacuna-pki-digestalgorithm-system-byte-system-byte), [`VerifyHash(DigestAlgorithm, byte[], byte[])`](./PublicKey.md#verifyhash-lacuna-pki-digestalgorithm-system-byte-system-byte), [`GetEncodedValue()`](./PublicKey.md#getencodedvalue), [`GetPemEncoded()`](./PublicKey.md#getpemencoded), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
