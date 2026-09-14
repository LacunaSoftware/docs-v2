---
sidebar_label: "Overview"
sidebar_position: 1
slug: /signer/on-premises/customization
---

# Signer customization

Signer can be customized at **two levels**, and that distinction determines who makes each change:

* **Instance**: applies to the whole Signer. It covers the color theme, logos, home page, notification
  texts and domain. These are defined during deployment or by the system administrator.
* **Organization**: applies only to that organization's documents. It covers the e-mail logo and colors,
  the logo on the printer friendly version, the validation stamp and the signature visual representation.
  Each organization administrator configures their own, from the application itself.

## What can be customized

| What | Level | Who configures it | Where |
|---|---|---|---|
| Application color theme | Instance | Deployment team | [Visual identity](identidade-visual.md) |
| Application logos (4 files) | Instance | Deployment team | [Visual identity](identidade-visual.md) |
| Home page (simple or static) | Instance | Deployment team | [Home page and footer](home-e-footer.md) |
| Home page footer | Instance | Deployment team | [Home page and footer](home-e-footer.md) |
| Own SMTP server | Instance | System administrator | [E-mail server (SMTP)](../integracao/email-smtp.md) |
| E-mail and notification texts | Instance | System administrator | [E-mails and notifications](emails.md) |
| SMS provider | Instance | System administrator | [SMS sending](../integracao/sms.md) |
| Own domain | Instance | Customer (DNS) and deployment | [Own domain](dominio.md) |
| E-mail logo and colors | Organization | Organization admin | [E-mails and notifications](emails.md#personalizacao-por-organizacao) |
| Support e-mail, subject prefix and extra e-mail content | Organization | Organization admin | [E-mails and notifications](emails.md#personalizacao-por-organizacao) |
| Printer friendly version logo and layout | Organization | Organization admin | [Generated documents](documentos.md) |
| Validation stamp logo | Organization | Organization admin | [Generated documents](documentos.md) |
| Signature visual representation image | Organization | Organization admin | [Generated documents](documentos.md) |

## In this section

* [Visual identity](identidade-visual.md) covers the color theme and the logos.
* [Available themes](temas.md) has the complete gallery, with each theme code.
* [Home page and footer](home-e-footer.md) shows the two ways of customizing the home page.
* [E-mails and notifications](emails.md) covers e-mail branding and text customization.
* [Generated documents](documentos.md) covers the printer friendly version, the validation stamp and the
  signature visual representation.
* [Own domain](dominio.md) covers serving the instance under a domain of your own.

:::note
Items marked as "deployment team" are not self-service. Contact the team telling them what you want, such
as the theme code, the logo files or the home page HTML, so the changes are applied to your instance.
:::

:::tip Sending channels
The configuration of notification sending channels lives in the Integration section:
[SMS sending](../integracao/sms.md), [E-mail server (SMTP)](../integracao/email-smtp.md) and
[WhatsApp integration](../integracao/whatsapp.md).
:::
