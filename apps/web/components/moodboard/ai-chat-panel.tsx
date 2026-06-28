'use client';
import { useEffect, useRef } from 'react';
import { useMoodboardAi } from '@/hooks/use-moodboard-ai';
import { useUpsertAiSession } from '@/hooks/use-ai-session';
import { useProject } from '@/hooks/use-projects';
import { getBriefCompleteness } from '@repo/utils';
import { useCanvasStore } from '@/lib/canvas/canvas-store';
import { PromptSuggestions } from '@/components/ai-assistant/prompt-suggestions';
import { AiChatComposer } from './ai-chat-composer';
import { AiChatHeader } from './ai-chat-header';
import { AiChatMessageList } from './ai-chat-message-list';
import { AiChatActionButtons } from './ai-chat-action-buttons';
import { countMessageTools } from '@/lib/ai/chat-ui';
import type { MoodItem, Moodboard } from '@repo/types';

interface AiChatPanelProps {
  moodboardId: string;
  items: MoodItem[];
  moodboard?: Pick<
    Moodboard,
    'styleDirection' | 'colorPalette' | 'fabricSuggestions' | 'mood'
  >;
  projectId?: string;
  initialPrompt?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function AiChatPanel({
  moodboardId,
  items,
  moodboard,
  projectId,
  initialPrompt,
  onLoadingChange,
}: AiChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const closePanel = useCanvasStore((s) => s.setAiPanelOpen);
  const viewport = useCanvasStore((s) => s.viewport);
  const selectedItemIds = useCanvasStore((s) => s.selectedItemIds);
  const upsertSession = useUpsertAiSession(moodboardId);
  const initialSent = useRef(false);
  const { data: project } = useProject(projectId ?? '');
  const briefProgress = project ? getBriefCompleteness(project) : null;
  const {
    messages,
    input,
    setInput,
    attachments,
    addAttachments,
    removeAttachment,
    handleInputChange,
    handleSubmit,
    isLoading,
    uploading,
    sendPrompt,
    sessionLoaded,
    clearSession,
  } = useMoodboardAi(moodboardId, items, {
    moodboard,
    projectId,
    viewport,
    selectedItemIds,
  });

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const lastToolStats = lastAssistant ? countMessageTools(lastAssistant) : null;
  const needsContinue =
    !isLoading &&
    lastToolStats !== null &&
    (lastToolStats.failed > 0 ||
      lastToolStats.running > 0 ||
      (lastToolStats.total > 0 && lastToolStats.complete < lastToolStats.total));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && !initialSent.current && !isLoading && sessionLoaded) {
      initialSent.current = true;
      sendPrompt(initialPrompt);
    }
  }, [initialPrompt, isLoading, sendPrompt, sessionLoaded]);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const wasLoading = useRef(false);
  useEffect(() => {
    if (wasLoading.current && !isLoading && messages.length > 0) {
      upsertSession.mutate({ messages: messages as unknown[] });
    }
    wasLoading.current = isLoading;
  }, [isLoading, messages, upsertSession]);

  const handleTranscript = (text: string) => {
    setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  };

  const statusLine = [
    items.length > 0 ? `${items.length} on canvas` : 'Empty canvas',
    selectedItemIds.length > 0 ? `${selectedItemIds.length} selected` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex h-full w-full flex-col bg-portal-surface">
      <AiChatHeader
        statusLine={statusLine}
        onClose={() => closePanel(false)}
        onClear={() => { clearSession(); upsertSession.mutate({ messages: [] }); }}
        hasMessages={messages.length > 0}
      />

      {briefProgress && projectId && (
        <div className="border-b border-portal-border bg-portal-surface-muted px-3 py-2">
          <div className="mb-1 flex justify-between text-[10px] text-portal-muted">
            <span className="uppercase tracking-wide">Project brief</span>
            <span className="font-medium text-foreground">{briefProgress.percent}%</span>
          </div>
          <div className="h-0.5 bg-portal-border">
            <div
              className="h-full bg-portal-accent transition-all duration-500"
              style={{ width: `${briefProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      <AiChatMessageList
        scrollRef={scrollRef}
        messages={messages}
        isLoading={isLoading}
        uploading={uploading}
        onSendPrompt={sendPrompt}
      />

      <footer className="shrink-0 space-y-2 border-t border-portal-border bg-portal-surface-muted px-3 py-3">
        <AiChatActionButtons
          input={input}
          isLoading={isLoading}
          itemCount={items.length}
          needsContinue={needsContinue}
          onSendPrompt={sendPrompt}
        />
        {messages.length > 0 && messages.length < 4 && (
          <PromptSuggestions
            onSelect={sendPrompt}
            disabled={isLoading}
            compact
          />
        )}
        <AiChatComposer
          input={input}
          attachments={attachments}
          isLoading={isLoading}
          uploading={uploading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onAddAttachments={addAttachments}
          onRemoveAttachment={removeAttachment}
          onTranscript={handleTranscript}
          setInput={setInput}
        />
      </footer>
    </div>
  );
}
