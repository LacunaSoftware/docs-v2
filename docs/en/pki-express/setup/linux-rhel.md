# Install PKI Express on Red Hat Enterprise Linux

In order to install PKI Express on Red Hat Enterprise Linux (RHEL) you will need a license file. If you don't have a license yet, [request a trial license](https://www.lacunasoftware.com/en/home/purchase).

With the license file (**LacunaPkiLicense.config**) at hand, follow the steps below:

<a name="install" />
## Installing PKI Express

Download PKI Express and extract to the destination directory:

```sh
curl -O https://cdn.lacunasoftware.com/pki-express/linux/pkie-1.36.2.tar.gz
sudo mkdir /usr/share/pkie
sudo tar xzf pkie-1.36.2.tar.gz -C /usr/share/pkie
sudo chmod +x /usr/share/pkie/pkie
sudo ln -s /usr/share/pkie/pkie /usr/local/bin/pkie
```

Create a folder to write log files and configure it on PKI Express:

```sh
sudo mkdir /var/log/pkie
sudo chmod 777 /var/log/pkie
sudo pkie config --set logDir=/var/log/pkie
```

Activate PKI Express:

```sh
sudo pkie activate LacunaPkiLicense.config
```

:::note
If the activation over the network fails, see [Manual activation](manual-activation.md).
:::


<a name="update" />
## Update

To update PKI Express, simply download the new package and extract to the destination folder:

```sh
curl -O https://cdn.lacunasoftware.com/pki-express/linux/pkie-1.36.2.tar.gz
sudo rm -R /usr/share/pkie/*
sudo tar xzf pkie-1.36.2.tar.gz -C /usr/share/pkie
sudo chmod -R a=r,a+X,u+w /usr/share/pkie
```

:::note
If you are updating from a version 1.0.x, you will need to configure the log folder and activate PKI Express (see instructions above)
:::

