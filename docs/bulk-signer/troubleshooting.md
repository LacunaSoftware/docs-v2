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

### `Auth:ApiKey is required`

**Sintoma.** O bootstrap lança erro reclamando de `Auth:ApiKey`.

**Causa raiz.** Ou não há valor, ou o valor tem menos que o mínimo de 16 caracteres.

**Correção.** Gere uma chave forte (veja [Segurança](security.md#rotação-da-chave-de-api)) e defina a
variável de ambiente correspondente.

### `Pkcs11 PIN env var <nome> is empty`

**Sintoma.** O bootstrap falha com uma mensagem referenciando o `PinEnvVar` configurado.

**Causa raiz.** `Signing:Certificate:Source = Pkcs11`, mas a variável de ambiente configurada não está
definida ou está vazia.

**Correção.** Defina a variável de ambiente nomeada por `Signing:Certificate:Pkcs11:PinEnvVar` (padrão
`BULK_SIGNER_PKCS11_PIN`). Veja [Certificados](certificates.md#tratamento-do-pin).

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

**Sintoma.** O bootstrap falha reportando que a chave pública do `.cer` difere da chave do cofre.

**Causa raiz.** `CerPath` e `KeyName` se referem a pares de chaves diferentes. Geralmente o certificado
foi renovado contra uma **nova** chave de cofre enquanto o `KeyName` ainda aponta para a antiga, ou o
`CerPath` ficou apontando para um certificado sem relação após uma edição de configuração.

Esta verificação existe porque a alternativa é pior: sem ela, o serviço sobe alegremente e produz
assinaturas que verificador nenhum aceita, e a falha aparece somente por job — e somente em perfis com
`Verify = true`.

**Correção.** Confirme qual lado está desatualizado comparando as duas chaves públicas diretamente:

```bash
openssl x509 -in signer.cer -noout -pubkey
az keyvault key download --vault-name my-vault --name bulk-signer-signing-key --encoding PEM --file -
```

Os dois blocos PEM precisam ser idênticos byte a byte. Depois atualize o lado que estiver errado.

### Falha de autenticação ou autorização no Azure Key Vault na inicialização

**Sintoma.** O bootstrap falha ao carregar o certificado, com um erro do Azure como `AADSTS7000215`
(client secret inválido), `AADSTS700016` (aplicação não encontrada), ou um `Forbidden` na operação de
chave.

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

As falhas são reportadas por perfil e agregadas, então uma implantação com múltiplos perfis vê cada
perfil mal configurado em um único erro de boot, em vez de um por reinicialização.

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

**Causa raiz.** Uma sondagem de prontidão está falhando. O corpo da resposta lista cada sondagem —
banco, pasta de entrada, licença.

**Correção.** Inspecione o corpo, e então:

| Sondagem que falhou | Onde olhar |
|---------------------|------------|
| `database` | Sob `Sqlite`: o caminho sob `Storage:Root` é gravável pela conta de serviço? Sob `SqlServer`: o servidor está alcançável, e a sondagem de boot respondeu? O detalhe da verificação nomeia a base que ela verificou. |
| `input-folder:<nome>` | A pasta existe? A conta de serviço tem permissão para enumerá-la? Semântica estrita — qualquer pasta ausente ou `Stopped` reprova a resposta inteira. |
| `storage-share:<conta>/<compartilhamento>` | Somente em compartilhamento de trabalho remoto. Credencial, alcance de rede, ou a string de escopo da atribuição de role — veja [Segurança](security.md#credenciais-de-armazenamento-do-azure-files). |
| `work-share-owner` | Somente em compartilhamento de trabalho remoto. Outra instância detinha o marcador na inicialização, ou a reivindicação não pôde ser feita. Veja abaixo. |
| `license` | A licença do PKI foi carregada? A impressão digital está no banner de resumo de prontidão; ausente significa que a string de licença foi rejeitada no boot. |

### A inicialização falha com `Signing:Profiles[N].Approval …`

**Sintoma.** O host se recusa a iniciar com uma mensagem nomeando uma chave de aprovação.

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

**Correção.** Escreva o componente de dias: `"2.00:00:00"`. O boot é o único momento em que isso é
detectável — toda outra superfície mostra o prazo quando um job já ficou retido sob ele, e o orçamento
fica congelado naqueles jobs. Cancele e reexecute qualquer coisa já retida sob a janela errada.

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
`storage-share:`, e o host subiu mesmo assim.

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
sessão Microsoft da pessoa. Isso é comportamento normal de SSO.

## A assinatura falha

### O boot tem sucesso, mas todo job falha com "Certificate not found by thumbprint"

**Sintoma.** Todo job vai de `Queued → Failed`. A mensagem de erro menciona uma divergência de
thumbprint.

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
  Espere, ou faça `POST /api/rescan` depois que o escritor terminar.
- **O observador da pasta está em `Status: Stopped`.** Veja abaixo.
- (Docker) Problema de permissão de bind mount — o UID do container (1654) precisa conseguir ler arquivos
  soltos pelo processo do host. `chown -R 1654:1654 ./data` no host.

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

:::tip Confira o fuso horário do host primeiro
"Hoje" é a data local do host. Em um host rodando em UTC enquanto o pagador está em
`America/Sao_Paulo`, a fronteira vira três horas mais cedo e um arquivo com vencimento hoje começa a ser
recusado às 21:00 no horário local. Defina `TZ=America/Sao_Paulo` no container ou na unit do systemd.
:::

### Um job fica em `AwaitingApproval` e nada acontece

**Não é uma falha por si só** — o job está esperando por uma pessoa, e vai esperar indefinidamente a menos
que o perfil defina `Approval.ExpiresAfter`. Coisas a conferir:

- **O link chegou a alguém?** O produto não envia e-mail. O link de aprovação está na página do job
  enquanto o job está retido; os links duráveis por aprovador estão na página Sistema.
- **O pool está certo?** A página do job mostra o pool **congelado no momento da retenção**, não o que
  está no seu arquivo de configuração. Se as pessoas listadas estiverem erradas, cancele o job, corrija o
  perfil e reexecute o arquivo — editar a configuração nunca muda o que um job retido exige.
- **Acompanhe o `bulksigner_approvals_expired_total`.** Uma taxa de expiração que sobe é o sinal de que
  os links não estão chegando às pessoas.

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
armazenamento. Isso é o ponto enquanto o job está em andamento.

**Correção.** Se o job é terminal e o lease ainda está detido, isso é uma falha — reinicie o serviço, o
que libera os leases que ele detém, e reporte.

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

Se a linha, em vez disso, lê `not claimed cleanly at startup: …`, o marcador não pôde ser alcançado de
forma alguma — um compartilhamento inalcançável ou uma credencial rotacionada. Se outra instância o detém
passa a ser simplesmente desconhecido, e desconhecido não é reportado como a resposta tranquilizadora. A
linha `storage-share:` do próprio compartilhamento geralmente diz por quê.

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

**Causa raiz.** Ao menos uma entrada de `Signing:Profiles[]` tem `Method = LacunaSigner`, mas o bloco de
nível superior `Signer:*` está vazio. O validador é autocondicionado: ele só exige aquelas chaves quando um
perfil de fato precisa delas.

**Correção.** Ou defina `Signer__Endpoint` + `Signer__ApiKey` (variáveis de ambiente), ou remova o perfil
com `Method = LacunaSigner` se ele foi acrescentado por engano. O formato da chave de API é
`application-id|secret`.

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
2. **O worker de consulta não está rodando.** Procure no log por `SignerPollWorker started`. Se ausente,
   nenhum perfil tem `Method = LacunaSigner`, então o worker não está registrado — corrija a configuração
   do perfil e reinicie.
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

**Causa raiz.** O conjunto de perfis é lido uma vez no boot. Se você editou o
`appsettings.Production.json` depois de o serviço iniciar, a página vê o conjunto de perfis anterior à
edição.

**Correção.** Reinicie o serviço. Acompanhe o banner — o novo perfil LacunaSigner deve aparecer no painel
**Signing profiles**.

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
vermelho.

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

### Boot recusado nomeando uma identidade de instância que já está batendo

**Sintoma.** O host sai nomeando sua própria identidade derivada de instância, e diz que aquela identidade
já tem um heartbeat vivo.

**Diagnóstico.** Dois processos estão atendendo por um nome. A identidade é aquilo sobre o que a
recuperação, a assunção e toda superfície por instância são construídas, então não há modo degradado a
oferecer. As causas usuais, em ordem de probabilidade:

1. **Um deployment slot carregando a connection string de produção.** A troca não introduz isso — o
   primeiro boot do slot introduz. Slots não são suportados nesta topologia de forma alguma; veja
   [Alta disponibilidade](high-availability.md#atualizações-param-o-mundo).
2. Uma segunda implantação apontada para o mesmo banco de dados.
3. Dois hosts genuinamente apresentando o mesmo nome (fora do App Service, onde a identidade recai para o
   nome da máquina).

**Correção.** Se o detentor de fato se foi, a linha dele fica obsoleta sozinha — **esperar o
`Cluster:StaleAfterSeconds` passar é a correção suportada**, e não apagar linhas à mão. Caso contrário,
pare a implantação que não deveria estar ali.

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
nada mais vai parar isso.

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
4. **Inspecione o banco de dados.** `sqlite3 db/bulksigner.db` e consultas como
   `SELECT * FROM Jobs ORDER BY CreatedAt DESC LIMIT 20;` dão um quadro completo da atividade recente.

Se, depois de tudo isso, o sintoma continuar inexplicado, entre em contato com o suporte da Lacuna
Software com o banner de bootstrap, os trechos de log relevantes (a aplicação mascara segredos, mas
verifique antes de enviar), e os passos exatos de reprodução.

---

**Anterior:** [Retenção](retention.md). **Voltar para:** [visão geral](index.md).
