---
sidebar_label: "Servidor de e-mail (SMTP)"
sidebar_position: 7
slug: /signer/on-premises/email-smtp
---

# Servidor de e-mail (SMTP)

O Signer envia e-mails de notificação (documentos pendentes, conclusão, códigos de autenticação etc.) por um
provedor configurado na seção **`Email`** das configurações da instância (veja
[Configurações do Signer](../settings.md)). O provedor padrão é o **envio por SMTP**, mas também há suporte
a Amazon SES e SendGrid.

## Envio por SMTP (padrão)

Para enviar pelo **seu próprio servidor SMTP**, defina `Enabled` como `true` e informe o servidor e as
credenciais. Não é necessário informar `Type`: quando ele não é informado, o Signer usa automaticamente o
**MailKit**, que é o provedor SMTP padrão da instância.

```json
{
  "Email": {
    "Enabled": true,
    "ServerHost": "smtp.suaempresa.com",
    "Username": "no-reply@suaempresa.com",
    "Password": "sua-senha",
    "SenderAddress": "no-reply@suaempresa.com",
    "SenderName": "Sua Empresa"
  }
}
```

Parâmetros disponíveis:

| Parâmetro | Descrição |
|---|---|
| `ServerHost` | Endereço (host) do servidor SMTP |
| `Username` / `Password` | Credenciais de autenticação no servidor SMTP |
| `SenderAddress` | Endereço de e-mail usado como remetente |
| `SenderName` | Nome exibido como remetente (recomenda-se o mesmo nome da aplicação) |
| `ServerPort` | Porta do servidor SMTP, quando diferente do padrão (`587`) |
| `EnableSsl` | Define se a comunicação usa SSL. Por padrão, é habilitado |
| `ReplyToAddress` | Endereço opcional de resposta (*reply-to*) |

### Opções avançadas (MailKit)

O envio por SMTP usa o **MailKit**, que aceita alguns parâmetros adicionais para casos específicos:

| Parâmetro | Descrição |
|---|---|
| `SecureSocketOption` | Controla o modo de conexão segura: `None`, `Auto`, `SslOnConnect`, `StartTls` ou `StartTlsWhenAvailable`. Quando informado, tem precedência sobre `EnableSsl` |
| `PoolConnections` | Reutiliza conexões SMTP em um *pool* em vez de abrir uma nova a cada envio. Útil em volumes altos |
| `ConnectionKeepAliveSeconds` | Tempo (em segundos) que uma conexão do *pool* é mantida viva. Padrão: `15` |
| `ServerCertificateThumbprint` | *Thumbprint* do certificado esperado do servidor, para fixá-lo (*pinning*) |
| `DangerousAcceptAnyServerCertificate` | Aceita **qualquer** certificado do servidor. Use apenas em ambientes de teste, pois desabilita a validação TLS |

```json
{
  "Email": {
    "Enabled": true,
    "ServerHost": "smtp.suaempresa.com",
    "ServerPort": 587,
    "SecureSocketOption": "StartTls",
    "PoolConnections": true,
    "ConnectionKeepAliveSeconds": 30,
    "Username": "no-reply@suaempresa.com",
    "Password": "sua-senha",
    "SenderAddress": "no-reply@suaempresa.com",
    "SenderName": "Sua Empresa"
  }
}
```

:::caution
`DangerousAcceptAnyServerCertificate` desativa a verificação do certificado TLS e expõe a conexão a
ataques *man-in-the-middle*. Em produção, prefira `ServerCertificateThumbprint` se precisar confiar em um
certificado específico (por exemplo, autoassinado).
:::

### Provedor legado (Legacy)

Instâncias configuradas antes da introdução do MailKit podem ter `Type` definido explicitamente como
`Legacy`. Esse provedor usa a implementação SMTP nativa do .NET e aceita apenas os parâmetros básicos
(`ServerHost`, `ServerPort`, `Username`, `Password`, `SenderAddress`, `EnableSsl`). Nenhuma das opções
avançadas acima está disponível para ele.

:::tip
Não há necessidade de migrar uma instância que já funciona com `Legacy`. Para uma configuração nova,
prefira deixar `Type` em branco (ou defini-lo como `MailKit`) para aproveitar o pool de conexões e as
demais opções avançadas.
:::

## Amazon SES

Para enviar pelo Amazon SES, defina `Type` como `AwsSes`:

```json
{
  "Email": {
    "Enabled": true,
    "Type": "AwsSes",
    "Region": "us-east-1",
    "AccessKey": "...",
    "SecretKey": "...",
    "SenderAddress": "no-reply@suaempresa.com",
    "SenderName": "Sua Empresa"
  }
}
```

:::tip Credenciais na AWS
Em uma instância rodando na AWS, você pode dispensar `AccessKey`/`SecretKey` e usar as credenciais do próprio
ambiente: informe `InstanceProfileRole` (perfil de instância) ou defina `AssumeRoleWithWebIdentity` como
`true`.
:::

## SendGrid

Para enviar pelo SendGrid, defina `Type` como `SendGrid`:

```json
{
  "Email": {
    "Enabled": true,
    "Type": "SendGrid",
    "ApiKey": "...",
    "SenderAddress": "no-reply@suaempresa.com",
    "SenderName": "Sua Empresa"
  }
}
```

:::tip
Para personalizar a **aparência** e os **textos** dos e-mails (logo, cores, notificações), veja
[E-mails e notificações](../personalizacao/emails.md). Esta página trata apenas do **canal de envio**.
:::

## Veja também

* [Configurações do Signer](../settings.md)
* [E-mails e notificações](../personalizacao/emails.md)
