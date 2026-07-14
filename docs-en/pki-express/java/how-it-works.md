# Signature sample explained - PKI Express on Java

This article explains how the digital signature process performed in the PKI Express Java Samples project works.

## Main code files

* Controller [PadesSignatureExpressController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)
* View [pades-signature-express/index](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-signature-express/index.html)
* JavaScript Module [signature-start-form](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)
* View [pades-signature-express/start](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-signature-express/start.html)
* JavaScript Module [signature-complete-form](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-complete-form.js)
* View [pades-signature-express/signature-info](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-signature-express/signature-info.html)

## Subscription process

### 1. User goes to the signature page

At this time, the user visits the URL `/pades-signature-express` (`GET`). The controller `PadesSignatureExpressController` is responsible for responding to the request, more specifically in
the `get()`:

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

At this time, we just render the signature page with the variable `state` set to `initial`. This variable is used to signal where the signing process is.

```java
// Render the signature page (templates/pades-signature.html)
model.addAttribute("state", state);
model.addAttribute("fileToSign", fileToSign);
model.addAttribute("userfile", userfile);
return "pades-signature";
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

:::note
The variables `fileToSign`and `userfile` are merely details of the example.
:::


The rendered page is the view `pades-signature-express`. At the end of loading this, we passed references to the page elements for the JavaScript module `signatureStartForm`:

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

The module `signatureStartForm` blocks the screen and triggers Web PKI initialization, passing the function `loadCertificates()` as callback when the initialization has completed:

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

In the function `loadCertificates()`, we trigger the loading of the certificates available on the user's computer, populating the element `<select>` from the page:

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

### 2. Users click the **Sign File** button

Previously, the JavaScript module `signatureStartForm` registered JavaScript function `startSignature()` to be called when the **Sign File** button is clicked:

```js
// Wireup of button clicks.
formElements.signButton.click(startSignature);
formElements.refreshButton.click(refresh);
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

:::note
Note that it is critical that the button on the page has `type="button"`, and don't `type="submit"`, otherwise a postback would occur immediately upon clicking the button.
:::


Therefore, when the user clicks the **Sign File** button, the `startSignature()` function of `signatureStartForm` is invoked:

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

In this function, after blocking the page, we get the thumbprint of the selected certificate and place it in one of the hidden fields of the page (this value will be necessary at another time
in the subscription process):

```js
// Get the thumbprint of the selected certificate.
var selectedCertThumbprint = formElements.certificateSelect.val();
formElements.certThumbField.val(selectedCertThumbprint);
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

We then invoke the function `readCertificates()` of the PKI Web to obtain the encoding of the chosen certificate (public part of the certificate, the ".cer", without the private key):

```js
// Get certificate content to be passed to "start" step of the signature.
pki.readCertificate(selectedCertThumbprint).success(// ...
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-start-form.js)

Once the certificate is read, we fill in a hidden field of the page with the result and do the postback:

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

### 3. Signing backend start

In the backend, the controller `PadesSignatureExpressController` is again invoked to handle the postback made from the frontend with the certificate chosen to perform the signature, done for the URL `pades-signature-express/start` with a verb `POST`. The method `postStart()` is responsible for handling the request:

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

At this point, we start the signature using the class `PadesSignatureStarter` passing the file to be signed and the encoding of the certificate chosen for signature:

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

Opcionally, we configure the signature appearance:

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
For more details on configuration options for the appearance of the subscription, see the class [PadesVisualElements](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/util/express/PadesVisualElements.java)
:::


Finally, we conclude the initial step, obtaining the necessary data to perform the digital signature algorithm:

```java
// Start the signature process. Receive as response a SignatureStartResult instance containing the
// following fields:
// - toSignHash: The hash to be signed.
// - digestAlgorithm: The digest algorithm that will inform the Web PKI component to compute the signature.
// - transferFile: A temporary file to be passed to "complete" step.
SignatureStartResult result = signatureStarter.start();
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

An important point: the class `PadesSignatureStarter` saves a file called transfer data file containing information that needs to be retrieved later in the subscription process. By default,
this file is stored in the system temporary folder, but another folder can be configured. The method `PadesSignatureStarter.getTransferFile()` returns the filename of the file, which is
populated in a hidden field on the page:

```java
model.addAttribute("transferFile", result.getTransferFile());
```
[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

:::note
Security concerns are taken in generating the name of this file, so it is impossible for a user to guess the transfer data file from another user's signing process. Also, only the
:::

filename is sent to the page, not the full path, so it is also not possible for a user to induce the web application to read a file in an arbitrary folder.

After a bit of housekeeping, we rendered the view again `pades-signature-express/start`:

```java
return "pades-signature-express/start";
```
[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

### 4. Realization of the digital signature algorithm in the frontend

Once the page is loaded again, the `init()` function of the `signatureCompleteForm ` is invoked. We then blocked the page and invoked the Web PKI initialization, but this time passing the function `sign()` as callback:

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

In the function `sign()`, we invoke the Web PKI to perform the digital signature algorithm with the private key of the certificate, using as input data the data returned by PKI Express in the backend:

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

Once the signature algorithm is finished, we fill in the result in a hidden field in the page and make a new post back for the backend:

```js
/* ... */.success(function (signature) {
	// Fill the "signature" field, needed on server-side to complete the signature.
	formElements.signatureField.val(signature);
	// Submit the form.
	formElements.form.submit();
});
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-complete-form.js)

### 5. Signature termination on backend

In the backend, the controller `PadesSignatureExpressController` is again invoked to handle the postback made from the frontend with  the result of the digital signature algorithm, done for the URL `pades-signature-express/complete` with a verb `POST`. The method `postComplete()` is responsible for handling the request:

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

We get an instance of the `SignatureFinisher` class and provide the file being signed, the filename of the transfer file data and the result of the signature algorithm done in the frontend with the Web PKI:

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

We generate a random filename to receive the signed PDF:

```java
// Generate path for output file and add to signature finisher.
String filename = UUID.randomUUID() + ".pdf";
signatureFinisher.setOutputFilePath(Application.getTempFolderPath().resolve(filename));
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

We have completed the signing process:

```java
// Complete the signature process.
signatureFinisher.complete();
```

[view on source](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureExpressController.java)

After this command, the signed file is saved in the randomly generated filename above. It is then at the discretion of your application to move this file to the correct location, be it database, file system or storage service.
