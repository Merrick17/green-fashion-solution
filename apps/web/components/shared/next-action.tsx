import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NextActionProps {
  eyebrow?: string;
  title: string;
  meta?: ReactNode;
  description?: string;
  action: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function NextAction({
  eyebrow,
  title,
  meta,
  description,
  action,
  className,
}: NextActionProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border border-portal-border border-l-2 border-l-portal-accent bg-portal-surface p-6',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h3 className="font-serif text-xl tracking-tight text-portal-foreground">
          {title}
        </h3>
        {meta && (
          <p className="text-xs leading-relaxed text-muted-foreground">{meta}</p>
        )}
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center">
        {action.href ? (
          <Button asChild variant="brand">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button variant="brand" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
