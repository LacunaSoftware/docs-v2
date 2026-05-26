# Comando do Amplia Reg: **test-email**

## Nome

`test-email` - Testa o envio de e-mail

## Sintaxe

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- test-email <to-address>
```

Ou, no Docker:

```sh
docker run -i lacunasoftware/ampliareg:3.0 [settings] -- test-email <to-address>
```

Os argumentos `settings` são configurações adicionais para sobrescrever configurações dos arquivos de configuração e variáveis de ambiente,
por exemplo `--Section1:Name1=value1 --Section2:Name2=value2`.

## Descrição

O comando `test-email` testa a configuração de e-mail tentando enviar uma mensagem de teste para o endereço informado.

## Veja também

* [Utilitário de linha de comando do Amplia Reg](index.md)
