---
sidebar_label: "Envio de SMS"
sidebar_position: 6
slug: /signer/on-premises/sms
---

# Envio de SMS

Quando o envio de SMS está habilitado (assinatura eletrônica com código via SMS), o Signer precisa de uma
conta em um dos **provedores de SMS suportados**. Os parâmetros ficam na seção **`SMS`** das configurações
da instância (veja [Configurações do Signer](../settings.md)).

## Configuração básica

Para habilitar, defina `Enabled` como `true`, escolha o provedor em `Type` e informe as credenciais dele:

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

Com **Total Voice**, por exemplo:

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
O `Type` diferencia maiúsculas de minúsculas e deve ser um dos valores da tabela abaixo. Cada provedor tem
uma propriedade `Endpoint` opcional, usada apenas para apontar para um ambiente alternativo (homologação ou
proxy); deixe-a de fora para usar o endpoint padrão do provedor.
:::

## Provedores suportados

| Provedor | `Type` | Parâmetros |
|---|---|---|
| Twilio | `Twilio` | `AccountSid`, `AuthToken`, `MessageFrom` (ou `MessagingServiceSid`) |
| Total Voice | `TotalVoice` | `AccessToken` |
| Comtele | `Comtele` | `Sender`, `AuthToken` |
| Zenvia | `Zenvia` | `Account`, `Password` |
| Pontaltech | `Pontaltech` | `User`, `Password` |
| Pontaltech (rota rápida) | `FastPontaltech` | `User`, `Password` |
| SMS Empresa | `SmsEmpresa` | `ChaveKey` |
| SMS Token | `SmsToken` | `Key` |
| Tigo | `Tigo` | `ApiKey` |
| Eyou | `Eyou` | `Username`, `Password`, `ApiKey`, `CostCenter` |
| Amazon SNS | `AmazonSns` | `Region`, `AccessKeyId`, `SecretAccessKey` |
| Genérico (HTTP) | `Generic` | `Endpoint`, `AuthType` (`NoAuth`, `Basic`, `Bearer`, `ApiKey`) e as credenciais do modo escolhido |
| Simulador (testes) | `Simulator` | nenhum. Apenas registra o envio no log, sem enviar SMS de fato |

:::tip Twilio
Além das credenciais, o Twilio suporta a proteção contra fraude de *SMS pumping*. Prefira `AccountSid` +
`AuthToken` em vez do antigo par de credenciais básicas.
:::

## Vários provedores por país

É possível configurar mais de um provedor e roteá-los por prefixo internacional do número de destino,
usando `EnabledPrefixes` (lista separada por vírgula). Cada provedor fica em uma subseção nomeada:

```json
{
  "SMS": {
    "Enabled": true,
    "Brasil": {
      "Type": "TotalVoice",
      "AccessToken": "...",
      "EnabledPrefixes": "+55"
    },
    "Internacional": {
      "Type": "Twilio",
      "AccountSid": "...",
      "AuthToken": "...",
      "MessageFrom": "+12125550000",
      "EnabledPrefixes": "+1,+54"
    }
  }
}
```

## Veja também

* [Configurações do Signer](../settings.md)
* [Integração com WhatsApp](whatsapp.md): autenticação via WhatsApp em vez de SMS
