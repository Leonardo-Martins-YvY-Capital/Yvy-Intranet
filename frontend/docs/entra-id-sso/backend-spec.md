# Entra ID SSO — Backend Spec

> Domain, application, persistence, and API design for authenticating the Yvy intranet against
> Microsoft Entra ID. Companion to [`index.md`](./index.md) and [`frontend-spec.md`](./frontend-spec.md).
> Decisions recorded in [ADR-001](../decisions/ADR-001-entra-id-sso-authentication.md).

| | |
|---|---|
| **Status** | ✅ Implemented — net10; unit + integration tests green. As-built notes in [`index.md`](./index.md) §8. |
| **Layers** | `Yvy.Domain`, `Yvy.Application`, `Yvy.Infrastructure`, `Yvy.Api` |
| **Templates mirrored** | `Aggregates/Investors/Investor.cs`, `Funds/Commands/CreateFund/*`, `Endpoints/Funds/FundEndpoints.cs`, `FundConfiguration.cs` |
| **New package** | `Microsoft.Identity.Web` (wraps `Microsoft.AspNetCore.Authentication.JwtBearer`) |

> ⚠️ Microsoft.Identity.Web setup, the App Roles claim shape, and token-validation defaults **must
> be confirmed against official Microsoft docs at build time** (`source-driven-development`).

---

## 1. Contract first (SDD) — `backend/.openapi/yvy-api.yaml`

The contract is the source of truth, so it changes before code:

- Add `components.securitySchemes.entraId` — either `openIdConnect` pointing at the tenant discovery
  document, or `oauth2` with the `authorizationCode` flow (Entra authorize/token URLs + the API
  scope `access_as_user`).
- Add a top-level `security:` requirement so all operations require auth by default.
- Add `401` and `403` `ProblemDetails` responses to operations.
- Document the **required role** per operation (e.g. the future `POST /cards/{id}/approve` requires
  `Approver`; write operations on funds require at least `Operator`/`Admin`).

---

## 2. Domain — `ApplicationUser` aggregate

New folder `src/Yvy.Domain/Aggregates/Users/`. Mirrors the `Investor` aggregate: private setters,
static factory, behavior methods returning `ErrorOr`, domain events.

### Properties

| Property | Type | Notes |
|---|---|---|
| `Id` | `Guid` | `AggregateRoot` identity. |
| `EntraObjectId` | `EntraObjectId` (VO) | Entra `oid` — the stable external key. **Unique.** |
| `Upn` | `string` | User principal name (sign-in name). |
| `Email` | `Email` (VO) | Reuses `ValueObjects/Email.cs`. |
| `DisplayName` | `string` | For UI. |
| `Roles` | `IReadOnlySet<Role>` | Subset of `{ Approver, Operator, Viewer, Admin }`. |
| `Status` | `UserStatus` enum | `Active` \| `Disabled`. |
| `CreatedAt` / `LastLoginAt` | `DateTime` / `DateTime?` | UTC, same convention as `Fund`/`Investor`. |

All setters `private`; one factory + a parameterless constructor for EF Core (matches `Investor`).

### Factory & behavior

- **`static ErrorOr<ApplicationUser> Provision(EntraObjectId oid, string upn, Email email, string displayName, IEnumerable<Role> roles)`**
  — validates non-empty upn/displayName, sets `Status = Active`, `CreatedAt`, raises
  **`ApplicationUserProvisionedDomainEvent`** (mirror `Investor.CreateNaturalPerson` +
  `InvestorOnboardedDomainEvent`).
- **`ErrorOr<Updated> RecordLogin(DateTime utcNow)`** — bumps `LastLoginAt`.
- **`ErrorOr<Updated> SyncRoles(IEnumerable<Role> roles)`** — reconcile local roles with the token's
  role claims on each login (Entra is the source of truth for role membership).

### Supporting types

