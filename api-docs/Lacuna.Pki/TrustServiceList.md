---
sidebar_label: "TrustServiceList"
---

# TrustServiceList

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class TrustServiceList : ITrustArbitrator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `TrustServiceList`

## Construtores

### `TrustServiceList(Uri, PKCertificate)` {#ctor-system-uri-lacuna-pki-pkcertificate}

```csharp
public TrustServiceList(Uri uri, PKCertificate trustRoot)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `trustRoot` | [`PKCertificate`](./PKCertificate.md) |  |

---

## Métodos

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

### `IsRootTrusted(PKCertificate, DateTimeOffset?, out ValidationResults)` {#isroottrusted-lacuna-pki-pkcertificate-system-nullable-system-datetimeoffset-lacuna-pki-validationresults}

Determines whether a given PKCertificate is trusted, optionally outputting a ValidationResults object
that represents validations done while asserting the trust status.

```csharp
public bool IsRootTrusted(PKCertificate root, DateTimeOffset? dateReference, out ValidationResults vr)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `root` | [`PKCertificate`](./PKCertificate.md) | The certificate for which the trust status must be determined. |
| `dateReference` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | An optional date reference on which the trust is to be asserted. If null, validation is done considering the present moment (now). |
| `vr` | [`ValidationResults`](./ValidationResults.md) | The retults of the validations necessary to assertain the trust status. Implementors of this interface should set this parameter to null             if no validations where required. |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) — Whether the given certificate is to be trusted or not.

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
