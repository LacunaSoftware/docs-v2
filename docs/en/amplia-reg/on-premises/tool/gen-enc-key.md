# Amplia Reg command: **gen-enc-key**

## Name

`gen-enc-key` - Generates a random encryption key (to encrypt sensitive database columns)

## Syntax

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll -- gen-enc-key
```

Or, on Docker:

```sh
docker run lacunasoftware/ampliareg:3.0 -- gen-enc-key
```

## Description

The `gen-enc-key` generates a 256-bit encryption key to be used on the setting `General__EncryptionKey`, which is used by Amplia Reg to encrypt sensitive data
stored on the database.

## See also

* [Amplia Reg command-line tool](index.md)
