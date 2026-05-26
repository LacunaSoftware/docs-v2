# Atualização do Amplia em Linux

Para atualizar sua [instância *on premises*](../index.md) do [Amplia](../../index.md), siga os passos abaixo:

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


```sh
curl -O https://cdn.lacunasoftware.com/amplia/amplia-4.20.0.tar.gz
systemctl stop amplia
rm -fR /usr/share/amplia/*
tar xzf amplia-4.20.0.tar.gz -C /usr/share/amplia
chmod -R a=,u+rwX,go+rX /usr/share/amplia
systemctl start amplia
```

<a name="vnext" />

## Testando a próxima versão do Amplia

Para testar a próxima versão do Amplia, atualmente em estágio de *Release Candidate*:

```sh
curl -O https://cdn.lacunasoftware.com/amplia/amplia-4.22.0-rc01.tar.gz
systemctl stop amplia
rm -fR /usr/share/amplia/*
tar xzf amplia-4.22.0-rc01.tar.gz -C /usr/share/amplia
chmod -R a=,u+rwX,go+rX /usr/share/amplia
systemctl start amplia
```

:::warning
Versões em *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas
apenas em ambientes de homologação/testes.
:::


## Veja também

* [Setup do Amplia em Linux](index.md)
* [Resolução de problemas](troubleshoot/index.md)
