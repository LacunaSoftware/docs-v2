# Histórico de versões do PKI Express

### 1.38.0 (2026-08-26) {#v1-38-0}

- [PKIE-12] Adiciona suporte a chaves e certificados em tokens/HSMs PKCS#11 através da configuração `pkcs11LibraryPath`
- [PKIE-86] Adiciona opção metadata nos comandos de assinatura PAdES para definir metadados do PDF
- Atualização Lacuna.Pki SDK [2.22.3](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-22-3)

### 1.36.2 (2026-03-09) {#v1-36-2}

- Atualização Lacuna.Pki SDK [2.22.2](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-22-2)

### 1.36.1 (2026-02-07) {#v1-36-1}

- Atualização Lacuna.Pki SDK [2.22.1](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-22-1)

### 1.36.0 (2025-10-31) {#v1-36-0}

- Adiciona política de assinatura XML para "Certificación de Origen Digital" (COD) usando SHA-256 e Transform extra `xml-exc-c14n#`

### 1.35.1 (2025-08-01) {#v1-35-1}

- Atualização Lacuna.Pki SDK [2.20.1](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-20-1)

### 1.35.0 (2025-06-10) {#v1-35-0}

- [PKIE-85] Adiciona comando de estender carimbos em assinatura de arquivamento XML (e.g.: ICP-Brasil AD-RA)
- [PKIE-85] Melhoria no retorno de informações dos carimbos de tempo no model de assinaturas XML

### 1.34.2 (2025-03-22) {#v1-34-2}

- Atualização do pacote Lacuna.Pki.BrazilTrustServices 1.7.1

### 1.34.1 (2025-03-20) {#v1-34-1}

- Adiciona novo certificado raiz de teste da Lacuna

### 1.34.0 (2025-03-17) {#v1-34-0}

- Atualização PKI SDK [2.18.0](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-18-0)
- Atualização do target framework
- Atualização de pacotes de dependências
- Adiciona suporte às políticas de assinatura PAdES ICP-Brasil AD-RC e AD-RA

### 1.33.0 (2025-02-20) {#v1-33-0}

- Adiciona funcionalidades de requisição direta de carimbo de tempo para uma dado ou hash: stamp-data e stamp-hash
- Adiciona configuração de auto-retry para o requisitor de carimbos de tempo
- Melhoria na listagem de assinaturas de PDF quando há duplicidade de "signature field name" presente
- Corrige serialização do modelo do objeto SignaturePolicyIdentifier quando há somente policyID

### 1.32.1 (2024-09-26) {#v1-32-1}

- Atualização PKI SDK [2.17.2](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-17-2)

### 1.32.0 (2024-09-06) {#v1-32-0}

- Atualização do pacote PKI Trust Services 1.7.0
- Melhoria no log de erros
- Adiciona política de assinatura XMLDSig básica com algoritmo de hash SHA1 (para suporte a assinaturas de sistema legados APENAS)

### 1.31.2 (2024-04-17) {#v1-31-2}

- Atualização PKI SDK [2.16.0](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-16-0)
- Melhoria na chamada de ativação

### 1.31.1 (2023-06-29) {#v1-31-1}

- Atualização do pacote BrazilTrustServices com suporte a proxy

### 1.31.0 (2023-01-04) {#v1-31-0}

- Atualização PKI SDK [2.13.0](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-13-0)
- Adiciona suporte a arquivo P7B como Trust Arbitrator
- Linux versão single-file self-contained

### 1.29.0 (2022-11-16) {#v1-29-0}

- Muda build de linux para .NET 6.0 para suportar novas versões do Ubuntu

### 1.28.1 (2022-09-15) {#v1-28-1}

- Corrigi comportamento quando um provedor de certificado em nuvem retorna mais de um certificado com o mesmo identificador escolhendo um desses certificados

### 1.28.0 (2022-08-25) {#v1-28-0}

- Adiciona suporte a iniciação do processo de autorização no provedor de certificado em nuvem sem a operação de discover (comando `start-service-auth`)
- Adiciona suporte a recuperação do valor `customState` antes de completar a autorização no provedor de cerficado em nuvem (command `get-service-auth-custom-state`)

