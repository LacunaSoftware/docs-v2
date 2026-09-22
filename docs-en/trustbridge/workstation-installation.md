---
sidebar_label: "Workstation installation"
sidebar_position: 6
---

# Workstation installation

**One MSI, one `msiexec` line, and a bare machine is waiting in the admission queue.** The package
`TrustBridge-Workstation-<version>-x64.msi` carries both workstation components, the Workstation
Service and the Tray App, published self-contained, so a machine with no .NET runtime needs nothing
installed first. Beside it Lacuna Software provides
`TrustBridge-Workstation-GroupPolicy-<version>.zip` with the Group Policy templates.

This page is what an operator **types**. [Workstation configuration](workstation-configuration.md)
is what each value may **say**: every setting the service takes, its default and what a bad one does.

## Before you start

- **A 64-bit Windows machine and administrative rights on it.** The package is per-machine, x64 only,
  and needs Windows Installer 5.0 (Windows 7 and later). ARM64 is not supported.
- **Nothing else installed.** Both components are self-contained, which is what makes the package
  about 100 MB.
- **The Server's URL, reachable from the machine.** The one value the install refuses to proceed
  without.
- **The PKI SDK licence**, the whole of a `LacunaPkiLicense.config` base64-encoded on one line. The
  installer does not enforce it, and a machine without one validates nothing and signs nothing.
- **An Administrator who will admit the machine.** Installing does not join the fleet; a person does,
  on the Server.
- **A TLS chain the machine trusts.** The Workstation Service refuses an untrusted Server certificate,
  and the symptom is a machine that never appears in the queue.

## The one line

```powershell
msiexec /i TrustBridge-Workstation-1.0.1-x64.msi /qn SERVER_URL=https://trustbridge.example.com PKI_LICENSE=<base64>
```

That is a complete fleet install. In order, it:

1. Checks `SERVER_URL` and fails the whole transaction if it is empty or not scheme-prefixed.
2. Lays both components under `C:\Program Files\TrustBridge\`, creates the machine-state tree under
   `C:\ProgramData\TrustBridge\` with a DACL admitting only Administrators and LocalSystem, and
   registers the Tray App's autostart entry.
3. Writes the install-time configuration to `HKLM\Software\TrustBridge`.
4. Registers **TrustBridge Workstation Service** with the SCM (LocalSystem, automatic start,
   restart-on-failure) and starts it, waiting for the start to succeed.
5. The service mints its **Workstation Key** in the machine's TPM (falling back to the software
   provider), announces itself to the Server, and stands **Pending** in the admission queue.

**The install's last act is the service coming up.** A service that refuses to start (a licence the
SDK will not read, an `INSTALLER_KEY` that is not a key) fails the install and rolls it back, rather
than leaving a machine that looks installed and never connects.

**`msiexec` does not wait.** It returns immediately, and the next line of a deployment script runs
while the install is still going. To read the outcome, wait for the process:

```powershell
$install = Start-Process msiexec -Wait -PassThru -ArgumentList @(
    '/i', 'TrustBridge-Workstation-1.0.1-x64.msi',
    '/qn',
    '/l*v', 'C:\Windows\Temp\trustbridge-install.log',
    'SERVER_URL=https://trustbridge.example.com',
    'PKI_LICENSE=PD94bWwgdmVyc2lvbj0…'
)
$install.ExitCode
```

Exit codes are Windows Installer's own: **0** succeeded, **1602** cancelled, **3010** succeeded and
something wants a reboot, **1603** fatal error, which is what both of this package's own refusals
surface as. The reason is a line in the `/l*v` log; search it for `SERVER_URL` or `newer version`.

### The three properties

All three are written to `HKLM\Software\TrustBridge` as registry values rather than into a settings
file, which is what makes them survive an upgrade with no remember-the-property machinery.

| Property | Registry value | Configuration key | |
|---|---|---|---|
| `SERVER_URL` | `ServerUrl` | `Server:Url` | **Required**, unless the build baked in a default. Gated by the launch condition. |
| `PKI_LICENSE` | `PkiLicense` | `Certificates:Validation:License` | Optional to the installer; a machine without it signs nothing. |
| `INSTALLER_KEY` | `InstallerKey` | `Server:InstallerKey` | Optional. Most deployments never pass it. |

`PKI_LICENSE` is optional only in the sense that the MSI does not check it. Without a licence every
certificate on the machine reports `UNTRUSTED`, and the service says so once at start. Pass it, or
publish it by Group Policy before the machine is expected to work.

`INSTALLER_KEY` is for a deployment that minted an Installer Key of its own and configured its public
half on the Server under `Admission:InstallerKeys`. Left unset, no value is written and the product's
own key applies. It is not a secret and admits nothing on its own.

None of the three should need quoting. A URL has no spaces, and the licence and the key are base64
on one line.

### The launch condition

**`SERVER_URL` must be present and begin `http://` or `https://`**, or the transaction fails before
anything is written. Silent and interactive alike; install, upgrade and repair alike, though an upgrade
and a repair satisfy it from the machine's own value without you passing anything. The one transaction
it does not gate is removal. A service refusing at start would be a machine crash-looping, discovered
when somebody cannot sign; a refused install is one loud failure while somebody is watching.

