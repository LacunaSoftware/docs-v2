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
carrega o identificador único da sua organização. Os scripts de instalação por alvo e o arquivo de
configuração de exemplo comentado chegam separadamente, no **pacote de implantação**. A seção
[Obtendo o produto](#obtendo-o-produto) cobre os dois, e as credenciais que cada um exige.

## Escolha seu alvo

| Onde o serviço vai rodar? | Use |
|---------------------------|-----|
| Servidor Linux | systemd — `deploy/linux/install.sh` |
| Servidor Windows | Serviço do Windows — `deploy/windows/Install-Service.ps1` |
| Qualquer host com Docker | Container — `deploy/docker/docker-compose.yml` |
| Azure, em mais de uma instância | **[Azure App Service (modo cluster)](azure.md)** — página própria |
| Apenas testando localmente | Console — execute o executável publicado em primeiro plano |

Todo alvo desta página é uma **instância única**, que é o que este produto é, a menos que você
deliberadamente ative o modo cluster. Rodar duas dessas contra um mesmo compartilhamento de trabalho
é um risco documentado, não uma implantação — veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho). A
única topologia com múltiplas instâncias que é suportada é um Azure Web App com escala horizontal em
um único App Service Plan, e ela tem seu próprio passo a passo
([Azure App Service](azure.md)) e sua própria lista de limites
([Alta disponibilidade](high-availability.md)).

## Obtendo o produto

Não há download público, e nada aqui é construído a partir do código-fonte. A Lacuna Software distribui
a aplicação de duas formas, e o alvo que você acabou de escolher decide qual delas você leva:

| O que você baixa | De onde | Para quais alvos |
|------------------|---------|------------------|
| A **imagem de container**, já construída | Do repositório privado de imagens Docker da Lacuna, como `<registry-da-lacuna>/bulksigner:<versão>` | Docker / Compose, [Azure App Service](azure.md) |
| Os **binários publicados**, um arquivo por sistema operacional | De uma URL de download que carrega o identificador único da sua organização | systemd no Linux, Serviço do Windows, console |

Nenhum dos dois artefatos traz os scripts de instalação. Eles vêm no **pacote de implantação** — um
único arquivo, o mesmo em todo sistema operacional, contendo a árvore `deploy/`, o
`appsettings.Production.json.sample` comentado e os scripts auxiliares em PowerShell documentados em
[Exemplos](samples.md). Descompacte-o na máquina de onde você vai instalar: todo caminho `deploy/…`
desta página é relativo à raiz dele.

A Lacuna lhe entrega três coisas, e elas não são intercambiáveis:

