# Atualização do Lacuna PSC em Linux

Para atualizar sua [instância *on premises*](../index.md) do [Lacuna PSC](../../index.md), siga os passos abaixo:

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


```sh
curl -O https://cdn.lacunasoftware.com/psc/psc-1.4.2.tar.gz
systemctl stop lacuna-psc
rm -fR /usr/share/lacuna-psc/*
tar xzf psc-1.4.2.tar.gz -C /usr/share/lacuna-psc
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-psc
systemctl start lacuna-psc
```

<a name="vnext" />

## Testando a próxima versão do Lacuna PSC

Para testar a próxima versão do Lacuna PSC, atualmente em estágio *Release Candidate*:

```sh
curl -O https://cdn.lacunasoftware.com/psc/psc-1.7.0-rc01.tar.gz
systemctl stop lacuna-psc
rm -fR /usr/share/lacuna-psc/*
tar xzf psc-1.7.0-rc01.tar.gz -C /usr/share/lacuna-psc
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-psc
systemctl start lacuna-psc
```

:::warning
Versões em *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas
apenas em ambientes de homologação/testes.
:::


## Veja também

* [Setup do Lacuna PSC em Linux](index.md)
* [Resolução de problemas](troubleshoot/index.md)
