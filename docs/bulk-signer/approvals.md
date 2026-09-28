---
sidebar_label: "Aprovações"
sidebar_position: 14
---

# Aprovações

Alguns arquivos de pagamento não deveriam ser assinados até que uma pessoa os tenha olhado. Um perfil de
assinatura pode exigir isso: um job roteado por ele para antes do assinador, fica retido em
`AwaitingApproval`, e espera até que gente suficiente de uma lista fixa tenha aprovado. Então ele assina.

:::danger Leia isto primeiro
A página de aprovação por job **não é autenticada**. Qualquer um que consiga abrir o link de aprovação de
um job pode aprovar — ou rejeitar — como qualquer pessoa do pool daquele job. Essa é uma decisão de
projeto deliberada para esta versão, e não um descuido, e ela muda como você precisa tratar o link. Veja
[Segurança](#segurança).

O [portal do aprovador](#o-portal-do-aprovador) opcional e o
[login pelo Microsoft Entra ID](#entrando-com-o-microsoft-entra-id) ambos estreitam isso
consideravelmente, e o [segundo fator](#provando-que-é-você) e um
[conjunto de assinantes em que os aprovadores assinam](#o-conjunto-de-assinantes) tiram, cada um, a
decisão por completo das mãos de um leitor não identificado.
:::

## Ligando isso

Acrescente um bloco `Approval` a um perfil de assinatura. Ele exige
[`CheckCNAB240: true`](cnab240.md) no mesmo perfil — um aprovador a quem não se pode mostrar o valor não
está aprovando nada significativo, então a interpretação é uma precondição, e não uma recomendação. O par
é recusado pelos dois lados da página do perfil: **Editar aprovação** recusa uma regra em um perfil cuja
verificação está desligada, e **Editar comportamento** recusa desligar a verificação enquanto houver uma
regra, nomeando o remédio — remova a regra primeiro. Um job que chegue à etapa sem a interpretação mesmo
assim, em um perfil gravado antes de essa segunda recusa existir, falha pelo nome
(`approval.content-unmeasured`) em vez de ficar retido como um job sobre o qual nenhum aprovador jamais
conseguiria decidir.

:::warning Mudou na 2.1.0 — em uma implantação em execução, a regra é editada pela página do perfil
Os perfis de assinatura vivem na base operacional, e o `Signing:Profiles[]` é uma semente de uso único,
importada no primeiro boot. Em uma implantação que já subiu uma vez, o JSON abaixo é **inerte**: ele
descreve o formato de um *primeiro* boot. Depois disso, a regra é editada em **Editar aprovação** em
`/profiles/{name}` — o pool (acrescentar, remover e editar membros), o quórum e o orçamento de espera,
com as mesmas recusas e sem reinicialização —, e a etapa também pode ser acrescentada a um perfil ou
removida dele ali. Um perfil cujos aprovadores assinam, e que portanto não tem chave própria, é
**criado já com sua regra** em `/profiles/_new`, escolhendo **Nenhum — os aprovadores assinam** como
método de assinatura. Tudo o que esta página diz sobre o que uma regra *significa* vale em todas as
superfícies; o que muda é onde você a digita.

Uma mudança salva ali chega ao próximo arquivo que ficar retido. Jobs já retidos mantêm a regra que
congelaram — veja [A regra congelada](#a-regra-congelada).
:::

```json
{
  "Signing": {
    "Profiles": [
      {
        "Name": "pagamentos-bb",
        "Format": "Cades",
        "Method": "Local",
        "CheckCNAB240": true,
        "Certificate": {
          "Source": "Pfx",
          "Pfx": { "Path": "/etc/bulksigner/pagamentos.pfx", "Password": "" }
        },
        "Approval": {
          "MinimumApprovers": 2,
          "ExpiresAfter": "2.00:00:00",
          "Signers": "ProfileKey",
          "Approvers": [
            { "Name": "Maria Silva", "Email": "maria@empresa.com.br", "Cpf": "123.456.789-09" },
            { "Name": "João Souza",  "Email": "joao@empresa.com.br",  "Cpf": "111.444.777-35" },
            { "Name": "Ana Costa",   "Email": "ana@empresa.com.br",   "Cpf": "529.982.247-25" }
          ]
        }
      }
    ]
  }
}
```

**`Approvers` é um pool, não uma lista de verificação.** Com três entradas e `MinimumApprovers: 2`,
quaisquer duas das três satisfazem o job; nenhum indivíduo é obrigatório.

### O conjunto de assinantes

:::tip Novo na 2.1.0 — os aprovadores podem assinar o próprio arquivo de pagamento
Até a 2.0.x uma aprovação era sempre um clique, e o certificado do próprio perfil assinava o arquivo. O
conjunto de assinantes permite que os aprovadores o coassinem com seus próprios certificados ICP-Brasil,
em vez da chave do perfil ou além dela.
:::

O `Signers` diz **de quem são as assinaturas que o arquivo entregue carrega**. Um de três valores, e não
há um quarto:

| Valor | Quem assina o arquivo entregue | O que é uma aprovação |
|---|---|---|
| `ProfileKey` | O próprio certificado do perfil, como todo perfil fazia antes de o valor existir. O padrão, e o que todo perfil existente e todo job retido antes de o valor existir leem. | Um clique — no portal, na página por job ou na rota anônima. |
| `Approvers` | O próprio certificado ICP-Brasil de cada membro do pool que aprova, e o do perfil **de jeito nenhum**. Um perfil assim é **sem chave**: não guarda certificado algum, nada é aberto para ele na inicialização, e ele não fica degradado por não ter um. Ele pode ser criado assim, com pool e tudo, em `/profiles/_new` — nenhum certificado é pedido — e precisa do formato `Cades`, já que a assinatura de um aprovador é uma coassinatura CAdES. | Uma assinatura — veja [Aprovando por assinatura](#aprovando-por-assinatura). |
| `ProfileKeyAndApprovers` | Ambos: os aprovadores assinam enquanto o job espera, e a chave do perfil coassina o que eles assinaram quando o job é liberado. Recusado junto com `Method: LacunaSigner`, em que o assinador remoto receberia um envelope em vez de uma remessa. | Uma assinatura. |

É um valor, e não duas chaves liga/desliga, para que "ninguém assina" não possa ser escrito, e ele vive
sob `Approval` porque dois de seus três valores não significam nada sem um pool. Assim como o pool, o
quórum e o orçamento de espera, ele é **congelado por inteiro no job** no momento em que o job fica
retido: um aprovador que assina um arquivo está fazendo uma afirmação sobre um formato final conhecido, e
desligar a chave do perfil por baixo dele transformaria "coassinamos com a empresa" em "só nós
assinamos" — veja [A regra congelada](#a-regra-congelada).

Escolher qualquer dos conjuntos com aprovadores é uma regra do momento de salvar, nunca uma recusa de
boot. Ele precisa de:

- **um meio de assinatura** — um `WebPki:License` para um certificado no navegador do aprovador, ou um
  `CloudHub:ApiKey` para um na nuvem; qualquer dos dois basta (veja [Configuração](configuration.md));
- **um jeito de identificar um aprovador** — `ApproverPortal:Enabled`, ou uma seção `Auth:EntraId`, as
  duas únicas credenciais para as quais uma assinatura é registrada;
- **`CheckCNAB240`**, como qualquer regra de aprovação, e o formato **`Cades`**.

Cada aprovador então precisa de um certificado próprio, descrito em [Certificados](certificates.md). O
valor é semeado a partir do `Signers` acima ou, depois do primeiro boot, escolhido no formulário de
aprovação da página do perfil (**Conjunto de assinantes**), onde passar para um conjunto com aprovadores
é confirmado depois de um aviso — veja o fim de [Aprovando por assinatura](#aprovando-por-assinatura).

:::warning Escreva `ExpiresAfter` com o componente de dias
`"2.00:00:00"` é a janela de quarenta e oito horas acima. Um valor de três componentes é `hh:mm:ss`
apenas enquanto o primeiro número for 23 ou menos; em 24 ou mais o .NET lê aquele número como **dias**,
então `"48:00:00"` são quarenta e oito *dias*. O validador não o recusa — uma janela longa pode ser
deliberada — mas o **banner de inicialização avisa em 24 dias ou mais**, nomeando o valor resolvido e a
grafia que o corrige:

```
  pagamentos-bb   Cades · cert=Pfx · verify=on · encrypt=off · validate-cert=on · cnab240=on · approval=2/3 · expires=1152h

WARN  Profile 'pagamentos-bb' has an approval wait budget of 1152h (48 days) …
      Forty-eight hours is "2.00:00:00". Ignore this if the long window is deliberate.
```

O banner é onde isso é detectável na configuração — toda outra superfície somente leitura mostra o prazo
quando um job já ficou retido sob ele. Leia o banner após editar o valor.

**A página do perfil contorna a grafia por completo**: seu orçamento de espera é um número de horas, que
não pode ser lido de duas formas, e um orçamento já gravado sob o engano aparece ali como as 1.152 horas
que ele de fato é. Ela pergunta antes de salvar um orçamento no mesmo limiar de 24 dias ou acima dele.
:::

Cada chave, seu tipo e seu padrão estão em
[Configuração](configuration.md#signingprofilesapproval--a-etapa-de-aprovação). A inicialização recusa
uma semente, antes de o primeiro job rodar, com: um bloco `Approval` sem `CheckCNAB240`; um pool vazio;
um `MinimumApprovers` abaixo de 1 ou maior que o pool; um e-mail malformado, ou o mesmo e-mail duas vezes;
um CPF cujos dígitos verificadores não conferem; um `ExpiresAfter` não positivo. **Editar aprovação**
recusa os mesmos formatos no momento de salvar — mais um nome em branco —, nomeando a linha a que se
referem, no seu idioma de exibição, e não grava nada. Uma regra de autorização meio configurada não é uma
funcionalidade degradada — é um portão que parece fechado e não está.

## A vida de um job retido

1. **Interpretação.** O worker coloca uma cópia do arquivo em stage em `processing/<jobid>/`,
   interpreta-o como uma [remessa CNAB240](cnab240.md), e registra o total, as contagens de pagamentos e
   de cancelamentos, o intervalo de datas de pagamento, o pagador, e um SHA-256 dos bytes exatos que
   leu.
2. **Retenção.** A regra de aprovação do perfil — pool, quórum, orçamento de espera e conjunto de
   assinantes — é **copiada para o job** e o job passa a `AwaitingApproval`. O slot de concorrência do
   worker é liberado imediatamente, então uma folha de pagamento retida não custa nada enquanto espera,
   e uma implantação com `MaxConcurrency = 1` continua trabalhando.
3. **Espera.** Os aprovadores decidem — pela fila no portal, pela página por job ou pela rota anônima.
   Cada um tem exatamente uma decisão. Em um perfil cujos aprovadores assinam, cada aprovação é uma
   coassinatura acrescentada ao arquivo enquanto ele espera.
4. **Liberação, ou parada.** No momento em que o quórum é atingido, o job volta a `Queued` e o pipeline é
   acordado. Uma única rejeição, em vez disso, encerra o job como `Canceled` — veja
   [A rejeição é um veto](#a-rejeição-é-um-veto) — e o mesmo faz o esgotamento do orçamento de espera, se
   o perfil definiu um.
5. **Assinatura.** O caminho comum de reivindicação o pega, **retoma sobre a cópia em stage**, reconfere
   as datas de pagamento e o hash de conteúdo, e assina — com a chave do perfil, ou promovendo as
   assinaturas dos próprios aprovadores (com a da chave do perfil ao lado, sob `ProfileKeyAndApprovers`).
   O arquivo assinado é verificado contra exatamente os signatários que o conjunto congelado nomeia.

Não há worker em segundo plano para nada disso. O estado de aprovação vive no mesmo banco de dados em
que o handler escreve, então o instante em que o quórum é satisfeito é conhecido onde ele acontece; a
única coisa dirigida por um relógio — a expiração — pega carona no laço de consulta existente do
pipeline.

Do lado do operador, o `/jobs` tem uma coluna **Aprovações** (nova na 2.12.0) que carrega um chip em cada
linha `AwaitingApproval`: quantas aprovações ainda faltam, *quórum atingido* ou *rejeitado* — lidos da
regra congelada no job, nunca do perfil atual. Veja [Dashboard](dashboard.md).

### O orçamento de espera

O `ExpiresAfter` é opcional e **ausente por padrão**, caso em que um job retido espera indefinidamente.
Defina-o e um job sobre o qual ninguém decide dentro da janela é cancelado:

- O motivo registrado na linha do tempo é **`Approval window expired.`**, seguido de quanto tempo ele
  esperou e quantas aprovações havia coletado.
- A cópia em stage é movida para `error/`, exatamente como faz um cancelamento de operador — e
  **diferentemente de uma rejeição**, que devolve o arquivo para `output/`. A diferença é deliberada: um
  veto é uma afirmação sobre o arquivo, enquanto uma expiração é o produto desistindo de esperar. O
  original permanece em `input/` e o observador não o ressuscitará automaticamente.
- Um evento operacional `ApprovalExpired` é registrado, e o
  `bulksigner_approvals_expired_total{profile}` é incrementado.
- **As aprovações já registradas são mantidas.** A regra congelada também. Uma expiração encerra a
  espera; ela não apaga a parte que aconteceu.

A janela é medida contra o orçamento **congelado naquele job**, nunca contra o que está atualmente no
perfil, de modo que encurtar o valor não expira retroativamente jobs sobre os quais as pessoas ainda
estão decidindo. A verificação roda no laço de consulta do pipeline, então um job é cancelado dentro de
um `Pipeline:PollIntervalSeconds` de seu prazo, em vez de exatamente nele.

Duas propriedades que vale conhecer antes de defini-lo:

- **Uma pausa não o estende.** O orçamento é um prazo de relógio de parede, não um orçamento de tempo de
  atividade do pipeline, então um pipeline pausado ao longo de uma janela expirará os jobs cujas janelas
  se fecharam durante a pausa.
- **Um empate é resolvido a favor dos humanos.** Se um quórum é atingido, uma rejeição chega, ou um
  operador cancela no mesmo momento em que a varredura roda, quem chegou primeiro vence.

:::note A expiração é arrumação da casa, não um controle de correção
O que protege o dinheiro em um arquivo de pagamento que ficou parado tempo demais é a
[guarda das datas de pagamento](cnab240.md#datas-de-pagamento-que-já-passaram), que se recusa a assinar
uma remessa cujas datas de pagamento passaram, qualquer que tenha sido a origem da demora — inclusive em
um perfil sem orçamento de espera nenhum. Um perfil pode desligar essa guarda
(`CheckCnab240PaymentDates = false`, para um banco que processa pagamentos com data passada no próximo
dia útil — veja [Desligando a guarda](cnab240.md#desligando-a-guarda)); aí nada fica ali além dos
aprovadores, e é por isso que a página de aprovação os avisa quando uma data já passou — veja
[O que o aprovador vê](#o-que-o-aprovador-vê).
:::

### A regra congelada

Quando um job fica retido, o pool de aprovadores, o quórum, o orçamento de espera e o
[conjunto de assinantes](#o-conjunto-de-assinantes) recebem um snapshot no job e **nunca são relidos do
perfil**. Editar o `appsettings.json` e reiniciar não muda o que um job retido exige — e editar a regra em
`/profiles/{name}` também não, que é a mesma propriedade diante de uma superfície mais rápida.

Isso é deliberado e sustenta a carga. Sem isso, baixar o `MinimumApprovers` de 3 para 1 satisfaria o
quórum de todo job retido de uma vez — a página do perfil seria um desvio de autorização, e um que nem
precisaria mais de reinicialização. Também faria a trilha de auditoria mentir: alguém que aprovou sob "2
de 3" apareceria depois como tendo aprovado sob "1 de 3". Da mesma forma, alguém acrescentado ao pool hoje
não consegue aprovar um arquivo que ficou retido ontem.

## O que o aprovador vê

A página por job vive em `/approve/{jobId}` e mostra:

| | |
|---|---|
| **Nome do arquivo** | como ele chegou |
| **Total geral** | soma dos registros de inclusão, em reais; exclusões são contadas, nunca compensadas |
| **Pagamentos** | número de registros de inclusão |
| **Cancelamentos** | número de registros de exclusão |
| **Datas de pagamento** | mais antiga–mais recente, ou uma única data quando o arquivo inteiro paga em um só dia |
| **Pagador** | *Nome da Empresa* e *Número de Inscrição* do Header do Arquivo |
| **Progresso** | "1 de 2 aprovações", quem decidiu, e quem não |
| **Hash do conteúdo** | o SHA-256 ao qual a aprovação será vinculada |
| **Prazo** | quando a solicitação expira e o job é cancelado sem assinatura — exibido somente quando o perfil define um orçamento de espera |

Mais, em um job ainda aguardando cuja data de pagamento mais antiga já é anterior a hoje, um aviso **A
data de pagamento já passou** (novo na 2.15.0). Sua redação segue a guarda das datas de pagamento do
perfil como o perfil a tem *agora* — a guarda roda na assinatura, e não na retenção, então é lida ao vivo
em vez de a partir da regra congelada. Com a guarda ligada, o aviso diz que o arquivo falhará na
assinatura mesmo se aprovado e precisa ser exportado de novo; com ela desligada (ou com o próprio CNAB240
desligado), que o arquivo será assinado se aprovado. Um perfil que esta instância ainda não tem — criado
em outra instância dentro da última consulta — recebe a data e nenhuma previsão. O aviso não muda nada
sobre se uma decisão é aceita. Veja [Desligando a guarda](cnab240.md#desligando-a-guarda).

Mais, quando o job é uma repetição de um previamente aprovado, uma linha dizendo quem aprovou o pai e se o
arquivo é idêntico byte a byte ao que aquela pessoa viu. **Aquelas aprovações não são transportadas** —
uma repetição precisa das suas.

Um aprovador escolhe seu endereço no pool, opcionalmente escreve um motivo, e clica em **Aprovar** ou
**Rejeitar**. Rejeitar exige um segundo clique de confirmação. Uma decisão é final em qualquer dos casos;
mudá-la significa pedir a um operador que cancele o job e o reexecute.

O seletor é o caminho anônimo. Um leitor que o servidor já consegue nomear — uma sessão de link do portal,
ou um login do Microsoft Entra carregando a role Approver — é informado de quem é, em vez de ser
perguntado, e sua decisão registra o método que o identificou. Em um job cujo conjunto de assinantes
congelado inclui os aprovadores, o seletor some: um leitor não identificado recebe a página somente
leitura, e um identificado recebe **Assinar e aprovar** — veja
[Aprovando por assinatura](#aprovando-por-assinatura).

### Os pagamentos individuais

Abaixo dos números, a mesma tabela paginada de pagamentos que a página de job do operador usa — cada
registro portador de valor do arquivo, uma linha cada.

**Um total sozinho não é uma aprovação; é um carimbo.** "R$ 1.240.000 em 312 pagamentos, sim ou não" não
dá a um humano forma alguma de notar o zero a mais em um lote de folha de pagamento, o beneficiário que
aparece duas vezes, ou o número de conta que mudou discretamente desde o mês passado. Esses são
precisamente os erros que esta etapa existe para pegar, e cada um deles é invisível em um total geral.

| Coluna | Na página de aprovação anônima | Por quê |
|--------|--------------------------------|---------|
| Registro, lote, segmento | por inteiro | Onde no arquivo isto está, e que tipo de pagamento é |
| Nome no registro | por inteiro | **Esta é a decisão.** Um beneficiário duplicado ou inesperado só é visível aqui |
| Data de pagamento | por inteiro | Parte da decisão — uma data que ninguém esperava é motivo para rejeitar |
| Valor | por inteiro | A decisão. Linhas de exclusão são rotuladas e riscadas, e não entram no total |
| CPF / CNPJ | **somente dígitos verificadores** — `***.***.***-09` | Não necessário para decidir. Suficiente para distinguir duas pessoas homônimas |
| Conta | **somente últimos dígitos** — `***149-4`, agência omitida | Não necessário para decidir. Suficiente para responder "esta conta mudou?" |

As colunas mascaradas têm a legenda *(parcial)* — um cabeçalho "CPF" sem qualificação sobre um valor
mascarado se lê como o número inteiro, e um aprovador comparando-o com um documento concluiria que o
arquivo está errado.

**A regra de mascaramento segue o leitor, não a página.** Um aprovador que o servidor consegue nomear —
por um link do portal ou um login do Entra — vê os identificadores por inteiro, nesta página e em sua
fila. A redução existe para a superfície alcançável por quem quer que detenha uma URL repassada.

Algumas linhas legitimamente não têm nem identificador nem conta: um boleto (segmento J), um tributo (N) e
um pagamento de concessionária (O) são pagos contra um código de barras ou ao governo. Aquelas células
mostram um travessão — uma ausência, não uma máscara. Em uma linha de **tributo** o nome é o
*contribuinte*, não o destinatário, e a página avisa isso acima da tabela.

:::note
A tabela só está ali enquanto o job está em andamento. O detalhe de linhas é expurgado na transição para
qualquer status terminal ([Retenção](retention.md#a-única-exceção-detalhe-de-linhas-do-cnab240)), então um
aprovador que abre um link para um job já decidido vê os totais e uma nota dizendo que as linhas se foram.
:::

### O que a página de aprovação deliberadamente não oferece

- **Sem download do arquivo bruto**, em nenhuma superfície de aprovação. Uma tabela renderizada e
  paginada é uma divulgação limitada a serviço de uma decisão; o arquivo em si é um dump completo,
  legível por máquina, do CPF e da conta bancária de cada beneficiário. Os bytes brutos ficam atrás da
  superfície autenticada do operador (`GET /api/jobs/{id}/output`). Desmascarar a tabela para um
  aprovador identificado não liberou os bytes.
- **Sem índice *anônimo* de aprovações pendentes.** Nenhuma rota não autenticada lista jobs aguardando
  aprovação; a página é alcançável apenas com um id de job específico, e ids de job são GUIDs v4. O
  [portal do aprovador](#o-portal-do-aprovador) *é* um índice, mas carrega uma política de autorização e
  lista apenas os jobs cujo pool congelado nomeia quem o está lendo.

## O portal do aprovador

Um link por arquivo de pagamento, repassado por um operador, funciona para um arquivo e deixa de
funcionar para quem aprova quarenta por mês. Ligue o `ApproverPortal`
([Configuração](configuration.md#approverportal)) e cada aprovador ganha **um link durável em vez
disso**, que abre sua própria fila em `/approvals`:

```json
{
  "ApproverPortal": {
    "Enabled": true,
    "LinkSecret": "…"
  }
}
```

Na prática, defina o `LinkSecret` via `ApproverPortal__LinkSecret` — mínimo de 32 caracteres, imposto na
inicialização. Depois abra a página **Sistema** do dashboard: cada aprovador do pool de cada perfil é
listado com seu link pessoal. Envie a cada pessoa apenas o dela, uma vez — o link não expira e não muda.

O portal, a página por arquivo e a página de link necessário carregam a marca do produto no cabeçalho —
e, quando a implantação nomeia um logotipo do cliente (veja [Configuração](configuration.md)), esse
logotipo ao lado. Um aprovador geralmente é o próprio pessoal do financeiro do cliente, e a marca que ele
reconhece é a do empregador.

### O que ele mostra

Três abas, separadas pela **decisão do próprio aprovador**, e não pelo status do job:

| Aba | Contém |
|-----|--------|
| **Aguardando você** | Arquivos retidos sobre os quais você não decidiu. Seu trabalho de fato. |
| **Aguardando outros** | Arquivos retidos sobre os quais você *já* decidiu, ainda aquém do quórum. |
| **Aprovados** | Arquivos que você decidiu e que já saíram da etapa, dentro do `DecidedLookback` (90 dias por padrão). |

As duas primeiras são ambas `AwaitingApproval` — um job com uma de três aprovações é simultaneamente
"pendente" e "parcialmente aprovado" — razão pela qual a página não é separada por status.

Cada linha é uma linha: o nome do arquivo, o total geral, as contagens de pagamentos e exclusões, a
contagem do quórum, e o prazo para decidir, se o perfil definir um. Uma linha cujo
[conjunto de assinantes](#o-conjunto-de-assinantes) do perfil inclui os aprovadores carrega um chip
**Exige assinatura** ao lado do status: sua aprovação é uma coassinatura com o seu próprio certificado,
seu botão diz **Assinar e aprovar**, e ela tem uma caixa de seleção como qualquer outra, então pode fazer
parte de um lote. O pagador aparece somente quando a fila tem mais de um. Mais um número escolhido porque
ele pega o erro para o qual esta etapa existe:

- **Maior pagamento individual** — onde um zero a mais aparece. Um total geral é um número sobre o qual
  ninguém tem uma expectativa prévia; um pagamento uma ordem de grandeza acima de seus vizinhos é visível
  de relance.

**A fila se atualiza sozinha.** A cada `ApproverPortal:PollInterval` — dez segundos por padrão — a página
relê a sua fila, então você não precisa recarregá-la para saber se um colega agiu. O cabeçalho carrega a
prova: há quanto tempo foi atualizada, um indicador enquanto lê, e um botão **Atualizar agora** para
quando você quiser já. Se uma leitura falha, **a fila que você está olhando continua na tela** e o
cabeçalho diz que a atualização falhou e quando ela deu certo pela última vez; os botões de decisão
continuam funcionando, porque uma decisão é conferida contra o banco de dados no momento em que você a
toma de qualquer forma. A única exceção é a primeira carga: sem fila a manter, uma falha ali é uma
mensagem de erro.

Uma atualização nunca acontece no meio de um lote, nem enquanto o pedido de segundo fator está aberto.
Ela **pode** rodar por baixo dos dois diálogos de confirmação, então, se um colega leva um dos seus
arquivos selecionados ao quórum enquanto você lê a reafirmação, esse arquivo sai do lote antes de ele
rodar: a direção é sempre segura — um arquivo que mudou nunca é tocado —, mas a contagem que você
confirmou pode estar uma marcação desatualizada. A linha de progresso conta o lote que de fato rodou.

**Sair também está no cabeçalho**, ao lado do seu nome. Encerra a sessão deste navegador — a sessão do
link, ou o login da Microsoft — e nada mais: seu link não é tocado, e abri-lo de novo emite uma nova
sessão. Onde você cai diz como voltar: a página *Link de aprovação necessário* para um link, o login da
Microsoft para uma conta do Entra. Use em uma máquina compartilhada: deixada quieta, uma sessão de link
dura `ApproverPortal:SessionLifetime` (30 dias por padrão, deslizante) e um login da Microsoft, oito horas,
também deslizantes.

**O chip de contagem é um link.** `1 de 2 aprovações` diz quantas; clicar nele abre a própria página do
job em uma nova aba, que é o único lugar que responde *quais* de vocês, quando, e — em uma rejeição — por
quê. O que um aprovador vê ali não é a visão do operador: somente jobs cujo pool congelado o nomeia, sem
os CPFs do pool, e sem Tentar novamente, Cancelar ou Baixar. Aprovar e rejeitar continuam na linha.

:::warning Sem detecção de duplicatas
Uma comparação contra o arquivo anterior do mesmo pagador foi removida em favor de uma fila que se lê de
relance, então **nada no produto hoje sinaliza um arquivo reenviado duas vezes**. O intervalo de datas de
pagamento também saiu da linha, mas aquele era cinto e suspensório sobre uma verificação de máquina — o
pipeline continua recusando uma remessa cujas datas de pagamento passaram, em todo perfil que mantém a
guarda das datas ligada. Em um perfil que a desliga, a página por job — e não a linha — avisa isso antes
de alguém aprovar.
:::

### Selecionando o que fazer

Cada linha em **Aguardando você** carrega uma caixa de seleção, e uma barra acima da lista totaliza o que
você marcou. A caixa de selecionar tudo tem três estados — nenhum, alguns, todos. As outras duas abas não
têm nem caixa nem barra.

A barra carrega dois números: **Total selecionado** é o dinheiro; **Pagamentos selecionados** é a quantos
pagamentos aqueles arquivos correspondem, com quaisquer exclusões contadas separadamente — *(+3
exclusão)* — nunca compensadas. Um zero a mais aparece no valor; um arquivo enviado duas vezes ou cortado
pela metade aparece na contagem.

A marcação sobrevive a expandir e recolher uma linha, e é limpa para qualquer arquivo que deixe a lista
enquanto você está olhando — aprovado até o quórum por um colega, rejeitado ou expirado. Como a fila se
recarrega sozinha, isso pode acontecer com as suas mãos longe do teclado, então é **dito, e não feito em
silêncio**: uma nota dispensável acima da lista nomeia os arquivos que saíram, os mais recentes primeiro,
e em linhas gerais o que houve com cada um — liberado para assinatura, interrompido antes de ser
assinado, ou simplesmente não aguarda mais a sua aprovação. Um status sozinho não distingue um veto de um
prazo vencido, e a nota não finge que distingue; a própria página do job guarda a resposta precisa, e
você a alcança pelo chip de contagem da linha — então abra um arquivo sobre o qual tenha dúvida **enquanto
ele ainda está na sua lista**. As entradas mais antigas caem depois de dez.

**Arquivos sem total geral são excluídos da soma** e informados ao lado dela como uma contagem — *2
arquivos não têm total e não estão neste valor* — em vez de contados como zero. Se todo arquivo marcado
não tiver total, o número é um travessão, nunca `R$ 0,00`; uma remessa só de exclusões ainda mostra
`R$ 0,00`.

### Aprovando um lote

**Aprovar N selecionados** age sobre as linhas marcadas e sobre nada mais. Não há um "aprovar todos"
separado — marcar a caixa do cabeçalho e apertar este botão é o que isso significa.

Ele confirma primeiro, em um diálogo que reafirma a contagem, o total, o maior arquivo individual do lote
e — quando houver algum — **quantos dos arquivos são aprovados por assinatura**, e não por clique. Não há
como desfazer por trás disso.

Uma seleção pode misturar os dois tipos livremente. Se algum arquivo nela for aprovado por assinatura, a
confirmação também pergunta **onde está o seu certificado** — em uma implantação com
[CloudHub](#assinando-com-um-certificado-em-nuvem) ela oferece **Certificado neste navegador** e
**Certificado em nuvem** como seus dois botões de confirmação, e em uma sem licença do Web PKI a nuvem é o
único. Com o navegador escolhido, a próxima coisa que você vê é o seletor de certificados, **uma vez para
o lote inteiro**: escolha o certificado emitido para você e aperte **Continuar**. Com a nuvem escolhida,
veja [Aprovando um lote com um certificado em nuvem](#aprovando-um-lote-com-um-certificado-em-nuvem)
abaixo.

Assim como em um único arquivo, somente os certificados emitidos para o seu CPF são listados — o CPF que
os pools congelados dos arquivos registram para você —, e os demais são contados, não oferecidos.
Normalmente é um CPF só. Se o pool de aprovadores foi editado entre a retenção de alguns dos arquivos,
eles podem ter congelado CPFs **diferentes** para você: então um certificado emitido para qualquer deles é
listado, o diálogo avisa isso, e cada arquivo continua sendo conferido contra o CPF que registrou — um
arquivo com o qual o certificado não confere é recusado no relatório. O código do segundo fator, onde
exigido, é pedido depois disso e somente se o lote também tiver arquivos aprovados por clique; os
assinados são a própria prova de presença da sua assinatura.

Então as aprovações rodam uma após a outra, e **todo arquivo selecionado é tentado**, independentemente
do que os anteriores retornaram — *Aprovando 3 de 12…* enquanto trabalha. Um arquivo aprovado por clique
é registrado exatamente como um clique único seria. Um arquivo aprovado por assinatura passa pelas mesmas
verificações que o **Assinar e aprovar** da linha faz, e então o seu navegador o assina; o pedido de PIN,
se o seu token pedir um, aparece para cada arquivo assim, um de cada vez. Se você cancelar o pedido de PIN
em um arquivo, os demais arquivos aprovados por assinatura ficam sem assinatura e são nomeados no
relatório, em vez de pedir de novo um a um; os arquivos aprovados por clique ainda passam.

O relatório tem duas partes: um agregado (*9 de 12 aprovados; 6 seguiram para a assinatura*), e **uma
lista nomeando cada arquivo que não passou, e o motivo.**

Espere alguns. Cada aprovação é uma chamada independente, e um colega pode ter agido enquanto você lia —
então *já decidido*, *não está mais aguardando aprovação — está Canceled* (que é como a rejeição de um
colega se parece daqui), e *você não está no pool de aprovadores deste arquivo* são todos desfechos
comuns. Em um arquivo aprovado por assinatura, as recusas do certificado e um navegador que não conseguiu
assinar são relatados com as mesmas palavras que o botão da linha usaria, e um colega assinando o mesmo
arquivo enquanto você o assinava é um *conflito* — recusado sem nada registrado.

Arquivos que foram aprovados se desmarcam sozinhos; **arquivos que falharam continuam marcados**, de modo
que apertar o botão de novo repete exatamente aqueles. Quando toda falha do relatório é um conflito, a
mensagem também oferece **Assinar novamente** para exatamente esses arquivos — a assinatura do colega
agora faz parte do arquivo, e assiná-lo como ele está agora é todo o remédio. Se a fila foi atualizada e
esses arquivos não estão mais nela — a assinatura do colega atingiu o quórum —, o botão diz isso em vez
disso.

#### Aprovando um lote com um certificado em nuvem

:::tip Novo na 2.14.0 — um único login no provedor para um lote inteiro
Onde o `CloudHub:ApiKey` está definido, **Aprovar N selecionados** oferece a nuvem ao lado do navegador,
de modo que um host sem licença do Web PKI consegue aprovar arquivos assinados em lote.
:::

Com a nuvem escolhida, você se autentica no seu provedor **uma vez para o lote inteiro**. O diálogo que
se abre lista os provedores que têm um certificado para o seu CPF, exatamente como o da linha; escolha o
seu e o navegador sai para ele. **Nada é aprovado antes de você voltar** — nem os arquivos assinados nem
os clicados. Quando o provedor o traz de volta ao portal, os arquivos com que você saiu são marcados de
novo, o código do segundo fator é pedido se o lote tiver arquivos clicados e o fator estiver ligado, e
então o lote inteiro roda sozinho, com o mesmo relatório por arquivo de um lote no navegador. Cada arquivo
assinado é conferido contra o CPF que registrou, e sua decisão nomeia o provedor pelo qual você assinou.

Três coisas são particulares da nuvem:

- **Os arquivos assinados precisam compartilhar um CPF seu.** Uma sessão na nuvem é aberta sob um único
  CPF, então um lote cujos arquivos assinados congelaram CPFs diferentes para você tem seu botão de nuvem
  substituído por uma frase dizendo quantos CPFs; assine-o no navegador, ou desmarque arquivos até que os
  assinados concordem. Normalmente isso nunca aparece.
- **O lote vive por quinze minutos.** Volte do provedor depois disso e nada no lote é aprovado; os
  arquivos são marcados de novo, e aprová-los é outro login no provedor. Fechar o pedido de código na
  volta também não aprova nada.
- **Uma falha do provedor no meio para as chamadas à nuvem.** Se o CloudHub ou o seu provedor falha em um
  arquivo — a sessão expirou, o provedor está fora do ar —, os demais arquivos assinados são nomeados no
  relatório como não assinados, em vez de cada um tentar e falhar, e os arquivos clicados ainda passam.
  Assiná-los de novo é outro login no provedor, assim como o **Assinar novamente** do relatório depois de
  um conflito.

Arquivos que saíram da sua fila enquanto você estava no provedor — a decisão de um colega, uma espera
expirada — não são executados, e o relatório diz quantos.

**Em uma implantação sem licença do Web PKI e sem CloudHub**, um lote com arquivos aprovados por
assinatura é recusado na confirmação, antes de qualquer coisa rodar, dizendo quantos; os arquivos
clicados nele também não são executados. É um perfil cujo conjunto de assinantes foi escolhido enquanto
um dos dois existia, em um host que desde então o perdeu.

:::info Não existe rejeição em lote
Nesta nem em nenhuma outra superfície. Rejeitar é um juízo sobre o conteúdo de um arquivo, e destrói o job
de forma irreversível; N dessas em um clique é um ato diferente, sem sujeito revisável.
:::

### Aprovando ou rejeitando um arquivo

**Aprovar** é um clique a partir da linha. **Rejeitar** também está na linha, mas abre um diálogo modal
carregando o aviso de irreversibilidade e um motivo opcional, e seu **Sim, rejeitar** é o ato — o botão da
linha apenas pergunta. Uma aprovação libera um arquivo que o pipeline ainda vai conferir por conteúdo; uma
rejeição destrói o job de forma irreversível, e, a partir de uma lista de linhas quase idênticas, um
clique fora do lugar cancela a folha de pagamento errada.

Em um arquivo cujos aprovadores assinam, o botão diz **Assinar e aprovar** e abre o seletor de
certificados em um modal do mesmo tipo, em vez de registrar um clique —
[Aprovando por assinatura](#aprovando-por-assinatura) percorre o processo. Rejeitar nessa linha é
exatamente o que é em qualquer outra.

**Quem recebe** expande a linha para a tabela de pagamentos, com os identificadores por inteiro.

### Levando uma lista com você

Toda aba carrega um botão **Exportar para Excel**, no mesmo lugar nas três, desabilitado em vez de oculto
quando a aba está vazia. Ele baixa a aba em que você está como uma pasta de trabalho `.xlsx`: uma linha
por **arquivo** de pagamento, nunca uma por beneficiário.

Ele exporta **a aba inteira**, não as linhas marcadas — as marcações pertencem a
[aprovar um lote](#aprovando-um-lote) e existem apenas em *Aguardando você*.

| Aba | Para que serve a exportação |
|-----|-----------------------------|
| **Aguardando você** | Planejar as aprovações de uma manhã antes de começar a clicar |
| **Aguardando outros** | Cobrar os colegas que estão segurando arquivos que você já decidiu |
| **Aprovados** | Responder "o que eu aprovei no mês passado" sem perguntar a um operador |

Acima da tabela, a pasta de trabalho declara quem a gerou, em que momento, a partir de qual lista, e em
qual relógio estão os timestamps. **Na exportação de Aprovados ela também declara seus dois limites** — a
janela de retrospecto que cobre e, quando o limite de 200 linhas mordeu, que a lista foi cortada. A lista
de decididos é uma janela, nunca um histórico completo, e uma lista truncada circulada como completa é
como alguém conclui que um arquivo que aprovou nunca foi enviado.

Notas práticas:

- **Dinheiro e contagens são números reais**, então eles somam, filtram e pivotam. Um arquivo sem total
  CNAB240 deixa aquelas células **vazias**, e não `0`.
- **O CPF/CNPJ do pagador é texto**, pontuado, então zeros à esquerda sobrevivem. Datas são células de
  data reais.
- **O conteúdo está no seu idioma de exibição; o nome do arquivo não.** Ele é um slug sem acentos com uma
  data ISO — `approvals-needs-you-2026-08-12.xlsx`.
- **Nada muda quando você exporta.** Nenhum job se move e nenhuma decisão é registrada. O serviço registra
  uma linha dizendo que você fez isso.
- **Nenhuma linha de pagamento chega à pasta de trabalho.** Nenhum nome de beneficiário, identificação
  fiscal, agência ou conta; o único documento de identificação na planilha é o do pagador.

### O link é uma senha

Não há conta nem senha por trás do portal. **Qualquer um que detenha o link de um aprovador é aquele
aprovador**, até onde o produto consegue dizer.

- **Envie cada link privadamente, a uma pessoa.** Um link repassado é uma aprovação delegada.
- **Para revogar uma pessoa**, remova-a do pool de todo perfil com **Editar aprovação**. O link dela para
  de funcionar **imediatamente** — na próxima requisição, sem reinicialização e sem intervalo de consulta
  no meio —, e ela não é congelada em mais nenhum job. Jobs já retidos com ela no pool mantêm sua entrada
  — a regra congelada não se move. Links são derivados do endereço, nunca emitidos, então alguém
  acrescentado de volta depois recebe o mesmo link que já tinha.
- **Para revogar todo mundo**, mude o `ApproverPortal:LinkSecret`. Todo link quebra de uma vez.

:::warning Revogar um link não encerra uma sessão já aberta com ele
Abrir um link o troca por uma sessão de navegador, e essa sessão é uma credencial separada: ela dura
`ApproverPortal:SessionLifetime` (30 dias por padrão) em um relógio **deslizante**, então um aprovador que
continua usando o portal nunca expira. Nem remover alguém de um pool nem mudar o
`ApproverPortal:LinkSecret` a encerra — eles revogam links, não cookies. O que uma sessão assim ainda pode
decidir continua limitado pelo pool congelado de cada job, então ela alcança apenas jobs cuja regra já
nomeava aquela pessoa. Para encerrar sessões antes, encurte o `ApproverPortal:SessionLifetime`, ou
rotacione o anel de chaves de data protection — o que desconecta os operadores também. O pool de um perfil
desabilitado continua valendo: desabilitar um perfil interrompe novos trabalhos, mas não retira a
autoridade de ninguém.
:::

Decisões tomadas pelo portal registram `LinkDerivedEmail` em vez de `SelfDeclaredEmail`. Isso é mais forte
naquilo que mais importa na prática — a pessoa que decide **não poderia ter nomeado outra pessoa**, porque
o portal nunca oferece a escolha — e ainda assim não é autenticação.

## Entrando com o Microsoft Entra ID

Quando a implantação habilita o [login pelo Entra](installation.md#login-pelo-microsoft-entra-id-opcional)
opcional, um aprovador com a **app role Approver** alcança o mesmo portal entrando com sua conta
Microsoft — sem precisar de link.

- **A role abre a porta; o pool ainda delimita os jobs.** Quais arquivos de pagamento a pessoa vê e sobre
  quais pode decidir continua sendo o pool congelado, casado pelo **e-mail que o diretório afirma**. Um
  Approver do Entra cujo endereço não está em pool algum vê um portal vazio; uma conta cujo token não
  carrega claim de e-mail é recusada de imediato.
- **As decisões registram `EntraIdEmail`** — o primeiro método de identificação que é *autenticação*: o
  diretório verificou quem estava presente, ao passo que um link apenas estreita quem poderia ter sido
  personificado. Quando uma pessoa detém tanto uma sessão de link quanto uma sessão do Entra, o método
  mais forte é registrado.
- **Links coexistem, deliberadamente.** Pools nomeiam e-mails arbitrários, e o gerente financeiro de um
  cliente não precisa ter conta no tenant da implantação.
- **A página por job também os reconhece.** Um Approver autenticado pelo Entra que abre `/approve/{jobId}`
  é nomeado em vez de perguntado, e vê os identificadores dos beneficiários por inteiro quando o pool
  congelado do job inclui seu e-mail. Um login **somente Administrator** não recebe nada disso — a página
  o trata como anônimo, porque reconhecer um operador ali seria aprovação de operador em nome de outrem.

## Provando que é você

O `ApproverSecondFactor:Enabled` coloca um aplicativo autenticador RFC 6238 entre um aprovador e uma
decisão. **Desligado por padrão**, então nada em uma implantação existente muda até alguém escolhê-lo. De
escopo do host, e não por perfil, deliberadamente: uma regra por perfil seria congelada no job no momento
da retenção, e autenticação não pode estar naquele snapshot — do contrário, editar a configuração poderia
ser um desvio de autorização.

**Cada aprovador vincula um autenticador, uma vez, pelo portal**: um QR code, um segredo para digitação
manual, e um código ao vivo confirmado antes de qualquer coisa ser armazenada. Depois disso, a primeira
decisão feita em um navegador pede os seis dígitos atuais. Digitá-los abre uma **janela de verificação**
(`ApproverSecondFactor:VerificationWindow`, vinte minutos por padrão) durante a qual nada naquele
navegador pergunta de novo, por mais arquivos que sejam liberados.

A janela é **absoluta a partir do momento em que o código foi digitado, e pertence à sessão de navegador
em vez de à pessoa** — comprovar o fator em um laptop em casa não faz nada pela máquina deixada
autenticada no escritório, que é precisamente a sessão desacompanhada que o controle existe para fechar.
Zero é uma configuração legítima e significa "perguntar a cada decisão".

Outros comportamentos que vale conhecer:

- **Um código é de uso único.** Cinco errados consecutivos fecham a inscrição daquele aprovador por cinco
  minutos. Ambos os contadores vivem na linha da inscrição, então uma reinicialização não limpa nenhum.
- **Uma aprovação assinada nunca pede código.** Em um arquivo cujos aprovadores assinam, usar a chave
  privada do seu token (ou no seu provedor em nuvem, depois da autenticação dele) é a prova de presença,
  e o certificado registrado na linha é o registro dela. Rejeitar o mesmo arquivo não é assinado e
  continua pedindo.
- **Os operadores recebem uma lista `Segundo fator dos aprovadores`** na
  [página Sistema](dashboard.md#system--sistema) — uma linha por aprovador configurado, inscrito ou não,
  com a data — e um botão **Redefinir**. Esse é o caminho do celular perdido, e é registrado sob o nome do
  operador como um evento de auditoria próprio.
- **As sementes são criptografadas em repouso** sob uma chave derivada do obrigatório
  `ApproverSecondFactor:SeedSecret`. As sementes são aleatórias por aprovador, então deter o primeiro
  fator não pode criar o segundo. **Perder ou rotacionar aquele segredo significa que todo aprovador se
  inscreve de novo.**
- **Toda linha de decisão registra se um fator foi verificado**, e quando.
- **A janela atravessa instâncias.** Ela vive na base operacional, chaveada por um identificador carregado
  dentro do cookie, de modo que uma janela aberta por uma instância é honrada por outra sem nada
  acrescentado.

:::danger Mudança incompatível, sob adesão: habilitar o fator retira o `POST /api/approvals/{id}`
Aquela rota recusa **toda** chamada enquanto a configuração está ligada, com `403` e
`approval.second-factor-required`, e não há nada que um chamador possa enviar que a satisfaça — nenhum
cabeçalho, nenhuma chave, nenhum campo de corpo — porque o que falta é uma presença comprovada, e somente
uma sessão de navegador pode carregar uma.

**Qualquer aprovação dirigida por um ERP, um agendador ou um script para no dia em que a configuração é
virada**, e o operador que a vira geralmente não é a pessoa cuja integração para. Trate isso como uma
mudança coordenada, e não como um ajuste de configuração.

Deliberadamente **não há um endpoint autenticado de aprovação para o qual migrar**: uma rota de aprovação
atrás da chave de API seria *mais fraca* que a página anônima, já que aquela chave vive na configuração do
ERP, no pipeline de implantação e em um arquivo de configurações de produção — então "um aprovador decidiu"
significaria "alguma coisa que detém a credencial de operador decidiu". O `GET /api/jobs/{id}/approvals`
não é tocado, então um sistema que
[observa o estado de aprovação](#lendo-o-estado-a-partir-de-outro-sistema) continua funcionando. É apenas
o ato de decidir que migra para o portal.
:::

**A página anônima por job se divide pelo leitor, e não pela rota.** Com o fator ligado, o
`/approve/{jobId}` aberto por alguém que o host não consegue identificar renderiza **somente leitura**:
cada número, cada linha de pagamento, e exatamente o mascaramento que usava antes — isso não estreita nada
sobre o que um link repassado divulga e não deve ser lido como tendo melhorado isso — com o painel de
decisão substituído por um caminho para o portal (**Ir para o portal de aprovação**), e o aviso de
autodeclaração indo junto, porque não há mais uma decisão autodeclarada sobre a qual avisar. A mesma URL
aberta por um leitor que detenha um link de portal ou uma sessão do Entra se comporta exatamente como o
portal: os mesmos controles, o mesmo pedido de código, e a *mesma* janela, de modo que verificar no portal
e depois seguir um link do e-mail da semana passada não pergunta duas vezes.

O banner de boot segue a mesma regra. O aviso que dispara em todo perfil com aprovação configurada — "as
decisões nesta build são autodeclaradas" — é falso quando o fator está ligado, então com a configuração
habilitada ele passa a ser uma linha informativa declarando a postura real, inclusive que a rota REST
agora recusa toda chamada.

:::warning O segundo fator sozinho não torna um operador incapaz de ser um aprovador
TOTP é simétrico, e um operador pode ler todo link de aprovador e redefinir toda inscrição, então sob uma
regra por clique um operador ainda pode ser qualquer aprovador. O que fecha isso é material de chave que só
o aprovador detém: um [conjunto de assinantes em que os aprovadores assinam](#o-conjunto-de-assinantes),
em que cada aprovação é uma assinatura feita com o próprio certificado ICP-Brasil do aprovador, cujo CPF
precisa conferir com o pool congelado, e o certificado é registrado na decisão. Este controle não deve ser
descrito como tendo fechado essa lacuna por si só.
:::

Cada chave, seus limites e as três recusas de boot estão em
[Configuração](configuration.md#approversecondfactor).

## Aprovando por assinatura

Em um perfil cujo [conjunto de assinantes](#o-conjunto-de-assinantes) inclui os aprovadores, um aprovador
não clica. Ele **coassina o arquivo de pagamento** com o próprio certificado ICP-Brasil — pelo Lacuna Web
PKI no navegador, ou [pelo Lacuna CloudHub](#assinando-com-um-certificado-em-nuvem) para um certificado
em nuvem —, e essa assinatura *é* a sua aprovação: o arquivo que o banco recebe a carrega, ao lado da
própria assinatura da empresa onde o conjunto assim diz. O CPF do certificado precisa ser o CPF
registrado para aquele aprovador no pool — o do titular em um certificado de pessoa física, o do
responsável no de uma empresa —, e a sessão que ele detém (um link do portal, ou um login do Microsoft
Entra) continua dizendo quem está decidindo. O certificado comprova; ele nunca escolhe o aprovador.

**Pelo portal**, o botão da linha diz **Assinar e aprovar** e abre um modal: o que está para acontecer é
reafirmado, os certificados do seu navegador são listados pelo Lacuna Web PKI — com o caminho de
instalação se a extensão estiver ausente, desatualizada ou sem suporte — e o botão age quando você tiver
escolhido um. **Somente os certificados emitidos para o seu CPF são listados** — o CPF registrado para
você no pool congelado naquele arquivo, que é aquele contra o qual o servidor vai conferir o certificado.
Qualquer outro certificado que o seu navegador tenha é contado em uma linha abaixo da lista, que nomeia o
seu CPF pelos dígitos verificadores, e não é oferecido: escolhê-lo só poderia terminar em recusa. Se o
seu navegador tem certificados mas nenhum carrega aquele CPF, o modal diz isso; o remédio é o token com o
seu próprio certificado. O estreitamento é uma conveniência: as verificações abaixo são feitas
independentemente do que a lista mostrou. O modal não pode ser dispensado enquanto uma assinatura está em
andamento; seu **Cancelar** é a saída, e fechar o pedido de PIN do seu token também cancela em silêncio,
sem nada registrado.

**Pela página por job**, o mesmo modal abre para um leitor autenticado pelo próprio link ou pelo
Microsoft Entra. Alguém que ninguém identificou recebe a página **somente leitura** — cada número e cada
linha de pagamento sob o mesmo mascaramento, e os controles de decisão substituídos por um caminho para o
portal —, exatamente como sob o segundo fator, mas decidido por arquivo, a partir da regra congelada nele,
e não para a implantação inteira. Um arquivo aprovado por clique, na mesma implantação, se comporta como
sempre se comportou.

A ordem importa, e ela é construída para que **um certificado errado seja recusado antes de o token pedir
um PIN**:

1. O certificado é conferido por inteiro — cadeia, período de validade e revogação, pelo PKI SDK, contra a
   mesma confiança a que a chave do perfil está sujeita. Um inválido é recusado com o motivo do SDK.
2. Um certificado válido que não carrega CPF algum é recusado como tal — uma resposta distinta de uma
   divergência, para que quem detém o *tipo* errado de certificado ouça isso, e não que o seu CPF está
   errado.
3. Um CPF que não é o do aprovador da sessão é recusado. O certificado de um colega, válido e no pool,
   continua sendo recusado sob a sua sessão.
4. Só então o hash a assinar é produzido — sobre o arquivo como ele está, inclusive qualquer assinatura
   de colega já nele —, e o navegador pede ao token que o assine.

Depois da assinatura, o envelope finalizado é validado, conferido contra os bytes aos quais a aprovação
está vinculada, gravado ao lado da cópia em stage, e a aprovação é registrada — o envelope e a linha como
uma unidade. **Se um colega assinou o mesmo arquivo enquanto você o assinava**, a sua assinatura foi feita
sobre um envelope que não é mais o envelope: ela é recusada, nada é registrado, e a mensagem oferece
**Assinar novamente**, que assina o arquivo como ele está agora. Toda outra recusa é dita com suas
próprias palavras no mesmo lugar em que a página relata o desfecho de um clique, e você a responde
apertando o botão da linha de novo e escolhendo diferente. Um arquivo cujos aprovadores assinam pode
fazer parte de um lote — veja [Aprovando um lote](#aprovando-um-lote).

**As seis recusas, e o que cada uma pede de você.** Cada uma é dita onde a página relata o desfecho de um
clique — o alerta no portal, o painel na página por job, a lista por arquivo de um lote — e só a primeira
é também uma resposta REST: a rota anônima não carrega certificado, então as outras cinco não podem
surgir ali:

| Recusa | O que aconteceu | O que fazer |
|---|---|---|
| `approval.signature-required` | Um clique chegou a um job cujos aprovadores assinam — pela rota anônima, ou por um cliente escrito para cliques. | Aprove pelo portal, ou pela página por job estando autenticado. Uma rejeição continua sendo um clique. |
| `approval.certificate-invalid` | O certificado não passou na conferência completa: expirado, não encadeado a uma raiz confiável, revogado, ou seu status de revogação não pôde ser estabelecido. O motivo do SDK é mostrado. | Escolha um certificado vigente, ou renove o seu. Se todos os aprovadores forem recusados de uma vez, é a implantação e não você — veja [Diagnóstico de problemas](#diagnóstico-de-problemas). |
| `approval.certificate-without-cpf` | Um certificado válido que não carrega CPF — nem um e-CPF ICP-Brasil, nem um e-CNPJ que nomeie um responsável. | Escolha o certificado emitido para você como pessoa, ou o da sua empresa que o nomeia como responsável. |
| `approval.certificate-cpf-mismatch` | O CPF do certificado não é o CPF registrado para você no pool deste arquivo. O certificado de um colega é recusado sob a sua sessão mesmo quando ele está no pool. Raro a partir do seletor, que lista apenas certificados com o seu CPF; ainda pode surgir quando a leitura do navegador e a do servidor discordam, ou em um lote cujos arquivos congelaram CPFs diferentes para você. | Escolha o seu próprio certificado. Se o CPF no pool estiver errado, o operador corrige o perfil; um job já retido mantém o pool que congelou e precisa ser reexecutado. |
| `approval.signature-invalid` | A assinatura que o seu navegador produziu não se completou em um envelope que o SDK valida, ou envolve bytes diferentes do arquivo que lhe foi mostrado. Nada foi gravado nem registrado. | Aperte o botão de novo. Se se repetir, o token ou a extensão está com problema — tente outro navegador, e avise o operador. |
| `approval.signature-conflict` | Um colega assinou o mesmo arquivo enquanto você o assinava, então a sua assinatura foi feita sobre um envelope que não existe mais. Nada foi gravado nem registrado. | **Assinar novamente**, oferecido na hora: assina o arquivo como ele está agora, com a assinatura do colega. |

Mais dois desfechos vêm do navegador, e não do servidor, e não são recusas: fechar o pedido de PIN do seu
token **abandona** a tentativa em silêncio, e uma falha que o Web PKI relata — uma licença que não é para
este domínio, um módulo que a extensão não conseguiu carregar — é mostrada com as palavras do próprio Web
PKI. Ambos são contados na mesma métrica das recusas ([Métricas](#métricas)).

A mesma recusa de conflito cobre um arquivo que um colega está assinando *neste momento*: o envelope dele
fica reservado enquanto a aprovação dele é registrada, e aprovar de novo um instante depois passa. Se
aprovar de novo continua sendo recusado em um arquivo, olhe a página do job. No caso raro em que o produto
não conseguiu desfazer uma assinatura cuja aprovação falhou ao ser registrada — o compartilhamento sumiu
no meio da gravação, ou uma instância morreu segurando o envelope —, o histórico do job diz isso em uma
linha que termina em *cancel the job to recover*. Cancele o job; sua entrada fica na pasta de entrada,
como a de qualquer arquivo cancelado, e Tentar novamente ou Rescan o recomeça com as aprovações do zero.

Uma aprovação assinada **satisfaz o segundo fator** onde ele é exigido: usar uma chave privada em um token
é presença, e as colunas de certificado na linha são o registro. Uma rejeição no mesmo job não muda — sem
assinatura, um clique e um modal, e ainda pedindo código onde o fator está ligado. O veto continua mais
barato que a aprovação de propósito.

O que é registrado: as colunas de certificado da linha ([O que cada aprovação registra](#o-que-cada-aprovação-registra)),
uma entrada na linha do tempo — *Approved by Maria Silva with certificate Maria Silva, CPF
\*\*\*.\*\*\*.\*\*\*-09.* — e o evento operacional, cada um nomeando o certificado com o CPF mascarado até
os dígitos verificadores. Os bytes da assinatura não ficam na linha; o artefato em `output/` é a prova.

Escolher um conjunto de assinantes assim na página do perfil pede que você confirme depois de um aviso de
uma linha: o arquivo entregue vai carregar as assinaturas dos próprios aprovadores, e se o destinatário
aceita um arquivo assinado por várias pessoas é algo que cabe a você confirmar com ele antes de o primeiro
arquivo sair. O aviso é feito uma vez, no salvamento que passa para um conjunto assim, e a entrada de
auditoria nomeia o campo.

:::warning Dois limites a conhecer antes de escolher um conjunto de assinantes assim
**Todo aprovador do pool precisa de um certificado**, e o quórum precisa de gente suficiente com um: um
pool de três com quórum de dois em que só um membro tem certificado retém todo job para sempre, e o
produto não tem como saber quem tem um até que a pessoa o apresente — mantenha o orçamento de espera
definido. E **o host precisa alcançar os repositórios da ICP-Brasil**, porque a conferência do
certificado não é de melhor esforço; uma implantação isolada da rede não consegue usar esses conjuntos de
assinantes.
:::

### Assinando com um certificado em nuvem

:::tip Novo na 2.7.0 — certificados em nuvem pelo Lacuna CloudHub
Antes da 2.7.0 um aprovador só conseguia assinar com um certificado que o seu navegador alcançasse.
:::

Um aprovador cujo certificado foi emitido no HSM de um provedor — um *certificado em nuvem* — não tem nada
que um navegador consiga alcançar, então o modal acima não consegue listá-lo. Onde a implantação tem o
`CloudHub` configurado (veja [Configuração](configuration.md)), o mesmo modal abre com um **primeiro
passo**: **Certificado neste navegador** ou **Certificado em nuvem**. A escolha é feita por assinatura,
por você, no momento de assinar — ela não fica gravada em perfil nem em membro do pool, porque qual chave
você tem é um fato sobre você naquele dia. Em uma implantação com CloudHub e sem licença do Web PKI o passo
é pulado e o modal vai direto para a nuvem; em uma sem CloudHub não há passo, e o modal é o seletor acima.
A linha mantém um único botão em qualquer caso.

Escolher a nuvem pergunta ao Lacuna CloudHub quais provedores têm um certificado para **o seu CPF como
congelado naquele arquivo** — o mesmo CPF a que o seletor se restringe, e pelo mesmo motivo: você não
digita CPF, não consegue iniciar uma sessão sob o de outra pessoa, e o certificado que volta continua
sendo conferido. Todo provedor que o CloudHub nomeia é listado, e você escolhe o seu; se nenhum tiver
certificado para aquele CPF, o modal diz isso, nomeando o CPF pelos dígitos verificadores, e o remédio é
um certificado neste navegador ou uma conversa com o seu provedor. O navegador então sai para o provedor,
onde você se autentica — geralmente no celular — e é trazido de volta à implantação em
`/approvals/cloud/return`, uma rota autenticada que executa **a aprovação assinada inteira nessa única
requisição**: a mesma ordem de verificações de acima, com o certificado lido do CloudHub em vez do
navegador. A única coisa que a nuvem custa é que um certificado errado é descoberto depois do login no
provedor, e não antes de um pedido de PIN; o estreitamento pelo CPF torna isso raro, e nada é assinado
sob um certificado recusado em nenhum dos casos.

Você volta à página de onde saiu — o portal, ou a página por job — e ela diz o que aconteceu, **uma vez**,
com as mesmas palavras que usa para uma assinatura no navegador: registrado, ou uma das recusas da tabela
acima, com **Assinar novamente** oferecido em um conflito. Não há página de resultado nem nada sobre o
desfecho no endereço. Um retorno que não pode ser associado a uma assinatura que você iniciou nos últimos
quinze minutos — a sessão errada, um link seguido duas vezes, um login que demorou demais, um início
substituído a partir de outra aba — cai no portal, que diz isso em uma frase e nunca o porquê, e não
registra nada; recomece a partir da linha do arquivo. Uma falha do lado do CloudHub — a chave recusada, o
serviço inalcançável, uma resposta que o produto não consegue usar — é relatada como uma falha do
provedor, com as palavras do próprio CloudHub, e nada é registrado.

O que é registrado difere em uma coluna: a linha da decisão nomeia o **serviço em nuvem** pelo qual o
certificado foi alcançado, e a linha do tempo e o evento de auditoria dizem *Approved by Maria Silva with
cloud certificate (ProviderName) Maria Silva, CPF \*\*\*.\*\*\*.\*\*\*-09.* As colunas de certificado ao
lado significam o mesmo qualquer que seja o meio que as produziu, e o arquivo assinado é verificado contra
exatamente os signatários registrados. Uma assinatura em nuvem satisfaz o segundo fator como uma
assinatura no navegador. Uma rejeição nunca é assinada por nenhum dos meios.

**Um lote assina na nuvem com um único login no provedor** — veja
[Aprovando um lote com um certificado em nuvem](#aprovando-um-lote-com-um-certificado-em-nuvem).

## A rejeição é um veto

**Uma rejeição para o job, diga a aritmética do quórum o que disser.** Um pool de três com um quórum de um
ainda para quando uma pessoa rejeita, mesmo que duas pessoas que não decidiram pudessem, cada uma, tê-lo
liberado sozinhas.

Não é assim que uma votação funciona, e deliberadamente. Uma rejeição não é um voto retido a ser
compensado por outros — é uma pessoa afirmando que o arquivo está errado, e um quórum não tem o direito de
sobrepujar isso.

Então um job vetado reporta sua contagem de aprovações honestamente — "2 de 2 aprovações —
**rejeitado**" não é uma contradição, é o que aconteceu — mas ele nunca prossegue.

### O que acontece com o job

Ele fica **`Canceled`**, não `Failed`:

- **O arquivo é devolvido para `output/`** como `<name>.reject<ext>` — `folha.rem` vira
  `folha.reject.rem` —, preservando os bytes exatos que foram rejeitados. Veja
  [O arquivo rejeitado volta para `output/`](#o-arquivo-rejeitado-volta-para-output) abaixo.
- **O original é removido de `input/`**, assim que a cópia devolvida está em segurança em `output/`.
- **A repetição não se aplica**, e diz isso pelo nome: o `POST /api/jobs/{id}/retry` recusa com
  `409 { code: "job.rejected-not-retriable" }`, e o botão Tentar novamente não aparece na página do job.
  Um veto não é uma falha da qual se recuperar. O financeiro corrige o arquivo e o resubmete, que é o
  ciclo pretendido.

Rejeições são distinguidas de cancelamentos de operador pela trilha de auditoria, não pelo status: a linha
do tempo do job nomeia o aprovador que rejeitou e seu motivo, e um evento operacional `ApprovalRejected` é
registrado.

### O arquivo rejeitado volta para `output/`

:::warning Mudou na 2.1.0 — um arquivo vetado vai para `output/`, e não para `error/`
Até a 2.0.x uma rejeição realocava a cópia em stage para `error/<jobid>/` e deixava o original em
`input/`. Um produtor que deposita remessas em uma pasta monitorada coleta de um lugar só, e esse lugar é
`output/` — então um arquivo vetado agora é devolvido ali, e sua entrada é removida.
:::

Um arquivo vetado é devolvido para `output/` em vez de ficar em `error/` entre as falhas de máquina, sob um
nome que carrega `.reject` antes da extensão original — o mesmo lugar que o `.signed` ocupa, de modo que
um `.rem` continua sendo um `.rem` e um interpretador a jusante ainda o reconhece.

Duas coisas valem saber antes de construir algo em cima disso:

- **O arquivo devolvido não é assinado.** Uma rejeição acontece na etapa, antes da assinatura. O que chega
  a `output/` são os próprios bytes do cliente, marcados. Qualquer coisa que tratava `output/` como uma
  pasta de assinaturas precisa ler o nome. Em troca, `error/` volta a guardar apenas falhas genuínas.
- **Onde o perfil criptografa, o arquivo devolvido também é criptografado**: `folha.reject.rem.enc`, um
  envelope BSENC v1 como todo outro artefato daquela pasta. Veja [Criptografia](encryption.md).

A entrada da linha do tempo nomeia o arquivo (`Rejected file returned to output as folha.reject.rem; input
removed.`), um evento operacional `RejectedFileHandedBack` o registra, e a página do job mostra o nome —
que ela deriva e depois confere contra a pasta, de modo que nunca nomeia um arquivo que não está lá.

**Se o nome já estiver ocupado**, a devolução se recusa em vez de sobrescrever o arquivo anterior de
alguém. Isso não é um caso de canto: um arquivo vetado é um que o financeiro corrige e resubmete com o
mesmo nome, então uma segunda rejeição dele colide. O job então se comporta como antes desta
funcionalidade — a cópia em stage vai para `error/<jobid>/` e **a entrada permanece em `input/`** —, o veto
vale de qualquer forma, e o console e o log dizem qual dos dois aconteceu. Veja
[Diagnóstico de problemas](troubleshooting.md).

**Se um veto foi um engano**, o arquivo não está perdido — está em `output/`. Busque-o, descriptografe-o
se o perfil criptografa, e resubmeta-o (upload, ou coloque-o de volta na pasta monitorada). Um Rescan
**não** o traz de volta, porque a entrada se foi; isso é deliberado, já que um veto que um botão sem
relação desfaz não é grande coisa como veto.

### A corrida estreita, e o que a cobre

| Onde o job está | O que o para |
|-----------------|--------------|
| Ainda retido em `AwaitingApproval` | a rejeição o cancela diretamente |
| Liberado para `Queued`, mas ainda não reivindicado | o mesmo cancelamento — sua guarda de status cobre `Queued` também |
| Já reivindicado por um worker (`Processing`) | a verificação de veto anterior à assinatura, do próprio pipeline, recusa assiná-lo |

No terceiro caminho o job termina como **`Failed`** com `approval.rejected`, em vez de `Canceled`, já que
`Processing` não tem transição legal para `Canceled`. Ambos os desfechos deixam o arquivo não assinado,
que é a propriedade que importa.

Uma rejeição que chegue depois de a assinatura ter sido computada não consegue descomputá-la. Nada aquém
de segurar um lock durante a deliberação de alguém fecharia isso.

## O que é aprovado

**Bytes, não um id de job.**

A cópia colocada em stage no momento da interpretação é o artefato canônico por toda a janela de
aprovação. O arquivo de entrada nunca é relido **como o artefato a ser assinado**, e a interpretação nunca
roda uma segunda vez — de modo que um arquivo alterado em `input/` durante a espera não pode tomar o lugar
do que foi aprovado.

Imediatamente antes de assinar, os bytes em stage são re-hasheados e comparados com o hash registrado na
interpretação. Uma divergência reprova o job de forma dura com `approval.content-changed`: nunca uma
reinterpretação silenciosa, nunca um seguir adiante. A verificação roda tanto no caminho de assinatura
local quanto no caminho de upload ao assinador remoto, e um envelope dos aprovadores que envolva bytes
diferentes da cópia em stage falha da mesma forma.

O arquivo de entrada *é* lido mais uma vez, mas somente depois que a assinatura existe e somente para
responder a uma pergunta diferente: este ainda é o arquivo que foi colocado em stage e, portanto, pode ser
apagado? Veja [Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job).

**Se a cópia em stage desaparecer** o job falha. Não há forma honesta de continuar — reconstruí-la a
partir de `input/` assinaria algo que ninguém aprovou. Repita o job; uma repetição é um novo job, e ele
fica retido de novo.

**Se o serviço reiniciar no meio da espera** nada acontece, que é o ponto. A recuperação na inicialização
deliberadamente pula `AwaitingApproval`: um job retido não está "em andamento no último desligamento", ele
é um job esperando por uma pessoa. A linha e a cópia em stage ambas sobrevivem.

## Cancelando um job retido

`POST /api/jobs/{id}/cancel`, ou o botão Cancelar na página do job — que pergunta antes, em um diálogo que
nomeia o arquivo e diz o que o cancelamento faz com ele. Um job retido é cancelável precisamente porque
nada o está segurando. A cópia em stage é movida para `error/` e o arquivo permanece em `input/`; o
observador honra o cancelamento e não o ressuscitará automaticamente, embora um Rescan deliberadamente o
faça.

**Um cancelamento não é uma rejeição, e os arquivos terminam em lugares diferentes.** Um veto devolve o
arquivo para `output/` e remove a entrada; um cancelamento deixa ambos onde uma recusa anterior à
assinatura os deixa. Isso porque um cancelamento geralmente é um engano sendo desfeito, e deixar a
entrada no lugar é o que torna a reexecução possível.

## Segurança

### O link de aprovação é uma capacidade

Ele confere o poder de liberar um arquivo de pagamento para assinatura — **e de parar um** — e não
verifica nada sobre quem o está usando.

- **Envie-o apenas para as pessoas do pool**, e apenas por um canal que você usaria para o próprio arquivo
  de pagamento.
- **Não o repasse, e diga aos aprovadores para não repassarem.** Um link repassado basta para uma pessoa
  satisfazer um quórum de várias, porque tudo de que ela precisa são dois endereços da lista.
- **Não coloque o serviço em uma rede que os navegadores dos aprovadores alcancem se você não puder
  aceitar isso.** Distribua os números de outra forma e cancele/reexecute em vez disso.

:::note Mudou na 2.9.0 — a página do job não entrega mais o link por job
O campo copiável `/approve/{jobId}` na página do job do operador foi removido, para todo leitor. O produto
não envia e-mail; um aprovador chega a um arquivo retido pela própria fila no
[portal](#o-portal-do-aprovador), e a página do operador não entrega nada para repassar. A página anônima
em si não mudou, e um link que alguém já tenha continua a abri-la.
:::

A rejeição é a metade mais suave daquela capacidade: quem detém o link também pode parar um arquivo de
pagamento legítimo, e o remédio — corrigir e resubmeter — é um inconveniente, e não uma perda. Ainda assim
é uma negação de serviço não autenticada contra uma folha de pagamento específica.

Ids de job são GUIDs v4, então a URL não é adivinhável na prática, e a rota tem seu próprio orçamento de
limitação de taxa (`RateLimiting:Approval`, dez requisições por minuto por endereço por padrão).

As recusas são deliberadamente grosseiras: um endereço bem formado que não está no pool e um endereço que
não é endereço nenhum retornam ambos `approval.unknown-approver`.

### O que cada aprovação registra

| Campo | Significado |
|-------|-------------|
| `ApproverEmail` | normalizado (aparado, em minúsculas); único por job, imposto por um índice de banco de dados |
| `ApproverName`, `ApproverCpf` | copiados do **pool congelado**, nunca da requisição |
| `Decision` | `Approved` ou `Rejected` |
| `Reason` | texto livre que quem decidiu digitou, ou nulo; repetido na linha do tempo do job |
| `IdentificationMethod` | `SelfDeclaredEmail` na página anônima, `LinkDerivedEmail` por uma sessão de link do portal, `EntraIdEmail` por um login do Microsoft Entra |
| `ContentSha256` | os bytes sobre os quais esta decisão versa |
| `DecidedAt` | UTC |
| `IpAddress` | o endereço remoto da conexão, ou nulo. **Atrás de um proxy reverso esse é o proxy**, a menos que o [`Hosting:ForwardedHeaders`](configuration.md#hosting) esteja configurado |
| `UserAgent` | literal, truncado em 512 caracteres, ou nulo |
| `SecondFactorVerifiedAt` | quando a sessão de navegador que decidiu comprovou um segundo fator, ou nulo quando nenhum estava em vigor (e em toda aprovação assinada, que não precisa de um) |
| `CertificateSubject`, `CertificateIssuer`, `CertificateSerialNumber`, `CertificateThumbprintSha256`, `CertificateCpf`, `CertificateCnpj` | o certificado com que uma aprovação **assinada** foi feita: o subject e o issuer como o PKI SDK os renderiza, o número de série em hexadecimal maiúsculo, o thumbprint SHA-256, o CPF que o certificado carrega — o do titular, ou o do responsável no de uma empresa — e o CNPJ quando é de uma empresa. Nulos em toda decisão por clique e em toda linha gravada antes de as assinaturas de aprovadores existirem. `ApproverName` e `ApproverCpf` continuam vindo do pool congelado: o pool diz quem tinha permissão para decidir, o certificado diz qual chave o confirmou |
| `CloudService` | o serviço em nuvem pelo qual o certificado foi alcançado — o nome que o Lacuna CloudHub dá ao provedor —, ou nulo para uma assinatura feita no navegador e para toda decisão por clique |

O `IdentificationMethod` existe para que, à medida que identificação mais forte chegue, aprovações
anteriores continuem visivelmente sendo o que eram, na mesma tabela, em vez de serem retroativamente
abençoadas. Membros são acrescentados, nunca reaproveitados, e nenhuma linha é jamais migrada para um novo
valor.

Aprovações registradas pelo dashboard ou pelo portal não carregam IP nem user agent: aqueles caminhos
rodam sobre o circuito Blazor, onde não há requisição HTTP de onde lê-los. A rota REST registra ambos.

### Dados pessoais

O pool guarda um nome, um e-mail e um CPF por aprovador, e cada linha de aprovação os copia. O CPF é
validado nos dígitos verificadores, normalizado para onze dígitos puros, e usado para exatamente uma
decisão: em um perfil cujos aprovadores assinam, é com ele que o certificado do aprovador precisa
conferir. Em uma regra por clique ele é apenas exibição e auditoria.

O `Cpf` está na lista de propriedades estruturadas a mascarar, então ele não consegue chegar a um log
durável. Endereços de aprovadores são mascarados (`m***@empresa.com.br`) na narração de console e em
eventos operacionais, e o CPF de um certificado é mascarado até os dígitos verificadores em linhas do
tempo e eventos — inclusive dentro do subject; os endereços completos vivem no snapshot congelado e nas
linhas de aprovação. Salvar um pool registra contagens no log de eventos — quantas pessoas foram
acrescentadas, removidas e alteradas —, nunca uma lista de nomes. Veja [Segurança](security.md).

### Retenção

As linhas de aprovação e a regra congelada **nunca são expurgadas**, inclusive quando o job alcança um
status terminal. Quem autorizou um pagamento, e sob qual regra, é exatamente o que uma auditoria pergunta
depois do fato. Este é o oposto deliberado do detalhe de linhas do CNAB240, que *é* expurgado no status
terminal — veja [Retenção](retention.md).

## REST

:::danger Esta rota é retirada quando o segundo fator está ligado
`ApproverSecondFactor:Enabled = true` faz o `POST /api/approvals/{id}` recusar **toda** chamada com `403`
e `approval.second-factor-required`, e nenhum cabeçalho, chave ou campo de corpo a satisfaz. Se um ERP ou
agendador dirige aprovações aqui, leia [Provando que é você](#provando-que-é-você) antes de habilitar o
fator. O `GET /api/jobs/{id}/approvals` não é afetado.
:::

Decidir é uma rota anônima:

```bash
curl -X POST http://localhost:8080/api/approvals/3f2a…/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"maria@empresa.com.br"}'
```

```json
{
  "jobId": "3f2a…",
  "approverName": "Maria Silva",
  "approved": 2,
  "required": 2,
  "outstanding": 0,
  "quorumMet": true,
  "released": true
}
```

Para rejeitar, acrescente `decision` (e opcionalmente `reason`):

```bash
curl -X POST http://localhost:8080/api/approvals/3f2a…/ \
  -H 'Content-Type: application/json' \
  -d '{"email":"maria@empresa.com.br","decision":"rejected","reason":"valor errado no lote 2"}'
```

```json
{
  "jobId": "3f2a…",
  "approverName": "Maria Silva",
  "reason": "valor errado no lote 2",
  "terminated": true
}
```

O `decision` aceita `approved` ou `rejected`, sem diferenciar maiúsculas. **Omiti-lo significa
`approved`** — um cliente escrito antes de a rejeição existir continua funcionando sem mudança. Qualquer
outra coisa é recusada em vez de interpretada: `"reject"` — plausível, errado, a uma letra de distância —
não pode resolver para nenhum dos dois.

Uma rejeição retorna **200**, não um 4xx. É o que o chamador pediu, e teve sucesso. O `terminated` é falso
apenas naquela corrida estreita em que um worker já havia reivindicado o job.

Em um job cujo conjunto de assinantes congelado inclui os aprovadores, esta rota ainda consegue
**rejeitar**, mas não aprovar: uma aprovação ali é uma assinatura, e a rota não carrega certificado.

As recusas carregam um `code` estável:

| Código | Status | Significado |
|--------|--------|-------------|
| `job.not-found` | 404 | nenhum job com aquele id |
| `approval.not-pending` | 409 | o job não aceita decisão em seu status atual |
| `approval.unknown-approver` | 403 | o endereço não está no pool congelado do job (também retornado para um endereço malformado, deliberadamente) |
| `approval.already-decided` | 409 | este aprovador já decidiu; decisões são finais |
| `approval.unknown-decision` | 400 | `decision` não era nem `approved` nem `rejected` |
| `validation.reason-too-long` | 400 | `reason` excede 512 caracteres. Recusado em vez de truncado |
| `approval.job-incomplete` | 500 | o job está retido, mas sua regra congelada ou seu hash de conteúdo está faltando. Uma regra faltando significa que a linha foi modificada fora da aplicação; um hash faltando provavelmente significa que a verificação CNAB240 do perfil estava desligada quando o job ficou retido — um estado que a página do perfil e a etapa agora recusam, então é um job retido antes disso ([Diagnóstico de problemas](#diagnóstico-de-problemas)) |
| `approval.signature-required` | 403 | o conjunto de assinantes congelado do job é `Approvers` ou `ProfileKeyAndApprovers`, então sua aprovação é uma coassinatura e esta rota não carrega certificado ([Aprovando por assinatura](#aprovando-por-assinatura)). Decidido por job, a partir do snapshot; uma rejeição no mesmo job continua sendo registrada aqui |

### Lendo o estado a partir de outro sistema

*Ler* são duas rotas autenticadas, para relatórios de conformidade, um dashboard externo, ou um monitor
observando jobs retidos além de algum limiar:

- O `GET /api/jobs/{id}` carrega um resumo `approval` — o quórum congelado, o tamanho do pool, quantas
  pessoas aprovaram e rejeitaram, `vetoed`, `parkedSince` e o prazo de expiração se a regra definiu um.
  `null` em qualquer job que nunca ficou retido. Ramifique por `vetoed`, e não por aritmética própria: o
  `quorumReached` pode ser `true` em um job que um veto já parou.
- O `GET /api/jobs/{id}/approvals` retorna o pool congelado com a decisão de cada membro, e a lista de
  decisões — e, em uma decisão registrada por assinatura, um objeto `certificate` com o subject, o
  issuer, o número de série, o thumbprint SHA-256, o CPF do certificado mascarado e seu CNPJ por inteiro,
  mais o `cloudService` quando foi uma assinatura em nuvem; `null` em uma decisão por clique. O CPF é
  mascarado até seus dígitos verificadores nos dois. `404` com `approval.not-required` em um job que nunca
  ficou retido — uma resposta distinta de um job retido sobre o qual ninguém decidiu, que é `200` com uma
  lista vazia.

Todo número vem da regra congelada no job, nunca do perfil atual.

:::info Não existe endpoint REST de aprovação
Atrás da chave de API ele seria pior que a página anônima: a chave fica na configuração de um ERP, em um
pipeline de implantação e em um arquivo de configurações de produção, então ela viraria uma credencial de
aprovar-qualquer-coisa para todos que detivessem qualquer um deles. Anônimo, seria um laço de aprovação em
massa programável sobre cada job retido. O ator para o qual esta etapa existe é uma pessoa lendo um
detalhamento de pagamentos, não uma integração.
:::

## Métricas

| Métrica | Tipo | Labels | Significado |
|---------|------|--------|-------------|
| `bulksigner_jobs_awaiting_approval` | gauge | — | jobs atualmente retidos; definido a partir de uma varredura, então está certo após uma reinicialização |
| `bulksigner_jobs_parked_for_approval_total` | counter | `profile` | jobs que ficaram retidos |
| `bulksigner_approvals_recorded_total` | counter | `profile` | decisões registradas, uma por pessoa por job — aprovações **e** rejeições |
| `bulksigner_approvals_rejected_total` | counter | `profile` | o subconjunto de rejeições. Deliberadamente separado de `bulksigner_jobs_canceled_total`, que conta o que um *operador* fez |
| `bulksigner_jobs_released_by_approval_total` | counter | `profile` | jobs retidos cujo quórum foi atingido |
| `bulksigner_approvals_expired_total` | counter | `profile` | jobs retidos cancelados porque seu orçamento de espera congelado se esgotou. A única série que conta *ninguém* agindo — a que se deve alarmar |
| `bulksigner_jobs_content_changed_total` | counter | `profile` | falhas do vínculo de conteúdo anterior à assinatura. **Deveria ficar em zero para sempre** |
| `bulksigner_approver_signatures_total` | counter | `outcome`, `means` | tentativas de assinatura de aprovadores em jobs cujo conjunto de assinantes congelado inclui os aprovadores. `outcome`: `signed`, `cpf-mismatch`, `without-cpf`, `certificate-invalid`, `signature-invalid`, `conflict`, `abandoned` (o aprovador fechou o pedido de PIN ou o diálogo do Web PKI), `browser-failed` (o Web PKI relatou uma falha que não foi um cancelamento), `provider-failed` (o Lacuna CloudHub falhou, trouxe o navegador de volta sem sessão, ou não quis listar provedores). `means`: `browser` (Web PKI) ou `cloud` (CloudHub). Fica em zero até que o conjunto de assinantes de um perfil inclua os aprovadores |

Uma taxa de *expiração* que sobe geralmente diz algo sobre a sua distribuição do link de aprovação — o
produto não envia e-mail, então uma janela vencida geralmente significa que o link nunca chegou a
ninguém.

No contador de assinaturas de aprovadores: uma taxa de divergência de CPF subindo contra uma taxa de
assinados estável é uma pessoa apresentando o certificado errado; `conflict` acima de zero são dois
aprovadores habitualmente decidindo o mesmo arquivo no mesmo minuto; `browser-failed` subindo entre
vários aprovadores é um problema de licença ou de módulo na implantação, e não de uma pessoa;
`provider-failed` subindo é a chave do CloudHub ou uma indisponibilidade de provedor. O `means` responde
"assinaturas na nuvem falhando enquanto as do navegador dão certo".

## Estatísticas

As esperas de aprovação são excluídas das estatísticas de tempo decorrido do pipeline, do mesmo jeito que
a espera em `AwaitingSigner`. Uma espera de aprovação é medida em horas da atenção de alguém, e dobrá-la
dentro das médias de fila/assinatura/verificação inundaria todos os números com uma quantidade que o
pipeline nem causou nem consegue melhorar.

Concretamente: ficar retido descarta a entrada de cronometragem em andamento do job, e um job liberado
abre uma nova, cuja espera na fila é medida a partir do momento em que ele reentrou na fila. Veja
[Estatísticas de jobs](statistics.md).

## Diagnóstico de problemas

**Um job está retido e ninguém consegue aprová-lo.** Confira o pool na página do job: ele é o pool
congelado no momento da retenção, não o atual do perfil. Se as pessoas listadas estiverem erradas,
cancele o job, corrija o pool com **Editar aprovação** na página do perfil, e reexecute o arquivo.

**Um aprovador recebe "não é um aprovador para este job".** O endereço dele não está no pool congelado.
Compare-o com o pool exibido na página do job — espaços no início/fim e maiúsculas não importam, qualquer
outra coisa importa.

**Um job liberado falhou com `approval.content-changed`.** A cópia em stage em `processing/<jobid>/` foi
modificada depois que os aprovadores a viram. A pasta do job agora está sob `error/`. Não o reassine —
descubra o que escreveu em `processing/`, e então reexecute o arquivo original de `input/`, para que ele
seja interpretado, totalizado e aprovado do zero.

**Um job falhou com `approval.content-unmeasured` em vez de ficar retido.** O perfil carrega uma regra de
aprovação, mas sua verificação CNAB240 está desligada, então o arquivo nunca foi interpretado e não há
hash de conteúdo ao qual vincular uma decisão. Religue **validar CNAB240** em **Editar comportamento** (ou
remova a regra em **Editar aprovação**) e reexecute o arquivo. A página do perfil recusa salvar esse par,
então um perfil nesse estado foi gravado antes de a recusa existir ou editado fora da aplicação.

**Um aprovador ouve que o registro está incompleto, e a seção Registro de aprovação da página do job
marca o hash de conteúdo.** A mesma causa, em um job que ficou retido antes de a etapa recusá-lo: a
verificação CNAB240 do perfil estava desligada quando ele ficou retido. Cancele o job, religue a
verificação, e reingira o arquivo — veja [Diagnóstico de problemas](troubleshooting.md).

**Um job diz "2 de 2 aprovações — rejeitado".** As duas leituras são verdadeiras. A contagem é a
aritmética e o desfecho é o veto. A linha do tempo nomeia o aprovador que rejeitou e seu motivo.

**Um job falhou com `approval.rejected` em vez de ser cancelado.** A rejeição chegou depois de um worker
já ter reivindicado o job, então o pipeline recusou a assinatura em vez de o handler de aprovação
cancelá-lo. O arquivo está sem assinatura, que é o ponto.

**Um arquivo rejeitado não está em `output/`.** Um arquivo com aquele nome já estava lá, então a devolução
se recusou a sobrescrevê-lo: a cópia em stage está sob `error/<jobid>/` e a entrada continua em `input/`.
Veja [Diagnóstico de problemas](troubleshooting.md).

**Um job foi cancelado com "Approval window expired."** Ninguém decidiu dentro da janela `ExpiresAfter` do
perfil. A cópia em stage está sob `error/<jobid>/`, o original ainda está em `input/`, e quaisquer
aprovações que *tenham sido* registradas continuam na página do job. A repetição não se aplica —
reexecute o arquivo por Rescan ou Upload. Se as janelas continuam vencendo, ou o link não está chegando às
pessoas, ou o orçamento é mais curto que o ritmo de trabalho dos seus aprovadores.

**Um job retido expirou enquanto o pipeline estava pausado.** Esperado — veja
[O orçamento de espera](#o-orçamento-de-espera).

**Um aprovador quer desfazer uma rejeição.** Ele não pode, e um operador também não. Uma decisão é
imutável. Busque o arquivo devolvido em `output/` e resubmeta-o; o novo job fica retido e o pool é
consultado de novo.

**Um aprovador removido ainda consegue abrir sua fila.** O link dele parou de funcionar no momento em que
ele saiu do pool, mas uma sessão de navegador que ele abriu com o link antes dura
`ApproverPortal:SessionLifetime` — veja [O link é uma senha](#o-link-é-uma-senha). Ela só alcança jobs
cujo pool congelado ainda o nomeia.

**O Assinar e aprovar diz que a extensão Web PKI está ausente, desatualizada ou sem suporte.** O navegador
do aprovador precisa da extensão Lacuna Web PKI, instalada uma vez por pessoa; o modal traz o caminho de
instalação, e nada mais pode acontecer até ela estar lá. Veja [Certificados](certificates.md).

**O certificado de todo aprovador é recusado como inválido de uma vez.** Leia o log operacional: cada
recusa carrega os motivos do SDK. Quando todos dizem que uma lista de revogação ou um respondedor OCSP não
pôde ser alcançado, o que está errado é a rede da implantação, e não o certificado de alguém — a
conferência não é de melhor esforço e não pode ser relaxada. Quando dizem que a raiz não é confiável e os
aprovadores estão apresentando certificados de **teste** da Lacuna, é o conjunto de confiança: a imagem
publicada os sujeita apenas à ICP-Brasil, a menos que o host opte com `Signing:TrustLacunaTestRoot` sob um
nome de ambiente diferente de `Production` — veja [Certificados](certificates.md).

**Um aprovador é sempre recusado com divergência de CPF.** O CPF que o pool registra para ele não é o CPF
do certificado que ele apresenta — um erro de digitação no pool, ou o certificado de um colega. Compare o
CPF do pool na página do job com o subject do certificado. Corrigir o perfil resolve os jobs que ficarem
retidos a partir de então; um job já retido congelou o CPF errado e precisa ser cancelado e reexecutado.

**Um job liberado falhou com `approval.signatures-missing`.** O conjunto de assinantes congelado do job
inclui os aprovadores, mas o envelope com as assinaturas deles não estava ao lado da cópia em stage quando
o pipeline foi promovê-lo, ou não pôde ser aberto como CAdES, ou uma aprovação do job não registrou
certificado. A pasta está sob `error/` com o que quer que estivesse nela. Algo removeu ou reescreveu o
arquivo em `processing/` — descubra o quê, e então reexecute o original de `input/` para que ele seja
aprovado do zero.

Mais modos de falha em [Diagnóstico de problemas](troubleshooting.md).

---

**A seguir:** [Retenção](retention.md).
**Anterior:** [Arquivos de pagamento CNAB240](cnab240.md).
