# Phase 0 — Entra ID App Registration (Tutorial + Technical Explanation)

> The one **blocking, IT-owned prerequisite** for Entra ID SSO: creating the Microsoft Entra ID app
> registrations, the API scope, the App Roles, and the user assignments that the backend and
> frontend consume. This is a teaching doc — each step is paired with the *why*. Companion to
> [`index.md`](./index.md), [`backend-spec.md`](./backend-spec.md), [`frontend-spec.md`](./frontend-spec.md),
> and [ADR-001](../decisions/ADR-001-entra-id-sso-authentication.md).

| | |
|---|---|
| **Status** | Ready to perform |
| **Date** | 2026-06-03 |
| **Audience** | Whoever holds Entra admin rights (you, or an IT admin you instruct) |
| **Outcome** | 3 app registrations, 1 exposed scope, 4 App Roles, assigned users, and a filled-in values sheet |
| **Portal** | [https://entra.microsoft.com](https://entra.microsoft.com) (Microsoft Entra admin center) |

> Portal navigation verified against Microsoft Learn (quickstarts updated 2025–2026). Microsoft
> moves menus and renames blades over time — if a label differs, trust the linked Learn page in
> [§References](#references) over this doc (`source-driven-development`).

---

## 0. Before you start

### Who can do this

| Task | Minimum Entra role |
|---|---|
| Create registrations, expose API, define App Roles | **Application Administrator** or **Cloud Application Administrator** |
| Assign users/groups to App Roles | **Cloud Application Administrator** (+ the app's **Owner**) |
| **Grant admin consent** (delegated scope, Graph `Mail.Read`) | **Global Administrator** or **Privileged Role Administrator** |

If you are not a Global Admin, you can do everything *except* the "Grant admin consent" clicks —
hand those two to a Global Admin.

### What you will create (and why three registrations)

| Registration | Auth mode | Purpose | ADR-001 |
|---|---|---|---|
| **`Yvy.Intranet.Api`** | — (resource) | Exposes the API scope `access_as_user` **and** defines the 4 App Roles. The access token's audience. | resource app |
| **`Yvy.Intranet.SPA`** | Delegated (user sign-in) | The React app. Public client; granted the API's scope. | client app |
| **`Yvy.Graph.Worker`** | Application (app-only) | Background daemon that reads the finance mailbox for the Kanban feature. `Mail.Read` + secret. | separate, least-privilege |

We keep the high-privilege mailbox secret (`Mail.Read`) in its **own** registration so a leak there
can't also compromise user sign-in. See ADR-001 for the full rationale.

---

## 1. Concepts primer (read once — the rest makes more sense after)

- **Tenant** — your organization's Entra directory (Yvy's M365 tenant). Every registration lives in it.
- **App registration vs Enterprise Application (service principal).** The *registration* is the
  app's *definition* (its IDs, scopes, roles, secrets). When an app exists in a tenant it also has a
  *service principal* — the **Enterprise Application** — which is the *instance* you grant consent to
  and **assign users to**. Rule of thumb: **define** things on the App registration; **assign users
  / require assignment** on the Enterprise Application. This split trips everyone up once.
- **Delegated vs Application permissions.** *Delegated* = the app acts **on behalf of a signed-in
  user** (our SSO). *Application* (app-only) = the app acts **as itself**, no user (the Graph worker).
- **The two claims that matter.** When the SPA calls the API, its access token carries:
  - **`scp`** (scope) — proves the *app* was authorized for `access_as_user`.
  - **`roles`** — the App Roles the *user* was assigned (`Approver`/`Operator`/`Viewer`/`Admin`).
    The backend policies (`backend-spec.md` §4.1) read this claim.
- **Why App Roles live on the API registration.** In an *app-calling-API* scenario the access
  token's **audience is the API**, so the `roles` claim must come from roles **defined on the API
  registration** and **assigned on the API's Enterprise Application**. Defining roles on the SPA
  would put them in the *ID token*, not the API access token — the backend would never see them.
  (Confirmed by Microsoft Learn: "define the app roles and assign them … in the app registration of
  the API … a roles claim is included in the [access] token.")
- **Application ID URI** — a globally-unique id for the API, default `api://{api-client-id}`. Scopes
  are referenced as `{App ID URI}/{scope}`, e.g. `api://<api-client-id>/access_as_user`.
- **Public client + PKCE.** A SPA can't keep a secret (all JS is visible), so it's a **public
  client** using the authorization-code flow with **PKCE** — no client secret. Only the confidential
  Graph worker gets a secret.

---

## 2. Step 1 — Register the API app (`Yvy.Intranet.Api`)

**Goal:** the resource that the access token targets; host of the scope and the roles.

1. Sign in to [https://entra.microsoft.com](https://entra.microsoft.com). If you belong to multiple
   tenants, use the **Settings** (gear) icon → switch to the Yvy tenant.
2. Go to **Entra ID → App registrations → New registration**.
3. **Name:** `Yvy.Intranet.Api`.
4. **Supported account types:** **Accounts in this organizational directory only (Single tenant)** —
   staff only.
5. **Redirect URI:** leave **empty** (a web API has no interactive login).
6. **Register.**
7. On the **Overview** page, copy **Application (client) ID** and **Directory (tenant) ID** into your
   values sheet (§8) — these become `EntraId:ClientId` and `EntraId:TenantId`.

**Expose the scope:**

8. **Manage → Expose an API → Add** next to **Application ID URI**. Accept the default
   `api://<api-client-id>` → **Save**.
9. **Add a scope** with:

   | Field | Value |
   |---|---|
   | **Scope name** | `access_as_user` |
   | **Who can consent** | **Admins and users** |
   | **Admin consent display name** | `Access the Yvy intranet API as the signed-in user` |
   | **Admin consent description** | `Allows the intranet SPA to call the Yvy API on behalf of the signed-in user.` |
   | **State** | **Enabled** |

10. **Add scope.** The full scope string is now `api://<api-client-id>/access_as_user` — record it
    (→ `VITE_ENTRA_API_SCOPE`, and the audience the API validates).

> *Why:* the API validates that incoming tokens have `aud` = this app and `scp` containing
> `access_as_user`. `Microsoft.Identity.Web` (`backend-spec.md` §4.1) does this automatically from
> the `EntraId` config.

> **Token version (advanced, optional).** New registrations use the v2.0 endpoint. If, during the
> backend phase, token validation complains about the audience/version, open **Manifest** and check
> `requestedAccessTokenVersion` (set to `2` for v2 access tokens). Defer this until you actually see
> a validation error — confirm against the protected-web-API Learn page when you do.

---

## 3. Step 2 — Define the 4 App Roles (on `Yvy.Intranet.Api`)

**Goal:** the role vocabulary that lands in the `roles` claim and backs the ASP.NET policies.

1. Still in **`Yvy.Intranet.Api` → Manage → App roles → Create app role**.
2. Create **four** roles. For each: **Allowed member types = Users/Groups**, enable checkbox checked,
   then **Apply**.

   | Display name | Value (exact — matches code) | Description |
   |---|---|---|
   | Approver | `Approver` | Approve or reject money movement (Contas a Pagar, Reembolsos). |
   | Operator | `Operator` | Advance cards through non-approval phases; day-to-day operations. |
   | Viewer | `Viewer` | Read-only access to boards, cards, and funds. |
   | Admin | `Admin` | Manage application users and all operations. |

> *Why these four:* segregation of duties — the operator who triages a bill must not also approve
> its payment (`index.md` §4). The **Value** must match the strings the backend policies and the
> frontend `useHasRole` check use, so keep them PascalCase and stable.

---

## 4. Step 3 — Register the SPA app (`Yvy.Intranet.SPA`)

**Goal:** the React client that signs users in and requests the API scope.

1. **Entra ID → App registrations → New registration**.
2. **Name:** `Yvy.Intranet.SPA`; **Single tenant**.
3. **Redirect URI:** choose platform **Single-page application (SPA)** and enter
   `http://localhost:5173` (Vite dev). You'll add the production URL here later too.
4. **Register.** Copy the SPA's **Application (client) ID** → `VITE_ENTRA_CLIENT_ID`.
   (The tenant id is the same as the API's.)
5. If you need more redirect URIs later: **Manage → Authentication → Single-page application → Add
   URI** (e.g. `https://intranet.yvy.capital`).

**Grant the SPA access to the API scope:**

6. **Manage → API permissions → Add a permission → My APIs → `Yvy.Intranet.Api`**.
7. Select **Delegated permissions → `access_as_user` → Add permissions**.
8. **Grant admin consent for &lt;Yvy tenant&gt;** → **Yes**. Confirm the **Status** shows *Granted*.

> 📘 **What is "admin consent" — and why do we need it?**
>
> The SPA uses a **delegated** permission (`access_as_user`): it calls the API *on behalf of the
> signed-in user*. OAuth never lets an app silently act as you — **someone must approve** that
> delegation. That approval is *consent* (the "App X wants to access your account — Allow/Deny?"
> screen you've seen elsewhere).
>
> The only question is **who clicks Allow**:
> - **User consent** — each staff member is prompted once, at first sign-in.
> - **Admin consent** (what we do here) — **one admin approves once, tenant-wide**, so *no user ever
>   sees a prompt*.
>
> We choose admin consent because (1) this is an internal tool — prompting every employee to "allow"
> our own intranet is confusing UX; (2) many tenants **disable user self-consent** as a hardening
> setting, in which case admin consent is the *only* way the app works at all (otherwise sign-in
> fails with `AADSTS65001`, see Appendix B); and (3) it's a one-time click.
>
> **Why a Global Admin?** Consenting tenant-wide authorizes the app for *every* user in the
> directory, so Entra restricts it to **Global Administrator / Privileged Role Administrator** —
> a higher bar than creating registrations (§0). If that's not you, hand just this click off.
>
> **Note the contrast with §6:** the Graph worker uses an **application** (app-only) permission, where
> admin consent is *mandatory* — with no user in the loop, there's nobody to user-consent, so only an
> admin can grant it.

> *Why:* the SPA is a **public client** (no secret) using auth-code + PKCE — MSAL.js handles this
> (`frontend-spec.md` §1). Granting admin consent once means staff aren't individually prompted to
> consent at first sign-in.

---

## 5. Step 4 — Assign users to roles (on the API's Enterprise Application)

**Goal:** decide *who* is Approver/Operator/Viewer/Admin. **No assignment → no `roles` claim → the
API returns 403.**

1. **Entra ID → Enterprise apps → All applications → `Yvy.Intranet.Api`** (the *Enterprise
   Application*, not the registration).
2. **Manage → Properties →** set **Assignment required?** to **Yes** → **Save**. *(Now only assigned
   users can obtain a role / access the API.)*
3. **Manage → Users and groups → Add user/group**.
4. **Users and groups →** pick the user(s) or security group(s) → **Select**.
5. **Select a role →** pick one of `Approver` / `Operator` / `Viewer` / `Admin` → **Select** →
   **Assign**.
6. Repeat per role. Assigning a **security group** (e.g. a "Finance Approvers" group) is the
   recommended way to manage this at scale — manage membership in the group, not here.

> *Why on the Enterprise App:* roles are *defined* on the registration but *assigned* on the service
> principal. A user with no assignment gets a token **without** a `roles` claim; the backend's role
> policies then deny the request (403) — which is the intended default-deny posture.

---

## 6. Step 5 — Register the Graph worker (`Yvy.Graph.Worker`)

> **Marked separate:** this registration is for the **Kanban email-ingestion** feature
> (`financial-process-kanban/email-ingestion-spec.md` §7), *not* user sign-in. It's included here so
> all of Phase 0 lives in one place. It does **not** block the SSO work.

**Goal:** an app-only daemon that can read the finance mailbox.

1. **Entra ID → App registrations → New registration**; **Name:** `Yvy.Graph.Worker`;
   **Single tenant**; **no redirect URI**. **Register.** Record its **client id**.
2. **Manage → API permissions → Add a permission → Microsoft Graph → Application permissions**.
3. Search **`Mail.Read`**, select it, **Add permissions**. *(Least privilege — read only, no send.)*
4. **Grant admin consent for &lt;Yvy tenant&gt;** → **Yes**. Confirm *Granted*.
5. **Manage → Certificates & secrets → Client secrets → New client secret**. Give it a name and a
   **short expiry** (e.g. 6 months); copy the **Value immediately** (shown once) → store as a secret.
   **Set a calendar reminder to rotate before expiry.**

> *Why app-only:* there's no user in a background mailbox poll, so it authenticates *as itself*
> (client-credentials) with the **application** permission `Mail.Read`. Subscription/webhook and
> mailbox specifics (`MailboxAddress`, `ClientState`, `NotificationUrl`, renewal) belong to the
> ingestion spec, not here.

---

## 7. Step 6 — Collect the values (the sheet you hand to the build)

Fill this in as you go. **Secrets never get committed** — backend via `dotnet user-secrets`,
frontend via a local `.env`; `appsettings.json` keeps placeholders only (`index.md` §6).

| Value | From | Backend (`dotnet user-secrets set`) | Frontend (`.env`) |
|---|---|---|---|
| Tenant ID | any Overview page | `EntraId:TenantId` | `VITE_ENTRA_TENANT_ID` |
| API client ID | `Yvy.Intranet.Api` Overview | `EntraId:ClientId` | — |
| API audience / App ID URI | `Yvy.Intranet.Api` → Expose an API | `EntraId:Audience` (`api://<api-client-id>`) | — |
| API scope (full) | `…/access_as_user` | — | `VITE_ENTRA_API_SCOPE` |
| SPA client ID | `Yvy.Intranet.SPA` Overview | — | `VITE_ENTRA_CLIENT_ID` |
| Graph worker client ID | `Yvy.Graph.Worker` Overview | `Graph:ClientId` *(ingestion)* | — |
| Graph worker secret | `Yvy.Graph.Worker` → Certificates & secrets | `Graph:ClientSecret` *(ingestion)* | — |

Backend example (run from `backend/Yvy.Api`, after `dotnet user-secrets init`):

```bash
dotnet user-secrets set "EntraId:TenantId" "<tenant-id>"
dotnet user-secrets set "EntraId:ClientId" "<api-client-id>"
dotnet user-secrets set "EntraId:Audience" "api://<api-client-id>"
```

Frontend `.env` (mirrors `frontend-spec.md` §7):

```
VITE_ENTRA_TENANT_ID=<tenant-id>
VITE_ENTRA_CLIENT_ID=<spa-client-id>
VITE_ENTRA_API_SCOPE=api://<api-client-id>/access_as_user
```

---

## 8. Step 7 — Verify the registrations in isolation

The backend/frontend don't exist yet, so verify Phase 0 on its own by inspecting a real token:

1. In the SPA registration, temporarily add `https://jwt.ms` as a SPA redirect URI.
2. Build a browser sign-in URL (authorization-code/PKCE) against the SPA client requesting the API
   scope — or sign in via the eventual SPA once `frontend-spec.md` §1 is wired. Paste the resulting
   **access token** into [https://jwt.ms](https://jwt.ms).
3. Confirm the decoded token contains:
   - **`aud`** = the API (`api://<api-client-id>` or the API client id),
   - **`scp`** includes `access_as_user`,
   - **`roles`** lists the role you assigned the test user (e.g. `Approver`).
4. Remove the temporary `https://jwt.ms` redirect URI.

> If `roles` is **missing**: check the user is assigned a role on the **Enterprise Application**
> (§5), and that *Assignment required* didn't block an unassigned user. If `aud`/version looks wrong,
> see the token-version note in §2.

**Full end-to-end** verification (login → Bearer call → 200/403) happens after backend Phase 4 and
frontend Phase 5 are built (`backend-spec.md` §5, `frontend-spec.md` §8).

---

## Appendix A — Scripted setup (Azure CLI / Microsoft Graph PowerShell)

For reproducibility across environments (dev/staging/prod), the same setup can be scripted. Treat the
below as a **starting point and verify each command against current `az ad` / Microsoft Graph
PowerShell docs** — CLI surface for *scopes* and *app roles* is fiddly and often requires manifest
JSON or `az rest`/Graph calls.

```bash
# API registration + Application ID URI
az ad app create --display-name "Yvy.Intranet.Api" --sign-in-audience AzureADMyOrg
az ad app update --id <api-app-id> --identifier-uris "api://<api-client-id>"

# SPA registration with a SPA redirect URI
az ad app create --display-name "Yvy.Intranet.SPA" --sign-in-audience AzureADMyOrg \
  --spa-redirect-uris "http://localhost:5173"

# Graph worker + Mail.Read application permission (00000003-...=Microsoft Graph)
az ad app create --display-name "Yvy.Graph.Worker" --sign-in-audience AzureADMyOrg
az ad app permission add --id <worker-app-id> \
  --api 00000003-0000-0000-c000-000000000000 \
  --api-permissions 810c84a8-4a9e-49e6-bf7d-12d183f40d01=Role   # Mail.Read (verify GUID)
az ad app permission admin-consent --id <worker-app-id>
az ad app credential reset --id <worker-app-id> --years 1       # creates a client secret
```

The **App Roles** (`Approver`/`Operator`/`Viewer`/`Admin`) and the **`access_as_user` scope** are
most reliably created in the portal, or via `az ad app update --app-roles @roles.json` and an
`az rest` PATCH of `api.oauth2PermissionScopes`. **User-to-role assignment** is via the
`appRoleAssignedTo` Graph endpoint. Confirm exact shapes before scripting.

---

## Appendix B — Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `AADSTS50011: redirect URI … does not match` | SPA redirect URI not registered / wrong type | Add the exact origin under **Authentication → Single-page application** (§4). |
| `AADSTS65001: user/admin has not consented` | Admin consent not granted for the API scope | **Grant admin consent** on the SPA's API permissions (§4.8). |
| `AADSTS650056` (app not found / misconfigured) | Wrong client id, or app in another tenant | Verify `VITE_ENTRA_CLIENT_ID` = SPA client id, correct tenant. |
| API returns **401** | Missing/invalid token, wrong `aud` | Check `VITE_ENTRA_API_SCOPE` targets the API; see token-version note (§2). |
| API returns **403** | Token has no/incorrect `roles` claim | Assign the user a role on the **Enterprise Application** (§5); confirm *Assignment required*. |
| `roles` claim absent in jwt.ms | Role assigned to a group containing a *service principal*, or no assignment | Assign user/group directly; note Entra doesn't emit `roles` for SPs nested in groups. |

---

## References

Verified Microsoft Learn pages (confirm here if the portal differs):

- [Register an application](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
- [Expose a web API (scopes, Application ID URI)](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-expose-web-apis)
- [Add app roles and get them in a token](https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-app-roles-in-apps)
- [Configure a single-page app (MSAL)](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-app-configuration)
- [Protected web API: verify scopes and app roles](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-protected-web-api-verification-scope-app-roles)
- [Assign users and groups to an app](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal)
