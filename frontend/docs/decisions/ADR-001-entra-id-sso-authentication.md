# ADR-001: Authenticate the intranet with Microsoft Entra ID (SPA bearer + JIT users + 4 App Roles)

## Status
Accepted

## Date
2026-06-03

## Context

The Yvy intranet has no authentication. The [Financial Process Kanban](../entra-id-sso/index.md)
feature introduces **in-platform manager approvals** for money movement, which require real identity
with roles — the Kanban specs explicitly defer this to an "SSO chunk" that must provide an
`ICurrentUserProvider`. We need to choose an authentication strategy for the whole intranet.

Constraints and forces:

- Staff identities already live in **Microsoft 365 / Entra ID**; single sign-on is expected.
- The system is **finance + compliance** (CVM 175, PII) — an audit trail of who approved what is
  required, and CPF/CNPJ/identity must never leak to logs.
- The frontend already has a **Bearer-token-aware `fetch` client** and a roles concept; the backend
  (.NET 9, DDD/CQRS) has clean extension points and already maps `Unauthorized`/`Forbidden` errors.
- The same Entra tenant is needed for **Graph email ingestion** (app-only `Mail.Read`), a *different*
  auth mode from user sign-in.
- This is an **expensive-to-reverse** decision (touches DB schema, API, and SPA).

## Decision

1. **Authenticate via Entra ID using the SPA bearer-token pattern.** MSAL.js in the React SPA
   acquires an access token for the API scope; `Yvy.Api` validates the JWT with
   `Microsoft.Identity.Web`. The API stays stateless.
2. **Staff only.** `ApplicationUser` is a new aggregate for staff identity; `Investor` remains a pure
   business record with no login.
3. **JIT-provision a local `application_users` record** on first login (Entra `oid`, UPN, email,
   roles, last-login) for audit and as a linkage point.
4. **Four App Roles with segregation of duties:** `Approver`, `Operator`, `Viewer`, `Admin`,
   enforced as ASP.NET authorization policies and surfaced to handlers via `ICurrentUserProvider`.
5. **Two app registrations:** a user-facing API/SPA registration (exposed scope + App Roles) and a
   separate app-only Graph worker registration (`Mail.Read` + secret).

## Alternatives Considered

### Token flow: BFF (cookie session) instead of SPA bearer
- **Pros:** No tokens in the browser → stronger against XSS token theft; server-side session control.
- **Cons:** Requires a server-side OIDC code flow + cookie/session handling; changes the existing
  `api.ts` Bearer model; more moving parts for a staff intranet.
- **Rejected (for now):** The threat model (internal staff tool) and the existing Bearer client make
  the SPA pattern the pragmatic fit. Documented as the **fallback** if XSS risk is later deemed
  unacceptable.

### Identity model: extend the `Investor` aggregate
- **Pros:** No new aggregate.
- **Cons:** Conflates a *business record* (cotista) with an *application login*; investors don't log
  in to the staff intranet; pollutes the domain.
- **Rejected:** Separate `ApplicationUser` keeps the domain honest and matches "staff only".

### User store: stateless (claims only, no table)
- **Pros:** Less to build; identity/roles come purely from the validated token.
- **Cons:** No local audit trail, no `last_login`, no place to link domain data — weak for a
  compliance-sensitive finance system.
- **Rejected:** JIT provisioning is a small cost for the audit/traceability benefit.

### Authz: keep `Admin` / `Viewer` only
- **Pros:** Fewer roles to manage.
- **Cons:** No separation between *operating* a card and *approving* money — the operator who triages
  a bill could also approve its payment. Poor segregation of duties for a financial workflow.
- **Rejected:** Four roles (`Approver`/`Operator`/`Viewer`/`Admin`) directly model the approval
  feature's needs.

### Registrations: one shared registration for SSO + Graph
- **Pros:** One thing for IT to manage.
- **Cons:** Puts the high-privilege `Mail.Read` application secret in the same identity as the
  user-facing app — larger blast radius if compromised.
- **Rejected (recommended against):** Two registrations follow least privilege. One *can* host both
  if IT insists, but the trade-off is recorded here.

## Consequences

- New `application_users` table + EF migration; new `ApplicationUser` aggregate, `EntraObjectId` VO,
  and `Role` enum in the domain.
- New `ICurrentUserProvider` abstraction in `Yvy.Application` — the contract the Kanban approval
  handlers and future authenticated features consume.
- `Microsoft.Identity.Web` added to the API; `@azure/msal-browser` + `@azure/msal-react` to the SPA;
  `api.ts` token acquisition becomes async.
- The OpenAPI contract gains security schemes (source-of-truth change, made first).
- A **Phase 0 IT dependency**: Entra registration(s), scope, and App Role assignment must exist
  before end-to-end verification.
- Integration tests need a test authentication handler to stub claims without a live tenant.
- If the XSS threat model changes, migrating to a BFF cookie session is the documented path and
  would supersede this ADR.
