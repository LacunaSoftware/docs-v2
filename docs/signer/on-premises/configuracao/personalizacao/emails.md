---
sidebar_label: "E-mails e notificações"
sidebar_position: 5
slug: /signer/on-premises/customization/emails
---

# E-mails e notificações

Há duas coisas diferentes que podem ser personalizadas nos e-mails do Signer:

1. **A aparência dos e-mails de cada organização**, com logo, cores e alguns textos fixos. Configurado
   pelo administrador da organização, na própria aplicação.
2. **Os textos dos e-mails e notificações**, sobrescrevendo qualquer texto, em qualquer idioma.
   Configurado pelo administrador do sistema.

:::tip
Para configurar o **servidor de envio** (SMTP próprio), veja
[Servidor de e-mail (SMTP)](../integracao/email-smtp.md), na seção de Integração.
:::

## Personalização por organização {#personalizacao-por-organizacao}

Cada organização tem suas próprias configurações de e-mail, aplicadas às notificações dos documentos
daquela organização:

| Configuração | O que faz |
|---|---|
| `Logo` | Logo exibida no topo dos e-mails. Se não for enviada, usa a `light-logo` da instância |
| `ThemeColor` | Cor principal do e-mail |
| `ThemeLinkColor` | Cor dos links |
| `ButtonBackgroundColor` | Cor de fundo dos botões |
| `ButtonTextColor` | Cor do texto dos botões |
| `SupportEmailAddress` | E-mail de suporte exibido ao destinatário |
| `EmailSubjectPrefix` | Prefixo adicionado ao assunto de todos os e-mails da organização |
| `EmailExtraContent` | Conteúdo extra incluído no corpo dos e-mails |

Pela API, essas configurações ficam no objeto `mail` das configurações da organização:

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
    "supportEmailAddress": "suporte@suaempresa.com.br",
    "emailSubjectPrefix": "[Sua Empresa]",
    "emailExtraContent": "Em caso de dúvidas, fale com o seu gerente de contas."
  }
}
```

A logo é enviada como um upload, conforme
[Primeiros passos](../../../apis/get-started.md#passo-2-envie-o-arquivo), e informada no campo
`mail.logo`.

:::tip
Esta é a personalização que a maior parte dos clientes procura, e **não depende da equipe de implantação**:
o administrador da organização faz sozinho, pela tela de configurações da organização.
:::

## Textos dos e-mails e notificações

Qualquer texto de e-mail ou notificação pode ser sobrescrito pela seção de configuração
**`CustomResources`**, sem alterar o produto. É o mecanismo usado, por exemplo, para trocar "Assinar
documento" por um termo próprio da sua operação.

A configuração é organizada em **localizadores** (`Localizers`), cada um correspondendo a um conjunto de
textos:

| Localizador | O que contém |
|---|---|
| `MailFormatter` | Textos do corpo dos e-mails: saudações, botões, instruções, textos de fatura |
| `NotificationRepository` | Títulos e descrições das notificações dentro da aplicação |
| `NotificationService` | Assuntos dos e-mails e mensagens de eventos do documento |

Para cada chave é possível definir o valor por idioma (`pt`, `en`, `es`) e um valor `Default`, usado quando
não houver valor para o idioma solicitado:

```
CustomResources__Localizers__MailFormatter__Resources__Sign__pt=Assinar contrato
CustomResources__Localizers__MailFormatter__Resources__Sign__Default=Sign contract
```

Em formato JSON (`appsettings.json`):

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
A seção `CustomResources` está disponível desde a versão **1.37.0**. Veja também a referência em
[Configurações do Signer](../settings.md).
:::

### Chaves disponíveis

As chaves abaixo são as que podem ser sobrescritas em cada localizador.

{/* BEGIN generated: custom-resources-keys via scripts/generate-signer-customization.mjs */}

<details>
<summary>MailFormatter (114 chaves)</summary>

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
<summary>NotificationRepository (22 chaves)</summary>

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
<summary>NotificationService (31 chaves)</summary>

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


## Veja também

* [Servidor de e-mail (SMTP)](../integracao/email-smtp.md) trata da configuração do servidor de envio.
* [Identidade visual](identidade-visual.md) traz a logo padrão usada nos e-mails da instância.
* [Documentos gerados](documentos.md) cobre a personalização por organização da versão para impressão.
* [Configurações do Signer](../settings.md) é a referência completa das seções de configuração.
