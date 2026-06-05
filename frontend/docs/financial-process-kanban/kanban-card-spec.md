# KanbanCard — Domain Spec

> Domain specification for the `KanbanCard` aggregate that backs the two financial-process boards (**Contas a Pagar**, **Reembolsos Internos**). Companion to [`index.md`](./index.md) (context & decisions) and [`email-ingestion-spec.md`](./email-ingestion-spec.md) (how cards are created).

| | |
|---|---|
| **Status** | Draft for review — no code yet |
| **Date** | 2026-06-03 |
| **Layer** | `Yvy.Domain` (+ `Yvy.Application` surface) |
| **Templates mirrored** | `Aggregates/Funds/Fund.cs`, `Aggregates/Investors/Investor.cs` |

---

## 1. Purpose & Scope

A `KanbanCard` represents **one financial request** (a bill to pay, or an internal reimbursement) that arrives by email and moves through a fixed, **action-driven** sequence of phases until it is paid/reimbursed or rejected. This spec defines the aggregate, its phases and guarded transitions, its events, and the application commands/queries that operate on it.

Decisions inherited from `index.md` / [ADR-002](../decisions/ADR-002-kanban-purpose-built-boards.md): build two purpose-built boards **sharing primitives** (not a generic engine); **action-driven** transitions guarded by the backend (no free drag-and-drop); phases are **coded, not data-driven**; identity for approvals comes from Entra ID SSO (**shipped** — ADR-001; this spec consumes the existing `ICurrentUserProvider` + `Approver` role).

**In scope:** the aggregate, phase machine, transition policy, events, errors, and the CQRS surface.
**Out of scope:** email ingestion (see companion spec), Asaas payment (V2), AI metadata extraction (V2), the frontend board.

---

## 2. Aggregate Model

**Recommended: a single `KanbanCard` aggregate discriminated by `ProcessType`.**

One aggregate, one table, one repository, one set of slices — process-specific rules live in a transition policy (§4). This honors "share primitives, code the specifics" and keeps the surface small while V1 has only two processes.

*Rejected alternative:* two separate aggregates (`AccountsPayableCard`, `ReimbursementCard`) or an abstract base. Rejected for V1 because it duplicates persistence, repository, and slice code for two processes whose shape is ~90% identical; revisit only if a third process diverges sharply.

### Properties

| Property | Type | Notes |
|---|---|---|
| `Id` | `Guid` | `AggregateRoot` identity. |
| `ProcessType` | `ProcessType` enum | `ContasAPagar` \| `ReembolsosInternos`. Immutable after creation. |
| `Phase` | `CardPhase` enum | Current phase; only mutated via guarded methods (§5). |
| `Title` | `string` | Human label (defaults from email subject). |
| `Email` | `InboundEmailRef` (owned VO) | Source-of-truth email reference (§3). |
| `Payee` | `string?` | Vendor / reimbursee. Nullable in V1 (manual; AI in V2). |
| `Amount` | `Money?` | Reuses `ValueObjects/Money.cs` (BRL, **`decimal`**). Nullable in V1. |
| `DueDate` | `DateOnly?` | Nullable in V1. |
| `Transitions` | `IReadOnlyList<CardPhaseTransition>` | Owned collection — the audit/history trail (§6). |
| `Approval` | `ApprovalInfo?` (owned VO) | Approver id, timestamp, note — set on Approve/Reject. |
| `CreatedAt` / `UpdatedAt` | `DateTime` / `DateTime?` | UTC, same convention as `Fund`. |

All setters are `private`; construction is via the factory. Two private constructors: `KanbanCard(Guid id)` and a parameterless one for EF Core (matches `Fund.cs:11-13`).

---

## 3. Value Object: `InboundEmailRef`

Owned value object (extends `Domain/Primitives/ValueObject.cs`) capturing the email a card was born from:

