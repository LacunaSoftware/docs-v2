---
sidebar_label: "Dashboard"
sidebar_position: 7
---

# Dashboard

O dashboard do operador é uma aplicação web servida no caminho raiz. Ele lê o mesmo banco de dados que
a API REST lê e dispara as mesmas ações — há um único conjunto de regras de negócio por trás de duas
superfícies, de modo que uma correção ou mudança aparece nas duas de uma vez.

```
http://<host>:8080/
```

Entre uma vez com a `Auth:ApiKey` configurada; a página de login a troca por um cookie de sessão
`SameSite=Strict`.

## Elementos comuns da interface

Toda página tem uma barra superior de aplicativo e uma gaveta de navegação à esquerda:

| Elemento | O que faz |
|----------|-----------|
| Barra de aplicativo (topo) | A **versão em execução**, o seletor de idioma (ícone de globo, veja abaixo), o alternador de tema (claro / escuro) e um menu de conta com Sair. |
| Gaveta (esquerda) | Os links de navegação: Dashboard, Jobs, Pasta de entrada, Exceções recentes, Sistema — mais Backup quando `Backup:Enabled`. (O link de Exceções recentes fica oculto quando `LogViewer:Enabled = false`.) |
| Indicador de atualização | Um pequeno widget mostrando a hora da última atualização e a cadência de consulta ativa. |

**A versão em execução está na barra de aplicativo em todas as páginas**, de modo que quem relata um
problema já está olhando para ela. A barra mostra a forma curta; a versão informativa completa — que
carrega o SHA de commit que o SDK acrescenta, e que não caberia em uma barra — é o tooltip do elemento
*e* seu nome acessível, então pode ser vista com o mouse ou lida em voz alta sem alargar nada. As
superfícies de diagnóstico a imprimem por inteiro: o painel de boot com o resumo de prontidão e o
`/system`. Um rótulo de pré-lançamento nunca é omitido, já que aquilo é identidade e não metadado. A
mesma versão também aparece sob o banner de console com a marca, a cada início, e como uma linha no
dashboard de console ao vivo.

As páginas ao vivo atualizam em um temporizador do servidor dirigido por
`Dashboard:PollIntervalSeconds` (padrão 5). A página de detalhe do job para de consultar quando o job
alcança um estado terminal — não faz sentido atualizar uma linha `Completed` ou `Failed`.

### Idioma de exibição

As superfícies web renderizam em **inglês americano ou português do Brasil**, escolhido por navegador
pelo seletor de idioma — na barra de aplicativo nas páginas de operador, fixado no canto superior
direito nas páginas de layout simples (`/login`, as superfícies de aprovação). A escolha é armazenada no
cookie de cultura padrão do ASP.NET Core por um ano; trocar recarrega a página inteira. A ordem de
resolução é **cookie → o `Accept-Language` do navegador → `en-US`**, então um navegador brasileiro recebe
português na primeira visita, sem interação.

Não há chave de configuração — o leitor escolhe, o servidor não.

O que o idioma deliberadamente **não** muda: as frases de trilha de auditoria na linha do tempo do job
(a evidência permanece em inglês, exatamente como escrita), os valores REST no protocolo (nomes de
`JobStatus`, `code`s de problema e seu texto), os logs duráveis, o dashboard de console, e tudo do
CNAB240 — valores em `R$`, datas de pagamento em `dd/MM/yyyy` e o vocabulário de remessa são propriedades
do arquivo, não do leitor.

## `/` — Dashboard

Página inicial. Cards de estatística e os últimos jobs:

