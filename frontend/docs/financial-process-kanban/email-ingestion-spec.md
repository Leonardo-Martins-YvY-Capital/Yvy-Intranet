# Email Ingestion — Integration Spec (Microsoft Graph)

> How inbound emails to the finance mailbox become `KanbanCard`s. Built **behind an abstraction** so all code is testable now with simulated notifications; live Entra credentials are wired in when IT provisions them. Companion to [`index.md`](./index.md) and [`kanban-card-spec.md`](./kanban-card-spec.md).

| | |
|---|---|
| **Status** | Draft for review — no code yet |
| **Scope this chunk** | Full vertical slice: webhook + notification processing + card creation + subscription lifecycle |
| **Layers** | `Yvy.Application` (abstraction), `Yvy.Infrastructure` (Graph + jobs), `Yvy.Api` (webhook) |
| **Templates mirrored** | `Outbox/ProcessOutboxMessagesJob.cs`, `Endpoints/Funds/FundEndpoints.cs`, `DependencyInjection.cs` |

> Microsoft Graph subscription/notification semantics (validation handshake, `clientState`, expiry limits, app-only auth) **must be confirmed against official Microsoft docs during the build** (`source-driven-development`). Specific numbers below (e.g. expiry windows) are marked *confirm* and are not yet authoritative.

---

## 1. Flow Overview

```
Graph (mailbox: financeiro@yvy.capital)
   │  change notification (new mail)
   ▼
POST /api/v1/webhooks/graph/email      ← validate clientState, persist, return 202 fast
   │
   ▼
InboundEmailNotification (table)        ← durable queue, dedup by MessageId
   │  Quartz: ProcessInboundEmailsJob (every ~10s)
   ▼
IInboundEmailGateway.GetMessageAsync    ← fetch full body + attachments (Mail.Read)
   │
   ▼
CreateCardFromEmailCommand (MediatR)    ← idempotent → KanbanCard in "Recebido"
   │  domain event via Outbox → Quartz
   ▼
(future) notify manager / V2 Asaas payment
```

Two design rules drive this shape:
- **Respond fast.** The webhook persists and returns **202** immediately; all fetching/mapping happens in a background job. Graph drops slow subscribers, so no Graph calls happen inside the request.
- **Idempotent.** Duplicate notifications are expected; dedup on the Graph `MessageId` (unique index) so a message can never create two cards.

---

## 2. The Abstraction: `IInboundEmailGateway`

Defined in `Yvy.Application/Abstractions/IInboundEmailGateway.cs`. Two responsibilities:

```
// message access
Task<ErrorOr<InboundEmailMessage>> GetMessageAsync(string messageId, CancellationToken ct);

// subscription lifecycle
Task<ErrorOr<GraphSubscription>> CreateSubscriptionAsync(CancellationToken ct);
Task<ErrorOr<GraphSubscription>> RenewSubscriptionAsync(string subscriptionId, CancellationToken ct);
Task DeleteSubscriptionAsync(string subscriptionId, CancellationToken ct);
```

(`InboundEmailMessage` / `GraphSubscription` are plain application DTOs, not Graph SDK types — keeps the SDK out of the application layer.)

Two implementations, selected by environment/config:

| Implementation | Use | Behavior |
|---|---|---|
| `SimulatedInboundEmailGateway` | Development + integration tests (**default until creds exist**) | Serves stored sample notifications/messages from test fixtures; subscription methods are no-ops returning a fake subscription. |
| `GraphInboundEmailGateway` | Production once Entra is provisioned | Typed `HttpClient`, app-only (client-credentials) auth, `Mail.Read` application permission. Built now, inert until configured. |

This is the core of the "build behind abstraction" decision: every downstream component depends only on `IInboundEmailGateway`, so the whole pipeline is exercised end-to-end with the simulated gateway and zero IT dependency.

---

## 3. Webhook Endpoint

`Yvy.Api/Endpoints/Webhooks/GraphEmailWebhookEndpoints.cs` (implements `IEndpoint`, registered like `FundEndpoints.cs`). Route: `POST /api/v1/webhooks/graph/email`.

**a. Validation handshake.** When a subscription is created, Graph calls the endpoint with `?validationToken=<token>`. The endpoint must respond **200** with the token as **`text/plain`**, promptly. *(Confirm exact content-type/timeout rules via docs.)*

**b. Change notifications.** Body shape *(confirm)*:
```
{ "value": [ { "subscriptionId", "clientState", "changeType", "resource", "resourceData": { "id" } } ] }
```
Steps:
1. Validate every item's `clientState` equals the configured secret → reject (and log a scrubbed warning) on mismatch.
2. Upsert an `InboundEmailNotification` per item (dedup by `MessageId` = `resourceData.id`).
3. Return **202 Accepted** immediately. No Graph calls here.

The endpoint is **anonymous** (Graph is unauthenticated to us) but protected by `clientState` + later validation of the message via Mail.Read; it is the one public-facing untrusted entrypoint, so §6 hardening applies in full.

