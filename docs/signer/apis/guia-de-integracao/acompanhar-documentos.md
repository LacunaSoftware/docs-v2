---
sidebar_label: "Acompanhar documentos"
sidebar_position: 2
slug: /signer/integration/tracking
---

# Acompanhar documentos

Depois de criar um documento, você acompanha o andamento dele de duas formas: **consultando o status** ativamente (polling) ou **recebendo notificações** por webhook quando algo acontece. Também é possível enviar lembretes aos participantes que ainda não agiram.

## Verificar o status de um documento {#check-document}

Para verificar o status de um documento é preciso conhecer o seu ID. Em seguida, faça uma chamada à [API de Detalhes do Documento](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents__id_):

```javascript
GET /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11

{
    "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "name": "Contrato Integração",
    "status": "Concluded",
    "creationDate": "2019-08-18T16:26:03.372Z",
    "updateDate": "2019-08-18T16:26:03.372Z",
    ...
    "flowActions": [
        {
            "id": "4bf61c68-eaf1-455f-b4a1-6141554f1dae",
            "type": "Signer",
            "status": "Completed",
            "step": 1,
            ...
            "user":
            {
                "id": "4d961566-9b03-450c-b144-930e0294bac2",
                "name": "John Wick",
                "identifier": "81976153069",
                "email": "john.wick@mailinator.com"
            },
            "title": "Parte",
            "allowElectronicSignature": true
        }
    ]
}
```

* Para saber se o documento está concluído, verifique se a propriedade `status` corresponde a `Concluded`.
* Para saber se um participante assinou/aprovou, verifique se a propriedade `status` corresponde a `Completed` no elemento correspondente da lista `flowActions`.

### Status do documento

A propriedade `status` do documento pode assumir os seguintes valores:

| Status | Significado |
| --- | --- |
| `Pending` | Aguardando ações dos participantes |
| `FlowConcluded` | Todas as ações do fluxo foram concluídas (processamento final em andamento) |
| `Concluded` | Documento concluído |
| `Refused` | Documento recusado por um participante |
| `Canceled` | Documento cancelado |
| `Expired` | Documento expirado |

### Status da ação do participante

Cada item de `flowActions` tem seu próprio `status`:

| Status | Significado |
| --- | --- |
| `Created` | Ação criada, ainda não liberada para o participante (aguardando etapa anterior) |
| `Pending` | Aguardando a ação do participante |
| `Completed` | Participante concluiu a ação (assinou/aprovou) |
| `Refused` | Participante recusou |

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CheckDocumentStatusScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CheckDocumentStatusScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CheckDocumentStatusScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/checkDocumentStatusScenario.ts)

## Enviar lembretes de assinatura

Uma vez verificado o status de um participante, você pode enviar lembretes periódicos aos participantes que ainda não completaram uma ação, usando a [API de Envio de Lembretes](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents__id_). Informe o ID do documento e o ID da ação do participante (`flowActionId`):

```javascript
POST /api/notifications/flow-action-reminder

{
    "documentId": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "flowActionId": "4bf61c68-eaf1-455f-b4a1-6141554f1dae"
}
```

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/NotifyFlowParticipantsScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/NotifyFlowParticipantsScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/NotifyFlowParticipantsScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/notifyFlowParticipantsScenario.ts)

## Webhooks

Em vez de consultar o status repetidamente, você pode configurar um **Webhook** que será disparado toda vez que um documento da sua organização for concluído, aprovado, recusado ou assinado. Para isso, acesse a tela da Organização e registre a URL desejada na opção **Integração**:

![Webhook](/images/signer/org-webhook.png)

Veja [Webhooks](/signer/webhooks) para a lista completa de eventos, o formato do payload de cada um e o comportamento de entrega (autenticação, retentativas e ordem).

## Próximos passos

Quando o documento estiver concluído, veja como [baixar e listar documentos](/signer/integration/download-and-list).
