---
sidebar_label: "Dashboard"
sidebar_position: 7
---

# Dashboard

O dashboard do operador é uma aplicação web servida no caminho raiz. Ele lê o mesmo banco de dados que
a API REST e dispara as mesmas ações — há um único conjunto de regras de negócio por trás das duas
interfaces, de modo que uma correção ou mudança chega às duas ao mesmo tempo.

```
http://<host>:8080/
```

Entre uma vez com a `Auth:ApiKey` configurada; a página de login a troca por um cookie de sessão
`SameSite=Strict`.

Quando o login opcional pelo **Microsoft Entra ID** está configurado, o `/login` exibe **Entrar com a
Microsoft** no lugar do formulário da chave de API — o formulário fica desativado, e não apenas
oculto — e as páginas de operador exigem o app role `Administrator`. Sair encerra somente a sessão do
próprio Bulk Signer; por isso, ao entrar de novo, o login acontece sem nenhuma interação — é o
comportamento normal de single sign-on. Veja [Segurança](security.md#modo-de-login-pelo-microsoft-entra-id-opcional).

**Para onde o login leva.** Um link seguido pela pessoa sempre tem prioridade: se o login foi disparado
ao abrir uma página específica, ela volta para essa página. Só quando nenhuma página foi pedida é que o
papel decide — um `Administrator` (inclusive um que também tenha `Approver`) vai para o Painel, e um
login só com `Approver` vai para o [portal do aprovador](#approvals--portal-do-aprovador). Um aprovador
que abre uma página de operador, como `/jobs` ou `/system`, é barrado em `/access-denied`, que explica o
motivo. O destino é só um padrão, não uma barreira: o que mantém quem não é operador fora das páginas de
operador é a autorização dessas páginas.

**A autorização também é aplicada dentro da conexão ao vivo.** Navegar entre páginas do dashboard não
gera uma nova requisição HTTP; por isso, a regra de acesso de cada página também é verificada contra a
identidade autenticada da conexão ao vivo, e uma recusa recarrega a página para que o redirecionamento
normal de login entre em ação. A gaveta de navegação só é exibida para operadores. Desde a 2.2.1, a
conexão ao vivo carrega a identidade do operador — é isso também que permite que os eventos de auditoria
gravados a partir de uma ação no dashboard nomeiem o operador. Uma sessão do dashboard que ficou aberta
durante a atualização de uma versão anterior mantém o tíquete antigo — saia e entre de novo uma vez.
Veja
[Segurança](security.md#o-dashboard-é-cercado-duas-vezes-no-endpoint-e-dentro-do-circuito).

**O logotipo do cliente.** Com um [`Branding:CustomerLogo`](configuration.md#branding--o-logotipo-do-cliente-nas-páginas-de-login-e-de-aprovação)
configurado, o card de login o exibe acima de uma versão reduzida da marca do produto, e as
três páginas de aprovação o exibem ao lado dela; sem ele, as páginas mostram a marca do produto, como
antes. O logotipo é lido uma única vez na inicialização; por isso, um arquivo novo exige apenas uma
reinicialização. Um logotipo configurado que não pôde ser lido **não** impede o serviço de subir: as
páginas voltam a exibir a marca do produto, e o motivo aparece no banner de resumo de prontidão e como
alerta na página **Sistema** — um logotipo ausente é uma falha cosmética, não um motivo para deixar de
assinar.

## Elementos comuns da interface

Toda página tem uma barra superior de aplicativo e uma gaveta de navegação à esquerda:

| Elemento | O que faz |
|----------|-----------|
| Barra de aplicativo (topo) | A **versão em execução**, o seletor de idioma (ícone de globo, veja abaixo), o alternador de tema (claro / escuro) e um menu de conta com Sair. |
| Gaveta (esquerda) | Os links de navegação: Painel, Jobs, Pasta de entrada, Perfis de assinatura, Eventos, Exceções, Backup, Sistema. O link de Exceções fica oculto quando `LogViewer:Enabled = false`. O link de Backup está presente em toda implantação, inclusive nas de SQL Server — veja [`/backup`](#backup--backup-do-banco-de-dados). |
| Indicador de atualização | Um pequeno widget que mostra a hora da última atualização e o intervalo de polling em uso, além de um botão **Atualizar agora**. |

**A versão em execução está na barra de aplicativo em todas as páginas**, de modo que quem relata um
problema já está olhando para ela. A barra mostra a forma curta; a versão informativa completa — que
inclui o SHA do commit acrescentado pelo SDK e não caberia na barra — é o tooltip do elemento *e* o seu
nome acessível, de modo que pode ser vista passando o mouse ou lida por um leitor de tela sem alargar
nada. As telas de diagnóstico a exibem por inteiro: o painel de boot com o resumo de prontidão e o
`/system`. Um rótulo de pré-lançamento nunca é omitido, porque faz parte da identidade da versão, e não é
metadado. A mesma versão também aparece abaixo do banner do console com a marca, a cada inicialização, e
como uma linha no dashboard ao vivo do console.

As páginas ao vivo são atualizadas por um temporizador no servidor, controlado por
`Dashboard:PollIntervalSeconds` (padrão 5). A página de detalhe do job para de fazer polling quando o job
chega a um estado terminal — não faz sentido atualizar uma linha `Completed` ou `Failed`.

**Uma página que parou de atualizar avisa.** Quando um carregamento falha, o que já está na tela é
mantido e o indicador passa a exibir *falha ao atualizar* em vermelho, com o motivo no tooltip e a hora
do último carregamento bem-sucedido. O motivo é a própria mensagem do provedor, com todos os segredos
configurados mascarados pela mesma camada que o log durável usa (veja
[Segurança](security.md#mascaramento-de-logs--duas-camadas)). Se o próprio laço de atualização
automática parar, de modo que a página não vai mais se atualizar sozinha, o indicador também informa
isso. O botão de atualizar está **sempre** disponível, inclusive durante um carregamento: um clique
nesse momento é ignorado, e é o spinner ao lado dele que diz *ainda não*. Todos esses casos também são
registrados no log durável. Uma ação de operador que atinge o timeout — iniciar um backup, salvar um
perfil, o Limpar Jobs — também informa a falha, em vez de voltar silenciosamente para uma página
inalterada.

### Idioma de exibição

As páginas web são exibidas em **inglês americano ou português do Brasil**, conforme a escolha feita em
cada navegador pelo seletor de idioma — na barra de aplicativo, nas páginas de operador; fixo no canto
superior direito, nas páginas de layout simples (`/login` e as páginas de aprovação). A escolha fica
gravada por um ano no cookie de cultura padrão do ASP.NET Core; trocar de idioma recarrega a página
inteira. A ordem de resolução é **cookie → `Accept-Language` do navegador → `en-US`**; assim, um
navegador brasileiro recebe português já na primeira visita, sem nenhuma interação.

Não há chave de configuração — o leitor escolhe, o servidor não.

O que o idioma deliberadamente **não** muda: as frases da trilha de auditoria na linha do tempo do job e
em [`/events`](#events--eventos-operacionais) (a evidência permanece em inglês, exatamente como foi
gravada), os valores trafegados pela API REST (nomes de `JobStatus`, `code`s de problema e o seu texto),
os logs duráveis, o dashboard do console e tudo o que é do CNAB240 — valores em `R$`, datas de pagamento
em `dd/MM/yyyy` e o vocabulário da remessa são propriedades do arquivo, não do leitor.

## `/` — Dashboard

Página inicial. Cards de estatística e os últimos jobs:

| Card | Valor |
|------|-------|
| Na fila | Contagem de jobs em `Queued` |
| Em andamento / Slots ocupados | Quando `Pipeline:MaxConcurrency = 1`: contagem de jobs em `Processing` + `Verifying`. Quando `MaxConcurrency > 1`: renderizado como `N / M slots ocupados`. |
| Em execução há / Há mais tempo em execução | O job em andamento que está há mais tempo com o pipeline, como um contador ao vivo que avança a cada segundo, com o nome do arquivo linkado para a página do job. Medido a partir da captura mais recente do job — ou, em um job que voltou do Lacuna Signer, a partir do download —, de modo que nem a deliberação de um aprovador nem os dias de espera por um signatário entram na conta. Exibido somente enquanto há algo em andamento; rotulado *Há mais tempo em execução* quando `MaxConcurrency > 1`. Não é uma estatística, então não depende de `Statistics:Enabled`. |
| Concluídos (24 h) | Jobs cuja transição para um estado terminal ocorreu nas últimas 24 h |
| Falhas (24 h) | Jobs que falharam nas últimas 24 h |
| Cancelados (24 h) | Jobs cancelados pelo operador nas últimas 24 h |
| Saída criptografada (24 h) | Subconjunto dos jobs concluídos cuja saída foi criptografada |
| Estado do pipeline | "Em execução" ou "Pausado" (clicável, abre a página Sistema) |

Quando `Pipeline:MaxConcurrency > 1`, um pequeno painel **Em processamento por formato** detalha a
contagem em andamento por `Pades` / `Cades` / `Xades`. No modo sequencial (o padrão), o painel fica
oculto.

### Painel de desempenho de processamento

Abaixo dos cards de estatística fica um painel **Desempenho de processamento** com estatísticas de tempo
decorrido por etapa — tempo médio por job, tempo médio de assinatura e de verificação, vazão móvel,
totais mín/média/máx, um detalhamento por etapa, uma divisão entre Local e Remoto e o **job mais
lento**: o job concluído responsável pelo *Máx*, identificado pelo nome e com link para a sua página. Os
números são linhas no banco de dados operacional; por isso, eles **sobrevivem a uma reinicialização**, e,
em um cluster, o painel descreve a implantação inteira, e não a instância que por acaso respondeu à sua
requisição.

O antigo card **Vazão máxima/s** foi aposentado em vez de reformulado: ele media o que acontecia durante
a vida de um único processo, o que, em um cluster, retrataria apenas a sorte de uma instância. A "Vazão
(último min)" responde à pergunta para a qual ele era consultado na maioria das vezes.

O painel fica totalmente oculto quando `Statistics:Enabled = false`. Guia de leitura completo, inclusive
como usar a divisão por etapa para localizar uma lentidão:
[Estatísticas de jobs](statistics.md#o-que-cada-métrica-do-dashboard-significa).

Abaixo disso: um gráfico de vazão das últimas 24 horas e uma tabela dos últimos cinco jobs. Esta página é
uma visão somente leitura — para executar ações, vá para a página Jobs.

## `/jobs` — Jobs

Uma tabela filtrável e paginada de todos os jobs:

| Filtro | Tipo |
|--------|------|
| Status | Um status entre `Queued / Processing / AwaitingApproval / AwaitingSigner / Verifying / Completed / Failed / Canceled`, ou nenhum |
| Perfil | Lista suspensa com todos os perfis de assinatura da implantação — inclusive os desabilitados, já que consultar o que um perfil aposentado assinou é justamente um motivo para mantê-lo. |
| Nome do arquivo contém | Texto livre (busca por trecho) |
| Criado a partir de / Criado até | Dois seletores de data, com os dois dias incluídos |

Paginação no servidor, **50** por página, mais recentes primeiro. As colunas: uma caixa de seleção
(somente em linhas `Completed` — veja abaixo), o nome do arquivo com um chip `enc` quando a saída foi
criptografada, o formato, o nome do perfil resolvido, a origem (Watcher / Upload / Retry), o badge de
status, o chip de **Aprovações** (abaixo), a última atualização e um ícone de download nas linhas
`Completed`. Um clique na linha abre a página de detalhe do job; a caixa de seleção e o ícone de download
não navegam, então usar qualquer um deles mantém você na lista.

Um job em `AwaitingApproval` traz a sua **duração de espera** ao lado do badge de status ("aguardando há
3 h 12 min", com a hora exata em que ficou retido no tooltip): uma espera por aprovação não tem fim
previsto, e há quanto tempo ela dura é o único critério que o operador tem para avaliá-la.

### A coluna de aprovações

Um chip, exibido somente nas linhas `AwaitingApproval`, que mostra quantas pessoas ainda precisam decidir
antes que o arquivo possa ser assinado — assim, uma fila de arquivos de pagamento retidos pode ser
percorrida sem abrir cada um. Um job que nunca chegou à etapa de aprovação não tem regra a mostrar, e um
que já saiu dela tem um desfecho que o badge de status já informa.

| Chip | Quando |
|------|--------|
| *N* pendente(s) (âmbar) | O quórum congelado ainda exige *N* decisões. Passe o mouse para ver "*x* de *y* aprovações registradas, em um grupo de *z*". |
| quórum atingido (verde) | O número necessário de pessoas já aprovou; o job é liberado no próximo ciclo de polling do pipeline. |
| rejeitado (vermelho) | Alguém do pool vetou o arquivo. Uma rejeição é um veto, não uma abstenção, então nenhuma aprovação adicional pode liberá-lo — o chip mostra o desfecho, e não a contagem. A linha foi capturada no intervalo entre o veto e a passagem para `Canceled`. |

Todos os números vêm da regra **congelada no job** no momento em que ele ficou retido e das decisões
registradas sob essa regra — nunca do perfil atual —, pela mesma avaliação usada pela página do
aprovador, pela página do job e pelo `GET /api/jobs/{id}/approvals`. Veja
[Aprovações](approvals.md#a-regra-congelada).

### Baixando as saídas assinadas

Dois controles, ambos oferecidos somente nas linhas `Completed`:

| Controle | O que faz |
|----------|-----------|
| Ícone de download, na linha | O mesmo download `GET /api/jobs/{id}/output` que a página do job oferece, aberto em uma nova aba, sem sair da lista. Quando o perfil criptografa, o envelope `.enc` é entregue como está. |
| Caixa de seleção, na linha; caixa de seleção, no cabeçalho | Seleciona a linha, ou todas as linhas `Completed` da página atual. A seleção vale **somente para esta página** e é limpa a cada troca de página e a cada mudança de filtro, de modo que a contagem no botão sempre corresponde a linhas que você vê marcadas. |
| **Baixar N selecionado(s)**, no cabeçalho | Um único ZIP — o **pacote de saídas assinadas** — com os arquivos assinados dos jobs marcados, pelo `GET /api/jobs/archive`, armazenados sem compressão, com os mesmos nomes que têm em `output/`. Desabilitado enquanto nada está marcado. |

Um job marcado cujo arquivo assinado não está mais em `output/` com o nome esperado — porque foi movido
por um operador ou por uma automação dele, ou porque ficou com um nome anterior depois que a flag
`PreserveFileExtension` ou `SaveAsPem` do perfil mudou após a conclusão do job — é listado, com o id do
job e o nome esperado, em uma entrada `MISSING.txt` dentro do ZIP, e o restante do lote é entregue
normalmente. O download só é recusado com `410 job.output-gone` quando nenhum dos jobs marcados ainda tem
o seu arquivo. O limite é a página — 50 jobs. Se as saídas de dois jobs têm o mesmo nome, ambas entram
no pacote, a mais recente com o id do job antes da extensão. Se uma leitura falhar no meio do caminho, o
navegador informa que a transferência falhou e o arquivo parcial não abre como ZIP — de propósito, em
vez de gerar um pacote bem-formado com um arquivo truncado dentro.

Nenhum dos dois controles grava um evento operacional: um download é uma leitura, e a trilha de
auditoria registra o que alterou um job, nunca quem o consultou. Cada download gera uma linha de log
estruturado com o operador e as contagens. Isto **não** é o download do arquivo bruto negado aos
aprovadores, nem o enfraquece: aquela regra trata de um arquivo de pagamento chegar a um aprovador
identificado por link, enquanto o operador é justamente quem o `output/` existe para atender e já coleta
esses mesmos arquivos de lá.

### Exportando a lista

O botão **Exportar para Excel** do cabeçalho baixa a lista de jobs como uma planilha `.xlsx` — **todos os
jobs que os filtros atuais admitem, e não apenas esta página nem só os marcados** (as seleções pertencem
ao pacote acima). Ele leva os filtros da página — status, perfil, trecho do nome do arquivo e intervalo
de datas de criação —, de modo que a planilha tem exatamente o recorte que a tabela está mostrando, e o
`GET /api/jobs/export` os aplica pela mesma regra usada pela tabela e pelo `GET /api/jobs`. Fica
desabilitado, em vez de oculto, enquanto nenhum job corresponde.

O conteúdo: uma linha por job, mais recentes primeiro — nome do arquivo, formato, perfil, origem, status
(no seu idioma de exibição), criado e atualizado, pasta de entrada, caminho original, o total e a
contagem de pagamentos do CNAB240 quando o job foi interpretado como uma remessa (célula vazia nos demais
casos, nunca `0`), se a saída foi criptografada, a mensagem de erro, o id do job pai e o id do job. Todos
os valores vêm do registro do job; **nenhuma linha de pagamento chega à planilha** — uma linha por
*arquivo*, nunca uma por beneficiário, o mesmo limite que a exportação do portal do aprovador respeita.
Um bloco de título acima da tabela informa quem a gerou, quando (com o offset UTC do servidor), cada
filtro em vigor — ou *Nenhum* — e quantos jobs corresponderam. A exportação é limitada a **10.000
linhas**; quando o limite é atingido, o bloco avisa em vermelho, e o restante é alcançado filtrando por
um intervalo de datas de criação. O conteúdo segue o seu idioma de exibição; o nome do arquivo
(`jobs-yyyyMMdd-HHmmss.xlsx`, em UTC), não.

Assim como o pacote de saídas, a exportação não grava evento operacional e deixa uma linha de log — o
operador, a contagem de linhas, quantos jobs corresponderam e se havia um filtro em vigor; nunca um nome
de arquivo. Ela exige uma credencial de operador e consome a cota `Export` do limite de requisições (rate
limiting), compartilhada com a exportação do portal do aprovador.

### Enviar arquivos

O botão **Enviar arquivos** do cabeçalho é a forma de fazer, pelo dashboard, o upload de um arquivo que
nenhuma pasta monitorada vai entregar — um caso avulso, um teste, um arquivo que um sistema integrado
deixou em outro lugar. Ele abre um diálogo com duas escolhas e uma ação: o **perfil de assinatura**
(somente perfis habilitados, com o `default` pré-selecionado quando está entre eles — um perfil
desabilitado é recusado na ingestão, então oferecê-lo seria oferecer uma recusa), os **arquivos** (um ou
mais, com até `Upload:MaxBytes` cada, valor informado no próprio diálogo) e **Enviar**.

Cada arquivo percorre exatamente o mesmo caminho do `POST /api/files` — o mesmo limite de tamanho, a
mesma sanitização do nome, a mesma cópia para a primeira pasta de entrada com um nome gerado, o mesmo
enfileiramento —, de modo que as duas interfaces não podem responder de forma diferente ao mesmo arquivo,
e um upload pelo dashboard gera um job como qualquer outro. O que o diálogo *não* oferece é o override
`?format=`: decide o formato fixado no perfil ou a extensão do arquivo, como acontece com um arquivo
colocado em uma pasta.

Os arquivos são transferidos um de cada vez, na ordem em que foram escolhidos. Um arquivo é recusado **com
base no tamanho declarado pelo navegador, antes de a transferência começar**, e a transferência depois
fica sujeita ao mesmo teto; assim, um navegador que informa o tamanho errado esbarra no segundo limite, e
não no disco deste host. A falha de um arquivo não interrompe os seguintes. Enquanto o envio está em
andamento, o diálogo não pode ser fechado — nem com Escape, nem clicando fora dele, e o botão Cancelar
fica desabilitado —, porque fechá-lo cancelaria uma transferência que já enfileirou parte dos arquivos,
sem nenhum relatório para dizer quais.

Quando o envio termina, o diálogo se transforma em um **relatório**: uma linha por arquivo, na ordem de
escolha, cada uma dizendo o que aconteceu com ele — *Abrir job* para os enfileirados e o motivo da
recusa, por extenso, para os demais (os mesmos motivos com que a rota REST responde `upload.empty`,
`upload.too-large`, `upload.invalid-name`, `profile.disabled`, `job.path-too-long` ou
`file.already-processed`; uma transferência interrompida mostra *A transferência falhou*, com o detalhe no
log do servidor). Fechar o relatório quando exatamente um arquivo foi escolhido e enfileirado abre a
página desse job; em qualquer outro caso, a lista volta para a primeira página, com os filtros mantidos.
Uma seleção de mais de 100 arquivos é recusada com uma mensagem explicativa, e nada dela é mantido.

**Um host que não aceita uploads não tem o botão.** Com [`Upload:Enabled = false`](configuration.md#upload),
o cabeçalho não exibe nada no lugar do botão, em vez de um controle desabilitado — nada na página
conseguiria reativá-lo. O caminho de upload recusa com base no mesmo valor (`upload.disabled` na rota
REST); portanto, a proteção não depende de o botão estar oculto. As pastas monitoradas, a nova varredura e
a nova tentativa não são afetadas.

A cota `Upload` do limite de requisições por IP se aplica à rota REST, e não a este diálogo: o operador
que o usa já está autenticado.

### Excluindo um job

**Cada linha tem um botão Excluir**, exceto a de um job que um worker está executando (`Processing` /
`Verifying`), que segue até o fim. O botão abre um diálogo de confirmação — que mostra o nome do arquivo e aceita
um motivo opcional — e então exclui o registro e a linha do tempo do job **e os seus arquivos**: o
artefato que o job registrou ter gravado em `output/` (arquivo assinado, envelope `.enc` ou a devolução
`.reject`), as suas pastas em `processing/` e `error/` e o seu arquivo de entrada, quando ele ainda é o
arquivo que o job copiou para processamento e nenhum outro job não finalizado (uma nova tentativa na
fila, por exemplo) ainda faz referência a ele. Um job não finalizado (`Queued`, `AwaitingApproval`,
`AwaitingSigner`) é cancelado primeiro; se um worker o assumir antes disso, nada é excluído.

O log de eventos operacionais mantém uma entrada `JobDeleted` com o que foi removido, o que foi mantido e
um resumo das aprovações que o job tinha. A exclusão é feita uma linha por vez — não existe exclusão em
lote — e não há rota REST para ela.

**Excluir um job também é a forma de um nome de arquivo voltar a ser aceito.** Desde a 2.13.0, um arquivo
que chega com um nome que um job `Completed` ou ainda ativo já possui — comparado em todo o host, sem
diferenciar maiúsculas de minúsculas — é recusado, em vez de ser assinado duas vezes
(`file.already-processed`; ativado por padrão, desativado com
`Pipeline:RejectAlreadyProcessedFileNames = false`). Depois que o job que detém o nome é excluído, um
arquivo com esse nome volta a ser aceito. Veja
[Operação](operations.md#nomes-de-arquivo-já-processados).

## `/jobs/{id}` — Detalhe do job

Card de cabeçalho com nome do arquivo, badge de status, formato, origem, criado/atualizado, link para o
job pai (se este job for uma nova tentativa) e mensagem de erro (se `Failed`).

- **Chip de saída criptografada** — visível somente quando o job foi assinado com a criptografia
  habilitada. Informa aos operadores que o download entregará um envelope `.enc`, e não um artefato
  assinado sem criptografia.
- **Seção Tempo de processamento** — em um job `Completed` com tempos registrados: o total e os tempos
  das quatro etapas (espera na fila, assinatura, verificação, saída) em `hh:mm:ss.fff`, quando o pipeline
  iniciou o job e quando ele foi concluído, com uma legenda que diz se o job foi assinado localmente ou
  pelo Lacuna Signer e que nenhuma espera por uma pessoa entra nos números. Uma etapa que não aconteceu
  aparece como *não executada*. Em um job em `Processing` ou `Verifying`: há quanto tempo o pipeline o
  mantém, ao vivo. A seção não aparece nos demais jobs. `Statistics:Enabled = false` remove o
  detalhamento do job concluído; o contador ao vivo não é uma estatística e continua visível. Veja
  [Estatísticas de jobs](statistics.md#os-números-de-um-único-job).
- **Seção Arquivo de pagamento** — presente somente em jobs interpretados como uma
  [remessa CNAB240](cnab240.md). Mostra o total do arquivo em BRL, a contagem de pagamentos, a contagem
  de exclusões, o intervalo de datas de pagamento e o SHA-256 dos bytes interpretados. As exclusões só
  aparecem como um chip âmbar quando há alguma.
- **Painel de pagamentos** — somente em jobs de arquivo de pagamento: uma tabela paginada com cada
  registro que carrega valor (número do registro, lote, segmento, nome, CPF/CNPJ do beneficiário,
  agência e conta, data de pagamento, valor), com as linhas de exclusão identificadas e riscadas. **Nada
  é mascarado para o operador** — quem investiga um pagamento rejeitado pelo BB precisa exatamente dos
  dígitos que o BB está contestando. Presente somente enquanto o job está em andamento; quando o job
  chega a um estado terminal e o detalhe das linhas é
  [expurgado](retention.md#a-única-exceção-detalhe-de-linhas-do-cnab240), o painel explica o motivo.
- **Seção Aprovação** — presente somente em jobs que ficaram retidos, e continua disponível depois que o
  job chega a um estado terminal (nem o snapshot nem as linhas de aprovação são expurgados). Mostra o
  quórum congelado como um chip "N de M necessários", quantas aprovações já foram registradas, quando o
  job ficou retido, o **conjunto de assinantes** congelado (de quem são as assinaturas que a saída
  carrega), o prazo de espera congelado e o pool de aprovadores — nome, e-mail e CPF — **como estava no
  momento da retenção**, cada linha com a decisão da pessoa, o motivo e quando ela decidiu. O tooltip do
  chip de decisão informa como o aprovador foi identificado (`SelfDeclaredEmail`, `LinkDerivedEmail` ou
  `EntraIdEmail`), e, em uma aprovação registrada por assinatura, a linha do tempo identifica o certificado
  usado, com o CPF mascarado. Editar a regra de aprovação do perfil **não** muda o que é exibido aqui; é
  justamente esse o propósito do snapshot. Um job rejeitado mostra *"2 de 2 aprovações — rejeitado"*, com
  um banner acima do pool explicando por que o job está `Canceled`.
- **Seção Registro de aprovação** — **somente para o operador**, presente enquanto o job está
  `AwaitingApproval`, inclusive quando a seção Aprovação acima não pode ser exibida porque a regra
  congelada está ausente. Ela executa as verificações a que uma decisão de aprovação está sujeita e mostra
  o resultado de cada uma: a regra congelada; o hash do conteúdo registrado; a cópia em processamento em
  `processing/<jobid>/` e se ela ainda confere com esse hash; o CMS em andamento ao lado dela (*não
  verificada* quando não há um, o que é normal a menos que os aprovadores assinem) e se ele envolve o
  conteúdo registrado; e se o thumbprint do certificado de cada linha aprovada pode ser lido. Uma linha
  reprovada é o motivo pelo qual um aprovador é informado de que o registro está incompleto
  (`approval.job-incomplete`), e o painel diz o que fazer: Cancelar e processar de novo, já que nada
  repara um registro nesse estado (veja
  [Diagnóstico de problemas](troubleshooting.md#um-aprovador-é-informado-de-que-o-registro-de-aprovação-está-incompleto)). Quando o hash do conteúdo está ausente, o painel aponta a causa provável — a validação
  CNAB240 do perfil estava desligada quando o job ficou retido, então nada interpretou o arquivo. O
  painel informa a pasta de processamento para que o operador possa examinar os próprios arquivos. A
  inspeção é feita uma vez por visita, porque lê a cópia em processamento e calcula o seu hash;
  **Verificar novamente** a executa de novo.
- **Seção Perfil** — o perfil de assinatura resolvido: nome, formato declarado (ou `auto` para um perfil
  sem formato fixo), origem do certificado e as flags de comportamento `Verify` / `Encrypt` /
  `Validate certificate`. Se o perfil do job não existe mais, é exibido um aviso — o job continua
  visível, mas uma nova tentativa falharia até que o perfil fosse restaurado.
- **Linha do tempo** — cada entrada de histórico em ordem cronológica, uma linha por transição de
  estado, cada uma com o timestamp, o badge de status e o texto da mensagem.

:::note Mudou na 2.9.0 — sem link de aprovação por job
A seção Aprovação exibia o link de aprovação do job (`/approve/{jobId}`) em um campo somente leitura,
para o operador copiar e distribuir. Esse campo foi removido, para todos os leitores. Um aprovador
encontra um arquivo retido na sua própria fila, por um [link do portal](approvals.md#o-portal-do-aprovador)
ou por um login do Entra, e a página do operador não oferece nada para ser repassado. A página anônima em
`/approve/{jobId}` continua existindo e funcionando como [antes](#approveid--aprovação-anônima); só não
é mais oferecida aqui.
:::

Botões de ação (exibidos conforme o status):

| Botão | Visível quando o status é… | O que faz |
|-------|---------------------------|-----------|
| Tentar novamente | `Failed` | Cria um novo job com `ParentJobId = this.Id` e navega para ele. |
| Cancelar | `Queued`, `AwaitingSigner`, `AwaitingApproval` | Primeiro abre um diálogo de confirmação, que mostra o nome do arquivo e diz o que o cancelamento fará com ele a partir do status atual do job; **Manter job**, Escape ou um clique fora do diálogo não cancelam nada. Ao confirmar, move o job para `Canceled`; o monitoramento não recolhe o arquivo de novo automaticamente, e um job cancelado não aceita nova tentativa, então o arquivo precisa de uma nova varredura ou de um novo upload para ser assinado de novo. A partir de `AwaitingSigner`, também tenta cancelar o documento remoto, sem garantia de sucesso; a partir de `AwaitingApproval`, move a cópia em processamento para `error/<jobid>/`. |
| Baixar arquivo de saída | `Completed` | Abre `GET /api/jobs/{id}/output` em uma nova aba. `application/octet-stream` com nome de arquivo `.enc` quando a saída é criptografada; `410 job.output-gone` se o arquivo não está mais em `output/`. A lista de jobs oferece o mesmo download em cada linha `Completed`, além de um ZIP com vários — veja [Baixando as saídas assinadas](#baixando-as-saídas-assinadas). |

Os resultados de Tentar novamente e Cancelar aparecem como um toast — sucesso, aviso (por exemplo,
`job.not-queued`) ou erro. O download é uma navegação; por isso, uma recusa chega na nova aba, como a
resposta de problema da rota.

:::note Esta é a única página que um aprovador também pode abrir
Um aprovador chega aqui pelo chip de contagem na sua [fila](#approvals--portal-do-aprovador), e somente
para um job cujo *pool congelado* o inclui; qualquer outro id de job é recusado com a mesma mensagem
*Job não encontrado.* que um job inexistente recebe. Ele vê o registro, mas nenhum dos recursos do
operador — sem os CPFs dos aprovadores, sem a seção Registro de aprovação e sem Tentar novamente, Cancelar
ou Baixar. A seção Tempo de processamento é exibida para os dois, por ser um registro sobre o job, e não
um recurso.

Todo o resto em `/jobs`, `/input`, `/profiles`, `/events`, `/system` e toda a API REST continua
exclusivo do operador.
:::

## `/input` — Pastas de entrada

Visão operacional de cada pasta configurada em `Storage:Inputs[]`, um card por pasta, mais um botão
global `Reescanear todas`. Cada card mostra:

| Elemento | Valor |
|----------|-------|
| Chip com o nome da pasta | O `Name` de `Storage:Inputs[]`. |
| Chip de status | `em execução` (verde) / `inicializando` (âmbar) / `parado` (vermelho) / `pasta ausente` (vermelho) / `sem perfil — nenhum perfil escolheu esta pasta` (cinza). |
| Chips de perfil | O perfil de assinatura que escolheu esta pasta e o seu formato de assinatura declarado (ou `auto` para um perfil sem formato fixo). O chip do perfil é um link para a página do perfil, que é onde a pasta é escolhida ou trocada. Uma pasta que nenhum perfil escolheu mostra um único chip *sem perfil* no lugar. |
| Caminho monitorado | O caminho **absoluto** em disco. |
| Contagem de arquivos | Número de arquivos aguardando coleta (limitado a 50; exibido como `50+` acima do limite). |
| Total processado | Todos os candidatos que o monitoramento tratou desde o início do processo, qualquer que seja o desfecho. |
| Alerta do último erro | Exibido somente quando o status é `parado`. |
| Botão `Reescanear esta pasta` | Reenfileira somente esta pasta. |

O `Reescanear todas` (no topo da página) reenfileira todas as pastas. O toast informa os totais por pasta
quando há mais de uma pasta configurada e termina com quantas pastas estavam **sem perfil e foram
ignoradas**; ele fica âmbar quando essa contagem é maior que zero, para que uma nova varredura que não fez
nada não seja apresentada como sucesso.

:::warning Mudou na 2.2.0 — um perfil escolhe a sua pasta
O perfil de assinatura de uma pasta não é mais definido na própria pasta, na configuração: cada perfil
escolhe, na sua própria página, a única pasta monitorada da qual recebe arquivos (veja
[`/profiles/{name}`](#profilesname--detalhe-do-perfil-de-assinatura)). O `Storage:Inputs[].Profile` é lido
uma única vez, como dado de seed (carga inicial), no primeiro boot com a tabela de perfis vazia.
**`sem perfil` não é uma falha**: nenhum perfil escolheu a pasta, então nada a está monitorando, e os
arquivos colocados nela esperam até que um perfil a escolha. Isso não afeta a prontidão. Um vínculo alterado na
página de um perfil aparece aqui na próxima recarga.
:::

:::warning
**Um monitoramento parado não volta sozinho.** Quando o limite de falhas consecutivas de enfileiramento
de uma pasta é atingido, o monitoramento dessa pasta é encerrado, enquanto o resto do serviço continua
funcionando. Corrija a causa (montagem, disco, permissões) e reinicie o serviço para restabelecer o
monitoramento.
:::

## `/profiles` — Perfis de assinatura

Desde a 2.1.0, os perfis de assinatura ficam no banco operacional e são criados e editados pelo
dashboard. O `Signing:Profiles[]` na configuração é um **seed de uso único**, lido no primeiro boot com a
tabela de perfis vazia e informado como ignorado depois disso — um banner nesta página avisa, porque
editar aquela seção agora não muda nada. Veja [Configuração](configuration.md).

Esta página lista todos os perfis e traz o único botão que cria um perfil, **Novo perfil**. Não existe
rota REST que grave um perfil; o `GET /api/profiles` apenas os lê. As páginas de perfil exigem uma
**sessão de navegador** de operador — e não apenas um header `X-API-Key` — porque a página de detalhe
exibe os pools de aprovadores por inteiro; um aprovador não tem acesso a elas.

Acima da tabela, dois tipos de situação são descritos com o motivo, e não apenas como um chip:

- **Um perfil que não consegue assinar** (`degradado`), com a mensagem do próprio provedor do
  certificado.
- **Um perfil vinculado a uma pasta que este host não configurou**, com o nome do perfil e da pasta. O
  perfil continua atendendo uploads, mas nenhum arquivo chega para ele de uma pasta neste host. Isso só
  acontece *depois* de um salvamento — o próprio salvamento recusa uma pasta que o host onde se salva não
  tem —, quando uma pasta é renomeada ou removida da configuração, ou em um host do cluster com
  configuração diferente. Para corrigir, configure a pasta neste host ou abra o perfil e escolha outra. O
  banner de inicialização e o `/api/ready/details` mostram a mesma lista.

A tabela:

| Coluna | Valor |
|---|---|
| Perfil | O nome, com um chip `padrão` no perfil usado como último recurso na resolução e um chip `desabilitado` em um perfil que não aceita novos trabalhos. |
| Formato | `Pades` / `Cades` / `Xades`, ou `automático (pela extensão do arquivo)`. |
| Método | `Local` ou `LacunaSigner` — ou *n/a* em um perfil **sem chave** (veja Situação). |
| Certificado | A origem de certificado em vigor — `Pfx` / `Pkcs11` / `WindowsStore` / `AzureKeyVault` — *no assinador remoto* sob `LacunaSigner`, ou *nenhum — os aprovadores assinam* em um perfil sem chave. |
| Verificações | Chips de verificação, cadeia, criptografia e CNAB240, cada um indicando se está ligado ou desligado. O chip de cadeia é omitido sob `LacunaSigner` e em um perfil sem chave, em que essa verificação não se aplica. Só a *verificação* ganha cor quando está desligada: verificação desligada significa que o arquivo de entrada original é apagado com base em uma assinatura que ninguém conferiu, enquanto as outras três vêm desligadas por padrão, e destacá-las acostumaria o operador a ignorar a cor. |
| Aprovação | O quórum e o tamanho do pool, com o conjunto de assinantes e o prazo de espera logo abaixo, ou *nenhuma — assina imediatamente*. |
| Situação | `pronto`, `sem chave` ou `degradado`. `degradado` indica um certificado que não abriu, um perfil cujo comportamento não pôde ser resolvido ou uma linha que entrou no banco depois da inicialização. `sem chave` é um **terceiro estado, e não uma forma de degradação**: o conjunto de assinantes do perfil é `Approvers`, então cada membro do pool que aprova assina com o próprio certificado, e o perfil não tem chave própria. Um chip **Reinício pendente** aparece ao lado de `pronto` ou `degradado` quando o banco guarda uma alteração de certificado que esta instância ainda não abriu. |

Um perfil desabilitado é recusado na ingestão — em pastas, uploads, novas varreduras e novas tentativas —,
enquanto tudo o que já está na fila para ele é processado até o fim. Ele nunca é excluído. Clicar em uma
linha abre o perfil.

## `/profiles/_new` — Novo perfil de assinatura

O formulário de criação de perfil. Tudo nele é preenchido e salvo de uma vez; não existe rascunho.

**O certificado é aberto durante o salvamento**, quando o perfil tem um. Uma senha errada, um cofre
inacessível, um módulo PKCS#11 que este host não tem ou um certificado público que não confere com a chave
do cofre é informado aqui, no formulário, e não pelo primeiro job roteado para o perfil — e **nada é
gravado quando isso falha**. É também o que permite que um perfil novo assine imediatamente, sem
reinicialização. Um perfil que assina no serviço remoto Lacuna Signer não tem chave local, então não há
nada para abrir; a falha equivalente — um participante que o serviço não conhece — aparece com o primeiro
arquivo. Isso também não se aplica a um perfil **sem chave**, em que os aprovadores assinam.

| Campo | Observações |
|---|---|
| Nome | Letras minúsculas, dígitos e hífens no meio do nome, até 40 caracteres. **Não pode ser alterado depois de aceito** — as pastas monitoradas se vinculam pelo nome e todo job guarda uma cópia dele, então não existe renomeação. Um nome já em uso é recusado, sem diferenciar maiúsculas de minúsculas. |
| Formato da assinatura | `Pades` / `Cades` / `Xades`. `auto` não é oferecido: somente o perfil `default` pode escolher o formato pela extensão do arquivo. |
| Pasta de entrada | A pasta monitorada cujos arquivos este perfil assina, ou *Nenhuma — alcançado só por envios que nomeiem este perfil*. Oferece as pastas configuradas neste host que ainda não estão vinculadas a nenhum perfil. É recusada para uma pasta que este host não tem, e para uma que outro perfil tomou nesse meio-tempo, com o nome desse perfil. O monitoramento da pasta começa a recolher arquivos dentro de um intervalo de polling após o salvamento, sem reinicialização. |
| As verificações | Verificação, cadeia, criptografia, CNAB240 (e, enquanto o CNAB240 estiver ligado, se as datas de pagamento são validadas), manter a extensão original, gravar em PEM — o mesmo conjunto que a página de detalhe edita, recusado pelas mesmas regras. Desligar a verificação pede confirmação. |
| Método de assinatura | **Assinatura local**, o serviço remoto **Lacuna Signer** ou **Nenhum — os aprovadores assinam**. É o primeiro controle, porque decide se o resto do formulário pede ou não um certificado. O Lacuna Signer troca os campos de certificado pelos do participante — nome, e-mail, identificador — e é recusado se este host não tem as configurações `Signer:*`. |
| Nenhum — os aprovadores assinam | Cria um perfil **sem chave**: o conjunto de assinantes `Approvers`, em que cada membro do pool que aprova assina o arquivo com o próprio certificado. Os campos de certificado são substituídos pela regra de aprovação sem a qual um perfil desses não funciona — **o pool** (nome, endereço e CPF de cada membro), **o número de aprovadores necessários** e **o prazo de espera**. É recusado sem uma `WebPki:License` ou uma `CloudHub:ApiKey` no host, em um host sem o portal do aprovador e sem login pelo Entra (ninguém conseguiria apresentar um certificado), para um formato de assinatura diferente de `Cades` (a assinatura de um aprovador é uma coassinatura CAdES) e sem a validação CNAB240, que toda regra de aprovação exige. A criação é confirmada após um aviso de que o arquivo entregue carrega as assinaturas dos aprovadores, e não a do perfil. |
| Origem do certificado | Com assinatura local: `Pfx` / `AzureKeyVault` / `Pkcs11` / `WindowsStore`, cada uma exibindo somente os seus campos. |
| Onde está o arquivo? | Para `Pfx` e `AzureKeyVault`: **neste host** (um caminho), **em um blob do Azure Storage** ou — somente para um PKCS#12 — **enviar agora**. Exatamente uma opção; qual certificado assina nunca deve depender de qual coordenada por acaso estava legível. Sob `AzureKeyVault`, o que se indica é o `.cer` *público*; a chave privada nunca sai do cofre. |
| Enviar o PKCS#12 | O arquivo é enviado ao serviço, criptografado com a `Signing:ProfileSecretsKey` e armazenado **no banco operacional** — nunca gravado no sistema de arquivos do host, nem exibido ou disponível para download de novo. É o que permite que um operador sem acesso ao disco do host, ou uma instância em cluster com disco efêmero, instale um certificado. Limitado a **256 KiB**. Quem tiver o banco de dados e essa chave ao mesmo tempo tem esta credencial de assinatura; por isso, mantenha a chave fora do banco e dos backups dele (veja [Segurança](security.md#a-chave-de-segredos-dos-perfis-de-assinatura-signingprofilesecretskey)); indique um caminho ou um blob se a chave nunca puder sair da máquina em que está. |
| PIN do PKCS#11 | **Não está nesta página e não é armazenado em lugar nenhum.** O formulário recebe o *nome* da variável de ambiente de onde o PIN é lido, e o salvamento recusa uma variável que não esteja definida neste host. |
| Segredos | A senha de um PKCS#12, o segredo de aplicativo de um cofre e a credencial de um blob são criptografados antes do armazenamento e mascarados na saída de log a partir do momento em que são salvos. Eles nunca são exibidos de novo — a página só informa se estão definidos. Um segredo com menos de doze caracteres é recusado, porque o mascaramento de log não consegue mascarar um valor tão curto sem alterar texto não relacionado. |

Um perfil com chave é criado sem regra de aprovação; adicione a etapa depois, pela página de detalhe do
perfil. Cada criação aceita registra um evento operacional com o operador, o formato, a origem do
certificado (ou o método de assinatura ou, para um perfil sem chave, o conjunto de assinantes, o tamanho
do pool e o quórum) e se a verificação está ligada — e, de propósito, nenhum caminho, thumbprint, segredo,
nem nome, endereço ou CPF de aprovador.

## `/profiles/{name}` — Detalhe do perfil de assinatura

Tudo o que a implantação guarda sobre um perfil. O nome é comparado sem diferenciar maiúsculas de
minúsculas, como faz o `POST /api/files?profile=`. Um nome desconhecido exibe um aviso com link para a
lista.

Quatro painéis, três deles editáveis — e **os três entram em vigor em momentos diferentes**: o
**comportamento** vale a partir do próximo job que o pipeline captura; uma **regra de aprovação**, a
partir do próximo arquivo que ficar retido; e um **certificado**, a partir da próxima reinicialização. Só
um formulário de edição pode ficar aberto por vez.

**Todo salvamento segue as mesmas regras.** Combinações inválidas são recusadas no momento do salvamento,
no seu idioma, pelas mesmas regras que as recusam no boot, e nada é gravado quando um salvamento é
recusado. Um salvamento que não muda nada não grava nada. Se outra pessoa salvou enquanto o seu
formulário estava aberto, **o seu salvamento é recusado, e não aplicado**, para não desfazer
silenciosamente a alteração de um colega. Cada salvamento aceito registra um evento operacional (veja
[Convenções da trilha de auditoria](#convenções-da-trilha-de-auditoria)) que nunca contém um segredo, um
caminho ou um identificador de certificado.

### Comportamento

Formato, método, se o perfil **aceita novos trabalhos**, a **pasta de entrada** e as verificações —
verificação, cadeia, criptografia, CNAB240 (e, enquanto ele estiver ligado, **validar datas de
pagamento**), manter a extensão original, gravar em PEM. Esta é a regra em vigor: o próximo job capturado
pelo pipeline é assinado com ela. Um perfil com a verificação desligada exibe um aviso.

**Editar comportamento** abrange o formato, a opção de aceitar novos trabalhos, a pasta de entrada e as
verificações. Depois de salvar, a mudança vale para o próximo job capturado, e todas as instâncias de um
cluster convergem dentro de um intervalo de polling — sem reinicialização. Recusas que vale a pena
conhecer:

- A criptografia não pode ser ligada enquanto o `Encryption:Enabled` do host estiver falso.
- *Gravar em PEM* fica restrito ao CAdES, e *manter a extensão original*, ao CAdES e ao XAdES.
- O formato não pode deixar de ser `Cades` enquanto os aprovadores assinam.
- **O CNAB240 não pode ser desligado enquanto o perfil tem uma regra de aprovação** — um arquivo roteado
  para ele ficaria retido sem ter sido interpretado, e nenhum aprovador conseguiria decidir sobre ele.
  Primeiro remova a regra em *Editar aprovação*.

**Três mudanças pedem confirmação antes de serem aceitas:** desabilitar o perfil (os arquivos passam a se
acumular em uma pasta que ninguém está acompanhando), desligar a verificação e fixar um formato no
`default` (o que desliga a detecção por arquivo para todo upload sem perfil).

**Validar datas de pagamento** (2.15.0, ligado por padrão) decide se uma remessa cuja data de pagamento
mais antiga já passou é recusada na assinatura (`cnab240.payment-date-passed`) ou aceita — para bancos
que processam um pagamento com data passada no dia útil seguinte. Com a opção desligada, o arquivo é
assinado, e o histórico do job, um evento operacional e uma métrica registram que a validação não foi
feita. O valor é lido no momento da assinatura; por isso, uma mudança vale para o próximo job — inclusive
um retido — sem reinicialização. Veja [CNAB240](cnab240.md#datas-de-pagamento-que-já-passaram).

**O seletor de pasta de entrada** oferece *Nenhuma*, todas as pastas configuradas neste host que nenhum
outro perfil usa e a própria pasta do perfil — marcada como *não configurada neste host* quando o host
não a tem mais. Uma pasta usada por outro perfil é recusada, com o nome desse perfil; dois salvamentos
que escolhem a mesma pasta no mesmo instante resultam em exatamente um dono. Uma troca chega ao
monitoramento de todas as instâncias em um ou dois intervalos de polling, sem reinicialização: a pasta
antiga fica *sem perfil* na página Pastas de entrada, e a nova começa a ser listada.

**Aposentar um perfil é desligar a opção de aceitar novos trabalhos; não existe exclusão.** Com ela
desligada, nada mais é roteado para o perfil — uma pasta monitorada, um upload, uma nova varredura e uma
nova tentativa são todos recusados com `profile.disabled`. **Tudo o que já está na fila é processado até
o fim.** O perfil continua na lista e continua disponível como filtro na lista de jobs. A desativação é
recusada enquanto o perfil está vinculado a uma pasta monitorada, com o nome da pasta — primeiro remova
a pasta (pode ser no mesmo salvamento). O `default` não oferece essa opção: é para ele que vai um upload
sem perfil.

O nome e o método de assinatura não são editados aqui; o método faz parte do formulário de certificado.

### Certificado

De onde vem o material de assinatura, **tal como está armazenado**: um caminho de PKCS#12, um módulo
PKCS#11 e thumbprint, um local de repositório do Windows e thumbprint, ou um endpoint de cofre, id do
aplicativo, nome da chave e caminho do certificado público — além da URL e do modo de credencial do blob
do material de assinatura, quando há um configurado. Uma coordenada não definida aparece como *não
definido*, em vez de sumir. Sob `LacunaSigner`, o painel mostra o participante remoto. **Todo segredo
aparece como *configurado* ou *não configurado*, nunca com o valor**; o PIN do PKCS#11 aparece só como o
nome da variável de ambiente de onde é lido.

**Editar certificado** oferece as mesmas opções de método e de origem do formulário de criação, e o
método de assinatura é o primeiro controle:

- **Para o Lacuna Signer**: nenhuma chave é aberta, então a mudança vale para o próximo job capturado,
  sem reinicialização, e as coordenadas de certificado armazenadas — inclusive a senha — são apagadas. É
  recusado se este host não tem as configurações `Signer:*`. Veja
  [Integração com o Lacuna Signer](lacuna-signer.md#escolhendo-o-método-pelo-dashboard).
- **Para assinatura local, ou qualquer outra mudança de certificado**: gravada no banco, mas **lida só na
  próxima reinicialização**. Até lá, o perfil continua assinando com a chave que já abriu — um perfil
  resolvido mantém aberto um handle de chave privada, e não há como trocá-lo com segurança durante uma
  assinatura em andamento. Um perfil que passou do Lacuna Signer para a assinatura local ainda não tem
  chave; por isso, aparece como **degradado**, e os jobs roteados para ele falham com `profile.degraded`
  até a reinicialização.

**O certificado não é aberto durante uma edição**; por isso, uma senha errada só é informada na próxima
inicialização, e não no formulário: o perfil sobe como **degradado** nesta página, com a mensagem do
próprio provedor, e a solução é corrigir as coordenadas e reiniciar de novo. Verificar no momento do
salvamento foi descartado de propósito: em um token PKCS#11 ou em um repositório do Windows, isso
significaria abrir uma segunda sessão com um hardware que pode não ser reentrante, enquanto o pipeline
mantém uma sessão aberta e pode estar no meio de uma assinatura.

**Um PKCS#12 enviado pode ser mantido, substituído ou removido.** Com *Enviado para este serviço*
selecionado, deixar o seletor de arquivo vazio **mantém** o arquivo armazenado, escolher um novo arquivo
o **substitui**, e escolher um caminho, um blob, outra origem ou o Lacuna Signer o **remove** — com um
aviso antes de você salvar. Um salvamento não pode destruir uma chave privada por omissão.

**Um segredo é mantido, a menos que você diga o contrário.** Deixar um campo de senha em branco mantém o
valor guardado no banco, para que alguém possa trocar o caminho de um certificado sem saber a senha. Uma
opção **Remover o valor armazenado** aparece quando há algo a remover. Se o host não consegue ler um
segredo armazenado — por causa de uma `Signing:ProfileSecretsKey` trocada ou removida —, um salvamento
que o manteria é recusado, e a saída é digitar o segredo de novo; um perfil nessa situação também sobe
como degradado. Veja
[Diagnóstico de problemas](troubleshooting.md#um-perfil-está-degradado-dizendo-que-um-segredo-armazenado-não-pôde-ser-descriptografado).

**Uma alteração de certificado pendente fica sinalizada até que uma reinicialização a leia.** O marcador
lista os campos que mudaram — nunca os valores —, fica acima dos painéis e aparece como o chip
**Reinício pendente** em `/profiles`. Ele é calculado a partir do banco, então sobrevive a recargas, e
**em um cluster cada instância responde por si**: uma instância que já reiniciou e outra que ainda não
reiniciou estão assinando com chaves diferentes, e cada uma informa isso. Não há como dispensá-lo; ele só
deixa de valer quando uma reinicialização lê o certificado armazenado.

**O painel de certificado de um perfil sem chave não lista coordenadas** nem oferece edição, e o método de
assinatura não aparece em lugar nenhum da página. Mudar o conjunto de assinantes **para** `Approvers` pelo
formulário de aprovação não abre nada e vale a partir do próximo arquivo retido. Tirá-lo **de**
`Approvers`, ou remover a etapa, devolve ao perfil uma chave própria, aberta na próxima reinicialização —
o formulário avisa, e o marcador Reinício pendente cita o *Conjunto de assinantes*.

### Aprovação

O quórum, o conjunto de assinantes, o prazo de espera e o pool inteiro — nome, endereço e CPF —, nos
mesmos termos em que a página do job os mostra ao operador. O `GET /api/profiles` informa apenas uma
contagem. Esta é a regra em vigor; um job que já ficou retido é decidido pela regra congelada nele. Um
prazo de espera longo demais para ser plausível exibe o mesmo aviso que o banner de boot.

**Editar aprovação** abre um formulário com a regra inteira: o pool (adicionar, remover, editar um
membro), o quórum, o **conjunto de assinantes** (de quem são as assinaturas que a saída carrega) e o
prazo de espera. Um perfil sem etapa de aprovação pode ganhar uma pelo mesmo botão, e uma etapa pode ser
removida por completo. Um conjunto de assinantes que inclui os aprovadores exige no host uma licença do
Web PKI ou o CloudHub, além do portal do aprovador ou do login pelo Entra; ele é confirmado após um aviso
de que o arquivo entregue carregará várias assinaturas. Veja [Aprovações](approvals.md).

- **O prazo de espera é informado em horas**, de propósito, e não no formato `d.hh:mm:ss` usado na
  configuração, em que `"48:00:00"` significa quarenta e oito *dias*. A opção *Sem prazo* o remove; um
  prazo de 24 dias ou mais pede confirmação antes de ser salvo.
- **Remover alguém tem efeito imediato** — sem reinicialização nem intervalo de polling: o link de um
  aprovador é conferido contra o pool no banco a cada uso, então excluir a linha já é a revogação.
  Adicionar uma pessoa lhe dá o mesmo link que ela tinha antes, já que os links são derivados, e não
  emitidos.
- **Jobs já retidos não são afetados.** Cada um é decidido pela sua regra congelada; alguém adicionado hoje
  não pode aprovar um arquivo que ficou retido ontem.
- **As recusas indicam a linha a que se referem**: um quórum maior que o pool, um quórum menor que um, duas
  linhas com o mesmo endereço, um nome em branco, um CPF com dígitos verificadores inválidos. Uma regra de
  aprovação é recusada em um perfil que não valida arquivos de pagamento CNAB240, e o formulário avisa
  antes de você salvar.
- **Remover a etapa pede confirmação**, porque o pool vai junto. Adicionar uma não pede.

O evento de auditoria traz contagens — quantas pessoas foram adicionadas, removidas e alteradas —,
**nunca uma lista de nomes**.

### Pasta de entrada

A única pasta monitorada da qual este perfil recebe arquivos, com nome e caminho, ou nenhuma — o alcance
de uma mudança, visível antes que qualquer mudança seja possível. Uma pasta que este host não configurou
aparece como *não configurada neste host*, porque o vínculo pertence ao perfil e a configuração é de cada
host. A pasta é escolhida ou trocada em *Editar comportamento*.

## `/system` — Sistema

Informações somente leitura do serviço:

| Campo | Origem |
|-------|--------|
| Versão da build | Versão do assembly, completa |
| Modo de host | Serviço do Windows / systemd / console / docker |
| Ambiente | `ASPNETCORE_ENVIRONMENT` |
| Raiz de armazenamento | `Storage:Root` |
| Pipeline | Em execução / Pausado; clique para ir até a ação Pausar/Retomar |
| Impressão digital da licença | SHA-256 da licença carregada, primeiros 16 caracteres hexadecimais |
| Licença do Web PKI | `WebPki:License` configurada / não configurada, nunca o valor. *Não configurada* é um chip neutro: é uma situação válida sempre que nenhum conjunto de assinantes inclui os aprovadores. |
| Certificados em nuvem (CloudHub) | `CloudHub:ApiKey` configurada / não configurada, nunca o valor — ela é um segredo. O mesmo chip neutro quando ausente. |
| Origem do certificado | `Signing:Certificate:Source` + o campo relevante da subárvore |
| Política de assinatura | ADR-Básica (padrão; veja [Certificados](certificates.md)) |
| Criptografia | Ativada / Desativada |
| Último desligamento | O evento operacional `ServiceStopping` mais recente, se houver. Vazio depois de um Limpar Jobs, até o próximo desligamento. |
| Tamanho da fila | Snapshot da contagem de `Queued` |

Um logotipo do cliente configurado que não pôde ser lido aparece aqui como um alerta, com o motivo.

**Eventos recentes.** Abaixo do card do pipeline, as dez entradas mais recentes do log de eventos
operacionais — hora relativa, tipo de evento, mensagem tal como registrada — com um link **Ver todos os
eventos** para [`/events`](#events--eventos-operacionais). Atualizado a cada ciclo de polling. Com o log
vazio, a seção informa isso; depois de um Limpar Jobs, a entrada `JobsCleared` é a primeira da lista.

**Onde fica o banco operacional** é algo que esta página *não* mostra. A tabela de caminhos de
armazenamento lista os diretórios locais sob `Storage:Root`, entre eles o `db/` — que, com
`Database:Provider = SqlServer`, simplesmente não é usado. Os lugares que identificam o banco são a linha
`operational store` do banner de resumo de prontidão e a verificação `database` do `/api/ready/details`
(protegida pela chave de API ou por uma sessão de operador); ambos informam provider, servidor e banco de
dados, e nunca a connection string.

**Quem é dono do compartilhamento de trabalho** — acima da tabela de caminhos de armazenamento, e
**somente** quando `Storage:Provider = AzureFiles`. Normalmente, uma legenda com o marcador que esta
instância reivindicou. Quando outra instância o detinha na inicialização, aparece em vez disso um alerta
vermelho, com o host e o id de processo daquela instância. É um snapshot do momento do boot, e não uma
verificação ao vivo: o marcador é reivindicado uma vez e mantido durante toda a vida do processo, então
uma linha que se atualizasse sugeriria uma atualidade que ela não pode ter. Veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho).

**Instâncias** — **somente** quando `Cluster:Enabled = true`. Uma linha por identidade de instância
registrada no banco operacional: a identidade derivada, com a encarnação deste boot logo abaixo, um chip
**Viva**, **Parada** ou **Sem sinal**, a versão da aplicação que ela executa, e quando ela iniciou e
enviou o último sinal. *Parada* é uma instância que se despediu em um desligamento limpo — o rastro normal
de uma reimplantação; *Sem sinal* é uma que ficou em silêncio sem avisar. A linha da instância que
respondeu à sua requisição recebe uma marca — e, como o balanceador de carga escolhe a instância a cada
requisição, recarregar a página muda essa marca de lugar, o que é a forma mais simples de confirmar que o
tráfego está de fato distribuído. A legenda informa o intervalo de heartbeat e o limite de inatividade em
vigor. As instâncias mortas são listadas de propósito: um operador que diagnostica uma redução de escala
quer ver a instância que sumiu e quando ela deu sinal pela última vez.

**Reimplantações in-place** (2.5.0): uma linha cuja encarnação **deslocou** uma antecessora viva — o
container anterior de uma reimplantação in-place no App Service — mostra, abaixo da identidade, essa
encarnação deslocada e quando isso ocorreu. Na página servida pelo próprio processo *deslocado*, um
**banner de aviso acima da tabela** diz que este processo se retirou e desde quando — ele não assume
trabalho novo e conclui o que já tem — e que volta a atuar sozinho se a linha da sucessora ficar
*Parada* ou *Sem sinal*.

Duas observações importam aqui. **Sem sinal é uma suposição, não uma morte confirmada** — uma instância
viva, mas incapaz de gravar heartbeats, aparece do mesmo jeito. E **duas versões diferentes fora de uma
janela de implantação** caracterizam a condição de versões mistas, que é registrada como Critical no boot
da instância mais nova e nunca é bloqueada. Veja
[Operação](operations.md#quais-instâncias-estão-vivas-somente-no-modo-cluster) e
[Alta disponibilidade](high-availability.md#atualizações-exigem-parada-total).

**Links de aprovadores** — quando `ApproverPortal:Enabled`, uma seção que lista cada aprovador presente
no pool de algum perfil, com a sua URL pessoal do portal e os pools de perfis a que pertence. É lida do
banco operacional quando a página carrega; assim, o desligamento de um aprovador aparece na próxima
recarga. Ela fica aqui, e deliberadamente *não* na página de um job: um link durável exibido ao lado de um
job parece se referir a esse job, e um operador o repassaria esperando que expirasse junto com o arquivo.
Cada link é exibido como um campo somente leitura para copiar, e não como um link clicável, já que clicar
nele abriria a fila de outra pessoa no navegador do próprio operador. A seção traz o aviso de que o link
funciona como credencial: trate cada link como a senha daquela pessoa, envie a cada aprovador somente o
dele e revogue removendo a pessoa de todos os pools (uma pessoa) ou trocando o
`ApproverPortal:LinkSecret` (todos). Com o portal desligado, a seção informa isso no lugar do conteúdo.
Veja [Aprovações](approvals.md#o-portal-do-aprovador).

**Segundo fator dos aprovadores** — quando `ApproverSecondFactor:Enabled`, uma lista com uma linha por
aprovador de algum pool, inscrito ou não, com a data de inscrição. Cada linha de aprovador inscrito tem
um botão **Redefinir**, o caminho para o caso de celular perdido: após um diálogo de confirmação, ele
apaga a inscrição desse aprovador, para que ele vincule um novo autenticador na próxima visita, e a ação é
registrada com o nome do operador como um evento de auditoria próprio. Veja
[Aprovações](approvals.md#provando-que-é-você).

Os botões de pausar/retomar o pipeline ficam aqui, exibidos conforme o estado atual. O campo opcional
`reason` é gravado na trilha de auditoria.

Por enquanto, o botão `Cleanup` não faz nada, enquanto a funcionalidade de retenção é finalizada. Veja
[Retenção](retention.md).

### Zona de perigo — Limpar Jobs

Exclui permanentemente **todos** os registros de jobs — em qualquer status, inclusive `Queued`, retidos e
em andamento — com as linhas do tempo de histórico, as evidências de aprovação e as linhas de pagamento
interpretadas, e **todos os arquivos que esses jobs deixaram**: a entrada, a pasta `processing/<jobid>/`,
a pasta `error/<jobid>/` e a saída assinada (ou a devolução `.reject` de um arquivo vetado). Também exclui
**todos os eventos operacionais** registrados antes do início da limpeza.
Um diálogo de confirmação protege a ação e deixa claro que ela é
irreversível, que os jobs não finalizados também são excluídos e que um job em processamento é
abandonado, quais arquivos são removidos e o que permanece intacto. Cancelar ou fechar o diálogo não
exclui nada.

:::warning Mudou na 2.9.0 e na 2.10.0 — o Limpar Jobs apaga tudo
Antes da 2.9.0, o Limpar Jobs excluía somente registros de jobs finalizados, ignorava jobs `Queued`,
retidos e em andamento, e não tocava em arquivos nem em eventos operacionais. Agora ele exclui todos os
jobs, qualquer que seja o status — com `Cluster:Enabled`, inclusive o job em execução em outra
instância —, os arquivos que esses jobs deixaram (2.9.0) e todos os eventos operacionais registrados
antes da limpeza (2.10.0). O resultado não informa mais uma contagem de *ignorados*.
:::

Ao confirmar, os arquivos são removidos primeiro e as linhas depois, de modo que um armazenamento
inacessível faz a limpeza falhar antes que qualquer registro desapareça. Nada é forçado: um arquivo
bloqueado ou uma pasta que não aceita exclusão é mantido no lugar, contabilizado e citado em uma linha de
log de aviso, e a linha correspondente é excluída mesmo assim. Em seguida, a limpeza grava um único
evento de auditoria `JobsCleared` como registro do corte — o ator e quantos jobs, arquivos, pastas e
eventos operacionais foram excluídos, além de quantos itens não puderam ser —, move dentro da mesma
transação o marcador de zeragem das [estatísticas](statistics.md#zerando-o-painel), que vale para toda a
implantação, e atualiza a página. A mensagem de resultado informa todas as contagens: como aviso, quando
algo não pôde ser excluído, e como informação, e não como sucesso, quando não havia nada para excluir.

**A limpeza vai até o fim mesmo se você sair da página** (2.11.1). Ela pode exigir várias idas e vindas
ao armazenamento por job; por isso, um operador que confirma e depois navega para `/jobs` para ver a
tabela esvaziar não a cancela mais; somente uma parada do serviço a interrompe, e essa interrupção é
registrada no log.

O Limpar Jobs não afeta: o estado do pipeline, os perfis de assinatura, a configuração e os arquivos de
log. Os contadores Prometheus em `/api/metrics` também não são afetados — eles são monotônicos.

:::warning
Não há como desfazer. Se você precisa do histórico de jobs ou da trilha de auditoria, faça antes o backup
do banco operacional — `db/bulksigner.db` no SQLite, ou o backup previsto no regime do seu SGBD no SQL
Server. Veja [Retenção](retention.md#disciplina-de-backup). O **Exportar para Excel** da página Jobs gera
uma lista no nível de job, mas não inclui as linhas do tempo nem os eventos operacionais. Para remover um
único job em vez de todos, use o [Excluir da página Jobs](#excluindo-um-job).
:::

Veja [Operação](operations.md#limpar-jobs).

## `/events` — Eventos operacionais

A trilha de auditoria de todo o host (2.13.0): todos os eventos operacionais que o produto registra —
pausa e retomada do pipeline, criação e edição de perfis, decisões de aprovação, rejeições e expiração,
devoluções, divergência de entrada, assunções de jobs no cluster, despacho e recusa do Lacuna Signer,
falhas de validação do CNAB240 e validações de data de pagamento não executadas, exclusões de jobs, Clear
Jobs, inscrição e redefinição de aprovadores, desligamento do serviço.

| Aspecto | Comportamento |
|---------|---------------|
| Acesso | Todos os operadores, inclusive um `Administrator` do Entra. **Nunca** um aprovador — várias mensagens citam aprovadores, pools e mudanças de perfil. |
| Ordem | Mais recentes primeiro, 50 por página, com **Anterior** / **Próxima** e uma contagem *x–y de n*. Cada horário é exibido na hora local do host **com o offset em relação ao UTC**, para que um evento perto da meia-noite possa ser interpretado corretamente diante dos filtros por dia UTC. |
| Filtros | **Tipo de evento** — uma seleção múltipla dos tipos que de fato existem no banco. **Mensagem contém** — um trecho literal (`%` e `_` não são curingas). **De** / **Até** — dias UTC inteiros, inclusive, como na página Jobs; uma data inicial posterior à final gera um aviso, em vez de uma tabela vazia. |
| Mensagens | Exatamente como registradas, em **inglês**, qualquer que seja o idioma de exibição — texto de auditoria persistido é evidência. |
| Atualização | Somente manual, pelo botão **Atualizar**: uma atualização automática enquanto o leitor navega pelo histórico deslocaria as linhas diante dos olhos dele. |
| Escritas | Nenhuma. Nada nesta página exclui, edita ou exporta um evento. A única coisa que remove eventos é o **Limpar Jobs** em `/system`. |
| Modo cluster | A tabela é compartilhada, então todas as instâncias mostram as mesmas linhas. |

O mesmo log está disponível por REST como `GET /api/events` e `GET /api/events/types` — veja
[API REST](rest-api.md#eventos).

## `/backup` — Backup do banco de dados

Onde o operador responde a uma pergunta — "meus backups estão funcionando?" — e faz um backup sob
demanda. **O link de navegação está presente em toda implantação**, inclusive nas de SQL Server: uma
implantação em que o backup não se aplica precisa de um lugar para ler *por quê*. A página assume uma de
três formas:

| Quando | O que ela mostra |
|--------|------------------|
| `Database:Provider = SqlServer` | Um alerta informativo e nada mais: o banco operacional está no seu próprio banco de dados, sob as suas próprias regras de backup, HA e DR. `Backup:Enabled = true` com `SqlServer` impede o boot. |
| `Sqlite`, `Backup:Enabled = false` | Um alerta dizendo o que ligar, além das configurações que *valeriam*. Sem botões de ação. |
| `Sqlite`, habilitado | A página completa, descrita abaixo. |

| Elemento | O que faz |
|----------|-----------|
| Resumo do destino | O `Backup:Destination` configurado (`Disk`, `S3` ou `AzureBlob`) e onde os artefatos são gravados. Um destino inacessível gera um alerta de aviso com o motivo; a conexão é testada quando a página abre e a cada atualização. |
| Fazer backup agora | Executa um backup imediatamente. É recusado com `backup.disabled` quando a funcionalidade está desligada. |
| Cancelar execução | Disponível enquanto uma execução está em andamento, com um diálogo de confirmação — uma execução cancelada não é retomada; a próxima começa do início. |
| Agendamento | O `Backup:IntervalHours` configurado, ou "somente manual" quando ausente, além de quando a próxima execução está prevista — calculada a partir da última execução **bem-sucedida**, de modo que uma reinicialização não a zera e uma execução com falha não a consome. |
| Histórico | Execuções recentes com o desfecho, o tamanho e a duração de cada uma. |
| Retenção | O `Backup:RetainCount` e o que será removido. A remoção só roda depois de um armazenamento bem-sucedido e não pode fazer a execução falhar. |

Não existe, de propósito, um botão de restauração: uma restauração é uma ação de operador feita com o
serviço parado. Cada chave, inclusive o formato da credencial de cada destino, está em
[Configuração](configuration.md#backup); como isso se encaixa no quadro geral é explicado em
[Retenção](retention.md#disciplina-de-backup).

## `/logs` — Exceções recentes

Um visualizador somente leitura das entradas de log de nível de erro mais recentes, mantidas em um buffer
limitado em memória. Ele **não** consulta os arquivos de log em disco — o buffer é esvaziado na
reinicialização; por isso, use o destino de arquivo para qualquer consulta histórica.

| Aspecto | Comportamento |
|---------|---------------|
| Origem | Buffer FIFO limitado em memória, alimentado pelo pipeline de log. Esvaziado na reinicialização. |
| Entradas | Mais recentes primeiro, limitadas a `LogViewer:MaxEntries` (padrão 20). Somente os níveis listados em `LogViewer:Levels` (padrão `Error`, `Fatal`) são capturados. |
| Por entrada | Recolhida: chip de nível, mensagem, timestamp, contexto de origem, tipo de exceção. Expandida: mensagem completa, tipo e mensagem da exceção e o stack trace em um bloco monoespaçado com rolagem. |
| Atualização | Automática, a cada `LogViewer:RefreshIntervalSeconds` (padrão 5), além de um botão de atualização manual. |
| Mascaramento | Todos os campos de texto são mascarados no momento em que a entrada é capturada, de modo que segredos não apareçam na página. Veja [Segurança](security.md#mascaramento-de-logs--duas-camadas). |
| Desabilitado | Quando `LogViewer:Enabled = false`, o link de navegação fica oculto e a página exibe um aviso de recurso desabilitado. |

:::note
O nível mínimo global do destino de arquivo se aplica **primeiro**. Ampliar o `LogViewer:Levels` para
níveis abaixo desse mínimo (por exemplo, acrescentar `Debug` enquanto o mínimo é `Information`) não
captura nada, porque esses eventos nunca chegam ao destino.
:::

## `/approve/{id}` — Aprovação (anônima)

A única página da aplicação que **não** está protegida pela política de operador. Ela usa um layout
simples — sem gaveta de navegação nem barra de aplicativo —, porque quem a abre é um aprovador, e não um
operador. Existe somente quando um perfil de assinatura tem uma [regra de aprovação](approvals.md).

| Aspecto | Comportamento |
|---------|---------------|
| Autenticação | **Nenhuma por padrão.** Qualquer pessoa que acesse a URL pode aprovar — ou rejeitar — em nome de qualquer membro do pool congelado do job, conforme o aviso exibido na própria página. Se o visitante já tem uma sessão do [portal do aprovador](#approvals--portal-do-aprovador) ou uma sessão `Approver` do Microsoft Entra, a página **o reconhece**: mostra o nome dele em vez de oferecer o seletor, registra o método de identificação mais forte e exibe os identificadores sem máscara. |
| Decisões | **Aprovar** ou **Rejeitar**, com um campo opcional de motivo, comum às duas. Rejeitar exige um segundo clique de confirmação. Uma rejeição interrompe o job, independentemente do quórum. |
| Mostra | Nome do arquivo, total geral, contagem de pagamentos, contagem de exclusões, intervalo de datas de pagamento, pagador, o pool congelado com a decisão de cada membro, o progresso em direção ao quórum, o prazo de espera e o hash do conteúdo. |
| Data de pagamento vencida | Quando a data de pagamento mais antiga do arquivo pendente é anterior a hoje, um aviso informa isso — e diz se o perfil vai recusar o arquivo na assinatura (ele precisa ser reexportado com datas atuais) ou assiná-lo mesmo assim. |
| Pagamentos individuais | A **mesma** tabela de pagamentos que a página de job do operador exibe, paginada. O nível de exposição depende do *leitor*, e não da página: um visitante anônimo vê o CPF/CNPJ reduzido aos dígitos verificadores e a conta reduzida aos últimos dígitos, ambos com a legenda *(parcial)*; um visitante identificado os vê por inteiro. Não aparece depois que o job chega a um estado terminal, porque o detalhe das linhas é expurgado nessa transição. |
| Não oferecido | **Sem download do arquivo bruto**, em nenhuma página de aprovação. |
| Contexto de nova tentativa | Quando o job é uma nova tentativa de um job já aprovado: quem aprovou o job pai e se o arquivo é idêntico byte a byte. Essas aprovações **não** contam para o quórum deste job. |
| Não encontrado | Um job que não existe e um job que nunca ficou retido exibem a mesma mensagem, de modo que um id adivinhado não revela nada. |

**Em um job cujo conjunto de assinantes congelado inclui os aprovadores**, a página muda conforme o
leitor: um leitor identificado recebe **Assinar e aprovar** — a mesma etapa de certificado que o portal
abre —, e um leitor não identificado recebe a página somente leitura, com um botão para o portal do
aprovador. Com o segundo fator dos aprovadores ativado, um leitor não identificado também recebe a
página somente leitura. A rejeição não muda. Veja [Aprovações](approvals.md).

Passo a passo completo: [Aprovações](approvals.md).

## `/approvals` — Portal do aprovador

A fila de um único aprovador, acessada pelo link durável dele ou por um login `Approver` do Microsoft
Entra. Assim como o `/approve/{id}`, usa o layout simples. Fica desligado, a menos que
`ApproverPortal:Enabled` esteja ativo — veja [Configuração](configuration.md#approverportal).

| Aspecto | Comportamento |
|---------|---------------|
| Autenticação | Uma **sessão de aprovador**, com esquema de cookie próprio. Não é o cookie de operador nem a chave de API. Como ela exige uma política de autorização, o `/approvals` **não** é uma rota anônima — e é isso que torna admissível, antes de tudo, uma lista de aprovações pendentes. Um botão **Sair** ao lado do nome do aprovador encerra a sessão; quem tinha uma sessão obtida só pelo link vai para a página que indica como voltar a entrar. |
| Como entrar | `/approvals/link/{token}` — o link durável, anônimo porque é por ele que se obtém a credencial. Ele valida o token, define o cookie e redireciona; a partir daí, o aprovador salva `/approvals` nos favoritos. Um token inválido e um token ausente levam à mesma página, que não explica o motivo. |
| Abas | **Aguardando você**, **Aguardando outros**, **Aprovados** — separadas pela *sua decisão*, e não pelo status do job. Nas duas primeiras, os jobs estão em `AwaitingApproval`. |
| Escopo | Somente jobs cujo **pool congelado** inclui você. |
| Cada linha | Uma linha: nome do arquivo, status, total geral, contagens de pagamentos e exclusões, o placar do quórum, quando ficou retido, o prazo para decidir — além de um sinal de risco, o **maior pagamento individual**, que evidencia um zero a mais. O pagador só aparece quando a lista tem mais de um pagador distinto. Uma linha cujo conjunto de assinantes congelado inclui os aprovadores traz um chip **Exige assinatura**. |
| Aprovar | Um clique na própria linha. As linhas marcadas em **Aguardando você** podem ser aprovadas em lote pela barra de ferramentas; a aprovação de cada arquivo marcado é tentada independentemente do resultado dos anteriores, e o resultado lista cada arquivo que não foi aprovado e o motivo. |
| Assinar | Em uma linha *Exige assinatura*, o controle passa a ser **Assinar e aprovar**: o aprovador assina com o próprio certificado — no navegador, pelo Lacuna Web PKI, ou mantido por um provedor em nuvem, pelo Lacuna CloudHub, quando a `CloudHub:ApiKey` está definida —, e só são oferecidos certificados com o CPF que o pool congelado registra para ele. Um lote pode misturar os dois tipos de arquivo. Veja [Aprovações](approvals.md). |
| Rejeitar | Na linha, por meio de um **diálogo modal** com o aviso de irreversibilidade e um motivo opcional — o botão da linha só abre a pergunta. **Não existe rejeição em lote**, nem aqui nem em outro lugar. |
| Quem recebe | Expande a linha, ali mesmo, para mostrar a tabela de pagamentos, com os identificadores **por inteiro** — o leitor é uma pessoa específica, e não qualquer um que tenha recebido uma URL repassada. |
| Alcance da aba Aprovados | Limitado pelo `ApproverPortal:DecidedLookback` (90 dias por padrão) e a 200 linhas. Quando o limite é atingido, a página avisa. |
| Exportação | **Exportar para Excel**, no mesmo lugar em todas as abas, desabilitado em vez de oculto quando a aba está vazia. Baixa a aba inteira, e não as linhas marcadas. **Nível de job: uma linha por arquivo de pagamento, nunca uma por beneficiário.** Um bloco de título acima da tabela informa o leitor, o momento e a lista e, em **Aprovados**, também o período consultado e se o limite foi atingido. |
| Não oferecido | Sem download do arquivo bruto. Sem acesso a um job fora dos seus pools. |

Onde os operadores obtêm os links: na página **Sistema**, um por aprovador presente em algum pool. Nunca
na página do job.

## Convenções da trilha de auditoria

Toda ação é registrada:

| Ação | Onde ela aparece |
|------|------------------|
| Pausar / retomar | Um evento de sistema + o motivo da pausa |
| Cancelar | Uma entrada de histórico no job cancelado |
| Tentar novamente | Uma entrada de histórico no job pai + uma entrada inicial de histórico no job filho |
| Nova varredura | Um evento de sistema que resume o resultado |
| Excluir um job | Um evento de sistema `JobDeleted` com o que foi removido e mantido, o motivo (se informado) e um resumo das aprovações |
| Limpar Jobs | Um evento de sistema `JobsCleared` que registra o ator e quantos jobs, arquivos, pastas e eventos operacionais foram excluídos (e quantos itens não puderam ser) — o primeiro evento da trilha depois da limpeza |
| Criar um perfil | Um evento de sistema com o ator, o formato, a origem do certificado ou o método de assinatura e se a verificação está ligada |
| Editar o comportamento de um perfil | Um evento de sistema `SigningProfileEdited`: ator, perfil e cada campo alterado, com o valor anterior e o novo (uma pasta aparece pelo nome, por exemplo `InputFolder (none) → remessas`) |
| Editar o certificado de um perfil | Um evento de sistema `SigningProfileCertificateEdited`: ator, perfil, os nomes dos campos que mudaram e a indicação de que a mudança vale a partir da reinicialização — nunca um valor |
| Editar a regra de aprovação de um perfil | Um evento de sistema `SigningProfileApprovalEdited`: ator, perfil, o quórum e o prazo de espera antes e depois, e quantos aprovadores foram adicionados, removidos e alterados — contagens, nunca uma lista de nomes |

As mensagens seguem formatos consistentes, por exemplo `"Pipeline paused by operator. Reason: Quarterly
maintenance."` e `"Operator canceled: still investigating."`. Todas podem ser lidas em
[`/events`](#events--eventos-operacionais).

## Tema

O dashboard usa a paleta da marca Lacuna Software — azul-marinho (`#000F29`) com o laranja de destaque
(`#F15A31`). Os operadores podem alternar entre os modos claro e escuro pela barra de aplicativo; a
escolha vale durante toda a sessão.

## Dashboard no console (somente execuções em primeiro plano)

Quando o serviço roda como um processo de console em primeiro plano, em um terminal interativo, um painel
de status ao vivo substitui o fluxo contínuo de log. Os operadores veem um único snapshot sempre
atualizado — estado de pausa, tamanho da fila, contagem em andamento + detalhamento por formato, totais
de concluídos/com falha/cancelados desde o boot, uptime e o endereço de escuta —, renovado no mesmo ciclo
de `Dashboard:PollIntervalSeconds` usado pelo dashboard web.

**Condições de ativação** (as três precisam ser verdadeiras):

| Condição | |
|----------|--|
| `Console:Dashboard:Enabled = true` | padrão `true` |
| O host não é um serviço do Windows / unidade do systemd | detectado automaticamente |
| A saída padrão é um terminal interativo | não redirecionada para arquivo ou pipe |

Quando alguma condição não é atendida (qualquer host de serviço, saída redirecionada ou
`Enabled = false`), o serviço continua enviando eventos de log estruturados para a saída padrão.

- **A saída de boot não é afetada.** O banner e o resumo `Service ready` são impressos antes de a área
  ao vivo começar; eles permanecem visíveis no topo do buffer do terminal.
- **O detalhe forense continua no destino de arquivo.** O painel ao vivo omite detalhes por job (nomes
  de arquivo, mensagens de erro) para continuar legível. Acompanhe o arquivo de log para ter o registro
  durável.
- **Como desativar.** Defina `Console:Dashboard:Enabled = false` para manter a visão de log em fluxo
  contínuo nas execuções em primeiro plano.
- **Requisitos do terminal.** Qualquer terminal moderno funciona (Windows Terminal, Alacritty, iTerm2,
  gnome-terminal, Terminal do macOS). O `conhost.exe` legado e alguns clientes SSH restritos voltam à
  saída com rolagem.

## Atrás de um proxy reverso

O dashboard usa uma conexão em tempo real com o servidor (WebSockets). Se você o colocar atrás de um
proxy reverso, garanta que os WebSockets sejam repassados (a maioria dos proxies os habilita por padrão;
verifique se o header `Upgrade: websocket` chega ao destino). Repasse também os headers `Set-Cookie` e
`Cookie` sem alteração e defina `X-Forwarded-Proto: https` quando o TLS terminar no proxy, para que o
cookie de sessão seja marcado como `Secure`.

---

**A seguir:** [Estatísticas de jobs](statistics.md) — lendo o painel de desempenho.
**Anterior:** [Operação](operations.md).
