---
sidebar_position: 2
sidebar_label: "Install"
slug: /rest-pki/core/on-premises/azure/install
---

# Installing Rest PKI Core on Azure App Services

To install an [on-premises](../index.md) instance of [Rest PKI Core](../../index.md) on an [Azure App Service](https://docs.microsoft.com/azure/app-service/overview),
follow the steps below. For other platforms, [click here](../index.md#platforms).

:::tip
To be able to use the free SSL certificates provided by *App Service Managed Certificates*, we suggest not choosing "naked domains",
that is, domains without a subdomain portion, for example ~~patorum.com~~. Prefer, for instance, `restpki.patorum.com`.
:::


## Preparation

The instructions below assume that you already have the [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed locally and that you
already have the following resources created on your Azure account:

* A *SQL Server* (creating the *SQL database* is covered by this article)
* An *App Service Plan* with the **Linux** operating system (creating the App Service is covered by this article)
* A DNS zone for the domain used to access Rest PKI Core

During the installation, some resources will be created:

* A *Container Registry*
* A database (*SQL database*)
* A *storage account*
* An App Service

We suggest creating a **resource group** to group the resources you create. However, this is merely an organizational measure. What
really matters is that **all resources are created in the same region**. This is essential for the system to work properly.

:::note
The steps below describe the most basic creation of each resource. Depending on your infrastructure you may want to take
additional security or resilience measures, such as restricting access to a private network.
:::


## Creating a *Container registry*

Follow the steps below to create a *container registry* to store a local copy of the system's Docker images:

1. Under **Container registries**, click **+ Create**
1. On the first tab (*Basics*)
   * Fill in the fields according to your infrastructure (following the region chosen for the system)
   * Take note of the chosen *registry name*
   * Under *SKU*, choose **Basic**
1. Click **Review + create**, then **Create**

Once the *container registry* has been created, replicate the system's Docker image to it (replace `MY_ACR_NAME` with the name chosen
in the previous step):

```sh
az login
```

:::note
If you have access to more than one Azure account, you may need to pass the `--tenant YOUR_TENANT` argument
:::


```sh
az acr login --name MY_ACR_NAME
az acr import --name MY_ACR_NAME --source docker.io/lacunasoftware/restpkicore:4.2.5 --image restpkicore:4.2.5
```

:::tip
Replace `4.2.5` with the currently recommended version (see the [Docker setup](../docker.md))
:::


## Creating the database

Follow the steps below to create a database for the system (you must have a *SQL Server* previously created):

1. Under **SQL databases**, click **+ Create**
1. On the first tab (*Basics*), fill in the fields according to your infrastructure (following the region chosen for the system)
1. Click the **Additional settings** tab
1. Under **Collation**, enter `Latin1_General_100_CI_AI`
1. Click **Review + create**
1. Click **Create**

:::warning
The database *collation* **MUST BE** `Latin1_General_100_CI_AI`. Creating the database with a different *collation* will likely cause the installation to fail!
:::


Once the database has been created, click **Go to resource**. Then obtain the *connection string*:

1. Click **Connection strings**
1. Take note of the connection string shown under the **ADO.NET (SQL authentication)** section

:::note
In the copied connection string, replace the `{your_password}` placeholder with the database password
:::


## Creating a *storage account*

We need a *storage account* to store files (the system stores files outside the database to keep it organized) and also the
system logs. Follow the steps below to create a *storage account* (if you want to use an existing account, skip this part):

1. Under **Storage accounts**, click **+ Create**
1. On the first tab (*Basics*), fill in the fields according to your infrastructure (following the region chosen for the system)
   * Under *Performance*, choose **Standard**
   * Under *Redundancy*, choose the option you prefer (we suggest **Zone-redundant storage (ZRS)** -- [click here](https://azure.microsoft.com/documentation/articles/storage-redundancy/)
     for details on the different replication options)
1. Click **Review**
1. Click **Create**

Once the *storage account* has been created, click **Go to resource**. Then obtain a *connection string*:

1. In the *storage account* settings, click **Access keys**
1. Under the **key1** section, take note of the value of the **Connection string** field

## Creating the App Service

Follow the steps below to create an *App Service* (you must have an *App Service Plan* previously created with the **Linux** operating system):

1. Under **App Services**, click **+ Create** then **+ Web App**
1. On the first tab (*Basics*), fill in the fields according to your infrastructure (following the region chosen for the system)
   * Under *Publish*, choose **Docker Container**
   * Under *Operating System*, choose **Linux**
   * Under *Region*, choose the region where your *app service plan* is located
   * Under *Linux Plan*, choose your *app service plan*
   * Click **Next : Docker >**
1. On the next tab (*Docker*), fill in:
   * Under *Options*, leave the **Single Container** option
   * Under *Image Source*, select **Azure Container Registry**
   * Under *Registry*, select the *container registry* created earlier
   * Under *Image* and *Tag*, select the system's image/tag according to the `az acr import` command run earlier
   * Leave the *Startup Command* option **blank**
   * Click **Review + create**
1. Click **Create**

Once the App Service has been created, click **Go to resource**. Then take note of its domain, for example `my-app-service.azurewebsites.net`.

Go to the App Service **Configuration** and add the following settings:

* `ASPNETCORE_ENVIRONMENT`: `Azure`
* `Bindings__HttpsMode`: `Strict`
* `STANDBY`: `True`

Save the settings.

Still in the App Service configuration, go to the **General settings** tab and, under the **HTTPS Only** option, select **Off** (the application itself will take care of requiring HTTPS access in the most appropriate way).

Then go to **Custom domains** and copy the **Custom Domain Verification ID** (this value will be needed later).

## Domain configuration

Create the DNS record for the domain used to access Rest PKI Core:

:::note
In the instructions below, we will use the creation of the record for the domain `app.patorum.com` as an example
:::


1. Under **DNS zones**, click the zone the domain belongs to (e.g.: `patorum.com`)
1. Click **+ Record set**
1. Under *Name*, type the leftmost portion of the domain (e.g.: `app`)
1. Under *Type*, select **CNAME**
1. Under *Alias record set*, select **No**
1. Under *Alias*, fill in the App Service domain (e.g.: `my-app-service.azurewebsites.net`)
1. Click **OK**
1. Click **+ Record set** again
1. Under *Name*, type `asuid.` followed by the leftmost portion of the domain (e.g.: `asuid.app`)
1. Under *Type*, select **TXT**
1. Under *Value*, paste the **Custom Domain Verification ID** previously copied from the App Service
1. Click **OK**

:::note
If you do not use Azure as the DNS server for your zones, perform the equivalent procedure on your DNS server
:::


After creating the record, add the domain to the *App Service*:

1. Back in the App Service settings, click **Custom domains**
1. Click **+ Add custom domain**
1. Select **All other domain services**
1. Leave the **App Service Managed Certificate** and **SNI SSL** options selected
1. Under *Domain*, fill in the domain (e.g.: `app.patorum.com`)
1. Click **Validate**
1. After validation, click **Add**

## Rest PKI Core configuration

On the App Service side menu, under the *Development Tools* section, click **SSH**, then **Go &rarr;**. You will be taken to a terminal. Navigate
to the `/app` folder:

```bash
cd /app
```

:::tip
Even though the terminal appears to start in the `/app` folder, the command above **is necessary** due to an Azure bug
:::


Run the command below to generate the cryptographic key used to encrypt sensitive values stored in the database:

```cmd
dotnet Lacuna.RestPki.Site.dll -- gen-enc-key
```

Take note of the generated value.

Choose a strong password to protect *root* access to the dashboard, and compute the hash of that password with the command below:

```cmd
dotnet Lacuna.RestPki.Site.dll -- hash-root-pass
```

Again, take note of the generated value.

Close the terminal, returning to the Azure portal. On the App Service, go to **Configuration** and add the following settings:

* `General__AppDiscriminator`: see the [App discriminator](#app-discriminator) section below
* `General__EncryptionKey`: the cryptographic key generated above
* `General__RootPasswordHash`: the *root* password hash computed above
* `General__SiteUrl`: the public URL of the site (e.g.: `https://restpki.patorum.com/`)
* `General__SiteName` (optional): the name of your Rest PKI Core instance (defaults to *Rest PKI Core*)
* `Oidc__Enabled`: `False` (disables the [OpenID Connect integration](../configure-oidc.md), for now)

:::note
If you want to enable user management through OpenID Connect, leave the `General__RootPasswordHash` setting blank and follow the steps on
[Configure OpenID Connect](../configure-oidc.md).
:::


Also add the settings described in the sections below.

### App discriminator {#app-discriminator}

The `General__AppDiscriminator` setting identifies the instance and is used to derive the system's data protection keys.

:::warning
This setting is **required** on Azure App Services. If it is not set explicitly, a value is derived automatically and may
**change when the container is recreated**, which prevents the decryption of sensitive data already stored, causing **data loss**. Choose a
stable value (for example `RestPkiCore`) and **never change it** after installation. For more details, see the *Set an explicit AppDiscriminator*
section of the article [Update from 2.x to 3.0](../major-updates/update-30.md#2-set-an-explicit-appdiscriminator).
:::


* `General__AppDiscriminator`: a stable value identifying the instance, e.g.: `RestPkiCore`

### PKI Suite

PKI Suite settings:

* `PkiSuite__SdkLicense`: your license for the PKI SDK, in Base64 format (**required**)
* `PkiSuite__WebLicense`: your license for the Web PKI component in binary (Base64) format. Only required if users will sign documents with certificates on their computers (in-browser signature via Web PKI)

### Blob Storage

*storage account* configuration (the storage type and container name already come preconfigured for the Azure environment):

* `BlobStorage__ConnectionString`: the *connection string* of the *storage account* created earlier
* `BlobStorage__ContainerName` (optional): the name of the *container* used to store files. If omitted, a container named *restpki* is used.

### Logging

Log configuration (the Azure Table log *sink* already comes preconfigured for the Azure environment):

* `Serilog__WriteTo__0__Args__connectionString`: the *connection string* of the *storage account* created earlier
* `Serilog__WriteTo__0__Args__storageTableName` (optional): the name of the table used to store the logs. If omitted, a table named *RestPkiCoreLog* is used.

### Connection string

In the *Connection strings* section (at the bottom of the settings page), click **+ New connection string** and fill in:

* **Name**: `DefaultConnection`
* **Value**: the connection string value obtained while creating the database
* **Type**: choose **SQLAzure**

:::tip
Rest PKI Core is also compatible with PostgreSQL. If you want to use an Azure Database for PostgreSQL database, please contact support for more
information. For details on the supported databases, see [Preparing a database](../prepare-database.md).
:::


Save the settings made so far by clicking **Save**.

:::note
Whenever the documentation mentions something like "in the **Sec** section, set the **Conf** setting to ...", on Azure App Services you must
compose the setting name from the section and setting names separated by `__` (**two** underscores), that is, in the example above: `Sec__Conf`
:::


## Starting the App Service

Finally, remove the `STANDBY` setting from the App Service and save the settings. Then access the public URL of the site (the first access may take a few moments).

Authenticate with the *root* password chosen during configuration. You will then have access to the dashboard.

To start using the system, create a [subscription](../create-sub.md) and add an administrative user to it.

## See also

* [Creating a subscription on Rest PKI Core](../create-sub.md)
* [Updating Rest PKI Core on Azure App Services](update.md)
