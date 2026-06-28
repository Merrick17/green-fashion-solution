import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProjectTabPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon?: LucideIcon;
};

export function ProjectTabPlaceholder({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  icon: Icon,
}: ProjectTabPlaceholderProps) {
  return (
    <section className="flex flex-col items-center border border-portal-border bg-portal-surface px-6 py-14 text-center lg:py-16">
      {Icon && (
        <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center bg-portal-accent-soft text-portal-accent">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-2xl tracking-tight text-portal-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Button asChild variant="brand" size="lg" className="mt-8">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </section>
  );
}
