---
sidebar_label: "Webhooks"
sidebar_position: 4
slug: /signer/webhooks
---

# Webhooks

## Introdução

Um **webhook** é uma URL da sua aplicação que o Signer chama, por `POST`, sempre que algo acontece com os
documentos da sua organização: um documento foi assinado, aprovado, recusado, concluído, cancelado,
expirou ou foi excluído.

É a forma recomendada de acompanhar documentos. Em vez de consultar `GET /api/documents/{id}`
repetidamente (*polling*), sua aplicação é avisada assim que o evento ocorre.

## Cadastrando um webhook

### Pela tela do Signer

Acesse a tela da **Organização**, seção **Integração**, e registre a URL desejada:

![Webhook](/images/signer/org-webhook.png)

### Pela API

| Operação | Endpoint |
|---|---|
| Criar | `POST /api/organizations/{orgId}/webhooks` |
| Alterar | `PUT /api/organizations/{orgId}/webhooks/{webhookId}` |
| Remover | `DELETE /api/organizations/{orgId}/webhooks/{webhookId}` |
| Listar | Os webhooks cadastrados vêm no campo `webhooks` dos detalhes da organização (`GET /api/organizations/{orgId}`) |

Corpo da requisição de criação e alteração:

```json
{
  "url": "https://suaaplicacao.com.br/integracoes/signer",
  "authType": "Bearer",
  "token": "um-segredo-longo-e-aleatorio"
}
```

A criação devolve o `id` do webhook, que é o `webhookId` usado para alterar ou remover.

:::note
* Uma organização pode ter vários webhooks, e todos recebem todos os eventos. O limite é definido pela
  configuração `MaxWebhooksPerOrganization` da instância (padrão: **5**); ao ultrapassá-lo a API responde
  com o erro `MaxWebhooksLimitReached`.
* Webhooks não estão disponíveis em **organizações pessoais** (erro
  `OperationNotSupportedInPersonalOrganizations`).
:::

## Autenticando a chamada

O Signer não assina o corpo da requisição. A autenticação é feita por um cabeçalho que você escolhe no
cadastro, com o valor informado em `token`:

| `authType` | Cabeçalho enviado |
|---|---|
| `NoAuth` | Nenhum |
| `Basic` | `Authorization: Basic <token>` |
| `Bearer` | `Authorization: Bearer <token>` |
| `ApiKey` | `X-Api-Key: <token>` |

:::warning
O `token` é enviado **exatamente como cadastrado**. No modo `Basic`, o Signer não codifica nada: você deve
cadastrar o valor já em Base64 de `usuario:senha`.

Use sempre HTTPS e um `authType` diferente de `NoAuth`, e valide o cabeçalho recebido antes de processar o
evento. Sem isso, qualquer um que descubra a sua URL pode enviar eventos falsos.
:::

## Formato da requisição

O Signer envia um `POST` com `Content-Type: application/json` (UTF-8). O corpo é sempre um envelope com o
tipo do evento e os dados específicos daquele tipo:

```json
{
  "type": "DocumentConcluded",
  "data": { }
}
```

Os nomes dos campos são em *camelCase* e os valores de enumerações são enviados como **texto**, por
exemplo `"DocumentConcluded"` e não `1`.

## Eventos

| `type` | Quando dispara |
|---|---|
| `DocumentsCreated` | Documentos foram criados (um evento pode trazer vários documentos) |
| `DocumentSigned` | Um participante assinou o documento |
| `DocumentApproved` | Um participante aprovou o documento |
| `DocumentRefused` | Um participante recusou o documento |
| `DocumentConcluded` | O fluxo terminou: todas as ações foram concluídas |
| `DocumentCanceled` | O documento foi cancelado |
| `DocumentExpired` | O documento atingiu a data de expiração sem ser concluído |
| `DocumentDeleted` | Documentos foram excluídos |
| `InvoiceClosed` | Uma fatura foi fechada (evento de faturamento, veja a observação abaixo) |

:::note
O tipo do evento de exclusão é `DocumentDeleted`, no singular, mas o `data` traz uma **lista** de
documentos.

O evento `InvoiceClosed` não é configurado por organização: ele usa o webhook de **faturamento da
instância**, configurado pelo administrador do sistema. Os demais eventos são por organização.
:::

### Campos comuns dos eventos de documento

Todo evento de documento traz, dentro de `data`, as informações básicas do documento:

```json
{
  "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
  "name": "Contrato de prestação de serviços",
  "creationDate": "2026-09-10T13:02:11.482Z",
  "updateDate": "2026-09-10T14:27:35.115Z",
  "folder": {
    "id": "0a9e1f3c-2b44-4f6a-9d0e-77c1b8a4e510",
    "name": "Contratos 2026",
    "parentId": null,
    "organizationName": "Acme S.A."
  },
  "organization": {
    "id": "5f2c9a71-3e8d-4a12-bb90-6d4e2f1c8a33",
    "name": "Acme S.A.",
    "identifier": "11222333000181",
    "owner": null
  },
  "createdBy": {
    "id": "4d961566-9b03-450c-b144-930e0294bac2",
    "name": "Integração ERP"
  }
}
```

`folder` é `null` quando o documento não está em uma pasta, e `organization` é `null` em documentos
pessoais.

