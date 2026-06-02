---
title: Explicit TypeScript Interface for Every Store
impact: CRITICAL
impactDescription: catches typos in set() calls and enforces action signatures at compile time
tags: typescript, type-safety, store-design
---

## Explicit TypeScript Interface for Every Store

**Impact: CRITICAL (without an explicit interface, TypeScript cannot catch mismatched set() calls)**

Always provide an explicit `interface` to `create<T>()`. Never rely on inferred types.

**Incorrect:**
```ts
const useAuthStore = create()(devtools((set) => ({
  userId: null,           // inferred as null — not string | null
  setUserId: (id) => set({ userId: id }),
})));
```

**Correct:**
```ts
interface AuthState {
  userId: string | null;
  token: string | null;
  setSession: (userId: string, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(devtools(...));
```

Group state fields first, then actions, in the interface declaration.
