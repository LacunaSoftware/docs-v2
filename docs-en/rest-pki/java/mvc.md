# Java 7+ Spring MVC samples project

The **Java 7+ Spring MVC samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a Java 7+ web application using the [Spring MVC](http://spring.io/) framework. It is hosted on GitHub at:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/java/springmvc

## Running the project

1. [Download the project](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) or clone the [repository](https://github.com/LacunaSoftware/PkiSuiteSamples.git)
1. In a command prompt, navigate to the folder `Java/sample-spring-mvc` and run the command
   `gradlew run` (on Linux `./gradlew run`). If you are using Windows, you can alternatively
   double-click the file `Run-Sample.bat`.
1. Once you see the message "Started Application in x.xxx seconds" (the on-screen percentage
   will *not* reach 100%), open a web browser and go the URL http://localhost:60963

## Project map

This section lists where to find the relevant parts in each feature sample on the project.

### Authentication with digital certificate {#auth}

* Controller: [AuthenticationRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/AuthenticationRestController.java)
* Views:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/authentication-rest/index.html)
    (JavaScript on [authentication-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/authentication-form.js))
  * [authentication-success.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/authentication-rest/success.html)
  * [authentication-failed.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/authentication-rest/failed.html)

### PAdES signature with file already on server {#pades}

* Controller: [PadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureRestController.java)
* Views:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-signature-rest/index.html)
    (Javascript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-form.js))
  * [signature-info.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-signature-rest/signature-info.html)

### PAdES signature with file uploaded by user {#pades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the controller
[UploadController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/UploadController.java)
and view
[index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/upload/index.html))
is done the control flow is the same as in the sample [PAdES signature with file already on server](#pades), but with the URL parameter `userfile` filled.

### PAdES co-signature {#pades-cosign}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `userfile` filled.

### PAdES marks {#pdf-marks}

This feature is demonstrated as an optional configuration on the [PAdES signature with file already on server](#pades)
sample which by default starts commented out. To enable it, uncomment the following line on
[PadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesSignatureRestController.java):

```java
signatureStarter.addPdfMark(PadesVisualElements.getPdfMark(1));
```

:::tip
Try changing the argument to the `getPdfMark(int)` method to see different PDF mark configurations
:::


The relevant code is on the class [PadesVisualElements](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/util/restpki/PadesVisualElements.java), method `getPdfMark(int)`.

### PAdES signature using server key {#pades-server}

* Controller: [PadesServerKeyExpressController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PadesServerKeyExpressController.java)
* View: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/pades-server-key-express/index.html)

### Open/validate an existing PAdES signature {#open-pades}

* Controller: [OpenPadesRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/OpenPadesRestController.java)
* View: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/open-pades-rest/index.html)

### Printer-friendly version {#print}

After the control flow of the sample [PAdES signature with already on server](#pades) is completed and the link *Download a 
printer-friendly version of the signed file* is clicked, the flow goes to the controller [PrinterFriendlyPadesRestController.java](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/PrinterFriendlyPadesRestController.java) with the URL parameter `fileId` filled.

### CAdES signature with file already on server {#cades}

* Controller: [CadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/CadesSignatureRestController.java)
* Views:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/cades-signature-rest/index.html)
  (Javascript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-form.js))
  * [signature-info.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/cades-signature-rest/signature-info.html)

### CAdES signature with file uploaded by user {#cades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the controller
[UploadController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/UploadController.java)
and view
[index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/upload/index.html))
is done the control flow is the same as in the sample [CAdES signature with file already on server](#cades), but with the URL parameter `userfile` filled.

### CAdES co-signature {#cades-cosign}

After the control flow of the sample [CAdES signature with file already on server](#cades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `cmsfile` filled.

### CAdES signature using server key {#cades-server}

* Controller: [CadesSignatureServerKeyController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Java/sample-spring-mvc/src/main/java/sample/controller/CadesSignatureServerKeyController.java)
* View: [cades-signature-server-key.html](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Java/sample-spring-mvc/src/main/resources/templates/cades-signature-server-key.html)

### Open/validate an existing CAdES signature {#open-cades}

* Controller: [OpenCadesExpressController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/OpenCadesExpressController.java)
* View: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/open-cades-express/index.html)

### XML signature of the entire document {#xml-full}

* Controller: [XmlSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/XmlSignatureRestController.java)
* Views:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/xml-signature-rest/index.html)
  (Javascript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-form.js))
  * [signature-info.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/xml-signature-rest/signature-info.html)

### XML signature of an element {#xml-element}

* Controller: [XmlNFeSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/XmlNFeSignatureRestController.java)
* Views:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/xml-nfe-signature-rest/index.html)
  (Javascript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/signature-form.js))
  * [signature-info.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/xml-nfe-signature-rest/signature-info.html)

### XAdES signature of an element {#xades-element}

Not yet available on this project.

### Open/validate signatures on an existing XML file {#open-xml}

* Controller: [OpenXmlRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/OpenXmlRestController.java)
* View: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/open-xml-rest/index.html)

### Batch of PAdES signatures {#batch}

* Controller: [BatchPadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/java/com/lacunasoftware/pkisuite/controller/BatchPadesSignatureRestController.java)
* View: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/templates/batch-signature-rest/index.html)
  * Javascript: [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/java/springmvc/src/main/resources/static/js/batch-signature-rest-form.js)

### Optimized batch of PAdES signatures {#batch-optimized}

Not yet available on this project.

### Batch of CAdES signatures {#batch-cades}

Not yet available on this project.

### Batch of XML signatures of elements on the same document {#batch-xml-element}

Not yet available on this project.
