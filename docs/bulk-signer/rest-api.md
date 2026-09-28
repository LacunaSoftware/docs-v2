---
sidebar_label: "API REST"
sidebar_position: 10
---

# API REST

O Lacuna Bulk Signer expõe uma pequena superfície REST ao lado do dashboard do operador. Esta página
cobre autenticação, o envelope de erro, a limitação de taxa, e o que cada grupo de endpoints faz — com
exemplos em curl para os formatos comuns.

:::tip
A **referência OpenAPI ao vivo**, com os esquemas completos de requisição/resposta, é servida em
`/scalar/v1` enquanto o serviço está rodando. Esta página é o guia conceitual; a referência ao vivo é a
fonte da verdade para detalhes em nível de campo.
:::

## Autenticação

Dois esquemas compartilham uma política de autorização:

| Esquema | Cabeçalho / cookie | Emitido via | Usado por |
|---------|--------------------|-------------|-----------|
| Chave de API | `X-API-Key: <chave>` (nome do cabeçalho de `Auth:ApiKeyHeader`) | Definida em `Auth:ApiKey`, na configuração / ambiente | Clientes programáticos |
| Cookie | `Cookie: lbs-auth=<token>` (nome de `Auth:CookieName`) | Envio do formulário `POST /api/auth/login` | Operadores / dashboard |

A comparação da chave de API roda em tempo constante. Ambos os esquemas sustentam a mesma política em
todo endpoint protegido. Veja [Segurança](security.md) para rotação e ACLs.

As superfícies do aprovador (o portal do aprovador e sua exportação para Excel) usam sessões de
navegador próprias — o cookie do link do aprovador, ou um login pelo Microsoft Entra com a role
`Approver` — e essas sessões **nunca** satisfazem a política de operador: um aprovador não é um
operador.

Endpoints anônimos:

