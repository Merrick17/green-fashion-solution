'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, PanelRightOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoodboardSnapshotMenu } from '@/components/moodboard/moodboard-snapshot-menu';
import { MoodboardActionsMenu } from '@/components/moodboard/moodboard-actions-menu';
import { MoodboardExportMenu } from '@/components/moodboard/moodboard-export-menu';
import { STYLE_PANEL_SLOT_ID } from '@/lib/canvas/style-panel-slot';

interface CanvasFloatingChromeProps {
  moodboardId: string;
  projectId: string;
  title: string;
  mood?: string | null;
  itemCount: number;
  aiPanelOpen: boolean;
  isLoading?: boolean;
  onToggleAiPanel: () => void;
}

export function CanvasFloatingChrome({
  moodboardId,
  projectId,
  title,
  mood,
  itemCount,
  aiPanelOpen,
  isLoading,
  onToggleAiPanel,
}: CanvasFloatingChromeProps) {
  return (
    <header className="z-40 shrink-0 border-b border-portal-border bg-[var(--canvas-chrome-bg)] backdrop-blur-[10px]">
      {/* Main toolbar row */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        {/* Back */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-portal-muted hover:text-foreground"
          asChild
        >
          <Link href="/customer/moodboard" aria-label="Back to moodboards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="mx-1 h-4 w-px shrink-0 bg-portal-border" />

        {/* Title */}
        <div className="min-w-0 flex-1 px-1">
          <p className="truncate text-sm font-medium text-foreground leading-tight">{title}</p>
          <p className="truncate text-[10px] uppercase tracking-[0.18em] text-portal-muted leading-tight">
            {mood || 'Vibe design'} · {itemCount} elements
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-0.5">
          <MoodboardExportMenu />
          <MoodboardSnapshotMenu moodboardId={moodboardId} />
          <MoodboardActionsMenu moodboardId={moodboardId} projectId={projectId} />

          <div className="mx-1 h-4 w-px bg-portal-border" />

          {/* Agent toggle — shown when panel is closed */}
          {!aiPanelOpen && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs font-medium"
                onClick={onToggleAiPanel}
              >
                <Sparkles className="h-3.5 w-3.5 text-portal-accent" />
                <span className="hidden sm:inline">Agent</span>
                <PanelRightOpen className="h-3.5 w-3.5 text-portal-muted sm:hidden" />
              </Button>
              {isLoading && (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 bg-portal-accent animate-pulse pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </div>
          )}

          {/* Working indicator — shown when panel is open and agent is running */}
          {aiPanelOpen && isLoading && (
            <div className="flex h-8 items-center gap-1.5 px-2.5">
              <Loader2 className="h-3 w-3 animate-spin text-portal-accent" />
              <span className="hidden text-[11px] font-medium text-portal-accent sm:inline">
                Working
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Style panel slot — populated by tldraw DockedStylePanel when shapes are selected */}
      <div
        id={STYLE_PANEL_SLOT_ID}
        className="moodboard-style-panel-slot empty:hidden border-t border-portal-border"
      />
    </header>
  );
}
