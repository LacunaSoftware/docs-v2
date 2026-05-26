# Instalação do Lacuna PSC em Rocky Linux

Para instalar uma instância [*on premises*](../index.md) do [Lacuna PSC](../../index.md) em Rocky Linux, siga os passos abaixo. Para outras plataformas, [clique aqui](../index.md).

## Pré-requisitos

* Rocky Linux 8.x ou superior

* Instância do **[Amplia](../../../amplia/index.md)** configurada para [hospedagem de certificados em nuvem](../../../amplia/on-premises/configure-cert-management.md)
* Instância do **[GrantID](../../../grant-id/index.md)**
* Licença do **[PKI SDK](../../../pki-sdk/index.md)** (no formato Base64)
{/* Licença do **[Web PKI](../../../web-pki/index.md)** (formato Base64/binário) */}
* **Entrada de DNS** criada anteriormente para o site
* **Connection string** para um [banco de dados SQL Server ou PostgreSQL criado previamente](../prepare-database.md)

<a name="install-aspnet-core" />

## Instale o ASP.NET Core Runtime 6.0

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


Instale o pacote do ASP.NET Core runtime:

{/* No additional package feeds are required to install ASP.NET Core 6.0 on Rocky Linux 8 */}

```sh
yum install aspnetcore-runtime-6.0
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


{/* Instale dependências adicionais: ```sh apt-get install libc6-dev libgdiplus ``` */}

## Instalar o Lacuna PSC

Crie um usuário local para executar o servidor de aplicação do Lacuna PSC:

```sh
mkdir /var/lacuna-psc
useradd --system --home-dir /var/lacuna-psc lacuna-psc
chown lacuna-psc:lacuna-psc /var/lacuna-psc
```

Crie a pasta do site, baixe e extraia os binários:

:::note
Para testar a [próxima versão](../../changelog.md#vnext) do Lacuna PSC, atualmente em estágio *Release Candidate*, substitua `psc-x.y.z.tar.gz` nos comandos abaixo
por `psc-1.7.0-rc01.tar.gz`. **Cuidado**: versões *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas apenas em ambientes de
homologação/testes!
:::


```sh
mkdir /usr/share/lacuna-psc
curl -O https://cdn.lacunasoftware.com/psc/psc-1.4.2.tar.gz
tar xzf psc-1.4.2.tar.gz -C /usr/share/lacuna-psc
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-psc
```

:::note
Os arquivos do site podem ser lidos por qualquer usuário mas só podem ser alterados por usuários com permissões elevadas. Isso significa que o usuário da aplicação (*lacuna-psc*)
pode ler os arquivos mas não pode alterá-los (isso é intencional).
:::


Crie o arquivo de configuração do Lacuna PSC a partir do template fornecido:

```sh
mkdir /etc/lacuna-psc
cp /usr/share/lacuna-psc/config-templates/linux/appsettings.conf /etc/lacuna-psc/
chown -R root:lacuna-psc /etc/lacuna-psc
chmod -R a=,u+rwX,g+rX /etc/lacuna-psc
```

:::note
Arquivos de configuração só podem ser lidos por membros do grupo *lacuna-psc* e só podem ser alterados por usuários com permissões elevadas. Isso é importante para proteger informações
sigilosas armazenadas no arquivo de configuração dos demais usuários da máquina.
:::


## Gere um certificado para assinar tokens de OAuth

Gere um certificado auto-assinado para assinar os tokens de OAuth emitidos pela aplicação:

```sh
dotnet /usr/share/lacuna-psc/Lacuna.Psc.Site.dll -- gen-cert "Patorum PSC" "" /etc/lacuna-psc/issuer.pfx
chown -R root:lacuna-psc /etc/lacuna-psc && chmod -R a=,u+rwX,g+rX /etc/lacuna-psc
```

## Configure as raízes confiáveis

Edite o arquivo de definição das raízes confiáveis:

```sh
mkdir /var/lacuna-psc/trustarbitrators
touch /var/lacuna-psc/trustarbitrators/psc-trust.json
chown -R lacuna-psc:lacuna-psc /var/lacuna-psc
nano /var/lacuna-psc/trustarbitrators/psc-trust.json
```

Insira as raízes confiáveis conforme abaixo:

```json
{
  "Version": "2019-05-09",
  "StandardPkis": [
    "Brazil",
    "Italy",
    "Peru"
  ],
  "TrustedRoots": [
    "MIIFzDC...",
    "MIIFzDC..."
  ]
}
```

* O campo `Version` deve ser mantido
* A coleção `StandardPkis` pode conter `Brazil`, `Italy` ou `Peru` denotando que as raízes desses países devem ser consideradas confiáveis
* A coleção `TrustedRoots` pode conter certificados confiáveis adicionais de AC raiz em formato Base64

:::warning
Este arquivo não suporta comentários
:::


## Configure o Lacuna PSC

Edite o arquivo de configuração e siga as instruções nele para configurar sua instância do Lacuna PSC:

```sh
nano /etc/lacuna-psc/appsettings.conf
```

Na seção `[General]`, para preencher o parâmetro `EncryptionKey` gere uma chave de 256 bits para cifrar dados sensíveis armazenados no banco de dados:

```sh
openssl rand -base64 32
```

Na seção `[Amplia]`, para preencher o parâmetro `ApiKey` é preciso criar uma aplicação na sua instância do [Amplia](../../../amplia/index.md)
e gerar uma chave de API para a aplicação:

1. Autentique-se na sua instância do Amplia
1. Clique em **Aplicações** no menu lateral, em seguida em *Adicionar*
1. Preencha um nome e selecione a conta na qual os certificados devem ser emitidos (**não escolha** o *Sys Admin*)
1. Marque o papel **Worker**
1. Clique em *Criar*
1. Clique em **Chaves**, depois em *Adicionar*
1. Preencha alguma descrição e, no campo *Expiração*, escolha "Nunca expira"
1. Clique em *Criar*
1. Copie a **chave de API** gerada (esse valor não pode ser recuperado posteriormente)

Siga os passos em [Configuração de OpenID Connect](../configure-oidc.md) para preencher a seção `[Oidc]`.

Preencha os demais parâmetros de acordo com as instruções presentes no arquivo de configuração.

## Configurar um *daemon*

Crie o arquivo de definição do serviço:

```sh
touch /etc/systemd/system/lacuna-psc.service
nano /etc/systemd/system/lacuna-psc.service
```

Digite o seguinte:

```
[Unit]
Description=Lacuna PSC