### 1.27.1 (2022-07-10) {#v1-27-1}

- Atualização PKI SDK [2.12.1](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-12-1)

### 1.27.0 (2022-07-10) {#v1-27-0}

- Adiciona campo de assinatura de PDF: `signer-name` e `location`
- Adiciona opção `classic-enveloped-transform` na assinatura de XML
- Atualização PKI SDK [2.12.0](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-12-0)

### 1.26.3 (2022-04-25) {#v1-26-3}

- Adiciona opção `trust-uncertified-signing-time` na validação de assinatura de XML
- Adiciona política XAdES ICP-Brasil AD-RB com artefatos de revogação incluídos
- Atualização PKI SDK [2.11.3](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-11-3)

### 1.26.2 (2022-04-22) {#v1-26-2}

- Atualização PKI SDK [2.11.2](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-11-2)

### 1.26.0 (2022-04-19) {#v1-26-1}

- Corrige propagação de _trust arbitrators_ customizados

### 1.26.0 (2022-04-19) {#v1-26-0}

- Adiciona campos de PKIs internacionais ao _certificate model_: Argentina, Ecuador, Paraguay, Peru
- Adiciona campo _certificate policies_ ao _certificate model_
- Adiciona política de asinatura XAdES ICP-Brasil AD-RC (Completa)
- Adiciona política de assinatura CAdES ICP-Brasil AD-RA (Arquivamento)
- Adiciona opção de inserção do elemento de assinatura XML `sig-element-insertion`
- Atualização PKI SDK [2.11.1](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-11-1)

### 1.25.4 (2022-02-02) {#v1-25-4}

- Atualização PKI SDK [2.9.1](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-9-1)

### 1.25.3 (2021-10-26) {#v1-25-3}

- Adiciona suporte a definição da direção do auto posicionamento de representações visuais PAdES

### 1.25.1 (2021-10-22) {#v1-25-1}

- Corrige saída do comando `open-xml` quando o XML tem assinatura do tipo full XML

### 1.25.0 (2021-10-21) {#v1-25-0}

- Adiciona abertura e validação de assinaturas XML (comando `open-xml`)
- Adiciona suporte a politica de arquivamento ICP-Brasil em assinaturas XML (política `adra`)
- Corrige ValidationException quando a flag `json` está habilitada

### 1.24.1 (2021-07-16) {#v1-24-1}

- Corrige bug na configuração do trustServicesDiscoveryTimeout
- Adiciona opção `--guess-certificate` que quando múltiplos certificados são encontrados escolhe o mais recente

### 1.24.0 (2021-07-07) {#v1-24-0}

- Adiciona opção `--session-lifetime` nos comandos `discover-services` e `pwd-auth`, para configurar a duração em segundos da sessão de assinaturas
- Melhora as configurações de cultura

### 1.23.2 (2021-06-04) {#v1-23-2}

- Corrige bug na validação de assinaturas PAdES quando não há algumas das informações requeridas

### 1.23.1 (2021-05-14) {#v1-23-1}

- Corrige bug na abertura de assinaturas PAdES quando não há algumas das informações requeridas

### 1.23.0 (2021-02-22) {#v1-23-0}

- Adiciona suporte para o retorno do conteúdo do certificado nos comandos `open-pades` e `open-cades`, com a opção `--fill-cert-content`
- Adiciona opção `--trust-uncertified-signing-time` nos comandos `open-pades` e `open-cades`, para confiar em signing-time não certificado

### 1.22.0 (2021-01-21) {#v1-22-0}

- Adiciona suporte para o retorno do _commitment type_ de assinaturas CAdES (comando `open-cades`)
- Adiciona suporte para o retorno do conteúdo do certificado no comando `open-cert` com a opção `--fill-content`
- Adiciona suporte para o retorno dos certificados emissores no comando `open-cert` com a opção `--fill-issuer`

### 1.21.0 (2020-11-05) {#v1-21-0}

- Corrige conversão do ValidationItemType
- Melhora o model do certificado para returnar o valor de KeyUsage
- Adiciona suporte para o retorno da versão atual do programa (comando `version`)

