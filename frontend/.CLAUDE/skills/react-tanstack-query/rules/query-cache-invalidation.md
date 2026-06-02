---
title: Invalidate Cache on Mutation Success
impact: HIGH
impactDescription: missing invalidation leaves stale data in the UI after a successful write
tags: mutation, invalidation, cache, usemutation
---

## Invalidate Cache on Mutation Success

**Impact: HIGH (without invalidation, list views show old data after a create/update/delete)**

Every mutation that changes server data must call `queryClient.invalidateQueries` in `onSuccess`.

**Incorrect:**
```ts
const mutation = useMutation({
  mutationFn: (input) => api.post('/funds', input),
  // no onSuccess — fund list stays stale until next natural refetch
});
```

**Correct — invalidate the broadest relevant scope:**
```ts
const queryClient = useQueryClient();

const mutation = useMutation<void, ApiError, CreateFundInput>({
  mutationFn: (input) => api.post('/funds', input),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.funds.all });
  },
});
```

**For updates to a single entity — invalidate only the detail:**
```ts
onSuccess: (_, input) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.funds.detail(input.id) });
  queryClient.invalidateQueries({ queryKey: queryKeys.funds.list() });
},
```

**Scope rule:** Prefer `all` for creates/deletes (list counts change). Prefer `detail` + `list` for updates (list order may change, but detail is most important). Optimistic updates are a separate advanced pattern — see CLAUDE.md §5.
