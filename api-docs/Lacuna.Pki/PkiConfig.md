---
sidebar_label: "PkiConfig"
---

# PkiConfig

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public static class PkiConfig
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PkiConfig`

## Campos

### `CAIssuersDownloadTimeout` {#caissuersdownloadtimeout}

Time that the SDK waits when downloading a certificate from a AuthorityInformationAccess extension url.

```csharp
public static TimeSpan CAIssuersDownloadTimeout
```

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

### `CrlDownloadTimeout` {#crldownloadtimeout}

Time that the SDK waits when downloading a CRL.

```csharp
public static TimeSpan CrlDownloadTimeout
```

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

### `PdfHandlerFactory` {#pdfhandlerfactory}

```csharp
[Obsolete("There is no need for setting an external Pdf Handler")]
public static IPdfHandlerFactory PdfHandlerFactory
```

**Retorno**

[`IPdfHandlerFactory`](../Lacuna.Pki.Pades/IPdfHandlerFactory.md)

---

### `PreemptiveDownloadMaxDelay` {#preemptivedownloadmaxdelay}

The max TimeSpan that a preemptive download task shold wait to retry a download.

```csharp
public static TimeSpan PreemptiveDownloadMaxDelay
```

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

### `SignatureFinisherRetryTimeout` {#signaturefinisherretrytimeout}

Time that the CadesSignatureFinisher waits by defaut when retrying to finish a signature

```csharp
public static TimeSpan SignatureFinisherRetryTimeout
```

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

### `TimestampRequestTimeout` {#timestamprequesttimeout}

Time that the  SDK waits by default when requesting a timestamp.

```csharp
public static TimeSpan TimestampRequestTimeout
```

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

### `TslDownloadTimeout` {#tsldownloadtimeout}

Time that the SDK waits when downloading a Trusted Service List.

```csharp
public static TimeSpan TslDownloadTimeout
```

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

## Propriedades

### `BinaryLicense` {#binarylicense}

```csharp
public static byte[] BinaryLicense { get; }
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte)

---

### `DefaultPadesVisualLineSpacing` {#defaultpadesvisuallinespacing}

PadesVisualText system default line spacing multiplier based on the font size.

```csharp
public static double DefaultPadesVisualLineSpacing { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `DefaultPdfMarkLineSpacing` {#defaultpdfmarklinespacing}

PdfMark system default line spacing multiplier based on the font size.

```csharp
public static double DefaultPdfMarkLineSpacing { get; set; }
```

**Retorno**

[`double`](https://learn.microsoft.com/dotnet/api/system.double)

---

### `LappEnabled` {#lappenabled}

Whether or not to enable Lapp. Lapp is an Artifact Provider Proxy for Pki, it enables PKI resources, such as
CRLs and CA Certificates, to be requested through a single domain (*.lacunasoftware.com) which is then redirected
to worldwide servers to execute the requests simultaneously. It simplifies network and infrastructures managing and creates
high availability connections.

```csharp
public static bool LappEnabled { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `LicensePath` {#licensepath}

```csharp
public static string LicensePath { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Logger` {#logger}

Logger interface

```csharp
public static ILogger Logger { get; set; }
```

**Retorno**

[`ILogger`](./ILogger.md)

---

### `MaxDelay` {#maxdelay}

```csharp
[Obsolete("Use PreemptiveDownloadMaxDelay property instead")]
public static TimeSpan MaxDelay { get; set; }
```

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---

### `PdfUseLastDuplicatedSignatureField` {#pdfuselastduplicatedsignaturefield}

When duplicated signature field name is present on PDF, sets whether or not to take the last entry of the duplicated field name.
If false, the signature field name decoded will be the first one in offset increasing order.

```csharp
public static bool PdfUseLastDuplicatedSignatureField { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `PreemptiveCrlDownload` {#preemptivecrldownload}

Enable or Disable the Preemptive CRL Download

```csharp
public static bool PreemptiveCrlDownload { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `PrioritizeOcsp` {#prioritizeocsp}

Whether or not to prioritize certificate revocation status verification through OCSP artifacts first, when supported, over CRL artifacts.
If not set, first attempt is through CRL, second through OSCP.

```csharp
public static bool PrioritizeOcsp { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `ReverseX509Names` {#reversex509names}

```csharp
public static bool ReverseX509Names { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `TempPath` {#temppath}

Directory used by the SDK to store temporary files, such as the CRL cache files. By default, the current
user's temporary folder is used. In order to change this, you can either set this property programatically
or add an application setting in your application configuration file (web.config/app.config) with the key
"LacunaPki.TempPath".

```csharp
public static string TempPath { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TimeProvider` {#timeprovider}

Sets a custom time provider for returning the current DateTimeOffset.
If not set, PKI SDK uses system's DateTimeOffset.Now as default.

```csharp
public static IPkiTimeProvider TimeProvider { get; set; }
```

**Retorno**

[`IPkiTimeProvider`](./IPkiTimeProvider.md)

---

### `TimeZoneInfo` {#timezoneinfo}

Default timezone to use on DateTimeOffset validation strings

```csharp
public static TimeZoneInfo TimeZoneInfo { get; set; }
```

**Retorno**

[`TimeZoneInfo`](https://learn.microsoft.com/dotnet/api/system.timezoneinfo)

---

### `WebProxy` {#webproxy}

Configures a web proxy for SDK web requests

```csharp
public static IWebProxy WebProxy { get; set; }
```

**Retorno**

[`IWebProxy`](https://learn.microsoft.com/dotnet/api/system.net.iwebproxy)

---

## Métodos

### `LoadLicense(byte[])` {#loadlicense-system-byte}

Loads the Lacuna Pki SDK license to enable its usage

```csharp
public static void LoadLicense(byte[] content)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `content` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | License in binary format from given Base64 license |

---

### `LoadLicense(string)` {#loadlicense-system-string}

Loads the Lacuna Pki SDK license to enable its usage

```csharp
public static void LoadLicense(string path)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `path` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Path to Lacuna Pki license XML file |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
