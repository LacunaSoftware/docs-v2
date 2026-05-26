# Comando do Amplia Reg: **gen-enc-key**

## Nome

`gen-enc-key` - Gera uma chave de criptografia aleatória (para criptografar colunas sensíveis do banco de dados)

## Sintaxe

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll -- gen-enc-key
```

Ou, no Docker:

```sh
docker run lacunasoftware/ampliareg:3.0 -- gen-enc-key
```

## Descrição

O comando `gen-enc-key` gera uma chave de criptografia de 256 bits para ser utilizada na configuração `General__EncryptionKey`, que é usada pelo Amplia Reg para criptografar dados sensíveis armazenados no banco de dados.

## Veja também

* [Utilitário de linha de comando do Amplia Reg](index.md)
