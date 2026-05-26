# Amplia Reg command: **test-cert-renewal-alert**

## Name

`test-cert-renewal-alert` - Tests the certificate renewal alert email

## Syntax

```sh
dotnet Lacuna.AmpliaRegNg.Site.dll [settings] -- test-cert-renewal-alert <order number> <simulated days before expiration>
```

Or, on Docker:

```sh
docker run -i lacunasoftware/ampliareg:3.0 [settings] -- test-cert-renewal-alert <order number> <simulated days before expiration>
```

The `settings` arguments are additional settings to overwrite settings from configuration files and environment variables,
for instance `--Section1:Name1=value1 --Section2:Name2=value2`.

## Description

The `test-cert-renewal-alert` command tests the email template configured by sending a email alert to the holder's email address associated with the order. The given order must be issued. Use negative days to test expired template.

## See also

* [Amplia Reg command-line tool](index.md)
