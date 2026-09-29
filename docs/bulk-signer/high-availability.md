---
sidebar_label: "Alta disponibilidade e seus limites"
sidebar_position: 2.6
---

# Alta disponibilidade e seus limites

O modo cluster executa mais de uma instância ativa sobre um mesmo banco de dados operacional e um mesmo
compartilhamento de trabalho. O que ele oferece são as três coisas que se esperavam da funcionalidade:
um job nunca é processado por duas instâncias ao mesmo tempo, a morte de uma instância não deixa
trabalho travado para sempre, e o pipeline continua assinando enquanto um host está fora do ar.

Esta página é a outra metade dessa história — **o que ele não oferece**, dito de antemão, em vez de
descoberto durante uma janela de mudança. Tudo aqui se aplica somente quando `Cluster:Enabled` é
verdadeiro. Com o modo desligado — caso de toda implantação que não o ligou deliberadamente —, nada
disso está em vigor, e o produto continua sendo o de instância única que sempre foi.

O passo a passo de implantação está em [Azure App Service (modo cluster)](azure.md); a visão do operador
no dia a dia, em [Operação](operations.md#quais-instâncias-estão-vivas-somente-no-modo-cluster); o
catálogo de falhas, em [Diagnóstico de problemas](troubleshooting.md#modo-cluster).

---

## Uma única topologia suportada

Um **Azure Web App, container Linux, a imagem existente, com escala horizontal em um App Service
Plan.** Só isso.

Os mecanismos não sabem disso. Toda a coordenação passa pelo banco operacional e pelo compartilhamento
de trabalho, e nada é específico do App Service além da derivação de identidade e desta documentação —
de modo que duas VMs on-premises apontando para um SQL Server rodariam o mesmo código. Essa variação é
**não documentada, não testada e não suportada**, e três mecanismos que só existiriam para esse formato
deliberadamente não foram construídos: impressões digitais de configuração, nomes de instância
atribuídos pelo operador e indireção de nome de certificado por host.

Uma característica do App Service resolve boa parte do problema e é o motivo de a lista ter um único
item: **os app settings são por app, não por instância**, então todas as instâncias são idênticas por
construção. Os riscos de divergência de configuração entre instâncias — uma senha de criptografia
diferente entre hosts, um perfil de assinatura que uma instância desconhece — não podem ocorrer aqui.
Em uma topologia em que podem ocorrer, eles não são tratados.

## Atualizações exigem parada total

Pare o app, implante, inicie. Não há reinício gradual (rolling restart), não há caminho sem
indisponibilidade e **não há deployment slots**.

Um slot de staging com a connection string de produção não é um ambiente de staging — é um segundo
conjunto de instâncias entrando no cluster com outra versão da aplicação e compartilhando a fila de
jobs, a tabela de heartbeat e o compartilhamento de trabalho com a versão que você ainda está rodando. O
swap não cria a condição; o primeiro boot do slot já a cria.

A versão registrada no heartbeat é o **alarme, e não uma verificação que bloqueia**: uma instância que
sobe e encontra heartbeats ativos de outra versão registra um Critical e segue em frente. Isso é
deliberado. Uma recusa rígida impediria as instâncias de subir por todo o tempo que um heartbeat *morto*
da versão antiga levasse para ficar sem sinal — que é exatamente o momento em que um operador precisa
que elas subam, porque é o momento seguinte a uma implantação que falhou.

Portanto, versões mistas são detectadas e informadas, mas nunca impedidas. Trate o Critical como o
alarme que ele é.

**Trocar a imagem in-place é tolerado, mas não é o procedimento recomendado.** Desde a 2.5.0, trocar a
imagem de um app em execução (`az webapp config container set`) não resulta mais em uma inicialização
recusada. O App Service inicia o novo container ao lado do antigo, sob o mesmo id de instância, e mantém
o antigo atendendo até que o novo esteja aquecido; o novo container **desloca** o antigo, que se
retira — termina o que detém e não reivindica nada novo — e informa isso no próprio log, com um evento
`InstanceStoodDown` e na própria página Sistema. Veja
[Operação](operations.md#quando-um-boot-encontra-a-própria-identidade-ainda-viva). Uma instância que é
desligada de forma limpa aposenta a própria linha de heartbeat (desde a 2.4.3); então, depois de
*parar, trocar, iniciar*, não há nada a deslocar, e é por isso que esse continua sendo o procedimento
de implantação mais limpo.

**Uma implantação que falha derruba o site, e voltar para a tag anterior é a forma de recuperação.** Se
o novo container falha no aquecimento depois de deslocar o antigo, o App Service não continua roteando
para o container antigo: ele para o **site inteiro**, inclusive o container que se retirou, e continua
reiniciando-o com a imagem nova. Nada que o produto faça consegue impedir isso. Aponte o app de volta
para a tag de imagem anterior com `az webapp config container set`; ele fica pronto de novo em cerca de
dois minutos.

## A afinidade de sessão é obrigatória

O dashboard é Blazor Server, e um circuito é uma conexão SignalR com estado que precisa continuar
chegando à instância que o detém. O App Service vem com a afinidade ARR ligada por padrão, e ela precisa
continuar ligada. Isso é documentado como requisito, em vez de ser contornado no código.

O que a afinidade **não** faz é manter as pessoas autenticadas. Os dois cookies de sessão são payloads
de Data Protection, e no modo cluster o key ring passa para o banco operacional justamente para que um
cookie criado por uma instância seja validado por todas as outras. A afinidade serve ao circuito; o ring
compartilhado serve ao cookie. Desligar o ring compartilhado provocaria encerramentos de sessão
intermitentes que nenhuma configuração de afinidade resolve.

## As cotas do limite de requisições são por instância, então o limite efetivo é ×N

Toda política de limite de requisições (rate limiting) do produto é um limitador por processo. Duas
instâncias significam o dobro de permissões; N instâncias, N vezes mais.

Isso é documentado em vez de corrigido. Um limitador distribuído seria a primeira dependência de
runtime em infraestrutura compartilhada deste produto on-premises, para um controle que é grosseiro por
design, e a conta que mais importa — o argumento do controle compensatório para a rota de aprovação
anônima — foi refeita com o fator ×N e continua válida para o N pequeno com que esta topologia roda. Se
você escalar para além de um punhado de instâncias, refaça essa conta você mesmo em vez de presumir que
ela continua valendo.

Dimensionar uma cota para um cluster significa dividi-la pelo número de instâncias que você de fato
roda — e lembrar que esse número muda quando você escala.

O `Pipeline:MaxConcurrency` se multiplica da mesma forma, e nesse caso isso é uma vantagem, e não uma
limitação: ele é por instância, então uma frota de duas instâncias com concorrência quatro assina até
oito arquivos ao mesmo tempo. Dimensione a origem do certificado para esse número, e não para o valor
configurado.

## A coleta de métricas alcança uma instância arbitrária

O `/api/metrics` é por processo, e o front-end do App Service não consegue direcionar a requisição para
uma instância específica. Uma coleta do Prometheus, portanto, cai na instância que o balanceador de
carga tiver escolhido, e a série coletada pula entre instâncias de uma coleta para outra. **A
continuidade da coleta se perde**, e nenhuma configuração a recupera.

O caminho de observabilidade recomendado para o cluster é a distro do Application Insights — opcional
e nativamente ciente das instâncias. Veja [Telemetria](telemetry.md).

Se você mantiver o Prometheus mesmo assim, dois gauges têm significados definidos por decisão, e não
por dedução, e lê-los de forma errada leva a números subestimados:

- `bulksigner_jobs_awaiting_signer` conta as linhas em que **esta instância** faz polling. A `sum()` na
  frota é o total do cluster, sem contagem dupla, já que um job tem exatamente um dono. Ler a série de
  uma única instância como se fosse o total é o erro previsível.
- O mesmo raciocínio vale para todos os contadores por instância da página. Os números de uma instância
  são apenas daquela instância.

O `GET /api/folders` tem um campo `instance` pelo mesmo motivo, para que um cliente automatizado consiga
ao menos distinguir "a pasta mudou" de "a resposta veio de outra instância".

## Os logs são efêmeros a menos que você os torne duráveis

O disco de um container Linux desaparece na reciclagem, e os arquivos de log rotacionados vão junto. O
diretório `logs/` de `Storage:Root` fica dentro do container.

O modo cluster **avisa e sobe** quando `Logging:AzureTable:Enabled` é falso: um Critical na
inicialização aponta a perda. Ele não recusa o boot, seguindo a própria escala de severidade do
produto — um compartilhamento de trabalho inacessível e um banco inacessível também geram aviso e
deixam subir, e recusar o boot por causa de um fluxo de diagnóstico inverteria essa escala. A regra de
nunca ter um único destino de log permanece intacta, então o destino de arquivo continua ligado de
qualquer forma, em disco efêmero, onde o streaming de logs do App Service o lê ao vivo.

:::warning Ligar o destino de tabela tem um custo próprio, e é uma decisão a tomar *antes* de habilitá-lo
**Nada faz a limpeza dessa tabela**, e nenhum mecanismo do Azure consegue fazer. Veja
[Retenção](retention.md#logs-em-uma-tabela--nada-os-poda) e agende o script de limpeza.
:::

## Uma morte presumida é uma suposição

A detecção de instâncias vivas se baseia em heartbeats no banco operacional. Uma instância que está
**viva, mas não consegue gravá-los** — isolada do banco por uma partição de rede, ou travada além de
`Cluster:StaleAfterSeconds` — pode ter o trabalho assumido enquanto ainda o está executando. O caso
desfavorável é declarado, e não escondido.

O que limita o dano não mudou em relação à operação com uma única instância, e os três mecanismos são
anteriores ao modo cluster:

- O hash dos bytes da cópia preparada é **recalculado imediatamente antes de qualquer assinatura ser gerada**.
- Uma promoção para um destino já ocupado é **recusada** — uma conclusão duplicada vira um job
  `Completed` e um `Failed`, nunca dois artefatos entregues.
- Uma entrada é **comparada com a impressão digital registrada no stage** antes de ser apagada.

Aumente `Cluster:StaleAfterSeconds` quando uma implantação enfrentar isso com frequência. O mínimo é
três vezes a cadência de heartbeat, e valores abaixo disso são recusados no boot, porque um limite tão
curto presume a morte depois de um ou dois heartbeats perdidos, e um heartbeat se perde por motivos que
não são a morte da instância.

O caso inverso também está declarado: uma instância que fica sem sinal para as irmãs **continua
assinando**. Ela não é parada, porque a regra permanente deste produto é que um job em andamento roda
até a conclusão natural. Ela nunca assume os próprios jobs, diga a tabela o que disser.

**A mesma janela define a frequência da pergunta sobre uma instância deslocada.** Depois da sobreposição
de uma reimplantação, passada a janela, a varredura do novo container pergunta ao banco pelos jobs que a
encarnação deslocada deixou para trás. Depois que essa pergunta volta vazia, ela é repetida uma vez a
cada `Cluster:StaleAfterSeconds`, e não a cada ciclo de polling (desde a 2.8.0) — no App Service, toda
troca de versão tem sobreposição, então o registro de deslocamento nunca é limpo. O custo é que, se um
processo deslocado nunca se retirou e reivindica um job tardiamente, esse job é assumido em até uma
janela mais um ciclo de polling, e não em um ciclo de polling — a mesma suposição descrita acima, e não
uma nova.

## Linhas que ninguém possui não são reconciliadas por ninguém

Uma linha de job **sem dono** — deixada por uma build anterior à coluna de dono, ou por uma execução com
o modo desligado — é uma linha que o modo cluster jamais varrerá. A recuperação no boot só considera a
identidade da própria instância, a de uma irmã só considera a dela, e a assunção se baseia no heartbeat
de um dono, que nesse caso não existe.

Isso é informado em vez de adotado. Adotar significaria um filtro que casa com nulo, e esse filtro
casaria em *todas* as instâncias ao mesmo tempo — o defeito que a funcionalidade elimina, voltando pelo
próprio código que o elimina.

:::note A solução existe, e é indicada em todos os lugares que encontram uma dessas linhas
**Suba uma vez com `Cluster:Enabled = false`**, o que varre todas as linhas em andamento, seja quem for
o dono, e então religue o modo. Faça isso uma vez na atualização, antes do primeiro boot em cluster, e
a questão deixa de existir — o dono é registrado em toda reivindicação, com o modo ligado ou não, e só é
*lido* com o modo ligado.
:::

Dois pontos específicos merecem ficar por escrito, porque são piores do que parecem:

- **Um job despachado ao Lacuna Signer sem dono não recebe polling de ninguém e não expira mais.** O
  `Signer:TimeoutHours` é aplicado enquanto uma linha recebe polling; então, uma linha que ninguém
  consulta é uma linha sem limite algum. Restringir o polling às linhas com dono eliminou o último
  caminho que levava um job assim a um estado terminal. O worker de polling avisa isso uma vez por
  processo e informa a quantidade.
- **Uma linha detida por uma instância *nomeada* que não tem linha de heartbeat nenhuma** fica órfã do
  mesmo jeito e exige a mesma solução. A ausência de heartbeat não é prova de morte — um dono sem linha
  é informado uma vez e deixado como está, em vez de ser interpretado como permissão para fazer falhar o
  trabalho vivo de alguém.

## Não existe drenagem por instância

Você não pode pedir à instância B que termine o que tem e pare de pegar trabalho novo. O
`POST /api/pipeline/pause` retém o worker de **todas** as instâncias — a flag de pausa fica na única
linha que todo worker lê a cada iteração de polling, então o controle existente passa a valer para o
cluster inteiro, e é isso que um operador que pausa "o pipeline" pretende.

A resposta para "aplicar um patch na instância B" é pará-la e deixar a assunção fazer o seu trabalho. A
drenagem por instância deliberadamente não foi construída.

Uma consequência de a pausa valer para o cluster inteiro merece ser conhecida: **a assunção fica sujeita
à pausa.** Um operador que pausa um cluster para investigar um banco que ficou lento é exatamente a
pessoa que não pode ver todas as instâncias declarando mortas todas as irmãs. Já a varredura de
expiração de aprovações não é afetada pela pausa, porque um prazo de espera é contado em tempo de
relógio, e pausar não o estende.

## A latência entre instâncias é o intervalo de polling

O sinal de despertar é local ao processo. Um enfileiramento na instância A não acorda o worker da
instância B; B pega o job no próximo ciclo de polling. O `Pipeline:PollIntervalSeconds` é, portanto, o
limite de latência entre as instâncias do cluster — aceito e documentado, e não contornado no código.

**A edição de um perfil de assinatura segue o mesmo limite, por projeto.** Os perfis de assinatura ficam
no banco operacional e são editados pelo dashboard; uma gravação de perfil incrementa um contador no
banco, dentro da própria transação, e todas as instâncias leem esse contador no polling que já fazem —
então, uma mudança feita na instância A chega à instância B em um intervalo de polling, sem nenhum canal
de mensagens entre elas para configurar, proteger ou depurar. O que se propaga é o *comportamento*:
formato, verificação, criptografia, verificação CNAB240 e toda a regra de aprovação. Uma mudança de
**certificado** não se propaga, em nenhuma instância: cada host abre o seu certificado uma vez na
inicialização e mantém o handle da chave, então trocar um certificado exige um reinício — nesta
topologia, o reinício com parada total descrito acima.

Duas consequências a esperar:

- **Entre a edição de um certificado e o reinício, duas instâncias podem legitimamente informar origens
  diferentes para o mesmo perfil** — cada uma indicando a chave com que assinaria, que é também a origem
  que ela registra nos jobs que assina. Uma coleta ou uma requisição ao dashboard cai em uma instância
  arbitrária, então leia a resposta como "o que assinaria aqui", e não como "o que a linha diz".
- **O indicador de reinício pendente que uma edição de certificado aciona é por instância, e é fiel.**
  Uma instância que já reiniciou não mostra nada, e uma que não reiniciou mostra o indicador — ambas
  corretas sobre si mesmas —, o que torna legível uma reciclagem parcial. No reinício com parada total,
  todas as instâncias perdem o indicador ao mesmo tempo.

**Duas origens de certificado não podem ser escolhidas nesta topologia.** Um token PKCS#11 e o
repositório de certificados do Windows do próprio host ficam em uma única máquina, e estas instâncias
são criadas e destruídas por operações de escala — então criar um perfil com qualquer uma dessas
origens, ou mudar um perfil para elas, é recusado no formulário enquanto `Cluster:Enabled` estiver
ligado. Uma configuração que declare uma delas continua sendo recusada no boot. Um perfil **salvo antes
de a chave ser ligada** é o único caso que nenhuma das duas verificações pega: nada revalida um perfil
armazenado, então ele gera um aviso na inicialização, com o nome do perfil e a origem. Espere que isso
pareça assimétrico na frota: a instância que tem o token assina e avisa, enquanto todas as instâncias
sem ele informam o perfil como degradado e fazem falhar os jobs roteados para ele.

A mesma localidade é o que faz a reingestão continuar funcionando sem custo extra: no esquema em que
todas as instâncias monitoram todas as pastas, a instância que termina um job sempre monitora a pasta de
onde ele veio, então o sinal local ao processo ainda chega a um observador responsável por aquele
caminho.

## A verificação do compartilhamento de trabalho cobre menos do que a catástrofe que motivou sua criação

O marcador vincula um compartilhamento de trabalho a um banco operacional, e uma instância que sobe com
um banco que não corresponde ao marcador se recusa a iniciar, indicando os dois. Isso pega o cenário para
o qual ele existe: uma segunda implantação encontrando um compartilhamento que um cluster já
estabelecido marcou.

O que ele não pega é qualquer momento em que o marcador esteja **ilegível**, porque ele só recusa diante
de evidência, e nunca diante da falta dela. Existem dois desses momentos — um compartilhamento que ainda
não tem marcador, e o instante de uma gravação de identificação no Azure Files, em que o arquivo fica
brevemente preenchido com zeros. Os dois são reduzidos, mas não eliminados, por uma verificação extra
quando um lease está detido. Uma verificação que roda uma única vez no boot também não consegue
enxergar um cluster rival que apareça depois.

E essa verificação **não** é o que impede duas instâncias de assinarem o mesmo arquivo. Isso é feito
pelo lease por arquivo e pela reivindicação no banco. O marcador existe para a única catástrofe que
banco de dados nenhum consegue enxergar: dois bancos, um compartilhamento.

## O backup de banco de dados não está disponível aqui

`Backup:Enabled = true` com `Database:Provider = SqlServer` é recusado no boot, com uma mensagem que
cita as duas chaves — e o modo cluster exige `SqlServer`. Portanto, essa combinação é impossível por
construção, o que é uma consequência conveniente, e não uma lacuna: a trava de backup por processo não
precisa de um substituto distribuído.

Nesta topologia, fazer backup do banco operacional cabe à rotina do seu SGBD. O point-in-time restore
do próprio Azure SQL é a resposta, e não uma funcionalidade deste produto. Veja
[Retenção](retention.md#disciplina-de-backup).

## O key ring de sessão fica em texto claro no banco

No modo cluster, o ring de Data Protection são linhas em `SessionProtectionKeys`, em texto claro,
protegidas pelo controle de acesso do próprio banco de dados — coerente com um modelo de segurança em
que a connection string **é** a credencial e em que o acesso de leitura a `keys/` já está documentado
como "uma sessão como qualquer pessoa".

Duas coisas decorrem disso, e a segunda é a que passa despercebida com facilidade:

- **O encriptador DPAPI do Windows é descartado com a chave ligada.** O DPAPI com escopo de máquina é
  justamente a propriedade que torna uma cópia de `keys/` inútil em outro host — e justamente a
  propriedade que torna um ring ilegível para uma irmã, de modo que mantê-lo seria manter o defeito. No
  Windows, isso deixa o ring mais fraco em repouso. Não custa nada na topologia suportada, cujo
  container Linux também não tem criptografia em repouso para o ring em disco, e é o único ponto em que
  ligar o modo troca um controle por outro, em vez de acrescentar um.
- **Um banco inacessível faz a requisição falhar, sem alternativa.** Um host que não conseguisse chegar
  ao banco e criasse sessões silenciosamente a partir de um ring por instância emitiria cookies que as
  irmãs rejeitam — o encerramento de sessão intermitente que o ring compartilhado elimina, voltando pelo
  próprio código que o elimina. Essa falha aparece como a exceção do próprio provider no caminho da
  requisição, e não como uma recusa diagnosticada que cita o ring. A condição é informada onde é
  diagnosticada: na verificação de boot e na linha `database` por instância do `/api/ready`.

Uma observação sobre o primeiro boot, registrada para que não seja interpretada como falha: instâncias
que iniciam juntas encontram todas um ring vazio, então várias podem criar um elemento antes que
qualquer uma tenha lido o da outra, e a tabela pode ter mais elementos do que houve rotações de chave.
Não há nada de errado nisso.

## A contenção tem um custo, e ele é pequeno

Duas instâncias que reivindicam jobs da mesma fila entram em conflito com frequência, e a reivindicação
em lote passa a reivindicar um job por vez, com a disputa perdida registrada no log. No modo cluster,
essa linha de log é rebaixada ao nível de desfecho esperado, com um id de evento próprio — "uma irmã
chegou primeiro" e "outro componente desta instância chegou primeiro" são fatos diferentes para quem lê.

Relacionados, e deliberadamente **não** tratados como falha: um conflito de lease em uma entrada e um
desfecho de enfileiramento `AlreadyActive`. Todas as instâncias monitoram todas as pastas, então perder
uma disputa é rotina — nenhum dos dois conta para o disjuntor de falhas consecutivas de uma pasta, e um
desfecho `AlreadyActive` zera o contador exatamente como um enfileiramento bem-sucedido. Veja
[Operação](operations.md#contenção-entre-instâncias-não-é-uma-falha).

## O que o modo cluster não muda

Esta lista existe porque cada item é uma regra que alguém poderia razoavelmente esperar que uma
funcionalidade de cluster tivesse flexibilizado, e nenhuma delas foi flexibilizada:

- **Sem repetição automática de assinaturas.** Uma assinatura nunca é tentada de novo sem que uma pessoa
  decida isso. A política de assunção segue essa fronteira deliberadamente: um job que nunca chegou à
  chamada de assinatura é reenfileirado porque *nada foi tentado*; um job que passou dela falha.
  `Failed` é um desfecho terminal honesto, não "travado", e a nova tentativa manual do operador continua
  sendo a forma de repetir.
- **Jobs em andamento são intocáveis.** O `POST /api/jobs/{id}/cancel` só é válido para jobs que nenhum
  worker está executando — `Queued`, `AwaitingSigner` e `AwaitingApproval` —, em todas as instâncias.
- **As pastas monitoradas continuam na configuração; os perfis de assinatura, não mais.** Mover os
  perfis para o banco de dados chegou a ser considerado como pré-requisito para o cluster e foi
  descartado quando a topologia se definiu, porque o App Service garante consistência entre instâncias
  por construção. Depois, a mudança veio por mérito próprio: os perfis são linhas no banco operacional,
  editadas pelo dashboard, o que transfere a edição dos pools de aprovadores do acesso a arquivos do host
  para a autorização do dashboard. O que isso acrescenta aqui é o limite de propagação descrito acima e
  nada mais — nenhuma topologia nova e nenhuma coordenação entre instâncias. As pastas monitoradas
  continuam sendo configuração, e todas as instâncias continuam monitorando todas as pastas.
- **A etapa de aprovação não mudou.** A regra continua sendo fixada no job no momento em que ele fica
  retido, uma rejeição continua sendo um veto, e o hash dos bytes da cópia preparada continua sendo recalculado
  antes de qualquer assinatura ser gerada.
- **O Limpar Jobs remove todos os jobs, inclusive os de uma irmã — por decisão, e não por omissão.** Da
  2.0.0 à 2.8.x, ele só removia jobs em estado terminal, para todo mundo, porque apagar a linha de um
  job que uma irmã estava executando era a ação de operador mais arriscada do inventário. Desde a 2.9.0,
  ele apaga todos os jobs, qualquer que seja o status: um operador que limpa o sistema pela zona de
  perigo limpou, de propósito, um sistema com um job dentro, e o diálogo avisa isso. O worker do job
  abandonado o marca como falho, não encontra a linha e registra as duas coisas no log — e é o lease por
  arquivo, e não esta ação, que continua impedindo duas instâncias de assinarem o mesmo arquivo. Veja
  [Limpar Jobs](operations.md#limpar-jobs).

## O que não é uma limitação, apesar de parecer

- **A pausa vale para o cluster inteiro.** Uma chamada retém todas as instâncias, que é o que um
  operador quer dizer ao pausar "o pipeline".
- **As estatísticas valem para o cluster inteiro.** Elas passaram para o banco operacional e são
  calculadas na leitura, então o painel descreve a frota, e não a instância que por acaso respondeu. O
  que era excluído antes continua excluído: as esperas pelo assinante e pela aprovação, e o uso de
  `QueuedAt`, e não de `CreatedAt`, como referência da espera na fila. Veja
  [Estatísticas de jobs](statistics.md).
- **Links de aprovador, segundos fatores e sessões funcionam entre instâncias.** A janela de verificação
  fica no banco operacional, indexada por um identificador que vai dentro do cookie, algo que é
  inteiramente anterior ao cluster — de modo que uma janela aberta por uma instância é respeitada por
  outra sem nada a acrescentar.

---

Relacionados: [Azure App Service (modo cluster)](azure.md) · [Instalação](installation.md) ·
[Configuração](configuration.md#cluster--implantação-com-múltiplas-instâncias) ·
[Operação](operations.md#quais-instâncias-estão-vivas-somente-no-modo-cluster) ·
[Diagnóstico de problemas](troubleshooting.md#modo-cluster)
