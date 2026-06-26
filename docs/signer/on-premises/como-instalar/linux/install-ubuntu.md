# Instalação do Signer em Ubuntu Server

Para instalar uma instância [*on premises*](../../index.md) do [Signer](../../../index.md) em Ubuntu Server, siga os passos abaixo. Para outras plataformas, [clique aqui](../../index.md).

{/* {/* include: ../includes/see-planning.md */} */}

## Pré-requisitos

* Ubuntu Server (qualquer versão ainda suportada pelo fabricante, recomendamos a versão LTS mais recente)

* **Licença [PKI SDK](../../../../pki-sdk/index.md)** (no formato Base64)
* **Licença [Web PKI](../../../../web-pki/index.md)** (formato Base64/binário)
* **Entrada de DNS** criadas anteriormente para o site
* **Connection string** para um [banco de dados SQL server previamente criado](../prepare-database.md)
* (recomendado) Certificado SSL válido para o site

<a name="install-aspnet-core" />

## Instale o ASP.NET Core Runtime 8.0

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


Siga as instruções abaixo dependendo da versão do seu Ubuntu para:

1. Registrar a chave da Microsoft e adicionar o repositório de pacotes (só precisa ser feito em versões anteriores à versão 22.04 e uma única vez por máquina)
1. Instalar o pacote `aspnetcore-runtime-8.0`

### Ubuntu 22.04 or later

```bash
apt-get update
apt-get install aspnetcore-runtime-8.0
```

### Ubuntu 20.04 (LTS)

```bash
curl -O https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

```bash
apt-get update
apt-get install aspnetcore-runtime-8.0
```

### Teste a instalação

Para testar a instalação, execute:

```sh
dotnet --list-runtimes
```

A saída esperada é semelhante a:

```
Microsoft.AspNetCore.App 8.0.* [*/dotnet/shared/Microsoft.AspNetCore.App]
Microsoft.NETCore.App 8.0.* [*/dotnet/shared/Microsoft.NETCore.App]
```

:::tip
Para outras versões do sistema operacional e métodos alternativos de instalação do ASP.NET Core Runtime, visite [esta página](https://docs.microsoft.com/pt-br/dotnet/core/install/linux)
:::


## Instalar pacotes obrigatórios adicionais

Instale dependências adicionais:

```sh
apt-get install libc6-dev libgdiplus
```

## Instalar o Signer

Crie um usuário local para executar o servidor de aplicação do Signer:

```sh
mkdir /var/lacuna-signer
useradd --system --home-dir /var/lacuna-signer lacuna-signer
chown lacuna-signer:lacuna-signer /var/lacuna-signer
```

Crie a pasta do site, baixe e extraia os binários:

```sh
mkdir /usr/share/lacuna-signer
curl -O https://cdn.lacunasoftware.com/signer/signer-2.15.0.tar.gz
tar xzf signer-2.15.0.tar.gz -C /usr/share/lacuna-signer
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-signer
```

:::note
Os arquivos do site podem ser lidos por qualquer usuário mas só podem ser alterados por usuários com permissões elevadas. Isso significa que o usuário da aplicação (*signer*)
pode ler os arquivos mas não pode alterá-los (isso é intencional).
:::


Crie o arquivo de configuração do Signer a partir do template fornecido:

```sh
mkdir /etc/lacuna-signer
cp /usr/share/lacuna-signer/config-templates/appsettings.linux.json /etc/lacuna-signer/
chown -R root:lacuna-signer /etc/lacuna-signer
chmod -R a=,u+rwX,g+rX /etc/lacuna-signer
```

:::note
Arquivos de configuração só podem ser lidos por membros do grupo *signer* e só podem ser alterados por usuários com permissões elevadas. Isso é importante para proteger informações
sigilosas armazenadas no arquivo de configuração dos demais usuários da máquina.
:::


## Configure o Signer

Edite o arquivo de configuração para configurar sua instância do Signer:

```sh
nano /etc/lacuna-signer/appsettings.linux.json
```

### *Connection string* do banco de dados

Na seção **ConnectionStrings**, na configuração **DefaultConnection**, defina a *connection string* para o banco de dados criado anteriormente. Uma *connection string* típica parece como
essa:

```
Data Source=SERVER;Initial Catalog=DATABASE;User ID=USERNAME;Password=PASSWORD
```

:::note
Se você criar um banco de dados usando características avançadas como *log shipping* ou *mirroring*, sua *connection string* pode ser diferente.
:::


<a name="encryption-key-generation" />

### Configurações gerais

Gere uma chave de 256 bits para cifrar segredos armazenadas em banco de dados:

```sh
openssl rand -base64 32
```

Preencha, então, na seção **General**:

* **SiteUrl**: URL publicamente acessível do site (ex: `https://assinador.patorum.com/`). Este endereço é usado para compor emails com links de volta ao site.
* **SiteName**: nome do site, usado como título das páginas web (ex: *Assinador Patorum*)
* **EncryptionKey**: chave gerada acima
* **SupportEmailAdress**: o endereço de e-mail de suporte (usado no rodapé dos e-mails enviados)
* **Theme** (opcional): esquema de cores do site -- esquemas disponíveis:
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
* **PersonalAccountsEnabled**:
  * Atribua o valor `true` para deixar o sistema "aberto", ou seja, permitir que usuários se registrem e utilizem livremente o sistema (sem aprovação de um administrador)
  * Atribua o valor `false` para deixar o sistema "fechado", ou seja, exigir que usuários sejam previamente cadastrados em uma organização para poderem utilizar o sistema
