# Sessões de assinatura - Rest PKI Core

**Sessões de assinatura** são uma funcionalidade do [Rest PKI Core](../../index.md) que permitem que seus usuários assinem documentos digitalmente sem que você
precise implementar uma página de assinatura digital na sua aplicação.

Para criar uma sessão de assinatura, sua aplicação especifica um `returnUrl` e recebe de volta um `redirectUrl`. Sua aplicação então redireciona o usuário para o
`redirectUrl`, local onde ele irá realizar as assinaturas digitais:

![Signature session start](/images/rest-pki/signature-session-start.png)

Uma vez que o processo seja finalizado, o usuário será redirecionado de volta à sua aplicação no endereço `returnUrl` especificado durante a criação da sessão. Um
*query parameter* será adicionado à URL contendo o ID da sessão de assinatura (`?signatureSessionId=...`). Usando esse ID, a sua aplicação chama o Rest PKI Core para
obter os documentos assinados pelo usuário:

![Signature session end](/images/rest-pki/signature-session-end.png)

## Criando a sessão de assinatura

:::tip
Desse ponto em diante estaremos descrevendo chamadas ao Rest PKI Core. Para conseguir acompanhar, certifique-se de que já fez os [Primeiros passos](../get-started.md).
:::


Em .NET, chame `IRestPkiService.CreateSignatureSessionAsync()` e use o `RedirectUrl` retornado para redirecionar o usuário:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	ReturnUrl = "http://localhost:8080/SessionCallback",
});
return Redirect(response.RedirectUrl);
```

Veja [exemplo de criação de sessão de assinatura em .NET](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/SignatureSessionRestCoreController.cs).

Em PHP, chame `RestPkiServiceInterface.createSignatureSession()` e use o campo `$redirectUrl` retornado para redirecionar o usuário:

```php
$request = new CreateSignatureSessionRequest();
$request->returnUrl = "http://localhost:8080/SessionCallback";

$response = $service->createSignatureSession($request);

header("Location: {$response->redirectUrl}");
```

Veja [exemplo de criação de sessão de assinatura em PHP](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/signature-session-rest-core/index.php).

Em Java, chame `RestPkiService.CreateSignatureSession()` e use o `RedirectUrl` retornado para redirecionar o usuário:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
request.setReturnUrl("http://localhost:60695/signature-session-rest-core/complete");

CreateSignatureSessionResponse response = restPkiService.CreateSignatureSession(request);

return "redirect:" + response.getRedirectUrl();
```

Veja [exemplo de criação de sessão de assinatura em Java](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/SignatureSessionRestCoreController.java).

Caso esteja chamando a API diretamente:

```plaintext
POST {endpoint}/api/signature-sessions
{
	"returnUrl": "http://localhost:8080/SessionCallback"
}
```

Vamos analisar o `returnUrl` utilizado nos exemplos acima:

```plaintext
http://localhost:8080/SessionCallback
^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^
Endereço da sua app   Rota para o tratamento de retorno
```

Ao adaptar os exemplos para a sua aplicação, você precisa alterar a primeira porção para o endereço da sua própria aplicação e também a rota para o tratamento do
retorno na sua aplicação (veja a seção abaixo).

## Implementando o tratamento de retorno

O `returnUrl` é o endereço para no qual o Rest PKI Core enviará o seu usuário de volta para a sua aplicação uma vez que o processo de assinatura seja concluído.

:::note
Até aqui, estamos usando `/SessionCallback` como URL relativa do tratamento de retorno, porém sinta-se à vontade para usar a URL relativa mais adequada à sua
aplicação
:::


Em .NET, a implementação do tratamento de retorno seria algo como:

```cs
public class SessionCallbackController : Controller {
	...	
	public async Task<IActionResult> Index(Guid signatureSessionId) {
		var session = await restPkiService.GetSignatureSessionAsync(signatureSessionId.Value);
		if (session.Status != SessionStatus.Completed) {
			return Redirect("/");
		}
		return View(session);
	}
}
```

Veja [exemplo de tratamento de retorno em .NET](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/SignatureSessionRestCoreController.cs).

Em PHP, a implementação do tratamento de retorno seria algo como:

```php
$sessionId = $_GET['signatureSessionId'];

$session = $session->getSignatureSession($sessionId);
if ($session->status != SignatureSessionStatus::COMPLETED) {
	header("Location: http://localhost:8000/");
}
```

