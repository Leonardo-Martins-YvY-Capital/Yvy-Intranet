# Microsoft Entra ID SSO

> Authentication & authorization for the Yvy intranet via **Microsoft Entra ID** (Azure AD).
> This is the **"auth chunk"** the [Financial Process Kanban](../financial-process-kanban/index.md)
> feature depends on: manager approvals need real identity with roles. Companion specs:
> [`backend-spec.md`](./backend-spec.md), [`frontend-spec.md`](./frontend-spec.md),
> [`auth-flow.md`](./auth-flow.md) (runtime walkthrough), and
> [ADR-001](../decisions/ADR-001-entra-id-sso-authentication.md).

| | |
|---|---|
| **Status** | Design for review — no code yet |
| **Date** | 2026-06-03 |
| **Author** | leonardo.martins@yvy.capital |
| **Stage** | Approach confirmed (SPA bearer + JIT users + 4 App Roles) |

---

## 1. Context & Origin

The intranet currently has **no authentication** — every API endpoint is open, the OpenAPI
contract declares no security schemes, and the frontend has no login. That was acceptable while the
app only listed funds, but the **Financial Process Kanban** feature introduces **in-platform manager
approvals** for money movement (Contas a Pagar, Reembolsos). Approving a payment requires *who you
are* and *whether you're allowed* — i.e. authenticated identity with roles.

All three Kanban specs defer identity to "the SSO chunk" and assume it provides an
**`ICurrentUserProvider`** (current user id + roles) consumed by the `ApproveCard` / `RejectCard`
handlers (`financial-process-kanban/kanban-card-spec.md` §5/§10). The same feature's email
ingestion needs an **Entra app registration** for Microsoft Graph. SSO is therefore the foundational
auth layer that unblocks the approval slice — and the natural place to do it once, properly, for the
whole intranet.

The domain is on **Microsoft 365**, so Entra ID is the obvious identity provider: staff already have
accounts, and single sign-on means no new credentials to manage.

---

## 2. Scope

### In scope (V1)
- Staff sign-in to the intranet via Entra ID (OIDC), MSAL.js in the SPA.
- A protected API: every endpoint requires a valid token; writes require a role.
- **JIT-provisioned application users** — a local `application_users` record created on first login
  (audit trail for CVM 175).
- **Four App Roles** with segregation of duties: `Approver`, `Operator`, `Viewer`, `Admin`.
- An `ICurrentUserProvider` abstraction the Kanban approval handlers (and future features) consume.
- Frontend login page, route guards, role-gated UI, user menu + logout.

