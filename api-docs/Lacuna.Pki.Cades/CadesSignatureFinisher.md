---
sidebar_label: "CadesSignatureFinisher"
---

# CadesSignatureFinisher

**Namespace:** `Lacuna.Pki.Cades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class CadesSignatureFinisher
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CadesSignatureFinisher`

## Construtores

### `CadesSignatureFinisher(CadesSignature)` {#ctor-lacuna-pki-cades-cadessignature}

```csharp
public CadesSignatureFinisher(CadesSignature cadesSignature)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `cadesSignature` | [`CadesSignature`](./CadesSignature.md) |  |

---

## Propriedades

### `Completed` {#completed}

```csharp
public bool Completed { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `HasErrors` {#haserrors}

```csharp
public bool HasErrors { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `HasWarnings` {#haswarnings}

```csharp
public bool HasWarnings { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsSignatureFinished` {#issignaturefinished}

```csharp
public bool IsSignatureFinished { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `NextStepDelay` {#nextstepdelay}

```csharp
public TimeSpan? NextStepDelay { get; }
```

**Retorno**

[`TimeSpan?`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

### `NextStepTime` {#nextsteptime}

```csharp
public DateTimeOffset? NextStepTime { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `PerformedActions` {#performedactions}

```csharp
public List<string> PerformedActions { get; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Signature` {#signature}

```csharp
public CadesSignature Signature { get; }
```

**Retorno**

[`CadesSignature`](./CadesSignature.md)

---

### `UseOnlyCrlsIssuedAfterGracePeriod` {#useonlycrlsissuedaftergraceperiod}

```csharp
public bool UseOnlyCrlsIssuedAfterGracePeriod { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `GetAllErrors()` {#getallerrors}

```csharp
public List<string> GetAllErrors()
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetAllWarnings()` {#getallwarnings}

```csharp
public List<string> GetAllWarnings()
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetErrors(CadesSignerInfo)` {#geterrors-lacuna-pki-cades-cadessignerinfo}

```csharp
public List<string> GetErrors(CadesSignerInfo signer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signer` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetSignature()` {#getsignature}

```csharp
public CadesSignature GetSignature()
```

**Retorno**

[`CadesSignature`](./CadesSignature.md)

---

### `GetSignature(SignatureFinisherStates)` {#getsignature-lacuna-pki-signaturefinisherstates}

```csharp
public CadesSignature GetSignature(SignatureFinisherStates signaturesStates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signaturesStates` | [`SignatureFinisherStates`](../Lacuna.Pki/SignatureFinisherStates.md) |  |

**Retorno**

[`CadesSignature`](./CadesSignature.md)

---

### `GetSignature(Stream, SignatureFinisherStates)` {#getsignature-system-io-stream-lacuna-pki-signaturefinisherstates}

```csharp
public void GetSignature(Stream stream, SignatureFinisherStates signaturesStates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |
| `signaturesStates` | [`SignatureFinisherStates`](../Lacuna.Pki/SignatureFinisherStates.md) |  |

---

### `GetSignature(Stream)` {#getsignature-system-io-stream}

```csharp
public void GetSignature(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `GetSignatureEncoded()` {#getsignatureencoded}

```csharp
public byte[] GetSignatureEncoded()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetSignatureEncoded(SignatureFinisherStates)` {#getsignatureencoded-lacuna-pki-signaturefinisherstates}

```csharp
public byte[] GetSignatureEncoded(SignatureFinisherStates signaturesStates)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signaturesStates` | [`SignatureFinisherStates`](../Lacuna.Pki/SignatureFinisherStates.md) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetWarnings(CadesSignerInfo)` {#getwarnings-lacuna-pki-cades-cadessignerinfo}

```csharp
public List<string> GetWarnings(CadesSignerInfo signer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signer` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `IsCompleted(CadesSignerInfo)` {#iscompleted-lacuna-pki-cades-cadessignerinfo}

```csharp
public bool IsCompleted(CadesSignerInfo signer)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `signer` | [`CadesSignerInfo`](./CadesSignerInfo.md) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `PerformStep()` {#performstep}

```csharp
public void PerformStep()
```

---

### `SetCrlStore(IReferencedCrlStore)` {#setcrlstore-lacuna-pki-stores-ireferencedcrlstore}

```csharp
public void SetCrlStore(IReferencedCrlStore crlStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `crlStore` | [`IReferencedCrlStore`](../Lacuna.Pki.Stores/IReferencedCrlStore.md) |  |

---

### `SetPolicy(CadesPolicySpec)` {#setpolicy-lacuna-pki-cades-cadespolicyspec}

```csharp
public void SetPolicy(CadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`CadesPolicySpec`](./CadesPolicySpec.md) |  |

---

### `SetPolicyMapper(ICadesPolicyMapper)` {#setpolicymapper-lacuna-pki-cades-icadespolicymapper}

```csharp
public void SetPolicyMapper(ICadesPolicyMapper policyMapper)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`ICadesPolicyMapper`](./ICadesPolicyMapper.md) |  |

---

### `SetPolicyMapper(ICadesPolicyMapperBySignerInfo)` {#setpolicymapper-lacuna-pki-cades-icadespolicymapperbysignerinfo}

```csharp
public void SetPolicyMapper(ICadesPolicyMapperBySignerInfo policyMapper)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policyMapper` | [`ICadesPolicyMapperBySignerInfo`](./ICadesPolicyMapperBySignerInfo.md) |  |

---

### `SetTimestampRequester(ITimestampRequester)` {#settimestamprequester-lacuna-pki-itimestamprequester}

```csharp
public void SetTimestampRequester(ITimestampRequester timestampRequester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `timestampRequester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
