---
sidebar_label: "IUserCertificateStore"
---

# IUserCertificateStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface IUserCertificateStore
```

## Métodos

### `GetByIssuerAndSerialNumber(Name, BigInteger)` {#getbyissuerandserialnumber-lacuna-pki-name-system-numerics-biginteger}

```csharp
byte[] GetByIssuerAndSerialNumber(Name issuerName, BigInteger serialNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuerName` | [`Name`](../Lacuna.Pki/Name.md) |  |
| `serialNumber` | [`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetByKeyIdentifier(byte[])` {#getbykeyidentifier-system-byte}

```csharp
byte[] GetByKeyIdentifier(byte[] keyIdentifier)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `keyIdentifier` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetBySubjectName(Name)` {#getbysubjectname-lacuna-pki-name}

```csharp
IEnumerable<byte[]> GetBySubjectName(Name subjectName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `subjectName` | [`Name`](../Lacuna.Pki/Name.md) |  |

**Retorno**

[`IEnumerable<byte[]>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---
