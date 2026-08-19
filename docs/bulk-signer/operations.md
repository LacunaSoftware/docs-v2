---
sidebar_label: "Operação"
sidebar_position: 6
---

# Operação

Operação do dia a dia do Lacuna Bulk Signer. Como iniciar, parar, reiniciar, observar, pausar e
raciocinar sobre o pipeline de assinatura.

## Comandos de ciclo de vida por alvo

| Alvo | Iniciar | Parar | Reiniciar | Status |
|------|---------|-------|-----------|--------|
| Linux (systemd) | `sudo systemctl start bulksigner` | `sudo systemctl stop bulksigner` | `sudo systemctl restart bulksigner` | `systemctl status bulksigner` |
| Windows | `Start-Service LacunaBulkSigner` | `Stop-Service LacunaBulkSigner` | `Restart-Service LacunaBulkSigner` | `Get-Service LacunaBulkSigner` |
| Docker | `docker compose up -d` | `docker compose stop` | `docker compose restart` | `docker compose ps` |
| Console | execute o executável publicado | `Ctrl+C` | execute de novo | `/api/health` |

A unit do systemd usa `Type=notify` — o `systemctl status bulksigner` relata `active (running)` apenas
**depois** que todo o bootstrap (carga da licença + migrações + recuperação do pipeline) tiver sucesso.
O mesmo vale no Windows: o serviço é marcado como "Iniciado" apenas depois de o banner de resumo de
prontidão ter sido impresso.

## Onde os logs vivem

| Alvo | Caminho |
|------|---------|
| Linux | `/var/log/bulksigner/bulksigner-yyyyMMdd.log` |
| Windows | `C:\ProgramData\Lacuna\BulkSigner\logs\bulksigner-yyyyMMdd.log` |
| Docker | `/var/log/bulksigner/` dentro do container — montado por bind em `deploy/docker/logs/` no host |
| Console | `data/logs/bulksigner-yyyyMMdd.log` (relativo ao diretório de trabalho) |

Os logs rotacionam diariamente, 50 MB por arquivo (configurável), 14 arquivos retidos por padrão. Cada
linha é texto puro com propriedades estruturadas no final:

```
2026-05-26T15:42:11.1234567+00:00 [INF] Worker started job 9b62…  {JobId: "9b62…", Format: "Pades"}
```

Este formato é amigável a `tail -f` para operadores e estruturalmente interpretável por ferramentas
forenses.

Eventos de nível de serviço vão para:

| Alvo | Onde |
|------|------|
| Linux | `journalctl -u bulksigner` (ciclo de vida + saída padrão) |
| Windows | Visualizador de Eventos → Logs do Windows → Aplicativo (somente ciclo de vida do serviço — os logs de nível de aplicação estão no destino de arquivo) |
| Docker | `docker compose logs -f bulksigner` |
| Console | O terminal |

