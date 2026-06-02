---
sidebar_label: "CertificateSelectorByIssuerAndSerialNumber"
---

# CertificateSelectorByIssuerAndSerialNumber

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CertificateSelectorByIssuerAndSerialNumber
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CertificateSelectorByIssuerAndSerialNumber`

## Construtores

### `CertificateSelectorByIssuerAndSerialNumber(Name, BigInteger)` {#ctor-lacuna-pki-name-system-numerics-biginteger}

```csharp
public CertificateSelectorByIssuerAndSerialNumber(Name issuerName, BigInteger serialNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuerName` | [`Name`](./Name.md) |  |
| `serialNumber` | [`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger) |  |

---

## Propriedades

### `Predicate` {#predicate}

```csharp
public Predicate<PKCertificate> Predicate { get; }
```

**Retorno**

[`Predicate<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.predicate-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
