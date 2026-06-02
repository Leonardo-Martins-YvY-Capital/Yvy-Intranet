# Yvy Capital API — Backend Architecture Guide

This document explains how the backend is structured, how a request travels through all layers, and how to extend it with new features.

---

## 1. Architecture Overview

The backend is organized into four layers. **Dependencies only point inward** — outer layers know about inner ones, never the reverse. This is enforced at compile time: `Yvy.Domain` literally cannot import EF Core because it is not referenced in its `.csproj`.

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Yvy.Api                                                            │
│  Receives HTTP, dispatches via MediatR, maps errors → ProblemDetails│
│  Files: Yvy.Api/Endpoints/, Yvy.Api/Middleware/, Program.cs         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ sends Commands/Queries
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Yvy.Application                                                    │
│  Use cases: validates input, orchestrates domain, calls repos       │
│  Files: src/Yvy.Application/Funds/Commands|Queries/, Behaviors/     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ calls aggregates and repository interfaces
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Yvy.Domain                                                         │
│  Business rules, aggregates, value objects — zero framework deps    │
│  Files: src/Yvy.Domain/Aggregates/, ValueObjects/, Repositories/    │
└─────────────────────────────────────────────────────────────────────┘
                           ▲
                           │ implements interfaces
┌─────────────────────────────────────────────────────────────────────┐
│  Yvy.Infrastructure                                                 │
│  EF Core, PostgreSQL, Outbox — implements Domain's interfaces       │
│  Files: src/Yvy.Infrastructure/Persistence/, Outbox/               │
└─────────────────────────────────────────────────────────────────────┘
```

### What each layer owns and what it is forbidden to do

| Layer | Owns | Forbidden |
|---|---|---|
| **Domain** | Business rules, aggregates, value objects, domain events, repository *interfaces* | Importing EF Core, MediatR, HTTP, or any framework |
| **Application** | Use cases (commands + queries), validators, DTO mappings, pipeline behaviors | Accessing DbContext directly, knowing about HTTP, importing EF Core |
| **Infrastructure** | DbContext, EF configurations, repository *implementations*, Outbox job | Containing business logic, importing HTTP packages |
| **Api** | HTTP endpoints, request/response models, middleware, DI wiring | Business logic, direct DB access |

---

## 2. Complete Request Trace: `POST /api/v1/funds`

This section traces every piece of code that runs when you create a fund. Follow along in the actual source files.

### Step 1 — HTTP arrives at `FundEndpoints.cs`

**File:** `Yvy.Api/Endpoints/Funds/FundEndpoints.cs`

```csharp
private static async Task<IResult> CreateFund(
    CreateFundRequest request,    // ASP.NET Core deserializes JSON body here
    ISender sender,
    CancellationToken ct)
{
    var command = new CreateFundCommand(
        request.Code,
        request.Name,
        request.FundType,
        request.MinimumInvestmentAmount,
        request.MinimumInvestmentCurrency);

    var result = await sender.Send(command, ct);   // hands off to MediatR

    return result.Match(
        id => Results.CreatedAtRoute("GetFundById", new { id }, id),
        errors => errors.ToProblemResult());        // maps errors → HTTP
}
```

The endpoint only converts HTTP ↔ application layer. No business logic lives here.

---

### Step 2 — MediatR Pipeline (3 behaviors fire in order)

**Files:** `src/Yvy.Application/Behaviors/`

`sender.Send(command)` does not call the handler directly. It runs through a pipeline:

```
CreateFundCommand
       │
       ▼
┌─────────────────────────────────────┐
│  1. LoggingBehavior                 │  Logs "Executing CreateFundCommand"
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│  2. ValidationBehavior              │  Runs CreateFundCommandValidator
│                                     │  ❌ Stops here if validation fails
└─────────────────┬───────────────────┘
                  ▼
┌─────────────────────────────────────┐
│  3. TransactionBehavior             │  Detects IBaseCommand → calls SaveChanges after handler
└─────────────────┬───────────────────┘
                  ▼
         CreateFundCommandHandler
