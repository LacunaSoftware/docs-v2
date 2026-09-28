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
        │         └─ rejeitado* / cancel do operador / orçamento expirado ▶ Canceled
        └─ quórum atingido ──▶ volta a Queued (reentra na fila comum)

   Failed ──retry do operador──▶ um NOVO job Queued (ParentJobId definido; o job falho segue Failed)

   * um arquivo rejeitado é devolvido a output/ como <nome>.reject<ext>; a cópia em stage de um
     job cancelado ou expirado vai para error/
```

Regras principais:

- **`AwaitingApproval` tem exatamente três transições**, e `Failed` deliberadamente não é uma delas.
  Nada segura um job retido — nenhum worker, nenhum slot, nenhum serviço remoto — então nada está em
  posição de reprová-lo. Ele é liberado de volta para `Queued`, cancelado, ou espera. Três coisas
  diferentes chegam naquela única aresta de cancelamento: a **rejeição** de um aprovador, um cancel de
  operador e — em um perfil que define `Approval.ExpiresAfter` — o esgotamento do orçamento de espera.
  Todas as três significam "este arquivo não será assinado, deliberadamente"; a trilha de auditoria é o
  que as distingue.
- **Uma rejeição é um veto, e ela devolve o arquivo.** Uma única rejeição interrompe o job, diga o que
  disser a aritmética do quórum. O job termina `Canceled`, o arquivo é devolvido a `output/` como
  `<nome>.reject<ext>` — `folha.rem` vira `folha.reject.rem`, criptografado como todo outro artefato
  quando o perfil criptografa — e o original é removido de `input/`. O arquivo devolvido **não está
  assinado**: qualquer coisa que leia `output/` como uma pasta de assinaturas precisa olhar o nome. Se
  esse nome já estiver ocupado em `output/`, nada é sobrescrito: a cópia em stage vai para
  `error/<jobid>/` e a entrada permanece em `input/`. O retry não se aplica — o arquivo é corrigido e
  enviado de novo. Veja [A rejeição é um veto](approvals.md#a-rejeição-é-um-veto).
- **A liberação reentra na fila comum** em vez de retomar no lugar, de modo que um job liberado passa
  pela mesma reivindicação e pelas mesmas etapas pré-assinatura que qualquer outro — inclusive a
  [guarda de obsolescência das datas de pagamento](cnab240.md#datas-de-pagamento-que-já-passaram), que é
  exatamente a verificação que uma demora humana sem prazo definido precisa que se refaça (a menos que o
  perfil desligue essa guarda com `CheckCnab240PaymentDates`, para um banco que processa um pagamento
  com data passada no próximo dia útil — veja [Arquivos de pagamento CNAB240](cnab240.md)). Ele retoma
  sobre a cópia com que ficou retido, e os bytes em stage são re-hasheados imediatamente antes de a
  assinatura existir; uma divergência reprova o job com `approval.content-changed`. Veja
  [Aprovações](approvals.md#o-que-é-aprovado).
- **Um job retido também pode expirar, se o perfil assim disser.** Com `Approval.ExpiresAfter`
  definido, um job retido além da janela é cancelado com o motivo `Approval window expired.`, sua cópia
  em stage é movida para `error/` e um evento operacional `ApprovalExpired` é registrado. A janela é de
  relógio de parede: **uma pausa não a estende**. Veja [O orçamento de espera](approvals.md#o-orçamento-de-espera).
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
- **`Failed` é terminal, e o seu arquivo espera da mesma forma.** Uma falha deixa a entrada onde estava,
  e desde a 2.11.0 o observador não a enfileira de novo por conta própria — nem no próximo tique de uma
  pasta por sondagem, nem na enumeração que uma inicialização do serviço executa — até que um operador a
  reexecute via Retry, Rescan ou Upload. (Antes da 2.11.0, uma pasta por sondagem — toda pasta do Azure
  Files, e uma local configurada para sondar — reoferecia um arquivo que falhou a cada tique, de modo que
  uma falha cuja causa persistia produzia um novo job `Failed` por tique; logo depois de um Clear Jobs,
  parecia que a limpeza não tinha limpado.) A decisão é tomada somente pelo status do job mais recente,
  então um arquivo corrigido deixado com o mesmo nome é capturado por essas mesmas ações do operador, e
  não pelo observador.
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
- Dois caminhos **não** são por temporizador e continuam imediatos: um upload (`POST /api/files`, ou
  **Upload files** na página Jobs) e `POST /api/rescan`. Se alguém precisa de um arquivo assinado *agora*, faça rescan naquela pasta em vez
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
4. o `/api/ready` retorna **503** com uma verificação `work-share-owner` vermelha, cujo detalhe em
   `/api/ready/details` é a mesma frase;
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
| Estado | **Live** enquanto o último heartbeat está dentro de `Cluster:StaleAfterSeconds`; **Stopped** quando o processo aposentou sua linha em um desligamento limpo — o rastro comum de uma reimplantação; **Stale** quando ficou em silêncio além do limiar sem avisar. Stale é uma presunção, não uma morte confirmada — veja [a aposta](high-availability.md#uma-morte-presumida-é-uma-aposta). |
| Versão | A versão da aplicação que aquela instância está rodando. Dois valores diferentes aqui em qualquer momento que não seja uma janela de implantação é a condição de versões mistas, e ela é reportada como um Critical no boot da instância mais nova. |
| Última batida | Idade do heartbeat mais recente. A legenda sob a tabela nomeia a cadência (`Cluster:HeartbeatSeconds`, padrão 15) e o limiar de obsolescência (padrão 60) de fato em vigor. |

Uma linha é marcada como a instância que respondeu à sua requisição. Como o balanceador de carga escolhe
por requisição, recarregar a página move aquela marcação entre linhas — que é a confirmação mais barata
disponível de que o tráfego realmente está distribuído. Uma linha cuja instância **deslocou** uma
predecessora viva nomeia essa predecessora, e quando, sob a identidade — veja a próxima seção.

O `GET /api/folders` carrega um campo `instance` pelo mesmo motivo: um cliente de máquina que o consulta
precisa distinguir "a pasta mudou" de "uma instância diferente respondeu".

### Quando um boot encontra a própria identidade ainda viva

:::warning Mudou na 2.5.0 — uma predecessora viva é deslocada, não recusada
Até a 2.4.x, uma instância subindo que encontrava a própria identidade ainda batendo se recusava a
iniciar (a 2.4.3 primeiro esperava por ela, e depois recusava). Desde a 2.5.0 o novo boot **desloca** a
detentora viva e segue em frente.
:::

É assim que uma reimplantação no lugar no App Service se parece: a plataforma inicia o novo container ao
lado do antigo, sob o mesmo id de instância, e mantém o antigo servindo — e batendo — até que o novo
passe na sua sondagem de aquecimento. Nem uma recusa nem uma espera conseguiriam atender isso, então:

- **O novo boot** toma a identidade de imediato e registra um `Warning` nomeando a encarnação deslocada,
  a sua build e a sua última batida. Não há inicialização que falha.
- **O processo deslocado se retira** na sua próxima batida: um `Critical` no log *dele*, um evento
  operacional `InstanceStoodDown`, uma linha `cluster-instance` vermelha no seu `/api/ready` — que
  **não** reprova a sondagem, já que um 503 faria a plataforma retirar o único container para o qual
  ainda está roteando — e um banner acima da tabela Instâncias na sua página Sistema. Ele não reivindica
  nenhum job novo, não executa assunção e não consulta o Lacuna Signer sobre nada; o que ele detém roda
  até a conclusão, e ele continua servindo a web até que a plataforma o pare.
- **Ele retoma por conta própria** se a linha da encarnação mais nova depois ficar parada ou obsoleta —
  uma recém-chegada que aposentou sua linha em uma parada graciosa, ou um segundo host desde então
  parado — com um `Warning`, um evento `InstanceResumed` e um `/api/ready` verde de novo. Ele nunca
  toma a identidade de volta de uma detentora que ainda está batendo.
- **O que a vida deslocada deixou por terminar** é deixado em paz pela
  [recuperação na inicialização](#recuperação-na-inicialização) do novo boot e assumido um
  `Cluster:StaleAfterSeconds` depois do deslocamento, sob a política comum de
  [assunção](#quando-uma-instância-para-de-responder-uma-sobrevivente-assume-seus-jobs).
- **Um boot cuja base não respondeu** se registra no seu primeiro heartbeat que alcança a base,
  deslocando exatamente como o boot teria feito.
- **Um desligamento limpo aposenta sua linha primeiro**, então um reinício após uma parada graciosa não
  desloca nada — e é por isso que *parar, trocar, iniciar* continua sendo a implantação mais limpa.

:::note No App Service, uma implantação que falha é desfeita reapontando a tag de imagem anterior
Se o novo container falha no aquecimento depois de deslocar o antigo, o App Service **não** volta para o
container antigo: ele para o **site inteiro** — inclusive o container que se retirou, antes que a linha
da sucessora pudesse ficar obsoleta — e continua reiniciando-o com a imagem nova. A retomada descrita
acima não consegue acontecer ali. Aponte o app de volta para a tag de imagem anterior
(`az webapp config container set`) e ele fica pronto de novo em cerca de dois minutos. Veja
[Atualizações param o mundo](high-availability.md#atualizações-param-o-mundo).
:::

**Dois hosts apresentando um mesmo nome, portanto, também não são recusados**: eles se revezam, de forma
ruidosa dos dois lados, e exatamente um reivindica trabalho a cada momento. Se você vir um deslocamento
quando ninguém está reimplantando, leia os dois logs e renomeie um dos hosts ou aponte-o para a sua
própria base. A única recusa de boot que resta é um registro que perdeu toda corrida de escrita pela sua
linha; ela nomeia a build e a última batida da vencedora. Apagar a linha enquanto uma detentora está
rodando remove o relato, e não a condição. Veja
[Diagnóstico de problemas](troubleshooting.md#modo-cluster).

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
6. **A entrada original é removida de `input/` somente após verificação bem-sucedida, e somente quando
   ainda é o arquivo que foi colocado em stage.** A verificação acontece antes da exclusão, nunca o
   contrário — e um arquivo que o pipeline não processou nunca é apagado. Veja
   [Quando um arquivo de entrada muda no meio de um job](#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job).

**Drenagem na pausa.** Quando um operador pausa enquanto há jobs em andamento, o worker para de
reivindicar novos, mas os que já estão rodando vão até o fim. O card "Slots ocupados" do dashboard vai
diminuindo conforme eles drenam.

**Três portas de entrada.** Um arquivo chega à fila por uma pasta monitorada, pelo `POST /api/files` ou
pelo botão **Upload files** da página Jobs, que envia cada arquivo pelo mesmo tratador da rota REST — o
mesmo limite de tamanho, a mesma sanitização do nome do arquivo e as mesmas verificações de perfil —, de
modo que os dois recusam um arquivo nos mesmos termos. O diálogo pede um perfil de assinatura habilitado
e termina com um relatório por arquivo, com um link para cada job que criou. `Upload:Enabled = false`
desliga **os dois** caminhos de upload de uma vez: o `POST /api/files` responde `409` com
`upload.disabled`, e a página Jobs não mostra o botão de upload. Pastas monitoradas, Rescan e Retry não
são afetados; a chave é lida no boot, então religá-la exige um reinício. Veja
[Configuração](configuration.md#upload).

### Perfis LacunaSigner — worker de consulta separado

Quando um perfil usa `Method = LacunaSigner`, o worker apenas **despacha** o job ao Lacuna Signer
(upload + criação de documento) e imediatamente o transiciona para `AwaitingSigner` — o slot de
concorrência é liberado tão logo o despacho tem sucesso. Um worker de consulta separado percorre cada
linha `AwaitingSigner` em sua própria cadência (`Signer:PollIntervalSeconds`, padrão 30 s), baixa os
bytes quando o documento remoto é concluído, e roda a mesma cauda de verificar → opcionalmente
criptografar → promover. Veja [Integração com o Lacuna Signer](lacuna-signer.md).

## Roteando uma pasta monitorada para um perfil de assinatura

:::warning Mudou na 2.2.0 — o perfil escolhe a sua pasta
Uma pasta monitorada é assinada sob **o perfil que a escolheu**, e um perfil escolhe a sua pasta pela
própria página no dashboard — uma pasta por perfil, um perfil por pasta. O `Storage:Inputs[].Profile`
passou a ser **entrada de semeadura**: ele é lido uma única vez, no primeiro boot contra uma tabela de
perfis vazia, e ignorado (e reportado como ignorado) em todo boot depois disso. Depois do primeiro boot,
o arquivo de configuração não consegue rotear uma pasta. Veja
[`Storage:Inputs[].Profile`](configuration.md#storageinputsprofile--roteamento-por-pasta).
:::

Nada mais sobre a pasta muda de lugar: seu nome, caminho, provider, credenciais e intervalo de sondagem
continuam em `Storage:Inputs[]`, validados no boot, e são o que a página Entradas lista. O que a página do
perfil decide é qual pasta alimenta qual perfil — qual certificado e qual regra de aprovação os arquivos
da pasta recebem.

### Pela página do perfil

1. Abra a página do perfil no dashboard (`/profiles/{name}`) e clique em **Edit behaviour**. O seletor
   **Input folder** oferece *nenhuma*, toda pasta que este host configurou e que nenhum outro perfil
   usa, e a pasta atual do próprio perfil.
2. Escolha a pasta e salve. O observador da pasta começa a monitorá-la em um ou dois intervalos de
   `Pipeline:PollIntervalSeconds`, em toda instância, sem reinício. Arquivos que já estão na pasta são
   capturados sem rescan.
3. Confira a página Entradas: o card da pasta agora carrega o chip do perfil, com um link de volta para
   ele.

Um perfil criado em `/profiles/_new` escolhe a sua pasta no mesmo formulário. O evento de auditoria
registra a mudança pelo nome da pasta, nunca pelo caminho — `InputFolder (none) → remessas` em uma
edição e `Input folder: remessas.` em uma criação.

**Duas recusas, ambas no salvamento.** Uma pasta que este host não configurou em `Storage:Inputs[]`, e
uma pasta que outro perfil já usa — a segunda nomeia o dono; limpe a pasta lá primeiro, ou escolha outra.
Dois salvamentos escolhendo a mesma pasta no mesmo instante deixam exatamente um dono, e o perdedor é
informado de quem a levou. Nenhuma das recusas é feita no boot: um vínculo armazenado não é revalidado,
então uma pasta renomeada ou removida da configuração depois de um perfil tê-la escolhido é um **relato
de degradação** — no banner de inicialização, como uma linha `profile-input-folder:<profile>` no
`/api/ready` que não reprova o veredito, e como um alerta em `/profiles` e na própria página do perfil —
enquanto o perfil continua atendendo uploads.

### O que significa *não atribuída*

Uma pasta que nenhum perfil escolheu está **não atribuída**, e nada a está monitorando. Ela aparece
como:

- um chip cinza na página Entradas com o texto `unassigned — no profile has chosen this folder`;
- `status: "Unassigned"`, sem `profileName`, no `GET /api/folders`;
- uma linha `input-folder:<nome>` **verde** no `/api/ready` — nada está quebrado, e uma linha vermelha
  diria a um orquestrador para retirar uma instância por causa de uma pasta que ninguém pediu para ela
  monitorar;
- um `Warning` no log, no boot e sempre que um perfil libera a pasta.

Arquivos deixados em uma pasta não atribuída **esperam**: não são ignorados, nem movidos, nem recusados,
e são capturados no momento em que um perfil escolhe a pasta. Uma pasta não atribuída **não** recai no
`default` — isso colocaria os seus arquivos sob uma regra que ninguém escolheu. O `default` é o recurso
para um upload que não nomeia perfil, e para uma pasta que não nomeia nenhum na única leitura da
semeadura, nunca para uma pasta deixada sem escolha depois.

Uma pasta fica não atribuída de uma de três formas: a semeadura a deixou assim no primeiro boot (uma
pasta nomeando um perfil que a seção não declara, ou uma segunda pasta nomeando um perfil que uma pasta
anterior já levou), um perfil a liberou pela sua página, ou a tabela de perfis foi semeada por uma versão
anterior à 2.2.0 e nunca foi vinculada. O remédio é o mesmo em todos os casos: escolha a pasta na página
de um perfil.

### Movendo uma pasta entre perfis

Limpe a pasta no perfil que a tem, **depois** escolha-a no perfil que deve tê-la — nessa ordem, porque o
segundo salvamento é recusado enquanto o primeiro perfil ainda é dono dela. No intervalo, a pasta fica
brevemente não atribuída; um arquivo que chegar nessa janela é capturado assim que o segundo salvamento
tiver efeito, então nada se perde e nada é assinado duas vezes. Jobs já enfileirados a partir da pasta
mantêm o perfil sob o qual foram enfileirados, de modo que o nome de uma pasta em um job sempre se lê como
exatamente um certificado e uma regra de aprovação.

Duas pastas que devem seguir uma mesma regra são dois perfis com as mesmas configurações.

### Desabilitando um perfil que usa uma pasta

Desligar **accept new work** é recusado enquanto o formulário ainda carrega uma pasta, nomeando-a — a
alternativa é uma pasta cujos arquivos param silenciosamente de ser assinados. Limpe a pasta no mesmo
salvamento e a desabilitação é aceita; a pasta fica não atribuída, diz isso na página Entradas, e espera
por outro perfil.

### O que um rescan e um retry fazem com o vínculo

- Um **rescan** pula uma pasta não atribuída inteira e diz isso — veja [Rescan](#rescan).
- Um **retry mantém o perfil que o job que falhou registrou**, seja qual for o perfil que a pasta
  alimenta hoje — veja [Repetindo jobs que falharam](#repetindo-jobs-que-falharam). Um job que deve ser
  assinado sob o novo perfil da pasta é cancelado e enviado de novo.

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
- Um evento operacional é escrito com o `reason` opcional:
  `"Pipeline paused by operator. Reason: Manutenção trimestral."`. A mesma convenção se aplica à
  retomada. Ambos podem ser lidos na página `/events` do dashboard.

Uma pausa e uma retomada emitidas no mesmo instante não se sobrescrevem silenciosamente: exatamente uma
das duas escritas vence, e a perdedora recebe `409` com o código `pipeline.race-lost`, sem ter registrado
nada. Releia o `GET /api/pipeline/state` e repita se a sua intenção continuar valendo.

:::note Implantações com SQL Server antes da 2.4.3
A base operacional em SQL Server era criada sem a linha de estado do pipeline onde a flag de pausa vive,
então nessas versões o `POST /api/pipeline/pause` respondia `pipeline.state-missing` e o pipeline rodava
mesmo assim. Desde a 2.4.3, uma migração aplicada no boot acrescenta a linha, e pausar e retomar
funcionam nos dois providers.
:::

## Cancelando jobs

```bash
curl -X POST http://localhost:8080/api/jobs/$JOB_ID/cancel \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Válido para `Queued`, `AwaitingSigner` e `AwaitingApproval`. Os dois estados de espera podem ser
cancelados justamente porque nada os segura — um job `AwaitingSigner` espera por um serviço remoto, um
job `AwaitingApproval` por uma pessoa, e qualquer uma das esperas pode acabar sendo uma que você não quer
mais concluir. O endpoint retorna `409 { code: "job.not-queued" }` se o job já avançou além desses
estados (por exemplo, um job local que o worker pegou entre a decisão do operador e a requisição). Jobs
locais em andamento são sagrados — removê-los no meio da assinatura deixaria conteúdo órfão em
`processing/` e uma saída não verificada.

