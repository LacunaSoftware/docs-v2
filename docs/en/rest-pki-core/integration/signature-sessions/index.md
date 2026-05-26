# Signature sessions - Rest PKI Core

**Signature sessions** are a [Rest PKI Core](../../index.md) feature which enable your users to perform digital signatures without requiring you to implement a signature
web page on your app.

To create a signature session, your app specifies a `returnUrl` and receives back a `redirectUrl`. Your app then redirects the user to the `redirectUrl`, where he will 
digitally sign documents:

![Signature session start](/images/rest-pki/signature-session-start.png)

Once the process is complete, the user will be redirected back to your app on the *returnUrl* you specified when starting the session. A query parameter will be added
to the `returnUrl` containing the signature session ID (`?signatureSessionId=...`). Then, your app parses the signature session ID on the query string and uses it to
call APIs to fetch the documents signed by the user:

![Signature session end](/images/rest-pki/signature-session-end.png)

## Creating a signature session

:::tip
From this point on we'll describe calls to Rest PKI Core. Make sure you've read the [Get Started](../get-started.md) article to be able to keep up.
:::


On .NET, call `IRestPkiService.CreateSignatureSessionAsync()` and use the `RedirectUrl` returned to redirect your user:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	ReturnUrl = "http://localhost:8080/SessionCallback",
});
return Redirect(response.RedirectUrl);
```

See [session creation sample in .NET](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/SignatureSessionRestCoreController.cs).

On PHP, call `RestPkiServiceInterface.createSignatureSession()` and use the `$redirectUrl` returned to redirect your user:

```php
$request = new CreateSignatureSessionRequest();
$request->returnUrl = "http://localhost:8080/SessionCallback";

$response = $service->createSignatureSession($request);

header("Location: {$response->redirectUrl}");
```

See [session creation sample in PHP](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/signature-session-rest-core/index.php).

On Java, call `RestPkiService.CreateSignatureSession()` and use the `RedirectUrl` returned to redirect your user:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
request.setReturnUrl("http://localhost:60695/signature-session-rest-core/complete");

CreateSignatureSessionResponse response = restPkiService.CreateSignatureSession(request);

return "redirect:" + response.getRedirectUrl();
```

See [session creation sample in Java](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/SignatureSessionRestCoreController.java).

If calling the API directly, do:

```plaintext
POST {endpoint}/api/signature-sessions
{
	"returnUrl": "http://localhost:8080/SessionCallback"
}
```

Let's drill down on the `returnUrl` used on the code snippets above:

```plaintext
http://localhost:8080/SessionCallback
^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^
Your app's URL        Route to the callback handler
```

When adapting to your case, you must change the first portion to your own application's address and also to the route of your own "callback handler" (see next section).

## Implementing the callback handler

The `returnUrl` is the location to which Rest PKI Core will redirect the user back upon completion of the session.

:::note
So far, we've used `/SessionCallback` as the relative URL of the callback handler, but feel free to use whatever makes sense for your app
:::


On .NET, the implementation would look like this:

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

See [callback handler sample in .NET](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/SignatureSessionRestCoreController.cs).

On PHP, the implementation would look like this:

```php
$sessionId = $_GET['signatureSessionId'];

$session = $session->getSignatureSession($sessionId);
if ($session->status != SignatureSessionStatus::COMPLETED) {
	header("Location: http://localhost:8000/");
}
```

See [callback handler sample in PHP](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/signature-session-rest-core/complete.php).

On Java, the implementation would look like this:

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

See [callback handler sample in Java](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/SignatureSessionRestCoreController.java).

Notice that check the `Status` of the session and send the user away to some default location if the status is not `Completed`.

:::note
When a user is redirected back to your app, the session will have one of two possible statuses: `Completed` or `UserCancelled`. You should always check the
status, since it is perfecly normal for a user to land back on your app by cancelling the session instead of going through the procedure.
:::


Now, the Razor view:

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

On PHP, the client side view:

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

