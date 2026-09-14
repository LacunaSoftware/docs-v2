---
sidebar_label: "Identidade visual"
sidebar_position: 2
slug: /signer/on-premises/customization/identidade-visual
---

# Identidade visual

## Esquema de cores

A aplicação é tematizada por um tema com duas cores principais:

* **Theme**: cor do tema.
* **Accent**: cor de contraste.

![Esquema de cores](/images/signer/color-scheme.png)

Cada tema é identificado por um **código de três letras**, como `acr` para *amazon-cornell-red*. A lista
completa está em [Temas disponíveis](temas.md).

Para trocar o tema da sua instância, informe o código desejado à equipe de implantação.

:::note
Caso nenhum dos temas atenda, um novo tema pode ser criado sob medida. Basta informar as cores *theme* e
*accent* desejadas.
:::

O mesmo código de três letras é usado para tematizar o widget de
[Assinatura Embutida](../../../apis/embedded-signature.md).

## Logos

A aplicação usa **quatro** arquivos de logo, servidos em `/theme-assets/`:

| Arquivo | Onde aparece |
|---|---|
| `light-logo` | Sobre fundo escuro, no menu lateral e na barra superior da área autenticada, e como logo padrão dos e-mails |
| `dark-logo` | Sobre fundo claro, no cabeçalho da área pública e nas telas externas |
| `stamp-logo` | Logo padrão da versão para impressão (manifesto de assinaturas) |
| `val-stamp-logo` | Logo padrão do carimbo de validação |

Exemplos de `light-logo` e `dark-logo`:

![Light Logo](/images/signer/light-logo-sample.png)

![Dark Logo](/images/signer/dark-logo-sample.png)

Os arquivos devem ser entregues à equipe de implantação, que os coloca na pasta `assets` do *Blob Storage*
configurado para a instância, o mesmo local usado pelos arquivos da [home page](home-e-footer.md). Depois
da atualização, a aplicação precisa ser reiniciada.

:::tip
`stamp-logo` e `val-stamp-logo` definem apenas o **padrão da instância**. Cada organização pode enviar a
sua própria logo para a versão para impressão e para o carimbo de validação sem depender da implantação,
como mostra a página [Documentos gerados](documentos.md).
:::

## Veja também

* [Temas disponíveis](temas.md)
* [Home page e footer](home-e-footer.md)
* [Documentos gerados](documentos.md)
