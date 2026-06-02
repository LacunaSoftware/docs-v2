---
sidebar_label: "RetentionPeriodQualifiedCertificateStatement"
---

# RetentionPeriodQualifiedCertificateStatement

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class RetentionPeriodQualifiedCertificateStatement : QualifiedCertificateStatement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`QualifiedCertificateStatement`](./QualifiedCertificateStatement.md) → `RetentionPeriodQualifiedCertificateStatement`

## Construtores

### `RetentionPeriodQualifiedCertificateStatement(int)` {#ctor-system-int32}

```csharp
public RetentionPeriodQualifiedCertificateStatement(int years)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `years` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

---

## Propriedades

### `Years` {#years}

```csharp
public int Years { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

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
