---
title: Subscribe to Slices, Not the Whole Store
impact: HIGH
impactDescription: prevents components from re-rendering on unrelated state changes
tags: performance, selectors, re-renders
---

## Subscribe to Slices, Not the Whole Store

**Impact: HIGH (subscribing to the full store object causes re-renders on every state mutation)**

Pass a selector function to the store hook. Select only the fields the component actually reads.

**Incorrect:**
```tsx
function FundsBadge() {
  const store = useFundsStore();           // re-renders on every funds state change
  return <Badge>{store.funds.length}</Badge>;
}
```

**Correct:**
```tsx
function FundsBadge() {
  const count = useFundsStore((s) => s.funds.length);  // re-renders only when length changes
  return <Badge>{count}</Badge>;
}
```

**Stable actions (no performance issue either way, but be explicit):**
```tsx
const clearSession = useAuthStore((s) => s.clearSession);
```

Zustand uses strict reference equality (`===`) for comparison. For derived values that are new objects on every call, memoize with `useMemo` or use `useShallow` from `zustand/react/shallow`.
