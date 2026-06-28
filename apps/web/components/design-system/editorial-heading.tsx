import { cn } from '@/lib/utils';

type EditorialHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  size?: 'md' | 'lg' | 'xl';
  className?: string;
};

const sizeClass = {
  md: 'text-[length:var(--text-display-sm)] leading-[var(--leading-heading)] tracking-[var(--tracking-display)]',
  lg: 'text-[length:var(--text-display-md)] leading-[var(--leading-display)] tracking-[var(--tracking-display)]',
  xl: 'text-[length:var(--text-display-lg)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] md:text-[length:var(--text-display-xl)]',
} as const;

export function EditorialHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  size = 'lg',
  className,
}: EditorialHeadingProps) {
  return (
    <header
      className={cn(
        'space-y-4',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
          {eyebrow}
        </p>
      )}
      <h2 className={cn('font-serif text-balance', sizeClass[size])}>
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
      )}
    </header>
  );
}
