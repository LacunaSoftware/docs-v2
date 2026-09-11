# Comando do Amplia Reg: **fill-registration-agent-report-transactions**

## Nome

`fill-registration-agent-report-transactions` - Preenche o histórico de transações de relatório de agentes de registro antigos

## Sintaxe

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- fill-registration-agent-report-transactions [options]
```

Ou, no Docker:

```sh
docker run -i lacunasoftware/ampliareg:x.y.z [settings] -- fill-registration-agent-report-transactions [options]
```

:::info
Substitua `x.y.z` acima pela versão desejada
:::

Os argumentos `settings` são configurações adicionais para sobrescrever configurações dos arquivos de configuração e variáveis de ambiente,
por exemplo `--Section1:Name1=value1 --Section2:Name2=value2`.

Opções:

* `--batchsize <batch-size>`: número de agentes de registro a processar por lote. Padrão: 100
* `--logfrequency <log-frequency>`: frequência, em número de agentes processados, com que o progresso é exibido no log. Um valor menor ou igual a zero desativa esse log. Padrão: 5
* `--certificate-changed-only`: processa apenas os eventos de troca de certificado do agente (`RegistrationAgentCertificateUpdated`), ignorando os demais tipos de evento (aprovação, desabilitação e atualização de cadastro)

## Descrição

O comando `fill-registration-agent-report-transactions` reconstrói, a partir da trilha de eventos de cada agente de registro, as transações
do relatório de agentes de registro (introduzido na versão [8.0.0](../../changelog.md#8.0.0)) para agentes que já existiam antes desse
relatório passar a registrar transações em tempo real.

O comando busca, para cada agente de registro, eventos históricos de aprovação, desabilitação, atualização de cadastro e troca de certificado
que ainda não possuem uma transação correspondente e cria as transações faltantes com a data original do evento.

:::warning
Se você já executou este comando em uma versão anterior à [8.0.5](../../changelog.md#8.0.5), execute-o novamente com a opção
`--certificate-changed-only` após atualizar para a versão 8.0.5 ou superior. Essa versão corrigiu o preenchimento das transações de troca de
certificado (veja [ARNG-980](../../changelog.md#8.0.6)) e a opção garante que apenas os eventos de troca de certificado sejam reprocessados,
sem duplicar as demais transações já preenchidas.
:::

:::info
Este comando é opcional: agentes de registro criados ou que tiverem novos eventos a partir da versão 8.0.0 já têm suas transações de relatório
registradas automaticamente. Execute este comando apenas se desejar que o relatório também reflita o histórico de agentes de registro
anteriores a essa versão.
:::

Antes de processar, o comando exibe a quantidade de agentes encontrados e solicita confirmação (`Y`) antes de prosseguir, pois a ação é irreversível.

## Veja também

* [Utilitário de linha de comando do Amplia Reg](index.md)
