---
sidebar_label: "Azure App Service (modo cluster)"
sidebar_position: 2.5
---

# Implantando no Azure App Service — modo cluster

Do zero a um cluster de duas instâncias, verificado na visão **Instâncias** do dashboard.

Este é o passo a passo da **única topologia com múltiplas instâncias que é suportada**: um Azure Web
App executando a imagem de container Linux, com escala horizontal em um único App Service Plan. Os
mecanismos coordenam-se através da base operacional e do compartilhamento de trabalho e independem do
host, mas a topologia *suportada* é exatamente esta — duas VMs *on premises* contra um SQL Server
rodariam o mesmo código e são não documentadas, não testadas e não suportadas.

:::danger Leia os limites antes de começar
**[Alta disponibilidade e seus limites](high-availability.md)** é a lista do que esta topologia não
lhe dá — atualizações que param o mundo, ausência de deployment slots, orçamentos de taxa que se
multiplicam, coleta de métricas que cai em uma instância arbitrária. Todo item dela é mais barato de
saber agora do que de descobrir numa janela de mudança.
:::

Instalações de instância única estão em outro lugar e não são afetadas: systemd no Linux, Serviço do
Windows, Docker e o console em primeiro plano estão em [Instalação](installation.md), e **nada nesta
página se aplica a eles**. `Cluster:Enabled` tem padrão `false`, e desligado é, byte a byte, o produto
de instância única.

## O formato disso

![A topologia de cluster no Azure App Service suportada para o Bulk Signer](/images/bulk-signer/azure-cluster-architecture.svg)

Toda seta é uma chamada HTTPS de saída na porta 443, inclusive a do compartilhamento: este produto
alcança o Azure Files pelo SDK de armazenamento e **nunca por SMB**, então não existe porta 445 em
lugar nenhum daquele desenho, nem unit de montagem, nem pacote no host.