[Service]
WorkingDirectory=/usr/share/lacuna-psc
ExecStart=/usr/bin/dotnet Lacuna.Psc.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=lacuna-psc
User=lacuna-psc
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5003
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Salve o arquivo, habilite o serviço e inicie-o:

```sh
systemctl enable lacuna-psc
systemctl start lacuna-psc
systemctl status lacuna-psc
```

A saída esperada é semelhante a:

```
* lacuna-psc.service - Lacuna PSC
   Loaded: loaded (/etc/systemd/system/lacuna-psc.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-07-07 05:50:04 UTC; 4min 22s ago
 Main PID: 10960 (dotnet)
    Tasks: 31 (limit: 2319)
   CGroup: /system.slice/lacuna-psc.service
           └─10960 /usr/bin/dotnet Lacuna.Psc.Site.dll

...

Dec 04 12:45:08 server.patorum.com lacuna-psc[32562]: Hosting environment: Production
Dec 04 12:45:08 server.patorum.com lacuna-psc[32562]: Content root path: /usr/share/lacuna-psc
Dec 04 12:45:08 server.patorum.com lacuna-psc[32562]: Now listening on: http://localhost:5003
Dec 04 12:45:08 server.patorum.com lacuna-psc[32562]: Application started. Press Ctrl+C to shut down.
Hint: Some lines were ellipsized, use -l to show in full.
```

Se necessário, reinicie o serviço: `systemctl restart lacuna-psc`

Para testar se o servidor do Lacuna PSC está rodando, execute:

```sh
curl http://localhost:5003/api/system/info
```

A saída esperada é algo como:

```json
{"productName":"Lacuna PSC","productVersion":"...","spaVersion":"...","timestamp":"..."}
```

## Configurar um servidor proxy reverso

:::note
Se você preferir usar o Apache ao invés do Nginx, [veja este artigo](https://docs.microsoft.com/pt-br/aspnet/core/host-and-deploy/linux-apache?view=aspnetcore-2.2#configure-apache).
:::


Instale o Nginx (se ainda não estiver instalado):

{/* No additional package feeds are required to install nginx on Rocky Linux 8 */}

```sh
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

Edite o arquivo de configuração do Nginx:

```sh
nano /etc/nginx/nginx.conf
```

Remova ou comente (com `#`s) toda a seção `server` localizada logo abaixo da cláusula `include /etc/nginx/conf.d/*.conf;`. Após fazer isso,
o arquivo de configuração deve ficar semelhante ao exibido abaixo:

```
...

http {
    ...

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    include /etc/nginx/conf.d/*.conf;

#    server {
#        listen       80 default_server;
#        listen       [::]:80 default_server;
#        server_name  _;
#        root         /usr/share/nginx/html;
#
#        # Load configuration files for the default server block.
#        include /etc/nginx/default.d/*.conf;
#
#        location / {
#        }
#
#        error_page 404 /404.html;
#            location = /40x.html {
#        }
#
#        error_page 500 502 503 504 /50x.html;
#            location = /50x.html {
#        }
#    }

    ...
}
```

Crie um arquivo de configuração para o site do Lacuna PSC:

```sh
nano /etc/nginx/conf.d/lacuna-psc.conf
```

Digite o seguinte, substituindo o valor do item `server_name` pelo domínio do site:

```nginx
server {
    listen        80;
    server_name   psc.patorum.com;
    location / {
        proxy_pass         http://localhost:5003;
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


Teste a configuração do Nginx e recarregue-a:

```sh
nginx -t
nginx -s reload
```

Teste o site:

```
curl -H "Host: psc.patorum.com" http://localhost/api/system/info
```

:::warning
Em ambientes de produção, é essencial realizar também a configuração de [Firebase App Check](../configure-firebase.md) e [reCAPTCHA](../configure-recaptcha.md)
para proteger a API de abusos
:::


## Veja também

* [Atualização do Lacuna PSC em Linux](update.md)
* [Resolução de problemas](troubleshoot/index.md)
