---
sidebar_label: "Baixar e listar"
sidebar_position: 3
slug: /signer/integration/download-and-list
---

# Baixar e listar documentos

## Download das versões de um documento

A partir do momento em que um documento é criado, é possível baixar diferentes versões dele, de acordo com o estágio em que ele se encontra. Utilize a [API de Download de Documentos](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents__id__content), informando o tipo desejado no parâmetro `type`:

```javascript
GET /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/content?type=Original
```

### Tipos de versão (`type`)

| `type` | Descrição |
| --- | --- |
| `Original` | Arquivo original enviado |
| `Signatures` | Arquivo assinado |
| `PrinterFriendlyVersion` | Versão para impressão |
| `SigningTags` | Etiquetas de assinatura |
| `SignatureMarks` | Marcas de assinatura |
| `OriginalWithMarks` | Arquivo original com as marcas de assinatura |
| `SignaturesManifest` | Manifesto de assinaturas |

:::note Formato de retorno
Existem dois métodos com tipos de retorno diferentes: um retorna uma `Stream` de dados referente ao documento e o outro retorna o documento em um vetor de `bytes[]`.
:::

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/DownloadDocumentVersionScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/DownloadDocumentVersionScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/DownloadDocumentVersionScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/downloadDocumentVersionScenario.ts)

## Listar documentos

É possível listar os documentos de acordo com diferentes padrões e necessidades. Os parâmetros disponíveis estão descritos na [API de Listagem de Documentos](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents). Entre os tipos de listagem possíveis:

* Documentos pendentes para um determinado participante
* Documentos concluídos
* Listar por pastas
* Listar por organização

**Exemplos no GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/ListDocumentsScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/ListDocumentsScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/ListDocumentsScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/listDocumentScenario.ts)
