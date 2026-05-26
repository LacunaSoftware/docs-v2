# Representação Visual

A representação visual na assinatura de PDF é a inclusão de um texto ou imagem contendo informações sobre a assinatura que está interna ao documento. Dependendo do software de visualização do PDF, esta representação pode fazer uma ligação com os dados e propriedades da assinatura e do signatário.

**Cada representação visual é sempre relativa a apenas uma assinatura no PDF e cada assinatura  pode ter até uma representação visual.**

Nas seções abaixo exploraremos as opções, parâmetros e customizações na definição de uma representação visual para assinaturas em PDF.

## Elementos da Representação Visual

O array de representação visual possui 3 parâmetros que podem ser definidos: `position`, `text` e `image`. A lista abaixo introduz os elementos da representação visual.

* Posição

  A posição do retângulo da representação visual da assinatura pode ser definida de forma automática ou manual.

  * Posicionamento Automático

    O posicionamento automático é indicado para casos em que pode-se definir uma região (container) em uma página do PDF que irá receber a representação das assinaturas. Este modo irá organizar as assinaturas em série dentro da região especificada. A figura abaixo exemplifica o comportamento do posicionamento automático. O retângulo vermelho representa o container definido no qual as representações visuais serão posicionadas automaticamente em série.

    ![Visual representation auto positioning](/images/pki-sdk/visual-rep-result-mini.png)

  * Posicionamento Manual

    O posicionamento manual é indicado para os casos em que cada representação das assinaturas serão inseridas em posições arbitrárias, por exemplo a posição e a página serem informados pelo usuário.

    ![Visual representation manual positioning](/images/pki-sdk/visual-rep-manual-mini.png)

* Texto

  As informações textuais a serem inseridas na representação visual da assinatura são customizáveis pelo parâmetro `text`.

* Imagem

  É possível incluir uma imagem de fundo na representação visual da assinatura, podendo também customizar sua opacidade e seu alinhamento dentro do retângulo da representação visual. Estas opções são definidas pelo parâmetro `image`.

## Posicionamento da representação da assinatura

No posicionamento, define-se a página na qual a representação da assinatura será inserida, sua posição na página e a unidade de medida utilizada para informar a posição.

A página é especificada pelo parâmetro `pageNumber`. 
Números negativos são contados a partir do final do documento (-1 significa última página, -2 penúltima, etc).
Pode-se usar o valor especial 0 (zero), que especifica que a representação da assinatura deve ser colocada em uma nova página em branco adicionada ao final do documento.

A unidade de medida é especificada pelo parâmetro `measurementUnits`. Por padrão o seu valor é `"centimeters"`, mas também pode ser `"pdfPoints"`.

### Posicionamento Manual

A posição do retângulo de assinatura em relação à página é especificada pelo parâmetro `manual`. Um retângulo pode ter os parâmetros `top`, `bottom`, `left`, `right`, `width` e `height` conforme mostrado na figura abaixo.

![PAdES rectangle](/images/pki-sdk/pades-rectangle.png)

Por exemplo, para especificar que a representação visual deve ser inserida na última página do documento, tendo tamanho
7cm de largura e 3cm de altura, ficando a 2.5cm das margens esquerda e inferior, conforme a imagem abaixo, escreveríamos
o seguinte código:

![PAdES visual representation manual positioning](/images/pki-sdk/pades-visual-rep-manual-pos.png)

```java
PadesSigner signer = new PadesSigner();
...
PadesVisualRepresentation vr = new PadesVisualRepresentation();
PadesVisualManualPositioning position = new PadesVisualManualPositioning();
position.setPageNumber(-1);                             // Define inserção na última página do documento
PadesVisualRectangle signatureRectangle = new PadesVisualRectangle();
signatureRectangle.setWidth(7);                        // Largura = 7cm
signatureRectangle.setHeight(3);                       // Altura = 3cm
signatureRectangle.setLeft(2.5);                       // Distância da margem esquerda = 2.50cm
signatureRectangle.setBottom(2.5);                     // Distância da margem inferior = 2.50cm
position.setSignatureRectangle(signatureRectangle);
vr.setText(...);
vr.setImage(...);

signer.setVisualRepresentation(vr);
```

