---
sidebar_label: "CertificateValidationOptions"
---

# CertificateValidationOptions

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CertificateValidationOptions
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CertificateValidationOptions`

## Construtores

### `CertificateValidationOptions(ITrustArbitrator)` {#ctor-lacuna-pki-itrustarbitrator}

```csharp
public CertificateValidationOptions(ITrustArbitrator trustArbitrator)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `trustArbitrator` | [`ITrustArbitrator`](./ITrustArbitrator.md) |  |

---

## Propriedades

### `CertificateStore` {#certificatestore}

Certificate store to assist the chain loading

```csharp
public ICertificateStore CertificateStore { get; set; }
```

**Retorno**

[`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md)

---

### `DateReference` {#datereference}

The dete reference for the validation. Date time now is the default.

```csharp
public DateTimeOffset? DateReference { get; set; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `PrioritizeOcsp` {#prioritizeocsp}

Denotes if it is to prioritize the revocation status verification by OCSP over CRL.
For an SDK global effect, see PkiConfig.PrioritizeOcsp property.

```csharp
public bool PrioritizeOcsp { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `QuickValidation` {#quickvalidation}

Denotes if it is to quick validate the certificate. Quick validation will ignore any revocation unknownness errors and set it as warnings.

```csharp
public bool QuickValidation { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `TrustArbitrator` {#trustarbitrator}

```csharp
public ITrustArbitrator TrustArbitrator { get; set; }
```

**Retorno**

[`ITrustArbitrator`](./ITrustArbitrator.md)

---

### `ValidateIssuer` {#validateissuer}

```csharp
public bool ValidateIssuer { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ValidateIssuerSignature` {#validateissuersignature}

```csharp
public bool ValidateIssuerSignature { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ValidateRevocationStatus` {#validaterevocationstatus}

```csharp
public bool ValidateRevocationStatus { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ValidateRootTrust` {#validateroottrust}

```csharp
public bool ValidateRootTrust { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ValidateValidity` {#validatevalidity}

```csharp
public bool ValidateValidity { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ValidationContext` {#validationcontext}

A validation context object to be strictly used in certificate validation.
If set, the certificate validation will be performed using the ValidationContext's artifacts alone

```csharp
public ValidationContext ValidationContext { get; set; }
```

**Retorno**

[`ValidationContext`](../Lacuna.Pki.Stores/ValidationContext.md)

---

## Métodos

### `GetFailureLevel(ValidationItemTypes)` {#getfailurelevel-lacuna-pki-validationitemtypes}

```csharp
public ValidationFailureLevels GetFailureLevel(ValidationItemTypes failureType)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `failureType` | [`ValidationItemTypes`](./ValidationItemTypes.md) |  |

**Retorno**

[`ValidationFailureLevels`](./ValidationFailureLevels.md)

---

### `SetFailureLevel(ValidationItemTypes, ValidationFailureLevels)` {#setfailurelevel-lacuna-pki-validationitemtypes-lacuna-pki-validationfailurelevels}

```csharp
public void SetFailureLevel(ValidationItemTypes failureType, ValidationFailureLevels level)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `failureType` | [`ValidationItemTypes`](./ValidationItemTypes.md) |  |
| `level` | [`ValidationFailureLevels`](./ValidationFailureLevels.md) |  |

---

### `SetStaticGracePeriod(TimeSpan)` {#setstaticgraceperiod-system-timespan}

The time period that permits the certificate revocation information to propagate through the revocation process to relying parties

```csharp
public void SetStaticGracePeriod(TimeSpan gracePeriod)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `gracePeriod` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) | Grace period timespan |

**Comentários**

A grace period permits certificate revocation information to propagate through the revocation processes.
This period could extend from the time an authorized entity requests certificate revocation to when the
information is available for the relying party to use. In order to make sure that the certificate was not
revoked at the time the signature was time-marked or time-stamped, verifiers should wait until the end of
the grace period.

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
