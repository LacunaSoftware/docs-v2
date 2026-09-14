---
sidebar_label: "Generated documents"
sidebar_position: 6
slug: /signer/on-premises/customization/documentos
---

# Generated documents

Besides the application, the **files Signer generates** can also be customized: the printer friendly
version, the validation stamp and the signature visual representation.

Every setting on this page is **per organization**: each organization administrator configures their own,
with no need for the deployment team. Through the API, all of them live in:

```
GET /api/organizations/{orgId}/settings
PUT /api/organizations/{orgId}/settings
```

## Printer friendly version

The printer friendly version (`PrinterFriendly`) is the PDF with the signatures manifest, downloaded with
`type=PrinterFriendlyVersion`. You can replace the logo and adjust its position and the position of the
signatures summary:

| Setting | What it does |
|---|---|
| `Logo` | Logo shown in the document. Without it, the instance `stamp-logo` is used |
| `ShowLogo` | Shows or hides the logo |
| `LogoWidthCentimeters` / `LogoHeightCentimeters` | Logo dimensions, in centimeters |
| `LogoMarginRightCentimeters` / `LogoMarginBottomCentimeters` | Logo margins, in centimeters |
| `ShowSummaryRight` | Places the signatures summary on the right |
| `SummaryHeightCentimeters` | Summary height, in centimeters |
| `SummaryLeadingCentimeters` / `SummaryTrailingCentimeters` | Spacing before and after the summary |
| `SummaryMarginToPageCentimeters` | Summary margin relative to the page |

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

## Validation stamp

The validation stamp (`ValidationStamp`) uses exactly the same settings as the printer friendly version
(logo, dimensions and margins), applied to the stamp placed on the document. Without its own logo, the
instance `val-stamp-logo` is used.

```json
{
  "validationStamp": {
    "showLogo": true,
    "logoWidthCentimeters": 2,
    "logoHeightCentimeters": 2
  }
}
```

## Signature visual representation

The image shown in the signature visual representation inside the PDF (`SignatureImage`):

| Setting | What it does |
|---|---|
| `VisualRepresentationEnabled` | Enables the visual representation on the organization signatures |
| `Image` | Image used in the visual representation |
| `AlignTextOnMiddle` | Vertically aligns the text to the middle of the representation |

```json
{
  "signatureImage": {
    "visualRepresentationEnabled": true,
    "alignTextOnMiddle": true
  }
}
```

:::note
The logos and images on this page are sent as an upload and referenced in the `logo` (or `image`) field of
the corresponding section. See the upload step in
[Getting Started](../../../apis/get-started.md#step-2-upload-the-file).
:::

## See also

* [Visual identity](identidade-visual.md) has the instance default logos (`stamp-logo` and
  `val-stamp-logo`).
* [E-mails and notifications](emails.md) covers per-organization e-mail customization.
* [Signer settings](../settings.md) documents the `PrinterFriendly`, `ValidationStamp` and
  `VisualRepresentation` sections at the instance level.
