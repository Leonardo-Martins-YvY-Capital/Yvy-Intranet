---
title: Stores Hold State — Hooks Own Side Effects
impact: HIGH
impactDescription: mixing API calls into stores couples the network layer to global state and breaks testability
tags: architecture, async, data-fetching, testing
---

## Stores Hold State — Hooks Own Side Effects

**Impact: HIGH (API calls in store actions are hard to mock, retry, or cancel)**

Zustand stores hold synchronous state and synchronous actions. All async work (fetch, timers, subscriptions) belongs in React hooks or React Query.

**Incorrect:**
```ts
interface FundsState {
  funds: Fund[];
  loadFunds: () => Promise<void>;   // side effect inside store
}

export const useFundsStore = create<FundsState>()(devtools((set) => ({
  funds: [],
  loadFunds: async () => {
    const data = await api.getFunds();
    set({ funds: data }, false, 'funds/loadFunds');
  },
})));
```

**Correct — store is state-only:**
```ts
interface FundsState {
  funds: Fund[];
  setFunds: (funds: Fund[]) => void;
}

export const useFundsStore = create<FundsState>()(devtools((set) => ({
  funds: [],
  setFunds: (funds) => set({ funds }, false, 'funds/setFunds'),
})));
```

**Hook owns async logic:**
```ts
function useFundsData() {
  const setFunds = useFundsStore((s) => s.setFunds);
  useEffect(() => { api.getFunds().then(setFunds); }, [setFunds]);
  return useFundsStore((s) => s.funds);
}
```

For server data, use **TanStack Query** (`useQuery`, `useMutation`) — not `useEffect` + store. It handles caching, stale detection, background refetch, and cache invalidation automatically. See the `react-tanstack-query` skill for hook patterns, the `ApiError` type, and the query key factory.

Reserve Zustand for client-only state: selected entity IDs, sidebar/modal toggles, session tokens, filter panel state.
