---
sidebar_label: "Instalação"
sidebar_position: 2
---

# Instalação

O Lacuna Bulk Signer é um único serviço que pode rodar em quatro alvos suportados:

| Alvo | Modelo de processo | Ciclo de vida gerenciado por |
|------|--------------------|------------------------------|
| systemd no Linux | Serviço em segundo plano | `systemctl` |
| Serviço do Windows | Serviço em segundo plano | `services.msc` / `sc.exe` |
| Docker / Compose | Container | `docker compose` |
| Console (pontual / teste) | Primeiro plano | Operador (`Ctrl+C`) |

O mesmo binário suporta os quatro. O banner de inicialização imprime uma linha `host mode = …` que
informa qual ciclo de vida está de fato ativo.

Você baixa a aplicação da Lacuna: a **imagem de container**, do repositório privado de imagens Docker
da Lacuna, ou os **binários publicados**, de uma URL de download específica do sistema operacional que
contém o identificador único da sua organização. Os scripts de instalação por alvo e o arquivo de
configuração de exemplo comentado chegam separadamente, no **pacote de implantação**. A seção
[Obtendo o produto](#obtendo-o-produto) trata dos dois e das credenciais que cada um exige.

## Escolha seu alvo

| Onde o serviço vai rodar? | Use |
|---------------------------|-----|
| Servidor Linux | systemd — `deploy/linux/install.sh` |
| Servidor Windows | Serviço do Windows — `deploy/windows/Install-Service.ps1` |
| Qualquer host com Docker | Container — `deploy/docker/docker-compose.yml` |
| Azure, em mais de uma instância | **[Azure App Service (modo cluster)](azure.md)** — página própria |
| Apenas testando localmente | Console — execute o executável publicado em primeiro plano |

Todos os alvos desta página são de **instância única**, que é o que este produto é, a menos que você
ative deliberadamente o modo cluster. Rodar duas instâncias dessas sobre um mesmo compartilhamento de
trabalho é um risco documentado, e não uma implantação — veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho). A
única topologia com múltiplas instâncias suportada é um Azure Web App com escala horizontal em
um único App Service Plan, e ela tem seu próprio passo a passo
([Azure App Service](azure.md)) e sua própria lista de limites
([Alta disponibilidade](high-availability.md)).

## Obtendo o produto

Não há download público, e nada aqui é compilado a partir do código-fonte. A Lacuna Software distribui
a aplicação de duas formas, e o alvo que você acabou de escolher define qual delas você usa:

| O que você baixa | De onde | Para quais alvos |
|------------------|---------|------------------|
| A **imagem de container**, já pronta | Do repositório privado de imagens Docker da Lacuna, como `<registry-da-lacuna>/bulksigner:<versão>` | Docker / Compose, [Azure App Service](azure.md) |
| Os **binários publicados**, um arquivo por sistema operacional | De uma URL de download que contém o identificador único da sua organização | systemd no Linux, Windows Service, console |

Nenhum dos dois artefatos traz os scripts de instalação. Eles vêm no **pacote de implantação** — um
único arquivo, o mesmo para todos os sistemas operacionais, com a árvore `deploy/`, o
`appsettings.Production.json.sample` comentado e os scripts auxiliares em PowerShell documentados em
[Exemplos](samples.md). Descompacte-o na máquina de onde você vai instalar: todos os caminhos `deploy/…`
desta página são relativos à raiz dele.

A Lacuna fornece a você três itens, e eles não são intercambiáveis:

