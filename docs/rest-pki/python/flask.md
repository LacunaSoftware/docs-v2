# Projeto de exemplos em Python com Flask

O **Projeto de exemplos em Python com Flask** mostra como usar o [Rest PKI](../index.md) junto com [Web PKI](../../web-pki/index.md) em um projeto Python usando o framework [Flask](http://flask.pocoo.org/). Está hospedado no GitHub em:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/python/flask

## Executando o projeto

1. [Download do projeto](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) ou clonar o repositório
1. Instale as dependências: `pip install -r requirements.txt`
1. Veja o ambiente variável `FLASK_APP` para definir o nome do aplicativo que deve executar: `FLASK_APP=sample`
1. Execute a aplicação web: `flask run`
1. Acesse a URL [http://localhost:5000](http://localhost:5000)

## Mapa do projeto

Esta seção mostra onde encontrar partes relevantes em cada amostra de recurso do projeto.

### Autentificação com certificação digital {#auth}

* View: [authentication_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/authentication_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/authentication_rest/index.html) (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/authentication_rest/complete.html)

### Assinatura PAdES com arquivo já no servidor {#pades}

* View: [pades_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/pades_signature_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/pades_signature_rest/index.html) (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/pades_signature_rest/complete.html)

### Assinatura PAdES com arquivo enviado pelo usuário {#pades-upload}

Após o upload do arquivo (implementado apenas para demonstração na view [server_files.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/server_files.py) e template [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/server_files/index.html)) o fluxo de controle é o mesmo que na amostra [Assinatura PAdES com arquivo já no servidor](#pades), mas com o parâmetro URL `userfile` preenchido.

### Co-assinatura PAdES {#pades-cosign}

Após o fluxo de controle da amostra [Assinatura PAdES com arquivo já no servidor](#pades) for concluído e o link *Co-assinatura com outro certificado* for clicado, o mesmo fluxo de controle é repetido, mas agora com o parâmetro URL `userfile` preenchido.

### Marcas PAdES {#pdf-marks}

Não avaliado neste projeto ainda.

### Assinatura PAdES usando chave do servidor {#pades-server}

Não avaliado neste projeto ainda.

### Assinatura PAdES sem comunicação do cliente {#pades-wo-client}

Não avaliado neste projeto ainda.

### Abrir/Validar uma assinatura PAdES existente {#open-pades}

Não avaliado neste projeto ainda.

### Versão para impressão {#print}

Não avaliado neste projeto ainda.

### Assinatura CAdES com arquivo já no servidor {#cades}

* View: [cades_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/cades_signature_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/cades_signature_rest/index.html) (JavaScript em [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/cades_signature_rest/complete.html)

### Assinatura CAdES com arquivo enviado pelo usuário {#cades-upload}

Após o upload do arquivo (implementado apenas para demonstração na view [server_files.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/server_files.py) e template [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/server_files/index.html)) o fluxo de controle é o mesmo que na amostra [Assinatura CAdES com arquivo já no servidor](#cades), mas com o parâmetro URL `userfile` preenchido.

### Co-assinatura CAdES {#cades-cosign}

Após o fluxo de controle da amostra [Assinatura CAdES com arquivo já no servidor](#cades) for concluído e o link *Co-assinatura com outro certificado* for clicado, o mesmo fluxo de controle é repetido, mas agora com o parâmetro URL `cmsfile` preenchido.

### Assinatura CAdES usando chave do servidor {#cades-server}

Não avaliado neste projeto ainda.

### Abrir/Validar uma assinatura CAdES existente {#open-cades}

Não avaliado neste projeto ainda.

### Assinatura XML de um documento inteiro {#xml-full}

* View: [xml_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/xml_signature_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/xml_signature_rest/index.html)
  (JavaScript em [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/xml_signature_rest/complete.html)

### Assinatura XML de um elemento {#xml-element}

* View: [xml_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/xml_signature_rest.py)
* Templates:
  * [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/xml_nfe_signature_rest/index.html) (JavaScript em [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/signature-form.js))
  * [complete.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/xml_nfe_signature_rest/complete.html)

### Assinatura XadES de um elemento {#xades-element}

Não avaliado neste projeto ainda.

### Lote de assinaturas PAdES {#batch}

* View: [batch_pades_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/batch_pades_signature_rest.py)
* Template: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/batch_pades_signature_rest/index.html) (JavaScript em [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/batch-signature-rest-form.js)) 

### Lote otimizado de assinatura PAdES {#batch-optimized}

Não avaliado neste projeto ainda.

### Lote de assinaturas CAdES {#batch-cades}

* View: [batch_cades_signature_rest.py](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/views/batch_cades_signature_rest.py)
* Template: [index.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/templates/batch_cades_signature_rest/index.html) (JavaScript em [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/python/flask/sample/static/js/batch-signature-rest-form.js))

### Lote de assinaturas XML de elementos do mesmo documento {#batch-xml-element}

Não avaliado neste projeto ainda.