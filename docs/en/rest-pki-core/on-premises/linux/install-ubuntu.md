# Installing Rest PKI Core on Ubuntu Server

To install an [on-premises](../index.md) instance of [Rest PKI Core](../../index.md) on Ubuntu Server, follow the steps below. For other platforms, [click here](../index.md).

## Prerequisites

* Ubuntu Server (any version currently in support by vendor, latest LTS version recommended)

* **Connection string** to a [previously created SQL Server or PostgreSQL database](../prepare-database.md)
* **PKI SDK license** (in Base64 format)
* **Web PKI license** (Base64/binary format)

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


## Install Rest PKI Core

Create a local user to run the Rest PKI Core instance:

```sh
mkdir /var/restpkicore
useradd --system --home-dir /var/restpkicore restpkicore
chown restpkicore:restpkicore /var/restpkicore
```

Create the site folder, download and extract the binaries:

{/* :::note To test the [next version](../../../changelog.md#vnext) of Rest PKI Core, currently in Release Candidate stage, replace `restpkicore-x.y.z.tar.gz` on the following commands with `restpkicore-3.3.0-rc12.tar.gz`. **Beware**: Release Candidate versions are not production-ready and thus should only be installed on staging or test environments! ::: */}

```sh
mkdir /usr/share/restpkicore
curl -O https://cdn.lacunasoftware.com/restpkicore/restpkicore-4.1.0.tar.gz
tar xzf restpkicore-4.1.0.tar.gz -C /usr/share/restpkicore
chmod -R a=,u+rwX,go+rX /usr/share/restpkicore
```

:::note
Site binaries can be read by any user and can only be changed by root users. This means that the application user (*restpkicore*) can read but not change the files, which is intentional.
:::


Create the configuration file from the given template:

```sh
mkdir /etc/restpkicore
cp /usr/share/restpkicore/config-templates/linux/appsettings.conf /etc/restpkicore/
chown -R root:restpkicore /etc/restpkicore
chmod -R a=,u+rwX,g+rX /etc/restpkicore
```

:::note
Configuration files can only be read by members of the *restpkicore* group and can only be changed by the root user. This is important to protect sensitive data stored on the configuration files from unauthorized access.
:::


## Configure Rest PKI Core

Edit the configuration file to configure your Rest PKI Core instance:

```sh
nano /etc/restpkicore/appsettings.conf
```

<a name="encryption-key-generation" />

On the `[General]` section, to fill the `EncryptionKey` setting generate a 256-bit key to encrypt sensitive data stored on the database:

```sh
openssl rand -base64 32
```

Also on the `[General]` section, to fill the `RootPasswordHash` setting choose a strong password for root access to the dashboard and hash it:

```sh
dotnet /usr/share/restpkicore/Lacuna.RestPki.Site.dll -- hash-root-pass
```

:::note
If you wish to enable user management, leave the `RootPasswordHash` setting blank and follow the steps on [Configure OpenID Connect](../configure-oidc.md) instead
:::


Fill the remaining settings according to the instructions on the configuration file.

## Set up a daemon

Create the service definition file:

```sh
touch /etc/systemd/system/restpkicore.service
nano /etc/systemd/system/restpkicore.service
```

Enter the following:

```
[Unit]
Description=Rest PKI Core

[Service]
WorkingDirectory=/usr/share/restpkicore
ExecStart=/usr/bin/dotnet Lacuna.RestPki.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=restpkicore
User=restpkicore
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5004
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Save the file, then enable the service and start it:

```sh
systemctl enable restpkicore
systemctl start restpkicore
systemctl status restpkicore
```

The expected output is similar to:

```
* restpkicore.service - Rest PKI Core
   Loaded: loaded (/etc/systemd/system/restpkicore.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-07-07 05:50:04 UTC; 4min 22s ago
 Main PID: 10960 (dotnet)
    Tasks: 31 (limit: 2319)
   CGroup: /system.slice/restpkicore.service
           └─10960 /usr/bin/dotnet Lacuna.RestPki.Site.dll

...

Dec 04 12:45:08 server.patorum.com restpkicore[32562]: Hosting environment: Production
Dec 04 12:45:08 server.patorum.com restpkicore[32562]: Content root path: /usr/share/restpkicore
Dec 04 12:45:08 server.patorum.com restpkicore[32562]: Now listening on: http://localhost:5004
Dec 04 12:45:08 server.patorum.com restpkicore[32562]: Application started. Press Ctrl+C to shut down.
Hint: Some lines were ellipsized, use -l to show in full.
```

If necessary, restart the service: `systemctl restart restpkicore`

To test that the Rest PKI Core instance is running, run:

```sh
curl http://localhost:5004/api/system/info
```

The expected output is something like:

```json
{"productName":"Lacuna Rest PKI Core","productVersion":"1.x.x","spaVersion":"...","timestamp":"..."}
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

Create a site configuration file for Rest PKI Core:

```sh
touch /etc/nginx/sites-available/restpkicore
nano /etc/nginx/sites-available/restpkicore
```

Enter the following, replacing the dashboard domain on the `server_name` entry with your own domain:

```nginx
server {
    listen        80;
    server_name   localhost restpkicore.yourcompany.com;
    location / {
        proxy_pass         http://localhost:5004;
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
ln -sf /etc/nginx/sites-available/restpkicore /etc/nginx/sites-enabled/restpkicore
```

Test the Nginx configuration and reload it:

```sh
nginx -t
nginx -s reload
```

Test the site:

```
curl http://localhost/api/system/info
```

## See also

* [Configure OpenID Connect](../configure-oidc.md)
* [Updating Rest PKI Core on Linux](update.md)
* [Troubleshooting](troubleshoot/index.md)
