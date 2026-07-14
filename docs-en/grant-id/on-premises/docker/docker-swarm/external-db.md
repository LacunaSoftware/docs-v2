# Using an external database on Docker - GrantID

The [standard Docker compose file for GrantID](https://cdn.lacunasoftware.com/grantid/docker/grantid-stack.yml) includes an internal service for the database
(Microsoft SQL Server).

For production environments, there may be [concerns about running the database on Docker](https://vsupalov.com/database-in-docker/). If you prefer,
follow the steps on this article to use an external database.

Stop the stack:

```sh
docker stack rm grantid
```

Edit the Docker compose file:

```sh
nano grantid-stack.yml
```

Make the following changes:

* Section **volumes**: remove item **sql**
* Section **services**:
  * Remove entire service **sql**
  * Service **grantid**
    * On section **environment**, add the following items:
      * **SQL_HOST**: hostname of the database server
      * **SQL_PORT** (optional): port of the database server (if omitted port 1433 is assumed)
      * **SQL_DATABASE**: name of the database to use
      * **SQL_USER**: username to authenticate on the database server
	* Remove section **depends_on**

The password should be added as the secret *grantid_sql_password*:

```sh
echo 'MyPassword' | docker secret create grantid_sql_password -
```

Deploy the stack with the new configurations:

```sh
docker stack deploy -c grantid-stack.yml grantid
```

## Custom connection string

The method above uses the provided host, database, user and password file to build a connection string with the following format:

```plaintext
Data Source=HOST;Initial Catalog=DATABASE;User ID=USER;Password=PASSWORD
```

On certain scenarios the connection string might be more complex, for instance if the database is mirrored. On such cases, follow
the steps below to use a custom connection string.

Edit the Docker compose file:

```sh
nano grantid-stack.yml
```

Make the following changes:

* Section **volumes**: remove item **sql**
* Section **secrets**: remove item **grantid_sql_password**
* Section **services**:
  * Remove entire service **sql**
  * Service **grantid**
    * On section **secrets**, remove item **grantid_sql_password**
    * On section **environment**, remove all items starting with **SQL_**
	* Remove section **depends_on**

Edit the GrantID configuration file:

```sh
nano grantid.json
```

Add the **ConnectionStrings** section to the file, with a single item named `DefaultConnection`:

```sh
{
	"ConnectionStrings": {
		"DefaultConnection": "YOUR-CUSTOM-CONNECTION-STRING"
	},

	"Application": ...
}
```

## See also

* [Installing GrantID on Docker](index.md)
* [Enabling SSL on Docker](enable-ssl.md)
* [Checking the system logs on Docker](check-logs.md)
* [Persistent data (backup considerations)](persistent-data.md)
