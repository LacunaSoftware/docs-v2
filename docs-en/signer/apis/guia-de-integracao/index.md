---
sidebar_label: "Integration Guide"
sidebar_position: 0
slug: /signer/integration-guide
---

# Integration Guide

Signer is a web portal of documents that enables digital and electronic signatures as well as the creation of complex document flows. This guide presents the integration options so that your application can make the most of Signer's potential.

:::tip New here?
If this is your first integration, start with [Getting started](../get-started.md), which takes you from zero to your first signed document in about 15 minutes. This guide serves as a reference for the use cases.
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

1. **[Create documents](./criar-documentos.md)**: upload the file, assemble the participant flow and (optionally) sign inside your own application.
2. **[Track documents](./acompanhar-documentos.md)**: check the status, send reminders and receive webhook notifications.
3. **[Download and list](./baixar-e-listar.md)**: get the document versions and list documents by different criteria.
4. **[Validate signatures](./validar-assinaturas.md)**: validate signatures using a validation key or the signed file.

And throughout the document's life you may need **[lifecycle](./ciclo-de-vida.md)** operations: cancel, refuse, submit a new version or delete.

## Use cases

| Use case | What you do |
| --- | --- |
| [Create documents](./criar-documentos.md) | Upload, flow creation, embedded signature, pre-positioning signatures and envelopes (multiple files) |
| [Track documents](./acompanhar-documentos.md) | Check document and participant status, send reminders and set up webhooks |
| [Download and list](./baixar-e-listar.md) | Download the different document versions and list documents |
| [Validate signatures](./validar-assinaturas.md) | Validate signatures by key or by signed file |
| [Document lifecycle](./ciclo-de-vida.md) | Cancel, refuse, submit a new version and delete |

## Useful Links

* [API Reference (Swagger)](https://www.dropsigner.com/swagger)
* [GitHub Examples](https://github.com/LacunaSoftware/SignerSamples)
* [Embedded signature (Widget)](../embedded-signature.md)
* [Webhooks](../webhooks.md)
