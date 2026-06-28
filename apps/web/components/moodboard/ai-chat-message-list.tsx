'use client';
import { type RefObject } from 'react';
import { Sparkles } from 'lucide-react';
import type { UIMessage } from 'ai';
import { PromptSuggestions } from '@/components/ai-assistant/prompt-suggestions';
import { getRunningToolName } from '@/lib/ai/chat-ui';
import { AiChatMessage } from './ai-chat-message';
import { AiChatLoadingLine } from './ai-chat-loading-line';

interface AiChatMessageListProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  messages: UIMessage[];
  isLoading: boolean;
  uploading: boolean;
  onSendPrompt: (prompt: string) => void;
}

export function AiChatMessageList({
  scrollRef,
  messages,
  isLoading,
  uploading,
  onSendPrompt,
}: AiChatMessageListProps) {
  const runningToolName = isLoading ? getRunningToolName(messages) : null;
  const lastMessage = messages[messages.length - 1];
  const awaitingAssistant = isLoading && (!lastMessage || lastMessage.role === 'user');

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-5 pt-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center border border-portal-border bg-portal-surface-muted text-portal-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="max-w-[210px] space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
              Design Agent
            </p>
            <p className="text-[11px] leading-relaxed text-portal-muted">
              Describe a vibe, attach references, or ask for refinements — the agent places
              editorial layouts directly on your canvas.
            </p>
          </div>
          <PromptSuggestions onSelect={onSendPrompt} disabled={isLoading} />
        </div>
      )}
      {messages.map((msg, index) => (
        <AiChatMessage
          key={msg.id}
          message={msg}
          isStreaming={isLoading && index === messages.length - 1 && msg.role === 'assistant'}
        />
      ))}
      {awaitingAssistant && (
        <AiChatLoadingLine uploading={uploading} runningToolName={runningToolName} />
      )}
    </div>
  );
}
