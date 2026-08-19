---
sidebar_label: "Segurança"
sidebar_position: 5
---

# Segurança

O modelo de segurança do Lacuna Bulk Signer voltado ao operador — como os segredos são armazenados,
como a autenticação funciona, e o que o serviço faz para evitar divulgação acidental.

## O modelo de ameaças em um parágrafo

O Bulk Signer é um serviço *on premises* que detém quatro classes de segredo: a **licença do PKI SDK**,
**material de certificado, PINs e credenciais de nuvem**, a **senha de criptografia** (quando a
criptografia está habilitada) e a **chave de API**. Ele expõe uma API REST e um dashboard web, ambos
atrás daquela única chave de API, com uma sessão em cookie para operadores. Não há atualização
automática. O modelo de ameaças assume que o serviço roda em um host confiável dentro de uma rede
confiável, com o TLS terminado em um proxy reverso.

Uma implantação que habilita a [etapa de aprovação](approvals.md) adicionalmente detém **dados pessoais
sobre seus próprios aprovadores** (nome, e-mail, CPF) e, enquanto um job de pagamento está em
andamento, sobre cada beneficiário do arquivo.

Uma instalação padrão não faz **nenhuma conexão de saída**. Toda funcionalidade opcional que muda isso
vem desligada a menos que você a habilite:

