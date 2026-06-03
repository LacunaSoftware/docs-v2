# Signer - Setup em Azure App Services

Para instalar uma instância [*on premises*](../../index.md) do [Signer](../../../index.md) em um [Azure App Service](https://docs.microsoft.com/azure/app-service/overview),
siga os passos abaixo. Para outras plataformas, [clique aqui](../../index.md).

{/* {/* include: ../includes/see-planning.md */} */}

## Preparação

Antes de começar, obtenha o pacote de binários:

<br />
<center>
**[Pacote de binários do Signer](https://cdn.lacunasoftware.com/signer/signer-2.13.3.zip)**
</center>
<br />

As instruções a seguir assumem que você já tem os seguintes *resources* criados na sua conta do Azure:

* Um *SQL Server* (a criação do *SQL database* é coberta por este artigo)
* Um *App Service Plan* (a criação do App Service é coberta por este artigo)
* Uma zona de DNS referente ao domínio do site

Durante a instalação, serão criados alguns *resources*:

* Um banco de dados (*SQL database*)
* Uma *storage account*
* Um App Service

Sugerimos criar um **resource group** para agrupar os recursos criados. Entretanto, essa é uma medida com propósito meramente de organização. O que
realmente é importante é que **todos os recursos sejam criados na mesma região**. Isso é fundamental para o funcionamento adequado do sistema.

:::note
Os passos abaixo descrevem a criação mais básica de cada recurso. Dependendo da sua infraestrutura você pode querer tomar cuidados
adicionais de segurança ou resiliência, como por exemplo restringir o acesso a uma rede privada.
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

Siga os procedimentos abaixo para criar um *App Service* (você precisa ter um *App Service Plan* previamente criado):

1. Em **App Services**, clique em **+ Add**
1. Na primeira aba (*Basics*), preencha os dados conforme a sua infraestrutura (seguindo a região escolhida para o sistema)
   * Em *Publish*, escolha **Code**
   * Em *Runtime stack*, escolha **.NET 6.0 (LTS)**
   * Em *Operating System*, escolha o que preferir (o sistema é compatível com Windows e Linux)
1. Clique em **Review + create**
1. Clique em **Create**

Uma vez concluída a criação do App Service, clique em **Go to resource**. Em seguida, tome nota de seu domínio, por exemplo `meu-app-service.azurewebsites.net`.

## Configuração do domínio

Crie o apontamento de DNS para o domínio do site:

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

## Cópia dos binários

Agora iremos copiar os binários do site. Primeiramente, na seção **Overview** do App Service, pare o serviço clicando em **Stop**.

Em seguida, vá em **Advanced Tools** e clique em **Go**. Você será levado para o painel de controle Kudu do App Service.

1. No menu superior, clique em **Tools**, em seguida em **Zip Push Deploy**
1. Arraste e solte o pacote de binários (arquivo .zip) sobre a lista de arquivos e aguarde o progresso do *deploy*

## Configuração do Signer

Execute o comando abaixo em um Powershell para gerar a chave criptográfica utilizada para cifrar valores sensíveis no banco de dados:

```ps
$k = New-Object byte[] 32;
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($k);
[Convert]::ToBase64String($k);
```

Tome nota do valor gerado.

No App Service, vá em **Configuration** e adicione as seguintes configurações:

* `ASPNETCORE_ENVIRONMENT`: `Azure`
* `General__EncryptionKey`: chave criptográfica gerada acima
* `General__SiteUrl`: URL pública do site, no domínio configurado anteriormente, ex: `https://assinador.patorum.com/`
* `General__SiteName`: nome da sua instância do Amplia, ex: *Assinador Patorum*
* `General__SupportEmailAddress`: o endereço de e-mail de suporte (usado no rodapé dos e-mails enviados)
* `General__Theme` (opcional): esquema de cores do site -- esquemas disponíveis:
  * `acr`: amazon + cornell-red
  * `alg`: azure-lime + green
  * `clg`: cerulean-lime + green
  * `cam`: charcoal + amazonite
  * `clc`: cobalt-lemon + curry
  * `dcg`: dark-cerulean + green
  * `dgy`: dark-grey + yellow
  * `dir`: dark-indigo + red
  * `eva`: english-vermillion + arsenic
  * `gdc`: green + dark-coral
  * `idg`: independence-green
  * `osg`: onyx + satin-gold
  * `qbm`: queen-blue + mint
  * `tbg`: teal-blue + gold
* `General__PersonalAccountsEnabled`: por padrão, o sistema é "fechado", ou seja, exige que usuários sejam previamente cadastrados em uma organização para poderem utilizar o sistema.
  Para deixar o sistema "aberto" ou seja, permitir que usuários se registrem e utilizem livremente o sistema (sem aprovação de um administrador), inclua essa configuração com valor `true`
* `General__EnableDocumentTypes`: por padrão, a seleção de tipo de documento não é exibida ao criar documentos. Para exibi-la, inclua essa configuração com valor `true`
* `General__EnableElectronicSignature`: por padrão, assinaturas eletrônicas (sem certificado digital) estão desabilitadas. Para habilitá-las, inclua essa configuração com valor `true`

Adicione, também, as configurações descritas nas seções a seguir.

### PKI Suite

Configurações do PKI Suite:

  * `PKiSuite__SdkLicense`: sua licença para PKI SDK, no formato Base64 (**obrigatório**)
  * `PKiSuite__WebLicense`: sua licença para o componente Web PKI no formato binário (Base64) (**obrigatório**)
  * `PKiSuite__LappEnabled`: `true` ou `false`. Indica se a opção de Lapp deve ser habilitada (**opcional**)

### Envio de email

Configurações de envio de email:

  * `Email__Enabled`: por padrão, o envio de email está habilitado. Para desabilitar, defina esta configuração como `false` e ignore o restante desta seção.
  * `Email__ServerHost`: *hostname* do servidor SMTP
  * `Email__EnableSsl`: por padrão, a conversação SMTP é executada por SSL. Para desativar o SSL, defina essa configuração como `false`
  * `Email__ServerPort`: Por padrão, a conversação SMTP é realizada pela porta 587. Defina esta configuração para usar uma porta diferente
  * `Email__Username` e `Email__Password`: se o servidor SMTP exigir autenticação, defina essas configurações
  * `Email__SenderAddress`: endereço de e-mail a ser usado como remetente (do campo)
  * `Email__SenderName`: nome a ser usado como o nome do remetente (opcional)

### Integração com provedor de OpenID Connect

O Signer requer um provedor de Open ID Connect (OIDC), mais especificamente uma *subscription* do [GrantID](../../../../grant-id/index.md).

Você pode usar uma *subscription* em nosso serviço SaaS em [grantid.com](https://grantid.com/) ou [instalar sua instância própria do GrantID](../../../../grant-id/on-premises/index.md).

{/* :::tip On Docker, see [Using a stack with GrantID](docker/internal-grantid.md) to install both Amplia and GrantID on the same stack ::: */}

De posse dos parâmetros da sua *subscription* do GrantID, adicione as seguintes configurações:

* `Oidc__Authority`: a *OIDC authority* (ex: `https://patorum.grantid.com`)
* `Oidc__ApiEndpoint`: o endereço da API do GrantID (ex: `https://api.grantid.com`)
* `Oidc__ApiName`: o escopo de API que será exigido nos tokens de acesso
* `Oidc__ClientAppId`: o *App-Id* da aplicação frontend
* `Oidc__AppId`: o *App-Id* da aplicação backend
* `Oidc__AppSecret`: um segredo para autenticação da aplicação backend
* `Oidc__CpfClaim`: coloque o nome da *claim* de CPF da subscription caso não seja `cpf`
* `Oidc__CustomScopes`: coloque o nome do escopo de CPF da subscription
* `Oidc__RequireHttps` (opcional): atribua o valor `false` caso esteja usando uma instância própria do GrantID sem HTTPS (não recomendado)

:::tip
Se a subscription utilizar o CPF como chave, coloque em `Oidc__CpfClaim` e `Oidc__CustomScopes` o valor `preferred_username`
:::


### Blob Storage

Configuração da *storage account*:

* `BlobStorage__ConnectionString`: *connection string* da *storage account* criada anteriormente
* `BlobStorage__ContainerName` (opcional): nome do *container* a ser utilizado para armazenar arquivos. Caso omitido, um container denominado *signer* é utilizado.

### Logging

Configuração de log:

* `Serilog__WriteTo__0__Args__connectionString`: *connection string* da *storage account* criada anteriormente
* `Serilog__WriteTo__0__Args__storageTableName` (opcional): nome da tabela a ser utilizada para armazenar os logs. Caso omitido, uma tabela denomiada *SignerLog* é utilizada.

### Connection string

Na seção *Connection strings* (final da página de configurações), clique em **+ New connection string** e preencha:

* **Name**: `DefaultConnection`
* **Value**: valor da connection string obtido durante a criação do banco de dados
* **Type**: escolha **SQLAzure**

Salve as configurações feitas até o momento clicando em **Save**.

## Iniciando o App Service

Por fim, em **Overview** do App Service, clique em **Start**. Em seguida, acesse a URL do site (o primeiro acesso pode demorar alguns instantes).

Clique em **Login** e registre-se. Você então será "promovido" a administrador (o primeiro usuário que se registra é automaticamente promovido),
tendo acesso pleno ao sistema, e a instalação estará concluída.

{/* ## Veja também * [Atualização do Amplia em Azure App Services](update.md) * [Resolução de problemas](troubleshoot/index.md) */}