### 1.20.0 (2020-10-05) {#v1-20-0}

- Adiciona suporte a validação PAdES segundo diferentes políticas com a opção `--policy`
- Adiciona suporte a configuração do _commitment type_ nos comandos `sign-cades` and `start-cades` com a opção`--commitment-type`
- Adiciona suporte a decodificação e validação de certificados (comando `open-cert`)

### 1.19.0 (2020-09-14) {#v1-19-0}

- Adiciona suporte a geração de chave de proteção de dados (comando `generate-data-protection-key`)
- Adiciona suporte a configuração de chave de proteção de dados
- Atualiza PKI SDK para a versão [2.7.8](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-7-8)

### 1.18.0 (2020-08-20) {#v1-18-0}

- Adiciona suporte a usar hashes do documento em assinaturas CAdES _detached_
- Adiciona suporte a representação visual com `visual-rep` em carimbos de tempo
- Melhora retorno do comando quando finaliza a autenticação com PSCs brasileiras
- Corrigi parse do campo sessionType do comando `discover-services`
- Atualiza PKI SDK para a versão [2.7.5](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-7-5)

### 1.17.0 (2020-07-30) {#v1-17-0}

- Adiciona suporte a assinatura usando certificados em nuvem (integração com PSCs brasileiras)
- Melhora merge de assinaturas CAdEs para aceitar um arquivo de assinatura

### 1.16.0 (2020-06-26) {#v1-16-0}

- Adiciona campo "certificationLevel" na assinatura PAdES

### 1.15.0 (2020-06-17) {#v1-15-0}

- Adiciona campo "customSignatureFieldName" na assinatura PAdES
- Atualiza PKI SDK para a versão [2.7.2](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-7-2)

### 1.14.0 (2020-06-09) {#v1-14-0}

- Adiciona suporte a assinatura (CAdES, PAdES e XAdES) utilizando chave armazenada no Azure Key Vault
- Atualiza PKI SDK para a versão [2.7.0](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-7-0)

### 1.13.2 (2019-08-21) {#v1-13-2}

- Atualiza PKI SDK para a versão [2.5.3](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-5-3)

### 1.13.1 (2019-07-31) {#v1-13-1}

- Adiciona a opção de não mostrar a representação visual padrão em uma assinatura PAdES com `--suppress-default-visual-rep` habilitado

### 1.13.0 (2019-07-19) {#v1-13-0}

- Adiciona integração com o serviço LAPP
- Adiciona suporte a razão do assinante para uma assinatura PAdES com `--reason` habilitado
- Atualiza PKI SDK para a versão [2.5.1](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-5-1)

### 1.12.3 (2019-05-20) {#v1-12-3}

- Mudanças na compilação

### 1.12.2 (2019-04-01) {#v1-12-2}

- Adiciona suporte a configuração de timeout no download de CRLs e certificados emissores de AC
- Adiciona suporte a configuração de timeout na requisição de um timestamp
- Atualiza PKI SDK para a versão [2.3.0](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-3-0)

### 1.12.0 (2019-02-05) {#v1-12-0}

- Adiciona suporte as políticas ICP-Brasil em assinaturas PAdES (políticas `adrb`, `adrb-ltv`, e `adrt`)
- Atualiza PKI SDK para a versão [2.2.7](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-2-7)

### 1.11.0 (2018-12-04) {#v1-11-0}

- Adiciona suporte a geração de chave (comando `gen-key`)
- Adiciona suporte a geração de certificado PKCS #12 (comando `create-pfx`)

### 1.10.0 (2018-10-31) {#v1-10-0}

- Adiciona suporte a configuração da cultura e do fuso horário com `--culture` e `--timezone` habilitado nas assinaturas
- Adiciona suporte a configuração do formato de data e hora na representação visual da assinatura PAdES
- Adiciona suporte a listar todos os timezones disponíveis no sistema (comando `list-timezones`)

### 1.9.0 (2018-10-05) {#v1-9.0}

- Adiciona suporte a fusão de assinaturas CMS/CAdES (comando `merge-cms`).
- Melhora validação de assinaturas PAdES e CAdES para suportar políticas com carimbo de tempo.

