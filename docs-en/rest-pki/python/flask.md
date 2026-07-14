# Python Flash samples project

The **Python Flask samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a Python project using the [Flask](http://flask.pocoo.org/) framework. It is hosted on GitHub at:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/python/flask

## Running the project

1. [Download the project](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip)
   or clone the repository
1. Install dependencies: `pip install -r requirements.txt`
1. Set the `FLASK_APP` environment variable to define the name of app that
 should be run: `FLASK_APP=sample`
1. Run the web application: `flask run`
1. Access the URL [http://localhost:5000](http://localhost:5000)

## Project map

This section lists where to find the relevant parts in each feature sample on the project.

### Authentication with digital certificate {#auth}

* View: [authentication_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/authentication_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/authentication_rest/index.html) (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/authentication_rest/complete.html)

### PAdES signature with file already on server {#pades}

* View: [pades_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/pades_signature_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/pades_signature_rest/index.html) (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/pades_signature_rest/complete.html)

### PAdES signature with file uploaded by user {#pades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the view [server_files.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/server_files.py) and template [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/server_files/index.html))
is done the control flow is the same as in the sample [PAdES signature with the file already on server](#pades), but with the URL parameter `userfile` filled.

### PAdES co-signature {#pades-cosign}

After the control flow of the sample [PAdES signature with file already on server](#pades) is completed an the link *Co-sign with another certificate* is clicked, the same control flow is repeated, but now with the URL parameter `userfile` filled.

### PAdES marks {#pdf-marks}

Not yet available on this project.

### PAdES signature using server key {#pades-server}

Not yet available on this project.

### PAdES signature without client communication {#pades-wo-client}

Not yet available on this project.

### Open/validate an existing PAdES signature {#open-pades}

Not yet available on this project.

### Printer-friendly version {#print}

Not yet available on this project.

### CAdES signature with file already on server {#cades}

* View: [cades_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/cades_signature_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/cades_signature_rest/index.html) (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/cades_signature_rest/complete.html)

### CAdES signature with file uploaded by user {#cades-upload}

After the file upload (which is crudely implemented merely for demonstration purposes on the view [server_files.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/server_files.py) and template [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/server_files/index.html)) is done the control flow is the same as in the sample [CAdES signature with file already on server](#cades), but with the URL parameter `userfile` filled.

### CAdES co-signature {#cades-cosign}

After the control flow of the sample [CAdES signature with file already on server](#cades) is completed and the link *Co-sign with another certificate* is clicked, the same control flow is repeated, but now with the URL parameter `cmsfile` filled.

### CAdES signature using server key {#cades-server}

Not yet available on this project.

### Open/validate an existing CAdES signature {#open-cades}

Not yet available on this project.

### XML signature of the entire document {#xml-full}

* View: [xml_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/xml_signature_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/xml_signature_rest/index.html)
  (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/xml_signature_rest/complete.html)

### XML signature of an element {#xml-element}

* View: [xml_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/xml_signature_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/xml_nfe_signature_rest/index.html) (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/xml_nfe_signature_rest/complete.html)

### XAdES signature of an element {#xades-element}

Not yet available on this project.

### Open/validate signatures on an existing XML file {#open-xml}

Not yet available on this project.

### Batch of PAdES signatures {#batch}

* View: [batch_pades_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/batch_pades_signature_rest.py)
* Template: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/batch_pades_signature_rest/index.html) (JavaScript on [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/batch-signature-rest-form.js)) 

### Optimized batch of PAdES signatures {#batch-optimized}

Not yet available on this project.

### Batch of CAdES signatures {#batch-cades}

* View: [batch_cades_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/batch_cades_signature_rest.py)
* Template: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/batch_cades_signature_rest/index.html) (JavaScript on [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/batch-signature-rest-form.js))

### Batch of XML signatures of elements on the same document {#batch-xml-element}

Not yet available on this project.