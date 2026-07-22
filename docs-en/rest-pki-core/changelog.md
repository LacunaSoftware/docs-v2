---
slug: /rest-pki/core/changelog
sidebar_label: "Changelog"
sidebar_position: 5
---

# Rest PKI Core changelog
{/* <a name="vnext" /> */}

### 4.3.2 (2026-07-13) {#v4-3-2}

Updates database model: no

* Bug fixes

  * [RPNG-770] Replayed certificate-authentication requests were not reported with a distinct nonce-reuse error

### 4.3.1 (2026-07-08) {#v4-3-1}

Updates database model: no

* New features

  * [RPNG-762] Add app setting to disable the minimum request body data rate

* Improvements

  * [RPNG-765] Update to SPA 7.3, adding runtime performance telemetry to Microsoft Application Insights

* Bug fixes

  * [RPNG-766] Fix a rare error that could occur when using the legacy authentication APIs

### 4.2.6 (2026-07-07) [patch] {#v4-2-6}

Updates database model: no

* New features

  * [RPNG-762] Add app setting to disable the minimum request body data rate

### 4.1.7 (2026-07-07) [patch] {#v4-1-7}

Updates database model: no

* New features

  * [RPNG-762] Add app setting to disable the minimum request body data rate

### 4.0.6 (2026-07-07) [patch] {#v4-0-6}

Updates database model: no

* New features

  * [RPNG-762] Add app setting to disable the minimum request body data rate

### 3.4.4 (2026-07-07) [patch] {#v3-4-4}

Updates database model: no

* New features

  * [RPNG-762] Add app setting to disable the minimum request body data rate

### 4.3.0 (2026-06-25) {#v4-3-0}

Updates database model: **yes**

* New features

  * [RPNG-323] [RPNG-681] [RPNG-682] [RPNG-683] Add geolocation capture to biometric sessions

  * [RPNG-419] Add support to Lacuna FaceTecServer 3.0+

  * [RPNG-503] Biometric session page settings

  * [RPNG-574] Per-subscription transaction limits (SysAdmin)

  * [RPNG-594] Biometric identification configuration pages

  * [RPNG-610] Add "Remove logo" button

  * [RPNG-623] [RPNG-711] Add "Reset to system defaults" to each settings section

* Improvements

  * [RPNG-389] [RPNG-722] Improve data-table performance with cursor pagination

  * [RPNG-501] Show FaceTec ID scan OCR data in the dashboard

  * [RPNG-535] Apply transaction limits to all transaction types

  * [RPNG-605] [RPNG-679] Improve dashboard APIs

  * [RPNG-613] Translate biometric enrollment failure messages

  * [RPNG-620] Show PDF/A information on public document validation

  * [RPNG-625] Add display names for new themes

  * [RPNG-641] Update FaceTec browser SDK to v9.7.115

  * [RPNG-649] Show the current subscription name in the toolbar

  * [RPNG-689] Translate the "All organizations" label

* Bug fixes

  * [RPNG-538] "User not found" error when opening User Details

  * [RPNG-644] Application filter on the transactions table had no effect

  * [RPNG-655] Duplicate transaction registered on legacy certificate authentication

  * [RPNG-702] Old face maps were not deleted after continuous-learning authentication


### 4.2.5 (2026-06-24) {#v4-2-5}
 
Updates database model: no

* Improvements

  * [RPNG-716] Update FaceTec SDKs


<a name="v4-2-4" />

### 4.2.4 (2026-04-28) {#v4-2-4}
 
Updates database model: no

* New features

  * [RPNG-636] Add configuration to disable upload on public document validation page


### 4.2.3 (2026-04-21) {#v4-2-3}
 
Updates database model: no

* Bug fixes

  * [RPNG-624] Error on liveness processing when previous capture had low quality


### 4.2.2 (2026-04-18) {#v4-2-2}
 
Updates database model: no

* Bug fixes

  * [RPNG-622] Compatibility issues on upload size limit API


### 4.2.1 (2026-04-18) {#v4-2-1}
 
Updates database model: no

* Improvements

  * [RPNG-621] Add missing subject identifier on identification document capture sessions


