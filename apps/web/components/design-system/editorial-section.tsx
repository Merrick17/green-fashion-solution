import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
type EditorialSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  media?: ReactNode;
  content?: ReactNode;
  fullBleed?: boolean;
};
export function EditorialSection({
  id,
  children,
  className,
  reverse,
  media,
  content,
  fullBleed,
}: EditorialSectionProps) {
  if (media && content) {
    return (
      <section
        id={id}
        className={cn(
          fullBleed ? 'w-full' : 'mx-auto max-w-[var(--content-editorial)] px-6 py-16 md:py-24',
          className,
        )}
      >
        <div
          className={cn(
            'grid items-center gap-10 md:grid-cols-2 md:gap-16',
            reverse && 'md:[&>*:first-child]:order-2',
          )}
        >
          <div>{media}</div> <div className="space-y-6">{content}</div>
        </div>
      </section>
    );
  }
  return (
    <section
      id={id}
      className={cn(
        fullBleed ? 'w-full' : 'mx-auto max-w-[var(--content-editorial)] px-6 py-16 md:py-24',
        className,
      )}
    >
      {children}
    </section>
  );
}
