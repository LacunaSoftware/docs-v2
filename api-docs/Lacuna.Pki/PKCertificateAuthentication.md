---
sidebar_label: "PKCertificateAuthentication"
---

# PKCertificateAuthentication

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

Helper class to implement public-key certificate authentication.

```csharp
public class PKCertificateAuthentication
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PKCertificateAuthentication`

## Construtores

### `PKCertificateAuthentication(IAsyncNonceStore)` {#ctor-lacuna-pki-stores-iasyncnoncestore}

```csharp
public PKCertificateAuthentication(IAsyncNonceStore asyncStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `asyncStore` | [`IAsyncNonceStore`](../Lacuna.Pki.Stores/IAsyncNonceStore.md) |  |

---

### `PKCertificateAuthentication(INonceStore)` {#ctor-lacuna-pki-stores-inoncestore}

```csharp
public PKCertificateAuthentication(INonceStore store)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `store` | [`INonceStore`](../Lacuna.Pki.Stores/INonceStore.md) |  |

---

## Campos

### `DigestAlgorithm` {#digestalgorithm}

The signature algorithm that the client must use to sign the nonce.

```csharp
public static readonly DigestAlgorithm DigestAlgorithm
```

**Retorno**

[`DigestAlgorithm`](./DigestAlgorithm.md)

---

## Métodos

### `Complete(byte[], byte[], byte[], CertificateValidationOptions, out PKCertificate)` {#complete-system-byte-system-byte-system-byte-lacuna-pki-certificatevalidationoptions-lacuna-pki-pkcertificate}

Completes an authentication.

```csharp
public ValidationResults Complete(byte[] nonce, byte[] encodedCertificate, byte[] signature, CertificateValidationOptions certificateValidationOptions, out PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The nonce signed by the client. |
| `encodedCertificate` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The client's certificate binary encoding. |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The signature of the nonce. |
| `certificateValidationOptions` | [`CertificateValidationOptions`](./CertificateValidationOptions.md) | Certificate validation options to use during the client's certificate validation. |
| `certificate` | [`PKCertificate`](./PKCertificate.md) | The client's decoded certificate. If the authentication succeeds, this parameter is garanteed to be assigned to. If it fails, it may or may not be assigned to, depending on the stage on which the authentication failed. |

**Retorno**

[`ValidationResults`](./ValidationResults.md) — Whether the authentication succeeded or not, that is, if the client's certificate can be trusted according to the certificate validation options passed.

---

### `Complete(byte[], byte[], byte[], ITrustArbitrator, out PKCertificate)` {#complete-system-byte-system-byte-system-byte-lacuna-pki-itrustarbitrator-lacuna-pki-pkcertificate}

Completes an authentication.

```csharp
public ValidationResults Complete(byte[] nonce, byte[] encodedCertificate, byte[] signature, ITrustArbitrator trustArbitrator, out PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The nonce signed by the client. |
| `encodedCertificate` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The client's certificate binary encoding. |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The signature of the nonce. |
| `trustArbitrator` | [`ITrustArbitrator`](./ITrustArbitrator.md) | A trust arbitrator to determine if the certificate can be trusted. |
| `certificate` | [`PKCertificate`](./PKCertificate.md) | The client's decoded certificate. If the authentication succeeds, this parameter is garanteed to be assigned to. If it fails, it may or may not be assigned to, depending on the stage on which the authentication failed. |

**Retorno**

[`ValidationResults`](./ValidationResults.md) — Whether the authentication succeeded or not, that is, if the client's certificate can be trusted according to the trust arbitrator chosen.

---

### `CompleteAsync(byte[], byte[], byte[], CertificateValidationOptions, CancellationToken)` {#completeasync-system-byte-system-byte-system-byte-lacuna-pki-certificatevalidationoptions-system-threading-cancellationtoken}

```csharp
public Task<PKCertificateAuthenticationResult> CompleteAsync(byte[] nonce, byte[] encodedCertificate, byte[] signature, CertificateValidationOptions certificateValidationOptions, CancellationToken cancellationToken = default)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `encodedCertificate` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `certificateValidationOptions` | [`CertificateValidationOptions`](./CertificateValidationOptions.md) |  |
| `cancellationToken` | [`CancellationToken`](https://learn.microsoft.com/dotnet/api/system.threading.cancellationtoken) |  |

**Retorno**

[`Task<PKCertificateAuthenticationResult>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `CompleteAsync(byte[], byte[], byte[], ITrustArbitrator, CancellationToken)` {#completeasync-system-byte-system-byte-system-byte-lacuna-pki-itrustarbitrator-system-threading-cancellationtoken}

```csharp
public Task<PKCertificateAuthenticationResult> CompleteAsync(byte[] nonce, byte[] encodedCertificate, byte[] signature, ITrustArbitrator trustArbitrator, CancellationToken cancellationToken = default)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `encodedCertificate` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `signature` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |
| `trustArbitrator` | [`ITrustArbitrator`](./ITrustArbitrator.md) |  |
| `cancellationToken` | [`CancellationToken`](https://learn.microsoft.com/dotnet/api/system.threading.cancellationtoken) |  |

**Retorno**

[`Task<PKCertificateAuthenticationResult>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

### `Start()` {#start}

Starts an authentication, generating and storing a new cryptographic nonce.

```csharp
public byte[] Start()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — The nonce (16-byte byte array) that the client must digitally sign.

---

### `StartAsync(CancellationToken)` {#startasync-system-threading-cancellationtoken}

```csharp
public Task<byte[]> StartAsync(CancellationToken cancellationToken = default)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `cancellationToken` | [`CancellationToken`](https://learn.microsoft.com/dotnet/api/system.threading.cancellationtoken) |  |

**Retorno**

[`Task<byte[]>`](https://learn.microsoft.com/dotnet/api/system.threading.tasks.task-1)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