Leia as duas setas que entram no Key Vault em conjunto, porque elas são a única assimetria da página.
Seis permissões são detidas pela **managed identity** do web app; exatamente uma é detida por um
**registro de aplicativo do Entra** — o direito de assinar com a chave — e é a única credencial aqui
que é um segredo que alguém precisa rotacionar. O [passo 3](#3-a-chave-de-assinatura-vive-em-um-cofre)
é de onde isso vem, e por quê.

## Antes de começar

Seis coisas precisam estar resolvidas antes do primeiro boot. Quatro delas são uma recusa de boot, um
erro fatal ou uma linha de readiness vermelha, em vez de uma surpresa em tempo de execução; as duas
últimas são recomendações que esta topologia torna muito mais fortes do que são em outros lugares.

| # | O quê | Por que o modo cluster exige |
|---|---|---|
| 1 | **Um banco de dados Azure SQL**, mais um login em `db_datareader` + `db_datawriter` + `db_ddladmin` | A base é o ponto de coordenação do cluster: as reivindicações de job, a flag de pausa, a tabela de heartbeat e o key ring de sessão vivem todos ali. `Cluster:Enabled = true` com `Database:Provider` diferente de `SqlServer` é **recusado no boot**. Este serviço cria suas tabelas, não seu banco de dados. |
| 2 | **Um compartilhamento do Azure Files (SMB)** para a árvore de trabalho, com todo diretório de entrada monitorado criado dentro dele | `Storage:Provider` e **cada** entrada de `Storage:Inputs[]` precisam resolver para `AzureFiles`, sob pena de recusa no boot. O lease da base local é uma contabilidade em processo que não exclui nada fora do próprio processo, e uma pasta local a uma instância é invisível para suas irmãs. Um compartilhamento NFS é recusado nominalmente. |
| 3 | **Uma decisão entre as duas origens de certificado que não são por host** — `Pfx` lido de um blob, ou `AzureKeyVault` | `Pkcs11` e `WindowsStore` são **recusados no boot**: um token ou um repositório de máquina vive em uma máquina, e instâncias de cluster são intercambiáveis. Sobram duas, e nenhuma é a vencedora óbvia — o [passo 3](#3-a-chave-de-assinatura-vive-em-um-cofre) é a escolha e o que ela custa. Nada precisa existir ainda. |
| 4 | **A imagem de container em um registry do qual o web app consiga fazer pull** | Construída e publicada pelo `Publish-ToAcr.ps1` do pacote de implantação. |
| 5 | **Uma tabela do Azure Storage para o destino de logs** | Fortemente recomendada, e não obrigatória. O disco do container é efêmero, então arquivos de log rotacionados são descartados a cada reciclagem; deixar `Logging:AzureTable:Enabled = false` no modo cluster registra um **Critical na inicialização** e sobe assim mesmo. Nada poda essa tabela — leia [Retenção](retention.md#logs-em-uma-tabela--nada-os-poda) e agende o script de poda *antes* de ligar o destino. |
| 6 | **Um recurso do Application Insights** | Também recomendado, e não obrigatório, por um motivo específico desta topologia: `/api/metrics` atrás do balanceador de carga alcança uma instância arbitrária, então a coleta pelo Prometheus não tem continuidade aqui. A distro do Application Insights é nativamente ciente de instâncias e é o caminho de observabilidade recomendado para cluster — veja [Telemetria](telemetry.md). |

Dê ao web app uma **managed identity atribuída pelo sistema** antes de digitar qualquer outra coisa,
porque assim quase tudo aqui consegue se autenticar sem um segredo: `Credential = ManagedIdentity`
para o compartilhamento do Azure Files, `Authentication=Active Directory Managed Identity` na
connection string do SQL, e o mesmo modo para o blob do certificado e para a tabela de logs. Cada uma
é uma permissão separada, ainda que uma única identidade detenha todas — veja
[Segurança](security.md).

:::warning Uma credencial não pode ser uma managed identity
`Signing:…:Certificate:AzureKeyVault` exige `AppId` **e** `AppSecret`; o bloco não tem chave
`Credential` nem modo de managed identity, então, sob essa origem, o direito de assinar é detido por um
registro de aplicativo do Entra com um client secret. Esse é o único segredo que esta topologia não
consegue eliminar por design, e o [passo 3](#3-a-chave-de-assinatura-vive-em-um-cofre) o pesa contra o
que o cofre compra. Vale saber disso antes de escolher uma origem de certificado.
:::

## Dimensionando o plano e o banco de dados

Dois dos pré-requisitos acima têm um tamanho além de uma existência, e um número que o operador
geralmente conhece de antemão dimensiona ambos: assinaturas por dia. A tabela é um **ponto de partida,
não um resultado de benchmark** — o que ela não tem como saber são os seus arquivos, e eles movem a
resposta mais do que o volume move. Uma assinatura CAdES sobre uma remessa CNAB240 e uma assinatura
PAdES sobre um PDF digitalizado de 300 páginas são, para este produto, o mesmo único job, e não são
nem de longe o mesmo trabalho.

| Assinaturas por dia | App Service Plan | Azure SQL — máx. de vCores |
|---|---|---|
| 0 – 1.000 | P0 V3 × 1 | 2 |
| 1.001 – 5.000 | P1 V3 × 1 | 4 |
| 5.001 – 20.000 | P1 V3 × 2 | 6 |
| 20.001 – 100.000 | P2 V3 × 2 | 8 |
| 100.001 – 1.000.000 | P2 V3 × 2 | 8 |

`× N` é a contagem de instâncias — `--number-of-workers` em **um** plano, nunca um segundo plano.
Independentemente da linha em que você estiver, o passo 2 ainda começa com um worker, e o
[passo 7](#7-escale-para-duas) é onde você escala até o número acima: o primeiro boot é onde toda
recusa dispara, e ler o console de uma instância é mais fácil do que ler o de duas.

**As duas últimas linhas são o mesmo hardware, e essa é a linha mais informativa da tabela.** Em algum
ponto por volta de 100.000 assinaturas por dia a camada web deixa de ser a restrição. Um job é uma
assinatura, e o que a limita a partir daí é a origem do certificado — um `Pfx` já em memória, ou uma
ida e volta ao Key Vault — junto com o I/O do compartilhamento. Dez vezes o volume no mesmo plano é,
portanto, uma afirmação sobre onde o trabalho de fato está, não uma folga que o plano guardava de
reserva. No topo daquela linha, dimensione primeiro
[a ida e volta ao cofre](#a-latência-é-a-restrição-aqui-não-o-throttling) e
`Pipeline:MaxConcurrency`, e aumente o plano por último.

**Um SKU maior não assina mais arquivos ao mesmo tempo.** `Pipeline:MaxConcurrency` é a única coisa que
faz isso, ele é por instância, e o [passo 3](#3-a-chave-de-assinatura-vive-em-um-cofre) o define como
`4` — então uma linha `× 2` são oito assinaturas em andamento, e oito é o número que a origem do
certificado precisa aguentar, não os quatro configurados.
[Alta disponibilidade](high-availability.md) é onde essa mesma multiplicação se lê como limitação em
vez de funcionalidade.

**As duas linhas `× 1` não precisam desta página.** O modo cluster é válido com uma instância — o
passo 6 sobe exatamente assim — mas com uma instância nada do que ele coordena está fazendo trabalho
algum, e uma implantação que fica ali permanentemente está pagando por um banco Azure SQL e um
compartilhamento Azure Files dos quais poderia ter prescindido. Abaixo de 5.000 assinaturas por dia,
leia [Instalação](installation.md) primeiro e volte quando o motivo for o volume, ou uma segunda
instância, e não a plataforma.

:::note O que "máx. de vCores" significa, e por que o auto-pause nunca dispara
Um número de vCores *máximo* descreve a camada de computação **serverless** do Azure SQL, onde esse
número é o teto até o qual o banco pode escalar (`--max-capacity`); na camada provisionada leia o mesmo
número como a contagem de vCores, já que não há o que escalar. Não faça orçamento contando com
economia de auto-pause em nenhum dos casos. Este produto consulta sua base continuamente, e no modo
cluster cada instância também escreve um heartbeat a cada `Cluster:HeartbeatSeconds` — 15 por padrão —
de modo que o banco nunca fica ocioso por nada perto da hora que o auto-pause exige. Dimensione-o como
um banco de dados que está sempre no ar.
:::

**Nada disso é um argumento de vazão a favor do `SqlServer`.** A coluna de vCores dimensiona um banco
cujo provider [Antes de começar](#antes-de-começar) já tornou obrigatório aqui; não é um motivo para
tirar uma instalação de instância única do SQLite, cujo teto também não é o deste pipeline — essa
decisão está em
[Instalação](installation.md#escolhendo-onde-a-base-operacional-vive), em seus próprios termos.

---

## 1. Publique a imagem

A partir do pacote de implantação fornecido pela Lacuna Software:

```bash
pwsh deploy/docker/Publish-ToAcr.ps1 -Registry <nome-do-registry>
```

O script constrói a imagem de container remotamente no ACR Tasks (sem daemon Docker local), publica no
repositório `lacuna/bulksigner` por padrão, aplica as tags `<versão>`, `<versão>-<git sha>` e `latest`,
e prepara um `.dockerignore` curado na raiz do contexto durante a build. O `-WhatIf` imprime o plano
resolvido e não toca em nada — vale rodar primeiro, porque uma tag `<versão>` já existente é uma parada
dura sem `-Force`.

## 2. Crie o plano e o app — uma instância primeiro

```bash
az group create --name bulksigner-rg --location brazilsouth
```

```bash
az appservice plan create --name bulksigner-plan --resource-group bulksigner-rg --is-linux --sku P1V3 --number-of-workers 1
```

O `P1V3` acima é o SKU do exemplo, não uma recomendação —
[Dimensionando o plano e o banco de dados](#dimensionando-o-plano-e-o-banco-de-dados) é qual deles o
seu volume pede.

**O Basic (B1) é o piso**, por ser a primeira camada que faz escala horizontal — e ele limita a três
instâncias, o que também limita o que o Health check pode fazer por você, já que redirecionar para
longe de uma instância não saudável exige haver para onde redirecionar. O Premium v3 é a resposta de
produção. Comece com um worker deliberadamente: o primeiro boot é onde toda recusa dispara, e ler o
console de uma instância é mais fácil do que ler o de duas.

```bash
az webapp create --name bulksigner --resource-group bulksigner-rg --plan bulksigner-plan --container-image-name <nome-do-registry>.azurecr.io/lacuna/bulksigner:<versão>
```

`lacuna/bulksigner` é o repositório padrão do script de publicação. Fixe a tag `<versão>` em vez de
`latest`, para que uma atualização seja algo que você faz, e não algo que um restart faz.

```bash
az webapp identity assign --name bulksigner --resource-group bulksigner-rg
```

Conceda a essa identidade `AcrPull` no registry, `Storage File Data Privileged Contributor` no
compartilhamento, um login SQL mapeado para ela em `db_datareader` + `db_datawriter` + `db_ddladmin`,
`Storage Blob Data Reader` no container que guarda o certificado, e `Storage Table Data Contributor` na
conta da tabela de logs. O passo 3 adiciona a sexta e última delas.

:::warning O que *não* entra nessa lista é o direito de assinar
Sob `AzureKeyVault`, a chave do cofre é alcançada pelo registro de aplicativo do Entra nomeado em
`AppId`, nunca por esta identidade — então `get` + `sign` concedidos aqui seriam concedidos ao
principal errado, e o boot ainda assim falharia, com uma mensagem sobre o cofre que não diz nada sobre o
porquê. A única permissão que esta identidade assume naquele cofre é `Key Vault Secrets User`, para ler
de volta o próprio segredo do registro de aplicativo como um app setting.
:::

Depois, diga ao app para fazer o pull com essa identidade em vez de uma senha de registry:

```bash
az resource update --ids $(az webapp config show --name bulksigner --resource-group bulksigner-rg --query id -o tsv) --set properties.acrUseManagedIdentityCreds=True
```

Sem essa última linha o pull recai para credenciais de registry que o app não tem, e o primeiro sintoma
é um container que nunca inicia — sem nada no log da aplicação, porque ainda não há aplicação.

## 3. A chave de assinatura vive em um cofre

Duas origens sobrevivem às recusas de boot de [Antes de começar](#antes-de-começar), e este é o passo
que escolhe entre elas. Elas são genuinamente equivalentes — a escolha é de política, não técnica, e
cada uma concede algo que a outra preserva.

| | `Pfx` lido de um blob | `AzureKeyVault` |
|---|---|---|
| Onde está a chave privada | Um `.pfx` no Blob Storage, lido para a memória da instância no boot | Dentro do cofre, permanentemente. Cada assinatura é uma chamada remota e a chave nunca deixa o Azure |
| Credencial | A managed identity do web app, `Storage Blob Data Reader`. **Sem segredo** | Um registro de aplicativo do Entra com um **client secret**, mais uma permissão de managed identity para ler esse segredo de volta |
| Latência de assinatura | Nenhuma além da criptografia local | Uma ida e volta ao cofre por job |
| Se o Azure estiver inalcançável | Já assinou; o pipeline continua assinando | Todo job falha até o cofre responder |
| Auditoria | O histórico de jobs deste produto, e nada mais | Cada assinatura é uma operação registrada no Key Vault — uma contagem independente para reconciliar contra o histórico de jobs |

O resumo honesto é que o `AzureKeyVault` compra uma chave que não pode ser exfiltrada de uma instância
comprometida, e paga por isso com o único segredo que esta topologia de outro modo não teria. Se um
client secret nos app settings não for aceitável para você, **o `Pfx` como blob é a resposta melhor do
que uma chave de cofre respaldada por software** — uma chave em software é FIPS 140-2 Nível 1, o que
concede a maior parte do argumento a favor do cofre enquanto mantém todo o seu custo. O restante desta
seção assume que você escolheu o cofre; para `Pfx`, tudo o que você precisa está em
[Certificados](certificates.md#lendo-o-arquivo-de-um-blob), mais o upload do blob abaixo.

### Provisione o cofre, a chave e o registro de aplicativo

```bash
az keyvault create --name bulksigner-kv --resource-group bulksigner-rg --location brazilsouth --sku premium --enable-rbac-authorization true
```

**Premium, porque a chave deve ser respaldada por HSM.** O Standard lhe dá uma chave em software, e o
parágrafo acima é o porquê de esse ser o lado errado desta troca.

Um certificado ICP-Brasil chega como um PFX, então a chave é *importada* em vez de gerada. O
[`Import-PfxToKeyVault.ps1`](samples.md) faz toda a importação em uma passada — grava o `.cer` público,
importa a metade privada como um objeto **key**, registra a aplicação no Entra, cria seu segredo,
concede-lhe `sign` e roda a mesma verificação de pareamento de chave pública que o serviço executa no
boot, de modo que uma divergência apareça aqui em vez de no primeiro start:

```bash
pwsh Import-PfxToKeyVault.ps1 -PfxPath ./signer.pfx -VaultName bulksigner-kv -KeyName bulksigner-signing-key -AppDisplayName bulk-signer-prod -Destination HSM -GrantScope Key -SecretValidityYears 2
```

:::note Um objeto key, não um objeto certificate — e a diferença é a razão de tudo
O Key Vault vai guardar este PFX de qualquer forma, mas um *certificate* importado de um PFX é marcado
como exportável: qualquer um que detenha `secrets/get` pode baixar o PFX completo do segredo que o
respalda. Um objeto *key* nunca devolve material privado sob permissão alguma. É por isso que a origem
deste produto é somente-chave, e por isso que o certificado público precisa ser fornecido em separado.
:::

O script imprime o client secret **uma única vez** e não o grava em lugar nenhum. Capture-o agora.

### Coloque o certificado onde uma instância consiga lê-lo

O script deixa o `.cer` na sua estação de trabalho, o que não serve para um container cujo disco é
reciclado junto com ele. Faça o upload e deixe a managed identity lê-lo:

```bash
az storage blob upload --account-name contosocerts --container-name certificates --name signer.cer --file ./signer.cer --auth-mode login
```

Conceda a essa identidade `Storage Blob Data Reader` no container — a quarta das permissões que o passo
2 listou. O `CerPath` continua disponível e aponta para um arquivo local, mas nesta topologia isso
significa embutir o certificado na imagem, o que acopla uma renovação anual de certificado a uma
reconstrução de imagem e a uma implantação que para o mundo. Use o blob.

### As configurações

Estas são app settings como quaisquer outras, definidas aqui em vez de no passo 4 porque todo valor
nelas foi produzido pelos dois comandos acima:

```bash
az webapp config appsettings set --name bulksigner --resource-group bulksigner-rg --settings \
  Signing__Profiles__0__Certificate__Source=AzureKeyVault \
  Signing__Profiles__0__Certificate__AzureKeyVault__Endpoint='https://bulksigner-kv.vault.azure.net/' \
  Signing__Profiles__0__Certificate__AzureKeyVault__KeyName=bulksigner-signing-key \
  Signing__Profiles__0__Certificate__AzureKeyVault__AppId=99990000-aaaa-bbbb-cccc-ddddeeeeffff \
  Signing__Profiles__0__Certificate__AzureKeyVault__AppSecret='@Microsoft.KeyVault(VaultName=bulksigner-kv;SecretName=bulksigner-app-secret)' \
  Signing__Profiles__0__Certificate__AzureKeyVault__Blob__Url='https://contosocerts.blob.core.windows.net/certificates/signer.cer' \
  Signing__Profiles__0__Certificate__AzureKeyVault__Blob__Credential=ManagedIdentity \
  Pipeline__MaxConcurrency=4
```

O `0` é o índice do perfil em `Signing:Profiles[]` e é posicional — reordenar aquele array
silenciosamente reaponta estas configurações para um perfil diferente. O `Endpoint` precisa ser uma URL
`https://` absoluta; um nome DNS puro é recusado no boot, nomeando a chave.

:::warning `Blob` e `CerPath` são exclusivos — os dois é recusado no boot, e nenhum também
Essa recusa é deliberada em vez de implicante: dois certificados válidos para uma chave de cofre
passariam ambos na verificação de pareamento, então resolver o conflito por precedência faria com que
*qual certificado assinou* dependesse do clima da rede, de forma não auditável. Note também que o
`Blob` não herda nada do bloco do cofre acima dele, ainda que ambos nomeiem o Azure — a credencial do
cofre concede *uso de uma chave*, a credencial do blob concede *leitura de um objeto*, e elas são
configuradas separadamente de propósito.
:::

### Um cofre, dois objetos, duas credenciais

O `AppSecret` acima é uma **Key Vault reference** do App Service, que é o único lugar desta página onde
o Key Vault aparece em seus dois papéis ao mesmo tempo. Parece circular e não é:

![Dois principais, dois objetos do Key Vault, duas permissões](/images/bulk-signer/azure-key-vault-principals.svg)

- A **managed identity** do web app resolve a referência e recebe o segredo de volta — uma permissão
  `Key Vault Secrets User`, sobre o *segredo*.
- Esse segredo é então o que o conector do PKI apresenta para alcançar a **chave** — uma permissão
  `Key Vault Crypto User` detida pelo *registro de aplicativo*, sobre a *chave*, delimitada por
  `-GrantScope Key` acima.

Dois principais, dois objetos, duas permissões. O mesmo cofre guarda ambos porque um segundo não
compraria isolamento nenhum — quem consegue ler o segredo consegue usar a chave de qualquer forma — e
só acrescentaria um recurso. A nota do passo 4 de que segredos pertencem a Key Vault references é sobre
*este* mecanismo; a chave em si nunca é um app setting.

### A latência é a restrição aqui, não o throttling

[Certificados](certificates.md#origem--azurekeyvault) alerta que concorrência sustentada atrai HTTP
429s, que chegam como jobs falhados em vez de travamentos. Vale saber, e vale a escala: o Key Vault
permite 2.000 transações a cada 10 segundos contra uma chave RSA-2048 em HSM — cerca de **200
assinaturas por segundo**, contra um produto que executa uma assinatura por job. Você vai encontrar a
latência de ida e volta muito antes do teto.

O ponto específico do cluster é a *inversão* do tema recorrente desta página. Em outros pontos desta
topologia os orçamentos de taxa se multiplicam com as instâncias, a favor do atacante; aqui o orçamento
é **por cofre** e fixo, enquanto os consumidores se multiplicam. `Pipeline__MaxConcurrency=4` é por
instância, então duas instâncias são oito assinaturas em andamento contra um cofre. O `AzureKeyVault` é
tratado como seguro para concorrência e está isento do aviso de inicialização que cobre `Pkcs11` e
`WindowsStore`.

### Renovação e rotação são janelas de mudança

Três coisas aqui são lidas **uma vez, no boot**, e nada as reconsulta: os bytes do certificado no blob,
a chave do cofre nomeada por `KeyName`, e o client secret por trás da Key Vault reference. Mudar
qualquer uma delas exige, portanto, um restart — e um restart nesta topologia é a parada do mundo do
[passo 8](#8-atualizações-param-o-mundo), não um restart rolante nem uma troca de slot. Planeje uma
renovação ICP-Brasil, e a expiração de `-SecretValidityYears 2`, como indisponibilidades agendadas, e
não como manutenção que se pode fazer a qualquer momento.

:::danger Renove um artefato sem o outro e o boot recusa
Um certificado novo contra o `KeyName` antigo, ou uma chave nova contra o `.cer` antigo, falha na
verificação de pareamento — o que nesta topologia significa que a janela de mudança termina sem nada
rodando. Rode novamente o script de importação contra o novo PFX, para que ambos os artefatos se movam
juntos, e leia a linha `profile` no [passo 6](#6-primeiro-boot-em-uma-instância) antes de considerar a
janela encerrada.
:::

### O que este passo assume sobre a rede

Todo comando acima alcança seu serviço por um endpoint público com uma credencial, o que também vale
para o SQL, o Azure Files e o blob do certificado nesta página. Restringir qualquer um deles significa
integração com VNet e private endpoints, que é o [passo 9](#9-endurecendo-a-rede-opcional) e é opcional.

## 4. App settings

Os app settings do App Service são **por app, não por instância** — que é o fato em que todo o desenho
se apoia: cada instância é idêntica por construção, então os riscos de divergência de configuração
entre instâncias (uma senha de criptografia diferente entre hosts, um perfil de que uma instância nunca
ouviu falar) não podem ocorrer aqui. Defina-os como variáveis de ambiente, na forma com duplo
sublinhado; não há um `appsettings.Production.json` para montar.

```bash
az webapp config appsettings set --name bulksigner --resource-group bulksigner-rg --settings \
  WEBSITES_PORT=8080 \
  Cluster__Enabled=true \
  Database__Provider=SqlServer \
  ConnectionStrings__Default='Server=tcp:sqlsrv01.database.windows.net,1433;Initial Catalog=BulkSigner;Authentication=Active Directory Managed Identity;Encrypt=True;' \
  Storage__Provider=AzureFiles \
  Storage__AzureFiles__AccountName=contosofiles \
  Storage__AzureFiles__ShareName=bulksigner \
  Storage__AzureFiles__Directory=prod \
  Storage__AzureFiles__Credential=ManagedIdentity \
  Storage__Inputs__0__Name=remessas \
  Storage__Inputs__0__Path=entrada/remessas \
  Storage__Inputs__0__PollIntervalSeconds=30 \
  Hosting__ForwardedHeaders__Enabled=true \
  Hosting__ForwardedHeaders__TrustAnyProxy=true \
  Logging__AzureTable__Enabled=true \
  Telemetry__Enabled=true
```

**Aquele bloco é a topologia, não a configuração inteira.** Ele deliberadamente omite tudo o que é
igual aqui e em qualquer outro alvo — a licença do PKI, a chave de API, os perfis de assinatura, os
pools de aprovação. A única exceção é o **certificado** de um perfil, que enfaticamente não é igual aqui
e em qualquer outro alvo, e foi definido no [passo 3](#3-a-chave-de-assinatura-vive-em-um-cofre) um
passo atrás. Pegue o restante no arquivo `appsettings.Example.Azure.json.sample` do pacote de
implantação, que é um formato trabalhado e preenchido de ponta a ponta, e traduza cada chave para sua
forma com duplo sublinhado (`Signing:Profiles[0].Certificate.Source` →
`Signing__Profiles__0__Certificate__Source`). Um boot sem certificado resolvível é fatal por design: um
perfil que não consegue assinar não é representável.

Segredos — `Signing__PkiSdkLicense`, `Auth__ApiKey`, `ApproverPortal__LinkSecret`, qualquer
`AppSecret` — pertencem a Key Vault references em vez de app settings literais, resolvidos pela managed
identity do web app que detém `Key Vault Secrets User`. O passo 3 usa exatamente esse mecanismo para o
próprio client secret do cofre, e explica lá por que isso não é circular. Toda chave que este produto
aceita, com seu tipo, padrão e forma de variável de ambiente, está em
[Configuração](configuration.md).

Cinco das configurações acima são as específicas de cluster, e cada uma está ali por um motivo que vale
conhecer:

- **`Cluster__Enabled=true`** é a chave inteira. Nada é inferido do ambiente: uma implantação que por
  acaso rode SQL Server e um compartilhamento do Azure Files não muda de comportamento silenciosamente
  numa atualização.
- **`Cluster__HeartbeatSeconds` / `Cluster__StaleAfterSeconds`** estão ausentes acima porque os padrões
  (15 e 60) são o ponto de partida correto — quatro cadências, de modo que três batidas precisam faltar
  antes de uma instância ser presumida morta. Um limiar abaixo de **três cadências** é recusado no
  boot, nomeando ambas as chaves. Aumente `StaleAfterSeconds` se você encontrar mortes falsas; veja
  [a aposta](high-availability.md#uma-morte-presumida-é-uma-aposta).
- **`Hosting__ForwardedHeaders__*`** é o que faz o limitador de taxa e o endereço registrado em uma
  aprovação lerem o cliente real em vez do balanceador de carga. `TrustAnyProxy=true` é a configuração
  pretendida *aqui* — o front door do App Service não tem endereço estável a listar — e somente aqui:
  em uma implantação com proxy reverso, isso significa que qualquer um que alcance o Kestrel
  diretamente pode se declarar qualquer endereço de cliente. Um conjunto de confiança vazio é recusado
  no boot em vez de lido como a resposta ampla, e definir o próprio
  `ASPNETCORE_FORWARDEDHEADERS_ENABLED` do framework ao lado dele também é recusado.
- **`WEBSITES_PORT=8080`** casa com o `EXPOSE` da imagem. O App Service detecta automaticamente 80 e
  8080, então isto é cinto e suspensório — e uma configuração é mais barata que o diagnóstico quando
  uma imagem futura mudar de porta.
- **Deixe `Hosting__RequireHttps` indefinido.** Termine o TLS na plataforma com o `httpsOnly` abaixo.
  Um redirecionamento em processo responde ao ping do health check com um 307, que o App Service lê
  como falha — veja [a nota sobre o health check](#o-health-check-lê-o-endpoint-de-readiness) abaixo.

## 5. Configurações de plataforma

```bash
az webapp update --name bulksigner --resource-group bulksigner-rg --set clientAffinityEnabled=true httpsOnly=true
```

```bash
az webapp config set --name bulksigner --resource-group bulksigner-rg --always-on true --generic-configurations '{"healthCheckPath": "/api/ready"}'
```

**A afinidade ARR fica ligada.** Ela vem ligada por padrão e é um requisito, não uma preferência: o
dashboard é Blazor Server, e seu circuito é uma conexão SignalR com estado que precisa continuar caindo
na instância que o detém. Isso é documentado, e não contornado por engenharia. Note o que ela *não*
faz — o cookie de sessão em si é compartilhado, porque no modo cluster o key ring de Data Protection
migra para a base operacional, de modo que um cookie criado por uma instância é validado por todas as
outras. As sessões pegajosas são para o circuito; o key ring é para o cookie. Sem o key ring, a
afinidade sozinha ainda desconectaria as pessoas de forma intermitente.

**O Always On fica ligado.** O pipeline de assinatura é um worker hospedado, não um manipulador de
requisições. Um app que a plataforma descarrega enquanto está ocioso é um app que para de pegar
arquivos, e nada nisso se lê como erro em lugar algum.

### O health check lê o endpoint de readiness

O `/api/ready` é anônimo, por instância, e retorna `503` quando qualquer uma de suas sondagens falha —
que é precisamente a pergunta que o App Service está fazendo. Aponte o Health check para ele e a
plataforma para de rotear para uma instância que não consegue servir, e eventualmente substitui uma que
permaneça assim.

Três consequências a aceitar conscientemente:

- **Deixe `WEBSITE_HEALTHCHECK_MAXPINGFAILURES` no seu padrão (10).** O endpoint é rigoroso — uma única
  pasta de entrada ausente reprova a resposta inteira — então um limiar apertado transforma uma
  oscilação em uma remoção.
- **Uma dependência *compartilhada* falhando derruba todas as instâncias juntas.** Um compartilhamento
  que para de responder ou uma base que estava inalcançável no boot não é problema de uma instância, e
  a regra da plataforma é que, quando todas as instâncias estão não saudáveis, nenhuma é removida do
  balanceador de carga — mas a substituição ainda acontece, no máximo uma por hora e três por dia por
  plano. O app continua alcançável; as instâncias vão sendo recicladas por baixo de você enquanto a
  falha real está em outro lugar. Leia [Diagnóstico de problemas](troubleshooting.md) antes de concluir
  que a culpa é da plataforma.
- **O Health check não segue redirecionamentos.** É por isso que `Hosting:RequireHttps` fica desligado:
  com ele ligado e o `httpsOnly` da plataforma desligado, o ping recebe um 307 e a instância é marcada
  como não saudável por um motivo que nada tem a ver com sua saúde.

## 6. Primeiro boot, em uma instância

Inicie o app e leia o console — o streaming de logs do App Service é onde a narração do boot aparece:

```bash
az webapp log tail --name bulksigner --resource-group bulksigner-rg
```

O que procurar no painel **Service ready**:

| Linha | O que ela deve dizer |
|---|---|
| `operational store` | `SQL Server (sqlsrv01/BulkSigner)` — o provider, o servidor e o catálogo, nunca a connection string. Um aviso `READ_COMMITTED_SNAPSHOT is off` importa: o Azure SQL vem com ele ligado por padrão. |
| `storage provider` | `AzureFiles` |
| `work share owner` | `this cluster (one marker, shared between instances)` — o texto que informa que o modo está de fato ligado. Fora da chave, esta linha nomeia uma instância. |
| `azure shares` | alcançáveis. Um compartilhamento inalcançável **não** impede o host de subir, mas reprova o `/api/ready` e não ingere nada até responder. |
| `forwarded headers` | o conjunto de confiança nominalmente, não apenas `on`. |
| `logs` | o destino de tabela entre os destinos. Se estiver ausente, você também terá visto o Critical sobre arquivos de log rotacionados em disco efêmero. |
| `profile` | o certificado que de fato carregou — `cades · cert=AzureKeyVault · blob=contosocerts/certificates/signer.cer · verify=on · …`. As duas metades são evidência: `cert=AzureKeyVault` significa que o cofre respondeu e a chave foi encontrada, `blob=…` significa que o `.cer` foi lido **e pareado** contra ela. Esta é a linha para ler após qualquer renovação de certificado — é a única confirmação de que ambos os artefatos se moveram juntos. |

Depois, faça `GET /api/ready` e confirme que toda verificação está verde, e abra **Sistema →
Instâncias** no dashboard: uma linha, marcada como a instância na qual você está lendo, com um chip
**Live**.

:::warning Atualizando uma implantação de instância única existente em vez de construir uma nova?
Suba **uma vez** com `Cluster:Enabled = false` e deixe a recuperação rodar antes de ligar o modo. Uma
linha deixada em andamento por uma build mais antiga não carrega dono, e sob o modo cluster nada jamais
vai varrê-la — o assunto deste boot é sua própria vida anterior, o de uma irmã é a dela, e a assunção
segue o heartbeat de um dono, do qual não há nenhum. O mesmo vale para um job despachado ao Lacuna
Signer por uma build assim. Ambas as superfícies avisam quando encontram um desses e nomeiam este mesmo
remédio. É uma preocupação única, no momento da atualização: o dono é registrado em toda reivindicação,
esteja o modo ligado ou não, e apenas *lido* sob ele.
:::

## 7. Escale para duas

```bash
az appservice plan update --name bulksigner-plan --resource-group bulksigner-rg --number-of-workers 2
```

Dê um minuto — o App Service consulta o caminho do health check para confirmar que a nova instância
está pronta antes de rotear para ela — e então recarregue **Sistema → Instâncias**.

**Como é quando está pronto:** duas linhas, cada uma com uma identidade derivada distinta (o
`WEBSITE_INSTANCE_ID` da plataforma, que o App Service define em toda instância), cada uma **Live**,
ambas na mesma versão da aplicação, uma marcada como a instância que respondeu à sua requisição. A
legenda nomeia a cadência e o limiar de obsolescência em vigor. Atualize algumas vezes: a marcação se
move entre as duas linhas, porque cada recarga pode cair em qualquer uma das instâncias — que é o
balanceador de carga fazendo seu trabalho, e a primeira coisa nesta página que você pode ver em vez de
inferir.

### Depois, confirme que o cluster de fato coopera

A visão Instâncias prova que ambas as instâncias estão vivas. Ela não prova que elas dividem o
trabalho.

![Como duas instâncias cooperam através da base operacional e do compartilhamento de trabalho](/images/bulk-signer/azure-cluster-coordination.svg)

Solte vários arquivos de uma vez em uma pasta monitorada e leia `/jobs`:

- Cada arquivo vira exatamente **um** job. Ambas as instâncias monitoram todas as pastas, então elas
  correm a cada chegada; o enfileiramento perdedor é recusado pelo índice único parcial sobre os
  caminhos originais ativos e respondido como `AlreadyActive`, e um conflito de lease em uma entrada é
  classificado como **esperado** — não conta para o disjuntor de falhas consecutivas da pasta, não é
  registrado como erro. Contenção aqui é o sistema funcionando, não uma falha.
- Os jobs são **detidos por ambas as instâncias**. O `/api/folders` carrega um campo `instance`
  nomeando qual delas respondeu; a linha do tempo do job em `/jobs/{id}` carrega o resto.
- Pare uma instância (escale de volta para uma) e o trabalho dela em andamento é reconciliado pela
  sobrevivente em vez de ficar órfão: um job que nunca chegou à chamada de assinatura é reenfileirado,
  um que passou dela falha conservadoramente, um job `AwaitingSigner` é reatribuído. Cada assunção
  escreve um evento operacional `JobTakenOver` nomeando ambas as instâncias. A política por inteiro,
  inclusive por que "falhou" é um desfecho honesto e não "travado", está em
  [Operação](operations.md#quando-uma-instância-para-de-responder-uma-sobrevivente-assume-seus-jobs).

## 8. Atualizações param o mundo

Pare o app, implante a nova imagem, inicie-o. Não é um restart rolante, e **não é uma troca de
deployment slot** — um slot de staging carregando a connection string de produção é um segundo conjunto
de instâncias entrando no cluster em uma versão diferente da aplicação, que é o único formato que este
desenho não suporta.

A marca de versão no heartbeat é o fio de alarme, não a guarda: uma instância subindo que enxergue
heartbeats vivos de uma versão diferente registra um **Critical e continua**. Deliberadamente não é uma
recusa — recusar bloquearia instâncias de subir por todo o tempo que um heartbeat *morto* da versão
antiga levasse para ficar obsoleto, que é exatamente quando um operador precisa que elas subam.

O argumento completo, e o resto do que esta topologia não oferece, está em
[Alta disponibilidade e seus limites](high-availability.md).

## 9. Endurecendo a rede (opcional)

Tudo acima é um cluster funcional alcançado por endpoints públicos com credenciais. Esta seção é o que
você acrescenta depois que ele funciona, e ela é genuinamente opcional — mas um item dela não é defesa
em geral, e sim uma limitação documentada desta topologia se transformando em problema resolvido.

**Os orçamentos de taxa param de se multiplicar.**
[Alta disponibilidade](high-availability.md#os-orçamentos-de-limitação-de-taxa-são-por-instância-então-o-limite-efetivo-é-n)
lista isso como um custo de escalar horizontalmente: cada instância impõe seu próprio orçamento de taxa
por cliente, então duas instâncias entregam a um atacante o dobro do orçamento na rota de aprovação, e
*N* instâncias *N* vezes. Um rate limit de WAF no Front Door fica **antes** do balanceador de carga, o
que faz dele o único lugar nesta arquitetura onde um orçamento por cliente é imposto uma vez em vez de
por instância. Nada mais nesta página fecha isso.

O motivo para recusar: esta seção acrescenta quatro recursos cobrados e uma elevação de camada em cima
de um plano e de um cofre que já são Premium. Sem números aqui — o preço do Azure envelhece mais rápido
que qualquer documento.

**A entrada é uma escolha entre dois formatos, e apenas um deles pode ser verdadeiro por vez.** Ou o
app permanece na internet atrás de um Front Door, ou ele deixa a internet inteiramente e é alcançado por
uma VPN. A metade de saída abaixo é o mesmo trabalho nos dois casos. Leia os dois antes de construir
qualquer um — o segundo é a resposta mais forte para a rota de aprovação anônima e a mais fraca para
tudo o que um WAF faz, e qual desses importa mais não é uma pergunta que esta página pode responder por
você.

![Front Door na frente, private endpoints atrás](/images/bulk-signer/azure-network-hardening.svg)

### Entrada — Front Door na frente do app

**O Front Door Premium com uma origem via Private Link é a recomendação**, porque o App Service
desabilita automaticamente seu endpoint público de internet quando a origem é alcançada por Private
Link — o que neste produto compra algo específico, dois parágrafos abaixo.

A alternativa mais barata é o Front Door Standard mais uma restrição de acesso do App Service:

```bash
az webapp config access-restriction add --name bulksigner --resource-group bulksigner-rg --rule-name frontdoor --priority 100 --service-tag AzureFrontDoor.Backend --http-header x-azure-fdid=<id-do-front-door>
```

Ambas as metades daquela regra são obrigatórias, e o cabeçalho é a que sustenta a carga. A Microsoft é
explícita ao dizer que filtragem por IP sozinha não é suficiente, *porque as instâncias de Front Door de
outros clientes do Azure usam as mesmas faixas de endereço* — a service tag `AzureFrontDoor.Backend`
prova que o tráfego veio por *um* Front Door, e só o `X-Azure-FDID` prova que veio pelo **seu**. Nunca
codifique as faixas de endereço em vez de usar a tag; esse espaço muda com regularidade.

**É isto que finalmente torna o `TrustAnyProxy=true` do passo 4 verdadeiro, e não apenas pretendido.**
Aquela configuração é justificada lá pelo fato de o front end do App Service não ter endereço estável a
listar, com um aviso de que, numa implantação com proxy reverso, ela permite que qualquer um que alcance
o Kestrel diretamente se declare qualquer endereço de cliente. Neste produto esse endereço não é
cosmético: ele é registrado em cada aprovação como um dos controles compensatórios da rota de aprovação
anônima, e é contra ele que o limitador de taxa conta. Um Front Door **sem** travamento de origem
ampliaria esse risco enquanto parecesse proteção. Com o Private Link o risco fecha completamente, porque
não sobra endpoint público a alcançar; com a regra do Standard ele fecha apenas até onde aquela
restrição de acesso se sustentar, que é uma afirmação mais fraca e vale ser tratada como tal.

Mantenha `TrustAnyProxy=true` sob as duas camadas. **Não** migre para
`Hosting__ForwardedHeaders__KnownNetworks` — ele recebe CIDRs literais, as faixas do Front Door mudam, e
uma lista desatualizada falha descartando silenciosamente o endereço real do cliente, em vez de recusar
alguma coisa. O produto recusa `TrustAnyProxy` e uma lista nomeada ao mesmo tempo, então este é um ou/ou
real, e a resposta amplo-com-origem-travada é a correta aqui.

Três interações de configuração a acertar:

- **Deixe ligada a afinidade de sessão do próprio Front Door.** O dashboard é um circuito Blazor Server
  e precisa de fixação de ponta a ponta; a afinidade do Front Door é o que mantém um cliente na origem
  cujo cookie ARR ele está segurando. As duas camadas cooperam — o Front Door escolhe a origem, o ARR
  escolhe a instância.
- **Não aponte a sondagem de saúde do Front Door para `/api/ready`.** Existe exatamente uma origem
  aqui, então uma falha de sondagem não tem para onde fazer failover e simplesmente retira a aplicação
  inteira. O próprio Health check do App Service já observa aquele endpoint e *pode* agir sobre ele,
  redirecionando entre instâncias. Dê ao Front Door um caminho barato ou deixe sua sondagem no padrão.
- **Domínio customizado e TLS gerenciado migram para o Front Door.** O `httpsOnly=true` do App Service
  fica exatamente como o passo 5 o deixou, e o `Hosting:RequireHttps` fica indefinido pelo motivo que o
  passo 5 dá.

:::note O que isso não compra: múltiplas regiões
O Front Door aqui é um WAF, um terminador de TLS e uma frente contra DDoS, não um balanceador de carga
global para esta aplicação. Uma segunda região seria um segundo conjunto de instâncias sobre um
compartilhamento de trabalho, e o gate do marcador do compartilhamento recusa isso por design — veja
[Alta disponibilidade](high-availability.md#o-gate-do-compartilhamento-de-trabalho-é-mais-estreito-que-a-catástrofe-que-lhe-dá-nome).
:::

### Entrada, o outro formato — nenhum endpoint público

As duas opções de entrada são **exclusivas**, e esta é a segunda. Em vez de colocar um Front Door na
frente de um app público, dê ao app um **private endpoint** e então tire dele o endpoint público, de
modo que a única rota até ele seja a partir da sua própria rede: uma VPN site-a-site ou ponto-a-site, ou
peering privado de ExpressRoute. O desenho acima deixa de se aplicar em sua borda esquerda — tudo de
[Saída](#saída--integração-com-vnet-e-private-endpoints) para baixo é compartilhado pelos dois formatos
e se aplica aqui sem mudança. O argumento do orçamento de taxa na abertura deste passo é exclusivo do
Front Door; este formato o responde de outra maneira, em vez de não o responder, e *O que este formato
não fecha*, abaixo, é onde.

Escolha este quando o requisito for que **ninguém fora da sua rede alcance este serviço de forma
alguma**, e o Front Door quando o serviço tiver de ser alcançável pela internet e a única pergunta for
com que segurança.

**A rota de aprovação anônima deixa de ser alcançável pela internet, e essa é a maior coisa desta
página.** O `/approve/{jobId}` e o `POST /api/approvals/{id}` não recebem credencial por design — uma
decisão compensada em vez de escondida, com um método de identificação registrado, o endereço e o user
agent do aprovador, seu próprio orçamento de limitação de taxa e recusas deliberadamente grosseiras
([Aprovações](approvals.md)). Cada um desses controles foi projetado para uma página que qualquer um
poderia carregar. Tire o endpoint público e a população que consegue alcançar a rota passa a ser a
população já admitida na sua rede, o que é uma compensação mais forte do que qualquer coisa que o
produto em si possa entregar. Se aquela rota não autenticada é o motivo de você estar lendo esta seção,
este formato é a resposta a ela e o Front Door não é.

**Dito ao contrário, esse é também o custo: um aprovador que não está na rede não consegue aprovar.** O
link do portal é um HMAC derivado que funciona a partir de qualquer dispositivo, e este formato torna o
*alcance* a restrição vinculante. Conte a população de aprovadores antes de se comprometer — um diretor
aprovando uma folha de pagamento pelo celular, um auditor externo, qualquer pessoa em um cliente —
porque, para cada um deles, a resposta passa a ser um cliente de VPN naquele dispositivo, e isso é muito
mais barato de saber agora do que depois que a primeira folha ficar retida num fim de semana.

**O que este formato não fecha.** Não há WAF aqui, então o orçamento de taxa ×N continua ×N; o que muda
é quem pode gastá-lo, não a aritmética. O `/api/metrics` continua caindo em uma instância arbitrária, e
as atualizações continuam parando o mundo. Se você precisa de um WAF **e** de nenhuma exposição pública,
a resposta é um Application Gateway interno em vez do Front Door — que sempre tem um front end público
próprio — e isso é um terceiro formato de implantação, não documentado aqui.

**Mantenha `Hosting__ForwardedHeaders__*` exatamente como o [passo 4](#4-app-settings) o deixou, e o
endereço que ele registra fica melhor.** O Private Link encaminha o endereço real do cliente para o app,
então o que aparece em um registro de aprovação é o endereço do próprio aprovador, e não um salto de
proxy. O `TrustAnyProxy=true` também deixa de carregar a ressalva que o passo 4 anexa a ele, pelo mesmo
motivo que a opção de origem via Private Link: com o acesso público desabilitado, não sobra caminho até
o Kestrel a partir de fora da rede para ser abusado.

### Provisionando o private endpoint

O private endpoint precisa de uma sub-rede própria — **não** aquela que a integração com VNet usa, o que
é uma restrição da plataforma e não uma preferência, e a forma mais comum de isso ser construído duas
vezes:

```bash
az network private-endpoint create --resource-group bulksigner-rg --name bulksigner-pe --vnet-name bulksigner-vnet --subnet inbound --group-id sites --connection-name bulksigner-sites --private-connection-resource-id $(az webapp show --name bulksigner --resource-group bulksigner-rg --query id -o tsv)
```

```bash
az network private-dns zone create --resource-group bulksigner-rg --name privatelink.azurewebsites.net
```

```bash
az network private-dns link vnet create --resource-group bulksigner-rg --zone-name privatelink.azurewebsites.net --name bulksigner-vnet-link --virtual-network bulksigner-vnet --registration-enabled false
```

```bash
az network private-endpoint dns-zone-group create --resource-group bulksigner-rg --endpoint-name bulksigner-pe --name default --private-dns-zone privatelink.azurewebsites.net --zone-name azurewebsites
```

```bash
az resource update --ids $(az webapp show --name bulksigner --resource-group bulksigner-rg --query id -o tsv) --set properties.publicNetworkAccess=Disabled
```

**Aquele último comando é o que faz o trabalho, e o private endpoint não o implica.** Um private
endpoint e o acesso público **coexistem** em um App Service por padrão: construa o endpoint, conecte-se
pela VPN, veja funcionar — e o app continua na internet exatamente como estava. Note também que as
regras de restrição de acesso do app *não* são avaliadas para o tráfego que chega pelo private endpoint,
então a regra `x-azure-fdid` da opção do Front Door é inerte aqui. Este formato é imposto pela
inexistência de um endpoint público, nunca por uma regra.

:::warning O DNS é onde isso falha, e falha como um `403` em vez de um timeout
O nome público do app continua resolvendo depois que o endpoint existe — para um endereço público que
agora recusa você. Um cliente que não recebeu resolução privada obtém, portanto, um **403 da
plataforma**, que se lê como um problema de permissão e não é. São necessários dois registros A em
`privatelink.azurewebsites.net`, um para o app e outro para seu nome `scm`; o grupo de zona DNS acima
cria os dois, razão pela qual vale usá-lo em vez de escrever os registros à mão. **Clientes de VPN
resolvem pelo seu próprio DNS**, então o último trecho é um encaminhador condicional dos seus
resolvedores para dentro do Azure — um endpoint de entrada do
[Azure DNS Private Resolver](https://learn.microsoft.com/azure/dns/dns-private-resolver-overview) é a
forma mantida de fazer isso. Continue usando o nome de host padrão `*.azurewebsites.net`: o certificado
da plataforma é emitido para ele, e um domínio customizado aqui significa trazer o seu próprio.
:::

**Duas coisas que você foi instruído a fazer antes migram para dentro da rede.** O
[passo 6](#6-primeiro-boot-em-uma-instância) lê a narração do boot com `az webapp log tail`, que alcança
o site SCM do app — agora privado, então rode-o de uma estação conectada à VPN, ou leia o boot no
destino de log em tabela. E, se você colocar um private endpoint também no container registry, o pull da
imagem precisa ser roteado pela rede explicitamente, definindo `properties.vnetImagePullEnabled` do
mesmo jeito que o passo 2 define `acrUseManagedIdentityCreds`; um registry deixado público não precisa de
nada. O que **não** muda é qualquer coisa que a plataforma faça consigo mesma — o
[Health check](#o-health-check-lê-o-endpoint-de-readiness) continua consultando `/api/ready` e a
afinidade ARR continua fixando o circuito Blazor, ambos internos ao App Service e ambos indiferentes a
tudo isso.

:::note "Sem exposição à internet" aqui significa entrada, e duas coisas ainda saem
O app mantém seu caminho de saída para a internet, e as duas exclusões deliberadas em
[Saída](#saída--integração-com-vnet-e-private-endpoints) abaixo dependem dele: o destino de log em tabela
do Azure e o Application Insights. Se o seu requisito cobre também a saída, esses dois são a conversa
inteira — o Application Insights precisa de um Azure Monitor Private Link Scope, e a tabela de logs
precisa de um private endpoint na sua conta de armazenamento, o que **colide com o motivo pelo qual
aquela exclusão existe**: um destino de log é o único destino que precisa continuar funcionando quando o
que quebrou foi a rede. Leia aquele argumento antes de fechá-lo, e note que simplesmente desligar o
destino não é a saída barata — no modo cluster isso registra um Critical na inicialização, porque os
arquivos de log rotacionados de um container vão embora com o container
([Antes de começar](#antes-de-começar), item 5).
:::

### Saída — integração com VNet e private endpoints

Integre o web app a uma sub-rede e dê a **todos os quatro serviços de plano de dados** um private
endpoint: o Azure SQL, o compartilhamento do Azure Files, o cofre e o blob do certificado. Os quatro,
não três — um private endpoint na maioria deles deixa o remanescente como a razão pela qual a rede
virtual existe, e ninguém percebe até que uma auditoria perceba.

Duas exclusões, ambas deliberadas:

- **A tabela de logs continua pública.** Ela é o destino que precisa continuar funcionando quando todo
  o resto está quebrado; um caminho de rede que pode falhar é exatamente do que um destino de log não
  pode depender, já que um destino incapaz de relatar sua própria falha é a indisponibilidade que se
  esconde a si mesma.
- **O Application Insights continua público.** A ingestão privada exige um Azure Monitor Private Link
  Scope, um constructo separado com suas próprias consequências de DNS em todos os recursos que o
  compartilham — uma decisão maior que esta seção, e que deveria ser tomada para uma assinatura inteira
  em vez de para um web app.

---

## Quando alguma coisa recusa

Todo modo de falha de cluster, com sua mensagem exata e sua correção, está em
[Diagnóstico de problemas](troubleshooting.md#modo-cluster). Os cinco que você tem mais chance de
encontrar em uma primeira implantação:

| Sintoma | Causa |
|---|---|
| `Cluster mode refused to start`, nomeando chaves | Uma das recusas de boot em [Antes de começar](#antes-de-começar). A mensagem nomeia todas as chaves com problema de uma vez, em vez de uma por tentativa. |
| **O container nunca inicia** | Duas causas bem diferentes compartilham este sintoma, e a do passo 2 é a primeira em que você vai pensar. Ou o pull da imagem falhou (`acrUseManagedIdentityCreds` nunca definido — passo 2), ou um perfil não conseguiu resolver seu certificado, o que é **fatal por design**: um cofre inalcançável, um client secret expirado, ou um `.cer` que não pareia com o `KeyName` ([passo 3](#3-a-chave-de-assinatura-vive-em-um-cofre)). O fluxo de log os distingue — uma falha de pull o deixa vazio porque ainda não há aplicação, enquanto uma falha de certificado escreve o motivo antes de sair. Leia-o antes de presumir que é o registry. |
| Boot recusado nomeando uma identidade de instância que já bate | Dois hosts apresentando um nome, ou uma segunda implantação apontada para este banco de dados — mais comumente um slot carregando a connection string de produção. Se o detentor de fato se foi, a linha dele fica obsoleta sozinha; esperar o `Cluster:StaleAfterSeconds` passar é a correção suportada. |
| Boot recusado nomeando duas bases operacionais | O marcador do compartilhamento de trabalho diz que ele pertence a uma base diferente. Dois clusters sobre um compartilhamento de trabalho é destruição mútua de dados que banco de dados nenhum consegue enxergar, que é o que aquele gate existe para pegar. |
| Operadores jogados de volta ao login de forma intermitente | As instâncias não estão compartilhando um key ring — geralmente um host cujo `Cluster:Enabled` é falso, ou instâncias apontadas para bases diferentes. |

---

Relacionados: [Alta disponibilidade e seus limites](high-availability.md) ·
[Instalação](installation.md) · [Certificados](certificates.md) ·
[Configuração](configuration.md#cluster--implantação-com-múltiplas-instâncias) ·
[Operação](operations.md#quais-instâncias-estão-vivas-somente-no-modo-cluster) ·
[Diagnóstico de problemas](troubleshooting.md#modo-cluster)
