---
name: react-tanstack-query
description: >
  TanStack Query (React Query) patterns for the Yvy Capital frontend.
  Use when fetching data from the API, handling loading/error states,
  implementing mutations with cache invalidation, or deciding between
  TanStack Query and Zustand for a given piece of state.
  Trigger phrases: "fetch data", "API call", "server state", "loading state",
  "react query", "tanstack", "useQuery", "useMutation", "cache", "invalidate".
license: MIT
metadata:
  author: Yvy Engineering
  version: "1.0.0"
---

## When to Apply

- Fetching any data from the Yvy backend (`/funds`, `/investors`, etc.)
- Implementing create/update/delete with automatic cache invalidation
- Deciding whether state belongs in TanStack Query or Zustand
- Reviewing query hooks for performance or correctness
- Adding loading skeletons or error boundaries tied to query state

## The Core Boundary

| State type | Tool | Example |
|------------|------|---------|
| Server data (API responses) | **TanStack Query** | fund list, investor records |
| User interaction / UI | **Zustand** | selected fund ID, sidebar open, session token |

Never put API response data in a Zustand store. Never put UI-only state in TanStack Query.

## Rule Categories (priority order)

| # | Category | Impact | Rule file |
|---|----------|--------|-----------|
| 1 | Query Key Factory | CRITICAL | `query-key-factory` |
| 2 | TypeScript Typing | CRITICAL | `query-type-safety` |
| 3 | QueryClient Config | HIGH | `query-client-config` |
| 4 | Error Handling | HIGH | `query-error-handling` |
| 5 | Cache Invalidation | HIGH | `query-cache-invalidation` |
| 6 | Zustand vs TanStack | HIGH | `query-vs-zustand` |
| 7 | DevTools | MEDIUM | `query-devtools` |

## Quick Reference

- All query keys come from `src/hooks/query-keys.ts` — never inline string arrays
- Always type `useQuery<TData, ApiError>` — never let TypeScript infer the error type
- `staleTime: 5min`, `gcTime: 10min`, `retry: 1`, `refetchOnWindowFocus: false` (set in `queryClient.ts`)
- Mutations call `queryClient.invalidateQueries({ queryKey: queryKeys.domain.all })` on success
- `useAuthStore.getState().token` in `api.ts` — correct pattern for non-hook contexts
- ProblemDetails error shape: `{ type, title, status, detail?, errors? }`

## Companion Skill

Server state (TanStack Query) + client state (Zustand) work together.
See `react-zustand` skill for store design, selectors, and devtools conventions.

## Reading the Full Guide

See `CLAUDE.md` for complete rules with incorrect/correct examples, the API client pattern,
and mutation recipes.