On Java, the Thymeleaf view:

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

## Predefining documents

The sessions created so far require the user to upload the documents that will be signed. You can instead specify the documents that will be signed
when creating the session. In this case, the user will not be able to upload additional documents to the session.

On .NET:

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

On Java:

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

Direct API integration:

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

For more information see [Referencing files](../file-referencing.md).

## Disabling downloads

If you don't receive webhook notifications of documents signed, you might feel like the signature session process is not working reliably because some users simply
download the signed documents and don't bother to stick around while they are redirected back to your app, denying it the chance to detect that documents have been
signed. If you feel this is a problem for your case, you can disable the downloading of signed documents by passing `DisableDownloads = true`.

On .NET:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	...
	DisableDownloads = true,
});
return Redirect(response.RedirectUrl);
```

On PHP:

```php
$request = new CreateSignatureSessionRequest();
$request->returnUrl = "http://localhost:8080/session-callback";
$request->disableDownloads = true;

$response = $service->createSignatureSession($request);

header("Location: {$response->redirectUrl}");
```

On Java:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
request.setReturnUrl("http://localhost:60695/signature-session-rest-core/complete");
request.setDisableDownloads(true);

CreateSignatureSessionResponse response = restPkiService.createSignatureSession(request);

return "redirect:" + response.getRedirectUrl();
```

Direct API integration:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"disableDownloads": true
}
```

Then, users will only be able to download documents through your app, and thus will be less inclined to quit the process prematurely.

:::note
Another way of dealing with this issue is to opt for the **Webhook flow** instead (see next section)
:::


<a name="webhook-flow" />

## Webhook flow

On the standard integration flow described above, your app detects that documents have been signed when the user is redirect back with the `signatureSessionId`
query parameter appended to the `returnUrl`.

An alternative flow is to instead be notified of signed documents through [webhook notifications](../webhooks.md). In this case, the signature page can be instead
opened on a new tab, which is closed by the end of the process. Hence, the user is never redirected back, and there is no need to implement the callback handler
(instead, you'll implement the webhook handler).

This flow has the advantage of not requiring the user to stick around while they are redirected by to your app for it to take notice of signed files. Also,
enabling [background processing](background-processing.md), which greatly enhances the user's experience, is simpler in this flow.

To open the signature page on a new tab, use an anchor (`<a>` element) with `target="_blank"`:

```html
<a href="..." target="_blank">Sign documents</a>
```

:::note
Another option is to open the tab with the `window.open()` function in Javascript
:::


Furthermore, you must omit the `returnUrl` parameter when creating the session.

On .NET:

```cs
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	ReturnUrl = null,
	EnableBackgroundProcessing = true,
});
return Redirect(response.RedirectUrl);
```

See [session creation sample with webhook in .NET](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/SignatureSessionRestCoreController.cs).

On PHP:

```php
$request = new CreateSignatureSessionRequest();
$request->returnUrl = null;
$request->enableBackgroundProcessing = true;

$response = $service->createSignatureSession($request);

header("Location: {$response->redirectUrl}");
```

See [session creation sample with webhook in PHP](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/signature-session-rest-core/using-webhook.php).

On Java:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
request.setEnableBackgroundProcessing(true);

CreateSignatureSessionResponse response = restPkiService.createSignatureSession(request);

return "redirect:" + response.getRedirectUrl();
```

See [session creation sample with webhook in Java](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/SignatureSessionRestCoreController.java).

Direct API integration:

```plaintext
POST {endpoint}/api/signature-sessions
{
	"returnUrl": null,
	"enableBackgroundProcessing": true
}
```

Then, the tab will be closed by Rest PKI Core by the end of the session.

## Improving the user experience

You may use the following optional features to improve the user experience:

* [Certificate requirements](certificate-requirements.md) may be used to restrict the certificates the user can choose
* [File validation](file-validation.md)
* [Background processing](background-processing.md)
* [Document metadata](document-metadata.md)
