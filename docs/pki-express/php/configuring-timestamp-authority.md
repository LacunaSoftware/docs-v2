# Configurando uma autoridade de carimbo de tempo

Quando se realiza uma assinatura com um política que exija uma integração com o carimbo de tempo, é preciso configurar uma autoridade de carimbo de tempo para usa classe [PkiExpressOperator](https://github.com/LacunaSoftware/PkiExpressPhp/blob/develop/src/PkiExpressOperator.php) ou **qualquer classe que herda dela**.

Use a classe [TimestampAuthority](https://github.com/LacunaSoftware/PkiExpressPhp/blob/develop/src/TimestampAuthority.php) para configurar a comunicação com o provedor de carimbo de tempo.

## Usando o provedor de carimbo de tempo do REST PKI

Para usar o provedor de carimbo de tempo do [REST PKI](../../rest-pki/index.md), é necessário que configure as credenciais necessárias para a comunicação entre o PKI Express e o REST PKI. Para simplicarmos a integração, é possível utilizar o _access token_ para realizar essa comunicação (veja o [artigo](../../rest-pki/requesting-timestamps.md) para outros tipos de autenticação).

Primeiro, crie um conta no [site](https://pki.rest/) do REST PKI e **adquira um token de acesso** no _dashboad_. E, configure a aplicação com os seguintes parâmetros:

```php
$authority = new TimestampAuthority("https://pki.rest/tsp/a402df41-8559-47b2-a05c-be555bf66310");
$authority->setOAuthTokenAuthentication('<place_your_access_token>');
$operator->timestampAuthority = $authority;
```

### Exemplo (Assinatura de PDF com carimbo de tempo)

```php
// Performing a PAdES signature with timestamp
function configureTimestamp($operator) {
    $authority = new TimestampAuthority("https://pki.rest/tsp/a402df41-8559-47b2-a05c-be555bf66310");
    $authority->setOAuthTokenAuthentication('<place_your_access_token>');
    $operator->timestampAuthority = $authority;
}


// Starting signature
$signatureStarter = new PadesSignatureStarter();
configureTimestamp($signatureStarter);
$signatureStarter->signaturePolicy(StandardSignaturePolicies::PADES_T); // A policy that requires timestamp
...
$signatureStarter->start();


// Completing signature
$signatureFinisher = new SignatureFinisher();
configureTimestamp($signatureFinisher);
...
$signatureFinisher->complete();
```

Leia mais: [Solicitando carimbos de tempo ao Rest PKI](../../rest-pki/requesting-timestamps.md)

## Usando outros provedores de carimbo de tempo

Para usar um provedor diferente, é preciso ter a URL para este provedor e qual método de autenticação ele utiliza para esta operação.

Atualmente, a class `TimestampAuthority` só suporta três tipos de autenticação:

- Usuário e Senha;
- Token de Acesso; e
- SSL mútua.

Primeiro, instancie a class `TimestampAuthority`com a URL do provedor de carimbo de tempo.

```php
$authority = new TimestampAuthority("<place_timestamp_provider_url>");
```

E para cada tipo de autenticação, é preciso utilizar um método diferente da class `TimestampAuthority`:

### Autenticação com Usuário e Senha

Use o método `setBasicAuthentication()` para configurar a autenticação com o usuário e senha:

```php
$authority->setBasicAuthentication('<place_username>', '<place_password>');
```

### Autenticação com Token de Acesso

Use o método `setOAuthTokenAuthentication()` para configurar a autenticação com token de acesso:

```php
$authority->setOAuthTokenAuthentication('<place_access_token>');
```

### Autenticação com SSL Mútua

Use o método `setSSLAuthentication()` com o **thumbprint do certificado** para configurar a autenticação com SSL mútua.

```php
$authority->setSSLAuthentication('<place_ssl_thumbprint>');
```

:::note
Aqui, o PKI Express irá olhar no _storage_ de certificado da aplicação para olhar o certificado deseja. Ele irá filtrar os certificados existentes por seus thumbprints.
:::

