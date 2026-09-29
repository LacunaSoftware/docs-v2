---
sidebar_label: "Bulk Signer"
sidebar_position: 1
---

# Lacuna Bulk Signer

O Lacuna Bulk Signer é um **serviço *on-premises* de assinatura digital em lote** para cenários
compatíveis com a ICP-Brasil. Ele recebe arquivos de origens automatizadas (pastas monitoradas ou
upload via REST) e de operadores (upload pelo dashboard), processa-os em um pipeline de assinatura
controlado — com uma etapa opcional de aprovação humana, na qual os aprovadores podem coassinar com os
próprios certificados — e gera saídas assinadas e verificadas, com histórico operacional e log de
eventos completos, um dashboard para o operador e recuperação automática após uma reinicialização.

O Bulk Signer foi projetado para rodar na sua própria infraestrutura: um único serviço que monitora
pastas (ou aceita uploads), assina, verifica e move os resultados para uma pasta de saída. Não há
atualização automática, e uma instalação padrão não abre nenhuma conexão de saída — assinatura remota,
Azure Key Vault, certificados em nuvem para aprovadores e telemetria são todos opcionais e precisam ser
ativados.

:::tip O que há de novo desde a 2.0
Esta documentação descreve a versão **2.15.0**. As principais novidades desde a 2.0:

- **Os perfis de assinatura ficam no banco de dados operacional** e são criados, editados,
  recertificados e aposentados pelo dashboard; cada perfil escolhe a pasta monitorada da qual recebe
  arquivos (2.1–2.2).
- **Os aprovadores podem assinar**: uma regra de aprovação pode exigir os certificados dos próprios
  aprovadores, no navegador ou — pelo Lacuna CloudHub — em um provedor em nuvem, um arquivo por vez ou
  uma seleção inteira de uma vez; um perfil pode até não ter chave e ser assinado apenas pelos
  aprovadores (2.1, 2.7, 2.14).
- **Uploads pelo dashboard**, que podem ser desligados em um host (2.4, 2.10); um arquivo com um nome
  que já foi assinado é recusado, em vez de ser assinado duas vezes (2.13).
- **O log de eventos operacionais pode ser consultado** no dashboard e pela API REST, e um job pode ser
  excluído individualmente pela página Jobs (2.13); a página Jobs também exporta para Excel e baixa
  vários arquivos assinados em um único ZIP (2.7, 2.11).
- **O Limpar Jobs esvazia o sistema**: todos os jobs, os arquivos deles e os eventos operacionais
  (2.9–2.10).
- **Reimplantações em cluster no App Service** deslocam o container antigo, em vez de falhar ao iniciar
  (2.5).
- A verificação da data de pagamento do CNAB240 pode ser desligada por perfil (2.15).
:::

## Funcionalidades

- **Formatos de assinatura.** CAdES (`.p7m`), PAdES (PDF) e XAdES (XML) — todos sob a política
  **ADR-Básica** da ICP-Brasil por padrão. A nomenclatura da saída, definida por perfil, preserva a
  extensão original (`remessa.signed.rem`) ou grava o CAdES em formato PEM quando o sistema de destino
  exigir.
- **Origens de certificado.** Arquivos PKCS#12 (`.pfx` / `.p12`), HSMs e smart cards PKCS#11, o
  repositório de certificados do Windows e o **Azure Key Vault** (a chave permanece no cofre, e a
  assinatura é feita remotamente). O `.pfx` ou o `.cer` pode ser lido do **Azure Blob Storage** em vez
  do disco local, ou um PKCS#12 pode ser **enviado pelo dashboard**, que o mantém criptografado no banco
  operacional.
- **Perfis de assinatura, gerenciados no dashboard.** Cada perfil, identificado por um nome, reúne
  formato, origem do certificado, verificação, criptografia, nomenclatura da saída, validação CNAB240 e
  regra de aprovação. Os perfis são linhas no banco operacional: crie, edite, recertifique e aposente
  perfis pelo dashboard — uma mudança de comportamento vale para o próximo job, sem reinicialização — e
  cada perfil escolhe a única pasta monitorada da qual recebe arquivos. O `Signing:Profiles[]` na
  configuração é um seed (carga inicial) usado uma única vez, no primeiro boot.
- **Três caminhos de entrada.** Pastas de entrada monitoradas (com um detector de estabilidade, para que
  arquivos gravados pela metade não sejam capturados cedo demais), um endpoint `POST /api/files` para
  clientes programáticos e um botão **Enviar arquivos** na página Jobs do dashboard. `Upload:Enabled =
  false` desliga os dois caminhos de upload. Um arquivo que chega com um nome que um job concluído ou
  ativo já possui é recusado, em vez de ser assinado duas vezes.
