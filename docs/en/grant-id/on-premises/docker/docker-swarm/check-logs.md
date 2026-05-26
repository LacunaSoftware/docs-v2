# GrantID - Checking the system logs on Docker

The Docker image for [GrantID](../index.md) sends its logs to the standard output, which in turn gets registered
by Docker as service logs. To check the *grantid* service logs:

```sh
docker service logs grantid_grantid -f
```

:::note
On the commands shown on this article, the leftmost `grantid` is the name of the stack, while the rightmost part is the name
of the service (in the case above, the *grantid* service). If you deployed your stack with another name, say *patorumid*, you
would need to replace the leftmost `grantid` on the commands shown here with the name of your stack (e.g. *patorumid_grantid*).
:::


You can also check the SQL Server logs:

```sh
docker service logs grantid_sql -f
```

And also the Nginx logs:

```sh
docker service logs grantid_nginx -f
```

## See also

* [Installing GrantID on Docker](index.md)
* [Enabling SSL on Docker](enable-ssl.md)
* [Using an external database on Docker](external-db.md)
* [Persistent data (backup considerations)](persistent-data.md)
