---
name: react-zustand
description: >
  Zustand state management patterns for the Yvy Capital frontend.
  Use when adding a new store, reading from global state, splitting
  server state from UI state, designing store interfaces, or reviewing
  state management code. Trigger phrases: "add store", "global state",
  "share state between components", "zustand", "state management".
license: MIT
metadata:
  author: Yvy Engineering
  version: "1.0.0"
---

## When to Apply

- Adding a new domain to global state (auth, funds, investors, UI)
- Component needs state that survives navigation or is shared across the tree
- Deciding between local `useState` vs a Zustand store
- Reviewing or refactoring existing store code

## Rule Categories (priority order)

| # | Category | Impact | Rules |
|---|----------|--------|-------|
| 1 | Store Design | CRITICAL | `store-domain-slicing` |
| 2 | TypeScript | CRITICAL | `store-type-safety` |
| 3 | Selectors | HIGH | `store-selectors` |
| 4 | DevTools | HIGH | `store-devtools` |
| 5 | Side Effects | HIGH | `store-no-side-effects` |
| 6 | Immutability | MEDIUM | `store-immutability` |
| 7 | Persistence | MEDIUM | (see CLAUDE.md §7) |
| 8 | Testing | LOW | (see CLAUDE.md §8) |

## Quick Reference

- One store per domain → `src/store/<domain>.store.ts`
- Always `create<Interface>()` — never let TypeScript infer state shape
- `devtools()` middleware on every store; name every `set()` action
- Subscribe to slices (`s => s.field`), never the whole store object
- Fetch logic lives in hooks/React Query, not in store actions
- Use `immer` middleware only when state is deeply nested (3+ levels)
- Exported hook name: `use<Domain>Store`

## Companion Skill

API data (server state) belongs in **TanStack Query**, not in Zustand stores.
See `react-tanstack-query` skill for query hooks, cache invalidation, and the Zustand/TanStack boundary.

## Reading the Full Guide

See `CLAUDE.md` for complete rules with incorrect/correct examples, middleware
recipes, and a copy-paste store template.