* **EnableDocumentTypes**: controla se a seleção de tipo de documento será exibida ao criar documentos
* **EnableElectronicSignature**: controla se assinaturas eletrônicas (sem certificado digital) estarão habilitadas

### Bindings

Na seção **Bindings**

* **HttpsMode**: por padrão, o painel e as REST APIs só podem ser acessados por meio de HTTPS, que é o comportamento recomendado se você tiver um certificado SSL válido.
  * Se você não tiver um certificado SSL válido, definir esta configuração como `Optional`. Os usuários que acessam o painel não serão redirecionados para HTTPS, e as REST APIs poderão ser acessadas por meio de HTTP.
  * Se você tiver um certificado SSL válido, mas alguns aplicativos clientes herdados não o
  reconhecerem, defina essa configuração como `RedirectPages`. As REST APIs ainda estarão acessíveis por meio do HTTP (como no modo `Opcional`), mas os usuários que acessam o painel serão redirecionados para o HTTPS.
* **SslPort**: por padrão, os usuários que acessam o painel por meio de HTTP são redirecionados para HTTPS na porta TCP padrão 43. Se o site estiver usando HTTPS em uma porta não padrão, defina-o aqui.

### PKI Suite

Na seção **PkiSuite**:

  * **SdkLicense**: sua licença para PKI SDK, no formato Base64 (**obrigatório**)
  * **WebLicense**: sua licença para o componente Web PKI no formato binário (Base64) (**obrigatório**)

### Envio de email

Na seção **Email**:

  * **Enabled**: por padrão, o envio de email está habilitado. Para desabilitar, defina esta configuração como `false` e ignore o restante desta seção.
  * **ServerHost**: *hostname* do servidor SMTP
  * **EnableSsl**: por padrão, a conversação SMTP é executada por SSL. Para desativar o SSL, defina essa configuração como `false`
  * **ServerPort**: Por padrão, a conversação SMTP é realizada pela porta 587. Defina esta configuração para usar uma porta diferente
  * **Username** ou **Password**: se o servidor SMTP exigir autenticação, defina essas configurações
  * **SenderAddress**: endereço de e-mail a ser usado como remetente (do campo)
  * **SenderName**: nome a ser usado como o nome do remetente (opcional)

### Integração com provedor de OpenID Connect

O Signer requer um provedor de Open ID Connect (OIDC), mais especificamente uma *subscription* do [GrantID](../../../../grant-id/index.md).

