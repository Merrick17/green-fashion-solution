'use client';

import { useRef, type KeyboardEvent } from 'react';
import { ArrowUp, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechInput } from '@/hooks/use-speech-input';
import { cn } from '@/lib/utils';

interface CanvasVibeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'large';
}

export function CanvasVibeInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = 'Describe your collection vibe — season, palette, mood…',
  className,
  size = 'default',
}: CanvasVibeInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { listening, supported, toggle: toggleVoice } = useSpeechInput((text) => {
    onChange(value.trim() ? `${value.trim()} ${text}` : text);
  });

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) onSubmit();
    }
  };

  const canSend = !isLoading && value.trim().length > 0;

  return (
    <div className={cn('moodboard-vibe-input', className)} data-size={size}>
      <div className="flex items-end gap-2 border border-portal-border bg-[var(--canvas-chrome-bg)] backdrop-blur-[12px] p-2 pl-3 transition-colors focus-within:border-portal-border-strong">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={listening ? 'Listening…' : placeholder}
          disabled={isLoading}
          rows={size === 'large' ? 3 : 1}
          className="min-w-0 flex-1 resize-none border-0 bg-transparent text-[13px] text-foreground outline-none leading-normal placeholder:text-portal-muted disabled:opacity-50"
        />
        <div className="flex shrink-0 items-center gap-1">
          {supported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                listening ? 'text-destructive' : 'text-portal-muted hover:text-foreground',
              )}
              disabled={isLoading}
              onClick={toggleVoice}
              aria-label={listening ? 'Stop voice input' : 'Start voice input'}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            disabled={!canSend}
            className="h-8 w-8 bg-primary text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-30"
            onClick={onSubmit}
            aria-label="Send prompt"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      {size === 'large' && (
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.14em] text-portal-muted">
          Enter to generate · Mic for voice · Shift+Enter for new line
        </p>
      )}
    </div>
  );
}
