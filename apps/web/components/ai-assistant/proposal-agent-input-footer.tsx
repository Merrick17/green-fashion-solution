'use client';

import type { KeyboardEvent } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PromptEnhancer } from '@/components/ai-assistant/prompt-enhancer';

type ProposalAgentInputFooterProps = {
  input: string;
  isLoading: boolean;
  lastExport: { format: string } | null;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onRefined: (value: string) => void;
  onDownloadExport: () => void;
};

export function ProposalAgentInputFooter({
  input,
  isLoading,
  lastExport,
  onInputChange,
  onKeyDown,
  onSubmit,
  onRefined,
  onDownloadExport,
}: ProposalAgentInputFooterProps) {
  return (
    <footer className="shrink-0 space-y-2 border-t border-portal-border bg-portal-surface px-3 py-3">
      {lastExport && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 w-full gap-1.5 text-xs"
          onClick={onDownloadExport}
        >
          <Download className="h-3.5 w-3.5" />
          Download {lastExport.format.toUpperCase()}
        </Button>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex items-end gap-2 border border-portal-border bg-[var(--canvas-chrome-bg)] backdrop-blur-[12px] p-2 pl-3 relative"
      >
        <Textarea
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder={isLoading ? 'Working…' : 'Refine draft, assign task, export PPTX…'}
          rows={2}
          disabled={isLoading}
          className="min-w-0 flex-1 resize-none border-0 bg-transparent text-foreground outline-none leading-normal placeholder:text-portal-muted min-h-[4rem] resize-none pb-10 pl-3 pr-12 pt-3 text-sm shadow-none focus-visible:ring-portal-accent/30"
        />
        <div className="absolute bottom-2 left-2">
          <PromptEnhancer
            input={input}
            onRefined={onRefined}
            context="proposal"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="absolute bottom-2 right-2 h-8 w-8"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span className="text-xs font-bold">↑</span>
          )}
        </Button>
      </form>
      <p className="text-center text-[10px] text-muted-foreground">
        ✦ to enhance · Enter to send · Shift+Enter for new line
      </p>
    </footer>
  );
}
