---
sidebar_label: "Webhooks"
sidebar_position: 4
slug: /signer/webhooks
---

# Webhooks

## Introduction

A **webhook** is a URL of your application that Signer calls, with a `POST`, whenever something happens to
your organization's documents: a document was signed, approved, refused, concluded, canceled, expired or
deleted.

This is the recommended way to track documents. Instead of repeatedly calling `GET /api/documents/{id}`
(polling), your application is notified as soon as the event happens.

## Registering a webhook

### Through the Signer screens

Go to the **Organization** screen, **Integration** section, and register the desired URL:

![Webhook](/images/signer/org-webhook.png)

### Through the API

| Operation | Endpoint |
|---|---|
| Create | `POST /api/organizations/{orgId}/webhooks` |
| Update | `PUT /api/organizations/{orgId}/webhooks/{webhookId}` |
| Delete | `DELETE /api/organizations/{orgId}/webhooks/{webhookId}` |
| List | Registered webhooks are returned in the `webhooks` field of the organization details (`GET /api/organizations/{orgId}`) |

Request body for create and update:

```json
{
  "url": "https://yourapplication.com/integrations/signer",
  "authType": "Bearer",
  "token": "a-long-random-secret"
}
```

Creation returns the webhook `id`, which is the `webhookId` used to update or delete it.

:::note
* An organization can have several webhooks, and all of them receive all events. The limit is defined by
  the instance's `MaxWebhooksPerOrganization` setting (default: **5**); going over it makes the API
  respond with the `MaxWebhooksLimitReached` error.
* Webhooks are not available in **personal organizations** (error
  `OperationNotSupportedInPersonalOrganizations`).
:::

## Authenticating the call

Signer does not sign the request body. Authentication is done through a header you choose when registering
the webhook, carrying the value given in `token`:

| `authType` | Header sent |
|---|---|
| `NoAuth` | None |
| `Basic` | `Authorization: Basic <token>` |
| `Bearer` | `Authorization: Bearer <token>` |
| `ApiKey` | `X-Api-Key: <token>` |

:::warning
The `token` is sent **exactly as registered**. In `Basic` mode Signer encodes nothing: you must register
the value already Base64-encoded from `user:password`.

Always use HTTPS and an `authType` other than `NoAuth`, and validate the received header before processing
the event. Without that, anyone who discovers your URL can send fake events.
:::

## Request format

Signer sends a `POST` with `Content-Type: application/json` (UTF-8). The body is always an envelope with
the event type and the data specific to that type:

```json
{
  "type": "DocumentConcluded",
  "data": { }
}
```

Field names are in camelCase and enumeration values are sent as **text**, for example
`"DocumentConcluded"` and not `1`.

## Events

| `type` | When it fires |
|---|---|
| `DocumentsCreated` | Documents were created (a single event may carry several documents) |
| `DocumentSigned` | A participant signed the document |
| `DocumentApproved` | A participant approved the document |
| `DocumentRefused` | A participant refused the document |
| `DocumentConcluded` | The flow finished: every action was completed |
| `DocumentCanceled` | The document was canceled |
| `DocumentExpired` | The document reached its expiration date without being concluded |
| `DocumentDeleted` | Documents were deleted |
| `InvoiceClosed` | An invoice was closed (billing event, see the note below) |

:::note
The deletion event type is `DocumentDeleted`, in the singular, but its `data` carries a **list** of
documents.

The `InvoiceClosed` event is not configured per organization: it uses the **instance billing webhook**,
configured by the system administrator. Every other event is per organization.
:::

### Common fields of document events

Every document event carries, inside `data`, the basic information of the document:

```json
{
  "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
  "name": "Services agreement",
  "creationDate": "2026-09-10T13:02:11.482Z",
  "updateDate": "2026-09-10T14:27:35.115Z",
  "folder": {
    "id": "0a9e1f3c-2b44-4f6a-9d0e-77c1b8a4e510",
    "name": "Contracts 2026",
    "parentId": null,
    "organizationName": "Acme Inc."
  },
  "organization": {
    "id": "5f2c9a71-3e8d-4a12-bb90-6d4e2f1c8a33",
    "name": "Acme Inc.",
    "identifier": "11222333000181",
    "owner": null
  },
  "createdBy": {
    "id": "4d961566-9b03-450c-b144-930e0294bac2",
    "name": "ERP Integration"
  }
}
```

