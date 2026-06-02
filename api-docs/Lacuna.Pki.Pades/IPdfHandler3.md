---
sidebar_label: "IPdfHandler3"
---

# IPdfHandler3

**Namespace:** `Lacuna.Pki.Pades`  
**Assembly:** `Lacuna.Pki`  
_Interface_

```csharp
public interface IPdfHandler3 : IPdfHandler2, IPdfHandler
```

## Propriedades

### `StandardVersion` {#standardversion}

```csharp
Version StandardVersion { get; }
```

**Retorno**

[`Version`](https://learn.microsoft.com/dotnet/api/system.version)

---

## Membros herdados

[`SetVisualRepresentation(PadesVisualRepresentation2, DateTimeOffset?)`](./IPdfHandler2.md#setvisualrepresentation-lacuna-pki-pades-padesvisualrepresentation2-system-nullable-system-datetimeoffset), [`SetPdf(byte[])`](./IPdfHandler.md#setpdf-system-byte), [`CreateSignatureDictionary(PadesFilters)`](./IPdfHandler.md#createsignaturedictionary-lacuna-pki-pades-padesfilters), [`SetCertificationLevel(PadesCertificationLevel)`](./IPdfHandler.md#setcertificationlevel-lacuna-pki-pades-padescertificationlevel), [`GenarateRangeBytes(int)`](./IPdfHandler.md#genaraterangebytes-system-int32), [`Finalize(byte[])`](./IPdfHandler.md#finalize-system-byte), [`SetSigningDateM(DateTimeOffset)`](./IPdfHandler.md#setsigningdatem-system-datetimeoffset), [`SetVisualRepresentation(PadesVisualRepresentation, DateTimeOffset?)`](./IPdfHandler.md#setvisualrepresentation-lacuna-pki-pades-padesvisualrepresentation-system-nullable-system-datetimeoffset), [`GetSignatureFieldName()`](./IPdfHandler.md#getsignaturefieldname), [`AddToDss(IEnumerable<DssEntry>)`](./IPdfHandler.md#addtodss-system-collections-generic-ienumerable-lacuna-pki-pades-dssentry), [`AddTimestamp(ITimestampRequester)`](./IPdfHandler.md#addtimestamp-lacuna-pki-itimestamprequester), [`GetSignedPdf()`](./IPdfHandler.md#getsignedpdf), [`GetSigners()`](./IPdfHandler.md#getsigners), [`GetBlankSignaturesNames()`](./IPdfHandler.md#getblanksignaturesnames), [`GetRangeBytes(string)`](./IPdfHandler.md#getrangebytes-system-string), [`GetCertificateStoreFromDss()`](./IPdfHandler.md#getcertificatestorefromdss), [`GetDss(string)`](./IPdfHandler.md#getdss-system-string), [`CanHandleDss`](./IPdfHandler.md#canhandledss), [`CanHandleVisualRepresentation`](./IPdfHandler.md#canhandlevisualrepresentation)