| Funcionalidade | Dependência de saída |
|----------------|----------------------|
| `Signing:Certificate:Source = AzureKeyVault` | `*.vault.azure.net` + `login.microsoftonline.com` — uma chamada de assinatura por assinatura. Veja [Certificados](certificates.md#origem--azurekeyvault). |
| `Signing:Certificate:…:Blob` | `*.blob.core.windows.net` — uma leitura no boot. Veja [Certificados](certificates.md#lendo-o-arquivo-de-um-blob). |
| `Signing:Profiles[].Method = LacunaSigner` | Seu tenant do Lacuna Signer. Veja [Integração com o Lacuna Signer](lacuna-signer.md). |
| `Storage:Provider = AzureFiles` | `*.file.core.windows.net` — cada staging, promoção e realocação. |
| `Database:Provider = SqlServer` | Sua instância de SQL Server ou Azure SQL. |
| `Auth:EntraId` | `login.microsoftonline.com` — somente para o login interativo. |
| `Telemetry:Enabled = true` | Azure Application Insights. Veja [Telemetria](telemetry.md). |

## Autenticação

Dois esquemas de autenticação compartilham uma política de autorização:

- **Cabeçalho `X-API-Key`.** Clientes programáticos enviam a `Auth:ApiKey` configurada no cabeçalho
  nomeado por `Auth:ApiKeyHeader` (padrão `X-API-Key`). O handler compara valores em tempo constante,
  para evitar oráculos de temporização.
- **Cookie.** Operadores colam a mesma chave de API em `/login`; o endpoint de login a troca por um
  cookie (`Auth:CookieName`, padrão `lbs-auth`) com `SameSite=Strict` + `HttpOnly`. As requisições
  subsequentes do dashboard carregam o cookie.

Ambos os esquemas sustentam a mesma política de autorização em todo endpoint protegido. `/api/health`,
`/api/ready`, `/login`, `/api/auth/login`, `/api/auth/logout` e `/api/culture` são anônimos, mais as
superfícies de aprovação descritas [abaixo](#a-página-de-aprovação-por-job-não-é-autenticada).

### Modo de login pelo Microsoft Entra ID (opcional)

Quando o [`Auth:EntraId`](configuration.md#authentraid--login-opcional-pelo-microsoft-entra-id) está
configurado, a história do navegador muda e a da automação não:

- **O login legado por chave de API fica desligado, não relegado a segundo plano.** O `/login` renderiza
  o login da Microsoft; um POST feito à mão em `/api/auth/login` é recusado mesmo com uma chave correta;
  e a política de operador deixa de aceitar sessões com cookie legado, de modo que ligar o modo
  **aposenta toda sessão de navegador criada por chave de API de uma vez**, em vez de deixar um rastro
  de oito horas. Planeje a virada como um "desconectar todo mundo". O `X-API-Key` para chamadores REST
  não é tocado — automação não consegue fazer um login interativo.
- **O acesso é decidido por app roles, somente pela claim de roles.** `Administrator` é o operador;
  `Approver` abre as superfícies de aprovação, onde o pool congelado continua delimitando quais jobs a
  pessoa vê. Uma conta autenticada sem role — e um Approver cuja conta não carrega claim de e-mail, já
  que os pools vinculam por e-mail — é recusada em `/access-denied`. **Sem mapeamento por grupo de
  segurança:** uma edição de grupo no tenant nunca pode ser uma mudança de autorização invisível.
- **Uma sessão pode carregar as duas roles**, e a segregação de funções é sustentada pelas verificações
  de role: uma sessão só de Administrator não satisfaz política de aprovador nenhuma, e vice-versa.
- **As sessões são cookies deslizantes de 8 horas em seu próprio esquema** (`SameSite=Lax`, porque o
  login retorna por um redirecionamento entre sites vindo do tenant; `HttpOnly`). Sair é apenas local —
  limpa a sessão do Bulk Signer e deliberadamente não encerra a sessão Microsoft da pessoa, de modo que
  um novo login imediato funciona silenciosamente. Isso é comportamento normal de SSO, não um defeito.
- **Endurecimento recomendado no tenant:** defina **Atribuição necessária** na aplicação empresarial,
  para que contas não atribuídas falhem já na porta da Microsoft. A aplicação impõe a presença da role
  de qualquer forma — depender apenas da configuração do tenant transformaria um botão no tenant em um
  desvio de autorização.

Passo a passo: [Instalação](installation.md#login-pelo-microsoft-entra-id-opcional).

#### `Auth:EntraId:ClientSecret`

O modo faz do host um **cliente OIDC confidencial**, e a credencial para isso é o client secret do
registro de aplicativo. Ele segue as mesmas regras do `AppSecret` do Key Vault abaixo: permitido na
configuração, variável de ambiente recomendada.

| Onde ele pode viver | Permitido? |
|---------------------|------------|
| `appsettings.json` (versionado) | Tecnicamente vincula — **nunca faça isso** |
| `appsettings.Production.json` (no gitignore) | Sim |
| `Auth__EntraId__ClientSecret` | Sim — **recomendado** |

Quanto o segredo vale para um atacante é limitado: ele autentica a *aplicação*, não um usuário. Detê-lo
não autentica ninguém por si só e não concede nenhuma das app roles. Rotacione-o no tenant conforme um
cronograma; um segredo expirado reprova o handshake OIDC, não o boot.

Uma seção `Auth:EntraId` escrita pela metade é recusada no boot, com um erro nomeando a chave que falta.
Um modo de autenticação parcialmente configurado é uma porta cuja fechadura ninguém terminou de
instalar.

### Rotação da chave de API

A chave de API é estática. Para rotacioná-la:

| Alvo | Passos |
|------|--------|
| Linux | Edite `Auth__ApiKey=<nova>` em `/etc/bulksigner/bulksigner.env`, então `sudo systemctl restart bulksigner`. |
| Windows | `[Environment]::SetEnvironmentVariable("Auth__ApiKey", "<nova>", "Machine")`, então `Restart-Service LacunaBulkSigner`. |
| Docker | Edite `Auth__ApiKey=<nova>` em `deploy/docker/.env`, então `docker compose up -d` (recria o container). |

A chave precisa ter ao menos 16 caracteres; o serviço se recusa a iniciar com um valor mais curto. Use
uma string aleatória de um CSPRNG — por exemplo `openssl rand -base64 32` no Linux/Mac, ou no
PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

:::warning
A rotação é disruptiva: todo cookie de operador existente e todo cliente programático imediatamente
começam a falhar na próxima requisição. Agende-a durante uma janela de manutenção, ou use um breve
período de sobreposição em que duas chaves conhecidas sejam aceitas por um filtro de proxy reverso (o
próprio Bulk Signer aceita exatamente uma chave).
:::

### Tempo de vida da sessão em cookie

Os cookies são emitidos com `HttpOnly`, `SameSite=Strict`, e marcados como `Secure` quando a requisição
foi HTTPS. O ticket de autenticação tem uma **expiração deslizante de 8 horas** — toda requisição
autenticada zera o relógio; oito horas ociosas e o operador é desconectado. Não existe uma opção de
"lembrar de mim" com vida mais longa. Operadores podem sair explicitamente pelo menu de conta no
dashboard.

### O key ring de sessão, e onde ele vive

Ambos os cookies de sessão — o do operador e o do aprovador — são payloads do ASP.NET Data Protection,
então o key ring que os protege decide quem consegue validar um cookie. **Sua localização segue o
`Cluster:Enabled` em vez de uma configuração própria**, deliberadamente: uma implantação capaz de
escolher o posicionamento independentemente da topologia é uma implantação capaz de escolher a
combinação quebrada.

| `Cluster:Enabled` | Onde o ring vive | Em repouso |
|---|---|---|
| `false` (padrão) | `keys/` sob `Storage:Root` | Criptografado com DPAPI no Windows; sem criptografia no Linux |
| `true` | Linhas na base operacional | **Texto claro**, guardado pelo controle de acesso do próprio banco de dados |

Duas consequências da forma em cluster, e a segunda é fácil de deixar passar:

- **O encriptador DPAPI do Windows é descartado sob a chave.** O DPAPI com escopo de máquina é
  exatamente a propriedade que torna uma cópia de `keys/` inútil em outro host — e exatamente a
  propriedade que torna um ring ilegível para uma irmã, de modo que mantê-lo seria manter o defeito. No
  Windows isso é mais fraco em repouso. Não custa nada na topologia suportada, cujo container Linux
  também não tem criptografia em repouso para o ring em disco, e é o único lugar em que ligar o modo
  cluster troca um controle em vez de acrescentar um.
- **Uma base inalcançável reprova a requisição, sem plano B.** Um host que silenciosamente criasse
  sessões a partir de um ring por instância emitiria cookies que suas irmãs rejeitam — a desconexão
  intermitente que o ring compartilhado existe para remover.

De qualquer forma, **acesso de leitura ao ring é uma sessão como qualquer pessoa**: trate `keys/` com as
mesmas ACLs do banco de dados, e trate a connection string como a credencial que ela é. Veja
[a connection string da base operacional](#a-connection-string-da-base-operacional) e
[Alta disponibilidade](high-availability.md#o-key-ring-de-sessão-fica-em-texto-claro-na-base).

## Armazenamento da licença

A licença do Lacuna PKI SDK é uma string base64. Há duas formas de carregá-la:

| Onde | Persiste através de | Preferido? |
|------|---------------------|------------|
| `Signing:PkiSdkLicense` em `appsettings.Production.json` | Reinício do serviço | Aceitável se o arquivo estiver no gitignore e o local de instalação tiver ACL para a conta de serviço |
| Variável de ambiente `Signing__PkiSdkLicense` | Reinício do serviço | **Sim** — mantém a licença literal fora da árvore de arquivos |

A variável de ambiente tem precedência no boot. Cabeamento por alvo:

- **Linux:** `/etc/bulksigner/bulksigner.env` (modo `0640`, dono `bulksigner`).
- **Windows:** variável de ambiente de escopo de máquina definida pelo `Install-Service.ps1`.
- **Docker:** `deploy/docker/.env`.

## Segredos das origens de certificado

### Senha do PFX

Senhas de PFX se comportam como outros segredos de configuração — definidas em
`Signing:Certificate:Pfx:Password`, ou sobrescritas via
`Signing__Certificate__Pfx__Password`. O arquivo PFX em si fica no caminho de
`Signing:Certificate:Pfx:Path`; proteja-o com ACLs de arquivo restritivas.

### PIN do PKCS#11 — somente por variável de ambiente

Por design, o PIN do PKCS#11 **nunca é aceito em arquivos de configuração**. O validador se recusa a
iniciar se uma chave `Pin` literal aparecer sob `Signing:Certificate:Pkcs11`. A mesma regra se aplica
dentro de cada entrada de `Signing:Profiles[]`. O PIN é lido em tempo de execução da variável de
ambiente nomeada por `Signing:Certificate:Pkcs11:PinEnvVar` (padrão `BULK_SIGNER_PKCS11_PIN`), e vários
perfis podem compartilhar a mesma variável de ambiente ou definir variáveis distintas via `PinEnvVar`
por perfil.

Esta é a mais estrita das regras de tratamento de segredos:

| Onde o PIN pode viver | Permitido? |
|-----------------------|------------|
| `appsettings.json` (versionado) | Não |
| `appsettings.Production.json` (no gitignore) | Não — o validador reprova o boot |
| Variável de ambiente | Sim (o único caminho) |

### Credenciais do Azure Key Vault

O `Signing:Certificate:AzureKeyVault:AppSecret` é um client secret do Microsoft Entra ID.
Diferentemente do PIN do PKCS#11, ele **é** permitido em um arquivo de configuração — o validador não o
recusa — mas a forma por variável de ambiente é recomendada:

```bash
export Signing__Certificate__AzureKeyVault__AppSecret='…'
```

| Onde o client secret pode viver | Permitido? |
|---------------------------------|------------|
| `appsettings.json` (versionado) | Nunca — ele acabaria no controle de versão |
| `appsettings.Production.json` (no gitignore) | Sim, e o validador o permite |
| Variável de ambiente | Sim — **preferido** |

O que esta origem *remove* do host é o ponto mais importante: não há chave privada em disco, logo não há
arquivo PFX para aplicar ACL e nenhum material de chave em um backup. O que ela *acrescenta* é uma
credencial de nuvem rotacionável. Rotacione-a no Azure (crie um novo client secret, atualize a variável
de ambiente, reinicie, e então apague o segredo antigo no Azure) — a credencial é muito mais fácil de
rotacionar que um certificado, então prefira uma expiração curta.

O arquivo `.cer` em `CerPath` **não** é um segredo. Ele contém apenas material público; proteja sua
integridade, não sua confidencialidade.

O client secret é registrado nas duas camadas de mascaramento descritas abaixo, de modo que é removido
dos logs duráveis quer apareça como propriedade estruturada, quer interpolado em uma mensagem de
exceção.

### Credenciais do blob de material de assinatura

Opcionais, e ausentes de toda implantação que mantém seus arquivos de certificado no host. O
[`Pfx:Blob` e o `AzureKeyVault:Blob`](certificates.md#lendo-o-arquivo-de-um-blob) permitem que essas
duas origens leiam seu arquivo do Azure Blob Storage. A credencial é escolhida por bloco entre os mesmos
três modos do provider de armazenamento abaixo, e seu `AppSecret` / `AccountKey` seguem exatamente as
regras de `AppSecret` acima.

Duas coisas a respeito dela são decisões de segurança em vez de detalhe de configuração.

**A credencial é separada da do cofre, mesmo onde é a mesma aplicação.** O
`AzureKeyVault:AppSecret` autoriza *uso de uma chave*; o `AzureKeyVault:Blob:AppSecret` autoriza *leitura
de um blob*. Nada é herdado: o bloco reafirma `TenantId` / `AppId` / `AppSecret` mesmo quando eles
nomeiam a aplicação idêntica do Entra. Duas credenciais que concedem coisas diferentes são configuradas
separadamente, e uma rotação esquecida faz o boot recusar em alto e bom som, em vez de funcionar com uma
delas.

**O que uma chave de conta custa depende do que o blob abriga.**

| Blob sob | O que ele abriga | O que uma `AccountKey` vazada entrega |
|----------|------------------|----------------------------------------|
| `AzureKeyVault:Blob` | o `.cer` — material público | um certificado público; a chave privada permanece no cofre |
| `Pfx:Blob` | o arquivo PKCS#12 | **a chave de assinatura** |

Uma credencial baseada em token precisa apenas de **Storage Blob Data Reader** no container. Nada no
Bulk Signer escreve, lista, move ou faz lease de um blob, então nada mais amplo é jamais exigido.

### Repositório de certificados do Windows

Nenhum segredo na configuração — a seleção é por localização de repositório, nome de repositório e
thumbprint SHA-1. O certificado em si foi importado com qualquer proteção que o sistema operacional
ofereceu no momento da importação. Use `LocalMachine` quando a conta virtual do serviço precisa alcançar
a chave, e conceda à conta virtual acesso à chave privada via `certlm.msc` → certificado → Todas as
Tarefas → Gerenciar Chaves Privadas.

## Credenciais de armazenamento do Azure Files

Opcionais, e ausentes de toda implantação que mantém seu armazenamento local. Quando
`Storage:Provider` — ou qualquer `Storage:Inputs[].Provider` — é `AzureFiles`, o host detém uma
credencial capaz de ler e escrever nos compartilhamentos para os quais é apontado. Os três modos não são
equivalentes:

| Modo | Segredo detido pelo host | Raio de explosão se o host for comprometido |
|------|--------------------------|---------------------------------------------|
| `ManagedIdentity` | **Nenhum** | As próprias atribuições de role da identidade, e nada portátil — não há valor a roubar e reproduzir em outro lugar |
| `ServicePrincipal` | `AppSecret` | As atribuições de role do registro de aplicativo, até o segredo ser rotacionado |
| `AccountKey` | `AccountKey` | **A conta de armazenamento inteira** — todo compartilhamento nela, leitura, escrita e exclusão, sem expiração e sem forma de restringir |

**Prefira `ManagedIdentity` onde quer que o host rode dentro do Azure.** É o único modo sem segredo
algum. Ele é **somente atribuído pelo sistema**, e deliberadamente não é `DefaultAzureCredential`, então
nunca recai para a identidade do `az login` de um desenvolvedor e não pode parecer funcionar em um laptop
enquanto está ausente em produção.

Ambos os modos com token autenticam por OAuth, que para o Azure Files precisa de uma das roles de **dados
de arquivo privilegiados**: conceda `Storage File Data Privileged Contributor`, delimitada ao
compartilhamento, e não à conta. O menor privilégio tem um piso que vale declarar: uma role somente
leitura **não** basta nem para uma pasta de entrada, já que o pipeline faz lease do arquivo de entrada
enquanto o coloca em stage e o apaga após a verificação.

:::warning Uma pegadinha ao delimitar a atribuição a um único compartilhamento
A string de escopo do plano de dados é:

```
/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<conta>/fileServices/default/fileshares/<compartilhamento>
```

`fileshares`, uma palavra e em minúsculas. Uma atribuição construída com a grafia do plano de gerência,
`shares`, vincula sem reclamar e então não concede nada — e falha como
`AuthorizationPermissionMismatch` na primeira chamada, o que se lê como role errada em vez de escopo
errado. Compare a string de escopo antes de rotacionar qualquer coisa.
:::

O `AccountKey` existe para hosts que não conseguem alcançar o tenant de forma alguma. É o único modo
sobre o qual o host **avisa na inicialização**, no console e no log durável. Coloque-o na variável de
ambiente em vez do arquivo de configuração e rotacione-o no mesmo cronograma de qualquer outra
credencial de escopo de conta.

Ambos os segredos são registrados nas duas camadas de mascaramento — a partir do bloco de nível superior
*e* de cada override por pasta, de modo que uma credencial deixada para trás por uma pasta que voltou
para armazenamento local ainda é mascarada. Um bloco de credencial parcial reprova o boot nomeando a
chave que falta.

### Nenhum artefato assinado é jamais alcançável por URL

Nenhuma URL de shared-access signature é criada para um artefato assinado, qualquer que seja o provider
que abrigue `output/`. Os downloads são transmitidos através da aplicação, então o
`GET /api/jobs/{id}/output` tem o mesmo formato de resposta, a mesma autorização e os mesmos códigos de
problema em um compartilhamento e em disco local.

## A connection string da base operacional

Sob `Database:Provider = Sqlite` — o padrão — o `ConnectionStrings:Default` nomeia um arquivo e não
carrega credencial; a proteção é a ACL de arquivo em `db/`, na tabela abaixo. Sob `SqlServer` a mesma
chave passa a ser **a totalidade da credencial**.

**Prefira uma forma sem segredo nela.** As três não são equivalentes:

| Forma | Segredo detido pelo host | Raio de explosão se o host for comprometido |
|-------|--------------------------|---------------------------------------------|
| Managed identity (`Authentication=Active Directory Managed Identity`) | **Nenhum** | As próprias permissões da identidade no banco de dados, e nada portátil |
| Integrada do Windows (`Integrated Security=True`) | **Nenhum** | O que aquele principal recebe de permissão, e somente de um host associado ao domínio que consiga obter um ticket |
| Login SQL, ou service principal do Entra (`User ID` + `Password`) | A senha | O banco de dados, de qualquer lugar que alcance o servidor, até a senha ser rotacionada |

As recusas de boot citam o data source e nunca a string, e a chave é registrada nas duas camadas de
mascaramento.

**Criptografe a conexão.** O `Encrypt` tem padrão `True` no cliente SQL, que é o que você quer. O
`TrustServerCertificate=True` mantém a criptografia e abandona a verificação de identidade, então
reabre o man-in-the-middle que ela estava fechando; use-o conscientemente, em um segmento confiável, e
prefira instalar um certificado em que o host confie. O `Encrypt=False` não deve aparecer em uma string
de produção.

## Senha de criptografia

Quando `Encryption:Enabled = true`, a senha de criptografia deriva a chave AES-256-GCM na inicialização
via PBKDF2-HMAC-SHA256. Diferentemente do PIN do PKCS#11, a senha **é** permitida na configuração (a
chave `Encryption:Password`) — espera-se que os operadores a coloquem no
`appsettings.Production.json`, que está no gitignore. A variável de ambiente
`BULK_SIGNER_ENCRYPTION_PASSWORD` (ou o nome configurado por `Encryption:PasswordEnvVar`) é o override
preferido e tem precedência no boot.

Versionar a senha no `appsettings.json` não criptografado não é bloqueado pelo validador, mas é o local
errado — mantenha-a no `appsettings.Production.json` ou na variável de ambiente.

A chave derivada vive apenas na memória do processo — nunca escrita em disco, nunca registrada em log,
nunca retornada por endpoint algum. Veja [Criptografia](encryption.md) para os detalhes do algoritmo e o
envelope em disco.

## ACLs de arquivo por alvo

| Alvo | Caminho | Modo | Dono |
|------|---------|------|------|
| Linux | `/etc/bulksigner` | `0750` | `bulksigner:bulksigner` |
| Linux | `/etc/bulksigner/bulksigner.env` | `0640` | `bulksigner:bulksigner` |
| Linux | `/etc/bulksigner/appsettings.Production.json` | `0640` | `bulksigner:bulksigner` |
| Linux | `/var/lib/bulksigner` | `0750` | `bulksigner:bulksigner` |
| Windows | `C:\ProgramData\Lacuna\BulkSigner` | ACL: SYSTEM, Administradores, `NT SERVICE\LacunaBulkSigner` | `NT SERVICE\LacunaBulkSigner` (efetivo) |
| Docker | `./config/appsettings.Production.json` | Depende do sistema operacional do host | UID 1654 lê como uma montagem `:ro` |

O script de instalação do Linux cria o usuário de sistema, define as ACLs, e nunca toca em
`/opt/bulksigner` depois da instalação inicial (o binário é `root:root`, modo `0755`). O script de
instalação do Windows concede à conta virtual `NT SERVICE\LacunaBulkSigner` acesso ao `ProgramData`, de
modo que operadores com direitos de Administradores possam ver os arquivos e outros usuários não.

## Mascaramento de logs — duas camadas

Os logs estruturados duráveis fluem por um pipeline de mascaramento. Segredos são removidos em duas
camadas complementares:

1. **Mascaramento por nome de propriedade.** As propriedades de cada evento de log são percorridas, e
   valores cujo nome contenha `Password`, `Pin`, `License`, `ApiKey`, `Secret`, `Salt`,
   `ConnectionString`, `Authorization` ou `Cookie` (sem diferenciar maiúsculas) são substituídos por
   `***`. O casamento é por *substring*, então `AppSecret` e `ClientSecret` são ambos capturados pelo
   token `Secret`. Isso pega o caminho estruturado:
   ```
   logger.Information("Loaded {ApiKey}", apiKey);
   // → "Loaded ***"
   ```
2. **Mascaramento por valor literal.** Na inicialização o serviço carrega o texto literal de cada valor
   de segredo configurado (licença do PKI, senhas de PFX, client secrets do Azure Key Vault, credenciais
   de blob e do Azure Files, o client secret do Entra ID, o segredo de link do portal do aprovador, a
   chave de API, a senha de criptografia, o PIN do PKCS#11, a connection string da base operacional) e
   remove essas strings exatas de toda linha de log renderizada. Segredos declarados em *todos* os
   perfis de assinatura são coletados, não apenas os do bloco global `Signing:Certificate`. Isso pega o
   caminho da interpolação acidental:
   ```
   logger.Error($"Failure with config: {appSettingsBlob}");
   // → "Failure with config: { … Auth.ApiKey: ***, Signing.PkiSdkLicense: ***, … }"
   ```
   O mascaramento por valor literal pula segredos com menos de 12 caracteres, para evitar casamentos
   patológicos.

Tanto a saída em arquivo quanto a no console passam pelo mesmo pipeline de mascaramento.

## As superfícies de aprovação

Relevante apenas quando um perfil de assinatura carrega um [bloco `Approval`](approvals.md). Tudo nesta
seção está ausente de uma implantação que não usa a etapa.

### Dados pessoais dos aprovadores — CPF e e-mail

Os aprovadores trazem os primeiros dados pessoais que o produto detém sobre *seus próprios operadores*,
e não sobre os beneficiários de um arquivo de pagamento. Três regras se aplicam, e não são a mesma
regra:

- **O CPF é mascarado no caminho estruturado.** `Cpf` está na lista de tokens de nome de propriedade —
  por um motivo diferente de todo o resto que está lá: vazá-lo não deixa um atacante entrar, expõe uma
  pessoa física.
- **O CPF é apenas exibição e auditoria.** Nada se ramifica a partir dele e nenhuma busca é chaveada por
  ele. Ele existe para que um registro de auditoria identifique uma pessoa, e não uma caixa de correio.
- **O e-mail é mascarado para exibição, não removido.** `maria@empresa.com.br` é renderizado como
  `m***@empresa.com.br` na narração de terminal e nas linhas de log, que sobrevivem ao job no
  scrollback. O endereço completo continua recuperável no snapshot de aprovação do job — nunca mascare
  algo que você também precisa consultar.

Ambos os valores são retidos no snapshot de aprovação do job depois de o job chegar a um status
terminal, e copiados novamente para cada linha de aprovação registrada. Essa é a decisão oposta à do
detalhe de linhas do CNAB240, que *é* expurgado — veja [Retenção](retention.md).

### A página de aprovação por job não é autenticada

**Qualquer um que consiga abrir o link de aprovação de um job pode aprovar — ou rejeitar — como qualquer
pessoa do pool congelado daquele job.** A página em `/approve/{jobId}` e a rota atrás dela
(`POST /api/approvals/{id}`) não exigem credencial, e nada verifica que a pessoa que seleciona um
endereço é dona dele.

- **Trate a URL de aprovação como uma capacidade.** Envie-a apenas para as pessoas do pool, por um canal
  que você usaria para o próprio arquivo de pagamento, e diga a elas para não a repassar — um link
  repassado basta para uma pessoa satisfazer um quórum de várias.
- **A mesma URL também pode parar um arquivo de pagamento.** As consequências são assimétricas — uma
  aprovação não autorizada movimenta dinheiro, uma rejeição não autorizada a atrasa e custa uma nova
  submissão — o que faz da rejeição a metade menos perigosa da capacidade, e não uma metade inofensiva.
- **Ids de job são GUIDs v4**, então a URL não é adivinhável na prática, e a rota tem seu próprio
  orçamento de limitação de taxa (`RateLimiting:Approval`, dez por minuto por endereço por padrão).
- **As recusas são deliberadamente grosseiras.** Um endereço bem formado que não está no pool e uma
  string que não é endereço nenhum retornam ambos `approval.unknown-approver`.
- **Toda decisão registra quão fraca era sua identificação** — `SelfDeclaredEmail`, mais o endereço IP e
  o user agent da requisição. O `IpAddress` é o endereço remoto da conexão: atrás de um proxy reverso
  esse é o proxy, a menos que cabeçalhos encaminhados estejam configurados.
- **O nome e o CPF em uma linha de aprovação vêm do pool congelado, nunca da requisição.**
- **O banner de inicialização avisa em todo perfil com aprovação configurada**, a cada boot.

Se uma implantação não pode aceitar essa exposição, mantenha o serviço fora de qualquer rede que os
navegadores dos aprovadores consigam alcançar, ou habilite o
[portal do aprovador](#o-portal-do-aprovador-e-quanto-vale-um-link-durável) ou o
[login pelo Entra ID](#modo-de-login-pelo-microsoft-entra-id-opcional), que ambos o estreitam
consideravelmente.

### O que a superfície anônima divulga, e o que ela retém

A página de aprovação mostra os pagamentos individuais, porque um total sozinho não dá a um humano nada
para conferir. Isso a torna uma divulgação deliberada de nomes de beneficiários e valores a quem detiver
o link. Três regras a limitam:

- **Mascarado: identificação e conta.** O CPF/CNPJ do beneficiário é reduzido aos seus dígitos
  verificadores (`***.***.***-09`) e a conta de destino aos seus últimos dígitos, com a agência omitida
  (`***149-4`) — o suficiente para distinguir duas pessoas homônimas e para ver que uma conta mudou, não
  o suficiente para identificar ou pagar alguém.
- **Não mascarado, de propósito: nome, valor, data de pagamento, segmento.** Estes *são* o julgamento.
  Mascará-los tornaria a página inútil — e uma etapa de aprovação inútil é um desfecho de segurança pior
  do que uma divulgativa, porque ela vira carimbo automático.
- **Mascaramento não é autenticação e não é oferecido como tal.** Ele limita o que um estranho com o
  link aprende; não impede que ele aprenda. Duas contas que diferem apenas nos dígitos iniciais mascaram
  identicamente.

Duas capacidades são retidas de toda superfície de aprovação — a página anônima, o portal, e a página do
job que um aprovador pode abrir:

- **Sem download do arquivo bruto.** A tabela renderizada é limitada e serve à decisão; o arquivo é um
  dump completo, legível por máquina, do CPF e da conta bancária de cada beneficiário, em um formato
  feito para processamento em massa. O `GET /api/jobs/{id}/output` exige credenciais de operador.
  Desmascarar a tabela para um aprovador identificado **não** liberou os bytes.
- **Sem índice *anônimo* de aprovações pendentes.** O portal do aprovador é um índice, mas carrega uma
  política de autorização e lista apenas os jobs cujo pool congelado nomeia a pessoa que o está lendo.
  Ninguém abaixo de um operador consegue obter o mapa de todo arquivo de pagamento na fila.

### A exportação da fila está do outro lado dessa regra, não é uma exceção a ela

Um aprovador pode baixar a aba do portal que está lendo como uma pasta de trabalho `.xlsx`, atrás da
política `Approver` e de seu próprio orçamento de limitação de taxa. A distinção em relação ao download
retido é **a unidade do que sai**:

- **O download bruto retido** é cada beneficiário de um arquivo de pagamento — nome, CPF/CNPJ, agência,
  conta — em um formato feito para máquinas.
- **A exportação da fila** é uma linha por *arquivo* de pagamento: nome do arquivo, perfil, status, nome
  e CPF/CNPJ do pagador, total geral, contagens de pagamentos e exclusões, maior pagamento individual,
  timestamps, a contagem de aprovações, e a decisão do próprio leitor. **Nenhuma linha de pagamento
  chega a ela** — nenhum nome de beneficiário, identificação fiscal, agência ou conta aparece na pasta
  de trabalho.

Ela é delimitada pela sessão e por nada mais: não há valor de rota, parâmetro de query ou cabeçalho pelo
qual um chamador pudesse exportar como outra pessoa, e a chave de API de um operador ou seu cookie de
dashboard não a abrem. É somente leitura e auditada como uma linha de log nomeando a lista, a contagem
de linhas e o endereço mascarado do aprovador.

:::warning
Uma pasta de trabalho é uma cópia repassável que o produto não consegue recolher. Linhas de nível de job
ainda nomeiam os arquivos de pagamento de uma empresa, seus valores e sua identificação de pagador. A
limitação de taxa limita a rapidez com que cópias podem ser feitas; nada limita o que acontece com uma.
Trate uma pasta de trabalho como você trata os próprios arquivos de pagamento.
:::

### O portal do aprovador, e quanto vale um link durável

Quando `ApproverPortal:Enabled`, cada aprovador configurado tem uma URL pessoal permanente, trocada uma
vez por dispositivo por um cookie de sessão, que abre uma fila delimitada às suas participações em
pools.

- **O link é uma credencial ao portador sem expiração.** Ele é materialmente mais forte que o link por
  job em um aspecto — o detentor não pode decidir *como outra pessoa*, porque o portal não oferece campo
  de endereço — e mais fraco em outro: ele não expira com um arquivo de pagamento.
- **Distribua-o como uma senha.** Um link por pessoa, enviado privadamente. A página Sistema os mostra
  como campos somente leitura para copiar, e não como âncoras clicáveis.
- **Revogar uma pessoa** significa removê-la de `Approvers` em todo perfil; o token dela para de
  resolver de imediato. **Revogar todo mundo** significa mudar o `ApproverPortal:LinkSecret`.
- **O `ApproverPortal:LinkSecret` é o segredo mais valioso que esta funcionalidade introduz.** Lê-lo
  equivale a deter o link de todo aprovador. Defina-o por variável de ambiente, mantenha-o fora do
  controle de versão, e rotacione-o se suspeitar de exposição. Mínimo de 32 caracteres, imposto no boot.
- **A sessão é seu próprio esquema de autenticação.** A chave de API ou o cookie de dashboard de um
  operador não abrem o portal, e a sessão de um aprovador não satisfaz política de operador alguma — com
  uma exceção deliberada: `/jobs/{id}`, atrás de sua própria política, alcançável somente para jobs cujo
  pool congelado o nomeia, e com o link de aprovação, os CPFs do pool e as ações Repetir / Cancelar /
  Baixar todos retidos. Retirar o link ali é um controle de **quórum**, não de divulgação: ele permite a
  seu detentor aprovar como qualquer membro do pool, então um membro que o detivesse satisfaria
  `MinimumApprovers = 3` sozinho.
- **A aba Decididos é limitada** pelo `ApproverPortal:DecidedLookback` (90 dias por padrão), que é o que
  impede um link roubado de valer todo o histórico de pagamentos de uma implantação.

### Não existe endpoint REST de aprovação

O estado de aprovação é **legível** por REST — o `GET /api/jobs/{id}` carrega um resumo `approval` e o
`GET /api/jobs/{id}/approvals` retorna o pool congelado e a lista de decisões, ambos atrás da política
comum de chave-de-API-ou-cookie. **Nenhuma rota REST *autenticada* registra uma decisão**, e essa
assimetria é uma decisão, e não uma lacuna na superfície. Atrás da chave de API seria *pior* que a
página não autenticada: a chave já fica na configuração de um ERP, em um pipeline de implantação e em um
arquivo de configurações de produção, então "um aprovador decidiu" significaria "alguma coisa que detém
a credencial de operador decidiu".

A única rota que de fato registra uma decisão, `POST /api/approvals/{id}`, é anônima e carrega a mesma
capacidade que o link de aprovação. Habilitar o segundo fator **a retira por completo** em vez de
autenticá-la, pelo mesmo motivo — veja [abaixo](#o-segundo-fator-e-quanto-ele-vale).

### O segundo fator, e quanto ele vale

O `ApproverSecondFactor:Enabled` acrescenta um pedido de TOTP antes da decisão de um aprovador, uma vez
por janela de verificação por sessão de navegador. O que ele fecha é precisamente a **sessão
desacompanhada**: uma máquina deixada autenticada, ou um link de portal lido por quem não deveria
tê-lo, não decide mais por conta própria. A janela é absoluta e pertence ao navegador em vez de à
pessoa, que é o que torna isso verdade.

Três limites a guardar, porque cada um é uma afirmação que este controle **não** sustenta:

- **Ele não torna um operador incapaz de ser um aprovador.** TOTP é simétrico, um operador pode ler todo
  link de aprovador e resetar toda inscrição, então um operador ainda pode ser qualquer aprovador.
  Vincular um aprovador ao CPF do pool congelado via um certificado ICP-Brasil continua pendente, e o
  segundo fator não deve ser descrito como tendo fechado isso.
- **Ele não estreita o que um link repassado divulga.** Com o fator ligado, um leitor não identificado
  de `/approve/{jobId}` obtém a mesma visão somente leitura com o mesmo mascaramento de antes — apenas a
  *capacidade* de decidir é retirada.
- **Ele retira o `POST /api/approvals/{id}` por completo** em vez de condicioná-lo, porque somente uma
  sessão de navegador pode carregar uma presença comprovada. Veja
  [Aprovações](approvals.md#provando-que-é-você).

**O `ApproverSecondFactor:SeedSecret` é um segredo sem história de rotação.** Ele é a chave sob a qual a
semente do autenticador de cada aprovador é criptografada em repouso (PBKDF2-HMAC-SHA256 →
AES-256-GCM), mínimo de 32 caracteres, e é obrigatório sempre que o fator está ligado — a base pode ser
o próprio SGBD do cliente, então as sementes nunca ficam em claro lá. As sementes são aleatórias por
aprovador em vez de derivadas, então deter o primeiro fator não pode criar o segundo. **Perdê-lo ou
mudá-lo significa que todo aprovador se inscreve de novo**, o que é uma operação coordenada em vez de
uma edição de configuração. Forneça-o por variável de ambiente e registre-o com o mesmo cuidado do
`ApproverPortal:LinkSecret`.

### Uma aprovação é vinculada a bytes

Imediatamente antes de assinar, a cópia em stage é re-hasheada e comparada com o hash registrado no
momento da interpretação. Uma divergência reprova o job com `approval.content-changed` — nunca uma
reinterpretação silenciosa, nunca um seguir adiante. Sem isso, "estas pessoas autorizaram este arquivo
de pagamento" deixaria de ser verdade exatamente no momento em que uma assinatura o torna autoritativo.

## Envelope de erro REST — o que é e o que não é exposto

Toda resposta de erro carrega um slug estável legível por máquina na extensão `code` (por exemplo
`job.not-found`, `upload.too-large`, `rate-limited`, `auth.invalid-credentials`, `internal`). Veja
[API REST](rest-api.md) para a tabela completa.

Em `Production`:

- O customizador de erros remove `detail`, `instance` e qualquer extensão além de `code`, `traceId`,
  `requestId`, `errors`. Nenhum stack trace escapa para clientes.
- `code = "internal"` é estampado em 500s gerados pelo framework, `code = "auth.invalid-credentials"` em
  401s, `code = "rate-limited"` em 429s.

Em `Development`, os detalhes completos (inclusive mensagens de exceção) fluem para tornar a depuração
tratável — **nunca rode com `ASPNETCORE_ENVIRONMENT=Development` em um host de produção.**

## Exposição de rede

- O serviço escuta em HTTP puro em `0.0.0.0:8080` por padrão — termine o TLS em um proxy reverso
  (nginx, IIS, Traefik).
- `Hosting:RequireHttps = true` ativa o redirecionamento HTTPS em processo; combine-o com uma
  configuração de certificado no Kestrel.
- O banner de resumo de prontidão na inicialização imprime `https redirect = on/off`, de modo que uma
  chave digitada errado aparece imediatamente.
- O `/api/metrics` é protegido pela mesma política por padrão (`Metrics:RequireApiKey = true`).
  Defina-o como `false` somente quando o coletor Prometheus estiver dentro do perímetro de confiança.
- A limitação de taxa vem ligada por padrão (`RateLimiting:Enabled = true`). Desabilite apenas para
  instalações em rede fechada.

### Em qual endereço de cliente o produto acredita

Duas coisas agem sobre o endereço do cliente, então, atrás de um proxy ou balanceador de carga, isto é
uma configuração de segurança em vez de um detalhe: a **partição da limitação de taxa** e o **endereço
registrado em cada aprovação** — um dos controles compensatórios da rota de aprovação anônima. Atrás de
um proxy sem tratamento de cabeçalhos encaminhados, todo chamador chega de um único endereço: o
orçamento por cliente vira um único orçamento compartilhado pelo mundo inteiro, e o endereço registrado
não diz nada sobre quem decidiu.

O `Hosting:ForwardedHeaders:Enabled = true` corrige isso, e **exige um conjunto de confiança** — um de
`TrustAnyProxy`, `KnownProxies` ou `KnownNetworks`, ou o boot é recusado em vez de assumir a resposta
ampla. Duas regras que vale declarar com clareza:

- **`TrustAnyProxy = true` é correto no Azure App Service e perigoso em um proxy reverso.** O front end
  do App Service não tem endereço estável a listar; uma implantação com proxy reverso que confia em
  qualquer um significa que quem alcançar o Kestrel diretamente pode se declarar qualquer endereço de
  cliente. Trave a origem se você o usar — veja
  [Azure App Service](azure.md#entrada--front-door-na-frente-do-app).
- **Definir o `ASPNETCORE_FORWARDEDHEADERS_ENABLED` do framework ao lado dele é recusado no boot.** Cada
  um acrescenta seu próprio processamento, então cabeçalhos seriam tratados duas vezes e um
  `ForwardLimit` de um silenciosamente acreditaria em dois saltos.

O banner de resumo de prontidão imprime `forwarded headers = …` nomeando o conjunto de confiança em vez
de apenas `on`. Sob o
[modo cluster](high-availability.md#os-orçamentos-de-limitação-de-taxa-são-por-instância-então-o-limite-efetivo-é-n),
lembre-se de que cada instância impõe seu próprio orçamento, então o limite efetivo por cliente é ×N.

## Postura forense

- **Trilha de auditoria.** Toda transição de estado escreve uma entrada de histórico de job no banco de
  dados operacional; toda pausa/retomada escreve um evento de sistema. Estes são duráveis através de
  reinicializações e sobrevivem à desinstalação (a menos que `--purge` seja usado).
- **Correlação por requisição.** As respostas de erro incluem `traceId` e `requestId`; os mesmos ids
  aparecem nos logs de arquivo, de modo que falhas do lado do cliente possam ser rastreadas até a linha
  que as gerou.
- **Backup antes de atualizar.** Sempre faça backup de `db/bulksigner.db` antes de uma atualização — a
  migração roda na inicialização e é de mão única.

---

**A seguir:** [Operação](operations.md) — operação do dia a dia e o ciclo de vida do job.
**Anterior:** [Certificados](certificates.md).
