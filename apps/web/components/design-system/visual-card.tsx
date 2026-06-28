import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
type VisualCardProps = {
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  footer?: ReactNode;
  aspect?: 'square' | 'portrait' | 'landscape' | 'wide';
  className?: string;
  onClick?: () => void;
};
const aspectClass = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
} as const;
export function VisualCard({
  href,
  imageSrc,
  imageAlt = '',
  title,
  subtitle,
  meta,
  footer,
  aspect = 'landscape',
  className,
  onClick,
}: VisualCardProps) {
  const inner = (
    <article
      className={cn(
        'group border border-portal-border bg-portal-surface overflow-hidden transition-colors hover:border-[color-mix(in_srgb,var(--portal-accent)_28%,var(--portal-border))]',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className={cn('relative overflow-hidden bg-portal-surface-muted', aspectClass[aspect])}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-portal-surface-muted to-accent/10" />
        )}
        {meta && <div className="absolute left-4 top-4 z-10">{meta}</div>}
      </div>
      <div className="space-y-1.5 p-5">
        <h3 className="font-serif text-lg tracking-tight text-portal-foreground transition-colors group-hover:text-portal-accent">
          {title}
        </h3>
        {subtitle && (
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
        )}
        {footer}
      </div>
    </article>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
