---
sidebar_label: "Criptografia (BSENC v1)"
sidebar_position: 11
---

# Criptografia — BSENC v1

Criptografia pós-assinatura opcional. **Desligada por padrão.** Quando habilitada, o Bulk Signer
criptografa o artefato assinado entre o sucesso da verificação e a promoção para a saída. Os bytes
assinados em texto claro nunca chegam a `output/`; somente um envelope criptografado (BSENC v1) é
escrito. Os destinatários descriptografam com a senha, o salt e a contagem de iterações configurados,
usando a receita documentada de PBKDF2-HMAC-SHA256 + AES-256-GCM — não há endpoint de descriptografia
no servidor.

## Quando habilitar a criptografia

- **Habilite** quando o diretório operacional `output/` puder ser lido por partes que não podem ver o
  conteúdo do artefato assinado (disco multi-inquilino, um destino de backup menos confiável, um alvo
  de replicação de menor confiança).
- **Deixe desabilitada** quando apenas operadores autorizados alcançam `output/` e a automação a
  jusante espera artefatos assinados em texto claro, prontos para repassar. Este é o caso mais comum.
- **A criptografia é ortogonal à assinatura.** A assinatura é computada sobre o documento em texto
  claro, exatamente como se a criptografia estivesse desligada. A criptografia embrulha os bytes
  assinados em um contêiner privado, para proteção em trânsito / em repouso. Os destinatários
  descriptografam primeiro, e então verificam a assinatura com ferramental PKI normal (`openssl cms`,
  o Lacuna PKI SDK, Adobe Reader, etc.).

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
roda quando `Enabled = true` e falha imediatamente em:

- Senha vazia (variável de ambiente + `Password` ambos vazios).
- Salt ausente.
- Salt que decodifica para menos de 16 bytes.
- `Iterations` abaixo de 10.000 (pega o erro de digitação `600` em vez de `600000`).

### Gerando o salt

O salt não é secreto; ele precisa ser estável por toda a vida da saída criptografada (mudá-lo invalida
todo envelope anterior). 32 bytes aleatórios é o tamanho certo:

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

Forte, de alta entropia, registrada uma vez em um lugar que os destinatários também consigam ler (um
envelope lacrado, um gerenciador de segredos, uma cópia impressa em um cofre).

```bash
openssl rand -base64 32
```

Coloque o resultado em `BULK_SIGNER_ENCRYPTION_PASSWORD` (variável de ambiente, preferido) ou em
`Encryption:Password` no `appsettings.Production.json` (que está no gitignore).

:::danger A perda da senha significa a perda de toda saída criptografada, para sempre.
Não há mecanismo de recuperação. Guarde a senha em um gerenciador de segredos e/ou em um backup físico
lacrado.
:::

## A derivação de chave

```
senha (ambiente ou config) ────────┐
salt (base64 decodificado, ≥16 B) ─┼─▶ PBKDF2-HMAC-SHA256 ─▶ chave derivada de 32 bytes (só em memória)
iterações (padrão 600000) ─────────┘
```

A derivação roda **uma vez na inicialização**. A chave derivada de 32 bytes vive na memória do processo
por toda a vida do processo. Ela nunca é escrita em disco, nunca registrada em log, nunca retornada por
endpoint algum.

A derivação exata:

```text
password   = (variável de ambiente não vazia) ? valor do ambiente : Encryption:Password
saltBytes  = base64-decode(Encryption:Salt)
key        = PBKDF2-HMAC-SHA256(password, saltBytes, Iterations, 32 bytes)
```

A recomendação da OWASP de 2023 para PBKDF2-HMAC-SHA256 é de 600.000 iterações; esse é o padrão. Mais =
inicialização mais lenta (um custo único) e mais difícil de quebrar por força bruta; menos =
inicialização mais rápida e mais fraca. Não reduza abaixo da recomendação da OWASP sem um motivo
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

O overhead de cabeçalho é de **37 bytes por arquivo** (8 de magic + 1 de versão + 12 de nonce + 16 de
tag). O dado associado (AAD) do GCM é intencionalmente vazio na v1 — o destinatário precisa apenas da
senha, do salt e da contagem de iterações para descriptografar. O código do destinatário deve rejeitar
qualquer arquivo que não comece com o prefixo exato de 9 bytes de magic + versão.

## Convenção de nome de arquivo

O nome do envelope criptografado simplesmente acrescenta `.enc` ao nome assinado em texto claro:

| Formato de assinatura | Nome assinado em texto claro | Nome do envelope criptografado |
|-----------------------|------------------------------|-------------------------------|
| PAdES | `report.signed.pdf` | `report.signed.pdf.enc` |
| CAdES | `data.bin.p7m` | `data.bin.p7m.enc` |
| XAdES | `contract.signed.xml` | `contract.signed.xml.enc` |

