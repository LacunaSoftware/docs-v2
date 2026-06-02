---
sidebar_label: "Name"
---

# Name

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class Name
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Name`

## Propriedades

### `CommonName` {#commonname}

```csharp
public string CommonName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Country` {#country}

```csharp
public string Country { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DNQualifier` {#dnqualifier}

```csharp
public string DNQualifier { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DomainComponent` {#domaincomponent}

```csharp
public string DomainComponent { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `EmailAddress` {#emailaddress}

```csharp
public string EmailAddress { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `EncodedValue` {#encodedvalue}

```csharp
public byte[] EncodedValue { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GenerationQualifier` {#generationqualifier}

```csharp
public string GenerationQualifier { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GivenName` {#givenname}

```csharp
public string GivenName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Initials` {#initials}

```csharp
public string Initials { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Locality` {#locality}

```csharp
public string Locality { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Organization` {#organization}

```csharp
public string Organization { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `OrganizationIdentifier` {#organizationidentifier}

```csharp
public string OrganizationIdentifier { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `OrganizationUnit` {#organizationunit}

```csharp
public string OrganizationUnit { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `PostalCode` {#postalcode}

```csharp
public string PostalCode { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Pseudonym` {#pseudonym}

```csharp
public string Pseudonym { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SerialNumber` {#serialnumber}

```csharp
public string SerialNumber { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StateName` {#statename}

```csharp
public string StateName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StreetAddress` {#streetaddress}

```csharp
public string StreetAddress { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Surname` {#surname}

```csharp
public string Surname { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `this[string]` {#item-system-string}

```csharp
public string this[string typeOid] { get; }
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `typeOid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Title` {#title}

```csharp
public string Title { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `UserId` {#userid}

```csharp
public string UserId { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

```csharp
public static Name Decode(byte[] x509NameDerEncoded)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `x509NameDerEncoded` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`Name`](./Name.md)

---

### `GetAllValues()` {#getallvalues}

```csharp
public Dictionary<string, List<string>> GetAllValues()
```

**Retorno**

[`Dictionary<string, List<string>>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `GetTypeOids()` {#gettypeoids}

```csharp
public List<string> GetTypeOids()
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetValue(string)` {#getvalue-system-string}

```csharp
public string GetValue(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GetValues(string)` {#getvalues-system-string}

```csharp
public List<string> GetValues(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `IsEncodingIdentical(Name)` {#isencodingidentical-lacuna-pki-name}

```csharp
public bool IsEncodingIdentical(Name other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`Name`](./Name.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsEquivalent(Name)` {#isequivalent-lacuna-pki-name}

```csharp
public bool IsEquivalent(Name other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`Name`](./Name.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ToString()` {#tostring}

```csharp
public override string ToString()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `ToString(bool)` {#tostring-system-boolean}

```csharp
public string ToString(bool reverse)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `reverse` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
