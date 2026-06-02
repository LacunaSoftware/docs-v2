---
sidebar_label: "CertificateTypeQualifiedCertificateStatement"
---

# CertificateTypeQualifiedCertificateStatement

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CertificateTypeQualifiedCertificateStatement : QualifiedCertificateStatement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`QualifiedCertificateStatement`](./QualifiedCertificateStatement.md) → `CertificateTypeQualifiedCertificateStatement`

## Construtores

### `CertificateTypeQualifiedCertificateStatement(QualifiedCertificateType)` {#ctor-lacuna-pki-qualifiedcertificatetype}

```csharp
public CertificateTypeQualifiedCertificateStatement(QualifiedCertificateType type)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `type` | [`QualifiedCertificateType`](./QualifiedCertificateType.md) |  |

---

## Propriedades

### `Type` {#type}

```csharp
public QualifiedCertificateType Type { get; }
```

**Retorno**

[`QualifiedCertificateType`](./QualifiedCertificateType.md)

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

### `GetStatementText()` {#getstatementtext}

```csharp
protected override string GetStatementText()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`Compliance`](./QualifiedCertificateStatement.md#compliance), [`QualifiedDevice`](./QualifiedCertificateStatement.md#qualifieddevice), [`ToString()`](./QualifiedCertificateStatement.md#tostring), [`StatementId`](./QualifiedCertificateStatement.md#statementid), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
