# Financial Process Kanban

> Internal Kanban boards for Yvy Capital's email-driven financial processes — starting with **Contas a Pagar** and **Reembolsos Internos** — built in-house instead of rented from a no-code tool.

| | |
|---|---|
| **Status** | Discovery complete — pending implementation plan |
| **Date** | 2026-06-03 |
| **Author** | leonardo.martins@yvy.capital |
| **Stage** | V1 scope confirmed |

This document captures the discovery conversation and the decisions made, so the context survives into implementation and future contributors understand *why* the feature exists.

---

## 1. Context & Origin

The idea emerged when Yvy Capital was evaluating **Pipefy** to automate two finance processes:

1. **Contas a Pagar** (accounts payable)
2. **Reembolsos Internos** (internal reimbursements)

Pipefy is a no-code platform that integrates data sources into a task flow (with AI), and its main user-facing value is the **pipe visualization**: seeing each request as a card and which **phase** it's currently in. Requests typically arrive **by email**, become cards in the first phase, and progress through screening → approval → payment.

The question that started this work: *instead of renting Pipefy, why not build our own Kanban visualization and code the process automation ourselves?* The trade-off is that only technical people can change the workflow (because it's code, not no-code) — but in exchange we get **fully custom business logic** and **direct integration** with our own systems (e.g. paying bills via the **Asaas API**).

The longer-term motivation: an asset manager will eventually need to automate many more stage-based processes — **investor onboarding / KYC**, **fund deal flow**, **compliance / CVM 175 review queues**, **capital-call tracking**, and more. The concern driving the decision was: *don't adopt a tool that's insufficient for future demands.*

---

## 2. Decision: Build vs Buy

**Resolved: build in-house, but as concrete processes — not a generic engine.**

The real trap in build-vs-buy is not "build" vs "buy" — it's **building a generic workflow engine when you only have two concrete processes**. No-code tools like Pipefy *are* generic engines; rebuilding one in code is a multi-year platform effort whose first version is usually worse than the thing it replaced.

The chosen approach:

- Build the **two specific processes** extremely well as coded workflows.
- Share the **primitives** (a card/phase/transition model, an audit trail, the email-ingestion pipeline, the Asaas integration).
- Let the **third and fourth** processes reveal what's genuinely common before abstracting into anything engine-like.

This delivers Asaas automation and custom business logic now, without betting the company on a homegrown Pipefy. It also fits the reality that the processes themselves are still being learned — you can't design a good engine for processes you don't yet understand.

**Explicitly chosen (A) over (B):**

- **(A) Two purpose-built boards** — stages and rules coded directly, sharing common pieces. ✅ **Chosen.**
- (B) A configurable workflow engine — stages/rules/automations defined as data. ❌ Deferred until a real common shape emerges.

---

## 3. Scope

### V1 — the visibility + workflow core

- **Email ingestion** via **Microsoft Graph API webhook subscriptions** (real-time push when mail arrives at `financeiro@yvy.capital`, or another mailbox specified later).
- Inbound email → a **card** auto-created in the first phase of the correct board, storing the **raw message** (body + attachments, e.g. boleto / nota fiscal PDFs).
- **One intranet page, two tabs**: *Contas a Pagar* and *Reembolsos Internos*.
- Each tab is a **Kanban board** — cards laid out across phase columns.
- **Card detail view**: raw email content on one side, a structured **metadata panel** on the other (fields TBD — see §6).
- **Action-driven phase transitions** validated by the backend (no free drag-and-drop).
- **Manager approval in-platform** — approve / reject with a note, which advances the card. This is the feature that makes the board *do something* rather than just display.

### V2 — the automations (fast-follows)

- **Asaas payment**: triggered when a Contas-a-Pagar card reaches the final phase, to pay the bill (periodically). Deferred because money movement has its own failure modes and shouldn't also be de-risking the email pipeline.
- **AI extraction**: auto-fill the metadata panel from the email body and attachments (e.g. detect whether a bill is from a lawyer, extract amount/due date/payee).

### Future processes (not now)

Investor onboarding / KYC, fund deal flow, compliance / CVM review queue, capital-call tracking. These will inform whether/when to generalize the shared primitives.

---

## 4. Confirmed Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Mailbox & ingestion** | Microsoft 365 mailbox; **Graph API + webhooks** | Domain is on M365; real-time push; IMAP polling is the fallback if Graph access is restricted. |
| **Auth / identity** | **Microsoft Entra ID SSO (M365 / OIDC)** | Approvals need real identity. Reuses the Entra app registration created for Graph email ingestion; single sign-on; real roles. Needs an IT/Entra config step. |
| **Card movement** | **Action-driven transitions** | Buttons (Approve / Reject / Mark Paid) trigger guarded transitions the backend validates — same pattern as `Fund.Activate()`. Safest for a money workflow; no drag-drop library needed. |
| **Phases** | **Proposed defaults, refined later** | Processes still being learned; defaults are coded now and easy to adjust. See §5. |
| **V1 finish line** | Ingest → visualize → card detail → approval | Ships real value fast. |
| **V2** | Asaas payment + AI extraction | Each is a real integration with distinct failure modes. |

---

## 5. Proposed Phases (defaults — editable in code)

**Contas a Pagar:**

```
Recebido → Triagem → Aguardando Aprovação → Aprovado → Pago
                                          ↘ Recusado / Cancelado
```

**Reembolsos Internos:**

```
Recebido → Em Análise → Aguardando Aprovação → Aprovado → Reembolsado
                                             ↘ Recusado
```

These map naturally onto a status machine guarded in the aggregate (the same way `Fund` guards `Draft → Active → Suspended → Liquidated`). Transitions are coded, not data-driven, in V1.

---

## 6. Card Detail View

When a card is opened, the user sees:

- **Email panel** — the raw inbound email (body + attachments), so the source of truth is always visible.
- **Metadata panel** — structured fields relevant to the decision. Exact fields **TBD**, but candidate examples raised in discovery:
  - Is the bill from a lawyer / which vendor category?
  - Was the approval email sent to the manager?
  - Amount, due date, payee.
  - Current phase + history (audit trail of who moved it and when).
- **Actions** — in-platform **Approve / Reject** (with a note) for authorized managers, advancing the card through its phases.

In V1 the metadata panel is populated from whatever is parsed deterministically (sender, subject, attachments) and/or entered manually; **AI extraction to auto-fill it is V2**.

---

## 7. Architecture Mapping (reuse existing patterns)

The feature fits cleanly into existing conventions discovered in the codebase.

### Backend (`backend/`, .NET 9, DDD + CQRS + MediatR + EF Core + Outbox)

- **New aggregate** `KanbanCard` (or per-process aggregates) modelled on `Fund` / `Investor` — private setters, factory method, behavior methods that guard transitions and raise domain events. Reference: `src/Yvy.Domain/Aggregates/Funds/Fund.cs`, `.../Investors/Investor.cs`.
- **Vertical slices** copy the `CreateFund` pattern: command + `AbstractValidator` + `ICommandHandler`, returning `ErrorOr<T>`. Reference: `src/Yvy.Application/Funds/Commands/CreateFund/`.
- **Domain events** for side-effects (`CardCreatedFromEmail`, `CardPhaseChanged`, `CardApproved`, `CardRejected`) dispatched via the existing **Outbox + Quartz** mechanism (`src/Yvy.Infrastructure/Outbox/`). The V2 Asaas call and email notifications become `INotificationHandler<...>` handlers — same DB transaction, async dispatch.
- **EF Core**: `IEntityTypeConfiguration` with `OwnsOne` for value objects; new migration via the documented `dotnet ef` command.
- **Endpoints**: implement `IEndpoint` and register a versioned route group, mirroring `Yvy.Api/Endpoints/Funds/FundEndpoints.cs`. New: a **Graph webhook endpoint** to receive email notifications.
- **Errors** mapped to HTTP via `Yvy.Api/Extensions/ErrorOrExtensions.cs`.

### Frontend (`frontend/`, React 19, TanStack Router/Query, Zustand, Tailwind 4)

- **Routing** is code-based in `src/router.ts` — add a `/kanban` route (or under an existing finance section) with a tabbed page.
- **Data**: TanStack Query hooks mirroring `src/hooks/useFundsQuery.ts`, with keys added to `src/hooks/query-keys.ts`; calls via the `api` wrapper in `src/lib/api.ts`; errors via `src/components/ui/ApiErrorBanner.tsx`.
- **State**: a small Zustand store for transient board UI state (selected card, filters), mirroring `src/store/ui.store.ts`. Server data stays in TanStack Query.
- **UI**: reuse the existing component library — `Card`, `Tabs`, `Modal`, `Badge`, `Button`, `Select`, `PageHeader`, `ListToolbar`, `EmptyState`, `Skeleton` (see `src/components/ui/COMPONENTS.md`). Design tokens (`--color-yvy-navy`, etc.) live in `src/index.css`; follow the **bm-design-system** skill.
- **Auth**: the frontend already has an `auth.store.ts` (token/role) and bearer-token injection — wire it to the new Entra ID SSO flow.

### Compliance constraints (carry into implementation)

- All financial amounts use **`decimal`**, never `float`/`double`.
- **CPF/CNPJ digits must never appear in structured logs** (CVM 175 / PII). Inbound emails may contain them — scrub before logging.
- Treat the whole feature as **high-sensitivity** (finance + auth + data handling).

---

## 8. What Does Not Exist Yet (must be built)

| Area | Status |
|---|---|
| Authentication / authorization (backend) | ❌ None — building Entra ID SSO + role checks |
| Microsoft Graph integration + webhook receiver | ❌ None |
| Email → card mapper | ❌ None |
| Asaas payment client (V2) | ❌ None |
| `HttpClient` / typed external-client pattern | ❌ None |
| Kanban / board / drag-drop frontend code | ❌ None (not needed — action-driven) |
| `KanbanCard` aggregate, repo, EF config, endpoints | ❌ None |

---

## 9. Open Questions / TBD

- **Metadata panel fields** — finalize per process once the real requests are seen.
- **Which mailbox(es)** beyond `financeiro@yvy.capital` (a second address may be specified later).
- **Roles** — which Entra groups/roles map to "manager / approver" vs "viewer / operator".
- **Entra app registration** — needs an IT step (app registration, Graph mail permissions, webhook endpoint URL, secret storage).
- **Idempotency & reliability** of webhook ingestion (duplicate notifications, subscription renewal, missed events).
- **Attachment storage** — where boletos / notas fiscais are stored and retention policy.

---

## 10. References

Kanban UI and accounts-payable workflow references gathered during discovery:

- [How to manage accounts payable masterfully — Pipefy](https://www.pipefy.com/blog/accounts-payable-tutorial/) — AP pipe model: `screening → approval → payment → paid / payment canceled` (customizable phases).
- [Accounts Payable Process with AI Agents — Pipefy](https://www.pipefy.com/products/accounts-payable/)
- [Set up an automation event — Pipefy Help Center](https://help.pipefy.com/en/articles/6272628-set-up-an-automation-event) — "a card enters a phase" / "email received in the pipe" as triggers.
- [How to create automations for payment, charges, and communication deadlines — Pipefy](https://help.pipefy.com/en/articles/2109244-how-to-create-automations-for-payment-charges-and-communication-deadlines)
- [27 Best Kanban Board Examples for Teams in 2025 — Teamhood](https://teamhood.com/kanban/kanban-board-examples/)
- [Kanban board Design Examples — Nicelydone](https://nicelydone.club/tags/kanban-board) — SaaS Kanban UI patterns.
- [12 Best Kanban Board Software Options for 2025 — JustBeepIt](https://www.justbeepit.com/post/12-best-kanban-board-software-options-for-2025)
- [Kanban board templates — monday.com](https://monday.com/blog/rnd/kanban-board-templates/)

**Design takeaways applied to this feature:** make key card details visible at a glance (vendor, amount, due date, priority as colored badges); support more than the board (a list/table view is expected); cards need attachments, comments, assignees, and history — "title + description" is not enough for a real financial workflow; keep WCAG AA accessibility (keyboard-operable actions, contrast) — easier here since transitions are buttons, not drag-and-drop.

---

## 11. Recommended Next Steps

1. Spec the `KanbanCard` aggregate + phases (apply **spec-driven-development**).
2. Stand up the Entra ID app registration with IT (auth + Graph mail scopes).
3. Build the ingestion slice first: Graph webhook → create card with raw email (the riskiest piece — de-risk it before the UI).
4. Build the two-tab board + card detail UI against the new endpoints.
5. Add manager approval (guarded transition + role check).
6. V2: Asaas payment handler + AI metadata extraction.
