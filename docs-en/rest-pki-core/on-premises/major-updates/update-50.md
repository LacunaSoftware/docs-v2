---
slug: /rest-pki/core/on-premises/update-50
sidebar_position: 3
sidebar_label: "Update from 4.x to 5.0"
---

# Update Rest PKI Core from 4.x to 5.0

Version [5.0](../../changelog.md#v5-0-0) of [Rest PKI Core](../../index.md) has been migrated from ASP.NET Core 8.0 to ASP.NET Core 10.0, the current LTS release
of ASP.NET Core, [supported by Microsoft until November 2028](https://dotnet.microsoft.com/platform/support/policy/dotnet-core#lifecycle) (support for
ASP.NET Core 8.0 ends in November 2026).

Because of that, before updating your [on-premises](../index.md) instance, you may need to follow a few extra steps, depending on how it is deployed.

## 1. Check how your instance is deployed

- If your instance runs on **Docker** or on **Azure App Services**, the 5.x image already ships with the ASP.NET Core Runtime 10.0 and everything else it
  needs. There is nothing to install: **skip directly to step 3**.
- If your instance runs directly on **Linux** (Ubuntu, Rocky Linux) or on **Windows Server**, you must install the new runtime first: **proceed to step 2**.

## 2. Install the ASP.NET Core Runtime 10.0

Install the runtime corresponding to your platform, as described below.

:::tip
It is not necessary to uninstall previous versions of ASP.NET Core Runtime, multiple versions can co-exist in the same system without issues
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
apt update
apt install -y software-properties-common
add-apt-repository -y ppa:dotnet/backports
apt update
apt install -y aspnetcore-runtime-10.0
```

:::warning
Ubuntu 20.04 and earlier versions are not supported by .NET 10. Upgrade the operating system before updating Rest PKI Core.
:::

:::caution
If the previous ASP.NET Core Runtime was installed from the Microsoft package repository (`packages.microsoft.com`), as was the case on Ubuntu 20.04 and earlier, remove those packages before installing the runtime from the Ubuntu feed. Mixing .NET packages from both repositories causes errors when the application starts. For more information, see [.NET package mix ups on Linux](https://learn.microsoft.com/dotnet/core/install/linux-package-mixup).
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

## 3. Update Rest PKI Core

Proceed with the standard update instructions for your platform.

:::note
Version 5.0 updates the database model. On the default installation, in which the application has owner privileges over the database, the model is
updated automatically the first time version 5.0 starts. If your instance runs [without db_owner privileges](../unprivileged-db-user.md), run the
[update-db](../tool/update-db.md) command before starting the new version.
:::

### Docker

Update your containers to the `lacunasoftware/restpkicore:5.0` image, as described in the [Docker setup](../docker.md). No other change is required:
the image ships with the ASP.NET Core Runtime 10.0 and all of its dependencies.

The Linux images of version 5.x are based on **Ubuntu 24.04 (noble)** instead of Debian 12 (bookworm). This has no effect if you simply run the image.
If you extend the image or execute commands inside the container (for instance, to install additional packages), take into account the Ubuntu
package set and system paths.

### Azure App Services

Follow the [Azure App Services update instructions](../azure/update.md) with the `5.0.0` image. The note above about the Docker image applies here as well.

### Linux

Follow the [Linux update instructions](../linux/update.md) with the `restpkicore-5.0.0.tar.gz` package.

## 4. Check the installed version

After the update, [check the version](../check-version.md) of your instance. The `productVersion` field should start with `5.0`.

## OpenTelemetry

If your instance exports telemetry to an OpenTelemetry collector, note that the default value of the `service.name` resource attribute changed from
`restpkicore` to `Lacuna Rest PKI Core`. If your dashboards or queries filter on the previous value, set the `OTEL_SERVICE_NAME` environment variable
explicitly:

```sh
OTEL_SERVICE_NAME=restpkicore
```