```

**`ValidationBehavior`** collects all `IValidator<CreateFundCommand>` registered in DI, runs them in parallel, and if any fail returns a list of `Error.Validation` objects immediately — the handler is never reached.

**`TransactionBehavior`** checks `if (request is not IBaseCommand) return await next()`. Since `CreateFundCommand` implements `ICommand<Guid>` which implements `IBaseCommand`, it is wrapped. After the handler returns, `IUnitOfWork.SaveChangesAsync()` is called.

---

### Step 3 — `CreateFundCommandHandler.Handle()`

**File:** `src/Yvy.Application/Funds/Commands/CreateFund/CreateFundCommandHandler.cs`

```csharp
public async Task<ErrorOr<Guid>> Handle(CreateFundCommand request, CancellationToken ct)
{
    // 3.1 — Validate and construct FundCode value object
    var codeResult = FundCode.Create(request.Code);
    if (codeResult.IsError) return codeResult.Errors;   // ← short-circuit

    // 3.2 — Validate and construct Money value object
    var moneyResult = Money.Create(request.MinimumInvestmentAmount, request.MinimumInvestmentCurrency);
    if (moneyResult.IsError) return moneyResult.Errors; // ← short-circuit

    // 3.3 — Parse the FundType enum
    if (!Enum.TryParse<FundType>(request.FundType, ignoreCase: true, out var fundType))
        return FundErrors.InvalidFundType;              // ← short-circuit

    // 3.4 — Create the Fund aggregate (business rules enforced inside)
    var fundResult = Fund.Create(codeResult.Value, request.Name, fundType, moneyResult.Value);
    if (fundResult.IsError) return fundResult.Errors;   // ← short-circuit (e.g., empty name)

    var fund = fundResult.Value;                        // fund is in Draft status, event raised

    // 3.5 — Check uniqueness
    if (await _fundRepository.ExistsByCodeAsync(fund.Code, ct))
        return FundErrors.CodeAlreadyExists;            // ← 409 Conflict

    // 3.6 — Persist (EF Core tracks the entity; not written to DB yet)
    await _fundRepository.AddAsync(fund, ct);

    // 3.7 — SaveChanges called by TransactionBehavior after this returns
    await _unitOfWork.SaveChangesAsync(ct);

    return fund.Id;  // ← success path
}
```

Each `if (result.IsError) return` is an early exit. The happy path falls straight to the bottom.

---

### Step 4 — `YvyDbContext.SaveChangesAsync()`

**File:** `src/Yvy.Infrastructure/Persistence/YvyDbContext.cs`

Before the data is written to PostgreSQL, `SaveChangesAsync` intercepts and converts domain events:

```csharp
public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
{
    ConvertDomainEventsToOutboxMessages();   // ← runs first
    return await base.SaveChangesAsync(ct); // ← then writes to DB
}
```

`ConvertDomainEventsToOutboxMessages()`:
1. Walks the EF change tracker, finds all `AggregateRoot` entities
2. Collects their `DomainEvents` (e.g., `FundCreatedDomainEvent`)
3. Clears the events from the aggregate (so they don't fire twice)
4. Serializes each event to an `OutboxMessage` row with JSON + full type name

**Result:** One database transaction writes both:
- A row in the `funds` table
- A row in the `outbox_messages` table

This atomicity is the core guarantee of the Outbox Pattern.

---

### Step 5 — Response returns to the client

Back in `FundEndpoints.cs`:

```csharp
return result.Match(
    id => Results.CreatedAtRoute("GetFundById", new { id }, id),
    errors => errors.ToProblemResult());
```

`result.Match` is like a type-safe switch: if the result holds a value → `201 Created`; if it holds errors → `ToProblemResult()` converts to RFC 9457 JSON.

The client receives:
```
HTTP/1.1 201 Created
Location: /api/v1/funds/3fa85f64-5717-4562-b3fc-2c963f66afa6
Content-Type: application/json

"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

---

### Step 6 — Outbox job fires (~10 seconds later)

**File:** `src/Yvy.Infrastructure/Outbox/ProcessOutboxMessagesJob.cs`

Quartz.NET runs this job every 10 seconds:

```csharp
// Fetches up to 20 unprocessed messages
var messages = await _context.OutboxMessages
    .Where(m => m.ProcessedOn == null)
    .OrderBy(m => m.OccurredOn)
    .Take(20)
    .ToListAsync(ct);

foreach (var message in messages)
{
    var domainEvent = JsonConvert.DeserializeObject<IDomainEvent>(message.Content, ...);
    await _publisher.Publish(domainEvent, ct);   // dispatches to any INotificationHandler
    message.ProcessedOn = DateTime.UtcNow;        // marks as done
}
```

Any `INotificationHandler<FundCreatedDomainEvent>` you register will receive the event here. This is where you would send emails, update read models, trigger external integrations, etc.

---

## 3. Error Path: What Happens When the Code Already Exists?

Same `POST /api/v1/funds` request, but `YVYQ11` already exists in the database.

Steps 1–3.4 run identically. At step 3.5:

```csharp
if (await _fundRepository.ExistsByCodeAsync(fund.Code, ct))
    return FundErrors.CodeAlreadyExists;   // Error.Conflict(...)
```

The handler returns an `ErrorOr` containing `FundErrors.CodeAlreadyExists`.

In `FundEndpoints`, `result.Match` takes the error branch → `errors.ToProblemResult()`:

```csharp
// ErrorOrExtensions.cs
var statusCode = first.Type switch
{
    ErrorType.Conflict => StatusCodes.Status409Conflict,  // ← matched here
    ...
};
```

Client receives:
```
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{
  "type": "https://yvy.capital/errors/fund-codealreadyexists",
  "title": "A fund with this code already exists.",
  "status": 409
}
```

---

## 4. What Happens When Validation Fails?

Request body with an invalid fund code:

```json
{ "code": "INVALID", "name": "Some Fund", "fundType": "FII", "minimumInvestmentAmount": 1000 }
```

In `ValidationBehavior`, `CreateFundCommandValidator` runs:

```csharp
RuleFor(x => x.Code)
    .NotEmpty()
    .Matches(@"^[A-Za-z]{4,6}\d{2}$")
    .WithMessage("Fund code must be 4-6 letters followed by 2 digits.");
```

`"INVALID"` fails the regex. `ValidationBehavior` returns `Error.Validation("Code", "Fund code must be 4-6 letters...")` immediately — **the handler never runs**.

Client receives:
```
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://yvy.capital/errors/code-fund-code-must-be-4-6...",
  "title": "Fund code must be 4-6 letters followed by 2 digits.",
  "status": 422
}
```

---

## 5. Key Patterns Explained

### 5.1 `ErrorOr<T>` — The Result Pattern

**Why:** Throwing exceptions for expected business failures (duplicate fund, invalid input, not found) is expensive and hard to reason about. `ErrorOr<T>` makes failure an explicit return value.

```csharp
// A function that can fail returns ErrorOr<T>
public static ErrorOr<FundCode> Create(string value)
{
    if (!Pattern.IsMatch(value))
        return Error.Validation("FundCode.InvalidFormat", "...");  // ← returns error

    return new FundCode { Value = value };  // ← returns value
}

// Caller checks which it got
var result = FundCode.Create("YVYQ11");

if (result.IsError)
    Console.WriteLine(result.FirstError.Description);
else
    Console.WriteLine(result.Value.Value);   // "YVYQ11"

// Or use Match for functional style:
return result.Match(
    code => doSomethingWith(code),
    errors => handleErrors(errors));
```

`ErrorOr<Guid>` is **either** a `Guid` **or** a list of `Error` objects — never both.

---

### 5.2 Value Objects — Why `FundCode` Instead of `string`

A plain `string` lets any garbage through. `FundCode` is only constructable if it passes validation:

```csharp
// You can't create an invalid FundCode — the type system prevents it
var bad = FundCode.Create("INVALID");  // IsError = true, no FundCode was created
var good = FundCode.Create("YVYQ11"); // IsError = false, good.Value.Value = "YVYQ11"

// Two FundCodes with the same value are equal — like primitives
var a = FundCode.Create("YVYQ11").Value;
var b = FundCode.Create("YVYQ11").Value;
Console.WriteLine(a == b);  // true
```

**In the database**, `FundCode` is stored as a single `code` column via EF Core owned type — no separate table.

```csharp
// FundConfiguration.cs
builder.OwnsOne(f => f.Code, code =>
{
    code.Property(c => c.Value).HasColumnName("code");  // flat column
});
```