### Out of scope
- External investor login (staff only — see [§4](#4-confirmed-decisions)).
- The Graph **app-only** mailbox integration itself (tracked in the Kanban email-ingestion spec;
  this doc only coordinates the registration topology).
- BFF cookie sessions (documented fallback, not chosen — see ADR-001).

---

## 3. Architecture

```
Browser (React SPA)                  Entra ID                 Yvy.Api (.NET 9)
  │  MSAL.js login (redirect) ──────►  authenticate           │
  │  ◄── id_token + access_token (API scope, roles claim)     │
  │  fetch /api/v1/... Authorization: Bearer <token> ────────►│ JwtBearer validates issuer/aud/sig
  │                                                            │ JIT-provision ApplicationUser
  │  ◄──────────── JSON / 401 / 403 ──────────────────────────│ enforce Approver/Operator/… policy
                                                               │ ICurrentUserProvider ← claims
                            (separate) Graph Worker ──app-only──► Mail.Read (Kanban ingestion)
```

MSAL owns the token cache and silent refresh; the API is **stateless** (validates the JWT per
request) and persists only a user record + last-login for audit.

**Step-by-step runtime walkthrough** — how the SPA and API actually communicate, and how the
`id_token`/`access_token` are obtained (auth-code + PKCE): [`auth-flow.md`](./auth-flow.md).

---

## 4. Confirmed Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Who logs in** | **Internal staff only** | The intranet is a staff tool. `Investor` stays a pure business record; no login. Avoids Entra External ID / B2C complexity. |
| **Token flow** | **SPA bearer token** (MSAL.js → API validates JWT) | Matches the existing Bearer-token `api.ts` client. Standard SPA+API pattern. See ADR-001 for the BFF alternative. |
| **User store** | **JIT-provisioned `application_users` table** | First login creates a local record (oid, UPN, email, roles, last_login) → audit trail + linkage point. |
| **Authz model** | **4 App Roles: `Approver` / `Operator` / `Viewer` / `Admin`** | Segregation of duties on money movement: the operator who triages a bill can't also approve its payment. |
| **Registration topology** | **Two registrations** (user-facing API/SPA + app-only Graph worker) | Keeps the high-privilege `Mail.Read` secret out of the user-facing app. See ADR-001. |

### Role semantics

| Role | Can do | Maps to Kanban |
|---|---|---|
| `Viewer` | Read boards, cards, funds | read-only staff |
| `Operator` | Advance cards through **non-approval** phases (`AdvanceCardPhase`) | triage / operations |
| `Approver` | `ApproveCard` / `RejectCard` (money decisions) | manager / approver |
| `Admin` | Manage users + everything above | system administrator |

---

## 5. Per-layer context map

The original question that started this work was *"which context is relevant for each
application?"* — captured here so each layer's work starts from the right place.

| Layer | Read before starting | Key existing files to mirror | New dependency |
|---|---|---|---|
| **Cross-cutting** | `spec-driven-development`, `source-driven-development`, `security-and-hardening`, `documentation-and-adrs` skills; `CLAUDE.md` logging rules | — | — |
| **Contract** | OpenAPI 3.1 `oauth2`/`openIdConnect` schemes | `backend/.openapi/yvy-api.yaml` | — |
| **Database** (`Yvy.Infrastructure`) | EF Core config + migration conventions | `Persistence/YvyDbContext.cs`, `Migrations/`, `FundConfiguration.cs` | — |
| **Backend** (`Domain`/`Application`/`Api`) | DDD aggregate + CQRS + middleware order | `Aggregates/Investors/Investor.cs`, `Funds/Commands/CreateFund/*`, `Program.cs`, `Endpoints/Funds/FundEndpoints.cs`, `Extensions/ErrorOrExtensions.cs` | `Microsoft.Identity.Web` |
| **Frontend** | TanStack Router `auth-and-guards` skill, `react-zustand`, `bm-design-system` | `src/main.tsx`, `src/router.ts`, `src/lib/api.ts`, `src/store/auth.store.ts`, `src/layouts/Sidebar.tsx` | `@azure/msal-browser`, `@azure/msal-react` |
| **Azure/Entra** | Entra App Roles + app registration docs | — (outside repo) | — |

Details per layer live in [`backend-spec.md`](./backend-spec.md) and
[`frontend-spec.md`](./frontend-spec.md).

---

## 6. Compliance constraints (carry into implementation)

- **Never log** Entra `oid`, UPN, email, access/id tokens, or CPF/CNPJ in structured logs
  (CVM 175 / PII). Extends the existing CPF/CNPJ logging rule in `CLAUDE.md`.
- Validate **issuer + audience + signature**, pin the tenant (Microsoft.Identity.Web does this).
- Secrets (TenantId/ClientId/Audience, Graph secret) via **user-secrets / environment only** —
  `appsettings.json` holds placeholders. Graph's `Mail.Read` secret lives in a **separate**
  registration (least privilege, smaller blast radius).
- **Authorize at the API**, not just the UI. Route guards and role-gated buttons are UX, not a
  security boundary.

---

## 7. Sequencing vs the Kanban feature

1. **SSO (this feature)** lands authn/authz + `ICurrentUserProvider` + the 4 roles.
2. **Kanban email-ingestion slice** proceeds *in parallel* — it's built behind a simulated gateway
   and its webhook is intentionally **anonymous** (protected by `clientState`), so it is not auth-blocked.
3. **Kanban approval slice** depends on SSO: `ApproveCard`/`RejectCard` consume `ICurrentUserProvider`
   and require the `Approver` policy. Build it after the backend auth phase here is merged.

---

## 8. Implementation phases (SDD order)

0. **Azure prerequisites** (Entra admin) — registrations, scope, 4 App Roles, user assignment.
   **Step-by-step tutorial: [`phase-0-entra-setup.md`](./phase-0-entra-setup.md).**
1. **Contract first** — add security schemes to `yvy-api.yaml`.
2. **Domain** — `ApplicationUser` aggregate, `EntraObjectId` VO, `Role`, repository interface.
3. **Infrastructure** — DbContext + `application_users` config + migration.
4. **Backend API** — auth middleware, policies, `ICurrentUserProvider`, JIT provisioning.
5. **Frontend** — MSAL, login page, route guards, async token in `api.ts`, role-gated UI.
6. **Tests** — domain/app unit tests, integration test-auth handler (401/403/200 + provisioning).

---

## 9. Open Questions / TBD

- **Entra provisioning** (Phase 0, IT-dependent): tenant access, registration(s), scope name /
  Application ID URI, prod redirect URIs.
- **One vs two registrations** — recommended two; confirm with IT.
- **Group → App Role mapping** — which staff/Entra groups are `Approver` vs `Operator`.
- **Token cache location** (sessionStorage vs in-memory) and lifetime — XSS trade-off; revisit if a
  BFF is later required (ADR-001 fallback).

---

## 10. Recommended Next Steps

1. Review this doc set + ADR-001 (per "document before implementing").
2. Stand up the Entra registration(s) with IT (Phase 0) — the only blocking, external dependency.
   Follow the tutorial: [`phase-0-entra-setup.md`](./phase-0-entra-setup.md).
3. Land the contract change, then the backend auth phases (delivers `ICurrentUserProvider`).
4. Wire the frontend MSAL flow + guards.
5. Hand `ICurrentUserProvider` to the Kanban approval slice.
