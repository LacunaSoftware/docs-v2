---
sidebar_label: "Track documents"
sidebar_position: 2
slug: /signer/integration/tracking
---

# Track documents

After creating a document, you track its progress in two ways: **polling the status** actively or **receiving notifications** via webhook when something happens. You can also send reminders to participants who have not acted yet.

## Check the status of a document {#check-document}

To check the status of a document you need its ID. Then call the [Document Details API](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents__id_):

```javascript
GET /api/documents/b12cb1b2-5d6e-40b2-a050-097d068c4c11

{
    "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "name": "Integration Contract",
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
            "title": "Party",
            "allowElectronicSignature": true
        }
    ]
}
```

* To find out if the document is completed, check that the property `status` corresponds to `Concluded`.
* To find out if a participant has signed/approved, check if the property `status` corresponds to `Completed` for the corresponding item in the `flowActions` list.

### Document status

The document's `status` property can take the following values:

| Status | Meaning |
| --- | --- |
| `Pending` | Waiting for participant actions |
| `FlowConcluded` | All flow actions are done (final processing in progress) |
| `Concluded` | Document concluded |
| `Refused` | Document refused by a participant |
| `Canceled` | Document canceled |
| `Expired` | Document expired |

### Participant action status

Each `flowActions` item has its own `status`:

| Status | Meaning |
| --- | --- |
| `Created` | Action created, not yet released to the participant (waiting for a previous step) |
| `Pending` | Waiting for the participant's action |
| `Completed` | Participant completed the action (signed/approved) |
| `Refused` | Participant refused |

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/CheckDocumentStatusScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/CheckDocumentStatusScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/CheckDocumentStatusScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/checkDocumentStatusScenario.ts)

## Send signing reminders

Once the status of a participant has been verified, you can send periodic reminders to the flow participants who have not yet completed an action, using the [Reminders Sending API](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents__id_). Provide the document ID and the participant's action ID (`flowActionId`):

```javascript
POST /api/notifications/flow-action-reminder

{
    "documentId": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "flowActionId": "4bf61c68-eaf1-455f-b4a1-6141554f1dae"
}
```

**Examples on GitHub:** [C#](https://github.com/LacunaSoftware/SignerSamples/blob/master/dotnet/console/Console/Scenarios/NotifyFlowParticipantsScenario.cs) · [Java](https://github.com/LacunaSoftware/SignerSamples/blob/master/java/console/src/main/java/com/lacunasoftware/signer/sample/scenarios/NotifyFlowParticipantsScenario.java) · [PHP](https://github.com/LacunaSoftware/SignerSamples/blob/master/php/Scenarios/NotifyFlowParticipantsScenario.php) · [Node.js](https://github.com/LacunaSoftware/SignerSamples/blob/master/nodejs/scenarios/notifyFlowParticipantsScenario.ts)

## Webhooks

Instead of polling the status repeatedly, you can set up a **Webhook** that will be triggered every time a document from your organization is completed, approved, declined or signed. For that, access the Organization page and register the required URL in the **Integration** option:

![Webhook](/images/signer/org-webhook.png)

See [Webhooks](../webhooks.md) for the complete list of events, the payload format of each one and the delivery behaviour (authentication, retries and ordering).

## Next steps

Once the document is concluded, see how to [download and list documents](./baixar-e-listar.md).
