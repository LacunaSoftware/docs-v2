# Proxy configuration - PKI Express

To configure [PKI Express](../index.md) to use a proxy for web requests:

```sh
pkie config --set proxyHost=IP --set proxyPort=PORT
```

:::note
The commands on this article require administrative privileges. On Linux, you may need to use `sudo` or, on Windows,
a command prompt with elevated privileges.
:::


If the proxy requires authentication with username and password, do also:

```sh
pkie config --set proxyUsername=USERNAME --set proxyPassword=PASSWORD
```

On Linux, certain characters on the password such as `!` and `$` may cause problems. In such cases, surround the last argument with simple quotes (`'`):

```sh
pkie config --set proxyUsername=USERNAME --set 'proxyPassword=PASSWORD'
```

Alternatively, these settings may be changed by setting the following environment variables:

* `pkie:proxyHost` or `pkie__proxyHost`
* `pkie:proxyPort` or `pkie__proxyPort`
* `pkie:proxyUsername` or `pkie__proxyUsername`
* `pkie:proxyPassword` or `pkie__proxyPassword`

:::note
On Linux environments, variable names are **case sensitive**
:::

