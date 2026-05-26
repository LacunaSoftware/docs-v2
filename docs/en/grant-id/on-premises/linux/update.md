# Updating GrantID on Linux

Follow these steps to update an [on-premises](../index.md) instance of [GrantID](../../index.md) installed on Linux.

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::


Download and extract the distribution package to its own directory, then enter it:

```sh
curl -O https://cdn.lacunasoftware.com/grantid/grantid-5.3.0.tar.gz
tar -xzf grantid-5.3.0.tar.gz --one-top-level
cd grantid-5.3.0
```

Stop the services:

```sh
systemctl stop grantid-console
systemctl stop grantid-auth-server
systemctl stop grantid-identity-service
```

Remove the old binaries and copy over the new binaries:

```sh
rm -fR /usr/share/grantid/*
cp -r components/* /usr/share/grantid/
chmod -R a=,u+rwX,go+rX /usr/share/grantid
```

Start the services again:

```sh
systemctl start grantid-identity-service
systemctl start grantid-auth-server
systemctl start grantid-console
```

## See also

* [Setup on Linux](index.md)
* [Troubleshooting](troubleshoot/index.md)
