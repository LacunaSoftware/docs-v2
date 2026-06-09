# Updating Signer on Linux

To update your [on-premises instance](../../index.md) of [Signer](../../../index.md), follow the steps below:

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::


```sh
curl -O https://cdn.lacunasoftware.com/signer/signer-2.14.3.tar.gz
systemctl stop lacuna-signer
rm -fR /usr/share/lacuna-signer/*
tar xzf signer-2.14.3.tar.gz -C /usr/share/lacuna-signer
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-signer
systemctl start lacuna-signer
```

## See too

* [Setup on Linux - Signer](index.md)
* [Troubleshooting](troubleshoot/index.md)
