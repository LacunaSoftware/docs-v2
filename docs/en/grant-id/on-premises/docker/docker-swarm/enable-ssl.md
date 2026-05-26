# Enabling SSL on Docker - GrantID

Stop the stack (if already running):

```sh
docker stack rm grantid
```

Store the certificate and key files as secrets (replace *grantid.pem* and *grantid.key* below with your certificate and key files):

```sh
docker secret create grantid_ssl_cert grantid.pem
docker secret create grantid_ssl_cert_key grantid.key
```

Edit the Docker compose file:

```sh
nano grantid-stack.yml
```

Uncomment the following entries:

```yml
...

secrets:
  ...
  # Uncomment to enable SSL
  grantid_ssl_cert:
    external: true
  grantid_ssl_cert_key:
    external: true

...

services:
  
  ...

  nginx:
    ...
    # Uncomment to enable SSL
    secrets:
      - grantid_ssl_cert
      - grantid_ssl_cert_key
    ports:
      - "80:80"
      # Uncomment to enable SSL
      - "443:443"

...
```

Edit the Nginx configuration file:

```sh
nano grantid-proxy.conf
```

Uncomment the following entries:

```plaintext
# Identity Service

...

    # Uncomment to enable SSL
    listen               443 ssl;
    ssl_certificate      /run/secrets/grantid_ssl_cert;
    ssl_certificate_key  /run/secrets/grantid_ssl_cert_key;

...

# Auth Server

...

    # Uncomment to enable SSL
    listen               443 ssl;
    ssl_certificate      /run/secrets/grantid_ssl_cert;
    ssl_certificate_key  /run/secrets/grantid_ssl_cert_key;

...

# Console

...

    # Uncomment to enable SSL
    listen               443 ssl;
    ssl_certificate      /run/secrets/grantid_ssl_cert;
    ssl_certificate_key  /run/secrets/grantid_ssl_cert_key;

...
```

Edit the GrantID configuration file:

```sh
nano grantid.json
```

Make the following changes:

* Section **Application**
  * **AuthServerUrl**: change the protocol of the URL to `https`, e.g. *https://id.patorum.com*
  * **ConsoleUrl**: change the protocol of the URL to `https`, e.g. *https://console.id.patorum.com*
  * **UseSSL**: change to `true`

Deploy the stack with the new configurations:

```sh
docker stack deploy -c grantid-stack.yml grantid
```

## See also

* [Installing GrantID on Docker](index.md)
* [Using an external database on Docker](external-db.md)
* [Checking the system logs on Docker](check-logs.md)
* [Persistent data (backup considerations)](persistent-data.md)
