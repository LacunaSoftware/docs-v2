---
sidebar_label: "Diagnóstico de problemas"
sidebar_position: 16
---

# Diagnóstico de problemas

Um guia de campo para os modos de falha que os operadores mais encontram. Cada entrada tem um sintoma, a
causa raiz mais provável, e os comandos para diagnosticar.

Se o bootstrap falhar, o banner de resumo de prontidão **não** é impresso — o serviço sai antes de
chegar nele. Olhe o local de log específico do alvo para encontrar a exceção de bootstrap:

| Alvo | Onde olhar |
|------|------------|
| Linux | `journalctl -u bulksigner -n 200` |
| Windows | Visualizador de Eventos → Logs do Windows → Aplicativo (origem `Lacuna.BulkSigner`) — exceções de bootstrap caem ali antes de o destino de arquivo ser ligado |
| Docker | `docker compose logs bulksigner --tail=200` |
| Console | A saída do terminal |

## O serviço não inicia

:::warning Alterado na 2.1.0 — um certificado que não abre não impede mais o host de subir
Os perfis de assinatura vivem na base operacional, e o lugar onde um certificado quebrado é corrigido é a
própria página do perfil no dashboard. Um host que se recusasse a iniciar não conseguiria servir essa
página, então um perfil cujo certificado não pode ser aberto — um arquivo ausente, uma senha errada, um
thumbprint que não corresponde a nada, um Key Vault inalcançável ou sem autorização, um blob ilegível —
agora é reportado como **`DEGRADED`** e o host sobe. Somente aquele perfil não consegue assinar; seus jobs
falham com `profile.degraded` (veja [Um job falha com `profile.degraded`](#um-job-falha-com-profiledegraded))
e todos os outros perfis continuam funcionando.

O que ainda recusa o boot é a *validação* de configuração: as regras abaixo que são verificadas contra o
arquivo de configuração ou o ambiente — a licença do PKI, o formato do bloco `Blob`, um PIN de PKCS#11
escrito em um arquivo, uma origem de repositório do Windows em um host não Windows, e as verificações
sobre uma seção `Signing:Profiles[]` que está sendo importada em um primeiro boot. As mesmas regras recusam
um salvamento na página do perfil.
:::

### `Signing:PkiSdkLicense is required`

**Sintoma.** O bootstrap lança uma exceção de validação reclamando de `Signing:PkiSdkLicense`.

**Causa raiz.** Nem `Signing__PkiSdkLicense` (ambiente) nem `Signing:PkiSdkLicense` (configuração)
carrega um valor não vazio.

**Correção.** Defina a variável de ambiente no alvo de instalação:

| Alvo | Comando |
|------|---------|
| Linux | Acrescente `Signing__PkiSdkLicense=<base64>` a `/etc/bulksigner/bulksigner.env`, então `sudo systemctl restart bulksigner`. |
| Windows | `[Environment]::SetEnvironmentVariable("Signing__PkiSdkLicense", "<base64>", "Machine"); Restart-Service LacunaBulkSigner` |
| Docker | Acrescente `Signing__PkiSdkLicense=<base64>` a `deploy/docker/.env`, então `docker compose up -d`. |

### `Signing:TrustLacunaTestRoot is true while the environment is 'Production'`

**Sintoma.** O boot é recusado com essa frase, terminando em "unset the key, or run the homologation host
as Staging (ASPNETCORE_ENVIRONMENT=Staging)".

**Causa raiz.** O host foi instruído a confiar na raiz PKI de **teste** da Lacuna — a emissora dos
certificados de teste Turing / Fermat (veja [Certificados](certificates.md#certificados-de-teste-e-o-conjunto-de-confiança)) — e também se declara
produção. As duas coisas são recusadas juntas, deliberadamente: um host de produção nunca confia em uma
raiz que não é uma autoridade certificadora. No Azure App Service o nome do ambiente tem padrão
`Production` quando nada o define, então um host de homologação que copiou um bloco de configurações de
produção e acrescentou a chave cai aqui.

**Correção.** Uma de duas, conforme o que o host é:

- Um host de produção: remova `Signing__TrustLacunaTestRoot` (ou defina-a como `false`). Certificados reais
  não precisam de nada.
- Um host de homologação: defina `ASPNETCORE_ENVIRONMENT=Staging` ao lado da chave. Qualquer nome que não
  seja `Production` é aceito; as linhas `environment` e `trust set` do banner então dizem o que o host é.

### `Auth:ApiKey is required`

**Sintoma.** O bootstrap lança erro reclamando de `Auth:ApiKey`.

**Causa raiz.** Ou não há valor, ou o valor tem menos que o mínimo de 16 caracteres.

**Correção.** Gere uma chave forte (veja [Segurança](security.md#rotação-da-chave-de-api)) e defina a
variável de ambiente correspondente.

:::note Depois de atualizar para a 2.3.1 ou posterior
Imagens anteriores à 2.3.1 traziam uma chave de API provisória dentro do seu próprio arquivo de
configurações padrão. Uma implantação que nunca definiu `Auth:ApiKey` estava rodando silenciosamente sobre
esse valor provisório, e se recusa a iniciar após a atualização, nomeando a chave. Defina `Auth__ApiKey`
como todo caminho de instalação documenta.
:::

### `Pkcs11 PIN env var <nome> is empty`

**Sintoma.** O serviço sobe, mas o perfil é reportado como `DEGRADED` — no banner de inicialização, em
`/profiles` e em `/api/ready/details` — com o motivo
`PKCS#11 PIN environment variable '<nome>' is empty`. Antes da 2.1.0, isso impedia o boot.

**Causa raiz.** `Signing:Certificate:Source = Pkcs11`, mas a variável de ambiente configurada não está
definida ou está vazia.

**Correção.** Defina a variável de ambiente nomeada por `Signing:Certificate:Pkcs11:PinEnvVar` (padrão
`BULK_SIGNER_PKCS11_PIN`) e reinicie. Veja [Certificados](certificates.md#tratamento-do-pin).

### `WindowsStore source is not supported on this OS`

**Sintoma.** O bootstrap falha imediatamente em um host Linux ou Docker.

**Causa raiz.** `Signing:Certificate:Source = WindowsStore` configurado em um host não Windows.

**Correção.** Troque a origem. Para Linux / Docker, use `Pfx`, `Pkcs11` ou `AzureKeyVault`.

### `AzureKeyVault:Endpoint must be an absolute https:// URL`

**Sintoma.** O bootstrap falha ao validar o bloco do Azure Key Vault.

**Causa raiz.** O `Signing:Certificate:AzureKeyVault:Endpoint` recebeu um nome DNS puro
(`my-vault.vault.azure.net`) ou uma URL `http://`. O conector precisa da URL completa do cofre, e um
nome puro, de outro modo, falharia lá no fundo do cliente do Azure com uma mensagem muito menos útil.

**Correção.** Use a URL do cofre exatamente como o portal do Azure a mostra, por exemplo
`https://my-vault.vault.azure.net/`.

### `Certificate '<caminho>' does not match Azure Key Vault key '<nome>'`

**Sintoma.** O banner de inicialização reporta o perfil como `DEGRADED`, com um motivo dizendo que a
chave pública do certificado difere da chave do cofre, e os jobs do perfil falham com `profile.degraded`.
(Antes da 2.1.0 isso impedia o boot.)

**Causa raiz.** `CerPath` — ou `Blob:Url`, quando o certificado é lido
[de um blob](certificates.md#lendo-o-arquivo-de-um-blob) — e `KeyName` se referem a pares de chaves
diferentes. Geralmente o certificado foi renovado contra uma **nova** chave de cofre enquanto o `KeyName`
ainda aponta para a antiga, ou o local do certificado ficou apontando para um certificado sem relação após
uma edição. A mensagem nomeia o local que o perfil usa, como `file '<caminho>'` ou
`blob '<conta>/<container>/<blob>'`.

Esta verificação existe porque a alternativa é pior: sem ela, o perfil assinaria alegremente e produziria
assinaturas que verificador nenhum aceita, e a falha apareceria somente por job — e somente em perfis com
`Verify = true`.

**Correção.** Confirme qual lado está desatualizado comparando as duas chaves públicas diretamente:

```bash
openssl x509 -in signer.cer -noout -pubkey
az keyvault key download --vault-name my-vault --name bulk-signer-signing-key --encoding PEM --file -
```

Os dois blocos PEM precisam ser idênticos byte a byte. Depois atualize o lado que estiver errado — o local
do certificado ou o nome da chave são corrigidos na página do perfil com **Edit certificate** — e
reinicie.

### Falha de autenticação ou autorização no Azure Key Vault na inicialização

**Sintoma.** O banner de inicialização reporta o perfil como `DEGRADED` ao carregar seu certificado, com um
erro do Azure como `AADSTS7000215` (client secret inválido), `AADSTS700016` (aplicação não encontrada), ou
um `Forbidden` na operação de chave. O host sobe; os jobs do perfil falham com `profile.degraded`. (Antes da
2.1.0 isso impedia o boot.)

**Causas possíveis.**

- **Client secret expirado.** Segredos do Entra ID têm vida finita; a expiração se parece com uma falha
  súbita de boot depois de uma reinicialização que antes funcionava. Rotacione no Azure e atualize o
  `Signing__Certificate__AzureKeyVault__AppSecret`.
- **`AppId` errado**, ou o registro de aplicativo vive em um tenant diferente do cofre.
- **Permissões de chave ausentes.** O registro de aplicativo precisa de *get* na chave mais a operação
  criptográfica *sign* — a role interna **Key Vault Crypto User** em um cofre com RBAC. Um `Forbidden`
  com credenciais de resto válidas aponta para cá.
- **Sem caminho de rede.** O host precisa alcançar `*.vault.azure.net` e `login.microsoftonline.com`.
  Confira as regras de saída e a configuração de proxy.

As falhas são reportadas por perfil, e todo perfil com falha é nomeado no mesmo banner, então uma
implantação com múltiplos perfis vê cada perfil mal configurado em um único boot, em vez de um por
reinicialização. Depois de corrigir o segredo ou a atribuição de role, **reinicie** — um certificado é
aberto uma vez, na inicialização.

### Um blob de material de assinatura não pode ser lido na inicialização

**Sintoma.** O banner de inicialização reporta um perfil como `DEGRADED`, citando um blob como
`<conta>/<container>/<blob>`. **O host sobe.** O perfil não consegue assinar até que o blob esteja legível
e o serviço seja reiniciado; todos os outros perfis não são afetados, e os jobs roteados para este falham
com `profile.degraded`.

:::warning Alterado na 2.1.0
Antes da 2.1.0 um blob ilegível impedia o boot. Agora ele degrada apenas aquele perfil, pelo motivo dado
no início desta seção.
:::

Três mensagens distintas, porque elas têm três correções distintas:

| Mensagem | Causa raiz | Correção |
|---|---|---|
| `… does not exist` | O nome do container ou do blob está errado. Ambos diferenciam maiúsculas de minúsculas, e a URL é lida exatamente como escrita. | Corrija `Blob:Url`. Confirme com `az storage blob exists --account-name <a> --container-name <c> --name <b>`. |
| `… credential was refused (HTTP 403)` | A credencial se autenticou, mas não tem permissão para ler o blob. | Para `ManagedIdentity` / `ServicePrincipal`, conceda **Storage Blob Data Reader** no container ou na conta — nada mais amplo é necessário, nunca. Para `AccountKey`, a chave está errada ou foi rotacionada. |
| `… the <modo> credential could not be obtained` | A credencial não pôde ser obtida de forma alguma, antes de qualquer requisição ser feita. | `ManagedIdentity`: o host precisa de uma identidade **atribuída pelo sistema**, e um host fora do Azure não tem nenhuma. `ServicePrincipal`: confira `TenantId` / `AppId` / `AppSecret` — um segredo expirado reporta de forma idêntica. |

Qualquer outra coisa (um 5xx, uma falha de transporte) é reportada com o status que o serviço retornou e
aponta para alcance de rede: o host precisa de HTTPS de saída para o endpoint de blob. A leitura já foi
repetida três vezes com backoff exponencial, então um soluço isolado não chega a esta mensagem.

**A renovação não se corrige sozinha.** O blob é lido uma vez, no boot, então substituir seu conteúdo exige
uma reinicialização exatamente como substituir um arquivo local — e corrigir o blob não tira a degradação
de um host em execução.

### O logo do cliente não aparece nas páginas de login ou de aprovador

O serviço está no ar e as páginas mostram apenas a marca do produto. Isso é por design: um logo configurado
(`Branding:CustomerLogo`, veja [Configuração](configuration.md#branding--o-logotipo-do-cliente-nas-páginas-de-login-e-de-aprovação)) cujos **bytes** não puderam ser usados
não impede o serviço de subir. Leia o motivo em qualquer um de três lugares:

- a linha `customer logo` do banner de resumo de prontidão — `not loaded from file '…': <motivo>`;
- o log de inicialização, um Warning com o texto `Customer logo not loaded from …`;
- a página **Sistema**, um alerta no topo do painel de armazenamento.

O motivo é um de: o arquivo ou blob está ausente ou não pode ser lido (confira o caminho, a montagem no
Docker, a atribuição de role do blob); o arquivo está vazio ou tem mais de **256 KiB** (exporte um menor —
ele é renderizado com no máximo 80 px de altura); ou os bytes não são o que a extensão diz (um JPEG
renomeado para `.png`, uma página HTML salva como `.svg` — renomeie ou reexporte). Corrija e **reinicie**: o
logo é lido uma vez, no boot.

Se o serviço *não* subiu, a mensagem nomeia `Branding:CustomerLogo:…` e uma das regras de formato: `Path` e
`Blob` ambos definidos, uma extensão fora de `.png` / `.jpg` / `.jpeg` / `.webp` / `.svg`, ou um bloco de
blob sem seu `Url` ou sua `Credential`. Esses são recusados no boot como qualquer outro erro de
configuração.

### A inicialização é recusada porque `Signing:ProfileSecretsKey` não está definida

**Sintoma.** Uma de duas recusas, e qual delas lhe diz onde a implantação está:

```
Refusing to start: this deployment's operational store holds signing profile secrets that were
encrypted under Signing:ProfileSecretsKey, and that key is not set. …
```

```
Refusing to start: signing profiles are being imported into the operational store for the first
time, and some of them carry a secret — 'folha', 'nfe' — while Signing:ProfileSecretsKey is not set. …
```

A primeira é um host que já detém dados de perfil criptografados. A segunda é o **primeiro boot** após uma
atualização, recusando no momento em que os dados passariam a existir — de modo que a base nunca chega a
guardar um valor que nada consegue abrir. A segunda nomeia os perfis.

**Causa raiz.** Os perfis de assinatura são linhas na base operacional, e uma senha de PKCS#12, um segredo
de aplicativo do Key Vault, uma credencial de blob de material de assinatura e **bytes de PKCS#12 enviados
por upload** são criptografados em repouso sob uma chave mantida *fora* do banco de dados. A recusa é o
**par** — dados que foram criptografados, e nada com que descriptografá-los — nunca uma das metades
sozinha. Uma implantação cujos perfis não carregam segredo nunca é solicitada a fornecer uma chave, e é por
isso que a maioria das instalações atualiza sem jamais encontrar isto.

**Por que isto recusa quando um certificado ruim apenas degrada.** A correção aqui é uma variável de
ambiente, não algo em uma página do dashboard, então recusar não cria impasse — e uma chave ausente
desabilitaria de uma vez todo perfil que carrega segredo, um host que se reporta saudável enquanto não
consegue assinar para ninguém.

**Correção.** Defina a chave e inicie de novo:

```bash
Signing__ProfileSecretsKey='<o valor sob o qual os segredos foram salvos>'
```

Ela precisa ser o **mesmo valor** sob o qual os segredos foram salvos — veja
[Um perfil está degradado dizendo que um segredo armazenado não pôde ser descriptografado](#um-perfil-está-degradado-dizendo-que-um-segredo-armazenado-não-pôde-ser-descriptografado)
se você não o tem mais. Mantenha-a fora do controle de versão, fora do mesmo backup do banco de dados, e
onde quer que os outros segredos irrecuperáveis estejam guardados (veja [Segurança](security.md#a-chave-de-segredos-dos-perfis-de-assinatura-signingprofilesecretskey)).

**Se a segunda recusa nomeia um perfil que você nunca declarou** — ou nomeia os seus ao lado de um que você
não declarou — o host está lendo um array `Signing:Profiles[]` de um arquivo de configurações *por baixo*
do seu. A configuração mescla arrays por índice e consegue sobrescrever uma chave, mas nunca removê-la: as
suas configurações `Signing__Profiles__0__*` se mesclam sobre o que quer que aquele arquivo declare no
índice 0 e herdam toda chave que não nomearam, inclusive uma senha de PFX. Imagens anteriores à 2.3.1
traziam perfis de exemplo de desenvolvimento em seu próprio arquivo de configurações padrão dessa forma.
Atualize a imagem, ou remova o arquivo que os declara. **Não responda definindo a chave**: a importação
acontece uma única vez e nada apaga um perfil, então isso importaria os perfis intrusos permanentemente.
Nada foi escrito — a recusa dispara antes da importação — então o próximo boot importa de forma limpa.

**Um aviso relacionado que não é esta recusa.** Se a base operacional não respondeu na inicialização *e* a
chave não está definida, o host **sobe** e avisa que não conseguiu verificar se existem segredos de perfil,
e que o próximo boot que alcançar a base pode recusar. Trate isso como um lembrete para definir a chave
antes de a base voltar.

### `Encryption.Salt must decode to at least 16 bytes`

**Sintoma.** O bootstrap falha quando `Encryption:Enabled = true`.

**Causa raiz.** O salt em base64 configurado está ausente, malformado, ou tem menos de 16 bytes
decodificados.

**Correção.** Regenere com 32 bytes aleatórios (veja [Criptografia](encryption.md#gerando-o-salt)).

### `Encryption.Iterations must be at least 10000`

**Sintoma.** O bootstrap falha com uma mensagem de iterações baixas.

**Causa raiz.** Erro de digitação — `600` em vez de `600000` em `Encryption:Iterations`.

**Correção.** Use 600.000 (recomendação da OWASP de 2023) ou mais.

### O serviço inicia mas o `/api/ready` retorna 503 persistentemente

**Sintoma.** O `Get-Service` mostra Iniciado / o `systemctl` mostra ativo, mas o `/api/ready` retorna
503.

**Causa raiz.** Uma sondagem de prontidão está falhando. O corpo da resposta lista cada sondagem pelo
nome, com `ok` verdadeiro ou falso — banco, pasta de entrada, licença.

:::warning Alterado na 2.6.0 — o detalhe foi para `/api/ready/details`
O `/api/ready` anônimo agora carrega apenas o veredito: `ready`, e o `name` e o `ok` de cada verificação.
O `detail` por verificação — que nomeava o host do SQL Server, cada compartilhamento de entrada e o local de
um certificado degradado — está em `GET /api/ready/details`, protegido pela chave de API (`X-API-Key`) ou
por uma sessão de operador, com a mesma regra de 200 / 503. Um monitor que lia o `detail` na rota anônima
passa para a rota de detalhes e acrescenta o cabeçalho. `Readiness:RequireApiKey = true` coloca o próprio
`/api/ready` atrás da chave também — deixe desligado onde a sonda não consegue enviar o cabeçalho (a
verificação de integridade do App Service não consegue).
:::

**Se já tiver se resolvido** quando você for olhar, o log durável guarda o ocorrido: toda mudança de
veredito de uma verificação é escrita uma vez, como `Readiness check <nome> went red: <detalhe>` em Warning
e `Readiness check <nome> recovered` em Information. Um vermelho constante é escrito uma vez, não a cada
sondagem, então busque pelo nome da verificação em vez de ler as últimas linhas.

**Correção.** Inspecione o `/api/ready/details`, e então:

| Sondagem que falhou | Onde olhar |
|---------------------|------------|
| `database` | O detalhe nomeia a base que foi verificada — `SQLite (…)` ou `SQL Server (servidor/banco)`. Sob `Sqlite`: o caminho sob `Storage:Root` é gravável pela conta de serviço? Sob `SqlServer`: o servidor está alcançável, e o login ainda autentica? Quando o detalhe lê `unreachable` com um tipo de exceção depois do nome da base, o log durável carrega aquela exceção, com a mensagem, em Warning — uma linha por sondagem que falhou, então leia a primeira. |
| `input-folder:<nome>` | A pasta existe? A conta de serviço tem permissão para enumerá-la? Semântica estrita — qualquer pasta ausente ou `Stopped` reprova a resposta inteira. |
| `storage-share:<conta>/<compartilhamento>` | Somente em compartilhamento de trabalho remoto. Credencial, alcance de rede, ou a string de escopo da atribuição de role — veja [Segurança](security.md#credenciais-de-armazenamento-do-azure-files). |
| `work-share-owner` | Somente em compartilhamento de trabalho remoto. Outra instância detinha o marcador na inicialização, ou a reivindicação não pôde ser feita. Veja abaixo. |
| `license` | A licença do PKI foi carregada? A impressão digital está no banner de resumo de prontidão; ausente significa que a string de licença foi rejeitada no boot. |

Algumas linhas reportam `ok: false` **sem** transformar a resposta em 503, deliberadamente, porque um 503
tiraria a instância do seu balanceador de carga enquanto o dashboard necessário para corrigir o problema é
servido justamente por aquela instância: `signing-profile:<nome>` (um perfil degradado — veja
[Um job falha com `profile.degraded`](#um-job-falha-com-profiledegraded)), `profile-input-folder:<nome>`
(um perfil vinculado a uma pasta que este host não configura) e, no modo cluster, `cluster-instance` (uma
instância deslocada se retirando). Uma linha `signing-profile-keyless:<nome>` é `ok: true` por design, e
uma pasta de entrada que nenhum perfil escolheu é reportada como verde. **Alerte sobre as entradas
individuais de `checks[]`, e não apenas sobre o booleano `ready` de nível superior.**

### A inicialização falha com `Signing:Profiles[N].Approval …`

**Sintoma.** O host se recusa a iniciar com uma mensagem nomeando uma chave de aprovação.

**Quando isto pode acontecer.** Desde que os perfis passaram para a base operacional (2.1.0), o
`Signing:Profiles[]` é importado apenas no **primeiro boot contra uma tabela de perfis vazia**, e estas
regras são verificadas nesse momento. Depois disso, as mesmas regras recusam um salvamento do formulário
`Edit approval` do perfil no dashboard, com o mesmo texto; editar o arquivo de configuração não muda mais
perfil algum.

**Causas raiz**, todas recusadas antes de o primeiro job rodar:

| A mensagem nomeia | Correção |
|-------------------|----------|
| `Approval` sem `CheckCNAB240` | Acrescente `"CheckCNAB240": true` ao mesmo perfil. Um aprovador a quem não se pode mostrar o valor não está aprovando nada significativo. |
| Um pool `Approvers` vazio | O pool é obrigatório e não vazio quando `Approval` está presente. |
| `MinimumApprovers` abaixo de 1 ou maior que o pool | Um quórum maior que o pool nunca pode ser atingido, então todo job ficaria retido para sempre. |
| Um e-mail malformado, ou o mesmo e-mail duas vezes | Um humano em duas vagas do pool poderia satisfazer sozinho um quórum de dois. |
| Um CPF cujos dígitos verificadores não conferem | Um erro de digitação nomeia uma pessoa diferente, e a linha de auditoria resultante parece exatamente tão autoritativa quanto uma correta. |
| Um `ExpiresAfter` não positivo | Use a forma `d.hh:mm:ss`, por exemplo `"2.00:00:00"`. |

### A inicialização avisa `has an approval wait budget of …`, ou o prazo de um job retido está a semanas de distância

**Sintoma.** O banner avisa sobre um orçamento de espera longo, ou o prazo de decisão de um job está
muito mais distante do que se pretendia.

**Causa raiz.** A grafia do TimeSpan. Um valor de três componentes é `hh:mm:ss` apenas enquanto o
primeiro número for 23 ou menos; em 24 ou mais o .NET o lê como **dias**, então `"48:00:00"` são
quarenta e oito *dias*.

**Correção.** Escreva o componente de dias: `"2.00:00:00"` — no formulário `Edit approval` do perfil no
dashboard, já que depois do primeiro boot o arquivo de configuração não muda mais um perfil armazenado. O
boot é o único momento em que isso é sinalizado — toda outra superfície mostra o prazo quando um job já
ficou retido sob ele, e o orçamento fica congelado naqueles jobs. A correção vale apenas para jobs
**novos**: cancele e reexecute qualquer coisa já retida sob a janela errada.

### A inicialização é recusada porque tanto um caminho quanto um blob estão configurados

**Sintoma.** O boot falha dizendo que `Path`/`CerPath` e `Blob` são mutuamente exclusivos — ou que
nenhum dos dois está definido.

**Correção.** Exatamente um dos dois. Veja
[Certificados](certificates.md#lendo-o-arquivo-de-um-blob).

### A inicialização falha com uma mensagem de configuração do Azure Files

**Sintoma.** O boot falha nomeando uma chave de `Storage:AzureFiles` ou `Storage:Inputs[N]`.

**Causas raiz.** Um provider ou modo de credencial não reconhecido; um bloco de credencial parcial para o
modo escolhido; um compartilhamento NFS (somente SMB); um caminho `azurefiles://` em `Storage:Root`,
`Logging:File:Path` ou — sob `Database:Provider = Sqlite` — `ConnectionStrings:Default`; uma barra
invertida no `Path` de uma pasta remota; `Directory` escrito em uma pasta de entrada; uma pasta
`AzureFiles` que não resolve para intervalo de sondagem algum; ou uma pasta de entrada cujo caminho
colide com uma das raízes de trabalho (`output`, ou `prod/output` sob um prefixo `Directory`).

Este último é recusado porque, de outro modo, apagaria um artefato assinado por iteração enquanto
reportaria todo job como `Completed`.

### Uma implantação que antes subia agora recusa, nomeando uma pasta de entrada monitorada

**Sintoma.** Após uma atualização, o boot falha nomeando um caminho de `Storage:Inputs[N]` que colide com
uma das raízes de trabalho — `output/`, `processing/` ou `error/`.

**Diagnóstico.** Esta recusa se aplica em **todo** provider de armazenamento, não apenas no Azure Files,
e é uma mudança deliberada: uma configuração assim estava monitorando o diretório em que escreve
artefatos finalizados, então cada arquivo assinado era reingerido, reassinado e então **apagado** como o
"original" da próxima iteração. A implantação parecia saudável e reportava todo job como `Completed` o
tempo todo.

**Correção.** Aponte a pasta de entrada para algum lugar fora das raízes de trabalho. Antes de editar,
**confira o `output/` contra o que os destinatários de fato coletaram** — a recusa lhe diz que a
configuração estava errada, não há quanto tempo ela vinha destruindo artefatos.

### Um arquivo é recusado com `job.path-too-long`

**Sintoma.** Um upload ou um arquivo monitorado é rejeitado, nomeando um limite de comprimento de caminho
de 850 caracteres.

**Diagnóstico.** O caminho original do job é registrado na base operacional, e um caminho além daquele
limite não pode ser. Ele agora é recusado **no momento em que o arquivo é recebido**, em vez de aceito e
reprovado depois, em todo provider de banco de dados, de modo que a falha chega ao chamador que ainda
pode fazer algo a respeito.

**Correção.** Reduza o aninhamento de diretórios ou o nome do arquivo. Árvores profundamente aninhadas e
particionadas por data sob um prefixo `Directory` do Azure Files são a causa usual, já que o prefixo conta
para o total.

### A sondagem reporta um compartilhamento como inalcançável na inicialização

**Sintoma.** O banner lê `azure shares = 1 of 2 reachable`, o `/api/ready` está vermelho em uma linha
`storage-share:` (cujo detalhe, em `/api/ready/details`, é a própria frase do serviço de armazenamento), e
o host subiu mesmo assim.

**Causa raiz.** Credencial, alcance de rede, ou escopo de role. A mais comum é a **string de escopo**: uma
atribuição construída com a grafia do plano de gerência `shares` em vez da do plano de dados `fileshares`
vincula sem reclamar e não concede nada, e então falha como `AuthorizationPermissionMismatch`.

**Correção.** Compare a string de escopo antes de rotacionar qualquer coisa, e confirme que a identidade
detém `Storage File Data Privileged Contributor` — uma role somente leitura **não** basta nem para uma
pasta de entrada. O host subir degradado em vez de se recusar a iniciar é deliberado: um compartilhamento
fora do ar às 03:00 não pode transformar uma reinicialização em um serviço que não inicia.

## A autenticação falha

### `401 Unauthorized` de todo endpoint

**Sintoma.** Toda requisição retorna `401 { code: "auth.invalid-credentials" }` ou
`{ code: "auth.misconfigured" }`.

**Causas possíveis:**

- Chave de API errada no cabeçalho `X-API-Key`. Compare byte a byte com `Auth:ApiKey` / `Auth__ApiKey`.
- `Auth:ApiKey` vazia em tempo de execução (o caso mal configurado). Busque no log por
  `Auth:ApiKey is empty at runtime`.
- O cookie expirou — expiração deslizante de 8 horas. Entre de novo em `/login`.

### O login em `/login` redireciona em laço

**Sintoma.** Enviar o formulário de login cai em `/login?error=...`.

**Causas possíveis:**

- `?error=invalid` — chave de API errada. Reconfira.
- `?error=server` — `Auth:ApiKey` está vazia em tempo de execução. Corrija a configuração e reinicie.

### O login funciona mas o dashboard desconecta imediatamente

**Sintoma.** O login tem sucesso, a página cai em `/`, e a próxima navegação volta para `/login`.

**Causa raiz.** O cookie de sessão não está voltando por um proxy reverso que remove o cabeçalho
`Set-Cookie`, ou o cookie está sendo marcado como `Secure` enquanto a requisição alcançou a aplicação
como HTTP puro.

**Correção.** Garanta que o proxy reverso repasse os cabeçalhos `Set-Cookie` e `Cookie` sem modificação.
Se terminar o TLS no proxy, defina `X-Forwarded-Proto: https` para que a aplicação marque o cookie como
`Secure`.

### A inicialização falha com `Auth:EntraId:… is required when the Auth:EntraId section is present`

**Causa raiz.** A seção é **condicionada à presença** — escrevê-la torna as três chaves obrigatórias.
"Presente mas vazio" não significa *desligado*.

**Correção.** Forneça a chave que falta, ou remova a seção `Auth:EntraId` inteira para voltar ao login
por chave de API.

### O login do Entra falha na Microsoft com `AADSTS50011` (divergência de redirect URI)

**Causa raiz.** A URI de redirecionamento do registro de aplicativo não corresponde ao callback do host.

**Correção.** Registre uma URI de redirecionamento do tipo **Web** exatamente como
`https://<seu-host>/signin-oidc` — esquema, host, porta e caminho todos precisam coincidir com o que o
navegador de fato alcança.

### O login do Entra tem sucesso, mas cai em `/access-denied`

**Causa raiz.** A conta se autenticou mas não carrega **nenhuma das app roles**. A aplicação impõe a
presença da role independentemente da configuração do tenant.

**Correção.** Atribua `Administrator` ou `Approver` (ou ambas) na aplicação empresarial. Os valores de
role no manifesto precisam coincidir exatamente com aquelas strings. Não há mapeamento por grupo de
segurança, deliberadamente.

### Os eventos de auditoria de um operador do Entra dizem `(anonymous)`, e o menu do usuário também

**Sintoma.** Um `Administrator` conectado cria ou edita um perfil, pausa o pipeline ou executa um backup,
e o evento operacional nomeia `(anonymous)`. O menu do usuário lê *Signed in as (anonymous)*, e uma
execução manual de backup na página Backup lê *manual · (anonymous)*.

**Causa raiz.** Desde a 2.2.1 o nome registrado do operador é a claim `preferred_username` do token (o
UPN), e a sessão que esse operador detém não foi nomeada por ela. Antes da 2.2.1 os eventos de todo
operador do Entra saíam assim, qualquer que fosse o token, e **essas linhas não podem ser reparadas** —
apenas eventos escritos por uma sessão iniciada depois da atualização carregam o autor.

**Causas possíveis, em ordem de probabilidade:**

- **Uma sessão anterior à atualização.** O nome vive no cookie de sessão, e o cookie desliza por oito
  horas, então um operador que permaneceu conectado durante a atualização mantém a sessão antiga. **Saia
  e entre de novo uma vez.** Nenhuma linha de log acompanha este caso.
- **O token não carregava `preferred_username`.** O Bulk Signer sempre solicita o escopo `profile`, que
  carrega a claim, então o tenant a reteve — consentimento do usuário ao `profile` recusado ou restrito,
  ou uma customização de token no registro de aplicativo. Este caso é anunciado: o login escreve um aviso
  no log nomeando os tipos de claim que recebeu (nunca seus valores), então busque no log por
  `preferred_username`. Um `Administrator` convidado é registrado sob a forma `#EXT#` do UPN, o que está
  correto.
- **O host é anterior à 2.2.1.** Atualize; depois saia e entre de novo.

O nome de exibição deliberadamente não é usado como alternativa, então os eventos permanecem `(anonymous)`
em vez de serem registrados sob um nome que duas pessoas podem compartilhar.

### Um `Approver` do Entra entra, mas o portal está vazio

**Causa raiz.** A role abre a porta; o **pool congelado** ainda decide quais jobs a pessoa vê, casado
pelo e-mail que o diretório dela afirma. O endereço dela não está em pool algum.

**Correção.** Compare o endereço na lista `Approvers` do perfil com o atributo de e-mail da conta. Para
**contas de convidado**, certifique-se de que o atributo mail carregue o endereço corporativo configurado
no pool — o UPN adulterado com `#EXT#` deliberadamente não é usado como alternativa. Uma conta cujo token
não carrega claim de e-mail nenhuma é recusada de imediato, com uma página que diz isso.

### Depois de habilitar o modo Entra, os operadores são desconectados e o `/api/auth/login` para de funcionar

**Não é uma falha.** Ligar o modo aposenta toda sessão de navegador criada por chave de API de uma vez, e
um POST em `/api/auth/login` não emite cookie nem para uma chave correta — desligado, não escondido.
Planeje a virada como um "desconectar todo mundo". Clientes REST que usam `X-API-Key` não são afetados.

### Sair e entrar de novo acontece instantaneamente, sem pedir senha

**Não é uma falha.** Sair é apenas local: limpa a sessão do Bulk Signer e deliberadamente não encerra a
sessão Microsoft da pessoa. Isso é comportamento normal de SSO. Desde a 2.2.1 sair encerra, sim, a janela
de verificação do segundo fator de um aprovador, então a reentrada silenciosa de um colega em uma estação
de trabalho compartilhada volta a pedir o código.

## A assinatura falha

### Um job falha com `profile.degraded`

**Sintoma.** Os jobs vão de `Queued → Failed` com o erro `profile.degraded`. O histórico do job diz que o
perfil está degradado e cita o motivo. Jobs em outros perfis continuam concluindo normalmente. O banner de
inicialização reportou o mesmo perfil como `DEGRADED`, e o `/api/ready` carrega uma linha
`signing-profile:<nome>` com `ok: false` — o motivo está em `/api/ready/details`, com a chave de API.

**Causa raiz.** O certificado daquele perfil não pôde ser aberto quando o host iniciou — um arquivo PKCS#12
ausente, uma senha errada, um thumbprint que não corresponde a nada no token ou no repositório, um Key
Vault inalcançável, ou um blob de material de assinatura ilegível. O motivo nomeia qual. Três textos que
vale conhecer:

- **Uma senha de PKCS#12 errada** lê *did not open with the PKCS#12 password given — check the PKCS#12
  password on the profile, and if it is right, supply the file again*, seguido da frase do próprio PKI
  SDK, que fala de um **PIN** incorreto: o SDK usa uma só palavra para uma senha de PKCS#12 e um PIN de
  token, e o perfil não tem PIN a corrigir. A segunda metade está lá porque a verificação por trás dela é a
  tag de integridade do arquivo, na qual um arquivo danificado falha do mesmo jeito com a senha certa.
- **Um PKCS#12 com o envelope moderno** lê *is encrypted with PBES2, which the signing library does not
  open*. A biblioteca de assinatura abre apenas o envelope clássico, e tanto o OpenSSL 3 por padrão quanto
  uma exportação do Windows configurada como AES256-SHA256 escrevem PBES2 / AES-256. No Windows, reexporte
  a partir do repositório de certificados com a opção TripleDES-SHA1. A partir do `.pfx` que você tem,
  reexporte pelo OpenSSL e forneça o novo arquivo:

  ```bash
  openssl pkcs12 -in modern.pfx -nodes -passin pass:<senha> -out tmp.pem
  openssl pkcs12 -export -legacy -in tmp.pem -passout pass:<senha> -out signing.pfx
  shred -u tmp.pem   # a chave privada está em claro no tmp.pem
  ```

  (`-legacy` precisa do provider legado do OpenSSL 3; em uma build sem ele,
  `-keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES` produz um envelope clássico que a biblioteca também
  abre.) A mesma frase volta também com uma senha errada, deliberadamente — o envelope é o bloqueio, seja
  qual for a senha.
- **Um arquivo, blob ou upload vazio** é recusado antes de qualquer decodificação, como
  *Certificate file '…' is empty (0 bytes)*, nomeando o local — geralmente um marcador criado enquanto se
  esperava o arquivo real, ou uma cópia que nunca terminou.

**Isto não é um arquivo ruim.** `profile.degraded` e `cnab240.invalid` são as duas falhas mais facilmente
confundidas, e os remédios não têm nada em comum: um perfil degradado significa que todo arquivo roteado
para ele vai falhar até que a implantação seja corrigida, enquanto um arquivo recusado significa que aquele
arquivo precisa ser reexportado. Repetir o job antes de corrigir o certificado falha de forma idêntica.

**Nem é um perfil sem chave.** Um perfil cuja regra de aprovação faz os **aprovadores** assinarem
(`Approval.Signers = Approvers`) não detém certificado próprio, por design: o banner prefixa sua linha com
`KEYLESS` em vez de `DEGRADED`, o `/api/ready` o reporta em uma linha `signing-profile-keyless:<nome>` com
`ok: true`, e nenhum job nele falha com `profile.degraded`. O que falha ali, por nome, é um envelope de
assinaturas dos aprovadores ausente (`approval.signatures-missing`) ou um conjunto de signatários congelado
que o pipeline não consegue honrar (`approval.signer-set-unsupported`). Mais um código pertence a este
caso: um job que ficou retido **antes** de a regra passar para `Approvers` foi congelado sobre a chave do
perfil, e em uma instância que subiu depois da mudança — e por isso nunca abriu uma chave — ele falha com
`profile.key-unavailable`. Voltar a regra para um conjunto com chave e reiniciar é um remédio; uma
repetição em uma instância que ainda detém a chave também é.

**Correção.**

1. Leia o motivo. Ele está no banner de inicialização, no log em `Critical`, em `/api/ready/details`, na
   página do próprio perfil em `/profiles/<nome>`, e no histórico do job que falhou — todos os cinco dizem
   a mesma coisa.
2. Corrija o certificado. Se as coordenadas estão erradas — um caminho digitado errado, um thumbprint que
   não corresponde a nada, o cofre errado — corrija-as naquela página com **Edit certificate**; o
   salvamento as armazena e marca o perfil como aguardando uma reinicialização. Se as coordenadas estão
   certas e o material não, os modos de falha são os de sempre: veja
   [O boot tem sucesso, mas todo job falha com "Certificate not found by thumbprint"](#o-boot-tem-sucesso-mas-todo-job-falha-com-certificate-not-found-by-thumbprint),
   [Falha de autenticação ou autorização no Azure Key Vault na inicialização](#falha-de-autenticação-ou-autorização-no-azure-key-vault-na-inicialização)
   e [Um blob de material de assinatura não pode ser lido na inicialização](#um-blob-de-material-de-assinatura-não-pode-ser-lido-na-inicialização).
3. **Reinicie o serviço.** Um certificado é aberto uma vez na inicialização e nunca recarregado, então nem
   corrigir o arquivo nem salvar novas coordenadas muda qualquer coisa por baixo de um host em execução — o
   marcador no perfil diz exatamente isso.
4. Repita os jobs que falharam, ou solte os arquivos de volta em sua pasta monitorada. As entradas deles
   foram deixadas no lugar: nada foi assinado, então nada conquistou o direito de apagá-las.

**Não é motivo para tirar a instância de serviço.** A linha do `/api/ready` reporta `ok: false`, mas **não**
transforma a resposta em 503 — veja
[O serviço inicia mas o `/api/ready` retorna 503 persistentemente](#o-serviço-inicia-mas-o-apiready-retorna-503-persistentemente).

### Um perfil está degradado dizendo que um segredo armazenado não pôde ser descriptografado

**Sintoma.** O banner de inicialização reporta um ou mais perfis como `DEGRADED` com um motivo nomeando
`Signing:ProfileSecretsKey` — *"A stored signing profile secret (Pkcs12Password) could not be
decrypted"* — e o `/api/ready` carrega uma linha `signing-profile:<nome>` com `ok: false`. Os jobs
roteados para esses perfis falham com `profile.degraded`. **O host subiu**, e todo perfil que não carrega
segredo continua assinando normalmente. Na página do perfil, o painel de certificado mostra as coordenadas
— o caminho, o thumbprint, o endpoint do cofre — e nenhuma linha de segredo.

**Causa raiz.** A `Signing:ProfileSecretsKey` está definida, mas não é o valor sob o qual os segredos desses
perfis foram salvos. Quatro coisas causam isso, e elas são deliberadamente indistinguíveis — a
descriptografia é autenticada, então uma chave errada e uma linha adulterada parecem idênticas:

- a chave foi **rotacionada** e o material armazenado não foi reinserido depois;
- a base operacional foi **restaurada** de, ou copiada de, uma implantação com uma chave diferente;
- a chave está **digitada errado**, na maioria das vezes via `Signing__ProfileSecretsKey`, em que o
  sublinhado duplo é fácil de errar;
- alguém **editou uma coluna protegida** diretamente, ou uma restauração moveu bytes entre colunas.

**Esta não é a recusa por chave ausente**
([A inicialização é recusada porque `Signing:ProfileSecretsKey` não está definida](#a-inicialização-é-recusada-porque-signingprofilesecretskey-não-está-definida)).
Aqui a chave *está* definida, e definir uma diferente não vai ajudar: os valores armazenados foram escritos
sob a antiga.

**Correção, se você ainda tem a chave original.**

1. Coloque-a de volta — `Signing__ProfileSecretsKey`, exatamente como era. Confira espaços em branco no
   final e um sublinhado simples onde são necessários dois.
2. **Reinicie o serviço.** Um certificado é aberto uma vez na inicialização e nunca recarregado.

**Correção, se a chave foi perdida ou rotacionada deliberadamente.** Não há recuperação dos valores em si;
isso é por construção, não uma lacuna. Para cada perfil que o banner nomeou:

1. Abra a página do perfil no dashboard e pressione **Edit certificate**.
2. Digite de novo a senha do PKCS#12, o segredo de aplicativo do Key Vault ou a credencial do blob, ou envie
   o PKCS#12 de novo. Um campo em branco *mantém* o valor armazenado, que não é o que você quer aqui —
   digite-o.
3. Salve. O perfil é marcado como aguardando uma reinicialização.
4. **Reinicie o serviço** quando todo perfil afetado tiver sido reinserido.
5. Repita os jobs que falharam, ou solte os arquivos de volta em sua pasta monitorada. Nada foi assinado,
   então as entradas ainda estão em `input/`.

Um perfil sem segredo — um PFX sem senha, um token PKCS#11, um certificado do repositório do Windows — não é
afetado e não precisa de nada.

:::tip Trate a rotação da chave como uma operação agendada
Rotacionar a `Signing:ProfileSecretsKey` invalida de uma vez todo segredo de perfil armazenado. Rotacione
reinserindo o material de cada perfil sob a nova chave *enquanto a antiga ainda funciona*, e aposente o
valor antigo apenas quando nada mais estiver protegido sob ele.
:::

### Certificados de teste da Lacuna (Turing / Fermat) são recusados

**Sintoma.** Com os certificados de teste da Lacuna, todo job sob o perfil falha com um erro de cadeia ou
de confiança, ou todo **Sign and approve** de um aprovador é recusado como `approval.certificate-invalid`
nomeando uma raiz não confiável. A linha `trust set` do banner lê `production`.

**Causa raiz.** Não é uma falha. O produto publicado submete toda assinatura apenas às raízes da
ICP-Brasil; a raiz de teste da Lacuna só é confiável sob `Signing:TrustLacunaTestRoot = true` (disponível
a partir da 2.3.0). Um único conjunto de confiança vale para o host inteiro: a chave do perfil no momento
da assinatura, o verificador depois, e o certificado de um aprovador.

**Correção.** Em um host de homologação, defina `Signing__TrustLacunaTestRoot=true` **e**
`ASPNETCORE_ENVIRONMENT=Staging` — a chave sozinha é recusada sob o nome `Production` (veja
[a entrada em *O serviço não inicia*](#signingtrustlacunatestroot-is-true-while-the-environment-is-production)).
Em qualquer coisa que assine documentos reais, use certificados reais; a chave não é para isso.

### O boot tem sucesso, mas todo job falha com "Certificate not found by thumbprint"

**Sintoma.** Todo job vai de `Queued → Failed`. A mensagem de erro menciona uma divergência de
thumbprint. Desde a 2.1.0 isso é detectado quando o certificado do perfil é aberto na inicialização: o
banner reporta o perfil como `DEGRADED` com o thumbprint no motivo, e os jobs dele falham com
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

**Sintoma.** O bootstrap tem sucesso, mas a primeira tentativa de assinatura dá erro com uma falha de
inicialização do PKCS#11.

**Causas possíveis:**

- O `.so` / `.dll` do fabricante não está presente no host, no caminho de `ModulePath`.
- (Docker) Biblioteca do fabricante não montada no container — veja
  [Certificados](certificates.md#exemplo-de-montagem-no-docker).
- (Linux) O token exige o `pcscd` rodando — `sudo systemctl start pcscd`.

### A assinatura falha com "Access is denied" ao ler uma chave privada do Windows

**Sintoma.** A assinatura lança `CryptographicException: Access is denied.` do repositório do Windows.

**Causa raiz.** A conta virtual do serviço `NT SERVICE\LacunaBulkSigner` não tem acesso à chave privada.

**Correção.** `certlm.msc` → certificado → Todas as Tarefas → Gerenciar Chaves Privadas → Adicionar
`NT SERVICE\LacunaBulkSigner` → conceder Leitura.

### Jobs do Azure Key Vault falham com throttling (HTTP 429) ou erros transitórios de rede

**Sintoma.** Com `Source = AzureKeyVault`, os jobs **falham em vez de travar**, carregando um erro do
Azure — HTTP 429 (`Too many requests`), um timeout, ou uma falha de resolução de nome. Frequentemente
correlacionado com uma rajada de arquivos ingeridos.

**Causa raiz.** Cada assinatura é uma chamada remota ao Key Vault, então a vazão é limitada pelos limites
de requisição do cofre, e não pela CPU local. Um `Pipeline:MaxConcurrency` alto mais um lote grande pode
exceder aqueles limites. Uma indisponibilidade do cofre ou uma perda de saída produz o mesmo formato.

**Correção.**

- Reduza o `Pipeline:MaxConcurrency` (comece em torno de 4–8) e meça de novo. Diferentemente do caso do
  PKCS#11, não há razão de *correção* para baixar para `1` — isto é um limite de taxa, não um conflito de
  sessão.
- Repita os jobs afetados quando o cofre estiver alcançável. Throttling e indisponibilidades são
  transitórios e os arquivos de entrada estão intocados; a repetição é manual por design (veja
  [Operação](operations.md)).
- Confirme que a saída para `*.vault.azure.net` e `login.microsoftonline.com` está estável, inclusive
  qualquer proxy.
- Se vazão sustentada é o objetivo, confira os limites de transação documentados do cofre para o tipo de
  chave em uso — operações RSA têm tetos mais baixos que EC.

### Um verificador a jusante rejeita uma assinatura do Bulk Signer

**Sintoma.** Um PDF assinado verifica no Lacuna PKI SDK, mas um verificador de terceiros reporta que a
política é desconhecida ou que a cadeia está incompleta.

**Causas possíveis:**

- O verificador exige uma política diferente da padrão (o Bulk Signer assina com ADR-Básica por padrão).
  Combine com o sistema a jusante qual política é esperada.
- Falta uma AC intermediária ao verificador. O Bulk Signer assina com a cadeia implícita no certificado;
  o verificador resolve a cadeia pelo seu próprio repositório de confiança.

## Pipeline / worker

### Os jobs entram na fila mas nunca entram em Processing

**Sintoma.** O `bulksigner_jobs_in_flight` fica em zero; os jobs ficam em `Queued`.

**Causas possíveis:**

- O pipeline está pausado. O `GET /api/pipeline/state` retorna `{ paused: true }`. Retome:
  `POST /api/pipeline/resume`.
- O worker não está saudável. O log mostra as linhas de iteração do worker; se elas pararam, o worker
  pode ter caído (raro; procure uma exceção registrada).

### A pausa responde `pipeline.state-missing` (SQL Server)

**Sintoma.** Em uma implantação com `Database:Provider = SqlServer`, o `POST /api/pipeline/pause` responde
`pipeline.state-missing`, o log carrega `PipelineState singleton row is missing` em Critical, e o pipeline
continua rodando, peça o operador o que pedir.

**Causa raiz.** Bases SQL Server criadas antes da 2.4.3 nunca receberam a linha de estado do pipeline sobre
a qual a pausa e a retomada atuam. **Correção.** Atualize para a 2.4.3 ou posterior: a linha é inserida por
uma migração aplicada no próximo boot.

### Os jobs travam quando `MaxConcurrency > 1` com um token PKCS#11 ou CSP do Windows

**Sintoma.** Com `Pipeline:MaxConcurrency > 1` e `Signing:Certificate:Source = Pkcs11` (ou
`WindowsStore`), jobs em andamento travam além da latência normal de assinatura, ou falham com erros como
`CKR_SESSION_HANDLE_INVALID`, `Provider is busy`, ou `Key container is in use`.

**Causa.** A maioria dos tokens PKCS#11 (smart cards de consumo, tokens USB) expõe uma única sessão por
login. Chamadas de assinatura concorrentes de várias tarefas do worker disputam aquela única sessão. CSPs
de software do Windows geralmente são seguros para threads; CSPs baseados em smart card não são. O banner
de inicialização avisa quando esta combinação está configurada.

**Correção.** Defina `Pipeline:MaxConcurrency: 1` no `appsettings.Production.json` (ou deixe indefinido
para o padrão) e reinicie o serviço. Se a documentação do fabricante declara que o token suporta
múltiplas sessões e você quer vazão concorrente, procure o fabricante com as linhas de log da falha para
confirmar a configuração. Veja
[Certificados](certificates.md#considerações-de-concorrência-por-origem).

### Linha de log: "claim lost to a concurrent writer"

**Sintoma.** O log mostra a reivindicação de um job sendo perdida para um escritor concorrente, no nível
`Information`. O job está em algum estado terminal (tipicamente `Canceled`, se um operador o cancelou).

**Causa.** Este é o comportamento esperado, não um erro. Ele dispara quando o worker havia carregado uma
linha `Queued` mas, entre a carga e a gravação, outro escritor (o endpoint de cancelamento, ou um worker
par) atualizou a linha. A proteção de concorrência otimista pega a corrida e o worker cede. A frequência
deveria ser muito baixa — vê-la dezenas de vezes por dia sugere um cliente disparando repetições em
excesso no endpoint de cancelamento.

**Correção.** Nenhuma necessária. Se os volumes estiverem incomumente altos, audite os clientes
chamadores.

### O observador não pega arquivos soltos em uma pasta de entrada configurada

**Sintoma.** Arquivos aparecem em uma das pastas de `Storage:Inputs[].Path`, mas nenhum job é criado.

**Causas possíveis:**

- A extensão do arquivo está na lista de ignorados efetiva — a linha de base global
  `WatchedFolder:IgnoredExtensions` (`.tmp`, `.part`, `.crdownload`, `.swp`) unida a quaisquer
  `IgnoredExtensions` por pasta. Renomeie, ou mova para fora e de volta.
- O prefixo do nome do arquivo está na lista de prefixos efetiva (padrão global: `.`, `~$`).
- O arquivo ainda está sendo escrito pelo produtor. O detector de estabilidade exige
  `WatchedFolder:StabilityRequiredSamples` amostras idênticas consecutivas antes do enfileiramento.
  Espere, ou faça `POST /api/rescan` (ou `POST /api/rescan?folder=<nome>` para apenas uma pasta) depois
  que o escritor terminar.
- **O observador da pasta está em `Status: Stopped`.** Veja abaixo.
- **Nenhum perfil de assinatura escolheu a pasta.** O card dela mostra um chip cinza `unassigned` onde
  estaria o do perfil. Veja
  [Arquivos ficam em uma pasta cujo card diz `unassigned`](#arquivos-ficam-em-uma-pasta-cujo-card-diz-unassigned).
- **O perfil de assinatura da pasta está desabilitado.** Veja
  [Arquivos são recusados com `profile.disabled`](#arquivos-são-recusados-com-profiledisabled).
- **O job mais recente do arquivo terminou `Failed` ou `Canceled`.** O observador não oferece esse arquivo
  de novo por conta própria (desde a 2.11.0 para `Failed`: antes, uma pasta por sondagem produzia um novo
  job `Failed` a cada tique enquanto a causa persistisse). Rode-o de novo com Retry, Rescan ou Upload —
  isso vale também para um arquivo corrigido solto com o mesmo nome.
- **O nome já está tomado por um job concluído.** O arquivo vira um job, sim, mas um que falha na hora —
  veja [Um arquivo falha na hora com `file.already-processed`](#um-arquivo-falha-na-hora-com-filealready-processed).
- (Docker) Problema de permissão de bind mount — o UID do container (1654) precisa conseguir ler arquivos
  soltos pelo processo do host. `chown -R 1654:1654 ./data` no host.

### Arquivos ficam em uma pasta cujo card diz `unassigned`

**Sintoma.** Arquivos se acumulam em uma pasta configurada e nenhum job é criado. A página Entradas mostra
a pasta com um chip cinza com o texto `unassigned — no profile has chosen this folder`; o `/api/folders`
retorna `profileName: null` e, assim que o observador percebe, `"status": "Unassigned"`; o `/api/ready`
está **verde** para aquela pasta; um rescan reporta a pasta como `unassigned: true`, com todas as contagens
em zero; e o log carrega um Warning, `Watched folder '<nome>' is unassigned — no signing profile has
chosen it`.

**Causa raiz.** Desde a 2.2.0 uma pasta monitorada é assinada sob o perfil que a escolheu, uma pasta por
perfil, e nenhum a escolheu. Ou a importação do primeiro boot a deixou assim — a pasta nomeava um perfil
que o `Signing:Profiles[]` não declarava, ou uma pasta anterior já tinha tomado o perfil que ela nomeava, e
o banner de inicialização disse qual — ou um perfil a liberou depois, pela sua página, ou a tabela de
perfis foi importada por uma versão anterior à 2.2.0, que não registrava vínculos de pasta. Uma pasta sem
perfil **não** recai para `default`.

**Por que a pasta não é reportada como quebrada.** Ela não está quebrada: o armazenamento responde, o
observador está esperando em vez de ter falhado, e uma linha de prontidão vermelha diria a um orquestrador
para tirar uma instância por causa de uma pasta que ninguém pediu para ela monitorar ainda. Os arquivos
estão onde o produtor os deixou e são listados no momento em que um perfil escolhe a pasta.

**Correção.** Abra um perfil na página de perfis de assinatura do dashboard, clique em **Edit behaviour**,
escolha a pasta em **Input folder** e salve; ou crie um perfil com a pasta escolhida. O observador começa
dentro de um ou dois intervalos de sondagem e lista tudo o que está ali — sem reinicialização e sem rescan.
Editar `Storage:Inputs[].Profile` **não** resolve depois do primeiro boot: essa chave só é lida pela
primeira importação, e o boot diz que ela está sendo ignorada. Veja
[Operação](operations.md#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura).

### Arquivos são recusados com `profile.disabled`

**Sintoma.** Arquivos se acumulam em uma pasta configurada e nenhum job é criado, mas a pasta *não* está
parada: o card dela está verde, o `/api/ready` está satisfeito, e o console exibiu uma linha com o texto
`files are not being enqueued — signing profile '<nome>' is disabled`. Um upload para aquele perfil
responde `409` com `code = "profile.disabled"`; o mesmo acontece com a repetição de um job que o nomeava.

**Causa raiz.** Alguém desligou a chave **accept new work** do perfil em sua página. Isso impede que novo
trabalho seja roteado para ali e nada mais: os jobs já enfileirados no perfil rodaram até o fim, e nenhum
arquivo foi modificado — cada um está onde o produtor o deixou.

**Correção.** Ou reabilite o perfil em sua página — a próxima passada da pasta ingere tudo o que está nela,
inclusive os arquivos recusados enquanto ele esteve desligado — ou escolha a pasta na página de outro
perfil. (O salvamento se recusa a desabilitar um perfil que é alimentado por uma pasta, nomeando-a, então
este estado só surge de um vínculo de pasta feito *depois* de o perfil ter sido desabilitado.)

### Um arquivo falha na hora com `file.already-processed`

**Sintoma.** Um arquivo solto em uma pasta monitorada vira um job que já nasce `Failed` com
`file.already-processed`, nomeando o job que detém o nome, e o arquivo é movido para a pasta
`error/<jobid>/` do novo job. Um upload responde `409` com o mesmo código e não armazena nada. Um rescan
conta esses casos em `alreadyProcessed`.

**Causa raiz.** Desde a 2.13.0 um arquivo que chega com um nome que um job `Completed` ou ainda ativo já
carrega **nunca é assinado**. A comparação vale para o host inteiro — toda pasta monitorada, todo perfil e
todo upload — e ignora maiúsculas e minúsculas, porque todos escrevem na mesma pasta `output/`. Um job
`Failed` ou `Canceled` não reserva nome.

**Correção.** A repetição é recusada para esta falha (uma repetição é isenta da regra, então assinaria o
arquivo que a regra recusou). Para aceitar o nome de novo, **apague o job que o detém** na página Jobs. Para
um produtor que legitimamente reutiliza um mesmo nome de arquivo fixo todo dia, desligue a regra com
`Pipeline:RejectAlreadyProcessedFileNames = false`. Veja
[Operação](operations.md#nomes-de-arquivo-já-processados).

### Uploads são recusados com `upload.disabled`, ou não há botão Upload files

**Não é uma falha.** `Upload:Enabled = false` (disponível a partir da 2.10.0) desliga a superfície de
upload dos dois lados de uma vez: o `POST /api/files` responde `409` com `upload.disabled`, e a página Jobs
não renderiza o botão **Upload files**. O host recebe arquivos apenas de suas pastas monitoradas; Rescan e
Retry não são afetados. A chave é lida uma vez no boot, então religar os uploads exige uma
reinicialização.

### Um observador de pasta está em `Status: Stopped`

**Sintoma.** Arquivos se acumulam em uma pasta configurada mas nenhum job é criado; a página Entradas
mostra o card da pasta com um chip vermelho "stopped" e uma mensagem de último erro. O `/api/folders`
retorna `"status": "Stopped"` para aquela pasta. O `/api/ready` retorna 503 com a pasta problemática no
array `checks`.

**Causa raiz.** O observador daquela pasta atingiu o limiar de falhas consecutivas de enfileiramento por
pasta (10 por padrão) — tipicamente um caminho de armazenamento envenenado (NFS caiu, compartilhamento
ficou somente leitura, disco cheio na montagem do SQLite).

:::note
A falha do observador é isolada àquela pasta — as outras pastas continuam ingerindo e o host continua no
ar. A troca é que um operador que não lê o `/api/ready` ou a página Entradas pode deixar passar uma pasta
degradada por muito tempo. Sonde o `/api/ready` de um monitor externo.
:::

**Diagnóstico e correção:**

1. Leia o texto do último erro em `GET /api/folders` (ou no card da página Entradas).
2. Corrija a causa subjacente (remonte o compartilhamento, libere o disco, conserte o caminho).
3. Reinicie o serviço — o observador **não** revive automaticamente após uma parada, porque o veneno
   subjacente geralmente não é transitório.

### Um arquivo aterrissou em `error/<jobid>/`

**Sintoma.** A página de detalhe do job mostra `Failed` com uma mensagem de erro; o diretório
`processing/` foi movido para `error/<jobid>/`.

**Diagnóstico:**

- Leia a mensagem de erro do job (dashboard ou `GET /api/jobs/{id}`).
- Inspecione `error/<jobid>/` procurando o arquivo em andamento — ele é preservado exatamente como o
  worker o deixou.
- Leia o histórico do job para a linha do tempo completa de transições.

**Correção:** resolva a causa subjacente, e então `POST /api/jobs/{id}/retry`. A repetição cria um novo
job `Queued` com `ParentJobId` definido; o job falho permanece para auditoria.

### Um job CNAB240 falha com `cnab240.invalid`

**Sintoma.** O job nunca chegou a um assinador; a linha do tempo lista as violações estruturais.

**Causa raiz.** O arquivo roteado por um perfil com `CheckCNAB240` não é uma remessa do Banco do Brasil em
conformidade — comprimento de registro errado, registros fora de ordem, um código de banco diferente de
`001`, um segmento não reconhecido, uma contagem de trailer divergente, ou um **retorno**
(`Código Remessa / Retorno = '2'`) solto em uma pasta monitorada por engano.

**Correção.** Corrija o arquivo no sistema de origem e reexecute-o por Upload, Retry ou Rescan. A lista de
violações na linha do tempo é limitada, e avisa quando é truncada. Veja
[CNAB240](cnab240.md#quando-um-arquivo-é-recusado).

### Um job CNAB240 falha com `cnab240.payment-date-passed`

**Sintoma.** Uma remessa estruturalmente válida é recusada logo antes da assinatura.

**Causa raiz.** A data de pagamento **mais antiga** do arquivo está no passado. O BB ou o recusaria ou o
processaria em uma data que ninguém pretendeu, e uma assinatura faria a data errada parecer deliberada.

**Correção.** Reexporte do sistema de origem com datas atuais. **Repetir o mesmo arquivo falha da mesma
forma** — as datas dentro dele não mudaram.

Se o seu banco processa um pagamento com data passada no próximo dia útil, o perfil pode desligar a
proteção em vez disso (a partir da 2.15.0): `CheckCnab240PaymentDates = false` no comportamento do perfil
(ou `Signing:Profiles[].CheckCnab240PaymentDates` para um perfil sendo importado em um primeiro boot). O
arquivo então passa, e a decisão fica registrada — no histórico do job, em um evento operacional
`Cnab240PaymentDateCheckSkipped`, no contador `bulksigner_cnab240_payment_date_checks_skipped_total` e em
uma linha de log em Warning. A configuração é lida no momento da assinatura, então uma mudança chega ao
próximo job sem reinicialização. Veja [CNAB240](cnab240.md#desligando-a-guarda).

:::tip Confira o fuso horário do host primeiro
"Hoje" é a data local do host. Em um host rodando em UTC enquanto o pagador está em
`America/Sao_Paulo`, a fronteira vira três horas mais cedo e um arquivo com vencimento hoje começa a ser
recusado às 21:00 no horário local. Defina `TZ=America/Sao_Paulo` no container ou na unit do systemd.
:::

### Um aprovador é informado de que o registro de aprovação está incompleto

**Sintoma.** O clique ou a assinatura de um aprovador é recusado com *cannot be decided — its approval
record is incomplete. Contact whoever operates the service.* Pela REST o código é
`approval.job-incomplete`. O job permanece em `AwaitingApproval`.

**Diagnóstico.** Antes de aceitar uma decisão, o Bulk Signer confere o registro ao qual a decisão fica
vinculada, e algo de que ele precisa está ausente ou não confere mais: a regra congelada, o hash de
conteúdo do job, a cópia em stage em `processing/<jobid>/` ou seus bytes, o envelope de assinaturas dos
aprovadores ao lado dela, ou o thumbprint de certificado de uma linha aprovada. Abra a página do job como
operador: desde a 2.8.0 a seção **Approval record** roda as mesmas verificações e marca a que falhou, com
o valor encontrado e o caminho da pasta de processamento.

Qual verificação falhou diz o que aconteceu. **Um hash de conteúdo ausente** muito provavelmente significa
que o job ficou retido sob um perfil cujo `CheckCNAB240` estava desligado — a interpretação do CNAB240 é a
única coisa que o registra. O histórico do perfil mostrará a verificação sendo desligada
(`Changed: CheckCNAB240 on → off`) enquanto a regra de aprovação continuava de pé. Desde a 2.9.0 a página
do perfil recusa esse salvamento, e a barreira reprova tal job por nome em vez de retê-lo (veja
[a entrada abaixo](#um-job-falhou-com-approvalcontent-unmeasured-em-vez-de-ficar-retido)), então um job
nesse estado ficou retido antes de qualquer das duas recusas existir. **Qualquer outra verificação**
falhando significa que a linha ou a pasta foi modificada fora da aplicação — um backup restaurado, uma
quarentena-e-restauração de antivírus, um cliente de sincronização, uma edição manual.

**Correção.** Cancele o job (o botão Cancel, ou `POST /api/jobs/{id}/cancel`). Para o hash de conteúdo,
religue primeiro o `CheckCNAB240` pelo **Edit behaviour** do perfil — ou remova a regra de aprovação, se o
perfil não deve reter jobs — e então reexecute o arquivo por Rescan ou Upload, para que ele seja
interpretado, totalizado e aprovado do zero; o original ainda está em `input/`. Nada repara o registro no
lugar, por design. Para as outras verificações, descubra o que tem acesso de escrita à base operacional ou
a `processing/` por fora da aplicação e interrompa-o, ou o próximo job retido vai pelo mesmo caminho.

### Um job fica em `AwaitingApproval` e nada acontece

**Não é uma falha por si só** — o job está esperando por uma pessoa, e vai esperar indefinidamente a menos
que o perfil defina `Approval.ExpiresAfter`. Coisas a conferir:

- **Alguém sabe?** O produto não envia e-mail. Os aprovadores chegam a um arquivo retido pela própria fila
  em `/approvals` — pelo seu link durável do portal (listado por aprovador na página Sistema) ou por um
  login do Entra. Desde a 2.9.0 a página do job não mostra mais um link de aprovação por job para copiar;
  a página anônima em `/approve/<jobId>` ainda existe para uma implantação que dependa dela, e tudo o que
  está em [Segurança](security.md#a-página-de-aprovação-por-job-não-é-autenticada) sobre distribuí-la se
  aplica.
- **O pool está certo?** A página do job mostra o pool **congelado no momento da retenção**, não a regra
  atual do perfil. Se as pessoas listadas estiverem erradas, cancele o job, corrija o perfil e reexecute o
  arquivo — editar um perfil nunca muda o que um job retido exige. A coluna **Approvals** da página Jobs (a
  partir da 2.12.0) mostra quantas aprovações cada job retido ainda precisa.
- **Acompanhe o `bulksigner_approvals_expired_total`.** Uma taxa de expiração que sobe é o sinal de que os
  aprovadores não estão olhando sua fila.

### Um aprovador recebe "Esse endereço não está no pool de aprovadores deste job"

**Causa raiz.** O endereço dele não está no pool **congelado**. Espaços no início/fim e maiúsculas não
importam; qualquer outra coisa importa.

**Correção.** Compare com o pool exibido na página do job. A recusa é deliberadamente grosseira — um
endereço malformado retorna o mesmo código — para que alguém que adivinhou um id de job não aprenda nada
sobre quem são os aprovadores.

### Um job liberado falhou com `approval.content-changed`

**Sintoma.** O quórum foi atingido, o job voltou a `Queued`, e então ele falhou em vez de assinar.

**Causa raiz.** A cópia em stage em `processing/<jobid>/` foi modificada depois que os aprovadores a
viram. A verificação de hash anterior à assinatura se recusou a produzir uma assinatura sobre bytes que
ninguém aprovou.

**Correção.** **Não** o reassine. Descubra o que escreveu em `processing/`, e então reexecute o arquivo
original de `input/`, para que ele seja interpretado, totalizado e aprovado do zero. Este contador deveria
ficar em zero para sempre; qualquer outra coisa vale investigar em vez de repetir por cima.

### Um job falhou com `approval.content-unmeasured` em vez de ficar retido

**Sintoma.** Um arquivo roteado para um perfil com barreira de aprovação vai para `Failed` em vez de
`AwaitingApproval`. O histórico diz que ele foi recusado antes da retenção porque a verificação CNAB240 do
perfil está desligada, a pasta está sob `error/<jobid>/`, e o log carrega `Job … was refused before parking
for approval: profile … requires approval but its CNAB240 check is off`. Todo arquivo naquele perfil falha
da mesma forma.

**Diagnóstico.** O perfil carrega uma regra de aprovação e `CheckCNAB240 = false`. A interpretação é a
única coisa que registra o hash de conteúdo ao qual uma decisão fica vinculada, então sem ela o job não tem
sob o que ficar retido — e um job retido sem ele nunca poderia ser decidido. Desde a 2.9.0 a barreira o
recusa por nome, e a página do perfil recusa salvar esse par por qualquer dos dois lados, então um perfil
nesse estado foi editado antes de essa recusa existir, ou teve sua linha editada fora da aplicação.

**Correção.** Na página do perfil, religue o `CheckCNAB240` pelo **Edit behaviour**, ou remova a regra de
aprovação pelo **Edit approval** se o perfil não deve reter jobs. Sem reinicialização: o próximo job
reivindicado roda sob a regra corrigida. Depois reexecute os arquivos que falharam por Rescan ou Upload; os
originais ainda estão em `input/`.

### Um job falhou com `approval.rejected` em vez de ser cancelado

**Causa raiz.** A rejeição chegou depois de um worker já ter reivindicado o job, então o pipeline recusou
a assinatura em vez de o handler de aprovação cancelá-lo. `Processing` não tem transição legal para
`Canceled`.

**Não é uma falha.** O arquivo está sem assinatura, que é a propriedade que importa. Corrija e resubmeta.

### Um job foi cancelado com "Approval window expired."

**Causa raiz.** Ninguém decidiu dentro da janela `ExpiresAfter` do perfil.

**Correção.** A cópia em stage está sob `error/<jobid>/`, o original ainda está em `input/`, e quaisquer
aprovações que *tenham sido* registradas continuam na página do job. A repetição não se aplica (ela só
aceita `Failed`) — reexecute o arquivo por Rescan ou Upload, o que cria um novo job que fica retido e
consulta o pool de novo.

Uma **pausa não estende a janela**: o orçamento é um prazo de relógio de parede, não um orçamento de tempo
de atividade do pipeline, então um pipeline pausado ao longo de uma janela expira os jobs cujas janelas se
fecharam durante a pausa.

### Um job concluiu mas seu arquivo de entrada ainda está em `input/`

**Não é uma falha.** O arquivo foi reescrito enquanto o job o detinha, então o pipeline se recusou a
apagar algo que não conseguia provar ser o arquivo que processou. Procure `job.input-diverged` na linha do
tempo do job. O arquivo reescrito é devolvido à sua pasta monitorada e assinado como um job próprio.

Dois casos em que a devolução é descartada, e o console avisa: um upload REST (nenhum observador é dono do
seu caminho), e uma pasta cujo observador não está rodando. Veja
[Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job).

### Um arquivo sob `processing/` ou `error/` não pode ser escrito nem apagado

**Causa raiz.** Em um compartilhamento de trabalho do Azure Files, a cópia em stage de um job ativo carrega
um lease infinito que recusa escritas e exclusões de tudo, inclusive do seu próprio ferramental de
armazenamento. Isso é o ponto enquanto o job está em andamento. A retenção normalmente termina junto com o
job; se o job é terminal e o lease ainda está detido, encerrar a retenção falhou — o compartilhamento
estava inalcançável, a credencial tinha sido rotacionada, ou a realocação foi recusada — e o log disse isso
quando o job terminou (por exemplo `Cancel of job … could not end the hold on its staged copy`, ou
`Recovery: failed to relocate processing/…`).

**Correção.** O lease vive na conta de armazenamento, e não neste processo, então **reiniciar o Bulk Signer
não o libera.** Confirme pela página do job que o job é terminal, e então quebre o lease e apague ou mova o
arquivo normalmente:

```bash
az storage file lease break --account-name <conta> --share-name <compartilhamento> --path 'processing/<jobid>/<arquivo>'
```

ou, no portal, selecione o arquivo e use **Break lease**. Nunca quebre o lease da cópia em stage de um job
*ativo*: isso remove a proteção que o novo cálculo de hash anterior à assinatura teria então de pegar, e o
job vai falhar com `approval.content-changed` em vez de assinar os bytes errados. Uma árvore de trabalho
local não tem esse lease — a retenção dela some no momento em que o serviço reinicia.

### O `/api/ready` está em 503 com `work-share-owner` vermelho

**Causa raiz.** Outra instância detinha o marcador do compartilhamento de trabalho na inicialização. O
banner, o log, a página Sistema e esta verificação todos nomeiam o **host e o id de processo** do detentor
anterior.

**Correção.** Pergunte se aquele host e aquele processo ainda estão rodando.

- **É este host, e o processo se foi** — sua instância anterior não desligou graciosamente. Nada está
  errado agora. A linha permanece vermelha por toda a vida desta instância e limpa no próximo boot após
  uma parada graciosa; o marcador é reivindicado uma vez e nada o relê, então não há resposta mais fresca
  a se obter.
- **É um host diferente, ou aquele processo está vivo** — você tem duas instâncias em um compartilhamento
  de trabalho, o que não é suportado. Pare uma, e então decida qual base é a autoritativa. **O estado de
  aprovação é o que exige ação rápida**: um job retido existe na base de uma instância somente.

Se o detalhe da linha em `/api/ready/details`, em vez disso, lê `not claimed cleanly at startup: …`, o
marcador não pôde ser alcançado de forma alguma — um compartilhamento inalcançável ou uma credencial
rotacionada. Se outra instância o detém passa a ser simplesmente desconhecido, e desconhecido não é
reportado como a resposta tranquilizadora. A linha `storage-share:` do próprio compartilhamento geralmente
diz por quê. A reivindicação é tentada de novo no próximo boot, e não em segundo plano.

### Um arquivo rejeitado não foi devolvido a `output/`

**Sintoma.** Um aprovador rejeitou um arquivo. O job está `Canceled`, mas o `output/` não tem
`<nome>.reject<ext>` e a página do job diz *"The file could not be returned to the output folder, so the
staged copy is in the error folder and the original is still in its input folder."* O console carrega um
aviso e o log uma entrada `RejectionHandbackFailed` nomeando o motivo.

**De longe a causa mais provável: o nome já estava tomado.** Um arquivo vetado é um que o financeiro
corrige e reenvia com o mesmo nome, então uma segunda rejeição dele tenta escrever `folha.reject.rem` onde
o primeiro já está. O Bulk Signer se recusa em vez de sobrescrever — aqueles bytes são de alguém — e recai
para deixar a cópia em stage em `error/`. A mensagem de log nomeia o destino.

**O que é verdade quando isso acontece**, e esta é a parte tranquilizadora: o veto continua valendo, nada
foi assinado, o arquivo anterior em `output/` está intocado, os bytes desta rejeição estão íntegros em
`error/<jobid>/`, e **a entrada ainda está em sua pasta monitorada** — a exclusão dela só é conquistada por
uma devolução bem-sucedida.

**O que fazer.** Colete ou arquive o `output/<nome>.reject<ext>` mais antigo, e então ou deixe a cópia
atual em `error/` (a trilha de auditoria aponta para ela) ou mova-a você mesmo para `output/` com um nome
de sua escolha. Nada precisa ser reiniciado.

**Outras causas**, todas mais raras e todas se nomeando no log: o compartilhamento de trabalho parou de
responder entre a escrita e a movimentação; o processo não tem permissão de escrita em `output/`; em um
compartilhamento, um lease que outra pessoa detém no destino. Se em vez disso você vê
`RejectionHandbackFallbackFailed`, nenhum dos dois destinos funcionou — o job continua terminal e correto,
e `processing/<jobid>/` precisa ser limpo à mão. Um `RejectionHandbackUnavailable` em Error é um defeito do
produto, e não uma falha operacional: reporte-o ao suporte da Lacuna Software.

## Dashboard

### Toda página renderiza mas nenhum botão faz nada, e o console do navegador mostra 404 em `_framework/blazor.web.js`

**Sintoma.** Em uma implantação Docker o dashboard carrega e as tabelas se preenchem, mas *Upload files*,
*Retry*, *Cancel*, os filtros e todo outro controle estão inertes. O console do navegador tem exatamente um
erro: um 404 para `/_framework/blazor.web.js`. O `/api/ready` está verde e o log do servidor não registra
nada.

**Causa.** Imagens de container anteriores à 2.4.1 construídas sobre o .NET 10 — entre elas a 2.3.2 e a
2.4.0 — foram publicadas sem o script de cliente do dashboard, então as páginas renderizavam mas nunca se
tornavam interativas. Instalações como Windows Service, systemd e em primeiro plano nunca foram afetadas.

**Correção.** Baixe a imagem 2.4.1 ou posterior e reimplante. Para conferir uma imagem antes de
implantá-la: `docker run --rm --entrypoint ls <imagem> /app/wwwroot/_framework` precisa listar
`blazor.web.js`.

## Criptografia

### A descriptografia falha com um erro de divergência de tag

**Sintoma.** O destinatário roda o exemplo de descriptografia e recebe um erro de divergência de tag de
autenticação.

**Causas possíveis (qualquer uma basta):**

- Senha errada. Verifique contra o `Encryption:Password` / variável de ambiente configurados.
- Salt errado. O destinatário precisa usar o **mesmo** salt em base64 que o servidor usou; rotacionar o
  salt invalida todo envelope anterior.
- Contagem de iterações errada. Corresponda ao `Encryption:Iterations` exatamente.
- O envelope foi truncado em trânsito (por exemplo, uma ferramenta que reconverte finais de linha em um
  arquivo binário). Rebusque os bytes de forma exata.

### A descriptografia falha com "Unknown magic"

**Sintoma.** O script do destinatário reporta `unknown magic`.

**Causa raiz.** O arquivo baixado não é um envelope BSENC — na maioria das vezes, o operador baixou o
texto claro de um job não criptografado por engano.

**Correção.** Confirme a flag `outputEncrypted` do job via `GET /api/jobs/{id}`. Se o job foi assinado com
a criptografia desligada, o `.signed.pdf` (etc.) é o arquivo a ler, e não um `.enc`.

### Senha de criptografia perdida

**Sintoma.** O operador esqueceu a senha; existem saídas criptografadas que precisam ser legíveis.

**Realidade.** Irrecuperável. O Bulk Signer não tem custódia, não tem recuperação, não tem endpoint de
descriptografia. Com o salt e as iterações estáveis, quebrar o PBKDF2 por força bruta sobre uma senha
forte é computacionalmente inviável (esse é o ponto).

Planejamento futuro:

- Guarde a senha em um gerenciador de segredos que suporte recuperação (HashiCorp Vault, AWS Secrets
  Manager, Azure Key Vault).
- Imprima e lacre uma cópia em armazenamento físico, como backup de último recurso.

## Integração com o Lacuna Signer

O passo a passo completo do operador está em
[Integração com o Lacuna Signer](lacuna-signer.md). As entradas abaixo são os modos de falha específicos
daquele caminho.

### `Signer:Endpoint is required` / `Signer:ApiKey is required` na inicialização

**Sintoma.** O bootstrap falha com uma exceção de validação contra `Signer:Endpoint` ou `Signer:ApiKey`.

**Causa raiz.** Parte do bloco `Signer:*` está definida e o resto não. O validador se autocondiciona à
seção: omita-a por inteiro e nada é exigido; escreva qualquer parte dela e o bloco inteiro é validado,
porque uma conexão configurada pela metade é uma que falharia no seu primeiro despacho em vez de no boot.

:::warning Alterado na 2.1.0
Esta verificação não olha mais quais perfis existem — os perfis vivem na base operacional e podem ser
passados para o Lacuna Signer pelo dashboard a qualquer momento. A exigência passou para o perfil: veja a
próxima entrada.
:::

**Correção.** Defina tanto `Signer__Endpoint` quanto `Signer__ApiKey` (variáveis de ambiente), ou remova a
seção se este host assina tudo localmente. O formato da chave de API é `application-id|secret`.

### `Method = LacunaSigner, but this host has no Signer: settings`

**Sintoma.** Uma recusa de boot nomeando o `Method` de um perfil, ou a mesma frase no formulário do perfil
quando um salvamento é recusado.

**Causa raiz.** Um perfil de assinatura seleciona o serviço remoto e este host nunca foi informado de onde
ele está. A recusa é a mesma seja qual for a origem do perfil — uma entrada de `Signing:Profiles[]` sendo
importada em um primeiro boot, ou um salvamento pelas páginas de perfil do dashboard.

**Correção.** Defina `Signer__Endpoint` + `Signer__ApiKey` e reinicie, ou dê ao perfil `Method = Local`.

### Todo documento despachado falha com `signer.unreachable`

**Sintoma.** Os jobs chegam a `Processing` e imediatamente transicionam para `Failed` com o código de
auditoria `signer.unreachable`.

**Causas possíveis:**

- **Chave de API errada.** A chave de API literal é removida dos logs, mas um erro permanente do SDK com
  status `401` é a pista. Gere a chave novamente na administração do Lacuna Signer e atualize o
  `Signer__ApiKey`.
- **Rede inalcançável.** `curl -v "$SIGNER_ENDPOINT/api/version"` a partir do host. Se o `curl` falhar,
  conserte primeiro o firewall / proxy / DNS.
- **Erro de digitação no endpoint.** O `Signer:Endpoint` precisa incluir o esquema (`https://`). O banner
  de inicialização mostra o valor configurado — releia-o.

### Documentos travados em `AwaitingSigner` além do `Signer:TimeoutHours`

**Sintoma.** O card **Aguardando assinador** do dashboard sobe continuamente; nada transiciona para
`Completed`.

**Causas possíveis:**

1. **O participante não assinou.** Abra a administração do Lacuna Signer e confira o status do documento
   com o id correspondente. Se ele estiver `Pending` além do `Signer:TimeoutHours`, o worker de consulta
   vai reprovar o job local com `signer.timeout` em seu próximo tique — esse é o contrato.
2. **O worker de consulta não está rodando.** Procure no log por `SignerPollWorker started`. Se ausente, o
   host não tem configurações `Signer:*`, então nem o gateway nem o worker de consulta estão registrados —
   defina `Signer__Endpoint` + `Signer__ApiKey` e reinicie. (Desde a 2.1.0 o registro segue essas
   configurações, e não os perfis, então um host que as tem está pronto para um perfil passado para o
   Lacuna Signer depois de ele ter subido.)
3. **O pipeline está pausado.** O `GET /api/pipeline/state` retorna `{ paused: true }`. O worker de
   consulta honra a flag de pausa. Faça `POST /api/pipeline/resume` para desbloquear.

### O operador cancelou, mas o participante ainda vê o documento

**Sintoma.** O job está localmente `Canceled`; o participante assinante ainda recebe um e-mail de lembrete
ou vê o documento em sua caixa de entrada do Signer.

**Causa raiz.** O cancelamento é em *melhor esforço* do lado remoto. Se a chamada de cancelamento remoto
falhou no momento do cancelamento local, a transição local foi honrada mas o documento remoto não foi
cancelado. O log carrega uma linha de `Warning` sobre a falha do cancelamento em melhor esforço.

**Correção.** Cancele o documento manualmente na administração do Lacuna Signer. O job local está
corretamente `Canceled` e não precisa de mais nada.

### O dashboard não mostra o card "Aguardando assinador" nem o painel "Lacuna Signer"

**Sintoma.** Um perfil está configurado com `Method = LacunaSigner`, mas o dashboard não mostra o card
Aguardando assinador e a página Sistema não mostra o painel do Lacuna Signer.

**Causa raiz.** Desde a 2.1.0 os perfis vivem na base operacional, e o `Signing:Profiles[]` só é
importado no primeiro boot contra uma tabela de perfis vazia. Se você acrescentou ou alterou o perfil no
`appsettings.Production.json` depois desse primeiro boot, a edição não teve efeito — o banner de
inicialização diz que a seção está sendo ignorada — e nenhum perfil armazenado tem
`Method = LacunaSigner`.

**Correção.** Confira a [página de perfis de assinatura](dashboard.md#profiles--perfis-de-assinatura) do dashboard, que mostra o que a base realmente
guarda. Crie o perfil ali, ou passe um existente para o Lacuna Signer (o host precisa das configurações
`Signer:*` — veja acima). Um perfil salvo chega ao host em execução dentro de um intervalo de sondagem, sem
reinicialização; recarregue a página Dashboard ou Sistema para ver o card e o painel.

### O contador de erros transitórios sobe mas nenhum job falha

**Sintoma.** O `bulksigner_signer_api_errors_total{op="poll"}` aumenta, mas os jobs permanecem em
`AwaitingSigner`.

**Causa.** Isso é esperado para uma indisponibilidade breve. O contador de falhas por documento fica em
memória e é limitado por `Signer:MaxConsecutiveApiFailures` (padrão 5). Uma consulta bem-sucedida zera o
contador. Uma vez que o contador de um único documento excede o orçamento, aquele job é reprovado com
`signer.unreachable` e deixa `AwaitingSigner`. As outras linhas não são afetadas.

**Correção.** Se a indisponibilidade a montante for sustentada, conserte aquilo primeiro. Um reinício zera
os contadores em memória; jobs já reprovados não são repetidos automaticamente (o operador dirige a
repetição).

## Rede / HTTPS

### `https redirect = on` em uma instalação como serviço — os clientes não alcançam a API

**Sintoma.** O banner de resumo de prontidão mostra `https redirect = on`, a instalação está atrás de um
proxy reverso terminando o TLS, e os clientes agora recebem `308 → https://localhost:8080/...`.

**Causa raiz.** O `Hosting:RequireHttps = true` está definido em algum lugar, e o serviço está escutando
em HTTP puro, então o destino do redirecionamento aponta para uma porta que não serve HTTPS.

**Correção.** Defina `Hosting:RequireHttps = false` (o padrão do serviço), ou configure um certificado no
Kestrel e escute em HTTPS em processo.

### Conflito na porta 8080

**Sintoma.** O bootstrap falha com
`Failed to bind to address http://0.0.0.0:8080: address already in use`.

**Causa raiz.** Outro serviço já está vinculado à porta 8080.

**Correção.** Mude o `ASPNETCORE_URLS` para uma porta livre (por exemplo, `http://0.0.0.0:18080`). Por
alvo:

| Alvo | Onde |
|------|------|
| Linux | Acrescente `ASPNETCORE_URLS=http://0.0.0.0:18080` a `/etc/bulksigner/bulksigner.env`. |
| Windows | `[Environment]::SetEnvironmentVariable("ASPNETCORE_URLS", "http://0.0.0.0:18080", "Machine")` e reinicie. |
| Docker | Edite a linha `ports:` em `deploy/docker/docker-compose.yml`. |

## Banco de dados

### O dashboard congela enquanto um lote assina (SQL Server)

**Sintoma.** O dashboard trava, ou as páginas levam dezenas de segundos, mas somente enquanto o pipeline
está trabalhando. Nenhum job falha.

**Causa raiz.** O `READ_COMMITTED_SNAPSHOT` está **desligado** no banco de dados. Sem ele, as leituras do
dashboard tomam locks compartilhados e travam atrás das escritas do pipeline. O Azure SQL o habilita por
padrão; o SQL Server *on premises* não.

**Correção.** O banner avisa no boot (`store isolation = READ_COMMITTED_SNAPSHOT off …`) e alerta no
console de operação. O Bulk Signer o reporta e **nunca emite o comando que o altera** — isso precisa de
acesso exclusivo a um banco de dados que é seu:

```sql
ALTER DATABASE [BulkSigner] SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
```

O `WITH ROLLBACK IMMEDIATE` encerra outras conexões, então pare o serviço primeiro. Depois reinicie-o e
confirme que o banner não reporta mais a linha — quando está ligado, nada é reportado.

### A linha da base diz `UNREACHABLE` e o serviço subiu mesmo assim

**Não é uma falha.** Um banco de dados fora do ar durante uma janela de manutenção não pode transformar uma
reinicialização em indisponibilidade, então o host sobe, a migração é **pulada**, e o `/api/ready` fica
vermelho (o detalhe da verificação `database`, em `/api/ready/details`, nomeia a base).

**Correção.** Conserte a base, e então **reinicie**. O veredito de prontidão é tomado por requisição, mas
ele também permanece vermelho por toda a vida de uma instância cujo boot pulou a migração — isso limpa no
próximo boot, e não quando a base volta.

Causas comuns: o banco de dados não existe (o Bulk Signer cria suas *tabelas*, não seu banco de dados); o
login não está mapeado para um usuário nele; um TLS que o cliente não aceita (o `Encrypt` tem padrão
`True`, então um certificado de servidor não confiável reprova o login com *certificate chain … not
trusted*); ou, no Azure SQL de dentro do Azure, apenas a TCP 1433 aberta, quando a política de conexão
`Redirect` também precisa das TCP 11000–11999.

### O serviço se recusa a iniciar com `Database migration failed`

**Causa raiz.** Uma migração não pôde ser aplicada. Na maioria das vezes o login não tem `db_ddladmin`,
que é necessário no primeiro boot e em qualquer boot após uma atualização que traga uma migração.

**Correção.** Conceda a role e reinicie. Esta falha é fatal por design — rodar contra um schema que o
código não corresponde é pior do que não iniciar.

### Um job ou uma página falha uma vez e depois funciona (SQL Server)

**Não é uma falha.** A repetição em falhas transitórias está ligada sob `SqlServer` com os padrões do EF
Core — a tentativa inicial mais até seis repetições contra os números de erro que o cliente SQL classifica
como transitórios, cada atraso limitado a 30 segundos. Ela está ligada porque rodar contra o Azure SQL
efetivamente a exige, e deliberadamente não há chave de configuração: um orçamento de repetição que um
operador consegue ajustar é um orçamento de repetição que é ajustado para zero durante um incidente.

Se as repetições estão se esgotando, olhe o caminho de rede em vez do orçamento.

### Comandos na base estouram o tempo em 35 s alguns segundos depois de o App Service substituir o container

**Sintoma.** No Azure App Service com `Database:Provider = SqlServer`, de um a três comandos falham com
`Execution Timeout Expired` alguns segundos depois de a plataforma parar o container *anterior* no mesmo
worker — cada um medindo 35 s, nunca 30 — e nada falha depois disso. As vítimas são o que quer que tenha
pedido em seguida: `Takeover sweep failed`, `Pipeline worker iteration failed`, um tique de heartbeat, ou o
carregamento de uma página. O `/api/ready` continua verde e a próxima sondagem tem sucesso.

**Causa.** Não é a base. Quando a plataforma remove o container antigo, conexões que o novo container
colocou no pool durante seu aquecimento podem morrer na rede sem serem fechadas, e ainda parecer vivas para
o pool de conexões. O primeiro comando em uma delas espera o timeout de comando inteiro de 30 s, e depois
5 s para que o servidor confirme um cancelamento que ele nunca recebe — 35 s é a assinatura de uma conexão
que parou de responder, enquanto uma consulta que o servidor de fato está bloqueando falha em 30 s. A
conexão morta então sai do pool, e é por isso que o episódio termina sozinho; um timeout não é repetido,
então cada conexão morta custa exatamente uma falha.

**Correção.** Nenhuma no produto: a varredura pergunta de novo na próxima sondagem, um tique de heartbeat
perdido está a 15 s do próximo, e o carregamento de uma página tem sucesso ao recarregar. Quando a janela
importa, implante com uma parada — parado primeiro, o container antigo já se foi antes de o novo abrir uma
conexão (veja [Alta disponibilidade](high-availability.md#atualizações-param-o-mundo)). Não aumente o
timeout de comando nem acrescente uma repetição para isto — um alonga a espera e o outro a repete. Uma
travada real da base tem outra cara: falhas em 30 s, e sinal de DTU, deadlock ou `blocked_by_firewall` no
Azure Monitor.

### A inicialização é recusada porque a connection string não corresponde ao provider

**Causa raiz.** Uma de duas recusas, e qual delas depende do `Database:Provider`:

- Sob `SqlServer`, um data source nomeando um **arquivo** em vez de um servidor — o que uma implantação que
  virou o provider e deixou o caminho SQLite para trás produz. Sem a recusa isso chegaria como uma falha de
  login contra um servidor nomeado com um caminho.
- Sob `Sqlite`, uma connection string nomeando um local do Azure Files — um arquivo de banco de dados
  acessado por SMB é a forma documentada de corrompê-lo.

Também sob `SqlServer`: uma connection string **ausente** é recusada em vez de adivinhada. Nenhuma recusa
jamais ecoa a string, porque ela pode carregar uma senha; apenas o data source é citado.

:::warning A variável de ambiente substitui o valor inteiro
`ConnectionStrings:Default` é uma única chave, então não há como manter o servidor no
`appsettings.Production.json` e fornecer apenas a senha pelo ambiente. Um valor JSON deixado no lugar ao
lado da variável de ambiente é silenciosamente ignorado, em vez de combinado com ela.
:::

### Depois de migrar para o SQL Server, todo job e toda aprovação sumiram

**Não recuperável a partir da nova base — e não é uma falha.** Não há importador nem verificação no boot
para um arquivo SQLite deixado para trás, então a nova base sobe com um schema vazio: sem jobs, sem
histórico, sem eventos operacionais, e **sem snapshots de aprovação e sem aprovações registradas**.

**Correção.** O antigo `db/bulksigner.db` ainda está em disco, a menos que algo o tenha removido.
Arquive-o e mantenha um cliente SQLite à mão para o dia em que alguém perguntar quem aprovou um arquivo de
pagamento anterior à migração. Veja
[Instalação](installation.md#migrando-do-sqlite--arquive-o-arquivo-antigo-primeiro) para a ordem em que
fazer isso da próxima vez.

### SQLite "database is locked"

**Sintoma.** Erros esporádicos mencionando "database is locked".

**Causas possíveis:**

- Um processo externo (por exemplo, uma ferramenta gráfica de SQLite) tem o banco aberto e está segurando
  um lock de escrita.
- O sistema de arquivos não suporta locking (algumas montagens de rede).

**Correção.** Feche a ferramenta externa. Evite SQLite montado em rede — mantenha o banco em disco local.

### O banco cresceu demais

**Sintoma.** O `db/bulksigner.db` tem vários gigabytes.

**Diagnóstico.** Confira as contagens de linhas de histórico e de jobs. Não há retenção automática (veja
[Retenção](retention.md)).

**Correção.** Arquive o banco manualmente: pare o serviço, mova `db/bulksigner.db` para
`db/bulksigner-archive-AAAAMM.db`, inicie o serviço. Um banco novo é inicializado; o arquivo morto é
somente leitura. Abra o arquivo morto em um cliente SQLite para consultas históricas.

Sob `Database:Provider = SqlServer` o crescimento é o mesmo e a receita não: não há arquivo para mover, e
começar uma base nova à mão descartaria as aprovações registradas junto com todo o resto. Arquive linhas
com o ferramental do seu próprio SGBD.

:::warning Clear Jobs não é um arquivamento
O **Clear Jobs** na página Sistema (ou `DELETE /api/jobs`) apaga **todo** registro de job, seja qual for o
status (desde a 2.9.0), os arquivos que esses jobs deixaram para trás — entradas, cópias em stage, pastas de
erro e saídas assinadas — e (desde a 2.10.0) todo evento operacional registrado antes dele. Nada é mantido
para consulta posterior. Veja [Operação](operations.md#clear-jobs).
:::

## Modo cluster

Tudo nesta seção exige `Cluster:Enabled = true`. Fora da chave, nada disso se aplica — veja
[Azure App Service (modo cluster)](azure.md) para a implantação e
[Alta disponibilidade](high-availability.md) para o que o modo compra e o que não compra.

### `Cluster mode refused to start`, nomeando chaves de configuração

**Sintoma.** O host sai no boot com uma mensagem nomeando uma ou mais de `Database:Provider`,
`Storage:Provider`, `Storage:Inputs[]` ou um `Source` de certificado.

**Diagnóstico.** Estas são as configurações que não poderiam ter funcionado, recusadas em vez de meio
executadas. A mensagem nomeia **todas** as chaves com problema de uma vez, em vez de uma por tentativa,
então uma leitura basta:

| Chave nomeada | O que ela precisa ser | Por quê |
|---|---|---|
| `Database:Provider` | `SqlServer` | A base é o ponto de coordenação do cluster; um arquivo SQLite não pode ser compartilhado entre hosts. |
| `Storage:Provider` | `AzureFiles` | O lease da base local de arquivos não exclui nada fora do próprio processo. |
| cada entrada de `Storage:Inputs[]` | em `AzureFiles` | Uma pasta local a uma instância é invisível para suas irmãs. A pasta `default` sintetizada sem configuração é local, então uma primeira execução com a chave ligada também recusa. |
| um `Source` de certificado | nem `Pkcs11`, nem `WindowsStore` | Um token ou um repositório de máquina vive em uma máquina, e instâncias de cluster são intercambiáveis. Use `Pfx` (idealmente lido de um blob) ou `AzureKeyVault`. |

**Correção.** Corrija as chaves nomeadas, ou desligue o `Cluster:Enabled` — desligado é o produto de
instância única, sem mudanças. Um compartilhamento NFS do Azure Files é recusado nominalmente; o
compartilhamento de trabalho precisa ser SMB.

### Boot recusado: uma identidade de instância `could not be registered in 3 attempts`

**Sintoma.** O host sai nomeando sua própria identidade derivada de instância, o log carrega o mesmo em
`Critical`, e a mensagem diz que a identidade não pôde ser registrada — toda escrita da linha de heartbeat
deste boot perdeu uma corrida para outra encarnação — informando o último batimento e a versão de quem
venceu.

:::warning Alterado na 2.5.0 — uma identidade viva é deslocada, não recusada
Até a 2.4.x um boot que encontrava a própria identidade com um heartbeat vivo se recusava a iniciar (a
2.4.3 esperava antes). Desde a 2.5.0 ele **desloca** o detentor — veja a próxima entrada. A recusa acima é a
única que restou.
:::

**Diagnóstico.** Algo está reescrevendo a linha desta identidade mais depressa do que um boot consegue
tomá-la: dois hosts apresentando o mesmo nome **e subindo no mesmo momento** contra um mesmo banco de
dados, ou uma falha na base. A identidade é o id de instância do App Service onde a plataforma define um, e
o nome da máquina onde não define. A recusa é fatal de propósito: um boot que não consegue ter sua linha
escrita não pode ser distinguido de nada mais pela recuperação, pela assunção ou pela visão Instances.

**Correção.** Leia a visão Instances na página Sistema de uma instância que *está* rodando, encontre a linha
que detém aquela identidade, e ou pare o que mais a estiver apresentando, ou aponte-o para o seu próprio
banco de dados. **Não** apague a linha para passar pela recusa enquanto o detentor ainda estiver rodando —
isso remove o relato, não a condição.

### Depois de uma reimplantação, a instância antiga registra `has been displaced` e se retira

**Sintoma.** Trocar a imagem de um app em execução (`az webapp config container set`) produz, no log, um
Warning `displaced the previous incarnation … which was still live` e, cerca de três segundos depois, um
Critical `has been displaced`. O `/api/ready` de um dos containers carrega uma linha `cluster-instance`
vermelha (e continua 200), sua página Sistema mostra um aviso, e um evento operacional `InstanceStoodDown`
é registrado.

**Diagnóstico. Isto é uma reimplantação normal no lugar no App Service (desde a 2.5.0).** A plataforma
inicia o novo container **ao lado** do antigo na mesma instância — ambos derivam a mesma identidade — e
mantém o antigo servindo até que o novo passe na sua sondagem de aquecimento. O novo container toma a
identidade de imediato e registra qual encarnação deslocou; o antigo descobre isso no seu próximo batimento
e **se retira**: não reivindica job novo, não roda assunção, não consulta o Lacuna Signer à toa, termina o
que detém, e serve a web até a plataforma pará-lo. O que ele deixar inacabado é assumido um
`Cluster:StaleAfterSeconds` depois do deslocamento, sob a política de assunção comum. Nenhuma falha de
inicialização e nenhum `ContainerStartupFailure`; a visão Instances mostra a encarnação deslocada sob a
linha da sucessora. Veja
[Operação](operations.md#quando-um-boot-encontra-a-própria-identidade-ainda-viva).

**Lendo o log da sobreposição.** Enquanto os dois containers rodam, o App Service escreve a saída dos dois
processos em um só log, sem nada dizendo de qual container veio cada linha, então o Critical do container
antigo aparece entre as linhas de boot do novo e dá a impressão de que o *novo* container se retirou. Não se
retirou: o Critical em um log de sobreposição é sempre do container antigo — o recém-chegado registra um
Warning nomeando a encarnação que deslocou.

**Se o novo container então falhar no aquecimento** — uma imagem ruim, um erro de configuração pego depois
do registro — o App Service para o **site inteiro**, inclusive o container antigo já retirado, e o reinicia
com a imagem *nova*, em um laço de 503s. No App Service o remédio é seu: aponte o app de volta para a tag
anterior com `az webapp config container set`, e ele fica pronto de novo em cerca de dois minutos. Parar o
app antes de trocar a imagem e iniciá-lo depois (veja
[Alta disponibilidade](high-availability.md#atualizações-param-o-mundo)) evita a sobreposição por completo
e continua sendo a implantação mais limpa.

**Uma duplicata genuína — dois hosts apresentando um nome, ou um deployment slot carregando a connection
string de produção — também não é mais recusada.** O boot posterior desloca o anterior, e uma
reinicialização do host deslocado toma a identidade de volta, então os dois se alternam ruidosamente: um
Warning em cada recém-chegado, um Critical em cada processo que se retira, e uma encarnação deslocada na
visão Instances que não para de mudar. A cada momento, exatamente um deles reivindica trabalho. Encontre o
host que não deveria estar apresentando esta identidade, e renomeie-o ou aponte-o para o seu próprio banco
de dados. Slots não são suportados nesta topologia.

### Boot recusado nomeando duas bases operacionais

**Sintoma.** O host sai dizendo que o marcador do compartilhamento de trabalho nomeia uma base operacional
diferente daquela com que esta instância está configurada, nomeando ambas.

**Diagnóstico.** Dois clusters estão apontados para um compartilhamento de trabalho. Esta é a única
catástrofe que banco de dados nenhum consegue enxergar — cada base acredita ser dona da árvore, e elas
sobrescrevem os diretórios de staging, saída e erro uma da outra — que é exatamente o que o marcador existe
para pegar.

**Correção.** Decida qual base é a autoritativa e reaponte ou aposente a outra. **Não** apague o marcador
para fazer a mensagem sumir; ele é a única guarda contra esta condição.

:::note O que o gate não pega
Ele recusa sobre evidência e nunca sobre a ausência dela, então um compartilhamento que ainda não carrega
marcador, e o instante de uma escrita de nomeação, são ambos estreitados em vez de fechados — e uma
verificação que roda uma vez no boot não consegue enxergar um cluster rival chegando depois. O gate também
**não** é o que impede duas instâncias de assinarem um arquivo; quem faz isso são o lease por arquivo e a
reivindicação no banco. Veja
[Alta disponibilidade](high-availability.md#o-gate-do-compartilhamento-de-trabalho-é-mais-estreito-que-a-catástrofe-que-lhe-dá-nome).
:::

### Operadores (ou aprovadores) são jogados de volta ao login de forma intermitente

**Sintoma.** As sessões funcionam, e depois não, aparentemente ao acaso — e com mais frequência quanto mais
instâncias estiverem rodando.

**Diagnóstico.** As instâncias não estão compartilhando um key ring de Data Protection, então um cookie
criado por uma é rejeitado pela seguinte. Ambos os cookies de sessão usam aquele ring, então isso deixa
órfãos aprovadores tanto quanto operadores. Duas causas:

- **Um host tem `Cluster:Enabled = false`.** O posicionamento do ring segue a chave, então aquele host
  ainda está usando seu diretório `keys/` local.
- **As instâncias estão apontadas para bases operacionais diferentes.** Base diferente, ring diferente.

**Correção.** Faça com que a chave e a connection string sejam idênticas em toda instância — o que no App
Service é automático, já que os app settings são por app. Note que **a afinidade ARR não conserta isso**: a
afinidade é para o circuito Blazor, o ring compartilhado é para o cookie.

### A inicialização registra um Critical sobre instâncias em uma versão diferente da aplicação

**Sintoma.** Um Critical no boot nomeando heartbeats vivos carregando uma versão diferente, e o host sobe
mesmo assim.

**Diagnóstico.** Versões mistas estão dividindo uma base, uma fila e um compartilhamento de trabalho. É um
aviso em vez de uma recusa, de propósito: recusar bloquearia instâncias de subir por todo o tempo que um
heartbeat *morto* da versão antiga levasse para ficar obsoleto, que é exatamente o momento seguinte a uma
implantação que falhou.

**Correção.** Termine a implantação — pare toda instância, implante, inicie. Se nada está sendo implantado,
procure um slot ou uma segunda implantação neste banco de dados. Trate o Critical como o alarme que ele é;
nada mais vai parar isso. (Um container antigo sendo deslocado durante uma reimplantação no lugar não o
dispara: aquela é a vida anterior da própria identidade, e não uma irmã.)

### Um job está travado e instância nenhuma o toca

**Sintoma.** Uma linha fica em `Processing`, `Verifying` ou `AwaitingSigner` indefinidamente. Nenhum evento
de assunção aparece, e a recuperação de boot não a limpa.

**Diagnóstico.** A linha não tem **nenhum dono**, ou nomeia uma instância sem linha de heartbeat nenhuma. A
recuperação de boot pega apenas a identidade da própria instância, e a assunção segue o heartbeat de um
dono, então uma linha sem nenhum dos dois é uma linha que ninguém reconcilia. Linhas sem dono são deixadas
por uma build anterior à coluna de propriedade, ou por uma execução com o modo desligado. Um job assim
despachado ao Lacuna Signer é pior do que parece: o `Signer:TimeoutHours` só é imposto enquanto uma linha
está sendo consultada, então uma linha que nada consulta é uma linha que nada limita.

**Correção.** **Suba uma vez com `Cluster:Enabled = false`** e deixe a
[recuperação na inicialização](operations.md#recuperação-na-inicialização) comum varrer toda linha em
andamento, seja quem for o dono, e então religue o modo. Faça isso na atualização, antes do primeiro boot
em cluster, e deixa de ser uma preocupação. Este é o remédio que toda superfície que encontra uma dessas
linhas nomeia.

### Linhas de log sobre reivindicações perdidas e conflitos de lease, em um cluster saudável

**Sintoma.** Linhas constantes de "claim lost to a concurrent writer" e de conflito de lease de entrada
sempre que arquivos chegam em lotes.

**Diagnóstico.** **Isto é o sistema funcionando.** Toda instância monitora toda pasta, então elas correm a
cada chegada, e no modo cluster o lado perdedor é registrado no nível de desfecho esperado, sob seu próprio
id de evento. Todo arquivo ainda vira exatamente um job — o enfileiramento perdedor é recusado por um
índice único parcial e respondido como `AlreadyActive`.

**Correção.** Nenhuma. Nenhum dos dois desfechos conta contra o orçamento de falhas consecutivas de uma
pasta, então um cluster movimentado não consegue disparar o disjuntor por pasta por estar movimentado. Veja
[Operação](operations.md#contenção-entre-instâncias-não-é-uma-falha).

### As séries do Prometheus pulam entre instâncias

**Sintoma.** Os gauges em `/api/metrics` são descontínuos, e o `bulksigner_jobs_awaiting_signer` lê um
valor menor que a contagem do dashboard.

**Diagnóstico.** O `/api/metrics` é por processo e o front door do App Service não consegue mirar uma
instância, então cada coleta cai em qualquer instância que o balanceador de carga tenha escolhido.
**Nenhuma configuração recupera a continuidade da coleta.** O gauge também é por instância por design: ele
conta as linhas que *esta* instância consulta.

**Correção.** Use `sum()` sobre a frota para obter um total do cluster — nada é contado em dobro, já que um
job tem exatamente um dono. Para um caminho suportado, use a distro do Application Insights, que é
nativamente ciente de instâncias ([Telemetria](telemetry.md)). Veja
[Alta disponibilidade](high-availability.md#a-coleta-de-métricas-alcança-uma-instância-arbitrária).

### Uma pausa reteve toda instância, e isso não era esperado

**Sintoma.** O `POST /api/pipeline/pause` parou a frota inteira, em vez da instância para a qual foi
enviado.

**Diagnóstico.** Não é uma falha. A flag de pausa é uma linha que todo worker lê a cada iteração de
consulta, então a pausa é de cluster inteiro — que é o que um operador pausando "o pipeline" quer dizer.
**Não existe drenagem por instância**, e ela deliberadamente não foi construída.

**Correção.** Para tirar uma instância, pare-a e deixe a
[assunção](operations.md#quando-uma-instância-para-de-responder-uma-sobrevivente-assume-seus-jobs)
reconciliar seu trabalho. Note que a assunção fica *atrás* do gate de pausa, então um cluster pausado não
declara suas irmãs mortas.

## Específico do Docker

### O `docker compose ps` mostra `(unhealthy)`

**Sintoma.** O container está rodando mas reporta `(unhealthy)`.

**Diagnóstico.** `docker compose exec bulksigner curl -v http://localhost:8080/api/health` de dentro do
container. A imagem base traz `curl`; a linha `HEALTHCHECK` no Dockerfile é a versão autoritativa do
comando de verificação.

### O `chown -R 1654:1654` falha / divergência de propriedade de arquivos

**Sintoma.** Os logs do container mostram permissão negada em `data/` ou `logs/`.

**Causa raiz.** A imagem roda como UID 1654. Em hosts Linux fazendo bind mount de `./data` e `./logs`,
aqueles diretórios precisam pertencer ao UID 1654.

**Correção.** Antes do primeiro start: `sudo chown -R 1654:1654 ./data ./logs`.

### Uploads falham com `Access to the path '/app/entrada' is denied`

**Sintoma.** Um upload pelo dashboard ou pelo `POST /api/files` falha com
`System.UnauthorizedAccessException: Access to the path '/app/<primeiro segmento de Storage:Inputs[0].Path>' is denied`,
em um container cuja primeira pasta monitorada está em um compartilhamento do Azure Files. Arquivos soltos
no compartilhamento são pegos normalmente.

**Causa raiz.** Antes da 2.4.2 a pasta de destino dos uploads era derivada como um caminho *local* a partir
do `Path` da primeira pasta, fosse qual fosse o provider da pasta, então `entrada/remessas` no
compartilhamento virava `/app/entrada/remessas` no disco do container — o diretório de trabalho, de
propriedade do root. Em uma instalação como Windows Service ou systemd a mesma falha era mais silenciosa: o
upload era aceito em uma pasta local que nenhum observador lê.

**Correção.** Atualize para a 2.4.2 ou posterior e reinicie. Nenhuma mudança de configuração: os uploads
caem na primeira pasta monitorada, no provider dela.

## Específico do Windows

### O serviço não inicia e não há entrada no log de Aplicativo

**Sintoma.** `Start-Service LacunaBulkSigner` falha; o Visualizador de Eventos não mostra nada útil.

**Passos de diagnóstico:**

1. Rode o binário em modo console a partir do local de instalação:
   `cd "C:\Program Files\Lacuna\BulkSigner"; .\Lacuna.BulkSigner.exe`. Exceções de bootstrap aparecem
   imediatamente.
2. Olhe `C:\ProgramData\Lacuna\BulkSigner\logs\bulksigner-*.log`.
3. O log de Aplicativo carrega apenas eventos de nível de serviço; eventos de nível de aplicação estão no
   destino de arquivo.

### O serviço inicia mas o arquivo de log está vazio

**Sintoma.** O `Get-Service` mostra Iniciado; o dashboard funciona; mas o `bulksigner-yyyyMMdd.log` está
vazio.

**Causa raiz.** A conta virtual do serviço não consegue escrever em
`C:\ProgramData\Lacuna\BulkSigner\logs\`. O script de instalação concede Modificar, mas uma ACL adulterada
ou um software de segurança de terceiros pode ter desfeito isso.

**Correção:**

```powershell
icacls "C:\ProgramData\Lacuna\BulkSigner" /grant "NT SERVICE\LacunaBulkSigner:(OI)(CI)M" /T
```

## Específico do Linux

### O `systemctl status bulksigner` mostra `active (running)` mas o `/api/health` não retorna nada

**Sintoma.** A unit está ativa mas nenhuma resposta HTTP volta.

**Diagnóstico.** `journalctl -u bulksigner -f` e procure o banner `Service ready`. Se o banner nunca
apareceu, o bootstrap está travando em algo. A unit com `Type=notify` não vira ativa até o bootstrap
completar, então, se você vê `active (running)`, o bootstrap terminou — confira se o `ASPNETCORE_URLS` está
definido corretamente no `bulksigner.env`.

### O serviço está em estado `failed` após uma reinicialização do host

**Sintoma.** Após uma reinicialização do host, o `systemctl status bulksigner` está `failed`.

**Diagnóstico.** `journalctl -u bulksigner -b` (desde este boot). Causas comuns:

- Uma variável de ambiente obrigatória não foi carregada — o `EnvironmentFile` é opcional (`-` inicial),
  então a unit inicia sem ele, e o validador então falha.
- O token PKCS#11 não estava conectado no boot. Reconecte e `sudo systemctl restart bulksigner`.

## Saída no console

### Uma execução em primeiro plano mostra um terminal vazio / quase em branco

**Sintoma.** Uma execução em primeiro plano mostra o banner de boot e o resumo de Service ready, e então o
terminal parece silencioso — sem linhas de log por job, sem saída em fluxo contínuo.

**Causa provável.** Este é o comportamento pretendido do
[Dashboard no console](dashboard.md#dashboard-no-console-somente-execuções-em-primeiro-plano): em um
terminal interativo ele suprime a saída de console em fluxo contínuo e renderiza um painel ao vivo que se
redesenha no lugar.

**Diagnóstico.**

1. Redimensione / role para trás no terminal — o painel ao vivo pode estar algumas linhas abaixo da área
   visível.
2. Confira `data/logs/bulksigner-*.log` (ou o seu `Logging:File:Path` configurado) — o destino de arquivo
   está sempre ativo e captura tudo.
3. Verifique se o terminal suporta posicionamento de cursor. Terminais modernos funcionam; o
   `conhost.exe` legado e alguns clientes SSH restritos recaem para saída com rolagem.
4. Para desativar e recuperar a visão de log em fluxo contínuo, defina `Console:Dashboard:Enabled = false`
   e reinicie.

### Implantações em modo serviço não estão recebendo nenhuma saída padrão

**Sintoma.** O `journalctl -u bulksigner` ou o `docker logs <container>` mostra o banner de bootstrap mas
nenhum evento depois.

**Causa provável.** O predicado de ativação do dashboard ao vivo deveria se recusar a ativar em um host de
serviço. Se você suspeita que ele está disparando errado no seu host, force a desativação: defina
`Console:Dashboard:Enabled = false` no `appsettings.Production.json` e reinicie. A saída de console em
fluxo contínuo voltará.

## Diagnóstico de último recurso

Quando o acima não ajuda:

1. **Aumente a verbosidade do log.** Defina `Logging:File:MinimumLevel = "Debug"` (ou `Verbose`) e
   reinicie. Reproduza. Leia o log em arquivo.
2. **Leia o banner de bootstrap.** Ele lhe diz qual passo estava mal configurado (impressão digital da
   licença vs. origem do certificado vs. criptografia).
3. **Faça bisseção por ambiente.** Rode o mesmo binário em primeiro plano em modo `Development` — o
   terminal mostra o detalhe completo da exceção (o envelope de erro de Production o remove).
4. **Leia o log de eventos operacionais.** Desde a 2.13.0 a [página **Events**](dashboard.md#events--eventos-operacionais) do dashboard (e o
   `GET /api/events`) lista todo evento operacional — pausa e retomada, edições de perfil, decisões de
   aprovação, assunções, inícios e paradas do serviço — do mais recente para o mais antigo, com filtros por
   tipo, intervalo de datas e texto. Uma trilha que começa com um evento `JobsCleared` começa ali porque o
   Clear Jobs apagou o que veio antes.
5. **Inspecione o banco de dados.** `sqlite3 db/bulksigner.db` e consultas como
   `SELECT * FROM Jobs ORDER BY CreatedAt DESC LIMIT 20;` dão um quadro completo da atividade recente.

Se, depois de tudo isso, o sintoma continuar inexplicado, entre em contato com o suporte da Lacuna
Software com o banner de bootstrap, os trechos de log relevantes (a aplicação mascara segredos, mas
verifique antes de enviar), e os passos exatos de reprodução.

---

**Anterior:** [Retenção](retention.md). **Voltar para:** [visão geral](index.md).
