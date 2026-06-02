---
sidebar_label: "CrlGenerator"
---

# CrlGenerator

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CrlGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CrlGenerator`

## Construtores

### `CrlGenerator()` {#ctor}

```csharp
public CrlGenerator()
```

---

## Propriedades

### `Warnings` {#warnings}

```csharp
public List<string> Warnings { get; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `AddEntry(BigInteger, DateTimeOffset, RevocationReasons)` {#addentry-system-numerics-biginteger-system-datetimeoffset-lacuna-pki-revocationreasons}

```csharp
public void AddEntry(BigInteger certificateSerialNumber, DateTimeOffset revocationDate, RevocationReasons reason = RevocationReasons.Unspecified)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificateSerialNumber` | [`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger) |  |
| `revocationDate` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |
| `reason` | [`RevocationReasons`](./RevocationReasons.md) |  |

---

### `Generate()` {#generate}

```csharp
public Crl Generate()
```

**Retorno**

[`Crl`](./Crl.md)

---

### `GenerateToSignBytes()` {#generatetosignbytes}

```csharp
public byte[] GenerateToSignBytes()
```

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
public void SetPrecomputedSignature(byte[] signature, byte[] toSignBytes)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `toSignBytes` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetSerialNumber(BigInteger)` {#setserialnumber-system-numerics-biginteger}

```csharp
public void SetSerialNumber(BigInteger serialNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `serialNumber` | [`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger) |  |

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
