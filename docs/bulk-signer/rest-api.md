---
sidebar_label: "API REST"
sidebar_position: 10
---

# API REST

O Lacuna Bulk Signer expõe um pequeno conjunto de endpoints REST ao lado do dashboard do operador. Esta
página trata da autenticação, do envelope de erro, do limite de requisições (rate limiting) e do que cada
grupo de endpoints faz, com exemplos em curl dos formatos mais comuns.

:::tip
A **referência OpenAPI ao vivo**, com os esquemas completos de requisição/resposta, é servida em
`/scalar/v1` enquanto o serviço está em execução. Esta página é o guia conceitual; a referência ao vivo é
a fonte oficial para os detalhes de cada campo.
:::

## Autenticação

Dois esquemas compartilham uma política de autorização:

| Esquema | Header / cookie | Emitido via | Usado por |
|---------|-----------------|-------------|-----------|
| Chave de API | `X-API-Key: <chave>` (nome do header definido em `Auth:ApiKeyHeader`) | Definida em `Auth:ApiKey` (configuração ou variável de ambiente) | Clientes programáticos |
| Cookie | `Cookie: lbs-auth=<token>` (nome de `Auth:CookieName`) | Envio do formulário `POST /api/auth/login` | Operadores / dashboard |

A comparação da chave de API é feita em tempo constante. Os dois esquemas atendem à mesma política em
todos os endpoints protegidos. Veja [Segurança](security.md) para rotação e ACLs.

As páginas do aprovador (o portal do aprovador e a exportação dele para Excel) usam sessões de
navegador próprias — o cookie do link do aprovador, ou um login pelo Microsoft Entra com a role
`Approver` — e essas sessões **nunca** atendem à política de operador: um aprovador não é um
operador.

Endpoints anônimos:

