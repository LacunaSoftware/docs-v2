---
sidebar_label: "Arquivos de pagamento CNAB240"
sidebar_position: 13
---

# Arquivos de pagamento CNAB240

O Lacuna Bulk Signer pode tratar um arquivo como uma **remessa CNAB240 do Banco do Brasil** em vez de
como bytes opacos: interpretá-lo, recusar-se a assiná-lo se não for uma remessa em conformidade, e
registrar o que ele movimenta, para que um operador possa ver o dinheiro sem abrir o arquivo.

A verificação é **opcional por perfil de assinatura e desligada por padrão**. Ela é também a
precondição para a [etapa de aprovação](approvals.md) — um aprovador a quem não se pode mostrar o valor
não está aprovando nada significativo, então um perfil com um bloco `Approval` precisa também carregar
`CheckCNAB240`.

## Habilitando a verificação

```json
{
  "Signing": {
    "Profiles": [
      {
        "Name": "folha",
        "Format": "Cades",
        "CheckCNAB240": true
      }
    ]
  }
}
```

Todo arquivo roteado por aquele perfil é interpretado antes de ser assinado. Ligue-a para a pasta que
recebe remessas e deixe-a desligada em todo o resto — um PDF roteado por um perfil com `CheckCNAB240` é
recusado, porque ele não é uma remessa.

O banner de inicialização acrescenta `cnab240=on` à linha do perfil, de modo que a postura fique visível
no boot.

A chave vincula sem diferenciar maiúsculas: `CheckCNAB240` e `CheckCnab240` são a mesma chave.

## O que é uma remessa

Um arquivo CNAB240 tem largura fixa: **240 bytes por registro**, registros separados por um delimitador
de linha (o interpretador aceita CRLF, LF, ou nenhum delimitador). A posição 8 de cada registro carrega
o *Tipo de Registro*:

| Tipo | Registro |
|------|----------|
| `0` | Header do Arquivo — um, o primeiro |
| `1` | Header do Lote |
| `3` | Detalhe — os registros de pagamento |
| `5` | Trailer do Lote |
| `9` | Trailer do Arquivo — um, o último |

Uma **remessa** (*Código Remessa / Retorno* = `'1'`) é uma ordem de pagamento que você envia ao banco.
Um **retorno** (`'2'`) é o comprovante do banco voltando. Somente remessas são assinadas; um retorno é
recusado nominalmente, porque assinar um comprovante bancário não tem sentido e soltar um em uma pasta
monitorada é um erro real de operador.

Registros de detalhe carregam um *Código de Segmento* na posição 14. Segmentos **primários** instruem um
pagamento e carregam seu valor:

| Segmento | Paga |
|----------|------|
| `A` | Crédito em conta, DOC/TED, Pix, depósito judicial |
| `J` | Boleto (títulos), FGTS Digital |
| `N` | Tributos (DARF, GPS, IPVA, DPVAT, …) |
| `O` | Boleto de concessionária (água, luz, telefone), tributos com código de barras |

Segmentos **complementares** — `B`, `C`, `J-52`, `W`, `W1`, `Z` — carregam informação extra sobre o
pagamento do registro primário que os antecede. Alguns têm um campo de valor; **ele nunca é contado.** O
BB não processa aqueles valores, e somá-los duplicaria um pagamento já contado em seu registro primário.

Cada registro de detalhe também carrega um *Tipo de Movimento*: `'0'` é uma **inclusão** (um pagamento) e
`'9'` é uma **exclusão** (a retirada de uma instrução enviada anteriormente).

## O que é validado

Somente estrutura e formato:

- Todo registro tem exatamente 240 bytes, excluído o delimitador.
- Os tipos de registro aparecem na ordem: `0` … (`1` … `3`* … `5`)+ … `9`.
- O *Código do Banco na Compensação* é `001`.
- O *Código Remessa / Retorno* é `'1'`.
- A contagem de registros do Trailer do Lote confere com os registros efetivamente no lote, e as
  contagens de lotes e registros do Trailer do Arquivo conferem com o arquivo.
- Todo *Código de Segmento* é um que o interpretador reconhece — um desconhecido é uma **falha dura**,
  não um registro pulado.
