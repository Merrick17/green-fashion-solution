'use client';
import { RotateCcw, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiChatHeaderProps {
  statusLine: string;
  onClose: () => void;
  onClear?: () => void;
  hasMessages?: boolean;
}

export function AiChatHeader({ statusLine, onClose, onClear, hasMessages }: AiChatHeaderProps) {
  return (
    <header className="relative flex shrink-0 items-center justify-between border-b border-portal-border bg-portal-surface-muted px-4 py-3">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-portal-accent" />
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center bg-primary">
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          <span
            className="absolute -right-[3px] -top-[3px] h-2 w-2 bg-portal-accent border-2 border-[var(--portal-surface-muted)]"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
            Design Agent
          </h2>
          <p className="truncate text-[10px] text-portal-muted">{statusLine}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {onClear && hasMessages && (
          <Button
            variant="ghost"
            size="icon"
            title="Clear conversation"
            className="h-7 w-7 text-portal-muted hover:text-foreground"
            onClick={onClear}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-portal-muted hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
