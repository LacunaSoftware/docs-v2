---
sidebar_label: "IPdfHandler2"
---

# IPdfHandler2

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface IPdfHandler2 : IPdfHandler
```

## Métodos

### `SetVisualRepresentation(PadesVisualRepresentation2, DateTimeOffset?)` {#setvisualrepresentation-lacuna-pki-pades-padesvisualrepresentation2-system-nullable-system-datetimeoffset}

```csharp
void SetVisualRepresentation(PadesVisualRepresentation2 visual, DateTimeOffset? signingTime)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `visual` | [`PadesVisualRepresentation2`](./PadesVisualRepresentation2.md) |  |
| `signingTime` | [`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset) |  |

---

## Membros herdados

[`SetPdf(byte[])`](./IPdfHandler.md#setpdf-system-byte), [`CreateSignatureDictionary(PadesFilters)`](./IPdfHandler.md#createsignaturedictionary-lacuna-pki-pades-padesfilters), [`SetCertificationLevel(PadesCertificationLevel)`](./IPdfHandler.md#setcertificationlevel-lacuna-pki-pades-padescertificationlevel), [`GenarateRangeBytes(int)`](./IPdfHandler.md#genaraterangebytes-system-int32), [`Finalize(byte[])`](./IPdfHandler.md#finalize-system-byte), [`SetSigningDateM(DateTimeOffset)`](./IPdfHandler.md#setsigningdatem-system-datetimeoffset), [`SetVisualRepresentation(PadesVisualRepresentation, DateTimeOffset?)`](./IPdfHandler.md#setvisualrepresentation-lacuna-pki-pades-padesvisualrepresentation-system-nullable-system-datetimeoffset), [`GetSignatureFieldName()`](./IPdfHandler.md#getsignaturefieldname), [`AddToDss(IEnumerable<DssEntry>)`](./IPdfHandler.md#addtodss-system-collections-generic-ienumerable-lacuna-pki-pades-dssentry), [`AddTimestamp(ITimestampRequester)`](./IPdfHandler.md#addtimestamp-lacuna-pki-itimestamprequester), [`GetSignedPdf()`](./IPdfHandler.md#getsignedpdf), [`GetSigners()`](./IPdfHandler.md#getsigners), [`GetBlankSignaturesNames()`](./IPdfHandler.md#getblanksignaturesnames), [`GetRangeBytes(string)`](./IPdfHandler.md#getrangebytes-system-string), [`GetCertificateStoreFromDss()`](./IPdfHandler.md#getcertificatestorefromdss), [`GetDss(string)`](./IPdfHandler.md#getdss-system-string), [`CanHandleDss`](./IPdfHandler.md#canhandledss), [`CanHandleVisualRepresentation`](./IPdfHandler.md#canhandlevisualrepresentation)
