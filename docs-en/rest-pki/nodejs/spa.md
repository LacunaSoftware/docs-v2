# Node.js SPA samples project

The **Node.js SPA samples project** shows how to use [Rest PKI](../index.md) together with [Web PKI](../../web-pki/index.md)
on a Node.js project following the Single Page Application pattern with [AngularJS](https://angularjs.org/) on the frontend.
It is hosted on GitHub at:

https://github.com/LacunaSoftware/RestPkiSamples/tree/master/NodeJS/angular-spa

## Running the project

1. [Download the project](https://github.com/LacunaSoftware/RestPkiSamples/archive/master.zip) or clone the [repository](https://github.com/LacunaSoftware/RestPkiSamples.git)
1. Generate an API access token on the [REST PKI website](https://pki.rest/)
1. Paste your access token on the file [restpki-client.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/angular-spa/restpki-client.js)
1. Install dependencies: `npm install`
1. Run application: `npm start`
1. Access the URL [http://localhost:3000](http://localhost:3000)

## Project map

This section lists where to find the relevant parts in each feature sample on this project.

### Authentication with digital certificate {#auth}

* API: [app.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/angular-spa/app.js)
* SPA Controller: [authentication.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/angular-spa/webapp/js/controllers/authentication.js)
* SPA Template: [authentication.html](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/AspNetCore/CoreWebApp/wwwroot/views/authentication.html)

### PAdES signature with file already on server {#pades}

* API: [app.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/angular-spa/app.js)
* SPA Controller: [pades-signature.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/angular-spa/webapp/js/controllers/pades-signature.js)
* SPA Template: [pades-signature.html](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/angular-spa/webapp/views/pades-signature.html)

### PAdES signature with file uploaded by user {#pades-upload}

Not yet available on this project.

### PAdES co-signature {#pades-cosign}

Not yet available on this project.

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

Not yet available on this project.

### CAdES signature with file uploaded by user {#cades-upload}

Not yet available on this project.

### CAdES co-signature {#cades-cosign}

Not yet available on this project.

### CAdES signature using server key {#cades-server}

Not yet available on this project.

### Open/validate an existing CAdES signature {#open-cades}

Not yet available on this project.

### XML signature of the entire document {#xml-full}

Not yet available on this project.

### XML signature of an element {#xml-element}

Not yet available on this project.

### XAdES signature of an element {#xades-element}

Not yet available on this project.

### Open/validate signatures on an existing XML file {#open-xml}

Not yet available on this project.

### Batch of PAdES signatures {#batch}

Not yet available on this project.

### Optimized batch of PAdES signatures {#batch-optimized}

Not yet available on this project.

### Batch of CAdES signatures {#batch-cades}

Not yet available on this project.

### Batch of XML signatures of elements on the same document {#batch-xml-element}

Not yet available on this project.

