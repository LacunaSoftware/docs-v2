---
sidebar_label: "XmlPolicySpec"
---

# XmlPolicySpec

**Namespace:** `Lacuna.Pki.Xml`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class XmlPolicySpec : ITrustArbitrator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlPolicySpec`

## Construtores

### `XmlPolicySpec()` {#ctor}

```csharp
public XmlPolicySpec()
```

---

## Propriedades

### `ArchiveTimestampPolicy` {#archivetimestamppolicy}

```csharp
public CadesPolicySpec ArchiveTimestampPolicy { get; set; }
```

**Retorno**

[`CadesPolicySpec`](../Lacuna.Pki.Cades/CadesPolicySpec.md)

---

### `DigestAlgorithms` {#digestalgorithms}

```csharp
public List<DigestAlgorithm> DigestAlgorithms { get; set; }
```

**Retorno**

[`List<DigestAlgorithm>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Generation` {#generation}

```csharp
public XmlPolicySpec.GenerationSpec Generation { get; set; }
```

**Retorno**

[`XmlPolicySpec.GenerationSpec`](./XmlPolicySpec.GenerationSpec.md)

---

### `PolicyId` {#policyid}

Optionally specifies the policy's OID and other identifying properties.

```csharp
public XmlPolicyIdentifier PolicyId { get; set; }
```

**Retorno**

[`XmlPolicyIdentifier`](./XmlPolicyIdentifier.md)

---

### `SigAndRefsTimestampPolicy` {#sigandrefstimestamppolicy}

```csharp
public CadesPolicySpec SigAndRefsTimestampPolicy { get; set; }
```

**Retorno**

[`CadesPolicySpec`](../Lacuna.Pki.Cades/CadesPolicySpec.md)

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

[`CadesPolicySpec`](../Lacuna.Pki.Cades/CadesPolicySpec.md)

---

### `SigningPeriodEnd` {#signingperiodend}

```csharp
public DateTimeOffset? SigningPeriodEnd { get; set; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `SigningPeriodStart` {#signingperiodstart}

```csharp
public DateTimeOffset? SigningPeriodStart { get; set; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `Validation` {#validation}

```csharp
public XmlPolicySpec.ValidationSpec Validation { get; set; }
```

**Retorno**

[`XmlPolicySpec.ValidationSpec`](./XmlPolicySpec.ValidationSpec.md)

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

### `ClearTrustArbitrators(bool)` {#cleartrustarbitrators-system-boolean}

Clear the trust arbitrators in this policy spec

```csharp
public void ClearTrustArbitrators(bool propagateToTimestampPolicies = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `propagateToTimestampPolicies` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

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

### `GetXadesBasic(ITrustArbitrator, bool)` {#getxadesbasic-lacuna-pki-itrustarbitrator-system-boolean}

```csharp
public static XmlPolicySpec GetXadesBasic(ITrustArbitrator arbitrator, bool includeSigningTime = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |
| `includeSigningTime` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`XmlPolicySpec`](./XmlPolicySpec.md)

---

### `GetXmlDSigBasic(ITrustArbitrator, DigestAlgorithm)` {#getxmldsigbasic-lacuna-pki-itrustarbitrator-lacuna-pki-digestalgorithm}

Returns the XmlDSig basic signature policy using the given digest algorithm for digest computation and also for
signing (RSA is implied).

```csharp
public static XmlPolicySpec GetXmlDSigBasic(ITrustArbitrator arbitrator, DigestAlgorithm preferredDigestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |
| `preferredDigestAlgorithm` | [`DigestAlgorithm`](../Lacuna.Pki/DigestAlgorithm.md) |  |

**Retorno**

[`XmlPolicySpec`](./XmlPolicySpec.md)

---

### `GetXmlDSigBasic(ITrustArbitrator)` {#getxmldsigbasic-lacuna-pki-itrustarbitrator}

```csharp
public static XmlPolicySpec GetXmlDSigBasic(ITrustArbitrator arbitrator)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `arbitrator` | [`ITrustArbitrator`](../Lacuna.Pki/ITrustArbitrator.md) |  |

**Retorno**

[`XmlPolicySpec`](./XmlPolicySpec.md)

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
