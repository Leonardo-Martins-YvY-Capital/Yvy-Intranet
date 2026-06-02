---
title: Handle ProblemDetails Errors from the Yvy Backend
impact: HIGH
impactDescription: untyped error handling hides field-level validation errors from FluentValidation
tags: error-handling, problemdetails, asp-net, api-error
---

## Handle ProblemDetails Errors from the Yvy Backend

**Impact: HIGH (swallowing typed errors prevents displaying actionable feedback to users)**

The backend returns RFC 7807 ProblemDetails. The `api.ts` client throws them as `ApiError`. Components read the typed `error` from `useQuery`/`useMutation`.

**`ApiError` shape:**
```ts
interface ApiError {
  type: string;
  title: string;              // e.g. "Validation failure"
  status: number;             // 400, 404, 409, etc.
  detail?: string;            // longer explanation
  errors?: Record<string, string[]>; // field errors from FluentValidation
}
```

**Incorrect:**
```tsx
if (isError) return <p>Something went wrong</p>;  // loses all error context
```

**Correct:**
```tsx
if (isError) {
  return (
    <Alert variant="error">
      <strong>{error.title}</strong>
      {error.detail && <p>{error.detail}</p>}
    </Alert>
  );
}
```

**Mutation with field-level validation:**
```tsx
const mutation = useMutation<void, ApiError, CreateFundInput>({ ... });

{mutation.error?.errors && Object.entries(mutation.error.errors).map(([field, msgs]) => (
  <p key={field} className="text-red-600">{field}: {msgs.join(', ')}</p>
))}
```

**PII rule:** Never log or render raw CPF/CNPJ digits that may appear in error detail strings. Strip document numbers before displaying. The backend should not include them in ProblemDetails — but defensively check.
