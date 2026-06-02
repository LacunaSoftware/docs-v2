---
sidebar_label: "CadesTimestamp"
---

# CadesTimestamp

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

Class for viewing CAdES signature elements and validation

```csharp
public class CadesTimestamp : CadesSignature, ICertificateStore
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`CadesSignature`](./CadesSignature.md) → `CadesTimestamp`

## Propriedades

### `GenTime` {#gentime}

```csharp
public DateTimeOffset GenTime { get; }
```

**Retorno**

[`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `TstInfo` {#tstinfo}

```csharp
public TstInfo TstInfo { get; }
```

**Retorno**

[`TstInfo`](../Lacuna.Pki/TstInfo.md)

---

## Métodos

### `Open(byte[])` {#open-system-byte}

Open a CAdES timestamp

```csharp
public static CadesTimestamp Open(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | CAdES timestamp content bytes |

**Retorno**

[`CadesTimestamp`](./CadesTimestamp.md) — CAdES timestamp object

---

### `Open(Stream)` {#open-system-io-stream}

Open a CAdES timestamp

```csharp
public static CadesTimestamp Open(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | CAdES timestamp content stream |

**Retorno**

[`CadesTimestamp`](./CadesTimestamp.md) — CAdES timestamp object

---

## Membros herdados

[`Open(string)`](./CadesSignature.md#open-system-string), [`GetEncapsulatedContent()`](./CadesSignature.md#getencapsulatedcontent), [`WriteEncapsulatedContent(Stream)`](./CadesSignature.md#writeencapsulatedcontent-system-io-stream), [`SetExternalData(Stream)`](./CadesSignature.md#setexternaldata-system-io-stream), [`SetExternalData(byte[])`](./CadesSignature.md#setexternaldata-system-byte), [`SetExternalData(string)`](./CadesSignature.md#setexternaldata-system-string), [`SetExternalDataDigest(DigestAlgorithm, byte[])`](./CadesSignature.md#setexternaldatadigest-lacuna-pki-digestalgorithm-system-byte), [`ValidateAllSignatures(CadesPolicySpec, ValidationContext)`](./CadesSignature.md#validateallsignatures-lacuna-pki-cades-cadespolicyspec-lacuna-pki-stores-validationcontext), [`ValidateAllSignatures(ICadesPolicyMapper, ValidationContext)`](./CadesSignature.md#validateallsignatures-lacuna-pki-cades-icadespolicymapper-lacuna-pki-stores-validationcontext), [`ValidateAllSignatures(ICadesPolicyMapperBySignerInfo, ValidationContext)`](./CadesSignature.md#validateallsignatures-lacuna-pki-cades-icadespolicymapperbysignerinfo-lacuna-pki-stores-validationcontext), [`ValidateAllSignatures(CadesPolicySpec, DateTimeOffset?, IReferencedCrlStore)`](./CadesSignature.md#validateallsignatures-lacuna-pki-cades-cadespolicyspec-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore), [`ValidateAllSignatures(ICadesPolicyMapper, DateTimeOffset?, IReferencedCrlStore)`](./CadesSignature.md#validateallsignatures-lacuna-pki-cades-icadespolicymapper-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore), [`ValidateAllSignatures(ICadesPolicyMapperBySignerInfo, DateTimeOffset?, IReferencedCrlStore)`](./CadesSignature.md#validateallsignatures-lacuna-pki-cades-icadespolicymapperbysignerinfo-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore), [`ValidateSignature(CadesSignerInfo, CadesPolicySpec, ValidationContext)`](./CadesSignature.md#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-cadespolicyspec-lacuna-pki-stores-validationcontext), [`ValidateSignature(CadesSignerInfo, ICadesPolicyMapper, ValidationContext)`](./CadesSignature.md#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-icadespolicymapper-lacuna-pki-stores-validationcontext), [`ValidateSignature(CadesSignerInfo, ICadesPolicyMapperBySignerInfo, ValidationContext)`](./CadesSignature.md#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-icadespolicymapperbysignerinfo-lacuna-pki-stores-validationcontext), [`ValidateSignature(CadesSignerInfo, CadesPolicySpec, DateTimeOffset?, IReferencedCrlStore)`](./CadesSignature.md#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-cadespolicyspec-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore), [`ValidateSignature(CadesSignerInfo, ICadesPolicyMapper, DateTimeOffset?, IReferencedCrlStore)`](./CadesSignature.md#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-icadespolicymapper-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore), [`ValidateSignature(CadesSignerInfo, ICadesPolicyMapperBySignerInfo, DateTimeOffset?, IReferencedCrlStore)`](./CadesSignature.md#validatesignature-lacuna-pki-cades-cadessignerinfo-lacuna-pki-cades-icadespolicymapperbysignerinfo-system-nullable-system-datetimeoffset-lacuna-pki-stores-ireferencedcrlstore), [`EncodedValue`](./CadesSignature.md#encodedvalue), [`Signers`](./CadesSignature.md#signers), [`EncapsulatedContentType`](./CadesSignature.md#encapsulatedcontenttype), [`HasEncapsulatedContent`](./CadesSignature.md#hasencapsulatedcontent), [`Crls`](./CadesSignature.md#crls), [`Certificates`](./CadesSignature.md#certificates), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