---

## 4. Async Processing — `ProcessInboundEmailsJob`

Quartz job mirroring `ProcessOutboxMessagesJob.cs` (`[DisallowConcurrentExecution]`, batch of N, runs ~every 10s):

1. Load unprocessed `InboundEmailNotification` rows.
2. For each: `IInboundEmailGateway.GetMessageAsync(messageId)` → full body + attachments.
3. Determine `ProcessType` (V1: by which mailbox/folder/address received it; default + open question §7).
4. Send `CreateCardFromEmailCommand` via `ISender`. Handler is idempotent (`ExistsByMessageIdAsync`) so re-runs are safe.
5. Mark the notification processed (or record `Error`, like the outbox job).

Failures are isolated per-row (try/catch per item, same as the outbox job) so one bad message can't stall the batch.

---

## 5. Subscription Lifecycle — `ManageGraphSubscriptionJob`

Graph mail subscriptions are short-lived and must be renewed before expiry *(confirm max window via docs — historically on the order of ~3 days)*. A Quartz job:

- On startup / schedule: ensure an active subscription for the mailbox exists; **create** if missing (`notificationUrl` = configured public URL, `clientState` = secret, `resource` = the inbox messages path, `expirationDateTime` = now + configured window).
- **Renew** before expiry on a safe cadence (e.g. well inside the max window).
- Persist the active `subscriptionId` + expiry so restarts don't orphan subscriptions.

With the simulated gateway these are no-ops, so local/dev/test runs need no Graph tenant.

---

## 6. Security & Compliance (non-negotiable)

- **`clientState` validation** on every notification; constant-time compare; reject mismatches.
- **Secrets** (`ClientSecret`, `ClientState`) via user-secrets/environment, **never** `appsettings.json` or source control.
- **PII / CVM 175:** **CPF/CNPJ digits must never appear in structured logs.** Inbound subjects/bodies may contain them — scrub before logging; store only a PII-safe `BodyPreview` for list views; never log raw bodies.
- **Untrusted input:** treat all notification + email content as hostile — validate shape, cap sizes, sanitize before rendering, scan/limit attachment types.
- **Idempotency** via unique index on `MessageId` — defense against replay and duplicate delivery.
- **Least privilege:** `Mail.Read` application permission only (no send/write).

---

## 7. Configuration — `MicrosoftGraphOptions`

Bound via the options pattern in `Yvy.Infrastructure/DependencyInjection.cs`:

| Key | Purpose |
|---|---|
| `TenantId`, `ClientId`, `ClientSecret` | App-only auth (Entra app registration). |
| `MailboxAddress` | e.g. `financeiro@yvy.capital` (+ room for a second address later). |
| `ClientState` | Shared secret echoed in notifications for validation. |
| `NotificationUrl` | Public HTTPS URL of the webhook endpoint. |
| `SubscriptionExpirationMinutes` | Renewal window *(confirm against Graph max)*. |

DI also registers: the typed `HttpClient` for Graph, the gateway (simulated vs real by environment), `IKanbanCardRepository`, and both Quartz jobs (next to the existing outbox job).

---

## 8. Persistence

- `InboundEmailNotification` entity: `{ Id, MessageId (unique), SubscriptionId, ReceivedAt, ProcessedOn?, Error? }` — the durable queue.
- `YvyDbContext`: add `DbSet<KanbanCard>` and `DbSet<InboundEmailNotification>`; existing `SaveChangesAsync` already routes domain events to the outbox.
- EF configs mirror `FundConfiguration.cs` (unique index on `InboundEmailNotification.MessageId` and on the card's email `MessageId`).
- One EF migration adds both tables.

---

## 9. Verification (with simulated gateway — no live Graph)

- `GET /api/v1/webhooks/graph/email?validationToken=abc123` → returns `abc123`, `text/plain`, 200.
- `POST` a sample notification with the valid `clientState` → 202; `ProcessInboundEmailsJob` (simulated gateway) creates a card → visible via `GET /api/v1/cards?process=ContasAPagar` in `Recebido`.
- `POST` with a wrong `clientState` → rejected; no card created.
- Re-`POST` the same notification → still exactly one card (idempotency).
- Integration tests (`Yvy.Api.IntegrationTests`, Testcontainers Postgres) cover the four cases above.

---

## 10. Open Questions

- **Entra provisioning:** app registration, `Mail.Read` admin consent, public `NotificationUrl`, secret storage — IT-dependent; tracked but not blocking this chunk.
- **ProcessType routing:** how to decide Contas a Pagar vs Reembolsos from an inbound email (separate addresses? subject convention? folder?). Needs a business rule.
- **Attachment storage** target + retention (shared with `kanban-card-spec.md` §11).
- **Graph expiry/renewal** exact limits and the lifecycle-notification channel — confirm via docs at build time.
- **Rich vs lean notifications:** lean (id only, then fetch) is assumed; resource-data-included notifications would add encryption/cert handling — out of scope unless required.
