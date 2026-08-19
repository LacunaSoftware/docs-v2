---
sidebar_label: "Estatísticas de jobs"
sidebar_position: 8
---

# Estatísticas de jobs

Estatísticas de tempo decorrido por etapa no dashboard — o que é coletado, como cada número é
calculado, e como lê-los quando o processamento parece lento.

## Em resumo

| Pergunta | Resposta |
|----------|----------|
| Onde os números vivem? | **Na base operacional** — uma linha por job concluído. Eles sobrevivem a reinicializações, e em um cluster toda instância mostra os mesmos números de escopo da implantação. |
| Como ligo ou desligo? | `Statistics:Enabled` (padrão `true`). Quando `false`, nada é registrado e o painel do dashboard desaparece. |
| O que é medido? | Quatro etapas por job — **espera na fila, assinatura, verificação, criação da saída** — mais um **total** (a soma delas). |
| O que *não* é medido? | As duas esperas humanas: a espera em **`AwaitingSigner`** do Lacuna Signer e a espera em **`AwaitingApproval`**. Ambas são deliberadamente excluídas — veja [abaixo](#por-que-as-esperas-humanas-são-excluídas). |
| Onde eu vejo isso? | Na página inicial do **Dashboard**, painel "Desempenho de processamento". Atualiza na consulta normal do dashboard (`Dashboard:PollIntervalSeconds`). |
| Como eu limpo isso? | O [Clear Jobs](operations.md#clear-jobs) move um **marcador de reset** de escopo da implantação. Nada é apagado — veja [Zerando o painel](#zerando-o-painel). |
| Quer histórico durável *fora* do produto? | Colete o `/api/metrics` — o `bulksigner_signing_duration_seconds` é o registro externo (veja [API REST](rest-api.md)). |

:::note Mudou na 2.0.0
Os números viviam na memória do processo e eram zerados a cada reinicialização. Agora eles são linhas na
base operacional, que é o que faz o painel sobreviver a uma reinicialização e descrever um cluster
inteiro, em vez da instância que por acaso respondeu. Um card foi aposentado na mudança — veja
[A "Vazão máxima/s" acabou](#a-vazão-máximas-acabou).
:::

## O que é coletado

Para cada job o pipeline cronometra quatro etapas, medidas com um relógio monotônico em limites exatos
de código:

| Etapa | Começa em | Termina em |
|-------|-----------|------------|
| **Espera na fila** | O job entrou na fila (`QueuedAt`) | O worker pega o job (transição para `Processing`) |
| **Assinatura** | Local: imediatamente antes da chamada de assinatura. Remota: imediatamente antes da criação do documento (despacho) **e** imediatamente antes do download do assinado (consulta) | Imediatamente depois de cada uma dessas chamadas retornar |
| **Verificação** | Imediatamente antes de a assinatura ser verificada | Imediatamente depois de ela retornar (jobs que pulam a etapa não contribuem com amostra) |
| **Criação da saída** | Criptografar (se habilitado) + escrever em `processing/` | Depois da promoção para `output/` e da exclusão do original |

**Total = espera na fila + assinatura + verificação + saída.** Este é o tempo ativo de máquina que o job
custou, de ponta a ponta. Ele **não** é o tempo de relógio de parede entre criação e conclusão de um job
remoto, porque isso incluiria a espera pela assinatura humana.

Quando o job alcança `Completed`, aquelas quatro durações são escritas na base como uma linha, junto com
o timestamp de conclusão e se o job foi assinado como **Local** ou **Remoto (Lacuna Signer)**. Todo
número no painel é um agregado sobre aquelas linhas.

Uma etapa que não aconteceu é armazenada como **nula**, nunca como zero: um job cujo perfil define
`Verify = false` não tem amostra de verificação, então ele não puxa a média daquela etapa para baixo nem
infla sua contagem. O total ainda soma as etapas que aconteceram.

## Onde os números vivem, e o que isso compra

Uma linha por job **concluído**, no mesmo banco de dados dos próprios jobs, removida em cascata junto com
seu job. Três consequências que vale conhecer:

- **Eles sobrevivem a uma reinicialização.** Não existe mais uma janela "desde o boot". A legenda diz
  quantos jobs concluíram e desde quando, sendo "desde quando" o último reset se houve um, e, caso
  contrário, a conclusão mais antiga ainda registrada.
- **Toda instância mostra os mesmos números.** Sob o [modo cluster](azure.md), o dashboard que você
  alcança é aquela instância que o balanceador de carga escolheu, e o painel descreve a implantação
  inteira em vez da parcela daquela instância.
- **Eles crescem com jobs concluídos e nada mais.** Um punhado de colunas numéricas por job, limitado por
  uma contagem de jobs que a base já carrega.

**Um job em andamento ainda é medido na memória do processo** e só se torna uma linha quando conclui.
Portanto um host morto no meio de um job perde os tempos parciais daquele job: o job registra **nada**
em vez de algo errado, e todo job que terminou antes da reinicialização não é afetado.

## O que cada métrica do dashboard significa

O painel "Desempenho de processamento" mostra:

| Métrica | Significado |
|---------|-------------|
| **Tempo médio de job** | Média do total por job (tempo ativo). |
| **Assinatura média** | Tempo médio da etapa de assinatura. Para jobs remotos isto é despacho + download, *não* a espera entre eles. |
| **Verificação média** | Tempo médio da etapa de verificação. Jobs que pulam a verificação (`Verify = false`) não são contados, então esta média reflete apenas jobs que de fato verificaram. |
| **Vazão (último min)** | Conclusões nos 60 segundos anteriores, expressas por minuto — uma taxa responsiva de "agora". |
| **Tempo total de processamento — Mín. / Méd. / Máx.** | Os totais por job extremos e o médio, na forma `hh:mm:ss.fff`. Mín. e Máx. são observações de um único job, úteis para identificar valores atípicos. |
| **Média por etapa — Espera na fila / Saída** | Tempo médio de acúmulo na entrada e tempo médio de materialização da saída (criptografia + promoção). |
| **Por método — Local (n) / Remoto (n)** | Total médio para jobs assinados localmente vs. pelo Lacuna Signer, com a contagem de amostras entre parênteses. |
| **Tempo de vida** | Jobs concluídos ÷ a janela que as linhas cobrem, expresso por minuto. |

A legenda mostra quantos jobs concluíram e o início daquela janela.

As durações são renderizadas de duas formas: texto arredondado nos cards de estatística (`2 min 14 sec`,
`3.4 sec`, `421 ms`) e `hh:mm:ss.fff` fixo na linha de mín./méd./máx. (`00:00:03.421`). Uma etapa ainda
sem amostras mostra um travessão (`—`). As durações são armazenadas com precisão de milissegundo, que é
exatamente a resolução mais fina que qualquer das duas renderizações mostra.

### A "Vazão máxima/s" acabou

Havia um card mostrando o segundo de relógio de parede mais movimentado observado. Ele media o tempo de
vida de um processo, então, sob um cluster, teria descrito a sorte de uma instância, e não há forma
honesta de reconstruir um equivalente de escopo da implantação a partir de timestamps de conclusão. Ele
foi **aposentado em vez de aproximado**. A "Vazão (último min)" responde à pergunta para a qual ele era
lido na maior parte das vezes, e o `bulksigner_signing_duration_seconds` em `/api/metrics` não mudou e
continua sendo o registro externo.

## Como o tempo decorrido é calculado

A cronometragem usa uma fonte de relógio monotônica, não afetada por ajustes de relógio de parede (passos
de NTP, horário de verão), de modo que uma mudança de relógio no meio de um job não pode produzir um
intervalo negativo ou absurdamente errado. Cada intervalo medido envolve exatamente uma operação;
intervalos negativos por casos-limite de relógio são truncados em zero antes de serem armazenados.

Os tempos parciais de um job são mantidos em uma entrada "em andamento" chaveada pelo id do job enquanto
ele é processado. O caminho remoto abrange dois workers — um registra o intervalo de despacho, o outro
registra os intervalos de download, verificação e saída na *mesma* entrada, quando o documento volta,
**na mesma instância**, porque um job pertence a uma instância da captura até o status terminal. Na
conclusão bem-sucedida a entrada se torna uma linha; em qualquer falha, cancelamento ou timeout ela é
descartada, de modo que um job que nunca termina não vaza memória nem distorce as médias.

### Por que as esperas humanas são excluídas

Um documento do Lacuna Signer pode ficar em `AwaitingSigner` por horas ou dias enquanto uma pessoa o
assina (o `Signer:TimeoutHours` tem padrão de uma semana inteira). Se aquela espera fosse dobrada dentro
do "tempo médio de assinatura", um único humano lento dominaria todos os números e o painel deixaria de
lhe dizer qualquer coisa sobre o desempenho do *sistema*. Portanto a espera entre despacho e download
nunca é cronometrada. Para ver quanto tempo os documentos ficam retidos aguardando assinatura, use a
contagem de `AwaitingSigner` no dashboard, o timestamp `AwaitingSignerSince` por job, ou a métrica
`bulksigner_jobs_awaiting_signer` — veja
[Integração com o Lacuna Signer](lacuna-signer.md).

A espera em **`AwaitingApproval`** é excluída pelo mesmo motivo, e de forma mais direta: ficar retido
descarta a entrada "em andamento" do job por completo, então um job retido não contribui com nada. Para
ver quanto tempo os jobs estão retidos, use o card "Aguardando aprovação" e a duração de espera por linha
em `/jobs`, o timestamp `AwaitingApprovalSince` por job, ou a métrica
`bulksigner_jobs_awaiting_approval` — veja [Aprovações](approvals.md).

**Um job liberado é medido a partir da liberação, e não de quando o arquivo chegou.** Uma vez atingido o
quórum, o job reentra na fila e é capturado do zero, abrindo uma *segunda* entrada de cronometragem — e a
espera na fila daquela entrada é ancorada em `QueuedAt`, que a liberação reestampa. Sem aquela âncora a
segunda captura mediria desde `CreatedAt` e silenciosamente reimportaria toda a espera de aprovação que a
exclusão acima existe para manter de fora. Então um job que esperou dois dias por um quórum e depois
assinou em 400 ms contribui como um job de 400 ms, que é a leitura honesta do que o pipeline fez.

## Zerando o painel

Rodar o [Clear Jobs](operations.md#clear-jobs) registra um **marcador de reset de escopo da
implantação**: daí em diante os agregados contam apenas jobs que concluíram depois dele. Ele tem efeito
em toda instância de uma vez, porque o marcador é uma linha em vez de uma variável em um processo.

Três coisas decorrem, e a segunda é o ponto:

- **Nada é apagado para limpar o painel.** As linhas que um reset esconde continuam armazenadas e
  continuam consultáveis. O que *de fato* remove uma linha é o job ir embora — um job apagado leva seus
  tempos consigo, pela chave estrangeira.
- **Um job que a limpeza deixou em paz mantém sua medição.** O Clear Jobs apaga somente jobs com os quais
  o pipeline terminou; um não finalizado sobrevive, e quando ele conclui depois, sua linha aterrissa após
  o marcador e conta.
- **O reset é desfeito junto com a limpeza.** O marcador se move dentro da transação da limpeza, então
  uma limpeza que falha deixa o painel exatamente como estava.

O histograma do Prometheus é um contador monotônico e **não** é afetado por nada disso.

## Usando as estatísticas para diagnosticar processamento lento

Leia a divisão por etapa para localizar uma lentidão:

| Sintoma | Causa provável | Onde olhar em seguida |
|---------|----------------|----------------------|
| **Espera na fila** alta, todo o resto normal | Acúmulo — arquivos chegam mais rápido do que o worker os drena | Aumente o `Pipeline:MaxConcurrency` (atente à ressalva sobre PKCS#11 / repositório do Windows em [Configuração](configuration.md)); confira a contagem de Queued |
| **Assinatura** alta em jobs **Local** | Origem de certificado lenta — idas e voltas a HSM/PKCS#11, um token em contenção com `MaxConcurrency > 1`, ou latência do Key Vault | [Certificados](certificates.md); considere manter perfis baseados em token em `MaxConcurrency = 1` |
| **Assinatura** alta em jobs **Remoto** | API do Lacuna Signer lenta (criação/download), não a espera humana | `bulksigner_signer_api_errors_total`, rede até o endpoint do Signer; [Integração com o Lacuna Signer](lacuna-signer.md) |
| **Verificação** alta | Artefatos grandes ou verificações de revogação/cadeia lentas durante a verificação | Configurações de `Verify` do perfil; tamanhos dos artefatos |
| **Saída** alta | Custo da criptografia ou armazenamento de `output/` lento (compartilhamento de rede, disco lento) | [Criptografia](encryption.md); o volume de `output/` |
| **Máx.** ≫ **Méd.** | Alguns valores atípicos (arquivos grandes, uma parada transitória) | Ordene os jobs recentes por tamanho; confira os logs em torno do pico |
| **Vazão (último min)** ≪ **Tempo de vida** | Uma parada ou pausa atual | Estado de pausa do pipeline; o card ao vivo "Em andamento" / "Slots ocupados" |

Como as linhas persistem, o painel agora é um sinal de tendência além de um sinal ao vivo — a janela que
ele cobre é o tempo que você vem mantendo jobs concluídos. Para análise fora do produto, colete o
endpoint do Prometheus para o Grafana; o histograma `bulksigner_signing_duration_seconds` é a contraparte
durável, e ele não é afetado por resets.

:::note Em um cluster, leia o painel e o `/api/metrics` de formas diferentes
O painel é de escopo da implantação porque agrega linhas. O `/api/metrics` é **por processo** e uma coleta
alcança uma instância arbitrária, então um gauge por instância lido como total da frota subestima — veja
[Alta disponibilidade](high-availability.md#a-coleta-de-métricas-alcança-uma-instância-arbitrária).
:::

## Configuração

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Statistics:Enabled` | bool | `true` | `Statistics__Enabled` | Chave mestra. `false` faz o coletor não fazer nada, não escreve linha, e oculta o painel do dashboard. Desligá-la não apaga linhas já registradas — religá-la as mostra de novo. |

---

**A seguir:** [Telemetria](telemetry.md) — integração opcional com o Application Insights.
**Anterior:** [Dashboard](dashboard.md).