A build can carry a default Server URL baked in, so the fleet line becomes `msiexec /i <msi> /qn` and
the interactive field arrives pre-filled. A value on the line still wins, and so does the value a
machine already holds.

### What an install puts on the machine

| | |
|---|---|
| `C:\Program Files\TrustBridge\Workstation Service\` | The service and its self-contained runtime |
| `C:\Program Files\TrustBridge\Tray App\` | The Tray App and its own |
| `C:\ProgramData\TrustBridge\` | Machine state: the PIN Cache, its key ring, the cached Trusted CA set. Administrators and LocalSystem only |
| `C:\ProgramData\TrustBridge\anchors\` | Where trust anchor files go, same DACL |
| `HKLM\Software\TrustBridge` | The three install-time values |
| `HKLM\…\CurrentVersion\Run` → `TrustBridge Tray App` | Machine-wide autostart, so the Tray runs for every interactive user |
| Service `TrustBridge Workstation Service` | LocalSystem, automatic, restarts three times on failure at one-minute intervals |
| Application event source `TrustBridge Workstation Service` | Where a refusal before logging exists, and an uninstall's purge report, is written |

The install directory is fixed. The **Workstation Key** is not in this table because the service mints
it into a CNG container the first time it starts, and nothing but the service's own purge verb can
remove it.

**The Tray App does not appear until the next sign-in.** On a machine somebody is already signed
into, the icon arrives after they sign out and in again, or when `Tray App\TrustBridge.TrayApp.exe` is
started by hand. Until it is running there is nobody to answer a PIN prompt.

## Installing interactively

Double-clicking the MSI gives one screen of this package's own inside the stock progress and finish
screens: on a bare machine, a single **Server URL** field over the same `SERVER_URL` property; on a
machine that already has the package, a **repair, re-point or remove** screen with the field
pre-filled. There is no EULA, no directory chooser and no feature tree. **The dialogs are English
only**, deliberately: they are deployment tooling for the operator. The Tray App a user sees speaks
the user's language.

The licence and the Installer Key have no field. Give a single interactive machine either by a silent
repair line or by Group Policy.

## Admitting the machine

**Installing does not join the fleet.** The machine announces itself and waits, **Pending**, until an
Administrator makes it **Admitted** on the admission queue at `/admin/admission`. Until then the
service is running, reaching the Server, and connecting to nothing; its log says why at each
reconnect, and the Tray App says *waiting to be admitted*.

What admitting means is bounded, and the screen says so: with no out-of-band channel to check a
fingerprint against, admitting is a rate-limited human gate over a queue. A machine is *noticed*
rather than *verified*. What makes that acceptable is that it is not optional; nothing a machine holds
admits it on its own. Read the machine's hostname, operating system, versions and **key posture**
(hardware or software) before admitting it.

Once admitted, the machine connects on its next reconnect attempt and appears on the fleet screen at
`/admin/fleet`. A machine sent back to Pending keeps its key and its history; a machine **Revoked** is
refused permanently and has no way back except as a new machine with a new key.

An abandoned Pending request lapses after `Admission:PendingExpiry` (7 days by default, counted from
the machine's **last** request) and its row is deleted. That is not a refusal; the machine simply
asks again as one the platform has never seen.

### If the machine never appears in the queue

Read the service's own account first: the Windows Application log, source **TrustBridge Workstation
Service**, and the service's log. Four things cause a refused admission request, and the Server
deliberately does not say which, so the machine's log names all four: the machine was revoked; its
Installer Key is one this Server does not trust; too many requests came from its address; or the
queue is full. The last two clear themselves.

**The service says where each of its three install-time values came from, at every start**, one line
per value in the form *`Server:Url` is https://…, supplied by …*. Read that before touching the
registry.

```powershell
sc.exe query "TrustBridge Workstation Service"
Get-ItemProperty 'HKLM:\Software\TrustBridge'
Get-ItemProperty 'HKLM:\Software\Policies\TrustBridge' -ErrorAction SilentlyContinue
```

**Run those from a 64-bit PowerShell.** The preference lives in the 64-bit registry view; a 32-bit host
is redirected to `WOW6432Node`, where a perfectly configured machine looks bare.

Two locations, because the second one wins: a Group Policy value at
`HKLM\Software\Policies\TrustBridge` beats what the installer wrote, and a machine pointing at the
wrong Server is usually a machine in a GPO's scope somebody forgot about. Both are read **once, at
start**.

## Group Policy: deploying the templates

The ADMX template lets a domain set two values across a fleet: `Server:Url` and
`Certificates:Validation:License`. It is never installed by the MSI: nothing the package writes may
live under `\Policies`, because policy processing deletes the values it stops managing. Unzipped, the
release's template archive is three files:

```text
admx\TrustBridge.admx
admx\en-US\TrustBridge.adml
admx\pt-BR\TrustBridge.adml
```

Copy them into the domain's central store, language folders included:

```powershell
$store = "\\$env:USERDNSDOMAIN\SYSVOL\$env:USERDNSDOMAIN\Policies\PolicyDefinitions"
New-Item -ItemType Directory -Force -Path $store, "$store\en-US", "$store\pt-BR" | Out-Null
Copy-Item admx\TrustBridge.admx $store
Copy-Item admx\en-US\TrustBridge.adml "$store\en-US"
Copy-Item admx\pt-BR\TrustBridge.adml "$store\pt-BR"
```

The `New-Item` line is not ceremony: `Copy-Item` to a folder that does not exist creates a *file* with
that name, and a store in that state is broken in a way nothing complains about. A machine with no
central store takes the same three files under `%SystemRoot%\PolicyDefinitions`. Either way the
settings appear under **Computer Configuration → Administrative Templates → TrustBridge Workstation**.

**Copy both languages even if your administrators read English.** `gpedit` falls back per file rather
than per string, so a store missing `pt-BR\TrustBridge.adml` costs a Brazilian console the whole
template.

**A policy change is a service restart, not a Group Policy refresh.** The service reads both registry
locations once, at start. `gpupdate /force` delivers the value, and the machine picks it up at the next
start of the service:

```powershell
Restart-Service "TrustBridge Workstation Service"
```

**Renewing the licence is what the second policy is for.** Without a current licence every certificate
on every machine reports `UNTRUSTED`, so an expiry is otherwise a fleet-wide outage answered by
re-running the MSI everywhere. Published as a policy it is one update and a restart wave.

There is deliberately no policy for the Installer Key: a key change is a staged rollout (name the new
key beside the old one on the Server, update the machines, drop the old entry), not a GPO refresh.

## Repairing and re-pointing

A repair reinstalls the package and rewrites the three registry values from the properties, which is
how you change a machine's install-time configuration without uninstalling it:

```powershell
# Repair: put back what a machine lost, keeping its current configuration.
msiexec /i TrustBridge-Workstation-1.0.1-x64.msi /qn REINSTALL=ALL REINSTALLMODE=ecmus

