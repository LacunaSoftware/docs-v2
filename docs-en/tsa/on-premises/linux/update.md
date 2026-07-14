# Updating Lacuna TSA on Linux

To update your [on-premises installation](../index.md) of [Lacuna TSA](../../index.md), follow the steps below:

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::


```sh
curl -O https://cdn.lacunasoftware.com/tsa/tsa-1.2.1.tar.gz
systemctl stop lacuna-tsa
rm -fR /usr/share/lacuna-tsa/*
tar xzf tsa-1.2.1.tar.gz -C /usr/share/lacuna-tsa
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-tsa
systemctl start lacuna-tsa
```

{/* <a name="vnext" /> ## Testing the next version of Lacuna TSA To test the upcoming version of Lacuna TSA, currently in Release Candidate state: {/* include: ../../../../../includes/tsa/linux/update-vnext.md */} :::warning Release Candidate versions are not production-ready and thus should only be installed on staging or test environments. ::: */}

## See also

* [Setup on Linux](index.md)
* [Troubleshooting](troubleshoot/index.md)
