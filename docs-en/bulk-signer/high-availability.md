---
sidebar_label: "High availability and its limits"
sidebar_position: 2.6
---

# High availability and its limits

Cluster mode runs more than one active instance over one operational store and one work share. What it
buys is the three things the feature was asked for: a job is never processed by two instances at once,
an instance dying does not leave work permanently stuck, and the pipeline keeps signing while one host
is gone.

This page is the other half of that sentence — **what it does not buy**, stated up front rather than
discovered in a change window. Everything here applies only where `Cluster:Enabled` is true. Off,
which is every deployment that has not deliberately turned it on, none of it is in effect and the
product is the single-instance one it always was.

The deployment walkthrough is [Azure App Service (cluster mode)](azure.md); the day-2 operator view is
[Operations](operations.md#which-instances-are-alive-cluster-mode-only); the failure catalogue is
[Troubleshooting](troubleshooting.md#cluster-mode).

---

## One supported topology

An **Azure Web App, Linux container, the existing image, scaled out on one App Service Plan.** That is
the whole of it.

The mechanisms do not know that. Everything coordinates through the operational store and the work
share, and nothing is App-Service-specific but the identity derivation and this documentation — so two
on-premises VMs against one SQL Server would run the same code. They are **undocumented, untested and
unsupported**, and three sub-designs that exist only for that shape were deliberately not built:
configuration fingerprints, operator-assigned instance names, and per-host certificate
name-indirection.

One fact about App Service does a great deal of the work and is why the list is one item long: **app
settings are per app, not per instance**, so every instance is identical by construction. The
cross-instance config-divergence hazards — an encryption password differing between hosts, a signing
profile one instance never heard of — cannot occur here. On a topology where they can, they are
unaddressed.

## Upgrades are stop-the-world

Stop the app, deploy, start. There is no rolling restart, no zero-downtime path, and **no deployment
slots**.

A staging slot carrying production's connection string is not a staging environment — it is a second
set of instances joining the cluster on a different application version, sharing the job queue, the
heartbeat table and the work share with the version you are still running. The swap does not introduce
the condition; the slot's first boot does.

The heartbeat's version stamp is the **tripwire, not the guard**: a booting instance that finds live
heartbeats from a different version logs a Critical and carries on. That is deliberate. A hard refusal
would block instances from coming up for as long as a *dead* old-version heartbeat took to go stale —
which is exactly the moment an operator needs them up, because it is the moment after a failed deploy.

So mixed versions are detected and reported, never prevented. Treat the Critical as the alarm it is.

## Session affinity is required

The dashboard is Blazor Server, and a circuit is a stateful SignalR connection that must keep landing
on the instance holding it. App Service ships ARR affinity on by default and it must stay on. This is
documented as a requirement rather than engineered around.

What affinity is **not** doing is keeping people signed in. Both session cookies are Data Protection
payloads, and in cluster mode the key ring moves into the operational store precisely so a cookie
minted by one instance validates on every other. Affinity is for the circuit; the shared ring is for
the cookie. Turning the ring off would produce intermittent sign-outs that no affinity setting fixes.

## Rate-limit budgets are per instance, so the effective limit is ×N

Every rate-limit policy in the product is a per-process limiter. Two instances mean twice the permits;
N instances mean N times.

This is documented rather than fixed. A distributed limiter would be this on-premises product's first
shared-infrastructure runtime dependency, for a control that is coarse by design, and the arithmetic
that matters most — the compensating-control argument for the anonymous approval route — was re-read
with the ×N factor and survives at the small N this topology runs. If you scale past a handful of
instances, re-read it yourself rather than assuming it still holds.

Sizing a budget for a cluster means dividing by the instance count you actually run — and remembering
that the instance count changes when you scale.

`Pipeline:MaxConcurrency` multiplies the same way, and that one is a feature rather than a limitation:
it is per instance, so a fleet of two at concurrency four signs up to eight files at once. Size the
certificate source for that number, not for the configured one.

## Metrics scraping reaches an arbitrary instance

`/api/metrics` is per-process, and App Service's front door cannot target an instance. A Prometheus
scrape therefore lands on whichever instance the load balancer picked, and the series it collects jumps
between instances between scrapes. **Scrape continuity breaks**, and no configuration recovers it.

The recommended cluster observability path is the Application Insights distro — opt-in, instance-aware
natively. See [Telemetry](telemetry.md).

If you keep Prometheus anyway, two gauges have meanings decided rather than inferred, and reading them
wrong under-reports:

- `bulksigner_jobs_awaiting_signer` counts the rows **this instance** polls. `sum()` across the fleet
  is the cluster-wide total with nothing double-counted, a job having exactly one owner. Reading a
  single instance's series as the total is the mistake to expect.
- The same shape applies to every per-instance counter on the page. One instance's numbers are one
  instance's.

`GET /api/folders` carries an `instance` field for the same reason, so a machine client can at least
tell "the folder changed" from "the answer came from somewhere else".

## Logs are ephemeral unless you make them durable

A Linux container's disk vanishes on recycle, and rolled log files with it. `Storage:Root`'s `logs/`
directory is inside the container.

Cluster mode **warns and starts** when `Logging:AzureTable:Enabled` is false: a Critical at startup
naming the loss. It does not refuse, on the product's own severity gradient — an unreachable work share
and an unreachable store both warn and start too, and a boot refusal over a diagnostic stream inverts
that. The never-only-sink rule is untouched, so the file sink stays on either way, on ephemeral disk,
where App Service log streaming reads it live.

:::warning Turning the table sink on has its own cost, and it is a decision to make *before* enabling it
**Nothing prunes that table** and no Azure mechanism can. See
[Retention](retention.md#logs-in-a-table--nothing-prunes-them) and schedule the pruning script.
:::

## A presumed death is a wager

Liveness is heartbeats in the operational store. An instance that is **alive but cannot write them** —
partitioned from the store, or stalled past `Cluster:StaleAfterSeconds` — may have its work taken over
while it is still doing it. The losing case is named rather than hidden.

What bounds the damage is unchanged from single-instance operation, and all three mechanisms predate
cluster mode:

- The staged bytes are **re-hashed immediately before any signature exists**.
- A promote onto an occupied destination is **refused** — a duplicate completion becomes one
  `Completed` job and one `Failed` one, never two delivered artifacts.
- An input is **compared against its staging fingerprint** before it is deleted.

Raise `Cluster:StaleAfterSeconds` where a deployment meets this routinely. The floor is three cadences,
refused at boot below that, because a threshold that short presumes death on one or two missed beats
and a beat goes missing for reasons that are not death.

The mirror image is also stated: an instance that goes stale to its siblings **keeps signing**. It is
not stopped, because this product's standing rule is that an in-flight job runs to natural completion.
It never takes over its own jobs, whatever the table says.

## Rows nobody owns are reconciled by nobody

A job row carrying **no owner** — left by a build older than the ownership column, or by a run with the
mode off — is a row cluster mode will never sweep. Boot recovery takes only this instance's own
identity, a sibling's takes theirs, and takeover follows an owner's heartbeat, of which there is none.

It is reported rather than adopted. Adopting would mean a filter matching null, which matches in
*every* instance simultaneously — the defect the feature removes, arriving through the code that
removes it.

:::note The remedy is real, and is named on every surface that meets one
**Boot once with `Cluster:Enabled = false`**, which sweeps every in-progress row whoever owns it, then
turn the mode back on. Do this once at the upgrade, before the first cluster boot, and it stops being a
concern — the owner is recorded on every claim whether or not the mode is on, and only *read* under it.
:::

Two specifics are worth having in writing because they are worse than they look:

- **A job dispatched to Lacuna Signer with no owner is polled by nobody and no longer times out.**
  `Signer:TimeoutHours` is enforced while a row is being polled, so a row nothing polls is a row
  nothing bounds. Scoping the poll to owned rows removed the last terminal path such a job had. The
  poll worker says so once per process and names the count.
- **A row owned by a *named* instance that has no heartbeat row at all** is stranded the same way and
  takes the same remedy. Absence of a heartbeat is not evidence of death — an owner with no row is
  reported once and left, rather than read as a licence to fail somebody's live work.

## There is no per-instance drain

You cannot ask instance B to finish what it has and stop taking new work. `POST /api/pipeline/pause`
holds **every** instance's worker — the pause flag lives in the one row every worker reads each poll
iteration, so cluster-wide is what the existing control comes to mean, and it is what an operator
pausing "the pipeline" intends.

The answer to "patch instance B" is to stop it and let takeover do its job. Per-instance drain was
deliberately not built.

One consequence of pause being cluster-wide is worth knowing: **takeover sits behind the pause gate.**
An operator pausing a cluster to investigate a store that has gone slow is exactly the person who must
not have every instance declare every sibling dead. The approval-expiry sweep sits in front of the gate
instead, because a wait budget is a wall-clock deadline that pausing does not extend.

## Cross-instance latency is the poll interval

The wake signal is process-local. An enqueue on instance A does not wake instance B's worker; B picks
the job up on its next poll. `Pipeline:PollIntervalSeconds` is therefore the cluster's cross-instance
latency bound — accepted and documented, not engineered around.

The same locality is what makes re-ingestion keep working for free: under all-watch, the instance that
finishes a job always watches the folder it came from, so the process-local signal still reaches a
watcher that owns the path.

## The work-share gate is narrower than the catastrophe it is named for

The marker binds a work share to one operational store, and a booting instance whose store does not
match refuses to start naming both. That catches the shape it is for: a second deployment meeting a
share an established cluster has already marked.

What it does not catch is any moment the marker is **unreadable**, because it refuses on evidence and
never on the absence of it. Two such moments exist — a share carrying no marker yet, and the instant of
a naming write on Azure Files, where the file is briefly full-length zeros. Both are narrowed by one
extra look when a lease is held, not closed. A check that runs once at boot also cannot see a rival
cluster that arrives afterwards.

And the gate is **not** what stops two instances signing one file. The per-file lease and the database
claim are. The marker is for the one catastrophe no database can see: two stores, one share.

## Database backup is unreachable here

`Backup:Enabled = true` under `Database:Provider = SqlServer` is a boot refusal naming both keys — and
cluster mode requires `SqlServer`. The combination is therefore unreachable by construction, which is a
pleasant consequence rather than a gap: the process-wide backup gate needs no distributed replacement.

Backing up the operational store on this topology is your DBMS regime's job. Azure SQL's own
point-in-time restore is the answer, not this product's feature. See
[Retention](retention.md#backup-discipline).

## The session key ring is plaintext in the store

In cluster mode the Data Protection ring is rows in `SessionProtectionKeys`, in plaintext, guarded by
the database's own access control — consistent with a security model in which the connection string
**is** the credential and `keys/` read access is already documented as "a session as anyone".

Two things follow, and the second is the one that is easy to miss:

- **The Windows DPAPI encryptor is dropped under the switch.** Machine-scoped DPAPI is precisely the
  property that makes a copy of `keys/` useless on another host — and precisely the property that makes
  a ring unreadable by a sibling, so keeping it would be keeping the defect. On Windows this is weaker
  at rest. It costs nothing on the supported topology, whose Linux container has no encryption at rest
  for the on-disk ring either, and it is the one place turning the mode on trades a control away rather
  than adding one.
- **An unreachable store fails the request, with no fallback.** A host that could not reach the store
  and quietly minted sessions from a per-instance ring would issue cookies its siblings reject — the
  intermittent sign-out the shared ring removes, arriving through the code that removes it. What that
  failure looks like is the provider's own exception on the request path, not a diagnosed refusal
  naming the ring. The condition is reported where it is diagnosed: the boot check and `/api/ready`'s
  per-instance `database` row.

A first-boot observation, stated so it is not read as a fault: instances that start together all meet an
empty ring, so several can mint an element before any has read another's, and the table can carry more
elements than there were key rolls. Nothing is wrong with that.

## Contention has a cost, and it is a small one

Two instances claiming from one queue conflict routinely, and the batch claim falls back to
one-at-a-time with a logged lost race. In cluster mode that line is demoted to the expected-outcome
level, under its own event id — "a sibling got there first" and "something else on this instance did"
are different facts for a reader.

Related and deliberately **not** a failure: a lease conflict on an input, and an `AlreadyActive` enqueue
outcome. Every instance watches every folder, so losing a race is routine — neither counts toward a
folder's consecutive-failure breaker, and an already-active outcome resets the counter exactly as a
successful enqueue does. See
[Operations](operations.md#contention-between-instances-is-not-a-failure).

## What cluster mode does not change

Listed because each is a rule somebody reasonably expects a clustering feature to have relaxed, and
none of them is:

- **No automatic retry of signatures.** A signature is never re-attempted without a human deciding it.
  The takeover policy walks that edge deliberately: a job that never reached the sign call is
  re-enqueued because *nothing was attempted*; a job past it fails. `Failed` is an honest terminal
  outcome, not "stuck", and the operator's manual retry remains the retry.
- **In-flight jobs are sacred.** `POST /api/jobs/{id}/cancel` is valid for `Queued` jobs only, on every
  instance.
- **Signing profiles and watched folders stay in configuration.** Moving them into the database was
  considered as a prerequisite and dropped when the topology settled — its motive was cross-instance
  consistency, which App Service provides by construction.
- **The approval gate is unchanged.** The rule is still frozen onto the job at the park, a rejection is
  still a veto, and the staged bytes are still re-hashed before any signature exists.
- **`ClearJobs` is terminal-only, and that landed for everyone.** It reports a skipped count on both
  surfaces. Deleting the row under a running sibling's job was the sharpest operator-action hazard in
  the inventory — and deleting it under one's own running worker was already dubious, which is why the
  fix is not gated on the switch.

## What is not a limitation, despite looking like one

- **Pause is cluster-wide.** One call holds every instance, which is what an operator pausing "the
  pipeline" means.
- **Statistics are cluster-wide.** They moved into the operational store and are computed on read, so
  the panel describes the fleet rather than whichever instance answered. What was excluded before is
  still excluded: the awaiting-signer and awaiting-approval waits, and `QueuedAt` rather than
  `CreatedAt` as the queue-wait anchor. See [Job statistics](statistics.md).
- **Approver links, second factors and sessions cross instances.** The verification window lives in the
  operational store keyed by an identifier carried inside the cookie, which predates clustering entirely
  — so a window opened via one instance is honoured via another with nothing added.

---

Related: [Azure App Service (cluster mode)](azure.md) · [Installation](installation.md) ·
[Configuration](configuration.md#cluster--multi-instance-deployment) ·
[Operations](operations.md#which-instances-are-alive-cluster-mode-only) ·
[Troubleshooting](troubleshooting.md#cluster-mode)
