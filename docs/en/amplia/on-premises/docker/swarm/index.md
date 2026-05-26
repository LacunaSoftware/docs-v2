# Amplia - Setup on Docker Swarm

To install an [on-premises](../../index.md) instance of [Amplia](../../../index.md) on Docker Swarm, follow the steps below. If you use another Docker orchestrator,
see [Setup on Docker](../index.md). For other platforms, [click here](../../index.md).

:::tip
Before you start, make sure you have completed the steps outlined on [Planning before installation](../index.md#planning)
:::


Download the compose file and the configuration file templates:

```sh
curl -O https://cdn.lacunasoftware.com/amplia/docker/amplia-stack.yml
curl -O https://cdn.lacunasoftware.com/amplia/docker/amplia.json
curl -O https://cdn.lacunasoftware.com/amplia/docker/amplia-proxy.conf
```

Generate the SQL password and store as a Docker secret:

```sh
openssl rand -base64 24 | docker secret create amplia_sql_password -
```

:::note
You can instead run `echo 'mypass' | docker secret create amplia_sql_password -` to use a SQL password of your choice
:::


Generate the encryption key and store as a Docker secret:

```sh
docker run lacunasoftware/amplia:4.20 -- gen-enc-key -q | docker secret create amplia_encryption_key -
```

:::note
If migrating from a previous installation, make sure to use the previosly generated encryption key
:::


Choose a strong password for root access to the dashboard, hash it using the [command-line tool](../../tool/index.md) and store as a Docker secret:

```sh
docker run -i lacunasoftware/amplia:4.20 -- hash-root-pass -q | docker secret create amplia_root_password_hash -
```

Edit the Amplia configuration file:

```sh
nano amplia.json
```

Fill the following settings outlined below.

### General

Under section **General**:

* **SiteUrl**: publicly accessible URL of the website, hosted on the [dashboard domain](../../index.md#dashboard-domain) (e.g.: `http://ca.patorum.com/`)

:::note
Even if you have an SSL certificate, use the **SiteUrl** configuration with `http://`. Once you get Amplia
up and running on HTTP, follow the steps on [Enabling SSL](enable-ssl.md) to enable SSL.
:::


### Amplia settings

Under section **Amplia**:

* **DefaultAccessDomains**: domains to be used when composing the CRL distribution points (see [Access domains](../../index.md#access-domains))

### PKI Suite

Under section **PkiSuite**:

* **SdkLicense**: your license for the PKI SDK, in Base64 format (**required**)
* **WebLicense**: your license for the Web PKI component in binary (Base64) format. Only required if users will issue certificates on their computers (web issuing procedure)
* **WebBrand**: if you have a custom *setup brand* on Web PKI, set it here

### Optional settings

We recommend leaving the remaining sections unchanged for now. Once you get Amplia up and running, you can visit
each link below to enable optional features:

* [HTTPS redirection](../../configure-https-redirect.md)
* [Email sending](../../configure-email.md)
* [OpenID Connect integration](../../configure-oidc.md) (required for user management)
* [SMS sending](../../configure-sms.md) (required for the end-user certificate issuing page)

Edit the Nginx configuration file:

```sh
nano amplia-proxy.conf
```

Replace the `server_name` entry with your [dashboard domain](../../index.md#dashboard-domain)
and [access domains](../../index.md#access-domains).

Pull the images beforehand:

```sh
docker image pull mcr.microsoft.com/mssql/server:2019-latest
docker image pull lacunasoftware/amplia:4.14
docker image pull nginx:1.16
```

:::note
This step is not really necessary, as the images would be pulled automatically on the next command. However, it
avoids transient errors during deployment since not every orchestrator honors the `depends_on` instructions.
:::


Deploy the Amplia stack:

```sh
docker stack deploy -c amplia-stack.yml amplia
```

Check the status of the deployment:

```sh
watch docker stack ps amplia
```

Watch the column *CURRENT STATE*. Wait until all services are *Running* (this may take a few minutes for the *amplia_sql* service).

Check the logs for the *amplia* service:

```sh
docker service logs amplia_amplia -f
```

The expected output is similar to:

```plaintext
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Amplia entrypoint invoked
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Building connection string
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Assuming SQL_HOST = sql
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Assuming SQL_PORT = default port (1433)
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Assuming SQL_USER = SA
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Assuming SQL_DATABASE = Amplia
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Connection string: "Data Source=sql;Initial Catalog=Amplia;User ID=SA;Password=REDACTED"
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Starting application
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | info: Lacuna.Amplia.Site.AppInit[0]
amplia_amplia.1.fpywf4sndivf@ubuntu1804    |       Initializing application
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Hosting environment: Linux
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Content root path: /app
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Now listening on: http://[::]:80
amplia_amplia.1.fpywf4sndivf@ubuntu1804    | Application started. Press Ctrl+C to shut down.
```

:::note
During first the run of the stack you might see the error *A network-related or instance-specific error occurred while establishing a connection to SQL Server. The server was not found or was not accessible.*
This is because the SQL Server service takes some time to become ready. The stack usually recovers from this automatically.
:::


Test the dashboard (replace *ca.patorum.com* with your [dashboard domain](../../index.md#dashboard-domain)):

```sh
curl -H "Host: ca.patorum.com" http://127.0.0.1/api/system/info
```

The expected output is similar to:

```json
{"productName":"Lacuna Amplia","productVersion":"4.x.x","spaVersion":"...","timestamp":"..."}
```

If you have a valid SSL certificate for your [dashboard domain](../../index.md#dashboard-domain), follow the steps on [Enabling SSL](enable-ssl.md).

## See also

* [Enabling SSL](enable-ssl.md)
* [Using an external database](external-db.md)
* [Checking the system logs](check-logs.md)
* [Persistent data (backup considerations)](persistent-data.md)
* [Using a stack with GrantID](internal-grantid.md)
