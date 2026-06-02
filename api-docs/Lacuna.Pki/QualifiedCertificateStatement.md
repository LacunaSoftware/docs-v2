---
sidebar_label: "QualifiedCertificateStatement"
---

# QualifiedCertificateStatement

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class QualifiedCertificateStatement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `QualifiedCertificateStatement`

## Construtores

### `QualifiedCertificateStatement(string)` {#ctor-system-string}

```csharp
public QualifiedCertificateStatement(string statementId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `statementId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Campos

### `Compliance` {#compliance}

```csharp
public static readonly QualifiedCertificateStatement Compliance
```

**Retorno**

[`QualifiedCertificateStatement`](./QualifiedCertificateStatement.md)

---

### `QualifiedDevice` {#qualifieddevice}

```csharp
public static readonly QualifiedCertificateStatement QualifiedDevice
```

**Retorno**

[`QualifiedCertificateStatement`](./QualifiedCertificateStatement.md)

---

## Propriedades

### `StatementId` {#statementid}

```csharp
public string StatementId { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object obj)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `obj` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

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
protected virtual string GetStatementText()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `ToString()` {#tostring}

```csharp
public override string ToString()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
