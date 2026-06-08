# Slice 1 — Follow-ups & Open Items

> Tracked uncertainties carried out of **Slice 1 (email ingestion → `KanbanCard`)** as built and merged.
> Companion to [`email-ingestion-spec.md`](./email-ingestion-spec.md) (§10 open questions),
> [`index.md`](./index.md) (§9 TBD) and [ADR-002](../decisions/ADR-002-kanban-purpose-built-boards.md).

| | |
|---|---|
| **Status** | Open — recorded before starting Slice 2 (board UI) |
| **Date** | 2026-06-08 |
| **Context** | Slice 1 merged to `main` (97 tests green). The real Graph path is built but **inert** behind `MicrosoftGraph:Enabled=false`; everything runs on `SimulatedInboundEmailGateway`. These items are latent until Graph is enabled, except **S1-03** which affects board content now. |

Legend — **Type:** Decision (business/architecture) · Task (code) · Infra (IT/ops). **Blocks board?** whether it gates Slice 2.

| ID | Item | Type | Severity | Blocks board? |
|---|---|---|---|---|
| S1-01 | PII scrubbing of `BodyPreview` (CVM 175) | Task | 🔴 High | No |
| S1-02 | Graph gateway unverified vs a live tenant | Task | 🔴 High | No |
| S1-03 | `ProcessType` routing business rule | Decision | 🟡 Medium | **Partly** |
| S1-04 | Attachment / document storage | Decision | 🟡 Medium | No |
| S1-05 | Public production `NotificationUrl` | Infra | 🟠 Medium | No |
| S1-06 | Graph subscription expiry/renewal numbers | Task | 🟠 Low | No |

---

## S1-01 — PII scrubbing of `BodyPreview` (compliance) 🔴

`GraphInboundEmailGateway.GetMessageAsync` maps Microsoft Graph's `bodyPreview` (first ~255 chars of
the body) straight into `InboundEmailRef.BodyPreview`, which is persisted and surfaced on list views.
That text **can contain CPF/CNPJ**, and CLAUDE.md / spec §6 require those digits never be stored
unscrubbed or logged (CVM 175). `SimulatedInboundEmailGateway` returns canned text, so this is
**invisible today** and surfaces the moment `Enabled=true`.

- **Resolution:** scrub CPF/CNPJ (and any other PII patterns) from `BodyPreview` before it leaves the
  gateway / before persistence. Add a unit test with a CPF-bearing preview asserting it is masked.
- **Must close before** `MicrosoftGraph:Enabled=true` in any environment with real mail.

## S1-02 — Graph gateway unverified against a live tenant 🔴

`GraphInboundEmailGateway` (message fetch, subscription create/renew/list, app-only token via
`ClientSecretCredential`, JSON field mapping, the `users/{mailbox}/mailFolders('Inbox')/messages`
resource path) was written from documentation and **has never run against the real Graph API**. The
spec marked these as *confirm-against-docs at build time* (source-driven-development); that pass is
still outstanding.

- **Resolution:** once Entra creds + a public URL exist (see S1-05), enable in a non-prod environment
  and exercise the real handshake → notification → fetch → card flow; confirm field names, the inbox
  resource path, and error shapes. Treat this as the real integration test of the slice.

## S1-03 — `ProcessType` routing business rule 🟡 (affects board content)

V1 routes **every** inbound email to `ContasAPagar` via `DefaultProcessTypeRouter`. The rule to
distinguish *Contas a Pagar* vs *Reembolsos Internos* (separate addresses? subject convention?
folder?) is undefined (spec §10, index §9). The seam (`IProcessTypeRouter`) is ready — only the rule
is missing.

- **Board impact:** the **Reembolsos Internos** column/tab will be permanently empty until this is
  decided. Slice 2 should choose whether to ship both tabs (one empty) or only Contas a Pagar for now.
- **Resolution:** finance defines the rule → implement a router replacing the default. **Graduate to
  an ADR** (or fold into `email-ingestion-spec.md`) once chosen.

## S1-04 — Attachment / document storage 🟡

Cards capture only sender/subject/preview. `InboundEmailMessage.RawBodyRef` and attachments are
stubbed to `null`. A finance approval workflow needs the actual boleto / nota fiscal (kanban-card-spec
§11, index §6). Storage target (blob? DB?) and retention are undecided.

- **Resolution:** decide storage + retention, extend the gateway to capture attachments and set
  `RawBodyRef`, surface them in the card detail view (Slice 2+). **Graduate to an ADR** once chosen.

## S1-05 — Public production `NotificationUrl` 🟠 (IT)

Production Graph subscriptions need a public HTTPS URL Graph can reach. The `Yvy.Graph.Worker`
registration + `Mail.Read` + secret were created in Phase 0; the public URL is still IT-dependent
(spec §10). Code is ready — go-live is gated on this, not on engineering.

- **Resolution:** IT provisions the URL; set `MicrosoftGraph:NotificationUrl` + secrets via
  user-secrets/env per environment.

## S1-06 — Graph subscription expiry / renewal numbers 🟠

`MicrosoftGraphOptions.SubscriptionExpirationMinutes` (default `4230`) and
`ManageGraphSubscriptionJob`'s 12h renewal margin are **estimates** of the Graph maximum for mail
resources. If the requested expiry exceeds the real max, Graph rejects the create; if the margin is
mistimed a subscription can silently lapse and notifications stop.

- **Resolution:** confirm the current documented max for `messages` subscriptions; align the default
  and margin. Verify together with S1-02.

---

## Not uncertainties — expected Slice 2 scope (for reference)

These are planned next steps, not open risks: `IKanbanCardRepository` read methods
(`GetByIdAsync`, `ListByProcessAsync`), `GET /api/v1/cards`, guarded phase transitions + approval
(`Approver` role), and the frontend board. See [`frontend-board-spec.md`](./frontend-board-spec.md)
and [`implementation-plan.md`](./implementation-plan.md).
