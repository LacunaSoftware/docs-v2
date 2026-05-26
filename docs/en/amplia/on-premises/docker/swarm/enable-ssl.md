# Enabling SSL on Docker Swarm - Amplia

Stop the stack (if already running):

```sh
docker stack rm amplia
```

Store the certificate and key files as secrets (replace *amplia.pem* and *amplia.key* below with your certificate and key files):

```sh
docker secret create amplia_ssl_cert amplia.pem
docker secret create amplia_ssl_cert_key amplia.key
```

Edit the Docker compose file:

```sh
nano amplia-stack.yml
```

Uncomment the following entries:

```yml
...

secrets:
  ...
  # Uncomment to enable SSL
  amplia_ssl_cert:
    external: true
  amplia_ssl_cert_key:
    external: true

...

services:
  
  ...

  nginx:
    ...
    # Uncomment to enable SSL
    secrets:
      - amplia_ssl_cert
      - amplia_ssl_cert_key
    ports:
      - "80:80"
      # Uncomment to enable SSL
      - "443:443"

...
```

Edit the Nginx configuration file:

```sh
nano amplia-proxy.conf
```

Uncomment the following entries:

```plaintext
...

    # Uncomment to enable SSL
    listen               443 ssl;
    ssl_certificate      /run/secrets/amplia_ssl_cert;
    ssl_certificate_key  /run/secrets/amplia_ssl_cert_key;

...
```

Edit the Amplia configuration file:

```sh
nano amplia.json
```

Make the following changes:

* Section **Bindings**
  * **HttpsMode**: change to `RedirectPages` to redirect to HTTPS users accessing the dashboard on HTTP
* Section **General**
  * **SiteUrl**: change the protocol of the URL to `https`, e.g. *https://ca.patorum.com*

Deploy the stack with the new configurations:

```sh
docker stack deploy -c amplia-stack.yml amplia
```

## See also

* [Installing Amplia on Docker Swarm](index.md)
* [Using an external database](external-db.md)
* [Checking the system logs](check-logs.md)
* [Persistent data (backup considerations)](persistent-data.md)
* [Using a stack with GrantID](internal-grantid.md)
