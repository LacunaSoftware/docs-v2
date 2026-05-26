# Updating Rest PKI Core on Linux

To update your [on-premises installation](../index.md) of [Rest PKI Core](../../index.md), follow the steps below:

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::


```sh
curl -O https://cdn.lacunasoftware.com/restpkicore/restpkicore-4.1.0.tar.gz
systemctl stop restpkicore
rm -fR /usr/share/restpkicore/*
tar xzf restpkicore-4.1.0.tar.gz -C /usr/share/restpkicore
chmod -R a=,u+rwX,go+rX /usr/share/restpkicore
systemctl start restpkicore
```

{/* <a name="vnext" /> ## Testing the next version of Rest PKI Core To test the upcoming version of Rest PKI Core, currently in Release Candidate state: ```sh curl -O https://cdn.lacunasoftware.com/restpkicore/restpkicore-3.3.0-rc12.tar.gz systemctl stop restpkicore rm -fR /usr/share/restpkicore/* tar xzf restpkicore-3.3.0-rc12.tar.gz -C /usr/share/restpkicore chmod -R a=,u+rwX,go+rX /usr/share/restpkicore systemctl start restpkicore ``` :::warning Release Candidate versions are not production-ready and thus should only be installed on staging or test environments. ::: */}

## See also

* [Setup on Linux](index.md)
* [Troubleshooting](troubleshoot/index.md)
