---
slug: /rest-pki/core/on-premises/update-50
sidebar_position: 3
sidebar_label: "Update from 4.x to 5.0"
---

# Update Rest PKI Core from 4.x to 5.0

Version [5.0](../../changelog.md#v5-0-0) of [Rest PKI Core](../../index.md) has been migrated from ASP.NET Core 8.0 to ASP.NET Core 10.0, the current LTS release
of ASP.NET Core, [supported by Microsoft until November 2028](https://dotnet.microsoft.com/platform/support/policy/dotnet-core#lifecycle) (support for
ASP.NET Core 8.0 ends in November 2026).

Because of that, before updating your [on-premises](../index.md) instance, you must follow a few extra steps.

## 1. Install the ASP.NET Core Runtime 10.0

Install the runtime corresponding to your platform, as described below.

:::tip
It is not necessary to uninstall previous versions of ASP.NET Core Runtime, multiple versions can co-exist in the same system without issues
:::

:::note
On Docker and on Azure App Services this step is not necessary since the new 5.x image already ships with the ASP.NET Core Runtime 10.0 embedded
:::

### Ubuntu

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::

On **Ubuntu 24.04 (LTS) or later**, the ASP.NET Core Runtime 10.0 is available on the built-in Ubuntu package feed:

```sh
apt update
apt install -y aspnetcore-runtime-10.0
```

On **Ubuntu 22.04 (LTS)**, first register the Ubuntu .NET backports package repository, then install the runtime:

```sh
add-apt-repository ppa:dotnet/backports
apt update
apt install -y aspnetcore-runtime-10.0
```

:::warning
Ubuntu 20.04 and earlier versions are not supported by .NET 10. Upgrade the operating system before updating Rest PKI Core.
:::

### Rocky Linux

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::

On Rocky Linux 8, 9 and 10 (as well as RHEL and other compatible distributions), the ASP.NET Core Runtime 10.0 is available on the AppStream repository:

```sh
dnf install aspnetcore-runtime-10.0
```

### Windows Server

Download and install the **ASP.NET Core Runtime 10.0 Hosting Bundle** from the [.NET 10.0 download page](https://dotnet.microsoft.com/download/dotnet/10.0)
(section *ASP.NET Core Runtime*, item *Hosting Bundle* under *Windows*). After the installation, restart IIS:

```
iisreset
```

### Test the installation

On Linux, run:

```sh
dotnet --list-runtimes
```

The output should include a line similar to:

```
Microsoft.AspNetCore.App 10.0.* [*/dotnet/shared/Microsoft.AspNetCore.App]
```

:::tip
For other operating system versions and alternative ways to install the ASP.NET Core Runtime, see [this page](https://learn.microsoft.com/dotnet/core/install/)
:::

## 2. Update Rest PKI Core

After installing the runtime, proceed with the standard update instructions:

- [Docker](../docker.md): update to the `lacunasoftware/restpkicore:5.0` image
- [Linux](../linux/update.md)
- [Azure App Services](../azure/update.md)

:::note
Version 5.0 updates the database model. On the default installation, in which the application has owner privileges over the database, the model is
updated automatically the first time version 5.0 starts. If your instance runs [without db_owner privileges](../unprivileged-db-user.md), run the
[update-db](../tool/update-db.md) command before starting the new version.
:::

:::note Docker image
The Linux images of version 5.x are based on **Ubuntu 24.04 (noble)** instead of Debian 12 (bookworm). This has no effect if you simply run the image.
If you extend the image or execute commands inside the container (for instance, to install additional packages), take into account the Ubuntu
package set and system paths.
:::

## 3. Check the installed version

After the update, [check the version](../check-version.md) of your instance. The `productVersion` field should start with `5.0`.

## OpenTelemetry

If your instance exports telemetry to an OpenTelemetry collector, note that the default value of the `service.name` resource attribute changed from
`restpkicore` to `Lacuna Rest PKI Core`. If your dashboards or queries filter on the previous value, set the `OTEL_SERVICE_NAME` environment variable
explicitly:

```sh
OTEL_SERVICE_NAME=restpkicore
```
