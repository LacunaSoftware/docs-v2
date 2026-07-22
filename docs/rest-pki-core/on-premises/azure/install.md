---
sidebar_position: 2
sidebar_label: "Instalação"
slug: /rest-pki/core/on-premises/azure/install
---

# Instalação do Rest PKI Core em Azure App Services

Para instalar uma instância [*on premises*](../index.md) do [Rest PKI Core](../../index.md) em um [Azure App Service](https://docs.microsoft.com/azure/app-service/overview),
siga os passos abaixo. Para outras plataformas, [clique aqui](../index.md#platforms).

:::tip
Para permitir o uso do recurso de certificados SSL gratuitos pelo *App Service Managed Certificates*, sugerimos não escolher "naked domains", ou seja,
domínios sem porção de subdomínio, por exemplo ~~patorum.com~~. Prefira, por exemplo, `restpki.patorum.com`.
:::


## Preparação

As instruções a seguir assumem que você já tem instalado localmente o [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) e já possui
os seguintes recursos criados na sua conta do Azure:

* Um *SQL Server* (a criação do *SQL database* é coberta por este artigo)
* Um *App Service Plan* com sistema operacional **Linux** (a criação do App Service é coberta por este artigo)
* Uma zona de DNS referente ao domínio de acesso ao Rest PKI Core

Durante a instalação, serão criados alguns recursos:

* Um *Container Registry*
* Um banco de dados (*SQL database*)
* Uma *storage account*
* Um App Service

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

Uma vez concluída a criação do *container registry*, replique a imagem de Docker do sistema para ele (substitua `MY_ACR_NAME` pelo nome escolhido
no passo anterior):

```sh
az login
```

:::note
Caso você tenha acesso a mais de uma conta no Azure, pode ser necessário passar o argumento `--tenant YOUR_TENANT`
:::


```sh
az acr login --name MY_ACR_NAME
az acr import --name MY_ACR_NAME --source docker.io/lacunasoftware/restpkicore:4.2.5 --image restpkicore:4.2.5
```

:::tip
Substitua `4.2.5` pela versão atualmente recomendada (veja a [instalação em Docker](../docker.md))
:::


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


Uma vez concluída a criação do banco de dados, clique em **Go to resource**. Em seguida, obtenha a *connection string*:

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
   * Em *Redundancy*, escolha a opção que preferir (sugerimos a opção **Zone-redundant storage (ZRS)** -- [clique aqui](https://azure.microsoft.com/documentation/articles/storage-redundancy/)
     para detalhes sobre as diferentes opções de replicação)
1. Clique em **Review**
1. Clique em **Create**

Uma vez concluída a criação da *storage account*, clique em **Go to resource**. Em seguida, obtenha uma *connection string*:

1. Nas configurações da *storage account*, clique em **Access keys**
1. Na seção **key1**, tome nota do valor do campo **Connection string**

## Criação do App Service

Siga os procedimentos abaixo para criar um *App Service* (você precisa ter um *App Service Plan* previamente criado com sistema operacional **Linux**):

1. Em **App Services**, clique em **+ Create** em seguida em **+ Web App**
1. Na primeira aba (*Basics*), preencha os dados conforme a sua infraestrutura (seguindo a região escolhida para o sistema)
   * Em *Publish*, escolha **Docker Container**
   * Em *Operating System*, escolha **Linux**
   * Em *Region*, escolha a região onde está o seu *app service plan*
   * Em *Linux Plan*, escolha o seu *app service plan*
   * Clique em **Next : Docker >**
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

## Configuração do domínio

Crie o registro de DNS para o domínio de acesso ao Rest PKI Core:

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


Após criar o apontamento, adicione o domínio ao *App Service*:

1. De volta às configurações do App Service, clique em **Custom domains**
1. Clique em **+ Add custom domain**
1. Selecione **All other domain services**
1. Deixe selecionadas as opções **App Service Managed Certificate** e **SNI SSL**
1. Em *Domain*, preencha o domínio (ex: `app.patorum.com`)
1. Clique em **Validate**
1. Após a validação, clique em **Add**

## Configuração do Rest PKI Core

No menu lateral do App Service, na seção *Development Tools*, clique em **SSH**, em seguida em **Go &rarr;**. Você será levado a um terminal. Navegue
para a pasta `/app`:

```bash
cd /app
```

:::tip
Embora o terminal pareça iniciar na pasta `/app`, o comando acima **é necessário** devido a um bug do Azure
:::


Execute o comando abaixo para gerar a chave criptográfica utilizada para cifrar valores sensíveis no banco de dados:

```cmd
dotnet Lacuna.RestPki.Site.dll -- gen-enc-key
```

Tome nota do valor gerado.

Escolha uma senha forte para proteger o acesso de *root* ao painel de controle, e calcule o hash dessa senha com o comando abaixo:

```cmd
dotnet Lacuna.RestPki.Site.dll -- hash-root-pass
```

Novamente, tome nota do valor gerado.

Feche o terminal, voltando ao portal do Azure. No App Service, vá em **Configuration** e adicione as seguintes configurações:

* `General__AppDiscriminator`: veja a seção [App discriminator](#app-discriminator) abaixo
* `General__EncryptionKey`: chave criptográfica gerada acima
* `General__RootPasswordHash`: hash da senha de *root* calculado acima
* `General__SiteUrl`: URL pública do site (ex: `https://restpki.patorum.com/`)
* `General__SiteName` (opcional): nome da sua instância do Rest PKI Core (o padrão é *Rest PKI Core*)
* `Oidc__Enabled`: `False` (desabilita a [integração com OpenID Connect](../configure-oidc.md), por ora)

:::note
Caso queira habilitar o gerenciamento de usuários via OpenID Connect, deixe a configuração `General__RootPasswordHash` em branco e siga os passos em
[Configuração de OpenID Connect](../configure-oidc.md).
:::


Adicione, também, as configurações descritas nas seções a seguir.

### App discriminator {#app-discriminator}

A configuração `General__AppDiscriminator` identifica a instância e é utilizada para derivar as chaves de proteção de dados do sistema.

:::warning
Esta configuração é **obrigatória** no Azure App Services. Caso não seja definida explicitamente, um valor é derivado automaticamente e pode
**mudar quando o container é recriado**, o que impede a decifragem dos dados sensíveis já armazenados, causando **perda de dados**. Escolha um valor
estável (por exemplo `RestPkiCore`) e **nunca o altere** após a instalação. Para mais detalhes, veja a seção *Defina um AppDiscriminator explícito* do artigo
[Atualização da versão 2.x para 3.0](../major-updates/update-30.md).
:::


* `General__AppDiscriminator`: um valor estável que identifica a instância, ex: `RestPkiCore`

### PKI Suite

Configurações do PKI Suite:

* `PkiSuite__SdkLicense`: sua licença para o PKI SDK, no formato Base64 (**obrigatório**)
* `PkiSuite__WebLicense`: sua licença para o componente Web PKI no formato binário (Base64). Somente obrigatório se os usuários forem assinar documentos com certificados em seus computadores (assinatura no navegador via Web PKI)

### Blob Storage

Configuração da *storage account* (o tipo de armazenamento e o nome do container já vêm pré-configurados para o ambiente Azure):

* `BlobStorage__ConnectionString`: *connection string* da *storage account* criada anteriormente
* `BlobStorage__ContainerName` (opcional): nome do *container* a ser utilizado para armazenar arquivos. Caso omitido, um container denominado *restpki* é utilizado.

### Logging

Configuração de log (o *sink* de logs para o Azure Table já vem pré-configurado para o ambiente Azure):

* `Serilog__WriteTo__0__Args__connectionString`: *connection string* da *storage account* criada anteriormente
* `Serilog__WriteTo__0__Args__storageTableName` (opcional): nome da tabela a ser utilizada para armazenar os logs. Caso omitido, uma tabela denominada *RestPkiCoreLog* é utilizada.

### Connection string

Na seção *Connection strings* (final da página de configurações), clique em **+ New connection string** e preencha:

* **Name**: `DefaultConnection`
* **Value**: valor da connection string obtido durante a criação do banco de dados
* **Type**: escolha **SQLAzure**

:::tip
O Rest PKI Core também é compatível com PostgreSQL. Caso deseje utilizar um banco de dados Azure Database for PostgreSQL, entre em contato com o suporte
para obter mais informações. Para detalhes sobre os bancos de dados suportados, veja [Preparando um banco de dados](../prepare-database.md).
:::


Salve as configurações feitas até o momento clicando em **Save**.

:::note
Sempre que a documentação mencionar algo como "na seção **Sec**, atribua a configuração **Conf** ao valor ...", no Azure App Services você deve
compor o nome da configuração com os nomes da seção e da configuração separados por `__` (**dois** *underscores*), ou seja, no exemplo acima: `Sec__Conf`
:::


## Iniciando o App Service

Por fim, remova a configuração `STANDBY` do App Service e salve as configurações. Em seguida, acesse a URL pública do site (o primeiro acesso pode demorar alguns instantes).

Autentique-se com a senha de *root* escolhida durante a configuração. Você então terá acesso ao painel de controle.

Para começar a utilizar o sistema, crie uma [organização](../create-sub.md) e adicione um usuário administrador a ela.

## Veja também

* [Criação de organização no Rest PKI Core](../create-sub.md)
* [Atualização do Rest PKI Core em Azure App Services](update.md)
