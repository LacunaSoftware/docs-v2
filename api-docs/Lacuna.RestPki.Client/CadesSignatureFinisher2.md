---
sidebar_label: "CadesSignatureFinisher2"
---

# CadesSignatureFinisher2

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class CadesSignatureFinisher2 : SignatureFinisher2
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`SignatureFinisher2`](./SignatureFinisher2.md) → `CadesSignatureFinisher2`

## Construtores

### `CadesSignatureFinisher2(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public CadesSignatureFinisher2(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Métodos

### `CheckCompatibility()` {#checkcompatibility}

```csharp
protected override void CheckCompatibility()
```

---

### `CheckCompatibilityAsync()` {#checkcompatibilityasync}

```csharp
protected override Task CheckCompatibilityAsync()
```

**Retorno**

[`Task`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task)

---

### `GetApiRoute()` {#getapiroute}

```csharp
protected override string GetApiRoute()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`Client`](./SignatureFinisher2.md#client), [`FinishAsync()`](./SignatureFinisher2.md#finishasync), [`Finish()`](./SignatureFinisher2.md#finish), [`Token`](./SignatureFinisher2.md#token), [`Signature`](./SignatureFinisher2.md#signature), [`ForceBlobResult`](./SignatureFinisher2.md#forceblobresult), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
