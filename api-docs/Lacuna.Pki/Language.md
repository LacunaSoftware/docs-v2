---
sidebar_label: "Language"
---

# Language

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class Language
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `Language`

## Construtores

### `Language()` {#ctor}

```csharp
public Language()
```

---

## Campos

### `BR` {#br}

Brazil CultureInfo

```csharp
public static readonly CultureInfo BR
```

**Retorno**

[`CultureInfo`](https://learn.microsoft.com/dotnet/api/system.globalization.cultureinfo)

---

### `ES` {#es}

Spanish CultureInfo

```csharp
public static readonly CultureInfo ES
```

**Retorno**

[`CultureInfo`](https://learn.microsoft.com/dotnet/api/system.globalization.cultureinfo)

---

### `US` {#us}

US CultureInfo

```csharp
public static readonly CultureInfo US
```

**Retorno**

[`CultureInfo`](https://learn.microsoft.com/dotnet/api/system.globalization.cultureinfo)

---

## Propriedades

### `Culture` {#culture}

The SDK current CultureInfo

```csharp
public static CultureInfo Culture { get; }
```

**Retorno**

[`CultureInfo`](https://learn.microsoft.com/dotnet/api/system.globalization.cultureinfo)

---

### `SupportedLanguages` {#supportedlanguages}

The SDK supported languages texts

```csharp
public static List<CultureInfo> SupportedLanguages { get; }
```

**Retorno**

[`List<CultureInfo>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `SetCultureInfo(CultureInfo)` {#setcultureinfo-system-globalization-cultureinfo}

Set a static culture info to the SDK, overriding the System current culture info

```csharp
public static void SetCultureInfo(CultureInfo cultureInfo)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `cultureInfo` | [`CultureInfo`](https://learn.microsoft.com/dotnet/api/system.globalization.cultureinfo) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
