---
sidebar_label: "Integração com o Lacuna Signer"
sidebar_position: 12
---

# Integração com o Lacuna Signer

Passo a passo para o operador fazer um perfil assinar pelo **Lacuna Signer**, em vez de usar um
certificado mantido localmente. A assinatura com certificado local (PFX / PKCS#11 / repositório do
Windows) e a assinatura pelo Lacuna Signer **coexistem, cada uma em seu perfil** — pastas monitoradas
diferentes podem usar métodos de assinatura diferentes na mesma instância.

## Quando usar isto

Escolha **`Method = LacunaSigner`** para um perfil quando:

- Uma pessoa (e não um certificado mantido pelo servidor) precisa assinar cada documento — por exemplo,
  contratos com contra-assinatura, contratos de trabalho, documentação de admissão de RH.
- A identidade do signatário é a do participante, e não a do serviço. Cada documento despachado
  pertence ao participante, do lado do Signer.
- A trilha de auditoria que você quer é a que o Signer mantém (identidade do signatário, evidência da
  assinatura, motivos de recusa, expiração).

Escolha **`Method = Local`** (o padrão) quando:

- A assinatura é *do serviço* — assinatura automatizada de notas fiscais com o certificado de assinatura
  da empresa, assinatura de NF-e em tempo de execução em um token PKCS#11, contra-assinatura em lote.
- O certificado fica no host (PFX / HSM / repositório do Windows) e não há uma pessoa no circuito.

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

São dois **workers que cooperam**, em vez de um:

1. **O worker do pipeline** reivindica jobs `Queued` e, em perfis LacunaSigner, *apenas* os despacha ao
   Signer (upload + criação do documento) e os passa para `AwaitingSigner`. O slot do pipeline é
   **liberado imediatamente após o despacho** — o job agora está retido do lado remoto, e o worker fica
   livre para pegar o próximo item.
2. **Um worker de polling separado** acorda a cada `Signer:PollIntervalSeconds` (padrão 30 s) e percorre
   todas as linhas `AwaitingSigner`. Para cada linha, ele verifica o status do documento na API do
   Signer; os documentos concluídos são baixados e passam pela mesma etapa final de verificar →
   criptografar → promover que o caminho Local usa.

Essa divisão importa: ocupar um slot de `Pipeline:MaxConcurrency` enquanto uma pessoa leva dias para
assinar anularia completamente o propósito da fila.

## A máquina de estados, estendida

Em perfis LacunaSigner, o `AwaitingSigner` se encaixa entre `Processing` e `Verifying`:

```
Queued ─▶ Processing ─┬─ assinatura local ok ────────▶ Verifying ─▶ Completed
                      │                                            └▶ Failed
                      └─ despachado ao Signer ─▶ AwaitingSigner
                                                      │
                          concluído → download ───────┼──▶ Verifying ─▶ Completed
                          recusado/expirado/timeout ──┴──▶ Failed
                          cancel do operador ────────────▶ Canceled (cancelamento remoto em melhor esforço)
```

Perfis que usam apenas o método Local nunca entram em `AwaitingSigner`. Perfis LacunaSigner nunca
seguem o caminho local direto `Processing → Verifying`.

## Configuração

### `Signer:*` — um tenant por host

A conexão com o Signer é **global** — um endpoint + uma chave de API para o host, compartilhados por
todos os perfis que usam `Method = LacunaSigner`.

| Chave | Tipo | Padrão | Override por env | Obrigatória quando |
|-------|------|--------|------------------|--------------------|
| `Signer:Endpoint` | string | `""` | `Signer__Endpoint` | Qualquer parte de `Signer:*` está definida. Padrão na nuvem: `https://signer.lacunasoftware.com`. |
| `Signer:ApiKey` | string | `""` | `Signer__ApiKey` | **REQUIRED, SECRET**, mesma condição. Formato: `application-id\|secret`. |
| `Signer:PollIntervalSeconds` | int | `30` | `Signer__PollIntervalSeconds` | opcional |
| `Signer:TimeoutHours` | int | `168` (7 dias) | `Signer__TimeoutHours` | opcional |
| `Signer:MaxConsecutiveApiFailures` | int | `5` | `Signer__MaxConsecutiveApiFailures` | opcional |

O validador **só age sobre esta seção quando ela existe** — omita `Signer:*` por inteiro e nada aqui é
exigido, que é o que acontece em uma implantação puramente Local. Escreva qualquer parte dela e o bloco
inteiro é validado.

