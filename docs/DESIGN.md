# Green Fashion Solution — Design System

> Tokens live in `apps/web/app/globals.css`. **Flat design is global — not landing-only.**

## Global flat rule (non-negotiable)

- **Border radius:** `0` everywhere — all `--radius-*` tokens, all components, all portals
- **Elevation:** no decorative shadows — `--shadow-*` are `none`
- **Surfaces:** flat color blocks; avoid bordered cards — use background contrast (`bg-muted`, `bg-card`) to separate regions
- **Buttons/inputs:** square corners; no pill shapes

Enforced in `globals.css` via `:root` tokens + `border-radius: 0 !important` on all elements.

## Design read

Luxury fashion sourcing — editorial, Zara-influenced campaign surfaces + flat UI chrome. Bodoni Moda display, sage accent (`#4f5d45` / `#8a9a6e`).

## Typography

- **UI:** Inter (`--font-sans`)
- **Display:** Bodoni Moda (`--font-serif`)
- **Labels:** Geist Mono (`.eyebrow`, `.label-caps`)

## Components

Use `components/design-system/` primitives. Do not add `rounded-*` or `shadow-*` in new code.
