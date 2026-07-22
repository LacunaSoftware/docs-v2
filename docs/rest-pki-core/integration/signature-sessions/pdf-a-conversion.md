---
sidebar_position: 6
slug: /rest-pki/core/integration/signature-sessions/pdf-a-conversion
sidebar_label: "Conversão para PDF/A"
---

# Conversão para PDF/A - Sessões de assinatura

A partir da versão 4.2.0, o Rest PKI Core pode converter automaticamente um documento PDF para o formato **PDF/A** (padrão de
arquivamento de longo prazo) logo após a assinatura. Para isso, especifique `ConvertToPdfA = true` em `PdfSignatureOptions`.

:::note
Essa funcionalidade depende de um serviço de conversão para PDF/A previamente habilitado e configurado na sua instância do
Rest PKI Core. Caso o serviço não esteja disponível, a chamada falhará com uma `ApiException` (código `PdfAConversionNotAvailable`)
ao tentar realizar a conversão.
:::


## Em sessões de assinatura

Ao criar uma [sessão de assinatura](index.md), informe `PdfSignatureOptions.ConvertToPdfA = true` para converter para PDF/A todos
os documentos PDF assinados durante a sessão (tanto os enviados pelo usuário quanto os [pré-definidos](index.md#predefined-documents)
que não especifiquem sua própria opção):

Em .NET:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	...
	PdfSignatureOptions = new PdfSignatureOptions {
		ConvertToPdfA = true,
	},
});
return Redirect(response.RedirectUrl);
```

Também é possível especificar a opção individualmente em cada documento pré-definido, sobrepondo a opção definida no nível da
sessão:

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

Integração direta por API:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"pdfSignatureOptions": {
		"convertToPdfA": true
	}
}
```


## Na assinatura avulsa

A mesma opção está disponível em `PdfSignatureOptions` ao usar o fluxo de assinatura local (`PrepareSignatureAsync`), fora do
contexto de sessões de assinatura.
