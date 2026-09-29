---
sidebar_label: "Configuração"
sidebar_position: 3
---

# Configuração

Todas as chaves do `appsettings.json` do Lacuna Bulk Signer — tipo, padrão, override por variável de
ambiente e se são obrigatórias.

## Origens de configuração, em ordem de precedência

Origens posteriores sobrescrevem as anteriores:

1. `appsettings.json` (padrões embutidos)
2. `appsettings.{Environment}.json` (por exemplo, `appsettings.Production.json`)
3. `appsettings.json` + `appsettings.{Environment}.json` encontrados em `BULK_SIGNER_CONFIG_DIR`
4. Variáveis de ambiente (`Section__Sub__Key`)

É a etapa do `BULK_SIGNER_CONFIG_DIR` que permite manter o binário em um local de instalação somente
leitura (`/opt/bulksigner`, `%ProgramFiles%\Lacuna\BulkSigner`) e a configuração de produção, editada
pelo operador, em outro lugar (`/etc/bulksigner`, `%ProgramData%\Lacuna\BulkSigner\config`). Os
scripts de instalação definem essa variável; se você mudar os caminhos de instalação, atualize a
variável também.

O mapeamento para variáveis de ambiente segue a regra do ASP.NET Core: uma chave JSON como
`Signing:Certificate:Pfx:Password` corresponde a `Signing__Certificate__Pfx__Password` (o sublinhado
duplo é o separador).

:::warning Mudou na 2.3.1 — o `appsettings.json` distribuído é neutro para produção
O `appsettings.json` que acompanha os binários e a imagem **não declara perfis de assinatura, nem bloco
`Signer`, nem segredo de nenhum tipo** — nem mesmo um `Auth:ApiKey` de exemplo. Isso importa porque ele
é lido com qualquer nome de ambiente, e a configuração pode sobrescrever uma chave, mas nunca removê-la:
antes da 2.3.1, os perfis de exemplo desse arquivo se mesclavam por baixo dos perfis declarados em
variáveis de ambiente. A única consequência na atualização: uma implantação que nunca definiu o próprio
`Auth:ApiKey` estava rodando com o antigo valor de exemplo e agora **se recusa a iniciar, indicando a
chave**. Defina `Auth__ApiKey` como descrevem todos os roteiros de instalação.
:::

## Marcadores usados nas tabelas

| Marcador | Significado |
|----------|-------------|
| **REQUIRED** | O serviço se recusa a iniciar (ou a assinatura se recusa a rodar) sem um valor não vazio. |
| **SECRET** | Sensível — prefira o override por variável de ambiente a um valor gravado em um arquivo versionado. |

## `Logging` / `Logging:File`

As configurações padrão do `Microsoft.Extensions.Logging` (`Logging:LogLevel:*`) funcionam
normalmente; o bloco `Logging:File` configura o destino de arquivo.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Logging:LogLevel:Default` | string | `Information` | `Logging__LogLevel__Default` | Nível de log padrão. |
| `Logging:LogLevel:Microsoft.AspNetCore` | string | `Warning` | `Logging__LogLevel__Microsoft.AspNetCore` | Reduz o volume de mensagens do framework. O mesmo nível mínimo `Warning` é aplicado no código a `Microsoft.AspNetCore` e à categoria de comandos de banco de dados do Entity Framework Core, de modo que nem o pipeline de requisições nem cada instrução SQL executada chegam ao log em `Information`. Comandos que falham continuam sendo registrados. |
| `Logging:File:Path` | string | `data/logs/bulksigner-.log` | `Logging__File__Path` | **REQUIRED.** Template de caminho do destino de arquivo. O `-` final antes de `.log`, somado à rotação diária, produz `bulksigner-yyyyMMdd.log`. |
| `Logging:File:RollingInterval` | string | `Day` | `Logging__File__RollingInterval` | Um de `Day`, `Hour`, `Minute`, `Infinite`. |
| `Logging:File:FileSizeLimitBytes` | long | `50000000` | `Logging__File__FileSizeLimitBytes` | Limite por arquivo; acima dele, o destino passa a escrever em `…_001.log`. Faixa válida: 64 KB a 10 GB. |
| `Logging:File:RetainedFileCountLimit` | int | `14` | `Logging__File__RetainedFileCountLimit` | Arquivos mais antigos são apagados conforme a rotação avança. Faixa válida: 1–365. |
| `Logging:File:MinimumLevel` | string | `Information` | `Logging__File__MinimumLevel` | Um de `Verbose`, `Debug`, `Information`, `Warning`, `Error`, `Fatal`. |
| `Logging:File:WriteToConsole` | bool | `true` | `Logging__File__WriteToConsole` | Quando verdadeiro, também escreve na saída padrão. O mesmo formatador com mascaramento roda nos dois destinos. |

## `Logging:AzureTable` — um segundo destino de log

Uma implantação em um sistema de arquivos efêmero — um container que é substituído em vez de
reiniciado — perde `data/logs/` toda vez. Este bloco envia os eventos de log também para uma tabela do
Azure Storage, de modo que o fluxo de diagnóstico sobreviva ao host. É a última de três partes do estado
que podem ir para o Azure: os arquivos já podem ficar em um compartilhamento do Azure Files
([`Storage:Provider`](#storageprovider--storageazurefiles--o-compartilhamento-de-trabalho)), e o
registro operacional, no Azure SQL ([`Database`](#database-e-connectionstrings)).

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Logging:AzureTable:Enabled` | bool | `false` | `Logging__AzureTable__Enabled` | Desligado, a menos que seja definido. `true` com um bloco incompleto causa uma **recusa de boot** que indica a chave ausente, e não um destino silenciosamente inativo. |
| `Logging:AzureTable:TableName` | string | `bulksignerlogs` | `Logging__AzureTable__TableName` | Precisa existir previamente — o serviço não a cria. Somente caracteres alfanuméricos, de 3 a 63, sem começar com dígito; um nome inválido é recusado no boot, e não na primeira escrita. |
| `Logging:AzureTable:MinimumLevel` | string | *(herda `Logging:File:MinimumLevel`)* | `Logging__AzureTable__MinimumLevel` | Restringe o que vai para a tabela sem restringir o arquivo. **Defini-lo *abaixo* do mínimo global não tem efeito** — esse filtro é aplicado antes de qualquer destino. |
| `Logging:AzureTable:ServiceUri` | string | — | `Logging__AzureTable__ServiceUri` | **REQUIRED quando habilitado.** O endpoint da tabela, por exemplo `https://contosologs.table.core.windows.net`. Uma URL com **query string é recusada** — é assim que chega uma shared access signature (SAS), e a SAS deliberadamente não está entre as credenciais de armazenamento deste produto. A recusa também garante que este valor não seja secreto, o que permite exibi-lo com segurança no banner de inicialização. |
| `Logging:AzureTable:Credential` | string | — | `Logging__AzureTable__Credential` | **REQUIRED quando habilitado.** `ManagedIdentity`, `ServicePrincipal` ou `AccountKey`. **Não tem valor padrão** — veja abaixo. |
| `Logging:AzureTable:AccountName` | string | — | `Logging__AzureTable__AccountName` | Obrigatório para `AccountKey` **e somente nesse modo**: a credencial de chave compartilhada precisa do nome da conta, que não pode ser extraído do `ServiceUri` sem adivinhar se a URL é um endpoint de produção ou de emulador. |
| `Logging:AzureTable:AccountKey` | string | — | `Logging__AzureTable__AccountKey` | **SECRET.** Somente no modo `AccountKey`. |
| `Logging:AzureTable:TenantId` | string | — | `Logging__AzureTable__TenantId` | Somente no modo `ServicePrincipal`. |
| `Logging:AzureTable:AppId` | string | — | `Logging__AzureTable__AppId` | Somente no modo `ServicePrincipal`. |
| `Logging:AzureTable:AppSecret` | string | — | `Logging__AzureTable__AppSecret` | **SECRET.** Somente no modo `ServicePrincipal`. Override por env recomendado. |
| `Logging:AzureTable:QueueLimit` | int | `10000` | `Logging__AzureTable__QueueLimit` | Eventos mantidos em memória enquanto a tabela está inacessível. Acima desse limite, os eventos são **descartados e contabilizados** — e informados em `/api/ready` e em `bulksigner_log_sink_dropped_total`. O limite existe porque, com um buffer ilimitado, uma indisponibilidade longa derrubaria por falta de memória um serviço de assinatura só porque o *log* falhou. |
| `Logging:AzureTable:BatchSizeLimit` | int | `100` | `Logging__AzureTable__BatchSizeLimit` | Eventos por escrita. Limitado a 100, o teto documentado de uma transação de grupo de entidades; acima disso, um lote deixa de ser uma única transação, em vez de apenas ficar mais lento. |
| `Logging:AzureTable:BatchPeriodSeconds` | int | `5` | `Logging__AzureTable__BatchPeriodSeconds` | Quanto tempo um lote parcial espera antes de ser escrito. |

**As chaves de credencial são as mesmas usadas por `Storage:AzureFiles` e pelo blob de material de
assinatura de um perfil**, de modo que um operador que já configurou uma credencial de armazenamento
neste produto já sabe configurar todas. A identidade precisa da role **Storage Table Data Contributor**
na tabela ou na conta de armazenamento.

**Um bloco que não indica a credencial é recusado no boot.** Recorrer a uma identidade de
desenvolvimento faria uma identidade gerenciada ausente ou não atribuída funcionar em um laptop e falhar
só em produção.

**Prefira `ManagedIdentity` a `AccountKey`.** A Microsoft recomenda proibir a autorização por Shared
Key, e muitas organizações definem `allowSharedKeyAccess = false` na conta — nesse caso, o `AccountKey`
nem pode ser configurado. Uma chave de conta também concede acesso total ao plano de dados da conta
*inteira*, então uma chave usada para uma tabela de logs também dá acesso a qualquer compartilhamento
do Azure Files que exista na mesma conta.

### Duas regras que são impostas, não recomendadas

**A tabela nunca pode ser o único destino.** O `Logging:File:Enabled` é a chave para desligar o arquivo
(em um sistema de arquivos raiz somente leitura), mas uma configuração em que **os dois destinos locais
estejam desligados** é recusada no boot: se a tabela parar de aceitar escritas, a própria falha de
registro não poderia ser registrada. Mantenha o destino de arquivo ou o `WriteToConsole` — em um
container, ele corresponde à saída padrão, que o `docker logs` e o streaming de logs do App Service já
capturam.

