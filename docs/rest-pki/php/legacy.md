# Projeto de exemplos em PHP 5.3/5.4

O **Projeto de exemplos em PHP 5.3/5.4** mostra como usar [Rest PKI](../index.md) junto com [Web PKI](../../web-pki/index.md)
em um projeto usando **PHP 5.3** e **5.4**. Isto é hospedado no GitHub em:

https://github.com/LacunaSoftware/RestPkiSamples/tree/master/PHP/legacy

:::note
Somente usar este projeto se você não puder usar o [Projeto de exemplos em PHP 5.5+](current.md).
:::


## Executando o projeto

1. [Download do projeto](https://github.com/LacunaSoftware/RestPkiSamples/archive/master.zip) ou clonar o [repositório](https://github.com/LacunaSoftware/RestPkiSamples.git)
1. No prompt de comando, navegue até a pasta `PHP/legacy` e execute o comando `composer install` e faça o download das dependências (se você não tiver Composer instalado, pegue [aqui](https://getcomposer.org/))
1. Configurar um site no seu servidor HTTP local apontando para à pasta `PHP/legacy`
1. Abrir o arquivo index.php no browser a URL correspondente (dependendo do passo anterior)

## Mapa do projeto

Esta seção lista tem onde encontrar as partes relevantes em cada amostra de recurso no projeto.

### Autentificação com certificado digital {#auth}

* [authentication.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/authentication.php)
	* JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [authentication-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/authentication-action.php)

### Assinatura PAdES com arquivo já no servidor {#pades}

* [pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/pades-signature.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [pades-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/pades-signature-action.php)

### Assinatura PAdES com arquivo enviado pelo usuário {#pades-upload}

Após o upload do arquivo (que é grosseiramente implementado apenas para fins de demonstração em [upload.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/upload.php))
é feito o fluxo de controle é o mesmo que na amostra [Assinatura PAdES com arquivo já no servidor](#pades),
mas com parâmetro de URL `userfile` preenchidos.

### Assinatura conjunta PAdES {#pades-cosign}

Após o fluxo de controle da amostra [Assinatura PAdES com arquivo já no servidor](#pades) está concluído e o link *Co-sign with another certificate* é clicado, o mesmo fluxo de controle é 
repetido, mas agora com parâmetro de URL `userfile` preenchidos.

### Marcas PAdES {#pdf-marks}

Esse recurso é demonstrado como uma configuração opcional no  [Assinatura PAdES com arquivo já no servidor](#pades), amostra que por padrão começa comentada. Para ativá-lo, remova o comentário da linha a seguir [pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/pades-signature.php):

```php
array_push($signatureStarter->pdfMarks, PadesVisualElements::getPdfMark(1));
```
:::tip
Tente mudar o argumento para a função `getPdfMark()`para ver diferentes configurações de marcas PDF.
:::


O código relevante está no arquivo [util-pades.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/util-pades.php), 
função `getPdfMark()`.

### Assinatura PAdES usando chave do servidor {#pades-server}

Não está disponível neste projeto.

### Assinatura PAdES sem a comunicação com cliente {#pades-wo-client}

Ainda não está disponível neste projeto.

### Abrir/validar uma assinatura PAdES existente {#open-pades}

* [open-pades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/open-pades-signature.php)

### Versão para impressão {#print}

Após o fluxo de controle da amostra [Assinatura PAdES com arquivo já no servidor](#pades) está concluído e o link *Download a printer-friendly version of the signed file* é clicado, o fluxo 
vai para o arquivo [printer-friendly-version.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/printer-friendly-version.php), mas com parâmetro de URL `file` preenchidos.

O PDF gerado contém links para o arquivo [check.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/check.php), que 
mostra detalhes das assinaturas.

### Assinatura CAdES com arquivo já no servidor {#cades}

* [cades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/cades-signature.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [cades-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/cades-signature-action.php)

### Assinatura CAdES com upload do arquivo pelo usuário {#cades-upload}

Depois que o upload do arquivo (que é grosseiramente implementado apenas para fins de demonstração no [upload.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/upload.php)) é feito 
o fluxo de controle é o mesmo que na amostra [CAdES signature with file already on server](#cades), mas com parâmetro de URL `userfile` preenchidos.

### Assinatura conjunta CAdES {#cades-cosign}

Após o fluxo de controle da amostra [CAdES signature with file already on server](#cades) está concluído e o link *Co-sign with another certificate* é clicado, o mesmo fluxo de controle é 
repetido, mas agora com parâmetro de URL `cmsfile` preenchidos.

### Assinatura CAdES usando chave do servidor {#cades-server}

Ainda não está disponível neste projeto.

### Abrir/validar uma assinatura CAdES existente {#open-cades}

* [open-cades-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/open-cades-signature.php)

### Assinatura XML do documento inteiro {#xml-full}

* [xml-full-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/xml-full-signature.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [xml-full-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/xml-full-signature-action.php)

### Assinatura XML de um elemento {#xml-element}

* [xml-element-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/xml-element-signature.php)
  * JavaScript: [signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/signature-form.js)
* [xml-element-signature-action.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/xml-element-signature-action.php)

### Assinatura XAdES de um elemento {#xades-element}

Não está disponível neste projeto.

### Abrir/validar assinatura de um arquivo XML existente {#open-xml}

Não está disponível neste projeto.

### Lote de assinatura PAdES {#batch}

* [batch-signature.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/batch-signature.php)
  * JavaScript: [batch-signature-form.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/content/js/batch-signature-form.js)
  * AJAX handlers: [batch-signature-start.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/batch-signature-start.php)
    and [batch-signature-complete.php](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/PHP/legacy/batch-signature-complete.php)

### Lote otimizado de assinaturas PAdES {#batch-optimized}

Não está disponível neste projeto.

### Lote de assinaturas CAdES {#batch-cades}

Não está disponível neste projeto.

### Lote de assinaturas XML de elementos no mesmo documento {#batch-xml-element}

Não está disponível neste projeto.
