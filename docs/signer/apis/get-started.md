---
sidebar_label: "Primeiros passos"
sidebar_position: 0
slug: /signer/get-started
---

# Primeiros passos com a API do Signer

Este guia leva você **do zero ao primeiro documento assinado** usando a API do Signer. São seis passos e
leva cerca de 15 minutos. Ao final você terá criado um documento por API, coletado uma assinatura e
baixado o arquivo assinado.

A referência completa de todos os casos de uso está no [Guia de Integração](guia-de-integracao/index.md).

## Antes de começar

Você vai precisar de:

* Acesso a uma instância do Signer, seja a versão SaaS em [dropsigner.com](https://www.dropsigner.com/) ou
  uma instância [*on premises*](../on-premises/index.md).
* Uma **organização**, já que chaves de API pertencem sempre a uma organização.
* Permissão para criar aplicações naquela organização.
* Um arquivo PDF qualquer para testar.

:::note
Nos exemplos deste guia a URL base é `https://www.dropsigner.com`. Se você usa uma instância própria,
troque pela URL da sua instância, por exemplo `https://signer.suaempresa.com.br`.
:::

## Passo 1: Crie a aplicação e a chave de API

Na organização desejada, acesse **Aplicações** e crie uma aplicação:

![Aplicações](/images/signer/applications.png)

Em seguida, gere a chave clicando no botão **Chaves**:

![Chaves da aplicação](/images/signer/application-keys.png)

![Adicionar chave](/images/signer/application-keys-add.png)

![Confirmar criação da chave](/images/signer/create-key.png)

A chave tem o formato `nome-da-aplicacao|<chave>` e deve ser enviada no cabeçalho `X-Api-Key` de **todas**
as requisições:

```
X-Api-Key: sua-aplicacao|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

:::warning
A chave é exibida **uma única vez**, no momento da criação. Guarde-a em um cofre de segredos, porque uma
chave perdida não pode ser recuperada, apenas substituída por uma nova. O escopo da chave é restrito à
organização em que foi criada: ela só enxerga e cria documentos daquela organização.
:::

Confirme que a chave funciona listando os documentos da organização:

```bash
curl -i "https://www.dropsigner.com/api/documents" -H "X-Api-Key: sua-aplicacao|SUA_CHAVE"
```

Uma resposta `401` ou `403` indica chave inválida, revogada ou de outra organização.

## Passo 2: Envie o arquivo

O arquivo é enviado antes do documento e recebe um identificador de upload, que será usado no passo
seguinte. A forma mais simples é enviar os bytes em Base64:

```bash
curl -X POST "https://www.dropsigner.com/api/uploads/bytes" -H "X-Api-Key: sua-aplicacao|SUA_CHAVE" -H "Content-Type: application/json" -d "{\"bytes\": \"$(base64 -w0 contrato.pdf)\"}"
```

Resposta:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "size": 48213,
  "digest": "9bT1kQ2s3d4F5g6H7j8K9l=="
}
```

O campo `id` é o **ID do upload**. O `digest` é o MD5 do arquivo recebido e serve para conferir a
integridade do que chegou ao servidor.

:::tip
Para arquivos grandes, prefira o upload `multipart/form-data` em `POST /api/uploads`, que evita o custo de
transportar o arquivo em Base64.
:::

## Passo 3: Crie o documento

Agora crie o documento a partir do upload, definindo o fluxo: quem participa e em que ordem.

```bash
curl -X POST "https://www.dropsigner.com/api/documents" \
  -H "X-Api-Key: sua-aplicacao|SUA_CHAVE" \
  -H "Content-Type: application/json" \
  --data-binary @documento.json
```

Conteúdo de `documento.json`:

```json
{
  "files": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "displayName": "Contrato de prestação de serviços",
      "name": "contrato.pdf",
      "contentType": "application/pdf"
    }
  ],
  "flowActions": [
    {
      "type": "Signer",
      "step": 1,
      "user": {
        "name": "John Wick",
        "identifier": "81976153069",
        "email": "john.wick@mailinator.com"
      },
      "allowElectronicSignature": true
    }
  ]
}
```

A resposta traz um item por arquivo enviado, relacionando o upload ao documento criado:

```json
[
  {
    "uploadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "documentId": "b12cb1b2-5d6e-40b2-a050-097d068c4c11"
  }
]
```

Entendendo os campos principais:

| Campo | Para que serve |
|---|---|
| `files[].id` | ID devolvido pelo upload no passo anterior |
| `files[].displayName` | Nome do documento como ele aparece no Signer |
| `files[].name` / `files[].contentType` | Nome e *mime type* do arquivo original |
| `flowActions[].type` | `Signer`, `Approver`, `SignRule` ou `ApproverRule` |
| `flowActions[].step` | Ordem no fluxo. Participantes no mesmo `step` agem em paralelo, e um `step` maior só é notificado quando o anterior termina |
| `flowActions[].user` | Identificação do participante (`name`, `identifier`, `email`) |
| `flowActions[].allowElectronicSignature` | Permite assinatura eletrônica, sem certificado digital |

:::tip
Você pode enviar vários arquivos na mesma chamada. Cada um vira um documento, todos com o mesmo fluxo.
Para agrupar vários PDFs em um único documento, use `isEnvelope: true` junto com `envelopeName`.
:::

Assim que o documento é criado, o Signer envia automaticamente o e-mail de notificação aos participantes
do primeiro passo. Para não notificar ninguém nesse momento, como acontece quando a assinatura vai ocorrer
dentro da sua própria aplicação, envie `disablePendingActionNotifications: true`.

## Passo 4: Assine o documento

**Pela notificação (padrão).** O participante recebe um e-mail com um link que abre a tela de assinatura.
Não é preciso ter conta nem se autenticar no Signer para assinar.

**Dentro da sua aplicação.** Peça a URL de ação daquele participante e redirecione (ou embuta) o usuário:

```bash
curl -X POST "https://www.dropsigner.com/api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/action-url" \
  -H "X-Api-Key: sua-aplicacao|SUA_CHAVE" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\": \"81976153069\", \"emailAddress\": \"john.wick@mailinator.com\"}"
```

Para esse caso, combine com `disablePendingActionNotifications: true` na criação. A página
[Assinatura Embutida](embedded-signature.md) mostra como embutir a tela de assinatura na sua própria
página.

## Passo 5: Acompanhe o status

```bash
curl "https://www.dropsigner.com/api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11" -H "X-Api-Key: sua-aplicacao|SUA_CHAVE"
```

```json
{
  "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
  "name": "Contrato de prestação de serviços",
  "status": "Concluded",
  "flowActions": [
    {
      "id": "4bf61c68-eaf1-455f-b4a1-6141554f1dae",
      "type": "Signer",
      "status": "Completed",
      "step": 1,
      "user": { "name": "John Wick", "identifier": "81976153069" }
    }
  ]
}
```

* O documento está finalizado quando `status` é `Concluded`.
* Um participante concluiu sua ação quando o `status` da `flowAction` dele é `Completed`.

:::warning
Não use esta chamada em *polling* para saber quando o documento ficou pronto. Em produção, cadastre um
[Webhook](webhooks.md) e deixe o Signer avisar a sua aplicação.
:::

## Passo 6: Baixe o documento assinado

```bash
curl -L "https://www.dropsigner.com/api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/content?type=Signatures" -H "X-Api-Key: sua-aplicacao|SUA_CHAVE" -o contrato-assinado.pdf
```

O parâmetro `type` escolhe qual versão baixar:

| `type` | O que é devolvido |
|---|---|
| `Signatures` | **O arquivo assinado**, ou seja, o PDF com as assinaturas embutidas (ou um `.p7s`, quando a assinatura é CAdES) |
| `Original` | O arquivo original, como foi enviado |
| `OriginalWithMarks` | O original com as marcas de assinatura carimbadas |
| `PrinterFriendlyVersion` | Versão para impressão, em PDF, com o manifesto de assinaturas |
| `SignaturesManifest` | Apenas o manifesto de assinaturas, em PDF |
| `SignatureMarks` | PDF com as representações visuais das assinaturas |
| `SigningTags` | PDF com as etiquetas de assinatura |

:::note
Documentos **cancelados, expirados ou recusados** só permitem baixar `Original` e `PrinterFriendlyVersion`;
os demais tipos retornam erro. O download de documentos recusados pode ser liberado por configuração da
instância.
:::

Se precisar dos bytes em JSON em vez de um *download*, use `GET /api/documents/{id}/content-b64`, que
devolve `name`, `contentType` e os `bytes` em Base64.

## Pronto, e agora?

* [Guia de Integração](guia-de-integracao/index.md) cobre todos os casos de uso: lembretes, cancelamento, recusa,
  nova versão, validação de assinaturas, listagens e pré-posicionamento de assinaturas.
* [Webhooks](webhooks.md) mostra como receber os eventos do documento em vez de consultar o status.
* [Assinatura Embutida](embedded-signature.md) traz a tela de assinatura para dentro da sua aplicação.
* [APIs de Administração](administracao/administration.md) permitem criar e gerenciar usuários e
  organizações.
* Exemplos completos em C#, Java, PHP e Node.js estão no
  [SignerSamples](https://github.com/LacunaSoftware/SignerSamples).