### 4.2.0 (2026-04-16) {#v4-2-0}
 
Updates database model: no

* New features

  * [RPNG-438] [RPNG-611] Add PDF/A conversion and validation support


### 4.1.6 (2026-04-16) {#v4-1-6}
 
Updates database model: no

* Bug fixes

  * [RPNG-616] Subscription settings page throwing errors after being closed


### 4.1.5 (2026-04-16) {#v4-1-5}
 
Updates database model: no

* Improvements

  * [RPNG-617] Improve IdNumber matcher for Video Identifications


### 4.1.4 (2026-04-16) {#v4-1-4}
 
Updates database model: no

* Improvements

  * [RPNG-615] Add route to get details about FortFace sessions


### 4.1.3 (2026-04-15) {#v4-1-3}
 
Updates database model: no

* Improvements

  * [RPNG-612] Increase maximum configurable upload size limit


### 4.1.2 (2026-04-09) {#v4-1-2}
 
Updates database model: no

* New features

  * [RPNG-607] Adobe Reader policy for signature generation

* Improvements

  * [RPNG-608] Update signing libraries


### 3.7.2 (2026-04-09) [patch] {#v3-7-2}
 
Updates database model: no

* Improvements

  * [RPNG-608] Update signing libraries


### 3.4.3 (2026-04-07) [patch] {#v3-4-3}

Updates database model: no

* Improvements

  * [RPNG-608] Update signing libraries


### 4.1.1 (2026-04-06) {#v4-1-1}

Updates database model: no

* Improvements

  * [RPNG-606] Update FortFace SDK to v2.4.3

### 4.1.0 (2026-04-01) {#v4-1-0}

Updates database model: **yes**

* New features

  * [RPNG-302] [RPNG-599] [RPNG-602] Biometric identification session (ABIS)

  * [RPNG-440] [RPNG-569] [RPNG-580] [RPNG-585] [RPNG-588] PNG-589 RPNG-595 Biometric batch enrollments

  * [RPNG-579] [RPNG-584] [RPNG-604] Face authentication with external identity provider fallback

  * [RPNG-568] [RPNG-575] Add subject identifier formats for Subscriptions

* Improvements

  * [RPNG-544] Transaction limits mapping for timestamps

  * [RPNG-555] SysAdmin - Subscription permissions page

  * [RPNG-558] Show restricted info on timestamp tiers page

  * [RPNG-559] Dashboard - FaceTec IdScan details improvements

  * [RPNG-587] Add date deleted on bio subject details page

  * [RPNG-591] Add "null expected" on get subject by identifier route

  * [RPNG-592] Improve FortFace session details page translations

  * [RPNG-603] Update FaceTec SDKs

  * [RPNG-567] Paginated listing of bio subjects via ClientLib


### 4.0.5 (2026-03-20) {#v4-0-5}

Updates database model: no

* Improvements

  * [RPNG-547] [RPNG-582] Add support to new brazilian CNPJ format


### 3.7.1 (2026-03-20) [patch] {#v3-7-1}

Updates database model: no

* Improvements

  * [RPNG-547] [RPNG-582] Add support to new brazilian CNPJ format

  * [RPNG-540] Add app setting to force one specific system language

* Bug fixes

  * [RPNG-533] TypeError on Web PKI certificate listing


### 4.0.4 (2026-03-18) {#v4-0-4}

Updates database model: no

* Improvements

  * [RPNG-576] Update FortFace SDK to v2.4.2


### 4.0.3 (2026-03-16) {#v4-0-3}

Updates database model: no

* Bug fixes

  * [RPNG-566] Problemas with FortFace SDK v2.4.1 update


### 4.0.2 (2026-03-12) {#v4-0-2}

Updates database model: no

* Improvements

  * [RPNG-546] Dashboard - improved transaction details display for TypeDiscriminator

  * [RPNG-570] Update FortFace SDK to v2.4.1

* Bug fixes

  * [RPNG-566] Bio session completion routes required subscription specifier


### 4.0.1 (2026-03-10) {#v4-0-1}

Updates database model: no

