---
sidebar_label: "ParaguayCertificateFields"
---

# ParaguayCertificateFields

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class ParaguayCertificateFields
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ParaguayCertificateFields`

## Construtores

### `ParaguayCertificateFields(PKCertificate)` {#ctor-lacuna-pki-pkcertificate}

```csharp
public ParaguayCertificateFields(PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](./PKCertificate.md) |  |

---

## Propriedades

### `CertificateType` {#certificatetype}

Los tipos de certificado indicados, definen la escala de requisitos de seguridad exigidos a cada cual;
los tipos F1 y C1 están asociados a requisitos menos rigurosos y los tipos F2 y C2, exigen requisitos
más rigurosos.
Los certificados de firma o de cifrado pueden, conforme a la necesidad, ser emitidos por los PSC, para personas físicas, personas jurídicas,
equipos o aplicaciones.

```csharp
public ParaguayCertificateFields.CertificateTypes CertificateType { get; }
```

**Retorno**

[`ParaguayCertificateFields.CertificateTypes`](./ParaguayCertificateFields.CertificateTypes.md)

---

### `CI` {#ci}

Cédula de identidad

```csharp
public string CI { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `CIE` {#cie}

Cédula de identidad para extranjero

```csharp
public string CIE { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Pasaporte` {#pasaporte}

Pasaporte

```csharp
public string Pasaporte { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `PersonCertificateType` {#personcertificatetype}

```csharp
public ParaguayCertificateFields.PersonCertificateTypes PersonCertificateType { get; }
```

**Retorno**

[`ParaguayCertificateFields.PersonCertificateTypes`](./ParaguayCertificateFields.PersonCertificateTypes.md)

---

### `Responsable` {#responsable}

Nombre y apellido del responsable del certificado

```csharp
public string Responsable { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `RUC` {#ruc}

Registro Único de Contribuyente. Número de Cédula Tributaria correspondiente al Titular.

```csharp
public string RUC { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
