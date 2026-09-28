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

Quando o login opcional pelo **Microsoft Entra ID** está configurado, o `/login` renderiza **Entrar com a
Microsoft** no lugar do formulário da chave de API — o formulário da chave de API fica desligado, e não
apenas oculto — e as páginas de operador exigem o app role `Administrator`. Sair limpa somente a sessão
do próprio Bulk Signer, então entrar de novo tem sucesso silenciosamente; esse é o comportamento normal de
single sign-on. Veja [Segurança](security.md#modo-de-login-pelo-microsoft-entra-id-opcional).

**Para onde um login leva.** Um link que a pessoa seguiu sempre vence: se o login foi disparado ao abrir
uma página específica, a pessoa volta para ela. Somente quando nenhuma página foi pedida é que o papel
decide — um `Administrator` (inclusive um que também tenha `Approver`) cai no Painel, e um login apenas
`Approver` cai no [portal do aprovador](#approvals--portal-do-aprovador). Um aprovador que abre uma página
de operador como `/jobs` ou `/system` é recusado em `/access-denied`, que diz isso. O destino é um padrão,
não uma cerca: o que mantém não operadores fora das páginas de operador é a autorização nessas páginas.

**A autorização também é aplicada dentro da conexão ao vivo.** Navegar entre páginas do dashboard não
faz uma nova requisição HTTP, então a regra de acesso de cada página também é verificada contra a
identidade conectada da conexão ao vivo, e uma recusa recarrega a página para que o redirecionamento
normal de login se aplique. A gaveta de navegação é renderizada somente para operadores. Desde a 2.2.1 a
conexão ao vivo carrega a identidade do operador, o que também permite que os eventos de auditoria
escritos a partir de uma ação no dashboard nomeiem o operador. Uma sessão do dashboard deixada aberta
durante a atualização a partir de uma versão anterior mantém seu tíquete antigo — saia e entre de novo
uma vez. Veja
[Segurança](security.md#o-dashboard-é-cercado-duas-vezes-no-endpoint-e-dentro-do-circuito).

**O logotipo do cliente.** Com um [`Branding:CustomerLogo`](configuration.md#branding--o-logotipo-do-cliente-nas-páginas-de-login-e-de-aprovação)
configurado, o card de login o mostra acima de uma marca reduzida do produto, e as
três superfícies de aprovação o mostram ao lado de uma; sem ele, as páginas mostram a marca do produto
como antes. O logotipo é lido uma vez na inicialização, então um arquivo novo exige uma reinicialização e
nada mais. Um logotipo configurado que não pôde ser lido **não** impede o serviço de subir: as páginas
voltam para a marca do produto, e o motivo aparece no banner de resumo de prontidão e como um alerta na
página **Sistema** — um logotipo ausente é uma falha cosmética, não um motivo para se recusar a assinar.

## Elementos comuns da interface

Toda página tem uma barra superior de aplicativo e uma gaveta de navegação à esquerda:

| Elemento | O que faz |
|----------|-----------|
| Barra de aplicativo (topo) | A **versão em execução**, o seletor de idioma (ícone de globo, veja abaixo), o alternador de tema (claro / escuro) e um menu de conta com Sair. |
| Gaveta (esquerda) | Os links de navegação: Painel, Jobs, Pasta de entrada, Perfis de assinatura, Eventos, Exceções, Backup, Sistema. O link de Exceções fica oculto quando `LogViewer:Enabled = false`. O link de Backup está presente em toda implantação, inclusive nas de SQL Server — veja [`/backup`](#backup--backup-do-banco-de-dados). |
| Indicador de atualização | Um pequeno widget mostrando a hora da última atualização e a cadência de consulta ativa, mais um botão **Atualizar agora**. |

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

**Uma página que parou de atualizar avisa.** Um carregamento que falha mantém o que já está na tela e
transforma o indicador em um *falha ao atualizar* vermelho, com o motivo no tooltip e a hora do último
carregamento que teve sucesso. O motivo é a própria frase do provedor, com todo segredo configurado
mascarado, na mesma camada que o log durável usa (veja
[Segurança](security.md#mascaramento-de-logs--duas-camadas)). Se o próprio laço de atualização
automática para, de modo que a página não vai mais se atualizar sozinha, o indicador também diz isso. O
botão de atualizar está **sempre** disponível, inclusive durante um carregamento: um clique durante um
carregamento é ignorado, e o spinner ao lado dele é o que diz *ainda não*. Todos esses casos também vão
para o log durável. Uma ação de operador que estoura o tempo — iniciar um backup, salvar um perfil, o
Clear Jobs — da mesma forma reporta a falha, em vez de voltar em silêncio para uma página inalterada.

### Idioma de exibição

As superfícies web renderizam em **inglês americano ou português do Brasil**, escolhido por navegador
pelo seletor de idioma — na barra de aplicativo nas páginas de operador, fixado no canto superior
direito nas páginas de layout simples (`/login`, as superfícies de aprovação). A escolha é armazenada no
cookie de cultura padrão do ASP.NET Core por um ano; trocar recarrega a página inteira. A ordem de
resolução é **cookie → o `Accept-Language` do navegador → `en-US`**, então um navegador brasileiro recebe
português na primeira visita, sem interação.

Não há chave de configuração — o leitor escolhe, o servidor não.

O que o idioma deliberadamente **não** muda: as frases de trilha de auditoria na linha do tempo do job e
em [`/events`](#events--eventos-operacionais) (a evidência permanece em inglês, exatamente como escrita),
os valores REST no protocolo (nomes de `JobStatus`, `code`s de problema e seu texto), os logs duráveis, o
dashboard de console, e tudo do CNAB240 — valores em `R$`, datas de pagamento em `dd/MM/yyyy` e o
vocabulário de remessa são propriedades do arquivo, não do leitor.

## `/` — Dashboard

Página inicial. Cards de estatística e os últimos jobs:

| Card | Valor |
|------|-------|
| Na fila | Contagem de jobs em `Queued` |
| Em andamento / Slots ocupados | Quando `Pipeline:MaxConcurrency = 1`: contagem de jobs em `Processing` + `Verifying`. Quando `MaxConcurrency > 1`: renderizado como `N / M slots ocupados`. |
| Em execução há / Há mais tempo em execução | O job em andamento que o pipeline mantém há mais tempo, como um número ao vivo que avança a cada segundo, com o nome do arquivo linkado para sua página. Medido a partir da captura mais recente do job — ou, em um job que voltou do Lacuna Signer, a partir do download — de modo que nem a deliberação de um aprovador nem os dias de um signatário entram nele. Exibido somente enquanto há algo em andamento; rotulado *Há mais tempo em execução* quando `MaxConcurrency > 1`. Não é uma estatística, então não depende de `Statistics:Enabled`. |
| Concluídos (24 h) | Jobs cuja transição terminal ocorreu nas últimas 24 h |
| Falhados (24 h) | Jobs que falharam nas últimas 24 h |
| Cancelados (24 h) | Jobs cancelados pelo operador nas últimas 24 h |
| Saída criptografada (24 h) | Subconjunto dos jobs concluídos cuja saída foi criptografada |
| Estado do pipeline | "Rodando" ou "Pausado" (clicável, abre a página Sistema) |

Quando `Pipeline:MaxConcurrency > 1`, um pequeno painel **Em processamento por formato** detalha a
contagem em andamento por `Pades` / `Cades` / `Xades`. No modo sequencial (o padrão) o painel fica
oculto.

### Painel de desempenho de processamento

Abaixo dos cards de estatística fica um painel **Desempenho de processamento** com estatísticas de tempo
decorrido por etapa — tempo médio de job, tempo médio de assinatura e de verificação, vazão móvel,
totais mín./méd./máx., um detalhamento por etapa, uma divisão entre Local e Remoto, e o **job mais
lento**: o job concluído por trás do *Máx*, nomeado e linkado para sua página. Os números são linhas na
base operacional, então eles **sobrevivem a uma reinicialização**, e em um cluster o painel descreve a
implantação inteira, e não a instância que por acaso respondeu à sua requisição.

O antigo card **Vazão máxima/s** foi aposentado em vez de retrabalhado: ele media o tempo de vida de um
processo, o que sob um cluster teria descrito a sorte de uma instância. A "Vazão (último min)" responde
ao que ele era usado para responder na maior parte das vezes.

Totalmente oculto quando `Statistics:Enabled = false`. Guia completo de leitura, inclusive como usar a
divisão por etapa para localizar uma lentidão:
[Estatísticas de jobs](statistics.md#o-que-cada-métrica-do-dashboard-significa).

Abaixo disso: um gráfico de vazão das últimas 24 horas e uma tabela dos últimos cinco jobs. Esta página é
uma visão somente leitura — para ações, vá para Jobs.

## `/jobs` — Jobs

Uma tabela filtrável e paginada de todos os jobs:

| Filtro | Tipo |
|--------|------|
| Status | Um status entre `Queued / Processing / AwaitingApproval / AwaitingSigner / Verifying / Completed / Failed / Canceled`, ou nenhum |
| Perfil | Lista suspensa com cada perfil de assinatura que a implantação tem — inclusive um perfil desabilitado, já que ver o que um perfil aposentado assinou é um motivo para mantê-lo. |
| Nome do arquivo contém | Texto livre (casamento por conteúdo) |
| Criado a partir de / Criado até | Dois seletores de data, incluindo os dois dias |

Paginação no servidor, **50** por página, mais recentes primeiro. As colunas: uma marcação (somente em
linhas `Completed` — veja abaixo), o nome do arquivo com um chip `enc` quando a saída foi criptografada,
o formato, o nome do perfil resolvido, a origem (Observador / Upload / Retry), o badge de status, o chip
de **Aprovações** (abaixo), a última atualização, e um ícone de download em linhas `Completed`. Um clique
na linha navega para a página de detalhe do job; a marcação e o ícone de download não navegam, então usar
qualquer um deles mantém você na lista.

Um job em `AwaitingApproval` traz a sua **duração de espera** ao lado do badge de status ("aguardando há
3 h 12 min", com a hora exata da retenção no tooltip): uma espera por aprovação não tem prazo definido, e
há quanto tempo ela dura é a única coisa pela qual um operador pode julgá-la.

### A coluna de aprovações

Um chip, em uma linha `AwaitingApproval` e em nenhuma outra — quantas pessoas ainda precisam decidir
antes que o arquivo possa ser assinado, para que uma fila de arquivos de pagamento retidos possa ser
percorrida sem abrir cada um. Um job que nunca chegou à etapa de aprovação não tem regra a relatar, e um
que já saiu dela tem um desfecho que o badge de status já nomeia.

| Chip | Quando |
|------|--------|
| *N* pendente(s) (âmbar) | O quórum congelado ainda quer *N* decisões. Passe o mouse para ver "*x* de *y* aprovações registradas, em um grupo de *z*". |
| quórum atingido (verde) | Pessoas suficientes aprovaram; o job é liberado na próxima consulta do pipeline. |
| rejeitado (vermelho) | Alguém do pool o vetou. Uma rejeição é um veto, não um voto retido, então nenhuma aprovação adicional pode liberar o arquivo — o chip lê o desfecho, e não a aritmética. A linha foi flagrada no instante entre o veto e a passagem para `Canceled`. |

Todo número vem da regra **congelada no job** quando ele ficou retido e das decisões registradas contra
ela — nunca do perfil atual — pela mesma avaliação que a página do aprovador, a página do job e o
`GET /api/jobs/{id}/approvals` usam. Veja [Aprovações](approvals.md#a-regra-congelada).

### Baixando as saídas assinadas

Dois controles, ambos oferecidos em uma linha `Completed` e em nenhuma outra:

| Controle | O que faz |
|----------|-----------|
| Ícone de download, na linha | O mesmo download `GET /api/jobs/{id}/output` que a página do job oferece, abrindo em uma nova aba, sem sair da lista. Um envelope `.enc` é entregue como está quando o perfil criptografa. |
| Marcação, na linha; marcação, no cabeçalho | Seleciona a linha, ou toda linha `Completed` da página atual. A seleção vale **somente para esta página** e é limpa a cada troca de página e a cada mudança de filtro, de modo que a contagem no botão sempre nomeia linhas que você vê marcadas. |
| **Baixar N selecionado(s)**, no cabeçalho | Um único ZIP — o **arquivo de saídas assinadas** — com os arquivos assinados dos jobs marcados, pelo `GET /api/jobs/archive`, armazenados sem compressão sob os nomes com que o `output/` os guarda. Desabilitado enquanto nada está marcado. |

Um job marcado cujo arquivo assinado não está mais em `output/` sob o nome esperado — movido por um
operador ou pela automação dele, ou deixado sob um nome anterior porque a flag `PreserveFileExtension` ou
`SaveAsPem` do perfil mudou depois de o job concluir — é listado pelo id do job e pelo nome esperado em uma
entrada `MISSING.txt` dentro do ZIP, e o resto do lote é entregue. O download é recusado com
`410 job.output-gone` somente quando nenhum dos jobs marcados ainda tem seu arquivo. O limite é a página —
50 jobs. Dois jobs cujas saídas têm o mesmo nome entram ambos no arquivo, o mais recente com o id do job
antes da extensão. Se uma leitura falha no meio do caminho, o navegador reporta a transferência como
falha e o arquivo parcial não abre como ZIP — deliberadamente, em vez de um arquivo bem-formado com um
arquivo curto dentro.

Nenhum dos dois controles escreve um evento operacional: um download é uma leitura, e a trilha de
auditoria registra o que mudou um job, nunca quem olhou para ele. Uma linha de log estruturado por
download registra o operador e as contagens. Isto **não** é o download do arquivo bruto que é negado aos
aprovadores, e não o enfraquece: aquela regra é sobre um arquivo de pagamento chegar a um aprovador
identificado por link, enquanto o operador é justamente a parte para quem o `output/` existe e que já
coleta esses mesmos arquivos de lá.

### Exportando a lista

O botão **Exportar para Excel** do cabeçalho baixa a lista de jobs como uma planilha `.xlsx` — **todo job
que os filtros atuais admitem, e não esta página nem as marcações** (as marcações pertencem ao arquivo
acima). Ele carrega os filtros da página — status, perfil, trecho do nome do arquivo e intervalo de datas
de criação — então a planilha é recortada exatamente pelo que a tabela está mostrando, e o
`GET /api/jobs/export` os aplica pela mesma regra que a tabela e o `GET /api/jobs` usam. Desabilitado, em
vez de oculto, enquanto nada corresponde.

O que há nela: uma linha por job, mais recentes primeiro — nome do arquivo, formato, perfil, origem,
status (no seu idioma de exibição), criado e atualizado, pasta de entrada, caminho original, o total e a
contagem de pagamentos do CNAB240 quando o job foi interpretado como uma remessa (célula vazia caso
contrário, nunca `0`), se a saída foi criptografada, a mensagem de erro, o id do job pai e o id do job.
Todo valor vem da linha do job; **nenhuma linha de pagamento chega à planilha** — uma linha por
*arquivo*, nunca uma por beneficiário, a mesma fronteira que a exportação do portal do aprovador mantém.
Um bloco de título acima da tabela nomeia quem a gerou, quando (com o deslocamento UTC do servidor), cada
filtro em vigor — ou *Nenhum* — e quantos jobs corresponderam. A exportação é limitada a **10.000
linhas**; quando o limite morde, o bloco diz isso em vermelho, e um intervalo de datas de criação é como
se alcança o resto. O conteúdo segue o seu idioma de exibição; o nome do arquivo
(`jobs-yyyyMMdd-HHmmss.xlsx`, em UTC) não.

Como o arquivo de saídas, ela não escreve evento operacional e deixa uma linha de log — o operador, a
contagem de linhas, quantos corresponderam, e se havia um filtro em vigor; nunca um nome de arquivo. Ela
exige uma credencial de operador e consome o orçamento de rate limit `Export`, que divide com a
exportação do portal do aprovador.

### Enviar arquivos

O botão **Enviar arquivos** do cabeçalho é a porta de entrada do dashboard para um arquivo que nenhuma
pasta monitorada vai entregar — um caso isolado, um teste, um arquivo que um sistema integrado deixou em
outro lugar. Ele abre um diálogo com duas escolhas e uma ação: o **perfil de assinatura** (somente perfis
habilitados, com `default` pré-selecionado quando está entre eles — um perfil desabilitado é recusado na
ingestão, então oferecê-lo seria oferecer uma recusa), os **arquivos** (um ou mais, até
`Upload:MaxBytes` cada, com o valor informado no diálogo), e **Enviar**.

Todo arquivo passa exatamente pelo caminho que o `POST /api/files` usa — o mesmo limite de tamanho, o
mesmo saneamento do nome do arquivo, o mesmo stage na primeira pasta de entrada sob um nome gerado, o
mesmo enfileiramento — de modo que as duas superfícies não podem responder de forma diferente a um mesmo
arquivo, e um envio pelo dashboard é um job como qualquer outro. O que o diálogo *não* oferece é o
override `?format=`: o formato fixado do perfil ou a extensão do arquivo decide, como acontece com um
arquivo solto em uma pasta.

Os arquivos são transferidos um de cada vez, na ordem em que foram escolhidos. Um arquivo é recusado **pelo
tamanho que o navegador declarou, antes de a transferência começar**, e a transferência depois é mantida
sob o mesmo teto, de modo que um navegador que informa o tamanho errado esbarra no segundo limite, e não no
disco deste host. Um arquivo que falha não interrompe os seguintes. Enquanto o envio está em curso o
diálogo não pode ser fechado — nem com Escape, nem pelo fundo, e o Cancelar fica desabilitado — porque
fechá-lo cancelaria uma transferência que já enfileirou parte dos arquivos, sem nenhum relatório para
dizer quais.

Quando o envio termina, o diálogo vira um **relatório**: uma linha por arquivo, na ordem escolhida, cada
uma dizendo o que aconteceu com ele — *Abrir job* para os enfileirados, a recusa por extenso para os
demais (os mesmos motivos com que a rota REST responde `upload.empty`, `upload.too-large`,
`upload.invalid-name`, `profile.disabled`, `job.path-too-long` ou `file.already-processed`; uma
transferência que quebrou lê *a transferência falhou*, com o detalhe no log do servidor). Fechar o
relatório com exatamente um arquivo escolhido e enfileirado abre a página daquele job; qualquer outro
desfecho volta a lista para a primeira página, mantendo os filtros. Escolher mais de 100 arquivos é
recusado por extenso, sem manter nada.

**Um host que não aceita envios não tem o botão.** Com [`Upload:Enabled = false`](configuration.md#upload)
o cabeçalho não renderiza nada onde o botão estava, em vez de um controle desabilitado — nada na página
poderia religá-lo. O caminho de envio recusa pelo mesmo valor (`upload.disabled` na rota REST), então
ocultar o botão não esconde nada. As pastas monitoradas, o rescan e a repetição não são afetados.

O rate limit `Upload` por IP se aplica à rota REST, e não a este diálogo: o operador por trás dele já se
autenticou.

### Excluindo um job

**Cada linha tem um botão Excluir**, exceto a de um job que um worker está executando (`Processing` /
`Verifying`), que roda até o fim. Ele abre um diálogo de confirmação — nomeando o arquivo, com um motivo
opcional — e então apaga o registro e a linha do tempo do job **e os seus arquivos**: o artefato que ele
registrou ter escrito em `output/` (arquivo assinado, envelope `.enc` ou a devolução `.reject`), suas
pastas em `processing/` e `error/`, e seu arquivo de entrada quando ele ainda é o arquivo que o job colocou
em stage e nenhum outro job não finalizado (uma repetição na fila, por exemplo) ainda o nomeia. Um job que
não terminou (`Queued`, `AwaitingApproval`, `AwaitingSigner`) é cancelado primeiro; se um worker o pegar
antes disso, nada é apagado.

O log de eventos operacionais mantém uma entrada `JobDeleted` nomeando o que foi removido, o que foi
mantido, e um resumo das aprovações que o job tinha. É uma linha de cada vez — não existe exclusão em
lote — e não há rota REST.

**Excluir um job também é como um nome de arquivo volta a ser aceito.** Desde a 2.13.0, um arquivo que
chega sob um nome que um job `Completed` ou ainda ativo já carrega — comparado no host inteiro, sem
diferenciar maiúsculas e minúsculas — é recusado em vez de ser assinado duas vezes
(`file.already-processed`; ligado por padrão, desligado com
`Pipeline:RejectAlreadyProcessedFileNames = false`). Depois que o job dono do nome é excluído, um arquivo
com aquele nome volta a ser aceito. Veja
[Operação](operations.md#nomes-de-arquivo-já-processados).

## `/jobs/{id}` — Detalhe do job

Card de cabeçalho com nome do arquivo, badge de status, formato, origem, criado/atualizado, link para o
job pai (se este job é uma repetição), e mensagem de erro (se `Failed`).

- **Chip de saída criptografada** — visível somente quando o job foi assinado com a criptografia
  habilitada. Informa aos operadores que o download entregará um envelope `.enc`, e não um artefato
  assinado em texto claro.
- **Seção Tempo de processamento** — em um job `Completed` com tempos registrados: o total e os tempos
  das quatro etapas (espera na fila, assinatura, verificação, saída) em `hh:mm:ss.fff`, quando o pipeline
  pegou o job e quando ele concluiu, com uma legenda dizendo se o job foi assinado localmente ou pelo
  Lacuna Signer e que nenhuma espera por uma pessoa está nos números. Uma etapa que não aconteceu lê *não
  executada*. Em um job em `Processing` ou `Verifying`: há quanto tempo o pipeline o mantém, ao vivo.
  Ausente em todos os outros jobs. `Statistics:Enabled = false` remove o detalhamento do job concluído; o
  número ao vivo não é uma estatística e permanece. Veja
  [Estatísticas de jobs](statistics.md#os-números-de-um-único-job).
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
  chip "N de M necessários", quantas aprovações já entraram, quando o job ficou retido, o **conjunto de
  assinantes** congelado (de quem são as assinaturas que a saída carrega), o orçamento de espera
  congelado, e o pool de aprovadores — nome, e-mail e CPF — **como estava no momento da retenção**, com
  cada linha carregando a decisão daquela pessoa, seu motivo, e quando ela decidiu. O tooltip do chip de
  decisão nomeia como o aprovador foi identificado (`SelfDeclaredEmail`, `LinkDerivedEmail` ou
  `EntraIdEmail`), e em uma aprovação registrada por assinatura a linha do tempo nomeia o certificado que
  a fez, com o CPF mascarado. Editar a regra de aprovação do perfil **não** muda o que é exibido aqui; é
  justamente esse o propósito do snapshot. Um job rejeitado lê *"2 de 2 aprovações — rejeitado"*, com um
  banner acima do pool dizendo por que o job está `Canceled`.
- **Seção Registro de aprovação** — **somente para o operador**, presente enquanto o job está
  `AwaitingApproval`, inclusive quando a seção de aprovação acima não consegue renderizar porque a regra
  congelada está ausente. Ela executa as verificações a que uma decisão de aprovação está sujeita e mostra
  cada uma com um resultado: a regra congelada; o hash do conteúdo registrado; a cópia em stage em
  `processing/<jobid>/` e se ela ainda confere com aquele hash; o CMS em andamento ao lado dela (*não
  verificada* quando não há um, o que é normal a menos que os aprovadores assinem) e se ele envolve o
  conteúdo registrado; e se o thumbprint do certificado de cada linha aprovada pode ser lido. Uma linha
  reprovada é o motivo pelo qual um aprovador ouve que o registro está incompleto
  (`approval.job-incomplete`), e o painel diz o que fazer: Cancelar e rodar de novo, já que nada repara um
  registro nesse estado (veja
  [Diagnóstico de problemas](troubleshooting.md#um-aprovador-é-informado-de-que-o-registro-de-aprovação-está-incompleto)). Um hash de conteúdo ausente nomeia sua causa provável — a validação CNAB240 do
  perfil estava desligada quando o job ficou retido, então nada interpretou o arquivo. O painel nomeia a
  pasta de processamento para que o operador possa olhar os próprios arquivos. Ele é inspecionado uma vez
  por visita, porque lê e calcula o hash da cópia em stage; **Verificar novamente** o executa de novo.
- **Seção de perfil** — o perfil de assinatura resolvido: nome, formato declarado (ou `auto` para um
  perfil sem formato fixo), origem do certificado, e as flags de postura `Verify` / `Encrypt` /
  `Validate certificate`. Se o perfil do job não existe mais, um aviso é exibido — o job continua
  visualizável, mas uma repetição falharia até o perfil ser restaurado.
- **Linha do tempo** — cada entrada de histórico em ordem cronológica, uma linha por transição de
  estado, cada uma com o timestamp, o badge de status e o texto da mensagem.

:::note Mudou na 2.9.0 — sem link de aprovação por job
A seção de aprovação renderizava o link de aprovação do job (`/approve/{jobId}`) em um campo somente
leitura para o operador copiar e distribuir. Esse campo não existe mais, para nenhum leitor. Um aprovador
encontra um arquivo retido na sua própria fila, por um [link do portal](approvals.md#o-portal-do-aprovador)
ou por um login do Entra, e a página do operador não entrega nada para ser repassado. A página anônima em
`/approve/{jobId}` continua existindo e funcionando como [antes](#approveid--aprovação-anônima);
ela apenas não é mais oferecida aqui.
:::

Botões de ação (visibilidade condicionada ao status):

| Botão | Visível quando o status é… | O que faz |
|-------|---------------------------|-----------|
| Tentar novamente | `Failed` | Cria um novo job com `ParentJobId = this.Id`; navega para o novo job. |
| Cancelar | `Queued`, `AwaitingSigner`, `AwaitingApproval` | Abre antes um diálogo de confirmação, nomeando o arquivo e dizendo o que o cancelamento faz com ele a partir do status atual do job; **Manter job**, Escape ou o fundo não cancelam nada. Ao confirmar, move o job para `Canceled`; o observador não ressuscitará o arquivo automaticamente, e um job cancelado não tem repetição, então o arquivo precisa de um rescan ou de um envio para ser assinado de novo. A partir de `AwaitingSigner`, também cancela o documento remoto na base do melhor esforço; a partir de `AwaitingApproval`, realoca a cópia em stage para `error/<jobid>/`. |
| Baixar arquivo de saída | `Completed` | Abre `GET /api/jobs/{id}/output` em uma nova aba. `application/octet-stream` com nome de arquivo `.enc` quando criptografada; `410 job.output-gone` se o arquivo saiu de `output/`. A lista de Jobs oferece o mesmo download em cada linha `Completed`, e um ZIP de vários — veja [Baixando as saídas assinadas](#baixando-as-saídas-assinadas). |

Os resultados de Tentar novamente e Cancelar são renderizados como um toast — sucesso, aviso (por exemplo,
`job.not-queued`) ou erro. O download é uma navegação, então uma recusa chega como a resposta de problema
da rota, na nova aba.

:::note Esta é a única página que um aprovador também pode abrir
Um aprovador chega aqui pelo chip de contagem em sua [fila](#approvals--portal-do-aprovador), e somente
para um job cujo *pool congelado* o nomeia; qualquer outro id de job é recusado com o mesmo *Job não
encontrado.* que um inexistente recebe. Ele vê o registro e nenhuma das capacidades do operador — sem os
CPFs dos aprovadores, sem a seção Registro de aprovação, e sem Tentar novamente, Cancelar ou Baixar. A
seção Tempo de processamento é mostrada aos dois, por ser um registro sobre o job, e não uma capacidade.

Todo o resto em `/jobs`, `/input`, `/profiles`, `/events`, `/system` e toda a superfície REST continua
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
| Contagem de arquivos | Número de arquivos aguardando captura (limitado a 50; exibido como `50+` acima do limite). |
| Processados desde o início | Cada candidato que o observador tratou desde o início do processo, independentemente do desfecho. |
| Alerta do último erro | Exibido somente quando o status é parado. |
| Botão `Reescanear esta pasta` | Reenfileira somente esta pasta. |

O `Reescanear todas` (topo da página) reenfileira todas as pastas. O toast reporta totais por pasta
quando mais de uma pasta está configurada, e termina com quantas pastas estavam **sem perfil e foram
puladas**; ele fica âmbar quando essa contagem é maior que zero, para que um rescan que não fez nada não
seja reportado como sucesso.

:::warning Mudou na 2.2.0 — um perfil escolhe a sua pasta
O perfil de assinatura de uma pasta não é mais definido na pasta, na configuração: cada perfil escolhe a
única pasta monitorada de que se alimenta, na sua própria página (veja
[`/profiles/{name}`](#profilesname--detalhe-do-perfil-de-assinatura)). O `Storage:Inputs[].Profile` é lido
uma única vez, como entrada de seed, no primeiro boot contra uma tabela de perfis vazia. **`sem perfil`
não é uma falha**: nenhum perfil escolheu a pasta, então nada a está monitorando e os arquivos soltos
nela esperam até que um perfil a escolha. Isso não conta contra a prontidão. Um vínculo trocado na página
de um perfil aparece aqui na próxima recarga.
:::

:::warning
**Observadores parados não revivem automaticamente.** Quando o limiar de falhas consecutivas de
enfileiramento por pasta estoura, o observador daquela pasta sai enquanto o resto do serviço continua
rodando. Corrija a causa subjacente (montagem, disco, permissões) e reinicie o serviço para trazer o
observador de volta.
:::

## `/profiles` — Perfis de assinatura

Desde a 2.1.0 os perfis de assinatura vivem na base operacional e são criados e editados pelo dashboard.
O `Signing:Profiles[]` na configuração é um **seed de uso único**, lido no primeiro boot contra uma tabela
de perfis vazia e reportado como ignorado depois disso — um banner nesta página diz isso, porque editar
aquela seção agora não muda nada. Veja [Configuração](configuration.md).

Esta página lista cada perfil e traz o único botão que cria um, **Novo perfil**. Não existe rota REST que
escreva um perfil; o `GET /api/profiles` os lê. As páginas de perfil exigem uma **sessão de navegador** de
operador — e não um cabeçalho `X-API-Key` avulso — porque a página de detalhe renderiza os pools de
aprovadores por inteiro; um aprovador não as alcança.

Acima da tabela, dois tipos de condição são nomeados com o seu motivo, e não apenas como um chip:

- **Um perfil que não consegue assinar** (`degradado`), com a própria frase do provedor do certificado.
- **Um perfil vinculado a uma pasta que este host não configurou**, nomeando o perfil e a pasta. O perfil
  continua atendendo envios, mas nada chega para ele a partir de uma pasta aqui. Isso só surge *depois* de
  um salvamento — o próprio salvamento recusa uma pasta que o host que salva não tem — a partir de uma
  pasta renomeada ou removida da configuração, ou de um host do cluster cuja configuração difere. A
  correção é configurar a pasta neste host, ou abrir o perfil e escolher outra. O banner de inicialização
  e o `/api/ready/details` reportam a mesma lista.

A tabela:

| Coluna | Valor |
|---|---|
| Perfil | O nome, mais um chip `padrão` no alvo de resolução de último recurso e um chip `desabilitado` em um perfil que não aceita novos trabalhos. |
| Formato | `Pades` / `Cades` / `Xades`, ou `automático (pela extensão do arquivo)`. |
| Método | `Local` ou `LacunaSigner` — ou *n/a* em um perfil **sem chave** (veja Situação). |
| Certificado | A origem de certificado em vigor — `Pfx` / `Pkcs11` / `WindowsStore` / `AzureKeyVault` — *no assinador remoto* sob `LacunaSigner`, ou *nenhum — os aprovadores assinam* em um perfil sem chave. |
| Verificações | Chips para verificação, cadeia, criptografia e CNAB240, cada um declarado nos dois sentidos. O chip de cadeia é omitido sob `LacunaSigner` e em um perfil sem chave, onde a verificação não se aplica. Somente a *verificação* é colorida quando desligada: verificação desligada significa que uma entrada original é apagada com base em uma assinatura que ninguém conferiu, enquanto as outras três são desligadas por padrão, e colori-las ensinaria o operador a ignorar a cor. |
| Aprovação | O quórum e o tamanho do pool, com o conjunto de assinantes e o orçamento de espera abaixo, ou *nenhuma — assina imediatamente*. |
| Situação | `pronto`, `sem chave` ou `degradado`. `degradado` é um certificado que não abriu, um perfil cujo comportamento não pôde ser resolvido, ou uma linha que a base ganhou desde a inicialização. `sem chave` é um **terceiro estado, e não um degradado**: o conjunto de assinantes do perfil é `Approvers`, então cada membro do pool que aprova assina com o próprio certificado e o perfil não tem chave. Um chip **Reinício pendente** aparece ao lado de `pronto` ou `degradado` quando a base guarda uma alteração de certificado que esta instância ainda não abriu. |

Um perfil desabilitado é recusado na ingestão — pastas, envios, rescans e repetições igualmente —
enquanto tudo o que já está na fila para ele roda até o fim. Ele nunca é apagado. Abrir uma linha leva ao
perfil.

## `/profiles/_new` — Novo perfil de assinatura

O formulário que cria um perfil. Tudo nele é digitado uma vez e salvo uma vez; não existe estado de
rascunho.

**O certificado é aberto durante o salvamento**, para um perfil que tem um. Uma senha errada, um vault
inalcançável, um módulo PKCS#11 que este host não tem, ou um certificado público que não confere com a
chave do vault é reportado aqui, no formulário, e não pelo primeiro job roteado para o perfil — e **nada é
gravado quando isso falha**. É também o que permite que um perfil novo assine imediatamente, sem
reinicialização. Um perfil assinado no serviço remoto Lacuna Signer não tem chave local, então não há nada
para abrir; a falha equivalente — um participante que o serviço não conhece — aparece com o primeiro
arquivo. Isso também não se aplica a um perfil **sem chave**, cujos aprovadores assinam.

| Campo | Observações |
|---|---|
| Nome | Letras minúsculas, dígitos e hífens internos, até 40 caracteres. **Fixo depois de aceito** — as pastas monitoradas se vinculam pelo nome e todo job guarda uma cópia dele, então não existe renomeação. Um nome já usado é recusado, comparado sem diferenciar maiúsculas e minúsculas. |
| Formato da assinatura | `Pades` / `Cades` / `Xades`. `auto` não é oferecido: somente o perfil `default` pode despachar pela extensão do arquivo. |
| Pasta de entrada | A pasta monitorada cujos arquivos este perfil assina, ou *Nenhuma — alcançado só por envios que nomeiem este perfil*. Oferece as pastas que este host configurou e das quais nenhum perfil se alimenta ainda. Recusada para uma pasta que este host não tem, e para uma que outro perfil pegou nesse meio-tempo, nomeando o dono. O observador da pasta começa a pegar arquivos dentro de um intervalo de consulta depois do salvamento, sem reinicialização. |
| As verificações | Verificação, cadeia, criptografia, CNAB240 (e, enquanto o CNAB240 está ligado, se as datas de pagamento são validadas), manter a extensão original, gravar em PEM — o mesmo conjunto que a página de detalhe edita, recusado pelas mesmas regras. Desligar a verificação pede confirmação. |
| Método de assinatura | **Assinatura local**, o serviço remoto **Lacuna Signer**, ou **Nenhum — os aprovadores assinam**. É o primeiro controle, porque decide se o resto do formulário pede um certificado ou não. O Lacuna Signer troca os campos de certificado pelo participante — nome, e-mail, identificador — e é recusado se este host não tem as configurações `Signer:*`. |
| Nenhum — os aprovadores assinam | Cria um perfil **sem chave**: o conjunto de assinantes `Approvers`, sob o qual cada membro do pool que aprova assina o arquivo com o próprio certificado. Os campos de certificado são substituídos pela regra de aprovação sem a qual um perfil desses não funciona — **o pool** (nome, endereço e CPF de cada membro), **o número de aprovadores necessários** e **o orçamento de espera**. Recusado sem uma `WebPki:License` ou uma `CloudHub:ApiKey` no host, em um host sem o portal do aprovador e sem login pelo Entra (ninguém conseguiria apresentar um certificado), para um formato de assinatura diferente de `Cades` (a assinatura de um aprovador é uma coassinatura CAdES), e sem a validação CNAB240, que toda regra de aprovação exige. Confirmado após um aviso de que o arquivo entregue carrega as assinaturas dos aprovadores, e não a do perfil. |
| Origem do certificado | Sob assinatura local: `Pfx` / `AzureKeyVault` / `Pkcs11` / `WindowsStore`, cada uma expondo somente os seus campos. |
| Onde está o arquivo? | Para `Pfx` e `AzureKeyVault`: **neste host** (um caminho), **em um blob do Azure Storage**, ou — somente para um PKCS#12 — **enviar agora**. Exatamente um; qual certificado assina nunca deve depender de qual coordenada por acaso estava legível. Sob `AzureKeyVault` o que é nomeado é o `.cer` *público*; a chave privada nunca sai do vault. |
| Enviar o PKCS#12 | O arquivo é enviado ao serviço, criptografado sob a `Signing:ProfileSecretsKey` e armazenado **na base operacional** — nunca gravado no sistema de arquivos do host, e nunca exibido ou baixável de novo. É o que permite instalar um certificado a um operador que não alcança o disco do host, ou a uma instância em cluster com disco efêmero. Limitado a **256 KiB**. Quem tem o banco de dados e essa chave juntos tem esta credencial de assinatura, então mantenha a chave fora do banco e fora dos backups dele (veja [Segurança](security.md#a-chave-de-segredos-dos-perfis-de-assinatura-signingprofilesecretskey)); nomeie um caminho ou um blob em vez disso se a chave nunca puder sair da máquina onde está. |
| PIN do PKCS#11 | **Não está nesta página e não é armazenado em lugar nenhum.** O formulário recebe o *nome* da variável de ambiente de onde o PIN é lido, e o salvamento recusa uma variável que este host não tem definida. |
| Segredos | A senha de um PKCS#12, o segredo de aplicativo de um vault e a credencial de um blob são criptografados antes do armazenamento e mascarados na saída de log a partir do momento em que são salvos. Eles nunca são exibidos de novo — somente se estão definidos. Um segredo com menos de doze caracteres é recusado, porque o mascaramento de log não consegue mascarar um valor tão curto sem reescrever texto não relacionado. |

Um perfil com chave é criado sem regra de aprovação; coloque a etapa depois, pela página de detalhe dele.
Toda criação aceita registra um evento operacional nomeando o operador, o formato, a origem do
certificado (ou o método de assinatura, ou, para um perfil sem chave, o conjunto de assinantes, o tamanho
do pool e o quórum) e se a verificação está ligada — e deliberadamente nenhum caminho, thumbprint, segredo,
ou nome, endereço ou CPF de aprovador.

## `/profiles/{name}` — Detalhe do perfil de assinatura

Tudo o que a implantação guarda sobre um perfil. O nome é comparado sem diferenciar maiúsculas e
minúsculas, como o `POST /api/files?profile=` o compara. Um nome desconhecido renderiza um aviso
apontando para a lista.

Quatro painéis, três deles editáveis — e **os três entram em vigor em três momentos diferentes**: o
**comportamento** alcança o próximo job que o pipeline pega, uma **regra de aprovação** o próximo arquivo
que fica retido, e um **certificado** a próxima reinicialização. Somente um formulário de edição fica
aberto de cada vez.

**Todo salvamento segue as mesmas regras.** Combinações ilegais são recusadas quando você salva, no seu
idioma, pelas mesmas regras que as recusam no boot, e nada é gravado quando um salvamento é recusado. Um
salvamento que não muda nada não grava nada. Se outra pessoa salvou enquanto o seu formulário estava
aberto, **o seu salvamento é recusado em vez de aplicado**, em vez de reverter um colega em silêncio. Todo
salvamento aceito registra um evento operacional (veja
[Convenções da trilha de auditoria](#convenções-da-trilha-de-auditoria)) que nunca carrega um segredo, um
caminho ou um identificador de certificado.

### Comportamento

Formato, método, se o perfil **aceita novos trabalhos**, a **pasta de entrada**, e as verificações —
verificação, cadeia, criptografia, CNAB240 (com, enquanto ele está ligado, **validar datas de
pagamento**), manter a extensão original, gravar em PEM. Esta é a regra em vigor: o próximo job que o
pipeline pega assina sob ela. Um perfil com a verificação desligada traz um aviso.

**Editar comportamento** cobre o formato, a chave de aceitar novos trabalhos, a pasta de entrada e as
verificações. Salve e a mudança alcança o próximo job pego, e toda instância de um cluster converge dentro
de um intervalo de consulta — sem reinicialização. Recusas que vale conhecer:

- A criptografia não pode ser ligada enquanto o `Encryption:Enabled` do host está falso.
- *Gravar em PEM* fica restrito ao CAdES, e *manter a extensão original* ao CAdES e ao XAdES.
- O formato não pode sair de `Cades` enquanto os aprovadores assinam.
- **O CNAB240 não pode ser desligado enquanto o perfil tem uma regra de aprovação** — um arquivo roteado
  para ele ficaria retido sem nada interpretado, e nenhum aprovador conseguiria decidi-lo. Remova a regra
  em *Editar aprovação* primeiro.

**Três mudanças pedem confirmação antes de serem aceitas:** desabilitar o perfil (os arquivos passam a se
acumular em uma pasta que ninguém está olhando), desligar a verificação, e fixar um formato no `default`
(o que desliga a detecção por arquivo para todo envio sem perfil).

**Validar datas de pagamento** (2.15.0, ligado por padrão) decide se uma remessa cuja data de pagamento
mais antiga já passou é recusada na assinatura (`cnab240.payment-date-passed`) ou deixada passar — para um
banco que processa um pagamento com data passada no dia útil seguinte. Desligado, o arquivo é assinado e
o histórico do job, um evento operacional e uma métrica registram que a validação foi pulada. Lido no
momento da assinatura, então uma mudança alcança o próximo job — inclusive um retido — sem
reinicialização. Veja [CNAB240](cnab240.md#datas-de-pagamento-que-já-passaram).

**O seletor de pasta de entrada** oferece *Nenhuma*, cada pasta que este host configurou e da qual nenhum
outro perfil se alimenta, e a própria pasta do perfil — marcada *não configurada neste host* quando o host
não a tem mais. Uma pasta da qual outro perfil se alimenta é recusada, nomeando o dono; dois salvamentos
escolhendo a mesma pasta no mesmo instante deixam exatamente um dono. Uma troca alcança os observadores
dentro de um ou dois intervalos de consulta em toda instância, sem reinicialização: a pasta antiga fica
*sem perfil* na página de entrada e a nova começa a listar.

**Aposentar um perfil é a chave de aceitar novos trabalhos; não existe exclusão.** Desligue-a e nada mais
é roteado para lá — uma pasta monitorada, um envio, um rescan e uma repetição são todos recusados com
`profile.disabled`. **Tudo o que já está na fila roda até o fim.** O perfil continua listado e continua
sendo um filtro na lista de jobs. Desabilitar é recusado enquanto o perfil se alimenta de uma pasta
monitorada, nomeando a pasta — limpe a pasta primeiro (no mesmo salvamento, tudo bem). O `default` não
oferece a chave: é para onde vai um envio sem perfil.

O nome e o método de assinatura não são editados aqui; o método faz parte do formulário de certificado.

### Certificado

De onde vem o material de assinatura, **como está armazenado**: um caminho de PKCS#12, um módulo PKCS#11
e thumbprint, um local de repositório do Windows e thumbprint, ou um endpoint de key vault, id do
aplicativo, nome da chave e caminho do certificado público — mais a URL e o modo de credencial de um blob
do material de assinatura, quando há um configurado. Uma coordenada não definida diz *não definido* em vez
de sumir. Sob `LacunaSigner` o painel nomeia o participante remoto. **Todo segredo aparece como
*configurado* ou *não configurado*, nunca como um valor**; o PIN do PKCS#11 aparece só como o nome da
variável de ambiente de onde é lido.

**Editar certificado** recebe as mesmas escolhas de método e de origem do formulário de criação, e o
método de assinatura é o seu primeiro controle:

- **Para o Lacuna Signer**: nenhuma chave é aberta, então a mudança vale para o próximo job pego sem
  reinicialização, e as coordenadas de certificado armazenadas — inclusive a senha — são limpas. Recusado
  se este host não tem as configurações `Signer:*`. Veja
  [Integração com o Lacuna Signer](lacuna-signer.md#escolhendo-o-método-pelo-dashboard).
- **Para assinatura local, ou qualquer outra mudança de certificado**: salva na base, mas **lida na
  próxima reinicialização**. Até lá o perfil continua assinando com a chave que já abriu — um perfil
  resolvido mantém um handle de chave privada aberto, e trocá-lo por baixo de uma assinatura em curso não
  pode ser feito com segurança. Um perfil que passou do Lacuna Signer para a assinatura local ainda não
  tem chave, então é reportado como **degradado**, e os jobs roteados para ele falham com
  `profile.degraded`, até a reinicialização.

**Nada abre o certificado durante uma edição**, então uma senha errada é reportada na próxima
inicialização, e não no formulário: o perfil sobe **degradado** nesta página com a própria frase do
provedor, e a solução é corrigir as coordenadas e reiniciar de novo. Verificar no momento do salvamento
foi recusado de propósito: em um token PKCS#11 ou em um repositório do Windows isso significaria abrir uma
segunda sessão contra um hardware que pode não ser reentrante, enquanto o pipeline mantém uma e pode estar
no meio de uma assinatura.

**Um PKCS#12 enviado pode ser mantido, substituído ou removido.** Sob *Enviado para este serviço*, deixar
o seletor vazio **mantém** o arquivo armazenado, escolher um o **substitui**, e escolher um caminho, um
blob, outra origem ou o Lacuna Signer o **remove** — o que é avisado antes de você salvar. Um salvamento
não pode destruir uma chave privada por omissão.

**Um segredo é mantido a menos que você diga o contrário.** Deixar um campo de senha em branco mantém o
que a base guarda, para que alguém possa trocar o caminho de um certificado sem saber a senha. Uma chave
**Remover o valor armazenado** aparece onde há algo para remover. Se o host não consegue ler um segredo
armazenado — uma `Signing:ProfileSecretsKey` trocada ou removida — um salvamento que o manteria é
recusado, e digitar o segredo de novo é a saída; um perfil desses também sobe degradado. Veja
[Diagnóstico de problemas](troubleshooting.md#um-perfil-está-degradado-dizendo-que-um-segredo-armazenado-não-pôde-ser-descriptografado).

**Uma alteração de certificado pendente fica marcada até que uma reinicialização a leia.** O marcador
nomeia os campos que mudaram — nunca os valores —, fica acima dos painéis e aparece como o chip
**Reinício pendente** em `/profiles`. Ele é derivado da base, então sobrevive a recargas, e **em um
cluster cada instância responde por si**: uma instância que reiniciou e uma que não reiniciou estão
assinando com chaves diferentes, e cada uma diz isso. Nada o dispensa; ele deixa de ser verdade quando uma
reinicialização lê o certificado armazenado.

**O painel de certificado de um perfil sem chave não lista coordenadas** nem oferece edição, e o método de
assinatura não aparece em lugar nenhum da página. Levar o conjunto de assinantes **para** `Approvers` pelo
formulário de aprovação não abre nada e vale no próximo arquivo retido. Tirá-lo **de** `Approvers`, ou
remover a etapa, devolve ao perfil uma chave própria, aberta na próxima reinicialização — o formulário
avisa, e o marcador de reinício pendente nomeia o *Conjunto de assinantes*.

### Aprovação

O quórum, o conjunto de assinantes, o orçamento de espera, e o pool inteiro — nome, endereço e CPF — nos
mesmos termos em que a página do job os mostra a um operador. O `GET /api/profiles` reporta uma contagem
em vez disso. Esta é a regra em vigor; um job que já ficou retido é decidido pela regra congelada nele. Um
orçamento de espera implausivelmente longo traz o mesmo aviso que o banner de boot levanta.

**Editar aprovação** abre um formulário sobre a regra inteira: o pool (adicionar, remover, editar um
membro), o quórum, o **conjunto de assinantes** (de quem são as assinaturas que a saída carrega), e o
orçamento de espera. Um perfil sem etapa pode ganhar uma pelo mesmo botão, e uma etapa pode ser removida
por completo. Um conjunto de assinantes que inclui os aprovadores exige uma licença do Web PKI ou o
CloudHub, mais o portal do aprovador ou um login pelo Entra, no host; ele é confirmado após um aviso de
que o arquivo entregue vai carregar várias assinaturas. Veja [Aprovações](approvals.md).

- **O orçamento de espera é digitado em horas**, deliberadamente não na grafia `d.hh:mm:ss` que a
  configuração usa, onde `"48:00:00"` significa quarenta e oito *dias*. Uma chave *Sem prazo* o limpa; um
  orçamento de 24 dias ou mais pede confirmação antes de ser salvo.
- **Remover alguém vale imediatamente** — sem reinicialização, sem intervalo de consulta: o link de um
  aprovador é resolvido contra o pool na base a cada uso, então apagar a linha é a revogação. Adicionar
  alguém lhe entrega o mesmo link que ele tinha antes, já que os links são derivados, e não emitidos.
- **Jobs já retidos não são afetados.** Cada um é decidido pela sua regra congelada; alguém adicionado hoje
  não pode aprovar um arquivo que ficou retido ontem.
- **As recusas nomeiam a linha de que tratam**: um quórum maior que o pool, um quórum abaixo de um, duas
  linhas com o mesmo endereço, um nome em branco, um CPF que falha nos dígitos verificadores. Uma regra de
  aprovação é recusada em um perfil que não valida arquivos de pagamento CNAB240, e o formulário diz isso
  antes de você salvar.
- **Remover a etapa pede confirmação**, porque o pool vai junto. Adicionar uma não pede.

O evento de auditoria carrega contagens — quantas pessoas foram adicionadas, removidas e alteradas —,
**nunca uma lista de nomes**.

### Pasta de entrada

A única pasta monitorada de que este perfil se alimenta, por nome e caminho, ou nenhuma — o raio de
impacto de uma mudança, antes que qualquer mudança seja possível. Uma pasta que este host não configurou é
marcada *não configurada neste host*, porque o vínculo é do perfil e a configuração é por host. A pasta é
escolhida ou trocada em *Editar comportamento*.

## `/system` — Sistema

Informações somente leitura do serviço:

| Campo | Origem |
|-------|--------|
| Versão da build | Versão do assembly, completa |
| Modo de host | Serviço do Windows / systemd / console / docker |
| Ambiente | `ASPNETCORE_ENVIRONMENT` |
| Raiz de armazenamento | `Storage:Root` |
| Pipeline | Rodando / Pausado; clique para navegar até a ação Pausar/Retomar |
| Impressão digital da licença | SHA-256 da licença carregada, primeiros 16 caracteres hex |
| Licença do Web PKI | `WebPki:License` configurada / não configurada, nunca o valor. *Não configurada* é um chip neutro: é legal onde nenhum conjunto de assinantes inclui os aprovadores. |
| Certificados em nuvem (CloudHub) | `CloudHub:ApiKey` configurada / não configurada, nunca o valor — ela é um segredo. O mesmo chip neutro quando ausente. |
| Origem do certificado | `Signing:Certificate:Source` + o campo relevante da subárvore |
| Política de assinatura | ADR-Básica (padrão; veja [Certificados](certificates.md)) |
| Criptografia | Habilitada / Desabilitada |
| Último desligamento | O evento operacional `ServiceStopping` mais recente, se houver. Vazio depois de um Clear Jobs, até o próximo desligamento. |
| Tamanho da fila | Snapshot da contagem de `Queued` |

Um logotipo do cliente configurado que não pôde ser lido aparece aqui como um alerta, com o motivo.

**Eventos recentes.** Abaixo do card do pipeline, as dez entradas mais recentes do log de eventos
operacionais — hora relativa, tipo de evento, mensagem como registrada — com um link **Ver todos os
eventos** para [`/events`](#events--eventos-operacionais). Atualizado a cada consulta. Um log vazio diz
isso; depois de um Clear Jobs, a entrada `JobsCleared` é a primeira que existe.

**Onde a base operacional está** *não* está nesta página. A tabela de caminhos de armazenamento mostra os
diretórios locais sob `Storage:Root`, `db/` entre eles — que sob `Database:Provider = SqlServer`
simplesmente não é usado. As superfícies que nomeiam a base são a linha `operational store` do banner de
resumo de prontidão e a verificação `database` do `/api/ready/details` (atrás da chave de API ou de uma
sessão de operador), que ambas nomeiam provider, servidor e banco de dados, e nunca a connection string.

**Quem é dono do compartilhamento de trabalho** — acima da tabela de caminhos de armazenamento, e
**somente** quando `Storage:Provider = AzureFiles`. Ordinariamente, uma legenda nomeando o marcador que
esta instância reivindicou. Quando outra instância o detinha na inicialização, um alerta vermelho em vez
disso, nomeando o host e o id de processo daquela instância. É um snapshot do momento do boot, e não uma
verificação ao vivo: o marcador é reivindicado uma vez e mantido por toda a vida do processo, então uma
linha que se atualizasse estaria insinuando um frescor que ela não pode ter. Veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho).

**Instâncias** — **somente** quando `Cluster:Enabled = true`. Uma linha por identidade de instância que se
registrou na base operacional: sua identidade derivada, com a encarnação deste boot abaixo, um chip
**Viva**, **Parada** ou **Sem sinal**, a versão da aplicação que ela está rodando, e quando ela iniciou e
deu o último sinal. *Parada* é uma instância que se despediu em um desligamento limpo — o rastro normal de
uma reimplantação; *sem sinal* é uma que ficou em silêncio sem avisar. A linha da instância que respondeu
à sua requisição é marcada como tal — e, como o balanceador de carga escolhe por requisição, recarregar a
página move aquela marcação, o que é a confirmação mais barata disponível de que o tráfego realmente está
distribuído. A legenda nomeia a cadência de heartbeat e o limiar de obsolescência em vigor. As mortas são
listadas de propósito: um operador diagnosticando uma redução de escala quer ver a instância que sumiu e
quando ela falou pela última vez.

**Reimplantações no lugar** (2.5.0): uma linha cuja encarnação **substituiu** uma antecessora viva — o
contêiner anterior de uma reimplantação no lugar no App Service — nomeia essa encarnação substituída, e
quando, abaixo da identidade. Na página servida pelo próprio processo *substituído*, um **banner de aviso
acima da tabela** diz que este processo se retirou e desde quando — ele não pega trabalho novo e termina o
que tem — e que ele retoma sozinho se a linha da sua sucessora ficar parada ou sem sinal.

Duas leituras importam aqui. **Sem sinal é uma presunção, não uma morte confirmada** — uma instância viva
mas incapaz de escrever heartbeats aparece do mesmo jeito. E **duas versões diferentes fora de uma janela
de implantação** é a condição de versões mistas, que é reportada como um Critical no boot da instância
mais nova e nunca é impedida. Veja
[Operação](operations.md#quais-instâncias-estão-vivas-somente-no-modo-cluster) e
[Alta disponibilidade](high-availability.md#atualizações-param-o-mundo).

**Links dos aprovadores** — quando `ApproverPortal:Enabled`, uma seção listando cada aprovador que está no
pool de um perfil, com sua URL pessoal de portal e a quais pools de perfis ele pertence. Lida da base
operacional quando a página carrega, então um desligamento de aprovador aparece na próxima recarga. Ela
vive aqui e deliberadamente *não* em uma página de job: um link durável renderizado ao lado de um job se lê
como sendo sobre aquele job, e um operador o repassaria esperando que ele expirasse com o arquivo. Cada um
é exibido como um campo somente leitura para copiar, e não como uma âncora clicável, já que clicar em um
abriria a fila de outra pessoa no navegador do próprio operador. A seção carrega o aviso de capacidade:
trate cada link como a senha daquela pessoa, envie a cada aprovador somente o seu, e revogue removendo a
pessoa de todos os pools (uma pessoa) ou trocando o `ApproverPortal:LinkSecret` (todos). Com o portal
desligado, ela diz isso em vez do resto. Veja [Aprovações](approvals.md#o-portal-do-aprovador).

**Segundo fator dos aprovadores** — quando `ApproverSecondFactor:Enabled`, uma lista com uma linha por
aprovador em um pool, inscrito ou não, com a data de inscrição. Cada linha inscrita carrega um botão
**Redefinir**, que é o caminho do celular perdido: atrás de um diálogo de confirmação, ele limpa a
inscrição daquele aprovador, para que ele vincule um novo autenticador na próxima visita, e é registrado
sob o nome do operador como um evento de auditoria próprio. Veja
[Aprovações](approvals.md#provando-que-é-você).

Os botões de pausar/retomar o pipeline estão aqui, condicionados ao estado atual. O campo opcional
`reason` vai para a trilha de auditoria.

O botão `Cleanup` atualmente não faz nada, enquanto a história de retenção é finalizada. Veja
[Retenção](retention.md).

### Zona de perigo — Clear Jobs

Apaga permanentemente **todos** os registros de jobs — em todos os status, inclusive `Queued`, retidos e
em andamento — com suas linhas do tempo de histórico, evidências de aprovação e linhas de pagamento
interpretadas, e **todos os arquivos que esses jobs deixaram**: a entrada, a pasta `processing/<jobid>/`,
a pasta `error/<jobid>/`, e a saída assinada (ou a devolução `.reject` de um arquivo vetado). Ele também
apaga **todos os eventos operacionais** registrados antes do início da limpeza. Na interface em português
o botão se chama **Limpar Jobs**. Um diálogo de confirmação protege a ação e deixa explícito que ela é
irreversível, que os jobs não finalizados também vão embora e que um job em processamento é abandonado,
quais arquivos vão, e o que fica intacto. Cancelar ou fechar o diálogo não apaga nada.

:::warning Mudou na 2.9.0 e na 2.10.0 — o Clear Jobs leva tudo
Até a 2.9.0, o Clear Jobs apagava somente registros de jobs finalizados, pulava jobs `Queued`, retidos e
em andamento, e não tocava em arquivos nem em eventos operacionais. Agora ele apaga todo job, qualquer que
seja o status — sob `Cluster:Enabled`, também o job em execução de uma irmã — e os arquivos que esses jobs
deixaram (2.9.0), e todo evento operacional registrado antes da limpeza (2.10.0). O resultado não reporta
mais uma contagem de *pulados*.
:::

Ao confirmar, os arquivos são removidos primeiro e as linhas depois, de modo que um armazenamento
inalcançável faz a limpeza falhar antes que qualquer registro suma. Nada é forçado: um arquivo bloqueado
ou uma pasta que recusa a exclusão é deixado no lugar, contado e nomeado em uma linha de log de aviso, e a
sua linha é apagada mesmo assim. Em seguida ele escreve um único evento de auditoria `JobsCleared` como o
registro do corte — o ator, e quantos jobs, arquivos, pastas e eventos operacionais foram apagados, mais
quantos itens não puderam ser —, move o marcador de reset das
[estatísticas](statistics.md#zerando-o-painel) de escopo da implantação dentro da mesma transação, e
atualiza a página. A mensagem de resultado reporta todas as contagens, como aviso quando algo não pôde ser
apagado e como informação, e não sucesso, quando não havia nada para apagar.

**A limpeza vai até o fim mesmo se você sair da página** (2.11.1). Ela pode levar várias idas e vindas ao
armazenamento por job, então um operador que confirma e depois navega para `/jobs` para ver a tabela
esvaziar não a cancela mais; somente uma parada do serviço a interrompe, e essa interrupção é registrada no
log.

Intocado pelo Clear Jobs: estado do pipeline, perfis de assinatura, configuração, e arquivos de log. Os
contadores Prometheus em `/api/metrics` também não são afetados — eles são monotônicos.

:::warning
Não há como desfazer. Se você precisa do histórico de jobs ou da trilha de auditoria, faça backup da base
operacional primeiro — `db/bulksigner.db` sob SQLite, ou o backup do regime do seu SGBD sob SQL Server.
Veja [Retenção](retention.md#disciplina-de-backup). O **Exportar para Excel** da página de Jobs entrega uma
lista no nível de job, mas não as linhas do tempo nem os eventos operacionais. Para remover um job em vez
de todos, use o [Excluir da página de Jobs](#excluindo-um-job).
:::

Veja [Operação](operations.md#clear-jobs).

## `/events` — Eventos operacionais

A trilha de auditoria do host inteiro (2.13.0): todo evento operacional que o produto registra — pausa e
retomada do pipeline, criação e edição de perfis, decisões de aprovação, rejeições e expiração,
devoluções, divergência de entrada, assunções de trabalho no cluster, despacho e recusa do Lacuna Signer,
falhas de validação do CNAB240 e validações de data de pagamento puladas, exclusões de jobs, Clear Jobs,
inscrição e redefinição de aprovadores, desligamento do serviço.

| Aspecto | Comportamento |
|---------|---------------|
| Acesso | Todo operador, inclusive um `Administrator` do Entra. **Nunca** um aprovador — várias mensagens nomeiam aprovadores, pools e mudanças de perfil. |
| Ordem | Mais recentes primeiro, 50 por página, com **Anterior** / **Próxima** e uma contagem *x–y de n*. Cada horário é exibido na hora local do host **com o seu deslocamento**, para que um evento perto da meia-noite fique legível diante dos filtros por dia UTC. |
| Filtros | **Tipo de evento** — uma seleção múltipla dos tipos que realmente existem na base. **Mensagem contém** — uma substring literal (`%` e `_` não são curingas). **De** / **Até** — dias UTC inteiros, inclusivos, como na página de Jobs; um início depois do fim é avisado, em vez de mostrar uma tabela vazia. |
| Mensagens | Exatamente como registradas, em **inglês**, qualquer que seja o idioma de exibição — texto de auditoria persistido é evidência. |
| Atualização | Somente manual, pelo botão **Atualizar**: uma atualização automática sob um leitor que está paginando o histórico deslocaria as linhas debaixo dele. |
| Escritas | Nenhuma. Nada nesta página apaga, edita ou exporta um evento. A única coisa que remove eventos é o **Clear Jobs** em `/system`. |
| Modo cluster | A tabela é compartilhada, então toda instância mostra as mesmas linhas. |

O mesmo log está disponível por REST como `GET /api/events` e `GET /api/events/types` — veja
[API REST](rest-api.md#eventos).

## `/backup` — Backup do banco de dados

Onde um operador responde a uma pergunta — "meus backups estão funcionando?" — e faz um sob demanda. **O
link de navegação está presente em toda implantação**, inclusive nas de SQL Server: uma implantação em que
o backup não se aplica precisa de um lugar para ler *por quê*. A página renderiza em uma de três formas:

| Quando | O que ela mostra |
|--------|------------------|
| `Database:Provider = SqlServer` | Um alerta informativo e nada mais: a base está no seu próprio banco de dados, sob as suas próprias regras de backup, HA e DR. `Backup:Enabled = true` sob `SqlServer` recusa o boot. |
| `Sqlite`, `Backup:Enabled = false` | Um alerta dizendo o que ligar, mais as configurações que *valeriam*. Sem botões de ação. |
| `Sqlite`, habilitado | A página completa, abaixo. |

| Elemento | O que faz |
|----------|-----------|
| Resumo do destino | O `Backup:Destination` configurado (`Disk`, `S3` ou `AzureBlob`) e onde os artefatos aterrissam. Um destino inalcançável recebe um alerta de aviso com o motivo; ele é sondado quando a página abre e ao atualizar. |
| Fazer backup agora | Roda um backup imediatamente. Recusa com `backup.disabled` quando a funcionalidade está desligada. |
| Cancelar execução | Enquanto uma execução está em curso, atrás de um diálogo de confirmação — uma execução cancelada não é retomada; a próxima começa do início. |
| Agenda | O `Backup:IntervalHours` configurado, ou "somente manual" quando ausente, mais quando a próxima execução está prevista — ancorada na última execução **bem-sucedida**, de modo que uma reinicialização não a zera e uma execução falha não a consome. |
| Histórico | Execuções recentes com seu desfecho, tamanho e duração. |
| Retenção | O `Backup:RetainCount` e o que será podado. A poda roda somente após um armazenamento bem-sucedido e não pode reprovar a execução. |

Não existe, de propósito, um botão de restauração: uma restauração é uma ação de operador feita com o
serviço parado. Cada chave, inclusive o formato de credencial de cada destino, está em
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
não um operador. Presente somente quando um perfil de assinatura tem uma
[regra de aprovação](approvals.md).

| Aspecto | Comportamento |
|---------|---------------|
| Autenticação | **Nenhuma por padrão.** Qualquer um que alcance a URL pode aprovar — ou rejeitar — como qualquer pessoa do pool congelado do job, com o aviso declarado na própria página. Se o visitante já detém uma sessão do [portal do aprovador](#approvals--portal-do-aprovador) ou uma sessão `Approver` do Microsoft Entra, a página **o reconhece**: ela o nomeia em vez de oferecer o seletor, registra o método de identificação mais forte, e mostra os identificadores sem máscara. |
| Decisões | **Aprovar** ou **Rejeitar**, com um campo de motivo compartilhado opcional. Rejeitar exige um segundo clique de confirmação. Uma rejeição para o job, diga o quórum o que disser. |
| Mostra | Nome do arquivo, total geral, contagem de pagamentos, contagem de exclusões, intervalo de datas de pagamento, pagador, o pool congelado com a decisão de cada membro, o progresso rumo ao quórum, o orçamento de espera, e o hash do conteúdo. |
| Data de pagamento vencida | Quando a data de pagamento mais antiga do arquivo pendente é anterior a hoje, um aviso diz isso — e se o perfil vai recusar o arquivo na assinatura (ele precisa ser reexportado com datas atuais) ou assiná-lo mesmo assim. |
| Pagamentos individuais | A **mesma** tabela de pagamentos que a página de job do operador renderiza, paginada. Qual divulgação se aplica segue o *leitor*, não a página: um visitante anônimo vê o CPF/CNPJ reduzido aos seus dígitos verificadores e a conta aos seus últimos dígitos, ambos com a legenda *(parcial)*; um identificado os vê por inteiro. Ausente quando o job fica terminal, porque o detalhe de linhas é expurgado naquela transição. |
| Não oferecido | **Sem download do arquivo bruto**, em nenhuma superfície de aprovação. |
| Contexto de repetição | Quando o job é uma repetição de um previamente aprovado: quem aprovou o pai, e se o arquivo é idêntico byte a byte. Aquelas aprovações **não** contam para o quórum deste job. |
| Não encontrado | Um job que não existe e um job que nunca ficou retido renderizam a mesma mensagem, de modo que um id adivinhado não revela nada. |

**Em um job cujo conjunto de assinantes congelado inclui os aprovadores**, a página se divide conforme o
leitor: um leitor identificado recebe **Assinar e aprovar** — a mesma etapa de certificado que o portal
abre — e um leitor não identificado recebe a página somente leitura, com um botão para o portal do
aprovador. Com o segundo fator dos aprovadores ligado, um leitor não identificado também recebe a página
somente leitura. Rejeitar não muda. Veja [Aprovações](approvals.md).

Passo a passo completo: [Aprovações](approvals.md).

## `/approvals` — Portal do aprovador

A fila de um único aprovador, alcançada pelo seu próprio link durável ou por um login `Approver` do
Microsoft Entra. Como o `/approve/{id}`, renderiza no layout simples. Desligado a menos que
`ApproverPortal:Enabled` — veja [Configuração](configuration.md#approverportal).

| Aspecto | Comportamento |
|---------|---------------|
| Autenticação | Uma **sessão de aprovador**, em seu próprio esquema de cookie. Não é o cookie de operador nem a chave de API. Como ela carrega uma política de autorização, o `/approvals` **não** é uma rota anônima — que é o que torna um índice de aprovações pendentes admissível em primeiro lugar. Um **Sair** ao lado do nome do aprovador encerra a sessão; uma sessão obtida só pelo link cai na página que indica o caminho de volta. |
| Como entrar | `/approvals/link/{token}` — o link durável, anônimo porque é como uma credencial é obtida. Ele valida, define o cookie e redireciona; a partir daí o aprovador salva `/approvals` nos favoritos. Um token irresolúvel e um token ausente caem na mesma página, que não diz nada sobre o porquê. |
| Abas | **Aguardando você**, **Aguardando outros**, **Aprovados** — separadas por *sua decisão*, não pelo status do job. As duas primeiras são ambas `AwaitingApproval`. |
| Escopo | Somente jobs cujo **pool congelado** o nomeia. |
| Cada linha | Uma linha: nome do arquivo, status, total geral, contagens de pagamentos e exclusões, a contagem do quórum, quando ficou retido, o prazo para decidir — mais um sinal de risco, o **maior pagamento individual**, onde um zero a mais aparece. O pagador aparece somente quando a lista tem mais de um pagador distinto. Uma linha cujo conjunto de assinantes congelado inclui os aprovadores traz um chip **Exige assinatura**. |
| Aprovar | Um clique a partir da linha. Linhas marcadas em **Aguardando você** podem ser aprovadas como um lote pela barra de ferramentas; cada arquivo marcado é tentado independentemente do que os anteriores retornaram, e o resultado nomeia cada arquivo que não passou e o motivo. |
| Assinar | Em uma linha *Exige assinatura* o controle lê **Assinar e aprovar**: o aprovador assina com o próprio certificado — no navegador, pelo Lacuna Web PKI, ou guardado por um provedor em nuvem, pelo Lacuna CloudHub, onde a `CloudHub:ApiKey` está definida — e somente certificados com o CPF que o pool congelado registra para ele são oferecidos. Um lote pode misturar os dois tipos de arquivo. Veja [Aprovações](approvals.md). |
| Rejeitar | Na linha, atrás de um **diálogo modal** carregando o aviso de irreversibilidade e um motivo opcional — o botão da linha apenas pergunta. **Não existe rejeição em lote**, aqui nem em lugar nenhum. |
| Quem recebe | Expande a linha no lugar para a tabela de pagamentos, identificadores **por inteiro** — o leitor é uma pessoa específica, e não quem quer que detenha uma URL repassada. |
| Alcance de Aprovados | Limitado pelo `ApproverPortal:DecidedLookback` (90 dias por padrão) e limitado a 200 linhas. Quando o limite morde, a página avisa. |
| Exportação | **Exportar para Excel**, no mesmo lugar em todas as abas, desabilitado em vez de oculto quando a aba está vazia. Baixa a aba inteira, não as linhas marcadas. **Nível de job: uma linha por arquivo de pagamento, nunca uma por beneficiário.** Um bloco de título acima da tabela nomeia o leitor, o momento e a lista, e em **Aprovados** também sua janela de retrospecto e se o limite mordeu. |
| Não oferecido | Sem download do arquivo bruto. Sem rota para um job fora dos seus pools. |

Onde os operadores obtêm os links: a página **Sistema**, um por aprovador em um pool. Nunca a página do
job.

## Convenções da trilha de auditoria

Toda ação registra:

| Ação | Onde ela aparece |
|------|------------------|
| Pausar / retomar | Um evento de sistema + o motivo da pausa |
| Cancelar | Uma entrada de histórico no job cancelado |
| Repetir | Uma entrada de histórico no pai + uma entrada inicial de histórico no filho |
| Rescan | Um evento de sistema resumindo o resultado |
| Excluir um job | Um evento de sistema `JobDeleted` nomeando o que foi removido e mantido, o motivo se informado, e um resumo das aprovações |
| Clear Jobs | Um evento de sistema `JobsCleared` registrando o ator e quantos jobs, arquivos, pastas e eventos operacionais foram apagados (e quantos itens não puderam ser) — o primeiro evento da trilha depois da limpeza |
| Criar um perfil | Um evento de sistema nomeando o ator, o formato, a origem do certificado ou o método de assinatura, e se a verificação está ligada |
| Editar o comportamento de um perfil | Um evento de sistema `SigningProfileEdited`: ator, perfil, e cada campo alterado com os valores entre os quais mudou (uma pasta pelo nome, por exemplo `InputFolder (none) → remessas`) |
| Editar o certificado de um perfil | Um evento de sistema `SigningProfileCertificateEdited`: ator, perfil, os nomes dos campos que mudaram, e que a mudança vale na reinicialização — nunca um valor |
| Editar a regra de aprovação de um perfil | Um evento de sistema `SigningProfileApprovalEdited`: ator, perfil, o quórum e o orçamento de espera entre os quais mudou, e quantos aprovadores foram adicionados, removidos e alterados — contagens, nunca uma lista de nomes |

As mensagens seguem formatos consistentes, por exemplo `"Pipeline paused by operator. Reason: Quarterly
maintenance."` e `"Operator canceled: still investigating."`. Todas podem ser lidas em
[`/events`](#events--eventos-operacionais).

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
