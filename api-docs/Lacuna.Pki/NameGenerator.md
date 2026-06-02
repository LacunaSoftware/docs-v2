---
sidebar_label: "NameGenerator"
---

# NameGenerator

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

Generates instances of the Name class (which represent X.509 names).

```csharp
public class NameGenerator
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `NameGenerator`

## Construtores

### `NameGenerator()` {#ctor}

```csharp
public NameGenerator()
```

---

## Métodos

### `GenerateFromDNString(string, NameGeneratorTypePolicies)` {#generatefromdnstring-system-string-lacuna-pki-namegeneratortypepolicies}

Generates a Name based on a Distinguished Name string representation such as "C=US, O=Acme Inc., CN=John Smith" (as defined by RFC 4514)

```csharp
public static Name GenerateFromDNString(string dnString, NameGeneratorTypePolicies typePolicy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `dnString` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The Distinguished Name string representation |
| `typePolicy` | [`NameGeneratorTypePolicies`](./NameGeneratorTypePolicies.md) | The type policy which will define which underlying types will be used to represent each value. |

**Retorno**

[`Name`](./Name.md) — A X.509 name

---

### `GenerateFromModel(NameModel, NameGeneratorTypePolicies)` {#generatefrommodel-lacuna-pki-issuer-namemodel-lacuna-pki-namegeneratortypepolicies}

Generates a Name based on a Name model with filled fields

```csharp
public static Name GenerateFromModel(NameModel nameModel, NameGeneratorTypePolicies typePolicy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nameModel` | [`NameModel`](../Lacuna.Pki.Issuer/NameModel.md) |  |
| `typePolicy` | [`NameGeneratorTypePolicies`](./NameGeneratorTypePolicies.md) |  |

**Retorno**

[`Name`](./Name.md)

---

### `GenerateFromOidsAndValues(NameValueCollection, NameGeneratorTypePolicies)` {#generatefromoidsandvalues-system-collections-specialized-namevaluecollection-lacuna-pki-namegeneratortypepolicies}

```csharp
public static Name GenerateFromOidsAndValues(NameValueCollection oidsAndValues, NameGeneratorTypePolicies typePolicy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `oidsAndValues` | [`NameValueCollection`](https://learn.microsoft.com/dotnet/api/system.collections.specialized.namevaluecollection) |  |
| `typePolicy` | [`NameGeneratorTypePolicies`](./NameGeneratorTypePolicies.md) |  |

**Retorno**

[`Name`](./Name.md)

---

### `GenerateWithCommonNameOnly(string, NameGeneratorTypePolicies)` {#generatewithcommonnameonly-system-string-lacuna-pki-namegeneratortypepolicies}

Generates a Name composed of only a single field of type Common Name (CN)

```csharp
public static Name GenerateWithCommonNameOnly(string commonName, NameGeneratorTypePolicies typePolicy = NameGeneratorTypePolicies.PrintableStringsOnly)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `commonName` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | The Common Name (CN) to be used to generate the X.509 name |
| `typePolicy` | [`NameGeneratorTypePolicies`](./NameGeneratorTypePolicies.md) | The type policy which will define which underlying type will be used to represent the CN value. |

**Retorno**

[`Name`](./Name.md) — A X.509 name

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
