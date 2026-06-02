---
title: devtools() on Every Store with Named Actions
impact: HIGH
impactDescription: provides time-travel debugging and readable action history in Redux DevTools
tags: devtools, debugging, dx
---

## devtools() on Every Store with Named Actions

**Impact: HIGH (unnamed actions appear as "anonymous" in DevTools, making state traces unreadable)**

Every store must be wrapped in `devtools()`. Every `set()` call must pass a named action string as the third argument.

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
    }),
    { name: 'UIStore' }   // appears as store name in DevTools panel
  )
);
```

**Naming convention:** `<domain>/<verb>` — e.g. `auth/setSession`, `funds/selectFund`, `ui/toggleSidebar`.

The second arg to `set()` is `replace` (boolean) — always pass `false` to merge, not replace, state.
