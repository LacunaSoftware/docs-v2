---
sidebar_label: "E-mails and notifications"
sidebar_position: 5
slug: /signer/on-premises/customization/emails
---

# E-mails and notifications

There are two different things that can be customized in Signer e-mails:

1. **How each organization's e-mails look**, with logo, colors and some fixed texts. Configured by the
   organization administrator, in the application itself.
2. **The e-mail and notification texts**, overriding any text, in any language. Configured by the system
   administrator.

:::tip
To configure the **sending server** (your own SMTP), see
[E-mail server (SMTP)](../integracao/email-smtp.md), in the Integration section.
:::

## Per-organization customization {#personalizacao-por-organizacao}

Each organization has its own e-mail settings, applied to the notifications of that organization's
documents:

| Setting | What it does |
|---|---|
| `Logo` | Logo shown at the top of the e-mails. When not provided, the instance `light-logo` is used |
| `ThemeColor` | Main e-mail color |
| `ThemeLinkColor` | Link color |
| `ButtonBackgroundColor` | Button background color |
| `ButtonTextColor` | Button text color |
| `SupportEmailAddress` | Support e-mail shown to the recipient |
| `EmailSubjectPrefix` | Prefix added to the subject of every e-mail of the organization |
| `EmailExtraContent` | Extra content included in the e-mail body |

Through the API, these settings live in the `mail` object of the organization settings:

```
GET /api/organizations/{orgId}/settings
PUT /api/organizations/{orgId}/settings
```

```json
{
  "mail": {
    "themeColor": "#1B4965",
    "themeLinkColor": "#5FA8D3",
    "buttonBackgroundColor": "#1B4965",
    "buttonTextColor": "#FFFFFF",
    "supportEmailAddress": "support@yourcompany.com",
    "emailSubjectPrefix": "[Your Company]",
    "emailExtraContent": "If you have any questions, talk to your account manager."
  }
}
```

