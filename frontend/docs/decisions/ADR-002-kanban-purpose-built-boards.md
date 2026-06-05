# ADR-002: Build purpose-built financial Kanban boards (coded workflows), not a generic engine

## Status
Accepted

## Date
2026-06-05

## Context

Yvy Capital automates two email-driven finance processes — **Contas a Pagar** and **Reembolsos
Internos** — today tracked ad hoc from a mailbox. The team evaluated renting **Pipefy** (a no-code
pipe/Kanban tool) versus building in-house. We need a recorded decision on *how* to build, before
implementation. Discovery is in [`../financial-process-kanban/index.md`](../financial-process-kanban/index.md).

Forces:
- Only **two** concrete processes exist today, and their rules are still being learned.
- The value is the **pipe visualization** (cards across phases) + **custom automation** (e.g. pay via
  the Asaas API) + **direct integration** with our own systems and identity.
- Money movement needs **guarded, audited** transitions and **segregation of duties** — now backed by
  the shipped Entra SSO ([ADR-001](./ADR-001-entra-id-sso-authentication.md)): `ICurrentUserProvider`
  + the `Approver` role.
- The codebase is DDD + CQRS + EF Core + Outbox; `Fund`'s guarded state machine
  (`Draft → Active → …`) is the proven pattern to mirror.
- Expensive to reverse (DB schema, domain, API, SPA).

## Decision

1. **Build two purpose-built boards as coded workflows that share primitives** — *not* a configurable
   generic engine. Shared pieces: the card/phase/transition model, the audit trail, the
   email-ingestion pipeline, and (V2) the Asaas integration.
2. **One `KanbanCard` aggregate discriminated by `ProcessType`** (`ContasAPagar | ReembolsosInternos`):
   one table/repository/slice set; process-specific rules live in a static `CardTransitionPolicy`
   (`kanban-card-spec.md` §2/§4).
3. **Action-driven, backend-guarded transitions** — buttons (Approve/Reject/Advance/Mark Paid) trigger
   guarded methods validated against the policy; **no free drag-and-drop**. Mirrors `Fund.Activate()`.
4. **Email ingestion behind an `IInboundEmailGateway` abstraction** — a simulated gateway (dev/tests)
   and a real Microsoft Graph app-only gateway (`Yvy.Graph.Worker`), so the whole pipeline is testable
   with no live-tenant dependency (`email-ingestion-spec.md`).
5. **Identity/authorization via the shipped Entra SSO** — approvals are role-checked in handlers via
   `ICurrentUserProvider` (`Approver`); the UI gates with `<RoleGate>` (UX only).

## Alternatives considered

### Rent Pipefy (buy)
Pros: no build, mature UI. Cons: customization only via no-code; limited direct integration with our
systems (Asaas, identity); recurring cost; risk of being "insufficient for future demands."
**Rejected** — we want custom business logic + direct integration now.

### Configurable workflow engine (stages/rules/automations as data)
Pros: future processes need no code. Cons: building a generic engine for **two** processes is a
multi-year platform effort whose v1 is usually worse than what it replaces; you can't design a good
engine for processes you don't yet understand. **Rejected (deferred)** — revisit when a 3rd/4th process
reveals a genuinely common shape.

### Separate aggregates per process (or an abstract base)
Pros: clean separation if they diverge. Cons: duplicates persistence/repo/slice code for two
~90%-identical processes. **Rejected for V1** — revisit if a process diverges sharply.

### Free drag-and-drop board
Pros: familiar UX. Cons: unguarded moves are unsafe for money workflows; needs a drag-drop lib; harder
a11y. **Rejected** — action-driven guarded transitions are safer and simpler.

> **Deferred future option (compatible with this ADR):** a *guarded hybrid* — drag as a **trigger** for
> non-approval **forward moves** only, where the backend still validates via `CardTransitionPolicy` and
> the operator role (revert the UI on a 4xx), while **Approve/Reject stay explicit buttons** (they need a
> note + `Approver`). This is distinct from the free-drag-drop rejected above: the server remains the
> authority, drag is just nicer ergonomics. Candidate lib: `@hello-pangea/dnd` (maintained
> `react-beautiful-dnd` fork; peer-deps include React 19; strong keyboard/SR a11y, which also addresses
> the a11y objection). Not in V1 scope.

## Consequences

- New `KanbanCard` aggregate + EF migration; `IKanbanCardRepository`; slices under
  `Yvy.Application/KanbanCards/`.
- New `IInboundEmailGateway` (+ simulated/Graph impls), an anonymous `clientState`-protected Graph
  webhook endpoint, and two Quartz jobs (ingestion + subscription lifecycle) beside the Outbox job.
- New frontend board (two tabs + card detail), reusing the component library and the SSO `<RoleGate>`.
- Compliance carries in: amounts as `decimal`/`Money`; CPF/CNPJ never logged; treat inbound email as
  hostile.
- A **3rd process** later is the trigger to reconsider the "generic engine" path.
- Implementation is sequenced by slice in
  [`../financial-process-kanban/implementation-plan.md`](../financial-process-kanban/implementation-plan.md).
