---
sidebar_label: "Certificados"
sidebar_position: 4
---

# Certificados

O Lacuna Bulk Signer assina com certificados X.509 expostos por uma de quatro origens. Esta página
explica como escolher uma origem, onde colocar o material do certificado, e como encontrar os
thumbprints SHA-1 que a configuração exige.

Todo perfil de assinatura carrega o próprio certificado. Os perfis vivem na base operacional e são
criados e editados pelas páginas de perfis de assinatura do dashboard, que pedem exatamente os campos
mostrados abaixo. Os blocos de configuração desta página — o bloco global `Signing:Certificate`
(implantações de certificado único) **ou** cada entrada de `Signing:Profiles[].Certificate`
(implantações com múltiplos perfis — veja
[Configuração](configuration.md#signingprofiles--perfis-de-assinatura-por-pasta)) — são a **semente
única** que um primeiro boot importa para a base. Toda regra abaixo se aplica identicamente à semente e
à página do perfil.

Cada perfil abre seu certificado uma vez, no boot, de modo que um erro aparece na inicialização, e não no
primeiro arquivo correspondente. **Um certificado que não abre deixa aquele perfil *degradado* e o host
rodando**: o motivo aparece no banner de inicialização, no log durável, na página do perfil e como sua
própria linha de readiness `signing-profile:<nome>`; todos os outros perfis continuam assinando, e jobs
roteados para o perfil quebrado falham com `profile.degraded`. Corrigir o certificado exige uma
reinicialização, porque o handle é aberto uma vez e nunca é recarregado.

:::warning Mudou na 2.1.0 — um certificado quebrado não impede mais o boot
Versões anteriores se recusavam a iniciar quando o certificado de qualquer perfil não abria. Agora que os
perfis são editados pelo dashboard, recusar o boot tiraria do ar a página em que a correção é feita —
então o perfil é reportado como degradado e o resto da implantação continua assinando.
:::

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

Um PKCS#12 tem um **terceiro** lugar onde pode estar: [enviado pelo dashboard](#enviando-o-arquivo-pelo-dashboard)
e guardado na base operacional, para o operador que não alcança o sistema de arquivos do host de jeito
nenhum. Os três locais são mutuamente exclusivos e recusados em qualquer combinação — um caminho, um blob
e um envio nunca são combinados nem resolvidos por precedência, porque *qual certificado assinou* não
pode depender de qual local por acaso estava legível.

Um tipo de certificado deliberadamente **não** está neste mapa: aquele com que um **aprovador** coassina
um arquivo de pagamento, que fica com o aprovador e nunca é configurado no host. Veja
[O certificado do aprovador](#o-certificado-do-aprovador).

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

### Certificados de teste e o conjunto de confiança

A Lacuna publica uma **PKI de teste** para desenvolvimento e homologação sem um certificado real: uma
raiz (*Lacuna Root Test v3*), uma AC (*Lacuna CA Test v7*) e um pacote de certificados ICP-Brasil
simulados, dos quais *Alan Mathison Turing* e *Pierre de Fermat* são os de costume, com a senha `1234`.
Eles estão descritos nos
[exemplos do PKI SDK](https://github.com/LacunaSoftware/PkiSdkSamples/blob/master/TestCertificates.md)
da Lacuna. Eles carregam um CPF e validam como os de verdade, **sob uma raiz que não é uma autoridade** —
que é justamente o propósito deles.

Se um host os aceita é decidido pelo seu **conjunto de confiança**: as raízes sob as quais toda
assinatura é feita, contra as quais ela é conferida depois, e às quais o certificado de um aprovador é
submetido antes do pedido de PIN. Há um por host, o mesmo para todos os perfis, e o banner de
inicialização o nomeia na sua linha `trust set`:

| `Signing:TrustLacunaTestRoot` | Conjunto de confiança | Turing / Fermat |
|-------------------------------|-----------------------|-----------------|
| não definida (o padrão) | `production` — somente as raízes ICP-Brasil, como as políticas ICP-Brasil do SDK as trazem; nada do sistema operacional | **Recusados.** Um job assinado com um deles falha; um aprovador que apresente um é recusado como `approval.certificate-invalid`. |
| `true` | `production + Lacuna test root` — ICP-Brasil, o conjunto de confiança do Windows do SDK (o repositório da máquina, no Windows) e a raiz de teste | Aceitos |

A chave existe para um **host de homologação que roda a imagem publicada** e quer os certificados de
teste em vez de um e-CPF real por aprovador. Ela é **recusada no boot sob o nome de ambiente
`Production`**: defina `ASPNETCORE_ENVIRONMENT=Staging` (ou qualquer outro nome) naquele host, ou o boot
falha nomeando a chave e o remédio. Um host de produção que herdou a configuração, portanto, se recusa a
iniciar em vez de confiar em uma raiz que qualquer um pode baixar. Um host com a chave definida também
registra um aviso a cada boot. Veja [Configuração](configuration.md#signing) para a chave em si.

:::note Novo na 2.3.0
Antes da 2.3.0, um build de release não tinha como confiar na raiz de teste da Lacuna.
:::

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

Esses são os locais da **semente**. Uma vez importada — ou quando o perfil é criado pelo dashboard —, a
senha é armazenada com o perfil, criptografada sob a `Signing:ProfileSecretsKey`, um segredo do host
mantido fora do banco de dados; a página do perfil a mostra apenas como *configurada* ou *não
configurada*. Uma implantação cujos perfis carregam qualquer segredo (uma senha de PKCS#12, um segredo de
aplicação do Azure Key Vault, uma credencial de blob, um arquivo enviado) precisa dessa chave definida
antes do primeiro boot que os importa. Veja
[Segurança](security.md#segredos-das-origens-de-certificado).

### Verificando se o arquivo é carregável

**Exporte com o envelope clássico.** A biblioteca de assinatura abre o envelope PKCS#12 clássico
(PBE-SHA1-3DES e RC2), e não PBES2 com AES. PBES2 é o que o `openssl pkcs12 -export` grava **por
padrão** no OpenSSL 3, e o que uma exportação do Windows grava quando se escolhe **AES256-SHA256** em vez
do padrão TripleDES-SHA1. Um arquivo exportado assim sobe como um perfil degradado cujo motivo nomeia o
PBES2 e a correção. No OpenSSL, exporte com `-legacy` desde o início; no Windows, mantenha o assistente de
exportação ou o `Export-PfxCertificate` em TripleDES-SHA1. O OpenSSL 1.x sempre gravou o envelope
clássico; um arquivo recusado por PBES2 pode ser reexportado pelo OpenSSL:

```bash
openssl pkcs12 -in moderno.pfx -nodes -passin pass:<senha> -out tmp.pem
openssl pkcs12 -export -legacy -in tmp.pem -passout pass:<senha> -out signing.pfx
shred -u tmp.pem   # a chave privada fica em claro no tmp.pem
```

Antes de apontar o Bulk Signer para ele, confirme que o arquivo é decifrado com a senha que você
pretende configurar. No OpenSSL 3, a flag `-legacy` é necessária para *ler* um arquivo de envelope
clássico, e não só para gravá-lo:

```bash
# Linux / Mac
openssl pkcs12 -legacy -in signing.pfx -nokeys -info -passin pass:<senha>
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

Quando um PKCS#12 não abre, o motivo do perfil degradado diz por quê com as palavras do próprio produto,
mantendo a frase da biblioteca de assinatura logo atrás:

| O motivo começa com | Causa e correção |
|---------------------|------------------|
| *PFX … did not open with the PKCS#12 password given* | A senha no perfil está errada — ou o arquivo está danificado, o que um PKCS#12 não consegue distinguir de uma senha errada. Confira a senha; se estiver certa, forneça o arquivo de novo. A senha em si nunca é citada. |
| *PFX … is encrypted with PBES2, which the signing library does not open* | O envelope moderno. Reexporte com o clássico, como acima. |
| *Certificate … is empty (0 bytes)* | Um arquivo de zero bytes no caminho, no blob ou no envio. Forneça o arquivo de novo. |

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

No boot, o Bulk Signer compara a chave pública do `.cer` com a chave pública do cofre e, se elas
diferirem, se recusa a usar o par — o perfil sobe degradado com este motivo:

```
Certificate '/etc/bulksigner/certificates/signer.cer' does not match Azure Key Vault key
'bulk-signer-signing-key' — their public keys differ. Point CerPath at the certificate issued
for this key, or correct KeyName.
```

Este é o modo de falha que o desenho de dois artefatos convida: renovar um certificado contra uma
*nova* chave de cofre enquanto o `KeyName` ainda aponta para a antiga, ou vice-versa. Sem a
verificação, o serviço subiria alegremente e emitiria assinaturas que verificador nenhum consegue
validar. Com ela, a divergência é um perfil degradado cujo motivo nomeia as duas metades do par.

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
- **Um blob inalcançável deixa aquele perfil degradado e o host rodando** — como qualquer outro
  certificado que não abre: reportado no banner, no log durável e como uma linha de readiness, com jobs
  roteados para ele falhando com `profile.degraded` enquanto todos os outros perfis continuam assinando.
  O que **continua** fatal no boot é um bloco `Blob` malformado *declarado na configuração* (a semente),
  como uma URL com query string ou sem `Credential`, porque isso é um erro no arquivo de configuração, e
  não em um perfil armazenado.
- **A senha do PFX não é buscável de lugar nenhum.** Ela continua sendo um valor de configuração com
  override por ambiente. Uma senha recuperada da mesma base que o arquivo que ela abre não é um segundo
  fator.
- **Nada sobre a assinatura muda de lugar.** Com `Pfx`, a chave continua sendo carregada na memória
  deste host e a assinatura continua local; com `AzureKeyVault`, a chave continua nunca deixando o
  cofre. Colocar o arquivo em um blob é uma afirmação sobre onde bytes são armazenados, e nada além.

:::warning Mudou na 2.1.0 — um blob inalcançável não impede mais o boot
Um blob inalcançável impedia o host de iniciar. Desde que os perfis passaram para a base operacional, um
perfil que existe e não consegue assinar é um estado comum, e recusar o boot tiraria do ar a página em
que a correção é feita.
:::

O banner de inicialização nomeia o blob na linha do perfil, de modo que você pode confirmar contra qual
objeto este processo de fato pareou, em vez de qual objeto o arquivo de configuração nomeia agora:

```
signer  cades · cert=AzureKeyVault · blob=contoso/certificates/signer.cer · verify=on · …
```

## Enviando o arquivo pelo dashboard

Um caminho e um blob pressupõem que você consegue *colocar um arquivo em algum lugar que o host vai
ler*. O operador responsável pela assinatura de um departamento frequentemente não consegue: a árvore de
binários é somente leitura, a imagem é construída por outra equipe, ou o host é uma instância do App
Service sem disco durável. Para esse caso, um PKCS#12 pode ser entregue ao produto **no navegador** —
**Novo perfil** na página de perfis de assinatura do dashboard, `Pfx` como origem, e então **Enviar
agora** como local — e os bytes são armazenados na base operacional, e não no sistema de arquivos do
host.

- **Somente `Pfx`.** Um token e o repositório de certificados do host guardam uma chave que nunca foi um
  arquivo, então não há nada a enviar; e o arquivo da origem `AzureKeyVault` é o `.cer` *público*, cuja
  metade privada fica no cofre.
- **A base passa a ser a fronteira de custódia, e esse é o custo.** Os bytes são criptografados sob a
  `Signing:ProfileSecretsKey` antes de serem gravados, e essa chave é mantida **fora** do banco de dados
  — que é todo o desenho, porque o que ela protege está *dentro* do banco. Depois que uma chave privada é
  enviada, um arquivo de banco copiado ou uma connection string vazada é uma credencial de assinatura
  roubada, a menos que a chave esteja em outro lugar. Tenha isso em mente em qualquer implantação cuja
  base tenha backup, seja replicada ou copiada para a máquina de um desenvolvedor — e note que o
  [backup do banco de dados](retention.md#a-funcionalidade-de-backup-embutida--somente-sqlite) embutido
  grava um artefato que não é criptografado, então uma chave enviada viaja nele protegida somente pela
  `Signing:ProfileSecretsKey`.
- **O disco local foi rejeitado, e não esquecido.** Gravar o envio no sistema de arquivos do host falha
  justamente na implantação para a qual a funcionalidade existe: o disco de uma instância em cluster é
  efêmero, então o arquivo se perderia na reciclagem e nunca chegaria às outras instâncias.
- **O limite é de 256 KiB**, e a página recusa um arquivo maior antes de lê-lo.
- **Ele nunca mais pode ser lido.** Não há download, e nenhuma página ou endpoint mostra os bytes ou a
  senha; os dois aparecem como *configurado* ou *não configurado*. Guarde sua própria cópia do `.pfx` em
  um lugar que você controla — a base é onde o produto o mantém, e não um arquivo de onde recuperá-lo.
- **As três escolhas do formulário de edição são manter, substituir e descartar.** O **Editar
  certificado** de um perfil existente oferece o envio como local, quer o perfil já tenha um arquivo quer
  não, com um seletor logo abaixo e uma nota dizendo o que o salvamento vai fazer: um seletor vazio
  **mantém** o arquivo armazenado, um preenchido o **substitui**, e apontar o perfil para um caminho ou um
  blob o **remove**. A remoção é avisada antes do salvamento, e nenhuma das três acontece por omissão.
- **Um perfil novo assina na hora; um certificado alterado espera uma reinicialização.** Enviar ao
  *criar* um perfil abre o certificado durante o salvamento, então uma senha errada é reportada no
  formulário e o perfil assina de imediato. Enviar pelo formulário de *edição* não abre nada — uma senha
  errada em um material substituído aparece na próxima inicialização, como um perfil degradado na página
  que o corrige. [Trocando a origem a quente](#trocando-a-origem-a-quente) explica por quê.

## O certificado do aprovador

Tudo acima trata do certificado com que **este host** assina. Em um perfil cuja regra de aprovação nomeia
um **conjunto de assinantes** `Approvers` ou `ProfileKeyAndApprovers` (veja [Aprovações](approvals.md)),
um segundo tipo de certificado entra em cena, e nada dele é configurado aqui: cada aprovador **coassina o
arquivo de pagamento com um certificado próprio**, e o produto nunca detém essa chave. Sob `Approvers`, o
próprio perfil é **sem chave** — nenhum certificado, nada aberto na inicialização, e não degradado por
não ter um.

O aprovador alcança seu certificado de uma de duas formas, e o host precisa de pelo menos uma delas
configurada — um perfil cujo conjunto de assinantes inclui os aprovadores é recusado no salvamento
enquanto nenhuma estiver:

- **No navegador**, pela extensão de navegador **Lacuna Web PKI**, para um certificado no repositório do
  sistema operacional ou em um token ou smart card. O host precisa de uma `WebPki:License` (que não é
  segredo); cada aprovador instala a extensão uma vez, pela página de instalação da Lacuna. Uma extensão
  ausente, desatualizada ou não suportada é reportada no diálogo de assinatura, com o caminho de
  instalação, antes de qualquer outra coisa acontecer.
- **Em nuvem**, pelo **Lacuna CloudHub**, para um certificado que um provedor guarda no seu HSM (um
  *certificado em nuvem*). O host precisa de `CloudHub:ApiKey` e `CloudHub:PublicBaseUrl`; o aprovador
  escolhe seu provedor e se autentica lá.

**Qual certificado: e-CPF ou e-CNPJ.** O produto aceita um certificado ICP-Brasil que carregue um CPF, e
lê o CPF onde a ICP-Brasil o coloca:

| Certificado | De quem é o CPF que o produto lê | Forma usual |
|-------------|----------------------------------|-------------|
| **e-CPF** — emitido para uma pessoa física | O do titular. | A1 (um arquivo instalado no navegador ou no repositório do sistema operacional) ou A3 (um smart card ou token USB, protegido por PIN). |
| **e-CNPJ** — emitido para uma empresa | O do **responsável**: a pessoa física que o certificado nomeia como representante da empresa. | Geralmente A3. |

Qualquer um dos dois é aceito. Um certificado que **não carrega CPF nenhum** — um certificado fora da
ICP-Brasil, um certificado de servidor — é recusado como tal (`approval.certificate-without-cpf`), uma
resposta distinta da de divergência, para que o aprovador ouça o motivo real. Os certificados vêm de
qualquer AC da lista do ITI, exatamente como o do próprio host.

**O CPF precisa corresponder ao pool.** O pool de aprovadores do perfil nomeia o CPF de cada aprovador, e
um job congela esse pool quando fica retido. O CPF do certificado precisa ser igual ao **CPF congelado
do membro que a sessão nomeia** — a pessoa que entrou pelo seu link do portal ou pelo Microsoft Entra.
Ele nunca *escolhe* o membro: um certificado válido de um colega do mesmo pool é recusado sob a sua
sessão (`approval.certificate-cpf-mismatch`). Então o CPF que um operador digita no pool precisa ser o CPF
do certificado que aquele aprovador vai apresentar — confira-o contra o certificado antes de o primeiro
arquivo ficar retido, porque um job já retido mantém o pool que congelou. O seletor de certificados mostra
ao aprovador somente os certificados que carregam aquele CPF congelado, então um CPF errado no pool
aparece como um seletor que não oferece nada e nomeia, pelos dígitos verificadores, o CPF que esperava.

**Ele é verificado por inteiro, contra o mesmo conjunto de confiança da chave do próprio host.** Cadeia,
período de validade e revogação, pelo PKI SDK, contra o
[conjunto de confiança](#certificados-de-teste-e-o-conjunto-de-confiança) a que a chave do perfil é
submetida quando assina. Qualquer falha é recusada como `approval.certificate-invalid` com os motivos do
SDK, antes de o token pedir o PIN e antes de qualquer assinatura existir. A verificação não é de melhor
esforço: trata-se da autorização de um pagamento, e um certificado revogado aprovando um é exatamente o
caso para o qual a revogação existe. Os motivos chegam ao log operacional, então um aprovador recusado
por um motivo que não consegue ler na tela tem um operador que consegue.

**O que é registrado.** A aprovação guarda o subject, o emissor, o número de série, o thumbprint SHA-256,
o CPF e — em um e-CNPJ — o CNPJ do certificado, mais o nome do provedor em nuvem quando a assinatura foi
feita em nuvem, com o CPF mascarado onde quer que o registro seja mostrado
([Segurança](security.md#dados-pessoais-dos-aprovadores--cpf-e-e-mail)). O
`GET /api/jobs/{id}/approvals` o reporta como o objeto [`certificate`](rest-api.md#aprovações) de cada
decisão. O arquivo entregue carrega a própria assinatura; o produto não guarda bytes de assinatura no
registro.

## Trocando a origem a quente

Mudar o certificado de um perfil exige uma reinicialização — o certificado é carregado uma vez no boot, e
o handle aberto da chave privada nunca é trocado por baixo de um job que pode estar no meio de uma
assinatura. A mudança em si é feita na página do perfil no dashboard, e não em um arquivo de
configuração. Procedimento:

1. Prepare a nova origem (importe o certificado para o repositório do Windows, copie o novo PFX,
   instale o driver PKCS#11, provisione a chave do cofre e seu `.cer`).
2. Na página do perfil, clique em **Editar certificado**, aponte para a nova origem e salve. Um campo de
   senha deixado em branco mantém a senha armazenada; digite uma para substituí-la. Um perfil cujo
   PKCS#12 foi **enviado** mantém esse arquivo enquanto o seletor fica vazio, recebe um novo quando você
   escolhe um, e o perde quando você aponta o perfil para um caminho ou um blob — o formulário diz qual
   antes do salvamento. Nada é gravado se as coordenadas forem recusadas.
3. Se a nova origem precisa de uma nova variável de ambiente (PIN do PKCS#11, senha de criptografia),
   defina-a antes da reinicialização.
4. O perfil agora carrega um **marcador de reinicialização pendente** nomeando os campos que mudaram, e
   continua assinando com o certificado anterior até você reiniciar. Esse é o estado honesto, e não um
   atraso a contornar: é o que mantém respondível *qual certificado assinou este arquivo*.
5. Reinicie o serviço. O banner de bootstrap imprime `cert source = …` — verifique se corresponde à sua
   intenção, e se o marcador sumiu. Se o novo certificado não abrir, o perfil sobe **degradado** com o
   motivo naquela mesma página; corrija as coordenadas e reinicie de novo.
6. Envie um job de teste pela fila (solte um arquivo em `input/`, ou faça POST em `/api/files`).
   Inspecione o histórico do job resultante para confirmar que a nova identidade é a signatária.

O `Signing:Profiles[]` e o bloco global `Signing:Certificate` são uma **semente única** e ficam inertes em
uma implantação que já subiu uma vez, então editá-los não muda nada. Uma implantação cuja base ainda está
vazia — um primeiro boot, ou uma troca de provider de banco de dados — é semeada a partir deles como
antes.

:::warning Mudou na 2.1.0 — certificados são trocados na página do perfil
Antes da 2.1.0, um certificado era trocado editando o `appsettings.Production.json` e reiniciando. O
arquivo de configuração agora só é lido para semear uma base vazia.
:::

## Diagnóstico de problemas

| Sintoma | Diagnóstico |
|---------|-------------|
| Boot falha com "Signing:PkiSdkLicense is required" | Defina `Signing__PkiSdkLicense` (ambiente) ou `Signing:PkiSdkLicense` (configuração). Veja [Segurança](security.md). |
| Um perfil fica degradado dizendo "PKCS#11 PIN environment variable … is empty" | A variável de ambiente nomeada por `PinEnvVar` não está definida para o serviço. Defina-a e reinicie. |
| Boot falha com "WindowsStore source is not supported on this OS" | Você configurou `Source = WindowsStore` no Linux. Troque a origem. |
| Um perfil fica degradado dizendo "does not match Azure Key Vault key … their public keys differ" | `CerPath` (ou o blob) e `KeyName` se referem a pares de chaves diferentes. Verifique-os com a receita de OpenSSL / CLI do Azure acima. |
| Boot falha com "Endpoint must be an absolute https:// URL" | O `Endpoint` é um nome DNS puro do cofre ou usa `http://`. Use a forma completa, por exemplo `https://my-vault.vault.azure.net/`. |
| Boot falha dizendo que tanto um caminho quanto um blob estão configurados | `Path`/`CerPath` e `Blob` são mutuamente exclusivos. Remova um. A mesma recusa dispara quando nenhum dos dois está definido. |
| Boot falha com uma URL de blob rejeitada por carregar query string | A URL é uma shared-access signature. SAS não é uma credencial aceita — use `Credential` com `ManagedIdentity`, `ServicePrincipal` ou `AccountKey` e uma URL de blob pura. |
| Um perfil fica degradado dizendo que o blob de material de assinatura não existe, ou que sua credencial foi recusada | Verifique se a identidade detém **Storage Blob Data Reader** no container, e se o blob existe na URL que aparece no banner (nomes de container e de blob diferenciam maiúsculas). Para `AccountKey`, a chave está errada ou foi rotacionada. O host continua rodando; corrija as coordenadas na página do perfil e reinicie. |
| Um perfil fica degradado dizendo que a senha do PKCS#12 não abriu o arquivo | Senha errada no perfil, ou um arquivo danificado. Veja [Verificando se o arquivo é carregável](#verificando-se-o-arquivo-é-carregável). |
| Um perfil fica degradado dizendo que o PFX está criptografado com PBES2 | Reexporte com o envelope clássico (`openssl pkcs12 -export -legacy`, ou TripleDES-SHA1 no Windows). |
| Um perfil fica degradado dizendo que o arquivo de certificado está vazio (0 bytes) | Forneça o arquivo de novo. |
| Jobs falham com `profile.degraded` | O certificado do perfil não abriu na inicialização, ou seus segredos armazenados não puderam ser decifrados (uma `Signing:ProfileSecretsKey` errada). O motivo está na página do perfil e no histórico do job. Corrija e reinicie — repetir o job antes disso falha do mesmo jeito. |
| A assinatura falha com um `403` / `Forbidden` do Azure | O registro de aplicativo não tem a permissão de **sign** na chave. Conceda **Key Vault Crypto User** (RBAC) ou a operação **Sign** (política de acesso). |
| A assinatura falha com um `429` do Azure | Throttling do cofre sob carga. Reduza o `Pipeline:MaxConcurrency` ou solicite um limite maior para o cofre. |
| A assinatura falha imediatamente com "Certificate not found by thumbprint" | O thumbprint não corresponde a nenhum certificado na origem configurada. Reconfira com os comandos de descoberta acima. |
| A assinatura falha com erro de "module load failed" / "C_Initialize" do PKCS#11 | O `.so`/`.dll` do driver não pôde ser carregado — biblioteca do fabricante ausente no host ou não montada no container. |
| A assinatura falha com "Access is denied" ao ler uma chave privada do Windows | A conta virtual do serviço não tem acesso à chave — conceda-o via `certlm.msc → Gerenciar Chaves Privadas`. |
| PDF assinado rejeitado por um verificador a jusante | Confira se a versão da política está atual — os arquivos de política da ADR-Básica são versionados pelo ITI. Verificadores a jusante precisam aceitar a versão que o Bulk Signer emite. |
| Um **certificado de teste Turing / Fermat** é recusado na imagem publicada | O conjunto de confiança de release é só a ICP-Brasil — veja [Certificados de teste e o conjunto de confiança](#certificados-de-teste-e-o-conjunto-de-confiança). Em um host de homologação, defina `Signing:TrustLacunaTestRoot = true` **e** `ASPNETCORE_ENVIRONMENT=Staging`; a chave sozinha é recusada sob `Production`. |
| Boot falha com "Signing:TrustLacunaTestRoot is true while the environment is 'Production'" | Deliberado. Remova a chave em um host de produção; em um host de homologação, nomeie o ambiente `Staging`. |
| O **Assinar e aprovar** de todo aprovador é recusado como `approval.certificate-invalid` | Geralmente é a implantação, e não os certificados: o host não consegue verificar a revogação (sem caminho de saída até as listas das ACs), ou os certificados são de teste sob o conjunto de confiança de produção. Os motivos estão no log operacional. Veja [Aprovações](approvals.md#diagnóstico-de-problemas). |
| Um aprovador é sempre recusado como `approval.certificate-cpf-mismatch` | O CPF do pool e o do certificado diferem — veja [O certificado do aprovador](#o-certificado-do-aprovador). Corrija o CPF no pool de aprovadores do perfil; um job já retido mantém o pool que congelou. |

Veja [Diagnóstico de problemas](troubleshooting.md) para o catálogo mais amplo de modos de falha.

---

**A seguir:** [Segurança](security.md) — tratamento de segredos e o modelo de ameaças.
**Anterior:** [Configuração](configuration.md).
