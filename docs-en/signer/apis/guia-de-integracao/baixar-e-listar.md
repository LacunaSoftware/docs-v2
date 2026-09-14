---
sidebar_label: "Download and list"
sidebar_position: 3
slug: /signer/integration/download-and-list
---

# Download and list documents

## Download document versions

Once a document has been created, it is possible to download different versions of it, according to the stage it is in. Use the [Document Download API](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents__id__content), providing the desired type in the `type` parameter:

```javascript
GET /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/content?type=Original
```

### Version types (`type`)

| `type` | Description |
| --- | --- |
| `Original` | Original uploaded file |
| `Signatures` | Signed file |
| `PrinterFriendlyVersion` | Printer friendly version |
| `SigningTags` | Signing tags |
| `SignatureMarks` | Signature marks |
| `OriginalWithMarks` | Original file with the signature marks |
| `SignaturesManifest` | Signatures manifest |

:::note Return format
There are two methods with different return types: one returns the document as a `Stream` of data and the other returns the document as a vector of `bytes[]`.
:::

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/DownloadDocumentVersionScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/DownloadDocumentVersionScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/DownloadDocumentVersionScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/downloadDocumentVersionScenario.ts)

## List documents

It is possible to list documents according to different patterns and needs. The available parameters are described in the [Document Listing API](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents). Among the possible listing types:

* Pending documents for a particular participant
* Concluded documents
* List by folders
* List by organizations

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/ListDocumentsScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/ListDocumentsScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/ListDocumentsScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/listDocumentScenario.ts)
