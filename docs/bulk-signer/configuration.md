---
sidebar_label: "Configuração"
sidebar_position: 3
---

# Configuração

Cada chave do `appsettings.json` do Lacuna Bulk Signer — tipo, padrão, override por variável de
ambiente, e se é obrigatória.

## Origens de configuração, em ordem de precedência

Origens posteriores sobrescrevem as anteriores:

1. `appsettings.json` (padrões embutidos)
2. `appsettings.{Environment}.json` (por exemplo, `appsettings.Production.json`)
3. `appsettings.json` + `appsettings.{Environment}.json` encontrados sob `BULK_SIGNER_CONFIG_DIR`
4. Variáveis de ambiente (`Section__Sub__Key`)

O passo do `BULK_SIGNER_CONFIG_DIR` é o que permite ao binário viver em um local de instalação somente
leitura (`/opt/bulksigner`, `%ProgramFiles%\Lacuna\BulkSigner`) enquanto a configuração de produção
editada pelo operador vive em outro lugar (`/etc/bulksigner`,
`%ProgramData%\Lacuna\BulkSigner\config`). Os scripts de instalação definem essa variável; se você
mudar os caminhos de instalação, atualize a variável junto.

O mapeamento para variáveis de ambiente segue a regra do ASP.NET Core: uma chave JSON como
`Signing:Certificate:Pfx:Password` mapeia para `Signing__Certificate__Pfx__Password` (o duplo
sublinhado é o separador).

:::warning Mudou na 2.3.1 — o `appsettings.json` distribuído é neutro para produção
O `appsettings.json` que acompanha os binários e a imagem **não declara perfis de assinatura, nem bloco
`Signer`, nem segredo de espécie alguma** — nem mesmo um `Auth:ApiKey` de exemplo. Isso importa porque
ele é lido sob qualquer nome de ambiente, e a configuração pode sobrescrever uma chave mas nunca
removê-la: antes da 2.3.1, perfis de exemplo naquele arquivo se mesclavam por baixo de perfis declarados
como variáveis de ambiente. A única consequência na atualização: uma implantação que nunca definiu o
próprio `Auth:ApiKey` estava rodando com o valor de exemplo antigo e agora **se recusa a iniciar,
nomeando a chave**. Defina `Auth__ApiKey` como todo caminho de instalação descreve.
:::

## Marcadores usados nas tabelas

| Marcador | Significado |
|----------|-------------|
| **REQUIRED** | O serviço se recusa a iniciar (ou a assinatura se recusa a rodar) sem um valor não vazio. |
| **SECRET** | Sensível — prefira o override por variável de ambiente a um valor versionado em arquivo. |

## `Logging` / `Logging:File`

Os controles padrão do `Microsoft.Extensions.Logging` (`Logging:LogLevel:*`) funcionam como de
costume; o bloco `Logging:File` configura o destino de arquivo.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Logging:LogLevel:Default` | string | `Information` | `Logging__LogLevel__Default` | Nível de log padrão. |
| `Logging:LogLevel:Microsoft.AspNetCore` | string | `Warning` | `Logging__LogLevel__Microsoft.AspNetCore` | Reduz a tagarelice do framework. O mesmo piso `Warning` é aplicado em código a `Microsoft.AspNetCore` e à categoria de comandos de banco de dados do Entity Framework Core, de modo que nem o pipeline de requisições nem cada instrução SQL executada chegam ao log em `Information`. Comandos que falham continuam sendo registrados. |
| `Logging:File:Path` | string | `data/logs/bulksigner-.log` | `Logging__File__Path` | **REQUIRED.** Template de caminho do destino de arquivo. O `-` final antes de `.log`, somado à rotação diária, produz `bulksigner-yyyyMMdd.log`. |
| `Logging:File:RollingInterval` | string | `Day` | `Logging__File__RollingInterval` | Um de `Day`, `Hour`, `Minute`, `Infinite`. |
| `Logging:File:FileSizeLimitBytes` | long | `50000000` | `Logging__File__FileSizeLimitBytes` | Limite por arquivo; passado ele, o destino rotaciona para `…_001.log`. Limites: 64 KB a 10 GB. |
| `Logging:File:RetainedFileCountLimit` | int | `14` | `Logging__File__RetainedFileCountLimit` | Arquivos mais antigos são apagados conforme a rotação avança. Limites: 1–365. |
| `Logging:File:MinimumLevel` | string | `Information` | `Logging__File__MinimumLevel` | Um de `Verbose`, `Debug`, `Information`, `Warning`, `Error`, `Fatal`. |
| `Logging:File:WriteToConsole` | bool | `true` | `Logging__File__WriteToConsole` | Quando verdadeiro, também escreve na saída padrão. O mesmo formatador com mascaramento roda nos dois destinos. |

## `Logging:AzureTable` — um segundo destino de log

Uma implantação em um sistema de arquivos efêmero — um container que é substituído em vez de
reiniciado — perde `data/logs/` toda vez. Este bloco envia os eventos de log também para uma tabela do
Azure Storage, de modo que o fluxo de diagnóstico sobreviva ao host. É o último de três lugares em que
estado pode migrar para o Azure: arquivos já podem viver em um compartilhamento do Azure Files
([`Storage:Provider`](#storageprovider--storageazurefiles--o-compartilhamento-de-trabalho)) e o
registro operacional no Azure SQL ([`Database`](#database-e-connectionstrings)).

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Logging:AzureTable:Enabled` | bool | `false` | `Logging__AzureTable__Enabled` | Desligado a menos que definido. `true` sobre um bloco incompleto é uma **recusa de boot** nomeando a chave que falta, não um destino silenciosamente inerte. |
| `Logging:AzureTable:TableName` | string | `bulksignerlogs` | `Logging__AzureTable__TableName` | Precisa já existir — o serviço não a cria. Somente alfanuméricos, 3–63 caracteres, não pode começar com dígito; um nome ruim é recusado no boot, e não na primeira escrita. |
| `Logging:AzureTable:MinimumLevel` | string | *(herda `Logging:File:MinimumLevel`)* | `Logging__AzureTable__MinimumLevel` | Estreita a tabela sem estreitar o arquivo. **Defini-lo *abaixo* do mínimo global não faz nada** — aquele gate roda antes de qualquer destino. |
| `Logging:AzureTable:ServiceUri` | string | — | `Logging__AzureTable__ServiceUri` | **REQUIRED quando habilitado.** O endpoint da tabela, por exemplo `https://contosologs.table.core.windows.net`. Uma URL que carregue **query string é recusada** — é assim que uma shared-access signature chega, e SAS deliberadamente não está entre as credenciais de armazenamento deste produto. Recusá-la também mantém este valor não secreto, que é o que torna seguro imprimi-lo no banner de inicialização. |
| `Logging:AzureTable:Credential` | string | — | `Logging__AzureTable__Credential` | **REQUIRED quando habilitado.** `ManagedIdentity`, `ServicePrincipal` ou `AccountKey`. **Nunca assumido por padrão** — veja abaixo. |
| `Logging:AzureTable:AccountName` | string | — | `Logging__AzureTable__AccountName` | Obrigatório para `AccountKey` **e somente nesse modo**: a credencial de chave compartilhada precisa da conta pelo nome, e ela não pode ser lida do `ServiceUri` sem adivinhar se aquela URL é um endpoint de produção ou de emulador. |
| `Logging:AzureTable:AccountKey` | string | — | `Logging__AzureTable__AccountKey` | **SECRET.** Somente no modo `AccountKey`. |
| `Logging:AzureTable:TenantId` | string | — | `Logging__AzureTable__TenantId` | Somente no modo `ServicePrincipal`. |
| `Logging:AzureTable:AppId` | string | — | `Logging__AzureTable__AppId` | Somente no modo `ServicePrincipal`. |
| `Logging:AzureTable:AppSecret` | string | — | `Logging__AzureTable__AppSecret` | **SECRET.** Somente no modo `ServicePrincipal`. Override por env recomendado. |
| `Logging:AzureTable:QueueLimit` | int | `10000` | `Logging__AzureTable__QueueLimit` | Eventos mantidos em memória enquanto a tabela está inalcançável. Além disso, eventos são **descartados e contados** — reportados em `/api/ready` e em `bulksigner_log_sink_dropped_total`. O limite existe porque um buffer sem limite contra uma indisponibilidade longa é matar por falta de memória um serviço de assinatura porque o *log* quebrou. |
| `Logging:AzureTable:BatchSizeLimit` | int | `100` | `Logging__AzureTable__BatchSizeLimit` | Eventos por escrita. Limitado a 100, o teto documentado de uma transação de grupo de entidades; acima dele um lote deixa de ser uma transação, em vez de meramente ficar mais lento. |
| `Logging:AzureTable:BatchPeriodSeconds` | int | `5` | `Logging__AzureTable__BatchPeriodSeconds` | Quanto tempo um lote parcial espera antes de ser escrito. |

**As chaves de credencial são as mesmas que `Storage:AzureFiles` e o blob de material de assinatura de
um perfil usam**, de modo que um operador que configurou uma credencial de armazenamento neste produto
configurou todas. A identidade precisa de **Storage Table Data Contributor** na tabela ou na sua conta.

**Um bloco que não nomeia credencial é recusado no boot.** Recair para uma identidade de
desenvolvimento significaria uma managed identity ausente ou não atribuída funcionando em um laptop e
falhando apenas em produção.

**Prefira `ManagedIdentity` a `AccountKey`.** A Microsoft recomenda proibir a autorização por Shared
Key, e muitas organizações definem `allowSharedKeyAccess = false` na conta — em uma conta assim o
`AccountKey` sequer pode ser configurado. Uma chave de conta também concede acesso total ao plano de
dados da conta *inteira*, então uma chave usada para uma tabela de logs também entregou acesso a
qualquer compartilhamento do Azure Files que a mesma conta abrigue.

### Duas regras que são impostas, não recomendadas

**A tabela nunca pode ser o único destino.** O `Logging:File:Enabled` é a chave de desligamento (para
um sistema de arquivos raiz somente leitura), mas uma configuração em que **ambos os destinos locais
estejam desligados** é recusada no boot: se a tabela parar de aceitar escritas, a falha ao registrar é
ela mesma não registrável. Mantenha o destino de arquivo, ou mantenha o `WriteToConsole` — em um
container isso é a saída padrão, que o `docker logs` e o streaming de logs do App Service já capturam.