The logo is sent as an upload, as shown in
[Getting Started](../../../apis/get-started.md#step-2-upload-the-file), and referenced in the `mail.logo`
field.

:::tip
This is the customization most customers are after, and it **does not depend on the deployment team**: the
organization administrator does it alone, from the organization settings screen.
:::

## E-mail and notification texts

Any e-mail or notification text can be overridden through the **`CustomResources`** configuration section,
with no product change. It is the mechanism used, for example, to replace "Sign document" with a term of
your own.

The configuration is organized in **localizers** (`Localizers`), each one matching a set of texts:

| Localizer | What it holds |
|---|---|
| `MailFormatter` | E-mail body texts: greetings, buttons, instructions, invoice texts |
| `NotificationRepository` | Titles and descriptions of the in-app notifications |
| `NotificationService` | E-mail subjects and document event messages |

For each key you can set the value per language (`pt`, `en`, `es`) and a `Default` value, used when there
is no value for the requested language:

```
CustomResources__Localizers__MailFormatter__Resources__Sign__en=Sign contract
CustomResources__Localizers__MailFormatter__Resources__Sign__Default=Sign contract
```

In JSON format (`appsettings.json`):

```json
{
  "CustomResources": {
    "Localizers": {
      "MailFormatter": {
        "Resources": {
          "Sign": {
            "pt": "Assinar contrato",
            "en": "Sign contract",
            "es": "Firmar contrato",
            "Default": "Sign contract"
          }
        }
      }
    }
  }
}
```

:::note
The `CustomResources` section is available since version **1.37.0**. See also the reference in
[Signer settings](../settings.md).
:::

### Available keys

The keys below are the ones that can be overridden in each localizer.

{/* BEGIN generated: custom-resources-keys via scripts/generate-signer-customization.mjs */}

<details>
<summary>MailFormatter (114 keys)</summary>

* `AcceptInvite`
* `AddedActions`
* `AddedObserverText`
* `AddedObservers`
* `AdministrationArea`
* `ApprovalCompletedText`
* `Approve`
* `Approver`
* `AuthenticationCode`
* `BankSlipAttachmentFileName`
* `BatchTextApprove`
* `BatchTextDelete`
* `BatchTextMove`
* `BatchTextRefuse`
* `BatchTextSign`
* `ButtonViewAllDocuments`
* `CancelReason`
* `ClosedInvoiceOrganizationText`
* `ClosedInvoicePersonalText`
* `ClosedInvoiceSubject`
* `CompletedFastSignatureText`
* `ContactMessage`
* `CreatedInvoiceOrganizationText`
* `CreatedInvoicePersonalText`
* `CreatedInvoiceSubject`
* `DeletedActions`
* `DeletedDocumentText`
* `DeletedObservers`
* `DocumentAttachmentDeletedText`
* `DocumentAttachmentsAddedText`
* `DocumentCanceledText`
* `DocumentInfoUpdatedText`
* `DocumentPausedText`
* `DocumentRefusalText`
* `DocumentResumedText`
* `DocumentVersionAddedText`
* `Documents`
* `DocumentsConcludedIntroPlural`
* `DocumentsDeletedIntroPlural`
* `DownloadReport`
* `EditedFlowIntro`
* `ExpiredDocumentText`
* `ExtraLinkMessage`
* `FailedInvoiceCharge`
* `FailedInvoiceChargeOrganizationText`
* `FailedInvoiceChargePersonalText`
* `FailoverMessage`
* `FirstAccess`
* `FirstDocument`
* `GrantAccess`
* `Greetings`
* `GreetingsUser`
* `HelloUser`
* `InfoCurrentTags`
* `InfoDeletedTags`
* `InfoDescription`
* `InfoExpirationDate`
* `InfoFromTo`
* `InfoName`
* `InfoRemoved`
* `Instructions`
* `JoinOrganizationInvite`
* `NewTermsOfUseText`
* `ObserversIntro`
* `ParticipatedDocumentConcluded`
* `PauseReason`
* `PendingActionIntro`
* `PendingActionIntroPlural`
* `PendingActionIntroPluralMobile`
* `PendingApprovalText`
* `PendingApprovalTextMobile`
* `PendingDocumentsText`
* `PendingSignatureText`
* `PendingSignatureTextMobile`
* `PendingSignatureTextSMS`
* `PixPaymentText`
* `PixPaymentTitle`
* `ReceiptIssuedOrganizationText`
* `ReceiptIssuedPersonalText`
* `ReceiptIssuedSubject`
* `RefusalReason`
* `ReminderInvoice`
* `ReminderInvoiceOrganizationText`
* `ReminderInvoicePersonalText`
* `ReportAvailable`
* `ReportError`
* `RequestAccessUserInfo`
* `Rule`
* `SetPassword`
* `Sign`
* `SignIsEasy`
* `SignWithQrCode`
* `SignatureCompletedText`
* `SignatureConcludedText`
* `Signer`
* `Start`
* `SubjectAuthenticationCode`
* `SubjectReportAvailable`
* `SubjectReportError`
* `SuccessInvoiceCharge`
* `SuccessInvoiceChargeOrganizationText`
* `SuccessInvoiceChargePersonalText`
* `TermsOfUseUpdatedAdminText`
* `TryCompleteRegistration`
* `TryNow`
* `Unsubscribe`
* `UnsubscribeError`
* `UnsubscribeSuccess`
* `ViewDocument`
* `ViewDocuments`
* `ViewInvoice`
* `ViewTermsOfUse`
* `WelcomeTo`
* `WelcomeUser`

</details>

<details>
<summary>NotificationRepository (22 keys)</summary>

* `AccessRequest`
* `AddedAsObserver`
* `CreateBatchApproved`
* `CreateBatchDeleted`
* `CreateBatchMoved`
* `CreateBatchRefused`
* `CreateBatchSigned`
* `DocumentCompleted`
* `DocumentInformationUpdated`
* `DocumentSigned`
* `DocumentsCompleted`
* `DocumentsDeleted`
* `ElectronicSignatureAuthCode`
* `ObserversDocuments`
* `PendingAction`
* `PendingActionMobile`
* `PendingApproval`
* `PendingApprovalMobile`
* `PendingSignature`
* `PendingSignatureMobile`
* `TermsOfUseUpdatedAdmin`
* `UpdateTermsOfUse`

</details>

<details>
<summary>NotificationService (31 keys)</summary>

* `CreateBatchDeleted`
* `DocumentApproved`
* `DocumentAttachmentDeleted`
* `DocumentAttachmentsAdded`
* `DocumentCanceled`
* `DocumentDeleted`
* `DocumentExpired`
* `DocumentFlowEdited`
* `DocumentHasNoPendingFlowAction`
* `DocumentIsPaused`
* `DocumentPaused`
* `DocumentRefused`
* `DocumentResumed`
* `DocumentSigned`
* `DocumentVersionAdded`
* `SubjectDocumentCanceled`
* `SubjectDocumentConcluded`
* `SubjectDocumentDeleted`
* `SubjectDocumentExpired`
* `SubjectDocumentPaused`
* `SubjectDocumentRefused`
* `SubjectDocumentResumed`
* `SubjectDocumentVersionAdded`
* `SubjectElectronicSignatureAuthenticationCode`
* `SubjectFastSignatureCompleted`
* `SubjectFlowActionCompleted`
* `SubjectFlowEdited`
* `SubjectMultiplePendingActions`
* `SubjectObserverAdded`
* `SubjectPendingApproval`
* `SubjectPendingSignature`

</details>

{/* END generated: custom-resources-keys */}


## See also

* [E-mail server (SMTP)](../integracao/email-smtp.md) covers configuring the sending server.
* [Visual identity](identidade-visual.md) has the default logo used in the instance e-mails.
* [Generated documents](documentos.md) covers per-organization customization of the printer friendly
  version.
* [Signer settings](../settings.md) is the complete reference of the configuration sections.
