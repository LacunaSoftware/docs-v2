---
sidebar_label: "PkiRsaPkcs1SignatureDescription"
---

# PkiRsaPkcs1SignatureDescription

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

Do not use this class (it is only public because of limitations of the .NET Framework)

```csharp
[Obsolete("Do not use this class (it is only public because of limitations of the .NET Framework and is not guaranteed to exist in future versions)")]
public abstract class PkiRsaPkcs1SignatureDescription : SignatureDescription
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureDescription`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.signaturedescription) → `PkiRsaPkcs1SignatureDescription`

## Construtores

### `PkiRsaPkcs1SignatureDescription(DigestAlgorithm)` {#ctor-lacuna-pki-digestalgorithm}

```csharp
protected PkiRsaPkcs1SignatureDescription(DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

---

## Métodos

### `CreateDeformatter(AsymmetricAlgorithm)` {#createdeformatter-system-security-cryptography-asymmetricalgorithm}

```csharp
public override AsymmetricSignatureDeformatter CreateDeformatter(AsymmetricAlgorithm key)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `key` | [`AsymmetricAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricalgorithm) |  |

**Retorno**

[`AsymmetricSignatureDeformatter`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricsignaturedeformatter)

---

### `CreateFormatter(AsymmetricAlgorithm)` {#createformatter-system-security-cryptography-asymmetricalgorithm}

```csharp
public override AsymmetricSignatureFormatter CreateFormatter(AsymmetricAlgorithm key)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `key` | [`AsymmetricAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricalgorithm) |  |

**Retorno**

[`AsymmetricSignatureFormatter`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.asymmetricsignatureformatter)

---

## Membros herdados

[`CreateDigest()`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.signaturedescription.createdigest), [`KeyAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.signaturedescription.keyalgorithm), [`DigestAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.signaturedescription.digestalgorithm), [`FormatterAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.signaturedescription.formatteralgorithm), [`DeformatterAlgorithm`](https://learn.microsoft.com/dotnet/api/system.security.cryptography.signaturedescription.deformatteralgorithm), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