:::warning Mudou na 2.1.0 — o bloco `Signer:*` é validado por si só
Até a 2.0.x, o bloco só era validado quando algum perfil selecionava `Method = LacunaSigner`. Os perfis
agora ficam no banco de dados operacional e podem ser trocados para o Lacuna Signer pelo dashboard sem
reinicialização, então a regra passou a valer ao contrário:

- **Um bloco `Signer:` preenchido pela metade impede o boot**, mesmo que nenhum perfil o use — um
  endpoint sem chave de API deixado para depois, por exemplo. A mensagem cita as duas chaves e sugere
  remover a seção como solução.
- **Selecionar `Method = LacunaSigner` é recusado quando o host não tem configurações `Signer:*`** — no
  boot, para um perfil ainda importado da configuração pelo seed (carga inicial), e na página do perfil,
  para um perfil que está sendo salvo.
- **É a presença das configurações `Signer:*` no host que inicia o gateway do assinador remoto e o
  worker de polling**, então um perfil trocado para o Lacuna Signer depois do boot começa a despachar
  sem reinicialização. Em um host com o bloco inteiro definido e nenhum perfil que o use, o worker de
  polling roda e não encontra nada a fazer a cada intervalo — remova a seção se este host assina tudo
  localmente.
:::

:::warning A chave de API é um segredo.
Defina-a como `Signer__ApiKey` no `bulksigner.env` (Linux) / em uma variável de ambiente de máquina
(Windows) / no `.env` (Docker). O valor literal é mascarado nos logs.
:::

### Escolhendo o método pelo dashboard

