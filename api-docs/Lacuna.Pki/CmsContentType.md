---
sidebar_label: "CmsContentType"
---

# CmsContentType

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CmsContentType
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CmsContentType`

## Campos

### `AuthenticatedData` {#authenticateddata}

```csharp
public static CmsContentType AuthenticatedData
```

**Retorno**

[`CmsContentType`](./CmsContentType.md)

---

### `Data` {#data}

```csharp
public static CmsContentType Data
```

**Retorno**

[`CmsContentType`](./CmsContentType.md)

---

### `DigestedData` {#digesteddata}

```csharp
public static CmsContentType DigestedData
```

**Retorno**

[`CmsContentType`](./CmsContentType.md)

---

### `EncryptedData` {#encrypteddata}

```csharp
public static CmsContentType EncryptedData
```

**Retorno**

[`CmsContentType`](./CmsContentType.md)

---

### `EnvelopedData` {#envelopeddata}

```csharp
public static CmsContentType EnvelopedData
```

**Retorno**

[`CmsContentType`](./CmsContentType.md)

---

### `SignedData` {#signeddata}

```csharp
public static CmsContentType SignedData
```

**Retorno**

[`CmsContentType`](./CmsContentType.md)

---

### `TstInfo` {#tstinfo}

```csharp
public static CmsContentType TstInfo
```

**Retorno**

[`CmsContentType`](./CmsContentType.md)

---

## Propriedades

### `Name` {#name}

```csharp
public string Name { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Oid` {#oid}

```csharp
public string Oid { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `Equals(CmsContentType)` {#equals-lacuna-pki-cmscontenttype}

```csharp
public bool Equals(CmsContentType other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`CmsContentType`](./CmsContentType.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

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

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `GetInstanceByOid(string)` {#getinstancebyoid-system-string}

```csharp
public static CmsContentType GetInstanceByOid(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`CmsContentType`](./CmsContentType.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
