---
sidebar_label: "SignerBStamp"
---

# SignerBStamp

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class SignerBStamp
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignerBStamp`

## Propriedades

### `Blockchain` {#blockchain}

```csharp
public Blockchains Blockchain { get; set; }
```

**Retorno**

`Blockchains`

---

### `CertificateDigests` {#certificatedigests}

```csharp
public IEnumerable<DigestAlgorithmAndValue> CertificateDigests { get; set; }
```

**Retorno**

[`IEnumerable<DigestAlgorithmAndValue>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---

### `CrlsDigests` {#crlsdigests}

```csharp
public IEnumerable<DigestAlgorithmAndValue> CrlsDigests { get; set; }
```

**Retorno**

[`IEnumerable<DigestAlgorithmAndValue>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1)

---

### `SignatureDigest` {#signaturedigest}

```csharp
public DigestAlgorithmAndValue SignatureDigest { get; set; }
```

**Retorno**

[`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md)

---

### `TransactionDate` {#transactiondate}

```csharp
public DateTimeOffset TransactionDate { get; set; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `TransactionId` {#transactionid}

```csharp
public string TransactionId { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