**É aqui que você escolhe o método em uma implantação em execução.** O `Signing:Profiles[]` é um seed de
uso único, importado no primeiro boot (veja
[Configuração](configuration.md#signingprofiles--perfis-de-assinatura-por-pasta)); por isso, a próxima
seção descreve como é um seed, e não onde você muda um perfil.

O painel **Certificado** em `/profiles/{name}` contém o método, e o formulário em `/profiles/_new`
também. Ele fica nesse painel, e não no de **Comportamento**, porque o método decide se o perfil tem ou
não uma chave local: escolha **Lacuna Signer**, e a origem do certificado e os dados dela são
substituídos pelos três campos do participante — nome, e-mail e identificador —, que são tudo o que
define de onde vem a assinatura de um perfil assim.

As duas direções da troca são diferentes, e o formulário informa qual se aplica antes de você salvar:

| Troca | Quando passa a valer | O que acontece com o outro bloco |
|---|---|---|
| Local → **Lacuna Signer** | No próximo job reivindicado. **Sem reinicialização** — o gateway roda em todo host que tem configurações `Signer:*`, e não só para os perfis que existiam no boot. | Os dados do certificado são apagados, inclusive a senha: uma credencial armazenada para uma chave que fica no serviço remoto é uma credencial que nada jamais usará. |
| **Lacuna Signer** → Local | Na próxima **reinicialização**, porque uma chave privada precisa ser aberta, e salvar o formulário não abre nenhuma. Até lá, o perfil aparece como **degradado** na própria página, e os jobs roteados para ele falham com `profile.degraded`. | O participante é apagado. |

As recusas acontecem ao salvar, no seu idioma de exibição: um participante sem algum dos três campos, um
e-mail sem `@`, e **selecionar o Lacuna Signer em um host sem configurações `Signer:*`** — a única recusa
cuja solução é uma mudança de configuração e uma reinicialização, e não um campo do formulário; por isso
a mensagem cita as chaves.

Os dígitos verificadores do identificador do participante **não** são validados. Diferentemente do CPF
de um aprovador — que este produto grava nos próprios registros de auditoria —, este é entregue ao
serviço remoto, e é o serviço que decide se conhece o participante.

### `Signing:Profiles[].Method` + bloco `Signer`

Seleção do método por perfil **como seed**, importada no primeiro boot com a tabela de perfis vazia. O
padrão é `Method = Local`, então os perfis que já existiam não precisam de mudança.

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

Validação no nível do perfil:

- `Method = LacunaSigner` **exige** um bloco `Signer:{Name, Email, Identifier}` não vazio. O validador
  recusa blocos parciais.
- `Method = LacunaSigner` **proíbe** um bloco `Certificate:*` (não há certificado local envolvido).
- `Method = LacunaSigner` **proíbe** `ValidateCertificate = true` (não há certificado local a validar).
- As regras de `Method = Local` não mudam: o bloco de certificado é obrigatório, e o bloco `Signer` é
  ignorado se estiver presente.
- `Method = LacunaSigner` não pode ser combinado com uma regra de aprovação cujo conjunto de assinantes
  seja `ProfileKeyAndApprovers` — o assinador remoto receberia um envelope de assinaturas de aprovadores,
  e não o arquivo de pagamento. Veja [Aprovações](approvals.md#o-conjunto-de-assinantes).

As mesmas regras fazem um salvamento ser recusado na página do perfil. O perfil `default` derivado
(criado pelo seed quando `Signing:Profiles[]` é omitido) é sempre `Method = Local`.

## Fluxo do operador

1. **O operador coloca um arquivo** em uma pasta monitorada por um perfil LacunaSigner (ou usa
   `POST /api/files?profile=contracts`).
2. **O observador / endpoint** enfileira o job; `Status = Queued`.
3. **O worker do pipeline** reivindica o próximo slot, passa o job para `Processing` e então faz o
   upload e cria o documento no Signer. Em caso de sucesso, o job passa para `AwaitingSigner`, com o id
   do documento remoto registrado; o slot é liberado.
4. **O Signer** envia um e-mail ao participante, que assina pela interface do Signer quando puder.
5. **O worker de polling** executa um tique a cada `Signer:PollIntervalSeconds`. Em cada tique, ele
   carrega todas as linhas `AwaitingSigner`, das mais antigas para as mais novas, e, para cada uma:
   - **Pending** → não mexe na linha.
   - **Concluded** → baixa os bytes assinados, passa o job para `Verifying`, executa a mesma etapa final
     de verificar → opcionalmente criptografar → promover e passa o job para `Completed`.
   - **Refused / Expired / Canceled** → passa o job para `Failed` com `signer.document-rejected`.
   - **Timeout local** (`AwaitingSigner` por mais tempo que `Signer:TimeoutHours`) → passa o job para
     `Failed` com `signer.timeout`. O documento remoto é deixado como está, do lado do Signer.

O dashboard exibe `AwaitingSigner` como um status próprio (chip amarelo, ícone de ampulheta). A página
de detalhe do job mostra o id do documento remoto e a hora do despacho, e um card de estatística
**Aguardando assinatura** aparece quando algum perfil LacunaSigner está configurado.

## Semântica do cancelamento

Em perfis LacunaSigner, o cancelamento pelo operador passa a valer para **`{Queued, AwaitingSigner}`**.
`Processing` e `Verifying` continuam intocáveis.

Quando um operador cancela um job `AwaitingSigner`:

1. O job passa para `Canceled` localmente — mesmo handler, mesma trilha de auditoria.
2. Em seguida, o handler faz uma chamada de cancelamento remoto ao Signer, em **melhor esforço**. As
   falhas são registradas no log como Warning, mas **não** desfazem o cancelamento local.
3. Se o cancelamento remoto falhou, o participante ainda pode ver o documento na caixa de entrada do
   Signer. O job local está corretamente `Canceled` de qualquer forma.

O botão **Cancelar** na página do job pede confirmação antes: o diálogo mostra o nome do arquivo e explica o que
o cancelamento faz a partir do status atual do job — no caso de um job aguardando o Lacuna Signer, que o
documento remoto dele é cancelado em melhor esforço. O `POST /api/jobs/{id}/cancel` não pede
confirmação.

:::warning O Limpar Jobs não cancela documentos remotos
O **Limpar Jobs** apaga todos os registros de jobs, qualquer que seja o status, inclusive
`AwaitingSigner`, mas não faz nenhuma chamada ao Lacuna Signer: um documento já despachado continua na
caixa de entrada do participante. Cancele esses jobs antes se o participante não deve assiná-los. Veja
[Operação](operations.md#limpar-jobs).
:::

:::note O cancelamento em melhor esforço é uma escolha deliberada.
Desfazer o cancelamento local porque uma ida e volta de rede falhou deixaria o operador sem saber em que
estado o job ficou e contradiria o princípio de que "cancelar encerra a questão". O caso de um documento
remoto órfão é raro e inofensivo — o participante pode ignorar o e-mail, ou o operador pode fazer a
limpeza na administração do Signer.
:::

## Falhas de API e o limite por job

A integração com o Signer distingue dois tipos de falha:

- **Transitória** — instabilidade de rede, 5xx, limite de requisições (rate limiting), timeout. O worker
  de polling incrementa um contador de falhas por documento e segue para a próxima linha. O contador
  zera na primeira chamada bem-sucedida. Quando o `Signer:MaxConsecutiveApiFailures` é excedido para um
  único documento, aquele job falha com `code = signer.unreachable`. As outras linhas não são afetadas.
- **Permanente** — um 4xx que não se resolve com novas tentativas (chave de API inválida, documento
  desconhecido, requisição malformada). O job falha imediatamente com `code = signer.unreachable`.

Um reinício do processo zera os contadores de falha, que ficam em memória. Se a indisponibilidade de
origem foi resolvida entre as falhas e o reinício, o polling é retomado normalmente no próximo boot.

:::note Assimetria entre despacho e polling.
O `Signer:MaxConsecutiveApiFailures` protege apenas o caminho de **polling**. Uma falha transitória
durante o **despacho** faz o job falhar no primeiro erro, em vez de ser repetida até um limite — por
design, já que o despacho é uma única chamada curta no início do job. Se o seu endpoint do Signer é
instável a ponto de as falhas de despacho serem um problema, faça uma nova tentativa pelo dashboard ou
por REST (`POST /api/jobs/{id}/retry`) quando o serviço remoto voltar.
:::

## Recuperação após reinício — linhas `AwaitingSigner` NÃO são varridas

A varredura de recuperação na inicialização passa para `Failed` qualquer job travado em `Processing` /
`Verifying` (eles estavam em andamento quando o processo anterior morreu). **As linhas `AwaitingSigner`
são explicitamente excluídas** — o trabalho está retido do lado remoto; varrê-las localmente perderia
dados que não cabe ao host invalidar. O worker de polling retoma o polling dessas linhas no próximo
boot, exatamente de onde parou.

## O que chega a `output/`

Em perfis LacunaSigner, os bytes promovidos para `output/` são os bytes **que o Signer assinou** — a
assinatura do participante sobre o documento original, baixada depois que o documento é concluído. As
etapas de verificação e criptografia rodam sobre esses bytes exatamente como rodariam em um perfil
Local; então:

- `Verify = true` (padrão) — a assinatura é verificada com base na política configurada, após o
  download.
- `Encrypt = true` + `Encryption:Enabled = true` — os bytes baixados são criptografados com AES-256-GCM
  em um envelope BSENC v1; o texto claro nunca é gravado em `output/`.

Os arquivos de entrada originais só são apagados de `input/` depois que a etapa de verificação é
concluída com sucesso — a mesma garantia do caminho Local.

## Métricas

Instrumentos Prometheus específicos do Signer são expostos em `/api/metrics`:

| Métrica | Tipo | O que ela acompanha |
|---------|------|---------------------|
| `bulksigner_jobs_dispatched_to_signer_total{profile}` | Counter | Despachos bem-sucedidos ao Signer, rotulados pelo nome do perfil. |
| `bulksigner_jobs_awaiting_signer` | Gauge | Contagem atual de linhas `AwaitingSigner`. |
| `bulksigner_signer_poll_duration_seconds` | Histogram | Duração, por tique, de uma passada completa sobre as linhas `AwaitingSigner`. |
| `bulksigner_signer_api_errors_total{op}` | Counter | Falhas da API do Signer, rotuladas por operação. |

## No modo cluster

Com o modo cluster ligado, **cada instância só faz polling no Lacuna Signer dos documentos que ela
mesma despachou**, de modo que duas instâncias nunca baixam os mesmos bytes assinados. Há duas
consequências para dashboards e alertas: o `bulksigner_jobs_awaiting_signer` é por instância — some os
valores de toda a frota —, e um job que uma instância despachou antes de morrer é reatribuído a uma
sobrevivente pela varredura de assunção. Uma linha sem dono algum não recebe polling de ninguém. Veja
[Alta disponibilidade](high-availability.md) para os detalhes e a solução.

## Referências cruzadas de diagnóstico

Veja em [Diagnóstico de problemas](troubleshooting.md) os passos de diagnóstico para:

- API do Signer inacessível / avalanche de erros 5xx
- Chave de API errada — `401` em todas as chamadas
- Documento travado em `Pending` além de `Signer:TimeoutHours`
- O operador cancelou, mas o participante ainda vê o documento
- O dashboard não mostra o painel do Lacuna Signer mesmo com um perfil que o utiliza

---

**A seguir:** [Arquivos de pagamento CNAB240](cnab240.md).
**Anterior:** [Criptografia](encryption.md).
