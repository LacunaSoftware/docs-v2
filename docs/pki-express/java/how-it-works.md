# Como funciona a assinatura com PKI Express em Java

Este artigo explica como funciona o processo de assinatura digital realizado no projeto de exemplos do [PKI Express](../index.md) em Java.

## Principais arquivos de código

* Controller [PadesSignatureExpressController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)
* View [pades-signature-express/index](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-signature-express/index.html)
* Módulo de JavaScript [signature-start-form](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)
* View [pades-signature-express/start](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-signature-express/start.html)
* Módulo de JavaScript [signature-complete-form](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-complete-form.js)
* View [pades-signature-express/signature-info](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-signature-express/signature-info.html)

## Processo de assinatura

### 1. Usuário vai para a página de assinatura

Nesse momento, o usuário visita a URL `/pades-signature-express` (`GET`). O controller `PadesSignatureExpressController` é o responsável por atender à requisição, mais especificamente no método `get()`:

```java
@RequestMapping("/pades-signature-express")
public class PadesSignatureExpressController {

    /**
     * This action simply renders the page.
     */
    @GetMapping
    public String get(/* ... */) throws IOException {
        // ...
}
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

Nesse momento, apenas renderizamos a página de assinatura com a variável `state` setada para `initial`. Essa variável é utilizada para sinalizar em qual ponto o processo
de assinatura se encontra.

```java
// Render the signature page (templates/pades-signature.html)
model.addAttribute("state", state);
model.addAttribute("fileToSign", fileToSign);
model.addAttribute("userfile", userfile);
return "pades-signature";
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

:::note
As variáveis `fileToSign` e `userfile` são meramente detalhes do exemplo.
:::


A página renderizada é a view `pades-signature-express`. Ao final do carregamento desta, passamos referências aos elementos da página para o módulo de JavaScript `signatureStartForm`:

```js
$(document).ready(function () {
    // Once the page is ready, we call the init() function on the javascript code (see signature-form.js)
    signatureForm.init({
        form: $('#signForm'),
        certificateSelect: $('#certificateSelect'),
        refreshButton: $('#refreshButton'),
        signButton: $('#signButton'),
        stateField: $('#stateField'),
        certThumbField: $('#certThumbField'),
        certContentField: $('#certContentField'),
        toSignHashField: $('#toSignHashField'),
        digestAlgorithmField: $('#digestAlgorithmField'),
        signatureField: $('#signatureField')
    });
});
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

O módulo `signatureStartForm` bloqueia a tela e dispara a inicialização do Web PKI, passando a função `loadCertificates()` como callback para quando a inicialização
tiver sido concluída:

```js
// ----------------------------------------------------------------------------------------------
// Initializes the signature form.
// ----------------------------------------------------------------------------------------------
function init(fe) {

    // Receive form parameters received as arguments.
    formElements = fe;

    // Wireup of buttons clicks.
    formElements.signButton.click(startSignature);
    formElements.refreshButton.click(refresh);

    // Block the UI while we get things ready.
    $.blockUI({ message: 'Initializing ...' });

    // Call the init() method on the LacunaWebPKI object, passing a callback for when the
    // component is ready to be used and another to be called when an error occurs on any of the
    // subsequent operations. For more information, see:
    // https://docs.lacunasoftware.com/en-us/articles/web-pki/get-started.html#coding-the-first-lines
    // https://webpki.lacunasoftware.com/Help/classes/LacunaWebPKI.html#method_init
    pki.init({
        ready: loadCertificates,    // As soon as the component is ready we'll load the certificates.
        defaultError: onWebPkiError // Generic error callback (see function declaration below).
    });
}
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

Na função `loadCertificates()`, disparamos o carregamento dos certificados disponíveis no computador do usuário, populando o elemento `<select>` da página:

```js
// -------------------------------------------------------------------------------------------------
// Function that loads the certificates, either on startup or when the user clicks the "Refresh"
// button. At this point, the UI is already blocked.
// -------------------------------------------------------------------------------------------------
function loadCertificates() {

    // Call the listCertificates() method to list the user's certificates.
    pki.listCertificates({

        // Specify that expired certificates should be ignored.
        filter: pki.filters.isWithinValidity,

        // In order to list only certificates within validity period and having a CPF (ICP-Brasil),
        // use this instead:
        //filter: pki.filters.all(pki.filters.hasPkiBrazilCpf, pki.filters.isWithinValidity),

        // Id of the select to be populated with the certificates.
        selectId: formElements.certificateSelect.attr('id'),

        // Function that will be called to get the text that should be displayed for each option.
        selectOptionFormatter: function (cert) {
            return cert.subjectName + ' (issued by ' + cert.issuerName + ')';
        }

    }).success(function () {

        // Once the certificates have been listed, unblock the UI.
        $.unblockUI();
    });

}
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

### 2. Usuário clica no botão **Sign File**

Anteriormente, o módulo de JavaScript `signatureStartForm` registrou a função de JavaScript `startSignature()` para ser chamada quando o botão **Sign File** é clicado:

```js
// Wireup of button clicks.
formElements.signButton.click(startSignature);
formElements.refreshButton.click(refresh);
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

