# Entra ID SSO — Frontend Spec

> MSAL integration, route protection, token acquisition, and role-gated UI for the React SPA.
> Companion to [`index.md`](./index.md) and [`backend-spec.md`](./backend-spec.md). Decisions in
> [ADR-001](../decisions/ADR-001-entra-id-sso-authentication.md).

| | |
|---|---|
| **Status** | ✅ Implemented — MSAL; lint/build green, interactive sign-in verified. As-built notes in [`index.md`](./index.md) §8. |
| **Stack** | React 19, TanStack Router/Query, Zustand, Tailwind 4 |
| **Templates mirrored** | `src/lib/api.ts`, `src/store/auth.store.ts`, `src/router.ts`, `src/layouts/Sidebar.tsx` |
| **New packages** | `@azure/msal-browser`, `@azure/msal-react` |
| **Skills** | TanStack Router `auth-and-guards`, `react-zustand`, `frontend-ui-engineering`, `bm-design-system` |

> ⚠️ MSAL React provider setup, `acquireTokenSilent` vs redirect fallback, and cache config **must
> be confirmed against official `@azure/msal-react` docs at build time** (`source-driven-development`).

---

## 1. MSAL setup

- `src/lib/auth/msalConfig.ts` — `Configuration` built from env:
  - `auth.clientId` = `import.meta.env.VITE_ENTRA_CLIENT_ID` (the SPA registration).
  - `auth.authority` = `https://login.microsoftonline.com/${VITE_ENTRA_TENANT_ID}`.
  - `auth.redirectUri` = app origin.
  - `cache` — start with `sessionStorage` (revisit per ADR-001 XSS note).
  - Request scopes: `[VITE_ENTRA_API_SCOPE]` (the API's `access_as_user`).
- `src/lib/auth/msalInstance.ts` — single `PublicClientApplication` instance.
- `src/main.tsx` — wrap the app in `<MsalProvider instance={msalInstance}>` (outside or around the
  existing providers, per the MSAL React docs).

---

## 2. Auth store — reduce to derived identity

`src/store/auth.store.ts` today holds `userId | token | role` and persists the token to
sessionStorage. Under MSAL, **MSAL owns the token cache** — duplicating it invites staleness. Change:

- Drop manual `token` persistence. The store becomes **derived identity** only:
  `{ userId, displayName, email, roles: Role[] }`, hydrated from MSAL account claims after login.
- Keep `roles` so the UI can gate actions without an API round-trip.
- Replace the `role: 'admin' | 'viewer'` enum with `roles: Role[]` over
  `('Approver' | 'Operator' | 'Viewer' | 'Admin')` to match the backend.

---

## 3. API client — token becomes async (key change)

`src/lib/api.ts` currently reads `useAuthStore.getState().token` synchronously to set the
`Authorization` header. MSAL issues tokens **asynchronously** (silent refresh). Change the wrapper to
acquire a fresh token before each request:

```
const account = msalInstance.getActiveAccount();
const result = await msalInstance.acquireTokenSilent({ account, scopes: [API_SCOPE] })
  .catch(() => msalInstance.acquireTokenRedirect({ scopes: [API_SCOPE] })); // fallback
headers.Authorization = `Bearer ${result.accessToken}`;
```

Keep the existing `ApiError` typing and `api.get/post/put/delete` surface unchanged — only the header
acquisition becomes async. On `401` from the API, trigger re-authentication.

---

## 4. Routing & guards

Per the TanStack Router `auth-and-guards` skill:

- Add a `beforeLoad` guard to protected routes in `src/router.ts` that checks MSAL for an
  authenticated account; if absent, `redirect` to `/login` (preserving the intended destination).
- Add a `/login` route rendering the new `LoginPage`.
- Never interpolate params into `to` strings — use params objects (skill rule).

---

## 5. Login page & user menu

- `LoginPage` — a single "Sign in with Microsoft" action calling `loginRedirect`, styled with the
  **`bm-design-system`** tokens (`--color-yvy-navy`, etc.) and `frontend-ui-engineering` conventions.
  Handles the redirect-return state.
- `src/layouts/Sidebar.tsx` — add a **user menu** (display name + email) with a **logout** action
  (`logoutRedirect`). Today the sidebar has no profile/logout affordance.

---

## 6. Role-gated UI

UI gating is **UX, not security** (the API enforces authorization — see backend-spec §4.4). Gate:

- **Approve / Reject** buttons (Kanban) → visible only to `Approver`.
- **Advance card** / operator actions → `Operator` (and above).
- **Admin** navigation/sections → `Admin`.
- Everything read-only for `Viewer`.

A small `useHasRole(role)` hook reading `roles` from the auth store keeps this declarative.

---

## 7. Environment

`frontend/.env.example` (new) documents:

```
VITE_API_URL=http://localhost:5173/api      # already consumed by api.ts
VITE_ENTRA_CLIENT_ID=<spa-app-registration-client-id>
VITE_ENTRA_TENANT_ID=<entra-tenant-id>
VITE_ENTRA_API_SCOPE=api://<api-app-id>/access_as_user
```

Accessed via `import.meta.env.*` (Vite). Real values are per-developer / per-environment, never
committed.

---

## 8. Verification

- `npm run lint && npm run build` (from `frontend/`).
- Manual: `npm run dev` + backend running → "Sign in with Microsoft" → redirected back
  authenticated → API calls carry a `Bearer` token (check the Network tab — and confirm **no PII in
  console/logs**, optionally via the `browser-testing-with-devtools` skill).
- A `Viewer` account sees no Approve/Reject buttons and gets **403** if it somehow calls an
  `Approver`-only endpoint.
- Visiting a protected route while signed out redirects to `/login`.
