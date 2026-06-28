'use client';

import type { ProposalSlide } from '@repo/utils';
import { DECK, DECK_BRAND } from './deck-colors';

type Props = {
  slide: ProposalSlide;
};

export function ProposalSlideView({ slide }: Props) {
  switch (slide.type) {
    case 'cover':
      return (
        <div
          className="relative flex h-full w-full flex-col justify-end p-[6%]"
          style={{ backgroundColor: DECK.stone }}
        >
          <p
            className="absolute left-[6%] top-[6%] text-[0.65rem] font-bold uppercase tracking-[0.2em]"
            style={{ color: DECK.ink }}
          >
            {DECK_BRAND.name}
          </p>
          <h2
            className="max-w-[90%] font-serif text-[clamp(1.5rem,4.5vw,2.75rem)] font-bold leading-tight"
            style={{ color: DECK.ink }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="mt-3 text-[clamp(0.75rem,1.6vw,0.95rem)]" style={{ color: DECK.muted }}>
              {slide.subtitle}
            </p>
          )}
          <div
            className="absolute inset-x-0 bottom-0 h-[1.2%]"
            style={{ backgroundColor: DECK.sage }}
          />
        </div>
      );

    case 'style':
      return (
        <div className="relative flex h-full w-full bg-white">
          <div className="w-[1.2%] shrink-0" style={{ backgroundColor: DECK.sage }} />
          <div className="flex flex-1 flex-col justify-center px-[6%] py-[8%]">
            <h3
              className="font-serif text-[clamp(1.25rem,3vw,1.75rem)] font-bold"
              style={{ color: DECK.ink }}
            >
              Style Direction
            </h3>
            <p
              className="mt-4 max-w-[95%] text-[clamp(0.75rem,1.5vw,0.9rem)] leading-relaxed"
              style={{ color: DECK.muted }}
            >
              {slide.body}
            </p>
          </div>
        </div>
      );

    case 'sectionDivider':
      return (
        <div
          className="flex h-full w-full items-center justify-center px-[6%]"
          style={{ backgroundColor: DECK.ink }}
        >
          <h3 className="text-center font-serif text-[clamp(1.25rem,3.5vw,2rem)] font-bold text-white">
            {slide.title}
          </h3>
        </div>
      );

    case 'sectionIntro':
      return (
        <div className="flex h-full w-full items-center bg-white px-[6%]">
          <p
            className="max-w-[95%] text-[clamp(0.75rem,1.5vw,0.9rem)] leading-relaxed"
            style={{ color: DECK.muted }}
          >
            {slide.body}
          </p>
        </div>
      );

    case 'asset':
      return (
        <div className="flex h-full w-full flex-col bg-white px-[4%] py-[4%]">
          <div className="relative min-h-0 flex-[3] overflow-hidden">
            {slide.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={slide.imageUrl}
                alt={slide.assetName ?? slide.title ?? ''}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: DECK.stone }} />
            )}
          </div>
          <div className="mt-[2%] shrink-0 space-y-1">
            <p
              className="text-[0.55rem] font-bold uppercase tracking-[0.18em]"
              style={{ color: DECK.sage }}
            >
              {(slide.assetKind ?? 'ASSET').toUpperCase()}
            </p>
            <h4
              className="font-serif text-[clamp(1rem,2.2vw,1.35rem)] font-bold leading-tight"
              style={{ color: DECK.ink }}
            >
              {slide.assetName ?? slide.title}
            </h4>
            {slide.body && (
              <p className="text-[clamp(0.65rem,1.2vw,0.8rem)]" style={{ color: DECK.muted }}>
                {slide.body}
              </p>
            )}
            {slide.keywords?.length ? (
              <p className="text-[0.6rem]" style={{ color: DECK.sage }}>
                {slide.keywords.join('  ·  ')}
              </p>
            ) : null}
            {slide.notes && (
              <p className="text-[0.65rem] italic" style={{ color: DECK.ink }}>
                {slide.notes}
              </p>
            )}
          </div>
        </div>
      );

    case 'closing':
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center px-[6%] text-center"
          style={{ backgroundColor: DECK.stone }}
        >
          <h3
            className="font-serif text-[clamp(1.25rem,3vw,1.6rem)] font-bold"
            style={{ color: DECK.ink }}
          >
            Thank you
          </h3>
          <p className="mt-3 text-[clamp(0.65rem,1.2vw,0.8rem)]" style={{ color: DECK.muted }}>
            Green Fashion Solution — {DECK_BRAND.tagline}
          </p>
        </div>
      );

    default:
      return null;
  }
}
