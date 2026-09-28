---
sidebar_label: "Bulk Signer"
sidebar_position: 1
---

# Lacuna Bulk Signer

O Lacuna Bulk Signer é um **serviço de assinatura em lote *on premises*** para cenários
compatíveis com a ICP-Brasil. Ele recebe arquivos de origens automatizadas (pastas monitoradas ou
upload via REST) e de operadores (um upload pelo dashboard), processa-os através de um pipeline de
assinatura controlado — com uma etapa opcional de aprovação humana, na qual os aprovadores podem
coassinar com os próprios certificados — e produz saídas assinadas e verificadas, com histórico
operacional e log de eventos completos, um dashboard para o operador e recuperação automática na
reinicialização.

O Bulk Signer foi projetado para rodar dentro da sua própria infraestrutura: um único serviço que
monitora pastas (ou aceita uploads), assina, verifica e promove os resultados para uma pasta de
saída. Não há atualização automática, e uma instalação padrão não faz nenhuma conexão de saída —
assinatura remota, Azure Key Vault, certificados em nuvem para aprovadores e telemetria são todos
opcionais.

:::tip O que há de novo desde a 2.0
Esta documentação descreve a versão **2.15.0**. As principais novidades desde a 2.0:

- **Os perfis de assinatura vivem na base operacional** e são criados, editados, recertificados e
  aposentados pelo dashboard; cada perfil escolhe a pasta monitorada que usa (2.1–2.2).
- **Os aprovadores podem assinar**: uma regra de aprovação pode exigir os certificados dos próprios
  aprovadores, a partir do navegador ou — pelo Lacuna CloudHub — de um provedor em nuvem, um arquivo por
  vez ou uma seleção inteira; um perfil pode até não ter chave, sendo assinado apenas pelos seus
  aprovadores (2.1, 2.7, 2.14).
- **Uploads pelo dashboard**, que um host pode desligar (2.4, 2.10); um nome de arquivo que já foi
  assinado é recusado em vez de assinado duas vezes (2.13).
- **O log de eventos operacionais pode ser lido** no dashboard e via REST, e um único job pode ser
  excluído pela página Jobs (2.13); a página Jobs também exporta para Excel e baixa vários arquivos
  assinados em um único ZIP (2.7, 2.11).
- **O Clear Jobs esvazia o sistema**: todo job, seus arquivos e os eventos operacionais (2.9–2.10).
- **Reimplantações em cluster no App Service** deslocam o container antigo em vez de falhar ao iniciar
  (2.5).
- A guarda de datas de pagamento do CNAB240 pode ser desligada por perfil (2.15).
:::

## Funcionalidades

- **Formatos de assinatura.** CAdES (`.p7m`), PAdES (PDF) e XAdES (XML) — todos sob a política
  **ADR-Básica** da ICP-Brasil por padrão. A nomenclatura de saída por perfil preserva a extensão
  original (`remessa.signed.rem`) ou grava CAdES em formato PEM quando um sistema a jusante exigir.
- **Origens de certificado.** Arquivos PKCS#12 (`.pfx` / `.p12`), HSMs e smart cards PKCS#11, o
  repositório de certificados do Windows e o **Azure Key Vault** (a chave permanece no cofre e
  assina remotamente). O `.pfx` ou `.cer` pode ser lido do **Azure Blob Storage** em vez do disco
  local, ou um PKCS#12 pode ser **enviado pelo dashboard**, que o mantém criptografado na base
  operacional.
- **Perfis de assinatura, gerenciados no dashboard.** Um perfil nomeado agrupa formato, origem do
  certificado, verificação, criptografia, nomenclatura de saída, checagem CNAB240 e a regra de
  aprovação. Os perfis são linhas na base operacional: crie, edite, recertifique e aposente-os pelo
  dashboard — uma mudança de comportamento chega ao próximo job sem reinício — e cada perfil escolhe a
  única pasta monitorada que usa. O `Signing:Profiles[]` na configuração é uma semeadura única para o
  primeiro boot.
- **Três caminhos de entrada.** Pastas de entrada monitoradas (com um detector de estabilidade, para que
  arquivos gravados pela metade não sejam capturados cedo demais), um endpoint `POST /api/files` para
  clientes programáticos e um botão **Upload files** na página Jobs do dashboard. `Upload:Enabled =
  false` desliga os dois caminhos de upload. Um arquivo que chega com um nome que um job concluído ou
  ativo já carrega é recusado, e não assinado duas vezes.
- **Arquivos de pagamento CNAB240.** Opcional por perfil: interpreta uma remessa do Banco do Brasil,
  recusa-se a assinar uma que não esteja em conformidade ou cujas datas de pagamento já tenham
  passado — a menos que o perfil desligue essa guarda de datas, para um banco que processa pagamentos
  com data passada — e mostra ao operador o total, o pagador e cada pagamento individual.