:::note
Note que é fundamental que o botão na página tenha `type="button"`, e não `type="submit"`, caso contrário ocorreria um *postback* imediatamente ao clicar no botão.
:::


Portanto, quando o usuário clica no botão **Sign File**, a função `startSignature()` do `signatureStartForm` é invocada:

```js
// ----------------------------------------------------------------------------------------------
// Function called when the user clicks the "Sign File" button.
// ----------------------------------------------------------------------------------------------
function startSignature() {

    // Block the UI while we perform the signature.
    $.blockUI({ message: 'Starting signature ...' });

    // Get the thumbprint of the selected certificate.
    var selectedCertThumbprint = formElements.certificateSelect.val();

    // Get certificate content to be passed to "start" action after the form submission.
    pki.readCertificate(selectedCertThumbprint).success(/* ... */);
}
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

Nessa função, após bloquear a página, obtemos o *thumbprint* do certificado selecionado e colocamos em um dos campos ocultos da página (esse valor será necessário em outro momento do processo
de assinatura):

```js
// Get the thumbprint of the selected certificate.
var selectedCertThumbprint = formElements.certificateSelect.val();
formElements.certThumbField.val(selectedCertThumbprint);
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

Invocamos então a função `readCertificate()` do Web PKI para obter a codificação do certificado escolhido (parte pública do certificado, o ".cer", sem a chave privada):

```js
// Get certificate content to be passed to "start" step of the signature.
pki.readCertificate(selectedCertThumbprint).success(// ...
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

Uma vez lido o certificado, preenchemos um campo oculto da página com o resultado e fazemos o *postback*:

```js
/* ... */.success(function (certEncoded) {
	// Fill fields needed on the next steps of the signature.
	formElements.certThumbField.val(selectedCertThumbprint);
	formElements.certContentField.val(certEncoded);
	// Submit the form.
	formElements.form.submit();
});
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

### 3. Início da assinatura no *backend*

No backend, o controller `PadesSignatureExpressController` novamente é invocado para tratar o postback feito a partir do frontend com o certificado escolhido para realizar a assinatura, feito para a URL `pades-signature-express/start` com verbo `POST`. O método `postStart()` é responsável por tratar a requisição:

```java
/**
* POST /pades-signature-express/start?
*
* This action receives the form submission from the signature page. It will 
* perform a PAdES signature in three steps using PKI Express and Web PKI.
*/
@PostMapping("/start")
public String postStart(/* ... */) throws IOException {
	// ...
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

Nesse ponto, iniciamos a assinatura usando a classe `PadesSignatureStarter` passando o arquivo a ser assinado e a codificação do certificado escolhido para assinatura:

```java
// Get an instance of the PadesSignatureStarter class, responsible for receiving the signature elements
// and start the signature process.
PadesSignatureStarter signatureStarter = new PadesSignatureStarter(Util.getPkiExpressConfig());

// Set PKI default options (see Util.java)
Util.setPkiDefaults(signatureStarter);

// Set PDF to be signed.
signatureStarter.setPdfToSign(fileToSign);

// Set Base64-encoded certificate's content to signature starter.
signatureStarter.setCertificateBase64(certContent);
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

Opcionalmente, configuramos a aparência da assinatura:

```java
// Set a file reference for the stamp file. Note that this file can be referenced later by
// "fref://stamp" at the "url" field on the visual representation (see content/vr.json file or
// getVisualRepresentation(case) method).
signatureStarter.addFileReference("stamp", Util.getPdfStampPath());

// Set visual representation. We provide a Java class that represents the visual representation
// model.
signatureStarter.setVisualRepresentation(PadesVisualElements.getVisualRepresentation(1));
// Alternatively, we can provide a javascript file that represents json-encoded the model
// (see resources/static/vr.json).
//signatureStarter.setVisualRepresentationFromFile(Util.getVisualRepresentationPath());
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

:::note
Para mais detalhes sobre as opções de configuração da aparência da assinatura, veja a classe
[PadesVisualElements](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/util/express/PadesVisualElements.java)
:::


Por fim, concluímos a etapa inicial, obtendo os dados necessários para realizar o algoritmo de assinatura digital:

```java
// Start the signature process. Receive as response a SignatureStartResult instance containing the
// following fields:
// - toSignHash: The hash to be signed.
// - digestAlgorithm: The digest algorithm that will inform the Web PKI component to compute the signature.
// - transferFile: A temporary file to be passed to "complete" step.
SignatureStartResult result = signatureStarter.start();
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

Um ponto importante: a classe `PadesSignatureStarter` salva um arquivo chamado *transfer data file* contendo informações que precisam ser recuperadas
mais à frente no processo de assinatura. Por padrão, esse arquivo é armazenado na pasta temporária do sistema, porém outra pasta pode ser configurada.
O método `PadesSignatureStarter.getTransferFile()` retorna o *filename* do arquivo, o qual é preenchido em um campo oculto na página:

