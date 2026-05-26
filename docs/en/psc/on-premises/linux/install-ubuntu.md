# Installing Lacuna PSC on Ubuntu Server

To install an [on-premises](../index.md) instance of [Lacuna PSC](../../index.md) on Ubuntu Server, follow the steps below. For other platforms, [click here](../index.md).

## Prerequisites

* Ubuntu Server (any version currently in support by vendor, latest LTS version recommended)

* **[Amplia](../../../amplia/index.md)** instance configured for [cloud certificate management](../../../amplia/on-premises/configure-cert-management.md)
* **[GrantID](../../../grant-id/index.md)** instance
* **[PKI SDK](../../../pki-sdk/index.md)** license (in Base64 format)
{/* **[Web PKI](../../../web-pki/index.md)** license (Base64/binary format) */}
* **DNS entry** previously created for the app
* **Connection string** to a [previously created SQL Server or PostgreSQL database](../prepare-database.md)

<a name="install-aspnet-core" />

## Install the ASP.NET Core Runtime 6.0

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::


Follow the instructions below depending on your Ubuntu version to:

1. Register the Microsoft key and add the product repository (this only needs to be done on versions prior to 22 and once per machine)
1. Install the package `aspnetcore-runtime-6.0`

### Ubuntu 22.04 (LTS)

```bash
apt-get update
apt-get install aspnetcore-runtime-6.0
```

### Ubuntu 20.04 (LTS)

```bash
curl -O https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

```bash
apt-get update
apt-get install aspnetcore-runtime-6.0
```

### Ubuntu 18.04 (LTS)

```bash
curl -O https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

```bash
apt-get update
apt-get install aspnetcore-runtime-6.0
```

### Ubuntu 16.04 (LTS)

```bash
curl -O https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

```bash
apt-get update
apt-get install aspnetcore-runtime-6.0
```

### Test the installation

To test the installation, run:

```sh
dotnet --list-runtimes
```

The expected output is similar to:

```
Microsoft.AspNetCore.App 6.0.* [*/dotnet/shared/Microsoft.AspNetCore.App]
Microsoft.NETCore.App 6.0.* [*/dotnet/shared/Microsoft.NETCore.App]
```

:::tip
For other operating system versions and alternative ways to install the ASP.NET Core Runtime, see [this page](https://docs.microsoft.com/en-us/dotnet/core/install/linux)
:::


Install additional dependencies:

```sh
apt-get install libc6-dev libgdiplus
```

## Install Lacuna PSC

Create a local user to run the Lacuna PSC server:

```sh
mkdir /var/lacuna-psc
useradd --system --home-dir /var/lacuna-psc lacuna-psc
chown lacuna-psc:lacuna-psc /var/lacuna-psc
```

Create the site folder, download and extract the binaries:

:::note
To test the [next version](../../changelog.md#vnext) of Lacuna PSC, currently in Release Candidate stage, replace `psc-x.y.z.tar.gz` on the following commands
with `psc-1.7.0-rc01.tar.gz`. **Beware**: Release Candidate versions are not production-ready and thus should only be installed on staging or test environments!
:::


```sh
mkdir /usr/share/lacuna-psc
curl -O https://cdn.lacunasoftware.com/psc/psc-1.4.2.tar.gz
tar xzf psc-1.4.2.tar.gz -C /usr/share/lacuna-psc
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-psc
```

:::note
Site binaries can be read by any user and can only be changed by root users. This means that the application user (*lacuna-psc*) can read but not change the files, which is intentional.
:::


Create the configuration file from the given template:

```sh
mkdir /etc/lacuna-psc
cp /usr/share/lacuna-psc/config-templates/linux/appsettings.conf /etc/lacuna-psc/
chown -R root:lacuna-psc /etc/lacuna-psc
chmod -R a=,u+rwX,g+rX /etc/lacuna-psc
```

:::note
Configuration files can only be read by members of the *lacuna-psc* group and can only be changed by the root user. This is important to protect sensitive data stored on the configuration files from unauthorized access.
:::


## Generate a certificate to sign OAuth tokens

Generate a self-signed certificate to sign OAuth tokens issued by the application:

```sh
dotnet /usr/share/lacuna-psc/Lacuna.Psc.Site.dll -- gen-cert "Patorum PSC" "" /etc/lacuna-psc/issuer.pfx
chown -R root:lacuna-psc /etc/lacuna-psc && chmod -R a=,u+rwX,g+rX /etc/lacuna-psc
```

## Configure the trusted roots

Edit the certificate trust configuration file:

```sh
mkdir /var/lacuna-psc/trustarbitrators
touch /var/lacuna-psc/trustarbitrators/psc-trust.json
chown -R lacuna-psc:lacuna-psc /var/lacuna-psc
nano /var/lacuna-psc/trustarbitrators/psc-trust.json
```

Add the trusted root certificates as follows:

```json
{
  "Version": "2019-05-09",
  "StandardPkis": [
    "Brazil",
    "Italy",
    "Peru"
  ],
  "TrustedRoots": [
    "MIIFzDC...",
    "MIIFzDC..."
  ]
}
```

* The field `Version` must be kept as is above
* The collection `StandardPkis` may contain `Brazil`, `Italy` or `Peru` denoting that the root certificates for each of these countries are to be trusted
* The collection `TrustedRoots` may contain additional trusted CA root certificates encoded in Base64

:::warning
This file does not support comments
:::


## Configure Lacuna PSC

Edit the configuration file and follow the instructions on it to configure your Lacuna PSC instance:

```sh
nano /etc/lacuna-psc/appsettings.conf
```

On the `[General]` section, to fill the `EncryptionKey` setting generate a 256-bit key to encrypt sensitive data stored on the database:

```sh
openssl rand -base64 32
```

On the `[Amplia]` section, to fill the `ApiKey` setting you must create an application on your existing [Amplia](../../../../amplia/index.md)
instance and generate an API key for it:

1. Sign in to your Amplia instance
1. Click on **Applications** on the left menu, then on *Add*
1. Fill out a name and select the subscription on which the certificates should be issued (**not** on *Sys Admin*)
1. Mark the **Worker** role
1. Click on *Create*
1. Click on **Keys**, then on *Add*
1. Fill out some description and, on the *Expiration* field, choose "Never expires"
1. Click on *Create*
1. Copy the **API key** generated (this value cannot be retrieved later)

Follow the steps in [Configure OpenID Connect](../configure-oidc.md) to fill out the `[Oidc]` section.

Fill the remaining settings according to the instructions on the configuration file.

## Set up a daemon

Create the service definition file:

```sh
touch /etc/systemd/system/lacuna-psc.service
nano /etc/systemd/system/lacuna-psc.service
```

Enter the following:

```
[Unit]
Description=Lacuna PSC

