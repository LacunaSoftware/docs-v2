---
sidebar_label: "Pkcs7CertificateStore"
---

# Pkcs7CertificateStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class Pkcs7CertificateStore : ICertificateStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Pkcs7CertificateStore`

## Propriedades

### `Certificates` {#certificates}

```csharp
public List<PKCertificate> Certificates { get; }
```

**Retorno**

[`List<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

Decodes a PKCS#7 certificate store

```csharp
public static Pkcs7CertificateStore Decode(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The BER/DER or PEM encoded PKCS#7 content |

**Retorno**

[`Pkcs7CertificateStore`](./Pkcs7CertificateStore.md)

---

### `Decode(string)` {#decode-system-string}

Decodes a PKCS#7 certificate store

```csharp
public static Pkcs7CertificateStore Decode(string content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The PEM encoded or Base64 encoded PKCS#7 string |

**Retorno**

[`Pkcs7CertificateStore`](./Pkcs7CertificateStore.md)

---

### `Encode(IEnumerable<PKCertificate>)` {#encode-system-collections-generic-ienumerable-lacuna-pki-pkcertificate}

Encodes a certificate list as DER PKCS#7 certificate store

```csharp
public static byte[] Encode(IEnumerable<PKCertificate> certificates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificates` | [`IEnumerable<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.ienumerable-1) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — PKC#7 certificate store DER encoded bytes

---

### `GetCertificate(byte[])` {#getcertificate-system-byte}

Find a certificate by its Key Identifier

```csharp
public PKCertificate GetCertificate(byte[] keyIdentifier)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `keyIdentifier` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md)

---

### `GetCertificate(Name, BigInteger)` {#getcertificate-lacuna-pki-name-system-numerics-biginteger}

Find a certificate by its Issuer Name and Serial Number

```csharp
public PKCertificate GetCertificate(Name issuerName, BigInteger serialNumber)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `issuerName` | [`Name`](../Lacuna.Pki/Name.md) | Certificate's issuer name |
| `serialNumber` | [`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger) | Certificate's serial number |

**Retorno**

[`PKCertificate`](../Lacuna.Pki/PKCertificate.md)

---

### `GetCertificates(Name)` {#getcertificates-lacuna-pki-name}

Find one or more certificates by its Subject Name

```csharp
public List<PKCertificate> GetCertificates(Name subjectName)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `subjectName` | [`Name`](../Lacuna.Pki/Name.md) |  |

**Retorno**

[`List<PKCertificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
