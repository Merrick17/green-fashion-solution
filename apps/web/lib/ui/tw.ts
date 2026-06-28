/** Shared Tailwind class strings — no custom CSS utilities. */
export const tw = {
  page: "flex w-full min-h-0 flex-1 flex-col gap-8",
  dashboardPage:
    "mx-auto flex w-full max-w-[var(--content-wide)] min-h-0 flex-1 flex-col gap-10 pb-8",
  panel:
    "border border-portal-border bg-portal-surface transition-[border-color,background-color] duration-150",
  panelMuted: "border border-portal-border bg-portal-surface-muted",
  panelInteractive:
    "border border-portal-border bg-portal-surface transition-[border-color,background-color] duration-150 hover:border-[color-mix(in_srgb,var(--portal-accent)_22%,var(--portal-border-strong))]",
  heroBand:
    "border border-portal-border border-l-[3px] border-l-portal-accent bg-portal-surface px-7 py-7 sm:px-8",
  featureHero:
    "relative overflow-hidden border border-[color-mix(in_srgb,var(--portal-accent)_35%,var(--portal-border))] bg-portal-accent px-9 py-8 text-portal-accent-foreground lg:px-12 lg:py-10",
  statTile:
    "flex flex-col gap-3 border border-portal-border bg-portal-surface px-7 py-7 sm:px-8",
  eyebrow:
    "font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent",
  labelCaps:
    "font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground",
  muted: "text-muted-foreground leading-relaxed",
  displaySm:
    "text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)]",
  displayMd:
    "text-[length:var(--text-display-md)] leading-[var(--leading-display)] tracking-[var(--tracking-display)]",
  displayLg:
    "text-[length:var(--text-display-lg)] leading-[var(--leading-display)] tracking-[var(--tracking-display)]",
  btnPremium:
    "bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90",
  btnPremiumOutline:
    "border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40",
  navActive:
    "border-l-2 border-l-portal-accent bg-portal-hover text-portal-sidebar-foreground",
  cardGrid: "grid gap-6",
  surface: "border border-border bg-card",
  inboxPanel:
    "border border-portal-border border-t-[3px] border-t-portal-accent bg-portal-surface-muted px-9 py-8",
  inboxItem:
    "flex items-center gap-4 border border-portal-border bg-portal-surface p-4 transition-[border-color,background-color] duration-150 hover:border-[color-mix(in_srgb,var(--portal-accent)_30%,var(--portal-border))] hover:bg-portal-hover",
} as const;
