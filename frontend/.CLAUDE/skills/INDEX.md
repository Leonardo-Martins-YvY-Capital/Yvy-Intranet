# Skills Index

Canonical registry of agent skills for the frontend project.
Read this file first, then read the SKILL.md for your task before writing code.

> All paths below are relative to `frontend/` — the directory containing this index.

Skills marked **[npm]** live in `node_modules/` and update with `npm update`.
Skills marked **[local]** are project-authored files in `.agents/skills/`.
Skills marked **[installed]** were installed by Claude Code and live in `.CLAUDE/skills/`.

---

## React — TanStack Query [installed]

| When to use | Skill path |
|---|---|
| `useQuery`, `useMutation`, query keys, cache invalidation, error handling | `.CLAUDE/skills/react-tanstack-query/SKILL.md` |

## React — Zustand [installed]

| When to use | Skill path |
|---|---|
| Store design, selectors, devtools, store slicing, side-effect rules | `.CLAUDE/skills/react-zustand/SKILL.md` |

## React — General [installed]

| When to use | Skill path |
|---|---|
| Components, re-renders, bundle size, async patterns, performance | `.CLAUDE/skills/vercel-react-best-practices/SKILL.md` |

## React Native [installed]

| When to use | Skill path |
|---|---|
| React Native / Expo components, list performance, animations, native modules, mobile UI patterns | `.CLAUDE/skills/vercel-react-native-skills/SKILL.md` |

## React View Transitions [installed]

| When to use | Skill path |
|---|---|
| Page transitions, route change animations, shared element morphs, Suspense reveals, `<ViewTransition>`, `addTransitionType`, Next.js view transitions | `.CLAUDE/skills/vercel-react-view-transitions/SKILL.md` |

## Web Design Guidelines [installed]

| When to use | Skill path |
|---|---|
| UI code review, accessibility audit, UX best practices, design compliance | `.CLAUDE/skills/web-design-guidelines/SKILL.md` |

## Writing Guidelines [installed]

| When to use | Skill path |
|---|---|
| Docs/prose review, writing style, voice and tone, documentation audits | `.CLAUDE/skills/writing-guidelines/SKILL.md` |

---

## TanStack Router [npm]

**Root skill** — read for any routing task before picking a sub-skill:
`node_modules/@tanstack/router-core/skills/router-core/SKILL.md`

| When to use | Sub-skill path |
|---|---|
| `Link`, `useNavigate`, active states, `activeProps`, preloading | `node_modules/@tanstack/router-core/skills/router-core/navigation/SKILL.md` |
| URL search params, typed filters, pagination state in URL | `node_modules/@tanstack/router-core/skills/router-core/search-params/SKILL.md` |
| Dynamic path segments (`$id`), `useParams`, splat routes | `node_modules/@tanstack/router-core/skills/router-core/path-params/SKILL.md` |
| Route loaders, `loaderDeps`, TanStack Query integration | `node_modules/@tanstack/router-core/skills/router-core/data-loading/SKILL.md` |
| Auth guards, `beforeLoad` redirects, role-based access | `node_modules/@tanstack/router-core/skills/router-core/auth-and-guards/SKILL.md` |
| 404 pages, `notFoundComponent`, route error boundaries | `node_modules/@tanstack/router-core/skills/router-core/not-found-and-errors/SKILL.md` |
| Code splitting, lazy loading per route, `lazyRouteComponent` | `node_modules/@tanstack/router-core/skills/router-core/code-splitting/SKILL.md` |
| TypeScript issues, `Register`, `from` narrowing, never cast | `node_modules/@tanstack/router-core/skills/router-core/type-safety/SKILL.md` |
| SSR, hydration, server-side streaming | `node_modules/@tanstack/router-core/skills/router-core/ssr/SKILL.md` |

**Critical rules (always apply, no need to re-read each time):**
- Never interpolate params into `to` strings — use `params: { id }`, not `` to={`/fundos/${id}`} ``
- Never cast or annotate inferred TanStack Router types
- Use `Link` for clickable navigation; reserve `useNavigate` for post-async side-effect navigation only
- Always use the function form when updating search params: `search={(prev) => ({ ...prev, page: 2 })}` to preserve existing params

---

## Adding New Skills

When a new library is added to the frontend:
1. Check `node_modules/<pkg>/skills/` for bundled SKILL.md files
2. If found, add an entry under a new `## Library [npm]` section
3. If not found and the library has non-obvious patterns, author a local skill at
   `.agents/skills/<name>/SKILL.md` and register it here as `[local]`
4. For Claude Code installable skills, run the skill tool and add an `[installed]` entry