| Card | Valor |
|------|-------|
| Na fila | Contagem de jobs em `Queued` |
| Em andamento / Slots ocupados | Quando `Pipeline:MaxConcurrency = 1`: contagem de jobs em `Processing` + `Verifying`. Quando `MaxConcurrency > 1`: renderizado como `N / M slots ocupados`. |
| Concluídos (24 h) | Jobs cuja transição terminal ocorreu nas últimas 24 h |
| Falhados (24 h) | Jobs que falharam nas últimas 24 h |
| Cancelados (24 h) | Jobs cancelados pelo operador nas últimas 24 h |
| Saída criptografada (24 h) | Subconjunto dos jobs concluídos cuja saída foi criptografada |
| Estado do pipeline | "Rodando" ou "Pausado" (clicável, abre a página Sistema) |

Quando `Pipeline:MaxConcurrency > 1`, um pequeno painel **Em andamento por formato** detalha a contagem
em andamento por `Pades` / `Cades` / `Xades`. No modo sequencial (o padrão) o painel fica oculto.

### Painel de desempenho de processamento

Abaixo dos cards de estatística fica um painel **Desempenho de processamento** com estatísticas de tempo
decorrido por etapa — tempo médio de job, tempo médio de assinatura e de verificação, vazão móvel,
totais mín./méd./máx., um detalhamento por etapa, e uma divisão entre Local e Remoto. Os números são
linhas na base operacional, então eles **sobrevivem a uma reinicialização**, e em um cluster o painel
descreve a implantação inteira, e não a instância que por acaso respondeu à sua requisição.

O antigo card **Vazão máxima/s** foi aposentado em vez de retrabalhado: ele media o tempo de vida de um
processo, o que sob um cluster teria descrito a sorte de uma instância. A "Vazão (último min)" responde
ao que ele era usado para responder na maior parte das vezes.

Totalmente oculto quando `Statistics:Enabled = false`. Guia completo de leitura, inclusive como usar a
divisão por etapa para localizar uma lentidão: [Estatísticas de jobs](statistics.md).

Abaixo disso: um gráfico de vazão das últimas 24 horas e uma tabela dos últimos jobs. Esta página é uma
visão somente leitura — para ações, vá para Jobs.

## `/jobs` — Jobs

Uma tabela filtrável e paginada de todos os jobs:

| Filtro | Tipo |
|--------|------|
| Status | Seleção múltipla entre `Queued / Processing / Verifying / Completed / Failed / Canceled` |
| Perfil | Lista suspensa com cada nome de perfil declarado em `Signing:Profiles[]`, ou apenas `default` no modo legado. |
| Formato | Seleção múltipla entre `Pades / Cades / Xades` |
| Nome do arquivo | Texto livre (casamento por conteúdo) |
| Intervalo de datas de criação | Seletor de duas datas |

As colunas incluem um badge de status, formato, o nome do perfil resolvido, a origem (Observador /
Upload / Retry), a hora de criação, e um clique na linha que navega para a página de detalhe do job.

## `/jobs/{id}` — Detalhe do job

Card de cabeçalho com nome do arquivo, badge de status, formato, origem, criado/atualizado, link para o
job pai (se este job é uma repetição), e mensagem de erro (se `Failed`).

- **Chip de saída criptografada** — visível somente quando o job foi assinado com a criptografia
  habilitada. Informa aos operadores que o download entregará um envelope `.enc`, e não um artefato
  assinado em texto claro.
- **Seção de arquivo de pagamento** — presente somente em jobs interpretados como uma
  [remessa CNAB240](cnab240.md). Mostra o total do arquivo em BRL, a contagem de pagamentos, a contagem
  de exclusões, o intervalo de datas de pagamento, e o SHA-256 dos bytes interpretados. As exclusões
  aparecem como um chip âmbar somente quando houver alguma.
