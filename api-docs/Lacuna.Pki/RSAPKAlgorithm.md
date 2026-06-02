---
sidebar_label: "RSAPKAlgorithm"
---

# RSAPKAlgorithm

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class RSAPKAlgorithm : PKAlgorithm
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PKAlgorithm`](./PKAlgorithm.md) → `RSAPKAlgorithm`

## Construtores

### `RSAPKAlgorithm()` {#ctor}

```csharp
public RSAPKAlgorithm()
```

---

## Propriedades

### `Name` {#name}

```csharp
public override string Name { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Oid` {#oid}

```csharp
public override string Oid { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `GetCsp(RSAPublicKey)` {#getcsp-lacuna-pki-rsapublickey}

```csharp
public RSACryptoServiceProvider GetCsp(RSAPublicKey publicKey)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `publicKey` | [`RSAPublicKey`](./RSAPublicKey.md) |  |

**Retorno**

[`RSACryptoServiceProvider`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.rsacryptoserviceprovider)

---

### `GetSignatureAlgorithm(DigestAlgorithm)` {#getsignaturealgorithm-lacuna-pki-digestalgorithm}

```csharp
public override SignatureAlgorithm GetSignatureAlgorithm(DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

## Membros herdados

[`RSA`](./PKAlgorithm.md#rsa), [`DSA`](./PKAlgorithm.md#dsa), [`EC`](./PKAlgorithm.md#ec), [`GetInstanceByName(string)`](./PKAlgorithm.md#getinstancebyname-system-string), [`GetInstanceByOID(string)`](./PKAlgorithm.md#getinstancebyoid-system-string), [`Equals(object)`](./PKAlgorithm.md#equals-system-object), [`Equals(PKAlgorithm)`](./PKAlgorithm.md#equals-lacuna-pki-pkalgorithm), [`GetHashCode()`](./PKAlgorithm.md#gethashcode), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
