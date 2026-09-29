---
sidebar_label: "Segurança"
sidebar_position: 5
---

# Segurança

O modelo de segurança do Lacuna Bulk Signer voltado ao operador — como os segredos são armazenados,
como a autenticação funciona e o que o serviço faz para evitar divulgação acidental.

## O modelo de ameaças em um parágrafo

O Bulk Signer é um serviço *on-premises* que guarda quatro tipos de segredo: a **licença do PKI SDK**,
**material de certificado, PINs e credenciais de nuvem**, a **senha de criptografia** (quando a
criptografia está habilitada) e a **chave de API**. Ele expõe uma API REST e um dashboard web, ambos
protegidos por essa única chave de API, com uma sessão baseada em cookie para operadores. Não há
atualização automática. O modelo de ameaças parte do pressuposto de que o serviço é executado em um host
confiável dentro de uma rede confiável, com o TLS terminado em um proxy reverso.

Uma implantação que habilita a [etapa de aprovação](approvals.md) também guarda **dados pessoais
sobre seus próprios aprovadores** (nome, e-mail, CPF) e, enquanto um job de pagamento está em
andamento, sobre cada beneficiário do arquivo.

Desde a 2.1.0, os perfis de assinatura ficam no banco de dados operacional; então, em uma implantação
que faz upload de material de certificado pelo dashboard, o banco também pode guardar **uma chave
privada** — criptografada com uma chave mantida fora dele. Veja
[a chave de segredos dos perfis de assinatura](#a-chave-de-segredos-dos-perfis-de-assinatura-signingprofilesecretskey).

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
| `CloudHub:ApiKey` | Lacuna CloudHub (`CloudHub:Endpoint`, por padrão a instância pública da Lacuna) — somente quando um aprovador assina com um certificado em nuvem. Nada o consulta no boot nem na verificação de prontidão. |
| `Branding:CustomerLogo:Blob` | `*.blob.core.windows.net` — uma leitura no boot. |
| `Telemetry:Enabled = true` | Azure Application Insights. Veja [Telemetria](telemetry.md). |

## Autenticação

Dois esquemas de autenticação compartilham uma política de autorização:

- **Header `X-API-Key`.** Clientes programáticos enviam a `Auth:ApiKey` configurada no header
  definido por `Auth:ApiKeyHeader` (padrão `X-API-Key`). O handler compara os valores em tempo
  constante, para evitar ataques de temporização (timing oracles).
- **Cookie.** Operadores colam a mesma chave de API em `/login`; o endpoint de login a troca por um
  cookie (`Auth:CookieName`, padrão `lbs-auth`) com `SameSite=Strict` + `HttpOnly`. As requisições
  subsequentes do dashboard carregam o cookie.

Os dois esquemas atendem à mesma política de autorização em todo endpoint protegido. `/api/health`,
`/api/ready`, `/login`, `/api/auth/login`, `/api/auth/entra-login`, `/api/auth/logout`,
`/access-denied`, `/api/culture` e `/branding/customer-logo` são anônimos, assim como as superfícies de
aprovação descritas [abaixo](#a-página-de-aprovação-por-job-não-é-autenticada). Todo endpoint declara
explicitamente seu nível de acesso, então nenhuma rota fica pública por acidente.

O `/branding/customer-logo` entrega o logotipo do cliente que as páginas de login e do aprovador mostram
antes de alguém se autenticar: uma imagem que esta instância leu no boot, e nada sobre nenhum job. Um
logotipo SVG é entregue com `Content-Security-Policy: default-src 'none'`, de modo que um script contido
no arquivo não pode ser executado nem quando alguém abre a URL diretamente. Sem logotipo carregado,
a rota responde `404` (`branding.customer-logo-not-available`).

### Prontidão: o veredito é anônimo, o diagnóstico não

:::warning Mudou na 2.6.0 — o `/api/ready` não traz mais `detail`
O probe anônimo trazia, para cada verificação, um texto escrito para o operador que fosse corrigi-la: o
host e o catálogo do SQL Server, o caminho ou a URL do compartilhamento de cada pasta de entrada, a
mensagem de falha do próprio SDK de armazenamento, o caminho ou o endpoint do cofre de um certificado
degradado. Nada disso era uma credencial; em conjunto, formava um mapa da implantação, legível por
qualquer um que alcançasse a porta. Um monitor que interpretava o `detail` passa a usar o
`/api/ready/details` e acrescenta o header da chave de API.
:::

- **`GET /api/ready`** responde apenas com o veredito: `ready`, e o `name` e o `ok` de cada
  verificação. O campo `detail` está ausente, e não nulo, então um orquestrador que lê o código de
  status não é afetado, e quem o observa ainda vê *qual* linha ficou vermelha.
- **`GET /api/ready/details`** traz o mesmo relatório com o detalhe de cada verificação, protegido pela
  chave de API ou por uma sessão de operador, com a mesma regra de 200 / 503.
- **`Readiness:RequireApiKey`** (padrão `false`) protege o próprio `/api/ready` com a mesma política,
  para um host cujo probe consegue enviar o `X-API-Key` ou que nenhum probe consulta. A opção vem
  desligada por padrão, diferentemente do `Metrics:RequireApiKey`, porque o health check do Azure App
  Service não consegue enviar a chave e interpreta um `401` como não saudável. Ela muda quem pode
  consultar, nunca o que é respondido; as linhas `ready` e `metrics` do banner de resumo de prontidão
  mostram `(anonymous)` ou `(API key)`, de modo que uma chave que não foi vinculada fica visível no boot.
- Como o corpo anônimo era, para quem quer que o consultasse, o registro de uma falha transitória, uma
  **mudança** de veredito de uma verificação é registrada no log durável uma vez por mudança — `went red`
  com o detalhe em Warning, `recovered` em Information —, nunca a cada consulta.

Nada em nenhuma das duas rotas foi escrito para o público externo. Mantenha o probe fora de qualquer rede
que não seja a de monitoramento, esteja ele protegido pelo `Readiness:RequireApiKey` ou não.

### O dashboard é cercado duas vezes: no endpoint e dentro do circuito

:::note Corrigido na 2.2.1
Antes da 2.2.1, um navegador anônimo conseguia alcançar as páginas de operador navegando *dentro* do
dashboard, onde a autorização do endpoint nunca era consultada. Atualize toda implantação 2.0.x ou 2.1.x
cujo dashboard seja alcançável por pessoas que não são operadores.
:::

A política no endpoint de uma página é o que transforma um `GET /backup` direto em um redirecionamento
para `/login`. Ela não é o que protege a página depois que um navegador mantém uma conexão ativa com o
dashboard: toda página é interativa, e uma navegação interna — um clique em um link, ou uma entrada de histórico
inserida pelo console do navegador — é resolvida dentro dessa conexão *sem uma requisição HTTP*, então
o endpoint nunca é consultado. Três mecanismos sustentam a segunda cerca, e cada um é necessário:

- **O roteador respeita a política da página.** Toda navegação é autorizada com base na identidade da
  conexão. Uma recusa recarrega a página por HTTP, de modo que o servidor responde exatamente como a uma
  requisição direta — um desafio para `/login` ou, com o Entra ligado, uma proibição para
  `/access-denied` ou para o portal. A recusa é registrada no log em Warning, com o caminho e os nomes dos
  esquemas, e nada mais.
- **A conexão sabe quem você é.** Ela carrega a sessão do navegador — a do operador, a do aprovador ou a
  do Entra — e as páginas decidem.
- **Estar autenticado não é ser operador.** Com o Entra desligado, cada política de operador verifica qual
  esquema emitiu a identidade, de modo que a sessão de portal de um aprovador — legitimamente admitida em
  `/jobs/{id}` — não satisfaz as páginas de operador só por estar autenticada. Com o Entra ligado, as
  verificações de role já faziam isso.

A gaveta de navegação e o botão que a abre são renderizados apenas para operadores, então um aprovador na
única página que os dois públicos compartilham não recebe destinos de operador. O *Sair* — o do menu de
conta, e o do cabeçalho do portal do aprovador — encerra qualquer sessão de navegador presente, inclusive
a sessão de link do aprovador. Uma sessão de link é levada para `/approvals/link-required`, que indica
o caminho de volta; qualquer outra sessão vai para `/login`.

Há uma ressalva deliberada, que vale conhecer: a identidade é capturada quando a conexão do dashboard é
aberta e não é revalidada enquanto ela permanece aberta; então, uma sessão que expira no meio da conexão
mantém a página em que está até o próximo carregamento completo. A próxima requisição HTTP, e toda
chamada REST, percebem a expiração de imediato.

### Modo de login pelo Microsoft Entra ID (opcional)

Quando o [`Auth:EntraId`](configuration.md#authentraid--login-opcional-pelo-microsoft-entra-id) está
configurado, o comportamento no navegador muda, e o da automação não:

- **O login legado por chave de API fica desligado, não relegado a segundo plano.** O `/login` renderiza
  o login da Microsoft; um POST feito à mão em `/api/auth/login` é recusado mesmo com uma chave correta;
  e a política de operador deixa de aceitar sessões com cookie legado, de modo que ligar o modo
  **encerra de uma vez toda sessão de navegador criada por chave de API**, em vez de deixá-las valendo
  por mais oito horas. Planeje a transição como uma desconexão geral. O `X-API-Key` para chamadores REST
  não é tocado — automação não consegue fazer um login interativo.
- **O acesso é decidido por app roles, somente pela claim de roles.** `Administrator` é o operador;
  `Approver` abre as superfícies de aprovação, onde o pool congelado continua delimitando quais jobs a
  pessoa vê. Uma conta autenticada sem role — e um Approver cuja conta não tem claim de e-mail, já
  que os pools são vinculados por e-mail — é recusada em `/access-denied`. **Sem mapeamento por grupo de
  segurança:** uma edição de grupo no tenant nunca pode ser uma mudança de autorização invisível.
- **Uma sessão pode carregar as duas roles**, e a segregação de funções é sustentada pelas verificações
  de role: uma sessão só de Administrator não satisfaz nenhuma política de aprovador, e vice-versa.
- **As sessões são cookies com expiração deslizante de 8 horas, em um esquema próprio** (`SameSite=Lax`, porque o
  login retorna por um redirecionamento entre sites vindo do tenant; `HttpOnly`). Sair é apenas local —
  limpa a sessão do Bulk Signer e deliberadamente não encerra a sessão Microsoft da pessoa, de modo que
  um novo login imediato funciona silenciosamente. Isso é comportamento normal de SSO, não um defeito.
- **Hardening recomendado no tenant:** defina **Atribuição necessária** no aplicativo empresarial,
  para que contas não atribuídas sejam barradas já na porta da Microsoft. A aplicação exige a role de
  qualquer forma — depender apenas da configuração do tenant transformaria uma simples opção no tenant em
  uma forma de contornar a autorização.

Passo a passo: [Instalação](installation.md#login-pelo-microsoft-entra-id-opcional).

#### `Auth:EntraId:ClientSecret`

O modo faz do host um **cliente OIDC confidencial**, e a credencial para isso é o client secret do
registro de aplicativo. Ele segue as mesmas regras do `AppSecret` do Key Vault abaixo: permitido na
configuração, variável de ambiente recomendada.

| Onde ele pode ficar | Permitido? |
|---------------------|------------|
| `appsettings.json` (versionado) | Tecnicamente funciona — **nunca faça isso** |
| `appsettings.Production.json` (ignorado pelo Git) | Sim |
| `Auth__EntraId__ClientSecret` | Sim — **recomendado** |

O valor do segredo para um atacante é limitado: ele autentica a *aplicação*, não um usuário. Tê-lo em
mãos, por si só, não autentica ninguém nem concede nenhuma das app roles. Faça a rotação dele no tenant
periodicamente; um segredo expirado faz falhar o handshake OIDC, e não o boot.

Uma seção `Auth:EntraId` preenchida pela metade é recusada no boot, com um erro que indica a chave
ausente.
Um modo de autenticação parcialmente configurado é uma porta cuja fechadura ninguém terminou de
instalar.

### Rotação da chave de API

A chave de API é estática. Para rotacioná-la:

| Alvo | Passos |
|------|--------|
| Linux | Edite `Auth__ApiKey=<nova>` em `/etc/bulksigner/bulksigner.env`, então `sudo systemctl restart bulksigner`. |
| Windows | `[Environment]::SetEnvironmentVariable("Auth__ApiKey", "<nova>", "Machine")`, então `Restart-Service LacunaBulkSigner`. |
| Docker | Edite `Auth__ApiKey=<nova>` em `deploy/docker/.env`, então `docker compose up -d` (recria o container). |

A chave precisa ter ao menos 16 caracteres; o serviço se recusa a iniciar com um valor mais curto — e sem
valor algum: desde a 2.3.1, o `appsettings.json` distribuído não traz chave de exemplo, então uma
implantação que nunca definiu `Auth:ApiKey` se recusa a iniciar, indicando essa chave. Use uma string
aleatória gerada por um CSPRNG — por exemplo `openssl rand -base64 32` no Linux/Mac, ou no PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

:::warning
A rotação causa interrupção: todo cookie de operador existente e todo cliente programático começam a
falhar já na próxima requisição. Agende-a durante uma janela de manutenção, ou use um breve
período de sobreposição em que duas chaves conhecidas sejam aceitas por um filtro de proxy reverso (o
próprio Bulk Signer aceita exatamente uma chave).
:::

### Tempo de vida da sessão em cookie

Os cookies são emitidos com `HttpOnly` e `SameSite=Strict`, e marcados como `Secure` quando a
requisição foi HTTPS. O ticket de autenticação tem uma **expiração deslizante de 8 horas** — toda
requisição autenticada zera o relógio; depois de oito horas de inatividade, o operador é desconectado.
Não existe uma opção "lembrar de mim" de maior duração. Operadores podem sair explicitamente pelo menu de conta no
dashboard.

### O key ring de sessão e onde ele fica

Ambos os cookies de sessão — o do operador e o do aprovador — são payloads do ASP.NET Data Protection,
então o key ring que os protege decide quem consegue validar um cookie. **Sua localização segue o
`Cluster:Enabled` em vez de uma configuração própria**, deliberadamente: uma implantação capaz de
escolher o local independentemente da topologia é uma implantação capaz de escolher a combinação que não
funciona.

| `Cluster:Enabled` | Onde o ring fica | Em repouso |
|---|---|---|
| `false` (padrão) | `keys/` em `Storage:Root` | Criptografado com DPAPI no Windows; sem criptografia no Linux |
| `true` | Linhas no banco operacional | **Texto claro**, protegido pelo controle de acesso do próprio banco de dados |

Há duas consequências do modo cluster, e a segunda é fácil de deixar passar:

- **Com a chave ligada, o criptografador DPAPI do Windows é descartado.** O DPAPI com escopo de máquina é
  exatamente a propriedade que torna uma cópia de `keys/` inútil em outro host — e exatamente a
  propriedade que torna um ring ilegível para uma irmã, de modo que mantê-lo seria manter o defeito. No
  Windows, isso enfraquece a proteção em repouso. Não custa nada na topologia suportada, cujo container
  Linux também não tem criptografia em repouso para o ring em disco, e é o único ponto em que ligar o modo
  cluster abre mão de um controle em vez de acrescentar um.
- **Um banco inacessível faz a requisição falhar, sem fallback.** Um host que silenciosamente criasse
  sessões a partir de um ring por instância emitiria cookies que suas irmãs rejeitam — a desconexão
  intermitente que o ring compartilhado existe para remover.

De qualquer forma, **acesso de leitura ao ring equivale a uma sessão como qualquer pessoa**: trate `keys/` com as
mesmas ACLs do banco de dados, e trate a connection string como a credencial que ela é. Veja
[a connection string do banco operacional](#a-connection-string-do-banco-operacional) e
[Alta disponibilidade](high-availability.md#o-key-ring-de-sessão-fica-em-texto-claro-no-banco).

## Armazenamento da licença

A licença do Lacuna PKI SDK é uma string base64. Há duas formas de carregá-la:

| Onde | Persiste após | Preferido? |
|------|---------------|------------|
| `Signing:PkiSdkLicense` em `appsettings.Production.json` | Reinício do serviço | Aceitável se o arquivo for ignorado pelo Git e o local de instalação tiver ACL restrita à conta de serviço |
| Variável de ambiente `Signing__PkiSdkLicense` | Reinício do serviço | **Sim** — mantém a licença literal fora da árvore de arquivos |

A variável de ambiente tem precedência no boot. Configuração por alvo:

- **Linux:** `/etc/bulksigner/bulksigner.env` (modo `0640`, dono `bulksigner`).
- **Windows:** variável de ambiente de escopo de máquina definida pelo `Install-Service.ps1`.
- **Docker:** `deploy/docker/.env`.

### A licença do Web PKI não é um segredo (`WebPki:License`)

A única licença do produto que **não** é tratada como segredo, e deliberadamente. O Lacuna Web PKI é
executado no navegador de um aprovador quando ele assina uma aprovação, e a licença é enviada para lá em
texto claro:
ela é vinculada aos domínios da implantação, não a um portador, e possuí-la não permite a ninguém
assinar nada. Por isso, ela não passa por nenhuma das camadas de mascaramento, pode ficar no
`appsettings.Production.json` ao lado das chaves que não são segredo, e nenhuma superfície a mascara. O
banner de resumo de prontidão e a página **Sistema** informam se ela está configurada ou não. As ACLs de
arquivo desta página continuam valendo a pena para ela, mas pela **integridade**, e não pela
confidencialidade: uma licença trocada pela de outra implantação mandaria os aprovadores para uma página
cujo Web PKI se recusa a funcionar. A chave em si: [Configuração](configuration.md).

## Segredos das origens de certificado

:::warning Mudou na 2.1.0 — a configuração de certificado é um seed
Os perfis de assinatura, e o certificado com que cada um assina, agora ficam no banco operacional.
`Signing:Certificate` e `Signing:Profiles[]` são lidos **uma vez**, no primeiro boot com a tabela de
perfis vazia, e ignorados depois — são um seed (carga inicial); a partir daí, um certificado — e sua
senha ou segredo de aplicação — é informado na página do perfil no dashboard e armazenado
**criptografado** com a
[`Signing:ProfileSecretsKey`](#a-chave-de-segredos-dos-perfis-de-assinatura-signingprofilesecretskey).
As regras abaixo continuam regendo o que o seed pode conter, e toda chave com segredo nela continua
registrada no mascaramento de logs, de modo que a senha que sobrou de uma implantação antiga continua
sendo mascarada depois que deixa de ser usada.
:::

### Senha do PFX

Senhas de PFX se comportam como outros segredos de configuração — definidas em
`Signing:Certificate:Pfx:Password`, ou sobrescritas via
`Signing__Certificate__Pfx__Password`. O arquivo PFX em si fica no caminho de
`Signing:Certificate:Pfx:Path`; proteja-o com ACLs de arquivo restritivas.

### PIN do PKCS#11 — somente por variável de ambiente

Por design, o PIN do PKCS#11 **nunca é aceito em arquivos de configuração**. O validador impede a
inicialização se uma chave `Pin` literal aparecer em `Signing:Certificate:Pkcs11`. A mesma regra se aplica
dentro de cada entrada de `Signing:Profiles[]`, e aos dados de perfil armazenados. O PIN é lido em tempo
de execução da variável de ambiente indicada em `Signing:Certificate:Pkcs11:PinEnvVar` (padrão
`BULK_SIGNER_PKCS11_PIN`), e vários perfis podem compartilhar a mesma variável de ambiente ou definir
variáveis distintas via `PinEnvVar` por perfil. A página do perfil no dashboard mostra o *nome* dessa
variável, nunca um valor.

Esta é a mais estrita das regras de tratamento de segredos:

| Onde o PIN pode ficar | Permitido? |
|-----------------------|------------|
| `appsettings.json` (versionado) | Não |
| `appsettings.Production.json` (ignorado pelo Git) | Não — o validador impede o boot |
| Variável de ambiente | Sim (o único caminho) |

### Credenciais do Azure Key Vault

O `Signing:Certificate:AzureKeyVault:AppSecret` é um client secret do Microsoft Entra ID.
Diferentemente do PIN do PKCS#11, ele **é** permitido em um arquivo de configuração — o validador não o
recusa — mas a forma por variável de ambiente é recomendada:

```bash
export Signing__Certificate__AzureKeyVault__AppSecret='…'
```

| Onde o client secret pode ficar | Permitido? |
|---------------------------------|------------|
| `appsettings.json` (versionado) | Nunca — ele acabaria no controle de versão |
| `appsettings.Production.json` (ignorado pelo Git) | Sim, e o validador o permite |
| Variável de ambiente | Sim — **preferido** |

O que esta origem *remove* do host é o ponto mais importante: não há chave privada em disco, logo não há
arquivo PFX para aplicar ACL e nenhum material de chave em um backup. O que ela *acrescenta* é uma
credencial de nuvem rotacionável. Faça a rotação dela no Azure (crie um novo client secret, atualize a
variável de ambiente, reinicie e então apague o segredo antigo no Azure) — a credencial é muito mais fácil de
rotacionar que um certificado, então prefira uma expiração curta.

O arquivo `.cer` em `CerPath` **não** é um segredo. Ele contém apenas material público; proteja sua
integridade, não sua confidencialidade.

O client secret é registrado nas duas camadas de mascaramento descritas abaixo, de modo que é removido
dos logs duráveis quer apareça como propriedade estruturada, quer interpolado em uma mensagem de
exceção.

### Credenciais do blob de material de assinatura

Opcionais e ausentes em toda implantação que mantém os arquivos de certificado no host. O
[`Pfx:Blob` e o `AzureKeyVault:Blob`](certificates.md#lendo-o-arquivo-de-um-blob) permitem que essas
duas origens leiam seu arquivo do Azure Blob Storage. A credencial é escolhida por bloco entre os mesmos
três modos do provider de armazenamento abaixo, e seu `AppSecret` / `AccountKey` seguem exatamente as
regras de `AppSecret` acima.

Dois aspectos dela são decisões de segurança, e não detalhes de configuração.

**A credencial é separada da do cofre, mesmo quando é a mesma aplicação.** O
`AzureKeyVault:AppSecret` autoriza *uso de uma chave*; o `AzureKeyVault:Blob:AppSecret` autoriza *leitura
de um blob*. Nada é herdado: o bloco repete `TenantId` / `AppId` / `AppSecret` mesmo quando eles
se referem à mesma aplicação do Entra. Duas credenciais que concedem coisas diferentes são configuradas
separadamente, e uma rotação esquecida faz o boot falhar de forma explícita, em vez de seguir funcionando
com apenas uma delas.

**O que uma chave de conta custa depende do que o blob abriga.**

| Blob em | O que ele abriga | O que uma `AccountKey` vazada entrega |
|----------|------------------|----------------------------------------|
| `AzureKeyVault:Blob` | o `.cer` — material público | um certificado público; a chave privada permanece no cofre |
| `Pfx:Blob` | o arquivo PKCS#12 | **a chave de assinatura** |

Uma credencial baseada em token precisa apenas de **Storage Blob Data Reader** no container. Nada no
Bulk Signer grava, lista, move ou faz lease de um blob, então nunca é necessário nada mais amplo.

### Repositório de certificados do Windows

Nenhum segredo na configuração — a seleção é feita pelo local do repositório, pelo nome do repositório
e pelo thumbprint SHA-1. O certificado em si foi importado com a proteção que o sistema operacional
oferecia no momento da importação. Use `LocalMachine` quando a conta virtual do serviço precisar acessar
a chave, e conceda à conta virtual acesso à chave privada via `certlm.msc` → certificado → Todas as
Tarefas → Gerenciar Chaves Privadas.

### A raiz de teste da Lacuna, e por que a produção a recusa (`Signing:TrustLacunaTestRoot`)

Um build de release confia nas raízes da ICP-Brasil. O `Signing:TrustLacunaTestRoot = true`
(acrescentado na 2.3.0, desligado por padrão) amplia esse conjunto de confiança com a **raiz da PKI de
teste da Lacuna** — a emissora dos certificados de teste Turing / Fermat — mais o conjunto de confiança
do Windows do PKI SDK, para que uma homologação possa executar a imagem publicada com certificados de
teste em vez de um e-CPF real por aprovador. Três pontos importantes:

- **Ele é recusado no boot quando o `ASPNETCORE_ENVIRONMENT` é `Production`.** Portanto, um host de
  produção que herdou a configuração se recusa a iniciar, indicando a chave, em vez de confiar em uma raiz
  que qualquer um pode baixar. Em um host de homologação, defina o nome do ambiente como `Staging` (ou
  qualquer outro nome).
- **É um único conjunto de confiança para o host inteiro.** A chave de cada perfil no momento da
  assinatura, cada verificação posterior e o certificado de cada aprovador são validados com base nas
  mesmas raízes.
- **Ele é bem visível.** A linha `trust set` do banner de resumo de prontidão o indica, e o console e o
  log durável exibem um aviso a cada boot. A chave não é um segredo.

Veja [Certificados](certificates.md) para a descrição completa.

## Credenciais de armazenamento do Azure Files

Opcionais e ausentes em toda implantação que mantém o armazenamento local. Quando
`Storage:Provider` — ou qualquer `Storage:Inputs[].Provider` — é `AzureFiles`, o host guarda uma
credencial capaz de ler e gravar nos compartilhamentos configurados. Os três modos não são
equivalentes:

| Modo | Segredo guardado pelo host | Raio de impacto se o host for comprometido |
|------|--------------------------|---------------------------------------------|
| `ManagedIdentity` | **Nenhum** | As próprias atribuições de role da identidade, e nada portátil — não há valor a roubar e reproduzir em outro lugar |
| `ServicePrincipal` | `AppSecret` | As atribuições de role do registro de aplicativo, até o segredo ser rotacionado |
| `AccountKey` | `AccountKey` | **A conta de armazenamento inteira** — todo compartilhamento nela, leitura, escrita e exclusão, sem expiração e sem forma de restringir |

**Prefira `ManagedIdentity` sempre que o host for executado dentro do Azure.** É o único modo sem
nenhum segredo. Ele é **somente atribuído pelo sistema**, e deliberadamente não é `DefaultAzureCredential`, então
nunca recai para a identidade do `az login` de um desenvolvedor e não pode parecer funcionar em um laptop
enquanto está ausente em produção.

Ambos os modos com token autenticam por OAuth, que para o Azure Files precisa de uma das roles de **dados
de arquivo privilegiados**: conceda `Storage File Data Privileged Contributor`, delimitada ao
compartilhamento, e não à conta. O menor privilégio tem um limite mínimo que vale mencionar: uma role
somente leitura **não** basta nem para uma pasta de entrada, já que o pipeline faz lease do arquivo de
entrada enquanto o coloca em staging e o apaga após a verificação.

:::warning Uma armadilha ao restringir a atribuição a um único compartilhamento
A string de escopo do plano de dados é:

```
/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Storage/storageAccounts/<conta>/fileServices/default/fileshares/<compartilhamento>
```

`fileshares`, numa só palavra e em minúsculas. Uma atribuição criada com a grafia do plano de
gerenciamento, `shares`, é aceita sem reclamação e depois não concede nada — e falha como
`AuthorizationPermissionMismatch` na primeira chamada, o que parece um erro de role, e não de escopo.
Confira a string de escopo antes de trocar qualquer credencial.
:::

O `AccountKey` existe para hosts que não conseguem alcançar o tenant de forma alguma. É o único modo
sobre o qual o host **avisa na inicialização**, no console e no log durável. Coloque-o na variável de
ambiente, e não no arquivo de configuração, e faça a rotação dele na mesma periodicidade de qualquer outra
credencial com escopo de conta.

Ambos os segredos são registrados nas duas camadas de mascaramento — a partir do bloco de nível superior
*e* de cada override por pasta, de modo que uma credencial deixada para trás por uma pasta que voltou
para armazenamento local ainda é mascarada. Um bloco de credencial incompleto impede o boot, com um erro
que indica a chave ausente.

### Nenhum artefato assinado é jamais alcançável por URL

Nenhuma URL de SAS (shared access signature) é gerada para um artefato assinado, qualquer que seja o
provider que abrigue `output/`. Os downloads são transmitidos pela própria aplicação, então o
`GET /api/jobs/{id}/output` — e o arquivo compactado de saídas assinadas de vários jobs,
`GET /api/jobs/archive` — têm o mesmo formato de resposta, a mesma autorização e os mesmos códigos de
problema em um compartilhamento e em disco local.

## A connection string do banco operacional

Com `Database:Provider = Sqlite` — o padrão —, o `ConnectionStrings:Default` indica um arquivo e não
contém credencial; a proteção é a ACL de arquivo em `db/`,
[abaixo](#db-merece-o-mesmo-cuidado-que-keys-e-o-produto-não-o-configura-para-você). Com `SqlServer`, a
mesma chave passa a ser **a credencial inteira**.

**Prefira um formato sem segredo.** Os três não são equivalentes:

| Formato | Segredo guardado pelo host | Raio de impacto se o host for comprometido |
|-------|--------------------------|---------------------------------------------|
| Managed identity (`Authentication=Active Directory Managed Identity`) | **Nenhum** | As próprias permissões da identidade no banco de dados, e nada portátil |
| Autenticação integrada do Windows (`Integrated Security=True`) | **Nenhum** | As permissões concedidas a esse principal, e somente a partir de um host ingressado no domínio que consiga obter um ticket |
| Login SQL, ou service principal do Entra (`User ID` + `Password`) | A senha | O banco de dados, de qualquer lugar que alcance o servidor, até a senha ser rotacionada |

As recusas de boot citam o data source e nunca a string, e a chave é registrada nas duas camadas de
mascaramento. O banner de resumo de prontidão, o console e o `/api/ready/details` identificam o banco
por engine, servidor e nome do banco de dados — nunca citando a connection string.

**Criptografe a conexão.** O `Encrypt` tem padrão `True` no cliente SQL, que é o que você quer. O
`TrustServerCertificate=True` mantém a criptografia e abandona a verificação de identidade, então
reabre a brecha para man-in-the-middle que ela fechava; use-o conscientemente, em um segmento confiável, e
prefira instalar um certificado em que o host confie. O `Encrypt=False` não deve aparecer em uma string
de produção.

## Senha de criptografia

Quando `Encryption:Enabled = true`, a senha de criptografia deriva a chave AES-256-GCM na inicialização
via PBKDF2-HMAC-SHA256. Diferentemente do PIN do PKCS#11, a senha **é** permitida na configuração (a
chave `Encryption:Password`) — espera-se que os operadores a coloquem no
`appsettings.Production.json`, que é ignorado pelo Git. A variável de ambiente
`BULK_SIGNER_ENCRYPTION_PASSWORD` (ou o nome configurado por `Encryption:PasswordEnvVar`) é o override
preferido e tem precedência no boot.

O validador não impede que a senha seja versionada no `appsettings.json` não criptografado, mas esse é
o local errado — mantenha-a no `appsettings.Production.json` ou na variável de ambiente.

A chave derivada fica apenas na memória do processo — nunca é gravada em disco, nunca é registrada em log
e nunca é retornada por nenhum endpoint. Veja [Criptografia](encryption.md) para os detalhes do algoritmo e o
envelope em disco — inclusive por que, com a criptografia ligada, a senha é também o único caminho de
volta a um arquivo que um aprovador rejeitou.

## A chave de segredos dos perfis de assinatura (`Signing:ProfileSecretsKey`)

**Uma implantação cujos perfis têm um segredo precisa dela.** Os perfis de assinatura são linhas no
banco operacional, e os segredos que eles contêm são criptografados com uma chave derivada desta. Uma
implantação cujos perfis não têm nenhum segredo — um PFX sem senha, um token PKCS#11 cujo PIN é uma
variável de ambiente, um certificado do repositório do Windows — não precisa de chave, e ela nunca é
exigida.

Cinco valores no banco são criptografados com ela: uma **senha de PKCS#12**, um **segredo de aplicação do
Azure Key Vault**, **bytes de PKCS#12 enviados por upload** e, de um blob de material de assinatura, o **segredo do
service principal** e a **chave de conta**. PBKDF2-HMAC-SHA256 uma vez na inicialização, depois
AES-256-GCM por valor com um nonce aleatório — o mesmo vocabulário do [BSENC v1](encryption.md).
Defina-a via `Signing__ProfileSecretsKey` e mantenha-a fora do controle de versão.

**A chave é mantida fora do banco de dados, e é nisso que está todo o design.** O que ela protege está
*dentro* do banco de dados: o material de certificado enviado por upload fica no banco operacional, e não
no sistema de arquivos do host, porque o disco de uma instância em cluster é efêmero e nunca
compartilhado. Assim, o banco pode guardar chaves privadas, e um arquivo de banco copiado ou uma
connection string vazada não pode equivaler a uma credencial de assinatura roubada. Uma chave guardada
ao lado do seu texto cifrado não garantiria nada disso — e é também por isso que o key ring de sessão
deliberadamente não é reaproveitado: com `Cluster:Enabled`, esse ring é, ele próprio, um conjunto de
linhas neste mesmo banco.

**O host se recusa a iniciar quando existem segredos de perfil armazenados e a chave está ausente** —
somente essa combinação, que descreve um host que subiria sem conseguir cumprir o que diz proteger. A
recusa indica a chave e a variável de ambiente, no console e no log durável.

**A importação de perfis é recusada pelo mesmo motivo, um pouco antes.** No primeiro boot que faz o seed
dos perfis a partir da configuração, um perfil que tem uma senha, um segredo de aplicação ou uma
credencial de blob é recusado, em vez de ser gravado em texto claro — o erro indica a chave, a variável
de ambiente e quais perfis têm um segredo. Este é o único passo de atualização que a 2.1.0 pode
exigir: defina a chave, inicie de novo e a importação é concluída. Uma implantação sem segredo de perfil
nunca passa por isso.

**Uma chave definida, mas errada, degrada os perfis que ela não consegue ler, e o host inicia.** Uma chave
que foi **rotacionada, restaurada de outra implantação ou digitada errado** não abre os envelopes que já
estão no banco. Cada perfil afetado é informado como degradado — em sua página, no banner de boot, no log
durável e como uma linha de prontidão; um job roteado para um deles falha com `profile.degraded`; e todo
perfil que não tem segredo continua assinando. **Não há recuperação do valor em si**: restaure a
chave original, se ela existir em algum lugar, ou informe de novo o material de certificado daquele perfil
e reinicie. Veja [Diagnóstico de problemas](troubleshooting.md).

**Perdê-la significa informar de novo o material de certificado de todo perfil afetado.** Não há custódia
de terceiros (escrow), segunda chave nem caminho de recuperação, e nada disso é previsto — um segredo que
pudesse ser lido sem este valor não estaria protegido por ele. Fazer a rotação tem exatamente o mesmo
efeito que perdê-la, e a implantação não assina nada nos perfis afetados nesse meio-tempo. Faça backup
dela nos mesmos lugares em que ficam os backups da senha de criptografia, do `ApproverPortal:LinkSecret`
e do `ApproverSecondFactor:SeedSecret`, e trate a troca como uma operação que você agenda, e não como
algo que você experimenta.

Como o dashboard trata esses valores:

- **Um segredo aparece como *configurado* ou *não configurado*, nunca como valor** — na página do perfil
  e no `GET /api/profiles`, que não traz nenhum segredo, credencial ou material enviado.
- **Um segredo digitado em um formulário de perfil é registrado no mascaramento de logs antes de a linha
  ser gravada**, de modo que não há janela em que ele esteja armazenado e sem mascaramento. Um segredo com
  menos de 12 caracteres é recusado ao salvar, porque o mascaramento por valor literal não consegue
  mascarar um valor tão curto. Deixar um campo de senha em branco mantém o valor que já está no banco.
- **As páginas de perfil exigem uma sessão de navegador, e não uma chave de API sozinha.** Elas mostram
  um pool de aprovadores vigente com CPFs e os dados de localização de um certificado, que a rota REST
  omite; recusar a leitura só com o header impede que uma chave reaproveitada de um log de proxy leia
  esses dados em um único passo. É uma restrição adicional, e não uma fronteira de segurança — o `POST /api/auth/login` aceita a mesma
  chave e devolve uma sessão.

Três coisas que ela **não** é:

- **Não protege o PIN do PKCS#11.** Ele continua
  [somente por variável de ambiente](#pin-do-pkcs11--somente-por-variável-de-ambiente), nunca
  armazenado — e um PIN presente em dados de perfil armazenados é recusado exatamente como um presente na
  configuração.
- **Não substitui os segredos das origens de certificado na configuração.** Referenciar um certificado
  por caminho local ou por um blob de material de assinatura continua totalmente suportado.
- **Não é algo que um valor errado tolere em silêncio.** A descriptografia é autenticada, então uma chave
  rotacionada, uma linha editada ou um valor movido entre colunas falha de forma explícita, em vez de
  produzir uma senha aparentemente válida.

### O que um perfil degradado divulga

Um perfil cujo certificado não abre é informado em quatro superfícies, uma das quais é a prontidão. O
`/api/ready` anônimo traz o nome da linha — `signing-profile:<name>` — e `ok: false`, e nada mais,
porque quem observa o orquestrador precisa ver *qual* linha ficou vermelha, e o nome é a única coisa na
linha que um operador escolheu. O `/api/ready/details` autenticado traz o motivo, que com frequência
cita um caminho de PKCS#12 ou de módulo PKCS#11, um endpoint de cofre ou um thumbprint. Um perfil cujos
**segredos** armazenados não podem ser descriptografados chega à mesma linha; esse motivo cita a
`Signing:ProfileSecretsKey` e o tipo de valor envolvido, e não traz caminho nem credencial. Todo motivo
passa pelo mascaramento por valor literal, de modo que uma senha, um segredo de aplicação, uma credencial
de blob ou a própria chave de segredos dos perfis são mascarados se um provedor algum dia repetir um deles
em uma mensagem.

## ACLs de arquivo por alvo

| Alvo | Caminho | Modo | Dono |
|------|---------|------|------|
| Linux | `/etc/bulksigner` | `0750` | `bulksigner:bulksigner` |
| Linux | `/etc/bulksigner/bulksigner.env` | `0640` | `bulksigner:bulksigner` |
| Linux | `/etc/bulksigner/appsettings.Production.json` | `0640` | `bulksigner:bulksigner` |
| Linux | `/var/lib/bulksigner` | `0750` | `bulksigner:bulksigner` |
| Linux | `/var/lib/bulksigner/db` | `0700` — **defina-o você mesmo**, veja abaixo | `bulksigner:bulksigner` |
| Windows | `C:\ProgramData\Lacuna\BulkSigner` | Herda a ACL do `ProgramData`, mais uma regra `Modify` para `NT SERVICE\LacunaBulkSigner` — veja abaixo | `NT SERVICE\LacunaBulkSigner` (efetivo) |
| Docker | `./config/appsettings.Production.json` | Depende do sistema operacional do host | UID 1654 lê como uma montagem `:ro` |
| Docker | `./data/db` no host | `0700`, dono UID 1654 — **defina-o você mesmo** | UID 1654 |

O script de instalação do Linux cria o usuário de sistema, define as ACLs e nunca toca em
`/opt/bulksigner` depois da instalação inicial (o binário é `root:root`, modo `0755`). O script de
instalação do Windows **acrescenta** uma regra `Modify` para a conta virtual
`NT SERVICE\LacunaBulkSigner` na árvore de dados e não remove nada: o que quer que o `C:\ProgramData`
conceda continua valendo abaixo dele, e em uma instalação padrão isso inclui **`BUILTIN\Users` com
acesso de leitura**. Restrinja você mesmo, como abaixo.

### `db/` merece o mesmo cuidado que `keys/`, e o produto não o configura para você

Com `Database:Provider = Sqlite` — o padrão —, todo o banco operacional é um único arquivo em `db/`, e,
desde que os perfis de assinatura passaram a ficar nele, esse arquivo pode guardar **a chave privada de um
PKCS#12 enviado por upload**, além de toda senha de PKCS#12, segredo de aplicação do Key Vault e credencial de blob
armazenados. Ele deixou de ser apenas um registro do que aconteceu e passou a fazer parte da cadeia de
custódia da identidade de assinatura.

**Dois fatos que precisam ser considerados juntos.** Os valores nele são criptografados, e a `Signing:ProfileSecretsKey` é
deliberadamente mantida fora dele — então um arquivo de banco copiado, sozinho, não é uma credencial de
assinatura utilizável. Mas acesso de leitura ainda significa acesso aos beneficiários de todo pagamento, ao
CPF e ao e-mail de todo aprovador e a metade de um segredo em duas partes; e as duas metades são rotineiramente capturadas
juntas, porque a chave é uma variável de ambiente no mesmo host.

**Linux: o boot cria o `db/` com a umask do processo — não `0700`.** Com a umask usual `0022`, ele fica em
`0755`, e o que de fato impede alguém de lê-lo é que o diretório pai `0750`, `/var/lib/bulksigner`, não
pode ser percorrido. Isso é proteção por contenção, e não por intenção, e basta um `chmod` no pai para
perdê-la:

```bash
chmod 0700 /var/lib/bulksigner/db && chown -R bulksigner:bulksigner /var/lib/bulksigner/db
```

**Windows: verifique antes de presumir.**

```powershell
icacls C:\ProgramData\Lacuna\BulkSigner\data\db
```

Se `BUILTIN\Users` ou `Everyone` aparecer, toda conta interativa daquele host consegue ler o banco
operacional — o histórico de jobs assinados, nomes, CPFs e endereços de e-mail de aprovadores, e os
segredos de perfil criptografados. Corte a herança e mantenha apenas os três principais que precisam de acesso:

```powershell
icacls C:\ProgramData\Lacuna\BulkSigner\data\db /inheritance:r `
  /grant "NT SERVICE\LacunaBulkSigner:(OI)(CI)M" `
  /grant "SYSTEM:(OI)(CI)F" /grant "Administrators:(OI)(CI)F"
```

Aplique o mesmo a `data\keys`, o key ring de sessão, que sempre mereceu isso.

**O Docker é o caso em que a contenção não se sustenta**, porque as permissões do bind mount são as do
host e nenhum arquivo de unit as controla. Defina-as no host, e lembre-se de que qualquer coisa com acesso
de leitura àquele diretório — um agente de backup, outro container montando o mesmo caminho, um
`docker cp` — tem acesso de leitura ao banco.

**Depois, olhe além do arquivo.** Com `SqlServer`, não há `db/` e isso passa a ser responsabilidade do seu
SGBD, nos mesmos termos: [a connection string *é* a credencial](#a-connection-string-do-banco-operacional).
E em todo provider, um [backup do banco de dados](retention.md#disciplina-de-backup) **não é
criptografado nem BSENC** — então um destino de backup herda tudo o que está acima, e uma chave privada
enviada por upload viaja dentro dele.

## Mascaramento de logs — duas camadas

Os logs estruturados duráveis fluem por um pipeline de mascaramento. Segredos são removidos em duas
camadas complementares:

1. **Mascaramento por nome de propriedade.** As propriedades de cada evento de log são percorridas, e
   valores cujo nome contenha `Password`, `Pin`, `License`, `ApiKey`, `Secret`, `AccountKey`, `Salt`,
   `Token`, `ConnectionString`, `Authorization`, `Cookie` ou `Cpf` (sem diferenciar maiúsculas de minúsculas) são
   substituídos por `***`. A correspondência é por *substring*, então `AppSecret` e `ClientSecret` são
   ambos capturados pelo token `Secret`. Isso cobre o caminho estruturado:
   ```
   logger.Information("Loaded {ApiKey}", apiKey);
   // → "Loaded ***"
   ```
2. **Mascaramento por valor literal.** Na inicialização, o serviço carrega o texto literal de cada valor
   de segredo configurado (licença do PKI, a chave de API, a chave de API do Lacuna Signer, a chave de API
   do CloudHub, senhas de PFX, client secrets do Azure Key Vault, credenciais de blob, do Azure Files, dos
   destinos de backup e do destino de log em tabela, o client secret do Entra ID, o segredo de link do
   portal do aprovador, o segredo de semente do segundo fator, a chave de segredos dos perfis de
   assinatura, a senha de criptografia, o PIN do PKCS#11, as connection strings do banco operacional e do
   Application Insights) e remove essas strings exatas de toda linha de log renderizada. Segredos
   declarados em *todos* os perfis de assinatura são coletados, não apenas os do bloco global
   `Signing:Certificate`, e um segredo salvo na página de um perfil entra na lista no momento em que é
   salvo. Isso cobre o caminho da interpolação acidental:
   ```
   logger.Error($"Failure with config: {appSettingsBlob}");
   // → "Failure with config: { … Auth.ApiKey: ***, Signing.PkiSdkLicense: ***, … }"
   ```
   O mascaramento por valor literal ignora segredos com menos de 12 caracteres, para evitar
   correspondências patológicas.

Tanto a saída em arquivo quanto a no console passam pelo mesmo pipeline de mascaramento. A licença do Web
PKI deliberadamente [não é um segredo](#a-licença-do-web-pki-não-é-um-segredo-webpkilicense) e não é
mascarada.

:::warning Corrigido na 2.1.0 — links de aprovador eram gravados no log durável
Toda entrada de log gravada ao atender uma requisição traz o caminho da requisição, e em
`/approvals/link/{token}` esse caminho termina no token de portador permanente do aprovador — então, da
primeira versão do portal do aprovador até a 2.1.0, trocas de link bem-sucedidas registravam tokens
inteiros nos arquivos de log e, com `Logging:AzureTable`, em uma tabela que nada poda. Agora o
mascaramento oculta o segmento secreto desse caminho. **O que já foi gravado continua gravado**, e não é
possível fazer a rotação do token por pessoa: se seus logs anteriores à 2.1.0 foram legíveis por alguém que não
deveria poder aprovar arquivos de pagamento, trate esses links como divulgados e troque o
`ApproverPortal:LinkSecret`, que reemite todos os links de uma vez.
:::

**As duas camadas ficam no caminho do log; por isso, toda superfície que mostra uma falha em outro lugar
faz o próprio mascaramento.** Mascarado, e não omitido, porque estes são os únicos lugares em que você
descobre por que algo deu errado sem abrir um arquivo de log:

| Onde você a vê | O que vale saber |
|---|---|
| **O dashboard** — o tooltip de falha de atualização de uma página, um snackbar vermelho depois de um **Reescanear**, **Tentar novamente** ou **Cancelar** que falhou, o último erro de uma pasta monitorada na página **Pastas de entrada**, o motivo de o destino de backup estar inacessível | A mensagem do próprio provedor, com todo segredo configurado mascarado como `***`. O último erro de uma pasta também é o `lastError` do `GET /api/system/folders` |
| **A narração do console** — que um serviço do Windows, uma unit do systemd ou um container entregam ao Visualizador de Eventos, ao journald ou ao `docker logs` | Toda linha, inclusive os painéis de resumo do boot. Um lugar tão durável quanto o arquivo de log |
| O **texto de falha de um job** em sua linha do tempo, na página do job e no `GET /api/jobs/{id}` | Mascarado antes de ser armazenado, de modo que a própria linha de auditoria fica limpa, e não apenas a exibição dela |
| As **linhas do `/api/ready/details`** e os mesmos detalhes na página **Sistema** | Onde um problema de credencial do Azure Table ou do SQL Server aparece depois de uma rotação |

O que esse mascaramento consegue pegar é limitado exatamente como o do log durável: ele mascara valores
com que o host foi configurado, então o produto não consegue reconhecer uma credencial que você nunca
forneceu a ele. Há um lugar que deliberadamente mostra *menos*: uma connection string que o produto não
consegue interpretar é informada como não interpretável, sem ser citada, porque o trecho citado seria
exatamente o que você digitou.

## As superfícies de aprovação

Relevante apenas quando um perfil de assinatura tem um [bloco `Approval`](approvals.md). Nada nesta
seção existe em uma implantação que não usa a etapa de aprovação.

### Dados pessoais dos aprovadores — CPF e e-mail

Os aprovadores trazem os primeiros dados pessoais que o produto mantém sobre *seus próprios operadores*,
e não sobre os beneficiários de um arquivo de pagamento. Três regras se aplicam, e não são a mesma
regra:

- **O CPF é mascarado no caminho estruturado.** `Cpf` está na lista de tokens de nome de propriedade —
  por um motivo diferente de todo o resto que está lá: vazá-lo não deixa um atacante entrar, expõe uma
  pessoa física.
- **O CPF serve apenas para exibição e auditoria.** Nenhuma lógica depende dele e nenhuma busca é feita
  por ele. Ele existe para que um registro de auditoria identifique uma pessoa, e não uma caixa de correio.
- **O e-mail é mascarado para exibição, não removido.** `maria@empresa.com.br` é renderizado como
  `m***@empresa.com.br` na narração de terminal e nas linhas de log, que sobrevivem ao job no
  scrollback. O endereço completo continua recuperável no snapshot de aprovação do job — nunca mascare
  algo que você também precisa consultar.

Ambos os valores são retidos no snapshot de aprovação do job depois de o job chegar a um status
terminal, e copiados novamente para cada linha de aprovação registrada. Essa é a decisão oposta à do
detalhe de linhas do CNAB240, que *é* expurgado — veja [Retenção](retention.md).

**Em uma aprovação registrada por assinatura, a linha também registra o certificado**: o titular e o
emissor, o número de série, o thumbprint SHA-256, o CPF que consta no certificado e, no certificado de
uma empresa, seu CNPJ — todos vazios em uma decisão por clique. Eles respondem a uma pergunta diferente
da do pool: o pool diz quem estava *autorizado* a decidir, e o nome e o CPF continuam vindo dele; o
certificado diz qual *chave confirmou* a decisão. Em todo lugar em que o CPF do certificado sai da
linha — a linha do tempo, o evento operacional, o log, e o objeto `certificate` do
`GET /api/jobs/{id}/approvals` — ele é mascarado até os dígitos verificadores, **inclusive dentro do
titular**, já que o nome comum de um certificado ICP-Brasil muitas vezes é escrito `NOME:CPF`. O CNPJ
nunca é mascarado, já que identifica uma empresa. Os bytes da assinatura não estão na linha: o arquivo
entregue em `output/` é a prova.

### A página de aprovação por job não é autenticada

**Qualquer um que consiga abrir o link de aprovação de um job pode aprovar — ou rejeitar — como qualquer
pessoa do pool congelado daquele job.** A página em `/approve/{jobId}` e a rota atrás dela
(`POST /api/approvals/{id}`) não exigem credencial, e nada verifica se a pessoa que seleciona um
endereço é a dona dele.

- **Trate a URL de aprovação como uma capacidade (capability).** Envie-a apenas para as pessoas do pool, por um canal
  que você usaria para o próprio arquivo de pagamento, e diga a elas para não a repassar — um link
  repassado basta para uma pessoa satisfazer um quórum de várias. O produto não envia e-mail e, desde a
  2.9.0, a página do job do operador não entrega mais o link; um aprovador com acesso ao portal chega a um
  arquivo retido pela própria fila.
- **A mesma URL também pode barrar um arquivo de pagamento.** As consequências são assimétricas — uma
  aprovação não autorizada movimenta dinheiro, uma rejeição não autorizada o atrasa e exige um novo
  envio — o que faz da rejeição a metade menos perigosa da capacidade, e não uma metade inofensiva.
- **Ids de job são GUIDs v4**, então a URL não é adivinhável na prática, e a rota tem sua própria
  cota de limite de requisições (rate limiting) (`RateLimiting:Approval`, dez por minuto por endereço por
  padrão).
- **As recusas são deliberadamente genéricas.** Um endereço bem formado que não está no pool e uma
  string que não é endereço nenhum retornam, ambos, `approval.unknown-approver`.
- **Toda decisão registra quão fraca era sua identificação** — `SelfDeclaredEmail`, mais o endereço IP e
  o user agent da requisição. O `IpAddress` é o endereço remoto da conexão: atrás de um proxy reverso
  esse é o proxy, a menos que os headers encaminhados (forwarded headers) estejam configurados.
- **O nome e o CPF em uma linha de aprovação vêm do pool congelado, nunca da requisição.**
- **O banner de inicialização exibe um aviso para cada perfil com aprovação configurada**, a cada boot.
- **Em um job cujo conjunto de assinantes congelado inclui os aprovadores, uma aprovação é uma
  assinatura, e não um clique.** A rota anônima recusa um clique em um job assim com
  `approval.signature-required`; o aprovador assina pelo portal, ou por esta página com uma sessão
  identificada.

Se uma implantação não pode aceitar essa exposição, mantenha o serviço fora de qualquer rede que os
navegadores dos aprovadores consigam alcançar, ou habilite o
[portal do aprovador](#o-portal-do-aprovador-e-quanto-vale-um-link-durável), o
[login pelo Entra ID](#modo-de-login-pelo-microsoft-entra-id-opcional), o
[segundo fator](#o-segundo-fator-e-quanto-ele-vale) ou as assinaturas de aprovador, cada um dos quais
reduz consideravelmente essa exposição.

### O que a superfície anônima divulga, e o que ela omite

A página de aprovação mostra os pagamentos individuais, porque só o total não dá a uma pessoa nada para
conferir. Isso a torna uma divulgação deliberada de nomes de beneficiários e valores a quem tiver o
link. Três regras a limitam:

- **Mascarado: identificação e conta.** O CPF/CNPJ do beneficiário é reduzido aos seus dígitos
  verificadores (`***.***.***-09`) e a conta de destino aos seus últimos dígitos, com a agência omitida
  (`***149-4`) — o suficiente para distinguir duas pessoas homônimas e para ver que uma conta mudou, não
  o suficiente para identificar ou pagar alguém.
- **Não mascarado, de propósito: nome, valor, data de pagamento, segmento.** Eles *são* a base da
  decisão. Mascará-los tornaria a página inútil — e uma etapa de aprovação inútil é um resultado de
  segurança pior do que uma que divulga dados, porque passa a ser aprovada no automático.
- **Mascaramento não é autenticação e não é oferecido como tal.** Ele limita o que um estranho com o
  link descobre; não impede que ele descubra. Duas contas que diferem apenas nos dígitos iniciais ficam
  idênticas depois de mascaradas.

Duas capacidades são negadas em toda superfície de aprovação — a página anônima, o portal e a página do
job que um aprovador pode abrir:

- **Sem download do arquivo bruto.** A tabela renderizada é limitada e serve à decisão; o arquivo é um
  dump completo, legível por máquina, do CPF e da conta bancária de cada beneficiário, em um formato
  feito para processamento em lote. O `GET /api/jobs/{id}/output` exige credenciais de operador. O mesmo
  vale para o **arquivo compactado de saídas assinadas** do operador — `GET /api/jobs/archive`, um ZIP
  com os arquivos assinados de vários jobs `Completed`, oferecido na página Jobs —, que nenhuma credencial
  de aprovador satisfaz: são os mesmos arquivos que o operador já coleta do `output/`, vários de uma
  vez, e isso não muda quem pode ter acesso aos bytes. Desmascarar a tabela para um aprovador
  identificado **não** liberou os bytes.
- **Sem índice *anônimo* de aprovações pendentes.** O portal do aprovador é um índice, mas é protegido por
  uma política de autorização e lista apenas os jobs cujo pool congelado inclui a pessoa que o está lendo.
  Ninguém abaixo de um operador consegue obter o mapa de todo arquivo de pagamento na fila.

### A exportação da fila está do outro lado dessa regra, não é uma exceção a ela

Um aprovador pode baixar a aba do portal que está lendo como uma pasta de trabalho `.xlsx`, protegida
pela política `Approver` e com sua própria cota de limite de requisições. A distinção em relação ao
download negado é **a unidade do que sai**:

- **O download bruto negado** é cada beneficiário de um arquivo de pagamento — nome, CPF/CNPJ, agência,
  conta — em um formato feito para máquinas.
- **A exportação da fila** é uma linha por *arquivo* de pagamento: nome do arquivo, perfil, status, nome
  e CPF/CNPJ do pagador, total geral, contagens de pagamentos e exclusões, maior pagamento individual,
  timestamps, a contagem de aprovações e a decisão do próprio leitor. **Nenhuma linha de pagamento
  chega a ela** — nenhum nome de beneficiário, identificação fiscal, agência ou conta aparece na pasta
  de trabalho.

Ela é delimitada pela sessão e por nada mais: não há valor de rota, parâmetro de consulta (query) ou
header pelo qual um chamador pudesse exportar como outra pessoa, e a chave de API de um operador ou seu
cookie de dashboard não dão acesso a ela. É somente leitura e registrada para auditoria como uma linha de
log que indica a lista, a contagem de linhas e o endereço mascarado do aprovador.

A exportação **do operador** — `GET /api/jobs/export`, o *Exportar para Excel* da
[página Jobs](dashboard.md#jobs--jobs) — tem o mesmo formato do lado da outra credencial: uma linha por job,
todo valor tirado da linha do job, nenhuma linha de pagamento, protegida pela política de operador e não
oferecida em nenhuma superfície de aprovação. Ela muda apenas o formato de uma lista que o operador já
vê, e não quem pode ter acesso a ela.

:::warning
Uma pasta de trabalho é uma cópia repassável que o produto não consegue recolher. Linhas no nível do job
ainda identificam os arquivos de pagamento de uma empresa, seus valores e sua identificação de pagador. O
limite de requisições restringe a rapidez com que cópias podem ser feitas; nada restringe o que acontece
com uma delas.
Trate uma pasta de trabalho como você trata os próprios arquivos de pagamento.
:::

### O portal do aprovador, e quanto vale um link durável

Quando `ApproverPortal:Enabled` está ligado, cada aprovador de um pool tem uma URL pessoal permanente,
trocada uma vez por dispositivo por um cookie de sessão, que abre uma fila restrita aos pools de que ele
participa.

- **O link é uma credencial de portador (bearer) sem expiração.** Ele é substancialmente mais forte que o link por
  job em um aspecto — o detentor não pode decidir *como outra pessoa*, porque o portal não oferece campo
  de endereço — e mais fraco em outro: ele não expira com um arquivo de pagamento.
- **Distribua-o como uma senha.** Um link por pessoa, enviado privadamente. A página **Sistema** os
  mostra como campos somente leitura para copiar, e não como links clicáveis.
- **Um pool é editado na página do perfil e em nenhum outro lugar.** Nenhuma rota grava um pool, porque
  uma chave capaz de acrescentar um endereço a um pool de aprovação de pagamentos é uma chave capaz de
  aprovar pagamentos. Como os perfis ficam no banco operacional, editar
  `Signing:Profiles[].Approval.Approvers[]` na configuração **não revoga ninguém** — essa seção é um seed
  inerte depois do primeiro boot.
- **Revogar uma pessoa** significa removê-la do pool de aprovadores de todo perfil, na página do perfil.
  A resolução lê os pools como estão no banco naquele momento, então o token dela deixa de ser resolvido
  de imediato, sem reinício. Desabilitar um perfil não revoga ninguém — só a remoção revoga. **Revogar todo
  mundo** significa mudar o `ApproverPortal:LinkSecret`.
- **Uma sessão já obtida pela troca é uma credencial separada, que nenhuma dessas duas medidas
  alcança.** Ela dura `ApproverPortal:SessionLifetime` (30 dias por padrão) com expiração **deslizante**,
  então a sessão de um aprovador que continua usando o portal nunca expira, e mudar o `ApproverPortal:LinkSecret` revoga links, não
  cookies. O que uma sessão assim ainda pode decidir continua limitado pelo snapshot de aprovação
  congelado de cada job. Para encerrar uma antes, encurte o tempo de vida da sessão ou rotacione o
  [key ring de sessão](#o-key-ring-de-sessão-e-onde-ele-fica) — o que desconecta os operadores também.
- **O `ApproverPortal:LinkSecret` é o segredo mais valioso que esta funcionalidade introduz.** Lê-lo
  equivale a ter o link de todo aprovador. Defina-o por variável de ambiente, mantenha-o fora do
  controle de versão e faça a rotação dele se suspeitar de exposição. Mínimo de 32 caracteres, exigido no
  boot.
- **A sessão tem um esquema de autenticação próprio.** A chave de API ou o cookie de dashboard de um
  operador não abrem o portal, e a sessão de um aprovador não satisfaz nenhuma política de operador — com
  uma exceção deliberada: `/jobs/{id}`, protegido por uma política própria, acessível somente para jobs
  cujo pool congelado inclui o aprovador, e com os CPFs do pool e as ações **Tentar novamente** /
  **Cancelar** / **Baixar arquivo de saída** todos ocultos. Desde a 2.9.0, essa página não exibe link de
  aprovação por job para leitor **nenhum**; antes, ele era ocultado dos aprovadores como um controle de
  **quórum**, porque permite a quem o tem aprovar como qualquer membro do pool.
- **A aba *Aprovados* é limitada** pelo `ApproverPortal:DecidedLookback` (90 dias por padrão), que é o que
  impede um link roubado de valer todo o histórico de pagamentos de uma implantação.

### Não existe endpoint REST de aprovação

O estado de aprovação é **legível** por REST — o `GET /api/jobs/{id}` traz um resumo `approval` e o
`GET /api/jobs/{id}/approvals` retorna o pool congelado e a lista de decisões, ambos protegidos pela
política comum de chave de API ou cookie. Em uma decisão registrada por assinatura, um objeto
`certificate` traz o titular, o emissor, o número de série e o thumbprint, o CPF do certificado mascarado e seu CNPJ
inteiro; `null` em uma decisão por clique. **Nenhuma rota REST *autenticada* registra uma decisão**, e
essa assimetria é uma decisão de projeto, e não uma lacuna na superfície. Protegida pela chave de API,
essa rota seria *pior* que a página não autenticada: a chave já fica na configuração de um ERP, em um
pipeline de implantação e em um arquivo de configurações de produção, então "um aprovador decidiu"
significaria "alguma coisa que tem a credencial de operador decidiu".

A única rota que de fato registra uma decisão, `POST /api/approvals/{id}`, é anônima e concede a mesma
capacidade que o link de aprovação. Habilitar o segundo fator **a retira por completo** em vez de
autenticá-la, pelo mesmo motivo — veja [abaixo](#o-segundo-fator-e-quanto-ele-vale).

Uma aprovação **assinada** está do mesmo lado da linha. Nenhuma rota aceita uma assinatura: a assinatura
é feita pelo navegador, a partir do portal ou da página por job com uma sessão de aprovador, e a única
rota de navegador envolvida é o callback de assinatura em nuvem abaixo.

### O callback de assinatura em nuvem é um GET que altera estado, deliberadamente

Quando um aprovador assina com um certificado mantido por um provedor de nuvem, pelo Lacuna CloudHub
(acrescentado na 2.7.0), o provedor manda o navegador dele de volta para
`GET /approvals/cloud/return?state=…&session=…`, e toda a aprovação assinada é executada nessa
requisição. Um redirecionamento de provedor só pode ser um `GET`, então a rota altera estado em uma
requisição desse tipo, e quatro mecanismos substituem as garantias que um `POST` daria:

- **A rota exige a sessão de aprovador** — o cookie do portal ou um aprovador do Entra, nunca uma
  chave de API e nunca anônima. Os dois cookies são `SameSite=Lax`, e é por isso que uma navegação de
  nível superior (top-level) que volta do provedor os envia. Sem a sessão, a rota responde com o caminho
  de login do aprovador **puro**, sem endereço de retorno, para que o valor de `session` nunca vá parar
  no histórico do navegador.
- **O valor de `state` é um token aleatório criado quando o aprovador escolheu a nuvem**, armazenado na
  requisição pendente e em nenhum outro lugar, e confrontado com uma requisição que precisa indicar o
  mesmo aprovador que o cookie indica. Um link forjado traz o cookie da vítima, mas não um token emitido
  pela requisição dela; um token roubado não vem acompanhado de cookie. Nos dois casos, há uma única
  recusa genérica, com redirecionamento ao portal e nada registrado — o portal informa uma vez que a
  assinatura não pôde ser associada (`?cloud=unmatched`, nunca o motivo). Os quatro motivos — desconhecido, de outro aprovador, já
  consumido, com mais de quinze minutos — são distinguidos apenas no log. A requisição é reivindicada
  antes de a assinatura ser executada, então um callback repetido (replay) é recusado, em vez de ser
  executado duas vezes.
- **O valor de `session` é um token de portador da sessão do CloudHub** — quem o tem pode assinar com o
  certificado que o provedor abriu —, então nenhuma resposta de erro repete o endereço da requisição e
  nenhum dos dois valores da query string chega a uma linha de log.
- **A `CloudHub:ApiKey` é um segredo**, diferentemente da licença do Web PKI: uma credencial de portador
  para toda sessão que este host cria. Defina-a pela variável de ambiente em uma instalação como serviço; ela é
  registrada nas duas camadas de mascaramento. Veja [Configuração](configuration.md).

A sessão do CloudHub é criada com o CPF congelado para o aprovador naquele arquivo — o aprovador não
digita nenhum CPF e não consegue, a partir deste produto, abrir uma sessão com o CPF de outra pessoa — e o
certificado que volta é verificado exatamente como o de um navegador: cadeia, validade, revogação, CPF
presente, CPF do membro congelado, tudo antes de qualquer coisa ser assinada. O resultado é mostrado uma
vez na página de onde o aprovador saiu; não há página de resultado nem resultado em uma URL.

:::note Corrigido na 2.14.0
Quando a leitura de um certificado em nuvem falhava, o motivo registrado em Warning, gravado no destino
de log em tabela e mostrado ao aprovador citava o endereço da requisição — cuja query string é o id de
sessão do CloudHub, um token de portador que permite assinar com o certificado em nuvem do aprovador até
o CloudHub expirá-lo. Agora o motivo identifica a chamada pelo caminho e pelo status, e o id de sessão é
mascarado onde quer que as mensagens do próprio CloudHub possam repeti-lo.
:::

### A sessão do CloudHub de uma aprovação em lote fica retida, criptografada, por alguns minutos

Um lote aprovado com um certificado em nuvem (acrescentado na 2.14.0) volta pelo mesmo callback, com as
mesmas recusas, mas o callback **não assina nada**: ele armazena o valor de `session` no lote pendente do
aprovador e redireciona para o portal, que executa o lote. Durante esses minutos, o banco guarda um token de
portador capaz de assinar com o certificado em nuvem do aprovador, e três mecanismos o limitam:

- **Ele é criptografado com o key ring de sessão** em que os cookies de aprovador já se apoiam, com um
  propósito (purpose) próprio. Sem `Cluster:Enabled`, o ring fica em `keys/`, fora do arquivo de banco,
  então um backup ou um banco copiado nesses minutos não traz o que o abre. No modo cluster, o ring é um
  conjunto de linhas no mesmo banco, e uma cópia do banco o abre — a mesma cópia já permite forjar o
  cookie de um aprovador.
- **Ele é apagado no momento em que o lote é reivindicado.** O portal reivindica o lote com uma
  atualização que só tem sucesso para um único chamador e esvazia a coluna na mesma gravação; a partir
  daí, a sessão fica apenas na memória, durante uma execução. Um lote que não volta em quinze minutos não aprova
  nada, e sua sessão também é apagada.
- **O tempo de vida da própria sessão é um pedido, e não uma garantia.** O produto pede ao CloudHub uma
  sessão de quinze minutos; o CloudHub repassa isso ao provedor e não consegue encerrar uma sessão antes do
  prazo. Uma sessão que um provedor concedeu por mais tempo continua válida lá depois de o produto a ter
  descartado — e é por isso que o limite efetivo é o que o próprio produto impõe.

A assinatura em nuvem de um único arquivo nunca retém a sessão: ela é executada na requisição de
callback, como descrito acima, em uma sessão que só consegue assinar uma vez.

### O segundo fator, e quanto ele vale

O `ApproverSecondFactor:Enabled` acrescenta um pedido de TOTP antes da decisão de um aprovador, uma vez
por janela de verificação por sessão de navegador. O que ele resolve é precisamente a **sessão sem
supervisão**: uma máquina deixada autenticada, ou um link de portal lido por quem não deveria tê-lo, não
decide mais por conta própria. A janela é absoluta e pertence ao navegador, e não à pessoa — é isso que
garante esse efeito. Com o login pelo Entra, sair apaga a janela da sessão, de modo que o novo login
silencioso de um colega em uma estação compartilhada começa sem ela.

Três limites para ter em mente, porque cada um é uma garantia que este controle **não** oferece:

- **Ele não impede que um operador se passe por aprovador.** TOTP é simétrico: um operador pode ler todo
  link de aprovador e redefinir toda inscrição, então um operador ainda pode ser qualquer aprovador. O que
  resolve isso é material de chave que só o aprovador tem: em um perfil cujo conjunto de assinantes
  inclui os aprovadores, cada aprovação é uma assinatura ICP-Brasil verificada em relação ao CPF do pool
  congelado, que um operador não consegue produzir — e uma aprovação assinada assim satisfaz o segundo
  fator por si só. Em um perfil cujas aprovações são por clique, o segundo fator não deve ser descrito
  como se tivesse resolvido isso.
- **Ele não reduz o que um link repassado divulga.** Com o fator ligado, um leitor não identificado
  de `/approve/{jobId}` obtém a mesma visão somente leitura com o mesmo mascaramento de antes — apenas a
  *capacidade* de decidir é retirada.
- **Ele retira o `POST /api/approvals/{id}` por completo** em vez de condicioná-lo, porque somente uma
  sessão de navegador pode demonstrar uma presença comprovada. Veja
  [Aprovações](approvals.md#provando-que-é-você).

**O `ApproverSecondFactor:SeedSecret` é um segredo sem procedimento de rotação.** Ele é a chave com a
qual a semente do autenticador de cada aprovador é criptografada em repouso (PBKDF2-HMAC-SHA256 →
AES-256-GCM), tem no mínimo 32 caracteres e é obrigatório sempre que o fator está ligado — o banco pode
ser o próprio SGBD do cliente, então as sementes nunca ficam em texto claro nele. As sementes são
aleatórias por aprovador, e não derivadas, então ter o primeiro fator não permite gerar o segundo.
**Perdê-lo ou mudá-lo significa que todo aprovador precisa se inscrever de novo**, o que é uma operação
coordenada, e não uma simples edição de configuração. Forneça-o por variável de ambiente e guarde-o com
o mesmo cuidado do `ApproverPortal:LinkSecret`.

### Uma aprovação é vinculada a bytes

Imediatamente antes de assinar, o hash da cópia em staging é recalculado e comparado com o hash
registrado no momento da interpretação. Uma divergência faz o job falhar com `approval.content-changed` —
nunca uma reinterpretação silenciosa, nunca um prosseguimento. Sem isso, "estas pessoas autorizaram este
arquivo de pagamento" deixaria de ser verdade exatamente no momento em que uma assinatura o torna
definitivo.

Em um perfil cujo conjunto de assinantes inclui os aprovadores, o vínculo é **também criptográfico**: a
própria chave de cada aprovador assina os bytes em staging, e a etapa de assinatura só promove o
resultado se a verificação encontrar **exatamente** os certificados dos aprovadores registrados, por
thumbprint, mais a chave do perfil quando a regra congelada assim determina — a falta de um assinante faz
o job falhar, e um assinante a mais também.

## Envelope de erro REST — o que é e o que não é exposto

Toda resposta de erro traz um slug estável legível por máquina na extensão `code` (por exemplo
`job.not-found`, `upload.too-large`, `rate-limited`, `auth.invalid-credentials`, `internal`). Veja
[API REST](rest-api.md) para a tabela completa.

Em `Production`:

- O componente que personaliza os erros remove `detail`, `instance` e qualquer extensão além de `code`,
  `traceId`, `requestId`, `errors`. Nenhum stack trace chega aos clientes.
- `code = "internal"` é aplicado às respostas 500 geradas pelo framework, `code = "auth.invalid-credentials"`
  às 401 e `code = "rate-limited"` às 429.

Em `Development`, os detalhes completos (inclusive mensagens de exceção) são repassados para facilitar a
depuração — **nunca execute com `ASPNETCORE_ENVIRONMENT=Development` em um host de produção.**

## Exposição de rede

- O serviço escuta em HTTP puro em `0.0.0.0:8080` por padrão — termine o TLS em um proxy reverso
  (nginx, IIS, Traefik).
- `Hosting:RequireHttps = true` ativa o redirecionamento HTTPS no próprio processo; combine-o com uma
  configuração de certificado no Kestrel.
- O banner de resumo de prontidão na inicialização imprime `https redirect = on/off`, de modo que uma
  chave digitada errado aparece imediatamente.
- O `/api/metrics` é protegido pela mesma política por padrão (`Metrics:RequireApiKey = true`).
  Defina-o como `false` somente quando o coletor Prometheus estiver dentro do perímetro de confiança.
- O `/api/ready` é anônimo por padrão e não traz detalhes; o
  [`Readiness:RequireApiKey = true`](#prontidão-o-veredito-é-anônimo-o-diagnóstico-não) o protege onde o
  probe consegue enviar a chave.
- `Upload:Enabled = false` remove a superfície de upload: o `POST /api/files` responde
  `409 upload.disabled` antes de resolver um perfil, e a página **Jobs** não exibe o botão de upload. O
  host passa então a receber arquivos apenas de suas pastas monitoradas.
- O limite de requisições vem ligado por padrão (`RateLimiting:Enabled = true`). Desabilite-o apenas em
  instalações em rede fechada.

### Em qual endereço de cliente o produto acredita

Duas coisas dependem do endereço do cliente; por isso, atrás de um proxy ou balanceador de carga, isto
é uma configuração de segurança, e não um detalhe: a **partição do limite de requisições** e o
**endereço registrado em cada aprovação** — um dos controles compensatórios da rota de aprovação
anônima. Atrás de um proxy sem tratamento de headers encaminhados, todo chamador chega de um único
endereço: a cota por cliente vira uma única cota compartilhada pelo mundo inteiro, e o endereço
registrado não diz nada sobre quem decidiu.

O `Hosting:ForwardedHeaders:Enabled = true` corrige isso, e **exige um conjunto de confiança** — um de
`TrustAnyProxy`, `KnownProxies` ou `KnownNetworks`, ou o boot é recusado em vez de adotar por padrão a
opção mais ampla. Duas regras que vale deixar claras:

- **`TrustAnyProxy = true` é correto no Azure App Service e perigoso em um proxy reverso.** O front end
  do App Service não tem endereço estável a listar; uma implantação com proxy reverso que confia em
  qualquer um significa que quem alcançar o Kestrel diretamente pode se declarar qualquer endereço de
  cliente. Restrinja o acesso à origem se usar essa opção — veja
  [Azure App Service](azure.md#entrada--front-door-na-frente-do-app).
- **Definir o `ASPNETCORE_FORWARDEDHEADERS_ENABLED` do framework ao lado dele é recusado no boot.** Cada
  um acrescenta seu próprio processamento, então os headers seriam tratados duas vezes e um
  `ForwardLimit` de 1 aceitaria silenciosamente dois saltos.

O banner de resumo de prontidão imprime `forwarded headers = …` indicando o conjunto de confiança, e não
apenas `on`. No
[modo cluster](high-availability.md#as-cotas-do-limite-de-requisições-são-por-instância-então-o-limite-efetivo-é-n),
lembre-se de que cada instância aplica sua própria cota, então o limite efetivo por cliente é ×N.

## Postura forense

- **Trilha de auditoria.** Toda transição de estado grava uma entrada de histórico de job no banco
  operacional; toda pausa/retomada, edição de perfil, decisão de aprovação e Limpar Jobs grava um evento
  operacional. Esses registros persistem após reinicializações e sobrevivem à desinstalação (a menos
  que `--purge` seja usado), e desde a 2.13.0 os eventos são legíveis por operadores na página `/events` e
  pelo `GET /api/events`.
- **O que os remove.** Dentro do produto, apenas uma ordem do operador. O **Limpar Jobs** apaga toda linha
  de job e todo evento operacional registrado antes de a limpeza começar, e grava um evento
  `JobsCleared` — quem, quando e quantos itens de cada tipo foram apagados — como registro do corte. **Excluir um
  job** remove as linhas daquele job e mantém todo evento, acrescentando um `JobDeleted` que resume as
  aprovações que ele tinha; não há rota REST para isso, então uma chave de API vazada não consegue
  usar essa ação. Veja
  [Retenção](retention.md#o-que-um-operador-pode-apagar-limpar-jobs-e-exclusão-de-job).
- **Correlação por requisição.** As respostas de erro incluem `traceId` e `requestId`; os mesmos ids
  aparecem nos logs de arquivo, de modo que falhas do lado do cliente possam ser rastreadas até a linha
  que as gerou.
- **Backup antes de atualizar — e antes de um Limpar Jobs.** Sempre faça backup do banco operacional antes
  de uma atualização: a migração é executada na inicialização e é de mão única. Com `Sqlite`, o serviço
  pode fazer o backup para você; caso contrário, copie o `db/bulksigner.db` com o serviço parado. Um
  artefato de backup é uma cópia completa da trilha de auditoria, então herda a sensibilidade do banco
  onde quer que vá parar.

---

**A seguir:** [Operação](operations.md) — operação do dia a dia e o ciclo de vida do job.
**Anterior:** [Certificados](certificates.md).
