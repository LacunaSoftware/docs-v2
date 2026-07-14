# PHP 5.3/5.4 samples project

The **PHP 5.3/5.4 samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a project using **PHP 5.3** and **5.4**. It is hosted on GitHub at:

https://github.com/LacunaSoftware/RestPkiSamples/tree/master/PHP/legacy

:::note
Only use this project if you cannot use the [PHP 5.5+ samples project](current.md).
:::


## Running the project

1. [Download the project](https://github.com/LacunaSoftware/RestPkiSamples/archive/master.zip) or clone the [repository](https://github.com/LacunaSoftware/RestPkiSamples.git)
1. Generate an API access token on the [REST PKI website](https://pki.rest/)
1. Paste your access token on the file [PHP/legacy/config.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/config.php#L21-L24)
1. In a command prompt, navigate to the folder `PHP/legacy` and run the command `composer install` to download the dependencies (if you don't have Composer installed, get it [here](https://getcomposer.org/))
1. Setup a website on your local HTTP server pointing to the `PHP/legacy` folder
1. Open the index.php file on the browser on the corresponding URL (depending on the previous step)

## Project map

This section lists where to find the relevant parts in each feature sample on the project.

### Authentication with digital certificate {#auth}

* [authentication.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/authentication.php)
	* JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [authentication-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/authentication-action.php)

### PAdES signature with file already on server {#pades}

* [pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/pades-signature.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [pades-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/pades-signature-action.php)

### PAdES signature with file uploaded by user {#pades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on
[upload.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/upload.php))
is done the control flow is the same as in the sample [PAdES signature with file already on server](#pades), but with the URL parameter `userfile` filled.

### PAdES co-signature {#pades-cosign}

After the control flow of the sample [PAdES singature with file already on server](#pades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `userfile` filled.

### PAdES marks {#pdf-marks}

This feature is demonstrated as an optional configuration on the [PAdES signature with file already on server](#pades)
sample which by default starts commented out. To enable it, uncomment the following line on
[pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/pades-signature.php)

```php
array_push($signatureStarter->pdfMarks, PadesVisualElements::getPdfMark(1));
```

:::tip
Try changing the argument to `getPdfMark()` function to see different PDF mark configurations
:::


The relevant code is on the file [util-pades.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/util-pades.php), function `getPdfMark()`.

### PAdES signature using server key {#pades-server}

Not yet available on this project.

### PAdES signature without client communication {#pades-wo-client}

Not yet available on this project.

### Open/validate and existing PAdES signature {#open-pades}

* [open-pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/open-pades-signature.php)

### Printer-friendly version {#print}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed and the link *Download a printer-friendly version of the signed file* is clicked,
the flow goes to the file
[printer-friendly-version.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/printer-friendly-version.php)
with the URL parameter `file` filled.

The generated PDF contains links to the file [check.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/check.php), which shows details of the signatures.

### CAdES signature with file already on server {#cades}

* [cades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/cades-signature.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [cades-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/cades-signature-action.php)

### CAdES signature with file uploaded by user {#cades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on
[upload.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/upload.php))
is done the control flow is the same as in the sample [CAdES signature with file already on server](#cades), but with the URL parameter `userfile` filled.

### CAdES co-signature {#cades-cosign}

After the control flow of the sample [CAdES signature with file already on server](#cades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `cmsfile` filled.

### CAdES signature using server key {#cades-server}

Not yet available on this project.

### Open/validate an existing CAdES signature {#open-cades}

* [open-cades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/open-cades-signature.php)

### XML signature of the entire document {#xml-full}

* [xml-full-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/xml-full-signature.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [xml-full-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/xml-full-signature-action.php)

### XML signature of an element {#xml-element}

* [xml-element-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/xml-element-signature.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [xml-element-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/xml-element-signature-action.php)

### XAdES signature of an element {#xades-element}

Not yet available on this project.

### Open/validate signatures on an existing XML file {#open-xml}

Not yet available on this project.

### Batch of PAdES signatures {#batch}

* [batch-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/batch-signature.php)
  * JavaScript: [batch-signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/batch-signature-form.js)
  * AJAX handlers: [batch-signature-start.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/batch-signature-start.php)
    and [batch-signature-complete.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/batch-signature-complete.php)

### Optimized batch of PAdES signatures {#batch-optimized}

Not yet available on this project.

### Batch of CAdES signatures {#batch-cades}

Not yet available on this project.

### Batch of XML signatures of elements on the same document {#batch-xml-element}

Not yet available on this project.