| O que você recebe | O que destrava | Se vazar ou expirar |
|-------------------|----------------|---------------------|
| **Credenciais de registry** — um usuário e um token de acesso | O pull da imagem do repositório privado | Peça a reemissão à Lacuna. O token tem o escopo da sua organização e é revogável por si só. |
| **Um identificador único** | As URLs de download dos binários | Peça a reemissão à Lacuna. Ele identifica a sua organização, e não uma versão — um mesmo identificador serve a todos os sistemas operacionais. |
| **A string de licença do PKI SDK** | O serviço **em execução**, em todo alvo — não o download | Não é uma credencial de distribuição; veja [Obtendo a licença do PKI SDK](#obtendo-a-licença-do-pki-sdk). |

:::warning O identificador em uma URL de download é uma credencial
Ele é a única coisa entre aquela URL e qualquer um que a tenha, então uma URL que o carrega não tem lugar
em um ticket público, em um log de CI compartilhado, em uma página de wiki ou em um script versionado.
Guarde-o onde você guarda o token do registry — e, se ele escapar, peça a reemissão à Lacuna em vez de
contar com a obscuridade do link.
:::

### A imagem de container

```bash
docker login <registry-da-lacuna> --username <usuário-do-registry>   # pede o token de acesso
docker pull <registry-da-lacuna>/bulksigner:<versão>
```

A Lacuna fornece o host do registry, o caminho do repositório e as credenciais em conjunto. O repositório
é privado, então um pull sem autenticação responde `not found` em vez de `unauthorized` — essa é a
resposta habitual do Docker para um repositório que suas credenciais não conseguem ver, e não um sinal de
que você digitou o nome errado.

**Fixe a `<versão>`.** Uma tag `latest` se move, e em um host de containers isso significa que um restart
pode subir uma versão que você não escolheu instalar.

Nada é construído localmente: a imagem que a Lacuna publica é a imagem que roda, baseada em Debian-slim
pelo motivo que está em [Docker / Compose](#docker--compose) abaixo.

### Os binários publicados

Pegue o arquivo correspondente ao sistema operacional do host e extraia-o onde o script de instalação
consiga lê-lo:

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
`--from publish` / `-From publish` — o arquivo compactado não se importa, e a flag aceita qualquer
caminho. Peça à Lacuna se você precisa de um sistema operacional ou de uma arquitetura que aquelas duas
URLs não cobrem.

### Um host sem rota para a internet

Nenhum dos dois artefatos precisa de uma no momento da instalação: os dois são completos, sem feed de
pacotes, sem etapa de restore e sem uma segunda ligação para casa — de modo que baixar em uma estação
conectada e copiar para o host é uma resposta completa. Leve os binários como o arquivo compactado; leve a
imagem com `docker save` / `docker load`, ou publique-a em um registry que o host alcance, que é o que o
[passo 1](azure.md#1-importe-a-imagem) do passo a passo do Azure faz, por outro motivo. A licença do PKI
SDK é uma string, e não um download, então uma instalação isolada da rede continua isolada.

### Depois, confira o que você obteve

A versão que está de fato rodando aparece na barra de aplicativo do dashboard em todas as páginas, é
impressa por inteiro sob o banner de console com a marca a cada início, e está na página Sistema. Uma vez
concluída a instalação abaixo, leia-a contra a versão que lhe disseram para instalar — é a única
confirmação de que a URL, ou a tag, entregou o que você esperava.

## Pré-requisitos — comuns a todos os alvos

1. **String de licença do Lacuna PKI SDK** (base64), fornecida pela Lacuna Software. Obrigatória na
   inicialização; sem ela, o serviço se recusa a subir. Veja
   [Obtendo a licença do PKI SDK](#obtendo-a-licença-do-pki-sdk).
2. **Uma origem de certificado de assinatura.** Escolha uma:
   - **PFX** — um arquivo `.pfx` / `.p12` mais a senha que o destrava.
   - **PKCS#11** — um driver do fabricante (`.so` no Linux, `.dll` no Windows), mais o thumbprint
     SHA-1 do certificado de assinatura no token, mais o PIN fornecido por variável de ambiente.
   - **Repositório de certificados do Windows** — apenas em alvos Windows, mais o thumbprint SHA-1.

   Veja [Certificados](certificates.md) para os detalhes.
3. **Decisão sobre criptografia.** Deixe desabilitada (padrão) ou habilite o BSENC v1. Se habilitar a
   criptografia, decida onde a senha e o salt vão viver antes do primeiro boot. Veja
   [Criptografia](encryption.md).
4. **Terminação TLS.** O serviço escuta em HTTP puro por padrão. A implantação recomendada termina o
   TLS em um proxy reverso (nginx, IIS, Traefik). A flag `Hosting:RequireHttps` (padrão `false`)
   controla o redirecionamento HTTPS em processo — defina-a como `true` apenas se você tiver
   configurado um certificado no Kestrel.
5. **Pastas de entrada monitoradas.** Decida se você precisa de uma pasta de entrada (padrão) ou de
   várias. Com uma única pasta, omita `Storage:Inputs[]` por completo — o serviço cria uma chamada
   `default` em `{Root}/input`. Para múltiplas pastas, preencha `Storage:Inputs[]` com uma entrada
   por pasta; veja [Configuração](configuration.md#storage).

Toda instalação semeia uma configuração de produção editável a partir do
`appsettings.Production.json.sample` fornecido. O exemplo vem anotado com marcadores `REQUIRED` e
`SECRET`; revise-o antes do primeiro start.

## Obtendo a licença do PKI SDK

A licença é uma string base64 fornecida pela Lacuna Software. Há duas formas de carregá-la:

| Onde | Como |
|------|------|
| Variável de ambiente (preferido) | Defina `Signing__PkiSdkLicense=<licença-base64>` |
| Arquivo de configuração | Defina `Signing:PkiSdkLicense` em `appsettings.Production.json` |

A variável de ambiente tem precedência no boot. Os scripts de instalação leem a variável de ambiente
do arquivo específico de cada alvo (`/etc/bulksigner/bulksigner.env` no Linux, variáveis de ambiente
de escopo de máquina no Windows, `.env` no Docker), de modo que a licença nunca acaba em um arquivo
versionado. Veja [Segurança](security.md) para a história completa de tratamento de segredos.

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

A unit do systemd usa `Type=notify`, de modo que `systemctl status` relata `active (running)` apenas
depois que todo o bootstrap (carga da licença + migração do banco + recuperação do pipeline) tiver
sucesso. Flags de hardening (`NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`) vêm ativadas por
padrão.

**Desinstalação:**

```bash
sudo bash deploy/linux/uninstall.sh          # para + remove a unit, preserva os dados
sudo bash deploy/linux/uninstall.sh --purge  # também apaga dados, logs, configuração e o usuário de sistema
```

## Windows — Serviço do Windows

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

O serviço roda sob uma **conta virtual** (`NT SERVICE\LacunaBulkSigner`) — sem senha de operador para
gerenciar, sem conta de domínio para dar permissão. O script de instalação concede a essa conta acesso
à árvore em `ProgramData` e configura a recuperação em caso de falha (reiniciar após 5 s na primeira e
na segunda falha, 30 s na terceira).

:::note
Os logs de nível de aplicação passam apenas pelo destino de arquivo. O log de eventos de Aplicativo do
Windows carrega entradas de ciclo de vida do serviço (start / stop / falha) — não as linhas de log de
cada job. Procure essas no arquivo de log.
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

A linha `image:` do arquivo do compose é onde vivem o repositório privado e sua tag fixada, então é a
linha que você edita no momento da atualização. Um pull que falha se parece com um container que nunca
inicia e um log de aplicação vazio — porque ainda não há aplicação — então confira o `docker login` antes
de tirar conclusões do silêncio.

A Lacuna constrói a imagem sobre Debian-slim — **não** sobre Alpine. Bibliotecas `.so` de HSM geralmente não são
compatíveis com musl, então o Alpine está fora de questão. A imagem já traz ferramental PKCS#11
genérico (`libpcsclite1` + `opensc`); drivers de HSM dos fabricantes (SafeNet, Thales, Entrust,
Yubico) são montados pelo operador em tempo de execução via `volumes:` no arquivo do compose. Veja os
exemplos comentados em `deploy/docker/docker-compose.yml`.

Um `HEALTHCHECK` consulta `/api/health` a cada 30 segundos, de modo que `docker ps` e orquestradores
enxergam o status `(healthy)` / `(unhealthy)` corretamente.

Bind mounts e caminhos no host:

| Caminho no container | Caminho no host | Finalidade |
|----------------------|-----------------|------------|
| `/app/appsettings.Production.json` | `./config/appsettings.Production.json` (somente leitura) | Configuração editada pelo operador |
| `/var/lib/bulksigner` | `./data` | Árvore de dados operacionais (input / processing / output / db) |
| `/var/log/bulksigner` | `./logs` | Arquivos de log duráveis |

## Console em primeiro plano (pontual / teste)

Execute o executável publicado diretamente para iniciar o serviço em primeiro plano — útil para um
teste local rápido ou para ver erros de bootstrap imediatamente:

```bash
# Linux
./publish/Lacuna.BulkSigner

# Windows
.\publish\Lacuna.BulkSigner.exe
```

- A árvore `data/` é criada relativa ao diretório de trabalho.
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
| **Qual compartilhamento abriga as raízes de trabalho** | Um compartilhamento, não vários: promover um artefato verificado e realocar a cópia em stage de um job que falhou são *renames*, e o rename do Azure não atravessa compartilhamentos nem contas. Acrescente um prefixo `Directory` se várias implantações dividirem um mesmo compartilhamento. |
| **Onde ficam as pastas de entrada** | Independente do item acima e definido por pasta — a passagem de uma pasta de entrada para o stage é uma *cópia*, e uma cópia pode atravessar qualquer coisa. Uma pasta pode continuar local enquanto o compartilhamento de trabalho é remoto, ou ler o compartilhamento de um cliente na conta dele. |
| **A credencial** | `ManagedIdentity` (atribuída pelo sistema, sem segredo) onde o host roda no Azure; `ServicePrincipal` *on premises*; `AccountKey` apenas onde o host não consegue alcançar o tenant de forma alguma. Veja [Segurança](security.md#credenciais-de-armazenamento-do-azure-files). |
| **O intervalo de sondagem por pasta remota** | O Azure Files não publica notificações de mudança, então uma pasta remota é **enumerada por temporizador**. Uma pasta que não resolve para nenhum intervalo é recusada no boot. |

Os requisitos do host são os mesmos em todos os alvos: HTTPS de saída para
`https://<conta>.file.core.windows.net` e — para `ManagedIdentity` — um endpoint IMDS alcançável, o
que no alvo Docker significa que o container consegue alcançar `169.254.169.254`.

:::warning `logs/` e o banco SQLite nunca podem ir para um compartilhamento
`Logging:File:Path` é sempre um caminho local, e a inicialização **recusa** uma configuração que o
mova: o destino de arquivo alcança o sistema de arquivos por sua própria API e não pode receber um
compartilhamento. Sob `Database:Provider = Sqlite`, `ConnectionStrings:Default` é recusada em um
compartilhamento pelo motivo de que um arquivo de banco de dados acessado por SMB é a forma
documentada de corrompê-lo. Sob `SqlServer`, o diretório `db/` simplesmente não é usado.
:::

**O que muda operacionalmente.** A entrada de arquivos deixa de ser orientada a eventos e passa a ser
por temporizador (cerca de meio minuto nos padrões, no pior caso), inspecionar `error/` e
`processing/` passa a exigir um cliente de armazenamento em vez de uma sessão SSH, e o
compartilhamento é marcado no boot, de modo que uma segunda instância fica visível. Os três pontos
estão cobertos em
[Operação](operations.md#o-que-muda-no-dia-a-dia-em-um-compartilhamento).

**Verificação.** O banner de boot ganha as linhas `work share`, `azure credential`,
`input providers` e `azure shares = N reachable`; o `/api/ready` ganha uma verificação
`storage-share:<conta>/<compartilhamento>` por compartilhamento, mais uma linha `work-share-owner`.
Solte um arquivo em uma pasta de entrada remota e veja-o aparecer como job dentro de um intervalo de
sondagem.

## O arquivo de certificado no Azure Blob Storage (opcional)

Um host sem disco local durável também não tem onde guardar o `.pfx` ou o `.cer`. Ambas as origens que
nomeiam um arquivo podem, em vez disso, nomear um blob — veja
[Certificados](certificates.md#lendo-o-arquivo-de-um-blob). Duas coisas a planejar no momento da
instalação:

- A identidade precisa de **Storage Blob Data Reader** no container, e de nada mais amplo.
- **Um blob inalcançável impede o host de iniciar**, diferentemente de um compartilhamento de trabalho
  ou de uma base operacional inalcançáveis. Um perfil sem material de assinatura não consegue assinar
  de jeito nenhum, então não há estado degradado útil.

## Escolhendo onde a base operacional vive

Todas as instalações acima colocaram a **base operacional** — jobs, seu histórico, eventos
operacionais, a flag de pausa do pipeline, as regras de aprovação congeladas e as aprovações
registradas — em um arquivo SQLite sob `Storage:Root`. Esse é o padrão, continua sendo o padrão, e uma
implantação que não diz nada o mantém.

| Escolha | Quando |
|---------|--------|
| **`Sqlite`** (padrão) | Qualquer coisa com disco local durável. Sem dependência externa, nada a provisionar, e correto para uma instalação isolada da rede. |
| **`SqlServer`** | Sua política coloca dados operacionais no seu próprio SGBD, sob seu próprio regime de backup, HA e DR — as aprovações registradas, em particular, são a evidência que um auditor pede. Ou o host **não tem disco local durável**, caso em que um arquivo SQLite não é um registro, e sim um registro que desaparece na próxima revisão. |

:::info Nenhum dos dois é uma decisão de vazão
O SQLite não é o teto deste pipeline — o limite é criptografia e I/O — e nada no `SqlServer` torna a
assinatura mais rápida. Isso importa porque "migramos para SQL Server" soa como uma história de escala,
e isso leva à inferência errada sobre instâncias: **escolher `SqlServer` não torna, por si só, uma
segunda instância suportada.** Rodar mais de uma é uma opção explícita (`Cluster:Enabled`) com seus
próprios pré-requisitos e sua própria lista de limites — o `SqlServer` é um desses pré-requisitos, e
não o todo. Fora dessa chave, duas instâncias sobre um mesmo compartilhamento de trabalho continuam
sendo um risco documentado: veja
[Operação](operations.md#quando-outra-instância-parece-ser-dona-do-compartilhamento-de-trabalho). Para
de fato escalar horizontalmente, comece em
[Alta disponibilidade e seus limites](high-availability.md).
:::

### O que ter pronto antes do primeiro boot

1. **O banco de dados, criado.** O Bulk Signer cria suas *tabelas*, não seu banco de dados. A sondagem
   de boot abre uma conexão com o banco que a connection string nomeia, então um banco ausente é lido
   como base inalcançável e a migração é pulada — o serviço inicia, e o `/api/ready` fica vermelho.
2. **Um login mapeado para um usuário nele**, em `db_datareader` + `db_datawriter` + `db_ddladmin` —
   não `db_owner`. O script `ALTER ROLE` está em
   [Configuração](configuration.md#antes-de-apontá-lo-para-o-sql-server).
3. **Alcance de rede e um TLS que o host aceite.** O cliente SQL criptografa por padrão, então um
   servidor *on premises* cujo certificado o host não confia recusa o login com um erro
   *certificate chain … not trusted*.

   O Azure SQL adicionalmente precisa de uma regra de firewall no servidor (ou um private endpoint /
   regra de VNet) para este host, mais as portas de saída que sua **connection policy** implica — o
   pré-requisito mais facilmente esquecido, porque a política padrão não é uma coisa só:

   | Onde o host roda | Política padrão | Portas de saída a liberar |
   |------------------|-----------------|---------------------------|
   | **Dentro do Azure** (VM, VMSS, container app, App Service) | `Redirect` | TCP **1433** para o gateway **e TCP 11000–11999** para os endereços SQL da região. Use a service tag `Sql.<region>` em um NSG em vez de enumerar IPs. |
   | **Fora do Azure** (host *on premises* alcançando o Azure SQL) | `Proxy` | Apenas TCP **1433**. |

   Liberar somente a 1433 de dentro do Azure é suficiente para estabelecer a sessão TCP e insuficiente
   para usá-la, que é exatamente o formato de falha que esta lista existe para evitar.

### Por alvo — onde a connection string vive

A connection string pode ser a totalidade da credencial, então ela pertence a onde aquele alvo já
guarda segredos — os mesmos lugares, e pelos mesmos motivos, que a licença do PKI.

| Alvo | Onde colocar `ConnectionStrings__Default` | Opção sem senha |
|------|-------------------------------------------|-----------------|
| **systemd no Linux** | `/etc/bulksigner/bulksigner.env` (`0640`, de propriedade de `bulksigner`). Ou `appsettings.Production.json` quando não carregar senha. | Em uma VM ou VMSS do Azure: `Authentication=Active Directory Managed Identity`. Não *on premises* — use um login SQL lá. |
| **Serviço do Windows** | Variável de ambiente de escopo de máquina, definida do mesmo jeito que a licença do PKI. | Autenticação integrada do Windows. O serviço roda como `NT SERVICE\LacunaBulkSigner`, que alcança a rede como a **conta de computador**, então o login a criar é `DOMINIO\HOSTNAME$`. Rode o serviço como uma gMSA ou um usuário de domínio para ter uma identidade por serviço. |
| **Docker / Compose** | `deploy/docker/.env`. | Somente onde o container consegue alcançar o endpoint IMDS do host (`169.254.169.254`). Diferentemente do provider do Azure Files, uma identidade **atribuída pelo usuário** também funciona aqui (`User Id=<client-id>`). |
| **Console (dev)** | `appsettings.Development.json` ou uma variável de ambiente de shell comum. | `Authentication=Active Directory Default` aproveita seu próprio `az login` — conveniente localmente, e não é o que você quer em produção. |

### Migrando do SQLite — arquive o arquivo antigo primeiro

Definir `Database:Provider = SqlServer` em uma instalação existente esbarra em uma **base vazia**. Não
há importador nem verificação no boot para o arquivo deixado para trás: sem jobs, sem histórico, sem
eventos operacionais e **sem snapshots de aprovação e sem aprovações registradas**.

Na ordem:

1. **Drene o pipeline** — pause-o, deixe a contagem em andamento chegar a zero, então pare o serviço.
   Libere ou rejeite antes qualquer job retido na etapa de aprovação: na nova base ele não existe, e as
   decisões de seus aprovadores estão no arquivo que você está prestes a arquivar.
2. Copie `db/bulksigner.db` para algum lugar coberto pela sua política de retenção, e mantenha um
   cliente SQLite à mão. Daí em diante ele é o seu arquivo morto, não o do serviço.
3. Crie o banco de dados e o login, defina `Database:Provider` e `ConnectionStrings:Default`, inicie o
   serviço e verifique conforme abaixo.

Arquivos em `input/`, `output/` e `error/` não são tocados pela migração — mas a recuperação de
inicialização reconcilia `processing/` **a partir das linhas de job**, e a nova base não tem nenhuma.
Inspecione e limpe qualquer resíduo à mão, contra o banco arquivado, antes do primeiro boot na nova
base.

### Verificando uma base em SQL Server

Confira o banner de boot, que nomeia a base em **toda** implantação:

```
operational store = SQL Server (sqlsrv01/BulkSigner)
store status      = reachable
```

Uma instalação local lê `operational store = SQLite (data/db/bulksigner.db)` e não recebe nenhuma das
outras duas linhas — nada foi sondado. Nenhuma das linhas jamais carrega a connection string.

Duas linhas são as que exigem ação:

- **`store status = UNREACHABLE: …`** — a base não respondeu. O host iniciou mesmo assim, de
  propósito (um banco de dados fora do ar durante uma janela de manutenção não pode transformar uma
  reinicialização em indisponibilidade), a migração foi pulada, e o `/api/ready` está vermelho.
  Conserte a base e **reinicie**.
- **`store isolation = READ_COMMITTED_SNAPSHOT off …`** — a única configuração que faz o produto
  parecer quebrado sem falhar em nada: as leituras do dashboard vão travar atrás das escritas do
  pipeline. O Azure SQL a habilita por padrão, o SQL Server *on premises* não. O Bulk Signer a reporta
  e **nunca a altera** — o comando precisa de acesso exclusivo a um banco de dados que é seu. Um
  `ALTER DATABASE` por um DBA, e então reinicie.

Depois, `curl http://localhost:8080/api/ready` — sua verificação `database` nomeia a base que de fato
foi verificada.

## Login pelo Microsoft Entra ID (opcional)

Por padrão o login do dashboard é a chave de API, e nada aqui é necessário — uma implantação isolada da
rede nunca toca um tenant da Microsoft. Para deixar as pessoas entrarem com as contas Microsoft Entra
ID da organização:

:::tip Alternativa por script
O `New-BulkSignerEntraApp.ps1` (que acompanha o pacote de implantação, veja [Exemplos](samples.md))
executa os passos 1, 2 e 4 através do Microsoft Graph, cria o client secret e imprime o bloco exato de
configuração do passo 5. Apenas o passo 3 permanece manual.

```bash
pwsh New-BulkSignerEntraApp.ps1 -BaseUrl https://signer.example.com
```
:::

**1. Registre a aplicação** no tenant (centro de administração do Entra → Registros de aplicativo →
Novo):

- **Tipos de conta suportados:** *Contas somente neste diretório organizacional* — tenant único; a
  aplicação recusa os pseudo-tenants multi-tenant no boot.
- **URI de redirecionamento:** tipo *Web*, valor `https://<seu-host>/signin-oidc`.
- Em **Certificados e segredos**, crie um **client secret** e copie seu valor imediatamente — ele é
  exibido apenas uma vez.

**2. Crie as duas app roles** (Registro de aplicativo → Funções de aplicativo → Criar):

| Nome de exibição | Valor (precisa coincidir exatamente) | Tipos de membro permitidos | Concede |
|------------------|--------------------------------------|----------------------------|---------|
| Administrator | `Administrator` | Usuários/Grupos | O dashboard do operador — todas as páginas e ações que o cookie da chave de API concede hoje. |
| Approver | `Approver` | Usuários/Grupos | As telas de aprovação. Sobre quais arquivos de pagamento a pessoa pode decidir continua governado pelo pool de aprovadores congelado, casado por e-mail — a role apenas abre a porta. |

**3. Atribua as pessoas** (Aplicativo empresarial → Usuários e grupos → Adicionar). Uma mesma pessoa
pode ter as duas roles e é genuinamente as duas. Uma conta **sem nenhuma das roles é recusada** pela
aplicação mesmo quando se autentica.

**4. Exija a atribuição** (Aplicativo empresarial → Propriedades → **Atribuição necessária = Sim**),
para que contas não atribuídas falhem já na porta da Microsoft. A aplicação impõe a presença da role de
qualquer forma — a configuração do tenant sozinha nunca pode ser a única barreira.

**5. Configure o host** — veja
[Configuração](configuration.md#authentraid--login-opcional-pelo-microsoft-entra-id):

```bash
Auth__EntraId__TenantId=<GUID do diretório (tenant) ou domínio verificado>
Auth__EntraId__ClientId=<id do aplicativo (client)>
Auth__EntraId__ClientSecret=<o segredo do passo 1>   # variável de ambiente recomendada; nunca versione
```

Reinicie. O `/login` agora oferece **Entrar com a Microsoft**, e o formulário de chave de API fica
desligado — uma seção preenchida pela metade se recusa a subir, nomeando a chave que falta. Aprovadores
que casam com um pool pelo e-mail do diretório caem em `/approvals`; os links duráveis de aprovador
continuam funcionando para pessoas fora do tenant.

:::warning O e-mail importa para os aprovadores
O casamento com o pool se dá pela claim de e-mail do token. Para contas de convidado — aprovadores
externos convidados para o tenant — certifique-se de que o **atributo mail** da conta carrega o
endereço corporativo configurado no pool. O UPN adulterado com `#EXT#` deliberadamente não é usado como
alternativa.
:::

:::danger Ativar isso desconecta todo mundo
Os cookies de operador existentes deixam de satisfazer as políticas imediatamente — não há um rastro de
oito horas de sessões criadas por um formulário de login que não existe mais. Planeje a virada de
acordo. Clientes REST que usam `X-API-Key` não são afetados.
:::

## Atualizações

O schema do banco de dados migra automaticamente na inicialização. Baixe antes a nova versão — pelos
mesmos dois canais da primeira instalação, [Obtendo o produto](#obtendo-o-produto) — e use o pacote de
implantação que veio com ela, em vez da cópia de onde você instalou a última vez. Então, para atualizar no
lugar:

| Alvo | Passos |
|------|--------|
| Linux | Extraia o novo [arquivo de binários](#os-binários-publicados), então `sudo bash deploy/linux/install.sh --from <novo-diretório-publish>` — para a unit, reimplanta o binário, reinicia. |
| Windows | Extraia o novo [arquivo de binários](#os-binários-publicados), então `.\deploy\windows\Install-Service.ps1 -From <novo-diretório-publish>` — para o serviço, espelha a árvore de binários, reinicia. |
| Docker | Ajuste a tag na linha `image:` do arquivo do compose, então `docker compose pull && docker compose up -d`. Rode o `docker login` novamente antes, se o token de acesso expirou desde a instalação. |

:::warning Sempre faça backup do banco de dados operacional antes de atualizar.

Sob `Database:Provider = Sqlite`:

| Alvo | Comando de backup |
|------|-------------------|
| Linux | `sudo cp /var/lib/bulksigner/db/bulksigner.db /var/lib/bulksigner/db/bulksigner.db.bak` |
| Windows | `Copy-Item C:\ProgramData\Lacuna\BulkSigner\data\db\bulksigner.db -Dest .\bulksigner.db.bak` |
| Docker | `cp deploy/docker/data/db/bulksigner.db deploy/docker/data/db/bulksigner.db.bak` |

Sob `SqlServer`, o backup é assunto do regime do seu SGBD — que é uma das duas razões pelas quais um
cliente escolhe esse provider. O `db_ddladmin` precisa estar no lugar para o boot que aplica a
migração; um boot contra um schema que já está atualizado não cria nada.
:::

A varredura de recuperação na inicialização move para o lado, automaticamente, qualquer job deixado em
andamento pela versão anterior — nenhuma limpeza manual é necessária. Veja
[Operação](operations.md#recuperação-na-inicialização).

### Atualizando para a 2.0.0

Quatro mudanças podem parar uma implantação que sobe hoje, ou alterar o que um script existente
enxerga. Cada uma é deliberada; a primeira é a que se deve checar *antes* de editar qualquer coisa.

- **Uma pasta de entrada monitorada apontada para uma raiz de trabalho agora recusa o boot.** Uma
  configuração assim estava reingerindo e depois apagando os artefatos que ela mesma produzia, um por
  iteração, enquanto reportava todo job como `Completed`. **Confira o `output/` contra o que os
  destinatários de fato coletaram** antes de corrigir a configuração — veja
  [Diagnóstico de problemas](troubleshooting.md#uma-implantação-que-antes-subia-agora-recusa-nomeando-uma-pasta-de-entrada-monitorada).
- **O Clear Jobs apaga apenas registros finalizados.** O `DELETE /api/jobs` agora reporta `skipped` ao
  lado de `deleted`, e um script que limpa a tabela e depois espera que ela esteja vazia precisa antes
  drenar ou cancelar os jobs não finalizados. Veja [Operação](operations.md#clear-jobs).
- **Um arquivo cujo caminho excede 850 caracteres é recusado no momento da entrada**, com o novo código
  de problema `job.path-too-long`, em vez de ser aceito e falhar depois.
- **O card "Vazão máxima/s" do dashboard foi aposentado.** O histograma
  `bulksigner_signing_duration_seconds` em `/api/metrics` não mudou e continua sendo o registro
  externo. Veja [Estatísticas de jobs](statistics.md#a-vazão-máximas-acabou).

Esta versão adiciona migrações em **ambos** os históricos de banco de dados, aplicadas no boot — de
modo que o aviso de backup acima importa mais do que o normal nesta atualização.

:::warning Vai ativar o modo cluster? Suba uma vez com ele desligado primeiro
`Cluster:Enabled = true` filtra a recuperação de inicialização para os jobs de cada instância, e uma
linha deixada em andamento por uma build mais antiga não carrega **nenhum dono** — então nada sob a
chave jamais vai varrê-la. Suba uma vez com `Cluster:Enabled = false`, deixe a recuperação rodar, e só
então ative o modo. É uma preocupação única, no momento da atualização. Veja
[Azure App Service](azure.md#6-primeiro-boot-em-uma-instância).
:::

## Verificações rápidas de saúde

Depois de instalar em qualquer alvo:

| URL | O que ela informa |
|-----|-------------------|
| `http://localhost:8080/api/health` | Liveness — anônimo, retorna `200 OK` se o processo do host está no ar. |
| `http://localhost:8080/api/ready` | Readiness — anônimo, retorna um corpo listando cada sondagem (base operacional, cada pasta de entrada, licença, mais as linhas `storage-share:` e `work-share-owner` em um compartilhamento de trabalho remoto). `503` se qualquer sondagem falhou. |
| `http://localhost:8080/` | O dashboard do operador. Entre com a chave de API de `Auth:ApiKey` — ou com a Microsoft, quando o [login pelo Entra ID](#login-pelo-microsoft-entra-id-opcional) estiver configurado. |
| `http://localhost:8080/scalar/v1` | A UI de referência OpenAPI ao vivo para a superfície REST. |

O `/api/health` é sempre anônimo, para que verificadores de saúde externos não precisem de
credenciais. O `/api/ready` também é anônimo e retorna um corpo estruturado. O `/api/metrics` é
protegido por chave de API por padrão — veja [Segurança](security.md).

---

**A seguir:** [Configuração](configuration.md) — o que cada chave do `appsettings.json` faz.
