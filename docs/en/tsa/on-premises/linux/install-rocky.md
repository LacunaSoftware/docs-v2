# Installing Lacuna TSA on Rocky Linux

To install an [on-premises](../index.md) instance of [Lacuna TSA](../../index.md) on Rocky Linux, follow the steps below. For other platforms, [click here](../index.md).

## Prerequisites

* Rocky Linux 8.x or greater

* **[PKI SDK](../../../pki-sdk/index.md)** license (in Base64 format)
* TSA certificate (either in PKCS#12 format or hosted on an **[Amplia](../../../amplia/index.md)** instance)

<a name="install-aspnet-core" />

## Install the ASP.NET Core Runtime 6.0

:::info
These instructions assume you are logged in as **root**. If you are not, run `sudo su -` before continuing!
:::


Install the ASP.NET Core runtime package:

{/* No additional package feeds are required to install ASP.NET Core 6.0 on Rocky Linux 8 */}

```sh
yum install aspnetcore-runtime-6.0
```

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


{/* Install additional dependencies: ```sh apt-get install libc6-dev libgdiplus ``` */}

## Install Lacuna TSA

Create a local user to run the Lacuna TSA server:

```sh
mkdir /var/lacuna-tsa
useradd --system --home-dir /var/lacuna-tsa lacuna-tsa
chown lacuna-tsa:lacuna-tsa /var/lacuna-tsa
```

Create the site folder, download and extract the binaries:

{/* :::note To test the [next version](../../../changelog.md#vnext) of Lacuna TSA, currently in Release Candidate stage, replace `tsa-x.y.z.tar.gz` on the following commands with `tsa-1.2.0-rc03.tar.gz`. **Beware**: Release Candidate versions are not production-ready and thus should only be installed on staging or test environments! ::: */}

```sh
mkdir /usr/share/lacuna-tsa
curl -O https://cdn.lacunasoftware.com/tsa/tsa-1.2.1.tar.gz
tar xzf tsa-1.2.1.tar.gz -C /usr/share/lacuna-tsa
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-tsa
```

:::note
Site binaries can be read by any user and can only be changed by root users. This means that the application user (*lacuna-tsa*) can read but not change the files, which is intentional.
:::


Create the configuration file from the given template:

```sh
mkdir /etc/lacuna-tsa
cp /usr/share/lacuna-tsa/config-templates/linux/appsettings.conf /etc/lacuna-tsa/
chown -R root:lacuna-tsa /etc/lacuna-tsa
chmod -R a=,u+rwX,g+rX /etc/lacuna-tsa
```

:::note
Configuration files can only be read by members of the *lacuna-tsa* group and can only be changed by the root user. This is important to protect sensitive data stored on the configuration files from unauthorized access.
:::


## Configure Lacuna TSA

Edit the configuration file and follow the instructions on it to configure your Lacuna TSA instance:

```sh
nano /etc/lacuna-tsa/appsettings.conf
```

If your TSA key is hosted on an Amplia instance, you will need to fill the `[Amplia]` section. To fill the `ApiKey` setting you must create an application on your existing
Amplia instance and generate an API key for it:

1. Sign in to your Amplia instance
1. Click on **Applications** on the left menu, then on *Add*
1. Fill out a name and select the subscription on which the certificates should be issued (**not** on *Sys Admin*)
1. Mark the **Manager** role
1. Click on *Create*
1. Click on **Keys**, then on *Add*
1. Fill out some description and, on the *Expiration* field, choose "Never expires"
1. Click on *Create*
1. Copy the **API key** generated (this value cannot be retrieved later) 

Fill the remaining settings according to the instructions on the configuration file.

## Set up a daemon

Create the service definition file:

```sh
touch /etc/systemd/system/lacuna-tsa.service
nano /etc/systemd/system/lacuna-tsa.service
```

Enter the following:

```
[Unit]
Description=Lacuna TSA

[Service]
WorkingDirectory=/usr/share/lacuna-tsa
ExecStart=/usr/bin/dotnet Lacuna.Tsa.Server.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=lacuna-tsa
User=lacuna-tsa
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5005
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Save the file, then enable the service and start it:

```sh
systemctl enable lacuna-tsa
systemctl start lacuna-tsa
systemctl status lacuna-tsa
```

The expected output is similar to:

```
● lacuna-tsa.service - Lacuna TSA
     Loaded: loaded (/etc/systemd/system/lacuna-tsa.service; enabled; vendor preset: enabled)
     Active: active (running) since Fri 2023-12-01 17:58:50 -03; 2 days ago
   Main PID: 33858 (dotnet)
      Tasks: 29 (limit: 4627)
     Memory: 58.5M
        CPU: 10.842s
     CGroup: /system.slice/tsa.service
             └─33858 /usr/bin/dotnet Lacuna.Tsa.Server.dll

dez 04 15:01:29 server.patorum.com systemd[1]: Started Lacuna TSA.
dez 04 15:01:29 server.patorum.com lacuna-tsa[193611]: info: Lacuna.Tsa.Server.ApplicationStarter[0]
dez 04 15:01:29 server.patorum.com lacuna-tsa[193611]:       Application starting (version: 1.2.0 RTM)
dez 04 15:01:31 server.patorum.com lacuna-tsa[193611]: info: Lacuna.Tsa.Server.ApplicationStarter[0]
dez 04 15:01:31 server.patorum.com lacuna-tsa[193611]:       Application started
Hint: Some lines were ellipsized, use -l to show in full.
```

If necessary, restart the service: `systemctl restart lacuna-tsa`

To test that the Lacuna TSA server is running, run:

```sh
curl http://localhost:5005/api/system/info
```

The expected output is something like:

```json
{"productName":"Lacuna TSA","productVersion":"...","timestamp":"..."}
```

## Set up a reverse proxy server

:::note
If you prefer to use Apache instead of Nginx, [see this article](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-apache?view=aspnetcore-2.2#configure-apache).
:::


Install Nginx (if not already installed):

{/* No additional package feeds are required to install nginx on Rocky Linux 8 */}

```sh
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

Edit the Nginx configuration:

```sh
nano /etc/nginx/nginx.conf
```

Delete or comment out (with `#`s) the entire `server` section, located right below the clause `include /etc/nginx/conf.d/*.conf;`. After
commenting out the section, the configuration file should look similar to this:

```
...

http {
    ...

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    include /etc/nginx/conf.d/*.conf;

#    server {
#        listen       80 default_server;
#        listen       [::]:80 default_server;
#        server_name  _;
#        root         /usr/share/nginx/html;
#
#        # Load configuration files for the default server block.
#        include /etc/nginx/default.d/*.conf;
#
#        location / {
#        }
#
#        error_page 404 /404.html;
#            location = /40x.html {
#        }
#
#        error_page 500 502 503 504 /50x.html;
#            location = /50x.html {
#        }
#    }

    ...
}
```

Create a site configuration file for Lacuna TSA:

```sh
nano /etc/nginx/conf.d/lacuna-tsa.conf
```

Enter the following, replacing the domain on the `server_name` entry:

```nginx
server {
    listen        80;
    server_name   tsa.patorum.com;
    location / {
        proxy_pass         http://localhost:5005;
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


Test the Nginx configuration and reload it:

```sh
nginx -t
nginx -s reload
```

Test the site:

```
curl -H "Host: tsa.patorum.com" http://localhost/api/system/info
```

{/* nothing here */}

## See also

* [Updating Lacuna TSA on Linux](update.md)
* [Troubleshooting (Linux)](troubleshoot/index.md)
