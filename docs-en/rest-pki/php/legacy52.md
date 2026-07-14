# PHP 5.2 samples project

The **PHP 5.2 samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a project using **PHP 5.2**. It is hosted on GitHub at:

https://github.com/LacunaSoftware/RestPkiSamples/tree/master/PHP/legacy52

:::note
Only use this project if you cannot use the [PHP 5.5+ samples project](current.md) nor the [PHP 5.3/5.4 samples project](legacy.md).
:::


## Running the project

1. [Download the project](https://github.com/LacunaSoftware/RestPkiSamples/archive/master.zip) or clone the [repository](https://github.com/LacunaSoftware/RestPkiSamples.git)
1. Generate an API access token on the [REST PKI website](https://pki.rest/)
1. Paste your access token on the file [PHP/legacy52/config.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/config.php#L21-L24)
1. In a command prompt, navigate to the folder `PHP/legacy52` and run the command `composer install` to download the dependencies (if you don't have Composer installed, get it [here](https://getcomposer.org/))
1. Setup a website on your local HTTP server pointing to the `PHP/legacy52` folder
1. Open the index.php file on the browser on the corresponding URL (depending on the previous step)

## Project map

This section lists where to find the relevant parts in each feature sample on the project.

### Authentication with digital certificate {#auth}

* [authentication.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/authentication.php)
	* JavaScript: (inside authentication.php)
* [authentication-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/authentication-action.php)

### PAdES signature with file already on server {#pades}

* [pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/pades-signature.php)
  * JavaScript: (inside pades-signature.php)
* [pades-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/pades-signature-action.php)

### PAdES signature with file uploaded by user {#pades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on
[upload.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/upload.php))
is done the control flow is the same as in the sample [PAdES signature with file already on server](#pades), but with the URL parameter `userfile` filled.

### PAdES co-signature {#pades-cosign}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed and the link *Click here to co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `userfile` filled.

### PAdES marks {#pdf-marks}

Not yet available on this project.

### PAdES signature using server key {#pades-server}

Not yet available on this project.

### PAdES signature without client communication {#pades-wo-client}

Not yet available on this project.

### Open/validate and existing PAdES signature {#open-pades}

* [open-pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/open-pades-signature.php)

### Printer-friendly version {#print}

Not yet available on this project.

### CAdES signature with file already on server {#cades}

* [cades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/cades-signature.php)
  * JavaScript: (inside cades-signature.php)
* [cades-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/cades-signature-action.php)

### CAdES signature with file uploaded by user {#cades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on
[upload.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/upload.php))
is done the control flow is the same as in the sample [CAdES signature with file already on server](#cades), but with the URL parameter `userfile` filled.

### CAdES co-signature {#cades-cosign}

After the control flow of the sample [CAdES signature with file already on server](#cades) is completed and the link *Click here to co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `cmsfile` filled.

### CAdES signature using server key {#cades-server}

Not yet available on this project.

### Open/validate an existing CAdES signature {#open-cades}

* [open-cades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/open-cades-signature.php)

### XML signature of the entire document {#xml-full}

* [xml-full-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/xml-full-signature.php)
  * JavaScript: (inside xml-full-signature.php)
* [xml-full-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/xml-full-signature-action.php)

### XML signature of an element {#xml-element}

* [xml-element-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/xml-element-signature.php)
  * JavaScript: (inside xml-element-signature.php)
* [xml-element-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/xml-element-signature-action.php)

### XAdES signature of an element {#xades-element}

Not yet available on this project.

### Open/validate signatures on an existing XML file {#open-xml}

Not yet available on this project.

### Batch of PAdES signatures {#batch}

* [batch-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/batch-signature.php)
  * JavaScript: [batch-signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/content/js/batch-signature-form.js)
  * AJAX handlers: [batch-signature-start.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/batch-signature-start.php)
    and [batch-signature-complete.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/batch-signature-complete.php)

### Optimized batch of PAdES signatures {#batch-optimized}

Not yet available on this project.

### Batch of CAdES signatures {#batch-cades}

Not yet available on this project.

### Batch of XML signatures of elements on the same document {#batch-xml-element}

Not yet available on this project.