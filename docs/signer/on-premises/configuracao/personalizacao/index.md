---
sidebar_label: "Visão geral"
sidebar_position: 1
slug: /signer/on-premises/customization
---

# Personalização do Signer

O Signer pode ser personalizado em **dois níveis**, e essa distinção é o que determina quem faz cada
ajuste:

* **Instância**: vale para todo o Signer. Inclui tema de cores, logos, home page, textos das notificações
  e domínio. São definições feitas na implantação ou pelo administrador do sistema.
* **Organização**: vale apenas para os documentos daquela organização. Inclui logo e cores dos e-mails,
  logo na versão para impressão, carimbo de validação e imagem da representação visual. Cada
  administrador de organização configura a sua, pela própria aplicação.

## O que dá para personalizar

| O que | Nível | Quem configura | Onde |
|---|---|---|---|
| Tema de cores da aplicação | Instância | Equipe de implantação | [Identidade visual](identidade-visual.md) |
| Logos da aplicação (4 arquivos) | Instância | Equipe de implantação | [Identidade visual](identidade-visual.md) |
| Home page (simples ou estática) | Instância | Equipe de implantação | [Home page e footer](home-e-footer.md) |
| Footer da home page | Instância | Equipe de implantação | [Home page e footer](home-e-footer.md) |
| Servidor SMTP próprio | Instância | Administrador do sistema | [Servidor de e-mail (SMTP)](../integracao/email-smtp.md) |
| Textos de e-mails e notificações | Instância | Administrador do sistema | [E-mails e notificações](emails.md) |
| Provedor de SMS | Instância | Administrador do sistema | [Envio de SMS](../integracao/sms.md) |
| Domínio próprio | Instância | Cliente (DNS) e implantação | [Domínio próprio](dominio.md) |
| Logo e cores dos e-mails | Organização | Admin da organização | [E-mails e notificações](emails.md#personalizacao-por-organizacao) |
| E-mail de suporte, prefixo do assunto e conteúdo extra dos e-mails | Organização | Admin da organização | [E-mails e notificações](emails.md#personalizacao-por-organizacao) |
| Logo e layout da versão para impressão | Organização | Admin da organização | [Documentos gerados](documentos.md) |
| Logo do carimbo de validação | Organização | Admin da organização | [Documentos gerados](documentos.md) |
| Imagem da representação visual da assinatura | Organização | Admin da organização | [Documentos gerados](documentos.md) |

## Nesta seção

* [Identidade visual](identidade-visual.md) trata do tema de cores e das logos.
* [Temas disponíveis](temas.md) traz a galeria completa, com o código de cada tema.
* [Home page e footer](home-e-footer.md) mostra as duas formas de personalizar a home.
* [E-mails e notificações](emails.md) cobre o branding dos e-mails e a customização de textos.
* [Documentos gerados](documentos.md) trata da versão para impressão, do carimbo de validação e da
  representação visual da assinatura.
* [Domínio próprio](dominio.md) trata de servir a instância em um domínio seu.

:::note
Itens marcados como "equipe de implantação" não são autoatendidos. Entre em contato com a equipe
informando o que deseja, como o código do tema, os arquivos de logo ou o HTML da home, para que os ajustes
sejam aplicados à sua instância.
:::

:::tip Canais de envio
A configuração dos canais de envio de notificações fica na seção de Integração:
[Envio de SMS](../integracao/sms.md), [Servidor de e-mail (SMTP)](../integracao/email-smtp.md) e
[Integração com WhatsApp](../integracao/whatsapp.md).
:::