# Re-point: the same transaction, with a new value.
msiexec /i TrustBridge-Workstation-1.0.1-x64.msi /qn REINSTALL=ALL REINSTALLMODE=ecmus `
    SERVER_URL=https://trustbridge-2.example.com
```

A property you do not pass is re-read from the machine and written back unchanged. The service is
stopped and started by the transaction, so a re-point takes effect when the repair finishes. The
machine keeps its Workstation Key, so it is the same workstation to its Server. A re-point to a
*different* Server arrives in that Server's queue as a new Pending machine.

## Upgrading

**A newer MSI installs over an older one. That is the whole procedure.**

```powershell
msiexec /i TrustBridge-Workstation-1.1.0-x64.msi /qn
```

No properties are needed; the new package reads the machine's existing values before the old product
is removed and writes them back. An upgraded machine is the same workstation:

| Survives an upgrade | Why |
|---|---|
| The **Workstation Key** | It lives in a CNG container no installer table names |
| The **PIN Cache**, its key ring, the cached Trusted CA set | Files under `C:\ProgramData\TrustBridge\` that no component carries |
| `ServerUrl`, `PkiLicense`, `InstallerKey` | Re-written from the machine's own values |
| The pt-BR user interface | The satellite assemblies are replaced rather than stranded |

The Tray App is closed by the installer on the way through, so an upgrade does not end in a reboot.
**A downgrade is refused**: going back is a true uninstall, with everything the next section says.

**Upgrade the Server first, then the workstations, within one release.** A workstation whose protocol
version is newer than its Server's supported window cannot connect at all until the Server catches
up. See [Operations](operations.md#rollout-order-server-first-then-the-fleet).

## Removing a machine

**An uninstall is the machine's exit from the platform, and it is not the reverse of an upgrade.**

```powershell
msiexec /x TrustBridge-Workstation-1.0.1-x64.msi /qn
```

Or, without the MSI to hand, by product code:

```powershell
$product = Get-ChildItem HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall |
    Where-Object { $_.GetValue('DisplayName') -eq 'TrustBridge Workstation' }
