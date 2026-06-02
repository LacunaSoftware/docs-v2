---
sidebar_label: "PadesVisualImage"
---

# PadesVisualImage

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PadesVisualImage
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesVisualImage`

## Construtores

### `PadesVisualImage()` {#ctor}

```csharp
public PadesVisualImage()
```

---

### `PadesVisualImage(byte[], string)` {#ctor-system-byte-system-string}

```csharp
public PadesVisualImage(byte[] imageContent, string mimeType)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `imageContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `mimeType` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `PadesVisualImage(string, string)` {#ctor-system-string-system-string}

```csharp
public PadesVisualImage(string imageUrl, string mimeType = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `imageUrl` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `mimeType` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Propriedades

### `Content` {#content}

```csharp
public byte[] Content { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `HorizontalAlign` {#horizontalalign}

```csharp
public PadesHorizontalAlign HorizontalAlign { get; set; }
```

**Retorno**

`PadesHorizontalAlign`

---

### `MimeType` {#mimetype}

```csharp
public string MimeType { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Opacity` {#opacity}

```csharp
public int Opacity { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `Url` {#url}

```csharp
public string Url { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `VerticalAlign` {#verticalalign}

```csharp
public PadesVerticalAlign VerticalAlign { get; set; }
```

**Retorno**

`PadesVerticalAlign`

---

## Métodos

### `SetContentFromFile(string)` {#setcontentfromfile-system-string}

```csharp
public void SetContentFromFile(string filePath)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `filePath` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `ToModel()` {#tomodel}

```csharp
public PadesVisualImageModel ToModel()
```

**Retorno**

`PadesVisualImageModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
