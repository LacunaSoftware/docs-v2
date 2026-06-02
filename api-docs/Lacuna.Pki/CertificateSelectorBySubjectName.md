---
sidebar_label: "CertificateSelectorBySubjectName"
---

# CertificateSelectorBySubjectName

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CertificateSelectorBySubjectName
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CertificateSelectorBySubjectName`

## Construtores

### `CertificateSelectorBySubjectName(Name)` {#ctor-lacuna-pki-name}

```csharp
public CertificateSelectorBySubjectName(Name subjectName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `subjectName` | [`Name`](./Name.md) |  |

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
