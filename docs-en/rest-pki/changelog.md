# Rest PKI changelog

### 1.33.8 (2026-04-07) {#v1-33-8}

Database model update: No

- Update PKI SDK to [2.22.3](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-22-3) With TSL loop validation fix.


### 1.33.7 (2026-03-05) {#v1-33-7}

Database model update: No

- Update PKI SDK to [2.22.2](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-22-2) With T8 PDF tag insert fix.


### 1.33.6 (2025-11-28) {#v1-33-6}

Database model update: No

- Update PKI SDK to [2.21.2](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-21-2)


### 1.33.5 (2025-10-20) {#v1-33-5}

Database model update: No

- Add support to new SERPRO's timestamper oauth protocol
- Add `ArchiveTimestamps` parameter to signature details model


### 1.33.3 (2025-05-02) {#v1-33-3}

Database model update: No

- Add ECDsa signature algorithms decode
- Add DN (Distinguished Name) formatted string to certificate Name model
- Update Lacuna Test sucurity context for development purposes

### 1.33.2 (2023-05-22) {#v1-33-2}

Database model update: No

- Update PKI SDK to [2.13.1](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-13-1)


### 1.33.0 (2023-05-06) {#v1-33-0}

Database model update: No

- Add Cades signature policy: ICP-Brasil Ref. Tempo (CAdES AD-RT) without CRLs


### 1.32.2 (2022-10-01) {#v1-32-2}

Database model update: No

- Improve timestamp requester basic authentication support


### 1.32.1 (2022-09-18) {#v1-32-1}

Database model update: No

- Add support to Serpro timestmamp requester proprietary API protocol


### 1.32.0 (2022-09-12) {#v1-32-0}

- Add XML signature policy (NFe) with SHA-256 digest

Database model update: No


### 1.31.0 (2022-09-04) {#v1-31-0}

- Add user access token digest to API transaction info

Database model update: No


### 1.30.1 (2022-05-09) {#v1-30-1}

Database model update: No

- Update PKI SDK to [2.11.5](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-11-5)


### 1.30.0 (2021-11-28) {#v1-30-0}

Database model update: No

- Add thumbprint SHA-256 property to certificate summary model
- Improve CAdES PKI Brazil AD-RA signature policy
- Update PKI SDK to [2.9.0](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-9-0)


### 1.27.0 (2021-08-31) {#v1-27-0}

Database model update: No

- Add XAdES PKI Brazil AD-RC and AD-RA signature policies
- Update PKI SDK to [2.8.12](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-8-12)

### 1.26.7 (2021-08-02) {#v1-26-7}

Database model update: No

