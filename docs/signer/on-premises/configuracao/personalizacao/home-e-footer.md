---
sidebar_label: "Home page e footer"
sidebar_position: 4
slug: /signer/on-premises/customization/home-e-footer
---

# Home page e footer

Existem duas formas de configurar a home page:

* **Configuração simples**: personaliza apenas a área de destaque, mantendo o restante da página.
* **Configuração avançada**: substitui a home inteira por uma página estática.

## Configuração simples

Permite personalizar a área demarcada abaixo:

![Home page personalizada](/images/signer/home-page.png)

É preciso apenas fornecer uma imagem de como gostaria que ficasse ou então o HTML/CSS correspondente.

Caso deseje criar seu próprio HTML e CSS, as seguintes regras devem ser observadas:

* Criar um arquivo HTML para cada linguagem disponível, no formato `home-<language>.html`. Exemplo:
  `home-pt.html`, `home-es.html` e `home-en.html`.
* Os arquivos HTML não podem conter tags `script` nem *inline styles*.
* Os arquivos HTML poderão usar classes definidas na biblioteca *Bootstrap* versão `4.3.1` referentes aos
  seguintes módulos:
	* [Grid](https://getbootstrap.com/docs/4.3/layout/grid)
	* [Utilities for layout](https://getbootstrap.com/docs/4.3/layout/utilities-for-layout)
* A aplicação segue o padrão [Material Design](https://material.io) e, portanto, classes definidas na
  biblioteca [Angular Material UI](https://material.angular.io) também podem ser utilizadas.
* Caso seja necessário personalizar o CSS, deve ser criado um arquivo denominado `main.css`.
* Os arquivos HTML e CSS devem ser colocados na pasta `assets` do *Blob Storage* configurado. Ao fazer a
  atualização, a aplicação precisa ser reiniciada.

## Configuração avançada (página estática)

Permite personalizar toda a home page, de maneira que a página passa a ser estática. Exemplo:

![Home page personalizada avançada](/images/signer/advanced-home-page.png)

Para isso, é preciso fornecer um arquivo HTML chamado `index.html` acompanhado de uma pasta denominada
`theme-assets` com todos os recursos de que o arquivo depender: imagens, CSS e JS. **Subpastas não são
suportadas**, isto é, os arquivos devem ser adicionados na raiz da pasta `theme-assets`:

![Estrutura de pastas](/images/signer/advanced-folder-structure.png)

Todos os arquivos devem ser colocados na pasta `assets` do *Blob Storage* configurado. Ao fazer a
atualização, a aplicação precisa ser reiniciada.

:::warning
Ao usar esta abordagem, recomenda-se que não sejam feitas muitas alterações no cabeçalho da página, tendo
em vista que existem páginas da área externa da aplicação cujo cabeçalho não irá seguir esse modelo, como
por exemplo a tela de assinatura externa e a de validação de documentos.
:::

## Footer

Permite personalizar o footer da home page, caso a configuração de home page seja a simples:

![Footer](/images/signer/footer.png)

É preciso apenas fornecer uma imagem de como gostaria que ficasse ou então o HTML/CSS correspondente.

## Veja também

* [Identidade visual](identidade-visual.md)
* [Configurações do Signer](../settings.md)