- `GET  /api/health`
- `GET  /api/ready` — somente o **veredito** de readiness, com o `name` e o `ok` de cada verificação. O
  detalhamento fica no `GET /api/ready/details`, que exige autenticação, e o `Readiness:RequireApiKey`
  coloca o próprio veredito atrás da chave onde o probe consegue enviar um header. Veja [Sistema](#sistema).
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/entra-login` (inicia um login pelo Microsoft Entra; responde apenas com um redirecionamento)
- `POST /api/culture` (preferência de idioma de exibição)
- `GET  /login` (dashboard, layout anônimo)
- `GET  /branding/customer-logo` (o logo do cliente nas páginas de login e do aprovador; `404` com
  `branding.customer-logo-not-available` quando não há logo configurado ou ele não foi carregado)
- `GET  /approvals/link/{token}` — a troca de link do portal do aprovador: anônima porque o link *é* a
  credencial.
- `POST /api/approvals/{id}` e `GET /approve/{id}` — usados somente quando um perfil de assinatura tem
  uma [regra de aprovação](approvals.md). É a única rota anônima que altera estado no produto, anônima por
  decisão explícita. Veja
  [Segurança](security.md#a-página-de-aprovação-por-job-não-é-autenticada).

Uma rota de navegador não é anônima nem REST: `GET /approvals/cloud/return`, para onde um provedor de
certificados em nuvem devolve o navegador de um aprovador depois de uma assinatura em nuvem. Ela exige a
sessão do aprovador (nunca uma chave de API), registra a aprovação assinada na própria requisição,
responde apenas com um redirecionamento e compartilha a cota `Approval` descrita abaixo.

Todos os demais endpoints exigem autenticação. Nenhuma rota anônima fornece dados de job.

Quando o [login pelo Microsoft Entra ID](configuration.md#authentraid--login-opcional-pelo-microsoft-entra-id)
está configurado, o `POST /api/auth/login` não emite cookie nem mesmo para uma chave correta, e a política
de operador exige a app role `Administrator`. **O `X-API-Key` não é afetado** — uma automação não consegue
fazer login interativo, então os clientes programáticos nem percebem esse modo.

## Envelope de erro

Toda resposta de erro é um corpo `ProblemDetails` (RFC 9457) com um slug estável, legível por máquina, na
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
reformulado ou traduzido. O inventário completo (status `—` significa que o código nunca aparece em uma
resposta HTTP: ele é registrado no job ou mostrado na página de um aprovador):

| Código | Status típico | O que significa |
|--------|---------------|-----------------|
| `job.not-found` | 404 | Nenhum job com o id informado. |
| `job.not-queued` | 409 | Tentativa de cancelar um job que não está mais `Queued` (jobs em andamento são intocáveis). |
| `job.race-lost` | 409 | O worker pegou o job antes de a ação ser confirmada; tente de novo. |
| `job.not-failed` | 409 | Nova tentativa pedida para um job que não está no estado `Failed`. |
| `job.rejected-not-retriable` | 409 | Nova tentativa pedida para um job que um aprovador rejeitou. Um veto não é uma falha a ser recuperada; o arquivo foi devolvido a `output/` com `.reject` no nome. |
| `job.input-missing` | 409 | Nova tentativa pedida, mas o arquivo de entrada original não está mais em disco. |
| `job.output-unavailable` | 409 | Download da saída solicitado para um job que não está `Completed`. Na rota do pacote, pelo menos um dos jobs informados não está `Completed`; o `detail` indica cada um. |
| `job.output-gone` | 410 | O job está `Completed`, mas seu arquivo não está mais em `output/` com o nome que as regras de nomenclatura *atuais* do perfil produzem — foi movido, ou ainda está lá com um nome anterior porque `PreserveFileExtension` ou `SaveAsPem` mudou depois da conclusão do job. Na rota do pacote, é retornado somente quando *nenhum* dos jobs informados ainda tem seu arquivo. |
| `job.archive-empty` | 400 | A rota do pacote foi chamada sem nenhum `id`. |
| `job.archive-too-large` | 400 | A rota do pacote recebeu mais de 50 jobs distintos. Divida a seleção. |
| `job.already-processing` | 409 | O upload conflitou com um job ativo para o mesmo arquivo em disco. |
| `file.already-processed` | 409 | Um job `Completed` ou ainda ativo já tem este nome de arquivo (comparação em todo o host, sem diferenciar maiúsculas de minúsculas). O `POST /api/files` responde `409` e não armazena nada; uma nova tentativa de um job que falhou com este código também responde `409`. Vindo de uma pasta monitorada ou de uma nova varredura, o arquivo vira um job `Failed` com este código e é movido para `error/`. A solução é excluir o job que detém o nome pela página `/jobs` do dashboard (não há rota REST para isso) ou renomear o arquivo. Controlado por `Pipeline:RejectAlreadyProcessedFileNames`. |
| `job.path-too-long` | 400 / 409 | O caminho do arquivo excede 850 caracteres, então nenhum job foi criado. O `POST /api/files` responde `400`; uma nova tentativa de uma linha gravada antes da existência do limite responde `409`; uma pasta monitorada ou uma nova varredura informam o erro no console e no log. O arquivo é recusado **no momento em que é recebido**, em vez de ser aceito e falhar depois, em qualquer provider de banco de dados. Reduza o aninhamento de diretórios ou encurte o nome do arquivo — tentar de novo com o mesmo caminho não muda nada. |
| `job.input-held` | — | Registrado no job com falha. Outro processo mantinha um lease exclusivo sobre o arquivo de entrada quando o pipeline foi preparar a cópia — na prática, uma segunda instância monitorando a mesma pasta do Azure Files. Nada foi assinado e o arquivo fica intocado. |
| `job.input-diverged` | — | Registrado no job *concluído*, e não é uma falha. O arquivo de entrada foi reescrito durante o job, então foi deixado no lugar em vez de ser apagado. Veja [Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job). |
| `upload.disabled` | 409 | Este host não recebe uploads: [`Upload:Enabled`](configuration.md#upload) é `false`. A resposta sai antes de o perfil ser resolvido, então não revela nada sobre quais perfis existem. Só uma mudança de configuração seguida de reinicialização religa os uploads; pastas monitoradas, nova varredura e nova tentativa não são afetadas. |
| `upload.empty` | 400 | O campo multipart `file` está ausente ou tem zero bytes. |
| `upload.too-large` | 413 | O upload excede `Upload:MaxBytes`. |
| `upload.invalid-name` | 400 | A parte multipart `file` não tem o header `filename`. |
| `upload.format-unsupported` | 400 | O valor de `?format=…` não é um formato de assinatura reconhecido. |
| `validation.reason-too-long` | 400 | Um campo `reason` em pausa/cancelamento excede o comprimento máximo. |
| `validation.filter-invalid` | 400 | Um valor da query string não é aceito: um valor de filtro não reconhecido (por exemplo, `?status=…`), uma data que não pode ser interpretada, uma `page` além do limite, um `id` do pacote que não é um GUID. O `detail` indica o valor. Um filtro inválido é recusado, e nunca ampliado para a tabela inteira. |
| `auth.misconfigured` | 401 | `Auth:ApiKey` está vazia em tempo de execução — corrija a configuração, não a requisição. |
| `auth.invalid-credentials` | 401 | Chave de API errada ou cookie expirado. |
| `folder.not-found` | 404 | O `POST /api/rescan?folder=<nome>` indicou uma pasta que não está em `Storage:Inputs[]`. |
| `profile.not-found` | 400 / 404 | Um nome que não corresponde a nenhum perfil. O `POST /api/files?profile=<nome>` responde `400` (o nome é um parâmetro de uma requisição para criar um job); o `GET /api/profiles/{name}` responde `404` (o perfil *é* o recurso). O `GET /api/profiles` lista os nomes que existem. |
| `profile.disabled` | 409 | O perfil existe, mas um operador deixou de rotear trabalho novo para ele. O `POST /api/files?profile=<nome>` e o `POST /api/jobs/{id}/retry` respondem `409`. Uma nova varredura continua respondendo `200` e conta os arquivos recusados como `ignored`. **Jobs já enfileirados no perfil rodam até o fim.** Reative o perfil pela página dele no dashboard ou roteie o trabalho para outro lugar. |
| `profile.degraded` | — | Registrado no job com falha. O perfil do job existe, mas não consegue assinar — seu certificado não pôde ser aberto na inicialização, ou seus segredos armazenados não puderam ser decifrados. O motivo está no histórico do job e na página do perfil. A solução termina em uma **reinicialização**, e não em tentar o job de novo ou mexer no arquivo; todos os outros perfis continuam assinando. Veja [Certificados](certificates.md). |
| `profile.key-unavailable` | — | Registrado no job com falha. O job foi congelado para ser assinado com a chave do perfil, mas a regra de aprovação do perfil passou desde então a exigir só assinaturas dos aprovadores, e esta instância não tem chave para ele. Tente de novo em uma instância que ainda tenha a chave, ou reverta a regra e reinicie. |
| `pipeline.race-lost` | 409 | Uma pausa ou retomada concorrente foi confirmada primeiro, então esta não gravou nada. Consulte o `GET /api/pipeline/state` e tente de novo se a intenção ainda for válida. |
| `signer.document-rejected` | — | Registrado no job com falha. Definido quando o Lacuna Signer informa o documento como `Refused`, `Expired` ou `Canceled`. |
| `signer.timeout` | — | Registrado no job com falha. Definido quando uma linha `AwaitingSigner` excede `Signer:TimeoutHours`. |
| `signer.unreachable` | — | Registrado no job com falha. Definido quando a API do Lacuna Signer retornou um erro permanente (por exemplo, chave de API inválida). |
| `cnab240.invalid` | — | Registrado no job com falha. O arquivo não era uma remessa em conformidade com o layout do Banco do Brasil. Veja [CNAB240](cnab240.md#quando-um-arquivo-é-recusado). |
| `cnab240.payment-date-passed` | — | Registrado no job com falha. A data de pagamento mais antiga da remessa está no passado. Exporte a remessa de novo com datas atuais; tentar de novo o mesmo arquivo falha da mesma forma. Nunca é definido em um perfil com `CheckCnab240PaymentDates = false`, no qual um arquivo assim é assinado. Veja [CNAB240](cnab240.md#datas-de-pagamento-que-já-passaram). |
| `approval.not-required` | 404 | `GET /api/jobs/{id}/approvals` em um job que nunca ficou retido. Diferente de um job retido sobre o qual ninguém decidiu, que responde `200` com uma lista vazia. |
| `approval.not-pending` | 409 | O job não aceita decisão em seu status atual. |
| `approval.unknown-approver` | 403 | O endereço não está no pool congelado do job — também retornado, deliberadamente, para um endereço malformado. |
| `approval.already-decided` | 409 | Este aprovador já decidiu; decisões são finais. |
| `approval.unknown-decision` | 400 | O `decision` estava presente e não era nem `approved` nem `rejected`. |
| `approval.signature-required` | 403 | Uma aprovação em um job cujo conjunto de assinantes congelado inclui os aprovadores: nesse caso, aprovar significa **coassinar o arquivo de pagamento** com o certificado do próprio aprovador, o que esta rota não tem como transportar. Uma rejeição em um job assim continua sendo aceita aqui. A aprovação em si é feita pelo portal do aprovador ou pela página do job. |
| `approval.second-factor-required` | 403 | `ApproverSecondFactor:Enabled` está ligado, o que **desativa o `POST /api/approvals/{id}` por completo** — toda chamada é recusada, e nenhum header, chave ou campo do corpo resolve isso, porque somente uma sessão de navegador pode comprovar a presença do aprovador. As decisões passam para o portal do aprovador; o `GET /api/jobs/{id}/approvals` não é afetado. Veja [Aprovações](approvals.md#provando-que-é-você). |
| `approval.job-incomplete` | 500 | O job está retido, mas sua regra congelada ou seu hash de conteúdo está faltando — a linha foi modificada fora da aplicação. |
| `approval.rejected` | — | Registrado no job com falha. Uma rejeição chegou depois de um worker já ter reivindicado o job, então o pipeline recusou a assinatura. |
| `approval.content-changed` | — | Registrado no job com falha. A cópia preparada mudou entre a aprovação e a assinatura. **Isso nunca deveria aparecer.** |
| `approval.content-unmeasured` | — | Registrado no job com falha. O perfil tem uma regra de aprovação, mas o job não tem hash de conteúdo — a verificação CNAB240 do perfil estava desligada, então nada interpretou o arquivo. Um job retido sem hash nunca poderia ser decidido, por isso ele falha com um código próprio. |
| `approval.signer-set-unsupported` | — | Registrado no job com falha. O conjunto de assinantes congelado não pode ser produzido para este job — por exemplo, assinaturas de aprovadores em um job cujo formato não é CAdES, ou a chave do perfil junto com os aprovadores em um perfil que assina pelo Lacuna Signer. O job nunca é assinado com a chave do perfil como alternativa. |
| `approval.signatures-missing` | — | Registrado no job com falha. O conjunto de assinantes congelado exige as assinaturas dos aprovadores, e elas não estão lá para serem promovidas. |
| `approval.certificate-invalid`, `approval.certificate-without-cpf`, `approval.certificate-cpf-mismatch`, `approval.signature-invalid`, `approval.signature-conflict` | — | Mostrados a um aprovador que está assinando uma aprovação, nunca retornados por uma rota. O certificado falhou na verificação completa; não contém CPF; contém um CPF diferente do que foi congelado para aquele aprovador; a assinatura não passou na validação; um colega assinou primeiro (comece de novo). Veja [Certificados](certificates.md#o-certificado-do-aprovador). |
| `approval.second-factor-invalid-code`, `approval.second-factor-locked-out` | — | Mostrados no campo de código do portal do aprovador: um código que não confere (ou que já foi usado) e cinco códigos errados seguidos, que bloqueiam o cadastro daquele aprovador por cinco minutos. |
| `backup.disabled` | 409 | `POST /api/backup` em uma implantação que não faz backup: `Backup:Enabled` está desligado, ou o provider de banco de dados é o SQL Server, no qual o backup fica a cargo da política do seu próprio SGBD. |
| `backup.already-running` | 409 | Só um backup é executado por vez em cada instância. |
| `backup.not-running` | 409 | `POST /api/backup/cancel` sem nada em andamento. |
| `branding.customer-logo-not-available` | 404 | `GET /branding/customer-logo` sem logo configurado, ou com um logo que não foi carregado na inicialização. |
| `culture.not-supported` | 400 | O `POST /api/culture` nomeou uma cultura diferente de `en-US` ou `pt-BR`. |
| `rate-limited` | 429 | Limite de janela fixa por IP excedido. |
| `internal` | 500 | 500 gerado pelo framework (nenhum código de negócio envolvido). |

:::note Correção — as recusas de download são 409 e 410
Edições anteriores desta página documentavam `job.output-unavailable` e `job.output-gone` como `404`.
A rota sempre respondeu `409` e `410`; somente `job.not-found` é um `404`. Baseie-se no `code`, e não no
status.
:::

Em `Production`, o personalizador de erros remove `detail`, `instance` e qualquer extensão que não seja
`code`, `traceId`, `requestId` ou `errors`. Nenhum stack trace vaza. Em `Development`, os detalhes
completos são retornados.

Um valor de `code` nunca é renomeado nem reaproveitado — novos códigos são apenas acrescentados, então
um cliente que se baseia no `code` não é afetado por atualizações.

## Limite de requisições

Limitadores de janela fixa por IP, configurados em `RateLimiting:` (veja
[Configuração](configuration.md#ratelimiting)). Quatro políticas:

| Política | Padrão | Endpoints |
|----------|--------|-----------|
| `Upload` | 30 / 60 s | `POST /api/files` |
| `Actions` | 60 / 60 s | `POST /api/jobs/{id}/retry`, `POST /api/jobs/{id}/cancel`, `DELETE /api/jobs`, `POST /api/pipeline/pause`, `POST /api/pipeline/resume`, `GET /api/pipeline/state`, `POST /api/rescan`, `POST /api/cleanup`, `POST /api/backup`, `POST /api/backup/cancel` |
| `Approval` | 10 / 60 s | `POST /api/approvals/{id}`, `GET /approvals/link/{token}`, `GET /approvals/cloud/return` — uma cota própria, separada das ações de operador, porque essas rotas podem ser acessadas sem credencial de operador. Os ids de job são GUIDs v4, e é esta cota que os mantém (assim como os tokens de link) impossíveis de adivinhar por uma máquina, e não só por uma pessoa. |
| `Export` | 10 / 60 s | `GET /approvals/export/{list}` (a exportação para Excel do portal do aprovador) e `GET /api/jobs/export` (a da página Jobs). Uma exportação executa a consulta da lista inteira e monta uma planilha, por isso tem uma cota própria, que não consome as permissões de que um cancelamento ou uma aprovação precisam. |

As requisições acima do limite recebem `429 Too Many Requests`, com `code = "rate-limited"` e um header
`Retry-After`.

## Grupos de endpoints

### Autenticação

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `POST` | `/api/auth/login` | POST de formulário. Troca uma chave de API por um cookie de sessão. Anônimo. Não emite cookie quando o modo Entra está configurado. |
| `GET` | `/api/auth/entra-login` | Inicia um login pelo Microsoft Entra. Redireciona para `/login` quando o modo não está configurado. |
| `POST` | `/api/auth/logout` | Encerra a sessão do Bulk Signer e redireciona para `/login` (para `/approvals/link-required`, no caso de uma sessão mantida apenas por um link de aprovador). Apenas local: a sessão da Microsoft não é afetada. |

Campos de formulário do `/api/auth/login`:

| Campo | Obrigatório | Observações |
|-------|-------------|-------------|
| `ApiKey` | sim | Comparado com `Auth:ApiKey` em tempo constante. |
| `ReturnUrl` | não | Caminho relativo local para onde ir após o login. Tentativas de redirecionamento aberto são reescritas para `/`. |

Clientes programáticos geralmente dispensam cookies e enviam o `X-API-Key` diretamente em cada
requisição.

### Arquivos

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `POST` | `/api/files` | Upload multipart de um arquivo para assinatura. Limitado pela política `Upload`. O diálogo **Enviar arquivos** da [página Jobs](dashboard.md#jobs--jobs) do dashboard passa pelo mesmo handler, então os dois recusam arquivos pelos mesmos critérios. Desativado com [`Upload:Enabled = false`](configuration.md#upload), caso em que responde `409 upload.disabled`. |

Parâmetros de query string:

| Parâmetro | Tipo | Observações |
|-----------|------|-------------|
| `format` | enum | Override opcional (`Pades`, `Cades`, `Xades`). Padrão: detecção automática pela extensão. |
| `profile` | string | Opcional. Nome de um perfil de assinatura (sem diferenciar maiúsculas de minúsculas; o `GET /api/profiles` lista os perfis). Se nulo ou omitido, usa o perfil `default`. Nomes desconhecidos retornam `400` com `code = "profile.not-found"`; um perfil que um operador desativou retorna `409` com `code = "profile.disabled"`, antes de qualquer byte ser colocado em stage. |

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

:::note Novo na 2.13.0 — um nome de arquivo só é assinado uma vez
Com `Pipeline:RejectAlreadyProcessedFileNames` ligado (o padrão), um arquivo que chega com o nome de um
job `Completed` ou ainda ativo é recusado com `file.already-processed`, em vez de ser assinado pela
segunda vez. Excluir o job que detém o nome, pela página `/jobs` do dashboard, faz o nome voltar a ser
aceito.
:::

### Jobs

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/jobs` | Lista os jobs, do mais recente para o mais antigo. Query string: `status`, `profile`, `page` (no máximo 10.737.418 — acima disso, `400 validation.filter-invalid`), `pageSize` (máx. 200). |
| `GET` | `/api/jobs/{id}` | Um job e seu histórico. |
| `GET` | `/api/jobs/{id}/output` | Transmite a saída assinada (e possivelmente criptografada) de um job `Completed`. Nome de arquivo `.enc` quando criptografada. `409 job.output-unavailable` em qualquer outro status; `410 job.output-gone` quando o arquivo saiu de `output/`. |
| `GET` | `/api/jobs/archive?id=…&id=…` | O **pacote de saídas assinadas**: um ZIP com as saídas assinadas dos jobs `Completed` informados. Veja [abaixo](#o-pacote-de-saídas-assinadas). |
| `GET` | `/api/jobs/export` | A lista de jobs como uma planilha do Excel, restrita pelos filtros da página Jobs. Limitado pela política `Export`. Veja [abaixo](#exportando-a-lista-de-jobs). |
| `POST` | `/api/jobs/{id}/retry` | Cria um novo job com a mesma entrada e `ParentJobId = {id}`. Válido somente quando o job de origem está `Failed`. Limitado pela política `Actions`. |
| `POST` | `/api/jobs/{id}/cancel` | Cancela um job `Queued`, `AwaitingSigner` **ou** `AwaitingApproval`. Jobs locais em andamento retornam `409` com `code = "job.not-queued"`. Limitado pela política `Actions`. |
| `GET` | `/api/jobs/{id}/approvals` | **Somente leitura.** O registro de aprovação do job: a regra congelada, o pool congelado com a decisão de cada membro e a lista de decisões. `404` com `approval.not-required` em um job que nunca ficou retido. |
| `DELETE` | `/api/jobs` | **Destrutivo — Limpar Jobs.** Apaga **todos** os registros de jobs, em qualquer status, com o histórico, todos os arquivos que esses jobs deixaram para trás e todos os eventos operacionais registrados antes da limpeza. Veja [abaixo](#limpar-jobs). Limitado pela política `Actions`. |

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

O `GET /api/jobs/{id}` retorna o mesmo formato, mais um array `history` de entradas
`{ id, timestamp, status, message }` (uma por transição de estado, da mais antiga para a mais recente)
e — somente na representação de **detalhe**, nunca nas linhas da lista — dois objetos que são `null` nos
jobs aos quais não se aplicam:

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

- O `totalCentavos` é o valor inteiro de referência — divida por 100 para exibir. O `totalFormatted`
  existe para que um relatório bata com o console do operador sem precisar reimplementar a formatação de
  moeda brasileira. As linhas individuais de pagamento **não** são expostas pela API REST — veja
  [CNAB240](cnab240.md#o-que-a-api-rest-retorna).
- Todos os números em `approval` refletem a regra **congelada no job**, nunca a regra atual do perfil.
  `approved` e `rejected` contam pessoas distintas, não linhas.
- O `signers` é o **conjunto de assinantes** congelado — de quem são as assinaturas presentes na saída:
  `ProfileKey`, `Approvers` ou `ProfileKeyAndApprovers`. Um job retido antes da existência do campo
  informa `ProfileKey`.
- **Decida pelo `vetoed`, e não por uma conta própria como `rejected > 0`**: uma única rejeição
  interrompe o job, seja qual for o quórum, e `quorumReached` pode ser `true` em um job que um veto já
  interrompeu.
- O `parkedSince` **não é limpo** quando o job sai de `AwaitingApproval` — subtraia-o do instante atual
  para obter "há quanto tempo isto está esperando", o valor que um monitor de aprovações paradas usa para
  alertar.

Nova tentativa e cancelamento são POSTs sem corpo obrigatório:

```bash
curl -X POST "http://localhost:8080/api/jobs/$ID/retry" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

curl -X POST "http://localhost:8080/api/jobs/$ID/cancel" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Em caso de sucesso, a nova tentativa retorna:

```json
{ "newJobId": "fc12…", "parentJobId": "9b62…", "status": "Queued" }
```

Erros possíveis da nova tentativa: `job.not-found`, `job.not-failed`, `job.rejected-not-retriable`,
`job.input-missing`, `profile.disabled`, `file.already-processed`, `job.path-too-long`, `job.race-lost`,
`rate-limited`.

#### O pacote de saídas assinadas

O `GET /api/jobs/archive?id=…&id=…` retorna um único `application/zip` com as saídas assinadas dos jobs
`Completed` informados — é o que o botão **Baixar N selecionado(s)** da página Jobs entrega.

- No máximo **50** ids distintos (ids repetidos contam uma vez). As entradas são armazenadas sem
  compressão, com os nomes que têm em `output/` — uma saída criptografada vai como o envelope `.enc`, tal
  como está. Quando duas saídas têm o mesmo nome, a entrada posterior recebe o id do job antes da última
  extensão.
- **Toda recusa é decidida antes do primeiro byte**: `400 validation.filter-invalid` (um `id` que não é
  GUID), `404 job.not-found`, `409 job.output-unavailable`, `400 job.archive-empty`,
  `400 job.archive-too-large`. As recusas relativas a jobs específicos indicam quais são.
- Um job `Completed` cujo arquivo não está mais em `output/` com o nome esperado **não** faz o lote
  falhar: ele é listado (id do job e nome esperado) em uma entrada `MISSING.txt` dentro do pacote. O
  `410 job.output-gone` é retornado somente quando nenhum dos jobs informados ainda tem seu arquivo.
- Se uma leitura falhar depois do início do download, a conexão é abortada; assim, um download com falha
  é um fluxo que nenhum leitor de ZIP abre — nunca um pacote bem formado com uma entrada truncada.
- Nome de arquivo `bulksigner-signed-yyyyMMdd-HHmmss.zip` (UTC). O download não grava evento
  operacional; uma linha de log registra o operador e as contagens.

```bash
curl -o signed.zip "http://localhost:8080/api/jobs/archive?id=$ID1&id=$ID2" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

#### Exportando a lista de jobs

O `GET /api/jobs/export` retorna a lista de jobs como uma planilha `.xlsx`, uma linha por job, do mais
recente para o mais antigo — é o botão **Exportar para Excel** da página Jobs. Ele exporta **todos os
jobs que atendem aos filtros**, e não apenas uma página.

- Query string: `status`, `profile`, `fileName` (busca por trecho), `from` e `to` (`yyyy-MM-dd`, dias UTC,
  inclusivos) — os cinco filtros da página Jobs, aplicados pela mesma regra da página e do
  `GET /api/jobs`. Um valor que não pode ser interpretado, ou `from` posterior a `to`, resulta em
  `400 validation.filter-invalid` indicando o valor — o filtro nunca é ampliado para a tabela inteira.
- No máximo **10.000** linhas. Um bloco de título informa quem exportou, quando (com o deslocamento UTC
  do servidor), cada filtro em vigor, quantos jobs corresponderam e — em vermelho — se a lista foi
  truncada pelo limite.
- Colunas: nome do arquivo, formato, perfil, origem, status (no idioma de exibição do leitor), criado,
  atualizado, pasta de entrada, caminho original, total e quantidade de pagamentos CNAB240 (vazios
  quando o job não era uma remessa), saída criptografada, erro, id do job pai, id do job. Todo valor vem
  do próprio job; nenhuma linha individual de pagamento é exportada, em hipótese alguma.
- Nome de arquivo `jobs-yyyyMMdd-HHmmss.xlsx` (UTC). Limitado pela política `Export`. Nenhum evento
  operacional; uma linha de log registra o operador e as contagens.

```bash
curl -o jobs.xlsx "http://localhost:8080/api/jobs/export?status=Failed&from=2026-09-01" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

#### Limpar Jobs

O `DELETE /api/jobs` é uma ação de manutenção do sistema — irreversível e idêntica ao botão
**Limpar Jobs** da [página Sistema](dashboard.md#system--sistema) do dashboard. Ela apaga:

- **todos** os registros de jobs, em qualquer status — `Queued`, retido aguardando um aprovador,
  aguardando o Lacuna Signer ou sendo assinado naquele momento (esse job é abandonado) —, com o histórico;
- todos os arquivos que esses jobs deixaram para trás: a entrada, as pastas `processing/<id>/` e
  `error/<id>/` e a saída assinada;
- todos os eventos operacionais registrados antes do início da limpeza, de modo que o evento
  `JobsCleared` gravado por esta chamada passa a ser o mais antigo.

O estado do pipeline, os perfis de assinatura, a configuração e os logs ficam intactos. A resposta:

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
lease, uma pasta recusada) — cada um é identificado no log do servidor, e os registros de job
correspondentes são apagados mesmo assim. Os arquivos são varridos antes de as linhas serem alteradas,
então um armazenamento inacessível faz a chamada falhar antes de qualquer registro ser apagado; uma
falha do banco de dados depois da varredura desfaz a exclusão das linhas e aparece como um `500`
genérico, sem `code` específico — execute a limpeza de novo. A chamada também avança o **marcador de
reset** das estatísticas, que vale para toda a implantação.
Veja [Limpar Jobs](operations.md#limpar-jobs).

:::warning Mudou na 2.9.0 e na 2.10.0 — o Limpar Jobs leva tudo
Antes da 2.9.0, o Limpar Jobs apagava somente jobs finalizados, não mexia em arquivos nem em eventos
operacionais e respondia `{ "deleted", "skipped", "message" }`. Agora ele apaga todo job e seus arquivos (2.9.0)
e os eventos operacionais (2.10.0). **O `skipped` não existe mais**; `filesDeleted`, `foldersDeleted`,
`itemsFailed` e `eventsDeleted` são novos. Um cliente que lia apenas `deleted` continua funcionando.
:::

### Pipeline

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/pipeline/state` | O `paused / pausedAtUtc / resumedAtUtc / pausedBy / reason` atual, mais a capacidade atual do worker. Limitado pela política `Actions`. |
| `POST` | `/api/pipeline/pause` | Pausa idempotente do worker — repetir a chamada com o pipeline já pausado retorna `200`. Persiste entre reinicializações. `reason` opcional. Limitado pela política `Actions`. Uma pausa e uma retomada *simultâneas* não contam como repetição: exatamente uma vence, e a outra recebe `409 pipeline.race-lost` sem ter registrado nada. |
| `POST` | `/api/pipeline/resume` | Retomada idempotente, com as mesmas regras. Limitado pela política `Actions`. |

Pausar e retomar aceitam um corpo JSON opcional `{ "reason": "…" }` (há um comprimento máximo — acima
dele, a resposta é `validation.reason-too-long`):

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
`Verifying`. Quem acompanha a drenagem após uma pausa vê `paused: true` enquanto `jobsInFlight`
diminui até `0`.

### Ações

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `POST` | `/api/rescan` | Reenfileira todos os arquivos de todas as pastas de entrada configuradas. Aceita `?folder=<nome>` para restringir a uma pasta. Limitado pela política `Actions`. |
| `POST` | `/api/cleanup` | Aplica a retenção a `processing/`, `output/`, `error/`. Atualmente um stub que não faz nada; veja [Retenção](retention.md). Limitado pela política `Actions`. |

```bash
# Rescan em todas as pastas configuradas
curl -X POST "http://localhost:8080/api/rescan" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"

# Rescan em apenas uma pasta
curl -X POST "http://localhost:8080/api/rescan?folder=legal" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY"
```

Formato da resposta da nova varredura:

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

- **Uma pasta que nenhum perfil de assinatura escolheu é pulada por inteiro**: sua linha traz
  `unassigned: true`, com todas as contagens em zero, e o `totals.unassigned` conta essas pastas. Não é
  erro nem `ignored` — ninguém pediu ainda para assinar a partir daquela pasta — e a chamada continua
  retornando `200`. Escolha a pasta na página de um perfil de assinatura no dashboard e ela passa a ser
  monitorada, sem precisar de nova varredura.
- O `alreadyProcessed` conta arquivos recusados como `file.already-processed`: cada um virou um job
  `Failed` e foi movido para `error/`.
- Arquivos recusados porque seu perfil está desativado são contados como `ignored`.
- `unassigned` e `alreadyProcessed` foram acrescentados com valores padrão zero/falso, então quem lê o
  formato anterior não é afetado.

Um `?folder=<nome>` desconhecido retorna `404` com `code = "folder.not-found"` e os nomes configurados
em `detail`. O `Cleanup` retorna `200 OK` enquanto o serviço de retenção for o stub nulo.

### Aprovações

Usadas somente quando um perfil de assinatura tem uma [regra de aprovação](approvals.md).

| Método | Caminho | Autenticação | Finalidade |
|--------|---------|--------------|------------|
| `POST` | `/api/approvals/{id}` | **Anônima** | Registra a decisão de um aprovador em um job retido em `AwaitingApproval`. Atingir o quórum congelado o devolve a `Queued` e acorda o pipeline; uma única rejeição cancela o job de imediato. Limitado pela política `Approval`. Recusa toda chamada com `403 approval.second-factor-required` enquanto `ApproverSecondFactor:Enabled` estiver ligado, e recusa uma *aprovação* com `403 approval.signature-required` em um job cujo conjunto de assinantes congelado inclui os aprovadores. |
| `GET` | `/api/jobs/{id}/approvals` | Chave de API ou cookie | **Somente leitura.** A regra congelada, o pool congelado com a decisão de cada membro, e a lista de decisões. |

Corpo: `email` (obrigatório), `decision` (`approved` \| `rejected`, sem diferenciar maiúsculas de
minúsculas, **padrão `approved`**), `reason` (opcional, ≤ 512 caracteres).

```bash
curl -X POST "http://localhost:8080/api/approvals/3f2a…" \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@empresa.com.br"}'
```

```json
{ "jobId": "3f2a…", "approverName": "Maria Silva", "approved": 2, "required": 2, "outstanding": 0, "quorumMet": true, "released": true }
```

Rejeitar retorna um `200` de formato diferente — não há contagem, porque nenhum cálculo foi feito:

```json
{ "jobId": "3f2a…", "approverName": "Maria Silva", "reason": "valor errado no lote 2", "terminated": true }
```

O `terminated` é falso apenas na rara condição de corrida em que um worker já tinha reivindicado o job;
nesse caso, o próprio pipeline recusa a assinatura e o job termina `Failed` com `approval.rejected`. De
qualquer forma, o arquivo não é assinado. Omitir `decision` continua significando `approved`, então
clientes escritos antes da existência da rejeição não são afetados.

O nome e o CPF na linha registrada vêm do pool congelado, nunca do corpo da requisição — os únicos
campos que um chamador fornece são o endereço, a decisão e o motivo.

A rota de leitura retorna o pool junto com as decisões, porque "quem decidiu" só faz sentido quando
comparado a "quem poderia ter decidido". **O CPF é mascarado, exceto os dígitos verificadores**, nos
dois, e o endereço IP e o user agent registrados deliberadamente não são informados — são material de
investigação, consultado no host, e não campos para qualquer um que tenha uma chave de API. O endpoint
também responde para jobs em estado terminal, que é justamente quando um relatório de conformidade
costuma perguntar.

Quando uma aprovação foi registrada **por meio de assinatura** — em um perfil cujo conjunto de
assinantes inclui os aprovadores —, a decisão traz um objeto `certificate`: `subject`, `issuer`,
`serialNumber`, `thumbprintSha256`, o `cpf` do certificado (mascarado como o do pool), o `cnpj` completo
em um e-CNPJ e o `cloudService` — o provedor por meio do qual o certificado foi acessado quando o
aprovador assinou em nuvem, ou `null` para uma assinatura feita no navegador. O `certificate` é `null` em
uma decisão por clique e em todas as decisões registradas antes da existência das assinaturas de
aprovadores. Veja
[Certificados](certificates.md#o-certificado-do-aprovador).

:::danger Esta é a única rota anônima que altera estado no produto
Qualquer pessoa que consiga acessar a URL pode aprovar *ou rejeitar* em nome de qualquer membro do pool
congelado do job. O endereço do aprovador precisa constar do pool, mas nada verifica se quem chama é de
fato aquela pessoa. **Não existe rota REST que aprove protegida pela chave de API**, e criar uma não
está nos planos de melhoria —
veja [Segurança](security.md#não-existe-endpoint-rest-de-aprovação).
:::

### Perfis

Duas rotas, ambas `GET`, e **nenhuma delas permite gravar um perfil**. Os perfis de assinatura ficam no
banco de dados operacional e são criados e editados pelo dashboard.

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/profiles` | Todos os perfis de assinatura desta implantação. |
| `GET` | `/api/profiles/{name}` | Um perfil. O nome é comparado sem diferenciar maiúsculas de minúsculas, exatamente como no `POST /api/files?profile=`. `404` com `code = "profile.not-found"` para um nome que não corresponde a nenhum perfil. |

O caso de uso é validar o nome de um perfil antes de enviar um arquivo para ele e ver quais perfis ainda
aceitam trabalho novo. As duas rotas leem o mesmo registro que o `POST /api/files` usa na validação,
então um nome informado aqui é um nome que o upload vai aceitar.

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

- **Um perfil desativado é listado, e não escondido** — jobs antigos fazem referência a ele e jobs já
  enfileirados rodam até o fim. Verifique o `enabled` antes de rotear trabalho novo para um perfil: a
  flag é aplicada de fato, e um upload ou uma nova tentativa que indique um perfil desativado responde
  `409 profile.disabled`.
- **O `inputFolder`** é a pasta monitorada que alimenta o perfil, identificada pelo
  `Storage:Inputs[].Name`, ou `null` para um perfil usado somente por uploads que o indicam. É uma pasta
  por perfil e um perfil por pasta, então um cliente que deposita arquivos em `remessas` pode confirmar
  aqui qual perfil — qual certificado e qual regra de aprovação — vai assiná-los. O estado da pasta em si
  está no `GET /api/folders`.
- **O `checkCnab240PaymentDates`** indica se uma remessa cuja data de pagamento mais antiga já passou é
  recusada (`true`, o padrão) ou liberada para assinatura (`false`). Só tem efeito junto com
  `checkCnab240 = true`.
- **Dois valores nulos têm significado.** `format: null` indica que o perfil escolhe o formato pela
  extensão do arquivo (só o perfil `default` derivado faz isso). `certificateSource: null` indica que não
  há certificado local a identificar: a chave fica no Lacuna Signer (`method: "LacunaSigner"`), ou o
  perfil é **sem chave** — seu `approval.signers` é `Approvers`, então cada aprovador assina com o
  próprio certificado e este host não tem chave nenhuma. `approval: null` indica que os jobs vão direto
  para o assinador.
- **O `certificateSource` indica a chave em vigor, e não a linha armazenada.** O certificado é aberto uma
  única vez, na inicialização; por isso, depois que um perfil é editado para trocar de origem, esta rota
  continua informando a origem antiga até o serviço reiniciar — a origem informada é a que vai assinar.

Ficam de fora, deliberadamente: os membros do pool de aprovadores (um pool é formado por pessoas
identificadas — o `GET /api/jobs/{id}/approvals` fornece o pool de um único job, com os CPFs mascarados,
e o `poolSize` aqui é apenas uma contagem), o participante de um assinador remoto e as coordenadas do
certificado (caminhos de arquivo, caminhos de módulo, thumbprints, endpoints de cofre). Nenhuma rota
grava um perfil: uma chave de API capaz de alterar quem pode aprovar pagamentos seria um controle mais
fraco do que o dashboard protegido pela sessão de um operador.

Erros possíveis: `profile.not-found`.

### Backup

Três rotas e **nenhuma de restauração** — restaurar um backup é um procedimento do operador, nunca uma
rota. As três exigem a política de operador; os dois `POST`s consomem a cota `Actions`. O backup só
está disponível com o provider SQLite; veja
[Retenção](retention.md#a-funcionalidade-de-backup-embutida--somente-sqlite).

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/backup` | A configuração, a execução em andamento (se houver), o `lastSuccessAtUtc` e as 50 execuções concluídas mais recentes. Informa `supported: false` com o SQL Server, independentemente de `enabled`. A string de destino nunca contém credenciais. |
| `POST` | `/api/backup` | Inicia uma execução agora. `202` com o id da execução assim que ela é aceita; faça polling no `GET` para saber o resultado. |
| `POST` | `/api/backup/cancel` | Pede à execução em andamento que pare. `202` com o id da execução. |

Erros possíveis: `backup.disabled`, `backup.already-running`, `backup.not-running`, `rate-limited`.

### Eventos

O log de eventos operacionais — a trilha de auditoria de todo o host, na qual gravam as pausas e
retomadas, as edições de perfil, as decisões de aprovação, o Limpar Jobs e o desligamento do serviço. Dois
`GET`s e nada mais: nenhuma rota apaga, edita ou exporta um evento. Os dois exigem a política de operador
(inclusive um `Administrator` do Entra); a sessão de um aprovador recebe `401`. O dashboard mostra o
mesmo log na página `/events`.

| Método | Caminho | Finalidade |
|--------|---------|------------|
| `GET` | `/api/events` | Uma página de eventos, do mais recente para o mais antigo: `{ items: [{ id, timestamp, eventType, message }], page, pageSize, totalCount }`. |
| `GET` | `/api/events/types` | Os tipos de evento distintos presentes no banco operacional — os valores a usar em `eventType`. Nunca lista um tipo sem linhas. |

Parâmetros de query string do `GET /api/events`:

| Parâmetro | Observações |
|-----------|-------------|
| `eventType` | Repita o parâmetro para incluir vários tipos; se omitido, todos os tipos são incluídos. |
| `from`, `to` | Instantes ISO 8601, `from` inclusivo e `to` exclusivo. Um valor sem fuso horário é interpretado como UTC. |
| `contains` | Um trecho literal da mensagem — `%` e `_` não são curingas. |
| `page` | Padrão 1, no máximo 10.737.418. |
| `pageSize` | Padrão 50, limitado a 200. Uma página ou um tamanho abaixo de 1 é tratado como 1. |

Recusados com `400 validation.filter-invalid`: um `from` / `to` que não pode ser interpretado, um `from`
que não seja anterior a `to`, uma `page` ou um `pageSize` que não seja número inteiro, uma `page` além do
limite e um `eventType` informado só com espaços em branco.

```bash
# Quem pausou o pipeline este mês, e por quê
curl -s "http://localhost:8080/api/events?eventType=PipelinePaused&from=2026-09-01T00:00:00Z" \
  -H "X-API-Key: $BULK_SIGNER_API_KEY" | jq '.items[] | {timestamp, message}'
```

**As mensagens são as frases de auditoria exatamente como registradas, em inglês**, qualquer que seja o
idioma do leitor. Baseie-se no `eventType`, nunca na mensagem; o `contains` é uma busca para pessoas, e
não um contrato para programas. Eventos registrados antes do último **Limpar Jobs** não existem mais — o
evento `JobsCleared` passa a ser o mais antigo.

### Preferências

| Método | Caminho | Autenticação | Finalidade |
|--------|---------|--------------|------------|
| `POST` | `/api/culture?culture=<en-US\|pt-BR>&redirectUri=<caminho local>` | Anônima | Grava a escolha de idioma de exibição do chamador no cookie de cultura padrão do ASP.NET Core (um ano, `HttpOnly`, `SameSite=Lax`) e redireciona de volta. Qualquer valor que não seja um caminho local é substituído por `/`, em vez de virar um redirecionamento aberto. Uma cultura sem suporte retorna `400` com `code = "culture.not-supported"`. |

Anônima por necessidade, e não por conveniência: seu público principal é o aprovador sem credencial em
`/approve/{id}`, que precisa do seletor *antes* de se autenticar. Ela existe para o seletor de idioma do
dashboard; não há razão para um cliente programático chamá-la, e ela **não muda nada** na API — o texto
dos erros, os valores de `JobStatus` transmitidos e as mensagens de auditoria continuam em inglês de
qualquer forma.

### Sistema

| Método | Caminho | Autenticação | Finalidade |
|--------|---------|--------------|------------|
| `GET` | `/api/health` | Anônima | Liveness — `200 OK` se o processo do host está no ar. |
| `GET` | `/api/ready` | Anônima, a menos que `Readiness:RequireApiKey = true` | **Veredito** de readiness — `{ ready, checks: [{ name, ok }] }`. `503` se alguma verificação que conta para o veredito falhar. Sem campo `detail`: um orquestrador lê o código de status, quem acompanha o monitoramento vê qual `name` ficou vermelho, e a explicação fica na rota abaixo. |
| `GET` | `/api/ready/details` | Autorizada | O mesmo relatório com o `detail` de cada verificação, e a mesma regra de `200` / `503`. Veja [as famílias de verificação](#verificações-de-prontidão) abaixo. |
| `GET` | `/api/folders` | Autorizada | Estado de execução por pasta: nome, caminho absoluto, existência, status (`Initializing` / `Running` / `Stopped` / `Unassigned`), hora do último enfileiramento, último erro, total de processados desde o início, contagem de arquivos (limitada a 50) e o perfil de assinatura alimentado pela pasta, em `profileName`, com o formato declarado em `profileFormat` (`auto` para um perfil sem formato) — ambos `null` enquanto nenhum perfil tiver escolhido a pasta. Há ainda um campo `instance` no nível superior, que identifica a instância que respondeu no modo cluster (`null` em instância única). |
| `GET` | `/api/metrics` | Autorizada quando `Metrics:RequireApiKey = true` (padrão) | Exposição no formato Prometheus. |
| `GET` | `/api/whoami` | Autorizada | Retorna a identidade autenticada (operador e esquema usado). |

O `/api/health` é sempre anônimo, para que health checks externos (balanceadores de carga,
`HEALTHCHECK` do Docker, `livenessProbe` do Kubernetes) não precisem de credenciais. O `/api/ready` é
anônimo por padrão pelo mesmo motivo — o health check do Azure App Service não consegue enviar
credenciais. Leia `checks[].name` e `checks[].ok` para saber qual verificação falhou e depois chame o
`GET /api/ready/details` com a chave para saber por quê. Ligue o `Readiness:RequireApiKey` onde o probe
consegue enviar o `X-API-Key` (os `httpHeaders` de um probe do Kubernetes, um agente de monitoramento)
ou onde nenhum probe consulta o host.

`Unassigned` no `/api/folders` significa que nenhum perfil de assinatura escolheu a pasta: ninguém a
monitora, e os arquivos nela ficam esperando. Não é uma falha; a solução está na página de um perfil no
dashboard. Logo depois que um perfil escolhe uma pasta, a linha pode trazer um `profileName` enquanto o
status ainda mostra `Unassigned`; a próxima consulta acerta os dois.

:::warning Mudou na 2.6.0 — o `/api/ready` é só um veredito
O `/api/ready` anônimo trazia uma frase `detail` por verificação — juntas, um mapa da implantação (o host
do SQL Server, cada compartilhamento de entrada, a localização de um certificado) legível por qualquer um
que acessasse a porta. Agora ele traz apenas `ready`, `name` e `ok`; o campo `detail` fica ausente, e
não nulo. Um orquestrador que lê o código de status não é afetado. Um monitor que interpretava o
`detail` deve passar a usar o `GET /api/ready/details`, enviando a chave de API. Cada mudança de veredito
de uma verificação é gravada uma vez no log durável, então o registro de uma falha transitória não se
perde.
:::

#### Verificações de prontidão

As famílias de verificação, pelo `name`, como o `/api/ready/details` as explica:

- **`database`** — identifica o banco que verificou (`reachable (SQLite (data/db/bulksigner.db))`,
  `reachable (SQL Server (sqlsrv01/BulkSigner))`), nunca a connection string; uma linha vermelha traz o
  nome do tipo da exceção. O veredito é calculado a cada requisição, mas também fica vermelho durante toda
  a vida de uma instância cujo boot encontrou o banco inacessível e pulou a migração — isso se resolve no
  próximo boot.
- **`input-folder:<nome>`** — uma por pasta de entrada configurada; qualquer pasta ausente ou `Stopped`
  faz a resposta falhar. Uma pasta que nenhum perfil escolheu fica `ok: true`, com um detalhe dizendo que
  ela não está atribuída.
- **`storage-share:<conta>/<compartilhamento>`** e **`work-share-owner`** — somente em um
  compartilhamento de trabalho remoto. A segunda fica vermelha quando outra instância detinha o marcador
  do compartilhamento na inicialização, ou quando a reivindicação não pôde ser feita. Ambas informam o
  que era verdade **na inicialização**, e deixam isso explícito.
- **`signing-profile:<nome>`** — um perfil de assinatura degradado. Informa `ok: false` **sem** fazer a
  resposta falhar: um `503` tiraria a instância do balanceador de carga, e a página do dashboard que
  corrige o certificado é servida por essa instância. **Configure alertas para as entradas individuais de
  `checks[]`**, e não apenas para o `ready` do nível superior.
- **`signing-profile-keyless:<nome>`** — um perfil cujo conjunto de assinantes é `Approvers` e que,
  portanto, não tem chave. `ok: true`, com um detalhe explicando o estado.
- **`profile-input-folder:<perfil>`** — um perfil vinculado a uma pasta de entrada que este host não
  configurou. Vermelha e, da mesma forma, não conta para o veredito.

## Métricas

O `/api/metrics` expõe os seguintes instrumentos (formato Prometheus):

| Métrica | Tipo | O que ela acompanha |
|---------|------|---------------------|
| `bulksigner_jobs_enqueued_total{folder=...}` | Counter | Cada enfileiramento bem-sucedido. O label `folder` é o `Storage:Inputs[].Name`, ou `"(upload)"` para uploads REST. |
| `bulksigner_jobs_completed_total` | Counter | Job chegou a `Completed`. |
| `bulksigner_jobs_failed_total` | Counter | Job chegou a `Failed`. |
| `bulksigner_jobs_canceled_total` | Counter | Jobs cancelados pelo operador (a partir de `Queued`, `AwaitingSigner` ou `AwaitingApproval`). |
| `bulksigner_jobs_verify_skipped_total{profile}` | Counter | Jobs cuja verificação pós-assinatura foi pulada porque o perfil tem `Verify = false`. Uma série diferente de zero mostra a configuração de baixa confiança no monitoramento, e não apenas no banner de inicialização. |
| `bulksigner_cert_validation_failed_total{profile}` | Counter | Falhas de validação de certificado antes da assinatura. Aumenta quando uma cadeia deixa de ser validada — é assim que um certificado de assinatura expirado ou revogado se manifesta primeiro. |
| `bulksigner_pipeline_pause_total` | Counter | Transições de pausa. |
| `bulksigner_pipeline_resume_total` | Counter | Transições de retomada. |
| `bulksigner_pipeline_paused` | Gauge | 1 = pausado / 0 = em execução. |
| `bulksigner_files_encrypted_total` | Counter | Envelopes BSENC v1 gravados. |
| `bulksigner_jobs_in_flight` | Gauge | Contagem atual de `Processing` + `Verifying`. |
| `bulksigner_signing_duration_seconds{format=Pades\|Cades\|Xades}` | Histogram | Duração de assinatura + verificação + promoção. |
| `bulksigner_jobs_dispatched_to_signer_total{profile}` | Counter | Envios bem-sucedidos ao Lacuna Signer, rotulados por perfil. |
| `bulksigner_jobs_awaiting_signer` | Gauge | Contagem atual de linhas `AwaitingSigner`. |
| `bulksigner_signer_poll_duration_seconds` | Histogram | Duração, por tique, de uma passada completa pelas linhas `AwaitingSigner`. |
| `bulksigner_signer_api_errors_total{op}` | Counter | Erros da API do Lacuna Signer durante o polling e o download, rotulados por operação (`poll`, `download`). |
| `bulksigner_jobs_parked_for_approval_total{profile}` | Counter | Transições `Processing → AwaitingApproval` bem-sucedidas. |
| `bulksigner_jobs_awaiting_approval` | Gauge | Contagem atual de linhas `AwaitingApproval`. Calculada a partir de uma varredura, então continua correta após uma reinicialização enquanto houver jobs retidos. |
| `bulksigner_approvals_recorded_total{profile}` | Counter | Decisões registradas, uma por pessoa por job — aprovações **e** rejeições. A única métrica que cobre a rota de aprovação anônima como um todo, então é também por ela que um operador percebe que essa rota está sendo usada. |
| `bulksigner_approvals_rejected_total{profile}` | Counter | O subconjunto de rejeições; cada uma veta seu job. Separada de `bulksigner_jobs_canceled_total`, que conta o que um *operador* fez. |
| `bulksigner_jobs_released_by_approval_total{profile}` | Counter | Jobs retidos que atingiram o quórum e voltaram a `Queued`. |
| `bulksigner_approvals_expired_total{profile}` | Counter | Jobs retidos cancelados porque o prazo de espera congelado se esgotou — a série que registra que *ninguém* agiu, o que faz dela a série indicada para alertas. Fica em zero a menos que um perfil defina `Approval.ExpiresAfter`. |
| `bulksigner_jobs_content_changed_total{profile}` | Counter | Jobs recusados pela verificação de vínculo de conteúdo anterior à assinatura. **Deveria ficar em zero para sempre** — qualquer outra coisa significa que um artefato mudou entre ser medido e ser assinado. |
| `bulksigner_inputs_diverged_total{profile}` | Counter | Arquivos de entrada deixados no lugar após a assinatura porque o arquivo em disco não era mais a cópia que foi preparada. **Não é uma falha** — o job concluiu e sua saída está boa. Veja [Operação](operations.md#quando-um-arquivo-de-entrada-muda-no-meio-de-um-job). |
| `bulksigner_cnab240_payment_date_checks_skipped_total{profile}` | Counter | Remessas CNAB240 cuja data de pagamento mais antiga já havia passado e que foram liberadas porque o `CheckCnab240PaymentDates` (ou o `CheckCnab240`) do perfil está desligado. Conta decisões, e não assinaturas. Fica em zero em todo perfil que mantém a verificação ligada. |
| `bulksigner_approver_signatures_total{outcome,means}` | Counter | Tentativas de assinatura de aprovadores em jobs cujo conjunto de assinantes congelado inclui os aprovadores. `outcome` ∈ `signed`, `cpf-mismatch`, `without-cpf`, `certificate-invalid`, `signature-invalid`, `conflict`, `abandoned`, `browser-failed`, `provider-failed`; `means` ∈ `browser`, `cloud` — onde o certificado foi acessado. Fica em zero até que o conjunto de assinantes de um perfil inclua os aprovadores. |
| `bulksigner_second_factor_verifications_total{outcome}` | Counter | Tentativas de verificação do segundo fator de aprovadores, rotuladas pelo resultado e nunca pelo aprovador. |
| `bulksigner_second_factor_enrolments_total` | Counter | Cadastros de autenticador confirmados. Volta a subir depois que um operador redefine o fator de um aprovador. |
| `bulksigner_backup_runs_total{result}` | Counter | Execuções de backup do banco de dados que terminaram, rotuladas `Succeeded` / `Failed` / `Canceled`. |
| `bulksigner_backup_duration_seconds` | Histogram | Duração real (tempo de relógio) de uma execução de backup bem-sucedida. |
| `bulksigner_backup_last_size_bytes` | Gauge | Tamanho do artefato de backup mais recente que esta instância armazenou. |
| `bulksigner_backup_last_success_timestamp_seconds` | Gauge | Timestamp Unix do último backup que este processo concluiu; `0` até ele concluir um. Alarme com `bulksigner_backup_last_success_timestamp_seconds > 0 and time() - bulksigner_backup_last_success_timestamp_seconds > 172800`. |
| `bulksigner_backup_prune_failures_total` | Counter | Execuções que armazenaram seu artefato, mas não conseguiram apagar os mais antigos no destino. |
| `bulksigner_log_sink_outages_total` | Counter | Indisponibilidades do sink de log em tabela do Azure — incrementado uma vez quando as gravações começam a falhar, e não a cada lote com falha. É por ele que o operador descobre que o sink caiu. |
| `bulksigner_log_sink_dropped_total` | Counter | Eventos de log descartados porque a fila do sink em tabela estava cheia. Diferente de zero significa que o log na tabela tem buracos. |

:::warning Mudou na 2.7.0 — `bulksigner_approver_signatures_total` ganhou um label `means`
Acrescentar o label muda a identidade da série para quem coleta o contador; uma consulta escrita apenas
com base no label `outcome` deve agregar com `sum by (outcome)`.
:::

Uma configuração mínima de coleta do Prometheus (supondo que o coletor esteja dentro do perímetro de
confiança e que `Metrics:RequireApiKey = false`):

```yaml
scrape_configs:
  - job_name: bulksigner
    static_configs:
      - targets: ['bulksigner:8080']
    metrics_path: /api/metrics
```

Quando `Metrics:RequireApiKey = true`, defina a chave de API no coletor. O Prometheus oferece suporte a
`authorization`/`basic_auth`; para o header `X-API-Key`, use um proxy reverso sidecar que injete o
header, ou defina `Metrics:RequireApiKey = false` depois de restringir o acesso à rede.

## Referência ao vivo

A interface da referência OpenAPI é servida em `http://<host>:8080/scalar/v1`. Ela traz o esquema
canônico de cada endpoint, inclusive os formatos de requisição/resposta e as listas de parâmetros de
query string. Se um cliente programático precisar de algo que não está coberto aqui, a referência ao
vivo é o próximo lugar a consultar.

---

**A seguir:** [Criptografia](encryption.md) — criptografia pós-assinatura opcional.
**Anterior:** [Telemetria](telemetry.md).
