---
sidebar_label: "ReferencedCrlStoreFromSimpleStore"
---

# ReferencedCrlStoreFromSimpleStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class ReferencedCrlStoreFromSimpleStore : IReferencedCrlStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ReferencedCrlStoreFromSimpleStore`

## Construtores

### `ReferencedCrlStoreFromSimpleStore(ISimpleStore)` {#ctor-lacuna-pki-stores-isimplestore}

```csharp
public ReferencedCrlStoreFromSimpleStore(ISimpleStore simpleStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `simpleStore` | [`ISimpleStore`](./ISimpleStore.md) |  |

---

## Métodos

### `GetCrl(DigestAlgorithm, byte[])` {#getcrl-lacuna-pki-digestalgorithm-system-byte}

Recovers a CRL based on its digest value. The digest algorithm it's based on signerInfo or policy message digest Algorithm

```csharp
public Crl GetCrl(DigestAlgorithm hashAlgorithm, byte[] crlHash)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `hashAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |
| `crlHash` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Crl`](../Lacuna.Pki/Crl.md)

---

### `PutCrl(DigestAlgorithm, byte[])` {#putcrl-lacuna-pki-digestalgorithm-system-byte}

```csharp
public void PutCrl(DigestAlgorithm hashAlgorithm, byte[] crl)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `hashAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |
| `crl` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