Para mais informações sobre como definir a posição da representação da assinatura, veja o artigo
[Definindo um container](containers.md).

### Posicionamento Automático

No posicionamento automático, ao invés de se definir o posicionamento da representação visual em relação à página, define-se um
container que irá receber as representações das sucessivas assinaturas realizadas no documento e o tamanho de cada
retângulo de assinatura dentro do container.

O container de assinaturas é definido pelo parâmetro `container`. 
De maneira similar à especificação do retângulo de assinatura no posicionamento manual, o container pode ter os parâmetros
`top`, `bottom`, `left`, `right`, `width` e `height`.
Já o tamanho de cada retângulo de assintura (`width` e `height`) é definido pelo parâmetro `signatureRectangleSize`.

A propriedade `rowSpacing` define o espaçamento entre as "linhas" das representações visuais. 
Quando não há mais espaço em uma linha, as representações são inseridas em uma nova linha respeitando o `rowSpacing` passado.

Por padrão, as assinaturas são inseridas da esquerda para direita, de cima para baixo. No entanto, esse comportamento pode ser customizado com os parâmetros `horizontalDirection` (`"rightToLeft"` ou `"leftToRight"`) e `verticalDirection` (`"topDown"` ou `"bottomUp"`).

Por exemplo, para especificar que as representações visuais devem ser inseridas sucessivamente na última página do documento dentro de um container espaçado 3cm das bordas laterais, 2cm da borda inferior e 8cm da borda superior, sendo que cada retângulo de assinatura deve ter 7cm de largura por 3cm de altura, conforme ilustrado na imagem abaixo, escreveríamos o seguinte código:

![PAdES visual representation auto positioning](/images/pki-sdk/auto-positioning.png)


```java
PadesSigner signer = new PadesSigner();
...
PadesVisualRepresentation vr = new PadesVisualRepresentation();
PadesVisualAutoPositioning position = new PadesVisualAutoPositioning();
position.setPageNumber(-1);                     // Define inserção na última página do documento
position.setRowSpacing(1.0);                    // 1.00cm de espaçamento entre linhas
PadesSize size = new PadesSize(7.0, 3.0);       // Largura = 7cm e Altura = 3cm
position.setSignatureRectangleSize(size);
PadesVisualRectangle positionContainer = new PadesVisualRectangle();
positionContainer.setLeft(3.0);                 // Distância da margem esquerda = 3.00cm
positionContainer.setRight(3.0);                // Distância da margem direita = 3.00cm
positionContainer.setBottom(2.0);               // Distância da margem inferior = 2.00cm
positionContainer.setTop(8.0);                  // Distância da margem superior = 8.00cm
position.setContainer(positionContainer);
vr.setPosition(position);
vr.setText(...);
vr.setImage(...);

signer.setVisualRepresentation(vr);
```

:::note
O container que definimos acima tem altura e largura variáveis. Essa é uma das muitas possibilidades de especificação do container de assinaturas. Para mais informações, veja o artigo [Definindo um container](containers.md).
:::


As assinaturas realizadas com o código acima terão o resultado esperado conforme a imagem abaixo:

![PAdES visual representation auto positioning result](/images/pki-sdk/visual-rep-result.png)

## Posicionamento de texto e imagem

