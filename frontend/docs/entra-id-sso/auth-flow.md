# Auth Flow — Runtime Walkthrough (SPA ↔ API ↔ Entra)

> How the pieces actually talk **at runtime**, once the registrations from
> [`phase-0-entra-setup.md`](./phase-0-entra-setup.md) exist. This is the teaching companion to the
> design specs: [`backend-spec.md`](./backend-spec.md) (backend design), [`frontend-spec.md`](./frontend-spec.md)
> (frontend design), and [ADR-001](../decisions/ADR-001-entra-id-sso-authentication.md) (decisions).
> Phase-0 is *static setup*; this doc is the *moving parts*.

| | |
|---|---|
| **Status** | Reference / explainer |
| **Date** | 2026-06-05 |
| **Author** | leonardo.martins@yvy.capital |
| **Scope** | The delegated (user) SSO path: SPA ↔ `Yvy.Intranet.Api` ↔ Entra. The app-only Graph worker path is out of scope here — see [`../financial-process-kanban/email-ingestion-spec.md`](../financial-process-kanban/email-ingestion-spec.md). |

---

## 0. The one idea: two auth modes, only one of which is here

Almost every point below makes sense once you separate the two auth modes in this system:

| | **Delegated** (on-behalf-of-a-user) | **Application / app-only** (as itself) |
|---|---|---|
| Who is acting | A signed-in human | The app itself, no human |
| Used by | `Yvy.Intranet.SPA` → `Yvy.Intranet.Api` (**this doc**) | `Yvy.Graph.Worker` reading the mailbox |
| Proves identity with | User login + **PKCE** (no secret) | A **client secret** (client-credentials) |
| Entra permission type | Delegated (`access_as_user`) | Application (`Mail.Read`) |

This document covers the **delegated** path only. The two paths share the same Entra tenant but never
share tokens or secrets ([ADR-001](../decisions/ADR-001-entra-id-sso-authentication.md), registration
topology).

---

## 1. SPA ↔ API communication

