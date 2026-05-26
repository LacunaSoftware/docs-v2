# Comando do utilitário cliente: **list-certs**

## Nome

`list-certs` - Lista os certificados presentes no repositório de certificados do usuário

## Sintaxe

```sh
rpkitool list-certs [options]
```

Opções:

* `--icpbr`: Listar apenas certificados ICP-Brasil\*
* `--cpf <cpf>`: Listar apenas certificados com o CPF especificado

\* São listados os certificados que *parecem ser* da ICP-Brasil. A verificação se um determinado certificado é um certificado ICP-Brasil válido é uma tarefa
complexa feita em outro momento pelo Rest PKI, não cabendo ao utilitário fazer esse tipo de crítica.

## Exemplos

Para listar todos os certificados com o CPF `11111111111`:

```sh
rpkitool list-certs --cpf 11111111111
```

## Saída

São escritas para o `stdout` as seguintes informações de cada certificado encontrado, separadas por ponto-e-vírgula (`;`), um certificado por linha:

1. *Thumbprint* do certificado (para ser usado como argumento para outros comandos, por exemplo [sign](sign.md))
1. Descrição do certificado composta pelo nome do titular e nome da autoridade certificadora (AC)

Exemplo:

```plaintext
78785300913FB340D6ADC12FA2A9F21CF1498703;FULANO DE TAL:11111111111 (AC VALID RFB)
C6BCC85172428B2454F24A588C03E6BD0CB035ED;FULANO DE TAL:11111111111 (AC FENACON RFB)
```
