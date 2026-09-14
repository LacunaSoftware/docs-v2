---
sidebar_label: "Nota Fiscal (NFS-e)"
sidebar_position: 4
slug: /signer/on-premises/nfse
---

# Sistema de Nota Fiscal de Serviços Eletrônica (NFS-e)

Permite a emissão e cancelamento de NFS-e para faturas pagas diretamente no Signer com uma integração ao [NFE.io](https://nfe.io/)

## Integração do Signer com o NFE.io

Atualmente as principais capitais do Brasil já possuem integração, porém a lista completa de prefeituras já integradas precisa ser solicitada à equipe comercial do NFE.io, juntamente com os preços. 

### Primeiros passos

1. Faça o credenciamento na prefeitura para emissão de NFS-e, utilize o [documento da NFE.io](https://nfe.io/docs/documentacao/nota-fiscal-servico-eletronica/credenciamento-prefeitura/).
2. Crie uma conta - https://nfe.io/docs/nossa-plataforma/criar-conta/
3. Crie uma empresa - https://nfe.io/docs/nossa-plataforma/criar-empresa/ 
4. Insira os dados fiscais - https://nfe.io/docs/nossa-plataforma/alterar-empresa/ 
5. Faça o upload do certificado digital - https://nfe.io/docs/nossa-plataforma/upload-certificado/ 
6. [Entre em contato com a NFE.io](https://nfe.io/contato/) para negociação de preços e ativação da conta para produção.
7. Ainda em contato com o NFE.io, consulte se a prefeitura utilizada para emitir a nota exige o CNAE (Classificação Nacional de Atividades Econômicas). Caso seja necessário utilize a [busca online CNAE](https://concla.ibge.gov.br/busca-online-cnae.html) do IBGE.
8. Caso existam dúvidas específicas sobre NFS-e, a NFE.io disponibiliza um [documento](https://nfe.io/docs/documentacao/nota-fiscal-servico-eletronica/conceitos/) que resume explicações sobre a Nota Fiscal de Serviço.

### Obtenção de credenciais

Para configurar a integração será preciso obter a chave de acesso e o id de sua empresa. Acesse o menu Empresas, depois clique no nome da empresa que deseja emitir a NFS-e.

![Select company](/images/signer/nfeio-companies.png)

Depois, deslize pela página até encontrar a seção `Chaves de Acesso`. Nela são exibidas: a chave de acesso (Api Key) e o ID de empresa (CompanyId).

![Api key and Company ID](/images/signer/nfeio-company-and-api.png)

### Criação do Webhook

O próximo passo é a criação do webhook, serviço responsável por notificar o Signer quando as NFS-e forem emitidas ou canceladas. Acesse a opção Conta, deslize a página 
e selecione a seção `Webhooks`:

![Webhooks card](/images/signer/nfeio-webhook-option.png)

Depois clique no botão Criar Webhook:

![Create webhook](/images/signer/nfeio-create-webhook.png)

Selecione o tipo de webhook como `NFS-e` e configure os campos conforme a imagem abaixo:

![Config webhook](/images/signer/nfeio-config-webhook.png)

O campo endereço (URL) deve ser preenchido com o endereço de sua instância do Signer seguido do caminho padrão de webhooks conforme o exemplo abaixo:

```
https://seu-signer.com.br/api/webhooks/nfeio/nfse/changed
```

Por fim, o campo senha para autenticação da mensagem (HMAC) pode ser uma senha qualquer, mas é recomendado que tenha pelo menos 8 dígitos.

### Código de serviço

O Código de Serviço é um número que define o tipo de serviço prestado para ser utilizado na NFS-e. Esse código é fornecido pela prefeitura na qual será emitida a nota, 
assim como a alíquota de imposto municipal.

O NFE.io disponibiliza uma lista de serviços cadastrados para a cidade que será emitida a NFS-e. Acesse o menu Empresas, selecione a empresa que emitirá a NFS-e 
e clique na seção `Lista de serviços cadastrados`.

![Companies](/images/signer/nfeio-companies.png)

![Service codes](/images/signer/nfeio-list-service-codes.png)

Como mencionado anteriormente, cada prefeitura possui sua própria lista de códigos e sua descrição. Usando Brasília como exemplo, o Signer se enquadra no código ``0103`` , mas caso haja dúvidas sugerimos que consulte o contador de sua empresa.

![Brasília service codes](/images/signer/nfeio-brasilia-service-codes.png)

## Emissão e cancelamento de NFS-e no Signer

### Emitir notas

Depois que todos os parâmetros tenham sido configurados com o NFE.io e o Signer, será possível emitir notas diretamente pela página de Detalhes da fatura, para faturas pagas. 

![Issue NFS-e](/images/signer/issue-nfse.png)

:::note
* Para emitir ou cancelar notas é preciso ser o administrador da instância.
* O sistema de notas fiscais não depende de integração com a iugu para funcionar.
* Caso a instância do Signer também possua integração com a iugu, ao realizar o pagamento da fatura, automaticamente será feito o pedido de emissão da NFS-e.
:::


:::warning
A emissão e o cancelamento de NFS-es depende do sistema da prefeitura. Se o sistema da prefeitura estiver instável, algumas notas podem demorar horas ou até dias 
para serem emitidas/canceladas.
:::


Também é possível emitir uma NFS-e para uma fatura com a requisição abaixo:

```javascript
POST /api/invoices/{id}/receipts
```

Quando a nota fiscal é emitida, um e-mail do próprio NFE.io é enviado ao usuário/organização responsável pela fatura com o PDF e o XML da NFS-e. Além disso, é 
possível baixar ou visualizar a nota na página de Detalhes da fatura:

![View or Download NFS-e](/images/signer/view-or-download-nfse.png)

### Cancelar notas

Depois que uma NFS-e é emitida, seu cancelamento pode ser feito na tela de Detalhes da fatura.

![Cancel NFS-e](/images/signer/cancel-nfse.png)

Também é possível cancelar uma NFS-e para uma fatura com a requisição abaixo:

```javascript
DELETE /api/invoices/{id}/receipts
```

:::warning
O cancelamento só pode ser feito depois que a nota é emitida, caso ainda esteja em processo de emissão deverá aguardar até que seja emitida. A mesma lógica se aplica 
:::

para uma nova emissão realizada após um cancelamento.