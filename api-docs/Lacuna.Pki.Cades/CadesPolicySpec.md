---
sidebar_label: "CadesPolicySpec"
---

# CadesPolicySpec

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for setting Cades signature policy specifications

```csharp
public class CadesPolicySpec : ITrustArbitrator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesPolicySpec`

## Construtores

### `CadesPolicySpec()` {#ctor}

```csharp
public CadesPolicySpec()
```

---

## Propriedades

### `AttributeGeneration` {#attributegeneration}

```csharp
public CadesPolicySpec.AttributeGenerationSpec AttributeGeneration { get; set; }
```

**Retorno**

[`CadesPolicySpec.AttributeGenerationSpec`](./CadesPolicySpec.AttributeGenerationSpec.md)

---

### `AttributeValidation` {#attributevalidation}

```csharp
public CadesPolicySpec.AttributeValidationSpec AttributeValidation { get; set; }
```

**Retorno**

[`CadesPolicySpec.AttributeValidationSpec`](./CadesPolicySpec.AttributeValidationSpec.md)

---

### `CadesCTimestampPolicy` {#cadesctimestamppolicy}

```csharp
public CadesPolicySpec CadesCTimestampPolicy { get; set; }
```

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `CurrentArchiveTimestampPolicy` {#currentarchivetimestamppolicy}

```csharp
public CadesPolicySpec CurrentArchiveTimestampPolicy { get; set; }
```

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `DigestAlgorithms` {#digestalgorithms}

```csharp
public List<DigestAlgorithm> DigestAlgorithms { get; set; }
```

**Retorno**

[`List<DigestAlgorithm>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `ForceSigningCertificateV1` {#forcesigningcertificatev1}

```csharp
public bool ForceSigningCertificateV1 { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GracePeriodCatalog` {#graceperiodcatalog}

```csharp
public IGracePeriodCatalog GracePeriodCatalog { get; set; }
```

**Retorno**

[`IGracePeriodCatalog`](../Lacuna.Pki/IGracePeriodCatalog.md)

---

### `PolicyDigest` {#policydigest}

```csharp
public DigestAlgorithmAndValue PolicyDigest { get; set; }
```

**Retorno**

[`DigestAlgorithmAndValue`](../Lacuna.Pki/DigestAlgorithmAndValue.md)

---

### `PolicyOid` {#policyoid}

```csharp
public string PolicyOid { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `PolicyUri` {#policyuri}

```csharp
public Uri PolicyUri { get; set; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `PreviousArchiveTimestampPolicy` {#previousarchivetimestamppolicy}

```csharp
public CadesPolicySpec PreviousArchiveTimestampPolicy { get; set; }
```

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `RevocationDate` {#revocationdate}

```csharp
public DateTimeOffset RevocationDate { get; set; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `SignatureAlgorithms` {#signaturealgorithms}

```csharp
public List<SignatureAlgorithm> SignatureAlgorithms { get; set; }
```

**Retorno**

[`List<SignatureAlgorithm>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `SignatureTimestampPolicy` {#signaturetimestamppolicy}

```csharp
public CadesPolicySpec SignatureTimestampPolicy { get; set; }
```

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

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

## Métodos

### `AddTrustArbitrator(ITrustArbitrator, bool)` {#addtrustarbitrator-lacuna-pki-itrustarbitrator-system-boolean}

Add a trust root arbitrator to the policy spec. The policy spec needs at least one arbitrator added.

```csharp
public void AddTrustArbitrator(ITrustArbitrator arbitrator, bool propagateToTimestampPolicies = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |
| `propagateToTimestampPolicies` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `AddTrustArbitrator(params ITrustArbitrator[])` {#addtrustarbitrator-lacuna-pki-itrustarbitrator}

Add a trust root arbitrator to the policy spec. The policy spec needs at least one arbitrator added.

```csharp
public void AddTrustArbitrator(params ITrustArbitrator[] arbitrators)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrators` | `ITrustArbitrator[]` |  |

---

### `CheckIntegrity()` {#checkintegrity}

```csharp
public void CheckIntegrity()
```

---

### `ClearTrustArbitrator(bool)` {#cleartrustarbitrator-system-boolean}

Clear the trust arbitrators in this policy spec

```csharp
public void ClearTrustArbitrator(bool propagateToTimestampPolicies = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `propagateToTimestampPolicies` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

---

### `GetCadesA(ITrustArbitrator)` {#getcadesa-lacuna-pki-itrustarbitrator}

```csharp
public static CadesPolicySpec GetCadesA(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `GetCadesBes(ITrustArbitrator)` {#getcadesbes-lacuna-pki-itrustarbitrator}

```csharp
public static CadesPolicySpec GetCadesBes(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `GetCadesC(ITrustArbitrator)` {#getcadesc-lacuna-pki-itrustarbitrator}

```csharp
public static CadesPolicySpec GetCadesC(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `GetCadesT(ITrustArbitrator)` {#getcadest-lacuna-pki-itrustarbitrator}

```csharp
public static CadesPolicySpec GetCadesT(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `GetCadesXLong(ITrustArbitrator)` {#getcadesxlong-lacuna-pki-itrustarbitrator}

```csharp
public static CadesPolicySpec GetCadesXLong(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `GetCadesXLongType1(ITrustArbitrator)` {#getcadesxlongtype1-lacuna-pki-itrustarbitrator}

```csharp
public static CadesPolicySpec GetCadesXLongType1(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `GetCadesXType1(ITrustArbitrator)` {#getcadesxtype1-lacuna-pki-itrustarbitrator}

```csharp
public static CadesPolicySpec GetCadesXType1(ITrustArbitrator arbitrator = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

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

### `IsRootTrusted(PKCertificate, DateTimeOffset?, out ValidationResults)` {#isroottrusted-lacuna-pki-pkcertificate-system-nullable-system-datetimeoffset-lacuna-pki-validationresults}

Determines whether a given PKCertificate is trusted, optionally outputting a ValidationResults object
that represents validations done while asserting the trust status.

```csharp
public virtual bool IsRootTrusted(PKCertificate root, DateTimeOffset? dateReference, out ValidationResults vr)
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

### `SetGracePeriod(TimeSpan)` {#setgraceperiod-system-timespan}

The time period that permits the certificate revocation information to propagate through the revocation process to relying parties

```csharp
public void SetGracePeriod(TimeSpan gracePeriod)
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
