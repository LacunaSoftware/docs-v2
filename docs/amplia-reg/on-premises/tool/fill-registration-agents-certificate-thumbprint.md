# Comando do Amplia Reg: **fill-registration-agents-certificate-thumbprint**

## Nome

`fill-registration-agents-certificate-thumbprint` - Preenche a *thumbprint* do certificado de agentes de registro existentes

## Sintaxe

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- fill-registration-agents-certificate-thumbprint [options]
```

Ou, no Docker:

```sh
docker run -i lacunasoftware/ampliareg:x.y.z [settings] -- fill-registration-agents-certificate-thumbprint [options]
```

:::info
Substitua `x.y.z` acima pela versão desejada
:::

Os argumentos `settings` são configurações adicionais para sobrescrever configurações dos arquivos de configuração e variáveis de ambiente,
por exemplo `--Section1:Name1=value1 --Section2:Name2=value2`.

Opções:

* `--batchsize <batch-size>`: número de agentes de registro a processar por lote. Padrão: 100
* `--logfrequency <log-frequency>`: frequência, em número de agentes processados, com que o progresso é exibido no log. Um valor menor ou igual a zero desativa esse log. Padrão: 5

## Descrição

O comando `fill-registration-agents-certificate-thumbprint` busca agentes de registro que já possuem um certificado cadastrado mas que ainda
não possuem a *thumbprint* (SHA-256) desse certificado preenchida, calcula a *thumbprint* a partir do certificado armazenado e a grava no agente.

Este campo foi adicionado na versão [6.3.0](../../changelog.md#6.3.0) e é preenchido automaticamente para novos cadastros e atualizações de
certificado a partir dessa versão; agentes de registro cadastrados **antes** dela precisam deste comando para terem a *thumbprint* preenchida.

Antes de processar, o comando exibe a quantidade de agentes encontrados e solicita confirmação (`Y`) antes de prosseguir, pois a ação é irreversível.

## Veja também

* [Utilitário de linha de comando do Amplia Reg](index.md)
