---
sidebar_label: "PdfMarkImage"
---

# PdfMarkImage

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PdfMarkImage
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMarkImage`

## Construtores

### `PdfMarkImage()` {#ctor}

```csharp
public PdfMarkImage()
```

---

### `PdfMarkImage(byte[], string)` {#ctor-system-byte-system-string}

```csharp
public PdfMarkImage(byte[] imageContent, string mimeType)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `imageContent` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `mimeType` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `PdfMarkImage(string, string)` {#ctor-system-string-system-string}

```csharp
public PdfMarkImage(string imageUrl, string mimeType = null)
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

### `MimeType` {#mimetype}

```csharp
public string MimeType { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Opacity` {#opacity}

```csharp
[Obsolete("Use PdfMarkElement.Opacity instead")]
public double Opacity { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Url` {#url}

```csharp
public string Url { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

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
public PdfMarkImageModel ToModel()
```

**Retorno**

`PdfMarkImageModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
