# Glossário e guia de estilo pt-BR

Decisões de terminologia e de estilo para as páginas em português (`docs/`). Nasceu da revisão da
documentação do Bulk Signer, em setembro de 2026, e vale para qualquer página nova ou traduzida: as
regras gerais (§1–§3, §6–§8) seguem o que o restante do site já fazia; §4 e §5 trazem os termos de
produto e de domínio.

Este arquivo fica fora de `docs/` e de `docs-en/` de propósito: ele não é publicado no site.

Público das páginas: operadores, administradores de sistemas e desenvolvedores brasileiros. Registro:
técnico, direto e natural — como a documentação da Microsoft em português, **não** como uma tradução
literal do inglês. Um termo que um profissional brasileiro de TI usa em inglês no dia a dia fica em
inglês.

## 1. O que nunca se traduz

- Tudo dentro de `code span` ou bloco de código: chaves de configuração, variáveis de ambiente, rotas,
  códigos de erro, métricas, campos JSON, headers HTTP, tipos de evento, valores de enum e mensagens de
  log citadas (o produto as emite em inglês). Comentários em blocos de código já traduzidos podem ficar
  como estão.
- Nomes de produto e de serviço: Bulk Signer, Lacuna Signer, Web PKI, CloudHub, PKI SDK, Rest PKI,
  Azure App Service, Azure Files, Azure Key Vault, Azure SQL, Application Insights, Front Door,
  Microsoft Entra ID, Docker, systemd, SQLite, SQL Server, Kubernetes, Prometheus.
- Rótulos do portal do Azure e do Entra ID: em inglês, em negrito ou itálico, como aparecem para a
  maioria dos clientes — **Deployment Center**, **Health check**, **Certificates & secrets**,
  **App registrations**, **Application (client) ID**.
- Exceção: rótulos de interface do **Windows** vão em português, como o Windows pt-BR os mostra
  (**Computador Local**, **Todas as Tarefas → Gerenciar Chaves Privadas…**).

## 2. Rótulos da interface dos produtos Lacuna

Quando o texto nomeia um botão, aba, coluna, título de diálogo, chip ou mensagem da interface, use
**exatamente** a string pt-BR do produto (nos `.resx` `*.pt-BR.resx` do repositório do produto). Um
rótulo em inglês dentro de um code span, numa página em português, é um erro: troque-o pela string
pt-BR que o usuário vê.

Exemplos do Bulk Signer: **Aguardando você**, **Aguardando outros**, **Aprovados** (abas do portal),
**Limpar Jobs**, **Tentar novamente**, **Enviar arquivos**, **Editar aprovação**, **Pastas de
entrada**, **Aguardando assinatura**, **Redefinir inscrição**, chip `sem perfil — nenhum perfil escolheu
esta pasta`.

Quando o próprio produto for inconsistente (o Bulk Signer diz "Conjunto de assinantes" num lugar e
"conjunto de signatários" em outro), use a forma do rótulo de campo e reporte a inconsistência.

## 3. Termos que ficam em inglês

job (o job) · pipeline · dashboard · log (os logs; nunca "logar" — use "registrar no log") · container
(nunca "contêiner") · endpoint · token · cookie · hash · thumbprint · timeout · heartbeat · lease · pool
(de aprovadores) · cluster · backup · rollback · throttling · polling · upload · download · script ·
string · blob · tenant · client secret · connection string · header (HTTP) · query string · banner · boot
· build (o build) · release · span · trace · span event · gauge · bucket · webhook · proxy · health check
· probe (o probe) · seed (o seed) · deployment slot · tag (de imagem) · worker · sink · key ring · claim ·
role / app role (o role) · provider (de banco e de armazenamento) · override · app settings (os app
settings) · registry · resource group · private endpoint · sticky sessions · rolling restart · hardening ·
in-place · on-premises (com hífen) · e-mail (com hífen).

Na primeira ocorrência de uma página, glose os que o leitor pode não conhecer: "seed (carga inicial)",
"limite de requisições (rate limiting)", "entidade de segurança (principal)", "de melhor esforço
(best-effort)", "isolada da rede (air-gapped)".

Verbos: "fazer upload", "baixar", "fazer deploy" (ao lado de "implantar"), "fazer a rotação" /
"rotacionar".

## 4. Termos que se traduzem

