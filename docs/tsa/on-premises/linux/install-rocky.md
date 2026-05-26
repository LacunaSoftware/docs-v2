# Instalação do Lacuna TSA em Rocky Linux

Para instalar uma instância on premises do [Lacuna TSA](../index.md) em Rocky Linux, siga os passos abaixo. Para outras plataformas, [clique aqui](../index.md).

## Pré-requisitos

* Rocky Linux 8.x ou superior

* Licença do **[PKI SDK](../../../pki-sdk/index.md)** (no formato Base64)
* Certificado da autoridade de carimbo de tempo (em formato PKCS#12 ou em uma instância do **[Amplia](../../../amplia/index.md)**)

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

## Instalar o Lacuna TSA

Crie um usuário local para executar o servidor de aplicação do Lacuna TSA:

```sh
mkdir /var/lacuna-tsa
useradd --system --home-dir /var/lacuna-tsa lacuna-tsa
chown lacuna-tsa:lacuna-tsa /var/lacuna-tsa
```

Crie a pasta do site, baixe e extraia os binários:

```sh
mkdir /usr/share/lacuna-tsa
curl -O https://cdn.lacunasoftware.com/tsa/tsa-1.2.1.tar.gz
tar xzf tsa-1.2.1.tar.gz -C /usr/share/lacuna-tsa
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-tsa
```

:::note
Os arquivos do site podem ser lidos por qualquer usuário mas só podem ser alterados por usuários com permissões elevadas. Isso significa que o usuário da aplicação (*lacuna-tsa*)
pode ler os arquivos mas não pode alterá-los (isso é intencional).
:::


Crie o arquivo de configuração do Lacuna TSA a partir do template fornecido:

```sh
mkdir /etc/lacuna-tsa
cp /usr/share/lacuna-tsa/config-templates/linux/appsettings.conf /etc/lacuna-tsa/
chown -R root:lacuna-tsa /etc/lacuna-tsa
chmod -R a=,u+rwX,g+rX /etc/lacuna-tsa
```

:::note
Arquivos de configuração só podem ser lidos por membros do grupo *lacuna-tsa* e só podem ser alterados por usuários com permissões elevadas. Isso é importante para proteger informações
sigilosas armazenadas no arquivo de configuração dos demais usuários da máquina.
:::


:::warning
Este arquivo não suporta comentários
:::


## Configure o Lacuna TSA

Edite o arquivo de configuração e siga as instruções nele para configurar sua instância do Lacuna TSA:

```sh
nano /etc/lacuna-tsa/appsettings.conf
```

Se a chave do seu certificado de TSA estiver hospedada em uma instância do Amplia, será necessário preencher a seção `[Amplia]`. Para preencher o parâmetro `ApiKey` é preciso criar uma
aplicação na sua instância do Amplia e gerar uma chave de API para a aplicação:

1. Autentique-se na sua instância do Amplia
1. Clique em **Aplicações** no menu lateral, em seguida em *Adicionar*
1. Preencha um nome e selecione a conta na qual os certificados devem ser emitidos (**não escolha** o *Sys Admin*)
1. Marque o papel **Gerente** (ou *Manager*)
1. Clique em *Criar*
1. Clique em **Chaves**, depois em *Adicionar*
1. Preencha alguma descrição e, no campo *Expiração*, escolha "Nunca expira"
1. Clique em *Criar*
1. Copie a **chave de API** gerada (esse valor não pode ser recuperado posteriormente)

Preencha os demais parâmetros de acordo com as instruções presentes no arquivo de configuração.

## Configurar um *daemon*

Crie o arquivo de definição do serviço:

```sh
touch /etc/systemd/system/lacuna-tsa.service
nano /etc/systemd/system/lacuna-tsa.service
```

Digite o seguinte:

```
[Unit]
Description=Lacuna TSA

[Service]
WorkingDirectory=/usr/share/lacuna-tsa
ExecStart=/usr/bin/dotnet Lacuna.Tsa.Server.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=lacuna-tsa
User=lacuna-tsa
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5005
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Salve o arquivo, habilite o serviço e inicie-o:

```sh
systemctl enable lacuna-tsa
systemctl start lacuna-tsa
systemctl status lacuna-tsa
```

A saída esperada é semelhante a:

```
● lacuna-tsa.service - Lacuna TSA
     Loaded: loaded (/etc/systemd/system/lacuna-tsa.service; enabled; vendor preset: enabled)
     Active: active (running) since Fri 2023-12-01 17:58:50 -03; 2 days ago
   Main PID: 33858 (dotnet)
      Tasks: 29 (limit: 4627)
     Memory: 58.5M
        CPU: 10.842s
     CGroup: /system.slice/tsa.service
             └─33858 /usr/bin/dotnet Lacuna.Tsa.Server.dll

dez 04 15:01:29 server.patorum.com systemd[1]: Started Lacuna TSA.
dez 04 15:01:29 server.patorum.com lacuna-tsa[193611]: info: Lacuna.Tsa.Server.ApplicationStarter[0]
dez 04 15:01:29 server.patorum.com lacuna-tsa[193611]:       Application starting (version: 1.2.0 RTM)
dez 04 15:01:31 server.patorum.com lacuna-tsa[193611]: info: Lacuna.Tsa.Server.ApplicationStarter[0]
dez 04 15:01:31 server.patorum.com lacuna-tsa[193611]:       Application started
Hint: Some lines were ellipsized, use -l to show in full.
```

Se necessário, reinicie o serviço: `systemctl restart lacuna-tsa`

Para testar se o servidor do Lacuna TSA está rodando, execute:

```sh
curl http://localhost:5005/api/system/info
```

A saída esperada é algo como:

```json
{"productName":"Lacuna TSA","productVersion":"...","timestamp":"..."}
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

Crie um arquivo de configuração para o site do Lacuna TSA:

```sh
nano /etc/nginx/conf.d/lacuna-tsa.conf
```

Digite o seguinte, substituindo o valor do item `server_name` pelo domínio do site:

```nginx
server {
    listen        80;
    server_name   tsa.patorum.com;
    location / {
        proxy_pass         http://localhost:5005;
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
curl -H "Host: tsa.patorum.com" http://localhost/api/system/info
```

{/* nothing here */}

## Veja também

* [Atualização do Lacuna TSA em Linux](update.md)
* [Resolução de problemas](troubleshoot/index.md)
