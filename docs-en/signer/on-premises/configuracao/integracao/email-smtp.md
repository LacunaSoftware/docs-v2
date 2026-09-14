---
sidebar_label: "E-mail server (SMTP)"
sidebar_position: 7
slug: /signer/on-premises/email-smtp
---

# E-mail server (SMTP)

Signer sends notification e-mails (pending documents, completion, authentication codes and so on) through a
provider configured in the **`Email`** section of the instance settings (see
[Signer settings](../settings.md)). The default provider is **SMTP sending**, but Amazon SES and SendGrid
are also supported.

## SMTP sending (default)

To send through **your own SMTP server**, set `Enabled` to `true` and provide the server and credentials.
No `Type` is needed: when it is omitted, Signer automatically uses **MailKit**, which is the instance's
default SMTP provider.

```json
{
  "Email": {
    "Enabled": true,
    "ServerHost": "smtp.yourcompany.com",
    "Username": "no-reply@yourcompany.com",
    "Password": "your-password",
    "SenderAddress": "no-reply@yourcompany.com",
    "SenderName": "Your Company"
  }
}
```

Available parameters:

| Parameter | Description |
|---|---|
| `ServerHost` | The SMTP server address (host) |
| `Username` / `Password` | Credentials for SMTP server authentication |
| `SenderAddress` | The e-mail address used as the sender |
| `SenderName` | The name shown as the sender (we recommend the same name as the application) |
| `ServerPort` | The SMTP server port, when different from the default (`587`) |
| `EnableSsl` | Whether the communication uses SSL. Enabled by default |
| `ReplyToAddress` | Optional reply-to address |

### Advanced options (MailKit)

SMTP sending uses **MailKit**, which accepts a few additional parameters for specific cases:

| Parameter | Description |
|---|---|
| `SecureSocketOption` | Controls the secure connection mode: `None`, `Auto`, `SslOnConnect`, `StartTls` or `StartTlsWhenAvailable`. When set, it takes precedence over `EnableSsl` |
| `PoolConnections` | Reuses SMTP connections from a pool instead of opening a new one for each send. Useful at high volumes |
| `ConnectionKeepAliveSeconds` | How long (in seconds) a pooled connection is kept alive. Default: `15` |
| `ServerCertificateThumbprint` | Thumbprint of the expected server certificate, to pin it |
| `DangerousAcceptAnyServerCertificate` | Accepts **any** server certificate. Use only in test environments, as it disables TLS validation |

```json
{
  "Email": {
    "Enabled": true,
    "ServerHost": "smtp.yourcompany.com",
    "ServerPort": 587,
    "SecureSocketOption": "StartTls",
    "PoolConnections": true,
    "ConnectionKeepAliveSeconds": 30,
    "Username": "no-reply@yourcompany.com",
    "Password": "your-password",
    "SenderAddress": "no-reply@yourcompany.com",
    "SenderName": "Your Company"
  }
}
```

:::caution
`DangerousAcceptAnyServerCertificate` turns off TLS certificate verification and exposes the connection to
man-in-the-middle attacks. In production, prefer `ServerCertificateThumbprint` if you need to trust a
specific certificate (for example, a self-signed one).
:::

### Legacy provider

Instances configured before MailKit was introduced may have `Type` explicitly set to `Legacy`. This
provider uses .NET's native SMTP implementation and only accepts the basic parameters (`ServerHost`,
`ServerPort`, `Username`, `Password`, `SenderAddress`, `EnableSsl`). None of the advanced options above are
available for it.

:::tip
There is no need to migrate an instance that already works with `Legacy`. For a new configuration, prefer
leaving `Type` blank (or setting it to `MailKit`) to take advantage of connection pooling and the other
advanced options.
:::

## Amazon SES

To send through Amazon SES, set `Type` to `AwsSes`:

```json
{
  "Email": {
    "Enabled": true,
    "Type": "AwsSes",
    "Region": "us-east-1",
    "AccessKey": "...",
    "SecretKey": "...",
    "SenderAddress": "no-reply@yourcompany.com",
    "SenderName": "Your Company"
  }
}
```

:::tip AWS credentials
On an instance running in AWS, you can skip `AccessKey`/`SecretKey` and use the environment's own
credentials: set `InstanceProfileRole` (instance profile) or set `AssumeRoleWithWebIdentity` to `true`.
:::

## SendGrid

To send through SendGrid, set `Type` to `SendGrid`:

```json
{
  "Email": {
    "Enabled": true,
    "Type": "SendGrid",
    "ApiKey": "...",
    "SenderAddress": "no-reply@yourcompany.com",
    "SenderName": "Your Company"
  }
}
```

:::tip
To customize the **appearance** and **texts** of the e-mails (logo, colors, notifications), see
[E-mails and notifications](../personalizacao/emails.md). This page only covers the **sending channel**.
:::

## See also

* [Signer settings](../settings.md)
* [E-mails and notifications](../personalizacao/emails.md)
