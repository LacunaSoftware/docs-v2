---
sidebar_label: "Diagnóstico de problemas"
sidebar_position: 16
---

# Diagnóstico de problemas

Um guia prático dos modos de falha mais comuns na operação. Cada entrada traz o sintoma, a causa raiz
mais provável e os comandos para diagnosticar.

Se o bootstrap falhar, o banner de resumo de prontidão **não** é impresso — o serviço encerra antes de
chegar a ele. Procure a exceção de bootstrap no local de log de cada alvo:

| Alvo | Onde procurar |
|------|------------|
| Linux | `journalctl -u bulksigner -n 200` |
| Windows | Visualizador de Eventos → Logs do Windows → Aplicativo (origem `Lacuna.BulkSigner`) — as exceções de bootstrap são registradas ali antes de o destino de log em arquivo estar configurado |
| Docker | `docker compose logs bulksigner --tail=200` |
| Console | A saída do terminal |

## O serviço não inicia

:::warning Mudou na 2.1.0 — um certificado que não abre não impede mais o host de iniciar
Os perfis de assinatura ficam no banco de dados operacional, e um certificado com problema é corrigido na
própria página do perfil no dashboard. Um host que se recusasse a iniciar não conseguiria servir essa
página; por isso, um perfil cujo certificado não pode ser aberto — um arquivo ausente, uma senha errada, um
thumbprint que não corresponde a nada, um Key Vault inacessível ou sem autorização, um blob ilegível —
agora aparece como **`DEGRADED`** e o host inicia. Só esse perfil fica sem assinar; os jobs dele falham
com `profile.degraded` (veja [Um job falha com `profile.degraded`](#um-job-falha-com-profiledegraded)),
e todos os outros perfis continuam funcionando.

O que ainda impede o boot é a *validação* da configuração: as regras abaixo, verificadas no arquivo de
configuração ou no ambiente — a licença do PKI, o formato do bloco `Blob`, um PIN de PKCS#11 gravado em
arquivo, uma origem de repositório do Windows em um host não Windows e as verificações de uma seção
`Signing:Profiles[]` importada em um primeiro boot. As mesmas regras recusam um salvamento na página do
perfil.
:::

### `Signing:PkiSdkLicense is required`

**Sintoma.** O bootstrap lança uma exceção de validação sobre `Signing:PkiSdkLicense`.

**Causa raiz.** Nem `Signing__PkiSdkLicense` (ambiente) nem `Signing:PkiSdkLicense` (configuração)
tem um valor preenchido.

**Correção.** Defina a variável de ambiente no alvo de instalação:

| Alvo | Comando |
|------|---------|
| Linux | Acrescente `Signing__PkiSdkLicense=<base64>` a `/etc/bulksigner/bulksigner.env`, então `sudo systemctl restart bulksigner`. |
| Windows | `[Environment]::SetEnvironmentVariable("Signing__PkiSdkLicense", "<base64>", "Machine"); Restart-Service LacunaBulkSigner` |
| Docker | Acrescente `Signing__PkiSdkLicense=<base64>` a `deploy/docker/.env`, então `docker compose up -d`. |

### `Signing:TrustLacunaTestRoot is true while the environment is 'Production'`

**Sintoma.** O boot é recusado com essa frase, que termina em "unset the key, or run the homologation
host as Staging (ASPNETCORE_ENVIRONMENT=Staging)".

**Causa raiz.** O host foi instruído a confiar na raiz PKI de **teste** da Lacuna — a emissora dos
certificados de teste Turing / Fermat (veja [Certificados](certificates.md#certificados-de-teste-e-o-conjunto-de-confiança)) — e, ao mesmo tempo, se declara
de produção. A combinação é recusada de propósito: um host de produção nunca confia em uma raiz que não
é uma autoridade certificadora. No Azure App Service, o nome do ambiente é `Production` por padrão quando
nada o define; por isso, um host de homologação que copiou um bloco de configurações de produção e
acrescentou a chave cai neste caso.

**Correção.** Uma de duas, conforme o papel do host:

- Host de produção: remova `Signing__TrustLacunaTestRoot` (ou defina-a como `false`). Certificados reais
  não precisam de nada.
- Host de homologação: defina `ASPNETCORE_ENVIRONMENT=Staging` junto com a chave. Qualquer nome diferente
  de `Production` é aceito; as linhas `environment` e `trust set` do banner passam a mostrar o papel do host.

### `Auth:ApiKey is required`

**Sintoma.** O bootstrap lança um erro sobre `Auth:ApiKey`.

**Causa raiz.** Não há valor, ou o valor tem menos que o mínimo de 16 caracteres.

**Correção.** Gere uma chave forte (veja [Segurança](security.md#rotação-da-chave-de-api)) e defina a
variável de ambiente correspondente.

:::note Depois de atualizar para a 2.3.1 ou posterior
Imagens anteriores à 2.3.1 traziam uma chave de API provisória no próprio arquivo de configurações
padrão. Uma implantação que nunca definiu `Auth:ApiKey` estava rodando, sem aviso, com esse valor
provisório e, após a atualização, se recusa a iniciar, indicando a chave. Defina `Auth__ApiKey` como
documentado em todos os caminhos de instalação.
:::

### `Pkcs11 PIN env var <nome> is empty`

**Sintoma.** O serviço inicia, mas o perfil aparece como `DEGRADED` — no banner de inicialização, em
`/profiles` e em `/api/ready/details` — com o motivo
`PKCS#11 PIN environment variable '<nome>' is empty`. Antes da 2.1.0, isso impedia o boot.

**Causa raiz.** `Signing:Certificate:Source = Pkcs11`, mas a variável de ambiente configurada não está
definida ou está vazia.

**Correção.** Defina a variável de ambiente indicada em `Signing:Certificate:Pkcs11:PinEnvVar` (padrão
`BULK_SIGNER_PKCS11_PIN`) e reinicie. Veja [Certificados](certificates.md#tratamento-do-pin).

### `WindowsStore source is not supported on this OS`

**Sintoma.** O bootstrap falha imediatamente em um host Linux ou Docker.

**Causa raiz.** `Signing:Certificate:Source = WindowsStore` configurado em um host não Windows.

**Correção.** Troque a origem. No Linux / Docker, use `Pfx`, `Pkcs11` ou `AzureKeyVault`.

### `AzureKeyVault:Endpoint must be an absolute https:// URL`

**Sintoma.** O bootstrap falha ao validar o bloco do Azure Key Vault.

**Causa raiz.** `Signing:Certificate:AzureKeyVault:Endpoint` recebeu apenas um nome DNS
(`my-vault.vault.azure.net`) ou uma URL `http://`. O conector precisa da URL completa do cofre; sem esta
verificação, um nome sem esquema falharia no interior do cliente do Azure, com uma mensagem bem menos útil.

**Correção.** Use a URL do cofre exatamente como o portal do Azure a mostra, por exemplo
`https://my-vault.vault.azure.net/`.

### `Certificate '<caminho>' does not match Azure Key Vault key '<nome>'`

**Sintoma.** O banner de inicialização mostra o perfil como `DEGRADED`, com um motivo dizendo que a
chave pública do certificado difere da chave do cofre, e os jobs do perfil falham com `profile.degraded`.
(Antes da 2.1.0, isso impedia o boot.)

**Causa raiz.** `CerPath` — ou `Blob:Url`, quando o certificado é lido
[de um blob](certificates.md#lendo-o-arquivo-de-um-blob) — e `KeyName` se referem a pares de chaves
diferentes. Em geral, o certificado foi renovado com uma **nova** chave do cofre enquanto o `KeyName`
ainda aponta para a antiga, ou, após uma edição, o local do certificado ficou apontando para um certificado
sem relação com a chave. A mensagem indica o local que o perfil usa, como `file '<caminho>'` ou
`blob '<conta>/<container>/<blob>'`.

Esta verificação existe porque a alternativa é pior: sem ela, o perfil assinaria normalmente e produziria
assinaturas que nenhum verificador aceita, e a falha só apareceria job a job — e apenas em perfis com
`Verify = true`.

**Correção.** Descubra qual lado está desatualizado comparando diretamente as duas chaves públicas:

```bash
openssl x509 -in signer.cer -noout -pubkey
az keyvault key download --vault-name my-vault --name bulk-signer-signing-key --encoding PEM --file -
```

Os dois blocos PEM precisam ser idênticos byte a byte. Depois, corrija o lado errado — o local do
certificado ou o nome da chave são corrigidos na página do perfil, em **Editar certificado** — e
reinicie.

### Falha de autenticação ou autorização no Azure Key Vault na inicialização

**Sintoma.** O banner de inicialização mostra o perfil como `DEGRADED` ao carregar o certificado, com um
erro do Azure como `AADSTS7000215` (client secret inválido), `AADSTS700016` (aplicativo não encontrado) ou
um `Forbidden` na operação de chave. O host inicia; os jobs do perfil falham com `profile.degraded`. (Antes
da 2.1.0, isso impedia o boot.)

**Causas possíveis.**

- **Client secret expirado.** Os segredos do Entra ID têm validade limitada; a expiração aparece como uma
  falha repentina de boot depois de uma reinicialização que antes funcionava. Gere um novo segredo no Azure
  e atualize `Signing__Certificate__AzureKeyVault__AppSecret`.
- **`AppId` errado**, ou o registro de aplicativo está em um tenant diferente do cofre.
- **Permissões de chave ausentes.** O registro de aplicativo precisa de *get* na chave e da operação
  criptográfica *sign* — a role interna **Key Vault Crypto User** em um cofre com RBAC. Um `Forbidden`
  com credenciais que, fora isso, são válidas aponta para esta causa.
- **Sem rota de rede.** O host precisa acessar `*.vault.azure.net` e `login.microsoftonline.com`.
  Confira as regras de saída e a configuração de proxy.

As falhas são informadas por perfil, e todos os perfis com falha aparecem no mesmo banner; assim, uma
implantação com vários perfis vê todos os perfis mal configurados em um único boot, em vez de um a cada
reinicialização. Depois de corrigir o segredo ou a atribuição de role, **reinicie** — o certificado é
aberto uma única vez, na inicialização.

### Um blob de material de assinatura não pode ser lido na inicialização

**Sintoma.** O banner de inicialização mostra um perfil como `DEGRADED`, citando um blob no formato
`<conta>/<container>/<blob>`. **O host inicia.** O perfil não consegue assinar até que o blob esteja
legível e o serviço seja reiniciado; os demais perfis não são afetados, e os jobs roteados para este falham
com `profile.degraded`.

:::warning Mudou na 2.1.0
Antes da 2.1.0, um blob ilegível impedia o boot. Agora ele degrada apenas esse perfil, pelo motivo
explicado no início desta seção.
:::

São três mensagens distintas, porque cada uma tem uma correção diferente:

| Mensagem | Causa raiz | Correção |
|---|---|---|
| `… does not exist` | O nome do container ou do blob está errado. Ambos diferenciam maiúsculas de minúsculas, e a URL é lida exatamente como foi escrita. | Corrija `Blob:Url`. Confirme com `az storage blob exists --account-name <a> --container-name <c> --name <b>`. |
| `… credential was refused (HTTP 403)` | A credencial foi autenticada, mas não tem permissão para ler o blob. | Para `ManagedIdentity` / `ServicePrincipal`, conceda **Storage Blob Data Reader** no container ou na conta — nunca é necessário nada mais amplo. Para `AccountKey`, a chave está errada ou foi rotacionada. |
| `… the <modo> credential could not be obtained` | Não foi possível obter a credencial, antes mesmo de qualquer requisição. | `ManagedIdentity`: o host precisa de uma identidade **atribuída pelo sistema**, e um host fora do Azure não tem nenhuma. `ServicePrincipal`: confira `TenantId` / `AppId` / `AppSecret` — um segredo expirado produz exatamente a mesma mensagem. |

Qualquer outro erro (um 5xx, uma falha de transporte) é informado com o status que o serviço retornou e
indica um problema de conectividade: o host precisa de HTTPS de saída para o endpoint de blob. A leitura
já passou por três novas tentativas com backoff exponencial, então uma falha momentânea não chega a gerar
esta mensagem.

**A renovação não se resolve sozinha.** O blob é lido uma única vez, no boot; por isso, substituir o
conteúdo dele exige uma reinicialização, exatamente como substituir um arquivo local — e corrigir o blob
não tira do estado degradado um host em execução.

### O logotipo do cliente não aparece nas páginas de login ou de aprovação

O serviço está no ar, mas as páginas mostram apenas a marca do produto. Isso é intencional: um logotipo
configurado (`Branding:CustomerLogo`, veja [Configuração](configuration.md#branding--o-logotipo-do-cliente-nas-páginas-de-login-e-de-aprovação)) cujos **bytes** não puderam ser usados
não impede o serviço de iniciar. O motivo aparece em três lugares:

- na linha `customer logo` do banner de resumo de prontidão — `not loaded from file '…': <motivo>`;
- no log de inicialização, em um Warning com o texto `Customer logo not loaded from …`;
- na página **Sistema**, em um alerta no topo do painel de armazenamento.

O motivo é um destes: o arquivo ou blob está ausente ou não pode ser lido (confira o caminho, a montagem
no Docker, a atribuição de role do blob); o arquivo está vazio ou tem mais de **256 KiB** (exporte um
menor — ele é exibido com no máximo 80 px de altura); ou os bytes não correspondem à extensão (um JPEG
renomeado para `.png`, uma página HTML salva como `.svg` — renomeie ou exporte de novo). Corrija e
**reinicie**: o logotipo é lido uma única vez, no boot.

Se o serviço *não* iniciou, a mensagem cita `Branding:CustomerLogo:…` e uma das regras de formato: `Path`
e `Blob` definidos ao mesmo tempo, uma extensão fora de `.png` / `.jpg` / `.jpeg` / `.webp` / `.svg`, ou
um bloco de blob sem `Url` ou sem `Credential`. Esses casos são recusados no boot, como qualquer outro
erro de configuração.

### A inicialização é recusada porque `Signing:ProfileSecretsKey` não está definida

**Sintoma.** Uma de duas recusas — e qual delas aparece indica em que ponto a implantação está:

```
Refusing to start: this deployment's operational store holds signing profile secrets that were
encrypted under Signing:ProfileSecretsKey, and that key is not set. …
```

```
Refusing to start: signing profiles are being imported into the operational store for the first
time, and some of them carry a secret — 'folha', 'nfe' — while Signing:ProfileSecretsKey is not set. …
```

A primeira vem de um host que já guarda dados de perfil criptografados. A segunda é o **primeiro boot**
após uma atualização, recusando no exato momento em que esses dados passariam a existir — de modo que o
banco nunca chega a guardar um valor que nada consegue abrir. A segunda cita os perfis.

**Causa raiz.** Os perfis de assinatura são linhas no banco de dados operacional, e uma senha de PKCS#12,
um segredo de aplicativo do Key Vault, uma credencial de blob de material de assinatura e **bytes de
PKCS#12 enviados por upload** são criptografados em repouso com uma chave mantida *fora* do banco de
dados. A recusa só acontece com o **par** — dados criptografados e nada com que descriptografá-los —,
nunca com uma das metades sozinha. Uma implantação cujos perfis não têm segredo nunca precisa fornecer uma
chave, e é por isso que a maioria das instalações atualiza sem jamais passar por isto.

**Por que este caso recusa o boot, se um certificado com problema apenas degrada o perfil.** A correção
aqui é uma variável de ambiente, e não algo em uma página do dashboard; recusar, portanto, não cria um
impasse — e uma chave ausente desativaria de uma só vez todos os perfis com segredo, resultando em um host
que se declara saudável sem conseguir assinar para ninguém.

**Correção.** Defina a chave e inicie de novo:

```bash
Signing__ProfileSecretsKey='<o valor sob o qual os segredos foram salvos>'
```

Ela precisa ter o **mesmo valor** com o qual os segredos foram salvos — se você não o tem mais, veja
[Um perfil está degradado dizendo que um segredo armazenado não pôde ser descriptografado](#um-perfil-está-degradado-dizendo-que-um-segredo-armazenado-não-pôde-ser-descriptografado).
Mantenha-a fora do controle de versão, fora do backup que contém o banco de dados e no mesmo lugar em que ficam os
outros segredos irrecuperáveis (veja [Segurança](security.md#a-chave-de-segredos-dos-perfis-de-assinatura-signingprofilesecretskey)).

**Se a segunda recusa cita um perfil que você nunca declarou** — ou cita os seus junto com um que você não
declarou —, o host está lendo um array `Signing:Profiles[]` de um arquivo de configurações *abaixo* do seu.
A configuração mescla arrays por índice e consegue sobrescrever uma chave, mas nunca removê-la: as suas
configurações `Signing__Profiles__0__*` são mescladas sobre o que aquele arquivo declarar no índice 0 e
herdam todas as chaves que não definiram, inclusive uma senha de PFX. Imagens anteriores à 2.3.1 traziam,
dessa forma, perfis de exemplo de desenvolvimento no próprio arquivo de configurações padrão. Atualize a
imagem ou remova o arquivo que os declara. **Não resolva definindo a chave**: a importação acontece uma
única vez e nada exclui um perfil, então isso importaria os perfis indevidos para sempre. Nada foi
gravado — a recusa ocorre antes da importação —, então o próximo boot importa de forma limpa.

**Um aviso relacionado que não é esta recusa.** Se o banco operacional não respondeu na inicialização *e*
a chave não está definida, o host **inicia** e avisa que não conseguiu verificar se existem segredos de
perfil e que o próximo boot que conseguir acessar o banco pode ser recusado. Trate isso como um lembrete
para definir a chave antes de o banco voltar.

### `Encryption.Salt must decode to at least 16 bytes`

**Sintoma.** O bootstrap falha quando `Encryption:Enabled = true`.

**Causa raiz.** O salt em base64 configurado está ausente, malformado ou tem menos de 16 bytes depois de
decodificado.

**Correção.** Gere um novo com 32 bytes aleatórios (veja [Criptografia](encryption.md#gerando-o-salt)).

### `Encryption.Iterations must be at least 10000`

**Sintoma.** O bootstrap falha com uma mensagem de iterações baixas.

**Causa raiz.** Erro de digitação — `600` em vez de `600000` em `Encryption:Iterations`.

**Correção.** Use 600.000 (recomendação da OWASP de 2023) ou mais.

### O serviço inicia, mas o `/api/ready` retorna 503 persistentemente

**Sintoma.** O `Get-Service` mostra Iniciado / o `systemctl` mostra ativo, mas o `/api/ready` retorna
503.

**Causa raiz.** Um probe de prontidão está falhando. O corpo da resposta lista cada probe pelo nome, com
`ok` verdadeiro ou falso — banco de dados, pasta de entrada, licença.

:::warning Mudou na 2.6.0 — o detalhe foi para `/api/ready/details`
O `/api/ready` anônimo agora traz apenas o veredito: `ready` e, para cada verificação, o `name` e o `ok`.
O `detail` de cada verificação — que expunha o host do SQL Server, cada compartilhamento de entrada e o
local de um certificado degradado — fica em `GET /api/ready/details`, protegido pela chave de API
(`X-API-Key`) ou por uma sessão de operador, com a mesma regra de 200 / 503. Um monitor que lia o `detail`
na rota anônima passa a usar a rota de detalhes e a enviar o header. `Readiness:RequireApiKey = true`
coloca também o próprio `/api/ready` atrás da chave — deixe desligado onde o probe não consegue enviar o
header (o **Health check** do App Service não consegue).
:::

**Se o problema já tiver se resolvido** quando você for verificar, o log durável guarda o ocorrido: toda
mudança de veredito de uma verificação é registrada uma vez, como `Readiness check <nome> went red: <detalhe>`
em Warning e `Readiness check <nome> recovered` em Information. Um vermelho persistente é registrado uma
única vez, e não a cada consulta; por isso, busque pelo nome da verificação em vez de ler as últimas linhas.

**Correção.** Inspecione o `/api/ready/details` e, depois:

| Probe que falhou | Onde procurar |
|---------------------|------------|
| `database` | O detalhe indica o banco verificado — `SQLite (…)` ou `SQL Server (servidor/banco)`. Com `Sqlite`: a conta de serviço tem permissão de escrita no caminho dentro de `Storage:Root`? Com `SqlServer`: o servidor está acessível, e o login ainda autentica? Quando o detalhe diz `unreachable` com um tipo de exceção depois do nome do banco, o log durável registra essa exceção, com a mensagem, em Warning — uma linha por probe que falhou; leia a primeira. |
| `input-folder:<nome>` | A pasta existe? A conta de serviço tem permissão para listá-la? Semântica estrita — qualquer pasta ausente ou `Stopped` reprova a resposta inteira. |
| `storage-share:<conta>/<compartilhamento>` | Somente com compartilhamento de trabalho remoto. Credencial, conectividade de rede ou a string de escopo da atribuição de role — veja [Segurança](security.md#credenciais-de-armazenamento-do-azure-files). |
| `work-share-owner` | Somente com compartilhamento de trabalho remoto. Outra instância detinha o marcador na inicialização, ou não foi possível fazer a reivindicação. Veja abaixo. |
| `license` | A licença do PKI foi carregada? A impressão digital aparece no banner de resumo de prontidão; se estiver ausente, a string de licença foi rejeitada no boot. |

Algumas linhas informam `ok: false` **sem** transformar a resposta em 503, de propósito: um 503 tiraria a
instância do balanceador de carga, e o dashboard necessário para corrigir o problema é servido justamente
por essa instância. São elas: `signing-profile:<nome>` (um perfil degradado — veja
[Um job falha com `profile.degraded`](#um-job-falha-com-profiledegraded)), `profile-input-folder:<nome>`
(um perfil vinculado a uma pasta que este host não configura) e, no modo cluster, `cluster-instance` (uma
instância deslocada que está se retirando). Uma linha `signing-profile-keyless:<nome>` é `ok: true` por
design, e uma pasta de entrada que nenhum perfil escolheu aparece como verde. **Configure alertas para as
entradas individuais de `checks[]`, e não apenas para o booleano `ready` de nível superior.**

### A inicialização falha com `Signing:Profiles[N].Approval …`

**Sintoma.** O host se recusa a iniciar com uma mensagem que cita uma chave de aprovação.

**Quando isto pode acontecer.** Desde que os perfis passaram para o banco operacional (2.1.0),
`Signing:Profiles[]` só é importado no **primeiro boot com a tabela de perfis vazia**, e estas regras são
verificadas nesse momento. Depois disso, as mesmas regras recusam o salvamento do formulário
**Editar aprovação** do perfil no dashboard, com o mesmo texto; editar o arquivo de configuração não altera mais
nenhum perfil.

**Causas raiz**, todas recusadas antes de o primeiro job rodar:

| A mensagem cita | Correção |
|-------------------|----------|
| `Approval` sem `CheckCNAB240` | Acrescente `"CheckCNAB240": true` ao mesmo perfil. Um aprovador que não pode ver o valor não está aprovando nada de significativo. |
| Um pool `Approvers` vazio | O pool é obrigatório e não pode ser vazio quando `Approval` está presente. |
| `MinimumApprovers` abaixo de 1 ou maior que o pool | Um quórum maior que o pool nunca pode ser atingido, então todo job ficaria retido para sempre. |
| Um e-mail malformado, ou o mesmo e-mail duas vezes | Uma mesma pessoa em duas vagas do pool poderia atingir sozinha um quórum de dois. |
| Um CPF cujos dígitos verificadores não conferem | Um erro de digitação identifica outra pessoa, e a linha de auditoria resultante parece tão legítima quanto uma correta. |
| Um `ExpiresAfter` não positivo | Use o formato `d.hh:mm:ss`, por exemplo `"2.00:00:00"`. |

### A inicialização avisa `has an approval wait budget of …`, ou o prazo de um job retido está a semanas de distância

**Sintoma.** O banner avisa sobre um prazo de espera longo, ou o prazo de decisão de um job está muito
mais distante do que o pretendido.

**Causa raiz.** A forma de escrever o TimeSpan. Um valor de três componentes só é `hh:mm:ss` enquanto o
primeiro número for 23 ou menos; de 24 em diante, o .NET o lê como **dias**, então `"48:00:00"` são
quarenta e oito *dias*.

**Correção.** Escreva o componente de dias: `"2.00:00:00"` — no formulário **Editar aprovação** do perfil no
dashboard, já que depois do primeiro boot o arquivo de configuração não altera mais um perfil armazenado.
O boot é o único momento em que isso é sinalizado — as demais telas só mostram o prazo quando um job já
ficou retido com ele, e o prazo de espera fica congelado nesses jobs. A correção vale apenas para jobs
**novos**: cancele e processe de novo tudo o que já estiver retido com a janela errada.

### A inicialização é recusada porque tanto um caminho quanto um blob estão configurados

**Sintoma.** O boot falha dizendo que `Path`/`CerPath` e `Blob` são mutuamente exclusivos — ou que
nenhum dos dois está definido.

**Correção.** Defina exatamente um dos dois. Veja
[Certificados](certificates.md#lendo-o-arquivo-de-um-blob).

### A inicialização falha com uma mensagem de configuração do Azure Files

**Sintoma.** O boot falha citando uma chave de `Storage:AzureFiles` ou `Storage:Inputs[N]`.

**Causas raiz.** Um provider ou modo de credencial não reconhecido; um bloco de credencial incompleto para
o modo escolhido; um compartilhamento NFS (só SMB é aceito); um caminho `azurefiles://` em `Storage:Root`,
`Logging:File:Path` ou — com `Database:Provider = Sqlite` — `ConnectionStrings:Default`; uma barra
invertida no `Path` de uma pasta remota; `Directory` definido em uma pasta de entrada; uma pasta
`AzureFiles` que fica sem nenhum intervalo de polling; ou uma pasta de entrada cujo caminho
coincide com uma das raízes de trabalho (`output`, ou `prod/output` com um prefixo `Directory`).

Este último caso é recusado porque, do contrário, apagaria um artefato assinado a cada iteração enquanto
informaria todos os jobs como `Completed`.

### Uma implantação que antes iniciava agora é recusada, citando uma pasta de entrada monitorada

**Sintoma.** Após uma atualização, o boot falha citando um caminho de `Storage:Inputs[N]` que coincide com
uma das raízes de trabalho — `output/`, `processing/` ou `error/`.

**Diagnóstico.** Esta recusa vale para **todos** os providers de armazenamento, não apenas para o Azure
Files, e é uma mudança proposital: uma configuração assim monitorava o diretório em que grava os
artefatos finalizados; com isso, cada arquivo assinado era reingerido, assinado de novo e então
**apagado** como o "original" da iteração seguinte. A implantação parecia saudável e informava todos os
jobs como `Completed` o tempo todo.

**Correção.** Aponte a pasta de entrada para algum lugar fora das raízes de trabalho. Antes de editar,
**compare o `output/` com o que os destinatários de fato coletaram** — a recusa mostra que a configuração
estava errada, mas não há quanto tempo ela vinha destruindo artefatos.

### Um arquivo é recusado com `job.path-too-long`

**Sintoma.** Um upload ou um arquivo monitorado é rejeitado, com uma mensagem que cita o limite de 850
caracteres de comprimento de caminho.

**Diagnóstico.** O caminho original do job é registrado no banco operacional, e um caminho acima desse
limite não pode ser registrado. Agora ele é recusado **no momento em que o arquivo é recebido**, em vez de
ser aceito e falhar depois, em todos os providers de banco de dados; assim, a falha chega a quem enviou o
arquivo enquanto ainda é possível fazer algo a respeito.

**Correção.** Reduza o aninhamento de diretórios ou o nome do arquivo. Árvores profundas, particionadas por
data, com um prefixo `Directory` do Azure Files são a causa mais comum, já que o prefixo entra na conta.

### O probe de compartilhamentos informa um compartilhamento inacessível na inicialização

**Sintoma.** O banner mostra `azure shares = 1 of 2 reachable`, o `/api/ready` está vermelho em uma linha
`storage-share:` (cujo detalhe, em `/api/ready/details`, é a própria frase do serviço de armazenamento), e
o host iniciou mesmo assim.

**Causa raiz.** Credencial, conectividade de rede ou escopo da role. A mais comum é a **string de escopo**:
uma atribuição criada com a grafia `shares`, do plano de gerenciamento, em vez de `fileshares`, do plano
de dados, é aceita sem erro e não concede nada, e depois falha como `AuthorizationPermissionMismatch`.

**Correção.** Compare a string de escopo antes de rotacionar qualquer coisa e confirme que a identidade
tem `Storage File Data Privileged Contributor` — uma role somente leitura **não** basta nem para uma
pasta de entrada. O host iniciar degradado, em vez de se recusar a iniciar, é proposital: um
compartilhamento fora do ar às 03:00 não pode transformar uma reinicialização em um serviço que não sobe.

## A autenticação falha

### `401 Unauthorized` de todo endpoint

**Sintoma.** Toda requisição retorna `401 { code: "auth.invalid-credentials" }` ou
`{ code: "auth.misconfigured" }`.

**Causas possíveis:**

- Chave de API errada no header `X-API-Key`. Compare byte a byte com `Auth:ApiKey` / `Auth__ApiKey`.
- `Auth:ApiKey` vazia em tempo de execução (o caso de configuração incorreta). Procure no log por
  `Auth:ApiKey is empty at runtime`.
- O cookie expirou — expiração deslizante de 8 horas. Entre de novo em `/login`.

### O login em `/login` redireciona em laço

**Sintoma.** Enviar o formulário de login leva a `/login?error=...`.

**Causas possíveis:**

- `?error=invalid` — chave de API errada. Confira de novo.
- `?error=server` — `Auth:ApiKey` está vazia em tempo de execução. Corrija a configuração e reinicie.

### O login funciona, mas o dashboard desconecta imediatamente

**Sintoma.** O login é bem-sucedido, a página vai para `/`, e a navegação seguinte volta para `/login`.

**Causa raiz.** O cookie de sessão não está voltando porque um proxy reverso remove o header
`Set-Cookie`, ou o cookie está sendo marcado como `Secure` enquanto a requisição chegou à aplicação em
HTTP puro.

**Correção.** Garanta que o proxy reverso repasse os headers `Set-Cookie` e `Cookie` sem modificação. Se
o TLS terminar no proxy, defina `X-Forwarded-Proto: https` para que a aplicação marque o cookie como
`Secure`.

### A inicialização falha com `Auth:EntraId:… is required when the Auth:EntraId section is present`

**Causa raiz.** A seção é **ativada pela presença** — basta escrevê-la para que as três chaves se tornem
obrigatórias. "Presente, mas vazia" não significa *desligada*.

**Correção.** Forneça a chave que falta, ou remova a seção `Auth:EntraId` inteira para voltar ao login
por chave de API.

### O login do Entra falha na Microsoft com `AADSTS50011` (divergência de redirect URI)

**Causa raiz.** A URI de redirecionamento do registro de aplicativo não corresponde ao callback do host.

**Correção.** Registre uma URI de redirecionamento do tipo **Web** exatamente como
`https://<seu-host>/signin-oidc` — esquema, host, porta e caminho precisam coincidir com o endereço que o
navegador de fato acessa.

### O login do Entra é bem-sucedido, mas cai em `/access-denied`

**Causa raiz.** A conta foi autenticada, mas não tem **nenhuma das app roles**. A aplicação exige a
role independentemente da configuração do tenant.

**Correção.** Atribua `Administrator` ou `Approver` (ou ambas) no aplicativo empresarial. Os valores de
role no manifesto precisam coincidir exatamente com essas strings. Não há mapeamento por grupo de
segurança, de propósito.

### Os eventos de auditoria de um operador do Entra dizem `(anonymous)`, e o menu do usuário também

**Sintoma.** Um `Administrator` conectado cria ou edita um perfil, pausa o pipeline ou executa um backup,
e o evento operacional registra `(anonymous)`. O menu do usuário mostra *Conectado como (anonymous)*, e
uma execução manual de backup na página **Backup** mostra *manual · (anonymous)*.

**Causa raiz.** Desde a 2.2.1, o nome registrado do operador é a claim `preferred_username` do token (o
UPN), e a sessão desse operador não recebeu o nome a partir dela. Antes da 2.2.1, os eventos de todos os
operadores do Entra saíam assim, qualquer que fosse o token, e **essas linhas não podem ser corrigidas** —
apenas eventos gravados por uma sessão iniciada depois da atualização trazem o autor.

**Causas possíveis, em ordem de probabilidade:**

- **Uma sessão anterior à atualização.** O nome fica no cookie de sessão, e o cookie tem expiração
  deslizante de oito horas; assim, um operador que permaneceu conectado durante a atualização mantém a
  sessão antiga. **Saia e entre de novo uma vez.** Nenhuma linha de log acompanha este caso.
- **O token não trazia `preferred_username`.** O Bulk Signer sempre solicita o escopo `profile`, que
  inclui a claim; portanto, o tenant a omitiu — consentimento do usuário ao `profile` recusado ou
  restrito, ou uma personalização de token no registro de aplicativo. Este caso é sinalizado: o login
  grava um aviso no log com os tipos de claim recebidos (nunca os valores); procure no log por
  `preferred_username`. Um `Administrator` convidado é registrado com a forma `#EXT#` do UPN, o que está
  correto.
- **O host é anterior à 2.2.1.** Atualize; depois, saia e entre de novo.

O nome de exibição, de propósito, não é usado como alternativa; por isso, os eventos continuam como
`(anonymous)` em vez de serem registrados com um nome que duas pessoas podem ter.

### Um `Approver` do Entra entra, mas o portal está vazio

**Causa raiz.** A role dá acesso; mas quem decide quais jobs a pessoa vê continua sendo o **pool
congelado**, comparado com o e-mail informado pelo diretório dela. O endereço dela não está em nenhum
pool.

**Correção.** Compare o endereço na lista `Approvers` do perfil com o atributo de e-mail da conta. Para
**contas de convidado**, verifique se o atributo mail contém o endereço corporativo configurado no pool —
o UPN alterado com `#EXT#`, de propósito, não é usado como alternativa. Uma conta cujo token não traz
nenhuma claim de e-mail é recusada de imediato, com uma página que explica o motivo.

### Depois de habilitar o modo Entra, os operadores são desconectados e o `/api/auth/login` para de funcionar

**Não é uma falha.** Ligar o modo invalida de uma só vez todas as sessões de navegador criadas por chave
de API, e um POST em `/api/auth/login` não emite cookie nem para uma chave correta — o endpoint está
desligado, não escondido. Planeje a transição como um "desconectar todo mundo". Clientes REST que usam
`X-API-Key` não são afetados.

### Sair e entrar de novo acontece instantaneamente, sem pedir senha

**Não é uma falha.** Sair é uma ação apenas local: limpa a sessão do Bulk Signer e, de propósito, não
encerra a sessão Microsoft da pessoa. Esse é o comportamento normal de SSO. Desde a 2.2.1, sair encerra,
sim, a janela de verificação do segundo fator de um aprovador; assim, quando um colega entra de novo sem
digitar senha em uma estação de trabalho compartilhada, o código volta a ser pedido.

## A assinatura falha

### Um job falha com `profile.degraded`

**Sintoma.** Os jobs vão de `Queued → Failed` com o erro `profile.degraded`. O histórico do job diz que o
perfil está degradado e cita o motivo. Jobs de outros perfis continuam sendo concluídos normalmente. O
banner de inicialização mostrou o mesmo perfil como `DEGRADED`, e o `/api/ready` traz uma linha
`signing-profile:<nome>` com `ok: false` — o motivo está em `/api/ready/details`, com a chave de API.

**Causa raiz.** O certificado desse perfil não pôde ser aberto quando o host iniciou — um arquivo PKCS#12
ausente, uma senha errada, um thumbprint que não corresponde a nada no token ou no repositório, um Key
Vault inacessível ou um blob de material de assinatura ilegível. O motivo indica qual. Três mensagens que
vale a pena conhecer:

- **Uma senha de PKCS#12 errada** aparece como *did not open with the PKCS#12 password given — check the
  PKCS#12 password on the profile, and if it is right, supply the file again*, seguida da frase do próprio
  PKI SDK, que fala em **PIN** incorreto: o SDK usa uma só palavra para a senha de PKCS#12 e para o PIN de
  token, e o perfil não tem PIN a corrigir. A segunda metade da mensagem existe porque a verificação por
  trás dela é a tag de integridade do arquivo, e um arquivo danificado falha nela da mesma forma, mesmo com
  a senha certa.
- **Um PKCS#12 com o envelope moderno** aparece como *is encrypted with PBES2, which the signing library
  does not open*. A biblioteca de assinatura só abre o envelope clássico, e tanto o OpenSSL 3, por padrão,
  quanto uma exportação do Windows configurada como AES256-SHA256 gravam PBES2 / AES-256. No Windows,
  exporte de novo a partir do repositório de certificados com a opção TripleDES-SHA1. A partir do `.pfx`
  que você tem, exporte de novo pelo OpenSSL e forneça o novo arquivo:

  ```bash
  openssl pkcs12 -in modern.pfx -nodes -passin pass:<senha> -out tmp.pem
  openssl pkcs12 -export -legacy -in tmp.pem -passout pass:<senha> -out signing.pfx
  shred -u tmp.pem   # a chave privada está em claro no tmp.pem
  ```

  (`-legacy` precisa do provider legado do OpenSSL 3; em uma build sem ele,
  `-keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES` produz um envelope clássico que a biblioteca também
  abre.) A mesma frase aparece também com uma senha errada, de propósito — o envelope é o impedimento,
  qualquer que seja a senha.
- **Um arquivo, blob ou upload vazio** é recusado antes de qualquer decodificação, com
  *Certificate file '…' is empty (0 bytes)*, indicando o local — em geral, um arquivo provisório criado
  enquanto se esperava o arquivo real, ou uma cópia que não chegou ao fim.

**Isto não é um arquivo com problema.** `profile.degraded` e `cnab240.invalid` são as duas falhas mais
fáceis de confundir, e as soluções não têm nada em comum: um perfil degradado significa que todo arquivo
roteado para ele vai falhar até que a implantação seja corrigida, enquanto um arquivo recusado significa
que só aquele arquivo precisa ser exportado de novo. Uma nova tentativa do job antes de corrigir o
certificado falha exatamente da mesma forma.

**Também não é um perfil sem chave.** Um perfil cuja regra de aprovação faz os **aprovadores** assinarem
(`Approval.Signers = Approvers`) não tem certificado próprio, por design: o banner começa a linha dele com
`KEYLESS` em vez de `DEGRADED`, o `/api/ready` o mostra em uma linha `signing-profile-keyless:<nome>` com
`ok: true`, e nenhum job nele falha com `profile.degraded`. O que falha nesse caso, com código próprio, é
um envelope de assinaturas dos aprovadores ausente (`approval.signatures-missing`) ou um conjunto de
assinantes congelado que o pipeline não consegue atender (`approval.signer-set-unsupported`). Mais um
código pertence a este caso: um job que ficou retido **antes** de a regra passar para `Approvers` foi
congelado com a chave do perfil e, em uma instância que iniciou depois da mudança — e que, por isso,
nunca abriu uma chave —, falha com `profile.key-unavailable`. Voltar a regra para um conjunto com chave e
reiniciar resolve; uma nova tentativa em uma instância que ainda tem a chave também.

**Correção.**

1. Leia o motivo. Ele aparece no banner de inicialização, no log em `Critical`, em `/api/ready/details`,
   na página do próprio perfil em `/profiles/<nome>` e no histórico do job que falhou — os cinco dizem a
   mesma coisa.
2. Corrija o certificado. Se as coordenadas estão erradas — um caminho digitado errado, um thumbprint que
   não corresponde a nada, o cofre errado —, corrija-as nessa página, em **Editar certificado**; o
   salvamento as armazena e marca o perfil como aguardando reinicialização. Se as coordenadas estão
   certas e o material não, os modos de falha são os de sempre: veja
   [O boot é bem-sucedido, mas todo job falha com "Certificate not found by thumbprint"](#o-boot-é-bem-sucedido-mas-todo-job-falha-com-certificate-not-found-by-thumbprint),
   [Falha de autenticação ou autorização no Azure Key Vault na inicialização](#falha-de-autenticação-ou-autorização-no-azure-key-vault-na-inicialização)
   e [Um blob de material de assinatura não pode ser lido na inicialização](#um-blob-de-material-de-assinatura-não-pode-ser-lido-na-inicialização).
3. **Reinicie o serviço.** O certificado é aberto uma única vez, na inicialização, e nunca é recarregado;
   por isso, nem corrigir o arquivo nem salvar novas coordenadas muda nada em um host em execução — o
   aviso no perfil diz exatamente isso.
4. Faça uma nova tentativa dos jobs que falharam, ou coloque os arquivos de volta na pasta monitorada. Os
   arquivos de entrada continuam no lugar: nada foi assinado, então nada justificava apagá-los.

**Não é motivo para tirar a instância de serviço.** A linha do `/api/ready` informa `ok: false`, mas
**não** transforma a resposta em 503 — veja
[O serviço inicia, mas o `/api/ready` retorna 503 persistentemente](#o-serviço-inicia-mas-o-apiready-retorna-503-persistentemente).

### Um perfil está degradado dizendo que um segredo armazenado não pôde ser descriptografado

**Sintoma.** O banner de inicialização mostra um ou mais perfis como `DEGRADED`, com um motivo que cita
`Signing:ProfileSecretsKey` — *"A stored signing profile secret (Pkcs12Password) could not be
decrypted"* — e o `/api/ready` traz uma linha `signing-profile:<nome>` com `ok: false`. Os jobs
roteados para esses perfis falham com `profile.degraded`. **O host iniciou**, e todos os perfis sem
segredo continuam assinando normalmente. Na página do perfil, o painel de certificado mostra as
coordenadas — o caminho, o thumbprint, o endpoint do cofre — e nenhuma linha de segredo.

**Causa raiz.** `Signing:ProfileSecretsKey` está definida, mas não tem o valor com o qual os segredos desses
perfis foram salvos. Quatro situações causam isso, e elas são indistinguíveis de propósito — a
descriptografia é autenticada, então uma chave errada e uma linha adulterada têm exatamente a mesma
aparência:

- a chave foi **rotacionada** e o material armazenado não foi digitado de novo depois;
- o banco operacional foi **restaurado** ou copiado de uma implantação com uma chave diferente;
- a chave foi **digitada errado**, quase sempre em `Signing__ProfileSecretsKey`, em que é fácil errar o
  sublinhado duplo;
- alguém **editou uma coluna protegida** diretamente, ou uma restauração moveu bytes entre colunas.

**Esta não é a recusa por chave ausente**
([A inicialização é recusada porque `Signing:ProfileSecretsKey` não está definida](#a-inicialização-é-recusada-porque-signingprofilesecretskey-não-está-definida)).
Aqui a chave *está* definida, e definir outra não vai ajudar: os valores armazenados foram gravados com a
antiga.

**Correção, se você ainda tem a chave original.**

1. Restaure-a — `Signing__ProfileSecretsKey`, exatamente como era. Verifique se há espaços em branco no
   final ou um sublinhado simples onde são necessários dois.
2. **Reinicie o serviço.** O certificado é aberto uma única vez, na inicialização, e nunca é recarregado.

**Correção, se a chave foi perdida ou rotacionada de propósito.** Não há como recuperar os valores em si;
isso é intencional, e não uma lacuna. Para cada perfil citado no banner:

1. Abra a página do perfil no dashboard e clique em **Editar certificado**.
2. Digite de novo a senha do PKCS#12, o segredo de aplicativo do Key Vault ou a credencial do blob, ou
   envie o PKCS#12 de novo. Um campo em branco *mantém* o valor armazenado, que não é o que você quer
   aqui — digite o valor.
3. Salve. O perfil é marcado como aguardando reinicialização.
4. **Reinicie o serviço** quando todos os perfis afetados tiverem sido preenchidos de novo.
5. Faça uma nova tentativa dos jobs que falharam, ou coloque os arquivos de volta na pasta monitorada.
   Nada foi assinado, então os arquivos de entrada ainda estão em `input/`.

Um perfil sem segredo — um PFX sem senha, um token PKCS#11, um certificado do repositório do Windows — não
é afetado e não precisa de nenhuma ação.

:::tip Trate a rotação da chave como uma operação planejada
Rotacionar `Signing:ProfileSecretsKey` invalida de uma só vez todos os segredos de perfil armazenados.
Faça a rotação preenchendo de novo o material de cada perfil com a nova chave *enquanto a antiga ainda
funciona*, e desative o valor antigo apenas quando nada mais estiver protegido por ele.
:::

### Certificados de teste da Lacuna (Turing / Fermat) são recusados

**Sintoma.** Com os certificados de teste da Lacuna, todo job do perfil falha com um erro de cadeia ou
de confiança, ou todo **Assinar e aprovar** de um aprovador é recusado como `approval.certificate-invalid`,
citando uma raiz não confiável. A linha `trust set` do banner mostra `production`.

**Causa raiz.** Não é uma falha. O produto publicado valida toda assinatura apenas contra as raízes da
ICP-Brasil; a raiz de teste da Lacuna só é confiável com `Signing:TrustLacunaTestRoot = true` (disponível
a partir da 2.3.0). Um único conjunto de confiança vale para o host inteiro: a chave do perfil no momento
da assinatura, o verificador depois e o certificado de um aprovador.

**Correção.** Em um host de homologação, defina `Signing__TrustLacunaTestRoot=true` **e**
`ASPNETCORE_ENVIRONMENT=Staging` — a chave sozinha é recusada com o nome de ambiente `Production` (veja
[a entrada em *O serviço não inicia*](#signingtrustlacunatestroot-is-true-while-the-environment-is-production)).
Em qualquer ambiente que assine documentos reais, use certificados reais; a chave não serve para isso.

### O boot é bem-sucedido, mas todo job falha com "Certificate not found by thumbprint"

**Sintoma.** Todo job vai de `Queued → Failed`. A mensagem de erro menciona uma divergência de
thumbprint. Desde a 2.1.0, isso é detectado quando o certificado do perfil é aberto na inicialização: o
banner mostra o perfil como `DEGRADED` com o thumbprint no motivo, e os jobs dele falham com
`profile.degraded`.

**Causa raiz.** O thumbprint configurado não corresponde a nenhum certificado visível à origem
configurada.

**Diagnóstico:**

| Origem | Comando |
|--------|---------|
| `Pfx` | `openssl pkcs12 -in /etc/bulksigner/signing.pfx -nokeys -passin pass:<senha>` — o arquivo carrega? |
| `Pkcs11` | `pkcs11-tool --module /caminho/para/driver.so --list-objects --type cert --login --pin <pin>` — o certificado existe no token? |
| `WindowsStore` | `Get-ChildItem -Path Cert:\LocalMachine\My \| Where-Object Thumbprint -eq <thumbprint>` |

Corrija o thumbprint configurado ou importe o certificado que falta.

### A assinatura falha com "module load failed" / "C_Initialize" do PKCS#11

**Sintoma.** O bootstrap é bem-sucedido, mas a primeira tentativa de assinatura dá erro com uma falha de
inicialização do PKCS#11.

**Causas possíveis:**

- O `.so` / `.dll` do fabricante não está no host, no caminho indicado em `ModulePath`.
- (Docker) A biblioteca do fabricante não está montada no container — veja
  [Certificados](certificates.md#exemplo-de-montagem-no-docker).
- (Linux) O token exige o `pcscd` em execução — `sudo systemctl start pcscd`.

### A assinatura falha com "Access is denied" ao ler uma chave privada do Windows

**Sintoma.** A assinatura lança `CryptographicException: Access is denied.` a partir do repositório do
Windows.

**Causa raiz.** A conta virtual do serviço `NT SERVICE\LacunaBulkSigner` não tem acesso à chave privada.

**Correção.** `certlm.msc` → certificado → Todas as Tarefas → Gerenciar Chaves Privadas → Adicionar
`NT SERVICE\LacunaBulkSigner` → conceder Leitura.

### Jobs do Azure Key Vault falham com throttling (HTTP 429) ou erros transitórios de rede

**Sintoma.** Com `Source = AzureKeyVault`, os jobs **falham em vez de travar**, com um erro do Azure —
HTTP 429 (`Too many requests`), um timeout ou uma falha de resolução de nome. Em geral, coincide com uma
rajada de arquivos ingeridos.

**Causa raiz.** Cada assinatura é uma chamada remota ao Key Vault; por isso, a vazão é limitada pelos
limites de requisição do cofre, e não pela CPU local. Um `Pipeline:MaxConcurrency` alto somado a um lote
grande pode ultrapassar esses limites. Uma indisponibilidade do cofre ou uma perda da conectividade de
saída produz o mesmo quadro.

**Correção.**

- Reduza o `Pipeline:MaxConcurrency` (comece com algo entre 4 e 8) e meça de novo. Ao contrário do caso do
  PKCS#11, não há motivo de *correção* para baixar para `1` — trata-se de um limite de requisições, não de
  um conflito de sessão.
- Faça uma nova tentativa dos jobs afetados quando o cofre estiver acessível. Throttling e
  indisponibilidades são transitórios, e os arquivos de entrada não foram alterados; a nova tentativa é
  manual por design (veja [Operação](operations.md)).
- Confirme que a saída para `*.vault.azure.net` e `login.microsoftonline.com` está estável, inclusive por
  qualquer proxy.
- Se o objetivo é uma vazão sustentada, confira os limites de transação documentados do cofre para o tipo
  de chave em uso — operações RSA têm tetos mais baixos que EC.

### Um verificador externo rejeita uma assinatura do Bulk Signer

**Sintoma.** Um PDF assinado é validado no Lacuna PKI SDK, mas um verificador de terceiros informa que a
política é desconhecida ou que a cadeia está incompleta.

**Causas possíveis:**

- O verificador exige uma política diferente da padrão (por padrão, o Bulk Signer assina com a
  ADR-Básica). Combine com o sistema de destino qual política é esperada.
- Falta uma AC intermediária no verificador. O Bulk Signer assina com a cadeia implícita no certificado;
  o verificador monta a cadeia a partir do próprio repositório de confiança.

## Pipeline / worker

### Os jobs entram na fila, mas nunca entram em Processing

**Sintoma.** O `bulksigner_jobs_in_flight` fica em zero; os jobs ficam em `Queued`.

**Causas possíveis:**

- O pipeline está pausado. O `GET /api/pipeline/state` retorna `{ paused: true }`. Retome com
  `POST /api/pipeline/resume`.
- O worker não está saudável. O log mostra as linhas de iteração do worker; se elas pararam, o worker
  pode ter caído (raro; procure uma exceção registrada).

### A pausa responde `pipeline.state-missing` (SQL Server)

**Sintoma.** Em uma implantação com `Database:Provider = SqlServer`, o `POST /api/pipeline/pause` responde
`pipeline.state-missing`, o log registra `PipelineState singleton row is missing` em Critical, e o
pipeline continua rodando, não importa o que o operador peça.

**Causa raiz.** Bancos SQL Server criados antes da 2.4.3 nunca receberam a linha de estado do pipeline
sobre a qual a pausa e a retomada atuam. **Correção.** Atualize para a 2.4.3 ou posterior: a linha é
inserida por uma migração aplicada no próximo boot.

### Os jobs travam quando `MaxConcurrency > 1` com um token PKCS#11 ou CSP do Windows

**Sintoma.** Com `Pipeline:MaxConcurrency > 1` e `Signing:Certificate:Source = Pkcs11` (ou
`WindowsStore`), jobs em andamento ficam travados além da latência normal de assinatura, ou falham com
erros como `CKR_SESSION_HANDLE_INVALID`, `Provider is busy` ou `Key container is in use`.

**Causa.** A maioria dos tokens PKCS#11 (smart cards de uso pessoal, tokens USB) oferece uma única sessão
por login. Chamadas de assinatura simultâneas de várias tarefas do worker disputam essa única sessão. CSPs
de software do Windows costumam ser thread-safe; CSPs baseados em smart card não são. O banner de
inicialização avisa quando essa combinação está configurada.

**Correção.** Defina `Pipeline:MaxConcurrency: 1` no `appsettings.Production.json` (ou deixe sem definir,
para usar o padrão) e reinicie o serviço. Se a documentação do fabricante afirma que o token suporta
várias sessões e você quer vazão com concorrência, procure o fabricante com as linhas de log da falha
para confirmar a configuração. Veja
[Certificados](certificates.md#considerações-de-concorrência-por-origem).

### Linha de log: "claim lost to a concurrent writer"

**Sintoma.** O log mostra, no nível `Information`, que a reivindicação de um job foi perdida para outro
processo que gravou ao mesmo tempo. O job está em algum estado terminal (normalmente `Canceled`, se um
operador o cancelou).

**Causa.** Este é o comportamento esperado, não um erro. A mensagem aparece quando o worker já tinha lido
uma linha `Queued`, mas, entre a leitura e a gravação, outro processo (o endpoint de cancelamento ou outro
worker) atualizou a linha. O controle de concorrência otimista detecta a disputa e o worker desiste. A
frequência deveria ser muito baixa — vê-la dezenas de vezes por dia sugere um cliente fazendo repetições
em excesso no endpoint de cancelamento.

**Correção.** Nenhuma. Se os volumes estiverem anormalmente altos, audite os clientes que fazem as
chamadas.

### O observador não pega arquivos colocados em uma pasta de entrada configurada

**Sintoma.** Arquivos aparecem em uma das pastas de `Storage:Inputs[].Path`, mas nenhum job é criado.

**Causas possíveis:**

- A extensão do arquivo está na lista efetiva de ignorados — a base global
  `WatchedFolder:IgnoredExtensions` (`.tmp`, `.part`, `.crdownload`, `.swp`) somada às
  `IgnoredExtensions` de cada pasta. Renomeie o arquivo, ou tire-o da pasta e coloque-o de volta.
- O prefixo do nome do arquivo está na lista efetiva de prefixos (padrão global: `.`, `~$`).
- O produtor ainda está gravando o arquivo. O detector de estabilidade exige
  `WatchedFolder:StabilityRequiredSamples` amostras idênticas consecutivas antes de enfileirar.
  Espere, ou faça `POST /api/rescan` (ou `POST /api/rescan?folder=<nome>` para uma única pasta) depois
  que a gravação terminar.
- **O observador da pasta está em `Status: Stopped`.** Veja abaixo.
- **Nenhum perfil de assinatura escolheu a pasta.** O card dela mostra um chip cinza `sem perfil` no lugar
  do chip do perfil. Veja
  [Arquivos ficam em uma pasta cujo card diz `sem perfil`](#arquivos-ficam-em-uma-pasta-cujo-card-diz-sem-perfil).
- **O perfil de assinatura da pasta está desabilitado.** Veja
  [Arquivos são recusados com `profile.disabled`](#arquivos-são-recusados-com-profiledisabled).
- **O job mais recente do arquivo terminou como `Failed` ou `Canceled`.** O observador não oferece esse
  arquivo de novo por conta própria (desde a 2.11.0 para `Failed`: antes, uma pasta com polling gerava um
  novo job `Failed` a cada ciclo enquanto a causa persistisse). Processe-o de novo com uma nova tentativa,
  uma nova varredura ou um upload — isso vale também para um arquivo corrigido colocado com o mesmo nome.
- **O nome já está em uso por um job concluído.** O arquivo vira um job, sim, mas um job que falha na
  hora — veja [Um arquivo falha na hora com `file.already-processed`](#um-arquivo-falha-na-hora-com-filealready-processed).
- (Docker) Problema de permissão do bind mount — o UID do container (1654) precisa conseguir ler os
  arquivos colocados pelo processo do host. Execute `chown -R 1654:1654 ./data` no host.

### Arquivos ficam em uma pasta cujo card diz `sem perfil`

**Sintoma.** Arquivos se acumulam em uma pasta configurada e nenhum job é criado. A página **Pastas de
entrada** mostra a pasta com um chip cinza com o texto `sem perfil — nenhum perfil escolheu esta pasta`; o
`/api/folders` retorna `profileName: null` e, assim que o observador percebe, `"status": "Unassigned"`; o
`/api/ready` está **verde** para essa pasta; uma nova varredura informa a pasta como `unassigned: true`,
com todas as contagens em zero; e o log registra um Warning, `Watched folder '<nome>' is unassigned — no
signing profile has chosen it`.

**Causa raiz.** Desde a 2.2.0, uma pasta monitorada é assinada com o perfil que a escolheu, uma pasta por
perfil — e nenhum perfil a escolheu. Pode ser que a importação do primeiro boot a tenha deixado assim — a
pasta indicava um perfil que `Signing:Profiles[]` não declarava, ou uma pasta anterior já tinha ficado com
o perfil indicado, e o banner de inicialização disse qual —, que um perfil a tenha liberado depois, pela
página dele, ou que a tabela de perfis tenha sido importada por uma versão anterior à 2.2.0, que não
registrava vínculos de pasta. Uma pasta sem perfil **não** passa a usar o `default`.

**Por que a pasta não aparece como quebrada.** Ela não está quebrada: o armazenamento responde, o
observador está aguardando em vez de ter falhado, e uma linha de prontidão vermelha faria um orquestrador
tirar a instância de serviço por causa de uma pasta que ninguém pediu para ela monitorar ainda. Os
arquivos estão onde o produtor os deixou e são listados assim que um perfil escolhe a pasta.

**Correção.** Abra um perfil na página **Perfis de assinatura** do dashboard, clique em **Editar
comportamento**, escolha a pasta em **Pasta de entrada** e salve; ou crie um perfil já com a pasta
escolhida. O observador começa em um ou dois intervalos de polling e lista tudo o que estiver na pasta —
sem reinicialização e sem nova varredura. Editar `Storage:Inputs[].Profile` **não** resolve depois do
primeiro boot: essa chave só é lida na primeira importação, e o boot avisa que ela está sendo ignorada.
Veja [Operação](operations.md#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura).

### Arquivos são recusados com `profile.disabled`

**Sintoma.** Arquivos se acumulam em uma pasta configurada e nenhum job é criado, mas a pasta *não* está
parada: o card dela está verde, o `/api/ready` está normal, e o console exibiu uma linha com o texto
`files are not being enqueued — signing profile '<nome>' is disabled`. Um upload para esse perfil responde
`409` com `code = "profile.disabled"`; o mesmo acontece com uma nova tentativa de um job que o usava.

**Causa raiz.** Alguém desligou a chave **aceitar novos trabalhos** na página do perfil. Isso impede que
novo trabalho seja roteado para ele, e nada mais: os jobs já enfileirados no perfil foram processados até
o fim, e nenhum arquivo foi modificado — cada um está onde o produtor o deixou.

**Correção.** Reabilite o perfil na página dele — a próxima passada da pasta ingere tudo o que estiver
nela, inclusive os arquivos recusados enquanto ele esteve desligado —, ou escolha a pasta na página de
outro perfil. (O salvamento se recusa a desabilitar um perfil alimentado por uma pasta, indicando qual;
portanto, este estado só surge de um vínculo de pasta feito *depois* de o perfil ter sido desabilitado.)

### Um arquivo falha na hora com `file.already-processed`

**Sintoma.** Um arquivo colocado em uma pasta monitorada vira um job que já nasce `Failed` com
`file.already-processed`, indicando o job que detém o nome, e o arquivo é movido para a pasta
`error/<jobid>/` do novo job. Um upload responde `409` com o mesmo código e não armazena nada. Uma nova
varredura contabiliza esses casos em `alreadyProcessed`.

**Causa raiz.** Desde a 2.13.0, um arquivo que chega com um nome já usado por um job `Completed` ou ainda
ativo **nunca é assinado**. A comparação vale para o host inteiro — todas as pastas monitoradas, todos os
perfis e todos os uploads — e ignora maiúsculas e minúsculas, porque todos gravam na mesma pasta
`output/`. Um job `Failed` ou `Canceled` não reserva nome.

**Correção.** A nova tentativa é recusada para esta falha (uma nova tentativa é isenta da regra e,
portanto, assinaria o arquivo que a regra recusou). Para aceitar o nome de novo, **exclua o job que o
detém** na página **Jobs**. Para um produtor que, legitimamente, reutiliza todo dia um mesmo nome de
arquivo fixo, desligue a regra com `Pipeline:RejectAlreadyProcessedFileNames = false`. Veja
[Operação](operations.md#nomes-de-arquivo-já-processados).

### Uploads são recusados com `upload.disabled`, ou não há botão Enviar arquivos

**Não é uma falha.** `Upload:Enabled = false` (disponível a partir da 2.10.0) desliga o upload dos dois
lados de uma vez: o `POST /api/files` responde `409` com `upload.disabled`, e a página **Jobs** não exibe
o botão **Enviar arquivos**. O host recebe arquivos apenas das pastas monitoradas; a nova varredura e a
nova tentativa não são afetadas. A chave é lida uma única vez, no boot; por isso, religar os uploads
exige reinicialização.

### Um observador de pasta está em `Status: Stopped`

**Sintoma.** Arquivos se acumulam em uma pasta configurada, mas nenhum job é criado; a página **Pastas de
entrada** mostra o card da pasta com um chip vermelho **parado** e uma mensagem de último erro. O
`/api/folders` retorna `"status": "Stopped"` para essa pasta. O `/api/ready` retorna 503 com a pasta
problemática no array `checks`.

**Causa raiz.** O observador dessa pasta atingiu o limite de falhas consecutivas de enfileiramento por
pasta (10 por padrão) — normalmente um caminho de armazenamento comprometido (o NFS caiu, o
compartilhamento ficou somente leitura, o disco da montagem do SQLite encheu).

:::note
A falha do observador fica isolada nessa pasta — as outras pastas continuam ingerindo e o host continua
no ar. A contrapartida é que um operador que não acompanha o `/api/ready` nem a página **Pastas de
entrada** pode deixar de notar uma pasta degradada por muito tempo. Consulte o `/api/ready` a partir de
um sistema de monitoramento externo.
:::

**Diagnóstico e correção:**

1. Leia o texto do último erro em `GET /api/folders` (ou no card da página **Pastas de entrada**).
2. Corrija a causa subjacente (monte de novo o compartilhamento, libere espaço em disco, corrija o
   caminho).
3. Reinicie o serviço — o observador **não** volta sozinho depois de parar, porque o problema subjacente
   em geral não é transitório.

### Um arquivo foi parar em `error/<jobid>/`

**Sintoma.** A página de detalhe do job mostra `Failed` com uma mensagem de erro; o diretório
`processing/` foi movido para `error/<jobid>/`.

**Diagnóstico:**

- Leia a mensagem de erro do job (no dashboard ou em `GET /api/jobs/{id}`).
- Procure em `error/<jobid>/` o arquivo que estava em processamento — ele é preservado exatamente como o
  worker o deixou.
- Leia o histórico do job para ver a linha do tempo completa das transições.

**Correção:** resolva a causa subjacente e, depois, faça `POST /api/jobs/{id}/retry`. A nova tentativa
cria um novo job `Queued` com `ParentJobId` definido; o job que falhou é mantido para auditoria.

### Um job CNAB240 falha com `cnab240.invalid`

**Sintoma.** O job nunca chegou a um assinador; a linha do tempo lista as violações estruturais.

**Causa raiz.** O arquivo roteado por um perfil com `CheckCNAB240` não é uma remessa válida do Banco do
Brasil — comprimento de registro errado, registros fora de ordem, um código de banco diferente de `001`,
um segmento não reconhecido, uma contagem de trailer divergente, ou um **retorno**
(`Código Remessa / Retorno = '2'`) colocado por engano em uma pasta monitorada.

**Correção.** Corrija o arquivo no sistema de origem e processe-o de novo por upload, nova tentativa ou
nova varredura. A lista de violações na linha do tempo é limitada e avisa quando foi truncada. Veja
[CNAB240](cnab240.md#quando-um-arquivo-é-recusado).

### Um job CNAB240 falha com `cnab240.payment-date-passed`

**Sintoma.** Uma remessa estruturalmente válida é recusada logo antes da assinatura.

**Causa raiz.** A data de pagamento **mais antiga** do arquivo está no passado. O BB a recusaria ou a
processaria em uma data que ninguém pretendia, e uma assinatura faria a data errada parecer intencional.

**Correção.** Exporte de novo a partir do sistema de origem, com datas atuais. **Uma nova tentativa com o
mesmo arquivo falha da mesma forma** — as datas dentro dele não mudaram.

Se o seu banco processa um pagamento com data passada no próximo dia útil, o perfil pode, em vez disso,
desligar a verificação (a partir da 2.15.0): `CheckCnab240PaymentDates = false` no comportamento do perfil
(ou `Signing:Profiles[].CheckCnab240PaymentDates` para um perfil importado em um primeiro boot). O arquivo
passa, e a decisão fica registrada — no histórico do job, em um evento operacional
`Cnab240PaymentDateCheckSkipped`, no contador `bulksigner_cnab240_payment_date_checks_skipped_total` e em
uma linha de log em Warning. A configuração é lida no momento da assinatura; assim, uma mudança vale a
partir do próximo job, sem reinicialização. Veja [CNAB240](cnab240.md#desligando-a-verificação).

:::tip Confira primeiro o fuso horário do host
"Hoje" é a data local do host. Em um host em UTC com o pagador em `America/Sao_Paulo`, a virada do dia
acontece três horas mais cedo, e um arquivo com vencimento no dia começa a ser recusado às 21:00 no
horário local. Defina `TZ=America/Sao_Paulo` no container ou na unit do systemd.
:::

### Um aprovador é informado de que o registro de aprovação está incompleto

**Sintoma.** O clique ou a assinatura de um aprovador é recusado com *Não é possível decidir sobre este
job — o registro de aprovação está incompleto. Contate quem opera o serviço.* Pela REST, o código é
`approval.job-incomplete`. O job continua em `AwaitingApproval`.

**Diagnóstico.** Antes de aceitar uma decisão, o Bulk Signer confere o registro ao qual a decisão fica
vinculada, e algo necessário está ausente ou não confere mais: a regra congelada, o hash de conteúdo do
job, a cópia preparada em `processing/<jobid>/` ou os bytes dela, o envelope de assinaturas dos
aprovadores ao lado dela, ou o thumbprint do certificado de uma linha aprovada. Abra a página do job como
operador: desde a 2.8.0, a seção **Registro de aprovação** executa as mesmas verificações e marca a que
falhou, com o valor encontrado e o caminho da pasta de processamento.

A verificação que falhou indica o que aconteceu. **Um hash de conteúdo ausente** muito provavelmente
significa que o job ficou retido em um perfil com `CheckCNAB240` desligado — a interpretação do CNAB240 é
a única etapa que registra esse hash. O histórico do perfil vai mostrar a verificação sendo desligada
(`Changed: CheckCNAB240 on → off`) enquanto a regra de aprovação continuava valendo. Desde a 2.9.0, a
página do perfil recusa esse salvamento, e a etapa de aprovação faz esse job falhar com um código próprio
em vez de retê-lo (veja [a entrada abaixo](#um-job-falhou-com-approvalcontent-unmeasured-em-vez-de-ficar-retido));
portanto, um job nesse estado ficou retido antes de qualquer uma das duas recusas existir. **Qualquer
outra verificação** que falhe significa que a linha ou a pasta foi modificada fora da aplicação — um
backup restaurado, um antivírus que colocou o arquivo em quarentena e o restaurou, um cliente de
sincronização, uma edição manual.

**Correção.** Cancele o job (botão **Cancelar**, ou `POST /api/jobs/{id}/cancel`). No caso do hash de
conteúdo, primeiro religue o `CheckCNAB240` em **Editar comportamento** no perfil — ou remova a regra de
aprovação, se o perfil não deve ter etapa de aprovação — e depois processe o arquivo de novo por nova
varredura ou upload, para que ele seja interpretado, totalizado e aprovado do zero; o original ainda está
em `input/`. Por design, nada corrige o registro no lugar. Nas outras verificações, descubra o que tem
acesso de escrita ao banco operacional ou a `processing/` por fora da aplicação e interrompa-o, ou o
próximo job retido terá o mesmo destino.

### Um job fica em `AwaitingApproval` e nada acontece

**Por si só, não é uma falha** — o job está esperando uma pessoa e vai esperar indefinidamente, a menos
que o perfil defina `Approval.ExpiresAfter`. O que conferir:

- **Alguém sabe?** O produto não envia e-mail. Os aprovadores chegam a um arquivo retido pela própria fila
  em `/approvals` — pelo link permanente do portal (listado por aprovador na página **Sistema**) ou por um
  login do Entra. Desde a 2.9.0, a página do job não mostra mais um link de aprovação por job para copiar;
  a página anônima em `/approve/<jobId>` ainda existe para implantações que dependam dela, e tudo o que
  está em [Segurança](security.md#a-página-de-aprovação-por-job-não-é-autenticada) sobre como distribuí-la
  continua valendo.
- **O pool está certo?** A página do job mostra o pool **congelado no momento da retenção**, e não a regra
  atual do perfil. Se as pessoas listadas estiverem erradas, cancele o job, corrija o perfil e processe o
  arquivo de novo — editar um perfil nunca muda o que um job retido exige. A coluna **Aprovações** da
  página **Jobs** (a partir da 2.12.0) mostra quantas aprovações ainda faltam para cada job retido.
- **Acompanhe o `bulksigner_approvals_expired_total`.** Uma taxa de expiração crescente é o sinal de que
  os aprovadores não estão olhando a fila.

### Um aprovador recebe "Esse endereço não está no grupo de aprovadores deste job"

**Causa raiz.** O endereço dele não está no pool **congelado**. Espaços no início ou no fim e maiúsculas
não importam; qualquer outra diferença importa.

**Correção.** Compare com o pool exibido na página do job. A recusa é propositalmente genérica — um
endereço malformado retorna o mesmo código — para que alguém que adivinhou um id de job não descubra nada
sobre quem são os aprovadores.

### Um job liberado falhou com `approval.content-changed`

**Sintoma.** O quórum foi atingido, o job voltou a `Queued` e, em seguida, falhou em vez de ser assinado.

**Causa raiz.** A cópia preparada em `processing/<jobid>/` foi modificada depois que os aprovadores a
viram. A verificação de hash anterior à assinatura se recusou a produzir uma assinatura sobre bytes que
ninguém aprovou.

**Correção.** **Não** assine o arquivo de novo. Descubra o que gravou em `processing/` e, depois, processe
de novo o arquivo original a partir de `input/`, para que ele seja interpretado, totalizado e aprovado do
zero. Esse contador deveria ficar em zero para sempre; qualquer outro valor merece investigação, e não
uma nova tentativa por cima.

### Um job falhou com `approval.content-unmeasured` em vez de ficar retido

**Sintoma.** Um arquivo roteado para um perfil com etapa de aprovação vai para `Failed` em vez de
`AwaitingApproval`. O histórico diz que ele foi recusado antes da retenção porque a verificação CNAB240 do
perfil está desligada, a pasta está em `error/<jobid>/`, e o log registra `Job … was refused before parking
for approval: profile … requires approval but its CNAB240 check is off`. Todo arquivo nesse perfil falha
da mesma forma.

**Diagnóstico.** O perfil tem uma regra de aprovação e `CheckCNAB240 = false`. A interpretação é a única
etapa que registra o hash de conteúdo ao qual uma decisão fica vinculada; sem ela, o job não tem com base
em que ficar retido — e um job retido sem esse hash nunca poderia ser decidido. Desde a 2.9.0, a etapa de
aprovação o recusa com um código próprio, e a página do perfil se recusa a salvar essa combinação,
qualquer que seja o lado editado; portanto, um perfil nesse estado foi editado antes de essa recusa
existir, ou teve a linha editada fora da aplicação.

**Correção.** Na página do perfil, religue o `CheckCNAB240` em **Editar comportamento**, ou remova a regra
de aprovação em **Editar aprovação**, se o perfil não deve ter etapa de aprovação. Não é preciso
reiniciar: o próximo job reivindicado já roda com a regra corrigida. Depois, processe de novo os arquivos
que falharam, por nova varredura ou upload; os originais ainda estão em `input/`.

### Um job falhou com `approval.rejected` em vez de ser cancelado

**Causa raiz.** A rejeição chegou depois de um worker já ter reivindicado o job; por isso, o pipeline
recusou a assinatura, em vez de o handler de aprovação cancelar o job. `Processing` não tem transição
válida para `Canceled`.

**Não é uma falha.** O arquivo está sem assinatura, que é a propriedade que importa. Corrija e envie de
novo.

### Um job foi cancelado com "Approval window expired."

**Causa raiz.** Ninguém decidiu dentro da janela `ExpiresAfter` do perfil.

**Correção.** A cópia preparada está em `error/<jobid>/`, o original ainda está em `input/`, e as
aprovações que *chegaram a ser* registradas continuam na página do job. A nova tentativa não se aplica
(ela só aceita `Failed`) — processe o arquivo de novo por nova varredura ou upload, o que cria um novo job
que fica retido e consulta o pool outra vez.

Uma **pausa não estende a janela**: o prazo de espera é contado em tempo de relógio, e não em tempo de
atividade do pipeline; por isso, um pipeline pausado durante uma janela faz expirar os jobs cujas janelas
se encerraram durante a pausa.

### Um job foi concluído, mas o arquivo de entrada ainda está em `input/`

**Não é uma falha.** O arquivo foi reescrito enquanto estava com o job; por isso, o pipeline se recusou a
apagar algo que não conseguia provar ser o arquivo que processou. Procure `job.input-diverged` na linha do
tempo do job. O arquivo reescrito é devolvido à pasta monitorada e assinado como um job à parte.

Há dois casos em que a devolução é descartada, e o console avisa: um upload REST (nenhum observador é
responsável pelo caminho dele) e uma pasta cujo observador não está rodando. Veja
[Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job).

### Um arquivo em `processing/` ou `error/` não pode ser escrito nem apagado

**Causa raiz.** Em um compartilhamento de trabalho do Azure Files, a cópia preparada de um job ativo tem
um lease infinito que recusa gravações e exclusões de qualquer origem, inclusive das suas próprias
ferramentas de armazenamento. Enquanto o job está em andamento, esse é justamente o objetivo. A retenção
normalmente termina junto com o job; se o job está em estado terminal e o lease continua ativo, é porque
o encerramento da retenção falhou — o compartilhamento estava inacessível, a credencial tinha sido
rotacionada ou a realocação foi recusada —, e o log registrou isso quando o job terminou (por exemplo,
`Cancel of job … could not end the hold on its staged copy` ou `Recovery: failed to relocate processing/…`).

**Correção.** O lease fica na conta de armazenamento, e não neste processo; por isso, **reiniciar o Bulk
Signer não o libera.** Confirme, pela página do job, que ele está em estado terminal; depois, quebre o
lease e apague ou mova o arquivo normalmente:

```bash
az storage file lease break --account-name <conta> --share-name <compartilhamento> --path 'processing/<jobid>/<arquivo>'
```

ou, no portal, selecione o arquivo e use **Break lease**. Nunca quebre o lease da cópia preparada de um
job *ativo*: isso remove a proteção, e caberia então ao novo cálculo de hash anterior à assinatura
detectar a alteração — o job falharia com `approval.content-changed` em vez de assinar os bytes errados.
Uma árvore de trabalho local não tem esse lease — a retenção dela desaparece no momento em que o serviço
reinicia.

### O `/api/ready` está em 503 com `work-share-owner` vermelho

**Causa raiz.** Outra instância detinha o marcador do compartilhamento de trabalho na inicialização. O
banner, o log, a página **Sistema** e esta verificação indicam o **host e o id de processo** do detentor
anterior.

**Correção.** Descubra se esse host e esse processo ainda estão rodando.

- **É este host, e o processo não existe mais** — a instância anterior não foi encerrada de forma limpa.
  Não há nada de errado agora. A linha continua vermelha durante toda a vida desta instância e volta ao
  normal no próximo boot após uma parada limpa; o marcador é reivindicado uma única vez e nada o lê de
  novo, então não há como obter uma resposta mais atual.
- **É outro host, ou esse processo está ativo** — você tem duas instâncias em um mesmo compartilhamento
  de trabalho, o que não é suportado. Pare uma delas e, depois, decida qual banco é o oficial. **O estado
  de aprovação é o que exige ação rápida**: um job retido existe no banco de apenas uma das instâncias.

Se, em vez disso, o detalhe da linha em `/api/ready/details` diz `not claimed cleanly at startup: …`,
não foi possível acessar o marcador — um compartilhamento inacessível ou uma credencial rotacionada. Nesse
caso, simplesmente não se sabe se outra instância o detém, e o desconhecido não é apresentado como a
resposta tranquilizadora. A linha `storage-share:` do próprio compartilhamento costuma dizer o motivo. A
reivindicação é tentada de novo no próximo boot, e não em segundo plano.

### Um arquivo rejeitado não foi devolvido a `output/`

**Sintoma.** Um aprovador rejeitou um arquivo. O job está `Canceled`, mas o `output/` não tem
`<nome>.reject<ext>`, e a página do job diz *"Não foi possível devolver o arquivo à pasta de saída,
portanto a cópia preparada está na pasta de erro e o original continua na pasta de entrada."* O console
mostra um aviso, e o log, uma entrada `RejectionHandbackFailed` com o motivo.

**De longe, a causa mais provável: o nome já estava em uso.** Um arquivo vetado costuma ser corrigido pelo
financeiro e reenviado com o mesmo nome; assim, uma segunda rejeição dele tenta gravar `folha.reject.rem`
onde o primeiro já está. O Bulk Signer se recusa a sobrescrever — esses bytes são de alguém — e, como
alternativa, deixa a cópia preparada em `error/`. A mensagem de log indica o destino.

**O que é garantido quando isso acontece**, e esta é a parte tranquilizadora: o veto continua valendo,
nada foi assinado, o arquivo anterior em `output/` está intacto, os bytes desta rejeição estão íntegros em
`error/<jobid>/`, e **o arquivo de entrada ainda está na pasta monitorada** — ele só é excluído depois de
uma devolução bem-sucedida.

**O que fazer.** Colete ou arquive o `output/<nome>.reject<ext>` mais antigo e, depois, deixe a cópia
atual em `error/` (a trilha de auditoria aponta para ela) ou mova-a você mesmo para `output/` com um nome
de sua escolha. Não é preciso reiniciar nada.

**Outras causas**, todas mais raras e todas identificadas no log: o compartilhamento de trabalho parou de
responder entre a gravação e a movimentação; o processo não tem permissão de escrita em `output/`; em um
compartilhamento, um lease de outra pessoa no destino. Se, em vez disso, aparecer
`RejectionHandbackFallbackFailed`, nenhum dos dois destinos funcionou — o job continua em estado terminal
e correto, e `processing/<jobid>/` precisa ser limpo manualmente. Um `RejectionHandbackUnavailable` em
Error é um defeito do produto, e não uma falha operacional: informe-o ao suporte da Lacuna Software.

## Dashboard

### Toda página é exibida, mas nenhum botão funciona, e o console do navegador mostra 404 em `_framework/blazor.web.js`

**Sintoma.** Em uma implantação Docker, o dashboard carrega e as tabelas são preenchidas, mas *Enviar
arquivos*, *Tentar novamente*, *Cancelar*, os filtros e todos os outros controles não respondem. O console
do navegador tem exatamente um erro: um 404 para `/_framework/blazor.web.js`. O `/api/ready` está verde e
o log do servidor não registra nada.

**Causa.** Imagens de container anteriores à 2.4.1 compiladas com o .NET 10 — entre elas a 2.3.2 e a
2.4.0 — foram publicadas sem o script de cliente do dashboard; por isso, as páginas eram exibidas, mas
nunca se tornavam interativas. Instalações como serviço do Windows, systemd e em primeiro plano nunca foram
afetadas.

**Correção.** Baixe a imagem 2.4.1 ou posterior e implante de novo. Para conferir uma imagem antes de
implantá-la: `docker run --rm --entrypoint ls <imagem> /app/wwwroot/_framework` precisa listar
`blazor.web.js`.

## Criptografia

### A descriptografia falha com um erro de divergência de tag

**Sintoma.** O destinatário roda o exemplo de descriptografia e recebe um erro de divergência de tag de
autenticação.

**Causas possíveis (qualquer uma basta):**

- Senha errada. Confira com o `Encryption:Password` / a variável de ambiente configurada.
- Salt errado. O destinatário precisa usar o **mesmo** salt em base64 que o servidor usou; trocar o salt
  invalida todos os envelopes anteriores.
- Número de iterações errado. Use exatamente o valor de `Encryption:Iterations`.
- O envelope foi truncado no caminho (por exemplo, por uma ferramenta que converte finais de linha em um
  arquivo binário). Obtenha de novo os bytes, sem nenhuma alteração.

### A descriptografia falha com "Unknown magic"

**Sintoma.** O script do destinatário informa `unknown magic`.

**Causa raiz.** O arquivo baixado não é um envelope BSENC — na maioria das vezes, o operador baixou por
engano o texto claro de um job não criptografado.

**Correção.** Confirme a flag `outputEncrypted` do job com `GET /api/jobs/{id}`. Se o job foi assinado com
a criptografia desligada, o arquivo a ler é o `.signed.pdf` (etc.), e não um `.enc`.

### Senha de criptografia perdida

**Sintoma.** O operador esqueceu a senha; existem saídas criptografadas que precisam ser lidas.

**Realidade.** Não há recuperação. O Bulk Signer não tem custódia de chaves, não tem recuperação, não tem
endpoint de descriptografia. Com o salt e as iterações fixos, quebrar o PBKDF2 por força bruta com uma
senha forte é computacionalmente inviável (e esse é o objetivo).

Para o futuro:

- Guarde a senha em um gerenciador de segredos que permita recuperá-la (HashiCorp Vault, AWS Secrets
  Manager, Azure Key Vault).
- Imprima e lacre uma cópia em armazenamento físico, como backup de último recurso.

## Integração com o Lacuna Signer

O passo a passo completo para o operador está em
[Integração com o Lacuna Signer](lacuna-signer.md). As entradas abaixo são os modos de falha específicos
desse caminho.

### `Signer:Endpoint is required` / `Signer:ApiKey is required` na inicialização

**Sintoma.** O bootstrap falha com uma exceção de validação sobre `Signer:Endpoint` ou `Signer:ApiKey`.

**Causa raiz.** Parte do bloco `Signer:*` está definida e o resto não. O validador é ativado pela presença
da seção: omita-a por inteiro e nada é exigido; escreva qualquer parte dela e o bloco inteiro é validado,
porque uma conexão configurada pela metade falharia no primeiro envio, em vez de falhar no boot.

:::warning Mudou na 2.1.0
Esta verificação não considera mais quais perfis existem — os perfis ficam no banco operacional e podem
ser passados para o Lacuna Signer pelo dashboard a qualquer momento. A exigência passou para o perfil:
veja a próxima entrada.
:::

**Correção.** Defina tanto `Signer__Endpoint` quanto `Signer__ApiKey` (variáveis de ambiente), ou remova a
seção se este host assina tudo localmente. O formato da chave de API é `application-id|secret`.

### `Method = LacunaSigner, but this host has no Signer: settings`

**Sintoma.** Uma recusa de boot citando o `Method` de um perfil, ou a mesma frase no formulário do perfil
quando um salvamento é recusado.

**Causa raiz.** Um perfil de assinatura seleciona o serviço remoto, e este host nunca foi informado de
onde ele está. A recusa é a mesma qualquer que seja a origem do perfil — uma entrada de
`Signing:Profiles[]` importada em um primeiro boot ou um salvamento pelas páginas de perfil do dashboard.

**Correção.** Defina `Signer__Endpoint` + `Signer__ApiKey` e reinicie, ou defina `Method = Local` no
perfil.

### Todo documento despachado falha com `signer.unreachable`

**Sintoma.** Os jobs chegam a `Processing` e passam imediatamente para `Failed` com o código de
auditoria `signer.unreachable`.

**Causas possíveis:**

- **Chave de API errada.** A chave de API em si é removida dos logs, mas um erro permanente do SDK com
  status `401` é o indício. Gere a chave de novo na administração do Lacuna Signer e atualize o
  `Signer__ApiKey`.
- **Rede inacessível.** Execute `curl -v "$SIGNER_ENDPOINT/api/version"` a partir do host. Se o `curl`
  falhar, corrija primeiro o firewall / proxy / DNS.
- **Erro de digitação no endpoint.** O `Signer:Endpoint` precisa incluir o esquema (`https://`). O banner
  de inicialização mostra o valor configurado — confira-o.

### Documentos travados em `AwaitingSigner` além do `Signer:TimeoutHours`

**Sintoma.** O card **Aguardando assinatura** da página **Painel** sobe sem parar; nada passa para
`Completed`.

**Causas possíveis:**

1. **O participante não assinou.** Abra a administração do Lacuna Signer e confira o status do documento
   com o id correspondente. Se ele estiver `Pending` além do `Signer:TimeoutHours`, o worker de polling
   vai fazer o job local falhar com `signer.timeout` no próximo ciclo — esse é o comportamento previsto.
2. **O worker de polling não está rodando.** Procure no log por `SignerPollWorker started`. Se não
   aparecer, o host não tem configurações `Signer:*` e, portanto, nem o gateway nem o worker de polling
   estão registrados — defina `Signer__Endpoint` + `Signer__ApiKey` e reinicie. (Desde a 2.1.0, o
   registro depende dessas configurações, e não dos perfis; assim, um host que as tem está pronto para um
   perfil passado para o Lacuna Signer depois de o host ter iniciado.)
3. **O pipeline está pausado.** O `GET /api/pipeline/state` retorna `{ paused: true }`. O worker de
   polling respeita a flag de pausa. Faça `POST /api/pipeline/resume` para desbloquear.

### O operador cancelou, mas o participante ainda vê o documento

**Sintoma.** O job está `Canceled` localmente; o participante que assina ainda recebe um e-mail de
lembrete ou vê o documento na caixa de entrada do Signer.

**Causa raiz.** No lado remoto, o cancelamento é feito em *melhor esforço*. Se a chamada de cancelamento
remoto falhou no momento do cancelamento local, a transição local foi feita, mas o documento remoto não
foi cancelado. O log registra uma linha de `Warning` sobre a falha do cancelamento em melhor esforço.

**Correção.** Cancele o documento manualmente na administração do Lacuna Signer. O job local está
corretamente `Canceled` e não precisa de mais nenhuma ação.

### O dashboard não mostra o card "Aguardando assinatura" nem o painel "Lacuna Signer"

**Sintoma.** Um perfil está configurado com `Method = LacunaSigner`, mas a página **Painel** não mostra o
card **Aguardando assinatura** e a página **Sistema** não mostra o painel do Lacuna Signer.

**Causa raiz.** Desde a 2.1.0, os perfis ficam no banco operacional, e `Signing:Profiles[]` só é
importado no primeiro boot com a tabela de perfis vazia. Se você acrescentou ou alterou o perfil no
`appsettings.Production.json` depois desse primeiro boot, a edição não teve efeito — o banner de
inicialização avisa que a seção está sendo ignorada — e nenhum perfil armazenado tem
`Method = LacunaSigner`.

**Correção.** Confira a [página **Perfis de assinatura**](dashboard.md#profiles--perfis-de-assinatura) do dashboard, que mostra o que o banco realmente
guarda. Crie o perfil ali, ou passe um perfil existente para o Lacuna Signer (o host precisa das
configurações `Signer:*` — veja acima). Um perfil salvo chega ao host em execução em até um intervalo de
polling, sem reinicialização; recarregue a página **Painel** ou **Sistema** para ver o card e o painel.

### O contador de erros transitórios sobe, mas nenhum job falha

**Sintoma.** O `bulksigner_signer_api_errors_total{op="poll"}` aumenta, mas os jobs continuam em
`AwaitingSigner`.

**Causa.** Isso é esperado em uma indisponibilidade breve. O contador de falhas por documento fica em
memória e tem como limite `Signer:MaxConsecutiveApiFailures` (padrão 5). Um polling bem-sucedido zera o
contador. Quando o contador de um único documento ultrapassa o limite, esse job falha com
`signer.unreachable` e sai de `AwaitingSigner`. As outras linhas não são afetadas.

**Correção.** Se a indisponibilidade do serviço remoto persistir, resolva isso primeiro. Uma
reinicialização zera os contadores em memória; jobs que já falharam não recebem nova tentativa automática
(a nova tentativa fica a cargo do operador).

## Rede / HTTPS

### `https redirect = on` em uma instalação como serviço — os clientes não alcançam a API

**Sintoma.** O banner de resumo de prontidão mostra `https redirect = on`, a instalação está atrás de um
proxy reverso que faz a terminação TLS, e os clientes agora recebem `308 → https://localhost:8080/...`.

**Causa raiz.** `Hosting:RequireHttps = true` está definido em algum lugar, e o serviço está escutando
em HTTP puro; assim, o destino do redirecionamento aponta para uma porta que não serve HTTPS.

**Correção.** Defina `Hosting:RequireHttps = false` (o padrão do serviço), ou configure um certificado no
Kestrel e escute em HTTPS diretamente no processo.

### Conflito na porta 8080

**Sintoma.** O bootstrap falha com
`Failed to bind to address http://0.0.0.0:8080: address already in use`.

**Causa raiz.** Outro serviço já está usando a porta 8080.

**Correção.** Mude o `ASPNETCORE_URLS` para uma porta livre (por exemplo, `http://0.0.0.0:18080`). Em
cada alvo:

| Alvo | Onde |
|------|------|
| Linux | Acrescente `ASPNETCORE_URLS=http://0.0.0.0:18080` a `/etc/bulksigner/bulksigner.env`. |
| Windows | `[Environment]::SetEnvironmentVariable("ASPNETCORE_URLS", "http://0.0.0.0:18080", "Machine")` e reinicie. |
| Docker | Edite a linha `ports:` em `deploy/docker/docker-compose.yml`. |

## Banco de dados

### O dashboard congela enquanto um lote assina (SQL Server)

**Sintoma.** O dashboard trava, ou as páginas levam dezenas de segundos para carregar, mas só enquanto o
pipeline está processando. Nenhum job falha.

**Causa raiz.** O `READ_COMMITTED_SNAPSHOT` está **desligado** no banco de dados. Sem ele, as leituras do
dashboard adquirem locks compartilhados e ficam bloqueadas atrás das gravações do pipeline. O Azure SQL o
habilita por padrão; o SQL Server on-premises, não.

**Correção.** O banner avisa no boot (`store isolation = READ_COMMITTED_SNAPSHOT off …`), e o console de
operação exibe um alerta. O Bulk Signer informa a situação e **nunca executa o comando que a altera** —
isso exige acesso exclusivo a um banco de dados que é seu:

```sql
ALTER DATABASE [BulkSigner] SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
```

O `WITH ROLLBACK IMMEDIATE` encerra as outras conexões; por isso, pare o serviço primeiro. Depois,
reinicie-o e confirme que o banner não mostra mais a linha — com a opção ligada, nada é informado.

### A linha do banco diz `UNREACHABLE` e o serviço subiu mesmo assim

**Não é uma falha.** Um banco de dados fora do ar durante uma janela de manutenção não pode transformar uma
reinicialização em indisponibilidade; por isso, o host inicia, a migração é **pulada** e o `/api/ready`
fica vermelho (o detalhe da verificação `database`, em `/api/ready/details`, indica o banco).

**Correção.** Corrija o banco e, depois, **reinicie**. O veredito de prontidão é calculado a cada
requisição, mas também continua vermelho durante toda a vida de uma instância cujo boot pulou a migração —
isso só volta ao normal no próximo boot, e não quando o banco volta.

Causas comuns: o banco de dados não existe (o Bulk Signer cria as *tabelas*, não o banco de dados); o
login não está mapeado para um usuário no banco; um TLS que o cliente não aceita (o `Encrypt` é `True` por
padrão, então um certificado de servidor não confiável faz o login falhar com *certificate chain … not
trusted*); ou, no Azure SQL acessado de dentro do Azure, apenas a porta TCP 1433 liberada, quando a
política de conexão `Redirect` também precisa das portas TCP 11000–11999.

### O serviço se recusa a iniciar com `Database migration failed`

**Causa raiz.** Uma migração não pôde ser aplicada. Na maioria das vezes, o login não tem `db_ddladmin`,
necessário no primeiro boot e em qualquer boot após uma atualização que traga uma migração.

**Correção.** Conceda a role e reinicie. Esta falha é fatal por design — rodar com um schema que não
corresponde ao código é pior do que não iniciar.

### Um job ou uma página falha uma vez e depois funciona (SQL Server)

**Não é uma falha.** Com `SqlServer`, as novas tentativas em falhas transitórias ficam ligadas com os
padrões do EF Core — a tentativa inicial e até seis novas tentativas para os números de erro que o
cliente SQL classifica como transitórios, com cada espera limitada a 30 segundos. Elas ficam ligadas
porque rodar com o Azure SQL, na prática, exige isso, e de propósito não há chave de configuração: um
limite de novas tentativas que o operador pode ajustar é um limite que acaba ajustado para zero durante um
incidente.

Se as novas tentativas estão se esgotando, investigue o caminho de rede em vez do limite.

### Comandos no banco estouram o tempo em 35 s alguns segundos depois de o App Service substituir o container

**Sintoma.** No Azure App Service com `Database:Provider = SqlServer`, de um a três comandos falham com
`Execution Timeout Expired` alguns segundos depois de a plataforma parar o container *anterior* no mesmo
worker — cada um levando 35 s, nunca 30 — e nada falha depois disso. As vítimas são as operações que
fizeram a requisição seguinte: `Takeover sweep failed`, `Pipeline worker iteration failed`, um ciclo de
heartbeat ou o carregamento de uma página. O `/api/ready` continua verde, e a verificação seguinte é
bem-sucedida.

**Causa.** Não é o banco. Quando a plataforma remove o container antigo, conexões que o novo container
colocou no pool durante o aquecimento podem morrer na rede sem serem fechadas e continuar parecendo ativas
para o pool de conexões. O primeiro comando em uma delas espera o timeout de comando inteiro, de 30 s, e
depois mais 5 s para que o servidor confirme um cancelamento que nunca recebe — 35 s é a marca de uma
conexão que parou de responder, enquanto uma consulta que o servidor está de fato bloqueando falha em 30 s.
A conexão morta sai então do pool, e é por isso que o episódio termina sozinho; um timeout não gera nova
tentativa, então cada conexão morta custa exatamente uma falha.

**Correção.** Nenhuma no produto: a varredura consulta de novo no próximo ciclo de polling, um ciclo de
heartbeat perdido está a 15 s do próximo, e o carregamento de uma página funciona ao recarregar. Quando a
janela importa, implante com parada — com a parada primeiro, o container antigo já não existe quando o
novo abre uma conexão (veja [Alta disponibilidade](high-availability.md#atualizações-exigem-parada-total)). Não
aumente o timeout de comando nem acrescente uma nova tentativa para isso — o primeiro alonga a espera e a
segunda a repete. Um travamento real do banco tem outro aspecto: falhas em 30 s e sinais de DTU, deadlock
ou `blocked_by_firewall` no Azure Monitor.

### A inicialização é recusada porque a connection string não corresponde ao provider

**Causa raiz.** Uma de duas recusas, conforme o `Database:Provider`:

- Com `SqlServer`, um data source que aponta para um **arquivo** em vez de um servidor — o que acontece
  quando uma implantação troca o provider e esquece o caminho do SQLite. Sem a recusa, isso apareceria
  como uma falha de login em um servidor cujo nome é um caminho.
- Com `Sqlite`, uma connection string que aponta para um local do Azure Files — um arquivo de banco de
  dados acessado por SMB é a forma documentada de corrompê-lo.

Ainda com `SqlServer`: uma connection string **ausente** é recusada, em vez de o produto tentar adivinhá-la.
Nenhuma recusa exibe a string, porque ela pode conter uma senha; apenas o data source é citado.

:::warning A variável de ambiente substitui o valor inteiro
`ConnectionStrings:Default` é uma única chave; portanto, não há como manter o servidor no
`appsettings.Production.json` e fornecer apenas a senha pelo ambiente. Um valor JSON deixado no lugar
junto com a variável de ambiente é ignorado sem aviso, em vez de ser combinado com ela.
:::

### Depois de migrar para o SQL Server, todo job e toda aprovação sumiram

**Não é recuperável a partir do novo banco — e não é uma falha.** Não há importador nem verificação no
boot para um arquivo SQLite deixado para trás; assim, o novo banco sobe com um schema vazio: sem jobs, sem
histórico, sem eventos operacionais e **sem snapshots de aprovação nem aprovações registradas**.

**Correção.** O antigo `db/bulksigner.db` ainda está em disco, a menos que algo o tenha removido.
Arquive-o e mantenha um cliente SQLite à mão para o dia em que alguém perguntar quem aprovou um arquivo de
pagamento anterior à migração. Veja em
[Instalação](installation.md#migrando-do-sqlite--arquive-o-arquivo-antigo-primeiro) a ordem certa de fazer
isso da próxima vez.

### SQLite "database is locked"

**Sintoma.** Erros esporádicos mencionando "database is locked".

**Causas possíveis:**

- Um processo externo (por exemplo, uma ferramenta gráfica de SQLite) está com o banco aberto e mantém um
  lock de escrita.
- O sistema de arquivos não suporta locks (algumas montagens de rede).

**Correção.** Feche a ferramenta externa. Evite SQLite em montagem de rede — mantenha o banco em disco
local.

### O banco cresceu demais

**Sintoma.** O `db/bulksigner.db` tem vários gigabytes.

**Diagnóstico.** Confira a quantidade de linhas de histórico e de jobs. Não há retenção automática (veja
[Retenção](retention.md)).

**Correção.** Arquive o banco manualmente: pare o serviço, mova `db/bulksigner.db` para
`db/bulksigner-archive-AAAAMM.db` e inicie o serviço. Um banco novo é inicializado; o arquivo arquivado
fica somente leitura. Abra-o em um cliente SQLite para consultas históricas.

Com `Database:Provider = SqlServer`, o crescimento é o mesmo, mas o procedimento não: não há arquivo para
mover, e criar um banco novo manualmente descartaria as aprovações registradas junto com todo o resto.
Arquive linhas com as ferramentas do seu próprio SGBD.

:::warning Limpar Jobs não é um arquivamento
O botão **Limpar Jobs** na página **Sistema** (ou `DELETE /api/jobs`) apaga **todos** os registros de job,
qualquer que seja o status (desde a 2.9.0), os arquivos que esses jobs deixaram — arquivos de entrada,
cópias preparadas, pastas de erro e saídas assinadas — e (desde a 2.10.0) todos os eventos operacionais
registrados antes dele. Nada é mantido para consulta posterior. Veja [Operação](operations.md#limpar-jobs).
:::

## Modo cluster

Tudo nesta seção exige `Cluster:Enabled = true`. Com a chave desligada, nada disso se aplica — veja
[Azure App Service (modo cluster)](azure.md) para a implantação e
[Alta disponibilidade](high-availability.md) para o que o modo oferece e o que não oferece.

### `Cluster mode refused to start`, citando chaves de configuração

**Sintoma.** O host encerra no boot com uma mensagem que cita uma ou mais destas chaves:
`Database:Provider`, `Storage:Provider`, `Storage:Inputs[]` ou um `Source` de certificado.

**Diagnóstico.** São configurações que não teriam como funcionar, recusadas em vez de executadas pela
metade. A mensagem cita **todas** as chaves com problema de uma vez, e não uma por tentativa; basta uma
leitura:

| Chave citada | Valor exigido | Por quê |
|---|---|---|
| `Database:Provider` | `SqlServer` | O banco é o ponto de coordenação do cluster; um arquivo SQLite não pode ser compartilhado entre hosts. |
| `Storage:Provider` | `AzureFiles` | O lease do armazenamento local de arquivos não impede nada fora do próprio processo. |
| cada entrada de `Storage:Inputs[]` | em `AzureFiles` | Uma pasta local de uma instância é invisível para as demais. A pasta `default`, criada automaticamente quando não há configuração, é local; por isso, uma primeira execução com a chave ligada também é recusada. |
| um `Source` de certificado | nem `Pkcs11`, nem `WindowsStore` | Um token ou um repositório de máquina fica em uma única máquina, e as instâncias do cluster são intercambiáveis. Use `Pfx` (de preferência lido de um blob) ou `AzureKeyVault`. |

**Correção.** Corrija as chaves citadas ou desligue o `Cluster:Enabled` — desligado, o produto funciona
como instância única, sem mudanças. Um compartilhamento NFS do Azure Files é recusado explicitamente; o
compartilhamento de trabalho precisa ser SMB.

### Boot recusado: uma identidade de instância `could not be registered in 3 attempts`

**Sintoma.** O host encerra citando a própria identidade de instância derivada, o log registra o mesmo em
`Critical`, e a mensagem diz que a identidade não pôde ser registrada — todas as gravações da linha de
heartbeat deste boot perderam a disputa para outra encarnação — e informa o último heartbeat e a versão de
quem venceu.

:::warning Mudou na 2.5.0 — uma identidade ativa é deslocada, não recusada
Até a 2.4.x, um boot que encontrava a própria identidade com um heartbeat ativo se recusava a iniciar (a
2.4.3 esperava antes). Desde a 2.5.0, ele **desloca** o detentor — veja a próxima entrada. A recusa acima
é a única que restou.
:::

**Diagnóstico.** Algo está reescrevendo a linha desta identidade mais rápido do que um boot consegue
assumi-la: dois hosts com o mesmo nome **iniciando no mesmo momento** com um mesmo banco de dados, ou uma
falha no banco. A identidade é o id de instância do App Service, quando a plataforma o define, e o nome
da máquina, quando não define. A recusa é fatal de propósito: um boot que não consegue gravar a própria
linha não pode ser distinguido de nenhum outro pela recuperação, pela assunção de jobs ou pela visão
**Instâncias**.

**Correção.** Consulte a visão **Instâncias** na página **Sistema** de uma instância que *está* rodando,
encontre a linha que detém essa identidade e pare o que mais a estiver usando, ou aponte-o para um banco
de dados próprio. **Não** apague a linha para contornar a recusa enquanto o detentor ainda estiver rodando —
isso remove o registro, não a condição.

### Depois de uma reimplantação, a instância antiga registra `has been displaced` e se retira

**Sintoma.** Trocar a imagem de um app em execução (`az webapp config container set`) produz, no log, um
Warning `displaced the previous incarnation … which was still live` e, cerca de três segundos depois, um
Critical `has been displaced`. O `/api/ready` de um dos containers traz uma linha `cluster-instance`
vermelha (e continua retornando 200), a página **Sistema** dele mostra um aviso, e um evento operacional
`InstanceStoodDown` é registrado.

**Diagnóstico. Esta é uma reimplantação in-place normal no App Service (desde a 2.5.0).** A plataforma
inicia o novo container **ao lado** do antigo na mesma instância — os dois derivam a mesma identidade — e
mantém o antigo atendendo até que o novo passe no probe de aquecimento. O novo container assume a
identidade imediatamente e registra qual encarnação deslocou; o antigo percebe isso no heartbeat seguinte
e **se retira**: não reivindica jobs novos, não faz assunção de jobs, não faz polling no Lacuna Signer à
toa, conclui o que já detém e continua servindo a web até a plataforma pará-lo. O que ele deixar
inacabado é assumido um `Cluster:StaleAfterSeconds` depois do deslocamento, pela política comum de
assunção. Não há falha de inicialização nem `ContainerStartupFailure`; a visão **Instâncias** mostra a
encarnação deslocada abaixo da linha da sucessora. Veja
[Operação](operations.md#quando-um-boot-encontra-a-própria-identidade-ainda-viva).

**Como ler o log da sobreposição.** Enquanto os dois containers rodam, o App Service grava a saída dos
dois processos em um só log, sem indicar de qual container veio cada linha; assim, o Critical do container
antigo aparece entre as linhas de boot do novo e dá a impressão de que o *novo* container se retirou. Não
se retirou: em um log de sobreposição, o Critical é sempre do container antigo — o recém-chegado registra
um Warning citando a encarnação que deslocou.

**Se, em seguida, o novo container falhar no aquecimento** — uma imagem com problema, um erro de
configuração detectado depois do registro —, o App Service para o **site inteiro**, inclusive o container
antigo já retirado, e o reinicia com a imagem *nova*, em um laço de 503s. No App Service, a solução é
sua: aponte o app de volta para a tag anterior com `az webapp config container set`, e ele fica pronto de
novo em cerca de dois minutos. Parar o app antes de trocar a imagem e iniciá-lo depois (veja
[Alta disponibilidade](high-availability.md#atualizações-exigem-parada-total)) evita totalmente a sobreposição e
continua sendo a forma mais limpa de implantar.

**Uma duplicata real — dois hosts com o mesmo nome, ou um deployment slot com a connection string de
produção — também não é mais recusada.** O boot mais recente desloca o anterior, e uma reinicialização do
host deslocado retoma a identidade; assim, os dois se alternam de forma ruidosa: um Warning em cada
recém-chegado, um Critical em cada processo que se retira, e uma encarnação deslocada na visão
**Instâncias** que não para de mudar. A cada momento, exatamente um deles reivindica trabalho. Encontre o
host que não deveria estar usando essa identidade e renomeie-o ou aponte-o para um banco de dados próprio.
Slots não são suportados nesta topologia.

### Boot recusado citando dois bancos operacionais

**Sintoma.** O host encerra dizendo que o marcador do compartilhamento de trabalho indica um banco
operacional diferente daquele configurado nesta instância, e cita os dois.

**Diagnóstico.** Dois clusters estão apontados para o mesmo compartilhamento de trabalho. Esta é a única
catástrofe que nenhum banco de dados consegue detectar — cada banco acredita ser dono da árvore, e eles
sobrescrevem os diretórios de preparação (staging), saída e erro um do outro —, e é exatamente para
detectá-la que o marcador existe.

**Correção.** Decida qual banco é o oficial e reaponte ou desative o outro. **Não** apague o marcador para
fazer a mensagem sumir; ele é a única verificação que detecta essa condição.

:::note O que essa verificação não detecta
Ela só recusa com base em evidência, nunca na ausência dela; por isso, um compartilhamento que ainda não
tem marcador e o instante em que o marcador está sendo gravado têm o risco reduzido, mas não eliminado — e
uma verificação que roda uma única vez, no boot, não consegue ver um cluster rival que chegue depois. Essa
verificação também **não** é o que impede que duas instâncias assinem o mesmo arquivo; isso cabe ao lease
por arquivo e à reivindicação no banco. Veja
[Alta disponibilidade](high-availability.md#a-verificação-do-compartilhamento-de-trabalho-cobre-menos-do-que-a-catástrofe-que-motivou-sua-criação).
:::

### Operadores (ou aprovadores) voltam para a tela de login de forma intermitente

**Sintoma.** As sessões funcionam e depois deixam de funcionar, aparentemente ao acaso — e com mais
frequência quanto mais instâncias estiverem rodando.

**Diagnóstico.** As instâncias não estão compartilhando um mesmo key ring de Data Protection; assim, um
cookie emitido por uma é rejeitado pela seguinte. Os dois cookies de sessão usam esse key ring, então
isso afeta tanto aprovadores quanto operadores. Duas causas:

- **Um host tem `Cluster:Enabled = false`.** O local do key ring depende dessa chave; por isso, esse host
  ainda usa o diretório `keys/` local.
- **As instâncias estão apontadas para bancos operacionais diferentes.** Banco diferente, key ring
  diferente.

**Correção.** Deixe a chave e a connection string idênticas em todas as instâncias — o que, no App
Service, é automático, já que os app settings são definidos por app. Observe que **a afinidade ARR não
resolve isso**: a afinidade serve ao circuito Blazor; o key ring compartilhado serve ao cookie.

### A inicialização registra um Critical sobre instâncias em uma versão diferente da aplicação

**Sintoma.** Um Critical no boot citando heartbeats ativos com uma versão diferente, e o host inicia mesmo
assim.

**Diagnóstico.** Versões diferentes estão compartilhando um mesmo banco, uma mesma fila e um mesmo
compartilhamento de trabalho. É um aviso, e não uma recusa, de propósito: recusar impediria instâncias de
iniciar durante todo o tempo que um heartbeat *morto* da versão antiga levasse para ser considerado
obsoleto — que é exatamente o momento seguinte a uma implantação que falhou.

**Correção.** Termine a implantação — pare todas as instâncias, implante, inicie. Se não há nenhuma
implantação em andamento, procure um slot ou uma segunda implantação usando este banco de dados. Trate o
Critical como o alarme que ele é; nada mais vai impedir isso. (Um container antigo sendo deslocado durante
uma reimplantação in-place não o dispara: trata-se da vida anterior da própria identidade, e não de outra
instância.)

### Um job está travado e nenhuma instância o processa

**Sintoma.** Uma linha fica em `Processing`, `Verifying` ou `AwaitingSigner` indefinidamente. Nenhum
evento de assunção aparece, e a recuperação no boot não a resolve.

**Diagnóstico.** A linha **não tem dono**, ou indica uma instância que não tem nenhuma linha de heartbeat.
A recuperação no boot trata apenas da identidade da própria instância, e a assunção depende do heartbeat
de um dono; assim, uma linha sem nenhum dos dois é uma linha que ninguém reconcilia. Linhas sem dono são
deixadas por uma build anterior à coluna de dono ou por uma execução com o modo desligado. Um job assim
despachado ao Lacuna Signer é pior do que parece: o `Signer:TimeoutHours` só é aplicado enquanto há
polling da linha; então, uma linha que ninguém consulta é uma linha sem limite de tempo.

**Correção.** **Inicie uma vez com `Cluster:Enabled = false`** e deixe a
[recuperação na inicialização](operations.md#recuperação-na-inicialização) comum varrer todas as linhas em
andamento, qualquer que seja o dono; depois, religue o modo. Faça isso na atualização, antes do primeiro
boot em cluster, e o problema deixa de existir. Essa é a solução indicada por todas as telas que encontram
uma dessas linhas.

### Linhas de log sobre reivindicações perdidas e conflitos de lease, em um cluster saudável

**Sintoma.** Linhas frequentes de "claim lost to a concurrent writer" e de conflito de lease de arquivos de
entrada sempre que arquivos chegam em lotes.

**Diagnóstico.** **Isso é o sistema funcionando.** Todas as instâncias monitoram todas as pastas; por isso,
elas disputam cada arquivo que chega, e, no modo cluster, o lado perdedor é registrado no nível de
resultado esperado, com um id de evento próprio. Ainda assim, cada arquivo vira exatamente um job — o
enfileiramento perdedor é recusado por um índice único parcial e respondido como `AlreadyActive`.

**Correção.** Nenhuma. Nenhum dos dois resultados entra no limite de falhas consecutivas de uma pasta;
assim, um cluster movimentado não consegue acionar o disjuntor por pasta só por estar movimentado. Veja
[Operação](operations.md#contenção-entre-instâncias-não-é-uma-falha).

### As séries do Prometheus pulam entre instâncias

**Sintoma.** Os gauges em `/api/metrics` são descontínuos, e o `bulksigner_jobs_awaiting_signer` mostra
um valor menor que a contagem do dashboard.

**Diagnóstico.** O `/api/metrics` é por processo, e o front door do App Service não consegue direcionar a
requisição para uma instância específica; assim, cada coleta cai na instância que o balanceador de carga
escolher. **Nenhuma configuração restaura a continuidade da coleta.** O gauge também é por instância, por
design: ele conta as linhas que *esta* instância acompanha por polling.

**Correção.** Use `sum()` sobre todas as instâncias para obter o total do cluster — nada é contado em
dobro, já que cada job tem exatamente um dono. Para um caminho suportado, use a distro do Application
Insights, que reconhece instâncias nativamente ([Telemetria](telemetry.md)). Veja
[Alta disponibilidade](high-availability.md#a-coleta-de-métricas-alcança-uma-instância-arbitrária).

### Uma pausa parou todas as instâncias, e isso não era esperado

**Sintoma.** O `POST /api/pipeline/pause` parou todas as instâncias, e não apenas aquela para a qual a
requisição foi enviada.

**Diagnóstico.** Não é uma falha. A flag de pausa é uma linha que todos os workers leem a cada iteração de
polling; por isso, a pausa vale para o cluster inteiro — que é o que um operador quer dizer ao pausar "o
pipeline". **Não existe drenagem por instância**, e ela não foi implementada de propósito.

**Correção.** Para tirar uma instância de serviço, pare-a e deixe a
[assunção](operations.md#quando-uma-instância-para-de-responder-uma-sobrevivente-assume-seus-jobs)
reconciliar o trabalho dela. Observe que a assunção fica *subordinada* à pausa; assim, um cluster pausado
não declara mortas as outras instâncias.

## Específico do Docker

### O `docker compose ps` mostra `(unhealthy)`

**Sintoma.** O container está rodando, mas aparece como `(unhealthy)`.

**Diagnóstico.** Execute `docker compose exec bulksigner curl -v http://localhost:8080/api/health` de
dentro do container. A imagem base traz o `curl`; a linha `HEALTHCHECK` no Dockerfile é a versão oficial
do comando de verificação.

### O `chown -R 1654:1654` falha / divergência de propriedade de arquivos

**Sintoma.** Os logs do container mostram permissão negada em `data/` ou `logs/`.

**Causa raiz.** A imagem roda como UID 1654. Em hosts Linux que fazem bind mount de `./data` e `./logs`,
esses diretórios precisam pertencer ao UID 1654.

**Correção.** Antes do primeiro start: `sudo chown -R 1654:1654 ./data ./logs`.

### Uploads falham com `Access to the path '/app/entrada' is denied`

**Sintoma.** Um upload pelo dashboard ou pelo `POST /api/files` falha com
`System.UnauthorizedAccessException: Access to the path '/app/<primeiro segmento de Storage:Inputs[0].Path>' is denied`,
em um container cuja primeira pasta monitorada está em um compartilhamento do Azure Files. Arquivos
colocados no compartilhamento são pegos normalmente.

**Causa raiz.** Antes da 2.4.2, a pasta de destino dos uploads era derivada como um caminho *local* a
partir do `Path` da primeira pasta, qualquer que fosse o provider dela; assim, `entrada/remessas` no
compartilhamento virava `/app/entrada/remessas` no disco do container — o diretório de trabalho, que
pertence ao root. Em uma instalação como serviço do Windows ou systemd, a mesma falha passava mais
despercebida: o upload era aceito em uma pasta local que nenhum observador lê.

**Correção.** Atualize para a 2.4.2 ou posterior e reinicie. Não é preciso mudar a configuração: os
uploads vão para a primeira pasta monitorada, no provider dela.

## Específico do Windows

### O serviço não inicia e não há entrada no log de Aplicativo

**Sintoma.** `Start-Service LacunaBulkSigner` falha; o Visualizador de Eventos não mostra nada útil.

**Passos de diagnóstico:**

1. Execute o binário em modo console a partir do local de instalação:
   `cd "C:\Program Files\Lacuna\BulkSigner"; .\Lacuna.BulkSigner.exe`. As exceções de bootstrap aparecem
   imediatamente.
2. Consulte `C:\ProgramData\Lacuna\BulkSigner\logs\bulksigner-*.log`.
3. O log de Aplicativo registra apenas eventos no nível do serviço; os eventos da aplicação ficam no log
   em arquivo.

### O serviço inicia, mas o arquivo de log está vazio

**Sintoma.** O `Get-Service` mostra Iniciado; o dashboard funciona; mas o `bulksigner-yyyyMMdd.log` está
vazio.

**Causa raiz.** A conta virtual do serviço não consegue gravar em
`C:\ProgramData\Lacuna\BulkSigner\logs\`. O script de instalação concede a permissão Modificar, mas uma
ACL alterada ou um software de segurança de terceiros pode ter desfeito isso.

**Correção:**

```powershell
icacls "C:\ProgramData\Lacuna\BulkSigner" /grant "NT SERVICE\LacunaBulkSigner:(OI)(CI)M" /T
```

## Específico do Linux

### O `systemctl status bulksigner` mostra `active (running)`, mas o `/api/health` não retorna nada

**Sintoma.** A unit está ativa, mas nenhuma resposta HTTP volta.

**Diagnóstico.** Execute `journalctl -u bulksigner -f` e procure o banner `Service ready`. Se o banner
nunca apareceu, o bootstrap está travado em alguma etapa. A unit com `Type=notify` só fica ativa quando o
bootstrap termina; portanto, se você vê `active (running)`, o bootstrap terminou — confira se o
`ASPNETCORE_URLS` está definido corretamente no `bulksigner.env`.

### O serviço está em estado `failed` após uma reinicialização do host

**Sintoma.** Após uma reinicialização do host, o `systemctl status bulksigner` está `failed`.

**Diagnóstico.** Execute `journalctl -u bulksigner -b` (desde este boot). Causas comuns:

- Uma variável de ambiente obrigatória não foi carregada — o `EnvironmentFile` é opcional (`-` no
  início); assim, a unit inicia sem ele, e o validador falha em seguida.
- O token PKCS#11 não estava conectado no boot. Conecte-o de novo e execute
  `sudo systemctl restart bulksigner`.

## Saída no console

### Uma execução em primeiro plano mostra um terminal vazio / quase em branco

**Sintoma.** Uma execução em primeiro plano mostra o banner de boot e o resumo de Service ready, e depois
o terminal parece silencioso — sem linhas de log por job, sem saída contínua.

**Causa provável.** Este é o comportamento previsto do
[Dashboard no console](dashboard.md#dashboard-no-console-somente-execuções-em-primeiro-plano): em um
terminal interativo, ele suprime a saída contínua do console e exibe um painel ao vivo, que se redesenha
no lugar.

**Diagnóstico.**

1. Redimensione o terminal / role para trás — o painel ao vivo pode estar algumas linhas abaixo da área
   visível.
2. Confira `data/logs/bulksigner-*.log` (ou o `Logging:File:Path` que você configurou) — o log em arquivo
   está sempre ativo e captura tudo.
3. Verifique se o terminal suporta posicionamento de cursor. Terminais modernos funcionam; o
   `conhost.exe` legado e alguns clientes SSH restritos passam a usar saída com rolagem.
4. Para desativar o painel e voltar à visão contínua do log, defina `Console:Dashboard:Enabled = false`
   e reinicie.

### Implantações em modo serviço não estão recebendo nenhuma saída padrão

**Sintoma.** O `journalctl -u bulksigner` ou o `docker logs <container>` mostra o banner de bootstrap,
mas nenhum evento depois dele.

**Causa provável.** A regra de ativação do dashboard ao vivo deveria impedir que ele seja ativado em um
host de serviço. Se você suspeita que ela está sendo acionada indevidamente no seu host, force a
desativação: defina `Console:Dashboard:Enabled = false` no `appsettings.Production.json` e reinicie. A
saída contínua do console volta a aparecer.

## Diagnóstico de último recurso

Quando nada acima ajudar:

1. **Aumente o nível de detalhe do log.** Defina `Logging:File:MinimumLevel = "Debug"` (ou `Verbose`) e
   reinicie. Reproduza o problema. Leia o log em arquivo.
2. **Leia o banner de bootstrap.** Ele mostra qual etapa estava mal configurada (impressão digital da
   licença, origem do certificado ou criptografia).
3. **Isole o problema por ambiente.** Execute o mesmo binário em primeiro plano, em modo `Development` —
   o terminal mostra o detalhe completo da exceção (o envelope de erro de Production o omite).
4. **Leia o log de eventos operacionais.** Desde a 2.13.0, a [página **Eventos**](dashboard.md#events--eventos-operacionais) do dashboard (e o
   `GET /api/events`) lista todos os eventos operacionais — pausa e retomada, edições de perfil, decisões
   de aprovação, assunções de jobs, inícios e paradas do serviço — do mais recente para o mais antigo, com
   filtros por tipo, intervalo de datas e texto. Uma trilha que começa com um evento `JobsCleared` começa
   ali porque o **Limpar Jobs** apagou o que havia antes.
5. **Inspecione o banco de dados.** `sqlite3 db/bulksigner.db` e consultas como
   `SELECT * FROM Jobs ORDER BY CreatedAt DESC LIMIT 20;` dão um quadro completo da atividade recente.

Se, depois de tudo isso, o sintoma continuar sem explicação, entre em contato com o suporte da Lacuna
Software com o banner de bootstrap, os trechos de log relevantes (a aplicação mascara segredos, mas
confira antes de enviar) e os passos exatos para reproduzir o problema.

---

**Anterior:** [Retenção](retention.md). **Voltar para:** [visão geral](index.md).
