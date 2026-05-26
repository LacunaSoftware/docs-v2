# Atualização do Rest PKI Core em Linux

Para atualizar sua [instância *on premises*](../index.md) do [Rest PKI Core](../../index.md), siga os passos abaixo:

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


```sh
curl -O https://cdn.lacunasoftware.com/restpkicore/restpkicore-4.1.0.tar.gz
systemctl stop restpkicore
rm -fR /usr/share/restpkicore/*
tar xzf restpkicore-4.1.0.tar.gz -C /usr/share/restpkicore
chmod -R a=,u+rwX,go+rX /usr/share/restpkicore
systemctl start restpkicore
```

{/* <a name="vnext" /> ## Testando a próxima versão do Rest PKI Core Para testar a próxima versão do Rest PKI Core, atualmente em estágio *Release Candidate*: ```sh curl -O https://cdn.lacunasoftware.com/restpkicore/restpkicore-3.3.0-rc12.tar.gz systemctl stop restpkicore rm -fR /usr/share/restpkicore/* tar xzf restpkicore-3.3.0-rc12.tar.gz -C /usr/share/restpkicore chmod -R a=,u+rwX,go+rX /usr/share/restpkicore systemctl start restpkicore ``` :::warning Versões em *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas apenas em ambientes de homologação/testes. ::: */}

## Veja também

* [Setup do Rest PKI Core em Linux](index.md)
* [Resolução de problemas](troubleshoot/index.md)
