# Updating Lacuna PSC on Linux

To update your [on-premises installation](../index.md) of [Lacuna PSC](../../index.md), follow the steps below:

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
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

## Testing the next version of Lacuna PSC

To test the upcoming version of Lacuna PSC, currently in Release Candidate state:

```sh
curl -O https://cdn.lacunasoftware.com/psc/psc-1.7.0-rc01.tar.gz
systemctl stop lacuna-psc
rm -fR /usr/share/lacuna-psc/*
tar xzf psc-1.7.0-rc01.tar.gz -C /usr/share/lacuna-psc
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-psc
systemctl start lacuna-psc
```

:::warning
Release Candidate versions are not production-ready and thus should only be installed on
staging or test environments.
:::


## See also

* [Setup on Linux](index.md)
* [Troubleshooting](troubleshoot/index.md)
