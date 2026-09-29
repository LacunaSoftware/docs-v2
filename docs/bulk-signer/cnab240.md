---
sidebar_label: "Arquivos de pagamento CNAB240"
sidebar_position: 13
---

# Arquivos de pagamento CNAB240

O Lacuna Bulk Signer pode tratar um arquivo como uma **remessa CNAB240 do Banco do Brasil**, e não como
bytes opacos: interpretá-lo, recusar-se a assiná-lo se não for uma remessa em conformidade e registrar o
que ele movimenta, para que um operador possa ver os valores sem abrir o arquivo.

A verificação é **opcional por perfil de assinatura e vem desligada por padrão**. Ela também é o
pré-requisito da [etapa de aprovação](approvals.md) — um aprovador que não pode ver o valor não está
aprovando nada de significativo, então um perfil com um bloco `Approval` precisa também ter
`CheckCNAB240`.

A página do perfil impõe essa combinação pelos dois lados: **Editar aprovação** recusa uma regra em um
perfil cuja verificação está desligada, e **Editar comportamento** recusa desligar a verificação enquanto
houver uma regra de aprovação, indicando a solução — remova a regra primeiro. Se, mesmo assim, um job
chegar à etapa de aprovação sem interpretação (em um perfil gravado antes de essa segunda recusa existir),
ele falha com o código explícito `approval.content-unmeasured`, em vez de ficar retido como um job sobre
o qual ninguém jamais conseguiria decidir — veja [Aprovações](approvals.md#diagnóstico-de-problemas).

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

Todo arquivo roteado por esse perfil é interpretado antes de ser assinado. Ligue a verificação para a
pasta que recebe remessas e deixe-a desligada em todas as outras — um PDF roteado por um perfil com
`CheckCNAB240` é recusado, porque não é uma remessa.

:::note Onde ligá-la depois do primeiro boot
Os perfis de assinatura ficam no banco de dados operacional, e o `Signing:Profiles[]` é apenas o seed
(carga inicial) importado no primeiro boot. Em uma implantação em execução, a verificação é a chave
**Validar arquivos de pagamento CNAB240** em `/profiles/_new` e **validar CNAB240** no painel **Editar
comportamento** do perfil; uma mudança vale a partir do próximo job, sem reinicialização. Veja
[Configuração](configuration.md#signingprofiles--perfis-de-assinatura-por-pasta).
:::

O banner de inicialização acrescenta `cnab240=on` à linha do perfil, de modo que a configuração fique
visível no boot, e `payment-dates=unchecked` ao lado, em um perfil que
[desligou a verificação da data de pagamento](#desligando-a-verificação).

A chave é lida sem diferenciar maiúsculas de minúsculas: `CheckCNAB240` e `CheckCnab240` são a mesma
chave.

## O que é uma remessa

Um arquivo CNAB240 tem largura fixa: **240 bytes por registro**, com os registros separados por um
delimitador de linha (o interpretador aceita CRLF, LF ou nenhum delimitador). A posição 8 de cada registro
traz o *Tipo de Registro*:

| Tipo | Registro |
|------|----------|
| `0` | Header do Arquivo — um só, o primeiro |
| `1` | Header do Lote |
| `3` | Detalhe — os registros de pagamento |
| `5` | Trailer do Lote |
| `9` | Trailer do Arquivo — um só, o último |

Uma **remessa** (*Código Remessa / Retorno* = `'1'`) é uma ordem de pagamento que você envia ao banco. Um
**retorno** (`'2'`) é o comprovante que o banco devolve. Somente remessas são assinadas; um retorno é
recusado com um motivo explícito, porque assinar um comprovante bancário não faz sentido, e colocar um
retorno em uma pasta monitorada é um erro real de operação.

Os registros de detalhe trazem um *Código de Segmento* na posição 14. Os segmentos **principais**
instruem um pagamento e trazem o valor dele:

| Segmento | Paga |
|----------|------|
| `A` | Crédito em conta, DOC/TED, Pix, depósito judicial |
| `J` | Boleto (títulos), FGTS Digital |
| `N` | Tributos (DARF, GPS, IPVA, DPVAT, …) |
| `O` | Boleto de concessionária (água, luz, telefone), tributos com código de barras |

Os segmentos **complementares** — `B`, `C`, `J-52`, `W`, `W1`, `Z` — trazem informações adicionais sobre o
pagamento do registro principal que os antecede. Alguns têm um campo de valor; **ele nunca é somado.** O
BB não processa esses valores, e somá-los contaria duas vezes um pagamento já contado no registro
principal.

Cada registro de detalhe também traz um *Tipo de Movimento*: `'0'` é uma **inclusão** (um pagamento) e
`'9'` é uma **exclusão** (a retirada de uma instrução enviada anteriormente).

## O que é validado

Somente estrutura e formato:

- Todo registro tem exatamente 240 bytes, sem contar o delimitador.
- Os tipos de registro aparecem na ordem: `0` … (`1` … `3`* … `5`)+ … `9`.
- O *Código do Banco na Compensação* é `001`.
- O *Código Remessa / Retorno* é `'1'`.
- A quantidade de registros no Trailer do Lote confere com os registros de fato presentes no lote, e as
  quantidades de lotes e de registros no Trailer do Arquivo conferem com o arquivo.
- Todo *Código de Segmento* é um que o interpretador reconhece — um código desconhecido é uma **falha
  definitiva**, e não um registro ignorado.
- O *Tipo de Movimento* em um segmento com valor é `'0'` ou `'9'`.
- O *Valor do Pagamento* em um segmento com valor tem 15 dígitos ASCII. Um valor em branco ou preenchido
  com espaços significa que o registro está desalinhado, e não que o pagamento vale zero.

## O que *não* é validado

Dígitos verificadores, validade de CPF/CNPJ, DV de código de barras, plausibilidade de agência/conta,
regras de convênio e cada observação de "Instrução BB" por campo.

:::info O Bulk Signer não é o banco
O BB tem um mecanismo de crítica próprio, publica seus códigos de ocorrência e os devolve em um retorno.
Um arquivo que este produto rejeite indevidamente bloqueia uma folha de pagamento sem recurso; um arquivo
que ele aceite indevidamente volta do BB com o problema exato indicado — um diagnóstico melhor do que
qualquer coisa que este interpretador pudesse produzir.
:::

Duas consequências que convém conhecer:

- **As datas de pagamento são interpretadas, mas nunca validadas aqui.** Uma *Data do Pagamento*
  preenchida com zeros ou malformada resulta em nenhuma data, e não em uma violação. Se a data já está
  vencida é uma questão para o momento da assinatura, e é lá que ela é verificada — veja
  [Datas de pagamento que já passaram](#datas-de-pagamento-que-já-passaram).
- **O checksum de valores do Trailer do Lote não é verificado.** O BB define a *Somatória dos Valores*
  como uma soma exclusiva do Segmento J, mas os arquivos reais a preenchem com o total do lote inteiro;
  implementá-la ao pé da letra rejeitaria remessas válidas. No lugar dela, são verificadas as
  conciliações de quantidades, que de fato validam com exatidão.

## Como o total é definido

> **Total** = a soma do *Valor do Pagamento* nos segmentos principais **A, J, N e O** em que o
> *Tipo de Movimento* = `'0'`.

Daí decorrem três regras, e cada uma muda o número:

**Os segmentos complementares não contribuem com nada.** Os valores opcionais deles descrevem um
pagamento já contado no registro principal.

**As exclusões são contadas à parte e nunca compensadas.** Um registro de exclusão traz um campo de valor
preenchido, então uma soma ingênua contaria um cancelamento como um pagamento. Subtraí-lo também não
resolve: uma exclusão é *a retirada de uma instrução*, e não dinheiro negativo. Compensar uma exclusão de
R$ 500,00 com um pagamento de R$ 1.000,00 dá R$ 500,00 — um número que não corresponde nem ao que sai da
conta nem ao que o arquivo instrui. Por isso, o total é R$ 1.000,00 e a contagem de cancelamentos é 1,
exibidos lado a lado.

**Valores monetários são centavos em um inteiro, nunca um decimal.** Os valores CNAB240 são `13,2`, então
os quinze dígitos brutos já *são* os centavos — sem conversão de escala e sem separador decimal a
interpretar. A conversão para reais só acontece na exibição.

Além do total, o pipeline registra a contagem de pagamentos, a contagem de cancelamentos, as datas de
pagamento mais antiga e mais recente, o pagador e um **SHA-256 dos bytes exatos interpretados**. O hash é
a âncora à qual a [etapa de aprovação](approvals.md#o-que-é-aprovado) se vincula — uma aprovação é uma
afirmação sobre *bytes*, e não sobre um id de job —, e ele é gravado na mesma atualização do banco de
dados que os números, justamente para que o hash e os números nunca possam descrever bytes diferentes.
Ele é conferido de novo imediatamente antes da assinatura.

### Quem está pagando

O *Nome da Empresa* (posições 73–102) e o *Número de Inscrição da Empresa* (posições 19–32, cujo tipo é
dado pelo *Tipo de Inscrição* na posição 18) são lidos do Header do Arquivo e registrados junto com os
números. A identificação fiscal é armazenada só com dígitos — onze para um CPF, catorze para um CNPJ —, e
a pontuação só é aplicada na exibição.

Um bloco de pagador em branco ou preenchido com zeros **não** é uma violação: recusar um arquivo que o BB
aceitaria é o erro mais caro. Um campo preenchido com zeros é lido como ausente, e não como catorze
zeros.

O pagador existe para a página de aprovação: "R$ 1.240.000,00 saem de uma conta" é uma pergunta diferente
de "R$ 1.240.000,00 saem *desta* conta", e só a segunda pode ser respondida.

:::note
Os números são registrados **somente quando a interpretação termina sem erros.** Em um arquivo que falha
na validação, o que quer que o interpretador tenha lido antes de desistir é descartado, e não
persistido — um número em que ninguém pode confiar é pior que nenhum número.
:::

## Datas de pagamento que já passaram

Uma remessa pode estar perfeitamente bem formada e, ainda assim, ser a coisa errada a assinar. Um arquivo
exportado no dia 3, para pagamentos datados do dia 5, que só chega ao assinador no dia 11 está vencido: o
BB vai recusá-lo ou processá-lo em uma data que ninguém pretendia, e uma assinatura faz a data errada
parecer intencional.

> Imediatamente antes da assinatura, a **mais antiga** *Data do Pagamento* registrada para o arquivo é
> comparada com a data de hoje. Se ela já passou, o job falha e nenhuma assinatura é produzida — a menos
> que o perfil tenha [desligado a verificação](#desligando-a-verificação).

A comparação usa a data mais antiga, e não a mais recente — um pagamento já vencido em um arquivo que
também paga na semana seguinte continua sendo um pagamento que o BB vai rejeitar ou processar com a data
errada. Um arquivo sem pagamentos datados não é afetado e é assinado normalmente.

| | |
|---|---|
| Status do job | `Failed`, `ErrorMessage = cnab240.payment-date-passed` |
| Cópia preparada | movida para `error/<jobId>/` |
| Histórico do job | `CNAB240 payment date has passed: earliest payment date 05/08/2026, today 11/08/2026.` |
| Evento operacional | `Cnab240PaymentDatePassed` |

O código é deliberadamente diferente de `cnab240.invalid`: um arquivo inválido precisa ter a estrutura
corrigida; um vencido precisa ser exportado de novo com datas atuais. **Tentar de novo com o mesmo arquivo
falha da mesma forma**, porque as datas dentro dele não mudaram — exporte-o de novo no sistema de origem e
envie o novo arquivo por upload, **Tentar novamente** ou nova varredura.

### Desligando a verificação

:::tip Novo na 2.15.0 — `CheckCnab240PaymentDates`
Até a 2.14.x, todo perfil com `CheckCNAB240` recusava uma remessa cuja data de pagamento mais antiga já
tivesse passado. A partir da 2.15.0, essa recusa é uma chave por perfil, ligada por padrão.
:::

Alguns bancos aceitam um pagamento com data passada e o processam no dia útil seguinte e, para eles, a
recusa bloqueia uma remessa que o banco teria processado. Um perfil pode desligar só essa verificação,
mantendo todo o resto do tratamento de CNAB240:

```json
{
  "Name": "folha",
  "CheckCNAB240": true,
  "CheckCnab240PaymentDates": false
}
```

— ou, em uma implantação em execução, a chave **Recusar remessas com data de pagamento vencida** sob
**Validar arquivos de pagamento CNAB240** em `/profiles/_new`, e **validar datas de pagamento** sob
**validar CNAB240** no painel **Editar comportamento** do perfil. Ela vem **ligada por padrão**, e todo
perfil que existia antes de a chave existir a mantém ligada. Ela só é lida em conjunto com o
`CheckCNAB240`: com ele desligado, não há interpretação nem data a comparar, e o valor gravado é mantido,
de modo que religar o CNAB240 o restaura.

**O que ela desliga é a recusa, e somente a recusa.** A validação estrutural (`cnab240.invalid`), os
números registrados, o hash do conteúdo, a tabela de pagamentos e a etapa de aprovação continuam iguais.
Um arquivo cuja data de pagamento mais antiga já passou é assinado — no caminho local, no envio ao Lacuna
Signer e no caminho assinado pelos aprovadores — e deixa um registro onde a recusa teria deixado:

| | |
|---|---|
| Status do job | inalterado — o job segue em direção à assinatura |
| Histórico do job | `CNAB240 payment date has passed and the payment-date check is disabled on profile 'folha': earliest payment date 05/08/2026, today 11/08/2026.` |
| Evento operacional | `Cnab240PaymentDateCheckSkipped`, redigido como uma decisão (`…; not refused because the payment-date check is disabled: …`) — um tipo próprio, de modo que um filtro por `Cnab240PaymentDatePassed` conta apenas recusas |
| Métrica | `bulksigner_cnab240_payment_date_checks_skipped_total{profile}` |
| Log | um Warning no log estruturado (para que os destinos de arquivo e de tabela o recebam mesmo com o dashboard ao vivo, que suprime a narração do console) e um evento de span no trace do job |
| Banner de inicialização | ` · payment-dates=unchecked` na linha do perfil |

O registro indica uma **decisão, e não uma assinatura**. Ele é gravado antes de a assinatura ser
tentada, então é mantido mesmo se a assinatura falhar — e, pelo mesmo motivo, nunca diz "assinado": o job
ainda pode ser vetado, falhar na verificação do hash do conteúdo ou falhar no assinador, e, em um perfil
do Lacuna Signer, um sucesso é apenas um envio.

**Desligar o `CheckCNAB240` deixa o mesmo registro.** Um job interpretado enquanto o CNAB240 estava
ligado tem uma data de pagamento registrada; se um operador desligar o CNAB240 enquanto esse job está
retido para aprovação, o job liberado não é recusado, mas o histórico dele diz
`… and CNAB240 checking is disabled on profile …`, e o mesmo evento e a mesma métrica são registrados. Um
job interpretado com o CNAB240 desligado não tem data registrada, e nada muda para ele.

A chave é **lida na assinatura, e não congelada no job**, assim como o próprio `CheckCNAB240`. Uma
mudança vale a partir do próximo job que o pipeline assinar, sem reinicialização, inclusive para um job
já retido para aprovação. Um aprovador que vê um job assim em `/approve/{jobId}` recebe o aviso **A data
de pagamento já passou** em qualquer dos casos — informando que o arquivo será recusado na assinatura ou
que será assinado; veja [Aprovações](approvals.md#o-que-o-aprovador-vê). A linha no portal do aprovador e
a confirmação em lote **Aprovar N selecionados** não dizem nada sobre uma data vencida.

:::warning Com a verificação desligada, os aprovadores são a única barreira contra datas vencidas
Em um perfil com aprovação, a verificação da data de pagamento é o que normalmente separa uma folha de
pagamento que ficou parada tempo demais da sua assinatura. Desligue-a apenas para um banco que de fato
processa pagamentos com data passada, e garanta que os aprovadores saibam que devem ler o aviso da página
por arquivo.
:::

### Por que a verificação fica na chamada de assinatura

A verificação roda na assinatura, e não junto com a interpretação, e esses dois momentos não são o mesmo.
O valor da verificação é diretamente proporcional ao tempo que um arquivo espera entre ser lido e ser
assinado, e esse intervalo pode ser muito longo — a [etapa de aprovação](approvals.md) retém um job à
espera de uma pessoa, por tempo indeterminado, exatamente nesse ponto. Colocar a verificação na
assinatura faz com que o fluxo de aprovação a herde sem custo, sem risco de uma cópia feita na
interpretação e outra feita na assinatura divergirem. Um job liberado volta para a fila comum e passa de
novo por esta verificação a caminho do assinador.

O mesmo raciocínio a coloca nos dois caminhos de assinatura. Para um perfil do
[Lacuna Signer](lacuna-signer.md), a verificação roda no **envio**, já que esse é o momento em que o
arquivo sai para uma assinatura remota. Um arquivo que este produto se recusa a assinar localmente é um
arquivo que ele também não pode entregar a um assinador remoto.

### Fuso horário

A *Data do Pagamento* é uma data do calendário bancário, e não um instante, então "hoje" é a **data local
do host**.

:::warning
Em um host configurado em UTC enquanto o pagador está em `America/Sao_Paulo`, a data local vira três
horas mais cedo, e um arquivo com vencimento hoje passa a ser recusado a partir das 21:00, no horário
local. Configure o fuso horário do host com o do pagador — `TZ=America/Sao_Paulo` no container ou na unit
do systemd — para que a virada do dia aconteça quando o operador espera.
:::

## O que o operador vê

Um painel **Arquivo de pagamento** em `/jobs/{id}`, acima dos detalhes do perfil:

| Campo | Exibido como |
|-------|--------------|
| Total | `R$ 3.879.613,26` |
| Pagamentos | contagem de inclusões |
| Exclusões | contagem de exclusões, em âmbar quando diferente de zero, `nenhum` caso contrário |
| Datas de pagamento | `05/08/2026`, ou `05/08/2026 – 20/08/2026` quando os pagamentos do arquivo se distribuem por um intervalo |
| SHA-256 do conteúdo | o digest em hexadecimal |

O painel só aparece em jobs que foram interpretados como arquivos de pagamento. Valores e datas são
formatados em um padrão fixado pela própria aplicação, e não pela cultura do host, de modo que os dígitos
aparecem da mesma forma em um serviço do Windows, em um container Debian e na máquina de um
desenvolvedor — e permanecem no formato brasileiro, qualquer que seja o
[idioma de exibição](dashboard.md#idioma-de-exibição) escolhido pelo leitor.

## Os pagamentos individuais

Abaixo do resumo, uma tabela **Pagamentos** lista cada registro do arquivo que tem valor — número do
registro, lote, segmento, o nome no registro, o CPF/CNPJ do beneficiário, a conta de destino, a data de
pagamento e o valor. As linhas de exclusão são identificadas e têm o valor riscado, porque o valor é real,
mas nenhum dinheiro é movimentado.

A mesma tabela aparece na página voltada ao aprovador, onde as colunas de identificação e de conta são
mascaradas para um leitor anônimo — veja
[Aprovações](approvals.md#os-pagamentos-individuais). Na página do operador, nada é mascarado: um
operador que investiga um pagamento rejeitado pelo BB precisa dos dígitos de que o BB está reclamando, e
ele se autenticou para ter acesso a eles.

:::warning A coluna de nome é "o nome no registro"
O BB dá um nome diferente ao campo em cada segmento, e, no **Segmento N, ele é o contribuinte, e não o
beneficiário** — um tributo é pago ao governo, e o nome no registro é o de quem o deve. Leia
"beneficiário" como "o nome no registro", a menos que o arquivo seja de segmento A, J ou O.
:::

Um nome em branco é exibido como *(não informado)*. O BB não exige o campo, então um nome em branco é um
arquivo válido, e não um defeito.

### De onde vêm a identificação e a conta

Nenhuma das duas está no registro principal de uma transferência de crédito, o que é uma característica
do próprio layout, e não uma peculiaridade deste interpretador:

| Segmento | CPF / CNPJ do beneficiário | Conta de destino |
|----------|----------------------------|------------------|
| **A** — crédito em conta, TED, Pix | do **Segmento B** que o segue (18 / 19–32) | Agência 24–28 + DV 29, conta 30–41 + DV 42 |
| **J** — boleto | não é lido — veja abaixo | nenhuma; pago por código de barras |
| **N** — tributos | no próprio registro, na área de overlay (117–118 / 119–132) | nenhuma; pago ao governo |
| **O** — concessionárias | nenhum no registro | nenhuma; pago por código de barras |

Três pontos dessa tabela que convém conhecer:

- **O Segmento B é o único segmento complementar que o interpretador lê.** Ele continua sem gerar
  pagamento próprio, mas traz a única informação que uma remessa dá sobre quem é o favorecido, além de um
  nome de 30 caracteres. Ele só é associado a um Segmento A imediatamente anterior do mesmo lote, e uma
  única vez. Um B depois de um J, um N, um O ou outro B é ignorado — associá-lo colocaria o CPF de um
  estranho ao lado do pagamento de outra pessoa.
- **Os códigos de *Tipo de Inscrição* são invertidos no Segmento N.** Em todo o resto do layout, CPF é
  `'1'` e CNPJ é `'2'`. Em todo overlay do Segmento N, é **CNPJ = `'1'`, CPF = `'2'`**.
- **Uma identificação do Segmento N só é exibida quando é um CPF ou um CNPJ.** O mesmo campo também traz
  NIT/PIS/PASEP, CEI, NB, Nº Título, DEBCAD e uma referência de texto livre; esses identificam a
  declaração, e não um contribuinte, e essas linhas mostram um travessão.

**O Segmento J-52 deliberadamente não é lido.** A inscrição do beneficiário de um boleto fica nele, mas o
registro traz três blocos de inscrição separados — sacado, cedente/beneficiário e sacador avalista — e o
layout publicado não permite a este produto determinar qual é qual com a confiança que a tela de um
aprovador exige.

Os valores são armazenados como o arquivo os escreveu, com o dígito verificador separado por hífen
(`00551-7`, `000000249149-4`). Os zeros à esquerda são removidos na exibição, e em nenhum outro lugar. O
hífen é um dado, e não pontuação: sem ele, nada a jusante consegue distinguir "conta 24914, DV 94" de
"conta 249149, DV 4".

Nada disso é validado — um CPF que falha no próprio dígito verificador, uma agência que não existe e uma
conta encerrada passam todos, pelo motivo que a página inteira explica: esta aplicação não é o banco.

### Esta tabela é temporária, por design

A interpretação linha a linha é armazenada em uma tabela própria, 1:1 com o job. **A linha é apagada no
momento em que o job chega a `Completed`, `Failed` ou `Canceled`** — na própria transição, e não por um
agendamento. Este é o único dado operacional do Bulk Signer que se apaga sozinho; veja
[Retenção](retention.md#a-única-exceção-detalhe-de-linhas-do-cnab240).

Em resumo: quando o job chega a um status terminal, o detalhe se torna redundante (o próprio arquivo
continua em `output/` ou `error/`, e o hash do conteúdo prova qual arquivo era), ao passo que ele guarda o
nome de cada beneficiário de cada folha de pagamento e, do contrário, se acumularia para sempre, sem
ninguém que o consumisse.

Ao abrir um job de pagamento já em status terminal, o painel avisa isso, em vez de mostrar uma tabela
vazia. Os números do resumo, o hash do conteúdo e o histórico do job permanecem intactos.

## O que a API REST retorna

O `GET /api/jobs/{id}` traz um objeto `cnab240`, que é `null` em qualquer job que não foi interpretado como
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

O `totalCentavos` é o inteiro de referência — os clientes dividem por 100 para exibir. O `totalFormatted`
é fornecido para que um relatório não precise reimplementar a formatação de moeda brasileira para ficar
igual ao console do operador.

O resumo está somente na representação de **detalhe**, e não nas linhas da lista de `GET /api/jobs`.

:::note
As linhas de pagamento individuais **não** são expostas pela API REST. Elas só existem nas telas
renderizadas, só existem enquanto um job está em andamento, e colocar uma lista de nomes de
beneficiários, CPFs e contas bancárias atrás de uma chave de API ampliaria a exposição de dados pessoais
que o expurgo existe para manter pequena.
:::

## Quando um arquivo é recusado

Um arquivo fora de conformidade nunca chega a um assinador — local ou Lacuna Signer, já que essa
verificação roda antes da escolha do método:

| | |
|---|---|
| Status do job | `Failed`, `ErrorMessage = cnab240.invalid` |
| Cópia preparada | movida para `error/<jobId>/` |
| Violações | listadas no histórico do job, visíveis na linha do tempo |
| Evento operacional | `Cnab240ValidationFailed` |

A lista de violações tem um limite, para que um arquivo mal estruturado não consiga gravar texto sem
limite na trilha de auditoria; quando ela é truncada, a mensagem avisa, em vez de dar a entender que a
lista está completa.

Corrija o arquivo e reexecute-o por upload, **Tentar novamente** ou nova varredura. Um arquivo em
conformidade ainda pode ser recusado por estar vencido — esse é um código diferente, com uma solução
diferente, descrito em [Datas de pagamento que já passaram](#datas-de-pagamento-que-já-passaram).

---

**A seguir:** [Aprovações](approvals.md) — retendo um arquivo de pagamento para aprovação de uma pessoa
antes de ele ser assinado.
**Anterior:** [Integração com o Lacuna Signer](lacuna-signer.md).
