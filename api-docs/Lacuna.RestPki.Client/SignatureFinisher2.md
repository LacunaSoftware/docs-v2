---
sidebar_label: "SignatureFinisher2"
---

# SignatureFinisher2

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class SignatureFinisher2
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignatureFinisher2`

## Construtores

### `SignatureFinisher2(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public SignatureFinisher2(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Campos

### `Client` {#client}

```csharp
protected RestPkiClient Client
```

**Retorno**

[`RestPkiClient`](./RestPkiClient.md)

---

## Propriedades

### `ForceBlobResult` {#forceblobresult}

```csharp
public bool ForceBlobResult { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `Signature` {#signature}

```csharp
public byte[] Signature { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Token` {#token}

```csharp
public string Token { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `CheckCompatibility()` {#checkcompatibility}

```csharp
protected abstract void CheckCompatibility()
```

---

### `CheckCompatibilityAsync()` {#checkcompatibilityasync}

```csharp
protected abstract Task CheckCompatibilityAsync()
```

**Retorno**

[`Task`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task)

---

### `Finish()` {#finish}

```csharp
public SignatureResult Finish()
```

**Retorno**

[`SignatureResult`](./SignatureResult.md)

---

### `FinishAsync()` {#finishasync}

```csharp
public Task<SignatureResult> FinishAsync()
```

**Retorno**

[`Task<SignatureResult>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `GetApiRoute()` {#getapiroute}

```csharp
protected abstract string GetApiRoute()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