- **Arquivos de pagamento CNAB240.** Opcional por perfil: interpreta uma remessa do Banco do Brasil,
  recusa-se a assinar uma remessa que não esteja em conformidade ou cujas datas de pagamento já tenham
  passado — a menos que o perfil desligue essa verificação de datas, para um banco que processa
  pagamentos com data passada — e mostra ao operador o total, o pagador e cada pagamento individual.
- **Etapa de aprovação.** Retém um arquivo de pagamento até a decisão de um quórum de aprovadores
  designados, antes que exista qualquer assinatura. Uma única rejeição é um veto, e o arquivo rejeitado é
  devolvido à pasta de saída marcado como `.reject`; as aprovações são vinculadas aos bytes do arquivo, e
  a regra é congelada no job, de modo que editar um perfil nunca libera um arquivo retido. Os aprovadores
  têm uma fila própria, com aprovação em lote e exportação para Excel — e um **segundo fator TOTP**
  opcional, que pede ao aprovador que comprove a própria presença antes de decidir.
- **Aprovadores que assinam.** Uma regra de aprovação pode exigir que os aprovadores aprovem
  **coassinando o arquivo com o próprio certificado ICP-Brasil** — junto com a chave do perfil ou no
  lugar dela, em um perfil sem chave, assinado apenas pelos aprovadores. O certificado pode estar no
  navegador do aprovador (Lacuna Web PKI) ou ser mantido por um provedor em nuvem, pelo **Lacuna
  CloudHub**, e uma seleção inteira pode ser aprovada e assinada de uma só vez.
- **Pipeline recuperável.** Os jobs passam por uma fila durável, com pausa/retomada, que sobrevive a
  reinicializações. Se o serviço for interrompido no meio do processamento, uma varredura de recuperação
  na inicialização separa qualquer job interrompido, de modo que nada se perca silenciosamente.
- **Criptografia pós-assinatura opcional (BSENC v1).** Quando habilitada, criptografa em repouso os
  artefatos assinados, com AES-256-GCM. Inclui scripts de referência de descriptografia em Python e
  PowerShell.
