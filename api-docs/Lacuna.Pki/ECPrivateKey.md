---
sidebar_label: "ECPrivateKey"
---

# ECPrivateKey

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class ECPrivateKey : PrivateKey, IPrivateKey
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PrivateKey`](./PrivateKey.md) → `ECPrivateKey`

## Construtores

### `ECPrivateKey(ECDsa)` {#ctor-system-security-cryptography-ecdsa}

```csharp
public ECPrivateKey(ECDsa ecDsa)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `ecDsa` | [`ECDsa`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.ecdsa) |  |

---

### `ECPrivateKey(ECParameters)` {#ctor-system-security-cryptography-ecparameters}

```csharp
public ECPrivateKey(ECParameters ecParameters)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `ecParameters` | [`ECParameters`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.ecparameters) |  |

---

## Propriedades

### `Algorithm` {#algorithm}

```csharp
public override PKAlgorithm Algorithm { get; }
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

## Métodos

### `GetEncryptionCsp()` {#getencryptioncsp}

```csharp
public override IEncryptionCsp GetEncryptionCsp()
```

**Retorno**

[`IEncryptionCsp`](./IEncryptionCsp.md)

---

### `GetSignatureCsp(DigestAlgorithm)` {#getsignaturecsp-lacuna-pki-digestalgorithm}

```csharp
public override ISignatureCsp GetSignatureCsp(DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`ISignatureCsp`](./ISignatureCsp.md)

---

## Membros herdados

[`GetInstance(X509Certificate2)`](./PrivateKey.md#getinstance-system-security-cryptography-x509certificates-x509certificate2), [`GetInstance(AsymmetricAlgorithm)`](./PrivateKey.md#getinstance-system-security-cryptography-asymmetricalgorithm), [`Decode(string)`](./PrivateKey.md#decode-system-string), [`Decode(string, string)`](./PrivateKey.md#decode-system-string-system-string), [`Decode(byte[])`](./PrivateKey.md#decode-system-byte), [`Decode(byte[], string)`](./PrivateKey.md#decode-system-byte-system-string), [`Export()`](./PrivateKey.md#export), [`ExportPem()`](./PrivateKey.md#exportpem), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