- **Painel de pagamentos** — somente em jobs de arquivo de pagamento: uma tabela paginada de cada
  registro portador de valor (número de registro, lote, segmento, nome, CPF/CNPJ do beneficiário,
  agência e conta, data de pagamento, valor), com as linhas de exclusão rotuladas e riscadas. **Nada é
  mascarado para um operador** — um operador atrás de um pagamento que o BB rejeitou precisa dos dígitos
  de que o BB está reclamando. Presente somente enquanto o job está em andamento; o painel se explica
  quando o job fica terminal e o detalhe de linhas é
  [expurgado](retention.md#a-única-exceção-detalhe-de-linhas-do-cnab240).
- **Seção de aprovação** — presente somente em jobs que ficaram retidos, e ela sobrevive ao job ficar
  terminal (nem o snapshot nem as linhas de aprovação são expurgados). Mostra o quórum congelado como um
  chip "N de M exigidos", quantas aprovações já entraram, quando o job ficou retido, o orçamento de
  espera congelado, e o pool de aprovadores — nome, e-mail e CPF — **como estava no momento da
  retenção**, com cada linha carregando a decisão daquela pessoa, seu motivo, e quando ela decidiu.
  Editar o bloco `Approval` do perfil **não** muda o que é exibido aqui; é justamente esse o propósito
  do snapshot. Um job rejeitado lê *"2 de 2 aprovações — rejeitado"*, com um banner acima do pool
  dizendo por que o job está `Canceled`. Enquanto o job está retido, a seção também renderiza o **link
  de aprovação** em um campo somente leitura para copiar, com o aviso de capacidade diretamente acima
  dele.
- **Seção de perfil** — o perfil de assinatura resolvido: nome, formato declarado (ou `auto` para o
  padrão legado sintetizado), origem do certificado, e as flags de postura `Verify` / `Encrypt` /
  `Validate certificate`. Se o nome do perfil do job foi removido da configuração depois de o job rodar,
  um aviso é exibido — o job continua visualizável, mas uma repetição falharia até o perfil ser
  restaurado.
- **Linha do tempo** — cada entrada de histórico em ordem cronológica, uma linha por transição de
  estado, cada uma com o timestamp, o badge de status e o texto da mensagem.

Botões de ação (visibilidade condicionada ao status):

| Botão | Visível quando o status é… | O que faz |
|-------|---------------------------|-----------|
| Retry | `Failed` | Cria um novo job com `ParentJobId = this.Id`; navega para o novo job. |
| Cancel | `Queued`, `AwaitingSigner`, `AwaitingApproval` | Move o job para `Canceled`; o observador não ressuscitará o arquivo automaticamente. A partir de `AwaitingApproval`, também realoca a cópia em stage para `error/<jobid>/`. |
| Download | `Completed` (ou `Failed` com saída) | Transmite a saída. `application/octet-stream` com nome de arquivo `.enc` quando criptografada. |

Cada resultado é renderizado como um toast — sucesso, aviso (por exemplo, `job.not-queued`) ou erro.

:::note Esta é a única página que um aprovador também pode abrir
Um aprovador chega aqui pelo chip de contagem em sua [fila](#approvals--portal-do-aprovador), e somente
para um job cujo *pool congelado* o nomeia; qualquer outro id de job é recusado com o mesmo *Job not
found.* que um inexistente recebe. Ele vê o registro e nenhuma das capacidades do operador — sem link de
aprovação, sem os CPFs dos aprovadores, e sem Retry, Cancel ou Download. Retirar o link é um controle de
**quórum**, não de divulgação: ele permite a seu detentor aprovar como qualquer membro do pool, então um
membro que o detivesse poderia satisfazer `MinimumApprovers = 3` sozinho.

Todo o resto em `/jobs`, `/input`, `/system` e toda a superfície REST continua exclusivo do operador.
:::

## `/input` — Pastas de entrada

Visão operacional de cada pasta configurada em `Storage:Inputs[]`, um card por pasta, mais um botão
global `Rescan em todas`. Cada card mostra:

| Elemento | Valor |
|----------|-------|
| Chip com o nome da pasta | O `Name` de `Storage:Inputs[]`. |
| Chip de status | `running` (verde) / `initializing` (âmbar) / `stopped` (vermelho) / `folder missing` (vermelho). |
| Chips de perfil | O nome do perfil resolvido e seu formato de assinatura declarado (ou `auto` para o padrão legado). |
| Caminho monitorado | O caminho **absoluto** em disco. |
| Contagem de arquivos | Número de arquivos aguardando captura (limitado a 50; exibido como `50+` acima do limite). |
| Processados desde o início | Cada candidato que o observador tratou desde o início do processo, independentemente do desfecho. |
| Alerta do último erro | Exibido somente quando `Status = stopped`. |
| Botão `Rescan nesta pasta` | Reenfileira somente esta pasta. |

O `Rescan em todas` (topo da página) reenfileira todas as pastas. O toast reporta totais por pasta
quando mais de uma pasta está configurada.

:::warning
**Observadores parados não revivem automaticamente.** Quando o limiar de falhas consecutivas de
enfileiramento por pasta estoura, o observador daquela pasta sai enquanto o resto do serviço continua
rodando. Corrija a causa subjacente (montagem, disco, permissões) e reinicie o serviço para trazer o
observador de volta.
:::

## `/system` — Sistema

Informações somente leitura do serviço:

| Campo | Origem |
|-------|--------|
| Versão da build | Versão do assembly |
| Modo de host | Serviço do Windows / systemd / console / docker |
| Ambiente | `ASPNETCORE_ENVIRONMENT` |
| Raiz de armazenamento | `Storage:Root` |
| Pipeline | Rodando / Pausado; clique para navegar até a ação Pausar/Retomar |
| Impressão digital da licença | SHA-256 da licença carregada, primeiros 16 caracteres hex |
| Origem do certificado | `Signing:Certificate:Source` + o campo relevante da subárvore |
| Política de assinatura | ADR-Básica (padrão; veja [Certificados](certificates.md)) |
| Criptografia | Habilitada / Desabilitada |
| Tamanho da fila | Snapshot da contagem de `Queued` |

**Onde a base operacional está** *não* está nesta página. A tabela de caminhos de armazenamento mostra os
diretórios locais sob `Storage:Root`, `db/` entre eles — que sob `Database:Provider = SqlServer`
simplesmente não é usado. As superfícies que nomeiam a base são a linha `operational store` do banner de
resumo de prontidão e a verificação `database` do `/api/ready`, que ambas nomeiam provider, servidor e
banco de dados, e nunca a connection string.

**Quem é dono do compartilhamento de trabalho** — acima da tabela de caminhos de armazenamento, e
**somente** quando `Storage:Provider = AzureFiles`. Ordinariamente, uma legenda nomeando o marcador que
esta instância reivindicou. Quando outra instância o detinha na inicialização, um alerta vermelho em vez
disso, nomeando o host e o id de processo daquela instância. É um snapshot do momento do boot, e não uma
verificação ao vivo: o marcador é reivindicado uma vez e mantido por toda a vida do processo, então uma
linha que se atualizasse estaria insinuando um frescor que ela não pode ter. Veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho).

**Instâncias** — **somente** quando `Cluster:Enabled = true`. Uma linha por instância que se registrou na
base operacional: sua identidade derivada, um chip **Live** ou **Stale**, a versão da aplicação que ela
está rodando, e a idade de seu último heartbeat. A linha da instância que respondeu à sua requisição é
marcada como tal — e, como o balanceador de carga escolhe por requisição, recarregar a página move aquela
marcação, o que é a confirmação mais barata disponível de que o tráfego realmente está distribuído. A
legenda nomeia a cadência de heartbeat e o limiar de obsolescência em vigor.

Duas leituras importam aqui. **Stale é uma presunção, não uma morte confirmada** — uma instância viva mas
incapaz de escrever heartbeats aparece do mesmo jeito. E **duas versões diferentes fora de uma janela de
implantação** é a condição de versões mistas, que é reportada como um Critical no boot da instância mais
nova e nunca é impedida. Veja
[Operação](operations.md#quais-instâncias-estão-vivas-somente-no-modo-cluster) e
[Alta disponibilidade](high-availability.md#atualizações-param-o-mundo).

**Segundo fator do aprovador** — quando `ApproverSecondFactor:Enabled`, uma lista com uma linha por
aprovador configurado, inscrito ou não, com a data de inscrição. Cada uma carrega um botão **Resetar**,
que é o caminho do celular perdido: ele limpa a inscrição daquele aprovador, para que ele vincule um novo
autenticador na próxima visita, e é registrado sob o nome do operador como um evento de auditoria
próprio. Veja [Aprovações](approvals.md#provando-que-é-você).

**Links dos aprovadores** — quando `ApproverPortal:Enabled`, uma seção listando cada aprovador
configurado com sua URL pessoal de portal e a quais pools de perfis ele pertence. Derivada da
configuração, razão pela qual vive aqui e deliberadamente *não* em uma página de job: um link durável
renderizado ao lado de um job se lê como sendo sobre aquele job, e um operador o repassaria esperando que
ele expirasse com o arquivo. Cada um é exibido como um campo somente leitura para copiar, e não como uma
âncora clicável, já que clicar em um abriria a fila de outra pessoa no navegador do próprio operador. A
seção carrega o aviso de capacidade. Com o portal desligado, ela diz isso em vez do resto. Veja
[Aprovações](approvals.md#o-portal-do-aprovador).

Os botões de pausar/retomar o pipeline estão aqui, condicionados ao estado atual. O campo opcional
`reason` vai para a trilha de auditoria.

O botão `Cleanup` atualmente não faz nada, enquanto a história de retenção é finalizada. Veja
[Retenção](retention.md).

### Zona de perigo — Clear Jobs

Apaga permanentemente registros de jobs **finalizados** — a tabela de Jobs e suas linhas do tempo de
histórico. Um diálogo de confirmação protege a ação e deixa explícito que ela é irreversível e que
somente registros de jobs são afetados. Cancelar ou fechar o diálogo não apaga nada.

**Um job `Queued`, retido ou em andamento sobrevive**, e a mensagem de resultado reporta quantos foram
pulados ao lado de quantos foram removidos. Aquele estreitamento valeu para toda implantação, não apenas
para as em cluster: apagar a linha sob um job em execução era o risco de ação de operador mais afiado do
produto, e sob um cluster seria o job em execução de uma *irmã*.

Ao confirmar, ela registra um evento de auditoria `JobsCleared` (ator + as duas contagens), move o
marcador de reset das [estatísticas](statistics.md#zerando-o-painel) de escopo da implantação dentro da
mesma transação, e atualiza a página.

Intocado pelo Clear Jobs: eventos operacionais, estado do pipeline, perfis, configuração, arquivos de
saída assinados, e arquivos de log. Os contadores Prometheus em `/api/metrics` também não são afetados —
eles são monotônicos.

:::warning
Não há como desfazer e não há passo de exportação. Se você precisa do histórico de jobs para uma
auditoria, faça backup da base operacional primeiro — `db/bulksigner.db` sob SQLite, ou o backup do
regime do seu SGBD sob SQL Server. Veja [Retenção](retention.md#disciplina-de-backup).
:::

Veja [Operação](operations.md#clear-jobs).

## `/backup` — Backup do banco de dados

Presente somente quando `Backup:Enabled = true`, e disponível somente em
`Database:Provider = Sqlite` — `Backup:Enabled = true` sob `SqlServer` recusa o boot em vez de mostrar
uma página que não poderia funcionar, então um cluster nunca tem esta página.

| Elemento | O que faz |
|----------|-----------|
| Resumo do destino | O `Backup:Destination` configurado (`Disk`, `S3` ou `AzureBlob`) e onde os artefatos aterrissam. |
| Fazer backup agora | Roda um backup imediatamente. Recusa com `backup.disabled` quando a funcionalidade está desligada. |
| Agenda | O `Backup:IntervalHours` configurado, ou "somente manual" quando ausente, mais quando a próxima execução está prevista — ancorada na última execução **bem-sucedida**, de modo que uma reinicialização não a zera e uma execução falha não a consome. |
| Histórico | Execuções recentes com seu desfecho, tamanho e duração. |
| Retenção | O `Backup:RetainCount` e o que será podado. A poda roda somente após um armazenamento bem-sucedido e não pode reprovar a execução. |

Cada chave, inclusive o formato de credencial de cada destino, está em
[Configuração](configuration.md#backup); como isso se encaixa no quadro mais amplo é
[Retenção](retention.md#disciplina-de-backup).

## `/logs` — Exceções recentes

Um visualizador somente leitura sobre as entradas de log de nível de erro mais recentes, mantidas em um
buffer limitado em memória. Ele **não** é uma consulta sobre os arquivos de log em disco — o buffer é
limpo na reinicialização, então use o destino de arquivo para qualquer coisa histórica.

| Aspecto | Comportamento |
|---------|---------------|
| Origem | Buffer FIFO limitado em memória, alimentado pelo pipeline de log. Limpo na reinicialização. |
| Entradas | Mais recentes primeiro, limitadas a `LogViewer:MaxEntries` (padrão 20). Somente níveis listados em `LogViewer:Levels` (padrão `Error`, `Fatal`) são capturados. |
| Por entrada | Recolhida: chip de nível, mensagem, timestamp, contexto de origem, tipo de exceção. Expandida: mensagem completa, tipo e mensagem da exceção, e o stack trace em um bloco monoespaçado com rolagem. |
| Atualização | Atualização automática em `LogViewer:RefreshIntervalSeconds` (padrão 5), mais um botão de atualização manual. |
| Mascaramento | Todo campo de texto é mascarado no momento em que a entrada é capturada, de modo que segredos não apareçam na página. Veja [Segurança](security.md#mascaramento-de-logs--duas-camadas). |
| Desabilitado | Quando `LogViewer:Enabled = false` o link de navegação fica oculto e a página renderiza um aviso de desabilitado. |

:::note
O nível mínimo global do destino de arquivo se aplica **primeiro**. Alargar `LogViewer:Levels` abaixo
daquele mínimo (por exemplo, acrescentar `Debug` enquanto o mínimo é `Information`) não captura nada,
porque aqueles eventos nunca chegam ao destino.
:::

## `/approve/{id}` — Aprovação (anônima)

A única página da aplicação que **não** está atrás da política de operador. Ela renderiza em um layout
simples — sem gaveta de navegação, sem barra de aplicativo — porque a pessoa que a abre é um aprovador, e
não um operador. Presente somente quando um perfil de assinatura carrega um
[bloco `Approval`](approvals.md).

| Aspecto | Comportamento |
|---------|---------------|
| Autenticação | **Nenhuma por padrão.** Qualquer um que alcance a URL pode aprovar — ou rejeitar — como qualquer pessoa do pool congelado do job, com o aviso declarado na própria página. Se o visitante já detém uma sessão do [portal do aprovador](#approvals--portal-do-aprovador) ou uma sessão `Approver` do Microsoft Entra, a página **o reconhece**: ela o nomeia em vez de oferecer o seletor, registra o método de identificação mais forte, e mostra os identificadores sem máscara. |
| Decisões | **Aprovar** ou **Rejeitar**, com um campo de motivo compartilhado opcional. Rejeitar exige um segundo clique de confirmação. Uma rejeição para o job, diga o quórum o que disser. |
| Mostra | Nome do arquivo, total geral, contagem de pagamentos, contagem de exclusões, intervalo de datas de pagamento, pagador, o pool congelado com a decisão de cada membro, o progresso rumo ao quórum, o orçamento de espera, e o hash do conteúdo. |
| Pagamentos individuais | A **mesma** tabela de pagamentos que a página de job do operador renderiza, paginada. Qual divulgação se aplica segue o *leitor*, não a página: um visitante anônimo vê o CPF/CNPJ reduzido aos seus dígitos verificadores e a conta aos seus últimos dígitos, ambos com a legenda *(parcial)*; um identificado os vê por inteiro. Ausente quando o job fica terminal, porque o detalhe de linhas é expurgado naquela transição. |
| Não oferecido | **Sem download do arquivo bruto**, em nenhuma superfície de aprovação. |
| Contexto de repetição | Quando o job é uma repetição de um previamente aprovado: quem aprovou o pai, e se o arquivo é idêntico byte a byte. Aquelas aprovações **não** contam para o quórum deste job. |
| Não encontrado | Um job que não existe e um job que nunca ficou retido renderizam a mesma mensagem, de modo que um id adivinhado não revela nada. |

Passo a passo completo: [Aprovações](approvals.md).

## `/approvals` — Portal do aprovador

A fila de um único aprovador, alcançada pelo seu próprio link durável ou por um login `Approver` do
Microsoft Entra. Como o `/approve/{id}`, renderiza no layout simples. Desligado a menos que
`ApproverPortal:Enabled` — veja [Configuração](configuration.md#approverportal).

| Aspecto | Comportamento |
|---------|---------------|
| Autenticação | Uma **sessão de aprovador**, em seu próprio esquema de cookie. Não é o cookie de operador nem a chave de API. Como ela carrega uma política de autorização, o `/approvals` **não** é uma rota anônima — que é o que torna um índice de aprovações pendentes admissível em primeiro lugar. |
| Como entrar | `/approvals/link/{token}` — o link durável, anônimo porque é como uma credencial é obtida. Ele valida, define o cookie e redireciona; a partir daí o aprovador salva `/approvals` nos favoritos. Um token irresolúvel e um token ausente caem na mesma página, que não diz nada sobre o porquê. |
| Abas | **Precisa de você**, **Aguardando outros**, **Decididos** — separadas por *sua decisão*, não pelo status do job. As duas primeiras são ambas `AwaitingApproval`. |
| Escopo | Somente jobs cujo **pool congelado** o nomeia. |
| Cada linha | Uma linha: nome do arquivo, status, total geral, contagens de pagamentos e exclusões, a contagem do quórum, quando ficou retido, o prazo para decidir — mais um sinal de risco, o **maior pagamento individual**, onde um zero a mais aparece. O pagador aparece somente quando a lista tem mais de um pagador distinto. |
| Aprovar | Um clique a partir da linha. Linhas marcadas em **Precisa de você** podem ser aprovadas como um lote pela barra de ferramentas; cada arquivo marcado é tentado independentemente do que os anteriores retornaram, e o resultado nomeia cada arquivo que não passou e o motivo. |
| Rejeitar | Na linha, atrás de um **diálogo modal** carregando o aviso de irreversibilidade e um motivo opcional — o botão da linha apenas pergunta. **Não existe rejeição em lote**, aqui nem em lugar nenhum. |
| Quem recebe | Expande a linha no lugar para a tabela de pagamentos, identificadores **por inteiro** — o leitor é uma pessoa específica, e não quem quer que detenha uma URL repassada. |
| Alcance de Decididos | Limitado pelo `ApproverPortal:DecidedLookback` (90 dias por padrão) e limitado a 200 linhas. Quando o limite morde, a página avisa. |
| Exportação | **Exportar para Excel**, no mesmo lugar em todas as abas, desabilitado em vez de oculto quando a aba está vazia. Baixa a aba inteira, não as linhas marcadas. **Nível de job: uma linha por arquivo de pagamento, nunca uma por beneficiário.** Um bloco de título acima da tabela nomeia o leitor, o momento e a lista, e em **Decididos** também sua janela de retrospecto e se o limite mordeu. |
| Não oferecido | Sem download do arquivo bruto. Sem rota para um job fora dos seus pools. |

Onde os operadores obtêm os links: a página **Sistema**, um por aprovador configurado. Nunca a página do
job.

## Convenções da trilha de auditoria

Toda ação registra:

| Ação | Onde ela aparece |
|------|------------------|
| Pausar / retomar | Um evento de sistema + o motivo da pausa |
| Cancelar | Uma entrada de histórico no job cancelado |
| Repetir | Uma entrada de histórico no pai + uma entrada inicial de histórico no filho |
| Rescan | Um evento de sistema resumindo o resultado |
| Clear Jobs | Um evento de sistema `JobsCleared` registrando o ator e quantos registros foram apagados |

As mensagens seguem formatos consistentes, por exemplo `"Pipeline paused by operator. Reason: Quarterly
maintenance."` e `"Operator canceled: still investigating."`.

## Tema

O dashboard usa a paleta da marca Lacuna Software — azul-marinho (`#000F29`) mais o laranja de destaque
(`#F15A31`). Os operadores podem alternar entre modo claro e escuro pela barra de aplicativo; a escolha
persiste pela sessão.

## Dashboard no console (somente execuções em primeiro plano)

Quando o serviço roda como um processo de console em primeiro plano em um terminal interativo, um painel
de status ao vivo substitui o log em fluxo contínuo. Os operadores recebem um único snapshot sempre
atualizado — estado de pausa, tamanho da fila, contagem em andamento + detalhamento por formato, totais
de concluídos/falhados/cancelados desde o boot, uptime, e o endereço de escuta — atualizado no mesmo
tique de `Dashboard:PollIntervalSeconds` que o dashboard web usa.

**Predicado de ativação** (todos os três precisam valer):

| Condição | |
|----------|--|
| `Console:Dashboard:Enabled = true` | padrão `true` |
| O host não é um Serviço do Windows / unit do systemd | detectado automaticamente |
| A saída padrão é um terminal interativo | não redirecionada para arquivo ou pipe |

Quando o predicado é falso (qualquer host de serviço, ou saída redirecionada, ou `Enabled = false`), o
serviço continua transmitindo eventos de log estruturados para a saída padrão.

- **A saída de boot não é afetada.** O banner e o resumo `Service ready` são impressos antes de a região
  ao vivo começar; eles permanecem visíveis no topo do buffer do terminal.
- **O detalhe forense continua no destino de arquivo.** O painel ao vivo omite detalhes por job (nomes
  de arquivo, mensagens de erro) para se manter legível. Acompanhe o arquivo de log para o registro
  durável.
- **Como desativar.** Defina `Console:Dashboard:Enabled = false` para manter a visão de log em fluxo
  contínuo em execuções em primeiro plano.
- **Requisitos do terminal.** Qualquer terminal moderno funciona (Windows Terminal, Alacritty, iTerm2,
  gnome-terminal, Terminal do macOS). O `conhost.exe` legado e alguns clientes SSH restritos recaem para
  saída com rolagem.

## Atrás de um proxy reverso

O dashboard usa uma conexão em tempo real com o servidor (WebSockets). Se você o colocar atrás de um
proxy reverso, garanta que os WebSockets sejam repassados (a maioria dos proxies os habilita por padrão;
verifique se o `Upgrade: websocket` sobrevive). Repasse também os cabeçalhos `Set-Cookie` e `Cookie` sem
modificação, e defina `X-Forwarded-Proto: https` ao terminar o TLS no proxy, para que o cookie de sessão
seja marcado como `Secure`.

---

**A seguir:** [Estatísticas de jobs](statistics.md) — lendo o painel de desempenho.
**Anterior:** [Operação](operations.md).
