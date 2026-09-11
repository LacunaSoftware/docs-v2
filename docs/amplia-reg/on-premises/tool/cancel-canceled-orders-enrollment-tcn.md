# Comando do Amplia Reg: **cancel-canceled-orders-enrollment-tcn**

## Nome

`cancel-canceled-orders-enrollment-tcn` - Cancela o TCN de cadastro (*enrollment*) no PSBio de pedidos cancelados

## Sintaxe

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- cancel-canceled-orders-enrollment-tcn [options]
```

Ou, no Docker:

```sh
docker run -i lacunasoftware/ampliareg:x.y.z [settings] -- cancel-canceled-orders-enrollment-tcn [options]
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

O comando `cancel-canceled-orders-enrollment-tcn` busca pedidos brasileiros cancelados que ainda possuem um TCN de cadastro (*enrollment*) aberto
no PSBio e cancela esse TCN, evitando que o cadastro biométrico do titular permaneça pendente na rede PSBio para um pedido que já foi cancelado.

Este comando é útil para corrigir pedidos que foram cancelados **antes** da correção do [ARNG-905](../../changelog.md#5.26.0), quando o TCN de
cadastro não era cancelado automaticamente. Pedidos cancelados após essa correção já têm o TCN cancelado automaticamente, não sendo necessário
executar este comando para eles.

Antes de processar, o comando exibe a quantidade de pedidos encontrados e solicita confirmação (`Y`) antes de prosseguir, pois a ação é irreversível.

## Veja também

* [Utilitário de linha de comando do Amplia Reg](index.md)
