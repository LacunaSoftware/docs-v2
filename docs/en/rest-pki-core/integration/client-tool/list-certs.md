# Client tool command: **list-certs**

## Name

`list-certs` - Lists the certificates on the current user's certficate store

## Syntax

```sh
rpkitool list-certs [options]
```

Options:

* `--icpbr`: List ICP-Brasil certificates only\*
* `--cpf <cpf>`: List certificates having a certain CPF only

\* Certificates are filtered based on their *likeness* to a standard ICP-Brasil certificate. The validation to ensure that a given certificate is a valid ICP-Brasil
certificate is a complex operation performed in another step by Rest PKI, it is not up to the client tool to perform such checks.

## Samples

To list certificates having the CPF `11111111111`:

```sh
rpkitool list-certs --cpf 11111111111
```

## Output

The following information about each certificate found are written to `stdout`, separated by semicolons (`;`), one certificate per line:

1. Certificate thumbprint (used to specify the certificate to be used on other commands, e.g. the [sign](sign.md) command)
1. Description of the certificate incluing the subject name and name of the certification authority (CA)

For instance:

```plaintext
78785300913FB340D6ADC12FA2A9F21CF1498703;FULANO DE TAL:11111111111 (AC VALID RFB)
C6BCC85172428B2454F24A588C03E6BD0CB035ED;FULANO DE TAL:11111111111 (AC FENACON RFB)
```
