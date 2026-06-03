# Installing GrantID on Ubuntu Server

{/* https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx?view=aspnetcore-2.2 */}

Follow these steps to install an [on-premises](../index.md) instance of [GrantID](../../index.md) on an Ubuntu Server.

:::tip
Before you start, make sure you have completed the steps outlined on [Planning before installation](../index.md#planning)
:::


## Prerequisites

* Ubuntu Server (any version currently in support by vendor, latest LTS version recommended)

* **PKI SDK license** (in Base64 format)
* **Web PKI license** (Base64/binary format) -- only needed for certificate sign in
* **DNS entries** previously created for the [domains mentioned on the planning section](../index.md#planning)
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


## Install Nginx

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

## Install GrantID

GrantID is composed of three components:

* **Identity Service**: contains the business logic and encapsulates access to the database
* **Auth Server**: accessed by end-users during logins, redirects and sign-ups
* **Console**: allows administrators to manage the system

We'll first do some initial setup, then we'll install each component.

### Initial setup

Download and extract the distribution package to its own directory, then enter it:

```sh
curl -O https://cdn.lacunasoftware.com/grantid/grantid-5.4.0.tar.gz
tar -xzf grantid-5.4.0.tar.gz --one-top-level
cd grantid-5.4.0
```

Create a local user to run the components:

```sh
mkdir /var/grantid
useradd --system --home-dir /var/grantid grantid
chown grantid:grantid /var/grantid
chmod 750 /var/grantid
```

Create the folder that will contain the binaries for each component and copy the binary files over:

```sh
mkdir /usr/share/grantid
cp -r components/* /usr/share/grantid/
chmod -R a=,u+rwX,go+rX /usr/share/grantid
```

:::note
Component binaries can be read by any user and can only be changed by root users. This means that the application user (*grantid*) can read but not change the files, which is intentional.
:::


Create the folder that will contain the configuration files and copy over the configuration file templates:

```sh
mkdir /etc/grantid
cp config-templates/* /etc/grantid/
chown -R root:grantid /etc/grantid
chmod -R a=,u+rwX,g+rX /etc/grantid
```

:::note
Configuration files can only be read by members of the *grantid* group and can only be changed by the root user. This is important to protect sensitive data stored on the configuration files from unauthorized access.
:::


Generate a self-signed certificate to sign the JSON Web Tokens. Provide the information below, pressing ENTER on the remaining questions. Avoid using diacritics ("accents" e.g. *á*, *ã*, *ç* etc).

* **Country Name**: enter the two-letter code of your country, e.g.: *BR*
* **State or Province Name**: enter the name of your organization's state, e.g.: *Sao Paulo*
* **Organization Name**: enter the name of your organization, e.g. *Patorum Inc*
* **Common Name**: enter the name of your GrantID instance, e.g. *Patorum ID*

```sh
openssl genrsa -out key.pem 2048
openssl req -x509 -new -days 36500 -key key.pem -out cert.pem
```
{/* Then "openssl req" command takes input from stdin, therefore it must be the last command on this block! */}

Merge the key and certificate into a single PFX file. When asked for a password, simply press ENTER twice.

```sh
openssl pkcs12 -export -in cert.pem -inkey key.pem -out /etc/grantid/issuer.pfx
```
{/* Then "openssl pkcs12" command takes input from stdin, therefore it must be the last command on this block! */}

Do some housekeeping:

```sh
chown root:grantid /etc/grantid/issuer.pfx
chmod 640 /etc/grantid/issuer.pfx
rm key.pem cert.pem
```

Generate a key used to encrypt "tokens" sent on emails:

```sh
openssl rand -base64 -out /etc/grantid/temp-token-key 32
chown root:grantid /etc/grantid/temp-token-key
chmod 640 /etc/grantid/temp-token-key
```

Edit the common configuration file:

```sh
nano /etc/grantid/common.json
```

Fill the following settings:

* Section **Application**
  * **ProductName**: the name of your GrantID instance, e.g. *Patorum ID*
  * **AuthServerUrl**: public URL of the Auth Server component, hosted on the [base domain](../../index.md#planning), e.g. *https://id.patorum.com*
  * **ConsoleUrl**: public URL of the Console component, hosted on the [console domain](../../index.md#planning), e.g. *https://console.id.patorum.com*
  * **UseSSL**: whether the public URLs will use HTTPS (fill according to the previous URLs)

* Section **PkiSuite**
  * **SdkLicense**: your license for the PKI SDK, in Base64 format
  * **WebLicense**: your license for the Web PKI component in binary (Base64) format. Required if you intend to enable login with X.509 certificates.

:::note
As mentioned on the [planning section](../index.md#planning), you should ideally have a valid SSL certificate for the domains. If you
don't have a certificate yet, use URLs with `http://` above and set **UseSSL** to `false`.
:::


<a name="identity-service" />
### Identity Service

We'll now install the **Identity Service** component. Edit the configuration file:

```sh
nano /etc/grantid/identity-service.json
```

Fill the following settings:

* Section **ConnectionStrings**
  * **DefaultConnection**: Database connection string (see how to [prepare the database](../prepare-database.md))

* Section **SMS**: configures the SMS sending. The setting **Type** defines which provider should be used, and the remaining settings depend on the provider chosen:
  * [Twilio](https://www.twilio.com/)
    * **Type**: set this setting to `Twilio` to send SMS messages using Twilio
    * **MessageFrom**: the sender phone number provided by Twilio (e.g.: *+12125550000*)
    * **AccountSid**: the account SID, provided by Twilio
    * **AuthToken**: the authentication token, provided by Twilio
  * [TotalVoice](https://totalvoice.com.br/)
    * **Type**: set this setting to `TotalVoice` to send SMS messages using TotalVoice
    * **AccessToken**: the access token, provided by TotalVoice (e.g.: *0123456789abcdef0123456789abcdef*)
  * Simulator (for debugging purposes only)
    * **Type**: set this setting to `Simulator` to simulate sending SMS messages (but instead only log the messages that would be sent)

:::note
If you don't intend to configure SMS sending at this time, disable phone verification for console users by editing the common configuration
file *common.json*, under the **Application** section set **RequirePhoneVerification** to `false`.
:::


* Section **Email**: configures email sending through SMTP
  * **ServerHost**: hostname of the SMTP server
  * **Username** and **Password**: if the SMTP server requires authentication, set these settings
  * **SenderAddress**: email address to be used as sender (*from* field)
  * **SenderName**: name to be used as the sender name (optional)
  * **EnableSsl**: by default, the SMTP conversation is performed over SSL. To disable SSL, set this setting to `false`
  * **ServerPort**: by default, the SMTP conversation is performed over port 587. Set this setting to use a different port
  * **Support**: Address written on the footer of outgoing e-mails, e.g. *support@patorum.com*
  * **LogoUrl** (optional): Public URL of the image that is used on the header of outgoing emails. If omitted, the GrantID logo will be used.

:::note
If you don't intend to configure email sending at this time, disable email verification for console users by editing the common
configuration file *common.json*, under the **Application** section set **RequireEmailVerification** to `false`.
:::


Create the service, then enable and start it:

```sh
cp service-defs/grantid-identity-service.service /etc/systemd/system/
systemctl enable grantid-identity-service
systemctl start grantid-identity-service
systemctl status grantid-identity-service
```

The expected output is similar to:

```
* grantid-identity-service.service - GrantID Identity Service
   Loaded: loaded (/etc/systemd/system/grantid-identity-service.service; enabled; vendor preset: enabled)
   Active: active (running) since Tue 2020-01-21 14:45:34 UTC; 3h 46min ago
 Main PID: 776 (dotnet)
    Tasks: 26 (limit: 3527)
   CGroup: /system.slice/grantid-identity-service.service
           └─776 /usr/bin/dotnet Grant.Id.Service.dll

Jan 21 14:45:34 ubuntu1804 systemd[1]: Started GrantID Identity Service.
Jan 21 14:45:44 ubuntu1804 grantid[776]: Signing certificate PFX path: '/etc/grantid/grantid.pfx', password: ''
Jan 21 14:45:44 ubuntu1804 grantid[776]: Audit is enabled
Jan 21 14:45:50 ubuntu1804 grantid[776]: Hosting environment: Linux
Jan 21 14:45:50 ubuntu1804 grantid[776]: Content root path: /usr/share/grantid/identity-service
Jan 21 14:45:50 ubuntu1804 grantid[776]: Now listening on: http://localhost:5010
Jan 21 14:45:50 ubuntu1804 grantid[776]: Application started. Press Ctrl+C to shut down.
```

If necessary, restart the service: `systemctl restart grantid-identity-service`. If something seems wrong, check the logs: `journalctl -u grantid-identity-service`

:::note
If the logs show an exception stating that *an error occurred during the pre-login handshake* or that *the remote certificate was rejected*,
add `;TrustServerCertificate=True` to your connection string on the file `/etc/grantid/identity-service.json` as a workaround
:::


To test that the service is running, run:

```sh
curl http://localhost:5010/api/version
```

The version of the component should be outputted.

:::note
The Identity Service component does not need to be publicly accessible. If your applications don't call GrantID's APIs
directly, you can skip the remainder of this section and go to the [Auth Server installation](#auth-server)
:::


Create a site configuration file for the component:

```sh
nano /etc/nginx/sites-available/grantid-identity-service
```

Enter the following, replacing the `server_name` entry with your [API domain](../index.md#planning):

```nginx
server {
    listen        80;
    listen        443 ssl;  # comment if you don't have an SSL certificate yet

	# Replace with your API domain
    server_name   api.id.patorum.com;

	# Path of the SSL certificate and key (comment if you don't have an SSL certificate yet)
    ssl_certificate      /etc/ssl/certs/grantid.pem;
    ssl_certificate_key  /etc/ssl/private/grantid.key;

    location / {
        proxy_pass         http://localhost:5010;
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

Enable the site:

```sh
ln -sf /etc/nginx/sites-available/grantid-identity-service /etc/nginx/sites-enabled/grantid-identity-service
```

Test the Nginx configuration and reload it:

```sh
nginx -t
nginx -s reload
```

Test the site (replace *api.id.patorum.com* with your [API domain](../index.md#planning)):

```sh
curl -H "Host: api.id.patorum.com" http://localhost/
```

<a name="auth-server" />
### Auth Server

We'll now install the **Auth Server** component.

:::note
Typically, the Auth Server does not need any additional configuration, so there's nothing to fill on */etc/grantid/auth-server.log*
:::


Create the service, then enable and start it:

```sh
cp service-defs/grantid-auth-server.service /etc/systemd/system/
systemctl enable grantid-auth-server
systemctl start grantid-auth-server
systemctl status grantid-auth-server
```

The expected output is similar to:

```
* grantid-auth-server.service - GrantID Auth Server
   Loaded: loaded (/etc/systemd/system/grantid-auth-server.service; enabled; vendor preset: enabled)
   Active: active (running) since Tue 2020-01-21 14:45:35 UTC; 4h 28min ago
 Main PID: 868 (dotnet)
    Tasks: 24 (limit: 3527)
   CGroup: /system.slice/grantid-auth-server.service
           └─868 /usr/bin/dotnet Grant.Id.AuthServer.dll

Jan 21 14:45:35 ubuntu1804 systemd[1]: Started GrantID Auth Server.
Jan 21 14:45:44 ubuntu1804 grantid[868]: Signing certificate PFX path: '/etc/grantid/grantid.pfx', password: ''
Jan 21 14:45:47 ubuntu1804 grantid[868]: Hosting environment: Linux
Jan 21 14:45:47 ubuntu1804 grantid[868]: Content root path: /usr/share/grantid/auth-server
Jan 21 14:45:47 ubuntu1804 grantid[868]: Now listening on: http://[::]:5011
Jan 21 14:45:47 ubuntu1804 grantid[868]: Application started. Press Ctrl+C to shut down.
```

If necessary, restart the service: `systemctl restart grantid-auth-server`

To test that the service is running, run:

```sh
curl -H "X-Forwarded-Proto: https" http://localhost:5011/
```

The source for an HTML document should be outputted.

Create a site configuration file for the component:

```sh
nano /etc/nginx/sites-available/grantid-auth-server
```

Enter the following, replacing the `server_name` entry with your [base and login domains](../index.md#planning):

```nginx
server {
    listen        80;
    listen        443 ssl;  # comment if you don't have an SSL certificate yet

	# Replace with your base domain and your login domain
    server_name   id.patorum.com  login.id.patorum.com;

	# Path of the SSL certificate and key (comment if you don't have an SSL certificate yet)
    ssl_certificate      /etc/ssl/certs/grantid.pem;
    ssl_certificate_key  /etc/ssl/private/grantid.key;

    location / {
        proxy_pass         http://localhost:5011;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_buffer_size       16k;
        proxy_busy_buffers_size 16k;
    }
}
```

Enable the site:

```sh
ln -sf /etc/nginx/sites-available/grantid-auth-server /etc/nginx/sites-enabled/grantid-auth-server
```

Test the Nginx configuration and reload it:

```sh
nginx -t
nginx -s reload
```

Test the site (replace *id.patorum.com* with your [base domain](../index.md#planning)):

{/* TODO: This test does not yield the expected results if UseSSL = true */}
```sh
curl -H "Host: id.patorum.com" http://localhost/
```

<a name="console" />
### Console

We'll now install the **Console** component.

:::note
Typically, the Console does not need any additional configuration, so there's nothing to fill on */etc/grantid/console.log*
:::


Create the service, then enable and start it:

```sh
cp service-defs/grantid-console.service /etc/systemd/system/
systemctl enable grantid-console
systemctl start grantid-console
systemctl status grantid-console
```

The expected output is similar to:

```
* grantid-console.service - GrantID Console
   Loaded: loaded (/etc/systemd/system/grantid-console.service; enabled; vendor preset: enabled)
   Active: active (running) since Tue 2020-01-21 19:25:56 UTC; 13s ago
 Main PID: 28519 (dotnet)
    Tasks: 24 (limit: 3527)
   CGroup: /system.slice/grantid-console.service
           └─28519 /usr/bin/dotnet Grant.Id.Console.dll

Jan 21 19:25:56 ubuntu1804 systemd[1]: Started GrantID Console.
Jan 21 19:25:57 ubuntu1804 grantid[28519]: info: Grant.Id.Console.Startup[0]
Jan 21 19:25:57 ubuntu1804 grantid[28519]:       Console has started.
Jan 21 19:25:57 ubuntu1804 grantid[28519]: Hosting environment: Linux
Jan 21 19:25:57 ubuntu1804 grantid[28519]: Content root path: /usr/share/grantid/console
Jan 21 19:25:57 ubuntu1804 grantid[28519]: Now listening on: http://[::]:5012
Jan 21 19:25:57 ubuntu1804 grantid[28519]: Application started. Press Ctrl+C to shut down.
```

If necessary, restart the service: `systemctl restart grantid-console`

To test that the service is running, run:

```
curl -H "X-Forwarded-Proto: https" http://localhost:5012/
```

The source for an HTML document should be outputted.

Create a site configuration file for the component:

```sh
nano /etc/nginx/sites-available/grantid-console
```

Enter the following, replacing the `server_name` entry with your [console domain](../index.md#planning):

```nginx
server {
    listen        80;
    listen        443 ssl;  # comment if you don't have an SSL certificate yet

	# Replace with your console domain
    server_name   console.id.patorum.com;

	# Path of the SSL certificate and key (comment if you don't have an SSL certificate yet)
    ssl_certificate      /etc/ssl/certs/grantid.pem;
    ssl_certificate_key  /etc/ssl/private/grantid.key;

    location / {
        proxy_pass         http://localhost:5012;
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

Enable the site:

```sh
ln -sf /etc/nginx/sites-available/grantid-console /etc/nginx/sites-enabled/grantid-console
```

Test the Nginx configuration and reload it:

```sh
nginx -t
nginx -s reload
```

Test the site (replace *console.id.patorum.com* with your [console domain](../index.md#planning)):

{/* TODO: This test does not yield the expected results if UseSSL = true */}
```sh
curl -H "Host: console.id.patorum.com" http://localhost/
```

## Post-installation

Follow the steps on [GrantID post-installation](../post-install.md) to complete the installation procedure.
