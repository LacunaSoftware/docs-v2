# Background processing - Signature sessions

By default, users are kept waiting while documents are processed before being redirected back to your application. If you want to provide your users with a faster
experience, turn on background processing by passing `EnableBackgroundProcessing = true` upon creation of the session.

On .NET:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	...
	EnableBackgroundProcessing = true,
});
return Redirect(response.RedirectUrl);
```

On PHP:

```php
$request = new CreateSignatureSessionRequest();
$request->enableBackgroundProcessing = true;

$response = $service->createSignatureSession($request);

header("Location: {$response->redirectUrl}");
```

On Java:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
request.setEnableBackgroundProcessing(true);

CreateSignatureSessionResponse response = restPkiService.createSignatureSession(request);

return "redirect:" + response.getRedirectUrl();
```

Direct API integration:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"enableBackgroundProcessing": true
}
```

In this case, users do not wait for documents to be processed. However, your callback implementation must be ready to handle the case of a signature session whose
documents are not yet available for download.

:::note
No changes are needed to your app if you opt for the [Webhook flow](index.md#webhook-flow), since in this case there's no callback handling
:::


## Aditional statuses

In addition to the possible statuses `Completed` and `UserCancelled`, two additional statuses are possible when the user is redirected on your app: `Processing` and `ProcessingError`.

While a session is still `Processing`, some documents will be in status `Processing` and cannot be downloaded. Only when the session transitions to the `Complete`
status are all documents ready to be downloaded.

:::note
The status `ProcessingError` is a rare condition that occurrs only in corner cases such as the user's certificate being revoked during the time between the
start of the session and the completion of the background processing. It is perfectly appropriate for your app to `throw` if this status is returned.
:::


## Adapting callback

Let's change our callback implementation to deal with this.

On .NET:

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

On PHP:

```php
$sessionId = $_GET['signatureSessionId'];

$session = $session->getSignatureSession($sessionId);
if ($session->status != SignatureSessionStatus::COMPLETED && $session->status != SignatureSessionStatus::PROCESSING) {
	header("Location: http://localhost:8000/");
}
```

On Java:

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

Notice that now we also consider the status `Processing` to be normal. Now, let's change the view:

On .NET, the Razor view would be:

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

On PHP, the client side view would be:

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

On Java, the Thymeleaf view would be:

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

Notice how we render each list item differently based on each document's status.