* Bug fixes

  * [RPNG-563] Dependency injection issue on BusinessService


### 4.0.0 (2026-03-09) {#v4-0-0}

:::warning
See [Update Rest PKI Core from 3.x to 4.0](on-premises/major-updates/update-40.md)
:::


Updates database model: **yes**

* New features

  * [RPNG-273] [RPNG-519] Create a billing flow for a subscription

  * [RPNG-347] [RPNG-497] Improvements to FaceTec transactions

  * [RPNG-458] Dashboard - list biometric sessions of bio subject

  * [RPNG-461] Transaction limiting service

  * [RPNG-478] Add transactions for FortFace operations

  * [RPNG-484] Option to use biometric sessions with URL return, similar to signature sessions

  * [RPNG-488] Add timeout configuration for biometric sessions

  * [RPNG-505] List of accepted ReturnUrls for BioSession

  * [RPNG-511] Video Identification – Receive expected document values (type/number)

  * [RPNG-517] Subscription based permissioning for TimestampTiers

* Improvements

  * [RPNG-270] Added signature session list page

  * [RPNG-405] Improvements to the biometric sessions home screen and customizations

  * [RPNG-430] Add timestamp marks in Spanish

  * [RPNG-435] Biometrics Dashboard – Add visualization of biometric session images

  * [RPNG-443] [RPNG-447] [RPNG-448] [RPNG-450] Updated Angular to version 19

  * [RPNG-471] Dashboard - Add button to load all images of the bio session

  * [RPNG-472] Add AgentId that created the BioSession

  * [RPNG-474] Add Swagger fields for biometric sessions

  * [RPNG-477] Add link to FaceTec sessions on transaction details

  * [RPNG-481] Add button to copy generated API key

  * [RPNG-486] Display user-friendly error messages in biometric sessions

  * [RPNG-490] Customization of colors and logo of biometric sessions per subscription

  * [RPNG-507] Video identification information via API

  * [RPNG-508] [RPNG-521] [RPNG-531] [RPNG-541] [RPNG-548] Layout improvements on admin pages

  * [RPNG-509] Improvements to OCR templates for passports

  * [RPNG-513] Dashboard - Add video identification recording playback

  * [RPNG-468] [RPNG-515] [RPNG-560] FaceTec SDK updates

  * [RPNG-536] Translation improvements on signature sessions page

  * [RPNG-537] Improve error logging for FortFace SDK actions

  * [RPNG-540] Add app setting to force one specific system language

* Bug fixes

  * [RPNG-258] Fields from PadesSignaturePostRequestBase being ignored

  * [RPNG-487] Biometric session starts as "Failed" on the dashboard

  * [RPNG-512] Video Identification – Fix success condition in video identification

  * [RPNG-518] Fix problems on Agent relationship with bio session transactions

  * [RPNG-523] Video Identification – Issues on FaceTec IdScan processing

  * [RPNG-525] Video Identification – Issue when recording/sending video

  * [RPNG-527] Sessions stuck in "loading" on iOS 26.2 devices

  * [RPNG-533] TypeError on Web PKI certificate listing

  * [RPNG-534] HTTP error 500 when receiving invalid requests methods (POST) on ClientApp routes

  * [RPNG-539] General subscription settings form invalid alerts

  * [RPNG-542] Some pages doesn't update when changing Subscription


### 3.7.0 (2025-11-26) {#v3-7-0}

Updates database model: **yes**

* Improvements

  * [RPNG-453] Improved FortFace liveness enrollment images


### 3.6.2 (2025-11-24) {#v3-6-2}

Updates database model: no

* New features

  * [RPNG-394] Biometrics dashboard - Bio subject details page

* Improvements

  * [RPNG-428] Updated FortFace SDKs

  * [RPNG-454] Add InteractionMethod to BioSessionModel on BioDashBoard


### 3.6.1 (2025-11-20) {#v3-6-1}

Updates database model: no

* Improvements

  * [RPNG-320] Load data from legacy FaceTec sessions

### 3.6.0 (2025-11-20) {#v3-6-0}

Updates database model: **yes**

