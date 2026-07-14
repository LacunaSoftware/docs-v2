# Configuring Timestamp Authority

When performing a signature with a policy that requires a timestamp integration, you must configure a timestamp authority for your [PkiExpressOperator](https://github.com/LacunaSoftware/PkiExpressPhp/blob/develop/src/PkiExpressOperator.php) class or **any class that inherits from it**.

Use the class [TimestampAuthority](https://github.com/LacunaSoftware/PkiExpressPhp/blob/develop/src/TimestampAuthority.php) to configure the communication with the timestamp provider.

## Using REST PKI's timestamp provider

To use [REST PKI](../../rest-pki/index.md)'s timestamp provider, you need to have the credentials required by the communication between PKI Express and REST PKI. For simplicity, you can use your access token to perform this communication (see this [article](../../rest-pki/requesting-timestamps.md)).

First, create an account into REST PKI [website](https://pki.rest/) and **acquire an access token** in the REST PKI's dashboard. And, configure you application with the following parameters:

```php
$authority = new TimestampAuthority("https://pki.rest/tsp/a402df41-8559-47b2-a05c-be555bf66310");
$authority->setOAuthTokenAuthentication('<place_your_access_token>');
$operator->timestampAuthority = $authority;
```

### Example (PDF signature with timestamp)

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

Read more: [Requesting timestamps to REST PKI](../../rest-pki/requesting-timestamps.md)

## Using a custom timestamp provider

To use a custom configuration you need to have the URL to the provider and the authentication method required for the operation.

Currently, the class `TimestampAuthority` only supports three kinds of authentication:

- User and Password;
- Access Token; and
- Mutual SSL.

First, instantiate the `TimestampAuthority` class with the timestamp provider's URL.

```php
$authority = new TimestampAuthority("<place_timestamp_provider_url>");
```
And for each kind of authentication, you need to use a different method of `TimestampAuthority` class:

### User-Password Authentication

Use the method `setBasicAuthentication()` to configure a user-password authentication:

```php
$authority->setBasicAuthentication('<place_username>', '<place_password>');
```

### Access Token Authentication

Use the method `setOAuthTokenAuthentication()` to configure an access token authentication.

```php
$authority->setOAuthTokenAuthentication('<place_access_token>');
```

### Mutual SSL Authentication

Use the method `setSSLAuthentication()` with the **certificate thumbprint** to configure the mutual SSL authentication.

```php
$authority->setSSLAuthentication('<place_ssl_thumbprint>');
```

:::note
Here, the PKI Express will look into the certificate store of your application for the certificate. It will filter the existing certificates by their thumbprints.
:::

