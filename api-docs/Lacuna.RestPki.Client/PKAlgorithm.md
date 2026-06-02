---
sidebar_label: "PKAlgorithm"
---

# PKAlgorithm

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class PKAlgorithm
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PKAlgorithm`

## Construtores

### `PKAlgorithm()` {#ctor}

```csharp
protected PKAlgorithm()
```

---

## Campos

### `RSA` {#rsa}

```csharp
public static readonly PKAlgorithm RSA
```

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

## Propriedades

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

### `Equals(PKAlgorithm)` {#equals-lacuna-restpki-client-pkalgorithm}

```csharp
public bool Equals(PKAlgorithm other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`PKAlgorithm`](./PKAlgorithm.md) |  |

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

### `GetInstanceByName(string)` {#getinstancebyname-system-string}

```csharp
public static PKAlgorithm GetInstanceByName(string name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

### `GetInstanceByOID(string)` {#getinstancebyoid-system-string}

```csharp
public static PKAlgorithm GetInstanceByOID(string oid)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oid` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`PKAlgorithm`](./PKAlgorithm.md)

---

### `GetSignatureAlgorithm(DigestAlgorithm)` {#getsignaturealgorithm-lacuna-restpki-client-digestalgorithm}

```csharp
public abstract SignatureAlgorithm GetSignatureAlgorithm(DigestAlgorithm digestAlgorithm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digestAlgorithm` | [`DigestAlgorithm`](./DigestAlgorithm.md) |  |

**Retorno**

[`SignatureAlgorithm`](./SignatureAlgorithm.md)

---

## Operadores

### `operator !=(PKAlgorithm, PKAlgorithm)` {#op-inequality-lacuna-restpki-client-pkalgorithm-lacuna-restpki-client-pkalgorithm}

```csharp
public static bool operator !=(PKAlgorithm a, PKAlgorithm b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`PKAlgorithm`](./PKAlgorithm.md) |  |
| `b` | [`PKAlgorithm`](./PKAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `operator ==(PKAlgorithm, PKAlgorithm)` {#op-equality-lacuna-restpki-client-pkalgorithm-lacuna-restpki-client-pkalgorithm}

```csharp
public static bool operator ==(PKAlgorithm a, PKAlgorithm b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`PKAlgorithm`](./PKAlgorithm.md) |  |
| `b` | [`PKAlgorithm`](./PKAlgorithm.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals)
