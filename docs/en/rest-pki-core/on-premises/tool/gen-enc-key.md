# Rest PKI Core command: **gen-enc-key**

## Name

`gen-enc-key` - Generates a random encryption key (to encrypt sensitive database columns)

## Syntax

```sh
dotnet Lacuna.RestPki.Site.dll -- gen-enc-key
```

Or, on Docker:

```sh
docker run lacunasoftware/restpkicore:4.1 -- gen-enc-key
```

## Description

The `gen-enc-key` generates a 256-bit encryption key to be used on the setting `General__EncryptionKey`, which is used by Rest PKI Core to encrypt sensitive data
stored on the database.

## See also

* [Rest PKI Core command-line tool](index.md)
