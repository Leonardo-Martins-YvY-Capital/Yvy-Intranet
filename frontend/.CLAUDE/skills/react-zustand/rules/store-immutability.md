---
title: immer Middleware for Deeply Nested State
impact: MEDIUM
impactDescription: avoids verbose spread chains that are error-prone in nested objects
tags: immutability, immer, middleware
---

## immer Middleware for Deeply Nested State

**Impact: MEDIUM (spread chains at 3+ nesting levels introduce bugs and reduce readability)**

Use standard `set()` spreads for flat or 2-level state. Add `immer` middleware only when state nesting reaches 3+ levels.

**Flat state — no immer needed:**
```ts
set({ selectedFundId: id }, false, 'funds/selectFund');
```

**Deep nesting — use immer:**
```ts
import { immer } from 'zustand/middleware/immer';

export const useFiltersStore = create<FiltersState>()(
  devtools(
    immer((set) => ({
      filters: {
        date: { from: null, to: null },
        status: { active: true, closed: false },
      },
      setDateFrom: (from: string) =>
        set((s) => { s.filters.date.from = from; }, false, 'filters/setDateFrom'),
    })),
    { name: 'FiltersStore' }
  )
);
```

**Middleware order:** Always `devtools(immer(...))`. Reversing the order breaks DevTools action names.

Do not add `immer` preemptively — only introduce it when a nested `set()` spread becomes genuinely unreadable.