* New features

  * [RPNG-387] Add tags to transactions

  * [RPNG-445] Dashboard – Add datavalid sessions to the biometrics session details

  * [RPNG-460] Add tools for extracting photos from FaceTec liveness sessions

* Improvements

  * [RPNG-446] Dashboard – Add missing fields from FaceTecSession

### 3.5.2 (2025-11-18) {#v3-5-2}

Updates database model: no

* Bug fixes

  * [RPNG-457] Problems with external identity provider setting on Subscription

### 3.5.0 (2025-11-17) {#v3-5-0}

Updates database model: **yes**

* New features

  * [RPNG-336] [RPNG-397] Tools for importing FaceTec data

  * [RPNG-392] Biometrics Dashboard – Biometric session details page

  * [RPNG-395] Biometrics Dashboard – Session listing filters

  * [RPNG-427] Timestamp for video identification

  * {/* [RPNG-432] Add support for OpenTelemetry */}

* Improvements

  * [RPNG-157] Add Swagger API-Key field

  * [RPNG-274] Improve handling of password-protected PDFs

  * [RPNG-390] Log frontend events from the FortFace and FaceTec SDKs

  * [RPNG-406] Refactor PolicyWrappers based on PKI Express

  * [RPNG-423] Enable field descriptions in Swagger

  * [RPNG-429] Persistence of additional FaceTec session information in the database

  * [RPNG-431] [RPNG-436] Video Identification – Improvements to result report PDF

  * [RPNG-444] Option to generate result-data for biometric enrollment and authentication sessions

* Bug fixes

  * [RPNG-357] No friendly error message when another app is using the camera (FortFace)

  * [RPNG-409] Issues with FaceTec IdScan color customization

### 3.4.0 (2025-10-28) {#v3-4-0}

Updates database model: **yes**

* New features

  * [RPNG-351] [RPNG-352] [RPNG-359] [RPNG-353] [RPNG-364] [RPNG-391] [RPNG-407] [RPNG-422] [RPNG-426] Add video identification session

  * [RPNG-360] Allow static customization of the Home Page (per instance)

  * [RPNG-379] Implement management of PDF settings and Security Context per Subscription

  * [RPNG-381] Add API for diploma renotarization

  * [RPNG-393] Biometrics Dashboard – Add subjects listing screen

* Improvements

  * [RPNG-151] Add spanish language

  * [RPNG-414] Update signing libraries

* Bug fixes

  * [RPNG-285] Permission fixes

  * [RPNG-388] Duplicate constraint error when saving certificates

### 3.3.0 (2025-10-16) {#v3-3-0}

Updates database model: **yes**

* New features

  * [RPNG-184] Support for custom Intermediate CAs (Certificate Authorities).

  * [RPNG-324] Store public key thumbprint for FaceTec sessions

  * [RPNG-346] Enrollment and authentication sessions using face pictures

  * [RPNG-358] Identification document face matching session

  * [RPNG-374] Face identity verification with external providers (FortFace/Datavalid)

  * [RPNG-377] Enrollment and authentication sessions using FortFace Liveness face capture

  * [RPNG-383] [RPNG-382] Add subscription biometric settings page

  * [RPNG-385] Biometric sessions summary list page with images preview

  * [RPNG-404] Add config to enable support for low quality images on face authentication API

* Improvements

  * [RPNG-312] [RPNG-314] [RPNG-372] [RPNG-375] ,RPNG-384, RPNG-343 Improvements on database modeling for biometric related entities

  * [RPNG-371] Improve biometric sessions demo layout

  * [RPNG-373] Improve biometric sessions layout on mobile devices

  * [RPNG-399] Add FaceTec browser SDK v9.7.83 resources

* Bug fixes

  * [RPNG-376] Inconsistencies on attempt limit configuration for biometric sessions using FaceTec liveness

  * {/* [RPNG-378] Fix on internal SQL migration */}

### 3.2.1 (2025-08-27) {#v3-2-1}

Updates database model: no

* Improvements

  * [RPNG-367] Update test certificates root v3

* Bug fixes

  * [RPNG-365] Docker build using latest AspNet image

