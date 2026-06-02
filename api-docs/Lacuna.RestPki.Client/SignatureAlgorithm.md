---
sidebar_label: "SignatureAlgorithm"
---

# SignatureAlgorithm

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class SignatureAlgorithm
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignatureAlgorithm`

## Construtores

### `SignatureAlgorithm()` {#ctor}

```csharp
protected SignatureAlgorithm()
```

---

## Campos

### `MD5WithRSA` {#md5withrsa}

```csharp
public static readonly SignatureAlgorithm MD5WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA1WithRSA` {#sha1withrsa}

```csharp
public static readonly SignatureAlgorithm SHA1WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA256WithRSA` {#sha256withrsa}

```csharp
public static readonly SignatureAlgorithm SHA256WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA384WithRSA` {#sha384withrsa}

```csharp
public static readonly SignatureAlgorithm SHA384WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `SHA512WithRSA` {#sha512withrsa}

```csharp
public static readonly SignatureAlgorithm SHA512WithRSA
```

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

## Propriedades

### `DigestAlgorithm` {#digestalgorithm}

```csharp
public abstract DigestAlgorithm DigestAlgorithm { get; }
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

### `Name` {#name}

```csharp
public abstract string Name { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Oid` {#oid}

```csharp
public abstract string Oid { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `PKAlgorithm` {#pkalgorithm}

```csharp
public abstract PKAlgorithm PKAlgorithm { get; }
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

### `XmlUri` {#xmluri}

```csharp
public abstract string XmlUri { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

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

### `Equals(SignatureAlgorithm)` {#equals-lacuna-restpki-client-signaturealgorithm}

```csharp
public bool Equals(SignatureAlgorithm other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

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

### `GetInstanceByApiModel(SignatureAlgorithmIdentifier)` {#getinstancebyapimodel-lacuna-restpki-api-signaturealgorithmidentifier}

```csharp
public static SignatureAlgorithm GetInstanceByApiModel(SignatureAlgorithmIdentifier model)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `model` | `SignatureAlgorithmIdentifier` |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `GetInstanceByName(string)` {#getinstancebyname-system-string}

```csharp
public static SignatureAlgorithm GetInstanceByName(string name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `GetInstanceByOid(string)` {#getinstancebyoid-system-string}

```csharp
public static SignatureAlgorithm GetInstanceByOid(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

### `GetInstanceByXmlUri(string)` {#getinstancebyxmluri-system-string}

```csharp
public static SignatureAlgorithm GetInstanceByXmlUri(string xmlUri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xmlUri` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

## Operadores

### `operator !=(SignatureAlgorithm, SignatureAlgorithm)` {#op-inequality-lacuna-restpki-client-signaturealgorithm-lacuna-restpki-client-signaturealgorithm}

```csharp
public static bool operator !=(SignatureAlgorithm a, SignatureAlgorithm b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
| `b` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `operator ==(SignatureAlgorithm, SignatureAlgorithm)` {#op-equality-lacuna-restpki-client-signaturealgorithm-lacuna-restpki-client-signaturealgorithm}

```csharp
public static bool operator ==(SignatureAlgorithm a, SignatureAlgorithm b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |
| `b` | [`SignatureAlgorithm`](./SignatureAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals)
