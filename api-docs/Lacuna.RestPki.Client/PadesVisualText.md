---
sidebar_label: "PadesVisualText"
---

# PadesVisualText

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PadesVisualText
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesVisualText`

## Construtores

### `PadesVisualText()` {#ctor}

```csharp
public PadesVisualText()
```

---

### `PadesVisualText(string, bool, double?)` {#ctor-system-string-system-boolean-system-nullable-system-double}

```csharp
public PadesVisualText(string text, bool includeSigningTime = false, double? fontSize = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `text` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `includeSigningTime` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) |  |
| `fontSize` | [`double?`](https://learn.microsoft.com/dotnet/api/system.double) |  |

---

## Propriedades

### `Container` {#container}

```csharp
public PadesVisualRectangle Container { get; set; }
```

**Retorno**

[`PadesVisualRectangle`](./PadesVisualRectangle.md)

---

### `FontSize` {#fontsize}

```csharp
public double? FontSize { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `HorizontalAlign` {#horizontalalign}

```csharp
public PadesTextHorizontalAlign HorizontalAlign { get; set; }
```

**Retorno**

`PadesTextHorizontalAlign`

---

### `IncludeSigningTime` {#includesigningtime}

```csharp
public bool IncludeSigningTime { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Text` {#text}

```csharp
public string Text { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `ToModel()` {#tomodel}

```csharp
public PadesVisualTextModel ToModel()
```

**Retorno**

`PadesVisualTextModel`

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
