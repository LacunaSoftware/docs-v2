---
sidebar_label: "Integração com o Lacuna Signer"
sidebar_position: 12
---

# Integração com o Lacuna Signer

Passo a passo para o operador encaminhar um perfil pelo **Lacuna Signer** em vez de um certificado
mantido localmente. Assinatura com certificado local (PFX / PKCS#11 / repositório do Windows) e
assinatura pelo Lacuna Signer **coexistem por perfil** — pastas monitoradas diferentes podem usar
métodos de assinatura diferentes na mesma instância.

## Quando usar isto

Escolha **`Method = LacunaSigner`** para um perfil quando:

- Um humano (e não um certificado mantido pelo servidor) precisa assinar cada documento — por exemplo,
  contratos com contra-assinatura, contratos de trabalho, documentação de admissão de RH.
- A identidade do signatário é a do participante, não a do serviço. Cada documento despachado pertence
  ao participante do lado do Signer.
- A trilha de auditoria que você quer é a que o Signer mantém (identidade do signatário, evidência da
  assinatura, motivos de recusa, expiração).

Escolha **`Method = Local`** (o padrão) quando:

- A assinatura é a *do serviço* — assinatura automatizada de notas fiscais com o certificado de
  assinatura da empresa, assinatura de NFe em tempo de execução em um token PKCS#11, contra-assinatura
  em lote.
- O certificado vive no host (PFX / HSM / repositório do Windows) e não há humano no circuito.

Os dois podem rodar lado a lado. Uma única instância pode monitorar `input/contracts/` (LacunaSigner) e
`input/nfe/` (PKCS#11 local) ao mesmo tempo.

## Resumo da arquitetura

```
input/ ─▶ Observador ─▶ Queued ─▶ worker reivindica
                                        │
                    profile.Method?  ───┤
                                        │
   Local ───────────────────────────────▶ assina no slot ─▶ Verifying ─▶ Completed
                                        │
   LacunaSigner ─▶ upload + cria documento ─▶ AwaitingSigner  (slot de concorrência LIBERADO)
                                                     │
                       tique do worker de consulta ──┤
                                                     │
                              Pending      → continua AwaitingSigner
                              Concluded    → baixa os bytes ─▶ Verifying ─▶ Completed
                              Refused/Expired/Canceled → Failed
                              timeout      → Failed
```

Dois **workers cooperantes** em vez de um:

1. **O worker do pipeline** reivindica jobs `Queued` e, para perfis LacunaSigner, *apenas* os despacha
   ao Signer (upload + criação de documento) e os transiciona para `AwaitingSigner`. O slot do pipeline
   é **liberado imediatamente após o despacho** — o job agora está retido do lado remoto e o worker
   está livre para pegar o próximo item.
2. **Um worker de consulta separado** acorda a cada `Signer:PollIntervalSeconds` (padrão 30 s) e
   percorre cada linha `AwaitingSigner`. Para cada linha, ele confere o status do documento na API do
   Signer; documentos concluídos são baixados e empurrados pela mesma cauda de verificar → criptografar
   → promover que o caminho Local usa.

Essa divisão importa: segurar um slot de `Pipeline:MaxConcurrency` enquanto um humano leva dias para
assinar derrotaria a fila por completo.

## A máquina de estados, estendida

O `AwaitingSigner` se encaixa entre `Processing` e `Verifying` para perfis LacunaSigner:

```
Queued ─▶ Processing ─┬─ assinatura local ok ────────▶ Verifying ─▶ Completed
                      │                                            └▶ Failed
                      └─ despachado ao Signer ─▶ AwaitingSigner
                                                      │
                          concluído → download ───────┼──▶ Verifying ─▶ Completed
                          recusado/expirado/timeout ──┴──▶ Failed
                          cancel do operador ────────────▶ Canceled (cancelamento remoto em melhor esforço)
```

Perfis somente Local nunca entram em `AwaitingSigner`. Perfis LacunaSigner nunca tomam o caminho local
direto `Processing → Verifying`.

## Configuração

### `Signer:*` — um tenant por host

A conexão com o Signer é **global** — um endpoint + uma chave de API para o host, compartilhados por
cada perfil que usa `Method = LacunaSigner`.

| Chave | Tipo | Padrão | Override por env | Obrigatória quando |
|-------|------|--------|------------------|--------------------|
| `Signer:Endpoint` | string | `""` | `Signer__Endpoint` | Qualquer parte de `Signer:*` está definida. Padrão na nuvem: `https://signer.lacunasoftware.com`. |
| `Signer:ApiKey` | string | `""` | `Signer__ApiKey` | **REQUIRED, SECRET**, mesma condição. Formato: `application-id\|secret`. |
| `Signer:PollIntervalSeconds` | int | `30` | `Signer__PollIntervalSeconds` | opcional |
| `Signer:TimeoutHours` | int | `168` (7 dias) | `Signer__TimeoutHours` | opcional |
| `Signer:MaxConsecutiveApiFailures` | int | `5` | `Signer__MaxConsecutiveApiFailures` | opcional |

O validador é **autocondicionado a esta seção** — omita `Signer:*` por inteiro e nada aqui é exigido,
que é o que uma implantação puramente Local faz. Escreva qualquer parte dela e o bloco inteiro é
validado.

:::warning Mudou na 2.1.0 — o bloco `Signer:*` é julgado por si só
Até a 2.0.x o bloco só era validado quando algum perfil selecionava `Method = LacunaSigner`. Os perfis
agora vivem na base operacional e podem ser trocados para o Lacuna Signer pelo dashboard sem
reinicialização, então a regra é enunciada ao contrário:

- **Um bloco `Signer:` escrito pela metade recusa o boot** mesmo que nenhum perfil o use — um endpoint
  sem chave de API, digamos, deixado para depois. A mensagem nomeia as duas chaves e oferece remover a
  seção como remédio.
- **Selecionar `Method = LacunaSigner` é recusado quando o host não tem configurações `Signer:*`** — no
  boot, para um perfil ainda semeado a partir da configuração, e na página do perfil, para um que está
  sendo salvo.
- **Ter ou não configurações `Signer:*` é o que inicia o gateway do assinador remoto e o worker de
  consulta**, então um perfil trocado para o Lacuna Signer depois do boot começa a despachar sem
  reinicialização. Em um host com o bloco inteiro definido e nenhum perfil o usando, o worker de consulta
  roda e não encontra nada a fazer a cada intervalo — remova a seção se este host assina tudo
  localmente.
:::

:::warning A chave de API é um segredo.
Defina-a como `Signer__ApiKey` no `bulksigner.env` (Linux) / uma variável de ambiente de máquina
(Windows) / `.env` (Docker). O valor literal é removido dos logs.
:::

### Escolhendo o método pelo dashboard

**É aqui que você escolhe o método em uma implantação em execução.** O `Signing:Profiles[]` é uma
semente de uso único, importada no primeiro boot (veja
[Configuração](configuration.md#signingprofiles--perfis-de-assinatura-por-pasta)), então a próxima seção
descreve como é uma semente, e não aonde você vai para mudar uma.

O painel **Certificado** em `/profiles/{name}` carrega o método, e o formulário em `/profiles/_new`
também. Ele fica nesse painel, e não no de Comportamento, porque o método decide se o perfil tem uma
chave local: escolha **Lacuna Signer** e a origem do certificado e suas coordenadas são substituídas
pelos três campos do participante — nome, e-mail, identificador —, que são tudo de onde vem a assinatura
de um perfil assim.

As duas direções diferem, e o formulário diz qual antes de você salvar:

| Troca | Quando passa a valer | O que acontece com o outro bloco |
|---|---|---|
| Local → **Lacuna Signer** | O próximo job reivindicado. **Sem reinicialização** — o gateway roda em todo host que tem configurações `Signer:*`, e não só para os perfis que existiam no boot. | As coordenadas do certificado são apagadas, senha inclusive: uma credencial em repouso para uma chave que vive no serviço é uma que nada jamais abrirá. |
| **Lacuna Signer** → Local | A próxima **reinicialização**, porque uma chave privada precisa ser aberta e nenhum salvamento abre uma. Até lá o perfil é reportado como **degradado** em sua própria página, e jobs roteados para ele falham com `profile.degraded`. | O participante é apagado. |

As recusas acontecem no salvamento, no seu idioma de exibição: um participante sem algum de seus três
campos, um e-mail sem `@`, e **selecionar o Lacuna Signer em um host sem configurações `Signer:*`** — a
única recusa cujo remédio é uma mudança de configuração e uma reinicialização, e não um campo do
formulário, razão pela qual sua redação nomeia as chaves.

O identificador do participante **não** tem os dígitos verificadores validados. Diferentemente do CPF de
um aprovador — que este produto grava em seus próprios registros de auditoria —, este é entregue ao
serviço remoto, e o serviço é a autoridade sobre se conhece o participante.

### `Signing:Profiles[].Method` + bloco `Signer`

Seleção de método por perfil **como semente**, importada no primeiro boot contra uma tabela de perfis
vazia. O padrão é `Method = Local`, então perfis preexistentes não precisam de mudança.

```json
"Signing": {
  "Profiles": [
    {
      "Name": "contracts",
      "Format": "Pades",
      "Method": "LacunaSigner",
      "Verify": true,
      "Encrypt": false,
      "ValidateCertificate": false,
      "Signer": {
        "Name": "Jack Bauer",
        "Email": "jack.bauer@example.com",
        "Identifier": "75502846369"
      }
    }
  ]
}
```

Validação em nível de perfil:

- `Method = LacunaSigner` **exige** um bloco `Signer:{Name, Email, Identifier}` não vazio. O validador
  recusa blocos parciais.
- `Method = LacunaSigner` **proíbe** um bloco `Certificate:*` (nenhum certificado local envolvido).
- `Method = LacunaSigner` **proíbe** `ValidateCertificate = true` (não há certificado local a validar).
- As regras de `Method = Local` não mudam: bloco de certificado obrigatório, bloco `Signer` ignorado se
  presente.
- `Method = LacunaSigner` não pode ser combinado com uma regra de aprovação cujo conjunto de assinantes
  seja `ProfileKeyAndApprovers` — o assinador remoto receberia um envelope de assinaturas de aprovadores
  em vez do arquivo de pagamento. Veja [Aprovações](approvals.md#o-conjunto-de-assinantes).

As mesmas regras recusam um salvamento na página do perfil. O perfil `default` derivado (semeado quando
`Signing:Profiles[]` é omitido) é sempre `Method = Local`.

## Fluxo do operador

1. **O operador solta um arquivo** em uma pasta monitorada por um perfil LacunaSigner (ou
   `POST /api/files?profile=contracts`).
2. **O observador / endpoint** enfileira o job; `Status = Queued`.
3. **O worker do pipeline** reivindica o próximo slot, transiciona o job para `Processing`, e então faz
   o upload e cria o documento no Signer. Em caso de sucesso, o job transiciona para `AwaitingSigner`
   com o id do documento remoto registrado; o slot é liberado.
4. **O Signer** envia e-mail ao participante; o participante assina pela interface do Signer no tempo
   dele.
5. **O worker de consulta** dá um tique a cada `Signer:PollIntervalSeconds`. Em cada tique ele carrega
   cada linha `AwaitingSigner`, das mais antigas primeiro, e para cada uma:
   - **Pending** → deixa a linha em paz.
   - **Concluded** → baixa os bytes assinados, transiciona para `Verifying`, roda a mesma cauda de
     verificar → opcionalmente criptografar → promover, e transiciona para `Completed`.
   - **Refused / Expired / Canceled** → transiciona para `Failed` com `signer.document-rejected`.
   - **Timeout local** (`AwaitingSigner` por mais tempo que `Signer:TimeoutHours`) → transiciona para
     `Failed` com `signer.timeout`. O documento remoto é deixado como está, do lado do Signer.

O dashboard exibe `AwaitingSigner` como um status distinto (chip amarelo, ícone de ampulheta). A página
de detalhe do job mostra o id do documento remoto e a hora do despacho, e um card de estatística
**Aguardando assinador** aparece quando qualquer perfil LacunaSigner está configurado.

## Semântica do cancelamento

O cancelamento pelo operador é ampliado para **`{Queued, AwaitingSigner}`** em perfis LacunaSigner.
`Processing` e `Verifying` permanecem sagrados.

Quando um operador cancela um job `AwaitingSigner`:

1. O job transiciona para `Canceled` localmente — mesmo handler, mesma trilha de auditoria.
2. O handler então faz uma chamada de cancelamento remoto ao Signer em **melhor esforço**. Falhas são
   registradas como Warning, mas **não** desfazem o cancelamento local.
3. Se o cancelamento remoto falhou, o participante ainda pode ver o documento em sua caixa de entrada do
   Signer. O job local está corretamente `Canceled` de qualquer forma.

O botão **Cancelar** na página do job pergunta antes: seu diálogo de confirmação nomeia o arquivo e diz o
que o cancelamento faz a partir do status atual do job — para um job aguardando o Lacuna Signer, que seu
documento remoto é cancelado em melhor esforço. O `POST /api/jobs/{id}/cancel` não pergunta nada.

:::warning O Clear Jobs não cancela documentos remotos
O **Clear Jobs** apaga todo registro de job, qualquer que seja o status, `AwaitingSigner` inclusive, mas
não faz chamada alguma ao Lacuna Signer: um documento já despachado continua na caixa de entrada do
participante. Cancele esses jobs antes se o participante não deve assiná-los. Veja
[Operação](operations.md#clear-jobs).
:::

:::note O cancelamento em melhor esforço é uma troca deliberada.
Desfazer o cancelamento local porque uma ida e volta de rede falhou deixaria o operador no limbo e
contradiria o comportamento de "cancelar devolve fechamento". O caso de documento remoto órfão é raro e
benigno — o participante pode ignorar o e-mail, ou o operador pode limpar na administração do Signer.
:::

## Falhas de API e o orçamento por job

A integração com o Signer distingue dois formatos de falha:

- **Transitória** — oscilação de rede, 5xx, limite de taxa, timeout. O worker de consulta incrementa um
  contador de falhas por documento e segue para a próxima linha. O contador zera na primeira chamada
  bem-sucedida. Uma vez excedido o `Signer:MaxConsecutiveApiFailures` para um único documento, aquele
  job é reprovado com `code = signer.unreachable`. As outras linhas não são afetadas.
- **Permanente** — um 4xx que não será corrigido por repetição (chave de API inválida, documento
  desconhecido, requisição malformada). O job é reprovado imediatamente com
  `code = signer.unreachable`.

Um reinício do processo zera os contadores de falha em memória. Se a indisponibilidade subjacente foi
resolvida entre as falhas e o reinício, a consulta retoma normalmente no próximo boot.

:::note Assimetria entre despacho e consulta.
O `Signer:MaxConsecutiveApiFailures` protege apenas o caminho de **consulta**. Uma falha transitória
durante o **despacho** reprova o job no primeiro erro, em vez de ser retentada contra um orçamento — por
design, já que o despacho é uma única chamada curta no início do job. Se seu endpoint do Signer é
instável a ponto de as falhas de despacho importarem, repita pelo dashboard ou por REST
(`POST /api/jobs/{id}/retry`) quando o serviço a montante voltar.
:::

## Recuperação após reinício — linhas `AwaitingSigner` NÃO são varridas

A varredura de recuperação na inicialização transiciona qualquer job travado em `Processing` /
`Verifying` para `Failed` (eles estavam em andamento quando o processo anterior morreu). **As linhas
`AwaitingSigner` são explicitamente excluídas** — o trabalho está retido do lado remoto; varrê-las
localmente perderia dados que não cabe ao host invalidar. O worker de consulta retoma sua consulta no
próximo boot, exatamente de onde parou.

## O que aterrissa em `output/`

Para perfis LacunaSigner, os bytes promovidos para `output/` são os bytes **que o Signer assinou** — a
assinatura do participante sobre o documento original, baixada depois que o documento é concluído. As
etapas de verificação e criptografia rodam sobre aqueles bytes exatamente como rodariam para um perfil
Local, então:

- `Verify = true` (padrão) — a assinatura é verificada contra a política configurada após o download.
- `Encrypt = true` + `Encryption:Enabled = true` — os bytes baixados são criptografados com AES-256-GCM
  em um envelope BSENC v1; o texto claro nunca é escrito em `output/`.

Os arquivos de entrada originais são apagados de `input/` somente depois de a etapa de verificação ter
sucesso — a mesma invariante do caminho Local.

## Métricas

Instrumentos Prometheus específicos do Signer são expostos em `/api/metrics`:

| Métrica | Tipo | O que ela acompanha |
|---------|------|---------------------|
| `bulksigner_jobs_dispatched_to_signer_total{profile}` | Counter | Despachos bem-sucedidos ao Signer, rotulados pelo nome do perfil. |
| `bulksigner_jobs_awaiting_signer` | Gauge | Contagem viva de linhas `AwaitingSigner`. |
| `bulksigner_signer_poll_duration_seconds` | Histogram | Duração por tique de uma passada completa sobre as linhas `AwaitingSigner`. |
| `bulksigner_signer_api_errors_total{op}` | Counter | Falhas da API do Signer, rotuladas por operação. |

## Em modo cluster

Com o modo cluster ligado, **cada instância consulta o Lacuna Signer apenas sobre os documentos que ela
mesma despachou**, de modo que duas instâncias nunca baixam os mesmos bytes assinados. Duas consequências
para dashboards e alertas: o `bulksigner_jobs_awaiting_signer` é por instância — some-o sobre a frota —,
e um job que uma instância despachou antes de morrer é reatribuído a uma sobrevivente pela varredura de
takeover. Uma linha sem dono algum não é consultada por ninguém. Veja
[Alta disponibilidade](high-availability.md) para os detalhes e o remédio.

## Referências cruzadas de diagnóstico

Veja [Diagnóstico de problemas](troubleshooting.md) para passos de diagnóstico sobre:

- API do Signer inalcançável / tempestade de 5xx
- Chave de API errada — `401`s em toda chamada
- Documento travado em `Pending` além de `Signer:TimeoutHours`
- Operador cancelou, mas o participante ainda vê o documento
- O dashboard não mostra o painel do Lacuna Signer mesmo com um perfil o utilizando

---

**A seguir:** [Arquivos de pagamento CNAB240](cnab240.md).
**Anterior:** [Criptografia](encryption.md).
