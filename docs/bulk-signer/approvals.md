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
consideravelmente.
:::

## Ligando isso

Acrescente um bloco `Approval` a um perfil de assinatura. Ele exige
[`CheckCNAB240: true`](cnab240.md) no mesmo perfil — um aprovador a quem não se pode mostrar o valor não
está aprovando nada significativo, então a interpretação é uma precondição, e não uma recomendação.

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

O boot é o único momento em que isso é detectável — toda outra superfície mostra o prazo quando um job já
ficou retido sob ele. Leia o banner após editar o valor.
:::

Cada chave, seu tipo e seu padrão estão em
[Configuração](configuration.md#signingprofilesapproval--a-etapa-de-aprovação). A inicialização recusa,
antes de o primeiro job rodar: um bloco `Approval` sem `CheckCNAB240`; um pool vazio; um
`MinimumApprovers` abaixo de 1 ou maior que o pool; um e-mail malformado, ou o mesmo e-mail duas vezes;
um CPF cujos dígitos verificadores não conferem; um `ExpiresAfter` não positivo. Uma regra de autorização
meio configurada não é uma funcionalidade degradada — é um portão que parece fechado e não está.

## A vida de um job retido

1. **Interpretação.** O worker coloca uma cópia do arquivo em stage em `processing/<jobid>/`,
   interpreta-o como uma [remessa CNAB240](cnab240.md), e registra o total, as contagens de pagamentos e
   de cancelamentos, o intervalo de datas de pagamento, o pagador, e um SHA-256 dos bytes exatos que
   leu.
2. **Retenção.** A regra de aprovação do perfil — pool, quórum e orçamento de espera — é **copiada para
   o job** e o job passa a `AwaitingApproval`. O slot de concorrência do worker é liberado
   imediatamente, então uma folha de pagamento retida não custa nada enquanto espera, e uma implantação
   com `MaxConcurrency = 1` continua trabalhando.
3. **Espera.** Os aprovadores abrem o link e decidem. Cada um tem exatamente uma decisão.
4. **Liberação, ou parada.** No momento em que o quórum é atingido, o job volta a `Queued` e o pipeline é
   acordado. Uma única rejeição, em vez disso, encerra o job como `Canceled` — veja
   [A rejeição é um veto](#a-rejeição-é-um-veto) — e o mesmo faz o esgotamento do orçamento de espera, se
   o perfil definiu um.
5. **Assinatura.** O caminho comum de reivindicação o pega, **retoma sobre a cópia em stage**, reconfere
   as datas de pagamento e o hash de conteúdo, e assina.

Não há worker em segundo plano para nada disso. O estado de aprovação vive no mesmo banco de dados em
que o handler escreve, então o instante em que o quórum é satisfeito é conhecido onde ele acontece; a
única coisa dirigida por um relógio — a expiração — pega carona no laço de consulta existente do
pipeline.

### O orçamento de espera

O `ExpiresAfter` é opcional e **ausente por padrão**, caso em que um job retido espera indefinidamente.
Defina-o e um job sobre o qual ninguém decide dentro da janela é cancelado:

- O motivo registrado na linha do tempo é **`Approval window expired.`**, seguido de quanto tempo ele
  esperou e quantas aprovações havia coletado.
- A cópia em stage é movida para `error/`, exatamente como fazem uma rejeição e um cancelamento de
  operador. O original permanece em `input/` e o observador não o ressuscitará automaticamente.
- Um evento operacional `ApprovalExpired` é registrado, e o
  `bulksigner_approvals_expired_total{profile}` é incrementado.
- **As aprovações já registradas são mantidas.** A regra congelada também. Uma expiração encerra a
  espera; ela não apaga a parte que aconteceu.

A janela é medida contra o orçamento **congelado naquele job**, nunca contra o que está atualmente no
`appsettings.json`, de modo que encurtar o valor na configuração não expira retroativamente jobs sobre os
quais as pessoas ainda estão decidindo. A verificação roda no laço de consulta do pipeline, então um job é
cancelado dentro de um `Pipeline:PollIntervalSeconds` de seu prazo, em vez de exatamente nele.

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
um perfil sem orçamento de espera nenhum.
:::

### A regra congelada

Quando um job fica retido, o pool de aprovadores, o quórum e o orçamento de espera recebem um snapshot no
job e **nunca são relidos da configuração**. Editar o `appsettings.json` e reiniciar não muda o que um job
retido exige.

Isso é deliberado e sustenta a carga. Sem isso, baixar o `MinimumApprovers` de 3 para 1 e reiniciar
satisfaria o quórum de todo job retido de uma vez — a configuração seria um desvio de autorização.
Também faria a trilha de auditoria mentir: alguém que aprovou sob "2 de 3" apareceria depois como tendo
aprovado sob "1 de 3".

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
| **Prazo** | quando a solicitação expira — exibido somente quando o perfil define um orçamento de espera |

Mais, quando o job é uma repetição de um previamente aprovado, uma linha dizendo quem aprovou o pai e se o
arquivo é idêntico byte a byte ao que aquela pessoa viu. **Aquelas aprovações não são transportadas** —
uma repetição precisa das suas.

Um aprovador escolhe seu endereço no pool, opcionalmente escreve um motivo, e clica em **Aprovar** ou
**Rejeitar**. Rejeitar exige um segundo clique de confirmação. Uma decisão é final em qualquer dos casos;
mudá-la significa pedir a um operador que cancele o job e o reexecute.

O seletor é o caminho anônimo. Um leitor que o servidor já consegue nomear — uma sessão de link do portal,
ou um login do Microsoft Entra carregando a role Approver — é informado de quem é, em vez de ser
perguntado, e sua decisão registra o método que o identificou.

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
inicialização. Depois abra a página **Sistema** do dashboard: cada aprovador configurado é listado com seu
link pessoal. Envie a cada pessoa apenas o dela, uma vez — o link não expira e não muda.

### O que ele mostra

Três abas, separadas pela **decisão do próprio aprovador**, e não pelo status do job:

| Aba | Contém |
|-----|--------|
| **Precisa de você** | Arquivos retidos sobre os quais você não decidiu. Seu trabalho de fato. |
| **Aguardando outros** | Arquivos retidos sobre os quais você *já* decidiu, ainda aquém do quórum. |
| **Decididos** | Arquivos que você decidiu e que já saíram da etapa, dentro do `DecidedLookback` (90 dias por padrão). |

As duas primeiras são ambas `AwaitingApproval` — um job com uma de três aprovações é simultaneamente
"pendente" e "parcialmente aprovado" — razão pela qual a página não é separada por status.

Cada linha é uma linha: o nome do arquivo, o total geral, as contagens de pagamentos e exclusões, a
contagem do quórum, e o prazo para decidir, se o perfil definir um. O pagador aparece somente quando a
fila tem mais de um. Mais um número escolhido porque ele pega o erro para o qual esta etapa existe:

- **Maior pagamento individual** — onde um zero a mais aparece. Um total geral é um número sobre o qual
  ninguém tem uma expectativa prévia; um pagamento uma ordem de grandeza acima de seus vizinhos é visível
  de relance.

**O chip de contagem é um link.** `1 de 2 aprovações` diz quantas; clicar nele abre a própria página do
job em uma nova aba, que é o único lugar que responde *quais* de vocês, quando, e — em uma rejeição — por
quê. O que um aprovador vê ali não é a visão do operador: somente jobs cujo pool congelado o nomeia, sem
link de aprovação, sem os CPFs do pool, e sem Retry, Cancel ou Download.

:::warning Sem detecção de duplicatas
Uma comparação contra o arquivo anterior do mesmo pagador foi removida em favor de uma fila que se lê de
relance, então **nada no produto hoje sinaliza um arquivo reenviado duas vezes**. O intervalo de datas de
pagamento também saiu da linha, mas aquele era cinto e suspensório sobre uma verificação de máquina — o
pipeline continua recusando uma remessa cujas datas de pagamento passaram, em todo perfil.
:::

### Selecionando o que fazer

Cada linha em **Precisa de você** carrega uma caixa de seleção, e uma barra acima da lista totaliza o que
você marcou. A caixa de selecionar tudo tem três estados — nenhum, alguns, todos. As outras duas abas não
têm nem caixa nem barra.

A barra carrega dois números: **Total selecionado** é o dinheiro; **Pagamentos selecionados** é a quantos
pagamentos aqueles arquivos correspondem, com quaisquer exclusões contadas separadamente — *(+3
exclusão)* — nunca compensadas. Um zero a mais aparece no valor; um arquivo enviado duas vezes ou cortado
pela metade aparece na contagem.

A marcação sobrevive a expandir e recolher uma linha, e é limpa para qualquer arquivo que deixe a lista
enquanto você está olhando.

**Arquivos sem total geral são excluídos da soma** e informados ao lado dela como uma contagem — *2
arquivos não têm total e não estão neste número* — em vez de contados como zero. Um perfil pode reter um
job para aprovação sem verificar o CNAB240, então um arquivo retido não precisa ser uma remessa. Se todo
arquivo marcado não tiver total, o número é um travessão, nunca `R$ 0,00`; uma remessa só de exclusões
ainda mostra `R$ 0,00`.

### Aprovando um lote

**Aprovar N selecionados** age sobre as linhas marcadas e sobre nada mais. Não há um "aprovar todos"
separado — marcar a caixa do cabeçalho e apertar este botão é o que isso significa.

Ele confirma primeiro, em um diálogo que reafirma a contagem, o total, e o maior arquivo individual do
lote. Não há como desfazer por trás disso.

Então as aprovações rodam uma após a outra, e **todo arquivo selecionado é tentado**, independentemente
do que os anteriores retornaram. O relatório tem duas partes: um agregado (*9 de 12 aprovados; 6
seguiram para a assinatura*), e **uma lista nomeando cada arquivo que não passou, e o motivo.**

Espere alguns. Cada aprovação é uma chamada independente, e um colega pode ter agido enquanto você lia —
então *já decidido*, *não está mais aguardando aprovação — está Canceled* (que é como a rejeição de um
colega se parece daqui), e *você não está no pool de aprovadores deste arquivo* são todos desfechos
comuns. Arquivos que foram aprovados se desmarcam sozinhos; **arquivos que falharam continuam marcados**,
de modo que apertar o botão de novo repete exatamente aqueles.

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

**Quem recebe** expande a linha para a tabela de pagamentos, com os identificadores por inteiro.

### Levando uma lista com você

Toda aba carrega um botão **Exportar para Excel**, no mesmo lugar nas três, desabilitado em vez de oculto
quando a aba está vazia. Ele baixa a aba em que você está como uma pasta de trabalho `.xlsx`: uma linha
por **arquivo** de pagamento, nunca uma por beneficiário.

Ele exporta **a aba inteira**, não as linhas marcadas — as marcações pertencem a
[aprovar um lote](#aprovando-um-lote) e existem apenas em *Precisa de você*.

| Aba | Para que serve a exportação |
|-----|-----------------------------|
| **Precisa de você** | Planejar as aprovações de uma manhã antes de começar a clicar |
| **Aguardando outros** | Cobrar os colegas que estão segurando arquivos que você já decidiu |
| **Decididos** | Responder "o que eu aprovei no mês passado" sem perguntar a um operador |

Acima da tabela, a pasta de trabalho declara quem a gerou, em que momento, a partir de qual lista, e em
qual relógio estão os timestamps. **Na exportação de Decididos ela também declara seus dois limites** — a
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
- **Para revogar uma pessoa**, remova-a de `Approvers` em todo perfil. O link dela para de funcionar
  imediatamente. Jobs já retidos com ela no pool mantêm sua entrada — a regra congelada não se move.
- **Para revogar todo mundo**, mude o `ApproverPortal:LinkSecret`. Todo link quebra de uma vez.

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
- **Os operadores recebem uma lista `Segundo fator do aprovador`** na
  [página Sistema](dashboard.md#system--sistema) — uma linha por aprovador configurado, inscrito ou não,
  com a data — e um botão **Resetar**. Esse é o caminho do celular perdido, e é registrado sob o nome do
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
decisão substituído por um caminho para o portal, e o aviso de autodeclaração indo junto, porque não há
mais uma decisão autodeclarada sobre a qual avisar. A mesma URL aberta por um leitor que detenha um link
de portal ou uma sessão do Entra se comporta exatamente como o portal: os mesmos controles, o mesmo pedido
de código, e a *mesma* janela, de modo que verificar no portal e depois seguir um link do e-mail da semana
passada não pergunta duas vezes.

O banner de boot segue a mesma regra. O aviso que dispara em todo perfil com aprovação configurada — "as
decisões nesta build são autodeclaradas" — é falso quando o fator está ligado, então com a configuração
habilitada ele passa a ser uma linha informativa declarando a postura real, inclusive que a rota REST
agora recusa toda chamada.

:::warning Isso não torna um operador incapaz de ser um aprovador
TOTP é simétrico, um operador pode ler todo link de aprovador e resetar toda inscrição, então um operador
ainda pode ser qualquer aprovador. Vincular um aprovador ao CPF do pool congelado via um certificado
ICP-Brasil continua pendente, e este controle não deve ser descrito como tendo fechado essa lacuna.
:::

Cada chave, seus limites e as três recusas de boot estão em
[Configuração](configuration.md#approversecondfactor).

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

- A cópia em stage é movida para `error/`, preservando os bytes exatos que foram rejeitados.
- O original **permanece em `input/`**, e o observador não o ressuscitará automaticamente.
- **A repetição não se aplica.** O retry só aceita `Failed`. Um arquivo rejeitado volta somente por um
  rescan ou reenvio deliberado — o financeiro o corrige e o resubmete.

Rejeições são distinguidas de cancelamentos de operador pela trilha de auditoria, não pelo status: a linha
do tempo do job nomeia o aprovador que rejeitou e seu motivo, e um evento operacional `ApprovalRejected` é
registrado.

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
local quanto no caminho de upload ao assinador remoto.

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

`POST /api/jobs/{id}/cancel`, ou o botão Cancel na página do job. Um job retido é cancelável precisamente
porque nada o está segurando. A cópia em stage é movida para `error/` e o arquivo permanece em `input/`; o
observador honra o cancelamento e não o ressuscitará automaticamente.

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
| `IpAddress` | o endereço remoto da conexão, ou nulo. **Atrás de um proxy reverso esse é o proxy**, a menos que cabeçalhos encaminhados estejam configurados |
| `UserAgent` | literal, truncado em 512 caracteres, ou nulo |

O `IdentificationMethod` existe para que, à medida que identificação mais forte chegue, aprovações
anteriores continuem visivelmente sendo o que eram, na mesma tabela, em vez de serem retroativamente
abençoadas. Membros são acrescentados, nunca reaproveitados, e nenhuma linha é jamais migrada para um novo
valor.

Aprovações registradas pelo dashboard ou pelo portal não carregam IP nem user agent: aqueles caminhos
rodam sobre o circuito Blazor, onde não há requisição HTTP de onde lê-los. A rota REST registra ambos.

### Dados pessoais

O pool guarda um nome, um e-mail e um CPF por aprovador, e cada linha de aprovação os copia. O CPF é
**apenas exibição e auditoria**: validado nos dígitos verificadores no boot, normalizado para onze dígitos
puros, e nada se ramifica a partir dele.

O `Cpf` está na lista de propriedades estruturadas a mascarar, então ele não consegue chegar a um log
durável. Endereços de aprovadores são mascarados (`m***@empresa.com.br`) na narração de console e em
eventos operacionais; os endereços completos vivem no snapshot congelado e nas linhas de aprovação. Veja
[Segurança](security.md).

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

As recusas carregam um `code` estável:

| Código | Status | Significado |
|--------|--------|-------------|
| `job.not-found` | 404 | nenhum job com aquele id |
| `approval.not-pending` | 409 | o job não aceita decisão em seu status atual |
| `approval.unknown-approver` | 403 | o endereço não está no pool congelado do job (também retornado para um endereço malformado, deliberadamente) |
| `approval.already-decided` | 409 | este aprovador já decidiu; decisões são finais |
| `approval.unknown-decision` | 400 | `decision` não era nem `approved` nem `rejected` |
| `validation.reason-too-long` | 400 | `reason` excede 512 caracteres. Recusado em vez de truncado |
| `approval.job-incomplete` | 500 | o job está retido, mas sua regra congelada ou seu hash de conteúdo está faltando |

### Lendo o estado a partir de outro sistema

*Ler* são duas rotas autenticadas, para relatórios de conformidade, um dashboard externo, ou um monitor
observando jobs retidos além de algum limiar:

- O `GET /api/jobs/{id}` carrega um resumo `approval` — o quórum congelado, o tamanho do pool, quantas
  pessoas aprovaram e rejeitaram, `vetoed`, `parkedSince` e o prazo de expiração se a regra definiu um.
  `null` em qualquer job que nunca ficou retido. Ramifique por `vetoed`, e não por aritmética própria: o
  `quorumReached` pode ser `true` em um job que um veto já parou.
- O `GET /api/jobs/{id}/approvals` retorna o pool congelado com a decisão de cada membro, e a lista de
  decisões. O CPF é mascarado até seus dígitos verificadores nos dois. `404` com
  `approval.not-required` em um job que nunca ficou retido — uma resposta distinta de um job retido sobre
  o qual ninguém decidiu, que é `200` com uma lista vazia.

Todo número vem da regra congelada no job, nunca do `appsettings.json`.

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

Uma taxa de *expiração* que sobe geralmente diz algo sobre a sua distribuição do link de aprovação — o
produto não envia e-mail, então uma janela vencida geralmente significa que o link nunca chegou a
ninguém.

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
congelado no momento da retenção, não o que está no seu arquivo de configuração. Se as pessoas listadas
estiverem erradas, cancele o job, corrija o perfil, e reexecute o arquivo.

**Um aprovador recebe "não é um aprovador para este job".** O endereço dele não está no pool congelado.
Compare-o com o pool exibido na página do job — espaços no início/fim e maiúsculas não importam, qualquer
outra coisa importa.

**Um job liberado falhou com `approval.content-changed`.** A cópia em stage em `processing/<jobid>/` foi
modificada depois que os aprovadores a viram. A pasta do job agora está sob `error/`. Não o reassine —
descubra o que escreveu em `processing/`, e então reexecute o arquivo original de `input/`, para que ele
seja interpretado, totalizado e aprovado do zero.

**Um job diz "2 de 2 aprovações — rejeitado".** As duas leituras são verdadeiras. A contagem é a
aritmética e o desfecho é o veto. A linha do tempo nomeia o aprovador que rejeitou e seu motivo.

**Um job falhou com `approval.rejected` em vez de ser cancelado.** A rejeição chegou depois de um worker
já ter reivindicado o job, então o pipeline recusou a assinatura em vez de o handler de aprovação
cancelá-lo. O arquivo está sem assinatura, que é o ponto.

**Um job foi cancelado com "Approval window expired."** Ninguém decidiu dentro da janela `ExpiresAfter` do
perfil. A cópia em stage está sob `error/<jobid>/`, o original ainda está em `input/`, e quaisquer
aprovações que *tenham sido* registradas continuam na página do job. A repetição não se aplica —
reexecute o arquivo por Rescan ou Upload. Se as janelas continuam vencendo, ou o link não está chegando às
pessoas, ou o orçamento é mais curto que o ritmo de trabalho dos seus aprovadores.

**Um job retido expirou enquanto o pipeline estava pausado.** Esperado — veja
[O orçamento de espera](#o-orçamento-de-espera).

**Um aprovador quer desfazer uma rejeição.** Ele não pode, e um operador também não. Uma decisão é
imutável. Resubmeta o arquivo; o novo job fica retido e o pool é consultado de novo.

Mais modos de falha em [Diagnóstico de problemas](troubleshooting.md).

---

**A seguir:** [Retenção](retention.md).
**Anterior:** [Arquivos de pagamento CNAB240](cnab240.md).
