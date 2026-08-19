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

Endpoints anônimos:

- `GET  /api/health`
- `GET  /api/ready`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/culture` (preferência de idioma de exibição)
- `GET  /login` (dashboard, layout anônimo)
- `POST /api/approvals/{id}` e `GET /approve/{id}` — **somente quando um perfil de assinatura carrega um
  [bloco `Approval`](approvals.md).** A única rota anônima que altera estado no produto, anônima por
  decisão explícita. Veja
  [Segurança](security.md#a-página-de-aprovação-por-job-não-é-autenticada).

Todo outro endpoint exige autenticação.

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
reformulado ou traduzido. O inventário completo:

| Código | Status típico | O que significa |
|--------|---------------|-----------------|
| `job.not-found` | 404 | Nenhum job com o id informado. |
| `job.not-queued` | 409 | Cancelamento tentado em um job que não está mais `Queued` (jobs em andamento são sagrados). |
| `job.race-lost` | 409 | O worker pegou o job antes de a ação ser confirmada; tente de novo. |
| `job.not-failed` | 409 | Repetição tentada em um job que não está no estado `Failed`. |
| `job.input-missing` | 409 | Repetição tentada, mas o arquivo de entrada original não está mais em disco. |
| `job.output-unavailable` | 404 | Download de saída solicitado em um job que ainda não tem saída (não concluído). |
| `job.output-gone` | 404 | Download de saída solicitado, mas o arquivo está ausente de `output/`. |
| `job.already-processing` | 409 | O upload conflitou com um job ativo para o mesmo arquivo em disco. |
| `job.path-too-long` | 400 | O caminho do arquivo excede 850 caracteres, então não pôde ser registrado. Recusado **no momento em que o arquivo é recebido** — por upload ou por um observador — em vez de aceito e reprovado depois, em todo provider de banco de dados. Reduza o aninhamento de diretórios ou o nome do arquivo. |
| `upload.empty` | 400 | O campo multipart `file` está ausente ou tem zero bytes. |
| `upload.too-large` | 413 | O upload excede `Upload:MaxBytes`. |
| `upload.invalid-name` | 400 | A parte multipart `file` não tem cabeçalho `filename`. |
| `upload.format-unsupported` | 400 | O valor de `?format=…` não é um formato de assinatura reconhecido. |
| `validation.reason-too-long` | 400 | Um campo `reason` em pausa/cancelamento excede o comprimento máximo. |
| `validation.filter-invalid` | 400 | Um filtro de query string (por exemplo, `?status=…`) não é um valor reconhecido. |
| `auth.misconfigured` | 401 | `Auth:ApiKey` está vazia em tempo de execução — corrija a configuração, não a requisição. |
| `auth.invalid-credentials` | 401 | Chave de API errada ou cookie expirado. |
| `folder.not-found` | 404 | O `POST /api/rescan?folder=<nome>` nomeou uma pasta que não está em `Storage:Inputs[]`. |
| `profile.not-found` | 400 | O `POST /api/files?profile=<nome>` nomeou um perfil que não está em `Signing:Profiles[]`. |
| `signer.document-rejected` | — | Auditado no job falho. Definido quando o Lacuna Signer reporta o documento como `Refused`, `Expired` ou `Canceled`. |
| `signer.timeout` | — | Auditado no job falho. Definido quando uma linha `AwaitingSigner` excede `Signer:TimeoutHours`. |
| `signer.unreachable` | — | Auditado no job falho. Definido quando a API do Lacuna Signer retornou um erro permanente (por exemplo, chave de API inválida). |
| `cnab240.invalid` | — | Auditado no job falho. O arquivo não era uma remessa do Banco do Brasil em conformidade. Veja [CNAB240](cnab240.md#quando-um-arquivo-é-recusado). |
| `cnab240.payment-date-passed` | — | Auditado no job falho. A data de pagamento mais antiga da remessa está no passado. Reexporte com datas atuais; repetir o mesmo arquivo falha de forma idêntica. |
| `approval.not-required` | 404 | `GET /api/jobs/{id}/approvals` em um job que nunca ficou retido. Distinto de um job retido sobre o qual ninguém decidiu, que é `200` com uma lista vazia. |
| `approval.not-pending` | 409 | O job não aceita decisão em seu status atual. |
| `approval.unknown-approver` | 403 | O endereço não está no pool congelado do job — também retornado para um endereço malformado, deliberadamente. |
| `approval.already-decided` | 409 | Este aprovador já decidiu; decisões são finais. |
| `approval.unknown-decision` | 400 | O `decision` estava presente e não era nem `approved` nem `rejected`. |
| `approval.second-factor-required` | 403 | `ApproverSecondFactor:Enabled` está ligado, o que **retira o `POST /api/approvals/{id}` por completo** — toda chamada recusa e nenhum cabeçalho, chave ou campo de corpo a satisfaz, porque somente uma sessão de navegador pode carregar uma presença comprovada. Decidir passa para o portal do aprovador; o `GET /api/jobs/{id}/approvals` não é afetado. Veja [Aprovações](approvals.md#provando-que-é-você). |
| `approval.job-incomplete` | 500 | O job está retido, mas sua regra congelada ou seu hash de conteúdo está faltando — a linha foi modificada fora da aplicação. |
| `approval.rejected` | — | Auditado no job falho. Uma rejeição chegou depois de um worker já ter reivindicado o job, então o pipeline recusou a assinatura. |
| `approval.content-changed` | — | Auditado no job falho. A cópia em stage mudou entre ser aprovada e ser assinada. **Não deveria jamais ser vista.** |
| `job.input-diverged` | — | Auditado no job *concluído*, e não é uma falha. O arquivo de entrada foi reescrito durante o job, então foi deixado no lugar em vez de apagado. Veja [Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job). |
| `culture.not-supported` | 400 | O `POST /api/culture` nomeou uma cultura diferente de `en-US` ou `pt-BR`. |
| `rate-limited` | 429 | Limite de janela fixa por IP excedido. |
| `internal` | 500 | 500 gerado pelo framework (nenhum código de negócio envolvido). |

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
| `Actions` | 60 / 60 s | `POST /api/jobs/{id}/retry`, `POST /api/jobs/{id}/cancel`, `DELETE /api/jobs`, `POST /api/pipeline/pause`, `POST /api/pipeline/resume`, `GET /api/pipeline/state`, `POST /api/rescan`, `POST /api/cleanup` |
| `Approval` | 10 / 60 s | `POST /api/approvals/{id}` — seu próprio orçamento, separado das ações de operador, porque a rota é anônima. Ids de job são GUIDs v4, e é isto que os mantém inadivinháveis contra uma máquina, e não contra uma pessoa. |
| `Export` | — | `GET /approvals/export/{list}` — a exportação para Excel do portal do aprovador. Limita a rapidez com que cópias de uma fila podem ser feitas. |

Respostas acima do limite são `429 Too Many Requests` com `code = "rate-limited"` e um cabeçalho
`Retry-After`.

## Grupos de endpoints

### Autenticação

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `POST` | `/api/auth/login` | POST de formulário. Troca uma chave de API por um cookie de sessão. Anônimo. |
| `POST` | `/api/auth/logout` | Limpa o cookie e redireciona para `/login`. |

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
| `POST` | `/api/files` | Upload multipart de um arquivo para assinatura. Limitado pela política `Upload`. |

Parâmetros de query:

| Parâmetro | Tipo | Observações |
|-----------|------|-------------|
| `format` | enum | Override opcional (`Pades`, `Cades`, `Xades`). Padrão: detecção automática pela extensão. |
| `profile` | string | Opcional. Nomeia uma entrada em `Signing:Profiles[]`. Nulo/omitido recai para o perfil `default`. Nomes desconhecidos retornam `400` com `code = "profile.not-found"`. |

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

Erros possíveis: `upload.empty`, `upload.too-large`, `upload.invalid-name`,
`upload.format-unsupported`, `profile.not-found`, `job.already-processing`, `rate-limited`.

### Jobs

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/jobs` | Lista jobs, mais recentes primeiro. Query: `status`, `profile`, `page`, `pageSize` (máx. 200). |
| `GET` | `/api/jobs/{id}` | Um job + seu histórico. |
| `GET` | `/api/jobs/{id}/output` | Transmite a saída assinada (e possivelmente criptografada). Nome de arquivo `.enc` quando criptografada. |
| `POST` | `/api/jobs/{id}/retry` | Cria um novo job com a mesma entrada e `ParentJobId = {id}`. Válido somente quando o job de origem está `Failed`. Limitado pela política `Actions`. |
| `POST` | `/api/jobs/{id}/cancel` | Cancela um job `Queued`, `AwaitingSigner` **ou** `AwaitingApproval`. Jobs locais em andamento retornam `409` com `code = "job.not-queued"`. Limitado pela política `Actions`. |
| `GET` | `/api/jobs/{id}/approvals` | **Somente leitura.** O registro de aprovação do job: a regra congelada, o pool congelado com a decisão de cada membro, e a lista de decisões. `404` com `approval.not-required` em um job que nunca ficou retido. |
| `DELETE` | `/api/jobs` | **Destrutivo.** Apaga cada registro de job **finalizado** e seu histórico; jobs `Queued`, retidos e em andamento sobrevivem. Retorna `{"deleted": N, "skipped": M, "message": "…"}` — um script que limpa e depois espera uma tabela vazia precisa antes drenar ou cancelar os jobs não finalizados. Deixa intocados eventos, arquivos e configuração. Limitado pela política `Actions`. Veja [Clear Jobs](operations.md#clear-jobs). |

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
`{ id, timestamp, status, message }` (uma por transição de estado) e — somente na representação de
**detalhe**, nunca nas linhas de lista — dois objetos que são `null` em jobs a que não se aplicam:

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
    "expiresAfterSeconds": 172800
  }
}
```

- O `totalCentavos` é o inteiro autoritativo — divida por 100 para exibir. O `totalFormatted` é
  fornecido para que um relatório concorde com o console do operador sem reimplementar a formatação de
  moeda brasileira. As linhas individuais de pagamento **não** são expostas por REST — veja
  [CNAB240](cnab240.md#o-que-a-api-rest-retorna).
- Todo número em `approval` é a regra **congelada no job**, nunca a que está atualmente no
  `appsettings.json`. `approved` e `rejected` contam pessoas distintas, não linhas.
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

### Pipeline

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/pipeline/state` | O `paused / pausedAtUtc / resumedAtUtc / pausedBy / reason` atual, mais a capacidade viva do worker. Limitado pela política `Actions`. |
| `POST` | `/api/pipeline/pause` | Retenção idempotente do worker. Sobrevive a reinicializações. `reason` opcional. Limitado pela política `Actions`. |
| `POST` | `/api/pipeline/resume` | Retomada idempotente. Limitado pela política `Actions`. |

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
      "scanned": 4, "enqueued": 3, "alreadyActive": 0, "ignored": 1, "errors": 0,
      "enqueuedFiles": ["a.pdf", "b.pdf", "c.xml"]
    }
  ],
  "totals": { "folders": 1, "scanned": 4, "enqueued": 3, "alreadyActive": 0, "ignored": 1, "errors": 0 }
}
```

Um `?folder=<nome>` desconhecido retorna `404` com `code = "folder.not-found"` e os nomes configurados
em `detail`. O `Cleanup` retorna `200 OK` enquanto o serviço de retenção for o stub nulo.

### Aprovações

Presentes somente quando um perfil de assinatura carrega um [bloco `Approval`](approvals.md).

| Método | Caminho | Autenticação | Finalidade |
|--------|---------|--------------|------------|
| `POST` | `/api/approvals/{id}` | **Anônima** | Registra a decisão de um aprovador em um job retido em `AwaitingApproval`. Atingir o quórum congelado o devolve a `Queued` e acorda o pipeline; uma única rejeição cancela o job de imediato. Limitado pela política `Approval`. |
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

:::danger Esta é a única rota anônima que altera estado no produto
Qualquer um que alcance a URL pode aprovar *ou rejeitar* como qualquer pessoa do pool congelado do job.
O endereço do aprovador precisa aparecer naquele pool, mas nada verifica que ele é aquela pessoa. **Não
existe rota REST que aprove atrás da chave de API**, e acrescentar uma não é uma melhoria planejada —
veja [Segurança](security.md#não-existe-endpoint-rest-de-aprovação).
:::

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
| `GET` | `/api/ready` | Anônima | Readiness — corpo JSON listando as sondagens de base operacional / por pasta / licença. `503` se qualquer sondagem falhar. A verificação `database` nomeia a base que verificou (`reachable (SQLite (data/db/bulksigner.db))`, `reachable (SQL Server (sqlsrv01/BulkSigner))`) e nunca carrega a connection string. Cada pasta de entrada configurada aparece como sua própria verificação `input-folder:<nome>`. Em um compartilhamento de trabalho remoto, duas outras famílias aparecem: uma linha `storage-share:<conta>/<compartilhamento>` por compartilhamento, e uma única linha `work-share-owner` que fica vermelha quando outra instância detinha o marcador na inicialização. Ambas reportam o que era verdade **na inicialização**, e dizem isso. |
| `GET` | `/api/folders` | Autorizada | Estado de execução por pasta: nome, caminho absoluto, existência, status, hora do último enfileiramento, último erro, contagem de processados desde o início, contagem de arquivos (limitada a 50). |
| `GET` | `/api/metrics` | Autorizada quando `Metrics:RequireApiKey = true` (padrão) | Exposição Prometheus. |
| `GET` | `/api/whoami` | Autorizada | Ecoa a identidade autenticada (operador + esquema usado). |

O `/api/health` é sempre anônimo, para que verificadores de saúde externos (balanceadores de carga,
`HEALTHCHECK` do Docker, `livenessProbe` do Kubernetes) não precisem de credenciais. O `/api/ready` é
anônimo e retorna um corpo estruturado — examine o corpo para saber qual sondagem falhou.

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
| `bulksigner_signer_api_errors_total{op}` | Counter | Erros da API do Lacuna Signer, rotulados por operação. |
| `bulksigner_jobs_parked_for_approval_total{profile}` | Counter | Transições `Processing → AwaitingApproval` bem-sucedidas. |
| `bulksigner_jobs_awaiting_approval` | Gauge | Contagem viva de linhas `AwaitingApproval`. Definida a partir de uma varredura, então está correta após uma reinicialização enquanto jobs ainda estão retidos. |
| `bulksigner_approvals_recorded_total{profile}` | Counter | Decisões registradas, uma por pessoa por job — aprovações **e** rejeições. A única métrica que cobre a rota de aprovação anônima como um todo, então é também como um operador percebe aquela rota sendo usada, afinal. |
| `bulksigner_approvals_rejected_total{profile}` | Counter | O subconjunto de rejeições; cada uma veta seu job. Separada de `bulksigner_jobs_canceled_total`, que conta o que um *operador* fez. |
| `bulksigner_jobs_released_by_approval_total{profile}` | Counter | Jobs retidos cujo quórum foi atingido, devolvendo-os a `Queued`. |
| `bulksigner_approvals_expired_total{profile}` | Counter | Jobs retidos cancelados porque seu orçamento de espera congelado se esgotou — a série que conta *ninguém* agindo, o que faz dela a que se deve alarmar. Fica em zero a menos que um perfil defina `Approval.ExpiresAfter`. |
| `bulksigner_jobs_content_changed_total{profile}` | Counter | Jobs recusados pela guarda de vínculo de conteúdo anterior à assinatura. **Deveria ficar em zero para sempre** — qualquer outra coisa significa que um artefato mudou entre ser medido e ser assinado. |
| `bulksigner_inputs_diverged_total{profile}` | Counter | Arquivos de entrada deixados no lugar após a assinatura porque o arquivo em disco não era mais a cópia que foi colocada em stage. **Não é uma falha** — o job concluiu e sua saída está boa. Veja [Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job). |

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
