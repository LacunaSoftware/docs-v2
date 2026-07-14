# Amplia - Checking the system logs on Docker Swarm

The Docker image for [Amplia](../../index.md) sends its logs to the standard output, which in turn gets registered
by Docker as service logs. To check the *amplia* service logs:

```sh
docker service logs amplia_amplia -f
```

:::note
On the commands shown on this article, the leftmost `amplia` is the name of the stack, while the rightmost part is the name
of the service (in the case above, the *amplia* service). If you deployed your stack with another name, say *patorumca*, you
would need to replace the leftmost `amplia` on the commands shown here with the name of your stack (e.g. *patorumca_amplia*).
:::


You can also check the SQL Server logs:

```sh
docker service logs amplia_sql -f
```

And also the Nginx logs:

```sh
docker service logs amplia_nginx -f
```

## See also

* [Installing Amplia on Docker Swarm](index.md)
* [Enabling SSL](enable-ssl.md)
* [Using an external database](external-db.md)
* [Persistent data (backup considerations)](persistent-data.md)
* [Using a stack with GrantID](internal-grantid.md)
