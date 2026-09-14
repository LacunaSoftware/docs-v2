---
sidebar_label: "Criar documentos"
sidebar_position: 1
slug: /signer/integration/documents
---

# Criar documentos

Criar um documento no Signer envolve dois passos: **enviar o arquivo** (upload) e **criar o documento** definindo o fluxo de participantes. A partir daí, o Signer notifica automaticamente os participantes na ordem definida.

## Passo a passo

### 1. Upload do arquivo

Faça o upload do arquivo a ser assinado usando a [API de Upload (POST /api/uploads)](https://www.dropsigner.com/swagger/index.html#operations-Upload-post_api_uploads). O arquivo deve ser enviado com uma requisição [multipart/form-data](https://ec.haxx.se/http/http-multipart). Será retornado um ID de upload que identifica aquele arquivo:

```javascript
{
    ...
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

:::tip Upload em Base64
Alternativamente, use a [API simplificada de Upload (POST /api/uploads/bytes)](https://www.dropsigner.com/swagger/index.html#operations-Upload-post_api_uploads_bytes), na qual os bytes podem ser enviados em formato Base64.
:::

### 2. Criação do documento

Crie um documento a partir do upload usando a [API de Criação de Documentos](https://www.dropsigner.com/swagger/index.html#operations-Documents-post_api_documents). Nessa chamada você monta o **fluxo do documento**, isto é, define os participantes e em qual ordem devem tomar suas ações:

```javascript
POST /api/documents

{
    "files": [
    {
        "displayName": "Contrato Integração", //Nome que será dado ao documento criado
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", //ID do upload
        "name": "Contrato.pdf", //Nome do arquivo original
        "contentType": "application/pdf" //mime type do arquivo original
    }
    ],
    "flowActions": [
    {
        "type": "Signer", //Tipo do participante, nesse caso, assinante
        "step": 1, //Ordem de assinatura
        "user": {
        "name": "John Wick", //Nome do participante
        "identifier": "81976153069", //CPF do participante
        "email": "john.wick@mailinator.com", //Email do participante
        },
        "allowElectronicSignature": true //Permite assinatura eletrônica
    }
    ]
}
```

A resposta retorna o ID do documento criado associado ao ID do upload, assim você sabe exatamente qual documento corresponde a qual upload:

```javascript
[
    {
    "uploadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "documentId": "b12cb1b2-5d6e-40b2-a050-097d068c4c11"
    }
]
```

:::tip
Você pode criar mais de um documento na mesma chamada, adicionando quantos arquivos forem necessários. Nesse caso, todos os documentos terão o mesmo fluxo.
:::

Ao criar o documento, o Signer notifica automaticamente os participantes seguindo a ordem especificada. Cada participante receberá um e-mail com um link que permite assinar ou aprovar o documento sem precisar de autenticação.

## O fluxo (`flowActions`)

Cada item de `flowActions` representa uma ação de um participante. Os principais campos são:

| Campo | Descrição |
| --- | --- |
| `type` | Tipo da ação (veja a tabela abaixo) |
| `step` | Ordem da ação no fluxo. Ações com o mesmo `step` acontecem em paralelo; `step`s diferentes são executados em sequência |
| `user` | Dados do participante (`name`, `identifier`, `email`) |
| `allowElectronicSignature` | Permite que o participante assine eletronicamente (sem certificado digital) |

Os tipos de ação (`type`) disponíveis são:

| `type` | Descrição |
| --- | --- |
| `Signer` | Participante que **assina** o documento |
| `Approver` | Participante que **aprova** o documento (sem assinar) |
| `SignRule` | Regra de assinatura: um grupo em que qualquer membro pode assinar |
| `ApproverRule` | Regra de aprovação: um grupo em que qualquer membro pode aprovar |

**Exemplos no GitHub**, por cenário:

| Cenário | Exemplos |
| --- | --- |
| Um assinante | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithOneSignerScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithOneSignerScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithOneSignerScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithOneSignerScenario.ts) |
| Dois ou mais assinantes, com ordenação | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithTwoOrMoreSignersWithOrderScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithTwoOrMoreSignersWithOrderScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithTwoOrMoreSignersWithOrderScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithTwoOrMoreSignersWithOrderScenario.ts) |
| Dois ou mais assinantes, sem ordenação | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithTwoOrMoreSignersWithoutOrderScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithTwoOrMoreSignersWithoutOrderScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithTwoOrMoreSignersWithoutOrderScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithTwoOrMoreSignersWithoutOrderScenario.ts) |
| Com aprovação | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithApproversScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithApproversScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithApproversScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithApproversScenario.ts) |
| Com anexo | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithAttachmentScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithAttachmentScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithAttachmentScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithAttachmentScenario.ts) |
| Com descrição | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithDescriptionScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithDescriptionScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithDescriptionScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithDescriptionScenario.ts) |

## Assinatura na sua própria aplicação

Caso você queira realizar a assinatura do documento dentro da sua própria aplicação, use a opção de **Assinatura Embutida**.

Siga os mesmos passos da seção anterior, mas, ao enviar o documento, recomenda-se adicionar o parâmetro `disablePendingActionNotifications` com valor `true`. Dessa forma, não serão enviadas notificações para os participantes.

Após a criação do documento, utilize o ID do documento para obter a URL de assinatura usando a [API de URL de Ação](https://www.dropsigner.com/swagger/index.html#operations-Documents-post_api_documents__id__action_url):

```javascript
POST /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/action-url

{
    //devem ser enviadas informações que identifiquem o participante desejado
    "identifier": "81976153069",
    "emailAddress": "john.wick@mailinator.com"
}
```

Caso o signatário tenha permitido assinatura eletrônica (parâmetro `allowElectronicSignature = true`), é possível exigir a confirmação do e-mail dele por meio de um código de acesso no momento da assinatura. Para isso, defina `requireEmailAuthentication` como `true`:

```javascript
POST /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/action-url

{
    //devem ser enviadas informações que identifiquem o participante desejado
    "identifier": "81976153069",
    "emailAddress": "john.wick@mailinator.com",
    //se a assinatura for eletrônica e esse parâmetro for true, requer confirmação de e-mail com código para completar a assinatura
    "requireEmailAuthentication": true
}
```

A resposta apresenta duas URLs:

```javascript
{
    //URL para redirecionar o usuário para a página de assinatura no Signer
    "url": "https://...",
    //URL para usar com o Widget de assinatura
    "embedUrl": "https://..."
}
```

Use a `embedUrl` com o **Widget de assinatura** para exibir a página de assinatura do Signer dentro da sua aplicação. A página [Assinatura embutida](/signer/embedded-signature) descreve como utilizar o *Widget*.

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/EmbeddedSignatureScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/EmbeddedSignatureScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/EmbeddedSignatureScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/embeddedSignatureScenario.ts)

## Pré-posicionar uma assinatura no documento

Durante a criação de um documento, é possível posicionar a assinatura de cada participante em um local específico do documento. Todas as definições são feitas durante a criação do `flowAction`: há opções para definir a página e a localização da assinatura dentro dela.

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithPositionedSignaturesScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithPositionedSignaturesScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithPositionedSignaturesScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithPositionedSignaturesScenario.ts)

## Mesclar múltiplos arquivos em um único documento (envelope)

É possível fazer o upload de múltiplos arquivos e mesclar todos em um só documento (envelope). Para isso, adicione o parâmetro `isEnvelope=true` e um nome de envelope em `EnvelopeName`.

:::caution
A mesclagem só funciona se **todos os arquivos enviados forem PDFs**.
:::

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithEnvelopeScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithEnvelopeScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithEnvelopeScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithEnvelopeScenario.ts)

## Próximos passos

Com o documento criado, veja como [acompanhar o status e enviar lembretes](/signer/integration/tracking).
