# react-zustand

## Abstract

This guide covers Zustand state management conventions for the Yvy Capital frontend (React 19 + TypeScript 6 + Vite). It defines where stores live, how they are typed, how they integrate with DevTools, and the boundary between store state and async side effects. All rules are calibrated for the capital markets domain: auth tokens, fund data, investor records, and UI state.

---

## Table of Contents

1. [Store Design — CRITICAL](#1-store-design--critical)
2. [TypeScript Integration — CRITICAL](#2-typescript-integration--critical)
3. [Selectors — HIGH](#3-selectors--high)
4. [DevTools — HIGH](#4-devtools--high)
5. [Side Effects Boundary — HIGH](#5-side-effects-boundary--high)
6. [Immutability — MEDIUM](#6-immutability--medium)
7. [Persistence — MEDIUM](#7-persistence--medium)
8. [Testing — LOW](#8-testing--low)

---

## 1. Store Design — CRITICAL

One Zustand store per domain. Stores live at `frontend/src/store/<domain>.store.ts`.

**Incorrect:**
```ts
// src/store/index.ts — one mega-store with everything
export const useAppStore = create<AppState>()((set) => ({
  userId: null,
  funds: [],
  sidebarOpen: false,
  // ...
}));
```

**Correct:**
```ts
// src/store/auth.store.ts
export const useAuthStore = create<AuthState>()(devtools(..., { name: 'AuthStore' }));

// src/store/funds.store.ts
export const useFundsStore = create<FundsState>()(devtools(..., { name: 'FundsStore' }));

// src/store/ui.store.ts
export const useUIStore = create<UIState>()(devtools(..., { name: 'UIStore' }));
```

**Why:** Monolithic stores couple unrelated domains — a re-render triggered by a fund list update will also re-render components subscribed to auth state. Separate stores keep subscriptions narrow and DevTools traces readable.

**Canonical store list:**

| File | Domain | Holds |
|------|--------|-------|
| `auth.store.ts` | Auth | userId, token, role |
| `funds.store.ts` | Funds | list, selected fund, filters |
| `investors.store.ts` | Investors | list, pagination, selected investor |
| `ui.store.ts` | UI | sidebar, modals, toast queue |

---

## 2. TypeScript Integration — CRITICAL

Always provide an explicit interface to `create<T>()`. Never let TypeScript infer the state shape.

**Incorrect:**
```ts
// TypeScript infers the state type — breaks when you add actions
const useAuthStore = create()(devtools((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),
})));
```

**Correct:**
```ts
interface AuthState {
  userId: string | null;
  token: string | null;
  role: 'admin' | 'viewer' | null;
  setSession: (userId: string, token: string, role: AuthState['role']) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      userId: null,
      token: null,
      role: null,
      setSession: (userId, token, role) =>
        set({ userId, token, role }, false, 'auth/setSession'),
      clearSession: () =>
        set({ userId: null, token: null, role: null }, false, 'auth/clearSession'),
    }),
    { name: 'AuthStore' }
  )
);
```

**Why:** The interface is the contract. With it, TypeScript catches typos in `set()` calls, enforces action signatures, and autocompletes in consumers. Without it, errors surface only at runtime.

---

## 3. Selectors — HIGH

Subscribe to the smallest slice needed, not the full store object.

**Incorrect:**
```tsx
// Subscribes to the entire store — re-renders on ANY state change
function FundsBadge() {
  const store = useFundsStore();
  return <Badge>{store.funds.length}</Badge>;
}
```

**Correct:**
```tsx
// Subscribes only to funds.length — re-renders only when that changes
function FundsBadge() {
  const count = useFundsStore((s) => s.funds.length);
  return <Badge>{count}</Badge>;
}
```

**Selector for actions (stable references — safe to skip selector):**
```tsx
// Actions are created once; selecting the whole store just for an action is fine
// but being explicit is better
function LogoutButton() {
  const clearSession = useAuthStore((s) => s.clearSession);
  return <Button onClick={clearSession}>Sign out</Button>;
}
```

**Why:** Zustand re-renders a component whenever the selected value changes (by reference equality). Selecting the whole store means any mutation — even in an unrelated field — triggers a re-render.

---

## 4. DevTools — HIGH

Every store must be wrapped in `devtools()`. Every `set()` call must provide a named action string.

**Incorrect:**
```ts
export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

**Correct:**
```ts
export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'ui/toggleSidebar'),
      setSidebarOpen: (open: boolean) =>
        set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),
    }),
    { name: 'UIStore' }
  )
);
```

**Action naming convention:** `<domain>/<actionVerb>` — e.g. `auth/setSession`, `funds/setFilter`, `ui/toggleSidebar`.

**Why:** Without DevTools, debugging state bugs in a capital markets UI requires console.log everywhere. Named actions provide a time-travel audit trail in Redux DevTools, which the whole team can use.

---

## 5. Side Effects Boundary — HIGH

Stores hold **state**. Stores do **not** fetch data, call APIs, or run timers.

**Incorrect:**
```ts
// Fetch inside a store action — couples the store to network layer
interface FundsState {
  funds: Fund[];
  loadFunds: () => Promise<void>;
}

export const useFundsStore = create<FundsState>()(devtools((set) => ({
  funds: [],
  loadFunds: async () => {
    const data = await api.getFunds();   // ← side effect in store
    set({ funds: data }, false, 'funds/loadFunds');
  },
})));
```

**Correct:**
```ts
// Store holds state only
interface FundsState {
  funds: Fund[];
  setFunds: (funds: Fund[]) => void;
  clearFunds: () => void;
}

// Hook owns the async logic
function useFunds() {
  const setFunds = useFundsStore((s) => s.setFunds);

  useEffect(() => {
    api.getFunds().then(setFunds);
  }, [setFunds]);

  return useFundsStore((s) => s.funds);
}
```

**Even better — use React Query for server state:**
```ts
// Server state (funds from API) → React Query
function useFundsQuery() {
  return useQuery({ queryKey: ['funds'], queryFn: api.getFunds });
}

// Zustand only for UI state derived from user interaction
const selectedFundId = useFundsStore((s) => s.selectedFundId);
```

**Why:** Mixing side effects in stores makes them hard to test and blurs the boundary between server state (what the API says) and client state (what the user has selected). React Query handles server state caching, refetching, and stale-while-revalidate; Zustand handles UI and session state.

---

## 6. Immutability — MEDIUM

For state with nesting up to 2 levels, use standard `set()` spreads. For 3+ levels, add `immer` middleware.

**Standard (flat state — no immer needed):**
```ts
set({ selectedFundId: id }, false, 'funds/selectFund');
```

**With immer (deeply nested):**
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

**Middleware order:** `devtools(immer(...))` — devtools wraps immer, not the other way around.

---

## 7. Persistence — MEDIUM

Use `persist` middleware + `partialize` to whitelist only the fields that should survive a page reload.

```ts
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  token: string | null;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        userId: null,
        token: null,
        clearSession: () => set({ userId: null, token: null }, false, 'auth/clearSession'),
      }),
      {
        name: 'yvy-auth',
        storage: createJSONStorage(() => sessionStorage), // sessionStorage for tokens
        partialize: (s) => ({ userId: s.userId, token: s.token }), // exclude actions
      }
    ),
    { name: 'AuthStore' }
  )
);
```

**Storage choice:**
- `sessionStorage` — auth tokens (cleared on tab close)
- `localStorage` — UI preferences (sidebar collapsed, theme)

**Middleware order:** `devtools(persist(...))`.

**PII rule:** Never persist CPF, CNPJ, or full investor names to any Web Storage (CVM 175 compliance — see CLAUDE.md at project root).

---

## 8. Testing — LOW

Access Zustand stores directly in tests. Reset state between tests with `setState`.

```ts
import { useAuthStore } from '../store/auth.store';

