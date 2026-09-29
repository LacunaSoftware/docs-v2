---
sidebar_label: "Criptografia (BSENC v1)"
sidebar_position: 11
---

# Criptografia — BSENC v1

Criptografia pós-assinatura opcional. **Desligada por padrão.** Quando habilitada, o Bulk Signer
criptografa o artefato assinado entre a verificação bem-sucedida e a promoção para a saída. Os bytes
assinados em texto claro nunca chegam a `output/`; somente um envelope criptografado (BSENC v1) é
gravado. Os destinatários descriptografam com a senha, o salt e a contagem de iterações configurados,
seguindo o procedimento documentado de PBKDF2-HMAC-SHA256 + AES-256-GCM — não há endpoint de
descriptografia no servidor.

## Quando habilitar a criptografia

- **Habilite** quando o diretório operacional `output/` puder ser lido por terceiros que não devem ver
  o conteúdo do artefato assinado (disco multi-tenant, um destino de backup menos confiável, um destino
  de replicação de menor confiança).
- **Deixe desabilitada** quando apenas operadores autorizados têm acesso a `output/` e a automação que
  consome a saída espera artefatos assinados em texto claro, prontos para repassar. Este é o caso mais
  comum.
- **A criptografia é independente da assinatura.** A assinatura é calculada sobre o documento em texto
  claro, exatamente como se a criptografia estivesse desligada. A criptografia encapsula os bytes
  assinados em um container privado, para proteção em trânsito e em repouso. Os destinatários
  descriptografam primeiro e depois verificam a assinatura com as ferramentas PKI de sempre
  (`openssl cms`, o Lacuna PKI SDK, Adobe Reader etc.).

## Configuração

```json
"Encryption": {
  "Enabled": true,
  "Password": "",
  "PasswordEnvVar": "BULK_SIGNER_ENCRYPTION_PASSWORD",
  "Salt": "<base64-de-32-bytes-aleatórios>",
  "Iterations": 600000
}
```

(Prefira a variável de ambiente `BULK_SIGNER_ENCRYPTION_PASSWORD` a um valor no arquivo de
configuração.)

