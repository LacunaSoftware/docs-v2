---
sidebar_label: "PadesVisualRepresentation"
---

# PadesVisualRepresentation

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PadesVisualRepresentation
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesVisualRepresentation`

## Construtores

### `PadesVisualRepresentation()` {#ctor}

```csharp
[Obsolete("Use PadesVisualSignature2 instead")]
public PadesVisualRepresentation()
```

---

## Propriedades

### `BottomBorder` {#bottomborder}

Signature rectangle bottom border distance in points unit

```csharp
public int BottomBorder { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `CustomText` {#customtext}

Inserts a custom text at the begining of the signature visual representation

```csharp
public string CustomText { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `FootNotePageNumber` {#footnotepagenumber}

The page number of pades visual representaion footnote. If footnote is the selected position

```csharp
public int FootNotePageNumber { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `ImageAlign` {#imagealign}

The stemp seal image alignment inside the signature rectangle

```csharp
public PadesImageAlign ImageAlign { get; set; }
```

**Retorno**

[`PadesImageAlign`](./PadesImageAlign.md)

---

### `ImageBytes` {#imagebytes}

The stamp seal image bytes.

```csharp
public byte[] ImageBytes { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Location` {#location}

The location of the signature.

```csharp
public string Location { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `NationalId` {#nationalid}

The id or fiscal code that identifies the signer

```csharp
public string NationalId { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `PagePosition` {#pageposition}

```csharp
public PadesVisualPosition PagePosition { get; }
```

**Retorno**

[`PadesVisualPosition`](./PadesVisualPosition.md)

---

### `Reason` {#reason}

The reason of the signature or the power of the signer.

```csharp
public string Reason { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Role` {#role}

The signer's role

```csharp
public string Role { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SignerName` {#signername}

The name of the signer.

```csharp
public string SignerName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SigningTime` {#signingtime}

To include the signing time.,

```csharp
public bool SigningTime { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `StaticPosition` {#staticposition}

```csharp
public PadesVisualStaticPosition StaticPosition { get; }
```

**Retorno**

[`PadesVisualStaticPosition`](./PadesVisualStaticPosition.md)

---

## Métodos

### `GetFormattedText(DateTimeOffset?)` {#getformattedtext-system-nullable-system-datetimeoffset}

For internal usage only

```csharp
public string GetFormattedText(DateTimeOffset? signingTime)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signingTime` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SetPosition(PadesVisualPosition)` {#setposition-lacuna-pki-pades-padesvisualposition}

The position and arrangement of the signature representation.

```csharp
public void SetPosition(PadesVisualPosition position)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `position` | [`PadesVisualPosition`](./PadesVisualPosition.md) |  |

---

### `SetPosition(PadesVisualStaticPosition)` {#setposition-lacuna-pki-pades-padesvisualstaticposition}

The rectangle position and page index of the signature representation.

```csharp
public void SetPosition(PadesVisualStaticPosition position)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `position` | [`PadesVisualStaticPosition`](./PadesVisualStaticPosition.md) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
