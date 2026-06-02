---
sidebar_label: "ItalyCertificateFields"
---

# ItalyCertificateFields

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class ItalyCertificateFields
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ItalyCertificateFields`

## Construtores

### `ItalyCertificateFields(PKCertificate)` {#ctor-lacuna-pki-pkcertificate}

```csharp
public ItalyCertificateFields(PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](./PKCertificate.md) |  |

---

## Propriedades

### `CertificateType` {#certificatetype}

```csharp
public ItalyCertificateFields.CertificateTypes CertificateType { get; }
```

**Retorno**

[`ItalyCertificateFields.CertificateTypes`](./ItalyCertificateFields.CertificateTypes.md)

---

### `CodiceFiscale` {#codicefiscale}

Che contiene il codice fiscale del titolare rilasciato dall'autorità fiscale dello Stato di
residenza del titolare o, in mancanza, un analogo codice identificativo, quale ad esempio un codice di previdenza sociale
o un codice identificativo generale.

```csharp
public string CodiceFiscale { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `IdCarta` {#idcarta}

Contiene il codice identificativo del titolare presso il certificatore. Detto codice, assegnato dal
certificatore, è univoco.

```csharp
public string IdCarta { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
