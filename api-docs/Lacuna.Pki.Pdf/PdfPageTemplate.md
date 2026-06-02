---
sidebar_label: "PdfPageTemplate"
---

# PdfPageTemplate

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PdfPageTemplate
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfPageTemplate`

## Construtores

### `PdfPageTemplate()` {#ctor}

```csharp
public PdfPageTemplate()
```

---

## Propriedades

### `CustomPageSize` {#custompagesize}

A custom PDF page size in PDF points unit. If not set, the current PDF pages most common paper size, or A4 if unkown size, as standard will be used.

```csharp
public PadesSize CustomPageSize { get; set; }
```

**Retorno**

[`PadesSize`](../Lacuna.Pki.Pades/PadesSize.md)

---

### `PageOrientation` {#pageorientation}

The page orientation. Default is Portrait.

```csharp
public PageOrientations PageOrientation { get; set; }
```

**Retorno**

[`PageOrientations`](../Lacuna.Pki.Pades/PageOrientations.md)

---

### `PageSize` {#pagesize}

A standard page size based on a paper size. If not set neither CustomPageSize,
the current PDF pages most common paper size, or A4 if unkown size, as standard will be used.

```csharp
public PaperSizes? PageSize { get; set; }
```

**Retorno**

`PaperSizes?`

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
