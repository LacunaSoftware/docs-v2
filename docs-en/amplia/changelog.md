# Amplia changelog

## 4.22.0 (next version) {#vnext}

Updates database model: no

### Improvements

AMP-390 Configuration to issue CA certificates with random serial number



## 4.21.0 (2025-04-16) {#v4-21-0}

Identical to: 4.21.0 RC 2 (2026-01-27)

Updates database model: no

### New features

AMP-386 Implement AES encryption and decryption on the Kryptus key store

### Improvements

AMP-387 Allow inclusion of CEI INSS and PIS/PASEP number data in ICP-Brasil certificates

### Bug fixes

AMP-388 Error "Cannot issue certificate with a start date prior to the CA certificate validity period" when issuing a certificate with a newly created CA

AMP-389 The key generation API in the managed certificate issue process results in an error if the certificate holder's name contains commas



## 4.20.0 (2026-01-14) {#v4-20-0}

Identical to: 4.20.0 RC 1 (2026-01-07)

Updates database model: **yes**

### Improvements

AMP-384 Improvements to the PKCS #11 key store relevant to highly concurrent environments and improvements to the IDN computation API

### Bug fixes

AMP-385 Raw IDN is recorded on IdnComputed event details



## 4.19.0 (2026-01-07) {#v4-19-0}

Identical to: 4.19.0 RC 2 (2025-11-17)

Updates database model: no

### Bug fixes

AMP-355 Certificates can be issued with a start date prior to that of the issuer



## 4.18.0 (2025-11-12) {#v4-18-0}

Updates database model: no

### Improvements

AMP-378 Handle key store partitions that are locked prematurely



## 4.17.1 (2025-11-05) {#v4-17-1}

Updates database model: no

### Improvements

AMP-377 Command `check-key-store-partitions-lock` to check partitions' lock status



## 4.17.0 (2025-11-05) {#v4-17-0}

Identical to: 4.17.0 RC 4 (2025-09-29)

Updates database model: **yes**

### Improvements

AMP-243 Delete keys from incomplete managed certificate issue processes

AMP-376 Add order numbers to the partition purge confirmation



## 4.16.0 (2025-09-19) {#v4-16-0}

Updates database model: no

### New features

AMP-374 Command `repair-blobs` to repair corrupted blobs



## 4.15.1 (2025-09-08) {#v4-15-1}

Identical to: 4.15.1 RC 4 (2025-09-03)

Updates database model: no

### Bug fixes

AMP-373 Errors on command `check-blobs`



## 4.15.0 (2025-09-01) {#v4-15-0}

Updates database model: no

### New features

AMP-328 Form for creating a Brazilian Student ID Card \(CIE\) order

AMP-372 Command `check-blobs` to check blob integrity



## 4.14.0 (2025-08-12) {#4-14-0}

Identical to: 4.14.0 RC 2 (2025-08-12)

Updates database model: no

### New features

AMP-365 Pending signature after managed certificate is issued

### Improvements

AMP-366 Changes to SSL/TLS certificates to comply with CA/B Forum guidelines

AMP-369 Phone number validation configuration

### Bug fixes

AMP-368 Phone numbers starting with `+1 (305)` are rejected as not being mobile phone numbers



## 4.13.0 (2025-07-23) {#4-13-0}

Identical to: 4.13.0 RC 4 (2025-05-30)

Updates database model: no

### Improvements

AMP-363 Allow sending issue procedure verification codes through WhatsApp

AMP-364 More flexible phone number validation

AMP-367 Add \(experimental\) support to Prometheus integration



## 4.12.0 (2025-07-23) {#4-12-0}

Identical to: 4.12.0 RC 2 (2025-02-03)

Updates database model: no

### Improvements

AMP-325 Improve and unify Distinguished Name forms

AMP-360 Adjustments to PY certificates with type Sello



## 4.11.0 (2025-01-22) {#4-11-0}

Identical to: 4.11.0 RC 2 (2024-11-06)

Updates database model: no

### Improvements

AMP-359 Add url argument `absoluteUrl` on get signed agreement API

AMP-361 Improvements to SMS provider integration



## 4.10.0 (2024-10-24) {#4-10-0}

