# API Versions

The Web PKI provides an API version requirement parameter, in case the developer intends to use a specific feature set and avoid any unecessary update on the user Web PKI components.
In order to do so, use the `requiredApiVersion` parameter on [`init()`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#init) method, e.g.:

```js
pki.init({
    ready: onWebPkiReady,
    requiredApiVersion: pki.apiVersions.v1_2
});
```

In the example above, we defined that we are going to use the feature set of [API 1.2](#v1-2) (and lower), thus any Web PKI component update will only the be required for users with lower versions than the ones defined by [API 1.2](#v1-2).
No unecessary update will be required for users with satisfying versions, even though it is not the latest one.

If the parameter is not set, the dafault requested version is [API 1.3](#v1-3).

## API changelog {#changelog}

### 1.8.2 (2023-11-23) {#v1-8-2}

Since lib [2.16.3](../update.md)

- Improve method [`importCertificate`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#importcertificate) supporting multiple calls


### 1.8.1 (2022-12-17) {#v1-8-1}

- Add methods [encrypt](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#encrypt) and [decrypt](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#decrypt)
- Add Extended Key Usage info to [CertificateModel](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.certificatemodel.html)
- Add parameter `nonExportableKey` on method [generateSoftwareRsaKeyPair](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#generatesoftwarersakeypair)


### 1.7.2 (2022-07-03) {#v1-7-2}

- Add support to unrestricted size native responses
- Add [CertificateModel](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.certificatemodel.html) international PKI fields: [`PkiArgentinaModel`](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.pkiargentinamodel.html), [`PkiEcuadorModel`](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.pkiecuadormodel.html), [`PkiParaguayModel`](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.pkiparaguaymodel.html), [`PkiPeruModel`](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.pkiperumodel.html)
- Add [CertificateModel](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.certificatemodel.html) fields: `certificatePolicies`, `subjectDN`, `issuerDN`


### 1.6.1 (2020-05-23) {#v1-6-1}

- Add [`downloadToFolder`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#downloadtofolder)&ast; command with TLS 1.2 forced support


### 1.6 (2019-10-13) {#v1-6}

- Add methods [`keySignData`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#keysigndata) and [`keySignHash`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#keysignhash) for signing with a generated private key Id.
- Add `privateKeyId` parameter to the generate key pair response: [`GenerateKeyPairResponse`](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.generatekeypairresponse.html)
- Fix bug on [`sendAuthenticatedRequest`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#sendauthenticatedrequest) response payload when it comes without content length header property.


### 1.5.2 (2019-07-19) {#v1-5-2}

- Add option for returning de signed document content on local signature commands without the 1MB size limit: [`returnContent`](pathname:///content/typedocs/web-pki/enums/_lacuna_web_pki_d_.lacunawebpki.outputmodes.html#returncontent)
- Add certificate validation levels on local signatura commands: [`CertificateValidationLevels`](pathname:///content/typedocs/web-pki/enums/_lacuna_web_pki_d_.lacunawebpki.certificatevalidationlevels.html)
- Add vertical and horizontal direction control on PAdES (PDF) visual representation: [`PadesVisualAutoPositioning`](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.padesvisualautopositioning.html)
- Add native app life cycle control on `init` method: [`useDomainNativePool`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#init)


### 1.5 (2018-11-27) {#v1-5}

- Add more efficient batch signature command: [`signHashBatch`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signhashbatch)
- Add license v3
- Add mobile integration


### 1.4.1 (2018-06-15) {#v1-4-1}

- Fix [`sendAuthenticatedRequest`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#sendauthenticatedrequest)&ast; empty buffer bug


### 1.4 (2018-02-23) {#v1-4}

- Add XML local signature features:
	- [`signFullXml`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signfullxml)&ast;
	- [`signXmlElement`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signxmlelement)&ast;
	- [`openXmlSignature`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#openxmlsignature)&ast;
- Add autheticated request feature:
	- [`sendAuthenticatedRequest`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#sendauthenticatedrequest)&ast;
- Add user error message field on exception object:
	- [`userMessage`](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.exceptionmodel.html#usermessage)


### 1.3 (2017-11-10) {#v1-3}

- Add improved error handler with exception model
	- [`fail`](pathname:///content/typedocs/web-pki/interfaces/_lacuna_web_pki_d_.promise.html#fail)


### 1.2 (2017-06-19) {#v1-2}

- Add local store and PKCS#11 certificate generation features:
	- [`generateSoftwareRsaKeyPair`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#generatesoftwarersakeypair)
	- [`importCertificate`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#importcertificate)
	- [`listTokens`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#listtokens)
	- [`generateTokenRsaKeyPair`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#generatetokenrsakeypair)
	- [`importTokenCertificate`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#importtokencertificate)


### 1.1 (2016-08-19) {#v1-1}

- Add license v2
- Add local signature features:
	- [`showFileBrowser`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#showfilebrowser)&ast;
	- [`openFile`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#openfile)&ast;
- Add PAdES local signature features:
	- [`signPdf`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signpdf)&ast;
	- [`openPades`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#openpades)&ast;
- Add CAdES local signature features:
	- [`signCades`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signcades)&ast;
	- [`openCades`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#opencades)&ast;


### 1.0 (2015-04-28) {#v1-0}

- Add basic features:
	- [`init`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#init)
	- [`listCertificates`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#listcertificates)
	- [`readCertificate`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#readcertificate)
	- [`signHash`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signhash)
	- [`signData`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signdata)
	- [`redirectToInstallPage`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#redirecttoinstallpage)
- Add sign batch feature:
	- [`preauthorizeSignatures`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#preauthorizesignatures)
- Add downlad and directory selection features:
	- [`showFolderBrowser`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#showfolderbrowser)
	- [`downloadToFolder`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#downloadtofolder)
	- [`openFolder`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#openfolder)
- Add RestPKI sign integration:
	- [`signWithRestPki`](pathname:///content/typedocs/web-pki/classes/_lacuna_web_pki_d_.lacunawebpki.html#signwithrestpki)


 &ast; Methods supported only on Windows. For more informations see [Web signatures](../../pki-guide/web-signatures/index.md) article.