---
title: QueryClient Defaults in queryClient.ts — Do Not Override Per Hook
impact: HIGH
impactDescription: inconsistent staleTime/retry settings across hooks cause unpredictable refetch behavior
tags: configuration, queryclient, stale-time, retry
---

## QueryClient Defaults in queryClient.ts — Do Not Override Per Hook

**Impact: HIGH (per-hook overrides defeat the project-wide caching strategy)**

Configuration lives in `src/lib/queryClient.ts`. Individual `useQuery` calls must not repeat these settings.

**Project defaults:**
```ts
staleTime: 5 * 60 * 1000,     // 5 min — fund data freshness requirement
gcTime: 10 * 60 * 1000,        // 10 min cache retention after unmount
retry: 1,                       // one retry — no hammering financial APIs
refetchOnWindowFocus: false,    // explicit user action triggers refetch
```

**Incorrect:**
```ts
useQuery({
  staleTime: 300_000,
  retry: 1,
  refetchOnWindowFocus: false,
  ...
})
```

**Correct:**
```ts
useQuery<Fund[], ApiError>({
  queryKey: queryKeys.funds.list(),
  queryFn: () => api.get<Fund[]>('/funds'),
  // defaults inherited from queryClient.ts — no overrides needed
})
```

**When to override:**
- Real-time data (NAV prices, quotes): `staleTime: 0`, `refetchInterval: 30_000`
- Reference data that rarely changes: `staleTime: 30 * 60 * 1000`
- One-time load (app config): `staleTime: Infinity`
