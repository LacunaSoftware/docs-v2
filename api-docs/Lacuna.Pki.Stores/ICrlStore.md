---
sidebar_label: "ICrlStore"
---

# ICrlStore

**Namespace:** `Lacuna.Pki.Stores`  
**Assembly:** `Lacuna.Pki`  
_Interface_

Interface for classes that can recover CRLs

```csharp
public interface ICrlStore
```

## Comentários

Classes implementing this interface are able to recover CRLs, for instance from a local storage or maybe from the web.
All recovery methods take 3 common parameters: (1) the URI where the CRL was published; (2) an "issuedBefore" date, which marks the
maximum issuing date for the CRL and (3) the timeout for recovering the CRL.

## Métodos

### `GetExpiringAfter(Uri, Name, DateTimeOffset, DateTimeOffset, TimeSpan)` {#getexpiringafter-system-uri-lacuna-pki-name-system-datetimeoffset-system-datetimeoffset-system-timespan}

Recovers a CRL based on the publishing URI with a maximum issuing date and a minimum expiring date.

```csharp
Crl GetExpiringAfter(Uri uri, Name issuer, DateTimeOffset issuedBefore, DateTimeOffset expiringAfter, TimeSpan timeout)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `issuer` | [`Name`](../Lacuna.Pki/Name.md) |  |
| `issuedBefore` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | Maximum issuing date of the CRL. The returned CRL (if any) must have a ThisUpdate date value from before this parameter. |
| `expiringAfter` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | Minimum expiring date of the CRL. The returned CRL (if any) must have a NextUpdate date value after this parameter. |
| `timeout` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) | The maximum time that the implementing class should take to return a CRL. If TimeSpan.Zero, the implementing class should only             return a CRL if it does not depend on any network latency or other external factors. |

**Retorno**

[`Crl`](../Lacuna.Pki/Crl.md) — A CRL that matches the requirements, or null if none can be found.

---

### `GetIssuedAfter(Uri, Name, DateTimeOffset, DateTimeOffset, TimeSpan)` {#getissuedafter-system-uri-lacuna-pki-name-system-datetimeoffset-system-datetimeoffset-system-timespan}

Recovers a CRL based on the publishing URI with a minimum and maximum issuing date.

```csharp
Crl GetIssuedAfter(Uri uri, Name issuer, DateTimeOffset issuedBefore, DateTimeOffset issuedAfter, TimeSpan timeout)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `uri` | [`Uri`](https://learn.microsoft.com/dotnet/api/system.uri) |  |
| `issuer` | [`Name`](../Lacuna.Pki/Name.md) |  |
| `issuedBefore` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | Maximum issuing date of the CRL. The returned CRL (if any) must have a ThisUpdate date value from before this parameter. |
| `issuedAfter` | [`DateTimeOffset`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) | Minimum issuing date of the CRL. The returned CRL (if any) must have a ThisUpdate date value after this parameter. |
| `timeout` | [`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan) | The maximum time that the implementing class should take to return a CRL. If TimeSpan.Zero, the implementing class should only             return a CRL if it does not depend on any network latency or other external factors. |

**Retorno**

[`Crl`](../Lacuna.Pki/Crl.md) — A CRL that matches the requirements, or null if none can be found.

---