- O *Tipo de Movimento* em um segmento portador de valor é `'0'` ou `'9'`.
- O *Valor do Pagamento* em um segmento portador de valor tem 15 dígitos ASCII. Um valor em branco ou
  preenchido com espaços significa que o registro está desalinhado, não que o pagamento vale zero.

## O que *não* é validado

Dígitos verificadores, validade de CPF/CNPJ, DV de código de barras, plausibilidade de agência/conta,
regras de convênio, e cada nota de "Instrução BB" por campo.

:::info O Bulk Signer não é o banco
O BB tem um motor de crítica, publica seus códigos de ocorrência, e os devolve em um retorno. Um arquivo
que este produto rejeite indevidamente bloqueia uma folha de pagamento sem recurso; um arquivo que ele
aceite indevidamente volta do BB nomeando o problema exato — um diagnóstico melhor do que qualquer coisa
que este interpretador pudesse produzir.
:::

Duas consequências que vale conhecer:

- **As datas de pagamento são interpretadas, mas nunca validadas aqui.** Uma *Data do Pagamento*
  preenchida com zeros ou malformada resulta em nenhuma data, e não em uma violação. A obsolescência é
  uma questão para a fronteira da assinatura, e é lá que ela é feita — veja
  [Datas de pagamento que já passaram](#datas-de-pagamento-que-já-passaram).
- **O checksum de valores do Trailer do Lote não é imposto.** O BB define a *Somatória dos Valores* como
  uma soma exclusiva do Segmento J, mas arquivos reais a preenchem com um total de todo o lote;
  implementá-la literalmente rejeitaria remessas válidas. As reconciliações de contagem, que de fato
  validam exatamente, são impostas no lugar.

## Como o total é definido

> **Total** = a soma do *Valor do Pagamento* nos segmentos primários **A, J, N e O** onde o
> *Tipo de Movimento* = `'0'`.

Três regras decorrem, e cada uma muda o número:

**Segmentos complementares não contribuem com nada.** Seus valores opcionais descrevem um pagamento já
contado em seu registro primário.

**Exclusões são contadas separadamente e nunca compensadas.** Um registro de exclusão carrega um campo
de valor preenchido, então uma soma ingênua conta um cancelamento como um pagamento. Subtraí-lo não é
melhor: uma exclusão é *a retirada de uma instrução*, não dinheiro negativo. Compensar uma exclusão de
R$ 500,00 contra um pagamento de R$ 1.000,00 produz R$ 500,00 — um número que não corresponde nem ao que
sai da conta nem ao que o arquivo instrui. Portanto o total é R$ 1.000,00 e a contagem de cancelamentos é
1, exibidos lado a lado.

**Dinheiro é centavos em um inteiro, nunca um decimal.** Valores CNAB240 são `13,2`, então os quinze
dígitos brutos já *são* os centavos — sem escalonamento, sem separador decimal a interpretar. A conversão
para reais acontece somente na fronteira de exibição.

Ao lado do total, o pipeline registra a contagem de pagamentos, a contagem de cancelamentos, as datas de
pagamento mais antiga e mais recente, o pagador, e um **SHA-256 dos bytes exatos interpretados**. O hash
é a âncora à qual a [etapa de aprovação](approvals.md#o-que-é-aprovado) se vincula — uma aprovação é uma
afirmação sobre *bytes*, não sobre um id de job — e ele é escrito na mesma atualização de banco de dados
que os números, precisamente para que o hash e os números nunca possam descrever bytes diferentes. Ele é
reconferido imediatamente antes da assinatura.

### Quem está pagando

O *Nome da Empresa* (posições 73–102) e o *Número de Inscrição da Empresa* (posições 19–32, tipado pelo
*Tipo de Inscrição* na 18) são lidos do Header do Arquivo e registrados junto com os números. A
identificação fiscal é armazenada como dígitos puros — onze para um CPF, catorze para um CNPJ — com a
pontuação aplicada somente na fronteira de exibição.

Um bloco de pagador em branco ou preenchido com zeros **não** é uma violação: recusar um arquivo que o BB
aceitaria é a direção cara. Preenchido com zeros é lido como ausente, e não como catorze zeros.

O pagador existe para a página de aprovação: "R$ 1.240.000,00 saem de uma conta" é uma pergunta diferente
de "R$ 1.240.000,00 saem *desta* conta", e apenas a segunda é respondível.

:::note
Os números são registrados **somente em uma interpretação limpa.** Em um arquivo que reprova a
validação, o que quer que o interpretador tenha lido antes de desistir é descartado em vez de
persistido — um número em que ninguém pode confiar é pior que nenhum número.
:::

## Datas de pagamento que já passaram

Uma remessa pode estar perfeitamente bem formada e ainda assim ser a coisa errada a assinar. Um arquivo
exportado no dia 3 para pagamentos datados do dia 5 que só chega ao assinador no dia 11 está obsoleto: o
BB ou o recusará ou o processará em uma data que ninguém pretendeu, e uma assinatura faz a data errada
parecer deliberada.

> Imediatamente antes da assinatura, a **mais antiga** *Data do Pagamento* registrada para o arquivo é
> comparada com hoje. Se ela já passou, o job falha e nenhuma assinatura é produzida.

A comparação é sobre a data mais antiga, não a mais recente — um pagamento já vencido em um arquivo que
também paga na semana que vem continua sendo um pagamento que o BB vai rejeitar ou datar errado. Um
arquivo sem pagamentos datados não é afetado e assina normalmente.

| | |
|---|---|
| Status do job | `Failed`, `ErrorMessage = cnab240.payment-date-passed` |
| Cópia em stage | realocada para `error/<jobId>/` |
| Histórico do job | `CNAB240 payment date has passed: earliest payment date 05/08/2026, today 11/08/2026.` |
| Evento operacional | `Cnab240PaymentDatePassed` |

O código é deliberadamente distinto do `cnab240.invalid`: um arquivo inválido precisa de seu enquadramento
corrigido, um obsoleto precisa ser reexportado com datas atuais. **Repetir o mesmo arquivo falha da mesma
forma**, porque as datas dentro dele não mudaram — reexporte do sistema de origem e passe o novo arquivo
por Upload, Retry ou Rescan.

### Por que a guarda fica na chamada de assinatura

A verificação roda na assinatura, e não ao lado da interpretação, e os dois não são o mesmo lugar. O valor
da guarda é exatamente proporcional a quanto tempo um arquivo espera entre ser lido e ser assinado, e essa
lacuna pode ser muito longa — a [etapa de aprovação](approvals.md) retém um job sobre um humano por um
período indefinido precisamente nesse ponto. Colocar a verificação na assinatura significa que o trabalho
de aprovação a herda de graça, sem chance de uma cópia do momento da interpretação e uma cópia do momento
da assinatura discordarem. Um job liberado reentra na fila comum e passa novamente por esta guarda a
caminho do assinador.

O mesmo raciocínio a coloca nos dois caminhos de assinatura. Para um perfil do
[Lacuna Signer](lacuna-signer.md) a guarda roda no **despacho**, já que aquele é o momento em que o
arquivo parte para uma assinatura remota. Um arquivo que este produto se recusa a assinar localmente é um
arquivo que ele também não pode entregar a um assinador remoto.

### Fuso horário

A *Data do Pagamento* é uma data de calendário bancário, não um instante, então "hoje" é a **data local
do host**.

:::warning
Em um host rodando em UTC enquanto o pagador está em `America/Sao_Paulo`, a data local vira três horas
mais cedo e um arquivo com vencimento hoje começa a ser recusado às 21:00 no horário local. Defina o fuso
horário do host como o do pagador — `TZ=America/Sao_Paulo` no container ou na unit do systemd — para que
a fronteira caia onde um operador espera.
:::

## O que o operador vê

Um painel **Arquivo de pagamento** em `/jobs/{id}`, acima dos detalhes do perfil:

| Campo | Exibido como |
|-------|--------------|
| Total | `R$ 3.879.613,26` |
| Pagamentos | contagem de inclusões |
| Cancelamentos | contagem de exclusões, âmbar quando diferente de zero, `nenhum` caso contrário |
| Datas de pagamento | `05/08/2026`, ou `05/08/2026 – 20/08/2026` quando o arquivo paga ao longo de um intervalo |
| SHA-256 do conteúdo | o digest em hexadecimal |

O painel aparece somente em jobs que foram interpretados como arquivos de pagamento. Moeda e datas são
renderizadas a partir de um formato que a própria aplicação fixa, e não a partir da cultura do host, de
modo que os dígitos se leem identicamente em um serviço do Windows, em um container Debian e na máquina
de um desenvolvedor — e permanecem na forma brasileira qualquer que seja o
[idioma de exibição](dashboard.md#idioma-de-exibição) que o leitor tenha escolhido.

## Os pagamentos individuais

Abaixo do resumo, uma tabela **Pagamentos** lista cada registro portador de valor do arquivo — número do
registro, lote, segmento, o nome no registro, o CPF/CNPJ do beneficiário, a conta de destino, a data de
pagamento e o valor. As linhas de exclusão são rotuladas e seu valor riscado, porque o valor é real mas
nenhum dinheiro se move.

A mesma tabela é renderizada na página voltada ao aprovador, onde as colunas de identificação e conta são
mascaradas para um leitor anônimo — veja
[Aprovações](approvals.md#os-pagamentos-individuais). Na página do operador nada é mascarado: um operador
atrás de um pagamento que o BB rejeitou precisa dos dígitos de que o BB está reclamando, e ele se
autenticou para obtê-los.

:::warning A coluna de nome é "o nome no registro"
O BB rotula o campo de forma diferente em cada segmento, e no **Segmento N ele é o contribuinte, não o
beneficiário** — um tributo é pago ao governo, e o nome no registro é de quem o deve. Leia "beneficiário"
como "o nome no registro", a menos que o arquivo seja de segmento A, J ou O.
:::

Um nome em branco é exibido como *(não informado)*. O BB não exige o campo, então um em branco é um
arquivo válido, e não um defeito.

### De onde vêm a identificação e a conta

Nenhuma das duas está no registro primário de uma transferência de crédito, o que é obra do próprio
layout, e não uma peculiaridade deste interpretador:

| Segmento | CPF / CNPJ do beneficiário | Conta de destino |
|----------|----------------------------|------------------|
| **A** — crédito em conta, TED, Pix | do **Segmento B** que o segue (18 / 19–32) | Agência 24–28 + DV 29, conta 30–41 + DV 42 |
| **J** — boleto | não lido — veja abaixo | nenhuma; pago contra um código de barras |
| **N** — tributos | inline, na janela de overlay (117–118 / 119–132) | nenhuma; pago ao governo |
| **O** — concessionárias | nenhuma no registro | nenhuma; pago contra um código de barras |

Três coisas naquela tabela valem ser conhecidas:

- **O Segmento B é o único segmento complementar que o interpretador lê.** Ele ainda não produz
  pagamento próprio, mas carrega a única afirmação que uma remessa faz sobre quem é o favorecido além de
  um nome de 30 caracteres. Ele é anexado somente a um Segmento A imediatamente anterior do mesmo lote, e
  somente uma vez. Um B após um J, um N, um O ou outro B é ignorado — anexá-lo colocaria o CPF de um
  estranho ao lado do pagamento de outra pessoa.
- **Os códigos de *Tipo de Inscrição* são invertidos no Segmento N.** Em todo o resto do layout, CPF é
  `'1'` e CNPJ é `'2'`. Em todo overlay de Segmento N é **CNPJ = `'1'`, CPF = `'2'`**.
- **Uma identificação de Segmento N só é exibida quando é um CPF ou um CNPJ.** O mesmo campo também
  carrega NIT/PIS/PASEP, CEI, NB, Nº Título, DEBCAD e uma referência de texto livre; esses identificam a
  declaração e não um contribuinte, e aquelas linhas mostram um travessão.

**O Segmento J-52 deliberadamente não é lido.** A inscrição do beneficiário de um boleto vive ali, mas o
registro carrega três blocos de inscrição separados — sacado, cedente/beneficiário e sacador avalista — e o
layout publicado não permite a este produto determinar qual é qual com a confiança que a tela de um
aprovador exige.

Os valores são armazenados como o arquivo os escreveu, com o dígito verificador separado por hífen
(`00551-7`, `000000249149-4`). O preenchimento com zeros à esquerda é removido para exibição e em nenhum
outro lugar. O hífen é dado, e não pontuação: sem ele, nada a jusante consegue distinguir "conta 24914, DV
94" de "conta 249149, DV 4".

Nada disso é validado — um CPF que reprova seu próprio dígito verificador, uma agência que não existe e uma
conta que está encerrada passam todos, pelo motivo que a página inteira dá: esta aplicação não é o banco.

### Esta tabela é temporária, por design

A interpretação em nível de linha é armazenada em sua própria tabela 1:1 ao lado do job. **A linha é
apagada no momento em que o job alcança `Completed`, `Failed` ou `Canceled`** — na própria transição, e não
por um agendamento. Este é o único dado operacional do Bulk Signer que se poda sozinho; veja
[Retenção](retention.md#a-única-exceção-detalhe-de-linhas-do-cnab240).

Em resumo: uma vez que o job é terminal, o detalhe é redundante (o próprio arquivo sobrevive em `output/`
ou `error/`, e o hash de conteúdo prova qual arquivo era), enquanto ele guarda o nome de cada beneficiário
de cada folha de pagamento e, de outro modo, se acumularia para sempre sem nenhum consumidor.

Abra um job de pagamento terminal e o painel avisa isso, em vez de mostrar uma tabela vazia. Os números do
resumo, o hash de conteúdo e o histórico do job ficam intocados.

## O que a API REST retorna

O `GET /api/jobs/{id}` carrega um objeto `cnab240`, `null` em qualquer job que não foi interpretado como
arquivo de pagamento:

```json
{
  "id": "…",
  "status": "Completed",
  "cnab240": {
    "totalCentavos": 387961326,
    "totalFormatted": "R$ 3.879.613,26",
    "paymentCount": 44,
    "cancellationCount": 0,
    "earliestPaymentDate": "2026-08-05",
    "latestPaymentDate": "2026-08-20",
    "contentSha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
  }
}
```

O `totalCentavos` é o inteiro autoritativo — os clientes dividem por 100 para exibir. O `totalFormatted` é
fornecido para que um relatório não tenha de reimplementar a formatação de moeda brasileira para concordar
com o console do operador.

O resumo está somente na representação de **detalhe**, não nas linhas de lista de `GET /api/jobs`.

:::note
As linhas individuais de pagamento **não** são expostas por REST. Elas existem apenas nas superfícies
renderizadas, existem apenas enquanto um job está em andamento, e colocar uma lista de nomes de
beneficiários, CPFs e contas bancárias atrás de uma chave de API ampliaria a superfície de dados pessoais
que o expurgo existe para manter estreita.
:::

## Quando um arquivo é recusado

Um arquivo não conforme nunca chega a um assinador — local ou Lacuna Signer, já que a etapa roda antes da
escolha do método:

| | |
|---|---|
| Status do job | `Failed`, `ErrorMessage = cnab240.invalid` |
| Cópia em stage | realocada para `error/<jobId>/` |
| Violações | listadas no histórico do job, visíveis na linha do tempo |
| Evento operacional | `Cnab240ValidationFailed` |

A lista de violações é limitada, para que um arquivo mal enquadrado não consiga escrever texto sem limite
na trilha de auditoria; quando ela é truncada a mensagem avisa, em vez de dar a entender que a lista é
exaustiva.

Corrija o arquivo e reexecute-o por Upload, Retry ou Rescan. Um arquivo em conformidade ainda pode ser
recusado por estar obsoleto — isso é um código separado e um remédio separado, coberto em
[Datas de pagamento que já passaram](#datas-de-pagamento-que-já-passaram).

---

**A seguir:** [Aprovações](approvals.md) — retendo um arquivo de pagamento sobre um humano antes de ele
ser assinado.
**Anterior:** [Integração com o Lacuna Signer](lacuna-signer.md).
