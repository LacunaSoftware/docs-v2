---
sidebar_label: "Guia de Integração"
sidebar_position: 0
slug: /signer/integration-guide
---

# Guia de Integração

O Signer é um portal de documentos que permite a realização de assinaturas digitais e eletrônicas, bem como a criação de fluxos complexos. Este guia apresenta as opções de integração para que sua aplicação aproveite ao máximo o potencial do Signer.

:::tip Novo por aqui?
Se é a sua primeira integração, comece pelos [Primeiros passos](../get-started.md), que levam você do zero ao primeiro documento assinado em cerca de 15 minutos. Este guia serve como referência dos casos de uso.
:::

## Autenticação

Todas as chamadas de API exigem uma chave de acesso de API (*API Key*). Essa chave deve ser colocada no cabeçalho de todas as requisições:

```javascript
X-Api-Key: sua-aplicacao|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Toda chave de API está associada a uma Organização previamente cadastrada no Signer. Sendo assim, o escopo dessa chave fica **restrito àquela organização**, isto é, aquela chave só permitirá acessar/criar documentos daquela organização.

:::note
Para obter uma chave de API, entre em contato com o administrador da sua instância.
:::

## Como o fluxo funciona

Na prática, uma integração com o Signer segue quatro etapas. Cada etapa tem uma página dedicada neste guia:

1. **[Criar documentos](./criar-documentos.md)**: envie o arquivo, monte o fluxo de participantes e (opcionalmente) assine dentro da sua própria aplicação.
2. **[Acompanhar documentos](./acompanhar-documentos.md)**: verifique o status, envie lembretes e receba notificações por webhook.
3. **[Baixar e listar](./baixar-e-listar.md)**: obtenha as versões do documento e liste documentos por diferentes critérios.
4. **[Validar assinaturas](./validar-assinaturas.md)**: valide as assinaturas por chave de validação ou pelo arquivo assinado.

E, ao longo da vida do documento, você pode precisar de operações de **[ciclo de vida](./ciclo-de-vida.md)**: cancelar, recusar, enviar nova versão ou deletar.

## Casos de uso

| Caso de uso | O que você faz |
| --- | --- |
| [Criar documentos](./criar-documentos.md) | Upload, criação do fluxo, assinatura embutida, pré-posicionamento de assinaturas e envelopes (múltiplos arquivos) |
| [Acompanhar documentos](./acompanhar-documentos.md) | Verificar status do documento e dos participantes, enviar lembretes e configurar webhooks |
| [Baixar e listar](./baixar-e-listar.md) | Baixar as diferentes versões do documento e listar documentos |
| [Validar assinaturas](./validar-assinaturas.md) | Validar assinaturas por chave ou por arquivo assinado |
| [Ciclo de vida do documento](./ciclo-de-vida.md) | Cancelar, recusar, enviar nova versão e deletar |

## Links Úteis

* [Referência da API (Swagger)](https://www.dropsigner.com/swagger)
* [Exemplos no GitHub](https://github.com/LacunaSoftware/SignerSamples)
* [Assinatura embutida (Widget)](../embedded-signature.md)
* [Webhooks](../webhooks.md)