- `MessageId` (Graph message id — **unique**, drives idempotency).
- `From` (sender address), `Subject`, `ReceivedAt` (UTC).
- `BodyPreview` (short, PII-scrubbed snippet safe for lists).
- `RawBodyRef` (storage reference/key to the full body — see open question on storage).
- `Attachments` (list of `{ Name, ContentType, SizeBytes, StorageRef }` — boletos / notas fiscais).

`GetEqualityComponents()` returns `MessageId` (the natural key).

---

## 4. Phases & Transition Policy

### Phases (`CardPhase` enum)

Union across both processes: `Recebido`, `Triagem`, `EmAnalise`, `AguardandoAprovacao`, `Aprovado`, `Pago`, `Reembolsado`, `Recusado`, `Cancelado`.

### Contas a Pagar

```
Recebido → Triagem → AguardandoAprovacao → Aprovado → Pago
   │           │              │
   └───────────┴──────────────┴────────────► Cancelado
                              └────────────► Recusado
```

### Reembolsos Internos

```
Recebido → EmAnalise → AguardandoAprovacao → Aprovado → Reembolsado
                              │
                              └────────────► Recusado
```

### `CardTransitionPolicy` (static, in code)

A lookup of legal transitions keyed by `(ProcessType, fromPhase)` → allowed target phases. Every behavior method consults it before mutating. This is the single source of truth for "what move is legal," replacing data-driven config in V1.

| ProcessType | From | Allowed → |
|---|---|---|
| ContasAPagar | Recebido | Triagem, Cancelado |
| ContasAPagar | Triagem | AguardandoAprovacao, Cancelado |
| ContasAPagar | AguardandoAprovacao | Aprovado, Recusado, Cancelado |
| ContasAPagar | Aprovado | Pago, Cancelado |
| ContasAPagar | Pago / Recusado / Cancelado | — (terminal) |
| ReembolsosInternos | Recebido | EmAnalise |
| ReembolsosInternos | EmAnalise | AguardandoAprovacao |
| ReembolsosInternos | AguardandoAprovacao | Aprovado, Recusado |
| ReembolsosInternos | Aprovado | Reembolsado |
| ReembolsosInternos | Reembolsado / Recusado | — (terminal) |

---

## 5. Behavior (guarded transitions)

Mirrors `Fund.Activate()` (`Fund.cs:52-72`): each method validates the current phase against `CardTransitionPolicy`, mutates, appends a `CardPhaseTransition`, sets `UpdatedAt`, raises a domain event, and returns `ErrorOr<Updated>`.

- **`static ErrorOr<KanbanCard> CreateFromEmail(ProcessType process, InboundEmailRef email, string title)`** — factory; starts in `Recebido`; raises `CardCreatedFromEmailDomainEvent`. Validates title non-empty (like `Fund.Create`).
- **`ErrorOr<Updated> SubmitForApproval()`** — `Triagem`/`EmAnalise` → `AguardandoAprovacao`.
- **`ErrorOr<Updated> Approve(Guid approverId, string? note)`** — `AguardandoAprovacao` → `Aprovado`; sets `Approval`; raises `CardApprovedDomainEvent`. Caller authorization (manager role) is enforced in the **handler** via `ICurrentUserProvider`, not the aggregate.
- **`ErrorOr<Updated> Reject(Guid approverId, string note)`** — `AguardandoAprovacao` → `Recusado`; note required; raises `CardRejectedDomainEvent`.
- **`ErrorOr<Updated> MarkPaid()`** (Contas a Pagar) / **`MarkReimbursed()`** (Reembolsos) — `Aprovado` → terminal; raises `CardPhaseChangedDomainEvent`. (In V2 this is what the Asaas handler will react to / drive.)
- **`ErrorOr<Updated> Cancel(string reason)`** (Contas a Pagar) — non-terminal → `Cancelado`.
- **`ErrorOr<Updated> AdvancePhase(CardPhase target, Guid actorId, string? note)`** — generic guarded move used by the operator to push a card forward through non-approval steps (e.g. `Recebido → Triagem`).

