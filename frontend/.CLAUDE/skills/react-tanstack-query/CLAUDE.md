# react-tanstack-query

## Abstract

This guide covers TanStack Query v5 conventions for the Yvy Capital frontend. TanStack Query owns all server state — data fetched from the Yvy API. Zustand owns client state — UI toggles, session tokens, user selections. The two layers are complementary and must not overlap. Rules are calibrated for a capital markets context: read-heavy dashboards, fund/investor data with moderate freshness requirements, and an ASP.NET Core backend that returns ProblemDetails errors (RFC 7807).

---

## Table of Contents

1. [Query Key Factory — CRITICAL](#1-query-key-factory--critical)
2. [TypeScript Typing — CRITICAL](#2-typescript-typing--critical)
3. [QueryClient Configuration — HIGH](#3-queryclient-configuration--high)
4. [Error Handling (ProblemDetails) — HIGH](#4-error-handling-problemdetails--high)
5. [Cache Invalidation — HIGH](#5-cache-invalidation--high)
6. [TanStack Query vs Zustand Boundary — HIGH](#6-tanstack-query-vs-zustand-boundary--high)
7. [DevTools — MEDIUM](#7-devtools--medium)

---

## 1. Query Key Factory — CRITICAL

All query keys are defined in `src/hooks/query-keys.ts`. No query key is ever written inline.

**Why:** Invalidation requires exact key matching. Scattered inline keys lead to stale cache entries that never get cleared after mutations.

**Incorrect:**
```ts
useQuery({ queryKey: ['funds'], queryFn: ... })   // in one file
queryClient.invalidateQueries({ queryKey: ['fund'] }) // typo — different key, invalidation silently fails
```

**Correct — key factory:**
```ts
// src/hooks/query-keys.ts
export const queryKeys = {
  funds: {
    all: ['funds'] as const,
    list: (filters?: Record<string, unknown>) => ['funds', 'list', filters] as const,
    detail: (id: string) => ['funds', 'detail', id] as const,
  },
  investors: {
    all: ['investors'] as const,
    list: (page: number) => ['investors', 'list', page] as const,
    detail: (id: string) => ['investors', 'detail', id] as const,
  },
} as const;

// In the query hook:
useQuery({ queryKey: queryKeys.funds.list(), queryFn: ... })

// In the mutation:
queryClient.invalidateQueries({ queryKey: queryKeys.funds.all })
```

**Key structure rules:**
- `all` — broadest scope, used for bulk invalidations after mutations
- `list(filters?)` — scoped to a filtered list
- `detail(id)` — scoped to a single entity

Add new domains to `query-keys.ts`, never inline them elsewhere.

---

## 2. TypeScript Typing — CRITICAL

Always provide explicit `<TData, TError>` generics to `useQuery`. Use `ApiError` (from `src/lib/api.ts`) as the error type.

**Incorrect:**
```ts
const { data } = useQuery({
  queryKey: queryKeys.funds.list(),
  queryFn: () => api.get('/funds'),   // data: unknown
});
```

**Correct:**
```ts
import { api, ApiError } from '../lib/api';

const { data } = useQuery<Fund[], ApiError>({
  queryKey: queryKeys.funds.list(),
  queryFn: () => api.get<Fund[]>('/funds'),
});
// data: Fund[] | undefined — fully typed
```

**For mutations:**
```ts
const mutation = useMutation<void, ApiError, CreateFundInput>({
  mutationFn: (input) => api.post('/funds', input),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.funds.all }),
  onError: (err) => {
    // err is ApiError — access err.title, err.detail, err.errors safely
  },
});
```

Generics order for `useMutation<TData, TError, TVariables>`.

---

## 3. QueryClient Configuration — HIGH

`src/lib/queryClient.ts` is the single source of default configuration. Do not override defaults in individual `useQuery` calls unless there is a specific reason.

```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 min — fund data freshness requirement
      gcTime: 10 * 60 * 1000,       // 10 min cache retention after unmount
      retry: 1,                      // one retry only — no hammering financial APIs
      refetchOnWindowFocus: false,   // explicit user action triggers refetch, not tab focus
    },
  },
});
```

**When to override `staleTime` in a specific query:**
- Real-time data (quotes, NAV prices): `staleTime: 0` + `refetchInterval: 30_000`
- Rarely-changing reference data (fund categories): `staleTime: 30 * 60 * 1000`

**Incorrect:**
```ts
// Don't duplicate config in every hook
useQuery({ staleTime: 300000, retry: 1, refetchOnWindowFocus: false, ... })
```

---

## 4. Error Handling (ProblemDetails) — HIGH

The Yvy backend returns RFC 7807 ProblemDetails on all error responses. The `api.ts` client parses these and throws them as `ApiError` objects. Components read `error` from `useQuery` and display accordingly.

**`ApiError` shape (from `src/lib/api.ts`):**
```ts
export interface ApiError {
  type: string;               // URI identifying the error type
  title: string;              // human-readable summary
  status: number;             // HTTP status code
  detail?: string;            // longer explanation
  errors?: Record<string, string[]>; // field-level validation errors
}
```

**Component error handling:**
```tsx
function FundsList() {
  const { data, error, isError, isPending } = useFundsQuery();

  if (isPending) return <Skeleton />;

  if (isError) {
    return (
      <Alert variant="error">
        {error.title}
        {error.detail && <p>{error.detail}</p>}
      </Alert>
    );
  }

  return <Table data={data} />;
}
```

**Mutation error with field-level display:**
```tsx
const mutation = useMutation<void, ApiError, CreateFundInput>({ ... });

// Field errors from FluentValidation (backend)
if (mutation.error?.errors) {
  Object.entries(mutation.error.errors).map(([field, messages]) => (
    <p key={field}>{field}: {messages.join(', ')}</p>
  ));
}
```

**PII rule:** Never log or display CPF/CNPJ digits in error messages (CVM 175). The backend's ProblemDetails should not contain them — but if an error detail looks like it contains a document number, strip it before rendering.

---

## 5. Cache Invalidation — HIGH

After every mutation that changes server data, invalidate the affected query keys so the cache reflects the new state.

**Incorrect:**
```ts
const mutation = useMutation({
  mutationFn: (input) => api.post('/funds', input),
  // no onSuccess — cache stays stale until next natural refetch
});
```

**Correct — broad invalidation (invalidate all fund queries):**
```ts
const mutation = useMutation<void, ApiError, CreateFundInput>({
  mutationFn: (input) => api.post('/funds', input),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.funds.all });
  },
});
```

**Optimistic update (advanced — use only for high-latency, frequently-mutated data):**
```ts
const mutation = useMutation({
  mutationFn: (input) => api.put(`/funds/${input.id}`, input),
  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.funds.detail(input.id) });
    const previous = queryClient.getQueryData(queryKeys.funds.detail(input.id));
    queryClient.setQueryData(queryKeys.funds.detail(input.id), input);
    return { previous };
  },
  onError: (_err, input, ctx) => {
    queryClient.setQueryData(queryKeys.funds.detail(input.id), ctx?.previous);
  },
  onSettled: (_data, _err, input) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.funds.detail(input.id) });
  },
});
```

Default to simple `invalidateQueries` on `onSuccess`. Optimistic updates add complexity — only introduce them when the round-trip latency is noticeably degrading UX.

---

## 6. TanStack Query vs Zustand Boundary — HIGH

The two libraries are complementary. The boundary is strict.

| Question | TanStack Query | Zustand |
|----------|---------------|---------|
| "Did the API return this?" | Yes | No |
| "Did the user select/toggle this?" | No | Yes |
| "Is this data stale?" | Managed automatically | Not applicable |
| "Does this survive a page reload?" | Yes (re-fetches) | Only with `persist` middleware |
| "Can multiple components share this?" | Yes (cache) | Yes (store) |

**Incorrect — server state in Zustand:**
```ts
// Zustand store with API data
interface FundsState {
  funds: Fund[];
  loadFunds: () => Promise<void>;  // manually fetching inside store
}
```

**Incorrect — UI state in TanStack Query:**
```ts
// Using a query for purely local UI state
useQuery({ queryKey: ['sidebarOpen'], queryFn: () => false })
```

**Correct — clear separation:**
```tsx
function FundsPage() {
  // Server state: TanStack Query owns it
  const { data: funds, isPending } = useFundsQuery();

  // UI state: Zustand owns it
  const selectedFundId = useFundsStore((s) => s.selectedFundId);
  const selectFund = useFundsStore((s) => s.selectFund);

  return (
    <Table
      data={funds}
      selectedId={selectedFundId}
      onSelect={selectFund}
      loading={isPending}
    />
  );
}
```

**When server state and UI state interact:**
The selected fund ID lives in Zustand. The selected fund's _data_ is fetched with `useFundQuery(selectedFundId)` — TanStack Query re-uses its cache if that detail was already fetched.

---

## 7. DevTools — MEDIUM

`ReactQueryDevtools` is mounted in `main.tsx` and active only in development (TanStack automatically excludes it from production builds).

```tsx
// main.tsx — already configured
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

The DevTools panel (bottom-right button) shows:
- All active, inactive, and stale queries
- Query keys, state, data, and error details
- Manual refetch and invalidation controls

Do not add `ReactQueryDevtools` again in individual components — it is a singleton.

---

## Copy-Paste Hook Template

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';
import { queryKeys } from './query-keys';

interface __Entity__ { id: string; /* ... */ }
interface Create__Entity__Input { /* ... */ }

export function use__Entity__sQuery() {
  return useQuery<__Entity__[], ApiError>({
    queryKey: queryKeys.__domain__.list(),
    queryFn: () => api.get<__Entity__[]>('/__endpoint__'),
  });
}

export function use__Entity__Query(id: string) {
  return useQuery<__Entity__, ApiError>({
    queryKey: queryKeys.__domain__.detail(id),
    queryFn: () => api.get<__Entity__>(`/__endpoint__/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreate__Entity__() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, Create__Entity__Input>({
    mutationFn: (input) => api.post('/__endpoint__', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.__domain__.all }),
  });
}
```

Replace `__Entity__`, `__domain__`, `__endpoint__` with the actual domain values.

---

## References

- [TanStack Query v5 docs](https://tanstack.com/query/latest)
- [Query key factories pattern](https://tkdodo.eu/blog/effective-react-query-keys)
- [Zustand + React Query together](https://tkdodo.eu/blog/working-with-zustand)
- [ProblemDetails spec (RFC 7807)](https://datatracker.ietf.org/doc/html/rfc7807)
