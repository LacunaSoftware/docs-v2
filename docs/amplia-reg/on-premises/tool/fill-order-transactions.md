# Comando do Amplia Reg: **fill-order-transactions**

## Nome

`fill-order-transactions` - Preenche o histórico de transações de custo de pedidos antigos

## Sintaxe

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- fill-order-transactions [options]
```

Ou, no Docker:

```sh
docker run -i lacunasoftware/ampliareg:x.y.z [settings] -- fill-order-transactions [options]
```

:::info
Substitua `x.y.z` acima pela versão desejada
:::

Os argumentos `settings` são configurações adicionais para sobrescrever configurações dos arquivos de configuração e variáveis de ambiente,
por exemplo `--Section1:Name1=value1 --Section2:Name2=value2`.

Opções:

* `--batchsize <batch-size>`: número de pedidos a processar por lote. Padrão: 100
* `--logfrequency <log-frequency>`: frequência, em número de pedidos processados, com que o progresso é exibido no log. Um valor menor ou igual a zero desativa esse log. Padrão: 5

## Descrição

O comando `fill-order-transactions` reconstrói, a partir da trilha de eventos de cada pedido, as transações do relatório de controle de custos
por pedido (introduzido na versão [7.0.0](../../changelog.md#7.0.0)) para pedidos que já existiam antes desse controle passar a registrar
transações em tempo real.

O comando busca, para cada pedido, eventos históricos (envio de SMS/e-mail, consultas a DataValid/Serpro/Acertpix, liveness, PSBio, etc.) que
ainda não possuem uma transação de custo correspondente e cria as transações faltantes com a data original do evento.

:::info
Este comando é opcional: pedidos criados ou que tiverem novos eventos a partir da versão 7.0.0 já têm suas transações de custo registradas
automaticamente. Execute este comando apenas se desejar que o relatório de custos também reflita o histórico de pedidos anteriores a essa versão.
:::

Antes de processar, o comando exibe a quantidade de pedidos encontrados e solicita confirmação (`Y`) antes de prosseguir, pois a ação é irreversível.

## Veja também

* [Utilitário de linha de comando do Amplia Reg](index.md)
