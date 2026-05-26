# Atualização do Amplia Reg em Linux

Para atualizar sua [instância *on premises*](../index.md) do [Amplia Reg](../../index.md), siga os passos abaixo:

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


```sh
curl -O https://cdn.lacunasoftware.com/ampliareg/ampliareg-3.0.0.tar.gz
systemctl stop ampliareg
rm -fR /usr/share/ampliareg/*
tar xzf ampliareg-3.0.0.tar.gz -C /usr/share/ampliareg
chmod -R a=,u+rwX,go+rX /usr/share/ampliareg
systemctl start ampliareg
```

<a name="vnext" />

## Testando a próxima versão do Amplia Reg

Para testar a próxima versão do Amplia Reg, atualmente em estágio *Release Candidate*:

```sh
curl -O https://cdn.lacunasoftware.com/ampliareg/ampliareg-3.1.0-rc02.tar.gz
systemctl stop ampliareg
rm -fR /usr/share/ampliareg/*
tar xzf ampliareg-3.1.0-rc02.tar.gz -C /usr/share/ampliareg
chmod -R a=,u+rwX,go+rX /usr/share/ampliareg
systemctl start ampliareg
```

:::warning
Versões em *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas
apenas em ambientes de homologação/testes.
:::


## Veja também

* [Setup do Amplia Reg em Linux](index.md)
* [Resolução de problemas](troubleshoot/index.md)