### 1.8.0 (2018-09-25) {#v1-8-0}

- Adiciona suporte ao retorno do certificado do assinante depois de uma assinatura.
- Atualiza PKI SDK para a versão [2.1.3](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-1-3)

### 1.7.0 (2018-09-20) {#v1-7-0}

- Adiciona suporte a carimbo de tempo (comando `stamp-pdf`) em PDFs.

### 1.6.2 (2018-07-20) {#v1-6-2}

- Corrige bug na ativação manualmente com nova licença
- Atualiza PKI SDK para a versão [2.1.0](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-1-0)

### 1.6.1 (2018-07-11) {#v1-6-1}

- Corrige bug na ativação que afetava instalação em containers Docker

### 1.6.0 (2018-06-18) {#v1-6-0}

- Adiciona suporte para a política de assinatura _Certificación de Origen Digital_ (COD) nas assinaturas XML.

### 1.5.0 (2018-05-18) {#v1-5-0}

- Adiciona escolha da política de assinatura com `--policy` habilitado nas assinaturas
- Adiciona assinatura com carimbo de tempo (suporte para CAdES, PAdES e XAdES)
- Atualiza PKI SDK para a versão [1.20.16](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v1-20-16), corrigindo bug no preenchimento da cadeia de certificados na assinatura PAdES

### 1.4.1 (2018-05-14) {#v1-4-1}

- Atualiza o PKI SDK para versão [1.20.15](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v1-20-15)

### 1.4.0 (2018-04-10) {#v1-4-0}

- Adiciona autenticação com certificado (comandos `start-auth` e `complete-auth`)

### 1.3.0 (2018-03-02) {#v1-3-0}

- Adiciona abertura e validação de assinaturas PAdES e CAdES (comandos `open-pades` e `open-cades`)
- Adiciona edição de PDF (comando `edit-pdf`), possibilitando elaboração de "versão para impressão"
- Adiciona assinatura de servidor utilizando arquivo PKCS #12 (.pfx)
- Adiciona suporte à [utilização de web proxy](config/proxy.md)
- Atualiza o PKI SDK para versão 2.0.13

### 1.2.1 (2018-01-18) {#v1-2-1}

- Atualiza o PKI SDK para versão 2.0.11, corrigindo bug que causava atrasos devido à falta de conectividade mesmo com `--offline` habilitado

### 1.2.0 (2018-01-17) {#v1-2-0}

- Adiciona flag global `--offline` para realizar assinaturas sem conexão de rede
- Corrige bug que fazia com que o comando `help` não pudesse ser utilizado antes da ativação
- Atualiza o PKI PKI SDK para versão 2.0.10

### 1.1.0 (2017-12-06) {#v1-1-0}

- Adiciona mecanismo de ativação, evitando que as aplicações precisem passar o arquivo de licença em cada chamada
- Melhora o registro de logs
- Adiciona comando `config`
- Atualiza o PKI SDK para versão 2.0.7, corrigindo bug no _cache_ de LCRs em ambientes Linux

### 1.0.3 (2017-11-15) {#v1-0-3}

- Atualiza o PKI SDK para versão 2.0.3, corrigindo bug _PlatformNotSupportedException bug_ em algumas distribuições de Linux

### 1.0.2 (2017-11-07) {#v1-0-2}

- Primeira versão disponível tanto para Linux quanto para Windows
- Atualiza o PKI SDK para versão 2.0.2
- Adiciona informação da versão do programa no comando `help`

### 1.0.1 (2017-10-27) {#v1-0-1}

- Corrige bug na compilação que fazia com que arquivos desnecessários fossem incluidos no pacote

_Versão disponível apenas para Linux_

### 1.0.0 (2017-10-26) {#v1-0-0}

- Primeira versão disponível publicamente
- Comandos disponíveis nessa versão:
  - `list-certs`
  - `read-cert`
  - `import-pfx`
  - `sign-data`
  - `sign-hash`
  - `sign-cades`
  - `sign-pades`
  - `sign-xml`
  - `start-cades`
  - `start-pades`
  - `start-xml`
  - `complete-sig`
  - `help`

_Versão disponível apenas para Linux_
