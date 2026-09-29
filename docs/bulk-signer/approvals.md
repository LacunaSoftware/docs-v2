---
sidebar_label: "Aprovações"
sidebar_position: 14
---

# Aprovações

Alguns arquivos de pagamento não devem ser assinados antes que uma pessoa os examine. Um perfil de
assinatura pode exigir isso: um job roteado por ele para antes do assinador, fica retido em
`AwaitingApproval` e espera até que um número suficiente de pessoas de uma lista fixa o aprove. Só então
ele é assinado.

:::danger Leia isto primeiro
A página de aprovação por job **não é autenticada**. Qualquer pessoa que consiga abrir o link de
aprovação de um job pode aprovar — ou rejeitar — em nome de qualquer membro do pool daquele job. Essa é
uma decisão de projeto deliberada nesta versão, e não um descuido, e muda a forma como você deve tratar o
link. Veja [Segurança](#segurança).

O [portal do aprovador](#o-portal-do-aprovador) opcional e o
[login pelo Microsoft Entra ID](#entrando-com-o-microsoft-entra-id) reduzem bastante esse risco, e o
[segundo fator](#provando-que-é-você) e um
[conjunto de assinantes em que os aprovadores assinam](#o-conjunto-de-assinantes) tiram, cada um, a
decisão por completo das mãos de um leitor não identificado.
:::

## Habilitando a aprovação

Acrescente um bloco `Approval` a um perfil de assinatura. Ele exige
[`CheckCNAB240: true`](cnab240.md) no mesmo perfil — um aprovador que não pode ver o valor não está
aprovando nada de significativo, então a interpretação do arquivo é um pré-requisito, e não uma
recomendação. A página do perfil impede essa combinação pelos dois lados: **Editar aprovação** recusa
uma regra em um perfil cuja verificação está desligada, e **Editar comportamento** recusa desligar a
verificação enquanto houver uma regra, indicando a solução — remova a regra primeiro. Se, mesmo assim, um
job chegar à etapa sem a interpretação (em um perfil gravado antes de essa segunda recusa existir), ele
falha com um código explícito (`approval.content-unmeasured`), em vez de ficar retido como um job sobre o
qual nenhum aprovador jamais conseguiria decidir.

:::warning Mudou na 2.1.0 — em uma implantação em execução, a regra é editada pela página do perfil
Os perfis de assinatura ficam no banco de dados operacional, e o `Signing:Profiles[]` é um seed (carga
inicial) de uso único, importado no primeiro boot. Em uma implantação que já foi iniciada uma vez, o JSON
abaixo é **inerte**: ele descreve o formato de um *primeiro* boot. Depois disso, a regra é editada em
**Editar aprovação** em `/profiles/{name}` — o pool (acrescentar, remover e editar membros), o quórum e
o prazo de espera, com as mesmas recusas e sem reinicialização —, e ali também é possível acrescentar a
etapa a um perfil ou removê-la. Um perfil cujos aprovadores assinam, e que portanto não tem chave
própria, é **criado já com a sua regra** em `/profiles/_new`, escolhendo **Nenhum — os aprovadores
assinam** como método de assinatura. Tudo o que esta página diz sobre o que uma regra *significa* vale
em todas as interfaces; o que muda é onde você a digita.

Uma mudança salva ali vale a partir do próximo arquivo que ficar retido. Jobs já retidos mantêm a regra
que congelaram — veja [A regra congelada](#a-regra-congelada).
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
quaisquer duas das três bastam para o job; nenhuma pessoa específica é obrigatória.

### O conjunto de assinantes

:::tip Novo na 2.1.0 — os aprovadores podem assinar o próprio arquivo de pagamento
Até a 2.0.x, uma aprovação era sempre um clique, e o certificado do próprio perfil assinava o arquivo. O
conjunto de assinantes permite que os aprovadores o coassinem com os seus próprios certificados
ICP-Brasil, em vez da chave do perfil ou além dela.
:::

O `Signers` define **de quem são as assinaturas que o arquivo entregue carrega**. São três valores
possíveis, e não há um quarto:

| Valor | Quem assina o arquivo entregue | O que é uma aprovação |
|---|---|---|
| `ProfileKey` | O próprio certificado do perfil, como todo perfil fazia antes de esse valor existir. É o padrão, e é assim que são lidos todos os perfis existentes e todos os jobs retidos antes de o valor existir. | Um clique — no portal, na página por job ou na rota anônima. |
| `Approvers` | O certificado ICP-Brasil de cada membro do pool que aprova, e **nunca** o do perfil. Um perfil assim é **sem chave**: não guarda certificado algum, nada é aberto para ele na inicialização, e ele não fica degradado por não ter um. Ele pode ser criado já assim, com o pool, em `/profiles/_new` — nenhum certificado é pedido — e exige o formato `Cades`, já que a assinatura de um aprovador é uma coassinatura CAdES. | Uma assinatura — veja [Aprovando por assinatura](#aprovando-por-assinatura). |
| `ProfileKeyAndApprovers` | Ambos: os aprovadores assinam enquanto o job espera, e a chave do perfil coassina o que eles assinaram quando o job é liberado. Recusado em combinação com `Method: LacunaSigner`, caso em que o assinador remoto receberia um envelope em vez de uma remessa. | Uma assinatura. |

É um único valor, e não duas chaves liga/desliga, para que não seja possível configurar "ninguém
assina", e ele fica sob `Approval` porque dois dos seus três valores não fazem sentido sem um pool. Assim
como o pool, o quórum e o prazo de espera, ele é **congelado por inteiro no job** no momento em que o job
fica retido: um aprovador que assina um arquivo está fazendo uma afirmação sobre um formato final
conhecido, e desligar a chave do perfil às suas costas transformaria "coassinamos com a empresa" em "só
nós assinamos" — veja [A regra congelada](#a-regra-congelada).

A escolha de qualquer um dos conjuntos que incluem aprovadores é validada no momento de salvar, nunca
recusada no boot. Ela exige:

- **um meio de assinatura** — um
  [`WebPki:License`](configuration.md#webpki--lacuna-web-pki-no-navegador-do-aprovador) para um
  certificado no navegador do aprovador, ou um
  [`CloudHub:ApiKey`](configuration.md#cloudhub--lacuna-cloudhub-para-certificados-em-nuvem) para um
  certificado em nuvem; qualquer um dos dois basta;
- **uma forma de identificar o aprovador** — `ApproverPortal:Enabled` ou uma seção `Auth:EntraId`, as
  duas únicas credenciais com as quais uma assinatura é registrada;
- **`CheckCNAB240`**, como qualquer regra de aprovação, e o formato **`Cades`**.

Cada aprovador precisa, então, de um certificado próprio, como descrito em
[Certificados](certificates.md#o-certificado-do-aprovador). O valor vem do `Signers` acima, no seed, ou,
depois do primeiro boot, é escolhido no formulário de aprovação da página do perfil (**Conjunto de
assinantes**), onde a passagem para um conjunto com aprovadores exige confirmação após um aviso — veja o
fim de [Aprovando por assinatura](#aprovando-por-assinatura).

:::warning Escreva `ExpiresAfter` com o componente de dias
`"2.00:00:00"` é a janela de quarenta e oito horas acima. Um valor de três componentes só é `hh:mm:ss`
enquanto o primeiro número for 23 ou menos; a partir de 24, o .NET lê esse número como **dias**, então
`"48:00:00"` são quarenta e oito *dias*. O validador não o recusa — uma janela longa pode ser
intencional —, mas o **banner de inicialização emite um aviso a partir de 24 dias**, informando o valor
resolvido e a grafia correta:

```
  pagamentos-bb   Cades · cert=Pfx · verify=on · encrypt=off · validate-cert=on · cnab240=on · approval=2/3 · expires=1152h

WARN  Profile 'pagamentos-bb' has an approval wait budget of 1152h (48 days) …
      Forty-eight hours is "2.00:00:00". Ignore this if the long window is deliberate.
```

O banner é o único lugar em que isso pode ser detectado na configuração — todas as outras telas somente
leitura só mostram o prazo quando um job já ficou retido sob ele. Leia o banner depois de editar o
valor.

**A página do perfil evita o problema da grafia por completo**: nela, o prazo de espera é um número de
horas, que não admite duas leituras, e um prazo já gravado com o erro aparece ali como as 1.152 horas que
ele de fato representa. Ela pede confirmação antes de salvar um prazo igual ou superior ao mesmo limite de
24 dias.
:::

Todas as chaves, com tipo e valor padrão, estão em
[Configuração](configuration.md#signingprofilesapproval--a-etapa-de-aprovação). A inicialização recusa,
antes de o primeiro job rodar, um seed que tenha: um bloco `Approval` sem `CheckCNAB240`; um pool vazio;
um `MinimumApprovers` menor que 1 ou maior que o pool; um e-mail malformado, ou o mesmo e-mail duas vezes;
um CPF cujos dígitos verificadores não conferem; um `ExpiresAfter` não positivo. **Editar aprovação**
recusa os mesmos casos no momento de salvar — além de um nome em branco —, indicando a linha a que se
referem, no seu idioma de exibição, e não grava nada. Uma regra de autorização configurada pela metade
não é uma funcionalidade degradada — é um portão que parece fechado e não está.

## A vida de um job retido

1. **Interpretação.** O worker prepara uma cópia do arquivo em `processing/<jobid>/`,
   interpreta-o como uma [remessa CNAB240](cnab240.md) e registra o total, as contagens de pagamentos e
   de cancelamentos, o intervalo de datas de pagamento, o pagador e um SHA-256 dos bytes exatos que
   leu.
2. **Retenção.** A regra de aprovação do perfil — pool, quórum, prazo de espera e conjunto de
   assinantes — é **copiada para o job**, e o job passa a `AwaitingApproval`. O slot de concorrência do
   worker é liberado imediatamente, então uma folha de pagamento retida não custa nada enquanto espera,
   e uma implantação com `MaxConcurrency = 1` continua trabalhando.
3. **Espera.** Os aprovadores decidem — pela fila no portal, pela página por job ou pela rota anônima.
   Cada um tem direito a exatamente uma decisão. Em um perfil cujos aprovadores assinam, cada aprovação é
   uma coassinatura acrescentada ao arquivo enquanto ele espera.
4. **Liberação ou interrupção.** No momento em que o quórum é atingido, o job volta a `Queued` e o
   pipeline é despertado. Já uma única rejeição encerra o job como `Canceled` — veja
   [A rejeição é um veto](#a-rejeição-é-um-veto) —, e o mesmo acontece quando o prazo de espera se
   esgota, se o perfil definiu um.
5. **Assinatura.** O caminho comum de reivindicação o pega, **retoma a partir da cópia preparada**, confere
   de novo as datas de pagamento e o hash do conteúdo e assina — com a chave do perfil ou promovendo as
   assinaturas dos próprios aprovadores (com a da chave do perfil ao lado, sob `ProfileKeyAndApprovers`).
   O arquivo assinado é verificado exatamente contra os signatários que o conjunto congelado indica.

Nada disso depende de um worker em segundo plano. O estado de aprovação fica no mesmo banco de dados em
que o handler grava, então o instante em que o quórum é atingido é conhecido onde ele acontece; a única
coisa que depende de relógio — a expiração — aproveita o laço de polling que o pipeline já tem.

Do lado do operador, o `/jobs` tem uma coluna **Aprovações** (nova na 2.12.0) que exibe um chip em cada
linha `AwaitingApproval`: quantas aprovações ainda faltam, *quórum atingido* ou *rejeitado* — lido da
regra congelada no job, nunca do perfil atual. Veja [Dashboard](dashboard.md).

### O prazo de espera

O `ExpiresAfter` é opcional e **não é definido por padrão**; nesse caso, um job retido espera
indefinidamente. Se ele for definido, um job sobre o qual ninguém decidir dentro da janela é cancelado:

- O motivo registrado na linha do tempo é **`Approval window expired.`**, seguido de quanto tempo o job
  esperou e quantas aprovações havia coletado.
- A cópia preparada é movida para `error/`, exatamente como em um cancelamento pelo operador — e **ao
  contrário de uma rejeição**, que devolve o arquivo para `output/`. A diferença é deliberada: um veto é
  uma afirmação sobre o arquivo, enquanto uma expiração é o produto desistindo de esperar. O original
  permanece em `input/`, e o observador não o reprocessará automaticamente.
- Um evento operacional `ApprovalExpired` é registrado, e o
  `bulksigner_approvals_expired_total{profile}` é incrementado.
- **As aprovações já registradas são mantidas.** A regra congelada também. Uma expiração encerra a
  espera; ela não apaga o que já aconteceu.

A janela é medida pelo prazo **congelado naquele job**, nunca pelo que está atualmente no perfil, de modo
que encurtar o valor não faz expirar retroativamente jobs sobre os quais as pessoas ainda estão
decidindo. A verificação roda no laço de polling do pipeline, então um job é cancelado até um
`Pipeline:PollIntervalSeconds` depois do prazo, e não exatamente nele.

Duas propriedades que convém conhecer antes de defini-lo:

- **Uma pausa não o estende.** O prazo é contado em tempo de relógio, e não em tempo de atividade do
  pipeline; então, se o pipeline ficar pausado durante uma janela, os jobs cujas janelas se fecharam
  durante a pausa expiram.
- **Um empate é resolvido a favor das pessoas.** Se um quórum for atingido, uma rejeição chegar ou um
  operador cancelar no mesmo momento em que a varredura roda, vence quem chegou primeiro.

:::note A expiração é manutenção, não um controle de correção
O que protege o dinheiro em um arquivo de pagamento que ficou parado tempo demais é a
[verificação da data de pagamento](cnab240.md#datas-de-pagamento-que-já-passaram), que se recusa a
assinar uma remessa cujas datas de pagamento já passaram, qualquer que tenha sido a causa da demora —
inclusive em um perfil sem prazo de espera. Um perfil pode desligar essa verificação
(`CheckCnab240PaymentDates = false`, para um banco que processa pagamentos com data passada no dia útil
seguinte — veja [Desligando a verificação](cnab240.md#desligando-a-verificação)); nesse caso, só os
aprovadores restam como barreira, e é por isso que a página de aprovação os avisa quando uma data já
passou — veja [O que o aprovador vê](#o-que-o-aprovador-vê).
:::

### A regra congelada

Quando um job fica retido, o pool de aprovadores, o quórum, o prazo de espera e o
[conjunto de assinantes](#o-conjunto-de-assinantes) são copiados para o job como um snapshot e **nunca
são relidos do perfil**. Editar o `appsettings.json` e reiniciar não muda o que um job retido exige — e
editar a regra em `/profiles/{name}` também não: é a mesma propriedade, diante de um meio de edição mais
rápido.

Isso é deliberado e essencial. Sem isso, baixar o `MinimumApprovers` de 3 para 1 satisfaria de uma vez o
quórum de todos os jobs retidos — a página do perfil viraria uma forma de burlar a autorização, e sem nem
precisar de reinicialização. Também faria a trilha de auditoria mentir: alguém que aprovou sob "2 de 3"
apareceria depois como tendo aprovado sob "1 de 3". Da mesma forma, alguém acrescentado ao pool hoje não
consegue aprovar um arquivo que ficou retido ontem.

## O que o aprovador vê

A página por job fica em `/approve/{jobId}` e mostra:

| | |
|---|---|
| **Nome do arquivo** | como ele chegou |
| **Total geral** | soma dos registros de inclusão, em reais; exclusões são contadas, nunca compensadas |
| **Pagamentos** | número de registros de inclusão |
| **Exclusões** | número de registros de exclusão |
| **Datas de pagamento** | a mais antiga e a mais recente, ou uma única data quando todos os pagamentos do arquivo caem no mesmo dia |
| **Pagador** | *Nome da Empresa* e *Número de Inscrição* do Header do Arquivo |
| **Progresso** | "1 de 2 aprovações", quem já decidiu e quem ainda não |
| **Hash do conteúdo** | o SHA-256 ao qual a aprovação será vinculada |
| **Prazo** | quando a solicitação expira e o job é cancelado sem assinatura — exibido somente quando o perfil define um prazo de espera |

Além disso, em um job ainda aguardando cuja data de pagamento mais antiga já é anterior a hoje, aparece o
aviso **A data de pagamento já passou** (novo na 2.15.0). O texto do aviso segue a verificação da data de
pagamento do perfil como ela está configurada *agora* — a verificação roda na assinatura, e não na
retenção, então é lida do perfil atual, e não da regra congelada. Com a verificação ligada, o aviso diz
que o arquivo falhará na assinatura mesmo se for aprovado e que precisa ser exportado de novo; com ela
desligada (ou com o próprio CNAB240 desligado), diz que o arquivo será assinado se for aprovado. Para um
perfil que esta instância ainda não conhece — criado em outra instância desde o último ciclo de
polling —, o aviso mostra a data, sem nenhuma previsão. O aviso não altera em nada a aceitação de uma
decisão. Veja [Desligando a verificação](cnab240.md#desligando-a-verificação).

Além disso, quando o job é uma nova tentativa de outro já aprovado, uma linha informa quem aprovou o job
original e se o arquivo é idêntico, byte a byte, ao que essa pessoa viu. **Essas aprovações não são
transferidas** — uma nova tentativa precisa das suas próprias.

O aprovador escolhe o próprio endereço no pool, escreve um motivo, se quiser, e clica em **Aprovar** ou
**Rejeitar**. Rejeitar exige um segundo clique de confirmação. Em ambos os casos a decisão é definitiva;
para mudá-la, é preciso pedir a um operador que cancele o job e o execute de novo.

O seletor é o caminho anônimo. Um leitor que o servidor já consegue identificar — por uma sessão de link
do portal ou por um login do Microsoft Entra com a role Approver — vê quem ele é, em vez de ter de
escolher, e a decisão registra o método que o identificou. Em um job cujo conjunto de assinantes
congelado inclui os aprovadores, o seletor desaparece: um leitor não identificado recebe a página somente
leitura, e um identificado recebe o botão **Assinar e aprovar** — veja
[Aprovando por assinatura](#aprovando-por-assinatura).

### Os pagamentos individuais

Abaixo dos números fica a mesma tabela paginada de pagamentos usada na página do job do operador — uma
linha para cada registro do arquivo que carrega valor.

**Um total sozinho não é uma aprovação; é um carimbo automático.** "R$ 1.240.000 em 312 pagamentos, sim
ou não" não dá a uma pessoa nenhuma forma de notar o zero a mais em um lote da folha de pagamento, o
beneficiário que aparece duas vezes ou o número de conta que mudou discretamente desde o mês passado. São
exatamente esses os erros que esta etapa existe para detectar, e nenhum deles aparece em um total geral.

| Coluna | Na página de aprovação anônima | Por quê |
|--------|--------------------------------|---------|
| Registro, lote, segmento | completos | Onde isto está no arquivo e que tipo de pagamento é |
| Nome no registro | completo | **Esta é a decisão.** Um beneficiário duplicado ou inesperado só é visível aqui |
| Data de pagamento | completa | Parte da decisão — uma data que ninguém esperava é motivo para rejeitar |
| Valor | completo | A decisão. Linhas de exclusão são identificadas e riscadas, e não entram no total |
| CPF / CNPJ | **somente os dígitos verificadores** — `***.***.***-09` | Desnecessário para decidir. Suficiente para distinguir duas pessoas com o mesmo nome |
| Conta | **somente os últimos dígitos** — `***149-4`, agência omitida | Desnecessário para decidir. Suficiente para responder "esta conta mudou?" |

As colunas mascaradas trazem a indicação *(parcial)* — um cabeçalho "CPF" sem essa ressalva, sobre um
valor mascarado, dá a entender que o número está completo, e um aprovador que o comparasse com um
documento concluiria que o arquivo está errado.

**A regra de mascaramento segue o leitor, não a página.** Um aprovador que o servidor consegue
identificar — por um link do portal ou por um login do Entra — vê os identificadores completos, nesta
página e na sua fila. O mascaramento existe para a página acessível a qualquer pessoa que tenha uma URL
repassada.

Algumas linhas legitimamente não têm identificador nem conta: um boleto (segmento J), um tributo (N) e um
pagamento de concessionária (O) são pagos por código de barras ou ao governo. Essas células mostram um
travessão — uma ausência, não uma máscara. Em uma linha de **tributo**, o nome é o do *contribuinte*, não
o do destinatário, e a página avisa isso acima da tabela.

:::note
A tabela só existe enquanto o job está em andamento. O detalhe de linhas é expurgado na transição para
qualquer status terminal ([Retenção](retention.md#a-única-exceção-detalhe-de-linhas-do-cnab240)), então um
aprovador que abre o link de um job já decidido vê os totais e uma nota informando que as linhas foram
removidas.
:::

### O que a página de aprovação deliberadamente não oferece

- **Nenhum download do arquivo bruto**, em nenhuma tela de aprovação. Uma tabela renderizada e paginada é
  uma exposição limitada, a serviço de uma decisão; o arquivo em si é um dump completo, legível por
  máquina, do CPF e da conta bancária de cada beneficiário. Os bytes brutos ficam restritos à interface
  autenticada do operador (`GET /api/jobs/{id}/output`). Mostrar a tabela sem máscara para um aprovador
  identificado não liberou o acesso aos bytes.
- **Nenhuma listagem *anônima* de aprovações pendentes.** Nenhuma rota não autenticada lista jobs
  aguardando aprovação; a página só é acessível com o id de um job específico, e ids de job são GUIDs v4.
  O [portal do aprovador](#o-portal-do-aprovador) *é* uma listagem, mas tem uma política de autorização e
  mostra apenas os jobs cujo pool congelado inclui quem o está acessando.

## O portal do aprovador

Um link por arquivo de pagamento, repassado por um operador, funciona para um arquivo, mas se torna
inviável para quem aprova quarenta por mês. Habilite o `ApproverPortal`
([Configuração](configuration.md#approverportal)) e cada aprovador passa a ter, **em vez disso, um link
permanente**, que abre a própria fila em `/approvals`:

```json
{
  "ApproverPortal": {
    "Enabled": true,
    "LinkSecret": "…"
  }
}
```

Na prática, defina o `LinkSecret` via `ApproverPortal__LinkSecret` — com no mínimo 32 caracteres,
exigência verificada na inicialização. Depois, abra a página **Sistema** do dashboard: todos os
aprovadores do pool de cada perfil aparecem ali com o respectivo link pessoal. Envie a cada pessoa apenas
o dela, uma única vez — o link não expira e não muda.

O portal, a página por arquivo e a página *Link de aprovação necessário* exibem a marca do produto no
cabeçalho — e, quando a implantação define um
[logotipo do cliente](configuration.md#branding--o-logotipo-do-cliente-nas-páginas-de-login-e-de-aprovação),
esse logotipo ao lado. O aprovador geralmente é alguém do próprio financeiro do cliente, e a marca que ele
reconhece é a do seu empregador.

### O que ele mostra

Três abas, divididas pela **decisão do próprio aprovador**, e não pelo status do job:

| Aba | Contém |
|-----|--------|
| **Aguardando você** | Arquivos retidos sobre os quais você ainda não decidiu. O seu trabalho de fato. |
| **Aguardando outros** | Arquivos retidos sobre os quais você *já* decidiu, mas que ainda não atingiram o quórum. |
| **Aprovados** | Arquivos sobre os quais você decidiu e que já saíram da etapa, dentro do período `DecidedLookback` (90 dias por padrão). |

As duas primeiras abas são `AwaitingApproval` — um job com uma de três aprovações é, ao mesmo tempo,
"pendente" e "parcialmente aprovado" —, e é por isso que a página não é dividida por status.

Cada arquivo ocupa uma linha: o nome do arquivo, o total geral, as contagens de pagamentos e de exclusões,
a contagem de aprovações e o prazo para decidir, se o perfil definir um. Uma linha cujo
[conjunto de assinantes](#o-conjunto-de-assinantes) do perfil inclui os aprovadores exibe um chip
**Exige assinatura** ao lado do status: a aprovação dela é uma coassinatura com o seu próprio
certificado, o botão diz **Assinar e aprovar**, e ela tem uma caixa de seleção como qualquer outra, então
pode fazer parte de um lote. O pagador só aparece quando a fila tem mais de um. Há ainda um número
escolhido por detectar justamente o erro para o qual esta etapa existe:

- **Maior pagamento** — onde um zero a mais aparece. Ninguém tem uma expectativa prévia sobre um total
  geral; já um pagamento uma ordem de grandeza acima dos demais salta aos olhos.

**A fila se atualiza sozinha.** A cada `ApproverPortal:PollInterval` — dez segundos por padrão —, a
página relê a sua fila, então você não precisa recarregá-la para saber se um colega agiu. O cabeçalho
mostra isso: há quanto tempo a fila foi atualizada, um indicador durante a leitura e um botão **Atualizar
agora** para quando você quiser atualizar na hora. Se uma leitura falhar, **a fila que você está vendo
continua na tela**, e o cabeçalho informa que a atualização falhou e quando ela funcionou pela última vez;
os botões de decisão continuam funcionando, porque, de qualquer forma, cada decisão é conferida no banco
de dados no momento em que você a toma. A única exceção é o primeiro carregamento: sem uma fila a
manter, uma falha ali resulta em uma mensagem de erro.

Uma atualização nunca acontece no meio de um lote, nem enquanto o pedido de segundo fator está aberto.
Ela **pode**, porém, rodar por trás dos dois diálogos de confirmação; então, se um colega levar um dos
seus arquivos selecionados ao quórum enquanto você lê o resumo, esse arquivo sai do lote antes de ele
rodar: o efeito é sempre seguro — um arquivo que mudou nunca é afetado —, mas a contagem que você
confirmou pode estar defasada em uma unidade. A linha de progresso conta o lote que de fato rodou.

**O botão Sair também fica no cabeçalho**, ao lado do seu nome. Ele encerra a sessão deste navegador — a
sessão do link ou o login da Microsoft — e nada mais: o seu link não é afetado, e abri-lo de novo cria
uma nova sessão. A página em que você cai indica como voltar: a página *Link de aprovação necessário*,
para quem usa link, ou o login da Microsoft, para uma conta do Entra. Use-o em uma máquina compartilhada:
se você não sair, uma sessão de link dura `ApproverPortal:SessionLifetime` (30 dias por padrão, com
expiração deslizante) e um login da Microsoft, oito horas, também com expiração deslizante.

**O chip de contagem é um link.** `1 de 2 aprovações` informa quantas; clicar nele abre a página do
próprio job em uma nova aba, que é o único lugar que responde *quem* de vocês decidiu, quando e — em uma
rejeição — por quê. O que o aprovador vê ali não é a visão do operador: apenas jobs cujo pool congelado o
inclui, sem os CPFs do pool e sem Tentar novamente, Cancelar ou Baixar. Aprovar e rejeitar continuam
sendo feitos na linha.

:::warning Sem detecção de duplicatas
A comparação com o arquivo anterior do mesmo pagador foi removida em favor de uma fila que se lê de
relance, então **hoje nada no produto sinaliza um arquivo enviado em duplicidade**. O intervalo de datas de
pagamento também saiu da linha, mas ele era uma redundância sobre uma verificação automática — o
pipeline continua recusando uma remessa cujas datas de pagamento já passaram, em todo perfil que mantém
a verificação da data de pagamento ligada. Em um perfil que a desliga, a página por job — e não a
linha — avisa isso antes de alguém aprovar.
:::

### Selecionando os arquivos

Cada linha em **Aguardando você** tem uma caixa de seleção, e uma barra acima da lista totaliza o que você
marcou. A caixa **Selecionar todos** tem três estados — nenhum, alguns, todos. As outras duas abas não
têm caixa nem barra.

A barra mostra dois números: **Total selecionado** é o valor em dinheiro; **Pagamentos selecionados** é a
quantidade de pagamentos desses arquivos, com eventuais exclusões contadas à parte — *(+3 exclusão)* — e
nunca compensadas. Um zero a mais aparece no valor; um arquivo enviado duas vezes ou cortado pela metade
aparece na contagem.

A marcação se mantém ao expandir e recolher uma linha, e é removida de qualquer arquivo que saia da lista
enquanto você a vê — aprovado até o quórum por um colega, rejeitado ou expirado. Como a fila se recarrega
sozinha, isso pode acontecer sem que você toque no teclado, então isso é **avisado, e não feito em
silêncio**: uma nota que pode ser fechada, acima da lista, cita os arquivos que saíram, os mais recentes
primeiro, e em linhas gerais o que aconteceu com cada um — liberado para assinatura, interrompido antes
de ser assinado ou simplesmente não aguarda mais a sua aprovação. Um status sozinho não distingue um veto
de um prazo vencido, e a nota não finge distinguir; a página do job tem a resposta exata, e você chega a
ela pelo chip de contagem da linha — então abra um arquivo sobre o qual tenha dúvida **enquanto ele ainda
estiver na sua lista**. Depois de dez entradas, as mais antigas são descartadas.

**Arquivos sem total geral ficam fora da soma** e são informados ao lado dela como uma contagem — *2
arquivos não têm total e não estão neste valor* —, em vez de contados como zero. Se nenhum arquivo
marcado tiver total, o número é um travessão, nunca `R$ 0,00`; uma remessa só com exclusões ainda mostra
`R$ 0,00`.

### Aprovando um lote

**Aprovar N selecionados** age sobre as linhas marcadas e nada mais. Não existe um "aprovar todos"
separado — para isso, marque a caixa do cabeçalho e clique neste botão.

Antes, ele pede confirmação em um diálogo que repete a contagem, o total, o maior arquivo do lote e —
quando houver — **quantos dos arquivos são aprovados por assinatura**, e não por clique. Depois disso, não
há como desfazer.

Uma seleção pode misturar os dois tipos livremente. Se algum arquivo nela for aprovado por assinatura, a
confirmação também pergunta **onde está o seu certificado** — em uma implantação com
[CloudHub](#assinando-com-um-certificado-em-nuvem), ela oferece **Certificado neste navegador** e
**Certificado em nuvem** como os dois botões de confirmação e, em uma sem licença do Web PKI, a nuvem é a
única opção. Escolhendo o navegador, a próxima coisa que você vê é o seletor de certificados, **uma única
vez para o lote inteiro**: escolha o certificado emitido para você e clique em **Continuar**. Escolhendo
a nuvem, veja [Aprovando um lote com um certificado em nuvem](#aprovando-um-lote-com-um-certificado-em-nuvem)
abaixo.

Assim como em um único arquivo, somente os certificados emitidos para o seu CPF são listados — o CPF que
os pools congelados dos arquivos registram para você —, e os demais são apenas contados, não oferecidos.
Normalmente é um único CPF. Se o pool de aprovadores foi editado entre a retenção de alguns dos arquivos,
eles podem ter congelado CPFs **diferentes** para você: nesse caso, um certificado emitido para qualquer
um deles é listado, o diálogo avisa isso, e cada arquivo continua sendo conferido com o CPF que
registrou — um arquivo com o qual o certificado não confere aparece como recusado no relatório. O código
do segundo fator, quando exigido, é pedido depois disso, e somente se o lote também tiver arquivos
aprovados por clique; nos assinados, a própria assinatura é a prova de presença.

Em seguida, as aprovações rodam uma após a outra, e **há uma tentativa para cada arquivo selecionado**,
independentemente do resultado dos anteriores — *Aprovando 3 de 12…* durante o processo. Um arquivo
aprovado por clique é registrado exatamente como seria com um clique isolado. Um arquivo aprovado por
assinatura passa pelas mesmas verificações do botão **Assinar e aprovar** da linha, e então o seu
navegador o assina; o pedido de PIN, se o seu token exigir um, aparece para cada um desses arquivos, um de
cada vez. Se você cancelar o pedido de PIN em um arquivo, os demais arquivos aprovados por assinatura
ficam sem assinatura e são listados no relatório, em vez de o PIN ser pedido de novo um a um; os arquivos
aprovados por clique continuam sendo aprovados.

O relatório tem duas partes: um resumo (*9 de 12 aprovados; 6 seguiram para assinatura*) e **uma lista
com cada arquivo que não foi aprovado e o motivo.**

Conte com algumas falhas. Cada aprovação é uma chamada independente, e um colega pode ter agido enquanto
você lia — então *já decidido*, *não está mais aguardando aprovação — está Canceled* (é assim que a
rejeição de um colega aparece aqui) e *você não está no pool de aprovadores deste arquivo* são resultados
comuns. Em um arquivo aprovado por assinatura, as recusas do certificado e um navegador que não conseguiu
assinar são informados com as mesmas mensagens que o botão da linha usaria, e um colega que assinou o
mesmo arquivo enquanto você o assinava gera um *conflito* — recusado sem que nada seja registrado.

Os arquivos aprovados são desmarcados automaticamente; **os que falharam continuam marcados**, de modo que
clicar no botão de novo tenta exatamente esses. Quando todas as falhas do relatório são conflitos, a
mensagem também oferece **Assinar novamente** para esses arquivos — a assinatura do colega agora faz parte
do arquivo, e assiná-lo como ele está agora é tudo o que é preciso. Se a fila foi atualizada e esses
arquivos não estão mais nela — a assinatura do colega atingiu o quórum —, o botão informa isso.

#### Aprovando um lote com um certificado em nuvem

:::tip Novo na 2.14.0 — um único login no provedor para um lote inteiro
Quando o `CloudHub:ApiKey` está definido, **Aprovar N selecionados** oferece a nuvem como alternativa ao
navegador, de modo que um host sem licença do Web PKI consegue aprovar em lote arquivos que exigem
assinatura.
:::

Escolhendo a nuvem, você se autentica no seu provedor **uma única vez para o lote inteiro**. O diálogo que
se abre lista os provedores que têm um certificado para o seu CPF, exatamente como o da linha; escolha o
seu, e o navegador é redirecionado para ele. **Nada é aprovado antes de você voltar** — nem os arquivos
assinados nem os aprovados por clique. Quando o provedor o traz de volta ao portal, os arquivos que
estavam no lote são marcados de novo, o código do segundo fator é pedido se o lote tiver arquivos
aprovados por clique e o fator estiver ligado, e então o lote inteiro roda sozinho, com o mesmo relatório
por arquivo de um lote no navegador. Cada arquivo assinado é conferido com o CPF que registrou, e a
decisão registra o provedor pelo qual você assinou.

Três pontos são específicos da nuvem:

- **Os arquivos assinados precisam registrar o mesmo CPF para você.** Uma sessão na nuvem é aberta para um
  único CPF, então, em um lote cujos arquivos assinados congelaram CPFs diferentes para você, o botão de
  nuvem é substituído por uma frase informando quantos CPFs há; assine o lote no navegador ou desmarque
  arquivos até que os assinados coincidam. Normalmente isso nunca acontece.
- **O lote vale por quinze minutos.** Se você voltar do provedor depois disso, nada no lote é aprovado; os
  arquivos são marcados de novo, e aprová-los exige outro login no provedor. Fechar o pedido de código na
  volta também não aprova nada.
- **Uma falha do provedor no meio do lote interrompe as chamadas à nuvem.** Se o CloudHub ou o seu
  provedor falhar em um arquivo — a sessão expirou, o provedor está fora do ar —, os demais arquivos
  assinados aparecem no relatório como não assinados, em vez de cada um tentar e falhar, e os arquivos
  aprovados por clique continuam sendo aprovados. Assiná-los de novo exige outro login no provedor, assim
  como o **Assinar novamente** do relatório depois de um conflito.

Arquivos que saíram da sua fila enquanto você estava no provedor — pela decisão de um colega ou por uma
espera expirada — não são processados, e o relatório informa quantos.

**Em uma implantação sem licença do Web PKI e sem CloudHub**, um lote com arquivos aprovados por
assinatura é recusado na confirmação, antes de qualquer processamento, informando quantos são; os
arquivos aprovados por clique no mesmo lote também não são processados. Isso acontece com um perfil cujo
conjunto de assinantes foi escolhido quando um dos dois existia, em um host que depois o perdeu.

:::info Não existe rejeição em lote
Nem aqui nem em nenhuma outra tela. Rejeitar é um julgamento sobre o conteúdo de um arquivo e destrói o
job de forma irreversível; N rejeições em um clique seriam um ato diferente, sem um objeto que se possa
revisar.
:::

### Aprovando ou rejeitando um arquivo

**Aprovar** é um clique na linha. **Rejeitar** também fica na linha, mas abre um diálogo modal com o
aviso de irreversibilidade e um campo de motivo opcional, e é o **Sim, rejeitar** desse diálogo que
executa a ação — o botão da linha apenas pergunta. Uma aprovação libera um arquivo cujo conteúdo o
pipeline ainda vai conferir; uma rejeição destrói o job de forma irreversível, e, numa lista de linhas
quase idênticas, um clique no lugar errado cancelaria a folha de pagamento errada.

Em um arquivo cujos aprovadores assinam, o botão diz **Assinar e aprovar** e abre o seletor de
certificados em um modal do mesmo tipo, em vez de registrar um clique —
[Aprovando por assinatura](#aprovando-por-assinatura) descreve o processo. Rejeitar nessa linha funciona
exatamente como em qualquer outra.

**Quem recebe** expande a linha e mostra a tabela de pagamentos, com os identificadores completos.

### Exportando a lista

Toda aba tem um botão **Exportar para Excel**, no mesmo lugar nas três, que fica desabilitado, e não
oculto, quando a aba está vazia. Ele baixa a aba atual como uma pasta de trabalho `.xlsx`: uma linha por
**arquivo** de pagamento, nunca uma por beneficiário.

Ele exporta **a aba inteira**, e não as linhas marcadas — as marcações servem para
[aprovar um lote](#aprovando-um-lote) e só existem em *Aguardando você*.

| Aba | Para que serve a exportação |
|-----|-----------------------------|
| **Aguardando você** | Planejar as aprovações de uma manhã antes de começar a clicar |
| **Aguardando outros** | Cobrar os colegas que estão segurando arquivos que você já decidiu |
| **Aprovados** | Responder "o que eu aprovei no mês passado" sem perguntar a um operador |

Acima da tabela, a pasta de trabalho informa quem a gerou, quando, a partir de qual lista e em qual fuso
horário estão os timestamps. **Na exportação de Aprovados, ela também informa os seus dois limites** — o
período retroativo que cobre e, quando o limite de 200 linhas é atingido, que a lista foi cortada. A
lista de decididos é uma janela, nunca um histórico completo, e uma lista truncada que circula como
completa é o que leva alguém a concluir que um arquivo que aprovou nunca foi enviado.

Notas práticas:

- **Valores e contagens são números de verdade**, então é possível somar, filtrar e montar tabelas
  dinâmicas. Um arquivo sem total CNAB240 deixa essas células **vazias**, e não com `0`.
- **O CPF/CNPJ do pagador é texto**, com pontuação, então os zeros à esquerda são preservados. Datas são
  células de data de verdade.
- **O conteúdo está no seu idioma de exibição; o nome do arquivo, não.** Ele é um slug sem acentos com uma
  data ISO — `approvals-needs-you-2026-08-12.xlsx`.
- **Nada muda quando você exporta.** Nenhum job muda de estado e nenhuma decisão é registrada. O serviço
  registra no log uma linha informando que você exportou.
- **Nenhuma linha de pagamento vai para a pasta de trabalho.** Nenhum nome de beneficiário,
  identificação fiscal, agência ou conta; o único documento de identificação na planilha é o do pagador.

### O link é uma senha

Não há conta nem senha por trás do portal. **Quem tiver o link de um aprovador é esse aprovador**, até
onde o produto consegue saber.

- **Envie cada link em particular, para uma única pessoa.** Um link repassado é uma aprovação delegada.
- **Para revogar o acesso de uma pessoa**, remova-a do pool de todos os perfis com **Editar aprovação**. O
  link dela deixa de funcionar **imediatamente** — já na próxima requisição, sem reinicialização e sem
  esperar um intervalo de polling —, e ela não é congelada em nenhum job novo. Jobs já retidos com ela no
  pool mantêm a entrada dela — a regra congelada não muda. Os links são derivados do endereço, nunca
  emitidos, então alguém que for acrescentado de volta depois recebe o mesmo link que já tinha.
- **Para revogar o acesso de todos**, altere o `ApproverPortal:LinkSecret`. Todos os links deixam de
  funcionar de uma vez.

:::warning Revogar um link não encerra uma sessão já aberta com ele
Ao abrir um link, ele é trocado por uma sessão de navegador, e essa sessão é uma credencial separada: ela
dura `ApproverPortal:SessionLifetime` (30 dias por padrão) com expiração **deslizante**, então a sessão de
um aprovador que continua usando o portal nunca expira. Nem remover alguém de um pool nem alterar o
`ApproverPortal:LinkSecret` encerra essa sessão — essas ações revogam links, não cookies. O que uma
sessão assim ainda pode decidir continua limitado pelo pool congelado de cada job, então ela só alcança
jobs cuja regra já incluía aquela pessoa. Para encerrar sessões antes, reduza o
`ApproverPortal:SessionLifetime` ou faça a rotação do key ring de Data Protection — o que também
desconecta os operadores. O pool de um perfil desativado continua valendo: desativar um perfil impede
novos trabalhos, mas não retira a autoridade de ninguém.
:::

Decisões tomadas pelo portal registram `LinkDerivedEmail` em vez de `SelfDeclaredEmail`. Isso é mais
forte no aspecto que mais importa na prática — a pessoa que decide **não teria como escolher outra
pessoa**, porque o portal nunca oferece essa opção —, mas ainda não é autenticação.

## Entrando com o Microsoft Entra ID

Quando a implantação habilita o [login pelo Entra](installation.md#login-pelo-microsoft-entra-id-opcional)
opcional, um aprovador com a **app role Approver** acessa o mesmo portal entrando com a conta Microsoft —
sem precisar de link.

- **A role abre a porta; o pool continua delimitando os jobs.** Quais arquivos de pagamento a pessoa vê e
  sobre quais pode decidir continua sendo definido pelo pool congelado, comparado com o **e-mail informado
  pelo diretório**. Um Approver do Entra cujo endereço não está em nenhum pool vê um portal vazio; uma
  conta cujo token não traz a claim de e-mail é recusada de imediato.
- **As decisões registram `EntraIdEmail`** — o primeiro método de identificação que é *autenticação*: o
  diretório verificou quem estava presente, ao passo que um link apenas reduz o leque de pessoas que
  poderiam ter sido personificadas. Quando uma pessoa tem tanto uma sessão de link quanto uma sessão do
  Entra, é registrado o método mais forte.
- **Os links continuam valendo, deliberadamente.** Os pools aceitam quaisquer e-mails, e o gerente
  financeiro de um cliente não precisa ter conta no tenant da implantação.
- **A página por job também os reconhece.** Um Approver autenticado pelo Entra que abre
  `/approve/{jobId}` é identificado automaticamente, em vez de ter de escolher o endereço, e vê os
  identificadores dos beneficiários completos quando o pool congelado do job inclui o seu e-mail. Um login
  **só com a role Administrator** não recebe nada disso — a página o trata como anônimo, porque
  reconhecê-lo ali equivaleria a um operador aprovando em nome de outra pessoa.

## Provando que é você

O `ApproverSecondFactor:Enabled` coloca um aplicativo autenticador RFC 6238 entre o aprovador e a
decisão. **Vem desligado por padrão**, então nada muda em uma implantação existente até alguém
habilitá-lo. Vale para o host inteiro, e não por perfil, deliberadamente: uma regra por perfil seria
congelada no job no momento da retenção, e a autenticação não pode fazer parte desse snapshot — do
contrário, editar a configuração poderia servir para burlar a autorização.

**Cada aprovador vincula um autenticador, uma única vez, pelo portal**: um QR code, um segredo para
digitação manual e um código atual, confirmado antes de qualquer coisa ser armazenada. Depois disso, a
primeira decisão feita em um navegador pede os seis dígitos atuais. Digitá-los abre uma **janela de
verificação** (`ApproverSecondFactor:VerificationWindow`, vinte minutos por padrão) durante a qual nada é
pedido de novo naquele navegador, por mais arquivos que sejam liberados.

A janela é **contada de forma absoluta a partir do momento em que o código foi digitado, e pertence à
sessão do navegador, e não à pessoa** — comprovar o fator em um notebook em casa não vale para a máquina
deixada autenticada no escritório, que é justamente a sessão desacompanhada que o controle existe para
proteger. Zero é um valor válido e significa "pedir a cada decisão".

Outros comportamentos que convém conhecer:

- **Um código é de uso único.** Cinco códigos errados seguidos bloqueiam a inscrição daquele aprovador por
  cinco minutos. Os dois contadores ficam na linha da inscrição, então uma reinicialização não zera
  nenhum deles.
- **Uma aprovação assinada nunca pede código.** Em um arquivo cujos aprovadores assinam, usar a chave
  privada do seu token (ou no seu provedor em nuvem, depois da autenticação dele) é a prova de presença,
  e o certificado gravado na linha é o registro dessa prova. Rejeitar o mesmo arquivo não envolve
  assinatura e continua pedindo o código.
- **Os operadores têm uma lista `Segundo fator dos aprovadores`** na
  [página Sistema](dashboard.md#system--sistema) — uma linha por aprovador configurado, inscrito ou não,
  com a data — e um botão **Redefinir**. Esse é o caminho para quem perdeu o celular, e a ação é
  registrada em nome do operador como um evento de auditoria próprio.
- **Os seeds do TOTP são criptografados em repouso** com uma chave derivada do
  `ApproverSecondFactor:SeedSecret`, que é obrigatório. Os seeds são aleatórios para cada aprovador, então
  quem tem o primeiro fator não consegue gerar o segundo. **Perder ou rotacionar esse segredo obriga todos
  os aprovadores a se inscrever de novo.**
- **Toda linha de decisão registra se um fator foi verificado**, e quando.
- **A janela vale entre instâncias.** Ela fica no banco operacional, indexada por um identificador que vai
  dentro do cookie, de modo que uma janela aberta em uma instância é respeitada por outra sem nenhuma
  configuração adicional.

:::danger Mudança incompatível, se habilitada: o fator desativa o `POST /api/approvals/{id}`
Essa rota recusa **todas** as chamadas enquanto a configuração estiver ligada, com `403` e
`approval.second-factor-required`, e não há nada que um chamador possa enviar para contornar isso —
nenhum header, nenhuma chave, nenhum campo no corpo —, porque o que falta é uma presença comprovada, e só
uma sessão de navegador pode carregar isso.

**Qualquer aprovação feita por um ERP, um agendador ou um script para de funcionar no dia em que a
configuração for ligada**, e o operador que a liga geralmente não é a pessoa cuja integração deixa de
funcionar. Trate isso como uma mudança coordenada, e não como um simples ajuste de configuração.

Deliberadamente, **não existe um endpoint de aprovação autenticado para o qual migrar**: uma rota de
aprovação protegida pela chave de API seria *mais fraca* que a página anônima, já que essa chave fica na
configuração do ERP, no pipeline de deploy e em um arquivo de configuração de produção — então "um
aprovador decidiu" significaria "algo que tem a credencial de operador decidiu". O
`GET /api/jobs/{id}/approvals` não é afetado, então um sistema que
[observa o estado de aprovação](#lendo-o-estado-a-partir-de-outro-sistema) continua funcionando. Apenas o
ato de decidir passa para o portal.
:::

**A página anônima por job muda conforme o leitor, e não conforme a rota.** Com o fator ligado, o
`/approve/{jobId}` aberto por alguém que o host não consegue identificar é exibido **somente leitura**:
todos os números, todas as linhas de pagamento e exatamente o mesmo mascaramento de antes — isso não
reduz em nada o que um link repassado expõe, e não deve ser entendido como uma melhoria nesse sentido —,
com o painel de decisão substituído por um caminho para o portal (**Ir para o portal de aprovação**) e
sem o aviso de autodeclaração, porque não há mais decisão autodeclarada a ser avisada. A mesma URL, aberta
por um leitor que tenha um link do portal ou uma sessão do Entra, se comporta exatamente como o portal:
os mesmos controles, o mesmo pedido de código e a *mesma* janela, de modo que verificar no portal e
depois seguir o link de um e-mail da semana passada não pede o código duas vezes.

O banner de boot segue a mesma regra. O aviso emitido para todo perfil com aprovação configurada — "as
decisões nesta build são autodeclaradas" — é falso quando o fator está ligado; por isso, com a
configuração habilitada, ele passa a ser uma linha informativa que descreve a situação real, inclusive que
a rota REST agora recusa todas as chamadas.

:::warning O segundo fator sozinho não impede que um operador aja como aprovador
O TOTP é simétrico, e um operador pode ler todos os links de aprovador e redefinir todas as inscrições;
então, com uma regra por clique, um operador ainda pode se passar por qualquer aprovador. O que fecha essa
brecha é material de chave que só o aprovador possui: um
[conjunto de assinantes em que os aprovadores assinam](#o-conjunto-de-assinantes), em que cada aprovação
é uma assinatura feita com o próprio certificado ICP-Brasil do aprovador, cujo CPF precisa conferir com o
pool congelado, e o certificado fica registrado na decisão. Não descreva este controle como se ele,
sozinho, tivesse fechado essa brecha.
:::

Todas as chaves, os seus limites e as três recusas de boot estão em
[Configuração](configuration.md#approversecondfactor).

## Aprovando por assinatura

Em um perfil cujo [conjunto de assinantes](#o-conjunto-de-assinantes) inclui os aprovadores, o aprovador
não clica. Ele **coassina o arquivo de pagamento** com o próprio certificado ICP-Brasil — pelo Lacuna Web
PKI no navegador ou [pelo Lacuna CloudHub](#assinando-com-um-certificado-em-nuvem), no caso de um
certificado em nuvem —, e essa assinatura *é* a aprovação dele: o arquivo que o banco recebe a carrega, ao
lado da assinatura da própria empresa quando o conjunto assim determina. O CPF do certificado precisa ser
o CPF registrado para aquele aprovador no pool — o do titular, em um certificado de pessoa física; o do
responsável, no de uma empresa —, e a sessão que ele tem (um link do portal ou um login do Microsoft
Entra) continua indicando quem está decidindo. O certificado comprova; ele nunca escolhe o aprovador.

**Pelo portal**, o botão da linha diz **Assinar e aprovar** e abre um modal: ele resume o que está para
acontecer, lista os certificados do seu navegador pelo Lacuna Web PKI — com as instruções de instalação
se a extensão estiver ausente, desatualizada ou não for compatível — e o botão passa a agir quando você
escolhe um. **Somente os certificados emitidos para o seu CPF são listados** — o CPF registrado para
você no pool congelado naquele arquivo, que é o CPF com o qual o servidor vai conferir o certificado.
Qualquer outro certificado do seu navegador é contado em uma linha abaixo da lista, que identifica o seu
CPF pelos dígitos verificadores, e não é oferecido: escolhê-lo só poderia resultar em recusa. Se o seu
navegador tem certificados, mas nenhum com aquele CPF, o modal avisa; a solução é usar o token com o seu
próprio certificado. Esse filtro é só uma conveniência: as verificações abaixo são feitas
independentemente do que a lista mostrou. O modal não pode ser fechado enquanto uma assinatura está em
andamento; o botão **Cancelar** é a saída, e fechar o pedido de PIN do token também cancela em silêncio,
sem registrar nada.

**Pela página por job**, o mesmo modal abre para um leitor autenticado pelo próprio link ou pelo
Microsoft Entra. Um leitor que ninguém identificou recebe a página **somente leitura** — todos os números
e todas as linhas de pagamento com o mesmo mascaramento, e os controles de decisão substituídos por um
caminho para o portal —, exatamente como acontece com o segundo fator, mas decidido arquivo a arquivo,
pela regra congelada em cada um, e não para a implantação inteira. Um arquivo aprovado por clique, na
mesma implantação, continua se comportando como sempre.

A ordem importa, e foi pensada para que **um certificado errado seja recusado antes de o token pedir o
PIN**:

1. O certificado é validado por completo — cadeia, período de validade e revogação — pelo PKI SDK, com a
   mesma base de confiança exigida da chave do perfil. Um certificado inválido é recusado com o motivo
   informado pelo SDK.
2. Um certificado válido sem nenhum CPF é recusado por esse motivo — uma resposta diferente da de
   divergência, para que quem tem o *tipo* errado de certificado seja informado disso, e não de que o seu
   CPF está errado.
3. Um CPF que não é o do aprovador da sessão é recusado. O certificado de um colega, mesmo válido e no
   pool, é recusado na sua sessão.
4. Só então o hash a ser assinado é gerado — sobre o arquivo no estado atual, incluindo qualquer
   assinatura de colega já presente —, e o navegador pede ao token que o assine.

Depois da assinatura, o envelope final é validado, conferido com os bytes aos quais a aprovação está
vinculada e gravado ao lado da cópia preparada, e a aprovação é registrada — o envelope e a linha como uma
única unidade. **Se um colega assinou o mesmo arquivo enquanto você o assinava**, a sua assinatura foi
feita sobre um envelope que já não é o atual: ela é recusada, nada é registrado, e a mensagem oferece
**Assinar novamente**, que assina o arquivo como ele está agora. Qualquer outra recusa é exibida com a sua
própria mensagem, no mesmo lugar em que a página mostra o resultado de um clique, e você a resolve
clicando de novo no botão da linha e fazendo outra escolha. Um arquivo cujos aprovadores assinam pode
fazer parte de um lote — veja [Aprovando um lote](#aprovando-um-lote).

**As seis recusas e o que fazer em cada uma.** Cada uma aparece onde a página mostra o resultado de um
clique — o alerta no portal, o painel na página por job, a lista por arquivo de um lote —, e só a
primeira também é uma resposta REST: a rota anônima não carrega certificado, então as outras cinco não
podem ocorrer ali:

| Recusa | O que aconteceu | O que fazer |
|---|---|---|
| `approval.signature-required` | Um clique chegou a um job cujos aprovadores assinam — pela rota anônima ou por um cliente feito para aprovar por clique. | Aprove pelo portal ou pela página por job, estando autenticado. Uma rejeição continua sendo um clique. |
| `approval.certificate-invalid` | O certificado não passou na verificação completa: está expirado, não tem cadeia até uma raiz confiável, foi revogado ou o seu status de revogação não pôde ser determinado. O motivo do SDK é exibido. | Escolha um certificado válido ou renove o seu. Se todos os aprovadores forem recusados ao mesmo tempo, o problema está na implantação, e não em você — veja [Diagnóstico de problemas](#diagnóstico-de-problemas). |
| `approval.certificate-without-cpf` | Um certificado válido que não traz CPF — nem um e-CPF ICP-Brasil, nem um e-CNPJ que indique um responsável. | Escolha o certificado emitido para você como pessoa física, ou o da sua empresa em que você consta como responsável. |
| `approval.certificate-cpf-mismatch` | O CPF do certificado não é o CPF registrado para você no pool deste arquivo. O certificado de um colega é recusado na sua sessão mesmo que ele esteja no pool. É raro pelo seletor, que lista apenas certificados com o seu CPF; ainda pode acontecer quando a leitura do navegador e a do servidor divergem, ou em um lote cujos arquivos congelaram CPFs diferentes para você. | Escolha o seu próprio certificado. Se o CPF no pool estiver errado, o operador corrige o perfil; um job já retido mantém o pool que congelou e precisa ser reexecutado. |
| `approval.signature-invalid` | A assinatura que o seu navegador produziu não resultou em um envelope que o SDK valide, ou envolve bytes diferentes dos do arquivo que lhe foi mostrado. Nada foi gravado nem registrado. | Clique no botão de novo. Se o erro se repetir, o problema está no token ou na extensão — tente outro navegador e avise o operador. |
| `approval.signature-conflict` | Um colega assinou o mesmo arquivo enquanto você o assinava, então a sua assinatura foi feita sobre um envelope que não existe mais. Nada foi gravado nem registrado. | **Assinar novamente**, oferecido na hora: assina o arquivo como ele está agora, incluindo a assinatura do colega. |

Há mais dois resultados, que vêm do navegador, e não do servidor, e que não são recusas: fechar o pedido
de PIN do token **abandona** a tentativa em silêncio, e uma falha informada pelo Web PKI — uma licença que
não é deste domínio, um módulo que a extensão não conseguiu carregar — é exibida com a mensagem do próprio
Web PKI. Os dois são contados na mesma métrica das recusas ([Métricas](#métricas)).

A mesma recusa de conflito vale para um arquivo que um colega está assinando *neste momento*: o envelope
dele fica reservado enquanto a aprovação dele é registrada, e aprovar de novo um instante depois funciona.
Se a nova aprovação continuar sendo recusada em um arquivo, consulte a página do job. No caso raro em que
o produto não conseguiu desfazer uma assinatura cuja aprovação não foi registrada — o compartilhamento
ficou indisponível no meio da gravação, ou uma instância caiu enquanto detinha o envelope —, o histórico
do job informa isso em uma linha que termina em *cancel the job to recover*. Cancele o job; o arquivo de
entrada permanece na pasta de entrada, como o de qualquer job cancelado, e **Tentar novamente** ou uma
nova varredura recomeça o processo com as aprovações do zero.

Uma aprovação assinada **satisfaz o segundo fator** quando ele é exigido: usar uma chave privada em um
token comprova a presença, e as colunas de certificado da linha são o registro disso. A rejeição no mesmo
job não muda — sem assinatura, um clique e um modal, e o código continua sendo pedido quando o fator está
ligado. O veto continua, de propósito, mais simples que a aprovação.

O que é registrado: as colunas de certificado da linha ([O que cada aprovação registra](#o-que-cada-aprovação-registra)),
uma entrada na linha do tempo — *Approved by Maria Silva with certificate Maria Silva, CPF
\*\*\*.\*\*\*.\*\*\*-09.* — e o evento operacional, cada um identificando o certificado, com o CPF mascarado
exceto pelos dígitos verificadores. Os bytes da assinatura não ficam na linha; o artefato em `output/` é
a prova.

Ao escolher um conjunto de assinantes desse tipo na página do perfil, você precisa confirmar depois de um
aviso de uma linha: o arquivo entregue vai carregar as assinaturas dos próprios aprovadores, e cabe a você
confirmar com o destinatário, antes de o primeiro arquivo sair, se ele aceita um arquivo assinado por
várias pessoas. O aviso aparece uma única vez, ao salvar a mudança para um conjunto desse tipo, e o
registro de auditoria indica o campo alterado.

:::warning Dois limites a conhecer antes de escolher um conjunto de assinantes desse tipo
**Todo aprovador do pool precisa de um certificado**, e o quórum exige pessoas suficientes com
certificado: um pool de três com quórum de dois em que só um membro tem certificado deixa todo job retido
para sempre, e o produto não tem como saber quem tem certificado até que a pessoa o apresente — mantenha
o prazo de espera definido. Além disso, **o host precisa acessar os repositórios da ICP-Brasil**, porque a
verificação do certificado não é de melhor esforço (best-effort); uma implantação isolada da rede
(air-gapped) não pode usar esses conjuntos de assinantes.
:::

### Assinando com um certificado em nuvem

:::tip Novo na 2.7.0 — certificados em nuvem pelo Lacuna CloudHub
Antes da 2.7.0, um aprovador só conseguia assinar com um certificado acessível pelo navegador.
:::

Um aprovador cujo certificado foi emitido no HSM de um provedor — um *certificado em nuvem* — não tem
nada que o navegador consiga acessar, então o modal acima não consegue listá-lo. Quando a implantação tem
o [`CloudHub`](configuration.md#cloudhub--lacuna-cloudhub-para-certificados-em-nuvem) configurado, o mesmo
modal abre com uma **primeira etapa**: **Certificado neste navegador** ou **Certificado em nuvem**. A
escolha é feita a cada assinatura, por você, no momento de assinar — ela não fica gravada em nenhum perfil
nem em nenhum membro do pool, porque a chave que você tem em mãos é um fato sobre você naquele dia. Em
uma implantação com CloudHub e sem licença do Web PKI, essa etapa é pulada e o modal vai direto para a
nuvem; em uma sem CloudHub, não há essa etapa, e o modal é o seletor descrito acima. Em qualquer caso, a
linha mantém um único botão.

Ao escolher a nuvem, o Lacuna CloudHub é consultado sobre quais provedores têm um certificado para **o
seu CPF, tal como congelado naquele arquivo** — o mesmo CPF usado como filtro no seletor, e pelo mesmo
motivo: você não digita CPF, não consegue iniciar uma sessão com o CPF de outra pessoa, e o certificado
retornado continua sendo conferido. Todos os provedores indicados pelo CloudHub são listados, e você
escolhe o seu; se nenhum tiver certificado para aquele CPF, o modal avisa, identificando o CPF pelos
dígitos verificadores, e a solução é usar um certificado neste navegador ou falar com o seu provedor. O
navegador é então redirecionado ao provedor, onde você se autentica — geralmente pelo celular —, e depois
volta à implantação em `/approvals/cloud/return`, uma rota autenticada que executa **toda a aprovação
assinada nessa única requisição**: a mesma sequência de verificações descrita acima, com o certificado
lido do CloudHub em vez do navegador. A única desvantagem da nuvem é que um certificado errado só é
descoberto depois do login no provedor, e não antes de um pedido de PIN; o filtro pelo CPF torna isso
raro, e, em nenhum dos casos, nada é assinado com um certificado recusado.

Você volta à página de onde saiu — o portal ou a página por job —, e ela informa o que aconteceu, **uma
única vez**, com as mesmas mensagens usadas para uma assinatura no navegador: registrado, ou uma das
recusas da tabela acima, com **Assinar novamente** oferecido em caso de conflito. Não há página de
resultado, e nada sobre o resultado aparece no endereço. Um retorno que não possa ser associado a uma
assinatura iniciada por você nos últimos quinze minutos — a sessão errada, um link aberto duas vezes, um
login que demorou demais, um início substituído a partir de outra aba — leva ao portal, que informa isso
em uma frase, sem nunca dizer o porquê, e não registra nada; recomece a partir da linha do arquivo. Uma
falha do lado do CloudHub — a chave recusada, o serviço inacessível, uma resposta que o produto não
consegue usar — é informada como falha do provedor, com a mensagem do próprio CloudHub, e nada é
registrado.

O registro difere em uma coluna: a linha da decisão indica o **serviço em nuvem** pelo qual o certificado
foi acessado, e a linha do tempo e o evento de auditoria dizem *Approved by Maria Silva with cloud
certificate (ProviderName) Maria Silva, CPF \*\*\*.\*\*\*.\*\*\*-09.* As colunas de certificado ao lado
têm o mesmo significado, qualquer que seja o meio que as produziu, e o arquivo assinado é verificado
exatamente contra os signatários registrados. Uma assinatura em nuvem satisfaz o segundo fator, assim como
uma assinatura no navegador. Uma rejeição nunca é assinada, por nenhum dos meios.

**Um lote é assinado na nuvem com um único login no provedor** — veja
[Aprovando um lote com um certificado em nuvem](#aprovando-um-lote-com-um-certificado-em-nuvem).

## A rejeição é um veto

**Uma rejeição interrompe o job, não importa o que diga a conta do quórum.** Um pool de três com quórum de
um ainda é interrompido quando uma pessoa rejeita, mesmo que as duas pessoas que não decidiram pudessem,
cada uma, liberá-lo sozinha.

Não é assim que uma votação funciona, e isso é deliberado. Uma rejeição não é um voto negado a ser
compensado pelos outros — é uma pessoa afirmando que o arquivo está errado, e um quórum não tem o poder de
passar por cima disso.

Por isso, um job vetado informa a sua contagem de aprovações com fidelidade — "2 de 2 aprovações —
**rejeitado**" não é uma contradição, é o que aconteceu —, mas nunca prossegue.

### O que acontece com o job

Ele passa a **`Canceled`**, e não a `Failed`:

- **O arquivo é devolvido para `output/`** como `<name>.reject<ext>` — `folha.rem` vira
  `folha.reject.rem` —, preservando exatamente os bytes que foram rejeitados. Veja
  [O arquivo rejeitado volta para `output/`](#o-arquivo-rejeitado-volta-para-output) abaixo.
- **O original é removido de `input/`**, assim que a cópia devolvida estiver em segurança em `output/`.
- **Não é possível fazer uma nova tentativa**, e o produto informa isso explicitamente: o
  `POST /api/jobs/{id}/retry` recusa com `409 { code: "job.rejected-not-retriable" }`, e o botão
  **Tentar novamente** não aparece na página do job. Um veto não é uma falha da qual se recupera. O
  financeiro corrige o arquivo e o envia de novo, que é o fluxo previsto.

O que distingue uma rejeição de um cancelamento pelo operador é a trilha de auditoria, e não o status: a
linha do tempo do job indica o aprovador que rejeitou e o motivo, e um evento operacional
`ApprovalRejected` é registrado.

### O arquivo rejeitado volta para `output/`

:::warning Mudou na 2.1.0 — um arquivo vetado vai para `output/`, e não para `error/`
Até a 2.0.x, uma rejeição movia a cópia preparada para `error/<jobid>/` e deixava o original em `input/`.
Um sistema que deposita remessas em uma pasta monitorada busca os resultados em um lugar só, e esse lugar
é `output/` — por isso, um arquivo vetado agora é devolvido ali, e o arquivo de entrada é removido.
:::

Um arquivo vetado é devolvido para `output/`, em vez de ficar em `error/` junto com as falhas técnicas,
com um nome que tem `.reject` antes da extensão original — a mesma posição que o `.signed` ocupa —, de
modo que um `.rem` continua sendo um `.rem` e um interpretador a jusante ainda o reconhece.

Duas coisas que convém saber antes de construir algo em cima disso:

- **O arquivo devolvido não é assinado.** Uma rejeição acontece na etapa de aprovação, antes da
  assinatura. O que chega a `output/` são os bytes originais do cliente, com o nome marcado. Qualquer
  integração que tratava `output/` como uma pasta só de assinaturas precisa verificar o nome. Em
  compensação, `error/` volta a guardar apenas falhas reais.
- **Quando o perfil criptografa, o arquivo devolvido também é criptografado**: `folha.reject.rem.enc`, um
  envelope BSENC v1 como qualquer outro artefato daquela pasta. Veja [Criptografia](encryption.md).

A entrada da linha do tempo informa o nome do arquivo (`Rejected file returned to output as folha.reject.rem; input
removed.`), um evento operacional `RejectedFileHandedBack` o registra, e a página do job mostra o nome —
que ela calcula e depois confere na pasta, de modo que nunca mostra um arquivo que não está lá.

**Se já existir um arquivo com esse nome**, a devolução é recusada, em vez de sobrescrever o arquivo
anterior de alguém. Isso não é um caso raro: um arquivo vetado é justamente o que o financeiro corrige e
reenvia com o mesmo nome, então uma segunda rejeição dele gera colisão. Nesse caso, o job se comporta
como antes desta funcionalidade — a cópia preparada vai para `error/<jobid>/` e **o arquivo de entrada
permanece em `input/`** —, o veto vale de qualquer forma, e o console e o log informam qual dos dois
aconteceu. Veja
[Diagnóstico de problemas](troubleshooting.md#um-arquivo-rejeitado-não-foi-devolvido-a-output).

**Se um veto foi um engano**, o arquivo não está perdido — está em `output/`. Pegue-o, descriptografe-o
se o perfil usar criptografia e envie-o de novo (por upload ou colocando-o de volta na pasta monitorada).
Uma nova varredura **não** o traz de volta, porque o arquivo de entrada foi removido; isso é deliberado,
já que um veto que qualquer botão sem relação pudesse desfazer não valeria muito.

### A condição de corrida e o que a cobre

| Onde o job está | O que o interrompe |
|-----------------|--------------------|
| Ainda retido em `AwaitingApproval` | a rejeição o cancela diretamente |
| Liberado para `Queued`, mas ainda não reivindicado | o mesmo cancelamento — a verificação de status dele também cobre `Queued` |
| Já reivindicado por um worker (`Processing`) | a verificação de veto que o próprio pipeline faz antes de assinar se recusa a assiná-lo |

No terceiro caso, o job termina como **`Failed`** com `approval.rejected`, e não como `Canceled`, já que
não existe transição válida de `Processing` para `Canceled`. Nos dois casos o arquivo fica sem
assinatura, que é o que importa.

Uma rejeição que chegue depois de a assinatura ter sido calculada não consegue desfazê-la. Só manter um
lock durante toda a deliberação de alguém fecharia essa brecha.

## O que é aprovado

**Bytes, não um id de job.**

A cópia preparada no momento da interpretação é o artefato canônico durante toda a janela de
aprovação. O arquivo de entrada nunca é relido **como o artefato a ser assinado**, e a interpretação nunca
roda uma segunda vez — de modo que um arquivo alterado em `input/` durante a espera não pode tomar o lugar
do que foi aprovado.

Imediatamente antes de assinar, o hash dos bytes da cópia preparada é recalculado e comparado com o hash registrado
na interpretação. Uma divergência faz o job falhar definitivamente com `approval.content-changed`: nunca
há uma reinterpretação silenciosa, nem o processo segue adiante. A verificação roda tanto no caminho de
assinatura local quanto no caminho de upload para o assinador remoto, e um envelope dos aprovadores que
envolva bytes diferentes dos da cópia preparada falha da mesma forma.

O arquivo de entrada *é* lido mais uma vez, mas somente depois que a assinatura existe e somente para
responder a uma pergunta diferente: este ainda é o arquivo que foi copiado para processamento e, portanto, pode ser
apagado? Veja [Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job).

**Se a cópia preparada desaparecer**, o job falha. Não há forma honesta de continuar — reconstruí-la a
partir de `input/` assinaria algo que ninguém aprovou. Faça uma nova tentativa do job; uma nova tentativa
é um novo job, e ele fica retido de novo.

**Se o serviço reiniciar no meio da espera**, nada acontece, e é essa a ideia. A recuperação na
inicialização deliberadamente ignora `AwaitingApproval`: um job retido não estava "em andamento no último
desligamento"; é um job esperando por uma pessoa. Tanto a linha quanto a cópia preparada são preservadas.

## Cancelando um job retido

`POST /api/jobs/{id}/cancel` ou o botão **Cancelar** na página do job — que pede confirmação antes, em um
diálogo que mostra o arquivo e explica o que o cancelamento faz com ele. Um job retido pode ser cancelado
justamente porque nada o está ocupando. A cópia preparada é movida para `error/` e o arquivo permanece em
`input/`; o observador respeita o cancelamento e não o reprocessará automaticamente, embora uma nova
varredura o faça, deliberadamente.

**Um cancelamento não é uma rejeição, e os arquivos terminam em lugares diferentes.** Um veto devolve o
arquivo para `output/` e remove o arquivo de entrada; um cancelamento deixa os dois onde uma recusa antes
da assinatura os deixaria. Isso porque um cancelamento geralmente serve para desfazer um engano, e manter
o arquivo de entrada no lugar é o que permite reexecutá-lo.

## Segurança

### O link de aprovação é uma capacidade

Ele dá o poder de liberar um arquivo de pagamento para assinatura — **e de barrá-lo** —, sem verificar
nada sobre quem o está usando.

- **Envie-o apenas para as pessoas do pool**, e apenas por um canal que você usaria para o próprio arquivo
  de pagamento.
- **Não o repasse e oriente os aprovadores a não repassá-lo.** Um único link repassado basta para que uma
  pessoa sozinha atinja um quórum de várias, porque basta ela conhecer dois endereços da lista.
- **Se você não puder aceitar isso, não coloque o serviço em uma rede acessível pelos navegadores dos
  aprovadores.** Nesse caso, divulgue os números de outra forma e use cancelar/reexecutar.

:::note Mudou na 2.9.0 — a página do job não fornece mais o link por job
O campo copiável `/approve/{jobId}` na página do job do operador foi removido, para todos os leitores. O
produto não envia e-mail; o aprovador chega a um arquivo retido pela própria fila no
[portal](#o-portal-do-aprovador), e a página do operador não fornece nada para repassar. A página anônima
em si não mudou, e um link que alguém já tenha continua abrindo-a.
:::

A rejeição é a metade menos grave dessa capacidade: quem tem o link também pode barrar um arquivo de
pagamento legítimo, e a solução — corrigir e reenviar — é um transtorno, e não uma perda. Ainda assim, é
uma negação de serviço não autenticada contra uma folha de pagamento específica.

Ids de job são GUIDs v4, então, na prática, não é possível adivinhar a URL, e a rota tem a sua própria
cota no limite de requisições (rate limiting): `RateLimiting:Approval`, por padrão dez requisições por
minuto por endereço.

As recusas são deliberadamente genéricas: um endereço válido que não está no pool e algo que nem é um
endereço retornam o mesmo `approval.unknown-approver`.

### O que cada aprovação registra

| Campo | Significado |
|-------|-------------|
| `ApproverEmail` | normalizado (sem espaços nas pontas, em minúsculas); único por job, garantido por um índice do banco de dados |
| `ApproverName`, `ApproverCpf` | copiados do **pool congelado**, nunca da requisição |
| `Decision` | `Approved` ou `Rejected` |
| `Reason` | texto livre digitado por quem decidiu, ou nulo; repetido na linha do tempo do job |
| `IdentificationMethod` | `SelfDeclaredEmail` na página anônima, `LinkDerivedEmail` por uma sessão de link do portal, `EntraIdEmail` por um login do Microsoft Entra |
| `ContentSha256` | os bytes a que esta decisão se refere |
| `DecidedAt` | UTC |
| `IpAddress` | o endereço remoto da conexão, ou nulo. **Atrás de um proxy reverso, é o endereço do proxy**, a menos que o [`Hosting:ForwardedHeaders`](configuration.md#hosting) esteja configurado |
| `UserAgent` | literal, truncado em 512 caracteres, ou nulo |
| `SecondFactorVerifiedAt` | quando a sessão de navegador que decidiu comprovou um segundo fator, ou nulo quando nenhum estava em vigor (e em toda aprovação assinada, que não precisa de um) |
| `CertificateSubject`, `CertificateIssuer`, `CertificateSerialNumber`, `CertificateThumbprintSha256`, `CertificateCpf`, `CertificateCnpj` | o certificado com que uma aprovação **assinada** foi feita: o subject e o issuer como o PKI SDK os formata, o número de série em hexadecimal maiúsculo, o thumbprint SHA-256, o CPF que consta no certificado — o do titular ou, no de uma empresa, o do responsável — e o CNPJ, quando é de uma empresa. Nulos em toda decisão por clique e em toda linha gravada antes de as assinaturas de aprovadores existirem. `ApproverName` e `ApproverCpf` continuam vindo do pool congelado: o pool diz quem tinha permissão para decidir; o certificado diz qual chave confirmou a decisão |
| `CloudService` | o serviço em nuvem pelo qual o certificado foi acessado — o nome que o Lacuna CloudHub dá ao provedor —, ou nulo para uma assinatura feita no navegador e para toda decisão por clique |

O `IdentificationMethod` existe para que, à medida que surgirem formas de identificação mais fortes, as
aprovações anteriores continuem mostrando claramente o que eram, na mesma tabela, em vez de serem
validadas retroativamente. Novos valores são acrescentados, nunca reaproveitados, e nenhuma linha jamais é
migrada para um valor novo.

Aprovações registradas pelo dashboard ou pelo portal não têm IP nem user agent: esses caminhos rodam
sobre o circuito Blazor, em que não há requisição HTTP de onde lê-los. A rota REST registra os dois.

### Dados pessoais

O pool guarda um nome, um e-mail e um CPF por aprovador, e cada linha de aprovação os copia. O CPF tem os
dígitos verificadores validados, é normalizado para onze dígitos, sem pontuação, e é usado em exatamente
uma decisão: em um perfil cujos aprovadores assinam, é com ele que o certificado do aprovador precisa
conferir. Em uma regra por clique, ele serve apenas para exibição e auditoria.

O `Cpf` está na lista de propriedades estruturadas sujeitas a mascaramento, então não chega a nenhum log
persistente. Os endereços dos aprovadores são mascarados (`m***@empresa.com.br`) na narração do console e
nos eventos operacionais, e o CPF de um certificado é mascarado, exceto pelos dígitos verificadores, nas
linhas do tempo e nos eventos — inclusive dentro do subject; os endereços completos ficam no snapshot
congelado e nas linhas de aprovação. Salvar um pool registra contagens no log de eventos — quantas pessoas
foram acrescentadas, removidas e alteradas —, nunca uma lista de nomes. Veja [Segurança](security.md).

### Retenção

As linhas de aprovação e a regra congelada **nunca são expurgadas**, nem quando o job chega a um status
terminal. Quem autorizou um pagamento, e sob qual regra, é exatamente o que uma auditoria pergunta depois.
Isso é o oposto deliberado do detalhe de linhas do CNAB240, que *é* expurgado no status terminal — veja
[Retenção](retention.md).

## REST

:::danger Esta rota é desativada quando o segundo fator está ligado
`ApproverSecondFactor:Enabled = true` faz o `POST /api/approvals/{id}` recusar **todas** as chamadas com
`403` e `approval.second-factor-required`, e nenhum header, chave ou campo no corpo contorna isso. Se um
ERP ou agendador envia aprovações por aqui, leia [Provando que é você](#provando-que-é-você) antes de
habilitar o fator. O `GET /api/jobs/{id}/approvals` não é afetado.
:::

Para decidir, há uma única rota anônima:

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

Para rejeitar, acrescente `decision` (e, opcionalmente, `reason`):

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

O `decision` aceita `approved` ou `rejected`, sem diferenciar maiúsculas de minúsculas. **Omiti-lo
significa `approved`** — um cliente escrito antes de a rejeição existir continua funcionando sem
alterações. Qualquer outro valor é recusado, e não interpretado: `"reject"` — plausível, errado, a uma
letra de distância — não pode ser tratado como nenhum dos dois.

Uma rejeição retorna **200**, e não um 4xx. É o que o chamador pediu, e a operação teve sucesso. O
`terminated` só é falso naquela condição de corrida em que um worker já tinha reivindicado o job.

Em um job cujo conjunto de assinantes congelado inclui os aprovadores, esta rota ainda consegue
**rejeitar**, mas não aprovar: uma aprovação ali é uma assinatura, e a rota não carrega certificado.

As recusas trazem um `code` estável:

| Código | Status | Significado |
|--------|--------|-------------|
| `job.not-found` | 404 | nenhum job com aquele id |
| `approval.not-pending` | 409 | o job não aceita decisão em seu status atual |
| `approval.unknown-approver` | 403 | o endereço não está no pool congelado do job (também retornado para um endereço malformado, deliberadamente) |
| `approval.already-decided` | 409 | este aprovador já decidiu; decisões são finais |
| `approval.unknown-decision` | 400 | `decision` não era nem `approved` nem `rejected` |
| `validation.reason-too-long` | 400 | `reason` excede 512 caracteres. Recusado em vez de truncado |
| `approval.job-incomplete` | 500 | o job está retido, mas falta a regra congelada ou o hash do conteúdo. A falta da regra significa que a linha foi modificada fora da aplicação; a falta do hash provavelmente significa que a verificação CNAB240 do perfil estava desligada quando o job ficou retido — um estado que a página do perfil e a etapa agora recusam, então trata-se de um job retido antes disso ([Diagnóstico de problemas](troubleshooting.md#um-aprovador-é-informado-de-que-o-registro-de-aprovação-está-incompleto)) |
| `approval.signature-required` | 403 | o conjunto de assinantes congelado do job é `Approvers` ou `ProfileKeyAndApprovers`, então a aprovação é uma coassinatura, e esta rota não carrega certificado ([Aprovando por assinatura](#aprovando-por-assinatura)). Decidido por job, a partir do snapshot; uma rejeição no mesmo job continua sendo registrada aqui |

### Lendo o estado a partir de outro sistema

Para *ler* o estado, há duas rotas autenticadas, para relatórios de conformidade, um dashboard externo ou
um monitor que acompanhe jobs retidos por mais tempo que um limite:

- O `GET /api/jobs/{id}` traz um resumo `approval` — o quórum congelado, o tamanho do pool, quantas
  pessoas aprovaram e rejeitaram, `vetoed`, `parkedSince` e o prazo de expiração, se a regra definiu um.
  É `null` em qualquer job que nunca ficou retido. Baseie a lógica em `vetoed`, e não em uma conta
  própria: o `quorumReached` pode ser `true` em um job que um veto já interrompeu.
- O `GET /api/jobs/{id}/approvals` retorna o pool congelado com a decisão de cada membro e a lista de
  decisões — e, em uma decisão registrada por assinatura, um objeto `certificate` com o subject, o
  issuer, o número de série, o thumbprint SHA-256, o CPF do certificado mascarado e o CNPJ completo, além
  do `cloudService` quando foi uma assinatura em nuvem; `null` em uma decisão por clique. Nas duas rotas, o
  CPF é mascarado, exceto pelos dígitos verificadores. Retorna `404` com `approval.not-required` em um job
  que nunca ficou retido — uma resposta diferente da de um job retido sobre o qual ninguém decidiu, que é
  `200` com uma lista vazia.

Todos os números vêm da regra congelada no job, nunca do perfil atual.

:::info Não existe endpoint REST de aprovação
Protegido pela chave de API, ele seria pior que a página anônima: a chave fica na configuração de um ERP,
em um pipeline de deploy e em um arquivo de configuração de produção, então ela viraria uma credencial
capaz de aprovar qualquer coisa para quem tivesse acesso a qualquer um deles. Anônimo, ele seria um laço
de aprovação em massa, programável, sobre todos os jobs retidos. Esta etapa existe para uma pessoa que lê
o detalhamento dos pagamentos, e não para uma integração.
:::

## Métricas

| Métrica | Tipo | Labels | Significado |
|---------|------|--------|-------------|
| `bulksigner_jobs_awaiting_approval` | gauge | — | jobs atualmente retidos; calculado a partir de uma varredura, então fica correto após uma reinicialização |
| `bulksigner_jobs_parked_for_approval_total` | counter | `profile` | jobs que ficaram retidos |
| `bulksigner_approvals_recorded_total` | counter | `profile` | decisões registradas, uma por pessoa por job — aprovações **e** rejeições |
| `bulksigner_approvals_rejected_total` | counter | `profile` | o subconjunto das rejeições. Deliberadamente separado de `bulksigner_jobs_canceled_total`, que conta o que um *operador* fez |
| `bulksigner_jobs_released_by_approval_total` | counter | `profile` | jobs retidos cujo quórum foi atingido |
| `bulksigner_approvals_expired_total` | counter | `profile` | jobs retidos cancelados porque o prazo de espera congelado se esgotou. A única série que conta a *ausência* de ação — é nela que se deve configurar alertas |
| `bulksigner_jobs_content_changed_total` | counter | `profile` | falhas na verificação do vínculo de conteúdo antes da assinatura. **Deve ficar sempre em zero** |
| `bulksigner_approver_signatures_total` | counter | `outcome`, `means` | tentativas de assinatura de aprovadores em jobs cujo conjunto de assinantes congelado inclui os aprovadores. `outcome`: `signed`, `cpf-mismatch`, `without-cpf`, `certificate-invalid`, `signature-invalid`, `conflict`, `abandoned` (o aprovador fechou o pedido de PIN ou o diálogo do Web PKI), `browser-failed` (o Web PKI informou uma falha que não foi um cancelamento), `provider-failed` (o Lacuna CloudHub falhou, trouxe o navegador de volta sem sessão ou se recusou a listar provedores). `means`: `browser` (Web PKI) ou `cloud` (CloudHub). Fica em zero até que o conjunto de assinantes de um perfil inclua os aprovadores |

Uma taxa de *expiração* crescente geralmente indica um problema na forma como você distribui o link de
aprovação — o produto não envia e-mail, então uma janela vencida costuma significar que o link nunca
chegou a ninguém.

No contador de assinaturas de aprovadores: uma taxa de divergência de CPF subindo enquanto a de
assinaturas bem-sucedidas se mantém estável indica uma pessoa apresentando o certificado errado;
`conflict` acima de zero indica dois aprovadores que costumam decidir o mesmo arquivo no mesmo minuto;
`browser-failed` subindo para vários aprovadores indica um problema de licença ou de módulo na
implantação, e não de uma pessoa; `provider-failed` subindo indica um problema na chave do CloudHub ou uma
indisponibilidade de provedor. O `means` responde à pergunta "as assinaturas na nuvem estão falhando
enquanto as do navegador funcionam?".

## Estatísticas

As esperas de aprovação ficam fora das estatísticas de tempo decorrido do pipeline, assim como a espera
em `AwaitingSigner`. Uma espera de aprovação é medida em horas de atenção de alguém, e incluí-la nas
médias de fila/assinatura/verificação distorceria todos os números com uma grandeza que o pipeline não
causou nem consegue melhorar.

Na prática: quando o job fica retido, a medição de tempo em andamento dele é descartada, e um job liberado
inicia uma nova, cuja espera na fila é contada a partir do momento em que ele voltou à fila. Veja
[Estatísticas de jobs](statistics.md).

## Diagnóstico de problemas

**Um job está retido e ninguém consegue aprová-lo.** Confira o pool na página do job: é o pool congelado
no momento da retenção, e não o atual do perfil. Se as pessoas listadas estiverem erradas, cancele o job,
corrija o pool com **Editar aprovação** na página do perfil e reexecute o arquivo.

**Um aprovador recebe "Esse endereço não está no grupo de aprovadores deste job".** O endereço dele não
está no pool congelado. Compare-o com o pool exibido na página do job — espaços no início ou no fim e
maiúsculas não fazem diferença; qualquer outra coisa faz.

**Um job liberado falhou com `approval.content-changed`.** A cópia preparada em `processing/<jobid>/` foi
modificada depois que os aprovadores a viram. A pasta do job agora está em `error/`. Não assine de novo —
descubra o que gravou em `processing/` e então reexecute o arquivo original de `input/`, para que ele seja
interpretado, totalizado e aprovado do zero.

**Um job falhou com `approval.content-unmeasured` em vez de ficar retido.** O perfil tem uma regra de
aprovação, mas a verificação CNAB240 dele está desligada, então o arquivo nunca foi interpretado e não há
hash de conteúdo ao qual vincular uma decisão. Religue **validar CNAB240** em **Editar comportamento** (ou
remova a regra em **Editar aprovação**) e reexecute o arquivo. A página do perfil não permite salvar essa
combinação, então um perfil nesse estado foi gravado antes de a recusa existir ou foi editado fora da
aplicação.

**Um aprovador é informado de que o registro está incompleto, e a seção Registro de aprovação da página
do job aponta o hash do conteúdo.** A mesma causa, em um job que ficou retido antes de a etapa passar a
recusá-lo: a verificação CNAB240 do perfil estava desligada quando ele ficou retido. Cancele o job,
religue a verificação e envie o arquivo de novo — veja
[Diagnóstico de problemas](troubleshooting.md#um-aprovador-é-informado-de-que-o-registro-de-aprovação-está-incompleto).

**Um job mostra "2 de 2 aprovações — rejeitado".** As duas informações são verdadeiras. A contagem é a
conta, e o desfecho é o veto. A linha do tempo indica o aprovador que rejeitou e o motivo.

**Um job falhou com `approval.rejected` em vez de ser cancelado.** A rejeição chegou depois que um worker
já tinha reivindicado o job, então o pipeline recusou a assinatura, em vez de o handler de aprovação
cancelá-lo. O arquivo ficou sem assinatura, que é o que importa.

**Um arquivo rejeitado não está em `output/`.** Já havia lá um arquivo com esse nome, então a devolução
se recusou a sobrescrevê-lo: a cópia preparada está em `error/<jobid>/` e o arquivo de entrada continua em
`input/`. Veja
[Diagnóstico de problemas](troubleshooting.md#um-arquivo-rejeitado-não-foi-devolvido-a-output).

**Um job foi cancelado com "Approval window expired."** Ninguém decidiu dentro da janela `ExpiresAfter`
do perfil. A cópia preparada está em `error/<jobid>/`, o original ainda está em `input/`, e as aprovações
que *foram* registradas continuam na página do job. Não é possível fazer uma nova tentativa — reexecute o
arquivo por uma nova varredura ou por upload. Se as janelas continuarem vencendo, ou o link não está
chegando às pessoas, ou o prazo é mais curto que o ritmo de trabalho dos seus aprovadores.

**Um job retido expirou enquanto o pipeline estava pausado.** É o esperado — veja
[O prazo de espera](#o-prazo-de-espera).

**Um aprovador quer desfazer uma rejeição.** Não é possível, nem para ele nem para um operador. Uma
decisão é imutável. Pegue o arquivo devolvido em `output/` e envie-o de novo; o novo job fica retido e o
pool é consultado novamente.

**Um aprovador removido ainda consegue abrir a fila dele.** O link dele deixou de funcionar no momento em
que ele saiu do pool, mas uma sessão de navegador que ele abriu antes com o link dura
`ApproverPortal:SessionLifetime` — veja [O link é uma senha](#o-link-é-uma-senha). Ela só alcança jobs
cujo pool congelado ainda o inclui.

**O Assinar e aprovar informa que a extensão Web PKI está ausente, desatualizada ou não é compatível.** O
navegador do aprovador precisa da extensão Lacuna Web PKI, instalada uma vez por pessoa; o modal traz as
instruções de instalação, e nada mais pode ser feito até ela estar instalada. Veja
[Certificados](certificates.md#o-certificado-do-aprovador).

**Os certificados de todos os aprovadores são recusados como inválidos ao mesmo tempo.** Leia o log
operacional: cada recusa traz os motivos do SDK. Quando todos dizem que uma LCR ou um respondedor OCSP não
pôde ser acessado, o problema está na rede da implantação, e não no certificado de alguém — a verificação
não é de melhor esforço e não pode ser flexibilizada. Quando dizem que a raiz não é confiável e os
aprovadores estão apresentando certificados de **teste** da Lacuna, o problema é o conjunto de confiança:
a imagem publicada só aceita a ICP-Brasil, a menos que o host habilite `Signing:TrustLacunaTestRoot` com
um nome de ambiente diferente de `Production` — veja
[Certificados](certificates.md#certificados-de-teste-e-o-conjunto-de-confiança).

**Um aprovador é sempre recusado por divergência de CPF.** O CPF que o pool registra para ele não é o CPF
do certificado que ele apresenta — um erro de digitação no pool ou o certificado de um colega. Compare o
CPF do pool, na página do job, com o subject do certificado. Corrigir o perfil resolve os jobs que ficarem
retidos a partir de então; um job já retido congelou o CPF errado e precisa ser cancelado e reexecutado.

**Um job liberado falhou com `approval.signatures-missing`.** O conjunto de assinantes congelado do job
inclui os aprovadores, mas o envelope com as assinaturas deles não estava ao lado da cópia preparada
quando o pipeline foi promovê-lo, ou não pôde ser aberto como CAdES, ou uma aprovação do job não registrou
certificado. A pasta está em `error/`, com o que houver nela. Algo removeu ou reescreveu o arquivo em
`processing/` — descubra o quê e então reexecute o original de `input/`, para que ele seja aprovado do
zero.

Outros modos de falha em [Diagnóstico de problemas](troubleshooting.md).

---

**A seguir:** [Retenção](retention.md).
**Anterior:** [Arquivos de pagamento CNAB240](cnab240.md).
