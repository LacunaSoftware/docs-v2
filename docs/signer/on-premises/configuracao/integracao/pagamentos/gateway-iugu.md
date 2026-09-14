---
sidebar_label: "Gateway iugu"
sidebar_position: 1
slug: /signer/on-premises/iugu
---

# Gateway de pagamentos iugu

À partir da versão [1.27.0](../../../../changelog.md#v1-27-0), é possível integrar o Signer diretamente com o Gateway de Pagamentos da [iugu](https://www.iugu.com/). Desta forma, 
depois que uma fatura é fechada, os próprios usuários/organizações podem realizar o pagamento com cartão de crédito, boleto bancário ou Pix.

## Configuração no painel de controle da iugu

Para contratar a iugu, é preciso escolher um [plano de assinatura](https://www.iugu.com/planos/). Cada plano traz funcionalidades, mudanças nas tarifas e custos por transação que 
devem ser avaliados pelo administrador da instância, mas o Signer é capaz de funcionar plenamente com o plano mais básico ("Conheça a iugu").

Após realizar [cadastro na iugu](https://auth.iugu.com/new_user?service=https%3A%2F%2Falia.iugu.com%2F), é preciso acessar o [painel de controle](https://alia.iugu.com/) e gerar 
um API Token. Para isso, acesse `Configurações`> `Integração via API` e clique no botão Novo:

![iugu config API](/images/signer/iugu_config_api.png)

O tipo do token deve ser `Produção`. Adicione também uma descrição, exemplo: "API Signer Prod".

![iugu new API](/images/signer/iugu_new_api.png)

Em seguida, obtenha o ID de sua conta acessando `Configurações`> `Informações gerais`. Abaixo de `CONTA` será exibido o ID da sua conta na iugu.

![iugu account id](/images/signer/iugu_get_accountId.png)

O próximo passo é configurar o Webhook para notificar o Signer sobre os pagamentos. Ainda na tela de configurações, acesse `Comunicação via Gatilhos` e depois clique no botão Novo:

![iugu config Webhook](/images/signer/iugu_config_webhook.png)

O campo URL deve ser preenchido com o endereço de sua instância do Signer seguido do caminho padrão de webhooks conforme o exemplo abaixo:

```
https://seu-signer.com.br/api/webhooks/iugu/invoice/changed
```

Caso ocorra erro ao tentar registrar o webhook, adicione `?noecho` ao final da URL.

O campo autorização deve ser preenchido da seguinte forma:

```javascript
Bearer WebhooksAuthKey
```
`WebhooksAuthKey` pode ser qualquer valor, mas recomendamos que seja gerada uma string aleatória de alta entropia. Entre em contato conosco para receber instruções de como
gerar esse valor.

:::warning
* O webhook deve ser gerado no ambiente de produção (o ambiente selecionado é exibido no topo da página).
* O campo de autorização deve obrigatoriamente iniciar com `Bearer ` como mostrado no exemplo.
* O evento selecionado deve ser `Mudança de estado de Fatura`.
:::


![iugu new API](/images/signer/iugu_new_webhook.png)

Em seguida, desabilite a cobrança automática feita diretamente pela iugu, pois o Signer já possui seu próprio sistema de cobrança. Acesse a opção `Recebimento`> 
`Régua de Cobrança` e clique em `Alterar fluxo de cobrança`.

![iugu config Charge](/images/signer/iugu_config_charge.png)

Deixe somente o fluxo "Expira a fatura" com 5 dias após o vencimento.

![iugu change Charge](/images/signer/iugu_change_charge.png)

:::note
A opção "Expira a fatura" é um mecanismo da iugu para marcar uma fatura como expirada após alguns dias depois do vencimento. É recomendado pelo menos 5 dias, para que pagamentos 
:::

com boletos que tenham sido feitos até o vencimento possam ter 5 dias para compensação.

O último passo é conferir se todos os meios de pagamento: boleto bancário, cartão de crédito e Pix estão habilitados. Acesse `Configurações`> `Recebimentos` e selecione
cada um dos métodos de pagamentos listados, marcando a opção "Ativo" e clicando no botão "Salvar":

![iugu enable payment methods](/images/signer/iugu-enable-payment-methods.png)

## Configuração no Signer

Usuários e organizações que já tinham dados de faturamento cadastrados antes da versão [1.27.0](../../../../changelog.md#v1-27-0), precisarão informar os dados novamente para que 
sejam realizadas novas validações das informações conforme necessidades da iugu.

![Billing address error message](/images/signer/invoices-billing-address-error-message.png)

Após os dados de faturamento serem submetidos novamente, o usuário poderá definir um método de pagamento padrão para sua conta pessoal ou de organização: 

![Select payment method](/images/signer/select-payment-method.png)

:::note
O método de pagamento padrão para cartões de crédito também pode ser escolhido no momento de pagamento de uma fatura.
:::


Os meios de pagamentos disponíveis para o usuário/organização são Pix, boleto bancário e cartão de crédito. Para cartões de crédito, é possível selecionar um que já tenha sido 
cadastrado ou cadastrar um novo:

![Payment methods](/images/signer/payment-methods.png)

:::note
As bandeiras aceitas para pagamentos com cartão de crédito são:
* American Express
* Diners
* Elo
* MasterCard
* Visa
:::


Quando uma fatura é fechada e o usuário/organização poderá pagar aquela fatura na tela de detalhes conforme abaixo:

![Invoice details pay](/images/signer/invoice-details-pay.png)

![Pay invoice](/images/signer/pay-invoice.png)

Após o pagamento, o status da fatura é atualizada com o método de pagamento utilizado, dia e horário.

![Paid invoice](/images/signer/paid-invoice.png)

## Falhas de pagamento com cartão de crédito

O pagamento de uma fatura com cartão de crédito pode ser negado por diversas causas. Um código de erro será exibido no momento do pagamento e pode ser consultado nessa 
[lista de erros](https://support.iugu.com/hc/pt-br/articles/206858953-Como-identificar-o-erro-da-tentativa-de-pagamento-).

![Payment with creditcard failed](/images/signer/payment-with-creditcard-failed.png)

:::warning
Em alguns casos, é possível que o proprietário do cartão receba via SMS ou no APP do cartão, a informação de cobrança realizada com sucesso, porém, caso a fatura 
do usuário/organização não conste como PAGA, este lançamento de cobrança é automaticamente estornado na fatura do cartão, dentro de 7 a 10 dias úteis.
:::


## Cobrança automática

O Signer possui um sistema de cobrança automática para cartão de crédito que é feito quando o usuário/organização salva um cartão de crédito como método de pagamento padrão.

A cobrança automática é agendada para a data de vencimento da fatura, mas a cobrança pode demorar um ou dois dias adicionais.

No entanto, existem alguns casos em que a cobrança automática não será feita:
* Se o método de pagamento padrão do usuário/organização no momento de fechamento da fatura não for cartão de crédito.
* Se a fatura for paga antes do dia de vencimento.
* Se o usuário/organização trocar o método de pagamento da fatura para boleto bancário. Caso o boleto seja gerado, a cobrança automática será cancelada somente para essa fatura.

Uma forma de verificar se a cobrança automática está agendada, é consultar nos detalhes da fatura se são exibidas as informações de cobrança automática como abaixo:

![Invoice auto charge](/images/signer/invoice-auto-charge.png)

## Modo de teste

Sua instância pode ser configurada para o modo de teste a fim de testar a integração e as credenciais da iugu. Para isso utilize as credenciais do ambiente de teste lembrando
de definir nas [configurações da instância](../../settings.md) a opção de teste também.

No modo de teste, apenas cartões de créditos de teste podem ser utilizados conforme definido na página [Usar cartões em modo teste](https://support.iugu.com/hc/pt-br/articles/212456346-Usar-cart%C3%B5es-de-teste-em-modo-de-teste).

Para testar o pagamento com Pix, basta utilizar o botão que aparece abaixo do QR code:

![Pix copy code](/images/signer/pix-copy-code.png)

Será copiada uma URL com estrutura semelhante à exibida abaixo:

```javascript
http://faturas.iugu.com/iugu_pix/a32c46b6-ab85-469e-bafc-601c1a4e96ae/test/pay
```

Acesse essa URL no navegador para simular a realização do pagamento.

Para testar o pagamento com o boleto, obtenha a URL da mesma forma que no pix, mas troque `test` por `sample` e `iugu_pix` por `iugu_bank_slip` conforme abaixo:

```javascript
http://faturas.iugu.com/iugu_bank_slip/a32c46b6-ab85-469e-bafc-601c1a4e96ae/sample/pay
```
