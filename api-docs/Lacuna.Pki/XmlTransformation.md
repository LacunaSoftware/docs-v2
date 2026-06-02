---
sidebar_label: "XmlTransformation"
---

# XmlTransformation

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class XmlTransformation
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `XmlTransformation`

## Construtores

### `XmlTransformation()` {#ctor}

```csharp
protected XmlTransformation()
```

---

## Campos

### `C14N` {#c14n}

```csharp
public static readonly XmlTransformation C14N
```

**Retorno**

[`XmlTransformation`](./XmlTransformation.md)

---

### `C14NWithComments` {#c14nwithcomments}

```csharp
public static readonly XmlTransformation C14NWithComments
```

**Retorno**

[`XmlTransformation`](./XmlTransformation.md)

---

### `EnvelopedSignature` {#envelopedsignature}

```csharp
public static readonly XmlTransformation EnvelopedSignature
```

**Retorno**

[`XmlTransformation`](./XmlTransformation.md)

---

### `ExclusiveC14N` {#exclusivec14n}

```csharp
public static readonly XmlTransformation ExclusiveC14N
```

**Retorno**

[`XmlTransformation`](./XmlTransformation.md)

---

### `ExclusiveC14NWithComments` {#exclusivec14nwithcomments}

```csharp
public static readonly XmlTransformation ExclusiveC14NWithComments
```

**Retorno**

[`XmlTransformation`](./XmlTransformation.md)

---

## Propriedades

### `Name` {#name}

```csharp
public abstract string Name { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Uri` {#uri}

```csharp
public abstract string Uri { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `CreateXPathTransformation()` {#createxpathtransformation}

Creates an XPath XML transformation with default exclude Signature elements: not(ancestor-or-self::ds:Signature)

```csharp
public static XmlTransformation CreateXPathTransformation()
```

**Retorno**

[`XmlTransformation`](./XmlTransformation.md)

---

### `CreateXPathTransformation(string, NamespaceManager)` {#createxpathtransformation-system-string-lacuna-pki-xml-namespacemanager}

Creates an XPath XML transformation with specified parameters

```csharp
public static XmlTransformation CreateXPathTransformation(string xpath, NamespaceManager nsm)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `xpath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `nsm` | [`NamespaceManager`](../Lacuna.Pki.Xml/NamespaceManager.md) |  |

**Retorno**

[`XmlTransformation`](./XmlTransformation.md)

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

### `Equals(XmlTransformation)` {#equals-lacuna-pki-xmltransformation}

```csharp
public bool Equals(XmlTransformation other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`XmlTransformation`](./XmlTransformation.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetCanonicalizations()` {#getcanonicalizations}

```csharp
public static List<XmlTransformation> GetCanonicalizations()
```

**Retorno**

[`List<XmlTransformation>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `GetInstanceByUri(string)` {#getinstancebyuri-system-string}

```csharp
public static XmlTransformation GetInstanceByUri(string uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`XmlTransformation`](./XmlTransformation.md)

---

## Operadores

### `operator !=(XmlTransformation, XmlTransformation)` {#op-inequality-lacuna-pki-xmltransformation-lacuna-pki-xmltransformation}

```csharp
public static bool operator !=(XmlTransformation a, XmlTransformation b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`XmlTransformation`](./XmlTransformation.md) |  |
| `b` | [`XmlTransformation`](./XmlTransformation.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `operator ==(XmlTransformation, XmlTransformation)` {#op-equality-lacuna-pki-xmltransformation-lacuna-pki-xmltransformation}

```csharp
public static bool operator ==(XmlTransformation a, XmlTransformation b)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `a` | [`XmlTransformation`](./XmlTransformation.md) |  |
| `b` | [`XmlTransformation`](./XmlTransformation.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
