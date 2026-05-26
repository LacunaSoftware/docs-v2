# Instalação do Amplia em Azure App Services

Para instalar uma instância [*on premises*](../index.md) do [Amplia](../../index.md) em um [Azure App Service](https://docs.microsoft.com/azure/app-service/overview),
siga os passos abaixo. Para outras plataformas, [clique aqui](../index.md).

:::tip
Antes de começar, leia a seção [Planejamento antes da instalação](../index.md#planning).
:::


:::tip
Para permitir o uso do recurso de certificados SSL gratuitos pelo *App Service Managed Certificates*,
sugerimos não escolher "naked domains", ou seja, domínios sem porção de subdomínio, por exemplo ~~patorum.com~~.
Prefira, por exemplo, `ac.patorum.com`.
:::


## Preparação

As instruções a seguir assumem que você já tem instalado localmente o [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) e já possui
os seguintes recursos criados na sua conta do Azure:

* Um *SQL Server* (a criação do *SQL database* é coberta por este artigo)
* Um *App Service Plan* com sistema operacional **Linux** (a criação do App Service é coberta por este artigo)
* Zonas de DNS referentes ao [domínio de acesso ao painel de controle](../index.md#dashboard-domain)
  e aos [domínios de acesso](../index.md#access-domains)

Durante a instalação, serão criados alguns recursos:

* Um *Container Registry*
* Um banco de dados (*SQL database*)
* Uma *storage account*
* Um App Service
* Um Azure Key Vault (opcional)

Sugerimos criar um **resource group** para agrupar os recursos criados. Entretanto, essa é uma medida com propósito meramente de organização. O que
realmente é importante é que **todos os recursos sejam criados na mesma região**. Isso é fundamental para o funcionamento adequado do sistema.

:::note
Os passos abaixo descrevem a criação mais básica de cada recurso. Dependendo da sua infraestrutura você pode querer tomar cuidados
adicionais de segurança ou resiliência, como por exemplo restringir o acesso a uma rede privada.
:::


## Criação de um *Container registry*

Siga os procedimentos abaixo para criar um *container registry* para armazenar localmente uma cópia das imagens de Docker do sistema:

1. Na opção **Container registries**, clique em **+ Create**
1. Na primeira aba (*Basics*)
   * Preencha os dados conforme a sua infraestrutura (seguindo a região escolhida para o sistema)
   * Tome nota do *registry name* escolhido
   * Em *SKU*, escolha **Basic**
1. Clique em **Review + create**, em seguida em **Create**

Uma vez concluida a criação do *container registry*, replique a imagem de Docker do sistema para ele (substitua `MY_ACR_NAME` pelo nome escolhido
no passo anterior):

```sh
az login
```

:::note
Caso você tenha acesso a mais de uma conta no Azure, pode ser necessário passar argumento `--tenant YOUR_TENANT`
:::


```sh
az acr login --name MY_ACR_NAME 
az acr import --name MY_ACR_NAME --source docker.io/lacunasoftware/amplia:4.20.0 --image amplia:4.20.0
```

## Criação do banco de dados

Siga os procedimentos abaixo para criar um banco de dados para o sistema (você precisa ter um *SQL Server* previamente criado):

1. Na opção **SQL databases**, clique em **+ Create**
1. Na primeira aba (*Basics*), preencha os dados conforme a sua infraestrutura (seguindo a região escolhida para o sistema)
1. Clique na aba **Additional settings**
1. Em **Collation** preencha `Latin1_General_100_CI_AI`
1. Clique em **Review + create**
1. Clique em **Create**

:::warning
A *collation* do banco de dados **PRECISA SER** `Latin1_General_100_CI_AI`. Criar o banco de dados com uma *collation* diferente provavelmente fará com que a instalação falhe!
:::


Uma vez concluida a criação do banco de dados, clique em **Go to resource**. Em seguida, obtenha a *connection string*:

1. Clique em **Connection strings**
1. Tome nota da connection string exibida na seção **ADO.NET (SQL authentication)**

:::note
Substitua na connection string copiada o trecho `{your_password}` pela senha do banco de dados
:::


## Criação de uma *storage account*

Precisamos de uma *storage account* para armazenar arquivos (o sistema armazena arquivos fora do banco de dados para mantê-lo organizado) e também os
logs de sistema. Siga os passos abaixo para criar uma *storage account* (caso queira utilizar uma conta existente, pule essa parte):

1. Em **Storage accounts**, clique em **+ Create**
1. Na primeira aba (*Basics*), preencha os dados conforme a sua infraestrutura (seguindo a região escolhida para o sistema)
   * Em *Performance*, escolha **Standard**
   * Em *Redundancy*, escolha a opção que preferir (sugerimos a opção **Zone-redundant storage (ZRS)** -- <a href="https://azure.microsoft.com/documentation/articles/storage-redundancy/" target="_blank">clique aqui</a>
     para detalhes sobre as diferentes opções de replicação)
1. Clique em **Review**
1. Clique em **Create**

Uma vez concluída a criação da *storage account*, clique em **Go to resource**. Em seguida, obtenha uma *connection string*:

1. Nas configurações da *storage acount*, clique em **Access keys**
1. Na seção **key1**, tome nota do valor do campo **Connection string**

## Criação do App Service

Siga os procedimentos abaixo para criar um *App Service* (você precisa ter um *App Service Plan* previamente criado com sistema operacional **Linux**):

1. Em **App Services**, clique em **+ Create** em seguida em **+ Web App**
1. Na primeira aba (*Basics*), preencha os dados conforme a sua infraestrutura (seguindo a região escolhida para o sistema)
   * Em *Publish*, escolha **Docker Container**
   * Em *Operating System*, escolha **Linux**
   * Em *Region*, escolha a região onde está o seu *app service plan*
   * Em *Linux Plan* , escolha o seu *app service plan*
   * Clique em **Next : Docker &gt;**
1. Na aba seguinte (*Docker*), preencha:
   * Em *Options*, deixe a opção **Single Container**
   * Em *Image Source*, selecione **Azure Container Registry**
   * Em *Registry*, selecione o *container registry* criado anteriormente
   * Em *Image* e *Tag*, selecione a imagem/tag do sistema conforme o comando `az acr import` realizado anteriormente
   * Deixe a opção *Startup Command* **em branco**
   * Clique em **Review + create**
1. Clique em **Create**

Uma vez concluída a criação do App Service, clique em **Go to resource**. Em seguida, tome nota de seu domínio, por exemplo `meu-app-service.azurewebsites.net`.

Vá em **Configuration** do App Service e adicione as seguintes configurações:

* `ASPNETCORE_ENVIRONMENT`: `Azure`
* `Bindings__HttpsMode`: `Strict`
* `STANDBY`: `True`

Salve as configurações.

Ainda na configuração do App Service, vá na aba **General settings** e, na opção **HTTPS Only**, marque **Off** (a própria aplicação se encarregará de exigir acesso via HTTPS da maneira mais adequada).

Em seguida, vá em **Custom domains** e copie o **Custom Domain Verification ID** (esse valor será necessário mais à frente).

## Configuração de domínios

Crie os apontamentos necessários para o [domínio de acesso ao painel de controle](../index.md#dashboard-domain) e
os [domínios de acesso](../index.md#access-domains):

:::note
Dependendo das suas escolhas, o procedimento abaixo pode ter que ser feito apenas 1 vez (se você escolheu apenas um
domínio de acesso e pretende usá-lo também como domínio de acesso ao painel de controle) ou até 3 vezes (se você escolheu
dois domínios de acesso e pretende usar um terceiro domínio para acessar o painel de controle).
:::


:::note
Nas instruções abaixo, utilizaremos como exemplo a criação do apontamento para o domínio `app.patorum.com`
:::


1. Em **DNS zones**, clique na zona à qual o domínio pertence (ex: `patorum.com`)
1. Clique em **+ Record set**
1. Em *Name*, digite a porção mais à esquerda do domínio (ex: `app`)
1. Em *Type*, selecione **CNAME**
1. Em *Alias record set*, selecione **No**
1. Em *Alias*, preencha o domínio do App Service (ex: `meu-app-service.azurewebsites.net`)
1. Clique em **OK**
1. Clique novamente em **+ Record set**
1. Em *Name*, digite `asuid.` seguido da porção mais à esquerda do domínio (ex: `asuid.app`)
1. Em *Type*, selecione **TXT**
1. Em *Value*, cole o valor do **Custom Domain Verification ID** anteriormente copiado do App Service
1. Clique em **OK**

:::note
Caso você não utilize o Azure como servidor de DNS das zonas, realize o procedimento equivalente no seu servidor de DNS
:::


Após criar os apontamentos para todos os domínios (de 1 a 3 domínios dependendo das suas escolhas),
adicione os domínios ao *App Service* (repita o procedimento abaixo para cada domínio):

1. De volta às configurações do App Service, clique em **Custom domains**
1. Clique em **+ Add custom domain**
1. Selecione **All other domain services**
1. Deixe selecionadas as opções **App Service Managed Certificate** e **SNI SSL**
1. Em *Domain*, preencha o domínio (ex: `app.patorum.com`)
1. Clique em **Validate**
1. Após a validação, clique em **Add**

## Configuração do Amplia

No menu lateral do App Service, na seção *Development Tools*, clique em **SSH**, em seguida em **Go →**. Você será levado a um terminal. Navegue
para a pasta `/app`:

```bash
cd /app
```

:::tip
Embora o terminal pareça iniciar na pasta `/app`, o comando acima **é necessário** devido a um bug do Azure
:::


Execute o comando abaixo para gerar a chave criptográfica utilizada para cifrar valores sensíveis no banco de dados:

```cmd
dotnet Lacuna.Amplia.Site.dll -- gen-enc-key
```

Tome nota do valor gerado.

Escolha uma senha forte para proteger o acesso de *root* ao painel de controle, e calcule o hash dessa senha com o comando abaixo:

```cmd
dotnet Lacuna.Amplia.Site.dll -- hash-root-pass
```

Novamente, tome nota do valor gerado.

Feche o terminal, voltando ao portal do Azure. No App Service, vá em **Configuration** e adicione as seguintes configurações:

* `General__AppDiscriminator`: `Amplia`
* `General__EncryptionKey`: chave criptográfica gerada acima
* `General__RootPasswordHash`: hash da senha de *root* calculado acima
* `General__SiteUrl`: URL pública do site, localizada no [domínio de acesso ao painel de controle](../index.md#dashboard-domain) (ex: `https://ca.patorum.com/`)
* `General__SiteName`: nome da sua instância do Amplia, ex: *Patorum CA*
* `Oidc__Enabled`: `False` (desabilita a [integração com OpenID Connect](../configure-oidc.md), por ora)

Adicione, também, as configurações descritas nas seções a seguir.

### Domínios de acesso

Configure os [domínios de acesso](../index.md#access-domains):

* `Amplia__AccessDomains`: domínios de acesso separados por vírgula, ex: `ca.patorum.com,ca.patorum.org`

### PKI Suite

Configurações do PKI Suite:

* `PkiSuite__SdkLicense`: sua licença para PKI SDK, no formato Base64 (**obrigatório**)
* `PkiSuite__WebLicense`: sua licença para o componente Web PKI no formato binário (Base64). Somente obrigatório se usuário vai emitir certificados em seus computadores (procedimento de emissão web)

### Blob Storage

Configuração da *storage account*:

* `BlobStorage__ConnectionString`: *connection string* da *storage account* criada anteriormente
* `BlobStorage__ContainerName` (opcional): nome do *container* a ser utilizado para armazenar arquivos. Caso omitido, um container denominado *amplia* é utilizado.

### Logging

Configuração de log:

* `Serilog__WriteTo__0__Args__connectionString`: *connection string* da *storage account* criada anteriormente
* `Serilog__WriteTo__0__Args__storageTableName` (opcional): nome da tabela a ser utilizada para armazenar os logs. Caso omitido, uma tabela denomiada *AmpliaLog* é utilizada.

### Connection string

Na seção *Connection strings* (final da página de configurações), clique em **+ New connection string** e preencha:

* **Name**: `DefaultConnection`
* **Value**: valor da connection string obtido durante a criação do banco de dados
* **Type**: escolha **SQLAzure**

Salve as configurações feitas até o momento clicando em **Save**.

### Armazenamento de chaves

Conforme explicado na seção [Armazenamento de chaves](../index.md#key-storage) do planejamento da instalação, é preciso configurar pelo menos um key store para
armazenar chaves. No Azure, recomendamos armazenar chaves no **Azure Key Vault**. Para tanto, siga as [instruções de configuração](../key-stores/azure.md) usando
como nome do key store o valor `Azure`. Em seguida, adicione a configuração:

* `Amplia__DefaultKeyStore`: `Azure`

Outra opção é utilizar o [Armazenamento em banco de dados](../key-stores/database.md). Nesse caso, adicione as seguintes configurações:

* `Amplia__DatabaseKeyStoreEnabled`: `True`
* `Amplia__DefaultKeyStore`: `Database`

### Configurações opcionais

Recomendamos não alterar essas configurações por ora. Uma vez que a sua instância do Amplia esteja no ar, você
pode visitar cada um dos links abaixo para habilitar funcionalidades opcionais:

* [Redirecionamento para HTTPS](../configure-https-redirect.md)
* [Envio de emails](../configure-email.md)
* [Integração com OpenID Connect](../configure-oidc.md) (necessário para gerenciamento de usuários)
* [Envio de SMS](../configure-sms.md) (requerido pela página de emisssão de certificados para usuários finais)

:::note
Nos links acima, sempre que for mencionado algo como "na seção **Sec**, atribua a configuração **Conf** ao valor ...", no Azure App Services você deve
compor o nome da configuração com os nomes da seção e da configuração separados por `__` (**dois** *underscores*), ou seja, no exemplo acima: `Sec__Conf`
:::


## Iniciando o App Service

Por fim, remova a configuração `STANDBY` do App Service e salve as configurações. Em seguida, acesse a URL do painel de controle (o primeiro acesso pode demorar alguns instantes).

Autentique-se com a senha de *root* escolhida durante a configuração. Você então terá acesso ao painel de controle, e a instalação estará concluída.

## Veja também

* [Atualização do Amplia em Azure App Services](update.md)
* [Resolução de problemas](troubleshoot/index.md)