| O que você recebe | O que destrava | Se vazar ou expirar |
|-------------------|----------------|---------------------|
| **Credenciais de registry** — um usuário e um token de acesso | O pull da imagem do repositório privado | Peça a reemissão à Lacuna. O token é restrito à sua organização e pode ser revogado individualmente. |
| **Um identificador único** | As URLs de download dos binários | Peça a reemissão à Lacuna. Ele identifica a sua organização, e não uma versão — um mesmo identificador serve a todos os sistemas operacionais. |
| **A string de licença do PKI SDK** | O serviço **em execução**, em todos os alvos — não o download | Não é uma credencial de distribuição; veja [Obtendo a licença do PKI SDK](#obtendo-a-licença-do-pki-sdk). |

:::warning O identificador em uma URL de download é uma credencial
Ele é a única proteção entre essa URL e qualquer pessoa que a tenha, então uma URL que o contém não deve
aparecer em um ticket público, em um log de CI compartilhado, em uma página de wiki ou em um script
versionado. Guarde-o onde você guarda o token do registry — e, se ele vazar, peça a reemissão à Lacuna
em vez de contar com que o link continue desconhecido.
:::

### A imagem de container

```bash
docker login <registry-da-lacuna> --username <usuário-do-registry>   # pede o token de acesso
docker pull <registry-da-lacuna>/bulksigner:<versão>
```

A Lacuna fornece juntos o host do registry, o caminho do repositório e as credenciais. O repositório
é privado, então um pull sem autenticação responde `not found` em vez de `unauthorized` — essa é a
resposta habitual do Docker para um repositório que suas credenciais não conseguem ver, e não um sinal de
que você digitou o nome errado.

**Fixe a `<versão>`.** Uma tag `latest` muda com o tempo, e em um host de containers isso significa que
um restart pode subir uma versão que você não escolheu instalar.

Nenhum build é feito localmente: a imagem que a Lacuna publica é a que roda, baseada no Ubuntu
24.04 LTS pelo motivo explicado em [Docker / Compose](#docker--compose), abaixo.

### Os binários publicados

Baixe o arquivo correspondente ao sistema operacional do host e extraia-o em um local que o script de
instalação consiga ler:

```bash
# Linux
curl -fL -o bulksigner-linux-x64.tar.gz \
  "https://cdn.lacunasoftware.com/bulk-signer/<identificador>/linux-x64.tar.gz"
mkdir -p publish && tar -xzf bulksigner-linux-x64.tar.gz -C publish
```

```powershell
# Windows — um prompt comum basta aqui; só a instalação em si precisa de elevação
Invoke-WebRequest -Uri "https://cdn.lacunasoftware.com/bulk-signer/<identificador>/win-x64.zip" -OutFile bulksigner-win-x64.zip
Expand-Archive -Path bulksigner-win-x64.zip -DestinationPath publish
```

`publish` é o nome que o resto desta página usa, porque é o que os scripts de instalação recebem em
`--from publish` / `-From publish` — o nome é indiferente para o arquivo compactado, e a flag aceita
qualquer caminho. Fale com a Lacuna se você precisar de um sistema operacional ou de uma arquitetura que
essas duas URLs não cobrem.

### Um host sem rota para a internet

Nenhum dos dois artefatos precisa de acesso à internet no momento da instalação: ambos são
autossuficientes, sem feed de pacotes, sem etapa de restore e sem nenhuma conexão posterior com a origem —
então baixar em uma estação conectada e copiar para o host resolve por completo. Leve os binários no
arquivo compactado; leve a imagem com `docker save` / `docker load`, ou publique-a em um registry que o
host alcance, que é o que o
[passo 1](azure.md#1-importe-a-imagem) do passo a passo do Azure faz, por outro motivo. A licença do PKI
SDK é uma string, e não um download, então uma instalação isolada da rede continua isolada.

### Depois, confira o que você obteve

A versão realmente em execução aparece na barra superior do dashboard, em todas as páginas, é impressa
por completo abaixo do banner com a marca exibido no console a cada início, e também está na página
Sistema. Depois de concluir a instalação abaixo, compare-a com a versão que você deveria instalar — é a
única confirmação de que a URL, ou a tag, entregou o que você esperava.

## Pré-requisitos — comuns a todos os alvos

1. **String de licença do Lacuna PKI SDK** (base64), fornecida pela Lacuna Software. Obrigatória na
   inicialização; sem ela, o serviço se recusa a subir. Veja
   [Obtendo a licença do PKI SDK](#obtendo-a-licença-do-pki-sdk).
2. **Uma origem de certificado de assinatura.** Escolha uma:
   - **PFX** — um arquivo `.pfx` / `.p12` mais a senha que o destrava.
   - **PKCS#11** — um driver do fabricante (`.so` no Linux, `.dll` no Windows), mais o thumbprint
     SHA-1 do certificado de assinatura no token, mais o PIN fornecido por variável de ambiente.
   - **Repositório de certificados do Windows** — apenas em alvos Windows, mais o thumbprint SHA-1.

   Veja os detalhes em [Certificados](certificates.md). O certificado que você configura é o seed (carga
   inicial) do primeiro **perfil de assinatura** no primeiro boot; daí em diante, os perfis — incluindo o
   certificado — ficam no banco de dados operacional e são gerenciados pelo dashboard (veja
   [Configuração](configuration.md#signingprofiles--perfis-de-assinatura-por-pasta)). Se o certificado
   de um perfil tem um segredo — uma senha de PFX, um segredo de aplicativo do Azure Key Vault, uma
   credencial de blob —, defina também o `Signing:ProfileSecretsKey` **antes** do primeiro boot e faça
   backup dele: a importação é recusada sem ele, e perdê-lo depois significa digitar esses segredos de
   novo.
3. **Decisão sobre criptografia.** Deixe desabilitada (padrão) ou habilite o BSENC v1. Se habilitar a
   criptografia, decida onde a senha e o salt vão ficar antes do primeiro boot. Veja
   [Criptografia](encryption.md).
4. **Terminação TLS.** O serviço escuta em HTTP puro por padrão. A implantação recomendada faz a
   terminação TLS em um proxy reverso (nginx, IIS, Traefik). A flag `Hosting:RequireHttps` (padrão
   `false`) controla o redirecionamento HTTPS no próprio processo — defina-a como `true` apenas se você tiver
   configurado um certificado no Kestrel.
5. **Pastas de entrada monitoradas.** Decida se você precisa de uma pasta de entrada (padrão) ou de
   várias. Com uma única pasta, omita `Storage:Inputs[]` por completo — o serviço cria uma chamada
   `default` em `{Root}/input`. Para múltiplas pastas, preencha `Storage:Inputs[]` com uma entrada
   por pasta; veja [Configuração](configuration.md#storage). O perfil de assinatura usado para assinar
   os arquivos de cada pasta é **escolhido na página do perfil depois do primeiro boot**, uma pasta por
   perfil; a chave `Profile` de uma pasta só serve de seed para essa escolha no primeiro boot (veja
   [Configuração](configuration.md#storageinputsprofile--roteamento-por-pasta)).

Toda instalação cria uma configuração de produção editável a partir do
`appsettings.Production.json.sample` fornecido. O exemplo vem comentado com marcadores `REQUIRED` e
`SECRET`; revise-o antes do primeiro start.

## Obtendo a licença do PKI SDK

A licença é uma string base64 fornecida pela Lacuna Software. Há duas formas de carregá-la:

| Onde | Como |
|------|------|
| Variável de ambiente (preferencial) | Defina `Signing__PkiSdkLicense=<licença-base64>` |
| Arquivo de configuração | Defina `Signing:PkiSdkLicense` em `appsettings.Production.json` |

A variável de ambiente tem precedência no boot. Os scripts de instalação leem a variável de ambiente
do arquivo específico de cada alvo (`/etc/bulksigner/bulksigner.env` no Linux, variáveis de ambiente
de escopo de máquina no Windows, `.env` no Docker), de modo que a licença nunca vai parar em um arquivo
versionado. Veja em [Segurança](security.md) o tratamento completo de segredos.

:::warning Atualizando a partir da 1.0.x
Esta chave se chamava `Signing:License` (`Signing__License`) na 1.0.x e foi renomeada na **1.1.0**. O
nome antigo não é mais lido, então uma instalação atualizada que ainda o define falha na inicialização
com `Signing:PkiSdkLicense is required`. Renomeie a chave no seu arquivo de configuração ou de
ambiente como parte da atualização.
:::

## Linux — systemd

```bash
# 1. Com os binários extraídos em publish/ e o pacote de implantação descompactado na
#    máquina de destino (veja Obtendo o produto acima):
sudo bash deploy/linux/install.sh --from publish

# 2. Edite a configuração de produção e o arquivo de ambiente com os segredos.
sudo nano /etc/bulksigner/appsettings.Production.json
sudo nano /etc/bulksigner/bulksigner.env

# 3. Reinicie para que as mudanças de configuração tenham efeito.
sudo systemctl restart bulksigner

# 4. Verifique se o serviço está no ar.
curl http://localhost:8080/api/health
curl http://localhost:8080/api/ready
systemctl --no-pager status bulksigner
journalctl -u bulksigner -f
```

Caminhos de instalação (convenções FHS):

| Caminho | Finalidade | Modo | Dono |
|---------|------------|------|------|
| `/opt/bulksigner` | Binário (somente leitura após a instalação) | `0755` | `root:root` |
| `/var/lib/bulksigner` | Dados: `input` / `processing` / `output` / `db` | `0750` | `bulksigner:bulksigner` |
| `/var/log/bulksigner` | Arquivos de log duráveis | `0750` | `bulksigner:bulksigner` |
| `/etc/bulksigner` | `appsettings.Production.json` + `bulksigner.env` | `0750` | `bulksigner:bulksigner` |

A unit do systemd usa `Type=notify`, de modo que `systemctl status` só informa `active (running)` depois
que todo o bootstrap (carregamento da licença + migração do banco + recuperação do pipeline) for concluído
com sucesso. As flags de hardening (`NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`) vêm
ativadas por padrão.

**Desinstalação:**

```bash
sudo bash deploy/linux/uninstall.sh          # para + remove a unit, preserva os dados
sudo bash deploy/linux/uninstall.sh --purge  # também apaga dados, logs, configuração e o usuário de sistema
```

## Windows — serviço do Windows

```powershell
# 1. Com os binários extraídos em publish\ e o pacote de implantação descompactado na máquina de
#    destino (veja Obtendo o produto acima), em um prompt do PowerShell COM PRIVILÉGIOS ELEVADOS:
.\deploy\windows\Install-Service.ps1 -From publish

# 2. Edite a configuração de produção:
notepad C:\ProgramData\Lacuna\BulkSigner\config\appsettings.Production.json

# 3. Defina os segredos como variáveis de ambiente de escopo de máquina:
[Environment]::SetEnvironmentVariable("Signing__PkiSdkLicense",                "<licença-base64>", "Machine")
[Environment]::SetEnvironmentVariable("Auth__ApiKey",                    "<chave-de-api>",   "Machine")
[Environment]::SetEnvironmentVariable("BULK_SIGNER_PKCS11_PIN",          "<pin-do-hsm>",     "Machine")
[Environment]::SetEnvironmentVariable("BULK_SIGNER_ENCRYPTION_PASSWORD", "<senha>",          "Machine")
Restart-Service LacunaBulkSigner

# 4. Verifique.
Invoke-WebRequest http://localhost:8080/api/health
Invoke-WebRequest http://localhost:8080/api/ready
Get-Service LacunaBulkSigner
Get-Content C:\ProgramData\Lacuna\BulkSigner\logs\bulksigner-*.log -Tail 50 -Wait
```

Caminhos de instalação (convenções do Windows):

| Caminho | Finalidade |
|---------|------------|
| `C:\Program Files\Lacuna\BulkSigner` | Binário (somente leitura após a instalação) |
| `C:\ProgramData\Lacuna\BulkSigner\config` | `appsettings.Production.json` |
| `C:\ProgramData\Lacuna\BulkSigner\data` | Dados operacionais (`input` / `processing` / `output` / `db`) |
| `C:\ProgramData\Lacuna\BulkSigner\logs` | Arquivos de log |

O serviço roda com uma **conta virtual** (`NT SERVICE\LacunaBulkSigner`) — sem senha de operador para
gerenciar nem conta de domínio para receber permissões. O script de instalação concede a essa conta acesso
à árvore em `ProgramData` e configura a recuperação em caso de falha (reiniciar após 5 s na primeira e
na segunda falha, 30 s na terceira).

:::note
Os logs da aplicação vão apenas para o destino de arquivo. O log de eventos Aplicativo do Windows
registra as entradas de ciclo de vida do serviço (start / stop / falha) — e não as linhas de log de cada
job. Procure essas linhas no arquivo de log.
:::

**Desinstalação:**

```powershell
.\deploy\windows\Uninstall-Service.ps1         # para + remove o serviço, preserva os dados
.\deploy\windows\Uninstall-Service.ps1 -Purge  # também apaga o ProgramData e as variáveis de ambiente de máquina
```

## Docker / Compose

```bash
cd deploy/docker

# 1. Autentique-se no registry privado da Lacuna — a linha image: do compose o nomeia.
docker login <registry-da-lacuna> --username <usuário-do-registry>

# 2. Prepare os diretórios de trabalho no host.
cp .env.sample .env
mkdir -p data logs config
cp ../appsettings.Production.json.sample config/appsettings.Production.json

# 3. Edite a configuração e o arquivo de ambiente.
nano config/appsettings.Production.json
nano .env

# 4. O container roda como UID 1654. Em hosts Linux:
sudo chown -R 1654:1654 data logs

# 5. Suba — o `up` faz o pull da imagem na primeira execução.
docker compose up -d

# 6. Verifique.
curl http://localhost:8080/api/health
docker compose ps                       # deve mostrar "healthy" após ~30 s
docker compose logs -f bulksigner
```

É na linha `image:` do arquivo do compose que ficam o repositório privado e a tag fixada, então é essa a
linha que você edita na atualização. Um pull que falha aparece como um container que nunca inicia e um
log de aplicação vazio — porque ainda não há aplicação —, então confira o `docker login` antes de tirar
conclusões do silêncio.

A Lacuna gera a imagem sobre o Ubuntu 24.04 LTS — **não** sobre o Alpine. As bibliotecas `.so` de HSM
geralmente não são compatíveis com musl, então o Alpine está fora de questão; o requisito é glibc, e o
.NET 10 não publica imagem Debian — por isso a base é Ubuntu, e não a Debian-slim que versões anteriores
usavam. Nada do que você configura muda com isso: os mesmos nomes de pacote, o mesmo UID 1654 sem
privilégios, os mesmos caminhos. A imagem já traz ferramentas PKCS#11 genéricas
(`libpcsclite1` + `opensc`); os drivers de HSM dos fabricantes (SafeNet, Thales, Entrust, Yubico) são
montados pelo operador em tempo de execução, via `volumes:` no arquivo do compose. Veja os
exemplos comentados em `deploy/docker/docker-compose.yml`.

Um `HEALTHCHECK` consulta `/api/health` a cada 30 segundos, de modo que `docker ps` e orquestradores
enxergam o status `(healthy)` / `(unhealthy)` corretamente.

Bind mounts e caminhos no host:

| Caminho no container | Caminho no host | Finalidade |
|----------------------|-----------------|------------|
| `/app/appsettings.Production.json` | `./config/appsettings.Production.json` (somente leitura) | Configuração editada pelo operador |
| `/var/lib/bulksigner` | `./data` | Árvore de dados operacionais (input / processing / output / db) |
| `/var/log/bulksigner` | `./logs` | Arquivos de log duráveis |

Se você usar um [logotipo do cliente](configuration.md#branding--o-logotipo-do-cliente-nas-páginas-de-login-e-de-aprovação)
nas páginas de login e de aprovação, ele é montado da mesma forma — somente leitura, com
`Branding:CustomerLogo:Path` indicando o caminho *dentro* do container. O arquivo do compose traz o
exemplo comentado.

## Console em primeiro plano (pontual / teste)

Execute o executável publicado diretamente para iniciar o serviço em primeiro plano — útil para um
teste local rápido ou para ver erros de bootstrap imediatamente:

```bash
# Linux
./publish/Lacuna.BulkSigner

# Windows
.\publish\Lacuna.BulkSigner.exe
```

- A árvore `data/` é criada em relação ao diretório de trabalho.
- Use `Ctrl+C` para parar. O banner de bootstrap imprime `host mode = console`.
- Em um terminal interativo, um painel de status ao vivo substitui o log em fluxo contínuo. Veja
  [Dashboard no console](dashboard.md#dashboard-no-console-somente-execuções-em-primeiro-plano).

## Armazenamento em Azure Files (opcional)

Todas as instalações acima mantêm a árvore `data/` inteira no host. Definir
[`Storage:Provider = AzureFiles`](configuration.md#storageprovider--storageazurefiles--o-compartilhamento-de-trabalho)
move o **compartilhamento de trabalho** — `processing/`, `output/` e `error/` — para um
compartilhamento do Azure Files, acessado pelo SDK do próprio serviço. Sem montagem SMB, sem
dependência no nível do host, sem mudança em nenhum passo de instalação acima.

O que você decide antes de instalar:

| Decisão | Observações |
|---------|-------------|
| **Qual compartilhamento abriga as raízes de trabalho** | Um compartilhamento, não vários: promover um artefato verificado e realocar a cópia em staging de um job que falhou são operações de *rename*, e o rename do Azure não funciona entre compartilhamentos nem entre contas. Acrescente um prefixo `Directory` se várias implantações dividirem um mesmo compartilhamento. |
| **Onde ficam as pastas de entrada** | Independente do item acima e definido por pasta — a passagem de uma pasta de entrada para o staging é uma *cópia*, e uma cópia pode cruzar qualquer fronteira. Uma pasta pode continuar local enquanto o compartilhamento de trabalho é remoto, ou ler o compartilhamento de um cliente na conta dele. |
| **A credencial** | `ManagedIdentity` (atribuída pelo sistema, sem segredo) onde o host roda no Azure; `ServicePrincipal` *on-premises*; `AccountKey` apenas onde o host não consegue alcançar o tenant de forma alguma. Veja [Segurança](security.md#credenciais-de-armazenamento-do-azure-files). |
| **O intervalo de polling por pasta remota** | O Azure Files não publica notificações de mudança, então uma pasta remota é **enumerada por temporizador**. Uma pasta para a qual nenhum intervalo se aplica é recusada no boot. |

Os requisitos do host são os mesmos em todos os alvos: HTTPS de saída para
`https://<conta>.file.core.windows.net` e — para `ManagedIdentity` — um endpoint IMDS alcançável, o
que no alvo Docker significa que o container precisa alcançar `169.254.169.254`.

:::warning `logs/` e o banco SQLite nunca podem ir para um compartilhamento
`Logging:File:Path` é sempre um caminho local, e a inicialização **recusa** uma configuração que o
mova: o destino de arquivo acessa o sistema de arquivos pela própria API e não pode apontar para um
compartilhamento. Com `Database:Provider = Sqlite`, uma `ConnectionStrings:Default` que aponte para um
compartilhamento é recusada, porque acessar um arquivo de banco de dados por SMB é a forma documentada de
corrompê-lo. Com `SqlServer`, o diretório `db/` simplesmente não é usado.
:::

**O que muda operacionalmente.** A entrada de arquivos deixa de ser orientada a eventos e passa a ser
por temporizador (cerca de meio minuto nos padrões, no pior caso), inspecionar `error/` e
`processing/` passa a exigir um cliente de armazenamento em vez de uma sessão SSH, e o
compartilhamento é marcado no boot, de modo que uma segunda instância fica visível. Os três pontos
estão detalhados em
[Operação](operations.md#o-que-muda-no-dia-a-dia-em-um-compartilhamento).

**Verificação.** O banner de boot ganha as linhas `work share`, `azure credential`,
`input providers` e `azure shares = N reachable`; o `/api/ready` ganha uma verificação
`storage-share:<conta>/<compartilhamento>` por compartilhamento, mais uma linha `work-share-owner`.
Coloque um arquivo em uma pasta de entrada remota e veja-o aparecer como job em até um intervalo de
polling.

## O arquivo de certificado no Azure Blob Storage (opcional)

Um host sem disco local durável também não tem onde guardar o `.pfx` ou o `.cer`. As duas origens que
apontam para um arquivo podem, em vez disso, apontar para um blob — veja
[Certificados](certificates.md#lendo-o-arquivo-de-um-blob). Duas coisas para planejar na instalação:

- A identidade precisa de **Storage Blob Data Reader** no container, e de nada mais amplo.
- **Um blob inalcançável deixa aquele perfil degradado, mas o host continua rodando.** O perfil é
  identificado no banner de inicialização, no log e no `/api/ready`, jobs roteados para ele falham com `profile.degraded`, e todos
  os outros perfis continuam assinando. Corrija o acesso e reinicie. (Até a 2.0.x, um blob inalcançável
  impedia o host de iniciar.)

## Escolhendo onde fica o banco operacional

Todas as instalações acima colocaram o **banco operacional** — jobs, o histórico deles, eventos
operacionais, a flag de pausa do pipeline, as regras de aprovação congeladas e as aprovações
registradas — em um arquivo SQLite em `Storage:Root`. Esse é o padrão, continua sendo o padrão, e uma
implantação que não configura nada o mantém.

| Escolha | Quando |
|---------|--------|
| **`Sqlite`** (padrão) | Qualquer host com disco local durável. Sem dependência externa, nada a provisionar, e adequado para uma instalação isolada da rede. |
| **`SqlServer`** | Sua política exige dados operacionais no seu próprio SGBD, sob o seu regime de backup, HA e DR — as aprovações registradas, em particular, são a evidência que um auditor pede. Ou o host **não tem disco local durável**; nesse caso, um arquivo SQLite não é um registro de verdade, e sim um registro que desaparece na próxima revisão. |

:::info Nenhum dos dois é uma decisão de vazão
O SQLite não é o teto deste pipeline — o limite é criptografia e I/O — e nada no `SqlServer` torna a
assinatura mais rápida. Isso importa porque "migramos para o SQL Server" soa como uma decisão de
escalabilidade, e leva à conclusão errada sobre instâncias: **escolher `SqlServer` não torna, por si só,
uma segunda instância suportada.** Rodar mais de uma instância é uma opção explícita (`Cluster:Enabled`),
com pré-requisitos e lista de limites próprios — o `SqlServer` é um desses pré-requisitos, e não o
único. Sem essa opção ligada, duas instâncias sobre um mesmo compartilhamento de trabalho continuam
sendo um risco documentado: veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho). Para
escalar horizontalmente de fato, comece em
[Alta disponibilidade e seus limites](high-availability.md).
:::

### O que ter pronto antes do primeiro boot

1. **O banco de dados, criado.** O Bulk Signer cria suas *tabelas*, não seu banco de dados. O probe de
   boot abre uma conexão com o banco indicado na connection string, então um banco inexistente é
   interpretado como banco inalcançável e a migração é pulada — o serviço inicia, e o `/api/ready` fica
   vermelho.
2. **Um login mapeado para um usuário nele**, em `db_datareader` + `db_datawriter` + `db_ddladmin` —
   não `db_owner`. O script `ALTER ROLE` está em
   [Configuração](configuration.md#antes-de-apontá-lo-para-o-sql-server).
3. **Conectividade de rede e um TLS que o host aceite.** O cliente SQL criptografa por padrão, então um
   servidor *on-premises* cujo certificado não seja confiável para o host recusa o login com um erro
   *certificate chain … not trusted*.

   O Azure SQL também precisa de uma regra de firewall no servidor (ou de um private endpoint / regra de
   VNet) para este host, além das portas de saída que a sua **connection policy** exige — o pré-requisito
   mais fácil de esquecer, porque a política padrão não é uma só:

   | Onde o host roda | Política padrão | Portas de saída a liberar |
   |------------------|-----------------|---------------------------|
   | **Dentro do Azure** (VM, VMSS, container app, App Service) | `Redirect` | TCP **1433** para o gateway **e TCP 11000–11999** para os endereços SQL da região. Use a service tag `Sql.<region>` em um NSG em vez de enumerar IPs. |
   | **Fora do Azure** (host *on-premises* acessando o Azure SQL) | `Proxy` | Apenas TCP **1433**. |

   Liberar somente a 1433 de dentro do Azure é suficiente para estabelecer a sessão TCP e insuficiente
   para usá-la, e é exatamente esse tipo de falha que esta lista existe para evitar.

### Por alvo — onde fica a connection string

A connection string pode conter a credencial inteira, então deve ficar onde aquele alvo já guarda
segredos — nos mesmos lugares, e pelos mesmos motivos, que a licença do PKI.

| Alvo | Onde colocar `ConnectionStrings__Default` | Opção sem senha |
|------|-------------------------------------------|-----------------|
| **systemd no Linux** | `/etc/bulksigner/bulksigner.env` (`0640`, de propriedade de `bulksigner`). Ou `appsettings.Production.json` quando não contiver senha. | Em uma VM ou VMSS do Azure: `Authentication=Active Directory Managed Identity`. Não em hosts *on-premises* — nesse caso, use um login SQL. |
| **Serviço do Windows** | Variável de ambiente de escopo de máquina, definida do mesmo jeito que a licença do PKI. | Autenticação integrada do Windows. O serviço roda como `NT SERVICE\LacunaBulkSigner`, que acessa a rede como a **conta de computador**, então o login a criar é `DOMINIO\HOSTNAME$`. Rode o serviço como uma gMSA ou um usuário de domínio para ter uma identidade por serviço. |
| **Docker / Compose** | `deploy/docker/.env`. | Somente onde o container consegue alcançar o endpoint IMDS do host (`169.254.169.254`). Diferentemente do provider do Azure Files, uma identidade **atribuída pelo usuário** também funciona aqui (`User Id=<client-id>`). |
| **Console (dev)** | `appsettings.Development.json` ou uma variável de ambiente de shell comum. | `Authentication=Active Directory Default` usa o seu próprio `az login` — prático localmente, mas não é o que você quer em produção. |

### Migrando do SQLite — arquive o arquivo antigo primeiro

Definir `Database:Provider = SqlServer` em uma instalação existente resulta em um **banco vazio**. Não
há importador nem verificação no boot para o arquivo deixado para trás: sem jobs, sem histórico, sem
eventos operacionais e **sem snapshots de aprovação e sem aprovações registradas**.

Na ordem:

1. **Drene o pipeline** — pause-o, espere a contagem de jobs em andamento chegar a zero e então pare o
   serviço. Antes disso, libere ou rejeite qualquer job retido na etapa de aprovação: ele não existe no
   novo banco, e as decisões dos aprovadores estão no arquivo que você está prestes a arquivar.
2. Copie `db/bulksigner.db` para algum lugar coberto pela sua política de retenção e mantenha um
   cliente SQLite à mão. A partir daí, ele é o seu arquivo morto, e não mais o do serviço.
3. Crie o banco de dados e o login, defina `Database:Provider` e `ConnectionStrings:Default`, inicie o
   serviço e verifique conforme descrito abaixo.

Arquivos em `input/`, `output/` e `error/` não são tocados pela migração — mas a recuperação de
inicialização reconcilia `processing/` **a partir das linhas de job**, e o novo banco não tem nenhuma.
Inspecione e limpe manualmente qualquer resíduo, comparando com o banco arquivado, antes do primeiro boot
no novo banco.

### Verificando um banco operacional no SQL Server

Confira o banner de boot, que identifica o banco operacional em **toda** implantação:

```
operational store = SQL Server (sqlsrv01/BulkSigner)
store status      = reachable
```

Em uma instalação local, o banner mostra `operational store = SQLite (data/db/bulksigner.db)` e nenhuma
das outras duas linhas — nenhum probe foi feito. Nenhuma das linhas jamais exibe a connection string.

Duas linhas exigem ação:

- **`store status = UNREACHABLE: …`** — o banco não respondeu. O host iniciou mesmo assim, de
  propósito (um banco de dados fora do ar durante uma janela de manutenção não pode transformar uma
  reinicialização em indisponibilidade), a migração foi pulada, e o `/api/ready` está vermelho.
  Corrija o banco e **reinicie**.
- **`store isolation = READ_COMMITTED_SNAPSHOT off …`** — a única configuração que faz o produto
  parecer quebrado sem falhar em nada: as leituras do dashboard ficam bloqueadas atrás das gravações do
  pipeline. O Azure SQL a habilita por padrão; o SQL Server *on-premises*, não. O Bulk Signer informa essa
  configuração e **nunca a altera** — o comando precisa de acesso exclusivo a um banco de dados que
  pertence a você. Peça a um DBA um `ALTER DATABASE` e depois reinicie.

Depois, `curl -H "X-API-Key: …" http://localhost:8080/api/ready/details` — a verificação `database`
identifica o banco que de fato foi verificado. (O `/api/ready` sozinho informa que a verificação está
verde; o nome do banco fica na rota de detalhes, protegida pela chave.)

## Login pelo Microsoft Entra ID (opcional)

Por padrão, o login do dashboard usa a chave de API, e nada aqui é necessário — uma implantação isolada
da rede nunca acessa um tenant da Microsoft. Para permitir que as pessoas entrem com as contas Microsoft
Entra ID da organização, em vez disso:

:::tip Alternativa com script
O `New-BulkSignerEntraApp.ps1` (que acompanha o pacote de implantação, veja [Exemplos](samples.md))
executa os passos 1, 2 e 4 por meio do Microsoft Graph, cria o client secret e imprime o bloco exato de
configuração do passo 5. Apenas o passo 3 permanece manual.

```bash
pwsh New-BulkSignerEntraApp.ps1 -BaseUrl https://signer.example.com
```
:::

**1. Registre a aplicação** no tenant (Entra admin center → App registrations → New):

- **Supported account types:** *Accounts in this organizational directory only* — tenant único; a
  aplicação recusa no boot os pseudo-tenants multi-tenant.
- **Redirect URI:** tipo *Web*, valor `https://<seu-host>/signin-oidc`.
- Em **Certificates & secrets**, crie um **client secret** e copie o valor imediatamente — ele é
  exibido uma única vez.

**2. Crie as duas funções de aplicativo (app roles)** (App registration → App roles → Create):

| Display name | Value (precisa coincidir exatamente) | Allowed member types | Concede |
|------------------|--------------------------------------|----------------------------|---------|
| Administrator | `Administrator` | Users/Groups | O dashboard do operador — todas as páginas e ações que o cookie da chave de API concede hoje. |
| Approver | `Approver` | Users/Groups | As telas de aprovação. Os arquivos de pagamento sobre os quais a pessoa pode decidir continuam definidos pelo pool de aprovadores congelado, associado por e-mail — a função apenas abre a porta. |

**3. Atribua as pessoas** (Enterprise application → Users and groups → Add). Uma mesma pessoa pode ter
as duas funções e, nesse caso, é de fato as duas coisas. Uma conta **sem nenhuma das funções é
recusada** pela aplicação, mesmo quando se autentica.

**4. Exija a atribuição** (Enterprise application → Properties → **Assignment required = Yes**), para que
contas não atribuídas sejam barradas já na porta da Microsoft. A aplicação exige a função de qualquer
forma — a configuração do tenant nunca pode ser a única barreira.

**5. Configure o host** — veja
[Configuração](configuration.md#authentraid--login-opcional-pelo-microsoft-entra-id):

```bash
Auth__EntraId__TenantId=<GUID do diretório (tenant) ou domínio verificado>
Auth__EntraId__ClientId=<id do aplicativo (client)>
Auth__EntraId__ClientSecret=<o segredo do passo 1>   # variável de ambiente recomendada; nunca versione
```

Reinicie. O `/login` passa a oferecer **Entrar com a Microsoft**, e o formulário de chave de API é
desativado — uma seção preenchida pela metade impede a inicialização, com uma mensagem que cita a chave
que falta. Aprovadores que correspondem a um pool pelo e-mail do diretório são levados a `/approvals`; os
links duráveis de aprovador continuam funcionando para pessoas fora do tenant.

:::warning O e-mail importa para os aprovadores
A correspondência com o pool usa a claim de e-mail do token. Para contas de convidado — aprovadores
externos convidados para o tenant —, confira se o **atributo mail** da conta contém o endereço
corporativo configurado no pool. O UPN modificado com `#EXT#` não é usado como alternativa, de
propósito.
:::

:::danger Ativar isso desconecta todo mundo
Os cookies de operador existentes deixam de atender às políticas imediatamente — não sobra um período de
oito horas de sessões criadas por um formulário de login que não existe mais. Planeje a transição
levando isso em conta. Clientes REST que usam `X-API-Key` não são afetados.
:::

## Atualizações

O schema do banco de dados é migrado automaticamente na inicialização. Primeiro, baixe a nova versão —
pelos mesmos dois canais da primeira instalação, [Obtendo o produto](#obtendo-o-produto) — e use o pacote
de implantação que veio com ela, e não a cópia usada na instalação anterior. Depois, para atualizar no
lugar:

| Alvo | Passos |
|------|--------|
| Linux | Extraia o novo [arquivo de binários](#os-binários-publicados) e então execute `sudo bash deploy/linux/install.sh --from <novo-diretório-publish>` — o script para a unit, reimplanta o binário e reinicia. |
| Windows | Extraia o novo [arquivo de binários](#os-binários-publicados) e então execute `.\deploy\windows\Install-Service.ps1 -From <novo-diretório-publish>` — o script para o serviço, espelha a árvore de binários e reinicia. |
| Docker | Atualize a tag na linha `image:` do arquivo do compose e então execute `docker compose pull && docker compose up -d`. Antes, rode o `docker login` novamente se o token de acesso tiver expirado desde a instalação. |

:::warning Sempre faça backup do banco de dados operacional antes de atualizar.

Com `Database:Provider = Sqlite`:

| Alvo | Comando de backup |
|------|-------------------|
| Linux | `sudo cp /var/lib/bulksigner/db/bulksigner.db /var/lib/bulksigner/db/bulksigner.db.bak` |
| Windows | `Copy-Item C:\ProgramData\Lacuna\BulkSigner\data\db\bulksigner.db -Dest .\bulksigner.db.bak` |
| Docker | `cp deploy/docker/data/db/bulksigner.db deploy/docker/data/db/bulksigner.db.bak` |

Com `SqlServer`, o backup fica a cargo do regime do seu SGBD — uma das duas razões pelas quais um
cliente escolhe esse provider. O `db_ddladmin` precisa estar concedido no boot que aplica a migração; um
boot com um schema já atualizado não cria nada.
:::

A varredura de recuperação na inicialização separa automaticamente qualquer job deixado em andamento
pela versão anterior — não é necessária nenhuma limpeza manual. Veja
[Operação](operations.md#recuperação-na-inicialização).

### Atualizando para a 2.0.0

Quatro mudanças podem impedir de subir uma implantação que hoje sobe normalmente, ou alterar o que um
script existente recebe. Todas são deliberadas; a primeira é a que você deve verificar *antes* de editar
qualquer coisa.

- **Uma pasta de entrada monitorada que aponta para uma raiz de trabalho agora impede o boot.** Uma
  configuração assim reprocessava e depois apagava os artefatos que ela mesma produzia, um por iteração,
  enquanto informava todo job como `Completed`. **Compare o `output/` com o que os destinatários de fato
  coletaram** antes de corrigir a configuração — veja
  [Diagnóstico de problemas](troubleshooting.md#uma-implantação-que-antes-iniciava-agora-é-recusada-citando-uma-pasta-de-entrada-monitorada).
- **A ação Limpar Jobs apaga apenas registros finalizados.** O `DELETE /api/jobs` agora retorna
  `skipped` junto com `deleted`, e um script que limpa a tabela e depois espera que ela esteja vazia
  precisa, antes, drenar ou cancelar os jobs não finalizados. Veja [Operação](operations.md#limpar-jobs). *Revertido na
  2.9.0 — veja [abaixo](#atualizando-dentro-da-2x).*
- **Um arquivo cujo caminho excede 850 caracteres é recusado no momento da entrada**, com o novo código
  de problema `job.path-too-long`, em vez de ser aceito e falhar depois.
- **O card "Vazão máxima/s" do dashboard foi removido.** O histograma
  `bulksigner_signing_duration_seconds` em `/api/metrics` não mudou e continua sendo o registro
  externo. Veja [Estatísticas de jobs](statistics.md#a-vazão-máximas-acabou).

Esta versão adiciona migrações em **ambos** os históricos de banco de dados, aplicadas no boot — de
modo que o aviso de backup acima importa mais do que o normal nesta atualização.

:::warning Vai ativar o modo cluster? Suba uma vez com ele desligado primeiro
`Cluster:Enabled = true` restringe a recuperação de inicialização aos jobs de cada instância, e uma
linha deixada em andamento por um build mais antigo **não tem dono** — então, com o modo ligado, nada
jamais vai recuperá-la. Suba uma vez com `Cluster:Enabled = false`, deixe a recuperação rodar e só então
ative o modo. É uma preocupação única, no momento da atualização. Veja
[Azure App Service](azure.md#6-primeiro-boot-em-uma-instância).
:::

### Atualizando dentro da 2.x

Toda versão 2.x pode ser atualizada in-place com os passos acima, e você pode ir de qualquer 2.x direto para a mais
recente — as migrações das versões intermediárias são aplicadas em ordem no primeiro boot. As versões
2.1.0, 2.2.0, 2.4.3, 2.5.0, 2.7.0, 2.13.0, 2.14.0 e 2.15.0 adicionam migrações; faça o backup acima antes
de qualquer uma delas. As versões abaixo também exigem alguma ação sua e estão listadas na ordem em que
você passaria por elas:

- **2.1.0 — os perfis de assinatura passam para o banco operacional.** O primeiro boot na 2.1.0 ou
  posterior importa a sua seção `Signing:Profiles[]` (ou deriva um perfil `default` do
  `Signing:Certificate`) **uma única vez**; depois disso, a seção é ignorada, o log de inicialização avisa
  isso a cada boot até você removê-la, e os perfis passam a ser criados e editados pelo dashboard. **Se
  algum perfil tiver um segredo** — uma senha de PFX, um segredo de aplicativo do Key Vault, uma
  credencial de blob —, defina `Signing__ProfileSecretsKey` antes desse boot, ou a importação será
  recusada, com uma mensagem que cita a chave; faça backup da chave junto com os seus outros segredos. Veja
  [Configuração](configuration.md#signingprofilesecretskey--a-chave-que-criptografa-os-segredos-dos-perfis-armazenados).
  Mais três mudanças chegam na mesma versão:
  - Um **bloco `Signer:` incompleto agora impede o boot** mesmo quando nenhum perfil usa o
    Lacuna Signer — complete-o ou remova-o.
  - Um **certificado que não abre não impede mais o host de iniciar**: aquele perfil fica degradado, a
    linha dele no `/api/ready` informa `ok: false` sem transformar a resposta em `503`, e os jobs dele
    falham com `profile.degraded`. Um alerta que lê só o `ready` de nível superior não percebe isso —
    leia o `checks[]`.
  - Um arquivo que um aprovador **rejeita** é devolvido ao `output/` com `.reject` no nome, e o original
    é removido da pasta monitorada. Qualquer processo que trate todo arquivo do `output/` como assinado
    agora precisa ler o nome. Se você ligou o segundo fator do aprovador definindo só o
    `ApproverSecondFactor:SeedSecret`, defina também `ApproverSecondFactor__Enabled=true` explicitamente
    — o padrão de fábrica é desligado.
- **2.2.0 — o perfil escolhe sua pasta monitorada.** O vínculo da pasta sai do
  `Storage:Inputs[].Profile` e vai para o perfil. Na atualização a partir da 2.0.x, a importação do
  primeiro boot vincula cada pasta com base nessa chave, como antes. Na atualização a partir da
  **2.1.x**, os perfis já foram importados sem vínculo, então **toda pasta monitorada sobe sem
  atribuição** e os arquivos dela ficam esperando, sem assinatura: escolha cada pasta na página do
  respectivo perfil (*Editar comportamento* → **Pasta de entrada**) logo depois da atualização.
- **2.2.1 — saia e entre de novo uma vez.** O dashboard agora leva a identidade do operador conectado
  para dentro de cada página, e uma sessão aberta durante a atualização mantém o ticket antigo até ser
  renovada. Com o Entra ID, os eventos de auditoria dos operadores passam a ser registrados com o UPN
  deles, em vez de `(anonymous)`.
- **2.3.1 — o `Auth:ApiKey` precisa ser o seu.** O `appsettings.json` distribuído não traz mais uma
  chave de exemplo, perfis de exemplo nem um bloco `Signer`, e o `Pipeline:MaxConcurrency` desse arquivo
  voltou ao padrão do produto, `1`. Uma implantação que nunca definiu `Auth__ApiKey` agora se recusa a
  iniciar, citando a chave; uma que dependia da concorrência antiga precisa definir ela mesma o
  `Pipeline__MaxConcurrency`. Um primeiro boot recusado citando perfis que você nunca declarou era esse
  defeito — use a 2.3.1 ou posterior.
- **2.4.1 — Docker: pule as imagens 2.3.2 e 2.4.0.** Essas duas imagens de container não traziam o
  script cliente do dashboard: as páginas eram renderizadas, mas nenhum controle funcionava, enquanto o
  `/api/ready` continuava verde. Faça o pull da 2.4.1 ou posterior. Instalações como serviço nunca foram
  afetadas.
- **2.4.3 — pausar e retomar no SQL Server.** Um banco operacional SQL Server criado antes desta versão
  nunca recebeu a linha que guarda a flag de pausa, então pausar retornava `pipeline.state-missing`; a
  migração acrescenta essa linha.
- **2.5.0 — reimplantações de cluster no App Service.** Um container novo agora desloca aquele que ele
  substitui, em vez de ser recusado. As atualizações continuam exigindo parada total; veja
  [Azure App Service](azure.md#8-atualizações-exigem-parada-total).
- **2.6.0 — o `/api/ready` perde o detalhe.** O probe anônimo agora traz só o nome e o veredito de cada
  verificação; um monitoramento que interpretava o `detail` deve passar a usar o `/api/ready/details` e
  enviar `X-API-Key`. O código de status não muda. Veja [Configuração](configuration.md#readiness).
- **2.7.0 — uma métrica muda de identidade.** A `bulksigner_approver_signatures_total` ganha um label
  `means` (`browser` / `cloud`), então a identidade das séries dela muda para qualquer ferramenta que a colete.
- **2.9.0 e 2.10.0 — a ação Limpar Jobs apaga tudo.** Ela agora apaga todo job, qualquer que seja o status, os
  arquivos que esses jobs deixaram e (desde a 2.10.0) todo evento operacional registrado antes da
  limpeza, gravando um evento `JobsCleared` como registro dela. A resposta perde o `skipped` e ganha
  `filesDeleted`, `foldersDeleted`, `itemsFailed` e `eventsDeleted`. Um script escrito contra o
  comportamento da 2.0.0 acima precisa mudar. Veja [Operação](operations.md#limpar-jobs).
- **2.13.0 — um nome de arquivo já processado é recusado.** Um arquivo que chega com o nome de um job
  concluído ou ainda ativo agora falha com `file.already-processed`, em vez de ser assinado de novo. Um
  sistema produtor que reutiliza o mesmo nome de arquivo fixo todo dia precisa de
  `Pipeline__RejectAlreadyProcessedFileNames=false` **antes** da atualização. Veja
  [Configuração](configuration.md#pipeline).

## Verificações rápidas de saúde

Depois de instalar em qualquer alvo:

| URL | O que ela informa |
|-----|-------------------|
| `http://localhost:8080/api/health` | Liveness — anônimo, retorna `200 OK` se o processo do host está no ar. |
| `http://localhost:8080/api/ready` | Readiness — anônimo por padrão, retorna um corpo que lista cada probe (banco operacional, cada pasta de entrada, licença, além das linhas `storage-share:` e `work-share-owner` em um compartilhamento de trabalho remoto) com o respectivo veredito, sem detalhes. `503` se algum probe que conta para o veredito falhou. |
| `http://localhost:8080/api/ready/details` | O mesmo relatório com o detalhe de cada probe. Exige a chave de API. |
| `http://localhost:8080/` | O dashboard do operador. Entre com a chave de API de `Auth:ApiKey` — ou com a Microsoft, quando o [login pelo Entra ID](#login-pelo-microsoft-entra-id-opcional) estiver configurado. |
| `http://localhost:8080/scalar/v1` | A referência OpenAPI interativa da API REST. |

O `/api/health` é sempre anônimo, para que ferramentas externas de health check não precisem de
credenciais. O `/api/ready` é anônimo por padrão pelo mesmo motivo e não traz detalhes; o
`Readiness:RequireApiKey` o protege quando quem faz o probe consegue enviar um header. O
`/api/ready/details` e o `/api/metrics` são protegidos pela chave de API — veja [Segurança](security.md).

---

**A seguir:** [Configuração](configuration.md) — o que cada chave do `appsettings.json` faz.