Same applies to `Money` (`amount` + `currency` columns), `Cpf`, `Cnpj`, `Email`.

---

### 5.3 Aggregate Root + Domain Events

`Fund` enforces all business rules for the Fund entity. No property has a `public set`:

```csharp
// You cannot do this:
fund.Status = FundStatus.Active;  // ← compile error, Status has private set

// You must go through a method that enforces the rule:
var result = fund.Activate();
// Internally: if (Status != FundStatus.Draft) return FundErrors.NotInDraftStatus;
```

When state changes, the aggregate records what happened as a domain event:

```csharp
// Inside Fund.Activate():
RaiseDomainEvent(new FundStatusChangedDomainEvent(
    Guid.NewGuid(), DateTime.UtcNow, Id, oldStatus, FundStatus.Active));
```

The aggregate never publishes the event. It just accumulates it in a private list. `YvyDbContext.SaveChangesAsync()` picks it up and writes it to the `outbox_messages` table.

---

### 5.4 Outbox Pattern — Why Not Publish Events Directly?

Without outbox:
```
1. Fund created in DB          ✓
2. MediatR.Publish(event)      ← if this fails, event is lost forever
3. Email sent, read model updated...
```

With outbox:
```
1. Fund created in DB          ✓  ─┐ same transaction
2. OutboxMessage written to DB ✓  ─┘
3. [DB commit succeeds]
4. Job polls every 10s → publishes event → marks ProcessedOn
```

If the job fails on step 4, the `OutboxMessage` still has `ProcessedOn = null` — it will be retried on the next poll.

---

### 5.5 MediatR Pipeline Behaviors

Behaviors are like middleware, but for MediatR requests. They run for every command and query without the handler knowing:

```
Request → Behavior 1 → Behavior 2 → Behavior 3 → Handler → Behavior 3 → Behavior 2 → Behavior 1 → Response
```

The three behaviors registered:

| Order | Behavior | Does |
|---|---|---|
| 1st | `LoggingBehavior` | Logs request name before and after |
| 2nd | `ValidationBehavior` | Runs FluentValidation; short-circuits if invalid |
| 3rd | `TransactionBehavior` | Calls `SaveChangesAsync` after commands (not queries) |

`TransactionBehavior` distinguishes commands from queries by checking `if (request is not IBaseCommand)` — queries don't implement `IBaseCommand` so they pass through unchanged.

---

## 6. Domain Model Reference

### Aggregates

#### `Fund`
**File:** `src/Yvy.Domain/Aggregates/Funds/Fund.cs`

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Unique identity |
| `Code` | `FundCode` | CVM-style ticker, e.g. YVYQ11 |
| `Name` | `string` | Full fund name (max 200 chars) |
| `Type` | `FundType` | FII, FIC, FIM, or FIA |
| `Status` | `FundStatus` | Draft, Active, Suspended, Liquidated |
| `MinimumInvestment` | `Money` | Minimum entry amount (BRL) |

State machine:

```
Draft ──Activate()──► Active ──Suspend()──► Suspended
  │                     │
  └──Liquidate()──►  Liquidated  ◄──Liquidate()──┘
```

Factory: `Fund.Create(code, name, type, money)` → `ErrorOr<Fund>`

#### `Investor`
**File:** `src/Yvy.Domain/Aggregates/Investors/Investor.cs`

Two creation paths:
- `Investor.CreateNaturalPerson(cpf, fullName, email)` → `ErrorOr<Investor>`
- `Investor.CreateLegalEntity(cnpj, companyName, email)` → `ErrorOr<Investor>`

State: `PendingApproval → Active → Suspended`

### Value Objects

| Type | Validates | Example |
|---|---|---|
| `FundCode` | Regex `^[A-Z]{4,6}\d{2}$` | `"YVYQ11"` |
| `Money` | Amount ≥ 0, currency non-empty | `Amount=5000, Currency="BRL"` |
| `Cpf` | 11 digits, mod-11 checksum | `"529.982.247-25"` |
| `Cnpj` | 14 digits, mod-11 checksum | `"11.222.333/0001-81"` |
| `Email` | Regex `^[^@\s]+@[^@\s]+\.[^@\s]+$` | `"ir@yvy.capital"` |
| `Percentage` | 0 ≤ value ≤ 100 | `15.5` |