```java
model.addAttribute("transferFile", result.getTransferFile());
```
[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

:::note
Preocupações de segurança são tomadas na geração do nome desse arquivo, de modo que é impossível um usuário adivinhar o *transfer data file* de um
processo de assinatura de outro usuário. Além disso, apenas o *filename* é enviado para a página, não o path completo, de modo que também não é
possível a um usuário induzir a aplicação web a ler um arquivo em uma pasta arbitrária
:::


Após um pouco de *housekeeping*, renderizamos novamente a view `pades-signature-express/start`:

```java
return "pades-signature-express/start";
```
[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

### 4. Realização do algoritmo de assinatura digital no *frontend*

Uma vez carregada a página, a função `init()` do `signatureCompleteForm ` é invocada. Bloqueamos então
a página e invocamos novamente a inicialização do Web PKI, porém dessa vez passando a função `sign()` como callback:

```js
// ----------------------------------------------------------------------------------------------
// Initializes the signature form.
// ----------------------------------------------------------------------------------------------
function init(fe) {

    // Receive form parameters received as arguments.
    formElements = fe;

    // Block the UI while we get things ready.
    $.blockUI({ message: 'Signing ...' });

    // Call the init() method on the LacunaWebPKI object, passing a callback for when the
    // component is ready to be used and another to be called when an error occurs on any of the
    // subsequent operations. For more information, see:
    // https://docs.lacunasoftware.com/en-us/articles/web-pki/get-started.html#coding-the-first-lines
    // https://webpki.lacunasoftware.com/Help/classes/LacunaWebPKI.html#method_init
    pki.init({
        ready: sign,                 // As soon as the component is ready we'll perform the signature.
        defaultError: onWebPkiError  // Generic error callback defined below.
    });
}
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-complete-form.js)

Na função `sign()`, invocamos o Web PKI para realizar o algoritmo de assinatura digital com a chave privada do certificado, usando como dados de entrada os dados retornados pelo PKI Express no backend:

```js
// ----------------------------------------------------------------------------------------------
// Function that performs the signature on startup. At this point, the UI is already blocked.
// ----------------------------------------------------------------------------------------------
function sign() {

    // Call signHash() on the Web PKI component passing the "toSignHash", the digest algorithm
    // and the certificate selected by the user.
    pki.signHash({
        thumbprint: formElements.certThumbField.val(),
        hash: formElements.toSignHashField.val(),
        digestAlgorithm: formElements.digestAlgorithmField.val()
    }).success(function (signature) {

        // Fill the "signature" field, needed on server-side to complete the signature.
        formElements.signatureField.val(signature);

        // Submit the form.
        formElements.form.submit();
    });
}
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-complete-form.js)

Uma vez finalizado o algoritmo de assinatura, preenchemos o resultado em um campo oculto na página e fazemos um novo *postback* para o backend:

```js
/* ... */.success(function (signature) {
	// Fill the "signature" field, needed on server-side to complete the signature.
	formElements.signatureField.val(signature);
	// Submit the form.
	formElements.form.submit();
});
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-complete-form.js)

### 5. Finalização da assinatura no *backend*

No backend, o controller `PadesSignatureExpressController` novamente é invocado para tratar o postback feito a partir do frontend com o resultado do algoritmo de assinatura digital, feito para a URL `pades-signature-express/complete` com verbo `POST`. O método `postComplete()` é responsável por tratar a requisição:

```java
/**
* POST /pades-signature-express/complete?
*
* This action receives the form submission from the signature page. It will
* perform a PAdES signature in three steps using PKI Express and Web PKI.
*/
@PostMapping("/complete")
public String postComplete(/* ... */) throws IOException {
	// ...
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

Obtemos uma instância da classe `SignatureFinisher` e fornecemos o arquivo sendo assinado, o *filename* do arquivo de *transfer data* e o resultado do algoritmo de assinatura feito no frontend com o Web PKI:

```java
// Get an instance of the SignatureFinisher class, responsible for completing the signature process.
SignatureFinisher signatureFinisher = new SignatureFinisher(Util.getPkiExpressConfig());

// Set PKI default options (see Util.java)
Util.setPkiDefaults(signatureFinisher);

// Set PDF to be signed. It's the same file we used on "start" step.
signatureFinisher.setFileToSign(fileToSign);

// Set transfer file.
signatureFinisher.setTransferFilePath(transferFile);

// Set the signature value.
signatureFinisher.setSignature(signature);
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

Geramos um *filename* aleatório para receber o PDF assinado:

```java
// Generate path for output file and add to signature finisher.
String filename = UUID.randomUUID() + ".pdf";
signatureFinisher.setOutputFilePath(Application.getTempFolderPath().resolve(filename));
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

Finalizamos o processo de assinatura:

```java
// Complete the signature process.
signatureFinisher.complete();
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

Após esse comando, o arquivo assinado encontra-se salvo no *filename* gerado aleatóriamente acima. Fica, então, a critério da sua aplicação mover esse arquivo para o local correto, seja em banco de dados, sistema de arquivos ou serviço de storage.
