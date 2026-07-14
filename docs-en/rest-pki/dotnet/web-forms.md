# ASP.NET Web Forms samples project

The **ASP.NET Web Forms samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a project using [ASP.NET Web Forms](https://docs.microsoft.com/en-us/aspnet/web-forms/what-is-web-forms). It is hosted on GitHub at:

https://github.com/LacunaSoftware/RestPkiSamples/tree/master/CSharp/WebForms

## Running the project

1. [Download the project](https://github.com/LacunaSoftware/RestPkiSamples/archive/master.zip) or clone the [repository](https://github.com/LacunaSoftware/RestPkiSamples.git)
1. Open the project folder (`CSharp\WebForms`)
1. Open the solution file (.sln) on Visual Studio
1. Run the solution. Make sure your system allows automatic Nuget package restore (if it doesn't, manually restore the packages).

## Project map

This section lists where to find the relevant parts in each feature sample on the project.

### Authentication with digital certificate {#auth}

* Web Forms: 
	* [Authentication.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Authentication.aspx)
		* [Authentication.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Authentication.aspx.cs)
	* [AuthenticationSuccess.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/AuthenticationSuccess.aspx)
		* [AuthenticationSuccess.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/AuthenticationSuccess.aspx.cs)
	* [AuthenticationFail.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/AuthenticationFail.aspx)
		* [AuthenticationFail.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/AuthenticationFail.aspx.cs)
* JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Scripts/signature-form.js)

### PAdES signature with file already on server {#pades}

* Web Forms:
	* [PadesSignature.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/PadesSignature.aspx)
		* [PadesSignature.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/PadesSignature.aspx.cs)
	* [PadesSignatureInfo.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/PadesSignatureInfo.aspx)
		* [PadesSignatureInfo.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/PadesSignatureInfo.aspx.cs)
* JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Scripts/signature-form.js)

### PAdES signature with file uploaded by user {#pades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the Web Form
[Upload.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Upload.aspx)
 and on its code-behind 
 [Upload.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Upload.aspx.cs))
is done the control flow is the same as in the sample [PAdES signature with file already on server](#pades), but with the URL parameter `userfile` filled.

### PAdES co-signature {#pades-cosign}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `userfile` filled.

### PAdES marks {#pdf-marks}

This feature is demonstrated as an optional configuration on the [PAdES signature with file already on server](#pades)
sample which by default starts commented out. To enable it, uncomment the following line on
[PadesSignatureController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/PadesSignature.aspx.cs):

```cs
signatureStarter.PdfMarks.Add(PadesVisualElements.GetPdfMark(1));
```

:::tip
Try changing the argument to the `GetPdfMark(int)` method to see different PDF mark configurations
:::


The relevant code is on the class [PadesVisualElements](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/PadesVisualElements.cs), method `GetPdfMark(int)`.

### PAdES signature using server key {#pades-server}

Not yet available on this project.

### PAdES signature without client communication {#pades-wo-client}

Not yet available on this project.

### Open/validate an existing PAdES signature {#open-pades}

Not yet available on this project.

### Printer-friendly version {#print}

After the control flow of the sample [PAdES signature with the file already on server](#pades) is completed and the link *Download a printer-friendly version of the signed file* is clicked,
the flow goes to the web form: 
[PrinterFriendlyVersion.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/PrinterFriendlyVersion.aspx) 
and to its code behind 
[PrinterFriendlyVersion.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/PrinterFriendlyVersion.aspx.cs)
with the URL parameter `file` filled.

The generated PDF contains links to the web form: 
[Check.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Check.aspx)
and to its code behind
[Check.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Check.aspx.cs),
which shows details of the signatures.

### CAdES signature with file already on server {#cades}

* Web Forms:
	* [CadesSignature.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/CadesSignature.aspx)
		* [CadesSignature.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/CadesSignature.aspx.cs)
	* [CadesSignatureInfo.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/CadesSignatureInfo.aspx)
		* [CadesSignatureInfo.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/CadesSignatureInfo.aspx.cs)
* JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Scripts/signature-form.js)

### CAdES signature with file uploaded by user {#cades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the Web Form
[Upload.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Upload.aspx)
 and on its code-behind 
 [Upload.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Upload.aspx.cs))
is done the control flow is the same as in the sample [CAdES signature with file already on server](#cades), but with the URL parameter `userfile` filled.

### CAdES co-signature {#cades-cosign}

After the control flow of the sample [CAdES signature with file already on server](#cades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `cmsfile` filled.

### CAdES signature using server key {#cades-server}

Not yet available on this project.

### Open/validate an existing CAdES signature {#open-cades}

Not yet available on this project.

### XML signature of the entire document {#xml-full}

Not yet available on this project.

### XML signature of an element {#xml-element}

* Web Forms:
	* [XmlElementSignature.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/XmlElementSignature.aspx)
		* [XmlElementSignature.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/XmlElementSignature.aspx.cs)
	* [XmlElementSignatureInfo.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/XmlElementSignatureInfo.aspx)
		* [XmlElementSignatureInfo.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/XmlElementSignatureInfo.aspx.cs)
* JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Scripts/signature-form.js)

### XAdES signature of an element {#xades-element}

Not yet available on this project.

### Open/validate signatures on an existing XML file {#open-xml}

Not yet available on this project.

### Batch of PAdES signatures {#batch}

* Web Form: [BatchSignature.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/BatchSignature.aspx)
	* [BatchSignature.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/BatchSignature.aspx.cs)
* JavaScript: [batch-signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Scripts/batch-signature-form.js)

### Optimized batch of PAdES signatures {#batch-optimized}

* Web Form: [BatchSignatureOptimized.aspx](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/BatchSignatureOptimized.aspx)
	* [BatchSignatureOptimized.aspx.cs](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/BatchSignatureOptimized.aspx.cs)
* JavaScript: [batch-signature-optimized-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/WebForms/WebForms/Scripts/batch-signature-optimized-form.js)

### Batch of CAdES signatures {#batch-cades}

Not yet available on this project.

### Batch of XML signatures of elements on the same document {#batch-xml-element}

Not yet available on this project.