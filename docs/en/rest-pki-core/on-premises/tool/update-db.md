# Rest PKI Core command: **update-db**

## Name

`update-db` - Updates the database model

## Syntax

```sh
dotnet Lacuna.RestPki.Site.dll [settings] -- update-db
```

Or, on Docker:

```sh
docker run -i lacunasoftware/restpkicore:4.1 [settings] -- update-db
```

The `settings` arguments are additional settings to overwrite settings from configuration files and environment variables,
for instance `--Section1:Name1=value1 --Section2:Name2=value2`.

## Description

The `update-db` command updates the database model by applying a series of *migrations*. It is meant to be used only when
[running Rest PKI Core without db_owner privileges](../unprivileged-db-user.md).

Since in this scenario Rest PKI Core's database credentials do not grant permissions to change the database model, you typically
will want to run this command passing a **privileged connection string**:

```sh
dotnet Lacuna.RestPki.Site.dll --ConnectionStrings:DefaultConnection="Data Source=SERVER;Initial Catalog=DATABASE;User ID=USERNAME;Password=PASSWORD" -- update-db
```

:::tip
On Linux, if your password contains the `!` character, use single quotes instead, e.g. `--ConnectionStrings:DefaultConnection='...'`, to avoid
shell history expansions
:::


## See also

* [Running Rest PKI Core without db_owner privileges](../unprivileged-db-user.md)
* [Rest PKI Core command-line tool](index.md)