### Domain Events

| Event | Raised when | Payload |
|---|---|---|
| `FundCreatedDomainEvent` | `Fund.Create()` succeeds | FundId, FundCode, FundName |
| `FundStatusChangedDomainEvent` | `Activate()`, `Suspend()`, `Liquidate()` | FundId, OldStatus, NewStatus |
| `InvestorOnboardedDomainEvent` | `Investor.CreateNaturalPerson/LegalEntity()` | InvestorId, Name, Type |

### Error Catalog

**File:** `src/Yvy.Domain/Errors/FundErrors.cs`

| Error | HTTP Status | When |
|---|---|---|
| `FundErrors.NotFound` | 404 | Fund ID not in DB |
| `FundErrors.CodeAlreadyExists` | 409 | Duplicate fund code |
| `FundErrors.InvalidName` | 422 | Empty name in `Fund.Create()` |
| `FundErrors.InvalidFundType` | 422 | Unrecognized fund type string |
| `FundErrors.NotInDraftStatus` | 409 | `Activate()` called on non-Draft fund |
| `FundErrors.NotActive` | 409 | `Suspend()` called on non-Active fund |
| `FundErrors.AlreadyLiquidated` | 409 | `Liquidate()` called twice |

---

## 7. REST API Reference

Base URL in development: `https://localhost:7007` or `http://localhost:5224`

OpenAPI UI (development only): `https://localhost:7007/scalar/v1`

Health checks:
- `GET /health/live` — always 200 (process is running)
- `GET /health/ready` — 200 if PostgreSQL is reachable

### Funds

#### `GET /api/v1/funds`
Returns all funds.

**Response 200:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "YVYQ11",
    "name": "Yvy Fundo de Infraestrutura",
    "type": "FII",
    "status": "Draft",
    "minimumInvestmentAmount": 5000.00,
    "minimumInvestmentCurrency": "BRL",
    "createdAt": "2026-06-01T19:00:00Z",
    "updatedAt": null
  }
]
```

---

#### `GET /api/v1/funds/{id}`
Returns a single fund by GUID.

**Response 200:** Single `FundResponse` object (same shape as above)
**Response 404:** `ProblemDetails` — fund not found

---

#### `POST /api/v1/funds`
Creates a new fund.

**Request body:**
```json
{
  "code": "YVYQ11",
  "name": "Yvy Fundo de Infraestrutura",
  "fundType": "FII",
  "minimumInvestmentAmount": 5000.00,
  "minimumInvestmentCurrency": "BRL"
}
```

**Response 201:** `"3fa85f64-5717-4562-b3fc-2c963f66afa6"` (the new fund's ID)
**Response 409:** Code already exists
**Response 422:** Validation error (invalid code format, empty name, etc.)

---

## 8. How to Add a New Feature

Example: **Activate a fund** — `POST /api/v1/funds/{id}/activate`

Follow this order every time you add a feature.

### Step 1 — OpenAPI spec first

**File:** `.openapi/yvy-api.yaml`

Add the new path before writing any code:
```yaml
/api/v1/funds/{id}/activate:
  post:
    operationId: ActivateFund
    tags: [Funds]
    summary: Activate a fund (Draft → Active)
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      "204":
        description: Fund activated
      "404":
        $ref: "#/components/responses/NotFound"
      "409":
        $ref: "#/components/responses/Conflict"
```

### Step 2 — Application command (copy `CreateFund/` as template)

Create `src/Yvy.Application/Funds/Commands/ActivateFund/`:

```csharp
// ActivateFundCommand.cs
public sealed record ActivateFundCommand(Guid FundId) : ICommand;

// ActivateFundCommandValidator.cs
public sealed class ActivateFundCommandValidator : AbstractValidator<ActivateFundCommand>
{
    public ActivateFundCommandValidator()
    {
        RuleFor(x => x.FundId).NotEmpty();
    }
}

