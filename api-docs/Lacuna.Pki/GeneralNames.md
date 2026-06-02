---
sidebar_label: "GeneralNames"
---

# GeneralNames

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class GeneralNames : List<GeneralName>, IList<GeneralName>, ICollection<GeneralName>, IList, ICollection, IReadOnlyList<GeneralName>, IReadOnlyCollection<GeneralName>, IEnumerable<GeneralName>, IEnumerable
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`List<GeneralName>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1) → `GeneralNames`

## Propriedades

### `ContainsName` {#containsname}

```csharp
public bool ContainsName { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ContainsUri` {#containsuri}

```csharp
public bool ContainsUri { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsSingleUri` {#issingleuri}

```csharp
public bool IsSingleUri { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `Decode(byte[])` {#decode-system-byte}

```csharp
public static GeneralNames Decode(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`GeneralNames`](./GeneralNames.md)

---

### `FindOtherName(string)` {#findothername-system-string}

```csharp
public OtherName FindOtherName(string typeId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `typeId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`OtherName`](./OtherName.md)

---

### `GetAsSingleUri()` {#getassingleuri}

```csharp
public Uri GetAsSingleUri()
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `GetName()` {#getname}

```csharp
public Name GetName()
```

**Retorno**

[`Name`](./Name.md)

---

### `GetUri()` {#geturi}

```csharp
public Uri GetUri()
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

### `TryGetAsSingleUri(out Uri)` {#trygetassingleuri-system-uri}

```csharp
public bool TryGetAsSingleUri(out Uri uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `TryGetName(out Name)` {#trygetname-lacuna-pki-name}

```csharp
public bool TryGetName(out Name name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`Name`](./Name.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `TryGetUri(out Uri)` {#trygeturi-system-uri}

```csharp
public bool TryGetUri(out Uri uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Membros herdados

[`Add(GeneralName)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.add), [`AddRange(IEnumerable<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.addrange), [`AsReadOnly()`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.asreadonly), [`BinarySearch(int, int, GeneralName, IComparer<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.binarysearch#system-collections-generic-list-1-binarysearch(system-int32-system-int32-0-system-collections-generic-icomparer((-0)))>), [`BinarySearch(GeneralName)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.binarysearch#system-collections-generic-list-1-binarysearch(-0)>), [`BinarySearch(GeneralName, IComparer<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.binarysearch#system-collections-generic-list-1-binarysearch(-0-system-collections-generic-icomparer((-0)))>), [`Clear()`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.clear), [`Contains(GeneralName)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.contains), [`ConvertAll<TOutput>(Converter<GeneralName, TOutput>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.convertall), [`CopyTo(GeneralName[])`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.copyto#system-collections-generic-list-1-copyto(-0())>), [`CopyTo(int, GeneralName[], int, int)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.copyto#system-collections-generic-list-1-copyto(system-int32-0()-system-int32-system-int32)>), [`CopyTo(GeneralName[], int)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.copyto#system-collections-generic-list-1-copyto(-0()-system-int32)>), [`Exists(Predicate<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.exists), [`Find(Predicate<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.find), [`FindAll(Predicate<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.findall), [`FindIndex(Predicate<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.findindex#system-collections-generic-list-1-findindex(system-predicate((-0)))>), [`FindIndex(int, Predicate<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.findindex#system-collections-generic-list-1-findindex(system-int32-system-predicate((-0)))>), [`FindIndex(int, int, Predicate<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.findindex#system-collections-generic-list-1-findindex(system-int32-system-int32-system-predicate((-0)))>), [`FindLast(Predicate<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.findlast), [`FindLastIndex(Predicate<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.findlastindex#system-collections-generic-list-1-findlastindex(system-predicate((-0)))>), [`FindLastIndex(int, Predicate<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.findlastindex#system-collections-generic-list-1-findlastindex(system-int32-system-predicate((-0)))>), [`FindLastIndex(int, int, Predicate<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.findlastindex#system-collections-generic-list-1-findlastindex(system-int32-system-int32-system-predicate((-0)))>), [`ForEach(Action<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.foreach), [`GetEnumerator()`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.getenumerator), [`GetRange(int, int)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.getrange), [`IndexOf(GeneralName)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.indexof#system-collections-generic-list-1-indexof(-0)>), [`IndexOf(GeneralName, int)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.indexof#system-collections-generic-list-1-indexof(-0-system-int32)>), [`IndexOf(GeneralName, int, int)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.indexof#system-collections-generic-list-1-indexof(-0-system-int32-system-int32)>), [`Insert(int, GeneralName)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.insert), [`InsertRange(int, IEnumerable<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.insertrange), [`LastIndexOf(GeneralName)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.lastindexof#system-collections-generic-list-1-lastindexof(-0)>), [`LastIndexOf(GeneralName, int)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.lastindexof#system-collections-generic-list-1-lastindexof(-0-system-int32)>), [`LastIndexOf(GeneralName, int, int)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.lastindexof#system-collections-generic-list-1-lastindexof(-0-system-int32-system-int32)>), [`Remove(GeneralName)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.remove), [`RemoveAll(Predicate<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.removeall), [`RemoveAt(int)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.removeat), [`RemoveRange(int, int)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.removerange), [`Reverse()`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.reverse#system-collections-generic-list-1-reverse), [`Reverse(int, int)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.reverse#system-collections-generic-list-1-reverse(system-int32-system-int32)>), [`Sort()`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.sort#system-collections-generic-list-1-sort), [`Sort(IComparer<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.sort#system-collections-generic-list-1-sort(system-collections-generic-icomparer((-0)))>), [`Sort(int, int, IComparer<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.sort#system-collections-generic-list-1-sort(system-int32-system-int32-system-collections-generic-icomparer((-0)))>), [`Sort(Comparison<GeneralName>)`](<https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.sort#system-collections-generic-list-1-sort(system-comparison((-0)))>), [`ToArray()`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.toarray), [`TrimExcess()`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.trimexcess), [`TrueForAll(Predicate<GeneralName>)`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.trueforall), [`Capacity`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.capacity), [`Count`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1.count), [`this[int]`](https://learn.microsoft.com/dotnet/api/system.int32), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
