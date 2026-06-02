---
sidebar_label: "IGracePeriodCatalog"
---

# IGracePeriodCatalog

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Interface_

Interface for returning a grace period timespan based on a certificate properties or certificate authority.

```csharp
public interface IGracePeriodCatalog
```

## Comentários

A grace period permits certificate revocation information to propagate through the revocation processes.
This period could extend from the time an authorized entity requests certificate revocation to when the
information is available for the relying party to use. In order to make sure that the certificate was not
revoked at the time the signature was time-marked or time-stamped, verifiers should wait until the end of
the grace period.

## Métodos

### `GetGracePeriod(Certificate)` {#getgraceperiod-lacuna-pki-certificate}

```csharp
TimeSpan GetGracePeriod(Certificate targetCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `targetCertificate` | [`Certificate`](./Certificate.md) |  |

**Retorno**

[`TimeSpan`](https://learn.microsoft.com/dotnet/api/system.timespan)

---
