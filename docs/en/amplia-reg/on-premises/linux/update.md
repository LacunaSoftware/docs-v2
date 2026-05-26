# Updating Amplia Reg on Linux

To update your [on-premises installation](../index.md) of [Amplia Reg](../../index.md), follow the steps below:

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
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

## Testing the next version of Amplia Reg

To test the upcoming version of Amplia Reg, currently in Release Candidate state:

```sh
curl -O https://cdn.lacunasoftware.com/ampliareg/ampliareg-3.1.0-rc02.tar.gz
systemctl stop ampliareg
rm -fR /usr/share/ampliareg/*
tar xzf ampliareg-3.1.0-rc02.tar.gz -C /usr/share/ampliareg
chmod -R a=,u+rwX,go+rX /usr/share/ampliareg
systemctl start ampliareg
```

:::warning
Release Candidate versions are not production-ready and thus should only be installed on
staging or test environments.
:::


## See also

* [Setup on Linux](index.md)
* [Troubleshooting](troubleshoot/index.md)