Você pode usar uma *subscription* em nosso serviço SaaS em [grantid.com](https://grantid.com/) ou [instalar sua instância própria do GrantID](../../../../grant-id/on-premises/index.md).

{/* :::tip On Docker, see [Using a stack with GrantID](docker/internal-grantid.md) to install both Amplia and GrantID on the same stack ::: */}

De posse dos parâmetros da sua *subscription* do GrantID, preencha a seção **Oidc**:

* **Authority**: a *OIDC authority* (ex: `https://patorum.grantid.com`)
* **ApiEndpoint**: o endereço da API do GrantID (ex: `https://api.grantid.com`)
* **ApiName**: o escopo de API que será exigido nos tokens de acesso
* **ClientAppId**: o *App-Id* da aplicação frontend
* **AppId**: o *App-Id* da aplicação backend
* **AppSecret**: um segredo para autenticação da aplicação backend
* **RequireHttps** (opcional): atribua o valor `false` caso esteja usando uma instância própria do GrantID sem HTTPS (não recomendado)

## Configurar um *daemon*

Crie o arquivo de definição do serviço:

```sh
touch /etc/systemd/system/lacuna-signer.service
nano /etc/systemd/system/lacuna-signer.service
```

Digite o seguinte:

```
[Unit]
Description=Lacuna Signer

[Service]
WorkingDirectory=/usr/share/lacuna-signer
ExecStart=/usr/bin/dotnet Lacuna.Signer.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=lacuna-signer
User=lacuna-signer
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5001
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Salve o arquivo, habilite o serviço e inicie-o:

```sh
systemctl enable lacuna-signer
systemctl start lacuna-signer
systemctl status lacuna-signer
```

A saída esperada é semelhante a:

```
* lacuna-signer.service - Lacuna Signer
   Loaded: loaded (/etc/systemd/system/lacuna-signer.service; enabled; vendor preset: enabled)
   Active: active (running) since Wed 2020-04-15 22:17:50 UTC; 30s ago
 Main PID: 2831 (dotnet)
    Tasks: 36 (limit: 2319)
   CGroup: /system.slice/lacuna-signer.service
           └─2831 /usr/bin/dotnet Lacuna.Signer.Site.dll

Apr 15 22:17:50 server.patorum.com systemd[1]: Started Lacuna Signer.
Apr 15 22:17:55 server.patorum.com lacuna-signer[2831]: info: Lacuna.Signer.Site.Startup.RecurringJobsInit[0]
Apr 15 22:17:55 server.patorum.com lacuna-signer[2831]:       Initializing recurring jobs
```

Se necessário, reinicie o serviço: `systemctl restart signer`

Para testar se o servidor do Signer está rodando, execute:

```sh
curl http://localhost:5001/api/system/info
```

A saída esperada é algo como:

```json
{"productName":"Lacuna.Signer.Site","productVersion":"1.x.x","timestamp":"..."}
```

## Configurar um servidor proxy reverso

:::note
Se você preferir usar o Apache ao invés do Nginx, [veja este artigo](https://docs.microsoft.com/pt-br/aspnet/core/host-and-deploy/linux-apache?view=aspnetcore-2.2#configure-apache).
:::


Instale o Nginx (se ainda não estiver instalado)

```sh
apt-get install nginx
```

Teste a instalação do Nginx:

```sh
curl -I http://localhost/
```

Verifique as primeiras linhas da saída, que devem ser similares a:

```
HTTP/1.1 200 OK
Server: nginx/...
...
```

Desabilite o site padrão do Nginx:

```sh
rm /etc/nginx/sites-enabled/default
```

Crie um arquivo de configuração para o site do Signer:

```sh
touch /etc/nginx/sites-available/lacuna-signer
nano /etc/nginx/sites-available/lacuna-signer
```

Digite o seguinte, substituindo o valor do item `server_name` pelo domínio de acesso ao site:

```nginx
server {
    listen        80;
    server_name   localhost signer.patorum.com;
    client_max_body_size 11000000;
    location / {
        proxy_pass         http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

:::tip
Idealmente, a configuração do site deve conter as entradas `ssl_certificate` e `ssl_certificate_key` com o certificado SSL válido. Essa configuração está fora do escopo dessas
instruções.
:::


Ative o site:

```sh
ln -sf /etc/nginx/sites-available/lacuna-signer /etc/nginx/sites-enabled/lacuna-signer
```

Teste a configuração do Nginx e recarregue-a:

```sh
nginx -t
nginx -s reload
```

Teste o site:

```
curl http://localhost/api/system/info
```

## Veja também

* [Atualização do Signer em Linux](update.md)
* [Resolução de problemas](troubleshoot/index.md)
