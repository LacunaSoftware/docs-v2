---
sidebar_label: "Retenção"
sidebar_position: 15
---

# Retenção

O que envelhece e sai automaticamente, o que não sai, e como planejar a capacidade de disco.

## Em resumo

| O quê | Podado automaticamente? | Como |
|-------|-------------------------|------|
| Arquivos de log (`/var/log/bulksigner/bulksigner-*.log`) | **Sim** | O destino de arquivo rotaciona diariamente e retém 14 arquivos (`Logging:File:RetainedFileCountLimit`). |
| Arquivos em `data/input/` | Não | Removidos apenas após um ciclo bem-sucedido de assinar-verificar-promover, ou por ação do operador. |
| Diretórios em `data/processing/` | Não | Criados e removidos pelo worker, por job. Diretórios remanescentes pertencem a jobs falhados/interrompidos e são movidos para `error/` pela varredura de recuperação na inicialização. |
| Arquivos em `data/output/` (assinados ou envelopes `.enc`) | **Não** | A ação de limpeza é atualmente um stub que não faz nada. |
| Diretórios em `data/error/` | **Não** | Idem. |
| Linhas de job / histórico / evento na base operacional | **Não** | Idem. |
| Regras de aprovação congeladas e aprovações registradas | **Não — nunca** | Quem autorizou um pagamento, e sob qual regra, é exatamente o que uma auditoria pergunta depois do fato. Retidos mesmo depois de o job ficar terminal. |
| **Detalhe de linhas do CNAB240** (uma linha por pagamento) | **Sim** | Apagado na transição para `Completed`, `Failed` ou `Canceled`. A única exceção — veja [abaixo](#a-única-exceção-detalhe-de-linhas-do-cnab240). |

## O que é retido não muda; onde é retido pode diferir

Tudo naquela tabela é verdade nos **dois** providers de banco de dados. Escolher
[`Database:Provider = SqlServer`](configuration.md#database-e-connectionstrings) move as linhas do
arquivo SQLite para o seu próprio SQL Server ou Azure SQL; isso não muda nada sobre quais delas se podam
sozinhas, quando, ou por quê.

Duas consequências decorrem do *onde*, e ambas são suas, e não do serviço:

- **Backup e tamanho são assunto do regime do seu SGBD sob `SqlServer`** — veja
  [Disciplina de backup](#disciplina-de-backup) abaixo.
- **Trocar de provider de banco de dados não leva o registro junto.** Não há importador. Uma implantação
  que troca esbarra em uma **base vazia** — inclusive as regras de aprovação congeladas e as aprovações
  registradas, as duas coisas que esta tabela guarda para sempre precisamente porque são a evidência de
  quem autorizou um arquivo de pagamento. Arquive o antigo `db/bulksigner.db` deliberadamente, antes da
  troca: [Instalação](installation.md#migrando-do-sqlite--arquive-o-arquivo-antigo-primeiro).

## Logs — o que o destino de arquivo faz

O destino de arquivo é configurado sob `Logging:File:*` (veja
[Configuração](configuration.md#logging--loggingfile)):

| Controle | Padrão | Efeito |
|----------|--------|--------|
| `RollingInterval` | `Day` | Um novo arquivo é criado no início de cada dia UTC. |
| `FileSizeLimitBytes` | 50 MB | Se um arquivo atinge este tamanho antes de o dia virar, o destino rotaciona para um arquivo irmão. |
| `RetainedFileCountLimit` | 14 | Arquivos rotacionados mais antigos são apagados pelo destino. |
| `MinimumLevel` | `Information` | Qualquer coisa abaixo deste nível é filtrada antes de chegar ao arquivo. |

Efeito líquido nos padrões: ~14 dias de logs estruturados a ≤ 50 MB por arquivo de dia. Aumente o
`RetainedFileCountLimit` para uma janela forense mais longa, ou reduza-o para discos restritos. O destino
faz flush com frequência, então leitores concorrentes (`tail -f`, `journalctl -fu bulksigner`) veem as
escritas quase em tempo real.

## Logs em uma tabela — nada os poda

O `Logging:AzureTable:*` envia os mesmos eventos de log para uma tabela do Azure Storage, de modo que o
fluxo de diagnóstico sobreviva a um host cujo disco não sobrevive (veja
[Configuração](configuration.md#loggingazuretable--um-segundo-destino-de-log)). Ele é o único destino
neste produto **sem mecanismo de retenção algum**, e isso vale resolver antes de habilitá-lo, e não
depois.

:::danger Decida a história da poda antes de ligar o destino
O destino de arquivo apaga seus próprios arquivos antigos (`RetainedFileCountLimit`). A tabela não, e
**nenhum mecanismo do Azure consegue fazer isso por você**: tabelas do Azure Storage não têm TTL, não têm
regra de gerenciamento de ciclo de vida e não têm operação de exclusão em lote. A tabela cresce por todo
o tempo em que o destino estiver habilitado, e cada linha é armazenamento cobrado, mais as transações
para removê-la depois.
:::

O que isso significa na prática:

| | Destino de arquivo | Destino de tabela |
|---|---|---|
| Dados antigos removidos por | O próprio destino, conforme rotaciona | **Nada.** Você agenda um job, ou ela cresce para sempre |
| Limitado por | `RetainedFileCountLimit` × `FileSizeLimitBytes` | Seu próprio cronograma de poda |
| Custo de deixá-lo em paz | Zero — ele se autolimita | Cresce monotonicamente |

A resposta suportada é o script `Prune-BulkSignerLogTable.ps1` do pacote de implantação, executado em um
cronograma (um runbook do Azure Automation, uma tarefa agendada, ou um job em container) com uma janela
de retenção que corresponda ao que quer que seu destino de arquivo mantenha. Duas notas operacionais:

- **A exclusão é por entidade.** Não há `DELETE WHERE`, então a poda é uma consulta seguida de exclusões
  de entidades em lote, e o custo escala com o que você está removendo. Podar semanalmente desde o início
  é muito mais barato do que podar uma vez depois de um ano.
- **Dê a cada implantação sua própria tabela** se duas dividirem uma conta de armazenamento.
  Distingui-las por uma coluna dentro de uma tabela quebra a receita de poda, que particiona por data em
  vez de por implantação.

O modo cluster torna este destino quase obrigatório — o disco de um container Linux desaparece na
reciclagem e leva os arquivos de log rotacionados junto — razão pela qual deixá-lo desligado ali registra
um Critical na inicialização, em vez de passar silenciosamente. Isso também é por que a ordem importa: a
implantação que mais provavelmente precisa do destino é a que menos provavelmente já tem um job de poda.
Veja [Alta disponibilidade](high-availability.md#os-logs-são-efêmeros-a-menos-que-você-os-torne-duráveis).

## Dados operacionais — não podados automaticamente

A ação de limpeza (`POST /api/cleanup` e o botão Cleanup na página Sistema do dashboard) é atualmente um
**stub que não faz nada**: ela retorna com sucesso e uma mensagem de "política de retenção não
configurada", e não remove nada.

### Por que um stub, e não "apagar por idade" por padrão?

O formato da retenção é deliberadamente controlado pelo operador. A trilha de auditoria (`output/`,
`error/`, linhas de histórico de job) é **valiosa** para conformidade: apagar um PDF assinado que um
verificador a jusante ainda pode querer buscar, ou uma linha de histórico que um auditor ainda pode
querer ler, é uma ação destrutiva que deveria refletir uma política deliberada do operador — e não um
padrão que surpreende alguém seis meses depois.

Comportamento padrão:

- Saídas assinadas se acumulam em `output/`. Operadores ou automação a jusante as retiram de lá.
- Diretórios de erro se acumulam em `error/`. Operadores inspecionam e depois apagam com comandos comuns
  de sistema de arquivos.
- Linhas de job se acumulam na base operacional, que cresce linearmente com a vazão. A única ferramenta
  embutida para recuperar aquele espaço é o [Clear Jobs](operations.md#clear-jobs), que apaga cada
  registro de job **finalizado** e deixa os não finalizados no lugar. Não existe poda por idade nem poda
  seletiva do histórico de jobs nesta versão.

## A única exceção: detalhe de linhas do CNAB240

A interpretação em nível de linha de um arquivo de pagamento é o **primeiro e único dado operacional do
produto que se poda sozinho.** Isso é um desvio deliberado da postura acima, e é estreito de propósito.

Quando um job é interpretado como uma [remessa CNAB240](cnab240.md), o pipeline armazena uma linha por
pagamento — carregando o nome do beneficiário, seu CPF/CNPJ quando o arquivo declara um, e a conta de
destino — em uma tabela 1:1 ao lado do job. Ela serve a duas telas enquanto o job está em andamento e
alguém ainda pode agir sobre ele: a tabela **Pagamentos** em `/jobs/{id}`, e a mesma tabela na
[página de aprovação](approvals.md#os-pagamentos-individuais).

**A linha é apagada na transição para `Completed`, `Failed` ou `Canceled`.** Não por um agendamento, não
pelo endpoint de limpeza — na própria transição, de modo que não há um varredor que possa ficar para
trás e não há janela em que um job terminal ainda carregue os dados. Todo caminho para um status terminal
expurga, inclusive o cancelamento de um operador, a rejeição de um aprovador, e a expiração de uma janela
de aprovação.

Duas razões, e a primeira é por que isso não contradiz a postura acima:

1. **É redundante quando o job é terminal, não meramente antigo.** Todo o resto na tabela de retenção é
   a *única* cópia do que registra — apague uma linha de histórico e a trilha de auditoria fica com um
   buraco. O detalhe de linhas é um cache do que já está no arquivo, e o arquivo sobrevive a todo desfecho
   terminal: `output/` quando o job conclui, `error/` quando ele falha ou é rejeitado. O job também
   mantém seu SHA-256 de conteúdo, então o artefato sobrevivente pode ser provado como sendo o que foi
   interpretado. Nada se torna incognoscível.
2. **É a maior concentração de dados pessoais que o produto detém** — cada beneficiário de cada folha de
   pagamento, acumulando-se para sempre, sem consumidor remanescente depois de o job terminar. Uma
   exposição LGPD que cresce com a vazão e não compra nada.

O que *não* é tocado pelo expurgo: os números de resumo do job (total, contagens de pagamentos e de
cancelamentos, intervalo de datas de pagamento), o hash de conteúdo, e o histórico do job. Esses são
permanentes. O painel **Pagamentos** avisa isso claramente quando a linha se foi, em vez de renderizar
uma tabela vazia que se lê como perda de dados.

Se uma implantação precisa que o detalhe de linhas sobreviva ao job, o artefato em `output/` é a fonte da
verdade — arquive aquilo, e não a linha de banco de dados.

## Estimando o crescimento de disco

Ordem de grandeza aproximada para uma única instância:

| Artefato por job | Tamanho típico |
|------------------|----------------|
| PDF assinado em texto claro | ~ tamanho da origem + dicionário de assinatura (~10–50 KB) |
| Envelope BSENC v1 | tamanho da origem + 37 bytes |
| Linha de job | ~ 1 KB |
| Linha de histórico | ~ 200–500 bytes; 2–4 por job bem-sucedido, mais para repetições / falhas |

Para 10.000 jobs/dia em documentos médios, espere aproximadamente:

| Superfície | Crescimento em 30 dias |
|------------|------------------------|
| `output/` | dominado pelo tamanho do documento (10.000 × 30 × tamanho da origem) |
| `db/bulksigner.db` | < 100 MB (as linhas são pequenas) |
| `logs/` | limitado por `RetainedFileCountLimit` × `FileSizeLimitBytes` (= 700 MB nos padrões) |
| `error/` | proporcional à taxa de falhas; geralmente pequeno |

O arquivo de banco de dados raramente vira o gargalo. A árvore de saída é a grande superfície — planeje a
capacidade de disco (ou o arquivamento externo) de acordo.

## Receitas manuais de retenção

Os operadores escrevem sua própria retenção em scripts. Alguns padrões:

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

Sob `Database:Provider = Sqlite`, o produto pode fazer o backup da base para você: `Backup:Enabled = true`
acrescenta uma página `/backup` no dashboard, o `GET|POST /api/backup`, e um agendador opcional
(`Backup:IntervalHours`). Os artefatos vão para um caminho local, um bucket S3 ou compatível com S3, ou
um container do Azure Blob, com o `Backup:RetainCount` limitando quantos são mantidos. Cada chave está em
[Configuração](configuration.md#backup).

:::warning `Backup:Enabled = true` sob `SqlServer` recusa o boot
É uma recusa nomeando ambas as chaves, e não uma inoperância silenciosa — porque fazer backup do SGBD do
próprio cliente é trabalho do regime daquele SGBD, e uma funcionalidade que silenciosamente não fizesse
nada se leria como um backup que existe. Como o modo cluster **exige** `SqlServer`, a combinação é
inalcançável ali por construção; o point-in-time restore do próprio Azure SQL é a resposta naquela
topologia.
:::

Duas restrições sobre o `Backup:Disk:Path` valem ser repetidas aqui porque são erros de retenção, e não
de configuração, e ambas são recusadas no boot: um caminho dentro de uma **pasta de entrada monitorada**
(o pipeline ingeriria, assinaria e então *apagaria* o seu backup) e um caminho dentro de `processing/`,
`output/`, `error/` ou `db/`.

### Independente da retenção, e daquela funcionalidade

- **Faça backup da base operacional antes de toda atualização de serviço.** As migrações de schema rodam
  automaticamente na inicialização e são de mão única. Sob `SqlServer`, uma atualização para a 2.0.0
  acrescenta migrações nos dois históricos, aplicadas no boot.
- **Faça snapshot do `output/` se ele carregar artefatos com significado de auditoria.** Especialmente
  quando a criptografia está habilitada — perder um arquivo criptografado é duplamente irrecuperável (sem
  senha = sem texto claro).
- **Trate o `data/` como uma unidade ao fazer backup.** `input/`, `processing/`, `output/`, `error/`,
  `db/`, `logs/` juntos descrevem o estado operacional completo. Um snapshot é consistente se tirado com o
  serviço parado ou pausado (e a contagem de jobs em andamento em zero).
- **Sob `Database:Provider = SqlServer`, a base não está em `data/`** e é assunto do regime do seu SGBD —
  que é uma das duas razões pelas quais um cliente escolhe aquele provider. Faça backup dela no mesmo
  cronograma de qualquer outro banco de dados de registro, e mantenha o snapshot da árvore de arquivos em
  sincronia com ele: uma base restaurada cujos diretórios `processing/` não existem mais é uma varredura
  de recuperação na inicialização sem nada com que reconciliar.
- **Sob `Storage:Provider = AzureFiles`, `processing/`, `output/` e `error/` também não estão em
  `data/`.** Faça backup do compartilhamento pelas próprias facilidades de snapshot ou backup do Azure
  Files; `logs/` e, sob `Sqlite`, `db/` permanecem no host.

Veja [Operação](operations.md) para o procedimento de pausa / atualização / backup.

---

**A seguir:** [Diagnóstico de problemas](troubleshooting.md).
**Anterior:** [Aprovações](approvals.md).
