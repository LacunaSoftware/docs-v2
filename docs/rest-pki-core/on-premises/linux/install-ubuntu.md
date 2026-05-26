# Instalação do Rest PKI Core em Ubuntu Server

Para instalar uma instância [*on premises*](../index.md) do [Rest PKI Core](../../index.md) em Ubuntu Server, siga os passos abaixo. Para outras plataformas, [clique aqui](../index.md).

## Pré-requisitos

* Ubuntu Server (qualquer versão ainda suportada pelo fabricante, recomendamos a versão LTS mais recente)

* **Connection string** para um [banco de dados SQL Server ou PostgreSQL criado previamente](../prepare-database.md)
* Licença de uso da biblioteca **PKI SDK** (em formato binário/Base64)
* Licença de uso do componente **Web PKI** (em formato binário/Base64)

<a name="install-aspnet-core" />

## Instale o ASP.NET Core Runtime 6.0

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


Siga as instruções abaixo dependendo da versão do seu Ubuntu para:

1. Registrar a chave da Microsoft e adicionar o repositório de pacotes (só precisa ser feito em versões anteriores à versão 22 e uma única vez por máquina)
1. Instalar o pacote `aspnetcore-runtime-6.0`

### Ubuntu 22.04 (LTS)

```bash
apt-get update
apt-get install aspnetcore-runtime-6.0
```

### Ubuntu 20.04 (LTS)

```bash
curl -O https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

```bash
apt-get update
apt-get install aspnetcore-runtime-6.0
```

### Ubuntu 18.04 (LTS)

```bash
curl -O https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

```bash
apt-get update
apt-get install aspnetcore-runtime-6.0
```

### Ubuntu 16.04 (LTS)

```bash
curl -O https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

```bash
apt-get update
apt-get install aspnetcore-runtime-6.0
```

### Teste a instalação

Para testar a instalação, execute:

```sh
dotnet --list-runtimes
```

A saída esperada é semelhante a:

```
Microsoft.AspNetCore.App 6.0.* [*/dotnet/shared/Microsoft.AspNetCore.App]
Microsoft.NETCore.App 6.0.* [*/dotnet/shared/Microsoft.NETCore.App]
```

:::tip
Para outras versões do sistema operacional e métodos alternativos de instalação do ASP.NET Core Runtime, visite [esta página](https://docs.microsoft.com/pt-br/dotnet/core/install/linux)
:::


## Instalar o Rest PKI Core

Crie um usuário local para executar o servidor de aplicação do Rest PKI Core:

```sh
mkdir /var/restpkicore
useradd --system --home-dir /var/restpkicore restpkicore
chown restpkicore:restpkicore /var/restpkicore
```

Crie a pasta do site, baixe e extraia os binários:

{/* :::note Para testar a [próxima versão](../../../changelog.md#vnext) do Rest PKI Core, atualmente em estágio *Release Candidate*, substitua `restpkicore-x.y.z.tar.gz` nos comandos abaixo por `restpkicore-3.3.0-rc12.tar.gz`. **Cuidado**: versões *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas apenas em ambientes de homologação/testes! ::: */}

```sh
mkdir /usr/share/restpkicore
curl -O https://cdn.lacunasoftware.com/restpkicore/restpkicore-4.1.0.tar.gz
tar xzf restpkicore-4.1.0.tar.gz -C /usr/share/restpkicore
chmod -R a=,u+rwX,go+rX /usr/share/restpkicore
```

:::note
Os arquivos do site podem ser lidos por qualquer usuário mas só podem ser alterados por usuários com permissões elevadas. Isso significa que o usuário da aplicação (*restpkicore*)
pode ler os arquivos mas não pode alterá-los (isso é intencional).
:::


Crie o arquivo de configuração do Rest PKI Core a partir do template fornecido:

```sh
mkdir /etc/restpkicore
cp /usr/share/restpkicore/config-templates/linux/appsettings.conf /etc/restpkicore/
chown -R root:restpkicore /etc/restpkicore
chmod -R a=,u+rwX,g+rX /etc/restpkicore
```

:::note
Arquivos de configuração só podem ser lidos por membros do grupo *restpkicore* e só podem ser alterados por usuários com permissões elevadas. Isso é importante para proteger informações
sigilosas armazenadas no arquivo de configuração dos demais usuários da máquina.
:::


## Configure o Rest PKI Core

Edite o arquivo de configuração para configurar sua instância do Rest PKI Core:

```sh
nano /etc/restpkicore/appsettings.conf
```

<a name="encryption-key-generation" />

Na seção `[General]`, para preencher o parâmetro `EncryptionKey` gere uma chave de 256 bits para cifrar dados sensíveis armazenados no banco de dados:

```sh
openssl rand -base64 32
```

Ainda na seção `[General]`, para preencher o parâmetro `RootPasswordHash` escolha uma senha forte para o acesso de root e compute o *hash* da senha:

```sh
dotnet /usr/share/restpkicore/Lacuna.RestPki.Site.dll -- hash-root-pass
```

Preencha os demais parâmetros de acordo com as instruções presentes no arquivo de configuração.

## Configurar um *daemon*

Crie o arquivo de definição do serviço:

```sh
touch /etc/systemd/system/restpkicore.service
nano /etc/systemd/system/restpkicore.service
```

Digite o seguinte:

```
[Unit]
Description=Rest PKI Core

[Service]
WorkingDirectory=/usr/share/restpkicore
ExecStart=/usr/bin/dotnet Lacuna.RestPki.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=restpkicore
User=restpkicore
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5004
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Salve o arquivo, habilite o serviço e inicie-o:

```sh
systemctl enable restpkicore
systemctl start restpkicore
systemctl status restpkicore
```

A saída esperada é semelhante a:

```
* restpkicore.service - Rest PKI Core
   Loaded: loaded (/etc/systemd/system/restpkicore.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-07-07 05:50:04 UTC; 4min 22s ago
 Main PID: 10960 (dotnet)
    Tasks: 31 (limit: 2319)
   CGroup: /system.slice/restpkicore.service
           └─10960 /usr/bin/dotnet Lacuna.RestPki.Site.dll

...

Dec 04 12:45:08 server.patorum.com restpkicore[32562]: Hosting environment: Production
Dec 04 12:45:08 server.patorum.com restpkicore[32562]: Content root path: /usr/share/restpkicore
Dec 04 12:45:08 server.patorum.com restpkicore[32562]: Now listening on: http://localhost:5004
Dec 04 12:45:08 server.patorum.com restpkicore[32562]: Application started. Press Ctrl+C to shut down.
Hint: Some lines were ellipsized, use -l to show in full.
```

Se necessário, reinicie o serviço: `systemctl restart restpkicore`

Para testar se o servidor do Rest PKI Core está rodando, execute:

```sh
curl http://localhost:5004/api/system/info
```

A saída esperada é algo como:

```json
{"productName":"Lacuna Rest PKI Core","productVersion":"1.x.x","spaVersion":"...","timestamp":"..."}
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

Crie um arquivo de configuração para o site do Rest PKI Core:

```sh
touch /etc/nginx/sites-available/restpkicore
nano /etc/nginx/sites-available/restpkicore
```

Digite o seguinte, substituindo o valor do item `server_name` pelo seu domínio:

```nginx
server {
    listen        80;
    server_name   localhost restpkicore.yourcompany.com;
    location / {
        proxy_pass         http://localhost:5004;
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
ln -sf /etc/nginx/sites-available/restpkicore /etc/nginx/sites-enabled/restpkicore
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

* [Atualização do Rest PKI Core em Linux](update.md)
* [Resolução de problemas](troubleshoot/index.md)
