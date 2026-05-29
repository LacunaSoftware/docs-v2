# Signer - Setup on Docker

For Docker-based setup the following image is provided on DockerHub:

<br />
<center>
**[Signer Docker Image](https://hub.docker.com/r/lacunasoftware/signer)**
</center>
<br />

This image requires: 

* A SQL Server Database connection: the database collation must be Latin1_General_100_CI_AI or Latin1_General_CI_AI. 
* Storage (shared between all instances of the image): see BlobStorage settings bellow for further information.
* OIDC Server ([GrantID](../../../../grant-id/index.md)) Cloud or On-Premises.

## Basic Configuration

The container for this image is configured using Environment variables.

Environment variable names must follow the pattern: `Section__Setting`, for instance: for the General section, to
configure the SupportEmailAddress you must set a variable with name: `General__SupportEmailAddress`.

The required settings are presented below.

### Database connection string

Under section **ConnectionStrings**:

* **DefaultConnection**: set the connection string to the database. A typical connection string looks like this:

```
Data Source=SERVER;Initial Catalog=DATABASE;User ID=USERNAME;Password=PASSWORD
```

:::note
If you created the database using advanced features such as log shipping or mirroring, your connection string may be different
:::


Example:

```sh
ConnectionStrings__DefaultConnection=Server=SERVER;Initial Catalog=DATABASE;User ID=USERNAME;Password=PASSWORD;
```

:::note
Most Server endpoints require the following format for the Data Source/Server parameter: 
:::


```sh
tcp:<hostname>,<portnumber>
```

### BlobStorage Section

Defines how the application will store and retrieve files.

See [BlobStorage Configuration](../blob-storage.md) for details and examples of supported services.

### Serilog Section

Defines where application logs will be stored. 

Please see [Serilog Configuration](../serilog.md) for details and examples of supported services.

### Open ID Connect configuration

The section **Oidc** configures the OpenID Connect server, required for user management. A [GrantID](../../../../grant-id/index.md) subscription is required.

You can either use a SaaS subscription on [grantid.com](https://grantid.com/) or run your own instance of GrantID.

* **Authority**: the OIDC authority (e.g. *https://patorum.grantid.com*)
* **ApiEndpoint**: the API endpoint of the OIDC server (e.g. *https://api.grantid.com*)
* **ApiName**: the API scope that will be required on access tokens
* **ClientAppId**: the *client id* of the dashboard app
* **AppId**: the *client id* of the backend app
* **AppSecret**: the *client secret* of the backend app
* **RequireHttps** (optional): set to `false` if the OIDC server does not use HTTPS

See [Configuring a SPA Application page](../../../../grant-id/on-premises/configure-spa-app.md) for instructions on how to obtain these values.

Example:

```sh
Oidc__ApiEndpoint=https://api.grantid.com
Oidc__ApiName=myapp-api
Oidc__AppId=myapp-backend
Oidc__AppSecret=8CqeGeur46k...
Oidc__Authority=https://mysubscription.grantid.com
Oidc__ClientAppId=myapp
Oidc__CpfClaim=cpf
Oidc__CustomScopes=mysub-cpf
```

### PKI Suite

Under section **PkiSuite**:

* **SdkLicense**: your license for the PKI SDK, in Base64 format (**required**)
* **WebLicense**: your license for the Web PKI component in binary (Base64) format. Only required if users will issue certificates on their computers (web issuing procedure)
* **WebBrand**: if you have a custom *setup brand* on Web PKI, set it here

Example:

```sh
PkiSuite__SdkLicense=AxAAzHeWJY9AK...
PkiSuite__WebLicense=ApwBY29uZml1A...
```

### General Configuration

* **SiteUrl**: the URL where the application will be running from.
* **SiteName**: the name of the application.
* **SupportEmailAddress**: the support email which will be included at the bottom of every email sent by the application.

Example: 

```sh
General__SiteUrl=https://signer.myapp.com
General__SiteName=MyApp Signer
General__SupportEmailAddress=support@email.com
```

### Bindings Configuration

* **UseReverseProxy**: set as `true` if the container will be executed behind a reverse proxy or load balancer. It can be omitted otherwise.

```sh
Bindings__UseReverseProxy=true
```

### Email sending

Under section **Email**:

* **Enabled**: by default, email sending is enabled. To disable it, set this setting to `false` and ignore the remainder of this section
* **ServerHost**: hostname of the SMTP server
* **EnableSsl**: by default, the SMTP conversation is performed over SSL. To disable SSL, set this setting to `false`
* **ServerPort**: by default, the SMTP conversation is performed over port 587. Set this setting to use a different port
* **Username** and **Password**: if the SMTP server requires authentication, set these settings
* **SenderAddress**: email address to be used as sender (*from* field)
* **SenderName**: name to be used as the sender name (optional)

Example:

```sh
Email__ServerHost=email-smtp.us-east-1.amazonaws.com
Email__Username=USERNAME
Email__Password=PASSWORD
Email__SenderAddress=no-reply@email.com
Email__SenderName=MYAPPNAME
```

## Additional Configuration

Additional settings can be found at the [Signer Settings page](../../configuracao/settings.md).

## Installation

Pull the latest stable image, configure the required environment variables and run the container. 

:::warning
Start with **only one container** as in the first startup, the database tables will be created (more containers could create a race condition). 
Once the initial startup is complete, you may run as many containers as you want.
:::


## Updating Guidelines

Before updating your container, it is recommended to check the [Changelog](../../../changelog.md) to see what has changed from your 
current version to the latest one available.

If any of the versions included in the update have database model changes ("Updates database model: yes") then you
should procceed carefully as the container will attempt to update the database upon startup.

In this scenario, it is recommended to choose one of the following options:

* Reduce the number of running containers to 1.
* Allow only one container to update the database. This is done by adding the following settings to all but one container:

```sh
General__ProcessBackgroundJobs=false
General__AutoUpdateDatabase=false
```

Finally, to update simply pull the image with tag corresponding to the desired version and run the container.

## See also

* [Signer on-premises](../../index.md)
