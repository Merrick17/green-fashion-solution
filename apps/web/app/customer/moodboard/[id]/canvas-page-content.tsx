'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useMoodboardFull } from '@/hooks/use-moodboards';
import { useCanvasStore } from '@/lib/canvas/canvas-store';
import { MoodboardStarter } from '@/components/moodboard/moodboard-starter';
import { CanvasAiPanel } from '@/components/moodboard/canvas-ai-panel';
import { CanvasFloatingChrome } from '@/components/moodboard/canvas-floating-chrome';
import { CanvasVibeBar } from '@/components/moodboard/canvas-vibe-bar';
import { UploadOverlay } from '@/components/moodboard/upload-overlay';
import { Skeleton } from '@/components/shared/skeleton';
import { RouteError } from '@/components/shared/route-error';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { MoodItem } from '@repo/types';
import dynamic from 'next/dynamic';
import 'tldraw/tldraw.css';
import { TldrawSync } from './tldraw-sync';
import { TldrawBridge } from './tldraw-bridge';
import { TldrawAutoFrame } from '@/components/moodboard/tldraw-auto-frame';
import { MoodboardTldrawComponents } from '@/components/moodboard/moodboard-tldraw';
import { TldrawExportRegistrar } from '@/components/moodboard/tldraw-export-registrar';

const Tldraw = dynamic(() => import('tldraw').then((m) => m.Tldraw), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const EDITORIAL_STARTER_PROMPT =
  'Build a complete editorial moodboard for this collection: generateMoodboardConcept, setMoodboardMetadata, then generateTldrawMoodboard with editorial-grid layout.';

export function CanvasPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ autoOpenAi?: string; autoOpenUpload?: string }>;
}) {
  const { id } = use(params);
  const query = searchParams ? use(searchParams) : {};
  const { data: moodboard, isLoading, isError, refetch } = useMoodboardFull(id);
  const aiPanelOpen = useCanvasStore((s) => s.aiPanelOpen);
  const setAiPanelOpen = useCanvasStore((s) => s.setAiPanelOpen);
  const toggleAiPanel = useCanvasStore((s) => s.toggleAiPanel);
  const setAiLoading = useCanvasStore((s) => s.setAiLoading);
  const queuedAgentPrompt = useCanvasStore((s) => s.queuedAgentPrompt);
  const clearQueuedPrompt = useCanvasStore((s) => s.clearQueuedPrompt);
  const setMoodItems = useCanvasStore((s) => s.setMoodItems);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const items: MoodItem[] =
    (moodboard as { items?: MoodItem[] } | undefined)?.items ?? [];
  const styleDirection = moodboard?.styleDirection ?? 'Untitled Canvas';

  useEffect(() => {
    setMoodItems(items);
  }, [items, setMoodItems]);

  const submitVibePrompt = useCallback((prompt: string) => {
    setInitialPrompt(prompt);
    setAiPanelOpen(true);
  }, [setAiPanelOpen]);

  useEffect(() => {
    setAiLoading(isGenerating);
  }, [isGenerating, setAiLoading]);

  useEffect(() => {
    if (queuedAgentPrompt) {
      submitVibePrompt(queuedAgentPrompt);
      clearQueuedPrompt();
    }
  }, [queuedAgentPrompt, submitVibePrompt, clearQueuedPrompt]);

  useEffect(() => {
    if (query.autoOpenAi === 'true') {
      submitVibePrompt(EDITORIAL_STARTER_PROMPT);
    }
    if (query.autoOpenUpload === 'true') setUploadOpen(true);
  }, [query.autoOpenAi, query.autoOpenUpload, submitVibePrompt]);

  useEffect(() => {
    if (!aiPanelOpen) setIsGenerating(false);
  }, [aiPanelOpen]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col bg-canvas-bg">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas-bg">
        <RouteError reset={() => void refetch()} />
      </div>
    );
  }

  if (!moodboard) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-canvas-bg">
        <p className="text-portal-muted">Moodboard not found</p>
        <Button asChild variant="brandOutline" size="sm">
          <Link href="/customer/moodboard">Back to moodboards</Link>
        </Button>
      </div>
    );
  }

  const showStarter = items.length === 0 && !isGenerating && !aiPanelOpen;
  const showVibeBar = !aiPanelOpen && !showStarter;

  return (
    // Root: flex row so canvas column and AI panel sit side-by-side
    <div
      className="moodboard-canvas flex h-full min-h-0 overflow-hidden"
      data-agent-open={aiPanelOpen ? 'true' : undefined}
    >
      {/* ── Left / canvas column ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Docked top chrome — no longer floating, proper header */}
        <CanvasFloatingChrome
          moodboardId={id}
          projectId={moodboard.projectId}
          title={moodboard.styleDirection || 'Untitled Canvas'}
          mood={moodboard.mood}
          itemCount={items.length}
          aiPanelOpen={aiPanelOpen}
          isLoading={isGenerating}
          onToggleAiPanel={toggleAiPanel}
        />

        {/* Canvas area — tldraw + overlays */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-canvas-bg [background-image:radial-gradient(circle,var(--canvas-dot)_1px,transparent_1px)] [background-size:22px_22px]">
          <div className="relative z-30 h-full w-full">
            <Tldraw
              components={MoodboardTldrawComponents}
              licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
            >
              <TldrawSync items={items} />
              <TldrawBridge moodboardId={id} />
              <TldrawAutoFrame />
              <TldrawExportRegistrar
                fileName={moodboard.styleDirection || 'moodboard'}
              />
            </Tldraw>
          </div>

          {showStarter && (
            <MoodboardStarter
              styleDirection={styleDirection}
              isLoading={isGenerating}
              onSubmitPrompt={submitVibePrompt}
            />
          )}

          {uploadOpen && (
            <UploadOverlay
              moodboardId={id}
              projectId={moodboard.projectId}
              onClose={() => setUploadOpen(false)}
            />
          )}
        </div>

        {/* Docked bottom vibe bar */}
        {showVibeBar && (
          <CanvasVibeBar
            isLoading={isGenerating}
            onSubmitPrompt={submitVibePrompt}
          />
        )}
      </div>

      {/* ── Right column: AI panel ── */}
      <CanvasAiPanel
        aiPanelOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        moodboardId={id}
        items={items}
        projectId={moodboard.projectId}
        initialPrompt={initialPrompt}
        moodboard={{
          styleDirection: moodboard.styleDirection,
          colorPalette: moodboard.colorPalette,
          fabricSuggestions: moodboard.fabricSuggestions,
          mood: moodboard.mood,
        }}
        onLoadingChange={setIsGenerating}
      />
    </div>
  );
}
