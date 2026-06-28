'use client';

import type { ProposalSlide } from '@repo/utils';

type SlidePreview = Pick<ProposalSlide, 'type' | 'title' | 'subtitle'>;

interface ProposalDeckPreviewStripProps {
  slides: SlidePreview[];
  maxSlides?: number;
  className?: string;
}

function formatSlideType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProposalDeckPreviewStrip({
  slides,
  maxSlides = 20,
  className = '',
}: ProposalDeckPreviewStripProps) {
  if (slides.length === 0) return null;

  const visible = slides.slice(0, maxSlides);
  const overflow = slides.length - visible.length;

  return (
    <div className={className}>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-portal-muted">
        Deck preview — {slides.length} slide{slides.length === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] flex gap-2 overflow-x-auto pb-1">
        {visible.map((slide, i) => (
          <article
            key={`${slide.type}-${slide.title ?? ''}-${i}`}
            className="flex h-[88px] w-28 shrink-0 flex-col justify-between gap-1.5 border border-portal-border bg-portal-surface-muted p-2"
            aria-label={`Slide ${i + 1}: ${slide.title ?? slide.type}`}
          >
            <span className="inline-block self-start text-[9px] font-semibold uppercase tracking-widest text-portal-accent">{formatSlideType(slide.type)}</span>
            <p className="line-clamp-3 flex-1 text-[11px] font-medium leading-snug text-foreground">
              {slide.title?.trim() || slide.subtitle?.trim() || 'Untitled slide'}
            </p>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-portal-muted">{i + 1}</span>
          </article>
        ))}
        {overflow > 0 && (
          <div className="flex h-[88px] w-28 shrink-0 flex-col justify-between gap-1.5 border border-portal-border bg-portal-surface-muted p-2 items-center justify-center bg-portal-surface text-center" aria-hidden="true">
            <span className="inline-block self-start text-[9px] font-semibold uppercase tracking-widest text-portal-accent">More</span>
            <p className="line-clamp-3 flex-1 text-[11px] font-medium leading-snug text-foreground">+{overflow} slides</p>
          </div>
        )}
      </div>
    </div>
  );
}
