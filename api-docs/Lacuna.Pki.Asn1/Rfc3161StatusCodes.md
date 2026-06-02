---
sidebar_label: "Rfc3161StatusCodes"
---

# Rfc3161StatusCodes

**Namespace:** `Lacuna.Pki.Asn1`  
**Assembly:** `Lacuna.Pki`  
_Enum_

```csharp
public enum Rfc3161StatusCodes
```

## Membros

| Nome | Descrição |
|---|---|
| `Granted` | When the PKIStatus contains the value zero a TimeStampToken, as requested, is present. |
| `GrantedWithMods` | When the PKIStatus contains the value one a TimeStampToken, with modifications, is present. |
| `Rejection` |  |
| `RevocationNotification` | Notification that a revocation has occurred |
| `RevocationWarning` | This message contains a warning that a revocation is imminent |
| `Waiting` |  |
