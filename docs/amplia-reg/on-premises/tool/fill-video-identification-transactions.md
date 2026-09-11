# Comando do Amplia Reg: **fill-video-identification-transactions**

## Nome

`fill-video-identification-transactions` - Preenche o evento e a transação de conclusão de pedidos de Vídeo Identificação antigos

## Sintaxe

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- fill-video-identification-transactions [options]
```

Ou, no Docker:

```sh
docker run -i lacunasoftware/ampliareg:x.y.z [settings] -- fill-video-identification-transactions [options]
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

O comando `fill-video-identification-transactions` busca pedidos de Vídeo Identificação que foram concluídos **antes** da introdução do evento
`OrderVideoIdentificationCompleted` e da respectiva transação no relatório de controle de custos por pedido (versão [8.0.0](../../changelog.md#8.0.0)),
identificando-os pela data de entrada na fila de validação da Vídeo Identificação.

Para cada pedido encontrado, o comando cria o evento `OrderVideoIdentificationCompleted` (caso ainda não exista) e a transação de custo
correspondente, com a data em que o pedido efetivamente entrou na fila de validação.

:::info
Este comando é opcional: pedidos de Vídeo Identificação concluídos a partir da versão 8.0.0 já têm esse evento e transação registrados
automaticamente. Execute este comando apenas se desejar que o relatório de custos também reflita pedidos de Vídeo Identificação concluídos
antes dessa versão.
:::

Antes de processar, o comando exibe a quantidade de pedidos encontrados e solicita confirmação (`Y`) antes de prosseguir, pois a ação é irreversível.

## Veja também

* [Utilitário de linha de comando do Amplia Reg](index.md)
