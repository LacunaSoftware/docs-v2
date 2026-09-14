---
sidebar_label: "Documentos gerados"
sidebar_position: 6
slug: /signer/on-premises/customization/documentos
---

# Documentos gerados

Além da aplicação, os **arquivos que o Signer gera** também podem ser personalizados: a versão para
impressão, o carimbo de validação e a representação visual da assinatura.

Todas as configurações desta página são **por organização**: cada administrador de organização configura a
sua, sem depender da equipe de implantação. Pela API, todas ficam em:

```
GET /api/organizations/{orgId}/settings
PUT /api/organizations/{orgId}/settings
```

## Versão para impressão

A versão para impressão (`PrinterFriendly`) é o PDF com o manifesto de assinaturas, baixado com
`type=PrinterFriendlyVersion`. É possível trocar a logo e ajustar o posicionamento dela e do resumo de
assinaturas:

| Configuração | O que faz |
|---|---|
| `Logo` | Logo exibida no documento. Sem ela, usa a `stamp-logo` da instância |
| `ShowLogo` | Exibe ou oculta a logo |
| `LogoWidthCentimeters` / `LogoHeightCentimeters` | Dimensões da logo, em centímetros |
| `LogoMarginRightCentimeters` / `LogoMarginBottomCentimeters` | Margens da logo, em centímetros |
| `ShowSummaryRight` | Posiciona o resumo de assinaturas à direita |
| `SummaryHeightCentimeters` | Altura do resumo, em centímetros |
| `SummaryLeadingCentimeters` / `SummaryTrailingCentimeters` | Espaçamento antes e depois do resumo |
| `SummaryMarginToPageCentimeters` | Margem do resumo em relação à página |

```json
{
  "printerFriendly": {
    "showLogo": true,
    "logoWidthCentimeters": 3.5,
    "logoHeightCentimeters": 1.2,
    "logoMarginRightCentimeters": 1,
    "logoMarginBottomCentimeters": 0.5,
    "showSummaryRight": false
  }
}
```

## Carimbo de validação

O carimbo de validação (`ValidationStamp`) usa exatamente as mesmas configurações da versão para
impressão (logo, dimensões e margens), aplicadas ao carimbo aposto no documento. Sem logo própria, usa a
`val-stamp-logo` da instância.

```json
{
  "validationStamp": {
    "showLogo": true,
    "logoWidthCentimeters": 2,
    "logoHeightCentimeters": 2
  }
}
```

## Representação visual da assinatura

A imagem exibida na representação visual da assinatura dentro do PDF (`SignatureImage`):

| Configuração | O que faz |
|---|---|
| `VisualRepresentationEnabled` | Habilita a representação visual nas assinaturas da organização |
| `Image` | Imagem usada na representação visual |
| `AlignTextOnMiddle` | Alinha o texto verticalmente ao centro da representação |

```json
{
  "signatureImage": {
    "visualRepresentationEnabled": true,
    "alignTextOnMiddle": true
  }
}
```

:::note
As logos e imagens desta página são enviadas como upload e informadas no campo `logo` (ou `image`) da
respectiva seção. Veja o passo de upload em
[Primeiros passos](../../../apis/get-started.md#passo-2-envie-o-arquivo).
:::

## Veja também

* [Identidade visual](identidade-visual.md) traz as logos padrão da instância (`stamp-logo` e
  `val-stamp-logo`).
* [E-mails e notificações](emails.md) cobre a personalização dos e-mails por organização.
* [Configurações do Signer](../settings.md) documenta as seções `PrinterFriendly`, `ValidationStamp` e
  `VisualRepresentation` no nível da instância.
