---
sidebar_label: "DssEntry"
---

# DssEntry

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class DssEntry
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `DssEntry`

## Construtores

### `DssEntry(string, PKCertificate, ValidationResults)` {#ctor-system-string-lacuna-pki-pkcertificate-lacuna-pki-validationresults}

```csharp
public DssEntry(string fieldName, PKCertificate signingCertificate, ValidationResults vr)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `fieldName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `signingCertificate` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) |  |
| `vr` | [`ValidationResults`](../Lacuna.Pki/ValidationResults.md) |  |

---

## Propriedades

### `SignatureFieldName` {#signaturefieldname}

```csharp
public string SignatureFieldName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SigningCertificate` {#signingcertificate}

```csharp
public PKCertificate SigningCertificate { get; set; }
```

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md)

---

### `Vr` {#vr}

```csharp
public ValidationResults Vr { get; set; }
```

**Retorno**

[`ValidationResults`](../Lacuna.Pki/ValidationResults.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