Identical to: 4.10.0 RC 4 (2024-09-13)

Updates database model: no

### Improvements

AMP-318 Allow creation of organizational certificates through web page

AMP-356 Adjustments on Unique Identifier and Organization Identifier fields of CV certificates



## 4.9.0 (2024-08-13) {#4-9-0}

Identical to: 4.9.0 RC 11 (2024-05-10)

Updates database model: **yes**

### New features

AMP-340 Health check with optional key availability check

AMP-342 CRL consistency checks

AMP-347 Docker image with Kryptus PKCS #11 driver

AMP-352 Key store clusters

### Improvements

AMP-335 Update SPA framework to version 2.8

AMP-345 Allow uploading chain certificates to CAs regardless of their *CertificateChainType*

AMP-346 Improve client lib to allow downloading the CA's certificate and chain file

### Bug fixes

AMP-237 A timezone-related error may occur on Linux and Docker when generating an agreement

AMP-343 Errors when using PKCS #11 key stores in parallel

AMP-351 Error "Could not place a lock on the resource 'hangfire:lock:recurring-job:CleanupUsedOtps'" when starting up app using PostgreSQL



## 4.8.1 (2024-04-30) {#4-8-1}

Updates database model: no

### Bug fixes

AMP-350 Error "Cannot write DateTime with Kind=UTC..." when creating certificate order using PostgreSQL



## 4.8.0 (2024-02-27) {#4-8-0}

Identical to: 4.8.0 RC 5 (2024-02-27)

Updates database model: **yes**

### New features

AMP-332 IDN computation API (Brazilian biometric service provider protocol)

