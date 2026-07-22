---
sidebar_position: 6
slug: /rest-pki/core/integration/signature-sessions/pdf-a-conversion
sidebar_label: "PDF/A conversion"
---

# PDF/A conversion - Sessões de assinatura

As of version 4.2.0, Rest PKI Core can automatically convert a PDF document to the **PDF/A** format (a long-term archiving
standard) right after signing. To enable it, set `ConvertToPdfA = true` on `PdfSignatureOptions`.

:::note
This feature requires a PDF/A conversion service to be enabled and properly configured on your Rest PKI Core instance
beforehand. If the service is not available, the call will fail with an `ApiException` (code `PdfAConversionNotAvailable`)
when the conversion is attempted.
:::


## In signature sessions

When creating a [signature session](index.md), set `PdfSignatureOptions.ConvertToPdfA = true` to convert to PDF/A every PDF
document signed during the session (both documents uploaded by the user and [predefined documents](index.md#predefined-documents)
that don't specify their own option):

In .NET:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	...
	PdfSignatureOptions = new PdfSignatureOptions {
		ConvertToPdfA = true,
	},
});
return Redirect(response.RedirectUrl);
```

The option can also be set individually on each predefined document, overriding the session-level option:

```cs
var documents = new List<SignatureSessionDocumentToSign> {
	new SignatureSessionDocumentToSign {
		File = FileReference.FromFile(pdfPath),
		PdfSignatureOptions = new PdfSignatureOptions {
			ConvertToPdfA = true,
		},
	},
	...
};
```

Direct API integration:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"pdfSignatureOptions": {
		"convertToPdfA": true
	}
}
```


## In standalone signatures

The same option is available on `PdfSignatureOptions` when using the local signature flow (`PrepareSignatureAsync`), outside
the context of signature sessions.
