---
sidebar_label: "OcspCertificateRevocationStatus"
---

# OcspCertificateRevocationStatus

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class OcspCertificateRevocationStatus
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `OcspCertificateRevocationStatus`

## Propriedades

### `RevocationDate` {#revocationdate}

```csharp
public DateTimeOffset? RevocationDate { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `RevocationReason` {#revocationreason}

```csharp
public RevocationReasons? RevocationReason { get; }
```

**Retorno**

`RevocationReasons?`

---

### `Status` {#status}

```csharp
public OcspCertificateStatus Status { get; }
```

**Retorno**

[`OcspCertificateStatus`](./OcspCertificateStatus.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
