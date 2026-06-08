# Installing Signer on Ubuntu Server

To install an instance [*on premises*](../../index.md) from [Signer](../../../index.md) on Ubuntu Server, follow the steps below. For other plataforms, [click here](../../index.md).

{/* {/* include: ../includes/see-planning.md */} */}

## Prerequisites

* Ubuntu Server (any version currently in support by vendor, latest LTS version recommended)

* **[PKI SDK](../../../../pki-sdk/index.md) license** (in Base64 format)
* **[Web PKI](../../../../web-pki/index.md) license** (Base64/binary format)
* **DNS entry** previously created for the app
* **Connection string** to a [previously created SQL Server database](../prepare-database.md)
* (recommended) Valid SSL certificate for the site

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


## Install additional required packages

Install additional dependencies:

```sh
apt-get install libc6-dev libgdiplus
```

## Install Signer

Create a local user to run the Signer application server:

```sh
mkdir /var/lacuna-signer
useradd --system --home-dir /var/lacuna-signer lacuna-signer
chown lacuna-signer:lacuna-signer /var/lacuna-signer
```

Create the site folder, download and extract the binaries:

```sh
mkdir /usr/share/lacuna-signer
curl -O https://cdn.lacunasoftware.com/signer/signer-2.14.2.tar.gz
tar xzf signer-2.14.2.tar.gz -C /usr/share/lacuna-signer
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-signer
```

:::note
The site files can be read by any user but can only be changed by users with high permissions. This means that the application user (*signer*)
you can read the files but you cannot change them (this is intentional).
:::


Create the Signer configuration file from the template provided:

```sh
mkdir /etc/lacuna-signer
cp /usr/share/lacuna-signer/config-templates/appsettings.linux.json /etc/lacuna-signer/
chown -R root:lacuna-signer /etc/lacuna-signer
chmod -R a=,u+rwX,g+rX /etc/lacuna-signer
```

:::note
Configuration files can only be read by members of the * signer * group and can only be changed by users with elevated permissions. This is important to protect information
confidential information stored in the configuration file of other users of the machine.
:::


## Configure Signer

Edit the configuration file to configure your Signer instance:

```sh
nano /etc/lacuna-signer/appsettings.linux.json
```

### Database connection string

Under section **ConnectionStrings**:

* **DefaultConnection**: set the connection string to the database. A typical connection string looks like this:

```
Data Source=SERVER;Initial Catalog=DATABASE;User ID=USERNAME;Password=PASSWORD
```

:::note
If you created the database using advanced features such as log shipping or mirroring, your connection string may be different
:::


<a name="encryption-key-generation" />

### General settings

Generate a 256-bit key to encrypt secrets stored in the database:

```sh
openssl rand -base64 32
```

Then, under section **General**:

* **SiteName**: the name of this instance. It will be used in generated documents and emails
* **SiteUrl**: publicly accessible URL of the website (e.g.: `https://signer.patorum.com/`). This address is used to compose emails with links back to the website 
* **AutoUpdateDatabase**: by default, the application tries to perform model changes to the database after an update (when needed). Set to `false` if the application does not have owner permissions over the database
* **SupportEmailAddress**: the support email address (used on the footer of outgoing emails)

### Bindings

Under section **Bindings**:

* **HttpsMode**: by default, both the dashboard and the REST APIs can only be accessed through HTTPS, which is the recommended behavior if you have a valid SSL certificate.
  * If you do not have a valid SSL certificate, set this setting to `Optional`. Users accessing the dashboard will not be redirected to HTTPS and REST APIs will be accessible through HTTP.
  * If you have a valid SSL certificate but some legacy client applications do not recognize it, set this setting to `RedirectPages`. REST APIs will still be accessible through HTTP (like in `Optional` mode), but users accessing the dashboard will be redirected to HTTPS.
* **SslPort**: by default, users accessing the dashboard through HTTP are redirected to HTTPS on the standard TCP port 443. If the site is using HTTPS on a non-standard port, set it here.

### PKI Suite

Under section **PkiSuite**:

* **SdkLicense**: your license for the PKI SDK, in Base64 format (**required**)
* **WebLicense**: your license for the Web PKI component in binary (Base64) format. Only required if users will issue certificates on their computers (web issuing procedure)
* **WebBrand**: if you have a custom *setup brand* on Web PKI, set it here

