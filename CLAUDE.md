# Project: Yvy Capital Digital Systems

Shared agent instructions are in `AGENTS.md`. Use `.agents/skills/INDEX.md` as the canonical skills index, then read the matching `.agents/skills/<skill-name>/SKILL.md` before acting.

## Structure

- `frontend/` — React 19 + TypeScript + Vite + Tailwind CSS 4
- `backend/` — .NET 9 solution (`Yvy.sln`)
  - `src/Yvy.Domain/` — DDD aggregates, value objects, domain events, repository interfaces (no external deps)
  - `src/Yvy.Application/` — CQRS (MediatR), use-case handlers, FluentValidation, ErrorOr
  - `src/Yvy.Infrastructure/` — EF Core + Npgsql, repository implementations, Outbox (Quartz.NET)
  - `Yvy.Api/` — ASP.NET Core 9 minimal API, endpoints, Serilog, Scalar UI
  - `tests/Yvy.Domain.Tests/` — pure unit tests (value objects, aggregates)
  - `tests/Yvy.Application.Tests/` — handler unit tests (NSubstitute mocks)
  - `tests/Yvy.Api.IntegrationTests/` — Testcontainers PostgreSQL + WebApplicationFactory
  - `.openapi/yvy-api.yaml` — SDD contract (OpenAPI 3.1, source of truth)

Key defaults:

- This is a Yvy Capital Asset Management systems repository. Treat finance, investor, fund, regulatory, compliance, auth, and data-handling work as high-sensitivity.
- Frontend code lives in `frontend/` and uses React 19, TypeScript 6, Vite 8, Tailwind CSS 4, and npm.
- Run commands from `frontend/`: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.
- For UI work, use `frontend-ui-engineering` and `bm-design-system`.
- For React performance, data fetching, bundle optimization, and re-render issues, use `react-best-practices`.
- For code changes, follow `git-workflow-and-versioning`.
- For behavior changes and bug fixes, use `test-driven-development` and verify with lint/build where applicable.
- Do not invent legal, regulatory, investment, or compliance claims.
- Backend uses **ErrorOr<T>** result pattern everywhere — no exceptions for control flow.
- All financial math uses `decimal`, never `float`/`double`.
- CPF/CNPJ digits must never appear in structured logs (CVM 175 / PII compliance).
- Domain events are persisted via Outbox pattern (same DB transaction), dispatched by Quartz.NET job.

## Backend commands

```bash
# Run API
dotnet run --project backend/Yvy.Api

# Run all unit tests
dotnet test backend/tests/Yvy.Domain.Tests
dotnet test backend/tests/Yvy.Application.Tests

# Run integration tests (requires Docker)
dotnet test backend/tests/Yvy.Api.IntegrationTests

# Add EF Core migration
dotnet ef migrations add <Name> --project backend/src/Yvy.Infrastructure --startup-project backend/Yvy.Api

# Apply migrations
dotnet ef database update --project backend/src/Yvy.Infrastructure --startup-project backend/Yvy.Api
```

## Key namespaces

- `Yvy.Domain.Primitives` — Entity, AggregateRoot, ValueObject, IDomainEvent
- `Yvy.Domain.Aggregates.Funds.Fund` — Fund aggregate (FundCode, FundStatus, FundType)
- `Yvy.Domain.Aggregates.Investors.Investor` — Cotista (CPF/CNPJ, Email, InvestorStatus)
- `Yvy.Domain.ValueObjects.*` — Money (BRL), Cpf, Cnpj, FundCode, Email, Percentage
- `Yvy.Application.Abstractions.*` — ICommand, IQuery, ICommandHandler, IQueryHandler, IUnitOfWork
- `Yvy.Application.Funds.Commands.CreateFund` — example use case (command + validator + handler)
