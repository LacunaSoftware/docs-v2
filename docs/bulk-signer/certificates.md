---
sidebar_label: "Certificados"
sidebar_position: 4
---

# Certificados

O Lacuna Bulk Signer assina com certificados X.509 expostos por uma de quatro origens. Esta página
explica como escolher uma origem, onde colocar o material do certificado, e como encontrar os
thumbprints SHA-1 que a configuração exige.

A configuração de certificado mostrada aqui vive ou sob o bloco global `Signing:Certificate`
(implantações de certificado único) **ou** dentro de cada entrada de `Signing:Profiles[].Certificate`
(implantações com múltiplos perfis — veja
[Configuração](configuration.md#signingprofiles--perfis-de-assinatura-por-pasta)). Toda regra abaixo se
aplica identicamente às duas formas; no modo de perfis, cada perfil carrega seu próprio certificado no
boot e configuração errada em qualquer perfil reprova a inicialização com um erro agregado.

## Escolhendo uma origem

| Origem | Use quando | Evite quando |
|--------|------------|--------------|
| `Pfx` | A chave privada é exportável e está armazenada como um arquivo `.pfx`/`.p12` em disco. | A política de aquisição proíbe chaves exportáveis (então, HSM/repositório). |
| `Pkcs11` | A chave vive em um HSM, smart card ou token USB com um driver PKCS#11 do fabricante. A política de auditoria exige que a chave nunca deixe o dispositivo. | Instalações em container onde o driver do fabricante não pode ser montado; alvos não Windows onde o fabricante só entrega driver para Windows. |
| `WindowsStore` | Alvos Windows onde o certificado foi importado antecipadamente para o repositório de certificados. | Alvos Linux ou Docker — o validador recusa esta origem em hosts não Windows. |
| `AzureKeyVault` | A chave não pode jamais tocar o host, mas um HSM *on premises* não é uma opção — o Azure guarda a chave e assina remotamente. Funciona em todos os alvos, Docker incluído. | Instalações isoladas da rede, ou quando acrescentar latência de rede por assinatura até o Azure for inaceitável. |

Como a identidade de assinatura é *selecionada* difere por origem, e a diferença importa sempre que um
token, repositório ou cofre abriga mais de uma identidade:

| Origem | Identidade selecionada por |
|--------|----------------------------|
| `Pfx` | Nada a selecionar — o arquivo abriga uma única identidade. |
| `Pkcs11`, `WindowsStore` | **Thumbprint SHA-1.** Casamento por subject nunca é usado, porque tokens e repositórios rotineiramente abrigam múltiplas identidades e uma regra de "primeiro que casar" tornaria a trilha de auditoria desonesta. |
| `AzureKeyVault` | O **nome da chave** no cofre, para a chave privada, mais um `.cer` para o certificado público. O par é conferido no boot. |

As duas origens que nomeiam um *arquivo* — `Pfx` e `AzureKeyVault` — podem ler esse arquivo do
[Azure Blob Storage](#lendo-o-arquivo-de-um-blob) em vez do disco local, que é o que as torna usáveis
em um host sem sistema de arquivos durável.

## ICP-Brasil e ADR-Básica

O Bulk Signer foi projetado para cenários compatíveis com a ICP-Brasil. A política de assinatura padrão
aplicada pelos assinadores é a **ADR-Básica** (Assinatura Digital de Referência — Básica), a política
de referência do catálogo de políticas do ITI. A ADR-Básica cobre CAdES (`.p7m`), PAdES (PDF) e XAdES
(XML) e é o padrão correto para notas fiscais, contratos e outros documentos transacionais.

| Conceito | Onde ler mais |
|----------|---------------|
| ITI (Instituto Nacional de Tecnologia da Informação) — a autoridade das políticas | [gov.br/iti](https://www.gov.br/iti/pt-br) |
| Lista de ACs (autoridades certificadoras) autorizadas pela ICP-Brasil | [Entidades ICP-Brasil](https://www.gov.br/iti/pt-br/assuntos/icp-brasil/entidades-icp-brasil) |
| Políticas de assinatura (ADR-Básica, ADR-T, ADR-V, ADR-C, ADR-A) | Consulte as versões atuais no site de políticas do ITI antes de qualquer implantação que precise de política diferente da padrão. |
| Documentação do Lacuna PKI SDK | [docs.lacunasoftware.com](https://docs.lacunasoftware.com/pt-br/articles/pki-sdk/index.html) |

O Bulk Signer não empacota, recomenda nem endossa nenhuma AC comercial específica. Você adquire
certificados ICP-Brasil de qualquer AC/AR (autoridade certificadora / de registro) da lista oficial do
ITI, de acordo com sua própria política de aquisição. Uma vez emitido, o certificado mais sua chave
privada chega como um arquivo PFX (para certificados protegidos por software) ou pré-instalado em um
HSM ou token (para os protegidos por hardware) — momento a partir do qual a matriz de configuração
abaixo se aplica.

## Origem = Pfx

```json
"Signing": {
  "Certificate": {
    "Source": "Pfx",
    "Pfx": {
      "Path": "/etc/bulksigner/signing.pfx",
      "Password": ""
    }
  }
}
```

(Prefira a variável de ambiente `Signing__Certificate__Pfx__Password` a um valor no arquivo de
configuração.)

### Onde colocar o arquivo

Coloque o arquivo `.pfx` em um local:

- Legível pela conta de serviço: `bulksigner` no Linux, `NT SERVICE\LacunaBulkSigner` no Windows, UID
  1654 no container Docker.
- Não legível por outros usuários do host. No Linux:
  `chown bulksigner:bulksigner signing.pfx && chmod 0640 signing.pfx`. No Windows, a ACL que o script
  de instalação aplica em `ProgramData` é suficiente.
- Fora do controle de versão.

### Tratamento da senha

A senha pode ficar em `Signing:Certificate:Pfx:Password` no `appsettings.Production.json` (que está no
gitignore) ou — preferencialmente — na variável de ambiente
`Signing__Certificate__Pfx__Password`. String vazia é permitida para fixtures de teste sem senha;
arquivos PFX de produção devem sempre ter senha.

### Verificando se o arquivo é carregável

Antes de apontar o Bulk Signer para ele, confirme que o arquivo é decifrado com a senha que você
pretende configurar:

```bash
# Linux / Mac
openssl pkcs12 -in signing.pfx -nokeys -info -passin pass:<senha>
```

```powershell
# Windows — carregue em um objeto de certificado transitório
$pwd = ConvertTo-SecureString -String '<senha>' -AsPlainText -Force
$cert = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new("signing.pfx", $pwd)
$cert.Thumbprint
```

O comando do Windows imprime o thumbprint SHA-1 como efeito colateral — você vai precisar dele para a
origem WindowsStore se importar o mesmo certificado depois, mas a origem Pfx **não** exige um
thumbprint (o arquivo abriga uma única identidade).

## Considerações de concorrência por origem

`Pipeline:MaxConcurrency > 1` permite ao worker processar vários jobs de assinatura em paralelo. Se
isso é *seguro* depende do modelo de segurança de threads da origem do certificado — cada tarefa de
assinatura criada compartilha o certificado carregado. Escolher a combinação errada pode travar
silenciosamente ou retornar erros específicos do fabricante.

| Origem | Segura para threads sob assinatura concorrente? | `MaxConcurrency` recomendado |
|--------|-----------------------------------------------|------------------------------|
| **Pfx** | Sim (a chave é mantida em memória). | Até o limite de 32; o ponto ideal típico é 4–8 em implantações com PFX. |
| **Pkcs11** | **Geralmente não.** A maioria dos tokens de consumo expõe uma única sessão por login; chamadas de assinatura concorrentes travam ou falham. HSMs de servidor frequentemente suportam múltiplas sessões, mas a quantidade é específica do fabricante. | `1`, a menos que a documentação do fabricante declare explicitamente suporte a sessões concorrentes e você tenha medido. |
| **WindowsStore** | Depende do fabricante. CSPs de software são tipicamente seguros para threads; CSPs baseados em smart card variam. | `1` por padrão; aumente somente após verificar que o provider se comporta sob chamadas concorrentes. |
| **AzureKeyVault** | Sim. Cada assinatura é uma chamada HTTPS independente e sem estado — não há sessão pela qual disputar. | Até o limite de 32. Fique atento a throttling HTTP 429 do Azure, e não a travamentos. |

O serviço avisa na inicialização quando `MaxConcurrency > 1` é configurado ao lado de
`Source = Pkcs11` ou `Source = WindowsStore`. O `AzureKeyVault` deliberadamente **não** é alvo de
aviso, pelo motivo na tabela acima:

```
[WARN] Pipeline:MaxConcurrency = 4 with Signing:Certificate:Source = Pkcs11 — verify your
       token / CSP allows concurrent sessions or set MaxConcurrency = 1.
```

Se você ignorar o aviso e o token não suportar sessões concorrentes, o sintoma será jobs em andamento
travando indefinidamente ou falhando com o erro de estado de sessão do fabricante. Veja
[Diagnóstico de problemas](troubleshooting.md) para a receita de diagnóstico.

## Origem = Pkcs11

```json
"Signing": {
  "Certificate": {
    "Source": "Pkcs11",
    "Pkcs11": {
      "ModulePath": "/usr/lib/softhsm/libsofthsm2.so",
      "Thumbprint": "0123456789abcdef0123456789abcdef01234567",
      "PinEnvVar": "BULK_SIGNER_PKCS11_PIN"
    }
  }
}
```

### Caminho do módulo

Caminho absoluto para o driver PKCS#11 do fabricante. Exemplos (fornecidos pelo operador):

| Fabricante / dispositivo | Linux | Windows |
|--------------------------|-------|---------|
| SoftHSM v2 (testes) | `/usr/lib/softhsm/libsofthsm2.so` | n/a |
| SafeNet eToken / Authentication Client | `/usr/lib/x86_64-linux-gnu/pkcs11/libeToken.so` | `C:\Windows\System32\eTPKCS11.dll` |
| Thales SafeNet HSM (PCI) | (caminho fornecido pelo fabricante) | (caminho fornecido pelo fabricante) |
| Smart card Gemalto / Thales IDPrime | (caminho fornecido pelo fabricante) | `C:\Windows\System32\IDPrimePKCS11.dll` |
| Yubico YubiHSM 2 | `/usr/local/lib/pkcs11/yubihsm_pkcs11.so` | (caminho fornecido pelo fabricante) |

O Bulk Signer não entrega drivers de fabricantes. Instale o driver no host antes de apontar a
configuração para ele. Em alvos Docker, monte o `.so` do fabricante no container via `volumes:` —
exemplos comentados estão em `deploy/docker/docker-compose.yml`.

### Encontrando o thumbprint

O thumbprint configurado precisa corresponder a um certificado visível ao driver configurado. Use o
`pkcs11-tool` (do pacote `opensc` — presente na imagem Docker):

```bash
# Linux: lista os certificados no token, com seus thumbprints SHA-1
pkcs11-tool --module /usr/lib/softhsm/libsofthsm2.so --list-objects --type cert --login --pin <pin>
```

Para cada certificado listado, calcule o thumbprint SHA-1 exportando o DER e aplicando o hash:

```bash
pkcs11-tool --module /usr/lib/softhsm/libsofthsm2.so --read-object --type cert --id <id> --login --pin <pin> --output-file cert.der
openssl dgst -sha1 cert.der
# → SHA1(cert.der)= 0123456789abcdef0123456789abcdef01234567
```

Copie esse hexadecimal minúsculo (sem espaços, sem dois-pontos) para
`Signing:Certificate:Pkcs11:Thumbprint`.

### Tratamento do PIN

O PIN **nunca** fica em um arquivo de configuração — o validador se recusa a subir se uma chave `Pin`
aparecer sob `Signing:Certificate:Pkcs11`. Defina a variável de ambiente nomeada por `PinEnvVar`
(padrão `BULK_SIGNER_PKCS11_PIN`). Por alvo:

- **Linux:** `BULK_SIGNER_PKCS11_PIN=<pin>` em `/etc/bulksigner/bulksigner.env`.
- **Windows:** `[Environment]::SetEnvironmentVariable("BULK_SIGNER_PKCS11_PIN", "<pin>", "Machine")`.
- **Docker:** `BULK_SIGNER_PKCS11_PIN=<pin>` em `deploy/docker/.env`.

Veja [Segurança](security.md) para a história mais ampla de segredos.

### Exemplo de montagem no Docker

```yaml
# deploy/docker/docker-compose.yml
services:
  bulksigner:
    # ...
    volumes:
      - ./config/appsettings.Production.json:/app/appsettings.Production.json:ro
      - ./data:/var/lib/bulksigner
      - ./logs:/var/log/bulksigner
      # Driver PKCS#11 do fabricante (descomente e ajuste conforme seu HSM):
      - /usr/lib/softhsm:/usr/lib/softhsm:ro
      # Ou, para um SafeNet eToken no host:
      # - /usr/lib/x86_64-linux-gnu/pkcs11:/usr/lib/x86_64-linux-gnu/pkcs11:ro
      # Tokens USB também precisam de acesso ao PCSC:
      - /var/run/pcscd/pcscd.comm:/var/run/pcscd/pcscd.comm
    environment:
      - BULK_SIGNER_PKCS11_PIN=${BULK_SIGNER_PKCS11_PIN}
```

A imagem é Debian-slim e traz `libpcsclite1` + `opensc`, de modo que o ferramental de smart card
funciona de imediato. A maioria das bibliotecas `.so` de fabricantes não é compatível com musl, razão
pela qual a imagem não é baseada em Alpine.

## Origem = WindowsStore

```json
"Signing": {
  "Certificate": {
    "Source": "WindowsStore",
    "WindowsStore": {
      "StoreLocation": "LocalMachine",
      "StoreName": "My",
      "Thumbprint": "0123456789ABCDEF0123456789ABCDEF01234567"
    }
  }
}
```

Somente Windows. O validador lança erro em hosts não Windows na inicialização.

### StoreLocation: CurrentUser vs LocalMachine

O serviço do Windows roda sob a conta virtual `NT SERVICE\LacunaBulkSigner`. Aquela conta tem seu
próprio repositório `CurrentUser` — ele **não** é o repositório `CurrentUser` do operador. A regra mais
simples:

| Você importou o certificado como… | Use |
|-----------------------------------|-----|
| Máquina Local (para toda a máquina, via `certlm.msc` ou `Import-Certificate -CertStoreLocation Cert:\LocalMachine\My`) | `LocalMachine` + conceda à conta virtual acesso à chave privada |
| Seu próprio usuário (via `certmgr.msc` ou `Import-PfxCertificate -CertStoreLocation Cert:\CurrentUser\My`) | Mova-o para `LocalMachine` primeiro — o serviço não o enxergará sob o seu `CurrentUser` |

Para conceder à conta virtual acesso a uma chave privada em `LocalMachine\My`, abra o `certlm.msc`,
clique com o botão direito no certificado, **Todas as Tarefas → Gerenciar Chaves Privadas…**,
acrescente `NT SERVICE\LacunaBulkSigner` e conceda **Leitura**.

### Encontrando o thumbprint

No PowerShell, no host do serviço:

```powershell
Get-ChildItem -Path Cert:\LocalMachine\My | Format-Table Thumbprint, Subject, NotAfter
```

A coluna de thumbprint é o hexadecimal SHA-1. Remova quaisquer espaços antes de copiar para a
configuração; maiúsculas e minúsculas não importam (o validador compara o hexadecimal sem diferenciar).

## Origem = AzureKeyVault

```json
"Signing": {
  "Certificate": {
    "Source": "AzureKeyVault",
    "AzureKeyVault": {
      "Endpoint": "https://my-vault.vault.azure.net/",
      "AppId": "8f2c1b3e-1111-2222-3333-444455556666",
      "AppSecret": "",
      "KeyName": "bulk-signer-signing-key",
      "CerPath": "/etc/bulksigner/certificates/signer.cer"
    }
  }
}
```

(Prefira a variável de ambiente `Signing__Certificate__AzureKeyVault__AppSecret` a um valor no arquivo
de configuração.)

A chave privada é um objeto **key** do Key Vault e nunca deixa o Azure: cada assinatura envia um digest
ao cofre e recebe a assinatura de volta. O **certificado público** correspondente é um arquivo `.cer`
local — coloque-o onde você teria colocado o `.pfx`. Aquele arquivo contém apenas material público,
então não precisa de proteção além de integridade.

Este é o sabor *somente-chave*. Objetos **certificate** hospedados no cofre deliberadamente não são
suportados: um certificado de cofre ainda teria de ser baixado para o host para ser usado, o que
derruba a razão de escolher o Key Vault em primeiro lugar.

### Configuração no Azure

Se você está partindo de um PFX existente, o script `Import-PfxToKeyVault.ps1` na página
[Exemplos](samples.md#powershell-7--import-pfxtokeyvaultps1) executa cada passo abaixo em uma única
passada — importa a chave de forma não exportável, grava o `.cer`, registra a aplicação, concede a ela
permissão de assinatura, verifica o par e imprime o bloco de configuração para colar.

Os passos manuais seguem, para os casos que o script não cobre (uma chave gerada dentro do cofre, ou um
certificado emitido por uma AC a partir de uma CSR).

1. **Crie ou importe a chave.** No key vault de destino, crie uma chave (RSA 2048+ ou EC) — ou importe
   uma. Anote seu **nome**; ele vira o `KeyName`. Precisa ser um objeto key, não um objeto certificate.
2. **Registre uma aplicação.** No Microsoft Entra ID, registre uma aplicação e anote seu **ID de
   aplicativo (client)** (`AppId`). Em **Certificados e segredos**, crie um client secret e anote o
   valor (`AppSecret`) — o Azure o exibe apenas uma vez.
3. **Conceda acesso ao cofre.** Dê àquele registro de aplicativo permissão para *obter* a chave e para
   *assinar* com ela. Em um cofre com RBAC, a role interna **Key Vault Crypto User** cobre as duas; em
   um cofre com políticas de acesso, conceda a permissão de chave **Get** mais a operação criptográfica
   **Sign**. Nada mais é necessário — o Bulk Signer nunca cria, embrulha nem exporta chaves.
4. **Obtenha o certificado.** Gere uma CSR contra a chave do cofre, faça sua AC emitir o certificado, e
   salve o certificado emitido como um `.cer` (DER ou PEM) em `CerPath`.

### O certificado e a chave precisam corresponder

No boot, o Bulk Signer compara a chave pública do `.cer` com a chave pública do cofre e se recusa a
iniciar se elas diferirem:

```
Certificate '/etc/bulksigner/certificates/signer.cer' does not match Azure Key Vault key
'bulk-signer-signing-key' — their public keys differ. Point CerPath at the certificate issued
for this key, or correct KeyName.
```

Este é o modo de falha que o desenho de dois artefatos convida: renovar um certificado contra uma
*nova* chave de cofre enquanto o `KeyName` ainda aponta para a antiga, ou vice-versa. Sem a
verificação, o serviço subiria alegremente e emitiria assinaturas que verificador nenhum consegue
validar. Com ela, a divergência é uma recusa de inicialização que nomeia as duas metades do par.

### Verificando o par antes de implantar

Para confirmar que um `.cer` e uma chave de cofre pertencem um ao outro sem iniciar o serviço, compare
suas chaves públicas com a CLI do Azure e o OpenSSL:

```bash
# Chave pública como registrada no certificado
openssl x509 -in signer.cer -noout -pubkey

# Chave pública como mantida pelo cofre
az keyvault key download --vault-name my-vault --name bulk-signer-signing-key --encoding PEM --file -
```

Os dois blocos PEM precisam ser idênticos byte a byte.

### Tratamento da credencial

O `AppSecret` é um client secret do Entra ID. Diferentemente do PIN do PKCS#11, ele *pode* viver em um
arquivo de configuração, mas a forma por variável de ambiente é recomendada:

```bash
export Signing__Certificate__AzureKeyVault__AppSecret='…'
```

Ele é registrado nas duas camadas de mascaramento de log, de modo que é removido do log durável quer
apareça como propriedade estruturada, quer interpolado em uma mensagem de exceção. Rotacione-o no Azure
e reinicie o serviço. Veja [Segurança](security.md#credenciais-do-azure-key-vault) para a postura
completa.

### Rede e throttling

Cada assinatura é uma chamada HTTPS de saída, então o host precisa de um caminho confiável para
`*.vault.azure.net` (e para `login.microsoftonline.com`, para a aquisição de token). A latência do
cofre é somada à etapa de assinatura de cada job. Uma indisponibilidade do cofre **paralisa** o
pipeline em vez de corrompê-lo — os jobs afetados falham com o erro do Azure e podem ser repetidos
quando o acesso for restabelecido.

A concorrência é segura (veja a tabela acima), mas um `MaxConcurrency` alto e sustentado pode atrair
respostas de throttling HTTP 429 do Azure. Elas aparecem como jobs falhados carregando o erro do Azure,
não como travamentos.

## Lendo o arquivo de um blob

Um host **sem disco local durável** — um container, um App Service, um pod do AKS — não tem onde
guardar um `.pfx` ou um `.cer`. Embuti-lo na imagem funciona, mas transforma a renovação do certificado
em uma reconstrução de imagem e coloca material com formato de certificado no seu registry. Então as
duas origens que nomeiam um arquivo podem, em vez disso, nomear um blob no Azure Blob Storage:

```json
"Signing": {
  "Certificate": {
    "Source": "Pfx",
    "Pfx": {
      "Password": "",
      "Blob": {
        "Url": "https://contoso.blob.core.windows.net/certificates/signer.pfx",
        "Credential": "ManagedIdentity"
      }
    }
  }
}
```

O `Path` é omitido — **exatamente um entre `Path` e `Blob`, nunca os dois, nunca nenhum.** O mesmo
bloco funciona sob `AzureKeyVault` (abrigando o `.cer` em vez de `CerPath`), e sob qualquer entrada de
`Signing:Profiles[].Certificate`.

| Chave | Obrigatória | Observações |
|-------|-------------|-------------|
| `Url` | sim | A URL completa do blob — exatamente o que o botão **Copiar URL** do portal lhe dá. Uma URL que carregue **query string é recusada no boot**: é assim que uma shared-access signature chega, e SAS não é uma credencial aceita. Por causa dessa regra a URL nunca é secreta, então é impressa por inteiro no banner de inicialização. |
| `Credential` | sim | `ManagedIdentity`, `ServicePrincipal` ou `AccountKey`. **Nunca assumida por padrão** — recorrer à identidade Azure do próprio host sem que ninguém peça autenticaria como alguém que ninguém nomeou. |
| `TenantId`, `AppId`, `AppSecret` | somente `ServicePrincipal` | O `TenantId` é obrigatório mesmo quando o `AppId` nomeia a mesma aplicação do Entra que o bloco `AzureKeyVault` ao lado: aquele bloco não tem chave de tenant, e **nada aqui é herdado**. |
| `AccountKey` | somente `AccountKey` | Alvo de aviso na inicialização. Veja abaixo. |

Como você fornece o host, um **endpoint de nuvem soberana funciona sem configuração extra** — escreva o
endpoint que você de fato usa.

### O que a credencial precisa

Para `ManagedIdentity` e `ServicePrincipal`, conceda à identidade **Storage Blob Data Reader** no
container (ou na conta). Acesso de leitura a um blob é tudo de que isso jamais precisa — nada no Bulk
Signer escreve, lista, move ou faz lease de um blob. O `ManagedIdentity` é **somente atribuído pelo
sistema**; um host fora do Azure não tem endpoint de identidade nenhum.

### O `AccountKey` e o que ele custa

Uma chave de conta concede **acesso total ao plano de dados da conta de armazenamento inteira** e não
pode ser restringida nem expirada. Ela é aceita mesmo assim, porque uma implantação `Pfx` *on premises*
pode não ter caminho algum até um tenant do Microsoft Entra — e, diferentemente do `AzureKeyVault`, que
sequer consegue funcionar sem alcançar o Entra, aquele host não tem outra opção.

O aviso de inicialização, portanto, diz coisas diferentes conforme o que o blob abriga:

| Blob sob | O que ele abriga | O que uma `AccountKey` vazada entrega |
|----------|------------------|----------------------------------------|
| `AzureKeyVault:Blob` | o `.cer` — material público | um certificado público; a chave privada permanece no cofre |
| `Pfx:Blob` | o arquivo PKCS#12 | **a chave de assinatura** |

:::danger
Se você consegue alcançar um tenant, use `ManagedIdentity` ou `ServicePrincipal` — especialmente para
um PFX. O `Pfx:Blob` é a **única** configuração neste produto sob a qual material de chave privada
trafega por uma rede; `Pkcs11` e `AzureKeyVault` existem ambos para impedir isso, e nenhum é
enfraquecido pela existência dela.
:::

### O que isso não muda

- **O arquivo é lido uma vez, no boot.** Um blob renovado precisa de um restart, exatamente como um
  arquivo local renovado. Nada o reconsulta.
- **Um blob inalcançável impede o host de iniciar**, deliberadamente: um perfil sem material de
  assinatura não consegue assinar de forma alguma, então não há estado degradado útil. Isso é o oposto
  de um compartilhamento de trabalho ou de uma base operacional inalcançáveis, que permitem ao host
  iniciar e se reportarem degradados.
- **A senha do PFX não é buscável de lugar nenhum.** Ela continua sendo um valor de configuração com
  override por ambiente. Uma senha recuperada da mesma base que o arquivo que ela abre não é um segundo
  fator.
- **Nada sobre a assinatura muda de lugar.** Com `Pfx`, a chave continua sendo carregada na memória
  deste host e a assinatura continua local; com `AzureKeyVault`, a chave continua nunca deixando o
  cofre. Colocar o arquivo em um blob é uma afirmação sobre onde bytes são armazenados, e nada além.

O banner de inicialização nomeia o blob na linha do perfil, de modo que você pode confirmar contra qual
objeto este processo de fato pareou, em vez de qual objeto o arquivo de configuração nomeia agora:

```
signer  cades · cert=AzureKeyVault · blob=contoso/certificates/signer.cer · verify=on · …
```

## Trocando a origem a quente

Mudar `Signing:Certificate:Source` (e a subárvore correspondente) exige um restart — o certificado é
carregado uma vez no boot. Procedimento:

1. Prepare a nova origem (importe o certificado para o repositório do Windows, copie o novo PFX,
   instale o driver PKCS#11, provisione a chave do cofre e seu `.cer`).
2. Edite o `appsettings.Production.json` para apontar para a nova origem e defina o novo thumbprint /
   caminho / nome de chave.
3. Se a nova origem precisa de uma nova variável de ambiente (PIN do PKCS#11, client secret do Key
   Vault, senha de criptografia), defina-a antes do restart.
4. Reinicie o serviço. O banner de bootstrap imprime `cert source = …` — verifique se corresponde à sua
   intenção.
5. Envie um job de teste pela fila (solte um arquivo em `input/`, ou faça POST em `/api/files`).
   Inspecione o histórico do job resultante para confirmar que a nova identidade é a signatária.

## Diagnóstico de problemas

| Sintoma | Diagnóstico |
|---------|-------------|
| Boot falha com "Signing:PkiSdkLicense is required" | Defina `Signing__PkiSdkLicense` (ambiente) ou `Signing:PkiSdkLicense` (configuração). Veja [Segurança](security.md). |
| Boot falha com "Pkcs11 PIN env var … is empty" | A variável de ambiente nomeada por `PinEnvVar` não está definida. Defina-a antes de reiniciar. |
| Boot falha com "WindowsStore source is not supported on this OS" | Você configurou `Source = WindowsStore` no Linux. Troque a origem. |
| Boot falha com "does not match Azure Key Vault key … their public keys differ" | `CerPath` e `KeyName` se referem a pares de chaves diferentes. Verifique-os com a receita de OpenSSL / CLI do Azure acima. |
| Boot falha com "Endpoint must be an absolute https:// URL" | O `Endpoint` é um nome DNS puro do cofre ou usa `http://`. Use a forma completa, por exemplo `https://my-vault.vault.azure.net/`. |
| Boot falha dizendo que tanto um caminho quanto um blob estão configurados | `Path`/`CerPath` e `Blob` são mutuamente exclusivos. Remova um. A mesma recusa dispara quando nenhum dos dois está definido. |
| Boot falha com uma URL de blob rejeitada por carregar query string | A URL é uma shared-access signature. SAS não é uma credencial aceita — use `Credential` com `ManagedIdentity`, `ServicePrincipal` ou `AccountKey` e uma URL de blob pura. |
| Boot falha ao ler o blob de material de assinatura | Verifique se a identidade detém **Storage Blob Data Reader** no container, e se o blob existe na URL que aparece no banner. Um blob inalcançável é fatal por design. |
| A assinatura falha com um `403` / `Forbidden` do Azure | O registro de aplicativo não tem a permissão de **sign** na chave. Conceda **Key Vault Crypto User** (RBAC) ou a operação **Sign** (política de acesso). |
| A assinatura falha com um `429` do Azure | Throttling do cofre sob carga. Reduza o `Pipeline:MaxConcurrency` ou solicite um limite maior para o cofre. |
| A assinatura falha imediatamente com "Certificate not found by thumbprint" | O thumbprint não corresponde a nenhum certificado na origem configurada. Reconfira com os comandos de descoberta acima. |
| A assinatura falha com erro de "module load failed" / "C_Initialize" do PKCS#11 | O `.so`/`.dll` do driver não pôde ser carregado — biblioteca do fabricante ausente no host ou não montada no container. |
| A assinatura falha com "Access is denied" ao ler uma chave privada do Windows | A conta virtual do serviço não tem acesso à chave — conceda-o via `certlm.msc → Gerenciar Chaves Privadas`. |
| PDF assinado rejeitado por um verificador a jusante | Confira se a versão da política está atual — os arquivos de política da ADR-Básica são versionados pelo ITI. Verificadores a jusante precisam aceitar a versão que o Bulk Signer emite. |

Veja [Diagnóstico de problemas](troubleshooting.md) para o catálogo mais amplo de modos de falha.

---

**A seguir:** [Segurança](security.md) — tratamento de segredos e o modelo de ameaças.
**Anterior:** [Configuração](configuration.md).
