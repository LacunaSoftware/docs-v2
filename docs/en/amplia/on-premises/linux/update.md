# Updating Amplia on Linux

To update your [on-premises installation](../index.md) of [Amplia](../../index.md), follow the steps below:

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
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

## Testing the next version of Amplia

To test the upcoming version of Amplia, currently in Release Candidate state:

```sh
curl -O https://cdn.lacunasoftware.com/amplia/amplia-4.22.0-rc01.tar.gz
systemctl stop amplia
rm -fR /usr/share/amplia/*
tar xzf amplia-4.22.0-rc01.tar.gz -C /usr/share/amplia
chmod -R a=,u+rwX,go+rX /usr/share/amplia
systemctl start amplia
```

:::warning
Release Candidate versions are not production-ready and thus should only be installed on
staging or test environments.
:::


## See also

* [Setup on Linux](index.md)
* [Troubleshooting](troubleshoot/index.md)