- **`AwaitingSigner`:** a transição local para `Canceled` é confirmada primeiro, e então o documento
  remoto no Lacuna Signer é cancelado em melhor esforço; uma falha remota é registrada e **não** desfaz o
  cancelamento local. Veja [Semântica do cancelamento](lacuna-signer.md#semântica-do-cancelamento).
- **`AwaitingApproval`:** depois que o cancelamento é confirmado, a cópia em stage do job é movida de
  `processing/<jobid>/` para `error/<jobid>/`, também em melhor esforço. O snapshot de aprovação do job é
  **mantido** — ele registra a regra que o job aguardava, que é o que uma auditoria pergunta depois.

No dashboard, o **Cancel** da página do job pergunta antes: um diálogo de confirmação nomeia o arquivo,
diz o que o cancelamento faz a partir do status atual do job, e lembra que um job cancelado não tem
Retry — o arquivo precisa de um rescan ou de um upload para ser assinado de novo. *Keep job* não cancela
nada. A rota REST não mudou e não pergunta.

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

**O retry é assinado sob o perfil que o job que falhou registrou**, e não sob o perfil que a sua pasta
alimenta hoje: um retry é "assine do jeito que ia ser assinado", e seguir o vínculo atual da pasta
assinaria sob uma regra que o job nunca carregou. Um arquivo que deve ir para o novo perfil da pasta é
cancelado e enviado de novo. (Um job de antes da existência de perfis de assinatura não registrou nome e
é repetido sob o `default`.)

Retorna `404 { code: "job.not-found" }` para ids desconhecidos, `409 { code: "job.not-failed" }` para
jobs que não estão `Failed`, `409 { code: "job.input-missing" }` se o arquivo de entrada original não
está mais em disco, e duas recusas que são decisões, e não falhas — o botão Retry é ocultado na página do
job para ambas:

- `409 { code: "job.rejected-not-retriable" }` para um job que terminou `Failed` com
  `approval.rejected`, porque a rejeição de um aprovador chegou depois de um worker tê-lo reivindicado. O
  arquivo rejeitado já foi devolvido a `output/` com o seu nome `.reject` e a sua entrada removida, então
  um retry só poderia falhar. Corrija o arquivo e envie-o de novo. (Uma rejeição comum termina
  `Canceled`, ao qual o Retry também não se aplica.)
- `409 { code: "file.already-processed" }` para um job recusado porque outro job já carrega o nome do
  seu arquivo. Um retry é isento dessa regra, então repetir essa falha específica assinaria justamente o
  arquivo que a regra recusou. Em vez disso, exclua o job que detém o nome — veja
  [Nomes de arquivo já processados](#nomes-de-arquivo-já-processados).

A página de detalhe do job no dashboard expõe links de pai/filho, para que operadores possam percorrer
uma cadeia de repetições de volta até a falha raiz.

## Nomes de arquivo já processados

:::warning Mudou na 2.13.0 — um nome que já foi assinado é recusado
Com `Pipeline:RejectAlreadyProcessedFileNames` ligado — o padrão —, um arquivo que chega com um nome que
um job `Completed` ou ainda ativo já carrega **nunca é assinado**. Versões anteriores o assinavam de
novo. Defina a chave como `false` para manter o comportamento antigo. Veja
[Configuração](configuration.md#pipeline).
:::

A comparação vale para o host inteiro e ignora maiúsculas e minúsculas, porque toda pasta monitorada,
todo perfil e todo upload gravam na mesma pasta `output/`.

- **Pasta monitorada ou rescan:** o arquivo vira um job que já nasce `Failed` com
  `file.already-processed`, nomeando o job que detém o nome, e os seus bytes são movidos para a pasta
  `error/<jobid>/` do novo job, para que o arquivo não seja oferecido de novo. O console avisa arquivo a
  arquivo, e um evento operacional `FileAlreadyProcessed` é escrito. Um rescan conta esses casos em um
  número separado, `alreadyProcessed`. Se o arquivo não puder ser movido (outra coisa o detém), nada é
  registrado e ele permanece na pasta; um rescan o conta em `errors`.
- **Upload:** `409` com `file.already-processed`; nada é armazenado.
- **O que não reserva um nome:** um job `Failed` ou `Canceled`. Deixar o arquivo de novo na pasta depois
  de uma falha é a forma de tentar outra vez.

**Para aceitar um nome de novo, exclua o job que o detém** em `/jobs` — veja
[Excluindo um job](#excluindo-um-job). Depois que ele se vai, um arquivo reenviado com esse nome é
capturado pelo observador sem rescan. Nada impõe a regra no banco de dados: duas instâncias em um cluster
podem aceitar o mesmo nome no mesmo instante, e é a recusa em sobrescrever um arquivo que já está em
`output/` que barra a segunda.

## Excluindo um job

Para remover **um** job — por exemplo, o que detém um nome de arquivo que você quer que volte a ser
aceito —, exclua-o em `/jobs`: uma linha por vez, atrás de um diálogo de confirmação com um motivo
opcional. Não há rota REST para isso.

- **Um job que um worker está executando** (`Processing` / `Verifying`) não pode ser excluído. Um job que
  não terminou (`Queued`, `AwaitingApproval`, `AwaitingSigner`) é cancelado primeiro, exatamente como um
  cancelamento faria — inclusive o cancelamento em melhor esforço do documento remoto no Lacuna Signer —
  e é registrado sob o status que tinha (`'<name>', Queued, canceled to delete it`).
- **O que vai embora:** o job, seu histórico, tempos, detalhe CNAB240, snapshot de aprovação e aprovações
  registradas; suas pastas `processing/` e `error/<jobid>/`; o arquivo de saída que **ele registrou** ter
  gravado em `output/` — nunca um arquivo que apenas compartilha o seu nome, e nada para um job concluído
  antes da 2.13.0, que não registrava nenhum; e a sua entrada, **somente** se o job a colocou em stage e
  ela não mudou desde então.
- **O que é mantido:** uma entrada que o job nunca colocou em stage, ou uma reescrita desde então — exceto
  a cópia do próprio upload, que o produto nomeou e colocou na pasta de destino, e que é removida; uma
  entrada que outro job não terminado (um retry deste, por exemplo) ainda nomeia; e uma que não pôde ser
  comparada porque outro processo a detém ou ela não pode ser lida. A próxima varredura trata cada entrada
  mantida como uma nova chegada, e o aviso em `/jobs` nomeia o que foi mantido.
- **O que a trilha de auditoria mantém:** todo evento operacional existente, inclusive os que mencionam o
  job excluído, mais um — um evento `JobDeleted`: `Job <id> ('<name>', <status>) deleted by <actor>.`,
  seguido do que foi removido e do que foi mantido, um resumo de eventuais aprovações (decisão, nome do
  aprovador, endereço mascarado, horário) e `Reason: <reason>.` quando um motivo foi informado.

**Como isso difere do Clear Jobs**, deliberadamente: o Clear Jobs é uma ordem para esvaziar o sistema,
então ele abandona jobs em andamento, apaga entradas sem compará-las e apaga os eventos operacionais.
Excluir um job não faz nada disso.

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

O rescan **de fato** reenfileira arquivos que foram recentemente cancelados ou cujo último job falhou
(diferentemente do caminho de captura automática do observador, que deixa ambos em paz).

- **Uma pasta cujo perfil de assinatura está desabilitado contribui para `ignored`, e não para
  `errors`.** Desabilitar um perfil é um pedido para pular os seus arquivos, então o acúmulo de um perfil
  aposentado não aparece como um número vermelho. A linha de log que explica o número é escrita uma vez
  por pasta, nomeando o perfil. Reabilite o perfil e faça o rescan de novo, ou escolha a pasta na página
  de outro perfil.
- **Uma pasta que nenhum perfil escolheu é pulada inteira, e a resposta diz isso.** A sua linha volta
  com `unassigned: true` e todas as contagens em zero, `totals.unassigned` conta essas pastas, o aviso
  da página Entradas termina com `… N folder(s) unassigned and skipped`, e o log carrega uma linha
  `Information` por pasta. Não é um erro nem `ignored` — ninguém pediu para assinar a partir daquela
  pasta ainda. Escolha a pasta na página de um perfil; o observador então a lista sem outro rescan. Veja
  [Roteando uma pasta monitorada para um perfil de assinatura](#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura).
- **Um arquivo cujo nome um job concluído ou ativo já carrega** é contado em `alreadyProcessed` — veja
  [Nomes de arquivo já processados](#nomes-de-arquivo-já-processados).
- **Uma pasta que não pode ser lida não interrompe as outras.** A sua linha volta com `errors: 1` e
  `scanned: 0`, toda outra pasta é reescaneada normalmente, e a chamada continua sendo um `200`. O log em
  arquivo carrega a exceção subjacente.

## Clear Jobs

Uma ação de manutenção que **apaga permanentemente todo registro de job e todo arquivo que esses jobs
deixaram para trás** — as linhas de job em qualquer status, seu histórico, suas evidências de aprovação e
o detalhe das linhas CNAB240, e, na árvore de armazenamento, o arquivo de entrada de cada job, sua pasta
`processing/<jobid>/`, sua pasta `error/<jobid>/` e sua saída assinada — **junto com todo evento
operacional registrado antes do início da limpeza**. O que resta da trilha de eventos é o evento
`JobsCleared` que registra a limpeza, mais o que um worker confirmar enquanto ela roda. Ela **não** toca
no estado do pipeline, nos perfis de assinatura, na configuração, nos logs, nem nas raízes das pastas.

:::warning Mudou na 2.9.0 e na 2.10.0 — todo job, seus arquivos e os eventos operacionais
Da 2.0.0 à 2.8.x, o Clear Jobs apagava somente registros de jobs *finalizados* e reportava os não
finalizados que pulava. Desde a 2.9.0 ele leva **todo** job, qualquer que seja o status — um arquivo
`Queued`, um job retido à espera de um aprovador, um job que um worker está assinando naquele momento e,
sob `Cluster:Enabled`, o job de uma instância irmã — e apaga os arquivos que esses jobs deixaram para
trás; a contagem `skipped` saiu da resposta. Desde a 2.10.0 ele também apaga os eventos operacionais
registrados antes da limpeza. Um operador que limpa o sistema pela zona de perigo quer um sistema vazio,
e o diálogo de confirmação diz exatamente o que vai embora.
:::

**Uma vez confirmada, ela roda até o fim, quer você fique na página ou não.** Os arquivos são varridos
antes das linhas, então em um compartilhamento de trabalho remoto uma limpeza com muitos jobs acumulados
leva algum tempo, e navegar para `/jobs` para ver a tabela esvaziar não tem problema. Só a parada do host
a interrompe; se isso acontecer, a transação é desfeita com todas as linhas ainda presentes, os arquivos
já varridos continuam apagados, e um aviso no log diz isso — execute a limpeza de novo. (Antes da
2.11.1, sair da página Sistema cancelava a limpeza silenciosamente, o que parecia uma limpeza que não
tinha funcionado.) O aviso de resultado é a única parte que precisa de você na página; o evento
`JobsCleared` e a linha de log são o registro de qualquer forma.

Pelo dashboard: **Sistema → Zona de perigo → Clear Jobs**. Um diálogo de confirmação — irreversível; todo
job, inclusive os não finalizados; todo arquivo que esses jobs deixaram; todo evento operacional
registrado até então, restando o registro da limpeza — protege a ação; cancelar não apaga nada. Por REST:

```bash
curl -X DELETE http://localhost:8080/api/jobs \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
# → {"deleted": 1234, "filesDeleted": 2460, "foldersDeleted": 7, "eventsDeleted": 318, "itemsFailed": 0, "message": "Cleared 1234 job record(s), 2460 file(s), 7 folder(s) and 318 operational event(s)."}
```

O que acontece ao confirmar:

- **Os arquivos de cada job são apagados primeiro** — entrada, `processing/<jobid>/`, `error/<jobid>/` e
  a saída assinada no local que o job registrou (mais a devolução `.reject` de um arquivo rejeitado) —
  em qualquer armazenamento que os guarde. É em melhor esforço item a item: um arquivo sobre o qual outra
  coisa detém um lease, ou uma pasta que o armazenamento recusa, é deixado no lugar, nomeado em uma linha
  de aviso no log e contado em `itemsFailed` (um aviso no dashboard), e o registro do seu job vai embora
  mesmo assim. Um armazenamento inalcançável faz a limpeza falhar antes de qualquer linha ser apagada.
- **Depois, cada linha de job e seu histórico são apagados** em uma transação (os links de pai de
  cadeias de repetição são dissolvidos primeiro, para que a chave estrangeira autorreferente não bloqueie
  a exclusão).
- **Todo evento operacional registrado antes do início da limpeza é apagado** na mesma transação, e então
  um evento `JobsCleared` é escrito — a primeira linha da trilha dali em diante — registrando o ator
  (identidade por cookie ou por chave de API), o timestamp e as contagens de jobs, arquivos, pastas e
  eventos apagados, seguidas de `N file(s) or folder(s) could not be deleted.` quando algo foi recusado.
  O mesmo é emitido para o log estruturado. Em caso de falha no banco de dados a transação é desfeita, um
  erro é registrado, e o operador permanece na página — os arquivos já varridos não são restaurados,
  então execute a limpeza de novo.
- Um **marcador de reset** de escopo da implantação se move dentro da mesma transação, de modo que o
  [painel de desempenho](statistics.md#zerando-o-painel) volta a zero em toda instância. Nada é apagado
  *para* limpar o painel, e uma limpeza que falha o deixa exatamente como estava.

**Ressalvas.**

- **Ela não espera por nada.** Um job que o worker está assinando naquele momento tem sua cópia em stage
  apagada debaixo dele; o worker reprova o job, não encontra linha onde escrever a falha, e registra as
  duas coisas. Se um lote está no meio do caminho e importa, **pause o pipeline e deixe-o drenar
  antes**. Sob `Cluster:Enabled` o mesmo vale para o job de toda irmã.
- **As entradas são apagadas sem a comparação** com a impressão digital do stage que todo outro caminho
  faz — o Clear Jobs é uma ordem para esvaziar o sistema, não um job terminando.
- **Nada é forçado do lado do armazenamento.** Confira o log depois de qualquer limpeza que reporte
  `itemsFailed` diferente de zero, e remova esses itens à mão — tipicamente um produtor ainda gravando em
  uma pasta de entrada, ou uma posse que uma irmã deixou sobre uma cópia em stage. O gêmeo com sufixo de
  timestamp de uma pasta `error/` (criado quando um mesmo id de job foi realocado duas vezes) não é
  derivável da linha e também é deixado.
- **Um job enfileirado enquanto a limpeza está rodando** não estava no retrato da varredura: ele mantém o
  seu arquivo de entrada e perde só a linha, e a próxima varredura de pasta — inicialização do serviço ou
  Rescan — ingere o arquivo de novo.
- O card *último desligamento* da página Sistema fica vazio depois de uma limpeza até o próximo
  desligamento — um fato sobre o sistema limpo, e não um defeito.

Para remover um único job em vez de todos, veja [Excluindo um job](#excluindo-um-job).

:::warning Não há como desfazer
Colete antes de `output/` tudo de que ainda precisar — os arquivos assinados vão embora com os jobs.
Faça backup da base operacional se o histórico de jobs ou a trilha de eventos tiver valor de auditoria —
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

Depois que um boot [deslocou](#quando-um-boot-encontra-a-própria-identidade-ainda-viva) uma predecessora
viva, a varredura deixa em paz **toda** vida anterior da identidade — o processo deslocado ainda pode
estar terminando seus jobs — e a assunção os alcança um `Cluster:StaleAfterSeconds` depois do
deslocamento.
:::

## O banner de resumo de prontidão

A cada inicialização, depois de o bootstrap se completar, o serviço imprime um painel resumindo o estado
mais crítico para decisão:

```
================================ Service ready ================================
host mode         = systemd
environment       = Production
https redirect    = off (terminate TLS at reverse proxy)
content root      = /opt/bulksigner
storage root      = /var/lib/bulksigner
operational store = SQLite (/var/lib/bulksigner/db/bulksigner.db)
pki license       = <impressão digital SHA-256 de 16 caracteres hex>
cert source       = Pkcs11 (module=/usr/lib/...)
signing policy    = ADR-Básica (PAdES + CAdES + XAdES)
encryption        = enabled (BSENC v1, salt loaded)
poll interval     = 2s
pipeline          = running
version           = 2.15.0+9a3f2c1e4b…
================================================================================
```

A linha `version` carrega a versão **completa**, com os metadados de build — a build que uma implantação
roda é o que um pedido de suporte acaba perguntando. O banner com a marca, impresso acima dele no topo de
toda inicialização, carrega a forma curta (`v2.15.0`).

Esta é a forma mais rápida de verificar se uma mudança de configuração teve efeito. Uma chave digitada
errado aparece como o valor padrão, em vez do valor que você pretendia.

Um segundo painel — **Signing profiles** — lista cada perfil da base operacional (semeados a partir de
`Signing:Profiles[]`, ou do bloco de certificado legado como um `default` derivado, no primeiro boot
contra uma tabela de perfis vazia), uma linha por perfil. Perfis configurados com `Verify=false` ou
`ValidateCertificate=false` emitem linhas `WARN` adicionais (tanto na saída padrão quanto no arquivo de
log), para que a postura de baixa confiança seja capturada de forma durável. Três outros estados
aparecem nesse painel, e nenhum deles impede o boot:

- **`DEGRADED · `** — o certificado do perfil não pôde ser aberto. Uma linha `FAIL` ao lado nomeia o
  perfil e o motivo, e a mesma linha chega ao log como `Critical`. O host inicia e o restante da
  implantação continua assinando; jobs roteados para esse perfil falham com `profile.degraded`, e o
  `/api/ready` carrega uma linha `signing-profile:<nome>` reportando `ok: false` sem reprovar a
  resposta. Corrija o certificado e reinicie. Um perfil cujos **segredos armazenados** não puderam ser
  descriptografados é degradado da mesma forma, e o seu motivo nomeia `Signing:ProfileSecretsKey`; o
  remédio aí é informar de novo o material de certificado desse perfil, e depois reiniciar.
- **`KEYLESS · `** — o conjunto de signatários do perfil é `Approvers`, então quem assina são os
  aprovadores e não há chave. A linha diz `cert=none (approvers sign)`, nada é aberto para ele na
  inicialização, e o `/api/ready` carrega uma linha `signing-profile-keyless:<nome>` reportando
  `ok: true`. Ele não está degradado e não precisa de remédio.
- **Avisos sobre pastas** — no primeiro boot, uma linha por pasta que a semeadura não conseguiu vincular a
  um perfil (ela fica não atribuída); em todo boot posterior que ainda encontre chaves
  `Storage:Inputs[].Profile`, uma linha dizendo que elas são ignoradas; e em qualquer boot, uma linha por
  perfil vinculado a uma pasta que este host não configurou. Os três são resolvidos pela página do
  perfil — veja
  [Roteando uma pasta monitorada para um perfil de assinatura](#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura).

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
| `GET /api/ready` | Veredito de prontidão por sondagem (base operacional, pastas de entrada, licença, …): o nome e o `ok` de cada verificação, sem detalhe |
| `GET /api/ready/details` | As mesmas sondagens com o detalhe de cada verificação; exige a chave de API ou uma sessão de operador |
| Página `/events` do dashboard / `GET /api/events` | O log de eventos operacionais — pausa e retomada, edições de perfil, decisões de aprovação, assunções, exclusões de job, Clear Jobs, desligamento do serviço — do mais novo para o mais antigo, filtrável por tipo, intervalo de datas e texto |
| Página Sistema do dashboard | Impressão digital da licença, origem do certificado, tamanho da fila, estado de pausa, último desligamento, e um card **Recent events** com os dez mais novos |
| Histórico de jobs (no banco de dados) | Uma linha por transição de estado, para cada job |

## Tarefas rotineiras do operador

| Tarefa | Onde |
|--------|------|
| Acompanhar a entrada ao vivo | Card "Status do pipeline" do dashboard ou `tail -f bulksigner-*.log` |
| Investigar uma falha | Detalhe do job no dashboard → linha do tempo → clique na mensagem de erro; ou `error/<jobid>/` em disco |
| Reexecutar um job que falhou | Botão `Retry` do dashboard ou `POST /api/jobs/{id}/retry` — sob o perfil que o job registrou, e não o atual da pasta |
| Rotear uma pasta monitorada para um perfil de assinatura, ou movê-la | Página do perfil → **Edit behaviour** → **Input folder**; nunca um arquivo de configuração. Veja [Roteando uma pasta monitorada para um perfil de assinatura](#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura) |
| Descobrir por que os arquivos de uma pasta não andam | Página Entradas: um chip cinza `unassigned — no profile has chosen this folder` significa exatamente isso — escolha a pasta na página de um perfil; um chip vermelho `stopped` é [uma falha do observador](#isolamento-de-falhas-do-observador-por-pasta) |
| Aceitar um nome de arquivo de novo | Exclua o job que o detém em `/jobs`; veja [Excluindo um job](#excluindo-um-job) |
| Descobrir quem pausou o pipeline, alterou um perfil, decidiu uma aprovação ou limpou os jobs | `/events` no dashboard, ou `GET /api/events` |
| Planejar uma indisponibilidade | `POST /api/pipeline/pause` com um `reason`; aguarde os jobs em andamento se esgotarem; então pare o serviço |
| Aplicar uma atualização | Faça backup da base operacional (`db/bulksigner.db` sob SQLite, o backup do seu próprio banco sob SQL Server), rode o script de instalação com o novo bundle, acompanhe o banner de bootstrap |
| Apagar todo job e seus arquivos | Sistema no dashboard → Zona de perigo → **Clear Jobs** (ou `DELETE /api/jobs`); veja [Clear Jobs](#clear-jobs) — irreversível, e os jobs não finalizados e os eventos operacionais vão junto |

Veja [Diagnóstico de problemas](troubleshooting.md) para o catálogo de modos de falha.

---

**A seguir:** [Dashboard](dashboard.md) — a interface do operador.
**Anterior:** [Segurança](security.md).
