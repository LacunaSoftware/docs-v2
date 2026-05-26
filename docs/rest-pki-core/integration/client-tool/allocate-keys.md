# Comando do utilitário cliente: **allocate-keys**

## Nome

`allocate-keys` - Reserva chaves de validação de documentos

## Sintaxe

```sh
rpkitool allocate-keys [<count>]
```

## Exemplos

Para reservar uma única chave:

```sh
rpkitool allocate-keys
```

Para reservar 10 chaves:

```sh
rpkitool allocate-keys 10
```

## Saída

As chaves são escritas no `stdout`, uma por linha, com formatação, por exemplo:

```sh
AAAA-AAAA-AAAA-AAAA
BBBB-BBBB-BBBB-BBBB
CCCC-CCCC-CCCC-CCCC
```
