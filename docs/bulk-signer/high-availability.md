---
sidebar_label: "Alta disponibilidade e seus limites"
sidebar_position: 2.6
---

# Alta disponibilidade e seus limites

O modo cluster executa mais de uma instância ativa sobre uma base operacional e um compartilhamento de
trabalho. O que ele compra são as três coisas que foram pedidas da funcionalidade: um job nunca é
processado por duas instâncias ao mesmo tempo, uma instância morrendo não deixa trabalho travado
permanentemente, e o pipeline continua assinando enquanto um host está fora.

Esta página é a outra metade daquela frase — **o que ele não compra**, dito de antemão em vez de
descoberto numa janela de mudança. Tudo aqui se aplica somente onde `Cluster:Enabled` é verdadeiro.
Desligado, que é toda implantação que não o ligou deliberadamente, nada disso está em vigor e o produto
é o de instância única que ele sempre foi.

O passo a passo de implantação é [Azure App Service (modo cluster)](azure.md); a visão do operador no
dia a dia é [Operação](operations.md#quais-instâncias-estão-vivas-somente-no-modo-cluster); o catálogo
de falhas é [Diagnóstico de problemas](troubleshooting.md#modo-cluster).

---

## Uma única topologia suportada

Um **Azure Web App, container Linux, a imagem existente, com escala horizontal em um App Service
Plan.** É isso, e nada mais.

Os mecanismos não sabem disso. Tudo se coordena através da base operacional e do compartilhamento de
trabalho, e nada é específico do App Service exceto a derivação de identidade e esta documentação — de
modo que duas VMs *on premises* contra um SQL Server rodariam o mesmo código. Elas são **não
documentadas, não testadas e não suportadas**, e três subdesenhos que existem apenas para aquele
formato deliberadamente não foram construídos: impressões digitais de configuração, nomes de instância
atribuídos pelo operador e indireção de nome de certificado por host.

Um fato sobre o App Service faz boa parte do trabalho e é o motivo de a lista ter um único item: **os
app settings são por app, não por instância**, então cada instância é idêntica por construção. Os
riscos de divergência de configuração entre instâncias — uma senha de criptografia diferente entre
hosts, um perfil de assinatura de que uma instância nunca ouviu falar — não podem ocorrer aqui. Em uma
topologia onde podem, eles não são tratados.

## Atualizações param o mundo

Pare o app, implante, inicie. Não há restart rolante, não há caminho sem indisponibilidade, e **não há
deployment slots**.

Um slot de staging carregando a connection string de produção não é um ambiente de staging — é um
segundo conjunto de instâncias entrando no cluster em uma versão diferente da aplicação, dividindo a
fila de jobs, a tabela de heartbeat e o compartilhamento de trabalho com a versão que você ainda está
rodando. A troca não introduz a condição; o primeiro boot do slot introduz.

A marca de versão no heartbeat é o **fio de alarme, não a guarda**: uma instância subindo que encontre
heartbeats vivos de uma versão diferente registra um Critical e segue em frente. Isso é deliberado. Uma
recusa dura bloquearia instâncias de subir por todo o tempo que um heartbeat *morto* da versão antiga
levasse para ficar obsoleto — que é exatamente o momento em que um operador precisa que elas subam,
porque é o momento seguinte a uma implantação que falhou.

Portanto versões mistas são detectadas e reportadas, nunca impedidas. Trate o Critical como o alarme que
ele é.

## A afinidade de sessão é obrigatória

O dashboard é Blazor Server, e um circuito é uma conexão SignalR com estado que precisa continuar
caindo na instância que o detém. O App Service entrega a afinidade ARR ligada por padrão, e ela precisa
continuar ligada. Isso é documentado como requisito em vez de contornado por engenharia.

O que a afinidade **não** está fazendo é manter as pessoas autenticadas. Ambos os cookies de sessão são
payloads de Data Protection, e no modo cluster o key ring migra para a base operacional precisamente
para que um cookie criado por uma instância seja validado por todas as outras. A afinidade é para o
circuito; o ring compartilhado é para o cookie. Desligar o ring produziria desconexões intermitentes que
configuração de afinidade nenhuma resolve.

## Os orçamentos de limitação de taxa são por instância, então o limite efetivo é ×N

Toda política de limitação de taxa do produto é um limitador por processo. Duas instâncias significam o
dobro de permissões; N instâncias significam N vezes.

Isso é documentado em vez de corrigido. Um limitador distribuído seria a primeira dependência de
runtime em infraestrutura compartilhada deste produto *on premises*, para um controle que é grosseiro
por design, e a aritmética que mais importa — o argumento de controle compensatório para a rota de
aprovação anônima — foi relida com o fator ×N e sobrevive no N pequeno em que esta topologia roda. Se
você escalar além de um punhado de instâncias, releia-a você mesmo em vez de presumir que ela continua
válida.

Dimensionar um orçamento para um cluster significa dividir pela contagem de instâncias que você de fato
roda — e lembrar que a contagem de instâncias muda quando você escala.

O `Pipeline:MaxConcurrency` se multiplica da mesma forma, e esse é uma funcionalidade em vez de uma
limitação: ele é por instância, então uma frota de duas com concorrência quatro assina até oito
arquivos ao mesmo tempo. Dimensione a origem do certificado para esse número, não para o configurado.

## A coleta de métricas alcança uma instância arbitrária

O `/api/metrics` é por processo, e o front door do App Service não consegue mirar uma instância. Uma
coleta do Prometheus, portanto, cai em qualquer instância que o balanceador de carga tenha escolhido, e
a série que ela coleta pula entre instâncias de uma coleta para outra. **A continuidade da coleta
quebra**, e configuração nenhuma a recupera.

O caminho de observabilidade recomendado para cluster é a distro do Application Insights — opcional,
nativamente ciente de instâncias. Veja [Telemetria](telemetry.md).

Se você mantiver o Prometheus mesmo assim, dois gauges têm significados decididos em vez de inferidos, e
lê-los errado subestima:

- `bulksigner_jobs_awaiting_signer` conta as linhas que **esta instância** consulta. `sum()` sobre a
  frota é o total do cluster sem nada contado em dobro, já que um job tem exatamente um dono. Ler a
  série de uma única instância como o total é o erro a se esperar.
- O mesmo formato vale para todo contador por instância da página. Os números de uma instância são de
  uma instância.

O `GET /api/folders` carrega um campo `instance` pelo mesmo motivo, para que um cliente de máquina
consiga ao menos distinguir "a pasta mudou" de "a resposta veio de outro lugar".

## Os logs são efêmeros a menos que você os torne duráveis

O disco de um container Linux desaparece na reciclagem, e os arquivos de log rotacionados junto com ele.
O diretório `logs/` de `Storage:Root` fica dentro do container.

O modo cluster **avisa e sobe** quando `Logging:AzureTable:Enabled` é falso: um Critical na
inicialização nomeando a perda. Ele não recusa, seguindo o próprio gradiente de severidade do produto —
um compartilhamento de trabalho inalcançável e uma base inalcançável também avisam e sobem, e uma recusa
de boot por causa de um fluxo de diagnóstico inverteria isso. A regra de nunca-um-único-destino
permanece intocada, então o destino de arquivo continua ligado de qualquer forma, em disco efêmero, onde
o streaming de logs do App Service o lê ao vivo.

:::warning Ligar o destino de tabela tem seu próprio custo, e é uma decisão a tomar *antes* de habilitá-lo
**Nada poda aquela tabela** e nenhum mecanismo do Azure consegue. Veja
[Retenção](retention.md#logs-em-uma-tabela--nada-os-poda) e agende o script de poda.
:::

## Uma morte presumida é uma aposta

A vivacidade são heartbeats na base operacional. Uma instância que está **viva mas não consegue
escrevê-los** — particionada da base, ou travada além de `Cluster:StaleAfterSeconds` — pode ter seu
trabalho assumido enquanto ainda o está fazendo. O caso perdedor é nomeado em vez de escondido.

O que limita o dano não mudou em relação à operação de instância única, e os três mecanismos são
anteriores ao modo cluster:

- Os bytes em stage são **re-hasheados imediatamente antes de qualquer assinatura existir**.
- Uma promoção sobre um destino ocupado é **recusada** — uma conclusão duplicada vira um job
  `Completed` e um `Failed`, nunca dois artefatos entregues.
- Uma entrada é **comparada contra sua impressão digital de staging** antes de ser apagada.

Aumente `Cluster:StaleAfterSeconds` onde uma implantação encontre isso rotineiramente. O piso são três
cadências, recusado no boot abaixo disso, porque um limiar tão curto presume morte a uma ou duas batidas
perdidas, e uma batida se perde por motivos que não são morte.

A imagem espelhada também é declarada: uma instância que fica obsoleta para suas irmãs **continua
assinando**. Ela não é parada, porque a regra permanente deste produto é que um job em andamento roda
até sua conclusão natural. Ela nunca assume seus próprios jobs, diga a tabela o que disser.

## Linhas que ninguém possui não são reconciliadas por ninguém

Uma linha de job sem **nenhum dono** — deixada por uma build anterior à coluna de propriedade, ou por
uma execução com o modo desligado — é uma linha que o modo cluster jamais varrerá. A recuperação de boot
pega apenas a identidade da própria instância, a de uma irmã pega a dela, e a assunção segue o heartbeat
de um dono, do qual não há nenhum.

Isso é reportado em vez de adotado. Adotar significaria um filtro casando com nulo, que casa em *toda*
instância simultaneamente — o defeito que a funcionalidade remove, chegando pelo código que o remove.

:::note O remédio é real, e é nomeado em toda superfície que encontra uma dessas
**Suba uma vez com `Cluster:Enabled = false`**, o que varre toda linha em andamento seja quem for o
dono, e então religue o modo. Faça isso uma vez na atualização, antes do primeiro boot em cluster, e
deixa de ser uma preocupação — o dono é registrado em toda reivindicação, esteja o modo ligado ou não, e
apenas *lido* sob ele.
:::

Dois pontos específicos valem estar por escrito porque são piores do que parecem:

- **Um job despachado ao Lacuna Signer sem dono não é consultado por ninguém e não expira mais.** O
  `Signer:TimeoutHours` é imposto enquanto uma linha está sendo consultada, então uma linha que nada
  consulta é uma linha que nada limita. Restringir a consulta às linhas com dono removeu o último
  caminho terminal que um job assim tinha. O worker de consulta avisa isso uma vez por processo e nomeia
  a contagem.
- **Uma linha detida por uma instância *nomeada* que não tem linha de heartbeat nenhuma** fica órfã do
  mesmo jeito e exige o mesmo remédio. Ausência de heartbeat não é evidência de morte — um dono sem
  linha é reportado uma vez e deixado em paz, em vez de lido como licença para reprovar o trabalho vivo
  de alguém.

## Não existe drenagem por instância

Você não pode pedir à instância B que termine o que tem e pare de pegar trabalho novo. O
`POST /api/pipeline/pause` retém o worker de **toda** instância — a flag de pausa vive na única linha
que todo worker lê a cada iteração de consulta, então "todo o cluster" é o que o controle existente
passa a significar, e é o que um operador pausando "o pipeline" pretende.

A resposta a "aplicar patch na instância B" é pará-la e deixar a assunção fazer seu trabalho. A
drenagem por instância deliberadamente não foi construída.

Uma consequência de a pausa ser de cluster inteiro vale ser conhecida: **a assunção fica atrás do gate
de pausa.** Um operador pausando um cluster para investigar uma base que ficou lenta é exatamente a
pessoa que não pode ter toda instância declarando toda irmã morta. A varredura de expiração de
aprovações fica, em vez disso, à frente do gate, porque um orçamento de espera é um prazo de relógio de
parede que pausar não estende.

## A latência entre instâncias é o intervalo de consulta

O sinal de acordar é local ao processo. Um enfileiramento na instância A não acorda o worker da
instância B; B pega o job na sua próxima consulta. O `Pipeline:PollIntervalSeconds` é, portanto, o
limite de latência entre instâncias do cluster — aceito e documentado, não contornado por engenharia.

A mesma localidade é o que faz a reingestão continuar funcionando de graça: sob o esquema em que todas
monitoram tudo, a instância que termina um job sempre monitora a pasta de onde ele veio, então o sinal
local ao processo ainda alcança um observador que possui aquele caminho.

## O gate do compartilhamento de trabalho é mais estreito que a catástrofe que lhe dá nome

O marcador vincula um compartilhamento de trabalho a uma base operacional, e uma instância subindo cuja
base não corresponde se recusa a iniciar, nomeando ambas. Isso pega o formato para o qual ele existe:
uma segunda implantação encontrando um compartilhamento que um cluster estabelecido já marcou.

O que ele não pega é qualquer momento em que o marcador esteja **ilegível**, porque ele recusa sobre
evidência e nunca sobre a ausência dela. Existem dois desses momentos — um compartilhamento que ainda
não carrega marcador, e o instante de uma escrita de nomeação no Azure Files, em que o arquivo fica
brevemente todo em zeros. Ambos são estreitados por uma olhada extra quando um lease é detido, não
fechados. Uma verificação que roda uma vez no boot também não consegue enxergar um cluster rival que
chegue depois.

E o gate **não** é o que impede duas instâncias de assinarem um arquivo. Quem faz isso são o lease por
arquivo e a reivindicação no banco. O marcador é para a única catástrofe que banco de dados nenhum
consegue enxergar: duas bases, um compartilhamento.

## O backup de banco de dados é inalcançável aqui

`Backup:Enabled = true` sob `Database:Provider = SqlServer` é uma recusa de boot nomeando ambas as
chaves — e o modo cluster exige `SqlServer`. A combinação é, portanto, inalcançável por construção, o
que é uma consequência agradável em vez de uma lacuna: o gate de backup por processo não precisa de
substituto distribuído.

Fazer backup da base operacional nesta topologia é trabalho do regime do seu SGBD. O point-in-time
restore do próprio Azure SQL é a resposta, não uma funcionalidade deste produto. Veja
[Retenção](retention.md#disciplina-de-backup).

## O key ring de sessão fica em texto claro na base

No modo cluster, o ring de Data Protection são linhas em `SessionProtectionKeys`, em texto claro,
guardadas pelo controle de acesso do próprio banco de dados — coerente com um modelo de segurança em
que a connection string **é** a credencial e o acesso de leitura a `keys/` já está documentado como "uma
sessão como qualquer pessoa".

Duas coisas decorrem disso, e a segunda é a fácil de deixar passar:

- **O encriptador DPAPI do Windows é descartado sob a chave.** O DPAPI com escopo de máquina é
  precisamente a propriedade que torna uma cópia de `keys/` inútil em outro host — e precisamente a
  propriedade que torna um ring ilegível para uma irmã, de modo que mantê-lo seria manter o defeito. No
  Windows isso é mais fraco em repouso. Não custa nada na topologia suportada, cujo container Linux
  também não tem criptografia em repouso para o ring em disco, e é o único lugar em que ligar o modo
  troca um controle em vez de acrescentar um.
- **Uma base inalcançável reprova a requisição, sem plano B.** Um host que não conseguisse alcançar a
  base e silenciosamente criasse sessões a partir de um ring por instância emitiria cookies que suas
  irmãs rejeitam — a desconexão intermitente que o ring compartilhado remove, chegando pelo código que a
  remove. Essa falha se parece com a exceção do próprio provider no caminho da requisição, não com uma
  recusa diagnosticada nomeando o ring. A condição é reportada onde é diagnosticada: na verificação de
  boot e na linha `database` por instância do `/api/ready`.

Uma observação de primeiro boot, dita para que não seja lida como falha: instâncias que iniciam juntas
encontram todas um ring vazio, então várias podem criar um elemento antes que qualquer uma tenha lido o
da outra, e a tabela pode carregar mais elementos do que houve rotações de chave. Não há nada de errado
com isso.

## A contenção tem um custo, e ele é pequeno

Duas instâncias reivindicando de uma fila entram em conflito rotineiramente, e a reivindicação em lote
recai para uma de cada vez, com a corrida perdida registrada em log. No modo cluster essa linha é
rebaixada ao nível de desfecho esperado, sob seu próprio id de evento — "uma irmã chegou primeiro" e
"outra coisa nesta instância chegou" são fatos diferentes para um leitor.

Relacionado, e deliberadamente **não** uma falha: um conflito de lease em uma entrada e um desfecho de
enfileiramento `AlreadyActive`. Toda instância monitora toda pasta, então perder uma corrida é rotina —
nenhum dos dois conta para o disjuntor de falhas consecutivas de uma pasta, e um desfecho de já-ativo
zera o contador exatamente como um enfileiramento bem-sucedido faz. Veja
[Operação](operations.md#contenção-entre-instâncias-não-é-uma-falha).

## O que o modo cluster não muda

Listado porque cada item é uma regra que alguém razoavelmente espera que uma funcionalidade de cluster
tenha relaxado, e nenhuma delas foi:

- **Sem repetição automática de assinaturas.** Uma assinatura nunca é retentada sem um humano decidir
  isso. A política de assunção percorre essa borda deliberadamente: um job que nunca chegou à chamada de
  assinatura é reenfileirado porque *nada foi tentado*; um job além dela falha. `Failed` é um desfecho
  terminal honesto, não "travado", e a repetição manual do operador continua sendo a repetição.
- **Jobs em andamento são sagrados.** O `POST /api/jobs/{id}/cancel` é válido apenas para jobs
  `Queued`, em toda instância.
- **Perfis de assinatura e pastas monitoradas continuam na configuração.** Movê-los para o banco de
  dados foi considerado como pré-requisito e descartado quando a topologia se assentou — seu motivo era
  consistência entre instâncias, que o App Service fornece por construção.
- **A etapa de aprovação não mudou.** A regra continua congelada no job no momento da retenção, uma
  rejeição continua sendo um veto, e os bytes em stage continuam sendo re-hasheados antes de qualquer
  assinatura existir.
- **O `ClearJobs` é somente-terminal, e isso valeu para todo mundo.** Ele reporta uma contagem de
  pulados nas duas superfícies. Apagar a linha sob o job de uma irmã em execução era o risco de ação de
  operador mais afiado do inventário — e apagá-la sob o próprio worker em execução já era duvidoso,
  razão pela qual a correção não está condicionada à chave.

## O que não é uma limitação, apesar de parecer

- **A pausa é de cluster inteiro.** Uma chamada retém toda instância, que é o que um operador pausando
  "o pipeline" quer dizer.
- **As estatísticas são de cluster inteiro.** Elas migraram para a base operacional e são computadas na
  leitura, então o painel descreve a frota em vez de qualquer instância que tenha respondido. O que era
  excluído antes continua excluído: as esperas por assinador e por aprovação, e `QueuedAt` em vez de
  `CreatedAt` como âncora da espera na fila. Veja [Estatísticas de jobs](statistics.md).
- **Links de aprovador, segundos fatores e sessões atravessam instâncias.** A janela de verificação vive
  na base operacional, chaveada por um identificador carregado dentro do cookie, o que é inteiramente
  anterior ao cluster — de modo que uma janela aberta por uma instância é honrada por outra sem nada
  acrescentado.

---

Relacionados: [Azure App Service (modo cluster)](azure.md) · [Instalação](installation.md) ·
[Configuração](configuration.md#cluster--implantação-com-múltiplas-instâncias) ·
[Operação](operations.md#quais-instâncias-estão-vivas-somente-no-modo-cluster) ·
[Diagnóstico de problemas](troubleshooting.md#modo-cluster)