Tanto a saída em arquivo quanto a no console passam pelo pipeline de mascaramento de segredos. Veja
[Segurança](security.md#mascaramento-de-logs--duas-camadas).

## A máquina de estados do job

Oito estados: um desfecho terminal "bom" (`Completed`), dois desfechos terminais "ruins" (`Failed`,
`Canceled`). Dois dos oito são **esperas, e ambas são opcionais**: `AwaitingSigner` é visitado somente
por jobs cujo perfil usa `Method = LacunaSigner` (veja
[Integração com o Lacuna Signer](lacuna-signer.md)), e `AwaitingApproval` somente por jobs cujo perfil
carrega um [bloco `Approval`](approvals.md).

```
                  ┌─────────┐  cancel do operador ┌──────────┐
                  │ Queued  ├────────────────────▶│ Canceled │ (terminal)
                  └────┬────┘                     └──────────┘
     captura do worker │
                       ▼
                ┌────────────┐  assina local ok ┌───────────┐  verifica ok ┌───────────┐
                │ Processing ├─────────────────▶│ Verifying ├─────────────▶│ Completed │
                └─┬────────┬─┘                  └─────┬─────┘              └───────────┘
                  │        │                          │ verificação falha
   perfil exige   │        │ despacha ao              ▼
   aprovação      │        │ Lacuna Signer        ┌────────┐
                  ▼        ▼                      │ Failed │ (terminal)
    ┌──────────────────┐  ┌────────────────┐      └────────┘
    │ AwaitingApproval │  │ AwaitingSigner │
    └──────────────────┘  └────────────────┘
        │         │           │        │
        │         │           │        └─ recusado / expirado / timeout ─▶ Failed
        │         │           └─ concluído → bytes baixados ────────────▶ Verifying
        │         └─ rejeitado / cancel do operador / orçamento expirado ▶ Canceled
        └─ quórum atingido ──▶ volta a Queued (reentra na fila comum)

   Failed ──retry do operador──▶ um NOVO job Queued (ParentJobId definido; o job falho segue Failed)
```

Regras principais:

- **`AwaitingApproval` tem exatamente três transições**, e `Failed` deliberadamente não é uma delas.
  Nada segura um job retido — nenhum worker, nenhum slot, nenhum serviço remoto — então nada está em
  posição de reprová-lo. Ele é liberado de volta para `Queued`, cancelado, ou espera. Três coisas
  diferentes chegam naquela única aresta de cancelamento: a **rejeição** de um aprovador, um cancel de
  operador e — em um perfil que define `Approval.ExpiresAfter` — o esgotamento do orçamento de espera.
  Todas as três significam "este arquivo não será assinado, deliberadamente"; a trilha de auditoria é o
  que as distingue.
- **A liberação reentra na fila comum** em vez de retomar no lugar, de modo que um job liberado passa
  pela mesma reivindicação e pelas mesmas etapas pré-assinatura que qualquer outro — inclusive a
  [guarda de obsolescência das datas de pagamento](cnab240.md#datas-de-pagamento-que-já-passaram), que é
  exatamente a verificação que uma demora humana sem prazo definido precisa que se refaça. Ele retoma
  sobre a cópia com que ficou retido, e os bytes em stage são re-hasheados imediatamente antes de a
  assinatura existir; uma divergência reprova o job com `approval.content-changed`. Veja
  [Aprovações](approvals.md#o-que-é-aprovado).
- **O cancelamento é válido somente a partir de `Queued`, `AwaitingSigner` ou `AwaitingApproval`.** Jobs
  locais em andamento (`Processing`, `Verifying`) não podem ser cancelados — eles rodam até a conclusão
  ou a falha natural. O endpoint de cancelamento retorna `409` com `code = "job.not-queued"` contra um
  job local em andamento. Para perfis LacunaSigner, cancelar um job `AwaitingSigner` também faz uma
  chamada de cancelamento remoto em melhor esforço *depois* de a transição local para `Canceled` ter
  sido confirmada — uma falha remota **não** desfaz o cancelamento local. Veja
  [Semântica do cancelamento](lacuna-signer.md#semântica-do-cancelamento).
- **`Canceled` é terminal.** Os arquivos de jobs cancelados permanecem em `input/`; o observador honra
  cancelamentos recentes e não os ressuscita automaticamente. Ações dirigidas pelo operador (Upload,
  Retry, Rescan) reenfileiram.
- **`Failed → Queued` não é uma transição — é um novo job.** O retry cria um job novo com
  `ParentJobId = (o job falho).Id`, copiando a entrada original. O job falho permanece `Failed` para
  sempre, para fins de auditoria.

## Quando um arquivo de entrada muda no meio de um job

Um produtor às vezes reenvia um arquivo com o mesmo nome enquanto o Bulk Signer ainda está trabalhando
no anterior — um valor corrigido, um lote reexportado, um retry de ERP. Quando isso acontece, **a
correção não é ingerida**: o observador vê um job ativo já detendo aquele caminho e recusa o
enfileiramento duplicado, que é a mesma regra que impede um arquivo de ser enfileirado duas vezes.

O que o pipeline faz a respeito é se recusar a destruí-la. Antes de apagar a entrada original, o worker
compara o arquivo com o que foi registrado enquanto ele era copiado para `processing/` — tamanho e
SHA-256 sempre, mais a entity tag do serviço de armazenamento quando o arquivo está em um
compartilhamento. Se coincidirem, a entrada é apagada como sempre. Se não, **o arquivo é deixado
exatamente onde está** e a divergência é registrada em três lugares:

- um evento operacional `InputDiverged`, carregando o código `job.input-diverged`;
- uma entrada no histórico do próprio job, visível em `/jobs/{id}`, carregando o mesmo código;
- o contador `bulksigner_inputs_diverged_total{profile}`.

:::note Uma divergência não é uma falha de assinatura
A assinatura é válida, o artefato está em `output/`, e o job conclui normalmente — o que foi assinado é
o arquivo que foi colocado em stage e, onde uma etapa de aprovação se aplica, aprovado. Nada no job
precisa de correção.
:::

**O arquivo reescrito é então devolvido à sua pasta monitorada e assinado como um job próprio.** O
evento de mudança do observador disparou *durante* o voo do job e foi corretamente descartado, e nenhum
evento adicional jamais chegará para um arquivo que está simplesmente parado ali — então o pipeline
devolve o caminho explicitamente, **depois** que o job atinge um status terminal. Ele reentra pela rota
de candidatos *comum* do observador, então o detector de estabilidade, as listas de ignorados da pasta e
seu perfil se aplicam exatamente como a qualquer chegada.

Dois casos ainda precisam de você. A devolução é descartada, e o console avisa, quando:

- **O job não veio de uma pasta monitorada** — um upload REST não tem observador que seja dono do seu
  caminho. Reenvie o arquivo se ele deve ser assinado.
- **Nenhum observador está rodando para aquela pasta** — ou o processo ainda está subindo (o que se
  resolve momentos depois), ou o observador da pasta parou após falhas repetidas. Confira a página
  Entradas; um **Rescan** ingere o conteúdo da pasta assim que o problema subjacente for corrigido.

**O que conferir quando você vê uma divergência:**

1. **A correção pretendia substituir algo já assinado?** A primeira assinatura cobre o conteúdo
   substituído, e ela é válida; se um consumidor a jusante não pode agir sobre ela, essa é uma decisão
   de negócio a ser tomada explicitamente. Note que o segundo artefato é nomeado a partir do nome do
   arquivo de entrada, logo tem nome idêntico ao primeiro: se você ainda não coletou o primeiro de
   `output/`, o segundo job falha na promoção com
   `Output already exists at … resolve manually before re-queueing`. Mova ou colete o primeiro, e então
   repita o job.
2. **O produtor está reenviando rotineiramente?** Uma contagem que acompanha a taxa de jobs retidos
   significa que arquivos estão sendo reexportados durante janelas de aprovação, e cada um custa uma
   assinatura duplicada e uma segunda passagem pela etapa. A correção é do lado do produtor — grave cada
   remessa com um nome único.
3. **O arquivo estava apenas ilegível, ou preso?** Um produtor mantendo seu próprio arquivo aberto para
   escrita é retentado algumas vezes e então reportado como divergência (`unreadable: …`). O mesmo vale
   para um arquivo sobre o qual outro processo tomou uma posse exclusiva (`held by another lease: …`).
   Nos dois casos nada é forçado. Uma **posse** que nunca é liberada geralmente significa que uma
   segunda instância do Bulk Signer está monitorando a mesma pasta — uma configuração a corrigir, e não
   um produtor a aguardar.

A janela que isso fecha é mais ampla nos fluxos que colocam um humano no circuito. Um job local comum
faz stage e apaga com segundos de diferença; um job em `AwaitingApproval` sem `ExpiresAfter` espera
indefinidamente.

### As duas posses sobre um arquivo de entrada

O Bulk Signer toma posse exclusiva de um arquivo na sua pasta de entrada **duas vezes, brevemente, e
nunca no intervalo**:

1. **Enquanto coloca o arquivo em stage.** Tomada quando o pipeline se compromete a copiar, liberada tão
   logo a cópia termina. Sob ela, nada pode escrever no arquivo entre a leitura que o copia e a leitura
   do identificador que depois o identificará.
2. **Enquanto apaga o arquivo.** Uma posse separada, para que em um compartilhamento a comparação e a
   exclusão sejam um único ato.

**Nada segura seu arquivo enquanto um job espera por um humano.** Um job retido em `AwaitingApproval` ou
`AwaitingSigner` mantém posse exclusiva da sua própria cópia em stage em `processing/`, por todo o tempo
que a espera durar — mas não do arquivo na sua pasta de entrada, porque um quórum pode levar dias e o
seu ERP escreve naquela pasta.

**Uma posse nunca é quebrada e um arquivo nunca é apagado à força.** Se outra coisa detém seu arquivo de
entrada quando o Bulk Signer quer colocá-lo em stage, o job **falha** com uma mensagem nomeando o
arquivo. Se outra coisa o detém no momento da exclusão, a exclusão é postergada, retentada, e então
reportada como divergência.

:::info Quanto vale uma posse depende de onde a pasta está
Em uma pasta de entrada no **Azure Files** a posse é um lease real do lado do serviço: ela nega escritas
e exclusões a todo outro cliente daquele compartilhamento, inclusive a outra instância do Bulk Signer.
Em uma pasta de entrada **local** ela é a contabilidade do próprio Bulk Signer e não exclui nada fora
deste processo — um sistema de arquivos não consegue expressar "negue escritas a todos, mas admita minha
própria exclusão". O que protege uma entrada local é a comparação, e não a posse, e **a comparação é
igualmente forte nos dois casos**.
:::

## O que muda no dia a dia em um compartilhamento

`Storage:Provider = AzureFiles`, ou uma única pasta de entrada que o nomeie, muda quatro coisas. Pausa,
cancelamento, retry, rescan, o botão de download, a máquina de estados do job, a etapa de aprovação, a
criptografia e o que um aprovador vê se comportam identicamente — esta funcionalidade move bytes e nada
mais.

**1. A entrada é por temporizador, então não é mais quase instantânea.** Uma pasta local é orientada a
eventos: o sistema operacional reporta um arquivo novo em milissegundos. O Azure Files não publica
notificações de mudança, então uma pasta remota é **enumerada em seu intervalo de sondagem**. O pior
caso, do fechamento de um arquivo pelo produtor até um job aparecer em `Queued`, é o intervalo de
sondagem (30 s por padrão) mais a janela de estabilidade mais uma ida e volta — **cerca de meio minuto
nos padrões**, e até um intervalo inteiro em um tique ruim.

- É por pasta, então uma pasta de folha de pagamento pode consultar a cada 10 s enquanto uma pasta de
  arquivo morto consulta a cada 5 minutos.
- O piso é 5 s, e a troca é dinheiro: todo tique é uma transação de listagem, tenha chegado algo ou não.
  Uma pasta consultada a cada 5 s custa seis vezes o que a mesma pasta custa a cada 30 s, ociosa ou não.
- Dois caminhos **não** são por temporizador e continuam imediatos: `POST /api/files` e
  `POST /api/rescan`. Se alguém precisa de um arquivo assinado *agora*, faça rescan naquela pasta em vez
  de baixar o intervalo para sempre.

Não leia um primeiro job lento como uma pasta quebrada. Leia a página Entradas: uma pasta que está
`Running` sem erro e com uma varredura recente está fazendo exatamente isso.

**2. Uma pasta quieta e uma inalcançável parecem idênticas do lado do compartilhamento, então leia as
superfícies.** Uma pasta que não pode ser listada, não pode ser aberta, ou cuja credencial foi recusada
aparece na página Entradas, em `GET /api/folders` (`status`, `lastError`) e em `GET /api/ready` — ela
nunca é reportada como uma pasta que simplesmente não tem nada novo. **A que vale alarmar é a
`/api/ready`**: uma pasta degradada pode, de outro modo, ficar despercebida por todo o tempo em que
ninguém abrir o dashboard, e arquivos de pagamento se acumulando sem assinatura é um telefonema, não uma
notificação.

**3. Inspecionar arquivos exige um cliente de armazenamento, não um shell.** `error/<jobid>/`,
`processing/<jobid>/` e `output/` estão no compartilhamento, então onde quer que esta documentação diga
"olhe o arquivo em `error/`", ela quer dizer o Azure Storage Explorer, o
`az storage file download`, ou uma montagem na sua própria estação de trabalho. A cópia em stage de um
job ativo carrega um lease infinito, então ela recusa escritas e exclusões de tudo, inclusive do seu
próprio ferramental. `logs/` e o banco SQLite **não** estão no compartilhamento e nunca podem estar.

**4. O compartilhamento é marcado, e a marca é lida no boot.** Veja a próxima seção.

## Quando outra instância parece ser dona do compartilhamento de trabalho

**Esta seção se aplica apenas quando `Storage:Provider = AzureFiles`.** Uma árvore de trabalho local não
é armazenamento compartilhado — duas instâncias apontadas para o `data/` de um mesmo host são a mesma
instância duas vezes. Implantações locais não têm marcador, nem linha, nem aviso.

:::note Esta seção inteira descreve o modo cluster **desligado**
Com `Cluster:Enabled = true` o marcador significa outra coisa: o compartilhamento é reivindicado por *o
cluster* em vez de por uma instância, as irmãs o dividem deliberadamente, e a linha
`work share owner` lê `this cluster (one marker, shared between instances)`. O que o marcador guarda sob
a chave é a única catástrofe abaixo que banco de dados nenhum consegue enxergar — duas bases operacionais
sobre um compartilhamento — e uma instância cuja base não corresponde ao marcador **se recusa a
iniciar**. Veja
[Alta disponibilidade](high-availability.md#o-gate-do-compartilhamento-de-trabalho-é-mais-estreito-que-a-catástrofe-que-lhe-dá-nome).
:::

Um compartilhamento de trabalho é armazenamento compartilhado, o que convida à suposição de que dois
hosts agora podem servir uma implantação. **Fora do modo cluster, não podem** — e mover a base
operacional para o SQL Server não muda isso por si só, porque nenhum dos bloqueios está na base:

- a **flag de pausa do pipeline é uma linha única** lida a cada iteração de consulta por *o* worker,
  então dois workers leem a mesma linha e ambos agem sobre ela;
- os **observadores são por instância e orientados a eventos**, então ambos veem um arquivo chegar e
  ambos o enfileiram, com o perdedor registrando uma falha de enfileiramento contra aquela pasta;
- **nada registra qual instância é dona de um job**, então um boot varre linhas em que uma irmã ainda
  está trabalhando.

O modo cluster é a resposta suportada para cada um desses três, e é uma adesão deliberada em vez de algo
inferido do provider de armazenamento — veja [Azure App Service (modo cluster)](azure.md).

**Como a marca funciona.** A instância toma um lease exclusivo e sem expiração sobre o
`bulksigner-instance.json`, um pequeno arquivo ao lado de `processing/`, `output/` e `error/`. Ele
registra o nome do host, o id do processo e o momento da reivindicação. Um desligamento gracioso
devolve o lease; o arquivo permanece como o registro de quem rodou por último.

**O que acontece quando o marcador já está detido.** A inicialização nunca é bloqueada. Em vez disso:

1. uma entrada `Critical` aparece no log nomeando o **host e o id de processo** do detentor anterior;
2. a mesma linha é impressa na saída padrão, e a linha `work share owner` do banner lê
   `CONTENDED at startup by …`;
3. a página Sistema a exibe acima dos caminhos de armazenamento;
4. o `/api/ready` retorna **503** com uma verificação `work-share-owner` vermelha;
5. o lease é quebrado, tomado, e o boot segue em frente.

**Por que um aviso e não uma recusa.** Um lease vive no serviço de armazenamento, e não no processo que o
tomou — então uma queda, um `docker kill`, uma falta de energia ou um OOM deixam o marcador detido por um
processo que não existe mais. Recusar-se a iniciar transformaria cada um desses em uma recuperação manual
no meio da noite. Este produto não consegue distinguir um detentor morto de uma irmã viva, então ele lhe
entrega os dois fatos que conseguem, e continua assinando.

**O que fazer quando você vê isso.** Pergunte se o host e o processo nomeados ainda estão rodando.

- **É este host, e aquele processo se foi.** Sua instância anterior não desligou graciosamente. Nada
  está errado agora.
- **É um host diferente, ou aquele processo está vivo.** Você tem duas instâncias em um compartilhamento
  de trabalho. Pare uma delas, e então decida qual banco de dados é o autoritativo.

:::note A linha de readiness não limpa por si só, e isso é deliberado
O marcador é reivindicado uma vez no boot; nada o relê, porque não há resposta mais fresca a se obter —
esta instância o detém agora. Então uma parada não graciosa custa um ciclo vermelho de readiness, e o
boot após uma parada graciosa fica verde de novo.
:::

**O que de fato diverge.** Duas instâncias assinando de um compartilhamento de trabalho **não** assinam
o mesmo arquivo duas vezes: o lease por arquivo sobre um arquivo de entrada é recusado em vez de
quebrado. O que diverge é tudo o que está na base de cada instância:

- **Estado de aprovação** — um job retido na etapa existe na base de uma instância somente. A outra não
  sabe nada sobre ele, sobre seus aprovadores, nem sobre o quórum que ele aguarda. Esse é o que vale
  agir rapidamente.
- **Estado de pausa** — o `POST /api/pipeline/pause` retém uma instância. A outra continua assinando.
- **Estatísticas e histórico de jobs** — cada instância reporta os seus, então nenhum dos dashboards é o
  quadro completo.

**Se o marcador não puder ser reivindicado de forma alguma** — um compartilhamento inalcançável, uma
credencial rotacionada — a linha lê `not claimed cleanly at startup: …` e a readiness fica vermelha por
esse motivo em vez do outro. Se outra instância o detém passa a ser simplesmente desconhecido, e
desconhecido não é reportado como a resposta tranquilizadora.

## Quais instâncias estão vivas (somente no modo cluster)

Com `Cluster:Enabled = true`, cada instância mantém uma linha na base operacional — quem ela é, quando
bateu por último, e qual versão da aplicação está rodando — e toda instância consegue ler a de todas as
outras. **Sistema → Instâncias** no dashboard é aquela tabela.

| Coluna | O que ela lhe diz |
|---|---|
| Instância | A identidade derivada. No App Service ela vem do `WEBSITE_INSTANCE_ID` da plataforma, então é estável por toda a vida da instância e distinta entre irmãs. |
| Estado | **Live** enquanto o último heartbeat está dentro de `Cluster:StaleAfterSeconds`; **Stale** passado ele. Stale é uma presunção, não uma morte confirmada — veja [a aposta](high-availability.md#uma-morte-presumida-é-uma-aposta). |
| Versão | A versão da aplicação que aquela instância está rodando. Dois valores diferentes aqui em qualquer momento que não seja uma janela de implantação é a condição de versões mistas, e ela é reportada como um Critical no boot da instância mais nova. |
| Última batida | Idade do heartbeat mais recente. A legenda sob a tabela nomeia a cadência (`Cluster:HeartbeatSeconds`, padrão 15) e o limiar de obsolescência (padrão 60) de fato em vigor. |

Uma linha é marcada como a instância que respondeu à sua requisição. Como o balanceador de carga escolhe
por requisição, recarregar a página move aquela marcação entre linhas — que é a confirmação mais barata
disponível de que o tráfego realmente está distribuído.

O `GET /api/folders` carrega um campo `instance` pelo mesmo motivo: um cliente de máquina que o consulta
precisa distinguir "a pasta mudou" de "uma instância diferente respondeu".

## Quando uma instância para de responder, uma sobrevivente assume seus jobs

Toda instância sobrevivente observa a tabela de heartbeat. Quando uma irmã fica obsoleta, uma
sobrevivente reivindica suas linhas em andamento e reconcilia cada uma **por onde ela havia chegado**, e
não repetindo-a:

| O job da instância morta estava… | O que a sobrevivente faz | Por quê |
|---|---|---|
| Reivindicado, mas não havia chegado à chamada de assinatura | **Reenfileirado** | Nada foi tentado, então nada está sendo repetido. |
| Além da chamada de assinatura | **Reprovado**, conservadoramente | Uma assinatura nunca é retentada sem um humano decidir isso. `Failed` é um desfecho terminal honesto, não "travado" — o [retry manual](#repetindo-jobs-que-falharam) do operador continua sendo a repetição. |
| `AwaitingSigner` (despachado ao Lacuna Signer) | **Reatribuído** à sobrevivente, que retoma sua consulta | O lado remoto detém o trabalho; apenas a consulta precisa de um novo dono. |

Cada assunção escreve um evento operacional `JobTakenOver` nomeando **ambas** as instâncias, de modo que
a trilha de auditoria registra quem perdeu o trabalho e quem o pegou.

:::warning A assunção fica atrás do gate de pausa
O `POST /api/pipeline/pause` retém toda instância, e a assunção não roda enquanto o pipeline está
pausado. Isso é deliberado: um operador pausando um cluster para investigar uma base que ficou lenta é
exatamente a pessoa que não pode ter toda instância declarando toda irmã morta.
:::

Duas linhas que nada jamais assumirá, ambas reportadas em vez de adotadas:

- **Um job sem dono nenhum**, deixado por uma build anterior à coluna de propriedade ou por uma execução
  com o modo desligado. O remédio é nomeado em toda superfície que encontra um desses — suba uma vez com
  `Cluster:Enabled = false`, para que a [recuperação na inicialização](#recuperação-na-inicialização)
  comum o varra, e então religue o modo.
- **Um job detido por uma instância nomeada que não tem linha de heartbeat.** Ausência de heartbeat não
  é evidência de morte, então isso é reportado uma vez e deixado em paz, em vez de lido como licença
  para reprovar trabalho vivo.

Ambos os casos, e por que adotá-los reintroduziria o defeito que a funcionalidade remove, estão em
[Alta disponibilidade](high-availability.md#linhas-que-ninguém-possui-não-são-reconciliadas-por-ninguém).

## Contenção entre instâncias não é uma falha

Toda instância monitora toda pasta de entrada, então a cada chegada elas correm. Esse é o desenho, e o
lado perdedor da corrida é classificado como um **desfecho esperado** em vez de um erro:

- O enfileiramento perdedor é recusado por um índice único parcial sobre os caminhos originais ativos e
  respondido como `AlreadyActive`. Cada arquivo vira exatamente um job.
- Um conflito de lease em um arquivo de entrada é registrado no nível de desfecho esperado, sob seu
  próprio id de evento, de modo que "uma irmã chegou primeiro" e "outra coisa nesta instância chegou"
  continuem sendo fatos diferentes.
- **Nenhum dos dois conta contra o orçamento de falhas consecutivas da pasta**, e um desfecho
  `AlreadyActive` zera aquele contador exatamente como um enfileiramento bem-sucedido faz. Um cluster
  movimentado, portanto, não consegue disparar o
  [disjuntor por pasta](#isolamento-de-falhas-do-observador-por-pasta) simplesmente por estar
  movimentado.

A reivindicação em lote também se degrada sob contenção — ela recai para reivindicar uma linha de cada
vez e registra a corrida perdida. É um custo pequeno e conhecido, e não uma falha.

## O pipeline de assinatura

```
input/file.pdf
      │  Observador (ou POST /api/files)
      ▼
   Queued ──▶ worker reivindica ──▶ move input → processing/ ──▶ Assina ──▶ Verifica
                                                                             │
                                            Encryption.Enabled?  ────────────┤
                                              sim → output/file.signed.pdf.enc
                                              não → output/file.signed.pdf
                                            em caso de falha → error/
```

O worker é de instância única por conjunto de pastas configurado e processa até
`Pipeline:MaxConcurrency` jobs em paralelo. O padrão `1` é sequencial; operadores optam por `N > 1` para
ganhar vazão (somente PFX — veja a ressalva sobre PKCS#11 / WindowsStore em
[Certificados](certificates.md)). O worker:

1. Consulta a fila a cada `Pipeline:PollIntervalSeconds` segundos, limitado pela concorrência
   configurada. Quando todos os slots estão ocupados, a consulta pausa até um slot liberar.
2. Verifica a flag de pausa. Quando pausado, o worker roda em vazio sem pegar trabalho; os jobs em
   andamento existentes drenam até a conclusão natural. A flag de pausa é observada a cada iteração de
   consulta e sobrevive a reinicializações.
3. Reivindica o próximo job `Queued` atomicamente (transição `Queued → Processing`). Se um escritor
   concorrente (um cancelamento, ou um worker par) modificou a linha primeiro, o worker pula para a
   próxima iteração.
4. Para cada job reivindicado, move a entrada para `processing/<jobid>/`, assina, verifica, opcionalmente
   criptografa, e então promove para `output/`. Cada job roda em isolamento, com sua própria pasta de
   processamento.
5. Em qualquer falha: move o conteúdo de `processing/<jobid>/` para `error/<jobid>/`, marca o job como
   `Failed`, e registra a mensagem de exceção no campo de erro do job e no histórico.
6. **A entrada original é removida de `input/` somente após verificação bem-sucedida.** A verificação
   acontece antes da exclusão, nunca o contrário.

**Drenagem na pausa.** Quando um operador pausa enquanto há jobs em andamento, o worker para de
reivindicar novos, mas os que já estão rodando vão até o fim. O card "Slots ocupados" do dashboard vai
diminuindo conforme eles drenam.

### Perfis LacunaSigner — worker de consulta separado

Quando um perfil usa `Method = LacunaSigner`, o worker apenas **despacha** o job ao Lacuna Signer
(upload + criação de documento) e imediatamente o transiciona para `AwaitingSigner` — o slot de
concorrência é liberado tão logo o despacho tem sucesso. Um worker de consulta separado percorre cada
linha `AwaitingSigner` em sua própria cadência (`Signer:PollIntervalSeconds`, padrão 30 s), baixa os
bytes quando o documento remoto é concluído, e roda a mesma cauda de verificar → opcionalmente
criptografar → promover. Veja [Integração com o Lacuna Signer](lacuna-signer.md).

## Pausar e retomar

```bash
# Retém o worker (idempotente — já pausado também retorna 200)
curl -X POST http://localhost:8080/api/pipeline/pause \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Manutenção trimestral"}'

# Retoma (também idempotente)
curl -X POST http://localhost:8080/api/pipeline/resume \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

# Inspeciona o estado atual
curl http://localhost:8080/api/pipeline/state \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Pausar / retomar são duráveis — a flag de pausa sobrevive a um reinício do serviço. Um worker pausado
ainda aceita uploads e capturas do observador (os jobs vão para `Queued`); eles apenas não avançam. Os
operadores veem "Pipeline: Pausado" na página Sistema do dashboard.

Quando uma pausa está em vigor:

- Jobs já em `Processing` / `Verifying` concluem normalmente. A pausa impede a **próxima** captura, não
  o trabalho em andamento.
- O gauge `bulksigner_pipeline_paused` vira `1`.
- Um evento de sistema é escrito com o `reason` opcional:
  `"Pipeline paused by operator. Reason: Manutenção trimestral."`. A mesma convenção se aplica à
  retomada.

## Cancelando jobs

```bash
curl -X POST http://localhost:8080/api/jobs/$JOB_ID/cancel \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Válido para `Queued` e `AwaitingSigner` (este último só existe para perfis LacunaSigner). O endpoint
retorna `409 { code: "job.not-queued" }` se o job já avançou além desses estados (por exemplo, um job
local que o worker pegou entre a decisão do operador e a requisição). Jobs locais em andamento são
sagrados — removê-los no meio da assinatura deixaria conteúdo órfão em `processing/` e uma saída não
verificada.

Depois do cancelamento:

- O job passa a `Canceled` (terminal).
- Uma entrada de histórico de auditoria é acrescentada: `"Operator canceled: <motivo>."` (ou
  `"Operator canceled."` se nenhum motivo foi fornecido).
- O arquivo permanece em `input/`. A memória de cancelamentos recentes do observador impede a
  ressurreição automática; reexecuções dirigidas pelo operador via Upload, Retry ou Rescan
  reenfileiram.

## Repetindo jobs que falharam

```bash
curl -X POST http://localhost:8080/api/jobs/$JOB_ID/retry \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Cria um novo job com um `Id` novo, os mesmos `FileName` / `OriginalPath` / `Format`,
`ParentJobId = (o job falho).Id`, e estado inicial `Queued`. O job falho permanece `Failed`; a cadeia é
reconstruível a partir do `ParentJobId`.

Retorna `404 { code: "job.not-found" }` para ids desconhecidos, `409 { code: "job.not-failed" }` para
jobs que não estão `Failed`, `409 { code: "job.input-missing" }` se o arquivo de entrada original não
está mais em disco.

A página de detalhe do job no dashboard expõe links de pai/filho, para que operadores possam percorrer
uma cadeia de repetições de volta até a falha raiz.

## Rescan

```bash
# Todas as pastas configuradas
curl -X POST http://localhost:8080/api/rescan \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

# Apenas uma pasta
curl -X POST "http://localhost:8080/api/rescan?folder=legal" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Reenfileira cada arquivo atualmente na(s) pasta(s) de entrada configurada(s) que ainda não seja um job
ativo. Útil após uma pausa longa ou após colocar arquivos manualmente. A resposta é um detalhamento por
pasta mais contagens agregadas. Cada arquivo reescaneado é marcado com o nome da pasta correspondente.

O rescan **de fato** reenfileira arquivos que foram recentemente cancelados (diferentemente do caminho
de captura automática do observador, que deixa arquivos cancelados em paz).

## Clear Jobs

Uma ação de manutenção que **apaga permanentemente registros de jobs finalizados** — as linhas de job e
suas linhas do tempo de histórico — para limpeza administrativa. Ela **não** toca em eventos
operacionais, no estado do pipeline, nos perfis de assinatura, na configuração, em arquivos assinados ou
processados, nem nos logs.

:::warning Mudou na 2.0.0 — somente registros finalizados
O Clear Jobs agora apaga somente jobs **terminais**. Um job `Queued`, retido ou em andamento sobrevive à
ação, e as duas superfícies reportam o que deixaram para trás ao lado do que removeram. Um script que
limpa a tabela e depois espera que ela esteja vazia precisa antes drenar ou cancelar os jobs não
finalizados.

Apagar a linha sob um job em execução era o risco de ação de operador mais afiado do produto — sob um
cluster seria o job em execução de uma *irmã* — então o estreitamento não está condicionado ao
`Cluster:Enabled` e se aplica a toda implantação.
:::

Pelo dashboard: **Sistema → Zona de perigo → Clear Jobs**. Um diálogo de confirmação protege a ação;
cancelar não apaga nada. Por REST:

```bash
curl -X DELETE http://localhost:8080/api/jobs \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
# → {"deleted": 1230, "skipped": 4, "message": "Cleared 1230 job record(s); skipped 4 unfinished."}
```

O que acontece ao confirmar:

- Cada linha de job **terminal** e seu histórico são apagados em uma transação (os links de pai de
  cadeias de repetição são dissolvidos primeiro, para que a chave estrangeira autorreferente não bloqueie
  a exclusão).
- Linhas não finalizadas são contadas e reportadas como `skipped` — no dashboard como uma linha na
  mensagem de resultado, na resposta REST como um campo próprio.
- Um evento operacional `JobsCleared` registra o ator (identidade por cookie ou por chave de API), o
  timestamp e ambas as contagens; o mesmo é emitido para o log estruturado. Em caso de falha a transação
  é desfeita, um erro é registrado, e o operador permanece na página.
- Um **marcador de reset** de escopo da implantação se move dentro da mesma transação, de modo que o
  [painel de desempenho](statistics.md#zerando-o-painel) conta apenas jobs concluídos depois dele. Nada
  é apagado para limpar o painel, e uma limpeza que falha o deixa exatamente como estava.

:::warning Não há como desfazer
Faça backup da base operacional primeiro, se o histórico de jobs tiver valor de auditoria —
`db/bulksigner.db` sob SQLite, ou o backup do regime do seu SGBD sob SQL Server. Veja
[Retenção](retention.md#disciplina-de-backup).
:::

## Isolamento de falhas do observador por pasta

Cada entrada de `Storage:Inputs[]` tem seu próprio observador com seu próprio orçamento de falhas
consecutivas de enfileiramento (padrão 10). Quando o orçamento estoura para uma pasta, aquele observador
se marca como `Stopped` e sai — **o processo continua rodando e os observadores das outras pastas não são
afetados**.

Um observador `Stopped` não revive automaticamente. O estado aparece em três lugares:

- O card daquela pasta na página Entradas do dashboard mostra um chip vermelho "stopped" e o texto do
  último erro.
- O `GET /api/folders` retorna `"status": "Stopped"` com `lastError` preenchido.
- O `GET /api/ready` retorna `503` com `input-folder:<nome>` falhando no array `checks`.

Para recuperar: corrija a causa subjacente (montagem, disco, permissões) e reinicie o serviço.

:::note
Uma pasta degradada é fácil de deixar passar se você não observa o `/api/ready` ou a página Entradas.
Configure um monitor externo que sonde o `/api/ready`, para que uma única montagem ruim não passe
despercebida.
:::

## Recuperação na inicialização

Uma varredura de recuperação roda depois das migrações e antes de o worker iniciar. Para cada job ainda
em `Processing` ou `Verifying` na inicialização (isto é, a execução anterior foi morta no meio do voo):

- O job é marcado como `Failed` com a mensagem
  `"Service restarted while job was in flight; marked as failed during recovery."`.
- O diretório `processing/<jobid>/` correspondente é movido para `error/<jobid>/`, de modo que o
  conteúdo em andamento seja preservado para fins forenses.
- O arquivo de entrada original (se ainda existir em `input/`) é deixado onde está — os operadores podem
  reexecutar via Rescan ou Upload.

**Linhas `AwaitingSigner` explicitamente NÃO são varridas.** Aqueles jobs estão retidos do lado remoto
do Lacuna Signer — o host local não tem como saber se o participante já assinou, e varrê-los para
`Failed` invalidaria trabalho que o host não executou. O worker de consulta retoma a consulta em seu
primeiro tique após o boot, exatamente de onde parou.

A varredura de recuperação é idempotente — um reinício limpo não encontra jobs em andamento e não faz
nada.

:::note Sob o modo cluster, um boot varre somente suas próprias linhas
Um job registra a instância que o reivindicou, e com `Cluster:Enabled = true` a recuperação é filtrada
para a identidade da própria instância — de outro modo um boot reprovaria trabalho que uma irmã viva
ainda está fazendo. As linhas interrompidas de uma irmã são tratadas pela
[assunção](#quando-uma-instância-para-de-responder-uma-sobrevivente-assume-seus-jobs), que segue o
heartbeat do dono em vez do boot.

A consequência é a única coisa a fazer na atualização: uma linha deixada em andamento por uma build mais
antiga não carrega **nenhum** dono, e nada sob a chave jamais a varrerá. Suba uma vez com
`Cluster:Enabled = false` antes do primeiro boot em cluster e esta varredura limpa todas elas.
:::

## O banner de resumo de prontidão

A cada inicialização, depois de o bootstrap se completar, o serviço imprime um painel resumindo o estado
mais crítico para decisão:

```
================================ Service ready ================================
host mode      = systemd
environment    = Production
https redirect = off (terminate TLS at reverse proxy)
content root   = /opt/bulksigner
storage root   = /var/lib/bulksigner
db             = /var/lib/bulksigner/db/bulksigner.db
pki license    = <impressão digital SHA-256 de 16 caracteres hex>
cert source    = Pkcs11 (module=/usr/lib/...)
signing policy = ADR-Básica (PAdES + CAdES + XAdES)
encryption     = enabled (BSENC v1, salt loaded)
poll interval  = 2s
pipeline       = running
================================================================================
```

Esta é a forma mais rápida de verificar se uma mudança de configuração teve efeito. Uma chave digitada
errado aparece como o valor padrão, em vez do valor que você pretendia.

Um segundo painel — **Signing profiles** — lista cada perfil resolvido (ou o perfil `default` legado
sintetizado). Perfis configurados com `Verify=false` ou `ValidateCertificate=false` emitem linhas `WARN`
adicionais (tanto na saída padrão quanto no arquivo de log), para que a postura de baixa confiança seja
capturada de forma durável.

### Execuções em console em primeiro plano: dashboard ao vivo

Em uma invocação em primeiro plano em um terminal interativo, o log em fluxo contínuo é substituído por
um painel ao vivo atualizado no lugar, mostrando o estado de pausa, o tamanho da fila, a contagem em
andamento + detalhamento por formato, os totais de concluídos/falhados/cancelados desde o boot, o
uptime, e o endereço de escuta. Implantações em host de serviço (Serviço do Windows, systemd, Docker)
não são afetadas. Veja
[Dashboard no console](dashboard.md#dashboard-no-console-somente-execuções-em-primeiro-plano).

## Resumo de observabilidade

| Superfície | O que você obtém |
|------------|------------------|
| `journalctl -u bulksigner` / Visualizador de Eventos / `docker compose logs` | Bootstrap, eventos de ciclo de vida, erros fatais, saída padrão |
| `/var/log/bulksigner/bulksigner-yyyyMMdd.log` (etc.) | O log estruturado durável; segredos mascarados |
| `GET /api/metrics` | Exposição Prometheus — veja [API REST](rest-api.md#métricas) |
| `GET /api/ready` | JSON de prontidão por sondagem (banco, pasta de entrada, licença) |
| Página Sistema do dashboard | Impressão digital da licença, origem do certificado, tamanho da fila, estado de pausa |
| Histórico de jobs (no banco de dados) | Uma linha por transição de estado, para cada job |

## Tarefas rotineiras do operador

| Tarefa | Onde |
|--------|------|
| Acompanhar a entrada ao vivo | Card "Status do pipeline" do dashboard ou `tail -f bulksigner-*.log` |
| Investigar uma falha | Detalhe do job no dashboard → linha do tempo → clique na mensagem de erro; ou `error/<jobid>/` em disco |
| Reexecutar um job que falhou | Botão `Retry` do dashboard ou `POST /api/jobs/{id}/retry` |
| Planejar uma indisponibilidade | `POST /api/pipeline/pause` com um `reason`; aguarde os jobs em andamento se esgotarem; então pare o serviço |
| Aplicar uma atualização | Faça backup de `db/bulksigner.db`, rode o script de instalação com o novo bundle, acompanhe o banner de bootstrap |

Veja [Diagnóstico de problemas](troubleshooting.md) para o catálogo de modos de falha.

---

**A seguir:** [Dashboard](dashboard.md) — a interface do operador.
**Anterior:** [Segurança](security.md).
