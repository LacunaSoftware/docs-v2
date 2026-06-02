---
sidebar_label: "CertificateExplorer"
---

# CertificateExplorer

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class CertificateExplorer
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `CertificateExplorer`

## Construtores

### `CertificateExplorer(RestPkiClient)` {#ctor-lacuna-restpki-client-restpkiclient}

```csharp
public CertificateExplorer(RestPkiClient client)
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

### `Certificate` {#certificate}

```csharp
public byte[] Certificate { get; set; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `SecurityContextId` {#securitycontextid}

```csharp
public Guid? SecurityContextId { get; set; }
```

**Retorno**

[`Guid?`](https://learn.microsoft.com/dotnet/api/system.guid)

---

### `Validate` {#validate}

```csharp
public bool Validate { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

## Métodos

### `Open()` {#open}

```csharp
public OpenCertificateResponse Open()
```

**Retorno**

`OpenCertificateResponse`

---

### `OpenAsync()` {#openasync}

```csharp
public Task<OpenCertificateResponse> OpenAsync()
```

**Retorno**

[`Task<OpenCertificateResponse>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