- **`EntraObjectId` value object** (`ValueObjects/EntraObjectId.cs`) — validates a non-empty,
  GUID-shaped id; `GetEqualityComponents()` returns the value. Mirrors `Email`/`FundCode`.
- **`Role` enum** (`Aggregates/Users/Role.cs`) — `Approver | Operator | Viewer | Admin`. Shared by
  the aggregate, the API authorization policies, and `ICurrentUserProvider`.
- **`IApplicationUserRepository`** (Domain) — `GetByEntraObjectIdAsync(EntraObjectId, ct)`,
  `AddAsync(ApplicationUser, ct)`.
- **`ApplicationUserErrors`** (mirror `FundErrors`) — `NotProvisioned`, `Disabled`, etc.

### Domain event

`ApplicationUserProvisionedDomainEvent(EventId, OccurredOn, UserId, EntraObjectId)` — persisted via
the existing **Outbox** and dispatched by Quartz, so onboarding side-effects can be added later as
`INotificationHandler<…>` without touching the aggregate.

> **Decision (implemented): the `EntraObjectId` field is a `string`, not the value object.** Domain
> events are JSON-serialized into the Outbox table and rehydrated later by the Quartz dispatcher. The
> `EntraObjectId` VO has a private parameterless constructor and `private init` setter, so it does not
> round-trip cleanly through `System.Text.Json` without bespoke converter wiring. The existing
> `InvestorOnboardedDomainEvent` already sets the precedent of carrying **primitives only** (`string`,
> `Guid`, enum) for exactly this reason. We therefore pass `user.EntraObjectId.Value` (the normalized
> canonical string). Trade-off: the event surface is slightly less type-safe than the aggregate, which
> is the accepted cost of Outbox serialization safety and consistency with the other domain events.

---

## 3. Persistence — `Yvy.Infrastructure`

- `YvyDbContext`: add `DbSet<ApplicationUser> ApplicationUsers`.
- `ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>` → table
  `application_users` (snake_case), **unique index on `entra_object_id`**, `Email`/`EntraObjectId`
  via `OwnsOne` or value conversion, `Roles` stored as a value-converted comma-joined string or a
  text[] column. Mirror `FundConfiguration.cs`.
- `ApplicationUserRepository` in `Persistence/Repositories/`.
- Migration: `dotnet ef migrations add AddApplicationUsers --project backend/src/Yvy.Infrastructure
  --startup-project backend/Yvy.Api`.

---

## 4. API — authentication, authorization, current user

### 4.1 Wiring (`Yvy.Api`)

- Add `Microsoft.Identity.Web` to `Yvy.Api.csproj`.
- New `Yvy.Api/Extensions/AuthenticationExtensions.cs` (keeps `Program.cs` lean):
  - `services.AddAuthentication().AddMicrosoftIdentityWebApi(config.GetSection("EntraId"))`.
  - `services.AddAuthorization()` with one policy per role: `Approver`, `Operator`, `Viewer`,
    `Admin` (each a `RequireRole`/`RequireClaim` on the App Roles claim).
- `Program.cs`: enable user-secrets (`builder.Configuration.AddUserSecrets<Program>(optional: true)`)
  and place middleware **between CORS and rate-limiting**:

  ```
  app.UseCors("YvyFrontend");
  app.UseAuthentication();   // ← new
  app.UseAuthorization();    // ← new
  app.UseRateLimiter();
  ```

- `appsettings.json` gains an `EntraId` section with **placeholder** values only:

  ```json
  "EntraId": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "<set-in-user-secrets>",
    "ClientId": "<set-in-user-secrets>",
    "Audience": "<api-app-id-uri-or-clientid>"
  }
  ```

### 4.2 `ICurrentUserProvider` (the contract the Kanban relies on)

`Yvy.Application/Abstractions/ICurrentUserProvider.cs` — the abstraction the Kanban
`ApproveCard`/`RejectCard` handlers (`kanban-card-spec.md` §10) and future features depend on:

