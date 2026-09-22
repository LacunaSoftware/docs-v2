---
sidebar_label: "Azure App Service"
sidebar_position: 4
---

# Azure App Service

The Server as a Linux custom container on Azure App Service, **one instance**, talking to Azure SQL
with a managed identity and no password anywhere. Read [Server installation](server-installation.md)
first for the four things every deployment shares, in particular the Key Ring Protector and the
single-instance rule.

Everything on the Docker page about configuration keys, the protector, the vault and backups applies
here unchanged. What differs is where TLS is terminated, who schedules restarts, and the Azure-specific
settings below.

## What you cannot do here

**No scaling out.** One instance, for the reason given on the installation page. Nothing in the
product will refuse a second instance; it will simply misbehave. Check the instance count after any
plan change and alert on it if you can.

## 1. The App Service plan

The fleet decides one thing about the SKU: **not Free**, which caps WebSocket connections at five and
answers 429 beyond that, where each Workstation Service holds one connection continuously. Above Free
the WebSocket ceiling is not a constraint. **Always On** is required (below) and is a dedicated-tier
feature, so size the plan for the signing work instead. P1V3 is a reasonable start.

```bash
az appservice plan create -g <rg> -n <plan> --is-linux --sku P1V3 --number-of-workers 1
```

## 2. Azure SQL

```bash
az sql server create -g <rg> -n <sqlserver> --enable-ad-only-auth \
  --external-admin-name "<your-group>" \
  --external-admin-principal-type Group \
  --external-admin-sid <the-group's-object-id>
az sql db create -g <rg> --server <sqlserver> -n TrustBridge --service-objective S1
```

Use a group as the Entra administrator rather than a person who can leave. Allow the app through the
firewall: "Allow Azure services" without VNet integration, a private endpoint with it. **Leaving
public network access disabled with no private endpoint refuses every connection with error 47073**,
and the Server spends its whole start-up budget waiting on it.

## 3. The image

Any registry works. Azure Container Registry is shown because App Service can pull from it with a
managed identity instead of a stored password.

```bash
az acr login -n <registry>
docker tag trustbridge-server:1.6.1 <registry>.azurecr.io/trustbridge-server:1.6.1
docker push <registry>.azurecr.io/trustbridge-server:1.6.1
```

**Use an immutable tag.** With `DOCKER_ENABLE_CI` on, App Service re-pulls on push, so a moving tag
lets the platform restart the Server unattended, and every restart ends live sessions bound to a Vault
Certificate.

## 4. Create the app

```bash
az webapp create -g <rg> -p <plan> -n <app> \
  --container-image-name <registry>.azurecr.io/trustbridge-server:1.6.1

az webapp identity assign -g <rg> -n <app>
az role assignment create --role AcrPull \
  --assignee-object-id $(az webapp identity show -g <rg> -n <app> --query principalId -o tsv) \
  --assignee-principal-type ServicePrincipal \
  --scope $(az acr show -n <registry> --query id -o tsv)
az webapp config set -g <rg> -n <app> --acr-use-identity true
az webapp restart -g <rg> -n <app>
```

Three things that all present as an app that never starts with `UNAUTHORIZED` in its container log:

- **On an ABAC-enabled registry `AcrPull` grants nothing.** A registry in
  `RBAC Registry + ABAC Repository Permissions` mode wants `Container Registry Repository Reader`.
  Check with `az acr show -n <registry> --query roleAssignmentMode -o tsv`.
- **The registry has to accept ARM audience tokens**, or a managed-identity pull is refused with
  `token validation failed`: `az acr config authentication-as-arm update -r <registry> --status enabled`.
- **The restart is not ceremony.** The app was pointed at a private image before it had an identity
  or a role, so its first pull failed, and nothing retries that on its own.

An app created in the **portal** is a *sitecontainers* app: its image is set with
`az webapp sitecontainers` rather than `az webapp config container`, and a settings change alone does
not always recycle it, so restart explicitly.

## 5. Let the app into the database