AMP-333 Add support for AES keys (for now only on PKCS #11 and database key stores)

### Improvements

AMP-245 Improve handling of managed certificates operation session expiration

AMP-337 Allow configuration of token label on PKCS #11 key stores

### Bug fixes

AMP-341 Integer overflow when a high `CertificateManagement:OperationSessionTimeout` is set \(25+ days\)



## 4.7.0 (2023-12-20) {#4-7-0}

Identical to: 4.7.0 RC 2 (2023-11-01)

Updates database model: no

### New features

AMP-334 New API to issue software certificates returning private key in multiple formats

### Improvements

AMP-331 Improve Amplia Reg integration for organizational certificates



## 4.6.1 (2023-09-06) {#4-6-1}

Updates database model: no

### Improvements

AMP-326 Improved integration with Dinamo HSMs

### Bug fixes

AMP-322 Forbidden characters are not automatically removed on BR certificates

AMP-324 Error *JsonReaderException: Bad JSON escape sequence*



## 4.6.0 (2023-08-30) {#4-6-0}

Updates database model: no

### New features

AMP-315 SSH access on Docker image

AMP-320 API to decrypt with key

AMP-321 PKCS #8 key import  \(currently only supported on database key stores\)

### Improvement

AMP-327 Add support for environment variable `STANDBY` \(for Azure App Service setup\)



## 4.5.4 (2023-08-04) {#4-5-4}

Updates database model: no

### Improvements

AMP-311 Update SMS package to allow configuring a `MessagingServiceSid` for Twilio provider



## 4.5.3 (2023-08-04) {#4-5-3}

Updates database model: no†

*† This update does not introduce new changes to the database but does change the way previous changes are applied*

### Bug fixes

AMP-319 Some past migrations cannot be applied to SQL Server older than 2017 due to the usage of `TRIM()`



## 4.5.2 (2023-07-05) {#4-5-2}

Updates database model: no

### Bug fixes

AMP-310 OTP authentication date queries are not forwarded to Dinamo key stores (introduced on [v4.4.0](#4-4-0))



## 4.5.1 (2023-06-29) {#4-5-1}

Updates database model: no

### Bug fixes

AMP-309 Empty strings on SubjectName cause error when issuing the certificate \(SSL and Custom certificates\)



## 4.5.0 (2023-06-14) {#4-5-0}

Updates database model: no

### Improvements

AMP-306 Add property `ExtendedKeyUsageCritical` to custom certificates



## 4.4.0 (2023-06-02) {#4-4-0}

Updates database model: **yes**

### New Features

AMP-279 Managed certificates listing and details

AMP-295 Add support for multiple policies on templates

AMP-299 Add NTP synchonization


### Improvements

AMP-253 CA configuration to issue certificates with link to .p7b file ("certs-only" CMS with entire chain)

AMP-303 CA certificate template configuration

AMP-304 Allow customization of the digest algorithm when creating an order

AMP-305 Add translations of the identification number informed by PMCert



## 4.3.0 (2023-05-19) {#4-3-0}

Updates database model: **yes**

### New Features

AMP-293 Add button on order details to issue order with a CSR

AMP-294 Add field `CustomCertificateParameters.IncludeSubjectKeyId`

AMP-297 Allow customization of home page

AMP-301 Add support for configuring a webhook to get notifications when a certificate is issued

### Improvements

AMP-296 Add support for storing blobs in a database



## 4.2.0 (2023-04-17) {#4-2-0}

Updates database model: **yes**

### New Features

AMP-290 Criar comando para propagar CA Certs

### Improvements

AMP-278 Melhorar tratamento de erro ao tentar copiar ID de CA/Template

AMP-292 Pemitir forçar algoritmo de assinatura de certificados por AC

### Bug fixes

AMP-291 APIs de emissão de certificado em nuvem não permitem que o Amplia fique em rede privada



## 4.1.0 (2023-03-02) {#4-1-0}

Updates database model: **yes**

### New features

AMP-283 Issue certificate without a CSR, returning a PKCS #12 (PFX) file

### Improvements

AMP-273 Add support for PostgreSQL

AMP-281 Allow using "S3 clones" as blob storage

AMP-284 Add fields `RetentionPeriodYears` and `LegislationCountries` to SSL certificates

AMP-285 Accept IPv4 and IPv6 on SSL certificate `DnsNames` field

AMP-287 Refactor *fatura electrónica* certificates (CV)

AMP-288 Encoding identification number as Unique Identifier X.520 field on CV signature certificates



## 4.0.4 (2023-02-03) {#v4-0-4}

Updates database model: no

### Bug fixes

AMP-286 Extension ExtendedKeyUsage on PY certificates is not marked as critical



## 4.0.3 (2023-01-31) {#v4-0-3}

Updates database model: no

### Bug fixes

AMP-280 Error while generating issue QR Code when running on Docker



## 4.0.2 (2023-01-09) {#v4-0-2}

Updates database model: no

### Improvements

AMP-277 Show ID on CA and Template details page



## 4.0.1 (2022-12-30) {#v4-0-1}

Updates database model: no

### Improvements

AMP-276 Improve Dinamo HSM integration



## 4.0.0 (2022-12-27) {#v4-0-0}

**See [Update Amplia from 3.x to 4.0](on-premises/update-40.md)**

Updates database model: **yes** (see [warning](on-premises/update-40.md))

### New features

AMP-220 New APIs to support [Lacuna PSC](../psc/index.md)

AMP-268 Cape Verde certificates

AMP-252 Updated Paraguay certificate profiles

AMP-249 Proprietary [Kryptus HSM](on-premises/key-stores/kryptus.md) integration

AMP-271 OCSP domain configuration

### Improvements

AMP-272 Update ASP.NET Core to version 6.0

AMP-258 Add support for .conf/.ini configuration file

AMP-261 Create missing indexes over orders and certificates

AMP-265 Add field SerialNumber on custom CSR issue page

AMP-267 Creation of order with predefined serial number for the certificate

AMP-270 Add support for multiple certificate policies on a single certificate

AMP-274 Generate "quasi-sequential" GUIDs to improve database performance

AMP-275 Add specific configuration for OCSP domains

### Bug fixes

AMP-269 Latest CRL is not found if the CA name contains uppercase letters



## 3.15.2 (2022-10-10) {#v3-15-2}

Improvements:

* [AMP-262] - Optimize CRL issuing in scenarios with several CAs (1000+)

Bug fixes:

* [AMP-263] - Azure Key vault communication does not reuse connections

Updates database model: no



## 3.15.1 (2022-09-23) {#v3-15-1}

Improvements:

* [AMP-254] - Optimized job queue monitoring
* [AMP-255] - Optimized CRL and CA Issuers access routes
* [AMP-257] - Add support for "EmailDump" SMS provider

Updates database model: no



## 3.15.0 (2022-06-13) {#v3-15-0}

New Features:

* [AMP-239] - Brazilian Labor Relations Certificate

Improvements:

* [AMP-240] - Add options on brazilian certificate APIs to normalize the Common Name field (CN=) and add the CPF/CNPJ suffix to it

Updates database model: no



## 3.14.0 (2022-04-29) {#v3-14-0}

New Features:

* [AMP-232] - PKI Paraguay certificates
* [AMP-112] - Add support for "generic" order creation
* [AMP-218] - Integration with Kryptus HSM through PKCS #11
* [AMP-233] - Allow specifying PKCS #11 keys by label
* [AMP-226] - UI for generating a CSR specifying a custom subject name
* [AMP-227] - UI for registering and existing key
* [AMP-225] / [AMP-216] - Allow creation of pending certificates \(having a future validity start\)
* [AMP-228] - CRL and CA certificate propagation

Improvements:

* [AMP-229] - Show validity start and end on certificate details
* [AMP-231] - Localization \(l10n\) for Spanish \(en\)

Updates database model: **yes**


## 3.13.2 (2021-12-16) {#v3-13-2}

Bug fixes

* [AMP-224] - Keys stored on Database Key Store do not work after migration to a different environment

Updates database model: no


## 3.13.1 (2021-12-05) {#v3-13-1}

New Features

* [AMP-207] - Add support for Google KMS Key Store
* [AMP-222] - Add support for Amazon KMS Key Store
* [AMP-208] - Add support for OCSP responses
* [AMP-210] - Add Latinus (Ecuador corporate CA) certificate template

Improvements

* [AMP-223] - Add safe timespan threshold on end-entity certificates validity start

Updates database model: no


## 3.12.0 (2021-04-27) {#v3-12-0}

New Features

* [AMP-206] - Add support for AWS S3 blob storage

Updates database model: **yes**


## 3.11.0 (2021-03-25) {#v3-11-0}

Improvements

* [AMP-204] - Configuration `Amplia__IssueProcedureConfirmationEnabled` to disable SMS confirmation during issue procedure
* [AMP-205] - Providing internationalized issue links according to the API request language

Updates database model: no


## 3.10.2 (2021-03-21) {#v3-10-2}

Improvements

* [AMP-201] - Add support for SMS providers Zenvia and SmsEmpresa

Bug fixes

* [AMP-203] - Error when generating issue QR Code

Updates database model: no


## 3.10.1 (2021-03-15) {#v3-10-1}

Bug fixes:

* [AMP-200] - Error when issuing end-user certificate on cryptographic device

Updates database model: no


## 3.10.0 (2021-02-08) {#v3-10-0}

New Features:

* [AMP-195] - Add support for optional hard deletion of keys on Azure Key Store

Improvements:

* [AMP-196] - Allowing deletion of keys of revoked CAs

Bug fixes:

* [AMP-198] - When revoking a CA certificate and choosing for the CA to also be deactivated, the CA was actually deleted
* [AMP-197] - Broken messages on CA activation dialog

Updates database model: no


## 3.9.6 (2020-11-26) {#v3-9-6}

Improvements:

* [AMP-184] - Add configuration to hide "powered by" information
* [AMP-187] - Allow user order creation API to be called for an existing user without filling the `subject` field

Bug fixes:

* [AMP-183] - Order creation results in error if invalid email is inputted
* [AMP-188] - On the agreement signature, the *I agree* checkbox cannot be checked on certain screen resolutions
* [AMP-189] - Errors when using `EcuadorBce` templates
* [AMP-190] - Errors when listing CA certificates after removing keys used by CAs
* [AMP-191] - Birth date is incorrectly pre-filled on the user order creation page if the user already exists

Updates database model: no


## 3.9.5 (2020-10-20) {#v3-9-5}

Bug fixes:

* [AMP-182] - Depending on the user machine's system clock, the issue procedure immediately fails reporting expired session

Updates database model: no


## 3.9.4 (2020-10-08) {#v3-9-4}

Bug fixes:

* [AMP-186] - Recurring errors on CRL issuing

Updates database model: no


## 3.9.3 (2020-09-30) {#v3-9-3}

Bug fixes:

* [AMP-185] - Error sending SMS messages using TotalVoice provider

Updates database model: no


## 3.9.2 (2020-09-03) {#v3-9-2}

Improvements:

* [AMP-181] - Add new themes
  * *Metallic seaweed & Emerald* (`mse`)
  * *Oxford blue & Green* (`obg`)
  * *Castleton green & Orange* (`cgo`)
  * *Viridian green & Yellow* (`vgy`)

Bug fixes:

* [AMP-179] - Issuing QR Code not working when `QRCodeGatewayUrl` is not configured
* [AMP-180] - Application keys page does not load


Updates database model: no


## 3.9.1 (2020-08-05) {#v3-9-1}

* Bug fix: [AMP-178] - Blank page when returning from login on Internet Explorer

Updates database model: no


## 3.9.0 (2020-08-04) {#v3-9-0}

New features:

* [AMP-154] - Issue certificates in compliance to Ecuador's Banco Central format

Improvements:

* [AMP-168] - Refactor CRL issuing procedure to improve performance on cases with hundreds or thousands of CAs
* [AMP-161] - Update Angular to version 9

Updates database model: **yes**


## 3.8.4 (2020-07-22) {#v3-8-4}

* [AMP-177] - Add *Dark cerulean & Green* (`dcg`) theme

Updates database model: no


## 3.8.3 (2020-07-21) {#v3-8-3}

* [AMP-173] - Don't generate preemptively certificate agreement file when providing access link on API
* Bug fix: [AMP-174] - Issue certificate page stays loading indefinitely

Updates database model: no


## 3.8.2 (2020-07-10) {#v3-8-2}

* Bug fixes
  * [AMP-175] - Information application logs are being logged by default on Linux and Docker
  * [AMP-176] - Subject agreement signature package filename is not internationalized

Updates database model: no


## 3.8.1 (2020-06-24) {#v3-8-1}

* Bug fix: upon accepting suggestion to issue certificate on mobile, QR Code is not shown

Updates database model: no


## 3.8.0 (2020-06-24) {#v3-8-0}

* Implement soft deletion of certificate ortders
* Add API to update certificate orders
* Improve user experience upon accessing on a PC the issue page for a certificate order that can only be issued on a mobile device
* Bug fix: Application is allowing a fulfilled certificate order to be deleted

Updates database model: **yes**


## 3.7.5 (2020-06-23) {#v3-7-5}

* Optimize job history storage
* Add argument `--heavy` to command [update-db](on-premises/tool/update-db.md)

Updates database model: no


## 3.7.4 (2020-06-19) {#v3-7-4}

* Bug fixes
  * EventLog log provider causing errors on Azure App Service
  * Too many enqueued jobs for CRL issuing could cause database connection exaustion

Updates database model: no


## 3.7.3 (2020-06-05) {#v3-7-3}

* Add *Green & Dark coral* (`gdc`) theme
* Bug fix
  * App client config API field `SmsEnabled` is wrongly filled with false in certain scenarios

Updates database model: no


## 3.7.2 (2020-06-03) {#v3-7-2}

* Remove diacritics from SMS messages

Updates database model: no


## 3.7.1 (2020-05-21) {#v3-7-1}

* Improve phone and user order labels

Updates database model: no


## 3.7.0 (2020-05-06) {#v3-7-0}

* Add support for PIN-protecting keys on Dinamo HSMs
* Add filter by `keyMedia` on list pending certificates for user API
* Add themes *eva*, *dir* and *cam*

Updates database model: no


## 3.6.0 (2020-05-01) {#v3-6-0}

* Add Dinamo HSM integration via proprietary API

Updates database model: no


## 3.5.0 (2020-04-14) {#v3-5-0}

* Migrated to ASP.NET Core 3.1 (LTS release, supported until December 2022)

See [Update Amplia from 3.0-3.4 to 3.5](on-premises/update-35.md)

Updates database model: no


## 3.4.0 (2020-03-27) {#v3-4-0}

* Add support for digitally signing the Certificate Agreement containing the subject's public key during the issue procedure
* Add birth date to PKI Brazil (ICP-Brasil) order creation page
* Add command [gen-enc-key](on-premises/tool/gen-enc-key.md)
* Setting `General.QRCodeGatewayUrl` is now optional
* Bug fixes
  * The logo image should not be a link on the certificate issue page
  * Error when trying to edit an attribute certificate template
  * Initial message on certificate issue page does not change upon changing the language
  * QR Code is not being displayed when clicking the *Issue QR Code* button on the order details page

Updates database model: **yes**


## 3.3.0 (2019-03-17) {#v3-3-0}

* Add support for configuring a custom *certification policies* extension on templates
* Add new user role: *Registration Agent* (can only create certificate orders and revoke certificates)
* Full theming support (except customization of the home page)
* Add option to hide buttons for basic order creation or user order creation
* Bug fixes
  * On certain scenarios certificates might be issued with 0 day validity
  * Error when creating order certificate without a template
  * Error "You cannot specify the root subscription" upon entering the system administration 
  * Logo is not shown on invitation emails

Updates database model: **yes**


## 3.2.0 (2019-03-10) {#v3-2-0}

* Dashboard internationalized (English and Portuguese)
* Add support for storing end-user keys with PIN protection ("cloud HSM")
* Add support for creating certificate orders associated with user accounts
* CA name is now suggested based on the selected key
* Allow empty organizational units field during CA Certificate issuing and root CA creation
* Add partial support for theming (only affects emails for now)
* Add command [test-email](on-premises/tool/test-email.md)
* Bug fixes
  * Validity field was shown during order creation even when the selected template did not allow a custom validity
  * Initialization errors were not shown on dashboard

Updates database model: **yes**


## 3.1.0 (2019-02-22) {#v3-1-0}

* OpenID Connect integration is now optional
* Add [command-line tool](on-premises/tool/index.md) with:
  * Command [update-db](on-premises/tool/update-db.md) to manually update the database
  * Command [hash-root-pass](on-premises/tool/hash-root-pass.md) to compute a salted hash for a given root password
* Default subscription is now created on first run
* Fix bug that caused settings on JSON configuration file to have precedence over environment variables (which should have top precedence)

Updates database model: no


## 3.0.0 (2019-02-06) {#v3-0-0}

* Dashboard entirely redesigned
* Add support for performing operations on the dashboard that before had to be done via API:
  * Certificate template management
  * Creation of CAs that issue attribute certificates
* Add [support for Docker](on-premises/docker/index.md)
* Changed logging on Linux to write logs on the systemd journal ([click here for details](on-premises/linux/troubleshoot/check-logs.md))
* Improve end-user PK certificate profile, adding extension AuthorityKeyIdentifier

Updates database model: **yes**

Configuration changes: see [Update Amplia from 2.16 to 3.0](on-premises/update-30.md)


## 2.16.1 (2019-12-12) {#v2-16-1}

* Add option to configure an alias for the identity type on the *PrivateID* certificate template

Updates database model: no


## 2.16.0 (2019-12-10) {#v2-16-0}

* Add attribute certificate type *PrivateID*

Updates database model: no


## 2.15.2 (2019-12-04) {#v2-15-2}

* Changed Linux configuration template to log to */var/log/amplia* directory

Updates database model: no


## 2.15.1 (2019-09-12) {#v2-15-1}

* Improve PK certificate type *Cnb* (customer-specific)

Updates database model: no


## 2.15.0 (2019-08-10) {#v2-15-0}

* Add [support for Linux](on-premises/linux/index.md)
* Add database key store
* Add support for storing blobs on local file system
* Add support for SMS provider [TotalVoice](https://www.totalvoice.com.br/)
* Add certificate type information (A1/A3) to PKI Brazil (ICP-Brasil) certificates
* Improve certificate order creation page
* Scalability improvement: data protection keys are now stored on the database
* Security improvement: add support for encrypting data protection keys (required to use the new database key store)
* Bug fixes
  * Fix race condition that allowed two certificates to be issued for the same order
  * Fix validation bug that allowed an order to be created without a `validityEnd` with a template without a default validity

Updates database model: **yes**

Configuration changes:
* `General:EncryptionKey`: optional (for backward compatibility), but highly recommended to fill this setting with an encryption key
  (see key generation instructions for [Windows](on-premises/windows/install.md#encryption-key-generation) or [Linux](on-premises/linux/install-ubuntu.md#encryption-key-generation))

{/* TODO: add link to EncryptionKey generation instructions */}


## 2.14.1 (2019-06-13) {#v2-14-1}

* Bug fixes
    * Textual search in certificates and orders was not working with partial terms.
    * Fixed error while trying to revoke attribute certificate.

Updates database model: no

Configuration changes: none

## 2.14.0 (2019-06-11) {#v2-14-0}

* Interface to view and unlock blocked orders
* Order creation screen tailored to order CA, Template and mobile phone.
* Temporarily disabled order edition 

Updates database model: no

Configuration changes: none

## 2.13.0 (2019-05-09) {#v2-13-0}

* Added possibility to configure emails sent by system (theme and pictures)
* Created API for sending SMS with link for issuing certificate 
* Added `KeyMediaConstraints` field in `OrderModel`

Updates database model: no

Configuration changes:
* `General:Theme` (optional)
    * Valid values: empty (standard) or `Teal`

## 2.12.1 (2019-04-18) {#v2-12-1}

* PKI SDK updated to version [2.4.0]
(https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-4-0)
* Bug fixes
    * SSL certificates do not allow wildcard use
    * Accumulation of jobs of CRL emission when the emission is impossible for long time

Updates database model: no

Configuration changes: none

## 2.12.0 (2019-03-21) {#v2-12-0}

* Certificate issue on mobile

Updates database model: no

Configuration changes:

* `General:SmsContextInfo` (optional)
    * Allows you to configure a string to be used as "context" information in SMS sent by the system, for example: "Link for issuing your certificate on *platform X*:..." (in this example, the configuration value would be `in platform X`)
* Optional settings for custom mobile application usage (standard all empty settings)
    * `PkiSuite:MobileAppName`
    * `PkiSuite:MobileAppCodeSuffix`
    * `PkiSuite:MobileIOSStoreUri`
    * `PkiSuite:MobileAndroidStoreUri`

## 2.11.1 (2019-02-26) {#v2-11-1}

* Added validation of email address in the creation of ICP-Brasil type certificate requests (PKIBrazil)
* PKI SDK updated to version [2.3.0]
(https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-3-0) (RTM)

Updates database model: no

Configuration changes: none

## 2.11.0 (2019-02-15) {#v2-11-0}

* Added certificate support for blockchain [IBMHyperledger]
(https://www.ibm.com/blockchain/hyperledger)
* Added elliptic curves support (ECC)
    * Certificate Issuing with ECC key
    * ECC key storage in Azure Key Vault -- supported curves:
        * P-256 (secp256r1)
        * P-256K (secp256k1)
        * P-384 (secp384r1)
        * P-521 (secp521r1)
* PKI SDK updated to version [2.3.0]
(https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-3-0) (beta 3)

Updates database model: no

Configuration changes: none

## 2.10.3 (2019-01-21) {#v2-10-3}

* Improvements to SMS sending configuration
* PKI SDK updated to version [2.2.6]
(https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-2-6)

Updates database model: no

Configuration changes:

* `SMS:Type` (optional)
    * Sets the sending SMS provider
    * Valid values: empty (standard) or `Twilio` (support will be added in the future for other providers)
    * If the configuration is omitted, the value `Twilio` (for backward compatibility)
* New Twilio settings: you can specify `SMS:AccountSid` and `SMS:AuthToken` instead of specifying `SMS:TwilioBasicCredential`
    * The old configuration `SMS:TwilioBasicCredential` is still supported for backward compatibility

## 2.10.2 (2019-01-17) {#v2-10-2}

* ASP.NET Core updated to 2.2
* New setting file for IIS (appsettings.iss.json)
* Fixed encoding of the role information on certificate type 6

Updates database model: no

Configuration changes: none

## 2.10.1 (2019-01-14) {#v2-10-1}

* Fixed bug that caused certificate issue error when Web PKI was not installed

Updates database model: no

Configuration changes: none

## 2.10.0 (2019-01-10) {#v2-10-0}

* First version available to install *on-premises* 


