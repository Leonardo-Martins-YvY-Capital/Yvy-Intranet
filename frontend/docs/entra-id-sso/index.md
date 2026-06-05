# Microsoft Entra ID SSO

> Authentication & authorization for the Yvy intranet via **Microsoft Entra ID** (Azure AD).
> This is the **"auth chunk"** the [Financial Process Kanban](../financial-process-kanban/index.md)
> feature depends on: manager approvals need real identity with roles. Companion specs:
> [`backend-spec.md`](./backend-spec.md), [`frontend-spec.md`](./frontend-spec.md),
> [`auth-flow.md`](./auth-flow.md) (runtime walkthrough), and
> [ADR-001](../decisions/ADR-001-entra-id-sso-authentication.md).

| | |
|---|---|
| **Status** | ✅ Implemented & merged to `main` (2026-06-05, PR #1 + follow-up fix) |
| **Date** | 2026-06-03 (designed) · 2026-06-05 (shipped) |
| **Author** | leonardo.martins@yvy.capital |
| **Stage** | Done — SPA bearer + JIT users + 4 App Roles, all phases complete (see §8) |

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

## 8. Implementation phases (SDD order) — ✅ all complete

0. ✅ **Azure prerequisites** — 3 registrations (`Yvy.Intranet.Api`, `Yvy.Intranet.SPA`,
   `Yvy.Graph.Worker`), `access_as_user` scope, 4 App Roles, user assignment.
   Tutorial: [`phase-0-entra-setup.md`](./phase-0-entra-setup.md).
1. ✅ **Contract first** — `entraId` (openIdConnect) security scheme + global `security` + 401/403 in `yvy-api.yaml`.
2. ✅ **Domain** — `ApplicationUser` aggregate, `EntraObjectId` VO, `Role` enum, repo interface, provisioned event.
3. ✅ **Infrastructure** — `DbSet` + `ApplicationUserConfiguration` + `AddApplicationUsers` migration.
4. ✅ **Backend API** — `Microsoft.Identity.Web`, role policies, `ICurrentUserProvider`, JIT provisioning.
5. ✅ **Frontend** — MSAL, login page, route guards, async token in `api.ts`, role-gated UI (`<RoleGate>`).
6. ✅ **Tests** — **81 green** (Domain 61, Application 11, integration 9 incl. 401/403/provisioning).

### As-built deviations from the original design
- **Runtime: .NET 10**, not 9 — the dev machine had no .NET 9 runtime, so all projects retargeted to
  `net10.0` (LTS); packages stay on their 9.x versions. (`CLAUDE.md`/`BACKEND.md` updated.)
- **Provisioned event carries a `string` oid**, not the VO — Outbox JSON-serialization safety, matching
  `InvestorOnboardedDomainEvent` (`backend-spec.md` §2).
- **JIT provisioning is scheme-agnostic** (`UserProvisioning.EnsureProvisionedAsync`) so both the real
  JWT `OnTokenValidated` path and the integration test-auth handler exercise it.
- **Frontend roles come from the access token** (decoded client-side) — App Roles live on the API
  registration, so `account.idTokenClaims.roles` is empty.
- **`<MsalProvider>` owns redirect handling** — we do *not* call `handleRedirectPromise` manually
  (doing both throws `no_token_request_cache_error`); app render gates on `inProgress === None`.
- **Post-login lands on home `/`** — destination-preservation deferred (Entra returns to the origin
  redirect URI). `<RoleGate>`/`useHasRole` shipped, ready for the Kanban approval UI.

---

## 9. Resolved decisions (formerly open questions)

- **Registrations:** three created (API + SPA + Graph worker) — least privilege.
- **Token cache:** `sessionStorage` (ADR-001 XSS trade-off; revisit only if a BFF is adopted).
- **SPA redirect URI must be registered under the _Single-page application_ platform** — registering it
  under _Web_ causes `AADSTS9002326` at token redemption (learned in build; see `phase-0` Appendix B).
- **Still open (ops/IT policy):** Group → App Role mapping — which Entra groups map to
  `Approver`/`Operator`/`Viewer`/`Admin`; and production redirect URIs when the app is deployed.

---

## 10. Next steps

The SSO foundation is complete and merged. The next feature — the **Financial Process Kanban** — can
now build its **approval slice** on `ICurrentUserProvider` + the `Approver` policy (backend) and the
`<RoleGate>` primitive (frontend). See [`../financial-process-kanban/`](../financial-process-kanban/index.md).