:::danger Nada poda a tabela
Sem TTL, sem regra de ciclo de vida, sem exclusão em lote — a tabela cresce até você apagar dela. Leia
[Retenção](retention.md#logs-em-uma-tabela--nada-os-poda) *antes* de habilitar isto, e agende o script
de poda. Se duas implantações compartilham uma conta de armazenamento, dê a cada uma sua própria tabela.
:::

## `Database` e `ConnectionStrings`

A **base operacional** — jobs, seu histórico, eventos operacionais, a flag de pausa do pipeline, as
regras de aprovação congeladas e as aprovações registradas — vive em SQLite por padrão. Ela pode, em
vez disso, viver no seu próprio SQL Server 2022+ ou em um Azure SQL Database.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Database:Provider` | enum | `Sqlite` | `Database__Provider` | `Sqlite` ou `SqlServer`. Não diferencia maiúsculas; ausente significa `Sqlite`, então uma implantação existente não configura nada. Um valor não reconhecido é recusado no boot, nomeando a chave, seu valor e os nomes válidos. |
| `ConnectionStrings:Default` | string | `Data Source=data/db/bulksigner.db` | `ConnectionStrings__Default` | **REQUIRED sob `SqlServer`** — e **SECRET** ali, porque é a totalidade da credencial (login SQL, Entra ID, managed identity, integrada do Windows; não há chave de credencial separada). Sob `Sqlite` pode ser omitida — o padrão acima é real. Aponte um caminho SQLite sob `Storage:Root` para que uma montagem cubra tanto a árvore de dados quanto o banco. |

Deliberadamente **não há um discriminador `Database:Credential`**: o SQL Server expressa autenticação
na connection string há trinta anos, e acrescentar um segundo mecanismo ao lado de um que já funciona
só acrescentaria uma forma de os dois discordarem.

O provider da base é independente de `Storage:Provider` — arquivos em um compartilhamento do Azure
Files com a base em SQLite, ou o contrário, são ambos comuns. **Nenhuma das combinações torna, por si
só, suportado rodar mais de uma instância**: isso é
[`Cluster:Enabled`](#cluster--implantação-com-múltiplas-instâncias), que *exige* `SqlServer` e
`AzureFiles` mas não é implicado por eles. Fora dessa chave, veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho).

Azure SQL Managed Instance e SQL Server em uma VM são *configure como `SqlServer`, não testado* — a
mesma implementação os alcança e não se sabe de nada neles que difira, mas nenhum dos dois é exercitado.

**Três recusas de boot recaem sobre `ConnectionStrings:Default`,** e quais se aplicam depende do
provider:

- Sob `Sqlite`, uma connection string nomeando um local do Azure Files — um arquivo de banco de dados
  acessado por SMB é a forma documentada de corrompê-lo.
- Sob `SqlServer`, o inverso: um data source nomeando um *arquivo* em vez de um servidor, que é o que
  uma implantação que virou o provider e deixou o caminho SQLite para trás produz.
- Sob `SqlServer`, uma string **ausente**. Nenhum servidor é adivinhado, ao passo que sob `Sqlite` um
  caminho de arquivo padrão real é.

Nenhuma recusa jamais ecoa a connection string, porque ela pode carregar uma senha; apenas o data
source é citado.

### Antes de apontá-lo para o SQL Server

1. **O banco de dados precisa já existir.** O Bulk Signer cria suas *tabelas*, não seu banco de dados.
   A sondagem de boot abre uma conexão com o banco que a connection string nomeia, então um banco
   ausente é lido como base inalcançável e a migração é pulada.
2. **Um login com os direitos abaixo,** mapeado para um usuário naquele banco de dados.
3. **Criptografia que o cliente aceite.** O `Encrypt` tem padrão `True` no cliente SQL, então um
   servidor *on premises* cujo certificado TLS o host não confia reprova o login com um erro
   *certificate chain … not trusted*. Instale um certificado confiável no servidor (a correção
   correta) ou, conscientemente e somente onde um ataque man-in-the-middle não seja preocupação,
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

Aquele bloco assume que o banco de dados e o login já existem e que você está conectado **àquele banco
de dados**. Criá-los difere conforme o engine:

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

O `READ_COMMITTED_SNAPSHOT` **já vem ligado** no Azure SQL. Sem ele, as leituras do dashboard tomam
locks compartilhados e travam atrás das escritas do pipeline — o que chega como "o dashboard trava
enquanto um lote assina", e não como uma configuração de banco de dados. O Bulk Signer o reporta e
**nunca emite o comando que o altera**: isso precisa de acesso exclusivo a um banco de dados que é seu.

O `db_ddladmin` é o que cria as tabelas e os índices, então ele é necessário no **primeiro** boot e em
qualquer boot após uma atualização que traga uma migração. Deixar as três roles no lugar é o padrão
mais simples e mais seguro; a migração roda a cada boot e não faz nada quando não há o que aplicar.

### As duas formas de credencial

A connection string a carrega nos dois casos. **Prefira a forma sem senha onde quer que o host consiga
se autenticar como ele mesmo** — não há então segredo a rotacionar, a vazar em um log, ou a encontrar
em um backup.

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

Uma identidade **atribuída pelo usuário** é alcançada acrescentando seu client id como
`User Id=<client-id>` — diferentemente de `Storage:AzureFiles`, cujo modo `ManagedIdentity` é somente
atribuído pelo sistema, porque o cliente SQL adquire o token ele mesmo.

Sob o alvo Serviço do Windows, o serviço roda como a conta virtual `NT SERVICE\LacunaBulkSigner`, que
alcança a rede como a **conta de computador** — então o login a criar no SQL Server é
`DOMINIO\HOSTNAME$`, e não o nome da própria conta virtual.

:::warning A variável de ambiente substitui o valor inteiro — ela não se mescla com o JSON
`ConnectionStrings:Default` é uma única chave de configuração, então não há como manter o servidor no
`appsettings.Production.json` e fornecer apenas a senha pelo ambiente. Ou o JSON carrega a string
completa (o que é aceitável quando ela não tem senha) ou o ambiente carrega. Um valor JSON deixado no
lugar ao lado da variável de ambiente é silenciosamente ignorado.
:::

### Trocar de provider começa com uma base vazia

Não há importador nem verificação no boot para um arquivo SQLite deixado para trás. Uma implantação que
define `Database:Provider = SqlServer` esbarra em um schema vazio: sem jobs, sem histórico, sem eventos
operacionais — **e sem snapshots de aprovação e sem aprovações registradas**, que são as duas coisas
que o produto de outro modo retém para sempre precisamente porque são evidência de quem autorizou um
arquivo de pagamento.

:::danger
**Arquive o antigo `db/bulksigner.db` deliberadamente, antes da troca**, e guarde-o por todo o tempo em
que sua política de retenção exigir a evidência que ele contém. Copie-o com o serviço parado, e
mantenha um cliente SQLite à mão. A troca inversa tem a mesma propriedade. Veja
[Instalação](installation.md#migrando-do-sqlite--arquive-o-arquivo-antigo-primeiro).
:::

### O que o boot lhe diz sobre a base

Toda implantação recebe uma linha `operational store` no banner de resumo de prontidão, nomeando o
provider, e sob `SqlServer` o servidor e o banco de dados junto — nunca a connection string. Uma
implantação `SqlServer` recebe mais duas linhas:

- **`store status`**, de uma sondagem no boot. Uma base inalcançável é **reportada e não impede o
  host** (um banco de dados fora do ar durante uma janela de manutenção não pode transformar uma
  reinicialização em indisponibilidade); a migração é pulada, o `/api/ready` fica vermelho até ela
  responder, e o próximo boot que a encontrar aplica o schema.
- **`store isolation`**, mais um aviso no console de operação, quando o `READ_COMMITTED_SNAPSHOT` está
  desligado. Quando está ligado, nada é reportado.

### Comportamento específico do engine que você não configura

- **Sob `Sqlite`,** toda conexão recebe `journal_mode=WAL`, `synchronous=NORMAL` e
  `busy_timeout=30000`. O WAL impede que as escritas de status por job do pipeline serializem no fsync
  de escritor único do SQLite (o teto de vazão em `Pipeline:MaxConcurrency` mais altos).
- **Sob `SqlServer`, a repetição em falhas transitórias está ligada e não tem controle** — a tentativa
  inicial mais até seis repetições contra os números de erro que o cliente SQL classifica como
  transitórios, cada atraso crescendo exponencialmente e limitado a 30 segundos. Está ligada porque
  rodar contra o Azure SQL efetivamente a exige. Não há chave de configuração, deliberadamente: um
  orçamento de repetição que um operador consegue ajustar é um orçamento de repetição que é ajustado
  para zero durante um incidente.

## `Signing`

A validação falha imediatamente na inicialização se qualquer chave obrigatória estiver faltando ou for
inválida.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:PkiSdkLicense` | string | `""` | `Signing__PkiSdkLicense` | **REQUIRED, SECRET.** String de licença do Lacuna PKI SDK (base64). Forma por variável de ambiente preferida. |
| `Signing:ProfileSecretsKey` | string | `""` | `Signing__ProfileSecretsKey` | **SECRET.** A chave sob a qual todo segredo mantido por um perfil de assinatura *armazenado* é criptografado. Deixe-a indefinida, a menos que os perfis da implantação carreguem um segredo — veja [abaixo](#signingprofilesecretskey--sob-o-que-os-segredos-dos-perfis-armazenados-são-criptografados). |
| `Signing:TrustLacunaTestRoot` | bool | `false` | `Signing__TrustLacunaTestRoot` | Confiar também na **raiz da PKI de teste da Lacuna** — a emissora dos certificados de teste Turing / Fermat — em um ambiente de homologação. **Recusada no boot quando `ASPNETCORE_ENVIRONMENT` é `Production`.** Não é segredo. Veja [abaixo](#signingtrustlacunatestroot--certificados-de-teste-para-uma-homologação). |
| `Signing:Certificate:Source` | enum | `Pfx` | `Signing__Certificate__Source` | **REQUIRED.** Um de `Pfx`, `Pkcs11`, `WindowsStore`, `AzureKeyVault`. Somente a subárvore correspondente abaixo é consultada. |

### `Signing:ProfileSecretsKey` — sob o que os segredos dos perfis armazenados são criptografados

Os perfis de assinatura vivem na base operacional (veja
[`Signing:Profiles[]`](#signingprofiles--perfis-de-assinatura-por-pasta)), então esta chave é
**obrigatória para toda implantação cujos perfis carreguem um segredo** — uma senha de PKCS#12, um
segredo de aplicativo do Azure Key Vault, uma credencial de blob de material de assinatura ou um arquivo
PKCS#12 enviado pelo dashboard. Cada um é criptografado sob ela, e a base nunca guarda nenhum deles em
claro.

**Defina-a antes do primeiro boot que importa perfis**, e antes que alguém crie pelo dashboard um perfil
que carregue um segredo. A importação se recusa em vez de gravar um segredo que não consegue proteger,
nomeando esta chave, sua variável de ambiente e os perfis que carregam segredo; os formulários de criação
e edição do dashboard recusam da mesma forma. Uma implantação cujos perfis não carregam segredo algum —
um PFX sem senha, um token PKCS#11 cujo PIN é uma variável de ambiente, um certificado do repositório do
Windows, um perfil em que os aprovadores assinam — não precisa de chave e nunca é solicitada a fornecer
uma.

Ela deliberadamente **não** fica no banco de dados: uma chave guardada ao lado do seu texto cifrado não
protege contra nada que importe. É também por isso que o key ring de sessão não é reaproveitado para
ela — sob `Cluster:Enabled` aquele ring é ele próprio um conjunto de linhas na mesma base (veja
[O key ring de sessão](#o-key-ring-de-sessão-não-tem-chave-própria-e-não-precisa-de-nenhuma)).

Três casos, decididos de formas diferentes de propósito:

- **Dados protegidos de perfil na base e nenhuma chave para lê-los** interrompe o boot. O remédio é uma
  variável de ambiente, não uma linha em um banco de dados que exigiria o serviço rodando para ser
  alcançado.
- **Uma importação ou um salvamento que criaria dados protegidos sem chave** é recusado naquele
  momento, de modo que a base nunca acaba guardando um valor que nada consegue abrir.
- **Uma chave definida mas *errada*** — rotacionada, restaurada de outro lugar, digitada errado — **não**
  é uma recusa. O serviço inicia, os perfis que ele não consegue ler sobem **degradados** (nomeados no
  banner de inicialização e no `/api/ready`), e todo perfil sem segredo continua assinando. Definir uma
  variável de ambiente resolve uma chave ausente; não resolve nada sobre uma chave rotacionada, então
  recusar seria permanente.

:::danger Perder esta chave significa redigitar o segredo de certificado de cada perfil afetado
Não há custódia de chaves nem caminho de recuperação, e rotacioná-la tem o mesmo efeito que perdê-la.
Faça backup dela onde quer que a senha de criptografia, o `ApproverPortal:LinkSecret` e o
`ApproverSecondFactor:SeedSecret` tenham backup. A recuperação, se acontecer, é redigitar a senha ou
credencial de cada perfil nomeado na página dele no dashboard e reiniciar.
:::

O **PIN do PKCS#11 não é um dos valores que ela protege** e nunca se torna um: ele continua sendo lido da
variável de ambiente nomeada por `Pkcs11:PinEnvVar`, e um PIN escrito em qualquer lugar de onde possa ser
lido de volta é recusado no boot.

### `Signing:TrustLacunaTestRoot` — certificados de teste para uma homologação

O serviço sujeita toda assinatura **somente às raízes da ICP-Brasil** — a chave do perfil quando
assina, o verificador depois, e o certificado de um aprovador antes de o token pedir o PIN — sem nada do repositório do sistema operacional. A **PKI de teste** pública da Lacuna (os
certificados de teste Turing / Fermat) não está sob elas, então, por padrão, um job assinado com um deles
falha e um aprovador que apresente um é recusado como `approval.certificate-invalid`.

`Signing:TrustLacunaTestRoot = true` amplia o conjunto de confiança para ICP-Brasil, o conjunto de
confiança do Windows do PKI SDK (o repositório da máquina, no Windows) e a raiz de teste da Lacuna, para
um ambiente de homologação que queira rodar o produto distribuído com os certificados de teste em vez de
comprar um e-CPF real para cada aprovador. Três coisas a saber:

- **Ela é recusada sob o nome de ambiente `Production`.** O boot falha nomeando a chave, o ambiente e o
  remédio: um host de homologação usa `ASPNETCORE_ENVIRONMENT=Staging` (ou qualquer nome diferente de
  `Production`). O Azure App Service assume `Production` quando nada define o nome, então lá as duas
  configurações andam juntas.
- **Ela é um único conjunto de confiança para o host inteiro.** A chave de todo perfil, toda verificação
  e o certificado de todo aprovador são sujeitos às mesmas raízes; não há forma por perfil. A linha
  `trust set` do banner de inicialização nomeia a raiz de teste da Lacuna quando ela está ligada, e o
  console e o log durável trazem um aviso a cada boot.
- **Ela não é segredo.** Um certificado raiz é material público e a chave é um booleano.

Deixe-a indefinida em toda implantação que assine qualquer coisa real.

### `Signing:Certificate:Pfx` — quando `Source = Pfx`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:Pfx:Path` | string | `""` | `Signing__Certificate__Pfx__Path` | **REQUIRED a menos que `Blob` esteja definido** — exatamente um dos dois. Caminho absoluto para o arquivo `.pfx`/`.p12`. |
| `Signing:Certificate:Pfx:Password` | string | `""` | `Signing__Certificate__Pfx__Password` | **SECRET.** String vazia é permitida para fixtures de teste sem senha. Prefira a forma por variável de ambiente. |

### `Signing:Certificate:Pkcs11` — quando `Source = Pkcs11`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:Pkcs11:ModulePath` | string | `""` | `Signing__Certificate__Pkcs11__ModulePath` | **REQUIRED.** Caminho absoluto para o driver PKCS#11 do fabricante (`.so`/`.dll`/`.dylib`). |
| `Signing:Certificate:Pkcs11:Thumbprint` | string | `""` | `Signing__Certificate__Pkcs11__Thumbprint` | **REQUIRED.** Thumbprint SHA-1 (hexadecimal, sem espaços) do certificado de assinatura no token. Obrigatório mesmo quando o token abriga uma única identidade. |
| `Signing:Certificate:Pkcs11:PinEnvVar` | string | `BULK_SIGNER_PKCS11_PIN` | `Signing__Certificate__Pkcs11__PinEnvVar` | Nome da variável de ambiente que fornece o PIN. O validador se recusa a iniciar se uma chave `Pin` literal aparecer sob `Pkcs11`. |

### `Signing:Certificate:WindowsStore` — quando `Source = WindowsStore`

Somente Windows. O validador recusa esta origem em hosts não Windows na inicialização.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:WindowsStore:StoreLocation` | string | `CurrentUser` | `Signing__Certificate__WindowsStore__StoreLocation` | `CurrentUser` ou `LocalMachine`. Use `LocalMachine` quando o certificado foi importado para toda a máquina; a conta de serviço não enxerga o repositório `CurrentUser` do operador. |
| `Signing:Certificate:WindowsStore:StoreName` | string | `My` | `Signing__Certificate__WindowsStore__StoreName` | Nome lógico do repositório. `My` é o repositório pessoal. |
| `Signing:Certificate:WindowsStore:Thumbprint` | string | `""` | `Signing__Certificate__WindowsStore__Thumbprint` | **REQUIRED.** Thumbprint SHA-1 (hexadecimal, sem espaços). |

### `Signing:Certificate:AzureKeyVault` — quando `Source = AzureKeyVault`

A chave privada permanece no cofre e cada assinatura é uma chamada remota de assinatura; o certificado
público correspondente é fornecido separadamente como um `.cer`. `Endpoint`, `AppId`, `AppSecret` e
`KeyName` são sempre obrigatórios, mais **exatamente um** entre `CerPath` (um arquivo neste host) e
[`Blob`](#blob--lendo-o-arquivo-do-azure-blob-storage) (um objeto no Azure Blob Storage). A
inicialização falha nomeando cada um que estiver faltando.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:AzureKeyVault:Endpoint` | string | `""` | `Signing__Certificate__AzureKeyVault__Endpoint` | **REQUIRED.** URL do cofre. Precisa ser uma URL `https://` absoluta — um nome DNS puro é recusado na inicialização. |
| `Signing:Certificate:AzureKeyVault:AppId` | string | `""` | `Signing__Certificate__AzureKeyVault__AppId` | **REQUIRED.** ID de aplicativo (client) do registro de aplicativo do Microsoft Entra ID. |
| `Signing:Certificate:AzureKeyVault:AppSecret` | string | `""` | `Signing__Certificate__AzureKeyVault__AppSecret` | **REQUIRED, SECRET.** Client secret do Entra ID. Diferentemente do PIN do PKCS#11, este *é* permitido em arquivo de configuração, mas a forma por variável de ambiente é recomendada. |
| `Signing:Certificate:AzureKeyVault:KeyName` | string | `""` | `Signing__Certificate__AzureKeyVault__KeyName` | **REQUIRED.** Nome do objeto **key** no cofre que executa a assinatura. Um objeto *certificate* do cofre não é aceito. |
| `Signing:Certificate:AzureKeyVault:CerPath` | string | `""` | `Signing__Certificate__AzureKeyVault__CerPath` | **REQUIRED a menos que `Blob` esteja definido** — exatamente um dos dois. Caminho para o `.cer` que contém o certificado público de `KeyName`. O boot falha se sua chave pública não corresponder à chave do cofre. |

### `…:Blob` — lendo o arquivo do Azure Blob Storage

Um host **sem disco local durável** — um container, um App Service, um pod do AKS — não tem onde
guardar um `.pfx` ou um `.cer`. As duas origens que nomeiam um arquivo podem, em vez disso, nomear um
blob.

Disponível em **`Pfx`** (abrigando o `.pfx`, em vez de `Path`) e em **`AzureKeyVault`** (abrigando o
`.cer`, em vez de `CerPath`), no bloco legado e em cada entrada de `Signing:Profiles[]`. Exatamente um
entre o caminho local e este bloco; **ambos definidos, ou nenhum, é recusado no boot.** Nada aqui herda
da credencial `AzureKeyVault` ao lado nem de `Storage:AzureFiles`.

Substitua `<SRC>` abaixo por `Pfx` ou `AzureKeyVault`.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Certificate:<SRC>:Blob:Url` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__Url` | **REQUIRED quando o bloco está presente.** URL completa do blob, por exemplo `https://contoso.blob.core.windows.net/certificates/signer.cer`. Precisa ser `https://` absoluta, precisa nomear um container *e* um blob, e **não pode carregar query string** — isso seria uma shared-access signature, que não é uma credencial aceita. Por causa dessa regra a URL nunca é secreta e é impressa no banner de inicialização. Qualquer host é aceito, então nuvens soberanas não precisam de chave extra. |
| `Signing:Certificate:<SRC>:Blob:Credential` | enum | *(não definido)* | `Signing__Certificate__<SRC>__Blob__Credential` | **REQUIRED quando o bloco está presente.** Um de `ManagedIdentity`, `ServicePrincipal`, `AccountKey`. **Nunca assumido por padrão** — usar silenciosamente a identidade Azure do próprio host não é uma decisão tomada em seu nome. |
| `Signing:Certificate:<SRC>:Blob:TenantId` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__TenantId` | **REQUIRED para `ServicePrincipal`.** Obrigatório mesmo quando o `AppId` coincide com o do bloco `AzureKeyVault` — aquele bloco não tem chave de tenant, e nada é herdado. |
| `Signing:Certificate:<SRC>:Blob:AppId` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__AppId` | **REQUIRED para `ServicePrincipal`.** Precisa de **Storage Blob Data Reader** no container. |
| `Signing:Certificate:<SRC>:Blob:AppSecret` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__AppSecret` | **REQUIRED para `ServicePrincipal`, SECRET.** Forma por variável de ambiente recomendada. |
| `Signing:Certificate:<SRC>:Blob:AccountKey` | string | *(não definido)* | `Signing__Certificate__<SRC>__Blob__AccountKey` | **REQUIRED para `AccountKey`, SECRET.** Concede acesso total ao plano de dados da conta inteira e não pode ser restringida; alertada na inicialização. |

:::danger Sob `Pfx`, o blob é a chave de assinatura
Uma chave de conta concede acesso total ao plano de dados da conta de armazenamento inteira, não pode
ser restringida e não expira. Sob `AzureKeyVault` o blob abriga um `.cer` — material público. Sob `Pfx`
ele abriga um arquivo PKCS#12, então **uma chave de conta vazada é a sua chave de assinatura.** Prefira
`ManagedIdentity`, ou `ServicePrincipal` onde o host consiga alcançar um tenant.
:::

O arquivo é lido **uma vez, no boot** — um blob renovado precisa de um restart, exatamente como um
arquivo local renovado. As regras de formato acima (ambos ou nenhum, `Url` ou `Credential` faltando,
uma query string) são recusadas no boot, mas um **blob inalcançável ou ilegível deixa aquele perfil
degradado** e o host rodando: ele é nomeado no banner de inicialização, no log durável e no
`/api/ready`, jobs roteados para ele falham com `profile.degraded`, e todos os outros perfis continuam
assinando. Veja [Certificados](certificates.md#lendo-o-arquivo-de-um-blob).

:::warning Mudou na 2.1.0 — um certificado que não abre não impede mais o host de iniciar
Até a 2.0.x, um único perfil cujo certificado não carregasse — um caminho digitado errado, uma senha
errada, um blob ou cofre inalcançável — recusava o boot inteiro. Os perfis agora são editados pelo
dashboard, e uma página servida por um host que se recusa a iniciar não é caminho de recuperação, então
somente aquele perfil fica **degradado**. Corrija o certificado e **reinicie**: uma chave é aberta uma
vez na inicialização e nunca é recarregada.
:::

Veja [Certificados](certificates.md) para comandos de descoberta de thumbprint, o passo a passo de
configuração no Azure e um olhar mais aprofundado em cada origem.

## `Signing:Profiles[]` — perfis de assinatura por pasta

Um **perfil de assinatura** agrupa sob um nome toda decisão que é por pasta (formato, certificado,
verificação, criptografia, validação de certificado, aprovação). Um perfil escolhe a pasta monitorada
que o alimenta, **uma pasta por perfil**; o `Storage:Inputs[].Profile` é apenas a entrada da semente para
essa escolha (veja [abaixo](#storageinputsprofile--roteamento-por-pasta)).

:::warning Mudou na 2.1.0 — esta seção é uma semente de uso único, não a fonte da verdade
Os perfis de assinatura vivem na **base operacional**. No **primeiro boot contra uma tabela de perfis
vazia** as chaves abaixo são importadas como linhas; daí em diante a base é a autoridade e **esta seção
é ignorada**. Nada é mesclado, e editá-la depois daquele primeiro boot não tem efeito — o log de
inicialização diz isso, nomeando a seção, a cada boot que a encontra ainda preenchida. Mantenha-a se
quiser que uma implantação nova suba já configurada; remova-a quando os perfis estiverem na base.

Daí em diante um perfil é lido, **criado** e editado na página **Perfis de assinatura** do dashboard —
seu comportamento (o formato e as opções liga/desliga abaixo), sua pasta de entrada, sua regra de
aprovação e seu certificado — e é **desabilitado** ali em vez de apagado. A mesma página é onde conferir,
depois do primeiro boot, o que a semente importou. Veja [Dashboard](dashboard.md).
:::

**Uma mudança em um perfil armazenado entra em vigor sem reinicialização — exceto o certificado.** Toda
escrita de perfil é percebida pelo pipeline na consulta que ele já faz, então um perfil editado governa o
próximo job capturado — formato, `Verify`, `Encrypt`, `CheckCNAB240`, `CheckCnab240PaymentDates`, a
pasta de entrada e toda a regra de aprovação — dentro de um `Pipeline:PollIntervalSeconds` em toda
instância. Uma mudança de **certificado** é gravada na hora, mas exige **reinicialização**: um perfil
mantém aberto um handle de chave privada, e trocar uma chave debaixo de um job que está no meio de uma
assinatura não é um risco que valha correr por um campo que muda mais ou menos uma vez por ano. Até a
reinicialização o perfil fica marcado como aguardando uma, e a lista de perfis, o banner e a origem
registrada em cada job continuam nomeando o certificado de fato em vigor — o que mantém o registro de
auditoria de um job honesto sobre o que o assinou.

Dois modos de configuração são suportados, e ambos descrevem o que é **semeado**:

- **Modo legado** (padrão — `Signing:Profiles[]` omitido ou vazio). Um perfil chamado `default` é
  derivado do bloco `Signing:Certificate` existente mais o `Encryption:Enabled` e gravado como uma linha
  real. Nenhuma mudança de configuração é necessária para uma instalação simples de certificado único.
- **Modo de perfis** (declare `Signing:Profiles[]`). Cada entrada é um perfil nomeado com seu próprio
  certificado e sua própria postura. O `Signing:Certificate` é ignorado. Cada entrada é validada como
  se fosse o bloco global de certificado — as mesmas regras de `Pfx` / `Pkcs11` / `WindowsStore` /
  `AzureKeyVault` se aplicam por perfil.

**Um perfil que carregue um segredo precisa do
[`Signing:ProfileSecretsKey`](#signingprofilesecretskey--sob-o-que-os-segredos-dos-perfis-armazenados-são-criptografados)
definido antes daquele primeiro boot.** Uma senha de PKCS#12, um segredo de aplicativo do Azure Key
Vault ou uma credencial de blob de material de assinatura é criptografado em repouso, e a importação se
recusa em vez de gravá-lo em claro.

As regras da tabela abaixo são impostas **onde quer que um perfil mude**: na semente, para uma entrada
declarada aqui, e nos formulários do dashboard, para um perfil criado ou editado ali. Um perfil que já
está na base nunca é revalidado no boot, então uma regra endurecida por uma atualização aparece como um
aviso ou um perfil degradado, e não como um host que não inicia.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signing:Profiles[].Name` | string | n/a | `Signing__Profiles__0__Name` | **REQUIRED.** Mesma regex dos nomes de pasta: `^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$`. Único na lista. O nome é aquilo a que o `Storage:Inputs[].Profile` da semente e o `?profile=` de um upload REST se referem, e aparece em labels de métricas, chips do dashboard e mensagens de auditoria. |
| `Signing:Profiles[].Enabled` | bool | `true` | `Signing__Profiles__0__Enabled` | Se novos arquivos podem ser roteados para este perfil. Um perfil é **desabilitado, nunca apagado**, para que jobs históricos continuem resolvendo para uma regra real e jobs já enfileirados contra um perfil desabilitado rodem até o fim. Imposto onde os arquivos entram: uma pasta monitorada, um upload, um rescan e uma repetição são todos recusados com `profile.disabled`. Definido na página do perfil depois do primeiro boot; desabilitar ali é **recusado enquanto o perfil é alimentado por uma pasta monitorada**, nomeando-a — limpe a pasta no mesmo salvamento, ou passe-a antes para outro perfil. O `default` não pode ser desabilitado de forma alguma — `Enabled: false` nele é uma recusa de boot, já que é para lá que vai um upload que não nomeia perfil. |
| `Signing:Profiles[].Format` | enum | n/a | `Signing__Profiles__0__Format` | **REQUIRED** para todo perfil exceto o `default`: `Pades`, `Cades` ou `Xades`. Somente o `default` — o perfil para onde vai um upload que não nomeia perfil — pode deixá-lo indefinido, caso em que o formato é detectado por arquivo, pela extensão. |
| `Signing:Profiles[].Method` | enum | `Local` | `Signing__Profiles__0__Method` | `Local` (assinar com o certificado local configurado) ou `LacunaSigner` (despachar ao Lacuna Signer para um participante humano). Um perfil `LacunaSigner` é recusado em um host sem a seção [`Signer`](#signer--conexão-com-o-lacuna-signer). Veja [Integração com o Lacuna Signer](lacuna-signer.md). |
| `Signing:Profiles[].Verify` | bool | `true` | `Signing__Profiles__0__Verify` | Quando falso, o worker pula a verificação pós-assinatura. O banner de inicialização emite um aviso, para que a postura de baixa confiança fique visível ao operador, e desligá-la pelo dashboard pede confirmação antes. |
| `Signing:Profiles[].Encrypt` | bool | `false` | `Signing__Profiles__0__Encrypt` | Quando verdadeiro, o worker criptografa a saída assinada com AES-256-GCM. Exige `Encryption:Enabled = true` (o validador recusa a combinação quebrada na inicialização). |
| `Signing:Profiles[].ValidateCertificate` | bool | `true` | `Signing__Profiles__0__ValidateCertificate` | Quando falso, o worker pula a verificação de cadeia / revogação do certificado antes de assinar. O banner de inicialização emite um aviso. O perfil `default` derivado no modo legado carrega `false`, preservando o comportamento de instalações anteriores aos perfis. **Precisa ser `false` quando `Method = LacunaSigner`** — não há certificado local a validar. |
| `Signing:Profiles[].PreserveFileExtension` | bool | `false` | `Signing__Profiles__0__PreserveFileExtension` | Quando verdadeiro, a saída assinada mantém a extensão do arquivo original usando o infixo `.signed` no estilo PAdES: CAdES grava `remessa.signed.rem` em vez de `remessa.rem.p7m`; XAdES grava `nota.signed.nfe` em vez de `nota.signed.xml`. **Válido somente quando `Format = Cades` ou `Xades`** — a saída PAdES já preserva o `.pdf`, então o validador recusa a flag ali. Use quando um sistema a jusante (um banco ingerindo remessas assinadas, por exemplo) exigir a extensão original. |
| `Signing:Profiles[].SaveAsPem` | bool | `false` | `Signing__Profiles__0__SaveAsPem` | Quando verdadeiro, a assinatura CAdES é gravada codificada em PEM (armadura `-----BEGIN PKCS7-----`) em vez de DER puro, e o nome de saída passa a ser `<nome>.pem` em vez de `<nome>.p7m`. **Válido somente quando `Format = Cades`.** A verificação sempre roda sobre os bytes DER antes da codificação PEM; com `Encrypt = true` o envelope BSENC embrulha o texto PEM. Pode ser combinado com `PreserveFileExtension`, caso em que o nome segue aquela flag e apenas o conteúdo é PEM. |
| `Signing:Profiles[].CheckCNAB240` | bool | `false` | `Signing__Profiles__0__CheckCNAB240` | Quando verdadeiro, todo arquivo roteado por este perfil é interpretado e validado como uma **remessa** CNAB240 do Banco do Brasil antes de ser assinado. Um arquivo não conforme nunca chega ao assinador: o job vai para `Failed` com `ErrorMessage = cnab240.invalid`, a cópia em stage é realocada para a pasta de erro, e as violações são registradas no histórico do job e como um evento operacional `Cnab240ValidationFailed`. Aplica-se tanto a `Local` quanto a `LacunaSigner`. A validação é apenas estrutural — veja [Arquivos de pagamento CNAB240](cnab240.md). O casamento de chave não diferencia maiúsculas, então `CheckCnab240` também vincula. |
| `Signing:Profiles[].CheckCnab240PaymentDates` | bool | `true` | `Signing__Profiles__0__CheckCnab240PaymentDates` | *Novo na 2.15.0.* Lido somente quando `CheckCNAB240` é verdadeiro. Quando verdadeiro (o padrão), uma remessa cuja *Data do Pagamento* mais antiga já passou é recusada na chamada de assinatura com `ErrorMessage = cnab240.payment-date-passed`. Quando falso, esse arquivo é assinado, e o histórico do job e um evento operacional `Cnab240PaymentDateCheckSkipped` registram que ele estava vencido — para um banco que processa pagamentos com data passada no próximo dia útil. A validação estrutural não é afetada. Lido no momento da assinatura, nunca congelado no job, então uma mudança alcança a próxima assinatura sem reinicialização, inclusive de um job retido. Veja [Arquivos de pagamento CNAB240](cnab240.md#datas-de-pagamento-que-já-passaram). |
| `Signing:Profiles[].Approval` | aninhado | ausente | `Signing__Profiles__0__Approval__…` | Opcional. Presente significa que jobs neste perfil ficam retidos em `AwaitingApproval` antes de qualquer assinatura existir. **Válido somente ao lado de `CheckCNAB240 = true`** — recusado na semente, e recusado pelos dois lados na página do perfil depois (uma regra de aprovação não pode ser adicionada com a verificação desligada, e a verificação não pode ser desligada enquanto houver uma regra). Um job que mesmo assim chegue à etapa sem a interpretação falha como `approval.content-unmeasured` em vez de ficar retido. Veja abaixo. |
| `Signing:Profiles[].Certificate.*` | aninhado | n/a | `Signing__Profiles__0__Certificate__…` | **REQUIRED quando `Method = Local`**, a menos que o perfil não tenha chave (`Approval.Signers = Approvers`, abaixo). Mesmo formato do bloco global `Signing:Certificate`. Um erro de formato em qualquer entrada — uma chave faltando, um caminho e um blob ao mesmo tempo — reprova a inicialização com um erro agregado; um certificado bem formado que **não abre** deixa aquele perfil degradado e o host rodando. **Recusado quando `Method = LacunaSigner`.** |
| `Signing:Profiles[].Signer.Name` | string | n/a | `Signing__Profiles__0__Signer__Name` | **REQUIRED quando `Method = LacunaSigner`.** Nome de exibição do participante para quem o Lacuna Signer enviará o documento. |
| `Signing:Profiles[].Signer.Email` | string | n/a | `Signing__Profiles__0__Signer__Email` | **REQUIRED quando `Method = LacunaSigner`.** E-mail do participante — precisa conter `@`. |
| `Signing:Profiles[].Signer.Identifier` | string | n/a | `Signing__Profiles__0__Signer__Identifier` | **REQUIRED quando `Method = LacunaSigner`.** Identificador nacional do participante (CPF no Brasil). |

### `Signing:Profiles[].Approval` — a etapa de aprovação

Presente significa que jobs neste perfil param antes de qualquer assinatura existir e esperam por um
humano. Válido somente ao lado de `CheckCNAB240 = true` — um aprovador a quem não se pode mostrar o
valor não está aprovando nada significativo, e o validador recusa a combinação na inicialização.
Aplica-se tanto a `Local` quanto a `LacunaSigner`. Passo a passo completo: [Aprovações](approvals.md).

Como o resto do perfil, o bloco abaixo é entrada da semente: depois do primeiro boot, o pool, o quórum,
o orçamento de espera e o conjunto de signatários são editados na página do perfil, e a mudança alcança o
próximo job que ficar retido. Um job já retido mantém a regra congelada nele no momento da retenção, então
editar um pool nunca autoriza nada retroativamente. Remover alguém de um pool revoga o link de aprovador
dessa pessoa imediatamente.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `…Approval.MinimumApprovers` | int | `1` | `Signing__Profiles__0__Approval__MinimumApprovers` | O **quórum**: quantos membros distintos do pool precisam aprovar. Ao menos 1 e não maior que o pool — um quórum maior que o pool nunca pode ser atingido, então todo job ficaria retido para sempre, e o validador o recusa. |
| `…Approval.ExpiresAfter` | TimeSpan | ausente | `Signing__Profiles__0__Approval__ExpiresAfter` | Orçamento de espera opcional na forma `d.hh:mm:ss` — `"2.00:00:00"` são quarenta e oito horas. Precisa ser positivo. Um job retido por mais tempo é **cancelado** com o motivo `Approval window expired.` e sua cópia em stage movida para `error/`. Ausente (o padrão) significa que um job retido espera indefinidamente. A janela é medida contra o orçamento congelado no job no momento da retenção. É um temporizador de manutenção, não um controle sobre pagamentos vencidos — quem recusa uma remessa cujas datas já passaram é a guarda de data de pagamento. |
| `…Approval.Signers` | string | `ProfileKey` | `Signing__Profiles__0__Approval__Signers` | O **conjunto de signatários**: de quem são as assinaturas que a saída de um job neste perfil carrega — `ProfileKey` (o próprio certificado do perfil, como antes), `Approvers` (cada pessoa que aprova coassina com um certificado próprio) ou `ProfileKeyAndApprovers` (ambos). Um erro de digitação é recusado nomeando os três valores. Congelado no job junto com o resto da regra quando ele fica retido. Os dois conjuntos que incluem aprovadores precisam de um **meio de assinatura** neste host — um [`WebPki:License`](#webpki--lacuna-web-pki-no-navegador-do-aprovador) para um certificado no navegador do aprovador, ou o [`CloudHub`](#cloudhub--lacuna-cloudhub-para-certificados-em-nuvem) para um mantido por um provedor em nuvem, bastando qualquer um dos dois — e de uma forma de identificar o aprovador (`ApproverPortal:Enabled`, ou uma seção `Auth:EntraId`); são recusados quando falta qualquer um dos dois, e também sob qualquer `Format` diferente de `Cades`, já que a assinatura de um aprovador é uma coassinatura CAdES. `ProfileKeyAndApprovers` é recusado, além disso, junto com `Method = LacunaSigner`. Sob `Approvers` o perfil **não tem chave**: seu bloco `Certificate` não é exigido nem validado, nada é aberto para ele na inicialização, e ele não fica degradado por não ter um. Veja [Aprovações](approvals.md). |
| `…Approval.Approvers[]` | array | `[]` | `Signing__Profiles__0__Approval__Approvers__0__…` | **REQUIRED e não vazio** quando `Approval` está presente. O **pool** de pessoas autorizadas a aprovar — *não* uma lista de pessoas que precisam todas aprovar. Com três entradas e `MinimumApprovers: 1`, nenhum indivíduo é obrigatório. |
| `…Approval.Approvers[].Name` | string | n/a | `…__Approvers__0__Name` | **REQUIRED.** Nome de exibição. É o que o registro de auditoria mostra para este aprovador. |
| `…Approval.Approvers[].Email` | string | n/a | `…__Approvers__0__Email` | **REQUIRED**, precisa conter `@`, e precisa ser único dentro do pool (sem diferenciar maiúsculas). Um duplicado permitiria que um humano ocupasse duas vagas do pool e satisfizesse sozinho um quórum de dois. Mascarado na narração de console e nos logs duráveis; armazenado por inteiro no snapshot de aprovação do job. |
| `…Approval.Approvers[].Cpf` | string | n/a | `…__Approvers__0__Cpf` | **REQUIRED.** Onze dígitos, com ou sem pontuação (`123.456.789-09` e `12345678909` vinculam ambos). Os dígitos verificadores são validados na inicialização — um erro de digitação nomeia uma pessoa jurídica ou física diferente, e a linha de auditoria resultante parece exatamente tão autoritativa quanto uma correta. Somente exibição e auditoria: nada se ramifica a partir dele. Ocultado dos logs duráveis. |

:::warning Escreva `ExpiresAfter` com o componente de dias
Um valor de três componentes é `hh:mm:ss` apenas enquanto o primeiro número for 23 ou menos; em 24 ou
mais o .NET o lê como **dias**, então `"48:00:00"` vincula a quarenta e oito *dias* e satisfaz a
verificação de duração positiva. Não é recusado — uma janela longa pode ser deliberada — mas o **banner
de inicialização avisa em 24 dias ou mais**, citando tanto o valor resolvido (`expires=1152h`) quanto a
grafia que o corrige. O boot é o único momento em que isso é detectável.
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

A semente recusa, antes que o primeiro job rode — e a página do perfil recusa ao salvar, depois: um bloco
`Approval` sem `CheckCNAB240`; um pool vazio; um `MinimumApprovers` abaixo de 1 ou maior que o pool; um
e-mail malformado, ou o mesmo e-mail duas vezes; um CPF cujos dígitos verificadores não conferem; um
`ExpiresAfter` não positivo; um conjunto de signatários com aprovadores em um host sem meio de assinatura
ou sem forma de identificar um aprovador.

:::danger A página de aprovação por job é anônima
A etapa é real — um job genuinamente não assina até que gente suficiente aprove — mas o
`/approve/{jobId}` não exige credencial: qualquer um que alcance o link pode aprovar *ou rejeitar* como
qualquer pessoa do pool do job. O banner de inicialização avisa em todo perfil com aprovação
configurada, a cada boot. Habilite o [`ApproverPortal`](#approverportal) ou o
[login pelo Entra ID](#authentraid--login-opcional-pelo-microsoft-entra-id) para estreitar isso, e leia
[Aprovações](approvals.md#segurança) antes de expor o host a uma rede que os navegadores dos
aprovadores consigam alcançar.
:::

### `Storage:Inputs[].Profile` — roteamento por pasta

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Storage:Inputs[].Profile` | string? | `null` (→ "default") | `Storage__Inputs__0__Profile` | Opcional, e **entrada da semente**: lida uma única vez, no primeiro boot contra uma tabela de perfis vazia, para o perfil que ela nomeia — a linha do perfil passa então a carregar a pasta, uma pasta por perfil, e a chave é ignorada nos boots seguintes. Nulo ou vazio vincula o perfil `default`. Uma pasta que a semente não consegue vincular — seu perfil não está em `Signing:Profiles[]`, ou uma pasta anterior já vinculou aquele perfil — fica **sem atribuição**, é reportada na inicialização e aparece assim na página de entradas e no `/api/ready`; seus arquivos esperam até que um perfil a escolha. O host inicia de qualquer forma. |

:::warning Mudou na 2.2.0 — o perfil escolhe sua pasta
Até a 2.1.x esta chave era como uma pasta era roteada, lida a cada boot. Agora o vínculo vive na linha do
perfil na base operacional. Depois do primeiro boot, uma pasta é roteada, movida ou desvinculada na
página do perfil (**Pasta de entrada**, em *Editar comportamento*) e **somente ali**: editar esta chave
não muda nada, e o log de inicialização diz isso com uma linha de aviso contando as chaves de pasta que
ignora. Uma mudança entra em vigor no próximo arquivo, em toda instância, sem reinicialização. Mantenha a
chave se quiser que uma implantação nova suba já roteada; apague-a quando os perfis estiverem na base, e
aquela linha desaparece.
:::

**Nada mais sob `Storage:Inputs[]` mudou de lugar.** `Name`, `Path`, `Provider`, `AzureFiles`,
`PollIntervalSeconds` e as duas listas de ignorados são configuração do host: lidas a cada boot,
validadas pelas regras em
[`Storage:Inputs[]`](#storageinputs--regras-de-validação-impostas-na-inicialização) exatamente como
antes, e não editadas em lugar nenhum da web. A única chave que saiu nunca foi um fato sobre a pasta —
ela dizia qual regra de assinatura os arquivos da pasta recebem, e isso cabe ao perfil dizer.

Uma pasta que nenhum perfil escolheu fica **sem atribuição**: seu observador não enfileira nada, um
rescan a pula e diz isso, e seus arquivos esperam. Um perfil vinculado a uma pasta que este host não
configura mais é reportado no banner de inicialização, como uma linha `profile-input-folder:` no
`/api/ready` que não reprova a sondagem, e como um alerta na página de perfis do dashboard.

### Exemplo: três perfis roteados por pasta, um por origem de certificado

Os perfis são independentes, então uma única implantação pode misturar modelos de custódia de chave — um
HSM para NF-e, um PFX em disco para contratos e uma chave mantida em cofre para faturas — com cada pasta
monitorada alimentando o perfil de que precisa. Qual pasta é essa passa a ser escolha de cada perfil, na
página dele, depois do primeiro boot; a chave `Profile` em cada entrada de `Storage:Inputs[]` semeia a
escolha uma única vez, no mesmo boot que importa estes três.

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

O perfil `invoices` deixa o `AppSecret` vazio no arquivo e o toma do ambiente. Elementos de array são
vinculados por **índice posicional**, então o segredo do terceiro perfil é:

```bash
export Signing__Profiles__2__Certificate__AzureKeyVault__AppSecret='…'
```

Como esse perfil carrega um segredo, o primeiro boot também precisa de `Signing__ProfileSecretsKey`
definido — a importação criptografa o segredo do aplicativo sob ela e se recusa sem ela. Os outros dois
não carregam segredo algum.

:::warning
Aquele índice é posicional, não baseado em nome. Inserir um novo perfil *acima* de `invoices` o desloca
para o índice `3`, a variável de índice `2` deixa de alcançá-lo, e a semente falha com
`Signing:Profiles[3].Certificate.AzureKeyVault.AppSecret is required`. Reconfira toda variável de
ambiente indexada depois de reordenar a lista. Isso só importa até a semente rodar: depois do primeiro
boot o segredo vive, criptografado, no perfil armazenado, e mudá-lo — um client secret rotacionado, por
exemplo — se faz pela página do perfil (*Editar certificado*) seguido de uma reinicialização, e não
mudando a variável.
:::

O banner de inicialização lista cada perfil resolvido com seu formato, origem de certificado e as flags
de verificação/criptografia/validação de certificado. Perfis com `Verify=false` ou
`ValidateCertificate=false` emitem avisos adicionais, para que a postura de baixa confiança fique
capturada nos logs duráveis. Um perfil cujo certificado não abriu é listado com o prefixo
`DEGRADED · ` e o motivo ao lado.

## `Signer` — conexão com o Lacuna Signer

Um tenant do Lacuna Signer por host — o endpoint e a chave de API são globais, não por perfil. O
validador é **autocondicionado a esta seção**: deixe-a de fora por completo e nada aqui é exigido, que é
o que uma implantação somente local faz. Defina qualquer parte dela e o bloco inteiro é validado, porque
um bloco configurado pela metade é uma implantação que descobriria a lacuna no primeiro repasse. Veja
[Integração com o Lacuna Signer](lacuna-signer.md).

:::warning Mudou na 2.1.0 — a seção é julgada por si só, não pelos perfis que existem
Até a 2.0.x estas chaves só eram exigidas quando alguma entrada de `Signing:Profiles[]` tinha
`Method = LacunaSigner` — uma pergunta que a configuração não consegue mais responder quando os perfis
vivem na base. Agora a exigência fica no perfil: **um perfil que seleciona `Method = LacunaSigner` é
recusado — na semente, ou na página do perfil — quando esta seção está ausente.** O mesmo fato decide se
o worker de consulta do assinador remoto roda, então um host com estas configurações está pronto para um
perfil apontado ao Lacuna Signer depois do boot, sem reinicialização. Duas consequências na atualização:
um **bloco `Signer:` escrito pela metade agora recusa o boot** mesmo que nada o use (a mensagem nomeia as
duas chaves e oferece remover a seção como remédio), e um host com o bloco inteiro definido mas nenhum
perfil que o use agora roda o worker de consulta ocioso. Remova a seção se este host assina tudo
localmente.
:::

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Signer:Endpoint` | string | `""` | `Signer__Endpoint` | **REQUIRED** quando algum perfil usa `LacunaSigner`. URL base da instância do Lacuna Signer. Padrão na nuvem: `https://signer.lacunasoftware.com`. Implantações *on premises* apontam para a instância do cliente. |
| `Signer:ApiKey` | string | `""` | `Signer__ApiKey` | **REQUIRED, SECRET** quando algum perfil usa `LacunaSigner`. Formato esperado: `application-id\|secret`. O valor literal é removido dos logs. |
| `Signer:PollIntervalSeconds` | int | `30` | `Signer__PollIntervalSeconds` | Com que frequência o worker de consulta percorre cada linha `AwaitingSigner`. Limites: 1–3600. |
| `Signer:TimeoutHours` | int | `168` (7 dias) | `Signer__TimeoutHours` | Quanto tempo um job pode ficar em `AwaitingSigner` antes de falhar com `code = signer.timeout`. Limites: 1–8760. |
| `Signer:MaxConsecutiveApiFailures` | int | `5` | `Signer__MaxConsecutiveApiFailures` | Orçamento de erros transitórios consecutivos por documento antes de o worker de consulta desistir daquele documento. Contador em memória — reiniciar o zera. |

## `WebPki` — Lacuna Web PKI no navegador do aprovador

Um aprovador que coassina um arquivo de pagamento (um perfil cujo
[conjunto de signatários](#signingprofilesapproval--a-etapa-de-aprovação) é `Approvers` ou
`ProfileKeyAndApprovers`) pode fazê-lo com um certificado no próprio token ou no próprio repositório de
certificados, por meio da extensão de navegador Lacuna Web PKI. A biblioteca que a alcança acompanha o
produto e nunca é carregada de uma CDN, então um aprovador em uma LAN sem acesso à internet ainda recebe
a página. O que o Web PKI precisa do host é uma **licença vinculada aos domínios da implantação**, e esta
seção é onde ela fica.

**A licença não é segredo.** Ela é enviada em claro ao navegador de todo aprovador, que é onde o Web PKI a
confere contra o domínio da página, então ela deliberadamente não é mascarada nos logs. Toda superfície
que a reporta diz configurada-ou-não em vez de mostrá-la: a linha `web pki license` do banner de
inicialização e a página Sistema.

**Ela também não é uma recusa de boot.** A regra vive onde vive toda regra de perfil — na semente e na
página do perfil: um perfil cujo conjunto de signatários inclui aprovadores é recusado, nomeando esta
chave e o `CloudHub:ApiKey`, enquanto **nenhum dos dois** estiver configurado. Uma licença (um
certificado no navegador) ou o [`CloudHub`](#cloudhub--lacuna-cloudhub-para-certificados-em-nuvem) (um
certificado na nuvem) é um *meio de assinatura*, e basta um dos dois. Uma implantação cujos conjuntos de
signatários são todos `ProfileKey` não precisa de seção `WebPki` alguma. Em `localhost` o Web PKI
funciona sem licença.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `WebPki:License` | string | `""` | `WebPki__License` | Obrigatória para um perfil em que os aprovadores assinam, a menos que o `CloudHub` esteja configurado no lugar. Qualquer uma das duas formas que a Lacuna emite — a string binária (base64) ou o documento JSON — repassada ao navegador como veio. Vinculada aos domínios da implantação: obtenha-a da Lacuna para os nomes de host em que os aprovadores vão abrir a página. Deliberadamente **não** marcada como SECRET. |

```json
{
  "WebPki": {
    "License": "<a licença que a Lacuna emitiu para os domínios desta implantação>"
  }
}
```

## `CloudHub` — Lacuna CloudHub para certificados em nuvem

Um aprovador cujo certificado ICP-Brasil foi emitido no HSM de um provedor — um *certificado em nuvem* —
não tem nada que um navegador consiga alcançar, então o Web PKI não consegue assinar por ele. O Lacuna
CloudHub reúne esses provedores atrás de uma API: o produto abre uma sessão para o CPF do aprovador,
envia o navegador dele ao provedor que ele escolher, recebe-o de volta no endereço desta própria
implantação, e assina o arquivo servidor a servidor com o certificado que o provedor autenticou. Esta
seção é o que faz esse meio de assinatura existir em um host; sem chave, nenhuma página o oferece e sua
rota de retorno fica inalcançável.

**Ele serve um lote tão bem quanto um arquivo.** Desde a 2.14.0 o *Aprovar N selecionados* do portal do
aprovador oferece a nuvem ao lado do navegador — e sozinha, em um host sem licença do Web PKI — com um
único login no provedor para o lote inteiro. Nada aqui configura isso à parte.

**A chave é o interruptor, e ela é segredo.** Diferentemente da licença do Web PKI, o `CloudHub:ApiKey`
é uma credencial ao portador para toda sessão que este host abre, então ela é mascarada em todo log.
Defina-a pela variável de ambiente. O validador é **autocondicionado à chave**: deixe-a de fora e nada
aqui é exigido; defina-a e a seção inteira é validada.

**O `PublicBaseUrl` é obrigatório ao lado da chave, e é configurado em vez de derivado.** O CloudHub
precisa de um endereço absoluto para onde devolver o navegador, e este produto renderiza todos os outros
links relativos à requisição. Derivar o endereço de cabeçalhos encaminhados foi rejeitado: um endereço
derivado errado é descoberto por um aprovador encalhado no provedor, enquanto um configurado errado é
recusado no boot. Informe o esquema, o host e qualquer prefixo de caminho em que os aprovadores abrem o
portal, sem query e sem fragmento.

**Ele não é uma recusa de boot para um perfil.** Um perfil em que os aprovadores assinam precisa desta
seção ou de uma licença do Web PKI, bastando qualquer uma, e essa regra é verificada na semente e na
página do perfil. Um host com CloudHub e sem licença do Web PKI é uma implantação legítima em que todo
aprovador assina na nuvem. Nada sonda o CloudHub no boot nem no `/api/ready`: a linha `cloudhub` do
banner de inicialização, a página Sistema e o `/api/ready/details` dizem configurado-ou-não, nomeando o
endpoint, e uma indisponibilidade do lado da Lacuna nunca muda a prontidão deste host.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `CloudHub:ApiKey` | string | `""` | `CloudHub__ApiKey` | **SECRET.** A chave de API do CloudHub que a Lacuna emitiu para esta implantação. Defini-la é o que oferece o meio de assinatura em nuvem. |
| `CloudHub:Endpoint` | string | `https://cloudhub.lacunasoftware.com/` | `CloudHub__Endpoint` | Onde o CloudHub está. Deixe de fora para alcançar a instância pública da Lacuna. Precisa ser uma URL `http(s)` absoluta quando a chave está definida. |
| `CloudHub:PublicBaseUrl` | string | `""` | `CloudHub__PublicBaseUrl` | **REQUIRED quando `ApiKey` está definida.** O endereço absoluto em que os aprovadores alcançam esta implantação — esquema, host e prefixo de caminho, sem query, sem fragmento — para onde o CloudHub devolve o navegador. Recusado no boot quando relativo ou malformado. |

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
| `Encryption:Enabled` | bool | `false` | `Encryption__Enabled` | Chave mestra. Quando verdadeira, o worker criptografa o artefato assinado com AES-256-GCM entre a verificação e a promoção. |
| `Encryption:Password` | string | `""` | `Encryption__Password` | **SECRET.** Senha do PBKDF2. Permitida na configuração (use `appsettings.Production.json`, que está no gitignore), mas a forma por variável de ambiente é preferida. |
| `Encryption:PasswordEnvVar` | string | `BULK_SIGNER_ENCRYPTION_PASSWORD` | `Encryption__PasswordEnvVar` | Nome da variável de ambiente que fornece a senha. Se não vazia no boot, ela sobrepõe `Encryption:Password`. |
| `Encryption:Salt` | string | `""` | `Encryption__Salt` | **REQUIRED** quando `Enabled = true`. Salt do PBKDF2 codificado em base64; precisa decodificar para pelo menos 16 bytes. Salts não são secretos. Mudar o salt invalida todo envelope anterior. |
| `Encryption:Iterations` | int | `600000` | `Encryption__Iterations` | Contagem de iterações do PBKDF2-HMAC-SHA256. Rejeitada abaixo de `10000`. |

:::danger
A perda da senha é **irrecuperável** — não há endpoint de descriptografia no servidor nem custódia de
chaves. Veja [Criptografia](encryption.md).
:::

## `Auth`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Auth:ApiKey` | string | `""` | `Auth__ApiKey` | **REQUIRED, SECRET.** Chave de API estática, mínimo de 16 caracteres. Enviada no cabeçalho `X-API-Key` por clientes programáticos; colada em `/login` por operadores para receber um cookie. Desde a 2.3.1 o `appsettings.json` distribuído não traz valor para ela, então toda implantação precisa definir a sua. |
| `Auth:CookieName` | string | `lbs-auth` | `Auth__CookieName` | Nome do cookie emitido por `/api/auth/login`. `SameSite=Strict`, `HttpOnly`, seguro quando a requisição foi HTTPS. |
| `Auth:ApiKeyHeader` | string | `X-API-Key` | `Auth__ApiKeyHeader` | Cabeçalho HTTP que o esquema de chave de API lê. Renomeie apenas se uma convenção de proxy reverso obrigar. |

Veja [Segurança](security.md) para rotação da chave de API e tempo de vida da sessão em cookie.

### `Auth:EntraId` — login opcional pelo Microsoft Entra ID

**Condicionado à presença — não há flag `Enabled`.** Omita a seção (o padrão) e toda superfície se
comporta exatamente como sem ela; uma implantação isolada da rede nunca precisa de um tenant da
Microsoft. Escreva a seção e as três chaves tornam-se obrigatórias: uma seção parcialmente preenchida
**reprova o host no boot**, nomeando a chave que falta. "Presente mas vazio" significando
silenciosamente *desligado* é exatamente como um operador acaba acreditando que um controle está ativo
quando não está.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Auth:EntraId:TenantId` | string | *(ausente)* | `Auth__EntraId__TenantId` | **REQUIRED quando a seção está presente.** O GUID do diretório (tenant), ou um domínio verificado (por exemplo, `contoso.onmicrosoft.com`). Os pseudo-tenants multi-tenant `common` / `organizations` / `consumers` são recusados — o modo é de tenant único por design. |
| `Auth:EntraId:ClientId` | string | *(ausente)* | `Auth__EntraId__ClientId` | **REQUIRED quando a seção está presente.** O id de aplicativo (client) do registro de aplicativo. Precisa ser um GUID válido — um erro de digitação aqui, de outro modo, apareceria apenas no momento do login como um erro `AADSTS` opaco. |
| `Auth:EntraId:ClientSecret` | string | *(ausente)* | `Auth__EntraId__ClientSecret` | **REQUIRED quando a seção está presente, SECRET.** O segredo de cliente confidencial para o fluxo de authorization code. Defina-o pela variável de ambiente; nunca o versione. |

Não há uma quarta chave. A authority, o caminho de callback, os escopos, o cookie e seu tempo de vida
são todos derivados.

#### O que ligar isso muda

| Superfície | Seção ausente (padrão) | Seção presente |
|------------|------------------------|----------------|
| `/login` | Formulário de chave de API | Botão **Entrar com a Microsoft**. O formulário de chave de API some. |
| `POST /api/auth/login` | Troca a chave de API por um cookie | **Não emite cookie nem para uma chave correta.** Desligado, não escondido. |
| Cookies de operador existentes | Válidos por sua janela deslizante de 8 horas | **Deixam de satisfazer as políticas imediatamente.** Planeje a virada como um "desconectar todo mundo". |
| REST `X-API-Key` | Funciona | **Inalterado.** Clientes automatizados nunca percebem o modo. |
| Páginas de operador | Qualquer cookie autenticado | Exige a app role `Administrator`. |
| `/approvals` e a página de aprovação por job | Somente link do portal do aprovador | Link **ou** uma sessão com role `Approver`; o pool congelado continua delimitando quais jobs ficam visíveis. |
| Identificação registrada na aprovação | `SelfDeclaredEmail` / `LinkDerivedEmail` | Acrescenta `EntraIdEmail` para decisões tomadas em uma sessão do Entra. |
| Sair | Limpa o cookie | Limpa somente a sessão **do Bulk Signer**. A sessão da Microsoft sobrevive, então clicar em "entrar" de novo funciona silenciosamente — comportamento normal de SSO, não um defeito. |

#### As duas app roles

As roles vêm das claims de role do token — atribuições de app role e nada mais. Não há mapeamento por
grupo de segurança, deliberadamente: um mapeamento por grupo faria de uma edição de grupo no tenant uma
mudança de autorização invisível. Os valores no manifesto do registro de aplicativo precisam coincidir
exatamente com estas strings:

| Valor da role | Abre | Página de destino após o login |
|---------------|------|-------------------------------|
| `Administrator` | Todas as páginas e ações de operador que o cookie de chave de API concede hoje. Sem níveis. | `/` |
| `Approver` | Somente as telas de aprovação. A role abre a porta; o **pool congelado ainda decide quais jobs** a pessoa vê, casados pela claim de e-mail. | `/approvals` |
| *(ambas)* | Ambas. Acumular papéis é permitido; a segregação de funções é sustentada pelas verificações de role. | `/` |
| *(nenhuma)* | Nada. Uma conta que se autentica mas não detém role alguma é **recusada** em `/access-denied`. | — |

Um `returnUrl` validado sempre vence sobre o destino baseado em role, então deep links continuam
funcionando.

#### Como uma pessoa conectada é nomeada

**O nome registrado do operador é o UPN.** Todo evento de auditoria que um `Administrator` conectado
escreve — um perfil criado ou editado, o pipeline pausado, jobs limpos, um backup executado — nomeia a
claim `preferred_username` do token, e o menu do usuário mostra o mesmo valor. O UPN em vez do nome de
exibição, porque ele é único no tenant a qualquer momento, enquanto o nome de exibição é texto livre que
duas pessoas podem compartilhar. É o nome no momento do ato, não uma chave durável. Um token que não
carrega `preferred_username` ainda entra, e seus eventos aparecem como `(anonymous)`; o login registra um
aviso nomeando os tipos de claim que recebeu. Isto vale só para o nome do operador — aprovadores
continuam sendo casados com os pools pelo e-mail, como acima.

**Um aprovador do Entra é saudado pelo nome de exibição.** A saudação do portal mostra a claim `name` do
token, recaindo para o endereço quando o tenant a retém — nunca o UPN, que para um convidado é a forma
`#EXT#`. A decisão é registrada contra o e-mail de qualquer forma.

**A janela do segundo fator acompanha a sessão do tenant.** Quando
[`ApproverSecondFactor:Enabled`](#approversecondfactor) está ligado, a janela de verificação de um
aprovador do Entra é indexada pela claim `sid` do token, uma claim padrão do ID token que não exige
mudança no registro de aplicativo; quando um token não carrega nenhuma, o login cria um identificador e
registra o motivo. **Sair apaga a janela da sessão**, porque a sessão do tenant sobrevive ao logout
local do produto e o re-login silencioso de um colega na mesma estação de trabalho a herdaria.

:::note Atualizando de antes da 2.2.1
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

`Auth:ApiKey` continua obrigatória — o `X-API-Key` da superfície REST não é tocado por este modo. As
três chaves do Entra também vinculam somente a partir do ambiente, que é a forma natural para um
container ou uma unit do systemd. O passo a passo do registro de aplicativo está em
[Instalação](installation.md#login-pelo-microsoft-entra-id-opcional).

## `Storage`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Storage:Root` | string | `data` | `Storage__Root` | **REQUIRED.** Raiz sob a qual `processing/`, `output/`, `error/`, `db/`, `logs/` são criados. Sobrescreva por alvo — `/var/lib/bulksigner` no Linux, `C:\ProgramData\Lacuna\BulkSigner\data` no Windows, `/var/lib/bulksigner` no Docker. |
| `Storage:Provider` | enum | `LocalFileSystem` | `Storage__Provider` | `LocalFileSystem` ou `AzureFiles`. Escolhe onde o **compartilhamento de trabalho** — `processing/`, `output/`, `error/` — vive. `logs/` e `db/` sempre ficam locais. Veja abaixo. |
| `Storage:Inputs[]` | array de `{Name, Path, Provider?, AzureFiles?, PollIntervalSeconds?, IgnoredExtensions?, IgnoredPrefixes?, Profile?}` | `[{Name="default", Path="{Root}/input"}]` | `Storage__Inputs__0__Name`, `Storage__Inputs__0__Path`, … | Uma ou mais pastas de entrada monitoradas. Jobs são marcados com o `Name` da pasta e com o perfil de assinatura que escolheu a pasta; uma pasta que nenhum perfil escolheu fica *sem atribuição* e não enfileira nada. Veja abaixo as regras de validação, e [`Storage:Inputs[].Profile`](#storageinputsprofile--roteamento-por-pasta) para o que a semente faz com a única chave de roteamento. |

### `Storage:Inputs[]` — regras de validação (impostas na inicialização)

- `Name` precisa casar com `^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$` e ser único na lista — somente
  letras minúsculas, dígitos e hifens internos, 1–40 caracteres, começando e terminando com
  alfanumérico. Nomes aparecem em query strings de URL, labels de métricas e na interface do dashboard.
- `Path` precisa ser não vazio e resolver para um diretório que **não seja o mesmo que** e **não seja
  subdiretório nem superdiretório de** qualquer caminho de outra entrada. Pastas sobrepostas
  produziriam duplo enfileiramento e atribuição ambígua.
- Limite recomendado: 16 entradas. Contagens maiores inflam a cardinalidade de métricas e a página de
  entradas além de uma densidade útil.
- Quando `Storage:Inputs` é omitido por completo, o serviço cria uma pasta chamada `default` em
  `{Storage:Root}/input`.

### `Storage:Provider` / `Storage:AzureFiles` — o compartilhamento de trabalho

Opcional, e ausente de toda implantação que mantém seu armazenamento local. Definir
`Storage:Provider = AzureFiles` move o **compartilhamento de trabalho** — `processing/`, `output/` e
`error/` — para um compartilhamento do Azure Files alcançado pelo SDK do próprio serviço, sem montagem
SMB e sem dependência no nível do host. O `Storage:Root` continua local e segue abrigando `logs/` e
`db/`.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Storage:AzureFiles:AccountName` | string | n/a | `Storage__AzureFiles__AccountName` | **REQUIRED** quando um provider resolve para `AzureFiles`. Nome da conta sem sufixo; o endpoint é `https://<AccountName>.file.core.windows.net`. |
| `Storage:AzureFiles:ShareName` | string | n/a | `Storage__AzureFiles__ShareName` | **REQUIRED.** O compartilhamento de trabalho. Somente protocolo SMB — um compartilhamento NFS é recusado no boot **nominalmente**. |
| `Storage:AzureFiles:Directory` | string? | `null` (raiz do compartilhamento) | `Storage__AzureFiles__Directory` | Prefixo opcional dentro do compartilhamento, sob o qual `processing/`, `output/` e `error/` são criados. Permite que várias implantações dividam um compartilhamento. **Somente para o compartilhamento de trabalho** — escrevê-lo em uma entrada de `Storage:Inputs[]` é recusado no boot, porque o diretório de uma pasta é o seu `Path`. |
| `Storage:AzureFiles:Credential` | enum | n/a | `Storage__AzureFiles__Credential` | **REQUIRED**, nunca assumido por padrão. `ManagedIdentity`, `ServicePrincipal` ou `AccountKey`. Um bloco parcial para o modo escolhido reprova o host no boot, nomeando a chave que falta. |
| `Storage:AzureFiles:TenantId` / `:AppId` | string | n/a | `Storage__AzureFiles__TenantId`, `…__AppId` | Somente no modo `ServicePrincipal`. |
| `Storage:AzureFiles:AppSecret` | string | n/a | `Storage__AzureFiles__AppSecret` | **SECRET.** Somente no modo `ServicePrincipal`. Permitido na configuração, override por ambiente recomendado. |
| `Storage:AzureFiles:AccountKey` | string | n/a | `Storage__AzureFiles__AccountKey` | **SECRET.** Somente no modo `AccountKey`. **Avisa na inicialização**: uma chave compartilhada é acesso total ao plano de dados da conta inteira, não pode ser restringida a um compartilhamento, e nunca expira. |

O `ManagedIdentity` é **somente atribuído pelo sistema** — uma identidade atribuída pelo usuário não é
lida, e nomear uma produz uma falha de autenticação na primeira chamada, e não um erro de configuração.
A credencial deliberadamente não é `DefaultAzureCredential`, então ela nunca recai para a identidade do
`az login` de um desenvolvedor.

Ambos os modos com token precisam de uma das roles de **dados de arquivo privilegiados**: conceda
`Storage File Data Privileged Contributor`, delimitada ao compartilhamento. Uma role somente leitura
**não** basta nem para uma pasta de entrada, já que o pipeline faz lease do arquivo de entrada enquanto
o coloca em stage e o apaga após a verificação. Veja
[Segurança](security.md#credenciais-de-armazenamento-do-azure-files).

**Um compartilhamento de trabalho, não vários.** `processing/`, `output/` e `error/` precisam ficar
juntos, porque promover um artefato verificado e realocar a cópia em stage de um job que falhou são
**renames**, e o rename do Azure não atravessa compartilhamentos nem contas de armazenamento. Pastas de
entrada continuam plurais e independentes — cada uma pode nomear sua própria conta e compartilhamento —
porque colocar em stage a partir de uma delas é uma *cópia*.

**O que a inicialização recusa, e o que ela apenas reporta.** Um provider ou modo de credencial não
reconhecido, um bloco de credencial parcial, um compartilhamento NFS, um caminho `azurefiles://` em
`Storage:Root`, em `Logging:File:Path` ou — enquanto `Database:Provider` for `Sqlite` — em
`ConnectionStrings:Default`, e uma pasta de entrada que colida com uma das raízes de trabalho no
compartilhamento de trabalho, todos **param o host**. Um compartilhamento **inalcançável** não: ele é
reportado no console de operação, na página Sistema e pelo `/api/ready`, e o host sobe — um
compartilhamento que está fora do ar às 03:00 não pode transformar uma reinicialização em um serviço
que não inicia.

:::note Uma quarta coisa aparece no compartilhamento de trabalho, e não é uma pasta
O `bulksigner-instance.json` fica ao lado de `processing/`, `output/` e `error/`. Ele registra o nome
do host e o id do processo da instância que reivindicou o compartilhamento, e é mantido sob um lease
sem expiração por toda a vida daquela instância. Deixe-o em paz: é ele que lhe diz, no próximo boot,
que uma segunda instância está assinando a partir deste compartilhamento. Veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho).
:::

Os downloads são sempre transmitidos através da aplicação — nenhuma URL de shared-access signature é
jamais criada para um artefato assinado, então o `GET /api/jobs/{id}/output` se comporta identicamente
qualquer que seja o provider que abrigue `output/`. Não há controle de repetição, deliberadamente: a
política do SDK está declarada em código (três tentativas, exponencial de 500 ms a 5 s, timeout de rede
de 30 segundos) e este produto já repete acima dela.

#### Overrides por pasta

Cada pasta de entrada monitorada escolhe seu próprio provider e herda o resto, de modo que ler o
compartilhamento de um cliente na conta *dele* enquanto o compartilhamento de trabalho fica na sua é um
override por pasta, e não uma segunda implantação.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Storage:Inputs[N].Provider` | enum? | herda `Storage:Provider` | `Storage__Inputs__N__Provider` | `LocalFileSystem` ou `AzureFiles`, por pasta. Uma pasta pode ler um compartilhamento enquanto outra continua em disco local durante uma migração. |
| `Storage:Inputs[N].Path` | string | n/a | `Storage__Inputs__N__Path` | **REQUIRED.** Um caminho de sistema de arquivos em uma pasta local; em uma pasta `AzureFiles`, o **diretório dentro do compartilhamento**, separado por `/`. Uma barra invertida é recusada no boot — é um separador local sem significado em um compartilhamento. |
| `Storage:Inputs[N].AzureFiles:*` | objeto | herda `Storage:AzureFiles` campo a campo | `Storage__Inputs__N__AzureFiles__AccountName`, … | Os mesmos membros do bloco acima, menos `Directory`. A herança testa **nulo, não vazio**: uma chave omitida é herdada, e uma string vazia é esta pasta dizendo que não tem tal valor. O `Directory` é **recusado** aqui. |
| `Storage:Inputs[N].PollIntervalSeconds` | int? | herda `WatchedFolder:PollIntervalSeconds` | `Storage__Inputs__N__PollIntervalSeconds` | **REQUIRED na prática em uma pasta `AzureFiles`** — uma que não resolva para intervalo nenhum é recusada no boot. Em uma pasta **local**, *a presença aqui é a adesão*: escrever um intervalo acrescenta enumeração periódica ao comportamento do observador daquela pasta, que é a correção para uma pasta montada de um compartilhamento de rede. Limites: 5–3600. |

:::info Se uma pasta consulta e com que frequência são duas perguntas separadas
A presença de `Storage:Inputs[N].PollIntervalSeconds` é o que faz uma pasta *local* aderir; o
`WatchedFolder:PollIntervalSeconds` global (padrão `30`) é consultado apenas para a **cadência**. Uma
implantação local existente que não escreve intervalo por pasta mantém seu comportamento orientado a
eventos inalterado.
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

Os artefatos assinados aterrissam em `bulksigner/prod/output` na conta `contosofiles`; `logs/` e `db/`
ficam sob `/var/lib/bulksigner`. Remova a linha `Provider` da pasta de entrada e ela herda
`AzureFiles`, caso em que seu `Path` passa a ser um diretório dentro do compartilhamento e ela é
enumerada em `WatchedFolder:PollIntervalSeconds` — o Azure Files não publica notificações de mudança,
então uma pasta que não resolva para intervalo nenhum é recusada no boot.

#### Exemplo: pastas de entrada também em um compartilhamento, autenticando com chave de conta

Para um host que não consegue alcançar o tenant de forma alguma — um servidor *on premises* sem managed
identity e sem registro de aplicativo — o `AccountKey` é o modo remanescente:

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

Cinco coisas que este exemplo mostra:

- **A chave é um segredo para todo compartilhamento que ela abre.** `contabil` sobrescreve `ShareName`
  e nada mais, então `AccountName`, `Credential` e a chave são herdados campo a campo. Escrever
  `"AccountKey": ""` em uma pasta é aquela pasta dizendo que *não* tem chave, e não um pedido para
  herdar uma.
- **O `AccountKey` avisa a cada boot**, no console de operação e no log durável, nomeando cada
  compartilhamento que ele abre.
- **Sem prefixo `Directory`, então as raízes de trabalho ficam na raiz do compartilhamento.** Pastas de
  entrada podem dividir o compartilhamento de trabalho, mas uma entrada cujo `Path` *seja*, fique
  dentro de, ou contenha uma das três raízes é recusada no boot — aquela colisão de outro modo apagaria
  um artefato assinado por iteração enquanto reportaria todo job como `Completed`.
- **Ambas as pastas remotas nomeiam seu próprio intervalo, e a local deliberadamente não nomeia
  nenhum.** O `legacy` não escrever intervalo é o que o mantém orientado a eventos.
- **O banner confirma**, imprimindo `azure credential = AccountKey`,
  `work share = contosofiles/bulksigner`, os providers por pasta e `azure shares = 2 reachable` — os
  compartilhamentos são sondados separadamente, então uma chave que abre um e não o outro fica visível
  na inicialização.

### `Storage:Inputs[].IgnoredExtensions` / `Storage:Inputs[].IgnoredPrefixes` (por pasta)

Arrays opcionais. A lista de ignorados efetiva é a **união** da linha de base global
`WatchedFolder:IgnoredExtensions` / `WatchedFolder:IgnoredPrefixes` com os acréscimos por pasta. Listas
por pasta *somam* à linha de base; elas não conseguem desfazer o filtro de algo que a lista global já
filtra. Exemplo: com a linha de base padrão (`.tmp`, `.part`, `.crdownload`, `.swp`), uma pasta
declarando `IgnoredExtensions: [".bak"]` filtra `.bak` *e* `.tmp` etc.

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
| `Pipeline:PollIntervalSeconds` | int | `2` | `Pipeline__PollIntervalSeconds` | Com que frequência o worker consulta a fila quando ocioso. Menor = captura mais rápida, mais leituras no SQLite. Limites: 1–3600. |
| `Pipeline:MaxConcurrency` | int | `1` | `Pipeline__MaxConcurrency` | Limite superior de jobs concorrentes em andamento. O padrão `1` é sequencial. Aumente para ganhar vazão em implantações com PFX. Limites: 1–32. **PKCS#11 / WindowsStore: mantenha em 1, a menos que o token / CSP permita sessões concorrentes — veja [Certificados](certificates.md).** |
| `Pipeline:RejectAlreadyProcessedFileNames` | bool | `true` | `Pipeline__RejectAlreadyProcessedFileNames` | *Novo na 2.13.0, ligado por padrão.* Recusa um arquivo cujo **nome** um job `Completed` ou ainda ativo já carrega — comparado no host inteiro (toda pasta monitorada, todo perfil, todo upload) e sem diferenciar maiúsculas, porque o `output/` é uma única pasta. De uma pasta monitorada ou de um rescan, o arquivo vira um job que já nasce `Failed` com `file.already-processed`, movido sem assinatura para a pasta `error/` daquele job; um upload é recusado com `409` e o mesmo código. Jobs `Failed` e `Canceled` não reservam nome, e uma repetição é isenta. Apagar o job que detém o nome (em `/jobs`) volta a aceitá-lo. **Desligue para um produtor que reutiliza um mesmo nome de arquivo fixo todo dia.** |

## `WatchedFolder`

O detector de estabilidade protege contra capturar um arquivo que ainda está sendo escrito — o
observador espera até que o tamanho e a data da última escrita permaneçam idênticos ao longo de
`StabilityRequiredSamples` consultas consecutivas.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `WatchedFolder:StabilityPollIntervalMs` | int | `500` | `WatchedFolder__StabilityPollIntervalMs` | Intervalo entre verificações de estabilidade. Limites: 50–10000. |
| `WatchedFolder:StabilityRequiredSamples` | int | `3` | `WatchedFolder__StabilityRequiredSamples` | Amostras idênticas consecutivas necessárias antes do enfileiramento. Limites: 1–100. |
| `WatchedFolder:StabilityConcurrency` | int | `8` | `WatchedFolder__StabilityConcurrency` | Quantos arquivos candidatos cada pasta estabiliza e enfileira concorrentemente. A verificação de estabilidade bloqueia aproximadamente `StabilityRequiredSamples × StabilityPollIntervalMs` por arquivo, então processá-los um de cada vez limita a entrada a cerca de um arquivo por esse intervalo; sobrepor as esperas mantém o pipeline alimentado quando um lote grande de arquivos chega de uma vez. Limites: 1–64. |
| `WatchedFolder:StabilityTimeoutSeconds` | int | `60` | `WatchedFolder__StabilityTimeoutSeconds` | Espera máxima antes de desistir de um arquivo que nunca estabiliza. Limites: 1–3600. |
| `WatchedFolder:PollIntervalSeconds` | int? | `30` | `WatchedFolder__PollIntervalSeconds` | **Com que frequência uma pasta que consulta é enumerada — não se ela consulta.** Sobrescrito por pasta por `Storage:Inputs[N].PollIntervalSeconds`, e é a presença *daquela* chave que liga a consulta para uma pasta local; definir apenas esta não muda nada em lugar nenhum. Uma pasta `AzureFiles` sempre consulta e toma este valor a menos que nomeie o seu. Limites: 5–3600. |
| `WatchedFolder:IgnoredExtensions` | array | `[".tmp", ".part", ".crdownload", ".swp"]` | n/a (use a configuração) | Extensões de arquivo que o observador ignora por completo. |
| `WatchedFolder:IgnoredPrefixes` | array | `[".", "~$"]` | n/a (use a configuração) | Prefixos de nome de arquivo que o observador ignora (dotfiles, arquivos de lock do Office). |

## `Upload`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Upload:Enabled` | bool | `true` | `Upload__Enabled` | *Novo na 2.10.0.* Se este host aceita arquivos por upload. `false` desliga a superfície dos dois lados ao mesmo tempo: `POST /api/files` responde `409` com `upload.disabled` — antes de o perfil ser resolvido, então uma requisição recusada não descobre nada sobre quais perfis existem — e a página Jobs não mostra o botão **Enviar arquivos**. Pastas monitoradas, rescan e repetição não são afetados, então uma implantação alimentada apenas por suas pastas não perde nada. Lido uma vez no boot; religá-lo exige reinicialização. |
| `Upload:MaxBytes` | long | `104857600` (100 MiB) | `Upload__MaxBytes` | Limite rígido do corpo do upload — tanto em `POST /api/files` quanto na caixa de diálogo **Enviar arquivos** do dashboard. Aumente para PDFs pesados de digitalização. Mínimo 1024. |

## `Dashboard`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Dashboard:PollIntervalSeconds` | int | `5` | `Dashboard__PollIntervalSeconds` | Tique de atualização no servidor para as páginas ao vivo do dashboard. Limites: 1–60. |

## `Branding` — o logotipo do cliente nas páginas de login e de aprovação

*Novo na 2.10.0.* A página de login e as páginas do aprovador (`/approve/{id}`, `/approvals` e a página
de link obrigatório) mostram a marca do produto. Nomeie aqui um **logotipo do cliente** e essas páginas
passam a mostrá-lo também: acima de uma marca do produto reduzida no cartão de login, ao lado dela nos
cabeçalhos do aprovador. Um logotipo por implantação, sobre fundo branco — todos esses cartões são
brancos, então uma marca que só funciona sobre fundo escuro é um arquivo a reexportar. Nada mais muda: a
barra do aplicativo, os títulos das páginas e o favicon continuam sendo os do produto.

O logotipo é lido **uma vez, na inicialização**, de um arquivo no host ou de um blob do Azure — os
mesmos dois lugares em que o material de um certificado pode estar, e pelo mesmo motivo: um host do Azure
App Service não tem arquivo que um operador possa colocar. Nomeie **um** dos dois. Não nomear nenhum é
válido e significa sem logotipo; nomear os dois é recusado no boot.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Branding:CustomerLogo:Path` | string | — | `Branding__CustomerLogo__Path` | Caminho para o arquivo de imagem no host — escreva-o absoluto. A extensão decide o content type e precisa ser `.png`, `.jpg`/`.jpeg`, `.webp` ou `.svg`; qualquer outra é recusada no boot. No Docker, um bind mount somente leitura (o arquivo compose do pacote de implantação traz um exemplo comentado). Permitido sob `Cluster:Enabled`, mas o arquivo precisa então ser idêntico em toda instância; nada verifica isso. |
| `Branding:CustomerLogo:Blob:Url` | string | `""` | `Branding__CustomerLogo__Blob__Url` | URL `https://` completa do blob. Uma query string é recusada (sem SAS). A extensão do nome do blob segue a mesma regra da do caminho. Mesmo formato de bloco do [`…:Blob`](#blob--lendo-o-arquivo-do-azure-blob-storage) de um certificado; nada é herdado daquele bloco nem de `Storage:AzureFiles`. |
| `Branding:CustomerLogo:Blob:Credential` | string | — | `Branding__CustomerLogo__Blob__Credential` | `ManagedIdentity`, `ServicePrincipal` ou `AccountKey`. Nunca assumido por padrão. Uma credencial por token precisa de **Storage Blob Data Reader** no container. |
| `Branding:CustomerLogo:Blob:TenantId` / `AppId` / `AppSecret` | string | — | `Branding__CustomerLogo__Blob__…` | Somente no modo `ServicePrincipal`, os três obrigatórios. `AppSecret` é **SECRET** — defina-o pelo ambiente. |
| `Branding:CustomerLogo:Blob:AccountKey` | string | — | `Branding__CustomerLogo__Blob__AccountKey` | Somente no modo `AccountKey`. **SECRET**, e concede a conta de armazenamento inteira — prefira uma credencial por token. |

**Recusado no boot, nomeando a chave:** `Path` e `Blob` definidos ao mesmo tempo; uma extensão fora das
cinco; um bloco de blob sem `Url` ou sem `Credential`, um modo de credencial sem seus valores, ou uma URL
com query string. Cada um é uma configuração que não poderia ter funcionado, fosse qual fosse o conteúdo
do arquivo.

**Reportado e tolerado:** o arquivo ou blob está ausente, ilegível ou inalcançável; o arquivo está vazio
ou passa de **256 KiB**; os bytes não são o que a extensão diz. O serviço inicia, assina e atende; as
páginas mostram só a marca do produto; e o motivo aparece na linha `customer logo` do banner de
inicialização, no log de inicialização como aviso, e na página **Sistema** como alerta até a próxima
reinicialização. O `/api/ready` não traz linha para ele — uma imagem não deve decidir se um serviço de
assinatura está pronto. Corrija o arquivo ou a configuração e reinicie.

**Como ele chega ao navegador.** `GET /branding/customer-logo` serve os bytes anonimamente, porque as
páginas que o mostram são exibidas antes do login. A URL carrega um hash dos bytes e é armazenada em cache
como imutável, então uma reinicialização com um arquivo novo a muda em todo lugar de uma vez e ninguém
precisa limpar cache. Um SVG é servido sob uma política que impede qualquer script que ele carregue de
rodar. Sem logotipo carregado, a rota responde `404` com `branding.customer-logo-not-available`.

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

Sustenta a fila por aprovador em `/approvals`. **Desligado por padrão**, de modo que uma implantação
que já usa a [etapa de aprovação](approvals.md) é atualizada sem tocar na configuração. Lido uma vez na
inicialização — mude qualquer coisa e reinicie.

Uma seção de nível superior em vez de um bloco por perfil, de propósito: um link identifica uma
*pessoa*, e a mesma pessoa rotineiramente participa dos pools de vários perfis.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `ApproverPortal:Enabled` | bool | `false` | `ApproverPortal__Enabled` | Chave mestra. Quando falsa, nenhum link resolve, nenhuma sessão é emitida, e a única superfície de aprovação é o link por job. |
| `ApproverPortal:LinkSecret` | string | — | `ApproverPortal__LinkSecret` | **REQUIRED quando habilitado, SECRET — nunca o versione.** O link de cada aprovador é `HMAC-SHA256(este, o e-mail dele)`, então qualquer um que o leia pode aprovar arquivos de pagamento como qualquer aprovador configurado. Mínimo de 32 caracteres, imposto na inicialização. Precisa ser durável: gerar um por boot invalidaria o favorito de todo aprovador a cada reinicialização. **Mudá-lo revoga o link de todos os aprovadores de uma vez** — o instrumento contundente pretendido para "o segredo vazou". |
| `ApproverPortal:DecidedLookback` | TimeSpan | `90.00:00:00` | `ApproverPortal__DecidedLookback` | Até que ponto no passado a aba *Aprovados* do portal alcança. Limita o quanto vale um link roubado. A aba também é limitada a 200 linhas por carga e avisa quando o limite morde. |
| `ApproverPortal:SessionLifetime` | TimeSpan | `30.00:00:00` | `ApproverPortal__SessionLifetime` | Tempo de vida do cookie emitido pela troca do link. Deslizante, de modo que um aprovador percorrendo uma fila não é desconectado no meio de uma decisão. |
| `ApproverPortal:PollInterval` | TimeSpan | `00:00:10` | `ApproverPortal__PollInterval` | Com que frequência um portal aberto relê a fila, para que a decisão de um colega, uma liberação e um orçamento de espera vencido cheguem sem que o aprovador aperte nada. Uma chave própria em vez de uma fração do [`Dashboard:PollIntervalSeconds`](#dashboard), porque esta se multiplica por todo aprovador com uma aba aberta, enquanto aquela é ajustada por um punhado de operadores. Limites `00:00:01` a `00:05:00`, verificados somente quando `Enabled` é verdadeiro. **Não há valor que desligue a consulta** — um intervalo longo é a forma de reduzir a carga, e a página traz uma atualização manual de qualquer forma. Cuidado: um `10` puro é lido como dez *dias* e é recusado, nomeando o valor recebido. |

`Enabled = true` sem **nenhum** perfil de assinatura armazenado que carregue uma regra de aprovação é um
**aviso de inicialização**, não uma recusa — um portal sobre nenhum pool mostra a todo aprovador uma fila
vazia e parece quebrado, então o banner e o log durável dizem isso.

:::warning Mudou na 2.1.0 — um aviso, não mais uma recusa
Até a 2.0.x isto recusava o boot. Quando os perfis vivem na base e o `Signing:Profiles[]` é só uma
semente, a recusa dispararia exatamente no estado que esta página manda você alcançar: pools na base, a
seção apagada.
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
Envie a cada aprovador apenas o dele; trate-o como a senha daquela pessoa. Veja
[Aprovações](approvals.md#o-portal-do-aprovador).

## `Console:Dashboard`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Console:Dashboard:Enabled` | bool | `true` | `Console__Dashboard__Enabled` | Se o dashboard ao vivo no terminal pode substituir a narração de log por job na saída padrão. Ele ativa apenas quando isto é verdadeiro **e** o processo é um console em primeiro plano (não Serviço do Windows / systemd / Docker) **e** a saída padrão é um terminal interativo. Instalações como serviço e em container, portanto, não são afetadas por esta chave. Defina-a como `false` quando você roda o binário em primeiro plano e quer logs simples em fluxo contínuo. |

## Idioma de exibição — deliberadamente não configurável

Não há seção de configuração para o idioma da interface, e isso é uma decisão em vez de uma lacuna. As
superfícies web renderizam em `en-US` ou `pt-BR` como uma **preferência de apresentação por
navegador**: o seletor de idioma faz POST no anônimo `POST /api/culture`, que grava o cookie de cultura
padrão do ASP.NET Core por um ano. A ordem de resolução é **cookie → o `Accept-Language` do navegador →
`en-US`**, então um operador brasileiro recebe português no primeiro carregamento sem que ninguém
configure nada, e não há uma configuração de servidor que sobreponha o que um leitor individual
escolheu.

O que permanece em inglês permanentemente, independentemente da escolha do leitor: mensagens de
auditoria persistidas (elas são evidência), a saída de log, o dashboard de console, o texto de problema
do REST, os valores de `JobStatus` no protocolo, e todo o vocabulário e formatação do CNAB240. Veja
[Dashboard](dashboard.md#idioma-de-exibição).

## `LogViewer`

Sustenta o armazenamento em memória de exceções recentes e a página `/logs` do dashboard. Todos os
valores são lidos uma vez na inicialização — mude-os e reinicie.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `LogViewer:Enabled` | bool | `true` | `LogViewer__Enabled` | Chave mestra. Quando falsa, o destino em memória não é ligado, a página `/logs` mostra um aviso de desabilitado, e o link de navegação fica oculto. |
| `LogViewer:MaxEntries` | int | `20` | `LogViewer__MaxEntries` | Tamanho do buffer limitado em memória e teto de entradas renderizadas. As entradas mais antigas são despejadas quando esse limite é ultrapassado. Limites: 1–1000. |
| `LogViewer:RefreshIntervalSeconds` | int | `5` | `LogViewer__RefreshIntervalSeconds` | Tique de atualização automática da página `/logs`. Limites: 1–60. A página também tem um botão de atualização manual. |
| `LogViewer:Levels` | string[] | `["Error","Fatal"]` | `LogViewer__Levels__0`, … | Níveis de log que o armazenamento captura (sem diferenciar maiúsculas). Nomes válidos: `Verbose`, `Debug`, `Information`, `Warning`, `Error`, `Fatal`. Nomes vazios ou desconhecidos reprovam a inicialização. **O `Logging:File:MinimumLevel` ainda se aplica primeiro** — alargar isto abaixo daquele mínimo não captura nada, porque aqueles eventos nunca chegam ao destino. |

Veja [Dashboard](dashboard.md#logs--exceções-recentes).

## `Readiness`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Readiness:RequireApiKey` | bool | `false` | `Readiness__RequireApiKey` | *Novo na 2.6.0.* Quando verdadeiro, `GET /api/ready` exige autenticação por chave de API ou cookie — o mesmo portão que o `Metrics:RequireApiKey` coloca em `/api/metrics`. Desligado por padrão, ao contrário daquele, porque o principal consumidor da sondagem é um health check de plataforma que não consegue enviar a chave: o do Azure App Service precisa ser respondido anonimamente, e um `401` em toda instância torna toda instância não saudável de uma vez. Ligue-o onde o sondador consiga enviar `X-API-Key` (os cabeçalhos de uma sondagem do Kubernetes, um agente de monitoração) ou onde nada sonda. Lido uma vez na inicialização; a linha `ready` do banner diz `(anonymous)` ou `(API key)`. O `/api/ready/details` é autenticado de qualquer forma, e o `/api/ready` não traz detalhe de qualquer forma. |

:::warning Mudou na 2.6.0 — a sondagem anônima responde com um veredito, não com uma descrição
O `/api/ready` agora retorna `ready` e o `name` e o `ok` de cada verificação — o campo `detail` por
verificação está ausente. Aquele detalhe nomeava o host do SQL Server, todo compartilhamento de entrada e
a localização de um certificado degradado: nada disso uma credencial, mas junto um mapa da implantação
legível por qualquer um que alcançasse a porta. O mesmo relatório, com todo detalhe, fica em
**`/api/ready/details`**, atrás da chave de API ou de uma sessão de operador, com a mesma regra
`200` / `503`. Um orquestrador que lê o código de status não é afetado; uma monitoração que interpretava
o `detail` passa para a rota de detalhes e acrescenta o cabeçalho. A mudança de veredito de uma
verificação é escrita no log durável uma vez por mudança, então o histórico continua registrado.
:::

## `Metrics`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Metrics:RequireApiKey` | bool | `true` | `Metrics__RequireApiKey` | Quando verdadeiro, `/api/metrics` exige autenticação por chave de API ou cookie. Defina como falso apenas se seu coletor Prometheus estiver dentro do perímetro de confiança e a rede estiver fechada. |

Veja [API REST](rest-api.md) para o inventário completo de instrumentos de métricas.

## `Statistics`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Statistics:Enabled` | bool | `true` | `Statistics__Enabled` | Chave mestra. Quando falsa, o coletor não faz nada (sem registro, sem locking), nenhuma linha é escrita, e o painel do dashboard fica oculto. As estatísticas são uma linha por job concluído na base operacional: elas **sobrevivem a reinicializações**, e toda instância de um cluster lê os mesmos números. Desligar a chave não apaga linhas já registradas — religá-la as mostra de novo; limpar o painel é o [Clear Jobs](operations.md#clear-jobs). |

Veja [Estatísticas de jobs](statistics.md) para o significado de cada número.

## `Backup`

Sustenta a funcionalidade de backup do banco de dados: a página `/backup` do dashboard, o
`GET|POST /api/backup` e o agendador. **Desligada por padrão, e somente SQLite** — com
`Database:Provider = SqlServer`, `Backup:Enabled = true` é uma **recusa de boot** em vez de uma
inoperância silenciosa, porque fazer backup da base é trabalho do regime daquele SGBD. Como o modo
cluster exige `SqlServer`, a combinação é inalcançável ali por construção.

Lida uma vez na inicialização. Somente o bloco do destino selecionado é lido.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Backup:Enabled` | bool | `false` | `Backup__Enabled` | Chave mestra. Quando falsa nada é agendado, o botão de iniciar e o `POST /api/backup` recusam com `backup.disabled`, e a página explica o que ligar. **`true` sob `Database:Provider = SqlServer` recusa o boot**, nomeando ambas as chaves e o remédio. |
| `Backup:Destination` | string | `Disk` | `Backup__Destination` | `Disk`, `S3` ou `AzureBlob`. Ausente significa `Disk` — o destino que não precisa de credencial. Não diferencia maiúsculas; um valor não reconhecido é recusado no boot nomeando a chave, seu valor e os nomes válidos. |
| `Backup:IntervalHours` | int? | *(ausente)* | `Backup__IntervalHours` | Com que frequência um backup roda automaticamente. **Ausente significa somente manual** — a funcionalidade está ligada, o botão funciona, nada roda por temporizador. Limites 1–8760. Um intervalo em vez de uma hora do dia, deliberadamente: uma hora do dia precisa de um fuso horário, que este produto não tem. Ancorado na última execução **bem-sucedida**, de modo que uma reinicialização não o zera e uma execução falha não o consome. Nunca ter feito backup significa que um backup está devido imediatamente. |
| `Backup:RetainCount` | int | `14` | `Backup__RetainCount` | Quantos artefatos manter no destino. `0` mantém **todos** — e sequer lista o destino — para um bucket ou container cujas próprias regras de ciclo de vida fazem a poda. Limites 0–1000. Uma contagem em vez de uma idade, porque uma contagem sobrevive a alguém mudar o `IntervalHours`. A poda roda apenas após um armazenamento bem-sucedido e **não pode reprovar a execução**. |
| `Backup:Disk:Path` | string | — | `Backup__Disk__Path` | **REQUIRED quando `Destination = Disk`.** Sem padrão, de propósito: todo padrão plausível colocaria o backup no mesmo disco do banco de dados do qual ele é backup. Um caminho UNC ou volume de rede montado serve. Quatro recusas de boot: ausente; o esquema `azurefiles://` do próprio produto (um destino de backup deliberadamente **não** é um provider de armazenamento); um caminho dentro de uma **pasta de entrada monitorada** (o pipeline ingeriria, assinaria e então *apagaria* o backup); e um caminho dentro de `processing/`, `output/`, `error/` ou `db/`. |
| `Backup:S3:BucketName` | string | — | `Backup__S3__BucketName` | **REQUIRED quando `Destination = S3`.** |
| `Backup:S3:Region` | string | — | `Backup__S3__Region` | **REQUIRED quando `Destination = S3` e nenhum `ServiceUrl` está definido.** O nome de sistema da região, por exemplo `sa-east-1`. Não assumido por padrão: o SDK recairia para o ambiente do host ou para o perfil compartilhado, então uma região omitida decide por acidente onde uma cópia do registro de aprovação de pagamentos é armazenada. |
| `Backup:S3:Prefix` | string | `""` | `Backup__S3__Prefix` | Prefixo de chave dentro do bucket. Normalizado — `bulksigner`, `bulksigner/` e `/bulksigner/` significam todos a mesma coisa. |
| `Backup:S3:Credential` | string | — | `Backup__S3__Credential` | **REQUIRED quando `Destination = S3`.** `AccessKey` ou `InstanceRole`. **Nunca assumido por padrão** — a própria cadeia do SDK da AWS autenticaria como quem quer que o host por acaso seja. Uma URL pré-assinada não é uma credencial aceita. |
| `Backup:S3:AccessKeyId` | string | — | `Backup__S3__AccessKeyId` | **REQUIRED quando `Credential = AccessKey`.** Deliberadamente **não** ocultado dos logs: é a metade identificadora do par, e mascará-lo removeria o único valor que diz qual chave uma requisição recusada usou. Defini-lo sob `InstanceRole` é uma recusa de boot. |
| `Backup:S3:SecretAccessKey` | string | — | `Backup__S3__SecretAccessKey` | **REQUIRED quando `Credential = AccessKey`. SECRET.** Defini-lo sob `InstanceRole` é uma recusa de boot. |
| `Backup:S3:ServiceUrl` | string | — | `Backup__S3__ServiceUrl` | Um endpoint de **API** compatível com S3 em vez da AWS — MinIO, Ceph, Wasabi, Backblaze B2. `http://` ou `https://` absoluto. Quando definido, `Region` torna-se opcional. |
| `Backup:S3:ForcePathStyle` | bool | `false` | `Backup__S3__ForcePathStyle` | Endereça buckets como um segmento de caminho (`host/bucket/key`) em vez de como subdomínio. `false` é o que a própria AWS quer; **quase todo endpoint compatível com S3 precisa de `true`** — deixá-lo falso contra MinIO ou Ceph produz uma falha de DNS nomeando um hostname que você nunca configurou. |
| `Backup:AzureBlob:ContainerUrl` | string | — | `Backup__AzureBlob__ContainerUrl` | **REQUIRED quando `Destination = AzureBlob`.** A URL https completa do container, por exemplo `https://contoso.blob.core.windows.net/bulksigner-backups`. Recusada no boot quando não é https absoluta, não nomeia uma conta, nomeia mais de um segmento de caminho (coloque um caminho em `Prefix`), ou **carrega query string** — que é como uma SAS chega, e recusá-la mantém este valor permanentemente não secreto. O container **não** é criado para você. |
| `Backup:AzureBlob:Prefix` | string | `""` | `Backup__AzureBlob__Prefix` | Prefixo de nome de blob dentro do container. Normalizado como o do S3. |
| `Backup:AzureBlob:Credential` | string | — | `Backup__AzureBlob__Credential` | **REQUIRED quando `Destination = AzureBlob`.** `ManagedIdentity`, `ServicePrincipal` ou `AccountKey` — grafados exatamente como os de `Storage:AzureFiles`. **Nunca assumido por padrão.** O `ManagedIdentity` é **somente atribuído pelo sistema**. A identidade precisa de **`Storage Blob Data Contributor`** — escrita, não o `Storage Blob Data Reader` de que um blob de certificado precisa. |
| `Backup:AzureBlob:TenantId` / `AppId` | string | — | `Backup__AzureBlob__TenantId`, … | **REQUIRED quando `Credential = ServicePrincipal`.** |
| `Backup:AzureBlob:AppSecret` | string | — | `Backup__AzureBlob__AppSecret` | **REQUIRED quando `Credential = ServicePrincipal`. SECRET.** Defini-lo sob outro modo é uma recusa de boot — um segredo que esta implantação não usa é um que ninguém vai rotacionar. |
| `Backup:AzureBlob:AccountKey` | string | — | `Backup__AzureBlob__AccountKey` | **REQUIRED quando `Credential = AccountKey`. SECRET.** Concede acesso total ao plano de dados da conta de armazenamento **inteira** e não pode ser restringida a um container. Defini-la sob outro modo é uma recusa de boot. |

Nada herda de `Storage:AzureFiles` nem do bloco de um blob de material de assinatura, mesmo onde o
mesmo aplicativo do Entra é nomeado: aquelas credenciais concedem acesso de leitura a recursos
diferentes, e esta precisa de **escrita**.

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

Veja [Retenção](retention.md#disciplina-de-backup) para como isso se encaixa no quadro mais amplo de
retenção.

## `Cluster` — implantação com múltiplas instâncias

Modo cluster — mais de uma instância ativa cooperando sobre uma base operacional e um compartilhamento
de trabalho. **Desligado por padrão, e desligado é, byte a byte, o produto de instância única**: uma
implantação que nunca escreve esta seção não precisa de nada e não muda nada na atualização.

Estas três chaves são a menor parte de ligar o modo. O que ele custa está em
[Alta disponibilidade e seus limites](high-availability.md) — leia isso antes de definir
`Enabled = true` — e como implantá-lo é [Azure App Service (modo cluster)](azure.md), que também traz
as configurações de plataforma (afinidade de sessão, o caminho do health check, Always On) que não têm
chave aqui porque não cabe a este produto defini-las.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Cluster:Enabled` | bool | `false` | `Cluster__Enabled` | Chave mestra. Quando verdadeira, as recusas de boot abaixo se aplicam; quando falsa ou ausente, nenhum mecanismo de cluster é registrado e nada muda. A topologia com múltiplas instâncias suportada é exatamente uma: um Azure Web App (container Linux) com escala horizontal em um App Service Plan. |
| `Cluster:HeartbeatSeconds` | int | `15` | `Cluster__HeartbeatSeconds` | Com que frequência esta instância escreve uma linha dizendo que está viva. Faixa `[5, 300]`, recusada no boot fora dela. Lida somente quando o modo está ligado. |
| `Cluster:StaleAfterSeconds` | int | `60` | `Cluster__StaleAfterSeconds` | Quanto tempo uma instância pode ficar em silêncio antes de suas irmãs a presumirem morta. Faixa `[15, 3600]`, e recusada no boot quando vale **menos de três cadências** — um limiar tão curto presume morte a uma ou duas batidas perdidas, e uma batida se perde por motivos que não são morte (uma pausa de coleta, uma base que demorou um instante, um container que a plataforma privou de recursos brevemente). O padrão são quatro cadências. |

### O que `Enabled = true` recusa no boot

Toda configuração de cluster que não poderia ter funcionado é uma recusa nomeando as chaves e o remédio:

- **`Database:Provider` precisa ser `SqlServer`.** A base é o ponto de coordenação do cluster, e um
  arquivo SQLite não pode ser compartilhado entre hosts.
- **O compartilhamento de trabalho e toda pasta de entrada monitorada precisam estar em
  `AzureFiles`.** O lease da base local de arquivos não exclui nada fora do próprio processo, e uma
  pasta local a uma instância é invisível para suas irmãs. A pasta `default` sintetizada sem
  configuração é local, então uma primeira execução com a chave ligada também recusa.
- **As origens de certificado por host `Pkcs11` e `WindowsStore` são recusadas.** Um token ou um
  repositório de máquina vive em uma máquina, e instâncias de cluster são intercambiáveis. Use `Pfx`
  (idealmente [lido de um blob](#blob--lendo-o-arquivo-do-azure-blob-storage)) ou `AzureKeyVault`. Um
  bloco `Certificate` obsoleto em um perfil com `Method = LacunaSigner` continua tolerado, como é em
  todo lugar. Esta é uma regra sobre um **perfil**, então ela é aplicada onde quer que uma origem de
  certificado seja declarada: no boot, para uma entrada de `Signing:Profiles[]` ou para o bloco legado
  `Signing:Certificate`, e no formulário do dashboard quando um perfil é criado ou seu certificado é
  reapontado. Um perfil **salvo antes de a chave ser ligada** é só um **aviso** de inicialização
  nomeando o perfil e sua origem — um perfil armazenado nunca é revalidado, e recusar tiraria do ar a
  página que é o remédio. Ele assina na instância cujo hardware encontrou e falha como perfil degradado
  em todas as outras.

Uma recusa **não** é sobre configuração de forma alguma, e está listada aqui porque se lê como se
fosse: com o modo ligado, o próprio marcador do compartilhamento de trabalho registra a qual base
operacional o compartilhamento pertence, e uma instância cuja base não corresponde se recusa a iniciar,
nomeando ambas. Isso é um fato sobre o compartilhamento, e não sobre o `appsettings.json`, e é a única
coisa que pega dois clusters apontados para um compartilhamento de trabalho.

Uma condição de cluster é deliberadamente um **aviso, não uma recusa**: modo cluster com
`Logging:AzureTable:Enabled = false` registra um Critical na inicialização, porque na topologia
suportada o disco da instância é efêmero e arquivos de log rotacionados são descartados a cada
reciclagem. A regra de nunca-um-único-destino mantém o destino de arquivo local ligado de qualquer
forma.

### Identidade e vivacidade

**A identidade é derivada, nunca configurada, e deliberadamente não há chave para ela.** Uma instância
se chama pelo id de instância da própria plataforma (`WEBSITE_INSTANCE_ID`, que o App Service define em
toda instância) ou pelo nome da máquina onde não existe tal variável, mais um identificador de
**encarnação** novo a cada boot. O App Service cria e destrói instâncias por regra de escala, então um
nome que um operador digitasse seria uma chave que ninguém conseguiria manter verdadeira; a encarnação
é o que permite a uma instância distinguir *sua própria vida anterior* de uma estranha.

Cada instância mantém uma linha na base operacional — identidade, encarnação, versão da aplicação,
quando iniciou, quando disse pela última vez que estava viva — atualizada a cada
`Cluster:HeartbeatSeconds` e presumida morta passado `Cluster:StaleAfterSeconds`. A
[página Sistema](dashboard.md#system--sistema) renderiza aquela tabela como sua visão **Instâncias**.
Duas coisas cavalgam sobre ela no boot, deliberadamente diferentes em natureza — uma toma a identidade,
a outra só avisa:

- **Uma instância subindo que encontre sua própria identidade já batendo a desloca**, nomeando a
  encarnação deslocada no console e no log, e continua. Essa é a sobreposição de uma reimplantação: o
  App Service roda o container antigo e o novo sob um mesmo id de instância e mantém o antigo batendo até
  o novo estar aquecido. O processo deslocado **se retira** na sua próxima batida — não captura nenhum
  job novo, termina o que detém, e mostra uma linha `cluster-instance` vermelha no seu `/api/ready` que
  não reprova a sondagem. O dono de um job é a **encarnação** além da identidade, então a todo momento
  exatamente um processo captura trabalho sob um nome, e o que o deslocado deixar inacabado é assumido
  `Cluster:StaleAfterSeconds` depois do deslocamento. Um desligamento limpo aposenta sua linha de
  heartbeat, então um sucessor não tem nada a deslocar. Dois hosts que de fato apresentam o mesmo nome
  se deslocam um ao outro, ruidosamente dos dois lados, em vez de serem recusados; a única recusa que
  sobra é um registro que perdeu toda corrida de escrita pela sua linha.
- **Instâncias vivas em uma versão diferente da aplicação registram um Critical e o boot continua.**
  Atualizações na topologia suportada param o mundo, então isto é um deployment slot trocado para
  dentro de um cluster em execução, ou uma implantação que não parou toda instância. É um aviso em vez
  de uma recusa de propósito: recusar bloquearia instâncias de subir por todo o tempo que um heartbeat
  *morto* da versão antiga levasse para ficar obsoleto, que é exatamente quando um operador precisa que
  elas subam.

Se a base operacional estiver inalcançável no boot, o registro é pulado junto com a migração e o host
ainda inicia. O heartbeat faz o registro na sua primeira batida que alcançar a base — deslocando um
detentor vivo da identidade exatamente como o boot teria feito — então a instância fica ausente da visão
Instâncias só até lá.

:::warning Mudou na 2.5.0 — deslocada, não mais recusada
Até a 2.4.x uma instância subindo que encontrasse sua própria identidade batendo se recusava a iniciar (a
2.4.3 a fez esperar em vez disso), então uma troca de imagem no lugar no App Service custava ao menos um
início recusado. As atualizações continuam parando o mundo, e *parar, implantar, iniciar* continua sendo
a receita mais limpa; veja
[Azure App Service](azure.md#8-atualizações-param-o-mundo).
:::

### O key ring de sessão não tem chave própria, e não precisa de nenhuma

Fora da chave, o ring de Data Protection é o `keys/` sob `Storage:Root`, criptografado com DPAPI no
Windows. Ligado, ele são linhas na base operacional, em texto claro, guardadas pelo controle de acesso
do próprio banco de dados — porque um ring derivado de uma raiz local é estruturalmente de um host, de
modo que, atrás de um balanceador de carga, um cookie criado por uma instância é rejeitado pela
seguinte, o que alcança as pessoas como uma desconexão intermitente sem que nada em lugar nenhum a
reporte. Ambos os cookies o utilizam, então ele deixa órfãos operadores e aprovadores igualmente.

Ele segue a chave em vez de uma configuração deliberadamente: uma implantação que possa escolher o
posicionamento independentemente da topologia é uma implantação que pode escolher a combinação
quebrada. Veja [Segurança](security.md) e
[Alta disponibilidade](high-availability.md#o-key-ring-de-sessão-fica-em-texto-claro-na-base).

## `Telemetry`

Exportação opcional para o Azure Application Insights. Desligada por padrão; quando desligada, o
serviço não tem dependência do Application Insights e não faz chamadas de saída em nome dele.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Telemetry:Enabled` | bool | `false` | `Telemetry__Enabled` | Chave mestra. Quando `true`, uma connection string é **obrigatória** — a inicialização falha sem uma. |
| `Telemetry:ConnectionString` | string? | `null` | `Telemetry__ConnectionString` | **SECRET.** Connection string do Application Insights. Deixe indefinida para fornecê-la pela variável de ambiente padrão `APPLICATIONINSIGHTS_CONNECTION_STRING`. |
| `Telemetry:RoleName` | string | `Lacuna.BulkSigner` | `Telemetry__RoleName` | Reportado como a dimensão `cloud_RoleName`, de modo que vários serviços dividindo um recurso continuem distinguíveis. |

Veja [Telemetria](telemetry.md) para o que é coletado e as consultas KQL para lê-lo.

## `RateLimiting`

Políticas de janela fixa por IP.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `RateLimiting:Enabled` | bool | `true` | `RateLimiting__Enabled` | Chave mestra. Desabilite para instalações em rede fechada. |
| `RateLimiting:Upload:PermitsPerWindow` | int | `30` | `RateLimiting__Upload__PermitsPerWindow` | Requisições permitidas por janela em `POST /api/files`. |
| `RateLimiting:Upload:WindowSeconds` | int | `60` | `RateLimiting__Upload__WindowSeconds` | Duração da janela da política de upload. |
| `RateLimiting:Upload:QueueLimit` | int | `0` | `RateLimiting__Upload__QueueLimit` | Quantas requisições acima do limite esperam em vez de serem rejeitadas imediatamente. 0 = rejeitar imediatamente. |
| `RateLimiting:Actions:PermitsPerWindow` | int | `60` | `RateLimiting__Actions__PermitsPerWindow` | Requisições permitidas por janela nos endpoints de ação (repetir, cancelar, reescanear, limpar, pausar, retomar). |
| `RateLimiting:Actions:WindowSeconds` | int | `60` | `RateLimiting__Actions__WindowSeconds` | Duração da janela da política de ações. |
| `RateLimiting:Actions:QueueLimit` | int | `0` | `RateLimiting__Actions__QueueLimit` | Profundidade de fila da política de ações. |
| `RateLimiting:Approval:*` | mesmo formato | `10` por `60` s | `RateLimiting__Approval__PermitsPerWindow`, … | Orçamento para a rota anônima `POST /api/approvals/{id}`, separado do das ações de operador. Ids de job são GUIDs v4, e esta política é o que os mantém inadivinháveis contra uma máquina, e não contra uma pessoa. |
| `RateLimiting:Export:*` | mesmo formato | `10` por `60` s | `RateLimiting__Export__PermitsPerWindow`, … | Orçamento para as exportações para Excel: a exportação da fila do portal do aprovador e, desde a 2.11.0, o `GET /api/jobs/export` da página Jobs. Limita a rapidez com que cópias de uma fila podem ser feitas, e fica separado do `Approval` para que uma rajada de exportações nunca gaste as permissões de que um colega precisa para registrar uma decisão. |

Respostas limitadas por taxa carregam `code = "rate-limited"` no envelope de erro.

## `Hosting`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Hosting:RequireHttps` | bool | `false` | `Hosting__RequireHttps` | Controla o redirecionamento HTTPS em processo. `false` (padrão) para instalações como serviço e Docker que terminam o TLS em um proxy reverso. Aparece no banner de resumo de prontidão como `https redirect = on/off`. |
| `Hosting:ForwardedHeaders:Enabled` | bool | `false` | `Hosting__ForwardedHeaders__Enabled` | Lê o endereço e o esquema do cliente de `X-Forwarded-For` e `X-Forwarded-Proto`. Desligado por padrão, e desligado é, byte a byte, o produto como ele foi entregue — nenhum middleware é adicionado. Ligá-lo **exige um conjunto de confiança**: um de `TrustAnyProxy`, `KnownProxies` ou `KnownNetworks`, ou o boot é recusado. Aparece no banner de resumo de prontidão como `forwarded headers = …`, nomeando o conjunto de confiança em vez de apenas `on`. |
| `Hosting:ForwardedHeaders:TrustAnyProxy` | bool | `false` | `Hosting__ForwardedHeaders__TrustAnyProxy` | Acreditar em um cabeçalho encaminhado de **qualquer** endereço a montante. A configuração pretendida no Azure App Service, cujo front door não tem endereço estável a listar. ⚠️ Em uma implantação com proxy reverso, significa que qualquer um que alcance o Kestrel diretamente pode se declarar qualquer endereço de cliente. Não pode ser combinada com as duas chaves abaixo — uma lista ao lado dela seria ignorada, então é recusada no boot em vez de resolvida por precedência. |
| `Hosting:ForwardedHeaders:KnownProxies` | string[] | `[]` | `Hosting__ForwardedHeaders__KnownProxies__0` | Endereços IP puros cujos cabeçalhos encaminhados são acreditados (`10.4.0.7`, `::1`). Um valor que não seja endereço IP é recusado no boot, nomeando-o. **Os padrões de loopback do framework não são mantidos** — quando esta seção nomeia um conjunto de confiança, aquele conjunto é a totalidade dele, então um proxy neste host precisa ser listado. |
| `Hosting:ForwardedHeaders:KnownNetworks` | string[] | `[]` | `Hosting__ForwardedHeaders__KnownNetworks__0` | Faixas CIDR cujos cabeçalhos encaminhados são acreditados (`10.4.0.0/16`). Recusada no boot se não for uma faixa CIDR, ou se o endereço carregar bits abaixo do comprimento do prefixo — `10.4.0.7/16` descreve `10.4.0.0/16`, e um arquivo que diz uma faixa enquanto o host confia em outra vale a pena reprovar. |
| `Hosting:ForwardedHeaders:ForwardLimit` | int | `1` | `Hosting__ForwardedHeaders__ForwardLimit` | Quantas entradas são tomadas do extremo direito de cada cabeçalho encaminhado — uma por proxy pelo qual a requisição genuinamente passa, que é `1` tanto para um balanceador de carga de plataforma quanto para um único proxy reverso. Faixa `[1, 16]`, recusada no boot fora dela; o "ilimitado" do framework é deliberadamente inalcançável, porque uma cadeia ilimitada é uma cuja ponta distante o cliente escreveu. |

### Por que os cabeçalhos encaminhados são uma chave do produto e não apenas a chave do framework

O ASP.NET Core tem sua própria chave, `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, e ela confia em
**qualquer** upstream, sem forma de estreitar isso. Definir tanto ela quanto
`Hosting:ForwardedHeaders:Enabled` é **recusado no boot**, nomeando ambas: cada uma acrescenta
processamento de cabeçalhos encaminhados, então todo cabeçalho seria processado duas vezes e um
`ForwardLimit` de um silenciosamente acreditaria em dois saltos.

Duas coisas no produto agem sobre o endereço do cliente, e é por isso que em quais cabeçalhos você
acredita é uma questão de configuração, e não um detalhe:

- **A partição da limitação de taxa.** Atrás de um balanceador de carga todo chamador chega de um único
  endereço, então o orçamento por cliente da rota de aprovação anônima vira um único orçamento
  compartilhado pelo mundo inteiro.
- **O endereço registrado em uma aprovação**, que é um dos controles compensatórios da rota de
  aprovação anônima. Um endereço que na verdade é o do balanceador de carga não registra nada sobre
  quem decidiu.

No Azure App Service a configuração pretendida é `Enabled = true` com `TrustAnyProxy = true`, e o risco
que isso carrega é fechado travando a origem — veja
[Azure App Service](azure.md#entrada--front-door-na-frente-do-app).

## `ApproverSecondFactor`

Um segundo fator TOTP para aprovadores — um código de um aplicativo autenticador, conferido contra uma
inscrição por pessoa. **Desligado por padrão**, então atualizar não muda nada. Lido uma vez na
inicialização; mude qualquer coisa e reinicie.

De escopo do host, e não por perfil de assinatura, e essa é a escolha que sustenta a carga em vez de
uma conveniência: uma regra por perfil é congelada no job quando ele fica retido, e autenticação não
pode estar naquele snapshot — o snapshot registra *qual regra se aplicou*, de modo que editar este
arquivo nunca pode ser um desvio de autorização. Uma chave de escopo do host não tem nada por perfil a
congelar, então um job que ficou retido antes de o fator ser habilitado não precisa de migração nem de
caso especial.

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `ApproverSecondFactor:Enabled` | bool | `false` | `ApproverSecondFactor__Enabled` | Chave mestra. Quando falsa, nada em nenhuma superfície de aprovação muda e nenhum valor de `ApproverSecondFactor:*` é lido. Quando verdadeira: o painel de inscrição aparece em `/approvals`, **toda decisão no portal pede um código uma vez por janela de verificação**, e as duas superfícies que não carregam sessão de navegador — `POST /api/approvals/{id}` e uma decisão a partir de `/approve/{jobId}` — **recusam de imediato**. Essa última parte quebra qualquer ERP que dirija aprovações por REST; veja [Aprovações](approvals.md#provando-que-é-você). |
| `ApproverSecondFactor:SeedSecret` | string | — | `ApproverSecondFactor__SeedSecret` | **REQUIRED quando habilitado. SECRET — nunca o versione.** A chave sob a qual a semente do autenticador de cada aprovador é criptografada em repouso (PBKDF2-HMAC-SHA256 → AES-256-GCM). Mínimo de 32 caracteres, o mesmo piso que o `ApproverPortal:LinkSecret` carrega. Ela **criptografa** as sementes; ela não as deriva — as sementes são aleatórias por aprovador, deliberadamente, para que deter o primeiro fator não possa criar o segundo. **Perdê-la ou rotacioná-la significa que todo aprovador se inscreve de novo.** |
| `ApproverSecondFactor:VerificationWindow` | TimeSpan | `00:20:00` | `ApproverSecondFactor__VerificationWindow` | Quanto tempo um fator comprovado vale antes de precisar ser comprovado de novo. **Zero é legítimo e significa "perguntar a cada decisão"** — a configuração mais estrita, não uma desabilitada. Absoluta, nunca deslizante, e delimitada a uma sessão de navegador. Limites `00:00:00` a `08:00:00`. **Congelada em cada janela quando o código é digitado**, de modo que editá-la governa janelas abertas depois e não muda nada nas já abertas. |
| `ApproverSecondFactor:Issuer` | string | `Lacuna Bulk Signer` | `ApproverSecondFactor__Issuer` | O rótulo que um aplicativo autenticador mostra acima do código. Carregado no parâmetro `issuer` da URI de provisionamento e repetido em seu label, porque os aplicativos discordam sobre qual deles leem. Defina-o quando um diretório abriga vários ambientes e um aprovador, de outro modo, veria duas contas com nomes idênticos. |

:::warning Sempre escreva o componente de dias em `VerificationWindow`
Um valor de três componentes é `hh:mm:ss` apenas enquanto o primeiro número for 23 ou menos; em 24 ou
mais o binder o lê como *dias*, então `"24:00:00"` significa vinte e quatro dias. Diferentemente do
`ExpiresAfter`, que aceita isso silenciosamente, o teto de oito horas aqui o transforma em uma recusa
de boot que nomeia o erro.
:::

### Três recusas de boot

`Enabled = true` reprova a inicialização, nomeando a chave, quando:

1. **`SeedSecret` está ausente ou tem menos de 32 caracteres.** As inscrições são ilegíveis sem ela,
   então um fator meio configurado não é um controle mais fraco — é um cuja força ninguém declarou.
2. **`VerificationWindow` é negativa ou está acima de oito horas.** Além de um turno, o valor deixa de
   descrever presença em um teclado e passa a descrever uma sessão, que é aquilo por ser o que uma
   janela deslizante foi rejeitada.
3. **`ApproverPortal:Enabled` é falso *e* nenhuma seção `Auth:EntraId` está configurada.** Essas são as
   duas únicas superfícies que produzem uma sessão identificada, e o fator é comprovado dentro de uma
   delas. Sem nenhuma, ninguém poderia se inscrever, todo job em um perfil com aprovação configurada
   ficaria retido indefinidamente, e nenhum arquivo de pagamento seria assinado.

## `AllowedHosts`

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `AllowedHosts` | string | `*` | `AllowedHosts` | Filtragem de host padrão do ASP.NET Core. Sobrescreva com uma lista separada por vírgulas se a instalação estiver atrás de proxy reverso com um nome de host externo fixo. |

## Variáveis de ambiente que não têm contraparte em JSON

| Variável | Finalidade |
|----------|------------|
| `BULK_SIGNER_CONFIG_DIR` | Diz ao binário onde a configuração de produção vive quando o binário está em um local de instalação somente leitura. Definida pelos scripts de instalação. |
| `BULK_SIGNER_PKCS11_PIN` | O PIN do HSM/token — lido no nome de variável de ambiente configurado por `Signing:Certificate:Pkcs11:PinEnvVar`. |
| `BULK_SIGNER_ENCRYPTION_PASSWORD` | Senha do PBKDF2 — lida no nome de variável de ambiente configurado por `Encryption:PasswordEnvVar`. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Variável padrão do Azure Monitor. Lida diretamente pelo exportador e honrada pelo validador de inicialização, de modo que `Telemetry:ConnectionString` pode ficar indefinida. Veja [Telemetria](telemetry.md). |
| `ASPNETCORE_ENVIRONMENT` | Nome de ambiente padrão do ASP.NET Core (`Development`, `Production`). Os scripts de instalação definem `Production`. Sob `Production`, o [`Signing:TrustLacunaTestRoot`](#signingtrustlacunatestroot--certificados-de-teste-para-uma-homologação) é recusado no boot — um host de homologação que confia na raiz de teste roda sob outro nome, como `Staging`. |
| `ASPNETCORE_URLS` | Padrão. Os scripts de instalação definem `http://0.0.0.0:8080`. |
| `ASPNETCORE_CONTENTROOT` | Padrão. A instalação no Windows a define como `C:\ProgramData\Lacuna\BulkSigner`, para que a resolução de caminhos de arquivo caia em disco gravável pelo operador. |

## Verificando a configuração em tempo de execução

O banner de resumo de prontidão impresso na inicialização lista as configurações mais críticas para
decisão (modo de host, ambiente, redirecionamento https, content root, raiz de armazenamento,
impressão digital da licença, origem do certificado, política de assinatura, status da criptografia,
intervalo de consulta, modo do pipeline, e uma linha `operational store` nomeando o provider de banco
de dados). Uma chave digitada errado aparece ali como um valor padrão, em vez do valor que você
pretendia. Outras quatro linhas estão sempre presentes e cada uma responde a uma pergunta: `trust set`
(se a raiz de teste da Lacuna é confiável — veja
[`Signing:TrustLacunaTestRoot`](#signingtrustlacunatestroot--certificados-de-teste-para-uma-homologação)),
`web pki license` e `cloudhub` (configurado ou não, nunca o valor), e `customer logo` (`none`, o
logotipo que carregou, ou o motivo de não ter carregado). As linhas `ready` e `metrics` dizem
`(anonymous)` ou `(API key)`, então um `Readiness:RequireApiKey` ou `Metrics:RequireApiKey` que não
vinculou fica visível no boot.

Linhas que aparecem somente quando a funcionalidade correspondente está configurada:

| Linha do banner | Aparece quando |
|-----------------|----------------|
| `store status`, `store isolation` | `Database:Provider = SqlServer` |
| `work share`, `azure credential`, `azure shares`, `input providers`, `work share owner` | `Storage:Provider = AzureFiles`, ou qualquer pasta de entrada que o nomeie |
| `blob=…` em uma linha de perfil | o certificado daquele perfil é lido do Azure Blob Storage |
| `cnab240=on`, `approval=N/M`, `expires=…` em uma linha de perfil | `CheckCNAB240` / `Approval` naquele perfil |
| prefixo `DEGRADED · ` em uma linha de perfil, com uma linha `FAIL` ao lado | o certificado daquele perfil não abriu |

O `/api/ready` retorna um corpo JSON nomeando cada sondagem — base operacional, por pasta de entrada,
licença, as linhas `storage-share:` e `work-share-owner` em um compartilhamento de trabalho remoto, e uma
linha por perfil de assinatura degradado — com seu veredito e sem detalhe; o `/api/ready/details`, com a
chave de API, acrescenta o detalhe de cada sondagem. Um `503` com um corpo listando a sondagem que falhou
é o ciclo rápido de feedback para erros de configuração — veja
[Diagnóstico de problemas](troubleshooting.md).

Algumas linhas reportam `ok: false` **sem** tornar a resposta um `503`, porque um `503` tira a instância
do balanceador de carga e cada uma delas tem um remédio que a própria instância serve: a do destino de
log em tabela do Azure (uma indisponibilidade de log não deve virar uma indisponibilidade de ingestão), a
de um perfil de assinatura degradado (o dashboard é onde ele é corrigido), uma linha
`profile-input-folder:` para um perfil vinculado a uma pasta que este host não configura, e, no modo
cluster, a linha `cluster-instance` de uma instância que se retirou. **O alerta deve ler `checks[]`, e
não só o `ready` de nível superior.**

---

**A seguir:** [Certificados](certificates.md) — escolhendo e configurando uma origem de certificado.
**Anterior:** [Instalação](installation.md).
