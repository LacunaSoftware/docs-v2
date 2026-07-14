# Projeto de exemplos em Node.js MVC

O **Projeto de exemplos em Node.js MVC** mostra como usar o [Rest PKI](../index.md) junto com [Web PKI](../../web-pki/index.md)
em projeto Node.js seguindo o padrão Model-View-Controller. É hospedado no GitHub em:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/nodejs/expressmvc

## Executando o projeto

1. [Download do projeto](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) ou clonar o [repositório](https://github.com/LacunaSoftware/PkiSuiteSamples.git)
1. Instale as dependências: `npm install`
1. Execute a aplicação: `npm start`
1. Acesse o URL [http://localhost:3000](http://localhost:3000)

## Mapa do projeto

Esta seção lista tem onde encontrar as partes relevantes em cada amostra de recurso no projeto.

### Autentificação com certificado digital {#auth}

* Route: [authentication-restpki.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/nodejs/expressmvc/routes/authentication-restpki.js)
* Views:
  * [authentication-rest/index.pug](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/nodejs/expressmvc/views/authentication-rest/index.pug)
    (JavaScript on [authentication-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/nodejs/expressmvc/public/javascripts/authentication-form.js))
  * [authentication-rest/failed.pug](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/nodejs/expressmvc/views/authentication-rest/failed.pug)

### Assinatura PAdES com arquivo já no servidor {#pades}

* Route: [pades-signature.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/pades-signature.js)
* Views: 
  * [pades-signature.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/pades-signature.pug)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/public/javascripts/signature-form.js))
  * [pades-signature-complete.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/pades-signature-complete.pug)

### Assinatura PAdES com arquivo enviado pelo usuário {#pades-upload}

Após o upload do arquivo (que é grosseiramente implementado apenas para fins de demonstração em [upload.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/upload.js) e
[upload.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/upload.pug)) é feito o fluxo de controle é o mesmo que na amostra [Assinatura PAdES com arquivo já no servidor](#pades),
mas com parâmetro de URL `userfile` preenchidos.

### Assinatura conjunta PAdES {#pades-cosign}

Após o fluxo de controle da amostra [Assinatura PAdES com arquivo já no servidor](#pades) está concluído e o link *Co-sign with another certificate* é clicado, o mesmo fluxo de controle é 
repetido, mas agora com parâmetro de URL `userfile` preenchidos.

### Marcas PAdES {#pdf-marks}

Ainda não está disponível neste projeto.

### Assinatura PAdES usando chave do servidor {#pades-server}

* Route: [pades-signature-server-key.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/pades-signature-server-key.js)
* View: [pades-signature-complete.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/pades-signature-complete.pug)

### Assinatura PAdES sem a comunicação com cliente {#pades-wo-client}

Ainda não está disponível neste projeto.

### Abrir/validar uma assinatura PAdES existente {#open-pades}

* Route: [open-pades-signature.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/open-pades-signature.js)
* View: [open-pades-signature.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/open-pades-signature.pug)

### Versão para impressão {#print}

Após o fluxo do controle da amostra [Assinatura PAdES com arquivo já no servidor](#pades) estiver completo e o link *Download a printer-friendly version of the signed file* for clicado, o fluxo ,
vai para web form: [printer-friendly-version.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/printer-friendly-version.js) com o arquivo de parâmetro URL `file` preenchido.

### Assinatura CAdES com arquivo já no servidor {#cades}

* Route: [cades-signature.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/cades-signature.js)
* Views:  
  * [cades-signature.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/cades-signature.pug)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/public/javascripts/signature-form.js))
  * [cades-signature-complete.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/cades-signature-complete.pug)

### Assinatura CAdES com upload do arquivo pelo usuário {#cades-upload}

Depois que o upload do arquivo (que é grosseiramente implementado apenas para fins de demonstração no [upload.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/upload.js) e [upload.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/upload.pug)) é feito 
o fluxo de controle é o mesmo que na amostra [Assinatura CAdES com arquivo já no servidor](#cades), mas com parâmetro de URL `userfile` preenchidos.

### Assinatura conjunta CAdES {#cades-cosign}

Após o fluxo de controle da amostra [Assinatura CAdES com arquivo já no servidor](#cades) está concluído e o link *Co-sign with another certificate* é clicado, o mesmo fluxo de controle é 
repetido, mas agora com parâmetro de URL `cmsfile` preenchidos.

### Assinatura CAdES usando chave do servidor {#cades-server}

* Route: [cades-signature-server-key.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/cades-signature-server-key.js)
* View: [cades-signature-complete.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/cades-signature-complete.pug)

### Abrir/validar uma assinatura CAdES existente {#open-cades}

* Route: [open-cades-signature.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/open-cades-signature.js)
* View: [open-cades-signature.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/open-cades-signature.pug)

### Assinatura XML do documento inteiro {#xml-full}

* Route: [xml-full-signature.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/xml-full-signature.js)
* Views:
  * [xml-full-signature.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/xml-full-signature.pug)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/public/javascripts/signature-form.js))
  * [xml-signature-complete.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/xml-signature-complete.pug)

### Assinatura XML de um elemento {#xml-element}

* Route: [xml-element-signature.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/routes/xml-element-signature.js)
* Views:
  * [xml-element-signature.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/xml-element-signature.pug)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/public/javascripts/signature-form.js))
  * [xml-signature-complete.pug](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/NodeJS/mvc/views/xml-signature-complete.pug)

### Assinatura XAdES de um elemento {#xades-element}

Ainda não está disponível neste projeto.

### Abrir/validar assinatura de um arquivo XML existente {#open-xml}

Ainda não está disponível neste projeto.

### Lote de assinatura PAdES {#batch}

Ainda não está disponível neste projeto.

### Lote otimizado de assinaturas PAdES {#batch-optimized}

Ainda não está disponível neste projeto.

### Lote de assinaturas CAdES {#batch-cades}

Ainda não está disponível neste projeto.

### Lote de assinaturas XML de elementos no mesmo documento {#batch-xml-element}

Ainda não está disponível neste projeto.