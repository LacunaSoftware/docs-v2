# Rest PKI Core - Setup on Docker

To install an [on-premises](index.md) instance of [Rest PKI Core](../index.md) on Docker, follow the steps below. For other platforms, [click here](index.md#platforms).

For Docker-based setup the following image is provided on Docker Hub:

<br />
<center>
**[Rest PKI Core Docker image](https://hub.docker.com/r/lacunasoftware/restpkicore)**
</center>
<br />

The currently recommended image is `lacunasoftware/restpkicore:4.1`

Available moving tags:

* Tag `4.0` points to the latest 4.0.x image **(recommended)**
* Tag `4` points to the lastest 4.x image
* Tag `stable` points to the latest stable image

{/* <a name="vnext" /> >> [!NOTE] > To test the upcoming version of Rest PKI Core, currently in Release Candidate state, use the image `lacunasoftware/restpkicore:3.3.0-rc12` instead. > **Beware:** Release Candidate versions are not production-ready and thus should only be installed on staging or test environments. */}

This image requires: 

* **Blob storage** shared between all containers running the image -- see [Blob Storage configuration](configure-blob-storage.md)

* **Connection string** to a [previously created SQL Server or PostgreSQL database](prepare-database.md)
* **PKI SDK license** (in Base64 format)
* **Web PKI license** (Base64/binary format)

## Configuration

The container for this image is configured using environment variables. Get the [**sample environment file**](https://cdn.lacunasoftware.com/restpkicore/docker/restpkicore.env) for a
template to fill in the image's settings.

To fill the `General__EncryptionKey` setting, generate a 256-bit key to encrypt sensitive data stored on the database:

```sh
docker run lacunasoftware/restpkicore:4.1 -- gen-enc-key
```

To fill the `General__RootPasswordHash` setting, choose a strong password for root access to the dashboard and hash it:

```sh
docker run -i lacunasoftware/restpkicore:4.1 -- hash-root-pass
```

## Exposed ports

The Rest PKI Core image listens on **port 80**.

You should set up a reverse proxy or load balancer listening on both default ports for HTTP (80) and HTTPS (443), redirecting
traffic on both ports to Rest PKI Core's port 80. Additionaly, your setup should fill the request headers
[X-Forwarded-Proto](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Proto),
[X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For) and, optionally, `X-Forwarded-Port`.
The configuration `Bindings__UseReverseProxy=True` tells Rest PKI Core that the information on these headers should be trusted.

## Example

In a production environment you would typically use a Docker orchestrator and a dedicated database server (or a IaaS database offering), but for testing purposes you
can run an instance of Rest PKI Core with an instance of PostgreSQL with Docker alone.

Start by creating a volume for the database server:

```sh
docker volume create restpkicore_sql
```

Then, start it with a password of your choice (replace `SOME_PASS` below):

```sh
docker run --name restpkicore_sql -v restpkicore_sql:/var/lib/postgresql/data -p 5432:5432 -e "POSTGRES_PASSWORD=SOME_PASS" -d postgres
```

Check the container logs for any errors:

```sh
docker logs -f restpkicore_sql
```

This can take a few minutes. Once the database server is up and running, hit CTRL+C to exit the logs.

Create a volume to use as blob storage:

```sh
docker volume create restpkicore_data
```

Then, download the [sample environment file](https://cdn.lacunasoftware.com/restpkicore/docker/restpkicore.env), save it with name *restpkicore.env*
and fill it out.

On the connection string configuration, use the value below replacing `HOST_IP` with the IP address of the host and `SOME_PASS` with the
password you chose for PostgreSQL:

```sh
ConnectionStrings__DefaultConnection=Host=HOST_IP;Database=restpkicore;Username=postgres;Password=SOME_PASS
ConnectionStrings__DefaultConnection_ProviderName=Postgres
```

On the blob storage configuration, leave the default settings, since we'll mount the created volume on `/var/app`:

```sh
BlobStorage__Type=FileSystem
BlobStorage__Path=/var/app
```

Now, let's run the container with the configuration file, mounting the volume `restpkicore_data` on `/var/app` and exposing the app (which listens on port 80) on the host's port 8080:

```sh
docker run --name restpkicore --env-file restpkicore.env -v restpkicore_data:/var/app -p 8080:80 -d lacunasoftware/restpkicore:4.1
```

:::tip
If given a credential with enough privileges, Rest PKI Core will attempt to create the target database on the server (which is what will happen in this case)
:::


Check the container logs for any configuration errors:

```sh
docker logs -f restpkicore
```

If everything is configured correctly, you should have a Rest PKI Core instance running on [localhost:8080](http://localhost:8080/)

## See also

* [User management configuration](configure-oidc.md)
