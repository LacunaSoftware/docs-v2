# Instalação do Amplia em Red Hat Enterprise Linux

Para instalar uma instância [*on premises*](../index.md) do [Amplia](../../index.md) em Red Hat Enterprise Linux, siga os passos abaixo. Para outras plataformas, [clique aqui](../index.md).

:::tip
Antes de começar, leia a seção [Planejamento antes da instalação](../index.md#planning).
:::


## Pré-requisitos

:::note
Essas instruções são para RHEL 7. Se você utiliza RHEL 8, por favor contate-nos.
:::


:::warning
Antes de começar, certifique-se de que seu sistema esteja [registrado e inscrito no Red Hat Customer Portal](https://access.redhat.com/solutions/253273)
:::


* Red Hat Enterprise Linux 7.x

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


Habilite o repositório oficial de pacotes do .NET (só precisa ser feito uma única vez por máquina),
e então instale o pacote do ASP.NET Core Runtime:

{/* https://docs.microsoft.com/en-us/dotnet/core/install/linux-package-manager-rhel7 */}

{/* On 2.2, for some reason, we did not use the *rhel-7-server-dotnet-rpms* packages. Will this work with our instructions? */}

```sh
subscription-manager repos --enable=rhel-7-server-dotnet-rpms
yum install rh-dotnet31-aspnetcore-runtime-3.1 -y
ln -s /opt/rh/rh-dotnet31/root/usr/bin/dotnet /usr/bin/dotnet
```

{/* doing `ln -s /opt/rh/rh-dotnet31/root/usr/bin/dotnet /usr/bin/dotnet` instead of `scl enable rh-dotnet31 bash` to keep daemon definition common */}

:::note
Se o comando acima falhar, certifique-se de que o seu sistema está [registrado e associado a uma subscription da Red Hat](https://access.redhat.com/solutions/253273)
:::


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


Instale o Nginx (se ainda não estiver instalado):

{/* https://access.redhat.com/solutions/1211673 */}

```sh
subscription-manager repos --enable=rhel-server-rhscl-7-rpms
yum install rh-nginx116
systemctl enable rh-nginx116-nginx
systemctl start rh-nginx116-nginx
scl enable rh-nginx116 bash
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

Edite o arquivo de configuração do Nginx:

```sh
nano /etc/opt/rh/rh-nginx116/nginx/nginx.conf
```

Apague ou comente (prefixando cada linha com `#`) a seção `server` inteira, mostrada abaixo:

```
    server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  _;
        root         /opt/rh/rh-nginx116/root/usr/share/nginx/html;

        # Load configuration files for the default server block.
        include      /etc/opt/rh/rh-nginx116/nginx/default.d/*.conf;

        location / {
        }

        error_page 404 /404.html;
        location = /40x.html {
        }

        error_page 500 502 503 504  /50x.html;
        location = /50x.html {
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
    }
```

Crie um arquivo de configuração para o site do Amplia:

```sh
touch /etc/opt/rh/rh-nginx116/nginx/conf.d/amplia.conf
nano /etc/opt/rh/rh-nginx116/nginx/conf.d/amplia.conf
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