`folder` is `null` when the document is not in a folder, and `organization` is `null` for personal
documents.

### Additional fields per event

**`DocumentSigned`** adds `signature`, with the data of who signed:

```json
{
  "type": "DocumentSigned",
  "data": {
    "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "name": "Services agreement",
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

**`DocumentApproved`** uses the same structure, in the `approval` field.

**`DocumentRefused`** carries the `refusal` field, with the same fields plus the reason given:

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
      "reason": "Wrong amount in clause 4"
    }
  }
}
```

**`DocumentConcluded`** carries the common fields only, with no additional ones.

**`DocumentCanceled`** adds `canceledBy`, with the user or application that canceled it (`id`, `name` and
`type`), and `reason`.

**`DocumentExpired`** adds `expirationDate` and `expirationDateWithoutTime`, the latter in `yyyy-MM-dd`
format, convenient for display.

**`DocumentsCreated`** carries in `data` the `documents` list, each item with the common fields:

```json
{
  "type": "DocumentsCreated",
  "data": {
    "documents": [
      { "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11", "name": "Contract 1" },
      { "id": "c98a2f14-1d3b-4c77-8e05-2a6b9d1f4e62", "name": "Contract 2" }
    ]
  }
}
```

**`DocumentDeleted`** carries the `documents` list and the `action` field, telling what caused the
deletion:

| `action` | Meaning |
|---|---|
| `DeletedByUserOrApplication` | Deletion made by a user or application |
| `DeletedByOrganization` | Organization-wide deletion |
| `DeletedByFolder` | Deletion of a folder that contained the documents |

:::note
For `DeletedByOrganization` and `DeletedByFolder` the `documents` list is limited to **100 documents**,
even when more documents were deleted.
:::

**`InvoiceClosed`** carries in `data` the fields `id`, `month`, `year`, `value`, `invoiceTotals` (totals
per transaction type), `organization`, `billingInformation` and `totalStorageUsed`, the latter being the
total storage used, in bytes.

## Delivery, retries and ordering

Understanding this section prevents most webhook integration problems.

**Delivery is asynchronous.** Each event is sent by a background process, on a low priority queue, and not
at the very instant of the user action. A small delay is normal.

**Your application must answer 2xx.** Any other status code, or a connection error, marks the delivery as
failed, and it is **automatically rescheduled**, with growing intervals between attempts (by default, up
to 10 attempts). Signer logs the status code and the response body of each failure, and it is worth asking
the instance administrator for those records when investigating a problem.

**Handle repeated deliveries.** Because of the retries, the same event may arrive more than once. Make
your processing **idempotent**, using the combination of `type` and the document `id` and, where there is
one, the `flowActionId`, to recognize an event you already processed.

**There is no ordering guarantee.** Events are delivered by independent processes: `DocumentSigned` and
`DocumentConcluded` for the same document may arrive out of order. When ordering matters, use the current
state of the document as the source of truth, by calling `GET /api/documents/{id}`.

**Each webhook is independent.** If the organization has more than one webhook registered, the event is
sent to each of them separately, and a failure in one does not affect the others.

## Best practices

* Answer `200` **immediately** and process the event afterwards, asynchronously. Slow endpoints cause
  timeouts and needless retries.
* Validate the authentication header on every received request.
* Treat the payload as a **notification**, not as the source of truth. Before a sensitive action, such as
  releasing a payment, confirm the document state through the API.
* Keep the URL stable and reachable. Signer must get to it over the internet or, in *on premises*
  installations, over the network where the server runs.
* Log the received events, which helps diagnosing divergences between your system and Signer.

## See also

* [Getting Started](get-started.md)
* [Integration Guide](guia-de-integracao/index.md)
* [Checking a document status](guia-de-integracao/acompanhar-documentos.md#check-document)