Connect to the database as its Entra administrator and create the identity as a user:

```sql
CREATE USER [<app>] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [<app>];
ALTER ROLE db_datawriter ADD MEMBER [<app>];
ALTER ROLE db_ddladmin  ADD MEMBER [<app>];
```

`db_ddladmin` is what lets the Server bring its own schema up, which it does by default. Leave it out
only if you also set `Database__MigrateOnStart=false` and apply migrations yourself before every
upgrade. Omitting the grant and leaving the default on turns your next upgrade into a refused start.

## 6. Settings

```bash
az webapp config appsettings set -g <rg> -n <app> --settings \
  WEBSITES_PORT=8080 \
  WEBSITES_CONTAINER_START_TIME_LIMIT=1800 \
  ASPNETCORE_FORWARDEDHEADERS_ENABLED=true \
  KeyRingProtector__Certificate="$(base64 -w0 protector.pfx)" \
  ConnectionStrings__TrustBridge="Server=tcp:<sqlserver>.database.windows.net,1433;Database=TrustBridge;Authentication=Active Directory Managed Identity;Encrypt=True" \
  Signer__BaseAddress="https://signer.example.com" \
  Signer__ApiKey="<application|secret>" \
  Admin__Bootstrap__Email="admin@example.com" \
  Admin__Bootstrap__Password="<a strong password>"
```

From PowerShell or cmd on Windows, put the settings in a JSON file and pass `--settings @params.json`:
a Signer API key carries a `|`, which the shell otherwise reads as a pipe.

| Setting | Why |
|---|---|
| `WEBSITES_PORT=8080` | The container listens on 8080. App Service auto-detects 80 and 8080; setting it removes the ambiguity. |
| `WEBSITES_CONTAINER_START_TIME_LIMIT=1800` | **This posture's schema-migration setting.** The Server migrates before it listens, and App Service kills a container that has not answered on its port within this many seconds. The default is 230, so an upgrade with a long index build is killed, restarted and killed again in a loop that reports nothing. 1800 is the platform maximum and costs nothing when migrations are quick. |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` | The platform terminates TLS at its front ends. Without this the Server sees plain HTTP from a datacentre address: cookies lose `Secure`, absolute URLs come out `http://`, and every audit row records the proxy instead of the caller. |
| `KeyRingProtector__Certificate` | **Required.** See below for a Key Vault reference instead of an app setting. |
| `ConnectionStrings__TrustBridge` | Managed identity, no password. |
| `Admin__Bootstrap__*` | First start only. Remove after signing in. |

`WEBSITES_ENABLE_APP_SERVICE_STORAGE` is deliberately absent: this deployment needs **no persistent
storage**. Both key rings are rows in Azure SQL, and the only directory the container writes is `/tmp`.

### Logging

**Turn container logging on**, because an audit row the database will not take is written to the
Server log at `Critical` and nothing else holds it. Container stdout is not retained by default on
Linux App Service; `az webapp log tail` is a live stream, not a record.

```bash
az webapp log config -g <rg> -n <app> --docker-container-logging filesystem
```

That is a floor: the filesystem sink is capped and rolls. A deployment that means to keep the trail
sends logs to Application Insights or a Log Analytics workspace with a retention it has chosen. When a
workspace is attached through the portal, `APPLICATIONINSIGHTS_CONNECTION_STRING` is set and the
Server sends every log line there as a trace carrying the request's correlation id, with no further
setting. `Logging__ApplicationInsights__ConnectionString` is the same value under the Server's own
key for a workspace attached any other way.

### Pin the platform

```bash
az webapp update -g <rg> -n <app> --client-affinity-enabled true --https-only true
az monitor autoscale list -g <rg> -o table                       # then delete any that exist
az webapp config set -g <rg> -n <app> --always-on true \
  --generic-configurations '{"healthCheckPath": "/"}'
```

**`--https-only true`** is a call the Server deliberately leaves to the deployment: nothing in it
redirects HTTP to HTTPS, because an on-premises Server is routinely reached over plain HTTP behind the
customer's own proxy. Here both schemes reach the app, so without this a console opened at `http://`
gets a session cookie with no `Secure` flag.

