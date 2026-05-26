# Amplia Reg command: **test-email**

## Name

`test-email` - Tests the email sending

## Syntax

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- test-email <to-address>
```

Or, on Docker:

```sh
docker run -i lacunasoftware/ampliareg:3.0 [settings] -- test-email <to-address>
```

The `settings` arguments are additional settings to overwrite settings from configuration files and environment variables,
for instance `--Section1:Name1=value1 --Section2:Name2=value2`.

## Description

The `test-email` command tests the email configuration by attempting to send a test message to the given address.

## See also

* [Amplia Reg command-line tool](index.md)
