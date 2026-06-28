# Design System Contract

Internal reference for `apps/web` UI. All new surfaces must follow this document.

## Design read

B2B luxury fashion sourcing SaaS. Flat-industrial editorial language with olive accent. Not generic AI SaaS.

## Typography

| Role | CSS variable | Usage |
|------|--------------|-------|
| UI sans | `--font-geist-sans` | Body, forms, tables, navigation |
| Display serif | `--font-display` (Bodoni Moda) | Dashboard titles, landing headlines only |
| Mono | `--font-geist-mono` | Eyebrows, labels, metadata |

**Rules:**
- Serif display on home dashboards and landing only, not list pages
- Max eyebrow count: `ceil(sectionCount / 3)` per page
- No mixed-family emphasis in headlines

## Color

Single accent lock: `--portal-accent` / `--accent` (olive). No `red-500`, `blue-500`, or warm-sand defaults in portal UI.

## Shape

Zero border-radius globally. Exceptions via `.rounded-full` for status dots and calendar today markers only.

No box shadows. Surfaces use 1px borders and contrast.

## Layout primitives

| Component | When to use |
|-----------|-------------|
| `AppPage` | All portal pages (replaces `.flex w-full min-h-0 flex-1 flex-col gap-8`, `.mx-auto flex w-full max-w-[var(--content-wide)] min-h-0 flex-1 flex-col gap-8`, `.mx-auto flex w-full max-w-[var(--content-wide)] min-h-0 flex-1 flex-col gap-10 pb-8`) |
| `PageHeader` | List and detail pages |
| `DashboardHeader` | Portal home dashboards only |
| `ListPage` | Paginated entity lists |
| `AuthSplitLayout` | Login, register, designer-apply |

**Deprecated:** `WorkspaceHeader` on non-dashboard routes. Hero bands only on dashboard index pages.

## Motion

- Landing: max 3 animated sections per page
- Portals: page enter + list stagger only
- Always respect `prefers-reduced-motion`
- Use `motion/react`, not `framer-motion`

## Styling policy

**Tailwind utilities only.** No custom CSS utility classes. Design tokens live in `app/styles/tokens.css` (`:root` + `@theme inline`) and are consumed via Tailwind theme keys (`bg-portal-surface`, `text-accent`, etc.). Optional class presets may live in `lib/ui/tw.ts` as Tailwind strings — not as global CSS classes.

## Documented exceptions

1. **Moodboard tldraw overrides** (`app/styles/moodboard-tldraw-overrides.css`): third-party canvas selectors only
2. **Google calendar skin** (`components/calendar/google-calendar.css`): third-party overrides using `--gcal-*` tokens
3. **Landing marketing** (`components/landing/`): gradients allowed on photo overlays only, not frosted glass panels
4. **Moodboard floating chrome** (`components/moodboard/`): `backdrop-blur` allowed on canvas toolbar/composer only

## Portal anti-patterns (ESLint + lint-design script)

Forbidden in `/customer`, `/designer`, `/admin`, and matching components:

- `backdrop-blur`
- `bg-gradient-*` (except landing photo overlays and moodboard canvas)
- Hardcoded Tailwind color scales (`red-500`, `blue-500`, `gray-*`)

## Data fetching

Components use domain hooks only. No direct `apiClient` or `lib/api/*` imports in components.

## File size

~150 line hard limit for UI components. Split when exceeded.
