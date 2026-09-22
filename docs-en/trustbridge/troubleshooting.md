---
sidebar_label: "Troubleshooting"
sidebar_position: 12
---

# Troubleshooting

Failure modes by where they are noticed, what each looks like, and where to read the cause. Every
HTTP response carries an `X-Correlation-Id`; quote it and an operator finds the request's Server log
lines and Audit Log rows at once.

## The Server will not start

Every refused start is one `Critical` line naming the cause. The full table is on
[Server installation](server-installation.md#when-it-will-not-start). The short version:

| Symptom | Cause |
|---|---|
| A line naming `KeyRingProtector:` | No protector, not base64, wrong password, or no RSA key. Every deployment needs one. |
| `…the Key Ring Protector configured here opens none of them` | A swapped protector. Restore the old one, or add it under `RetiredCertificates`. |
| `…could not be reached in 90 seconds` | The database never answered at start. On Azure SQL, check public network access or the private endpoint (error 47073). |
| `…is behind the build … by N migration(s)` | `MigrateOnStart` is off and migrations are pending. |
| `…has N migration(s) applied that this build does not contain` | An older image on a newer schema, or a database created by Server 1.2.0 or earlier. |
| `Signer:ApiKey is required…` | A Signer address with no key. |
| `Sessions:MaxDuration` below `DefaultDuration`, or another cross-key rule | A refused configuration; the line names both keys. |
| On App Service, the container is killed and restarted in a loop with nothing useful logged | A migration outlasting `WEBSITES_CONTAINER_START_TIME_LIMIT` (230 s default). Set it to 1800. |

## The Server started but does not work

| Symptom | What it is | Where to look |
|---|---|---|
| `/` answers 200, `/healthz` answers 503 | The database went away after start. The contract fails; the vault is closed. | The connection string, SQL Server's availability. |
| Every vault signature and import is refused while workstations sign fine | The vault latch: the Server came up before its database. | The `VaultReadiness` warning at start. It opens on the first use once the database answers. |
| Every Vault Certificate reads `UNTRUSTED`; imports refused | No PKI SDK licence, or a lapsed one. | The `LacunaPkiRuntime` `Critical` line at start. Set `Certificates__Validation__License`. |
| Every certificate on the Server reads `UNTRUSTED` although the licence is current | No anchor can terminate a chain: `UseIcpBrasil` off with no Trusted CA that is a root, or a read-only filesystem with no writable `/tmp` so the licence could not be loaded. | The two anchor-set `Critical` lines; mount a `tmpfs` over `/tmp`. |
| A setting has no effect | One of the seven overridable keys was saved on the Settings screen, and the database layer wins silently. | `/admin/settings`; restore the deployed defaults. |
| Admin console at `http://` never completes a login | A cookie without `Secure` over a link the platform upgrades. | On App Service, `--https-only true`. Behind a proxy, `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`. |
| Every audit row records the proxy's address | Forwarded headers are off. | `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`. |
| `KeyRingProvider[48]` or `XmlKeyManager[24]` lines on a Server that started cleanly | The **database** is unreachable, not the protector. | `/healthz`. |
| A `Critical` line carrying a whole audit row | The database refused an audit write; the row lives only in this line. | Keep the log stream. The console shows an alert. |
| A warning banner on every admin page | `UseLacunaTestPki` is on, or an audit write failed. | Turn the test PKI off on anything but a development box. |

## Workstations

| Symptom | What it is | Where to look |
|---|---|---|
| Install exit code 1603, log names `SERVER_URL` | The launch condition: empty or scheme-less URL. | Pass `SERVER_URL=https://…`. |
| Install exit code 1603, log says a newer version is installed | A downgrade. | Uninstall first; the machine returns as a new one. |
| Install rolls back at *Starting services* | The service refused to start: a licence the SDK will not read, an `INSTALLER_KEY` that will not parse, or a registry value of the wrong type. | Application event log, source **TrustBridge Workstation Service**. |
| Installed, never appears in the admission queue, nothing on the Server | The Server URL is wrong, or a GPO is overriding it, or the TLS chain is not trusted by the machine. | The service's *`Server:Url` is …, supplied by …* line at start; `HKLM\Software\Policies\TrustBridge` from a 64-bit PowerShell. |
| Never appears, and the machine's log says its admission request was refused | One of four: revoked, an Installer Key the Server does not trust, too many requests from its address, or a full queue. The Server deliberately does not say which. | The last two clear themselves. Check the fleet screen for a revoked row. |
| In the queue, Tray says *waiting to be admitted* | Not a fault. | Admit it at `/admin/admission`. |
| Admitted, but does not connect; Server log says `Protocol version 2 is newer than this server's supported window` | The workstation was upgraded ahead of its Server. | Upgrade the Server. |
| Admitted, but does not connect; Server log says `A workstation assertion was refused: Expired` or `NotYetValid` | The machine's clock is more than 60 s out. | Time synchronisation on the machine. |
| Every certificate reads `UNTRUSTED` | No PKI licence or a lapsed one, or no anchor can terminate a chain. | The `Critical` line at service start; `PKI_LICENSE` by repair or Group Policy, then restart the service. |
| A certificate reads `UNTRUSTED` while the licence is fine | Its issuer is not in the machine's anchor set. | *Trust the issuer* on the Certificate Registry, which adds a Trusted CA that reaches the machine. A machine on protocol 1 needs anchor files instead. |
| A certificate reads `STALE` | Its CA's CRL could not be fetched for longer than the grace window (24 h). | The CA's reachability from the machine. |
| A token is plugged in but no certificate appears | Uncommon middleware not in the shipped list; or a module named in `Certificates:Pkcs11:Modules` that will not load. | The service log names the module. The sweep also catches a missed change trigger within a minute. |
| The Tray App is not there after install | It starts at the next sign-in. | Sign out and in, or start `Tray App\TrustBridge.TrayApp.exe`. |
| The Tray App says *Not connected* | It could not open the service's pipe. Workstation 1.0.0 had a bug here, fixed in 1.0.1. | Upgrade the workstation package. |
| A PIN prompt stays on screen after the client already got an error | Expected: the Server's prompt timeout (60 s) is shorter than the Tray's (90 s), and a Server that gave up cannot take the prompt down. | Nothing. |
| A policy change had no effect | The registry is read once, at start. | `Restart-Service "TrustBridge Workstation Service"`. |
| A perfectly configured machine looks bare in the registry | A 32-bit PowerShell redirected to `WOW6432Node`. | Use a 64-bit PowerShell. |
| Every certificate on a machine is reported as `ACTIVE`, including sample ones | `UseLacunaTestPki` on, or a `FakeTokens` section in the settings file. | Remove both on any machine anybody signs from. |

## Client application errors

Branch on `error.code`. The full vocabulary is on the [REST API](rest-api.md#the-error-envelope) page.

| Code | Usual cause | What to do |
|---|---|---|
| `401 UNAUTHORIZED` | Missing, mistyped, revoked or expired key, or a disabled application. All refused identically. | Check the key on the Client Applications screen. |
| `401 SESSION_EXPIRED` | The session idled out, was deactivated, was replaced by a newer one for the same CPF, ran out of its Signature Allowance, or was vault-bound across a Server restart. | Create a new session. Nothing says which; that is deliberate. |
| `400 INVALID_REQUEST` on `POST /v1/sessions` naming `cpf` | Check digits do not agree, or a repeated-digit value. | Fix the CPF at the source. Validate check digits in your form. |
| `400 INVALID_REQUEST` on a sign | No `sessionId` in the request. | Send the id `POST /v1/sessions` returned. Retrying unchanged fails identically. |
| `404 CERT_NOT_FOUND` | No certificate for the CPF is held anywhere: the token is not plugged in, the machine is not admitted or connected, or the CPF was never issued. | The Certificate Registry and the fleet screen. |
| `422 CERT_NOT_ACTIVE` | Every certificate for the CPF is `EXPIRED`, `REVOKED`, `UNTRUSTED` or `STALE`. `UNTRUSTED` often means the deployment's anchors do not cover the issuer. | `GET /v1/certificates/info` for the verdict; the Certificate Registry for the issuer. |
| `401 INVALID_PIN` | Wrong PIN, or a workstation holding a different PIN in use. | Ask the holder. Five failures in fifteen minutes lock the CPF. |
| `422 PIN_NOT_AVAILABLE` | The Tray prompt timed out, was declined, or nobody was signed in to answer it; or a Vault Certificate could not be opened. | The holder must be at their machine with the Tray App running. |
| `422 WORKSTATION_OFFLINE` | Every machine holding an active certificate for the CPF is offline, after the reconnect grace on a sign. | The fleet screen. |
| `422 CERT_INCOMPLETE_IDENTITY` | The certificate names no e-mail address. | Send `email` when creating the session. |
| `422 SIGN_TIMEOUT` | The signature did not finish within `Signing:RequestBudget` (60 s). A slow machine or a slow Signer. | The Signing Operations screen shows the stage reached. |
| `422 SIGNER_REJECTED` | Lacuna Signer refused the document; `details` carries its message. | The document itself. |
| `502 SIGNER_ERROR` | Signer could not be reached. | Signer's availability, `Signer:BaseAddress`. |
| `409 DOCUMENT_NOT_READY` that never clears | The signature is still in flight, or a run was stranded by a restart and Signer still holds the document open. | The Signing Operations screen; `RUN_STRANDED`. |
| `429 SERVER_BUSY` during ordinary use | `Throttle:ConcurrencyLimit` set too low for the deployment, not a client problem. | Raise it. Under a genuine spike, retry with backoff and jitter. |
| `429 TOO_MANY_PIN_ATTEMPTS` | The per-CPF lockout. | Wait for the window (15 min) to pass. Retrying makes it worse. |
| `404 ENDPOINT_NOT_FOUND` | A route without the `/v1` prefix. | Fix the URL. |
| `413 DOCUMENT_TOO_LARGE` | Over `Signing:MaxDocumentBytes` (10 MB by default). | Smaller document, or raise the cap knowing what it costs. |
| `500 INTERNAL_ERROR` on a sign, with `could not be opened by the reader this platform signs with` in the Server log | A Vault Certificate imported before the legacy-shape check existed, shrouded under `pkcs5PBES2`. | Re-export with `openssl pkcs12 -export -legacy` and import again. That needs the original file. |

## Signing outcomes on the Signing Operations screen

A `Failed` operation carries a failure code and the **stage** it reached: the client's `202` may have
been answered long before. `RUN_STRANDED` means the Server was restarted under the run and a sweep
ended it. A run that failed after the document reached Signer leaves a document open there, which the
fetch reports as `409` until Signer's own retention or the tidy-up ends it as `422`.

## Getting help

Send Lacuna Software support the `X-Correlation-Id` of the failing request, the Server version shown
in the admin console footer, the workstation package version from the fleet screen, and the relevant
Server log lines. For a workstation problem, add the Application event log entries from source
**TrustBridge Workstation Service**. Never send a PIN, an API key, the Key Ring Protector or the
licence.
