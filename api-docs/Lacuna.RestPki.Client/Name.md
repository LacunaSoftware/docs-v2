---
sidebar_label: "Name"
---

# Name

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class Name
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Name`

## Propriedades

### `CommonName` {#commonname}

```csharp
public string CommonName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Country` {#country}

```csharp
public string Country { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DNQualifier` {#dnqualifier}

```csharp
public string DNQualifier { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `EmailAddress` {#emailaddress}

```csharp
public string EmailAddress { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GenerationQualifier` {#generationqualifier}

```csharp
public string GenerationQualifier { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GivenName` {#givenname}

```csharp
public string GivenName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Initials` {#initials}

```csharp
public string Initials { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Locality` {#locality}

```csharp
public string Locality { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Organization` {#organization}

```csharp
public string Organization { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `OrganizationUnit` {#organizationunit}

```csharp
public string OrganizationUnit { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Pseudonym` {#pseudonym}

```csharp
public string Pseudonym { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SerialNumber` {#serialnumber}

```csharp
public string SerialNumber { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StateName` {#statename}

```csharp
public string StateName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Surname` {#surname}

```csharp
public string Surname { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TelephoneNumber` {#telephonenumber}

The telephone number, as defined by X.520 (id-at-telephoneNumber)

```csharp
public string TelephoneNumber { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Title` {#title}

```csharp
public string Title { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `GetAllValues()` {#getallvalues}

Returns all the values present on this Name

```csharp
public Dictionary<string, List<string>> GetAllValues()
```

**Retorno**

[`Dictionary<string, List<string>>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `GetValue(string)` {#getvalue-system-string}

Returns the value associated with a given key OID.

```csharp
public string GetValue(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string) — The value associated with the given key OID. If the given key is not present, returns null. If multiple values are present, returns a concatenation of the values separated by ", "

**Comentários**

See class Name.Oids for the known key OIDs.

---

### `GetValues(string)` {#getvalues-system-string}

Returns the collection of values associated with a given key OID

```csharp
public List<string> GetValues(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) — The values associated with the given key OID. If the given key is not present, an empty list is returned.

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
