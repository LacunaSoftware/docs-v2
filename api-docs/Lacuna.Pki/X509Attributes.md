---
sidebar_label: "X509Attributes"
---

# X509Attributes

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class X509Attributes
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `X509Attributes`

## Propriedades

### `this[string]` {#item-system-string}

```csharp
public X509Attribute this[string oid] { get; }
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`X509Attribute`](./X509Attribute.md)

---

## Métodos

### `Get(string, bool)` {#get-system-string-system-boolean}

```csharp
public X509Attribute Get(string oid, bool throwOnNotFound = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `throwOnNotFound` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`X509Attribute`](./X509Attribute.md)

---

### `GetAccessIdentities()` {#getaccessidentities}

Returns a list of Access Identity attribute (RFC 5755 item 4.4.2) values found on this collection of attributes, or an empty
list if no AccessIdentity attribute is present.

```csharp
public List<AccessIdentityAttribute> GetAccessIdentities()
```

**Retorno**

[`List<AccessIdentityAttribute>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

**Comentários**

This method will throw a FormatException if a malformed attribute is found. To avoid this, use the TryGetAccessIdentities() method instead.

---

### `GetAndDecodeValueAs<T>(string, bool)` {#getanddecodevalueas-1-system-string-system-boolean}

```csharp
public T GetAndDecodeValueAs<T>(string oid, bool throwOnNotFound = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `throwOnNotFound` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

**Retorno**

`T`

---

### `GetAndDecodeValuesAs<T>(string, bool)` {#getanddecodevaluesas-1-system-string-system-boolean}

```csharp
public List<T> GetAndDecodeValuesAs<T>(string oid, bool throwOnNotFound = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `throwOnNotFound` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Parâmetros de tipo**

| Nome | Descrição |
|---|---|
| `T` |  |

**Retorno**

[`List<T>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetAuthenticationInfos()` {#getauthenticationinfos}

Returns a list of Service Authentication Information attribute (RFC 5755 item 4.4.1) values found on this collection of attributes, or an empty
list if no Service Authentication Information attribute is present.

```csharp
public List<AuthenticationInfoAttribute> GetAuthenticationInfos()
```

**Retorno**

[`List<AuthenticationInfoAttribute>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

**Comentários**

This method will throw a FormatException if a malformed attribute is found. To avoid this, use the TryGetAuthenticationInfos() method instead.

---

### `GetOids()` {#getoids}

```csharp
public List<string> GetOids()
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetRole(bool)` {#getrole-system-boolean}

```csharp
[Obsolete("Use methods GetRoles() or TryGetRoles() instead, since multiple roles may be present")]
public RoleAttribute GetRole(bool throwOnNotFound = true)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `throwOnNotFound` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`RoleAttribute`](../Lacuna.Pki.Certificates.Attributes/RoleAttribute.md)

---

### `GetRoles()` {#getroles}

Returns a list of Role attribute (RFC 5755 item 4.4.5) values found on this collection of attributes, or an empty
list if no Role attribute is present.

```csharp
public List<RoleAttribute> GetRoles()
```

**Retorno**

[`List<RoleAttribute>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

**Comentários**

This method will throw a FormatException if a malformed attribute is found. To avoid this, use the TryGetRoles() method instead.

---

### `GetRoles(bool)` {#getroles-system-boolean}

```csharp
[Obsolete("Use methods GetRoles() or TryGetRoles() instead, which are more clear regarding exception handling")]
public List<RoleAttribute> GetRoles(bool throwOnNotFound)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `throwOnNotFound` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |

**Retorno**

[`List<RoleAttribute>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `TryGetAccessIdentities(out List<AccessIdentityAttribute>)` {#trygetaccessidentities-system-collections-generic-list-lacuna-pki-certificates-attributes-accessidentityattribute}

Attempts to get a list of Access Identity attribute (RFC 5755 item 4.4.2) values found on this collection of attributes, if any.

```csharp
public bool TryGetAccessIdentities(out List<AccessIdentityAttribute> identities)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `identities` | [`List<AccessIdentityAttribute>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) — true if at least one Access Identity attribute value was found and decoded successfuly, false otherwise.

**Comentários**

Attributes with an invalid encoding are silently ignored by this method. To avoid this, use the GetAccessIdentities() method instead.

---

### `TryGetAuthenticationInfos(out List<AuthenticationInfoAttribute>)` {#trygetauthenticationinfos-system-collections-generic-list-lacuna-pki-certificates-attributes-authenticationinfoattribute}

Attempts to get a list of Service Authentication Information attribute (RFC 5755 item 4.4.1) values found on this collection of attributes, if any.

```csharp
public bool TryGetAuthenticationInfos(out List<AuthenticationInfoAttribute> authInfos)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `authInfos` | [`List<AuthenticationInfoAttribute>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) — true if at least one Service Authentication Information attribute value was found and decoded successfuly, false otherwise.

**Comentários**

Attributes with an invalid encoding are silently ignored by this method. To avoid this, use the GetAuthenticationInfos() method instead.

---

### `TryGetRoles(out List<RoleAttribute>)` {#trygetroles-system-collections-generic-list-lacuna-pki-certificates-attributes-roleattribute}

Attempts to get a list of Role attribute (RFC 5755 item 4.4.5) values found on this collection of attributes, if any.

```csharp
public bool TryGetRoles(out List<RoleAttribute> roles)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `roles` | [`List<RoleAttribute>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) — true if at least one Role attribute value was found and decoded successfuly, false otherwise.

**Comentários**

Attributes with an invalid encoding are silently ignored by this method. To avoid this, use the GetRoles() method instead.

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
