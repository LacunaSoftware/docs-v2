---
sidebar_label: "Integration Guide"
sidebar_position: 0
slug: /signer/integration-guide
---

# Integration Guide

Signer is a web portal of documents that enables digital and electronic signatures as well as the creation of complex document flows. This guide presents the integration options so that your application can make the most of Signer's potential.

:::tip New here?
If this is your first integration, start with [Getting started](/signer/get-started), which takes you from zero to your first signed document in about 15 minutes. This guide serves as a reference for the use cases.
:::

## Authentication

All API calls demand one API Key in order to communicate with Signer. This key must be placed in the header of all requests:

```javascript
X-Api-Key: your-application|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Every API Key is associated with an Organization previously registered in Signer. Therefore, the scope of this key is **restricted to that organization**, that key will only allow you to access/create documents from that same organization.

:::note
In order to obtain an API key, contact your instance administrator.
:::

## How the flow works

In practice, an integration with Signer follows four stages. Each stage has a dedicated page in this guide:

1. **[Create documents](/signer/integration/documents)**: upload the file, assemble the participant flow and (optionally) sign inside your own application.
2. **[Track documents](/signer/integration/tracking)**: check the status, send reminders and receive webhook notifications.
3. **[Download and list](/signer/integration/download-and-list)**: get the document versions and list documents by different criteria.
4. **[Validate signatures](/signer/integration/validation)**: validate signatures using a validation key or the signed file.

And throughout the document's life you may need **[lifecycle](/signer/integration/lifecycle)** operations: cancel, refuse, submit a new version or delete.

## Use cases

| Use case | What you do |
| --- | --- |
| [Create documents](/signer/integration/documents) | Upload, flow creation, embedded signature, pre-positioning signatures and envelopes (multiple files) |
| [Track documents](/signer/integration/tracking) | Check document and participant status, send reminders and set up webhooks |
| [Download and list](/signer/integration/download-and-list) | Download the different document versions and list documents |
| [Validate signatures](/signer/integration/validation) | Validate signatures by key or by signed file |
| [Document lifecycle](/signer/integration/lifecycle) | Cancel, refuse, submit a new version and delete |

## Useful Links

* [API Reference (Swagger)](https://www.dropsigner.com/swagger)
* [GitHub Examples](https://github.com/LacunaSoftware/SignerSamples)
* [Embedded signature (Widget)](/signer/embedded-signature)
* [Webhooks](/signer/webhooks)
