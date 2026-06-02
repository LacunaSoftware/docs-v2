---
sidebar_label: "QualifiedCertificateStatementsExtension"
---

# QualifiedCertificateStatementsExtension

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class QualifiedCertificateStatementsExtension
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `QualifiedCertificateStatementsExtension`

## Propriedades

### `CertificateType` {#certificatetype}

```csharp
public QualifiedCertificateType CertificateType { get; }
```

**Retorno**

[`QualifiedCertificateType`](./QualifiedCertificateType.md)

---

### `HasComplianceStatement` {#hascompliancestatement}

```csharp
public bool HasComplianceStatement { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `HasQualifiedDeviceStatement` {#hasqualifieddevicestatement}

```csharp
public bool HasQualifiedDeviceStatement { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsCritical` {#iscritical}

```csharp
public bool IsCritical { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `LegislationCountries` {#legislationcountries}

```csharp
public List<string> LegislationCountries { get; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `RetentionPeriodYears` {#retentionperiodyears}

```csharp
public int? RetentionPeriodYears { get; }
```

**Retorno**

[`int?`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `Statements` {#statements}

```csharp
public List<QualifiedCertificateStatement> Statements { get; }
```

**Retorno**

[`List<QualifiedCertificateStatement>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