**Health Check stays at `/`, and the real probe goes to your monitoring.** On one instance, Health
Check is not a load-balancing feature but a **restart trigger**: with nowhere to reroute traffic, App
Service replaces an instance after an hour of failing pings. `/` answers 200 with the database gone,
so it fails only when the container is dead, which is the only failure a restart can fix. `/healthz`
*can* fail on its own (Azure SQL down), and wiring it to Health Check would buy a restart every hour
that fixes nothing and strands vault-bound sessions each time. Point an **availability test** at
`/healthz` instead; it is anonymous and unaudited, so probing it every thirty seconds costs nothing.

`--health-check-path` is not a flag of `az webapp config set`; the path is a site-config property,
which is what `--generic-configurations` is for. From PowerShell or cmd, put the JSON in a file and
pass `"@params.json"`.

### The Key Ring Protector

The commands to mint one are on the [installation page](server-installation.md#the-key-ring-protector)
and are the same here. Two places to put it, and the second is better:

- **An app setting**, as shown above.
- **A Key Vault reference**: store the base64 as a secret, give the app's managed identity `get` on
  it, and set
  `KeyRingProtector__Certificate=@Microsoft.KeyVault(SecretUri=https://<vault>.vault.azure.net/secrets/<name>/)`.

**Keep the `.pfx` itself somewhere neither this app nor this subscription can reach, permanently.** A
Key Vault reference is a convenient home for the running Server and is not a backup: a Key Vault the
same operator can delete is not a copy kept somewhere else.

### Vault Certificates here

```powershell
az webapp config appsettings set -g $rg -n $app --settings `
  Vault__Enabled=true `
  Certificates__Validation__License=$([Convert]::ToBase64String([IO.File]::ReadAllBytes("LacunaPkiLicense.config")))
```

The licence is the same kind of artifact as the protector, dated and bought by somebody, so a Key Vault
reference suits it too; renewing it is then a secret version and a restart.

One caveat is specific to this posture. **App Service restarts containers for its own maintenance**,
and a session bound to a Vault Certificate does not survive a restart: it ends as `Stranded` and the
client creates a new one. Nothing is lost permanently and workstation-bound sessions are unaffected,
but a restart cadence that is not yours is a visible one for vault signing.

## 7. The schema

Nothing to do if you granted `db_ddladmin` in step 5. The database itself must already exist, and it
does: step 2 created it. Unlike the Docker posture, the Server cannot create one here.

To apply migrations yourself instead, set `Database__MigrateOnStart=false` and run from a machine with
the .NET SDK and a checkout at the deployed version:

```bash
dotnet tool restore
dotnet ef database update --project src/TrustBridge.Server \
  --connection "Server=tcp:<sqlserver>.database.windows.net,1433;Database=TrustBridge;Authentication=Active Directory Default;Encrypt=True;Command Timeout=3600"
```

Repeat before every upgrade. `Command Timeout=3600` is there on purpose.

## 8. Check it

```bash
az webapp log tail -g <rg> -n <app>
```

Look for the `KeyRingPosture` line naming the protector thumbprint, the vault posture line, and
`Application started`. A cold start takes about a minute before `/healthz` answers. Then:

```bash
curl -s https://<app>.azurewebsites.net/healthz     # Healthy
```

Then sign in at `https://<app>.azurewebsites.net/admin`, set a real password, enroll the second
factor, and remove the two `Admin__Bootstrap__*` settings.

## Operating it

- **Custom domain and certificate.** Workstations connect to whatever hostname you give them, and the
  chain must be one they trust. An App Service managed certificate on a custom domain is the simple
  answer; `*.azurewebsites.net` works too and ties the fleet's configuration to an Azure hostname.
- **Restarts cost more here.** Leave `DOCKER_ENABLE_CI` off and deploy deliberately. Keep Health
  Check on a path that cannot fail on its own.
- **Never scale out.**