- **Etapa de aprovação.** Retém um arquivo de pagamento sob um quórum de aprovadores nomeados antes
  que qualquer assinatura exista. Uma única rejeição é um veto, e o arquivo rejeitado é devolvido à
  pasta de saída marcado como `.reject`; as aprovações são vinculadas aos bytes do arquivo, e a regra é
  congelada no job, de modo que editar um perfil nunca consegue liberar um arquivo retido. Os
  aprovadores têm sua própria fila, com aprovação em lote e exportação para Excel — e um **segundo
  fator TOTP** opcional, que pede ao aprovador que comprove sua presença antes de uma decisão.
- **Aprovadores que assinam.** Uma regra de aprovação pode exigir que os aprovadores aprovem
  **coassinando o arquivo com o próprio certificado ICP-Brasil** — junto com a chave do perfil, ou no
  lugar dela, em um perfil sem chave assinado apenas pelos seus aprovadores. O certificado pode estar no
  navegador do aprovador (Lacuna Web PKI) ou ser mantido por um provedor em nuvem, pelo **Lacuna
  CloudHub**, e uma seleção inteira pode ser aprovada e assinada de uma vez.
- **Pipeline recuperável.** Os jobs fluem por uma fila durável com pausa/retomada que sobrevive a uma
  reinicialização. Se o serviço for interrompido no meio do percurso, uma varredura de recuperação na
  inicialização move para o lado qualquer job interrompido, de modo que nada se perca silenciosamente.
- **Criptografia pós-assinatura opcional (BSENC v1).** Criptografa os artefatos assinados em repouso
  com AES-256-GCM quando habilitada. Acompanha scripts de referência de descriptografia em Python e
  PowerShell.
