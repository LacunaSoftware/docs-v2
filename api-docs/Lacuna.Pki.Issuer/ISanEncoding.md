---
sidebar_label: "ISanEncoding"
---

# ISanEncoding

**Namespace:** `Lacuna.Pki.Issuer`  
**Assembly:** `Lacuna.Pki`  
_Interface_

Interface for encoding a Subject Alternative Name

```csharp
public interface ISanEncoding
```

## Métodos

### `Encode()` {#encode}

Returns an ASN1 Sequence DER encoded containing the intended Subject Alternative Name fields

```csharp
byte[] Encode()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — ASN1 Sequence DER encoded

---
