---
sidebar_label: "PkiUtil"
---

# PkiUtil

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public static class PkiUtil
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PkiUtil`

## Propriedades

### `LastLogException` {#lastlogexception}

```csharp
public static Exception LastLogException { get; set; }
```

**Retorno**

[`Exception`](https://learn.microsoft.com/dotnet/api/system.exception)

---

### `OfflineSignerConfigurator` {#offlinesignerconfigurator}

Validation configuration preset for offline signers. Use on methods SetCertificateValidationConfigurator

```csharp
public static Action<CertificateValidationOptions> OfflineSignerConfigurator { get; }
```

**Retorno**

[`Action<CertificateValidationOptions>`](https://learn.microsoft.com/dotnet/api/system.action-1)

---

## Métodos

### `Compress(byte[])` {#compress-system-byte}

```csharp
public static byte[] Compress(byte[] data)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `data` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DecodeDerInteger(byte[])` {#decodederinteger-system-byte}

```csharp
public static BigInteger DecodeDerInteger(byte[] encoded)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `encoded` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`BigInteger`](https://learn.microsoft.com/dotnet/api/system.numerics.biginteger)

---

### `DecodeHexString(string)` {#decodehexstring-system-string}

```csharp
public static byte[] DecodeHexString(string hexString)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `hexString` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `Decompress(byte[])` {#decompress-system-byte}

```csharp
public static byte[] Decompress(byte[] data)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `data` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `EncodePem(PemObjects, byte[])` {#encodepem-lacuna-pki-pemobjects-system-byte}

```csharp
public static string EncodePem(PemObjects objectType, byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `objectType` | [`PemObjects`](./PemObjects.md) |  |
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) |  |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `EncodeToHexString(byte[], string, bool)` {#encodetohexstring-system-byte-system-string-system-boolean}

Encodes a byte array to hex string

```csharp
public static string EncodeToHexString(byte[] content, string separator = "", bool upperCase = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | Content to encode |
| `separator` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Separator string between hex bytes. Default: no separator |
| `upperCase` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) | True for encoding an upper case hex string, False for lower case hex string. Default: lower case |

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `FlushLog()` {#flushlog}

```csharp
public static void FlushLog()
```

---

### `SetGlobalTimestampRequester(ITimestampRequester)` {#setglobaltimestamprequester-lacuna-pki-itimestamprequester}

```csharp
public static void SetGlobalTimestampRequester(ITimestampRequester tsRequester)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tsRequester` | [`ITimestampRequester`](./ITimestampRequester.md) |  |

---

### `SetGlobalUserCertificateStore(ICertificateStore)` {#setglobalusercertificatestore-lacuna-pki-stores-icertificatestore}

```csharp
public static void SetGlobalUserCertificateStore(ICertificateStore userCertificateStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `userCertificateStore` | [`ICertificateStore`](../Lacuna.Pki.Stores/ICertificateStore.md) |  |

---

### `SetGlobalUserCertificateStore(IUserCertificateStore)` {#setglobalusercertificatestore-lacuna-pki-stores-iusercertificatestore}

```csharp
public static void SetGlobalUserCertificateStore(IUserCertificateStore userCertificateStore)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `userCertificateStore` | [`IUserCertificateStore`](../Lacuna.Pki.Stores/IUserCertificateStore.md) |  |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
