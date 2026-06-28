'use client';

import { useMemo } from 'react';
import {
  buildProposalSlides,
  proposalDisplayTitle,
  type ProposalDeckInput,
} from '@repo/utils';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDownloadProposalPdf } from '@/hooks/use-proposal-export';
import { useDownloadProposalPptx } from '@/hooks/use-download-proposal-pptx';
import { useSlideshowNavigation } from '@/hooks/use-slideshow-navigation';
import { ProposalSlideView } from './proposal-slide-view';
import { DECK } from './deck-colors';

type Props = {
  proposal: ProposalDeckInput & { id?: string };
  showDownloads?: boolean;
  immersive?: boolean;
  className?: string;
};

export function ProposalSlideshow({
  proposal,
  showDownloads = true,
  immersive = false,
  className = '',
}: Props) {
  const slides = useMemo(() => buildProposalSlides(proposal), [proposal]);
  const { index, go, prev, next, filmstripOpen, setFilmstripOpen, isFullscreen, toggleFullscreen, rootRef } =
    useSlideshowNavigation(slides.length);
  const downloadPdf = useDownloadProposalPdf();
  const downloadPptx = useDownloadProposalPptx();
  const title = proposalDisplayTitle(proposal as Parameters<typeof proposalDisplayTitle>[0]);

  if (!slides.length) {
    return (
      <p className="text-sm text-muted-foreground">This proposal has no slides yet.</p>
    );
  }

  const slide = slides[index]!;
  const shell = immersive
    ? 'flex min-h-0 flex-1 flex-col bg-[#111]'
    : `flex flex-col ${className}`;

  return (
    <div ref={rootRef} className={shell}>
      <div
        className={
          immersive
            ? 'flex min-h-0 flex-1 items-center justify-center p-4 md:p-8'
            : 'relative w-full'
        }
      >
        <div
          className="relative w-full overflow-hidden border border-white/10 bg-white shadow-none"
          style={{ aspectRatio: '16 / 9', maxHeight: immersive ? '100%' : undefined }}
        >
          <ProposalSlideView slide={slide} />
        </div>
      </div>

      <div
        className={
          immersive
            ? 'shrink-0 border-t border-white/10 bg-[#111] px-4 py-3'
            : 'mt-4 space-y-3'
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={immersive ? 'text-white hover:bg-white/10' : ''}
              onClick={prev}
              disabled={index === 0}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span
              className={`min-w-[4.5rem] text-center text-xs font-medium tabular-nums ${
                immersive ? 'text-white/70' : 'text-muted-foreground'
              }`}
            >
              {index + 1} / {slides.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={immersive ? 'text-white hover:bg-white/10' : ''}
              onClick={next}
              disabled={index === slides.length - 1}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`ml-2 text-xs ${immersive ? 'text-white/70 hover:bg-white/10' : ''}`}
              onClick={() => setFilmstripOpen((o) => !o)}
            >
              Slides
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={immersive ? 'text-white hover:bg-white/10' : ''}
              onClick={() => void toggleFullscreen()}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            {showDownloads && proposal.id && (
              <>
                <Button
                  type="button"
                  variant={immersive ? 'secondary' : 'brandOutline'}
                  size="sm"
                  onClick={() => downloadPdf.mutate({ proposalId: proposal.id!, title })}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                </Button>
                <Button
                  type="button"
                  variant={immersive ? 'secondary' : 'brandOutline'}
                  size="sm"
                  onClick={() => void downloadPptx({ id: proposal.id!, title })}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> PPTX
                </Button>
              </>
            )}
          </div>
        </div>

        {filmstripOpen && (
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {slides.map((s, i) => (
              <button
                key={`${s.type}-${s.title ?? i}`}
                type="button"
                onClick={() => go(i)}
                className={`relative shrink-0 overflow-hidden border transition-opacity ${
                  i === index
                    ? immersive
                      ? 'border-white opacity-100'
                      : 'border-foreground opacity-100'
                    : immersive
                      ? 'border-white/20 opacity-60 hover:opacity-90'
                      : 'border-border opacity-60 hover:opacity-90'
                }`}
                style={{ width: '7rem', aspectRatio: '16 / 9', backgroundColor: DECK.stone }}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
              >
                <div className="pointer-events-none absolute inset-0 scale-[0.35] origin-top-left">
                  <div className="h-[285%] w-[285%]">
                    <ProposalSlideView slide={s} />
                  </div>
                </div>
                <span
                  className={`absolute bottom-0.5 right-1 text-[9px] font-semibold ${
                    immersive ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
