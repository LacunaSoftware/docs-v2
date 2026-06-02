---
sidebar_label: "ItalyCadesPolicySpec"
---

# ItalyCadesPolicySpec

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
[Obsolete]
public class ItalyCadesPolicySpec : CadesPolicySpec, ITrustArbitrator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`CadesPolicySpec`](./CadesPolicySpec.md) → `ItalyCadesPolicySpec`

## Construtores

### `ItalyCadesPolicySpec()` {#ctor}

```csharp
public ItalyCadesPolicySpec()
```

---

## Métodos

### `GetCadesBes()` {#getcadesbes}

```csharp
public static CadesPolicySpec GetCadesBes()
```

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

### `GetCadesT()` {#getcadest}

```csharp
public static CadesPolicySpec GetCadesT()
```

**Retorno**

[`CadesPolicySpec`](./CadesPolicySpec.md)

---

## Membros herdados

[`ClearTrustArbitrator(bool)`](./CadesPolicySpec.md#cleartrustarbitrator-system-boolean), [`AddTrustArbitrator(ITrustArbitrator, bool)`](./CadesPolicySpec.md#addtrustarbitrator-lacuna-pki-itrustarbitrator-system-boolean), [`AddTrustArbitrator(params ITrustArbitrator[])`](./CadesPolicySpec.md#addtrustarbitrator-lacuna-pki-itrustarbitrator), [`SetGracePeriod(TimeSpan)`](./CadesPolicySpec.md#setgraceperiod-system-timespan), [`SetFailureLevel(ValidationItemTypes, ValidationFailureLevels)`](./CadesPolicySpec.md#setfailurelevel-lacuna-pki-validationitemtypes-lacuna-pki-validationfailurelevels), [`GetFailureLevel(ValidationItemTypes)`](./CadesPolicySpec.md#getfailurelevel-lacuna-pki-validationitemtypes), [`CheckIntegrity()`](./CadesPolicySpec.md#checkintegrity), [`IsRootTrusted(PKCertificate, DateTimeOffset?, out ValidationResults)`](./CadesPolicySpec.md#isroottrusted-lacuna-pki-pkcertificate-system-nullable-system-datetimeoffset-lacuna-pki-validationresults), [`GetCertificateStore()`](./CadesPolicySpec.md#getcertificatestore), [`GetCadesBes(ITrustArbitrator)`](./CadesPolicySpec.md#getcadesbes-lacuna-pki-itrustarbitrator), [`GetCadesT(ITrustArbitrator)`](./CadesPolicySpec.md#getcadest-lacuna-pki-itrustarbitrator), [`GetCadesC(ITrustArbitrator)`](./CadesPolicySpec.md#getcadesc-lacuna-pki-itrustarbitrator), [`GetCadesXLong(ITrustArbitrator)`](./CadesPolicySpec.md#getcadesxlong-lacuna-pki-itrustarbitrator), [`GetCadesXType1(ITrustArbitrator)`](./CadesPolicySpec.md#getcadesxtype1-lacuna-pki-itrustarbitrator), [`GetCadesXLongType1(ITrustArbitrator)`](./CadesPolicySpec.md#getcadesxlongtype1-lacuna-pki-itrustarbitrator), [`GetCadesA(ITrustArbitrator)`](./CadesPolicySpec.md#getcadesa-lacuna-pki-itrustarbitrator), [`PolicyOid`](./CadesPolicySpec.md#policyoid), [`PolicyDigest`](./CadesPolicySpec.md#policydigest), [`PolicyUri`](./CadesPolicySpec.md#policyuri), [`SigningPeriodStart`](./CadesPolicySpec.md#signingperiodstart), [`SigningPeriodEnd`](./CadesPolicySpec.md#signingperiodend), [`DigestAlgorithms`](./CadesPolicySpec.md#digestalgorithms), [`SignatureAlgorithms`](./CadesPolicySpec.md#signaturealgorithms), [`AttributeGeneration`](./CadesPolicySpec.md#attributegeneration), [`AttributeValidation`](./CadesPolicySpec.md#attributevalidation), [`ForceSigningCertificateV1`](./CadesPolicySpec.md#forcesigningcertificatev1), [`RevocationDate`](./CadesPolicySpec.md#revocationdate), [`GracePeriodCatalog`](./CadesPolicySpec.md#graceperiodcatalog), [`SignatureTimestampPolicy`](./CadesPolicySpec.md#signaturetimestamppolicy), [`CadesCTimestampPolicy`](./CadesPolicySpec.md#cadesctimestamppolicy), [`PreviousArchiveTimestampPolicy`](./CadesPolicySpec.md#previousarchivetimestamppolicy), [`CurrentArchiveTimestampPolicy`](./CadesPolicySpec.md#currentarchivetimestamppolicy), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
