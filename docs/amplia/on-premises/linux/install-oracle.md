# Instalação do Amplia em Oracle Linux

Para instalar uma instância [*on premises*](../index.md) do [Amplia](../../index.md) em Oracle Linux, siga os passos abaixo. Para outras plataformas, [clique aqui](../index.md).

:::tip
Antes de começar, leia a seção [Planejamento antes da instalação](../index.md#planning).
:::


## Pré-requisitos

* Oracle Linux 7.x

* SQL Server 2016 ou mais recente (recomendada edição *Standard* ou superior)
* Licença PKI SDK (no formato Base64)
* Licença Web PKI (formato Base64/binário) -- necessário apenas se os usuários forem emitir certificados em seus computadores (procedimento de emissão na web)
* Entradas de DNS criadas anteriormente para:
    * Acesso ao painel de controle (veja [Domínio de acesso ao painel de controle](../index.md#dashboard-domain))
    * Publicação de LCRs (veja [Domínios de acesso](../index.md#access-domains))
* (recomendado) Certificado SSL válido para o domínio de acesso ao painel de controle
* **Connection string** para um [banco de dados SQL Server ou PostgreSQL criado previamente](../prepare-database.md)

<a name="install-aspnet-core" />

## Instale o ASP.NET Core Runtime 3.1

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


Registre a chave da Microsoft e o repositório de pacotes (só precisa ser feito uma única vez por máquina),
e então instale o pacote do ASP.NET Core Runtime:

{/* https://docs.microsoft.com/en-us/dotnet/core/install/linux-package-manager-centos7 */}
{/* Using installation from RHEL instead of CentOS because MS package repository for centos lacks mssql-tools */}

{/* THIS WAS COPIED FROM 2.2 AND ONLY CHANGED TO 3.1, THERE ARE NO ORACLE-SPECIFIC INSTRUCTIONS ON MS DOCS! UNTESTED! */}

```sh
rpm -Uvh https://packages.microsoft.com/config/rhel/7/packages-microsoft-prod.rpm
yum install aspnetcore-runtime-3.1
```

Para testar a instalação, execute:

```sh
dotnet --list-runtimes
```

A saída esperada é semelhante a:

```
Microsoft.AspNetCore.App 3.1.x [/usr/share/dotnet/shared/Microsoft.AspNetCore.App]
Microsoft.NETCore.App 3.1.x [/usr/share/dotnet/shared/Microsoft.NETCore.App]
```

:::tip
Para métodos alternativos de instalação do ASP.NET Core Runtime, visite [esta página](https://docs.microsoft.com/pt-br/dotnet/core/install/linux)
:::


## Instalar o Amplia

:::note
Alguns passos utilizam o comando `nano`, que pode não estar disponível no seu sistema. Substitua o comando pelo
`vi` ou instale o nano executando `yum install nano`.
:::


Crie um usuário local para executar o servidor de aplicação do Amplia:

```sh
mkdir /var/amplia
useradd --system --home-dir /var/amplia amplia
chown amplia:amplia /var/amplia
```

Crie a pasta do site, baixe e extraia os binários:

:::note
Para testar a [próxima versão](../../changelog.md#vnext) do Amplia, atualmente em estágio *Release Candidate*, substitua `amplia-x.y.z.tar.gz` nos comandos abaixo
por `amplia-4.22.0-rc01.tar.gz`. **Cuidado**: versões *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas apenas em ambientes de
homologação/testes!
:::


```sh
mkdir /usr/share/amplia
curl -O https://cdn.lacunasoftware.com/amplia/amplia-4.20.0.tar.gz
tar xzf amplia-4.20.0.tar.gz -C /usr/share/amplia
chmod -R a=,u+rwX,go+rX /usr/share/amplia
```

:::note
Os arquivos do site podem ser lidos por qualquer usuário mas só podem ser alterados por usuários com permissões elevadas. Isso significa que o usuário da aplicação (*amplia*)
pode ler os arquivos mas não pode alterá-los (isso é intencional).
:::


Crie o arquivo de configuração do Amplia a partir do template fornecido:

```sh
mkdir /etc/amplia
cp /usr/share/amplia/config-templates/linux/appsettings.conf /etc/amplia/
chown -R root:amplia /etc/amplia
chmod -R a=,u+rwX,g+rX /etc/amplia
```

:::note
Arquivos de configuração só podem ser lidos por membros do grupo *amplia* e só podem ser alterados por usuários com permissões elevadas. Isso é importante para proteger informações
sigilosas armazenadas no arquivo de configuração dos demais usuários da máquina.
:::


## Configure o Amplia

Edite o arquivo de configuração para configurar sua instância do Amplia:

```sh
nano /etc/amplia/appsettings.conf
```

<a name="encryption-key-generation" />

Na seção `[General]`, para preencher o parâmetro `EncryptionKey` gere uma chave de 256 bits para cifrar dados sensíveis armazenados no banco de dados:

```sh
openssl rand -base64 32
```

Ainda na seção `[General]`, para preencher o parâmetro `RootPasswordHash` escolha uma senha forte para o acesso de root e compute o *hash* da senha:

```sh
dotnet /usr/share/amplia/Lacuna.Amplia.Site.dll -- hash-root-pass
```

Preencha os demais parâmetros de acordo com as instruções presentes no arquivo de configuração.

## Configurar um *daemon*

Crie o arquivo de definição do serviço:

```sh
touch /etc/systemd/system/amplia.service
nano /etc/systemd/system/amplia.service
```

Digite o seguinte:

```
[Unit]
Description=Amplia

[Service]
WorkingDirectory=/usr/share/amplia
ExecStart=/usr/bin/dotnet Lacuna.Amplia.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=amplia
User=amplia
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Salve o arquivo, habilite o serviço e inicie-o:

```sh
systemctl enable amplia
systemctl start amplia
systemctl status amplia
```

A saída esperada é semelhante a:

```
* amplia.service - Amplia
   Loaded: loaded (/etc/systemd/system/amplia.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-07-07 05:50:04 UTC; 4min 22s ago
 Main PID: 10960 (dotnet)
    Tasks: 31 (limit: 2319)
   CGroup: /system.slice/amplia.service
           └─10960 /usr/bin/dotnet Lacuna.Amplia.Site.dll

...

Dec 04 12:45:08 server.patorum.com amplia[32562]: Hosting environment: Production
Dec 04 12:45:08 server.patorum.com amplia[32562]: Content root path: /usr/share/amplia
Dec 04 12:45:08 server.patorum.com amplia[32562]: Now listening on: http://localhost:5000
Dec 04 12:45:08 server.patorum.com amplia[32562]: Application started. Press Ctrl+C to shut down.
Hint: Some lines were ellipsized, use -l to show in full.
```

Se necessário, reinicie o serviço: `systemctl restart amplia`

Para testar se o servidor do Amplia está rodando, execute:

```sh
curl http://localhost:5000/api/system/info
```

A saída esperada é algo como:

```json
{"productName":"Lacuna Amplia","productVersion":"4.x.x","spaVersion":"...","timestamp":"..."}
```

## Configurar um servidor proxy reverso

:::note
Se você preferir usar o Apache ao invés do Nginx, [veja este artigo](https://docs.microsoft.com/pt-br/aspnet/core/host-and-deploy/linux-apache?view=aspnetcore-2.2#configure-apache).
:::


Instale o Nginx (se ainda não estiver instalado)

{/* https://www.itzgeek.com/how-tos/linux/centos-how-tos/install-nginx-on-centos-7-rhel-7.html */}
{/* https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/ (alternative) */}
{/* http://johanlouwers.blogspot.com/2016/01/install-nginx-on-oracle-linux.html (alternative) */}

```sh
rpm -Uvh http://nginx.org/packages/rhel/7/noarch/RPMS/nginx-release-rhel-7-0.el7.ngx.noarch.rpm
yum install nginx
systemctl enable nginx.service
systemctl start nginx.service
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
rm /etc/nginx/conf.d/default.conf
```

Crie um arquivo de configuração para o site do Amplia:

```sh
touch /etc/nginx/conf.d/amplia.conf
nano /etc/nginx/conf.d/amplia.conf
```

Digite o seguinte, substituindo o valor do item `server_name` pelo domínio de acesso ao painel de controle (veja [Domínio de acesso ao painel de controle](../../index.md#dashboard-domain)):

```nginx
server {
    listen        80;
    server_name   localhost ca.patorum.com;
    location / {
        proxy_pass         http://localhost:5000;
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


Permita que o Nginx acesse o serviço do Amplia:

{/* https://wiki.centos.org/TipsAndTricks/SelinuxBooleans */}
```sh
setsebool -P httpd_can_network_connect on
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

Abra as portas HTTP e HTTPS do seu servidor para tráfego externo (caso ainda não estejam abertas):

{/* https://linuxconfig.org/how-to-open-http-port-80-on-redhat-7-linux-using-firewall-cmd */}
```sh
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --reload
```

## Veja também

* [Atualização do Amplia em Linux](update.md)
* [Resolução de problemas](troubleshoot/index.md)
