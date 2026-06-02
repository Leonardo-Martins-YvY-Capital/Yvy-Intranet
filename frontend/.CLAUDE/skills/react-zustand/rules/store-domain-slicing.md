---
title: One Store Per Domain
impact: CRITICAL
impactDescription: prevents cross-domain re-renders and keeps DevTools readable
tags: architecture, store-design, performance
---

## One Store Per Domain

**Impact: CRITICAL (cross-domain coupling causes unnecessary re-renders and makes debugging hard)**

Each Zustand store covers exactly one domain. Files live at `frontend/src/store/<domain>.store.ts`. The exported hook is named `use<Domain>Store`.

**Incorrect:**
```ts
// src/store/index.ts — monolithic store
export const useAppStore = create<{
  userId: string | null;
  funds: Fund[];
  sidebarOpen: boolean;
}>()(...);
```

**Correct:**
```ts
// src/store/auth.store.ts → useAuthStore
// src/store/funds.store.ts → useFundsStore
// src/store/ui.store.ts → useUIStore
```

Canonical domains: `auth`, `funds`, `investors`, `ui`. Add new domain files as features grow — do not extend existing stores with unrelated fields.
