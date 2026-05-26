# Instalação do Amplia em Ubuntu Server

Para instalar uma instância [*on premises*](../index.md) do [Amplia Reg](../../index.md) em Ubuntu Server, siga os passos abaixo. Para outras plataformas, [clique aqui](../index.md).

## Pré-requisitos

* Ubuntu Server (qualquer versão ainda suportada pelo fabricante, recomendamos a versão LTS mais recente)

* Instância do **[Amplia](../../../amplia/index.md)** com:
  * Uma AC para emitir certificados de usuários finais (uma [AC raiz](../../../amplia/operation/create-root-ca.md) ou uma [AC intermediária](../../../amplia/operation/create-intermediate-ca.md))
  * Uma [AC para emitir certificados de dispositivos](../../../amplia/operation/create-device-ca.md)
* Licença do **[PKI SDK](../../../pki-sdk/index.md)** (no formato Base64)
* Licença do **[Web PKI](../../../web-pki/index.md)** (formato Base64/binário)
* **Entrada de DNS** criada anteriormente para o site
* **Connection string** para um [banco de dados SQL Server ou PostgreSQL criado previamente](../prepare-database.md)

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


Instale dependências adicionais:

```sh
apt-get install libc6-dev libgdiplus
```

## Instalar o Amplia Reg

Crie um usuário local para executar o servidor de aplicação do Amplia Reg:

```sh
mkdir /var/ampliareg
useradd --system --home-dir /var/ampliareg ampliareg
chown ampliareg:ampliareg /var/ampliareg
```

Crie a pasta do site, baixe e extraia os binários:

