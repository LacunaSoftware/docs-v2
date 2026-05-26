# Installing Amplia on Oracle Linux

To install an [on-premises](../index.md) instance of [Amplia](../../index.md) on Oracle Linux, follow the steps below. For other platforms, [click here](../index.md).

:::tip
Before you start, make sure you have completed the steps outlined on [Planning before installation](../index.md#planning)
:::


## Prerequisites

* Oracle Linux 7.x

* **PKI SDK license** (in Base64 format)
* **Web PKI license** (Base64/binary format) -- only needed if users will issue certificates on their computers (web issuing procedure)
* **DNS entries** previously created for:
  * Dashboard access (see [Dashboard domain](../index.md#dashboard-domain))
  * CRL publishing (see [Access domains](../index.md#access-domains))
* **Connection string** to a [previously created SQL Server or PostgreSQL database](../prepare-database.md)

<a name="install-aspnet-core" />

## Install the ASP.NET Core Runtime 3.1

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::


Register the Microsoft key and package repository (this only needs to be done once per machine), then install the ASP.NET Core runtime package:

{/* https://docs.microsoft.com/en-us/dotnet/core/install/linux-package-manager-centos7 */}
{/* Using installation from RHEL instead of CentOS because MS package repository for centos lacks mssql-tools */}

{/* THIS WAS COPIED FROM 2.2 AND ONLY CHANGED TO 3.1, THERE ARE NO ORACLE-SPECIFIC INSTRUCTIONS ON MS DOCS! UNTESTED! */}

```sh
rpm -Uvh https://packages.microsoft.com/config/rhel/7/packages-microsoft-prod.rpm
yum install aspnetcore-runtime-3.1
```

To test the installation, run:

```sh
dotnet --list-runtimes
```

The expected output is similar to:

```
Microsoft.AspNetCore.App 3.1.x [/usr/share/dotnet/shared/Microsoft.AspNetCore.App]
Microsoft.NETCore.App 3.1.x [/usr/share/dotnet/shared/Microsoft.NETCore.App]
```

:::tip
For alternative ways to install the ASP.NET Core Runtime, see [this page](https://docs.microsoft.com/en-us/dotnet/core/install/linux)
:::


## Install Amplia

:::note
Some steps use the `nano` command, which might not be installed on your system. Feel free to replace the command by `vi` or install nano with `yum install nano`
:::


Create a local user to run the Amplia server:

```sh
mkdir /var/amplia
useradd --system --home-dir /var/amplia amplia
chown amplia:amplia /var/amplia
```

Create the site folder, download and extract the binaries:

:::note
To test the [next version](../../changelog.md#vnext) of Amplia, currently in Release Candidate stage, replace `amplia-x.y.z.tar.gz` on the following commands
with `amplia-4.22.0-rc01.tar.gz`. **Beware**: Release Candidate versions are not production-ready and thus should only be installed on staging or test environments!
:::


```sh
mkdir /usr/share/amplia
curl -O https://cdn.lacunasoftware.com/amplia/amplia-4.20.0.tar.gz
tar xzf amplia-4.20.0.tar.gz -C /usr/share/amplia
chmod -R a=,u+rwX,go+rX /usr/share/amplia
```

:::note
Site binaries can be read by any user and can only be changed by root users. This means that the application user (*amplia*) can read but not change the files, which is intentional.
:::


Create the configuration file from the given template:

```sh
mkdir /etc/amplia
cp /usr/share/amplia/config-templates/linux/appsettings.conf /etc/amplia/
chown -R root:amplia /etc/amplia
chmod -R a=,u+rwX,g+rX /etc/amplia
```

:::note
Configuration files can only be read by members of the *amplia* group and can only be changed by the root user. This is important to protect sensitive data stored on the configuration files from unauthorized access.
:::


## Configure Amplia

Edit the configuration file to configure your Amplia instance:

```sh
nano /etc/amplia/appsettings.conf
```

<a name="encryption-key-generation" />

On the `[General]` section, to fill the `EncryptionKey` setting generate a 256-bit key to encrypt sensitive data stored on the database:

```sh
openssl rand -base64 32
```

Also on the `[General]` section, to fill the `RootPasswordHash` setting choose a strong password for root access to the dashboard and hash it:

```sh
dotnet /usr/share/amplia/Lacuna.Amplia.Site.dll -- hash-root-pass
```

:::note
If you wish to enable user management, leave the `RootPasswordHash` setting blank and follow the steps on [Configure OpenID Connect](../configure-oidc.md) instead
:::


Fill the remaining settings according to the instructions on the configuration file.

## Set up a daemon

Create the service definition file:

```sh
touch /etc/systemd/system/amplia.service
nano /etc/systemd/system/amplia.service
```

Enter the following:

```
[Unit]
Description=Amplia

[Service]
WorkingDirectory=/usr/share/amplia
ExecStart=/usr/bin/dotnet Lacuna.Amplia.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=amplia
User=amplia
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Save the file, then enable the service and start it:

```sh
systemctl enable amplia
systemctl start amplia
systemctl status amplia
```

The expected output is similar to:

```
* amplia.service - Amplia
   Loaded: loaded (/etc/systemd/system/amplia.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-07-07 05:50:04 UTC; 4min 22s ago
 Main PID: 10960 (dotnet)
    Tasks: 31 (limit: 2319)
   CGroup: /system.slice/amplia.service
           └─10960 /usr/bin/dotnet Lacuna.Amplia.Site.dll

...

Dec 04 12:45:08 server.patorum.com amplia[32562]: Hosting environment: Production
Dec 04 12:45:08 server.patorum.com amplia[32562]: Content root path: /usr/share/amplia
Dec 04 12:45:08 server.patorum.com amplia[32562]: Now listening on: http://localhost:5000
Dec 04 12:45:08 server.patorum.com amplia[32562]: Application started. Press Ctrl+C to shut down.
Hint: Some lines were ellipsized, use -l to show in full.
```

If necessary, restart the service: `systemctl restart amplia`

To test that the Amplia server is running, run:

```sh
curl http://localhost:5000/api/system/info
```

The expected output is something like:

```json
{"productName":"Lacuna Amplia","productVersion":"4.x.x","spaVersion":"...","timestamp":"..."}
```

## Set up a reverse proxy server

:::note
If you prefer to use Apache instead of Nginx, [see this article](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-apache?view=aspnetcore-2.2#configure-apache).
:::


Install Nginx (if not already installed):

{/* https://www.itzgeek.com/how-tos/linux/centos-how-tos/install-nginx-on-centos-7-rhel-7.html */}
{/* https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/ (alternative) */}
{/* http://johanlouwers.blogspot.com/2016/01/install-nginx-on-oracle-linux.html (alternative) */}

```sh
rpm -Uvh http://nginx.org/packages/rhel/7/noarch/RPMS/nginx-release-rhel-7-0.el7.ngx.noarch.rpm
yum install nginx
systemctl enable nginx.service
systemctl start nginx.service
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
rm /etc/nginx/conf.d/default.conf
```

Create a site configuration file for Amplia:

```sh
touch /etc/nginx/conf.d/amplia.conf
nano /etc/nginx/conf.d/amplia.conf
```

Enter the following, replacing the dashboard domain on the `server_name` entry (see [Dashboard domain](../../index.md#dashboard-domain)):

```nginx
server {
    listen        80;
    server_name   localhost ca.patorum.com;
    location / {
        proxy_pass         http://localhost:5000;
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


Allow Nginx to access the Amplia service:

{/* https://wiki.centos.org/TipsAndTricks/SelinuxBooleans */}
```sh
setsebool -P httpd_can_network_connect on
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

Allow HTTP and HTTPS traffic to your system (if not already allowed):

{/* https://linuxconfig.org/how-to-open-http-port-80-on-redhat-7-linux-using-firewall-cmd */}
```sh
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --reload
```

## See also

* [Updating Amplia on Linux](update.md)
* [Troubleshooting](troubleshoot/index.md)
