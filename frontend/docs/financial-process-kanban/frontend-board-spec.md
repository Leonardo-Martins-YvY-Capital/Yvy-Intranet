# Financial Process Kanban — Frontend Spec (Board UI)

> The two-tab board, card detail, and role-gated actions for the Kanban. Companion to
> [`kanban-card-spec.md`](./kanban-card-spec.md) (domain + API shapes),
> [`implementation-plan.md`](./implementation-plan.md) (slice order), and the shipped SSO frontend
> (`<RoleGate>`/`useHasRole`, `frontend/docs/entra-id-sso/frontend-spec.md`).

| | |
|---|---|
| **Status** | Draft for review — no code yet |
| **Date** | 2026-06-05 |
| **Stack** | React 19, TanStack Router/Query, Zustand, Tailwind 4 |
| **Reuses** | `components/ui/*` (`COMPONENTS.md`), `<RoleGate>`/`useHasRole`, `lib/api.ts`, `hooks/query-keys.ts` |
| **Skills** | `react-tanstack-query`, `react-zustand`, `frontend-ui-engineering`, `bm-design-system` |

## 1. Route & layout
- New route `/kanban` as a child of the **`_authenticated`** layout (already MSAL-guarded — see SSO
  `frontend-spec.md`), added in `src/router.ts`. Sidebar nav item "Kanban" (Operações section).
- One page, **two tabs** (`Tabs` component): *Contas a Pagar* / *Reembolsos Internos*; the active tab is
  the `ProcessType`.
- **Action-driven** (no drag-and-drop in V1): cards expose buttons that call guarded backend
  transitions. *(A guarded drag-as-trigger for forward moves is a deferred future option — see
  [ADR-002](../decisions/ADR-002-kanban-purpose-built-boards.md).)*

## 2. State & data syncing

**Ownership split.** Server truth (boards, cards, history) lives in **TanStack Query**; ephemeral view
state (active tab, selected card, filters) lives in Zustand/URL (§3). Cards are **never** copied into
Zustand — Query is the single client cache (a `react-tanstack-query` rule, and the usual source of
desync bugs). Unlike the funds list, **the board changes underneath the user** — ingestion creates
cards asynchronously and other staff advance/approve — so freshness is a first-class concern.

### Query keys & shape
- `query-keys.ts`: `kanban.board(process)` and `kanban.card(id)`.
- `useBoardQuery(process)` → `GET /cards?process=…` returning **`BoardColumnResponse[]`** (the server
  groups by phase per `CardTransitionPolicy`) — the client never re-derives phase logic.
- `useCardQuery(id)` → `GET /cards/{id}` (`CardDetailResponse`: email + metadata + history).

### Freshness — polling (V1)
The global query config (`staleTime 5m`, `refetchOnWindowFocus false`) is **too stale for a live
board**, so `useBoardQuery` **overrides per-hook** (the skill permits per-hook overrides for real-time
data):
- `refetchInterval: 20_000` (~15–30s), `refetchIntervalInBackground: false` (pause when the tab is
  hidden), short `staleTime` (~`10_000`), `refetchOnWindowFocus: true`.

This yields a near-live board with **zero backend work**. **Deferred: SignalR/WebSocket *push*** — revisit
only if 15–30s lag proves unacceptable; the polling design upgrades cleanly (swap the interval for a
"card changed → invalidate" subscription).

### Mutations — invalidate-by-default, optimism-deferred
- `useApproveCard` / `useRejectCard` / `useAdvanceCardPhase` → `onSuccess` **`invalidateQueries`** the
  affected `kanban.board(process)` + `kanban.card(id)`. The board refetches **authoritative** server
  state — correctness over snappiness, the right default for a money workflow. Invalidate immediately
  after the user's own action (don't wait for the poll).
- **Optimistic updates are deferred** to the low-risk operator forward-moves only (and would pair with a
  future DnD): `onMutate` snapshot + move, `onError` rollback, `onSettled` invalidate. **Not** used for
  Approve/Reject, where the backend may legitimately reject the move (illegal phase / not `Approver`).
- Errors are `ApiError` (ProblemDetails) → `ApiErrorBanner` / toast.

### Concurrency
The backend `CardTransitionPolicy` **is** the concurrency control: if two approvers race, the second
gets a `4xx` (`InvalidTransition` / already-approved) → toast "card already moved" + refetch. No
client-side locking in V1; add ETag/row-version optimistic concurrency only if real contention appears.

## 3. View state (Zustand + URL)
- **URL search params** own shareable, refresh-safe view state — active tab (`?process=ContasAPagar`) and
  list filters (TanStack Router `validateSearch`).
- A small `kanban.ui.store.ts` (mirror `ui.store.ts`) owns only transient interaction state:
  `selectedCardId`, modal open. One store per domain, explicit interface, devtools action names
  (`react-zustand` rules). No server data here.

## 4. Board view
- Columns = the phases for the active `ProcessType` (`kanban-card-spec.md` §4). Each column shows the
  phase label + count; cards render as `Card`s with Title, Payee, **`Amount`** (`formatBRL`), DueDate, a
  status `Badge`, and (if any) an attachment count. `Skeleton` while loading; `EmptyState` per empty
  column.
- **Card order is server-provided** — V1 derived sort (Contas a Pagar by `DueDate`, Reembolsos by
  `ReceivedAt`; see `kanban-card-spec.md` §10). The client renders it as-is; **no manual reorder in V1**.
- A list/table view toggle (`index.md` §10 "support more than the board") is a nice-to-have — deferred.

## 5. Card detail (Modal or nested route)
- **Email panel** — `BodyPreview` (PII-safe) + attachments (boletos / notas fiscais) with download; the
  raw body loaded lazily (storage target TBD — `kanban-card-spec.md` §11).
- **Metadata panel** — Payee, Amount, DueDate, ProcessType, current Phase. Editable fields deferred
  (V2 AI auto-fill).
- **History** — the `CardPhaseTransition` trail (who / when / from→to / note) — the compliance view.
- **Actions** — role-gated (§6).

## 6. Role-gating (reuses the SSO primitive — UX only)
- **Approve / Reject** → `<RoleGate roles={['Approver']}>`. Reject requires a note (matches the domain
  `NoteRequired` rule).
- **Advance phase / operator moves** → `<RoleGate roles={['Operator','Admin']}>`.
- **Read** (board + detail) → any authenticated role (`Viewer+`).
- ⚠️ **Gating is UX only — not the boundary.** The API enforces it (`ApproveCard` checks
  `ICurrentUserProvider`; returns 403). Handle a 403 gracefully if a stale UI lets a click through.

## 7. Accessibility
- Buttons (not drag-drop) are keyboard-operable by default; WCAG AA contrast (`index.md` §10). Use the
  existing `Modal` focus trap. Convey phase/status with text + badge, never color alone.

## 8. Verification
- `npm run lint && npm run build`.
- With **simulated ingestion** running (Slice 1), a card appears in *Contas a Pagar* → `Recebido`.
- As `Operator`: can advance a card; Approve/Reject hidden. As `Approver`: Approve/Reject visible;
  approving moves the card and appends history. As `Viewer`: read-only, no action buttons; a forced
  call returns **403**.
