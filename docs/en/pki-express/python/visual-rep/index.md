# Visual representation

A visual representation of a PDF signature is the text or image with information about the document's internal signature. Some PDF visualization programs can link visual representations with the signature and signer data and properties. 

**Each visual representation is always related to only one PDF signature. And each PDF signature can have up to one visual representation.**

The sections below show the PDF signatures' visual representation options, parameters, and customizations.

## Visual Representation Elements

The visual representation dictionary has three parameters to be defined: position, text, and image. The list below briefly explains those visual representation elements.

* Position

  The visual representation rectangle can be automatic or manual positioned.

  * Automatic positioning

    We recommend the usage of automatic positioning when it's possible to delimit a region (container) of the PDF page for the insertion of visual representations. This positioning mode inserts and organizes the visual representation within the specified region. The figure below shows the behavior of the automatic positioning. The visual representations are inserted one by one inside the external container, illustrated by the red rectangle.

    ![Visual representation auto positioning](/images/pki-sdk/visual-rep-result-mini.png)

  * Manual positioning

    We recommend the usage of manual positioning when the position of each visual representation, or its regions, is not predefined, as when the user chooses the page and visual representation's position.

    ![Visual representation manual positioning](/images/pki-sdk/visual-rep-manual-mini.png)

* Text

  The visual representations have textual information that is configured by the parameter `text`.

* Image

  The visual representations can have background images with customizable opacity and alignment. The parameter `image` configures these options.

## Visual representation positioning

Inside the parameter `position`, you can define the PDF page for the representation insertion, the position inside the page, and the measurement unit used to inform the position.

The parameter `pageNumber` sets the page to insert the visual representations. Negative numbers start counting from the end of the document, so -1 is the last page, -2 is the penultimate page, and so on. The special value 0 (zero) means a new blank page, at the end of the document, is used to insert the visual representations.

The parameter `measurementUnits` sets the measurement unit used to set the positioning parameters. The default unit is `"centimeters"` but `"pdfPoints"` is also a valid value. 

### Manual Positioning

The parameter `manual` sets the signature rectangle position on the page. The rectangle has the parameters  `top`, `bottom`, `left`, `right`, `width`, and `height`, as shown in the figure below. 

![PAdES rectangle](/images/pki-sdk/pades-rectangle.png)

The code below exemplifies how to configure a visual representation to be inserted on the last page of the document; having 7cm of width and 3cm of height; with left and bottom margin of 2.5cm, as shown in the figure below. 

![PAdES visual representation manual positioning](/images/pki-sdk/pades-visual-rep-manual-pos.png)

```python
signer = PadesSigner()
...
visual = {
  'position': {
    'pageNumber': -1,     # Set last page for visual representation insertion
    'manual': {
      'width': 7,         # Width  = 7cm
      'height': 3,        # Height = 3cm
      'left': 2.50,       # Left margin   = 2.50cm
      'bottom': 2.50      # Bottom margin = 2.50cm
    }
  },
  'text': {...},
  'image': {...}
}
signer.set_visual_representation(visual)
```

A visual representation of a PDF signature is the text or image with information about the document's internal signature. Some PDF visualization programs can link visual representations with the signature and signer data and properties. 

**Each visual representation is always related to only one PDF signature. And each PDF signature can have up to one visual representation.**

The sections below show the PDF signatures' visual representation options, parameters, and customizations.

## Visual Representation Elements

The visual representation dictionary has three parameters to be defined: position, text, and image. The list below briefly explains those visual representation elements.

* Position

  The visual representation rectangle can be automatic or manual positioned.

  * Automatic positioning

    We recommend the usage of automatic positioning when it's possible to delimit a region (container) of the PDF page for the insertion of visual representations. This positioning mode inserts and organizes the visual representation within the specified region. The figure below shows the behavior of the automatic positioning. The visual representations are inserted one by one inside the external container, illustrated by the red rectangle.

    ![Visual representation auto positioning](/images/pki-sdk/visual-rep-result-mini.png)

  * Manual positioning

    We recommend the usage of manual positioning when the position of each visual representation, or its regions, is not predefined, as when the user chooses the page and visual representation's position.

    ![Visual representation manual positioning](/images/pki-sdk/visual-rep-manual-mini.png)

* Text

  The visual representations have textual information that is configured by the parameter `text`.

* Image

  The visual representations can have background images with customizable opacity and alignment. The parameter `image` configures these options.

## Visual representation positioning

Inside the parameter `position`, you can define the PDF page for the representation insertion, the position inside the page, and the measurement unit used to inform the position.

The parameter `pageNumber` sets the page to insert the visual representations. Negative numbers start counting from the end of the document, so -1 is the last page, -2 is the penultimate page, and so on. The special value 0 (zero) means a new blank page, at the end of the document, is used to insert the visual representations.

The parameter `measurementUnits` sets the measurement unit used to set the positioning parameters. The default unit is `"centimeters"` but `"pdfPoints"` is also a valid value. 

### Manual Positioning

The parameter `manual` sets the signature rectangle position on the page. The rectangle has the parameters  `top`, `bottom`, `left`, `right`, `width`, and `height`, as shown in the figure below. 

![PAdES rectangle](/images/pki-sdk/pades-rectangle.png)

The code below exemplifies how to configure a visual representation to be inserted on the last page of the document; having 7cm of width and 3cm of height; with left and bottom margin of 2.5cm, as shown in the figure below. 

![PAdES visual representation manual positioning](/images/pki-sdk/pades-visual-rep-manual-pos.png)