> Reading order note: chronologically, [§2 (obtaining the tokens)](#2-obtaining-the-id_token-and-access_token)
> happens **first** — a user must log in before any API call. This section assumes the SPA already
> holds a valid access token and focuses on how it *uses* it and how the API *trusts* it.

### 1.1 The pattern: stateless bearer token

The SPA attaches the access token to every API call; the API validates it **per request** and keeps
**no session**. The only state the API persists is a local audit row (§1.5).

```
Browser (React SPA, MSAL token cache)                 Yvy.Intranet.Api (.NET 9, stateless)
  │  fetch /api/v1/...                                  │
  │  Authorization: Bearer <access_token> ─────────────►│  JwtBearer middleware:
  │                                                     │    1. verify signature (Entra public key)
  │                                                     │    2. validate iss / aud / exp
  │                                                     │    3. validate scp = access_as_user
  │                                                     │    4. claims → HttpContext.User
  │                                                     │    5. authorize by `roles` policy
  │  ◄──────────── 200 JSON  /  401  /  403 ────────────│
```

### 1.2 id_token vs access_token — send the right one

MSAL holds **two** tokens after login. They are not interchangeable:

| Token | Audience (`aud`) | Purpose | Sent to the API? |
|---|---|---|---|
| **`id_token`** | the **SPA** | Tells the SPA *who the user is* (display name, etc.) | **No** |
| **`access_token`** | the **API** (`api://<api-client-id>`) | Authorizes calls to `Yvy.Intranet.Api`; carries `scp` + `roles` | **Yes** |

> *Why this matters:* the backend's role policies read the **`roles`** claim, which is present in the
> **access token** — and only because the App Roles are defined on the **API** registration
> ([`phase-0-entra-setup.md`](./phase-0-entra-setup.md) §1, §3). Send the id_token by mistake and the
> API sees the wrong audience and no usable roles.

### 1.3 How the API validates the JWT — *offline, no call to Entra per request*

A JWT is a **self-contained, signed** token. The API does **not** phone Entra on each request, and there
is **no Entra session on the backend**. Validation is mostly offline:

1. Entra signs every token with its **private** key.
2. Entra publishes the matching **public** keys at a well-known JWKS URL, discovered via the OpenID
   configuration document:
   `https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration`.
3. `Microsoft.Identity.Web` (wrapping the `JwtBearer` middleware) **fetches and caches** those public
   keys at startup and refreshes them periodically.
4. On **each** request the middleware:
   1. reads the Bearer token,
   2. **verifies the signature** against the cached public key → proves Entra issued it, untampered,
   3. validates **`iss`** (= your tenant), **`aud`** (= your API), **`exp`**/not-before,
   4. validates **`scp`** contains `access_as_user`,
   5. materializes the claims (`oid`, `upn`/`preferred_username`, `email`, `roles`) into
      `HttpContext.User` (a `ClaimsPrincipal`).

### 1.4 "How is the SPA's token ingested into the API's Entra service?" — it isn't

There is no Entra component on the backend that the token gets fed into. **The token *is* the message.**
The only things the API needs from Entra are:

- the **public signing keys** (fetched once, cached — §1.3), and
- **config** declaring which tenant + audience to trust — the `EntraId` section in `appsettings.json`
  + user-secrets ([`backend-spec.md`](./backend-spec.md) §4.1, §7).

The SPA and API are **not** joined by a session — they are joined by **shared trust in the same Entra
tenant**: the SPA obtains a token whose `aud` is the API, and the API trusts tokens with that `aud`
from that tenant. No shared secret is involved in this validation (asymmetric signing).

### 1.5 JIT provisioning — the only backend state

On the first valid token from a user not yet in `application_users`, the backend creates a local record
(Entra `oid`, UPN, email, roles, `last_login`) and records the login — the audit trail required for
CVM 175. This is idempotent: re-authentication never creates a second row; it updates `LastLoginAt` and
re-syncs roles from the token. Full design in [`backend-spec.md`](./backend-spec.md) §4.3 / §6.

### 1.6 Authorization outcomes

- **401 Unauthorized** — no token, or signature/issuer/audience/expiry invalid.
- **403 Forbidden** — token is valid but the `roles` claim doesn't satisfy the endpoint's policy
  (e.g. a `Viewer` hitting an `Approver`-only route).
- The existing `Yvy.Api/Extensions/ErrorOrExtensions.cs` already maps `Unauthorized → 401` and
  `Forbidden → 403`.

> **Authorize at the API, not just the UI.** Frontend route guards and role-gated buttons are UX, not
> a security boundary ([`index.md`](./index.md) §6).

---

## 2. Obtaining the id_token and access_token

This is the **Authorization Code flow with PKCE** — *one* flow. "Authorization code" and "PKCE" are
**not** two halves of the code:

- **Authorization Code** = a single short-lived, single-use ticket that is redeemed for tokens.
- **PKCE** (Proof Key for Code Exchange, "pixy") = a security add-on that lets a **public client**
  (no secret) run this flow safely.

### 2.1 Step 0 — Loading the SPA: what the client receives

The browser downloads the **static SPA bundle**: `index.html`, the JavaScript (**MSAL.js is bundled
inside the app**, not stored separately), and CSS. **No secrets ship.** Baked in from `VITE_ENTRA_*`
build-time vars ([`frontend-spec.md`](./frontend-spec.md) §7) is **public configuration**:

| Config | Role |
|---|---|
| `VITE_ENTRA_TENANT_ID` | builds the authority URL `https://login.microsoftonline.com/{tenant-id}` |
| `VITE_ENTRA_CLIENT_ID` | the SPA's own registration id |
| `VITE_ENTRA_API_SCOPE` | `api://<api-client-id>/access_as_user` |

These are **identifiers, not credentials** — safe to expose in client JS. (This is *why* the SPA is a
public client and uses PKCE instead of a secret.) At runtime MSAL also maintains a **token cache**
(`sessionStorage` / `localStorage` — [`index.md`](./index.md) §9 open question) and, transiently, the
PKCE secret below.

### 2.2 Step 1 — MSAL prepares PKCE (in the browser, before contacting Entra)

1. MSAL generates a **`code_verifier`** — a high-entropy random string, kept in the browser. **Not sent
   yet.**
2. MSAL computes the **`code_challenge`** = `BASE64URL( SHA256(code_verifier) )` — a one-way hash.

Analogy: the verifier is a password the client invents on the spot; the challenge is its hash. The hash
can travel in the open; only the holder of the original can prove ownership later.

### 2.3 Step 2 — Redirect to Entra (`/authorize`)

```
https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize
   ?client_id={spa-client-id}
   &response_type=code               ← "I want an authorization code"
   &redirect_uri=http://localhost:5173
   &scope=api://<api-client-id>/access_as_user openid profile
   &code_challenge={code_challenge}  ← the HASH, sent in the open
   &code_challenge_method=S256
   &state=...&nonce=...              ← anti-CSRF / anti-replay
```

**The SPA never sees the password.** The browser lands on **Entra's own hosted login page**; the user
types email + password (and MFA) **directly into Microsoft's page**, over Microsoft's TLS. Only
identifiers (tenant id, client id, the challenge hash) come from the SPA — never the credentials.

### 2.4 Step 3 — Entra authenticates the user, returns an **authorization code**

```
http://localhost:5173/?code={authorization_code}&state=...
```

The **authorization code** is a short-lived (~minutes), single-use, opaque string meaning *"this user
authenticated and consented; whoever can prove they started this exact flow may redeem this for
tokens."* It is **not** a token — you cannot call the API with it and it carries no readable claims.
Entra stores the `code_challenge` (from §2.3) alongside the issued code.

> *Why a code instead of tokens directly?* The code returns via the URL — a leaky channel (browser
> history, referrer, logs). Tokens never travel that channel; they come back only in the controlled
> POST of §2.5, and PKCE protects even the code.

### 2.5 Step 4 — Redeem the code at `/token` (the PKCE proof)

A direct **background POST** (not a redirect):

```
POST https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token
   grant_type=authorization_code
   code={authorization_code}
   client_id={spa-client-id}
   redirect_uri=http://localhost:5173
   code_verifier={code_verifier}     ← the original secret, revealed now
```

Entra computes `SHA256(code_verifier)` and compares it to the stored `code_challenge`. **Match →
issue tokens. Mismatch → reject.**

> **Why this defeats code theft:** an attacker who intercepts the authorization code from the §2.4
> redirect still can't redeem it — they'd need the `code_verifier`, which never left the legitimate
> browser. That is what PKCE buys a public client with no client secret to fall back on.

### 2.6 Step 5 — Tokens returned

Entra returns the **`id_token`** (who the user is — for the SPA), the **`access_token`** (for the API;
`aud` = the API, carries `scp` + `roles`), and a **refresh token** (MSAL uses it for silent renewal so
the user isn't re-prompted). MSAL caches all three and, from here, attaches
`Authorization: Bearer <access_token>` to API calls — back to [§1](#1-spa--api-communication).

### 2.7 The whole sequence at a glance

```
Browser                         Static host       Entra (login.microsoftonline.com/{tenant})
  │── GET / ──────────────────────►│
  │◄── SPA bundle (MSAL + config) ─│
  │  [generate code_verifier; code_challenge = SHA256(verifier)]
  │── redirect /authorize?client_id&code_challenge&scope ─────────────────►│
  │                                                  [user types email+password HERE, at Entra]
  │◄──────────────── redirect back ?code=AUTH_CODE ───────────────────────│
  │── POST /token  code=AUTH_CODE + code_verifier ────────────────────────►│
  │                                                  [SHA256(verifier) == stored challenge?]
  │◄──────────── id_token + access_token + refresh_token ─────────────────│
  │
  │── fetch /api/v1/...  Authorization: Bearer <access_token> ──► Yvy.Intranet.Api  (§1)
```

### 2.8 Two mental anchors

- **Authorization code** = a single-use ticket; not a token, can't be read, can't call the API.
- **PKCE** = "hash a secret, send the hash up front, reveal the secret only when redeeming the ticket"
  — so a stolen ticket is worthless.

---

## See also

- [`phase-0-entra-setup.md`](./phase-0-entra-setup.md) — the static setup (registrations, scope, roles)
  these flows depend on, incl. the "Public client + PKCE" and "two claims that matter" primers.
- [`backend-spec.md`](./backend-spec.md) §4 — middleware wiring, `ICurrentUserProvider`, JIT provisioning.
- [`frontend-spec.md`](./frontend-spec.md) §1, §7 — MSAL configuration and the `VITE_ENTRA_*` env vars.
- [ADR-001](../decisions/ADR-001-entra-id-sso-authentication.md) — why SPA bearer over a BFF, and the
  two-registration topology.