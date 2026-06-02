---
sidebar_label: "PadesVisualRectangle"
---

# PadesVisualRectangle

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PadesVisualRectangle
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesVisualRectangle`

## Construtores

### `PadesVisualRectangle()` {#ctor}

```csharp
public PadesVisualRectangle()
```

---

## Propriedades

### `Bottom` {#bottom}

```csharp
public double? Bottom { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Height` {#height}

```csharp
public double? Height { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Left` {#left}

```csharp
public double? Left { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Right` {#right}

```csharp
public double? Right { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Top` {#top}

```csharp
public double? Top { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Width` {#width}

```csharp
public double? Width { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

## Métodos

### `SetFullStretch(double, double, double, double)` {#setfullstretch-system-double-system-double-system-double-system-double}

```csharp
public void SetFullStretch(double top, double right, double bottom, double left)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `top` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `right` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `bottom` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `left` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetFullStretch(double, double)` {#setfullstretch-system-double-system-double}

```csharp
public void SetFullStretch(double topAndBottom, double leftAndRight)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `topAndBottom` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `leftAndRight` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetFullStretch(double)` {#setfullstretch-system-double}

```csharp
public void SetFullStretch(double allMargins)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `allMargins` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetHeightBottomAnchored(double, double)` {#setheightbottomanchored-system-double-system-double}

```csharp
public void SetHeightBottomAnchored(double height, double bottom)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `height` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `bottom` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetHeightCentered(double)` {#setheightcentered-system-double}

```csharp
public void SetHeightCentered(double height)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `height` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetHeightTopAnchored(double, double)` {#setheighttopanchored-system-double-system-double}

```csharp
public void SetHeightTopAnchored(double height, double top)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `height` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `top` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetHorizontalStretch(double, double)` {#sethorizontalstretch-system-double-system-double}

```csharp
public void SetHorizontalStretch(double left, double right)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `left` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `right` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetHorizontalStretch(double)` {#sethorizontalstretch-system-double}

```csharp
public void SetHorizontalStretch(double leftAndRight)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `leftAndRight` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetVerticalStretch(double, double)` {#setverticalstretch-system-double-system-double}

```csharp
public void SetVerticalStretch(double top, double bottom)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `top` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `bottom` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetVerticalStretch(double)` {#setverticalstretch-system-double}

```csharp
public void SetVerticalStretch(double topAndBottom)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `topAndBottom` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetWidthCentered(double)` {#setwidthcentered-system-double}

```csharp
public void SetWidthCentered(double width)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `width` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetWidthLeftAnchored(double, double)` {#setwidthleftanchored-system-double-system-double}

```csharp
public void SetWidthLeftAnchored(double width, double left)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `width` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `left` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

### `SetWidthRightAnchored(double, double)` {#setwidthrightanchored-system-double-system-double}

```csharp
public void SetWidthRightAnchored(double width, double right)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `width` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |
| `right` | [`double`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
