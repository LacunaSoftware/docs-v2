---
sidebar_label: "CertificateSelectorByKeyIdentifier"
---

# CertificateSelectorByKeyIdentifier

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CertificateSelectorByKeyIdentifier
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CertificateSelectorByKeyIdentifier`

## Construtores

### `CertificateSelectorByKeyIdentifier(byte[])` {#ctor-system-byte}

```csharp
public CertificateSelectorByKeyIdentifier(byte[] keyIdentifier)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `keyIdentifier` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

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