### Campos adicionais por evento

**`DocumentSigned`** acrescenta `signature`, com os dados de quem assinou:

```json
{
  "type": "DocumentSigned",
  "data": {
    "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "name": "Contrato de prestação de serviços",
    "signature": {
      "flowActionId": "4bf61c68-eaf1-455f-b4a1-6141554f1dae",
      "date": "2026-09-10T14:27:35.115Z",
      "userId": "8c3a1d90-77b5-4e2f-9a61-0f5d2b7c4e88",
      "name": "John Wick",
      "identifier": "81976153069",
      "emailAddress": "john.wick@mailinator.com"
    }
  }
}
```

**`DocumentApproved`** usa a mesma estrutura, no campo `approval`.

**`DocumentRefused`** traz o campo `refusal`, com os mesmos campos mais o motivo informado:

```json
{
  "type": "DocumentRefused",
  "data": {
    "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "refusal": {
      "flowActionId": "4bf61c68-eaf1-455f-b4a1-6141554f1dae",
      "date": "2026-09-10T15:11:02.700Z",
      "userId": "8c3a1d90-77b5-4e2f-9a61-0f5d2b7c4e88",
      "name": "John Wick",
      "identifier": "81976153069",
      "emailAddress": "john.wick@mailinator.com",
      "reason": "Valor divergente na cláusula 4"
    }
  }
}
```

**`DocumentConcluded`** traz apenas os campos comuns, sem campos adicionais.

**`DocumentCanceled`** acrescenta `canceledBy`, com o usuário ou aplicação que cancelou (`id`, `name` e
`type`), e `reason`.

**`DocumentExpired`** acrescenta `expirationDate` e `expirationDateWithoutTime`, este último no formato
`yyyy-MM-dd`, conveniente para exibição.

**`DocumentsCreated`** traz em `data` a lista `documents`, cada item com os campos comuns:

```json
{
  "type": "DocumentsCreated",
  "data": {
    "documents": [
      { "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11", "name": "Contrato 1" },
      { "id": "c98a2f14-1d3b-4c77-8e05-2a6b9d1f4e62", "name": "Contrato 2" }
    ]
  }
}
```

**`DocumentDeleted`** traz a lista `documents` e o campo `action`, indicando o que originou a exclusão:

| `action` | Significado |
|---|---|
| `DeletedByUserOrApplication` | Exclusão feita por um usuário ou aplicação |
| `DeletedByOrganization` | Exclusão em massa da organização |
| `DeletedByFolder` | Exclusão de uma pasta que continha os documentos |

:::note
Em `DeletedByOrganization` e `DeletedByFolder` a lista `documents` é limitada a **100 documentos**, mesmo
que mais documentos tenham sido excluídos.
:::

**`InvoiceClosed`** traz em `data` os campos `id`, `month`, `year`, `value`, `invoiceTotals` (totais por
tipo de transação), `organization`, `billingInformation` e `totalStorageUsed`, este último o
armazenamento total utilizado, em bytes.

## Entrega, retentativas e ordem

Entender esta seção evita a maior parte dos problemas de integração por webhook.

**A entrega é assíncrona.** Cada evento é enviado por um processo em segundo plano, em fila de baixa
prioridade, e não no mesmo instante da ação do usuário. Um pequeno atraso é normal.

**Sua aplicação deve responder 2xx.** Qualquer outro código de status, ou um erro de conexão, marca a
entrega como falha, e ela é **reagendada automaticamente**, com intervalos crescentes entre as tentativas
(por padrão, até 10 tentativas). O Signer registra em log o status e o corpo da resposta de cada falha, e
vale pedir esses registros ao administrador da instância ao investigar um problema.

**Trate entregas repetidas.** Como há retentativas, o mesmo evento pode chegar mais de uma vez. Torne o
processamento **idempotente**, usando a combinação de `type` com o `id` do documento e, quando existir, o
`flowActionId`, para reconhecer um evento já processado.

**Não há garantia de ordem.** Os eventos são entregues por processos independentes: `DocumentSigned` e
`DocumentConcluded` de um mesmo documento podem chegar fora de ordem. Quando a ordem importar, use o
estado atual do documento como fonte da verdade, consultando `GET /api/documents/{id}`.

**Cada webhook é independente.** Se a organização tem mais de um webhook cadastrado, o evento é enviado a
todos eles separadamente, e a falha em um não afeta os demais.

## Boas práticas

* Responda `200` **imediatamente** e processe o evento depois, de forma assíncrona. Endpoints lentos geram
  *timeouts* e retentativas desnecessárias.
* Valide o cabeçalho de autenticação em toda requisição recebida.
* Trate o payload como uma **notificação**, não como fonte da verdade. Antes de uma ação sensível, como
  liberar um pagamento, confirme o estado do documento pela API.
* Mantenha a URL estável e alcançável. O Signer precisa chegar até ela pela internet ou, em instalações
  *on premises*, pela rede onde o servidor está.
* Registre os eventos recebidos, o que ajuda a diagnosticar divergências entre o seu sistema e o Signer.

## Veja também

* [Primeiros passos](get-started.md)
* [Guia de Integração](guia-de-integracao/index.md)
* [Verificar o status de um documento](guia-de-integracao/acompanhar-documentos.md#check-document)