| Inglês | pt-BR |
|---|---|
| operational store | banco operacional (1ª ocorrência: "banco de dados operacional") |
| wait budget | prazo de espera |
| rate-limit budget | cota (ex.: "a cota `Upload`") |
| retry budget, failure budget | limite (de novas tentativas, de falhas) |
| guard (ex.: payment-date guard) | verificação |
| deployment (a instalação) | implantação; to deploy = implantar |
| in-place redeploy | reimplantação in-place |
| managed identity | identidade gerenciada |
| app registration | registro de aplicativo; *application* do Entra = aplicativo |
| subscription (Azure) | assinatura do Azure (nunca só "assinatura", para não confundir) |
| Windows Service | serviço do Windows |
| signing profile | perfil de assinatura |
| watched folder | pasta monitorada |
| watcher | observador (o componente); o rótulo da interface é "Monitoramento" |
| work share | compartilhamento de trabalho |
| file share (Azure Files) | compartilhamento |
| key vault (genérico) | cofre (de chaves) |
| staged copy / to stage | cópia preparada / preparar a cópia, copiar para processamento |
| parked (job) | retido |
| approval gate | etapa de aprovação |
| signer set | conjunto de assinantes |
| keyless profile | perfil sem chave |
| degraded | degradado |
| hand-back (arquivo rejeitado) | devolução |
| displacement / displaced | deslocamento / deslocada |
| stand down | retirar-se |
| incarnation | encarnação |
| takeover | assunção (de jobs) |
| stale (instância) | sem sinal (rótulo da interface) |
| readiness check | verificação de prontidão (o endpoint continua `/api/ready`) |
| rescan / retry (a ação) | nova varredura / nova tentativa (os botões: rótulos do produto) |
| Clear Jobs | Limpar Jobs (o rótulo do botão) |
| reset marker | marcador de zeragem |
| pending-restart marker | marcador de reinício pendente |
| second factor / enrolment | segundo fator / inscrição (rótulo do produto) |
| TOTP seed | semente (do autenticador) — diferente do seed de configuração |
| bearer token | token de portador |
| withheld (download / dado) | negado / omitido (nunca "retido", reservado para jobs) |
| recipe | procedimento |
| blast radius | raio de impacto |
| downstream verifier | verificador externo |
| sliding expiration | expiração deslizante |
| throughput | vazão |
| query | consulta |
| row (de tabela) | linha |
| redaction (de logs) | mascaramento |
| request / response / body / status code | requisição / resposta / corpo / código de status |
| sign in / sign out | entrar / sair; "login" como substantivo ("página de login") |
| certificate store (Windows) | repositório de certificados |
| case-insensitive | sem diferenciar maiúsculas de minúsculas |

## 5. PKI, ICP-Brasil e CNAB

- assinatura digital, certificado digital, chave privada, cadeia de certificação, **AC raiz**,
  Autoridade Certificadora (AC), LCR (lista de certificados revogados; "CRL" entre parênteses),
  política de assinatura, e-CPF, e-CNPJ, token criptográfico, smart card, HSM, PIN, PKCS#12, PFX.
- **carimbo de tempo** para o timestamp de uma assinatura; para datas de log ou de banco, "timestamp"
  ou "data e hora".
- CAdES, PAdES e XAdES em maiúsculas.
- CNAB240, como no layout do Banco do Brasil: remessa (arquivo de remessa), retorno, **Header do
  Arquivo**, **Header do Lote**, **Trailer do Lote**, **Trailer do Arquivo**, segmento A / J, "Data do
  Pagamento".
- Um CPF identifica uma pessoa física; nunca escreva "pessoa jurídica ou física" para ele.

## 6. Calques a evitar

| Evitar | Preferir |
|---|---|
| "o limite morde" | "quando o limite é atingido" |
| "atualizações param o mundo" | "atualizações exigem parada total" |
| "uma morte presumida é uma aposta" | "…é uma suposição" |
| "a identidade ainda batendo" | "…ainda enviando heartbeats", "ativa" |
| "X vive em Y" | "X fica em Y" |
| "nomeando a chave", "o diálogo nomeia o arquivo" | "citando a chave", "o diálogo mostra o nome do arquivo" |
| "sob `Sqlite`" | "com `Sqlite`" |
| "carrega" (= carries) | "traz", "contém", "tem" |
| "reportar" (= informar) | "informar", "indicar" |
| "remédio" | "solução" |
| "alcançar / inalcançável" (rede) | "acessar / inacessível" |
| "no lugar" (= in-place) | "in-place" |
| "cinto e suspensório" | "precaução redundante" |
| "eventualmente" (= por fim) | "em algum momento", "por fim" |
| "assumir" (= supor) | "supor", "pressupor" |
| "endereçar" um problema | "tratar", "resolver" |
| deletar, setar, resetar, customizar, checar, logar, performance, randômico, mandatório | excluir/apagar, definir, redefinir, personalizar, verificar, entrar, desempenho, aleatório, obrigatório |
| tipicamente | normalmente, em geral |
| gerundismo ("vai estar fazendo") | presente ou futuro simples |
| possessivos em excesso, calcados do inglês | omita quando óbvio |

## 7. Regras de estilo

- Títulos em *sentence case*: só a primeira palavra e nomes próprios em maiúscula.
- Português do Brasil padrão: crase, regência ("de que a credencial precisa"), concordância; "no nível
  de" em vez de "a nível de"; "em que" em vez de "onde" para tempo ou situação.
- Números em prosa: vírgula decimal ("2,5 segundos") e ponto de milhar ("10.000 linhas"); versões e
  valores em código ficam como estão ("2.15.0", `90.00:00:00`).
- Dias da semana e meses em minúscula. Aspas retas (" ").
- Títulos de admonição sobre versões, exatamente nestas formas: "Mudou na 2.9.0", "Mudou na 2.9.0 e na
  2.10.0", "Novo na 2.13.0", "Corrigido na 2.2.1".
- "Antes da 2.9.0" para o que valia até a versão que mudou algo; "Até a 2.0.x" só com o curinga da
  série (inclusivo).
- Passo a passo: imperativo na 2ª pessoa ("Crie", "Defina", "Execute").
- A página em inglês (`docs-en/`) é a referência de conteúdo. Uma tradução não acrescenta nem tira
  fatos; se divergir, corrija para o fato do inglês.

## 8. Títulos, âncoras e links

- A âncora de um título em português é o slug do próprio título (minúsculas, acentos preservados,
  espaços viram hífen, pontuação sai). Ex.: "Desligando a verificação" → `#desligando-a-verificação`.
- Renomear um título muda a âncora. Procure links para ela em `docs/` (`grep -rn "pagina.md#ancora"
  docs/`) e atualize todos. Não use `{#id}` explícito.
- O build falha em link ou âncora quebrada (`onBrokenLinks` e `onBrokenAnchors` = `throw`): rode
  `npm run build` antes de abrir o PR.