- **Integração com o Lacuna Signer (por perfil).** Encaminha uma pasta para o
  [Lacuna Signer](https://www.lacunasoftware.com/) para assinatura humana, em vez de assinar com um
  certificado mantido no host.
- **Autenticação, de duas formas.** Uma única chave de API atende tanto ao dashboard do operador (por
  meio de um cookie de sessão) quanto aos clientes programáticos (pelo header `X-API-Key`) — ou ative o
  login opcional pelo **Microsoft Entra ID**, com os app roles `Administrator` e `Approver`, sem alterar
  a chave da API REST.
- **Dashboard do operador, em inglês ou português do Brasil.** Um console web com status ao vivo,
  histórico de jobs, ações de nova tentativa, cancelamento, nova varredura e exclusão de jobs
  individuais, uploads, exportação da lista de jobs para Excel, download de vários arquivos assinados em
  um ZIP, as páginas de perfis de assinatura, um visualizador de exceções recentes e o **log de eventos
  operacionais** (quem pausou o pipeline, alterou um perfil, decidiu uma aprovação, limpou os jobs). As
  páginas de login e do aprovador podem exibir o logotipo do cliente. O idioma é escolhido pelo leitor,
  em cada navegador, e não configurado no servidor.
- **Armazenamento e banco de dados, locais ou no Azure.** A árvore de trabalho pode ficar em disco local
  ou em um compartilhamento do **Azure Files**; o banco operacional pode continuar em SQLite ou migrar
  para **SQL Server / Azure SQL**, sob o seu próprio regime de backup e DR. As duas escolhas são
  independentes.
- **Escala horizontal no Azure App Service (opcional).** `Cluster:Enabled` executa mais de uma
  instância ativa sobre um único banco operacional e um único compartilhamento de trabalho: um job
  nunca é processado duas vezes, o trabalho de uma instância que cai é assumido por outra em vez de
  ficar órfão, e o pipeline continua assinando enquanto um host está fora do ar. Vem desabilitado por
  padrão e, desabilitado, é byte a byte o produto de instância única. Veja
  **[Azure App Service](azure.md)** e, antes disso, **[os limites desse modo](high-availability.md)**.
- **Backup do banco de dados (implantações com SQLite).** Backups agendados ou sob demanda do banco
  operacional para um caminho local, um bucket compatível com S3 ou um container do Azure Blob, com
  retenção por quantidade de cópias.
- **Visibilidade de desempenho.** Um painel de tempos por etapa (espera na fila, assinatura,
  verificação, saída) com vazão e uma divisão entre Local e Remoto — mantido no banco operacional, de
  modo que sobrevive a reinicializações e descreve um cluster inteiro —, além da exportação opcional
  para o Azure Application Insights.
- **Observabilidade.** Logs estruturados com mascaramento automático de segredos e um destino opcional
  em **Azure Table** para hosts cujo disco não sobrevive a uma reinicialização, um endpoint de métricas
  Prometheus, um probe de prontidão cuja resposta anônima é apenas o veredito (o detalhe exige a chave
  de API) e um envelope de erro `ProblemDetails` (RFC 9457) com códigos estáveis, legíveis por máquina.
- **Limite de requisições (rate limiting) por IP.** Limites configuráveis de janela fixa nos endpoints
  de upload, ações, aprovação e exportação, com suporte opcional a headers encaminhados, para que o
  cliente real seja identificado mesmo por trás de um proxy ou balanceador de carga.
- **Implantação em múltiplos alvos.** O mesmo serviço roda como unidade systemd no Linux, Serviço do
  Windows, container Docker, Azure Web App ou processo de console em primeiro plano.

## Como funciona

```
  pasta input/ ──────┐
  POST /api/files ───┼──▶ Fila ──▶ Claim ──▶ [gates] ──▶ Assina ──▶ Verifica ──┬──▶ output/
  upload no dashboard┘                                                         │    (output/*.enc
                                                                 em caso de    │     quando a cripto-
                                                                 falha         └──▶ error/   grafia
                                                                                             está ativa)

  [gates], ambos opcionais por perfil de assinatura e totalmente ignorados quando não configurados:
      Parse CNAB240      — recusa uma remessa não conforme, ou cujas datas de pagamento já passaram
      Etapa de aprovação — retém em AwaitingApproval até que um quórum de pessoas nomeadas aprove
                           (e, quando a regra assim diz, coassine com os próprios certificados)
```

Cada etapa é registrada no banco operacional (histórico de jobs + eventos operacionais) e no arquivo de
log estruturado; os eventos podem ser consultados na página Eventos do dashboard. O dashboard e a API
REST leem os mesmos dados e disparam as mesmas ações.

## Início rápido — Docker

Com o pacote de implantação fornecido pela Lacuna Software e a imagem do repositório privado de imagens
Docker da Lacuna — veja [Obtendo o produto](installation.md#obtendo-o-produto):

```bash
cd deploy/docker

docker login <registry-da-lacuna> --username <usuário-do-registry>   # o compose nomeia o repositório

cp .env.sample .env
mkdir -p data logs config
cp ../appsettings.Production.json.sample config/appsettings.Production.json

# Edite config/appsettings.Production.json e .env — no mínimo:
#   - Signing__PkiSdkLicense       (string de licença em base64 fornecida pela Lacuna Software)
#   - Auth__ApiKey                 (>= 16 caracteres; use um valor aleatório)
#   - Signing:Certificate:Pfx:Path (e um arquivo .pfx irmão em config/) — ou escolha outra origem

sudo chown -R 1654:1654 data logs   # o container roda como UID 1654 em hosts Linux
docker compose up -d
curl http://localhost:8080/api/health
```

Entre no dashboard em `http://localhost:8080/` com a `Auth:ApiKey` configurada.

Para instalações como unidade systemd no Linux, como serviço do Windows ou em primeiro plano, veja
**[Instalação](installation.md)**.

## Documentação

| Assunto | Página |
|---------|--------|
| Instalar o serviço em qualquer alvo suportado | [Instalação](installation.md) |
| Escalar horizontalmente no Azure App Service, passo a passo | [Azure App Service (modo cluster)](azure.md) |
| O que rodar mais de uma instância *não* lhe dá | [Alta disponibilidade e seus limites](high-availability.md) |
| Cada chave do `appsettings.json` (tipo, padrão, override por ambiente) | [Configuração](configuration.md) |
| Escolher e configurar uma origem de certificado (PFX / PKCS#11 / repositório do Windows / Azure Key Vault) | [Certificados](certificates.md) |
| Tratamento de segredos, rotação da chave de API, ACLs de arquivos, mascaramento de logs | [Segurança](security.md) |
| Operação do dia a dia e o ciclo de vida do job | [Operação](operations.md) |
| O console Blazor do operador | [Dashboard](dashboard.md) |
| Interpretar o painel de tempos por etapa | [Estatísticas de jobs](statistics.md) |
| Exportação opcional para o Azure Application Insights | [Telemetria](telemetry.md) |
| Os endpoints REST e o envelope de erro identificado por `code` | [API REST](rest-api.md) |
| Criptografia pós-assinatura (BSENC v1) | [Criptografia](encryption.md) |
| Encaminhar uma pasta pelo Lacuna Signer para assinatura humana | [Integração com o Lacuna Signer](lacuna-signer.md) |
| Interpretar e validar arquivos de pagamento do Banco do Brasil | [Arquivos de pagamento CNAB240](cnab240.md) |
| Reter um arquivo de pagamento até a decisão de um quórum de aprovadores | [Aprovações](approvals.md) |
| Padrões de retenção e o que é (e o que não é) removido automaticamente hoje | [Retenção](retention.md) |
| Modos de falha e diagnóstico | [Diagnóstico de problemas](troubleshooting.md) |
| Scripts de referência — descriptografia, provisionamento do Key Vault, registro de aplicativo no Entra | [Exemplos](samples.md) |

Com o serviço em execução, uma referência OpenAPI ao vivo é servida em `/scalar/v1`.

## Ordem de leitura

| Se você está… | Comece em |
|---------------|-----------|
| Instalando o serviço pela primeira vez | [Instalação](installation.md) → [Configuração](configuration.md) → [Certificados](certificates.md) |
| Conectando um sistema automatizado à API REST | [API REST](rest-api.md) → [Segurança](security.md) → [Diagnóstico de problemas](troubleshooting.md) |
| Operando uma instalação existente | [Operação](operations.md) → [Dashboard](dashboard.md) → [Diagnóstico de problemas](troubleshooting.md) |
| Roteando uma pasta monitorada para um perfil de assinatura, ou descobrindo por que os arquivos de uma pasta não estão sendo processados | [Operação](operations.md#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura) → [Dashboard](dashboard.md) → [Configuração](configuration.md#storageinputsprofile--roteamento-por-pasta) |
| Descobrindo quem pausou o pipeline, alterou um perfil, decidiu uma aprovação ou limpou os jobs | [Dashboard](dashboard.md) → [API REST](rest-api.md) → [Retenção](retention.md) |
| Limpando os jobs, ou excluindo um | [Operação](operations.md#limpar-jobs) → [Retenção](retention.md) |
| Diagnosticando vazão baixa | [Estatísticas de jobs](statistics.md) → [Certificados](certificates.md) → [Telemetria](telemetry.md) |
| Mantendo a chave de assinatura fora do host | [Certificados](certificates.md#origem--azurekeyvault) → [Exemplos](samples.md) → [Segurança](security.md) |
| Habilitando a criptografia | [Criptografia](encryption.md) → [Segurança](security.md) → [Exemplos](samples.md) |
| Encaminhando uma pasta pelo Lacuna Signer (assinatura humana) | [Integração com o Lacuna Signer](lacuna-signer.md) → [Configuração](configuration.md) → [Operação](operations.md) |
| Assinando arquivos de pagamento bancário | [Arquivos de pagamento CNAB240](cnab240.md) → [Aprovações](approvals.md) → [Segurança](security.md) |
| Colocando uma etapa de aprovação antes do assinador | [Aprovações](approvals.md) → [Configuração](configuration.md#signingprofilesapproval--a-etapa-de-aprovação) → [Segurança](security.md) |
| Autenticando com contas organizacionais | [Instalação](installation.md#login-pelo-microsoft-entra-id-opcional) → [Configuração](configuration.md#authentraid--login-opcional-pelo-microsoft-entra-id) → [Segurança](security.md) |
| Rodando sem disco local durável | [Configuração](configuration.md#storageprovider--storageazurefiles--o-compartilhamento-de-trabalho) → [Instalação](installation.md#escolhendo-onde-fica-o-banco-operacional) → [Certificados](certificates.md#lendo-o-arquivo-de-um-blob) |
| Rodando mais de uma instância | [Alta disponibilidade e seus limites](high-availability.md) → [Azure App Service](azure.md) → [Configuração](configuration.md#cluster--implantação-com-múltiplas-instâncias) |
| Preservando o fluxo de logs quando o disco do host não sobrevive | [Configuração](configuration.md#loggingazuretable--um-segundo-destino-de-log) → [Retenção](retention.md#logs-em-uma-tabela--nada-os-poda) |
| Pedindo um segundo fator aos aprovadores | [Aprovações](approvals.md#provando-que-é-você) → [Configuração](configuration.md#approversecondfactor) → [Segurança](security.md) |
| Fazendo backup do banco operacional | [Retenção](retention.md#disciplina-de-backup) → [Configuração](configuration.md#backup) |