Veja [Configuração](configuration.md#encryption) para a referência completa das chaves. O validador só
é executado quando `Enabled = true` e falha imediatamente nos seguintes casos:

- Senha vazia (variável de ambiente e `Password` ambos vazios).
- Salt ausente.
- Salt que, decodificado, tem menos de 16 bytes.
- `Iterations` abaixo de 10.000 (detecta o erro de digitação `600` em vez de `600000`).

### Gerando o salt

O salt não é secreto, mas precisa permanecer o mesmo durante toda a vida útil da saída criptografada
(mudá-lo invalida todos os envelopes anteriores). O tamanho certo é 32 bytes aleatórios:

```bash
# Linux / Mac
openssl rand 32 | base64
```

```powershell
# Windows (PowerShell)
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Copie a saída em base64 para `Encryption:Salt`.

### Gerando a senha

Use uma senha forte, de alta entropia, registrada uma única vez em um lugar ao qual os destinatários
também tenham acesso (um envelope lacrado, um gerenciador de segredos, uma cópia impressa em um cofre).

```bash
openssl rand -base64 32
```

Coloque o resultado em `BULK_SIGNER_ENCRYPTION_PASSWORD` (variável de ambiente, preferível) ou em
`Encryption:Password` no `appsettings.Production.json` (ignorado pelo Git).

:::danger Perder a senha significa perder toda a saída criptografada, para sempre.
Não há mecanismo de recuperação. Guarde a senha em um gerenciador de segredos e/ou em um backup físico
lacrado.
:::

## A derivação de chave

```
senha (ambiente ou config) ────────┐
salt (base64 decodificado, ≥16 B) ─┼─▶ PBKDF2-HMAC-SHA256 ─▶ chave derivada de 32 bytes (só em memória)
iterações (padrão 600000) ─────────┘
```

A derivação é executada **uma única vez, na inicialização**. A chave derivada de 32 bytes permanece na
memória do processo enquanto ele estiver em execução. Ela nunca é gravada em disco, nunca é registrada
em log e nunca é retornada por nenhum endpoint.

A derivação exata:

```text
password   = (variável de ambiente não vazia) ? valor do ambiente : Encryption:Password
saltBytes  = base64-decode(Encryption:Salt)
key        = PBKDF2-HMAC-SHA256(password, saltBytes, Iterations, 32 bytes)
```

A recomendação da OWASP de 2023 para PBKDF2-HMAC-SHA256 é de 600.000 iterações, e esse é o padrão. Mais
iterações = inicialização mais lenta (um custo único) e maior resistência a força bruta; menos =
inicialização mais rápida e proteção mais fraca. Não fique abaixo da recomendação da OWASP sem um motivo
específico.

## O envelope em disco (BSENC v1)

Layout exato em bytes:

| Deslocamento | Comprimento | Campo | Observações |
|--------------|-------------|-------|-------------|
| 0 | 8 | Magic | ASCII `"BSENC\0\0\0"` (`0x42 0x53 0x45 0x4E 0x43 0x00 0x00 0x00`) |
| 8 | 1 | Versão | `0x01` para a v1 |
| 9 | 12 | Nonce | Aleatório por arquivo (CSPRNG) |
| 21 | N | Texto cifrado | `AES-256-GCM(texto claro = bytes assinados, chave, nonce, aad = vazio)` |
| 21 + N | 16 | AuthTag | Tag de autenticação do AES-256-GCM |

O overhead do cabeçalho é de **37 bytes por arquivo** (8 de magic + 1 de versão + 12 de nonce + 16 de
tag). Os dados associados (AAD) do GCM são intencionalmente vazios na v1 — o destinatário precisa apenas
da senha, do salt e da contagem de iterações para descriptografar. O código do destinatário deve rejeitar
qualquer arquivo que não comece com o prefixo exato de 9 bytes de magic + versão.

## Convenção de nome de arquivo

O nome do envelope criptografado simplesmente acrescenta `.enc` ao nome assinado em texto claro:

| Formato de assinatura | Nome assinado em texto claro | Nome do envelope criptografado |
|-----------------------|------------------------------|-------------------------------|
| PAdES | `report.signed.pdf` | `report.signed.pdf.enc` |
| CAdES | `data.bin.p7m` | `data.bin.p7m.enc` |
| XAdES | `contract.signed.xml` | `contract.signed.xml.enc` |
| *(nenhum — um arquivo rejeitado)* | `folha.reject.rem` | `folha.reject.rem.enc` |

Quando a saída do job está criptografada, o `GET /api/jobs/{id}/output` passa a responder com
`Content-Type: application/octet-stream` e o nome de arquivo `.enc`. A página de detalhe do job no dashboard
mostra um chip "Saída criptografada" na mesma condição.

### Um arquivo rejeitado também é criptografado, e isso tem uma consequência

Quando um aprovador **rejeita** um arquivo de pagamento, ele é devolvido ao `output/` com um nome
`.reject` — a última linha da tabela acima — e, se o perfil criptografa, esse arquivo também é
criptografado. O `output/` preserva a garantia de que tudo nele é opaco, o que importa mais aqui do que
em qualquer outro lugar: uma remessa não assinada é a maior concentração de dados pessoais que o produto
manipula, e é o único arquivo que ninguém aprovou.

**A consequência, com todas as letras:** a devolução também remove o original da pasta monitorada;
então, com a criptografia ligada, **a senha do BSENC é o único caminho de volta a esses bytes.** Na
prática, isso não exige nada de novo — uma implantação que coleta a saída assinada do `output/` já
precisa da senha e de um dos [descriptografadores de exemplo](samples.md) para ler qualquer coisa. Mas,
se a sua automação só consumia arquivos `.enc` que reconhecia como assinaturas, agora ela precisa tratar
também os nomes `.reject`, e quem perde a senha perde os arquivos rejeitados exatamente como perde os
assinados.

Reconheça um arquivo rejeitado pelo **nome**, e não pela página do job: o chip "Saída criptografada" e o
`GET /api/jobs/{id}/output` descrevem apenas a saída assinada — o download não entrega arquivos
rejeitados —, então o chip não aparece em um job rejeitado mesmo quando a devolução é um envelope `.enc`.

## O procedimento de descriptografia

O algoritmo exato que os destinatários precisam implementar:

```text
1. Leia os primeiros 8 bytes; rejeite se != "BSENC\0\0\0".
2. Leia 1 byte; rejeite se != 0x01.
3. Leia o nonce de 12 bytes.
4. Leia os bytes restantes; separe os 16 bytes finais como a tag, o começo é o texto cifrado.
5. key       = PBKDF2-HMAC-SHA256(senha, salt, iterações, 32 bytes)
6. plaintext = AES-256-GCM-Decrypt(key, nonce, texto cifrado, tag)   -- lança erro se a tag não bater
```

Uma divergência de tag (passo 6) indica uma destas causas: senha errada, salt errado, contagem de
iterações errada ou um arquivo errado, corrompido ou truncado.

Duas implementações de referência acompanham esta documentação — veja **[Exemplos](samples.md)**:

- Uma ferramenta em Python 3 (requer o pacote `cryptography`).
- Uma contraparte em PowerShell 7+ (somente biblioteca padrão).

Ambas recebem a senha, o salt e a contagem de iterações por flags de linha de comando, leem o envelope
de um caminho e gravam o texto claro em outro. São implementações de referência — adapte-as ou escreva
a sua em qualquer linguagem que tenha primitivas de PBKDF2-SHA256 e AES-256-GCM.

### Python — exemplo rápido

```bash
pip install cryptography
python decrypt-bsenc.py \
  --password "$BULK_SIGNER_ENCRYPTION_PASSWORD" \
  --salt-b64 "$BULK_SIGNER_ENCRYPTION_SALT" \
  --iterations 600000 \
  --in report.signed.pdf.enc \
  --out report.signed.pdf
```

### PowerShell — exemplo rápido

```powershell
pwsh ./Decrypt-Bsenc.ps1 `
  -Password $env:BULK_SIGNER_ENCRYPTION_PASSWORD `
  -SaltBase64 $env:BULK_SIGNER_ENCRYPTION_SALT `
  -Iterations 600000 `
  -InputPath .\report.signed.pdf.enc `
  -OutputPath .\report.signed.pdf
```

## O que acontece durante a assinatura quando a criptografia está ligada

```
input/file.pdf ─▶ Assina ─▶ Verifica ─┬─ cripto ligada   ─▶ criptografa ─▶ output/file.signed.pdf.enc
                                      └─ cripto desligada ────────────────▶ output/file.signed.pdf
                          em caso de falha ─▶ error/
```

A etapa de criptografia acontece **depois** da verificação bem-sucedida — quando os bytes chegam ao
criptografador, já são bytes assinados comprovadamente válidos. Se a assinatura ou a verificação falhar,
a criptografia nunca é executada e o arquivo vai parar em `error/`, com a falha registrada no histórico
do job.

## Política de versionamento

O byte de versão do envelope é atualmente `0x01`. O layout de bytes acima é o contrato da v1 sobre o
qual as ferramentas dos destinatários são construídas. Um futuro envelope v2 teria um novo byte de
versão, e os leitores da v1 precisam continuar conseguindo ler os arquivos v1 gravados antes de qualquer
atualização. Os scripts de referência de descriptografia verificam o byte de versão e rejeitam qualquer
coisa que não entendam.

## Ressalvas operacionais

- **Uso de disco.** Arquivos criptografados são 37 bytes maiores que sua origem em texto claro.
  Desprezível em tamanhos típicos de documento.
- **Streaming.** A criptografia é feita de uma só vez; o artefato assinado inteiro fica em memória
  durante a criptografia (e durante a descriptografia, do lado do destinatário). Para arquivos muito
  grandes (vários GB), considere se o pipeline é a ferramenta certa para a carga.
- **Vazão.** Em hardware moderno (AES-NI), o custo da criptografia por arquivo é praticamente nulo. O
  custo dominante é o do PBKDF2, **na inicialização**, e não durante a assinatura em regime estável.
- **Rotação da senha.** Trocar a senha exige criptografar novamente toda saída que precise continuar
  legível com a nova senha. O Bulk Signer não oferece ferramenta embutida de recriptografia; automatize
  isso com um script externo, usando os exemplos de descriptografia mais uma etapa de criptografia
  própria.

## Modos de falha

| Sintoma | Causa provável |
|---------|----------------|
| O boot falha: "Encryption.Salt must decode to at least 16 bytes" | O salt em base64 configurado é curto demais. Gere outro com 32 bytes aleatórios. |
| O boot falha: "Encryption.Iterations must be at least 10000" | Erro de digitação na contagem de iterações (`600` em vez de `600000`). |
| O boot falha: "Encryption password is empty" | Nem a variável de ambiente nem a chave de configuração `Password` estão definidas. Defina uma delas. |
| A descriptografia do destinatário falha: divergência de tag | Senha errada, salt errado, contagem de iterações errada ou arquivo danificado. |
| A descriptografia do destinatário falha: "Unknown magic" | Não é um envelope BSENC — o operador pode ter baixado o texto claro de um job não criptografado por engano. |
| A descriptografia do destinatário falha: "Unsupported version" | O envelope é de uma versão mais nova do que o script do destinatário entende. Atualize o script. |

Veja [Diagnóstico de problemas](troubleshooting.md) para modos de falha que afetam o próprio pipeline de
assinatura.

---

**A seguir:** [Integração com o Lacuna Signer](lacuna-signer.md).
**Anterior:** [API REST](rest-api.md).
