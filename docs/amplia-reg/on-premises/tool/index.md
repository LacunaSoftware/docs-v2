---
sidebar_label: "Ferramenta de linha de comando"
sidebar_position: 1
---

# Amplia Reg - Utilitário de linha de comando

As [instâncias on-premises](../index.md) do [Amplia Reg](../../index.md) disponibilizam um utilitário de linha de comando que pode ser
usado para realizar determinadas tarefas administrativas.

## Executando um comando

Abra um terminal e navegue até o diretório de instalação, que depende da plataforma de instalação
(o diretório pode ser diferente se você escolheu um diretório personalizado durante a instalação):

* Windows Server: `cd C:\inetpub\AmpliaReg`
* Linux: `cd /usr/share/ampliareg`

Em seguida, execute:

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- command [command-options]
```

Ou, no Docker, basta executar o seguinte em qualquer diretório:

```sh
docker run -i lacunasoftware/ampliareg:3.0 [settings] -- command [command-options]
```

Os argumentos `settings` são configurações adicionais para sobrescrever configurações dos arquivos de configuração e variáveis de ambiente,
por exemplo `--Section1:Name1=value1 --Section2:Name2=value2`.

Os argumentos `command-options` dependem de cada comando; consulte a documentação específica de cada comando.

Comandos disponíveis:

* [gen-enc-key](gen-enc-key.md)
* [hash-root-pass](hash-root-pass.md)
* [update-db](update-db.md)
* [test-email](test-email.md)
* [test-cert-renewal-alert](test-certificate-renewal-alert.md)
* [migrate-data](migrate-data.md)

## Veja também

* [Amplia Reg on-premises](../index.md)
