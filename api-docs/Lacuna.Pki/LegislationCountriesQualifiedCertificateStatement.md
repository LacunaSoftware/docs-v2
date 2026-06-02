---
sidebar_label: "LegislationCountriesQualifiedCertificateStatement"
---

# LegislationCountriesQualifiedCertificateStatement

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class LegislationCountriesQualifiedCertificateStatement : QualifiedCertificateStatement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`QualifiedCertificateStatement`](./QualifiedCertificateStatement.md) → `LegislationCountriesQualifiedCertificateStatement`

## Construtores

### `LegislationCountriesQualifiedCertificateStatement(IEnumerable<string>)` {#ctor-system-collections-generic-ienumerable-system-string}

```csharp
public LegislationCountriesQualifiedCertificateStatement(IEnumerable<string> countryCodes)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `countryCodes` | [`IEnumerable<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

## Propriedades

### `CountryCodes` {#countrycodes}

```csharp
public List<string> CountryCodes { get; set; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `ToString()` {#tostring}

```csharp
public override string ToString()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`Compliance`](./QualifiedCertificateStatement.md#compliance), [`QualifiedDevice`](./QualifiedCertificateStatement.md#qualifieddevice), [`GetStatementText()`](./QualifiedCertificateStatement.md#getstatementtext), [`StatementId`](./QualifiedCertificateStatement.md#statementid), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
