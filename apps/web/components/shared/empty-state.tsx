import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  actionLabel,
  actionHref,
  icon,
  className,
}: EmptyStateProps) {
  const resolved =
    action ??
    (actionLabel && actionHref
      ? { label: actionLabel, href: actionHref }
      : undefined);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-16 text-center',
        className,
      )}
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      {eyebrow && (
        <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h3 className="font-serif text-2xl tracking-tight text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {resolved &&
        (resolved.href ? (
          <Button asChild variant="brand" className="mt-6">
            <Link href={resolved.href}>{resolved.label}</Link>
          </Button>
        ) : (
          <Button variant="brand" onClick={resolved.onClick} className="mt-6">
            {resolved.label}
          </Button>
        ))}
      <div className="mt-8 h-px w-12 bg-border" aria-hidden />
    </div>
  );
}
