---
sidebar_label: "NameModel"
---

# NameModel

**Namespace:** `Lacuna.Pki.Issuer`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class NameModel
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `NameModel`

## Construtores

### `NameModel()` {#ctor}

```csharp
public NameModel()
```

---

## Propriedades

### `BusinessCategory` {#businesscategory}

X.520 id-at-businessCategory

```csharp
public string BusinessCategory { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `CommonName` {#commonname}

X.520 id-at-commonName

```csharp
public string CommonName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Country` {#country}

X.520 id-at-countryName

```csharp
public string Country { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Description` {#description}

X.520 id-at-description

```csharp
public string Description { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DNQualifier` {#dnqualifier}

X.520 id-at-dnQualifier

```csharp
public string DNQualifier { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DomainComponent` {#domaincomponent}

RFC 2247 id-domainComponent

```csharp
public string DomainComponent { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `EmailAddress` {#emailaddress}

PKCS #9 pkcs-9-at-emailAddress

```csharp
public string EmailAddress { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GenerationQualifier` {#generationqualifier}

X.520 id-at-generationQualifier

```csharp
public string GenerationQualifier { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GivenName` {#givenname}

X.520 id-at-givenName

```csharp
public string GivenName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Initials` {#initials}

X.520 id-at-initials

```csharp
public string Initials { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Locality` {#locality}

X.520 id-at-localityName

```csharp
public string Locality { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Organization` {#organization}

X.520 id-at-organizationName

```csharp
public string Organization { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `OrganizationalUnit` {#organizationalunit}

X.520 id-at-organizationalUnitName

```csharp
public ICollection<string> OrganizationalUnit { get; set; }
```

**Retorno**

[`ICollection<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.icollection-1)

---

### `OrganizationIdentifier` {#organizationidentifier}

X.520 id-at-organizationIdentifier

```csharp
public string OrganizationIdentifier { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `PostalCode` {#postalcode}

X.520 id-at-postalCode

```csharp
public string PostalCode { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Pseudonym` {#pseudonym}

X.520 at-pseudonym

```csharp
public string Pseudonym { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SerialNumber` {#serialnumber}

X.520 id-at-serialNumber

```csharp
public string SerialNumber { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StateName` {#statename}

X.520 id-at-streetAddress

```csharp
public string StateName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StreetAddress` {#streetaddress}

X.520 id-at-streetAddress

```csharp
public string StreetAddress { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Surname` {#surname}

X.520 id-at-surname

```csharp
public string Surname { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TelephoneNumber` {#telephonenumber}

X.520 id-at-telephoneNumber

```csharp
public string TelephoneNumber { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Title` {#title}

X.520 id-at-title

```csharp
public string Title { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `UnstructuredAddress` {#unstructuredaddress}

PKCS #9 pkcs-9-at-unstructuredAddress

```csharp
public string UnstructuredAddress { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `UserId` {#userid}

LDAP RFC 4519 uid / RFC 1274 userid

```csharp
public string UserId { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
