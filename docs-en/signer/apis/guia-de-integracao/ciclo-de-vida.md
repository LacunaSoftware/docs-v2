---
sidebar_label: "Lifecycle"
sidebar_position: 5
slug: /signer/integration/lifecycle
---

# Document lifecycle

Beyond creating and tracking, you can perform operations throughout the document's life: cancel, refuse, submit a new version or delete.

## Cancel document

To cancel a document, send the document ID in a `POST` request with the `reason` field:

```javascript
POST /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/cancellation

{
    "reason": "This is a document cancellation"
}
```

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CancelDocumentScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CancelDocumentScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CancelDocumentScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/cancelDocumentScenario.ts)

## Refuse a document

To refuse a document, send the document ID in a `POST` request with the `reason` field:

```javascript
POST /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/refusal

{
    "reason": "This is a document refusal"
}
```

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/RefuseDocumentScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/RefuseDocumentScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/RefuseDocumentScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/refuseDocumentScenario.ts)

## Submit a new document version

It is possible to upload a new version of an already created document. To do so, send the document ID in a `POST` request along with the new version's file.

:::caution
When submitting a new version, the **signing flow is reset**.
:::

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/AddNewDocumentVersionScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/AddNewDocumentVersionScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/AddNewDocumentVersionScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/addNewDocumentVersionScenario.ts)

## Delete document

To delete a document, you need its ID and make a `DELETE` request:

```javascript
DELETE /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11
```

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/DeleteDocumentScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/DeleteDocumentScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/DeleteDocumentScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/deleteDocumentScenario.ts)
