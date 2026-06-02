---
sidebar_label: "PdfMarkElement"
---

# PdfMarkElement

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public abstract class PdfMarkElement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfMarkElement`

## Construtores

### `PdfMarkElement()` {#ctor}

```csharp
public PdfMarkElement()
```

---

## Propriedades

### `Opacity` {#opacity}

Element opacity. If not set, default is 100, opaque.

```csharp
public double Opacity { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `RelativeContainer` {#relativecontainer}

Rectangle relative position to PdfMark Container

```csharp
public PadesVisualRectangle RelativeContainer { get; set; }
```

**Retorno**

[`PadesVisualRectangle`](../Lacuna.Pki.Pades/PadesVisualRectangle.md)

---

### `Rotation` {#rotation}

Element rotation in degrees

```csharp
public PdfMarkRotation Rotation { get; set; }
```

**Retorno**

[`PdfMarkRotation`](./PdfMarkRotation.md)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
