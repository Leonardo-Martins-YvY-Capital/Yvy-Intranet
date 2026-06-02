---
title: Explicit Generic Types on useQuery and useMutation
impact: CRITICAL
impactDescription: without explicit generics data is unknown and errors are untyped — runtime crashes instead of compile-time feedback
tags: typescript, type-safety, generics
---

## Explicit Generic Types on useQuery and useMutation

**Impact: CRITICAL (inferred generics produce `data: unknown` — type errors surface at runtime)**

Always provide `<TData, TError>` to `useQuery` and `<TData, TError, TVariables>` to `useMutation`. Use `ApiError` from `src/lib/api.ts` as the error type.

**Incorrect:**
```ts
const { data } = useQuery({
  queryKey: queryKeys.funds.list(),
  queryFn: () => api.get('/funds'),
});
// data: unknown — no autocomplete, no type safety
```

**Correct:**
```ts
import { api, ApiError } from '../lib/api';

const { data } = useQuery<Fund[], ApiError>({
  queryKey: queryKeys.funds.list(),
  queryFn: () => api.get<Fund[]>('/funds'),
});
// data: Fund[] | undefined — fully typed, IDE autocomplete works

const mutation = useMutation<void, ApiError, CreateFundInput>({
  mutationFn: (input) => api.post('/funds', input),
  onError: (err) => console.error(err.title), // err is ApiError, not unknown
});
```

Generic order: `useQuery<TData, TError>`, `useMutation<TData, TError, TVariables>`.