```python
signer = PadesSigner()
...
visual = {
  'position': {
    'pageNumber': -1,               # Set last page for visual representations insertion
    'auto': {
      'container': {
        'left': 3.00,               # Left margin   = 3.00cm
        'right': 3.00,              # Right margin  = 3.00cm
        'bottom': 2.00,             # Bottom margin = 2.00cm
        'top': 8.00                 # Top margin    = 8.00cm
      },
      'signatureRectangleSize': {
        'height': 3,                # Height = 3cm
        'width': 7                  # Width  = 7cm
      },
      'rowSpacing': 1.00            # 1.00cm of space between lines
    }
  },
  'text': {...},
  'image': {...}
}
signer.set_visual_representation(visual)
```

:::note
The above code specifies a container with variable width and height. There are many other possible behaviors for the external container. For more information, see the article [Defining a container](containers.md).
:::


The figure below shows the expected result after signing a document using the above code. 

![PAdES visual representation auto positioning result](/images/pki-sdk/visual-rep-result.png)

## Text and image positioning

* Text

  Inside the visual representation rectangle, the PKI Express supports the customization of text alignment, positioning, and content. A `container` can be defined to set the text position. If none is defined, the text will fill all the rectangle.

  The parameter `horizontalAlign` (`"left"` or `"right"`) sets the text alignment. The parameter `fontSize` sets the font size used on the text of the visual representation.

  The parameter `includeSigningTime` must be `true` to include the signature's date and time in the visual representation. Use the parameter `signingTimeFormat` to customize the data display format.

  The parameter `text` supports tags that the PKI Express will substitute with the certificate's information.

  <a name="pades-tags" />
  * Generic Tags:
    Tag               | Value
    ----------------- | -----------
    `{{name}}`        | The best guess for the signer's full name (recommended for this purpose over `{{subject_cn}}`)
    `{{national_id}}` | The best guess for the signer's national ID. For ICP-Brasil certificates, this is resolved to the holder's CPF. For Italian certificates, this is resolved to the holder's *codice fiscale*.
    `{{email}}`       | Signer's email address
    `{{subject_cn}}`  | The Common Name (CN) part of the certificate's subject name field
    `{{issuer_cn}}`   | The Common Name (CN) part of the certificate's issuer name field

  * ICP-Brasil specific tags:
    Tag                     | Value
    ----------------------- | -----------
    `{{br_cpf}}`            | Certificate holder's CPF (*CPF do titular/responsável*)
    `{{br_cpf_formatted}}`  | Same as `{{br_cpf}}` but formatted as **000.000.000-00**
    `{{br_cnpj}}`           | Company's CNPJ
    `{{br_cnpj_formatted}}` | Same as `{{br_cnpj}}` but formatted as **00.000.000/0000-00**
    `{{br_responsavel}}`    | Name of the certificate's holder (*nome do titular/responsável*)
    `{{br_company}}`        | Company name
    `{{br_oab_numero}}`     | OAB's *Número de Inscrição junto a Seccional* (without leading zeroes)
    `{{br_oab_uf}}`         | OAB's *sigla do Estado da Seccional*
    `{{br_rg_numero}}`      | Certificate holder's ID  number (*número do RG do titular/responsável*) without leading zeroes
    `{{br_rg_emissor}}`     | Issuing entity of the certificate holder's ID (órgão emissor do RG do titular/responsável)
    `{{br_rg_uf}}`          | State code of the issuing entity of the certificate holder's ID (*UF do órgão emissor do RG do titular/responsável*)

  * Tags supported for backward compatibility:
    Tag                    | Equivalent tag
    ---------------------- | --------------
    `{{signerName}}`       | `{{name}}`
    `{{signerEmail}}`      | `{{email}}`
    `{{signerNationalId}}` | `{{national_id}}`
    `{{issuerCommonName}}` | `{{issuer_cn}}`
    `{{br_oab_numbero}}`   | `{{br_oab_numero}}`

  The code below exemplifies the text positioning withing the visual representation rectangle, as shown in the figure below.

  ![PAdES visual text](/images/pki-sdk/pades-visual-text.png)

```python
visual = {
  'text': {                                       # Visual representation text
    'text': 'Signed by {{name}}',                 # Set signer name
    'container': {                                # Text container
      'left': 0,
      'top': 0,
      'right': 1.5,
      'bottom': 0.5
    },
    'includeSigningTime': true,                   # Include signing time
    'signingTimeFormat': 'dd/MM/yy H:mm:ss zzz',  # Set the signing time format
    'fontSize': 10.0                              # Set the font size
  },
  'position': {...},
  'image': {...}
}
```

* Image

  It's also possible to set a background image within the visual representation rectangle and customize the image's opacity and alignment.

```python
signer = PadesSigner()
...
# Set a file reference for the stamp file.  Note that the file can be referenced
# later by "fref://{alias}" at the "url" field on the visual representation.
signer.add_file_reference('stamp', get_pdf_stamp_path())
visual = {
  'text': {...},
  'position': {...},
  'image': {
    'resource': {
      'url': 'fref://stamp',    # Reference to the image.
    },
    'horizontalAlign': 'right', # Right-align image inside the visual representation rectangle.
    'verticalAlign': 'center',  # Vertically centralize the image inside the visual representation rectangle.
  }
}
signer.set_visual_representation(visual)
```
* It's possible to remove the visual representation:

```python
signer.set_suppress_default_visual_representation(true)
```

## See also

* [Visual representation samples](samples.md)