Veja [exemplo de tratamento de retorno em PHP](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/signature-session-rest-core/complete.php).

Em Java, a implementação do tratamento de retorno seria algo como:

```java
@Controller
public class SessionCallbackController {
	...
	public String index(
		Model model, 
		@RequestParam(value="signatureSessionId") String sessionId
	) throws RestException {
		SignatureSession session = restPkiService.getSignatureSession(UUID.fromString(sessionId));
		if (session.getStatus() != SignatureSessionStatus.Completed){
			return "redirect:/";
		}
		model.addAttribute("session", session);
		return "signature-callback/index";
	}
}
```

Veja [exemplo de tratamento de retorno em Java](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/SignatureSessionRestCoreController.java).

Note que verificamos o estado (`Status`) da sessão e enviamos o usuário para um local padrão caso o estado não seja `Completed`.

:::note
Quando um usuário é redirecionado de volta à sua aplicação, a sessão terá um de dois possíveis estados: `Completed` ou `UserCancelled`, esse último ocorrendo quando a
sessão é cancelada pelo usuário. Seu código deve sempre checar esse estado, pois é perfeitamente normal um usuário ser direcionado ao endereço de tratamento de
retorno porque cancelou a sessão.
:::


Em .NET, a view de Razor seria algo como:

```html
@using Lacuna.RestPki.Api
@using Lacuna.RestPki.Client
@model SignatureSession
<h2>Signed documents</h2>
<ul>
	@foreach (var document in Model.Documents)
	{
		<li>
			<a href="@document.SignedFile.Location">@document.SignedFile.Name</a>
		</li>
	}
</ul>
```

Em PHP, o lado do cliente seria algo como:

```php
<h2>Signed documents</h2>
<ul>
	<?php for ($i = 0; $i < count($session->documents); $i++) { 
		$document = $session->documents[$i]; ?>

		<li>
			<a href="<?= $document->signedFile->location ?>"><?= $document->signedFile->name ?></a>
		</li>
	<?php } ?>
</ul>
```

Em Java, a view de Spring seria algo como:

```html
<h2>Signed documents</h2>
<ul th:each="document : ${session.getDocuments()}">
	<li>
		<a th:href="${document.getSignedFile().getLocation()">
			<span th:text="${document.getSignedFile().getName()}"/>
		</a>
	</li>
</ul>
```

<a name="predefined-documents" />

## Pré-definindo os documentos a serem assinados

As sessões que criamos até aqui solicitam que o usuário faça upload dos documentos a serem assinados. Você pode alternativamente especificar os documentos
que devem ser assinador no momento da criação da sessão. Nesse caso, o usuário não poderá fazer upload de documentos, podendo apenas assinar os documentos
pré-definidos pela sua aplicação.

Em .NET:

```cs
string pdfPath = ...;
Stream xmlStream = ...;
var documents = new List<SignatureSessionDocumentToSign> {
	new SignatureSessionDocumentToSign {
		File = FileReference.FromFile(pdfPath),
	},
	new SignatureSessionDocumentToSign {
		File = FileReference.FromStream(xmlStream, "doc.xml"),
	},
	...
};
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	...
}, documents: documents);
return Redirect(response.RedirectUrl);
```

Em Java:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
String pdfPath = ...;
Stream xmlStream = ...;

List<SignatureSessionDocumentToSign> documents = new ArrayList<>();

SignatureSessionDocumentToSign document = new SignatureSessionDocumentToSign();
document.setFile(FileReference.fromFile(pdfPath, null, "application/pdf"));
documents.add(document);

document = new SignatureSessionDocumentToSign();
document.setFile(FileReference.FromStream(pdfPath, "doc.xml", null));
documents.add(document);

CreateSignatureSessionResponse response = restPkiService.createSignatureSession(request, null, null, documents);

return "redirect:" + response.getRedirectUrl();
```

Integração direta por API:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"documents": [
		{
			"file": {
				"content": "Base64EncodedBytes==",
				"name": "doc1.pdf"
			}
		},
		{
			"file": {
				"url": "https://yourapp.com/doc2.pdf"
			}
		},
		...
	]
}
```

Para mais informações veja [Referenciando arquivos](../file-referencing.md).

