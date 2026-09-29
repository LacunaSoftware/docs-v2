---
sidebar_label: "Estatísticas de jobs"
sidebar_position: 8
---

# Estatísticas de jobs

Estatísticas de tempo decorrido por etapa no dashboard — o que é coletado, como cada número é
calculado e como interpretá-los quando o processamento parece lento.

## Em resumo

| Pergunta | Resposta |
|----------|----------|
| Onde ficam os números? | **No banco de dados operacional** — uma linha por job concluído. Eles sobrevivem a reinicializações, e, em um cluster, todas as instâncias mostram os mesmos números, que valem para a implantação inteira. |
| Como ligo ou desligo? | `Statistics:Enabled` (padrão `true`). Quando `false`, nada é registrado e o painel do dashboard desaparece. |
| O que é medido? | Quatro etapas por job — **espera na fila, assinatura, verificação, criação da saída** — mais um **total** (a soma delas). |
| O que *não* é medido? | As duas esperas por pessoas: a espera em **`AwaitingSigner`** do Lacuna Signer e a espera em **`AwaitingApproval`**. Ambas são excluídas de propósito — veja [abaixo](#por-que-as-esperas-humanas-são-excluídas). |
| Onde vejo isso? | Na página inicial do **Dashboard**, no painel "Desempenho de processamento", atualizado no polling normal do dashboard (`Dashboard:PollIntervalSeconds`) — e, para um job específico, na seção **Tempo de processamento** da página dele (veja [abaixo](#os-números-de-um-único-job)). |
| Como zero o painel? | O [Limpar Jobs](operations.md#limpar-jobs) move um **marcador de zeragem** que vale para a implantação inteira e exclui todos os jobs com as respectivas linhas de tempos — veja [Zerando o painel](#zerando-o-painel). |
| Quer um histórico durável *fora* do produto? | Colete o `/api/metrics` — o `bulksigner_signing_duration_seconds` é o registro externo (veja [API REST](rest-api.md)). |

:::note Mudou na 2.0.0
Os números ficavam na memória do processo e eram zerados a cada reinicialização. Agora eles são linhas no
banco operacional, e é isso que faz o painel sobreviver a uma reinicialização e descrever um cluster
inteiro, em vez da instância que por acaso respondeu. Um card foi aposentado na mudança — veja
[A "Vazão máxima/s" acabou](#a-vazão-máximas-acabou).
:::

## O que é coletado

Para cada job, o pipeline cronometra quatro etapas, medidas com um relógio monotônico em pontos exatos do
código:

| Etapa | Começa em | Termina em |
|-------|-----------|------------|
| **Espera na fila** | O job entrou na fila (`QueuedAt`) | O worker captura o job (transição para `Processing`) |
| **Assinatura** | Local: imediatamente antes da chamada de assinatura. Remota: imediatamente antes da criação do documento (despacho) **e** imediatamente antes do download do documento assinado (polling) | Imediatamente depois que cada uma dessas chamadas retorna |
| **Verificação** | Imediatamente antes de a assinatura ser verificada | Imediatamente depois que a verificação retorna (jobs que pulam a etapa não geram amostra) |
| **Criação da saída** | Criptografar (se habilitado) + gravar em `processing/` | Depois da promoção para `output/` e da exclusão do original |

**Total = espera na fila + assinatura + verificação + saída.** É o tempo ativo de máquina que o job
consumiu, de ponta a ponta. Ele **não** é o tempo de relógio decorrido entre a criação e a conclusão de
um job remoto, porque isso incluiria a espera pela assinatura humana.

Quando o job chega a `Completed`, essas quatro durações são gravadas no banco como uma linha, junto com o
timestamp de conclusão e a indicação de que o job foi assinado como **Local** ou **Remoto (Lacuna
Signer)**. Todos os números do painel são agregados dessas linhas.

Uma etapa que não aconteceu é armazenada como **nula**, nunca como zero: um job cujo perfil define
`Verify = false` não tem amostra de verificação, então não puxa para baixo a média dessa etapa nem infla
a sua contagem. O total continua somando as etapas que aconteceram.

## Onde os números ficam e o que se ganha com isso

Uma linha por job **concluído**, no mesmo banco de dados dos próprios jobs, removida em cascata junto com
o job. Três consequências que vale a pena conhecer:

- **Eles sobrevivem a uma reinicialização.** Não existe mais uma janela "desde o boot". A legenda diz
  quantos jobs foram concluídos e desde quando — "desde quando" é o último reset, se houve algum, ou,
  caso contrário, a conclusão mais antiga ainda registrada.
- **Todas as instâncias mostram os mesmos números.** No [modo cluster](azure.md), o dashboard que você
  acessa é o da instância que o balanceador de carga escolheu, e o painel descreve a implantação inteira,
  e não só a parcela daquela instância.
- **Eles crescem com os jobs concluídos, e com nada mais.** Um punhado de colunas numéricas por job,
  limitado por uma contagem de jobs que o banco já mantém.

**Um job em andamento continua sendo medido na memória do processo** e só vira uma linha quando é
concluído. Portanto, um host derrubado no meio de um job perde os tempos parciais desse job: o job não
registra **nada**, em vez de registrar algo errado, e nenhum job concluído antes da reinicialização é
afetado.

## O que cada métrica do dashboard significa

O painel "Desempenho de processamento" mostra:

| Métrica | Significado |
|---------|-------------|
| **Tempo médio por job** | Média do total por job (tempo ativo). |
| **Média de assinatura** | Tempo médio da etapa de assinatura. Para jobs remotos, é o despacho + o download, *não* a espera entre eles. |
| **Média de verificação** | Tempo médio da etapa de verificação. Jobs que pulam a verificação (`Verify = false`) não são contados; assim, esta média reflete apenas os jobs que de fato passaram pela verificação. |
| **Vazão (último min)** | Conclusões nos últimos 60 segundos, expressas por minuto — uma taxa que reage rápido e mostra o "agora". |
| **Tempo total de processamento — Mín / Média / Máx** | Os totais por job extremos e o médio, no formato `hh:mm:ss.fff`. Mín e Máx são observações de um único job, úteis para identificar valores atípicos. |
| **Média por etapa — Espera na fila / Saída** | Tempo médio de acúmulo na entrada e tempo médio de geração da saída (criptografia + promoção). |
| **Por método — Local (n) / Remoto (n)** | Total médio dos jobs assinados localmente e dos assinados pelo Lacuna Signer, com a contagem de amostras entre parênteses. |
| **Acumulado** | Jobs concluídos ÷ o período coberto pelas linhas, expresso por minuto. |
| **Job mais lento** | O job concluído responsável pelo **Máx** — com o nome, o total em `hh:mm:ss.fff` e quando foi concluído, e com link para a sua página, para que você veja o que o deixou lento. Calculado sobre as mesmas linhas que todo o resto acima, então um reset também o altera. Não aparece quando nenhum job foi concluído desde o reset. |

A legenda mostra quantos jobs foram concluídos e o início desse período.

Há mais um card na grade de estatísticas no topo da página, e não neste painel, porque ele não é uma
estatística: **Em execução há** (**Há mais tempo em execução** quando `Pipeline:MaxConcurrency > 1`)
mostra o job em andamento que está há mais tempo com o pipeline, com um contador ao vivo que avança a
cada segundo e link para a página do job. Ele é medido a partir da captura mais recente do job — um job
liberado da aprovação é capturado duas vezes, e a deliberação humana entre as duas capturas não é tempo
de execução — ou, em um job que voltou do Lacuna Signer, a partir do download que o trouxe de volta, já
que a captura de um job remoto pode ter acontecido dias antes. Ele só aparece enquanto há algo em
andamento e não depende de `Statistics:Enabled`.

As durações são exibidas de duas formas: texto arredondado nos cards de estatística (`2 min 14 sec`,
`3.4 sec`, `421 ms`) e `hh:mm:ss.fff` fixo na linha de mín/média/máx (`00:00:03.421`). Uma etapa ainda
sem amostras mostra um travessão (`—`). As durações são armazenadas com precisão de milissegundo, que é
exatamente a menor resolução mostrada por qualquer das duas formas.

### A "Vazão máxima/s" acabou

Havia um card que mostrava o segundo de relógio mais movimentado já observado. Ele media o que acontecia
durante a vida de um único processo; em um cluster, portanto, retrataria apenas a sorte de uma instância,
e não há forma honesta de reconstruir um equivalente para a implantação inteira a partir dos timestamps
de conclusão. Ele foi **aposentado em vez de aproximado**. A "Vazão (último min)" responde à pergunta
para a qual ele era consultado na maioria das vezes, e o `bulksigner_signing_duration_seconds` em
`/api/metrics` não mudou e continua sendo o registro externo.

## Os números de um único job

A linha que o painel agrega também é o detalhamento de um job, e a página do job (`/jobs/{id}`) a exibe
em uma seção **Tempo de processamento**, de uma de duas formas:

- **Um job concluído** mostra as quatro etapas e o total exatamente como foram registrados, em
  `hh:mm:ss.fff`, ao lado de quando o pipeline iniciou o job e de quando ele foi concluído. A etapa
  **Saída** é o pós-processamento — criptografia, promoção para `output/` e exclusão do original. Uma
  etapa que não aconteceu — a verificação em um perfil com `Verify = false` — aparece como **não
  executada**, nunca como `00:00:00.000`, a mesma distinção que as médias do painel mantêm. A legenda
  explica o que "total" significa ali: para um job do Lacuna Signer, é a criação e o download do
  documento, e nunca a espera pelo signatário, e, para qualquer método, a espera por um aprovador não
  entra na conta. Assim, em um job remoto ou com etapa de aprovação, o total é bem menor que o intervalo
  entre a primeira e a última entrada da linha do tempo — e essa diferença é a
  [exclusão descrita abaixo](#por-que-as-esperas-humanas-são-excluídas).
- **Um job em andamento** (`Processing` ou `Verifying`) mostra há quanto tempo o pipeline o mantém, ao
  vivo — o mesmo número, e a mesma regra, do card *Em execução há* do dashboard. O detalhamento por etapa
  ainda não existe; ele é gravado quando o job é concluído.

Nos demais jobs, **a seção não aparece**: um job com falha, cancelado ou expirado não registra tempos (há
uma linha por job *concluído*), e um job concluído sem linha — as estatísticas estavam desligadas, ou o
host caiu no meio do job — não mostra nada, em vez de uma linha de travessões.
`Statistics:Enabled = false` oculta o detalhamento por etapa junto com o painel; o contador ao vivo de um
job em andamento não é uma estatística e continua visível. Um aprovador que pode abrir a página do job também vê a seção — ela é
um registro sobre o job, e não um recurso.

O que a seção deliberadamente **não** oferece: agrupamento ou filtro por perfil, pasta ou intervalo de
datas; o tempo decorrido de um job com falha até a falha, ou contagens de erros por tipo; tempos por
tentativa (uma nova tentativa é um job novo, e é cronometrada como tal); a divisão do intervalo de
assinatura do Lacuna Signer entre criação e download (os dois são somados em **Assinatura**); e visões de
mediana, percentil ou "dez mais lentos". Para uma análise desse tipo, use o histograma
`bulksigner_signing_duration_seconds` do `/api/metrics`.

## Como o tempo decorrido é calculado

A cronometragem usa uma fonte de relógio monotônica, que não é afetada por ajustes do relógio do sistema
(correções de NTP, horário de verão); assim, uma mudança de relógio no meio de um job não pode produzir um
intervalo negativo ou absurdamente errado. Cada intervalo medido envolve exatamente uma operação;
intervalos negativos causados por casos-limite do relógio são arredondados para zero antes de serem
armazenados.

Enquanto o job é processado, os tempos parciais ficam em uma entrada "em andamento", identificada pelo id
do job. O caminho remoto envolve dois workers — um registra o intervalo de despacho, e o outro registra os
intervalos de download, verificação e saída na *mesma* entrada, quando o documento volta, **na mesma
instância**, porque um job pertence a uma única instância desde a captura até o status terminal. Na
conclusão bem-sucedida, a entrada vira uma linha; em qualquer falha, cancelamento ou timeout, ela é
descartada, de modo que um job que nunca termina não vaza memória nem distorce as médias.

### Por que as esperas humanas são excluídas

Um documento do Lacuna Signer pode ficar em `AwaitingSigner` por horas ou dias enquanto uma pessoa o
assina (o padrão de `Signer:TimeoutHours` é uma semana inteira). Se essa espera fosse somada ao "tempo
médio de assinatura", um único signatário lento dominaria todos os números, e o painel deixaria de dizer
qualquer coisa sobre o desempenho do *sistema*. Portanto, a espera entre o despacho e o download nunca é
cronometrada. Para ver quanto tempo os documentos ficam retidos aguardando assinatura, use a contagem de
`AwaitingSigner` no dashboard, o timestamp `AwaitingSignerSince` de cada job ou a métrica
`bulksigner_jobs_awaiting_signer` — veja
[Integração com o Lacuna Signer](lacuna-signer.md).

A espera em **`AwaitingApproval`** é excluída pelo mesmo motivo, e de forma ainda mais direta: ficar
retido descarta por completo a entrada "em andamento" do job, então um job retido não contribui com nada.
Para ver há quanto tempo os jobs estão retidos, use o card "Aguardando aprovação" e a duração de espera de
cada linha em `/jobs`, o timestamp `AwaitingApprovalSince` de cada job ou a métrica
`bulksigner_jobs_awaiting_approval` — veja [Aprovações](approvals.md).

**Um job liberado é medido a partir da liberação, e não de quando o arquivo chegou.** Quando o quórum é
atingido, o job volta para a fila e é capturado do zero, o que abre uma *segunda* entrada de
cronometragem — e a espera na fila dessa entrada é calculada a partir de `QueuedAt`, que a liberação
atualiza. Sem essa referência, a segunda captura mediria desde `CreatedAt` e reintroduziria
silenciosamente toda a espera de aprovação que a exclusão acima existe para deixar de fora. Assim, um job
que esperou dois dias por um quórum e depois foi assinado em 400 ms conta como um job de 400 ms, que é a
leitura honesta do que o pipeline fez.

## Zerando o painel

Executar o [Limpar Jobs](operations.md#limpar-jobs) registra um **marcador de zeragem que vale para a
implantação inteira**: a partir daí, os agregados contam apenas os jobs concluídos depois dele. Ele tem
efeito em todas as instâncias ao mesmo tempo, porque o marcador é uma linha no banco, e não uma variável
em um processo.

Daí decorrem três coisas:

- **O marcador em si não apaga nada — o que apaga é a exclusão dos jobs.** Uma linha de tempos só é
  removida quando o seu job é removido, pela chave estrangeira. Desde a 2.9.0, o Limpar Jobs exclui
  **todos** os jobs; por isso, as linhas que ele oculta normalmente já foram embora junto com os seus
  jobs. Da mesma forma, excluir um único job pela página Jobs remove também os tempos dele.
- **Um job concluído depois da limpeza conta a partir do marcador.** O marcador cobre o job que foi
  enfileirado enquanto a limpeza rodava: a linha dele é gravada depois do marcador e entra na conta.
- **O reset é desfeito junto com a limpeza.** O marcador é movido dentro da transação da limpeza, então
  uma limpeza que falha deixa o painel exatamente como estava.

:::warning Mudou na 2.9.0
Antes da 2.9.0, o Limpar Jobs preservava os jobs não finalizados, e o marcador era o que permitia a um job
desses manter a medição incompleta e entrar na conta quando fosse concluído. Agora o Limpar Jobs exclui
todos os jobs, qualquer que seja o status, então não sobra nenhum job para o marcador proteger.
:::

O histograma do Prometheus é um contador monotônico e **não** é afetado por nada disso.

## Usando as estatísticas para diagnosticar processamento lento

Leia a divisão por etapa para localizar uma lentidão:

| Sintoma | Causa provável | Onde olhar em seguida |
|---------|----------------|----------------------|
| **Espera na fila** alta, todo o resto normal | Acúmulo — os arquivos chegam mais rápido do que o worker consegue processá-los | Aumente o `Pipeline:MaxConcurrency` (atenção à ressalva sobre PKCS#11 / repositório do Windows em [Configuração](configuration.md)); confira a contagem de Queued |
| **Assinatura** alta em jobs **Local** | Origem de certificado lenta — idas e voltas ao HSM/PKCS#11, um token disputado com `MaxConcurrency > 1` ou latência do Key Vault | [Certificados](certificates.md); considere manter os perfis baseados em token com `MaxConcurrency = 1` |
| **Assinatura** alta em jobs **Remoto** | API do Lacuna Signer lenta (criação/download), e não a espera humana | `bulksigner_signer_api_errors_total`, rede até o endpoint do Signer; [Integração com o Lacuna Signer](lacuna-signer.md) |
| **Verificação** alta | Artefatos grandes ou verificações de revogação/cadeia lentas durante a verificação | Configurações de `Verify` do perfil; tamanho dos artefatos |
| **Saída** alta | Custo da criptografia ou armazenamento de `output/` lento (compartilhamento de rede, disco lento) | [Criptografia](encryption.md); o volume de `output/` |
| **Máx** ≫ **Média** | Alguns valores atípicos (arquivos grandes, uma parada momentânea) | Ordene os jobs recentes por tamanho; confira os logs em torno do pico |
| **Vazão (último min)** ≪ **Acumulado** | Uma parada ou pausa em curso | Estado de pausa do pipeline; o card ao vivo "Em andamento" / "Slots ocupados" |

Como as linhas persistem, o painel agora é um indicador de tendência, além de um indicador ao vivo — o
período que ele cobre é o tempo durante o qual você vem mantendo os jobs concluídos. Para análise fora do
produto, colete o endpoint do Prometheus no Grafana; o histograma `bulksigner_signing_duration_seconds` é
a contraparte durável e não é afetado por resets.

:::note Em um cluster, leia o painel e o `/api/metrics` de formas diferentes
O painel vale para a implantação inteira porque agrega linhas. O `/api/metrics` é **por processo**, e
cada coleta atinge uma instância arbitrária; por isso, um gauge por instância lido como total do cluster
fica abaixo do valor real — veja
[Alta disponibilidade](high-availability.md#a-coleta-de-métricas-alcança-uma-instância-arbitrária).
:::

## Configuração

| Chave | Tipo | Padrão | Override por env | Observações |
|-------|------|--------|------------------|-------------|
| `Statistics:Enabled` | bool | `true` | `Statistics__Enabled` | Chave geral. `false` desativa o coletor, que não grava nenhuma linha, e oculta o painel do dashboard. Desligá-la não apaga as linhas já registradas — ao religá-la, elas voltam a aparecer. |

---

**A seguir:** [Telemetria](telemetry.md) — integração opcional com o Application Insights.
**Anterior:** [Dashboard](dashboard.md).
