# Webhooks - Rest PKI Core

Você pode configurar sua conta no [Rest PKI Core](../index.md) para que sua aplicação seja notificada receba notificações de eventos. Os seguintes eventos são
suportados atualmente:

Tipo do evento               | Descrição
---------------------------- | -----------
`DocumentSignatureCompleted` | Disparado quando um documento é assinado e tem seu processamento concluído

Caso habilitadas, as notificações de eventos por webhook consistem em requisições HTTP `POST` com um `WebhookEventModel`. Consulte a
[Referência da API](https://core.pki.rest/swagger) para a definição do *schema* do modelo.

Abaixo temos um exemplo de notificação do tipo `DocumentSignatureCompleted`:

```json
{
	"type": "DocumentSignatureCompleted",
	"document": {
		"id": "3dfdd6f0-884e-4092-abed-00f18ea6716a",
		"key": "FUFYQ7SL6XKMBW9A",
		"formattedKey": "FUFY-Q7SL-6XKM-BW9A",
		"originalFile": {
			"name": "P100001-001.pdf",
			"length": 101730,
			"contentType": "application/pdf",
			"location": "https://..."
		},
		"signedFile": {
			"name": "P100001-001.pdf",
			"length": 273429,
			"contentType": "application/pdf",
			"location": "https://..."
		},
		"status": "Completed",
		"signatureType": "Pades"
	}
}
```

Ao configurar as notificações de eventos por webhook, você deve especificar:

* A **URL** para a qual as requisições HTTP devem ser enviadas
* Opcionalmente, um tipo de autenticação a ser utilizada para autorizar a chamada junto à sua aplicação:
  * **Basic**: forneça também o *username* e *password*, enviados no header `Authentication` com *schema* `Basic`
  * **Bearer**: forneça também um *bearer token*, enviado no header `Authentication` com *schema* `Bearer`
  * **API Key**: forneça também a chave de API, enviada no header `X-Api-Key`