- `GET  /api/health`
- `GET  /api/ready` — somente o **veredito** de readiness, o `name` e o `ok` de cada verificação. O
  detalhe fica no `GET /api/ready/details`, autenticado, e o `Readiness:RequireApiKey` põe o próprio
  veredito atrás da chave onde a sondagem consegue levar um cabeçalho. Veja [Sistema](#sistema).
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/entra-login` (inicia um login pelo Microsoft Entra; serve apenas um redirecionamento)
- `POST /api/culture` (preferência de idioma de exibição)
- `GET  /login` (dashboard, layout anônimo)
- `GET  /branding/customer-logo` (o logo do cliente nas páginas de login e do aprovador; `404` com
  `branding.customer-logo-not-available` quando nenhum está configurado ou ele não carregou)
- `GET  /approvals/link/{token}` — a troca de link do portal do aprovador: anônima porque o link *é* a
  credencial.
- `POST /api/approvals/{id}` e `GET /approve/{id}` — usados somente quando um perfil de assinatura carrega
  uma [regra de aprovação](approvals.md). A única rota anônima que altera estado no produto, anônima por
  decisão explícita. Veja
  [Segurança](security.md#a-página-de-aprovação-por-job-não-é-autenticada).

Uma rota de navegador não é nem anônima nem REST: `GET /approvals/cloud/return`, para onde um provedor
de certificados em nuvem devolve o navegador de um aprovador depois de uma assinatura em nuvem. Ela fica
atrás da sessão do aprovador (nunca de uma chave de API), registra a aprovação assinada nessa mesma
requisição, não responde nada além de um redirecionamento e compartilha o orçamento de limitação de
taxa `Approval` descrito abaixo.

Todo outro endpoint exige autenticação. Nenhuma rota anônima serve dados de job.

Quando o [login pelo Microsoft Entra ID](configuration.md#authentraid--login-opcional-pelo-microsoft-entra-id)
está configurado, o `POST /api/auth/login` não emite cookie nem para uma chave correta, e a política de
operador exige a app role `Administrator`. **O `X-API-Key` não é tocado** — automação não consegue fazer
um login interativo, então clientes programáticos nunca percebem o modo.

## Envelope de erro

Toda resposta de erro é um corpo `ProblemDetails` (RFC 9457) com um slug estável legível por máquina na
extensão `code`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Job not found.",
  "status": 404,
  "code": "job.not-found",
  "traceId": "00-…-00",
  "requestId": "0HMV…"
}
```

**Clientes programáticos devem se basear no `code`** — o `title` é texto para humanos e pode ser
reformulado ou traduzido. O inventário completo (um status `—` significa que o código nunca é uma
resposta HTTP: ele é registrado no job, ou mostrado na página de um aprovador, em vez disso):

| Código | Status típico | O que significa |
|--------|---------------|-----------------|
| `job.not-found` | 404 | Nenhum job com o id informado. |
| `job.not-queued` | 409 | Cancelamento tentado em um job que não está mais `Queued` (jobs em andamento são sagrados). |
| `job.race-lost` | 409 | O worker pegou o job antes de a ação ser confirmada; tente de novo. |
| `job.not-failed` | 409 | Repetição tentada em um job que não está no estado `Failed`. |
| `job.rejected-not-retriable` | 409 | Repetição tentada em um job que um aprovador rejeitou. Um veto não é uma falha da qual se recuperar; o arquivo foi devolvido a `output/` com `.reject` no nome. |
| `job.input-missing` | 409 | Repetição tentada, mas o arquivo de entrada original não está mais em disco. |
| `job.output-unavailable` | 409 | Download de saída solicitado em um job que não está `Completed`. Na rota do pacote, pelo menos um dos jobs nomeados não está `Completed`; o `detail` nomeia cada um. |
| `job.output-gone` | 410 | O job está `Completed`, mas seu arquivo não está mais em `output/` sob o nome que as regras de nomenclatura *atuais* do perfil produzem — foi movido, ou ainda está lá sob um nome anterior porque `PreserveFileExtension` ou `SaveAsPem` mudou depois de o job concluir. Na rota do pacote, retornado somente quando *nenhum* dos jobs nomeados ainda tem seu arquivo. |
| `job.archive-empty` | 400 | A rota do pacote foi chamada sem nenhum `id`. |
| `job.archive-too-large` | 400 | A rota do pacote recebeu mais de 50 jobs distintos. Divida a seleção. |
| `job.already-processing` | 409 | O upload conflitou com um job ativo para o mesmo arquivo em disco. |
| `file.already-processed` | 409 | Um job `Completed` ou ainda ativo já carrega este nome de arquivo (comparado no host inteiro, sem diferenciar maiúsculas). O `POST /api/files` responde `409` e não armazena nada; a repetição de um job que falhou com este código também responde `409`. A partir de uma pasta monitorada ou de um rescan, o arquivo vira um job `Failed` com este código, movido para `error/`. O remédio é apagar o job que detém o nome pela página `/jobs` do dashboard (não há rota REST para isso) ou renomear o arquivo. Governado por `Pipeline:RejectAlreadyProcessedFileNames`. |
| `job.path-too-long` | 400 / 409 | O caminho do arquivo excede 850 caracteres, então nenhum job foi criado. O `POST /api/files` responde `400`; a repetição de uma linha gravada antes de o limite existir responde `409`; uma pasta monitorada ou um rescan o reportam no console e no log. Recusado **no momento em que o arquivo é recebido**, em vez de aceito e reprovado depois, em todo provider de banco de dados. Reduza o aninhamento de diretórios ou o nome do arquivo — repetir o mesmo caminho não muda nada. |
| `job.input-held` | — | Auditado no job falho. Outro processo detinha um lease exclusivo sobre o arquivo de entrada quando o pipeline foi colocá-lo em stage — na prática, uma segunda instância monitorando a mesma pasta do Azure Files. Nada foi assinado e o arquivo é deixado como está. |
| `job.input-diverged` | — | Auditado no job *concluído*, e não é uma falha. O arquivo de entrada foi reescrito durante o job, então foi deixado no lugar em vez de apagado. Veja [Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job). |
| `upload.disabled` | 409 | Este host não recebe uploads: [`Upload:Enabled`](configuration.md#upload) é `false`. Respondido antes de o perfil ser resolvido, então a resposta não diz nada sobre quais perfis existem. Somente uma mudança de configuração e uma reinicialização religam os uploads; pastas monitoradas, rescan e repetição não são afetados. |
| `upload.empty` | 400 | O campo multipart `file` está ausente ou tem zero bytes. |
| `upload.too-large` | 413 | O upload excede `Upload:MaxBytes`. |
| `upload.invalid-name` | 400 | A parte multipart `file` não tem cabeçalho `filename`. |
| `upload.format-unsupported` | 400 | O valor de `?format=…` não é um formato de assinatura reconhecido. |
| `validation.reason-too-long` | 400 | Um campo `reason` em pausa/cancelamento excede o comprimento máximo. |
| `validation.filter-invalid` | 400 | Um valor de query string não é aceitável: um valor de filtro não reconhecido (por exemplo, `?status=…`), uma data que não se interpreta, uma `page` além do limite, um `id` do pacote que não é um GUID. O `detail` nomeia o valor. Um filtro inválido é recusado, nunca ampliado para a tabela inteira. |
| `auth.misconfigured` | 401 | `Auth:ApiKey` está vazia em tempo de execução — corrija a configuração, não a requisição. |
| `auth.invalid-credentials` | 401 | Chave de API errada ou cookie expirado. |
| `folder.not-found` | 404 | O `POST /api/rescan?folder=<nome>` nomeou uma pasta que não está em `Storage:Inputs[]`. |
| `profile.not-found` | 400 / 404 | Um nome de perfil que ninguém tem. O `POST /api/files?profile=<nome>` responde `400` (o nome é um parâmetro de uma requisição para criar um job); o `GET /api/profiles/{name}` responde `404` (o perfil *é* o recurso). O `GET /api/profiles` lista os nomes que existem. |
| `profile.disabled` | 409 | O perfil existe, mas um operador parou de rotear trabalho novo para ele. O `POST /api/files?profile=<nome>` e o `POST /api/jobs/{id}/retry` respondem `409`. Um rescan continua respondendo `200`, contando os arquivos recusados como `ignored`. **Jobs já enfileirados no perfil rodam até o fim.** Reative o perfil pela sua página no dashboard, ou roteie o trabalho para outro lugar. |
| `profile.degraded` | — | Auditado no job falho. O perfil do job existe, mas não consegue assinar — seu certificado não pôde ser aberto na inicialização, ou seus segredos armazenados não puderam ser decifrados. O motivo está no histórico do job e na página do perfil. O remédio termina em uma **reinicialização**, e não em repetir o job ou mexer no arquivo; todos os outros perfis continuam assinando. Veja [Certificados](certificates.md). |
| `profile.key-unavailable` | — | Auditado no job falho. O job foi congelado para ser assinado com a chave do perfil, mas a regra de aprovação do perfil passou desde então a exigir só assinaturas dos aprovadores, e esta instância não detém chave para ele. Repita em uma instância que ainda detenha a chave, ou volte a regra e reinicie. |
| `pipeline.race-lost` | 409 | Uma pausa ou retomada concorrente foi confirmada primeiro, então esta não gravou nada. Leia o `GET /api/pipeline/state` e tente de novo se a intenção ainda vale. |
| `signer.document-rejected` | — | Auditado no job falho. Definido quando o Lacuna Signer reporta o documento como `Refused`, `Expired` ou `Canceled`. |
| `signer.timeout` | — | Auditado no job falho. Definido quando uma linha `AwaitingSigner` excede `Signer:TimeoutHours`. |
| `signer.unreachable` | — | Auditado no job falho. Definido quando a API do Lacuna Signer retornou um erro permanente (por exemplo, chave de API inválida). |
| `cnab240.invalid` | — | Auditado no job falho. O arquivo não era uma remessa do Banco do Brasil em conformidade. Veja [CNAB240](cnab240.md#quando-um-arquivo-é-recusado). |
| `cnab240.payment-date-passed` | — | Auditado no job falho. A data de pagamento mais antiga da remessa está no passado. Reexporte com datas atuais; repetir o mesmo arquivo falha de forma idêntica. Nunca definido em um perfil com `CheckCnab240PaymentDates = false`, onde um arquivo assim é assinado. Veja [CNAB240](cnab240.md#datas-de-pagamento-que-já-passaram). |
| `approval.not-required` | 404 | `GET /api/jobs/{id}/approvals` em um job que nunca ficou retido. Distinto de um job retido sobre o qual ninguém decidiu, que é `200` com uma lista vazia. |
| `approval.not-pending` | 409 | O job não aceita decisão em seu status atual. |
| `approval.unknown-approver` | 403 | O endereço não está no pool congelado do job — também retornado para um endereço malformado, deliberadamente. |
| `approval.already-decided` | 409 | Este aprovador já decidiu; decisões são finais. |
| `approval.unknown-decision` | 400 | O `decision` estava presente e não era nem `approved` nem `rejected`. |
| `approval.signature-required` | 403 | Uma aprovação em um job cujo conjunto de assinantes congelado inclui os aprovadores: ali, aprovar significa **coassinar o arquivo de pagamento** com o certificado do próprio aprovador, que esta rota não consegue carregar. Uma rejeição em um job assim continua sendo aceita aqui. A aprovação em si é feita pelo portal do aprovador ou pela página do job. |
| `approval.second-factor-required` | 403 | `ApproverSecondFactor:Enabled` está ligado, o que **retira o `POST /api/approvals/{id}` por completo** — toda chamada recusa e nenhum cabeçalho, chave ou campo de corpo a satisfaz, porque somente uma sessão de navegador pode carregar uma presença comprovada. Decidir passa para o portal do aprovador; o `GET /api/jobs/{id}/approvals` não é afetado. Veja [Aprovações](approvals.md#provando-que-é-você). |
| `approval.job-incomplete` | 500 | O job está retido, mas sua regra congelada ou seu hash de conteúdo está faltando — a linha foi modificada fora da aplicação. |
| `approval.rejected` | — | Auditado no job falho. Uma rejeição chegou depois de um worker já ter reivindicado o job, então o pipeline recusou a assinatura. |
| `approval.content-changed` | — | Auditado no job falho. A cópia em stage mudou entre ser aprovada e ser assinada. **Não deveria jamais ser vista.** |
| `approval.content-unmeasured` | — | Auditado no job falho. O perfil carrega uma regra de aprovação, mas o job não carrega hash de conteúdo — a verificação CNAB240 do perfil estava desligada, então nada interpretou o arquivo. Um job retido sem hash jamais poderia ser decidido, então ele falha pelo nome. |
| `approval.signer-set-unsupported` | — | Auditado no job falho. O conjunto de assinantes congelado não pode ser produzido para este job — por exemplo, assinaturas de aprovadores em um job cujo formato não é CAdES, ou a chave do perfil junto com os aprovadores em um perfil que assina pelo Lacuna Signer. O job nunca é assinado com a chave do perfil no lugar. |
| `approval.signatures-missing` | — | Auditado no job falho. O conjunto de assinantes congelado exige as assinaturas dos aprovadores, e elas não estão lá para serem promovidas. |
| `approval.certificate-invalid`, `approval.certificate-without-cpf`, `approval.certificate-cpf-mismatch`, `approval.signature-invalid`, `approval.signature-conflict` | — | Mostrados a um aprovador que está assinando uma aprovação, nunca retornados por uma rota. O certificado falhou na verificação completa; não carrega CPF; carrega um CPF diferente do congelado para aquele aprovador; a assinatura não validou; um colega assinou primeiro (comece de novo). Veja [Certificados](certificates.md#o-certificado-do-aprovador). |
| `approval.second-factor-invalid-code`, `approval.second-factor-locked-out` | — | Mostrados no campo de código do portal do aprovador: um código que não confere (ou já foi usado), e cinco códigos errados seguidos fechando a inscrição daquele aprovador por cinco minutos. |
| `backup.disabled` | 409 | `POST /api/backup` em uma implantação que não faz backup: `Backup:Enabled` está desligado, ou o provider de banco de dados é o SQL Server, onde o backup é tarefa do regime do seu próprio SGBD. |
| `backup.already-running` | 409 | Um backup roda por vez em cada instância. |
| `backup.not-running` | 409 | `POST /api/backup/cancel` sem nada em andamento. |
| `branding.customer-logo-not-available` | 404 | `GET /branding/customer-logo` sem logo configurado, ou com um que não carregou na inicialização. |
| `culture.not-supported` | 400 | O `POST /api/culture` nomeou uma cultura diferente de `en-US` ou `pt-BR`. |
| `rate-limited` | 429 | Limite de janela fixa por IP excedido. |
| `internal` | 500 | 500 gerado pelo framework (nenhum código de negócio envolvido). |

:::note Correção — as recusas de download são 409 e 410
Edições anteriores desta página documentavam `job.output-unavailable` e `job.output-gone` como `404`.
A rota sempre respondeu `409` e `410`; somente `job.not-found` é um `404`. Baseie-se no `code`, e não no
status.
:::

Em `Production`, o customizador de erros remove `detail`, `instance` e qualquer extensão além de `code`,
`traceId`, `requestId`, `errors`. Nenhum stack trace escapa. Em `Development`, os detalhes completos
fluem.

Um valor de `code` nunca é renomeado nem reaproveitado — novos códigos são apenas acrescentados, então
um cliente que casa por `code` está seguro através de atualizações.

## Limitação de taxa

Limitadores de janela fixa por IP, configurados sob `RateLimiting:` (veja
[Configuração](configuration.md#ratelimiting)). Quatro políticas:

| Política | Padrão | Endpoints |
|----------|--------|-----------|
| `Upload` | 30 / 60 s | `POST /api/files` |
| `Actions` | 60 / 60 s | `POST /api/jobs/{id}/retry`, `POST /api/jobs/{id}/cancel`, `DELETE /api/jobs`, `POST /api/pipeline/pause`, `POST /api/pipeline/resume`, `GET /api/pipeline/state`, `POST /api/rescan`, `POST /api/cleanup`, `POST /api/backup`, `POST /api/backup/cancel` |
| `Approval` | 10 / 60 s | `POST /api/approvals/{id}`, `GET /approvals/link/{token}`, `GET /approvals/cloud/return` — seu próprio orçamento, separado das ações de operador, porque as rotas são alcançáveis sem credencial de operador. Ids de job são GUIDs v4, e é isto que os mantém (assim como os tokens de link) inadivinháveis contra uma máquina, e não contra uma pessoa. |
| `Export` | 10 / 60 s | `GET /approvals/export/{list}` (a exportação para Excel do portal do aprovador) e `GET /api/jobs/export` (a da página Jobs). Uma exportação roda uma consulta de lista inteira e monta uma planilha, então tem um orçamento próprio, que não consome as permissões de que um cancelamento ou uma aprovação precisam. |

Respostas acima do limite são `429 Too Many Requests` com `code = "rate-limited"` e um cabeçalho
`Retry-After`.

## Grupos de endpoints

### Autenticação

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `POST` | `/api/auth/login` | POST de formulário. Troca uma chave de API por um cookie de sessão. Anônimo. Não emite cookie quando o modo Entra está configurado. |
| `GET` | `/api/auth/entra-login` | Inicia um login pelo Microsoft Entra. Redireciona para `/login` quando o modo não está configurado. |
| `POST` | `/api/auth/logout` | Limpa a sessão do Bulk Signer e redireciona para `/login` (para `/approvals/link-required`, no caso de uma sessão mantida apenas por um link de aprovador). Somente local: uma sessão da Microsoft não é tocada. |

Campos de formulário do `/api/auth/login`:

| Campo | Obrigatório | Observações |
|-------|-------------|-------------|
| `ApiKey` | sim | Comparado com `Auth:ApiKey` em tempo constante. |
| `ReturnUrl` | não | Caminho relativo local para onde ir após o login. Tentativas de redirecionamento aberto são reescritas para `/`. |

Clientes programáticos geralmente dispensam cookies e enviam `X-API-Key` diretamente em toda
requisição.

### Arquivos

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `POST` | `/api/files` | Upload multipart de um arquivo para assinatura. Limitado pela política `Upload`. O diálogo **Enviar arquivos** da [página Jobs](dashboard.md#jobs--jobs) do dashboard passa pelo mesmo handler, então os dois recusam um arquivo em termos idênticos. Desligado sob [`Upload:Enabled = false`](configuration.md#upload), respondendo `409 upload.disabled`. |

Parâmetros de query:

| Parâmetro | Tipo | Observações |
|-----------|------|-------------|
| `format` | enum | Override opcional (`Pades`, `Cades`, `Xades`). Padrão: detecção automática pela extensão. |
| `profile` | string | Opcional. Nomeia um perfil de assinatura (sem diferenciar maiúsculas; o `GET /api/profiles` os lista). Nulo/omitido recai para o perfil `default`. Nomes desconhecidos retornam `400` com `code = "profile.not-found"`; um perfil que um operador desativou retorna `409` com `code = "profile.disabled"`, antes de qualquer byte ser colocado em stage. |

```bash
curl -X POST http://localhost:8080/api/files \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" \
  -F "file=@report.pdf" \
  -F "format=Pades"   # override opcional; o padrão é detectar pela extensão

# Roteie um upload por um perfil específico (por exemplo, contracts):
curl -X POST "http://localhost:8080/api/files?profile=contracts" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" \
  -F "file=@nda.pdf"
```

Resposta (`202 Accepted`):

```json
{
  "jobId": "9b62…",
  "fileName": "report.pdf",
  "originalPath": "/var/lib/bulksigner/input/<guid>.pdf",
  "format": "Pades",
  "status": "Queued"
}
```

Erros possíveis: `upload.disabled`, `upload.empty`, `upload.too-large`, `upload.invalid-name`,
`upload.format-unsupported`, `profile.not-found`, `profile.disabled`, `file.already-processed`,
`job.already-processing`, `job.path-too-long`, `rate-limited`.

:::note Novo na 2.13.0 — um nome de arquivo é assinado uma vez
Com `Pipeline:RejectAlreadyProcessedFileNames` ligado (o padrão), um arquivo que chega com um nome que um
job `Completed` ou ainda ativo já carrega é recusado com `file.already-processed`, em vez de ser
assinado uma segunda vez. Apagar o job que detém o nome, pela página `/jobs` do dashboard, volta a
aceitar o nome.
:::

### Jobs

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/jobs` | Lista jobs, mais recentes primeiro. Query: `status`, `profile`, `page` (no máximo 10.737.418 — além disso, `400 validation.filter-invalid`), `pageSize` (máx. 200). |
| `GET` | `/api/jobs/{id}` | Um job + seu histórico. |
| `GET` | `/api/jobs/{id}/output` | Transmite a saída assinada (e possivelmente criptografada) de um job `Completed`. Nome de arquivo `.enc` quando criptografada. `409 job.output-unavailable` em qualquer outro status; `410 job.output-gone` quando o arquivo saiu de `output/`. |
| `GET` | `/api/jobs/archive?id=…&id=…` | O **pacote de saídas assinadas**: um ZIP com as saídas assinadas dos jobs `Completed` nomeados. Veja [abaixo](#o-pacote-de-saídas-assinadas). |
| `GET` | `/api/jobs/export` | A lista de jobs como uma planilha do Excel, recortada pelos filtros da página Jobs. Limitado pela política `Export`. Veja [abaixo](#exportando-a-lista-de-jobs). |
| `POST` | `/api/jobs/{id}/retry` | Cria um novo job com a mesma entrada e `ParentJobId = {id}`. Válido somente quando o job de origem está `Failed`. Limitado pela política `Actions`. |
| `POST` | `/api/jobs/{id}/cancel` | Cancela um job `Queued`, `AwaitingSigner` **ou** `AwaitingApproval`. Jobs locais em andamento retornam `409` com `code = "job.not-queued"`. Limitado pela política `Actions`. |
| `GET` | `/api/jobs/{id}/approvals` | **Somente leitura.** O registro de aprovação do job: a regra congelada, o pool congelado com a decisão de cada membro, e a lista de decisões. `404` com `approval.not-required` em um job que nunca ficou retido. |
| `DELETE` | `/api/jobs` | **Destrutivo — Clear Jobs.** Apaga **todo** registro de job, em qualquer status, com seu histórico, todo arquivo que esses jobs deixaram para trás, e todo evento operacional registrado antes da limpeza. Veja [abaixo](#clear-jobs). Limitado pela política `Actions`. |

Listar jobs `Queued`:

```bash
curl "http://localhost:8080/api/jobs?status=Queued&page=1&pageSize=50" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Resposta:

```json
{
  "items": [
    {
      "id": "9b62…",
      "fileName": "report.pdf",
      "originalPath": "/var/lib/bulksigner/input/<guid>.pdf",
      "format": "Pades",
      "source": "Upload",
      "status": "Queued",
      "createdAt": "2026-05-26T13:42:11Z",
      "updatedAt": "2026-05-26T13:42:11Z",
      "parentJobId": null,
      "errorMessage": null,
      "profileName": "default"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalCount": 1
}
```

O `GET /api/jobs/{id}` retorna o mesmo formato mais um array `history` de entradas
`{ id, timestamp, status, message }` (uma por transição de estado, da mais antiga para a mais recente)
e — somente na representação de **detalhe**, nunca nas linhas de lista — dois objetos que são `null` em
jobs a que não se aplicam:

```json
{
  "cnab240": {
    "totalCentavos": 387961326,
    "totalFormatted": "R$ 3.879.613,26",
    "paymentCount": 44,
    "cancellationCount": 0,
    "earliestPaymentDate": "2026-08-05",
    "latestPaymentDate": "2026-08-20",
    "contentSha256": "9f86d081…"
  },
  "approval": {
    "required": 2,
    "poolSize": 3,
    "approved": 1,
    "rejected": 0,
    "outstanding": 1,
    "quorumReached": false,
    "vetoed": false,
    "frozenAt": "2026-08-01T09:12:44Z",
    "parkedSince": "2026-08-01T09:12:44Z",
    "expiresAt": "2026-08-03T09:12:44Z",
    "expiresAfterSeconds": 172800,
    "signers": "ProfileKey"
  }
}
```

- O `totalCentavos` é o inteiro autoritativo — divida por 100 para exibir. O `totalFormatted` é
  fornecido para que um relatório concorde com o console do operador sem reimplementar a formatação de
  moeda brasileira. As linhas individuais de pagamento **não** são expostas por REST — veja
  [CNAB240](cnab240.md#o-que-a-api-rest-retorna).
- Todo número em `approval` é a regra **congelada no job**, nunca a atual do perfil. `approved` e
  `rejected` contam pessoas distintas, não linhas.
- O `signers` é o **conjunto de assinantes** congelado — de quem são as assinaturas que a saída carrega:
  `ProfileKey`, `Approvers` ou `ProfileKeyAndApprovers`. Um job retido antes de o campo existir reporta
  `ProfileKey`.
- **Ramifique por `vetoed`, e não por aritmética própria sobre `rejected > 0`**: uma rejeição para o job
  diga o quórum o que disser, e `quorumReached` pode ser `true` em um job que um veto já parou.
- O `parkedSince` **não é limpo** quando o job deixa `AwaitingApproval` — subtraia-o de agora para
  obter "há quanto tempo isto está esperando", o número sobre o qual um monitor de aprovações paradas
  alarma.

Retry / cancel são POST sem corpo obrigatório:

```bash
curl -X POST "http://localhost:8080/api/jobs/$ID/retry" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

curl -X POST "http://localhost:8080/api/jobs/$ID/cancel" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Em caso de sucesso, o retry retorna:

```json
{ "newJobId": "fc12…", "parentJobId": "9b62…", "status": "Queued" }
```

Erros possíveis do retry: `job.not-found`, `job.not-failed`, `job.rejected-not-retriable`,
`job.input-missing`, `profile.disabled`, `file.already-processed`, `job.path-too-long`, `job.race-lost`,
`rate-limited`.

#### O pacote de saídas assinadas

O `GET /api/jobs/archive?id=…&id=…` retorna um único `application/zip` com as saídas assinadas dos jobs
`Completed` nomeados — o que o **Baixar N selecionado(s)** da página Jobs serve.

- No máximo **50** ids distintos (duplicatas se fundem). As entradas são armazenadas sem compressão, sob
  os nomes com que `output/` as guarda — uma saída criptografada como seu envelope `.enc`, tal como está.
  Quando duas saídas têm o mesmo nome, a entrada posterior leva o id do seu job antes da última
  extensão.
- **Toda recusa é decidida antes do primeiro byte**: `400 validation.filter-invalid` (um `id` que não é
  GUID), `404 job.not-found`, `409 job.output-unavailable`, `400 job.archive-empty`,
  `400 job.archive-too-large`. Recusas sobre jobs específicos os nomeiam.
- Um job `Completed` cujo arquivo não está mais em `output/` sob o nome esperado **não** reprova o lote:
  ele é listado (id do job e nome esperado) em uma entrada `MISSING.txt` dentro do pacote. O
  `410 job.output-gone` é retornado somente quando nenhum dos jobs nomeados ainda tem seu arquivo.
- Uma leitura que falha depois de o download começar aborta a conexão, então um download falho é um
  fluxo que nenhum leitor de ZIP abre — nunca um pacote bem formado com uma entrada truncada.
- Nome de arquivo `bulksigner-signed-yyyyMMdd-HHmmss.zip` (UTC). O download não grava evento
  operacional; uma linha de log registra o operador e as contagens.

```bash
curl -o signed.zip "http://localhost:8080/api/jobs/archive?id=$ID1&id=$ID2" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

#### Exportando a lista de jobs

O `GET /api/jobs/export` retorna a lista de jobs como uma planilha `.xlsx`, uma linha por job, mais
recentes primeiro — o **Exportar para Excel** da página Jobs. Ele exporta **todo job que os filtros
admitem**, e não uma página.

- Query: `status`, `profile`, `fileName` (casamento por trecho), `from` e `to` (`yyyy-MM-dd`, dias UTC
  inclusivos) — os cinco filtros da página Jobs, aplicados pela mesma regra da página e do
  `GET /api/jobs`. Um valor que não se interpreta, ou `from` depois de `to`, é
  `400 validation.filter-invalid` nomeando-o — nunca ampliado para a tabela inteira.
- No máximo **10.000** linhas. Um bloco de título informa quem exportou, quando (com o fuso UTC do
  servidor), cada filtro em vigor, quantos jobs corresponderam e — em vermelho — se o limite cortou a
  lista.
- Colunas: nome do arquivo, formato, perfil, origem, status (no idioma de exibição do leitor), criado,
  atualizado, pasta de entrada, caminho original, total e quantidade de pagamentos CNAB240 (vazios
  quando o job não era uma remessa), saída criptografada, erro, id do job pai, id do job. Todo valor vem
  do próprio job; nenhuma linha individual de pagamento é jamais exportada.
- Nome de arquivo `jobs-yyyyMMdd-HHmmss.xlsx` (UTC). Limitado pela política `Export`. Nenhum evento
  operacional; uma linha de log registra o operador e as contagens.

```bash
curl -o jobs.xlsx "http://localhost:8080/api/jobs/export?status=Failed&from=2026-09-01" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

#### Clear Jobs

O `DELETE /api/jobs` é uma ação de manutenção do sistema — irreversível, e a mesma do **Clear Jobs** da
[página Sistema](dashboard.md#system--sistema) do dashboard. Ele apaga:

- **todo** registro de job, em qualquer status — `Queued`, retido com um aprovador, aguardando o Lacuna
  Signer, ou sendo assinado naquele momento (esse job é abandonado) — com seu histórico;
- todo arquivo que esses jobs deixaram para trás: a entrada, as pastas `processing/<id>/` e
  `error/<id>/`, e a saída assinada;
- todo evento operacional registrado antes de a limpeza começar, deixando o evento `JobsCleared` que
  esta chamada grava como o mais antigo que existe.

Estado do pipeline, perfis de assinatura, configuração e logs ficam intactos. A resposta:

```json
{
  "deleted": 1234,
  "filesDeleted": 2410,
  "foldersDeleted": 57,
  "eventsDeleted": 312,
  "itemsFailed": 0,
  "message": "…"
}
```

O `itemsFailed` conta arquivos e pastas que estavam lá e não puderam ser removidos (um arquivo com
lease, uma pasta recusada) — cada um é nomeado no log do servidor, e seus registros de job se vão de
qualquer forma. Os arquivos são varridos antes de as linhas serem tocadas, então um armazenamento
inalcançável reprova a chamada antes de qualquer registro ser apagado; uma falha do banco de dados
depois da varredura desfaz as linhas e aparece como um `500` genérico sem `code` específico — rode a
limpeza de novo. A chamada também move adiante o **marcador de reset** das estatísticas, de escopo da implantação.
Veja [Clear Jobs](operations.md#clear-jobs).

:::warning Mudou na 2.9.0 e na 2.10.0 — o Clear Jobs leva tudo
Até a 2.9.0, o Clear Jobs apagava somente jobs finalizados, deixava arquivos e eventos operacionais em
paz, e respondia `{ "deleted", "skipped", "message" }`. Agora ele apaga todo job e seus arquivos (2.9.0)
e os eventos operacionais (2.10.0). **O `skipped` não existe mais**; `filesDeleted`, `foldersDeleted`,
`itemsFailed` e `eventsDeleted` são novos. Um cliente que lia apenas `deleted` continua funcionando.
:::

### Pipeline

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/pipeline/state` | O `paused / pausedAtUtc / resumedAtUtc / pausedBy / reason` atual, mais a capacidade viva do worker. Limitado pela política `Actions`. |
| `POST` | `/api/pipeline/pause` | Retenção idempotente do worker — uma repetição enquanto já está pausado retorna `200`. Sobrevive a reinicializações. `reason` opcional. Limitado pela política `Actions`. Uma pausa e uma retomada *simultâneas* não são uma repetição: exatamente uma vence, e a outra recebe `409 pipeline.race-lost` sem ter registrado nada. |
| `POST` | `/api/pipeline/resume` | Retomada idempotente, com as mesmas regras. Limitado pela política `Actions`. |

Pausar / retomar aceitam um corpo JSON opcional `{ "reason": "…" }` (comprimento máximo imposto — acima
do limite retorna `validation.reason-too-long`):

```bash
curl -X POST "http://localhost:8080/api/pipeline/pause" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Manutenção trimestral"}'
```

Resposta de estado:

```json
{
  "paused": true,
  "pausedAtUtc": "2026-05-26T15:00:00Z",
  "resumedAtUtc": null,
  "pausedBy": "operator",
  "reason": "Manutenção trimestral",
  "maxConcurrency": 4,
  "jobsInFlight": 2,
  "jobsInFlightByFormat": {
    "pades": 1,
    "cades": 1,
    "xades": 0,
    "total": 2
  }
}
```

O `maxConcurrency` é o `Pipeline:MaxConcurrency` configurado (lido uma vez na inicialização; reinicie
para mudar). `jobsInFlight` e `jobsInFlightByFormat` contam linhas atualmente em `Processing` ou
`Verifying`. Operadores acompanhando uma drenagem após uma pausa verão `paused: true` enquanto
`jobsInFlight` decresce até `0`.

### Ações

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `POST` | `/api/rescan` | Reenfileira cada arquivo em cada pasta de entrada configurada. Aceita `?folder=<nome>` para delimitar a uma pasta. Limitado pela política `Actions`. |
| `POST` | `/api/cleanup` | Aplica a retenção a `processing/`, `output/`, `error/`. Atualmente um stub que não faz nada; veja [Retenção](retention.md). Limitado pela política `Actions`. |

```bash
# Rescan em todas as pastas configuradas
curl -X POST "http://localhost:8080/api/rescan" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

# Rescan em apenas uma pasta
curl -X POST "http://localhost:8080/api/rescan?folder=legal" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Formato da resposta do rescan:

```json
{
  "folders": [
    {
      "name": "default",
      "path": "/var/lib/bulksigner/input",
      "scanned": 4, "enqueued": 3, "alreadyActive": 0, "ignored": 1, "errors": 0, "alreadyProcessed": 0,
      "enqueuedFiles": ["a.pdf", "b.pdf", "c.xml"],
      "unassigned": false
    },
    {
      "name": "contratos",
      "path": "/srv/contratos",
      "scanned": 0, "enqueued": 0, "alreadyActive": 0, "ignored": 0, "errors": 0, "alreadyProcessed": 0,
      "enqueuedFiles": [],
      "unassigned": true
    }
  ],
  "totals": { "folders": 2, "scanned": 4, "enqueued": 3, "alreadyActive": 0, "ignored": 1, "errors": 0, "unassigned": 1, "alreadyProcessed": 0 }
}
```

- **Uma pasta que nenhum perfil de assinatura escolheu é pulada por inteiro**: sua linha carrega
  `unassigned: true` com todas as contagens em zero, e o `totals.unassigned` conta essas pastas. Não é
  erro nem `ignored` — ninguém pediu ainda para assinar a partir daquela pasta — e a chamada continua
  sendo um `200`. Escolha a pasta na página de um perfil de assinatura no dashboard, e ela passa a ser
  monitorada sem um novo rescan.
- O `alreadyProcessed` conta arquivos recusados como `file.already-processed`: cada um virou um job
  `Failed` e foi movido para `error/`.
- Arquivos recusados porque seu perfil está desativado são contados como `ignored`.
- `unassigned` e `alreadyProcessed` foram acrescentados com padrões zero/falso, então um leitor do
  formato anterior não é afetado.

Um `?folder=<nome>` desconhecido retorna `404` com `code = "folder.not-found"` e os nomes configurados
em `detail`. O `Cleanup` retorna `200 OK` enquanto o serviço de retenção for o stub nulo.

### Aprovações

Usadas somente quando um perfil de assinatura carrega uma [regra de aprovação](approvals.md).

| Método | Caminho | Autenticação | Finalidade |
|--------|---------|--------------|------------|
| `POST` | `/api/approvals/{id}` | **Anônima** | Registra a decisão de um aprovador em um job retido em `AwaitingApproval`. Atingir o quórum congelado o devolve a `Queued` e acorda o pipeline; uma única rejeição cancela o job de imediato. Limitado pela política `Approval`. Recusa toda chamada com `403 approval.second-factor-required` enquanto `ApproverSecondFactor:Enabled`, e recusa uma *aprovação* com `403 approval.signature-required` em um job cujo conjunto de assinantes congelado inclui os aprovadores. |
| `GET` | `/api/jobs/{id}/approvals` | Chave de API ou cookie | **Somente leitura.** A regra congelada, o pool congelado com a decisão de cada membro, e a lista de decisões. |

Corpo: `email` (obrigatório), `decision` (`approved` \| `rejected`, sem diferenciar maiúsculas,
**padrão `approved`**), `reason` (opcional, ≤ 512 caracteres).

```bash
curl -X POST "http://localhost:8080/api/approvals/3f2a…" \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@empresa.com.br"}'
```

```json
{ "jobId": "3f2a…", "approverName": "Maria Silva", "approved": 2, "required": 2, "outstanding": 0, "quorumMet": true, "released": true }
```

Rejeitar retorna um `200` de formato diferente — não há contagem, porque nenhuma aritmética foi
consultada:

```json
{ "jobId": "3f2a…", "approverName": "Maria Silva", "reason": "valor errado no lote 2", "terminated": true }
```

O `terminated` é falso apenas naquela corrida estreita em que um worker já havia reivindicado o job; o
pipeline então recusa a assinatura ele mesmo e o job termina `Failed` com `approval.rejected`. De
qualquer forma o arquivo não é assinado. Omitir `decision` ainda significa `approved`, então clientes
escritos antes de a rejeição existir não são afetados.

O nome e o CPF na linha registrada vêm do pool congelado, nunca do corpo da requisição — os únicos
campos que um chamador fornece são o endereço, a decisão e o motivo.

O lado de leitura retorna o pool ao lado das decisões, porque "quem decidiu" só significa algo contra
"quem poderia ter decidido". **O CPF é mascarado até seus dígitos verificadores** nos dois, e o endereço
IP e o user agent registrados deliberadamente não são reportados — eles são material de investigação
lido no host, não campos para quem quer que detenha uma chave de API. O endpoint responde também em jobs
terminais, que é quando um relatório de conformidade tem mais chance de perguntar.

Quando uma aprovação foi registrada **assinando** — em um perfil cujo conjunto de assinantes inclui os
aprovadores —, a decisão carrega um objeto `certificate`: `subject`, `issuer`, `serialNumber`,
`thumbprintSha256`, o `cpf` do certificado (mascarado como o do pool), o `cnpj` por inteiro em um
e-CNPJ, e o `cloudService` — o provedor pelo qual o certificado foi alcançado quando o aprovador assinou
em nuvem, `null` para uma assinatura feita no navegador. O `certificate` é `null` em uma decisão por
clique e em toda decisão registrada antes de as assinaturas de aprovadores existirem. Veja
[Certificados](certificates.md#o-certificado-do-aprovador).

:::danger Esta é a única rota anônima que altera estado no produto
Qualquer um que alcance a URL pode aprovar *ou rejeitar* como qualquer pessoa do pool congelado do job.
O endereço do aprovador precisa aparecer naquele pool, mas nada verifica que ele é aquela pessoa. **Não
existe rota REST que aprove atrás da chave de API**, e acrescentar uma não é uma melhoria planejada —
veja [Segurança](security.md#não-existe-endpoint-rest-de-aprovação).
:::

### Perfis

Duas rotas, ambas `GET`, e **nenhuma forma de gravar um perfil por qualquer uma delas**. Os perfis de
assinatura vivem na base operacional e são criados e editados pelo dashboard.

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/profiles` | Todo perfil de assinatura que esta implantação mantém. |
| `GET` | `/api/profiles/{name}` | Um perfil. O nome é casado sem diferenciar maiúsculas, exatamente como o `POST /api/files?profile=` o casa. `404` com `code = "profile.not-found"` para um nome que ninguém tem. |

O caso de uso é validar um nome de perfil antes de enviar um arquivo para ele, e ver quais perfis ainda
aceitam trabalho novo. As duas rotas leem o mesmo registro contra o qual o `POST /api/files` valida, então
um nome reportado aqui é um nome que um upload vai aceitar.

```bash
curl -s http://localhost:8080/api/profiles -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

```json
{
  "profiles": [
    {
      "name": "folha",
      "enabled": true,
      "inputFolder": "remessas",
      "format": "Cades",
      "method": "Local",
      "certificateSource": "Pkcs11",
      "verify": true,
      "encrypt": true,
      "validateCertificate": true,
      "checkCnab240": true,
      "checkCnab240PaymentDates": true,
      "preserveFileExtension": false,
      "saveAsPem": false,
      "approval": { "required": 2, "poolSize": 3, "expiresAfterSeconds": 172800, "signers": "ProfileKey" }
    }
  ]
}
```

- **Um perfil desativado é listado, e não escondido** — jobs históricos o nomeiam e jobs já enfileirados
  rodam até o fim. Leia o `enabled` antes de rotear trabalho novo para um perfil: a flag é imposta, e um
  upload ou uma repetição que nomeie um perfil desativado responde `409 profile.disabled`.
- **O `inputFolder`** é a pasta monitorada da qual o perfil se alimenta, pelo seu
  `Storage:Inputs[].Name`, ou `null` para um perfil alcançado somente por uploads que o nomeiam. Uma
  pasta por perfil e um perfil por pasta, então um cliente que solta arquivos em `remessas` pode
  confirmar aqui qual perfil — qual certificado e qual regra de aprovação — vai assiná-los. O
  `GET /api/folders` tem o estado da própria pasta.
- **O `checkCnab240PaymentDates`** diz se uma remessa cuja data de pagamento mais antiga já passou é
  recusada (`true`, o padrão) ou liberada para assinatura (`false`). Só importa ao lado de
  `checkCnab240 = true`.
- **Dois nulos carregam significado.** `format: null` diz que o perfil despacha pela extensão do arquivo
  (somente o perfil `default` derivado faz isso). `certificateSource: null` diz que não há certificado
  local a nomear: a chave vive no Lacuna Signer (`method: "LacunaSigner"`), ou o perfil é **sem chave**
  — seu `approval.signers` é `Approvers`, então cada aprovador assina com o próprio certificado e este
  host não detém chave nenhuma. `approval: null` diz que os jobs vão direto para o assinador.
- **O `certificateSource` nomeia a chave em vigor, e não a linha armazenada.** Um certificado é aberto
  uma vez, na inicialização, então depois que um perfil é editado de uma origem para outra esta rota
  continua reportando a origem antiga até o serviço reiniciar — a origem reportada é a que vai assinar.

Deliberadamente ausentes: os membros do pool de aprovadores (um pool é gente com nome — o
`GET /api/jobs/{id}/approvals` dá um pool delimitado a um job, com os CPFs mascarados, e o `poolSize`
aqui é uma contagem), o participante de um assinador remoto, e as coordenadas do certificado (caminhos
de arquivo, caminhos de módulo, thumbprints, endpoints de cofre). Nenhuma rota grava um perfil: uma chave
de API capaz de reescrever quem pode aprovar pagamentos seria um controle mais fraco do que o dashboard
atrás da sessão de um operador.

Erros possíveis: `profile.not-found`.

### Backup

Três rotas, e **nenhuma restauração** — restaurar um backup é um procedimento do operador, nunca uma
rota. As três exigem a política de operador; os dois `POST`s levam o orçamento `Actions`. O backup só
está disponível sob o provider SQLite; veja
[Retenção](retention.md#a-funcionalidade-de-backup-embutida--somente-sqlite).

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/backup` | A configuração, a execução em andamento se houver, o `lastSuccessAtUtc`, e as 50 execuções concluídas mais recentes. Reporta `supported: false` sob o SQL Server, separado de `enabled`. A string de destino nunca carrega uma credencial. |
| `POST` | `/api/backup` | Inicia uma execução agora. `202` com o id da execução assim que ela é admitida; consulte o `GET` para saber o resultado. |
| `POST` | `/api/backup/cancel` | Pede à execução em andamento que pare. `202` com o id da execução. |

Erros possíveis: `backup.disabled`, `backup.already-running`, `backup.not-running`, `rate-limited`.

### Eventos

O log de eventos operacionais — a trilha de auditoria do host inteiro, em que pausas e retomadas,
edições de perfil, decisões de aprovação, o Clear Jobs e o desligamento do serviço escrevem. Dois `GET`s
e nada mais: nenhuma rota apaga, edita ou exporta um evento. Ambos exigem a política de operador (um
`Administrator` do Entra incluído); a sessão de um aprovador recebe `401`. O dashboard mostra o mesmo log
na sua página `/events`.

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/events` | Uma página de eventos, mais recentes primeiro: `{ items: [{ id, timestamp, eventType, message }], page, pageSize, totalCount }`. |
| `GET` | `/api/events/types` | Os tipos de evento distintos presentes na base — os valores a passar como `eventType`. Nunca oferece um tipo sem linhas. |

Parâmetros de query do `GET /api/events`:

| Parâmetro | Observações |
|-----------|-------------|
| `eventType` | Repita-o para incluir vários tipos; omitido, todos os tipos. |
| `from`, `to` | Instantes ISO 8601, `from` inclusivo e `to` exclusivo. Um valor sem fuso é lido como UTC. |
| `contains` | Um trecho literal da mensagem — `%` e `_` não são curingas. |
| `page` | Padrão 1, no máximo 10.737.418. |
| `pageSize` | Padrão 50, limitado a 200. Uma página ou um tamanho abaixo de 1 é lido como 1. |

Recusados com `400 validation.filter-invalid`: um `from` / `to` que não se interpreta, `from` não
anterior a `to`, uma `page` ou um `pageSize` que não é número inteiro, uma `page` além do limite, e um
`eventType` informado só com espaços em branco.

```bash
# Quem pausou o pipeline este mês, e por quê
curl -s "http://localhost:8080/api/events?eventType=PipelinePaused&from=2026-09-01T00:00:00Z" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" | jq '.items[] | {timestamp, message}'
```

**As mensagens são as frases de auditoria exatamente como registradas, em inglês**, qualquer que seja o
idioma do leitor. Baseie-se no `eventType`, nunca na mensagem; o `contains` é uma busca para uma pessoa,
não um contrato para um programa. Eventos registrados antes do último **Clear Jobs** não existem mais — o
evento `JobsCleared` é então o mais antigo que há.

### Preferências

| Método | Caminho | Autenticação | Finalidade |
|--------|---------|--------------|------------|
| `POST` | `/api/culture?culture=<en-US\|pt-BR>&redirectUri=<caminho local>` | Anônima | Grava a escolha de idioma de exibição do chamador no cookie de cultura padrão do ASP.NET Core (um ano, `HttpOnly`, `SameSite=Lax`) e redireciona de volta. Qualquer coisa que não seja um caminho local recai para `/`, em vez de virar um redirecionamento aberto. Uma cultura não suportada retorna `400` com `code = "culture.not-supported"`. |

Anônima por necessidade, e não por conveniência: seu público principal é o aprovador sem credencial em
`/approve/{id}`, que precisa do seletor *antes* de se autenticar. Ela existe para o seletor de idioma do
dashboard; não há razão para um cliente programático chamá-la, e ela **não muda nada** na API — o texto
de problema, os valores de `JobStatus` no protocolo e as mensagens de auditoria são em inglês
independentemente.

### Sistema

| Método | Caminho | Autenticação | Finalidade |
|--------|---------|--------------|------------|
| `GET` | `/api/health` | Anônima | Liveness — `200 OK` se o processo do host está no ar. |
| `GET` | `/api/ready` | Anônima, a menos que `Readiness:RequireApiKey = true` | **Veredito** de readiness — `{ ready, checks: [{ name, ok }] }`. `503` se qualquer verificação que conta para o veredito falhar. Sem campo `detail`: um orquestrador lê o código de status, quem o acompanha lê qual `name` ficou vermelho, e a explicação fica na rota abaixo. |
| `GET` | `/api/ready/details` | Autorizada | O mesmo relatório com o `detail` de cada verificação, e a mesma regra de `200` / `503`. Veja [as famílias de verificação](#verificações-de-readiness) abaixo. |
| `GET` | `/api/folders` | Autorizada | Estado de execução por pasta: nome, caminho absoluto, existência, status (`Initializing` / `Running` / `Stopped` / `Unassigned`), hora do último enfileiramento, último erro, contagem de processados desde o início, contagem de arquivos (limitada a 50), e o perfil de assinatura que se alimenta da pasta como `profileName`, com seu formato declarado como `profileFormat` (`auto` para um perfil sem formato) — ambos `null` enquanto nenhum perfil escolheu a pasta. Mais um campo `instance` no nível superior, nomeando a instância que respondeu no modo cluster (`null` em uma instância única). |
| `GET` | `/api/metrics` | Autorizada quando `Metrics:RequireApiKey = true` (padrão) | Exposição Prometheus. |
| `GET` | `/api/whoami` | Autorizada | Ecoa a identidade autenticada (operador + esquema usado). |

O `/api/health` é sempre anônimo, para que verificadores de saúde externos (balanceadores de carga,
`HEALTHCHECK` do Docker, `livenessProbe` do Kubernetes) não precisem de credenciais. O `/api/ready` é
anônimo por padrão pelo mesmo motivo — o health check do Azure App Service não consegue levar uma
credencial. Leia `checks[].name` e `checks[].ok` para saber qual verificação falhou, e depois chame o
`GET /api/ready/details` com a chave para saber por quê. Ligue o `Readiness:RequireApiKey` onde a
sondagem consegue levar o `X-API-Key` (os `httpHeaders` de uma probe do Kubernetes, um agente de
monitoramento) ou onde nada sonda o host.

`Unassigned` no `/api/folders` significa que nenhum perfil de assinatura escolheu a pasta: nada a
monitora, e os arquivos ali esperam. Não é uma falha; o remédio está na página de um perfil no
dashboard. Por um momento depois de um perfil escolher uma pasta, a linha pode trazer um `profileName`
enquanto seu status ainda diz `Unassigned`; a próxima consulta os reconcilia.

:::warning Mudou na 2.6.0 — o `/api/ready` é só um veredito
O `/api/ready` anônimo trazia uma frase `detail` por verificação — juntas, um mapa da implantação (o host
do SQL Server, cada compartilhamento de entrada, a localização de um certificado) legível por qualquer um
que alcançasse a porta. Agora ele traz apenas `ready`, `name` e `ok`; o campo `detail` está ausente, e
não nulo. Um orquestrador que lê o código de status não é afetado. Um monitor que interpretava o
`detail` passa para o `GET /api/ready/details` e envia a chave de API. A mudança de veredito de uma
verificação é gravada no log durável uma vez por mudança, então o registro de uma falha transitória não
se perde.
:::

#### Verificações de readiness

As famílias de verificação, pelo `name`, como o `/api/ready/details` as explica:

- **`database`** — nomeia a base que verificou (`reachable (SQLite (data/db/bulksigner.db))`,
  `reachable (SQL Server (sqlsrv01/BulkSigner))`), nunca a connection string; uma linha vermelha traz o
  nome do tipo da exceção. O veredito é tomado por requisição, mas também fica vermelho durante a vida de
  uma instância cujo boot encontrou a base inalcançável e pulou a migração — isso se resolve no próximo
  boot.
- **`input-folder:<nome>`** — uma por pasta de entrada configurada; qualquer pasta ausente ou `Stopped`
  reprova a resposta. Uma pasta que nenhum perfil escolheu fica `ok: true`, com um detalhe dizendo que
  ela não está atribuída.
- **`storage-share:<conta>/<compartilhamento>`** e **`work-share-owner`** — somente em um
  compartilhamento de trabalho remoto. A segunda fica vermelha quando outra instância detinha o marcador
  do compartilhamento na inicialização, ou quando a reivindicação não pôde ser feita. Ambas reportam o
  que era verdade **na inicialização**, e dizem isso.
- **`signing-profile:<nome>`** — um perfil de assinatura degradado. Reporta `ok: false` **sem** reprovar
  a resposta: um `503` tiraria a instância do balanceador de carga, e a página do dashboard que corrige o
  certificado é servida por essa instância. **Alarme sobre as entradas individuais de `checks[]`**, e
  não apenas sobre o `ready` do nível superior.
- **`signing-profile-keyless:<nome>`** — um perfil cujo conjunto de assinantes é `Approvers` e que,
  portanto, não detém chave. `ok: true`, com um detalhe explicando o estado.
- **`profile-input-folder:<perfil>`** — um perfil vinculado a uma pasta de entrada que este host não
  configurou. Vermelha e, da mesma forma, não conta para o veredito.

## Métricas

O `/api/metrics` expõe os seguintes instrumentos (formato Prometheus):

| Métrica | Tipo | O que ela acompanha |
|---------|------|---------------------|
| `bulksigner_jobs_enqueued_total{folder=...}` | Counter | Cada enfileiramento bem-sucedido. O label `folder` é o `Storage:Inputs[].Name`, ou `"(upload)"` para uploads REST. |
| `bulksigner_jobs_completed_total` | Counter | Job alcançou `Completed`. |
| `bulksigner_jobs_failed_total` | Counter | Job alcançou `Failed`. |
| `bulksigner_jobs_canceled_total` | Counter | Jobs cancelados pelo operador (a partir de `Queued`, `AwaitingSigner` ou `AwaitingApproval`). |
| `bulksigner_jobs_verify_skipped_total{profile}` | Counter | Jobs cuja verificação pós-assinatura foi pulada porque seu perfil carrega `Verify = false`. Uma série diferente de zero é a postura de baixa confiança aparecendo no monitoramento, e não apenas no banner de inicialização. |
| `bulksigner_cert_validation_failed_total{profile}` | Counter | Falhas de validação de certificado antes da assinatura. Sobe quando uma cadeia deixa de validar — um certificado de assinatura expirado ou revogado se parece com isso antes de se parecer com qualquer outra coisa. |
| `bulksigner_pipeline_pause_total` | Counter | Transições de pausa. |
| `bulksigner_pipeline_resume_total` | Counter | Transições de retomada. |
| `bulksigner_pipeline_paused` | Gauge | 1 pausado / 0 rodando. |
| `bulksigner_files_encrypted_total` | Counter | Envelopes BSENC v1 escritos. |
| `bulksigner_jobs_in_flight` | Gauge | Contagem viva de `Processing` + `Verifying`. |
| `bulksigner_signing_duration_seconds{format=Pades\|Cades\|Xades}` | Histogram | Duração de assinar + verificar + promover. |
| `bulksigner_jobs_dispatched_to_signer_total{profile}` | Counter | Despachos bem-sucedidos ao Lacuna Signer, rotulados por perfil. |
| `bulksigner_jobs_awaiting_signer` | Gauge | Contagem viva de linhas `AwaitingSigner`. |
| `bulksigner_signer_poll_duration_seconds` | Histogram | Duração por tique de uma passada completa sobre as linhas `AwaitingSigner`. |
| `bulksigner_signer_api_errors_total{op}` | Counter | Erros da API do Lacuna Signer durante a consulta e o download, rotulados por operação (`poll`, `download`). |
| `bulksigner_jobs_parked_for_approval_total{profile}` | Counter | Transições `Processing → AwaitingApproval` bem-sucedidas. |
| `bulksigner_jobs_awaiting_approval` | Gauge | Contagem viva de linhas `AwaitingApproval`. Definida a partir de uma varredura, então está correta após uma reinicialização enquanto jobs ainda estão retidos. |
| `bulksigner_approvals_recorded_total{profile}` | Counter | Decisões registradas, uma por pessoa por job — aprovações **e** rejeições. A única métrica que cobre a rota de aprovação anônima como um todo, então é também como um operador percebe aquela rota sendo usada, afinal. |
| `bulksigner_approvals_rejected_total{profile}` | Counter | O subconjunto de rejeições; cada uma veta seu job. Separada de `bulksigner_jobs_canceled_total`, que conta o que um *operador* fez. |
| `bulksigner_jobs_released_by_approval_total{profile}` | Counter | Jobs retidos cujo quórum foi atingido, devolvendo-os a `Queued`. |
| `bulksigner_approvals_expired_total{profile}` | Counter | Jobs retidos cancelados porque seu orçamento de espera congelado se esgotou — a série que conta *ninguém* agindo, o que faz dela a que se deve alarmar. Fica em zero a menos que um perfil defina `Approval.ExpiresAfter`. |
| `bulksigner_jobs_content_changed_total{profile}` | Counter | Jobs recusados pela guarda de vínculo de conteúdo anterior à assinatura. **Deveria ficar em zero para sempre** — qualquer outra coisa significa que um artefato mudou entre ser medido e ser assinado. |
| `bulksigner_inputs_diverged_total{profile}` | Counter | Arquivos de entrada deixados no lugar após a assinatura porque o arquivo em disco não era mais a cópia que foi colocada em stage. **Não é uma falha** — o job concluiu e sua saída está boa. Veja [Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job). |
| `bulksigner_cnab240_payment_date_checks_skipped_total{profile}` | Counter | Remessas CNAB240 cuja data de pagamento mais antiga já havia passado e que foram liberadas porque o `CheckCnab240PaymentDates` (ou o `CheckCnab240`) do perfil está desligado. Conta decisões, e não assinaturas. Fica em zero em todo perfil que mantém a guarda ligada. |
| `bulksigner_approver_signatures_total{outcome,means}` | Counter | Tentativas de assinatura de aprovadores em jobs cujo conjunto de assinantes congelado inclui os aprovadores. `outcome` ∈ `signed`, `cpf-mismatch`, `without-cpf`, `certificate-invalid`, `signature-invalid`, `conflict`, `abandoned`, `browser-failed`, `provider-failed`; `means` ∈ `browser`, `cloud` — onde o certificado foi alcançado. Fica em zero até que o conjunto de assinantes de um perfil inclua os aprovadores. |
| `bulksigner_second_factor_verifications_total{outcome}` | Counter | Tentativas de verificação do segundo fator de aprovadores, rotuladas pelo resultado e nunca pelo aprovador. |
| `bulksigner_second_factor_enrolments_total` | Counter | Inscrições de autenticador confirmadas. Sobe de novo depois que um operador redefine o fator de um aprovador. |
| `bulksigner_backup_runs_total{result}` | Counter | Execuções de backup do banco de dados que terminaram, rotuladas `Succeeded` / `Failed` / `Canceled`. |
| `bulksigner_backup_duration_seconds` | Histogram | Duração de relógio de uma execução de backup bem-sucedida. |
| `bulksigner_backup_last_size_bytes` | Gauge | Tamanho do artefato de backup mais recente que esta instância armazenou. |
| `bulksigner_backup_last_success_timestamp_seconds` | Gauge | Timestamp Unix do último backup que este processo concluiu; `0` até ele concluir um. Alarme com `bulksigner_backup_last_success_timestamp_seconds > 0 and time() - bulksigner_backup_last_success_timestamp_seconds > 172800`. |
| `bulksigner_backup_prune_failures_total` | Counter | Execuções que armazenaram seu artefato, mas não conseguiram apagar os mais antigos no destino. |
| `bulksigner_log_sink_outages_total` | Counter | Indisponibilidades do sink de log em tabela do Azure — incrementado uma vez quando as gravações começam a falhar, e não por lote falho. É como um operador descobre que o sink caiu. |
| `bulksigner_log_sink_dropped_total` | Counter | Eventos de log descartados porque a fila do sink em tabela estava cheia. Diferente de zero significa que o log na tabela tem buracos. |

:::warning Mudou na 2.7.0 — `bulksigner_approver_signatures_total` ganhou um label `means`
Acrescentar o label muda a identidade da série para quem coleta o contador; uma consulta escrita apenas
contra o label `outcome` deve agregar com `sum by (outcome)`.
:::

Uma configuração mínima de coleta do Prometheus (assumindo que o coletor está dentro do perímetro de
confiança e `Metrics:RequireApiKey = false`):

```yaml
scrape_configs:
  - job_name: bulksigner
    static_configs:
      - targets: ['bulksigner:8080']
    metrics_path: /api/metrics
```

Quando `Metrics:RequireApiKey = true`, defina a chave de API no coletor. O Prometheus suporta
`authorization`/`basic_auth`; para o cabeçalho `X-API-Key`, use um proxy reverso sidecar que injete o
cabeçalho, ou defina `Metrics:RequireApiKey = false` depois de fechar a rede.

## Referência ao vivo

A UI de referência OpenAPI é servida em `http://<host>:8080/scalar/v1`. Ela carrega o esquema canônico
de cada endpoint, inclusive os formatos de requisição/resposta e as listas de parâmetros de query. Se um
cliente programático precisar de algo não coberto aqui, a referência ao vivo é a próxima parada.

---

**A seguir:** [Criptografia](encryption.md) — criptografia pós-assinatura opcional.
**Anterior:** [Telemetria](telemetry.md).