### 3.2.0 (2025-08-22) {#v3-2-0}

Updates database model: **yes**

* New features

  * [RPNG-319] QR Code for biometric sessions

  * [RPNG-329] Face occlusion detection on FortFace liveness sessions

* Improvements

  * [RPNG-325] Apply theming to biometric sessions

  * [RPNG-331] Create implicit biometric session for FaceTec API calls

  * [RPNG-332] Crop FortFace liveness result image

  * [RPNG-354] Add FaceTec browser SDK v9.7.75 resources

* Bug fixes

  * [RPNG-355] `BadRequest` error when using AWS S3 in some scenarios



### 3.1.1 (2025-07-24) {#v3-1-1}

Updates database model: no

* Improvements

  * [RPNG-340] Add FaceTec browser SDK v9.7.72 resources

* Bug fixes

  * [RPNG-341] ARM64 image is not listening on port 80 after updating to .NET 8



### 3.1.0 (2025-07-24) {#v3-1-0}

Updates database model: **yes**

* New features

  * [RPNG-297] Biometric sessions



### 3.0.1 (2025-06-25) {#v3-0-1}

Updates database model: no

* New features

  * [RPNG-316] Command/Job to check integrity of documents

* Improvements

  * [RPNG-284] Add FaceTec browser SDK v9.7.63 e v9.7.66 resources

* Bug fixes

  * [RPNG-315] `BlobNotFoundException` error on certain blobs on `signedfiles` folder



### 3.0.0 (2025-06-16) {#v3-0-0}

:::warning
See [Update Rest PKI Core from 2.x to 3.0](on-premises/major-updates/update-30.md)
:::


Updates database model: **yes**

