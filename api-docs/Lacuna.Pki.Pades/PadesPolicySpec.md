---
sidebar_label: "PadesPolicySpec"
---

# PadesPolicySpec

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PadesPolicySpec : ITrustArbitrator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesPolicySpec`

## Construtores

### `PadesPolicySpec()` {#ctor}

```csharp
public PadesPolicySpec()
```

---

## Propriedades

### `DigestAlgorithms` {#digestalgorithms}

```csharp
public List<DigestAlgorithm> DigestAlgorithms { get; set; }
```

**Retorno**

[`List<DigestAlgorithm>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `SignatureAlgorithms` {#signaturealgorithms}

```csharp
public List<SignatureAlgorithm> SignatureAlgorithms { get; set; }
```

**Retorno**

[`List<SignatureAlgorithm>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `SignerSpecs` {#signerspecs}

Policies for PadesSigner signature creation or validation

```csharp
public SignerSpecs SignerSpecs { get; set; }
```

**Retorno**

[`SignerSpecs`](./SignerSpecs.md)

---

### `SigningPeriodEnd` {#signingperiodend}

```csharp
public DateTimeOffset SigningPeriodEnd { get; set; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `SigningPeriodStart` {#signingperiodstart}

```csharp
public DateTimeOffset SigningPeriodStart { get; set; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `StamperSpecs` {#stamperspecs}

Policies for timestamp creation and validation through PadesTimestamper

```csharp
public StamperSpecs StamperSpecs { get; set; }
```

**Retorno**

[`StamperSpecs`](./StamperSpecs.md)

---

## Métodos

### `AddTrustArbitrator(IEnumerable<ITrustArbitrator>)` {#addtrustarbitrator-system-collections-generic-ienumerable-lacuna-pki-itrustarbitrator}

```csharp
public void AddTrustArbitrator(IEnumerable<ITrustArbitrator> arbitrators)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrators` | [`IEnumerable<ITrustArbitrator>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

---

### `AddTrustArbitrator(ITrustArbitrator, bool)` {#addtrustarbitrator-lacuna-pki-itrustarbitrator-system-boolean}

```csharp
public void AddTrustArbitrator(ITrustArbitrator arbitrator, bool propagateToTimestampPolicies = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |
| `propagateToTimestampPolicies` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `ClearTrustArbitrators(bool)` {#cleartrustarbitrators-system-boolean}

```csharp
public void ClearTrustArbitrators(bool propagateToTimestampPolicies = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `propagateToTimestampPolicies` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `GetBasic(ITrustArbitrator)` {#getbasic-lacuna-pki-itrustarbitrator}

Returns PAdES-BES signature policy

```csharp
public static PadesPolicySpec GetBasic(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) | The TrustArbitrator for certificates validation. If omitted, Windows roots are used. |

**Retorno**

[`PadesPolicySpec`](./PadesPolicySpec.md)

---

### `GetCertificateStore()` {#getcertificatestore}

Returns a certificate store based on the arbitrator root certificates

```csharp
public ICertificateStore GetCertificateStore()
```

**Retorno**

[`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) — Certificate store based on the arbitrator root certificates. Can be null.

**Comentários**

If that method does not make sense for your implementation or there is
            no certificate in your arbitrator logic, it can return null.

---

### `GetFailureLevel(ValidationItemTypes)` {#getfailurelevel-lacuna-pki-validationitemtypes}

```csharp
public ValidationFailureLevels GetFailureLevel(ValidationItemTypes failureType)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `failureType` | [`ValidationItemTypes`](../Lacuna.Pki/ValidationItemTypes.md) |  |

**Retorno**

[`ValidationFailureLevels`](../Lacuna.Pki/ValidationFailureLevels.md)

---

### `GetPadesT(ITrustArbitrator)` {#getpadest-lacuna-pki-itrustarbitrator}

```csharp
public static PadesPolicySpec GetPadesT(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`PadesPolicySpec`](./PadesPolicySpec.md)

---

### `IsRootTrusted(PKCertificate, DateTimeOffset?, out ValidationResults)` {#isroottrusted-lacuna-pki-pkcertificate-system-nullable-system-datetimeoffset-lacuna-pki-validationresults}

Determines whether a given PKCertificate is trusted, optionally outputting a ValidationResults object
that represents validations done while asserting the trust status.

```csharp
public bool IsRootTrusted(PKCertificate root, DateTimeOffset? dateReference, out ValidationResults vr)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `root` | [`PKCertificate`](../Lacuna.Pki/PKCertificate.md) | The certificate for which the trust status must be determined. |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | An optional date reference on which the trust is to be asserted. If null, validation is done considering the present moment (now). |
| `vr` | [`ValidationResults`](../Lacuna.Pki/ValidationResults.md) | The retults of the validations necessary to assertain the trust status. Implementors of this interface should set this parameter to null             if no validations where required. |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) — Whether the given certificate is to be trusted or not.

---

### `SetFailureLevel(ValidationItemTypes, ValidationFailureLevels)` {#setfailurelevel-lacuna-pki-validationitemtypes-lacuna-pki-validationfailurelevels}

```csharp
public void SetFailureLevel(ValidationItemTypes failureType, ValidationFailureLevels level)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `failureType` | [`ValidationItemTypes`](../Lacuna.Pki/ValidationItemTypes.md) |  |
| `level` | [`ValidationFailureLevels`](../Lacuna.Pki/ValidationFailureLevels.md) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