```
public interface ICurrentUserProvider
{
    Guid? UserId { get; }                  // local ApplicationUser.Id (null if anonymous)
    EntraObjectId? EntraObjectId { get; }
    string? Email { get; }
    IReadOnlySet<Role> Roles { get; }
    bool IsInRole(Role role);
}
```

Implementation in `Yvy.Api` (or `Infrastructure`) reads `IHttpContextAccessor.HttpContext.User`
claims (`oid`, `preferred_username`/`upn`, `email`, the App Roles claim). Registered in DI.
**Application code never touches `HttpContext` directly** — it depends only on this interface, so
handlers stay unit-testable with a mock.

### 4.3 JIT provisioning (idempotent)

On the first authenticated request from a user not yet in `application_users`, create the record and
record login. Two viable hooks — choose at build time:

- **`OnTokenValidated` event** on the JWT bearer options — runs once per token, looks up by oid,
  sends an `EnsureUserProvisioned` command if missing.
- **`EnsureUserProvisioned` MediatR command** invoked by a lightweight endpoint filter / behavior on
  authenticated requests.

Either way the handler is **idempotent** (look up by `EntraObjectId`; provision only if absent; else
`RecordLogin` + `SyncRoles`). This mirrors the idempotency discipline used by the Kanban
`CreateCardFromEmail` handler.

### 4.4 Securing endpoints

- Apply `.RequireAuthorization()` to existing endpoint groups (`Endpoints/Funds/FundEndpoints.cs`)
  and add role policies to writes (e.g. `CreateFund` → `Admin`/`Operator`).
- Errors already map correctly: `Yvy.Api/Extensions/ErrorOrExtensions.cs` translates
  `ErrorType.Unauthorized → 401` and `ErrorType.Forbidden → 403` — handlers just return the right
  `ErrorOr` error.

---

## 5. Tests

| Project | Coverage |
|---|---|
| `Yvy.Domain.Tests` | `ApplicationUser.Provision` validation; `RecordLogin`/`SyncRoles`; `EntraObjectId` VO; exactly one `ApplicationUserProvisionedDomainEvent` on provision. |
| `Yvy.Application.Tests` | `EnsureUserProvisioned` handler — provisions on first login, idempotent on repeat (no duplicate), syncs roles. NSubstitute mocks for repo + `IUnitOfWork`. |
| `Yvy.Api.IntegrationTests` | A **test authentication handler** registered in `YvyApiFactory` that injects configurable claims (oid/email/roles) so `[Authorize]` passes. Cases: **401** (no token), **403** (`Viewer` hits an `Approver`-only route), **200** (authorized), and **user row provisioned** on first authenticated call. |

Test-auth-handler pattern: override `ConfigureWebHost` in `YvyApiFactory` to add an
`AuthenticationHandler<…>` scheme that reads claims from a request header, so each test can request
a specific role without a live Entra tenant.

---

## 6. Invariants (assert in tests)

1. `Provision` requires a valid `EntraObjectId`, `Email`, non-empty `Upn`/`DisplayName`.
2. A provisioned user is `Active` and raises exactly one provisioned event.
3. Looking up by `EntraObjectId` is unique (DB unique index + repo contract).
4. Re-authentication never creates a second row (idempotent JIT).
5. Roles on the local record always reflect the latest token role claims after login.
6. No oid/upn/email/token value is ever written to a log sink (compliance check).

---

## 7. Configuration & secrets

| Key (`EntraId:`) | Source | Notes |
|---|---|---|
| `Instance` | `appsettings.json` | `https://login.microsoftonline.com/`. |
| `TenantId` | user-secrets / env | Never committed. |
| `ClientId` | user-secrets / env | The API app registration client id. |
| `Audience` | user-secrets / env | API Application ID URI (or client id). |

The **Graph worker** (Kanban ingestion) uses a *separate* registration + `Mail.Read` app permission
+ client secret — see `financial-process-kanban/email-ingestion-spec.md` §7. Keeping them separate
limits the blast radius of the high-privilege mailbox secret (ADR-001).
