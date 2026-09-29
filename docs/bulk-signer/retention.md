---
sidebar_label: "Retenção"
sidebar_position: 15
---

# Retenção

O que expira e é removido automaticamente, o que não é e como planejar a capacidade de disco.

## Em resumo

| O quê | Podado automaticamente? | Como |
|-------|-------------------------|------|
| Arquivos de log (`/var/log/bulksigner/bulksigner-*.log`) | **Sim** | O destino de arquivo rotaciona diariamente e retém 14 arquivos (`Logging:File:RetainedFileCountLimit`). |
| Arquivos em `data/input/` | Não | Removidos apenas após um ciclo bem-sucedido de assinar-verificar-promover, ou por ação do operador. |
| Diretórios em `data/processing/` | Não | Criados e removidos pelo worker, por job. Diretórios remanescentes pertencem a jobs que falharam ou foram interrompidos e são movidos para `error/` pela varredura de recuperação na inicialização. |
| Arquivos em `data/output/` (assinados, envelopes `.enc` e a devolução `.reject` de um arquivo rejeitado) | **Não** | A ação de limpeza é atualmente um stub que não faz nada. Os arquivos só saem por ordem do operador — [o Limpar Jobs, ou a exclusão de um job](#o-que-um-operador-pode-apagar-limpar-jobs-e-exclusão-de-job). |
| Diretórios em `data/error/` | **Não** | Idem. |
| Linhas de job / histórico / evento no banco de dados operacional | **Não** | Idem — exceto por ordem do operador: o **Limpar Jobs** apaga toda linha de job e todo evento operacional registrado antes de a limpeza começar, deixando o evento `JobsCleared`; **excluir um job** remove as linhas daquele job e mantém todo evento. |
| Regras de aprovação congeladas e aprovações registradas | **Não** | Nunca podadas. Quem autorizou um pagamento, e sob qual regra, é exatamente o que uma auditoria pergunta depois, então elas são retidas depois que o job chega a um estado terminal — até que um operador limpe ou exclua o job, quando vão junto com ele. |
| **Detalhe de linhas do CNAB240** (uma linha por pagamento) | **Sim** | Apagado na transição para `Completed`, `Failed` ou `Canceled`. A única exceção — veja [abaixo](#a-única-exceção-detalhe-de-linhas-do-cnab240). |

## O que é retido não muda; onde é retido pode diferir

Tudo o que está na tabela acima vale para os **dois** providers de banco de dados. Escolher
[`Database:Provider = SqlServer`](configuration.md#database-e-connectionstrings) move as linhas do
arquivo SQLite para o seu próprio SQL Server ou Azure SQL; isso não muda em nada quais delas são podadas
automaticamente, quando nem por quê.

Duas consequências decorrem do *onde*, e ambas são responsabilidade sua, e não do serviço:

- **Com `SqlServer`, backup e tamanho ficam a cargo da administração do seu SGBD** — veja
  [Disciplina de backup](#disciplina-de-backup) abaixo.
- **Trocar de provider de banco de dados não leva os registros junto.** Não há importador. Uma
  implantação que troca de provider começa com um **banco vazio** — inclusive as regras de aprovação congeladas e as aprovações
  registradas, as duas coisas que esta tabela guarda para sempre precisamente porque são a evidência de
  quem autorizou um arquivo de pagamento. Arquive o antigo `db/bulksigner.db` deliberadamente, antes da
  troca: [Instalação](installation.md#migrando-do-sqlite--arquive-o-arquivo-antigo-primeiro).

## Logs — o que o destino de arquivo faz

O destino de arquivo é configurado em `Logging:File:*` (veja
[Configuração](configuration.md#logging--loggingfile)):

| Controle | Padrão | Efeito |
|----------|--------|--------|
| `RollingInterval` | `Day` | Um novo arquivo é criado no início de cada dia UTC. |
| `FileSizeLimitBytes` | 50 MB | Se um arquivo atinge este tamanho antes de o dia virar, o destino passa para um novo arquivo irmão. |
| `RetainedFileCountLimit` | 14 | Arquivos rotacionados mais antigos são apagados pelo destino. |
| `MinimumLevel` | `Information` | Qualquer coisa abaixo deste nível é filtrada antes de chegar ao arquivo. |

Efeito final com os valores padrão: ~14 dias de logs estruturados, com ≤ 50 MB por arquivo diário.
Aumente o `RetainedFileCountLimit` para ter uma janela forense mais longa, ou reduza-o em discos com
pouco espaço. O destino faz flush com frequência, então leitores concorrentes (`tail -f`,
`journalctl -fu bulksigner`) veem as gravações quase em tempo real.

## Logs em uma tabela — nada os poda

O `Logging:AzureTable:*` envia os mesmos eventos de log para uma tabela do Azure Storage, de modo que o
fluxo de diagnóstico sobreviva a um host cujo disco não sobrevive (veja
[Configuração](configuration.md#loggingazuretable--um-segundo-destino-de-log)). Ele é o único destino
neste produto **sem nenhum mecanismo de retenção**, e vale a pena resolver isso antes de habilitá-lo, e
não depois.

:::danger Decida como fazer a poda antes de ligar o destino
O destino de arquivo apaga seus próprios arquivos antigos (`RetainedFileCountLimit`). A tabela não, e
**nenhum mecanismo do Azure consegue fazer isso por você**: tabelas do Azure Storage não têm TTL, não têm
regra de gerenciamento de ciclo de vida e não têm operação de exclusão em lote. A tabela cresce durante
todo o tempo em que o destino estiver habilitado, e cada linha é armazenamento cobrado, além das
transações necessárias para removê-la depois.
:::

O que isso significa na prática:

| | Destino de arquivo | Destino de tabela |
|---|---|---|
| Dados antigos removidos por | O próprio destino, conforme rotaciona | **Nada.** Você agenda um job, ou ela cresce para sempre |
| Limitado por | `RetainedFileCountLimit` × `FileSizeLimitBytes` | Seu próprio cronograma de poda |
| Custo de não fazer nada | Zero — ele se autolimita | Cresce monotonicamente |

A solução suportada é o script `Prune-BulkSignerLogTable.ps1` do pacote de implantação, executado em um
cronograma (um runbook do Azure Automation, uma tarefa agendada ou um job em container) com uma janela de
retenção equivalente ao período que o destino de arquivo mantém. Duas notas operacionais:

- **A exclusão é por entidade.** Não há `DELETE WHERE`, então a poda é uma consulta seguida de exclusões
  de entidades em lote, e o custo cresce com o volume que você está removendo. Podar semanalmente desde o início
  é muito mais barato do que podar uma vez depois de um ano.
- **Dê a cada implantação sua própria tabela** se duas dividirem uma conta de armazenamento.
  Distingui-las por uma coluna dentro de uma tabela quebra o procedimento de poda, que particiona por data em
  vez de por implantação.

O modo cluster torna este destino quase obrigatório — o disco de um container Linux desaparece na
reciclagem e leva os arquivos de log rotacionados junto. Por isso, deixá-lo desligado nesse modo registra
um log Critical na inicialização, em vez de passar em silêncio. É também por isso que a ordem importa: a
implantação que mais provavelmente precisa do destino é a que menos provavelmente já tem um job de poda.
Veja [Alta disponibilidade](high-availability.md#os-logs-são-efêmeros-a-menos-que-você-os-torne-duráveis).

## Dados operacionais — não podados automaticamente

A ação de limpeza (`POST /api/cleanup` e o botão **Executar limpeza agora** na página **Sistema** do
dashboard) é atualmente um **stub que não faz nada**: ela retorna com sucesso e uma mensagem de "política de retenção não
configurada", e não remove nada.

### Por que um stub, e não "apagar por idade" por padrão?

A forma da retenção é deliberadamente definida pelo operador. A trilha de auditoria (`output/`,
`error/`, linhas de histórico de job) é **valiosa** para conformidade: apagar um PDF assinado que um
verificador que consome a saída ainda pode querer buscar, ou uma linha de histórico que um auditor ainda pode
querer ler, é uma ação destrutiva que deveria refletir uma política deliberada do operador — e não um
padrão que surpreende alguém seis meses depois.

Comportamento padrão:

- Saídas assinadas se acumulam em `output/`. Operadores ou a automação que consome a saída as retiram de lá.
- Diretórios de erro se acumulam em `error/`. Operadores inspecionam e depois apagam com comandos comuns
  de sistema de arquivos.
- Linhas de job se acumulam no banco operacional, que cresce linearmente com a vazão — o arquivo SQLite
  com `Sqlite`, o seu próprio banco de dados com `SqlServer`. Não existe poda por idade do histórico de
  jobs nesta versão; as duas ações de operador abaixo são as únicas coisas que o removem.

### O que um operador pode apagar: Limpar Jobs e exclusão de job

Nada expira sozinho, mas duas ações deliberadas do operador apagam dados — e ambas levam arquivos, além
de linhas.

:::warning Mudou na 2.9.0 e na 2.10.0 — o Limpar Jobs leva tudo
O Limpar Jobs apagava apenas registros de job **finalizados** e deixava todo arquivo e todo evento
operacional no lugar. Desde a 2.9.0 ele apaga **todo** registro de job, qualquer que seja o status, e
todo arquivo que esses jobs deixaram para trás; desde a 2.10.0 ele apaga também os eventos operacionais.
:::

- **O [Limpar Jobs](operations.md#limpar-jobs)** (Sistema → Zona de perigo, ou `DELETE /api/jobs`) apaga
  todo job, em qualquer status — com seu histórico, sua regra de aprovação congelada e as aprovações
  registradas, seu detalhe de linhas do CNAB240 e seus tempos de etapa — e os arquivos de cada job: a
  entrada, suas pastas em `processing/` e `error/`, a saída assinada (ou o envelope `.enc`) e a devolução
  `.reject` de um arquivo rejeitado. **Todo evento operacional registrado antes de a limpeza começar vai
  junto**, e um evento `JobsCleared` é gravado como registro do corte, indicando quem fez a limpeza e quantos
  jobs, arquivos, pastas e eventos foram apagados. Estado do pipeline, perfis de assinatura, configuração e
  arquivos de log não são tocados. A resposta traz as contagens (`deleted`, `filesDeleted`,
  `foldersDeleted`, `eventsDeleted`, `itemsFailed`); um arquivo em uso por outro processo, ou uma pasta
  que o armazenamento se recusa a remover, fica no lugar, é contado e aparece nomeado no log.
- **Excluir um job** (o botão de excluir na linha do job em `/jobs`, um job por vez, protegido por uma
  confirmação com motivo opcional; não há rota REST) remove as linhas daquele job — o mesmo conjunto
  acima —, mais suas pastas em `processing/` e `error/`, a saída que ele registrou ter gravado e a
  entrada, somente se foi o próprio job que a colocou em staging e ela não mudou desde então. Um job que um worker está executando não pode
  ser excluído. **Todo evento operacional permanece**, e um evento `JobDeleted` é acrescentado,
  resumindo o que foi removido, o que foi mantido e as aprovações que o job carregava.

Ambas são irreversíveis. **Faça antes um [backup do banco de dados](#disciplina-de-backup)** se a
trilha de auditoria que elas removem ainda importa — o backup é a única cópia da trilha que sobrevive a
elas.

## A única exceção: detalhe de linhas do CNAB240

A interpretação em nível de linha de um arquivo de pagamento é o **primeiro e único dado operacional do
produto que se poda sozinho.** Isso é um desvio deliberado da postura acima, com escopo restrito de propósito.

Quando um job é interpretado como uma [remessa CNAB240](cnab240.md), o pipeline armazena uma linha por
pagamento — com o nome do beneficiário, o CPF/CNPJ quando o arquivo o informa e a conta de destino —
em uma tabela 1:1 ao lado do job. Ela alimenta duas telas enquanto o job está em andamento e
alguém ainda pode agir sobre ele: a tabela **Pagamentos** em `/jobs/{id}`, e a mesma tabela na
[página de aprovação](approvals.md#os-pagamentos-individuais).

**A linha é apagada na transição para `Completed`, `Failed` ou `Canceled`.** Não por agendamento, nem
pelo endpoint de limpeza — na própria transição, de modo que não há um processo de varredura que possa
atrasar e não há janela em que um job terminal ainda guarde os dados. Todo caminho para um status
terminal faz o expurgo, inclusive o cancelamento por um operador, a rejeição por um aprovador e a
expiração de uma janela de aprovação.

Há duas razões, e a primeira explica por que isso não contradiz a postura acima:

1. **É redundante quando o job chega a um estado terminal, e não apenas quando fica antigo.** Todo o resto na tabela de retenção é
   a *única* cópia do que registra — apague uma linha de histórico e a trilha de auditoria fica com um
   buraco. O detalhe de linhas é um cache do que já está no arquivo, e o arquivo sobrevive a todo desfecho
   terminal: `output/` quando o job conclui, `output/` de novo — com um nome `.reject` — quando um
   aprovador o vetou, e `error/` quando ele falha, quando um prazo de espera se esgota ou quando um
   operador o cancela. O job também mantém o SHA-256 do conteúdo, então é possível provar que o artefato
   sobrevivente é o mesmo que foi interpretado. Nenhuma informação se torna inacessível.
2. **É a maior concentração de dados pessoais que o produto mantém** — cada beneficiário de cada folha de
   pagamento, acumulando-se para sempre, sem nenhum consumidor depois que o job termina. Uma exposição à
   LGPD que cresce com a vazão e não traz benefício algum.

O que *não* é tocado pelo expurgo: os números de resumo do job (total, contagens de pagamentos e de
cancelamentos, intervalo de datas de pagamento), o hash do conteúdo e o histórico do job. Esses são
permanentes. O painel **Pagamentos** avisa isso claramente quando a linha já foi apagada, em vez de
renderizar uma tabela vazia que pareceria perda de dados.

Se uma implantação precisa que o detalhe de linhas sobreviva ao job, o artefato em `output/` é a fonte da
verdade — arquive esse artefato, e não a linha do banco de dados.

## Estimando o crescimento de disco

Ordem de grandeza aproximada para uma única instância:

| Artefato por job | Tamanho típico |
|------------------|----------------|
| PDF assinado em texto claro | ~ tamanho da origem + dicionário de assinatura (~10–50 KB) |
| Envelope BSENC v1 | tamanho da origem + 37 bytes |
| Linha de job | ~ 1 KB |
| Linha de histórico | ~ 200–500 bytes; 2–4 por job bem-sucedido, mais em caso de novas tentativas ou falhas |

Para 10.000 jobs/dia em documentos médios, espere aproximadamente:

| Superfície | Crescimento em 30 dias |
|------------|------------------------|
| `output/` | dominado pelo tamanho do documento (10.000 × 30 × tamanho da origem) |
| `db/bulksigner.db` | < 100 MB (as linhas são pequenas) |
| `logs/` | limitado por `RetainedFileCountLimit` × `FileSizeLimitBytes` (= 700 MB nos padrões) |
| `error/` | proporcional à taxa de falhas; geralmente pequeno |

O arquivo de banco de dados raramente vira o gargalo. A árvore de saída é a maior superfície — planeje a
capacidade de disco (ou o arquivamento externo) de acordo.

## Procedimentos manuais de retenção

Cabe aos operadores implementar a retenção em scripts próprios. Alguns padrões:

### Mover e arquivar o `output/` (recomendado)

```bash
# Linux: cron noturno que move arquivos com mais de 7 dias para uma árvore de arquivo morto.
find /var/lib/bulksigner/output -type f -mtime +7 \
  -exec mv {} /archive/bulksigner/output/ \;
```

```powershell
# Windows: tarefa agendada que move arquivos com mais de 7 dias.
Get-ChildItem C:\ProgramData\Lacuna\BulkSigner\data\output `
    -Recurse -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
    Move-Item -Destination D:\archive\bulksigner\output\
```

Mover (e não apagar) preserva a trilha de auditoria em um local fora da instância.

### Podar o `error/` após a triagem

```bash
# Apaga diretórios em error/ com mais de 30 dias. Revise primeiro.
find /var/lib/bulksigner/error -mindepth 1 -maxdepth 1 -type d -mtime +30 -print
# revise a saída, então remova o -print e acrescente -exec rm -rf {} \;
```

Prefira revisão manual aqui — o `error/` frequentemente contém a única cópia forense do que deu errado.

### Reduzir as linhas de histórico

A integridade da trilha de auditoria depende da cadeia completa de histórico. Se o volume de linhas virar
um problema operacional, prefira arquivar o arquivo SQLite (`mv bulksigner.db bulksigner-2026Q1.db`,
reiniciar com um banco novo) a fazer exclusões parciais.

## Disciplina de backup

### A funcionalidade de backup embutida — somente SQLite

Com `Database:Provider = Sqlite`, o produto pode fazer o backup do banco para você: `Backup:Enabled = true`
acrescenta uma página `/backup` no dashboard, o `GET|POST /api/backup` e um agendador opcional
(`Backup:IntervalHours`). Os artefatos vão para um caminho local, um bucket S3 ou compatível com S3, ou
um container do Azure Blob, com o `Backup:RetainCount` limitando quantos são mantidos. Cada chave está em
[Configuração](configuration.md#backup).

:::warning `Backup:Enabled = true` com `SqlServer` impede o boot
É uma recusa que cita as duas chaves, e não uma omissão silenciosa — porque o backup do SGBD do próprio
cliente é responsabilidade da administração desse SGBD, e uma funcionalidade que silenciosamente não
fizesse nada daria a impressão de que existe um backup. Como o modo cluster **exige** `SqlServer`, a
combinação é impossível nesse modo, por construção; o point-in-time restore do próprio Azure SQL é a
resposta nessa topologia.
:::

Duas restrições sobre o `Backup:Disk:Path` merecem ser repetidas aqui porque são erros de retenção, e não
de configuração, e ambas são recusadas no boot: um caminho dentro de uma **pasta de entrada monitorada**
(o pipeline ingeriria, assinaria e então *apagaria* o seu backup) e um caminho dentro de `processing/`,
`output/`, `error/` ou `db/`.

### Independentemente da retenção e dessa funcionalidade

- **Faça backup do banco operacional antes de toda atualização do serviço.** As migrações de schema são
  executadas automaticamente na inicialização e são de mão única, nos dois providers — a maioria das
  versões desde a 2.0.0 acrescenta uma. Faça um backup também antes de um **Limpar Jobs**: o backup é a
  única cópia da trilha de auditoria que sobrevive a ele.
- **Faça snapshot do `output/` se ele carregar artefatos com significado de auditoria.** Especialmente
  quando a criptografia está habilitada — perder um arquivo criptografado é duplamente irrecuperável (sem
  senha = sem texto claro).
- **Trate o `data/` como uma unidade ao fazer backup.** `input/`, `processing/`, `output/`, `error/`,
  `db/`, `logs/` juntos descrevem o estado operacional completo. Um snapshot é consistente se tirado com o
  serviço parado ou pausado (e a contagem de jobs em andamento em zero).
- **Com `Database:Provider = SqlServer`, o banco não está em `data/`** e fica a cargo da administração
  do seu SGBD — o que é uma das duas razões pelas quais um cliente escolhe esse provider. Faça backup dele
  no mesmo cronograma de qualquer outro banco de dados de registro oficial, e mantenha o snapshot da
  árvore de arquivos em sincronia com ele: um banco restaurado cujos diretórios `processing/` não existem
  mais deixa a varredura de recuperação da inicialização sem nada com que reconciliar.
- **Com `Storage:Provider = AzureFiles`, `processing/`, `output/` e `error/` também não estão em
  `data/`.** Faça backup do compartilhamento pelos recursos de snapshot ou backup do próprio Azure
  Files; `logs/` e, com `Sqlite`, `db/` permanecem no host.

Veja [Operação](operations.md) para o procedimento de pausa / atualização / backup.

---

**A seguir:** [Diagnóstico de problemas](troubleshooting.md).
**Anterior:** [Aprovações](approvals.md).
