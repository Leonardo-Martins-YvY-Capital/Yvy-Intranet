# OpenAPI Contract — `.openapi/`

`yvy-api.yaml` is the **design-first source of truth** for the API (SDD). Edit the contract **before**
writing code (`BACKEND.md` §8, Step 1).

> **It is hand-authored and consumed by no tool.** The runtime OpenAPI doc (Scalar at `/scalar/v1`) is
> generated *separately, from the code* by `AddOpenApi()` — it does **not** read this file. So this file
> exists purely as a human/agent design + review reference, and we are free to organize it however
> best serves reading. (Trade-off: it can drift from the code — see [Drift watch](#drift-watch).)

---

## Map — where each domain lives

Locate a domain by its **tag banner** (stable) — `grep` for `──── <Tag> ────` or `tags: [<Tag>]`.
Line ranges are an approximate convenience and will drift; trust the banner.

| Domain | Tag | Backend aggregate | Public endpoints | Banner in `yvy-api.yaml` |
|---|---|---|---|---|
| Funds | `Funds` | `Yvy.Domain.Aggregates.Funds.Fund` | `GET/POST /api/v1/funds`, `GET /api/v1/funds/{id}` | `──── Funds ────` |
| Auth / Users | — | `Yvy.Domain.Aggregates.Users.ApplicationUser` *(domain in progress)* | none yet — enforced via the `entraId` security scheme (global `security:`) + role policies; identity is JIT-provisioned on first authenticated request | `──── Security ────` |

> Add a row here whenever you add a tag. This table is the agent's index — keep it current.

---

## Conventions

- **One tag per domain.** File order: operations grouped by tag (each under a banner), then
  `components.schemas` grouped by tag, then **shared** `components.schemas` / `responses` /
  `securitySchemes` last.
- **Section banners:** `# ──────── <Tag> ────────` so each domain is greppable.
- **Shared pieces are factored and `$ref`-ed:** `ProblemDetails`, the 4xx/5xx responses, and (coming)
  the `entraId` security scheme — never inline-duplicated per operation.
- **Examples** live inline on the operation (see `CreateFund`).

## Retrieval (for agents)

You do **not** need a separate file to load one domain. To pull just the auth slice, `grep` its banner
or read the line range from the [map](#map--where-each-domain-lives). Ranged reads + grep replace a
physical split until the file is large enough that *humans* feel the pain.

## Growth & split policy

Single file **on purpose**. Physically split into `paths/<tag>.yaml` + `components/{schemas,responses,
securitySchemes}` only when **~3 active domains exist or this file starts causing merge conflicts**.
The split is safe at any time (nothing consumes the file), and should be paired with a **Spectral /
Redocly lint** so structure *and* drift get enforced together.

## Drift watch

The same Funds endpoints are described in **three** places: this contract, `BACKEND.md` §7 (prose), and
the runtime Scalar doc (generated from code). This file is the **design-time** source of truth; the
others are derived. When the split lands, add a lint/diff check so they can't silently diverge.
