# Installing Amplia Reg on Ubuntu Server

To install an [on-premises](../index.md) instance of [Amplia Reg](../../index.md) on Ubuntu Server, follow the steps below. For other platforms, [click here](../index.md).

## Prerequisites

* Ubuntu Server (any version currently in support by vendor, latest LTS version recommended)

* **[Amplia](../../../amplia/index.md)** instance with:
  * A CA to issue end-user certificates (either a [root CA](../../../amplia/operation/create-root-ca.md) or an [intermediate CA](../../../amplia/operation/create-intermediate-ca.md))
  * A [CA to issue device certificates](../../../amplia/operation/create-device-ca.md)
* **[PKI SDK](../../../pki-sdk/index.md)** license (in Base64 format)
* **[Web PKI](../../../web-pki/index.md)** license (Base64/binary format)
* **DNS entry** previously created for the app
* **Connection string** to a [previously created SQL Server or PostgreSQL database](../prepare-database.md)

<a name="install-aspnet-core" />

## Install the ASP.NET Core Runtime 8.0

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::


Follow the instructions below depending on your Ubuntu version to:

1. Register the Microsoft key and add the product repository (this only needs to be done on versions prior to 22.04 and once per machine)
1. Install the package `aspnetcore-runtime-8.0`

### Ubuntu 22.04 or later

```bash
apt-get update
apt-get install aspnetcore-runtime-8.0
```

### Ubuntu 20.04 (LTS)

```bash
curl -O https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

```bash
apt-get update
apt-get install aspnetcore-runtime-8.0
```

### Test the installation

To test the installation, run:

```sh
dotnet --list-runtimes
```

The expected output is similar to:

```
Microsoft.AspNetCore.App 8.0.* [*/dotnet/shared/Microsoft.AspNetCore.App]
Microsoft.NETCore.App 8.0.* [*/dotnet/shared/Microsoft.NETCore.App]
```

:::tip
For other operating system versions and alternative ways to install the ASP.NET Core Runtime, see [this page](https://docs.microsoft.com/en-us/dotnet/core/install/linux)
:::


Install additional dependencies:

```sh
apt-get install libc6-dev libgdiplus
```

## Install Amplia Reg

Create a local user to run the Amplia Reg server:

```sh
mkdir /var/ampliareg
useradd --system --home-dir /var/ampliareg ampliareg
chown ampliareg:ampliareg /var/ampliareg
```

Create the site folder, download and extract the binaries:

:::note
To test the [next version](../../changelog.md#vnext) of Amplia Reg, currently in Release Candidate stage, replace `ampliareg-x.y.z.tar.gz` on the following commands
with `ampliareg-3.1.0-rc02.tar.gz`. **Beware**: Release Candidate versions are not production-ready and thus should only be installed on staging or test environments!
:::


```sh
mkdir /usr/share/ampliareg
curl -O https://cdn.lacunasoftware.com/ampliareg/ampliareg-3.0.0.tar.gz
tar xzf ampliareg-3.0.0.tar.gz -C /usr/share/ampliareg
chmod -R a=,u+rwX,go+rX /usr/share/ampliareg
```

:::note
Site binaries can be read by any user and can only be changed by root users. This means that the application user (*ampliareg*) can read but not change the files, which is intentional.
:::


Create the configuration file from the given template:

```sh
mkdir /etc/ampliareg
cp /usr/share/ampliareg/config-templates/linux/appsettings.conf /etc/ampliareg/
chown -R root:ampliareg /etc/ampliareg
chmod -R a=,u+rwX,g+rX /etc/ampliareg
```

:::note
Configuration files can only be read by members of the *ampliareg* group and can only be changed by the root user. This is important to protect sensitive data stored on the configuration files from unauthorized access.
:::


## Configure Amplia Reg

Edit the configuration file and follow the instructions on it to configure your Amplia Reg instance:

```sh
nano /etc/ampliareg/appsettings.conf
```

On the `[General]` section, to fill the `EncryptionKey` setting generate a 256-bit key to encrypt sensitive data stored on the database:

```sh
openssl rand -base64 32
```

Also on the `[General]` section, to fill the `RootPasswordHash` setting choose a strong password for root access to the dashboard and hash it:

```sh
dotnet /usr/share/ampliareg/Lacuna.AmpliaRegNg.Site.dll -- hash-root-pass
```

On the `[Amplia]` section, to fill the `ApiKey` setting you must create an application on your existing [Amplia](../../../amplia/index.md)
instance and generate an API key for it:

1. Sign in to your Amplia instance
1. Click on **Applications** on the left menu, then on *Add*
1. Fill out a name and select the subscription on which the certificates should be issued (you most likely have a single subscription, so select it)
1. Mark the **Worker** role
1. Click on *Create*
1. Click on **Keys**, then on *Add*
1. Fill out some description and, on the *Expiration* field, choose "Never expires"
1. Click on *Create*
1. Copy the **API key** generated (this value cannot be retrieved later)

To fill the `Amplia:DeviceCertificates` section, follow the steps in [Create a CA for device certificates](../../../amplia/operation/create-device-ca.md).

Fill the remaining settings according to the instructions on the configuration file.

## Set up a daemon

Create the service definition file:

```sh
touch /etc/systemd/system/ampliareg.service
nano /etc/systemd/system/ampliareg.service
```

Enter the following:

```
[Unit]
Description=Amplia Reg