O `GET /api/jobs/{id}/output` troca sua resposta para `Content-Type: application/octet-stream` e o nome
de arquivo `.enc` quando a saída do job está criptografada. A página de detalhe do job no dashboard
mostra um chip "Saída criptografada" na mesma condição.

## A receita de descriptografia

O algoritmo exato que os destinatários precisam implementar:

```text
1. Leia os primeiros 8 bytes; rejeite se != "BSENC\0\0\0".
2. Leia 1 byte; rejeite se != 0x01.
3. Leia o nonce de 12 bytes.
4. Leia os bytes restantes; separe os 16 bytes finais como a tag, o começo é o texto cifrado.
5. key       = PBKDF2-HMAC-SHA256(senha, salt, iterações, 32 bytes)
6. plaintext = AES-256-GCM-Decrypt(key, nonce, texto cifrado, tag)   -- lança erro se a tag não bater
```

Divergência de tag (passo 6) significa uma de: senha errada, salt errado, contagem de iterações errada,
ou um arquivo errado / corrompido / truncado.

Duas implementações de referência acompanham esta documentação — veja **[Exemplos](samples.md)**:

- Uma ferramenta em Python 3 (requer o pacote `cryptography`).
- Uma contraparte em PowerShell 7+ (somente biblioteca padrão).

Ambas aceitam a senha, o salt e a contagem de iterações por flags de linha de comando, leem o envelope
de um caminho, e escrevem o texto claro em um caminho. Elas são implementações de referência — adapte-as
ou escreva a sua própria em qualquer linguagem com primitivas de PBKDF2-SHA256 e AES-256-GCM.

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
criptografador, eles são bytes assinados reconhecidamente bons. Se a assinatura ou a verificação falhar,
a criptografia nunca roda e o arquivo acaba sob `error/`, com a falha registrada no histórico do job.

## Política de versionamento

O byte de versão do envelope é atualmente `0x01`. O layout de bytes acima é o contrato da v1 contra o
qual o ferramental dos destinatários é construído. Um futuro envelope v2 carregaria um novo byte de
versão, e leitores da v1 precisam continuar capazes de ler arquivos v1 escritos antes de qualquer
atualização. Os scripts de referência de descriptografia verificam o byte de versão e rejeitam qualquer
coisa que não entendam.

## Ressalvas operacionais

- **Uso de disco.** Arquivos criptografados são 37 bytes maiores que sua origem em texto claro.
  Desprezível em tamanhos típicos de documento.
- **Streaming.** A criptografia é feita de uma só vez; o artefato assinado inteiro fica em memória
  durante a criptografia (e durante a descriptografia, do lado do destinatário). Para arquivos muito
  grandes (vários GB), considere se o pipeline é a ferramenta certa para a carga.
- **Vazão.** A criptografia é praticamente gratuita por arquivo em hardware moderno (AES-NI). O PBKDF2
  domina **na inicialização**, não durante a assinatura em regime estável.
- **Rotação da senha.** Rotacionar a senha exige recriptografar toda saída que precise permanecer
  legível sob a nova senha. O Bulk Signer não oferece ferramenta embutida de recriptografia; faça um
  script externo usando os exemplos de descriptografia mais uma etapa de criptografia própria.

## Modos de falha

| Sintoma | Causa provável |
|---------|----------------|
| Boot falha: "Encryption.Salt must decode to at least 16 bytes" | O salt em base64 configurado é curto demais. Regenere com 32 bytes de aleatoriedade. |
| Boot falha: "Encryption.Iterations must be at least 10000" | Erro de digitação na contagem de iterações (`600` em vez de `600000`). |
| Boot falha: "Encryption password is empty" | Nem a variável de ambiente nem a chave de configuração `Password` estão definidas. Defina uma. |
| A descriptografia do destinatário falha: divergência de tag | Senha errada, salt errado, contagem de iterações errada, ou um arquivo danificado. |
| A descriptografia do destinatário falha: "Unknown magic" | Não é um envelope BSENC — o operador pode ter baixado o texto claro de um job não criptografado por engano. |
| A descriptografia do destinatário falha: "Unsupported version" | O envelope é de uma versão mais nova do que o script do destinatário entende. Atualize o script. |

Veja [Diagnóstico de problemas](troubleshooting.md) para modos de falha que afetam o próprio pipeline de
assinatura.

---

**A seguir:** [Integração com o Lacuna Signer](lacuna-signer.md).
**Anterior:** [API REST](rest-api.md).
