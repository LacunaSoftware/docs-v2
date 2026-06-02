---
sidebar_label: "SignatureFinisher"
---

# SignatureFinisher

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class SignatureFinisher
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignatureFinisher`

## Construtores

### `SignatureFinisher(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public SignatureFinisher(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Campos

### `CallbackArgument` {#callbackargument}

```csharp
protected string CallbackArgument
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `CertificateInfo` {#certificateinfo}

```csharp
protected PKCertificate CertificateInfo
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `Client` {#client}

```csharp
protected RestPkiClient Client
```

**Retorno**

[`RestPkiClient`](./RestPkiClient.md)

---

### `Done` {#done}

```csharp
protected bool Done
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Propriedades

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

### `Finish()` {#finish}

```csharp
public abstract byte[] Finish()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `FinishAsync()` {#finishasync}

```csharp
public abstract Task<byte[]> FinishAsync()
```

**Retorno**

[`Task<byte[]>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `GetCallbackArgument()` {#getcallbackargument}

```csharp
public string GetCallbackArgument()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `GetCertificateInfo()` {#getcertificateinfo}

```csharp
public PKCertificate GetCertificateInfo()
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `SetSignature(byte[])` {#setsignature-system-byte}

```csharp
public void SetSignature(byte[] signature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetToken(string)` {#settoken-system-string}

```csharp
public void SetToken(string token)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `token` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