Start-Process msiexec -Wait -ArgumentList "/x $($product.PSChildName) /qn"
```

What removal destroys, and nothing else does:

| | |
|---|---|
| The **Workstation Key** | Deleted from both the TPM and the software store by the service's own `purge-machine-identity` verb, which the uninstall schedules |
| `C:\ProgramData\TrustBridge\` | The whole machine-state tree: PIN Cache, key ring, cached Trusted CA set, anchors |
| `HKLM\Software\TrustBridge` | All three values |
| The service, the Tray App, the autostart entry | Ordinary removal |
| `HKLM\Software\Policies\TrustBridge` | **Untouched.** It is the policy engine's |

The purge runs on a true uninstall and **never** on the uninstall leg of an upgrade. An uninstall
completes even when the purge does not; the verb then writes a loud Application log entry naming what
it left behind.

**Revocation on the Server is the control that does not need the machine's cooperation.** Revoke a
removed machine from its panel on the fleet screen at `/admin/fleet`. **Reinstalling afterwards
produces a genuinely new machine**: it returns to the queue with a new fingerprint, and its holders
re-enter their PINs.

## When an install fails

| What you see | What it is | What to do |
|---|---|---|
| Exit code **1603**, log names `SERVER_URL` | The launch condition | Pass `SERVER_URL=https://…`. The scheme is not optional. |
| Exit code **1603**, log says a newer version is installed | A downgrade | Remove the newer package first, having read *Removing a machine*. |
| Rolls back at *Starting services* | The service refused to start: a licence the SDK will not read, an `INSTALLER_KEY` that will not parse, or a registry value of the wrong type | The Application event log names the value it refused. |
| A files-in-use screen listing the Tray App | An interactive upgrade or removal | Continue. The Tray is terminated before any file is touched; no reboot results. |
| Succeeded, but the machine is not in the queue | Almost always the URL; occasionally a policy value overriding what you passed | *If the machine never appears in the queue* above. |
| Succeeded, but every certificate reads `UNTRUSTED` | No PKI licence, or an expired one | Pass `PKI_LICENSE`, or publish it by Group Policy, then restart the service. |