[Service]
WorkingDirectory=/usr/share/ampliareg
ExecStart=/usr/bin/dotnet Lacuna.AmpliaRegNg.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=ampliareg
User=ampliareg
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5002
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Save the file, then enable the service and start it:

```sh
systemctl enable ampliareg
systemctl start ampliareg
systemctl status ampliareg
```

The expected output is similar to:

```
* ampliareg.service - Amplia Reg
   Loaded: loaded (/etc/systemd/system/ampliareg.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-07-07 05:50:04 UTC; 4min 22s ago
 Main PID: 10960 (dotnet)
    Tasks: 31 (limit: 2319)
   CGroup: /system.slice/ampliareg.service
           └─10960 /usr/bin/dotnet Lacuna.AmpliaRegNg.Site.dll

...

Dec 04 12:45:08 server.patorum.com ampliareg[32562]: Hosting environment: Production
Dec 04 12:45:08 server.patorum.com ampliareg[32562]: Content root path: /usr/share/ampliareg
Dec 04 12:45:08 server.patorum.com ampliareg[32562]: Now listening on: http://localhost:5002
Dec 04 12:45:08 server.patorum.com ampliareg[32562]: Application started. Press Ctrl+C to shut down.
Hint: Some lines were ellipsized, use -l to show in full.
```

If necessary, restart the service: `systemctl restart ampliareg`

To test that the Amplia Reg server is running, run:

```sh
curl http://localhost:5002/api/system/info
```

The expected output is something like:

```json
{"productName":"Lacuna Amplia Reg","productVersion":"...","spaVersion":"...","timestamp":"..."}
```

## Set up a reverse proxy server

:::note
If you prefer to use Apache instead of Nginx, [see this article](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-apache?view=aspnetcore-2.2#configure-apache).
:::


Install Nginx (if not already installed):

```sh
apt-get install nginx
```

Test that Nginx is running:

```sh
curl -I http://localhost/
```

Check the first lines of the output, which should be similar to:

```
HTTP/1.1 200 OK
Server: nginx/...
...
```

Disable the default Nginx site:

```sh
rm /etc/nginx/sites-enabled/default
```

Create a site configuration file for Amplia Reg:

```sh
touch /etc/nginx/sites-available/ampliareg
nano /etc/nginx/sites-available/ampliareg
```

Enter the following, replacing the domain on the `server_name` entry:

```nginx
server {
    listen        80;
    server_name   ampliareg.patorum.com;
    client_max_body_size 11000000;
    location / {
        proxy_pass         http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

:::tip
Ideally, your site configuration should contain the entries `ssl_certificate` and `ssl_certificate_key` with a valid SSL certificate. This configuration is outside of the scope of these instructions.
:::


Enable the site:

```sh
ln -sf /etc/nginx/sites-available/ampliareg /etc/nginx/sites-enabled/ampliareg
```

Test the Nginx configuration and reload it:

```sh
nginx -t
nginx -s reload
```

Test the site:

```
curl -H "Host: ampliareg.patorum.com" http://localhost/api/system/info
```

:::warning
For production environments, it is essential to configure [reCAPTCHA](../settings/configure-recaptcha.md) to protect the API from abuse
:::


## Post-installation steps

Follow the [post-installation procedure](../post-install.md) to complete the installation.

## See also

* [Configure OpenID Connect](../settings/configure-oidc.md)
* [Updating Amplia Reg on Linux](update.md)
* [Troubleshooting](troubleshoot/index.md)