Any illegal move returns `KanbanCardErrors.InvalidTransition` and mutates nothing.

---

## 6. History: `CardPhaseTransition` (owned entity)

Append-only record per move: `{ FromPhase, ToPhase, ActorId, Note?, OccurredAt }`. Powers the card-detail history panel and the compliance audit trail. Never edited or deleted.

---

## 7. Domain Events

Records implementing `IDomainEvent` (mirror `Events/FundCreatedDomainEvent.cs`), persisted via the existing **Outbox** and dispatched by Quartz — so downstream side-effects (notify manager, V2 Asaas payment) are added later as `INotificationHandler<…>` without touching the aggregate:

- `CardCreatedFromEmailDomainEvent(EventId, OccurredOn, CardId, ProcessType, MessageId)`
- `CardPhaseChangedDomainEvent(EventId, OccurredOn, CardId, OldPhase, NewPhase, ActorId)`
- `CardApprovedDomainEvent(EventId, OccurredOn, CardId, ApproverId)`
- `CardRejectedDomainEvent(EventId, OccurredOn, CardId, ApproverId, Reason)`

---

## 8. Errors

`Domain/Errors/KanbanCardErrors.cs` (mirror `FundErrors.cs`): `InvalidTransition` (→ 422/409), `NotFound` (→ 404), `DuplicateEmail` (→ 409, idempotency), `NoteRequired` (→ 422), `Unauthorized`/`Forbidden` (→ 401/403, approval role). Mapped to HTTP by `Api/Extensions/ErrorOrExtensions.cs`.

---

## 9. Invariants (assert in `Yvy.Domain.Tests`)

1. A new card is always created in `Recebido` and raises exactly one `CardCreatedFromEmailDomainEvent`.
2. Every legal transition per the §4 table succeeds and appends exactly one `CardPhaseTransition`.
3. Every illegal transition returns `InvalidTransition` and leaves `Phase`/history unchanged.
4. `Reject` without a note returns `NoteRequired`.
5. Terminal phases (`Pago`, `Reembolsado`, `Recusado`, `Cancelado`) reject all further transitions.
6. `ProcessType` never changes after creation.
7. `Amount`, when set, is BRL `decimal` via `Money` (never float/double).

---

## 10. Application Surface (`Yvy.Application/KanbanCards/`)

Names + responsibilities (code comes in the build step), mirroring `Application/Funds/`:

**Commands** (each = Command + `AbstractValidator` + `ICommandHandler`, returning `ErrorOr`):
- `CreateCardFromEmail` — invoked by ingestion; idempotent (checks `ExistsByMessageIdAsync`).
- `ApproveCard` / `RejectCard` — role-checked via `ICurrentUserProvider`.
- `AdvanceCardPhase` — operator-driven forward moves.

**Queries:**
- `GetBoard(ProcessType)` → cards grouped into `BoardColumnResponse[]` (one per phase).
- `GetCardById(Guid)` → `CardDetailResponse` (email + metadata + history).

**DTOs:** `CardResponse`, `CardDetailResponse`, `BoardColumnResponse`.

**Abstractions:** `ICurrentUserProvider` (current user id + roles) **already exists from the SSO chunk** — consume it (don't re-introduce). Only `IKanbanCardRepository` (`GetByIdAsync`, `ExistsByMessageIdAsync`, `ListByProcessAsync`, `AddAsync`) is new.

---

## 11. Open Questions

- Final metadata-panel fields per process (see `index.md` §6/§9).
- Raw-body & attachment **storage** target (DB column vs blob store) and retention.
- Entra group → App Role mapping (which groups are `Approver`) — the `Approver` **App Role itself ships** with SSO; the group-membership mapping is an ops/IT policy decision.
- Whether operators may move cards *backwards* (e.g. `AguardandoAprovacao → Triagem`) — current policy is forward-only + reject/cancel.
