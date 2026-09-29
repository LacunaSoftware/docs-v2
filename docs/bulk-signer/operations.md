---
sidebar_label: "Operação"
sidebar_position: 6
---

# Operação

Operação do dia a dia do Lacuna Bulk Signer: como iniciar, parar, reiniciar, observar e pausar o
pipeline de assinatura, e como entender o que ele faz.

## Comandos de ciclo de vida por alvo

| Alvo | Iniciar | Parar | Reiniciar | Status |
|------|---------|-------|-----------|--------|
| Linux (systemd) | `sudo systemctl start bulksigner` | `sudo systemctl stop bulksigner` | `sudo systemctl restart bulksigner` | `systemctl status bulksigner` |
| Windows | `Start-Service LacunaBulkSigner` | `Stop-Service LacunaBulkSigner` | `Restart-Service LacunaBulkSigner` | `Get-Service LacunaBulkSigner` |
| Docker | `docker compose up -d` | `docker compose stop` | `docker compose restart` | `docker compose ps` |
| Console | execute o executável publicado | `Ctrl+C` | execute de novo | `/api/health` |

A unit do systemd usa `Type=notify` — o `systemctl status bulksigner` informa `active (running)` apenas
**depois** que todo o bootstrap (carregamento da licença + migrações + recuperação do pipeline) for
concluído com sucesso. O mesmo vale no Windows: o serviço só é marcado como "Em execução" depois que o
banner de resumo de prontidão é impresso.

## Onde ficam os logs

| Alvo | Caminho |
|------|---------|
| Linux | `/var/log/bulksigner/bulksigner-yyyyMMdd.log` |
| Windows | `C:\ProgramData\Lacuna\BulkSigner\logs\bulksigner-yyyyMMdd.log` |
| Docker | `/var/log/bulksigner/` dentro do container — montado por bind em `deploy/docker/logs/` no host |
| Console | `data/logs/bulksigner-yyyyMMdd.log` (relativo ao diretório de trabalho) |

Os logs são rotacionados diariamente, com 50 MB por arquivo (configurável) e 14 arquivos mantidos por
padrão. Cada linha é texto puro, com propriedades estruturadas no final:

```
2026-05-26T15:42:11.1234567+00:00 [INF] Worker started job 9b62…  {JobId: "9b62…", Format: "Pades"}
```

Esse formato funciona bem com `tail -f` para os operadores e pode ser interpretado estruturalmente por
ferramentas forenses.

Os eventos no nível do serviço vão para:

| Alvo | Onde |
|------|------|
| Linux | `journalctl -u bulksigner` (ciclo de vida + saída padrão) |
| Windows | Visualizador de Eventos → Logs do Windows → Aplicativo (somente ciclo de vida do serviço — os logs da aplicação ficam no destino de arquivo) |
| Docker | `docker compose logs -f bulksigner` |
| Console | O terminal |

