# Signer - Docker Swarm

To install an [on-premises](../../index.md) instance of [Signer](../../../index.md) on Docker, follow the steps below. For other platforms, [click here](../../index.md).

Download the compose file and the configuration file templates:

```sh
curl -O https://cdn.lacunasoftware.com/signer/docker/signer-stack.yml
curl -O https://cdn.lacunasoftware.com/signer/docker/signer.json
curl -O https://cdn.lacunasoftware.com/signer/docker/signer-proxy.conf
```

Generate the SQL password and store as a Docker secret:

```sh
openssl rand -base64 24 | docker secret create signer_sql_password -
```

:::note
You can instead run `echo 'mypass' | docker secret create signer_sql_password -` to use a SQL password of your choice
:::


Generate the encryption key and store as a Docker secret:

```sh
openssl rand -hex 32 | docker secret create signer_encryption_key -
```

:::note
If migrating from a previous installation, make sure to use the previosly generated encryption key
:::


Edit the Signer configuration file:

```sh
nano signer.json
```

Follow the instructions on the file to fill it out.

:::tip
For instructions on specific configurations on the *signer.json* file, please refer to the [Ubuntu setup instructions](../../linux/install-ubuntu.md)
:::


Edit the Nginx configuration file:

```sh
nano signer-proxy.conf
```

Replace the `server_name` entry with your site domain.

Pull the images beforehand:

```sh
docker image pull mcr.microsoft.com/mssql/server:2019-latest
docker image pull lacunasoftware/signer:1.9
docker image pull nginx:1.16
```

:::note
This step is not really necessary, as the images would be pulled automatically on the next command. However, it
avoids transient errors during deployment since not every orchestrator honors the `depends_on` instructions.
:::


Deploy the Signer stack:

```sh
docker stack deploy -c signer-stack.yml signer
```

Check the status of the deployment:

```sh
watch docker stack ps signer
```

Watch the column *CURRENT STATE*. Wait until all services are *Running* (this may take a few minutes for the *signer_sql* service).

Check the logs for the *signer* service:

```sh
docker service logs signer_signer -f
```

The expected output is similar to:

```plaintext
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | Signer entrypoint invoked
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | Building connection string
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | Assuming SQL_HOST = sql
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | Assuming SQL_PORT = default port (1433)
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | Assuming SQL_USER = SA
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | Assuming SQL_DATABASE = Signer
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | Connection string: "Data Source=sql;Initial Catalog=Signer;User ID=SA;Password=REDACTED"
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | Starting application
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | warn: Microsoft.EntityFrameworkCore.Model.Validation[30000]
signer_signer.1.y56lfxi6rn0i@ubuntu1804    |       No type was specified for the decimal column 'Value' on entity type 'Invoice'. This will cause values to be silently truncated if they do not fit in the default precision and scale. Explicitly specify the SQL server column type that can accommodate all the values using 'HasColumnType()'.
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | warn: Microsoft.EntityFrameworkCore.Model.Validation[30000]
signer_signer.1.y56lfxi6rn0i@ubuntu1804    |       No type was specified for the decimal column 'BillingLimit' on entity type 'Subscription'. This will cause values to be silently truncated if they do not fit in the default precision and scale. Explicitly specify the SQL server column type that can accommodate all the values using 'HasColumnType()'.
signer_signer.1.y56lfxi6rn0i@ubuntu1804    | info: Lacuna.Signer.Site.Startup.RecurringJobsInit[0]
signer_signer.1.y56lfxi6rn0i@ubuntu1804    |       Initializing recurring jobs
```

:::note
During first the run of the stack you might see the error *A network-related or instance-specific error occurred while establishing a connection to SQL Server. The server was not found or was not accessible.*
This is because the SQL Server service takes some time to become ready. The stack usually recovers from this automatically.
:::


Test the dashboard (replace *signer.patorum.com* with your site domain):

```sh
curl -H "Host: signer.patorum.com" http://127.0.0.1/api/system/info
```

The expected output is similar to:

```json
{"productName":"Lacuna.Signer.Site","productVersion":"1.x.x","timestamp":"..."}
```

If you have a valid SSL certificate for your site, follow the steps on [Enabling SSL on Docker](enable-ssl.md).

## See also

* [Enabling SSL on Docker](enable-ssl.md)
* [Using an external database on Docker](external-db.md)
* [Checking the system logs on Docker](check-logs.md)
* [Persistent data (backup considerations)](persistent-data.md)
* [Using a stack with GrantID](internal-grantid.md)
