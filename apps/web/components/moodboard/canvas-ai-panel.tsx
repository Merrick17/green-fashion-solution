'use client';

import { useEffect, useState } from 'react';
import { AiChatPanel } from '@/components/moodboard/ai-chat-panel';
import { PanelErrorBoundary } from '@/components/shared/error-boundary-wrap';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { MoodItem, Moodboard } from '@repo/types';

interface CanvasAiPanelProps {
  aiPanelOpen: boolean;
  onClose: () => void;
  moodboardId: string;
  items: MoodItem[];
  projectId?: string;
  initialPrompt?: string;
  moodboard?: Pick<
    Moodboard,
    'styleDirection' | 'colorPalette' | 'fabricSuggestions' | 'mood'
  >;
  onLoadingChange?: (loading: boolean) => void;
}

function useIsDesktop(query = '(min-width: 1024px)') {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);
  return isDesktop;
}

export function CanvasAiPanel({
  aiPanelOpen,
  onClose,
  moodboardId,
  items,
  projectId,
  initialPrompt,
  moodboard,
  onLoadingChange,
}: CanvasAiPanelProps) {
  const isDesktop = useIsDesktop();
  const panelProps = { moodboardId, items, projectId, initialPrompt, moodboard, onLoadingChange };

  return (
    <>
      <aside
        className={`hidden lg:flex shrink-0 flex-col border-l border-portal-border bg-portal-surface transition-[width] duration-300 ease-in-out ${aiPanelOpen ? 'w-[30rem]' : 'w-0 overflow-hidden'}`}
      >
        {aiPanelOpen && isDesktop && (
          <div className="relative flex h-full w-[30rem] flex-1 flex-col overflow-hidden">
            <PanelErrorBoundary>
              <AiChatPanel {...panelProps} />
            </PanelErrorBoundary>
          </div>
        )}
      </aside>

      {!isDesktop && (
        <Sheet open={aiPanelOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="flex h-full w-full max-w-md flex-col gap-0 border-l border-portal-border p-0"
          >
            <PanelErrorBoundary>
              <AiChatPanel {...panelProps} />
            </PanelErrorBoundary>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
