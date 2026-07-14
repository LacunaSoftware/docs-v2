# ASP.NET MVC samples project

The **ASP.NET MVC samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a project using [ASP.NET MVC 5](https://docs.microsoft.com/en-us/aspnet/mvc/mvc5). It is hosted on GitHub at:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/dotnet/mvc

## Running the project

1. [Download the project](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) or clone the [repository](https://github.com/LacunaSoftware/PkiSuiteSamples.git)
1. Open the project folder (`dotnet\mvc`)
1. Open the solution file (.sln) on Visual Studio
1. Run the solution. Make sure your system allows automatic Nuget package restore (if it doesn't, manually restore the packages).

## Project map

This section lists where to find the relevant parts in each feature sample on the project.

### Authentication with digital certificate {#auth}

* Controller: [AuthenticationRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/AuthenticationRestController.cs)
* Views:
  * [AuthenticationRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/AuthenticationRest/Index.cshtml)
  (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Content/js/signature-form.js))
  * [AuthenticationRest/Failed.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/AuthenticationRest/Failed.cshtml)
  * [AuthenticationRest/Success.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/AuthenticationRest/Success.cshtml)

### PAdES signature with file already on server {#pades}

* Controller: [PadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/PadesSignatureRestController.cs)
* Views: 
  * [PadesSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/PadesSignatureRest/Index.cshtml)
  (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Content/js/signature-form.js))
  * [PadesSignatureRest/SignatureInfo.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/PadesSignatureRest/SignatureInfo.cshtml)

### PAdES signature with file uploaded by user {#pades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the controller
[UploadController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/UploadController.cs)
and view
[Upload/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/Upload/Index.cshtml))
is done the control flow is the same as in the sample [PAdES signature with file already on server](#pades), but with the URL parameter `userfile` filled.

### PAdES co-signature {#pades-cosign}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `userfile` filled.

### PAdES marks {#pdf-marks}

This feature is demonstrated as an optional configuration on the [PAdES signature with file already on server](#pades)
sample which by default starts commented out. To enable it, uncomment the following line on
[PadesSignatureController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/PadesSignatureRestController.cs):

```cs
signatureStarter.PdfMarks.Add(PadesVisualElements.GetPdfMark(1));
```

:::tip
Try changing the argument to the `GetPdfMark(int)` method to see different PDF mark configurations
:::


The relevant code is on the class [PadesVisualElements](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Classes/PadesVisualElements.cs), method `GetPdfMark(int)`.

### PAdES signature without client communication {#pades-wo-client}

* Not yet available on this project, but you may refer to this old implementation in [Rest PKI Samples](https://github.com/LacunaSoftware/RestPkiSamples):
* Controller: [PadesSignatureWithoutDirectCommunicationControlller](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Controllers/PadesSignatureWithoutDirectCommunicationController.cs)
* Views:
  * [PadesSignatureWithoutDirectCommunication/Index.cshtml](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Views/PadesSignatureWithoutDirectCommunication/Index.cshtml)
  (JavaScript on [signature-start-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Content/js/signature-start-form.js))
  * [PadesSignatureWithoutDirectCommunication/Complete.cshtml](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Views/PadesSignatureWithoutDirectCommunication/Complete.cshtml)
  (JavaScript on [signature-complete-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Content/js/signature-complete-form.js))
  * [PadesSignatureWithoutDirectCommunication/SignatureInfo.cshtml](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Views/PadesSignatureWithoutDirectCommunication/SignatureInfo.cshtml)

### Open/validate an existing PAdES signature {#open-pades}

* Controller: [OpenPadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/OpenPadesSignatureRestController.cs)
* View: [OpenPadesSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/OpenPadesSignatureRest/Index.cshtml)

### Printer-friendly version {#print}

* Controller: [PrinterFriendlyPadesRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/PrinterFriendlyPadesRestController.cs)

### CAdES signature with file already on server {#cades}

* Controller: [CadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/CadesSignatureRestController.cs)
* Views: 
  * [CadesSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/CadesSignatureRest/Index.cshtml)
  (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Content/js/signature-form.js))
  * [CadesSignatureRest/SignatureInfo.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/CadesSignatureRest/SignatureInfo.cshtml)

### CAdES signature with file uploaded by user {#cades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the controller
[UploadController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/UploadController.cs)
and view
[Upload/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/Upload/Index.cshtml))
is done the control flow is the same as in the sample [CAdES signature with file already on server](#cades), but with the URL parameter `userfile` filled.

### CAdES co-signature {#cades-cosign}

After the control flow of the sample [CAdES signature with file already on server](#cades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `cmsfile` filled.

### Open/validate an existing CAdES signature {#open-cades}

* Controller: [OpenCadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/OpenCadesSignatureRestController.cs)
* View: [OpenCadesSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/OpenCadesSignatureRest/Index.cshtml)

### XML signature of the entire document {#xml-full}

* Controller: [XmlSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/XmlSignatureRestController.cs)
* Views: 
  * [XmlSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/XmlSignatureRest/Index.cshtml)
  (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Content/js/signature-form.js))
  * [XmlSignatureRest/SignatureInfo.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/XmlSignatureRest/SignatureInfo.cshtml)

### XML signature of an element {#xml-element}

* Controller: [XmlNFeSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/XmlNFeSignatureRestController.cs)
* Views: 
  * [XmlNFeSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/XmlNFeSignatureRest/Index.cshtml)
  (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Content/js/signature-form.js))
  * [XmlNFeSignatureRest/SignatureInfo.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/XmlNFeSignatureRest/SignatureInfo.cshtml)

### Open/validate signatures on an existing XML file {#open-xml}

* Controller: [OpenXmlSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/OpenXmlSignatureRestController.cs)
* View: [OpenXmlSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/OpenXmlSignatureRest/Index.cshtml)

### Batch of PAdES signatures {#batch}

* Controller: [BatchPadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/BatchPadesSignatureRestController.cs)
* View: [BatchPadesSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/BatchPadesSignatureRest/Index.cshtml)
  (JavaScript on [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Content/js/batch-signature-rest-form.js))

### Optimized batch of PAdES signatures {#batch-optimized}

* Controller: [BatchSignatureOptimizedController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Controllers/BatchSignatureOptimizedController.cs)
* View: [BatchSignatureOptimized/Index.cshtml](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Views/BatchSignatureOptimized/Index.cshtml)
  (JavaScript on [batch-signature-optimized-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/MVC/SampleSite/Content/js/batch-signature-optimized-form.js))

### Batch of CAdES signatures {#batch-cades}

* Controller: [BatchCadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Controllers/BatchCadesSignatureRestController.cs)
* View: [BatchCadesSignatureRest/Index.cshtml](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Views/BatchCadesSignatureRest/Index.cshtml)
  (JavaScript on [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/mvc/PkiSuiteAspNetMvcSample/Content/js/batch-signature-rest-form.js))

### Batch of XML signatures of elements on the same document {#batch-xml-element}

Not yet available on this project.
