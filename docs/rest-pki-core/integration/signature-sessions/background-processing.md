# Processamento em background - Sessões de assinatura

Por padrão, o Rest PKI Core fará com que o usuário aguarde que os documentos sejam processados antes de enviá-lo de volta à sua aplicação. Se você quiser oferecer
uma experiência mais ágil para seus usuários, habilite o processamento em background especificando `EnableBackgroundProcessing = true` na criação da sessão.

Em .NET:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	...
	EnableBackgroundProcessing = true,
});
return Redirect(response.RedirectUrl);
```

Em PHP:

```php
$request = new CreateSignatureSessionRequest();
$request->enableBackgroundProcessing = true;

$response = $service->createSignatureSession($request);

header("Location: {$response->redirectUrl}");
```

Em Java:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
request.setEnableBackgroundProcessing(true);

CreateSignatureSessionResponse response = restPkiService.createSignatureSession(request);

return "redirect:" + response.getRedirectUrl();
```

Integração direta por API:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"enableBackgroundProcessing": true
}
```

Nesse caso, o usuário será redirecionado de volta à sua aplicação assim que concluir as assinaturas, sem aguardar o processamento, Entretanto, o seu tratemento de
retorno precisa ser adequado para lidar com o caso de uma sessão de assinatura cujos documentos ainda não estão prontos para download.

:::note
Nenhuma adequação é necessária no caso do [Fluxo com webhook](index.md#webhook-flow), pois nesse caso não há tratamento de retorno
:::


## Estados adicionais

Além dos estados `Completed` e `UserCancelled`, a sessão pode estar em dois outros estados quando o usuário chega de volta à sua aplicação: `Processing` e
`ProcessingError`.

Enquanto uma sessão estiver em `Processing`, alguns documentos estarão com estado `Processing` e não estarão disponíveis para download. Apenas quando a sessão
mudar de estado para `Completed` é que todos os documentos estarão prontos para download.

:::note
O estado `ProcessingError` é uma condição rara que ocorre apenas caso o certificado do usuário seja revogado na janela de tempo entre o início da sessão
e a conclusão do processamento. É perfeitamente apropriado que a sua aplicação ignore essa condição ou apenas lance uma exceção caso isso ocorra.
:::


## Adaptando o tratamento de retorno

Vamos adaptar nosso tratamento de retorno para lidar com essas mudanças.

Em .NET:

```cs
public class SessionCallbackController : Controller {
	...	
	public async Task<IActionResult> Index(Guid signatureSessionId) {
		var session = await restPkiService.GetSignatureSessionAsync(signatureSessionId.Value);
		if (session.Status != SessionStatus.Completed && session.Status != SessionStatus.Processing) {
			return Redirect("/");
		}
		return View(session);
	}
}
```

Em PHP:

```php
$sessionId = $_GET['signatureSessionId'];

$session = $session->getSignatureSession($sessionId);
if ($session->status != SignatureSessionStatus::COMPLETED && $session->status != SignatureSessionStatus::PROCESSING) {
	header("Location: http://localhost:8000/");
}
```

Em Java:

```java
@Controller
public class SessionCallbackController {
	...
	public String index(
		Model model, 
		@RequestParam(value="signatureSessionId") String sessionId
	) throws RestException {
		SignatureSession session = restPkiService.getSignatureSession(UUID.fromString(sessionId));
		if (session.getStatus() != SignatureSessionStatus.Completed &&
			session.getStatus() != SignatureSessionStatus.Processing){
			return "redirect:/";
		}
		model.addAttribute("session", session);
		return "signature-callback/index";
	}
}
```

Note que agora também consideramos o estado `Processing` como normal. Com isso, podemos alterar a forma que os documentos serão mostrados.

Em .NET, alteraríamos a view de Razor da seguinte maneira:

```html
@using Lacuna.RestPki.Api
@using Lacuna.RestPki.Client
@model SignatureSession
<h2>Signed documents</h2>
<ul>
	@foreach (var document in Model.Documents)
	{
		<li>
			@if (document.Status == DocumentStatus.Completed)
			{
				<a href="@document.SignedFile.Location">@document.SignedFile.Name</a>
			}
			else
			{
				@document.OriginalFile.Name
				<text> (processing)</text>
			}
		</li>
	}
</ul>
```

Em PHP, alteraríamos o lado do cliente da seguinte maneira: 

```php
<h2>Signed documents</h2>
<ul>
	<?php for ($i = 0; $i < count($session->documents); $i++) { 
		$document = $session->documents[$i]; ?>

		<li>
			<?php if ($document->status == SignatureSessionStatus::COMPLETED) { ?>
				<a href="<?= $document->signedFile->location ?>"><?= $document->signedFile->name ?></a>
			<?php } else { ?>
				<?= $document->originalFile->name ?>
				<text> (processing)</text>
			<?php } ?>
		</li>
	<?php } ?>
</ul>
```

Em Java, alteraríamos a view Thymeleaf do Spring da seguinte maneira: 

```html
<h2>Signed documents</h2>
<ul th:each="document : ${session.getDocuments()}">
	<li>
		<div th:if="${document.getStatus() == T(com.lacunasoftware.restpki.SignatureSessionStatus).Completed}" 
			<a th:href="${document.getSignedFile().getLocation()">
				<span th:text="${document.getSignedFile().getName()}"/>
			</a>
		</div>
		<div th:if="${document.getStatus() != T(com.lacunasoftware.restpki.SignatureSessionStatus).Completed}" 
			<span th:text="${document.getOriginalFile().getName()}"/> (processing)
		</div>
	</li>
</ul>
```

Note que renderizamos cada item da lista de maneira diferente baseado no estado do documento.
