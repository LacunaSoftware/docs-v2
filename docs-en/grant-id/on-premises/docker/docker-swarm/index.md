# GrantID - Docker Swarm

To run an [on-premises](../../index.md) of [GrantID](../../../index.md) on Docker, follow the steps below.

:::tip
Before you start, make sure you have completed the steps outlined on [Planning before installation](../../index.md#planning)
:::


Download the compose file and the configuration file templates:

```sh
curl -O https://cdn.lacunasoftware.com/grantid/docker/grantid-stack.yml
curl -O https://cdn.lacunasoftware.com/grantid/docker/grantid.json
curl -O https://cdn.lacunasoftware.com/grantid/docker/grantid-proxy.conf
```

Generate the SQL password and store as a Docker secret:

```sh
openssl rand -base64 24 | docker secret create grantid_sql_password -
```

:::note
You can instead run `echo 'mypass' | docker secret create grantid_sql_password -` to use a SQL password of your choice
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

Merge the key and certificate into a single PFX file and store as a Docker secret (when asked for a password, simply press ENTER twice):

```sh
openssl pkcs12 -export -in cert.pem -inkey key.pem | docker secret create grantid_issuer_cert -
```

Do some housekeeping:

```sh
rm key.pem cert.pem
```

Generate a key used to encrypt "tokens" sent on emails:

```sh
openssl rand -base64 32 | docker secret create grantid_temp_token_key -
```

Edit the GrantID configuration file:

```sh
nano grantid.json
```

Fill the following settings:

* Section **Application**
  * **ProductName**: the name of your GrantID instance, e.g. *Patorum ID*
  * **AuthServerUrl**: public URL of the Auth Server component, hosted on the [base domain](../../index.md#planning), e.g. *http://id.patorum.com*
  * **ConsoleUrl**: public URL of the Console component, hosted on the [console domain](../../index.md#planning), e.g. *http://console.id.patorum.com*
  * **UseSSL**: whether the public URLs will use HTTPS (leave `false` for now, see below)

:::note
Even if you have an SSL certificate, use URLs with `http://` and leave **UseSSL** as `false` for now. Once you get GrantID
up and running on HTTP, follow the steps on [Enabling SSL](enable-ssl.md) to enable SSL.
:::


* Section **PkiSuite**
  * **SdkLicense**: your license for the PKI SDK, in Base64 format
  * **WebLicense**: your license for the Web PKI component in binary (Base64) format. Required if you intend to enable login with X.509 certificates.

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


Edit the Nginx configuration file:

```sh
nano grantid-proxy.conf
```

Make the following changes to the file:

* On the **Identity Service** server, replace the `server_name` entry with your [API domain](../../index.md#planning)
* On the **Auth Server** server, replace the `server_name` entry with your [base and login domains](../../index.md#planning)
* On the **Console** server, replace the `server_name` entry with your [console domain](../../index.md#planning)

Deploy the GrantID stack:

```sh
docker stack deploy -c grantid-stack.yml grantid
```

Check the status of the deployment:

```sh
watch docker stack ps grantid
```

Watch the column *CURRENT STATE*. Wait until all services are *Running* (this may take a few minutes for the *grantid_sql* service).

Check the logs for the *grantid* service:

```sh
docker service logs grantid_grantid -f
```

The expected output is similar to:

```plaintext
...
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:18,490 DEBG 'console' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | info: Grant.Id.Console.Startup[0]
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |       Console has started.
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:18,714 DEBG 'console' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Hosting environment: Linux
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:18,729 DEBG 'console' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Content root path: /app/console
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:18,730 DEBG 'console' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Now listening on: http://[::]:5012
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:18,730 DEBG 'console' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Application started. Press Ctrl+C to shut down.
...
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:19,157 DEBG 'auth-server' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | info: Grant.Id.AuthServer.Startup[0]
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |       AuthServer has started.
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:19,308 DEBG 'auth-server' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Hosting environment: Linux
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:19,308 DEBG 'auth-server' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Content root path: /app/auth-server
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:19,308 DEBG 'auth-server' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Now listening on: http://[::]:5011
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:19,308 DEBG 'auth-server' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Application started. Press Ctrl+C to shut down.
...
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:39,473 DEBG 'identity-service' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | info: Grant.Id.Service.Startup[0]
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |       IdentityService has started.
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:39,524 DEBG 'identity-service' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Hosting environment: Linux
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:39,525 DEBG 'identity-service' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Content root path: /app/identity-service
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:39,525 DEBG 'identity-service' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Now listening on: http://[::]:5010
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | 2020-01-30 21:16:39,525 DEBG 'identity-service' stdout output:
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    | Application started. Press Ctrl+C to shut down.
grantid_grantid.1.s5rskbdf9lzx@ubuntu1804    |
```

:::note
During first the run of the stack you might see the error *A network-related or instance-specific error occurred while establishing a connection to SQL Server. The server was not found or was not accessible.*
This is because the SQL Server service takes some time to become ready. The stack usually recovers from this automatically.
:::


Test the Identity Service component (replace *api.id.patorum.com* with your [API domain](../../index.md#planning)):

```sh
curl -H "Host: api.id.patorum.com" http://127.0.0.1/api/version
```

The version of the component should be outputted.

Test the Auth Server component (replace *id.patorum.com* with your [base domain](../../index.md#planning)):

```sh
curl -H "Host: id.patorum.com" http://127.0.0.1/
```

The source for an HTML document should be outputted.

Test the Console component (replace *console.id.patorum.com* with your [console domain](../../index.md#planning)):

```sh
curl -H "Host: console.id.patorum.com" http://127.0.0.1/
```

The source for an HTML document should be outputted.

## Post-installation

Follow the steps on [GrantID post-installation](../../post-install.md) to complete the installation procedure.

## See also

* [Enabling SSL on Docker](enable-ssl.md)
* [Using an external database on Docker](external-db.md)
* [Checking the system logs on Docker](check-logs.md)
* [Persistent data (backup considerations)](persistent-data.md)
