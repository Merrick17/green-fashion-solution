import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type DashboardHeaderProps = {
  name?: string;
  title?: string;
  phase?: string;
  actions?: ReactNode;
  className?: string;
  showGreeting?: boolean;
};

/** Serif hero band — portal home dashboards only */
export function DashboardHeader({
  name,
  title,
  phase,
  actions,
  className,
  showGreeting = true,
}: DashboardHeaderProps) {
  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);
  const greetingLabel =
    showGreeting && name
      ? `${greeting}, ${name}`
      : showGreeting
        ? greeting
        : undefined;
  const displayTitle = title ?? greetingLabel ?? greeting;
  const showGreetingEyebrow = Boolean(title && greetingLabel);

  return (
    <header className={cn("border border-portal-border border-l-[3px] border-l-portal-accent bg-portal-surface px-7 py-7 sm:px-8", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          {showGreetingEyebrow && (
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">{greetingLabel}</p>
          )}
          <h1 className="font-serif text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)] tracking-tight text-portal-foreground">
            {displayTitle}
          </h1>
          {phase && (
            <p className="text-base leading-relaxed text-muted-foreground leading-relaxed">
              {phase}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
