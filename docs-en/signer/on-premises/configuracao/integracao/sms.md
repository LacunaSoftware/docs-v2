---
sidebar_label: "SMS sending"
sidebar_position: 6
slug: /signer/on-premises/sms
---

# SMS sending

When SMS sending is enabled (electronic signature with a code via SMS), Signer needs an account with one of
the **supported SMS providers**. The parameters live in the **`SMS`** section of the instance settings (see
[Signer settings](../settings.md)).

## Basic configuration

To enable it, set `Enabled` to `true`, pick the provider in `Type` and fill in its credentials:

```json
{
  "SMS": {
    "Enabled": true,
    "Type": "Twilio",
    "MessageFrom": "+12125550000",
    "AccountSid": "AC00000000000000000000000000000000",
    "AuthToken": "ffffffffffffffffffffffffffffffff"
  }
}
```

With **Total Voice**, for example:

```json
{
  "SMS": {
    "Enabled": true,
    "Type": "TotalVoice",
    "AccessToken": "0123456789abcdef0123456789abcdef"
  }
}
```

:::note
`Type` is case-sensitive and must be one of the values in the table below. Every provider has an optional
`Endpoint` property, used only to point to an alternative environment (staging or a proxy); leave it out to
use the provider's default endpoint.
:::

## Supported providers

| Provider | `Type` | Parameters |
|---|---|---|
| Twilio | `Twilio` | `AccountSid`, `AuthToken`, `MessageFrom` (or `MessagingServiceSid`) |
| Total Voice | `TotalVoice` | `AccessToken` |
| Comtele | `Comtele` | `Sender`, `AuthToken` |
| Zenvia | `Zenvia` | `Account`, `Password` |
| Pontaltech | `Pontaltech` | `User`, `Password` |
| Pontaltech (fast route) | `FastPontaltech` | `User`, `Password` |
| SMS Empresa | `SmsEmpresa` | `ChaveKey` |
| SMS Token | `SmsToken` | `Key` |
| Tigo | `Tigo` | `ApiKey` |
| Eyou | `Eyou` | `Username`, `Password`, `ApiKey`, `CostCenter` |
| Amazon SNS | `AmazonSns` | `Region`, `AccessKeyId`, `SecretAccessKey` |
| Generic (HTTP) | `Generic` | `Endpoint`, `AuthType` (`NoAuth`, `Basic`, `Bearer`, `ApiKey`) and the credentials for the chosen mode |
| Simulator (testing) | `Simulator` | none. Only logs the send, without actually sending an SMS |

:::tip Twilio
Besides the credentials, Twilio supports SMS pumping fraud protection. Prefer `AccountSid` + `AuthToken`
over the old basic-credential pair.
:::

## Multiple providers by country

You can configure more than one provider and route between them by the destination number's international
prefix, using `EnabledPrefixes` (a comma-separated list). Each provider goes in a named subsection:

```json
{
  "SMS": {
    "Enabled": true,
    "Brazil": {
      "Type": "TotalVoice",
      "AccessToken": "...",
      "EnabledPrefixes": "+55"
    },
    "International": {
      "Type": "Twilio",
      "AccountSid": "...",
      "AuthToken": "...",
      "MessageFrom": "+12125550000",
      "EnabledPrefixes": "+1,+54"
    }
  }
}
```

## See also

* [Signer settings](../settings.md)
* [WhatsApp integration](whatsapp.md): authentication via WhatsApp instead of SMS
