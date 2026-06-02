---
sidebar_label: "Ocsp"
---

# Ocsp

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class Ocsp
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Ocsp`

## Propriedades

### `Certificates` {#certificates}

```csharp
public List<PKCertificate> Certificates { get; }
```

**Retorno**

[`List<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `CertificateStatus` {#certificatestatus}

The revocation status of the requested certificate

```csharp
public OcspCertificateRevocationStatus CertificateStatus { get; }
```

**Retorno**

[`OcspCertificateRevocationStatus`](./OcspCertificateRevocationStatus.md)

---

### `NextUpdate` {#nextupdate}

```csharp
public DateTimeOffset? NextUpdate { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `ThisUpdate` {#thisupdate}

```csharp
public DateTimeOffset ThisUpdate { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

```csharp
public static Ocsp Decode(byte[] basicOcspRespContent)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `basicOcspRespContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Ocsp`](./Ocsp.md)

---

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object obj)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `obj` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetEncodedValue()` {#getencodedvalue}

Get the OCSP basic  response content

```csharp
public byte[] GetEncodedValue()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The original Ocsp response bytes

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