* Texto

  Interno ao retângulo da representação visual da assinatura, o PKI Express permite a customização do alinhamento, posição e conteúdo do texto a ser inserido. O posicionamento do texto pode ser controlado através da definição de um `container`. Se nenhum container for definido, o texto preencherá todo o retângulo de assinatura.

  O alinhamento do texto dentro do container é customizável pelo parâmetro `horizontalAlign` (`left` ou `right`). O parâmetro `fontSize` permite customizar o tamanho da fonte utilizada no texto da representação.

  Para inserir a data e hora da assinatura é necessario colocar o parâmetro `includeSigningTime` como verdadeiro. E a formatação da data e hora da assinatura é customizável pelo parâmetro `signingTimeFormat`.

  O parâmetro `text` suporta o uso de *tags* que o PKI Express substitui pelas informações contidas no certificado. 

  <a name="pades-tags" />
  * *Tags* genéricas:

    Tag               | Valor
    ----------------- | -----------
    `{{name}}`        | Valor mais apropriado para ser utilizado como nome do assinante (mais recomendado para esse propósito do que o `{{subject_cn}}`)
    `{{national_id}}` | Valor mais apropriado para ser utilizado como número de identidade nacional do assinante. Para certificados ICP-Brasil, corresponde ao CPF do assinante. Para certificados italianos, corresponde ao *codice fiscale* do assinante.
    `{{email}}`       | Endereço de email do assinante
    `{{subject_cn}}`  | O campo **Common Name** (CN) do titular (*subject name*) do certificado do signatário
    `{{issuer_cn}}`   | O campo **Common Name** (CN) do emissor (*issuer name*) do certificado do signatário

  * *Tags* específicas para certificados ICP-Brasil:

    Tag                     | Valor
    ----------------------- | -----------
    `{{br_cpf}}`            | CPF do titular (para certificados de PJ, CPF do responsável pelo certificado)
    `{{br_cpf_formatted}}`  | Mesmo que `{{br_cpf}}` porém formatado como **000.000.000-00**
    `{{br_cnpj}}`           | CNPJ da empresa
    `{{br_cnpj_formatted}}` | Mesmo que `{{br_cnpj}}` porém formatado como **00.000.000/0000-00**
    `{{br_responsavel}}`    | Nome do titular (para certificados de PJ, nome do responsável pelo certificado)
    `{{br_company}}`        | Nome da empresa
    `{{br_oab_numero}}`     | Número de Inscrição junto a Seccional da OAB (sem zeros à esquerda)
    `{{br_oab_uf}}`         | Sigla do Estado da Seccional da OAB
    `{{br_rg_numero}}`      | Número do RG do titular/responsável (sem zeros à esquerda)
    `{{br_rg_emissor}}`     | Órgão emissor do RG do titular/responsável
    `{{br_rg_uf}}`          | UF do órgão emissor do RG do titular/responsável

  * *Tags* suportadas para manter a retrocompatibilidade:

    Tag                    | Tag equivalente
    ---------------------- | ---------------
    `{{signerName}}`       | `{{name}}`
    `{{signerEmail}}`      | `{{email}}`
    `{{signerNationalId}}` | `{{national_id}}`
    `{{issuerCommonName}}` | `{{issuer_cn}}`
    `{{br_oab_numbero}}`   | `{{br_oab_numero}}`

  Como exemplo, definiremos um posicionamento do texto relativo ao retângulo de assinatura conforme a figura abaixo.

  ![PAdES visual text](/images/pki-sdk/pades-visual-text.png)

```java
// Texto da representação visual
PadesVisualText text = new PadesVisualText("Signed by {{name}}"); // Inclui o nome do signatário
text.setFontSize(10.0);                                           // Define tamanho da fonte do texto
text.setIncludeSigningTime(true);                                 // Inclui a data da assinatura
text.setSigningTimeFormat("dd/MM/yy H:mm:ss zzz");                // Define a formatação da data
// Define container do texto
PadesVisualRectangle container = new PadesVisualRectangle();
container.setLeft(0.0);
container.setTop(0.0);
container.setRight(1.5);
container.setBottom(0.5);
text.setContainer(container);
```

* Imagem

  Também é possível definir uma imagem de fundo para o retângulo de assinatura e customizar sua opacidade e alinhamento.

  Como exemplo, definiremos um posicionamento do texto relativo ao retângulo de assinatura conforme a figura abaixo.

```java
PadesVisualImage image = new PadesVisualImage();
image.setContent(...);
image.setHorizontalAlign(PadesHorizontalAlign.Right); // Alinha a imagem horizontamente na direita
image.setVerticalAlign(PadesVerticalAlign.Center);    // Alinha a imagem verticalmente no centro
```
* É possível remover a representação visual:

```java
signatureStarter.setSuppressDefaultVisualRepresentation(true);
```

## Veja também

* [Exemplos completos de representação visual](samples.md)
