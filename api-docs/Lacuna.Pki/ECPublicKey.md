---
sidebar_label: "ECPublicKey"
---

# ECPublicKey

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class ECPublicKey : PublicKey
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PublicKey`](./PublicKey.md) → `ECPublicKey`

## Construtores

### `ECPublicKey(ECParameters)` {#ctor-system-security-cryptography-ecparameters}

```csharp
public ECPublicKey(ECParameters parameters)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `parameters` | [`ECParameters`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.ecparameters) |  |

---

## Propriedades

### `Algorithm` {#algorithm}

```csharp
public override PKAlgorithm Algorithm { get; }
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

### `ECParameters` {#ecparameters}

```csharp
public ECParameters ECParameters { get; }
```

**Retorno**

[`ECParameters`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.ecparameters)

---

### `KeySize` {#keysize}

```csharp
public override int KeySize { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Métodos

### `IsEquivalent(ECPublicKey)` {#isequivalent-lacuna-pki-ecpublickey}

```csharp
public bool IsEquivalent(ECPublicKey other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`ECPublicKey`](./ECPublicKey.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`GetInstance(AsymmetricAlgorithm)`](./PublicKey.md#getinstance-system-security-cryptography-asymmetricalgorithm), [`Decode(string)`](./PublicKey.md#decode-system-string), [`Decode(byte[])`](./PublicKey.md#decode-system-byte), [`IsEquivalent(PublicKey)`](./PublicKey.md#isequivalent-lacuna-pki-publickey), [`GetSignatureCsp(DigestAlgorithm)`](./PublicKey.md#getsignaturecsp-lacuna-pki-digestalgorithm), [`GetEncryptionCsp()`](./PublicKey.md#getencryptioncsp), [`VerifyData(DigestAlgorithm, byte[], byte[])`](./PublicKey.md#verifydata-lacuna-pki-digestalgorithm-system-byte-system-byte), [`VerifyHash(DigestAlgorithm, byte[], byte[])`](./PublicKey.md#verifyhash-lacuna-pki-digestalgorithm-system-byte-system-byte), [`GetEncodedValue()`](./PublicKey.md#getencodedvalue), [`GetPemEncoded()`](./PublicKey.md#getpemencoded), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
