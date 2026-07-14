# Projeto de exemplos em ASP.NET Core

O **Projeto de exemplos em ASP.NET Core** mostra como usar o [Rest PKI](../index.md) junto com [Web PKI](../../web-pki/index.md)
em um projeto usando [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/). É hospedado no GiHub em:

https://github.com/LacunaSoftware/PkiSuiteSamples/tree/master/dotnet/spa

## Executando o projeto

1. [Download do projeto](https://github.com/LacunaSoftware/PkiSuiteSamples/archive/master.zip) ou clonar o [repositório](https://github.com/LacunaSoftware/PkiSuiteSamples.git)
1. Abra a pasta do projeto (`dotnet\spa\PkiSuiteAspNetSpaSample`)
1. Abra o arquivo de solução (.sln) no Visual Studio
1. Execute a solução. Certifique-se de que seu sistema permita a restauração automática do pacote Nuget (se isso não ocorrer, restaure manualmente os pacotes).

## Mapa do projeto

Esta seção lista tem onde encontrar as partes relevantes em cada amostra de recurso no projeto.

### Autentificação com certificado digital {#auth}

* API Controller: [AuthenticationRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/Controllers/AuthenticationRestController.cs)
* Componente SPA (TypeScript): [authentication-rest.component.ts](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/authentication-rest/authentication-rest.component.ts)
* Template SPA (HTML): [authentication-rest.component.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/authentication-rest/authentication-rest.component.html)

### Assinatura PAdES com arquivo já no servidor {#pades}

* API Controller: [PadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/Controllers/PadesSignatureRestController.cs)
* Componente SPA (TypeScript): [pades-signature-rest.component.ts](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/pades-signature-rest/pades-signature-rest.component.ts)
* Template SPA (HTML): [pades-signature-rest.component.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/pades-signature-rest/pades-signature-rest.component.html)

### Assinatura PAdES com arquivo enviado pelo usuário {#pades-upload}

Após o upload do arquivo (que é grosseiramente implementado apenas para fins de demonstração em [upload.js](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/AspNetCore/CoreWebApp/wwwroot/controllers/upload.js),
template [upload.html](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/AspNetCore/CoreWebApp/wwwroot/views/upload.html) 
and API Controller [UploadController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/AspNetCore/CoreWebApp/Controllers/UploadController.cs)) é feito o fluxo de controle é o mesmo que na amostra [PAdES signature with file already on server](#pades),
mas com parâmetro de URL `userfile` preenchidos.

### Assinatura conjunta PAdES {#pades-cosign}

Após o fluxo de controle da amostra [Assinatura PAdES com arquivo já no servidor](#pades) está concluído e o link *Co-sign with another certificate* é clicado, o mesmo fluxo de controle é 
repetido, mas agora com parâmetro de URL `userfile` preenchidos.

### Marcas PAdES {#pdf-marks}

Esse recurso é demonstrado como uma configuração opcional no  [Assinatura PAdES com arquivo já no servidor](#pades), amostra que por padrão começa comentada. Para ativá-lo, remova o 
comentário da linha a seguir [PadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/Controllers/PadesSignatureRestController.cs):

```cs
signatureStarter.PdfMarks.Add(PadesVisualElements.GetPdfMark(storage, 1));
```

:::tip
Tente mudar o argumento para a função `getPdfMark()`para ver diferentes configurações de marcas PDF.
:::


O código relevante está no arquivo [PadesVisualElements](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/Classes/PadesVisualElements.cs), 
função `getPdfMark()`.

### Assinatura PAdES usando chave do servidor {#pades-server}

Ainda não está disponível neste projeto.

### Assinatura PAdES sem a comunicação com cliente {#pades-wo-client}

Ainda não está disponível neste projeto.

### Abrir/validar uma assinatura PAdES existente {#open-pades}

* API Controller: [OpenPadesRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/Controllers/OpenPadesRestController.cs)
* Componente SPA (TypeScript): [open-pades-rest.component.ts](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/open-pades-rest/open-pades-rest.component.ts)
* Template SPA (HTML): [open-pades-rest.component.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/open-pades-rest/open-pades-rest.component.html)

### Versão para impressão {#print}

Ainda não está disponível neste projeto.

### Assinatura CAdES com arquivo já no servidor {#cades}

* API Controller: [CadesSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/Controllers/CadesSignatureRestController.cs)
* Componente SPA (TypeScript): [cades-signature-rest.component.ts](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/cades-signature-rest/cades-signature-rest.component.ts)
* Template SPA (HTML): [cades-signature-rest.component.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/cades-signature-rest/cades-signature-rest.component.html)

### Assinatura CAdES com upload do arquivo pelo usuário {#cades-upload}

* Ainda não está disponível neste projeto, mas você pode consultar esta implementação antiga no [Rest PKI Samples](https://github.com/LacunaSoftware/RestPkiSamples):

Depois que o upload do arquivo (que é grosseiramente implementado apenas para fins de demonstração no [UploadController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/Java/sample-spring-mvc/src/main/java/sample/controller/UploadController.java)),template [upload.html](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/AspNetCore/CoreWebApp/wwwroot/views/upload.html)
and API Controller [UploadController](https://github.com/LacunaSoftware/RestPkiSamples/blob/master/CSharp/AspNetCore/CoreWebApp/Controllers/UploadController.cs)) é feito 
o fluxo de controle é o mesmo que na amostra [CAdES signature with file already on server](#cades), mas com parâmetro de URL `userfile` preenchidos.

### Assinatura conjunta CAdES {#cades-cosign}

Após o fluxo de controle da amostra [CAdES signature with file already on server](#cades) está concluído e o link *Co-sign with another certificate* é clicado, o mesmo fluxo de controle é 
repetido, mas agora com parâmetro de URL `cmsfile` preenchidos.

### Assinatura CAdES usando chave do servidor {#cades-server}

Ainda não está disponível neste projeto.

### Abrir/validar uma assinatura CAdES existente {#open-cades}

Ainda não está disponível neste projeto.

### Assinatura XML do documento inteiro {#xml-full}

* API Controller: [XmlSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/Controllers/XmlSignatureRestController.cs)
* Componente SPA (TypeScript): [xml-signature-rest.component.ts](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/xml-signature-rest/xml-signature-rest.component.ts)
* Template SPA (HTML): [xml-signature-rest.component.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/xml-signature-rest/xml-signature-rest.component.html)

### Assinatura XML de um elemento {#xml-element}

* API Controller: [XmlNFeSignatureRestController](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/Controllers/XmlNFeSignatureRestController.cs)
* Componente SPA (TypeScript): [xml-nfe-signature-rest.component.ts](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/xml-nfe-signature-rest/xml-nfe-signature-rest.component.ts)
* Template SPA (HTML): [xml-nfe-signature-rest.component.html](https://github.com/LacunaSoftware/PkiSuiteSamples/blob/master/dotnet/spa/PkiSuiteAspNetSpaSample/ClientApp/src/app/components/xml-nfe-signature-rest/xml-nfe-signature-rest.component.html)

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