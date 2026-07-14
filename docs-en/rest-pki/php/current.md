# PHP 5.5+ samples project

The **PHP 5.5+ samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a project using **PHP 5.5+** (including 7.x). It is hosted on GitHub at:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/php/plain

:::note
For projects targeting earlier PHP versions, [click here](index.md).
:::


## Running the project

1. [Download the project](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) or clone the [repository](https://github.com/LacunaSoftware/PkiSuiteSamples.git)
1. In a command prompt, navigate to the folder `php/plain` and run `composer install` to download the dependencies (if you don't have Composer installed, get it [here](https://getcomposer.org/))
1. Still on the `php/plain` folder, run `composer start` to launch PHP's built-in web server
1. Open http://localhost:8000 on the browser

## Project map

This section lists where to find the relevant parts in each feature sample on the project.

### Authentication with digital certificate {#auth}

* [authentication-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/authentication-rest/index.php)
  * JavaScript: [authentication-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/authentication-form.js)
* [authentication-rest/complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/authentication-rest/complete.php)

### PAdES signature with file already on server {#pades}

* [pades-signature-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-rest/index.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-form.js)
* [pades-signature-rest/complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-rest/complete.php)

### PAdES signature with file uploaded by user {#pades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on
[upload.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/upload.php)))
is done the control flow is the same as in the sample [PAdES signature with file already on server](#pades), but with the URL parameter `userfile` filled.

### PAdES co-signature {#pades-cosign}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `userfile` filled.

### PAdES marks {#pdf-marks}

This feature is demonstrated as an optional configuration on the [PAdES signature with file already on server](#pades)
sample which by default starts commented out. To enable it, uncomment the following line on
[pades-signature-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-rest/index.php):

```php
array_push($signatureStarter->pdfMarks, getPdfMark(1));
```

:::tip
Try changing the argument to the `getPdfMark()` function to see different PDF mark configurations
:::


The relevant code is on the file [PadesVisualElementsRest.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/PadesVisualElementsRest.php), function `getPdfMark()`.

### PAdES signature using server key {#pades-server}

 * [pades-signature-server-key.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/standard/pades-signature-server-key.php)

### PAdES signature without client communication {#pades-wo-client}

Not yet available on this project.

### Open/validate an existing PAdES signature {#open-pades}

* [open-pades-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/open-pades-rest/index.php)

### Printer-friendly version {#print}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed and the link *Download a printer-friendly version of the signed file* is clicked,
the flow goes to the file
[printer-friendly-pades-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/printer-friendly-pades-rest/index.php)
with the URL parameter `file` filled.

The generated PDF contains links to the file [check.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/check.php), which shows details of the signatures.

### CAdES signature with file already on server {#cades}

* [cades-signature-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-rest/index.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-form.js)
* [cades-signature-rest/complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-rest/complete.php)

### CAdES signature with file uploaded by user {#cades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on
[upload.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/upload.php)))
is done the control flow is the same as in the sample [CAdES signature with file already on server](#cades), but with the URL parameter `userfile` filled.

### CAdES co-signature {#cades-cosign}

After the control flow of the sample [CAdES signature with file already on server](#cades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `cmsfile` filled.

### CAdES signature using server key {#cades-server}

* [cades-signature-server-key.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/standard/cades-signature-server-key.php)

### Open/validate an existing CAdES signature {#open-cades}

* [open-cades-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/open-cades-rest/index.php)

### XML signature of the entire document {#xml-full}

* [xml-signature-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/xml-signature-rest/index.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-form.js)
* [xml-signature-rest/complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/xml-signature-rest/complete.php)

### XML signature of an element {#xml-element}

* [xml-nfe-signature-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/xml-nfe-signature-rest/index.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-form.js)
* [xml-nfe-signature-rest/complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/xml-nfe-signature-rest/complete.php)

### XAdES signature of an element {#xades-element}

Not yet available on this project.

### Open/validate signatures on an existing XML file {#open-xml}

* [open-xml-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/open-xml-rest/index.php)

### Batch of PAdES signatures {#batch}

* [batch-pades-signature-rest/index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/batch-pades-signature-rest/index.php)
  * JavaScript: [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/batch-signature-rest-form.js)
  * AJAX handlers: [batch-pades-signature-rest/start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/batch-pades-signature-rest/start.php)
    and [batch-pades-signature-rest/complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/batch-pades-signature-rest/complete.php)

### Optimized batch of PAdES signatures {#batch-optimized}

Not yet available on this project.

### Batch of CAdES signatures {#batch-cades}

Not yet available on this project.

### Batch of XML signatures of elements on the same document {#batch-xml-element}

* [batch-xml-element-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/standard/batch-xml-element-signature.php)
  * JavaScript: [batch-xml-element-signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/standard/content/js/batch-xml-element-signature-form.js)
  * AJAX handlers: [batch-xml-element-signature-start.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/standard/batch-xml-element-signature-start.php)
    and [batch-xml-element-signature-complete.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/standard/batch-xml-element-signature-complete.php)
