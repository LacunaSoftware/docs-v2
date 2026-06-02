---
sidebar_label: "PadesTimestamper"
---

# PadesTimestamper

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class PadesTimestamper
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PadesTimestamper`

## Construtores

### `PadesTimestamper()` {#ctor}

```csharp
public PadesTimestamper()
```

---

## Propriedades

### `SignersValidationResult` {#signersvalidationresult}

```csharp
public List<ValidationResults> SignersValidationResult { get; }
```

**Retorno**

[`List<ValidationResults>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `ThrowIfInvalidPreviousSigner` {#throwifinvalidprevioussigner}

```csharp
public bool ThrowIfInvalidPreviousSigner { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `GetStampedSignature()` {#getstampedsignature}

```csharp
public byte[] GetStampedSignature()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SetCertificationLevel(PadesCertificationLevel)` {#setcertificationlevel-lacuna-pki-pades-padescertificationlevel}

```csharp
public void SetCertificationLevel(PadesCertificationLevel certLevel)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certLevel` | [`PadesCertificationLevel`](./PadesCertificationLevel.md) |  |

---

### `SetCustomSignatureFieldName(string)` {#setcustomsignaturefieldname-system-string}

```csharp
public void SetCustomSignatureFieldName(string name)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `name` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetPdf(byte[])` {#setpdf-system-byte}

```csharp
public void SetPdf(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

---

### `SetPdf(Stream)` {#setpdf-system-io-stream}

```csharp
public void SetPdf(Stream stream)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `stream` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) |  |

---

### `SetPdf(string)` {#setpdf-system-string}

```csharp
public void SetPdf(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetPolicy(PadesPolicySpec)` {#setpolicy-lacuna-pki-pades-padespolicyspec}

```csharp
public void SetPolicy(PadesPolicySpec policy)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `policy` | [`PadesPolicySpec`](./PadesPolicySpec.md) |  |

---

### `SetReason(string)` {#setreason-system-string}

```csharp
public void SetReason(string reason)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `reason` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `SetTimestampRequester(ITimestampRequester)` {#settimestamprequester-lacuna-pki-itimestamprequester}

```csharp
public void SetTimestampRequester(ITimestampRequester tsRequester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tsRequester` | [`ITimestampRequester`](../Lacuna.Pki/ITimestampRequester.md) |  |

---

### `SetVisualRepresentation(PadesVisualRepresentation2)` {#setvisualrepresentation-lacuna-pki-pades-padesvisualrepresentation2}

```csharp
public void SetVisualRepresentation(PadesVisualRepresentation2 visualRepresentation)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `visualRepresentation` | [`PadesVisualRepresentation2`](./PadesVisualRepresentation2.md) |  |

---

### `Stamp()` {#stamp}

```csharp
public void Stamp()
```

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
