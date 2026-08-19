---
sidebar_label: "Telemetria"
sidebar_position: 9
---

# Telemetria com o Application Insights

Telemetria opcional do Azure Application Insights sobre o pipeline de assinatura — como habilitá-la, o
que é coletado, o que é intencionalmente excluído, e as consultas KQL para encontrar gargalos.

:::note
A telemetria vem **desligada por padrão**. Com ela desabilitada, o serviço não tem dependência do
Application Insights e não faz conexões de saída em nome dele. Tudo nesta página descreve uma
funcionalidade opcional.
:::

## Em resumo

| Pergunta | Resposta |
|----------|----------|
| Como eu ligo isso? | Defina `Telemetry:Enabled = true` **e** forneça uma connection string (`Telemetry:ConnectionString` ou a variável de ambiente `APPLICATIONINSIGHTS_CONNECTION_STRING`). |
| Estado padrão? | **Desligado.** |
| Qual é o SDK? | A **distro do Azure Monitor OpenTelemetry** — activities e meters padrão do OpenTelemetry, não o SDK clássico do Application Insights. |
| O que é coletado? | Um trace correlacionado por job, os passos do ciclo de vida como eventos de span, chamadas do PKI SDK como dependências, métricas de duração de assinatura e de processamento total, e exceções de processamento. |
| O que é excluído? | Logs (logs estruturados não são encaminhados), segredos (mascarados), conteúdo de arquivos, material de certificado, e o caminho remoto do Lacuna Signer. |
| Quais tabelas do Application Insights? | Spans → `dependencies`; métricas → `customMetrics`; exceções → `exceptions`; requisições web coletadas automaticamente → `requests`. **Não há `customEvents`** — veja [abaixo](#por-que-não-há-customevents). |

Nota de escopo: isto cobre a **assinatura local**. O fluxo remoto do Lacuna Signer é apenas parcialmente
rastreado — veja [O que é intencionalmente excluído](#o-que-é-intencionalmente-excluído).

## Habilitando o Application Insights

### 1. Crie o recurso e copie a connection string

Crie um recurso do Application Insights no portal do Azure e copie sua **connection string** (painel de
Visão geral → *Connection String*). Ela se parece com:

```
InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://<region>.in.applicationinsights.azure.com/;LiveEndpoint=https://<region>.livediagnostics.monitor.azure.com/
```

### 2. Configure o Bulk Signer

A connection string carrega a instrumentation key e é tratada como um **segredo** — nunca a versione.
Prefira a variável de ambiente.

**Opção A — variável de ambiente (recomendada):**

```bash
# Linux / Docker
export Telemetry__Enabled=true
export APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=https://.../"
```

```powershell
# Windows
[Environment]::SetEnvironmentVariable("Telemetry__Enabled", "true", "Machine")
[Environment]::SetEnvironmentVariable("APPLICATIONINSIGHTS_CONNECTION_STRING", "InstrumentationKey=...;IngestionEndpoint=https://.../", "Machine")
```

**Opção B — arquivo de configuração do operador** (por exemplo, `appsettings.Production.json`):

```json
{
  "Telemetry": {
    "Enabled": true,
    "ConnectionString": "InstrumentationKey=...;IngestionEndpoint=https://.../",
    "RoleName": "Lacuna.BulkSigner"
  }
}
```

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Telemetry:Enabled` | bool | `false` | `Telemetry__Enabled` | Chave mestra. Quando `true`, uma connection string é **obrigatória** — o serviço se recusa a iniciar sem ela. |
| `Telemetry:ConnectionString` | string | `""` | `Telemetry__ConnectionString` | **SECRET.** Deixe vazia para usar a variável de ambiente padrão abaixo. |
| _(variável de ambiente padrão)_ | string | _(não definida)_ | `APPLICATIONINSIGHTS_CONNECTION_STRING` | Lida diretamente pela distro e honrada pelo validador de inicialização. Use esta para manter o segredo fora dos arquivos de configuração. |
| `Telemetry:RoleName` | string | `Lacuna.BulkSigner` | `Telemetry__RoleName` | Reportado como `cloud_RoleName`, de modo que vários serviços em um mesmo recurso continuem distinguíveis. |

### 3. Reinicie e verifique

Reinicie o serviço. Dentro de um ou dois minutos após processar um job, você deve ver entradas no recurso
do Application Insights: uma linha em `dependencies` chamada `signing.job` por job, dependências filhas
`Lacuna.Pki …`, e linhas em `customMetrics` para `bulksigner.signing.duration` e
`bulksigner.job.duration`.

## O que é coletado

### Traces — span por job mais eventos de ciclo de vida

Cada job abre um span raiz (`signing.job`, tipo `Internal`, aparecendo no Application Insights como
`dependencies`) na captura, marcado com `job.id`, `signing.profile`, `signing.method` e
`signing.format`. Cada passo abaixo é registrado como um **evento de span** naquele span, de modo que
todos compartilham seu `operation_Id` para correlação:

| Evento | Quando |
|--------|--------|
| `JobCreated` | No enfileiramento (um trace `signing.job.created` autônomo — o span do worker ainda não existe) |
| `JobPickedForProcessing` | O worker reivindica o job |
| `SigningStarted` / `SigningCompleted` | Em torno da chamada de assinatura local |
| `VerificationStarted` / `VerificationCompleted` | Em torno da chamada de verificação (somente quando o perfil tem `Verify = true`) |
| `OutputFileCreated` | Artefato assinado promovido para `output/` |
| `JobCompleted` | Sucesso terminal (status do span `Ok`) |
| `JobFailed` | Falha terminal (status do span `Error`) |
| `JobCanceled` | Cancelamento pelo operador (um trace `signing.job.canceled` autônomo) |
| `DispatchedToSigner` | Job entregue ao Lacuna Signer (caminho remoto — cobertura parcial) |

### Dependências — chamadas do PKI SDK

As chamadas de assinatura e verificação do Lacuna PKI SDK são envolvidas em spans filhos do tipo
`Client`, chamados `Lacuna.Pki SignAsync` e `Lacuna.Pki VerifyAsync`, aparecendo como `dependencies`.
Cada um carrega sua própria duração e uma flag de sucesso; uma chamada falha é marcada como `Error` com
uma mensagem mascarada, de modo que chamadas externas quebradas fiquem visíveis com contexto de
diagnóstico.

### Métricas — `customMetrics`

| Métrica | Unidade | Dimensões |
|---------|---------|-----------|
| `bulksigner.signing.duration` | ms | `signing.method`, `signing.profile`, `signing.format`, `job.status` (`Success` / `Failed`) |
| `bulksigner.job.duration` | ms | `job.status` (`Success` / `Failed`), `signing.profile`, `signing.method` |

O `bulksigner.signing.duration` é o tempo decorrido da própria operação de assinatura; o
`bulksigner.job.duration` é o total, da criação do job até o estado terminal.

### Exceções — `exceptions`

Exceções de processamento tratadas e não tratadas são registradas no span do job com o id do job, o
perfil, o método de assinatura, e o **passo de processamento** em que o erro ocorreu. Mensagens e stack
traces são mascarados antes de deixarem o processo.

## O que é intencionalmente excluído

- **Segredos.** A licença do PKI, senhas de certificado e de PFX, o PIN do PKCS#11, o client secret do
  Azure Key Vault, chaves de API, a senha de criptografia e connection strings são mascarados de todo
  valor anexado à telemetria — inclusive mensagens de exceção e stack traces. Veja
  [Segurança](security.md#mascaramento-de-logs--duas-camadas).
- **Conteúdo de arquivos e material de certificado.** Nunca anexados a span, evento ou métrica alguma.
- **Logs da aplicação.** Logs estruturados **não** são encaminhados ao Application Insights. Somente
  spans, métricas e exceções explicitamente registradas são enviados; os logs permanecem nos destinos de
  arquivo e de console.
- **O id do job como dimensão de métrica.** Mantido fora dos histogramas para limitar a cardinalidade; a
  cronometragem por job vive nos spans correlacionados.
- **O caminho remoto do Lacuna Signer.** A cobertura prioriza a assinatura local. Um job remoto emite
  apenas um span da captura até o despacho; a espera pelo assinador e a conclusão remota não são
  rastreadas.

## Consultas de exemplo (KQL)

Rode estas no recurso do Application Insights (painel *Logs*). Ajuste o intervalo de tempo conforme
necessário.

**Tempo médio de assinatura (local), últimas 24 h:**

```kusto
customMetrics
| where name == "bulksigner.signing.duration"
| where timestamp > ago(24h)
| summarize avg(value), percentiles(value, 50, 95) by tostring(customDimensions["signing.profile"])
```

**Jobs de assinatura mais lentos:**

```kusto
dependencies
| where name == "signing.job"
| where timestamp > ago(24h)
| project timestamp, jobId = tostring(customDimensions["job.id"]),
          profile = tostring(customDimensions["signing.profile"]), duration, success
| top 20 by duration desc
```

**Falhas de assinatura por método de assinatura:**

```kusto
customMetrics
| where name == "bulksigner.signing.duration"
| where tostring(customDimensions["job.status"]) == "Failed"
| summarize failures = count() by method = tostring(customDimensions["signing.method"])
```

**Tempo médio total de processamento:**

```kusto
customMetrics
| where name == "bulksigner.job.duration"
| where tostring(customDimensions["job.status"]) == "Success"
| summarize avg(value), percentiles(value, 50, 95)
```

**Chamadas do PKI SDK que falharam (diagnóstico de chamadas externas):**

```kusto
dependencies
| where name startswith "Lacuna.Pki"
| where success == false
| project timestamp, name, jobId = tostring(customDimensions["job.id"]),
          operation = tostring(customDimensions["pki.operation"]), resultCode
| order by timestamp desc
```

**Exceções de processamento por passo:**

```kusto
exceptions
| where timestamp > ago(24h)
| summarize count() by step = tostring(customDimensions["processing.step"]), type
| order by count_ desc
```

## Por que não há `customEvents`

O Bulk Signer usa a **distro do Azure Monitor OpenTelemetry**, que não tem equivalente ao `TrackEvent` —
o OpenTelemetry não tem uma primitiva de "evento customizado". Os passos do ciclo de vida são, portanto,
modelados como **eventos de span** no span por job e consultados pela tabela `dependencies` e seu
`customDimensions`, e não por `customEvents`. Consultas escritas contra uma aplicação com o SDK clássico
precisarão de adaptação.

## Relacionados

- [Estatísticas de jobs](statistics.md) — os tempos por etapa do dashboard, mantidos na base operacional
  e lidos no escopo da implantação.
- [API REST](rest-api.md) — o endpoint Prometheus `/api/metrics`, o registro durável baseado em coleta.
- [Configuração](configuration.md) — cada chave de configuração.
- [Segurança](security.md) — tratamento de segredos e o mascaramento de logs em duas camadas.

---

**A seguir:** [API REST](rest-api.md) — endpoints, autenticação e o envelope de erro.
**Anterior:** [Estatísticas de jobs](statistics.md).
