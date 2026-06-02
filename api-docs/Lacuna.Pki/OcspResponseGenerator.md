---
sidebar_label: "OcspResponseGenerator"
---

# OcspResponseGenerator

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class OcspResponseGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `OcspResponseGenerator`

## Construtores

### `OcspResponseGenerator()` {#ctor}

```csharp
public OcspResponseGenerator()
```

---

## Métodos

### `AddGoodStatusResponseEntry(CertificateId)` {#addgoodstatusresponseentry-lacuna-pki-certificateid}

```csharp
public void AddGoodStatusResponseEntry(CertificateId certificateId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificateId` | [`CertificateId`](./CertificateId.md) |  |

---

### `AddRevokedStatusResponseEntry(CertificateId, DateTimeOffset, RevocationReasons)` {#addrevokedstatusresponseentry-lacuna-pki-certificateid-system-datetimeoffset-lacuna-pki-revocationreasons}

```csharp
public void AddRevokedStatusResponseEntry(CertificateId certificateId, DateTimeOffset revocationDate, RevocationReasons revocationReason)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificateId` | [`CertificateId`](./CertificateId.md) |  |
| `revocationDate` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `revocationReason` | [`RevocationReasons`](./RevocationReasons.md) |  |

---

### `AddUnknownStatusResponseEntry(CertificateId)` {#addunknownstatusresponseentry-lacuna-pki-certificateid}

```csharp
public void AddUnknownStatusResponseEntry(CertificateId certificateId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificateId` | [`CertificateId`](./CertificateId.md) |  |

---

### `Generate()` {#generate}

```csharp
public byte[] Generate()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GenerateToSignBytes(out byte[])` {#generatetosignbytes-system-byte}

```csharp
public byte[] GenerateToSignBytes(out byte[] transferData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `transferData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SetIssuer(PKCertificate)` {#setissuer-lacuna-pki-pkcertificate}

```csharp
public void SetIssuer(PKCertificate issuer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuer` | [`PKCertificate`](./PKCertificate.md) |  |

---

### `SetIssuer(PKCertificateWithKey)` {#setissuer-lacuna-pki-pkcertificatewithkey}

```csharp
public void SetIssuer(PKCertificateWithKey issuerWithKey)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuerWithKey` | [`PKCertificateWithKey`](./PKCertificateWithKey.md) |  |

---

### `SetIssuerCertificateInclusion(InclusionLevel)` {#setissuercertificateinclusion-lacuna-pki-inclusionlevel}

```csharp
public void SetIssuerCertificateInclusion(InclusionLevel inclusionLevel)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `inclusionLevel` | [`InclusionLevel`](./InclusionLevel.md) |  |

---

### `SetNextUpdate(DateTimeOffset)` {#setnextupdate-system-datetimeoffset}

```csharp
public void SetNextUpdate(DateTimeOffset nextUpdate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nextUpdate` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

---

### `SetPrecomputedSignature(byte[], byte[])` {#setprecomputedsignature-system-byte-system-byte}

```csharp
public void SetPrecomputedSignature(byte[] signature, byte[] transferData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `transferData` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetResponseStatus(OcspStatus)` {#setresponsestatus-lacuna-pki-ocspstatus}

```csharp
public void SetResponseStatus(OcspStatus status)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `status` | [`OcspStatus`](./OcspStatus.md) |  |

---

### `SetSignatureAlgorithm(SignatureAlgorithm)` {#setsignaturealgorithm-lacuna-pki-signaturealgorithm}

```csharp
public void SetSignatureAlgorithm(SignatureAlgorithm signatureAlg)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signatureAlg` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

---

### `SetThisAndNextUpdateFromNow(TimeSpan)` {#setthisandnextupdatefromnow-system-timespan}

```csharp
public void SetThisAndNextUpdateFromNow(TimeSpan timeToNextUpdate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `timeToNextUpdate` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) |  |

---

### `SetThisUpdate(DateTimeOffset)` {#setthisupdate-system-datetimeoffset}

```csharp
public void SetThisUpdate(DateTimeOffset thisUpdate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `thisUpdate` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
