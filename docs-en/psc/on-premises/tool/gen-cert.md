# Lacuna PSC command: **gen-cert**

## Name

`gen-cert` - Generates a self-signed certificate to sign OAuth tokens

## Syntax

```sh
dotnet Lacuna.Psc.Site.dll [settings] -- gen-cert <subject common name> <PFX file password> [<output PFX file path>] [<output CER file path>]
```

Or, on Docker:

```sh
docker run -i lacunasoftware/psc:1.2 [settings] -- gen-cert <subject common name> <PFX file password> [<output PFX file path>] [<output CER file path>]
```

The `settings` arguments are additional settings to overwrite settings from configuration files and environment variables,
for instance `--Section1:Name1=value1 --Section2:Name2=value2`.

## See also

* [Lacuna PSC command-line tool](index.md)
