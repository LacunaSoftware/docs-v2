---
slug: /rest-pki/core/on-premises/update-50
sidebar_position: 3
sidebar_label: "Atualização de 4.x para 5.0"
---

# Atualizando o Rest PKI Core da versão 4.x para 5.0

A versão [5.0](../../changelog.md#v5-0-0) do [Rest PKI Core](../../index.md) foi migrada do ASP.NET Core 8.0 para o ASP.NET Core 10.0, a versão LTS atual
do ASP.NET Core, [com suporte da Microsoft até novembro de 2028](https://dotnet.microsoft.com/platform/support/policy/dotnet-core#lifecycle) (o suporte
ao ASP.NET Core 8.0 termina em novembro de 2026).

Por isso, antes de atualizar a sua instância [on-premises](../index.md), você pode precisar seguir alguns passos adicionais, dependendo de como ela
está instalada.

## 1. Verifique como a sua instância está instalada

- Se a sua instância roda em **Docker** ou no **Azure App Services**, a imagem 5.x já inclui o ASP.NET Core Runtime 10.0 e tudo o mais de que ela
  precisa. Não há nada para instalar: **pule direto para o passo 3**.
- Se a sua instância roda diretamente em **Linux** (Ubuntu, Rocky Linux) ou em **Windows Server**, você precisa instalar o novo runtime antes:
  **siga para o passo 2**.

## 2. Instale o ASP.NET Core Runtime 10.0

Instale o runtime correspondente à sua plataforma, conforme descrito abaixo.

:::tip
Não é necessário desinstalar as versões anteriores do ASP.NET Core Runtime: várias versões podem coexistir no mesmo sistema sem problemas
:::

### Ubuntu

:::info
Estas instruções assumem que você está logado como **root**. Se não estiver, execute `sudo su -` antes de continuar!
:::

No **Ubuntu 24.04 (LTS) ou mais recente**, o ASP.NET Core Runtime 10.0 está disponível no repositório de pacotes padrão do Ubuntu:

```sh
apt update
apt install -y aspnetcore-runtime-10.0
```

No **Ubuntu 22.04 (LTS)**, primeiro registre o repositório de backports do .NET do Ubuntu e depois instale o runtime:

```sh
apt update
apt install -y software-properties-common
add-apt-repository -y ppa:dotnet/backports
apt update
apt install -y aspnetcore-runtime-10.0
```

:::warning
O Ubuntu 20.04 e versões anteriores não são suportados pelo .NET 10. Atualize o sistema operacional antes de atualizar o Rest PKI Core.
:::

:::caution
Se o ASP.NET Core Runtime anterior foi instalado a partir do repositório de pacotes da Microsoft (`packages.microsoft.com`), como era o caso no Ubuntu 20.04 e anteriores, remova esses pacotes antes de instalar o runtime pelo repositório do Ubuntu. Misturar pacotes do .NET dos dois repositórios causa erros na inicialização da aplicação. Para mais informações, veja [.NET package mix ups on Linux](https://learn.microsoft.com/dotnet/core/install/linux-package-mixup).
:::

### Rocky Linux

:::info
Estas instruções assumem que você está logado como **root**. Se não estiver, execute `sudo su -` antes de continuar!
:::

No Rocky Linux 8, 9 e 10 (assim como no RHEL e em outras distribuições compatíveis), o ASP.NET Core Runtime 10.0 está disponível no repositório AppStream:

```sh
dnf install aspnetcore-runtime-10.0
```

### Windows Server

Baixe e instale o **Hosting Bundle do ASP.NET Core Runtime 10.0** na [página de download do .NET 10.0](https://dotnet.microsoft.com/download/dotnet/10.0)
(seção *ASP.NET Core Runtime*, item *Hosting Bundle* em *Windows*). Após a instalação, reinicie o IIS:

```
iisreset
```

### Teste a instalação

No Linux, execute:

```sh
dotnet --list-runtimes
```

A saída deve incluir uma linha semelhante a:

```
Microsoft.AspNetCore.App 10.0.* [*/dotnet/shared/Microsoft.AspNetCore.App]
```

:::tip
Para outras versões de sistema operacional e formas alternativas de instalar o ASP.NET Core Runtime, veja [esta página](https://learn.microsoft.com/dotnet/core/install/)
:::

## 3. Atualize o Rest PKI Core

Siga as instruções padrão de atualização da sua plataforma.

:::note
A versão 5.0 atualiza o modelo do banco de dados. Na instalação padrão, em que a aplicação tem privilégios de owner sobre o banco, o modelo é
atualizado automaticamente na primeira vez em que a versão 5.0 é iniciada. Se a sua instância roda [sem privilégios de db_owner](../unprivileged-db-user.md),
execute o comando [update-db](../tool/update-db.md) antes de iniciar a nova versão.
:::

### Docker

Atualize os seus containers para a imagem `lacunasoftware/restpkicore:5.0`, conforme descrito na [instalação em Docker](../docker.md). Nenhuma outra
mudança é necessária: a imagem já inclui o ASP.NET Core Runtime 10.0 e todas as suas dependências.

As imagens Linux da versão 5.x são baseadas no **Ubuntu 24.04 (noble)** em vez do Debian 12 (bookworm). Isso não tem efeito se você apenas executa a
imagem. Se você estende a imagem ou executa comandos dentro do container (por exemplo, para instalar pacotes adicionais), leve em conta o conjunto de
pacotes e os caminhos de sistema do Ubuntu.

### Azure App Services

Siga as [instruções de atualização no Azure App Services](../azure/update.md) com a imagem `5.0.0`. A observação acima sobre a imagem Docker também
vale aqui.

### Linux

Siga as [instruções de atualização no Linux](../linux/update.md) com o pacote `restpkicore-5.0.0.tar.gz`.

### Windows Server

Baixe o pacote `restpkicore-5.0.0.zip` indicado na [configuração no Windows Server](../windows-server.md), pare o site no IIS, substitua os arquivos
da pasta do site pelos do novo pacote e inicie o site novamente.

## 4. Verifique a versão instalada

Após a atualização, [verifique a versão](../check-version.md) da sua instância. O campo `productVersion` deve começar com `5.0`.

## OpenTelemetry

Se a sua instância exporta telemetria para um collector OpenTelemetry, observe que o valor padrão do atributo de recurso `service.name` mudou de
`restpkicore` para `Lacuna Rest PKI Core`. Se os seus dashboards ou consultas filtram pelo valor anterior, defina a variável de ambiente
`OTEL_SERVICE_NAME` explicitamente:

```sh
OTEL_SERVICE_NAME=restpkicore
```
