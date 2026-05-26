# Manual activation of PKI Express

If during the installation of [PKI Express](../index.md) the activation procedure fails, please follow the steps
below to manually activate PKI Express.

:::note
These instructions refer to installation on Linux environments only. To activate PKI Express on Windows,
either over the network or manually, use the *PKI Express Configuration Manager* tool (**pkiemgr.exe**)
:::


To activate PKI Express manually, start by acquiring the activation *request code*:

```sh
pkie activate LacunaPkiLicense.config --request
```

A file named **pkie-activation-request.pem** will be saved on the current folder. Contact us through
our [Support Center](http://lacuna.help) attaching the file.

Upon receiving the activation file back from support (**pkie-activation.pem**), copy the file to the
current directory and execute:

```sh
sudo pkie activate
```

Or, if you prefer, execute the command passing the path to the activation file:

```sh
sudo pkie activate --file /path/to/pkie-activation.pem
```
