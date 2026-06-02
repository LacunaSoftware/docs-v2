---
sidebar_label: "PadesVisualText"
---

# PadesVisualText

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
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

## Propriedades

### `Container` {#container}

Sets a text container relative to the signature rectangle. If not set,
the text will occupy all the signature rectangle.

```csharp
public PadesVisualRectangle Container { get; set; }
```

**Retorno**

[`PadesVisualRectangle`](./PadesVisualRectangle.md)

---

### `CustomText` {#customtext}

Custom text placed before any other text information passed.

```csharp
public string CustomText { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `FontColor` {#fontcolor}

Sets the text font color. Default is Black.

```csharp
public Color FontColor { get; set; }
```

**Retorno**

[`Color`](https://learn.microsoft.com/dotnet/api/system.drawing.color)

---

### `FontSize` {#fontsize}

The fonte size of the text in the signarure representation rectangle. If not set,
a font size will be computed in a way that all the text fits well inside the signature rectangle

```csharp
public double? FontSize { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `HorizontalAlign` {#horizontalalign}

Sets the text horizontal align. Default is Left aligned.

```csharp
public PadesTextHorizontalAlign HorizontalAlign { get; set; }
```

**Retorno**

[`PadesTextHorizontalAlign`](./PadesTextHorizontalAlign.md)

---

### `IncludeSigningTime` {#includesigningtime}

To include the signing time of the signature

```csharp
public bool IncludeSigningTime { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `LineSpacing` {#linespacing}

The line spacing multiplier based on the font size.

```csharp
public double? LineSpacing { get; set; }
```

**Retorno**

[`double?`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `Location` {#location}

```csharp
public string Location { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `NationalId` {#nationalid}

```csharp
public string NationalId { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Reason` {#reason}

```csharp
public string Reason { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Role` {#role}

```csharp
public string Role { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SignerName` {#signername}

```csharp
public string SignerName { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SigningTimeFormat` {#signingtimeformat}

The signing time format pattern.

```csharp
public string SigningTimeFormat { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SigningTimeFormatProvider` {#signingtimeformatprovider}

The signing time format provider

```csharp
public IFormatProvider SigningTimeFormatProvider { get; set; }
```

**Retorno**

[`IFormatProvider`](https://learn.microsoft.com/dotnet/api/system.iformatprovider)

---

### `SigningTimeOffset` {#signingtimeoffset}

The signing time date time offset.

```csharp
public TimeSpan? SigningTimeOffset { get; set; }
```

**Retorno**

[`TimeSpan?`](https://learn.microsoft.com/dotnet/api/system.timespan)

**Comentários**

The parameter SigningTimeZoneInfo takes precedence over this parameter. Therefore, in order to specify an offset, do not specify the time zone info. If neither parameters are set, the machine time zone is used for conversion.

---

### `SigningTimeZoneInfo` {#signingtimezoneinfo}

The signing time date time zone info.

```csharp
public TimeZoneInfo SigningTimeZoneInfo { get; set; }
```

**Retorno**

[`TimeZoneInfo`](https://learn.microsoft.com/dotnet/api/system.timezoneinfo)

**Comentários**

This parameter takes precedence over SigningTimeOffset. If neither parameters are set, the machine time zone is used for conversion.

---

### `Suffix` {#suffix}

Suffix text placed after any text information passed.

```csharp
public string Suffix { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `VerticalAlign` {#verticalalign}

Sets the text vertical align. Default is Top aligned

```csharp
public PadesVerticalAlign VerticalAlign { get; set; }
```

**Retorno**

[`PadesVerticalAlign`](./PadesVerticalAlign.md)

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

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