[Service]
WorkingDirectory=/usr/share/lacuna-psc
ExecStart=/usr/bin/dotnet Lacuna.Psc.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=lacuna-psc
User=lacuna-psc
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5003
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Save the file, then enable the service and start it:

```sh
systemctl enable lacuna-psc
systemctl start lacuna-psc
systemctl status lacuna-psc
```

The expected output is similar to:

```
* lacuna-psc.service - Lacuna PSC
   Loaded: loaded (/etc/systemd/system/lacuna-psc.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-07-07 05:50:04 UTC; 4min 22s ago
 Main PID: 10960 (dotnet)
    Tasks: 31 (limit: 2319)
   CGroup: /system.slice/lacuna-psc.service
           └─10960 /usr/bin/dotnet Lacuna.Psc.Site.dll

...

Dec 04 12:45:08 server.patorum.com lacuna-psc[32562]: Hosting environment: Production
Dec 04 12:45:08 server.patorum.com lacuna-psc[32562]: Content root path: /usr/share/lacuna-psc
Dec 04 12:45:08 server.patorum.com lacuna-psc[32562]: Now listening on: http://localhost:5003
Dec 04 12:45:08 server.patorum.com lacuna-psc[32562]: Application started. Press Ctrl+C to shut down.
Hint: Some lines were ellipsized, use -l to show in full.
```

If necessary, restart the service: `systemctl restart lacuna-psc`

To test that the Lacuna PSC server is running, run:

```sh
curl http://localhost:5003/api/system/info
```

The expected output is something like:

```json
{"productName":"Lacuna PSC","productVersion":"...","spaVersion":"...","timestamp":"..."}
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

Create a site configuration file for Lacuna PSC:

```sh
touch /etc/nginx/sites-available/lacuna-psc
nano /etc/nginx/sites-available/lacuna-psc
```

Enter the following, replacing the domain on the `server_name` entry:

```nginx
server {
    listen        80;
    server_name   psc.patorum.com;
    location / {
        proxy_pass         http://localhost:5003;
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
ln -sf /etc/nginx/sites-available/lacuna-psc /etc/nginx/sites-enabled/lacuna-psc
```

Test the Nginx configuration and reload it:

```sh
nginx -t
nginx -s reload
```

Test the site:

```
curl -H "Host: psc.patorum.com" http://localhost/api/system/info
```

:::warning
For production environments, it is essential to configure [Firebase App Check](../configure-firebase.md) and [reCAPTCHA](../configure-recaptcha.md) to protect
the API from abuse
:::


## See also

* [Configure OpenID Connect](../configure-oidc.md)
* [Updating Lacuna PSC on Linux](update.md)
* [Troubleshooting](troubleshoot/index.md)