:::danger Nada limpa a tabela
Sem TTL, sem regra de ciclo de vida, sem exclusão em lote — a tabela cresce até você apagar registros
dela. Leia [Retenção](retention.md#logs-em-uma-tabela--nada-os-poda) *antes* de habilitar este
recurso, e agende o script de limpeza. Se duas implantações compartilham uma conta de armazenamento,
use uma tabela para cada uma.
:::

## `Database` e `ConnectionStrings`

O **banco de dados operacional** — jobs e seu histórico, eventos operacionais, a flag de pausa do
pipeline, as regras de aprovação congeladas e as aprovações registradas — fica em SQLite por padrão,
mas pode ficar em um SQL Server 2022+ próprio ou em um Azure SQL Database.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Database:Provider` | enum | `Sqlite` | `Database__Provider` | `Sqlite` ou `SqlServer`. Não diferencia maiúsculas de minúsculas; se ausente, vale `Sqlite`, então uma implantação existente não precisa configurar nada. Um valor não reconhecido é recusado no boot, com a indicação da chave, do valor informado e dos nomes válidos. |
| `ConnectionStrings:Default` | string | `Data Source=data/db/bulksigner.db` | `ConnectionStrings__Default` | **REQUIRED com `SqlServer`** — e **SECRET** nesse caso, porque contém a credencial inteira (login SQL, Entra ID, identidade gerenciada, autenticação integrada do Windows; não há chave de credencial separada). Com `Sqlite`, pode ser omitida — o padrão acima é de fato usado. Use um caminho SQLite dentro de `Storage:Root` para que uma única montagem cubra a árvore de dados e o banco. |

Deliberadamente, **não há um discriminador `Database:Credential`**: o SQL Server expressa a
autenticação na connection string há trinta anos, e acrescentar um segundo mecanismo ao lado de um que
já funciona só criaria uma forma de os dois divergirem.

O provider do banco operacional é independente de `Storage:Provider` — arquivos em um compartilhamento
do Azure Files com o banco em SQLite, ou o contrário, são combinações comuns. **Nenhuma das combinações,
por si só, torna suportada a execução de mais de uma instância**: para isso existe o
[`Cluster:Enabled`](#cluster--implantação-com-múltiplas-instâncias), que *exige* `SqlServer` e
`AzureFiles`, mas não é ativado por eles. Sem essa chave, veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho).

Azure SQL Managed Instance e SQL Server em uma VM se enquadram em *configure como `SqlServer`, não
testado* — a mesma implementação os atende e não há nenhuma diferença conhecida, mas nenhum dos dois é
testado.

**Três recusas de boot se referem a `ConnectionStrings:Default`,** e quais se aplicam depende do
provider:

- Com `Sqlite`, uma connection string que aponta para um local do Azure Files — acessar um arquivo de
  banco de dados por SMB é a forma documentada de corrompê-lo.
- Com `SqlServer`, o inverso: um data source que aponta para um *arquivo* em vez de um servidor, o que
  acontece quando uma implantação troca o provider e esquece o caminho SQLite na configuração.
- Com `SqlServer`, uma string **ausente**. Nenhum servidor é presumido, ao passo que, com `Sqlite`,
  existe um caminho de arquivo padrão real.

Nenhuma recusa exibe a connection string, porque ela pode conter uma senha; apenas o data source é
citado.

### Antes de apontá-lo para o SQL Server

1. **O banco de dados precisa existir previamente.** O Bulk Signer cria as *tabelas*, não o banco de
   dados. O probe de boot abre uma conexão com o banco indicado na connection string; por isso, um
   banco ausente é interpretado como banco operacional inacessível, e a migração não é executada.
2. **Um login com as permissões abaixo,** mapeado para um usuário nesse banco de dados.
3. **Criptografia que o cliente aceite.** O `Encrypt` tem padrão `True` no cliente SQL, então um
   servidor *on-premises* cujo certificado TLS não é confiável para o host faz o login falhar com um
   erro *certificate chain … not trusted*. Instale um certificado confiável no servidor (a solução
   correta) ou, conscientemente e somente onde um ataque man-in-the-middle não for uma preocupação,
   acrescente `TrustServerCertificate=True`. O Azure SQL não precisa de nenhum dos dois.

**Menor privilégio.** O serviço lê e escreve suas próprias tabelas e aplica migrações no boot. Isso é
`db_datareader` + `db_datawriter` + `db_ddladmin` — **não** `db_owner`:

```sql
-- Uma vez, por um DBA, no banco de dados que o Bulk Signer vai usar.
CREATE USER [bulksigner] FOR LOGIN [bulksigner];   -- um login SQL
-- No Azure SQL com uma managed identity ou service principal, em vez disso:
-- CREATE USER [<nome-da-identidade-ou-do-app>] FROM EXTERNAL PROVIDER;

ALTER ROLE db_datareader ADD MEMBER [bulksigner];
ALTER ROLE db_datawriter ADD MEMBER [bulksigner];
ALTER ROLE db_ddladmin   ADD MEMBER [bulksigner];  -- para o boot que aplica uma migração
```

Esse bloco pressupõe que o banco de dados e o login já existem e que você está conectado **a esse banco
de dados**. A forma de criá-los varia conforme o engine:

```sql
-- SQL Server: a partir do master, depois troque.
CREATE DATABASE [BulkSigner];
GO
ALTER DATABASE [BulkSigner] SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
GO
CREATE LOGIN [bulksigner] WITH PASSWORD = '<uma senha forte>';
-- ou, para autenticação integrada do Windows:  CREATE LOGIN [DOMINIO\HOSTNAME$] FROM WINDOWS;
GO
USE [BulkSigner];
GO
-- …então o bloco CREATE USER + ALTER ROLE acima.
```

```sql
-- Azure SQL: DUAS conexões, porque USE não troca de banco de dados lá e
-- CREATE DATABASE precisa rodar a partir do master, sozinho.
--   Conexão 1, para o master:
CREATE DATABASE [BulkSigner];
GO
--   Conexão 2, para o próprio BulkSigner: o bloco CREATE USER + ALTER ROLE acima.
```

O `READ_COMMITTED_SNAPSHOT` **já vem ligado** no Azure SQL. Sem ele, as leituras do dashboard obtêm
locks compartilhados e ficam bloqueadas pelas escritas do pipeline — o que aparece como "o dashboard
trava enquanto um lote é assinado", e não como uma configuração de banco de dados. O Bulk Signer
informa essa configuração e **nunca executa o comando que a altera**: isso exige acesso exclusivo a um
banco de dados que pertence a você.

É o `db_ddladmin` que cria as tabelas e os índices, então ele é necessário no **primeiro** boot e em
qualquer boot após uma atualização que traga uma migração. Manter as três roles é o padrão mais simples
e mais seguro; a migração roda a cada boot e não faz nada quando não há o que aplicar.

### As duas formas de credencial

Nos dois casos, a credencial vai na connection string. **Prefira a forma sem senha sempre que o host
puder se autenticar com a própria identidade** — assim não há segredo para rotacionar, vazar em um log
ou ser encontrado em um backup.

```
# Sem senha — Azure SQL, de um host com uma managed identity atribuída pelo sistema
Server=tcp:sqlsrv01.database.windows.net,1433;Initial Catalog=BulkSigner;Authentication=Active Directory Managed Identity;Encrypt=True;

# Sem senha — on premises, de uma conta de serviço do Windows (autenticação integrada)
Server=sqlsrv01;Initial Catalog=BulkSigner;Integrated Security=True;Encrypt=True;

# Com um segredo — um login SQL
Server=sqlsrv01;Initial Catalog=BulkSigner;User ID=bulksigner;Password=<segredo>;Encrypt=True;

# Com um segredo — um service principal do Entra
Server=tcp:sqlsrv01.database.windows.net,1433;Initial Catalog=BulkSigner;Authentication=Active Directory Service Principal;User ID=<app-id>;Password=<client-secret>;Encrypt=True;
```

Para usar uma identidade **atribuída pelo usuário**, acrescente o client id dela como
`User Id=<client-id>` — diferentemente de `Storage:AzureFiles`, cujo modo `ManagedIdentity` aceita
somente a identidade atribuída pelo sistema, porque aqui é o próprio cliente SQL que obtém o token.

Quando instalado como serviço do Windows, o serviço roda com a conta virtual `NT SERVICE\LacunaBulkSigner`,
que acessa a rede como a **conta de computador** — então o login a criar no SQL Server é
`DOMINIO\HOSTNAME$`, e não o nome da própria conta virtual.

:::warning A variável de ambiente substitui o valor inteiro — não se mescla com o JSON
`ConnectionStrings:Default` é uma única chave de configuração, então não há como manter o servidor no
`appsettings.Production.json` e fornecer apenas a senha pelo ambiente. A string completa vem do JSON
(o que é aceitável quando ela não tem senha) ou do ambiente. Um valor no JSON mantido junto com a
variável de ambiente é silenciosamente ignorado.
:::

### Trocar de provider começa com um banco vazio

Não há importador nem verificação no boot para um arquivo SQLite que ficou para trás. Uma implantação
que define `Database:Provider = SqlServer` encontra um schema vazio: sem jobs, sem histórico, sem
eventos operacionais — **e sem snapshots de aprovação nem aprovações registradas**, justamente as duas
coisas que o produto, fora isso, retém para sempre, porque são a evidência de quem autorizou um arquivo
de pagamento.

:::danger
**Arquive o antigo `db/bulksigner.db` deliberadamente, antes da troca**, e guarde-o por todo o tempo em
que a sua política de retenção exigir a evidência que ele contém. Copie-o com o serviço parado e
mantenha um cliente SQLite à mão. A troca inversa tem a mesma característica. Veja
[Instalação](installation.md#migrando-do-sqlite--arquive-o-arquivo-antigo-primeiro).
:::

### O que o boot informa sobre o banco operacional

Toda implantação recebe uma linha `operational store` no banner de resumo de prontidão, com o provider
e, com `SqlServer`, também o servidor e o banco de dados — nunca a connection string. Uma implantação
`SqlServer` recebe mais duas linhas:

- **`store status`**, resultado de um probe no boot. Um banco operacional inacessível é **informado e
  não impede o host de iniciar** (um banco de dados fora do ar durante uma janela de manutenção não pode
  transformar uma reinicialização em indisponibilidade); a migração não é executada, o `/api/ready`
  fica vermelho até o banco responder, e o próximo boot que o encontrar aplica o schema.
- **`store isolation`**, além de um aviso no console de operação, quando o `READ_COMMITTED_SNAPSHOT`
  está desligado. Quando está ligado, nada é informado.

### Comportamento específico do engine que você não configura

- **Com `Sqlite`,** toda conexão recebe `journal_mode=WAL`, `synchronous=NORMAL` e
  `busy_timeout=30000`. O WAL impede que as escritas de status por job do pipeline sejam serializadas
  no fsync de escritor único do SQLite (o teto de vazão com valores mais altos de
  `Pipeline:MaxConcurrency`).
- **Com `SqlServer`, a repetição em falhas transitórias está ligada e não tem ajuste** — a tentativa
  inicial mais até seis novas tentativas para os números de erro que o cliente SQL classifica como
  transitórios, com cada intervalo crescendo exponencialmente, limitado a 30 segundos. Ela fica ligada
  porque, na prática, rodar com o Azure SQL a exige. Deliberadamente, não há chave de configuração: um
  limite de repetições que o operador consegue ajustar é um limite que acaba ajustado para zero durante
  um incidente.

## `Signing`

A validação falha imediatamente na inicialização se alguma chave obrigatória estiver ausente ou for
inválida.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:PkiSdkLicense` | string | `""` | `Signing__PkiSdkLicense` | **REQUIRED, SECRET.** String de licença do Lacuna PKI SDK (base64). Prefira a forma por variável de ambiente. |
| `Signing:ProfileSecretsKey` | string | `""` | `Signing__ProfileSecretsKey` | **SECRET.** A chave com a qual é criptografado todo segredo mantido por um perfil de assinatura *armazenado*. Deixe-a sem definir, a menos que os perfis da implantação tenham algum segredo — veja [abaixo](#signingprofilesecretskey--a-chave-que-criptografa-os-segredos-dos-perfis-armazenados). |
| `Signing:TrustLacunaTestRoot` | bool | `false` | `Signing__TrustLacunaTestRoot` | Confia também na **raiz da PKI de teste da Lacuna** — a emissora dos certificados de teste Turing / Fermat — em um ambiente de homologação. **Recusada no boot quando `ASPNETCORE_ENVIRONMENT` é `Production`.** Não é segredo. Veja [abaixo](#signingtrustlacunatestroot--certificados-de-teste-para-homologação). |
| `Signing:Certificate:Source` | enum | `Pfx` | `Signing__Certificate__Source` | **REQUIRED.** Um de `Pfx`, `Pkcs11`, `WindowsStore`, `AzureKeyVault`. Somente a subárvore correspondente abaixo é consultada. |

### `Signing:ProfileSecretsKey` — a chave que criptografa os segredos dos perfis armazenados

Os perfis de assinatura ficam no banco operacional (veja
[`Signing:Profiles[]`](#signingprofiles--perfis-de-assinatura-por-pasta)), então esta chave é
**obrigatória para toda implantação cujos perfis tenham algum segredo** — uma senha de PKCS#12, um
segredo de aplicativo do Azure Key Vault, uma credencial de blob de material de assinatura ou um arquivo
PKCS#12 enviado pelo dashboard. Cada um deles é criptografado com ela, e o banco nunca guarda nenhum
deles em texto claro.

**Defina-a antes do primeiro boot que importa perfis** e antes que alguém crie pelo dashboard um perfil
com segredo. A importação é recusada em vez de gravar um segredo que não consegue proteger, com a
indicação desta chave, da variável de ambiente dela e dos perfis que têm segredo; os formulários de
criação e edição do dashboard recusam da mesma forma. Uma implantação cujos perfis não têm nenhum
segredo — um PFX sem senha, um token PKCS#11 cujo PIN vem de uma variável de ambiente, um certificado do
repositório do Windows, um perfil em que os aprovadores assinam — não precisa de chave, e ela nunca é
solicitada.

Deliberadamente, ela **não** fica no banco de dados: uma chave guardada ao lado do texto cifrado não
protege contra nada que importe. É também por isso que o key ring de sessão não é reaproveitado para
ela — com `Cluster:Enabled`, esse ring é, ele próprio, um conjunto de linhas no mesmo banco (veja
[O key ring de sessão](#o-key-ring-de-sessão-não-tem-chave-própria-e-não-precisa-de-nenhuma)).

Três casos, tratados de formas diferentes de propósito:

- **Dados protegidos de perfil no banco e nenhuma chave para lê-los** interrompem o boot. A solução é
  uma variável de ambiente, e não uma linha em um banco de dados que só seria acessível com o serviço
  rodando.
- **Uma importação ou um salvamento que criaria dados protegidos sem chave** é recusado no mesmo
  momento, de modo que o banco nunca acaba guardando um valor que ninguém consegue abrir.
- **Uma chave definida, mas *errada*** — rotacionada, restaurada de outro lugar, digitada errado —
  **não** causa recusa. O serviço inicia, os perfis que ele não consegue ler sobem **degradados**
  (identificados no banner de inicialização e no `/api/ready`), e todo perfil sem segredo continua
  assinando. Definir uma variável de ambiente resolve uma chave ausente, mas não resolve uma chave
  rotacionada; por isso, a recusa seria permanente.

:::danger Perder esta chave significa digitar novamente o segredo de certificado de cada perfil afetado
Não há custódia de chaves nem caminho de recuperação, e rotacioná-la tem o mesmo efeito que perdê-la.
Faça backup dela onde você faz backup da senha de criptografia, do `ApproverPortal:LinkSecret` e do
`ApproverSecondFactor:SeedSecret`. A recuperação, se for necessária, consiste em digitar novamente a
senha ou a credencial de cada perfil indicado, na página dele no dashboard, e reiniciar.
:::

O **PIN do PKCS#11 não é um dos valores que ela protege**, e nunca passa a ser: ele continua sendo lido
da variável de ambiente indicada por `Pkcs11:PinEnvVar`, e um PIN gravado em qualquer lugar de onde
possa ser lido de volta é recusado no boot.

### `Signing:TrustLacunaTestRoot` — certificados de teste para homologação

O serviço valida toda assinatura **somente com as raízes da ICP-Brasil** — a chave do perfil quando
assina, o verificador depois, e o certificado de um aprovador antes de o token pedir o PIN —, sem usar
nada do repositório do sistema operacional. A **PKI de teste** pública da Lacuna (os certificados de
teste Turing / Fermat) não está abaixo dessas raízes, então, por padrão, um job assinado com um desses
certificados falha, e um aprovador que apresente um deles é recusado com `approval.certificate-invalid`.

`Signing:TrustLacunaTestRoot = true` amplia o conjunto de confiança para a ICP-Brasil, o conjunto de
confiança do Windows do PKI SDK (o repositório da máquina, no Windows) e a raiz de teste da Lacuna, para
um ambiente de homologação que queira rodar o produto distribuído com os certificados de teste em vez de
comprar um e-CPF real para cada aprovador. Três pontos importantes:

- **Ela é recusada com o nome de ambiente `Production`.** O boot falha indicando a chave, o ambiente e
  a solução: um host de homologação usa `ASPNETCORE_ENVIRONMENT=Staging` (ou qualquer nome diferente de
  `Production`). O Azure App Service usa `Production` por padrão quando nada define o nome, então, nele,
  as duas configurações andam juntas.
- **Ela é um único conjunto de confiança para o host inteiro.** A chave de todo perfil, toda verificação
  e o certificado de todo aprovador são validados com as mesmas raízes; não há variante por perfil. A
  linha `trust set` do banner de inicialização indica a raiz de teste da Lacuna quando ela está ligada,
  e o console e o log durável exibem um aviso a cada boot.
- **Ela não é segredo.** Um certificado raiz é material público, e a chave é um booleano.

Deixe-a sem definir em toda implantação que assine qualquer coisa real.

### `Signing:Certificate:Pfx` — quando `Source = Pfx`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:Pfx:Path` | string | `""` | `Signing__Certificate__Pfx__Path` | **REQUIRED a menos que `Blob` esteja definido** — exatamente um dos dois. Caminho absoluto para o arquivo `.pfx`/`.p12`. |
| `Signing:Certificate:Pfx:Password` | string | `""` | `Signing__Certificate__Pfx__Password` | **SECRET.** String vazia é permitida para arquivos de teste sem senha. Prefira a forma por variável de ambiente. |

### `Signing:Certificate:Pkcs11` — quando `Source = Pkcs11`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:Pkcs11:ModulePath` | string | `""` | `Signing__Certificate__Pkcs11__ModulePath` | **REQUIRED.** Caminho absoluto para o driver PKCS#11 do fabricante (`.so`/`.dll`/`.dylib`). |
| `Signing:Certificate:Pkcs11:Thumbprint` | string | `""` | `Signing__Certificate__Pkcs11__Thumbprint` | **REQUIRED.** Thumbprint SHA-1 (hexadecimal, sem espaços) do certificado de assinatura no token. Obrigatório mesmo quando o token contém uma única identidade. |
| `Signing:Certificate:Pkcs11:PinEnvVar` | string | `BULK_SIGNER_PKCS11_PIN` | `Signing__Certificate__Pkcs11__PinEnvVar` | Nome da variável de ambiente que fornece o PIN. O validador impede a inicialização se uma chave `Pin` literal aparecer em `Pkcs11`. |

### `Signing:Certificate:WindowsStore` — quando `Source = WindowsStore`

Somente Windows. Na inicialização, o validador recusa esta origem em hosts que não são Windows.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:WindowsStore:StoreLocation` | string | `CurrentUser` | `Signing__Certificate__WindowsStore__StoreLocation` | `CurrentUser` ou `LocalMachine`. Use `LocalMachine` quando o certificado foi importado para toda a máquina; a conta de serviço não enxerga o repositório `CurrentUser` do operador. |
| `Signing:Certificate:WindowsStore:StoreName` | string | `My` | `Signing__Certificate__WindowsStore__StoreName` | Nome lógico do repositório. `My` é o repositório pessoal. |
| `Signing:Certificate:WindowsStore:Thumbprint` | string | `""` | `Signing__Certificate__WindowsStore__Thumbprint` | **REQUIRED.** Thumbprint SHA-1 (hexadecimal, sem espaços). |

### `Signing:Certificate:AzureKeyVault` — quando `Source = AzureKeyVault`

A chave privada permanece no cofre, e cada assinatura é uma chamada remota de assinatura; o certificado
público correspondente é fornecido separadamente como um `.cer`. `Endpoint`, `AppId`, `AppSecret` e
`KeyName` são sempre obrigatórios, além de **exatamente um** entre `CerPath` (um arquivo neste host) e
[`Blob`](#blob--lendo-o-arquivo-do-azure-blob-storage) (um objeto no Azure Blob Storage). A
inicialização falha indicando cada um que estiver ausente.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:AzureKeyVault:Endpoint` | string | `""` | `Signing__Certificate__AzureKeyVault__Endpoint` | **REQUIRED.** URL do cofre. Precisa ser uma URL `https://` absoluta — um nome DNS puro é recusado na inicialização. |
| `Signing:Certificate:AzureKeyVault:AppId` | string | `""` | `Signing__Certificate__AzureKeyVault__AppId` | **REQUIRED.** ID de aplicativo (client) do registro de aplicativo do Microsoft Entra ID. |
| `Signing:Certificate:AzureKeyVault:AppSecret` | string | `""` | `Signing__Certificate__AzureKeyVault__AppSecret` | **REQUIRED, SECRET.** Client secret do Entra ID. Diferentemente do PIN do PKCS#11, este *é* permitido em arquivo de configuração, mas a forma por variável de ambiente é recomendada. |
| `Signing:Certificate:AzureKeyVault:KeyName` | string | `""` | `Signing__Certificate__AzureKeyVault__KeyName` | **REQUIRED.** Nome do objeto **key** no cofre que executa a assinatura. Um objeto *certificate* do cofre não é aceito. |
| `Signing:Certificate:AzureKeyVault:CerPath` | string | `""` | `Signing__Certificate__AzureKeyVault__CerPath` | **REQUIRED a menos que `Blob` esteja definido** — exatamente um dos dois. Caminho para o `.cer` que contém o certificado público de `KeyName`. O boot falha se sua chave pública não corresponder à chave do cofre. |

### `…:Blob` — lendo o arquivo do Azure Blob Storage

Um host **sem disco local durável** — um container, um App Service, um pod do AKS — não tem onde
guardar um `.pfx` ou um `.cer`. As duas origens que apontam para um arquivo podem, em vez disso,
apontar para um blob.

Disponível em **`Pfx`** (com o `.pfx`, em vez de `Path`) e em **`AzureKeyVault`** (com o `.cer`, em vez
de `CerPath`), no bloco legado e em cada entrada de `Signing:Profiles[]`. Exatamente um entre o caminho
local e este bloco; **os dois definidos, ou nenhum, é recusado no boot.** Nada aqui é herdado da
credencial `AzureKeyVault` ao lado nem de `Storage:AzureFiles`.

Substitua `<SRC>` abaixo por `Pfx` ou `AzureKeyVault`.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:<SRC>:Blob:Url` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__Url` | **REQUIRED quando o bloco está presente.** URL completa do blob, por exemplo `https://contoso.blob.core.windows.net/certificates/signer.cer`. Precisa ser uma URL `https://` absoluta, precisa indicar um container *e* um blob, e **não pode ter query string** — isso seria uma shared access signature, que não é uma credencial aceita. Por causa dessa regra, a URL nunca é secreta e é exibida no banner de inicialização. Qualquer host é aceito, então nuvens soberanas não precisam de chave extra. |
| `Signing:Certificate:<SRC>:Blob:Credential` | enum | *(não definido)* | `Signing__Certificate__<SRC>__Blob__Credential` | **REQUIRED quando o bloco está presente.** Um de `ManagedIdentity`, `ServicePrincipal`, `AccountKey`. **Não tem valor padrão** — usar silenciosamente a identidade Azure do próprio host não é uma decisão que o produto toma por você. |
| `Signing:Certificate:<SRC>:Blob:TenantId` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__TenantId` | **REQUIRED para `ServicePrincipal`.** Obrigatório mesmo quando o `AppId` coincide com o do bloco `AzureKeyVault` — esse bloco não tem chave de tenant, e nada é herdado. |
| `Signing:Certificate:<SRC>:Blob:AppId` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__AppId` | **REQUIRED para `ServicePrincipal`.** Precisa de **Storage Blob Data Reader** no container. |
| `Signing:Certificate:<SRC>:Blob:AppSecret` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__AppSecret` | **REQUIRED para `ServicePrincipal`, SECRET.** Forma por variável de ambiente recomendada. |
| `Signing:Certificate:<SRC>:Blob:AccountKey` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__AccountKey` | **REQUIRED para `AccountKey`, SECRET.** Concede acesso total ao plano de dados da conta inteira e não pode ter o escopo restringido; gera um aviso na inicialização. |

:::danger Com `Pfx`, o blob é a chave de assinatura
Uma chave de conta concede acesso total ao plano de dados da conta de armazenamento inteira, não pode
ter o escopo restringido e não expira. Com `AzureKeyVault`, o blob contém um `.cer` — material público.
Com `Pfx`, ele contém um arquivo PKCS#12, então **uma chave de conta vazada equivale à sua chave de
assinatura.** Prefira `ManagedIdentity`, ou `ServicePrincipal` quando o host conseguir acessar um
tenant.
:::

O arquivo é lido **uma vez, no boot** — um blob renovado exige reiniciar o serviço, exatamente como um
arquivo local renovado. As violações das regras de formato acima (os dois ou nenhum, `Url` ou
`Credential` ausente, uma query string) são recusadas no boot, mas um **blob inacessível ou ilegível
deixa o perfil degradado** e o host rodando: o perfil é identificado no banner de inicialização, no log
durável e no `/api/ready`, os jobs roteados para ele falham com `profile.degraded`, e todos os outros
perfis continuam assinando. Veja [Certificados](certificates.md#lendo-o-arquivo-de-um-blob).

:::warning Mudou na 2.1.0 — um certificado que não abre não impede mais o host de iniciar
Até a 2.0.x, um único perfil cujo certificado não carregasse — um caminho digitado errado, uma senha
errada, um blob ou cofre inacessível — impedia o boot inteiro. Os perfis agora são editados pelo
dashboard, e uma página servida por um host que se recusa a iniciar não serve como caminho de
recuperação; por isso, somente esse perfil fica **degradado**. Corrija o certificado e **reinicie**:
uma chave é aberta uma vez na inicialização e nunca é recarregada.
:::

Veja [Certificados](certificates.md) para os comandos de descoberta de thumbprint, o passo a passo de
configuração no Azure e um detalhamento de cada origem.

## `Signing:Profiles[]` — perfis de assinatura por pasta

Um **perfil de assinatura** agrupa sob um nome todas as decisões por pasta (formato, certificado,
verificação, criptografia, validação de certificado, aprovação). Cada perfil escolhe a pasta monitorada
que o alimenta, **uma pasta por perfil**; o `Storage:Inputs[].Profile` é apenas o dado do seed (carga
inicial) para essa escolha (veja [abaixo](#storageinputsprofile--roteamento-por-pasta)).

:::warning Mudou na 2.1.0 — esta seção é um seed de uso único, não a fonte da verdade
Os perfis de assinatura ficam no **banco operacional**. No **primeiro boot com uma tabela de perfis
vazia**, as chaves abaixo são importadas como linhas; daí em diante, o banco é a referência e **esta
seção é ignorada**. Nada é mesclado, e editá-la depois desse primeiro boot não tem efeito — o log de
inicialização avisa isso, indicando a seção, a cada boot que a encontra ainda preenchida. Mantenha-a se
quiser que uma implantação nova já suba configurada; remova-a quando os perfis estiverem no banco.

Daí em diante, um perfil é consultado, **criado** e editado na página **Perfis de assinatura** do
dashboard — o comportamento (o formato e as opções de ligar/desligar abaixo), a pasta de entrada, a
regra de aprovação e o certificado —, e é **desabilitado** ali, em vez de apagado. É também nessa página
que se confere, depois do primeiro boot, o que o seed importou. Veja [Dashboard](dashboard.md).
:::

**Uma mudança em um perfil armazenado entra em vigor sem reinicialização — exceto a do certificado.**
Toda escrita de perfil é percebida pelo pipeline no polling que ele já faz, então um perfil editado vale
para o próximo job capturado — formato, `Verify`, `Encrypt`, `CheckCNAB240`, `CheckCnab240PaymentDates`,
a pasta de entrada e toda a regra de aprovação — em até um `Pipeline:PollIntervalSeconds`, em todas as
instâncias. Uma mudança de **certificado** é gravada na hora, mas exige **reinicialização**: um perfil
mantém aberto um handle de chave privada, e trocar a chave de um job que está no meio de uma assinatura
não é um risco que valha a pena correr por um campo que muda mais ou menos uma vez por ano. Até a
reinicialização, o perfil fica marcado como aguardando reinício, e a lista de perfis, o banner e a
origem registrada em cada job continuam indicando o certificado de fato em vigor — o que mantém o
registro de auditoria de um job fiel ao que de fato o assinou.

Há dois modos de configuração suportados, e ambos descrevem o que vai para o **seed**:

- **Modo legado** (padrão — `Signing:Profiles[]` omitido ou vazio). Um perfil chamado `default` é
  derivado do bloco `Signing:Certificate` existente mais o `Encryption:Enabled` e gravado como uma linha
  real. Nenhuma mudança de configuração é necessária para uma instalação simples, com um único
  certificado.
- **Modo de perfis** (declare `Signing:Profiles[]`). Cada entrada é um perfil nomeado, com certificado e
  postura próprios. O `Signing:Certificate` é ignorado. Cada entrada é validada como se fosse o bloco
  global de certificado — as mesmas regras de `Pfx` / `Pkcs11` / `WindowsStore` / `AzureKeyVault` se
  aplicam a cada perfil.

**Um perfil com segredo precisa do
[`Signing:ProfileSecretsKey`](#signingprofilesecretskey--a-chave-que-criptografa-os-segredos-dos-perfis-armazenados)
definido antes desse primeiro boot.** Uma senha de PKCS#12, um segredo de aplicativo do Azure Key Vault
ou uma credencial de blob de material de assinatura é criptografado em repouso, e a importação é
recusada em vez de gravá-lo em texto claro.

As regras da tabela abaixo são impostas **sempre que um perfil muda**: no seed, para uma entrada
declarada aqui, e nos formulários do dashboard, para um perfil criado ou editado ali. Um perfil que já
está no banco nunca é revalidado no boot, então uma regra que ficou mais rígida em uma atualização
aparece como um aviso ou um perfil degradado, e não como um host que não inicia.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Profiles[].Name` | string | n/a | `Signing__Profiles__0__Name` | **REQUIRED.** Mesma regex dos nomes de pasta: `^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$`. Único na lista. É por esse nome que o `Storage:Inputs[].Profile` do seed e o `?profile=` de um upload REST se referem ao perfil, e ele aparece em labels de métricas, chips do dashboard e mensagens de auditoria. |
| `Signing:Profiles[].Enabled` | bool | `true` | `Signing__Profiles__0__Enabled` | Se novos arquivos podem ser roteados para este perfil. Um perfil é **desabilitado, nunca apagado**, para que os jobs históricos continuem apontando para uma regra real e os jobs já enfileirados para um perfil desabilitado rodem até o fim. Imposto no ponto de entrada dos arquivos: uma pasta monitorada, um upload, uma nova varredura e uma nova tentativa são todos recusados com `profile.disabled`. Definido na página do perfil depois do primeiro boot; desabilitar ali é **recusado enquanto o perfil é alimentado por uma pasta monitorada**, que é indicada — remova a pasta no mesmo salvamento ou passe-a antes para outro perfil. O `default` não pode ser desabilitado de forma alguma — `Enabled: false` nele causa uma recusa de boot, já que é para ele que vai um upload que não indica perfil. |
| `Signing:Profiles[].Format` | enum | n/a | `Signing__Profiles__0__Format` | **REQUIRED** para todo perfil, exceto o `default`: `Pades`, `Cades` ou `Xades`. Somente o `default` — o perfil para onde vai um upload que não indica perfil — pode deixá-lo sem definir; nesse caso, o formato é detectado arquivo a arquivo, pela extensão. |
| `Signing:Profiles[].Method` | enum | `Local` | `Signing__Profiles__0__Method` | `Local` (assinar com o certificado local configurado) ou `LacunaSigner` (encaminhar ao Lacuna Signer para um participante humano). Um perfil `LacunaSigner` é recusado em um host sem a seção [`Signer`](#signer--conexão-com-o-lacuna-signer). Veja [Integração com o Lacuna Signer](lacuna-signer.md). |
| `Signing:Profiles[].Verify` | bool | `true` | `Signing__Profiles__0__Verify` | Quando falso, o worker não faz a verificação pós-assinatura. O banner de inicialização emite um aviso, para que a postura de baixa confiança fique visível ao operador, e desligá-la pelo dashboard pede confirmação. |
| `Signing:Profiles[].Encrypt` | bool | `false` | `Signing__Profiles__0__Encrypt` | Quando verdadeiro, o worker criptografa a saída assinada com AES-256-GCM. Exige `Encryption:Enabled = true` (o validador recusa a combinação inválida na inicialização). |
| `Signing:Profiles[].ValidateCertificate` | bool | `true` | `Signing__Profiles__0__ValidateCertificate` | Quando falso, o worker não faz a verificação de cadeia / revogação do certificado antes de assinar. O banner de inicialização emite um aviso. O perfil `default` derivado no modo legado usa `false`, preservando o comportamento das instalações anteriores aos perfis. **Precisa ser `false` quando `Method = LacunaSigner`** — não há certificado local a validar. |
| `Signing:Profiles[].PreserveFileExtension` | bool | `false` | `Signing__Profiles__0__PreserveFileExtension` | Quando verdadeiro, a saída assinada mantém a extensão do arquivo original usando o infixo `.signed` no estilo PAdES: o CAdES grava `remessa.signed.rem` em vez de `remessa.rem.p7m`; o XAdES grava `nota.signed.nfe` em vez de `nota.signed.xml`. **Válido somente quando `Format = Cades` ou `Xades`** — a saída PAdES já preserva o `.pdf`, então o validador recusa a flag nesse caso. Use quando um sistema posterior no fluxo (um banco que recebe remessas assinadas, por exemplo) exigir a extensão original. |
| `Signing:Profiles[].SaveAsPem` | bool | `false` | `Signing__Profiles__0__SaveAsPem` | Quando verdadeiro, a assinatura CAdES é gravada codificada em PEM (com o delimitador `-----BEGIN PKCS7-----`) em vez de DER puro, e o nome de saída passa a ser `<nome>.pem` em vez de `<nome>.p7m`. **Válido somente quando `Format = Cades`.** A verificação sempre é feita sobre os bytes DER, antes da codificação PEM; com `Encrypt = true`, o envelope BSENC envolve o texto PEM. Pode ser combinado com `PreserveFileExtension`; nesse caso, o nome segue essa flag, e apenas o conteúdo é PEM. |
| `Signing:Profiles[].CheckCNAB240` | bool | `false` | `Signing__Profiles__0__CheckCNAB240` | Quando verdadeiro, todo arquivo roteado por este perfil é interpretado e validado como uma **remessa** CNAB240 do Banco do Brasil antes de ser assinado. Um arquivo fora do padrão nunca chega ao assinador: o job vai para `Failed` com `ErrorMessage = cnab240.invalid`, a cópia preparada é movida para a pasta de erro, e as violações são registradas no histórico do job e como um evento operacional `Cnab240ValidationFailed`. Aplica-se tanto a `Local` quanto a `LacunaSigner`. A validação é apenas estrutural — veja [Arquivos de pagamento CNAB240](cnab240.md). A correspondência do nome da chave não diferencia maiúsculas de minúsculas, então `CheckCnab240` também funciona. |
| `Signing:Profiles[].CheckCnab240PaymentDates` | bool | `true` | `Signing__Profiles__0__CheckCnab240PaymentDates` | *Novo na 2.15.0.* Lido somente quando `CheckCNAB240` é verdadeiro. Quando verdadeiro (o padrão), uma remessa cuja *Data do Pagamento* mais antiga já passou é recusada na chamada de assinatura com `ErrorMessage = cnab240.payment-date-passed`. Quando falso, esse arquivo é assinado, e o histórico do job e um evento operacional `Cnab240PaymentDateCheckSkipped` registram que ele estava vencido — para um banco que processa pagamentos com data passada no próximo dia útil. A validação estrutural não é afetada. Lido no momento da assinatura e nunca congelado no job, então uma mudança vale já para a próxima assinatura, sem reinicialização, inclusive a de um job retido. Veja [Arquivos de pagamento CNAB240](cnab240.md#datas-de-pagamento-que-já-passaram). |
| `Signing:Profiles[].Approval` | aninhado | ausente | `Signing__Profiles__0__Approval__…` | Opcional. Se presente, os jobs deste perfil ficam retidos em `AwaitingApproval` antes de existir qualquer assinatura. **Válido somente junto com `CheckCNAB240 = true`** — recusado no seed e, depois, recusado nos dois sentidos na página do perfil (não é possível adicionar uma regra de aprovação com a verificação desligada, nem desligar a verificação enquanto houver uma regra). Um job que, mesmo assim, chegue à etapa de aprovação sem a interpretação falha com `approval.content-unmeasured` em vez de ficar retido. Veja abaixo. |
| `Signing:Profiles[].Certificate.*` | aninhado | n/a | `Signing__Profiles__0__Certificate__…` | **REQUIRED quando `Method = Local`**, a menos que o perfil seja sem chave (`Approval.Signers = Approvers`, abaixo). Mesmo formato do bloco global `Signing:Certificate`. Um erro de formato em qualquer entrada — uma chave ausente, um caminho e um blob ao mesmo tempo — impede a inicialização com um erro agregado; um certificado bem formado que **não abre** deixa esse perfil degradado e o host rodando. **Recusado quando `Method = LacunaSigner`.** |
| `Signing:Profiles[].Signer.Name` | string | n/a | `Signing__Profiles__0__Signer__Name` | **REQUIRED quando `Method = LacunaSigner`.** Nome de exibição do participante para quem o Lacuna Signer enviará o documento. |
| `Signing:Profiles[].Signer.Email` | string | n/a | `Signing__Profiles__0__Signer__Email` | **REQUIRED quando `Method = LacunaSigner`.** E-mail do participante — precisa conter `@`. |
| `Signing:Profiles[].Signer.Identifier` | string | n/a | `Signing__Profiles__0__Signer__Identifier` | **REQUIRED quando `Method = LacunaSigner`.** Identificador nacional do participante (CPF no Brasil). |

### `Signing:Profiles[].Approval` — a etapa de aprovação

Se presente, os jobs deste perfil param antes de existir qualquer assinatura e aguardam uma pessoa.
Válido somente junto com `CheckCNAB240 = true` — um aprovador que não pode ver o valor não está
aprovando nada de fato, e o validador recusa a combinação na inicialização. Aplica-se tanto a `Local`
quanto a `LacunaSigner`. Passo a passo completo: [Aprovações](approvals.md).

Como o resto do perfil, o bloco abaixo é dado de seed: depois do primeiro boot, o pool, o quórum, o
prazo de espera e o conjunto de assinantes são editados na página do perfil, e a mudança vale para o
próximo job que ficar retido. Um job já retido mantém a regra congelada nele no momento da retenção,
então editar um pool nunca autoriza nada retroativamente. Remover alguém de um pool revoga
imediatamente o link de aprovador dessa pessoa.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `…Approval.MinimumApprovers` | int | `1` | `Signing__Profiles__0__Approval__MinimumApprovers` | O **quórum**: quantos membros distintos do pool precisam aprovar. No mínimo 1 e não maior que o pool — um quórum maior que o pool nunca pode ser atingido, então todo job ficaria retido para sempre; por isso, o validador o recusa. |
| `…Approval.ExpiresAfter` | TimeSpan | ausente | `Signing__Profiles__0__Approval__ExpiresAfter` | Prazo de espera opcional no formato `d.hh:mm:ss` — `"2.00:00:00"` são quarenta e oito horas. Precisa ser positivo. Um job retido por mais tempo é **cancelado** com o motivo `Approval window expired.`, e a cópia preparada dele é movida para `error/`. Ausente (o padrão), um job retido espera indefinidamente. A janela é medida com base no prazo congelado no job no momento da retenção. É um temporizador de manutenção, não um controle sobre pagamentos vencidos — quem recusa uma remessa cujas datas já passaram é a verificação da data de pagamento. |
| `…Approval.Signers` | string | `ProfileKey` | `Signing__Profiles__0__Approval__Signers` | O **conjunto de assinantes**: de quem são as assinaturas presentes na saída de um job deste perfil — `ProfileKey` (o próprio certificado do perfil, como antes), `Approvers` (cada pessoa que aprova coassina com um certificado próprio) ou `ProfileKeyAndApprovers` (ambos). Um erro de digitação é recusado com a indicação dos três valores. Congelado no job junto com o resto da regra quando ele fica retido. Os dois conjuntos que incluem aprovadores precisam de um **meio de assinatura** neste host — um [`WebPki:License`](#webpki--lacuna-web-pki-no-navegador-do-aprovador) para um certificado no navegador do aprovador, ou o [`CloudHub`](#cloudhub--lacuna-cloudhub-para-certificados-em-nuvem) para um certificado mantido por um provedor em nuvem, e qualquer um dos dois basta — e de uma forma de identificar o aprovador (`ApproverPortal:Enabled` ou uma seção `Auth:EntraId`); são recusados quando falta qualquer um dos dois, e também com qualquer `Format` diferente de `Cades`, já que a assinatura de um aprovador é uma coassinatura CAdES. Além disso, `ProfileKeyAndApprovers` é recusado junto com `Method = LacunaSigner`. Com `Approvers`, o perfil é **sem chave**: o bloco `Certificate` dele não é exigido nem validado, nada é aberto para ele na inicialização, e ele não fica degradado por não ter certificado. Veja [Aprovações](approvals.md). |
| `…Approval.Approvers[]` | array | `[]` | `Signing__Profiles__0__Approval__Approvers__0__…` | **REQUIRED e não vazio** quando `Approval` está presente. O **pool** de pessoas autorizadas a aprovar — *não* uma lista de pessoas que precisam, todas, aprovar. Com três entradas e `MinimumApprovers: 1`, nenhuma pessoa específica é obrigatória. |
| `…Approval.Approvers[].Name` | string | n/a | `…__Approvers__0__Name` | **REQUIRED.** Nome de exibição. É o que o registro de auditoria mostra para este aprovador. |
| `…Approval.Approvers[].Email` | string | n/a | `…__Approvers__0__Email` | **REQUIRED**, precisa conter `@` e ser único dentro do pool (sem diferenciar maiúsculas de minúsculas). Um duplicado permitiria que uma mesma pessoa ocupasse duas vagas do pool e atingisse sozinha um quórum de dois. Mascarado na narração do console e nos logs duráveis; armazenado por inteiro no snapshot de aprovação do job. |
| `…Approval.Approvers[].Cpf` | string | n/a | `…__Approvers__0__Cpf` | **REQUIRED.** Onze dígitos, com ou sem pontuação (`123.456.789-09` e `12345678909` são ambos aceitos). Os dígitos verificadores são validados na inicialização — um erro de digitação identifica outra pessoa, e a linha de auditoria resultante parece tão legítima quanto uma correta. Serve somente para exibição e auditoria: nenhuma lógica depende dele. Mascarado nos logs duráveis. |

:::warning Escreva `ExpiresAfter` com o componente de dias
Um valor de três componentes é `hh:mm:ss` somente enquanto o primeiro número for 23 ou menos; a partir
de 24, o .NET o lê como **dias**, então `"48:00:00"` é interpretado como quarenta e oito *dias* e passa
na verificação de duração positiva. O valor não é recusado — uma janela longa pode ser intencional —,
mas o **banner de inicialização avisa a partir de 24 dias**, citando tanto o valor resolvido
(`expires=1152h`) quanto a grafia que o corrige. O boot é o único momento em que isso pode ser
detectado.
:::

#### Exemplo: um perfil de pagamentos que retém para aprovação

```json
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
      { "Name": "Maria Silva",  "Email": "maria@empresa.com.br", "Cpf": "12345678909" },
      { "Name": "João Souza",   "Email": "joao@empresa.com.br",  "Cpf": "111.444.777-35" },
      { "Name": "Ana Ferreira", "Email": "ana@empresa.com.br",   "Cpf": "52998224725" }
    ]
  }
}
```

O seed recusa, antes que o primeiro job rode — e, depois, a página do perfil recusa ao salvar: um bloco
`Approval` sem `CheckCNAB240`; um pool vazio; um `MinimumApprovers` abaixo de 1 ou maior que o pool; um
e-mail malformado, ou o mesmo e-mail duas vezes; um CPF cujos dígitos verificadores não conferem; um
`ExpiresAfter` não positivo; um conjunto de assinantes com aprovadores em um host sem meio de assinatura
ou sem forma de identificar um aprovador.

:::danger A página de aprovação por job é anônima
A etapa de aprovação é real — um job de fato não é assinado até que pessoas suficientes aprovem —, mas
o `/approve/{jobId}` não exige credencial: qualquer pessoa que consiga acessar o link pode aprovar *ou
rejeitar* em nome de qualquer membro do pool do job. O banner de inicialização emite um aviso para todo
perfil com aprovação configurada, a cada boot. Habilite o [`ApproverPortal`](#approverportal) ou o
[login pelo Entra ID](#authentraid--login-opcional-pelo-microsoft-entra-id) para restringir isso, e
leia [Aprovações](approvals.md#segurança) antes de expor o host a uma rede acessível pelos navegadores
dos aprovadores.
:::

### `Storage:Inputs[].Profile` — roteamento por pasta

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Storage:Inputs[].Profile` | string? | `null` (→ "default") | `Storage__Inputs__0__Profile` | Opcional, e **dado de seed**: lida uma única vez, no primeiro boot com uma tabela de perfis vazia, e aplicada ao perfil que ela indica — a linha do perfil passa então a guardar a pasta, uma pasta por perfil, e a chave é ignorada nos boots seguintes. Nulo ou vazio vincula ao perfil `default`. Uma pasta que o seed não consegue vincular — o perfil dela não está em `Signing:Profiles[]`, ou uma pasta anterior já foi vinculada a esse perfil — fica **sem atribuição**, é informada na inicialização e aparece assim na página **Pastas de entrada** e no `/api/ready`; os arquivos dela esperam até que um perfil a escolha. O host inicia de qualquer forma. |

:::warning Mudou na 2.2.0 — o perfil escolhe a pasta
Até a 2.1.x, era esta chave que roteava uma pasta, e ela era lida a cada boot. Agora o vínculo fica na
linha do perfil no banco operacional. Depois do primeiro boot, uma pasta é roteada, movida ou
desvinculada na página do perfil (**Pasta de entrada**, em **Editar comportamento**) e **somente ali**:
editar esta chave não muda nada, e o log de inicialização avisa isso com uma linha de aviso que conta as
chaves de pasta ignoradas. Uma mudança entra em vigor no próximo arquivo, em todas as instâncias, sem
reinicialização. Mantenha a chave se quiser que uma implantação nova já suba roteada; apague-a quando os
perfis estiverem no banco, e essa linha desaparece.
:::

**Nada mais em `Storage:Inputs[]` mudou de lugar.** `Name`, `Path`, `Provider`, `AzureFiles`,
`PollIntervalSeconds` e as duas listas de itens ignorados são configuração do host: lidas a cada boot,
validadas pelas regras de
[`Storage:Inputs[]`](#storageinputs--regras-de-validação-impostas-na-inicialização) exatamente como
antes, e não editáveis em nenhum lugar da interface web. A única chave que saiu nunca foi uma
característica da pasta — ela dizia qual regra de assinatura os arquivos da pasta recebem, e quem deve
dizer isso é o perfil.

Uma pasta que nenhum perfil escolheu fica **sem atribuição**: o observador dela não enfileira nada, uma
nova varredura a ignora e avisa isso, e os arquivos dela ficam esperando. Um perfil vinculado a uma pasta
que este host não configura mais é informado no banner de inicialização, como uma linha
`profile-input-folder:` no `/api/ready` que não reprova o probe, e como um alerta na página de perfis do
dashboard.

### Exemplo: três perfis roteados por pasta, um por origem de certificado

Os perfis são independentes, então uma única implantação pode misturar modelos de custódia de chave — um
HSM para NF-e, um PFX em disco para contratos e uma chave mantida em cofre para faturas —, com cada pasta
monitorada alimentando o perfil de que precisa. A escolha da pasta passa a ser feita em cada perfil, na
página dele, depois do primeiro boot; a chave `Profile` de cada entrada de `Storage:Inputs[]` define essa
escolha no seed, uma única vez, no mesmo boot que importa estes três perfis.

```json
"Signing": {
  "PkiSdkLicense": "<env-var>",
  "Profiles": [
    {
      "Name": "nfe",
      "Format": "Xades",
      "Verify": true,
      "Encrypt": false,
      "ValidateCertificate": true,
      "Certificate": {
        "Source": "Pkcs11",
        "Pkcs11": { "ModulePath": "/usr/lib/x86_64-linux-gnu/pkcs11/libsofthsm2.so", "Thumbprint": "...", "PinEnvVar": "BULK_SIGNER_PKCS11_PIN" }
      }
    },
    {
      "Name": "contracts",
      "Format": "Pades",
      "Verify": true,
      "Encrypt": true,
      "ValidateCertificate": true,
      "Certificate": {
        "Source": "Pfx",
        "Pfx": { "Path": "/etc/bulksigner/contracts.pfx", "Password": "" }
      }
    },
    {
      "Name": "invoices",
      "Format": "Pades",
      "Verify": true,
      "Encrypt": false,
      "ValidateCertificate": true,
      "Certificate": {
        "Source": "AzureKeyVault",
        "AzureKeyVault": {
          "Endpoint": "https://my-vault.vault.azure.net/",
          "AppId": "8f2c1b3e-1111-2222-3333-444455556666",
          "AppSecret": "",
          "KeyName": "bulk-signer-invoices-key",
          "CerPath": "/etc/bulksigner/certificates/invoices.cer"
        }
      }
    }
  ]
},
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Inputs": [
    { "Name": "nfe-incoming",       "Path": "/var/lib/bulksigner/input-nfe",       "Profile": "nfe" },
    { "Name": "contracts-incoming", "Path": "/var/lib/bulksigner/input-contracts", "Profile": "contracts" },
    { "Name": "invoices-incoming",  "Path": "/var/lib/bulksigner/input-invoices",  "Profile": "invoices" }
  ]
}
```

O perfil `invoices` deixa o `AppSecret` vazio no arquivo e o obtém do ambiente. Elementos de array são
vinculados por **índice posicional**, então o segredo do terceiro perfil é:

```bash
export Signing__Profiles__2__Certificate__AzureKeyVault__AppSecret='…'
```

Como esse perfil tem um segredo, o primeiro boot também precisa de `Signing__ProfileSecretsKey`
definida — a importação criptografa o segredo do aplicativo com ela e é recusada sem ela. Os outros dois
não têm nenhum segredo.

:::warning
Esse índice é posicional, não baseado em nome. Inserir um novo perfil *acima* de `invoices` o desloca
para o índice `3`, a variável de índice `2` deixa de chegar a ele, e o seed falha com
`Signing:Profiles[3].Certificate.AzureKeyVault.AppSecret is required`. Confira novamente todas as
variáveis de ambiente indexadas depois de reordenar a lista. Isso só importa até o seed rodar: depois do
primeiro boot, o segredo fica, criptografado, no perfil armazenado, e alterá-lo — por exemplo, um client
secret rotacionado — é feito na página do perfil (**Editar certificado**), seguido de uma
reinicialização, e não alterando a variável.
:::

O banner de inicialização lista cada perfil resolvido com o formato, a origem do certificado e as flags
de verificação/criptografia/validação de certificado. Perfis com `Verify=false` ou
`ValidateCertificate=false` emitem avisos adicionais, para que a postura de baixa confiança fique
registrada nos logs duráveis. Um perfil cujo certificado não abriu é listado com o prefixo
`DEGRADED · ` e o motivo ao lado.

## `Signer` — conexão com o Lacuna Signer

Um tenant do Lacuna Signer por host — o endpoint e a chave de API são globais, não por perfil. O
validador **só se ativa se esta seção existir**: se ela for totalmente omitida, nada aqui é exigido, que
é o caso de uma implantação somente local. Se qualquer parte dela for definida, o bloco inteiro é
validado, porque um bloco configurado pela metade é uma implantação que só descobriria a falha no
primeiro envio ao Lacuna Signer. Veja [Integração com o Lacuna Signer](lacuna-signer.md).

:::warning Mudou na 2.1.0 — a seção é avaliada por si só, não pelos perfis existentes
Até a 2.0.x, estas chaves só eram exigidas quando alguma entrada de `Signing:Profiles[]` tinha
`Method = LacunaSigner` — uma pergunta que a configuração não consegue mais responder, já que os perfis
ficam no banco operacional. Agora a exigência fica no perfil: **um perfil que seleciona
`Method = LacunaSigner` é recusado — no seed ou na página do perfil — quando esta seção está ausente.**
O mesmo fato decide se o worker de polling do assinador remoto roda, então um host com estas
configurações está pronto para receber, depois do boot, um perfil apontado para o Lacuna Signer, sem
reinicialização. Duas consequências na atualização: um **bloco `Signer:` preenchido pela metade agora
impede o boot** mesmo que nada o use (a mensagem indica as duas chaves e sugere remover a seção como
solução), e um host com o bloco inteiro definido, mas sem nenhum perfil que o use, agora roda o worker de
polling ocioso. Remova a seção se este host assina tudo localmente.
:::

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signer:Endpoint` | string | `""` | `Signer__Endpoint` | **REQUIRED** quando algum perfil usa `LacunaSigner`. URL base da instância do Lacuna Signer. Padrão na nuvem: `https://signer.lacunasoftware.com`. Implantações *on-premises* apontam para a instância do cliente. |
| `Signer:ApiKey` | string | `""` | `Signer__ApiKey` | **REQUIRED, SECRET** quando algum perfil usa `LacunaSigner`. Formato esperado: `application-id\|secret`. O valor literal é removido dos logs. |
| `Signer:PollIntervalSeconds` | int | `30` | `Signer__PollIntervalSeconds` | Com que frequência o worker de polling percorre cada linha `AwaitingSigner`. Faixa válida: 1–3600. |
| `Signer:TimeoutHours` | int | `168` (7 dias) | `Signer__TimeoutHours` | Quanto tempo um job pode ficar em `AwaitingSigner` antes de falhar com `code = signer.timeout`. Faixa válida: 1–8760. |
| `Signer:MaxConsecutiveApiFailures` | int | `5` | `Signer__MaxConsecutiveApiFailures` | Limite de erros transitórios consecutivos por documento antes de o worker de polling desistir desse documento. Contador em memória — reiniciar o serviço o zera. |

## `WebPki` — Lacuna Web PKI no navegador do aprovador

Um aprovador que coassina um arquivo de pagamento (em um perfil cujo
[conjunto de assinantes](#signingprofilesapproval--a-etapa-de-aprovação) é `Approvers` ou
`ProfileKeyAndApprovers`) pode fazer isso com um certificado no próprio token ou no próprio repositório
de certificados, por meio da extensão de navegador Lacuna Web PKI. A biblioteca que se comunica com a
extensão acompanha o produto e nunca é carregada de uma CDN, então um aprovador em uma LAN sem acesso à
internet ainda recebe a página. O que o Web PKI precisa do host é uma **licença vinculada aos domínios
da implantação**, e é nesta seção que ela fica.

**A licença não é segredo.** Ela é enviada em texto claro ao navegador de todo aprovador, que é onde o
Web PKI a confere com o domínio da página; por isso, ela deliberadamente não é mascarada nos logs. Todos
os lugares que a informam dizem apenas se está configurada ou não, sem exibi-la: a linha
`web pki license` do banner de inicialização e a página **Sistema**.

**Ela também não causa recusa de boot.** A regra fica onde ficam todas as regras de perfil — no seed e
na página do perfil: um perfil cujo conjunto de assinantes inclui aprovadores é recusado, com a
indicação desta chave e do `CloudHub:ApiKey`, enquanto **nenhum dos dois** estiver configurado. Uma
licença (um certificado no navegador) ou o
[`CloudHub`](#cloudhub--lacuna-cloudhub-para-certificados-em-nuvem) (um certificado na nuvem) é um
*meio de assinatura*, e basta um dos dois. Uma implantação cujos conjuntos de assinantes são todos
`ProfileKey` não precisa de nenhuma seção `WebPki`. Em `localhost`, o Web PKI funciona sem licença.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `WebPki:License` | string | `""` | `WebPki__License` | Obrigatória para um perfil em que os aprovadores assinam, a menos que o `CloudHub` esteja configurado no lugar dela. Qualquer uma das duas formas que a Lacuna emite — a string binária (base64) ou o documento JSON —, repassada ao navegador sem alteração. Vinculada aos domínios da implantação: solicite-a à Lacuna para os nomes de host em que os aprovadores vão abrir a página. Deliberadamente **não** marcada como SECRET. |

```json
{
  "WebPki": {
    "License": "<a licença que a Lacuna emitiu para os domínios desta implantação>"
  }
}
```

## `CloudHub` — Lacuna CloudHub para certificados em nuvem

Um aprovador cujo certificado ICP-Brasil foi emitido no HSM de um provedor — um *certificado em nuvem* —
não tem nada que um navegador consiga acessar, então o Web PKI não consegue assinar por ele. O Lacuna
CloudHub reúne esses provedores atrás de uma única API: o produto abre uma sessão para o CPF do
aprovador, envia o navegador dele ao provedor que ele escolher, recebe-o de volta no endereço desta
própria implantação e assina o arquivo servidor a servidor com o certificado que o provedor autenticou.
É esta seção que faz esse meio de assinatura existir em um host; sem chave, nenhuma página o oferece, e
a rota de retorno dele fica inacessível.

**Ele atende a um lote tão bem quanto a um arquivo.** Desde a 2.14.0, o **Aprovar N selecionados** do
portal do aprovador oferece a nuvem ao lado do navegador — e sozinha, em um host sem licença do Web PKI —,
com um único login no provedor para o lote inteiro. Nada aqui precisa ser configurado à parte para isso.

**A chave é o que liga o recurso, e ela é segredo.** Diferentemente da licença do Web PKI, o
`CloudHub:ApiKey` é uma credencial ao portador para toda sessão que este host abre, então ela é mascarada
em todos os logs. Defina-a pela variável de ambiente. O validador **só se ativa se a chave existir**: se
ela for omitida, nada aqui é exigido; se for definida, a seção inteira é validada.

**O `PublicBaseUrl` é obrigatório junto com a chave, e é configurado em vez de derivado.** O CloudHub
precisa de um endereço absoluto para onde devolver o navegador, e este produto gera todos os outros
links relativos à requisição. Derivar o endereço de headers encaminhados foi descartado: um endereço
derivado errado só é descoberto quando um aprovador fica preso no provedor, enquanto um endereço
configurado errado é recusado no boot. Informe o esquema, o host e o prefixo de caminho, se houver, em
que os aprovadores abrem o portal, sem query e sem fragmento.

**Ele não causa recusa de boot para um perfil.** Um perfil em que os aprovadores assinam precisa desta
seção ou de uma licença do Web PKI, e qualquer uma das duas basta; essa regra é verificada no seed e na
página do perfil. Um host com CloudHub e sem licença do Web PKI é uma implantação legítima em que todo
aprovador assina na nuvem. Nada testa o CloudHub no boot nem no `/api/ready`: a linha `cloudhub` do
banner de inicialização, a página **Sistema** e o `/api/ready/details` dizem apenas se está configurado
ou não, indicando o endpoint, e uma indisponibilidade do lado da Lacuna nunca altera a prontidão deste
host.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `CloudHub:ApiKey` | string | `""` | `CloudHub__ApiKey` | **SECRET.** A chave de API do CloudHub que a Lacuna emitiu para esta implantação. É ao defini-la que o meio de assinatura em nuvem passa a ser oferecido. |
| `CloudHub:Endpoint` | string | `https://cloudhub.lacunasoftware.com/` | `CloudHub__Endpoint` | Onde o CloudHub está. Omita para usar a instância pública da Lacuna. Precisa ser uma URL `http(s)` absoluta quando a chave está definida. |
| `CloudHub:PublicBaseUrl` | string | `""` | `CloudHub__PublicBaseUrl` | **REQUIRED quando `ApiKey` está definida.** O endereço absoluto pelo qual os aprovadores acessam esta implantação — esquema, host e prefixo de caminho, sem query, sem fragmento —, para onde o CloudHub devolve o navegador. Recusado no boot quando relativo ou malformado. |

```json
{
  "CloudHub": {
    "ApiKey": "<defina via CloudHub__ApiKey; nunca neste arquivo>",
    "PublicBaseUrl": "https://bulksigner.example.com"
  }
}
```

Os modelos de arquivo de ambiente do pacote de implantação (`deploy/linux/bulksigner.env.sample`,
`deploy/docker/.env.sample`) trazem uma linha `CloudHub__ApiKey=` comentada exatamente para isso.

## `Encryption`

Desligada por padrão. O validador só roda quando `Enabled = true`.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Encryption:Enabled` | bool | `false` | `Encryption__Enabled` | Chave geral. Quando verdadeira, o worker criptografa o artefato assinado com AES-256-GCM entre a verificação e a promoção. |
| `Encryption:Password` | string | `""` | `Encryption__Password` | **SECRET.** Senha do PBKDF2. Permitida na configuração (use `appsettings.Production.json`, que está no gitignore), mas a forma por variável de ambiente é preferível. |
| `Encryption:PasswordEnvVar` | string | `BULK_SIGNER_ENCRYPTION_PASSWORD` | `Encryption__PasswordEnvVar` | Nome da variável de ambiente que fornece a senha. Se não estiver vazia no boot, ela prevalece sobre `Encryption:Password`. |
| `Encryption:Salt` | string | `""` | `Encryption__Salt` | **REQUIRED** quando `Enabled = true`. Salt do PBKDF2 codificado em base64; decodificado, precisa ter pelo menos 16 bytes. Salts não são secretos. Mudar o salt invalida todos os envelopes anteriores. |
| `Encryption:Iterations` | int | `600000` | `Encryption__Iterations` | Contagem de iterações do PBKDF2-HMAC-SHA256. Rejeitada abaixo de `10000`. |

:::danger
A perda da senha é **irrecuperável** — não há endpoint de descriptografia no servidor nem custódia de
chaves. Veja [Criptografia](encryption.md).
:::

## `Auth`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Auth:ApiKey` | string | `""` | `Auth__ApiKey` | **REQUIRED, SECRET.** Chave de API estática, com no mínimo 16 caracteres. Enviada no header `X-API-Key` por clientes programáticos; colada em `/login` por operadores para receber um cookie. Desde a 2.3.1, o `appsettings.json` distribuído não traz valor para ela, então toda implantação precisa definir a própria chave. |
| `Auth:CookieName` | string | `lbs-auth` | `Auth__CookieName` | Nome do cookie emitido por `/api/auth/login`. `SameSite=Strict`, `HttpOnly`, marcado como seguro quando a requisição foi HTTPS. |
| `Auth:ApiKeyHeader` | string | `X-API-Key` | `Auth__ApiKeyHeader` | Header HTTP lido pelo esquema de chave de API. Renomeie apenas se uma convenção de proxy reverso exigir. |

Veja [Segurança](security.md) sobre a rotação da chave de API e o tempo de vida da sessão em cookie.

### `Auth:EntraId` — login opcional pelo Microsoft Entra ID

**Ativado pela presença — não há flag `Enabled`.** Se a seção for omitida (o padrão), tudo se comporta
exatamente como sem ela; uma implantação isolada da rede nunca precisa de um tenant da Microsoft. Se a
seção for escrita, as três chaves passam a ser obrigatórias: uma seção parcialmente preenchida **impede
o boot do host**, indicando a chave ausente. Tratar "presente, mas vazio" silenciosamente como
*desligado* é exatamente o que leva um operador a acreditar que um controle está ativo quando não está.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Auth:EntraId:TenantId` | string | *(ausente)* | `Auth__EntraId__TenantId` | **REQUIRED quando a seção está presente.** O GUID do diretório (tenant), ou um domínio verificado (por exemplo, `contoso.onmicrosoft.com`). Os pseudo-tenants multi-tenant `common` / `organizations` / `consumers` são recusados — o modo é de tenant único por design. |
| `Auth:EntraId:ClientId` | string | *(ausente)* | `Auth__EntraId__ClientId` | **REQUIRED quando a seção está presente.** O ID de aplicativo (client) do registro de aplicativo. Precisa ser um GUID válido — caso contrário, um erro de digitação aqui só apareceria no momento do login, como um erro `AADSTS` pouco claro. |
| `Auth:EntraId:ClientSecret` | string | *(ausente)* | `Auth__EntraId__ClientSecret` | **REQUIRED quando a seção está presente, SECRET.** O client secret do cliente confidencial para o fluxo de authorization code. Defina-o pela variável de ambiente; nunca o versione. |

Não há uma quarta chave. A authority, o caminho de callback, os escopos, o cookie e o tempo de vida dele
são todos derivados.

#### O que muda ao ativar o login pelo Entra ID

| Onde | Seção ausente (padrão) | Seção presente |
|------------|------------------------|----------------|
| `/login` | Formulário de chave de API | Botão **Entrar com a Microsoft**. O formulário de chave de API deixa de aparecer. |
| `POST /api/auth/login` | Troca a chave de API por um cookie | **Não emite cookie nem para uma chave correta.** Desligado, não apenas escondido. |
| Cookies de operador existentes | Válidos durante a janela deslizante de 8 horas | **Deixam de atender às políticas imediatamente.** Planeje a transição como um "desconectar todo mundo". |
| REST `X-API-Key` | Funciona | **Inalterado.** Clientes automatizados nunca percebem o modo. |
| Páginas de operador | Qualquer cookie autenticado | Exige a app role `Administrator`. |
| `/approvals` e a página de aprovação por job | Somente o link do portal do aprovador | Link **ou** uma sessão com a role `Approver`; o pool congelado continua determinando quais jobs ficam visíveis. |
| Identificação registrada na aprovação | `SelfDeclaredEmail` / `LinkDerivedEmail` | Acrescenta `EntraIdEmail` para decisões tomadas em uma sessão do Entra. |
| Sair | Limpa o cookie | Limpa somente a sessão **do Bulk Signer**. A sessão da Microsoft continua ativa, então clicar em "entrar" de novo funciona sem pedir credenciais — comportamento normal de SSO, não um defeito. |

#### As duas app roles

As roles vêm das claims de role do token — atribuições de app role e nada mais. Deliberadamente, não há
mapeamento por grupo de segurança: com ele, editar um grupo no tenant seria uma mudança de autorização
invisível. Os valores no manifesto do registro de aplicativo precisam coincidir exatamente com estas
strings:

| Valor da role | Dá acesso a | Página de destino após o login |
|---------------|------|-------------------------------|
| `Administrator` | Todas as páginas e ações de operador que o cookie de chave de API concede hoje. Sem níveis. | `/` |
| `Approver` | Somente as telas de aprovação. A role dá acesso, mas o **pool congelado ainda decide quais jobs** a pessoa vê, com base na claim de e-mail. | `/approvals` |
| *(ambas)* | Ambas. É permitido acumular as duas funções; a segregação de funções é garantida pelas verificações de role. | `/` |
| *(nenhuma)* | Nada. Uma conta que se autentica, mas não tem nenhuma role, é **recusada** em `/access-denied`. | — |

Um `returnUrl` validado sempre prevalece sobre o destino baseado em role, então os deep links continuam
funcionando.

#### Como uma pessoa conectada é identificada

**O nome registrado do operador é o UPN.** Todo evento de auditoria gravado por um `Administrator`
conectado — um perfil criado ou editado, o pipeline pausado, jobs limpos, um backup executado — traz a
claim `preferred_username` do token, e o menu do usuário mostra o mesmo valor. Usa-se o UPN em vez do
nome de exibição porque ele é único no tenant em qualquer momento, enquanto o nome de exibição é texto
livre que duas pessoas podem compartilhar. É o nome no momento da ação, não uma chave durável. Um token
sem `preferred_username` ainda consegue entrar, e os eventos dele aparecem como `(anonymous)`; o login
registra um aviso com os tipos de claim recebidos. Isso vale só para o nome do operador — os aprovadores
continuam sendo associados aos pools pelo e-mail, como descrito acima.

**Um aprovador do Entra é cumprimentado pelo nome de exibição.** A saudação do portal mostra a claim
`name` do token e, quando o tenant não a envia, o endereço de e-mail — nunca o UPN, que, para um
convidado, tem a forma `#EXT#`. Em qualquer caso, a decisão é registrada com o e-mail.

**A janela do segundo fator acompanha a sessão do tenant.** Quando
[`ApproverSecondFactor:Enabled`](#approversecondfactor) está ligado, a janela de verificação de um
aprovador do Entra é indexada pela claim `sid` do token, uma claim padrão do ID token que não exige
mudança no registro de aplicativo; quando um token não a traz, o login gera um identificador e registra
o motivo. **Sair apaga a janela da sessão**, porque a sessão do tenant sobrevive ao logout local do
produto, e o novo login silencioso de um colega na mesma estação de trabalho a herdaria.

:::note Atualizando de uma versão anterior à 2.2.1
Uma sessão do dashboard aberta durante a atualização para a 2.2.1 ou posterior mantém o ticket antigo,
que não leva a identidade do operador para dentro da página. **Saia e entre de novo uma vez** depois de
atualizar.
:::

#### Exemplo — configuração mínima

```json
{
  "Auth": {
    "ApiKey": "…",
    "EntraId": {
      "TenantId": "11112222-3333-4444-5555-666677778888",
      "ClientId": "99990000-aaaa-bbbb-cccc-ddddeeeeffff",
      "ClientSecret": ""
    }
  }
}
```

```bash
Auth__EntraId__ClientSecret='<o client secret do registro de aplicativo>'
```

`Auth:ApiKey` continua obrigatória — este modo não afeta o `X-API-Key` da API REST. As três chaves do
Entra também podem ser definidas somente pelo ambiente, que é a forma natural para um container ou uma
unit do systemd. O passo a passo do registro de aplicativo está em
[Instalação](installation.md#login-pelo-microsoft-entra-id-opcional).

## `Storage`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Storage:Root` | string | `data` | `Storage__Root` | **REQUIRED.** Raiz na qual `processing/`, `output/`, `error/`, `db/` e `logs/` são criados. Sobrescreva conforme o alvo — `/var/lib/bulksigner` no Linux, `C:\ProgramData\Lacuna\BulkSigner\data` no Windows, `/var/lib/bulksigner` no Docker. |
| `Storage:Provider` | enum | `LocalFileSystem` | `Storage__Provider` | `LocalFileSystem` ou `AzureFiles`. Define onde fica o **compartilhamento de trabalho** — `processing/`, `output/`, `error/`. `logs/` e `db/` sempre ficam locais. Veja abaixo. |
| `Storage:Inputs[]` | array de `{Name, Path, Provider?, AzureFiles?, PollIntervalSeconds?, IgnoredExtensions?, IgnoredPrefixes?, Profile?}` | `[{Name="default", Path="{Root}/input"}]` | `Storage__Inputs__0__Name`, `Storage__Inputs__0__Path`, … | Uma ou mais pastas de entrada monitoradas. Os jobs são marcados com o `Name` da pasta e com o perfil de assinatura que escolheu a pasta; uma pasta que nenhum perfil escolheu fica *sem atribuição* e não enfileira nada. Veja abaixo as regras de validação, e [`Storage:Inputs[].Profile`](#storageinputsprofile--roteamento-por-pasta) para o que o seed faz com a única chave de roteamento. |

### `Storage:Inputs[]` — regras de validação (impostas na inicialização)

- `Name` precisa corresponder a `^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$` e ser único na lista —
  somente letras minúsculas, dígitos e hifens internos, de 1 a 40 caracteres, começando e terminando com
  caractere alfanumérico. Os nomes aparecem em query strings de URL, labels de métricas e na interface
  do dashboard.
- `Path` não pode ser vazio e precisa resolver para um diretório que **não seja igual** ao caminho de
  nenhuma outra entrada, **nem subdiretório ou diretório pai** dele. Pastas sobrepostas causariam
  enfileiramento duplicado e atribuição ambígua.
- Limite recomendado: 16 entradas. Mais do que isso infla a cardinalidade das métricas e deixa a página
  **Pastas de entrada** densa demais para ser útil.
- Quando `Storage:Inputs` é omitido por completo, o serviço cria uma pasta chamada `default` em
  `{Storage:Root}/input`.

### `Storage:Provider` / `Storage:AzureFiles` — o compartilhamento de trabalho

Opcional, e ausente de toda implantação que mantém o armazenamento local. Definir
`Storage:Provider = AzureFiles` move o **compartilhamento de trabalho** — `processing/`, `output/` e
`error/` — para um compartilhamento do Azure Files acessado pelo SDK do próprio serviço, sem montagem
SMB e sem dependência no nível do host. O `Storage:Root` continua local e segue guardando `logs/` e
`db/`.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Storage:AzureFiles:AccountName` | string | n/a | `Storage__AzureFiles__AccountName` | **REQUIRED** quando um provider resolve para `AzureFiles`. Nome da conta sem sufixo; o endpoint é `https://<AccountName>.file.core.windows.net`. |
| `Storage:AzureFiles:ShareName` | string | n/a | `Storage__AzureFiles__ShareName` | **REQUIRED.** O compartilhamento de trabalho. Somente protocolo SMB — um compartilhamento NFS é recusado no boot, **com a indicação do nome**. |
| `Storage:AzureFiles:Directory` | string? | `null` (raiz do compartilhamento) | `Storage__AzureFiles__Directory` | Prefixo opcional dentro do compartilhamento, no qual `processing/`, `output/` e `error/` são criados. Permite que várias implantações usem o mesmo compartilhamento. **Somente para o compartilhamento de trabalho** — defini-lo em uma entrada de `Storage:Inputs[]` é recusado no boot, porque o diretório de uma pasta é o `Path` dela. |
| `Storage:AzureFiles:Credential` | enum | n/a | `Storage__AzureFiles__Credential` | **REQUIRED** e sem valor padrão. `ManagedIdentity`, `ServicePrincipal` ou `AccountKey`. Um bloco parcial para o modo escolhido impede o boot do host, indicando a chave ausente. |
| `Storage:AzureFiles:TenantId` / `:AppId` | string | n/a | `Storage__AzureFiles__TenantId`, `…__AppId` | Somente no modo `ServicePrincipal`. |
| `Storage:AzureFiles:AppSecret` | string | n/a | `Storage__AzureFiles__AppSecret` | **SECRET.** Somente no modo `ServicePrincipal`. Permitido na configuração; override por ambiente recomendado. |
| `Storage:AzureFiles:AccountKey` | string | n/a | `Storage__AzureFiles__AccountKey` | **SECRET.** Somente no modo `AccountKey`. **Gera aviso na inicialização**: uma chave compartilhada dá acesso total ao plano de dados da conta inteira, não pode ser restrita a um compartilhamento e nunca expira. |

O `ManagedIdentity` aceita **somente a identidade atribuída pelo sistema** — uma identidade atribuída pelo
usuário não é lida, e indicar uma causa uma falha de autenticação na primeira chamada, e não um erro de
configuração. Deliberadamente, a credencial não é `DefaultAzureCredential`, então nunca recorre à
identidade do `az login` de um desenvolvedor.

Os dois modos com token precisam de uma das roles de **dados de arquivo privilegiados**: conceda
`Storage File Data Privileged Contributor`, com escopo no compartilhamento. Uma role somente leitura
**não** basta nem para uma pasta de entrada, já que o pipeline obtém um lease do arquivo de entrada
enquanto o copia para processamento e o apaga após a verificação. Veja
[Segurança](security.md#credenciais-de-armazenamento-do-azure-files).

**Um compartilhamento de trabalho, não vários.** `processing/`, `output/` e `error/` precisam ficar
juntos, porque promover um artefato verificado e mover a cópia preparada de um job que falhou são
operações de **renomeação**, e a renomeação do Azure não funciona entre compartilhamentos nem entre
contas de armazenamento. As pastas de entrada continuam sendo várias e independentes — cada uma pode
indicar a própria conta e o próprio compartilhamento —, porque copiar para processamento a partir de uma delas é
uma *cópia*.

**O que a inicialização recusa e o que ela apenas informa.** Um provider ou modo de credencial não
reconhecido, um bloco de credencial parcial, um compartilhamento NFS, um caminho `azurefiles://` em
`Storage:Root`, em `Logging:File:Path` ou — enquanto `Database:Provider` for `Sqlite` — em
`ConnectionStrings:Default`, e uma pasta de entrada que colida com uma das raízes de trabalho no
compartilhamento de trabalho: tudo isso **impede o host de iniciar**. Um compartilhamento
**inacessível**, não: ele é informado no console de operação, na página **Sistema** e pelo
`/api/ready`, e o host sobe — um compartilhamento fora do ar às 3h não pode transformar uma
reinicialização em um serviço que não inicia.

:::note Um quarto item aparece no compartilhamento de trabalho, e não é uma pasta
O `bulksigner-instance.json` fica ao lado de `processing/`, `output/` e `error/`. Ele registra o nome
do host e o ID do processo da instância que assumiu o compartilhamento, e é mantido sob um lease sem
expiração durante toda a vida dessa instância. Não mexa nele: é ele que avisa, no próximo boot, que uma
segunda instância está assinando a partir deste compartilhamento. Veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho).
:::

Os downloads sempre passam em streaming pela aplicação — nenhuma URL de shared access signature é
criada para um artefato assinado, então o `GET /api/jobs/{id}/output` se comporta da mesma forma,
qualquer que seja o provider que guarda `output/`. Deliberadamente, não há ajuste de repetição: a
política do SDK está definida no código (três tentativas, backoff exponencial de 500 ms a 5 s, timeout
de rede de 30 segundos), e este produto já faz novas tentativas acima dela.

#### Overrides por pasta

Cada pasta de entrada monitorada escolhe o próprio provider e herda o resto, de modo que ler o
compartilhamento de um cliente na conta *dele*, enquanto o compartilhamento de trabalho fica na sua, é
um override por pasta, e não uma segunda implantação.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Storage:Inputs[N].Provider` | enum? | herda `Storage:Provider` | `Storage__Inputs__N__Provider` | `LocalFileSystem` ou `AzureFiles`, por pasta. Uma pasta pode ler um compartilhamento enquanto outra continua em disco local durante uma migração. |
| `Storage:Inputs[N].Path` | string | n/a | `Storage__Inputs__N__Path` | **REQUIRED.** Um caminho de sistema de arquivos em uma pasta local; em uma pasta `AzureFiles`, o **diretório dentro do compartilhamento**, separado por `/`. Uma barra invertida é recusada no boot — é um separador local sem significado em um compartilhamento. |
| `Storage:Inputs[N].AzureFiles:*` | objeto | herda `Storage:AzureFiles` campo a campo | `Storage__Inputs__N__AzureFiles__AccountName`, … | Os mesmos membros do bloco acima, exceto `Directory`. A herança verifica **nulo, não vazio**: uma chave omitida é herdada, e uma string vazia significa que esta pasta não tem esse valor. O `Directory` é **recusado** aqui. |
| `Storage:Inputs[N].PollIntervalSeconds` | int? | herda `WatchedFolder:PollIntervalSeconds` | `Storage__Inputs__N__PollIntervalSeconds` | **Na prática, REQUIRED em uma pasta `AzureFiles`** — uma pasta que não resolva para nenhum intervalo é recusada no boot. Em uma pasta **local**, *a presença da chave é a ativação*: definir um intervalo acrescenta enumeração periódica ao comportamento do observador dessa pasta, que é a solução para uma pasta montada a partir de um compartilhamento de rede. Faixa válida: 5–3600. |

:::info Se uma pasta faz polling e com que frequência são duas questões separadas
É a presença de `Storage:Inputs[N].PollIntervalSeconds` que ativa o polling em uma pasta *local*; o
`WatchedFolder:PollIntervalSeconds` global (padrão `30`) é consultado apenas para a **frequência**.
Uma implantação local existente que não define intervalo por pasta mantém inalterado o comportamento
orientado a eventos.
:::

#### Exemplo: o compartilhamento de trabalho no Azure Files, entradas ainda locais

```json
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Provider": "AzureFiles",
  "AzureFiles": {
    "AccountName": "contosofiles",
    "ShareName": "bulksigner",
    "Directory": "prod",
    "Credential": "ManagedIdentity"
  },
  "Inputs": [
    { "Name": "default", "Path": "/var/lib/bulksigner/input", "Provider": "LocalFileSystem" }
  ]
}
```

Os artefatos assinados vão para `bulksigner/prod/output` na conta `contosofiles`; `logs/` e `db/`
ficam em `/var/lib/bulksigner`. Se você remover a linha `Provider` da pasta de entrada, ela herda
`AzureFiles`; nesse caso, o `Path` dela passa a ser um diretório dentro do compartilhamento, e ela é
enumerada a cada `WatchedFolder:PollIntervalSeconds` — o Azure Files não publica notificações de
mudança, então uma pasta que não resolva para nenhum intervalo é recusada no boot.

#### Exemplo: pastas de entrada também em um compartilhamento, autenticando com chave de conta

Para um host que não tem nenhum acesso ao tenant — um servidor *on-premises* sem identidade gerenciada
e sem registro de aplicativo —, o `AccountKey` é o modo que resta:

```json
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Provider": "AzureFiles",
  "AzureFiles": {
    "AccountName": "contosofiles",
    "ShareName": "bulksigner",
    "Credential": "AccountKey"
  },
  "Inputs": [
    { "Name": "remessas", "Provider": "AzureFiles", "Path": "entrada/remessas", "PollIntervalSeconds": 30 },
    { "Name": "contabil", "Path": "entrada/contabil", "AzureFiles": { "ShareName": "financeiro" }, "PollIntervalSeconds": 300 },
    { "Name": "legacy",   "Provider": "LocalFileSystem", "Path": "/mnt/legacy/incoming" }
  ]
}
```

```bash
Storage__AzureFiles__AccountKey=<chave da conta de armazenamento>   # variável de ambiente recomendada; nunca versione
```

Cinco pontos que este exemplo mostra:

- **A chave é um segredo para todos os compartilhamentos que ela abre.** `contabil` sobrescreve
  `ShareName` e nada mais, então `AccountName`, `Credential` e a chave são herdados campo a campo.
  Escrever `"AccountKey": ""` em uma pasta significa que essa pasta *não* tem chave, e não um pedido
  para herdar uma.
- **O `AccountKey` gera um aviso a cada boot**, no console de operação e no log durável, indicando cada
  compartilhamento que ele abre.
- **Sem prefixo `Directory`, as raízes de trabalho ficam na raiz do compartilhamento.** As pastas de
  entrada podem ficar no compartilhamento de trabalho, mas uma entrada cujo `Path` *seja* uma das três
  raízes, fique dentro dela ou a contenha é recusada no boot — caso contrário, essa colisão apagaria um
  artefato assinado a cada iteração, enquanto informaria todos os jobs como `Completed`.
- **As duas pastas remotas definem o próprio intervalo, e a local deliberadamente não define nenhum.**
  É por não definir intervalo que o `legacy` continua orientado a eventos.
- **O banner confirma**, exibindo `azure credential = AccountKey`,
  `work share = contosofiles/bulksigner`, os providers por pasta e `azure shares = 2 reachable` — os
  compartilhamentos são testados separadamente, então uma chave que abre um e não o outro fica visível
  na inicialização.

### `Storage:Inputs[].IgnoredExtensions` / `Storage:Inputs[].IgnoredPrefixes` (por pasta)

Arrays opcionais. A lista efetiva de itens ignorados é a **união** da lista base global
`WatchedFolder:IgnoredExtensions` / `WatchedFolder:IgnoredPrefixes` com os acréscimos por pasta. As
listas por pasta *se somam* à lista base; elas não conseguem desfazer o filtro de algo que a lista
global já filtra. Exemplo: com a lista base padrão (`.tmp`, `.part`, `.crdownload`, `.swp`), uma pasta
que declara `IgnoredExtensions: [".bak"]` filtra `.bak` *e* `.tmp` etc.

### Exemplo: duas pastas, uma com uma regra extra de ignorados

```json
"Storage": {
  "Root": "/var/lib/bulksigner",
  "Inputs": [
    { "Name": "default", "Path": "/var/lib/bulksigner/input" },
    {
      "Name": "legal",
      "Path": "/mnt/legal/incoming",
      "IgnoredExtensions": [".bak"]
    }
  ]
}
```

## `Pipeline`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Pipeline:PollIntervalSeconds` | int | `2` | `Pipeline__PollIntervalSeconds` | Com que frequência o worker consulta a fila quando está ocioso. Menor = captura mais rápida, mais leituras no SQLite. Faixa válida: 1–3600. |
| `Pipeline:MaxConcurrency` | int | `1` | `Pipeline__MaxConcurrency` | Limite máximo de jobs simultâneos em andamento. O padrão `1` é sequencial. Aumente para ganhar vazão em implantações com PFX. Faixa válida: 1–32. **PKCS#11 / WindowsStore: mantenha em 1, a menos que o token / CSP permita sessões simultâneas — veja [Certificados](certificates.md).** |
| `Pipeline:RejectAlreadyProcessedFileNames` | bool | `true` | `Pipeline__RejectAlreadyProcessedFileNames` | *Novo na 2.13.0, ligado por padrão.* Recusa um arquivo cujo **nome** já pertence a um job `Completed` ou ainda ativo — a comparação vale para o host inteiro (todas as pastas monitoradas, todos os perfis, todos os uploads) e não diferencia maiúsculas de minúsculas, porque o `output/` é uma única pasta. Vindo de uma pasta monitorada ou de uma nova varredura, o arquivo vira um job que já nasce `Failed` com `file.already-processed` e é movido, sem assinatura, para a pasta `error/` desse job; um upload é recusado com `409` e o mesmo código. Jobs `Failed` e `Canceled` não reservam nome, e uma nova tentativa não está sujeita à regra. Apagar o job que detém o nome (em `/jobs`) faz com que ele volte a ser aceito. **Desligue para um produtor que reutiliza o mesmo nome de arquivo fixo todos os dias.** |

## `WatchedFolder`

O detector de estabilidade impede a captura de um arquivo que ainda está sendo escrito — o observador
espera até que o tamanho e a data da última escrita permaneçam idênticos ao longo de
`StabilityRequiredSamples` verificações consecutivas.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `WatchedFolder:StabilityPollIntervalMs` | int | `500` | `WatchedFolder__StabilityPollIntervalMs` | Intervalo entre verificações de estabilidade. Faixa válida: 50–10000. |
| `WatchedFolder:StabilityRequiredSamples` | int | `3` | `WatchedFolder__StabilityRequiredSamples` | Amostras idênticas consecutivas necessárias antes do enfileiramento. Faixa válida: 1–100. |
| `WatchedFolder:StabilityConcurrency` | int | `8` | `WatchedFolder__StabilityConcurrency` | Quantos arquivos candidatos cada pasta estabiliza e enfileira simultaneamente. A verificação de estabilidade bloqueia por aproximadamente `StabilityRequiredSamples × StabilityPollIntervalMs` por arquivo, então processá-los um de cada vez limita a entrada a cerca de um arquivo por esse intervalo; sobrepor as esperas mantém o pipeline alimentado quando um lote grande de arquivos chega de uma vez. Faixa válida: 1–64. |
| `WatchedFolder:StabilityTimeoutSeconds` | int | `60` | `WatchedFolder__StabilityTimeoutSeconds` | Espera máxima antes de desistir de um arquivo que nunca se estabiliza. Faixa válida: 1–3600. |
| `WatchedFolder:PollIntervalSeconds` | int? | `30` | `WatchedFolder__PollIntervalSeconds` | **Com que frequência uma pasta com polling é enumerada — e não se ela faz polling.** Sobrescrito, por pasta, por `Storage:Inputs[N].PollIntervalSeconds`, e é a presença *dessa* chave que liga o polling em uma pasta local; definir apenas esta não muda nada em lugar nenhum. Uma pasta `AzureFiles` sempre faz polling e usa este valor, a menos que defina o próprio. Faixa válida: 5–3600. |
| `WatchedFolder:IgnoredExtensions` | array | `[".tmp", ".part", ".crdownload", ".swp"]` | n/a (use a configuração) | Extensões de arquivo que o observador ignora por completo. |
| `WatchedFolder:IgnoredPrefixes` | array | `[".", "~$"]` | n/a (use a configuração) | Prefixos de nome de arquivo que o observador ignora (dotfiles, arquivos de lock do Office). |

## `Upload`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Upload:Enabled` | bool | `true` | `Upload__Enabled` | *Novo na 2.10.0.* Se este host aceita arquivos por upload. `false` desliga o recurso dos dois lados ao mesmo tempo: `POST /api/files` responde `409` com `upload.disabled` — antes de o perfil ser resolvido, então uma requisição recusada não revela nada sobre quais perfis existem — e a página **Jobs** não mostra o botão **Enviar arquivos**. Pastas monitoradas, nova varredura e nova tentativa não são afetadas, então uma implantação alimentada apenas pelas pastas não perde nada. Lido uma vez no boot; religá-lo exige reinicialização. |
| `Upload:MaxBytes` | long | `104857600` (100 MiB) | `Upload__MaxBytes` | Limite rígido do corpo da requisição de upload — tanto em `POST /api/files` quanto na caixa de diálogo **Enviar arquivos** do dashboard. Aumente para PDFs digitalizados pesados. Mínimo: 1024. |

## `Dashboard`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Dashboard:PollIntervalSeconds` | int | `5` | `Dashboard__PollIntervalSeconds` | Intervalo de atualização, no servidor, das páginas ao vivo do dashboard. Faixa válida: 1–60. |

## `Branding` — o logotipo do cliente nas páginas de login e de aprovação

*Novo na 2.10.0.* A página de login e as páginas do aprovador (`/approve/{id}`, `/approvals` e a página
que exige o link) mostram a marca do produto. Se você indicar aqui um **logotipo do cliente**, essas
páginas passam a mostrá-lo também: acima de uma versão reduzida da marca do produto no cartão de login e
ao lado dela nos cabeçalhos do aprovador. Um logotipo por implantação, sobre fundo branco — todos esses
cartões são brancos, então uma marca que só funciona sobre fundo escuro precisa ser exportada de novo.
Nada mais muda: a barra do aplicativo, os títulos das páginas e o favicon continuam sendo os do produto.

O logotipo é lido **uma vez, na inicialização**, de um arquivo no host ou de um blob do Azure — os
mesmos dois lugares em que o material de um certificado pode estar, e pelo mesmo motivo: em um host do
Azure App Service, o operador não tem onde colocar um arquivo. Indique **um** dos dois. Não indicar
nenhum é válido e significa sem logotipo; indicar os dois é recusado no boot.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Branding:CustomerLogo:Path` | string | — | `Branding__CustomerLogo__Path` | Caminho para o arquivo de imagem no host — informe um caminho absoluto. A extensão define o content type e precisa ser `.png`, `.jpg`/`.jpeg`, `.webp` ou `.svg`; qualquer outra é recusada no boot. No Docker, use um bind mount somente leitura (o arquivo compose do pacote de implantação traz um exemplo comentado). Permitido com `Cluster:Enabled`, mas, nesse caso, o arquivo precisa ser idêntico em todas as instâncias; nada verifica isso. |
| `Branding:CustomerLogo:Blob:Url` | string | `""` | `Branding__CustomerLogo__Blob__Url` | URL `https://` completa do blob. Uma query string é recusada (sem SAS). A extensão do nome do blob segue a mesma regra da extensão do caminho. Mesmo formato do bloco [`…:Blob`](#blob--lendo-o-arquivo-do-azure-blob-storage) de um certificado; nada é herdado desse bloco nem de `Storage:AzureFiles`. |
| `Branding:CustomerLogo:Blob:Credential` | string | — | `Branding__CustomerLogo__Blob__Credential` | `ManagedIdentity`, `ServicePrincipal` ou `AccountKey`. Sem valor padrão. Uma credencial por token precisa da role **Storage Blob Data Reader** no container. |
| `Branding:CustomerLogo:Blob:TenantId` / `AppId` / `AppSecret` | string | — | `Branding__CustomerLogo__Blob__…` | Somente no modo `ServicePrincipal`; os três são obrigatórios. `AppSecret` é **SECRET** — defina-o pelo ambiente. |
| `Branding:CustomerLogo:Blob:AccountKey` | string | — | `Branding__CustomerLogo__Blob__AccountKey` | Somente no modo `AccountKey`. **SECRET**, e dá acesso à conta de armazenamento inteira — prefira uma credencial por token. |

**Recusado no boot, com a indicação da chave:** `Path` e `Blob` definidos ao mesmo tempo; uma extensão
fora das cinco; um bloco de blob sem `Url` ou sem `Credential`, um modo de credencial sem os valores
correspondentes ou uma URL com query string. Cada um desses casos é uma configuração que não poderia
funcionar, qualquer que fosse o conteúdo do arquivo.

**Informado e tolerado:** o arquivo ou blob está ausente, ilegível ou inacessível; o arquivo está vazio
ou passa de **256 KiB**; os bytes não correspondem à extensão. O serviço inicia, assina e atende; as
páginas mostram só a marca do produto; e o motivo aparece na linha `customer logo` do banner de
inicialização, como aviso no log de inicialização e como alerta na página **Sistema** até a próxima
reinicialização. O `/api/ready` não traz linha para ele — uma imagem não deve decidir se um serviço de
assinatura está pronto. Corrija o arquivo ou a configuração e reinicie.

**Como ele chega ao navegador.** `GET /branding/customer-logo` serve os bytes anonimamente, porque as
páginas que o exibem são mostradas antes do login. A URL contém um hash dos bytes e é armazenada em
cache como imutável, então uma reinicialização com um arquivo novo a altera em todos os lugares ao
mesmo tempo, e ninguém precisa limpar o cache. Um SVG é servido com uma política que impede a execução
de qualquer script que ele contenha. Sem logotipo carregado, a rota responde `404` com
`branding.customer-logo-not-available`.

```jsonc
{
  "Branding": {
    "CustomerLogo": {
      // Um arquivo neste host. Absoluto; .png, .jpg, .jpeg, .webp ou .svg; no máximo 256 KiB.
      "Path": "/etc/bulksigner/customer-logo.png"

      // OU, para um host sem disco onde colocá-lo (App Service): um blob do Azure, lido uma vez no boot.
      // Remova o Path acima se usar isto — os dois definidos é recusado.
      // ,"Blob": {
      //   "Url": "https://contoso.blob.core.windows.net/branding/customer-logo.svg",
      //   "Credential": "ManagedIdentity"
      // }
    }
  }
}
```

## `ApproverPortal`

Dá suporte à fila por aprovador em `/approvals`. **Desligado por padrão**, de modo que uma implantação
que já usa a [etapa de aprovação](approvals.md) é atualizada sem mexer na configuração. Lido uma vez na
inicialização — ao mudar qualquer coisa, reinicie.

De propósito, é uma seção de nível superior em vez de um bloco por perfil: um link identifica uma
*pessoa*, e a mesma pessoa costuma participar dos pools de vários perfis.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `ApproverPortal:Enabled` | bool | `false` | `ApproverPortal__Enabled` | Chave geral. Quando falsa, nenhum link é resolvido, nenhuma sessão é emitida, e a única forma de aprovação é o link por job. |
| `ApproverPortal:LinkSecret` | string | — | `ApproverPortal__LinkSecret` | **REQUIRED quando habilitado, SECRET — nunca o versione.** O link de cada aprovador é `HMAC-SHA256(este, o e-mail dele)`, então qualquer pessoa que o leia pode aprovar arquivos de pagamento em nome de qualquer aprovador configurado. Mínimo de 32 caracteres, verificado na inicialização. Precisa ser durável: gerar um a cada boot invalidaria o favorito de todos os aprovadores a cada reinicialização. **Mudá-lo revoga o link de todos os aprovadores de uma vez** — a medida drástica prevista para o caso de "o segredo vazou". |
| `ApproverPortal:DecidedLookback` | TimeSpan | `90.00:00:00` | `ApproverPortal__DecidedLookback` | Até quando, no passado, a aba **Aprovados** do portal mostra itens. Limita o quanto vale um link roubado. A aba também é limitada a 200 linhas por carregamento e avisa quando o limite é atingido. |
| `ApproverPortal:SessionLifetime` | TimeSpan | `30.00:00:00` | `ApproverPortal__SessionLifetime` | Tempo de vida do cookie emitido na troca do link. Com expiração deslizante, para que um aprovador que está percorrendo uma fila não seja desconectado no meio de uma decisão. |
| `ApproverPortal:PollInterval` | TimeSpan | `00:00:10` | `ApproverPortal__PollInterval` | Com que frequência um portal aberto relê a fila, para que a decisão de um colega, uma liberação ou um prazo de espera vencido apareçam sem que o aprovador precise clicar em nada. É uma chave própria, e não uma fração do [`Dashboard:PollIntervalSeconds`](#dashboard), porque esta se multiplica por todos os aprovadores com uma aba aberta, enquanto aquela é ajustada por poucos operadores. Faixa válida: `00:00:01` a `00:05:00`, verificada somente quando `Enabled` é verdadeiro. **Não há valor que desligue o polling** — um intervalo longo é a forma de reduzir a carga, e a página tem, de qualquer forma, um botão de atualização manual. Cuidado: um `10` sem formato é lido como dez *dias* e é recusado, com a indicação do valor recebido. |

`Enabled = true` sem **nenhum** perfil de assinatura armazenado com regra de aprovação gera um **aviso
de inicialização**, não uma recusa — um portal sem nenhum pool mostra uma fila vazia a todos os
aprovadores e parece quebrado, então o banner e o log durável avisam isso.

:::warning Mudou na 2.1.0 — um aviso, não mais uma recusa
Até a 2.0.x, isso impedia o boot. Com os perfis no banco operacional e o `Signing:Profiles[]` servindo
só como seed, a recusa dispararia exatamente no estado a que esta página recomenda chegar: pools no
banco e a seção apagada.
:::

```json
{
  "ApproverPortal": {
    "Enabled": true,
    "LinkSecret": "substitua-por-32+-caracteres-aleatorios-mantidos-secretos",
    "DecidedLookback": "90.00:00:00",
    "SessionLifetime": "30.00:00:00"
  }
}
```

O link de cada aprovador é mostrado na página **Sistema** do dashboard, um por pessoa configurada.
Envie a cada aprovador apenas o link dele; trate-o como a senha dessa pessoa. Veja
[Aprovações](approvals.md#o-portal-do-aprovador).

## `Console:Dashboard`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Console:Dashboard:Enabled` | bool | `true` | `Console__Dashboard__Enabled` | Se o dashboard ao vivo no terminal pode substituir a narração de log por job na saída padrão. Ele só é ativado quando esta chave é verdadeira **e** o processo é um console em primeiro plano (não serviço do Windows / systemd / Docker) **e** a saída padrão é um terminal interativo. Por isso, instalações como serviço e em container não são afetadas por esta chave. Defina-a como `false` quando rodar o binário em primeiro plano e quiser logs simples em fluxo contínuo. |

## Idioma de exibição — deliberadamente não configurável

Não há seção de configuração para o idioma da interface, e isso é uma decisão, não uma lacuna. As
páginas web são exibidas em `en-US` ou `pt-BR` conforme uma **preferência de apresentação por
navegador**: o seletor de idioma faz um POST no endpoint anônimo `POST /api/culture`, que grava por um
ano o cookie de cultura padrão do ASP.NET Core. A ordem de resolução é **cookie → o `Accept-Language`
do navegador → `en-US`**, então um operador brasileiro recebe português já no primeiro carregamento,
sem que ninguém configure nada, e não há configuração no servidor que se sobreponha ao que cada leitor
escolheu.

O que permanece sempre em inglês, independentemente da escolha do leitor: as mensagens de auditoria
persistidas (elas são evidência), a saída de log, o dashboard de console, o texto dos problemas
retornados pela API REST, os valores de `JobStatus` no protocolo e todo o vocabulário e formatação do
CNAB240. Veja [Dashboard](dashboard.md#idioma-de-exibição).

## `LogViewer`

Dá suporte ao armazenamento em memória das exceções recentes e à página `/logs` do dashboard. Todos os
valores são lidos uma vez na inicialização — ao mudá-los, reinicie.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `LogViewer:Enabled` | bool | `true` | `LogViewer__Enabled` | Chave geral. Quando falsa, o destino em memória não é conectado, a página `/logs` mostra um aviso de recurso desabilitado, e o link de navegação fica oculto. |
| `LogViewer:MaxEntries` | int | `20` | `LogViewer__MaxEntries` | Tamanho do buffer limitado em memória e número máximo de entradas exibidas. As entradas mais antigas são descartadas quando esse limite é ultrapassado. Faixa válida: 1–1000. |
| `LogViewer:RefreshIntervalSeconds` | int | `5` | `LogViewer__RefreshIntervalSeconds` | Intervalo de atualização automática da página `/logs`. Faixa válida: 1–60. A página também tem um botão de atualização manual. |
| `LogViewer:Levels` | string[] | `["Error","Fatal"]` | `LogViewer__Levels__0`, … | Níveis de log que o armazenamento captura (sem diferenciar maiúsculas de minúsculas). Nomes válidos: `Verbose`, `Debug`, `Information`, `Warning`, `Error`, `Fatal`. Nomes vazios ou desconhecidos impedem a inicialização. **O `Logging:File:MinimumLevel` continua sendo aplicado antes** — ampliar esta lista para níveis abaixo desse mínimo não captura nada, porque esses eventos nunca chegam ao destino. |

Veja [Dashboard](dashboard.md#logs--exceções-recentes).

## `Readiness`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Readiness:RequireApiKey` | bool | `false` | `Readiness__RequireApiKey` | *Novo na 2.6.0.* Quando verdadeiro, `GET /api/ready` exige autenticação por chave de API ou cookie — a mesma proteção que o `Metrics:RequireApiKey` aplica a `/api/metrics`. Ao contrário daquela chave, fica desligado por padrão, porque o principal consumidor do probe é um health check de plataforma que não consegue enviar a chave: o do Azure App Service precisa ser respondido anonimamente, e um `401` em todas as instâncias torna todas elas não saudáveis de uma vez. Ligue-o onde quem executa o probe consiga enviar `X-API-Key` (os headers de um probe do Kubernetes, um agente de monitoramento) ou onde não haja probe. Lido uma vez na inicialização; a linha `ready` do banner mostra `(anonymous)` ou `(API key)`. O `/api/ready/details` exige autenticação de qualquer forma, e o `/api/ready` nunca traz detalhes. |

:::warning Mudou na 2.6.0 — o probe anônimo responde com um veredito, não com uma descrição
O `/api/ready` agora retorna `ready` e o `name` e o `ok` de cada verificação — o campo `detail` por
verificação não é mais retornado. Esse detalhe indicava o host do SQL Server, todos os compartilhamentos
de entrada e a localização de um certificado degradado: nada disso é credencial, mas, em conjunto,
formava um mapa da implantação legível por qualquer pessoa que chegasse à porta. O mesmo relatório, com
todos os detalhes, está em **`/api/ready/details`**, protegido pela chave de API ou por uma sessão de
operador, com a mesma regra `200` / `503`. Um orquestrador que lê o código de status não é afetado; um
monitoramento que interpretava o `detail` passa a usar a rota de detalhes e acrescenta o header. Cada
mudança de veredito de uma verificação é gravada uma vez no log durável, então o histórico continua
registrado.
:::

## `Metrics`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Metrics:RequireApiKey` | bool | `true` | `Metrics__RequireApiKey` | Quando verdadeiro, `/api/metrics` exige autenticação por chave de API ou cookie. Defina como falso apenas se o coletor do Prometheus estiver dentro do perímetro de confiança e a rede estiver fechada. |

Veja [API REST](rest-api.md) para o inventário completo das métricas.

## `Statistics`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Statistics:Enabled` | bool | `true` | `Statistics__Enabled` | Chave geral. Quando falsa, o coletor não faz nada (sem registro, sem locking), nenhuma linha é gravada, e o painel do dashboard fica oculto. As estatísticas são uma linha por job concluído no banco operacional: elas **sobrevivem a reinicializações**, e todas as instâncias de um cluster leem os mesmos números. Desligar a chave não apaga as linhas já registradas — religá-la volta a mostrá-las; para limpar o painel, use o [Limpar Jobs](operations.md#limpar-jobs). |

Veja [Estatísticas de jobs](statistics.md) para o significado de cada número.

## `Backup`

Dá suporte ao recurso de backup do banco de dados: a página `/backup` do dashboard, o
`GET|POST /api/backup` e o agendador. **Desligado por padrão, e somente para SQLite** — com
`Database:Provider = SqlServer`, `Backup:Enabled = true` causa uma **recusa de boot**, em vez de
simplesmente não fazer nada, porque o backup do banco operacional é responsabilidade da rotina desse
SGBD. Como o modo cluster exige `SqlServer`, essa combinação é, por definição, impossível nele.

Lido uma vez na inicialização. Somente o bloco do destino selecionado é lido.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Backup:Enabled` | bool | `false` | `Backup__Enabled` | Chave geral. Quando falsa, nada é agendado, o botão de iniciar e o `POST /api/backup` recusam com `backup.disabled`, e a página explica o que ligar. **`true` com `Database:Provider = SqlServer` impede o boot**, indicando as duas chaves e a solução. |
| `Backup:Destination` | string | `Disk` | `Backup__Destination` | `Disk`, `S3` ou `AzureBlob`. Se ausente, vale `Disk` — o destino que não precisa de credencial. Não diferencia maiúsculas de minúsculas; um valor não reconhecido é recusado no boot, com a indicação da chave, do valor informado e dos nomes válidos. |
| `Backup:IntervalHours` | int? | *(ausente)* | `Backup__IntervalHours` | Com que frequência um backup roda automaticamente. **Ausente significa somente manual** — o recurso está ligado, o botão funciona, mas nada roda por temporizador. Faixa válida: 1–8760. Deliberadamente, é um intervalo e não um horário do dia: um horário precisa de fuso horário, e este produto não tem um. A contagem parte da última execução **bem-sucedida**, de modo que uma reinicialização não a zera e uma execução com falha não a consome. Se nunca houve backup, um backup é devido imediatamente. |
| `Backup:RetainCount` | int | `14` | `Backup__RetainCount` | Quantos artefatos manter no destino. `0` mantém **todos** — e nem chega a listar o destino —, para um bucket ou container cujas próprias regras de ciclo de vida fazem a limpeza. Faixa válida: 0–1000. É uma contagem e não uma idade, porque uma contagem continua válida quando alguém muda o `IntervalHours`. A limpeza roda apenas após um armazenamento bem-sucedido e **não pode fazer a execução falhar**. |
| `Backup:Disk:Path` | string | — | `Backup__Disk__Path` | **REQUIRED quando `Destination = Disk`.** Sem padrão, de propósito: qualquer padrão plausível colocaria o backup no mesmo disco do banco de dados copiado. Um caminho UNC ou volume de rede montado serve. Quatro recusas de boot: ausente; o esquema `azurefiles://` do próprio produto (deliberadamente, um destino de backup **não** é um provider de armazenamento); um caminho dentro de uma **pasta de entrada monitorada** (o pipeline capturaria, assinaria e depois *apagaria* o backup); e um caminho dentro de `processing/`, `output/`, `error/` ou `db/`. |
| `Backup:S3:BucketName` | string | — | `Backup__S3__BucketName` | **REQUIRED quando `Destination = S3`.** |
| `Backup:S3:Region` | string | — | `Backup__S3__Region` | **REQUIRED quando `Destination = S3` e nenhum `ServiceUrl` está definido.** O nome de sistema da região, por exemplo `sa-east-1`. Sem valor padrão: o SDK recorreria ao ambiente do host ou ao perfil compartilhado, então uma região omitida decidiria, por acidente, onde fica armazenada uma cópia do registro de aprovação de pagamentos. |
| `Backup:S3:Prefix` | string | `""` | `Backup__S3__Prefix` | Prefixo de chave dentro do bucket. Normalizado — `bulksigner`, `bulksigner/` e `/bulksigner/` significam a mesma coisa. |
| `Backup:S3:Credential` | string | — | `Backup__S3__Credential` | **REQUIRED quando `Destination = S3`.** `AccessKey` ou `InstanceRole`. **Sem valor padrão** — a própria cadeia do SDK da AWS autenticaria com qualquer identidade que o host tivesse. Uma URL pré-assinada não é uma credencial aceita. |
| `Backup:S3:AccessKeyId` | string | — | `Backup__S3__AccessKeyId` | **REQUIRED quando `Credential = AccessKey`.** Deliberadamente **não** mascarado nos logs: é a metade identificadora do par, e mascará-lo removeria o único valor que diz qual chave uma requisição recusada usou. Defini-lo com `InstanceRole` causa uma recusa de boot. |
| `Backup:S3:SecretAccessKey` | string | — | `Backup__S3__SecretAccessKey` | **REQUIRED quando `Credential = AccessKey`. SECRET.** Defini-lo com `InstanceRole` causa uma recusa de boot. |
| `Backup:S3:ServiceUrl` | string | — | `Backup__S3__ServiceUrl` | Um endpoint de **API** compatível com S3 em vez da AWS — MinIO, Ceph, Wasabi, Backblaze B2. URL `http://` ou `https://` absoluta. Quando definido, `Region` passa a ser opcional. |
| `Backup:S3:ForcePathStyle` | bool | `false` | `Backup__S3__ForcePathStyle` | Endereça os buckets como um segmento de caminho (`host/bucket/key`) em vez de subdomínio. `false` é o que a própria AWS espera; **quase todo endpoint compatível com S3 precisa de `true`** — deixá-lo falso com MinIO ou Ceph causa uma falha de DNS que cita um hostname que você nunca configurou. |
| `Backup:AzureBlob:ContainerUrl` | string | — | `Backup__AzureBlob__ContainerUrl` | **REQUIRED quando `Destination = AzureBlob`.** A URL https completa do container, por exemplo `https://contoso.blob.core.windows.net/bulksigner-backups`. Recusada no boot quando não é uma URL https absoluta, não indica uma conta, tem mais de um segmento de caminho (coloque um caminho em `Prefix`) ou **tem query string** — que é como uma SAS chega; recusá-la garante que este valor nunca seja secreto. O container **não** é criado automaticamente. |
| `Backup:AzureBlob:Prefix` | string | `""` | `Backup__AzureBlob__Prefix` | Prefixo de nome de blob dentro do container. Normalizado como o do S3. |
| `Backup:AzureBlob:Credential` | string | — | `Backup__AzureBlob__Credential` | **REQUIRED quando `Destination = AzureBlob`.** `ManagedIdentity`, `ServicePrincipal` ou `AccountKey` — grafados exatamente como os de `Storage:AzureFiles`. **Sem valor padrão.** O `ManagedIdentity` aceita **somente a identidade atribuída pelo sistema**. A identidade precisa da role **`Storage Blob Data Contributor`** — escrita, e não o `Storage Blob Data Reader` de que um blob de certificado precisa. |
| `Backup:AzureBlob:TenantId` / `AppId` | string | — | `Backup__AzureBlob__TenantId`, … | **REQUIRED quando `Credential = ServicePrincipal`.** |
| `Backup:AzureBlob:AppSecret` | string | — | `Backup__AzureBlob__AppSecret` | **REQUIRED quando `Credential = ServicePrincipal`. SECRET.** Defini-lo com outro modo causa uma recusa de boot — um segredo que esta implantação não usa é um segredo que ninguém vai rotacionar. |
| `Backup:AzureBlob:AccountKey` | string | — | `Backup__AzureBlob__AccountKey` | **REQUIRED quando `Credential = AccountKey`. SECRET.** Concede acesso total ao plano de dados da conta de armazenamento **inteira** e não pode ser restrita a um container. Defini-la com outro modo causa uma recusa de boot. |

Nada é herdado de `Storage:AzureFiles` nem do bloco de um blob de material de assinatura, mesmo quando
o mesmo aplicativo do Entra é indicado: essas credenciais concedem acesso de leitura a recursos
diferentes, e esta precisa de acesso de **escrita**.

### Exemplo: um intervalo para um volume local

```jsonc
{
  "Backup": {
    "Enabled": true,
    "Destination": "Disk",
    "IntervalHours": 24,
    "RetainCount": 14,
    "Disk": { "Path": "/backup/bulksigner" }
  }
}
```

### Exemplo: um endpoint compatível com S3 (MinIO)

```jsonc
{
  "Backup": {
    "Enabled": true,
    "Destination": "S3",
    "IntervalHours": 12,
    "RetainCount": 0,                      // as regras de ciclo de vida do bucket fazem a poda
    "S3": {
      "BucketName": "bulksigner-backups",
      "ServiceUrl": "https://minio.internal:9000",
      "ForcePathStyle": true,
      "Credential": "AccessKey",
      "AccessKeyId": "…",
      // Na prática, defina via Backup__S3__SecretAccessKey, não aqui.
      "SecretAccessKey": ""
    }
  }
}
```

Veja [Retenção](retention.md#disciplina-de-backup) para entender como isso se encaixa no quadro mais
amplo de retenção.

## `Cluster` — implantação com múltiplas instâncias

Modo cluster — mais de uma instância ativa cooperando sobre um único banco operacional e um único
compartilhamento de trabalho. **Desligado por padrão, e, desligado, é byte a byte o produto de
instância única**: uma implantação que nunca escreve esta seção não precisa de nada e não muda nada na
atualização.

Estas três chaves são a menor parte da ativação do modo. O custo dele está descrito em
[Alta disponibilidade e seus limites](high-availability.md) — leia essa página antes de definir
`Enabled = true` —, e a implantação é descrita em [Azure App Service (modo cluster)](azure.md), que
também traz as configurações de plataforma (afinidade de sessão, o caminho do health check, Always On)
que não têm chave aqui porque não cabe a este produto defini-las.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Cluster:Enabled` | bool | `false` | `Cluster__Enabled` | Chave geral. Quando verdadeira, as recusas de boot abaixo se aplicam; quando falsa ou ausente, nenhum mecanismo de cluster é registrado e nada muda. Há exatamente uma topologia com múltiplas instâncias suportada: um Azure Web App (container Linux) com escala horizontal em um único App Service Plan. |
| `Cluster:HeartbeatSeconds` | int | `15` | `Cluster__HeartbeatSeconds` | Com que frequência esta instância grava uma linha informando que está ativa. Faixa `[5, 300]`; valores fora dela são recusados no boot. Lida somente quando o modo está ligado. |
| `Cluster:StaleAfterSeconds` | int | `60` | `Cluster__StaleAfterSeconds` | Quanto tempo uma instância pode ficar sem enviar heartbeats antes que as demais a presumam morta. Faixa `[15, 3600]`, e recusada no boot quando vale **menos de três intervalos de heartbeat** — um limiar tão curto presume a morte após um ou dois heartbeats perdidos, e um heartbeat pode se perder por motivos que não são morte (uma pausa de coleta de lixo, um banco operacional que demorou um instante, um container que a plataforma deixou sem recursos por um momento). O padrão são quatro intervalos. |

### O que `Enabled = true` recusa no boot

Toda configuração de cluster que não poderia funcionar causa uma recusa que indica as chaves e a
solução:

- **`Database:Provider` precisa ser `SqlServer`.** O banco operacional é o ponto de coordenação do
  cluster, e um arquivo SQLite não pode ser compartilhado entre hosts.
- **O compartilhamento de trabalho e todas as pastas de entrada monitoradas precisam estar em
  `AzureFiles`.** O lease do armazenamento local de arquivos não exclui nada fora do próprio processo,
  e uma pasta local de uma instância é invisível para as demais. A pasta `default`, criada
  automaticamente sem configuração, é local, então uma primeira execução com a chave ligada também é
  recusada.
- **As origens de certificado por host `Pkcs11` e `WindowsStore` são recusadas.** Um token ou um
  repositório de máquina fica em uma única máquina, e as instâncias de cluster são intercambiáveis. Use
  `Pfx` (de preferência [lido de um blob](#blob--lendo-o-arquivo-do-azure-blob-storage)) ou
  `AzureKeyVault`. Um bloco `Certificate` obsoleto em um perfil com `Method = LacunaSigner` continua
  tolerado, como em qualquer outro caso. É uma regra sobre um **perfil**, então é aplicada sempre que
  uma origem de certificado é declarada: no boot, para uma entrada de `Signing:Profiles[]` ou para o
  bloco legado `Signing:Certificate`, e no formulário do dashboard quando um perfil é criado ou o
  certificado dele é alterado. Um perfil **salvo antes de a chave ser ligada** gera só um **aviso** de
  inicialização com o nome do perfil e a origem — um perfil armazenado nunca é revalidado, e a recusa
  tiraria do ar justamente a página que resolve o problema. Esse perfil assina na instância em que
  encontrou o hardware e falha como perfil degradado em todas as outras.

Uma recusa **não** tem nada a ver com configuração, e está listada aqui porque parece ter: com o modo
ligado, o próprio marcador do compartilhamento de trabalho registra a qual banco operacional o
compartilhamento pertence, e uma instância cujo banco não corresponde se recusa a iniciar, indicando os
dois. É uma característica do compartilhamento, e não do `appsettings.json`, e é a única coisa que
detecta dois clusters apontados para o mesmo compartilhamento de trabalho.

Deliberadamente, uma condição de cluster gera um **aviso, não uma recusa**: modo cluster com
`Logging:AzureTable:Enabled = false` registra um Critical na inicialização, porque, na topologia
suportada, o disco da instância é efêmero e os arquivos de log rotacionados são descartados a cada
reciclagem. De qualquer forma, a regra de que a tabela nunca pode ser o único destino mantém o destino
de arquivo local ligado.

### Identidade e vivacidade

**A identidade é derivada, nunca configurada, e deliberadamente não há chave para ela.** Uma instância
se identifica pelo ID de instância da própria plataforma (`WEBSITE_INSTANCE_ID`, que o App Service
define em toda instância) ou, onde essa variável não existe, pelo nome da máquina, mais um
identificador de **encarnação** novo a cada boot. O App Service cria e destrói instâncias por regra de
escala, então um nome digitado por um operador seria uma chave que ninguém conseguiria manter correta;
é a encarnação que permite a uma instância distinguir *a própria vida anterior* de uma instância
estranha.

Cada instância mantém uma linha no banco operacional — identidade, encarnação, versão da aplicação,
quando iniciou, quando informou pela última vez que estava ativa —, atualizada a cada
`Cluster:HeartbeatSeconds` e presumida morta depois de `Cluster:StaleAfterSeconds`. A
[página Sistema](dashboard.md#system--sistema) exibe essa tabela na visão **Instâncias**. Duas coisas
dependem dela no boot, deliberadamente de naturezas diferentes — uma assume a identidade, a outra só
avisa:

- **Uma instância que, ao subir, encontra a própria identidade já enviando heartbeats a desloca**,
  indicando a encarnação deslocada no console e no log, e continua. É a sobreposição típica de uma
  reimplantação: o App Service roda o container antigo e o novo com o mesmo ID de instância e mantém o
  antigo ativo até o novo estar aquecido. O processo deslocado **se retira** no próximo heartbeat — não
  captura nenhum job novo, termina os que já tem e mostra uma linha `cluster-instance` vermelha no
  próprio `/api/ready`, que não reprova o probe. O dono de um job é a **encarnação**, além da
  identidade, então em qualquer momento exatamente um processo captura trabalho com um determinado
  nome, e o que o processo deslocado deixar inacabado é assumido `Cluster:StaleAfterSeconds` depois do
  deslocamento. Um desligamento limpo desativa a linha de heartbeat, então um sucessor não tem nada a
  deslocar. Dois hosts que de fato apresentam o mesmo nome se deslocam mutuamente, com avisos dos dois
  lados, em vez de serem recusados; a única recusa que resta é a de um registro que perdeu todas as
  disputas de escrita pela própria linha.
- **Instâncias ativas em uma versão diferente da aplicação registram um Critical, e o boot continua.**
  Na topologia suportada, as atualizações exigem parada total, então isso indica um deployment slot
  trocado para dentro de um cluster em execução, ou uma implantação que não parou todas as instâncias.
  De propósito, é um aviso, e não uma recusa: a recusa impediria as instâncias de subir por todo o
  tempo que um heartbeat *morto* da versão antiga levasse para ficar obsoleto, que é exatamente quando
  um operador precisa que elas subam.

Se o banco operacional estiver inacessível no boot, o registro não é feito, assim como a migração, e o
host inicia mesmo assim. O heartbeat faz o registro no primeiro envio que conseguir chegar ao banco —
deslocando um detentor ativo da identidade exatamente como o boot teria feito —, então a instância só
fica ausente da visão **Instâncias** até esse momento.

:::warning Mudou na 2.5.0 — deslocada, não mais recusada
Até a 2.4.x, uma instância que, ao subir, encontrasse a própria identidade enviando heartbeats se
recusava a iniciar (a 2.4.3 passou a fazê-la esperar), então uma troca de imagem in-place, no App
Service, custava pelo menos um início recusado. As atualizações continuam exigindo parada total, e
*parar, implantar, iniciar* continua sendo a receita mais limpa; veja
[Azure App Service](azure.md#8-atualizações-exigem-parada-total).
:::

### O key ring de sessão não tem chave própria, e não precisa de nenhuma

Com a chave desligada, o ring de Data Protection fica em `keys/`, dentro de `Storage:Root`,
criptografado com DPAPI no Windows. Com ela ligada, ele passa a ser um conjunto de linhas no banco
operacional, em texto claro, protegido pelo controle de acesso do próprio banco de dados — porque um
ring derivado de uma raiz local pertence estruturalmente a um único host; assim, atrás de um
balanceador de carga, um cookie criado por uma instância é rejeitado pela seguinte, o que as pessoas
percebem como uma desconexão intermitente, sem que nada, em lugar nenhum, a informe. Os dois cookies
dependem dele, então o problema afeta operadores e aprovadores da mesma forma.

Deliberadamente, ele acompanha a chave, e não uma configuração própria: uma implantação que pode
escolher o local do ring independentemente da topologia é uma implantação que pode escolher a
combinação que não funciona. Veja [Segurança](security.md) e
[Alta disponibilidade](high-availability.md#o-key-ring-de-sessão-fica-em-texto-claro-no-banco).

## `Telemetry`

Exportação opcional para o Azure Application Insights. Desligada por padrão; quando desligada, o
serviço não depende do Application Insights e não faz chamadas de saída para ele.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Telemetry:Enabled` | bool | `false` | `Telemetry__Enabled` | Chave geral. Quando `true`, uma connection string é **obrigatória** — a inicialização falha sem ela. |
| `Telemetry:ConnectionString` | string? | `null` | `Telemetry__ConnectionString` | **SECRET.** Connection string do Application Insights. Deixe-a sem definir para fornecê-la pela variável de ambiente padrão `APPLICATIONINSIGHTS_CONNECTION_STRING`. |
| `Telemetry:RoleName` | string | `Lacuna.BulkSigner` | `Telemetry__RoleName` | Informado como a dimensão `cloud_RoleName`, para que vários serviços que compartilham um recurso continuem distinguíveis. |

Veja [Telemetria](telemetry.md) para saber o que é coletado e as consultas KQL para analisar esses
dados.

## `RateLimiting`

Políticas de limite de requisições (rate limiting) com janela fixa, por IP.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `RateLimiting:Enabled` | bool | `true` | `RateLimiting__Enabled` | Chave geral. Desabilite em instalações em rede fechada. |
| `RateLimiting:Upload:PermitsPerWindow` | int | `30` | `RateLimiting__Upload__PermitsPerWindow` | Requisições permitidas por janela em `POST /api/files`. |
| `RateLimiting:Upload:WindowSeconds` | int | `60` | `RateLimiting__Upload__WindowSeconds` | Duração da janela da política de upload. |
| `RateLimiting:Upload:QueueLimit` | int | `0` | `RateLimiting__Upload__QueueLimit` | Quantas requisições acima do limite esperam, em vez de serem rejeitadas imediatamente. 0 = rejeitar imediatamente. |
| `RateLimiting:Actions:PermitsPerWindow` | int | `60` | `RateLimiting__Actions__PermitsPerWindow` | Requisições permitidas por janela nos endpoints de ação (nova tentativa, cancelar, nova varredura, limpeza, pausar, retomar). |
| `RateLimiting:Actions:WindowSeconds` | int | `60` | `RateLimiting__Actions__WindowSeconds` | Duração da janela da política de ações. |
| `RateLimiting:Actions:QueueLimit` | int | `0` | `RateLimiting__Actions__QueueLimit` | Tamanho da fila da política de ações. |
| `RateLimiting:Approval:*` | mesmo formato | `10` por `60` s | `RateLimiting__Approval__PermitsPerWindow`, … | Cota da rota anônima `POST /api/approvals/{id}`, separada da cota das ações de operador. Os IDs de job são GUIDs v4, e é esta política que os torna impossíveis de adivinhar por uma máquina, e não apenas por uma pessoa. |
| `RateLimiting:Export:*` | mesmo formato | `10` por `60` s | `RateLimiting__Export__PermitsPerWindow`, … | Cota das exportações para Excel: a exportação da fila do portal do aprovador e, desde a 2.11.0, o `GET /api/jobs/export` da página **Jobs**. Limita a velocidade com que cópias de uma fila podem ser feitas, e fica separada da cota `Approval` para que uma rajada de exportações nunca consuma as permissões de que um colega precisa para registrar uma decisão. |

As respostas bloqueadas pelo limite de requisições trazem `code = "rate-limited"` no envelope de erro.

## `Hosting`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Hosting:RequireHttps` | bool | `false` | `Hosting__RequireHttps` | Controla o redirecionamento HTTPS no próprio processo. `false` (padrão) para instalações como serviço e Docker que fazem a terminação TLS em um proxy reverso. Aparece no banner de resumo de prontidão como `https redirect = on/off`. |
| `Hosting:ForwardedHeaders:Enabled` | bool | `false` | `Hosting__ForwardedHeaders__Enabled` | Lê o endereço e o esquema do cliente de `X-Forwarded-For` e `X-Forwarded-Proto`. Desligado por padrão, e, desligado, é byte a byte o produto como foi entregue — nenhum middleware é adicionado. Ligá-lo **exige um conjunto de confiança**: `TrustAnyProxy`, `KnownProxies` ou `KnownNetworks`; caso contrário, o boot é recusado. Aparece no banner de resumo de prontidão como `forwarded headers = …`, indicando o conjunto de confiança em vez de apenas `on`. |
| `Hosting:ForwardedHeaders:TrustAnyProxy` | bool | `false` | `Hosting__ForwardedHeaders__TrustAnyProxy` | Aceita um header encaminhado vindo de **qualquer** endereço anterior na cadeia. É a configuração prevista para o Azure App Service, cujo front-end não tem endereço estável para listar. ⚠️ Em uma implantação com proxy reverso, significa que qualquer pessoa que consiga acessar o Kestrel diretamente pode se apresentar com qualquer endereço de cliente. Não pode ser combinada com as duas chaves abaixo — uma lista ao lado dela seria ignorada, então a combinação é recusada no boot em vez de ser resolvida por precedência. |
| `Hosting:ForwardedHeaders:KnownProxies` | string[] | `[]` | `Hosting__ForwardedHeaders__KnownProxies__0` | Endereços IP simples cujos headers encaminhados são aceitos (`10.4.0.7`, `::1`). Um valor que não seja endereço IP é recusado no boot, com a indicação do valor. **Os padrões de loopback do framework não são mantidos** — quando esta seção define um conjunto de confiança, ele é o conjunto completo, então um proxy neste host precisa estar listado. |
| `Hosting:ForwardedHeaders:KnownNetworks` | string[] | `[]` | `Hosting__ForwardedHeaders__KnownNetworks__0` | Faixas CIDR cujos headers encaminhados são aceitos (`10.4.0.0/16`). Recusada no boot se não for uma faixa CIDR ou se o endereço tiver bits além do comprimento do prefixo — `10.4.0.7/16` descreve `10.4.0.0/16`, e um arquivo que diz uma faixa enquanto o host confia em outra merece fazer o boot falhar. |
| `Hosting:ForwardedHeaders:ForwardLimit` | int | `1` | `Hosting__ForwardedHeaders__ForwardLimit` | Quantas entradas são lidas a partir do fim (à direita) de cada header encaminhado — uma por proxy pelo qual a requisição realmente passa, o que dá `1` tanto para um balanceador de carga de plataforma quanto para um único proxy reverso. Faixa `[1, 16]`; valores fora dela são recusados no boot. O "ilimitado" do framework é deliberadamente inacessível, porque, em uma cadeia ilimitada, a ponta mais distante foi escrita pelo cliente. |

### Por que os headers encaminhados são uma chave do produto, e não apenas a chave do framework

O ASP.NET Core tem a própria chave, `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, que confia em
**qualquer** origem anterior, sem forma de restringir isso. Definir tanto ela quanto
`Hosting:ForwardedHeaders:Enabled` é **recusado no boot**, com a indicação das duas: cada uma acrescenta
o processamento de headers encaminhados, então todo header seria processado duas vezes, e um
`ForwardLimit` de um aceitaria silenciosamente dois saltos.

Duas coisas no produto dependem do endereço do cliente, e é por isso que decidir em quais headers
confiar é uma questão de configuração, e não um detalhe:

- **A partição do limite de requisições.** Atrás de um balanceador de carga, todos os chamadores chegam
  com um único endereço, então a cota por cliente da rota de aprovação anônima vira uma única cota
  compartilhada pelo mundo inteiro.
- **O endereço registrado em uma aprovação**, que é um dos controles compensatórios da rota de
  aprovação anônima. Um endereço que, na verdade, é o do balanceador de carga não diz nada sobre quem
  decidiu.

No Azure App Service, a configuração prevista é `Enabled = true` com `TrustAnyProxy = true`, e o risco
que isso traz é eliminado restringindo o acesso à origem — veja
[Azure App Service](azure.md#entrada--front-door-na-frente-do-app).

## `ApproverSecondFactor`

Um segundo fator TOTP para aprovadores — um código de um aplicativo autenticador, conferido com uma
inscrição por pessoa. **Desligado por padrão**, então a atualização não muda nada. Lido uma vez na
inicialização; ao mudar qualquer coisa, reinicie.

Vale para o host inteiro, e não por perfil de assinatura, e essa escolha é estrutural, não uma
conveniência: uma regra por perfil é congelada no job quando ele fica retido, e a autenticação não pode
estar nesse snapshot — o snapshot registra *qual regra se aplicou*, de modo que editar este arquivo
nunca pode servir para contornar a autorização. Uma chave que vale para o host inteiro não tem nada por
perfil a congelar, então um job que ficou retido antes de o fator ser habilitado não precisa de migração
nem de tratamento especial.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `ApproverSecondFactor:Enabled` | bool | `false` | `ApproverSecondFactor__Enabled` | Chave geral. Quando falsa, nada muda em nenhuma tela de aprovação, e nenhum valor de `ApproverSecondFactor:*` é lido. Quando verdadeira: o painel de inscrição aparece em `/approvals`, **toda decisão no portal pede um código uma vez por janela de verificação**, e as duas rotas que não têm sessão de navegador — `POST /api/approvals/{id}` e uma decisão a partir de `/approve/{jobId}` — **passam a recusar de imediato**. Essa última parte quebra qualquer ERP que faça aprovações por REST; veja [Aprovações](approvals.md#provando-que-é-você). |
| `ApproverSecondFactor:SeedSecret` | string | — | `ApproverSecondFactor__SeedSecret` | **REQUIRED quando habilitado. SECRET — nunca o versione.** A chave com a qual o seed do autenticador de cada aprovador é criptografado em repouso (PBKDF2-HMAC-SHA256 → AES-256-GCM). Mínimo de 32 caracteres, o mesmo mínimo exigido do `ApproverPortal:LinkSecret`. Ela **criptografa** os seeds; não os deriva — deliberadamente, os seeds são aleatórios por aprovador, para que quem tem o primeiro fator não consiga gerar o segundo. **Perdê-la ou rotacioná-la significa que todos os aprovadores precisam se inscrever de novo.** |
| `ApproverSecondFactor:VerificationWindow` | TimeSpan | `00:20:00` | `ApproverSecondFactor__VerificationWindow` | Por quanto tempo um fator comprovado vale antes de precisar ser comprovado de novo. **Zero é válido e significa "pedir a cada decisão"** — a configuração mais rígida, e não uma desativação. Absoluta, nunca deslizante, e restrita a uma sessão de navegador. Faixa válida: `00:00:00` a `08:00:00`. **Congelada em cada janela no momento em que o código é digitado**, de modo que editá-la vale para as janelas abertas depois e não muda nada nas que já estão abertas. |
| `ApproverSecondFactor:Issuer` | string | `Lacuna Bulk Signer` | `ApproverSecondFactor__Issuer` | O rótulo que um aplicativo autenticador mostra acima do código. Vai no parâmetro `issuer` da URI de provisionamento e é repetido no label dela, porque os aplicativos divergem sobre qual dos dois leem. Defina-o quando um diretório abriga vários ambientes e, sem isso, um aprovador veria duas contas com nomes idênticos. |

:::warning Sempre escreva o componente de dias em `VerificationWindow`
Um valor de três componentes é `hh:mm:ss` somente enquanto o primeiro número for 23 ou menos; a partir
de 24, o binder o lê como *dias*, então `"24:00:00"` significa vinte e quatro dias. Diferentemente do
`ExpiresAfter`, que aceita isso silenciosamente, aqui o teto de oito horas transforma o valor em uma
recusa de boot que aponta o erro.
:::

### Três recusas de boot

`Enabled = true` impede a inicialização, indicando a chave, quando:

1. **`SeedSecret` está ausente ou tem menos de 32 caracteres.** Sem ela, as inscrições ficam
   ilegíveis, então um fator configurado pela metade não é um controle mais fraco — é um controle cuja
   força ninguém definiu.
2. **`VerificationWindow` é negativa ou maior que oito horas.** Além de um turno de trabalho, o valor
   deixa de representar a presença de alguém diante do teclado e passa a representar uma sessão — que
   é justamente o motivo pelo qual uma janela deslizante foi descartada.
3. **`ApproverPortal:Enabled` é falso *e* nenhuma seção `Auth:EntraId` está configurada.** São os dois
   únicos recursos que produzem uma sessão identificada, e o fator é comprovado dentro de um deles. Sem
   nenhum dos dois, ninguém conseguiria se inscrever, todo job de um perfil com aprovação configurada
   ficaria retido indefinidamente, e nenhum arquivo de pagamento seria assinado.

## `AllowedHosts`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `AllowedHosts` | string | `*` | `AllowedHosts` | Filtragem de host padrão do ASP.NET Core. Sobrescreva com uma lista separada por vírgulas se a instalação estiver atrás de um proxy reverso com um nome de host externo fixo. |

## Variáveis de ambiente sem equivalente em JSON

| Variável | Finalidade |
|----------|------------|
| `BULK_SIGNER_CONFIG_DIR` | Indica ao binário onde fica a configuração de produção quando o binário está em um local de instalação somente leitura. Definida pelos scripts de instalação. |
| `BULK_SIGNER_PKCS11_PIN` | O PIN do HSM/token — lido da variável de ambiente cujo nome é configurado em `Signing:Certificate:Pkcs11:PinEnvVar`. |
| `BULK_SIGNER_ENCRYPTION_PASSWORD` | Senha do PBKDF2 — lida da variável de ambiente cujo nome é configurado em `Encryption:PasswordEnvVar`. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Variável padrão do Azure Monitor. Lida diretamente pelo exportador e aceita pelo validador de inicialização, de modo que `Telemetry:ConnectionString` pode ficar sem definir. Veja [Telemetria](telemetry.md). |
| `ASPNETCORE_ENVIRONMENT` | Nome de ambiente padrão do ASP.NET Core (`Development`, `Production`). Os scripts de instalação definem `Production`. Com `Production`, o [`Signing:TrustLacunaTestRoot`](#signingtrustlacunatestroot--certificados-de-teste-para-homologação) é recusado no boot — um host de homologação que confia na raiz de teste roda com outro nome, como `Staging`. |
| `ASPNETCORE_URLS` | Padrão. Os scripts de instalação definem `http://0.0.0.0:8080`. |
| `ASPNETCORE_CONTENTROOT` | Padrão. A instalação no Windows a define como `C:\ProgramData\Lacuna\BulkSigner`, para que os caminhos de arquivo sejam resolvidos em um disco gravável pelo operador. |

## Verificando a configuração em tempo de execução

O banner de resumo de prontidão exibido na inicialização lista as configurações mais importantes para
tomar decisões (modo de host, ambiente, redirecionamento https, content root, raiz de armazenamento,
impressão digital da licença, origem do certificado, política de assinatura, status da criptografia,
intervalo de polling, modo do pipeline e uma linha `operational store` com o provider de banco de
dados). Uma chave digitada errado aparece ali como um valor padrão, em vez do valor que você
pretendia. Outras quatro linhas estão sempre presentes, e cada uma responde a uma pergunta: `trust set`
(se a raiz de teste da Lacuna é confiável — veja
[`Signing:TrustLacunaTestRoot`](#signingtrustlacunatestroot--certificados-de-teste-para-homologação)),
`web pki license` e `cloudhub` (configurado ou não, nunca o valor) e `customer logo` (`none`, o
logotipo carregado ou o motivo de não ter sido carregado). As linhas `ready` e `metrics` mostram
`(anonymous)` ou `(API key)`, então um `Readiness:RequireApiKey` ou `Metrics:RequireApiKey` que não
foi aplicado fica visível no boot.

Linhas que aparecem somente quando o recurso correspondente está configurado:

| Linha do banner | Aparece quando |
|-----------------|----------------|
| `store status`, `store isolation` | `Database:Provider = SqlServer` |
| `work share`, `azure credential`, `azure shares`, `input providers`, `work share owner` | `Storage:Provider = AzureFiles`, ou qualquer pasta de entrada que o indique |
| `blob=…` em uma linha de perfil | o certificado desse perfil é lido do Azure Blob Storage |
| `cnab240=on`, `approval=N/M`, `expires=…` em uma linha de perfil | `CheckCNAB240` / `Approval` nesse perfil |
| prefixo `DEGRADED · ` em uma linha de perfil, com uma linha `FAIL` ao lado | o certificado desse perfil não abriu |

O `/api/ready` retorna um corpo JSON com cada verificação — banco operacional, cada pasta de entrada,
licença, as linhas `storage-share:` e `work-share-owner` em um compartilhamento de trabalho remoto e uma
linha por perfil de assinatura degradado — com o veredito e sem detalhes; o `/api/ready/details`, com a
chave de API, acrescenta o detalhe de cada verificação. Um `503` com um corpo que lista a verificação
que falhou é o ciclo rápido de feedback para erros de configuração — veja
[Diagnóstico de problemas](troubleshooting.md).

Algumas linhas informam `ok: false` **sem** transformar a resposta em `503`, porque um `503` tira a
instância do balanceador de carga, e cada uma delas tem uma solução que a própria instância oferece: a
linha do destino de log em tabela do Azure (uma indisponibilidade do log não deve virar uma
indisponibilidade da ingestão de arquivos), a de um perfil de assinatura degradado (é no dashboard que
ele é corrigido), uma linha `profile-input-folder:` para um perfil vinculado a uma pasta que este host
não configura e, no modo cluster, a linha `cluster-instance` de uma instância que se retirou. **O
alerta deve ler `checks[]`, e não só o `ready` de nível superior.**

---

**A seguir:** [Certificados](certificates.md) — escolhendo e configurando uma origem de certificado.
**Anterior:** [Instalação](installation.md).
