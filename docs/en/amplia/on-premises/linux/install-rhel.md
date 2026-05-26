# Installing Amplia on Red Hat Enterprise Linux

To install an [on-premises](../index.md) instance of [Amplia](../../index.md) on Red Hat Enterprise Linux, follow the steps below. For other platforms, [click here](../index.md).

:::tip
Before you start, make sure you have completed the steps outlined on [Planning before installation](../index.md#planning)
:::


## Prerequisites

:::note
These instructions are for RHEL 7. If you use RHEL 8, please contact us.
:::


:::warning
Before starting, make sure your system is [registered and subscribed to the Red Hat Customer Portal](https://access.redhat.com/solutions/253273)
:::


* Red Hat Enterprise Linux 7.x

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


Enable the official .NET package repository (this only needs to be done once per machine), then install the ASP.NET Core runtime package:

{/* https://docs.microsoft.com/en-us/dotnet/core/install/linux-package-manager-rhel7 */}

{/* On 2.2, for some reason, we did not use the *rhel-7-server-dotnet-rpms* packages. Will this work with our instructions? */}

```sh
subscription-manager repos --enable=rhel-7-server-dotnet-rpms
yum install rh-dotnet31-aspnetcore-runtime-3.1 -y
ln -s /opt/rh/rh-dotnet31/root/usr/bin/dotnet /usr/bin/dotnet
```

{/* doing `ln -s /opt/rh/rh-dotnet31/root/usr/bin/dotnet /usr/bin/dotnet` instead of `scl enable rh-dotnet31 bash` to keep daemon definition common */}

:::note
If the command above fails, make sure your system is [registered and attached to a Red Hat subscription](https://access.redhat.com/solutions/253273)
:::


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

{/* https://access.redhat.com/solutions/1211673 */}

```sh
subscription-manager repos --enable=rhel-server-rhscl-7-rpms
yum install rh-nginx116
systemctl enable rh-nginx116-nginx
systemctl start rh-nginx116-nginx
scl enable rh-nginx116 bash
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
nano /etc/opt/rh/rh-nginx116/nginx/nginx.conf
```

Delete or comment-out (with `#`s) the entire `server` section, shown below:

```
    server {
        listen       80 default_server;
        listen       [::]:80 default_server;
        server_name  _;
        root         /opt/rh/rh-nginx116/root/usr/share/nginx/html;

        # Load configuration files for the default server block.
        include      /etc/opt/rh/rh-nginx116/nginx/default.d/*.conf;

        location / {
        }

        error_page 404 /404.html;
        location = /40x.html {
        }

        error_page 500 502 503 504  /50x.html;
        location = /50x.html {
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
    }
```

Create a site configuration file for Amplia:

```sh
touch /etc/opt/rh/rh-nginx116/nginx/conf.d/amplia.conf
nano /etc/opt/rh/rh-nginx116/nginx/conf.d/amplia.conf
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