* Improvements

  * [RPNG-275] Update ASP.NET Core to version 8.0

  * [RPNG-292] Fix known vulnerabilities (for more information see [Vulnerability check 25.04](on-premises/vulnerabilities.md#c2504))

  * [RPNG-295] Signal search engines that document validation pages should not be indexed

  * [RPNG-299] Improve timestamp display on validation page

  * [RPNG-301] Create "distroless" image with reduced attack surface

* Bug fixes

  * [RPNG-293] Marks of type `QRCode` cause error 500 on PDF marking API when running on Linux/Docker

  * [RPNG-296] Certificate validation details on document validation page appear in English with Portuguese selected



### 2.5.0 (2025-04-11) {#v2-5-0}

Identical to: 2.5.0 RC 7 (2025-04-11)

Updates database model: **yes**

* New features

  * [RPNG-276] FaceTec liveness APIs

  * [RPNG-279] FaceTec IdScan APIs

  * [RPNG-280] FaceTec liveness demo

* Improvements

  * [RPNG-287] Support for using custom database schemes

  * [RPNG-289] Support for ARM64 platform on Docker

* Bug fixes

  * [RPNG-288] Error *An error has occurred while processing your authentication \(blank email address\). Please try again.*

* Flavour-specific changes

  * [RPNG-286] Landscape-specific validation marks (flavour *onr*)



### 2.4.5 (2025-04-04) {#v2-4-5}

Updates database model: no

* Bug fixes

  * [RPNG-277] Column `DateCompleted` is not filled when a signature session is completed



### 2.4.4 (2024-10-02) {#v2-4-4}

Updates database model: no

* Improvements

  * [RPNG-271] Improve performance on simple requests repeated several times by clients



### 2.4.3 (2024-09-25) {#v2-4-3}

Updates database model: no

* Bug fixes

  * [RPNG-291] Backward-compatibility issues on PDF marking API



### 2.4.2 (2024-07-26) {#v2-4-2}

Updates database model: no

* Bug fixes

  * [RPNG-269] Error 500 when signing PDFs with policy `PkiBrazil.AdrTempo`



### 2.4.1 (2024-07-25) {#v2-4-1}

Updates database model: no

* Bug fixes

  * [RPNG-290] Compatibility issue with SQL Server 2012 \(usage of `TRIM()` function\)



### 2.4.0 (2024-07-25) {#v2-4-0}

Identical to: 2.4.0 RC 1 (2024-06-15)

Updates database model: no

* New features

  * [RPNG-262] Setting `Oidc:AuthorityBackchannelUrl` for scenarios on which GrantID has a URL specific for backend-to-backend communication

* Improvements

  * [RPNG-265] Improve specification of client-side signature algorithm parameters on APIs

  * [RPNG-266] Policies for accepting signatures performed on Gov.BR platform

* Flavour-specific changes

  * [RPNG-264] Document metadata are not shown on validation page \(flavour *onr*\)



### 2.3.0 (2024-06-06) {#v2-3-0}

Identical to: 2.3.0 RC 1 (2024-05-17)

Updates database model: **yes**

* Flavour-specific changes

  * [RPNG-259] Metadata `CNS` and `Cartório` on a per-subscription basis \(flavour `Onr`\)



### 2.2.2 (2024-05-04) {#v2-2-2}

Updates database model: no

* Bug fixes

  * [RPNG-261] NullReferenceException error when requesting timestamps through TSP (introduced on 2.2.0)



### 2.2.1 (2024-05-01) {#v2-2-1}

Updates database model: no

* Bug fixes

  * [RPNG-260] Relative URLs returned by the upload API on `FileModel.Location` passed on `FileReferenceModel.Url` are still not accepted on Linux/Docker



### 2.2.0 (2024-04-30) {#v2-2-0}

Updates database model: **yes**

* New features

  * [RPNG-241] API transaction registering

  * [RPNG-225] PDF stamping API

  * [RPNG-214] Per-subscription settings for culture, time zone and date/hour format (used on PDF signature visual representation)

* Improvements

  * [RPNG-236] Round-robin strategy among timestamp providers with optional priority setting

  * {/* [RPNG-238] Permitir visualização e edição de metadados das aplicações */}

  * [RPNG-239] Update Angular to version 17

  * [RPNG-248] Accept relative URLs returned by the upload API on `FileModel.Location` passed on `FileReferenceModel.Url`

  * [RPNG-255] Show latest events, timestamp requests and API transactions on signed-in home page

  * [RPNG-256] Improve demonstrations and move to a separate menu item

  * [RPNG-257] Delete old TSP messages only if explicitly configured

* Bug fixes

  * [RPNG-235] Application does not try again to fetch a timestamp in case of error on initial try

  * [RPNG-237] Error on complete signature job for CMS signatures

  * [RPNG-245] Bad visual representation parameters cause return code 500 instead of 422

  * [RPNG-247] Invalid URLs on `ResourceContentOrReference.Url` cause 500 error

  * [RPNG-250] Exceptions transformed into ApiException are not logged properly

  * [RPNG-252] Date filter is not working on "Timestamp provider details" page

  * [RPNG-253] Duration of fimestamp request is not registered in case of error

  * [RPNG-254] Query on timestamp provider calls is not using the appropriate database index



### 2.1.3 (2024-04-10) {#v2-1-3}

Updates database model: no

* Improvements

  * [RPNG-240] Use default timestamp tier when a policy requiring timestamp is used combined with a custom security context without a timestamp tier



### 2.1.2 (2024-03-14) {#v2-1-2}

Updates database model: no

* Bug fixes

  * [RPNG-231] API return codes documented on Swagger do not match actual return codes returned by app



### 2.1.1 (2024-01-24) {#v2-1-1}

Updates database model: no

* New features

  * [RPNG-234] Add route `/api/system/manifest`

* Improvements

  * [RPNG-228] Add settings to log HTTP messages

* Bug fixes

  * [RPNG-208] Property `signatureResult.getFile().url` returns an absolute URL (was relative on legacy Rest PKI)



### 2.1.0 (2024-01-15) {#v2-1-0}

Updates database model: no

* New features

  * [RPNG-215] Proxy configuration

* Improvements

  * [RPNG-216] Add support for Standby mode to simplify setup on Azure App Service

  * [RPNG-219] Show attribute certificate information on signature information page

  * [RPNG-224] Review swagger

* Bug fixes

  * [RPNG-222] Error when saving security context referencing timestamp tier

  * [RPNG-226] Necessary data for completing signatures is lost if an error occurs during completion in background

  * [RPNG-227] "NotSupportedException" error on Cades start APIs versions 1 and 2

  * [RPNG-232] CPF claim is unnecessarily required



### 2.0.2 (2023-11-09) {#v2-0-2}

Updates database model: no

* Improvements

  * [RPNG-220] Ignore communication errors with Amplia when `AttributeCertificateInclusion` is set to `Recommended`



### 2.0.1 (2023-11-08) {#v2-0-1}

Updates database model: no

* Bug fixes

  * [RPNG-217] Error "CryptographicException: The payload was invalid" when fetching old signature sessions



### 2.0.0 (2023-10-30) {#v2-0-0}

Updates database model: **yes**

* Improvements

  * [RPNG-178] Allow optional definition of timestamp tier on security context

  * [RPNG-204] Anonymization of signers' personal data on validation page

  * [RPNG-207] Improvements to timestamping management

  * [RPNG-246] Date filters on timestamp provider call history

* Bug fixes

  * [RPNG-198] Signature validaiton API does not honor setting `General:DefaultTimeZone`



### 1.13.1 (2023-10-17) {#v1-13-1}

Updates database model: no

* Flavour-specific changes

  * [RPNG-212] Change validation marks text \(flavour *onr*\)



### 2.0.0 RC 16 (2023-09-12) {#v2.0.0-rc16}

Updates database model: **yes**

* New features

  * [RPNG-160] Add support for legacy CAdES signature APIs

  * [RPNG-182] Timestamp tier and provider history

  * [RPNG-206] Enable SSH access on Docker image

* Bug fixes

  * [RPNG-185] Certificate files are not accepted on security context management's root CA upload

  * [RPNG-200] `MessageDigest` property of PDF/CMS signers is not filled when only the algorithm is known

  * [RPNG-201] Signature exploring APIs are ignoring parameter `SignaturePolicyId`

  * [RPNG-209] Multipart upload not working



### 2.0.0 RC 8 (2023-06-30) {#v2.0.0-rc08}

:::warning
Before updating to this version make sure your PKI SDK license supports versions released up to 2023-06-27.
:::


Updates database model: no

* Improvements

  * [RPNG-192] Add setting `General:ReturnExceptionsToApplications` to return exceptions on error responses when the API is being called by an application

* Bug fixes

  * [RPNG-191] Property `Detail` is not filled on 422 responses

  * [RPNG-193] PDFs signed with legacy signature standard \(non-PAdES\) cause error on signature exploration API

  * [RPNG-194] Password-protected PDFs cause error 500 \(should cause 422 with code `ProtectedPdfError`\)

  * [RPNG-195] Corrupt PDFs cause error 500 \(should cause 422 with code `InvalidPdf`\)

  * [RPNG-196] Error *Wrong last certificate on Pades signature*



### 2.0.0 RC 7 (2023-05-30) {#v2.0.0-rc07}

:::warning
Before updating to this version make sure your PKI SDK license supports versions released up to 2022-10-19.
:::


Updates database model: **yes**

* New features

  * [RPNG-155] Add support for legacy certificate authentication APIs

  * [RPNG-159] Add support for legacy PDF signature APIs

  * [RPNG-161] Add support for legacy XML signature APIs

  * [RPNG-162] Add support for legacy PDF marking APIs

  * [RPNG-177] Add support for signature policies

  * [RPNG-179] Automatically add attribute certificates to signatures

  * [RPNG-183] Add suport for legacy certificate validation API

* Bug fixes

  * [RPNG-180] Cloud certificate integration was broken after updating to SPA 2.6 (v1.13.0)

  * [RPNG-190] Error "cannot access a closed file" when using AwsS3 blob storage



### 1.13.0 (2023-03-14) {#v1-13-0}

Updates database model: **yes**

* Improvements

  * [RPNG-153] Add PDF visual representation to signature API

  * [RPNG-172] Allow using "S3 clones" as blob storage

  * [RPNG-169] Complete update to SPA 2.6



### 1.12.2 (2023-02-28) {#v1-12-2}

Updates database model: no

* Bug fixes

  * [RPNG-173] Document details API does not allow inter-subscription access when instance is configured as on-premises


### 1.12.1 (2023-01-05) {#v1-12-1}

Updates database model: no

* Improvements

  * [RPNG-164] Improve configuration on Linux



### 1.12.0 (2022-12-13) {#v1-12-0}

Updates database model: **yes**

* New features

  * [RPNG-158] Add support for PostgreSQL

* Improvements

  * [RPNG-156] Updated ASP.NET Core to version 6.0

* Bug fixes

  * [RPNG-152] Cannot add trusted roots on security context creation page



### 1.11.0 (2022-11-14) {#v1-11-0}

Updates database model: **yes**

* Improvements

  * [RPNG-154] Add setting to control PDF marks left and top margins



### 1.10.2 (2022-05-03) {#v1-10-2}

Updates database model: no

* Improvements

  * [RPNG-149] Add setting to force brazilian pdf signing policies



### 1.10.1 (2022-04-23) {#v1-10-1}

Updates database model: no

* Bug fixes

  * [RPNG-148] Error when using custom security contexts



### 1.10.0 (2022-04-23) {#v1-10-0}

Updates database model: **yes**

* New features

  * [RPNG-2] Add certificate authentication API

* Improvements

  * [RPNG-146] Allow configuration of PDF marks

  * [RPNG-147] Allow configuration of PDF marking policy



### 1.9.0 (2022-03-29) {#v1-9-0}

Updates database model: no

* New features

  * [RPNG-41] Signature validation API

  * [RPNG-141] Security context management on the web interface



### 1.8.0 (2022-02-25) {#v1-8-0}

Updates database model: **yes**

* Improvements

  * [RPNG-10] Signature session [certificate requirements](integration/signature-sessions/certificate-requirements.md)



### 1.7.0 (2022-01-25) {#v1-7-0}

Updates database model: **yes**

* New features

  * [RPNG-135] Detached CAdES signatures

  * [RPNG-44] UI to monitor calls \(especially errors\) to webhooks and file validation API

* Improvements

  * [RPNG-51] UI to configure the subscription theme and customizable assets

* Bug fixes

  * [RPNG-144] Session signature images are broken after authentication flow with cloud certificate provider



### 1.6.0 (2021-12-08) {#v1-6-0}

Updates database model: no

* New features

  * [RPNG-129] Add support for using cloud certificates on signature sessions

* Improvements

  * [RPNG-139] Return more information about the signer's certificate on `SignatureSessionModel`



### 1.5.1 (2021-11-23) {#v1-5-1}

Updates database model: no

* Bug fixes

  * [RPNG-140] Root password authentication error



### 1.5.0 (2021-09-30) {#v1-5-0}

Updates database model: **yes**

* New features

  * [RPNG-132] Add support for CAdES/CMS signatures

  * [RPNG-93] Signature sessions with predefined documents

* Improvements

  * [RPNG-138] Remove validation marks from document previews

  * [RPNG-136] Add valiation marks to PDFs even if using CAdES/CMS signature

  * [RPNG-128] Improve usage of theme assets to allow logos with varying aspect ratios

  * [RPNG-120] Handle invalid/corrupt PDF exception properly

* Bug fixes

  * [RPNG-119] Cached versions of acceptable filename patterns are shown on the management UI

* Client-specific changes

  * [RPNG-130] Flavour ONR



### 1.4.2 (2021-08-24) {#v1-4-2}

Updates database model: no

* Improvements

  * [RPNG-126] Add background worker count configuration

* Bug fixes

  * [RPNG-125] Segmented upload error



### 1.4.1 (2021-08-24) {#v1-4-1}

Updates database model: no

* Improvements

  * [RPNG-122] Improve validation notice on documents

  * [RPNG-85] Adjustments to document key input

* Bug fixes

  * [RPNG-124] Errors under high demand

  * [RPNG-123] Retries of signature background processing always fail if a certain amont of time has elapsed



### 1.4.0 (2021-08-11) {#v1-4-0}

* First publicly available version
