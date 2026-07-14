# Projeto de exemplos em PHP 5.2

O **Projeto de exemplos em PHP 5.2** mostra como usar [Rest PKI](../index.md) junto com [Web PKI](../../web-pki/index.md)
em um projeto usando **PHP 5.2**. Isto é hospedado no GitHub em:

https://github.com/LacunaSoftware/RestPkiSamples/tree/master/PHP/legacy52

:::note
Somente usar este projeto se você não puder usar o [Projeto de exemplos em PHP 5.5+](current.md) ou o [Projeto de exemplos em PHP 5.3/5.4](legacy.md).
:::


## Executando o projeto

1. [Download do projeto](https://github.com/LacunaSoftware/RestPkiSamples/archive/master.zip) ou clonar o [repositório](https://github.com/LacunaSoftware/RestPkiSamples.git)
1. No prompt de comando, navegue até a pasta `PHP/legacy52` e execute o comando `composer install` e faça o download das dependências (se você não tiver Composer instalado, pegue [aqui](https://getcomposer.org/))
1. Configurar um site no seu servidor HTTP local apontando para à pasta `PHP/legacy52`
1. Abrir o arquivo index.php no browser a URL correspondente (dependendo do passo anterior)

## Mapa do projeto

Esta seção lista tem onde encontrar as partes relevantes em cada amostra de recurso no projeto.

### Autentificação com certificado digital {#auth}

* [authentication.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/authentication.php)
	* JavaScript: (inside authentication.php)
* [authentication-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/authentication-action.php)

### Assinatura PAdES com arquivo já no servidor {#pades}

* [pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/pades-signature.php)
  * JavaScript: (inside pades-signature.php)
* [pades-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/pades-signature-action.php)

### Assinatura PAdES com arquivo enviado pelo usuário {#pades-upload}

Após o upload do arquivo (que é grosseiramente implementado apenas para fins de demonstração em [upload.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/upload.php)) é feito o fluxo de controle é o mesmo que na amostra [Assinatura PAdES com arquivo já no servidor](#pades),
mas com parâmetro de URL `userfile` preenchidos.

### Assinatura conjunta PAdES {#pades-cosign}

Após o fluxo de controle da amostra [Assinatura PAdES com arquivo já no servidor](#pades) está concluído e o link *Co-sign with another certificate* é clicado, o mesmo fluxo de controle é 
repetido, mas agora com parâmetro de URL `userfile` preenchidos.

### Marcas PAdES {#pdf-marks}

Ainda não está disponível neste projeto

### Assinatura PAdES usando chave do servidor {#pades-server}

Ainda não está disponível neste projeto.

### Assinatura PAdES sem a comunicação com cliente {#pades-wo-client}

Ainda não está disponível neste projeto.

### Abrir/validar uma assinatura PAdES existente {#open-pades}

* [open-pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/open-pades-signature.php))

### Versão para impressão {#print}

Ainda não está disponível neste projeto.

### Assinatura CAdES com arquivo já no servidor {#cades}

* [cades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/cades-signature.php)
  * JavaScript: (inside cades-signature.php)
* [cades-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/cades-signature-action.php)

### Assinatura CAdES com upload do arquivo pelo usuário {#cades-upload}

Depois que o upload do arquivo (que é grosseiramente implementado apenas para fins de demonstração no [upload.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/upload.php)) é feito 
o fluxo de controle é o mesmo que na amostra [CAdES signature with file already on server](#cades), mas com parâmetro de URL `userfile` preenchidos.

### Assinatura conjunta CAdES {#cades-cosign}

Após o fluxo de controle da amostra [CAdES signature with file already on server](#cades) está concluído e o link *Co-sign with another certificate* é clicado, o mesmo fluxo de controle é 
repetido, mas agora com parâmetro de URL `cmsfile` preenchidos.

### Assinatura CAdES usando chave do servidor {#cades-server}

Ainda não está disponível neste projeto.

### Abrir/validar uma assinatura CAdES existente {#open-cades}

* [open-cades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/open-cades-signature.php)

### Assinatura XML do documento inteiro {#xml-full}

* [xml-full-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/xml-full-signature.php)
  * JavaScript: (inside xml-full-signature.php)
* [xml-full-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/xml-full-signature-action.php)

### Assinatura XML de um elemento {#xml-element}

* [xml-element-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/xml-element-signature.php)
  * JavaScript: (inside xml-element-signature.php)
* [xml-element-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/xml-element-signature-action.php)

### Assinatura XAdES de um elemento {#xades-element}

Ainda não está disponível neste projeto.

### Abrir/validar assinatura de um arquivo XML existente {#open-xml}

Ainda não está disponível neste projeto.

### Lote de assinatura PAdES {#batch}

* [batch-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/batch-signature.php)
  * JavaScript: [batch-signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/content/js/batch-signature-form.js)
  * AJAX handlers: [batch-signature-start.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/batch-signature-start.php)
    and [batch-signature-complete.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy52/batch-signature-complete.php)

### Lote otimizado de assinaturas PAdES {#batch-optimized}

Ainda não está disponível neste projeto.

### Lote de assinaturas CAdES {#batch-cades}

Ainda não está disponível neste projeto.

### Lote de assinaturas XML de elementos no mesmo documento {#batch-xml-element}

Ainda não está disponível neste projeto.