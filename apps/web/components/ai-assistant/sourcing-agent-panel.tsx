'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import { ClipboardList, PackageSearch, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useSourcingAi } from '@/hooks/use-sourcing-ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AiChatMessage } from '@/components/moodboard/ai-chat-message';
import { AiChatHeader } from '@/components/moodboard/ai-chat-header';
import { AiChatLoadingLine } from '@/components/moodboard/ai-chat-loading-line';
import { PromptSuggestions } from '@/components/ai-assistant/prompt-suggestions';
import { PromptEnhancer } from '@/components/ai-assistant/prompt-enhancer';
import { getRunningToolName } from '@/lib/ai/chat-ui';

interface SourcingAgentPanelProps {
  onClose: () => void;
}

const QUICK_ACTIONS = [
  {
    label: 'My tasks',
    prompt: 'List all my active sourcing tasks with priority and due dates',
    icon: ClipboardList,
  },
  {
    label: 'Search fabrics',
    prompt: 'Search my uploaded fabrics for natural fiber and linen options',
    icon: PackageSearch,
  },
  {
    label: 'Complete a task',
    prompt: 'Show my in-progress tasks so I can mark one as complete',
    icon: CheckCheck,
  },
];

export function SourcingAgentPanel({ onClose }: SourcingAgentPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    sendMessage,
    clearSession,
  } = useSourcingAi({
    onAction: ({ toolName, payload }) => {
      if (toolName === 'completeTask') toast.success('Task marked complete');
      if (toolName === 'createFabricAsset' || toolName === 'createProductAsset')
        toast.success('Asset created');
      if (toolName === 'listMyTasks' && payload && typeof payload === 'object') {
        const count = (payload as { count?: number }).count;
        if (count != null) toast.message(`${count} task(s) in queue`);
      }
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendPrompt = (prompt: string) => {
    if (isLoading) return;
    void sendMessage({ text: prompt });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full w-full flex-col border-l border-portal-border bg-portal-surface">
      <AiChatHeader statusLine="Tasks, uploads & collections" onClose={onClose} onClear={clearSession} hasMessages={messages.length > 0} />

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && (
          <div className="space-y-4 px-1 pt-1">
            <p className="text-xs leading-relaxed text-portal-muted">
              Ask about your assigned tasks, upload fabrics and product references, search your
              library, or organize collections.
            </p>
            <div className="flex flex-col gap-1.5">
              {QUICK_ACTIONS.map(({ label, prompt, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => sendPrompt(prompt)}
                  className="flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors border border-portal-border bg-portal-surface-muted hover:bg-portal-accent-soft hover:text-portal-accent hover:border-portal-accent/30 disabled:opacity-50"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-portal-accent" />
                  {label}
                </button>
              ))}
            </div>
            <PromptSuggestions onSelect={sendPrompt} disabled={isLoading} context="sourcing" compact />
          </div>
        )}
        {messages.map((msg) => (
          <AiChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <AiChatLoadingLine uploading={false} runningToolName={getRunningToolName(messages)} />}
      </div>

      <footer className="shrink-0 space-y-2 border-t border-portal-border bg-portal-surface px-3 py-3 shrink-0 px-3 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 border border-portal-border bg-[var(--canvas-chrome-bg)] backdrop-blur-[12px] p-2 pl-3 relative">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder={isLoading ? 'Working…' : 'Show my tasks, upload linen swatch…'}
            rows={2}
            disabled={isLoading}
            className="min-w-0 flex-1 resize-none border-0 bg-transparent text-foreground outline-none leading-normal placeholder:text-portal-muted min-h-[4rem] resize-none pb-10 pl-3 pr-12 pt-3 text-sm shadow-none focus-visible:ring-portal-accent/30"
          />
          <div className="absolute bottom-2 left-2">
            <PromptEnhancer input={input} onRefined={setInput} context="sourcing" disabled={isLoading} />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="absolute bottom-2 right-2 h-8 w-8"
          >
            <span className="text-xs font-bold">↑</span>
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </footer>
    </div>
  );
}
