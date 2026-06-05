# Financial Process Kanban — Implementation Plan (Phase 1)

> SDD phase order and slice sequencing for building the Kanban, now that the Entra ID SSO foundation
> (Phase 0) is shipped. Companion to [`index.md`](./index.md) (discovery),
> [`kanban-card-spec.md`](./kanban-card-spec.md) (domain), [`email-ingestion-spec.md`](./email-ingestion-spec.md)
> (ingestion), [`frontend-board-spec.md`](./frontend-board-spec.md) (board UI), and
> [ADR-002](../decisions/ADR-002-kanban-purpose-built-boards.md).

| | |
|---|---|
| **Status** | Plan for review — no code yet |
| **Date** | 2026-06-05 |
| **Depends on** | ✅ Entra SSO — `ICurrentUserProvider` + `Approver` role + `<RoleGate>` (shipped) |
| **Stack** | Backend .NET 10 (DDD/CQRS/EF/Outbox/Quartz) · Frontend React 19 + TanStack + Zustand |

## Slice sequencing

Three vertical slices, built in this order:

1. **Ingestion → card creation** — *first; the riskiest piece.* Built behind a **simulated gateway**,
   so it ships and is fully testable with **no live Graph/tenant**. Delivers cards auto-created in
   `Recebido`.
2. **Board visualization (read)** — the two-tab board + card detail over the ingested cards.
3. **Approval & transitions** — guarded Approve/Reject/Advance with `Approver`/`Operator` gating; the
   slice that makes the board *do something*. Uses the shipped SSO.

**Rationale:** the email pipeline (webhook handshake, idempotency, subscription renewal, app-only Graph
auth) has the most unknowns and external moving parts — `index.md` §11 says de-risk it first. Approval
is last because its dependency (SSO) is already done, so it's the lowest-risk slice and benefits from
having real cards to act on.

---

## Slice 1 — Ingestion → card creation

Goal: an inbound email to the finance mailbox becomes a `KanbanCard` in `Recebido`, end-to-end,
verifiable with the **simulated** gateway.

1. **Contract** — add `POST /api/v1/webhooks/graph/email` (anonymous, `clientState`-protected) and the
   card read shapes to `yvy-api.yaml` under a new `Kanban`/`Webhooks` banner (`.openapi/README.md`).
2. **Domain (minimal)** — `KanbanCard.CreateFromEmail` (→ `Recebido`), `InboundEmailRef` VO,
   `ProcessType`/`CardPhase` enums, `CardTransitionPolicy`, `CardCreatedFromEmailDomainEvent`,
   `KanbanCardErrors`. (Full behaviour lands in Slice 3.) Tests: `kanban-card-spec.md` §9 invariants
   **1, 6, 7**.
3. **Application** — `IInboundEmailGateway` + DTOs; `CreateCardFromEmail` command, **idempotent** via
   `ExistsByMessageIdAsync`. Unit-test the idempotency.
4. **Infrastructure** — EF config for `kanban_cards` (+ owned `InboundEmailRef`, transitions) and
   `inbound_email_notifications` (unique `MessageId`); one migration; `SimulatedInboundEmailGateway`
   (default) + `GraphInboundEmailGateway` (typed `HttpClient`, app-only client-credentials,
   `Mail.Read`); the two Quartz jobs (`ProcessInboundEmailsJob`, `ManageGraphSubscriptionJob`) beside
   the Outbox job; `MicrosoftGraphOptions`.
5. **API** — the webhook endpoint: validation handshake (echo `validationToken` as `text/plain`),
   `clientState` check, upsert notification, return **202** fast (no Graph calls in-request).
6. **Tests** — integration (Testcontainers): handshake; valid notification → card in `Recebido`; wrong
   `clientState` → rejected; replay → exactly one card.

Secrets: the `Yvy.Graph.Worker` registration + `Mail.Read` + client secret were created in **Phase 0**
([`../entra-id-sso/phase-0-entra-setup.md`](../entra-id-sso/phase-0-entra-setup.md) §6); wire via
user-secrets. The real gateway stays inert until configured.

---

## Slice 2 — Board visualization (read)

1. **Contract** — `GET /api/v1/cards?process=…` (board) + `GET /api/v1/cards/{id}` (detail); `Viewer+`.
2. **Application** — `GetBoard(ProcessType)` → `BoardColumnResponse[]`; `GetCardById` →
   `CardDetailResponse`; DTOs; `IKanbanCardRepository.ListByProcessAsync`.
3. **API** — versioned `cards` endpoint group with `.RequireAuthorization()`.
4. **Frontend** — see [`frontend-board-spec.md`](./frontend-board-spec.md): `/kanban` two-tab page,
   phase columns, card detail (email + metadata + history), TanStack Query hooks. Read-only.
5. **Tests** — handler unit tests; integration GET 200 + empty board; a `Viewer` can read.

---

## Slice 3 — Approval & transitions (uses SSO)

1. **Domain** — remaining guarded methods (`SubmitForApproval`, `AdvancePhase`, `Approve`, `Reject`,
   `MarkPaid`/`MarkReimbursed`, `Cancel`) + events. Tests: `kanban-card-spec.md` §9 invariants **2–5**.
2. **Application** — `ApproveCard`/`RejectCard` (role-checked via `ICurrentUserProvider` → `Approver`),
   `AdvanceCardPhase` (`Operator`/`Admin`). `Unauthorized`/`Forbidden` errors map to 401/403 via
   `ErrorOrExtensions`.
3. **API** — `POST /api/v1/cards/{id}/approve|reject|advance` with role policies (the `Approver` policy
   already exists from SSO).
4. **Frontend** — Approve/Reject in `<RoleGate roles={['Approver']}>`; Advance in
   `<RoleGate roles={['Operator','Admin']}>`; mutations + cache invalidation.
5. **Tests** — `Viewer` → 403 on approve; `Approver` → 200; audit trail asserted.

---

## Cross-cutting (all slices)

- **Compliance:** amounts via `Money`/`decimal`; **CPF/CNPJ never in structured logs** (scrub inbound
  subjects/bodies; store only a PII-safe `BodyPreview`); treat all email/notification input as hostile.
- **Events** via the existing Outbox + Quartz dispatch; V2 side-effects (Asaas, notifications) attach
  as `INotificationHandler<…>` without touching the aggregate.
- **Contract-first** every slice; `.openapi/yvy-api.yaml` is the source of truth (`.openapi/README.md`).

## Out of scope (V2+)
Asaas payment on `MarkPaid`; AI metadata extraction; a generic workflow engine (ADR-002).
