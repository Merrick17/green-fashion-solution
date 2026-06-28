'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { CanvasVibeInput } from '@/components/moodboard/canvas-vibe-input';
import { PromptSuggestions } from '@/components/ai-assistant/prompt-suggestions';

interface CanvasVibeBarProps {
  isLoading?: boolean;
  onSubmitPrompt: (prompt: string) => void;
}

export function CanvasVibeBar({ isLoading, onSubmitPrompt }: CanvasVibeBarProps) {
  const [value, setValue] = useState('');
  const [chipsOpen, setChipsOpen] = useState(false);

  const submit = () => {
    const prompt = value.trim();
    if (!prompt || isLoading) return;
    onSubmitPrompt(prompt);
    setValue('');
  };

  return (
    <div className="z-40 shrink-0 border-t border-portal-border bg-[var(--canvas-chrome-bg)] px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] backdrop-blur-[10px]">
      <div className="mx-auto max-w-[40rem]">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-portal-accent" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-portal-muted">
              Refine with agent
            </span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-[10px] font-medium text-portal-muted transition-colors hover:text-foreground"
            onClick={() => setChipsOpen((open) => !open)}
          >
            {chipsOpen ? (
              <>Hide ideas <ChevronUp className="h-2.5 w-2.5" /></>
            ) : (
              <>Quick ideas <ChevronDown className="h-2.5 w-2.5" /></>
            )}
          </button>
        </div>

        {chipsOpen && (
          <div className="mb-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <PromptSuggestions
              onSelect={(prompt) => onSubmitPrompt(prompt)}
              disabled={isLoading}
              compact
            />
          </div>
        )}

        <CanvasVibeInput
          value={value}
          onChange={setValue}
          onSubmit={submit}
          isLoading={isLoading}
          placeholder="Refine the board — textures, palette, hero image…"
        />
      </div>
    </div>
  );
}
