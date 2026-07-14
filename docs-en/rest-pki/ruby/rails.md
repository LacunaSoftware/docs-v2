# Ruby on Rails samples project

The **Ruby on Rails samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a Ruby project using the [Ruby on Rails](http://rubyonrails.org/) framework. It is hosted on GitHub at:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/ruby/rails

## Running the project

1. [Download the project](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) or clone the [repository](https://github.com/LacunaSoftware/PkiSuiteSamples.git)
1. Install dependencies: `bundle install`
1. Run application: `rails server`
1. Access the URL [http://localhost:3000](http://localhost:3000)

## Project map

This section lists where to find the relevant parts in each feature sample on the project.

### Authentication with digital certificate {#auth}

* Controller: [AuthenticationRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/authentication_rest_controller.rb)
* Views:
  * [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/authentication_rest/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/authentication_rest/action.html.erb)

### PAdES signature with file already on server {#pades}

* Controller: [PadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/pades_signature_rest_controller.rb)
* Views:
  * [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/pades_signature_rest/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/pades_signature_rest/action.html.erb)

### PAdES signature with file uploaded by user {#pades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the controller
[ServerFilesController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/server_files_controller.rb)
and view
[index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/server_files/index.html.erb))
is done the control flow is the same as in the sample [PAdES signature with file already on server](#pades), but with the URL parameter `userfile` filled.

### PAdES co-signature {#pades-cosign}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `userfile` filled.

### PAdES marks {#pdf-marks}

Not yet available on this project.

### PAdES signature using server key {#pades-server}

Not yet available on this project.

### PAdES signature without client communication {#pades-wo-client}

* Controller: [PadesSignatureWithoutIntegrationController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/controllers/pades_signature_without_integration_controller.rb)
* Views:
  *	[index.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/pades_signature_without_integration/index.html.erb)
	(JavaScript on [signature-without-integration-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/assets/javascripts/signature-without-integration-form.js))

### Open/validate an existing PAdES signature {#open-pades}

Not yet available on this project.

### Printer-friendly version {#print}

Not yet available on this project.

### CAdES signature with file already on server {#cades}

* Controller: [CadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/cades_signature_rest_controller.rb)
* Views:
  * [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/cades_signature_rest/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/cades_signature_rest/action.html.erb)

### CAdES signature with file uploaded by user {#cades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the controller
[ServerFilesController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/server_files_controller.rb)
and view
[index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/server_files/index.html.erb)
is done the control flow is the same as in the sample [CAdES signature with file already on server](#pades), but with the URL parameter `userfile` filled.

### CAdES co-signature {#cades-cosign}

After the control flow of the sample [CAdES signature with file already on server](#cades) is completed and the link *Co-sign with another certificate* is clicked, the
same control flow is repeated, but now with the URL parameter `userfile` filled.

### CAdES signature using server key {#cades-server}

Not yet available on this project.

### Open/validate an existing CAdES signature {#open-cades}

Not yet available on this project.

### XML signature of the entire document {#xml-full}

* Controller: [XmlSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/xml_signature_rest_controller.rb)
  * [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/xml_signature_rest/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/xml_signature_rest/action.html.erb)

### XML signature of an element {#xml-element}

* Controller: [XmlNfeSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/xml_nfe_signature_rest_controller.rb)
* Views:
  * [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/xml_nfe_signature_rest/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/xml_nfe_signature_rest/action.html.erb)

### XAdES signature of an element {#xades-element}

Not yet available on this project.

### Open/validate signatures on an existing XML file {#open-xml}

Not yet available on this project.

### Batch of PAdES signatures {#batch}

* Controller: [BatchPadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/batch_pades_signature_rest_controller.rb)
* View: [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/batch_pades_signature_rest/index.html.erb)
  (JavaScript on [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/batch-signature-rest-form.js))

### Optimized batch of PAdES signatures {#batch-optimized}

Not yet available on this project.

### Batch of CAdES signatures {#batch-cades}

* Controller: [BatchCadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/batch_cades_signature_rest_controller.rb)
* View: [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/batch_cades_signature_rest/index.html.erb)
  (JavaScript on [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/batch-signature-rest-form.js))

### Batch of XML signatures of elements on the same document {#batch-xml-element}

Not yet available on this project.