// ActivateFundCommandHandler.cs
public sealed class ActivateFundCommandHandler : ICommandHandler<ActivateFundCommand>
{
    public async Task<ErrorOr<Unit>> Handle(ActivateFundCommand request, CancellationToken ct)
    {
        var fund = await _fundRepository.GetByIdAsync(request.FundId, ct);
        if (fund is null) return FundErrors.NotFound;

        var result = fund.Activate();           // ← domain rule enforced here
        if (result.IsError) return result.Errors;

        await _unitOfWork.SaveChangesAsync(ct); // ← TransactionBehavior handles this
        return Result.Updated;
    }
}
```

### Step 3 — Write the handler test first (TDD)

**File:** `tests/Yvy.Application.Tests/Funds/ActivateFundCommandHandlerTests.cs`

```csharp
[Fact]
public async Task Handle_WhenFundIsInDraft_ActivatesSuccessfully()
{
    var fund = Fund.Create(FundCode.Create("YVYQ11").Value, "Test", FundType.FII, Money.Zero).Value;
    _fundRepository.GetByIdAsync(fund.Id, Arg.Any<CancellationToken>()).Returns(fund);

    var result = await _handler.Handle(new ActivateFundCommand(fund.Id), CancellationToken.None);

    result.IsError.Should().BeFalse();
    fund.Status.Should().Be(FundStatus.Active);
}
```

### Step 4 — Add the endpoint

**File:** `Yvy.Api/Endpoints/Funds/FundEndpoints.cs`

```csharp
group.MapPost("/{id:guid}/activate", ActivateFund)
    .WithName("ActivateFund")
    .WithSummary("Activate a fund")
    .Produces(204)
    .Produces(404)
    .Produces(409);

// ...

private static async Task<IResult> ActivateFund(Guid id, ISender sender, CancellationToken ct)
{
    var result = await sender.Send(new ActivateFundCommand(id), ct);
    return result.Match(_ => Results.NoContent(), errors => errors.ToProblemResult());
}
```

That is the complete feature. No changes needed to Domain (the `Activate()` method already exists), no changes needed to Infrastructure (the repository already handles Fund).

---

## 9. File Map — Where to Go When You Need to Change Something

| I want to... | File |
|---|---|
| Add a business rule to Fund | `src/Yvy.Domain/Aggregates/Funds/Fund.cs` |
| Add a new error code | `src/Yvy.Domain/Errors/FundErrors.cs` |
| Add a new command | `src/Yvy.Application/Funds/Commands/<Name>/` (3 files) |
| Add a new query | `src/Yvy.Application/Funds/Queries/<Name>/` (2 files) |
| Change validation rules | `src/Yvy.Application/Funds/Commands/CreateFund/CreateFundCommandValidator.cs` |
| Add a DB column to Fund | `src/Yvy.Infrastructure/Persistence/Configurations/FundConfiguration.cs` + `dotnet ef migrations add` |
| Add a new REST endpoint | `Yvy.Api/Endpoints/Funds/FundEndpoints.cs` |
| Change error → HTTP status mapping | `Yvy.Api/Extensions/ErrorOrExtensions.cs` |
| React to a domain event | Create a new `INotificationHandler<TEvent>` in `src/Yvy.Infrastructure/` |
| Change the DB connection string | `Yvy.Api/appsettings.Development.json` → `ConnectionStrings.DefaultConnection` |

---

## 10. Running the Backend

```bash
# Prerequisites: PostgreSQL running on localhost:5432
# Update connection string in Yvy.Api/appsettings.Development.json if needed

# Apply migrations (creates the tables)
dotnet ef database update \
  --project src/Yvy.Infrastructure \
  --startup-project Yvy.Api

# Run the API
dotnet run --project Yvy.Api

# OpenAPI UI  → https://localhost:7007/scalar/v1
# Health live → http://localhost:5224/health/live
# Health ready→ http://localhost:5224/health/ready

# Run unit tests (no DB needed)
dotnet test tests/Yvy.Domain.Tests
dotnet test tests/Yvy.Application.Tests

# Run integration tests (requires Docker for Testcontainers)
dotnet test tests/Yvy.Api.IntegrationTests

# Add a new migration after changing EF configurations
dotnet ef migrations add <MigrationName> \
  --project src/Yvy.Infrastructure \
  --startup-project Yvy.Api
```
