---
sidebar_label: "Ciclo de vida"
sidebar_position: 5
slug: /signer/integration/lifecycle
---

# Ciclo de vida do documento

Além de criar e acompanhar, você pode realizar operações ao longo da vida do documento: cancelar, recusar, enviar uma nova versão ou deletar.

## Cancelar documento

Para cancelar um documento, envie o ID do documento em uma requisição `POST` junto ao campo `reason`:

```javascript
POST /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/cancellation

{
    "reason": "This is a document cancellation"
}
```

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CancelDocumentScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CancelDocumentScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CancelDocumentScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/cancelDocumentScenario.ts)

## Recusar documento

Para recusar um documento, envie o ID do documento em uma requisição `POST` junto ao campo `reason`:

```javascript
POST /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/refusal

{
    "reason": "This is a document refusal"
}
```

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/RefuseDocumentScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/RefuseDocumentScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/RefuseDocumentScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/refuseDocumentScenario.ts)

## Enviar nova versão do documento

É possível enviar uma nova versão de um documento já criado. Para isso, envie o ID do documento em uma requisição `POST` junto ao arquivo da nova versão.

:::caution
Ao enviar uma nova versão, o **fluxo de assinaturas é reiniciado**.
:::

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/AddNewDocumentVersionScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/AddNewDocumentVersionScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/AddNewDocumentVersionScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/addNewDocumentVersionScenario.ts)

## Deletar documento

Para deletar um documento, você precisa do ID dele e faz uma chamada do tipo `DELETE`:

```javascript
DELETE /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11
```

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/DeleteDocumentScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/DeleteDocumentScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/DeleteDocumentScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/deleteDocumentScenario.ts)
