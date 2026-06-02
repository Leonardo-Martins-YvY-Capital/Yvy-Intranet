---
title: ReactQueryDevtools Mounted Once in main.tsx
impact: MEDIUM
impactDescription: multiple DevTools instances cause UI clutter; missing DevTools slows debugging
tags: devtools, debugging, dx
---

## ReactQueryDevtools Mounted Once in main.tsx

**Impact: MEDIUM (double-mounting DevTools shows duplicate panels; omitting it makes cache debugging blind)**

`ReactQueryDevtools` is already configured in `main.tsx`. Do not add it again in any component or page.

**Already in place:**
```tsx
// src/main.tsx
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

TanStack automatically strips `ReactQueryDevtools` from production builds — no conditional needed.

**Using DevTools:**
- Click the TanStack logo in the bottom-right corner in dev mode
- Inspect active/stale/inactive queries by key
- Manually trigger refetch or invalidation to test cache behavior
- Check that mutations correctly invalidate their target keys

**Companion:** The Redux DevTools browser extension shows Zustand store state alongside TanStack Query's panel, giving a full picture of both layers.
