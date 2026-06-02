---
title: TanStack Query for Server State, Zustand for Client State
impact: HIGH
impactDescription: mixing them causes double-caching, stale data, and unnecessary re-fetches
tags: architecture, zustand, state-management, server-state
---

## TanStack Query for Server State, Zustand for Client State

**Impact: HIGH (using Zustand as an API cache requires manual loading state, no stale detection, and brittle invalidation)**

| State type | Tool | Example |
|------------|------|---------|
| Data from the API | TanStack Query | fund list, investor records, NAV history |
| User interaction / UI toggles | Zustand | selected fund ID, sidebar open, filter panel state |
| Session / auth tokens | Zustand (`persist`) | userId, token, role |
| Derived local state | `useMemo` / component state | filtered list from already-fetched data |

**Incorrect — API data in Zustand:**
```ts
interface FundsState {
  funds: Fund[];
  loadFunds: () => Promise<void>;  // manual fetch in store — no caching, no stale detection
}
```

**Correct — complementary usage:**
```tsx
function FundsPage() {
  const { data: funds, isPending } = useFundsQuery();          // server state
  const selectedId = useFundsStore((s) => s.selectedFundId);  // client state
  const selectFund = useFundsStore((s) => s.selectFund);

  const { data: selectedFund } = useFundQuery(selectedId);    // TanStack re-uses cache
}
```

The selected fund's *ID* lives in Zustand. The selected fund's *data* is fetched (and cached) by TanStack Query. They interlock cleanly.