beforeEach(() => {
  useAuthStore.setState({ userId: null, token: null, role: null });
});

it('sets session correctly', () => {
  const { setSession } = useAuthStore.getState();
  setSession('user-1', 'tok-abc', 'viewer');
  expect(useAuthStore.getState().userId).toBe('user-1');
});
```

**No mocking needed** — Zustand stores are plain JS modules. Import them directly.

**For component tests (Vitest + React Testing Library):**
```ts
// Seed store state before rendering
useAuthStore.setState({ userId: 'user-1', token: 'tok-abc', role: 'viewer' });
render(<Dashboard />);
```

---

## Copy-Paste Store Template

```ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface __Domain__State {
  // state fields
  // actions
}

export const use__Domain__Store = create<__Domain__State>()(
  devtools(
    (set) => ({
      // initial state
      // action: (arg) => set({ field: arg }, false, '__domain__/__action__'),
    }),
    { name: '__Domain__Store' }
  )
);
```

Replace `__Domain__` with the domain name (e.g. `Auth`, `Funds`, `Investors`, `UI`).

---

## References

- [Zustand documentation](https://zustand.docs.pmnd.rs/)
- [Zustand TypeScript guide](https://zustand.docs.pmnd.rs/guides/typescript)
- [Zustand middlewares](https://zustand.docs.pmnd.rs/middlewares/devtools)
- [Separating server and client state (TkDodo)](https://tkdodo.eu/blog/working-with-zustand)