Tanto a saída em arquivo quanto a do console passam pelo pipeline de mascaramento de segredos. Veja
[Segurança](security.md#mascaramento-de-logs--duas-camadas).

## A máquina de estados do job

São oito estados: um desfecho terminal "bom" (`Completed`) e dois desfechos terminais "ruins" (`Failed`,
`Canceled`). Dois dos oito são **esperas, e ambas são opcionais**: só passam por `AwaitingSigner` os jobs
cujo perfil usa `Method = LacunaSigner` (veja
[Integração com o Lacuna Signer](lacuna-signer.md)), e só passam por `AwaitingApproval` os jobs cujo
perfil tem um [bloco `Approval`](approvals.md).

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
        │         └─ rejeitado* / cancel do operador / prazo expirado ────▶ Canceled
        └─ quórum atingido ──▶ volta a Queued (reentra na fila comum)

   Failed ──retry do operador──▶ um NOVO job Queued (ParentJobId definido; o job falho segue Failed)

   * um arquivo rejeitado é devolvido a output/ como <nome>.reject<ext>; a cópia preparada de um
     job cancelado ou expirado vai para error/
```

Regras principais:

- **`AwaitingApproval` tem exatamente três transições**, e `Failed` deliberadamente não é uma delas.
  Nenhum recurso fica preso a um job retido — nenhum worker, nenhum slot, nenhum serviço remoto —, então
  nada está em posição de fazê-lo falhar. Ele é liberado de volta para `Queued`, é cancelado ou continua
  esperando. Três situações diferentes levam a essa mesma transição de cancelamento: a **rejeição** de um
  aprovador, o cancelamento pelo operador e — em um perfil que define `Approval.ExpiresAfter` — o fim do
  prazo de espera. As três significam "este arquivo não será assinado, deliberadamente"; é a trilha de
  auditoria que as distingue.
- **Uma rejeição é um veto, e ela devolve o arquivo.** Uma única rejeição interrompe o job, seja qual
  for a conta do quórum. O job termina `Canceled`, o arquivo é devolvido a `output/` como
  `<nome>.reject<ext>` — `folha.rem` vira `folha.reject.rem`, criptografado como qualquer outro artefato
  quando o perfil criptografa — e o original é removido de `input/`. O arquivo devolvido **não está
  assinado**: qualquer processo que leia `output/` como uma pasta de arquivos assinados precisa olhar o
  nome. Se esse nome já estiver ocupado em `output/`, nada é sobrescrito: a cópia preparada vai para
  `error/<jobid>/` e a entrada permanece em `input/`. A nova tentativa não se aplica — o arquivo é
  corrigido e enviado de novo. Veja [A rejeição é um veto](approvals.md#a-rejeição-é-um-veto).
- **A liberação volta para a fila comum** em vez de retomar o job de onde parou, de modo que um job
  liberado passa pela mesma reivindicação e pelas mesmas etapas anteriores à assinatura que qualquer
  outro — inclusive a
  [verificação de datas de pagamento vencidas](cnab240.md#datas-de-pagamento-que-já-passaram), que é
  exatamente a verificação que precisa ser refeita depois de uma espera humana sem prazo definido (a
  menos que o perfil desligue essa verificação com `CheckCnab240PaymentDates`, para um banco que processa
  um pagamento com data passada no próximo dia útil — veja [Arquivos de pagamento CNAB240](cnab240.md)).
  O job é retomado sobre a mesma cópia com que ficou retido, e o hash dos bytes da cópia preparada é recalculado
  imediatamente antes de a assinatura ser gerada; uma divergência faz o job falhar com
  `approval.content-changed`. Veja [Aprovações](approvals.md#o-que-é-aprovado).
- **Um job retido também pode expirar, se o perfil assim definir.** Com `Approval.ExpiresAfter`
  definido, um job retido além da janela é cancelado com o motivo `Approval window expired.`, sua cópia
  preparada é movida para `error/` e um evento operacional `ApprovalExpired` é registrado. A janela é
  contada em tempo de relógio: **uma pausa não a estende**. Veja
  [O prazo de espera](approvals.md#o-prazo-de-espera).
- **O cancelamento só é válido a partir de `Queued`, `AwaitingSigner` ou `AwaitingApproval`.** Jobs
  locais em andamento (`Processing`, `Verifying`) não podem ser cancelados — eles rodam até concluir ou
  falhar naturalmente. O endpoint de cancelamento retorna `409` com `code = "job.not-queued"` para um job
  local em andamento. Em perfis LacunaSigner, cancelar um job `AwaitingSigner` também faz uma chamada de
  cancelamento remoto, em melhor esforço, *depois* que a transição local para `Canceled` é confirmada —
  uma falha remota **não** desfaz o cancelamento local. Veja
  [Semântica do cancelamento](lacuna-signer.md#semântica-do-cancelamento).
- **`Canceled` é terminal.** Os arquivos de jobs cancelados permanecem em `input/`; o observador respeita
  os cancelamentos recentes e não os reenfileira automaticamente. As ações do operador (envio de
  arquivos, nova tentativa, nova varredura) reenfileiram.
- **`Failed` é terminal, e o arquivo espera da mesma forma.** Uma falha deixa a entrada onde estava, e
  desde a 2.11.0 o observador não a enfileira de novo por conta própria — nem no próximo tique de uma
  pasta com polling, nem na enumeração feita na inicialização do serviço — até que um operador a
  reexecute por nova tentativa, nova varredura ou envio. (Antes da 2.11.0, uma pasta com polling — toda
  pasta do Azure Files e uma pasta local configurada para polling — oferecia de novo, a cada tique, um
  arquivo que tinha falhado, de modo que uma falha cuja causa persistia produzia um novo job `Failed` por
  tique; logo depois de um **Limpar Jobs**, parecia que a limpeza não tinha funcionado.) A decisão é
  tomada apenas pelo status do job mais recente; por isso, um arquivo corrigido deixado com o mesmo nome
  é capturado por essas mesmas ações do operador, e não pelo observador.
- **`Failed → Queued` não é uma transição — é um novo job.** A nova tentativa cria um job novo com
  `ParentJobId = (o job falho).Id`, copiando a entrada original. O job que falhou permanece
  `Failed` para sempre, para fins de auditoria.

## Quando um arquivo de entrada muda no meio de um job

Um produtor às vezes reenvia um arquivo com o mesmo nome enquanto o Bulk Signer ainda está trabalhando
no anterior — um valor corrigido, um lote reexportado, uma nova tentativa do ERP. Quando isso acontece,
**a correção não é ingerida**: o observador vê que um job ativo já detém aquele caminho e recusa o
enfileiramento duplicado — a mesma regra que impede um arquivo de ser enfileirado duas vezes.

O que o pipeline faz nesse caso é se recusar a destruir a correção. Antes de apagar a entrada original,
o worker compara o arquivo com o que foi registrado enquanto ele era copiado para `processing/` —
sempre o tamanho e o SHA-256, e também a entity tag do serviço de armazenamento quando o arquivo está em
um compartilhamento. Se coincidirem, a entrada é apagada normalmente. Se não, **o arquivo é deixado
exatamente onde está** e a divergência é registrada em três lugares:

- um evento operacional `InputDiverged`, com o código `job.input-diverged`;
- uma entrada no histórico do próprio job, visível em `/jobs/{id}`, com o mesmo código;
- o contador `bulksigner_inputs_diverged_total{profile}`.

:::note Uma divergência não é uma falha de assinatura
A assinatura é válida, o artefato está em `output/` e o job é concluído normalmente — o que foi
assinado é o arquivo que foi copiado para processamento e, quando há etapa de aprovação, aprovado. Nada no job
precisa ser corrigido.
:::

**O arquivo reescrito é então devolvido à pasta monitorada e assinado como um job próprio.** O evento
de mudança do observador disparou *durante* a execução do job e foi corretamente descartado, e nenhum
outro evento chegará para um arquivo que simplesmente continua parado ali — por isso o pipeline devolve
o caminho explicitamente, **depois** que o job atinge um status terminal. O arquivo volta pela rota
*comum* de candidatos do observador, então o detector de estabilidade, as listas de ignorados da pasta e
o perfil dela se aplicam exatamente como a qualquer outra chegada.

Dois casos ainda exigem sua intervenção. A devolução é descartada, com um aviso no console, quando:

- **O job não veio de uma pasta monitorada** — um upload via REST não tem um observador responsável pelo
  caminho. Envie o arquivo de novo se ele deve ser assinado.
- **Nenhum observador está rodando para aquela pasta** — ou o processo ainda está subindo (o que se
  resolve instantes depois), ou o observador da pasta parou após falhas repetidas. Confira a página
  Pastas de entrada; uma nova varredura ingere o conteúdo da pasta assim que o problema de origem for
  corrigido.

**O que verificar quando você encontra uma divergência:**

1. **A correção deveria substituir algo já assinado?** A primeira assinatura cobre o conteúdo
   substituído, e ela é válida; se um sistema a jusante não deve agir com base nela, essa é uma decisão
   de negócio a ser tomada explicitamente. Observe que o segundo artefato recebe o nome a partir do nome
   do arquivo de entrada e, portanto, tem nome idêntico ao primeiro: se você ainda não retirou o
   primeiro de `output/`, o segundo job falha na promoção com
   `Output already exists at … resolve manually before re-queueing`. Mova ou retire o primeiro e então
   faça uma nova tentativa do job.
2. **O produtor reenvia arquivos rotineiramente?** Uma contagem que acompanha a taxa de jobs retidos
   indica que arquivos estão sendo reexportados durante janelas de aprovação, e cada um custa uma
   assinatura duplicada e uma segunda passagem pela etapa de aprovação. A correção é do lado do
   produtor — grave cada remessa com um nome único.
3. **O arquivo estava apenas ilegível ou bloqueado?** Um arquivo que o próprio produtor mantém aberto
   para escrita é tentado novamente algumas vezes e então informado como divergência (`unreadable: …`).
   O mesmo vale para um arquivo sobre o qual outro processo obteve um bloqueio exclusivo
   (`held by another lease: …`). Nos dois casos nada é forçado. Um **bloqueio** que nunca é liberado
   geralmente significa que uma segunda instância do Bulk Signer está monitorando a mesma pasta — uma
   configuração a corrigir, e não um produtor por quem esperar.

A janela que isso fecha é maior nos fluxos que colocam uma pessoa no circuito. Um job local comum faz o
stage e apaga a entrada com segundos de diferença; um job em `AwaitingApproval` sem `ExpiresAfter`
espera indefinidamente.

### Os dois bloqueios de um arquivo de entrada

O Bulk Signer obtém um bloqueio exclusivo sobre um arquivo da sua pasta de entrada **duas vezes, por
pouco tempo, e nunca no intervalo entre elas**:

1. **Enquanto copia o arquivo para processamento.** Obtido quando o pipeline se compromete a copiar e liberado
   assim que a cópia termina. Enquanto ele vale, nada pode escrever no arquivo entre a leitura que o
   copia e a leitura do identificador que depois servirá para reconhecê-lo.
2. **Enquanto apaga o arquivo.** Um bloqueio separado, para que, em um compartilhamento, a comparação e
   a exclusão sejam uma única operação.

**Nada bloqueia o seu arquivo enquanto um job espera por uma pessoa.** Um job retido em
`AwaitingApproval` ou `AwaitingSigner` mantém um bloqueio exclusivo sobre a própria cópia preparada em
`processing/`, por todo o tempo que a espera durar — mas não sobre o arquivo na sua pasta de entrada,
porque um quórum pode levar dias e o seu ERP grava nessa pasta.

**Um bloqueio nunca é quebrado e um arquivo nunca é apagado à força.** Se outro processo detém o seu
arquivo de entrada quando o Bulk Signer quer preparar a cópia, o job **falha** com uma mensagem que
cita o arquivo. Se outro processo o detém no momento da exclusão, a exclusão é adiada, tentada de novo
e então informada como divergência.

:::info O valor de um bloqueio depende de onde a pasta está
Em uma pasta de entrada no **Azure Files**, o bloqueio é um lease real do lado do serviço: ele impede
escritas e exclusões por qualquer outro cliente daquele compartilhamento, inclusive outra instância do
Bulk Signer. Em uma pasta de entrada **local**, ele é um controle interno do próprio Bulk Signer e não
impede nada fora deste processo — um sistema de arquivos não consegue expressar "negue escritas a todos,
mas permita a minha própria exclusão". O que protege uma entrada local é a comparação, e não o bloqueio,
e **a comparação é igualmente forte nos dois casos**.
:::

## O que muda no dia a dia em um compartilhamento

`Storage:Provider = AzureFiles`, ou uma única pasta de entrada que o indique, muda quatro coisas. Pausa,
cancelamento, nova tentativa, nova varredura, o botão de download, a máquina de estados do job, a etapa
de aprovação, a criptografia e o que um aprovador vê se comportam de forma idêntica — esta
funcionalidade move bytes e nada mais.

**1. A entrada depende de um temporizador, então deixa de ser quase instantânea.** Uma pasta local é
orientada a eventos: o sistema operacional informa um arquivo novo em milissegundos. O Azure Files não
publica notificações de mudança, então uma pasta remota é **enumerada a cada intervalo de polling**. O
pior caso, do momento em que o produtor fecha um arquivo até um job aparecer em `Queued`, é o intervalo
de polling (30 s por padrão) mais a janela de estabilidade mais uma ida e volta — **cerca de meio minuto
com os valores padrão**, e até um intervalo inteiro em um tique desfavorável.

- O intervalo é por pasta, então uma pasta de folha de pagamento pode fazer polling a cada 10 s enquanto
  uma pasta de arquivo morto faz a cada 5 minutos.
- O mínimo é 5 s, e o preço é em dinheiro: todo tique é uma transação de listagem, tenha chegado algo ou
  não. Uma pasta com polling a cada 5 s custa seis vezes o que a mesma pasta custa a cada 30 s, ociosa
  ou não.
- Dois caminhos **não** dependem do temporizador e continuam imediatos: um upload (`POST /api/files`,
  ou **Enviar arquivos** na página Jobs) e `POST /api/rescan`. Se alguém precisa de um arquivo assinado
  *agora*, faça uma nova varredura daquela pasta em vez de reduzir o intervalo para sempre.

Não interprete um primeiro job lento como uma pasta com defeito. Consulte a página Pastas de entrada:
uma pasta que está `Running`, sem erro e com uma varredura recente está funcionando exatamente assim.

**2. Uma pasta sem movimento e uma pasta inacessível parecem idênticas vistas do compartilhamento,
então consulte os indicadores.** Uma pasta que não pode ser listada, não pode ser aberta ou cuja
credencial foi recusada aparece na página Pastas de entrada, em `GET /api/folders` (`status`,
`lastError`) e em `GET /api/ready` — ela nunca é informada como uma pasta que simplesmente não tem nada
novo. **O indicador que merece alerta é o `/api/ready`**: sem ele, uma pasta degradada pode passar
despercebida por todo o tempo em que ninguém abrir o dashboard, e arquivos de pagamento se acumulando
sem assinatura pedem um telefonema, e não uma simples notificação.

**3. Inspecionar arquivos exige um cliente de armazenamento, não um shell.** `error/<jobid>/`,
`processing/<jobid>/` e `output/` ficam no compartilhamento; então, sempre que esta documentação disser
"olhe o arquivo em `error/`", entenda o Azure Storage Explorer, o `az storage file download` ou uma
montagem na sua própria estação de trabalho. A cópia preparada de um job ativo tem um lease infinito,
então ela recusa escritas e exclusões vindas de qualquer lugar, inclusive das suas próprias ferramentas.
`logs/` e o banco SQLite **não** ficam no compartilhamento e nunca podem ficar.

**4. O compartilhamento é marcado, e a marca é lida no boot.** Veja a próxima seção.

## Quando outra instância parece ser dona do compartilhamento de trabalho

**Esta seção se aplica apenas quando `Storage:Provider = AzureFiles`.** Uma árvore de trabalho local não
é armazenamento compartilhado — duas instâncias apontadas para o `data/` de um mesmo host são a mesma
instância duas vezes. Implantações locais não têm marcador, nem linha no banner, nem aviso.

:::note Esta seção inteira descreve o modo cluster **desligado**
Com `Cluster:Enabled = true`, o marcador significa outra coisa: o compartilhamento é reivindicado pelo
*cluster*, e não por uma instância, as irmãs o compartilham deliberadamente, e a linha
`work share owner` mostra `this cluster (one marker, shared between instances)`. Com a chave ligada, o
que o marcador protege é a única catástrofe descrita abaixo que banco de dados nenhum consegue
enxergar — dois bancos de dados operacionais sobre um mesmo compartilhamento —, e uma instância cujo banco não
corresponde ao marcador **se recusa a iniciar**. Veja
[Alta disponibilidade](high-availability.md#a-verificação-do-compartilhamento-de-trabalho-cobre-menos-do-que-a-catástrofe-que-motivou-sua-criação).
:::

Um compartilhamento de trabalho é armazenamento compartilhado, o que leva a supor que dois hosts agora
podem atender a uma mesma implantação. **Fora do modo cluster, não podem** — e mover o banco
operacional para o SQL Server não muda isso por si só, porque nenhum dos impedimentos está no banco:

- a **flag de pausa do pipeline é uma linha única**, lida a cada iteração de polling pelo worker (que
  se supõe único), então dois workers leem a mesma linha e ambos agem com base nela;
- os **observadores são por instância e orientados a eventos**, então os dois veem um arquivo chegar e
  os dois o enfileiram, e o perdedor registra uma falha de enfileiramento naquela pasta;
- **nada registra qual instância é dona de um job**, então um boot varre linhas em que uma irmã ainda
  está trabalhando.

O modo cluster é a resposta suportada para esses três pontos, e ele precisa ser ativado deliberadamente,
em vez de ser deduzido do provider de armazenamento — veja [Azure App Service (modo cluster)](azure.md).

**Como a marca funciona.** A instância obtém um lease exclusivo e sem expiração sobre o
`bulksigner-instance.json`, um pequeno arquivo ao lado de `processing/`, `output/` e `error/`. Ele
registra o nome do host, o id do processo e o momento da reivindicação. Um desligamento normal libera o
lease; o arquivo permanece como registro de quem rodou por último.

**O que acontece quando o marcador já está detido por outro.** A inicialização nunca é bloqueada. Em vez
disso:

1. uma entrada `Critical` aparece no log com o **host e o id de processo** do detentor anterior;
2. a mesma linha é impressa na saída padrão, e a linha `work share owner` do banner mostra
   `CONTENDED at startup by …`;
3. a página Sistema exibe o aviso acima dos caminhos de armazenamento;
4. o `/api/ready` retorna **503** com uma verificação `work-share-owner` vermelha, cujo detalhe em
   `/api/ready/details` é a mesma frase;
5. o lease é quebrado e obtido, e o boot segue em frente.

**Por que um aviso, e não uma recusa.** Um lease fica no serviço de armazenamento, e não no processo que
o obteve — então uma queda, um `docker kill`, uma falta de energia ou um OOM deixam o marcador detido por
um processo que não existe mais. Recusar-se a iniciar transformaria cada um desses casos em uma
recuperação manual no meio da noite. Este produto não consegue distinguir um detentor morto de uma irmã
viva; por isso, ele entrega a você os dois fatos que permitem essa distinção e continua assinando.

**O que fazer quando você vê o aviso.** Verifique se o host e o processo indicados ainda estão rodando.

- **É este host, e aquele processo não existe mais.** A instância anterior não foi desligada
  normalmente. Não há nada de errado agora.
- **É outro host, ou aquele processo está vivo.** Você tem duas instâncias em um mesmo compartilhamento
  de trabalho. Pare uma delas e depois decida qual banco de dados é o de referência.

:::note A linha de readiness não volta ao normal sozinha, e isso é deliberado
O marcador é reivindicado uma única vez, no boot; nada o relê, porque não há resposta mais atual a
obter — esta instância o detém agora. Assim, uma parada abrupta custa um ciclo de readiness vermelho, e
o boot depois de uma parada normal volta a ficar verde.
:::

**O que de fato diverge.** Duas instâncias assinando a partir de um mesmo compartilhamento de trabalho
**não** assinam o mesmo arquivo duas vezes: o lease por arquivo sobre um arquivo de entrada é recusado,
e não quebrado. O que diverge é tudo o que está no banco de cada instância:

- **Estado das aprovações** — um job retido na etapa de aprovação só existe no banco de uma das
  instâncias. A outra não sabe nada sobre ele, sobre os aprovadores dele nem sobre o quórum que ele
  aguarda. É isso que exige ação rápida.
- **Estado de pausa** — o `POST /api/pipeline/pause` retém uma instância. A outra continua assinando.
- **Estatísticas e histórico de jobs** — cada instância informa os seus, então nenhum dos dashboards
  mostra o quadro completo.

**Se o marcador não puder ser reivindicado de forma alguma** — um compartilhamento inacessível, uma
credencial trocada —, a linha mostra `not claimed cleanly at startup: …` e a readiness fica vermelha por
esse motivo, e não pelo outro. Nesse caso, não se sabe se outra instância o detém, e o desconhecido não
é informado como se fosse a resposta tranquilizadora.

## Quais instâncias estão vivas (somente no modo cluster)

Com `Cluster:Enabled = true`, cada instância mantém uma linha no banco operacional — quem ela é, quando
enviou o último heartbeat e qual versão da aplicação está rodando —, e toda instância consegue ler as
linhas de todas as outras. **Sistema → Instâncias** no dashboard mostra essa tabela.

| Coluna | O que ela informa |
|---|---|
| Instância | A identidade derivada. No App Service, ela vem do `WEBSITE_INSTANCE_ID` da plataforma, então é estável por toda a vida da instância e distinta entre irmãs. |
| Estado | **Viva** enquanto o último heartbeat está dentro de `Cluster:StaleAfterSeconds`; **Parada** quando o processo aposentou a própria linha em um desligamento limpo — o rastro normal de uma reimplantação; **Sem sinal** quando ficou em silêncio além do limite sem avisar. **Sem sinal** é uma presunção, não uma morte confirmada — veja [a suposição](high-availability.md#uma-morte-presumida-é-uma-suposição). |
| Versão | A versão da aplicação que aquela instância está rodando. Dois valores diferentes aqui, em qualquer momento fora de uma janela de implantação, caracterizam a condição de versões mistas, que é informada como um Critical no boot da instância mais nova. |
| Último sinal | Idade do heartbeat mais recente. A legenda abaixo da tabela indica a cadência (`Cluster:HeartbeatSeconds`, padrão 15) e o limite de obsolescência (padrão 60) efetivamente em vigor. |

Uma linha é destacada como a instância que respondeu à sua requisição. Como o balanceador de carga
escolhe a instância a cada requisição, recarregar a página move esse destaque entre as linhas — a
confirmação mais barata disponível de que o tráfego está de fato distribuído. Uma linha cuja instância
**deslocou** uma predecessora viva mostra, abaixo da identidade, qual predecessora foi deslocada e
quando — veja a próxima seção.

O `GET /api/folders` tem um campo `instance` pelo mesmo motivo: um cliente automatizado que o consulta
precisa distinguir "a pasta mudou" de "outra instância respondeu".

### Quando um boot encontra a própria identidade ainda viva

:::warning Mudou na 2.5.0 — uma predecessora viva é deslocada, não recusada
Até a 2.4.x, uma instância que subia e encontrava a própria identidade ainda enviando heartbeats se
recusava a iniciar (a 2.4.3 primeiro esperava por ela e depois recusava). Desde a 2.5.0, o novo boot
**desloca** a detentora viva e segue em frente.
:::

É assim que funciona uma reimplantação in-place no App Service: a plataforma inicia o novo container ao
lado do antigo, sob o mesmo id de instância, e mantém o antigo atendendo — e enviando heartbeats — até
que o novo passe no probe de aquecimento. Nem uma recusa nem uma espera dariam conta disso; então:

- **O novo boot** assume a identidade de imediato e registra um `Warning` com a encarnação deslocada, a
  build dela e o último heartbeat. Não há falha de inicialização.
- **O processo deslocado se retira** no próximo heartbeat: um `Critical` no log *dele*, um evento
  operacional `InstanceStoodDown`, uma linha `cluster-instance` vermelha no `/api/ready` dele — que
  **não** reprova o probe, já que um 503 faria a plataforma retirar o único container para o qual ainda
  está roteando — e um banner acima da tabela Instâncias na página Sistema dele. Ele não reivindica
  nenhum job novo, não executa assunções e não faz polling de nada no Lacuna Signer; o que ele detém
  roda até o fim, e ele continua atendendo a web até que a plataforma o pare.
- **Ele retoma o trabalho por conta própria** se a linha da encarnação mais nova depois ficar parada ou
  sem sinal — uma recém-chegada que aposentou a própria linha em uma parada normal, ou um segundo host
  parado depois — com um `Warning`, um evento `InstanceResumed` e o `/api/ready` verde de novo. Ele nunca
  toma a identidade de volta de uma detentora que ainda envia heartbeats.
- **O que a vida deslocada deixou por terminar** é ignorado pela
  [recuperação na inicialização](#recuperação-na-inicialização) do novo boot e assumido um
  `Cluster:StaleAfterSeconds` depois do deslocamento, sob a política normal de
  [assunção](#quando-uma-instância-para-de-responder-uma-sobrevivente-assume-seus-jobs).
- **Um boot cujo banco não respondeu** se registra no primeiro heartbeat que consegue chegar ao banco,
  deslocando exatamente como o boot teria feito.
- **Um desligamento limpo aposenta a própria linha antes**, então um reinício depois de uma parada normal
  não desloca nada — e é por isso que *parar, trocar, iniciar* continua sendo a implantação mais limpa.

:::note No App Service, uma implantação que falha é desfeita voltando para a tag de imagem anterior
Se o novo container falha no aquecimento depois de deslocar o antigo, o App Service **não** volta para o
container antigo: ele para o **site inteiro** — inclusive o container que se retirou, antes que a linha
da sucessora ficasse sem sinal — e continua reiniciando-o com a imagem nova. A retomada descrita acima
não tem como acontecer nesse caso. Aponte o app de volta para a tag de imagem anterior
(`az webapp config container set`), e ele fica pronto de novo em cerca de dois minutos. Veja
[Atualizações exigem parada total](high-availability.md#atualizações-exigem-parada-total).
:::

**Dois hosts que se apresentam com o mesmo nome, portanto, também não são recusados**: eles se revezam,
com avisos nos dois lados, e exatamente um deles reivindica trabalho a cada momento. Se você vir um
deslocamento quando ninguém está reimplantando, leia os dois logs e renomeie um dos hosts ou aponte-o
para o seu próprio banco. A única recusa de boot que resta é a de um registro que perdeu todas as
disputas de escrita pela própria linha; ela informa a build e o último heartbeat da vencedora. Apagar a
linha enquanto uma detentora está rodando remove o aviso, e não a condição. Veja
[Diagnóstico de problemas](troubleshooting.md#modo-cluster).

## Quando uma instância para de responder, uma sobrevivente assume seus jobs

Toda instância sobrevivente acompanha a tabela de heartbeat. Quando uma irmã fica sem sinal, uma
sobrevivente reivindica as linhas em andamento dela e reconcilia cada uma **conforme o ponto a que ela
havia chegado**, e não repetindo-a:

| O job da instância morta estava… | O que a sobrevivente faz | Por quê |
|---|---|---|
| Reivindicado, mas não havia chegado à chamada de assinatura | **Reenfileira** | Nada foi tentado, então nada está sendo repetido. |
| Depois da chamada de assinatura | **Marca como falho**, por cautela | Uma assinatura nunca é tentada de novo sem que uma pessoa decida isso. `Failed` é um desfecho terminal honesto, não "travado" — a [nova tentativa manual](#repetindo-jobs-que-falharam) do operador continua sendo a forma de repetir. |
| `AwaitingSigner` (despachado ao Lacuna Signer) | **Reatribui** à sobrevivente, que retoma o polling | O lado remoto detém o trabalho; só o polling precisa de um novo dono. |

Cada assunção grava um evento operacional `JobTakenOver` com **as duas** instâncias, de modo que a
trilha de auditoria registra quem perdeu o trabalho e quem o assumiu.

:::warning A assunção fica sujeita à pausa
O `POST /api/pipeline/pause` retém todas as instâncias, e a assunção não roda enquanto o pipeline está
pausado. Isso é deliberado: um operador que pausa um cluster para investigar um banco que ficou lento é
exatamente a pessoa que não pode ver todas as instâncias declarando mortas todas as irmãs.
:::

Há dois tipos de linha que nada jamais assumirá, e ambos são informados em vez de adotados:

- **Um job sem dono nenhum**, deixado por uma build anterior à coluna de dono ou por uma execução com o
  modo desligado. A solução é indicada em todos os lugares que encontram um desses — suba uma vez com
  `Cluster:Enabled = false`, para que a [recuperação na inicialização](#recuperação-na-inicialização)
  normal o varra, e então religue o modo.
- **Um job detido por uma instância nomeada que não tem linha de heartbeat.** A ausência de heartbeat não
  é prova de morte, então isso é informado uma vez e deixado como está, em vez de ser interpretado como
  permissão para fazer falhar um trabalho vivo.

Os dois casos, e o motivo pelo qual adotá-los reintroduziria o defeito que a funcionalidade elimina,
estão em
[Alta disponibilidade](high-availability.md#linhas-que-ninguém-possui-não-são-reconciliadas-por-ninguém).

## Contenção entre instâncias não é uma falha

Toda instância monitora todas as pastas de entrada, então a cada chegada elas disputam o arquivo. Esse é
o projeto, e o lado perdedor da disputa é classificado como um **desfecho esperado**, e não como um
erro:

- O enfileiramento perdedor é recusado por um índice único parcial sobre os caminhos originais ativos e
  respondido como `AlreadyActive`. Cada arquivo vira exatamente um job.
- Um conflito de lease em um arquivo de entrada é registrado no nível de desfecho esperado, com um id de
  evento próprio, de modo que "uma irmã chegou primeiro" e "outro componente desta instância chegou
  primeiro" continuem sendo fatos diferentes.
- **Nenhum dos dois conta para o limite de falhas consecutivas da pasta**, e um desfecho `AlreadyActive`
  zera esse contador exatamente como um enfileiramento bem-sucedido. Um cluster movimentado, portanto,
  não consegue disparar o [disjuntor por pasta](#isolamento-de-falhas-do-observador-por-pasta) só por
  estar movimentado.

A reivindicação em lote também se degrada sob contenção — ela passa a reivindicar uma linha por vez e
registra a disputa perdida. É um custo pequeno e conhecido, e não uma falha.

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
`Pipeline:MaxConcurrency` jobs em paralelo. O padrão `1` é sequencial; os operadores podem optar por
`N > 1` para ganhar vazão (somente com PFX — veja a ressalva sobre PKCS#11 / WindowsStore em
[Certificados](certificates.md)). O worker:

1. Consulta a fila a cada `Pipeline:PollIntervalSeconds` segundos, limitado pela concorrência
   configurada. Quando todos os slots estão ocupados, o polling fica suspenso até um slot ser liberado.
2. Verifica a flag de pausa. Quando pausado, o worker gira em vazio sem pegar trabalho; os jobs que já
   estão em andamento seguem até a conclusão natural. A flag de pausa é lida a cada iteração de polling
   e sobrevive a reinicializações.
3. Reivindica o próximo job `Queued` de forma atômica (transição `Queued → Processing`). Se uma escrita
   concorrente (um cancelamento ou outro worker) alterou a linha antes, o worker passa para a próxima
   iteração.
4. Para cada job reivindicado, move a entrada para `processing/<jobid>/`, assina, verifica,
   opcionalmente criptografa e então promove para `output/`. Cada job roda isolado, com a própria pasta
   de processamento.
5. Em qualquer falha: move o conteúdo de `processing/<jobid>/` para `error/<jobid>/`, marca o job como
   `Failed` e registra a mensagem da exceção no campo de erro do job e no histórico.
6. **A entrada original só é removida de `input/` depois de uma verificação bem-sucedida, e somente se
   ainda for o arquivo que foi copiado para processamento.** A verificação acontece antes da exclusão, nunca o
   contrário — e um arquivo que o pipeline não processou nunca é apagado. Veja
   [Quando um arquivo de entrada muda no meio de um job](#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job).

**Drenagem na pausa.** Quando um operador pausa com jobs em andamento, o worker para de reivindicar
novos, mas os que já estão rodando vão até o fim. O card "Slots ocupados" do dashboard vai diminuindo
conforme eles terminam.

**Três portas de entrada.** Um arquivo chega à fila por uma pasta monitorada, pelo `POST /api/files` ou
pelo botão **Enviar arquivos** da página Jobs, que envia cada arquivo pelo mesmo handler da rota REST —
o mesmo limite de tamanho, a mesma sanitização do nome do arquivo e as mesmas verificações de perfil —,
de modo que os dois recusam um arquivo exatamente nas mesmas condições. O diálogo pede um perfil de
assinatura habilitado e termina com um relatório por arquivo, com um link para cada job criado.
`Upload:Enabled = false` desliga **os dois** caminhos de upload de uma vez: o `POST /api/files` responde
`409` com `upload.disabled`, e a página Jobs não mostra o botão de upload. Pastas monitoradas, nova
varredura e nova tentativa não são afetadas; a chave é lida no boot, então religá-la exige um reinício.
Veja [Configuração](configuration.md#upload).

### Perfis LacunaSigner — worker de polling separado

Quando um perfil usa `Method = LacunaSigner`, o worker apenas **despacha** o job ao Lacuna Signer
(upload + criação do documento) e imediatamente o passa para `AwaitingSigner` — o slot de concorrência
é liberado assim que o despacho é concluído com sucesso. Um worker de polling separado percorre todas as
linhas `AwaitingSigner` na própria cadência (`Signer:PollIntervalSeconds`, padrão 30 s), baixa os bytes
quando o documento remoto é concluído e executa a mesma etapa final de verificar → opcionalmente
criptografar → promover. Veja [Integração com o Lacuna Signer](lacuna-signer.md).

## Roteando uma pasta monitorada para um perfil de assinatura

:::warning Mudou na 2.2.0 — o perfil escolhe a sua pasta
Uma pasta monitorada é assinada com **o perfil que a escolheu**, e um perfil escolhe a sua pasta na
própria página no dashboard — uma pasta por perfil, um perfil por pasta. O `Storage:Inputs[].Profile`
passou a ser **dado de seed (carga inicial)**: ele é lido uma única vez, no primeiro boot com a tabela
de perfis vazia, e ignorado (com aviso de que foi ignorado) em todos os boots seguintes. Depois do
primeiro boot, o arquivo de configuração não consegue rotear uma pasta. Veja
[`Storage:Inputs[].Profile`](configuration.md#storageinputsprofile--roteamento-por-pasta).
:::

Nada mais sobre a pasta muda de lugar: o nome, o caminho, o provider, as credenciais e o intervalo de
polling continuam em `Storage:Inputs[]`, são validados no boot e são o que a página Pastas de entrada
lista. O que a página do perfil decide é qual pasta alimenta qual perfil — ou seja, qual certificado e
qual regra de aprovação os arquivos da pasta recebem.

### Pela página do perfil

1. Abra a página do perfil no dashboard (`/profiles/{name}`) e clique em **Editar comportamento**. O
   seletor **Pasta de entrada** oferece *nenhuma*, todas as pastas que este host configurou e que nenhum
   outro perfil usa, e a pasta atual do próprio perfil.
2. Escolha a pasta e salve. O observador da pasta começa a monitorá-la em um ou dois intervalos de
   `Pipeline:PollIntervalSeconds`, em todas as instâncias, sem reinício. Os arquivos que já estão na
   pasta são capturados sem nova varredura.
3. Confira a página Pastas de entrada: o card da pasta agora mostra o chip do perfil, com um link de
   volta para ele.

Um perfil criado em `/profiles/_new` escolhe a sua pasta no mesmo formulário. O evento de auditoria
registra a mudança pelo nome da pasta, nunca pelo caminho — `InputFolder (none) → remessas` em uma
edição e `Input folder: remessas.` em uma criação.

**Duas recusas, ambas ao salvar.** Uma pasta que este host não configurou em `Storage:Inputs[]`, e uma
pasta que outro perfil já usa — nesse segundo caso, a mensagem informa o dono; limpe a pasta nele
primeiro ou escolha outra. Dois salvamentos que escolhem a mesma pasta no mesmo instante deixam
exatamente um dono, e o perdedor é informado de quem ficou com ela. Nenhuma das recusas acontece no
boot: um vínculo armazenado não é revalidado; então, uma pasta renomeada ou removida da configuração
depois que um perfil a escolheu gera um **aviso de degradação** — no banner de inicialização, como uma
linha `profile-input-folder:<profile>` no `/api/ready` que não reprova o veredito, e como um alerta em
`/profiles` e na própria página do perfil —, enquanto o perfil continua atendendo uploads.

### O que significa *não atribuída*

Uma pasta que nenhum perfil escolheu está **não atribuída**, e nada a monitora. Ela aparece como:

- um chip cinza na página Pastas de entrada com o texto `sem perfil — nenhum perfil escolheu esta pasta`;
- `status: "Unassigned"`, sem `profileName`, no `GET /api/folders`;
- uma linha `input-folder:<nome>` **verde** no `/api/ready` — nada está quebrado, e uma linha vermelha
  mandaria um orquestrador retirar uma instância por causa de uma pasta que ninguém pediu para ela
  monitorar;
- um `Warning` no log, no boot e sempre que um perfil libera a pasta.

Os arquivos deixados em uma pasta não atribuída **esperam**: não são ignorados, nem movidos, nem
recusados, e são capturados no momento em que um perfil escolhe a pasta. Uma pasta não atribuída **não**
passa a usar o `default` — isso colocaria os arquivos dela sob uma regra que ninguém escolheu. O
`default` é o perfil usado por um upload que não indica perfil, e por uma pasta que não indica nenhum na
única leitura do seed; nunca por uma pasta que ficou sem perfil depois disso.

Uma pasta fica não atribuída de uma de três formas: o seed a deixou assim no primeiro boot (uma pasta
que indica um perfil que a seção não declara, ou uma segunda pasta que indica um perfil que uma pasta
anterior já tomou), um perfil a liberou na própria página, ou a tabela de perfis foi criada pelo seed de
uma versão anterior à 2.2.0 e a pasta nunca foi vinculada. A solução é a mesma em todos os casos:
escolha a pasta na página de um perfil.

### Movendo uma pasta entre perfis

Limpe a pasta no perfil que a tem e **depois** escolha-a no perfil que deve tê-la — nessa ordem, porque o
segundo salvamento é recusado enquanto o primeiro perfil ainda é o dono. Nesse intervalo, a pasta fica
brevemente não atribuída; um arquivo que chegar nessa janela é capturado assim que o segundo salvamento
entrar em vigor, então nada se perde e nada é assinado duas vezes. Os jobs já enfileirados a partir da
pasta mantêm o perfil com que foram enfileirados, de modo que o nome de uma pasta em um job sempre
corresponde a exatamente um certificado e uma regra de aprovação.

Duas pastas que devem seguir a mesma regra são dois perfis com as mesmas configurações.

### Desabilitando um perfil que usa uma pasta

Desligar **aceitar novos trabalhos** é recusado, com o nome da pasta, enquanto o formulário ainda tiver
uma pasta — a alternativa seria uma pasta cujos arquivos deixam de ser assinados silenciosamente. Limpe
a pasta no mesmo salvamento e a desabilitação é aceita; a pasta fica não atribuída, isso aparece na
página Pastas de entrada, e ela espera por outro perfil.

### O que uma nova varredura e uma nova tentativa fazem com o vínculo

- Uma **nova varredura** pula inteiramente uma pasta não atribuída e informa isso — veja
  [Nova varredura](#nova-varredura).
- Uma **nova tentativa mantém o perfil que o job que falhou registrou**, seja qual for o perfil que a
  pasta alimenta hoje — veja [Repetindo jobs que falharam](#repetindo-jobs-que-falharam). Um job que
  deve ser assinado com o novo perfil da pasta é cancelado e enviado de novo.

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

Pausar e retomar são operações duráveis — a flag de pausa sobrevive a um reinício do serviço. Um worker
pausado continua aceitando uploads e capturas do observador (os jobs vão para `Queued`); eles apenas não
avançam. Os operadores veem "Pipeline: pausado" na página Sistema do dashboard.

Enquanto uma pausa está em vigor:

- Os jobs que já estão em `Processing` / `Verifying` terminam normalmente. A pausa impede a **próxima**
  captura, não o trabalho em andamento.
- O gauge `bulksigner_pipeline_paused` passa a `1`.
- Um evento operacional é gravado com o `reason` opcional:
  `"Pipeline paused by operator. Reason: Manutenção trimestral."`. A mesma convenção vale para a
  retomada. Os dois eventos podem ser consultados na página `/events` do dashboard.

Uma pausa e uma retomada emitidas no mesmo instante não se sobrescrevem silenciosamente: exatamente uma
das duas escritas vence, e a perdedora recebe `409` com o código `pipeline.race-lost`, sem ter registrado
nada. Consulte de novo o `GET /api/pipeline/state` e repita a operação se a sua intenção continuar
valendo.

:::note Implantações com SQL Server antes da 2.4.3
O banco operacional em SQL Server era criado sem a linha de estado do pipeline em que fica a flag de
pausa; por isso, nessas versões, o `POST /api/pipeline/pause` respondia `pipeline.state-missing` e o
pipeline continuava rodando. Desde a 2.4.3, uma migração aplicada no boot acrescenta a linha, e pausar e
retomar funcionam nos dois providers.
:::

## Cancelando jobs

```bash
curl -X POST http://localhost:8080/api/jobs/$JOB_ID/cancel \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Válido para `Queued`, `AwaitingSigner` e `AwaitingApproval`. Os dois estados de espera podem ser
cancelados justamente porque nada está ocupado com eles — um job `AwaitingSigner` espera por um serviço
remoto, um job `AwaitingApproval` espera por uma pessoa, e qualquer uma dessas esperas pode acabar sendo
uma que você não quer mais concluir. O endpoint retorna `409 { code: "job.not-queued" }` se o job já
passou desses estados (por exemplo, um job local que o worker pegou entre a decisão do operador e a
requisição). Jobs locais em andamento são intocáveis — removê-los no meio da assinatura deixaria
conteúdo órfão em `processing/` e uma saída não verificada.

- **`AwaitingSigner`:** a transição local para `Canceled` é confirmada primeiro, e então o documento
  remoto no Lacuna Signer é cancelado em melhor esforço; uma falha remota é registrada no log e **não**
  desfaz o cancelamento local. Veja [Semântica do cancelamento](lacuna-signer.md#semântica-do-cancelamento).
- **`AwaitingApproval`:** depois que o cancelamento é confirmado, a cópia preparada do job é movida de
  `processing/<jobid>/` para `error/<jobid>/`, também em melhor esforço. O snapshot de aprovação do job é
  **mantido** — ele registra a regra que o job aguardava, que é justamente o que uma auditoria pergunta
  depois.

No dashboard, o botão **Cancelar** da página do job pede confirmação antes: o diálogo mostra o nome do arquivo,
explica o que o cancelamento faz a partir do status atual do job e lembra que um job cancelado não tem
**Tentar novamente** — o arquivo precisa de uma nova varredura ou de um novo envio para ser assinado de
novo. *Manter job* não cancela nada. A rota REST não mudou e não pede confirmação.

Depois do cancelamento:

- O job passa a `Canceled` (terminal).
- Uma entrada é acrescentada ao histórico de auditoria: `"Operator canceled: <motivo>."` (ou
  `"Operator canceled."` se nenhum motivo foi informado).
- O arquivo permanece em `input/`. A memória de cancelamentos recentes do observador impede que ele seja
  reenfileirado automaticamente; reexecuções feitas pelo operador por envio, nova tentativa ou nova
  varredura reenfileiram o arquivo.

## Repetindo jobs que falharam

```bash
curl -X POST http://localhost:8080/api/jobs/$JOB_ID/retry \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Cria um novo job com um `Id` novo, os mesmos `FileName` / `OriginalPath` / `Format`,
`ParentJobId = (o job falho).Id` e estado inicial `Queued`. O job que falhou permanece `Failed`; a
cadeia pode ser reconstruída a partir do `ParentJobId`.

**A nova tentativa é assinada com o perfil que o job que falhou registrou**, e não com o perfil que a
pasta dele alimenta hoje: uma nova tentativa significa "assine do jeito que seria assinado", e seguir o
vínculo atual da pasta assinaria com uma regra que o job nunca teve. Um arquivo que deve passar para o
novo perfil da pasta é cancelado e enviado de novo. (Um job de antes da existência dos perfis de
assinatura não registrou nome e é repetido com o `default`.)

Retorna `404 { code: "job.not-found" }` para ids desconhecidos, `409 { code: "job.not-failed" }` para
jobs que não estão `Failed`, `409 { code: "job.input-missing" }` se o arquivo de entrada original não
está mais em disco, e duas recusas que são decisões, e não falhas — nos dois casos, o botão **Tentar
novamente** não aparece na página do job:

- `409 { code: "job.rejected-not-retriable" }` para um job que terminou `Failed` com
  `approval.rejected`, porque a rejeição de um aprovador chegou depois que um worker já o tinha
  reivindicado. O arquivo rejeitado já foi devolvido a `output/` com o nome `.reject`, e a entrada foi
  removida, então uma nova tentativa só poderia falhar. Corrija o arquivo e envie-o de novo. (Uma
  rejeição comum termina em `Canceled`, estado ao qual a nova tentativa também não se aplica.)
- `409 { code: "file.already-processed" }` para um job recusado porque outro job já tem o mesmo nome de
  arquivo. A nova tentativa é isenta dessa regra, então repetir essa falha específica assinaria
  justamente o arquivo que a regra recusou. Em vez disso, exclua o job que detém o nome — veja
  [Nomes de arquivo já processados](#nomes-de-arquivo-já-processados).

A página de detalhe do job no dashboard mostra links para o job de origem e para os jobs derivados, para
que os operadores possam percorrer uma cadeia de novas tentativas até a falha original.

## Nomes de arquivo já processados

:::warning Mudou na 2.13.0 — um nome que já foi assinado é recusado
Com `Pipeline:RejectAlreadyProcessedFileNames` ligado — o padrão —, um arquivo que chega com um nome que
um job `Completed` ou ainda ativo já tem **nunca é assinado**. As versões anteriores o assinavam de
novo. Defina a chave como `false` para manter o comportamento antigo. Veja
[Configuração](configuration.md#pipeline).
:::

A comparação vale para o host inteiro e não diferencia maiúsculas de minúsculas, porque todas as pastas
monitoradas, todos os perfis e todos os uploads gravam na mesma pasta `output/`.

- **Pasta monitorada ou nova varredura:** o arquivo vira um job que já nasce `Failed` com
  `file.already-processed`, indicando o job que detém o nome, e os bytes são movidos para a pasta
  `error/<jobid>/` do novo job, para que o arquivo não seja oferecido de novo. O console avisa arquivo
  por arquivo, e um evento operacional `FileAlreadyProcessed` é gravado. Uma nova varredura conta esses
  casos em um número separado, `alreadyProcessed`. Se o arquivo não puder ser movido (outro processo o
  detém), nada é registrado e ele permanece na pasta; uma nova varredura o conta em `errors`.
- **Upload:** `409` com `file.already-processed`; nada é armazenado.
- **O que não reserva um nome:** um job `Failed` ou `Canceled`. Colocar o arquivo de novo na pasta
  depois de uma falha é a forma de tentar outra vez.

**Para aceitar um nome de novo, exclua o job que o detém** em `/jobs` — veja
[Excluindo um job](#excluindo-um-job). Depois que ele é excluído, um arquivo reenviado com esse nome é
capturado pelo observador sem nova varredura. Nada impõe a regra no banco de dados: duas instâncias em
um cluster podem aceitar o mesmo nome no mesmo instante, e é a recusa em sobrescrever um arquivo que já
está em `output/` que barra a segunda.

## Excluindo um job

Para remover **um** job — por exemplo, o que detém um nome de arquivo que você quer que volte a ser
aceito —, exclua-o em `/jobs`: uma linha por vez, com um diálogo de confirmação e um motivo opcional.
Não há rota REST para isso.

- **Um job que um worker está executando** (`Processing` / `Verifying`) não pode ser excluído. Um job que
  não terminou (`Queued`, `AwaitingApproval`, `AwaitingSigner`) é cancelado primeiro, exatamente como um
  cancelamento faria — inclusive o cancelamento em melhor esforço do documento remoto no Lacuna Signer —
  e é registrado com o status que tinha (`'<name>', Queued, canceled to delete it`).
- **O que é removido:** o job, o histórico, os tempos, o detalhamento CNAB240, o snapshot de aprovação e
  as aprovações registradas; as pastas `processing/` e `error/<jobid>/` dele; o arquivo de saída que **o
  próprio job registrou** ter gravado em `output/` — nunca um arquivo que apenas tem o mesmo nome, e nada
  no caso de um job concluído antes da 2.13.0, que não registrava esse dado; e a entrada, **somente** se
  o job a copiou para processamento e ela não mudou desde então.
- **O que é mantido:** uma entrada da qual o job nunca preparou uma cópia, ou que foi reescrita desde então —
  exceto a cópia do próprio upload, que o produto nomeou e colocou na pasta de destino, e que é removida;
  uma entrada que outro job não terminado (uma nova tentativa deste, por exemplo) ainda referencia; e uma
  que não pôde ser comparada porque outro processo a detém ou porque não pode ser lida. A próxima
  varredura trata cada entrada mantida como uma nova chegada, e o aviso em `/jobs` informa o que foi
  mantido.
- **O que a trilha de auditoria mantém:** todos os eventos operacionais existentes, inclusive os que
  mencionam o job excluído, e mais um — um evento `JobDeleted`:
  `Job <id> ('<name>', <status>) deleted by <actor>.`, seguido do que foi removido e do que foi mantido,
  de um resumo das aprovações que houver (decisão, nome do aprovador, endereço mascarado, horário) e de
  `Reason: <reason>.` quando um motivo foi informado.

**Como isso difere do Limpar Jobs**, deliberadamente: o Limpar Jobs é uma ordem para esvaziar o
sistema, então ele abandona jobs em andamento, apaga entradas sem compará-las e apaga os eventos
operacionais. Excluir um job não faz nada disso.

## Nova varredura

```bash
# Todas as pastas configuradas
curl -X POST http://localhost:8080/api/rescan \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

# Apenas uma pasta
curl -X POST "http://localhost:8080/api/rescan?folder=legal" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Reenfileira todos os arquivos que estão na(s) pasta(s) de entrada configurada(s) e que ainda não são um
job ativo. É útil depois de uma pausa longa ou depois de colocar arquivos manualmente. A resposta traz um
detalhamento por pasta e contagens agregadas. Cada arquivo encontrado na nova varredura é marcado com o
nome da pasta correspondente.

A nova varredura **reenfileira, sim,** arquivos que foram cancelados recentemente ou cujo último job
falhou (ao contrário da captura automática do observador, que não mexe em nenhum dos dois).

- **Uma pasta cujo perfil de assinatura está desabilitado conta em `ignored`, e não em `errors`.**
  Desabilitar um perfil é um pedido para pular os arquivos dele, então o acúmulo de um perfil desativado
  não aparece como um número vermelho. A linha de log que explica o número é gravada uma vez por pasta,
  com o nome do perfil. Reabilite o perfil e faça uma nova varredura, ou escolha a pasta na página de
  outro perfil.
- **Uma pasta que nenhum perfil escolheu é pulada inteira, e a resposta informa isso.** A linha dela
  volta com `unassigned: true` e todas as contagens em zero, `totals.unassigned` conta essas pastas, o
  aviso da página Pastas de entrada termina com `… N pasta(s) sem perfil, ignorada(s)`, e o log registra
  uma linha `Information` por pasta. Não é um erro nem `ignored` — ninguém pediu ainda para assinar a
  partir daquela pasta. Escolha a pasta na página de um perfil; o observador passa então a listá-la sem
  outra varredura. Veja
  [Roteando uma pasta monitorada para um perfil de assinatura](#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura).
- **Um arquivo cujo nome um job concluído ou ativo já tem** é contado em `alreadyProcessed` — veja
  [Nomes de arquivo já processados](#nomes-de-arquivo-já-processados).
- **Uma pasta que não pode ser lida não interrompe as outras.** A linha dela volta com `errors: 1` e
  `scanned: 0`, todas as outras pastas são varridas normalmente, e a chamada continua retornando `200`. O
  log em arquivo registra a exceção de origem.

## Limpar Jobs

Uma ação de manutenção que **apaga permanentemente todos os registros de jobs e todos os arquivos que
esses jobs deixaram** — as linhas de job em qualquer status, o histórico, as evidências de aprovação e o
detalhamento das linhas CNAB240 e, na árvore de armazenamento, o arquivo de entrada de cada job, a pasta
`processing/<jobid>/`, a pasta `error/<jobid>/` e a saída assinada — **junto com todos os eventos
operacionais registrados antes do início da limpeza**. O que resta da trilha de eventos é o evento
`JobsCleared`, que registra a limpeza, mais o que algum worker confirmar enquanto ela roda. Ela **não**
mexe no estado do pipeline, nos perfis de assinatura, na configuração, nos logs nem nas pastas raiz.

:::warning Mudou na 2.9.0 e na 2.10.0 — todos os jobs, seus arquivos e os eventos operacionais
Da 2.0.0 à 2.8.x, o Limpar Jobs apagava somente registros de jobs *finalizados* e informava os não
finalizados que tinha pulado. Desde a 2.9.0, ele remove **todos** os jobs, qualquer que seja o status —
um arquivo `Queued`, um job retido à espera de um aprovador, um job que um worker está assinando naquele
momento e, com `Cluster:Enabled`, o job de uma instância irmã — e apaga os arquivos que esses jobs
deixaram; a contagem `skipped` saiu da resposta. Desde a 2.10.0, ele também apaga os eventos
operacionais registrados antes da limpeza. Um operador que limpa o sistema pela zona de perigo quer um
sistema vazio, e o diálogo de confirmação diz exatamente o que será removido.
:::

**Depois de confirmada, a limpeza roda até o fim, quer você fique na página ou não.** Os arquivos são
varridos antes das linhas; então, em um compartilhamento de trabalho remoto, uma limpeza com muitos jobs
acumulados leva algum tempo, e não há problema em navegar para `/jobs` para ver a tabela esvaziar. Só a
parada do host a interrompe; se isso acontecer, a transação é desfeita com todas as linhas ainda
presentes, os arquivos já varridos continuam apagados, e um aviso no log informa isso — execute a
limpeza de novo. (Antes da 2.11.1, sair da página Sistema cancelava a limpeza silenciosamente, o que
parecia uma limpeza que não tinha funcionado.) O aviso de resultado é a única parte que exige você na
página; o evento `JobsCleared` e a linha de log são o registro de qualquer forma.

Pelo dashboard: **Sistema → Zona de perigo → Limpar Jobs**. Um diálogo de confirmação — irreversível;
todos os jobs, inclusive os não finalizados; todos os arquivos que esses jobs deixaram; todos os eventos
operacionais registrados até então, restando apenas o registro da limpeza — protege a ação; cancelar não
apaga nada. Por REST:

```bash
curl -X DELETE http://localhost:8080/api/jobs \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
# → {"deleted": 1234, "filesDeleted": 2460, "foldersDeleted": 7, "eventsDeleted": 318, "itemsFailed": 0, "message": "Cleared 1234 job record(s), 2460 file(s), 7 folder(s) and 318 operational event(s)."}
```

O que acontece ao confirmar:

- **Os arquivos de cada job são apagados primeiro** — entrada, `processing/<jobid>/`, `error/<jobid>/` e
  a saída assinada no local que o job registrou (mais a devolução `.reject` de um arquivo rejeitado) —,
  em qualquer armazenamento em que estejam. A operação é em melhor esforço, item a item: um arquivo sobre
  o qual outro processo detém um lease, ou uma pasta que o armazenamento recusa, é deixado no lugar,
  citado em uma linha de aviso no log e contado em `itemsFailed` (um aviso no dashboard), e o registro do
  job é removido mesmo assim. Um armazenamento inacessível faz a limpeza falhar antes que qualquer linha
  seja apagada.
- **Depois, todas as linhas de job e o histórico são apagados** em uma transação (os vínculos com o job
  de origem nas cadeias de novas tentativas são desfeitos antes, para que a chave estrangeira
  autorreferenciada não bloqueie a exclusão).
- **Todos os eventos operacionais registrados antes do início da limpeza são apagados** na mesma
  transação, e então um evento `JobsCleared` é gravado — a primeira linha da trilha a partir dali —,
  registrando o ator (identidade por cookie ou por chave de API), o timestamp e as contagens de jobs,
  arquivos, pastas e eventos apagados, seguidas de `N file(s) or folder(s) could not be deleted.` quando
  algo foi recusado. O mesmo conteúdo é emitido no log estruturado. Em caso de falha no banco de dados, a
  transação é desfeita, um erro é registrado no log e o operador permanece na página — os arquivos já
  varridos não são restaurados, então execute a limpeza de novo.
- Um **marcador de zeragem**, válido para toda a implantação, é atualizado dentro da mesma
  transação, de modo que o [painel de desempenho](statistics.md#zerando-o-painel) volta a zero em todas
  as instâncias. Nada é apagado *para* zerar o painel, e uma limpeza que falha o deixa exatamente como
  estava.

**Ressalvas.**

- **A limpeza não espera por nada.** Um job que o worker está assinando naquele momento tem a cópia em
  stage apagada durante a execução; o worker marca o job como falho, não encontra a linha em que gravaria
  a falha e registra as duas coisas no log. Se um lote está no meio do processamento e é importante,
  **pause o pipeline e espere os jobs em andamento terminarem antes**. Com `Cluster:Enabled`, o mesmo
  vale para os jobs de todas as irmãs.
- **As entradas são apagadas sem a comparação** com a impressão digital do stage que todos os outros
  caminhos fazem — o Limpar Jobs é uma ordem para esvaziar o sistema, e não um job sendo concluído.
- **Nada é forçado do lado do armazenamento.** Confira o log depois de qualquer limpeza que informe
  `itemsFailed` diferente de zero e remova esses itens manualmente — em geral, um produtor que ainda está
  gravando em uma pasta de entrada, ou um bloqueio que uma irmã deixou sobre uma cópia preparada. A pasta
  `error/` gêmea, com sufixo de timestamp (criada quando um mesmo id de job foi realocado duas vezes),
  não pode ser deduzida a partir da linha e também é deixada.
- **Um job enfileirado enquanto a limpeza está rodando** não estava na foto tirada pela varredura: ele
  mantém o arquivo de entrada e perde só a linha, e a próxima varredura de pastas — na inicialização do
  serviço ou em uma nova varredura — ingere o arquivo de novo.
- O card *Último desligamento* da página Sistema fica vazio depois de uma limpeza, até o próximo
  desligamento — um fato sobre o sistema limpo, e não um defeito.

Para remover um único job em vez de todos, veja [Excluindo um job](#excluindo-um-job).

:::warning Não há como desfazer
Retire antes de `output/` tudo de que ainda precisar — os arquivos assinados são removidos junto com os
jobs. Faça backup do banco operacional se o histórico de jobs ou a trilha de eventos tiver valor de
auditoria — `db/bulksigner.db` com SQLite, ou o backup previsto na rotina do seu SGBD com SQL Server.
Veja [Retenção](retention.md#disciplina-de-backup).
:::

## Isolamento de falhas do observador por pasta

Cada entrada de `Storage:Inputs[]` tem o próprio observador, com o próprio limite de falhas consecutivas
de enfileiramento (padrão 10). Quando o limite é atingido em uma pasta, o observador dela se marca como
`Stopped` e encerra — **o processo continua rodando, e os observadores das outras pastas não são
afetados**.

Um observador `Stopped` não volta a funcionar sozinho. O estado aparece em três lugares:

- O card da pasta na página Pastas de entrada do dashboard mostra um chip vermelho "parado" e o texto do
  último erro.
- O `GET /api/folders` retorna `"status": "Stopped"` com `lastError` preenchido.
- O `GET /api/ready` retorna `503` com `input-folder:<nome>` falhando no array `checks`.

Para recuperar: corrija a causa de origem (montagem, disco, permissões) e reinicie o serviço.

:::note
É fácil não perceber uma pasta degradada se você não acompanha o `/api/ready` ou a página Pastas de
entrada. Configure um monitor externo que consulte o `/api/ready`, para que uma única montagem com
problema não passe despercebida.
:::

## Recuperação na inicialização

Uma varredura de recuperação roda depois das migrações e antes de o worker iniciar. Para cada job ainda
em `Processing` ou `Verifying` na inicialização (isto é, a execução anterior foi interrompida no meio do
processamento):

- O job é marcado como `Failed` com a mensagem
  `"Service restarted while job was in flight; marked as failed during recovery."`.
- O diretório `processing/<jobid>/` correspondente é movido para `error/<jobid>/`, de modo que o
  conteúdo em andamento seja preservado para análise forense.
- O arquivo de entrada original (se ainda existir em `input/`) é deixado onde está — os operadores podem
  reexecutá-lo por nova varredura ou por envio.

**As linhas `AwaitingSigner` explicitamente NÃO são varridas.** Esses jobs estão retidos do lado remoto,
no Lacuna Signer — o host local não tem como saber se o participante já assinou, e marcá-los como
`Failed` invalidaria um trabalho que o host não executou. O worker de polling retoma o polling no
primeiro tique depois do boot, exatamente de onde parou.

A varredura de recuperação é idempotente — um reinício limpo não encontra jobs em andamento e não faz
nada.

:::note No modo cluster, um boot varre somente as próprias linhas
Um job registra a instância que o reivindicou, e com `Cluster:Enabled = true` a recuperação é filtrada
pela identidade da própria instância — caso contrário, um boot marcaria como falho um trabalho que uma
irmã viva ainda está fazendo. As linhas interrompidas de uma irmã são tratadas pela
[assunção](#quando-uma-instância-para-de-responder-uma-sobrevivente-assume-seus-jobs), que se baseia no
heartbeat do dono, e não no boot.

A consequência é a única providência necessária na atualização: uma linha deixada em andamento por uma
build mais antiga não tem **nenhum** dono, e nada com a chave ligada jamais a varrerá. Suba uma vez com
`Cluster:Enabled = false` antes do primeiro boot em cluster, e esta varredura limpa todas elas.

Depois que um boot [deslocou](#quando-um-boot-encontra-a-própria-identidade-ainda-viva) uma predecessora
viva, a varredura ignora **todas** as vidas anteriores da identidade — o processo deslocado ainda pode
estar terminando os seus jobs —, e a assunção chega a eles um `Cluster:StaleAfterSeconds` depois do
deslocamento.
:::

## O banner de resumo de prontidão

A cada inicialização, depois que o bootstrap termina, o serviço imprime um painel que resume o estado
mais importante para a tomada de decisões:

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

A linha `version` mostra a versão **completa**, com os metadados de build — a build que uma implantação
roda é o que um pedido de suporte acaba perguntando. O banner com a marca, impresso acima dele no início
de toda inicialização, mostra a forma curta (`v2.15.0`).

Esta é a forma mais rápida de verificar se uma mudança de configuração entrou em vigor. Uma chave
digitada errado aparece com o valor padrão, e não com o valor que você pretendia.

Um segundo painel — **Signing profiles** — lista todos os perfis do banco operacional (criados pelo
seed a partir de `Signing:Profiles[]`, ou a partir do bloco de certificado legado como um `default`
derivado, no primeiro boot com a tabela de perfis vazia), uma linha por perfil. Perfis configurados com
`Verify=false` ou `ValidateCertificate=false` emitem linhas `WARN` adicionais (tanto na saída padrão
quanto no arquivo de log), para que a configuração de baixa confiança fique registrada de forma durável.
Três outros estados aparecem nesse painel, e nenhum deles impede o boot:

- **`DEGRADED · `** — o certificado do perfil não pôde ser aberto. Uma linha `FAIL` ao lado indica o
  perfil e o motivo, e a mesma linha vai para o log como `Critical`. O host inicia, e o restante da
  implantação continua assinando; os jobs roteados para esse perfil falham com `profile.degraded`, e o
  `/api/ready` tem uma linha `signing-profile:<nome>` informando `ok: false` sem reprovar a resposta.
  Corrija o certificado e reinicie. Um perfil cujos **segredos armazenados** não puderam ser
  descriptografados fica degradado da mesma forma, e o motivo cita `Signing:ProfileSecretsKey`; nesse
  caso, a solução é informar de novo o material de certificado desse perfil e depois reiniciar.
- **`KEYLESS · `** — o conjunto de assinantes do perfil é `Approvers`, então quem assina são os
  aprovadores e não há chave. A linha mostra `cert=none (approvers sign)`, nada é aberto para ele na
  inicialização, e o `/api/ready` tem uma linha `signing-profile-keyless:<nome>` informando `ok: true`.
  Ele não está degradado e não precisa de correção.
- **Avisos sobre pastas** — no primeiro boot, uma linha para cada pasta que o seed não conseguiu vincular
  a um perfil (ela fica não atribuída); em todos os boots seguintes que ainda encontrem chaves
  `Storage:Inputs[].Profile`, uma linha informando que elas são ignoradas; e em qualquer boot, uma linha
  para cada perfil vinculado a uma pasta que este host não configurou. Os três casos são resolvidos na
  página do perfil — veja
  [Roteando uma pasta monitorada para um perfil de assinatura](#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura).

### Execuções em console em primeiro plano: dashboard ao vivo

Quando o serviço é executado em primeiro plano em um terminal interativo, o fluxo contínuo de log é
substituído por um painel ao vivo, atualizado no lugar, que mostra o estado de pausa, o tamanho da fila,
a contagem em andamento com o detalhamento por formato, os totais de concluídos/falhos/cancelados desde
o boot, o uptime e o endereço de escuta. Implantações hospedadas como serviço (serviço do Windows, systemd,
Docker) não são afetadas. Veja
[Dashboard no console](dashboard.md#dashboard-no-console-somente-execuções-em-primeiro-plano).

## Resumo de observabilidade

| Fonte | O que você obtém |
|------------|------------------|
| `journalctl -u bulksigner` / Visualizador de Eventos / `docker compose logs` | Bootstrap, eventos de ciclo de vida, erros fatais, saída padrão |
| `/var/log/bulksigner/bulksigner-yyyyMMdd.log` (etc.) | O log estruturado durável; segredos mascarados |
| `GET /api/metrics` | Exposição Prometheus — veja [API REST](rest-api.md#métricas) |
| `GET /api/ready` | Veredito de prontidão por probe (banco operacional, pastas de entrada, licença, …): o nome e o `ok` de cada verificação, sem detalhe |
| `GET /api/ready/details` | Os mesmos probes, com o detalhe de cada verificação; exige a chave de API ou uma sessão de operador |
| Página `/events` do dashboard / `GET /api/events` | O log de eventos operacionais — pausa e retomada, edições de perfil, decisões de aprovação, assunções, exclusões de job, Limpar Jobs, desligamento do serviço —, do mais novo para o mais antigo, com filtro por tipo, intervalo de datas e texto |
| Página Sistema do dashboard | Impressão digital da licença, origem do certificado, tamanho da fila, estado de pausa, último desligamento e um card **Eventos recentes** com os dez mais novos |
| Histórico de jobs (no banco de dados) | Uma linha por transição de estado, para cada job |

## Tarefas rotineiras do operador

| Tarefa | Onde |
|--------|------|
| Acompanhar a entrada ao vivo | Card "Status do pipeline" do dashboard ou `tail -f bulksigner-*.log` |
| Investigar uma falha | Detalhe do job no dashboard → linha do tempo → clique na mensagem de erro; ou `error/<jobid>/` em disco |
| Reexecutar um job que falhou | Botão **Tentar novamente** do dashboard ou `POST /api/jobs/{id}/retry` — com o perfil que o job registrou, e não com o atual da pasta |
| Rotear uma pasta monitorada para um perfil de assinatura, ou movê-la | Página do perfil → **Editar comportamento** → **Pasta de entrada**; nunca um arquivo de configuração. Veja [Roteando uma pasta monitorada para um perfil de assinatura](#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura) |
| Descobrir por que os arquivos de uma pasta não andam | Página Pastas de entrada: um chip cinza `sem perfil — nenhum perfil escolheu esta pasta` significa exatamente isso — escolha a pasta na página de um perfil; um chip vermelho `stopped` é [uma falha do observador](#isolamento-de-falhas-do-observador-por-pasta) |
| Aceitar um nome de arquivo de novo | Exclua em `/jobs` o job que o detém; veja [Excluindo um job](#excluindo-um-job) |
| Descobrir quem pausou o pipeline, alterou um perfil, decidiu uma aprovação ou limpou os jobs | `/events` no dashboard, ou `GET /api/events` |
| Planejar uma indisponibilidade | `POST /api/pipeline/pause` com um `reason`; espere os jobs em andamento terminarem; então pare o serviço |
| Aplicar uma atualização | Faça backup do banco operacional (`db/bulksigner.db` com SQLite, o backup do seu próprio banco com SQL Server), rode o script de instalação com o novo pacote e acompanhe o banner de bootstrap |
| Apagar todos os jobs e seus arquivos | Sistema no dashboard → Zona de perigo → **Limpar Jobs** (ou `DELETE /api/jobs`); veja [Limpar Jobs](#limpar-jobs) — irreversível, e os jobs não finalizados e os eventos operacionais também são removidos |

Veja [Diagnóstico de problemas](troubleshooting.md) para o catálogo de modos de falha.

---

**A seguir:** [Dashboard](dashboard.md) — a interface do operador.
**Anterior:** [Segurança](security.md).
