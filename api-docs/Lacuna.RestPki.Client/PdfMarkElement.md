---
sidebar_label: "PdfMarkElement"
---

# PdfMarkElement

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class PdfMarkElement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMarkElement`

## Construtores

### `PdfMarkElement(PdfMarkElementType, PadesVisualRectangle)` {#ctor-lacuna-restpki-api-padessignature-pdfmarkelementtype-lacuna-restpki-client-padesvisualrectangle}

```csharp
public PdfMarkElement(PdfMarkElementType type, PadesVisualRectangle relativeContainer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `type` | `PdfMarkElementType` |  |
| `relativeContainer` | [`PadesVisualRectangle`](./PadesVisualRectangle.md) |  |

---

### `PdfMarkElement(PdfMarkElementType)` {#ctor-lacuna-restpki-api-padessignature-pdfmarkelementtype}

```csharp
public PdfMarkElement(PdfMarkElementType type)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `type` | `PdfMarkElementType` |  |

---

## Propriedades

### `ElementType` {#elementtype}

```csharp
public PdfMarkElementType ElementType { get; set; }
```

**Retorno**

`PdfMarkElementType`

---

### `Opacity` {#opacity}

```csharp
public double Opacity { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `RelativeContainer` {#relativecontainer}

```csharp
public PadesVisualRectangle RelativeContainer { get; set; }
```

**Retorno**

[`PadesVisualRectangle`](./PadesVisualRectangle.md)

---

### `Rotation` {#rotation}

```csharp
public int Rotation { get; set; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Métodos

### `ToModel()` {#tomodel}

```csharp
public virtual PdfMarkElementModel ToModel()
```

**Retorno**

`PdfMarkElementModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
