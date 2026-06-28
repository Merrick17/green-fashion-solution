'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { CanvasVibeInput } from '@/components/moodboard/canvas-vibe-input';
import { PromptSuggestions } from '@/components/ai-assistant/prompt-suggestions';

interface MoodboardStarterProps {
  styleDirection: string;
  isLoading?: boolean;
  onSubmitPrompt: (prompt: string) => void;
}

export function MoodboardStarter({
  styleDirection,
  isLoading,
  onSubmitPrompt,
}: MoodboardStarterProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const prompt = value.trim();
    if (!prompt || isLoading) return;
    onSubmitPrompt(prompt);
    setValue('');
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4 pt-20 pb-32">
      <div className="pointer-events-auto w-full max-w-xl text-center">
        {/* Animated icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center border border-portal-border bg-[var(--canvas-chrome-bg)] backdrop-blur-[12px]">
            <Sparkles className="h-5 w-5 text-portal-accent animate-pulse" />
          </div>
        </div>

        <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-portal-accent">
          Vibe design canvas
        </p>
        <h2 className="text-balance text-2xl font-medium tracking-tight text-foreground md:text-3xl">
          What should this moodboard feel like?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-portal-muted">
          Describe the season, palette, and atmosphere for{' '}
          <span className="font-medium text-foreground">{styleDirection}</span>.
          Your design agent builds an editorial layout on the canvas.
        </p>

        <div className="mt-8">
          <CanvasVibeInput
            value={value}
            onChange={setValue}
            onSubmit={submit}
            isLoading={isLoading}
            size="large"
            placeholder="e.g. SS26 quiet luxury — linen, sand, charcoal, Mediterranean minimalism"
          />
        </div>

        <div className="mt-5 flex justify-center">
          <PromptSuggestions
            onSelect={(prompt) => onSubmitPrompt(prompt)}
            disabled={isLoading}
            compact
          />
        </div>
      </div>
    </div>
  );
}
