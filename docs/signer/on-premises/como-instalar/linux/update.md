# Atualização do Signer em Linux

Para atualizar sua [instância *on premises*](../../index.md) do [Signer](../../../index.md), siga os passos abaixo:

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


```sh
curl -O https://cdn.lacunasoftware.com/signer/signer-2.13.2.tar.gz
systemctl stop lacuna-signer
rm -fR /usr/share/lacuna-signer/*
tar xzf signer-2.13.2.tar.gz -C /usr/share/lacuna-signer
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-signer
systemctl start lacuna-signer
```

## Veja também

* [Setup do Signer em Linux](index.md)
* [Resolução de problemas](troubleshoot/index.md)
