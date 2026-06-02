---
sidebar_label: "SignatureStarter"
---

# SignatureStarter

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public abstract class SignatureStarter
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `SignatureStarter`

## Construtores

### `SignatureStarter(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public SignatureStarter(RestPkiClient client)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `client` | [`RestPkiClient`](./RestPkiClient.md) |  |

---

## Campos

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

### `CallbackArgument` {#callbackargument}

```csharp
public string CallbackArgument { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `IgnoreRevocationStatusUnknown` {#ignorerevocationstatusunknown}

Whether validation errors due to the revocation status of a certificate being
unknown should be ignored. Defaults to false.

```csharp
public bool IgnoreRevocationStatusUnknown { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `SecurityContextId` {#securitycontextid}

```csharp
public Guid? SecurityContextId { get; set; }
```

**Retorno**

[`Guid?`](https://learn.microsoft.com/dotnet/api/system.guid)

---

### `SignaturePolicyId` {#signaturepolicyid}

```csharp
public Guid? SignaturePolicyId { get; set; }
```

**Retorno**

[`Guid?`](https://learn.microsoft.com/dotnet/api/system.guid)

---

### `SignerCertificate` {#signercertificate}

```csharp
public byte[] SignerCertificate { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

## Métodos

### `GetCertificateInfo()` {#getcertificateinfo}

```csharp
public PKCertificate GetCertificateInfo()
```

**Retorno**

[`PKCertificate`](./PKCertificate.md)

---

### `SetCallbackArgument(string)` {#setcallbackargument-system-string}

```csharp
public void SetCallbackArgument(string callbackArgument)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `callbackArgument` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetSecurityContext(Guid)` {#setsecuritycontext-system-guid}

```csharp
public void SetSecurityContext(Guid securityContextId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `securityContextId` | [`Guid`](https://learn.microsoft.com/dotnet/api/system.guid) |  |

---

### `SetSignaturePolicy(Guid)` {#setsignaturepolicy-system-guid}

```csharp
public void SetSignaturePolicy(Guid signaturePolicyId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signaturePolicyId` | [`Guid`](https://learn.microsoft.com/dotnet/api/system.guid) |  |

---

### `SetSignerCertificate(byte[])` {#setsignercertificate-system-byte}

```csharp
public void SetSignerCertificate(byte[] certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `Start()` {#start}

```csharp
public abstract ClientSideSignatureInstructions Start()
```

**Retorno**

[`ClientSideSignatureInstructions`](./ClientSideSignatureInstructions.md)

---

### `StartAsync()` {#startasync}

```csharp
public abstract Task<ClientSideSignatureInstructions> StartAsync()
```

**Retorno**

[`Task<ClientSideSignatureInstructions>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `StartWithWebPki()` {#startwithwebpki}

```csharp
public abstract string StartWithWebPki()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `StartWithWebPkiAsync()` {#startwithwebpkiasync}

```csharp
public abstract Task<string> StartWithWebPkiAsync()
```

**Retorno**

[`Task<string>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
