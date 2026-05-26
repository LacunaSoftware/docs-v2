# Client tool command: **sign**

## Name

`sign` - Signs a document with one of the user's certificates

## Syntax

```sh
rpkitool sign <input-file> [options]
```

The command takes a single argument, the path of the file to be signed.

Options:

* `--cert-cpf <cert-cpf>`: CPF of the certificate to be used to sign the document
* `--cert-thumb <cert-thumb>`: Thumbprint of the certificate to be used to sign the document
* `--output-file <output-file>`: Output file
* `--document-key <document-key>`: Document key
* `--overwrite`: Overwrite input file
* `--name <name>`: Specify the file name to be used when calling APIs (instead of using the actual file name from the input file)

The signed file can be either written to a different path, specified with the `--output-file` parameter, or the file being signed can be overwritten
by passing the `--overwrite` parameter.

The certificate to be used can either be specified by the user's CPF with the `--cert-cpf` parameter or by the certificate's thumbprint. It the latter case,
the application would first call the [list-certs](list-certs.md) command to get a list of the available certificates, show this list to the user and pass the
thumbprint of the chosen certificate on the `--cert-thumb` parameter.

## Samples

To sign a file `document.pdf` with any certificate having CPF `11111111111`, overwriting the input file with the signed file:

```sh
rpkitool sign document.pdf --cert-cpf 11111111111 --overwrite
```

To sign the same file but now with a specific certificate, determined by its thumbprint (chosen by the user among the options returned by the
[list-certs](list-certs.md) command), writing the signed file with the filename `signed.pdf`:

```sh
rpkitool sign document.pdf --cert-thumb AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA --output-file signed.pdf
```

## Output

The `documentId` is outputted to `stdout`, which can be used to reference this document later.