:::note
Para testar a [próxima versão](../../changelog.md#vnext) do Amplia Reg, atualmente em estágio *Release Candidate*, substitua `ampliareg-x.y.z.tar.gz` nos comandos abaixo
por `ampliareg-3.1.0-rc02.tar.gz`. **Cuidado**: versões *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas apenas em ambientes de
homologação/testes!
:::


```sh
mkdir /usr/share/ampliareg
curl -O https://cdn.lacunasoftware.com/ampliareg/ampliareg-3.0.0.tar.gz
tar xzf ampliareg-3.0.0.tar.gz -C /usr/share/ampliareg
chmod -R a=,u+rwX,go+rX /usr/share/ampliareg
```

:::note
Os arquivos do site podem ser lidos por qualquer usuário mas só podem ser alterados por usuários com permissões elevadas. Isso significa que o usuário da aplicação (*ampliareg*)
pode ler os arquivos mas não pode alterá-los (isso é intencional).
:::


Crie o arquivo de configuração do Amplia Reg a partir do template fornecido:

```sh
mkdir /etc/ampliareg
cp /usr/share/ampliareg/config-templates/linux/appsettings.conf /etc/ampliareg/
chown -R root:ampliareg /etc/ampliareg
chmod -R a=,u+rwX,g+rX /etc/ampliareg
```

:::note
Arquivos de configuração só podem ser lidos por membros do grupo *ampliareg* e só podem ser alterados por usuários com permissões elevadas. Isso é importante para proteger informações
sigilosas armazenadas no arquivo de configuração dos demais usuários da máquina.
:::


## Configure o Amplia Reg

Edite o arquivo de configuração e siga as instruções nele para configurar sua instância do Amplia Reg:

```sh
nano /etc/ampliareg/appsettings.conf
```

Na seção `[General]`, para preencher o parâmetro `EncryptionKey` gere uma chave de 256 bits para cifrar dados sensíveis armazenados no banco de dados:

```sh
openssl rand -base64 32
```

Ainda na seção `[General]`, para preencher o parâmetro `RootPasswordHash` escolha uma senha forte para o acesso de root e compute o *hash* da senha:

```sh
dotnet /usr/share/ampliareg/Lacuna.AmpliaRegNg.Site.dll -- hash-root-pass
```

Na seção `[Amplia]`, para preencher o parâmetro `ApiKey` é preciso criar uma aplicação na sua instância do [Amplia](../../../amplia/index.md)
e gerar uma chave de API para a aplicação:

1. Autentique-se na sua instância do Amplia
1. Clique em **Aplicações** no menu lateral, em seguida em *Adicionar*
1. Preencha um nome e selecione a conta na qual os certificados devem ser emitidos (a sua instância provavelmente tem uma única conta, então selecione-a)
1. Marque o papel **Worker**
1. Clique em *Criar*
1. Clique em **Chaves**, depois em *Adicionar*
1. Preencha alguma descrição e, no campo *Expiração*, escolha "Nunca expira"
1. Clique em *Criar*
1. Copie a **chave de API** gerada (esse valor não pode ser recuperado posteriormente)

Para preencher os parâmetros da seção `[Amplia:DeviceCertificates]`, siga as instruções em [Criação de AC para certificados de dispositivo](../../../amplia/operation/create-device-ca.md).

Preencha os demais parâmetros de acordo com as instruções presentes no arquivo de configuração.

## Configurar um *daemon*

Crie o arquivo de definição do serviço:

```sh
touch /etc/systemd/system/ampliareg.service
nano /etc/systemd/system/ampliareg.service
```

Digite o seguinte:

```
[Unit]
Description=Amplia Reg

[Service]
WorkingDirectory=/usr/share/ampliareg
ExecStart=/usr/bin/dotnet Lacuna.AmpliaRegNg.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=ampliareg
User=ampliareg
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5002
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Salve o arquivo, habilite o serviço e inicie-o:

```sh
systemctl enable ampliareg
systemctl start ampliareg
systemctl status ampliareg
```

A saída esperada é semelhante a:

```
* ampliareg.service - Amplia Reg
   Loaded: loaded (/etc/systemd/system/ampliareg.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-07-07 05:50:04 UTC; 4min 22s ago
 Main PID: 10960 (dotnet)
    Tasks: 31 (limit: 2319)
   CGroup: /system.slice/ampliareg.service
           └─10960 /usr/bin/dotnet Lacuna.AmpliaRegNg.Site.dll

...

Dec 04 12:45:08 server.patorum.com ampliareg[32562]: Hosting environment: Production
Dec 04 12:45:08 server.patorum.com ampliareg[32562]: Content root path: /usr/share/ampliareg
Dec 04 12:45:08 server.patorum.com ampliareg[32562]: Now listening on: http://localhost:5002
Dec 04 12:45:08 server.patorum.com ampliareg[32562]: Application started. Press Ctrl+C to shut down.
Hint: Some lines were ellipsized, use -l to show in full.
```

Se necessário, reinicie o serviço: `systemctl restart ampliareg`

Para testar se o servidor do Amplia está rodando, execute:

```sh
curl http://localhost:5002/api/system/info
```

A saída esperada é algo como:

```json
{"productName":"Lacuna Amplia Reg","productVersion":"...","spaVersion":"...","timestamp":"..."}
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

Crie um arquivo de configuração para o site do Amplia Reg:

```sh
touch /etc/nginx/sites-available/ampliareg
nano /etc/nginx/sites-available/ampliareg
```

Digite o seguinte, substituindo o valor do item `server_name` pelo domínio do site:

```nginx
server {
    listen        80;
    server_name   ampliareg.patorum.com;
    client_max_body_size 11000000;
    location / {
        proxy_pass         http://localhost:5002;
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
ln -sf /etc/nginx/sites-available/ampliareg /etc/nginx/sites-enabled/ampliareg
```

Teste a configuração do Nginx e recarregue-a:

```sh
nginx -t
nginx -s reload
```

Teste o site:

```
curl -H "Host: ampliareg.patorum.com" http://localhost/api/system/info
```

:::warning
Em ambientes de produção, é essencial realizar também a configuração [reCAPTCHA](../settings/configure-recaptcha.md) para proteger a API de abusos
:::


## Procedimento pós-instalação

Siga o [procedimento pós-instalação](../post-install.md) para finalizar o processo de instalação.

## Veja também

* [Atualização do Amplia Reg em Linux](update.md)
* [Resolução de problemas](troubleshoot/index.md)
