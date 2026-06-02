---
sidebar_label: "AzureKey"
---

# AzureKey

**Namespace:** `Lacuna.Pki.AzureConnector`  
**Assembly:** `Lacuna.Pki.AzureConnector`  
_Class_

```csharp
public class AzureKey : IPrivateKey
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `AzureKey`

## Propriedades

### `PublicKey` {#publickey}

```csharp
public PublicKey PublicKey { get; }
```

**Retorno**

[`PublicKey`](../Lacuna.Pki/PublicKey.md)

---

## Métodos

### `GetCertificateWithKey(PKCertificate)` {#getcertificatewithkey-lacuna-pki-pkcertificate}

```csharp
public PKCertificateWithKey GetCertificateWithKey(PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) |  |

**Retorno**

[`PKCertificateWithKey`](../Lacuna.Pki/PKCertificateWithKey.md)

---

### `GetEncryptionCsp()` {#getencryptioncsp}

```csharp
public IEncryptionCsp GetEncryptionCsp()
```

**Retorno**

[`IEncryptionCsp`](../Lacuna.Pki/IEncryptionCsp.md)

---

### `GetSignatureCsp(DigestAlgorithm)` {#getsignaturecsp-lacuna-pki-digestalgorithm}

```csharp
public ISignatureCsp GetSignatureCsp(DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |

**Retorno**

[`ISignatureCsp`](../Lacuna.Pki/ISignatureCsp.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
