---
sidebar_label: "Create documents"
sidebar_position: 1
slug: /signer/integration/documents
---

# Create documents

Creating a document in Signer involves two steps: **uploading the file** and **creating the document** by defining the participant flow. From there, Signer automatically notifies the participants in the defined order.

## Step by step

### 1. Upload the file

Upload the file that will be signed using the [Upload API (POST /api/uploads)](https://www.dropsigner.com/swagger/index.html#operations-Upload-post_api_uploads). The file must be sent through a [multipart/form-data](https://ec.haxx.se/http/http-multipart) request. An upload ID that identifies that file will be returned:

```javascript
{
    ...
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

:::tip Base64 upload
Alternatively, use the [simplified Upload API (POST /api/uploads/bytes)](https://www.dropsigner.com/swagger/index.html#operations-Upload-post_api_uploads_bytes), where bytes can be sent in Base64 format.
:::

### 2. Create the document

Create a document from the uploaded file using the [Document Creation API](https://www.dropsigner.com/swagger/index.html#operations-Documents-post_api_documents). In this call, you assemble the **document flow**, that is, define the participants and in what order they should take their actions:

```javascript
POST /api/documents

{
    "files": [
    {
        "displayName": "Integration Contract", //Name that will be given to the created document
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6", //File's upload ID
        "name": "Contract.pdf", //Name of the original file
        "contentType": "application/pdf" //Original file mime type
    }
    ],
    "flowActions": [
    {
        "type": "Signer", //Type of participant, in this scenario, signer
        "step": 1, //Signing order
        "user": {
        "name": "John Wick", //Participant's name
        "identifier": "81976153069", //Participant's identifier number
        "email": "john.wick@mailinator.com", //Participant's email
        },
        "allowElectronicSignature": true //Allows electronic signature
    }
    ]
}
```

The response returns the ID of the created document associated with the upload ID, so you know exactly which document matches which upload:

```javascript
[
    {
    "uploadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "documentId": "b12cb1b2-5d6e-40b2-a050-097d068c4c11"
    }
]
```

:::tip
You can create more than one document in the same call, adding as many files as needed. In this case, all documents will share the same flow.
:::

When the document is created, Signer automatically notifies the participants in the specified order. Each participant receives an email with a link that lets them sign or approve the document without having to authenticate.

## The flow (`flowActions`)

Each `flowActions` item represents a participant's action. The main fields are:

| Field | Description |
| --- | --- |
| `type` | Action type (see the table below) |
| `step` | Order of the action in the flow. Actions with the same `step` happen in parallel; different `step`s run in sequence |
| `user` | Participant data (`name`, `identifier`, `email`) |
| `allowElectronicSignature` | Allows the participant to sign electronically (without a digital certificate) |

The available action types (`type`) are:

| `type` | Description |
| --- | --- |
| `Signer` | Participant who **signs** the document |
| `Approver` | Participant who **approves** the document (without signing) |
| `SignRule` | Signing rule: a group in which any member can sign |
| `ApproverRule` | Approval rule: a group in which any member can approve |

**Examples on GitHub**, by scenario:

| Scenario | Examples |
| --- | --- |
| One signer | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithOneSignerScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithOneSignerScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithOneSignerScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithOneSignerScenario.ts) |
| Two or more signers, with order | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithTwoOrMoreSignersWithOrderScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithTwoOrMoreSignersWithOrderScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithTwoOrMoreSignersWithOrderScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithTwoOrMoreSignersWithOrderScenario.ts) |
| Two or more signers, without order | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithTwoOrMoreSignersWithoutOrderScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithTwoOrMoreSignersWithoutOrderScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithTwoOrMoreSignersWithoutOrderScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithTwoOrMoreSignersWithoutOrderScenario.ts) |
| With approver | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithApproversScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithApproversScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithApproversScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithApproversScenario.ts) |
| With attachment | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithAttachmentScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithAttachmentScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithAttachmentScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithAttachmentScenario.ts) |
| With description | [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithDescriptionScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithDescriptionScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithDescriptionScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithDescriptionScenario.ts) |

## Signing in your own application

If you want to sign the document inside your own application, use the **Embedded Signature** option.

Follow the same steps from the previous section, but, when sending the document, it is recommended to add the parameter `disablePendingActionNotifications` set to `true`. This way, notifications will not be sent to participants.

After the creation of the document, use the document ID to get the signing URL using the [Action URL API](https://www.dropsigner.com/swagger/index.html#operations-Documents-post_api_documents__id__action_url):

```javascript
POST /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/action-url

{
    //the information must be sent to identify the participant
    "identifier": "81976153069",
    "emailAddress": "john.wick@mailinator.com"
}
```

If the signer has allowed electronic signature (parameter `allowElectronicSignature = true`), it is possible to require an e-mail confirmation through a code asked during signing. To do so, set `requireEmailAuthentication` to `true`:

```javascript
POST /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11/action-url

{
    //the information must be sent to identify the participant
    "identifier": "81976153069",
    "emailAddress": "john.wick@mailinator.com",
    //if the action is an electronic signature and this parameter is set to true, requires e-mail authentication with code in order to complete the signature
    "requireEmailAuthentication": true
}
```

The response presents two URLs:

```javascript
{
    //URL to redirect the user to the Signer signing page
    "url": "https://...",
    //URL to use the signing Widget
    "embedUrl": "https://..."
}
```

Use the `embedUrl` with the **Signing Widget** to display Signer's signing page inside your application. The section [Embedded signature](/signer/embedded-signature) describes how to use the *Widget*.

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/EmbeddedSignatureScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/EmbeddedSignatureScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/EmbeddedSignatureScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/embeddedSignatureScenario.ts)

## Pre-positioning a signature on the document

During the creation of a document, it is possible to place each participant's signature in a specific place in the document. All definitions are done during the creation of the `flowAction`: there are options to define the page and the location of the signature within it.

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithPositionedSignaturesScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithPositionedSignaturesScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithPositionedSignaturesScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithPositionedSignaturesScenario.ts)

## Merge multiple files into a single document (envelope)

It is possible to upload multiple files and merge them all into a single document (envelope). To do so, add the `isEnvelope=true` parameter and an envelope name in `EnvelopeName`.

:::caution
Merging only works if **all uploaded files are PDFs**.
:::

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CreateDocumentWithEnvelopeScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CreateDocumentWithEnvelopeScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CreateDocumentWithEnvelopeScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/createDocumentWithEnvelopeScenario.ts)

## Next steps

With the document created, see how to [track its status and send reminders](/signer/integration/tracking).
