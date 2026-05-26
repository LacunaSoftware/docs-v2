# Projeto de Exemplos PHP Plain

O projeto de exemplos demonstra o uso do [PKI Express](../index.md) junto com o componente [Web PKI](../../web-pki/index.md) em um projeto utilizando **PHP 5.5+ plain** (incluindo 7.x). Ele encontra-se hospedado no GitHub:

[https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/php](https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/php)

:::note
Se você utiliza uma versão anterior do PHP, por favor [fale conosco](https://www.lacunasoftware.com/pt/home/purchase).
:::


## Executando o Projeto

1. [Instale o PKI Express](../setup/index.md)
1. [Baixe o projeto](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) ou faça um *clone* do repositório: [https://github.com/LacunaSoftware/PkiSuiteSamples.git](https://github.com/LacunaSoftware/PkiSuiteSamples.git)
1. Entre na pasta `/php/plain`
1. Em um terminal, execute o comando `composer install` para baixar as dependências (se você não possuir o Composer instalado, baixe-o [aqui](https://getcomposer.org/))
1. Execute o project ao executar o comando `composer start`
1. Acesse a URL [http://localhost:8000](http://localhost:8000)

## Mapa do Projeto

Essa seção lista onde encontrar as partes relevante de cada exemplo de *feature* no projeto:

### Autenticação com Certificados Digitais

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/authentication-express/index.php)
  - JavaScript: [authentication-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/authentication-form.js)
- [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/authentication-express/complete.php)

### Assinatura PAdES com Arquivo do Servidor

Depois de escolher um dos arquivos do servidor disponíveis (que é implementado simplificadamente para propósito de demonstração em [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/server-files/index.php) e [action.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/server-files/action.php)), o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/index.php)
  - JavaScript: [signature-start-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-start-form.js)
- [start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/start.php)
  - JavaScript: [signature-complete-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-complete-form.js)
- [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/complete.php)

### Assinatura PAdES com Arquivo Enviado Pelo Usuário Por Upload

Depois que o upload do arquivo (que é implementado simplificadamente para propósito de demonstração em [upload.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/upload.php)) é feito, o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/index.php)
  - JavaScript: [signature-start-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-start-form.js)
- [start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/start.php)
  - JavaScript: [signature-complete-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-complete-form.js)
- [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/complete.php)

### Co-Assinatura PAdES

Depois de escolher um dos arquivos **já assinados** do servidor disponíveis (que é implementado simplificadamente para propósito de demonstração em [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/server-files/index.php) e [action.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/server-files/action.php)), o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/index.php)
  - JavaScript: [signature-start-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-start-form.js)
- [start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/start.php)
  - JavaScript: [signature-complete-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-complete-form.js)
- [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-signature-express/complete.php)

### Assinatura PAdES com Chave no Servidor

Depois que o upload do arquivo (que é implementado simplificadamente para propósito de demonstração em [upload.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/upload.php)) é feito, o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/pades-server-key-express/index.php)

### Lote de Assinaturas PAdES

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/batch-pades-signature-rest/index.php)
  - JavaScript: [batch-signature-rest-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/batch-signature-rest-form.js)
- Ajax handlers: [start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/batch-pades-signature-rest/start.php) and [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/batch-pades-signature-rest/complete.php)

### Abrir/Validar uma Assinatura PAdES Existente

Depois que o upload do arquivo (que é implementado simplificadamente para propósito de demonstração em [upload.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/upload.php)) é feito, o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/open-pades-rest/index.php)

### Versão para Impressão de uma Assinatura PAdES

Não está disponível nesse projeto ainda.

### Assinatura CAdES com Arquivo do Servidor

Depois de escolher um dos arquivos do servidor disponíveis (que é implementado simplificadamente para propósito de demonstração em [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/server-files/index.php) e [action.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/server-files/action.php)), o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/index.php)
  - JavaScript: [signature-start-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-start-form.js)
- [start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/start.php)
  - JavaScript: [signature-complete-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-complete-form.js)
- [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/complete.php)

### Assinatura CAdES com Arquivo Enviado Pelo Usuário Por Upload

Depois que o upload do arquivo (que é implementado simplificadamente para propósito de demonstração em [upload.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/upload.php)) é feito, o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/index.php)
  - JavaScript: [signature-start-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-start-form.js)
- [start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/start.php)
  - JavaScript: [signature-complete-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-complete-form.js)
- [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/complete.php)

### Co-Assinatura CAdES

Depois de escolher um dos arquivos **já assinados** do servidor disponíveis (que é implementado simplificadamente para propósito de demonstração em [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/server-files/index.php) e [action.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/server-files/action.php)), o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/index.php)
  - JavaScript: [signature-start-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-start-form.js)
- [start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/start.php)
  - JavaScript: [signature-complete-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-complete-form.js)
- [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-signature-express/complete.php)

### Assinatura CAdES com Chave no Servidor

Depois que o upload do arquivo (que é implementado simplificadamente para propósito de demonstração em [upload.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/upload.php)) é feito, o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/cades-server-key-express/index.php)

### Lote de Assinaturas CAdES

Não está disponível nesse projeto ainda.

### Abrir/Validar uma Assinatura CAdES Existente

Depois que o upload do arquivo (que é implementado simplificadamente para propósito de demonstração em [upload.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/upload.php)) é feito, o fluxo é feito pelos seguintes arquivos:

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/open-cades-express/index.php)

### Versão para Impressão de uma Assinatura CAdES

Não está disponível nesse projeto ainda.

### Pacote de Assinatura de uma Assinatura PAdES

Não está disponível nesse projeto ainda.

### Assinatura XML do Documento Inteiro

Não está disponível nesse projeto ainda.

### Assinatura de NFe

- [index.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/xml-nfe-signature-express/index.php)
  - JavaScript: [signature-start-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-start-form.js)
- [start.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/xml-nfe-signature-express/start.php)
  - JavaScript: [signature-complete-form.js](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/scripts/signature-complete-form.js)
- [complete.php](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/php/plain/public/xml-nfe-signature-express/complete.php)

### Assinatura de Documento COD

Não está disponível nesse projeto ainda.

### Abrir/Validar Assinaturas em Documento XML Existente

Não está disponível nesse projeto ainda.
