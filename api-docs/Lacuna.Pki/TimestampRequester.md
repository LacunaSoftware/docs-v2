---
sidebar_label: "TimestampRequester"
---

# TimestampRequester

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class TimestampRequester : ITimestampRequester
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `TimestampRequester`

## Construtores

### `TimestampRequester(Uri, ICredentials)` {#ctor-system-uri-system-net-icredentials}

Instantiates a TimestampeRequester that requests timestamps using the HTTPS protocol with basic authentication. For production is recommended only HTTPS protocol, otherwise your authentication parameters will traffic as plaintext over the network.

```csharp
public TimestampRequester(Uri uri, ICredentials credentials)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) | Timestamper URI. |
| `credentials` | [`ICredentials`](https://learn.microsoft.com/dotnet/api/system.net.icredentials) | Credentials for authentication, typically an instance of System.Net.NetworkCredential. |

---

### `TimestampRequester(Uri, PKCertificateWithKey)` {#ctor-system-uri-lacuna-pki-pkcertificatewithkey}

Instantiates a TimestampRequester using the HTTPS protocol with mutual SSL authentication

```csharp
public TimestampRequester(Uri uri, PKCertificateWithKey clientCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) | Timestamper URI |
| `clientCertificate` | [`PKCertificateWithKey`](./PKCertificateWithKey.md) | Certificate for mutual authentication recovered from a WindowsCertificateStore. |

---

### `TimestampRequester(Uri, string, string)` {#ctor-system-uri-system-string-system-string}

Instantiates a TimestampeRequester that requests timestamps with Basic Authentication header. For production is recommended only HTTPS protocol, otherwise your authentication parameters will traffic as plaintext over the network.

```csharp
public TimestampRequester(Uri uri, string username, string password)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) | Timestamper URI. |
| `username` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `password` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

### `TimestampRequester(Uri, string)` {#ctor-system-uri-system-string}

Instantiates a TimestampeRequester that requests timestamps using the HTTPS protocol with OAuth bearer token. For production is recommended only HTTPS protocol, otherwise your bearer token will traffic as plaintext over the network.

```csharp
public TimestampRequester(Uri uri, string oAuthBearerToken)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) | Timestamper URI. |
| `oAuthBearerToken` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | OAtuh Bearer token |

---

### `TimestampRequester(Uri)` {#ctor-system-uri}

Instantiates a TimestampRequester that requests timestamps using the HTTP or HTTPS protocol without authentication

```csharp
public TimestampRequester(Uri uri)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) | Timestamper URI |

---

## Propriedades

### `CustomHeaders` {#customheaders}

Custom headers key:value to be added to the timestamp post request

```csharp
public Dictionary<string, string> CustomHeaders { get; set; }
```

**Retorno**

[`Dictionary<string, string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2)

---

### `Timeout` {#timeout}

The timestamp request timeout. If not set, default is the PkiConfig.TimestampRequestTimeout

```csharp
public TimeSpan Timeout { get; set; }
```

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

### `TsaPolicyId` {#tsapolicyid}

The OID of the policy to be passed to the TSA when requesting timestamps (optional). Some TSAs use this parameter
to distinguish between types of timestamps.

```csharp
public string TsaPolicyId { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Uri` {#uri}

```csharp
public Uri Uri { get; }
```

**Retorno**

[`Uri`](https://learn.microsoft.com/dotnet/api/system.uri)

---

## Métodos

### `DecodeRfc3161Response(byte[])` {#decoderfc3161response-system-byte}

Decodes a RFC 3161 timestamp response (TimeStampResp)

```csharp
public static CadesTimestamp DecodeRfc3161Response(byte[] response)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `response` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | The response content |

**Retorno**

[`CadesTimestamp`](../Lacuna.Pki.Cades/CadesTimestamp.md) — The cades timestamp signture

---

### `EncodeRfc3161Request(DigestAlgorithmAndValue, byte[])` {#encoderfc3161request-lacuna-pki-digestalgorithmandvalue-system-byte}

Creates a RFC 3161 standar timestamp request content BER encoded.

```csharp
public static byte[] EncodeRfc3161Request(DigestAlgorithmAndValue digest, byte[] nonce = null)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md) |  |
| `nonce` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `GetTimestamp(DigestAlgorithmAndValue, TimeSpan)` {#gettimestamp-lacuna-pki-digestalgorithmandvalue-system-timespan}

```csharp
[Obsolete("Set the object property Timeout instead of using timeout argument")]
public CadesTimestamp GetTimestamp(DigestAlgorithmAndValue digest, TimeSpan timeout)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md) |  |
| `timeout` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) |  |

**Retorno**

[`CadesTimestamp`](../Lacuna.Pki.Cades/CadesTimestamp.md)

---

### `GetTimestamp(DigestAlgorithmAndValue)` {#gettimestamp-lacuna-pki-digestalgorithmandvalue}

Requestes the timestamp-token

```csharp
public CadesTimestamp GetTimestamp(DigestAlgorithmAndValue digest)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `digest` | [`DigestAlgorithmAndValue`](./DigestAlgorithmAndValue.md) | Digest algorithm and value for message-imprint |

**Retorno**

[`CadesTimestamp`](../Lacuna.Pki.Cades/CadesTimestamp.md) — CadesTimestamp signature

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
