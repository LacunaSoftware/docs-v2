---
sidebar_label: "PadesVisualImage"
---

# PadesVisualImage

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
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

## Propriedades

### `Content` {#content}

The background image content

```csharp
public byte[] Content { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `HorizontalAlign` {#horizontalalign}

The horizontal alignment of the background image in the signature rectangle. Only applied in case the
signature rectangle has a wider aspect ratio than the image.

```csharp
public PadesHorizontalAlign HorizontalAlign { get; set; }
```

**Retorno**

[`PadesHorizontalAlign`](./PadesHorizontalAlign.md)

---

### `Opacity` {#opacity}

The background image opacity. Default is 100.

```csharp
public double? Opacity { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `VerticalAlign` {#verticalalign}

The vertical alignment of the background image in the signature rectangle. Only applied in case the
background image has a wider aspect ratio than the signature rectangle.

```csharp
public PadesVerticalAlign VerticalAlign { get; set; }
```

**Retorno**

[`PadesVerticalAlign`](./PadesVerticalAlign.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
