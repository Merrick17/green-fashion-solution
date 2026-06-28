/** Design token references — values live in app/styles/tokens.css */

export const cssVar = {
  accent: "var(--portal-accent)",
  accentSoft: "var(--portal-accent-soft)",
  foreground: "var(--portal-foreground)",
  muted: "var(--portal-muted)",
  border: "var(--portal-border)",
  surface: "var(--portal-surface)",
  surfaceMuted: "var(--portal-surface-muted)",
  destructive: "var(--destructive)",
} as const;

export const zIndex = {
  base: 0,
  sticky: 10,
  dropdown: 20,
  overlay: 40,
  modal: 50,
  grain: 60,
} as const;

export const motion = {
  fast: 150,
  base: 300,
  slow: 600,
  ease: [0.16, 1, 0.3, 1] as const,
  easeCss: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const spacing = {
  section: "var(--spacing-section)",
  pageY: "var(--spacing-page-y)",
  shell: "var(--spacing-shell)",
  cardPad: "var(--spacing-card-pad)",
} as const;

export const layout = {
  narrow: "var(--content-narrow)",
  editorial: "var(--content-editorial)",
  wide: "var(--content-wide)",
} as const;

export const radius = {
  base: "0",
  button: "0",
  panel: "0",
  editorial: "0",
  frame: "0",
} as const;

export const shadow = {
  subtle: "none",
  raised: "none",
  editorial: "none",
} as const;

export const journeySteps = [
  { id: "intake", label: "Intake" },
  { id: "sourcing", label: "Research" },
  { id: "proposal", label: "Proposal" },
  { id: "sampling", label: "Sampling" },
  { id: "production", label: "Production" },
] as const;

/** Landing accent strip — olive scale only */
export const landingAccentStrip = [
  cssVar.accent,
  "var(--accent)",
  cssVar.accentSoft,
  "var(--portal-surface-muted)",
] as const;