- **Integração com o Lacuna Signer (por perfil).** Encaminha uma pasta para o
  [Lacuna Signer](https://www.lacunasoftware.com/) para assinatura humana, em vez de assinar com um
  certificado mantido no host.
- **Autenticação, de duas formas.** Uma única chave de API atende tanto ao dashboard do operador (via
  cookie de sessão) quanto a clientes programáticos (via cabeçalho `X-API-Key`) — ou ative o login
  opcional pelo **Microsoft Entra ID**, com as app roles `Administrator` e `Approver`, deixando a
  chave de API REST intacta.
- **Dashboard do operador, em inglês ou português do Brasil.** Um console web com status ao vivo,
  histórico de jobs, ações de repetição/cancelamento/reescaneamento e de exclusão de um job, uploads,
  exportação da lista de jobs para Excel, download de vários arquivos assinados em um ZIP, as páginas
  dos perfis de assinatura, um visualizador de exceções recentes e o **log de eventos operacionais**
  (quem pausou o pipeline, alterou um perfil, decidiu uma aprovação, limpou os jobs). As páginas de
  login e do aprovador podem exibir o logotipo do cliente. O idioma é a escolha do leitor em cada
  navegador, não uma configuração do servidor.
- **Armazenamento e base, locais ou no Azure.** A árvore de trabalho pode permanecer em disco local
  ou viver em um compartilhamento do **Azure Files**; a base operacional pode continuar em SQLite ou
  migrar para **SQL Server / Azure SQL**, sob o seu próprio regime de backup e DR. As duas escolhas
  são independentes.
- **Escala horizontal no Azure App Service (opcional).** `Cluster:Enabled` executa mais de uma
  instância ativa sobre uma única base operacional e um único compartilhamento de trabalho: um job
  nunca é processado duas vezes, o trabalho de uma instância que morre é assumido em vez de ficar
  órfão, e o pipeline continua assinando enquanto um host está fora. Desabilitado por padrão, e
  desabilitado é, byte a byte, o produto de instância única. Veja
  **[Azure App Service](azure.md)** e, antes disso, **[seus limites](high-availability.md)**.
- **Backup do banco de dados (implantações com SQLite).** Backups agendados ou sob demanda da base
  operacional para um caminho local, um bucket compatível com S3 ou um container do Azure Blob, com
  uma contagem de retenção.
- **Visibilidade de desempenho.** Um painel de tempos por etapa (espera na fila, assinatura,
  verificação, saída) com vazão e uma divisão entre Local e Remoto — mantido na base operacional, de
  modo que sobrevive a reinicializações e descreve um cluster inteiro — além da exportação opcional
  para o Azure Application Insights.
- **Observabilidade.** Logs estruturados com mascaramento automático de segredos e um destino
  opcional em **Azure Table** para hosts cujo disco não sobrevive a uma reinicialização, um endpoint
  de métricas Prometheus, uma sondagem de prontidão cuja resposta anônima é só um veredito (o detalhe
  fica atrás da chave de API) e um envelope de erro `ProblemDetails` (RFC 9457) com códigos estáveis
  legíveis por máquina.
- **Limitação de taxa por IP.** Limites configuráveis de janela fixa nos endpoints de upload, ação,
  aprovação e exportação, com suporte opcional a cabeçalhos encaminhados, para que o cliente real
  seja contabilizado por trás de um proxy ou balanceador de carga.
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

Cada etapa é registrada na base operacional (histórico de jobs + eventos operacionais) e no arquivo de
log estruturado; os eventos podem ser lidos na página Events do dashboard. O dashboard e a API REST leem
os mesmos dados e disparam as mesmas ações.

## Início rápido — Docker

Usando o pacote de implantação fornecido pela Lacuna Software, mais a imagem do repositório privado de
imagens Docker da Lacuna — veja [Obtendo o produto](installation.md#obtendo-o-produto):

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

Acesse o dashboard em `http://localhost:8080/` usando a `Auth:ApiKey` configurada.

Para instalações com systemd no Linux, Serviço do Windows e em primeiro plano, veja
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
| A superfície REST e o envelope de erro marcado com `code` | [API REST](rest-api.md) |
| Criptografia pós-assinatura (BSENC v1) | [Criptografia](encryption.md) |
| Encaminhar uma pasta pelo Lacuna Signer para assinatura humana | [Integração com o Lacuna Signer](lacuna-signer.md) |
| Interpretar e validar arquivos de pagamento do Banco do Brasil | [Arquivos de pagamento CNAB240](cnab240.md) |
| Reter um arquivo de pagamento sob um quórum de aprovadores | [Aprovações](approvals.md) |
| Padrões de retenção e o que é (e o que não é) podado automaticamente hoje | [Retenção](retention.md) |
| Modos de falha e diagnóstico | [Diagnóstico de problemas](troubleshooting.md) |
| Scripts de referência — descriptografia, provisionamento do Key Vault, registro de aplicativo no Entra | [Exemplos](samples.md) |

Com o serviço em execução, uma referência OpenAPI ao vivo é servida em `/scalar/v1`.

## Ordem de leitura

| Se você está… | Comece em |
|---------------|-----------|
| Instalando o serviço pela primeira vez | [Instalação](installation.md) → [Configuração](configuration.md) → [Certificados](certificates.md) |
| Conectando um sistema automatizado à API REST | [API REST](rest-api.md) → [Segurança](security.md) → [Diagnóstico de problemas](troubleshooting.md) |
| Operando uma instalação existente | [Operação](operations.md) → [Dashboard](dashboard.md) → [Diagnóstico de problemas](troubleshooting.md) |
| Roteando uma pasta monitorada para um perfil de assinatura, ou descobrindo por que os arquivos de uma pasta não andam | [Operação](operations.md#roteando-uma-pasta-monitorada-para-um-perfil-de-assinatura) → [Dashboard](dashboard.md) → [Configuração](configuration.md#storageinputsprofile--roteamento-por-pasta) |
| Descobrindo quem pausou o pipeline, alterou um perfil, decidiu uma aprovação ou limpou os jobs | [Dashboard](dashboard.md) → [API REST](rest-api.md) → [Retenção](retention.md) |
| Limpando os jobs, ou excluindo um | [Operação](operations.md#clear-jobs) → [Retenção](retention.md) |
| Diagnosticando vazão baixa | [Estatísticas de jobs](statistics.md) → [Certificados](certificates.md) → [Telemetria](telemetry.md) |
| Mantendo a chave de assinatura fora do host | [Certificados](certificates.md#origem--azurekeyvault) → [Exemplos](samples.md) → [Segurança](security.md) |
| Habilitando a criptografia | [Criptografia](encryption.md) → [Segurança](security.md) → [Exemplos](samples.md) |
| Encaminhando uma pasta pelo Lacuna Signer (assinatura humana) | [Integração com o Lacuna Signer](lacuna-signer.md) → [Configuração](configuration.md) → [Operação](operations.md) |
| Assinando arquivos de pagamento bancário | [Arquivos de pagamento CNAB240](cnab240.md) → [Aprovações](approvals.md) → [Segurança](security.md) |
| Colocando uma etapa de aprovação antes do assinador | [Aprovações](approvals.md) → [Configuração](configuration.md#signingprofilesapproval--a-etapa-de-aprovação) → [Segurança](security.md) |
| Autenticando com contas organizacionais | [Instalação](installation.md#login-pelo-microsoft-entra-id-opcional) → [Configuração](configuration.md#authentraid--login-opcional-pelo-microsoft-entra-id) → [Segurança](security.md) |
| Rodando sem disco local durável | [Configuração](configuration.md#storageprovider--storageazurefiles--o-compartilhamento-de-trabalho) → [Instalação](installation.md#escolhendo-onde-a-base-operacional-vive) → [Certificados](certificates.md#lendo-o-arquivo-de-um-blob) |
| Rodando mais de uma instância | [Alta disponibilidade e seus limites](high-availability.md) → [Azure App Service](azure.md) → [Configuração](configuration.md#cluster--implantação-com-múltiplas-instâncias) |
| Preservando o fluxo de logs quando o disco do host não sobrevive | [Configuração](configuration.md#loggingazuretable--um-segundo-destino-de-log) → [Retenção](retention.md#logs-em-uma-tabela--nada-os-poda) |
| Pedindo um segundo fator aos aprovadores | [Aprovações](approvals.md#provando-que-é-você) → [Configuração](configuration.md#approversecondfactor) → [Segurança](security.md) |
| Fazendo backup da base operacional | [Retenção](retention.md#disciplina-de-backup) → [Configuração](configuration.md#backup) |