- Add LTV presence check to PadesSignerInfo
- Add PDF marks operation restrictor
- Update PKI SDK to [2.8.10](https://docs.lacunasoftware.com/en-us/articles/pki-sdk/changelog#v2-8-10)

### 1.26.6 (2021-07-16) {#v1-26-6}

Database model update: No

- Update PKI SDK to [2.8.9](../pki-sdk/changelog.md#v2-8-9)

### 1.26.5 (2021-07-08) {#v1-26-5}

Database model update: No

- Add configurable invoice creation database command timeout

### 1.26.4 (2021-07-04) {#v1-26-4}

Database model update: No

- Add vertical align option on PDF marks text elements
- Add more countries IDs support (Argentina, Ecuador, Paraguay and Peru) on PAdES visual representation tag [`{{national_id}}`](./pades-tags)
- Add PAdES visual representation masked CPF and RG tags [`{{br_cpf_masked}} and {{br_rg_numero_masked}}`](./pades-tags)

### 1.26.3 (2021-05-17) {#v1-26-3}

Database model update: No

- Updated PKI SDK to [2.8.7](../pki-sdk/changelog.md#v2-8-7)
- Improved password protected PDF error handler to return status code 422 instead of 500

### 1.26.2 (2021-03-31) {#v1-26-2}

Database model update: No

- Update PKI SDK to [2.8.4](../pki-sdk/changelog.md#v2-8-4)

### 1.26.1 (2021-03-22) {#v1-26-1}

Database model update: No

- Improved permissive policies for validation
- Fixed unhandled exception on the opening of a PAdES signature without a digest value
- Update PKI SDK to 2.8.1

### 1.26.0 (2021-03-11) {#v1-26-0}

Database model update: No

- Added API that opens and validates a certificate

### 1.25.3 (2021-02-10) {#v1-25-3}

Database model update: No

- Disabled refresh transaction count and limits tasks at on-premises instances

### 1.25.2 (2021-02-09) {#v1-25-2}

Database model update: No

- Lengthened refresh transaction count task schedule to every 4 hours

### 1.25.1 (2020-12-15) {#v1-25-1}

Database model update: No

- Added policy "CmsPermissive" for validation of CAdES signatures

### 1.25.0 (2020-12-06) {#v1-25-0}

Database model update: No

- Added "Reason" field on PAdES signatures

### 1.24.3 (2020-09-22) {#v1-24-3}

Database model update: No

- Improved initial page

### 1.24.2 (2020-09-17) {#v1-24-2}

Database model update: No

- Update PKI SDK to [2.7.9](../pki-sdk/changelog.md#v2-7-9)

### 1.24.1 (2020-09-16) {#v1-24-1}

Database model update: No

- Improved "Adobe Reader" validation policy to handle "forbidden signed attribute is present" error
- Update PKI SDK to [2.7.8](../pki-sdk/changelog.md#v2-7-8)

### 1.24.0 (2020-07-09) {#v1-24-0}

Database model update: No

- Added "CertificationLevel" field on PAdES signatures

### 1.23.0 (2020-06-19) {#v1-23-0}

Database model update: No

- Fixed exception that occurs when opening a PAdES signature with the field "SignaturePolicy" without its URI
- Added "CustomSignatureFieldName" field on PAdES signatures
- Update PKI SDK to [2.7.2](../pki-sdk/changelog.md#v2-7-2)

### 1.22.1 (2020-04-22) {#v1-22-1}

Database model update: No

- Improved error handling when the user provides an invalid token

### 1.22.0 (2020-02-28) {#v1-22-0}

Database model update: No

- Add PAdES signature policy without LTV
- Add option "PreserveSignaturesVisualRepresentation" when adding PDF marks
- Add option "TrustUncertifiedSigningTime" on PAdES and CAdES signature validation
- Add validation policy for Adobe Reader signatures
- Add configuration for throttling API requests

### 1.21.1 (2020-02-21) {#v1-21-1}

Database model update: No

- Update PKI SDK to [2.5.5](../pki-sdk/changelog.md#v2-5-5)

### 1.21.0 (2020-01-10) {#v1-21-0}

Database model update: No

- Add a ICP-Brasil CAdES signature policy without CRLs

### 1.20.2 (2019-07-21) {#v1-20-2}

Database model update: No

- Fix high CPU usage problem that occurred on certain conditions
- Improve timestamp scheduling to try requesters marked as unavailable (with less priority)
- Add settings `ProcessBackgroundJobs` and `WatchTimestampRequesters`
- Update PKI SDK to [2.5.2](../pki-sdk/changelog.md#v2-5-2)


### 1.20.1 (2019-07-04) {#v1-20-1}

Database model update: No

- Add PAdES auto positioning directions (`LeftToRight`/`RightToLeft` and `TopDown`/`BottomUp`)
- Add support for Lapp integration (*Lapp* is an Artifact Provider for PKI, used as a CRL proxy)
- Update PKI SDK to [2.5.1](../pki-sdk/changelog.md#v2-5-1)


### 1.20.0 {#v1-20-0}

*No changes (version skipped)*


### 1.19.1 (2019-07-03) {#v1-19-1}

Database model update: No

- Improve maintenance jobs


### 1.19.0 (2019-03-15) {#v1-19-0}

Database model update: No

- Refactored integration with B-Stamper
- Update PKI SDK to [2.2.8](../pki-sdk/changelog.md#v2-2-8)


### 1.18.5 (2019-01-03) {#v1-18-5}

Database model update: No

- Performance improvements on billing (does not affect on-premises installations)


### 1.18.4 (2018-12-11) {#v1-18-4}

Database model update: No

- Improve validations on PAdES and CAdES signature exploring APIs to return status code 422 instead of 500
- Update PKI SDK to [2.2.3](../pki-sdk/changelog.md#v2-2-3)


### 1.18.3 (2018-10-23) {#v1-18-3}

Database model update: No

- Add support for the XML signature standard *Certificación de Origen Digital* (COD),
  from *Asociación Latinoamericana de Integración* (ALADI). For more information, see standard in
  [Spanish](http://www.aladi.org/nsfweb/Documentos/2327Rev2.pdf) or in
  [Portuguese](http://www.mdic.gov.br/images/REPOSITORIO/secex/deint/coreo/2014_09_19_-_Brasaladi_761_-_Documento_ALADI_SEC__di_2327__Rev_2_al_port_.pdf)
- Update PKI SDK to [2.2.2](../pki-sdk/changelog.md#v2-2-2), thus fixing bug on PDF marks rotation


### 1.18.2 (2018-09-26) {#v1-18-2}

Database model update: No

- Fix bugs that prevented correct certificate chain loading on certain scenarios:
  - On CAdES signatures, whenever the last link (to the root CA) could not be automatically constructed
  - On all XML signatures


### 1.18.1 (2018-09-11) {#v1-18-1}

Database model update: No

- Improve Application Insights instrumentation
  - Add support for specifing the AI API key, apart from the instrumentation key


### 1.18.0 (2018-08-13) {#v1-18-0}

Database model update: **Yes**

- Add support for configuring a TSA Policy ID on outgoing timestamp requests
- Update PKI SDK to [2.1.3](../pki-sdk/changelog.md#v2-1-3)


### 1.17.5 (2018-08-01) {#v1-17-5}

Database model update: No

- Fixed bug on Swagger metadata
- Improve users API


### 1.17.4 (2018-07-11) {#v1-17-4}

Database model update: No

- Fixed bug affecting operations performed with security contexts that include PKI Italy
- Improve invoice API


### 1.17.3 (2018-05-24) {#v1-17-3}

Database model update: No

- Add link to the [privacy policy](privacy-policy.md) on the splash screen ([GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) compliance)


### 1.17.2 (2018-05-15) {#v1-17-2}

Database model update: No

- Update Lacuna PKI SDK to 1.20.16, thus:
  - Fix certificate chain filling bug on PAdES


### 1.17.1 (2018-05-09) {#v1-17-1}

Database model update: No

- Update Lacuna PKI SDK to 1.20.15, thus:
  - Improve tolerance for malformed certificates (fixing problems due to recent SERPRO malformed certificates)
  - Update ICP-Brasil intermediate CAs

### 1.17.0 (2018-03-29) {#v1-17-0}

Database model update: No

- Improve dashboard
- General billing improvements


### 1.16.0 (2017-12-12) {#v1-16-0}

Database model update: **Yes**

- Add support for ignoring certificate validation errors due to unknown revocation status
- Add support for enabling Lacuna Test PKI on on-premises instances
- Add configuration of B-Stamper API key
- Improve instrumentation of TSP requests
- Fix bug that caused signatures to fail if the server `catest.lacunasoftware.com` was unreachable
- Fix minor bugs on invoices API


### 1.15.2 (2017-11-20) {#v1-15-2}

Database model update: No

- Add B-Stamp information on response of open signature APIs
- Improve audit package generation to return download link instead of content
- Fix bug on B-Stamping of signatures sent to the open signature APIs
- Fix validation of B-Stamped signatures
- Fix bug on database model update
- Update Lacuna PKI SDK to 1.20.5


### 1.15.1 (2017-11-16) {#v1-15-1}

Database model update: No

- Fix model validation bug that could cause a 400 (BadRequest) response on the PDF marks API

**Known issues:**

- An exception may be thrown during database model update (fixed on 1.15.2)


### 1.15.0 (2017-11-14) {#v1-15-0}

Database model update: **Yes**

- Add B-Stamper integration
- Add invoices APIs and reports
- Improve validations on PAdES signatures API to return status codes 400/422 instead of 500
- Improve Application Insights instrumentation
  - Add UserId field
  - Fix bug that caused some 422 responses to be logged without the ErrorCode field
- Fix frontend bug that suggested that users could update their own CustomerId

**Known issues:**

- An exception may be thrown during database model update (fixed on 1.15.2)


### 1.14.4 (2017-09-29) {#v1-14-4}

Database model update: No

- Add option to export billing report to CSV
- Improve validation of external file URLs passed to the API
- Improve instrumentation
  - Registering API error fields on Application Insights
  - Increase verbosity of log level "Debug"
  - Add events to help diagnosing problems on integration with Web PKI
- Fix bug that could cause several background tasks to remain queued
- Fix bug that caused a (handled) NullReferenceException during system startup
- Fix bug on transaction limit enforcing
- Update Lacuna PKI SDK to 1.19.4


### 1.14.3 (2017-09-17) {#v1-14-3}

Database model update: **Yes**

- Fix compatibility with PostgreSQL (previous 1.14.x versions were not compatible)
- Improve timestamp requester management
- Improve validations on PDF marks API
- Reduce files not used on on-premises installations
- Fix bug that caused timestamp requesters to be marked as unavailable during database update
- Fix bug that caused CA certificates without a CN (common name) field to be displayed incorrectly
- Fix bug on loading of user limits page


### 1.14.2 (2017-09-12) {#v1-14-2}

Database model update: No

- Fix bug that caused successful TSP requests to be logged as failures on Azure Application Insights

**Known issues:**

- Version cannot be installed on PostgreSQL (fixed on 1.14.3)


### 1.14.1 (2017-09-11) {#v1-14-1}

Database model update: No

- ~~Fix bug that caused successful TSP requests to be logged as failures on Azure Application Insights~~ (only really fixed on 1.14.2)

**Known issues:**

- Version cannot be installed on PostgreSQL (fixed on 1.14.3)


### 1.14.0 (2017-09-09) {#v1-14-0}

Database model update: **Yes**

- Add transaction limits (system-wide or per user)
- Add support for admins to block users
- Improve timestamp requester fallback and recovery
- Add various API validations to return status codes 400 and 422 instead of 500
- Add support for admins to manage users' custom intermediate CAs
- Add "Windows Server" option on custom security contexts' additional standard PKIs
- Add warning on dashboard if PKI SDK license is close to expiration
- Improvements on billing report
  - Fix bug on paging buttons
  - Add column with PDF marks
  - Add totals row
- Instrumentation improvements
  - Operations differing only by parameter on route are now unified on application insights
  - Failed TSP requests are now logged as so on application insights
  - API trust parameters (security context and signature policy) are now registered on events
  - Add client lib tracking
- Fix bug that caused sensible settings to be written on the system log
- Fix bug that prevented deletion of timestamp requesters
- Fix name of PAdES tag `{{br_oab_numero}}` (old `{{br_oab_numbero}}` is still supported)

**Known issues:**

- Version cannot be installed on PostgreSQL (fixed on 1.14.3)


### 1.13.3 (2017-09-07) {#v1-13-3}

Database model update: No

- Update Lacuna PKI SDK to 1.19.3 to fix bugs on revocation status checking
- Full validation results now included on certificate authentication completed event
- Improved logs to help diagnostic of trust parameterization errors


### 1.13.2 (2017-08-28) {#v1-13-2}

Database model update: No

- Add proxy configuration


### 1.13.1 (2017-07-28) {#v1-13-1}

Database model update: No

- Minor changes to billing API


### 1.13.0 (2017-07-03) {#v1-13-0}

Database model update: No

- Add new API to add marks to PDFs
- Add support for admins to manage users' custom security contexts
- Improve transactions and events screens


### 1.12.8 (2017-06-27) {#v1-12-8}

Database model update: No

- Fix bug that caused intermediate CAs to be ignored on open/validate signature APIs


### 1.12.7 (2017-06-05) {#v1-12-7}

Database model update: **Yes**

- Fix bug that caused database deadlocks on high load scenarios
- Fix bug that caused errors on recently-created timestampers


### 1.12.6 (2017-06-01) {#v1-12-6}

Database model update: No

- Create app settings TimeToCompleteSignatures and TimeToCompleteAuthentications


### 1.12.5 (2017-05-11) {#v1-12-5}

Database model update: No

- Add optional app setting DefaultTimestampTimeout to customize the default timeout when requesting timestamps
- Improve performance logs
- Update Lacuna PKI SDK to 1.16.7 to improve download logs


### 1.12.4 (2017-05-05) {#v1-12-4}

Database model update: No

- Fix bug that caused execution privileges over the site's folder to be required from the application


### 1.12.3 (2017-05-04) {#v1-12-3}

Database model update: No

- Fix bug on configuration of setting "Is on premises"
- Fix bug on hint of setting "Cryptographic keys"
- Fix bug on open/validate XML signatures API


### 1.12.2 (2017-04-26) {#v1-12-2}

Database model update: No

- Fix bug on certificate authentication with Web PKI


### 1.12.1 (2017-04-26) {#v1-12-1}

Database model update: No

- Fix bug on application startup that could cause double processing of background jobs


### 1.12.0 (2017-04-25) {#v1-12-0}

Database model update: **Yes**

- Add support for issuing timestamps through the REST API
- Add new API to open/validate XML signatures
- Add optional instrumentation with Application Insights
- Add optional app setting "AutoUpdateDatabase" to control whether the application will attempt to auto-update the database
- Add optional app setting "AllowInsecureMaintenance" to allow remote access to maintenance pages through HTTP
- Fix various issues occurring when running multiple instances of the application (high availability scenarios)
- ~~Fix database concurrency issues occurring on high load situations~~ (only really fixed on 1.12.7)
- Fix bug that occurred when the license for the Lacuna PKI SDK was changed
- Update Lacuna PKI SDK to 1.16.6


### 1.11.4 (2017-03-16) {#v1-11-4}

Database model update: No

- Update Lacuna PKI SDK to 1.16.5, thus:
	- Updated ICP-Brasil intermediate CAs
	- Changes on CAdES signature inspection to deal with incorrectly encoded timestamps


### 1.11.3 (2017-02-13) {#v1-11-3}

Database model update: No

- Alter XML policy "Nota Fiscal Eletrônica (NF-e)" to exclude signature elements IDs
- Update Lacuna PKI SDK to 1.16.2
	

### 1.11.2 (2017-01-20) {#v1-11-2}

Database model update: No

- Fix bug on database maintenance page

### 1.11.1 (2017-01-17) {#v1-11-1}

Database model update: No

- Fix bug on upload and download routes


### 1.11.0 (2017-01-17) {#v1-11-0}

Database model update: **Yes**

- Add support for multipart upload of files
- Add support for signing previously uploaded files, files from previous signatures and remote files
- Add support for downloading the signed file on a separate HTTP request ("download link")
- Add support for new PAdES visual representation tags (see [PAdES tags](pades-tags.md))
- Add support for decoding all fields in X.509 names
- Add CAdES policy "Basic Electronic Signature (CAdES-BES) with signing-time and no CRLs"
- Fix bug that prevented system intermediate CAs from taking effect
- Fix bug that resetted the storage service to local everytime the application was restarted
- Update Lacuna PKI SDK to 1.16.0, thus:
	- Improve ICP-Brasil filds. Fields also return null if have default padding value
	- Improve Pades signature to load and validate adbe.pkcs7.sh1 PDF signatures
	- Improve internal downloads
	- Fix TSL UnderSupervision state as a valid state
	- Fix Certificate Store loading delay due certificate chain loading attempt
	- Fix CAdES archive timestamp encode
	- Fix PAdES visual representation empty line
	- Fix PDF marks and PAdES visual representation incorrect positioning in some rotated PDFs
	- Fix exception in some ICP-Brasil fields decode
	- Fix bug occurring in some PDF signatures
	- Fix CAdES complete revocation references attribute order
	- Update italian TSL uri and root


### 1.10.1 (2016-10-01) {#v1-10-1}

Database model update: No

- Add standard PAdES policies "Basic with ICP-Brasil certificates" and "PAdES-T with ICP-Brasil certificates"


### 1.10.0 (2016-09-27) {#v1-10-0}

Database model update: **Yes**

- Add support for performing CAdES detached signatures without uploading the data file
- Improve user management


### 1.9.1 (2016-09-22) {#v1-9-1}

Database model update: No

- Fix bug preventing use of tags `{{signerEmail}}` and `{{issuerCommonName}}` on PAdES visual representation


### 1.9.0 (2016-08-25) {#v1-9-0}

Database model update: **Yes**

- Add support for PDF marks
- Add support to get the encapsulated file when opening a CAdES signature
- Improve billing report


### 1.8.2 (2016-07-19) {#v1-8-2}

Database model update: No

- Fix bug on CAdES co-signatures with timestamp


### 1.8.1 (2016-07-11) {#v1-8-1}

Database model update: No

- Fix bug affecting some signatures of large PDFs
- Update Lacuna PKI SDK to 1.13.1


### 1.8.0 (2016-07-05) {#v1-8-0}

Database model update: No

- Add new API to open/validate CAdES and PAdES signatures
- Add support for new ICP-Brasil PAdES signature policies AD-RB and AD-RT
- Add transaction history report
- Add support for tags `{{signerEmail}}` and `{{issuerCommonName}}` on PAdES visual representation
- Add property BinaryThumbprintSHA256 to CertificateModel
- Add support for creating users without a password (useful for application users)
- Add warning on system status when changing the storage when there are already stored blobs
- Increase maximum API request length to 100 MB
- Fix bug that prevented CAdES co-signatures
- Fix authorization bug on the download route for the security contexts' trusted root certificates
- Update Lacuna PKI SDK to 1.13.0


### 1.7.2 (2016-06-10) {#v1-7-2}

Database model update: No

- Add detection of bad data passed by client applications:
	- Invalid/corrupt PDFs
	- Invalid PAdES visual representation parameters
- Fix bug on security context removal
- Fix bug causing unused ClientSideSignature records to be left behind in the database
- Fix bug that prevented admin users from viewing details of other users' events
- Update Lacuna PKI SDK to 1.12.2 (no bug fixes)


### 1.7.1 (2016-06-03) {#v1-7-1}

Database model update: No

- Fix bug on download of a security context's trusted root certificate


### 1.7.0 (2016-06-03) {#v1-7-0}

Database model update: **Yes**

- Add support for timestamping
- Add support for system-wide security contexts
- Add support for system-wide customized signature policies
- Add support for additional storage options for encrypted temporary files (storing on local filesystem is still supported):
	- Microsoft Azure Blob Storage
	- Amazon S3
- Add support for admins to generate access tokens for other users
- Add support for admins to view other users' events ("history")
- Add support for ICP-Brasil certificate fields "RG" and "OAB"
- Update Lacuna PKI SDK to 1.12.1, thus:
	- Add support for certificates with rare alternative SHA-1 with RSA signature algorithm OID (1.3.14.3.2.29)


### 1.6.4 (2016-05-05) {#v1-6-4}

Database model update: **Yes**

- Store temporary encrypted files on local temp directory instead of storing on binary columns in the database
	- This change was done due to performance issues. The next release will add support for other storage options.


### 1.6.3 (2016-05-02) {#v1-6-3}

Database model update: **Yes**

- Add support for customization of culture, format and time zone of the signing time in PAdES visual representation
- Update Lacuna PKI SDK to 1.12.0, thus:
	- Fix bug on encoding of ASN.1 structure AlgorithmIdentifier which caused the field "parameters" to be omitted instead
	  of being filled with the NULL value
	- No longer using the iTextSharp AGPL-licensed library
	- Fix bug on certificate revocation status validation which caused a stack overflow on rare OCSP validation scenarios
	- Fix bug on CRL decoding when the ReasonCode is present
	- Improve messages for certificate revocation status validation
	- Fix issue affecting validation of XML signatures having namespace declarations on the Signature element
	- Fix issue affecting positioning of PAdES visual representations in specific several-signers scenarios
	- Add ICP-Brasil trusted root "v5"


### 1.6.2 (2016-04-18) {#v1-6-2}

Database model update: No

- Add support on PAdES visual representation for specifying a container inside the signature rectangle on which to place the text


### 1.6.1 (2016-02-22) {#v1-6-1}

Database model update: No

- Fix bug causing delay on database access when running on Microsoft Azure


### 1.6.0 (2016-01-21) {#v1-6-0}

Database model update: **Yes**

- Add support for XML signatures (XmlDSig/XAdES)
- Update Lacuna PKI SDK to 1.9.0, thus:
	- Improve certificate validation to check the PathLenConstraint extension


### 1.5.1 (2015-11-24) {#v1-5-1}

Database model update: No

- Aesthetic changes only


### 1.5.0 (2015-11-23) {#v1-5-0}

Database model update: **Yes**

- Add support for CAdES signatures
- Add transaction register (for future billing)
- Add support for Lacuna PKI SDK licenses with use restricted to REST PKI
- Improve removal of expired signature processes
- Update Lacuna PKI SDK to 1.8.0, thus:
	- Modify behavior of decoding of ICP-Brasil certificate fields to decode fields regardless of whether the
	  certificate appears to be an ICP-Brasil certificate or not
	- Modify behavior of decoding of CompanyName ICP-Brasil certificate field to return the company name when the certificate is
	  a ICP-Brasil company (PJ) certificate (previously the property only worked for ICP-Brasil application certificates)
	- Add support for ICP-Brasil CPF field on "OU" field of subject name having a space after the colon ("OU=CPF: xxxxxxxxxxx")

	
### 1.4.3 (2015-11-06) {#v1-4-3}

Database model update: No

- Aesthetic changes only


### 1.4.2 (2015-11-06) {#v1-4-2}

Database model update: No

- Aesthetic changes only


### 1.4.1 (2015-10-21) {#v1-4-1}

Database model update: No

- Aesthetic changes only


### 1.4.0 (2015-10-21) {#v1-4-0}

Database model update: No

- Add support on PAdES visual representation for horizontal text alignment to the right
- Set site culture to pt-BR (affects PAdES visual representation)
- Fix bug on PAdES signatures


### 1.3.1 (2015-10-14) {#v1-3-1}

Database model update: No

- Improve logging to file so as to prevent indefinite file growth
- Add information about the Lacuna PKI SDK license on the system status screen
- Fix minor issue on javascript when Google Analytics is not being used
- Fix minor issue on log test dialog
- Update Lacuna PKI SDK to 1.6.0, thus:
	- Fix bug on logging which caused the "source" argument to have an incorrect value

### 1.3.0 (2015-10-13) {#v1-3-0}

- First version released publicly
- Main features on this version:
	- Certificate authentication
	- PAdES signatures
