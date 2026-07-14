# Projeto de exemplos em Ruby on Rails

O **Projeto de exemplos em Ruby on Rails** mostra como usar o [Rest PKI](../index.md) junto com [Web PKI](../../web-pki/index.md) em um projeto de Ruby usando o framework [Ruby on Rails](http://rubyonrails.org/). Isto está hospedado no GitHub em:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/ruby/rails

## Executando o projeto

1. [Download do projeto](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) ou clone o [repositório](https://github.com/LacunaSoftware/PkiSuiteSamples.git)
1. Instale as dependências: `bundle install`
1. Execute a aplicação: `rails server`
1. Accesse a URL [http://localhost:3000](http://localhost:3000)

## Mapa do projeto

Esta seção lista onde você vai encontrar partes relevantes nas amostras do projeto.

### Autentificação com certificado digital {#auth}

* Controller: [AuthenticationRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/authentication_rest_controller.rb)
* Views:
  * [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/authentication_rest/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/authentication_rest/action.html.erb)

### Assinatura PAdES com arquivo já no servidor {#pades}

* Controller: [PadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/pades_signature_rest_controller.rb)
* Views:
  * [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/pades_signature_rest/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/pades_signature_rest/action.html.erb)

### Assinatura PAdES com arquivo enviado pelo usuário {#pades-upload}

Após o upload do arquivo (apenas para demonstração no controlador [ServerFilesController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/server_files_controller.rb) e 
visualização [index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/server_files/index.html.erb)) o fluxo de controle é o mesmo que na amostra [Assinatura PAdES com arquivo existente já no servidor](#pades), mas com o parâmetro URL `userfile` preenchido.

### Co-assinatura PAdES {#pades-cosign}

Após o fluxo de controle da amostra [Assinatura PAdES com arquivo já existente](#pades) for concluído e o link *Co-assinar com outro certificado* for clicado, o
o mesmo fluxo de controle é repetido, mas agora com o parâmetro de URL `userfile` preenchido.

### Marcas PAdES {#pdf-marks}

Não avaliado para este projeto ainda.

### Assinatura PAdES usando chave do servidor {#pades-server}

Não avaliado para este projeto ainda.

### Assinatura PAdES sem comunicação do cliente {#pades-wo-client}

* Controller: [PadesSignatureExpressController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/controllers/pades_signature_express_controller.rb)
* Views:
  *	[index.html.erb](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/views/pades_signature_express/index.html.erb)
	(JavaScript on [signature-start-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/ruby/rails/app/assets/javascripts/signature-start-form.js))

### Abrir/validar uma assinatura PAdES existente {#open-pades}

Não avaliado para este projeto ainda.

### Versão para impressão {#print}

Não avaliado para este projeto ainda.

### Assinatura CAdES com arquivo já no servidor {#cades}

* Controller: [CadesSignatureController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/controllers/cades_signature_controller.rb)
* Views:
  * [index.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/cades_signature/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/cades_signature/action.html.erb)

### Assinatura CAdES com arquivo enviado pelo usuário {#cades-upload}

Após o fluxo de controle da amostra [Assinatura CAdES com arquivo já existente no servidor](#cades) for concluído e o link *Co-sign with another certificate* for clicado, o
o mesmo fluxo de controle é repetido, mas agora com o parâmetro de URL `userfile` preenchido.

### Assinatura CAdES usando chave do servidor {#cades-server}

Não avaliado para este projeto ainda.

### Abrir/validar uma assinatura CAdES existente {#open-cades}

Não avaliado para este projeto ainda.

### Assinatura XML de um documento inteiro {#xml-full}

* Controller: [FullXmlSignatureController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/controllers/full_xml_signature_controller.rb)
  * [index.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/full_xml_signature/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/full_xml_signature/action.html.erb)

### Assinatura XML de um elemento {#xml-element}

* Controller: [XmlElementSignatureController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/controllers/xml_element_signature_controller.rb)
* Views:
  * [index.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/xml_element_signature/index.html.erb)
    (JavaScript on [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/assets/javascripts/signature-form.js))
  * [action.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/xml_element_signature/action.html.erb)

### Assinatura XAdES de um elemento {#xades-element}

Não avaliado para este projeto ainda.

### Abrir/validar assinaturas em um arquivo XML existente {#open-xml}

Não avaliado para este projeto ainda.

### Lote de assinaturas PAdES {#batch}

* Controller: [BatchSignatureController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/controllers/batch_signature_controller.rb)
* View: [index.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/batch_signature/index.html.erb)
  (JavaScript on [batch-signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/assets/javascripts/batch-signature-form.js))

### Lote otimizado de assinaturas PAdES {#batch-optimized}

Não avaliado para este projeto ainda.

### Lote de assinaturas CAdES {#batch-cades}

* Controller: [CadesBatchSignatureController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/controllers/cades_batch_signature_controller.rb)
* View: [index.html.erb](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/views/cades_batch_signature/index.html.erb)
  (JavaScript on [batch-signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Ruby/app/assets/javascripts/batch-signature-form.js))

### Lote de assinaturas XML de elementos do mesmo documento {#batch-xml-element}

Não avaliado para este projeto ainda.