## Desabilitando downloads

Caso tenha a impressão de que alguns de seus usuários, ao invés de concluirem a sessão e retornarem à sua aplicação, simplesmente fazem o download dos arquivos
assinados e fecham a aba do navegador, de modo que a sua aplicação não chega a tomar conhecimento dos documentos, você pode desabilitar a função de download dos
arquivos assinados durante a sessão de assinatura especificando `DisableDownloads = true` ao criar a sessão.

Em .NET:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	...
	DisableDownloads = true,
});
return Redirect(response.RedirectUrl);
```

Em PHP:

```php
$request = new CreateSignatureSessionRequest();
$request->returnUrl = "http://localhost:8080/session-callback";
$request->disableDownloads = true;

$response = $service->createSignatureSession($request);

header("Location: {$response->redirectUrl}");
```

Em Java:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
request.setReturnUrl("http://localhost:60695/signature-session-rest-core/complete");
request.setDisableDownloads(true);

CreateSignatureSessionResponse response = restPkiService.createSignatureSession(request);

return "redirect:" + response.getRedirectUrl();
```

Integração direta por API:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"disableDownloads": true
}
```

Nesse caso, os usuários só conseguirão baixar os arquivos assinados na sua aplicação e, portanto, ficarão menos inclinados a interromper o processo prematuramente
fechando a aba do navegador.

:::note
Outra forma de lidar com esse problema é optar pelo **Fluxo com webhook** (veja seção abaixo)
:::


<a name="webhook-flow" />

## Fluxo com webhook

No fluxo padrão descrito acima, a sua aplicação toma conhecimento dos documentos assinados quando o usuário é redirecionado de volta com a *query parameter*
`signatureSessionId` adicionada à URL.

Uma alternativa a esse fluxo é tomar conhecimento dos documentos assinados através de [notificação de evento por webhook](../webhooks.md). Nesse caso, pode-se
abrir a página de assinatura em uma nova aba, a qual é fechada ao final do processo, dispensando a implementação do "tratamento de retorno" (é necessário, entretanto,
implementar o recebimento de notificação de evento).

Esse fluxo tem a vantagem de não depender do retorno do usuário à sua aplicacão para tratar os documentos que são assinados. Além disso, esse fluxo facilita
o uso de [processamento em background](background-processing.md), recurso que melhora significativamente a experiência do usuário.

Para abrir a página de assinatura em outra aba, é preciso utilizar um *anchor* (elemento `<a>`) com `target="_blank"`:

```html
<a href="..." target="_blank">Sign documents</a>
```

:::note
Outra opção é abrir a aba com uma chamada ao `window.open()` em Javascript
:::


Além disso, é preciso omitir o parâmetro `returnUrl` ao criar a sessão.

Em .NET:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	ReturnUrl = null,
	EnableBackgroundProcessing = true,
});
return Redirect(response.RedirectUrl);
```

Veja [exemplo do início do fluxo com webhook em .NET](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/SignatureSessionRestCoreController.cs).

Em PHP:

```php
$request = new CreateSignatureSessionRequest();
$request->returnUrl = null;
$request->enableBackgroundProcessing = true;

$response = $service->createSignatureSession($request);

header("Location: {$response->redirectUrl}");
```

Veja [exemplo do início do fluxo com webhook em PHP](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/signature-session-rest-core/using-webhook.php).

Em Java:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
request.setEnableBackgroundProcessing(true);

CreateSignatureSessionResponse response = restPkiService.createSignatureSession(request);

return "redirect:" + response.getRedirectUrl();
```

Veja [exemplo do início do fluxo com webhook em Java](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/SignatureSessionRestCoreController.java).

Integração direta por API:

```plaintext
POST {endpoint}/api/signature-sessions
{
	"returnUrl": null,
	"enableBackgroundProcessing": true
}
```

Dessa forma, a aba será fechada pelo Rest PKI Core ao final do processo.

## Melhorando a experiência do usuário

Você pode optar por alguns dos recursos abaixo para melhorar a experiência do usuário durante suas sessões de assinatura:

* [Requisitos de certificados](certificate-requirements.md) podem ser usados para restringir os certificados que o usuário poderá escolher
* [Validação de arquivos](file-validation.md)
* [Processamento em background](background-processing.md)
* [Metadados de documentos](document-metadata.md)