### Email sending

Under section **Email**:

* **Enabled**: by default, email sending is enabled. To disable it, set this setting to `false` and ignore the remainder of this section
* **ServerHost**: hostname of the SMTP server
* **EnableSsl**: by default, the SMTP conversation is performed over SSL. To disable SSL, set this setting to `false`
* **ServerPort**: by default, the SMTP conversation is performed over port 587. Set this setting to use a different port
* **Username** and **Password**: if the SMTP server requires authentication, set these settings
* **SenderAddress**: email address to be used as sender (*from* field)
* **SenderName**: name to be used as the sender name (optional)

### Open ID Connect configuration

The section **Oidc** configures the OpenID Connect server, required for user management. A [GrantID](../../../../grant-id/index.md) subscription is required.

You can either use a SaaS subscription on [grantid.com](https://grantid.com/) or run your own instance of GrantID.

* **Authority**: the OIDC authority (e.g. *https://patorum.grantid.com*)
* **ApiEndpoint**: the API endpoint of the OIDC server (e.g. *https://api.grantid.com*)
* **ApiName**: the API scope that will be required on access tokens
* **ClientAppId**: the *client id* of the dashboard app
* **AppId**: the *client id* of the backend app
* **AppSecret**: the *client secret* of the backend app
* **RequireHttps** (optional): set to `false` if the OIDC server does not use HTTPS

See [Configuring a SPA Application page](../../../../grant-id/on-premises/configure-spa-app.md) for instructions on how to obtain these values.

## Configure a *daemon*

Create the service definition file:

```sh
touch /etc/systemd/system/lacuna-signer.service
nano /etc/systemd/system/lacuna-signer.service
```

Type the following:

```
[Unit]
Description=Lacuna Signer

[Service]
WorkingDirectory=/usr/share/lacuna-signer
ExecStart=/usr/bin/dotnet Lacuna.Signer.Site.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=lacuna-signer
User=lacuna-signer
Environment=ASPNETCORE_ENVIRONMENT=Linux
Environment=ASPNETCORE_URLS=http://+:5001
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false

[Install]
WantedBy=multi-user.target
```

Save the file, enable the service and start it:

```sh
systemctl enable lacuna-signer
systemctl start lacuna-signer
systemctl status lacuna-signer
```

The expected output is similar to:

```
* lacuna-signer.service - Lacuna Signer
   Loaded: loaded (/etc/systemd/system/lacuna-signer.service; enabled; vendor preset: enabled)
   Active: active (running) since Wed 2020-04-15 22:17:50 UTC; 30s ago
 Main PID: 2831 (dotnet)
    Tasks: 36 (limit: 2319)
   CGroup: /system.slice/lacuna-signer.service
           â””â”€2831 /usr/bin/dotnet Lacuna.Signer.Site.dll

Apr 15 22:17:50 server.patorum.com systemd[1]: Started Lacuna Signer.
Apr 15 22:17:55 server.patorum.com lacuna-signer[2831]: info: Lacuna.Signer.Site.Startup.RecurringJobsInit[0]
Apr 15 22:17:55 server.patorum.com lacuna-signer[2831]:       Initializing recurring jobs
```

If necessary, restart the service: `systemctl restart signer`

To test whether the Signer server is running, run:

```sh
curl http://localhost:5001/api/system/info
```

The expected output is something like:

```json
{"productName":"Lacuna.Signer.Site","productVersion":"1.x.x","timestamp":"..."}
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

Create a configuration file for the Signer website:

```sh
touch /etc/nginx/sites-available/lacuna-signer
nano /etc/nginx/sites-available/lacuna-signer
```

Enter the following, replacing the item's value `server_name` by the domain of access to the site:

```nginx
server {
    listen        80;
    server_name   localhost signer.patorum.com;
    client_max_body_size 11000000;
    location / {
        proxy_pass         http://localhost:5001;
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
Ideally, the site configuration should contain the entries `ssl_certificate` and `ssl_certificate_key` with the valid SSL certificate. This configuration is outside the scope of these
instructions.
:::


Activate the site:

```sh
ln -sf /etc/nginx/sites-available/lacuna-signer /etc/nginx/sites-enabled/lacuna-signer
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

## See too

* [Signer update on Linux](update.md)
* [Problem solving](troubleshoot/index.md)
