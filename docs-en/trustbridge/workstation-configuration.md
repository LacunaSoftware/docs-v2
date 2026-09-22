---
sidebar_label: "Workstation configuration"
sidebar_position: 7
---

# Workstation configuration

Every setting the Workstation Service takes, and how a fleet install supplies it. The Server's
settings are on [Server configuration](configuration.md); the two hosts share no configuration.
**The Tray App has no configuration file at all** (see the [last section](#the-tray-app-reads-no-configuration-file)).

Every value here has a default, and **most fleet machines change none of it**. Three values travel by
the MSI and Group Policy; the rest live in the settings file the MSI installs beside the binaries.

## How a value reaches a machine

The last one to set a key wins:

| | Source | What supplies it |
|---|---|---|
| 1 | `appsettings.json` beside the binaries | Installed by the MSI under `Program Files`. Nothing in the service ever rewrites it. |
| 2 | `appsettings.Development.json`, user secrets | A developer's console run only. |
| 3 | `HKLM\Software\TrustBridge`, the **preference** | The MSI, from `SERVER_URL`, `PKI_LICENSE` and `INSTALLER_KEY`. A repair or an elevated hand writes the same values to the same place. |
| 4 | Environment variables, `__` for `:` | A console run or a service wrapper. Not how a fleet install works. |
| 5 | Command-line arguments | A console run only. |
| 6 | `HKLM\Software\Policies\TrustBridge`, the **policy** | Group Policy, through the shipped ADMX template. Only the policy engine may write there. |

Three values travel by registry: `ServerUrl` becomes `Server:Url`, `PkiLicense` becomes
`Certificates:Validation:License`, and `InstallerKey` becomes `Server:InstallerKey`. A value
published in the wrong registry type (a `REG_DWORD` where a string was meant) **refuses the start,
naming the location**. **Both registry locations are read once, at start**: a GPO refresh takes effect
at the next service start.

There is **no secret an install gives a machine to join with**. A machine mints its own Workstation
Key, announces itself and waits to be **admitted** by an Administrator. Nothing on this page is pushed
by the Server; the one thing the Server sends a machine is its Trusted CA set, which is trust policy
rather than configuration.

Value shapes are the Server's: `:` in a file and `__` in the environment, durations as `[d.]hh:mm:ss`
with the twenty-four-days trap, sizes as plain integers.

## Reaching the Server

```json
{
  "Server": {
    "Url": "https://trustbridge.example.com",
    "InstallerKey": "MIGHAgEAMBMGByqGSM49…",
    "InitialReconnectDelay": "00:00:01",
    "MaxReconnectDelay": "00:01:00"
  }
}
```

### `Server:Url`

**Default** unset · **Fleet install** the MSI writes `SERVER_URL` to `HKLM\Software\TrustBridge\ServerUrl`; Group Policy overrides it at `HKLM\Software\Policies\TrustBridge\ServerUrl` · **Bad value** refuses the start

Where this machine's Server is. **Required, and it must be an absolute URI.** The MSI refuses an
empty or scheme-less value first, at its launch condition; the service's start-time check is the
backstop. The Tray App shows this URL and can never set it: whoever writes it decides where the
machine asks to be admitted, so the write stays behind an elevation boundary.

### `Server:InstallerKey`

**Default** the product's own key · **Fleet install** the MSI writes `INSTALLER_KEY` to `HKLM\Software\TrustBridge\InstallerKey`, only on a deployment that minted one · **Bad value** refuses the start

The Installer Key this machine signs its admission request with, besides its own: base64 DER PKCS#8,
ECDSA P-256. It shows the request came from the genuine product and is **not authentication of
anything**; every copy of TrustBridge holds the product's private half. A deployment that wants a key
of its own configures the public half on the Server under `Admission:InstallerKeys` and delivers the
private half here. Set it on the machines **before** the Server stops trusting the old key. Not a
secret. Deliberately not on the ADMX template.

### `Server:InitialReconnectDelay` and `Server:MaxReconnectDelay`

**Default** 1 s and 1 min · **Fleet install** never touched · **Bad value** non-positive, or a ceiling below the floor, refuses the start

Where the reconnect backoff starts after the channel drops, and the ceiling it climbs to. **A machine
that cannot reach its Server retries at this cadence indefinitely.** Two failures are logged at
`Error` so they can be told from a blip: the Server answered 401 on the channel (admission withdrawn
or revoked), and the Server refused the admission request (revoked, untrusted Installer Key, too many
requests from the address, or a full queue; the log names all four). Waiting to be admitted is not a
failure and is logged once at `Information`.

## Certificate detection

```json
{
  "Certificates": {
    "SweepInterval": "00:01:00",
    "ValidationInterval": "01:00:00",
    "ChangeDebounce": "00:00:02"
  }
}
```

| Key | Default | Meaning |
|---|---|---|
| `Certificates:SweepInterval` | 1 min | The always-on reconciliation sweep: an enumerate-and-diff of every store, covering a missed change trigger or a token that never shows up as a smart card. Non-positive refuses the start. |
| `Certificates:ValidationInterval` | 1 h | How often every certificate present is fully validated again, so a revocation, an expiry or a lapsed grace window surfaces within one interval. |
| `Certificates:ChangeDebounce` | 2 s | How long the pipeline waits after a change signal before enumerating, so a card arrival coalesces and the middleware has time to make the certificates readable. Outside zero to 5 minutes refuses the start. Undershooting costs a whole sweep; overshooting costs a second of latency. |

## The certificate stores

```json
{
  "Certificates": {
    "WindowsStore": { "Enabled": true },
    "Pkcs11": { "Modules": "C:\\Windows\\System32\\eTPKCS11.dll;C:\\Vendors\\uncommon-p11.dll" }
  }
}
```

### `Certificates:WindowsStore:Enabled`

**Default** `true` · **Fleet install** an administrator's choice · **Bad value** refuses the start

Whether the machine-wide Windows certificate store (`LocalMachine\My`) is read for A1 certificates.
On, an A1 installed there enumerates, validates and announces like any other certificate, with the
reader skipping everything that is not a signing identity (no private key, or no e-CPF CPF). The
store's change notification is held open so an import announces within `ChangeDebounce`. Off, nothing
on the machine opens that store. Read once at start.

An A1 certificate announces and is visible at the Tray App, but a Signing Session over it still
expects a PIN no A1 has, so sessions and signatures over an A1 Workstation Certificate refuse until the
PIN-less flow ships. An A1 imported into the Certificate Vault is the supported way to sign with one
today.

### `Certificates:Pkcs11:Modules`

**Default** unset, meaning the shipped vendor list · **Fleet install** never touched on a machine with common middleware · **Bad value** a module that will not load is that store failing in the log, not a refused start

The PKCS#11 vendor modules A3 tokens are read through, as **one semicolon-separated string of
absolute paths**. Three states:

- **Unset** is the shipped default list: SafeNet Authentication Client, SafeSign IC, Watchdata
  PROTON, Feitian ePass2003, Idemia AWP and Thales IDPrime, at the paths those vendors install to,
  probed by file existence. **Common fleets get token detection with zero configuration.**
- **Set** is exactly what is listed, wholesale; nothing is probed and no default is kept. This is how
  an uncommon middleware is added, at the price of also listing the common ones the machine needs.
- **Set empty** turns A3 detection off. From an environment variable, off is
  `Certificates__Pkcs11__Modules=";"`, because a variable that does not exist reads as unset.

Each module is its own store and they fail alone: one failing middleware costs only that vendor's
certificates, which degrade to `STALE` over the grace window. Enumeration never involves a PIN and
spends nothing on a token's retry counter. Read once at start.

## Certificate validation and the PKI SDK licence

The same section name and the same policy the Server reads. Four things are different on a
workstation, each called out below.

```json
{
  "Certificates": {
    "Validation": {
      "License": "PD94bWwgdmVyc2lvbj0…",
      "UseIcpBrasil": true,
      "UseMachineRootStore": false,
      "UseLacunaTestPki": false,
      "UseServerTrustedCas": true,
      "TrustedRootPaths": ["C:\\ProgramData\\TrustBridge\\anchors\\your-root.pem"],
      "RevocationGraceWindow": "1.00:00:00",
      "RevocationTimeout": "00:00:05",
      "CheckTimeout": "00:00:30"
    }
  }
}
```

### `Certificates:Validation:License`

**Default** unset · **Fleet install** the MSI writes `PKI_LICENSE` to `HKLM\Software\TrustBridge\PkiLicense`; Group Policy overrides it at `HKLM\Software\Policies\TrustBridge\PkiLicense` · **Bad value** a stale or garbled licence is a `Critical` line at start; a registry value of the wrong type refuses the start

**Required on every machine, which is the first difference from the Server.** Here the SDK is what
reads a certificate at all, so without a licence **every certificate on the machine reports
`UNTRUSTED`** and the machine signs nothing. The value is the licence itself, base64-encoded on one
line, not a path. The policy location is on the ADMX template on purpose: a licence expiry is
otherwise a fleet outage, and a GPO update is how a renewal reaches the fleet, each machine picking it
up at its next service start.

### The anchor sources

| Key | Default | Meaning |
|---|---|---|
| `Certificates:Validation:UseIcpBrasil` | `true` | The ICP-Brasil roots the SDK carries. Turning it off is a trust decision. |
| `Certificates:Validation:UseMachineRootStore` | `false` | **The second difference: here it does something.** Trusts every public CA in the Windows root program, a far broader set than ICP-Brasil. |
| `Certificates:Validation:UseLacunaTestPki` | `false` | Also trust the Lacuna Test PKI. **Development only**: Lacuna publishes the matching private keys. The service says so at `Critical` every start. |

### `Certificates:Validation:UseServerTrustedCas`

**Default** `true` · **Fleet install** the settings file the MSI installs (this key has no registry row, so no GPO reaches it) · **Bad value** refuses the start

**The third difference: this key does something only on a machine.** Whether the machine composes the
Server's **Trusted CA**s into its own anchor set. On, the machine asks the Server for the set after
every handshake and re-asks when the Server says it changed, so a CA an Administrator adds on the
Trusted CAs screen reaches this machine's verdicts in seconds. The last set received is cached locally
and stays in force while the Server is unreachable: a Server that does not answer has not said
anything, and only a Server answering, including answering *no Trusted CAs*, replaces what the machine
holds.

**While this machine holds a non-empty set from the Server, `TrustedRootPaths` is disregarded
entirely**, and the service says so at `Critical`, naming the dropped paths. A control that only ever
added trust could never withdraw it.

Off, the machine never asks and validates against its own configuration only, `TrustedRootPaths`
included: the posture for a fleet with its own change-controlled anchor pipeline. Turning it off
across a fleet is a settings-file change on each machine, and is worth planning **before** the Server
is upgraded to protocol 2 rather than after. Either way the machine reports which posture it is in on
every connect, and the fleet screen shows it per machine.

### `Certificates:Validation:TrustedRootPaths`

**Default** empty · **Fleet install** an administrator's choice, deployed with the anchor files · **Bad value** an unreadable file is a `Critical` line, not a refused start

How a private CA is added from a file on this machine. **No longer the last word**: the supported way
to trust a private CA fleet-wide is a Trusted CA added once on the Server. This key still decides the
whole answer on a machine whose `UseServerTrustedCas` is off, one that has never heard from a Server,
one whose Server has no Trusted CAs, or one still on protocol 1.

**The fourth difference: these must be absolute paths.** Anyone who can add a file here can make a
certificate of their own validate as `ACTIVE`, so the files belong under
`C:\ProgramData\TrustBridge\anchors\`, whose ACL the installer owns. With no anchors at all, the
service still starts and every certificate reads `UNTRUSTED`, with a `Critical` line naming the
settings; anchor files carrying only intermediates get a second, different line.

### The revocation bounds

| Key | Default | Meaning |
|---|---|---|
| `Certificates:Validation:RevocationGraceWindow` | 24 h (`1.00:00:00`) | How long the last successful revocation check keeps a certificate `ACTIVE` while its CA cannot be reached; past it the certificate goes `STALE`. Widening this is how long a revoked certificate keeps signing while its CA is unreachable. Negative refuses the start. |
| `Certificates:Validation:RevocationTimeout` | 5 s | How long one CRL download or issuer fetch may take before the CA counts as unreachable. Non-positive refuses the start. |
| `Certificates:Validation:CheckTimeout` | 30 s | The outer bound on one certificate's whole check. Validation passes serialize on the machine, so an unbounded check stalls every certificate behind it. Zero waits indefinitely. |

### While the Server and this machine are on different versions

`UseServerTrustedCas` only does anything over a channel at **protocol 2**, and a Server and a fleet
are never upgraded in the same minute. The rollout order is **the Server first, the workstations
within one release**, and it has teeth:

- **A Server ahead of this machine connects, and simply never asks.** A machine on protocol 1
  handshakes, signs and reports verdicts as it always has, and keeps validating against its own
  `TrustedRootPaths`. A Trusted CA added on the Server does not reach it, and the fleet screen shows
  *Needs update* against its row.
- **This machine ahead of its Server does not connect at all.** The older Server refuses the
  handshake (*Protocol version 2 is newer than this server's supported window (0–1); update the Server
  first*), and this machine **cannot sign** until the Server catches up.

## The Service–Tray channel

The named-pipe channel between the service and the Tray App. Its ACL admits interactive users and
that is the whole of its access control. **A fleet install touches none of this.**

```json
{
  "Tray": {
    "PipeName": "TrustBridge.WorkstationService",
    "PromptTimeout": "00:01:30",
    "MaxConsecutivePinFailures": 3,
    "PinFailureCooldown": "00:05:00",
    "LogBufferSize": 500
  }
}
```

| Key | Default | Meaning |
|---|---|---|
| `Tray:PipeName` | `TrustBridge.WorkstationService` | The pipe the service listens on. Configurable only so a developer can run a second instance; the Tray App dials the well-known name and has no setting of its own. Blank refuses the start. |
| `Tray:PromptTimeout` | 90 s | How long a PIN prompt stays on the user's screen before the service gives up on it. **Deliberately looser than the Server's `Sessions:PinPromptTimeout` (60 s), and it must stay so**: a Server that has given up cannot tell this machine to take the prompt down, so this window is what ends every unanswered prompt. |
| `Tray:MaxConsecutivePinFailures` | 3 | How many PINs one token may reject in a row before entries for that certificate are refused without being passed on. Bounds a process asking thousands of times, not a person: a user can still lock their own token by mistyping. Zero refuses the start. |
| `Tray:PinFailureCooldown` | 5 min | How long entries for a certificate are refused once that limit is reached. Not a token state; no PUK is involved. |
| `Tray:LogBufferSize` | 500 | How many recent log entries the service keeps for the Tray's diagnostics pane. Memory only. |

## The PIN Cache

**Local and administrator-owned.** The Server pushes nothing here, no Tray or API call can change it.
One line at every start says which posture the machine is in.

```json
{
  "PinCache": {
    "SurviveRestart": false,
    "Ttl": "08:00:00",
    "SweepInterval": "00:05:00",
    "StorePath": "C:\\ProgramData\\TrustBridge\\pin-cache.dat",
    "KeyRingPath": "C:\\ProgramData\\TrustBridge\\keys"
  }
}
```

### `PinCache:SurviveRestart`

**Default** `false` · **Fleet install** an administrator's choice, and a documented deviation

Whether cached PINs survive a service restart or a reboot. **Off**, the entries are encrypted under a
key ring that exists only in the running process, so stopping the service destroys the means to read
them. **On**, the key ring is persisted under `KeyRingPath` protected with DPAPI machine scope, and
the ciphertext goes to `StorePath` in a file whose ACL admits SYSTEM and Administrators only. Either
way the TTL is sealed inside the ciphertext, so a restart cannot reset it and editing the file cannot
extend it.

Turning it on is a documented deviation from the ICP-Brasil middleware requirement's termination
trigger (REQUISITO-MW II.27), which TrustBridge treats as a guideline because it sits above the
vendor's middleware. A machine running with it on says so at `Warning` on every start.

### The rest of the PIN Cache

| Key | Default | Meaning |
|---|---|---|
| `PinCache:Ttl` | 8 h | How long an entry lives **without being used**. Sliding: each use refreshes the expiry, so a daily-active user is never re-prompted. Non-positive refuses the start. |
| `PinCache:SweepInterval` | 5 min | How often idle entries are swept out of memory. Nothing can obtain an expired PIN regardless. |
| `PinCache:StorePath` | `%ProgramData%\TrustBridge\pin-cache.dat` | Where the ciphertext is written. Never written while survival is off. |
| `PinCache:KeyRingPath` | `%ProgramData%\TrustBridge\keys` | Where the persisted key ring lives. Unused while survival is off. |

## Logging

The framework's own configuration, in the same shape as the Server's. The shipped file sets `Default`
to `Information` and quietens two SignalR client categories to `Warning`. Two lines an administrator
should recognise at the default level: which PIN Cache posture the machine is in (every start), and
that the fake-token development harness is active (every start, on any machine with a `FakeTokens`
section). **A `FakeTokens` section does not belong on a machine anybody signs from**: it makes
fabricated certificates validate as `ACTIVE`.

## The Tray App reads no configuration file

There is no `appsettings.json` for the Tray App. Its options are constructed in code: the pipe name
and protocol version it dials, its reconnect delay and its prompt-expiry grace are compiled in, and
the language it shows comes from the signed-in user's own Windows UI culture rather than from a
setting. What shapes the channel between the two is the `Tray` section above, which the **service**
reads.
