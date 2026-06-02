---
title: Centralized Query Key Factory
impact: CRITICAL
impactDescription: scattered inline keys cause silent invalidation failures after mutations
tags: query-keys, cache, invalidation, architecture
---

## Centralized Query Key Factory

**Impact: CRITICAL (inline keys with typos silently fail to invalidate — stale data persists)**

All query keys are defined in `src/hooks/query-keys.ts`. No query key is ever written inline in a hook or component.

**Incorrect:**
```ts
// hook A
useQuery({ queryKey: ['funds'], ... })

// mutation — typo: 'fund' vs 'funds'
queryClient.invalidateQueries({ queryKey: ['fund'] })
// Invalidation silently does nothing — cache never clears
```

**Correct:**
```ts
// src/hooks/query-keys.ts
export const queryKeys = {
  funds: {
    all: ['funds'] as const,
    list: (filters?: Record<string, unknown>) => ['funds', 'list', filters] as const,
    detail: (id: string) => ['funds', 'detail', id] as const,
  },
} as const;

// Hook uses the factory
useQuery({ queryKey: queryKeys.funds.list(), ... })

// Mutation uses the same factory
queryClient.invalidateQueries({ queryKey: queryKeys.funds.all })
```

Structure: `all` → broadest (use for post-mutation bulk invalidation); `list(filters)` → filtered list; `detail(id)` → single entity. Add each new domain to the factory, never inline.
