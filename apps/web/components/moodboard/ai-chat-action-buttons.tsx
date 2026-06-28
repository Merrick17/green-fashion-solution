'use client';
import { Compass, RefreshCw, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  buildGenerateMoodboardPrompt,
  buildRefinePrompt,
} from '@/lib/ai/moodboard-prompts';

interface AiChatActionButtonsProps {
  input: string;
  isLoading: boolean;
  itemCount: number;
  needsContinue: boolean;
  onSendPrompt: (prompt: string) => void;
}

export function AiChatActionButtons({
  input,
  isLoading,
  itemCount,
  needsContinue,
  onSendPrompt,
}: AiChatActionButtonsProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="h-7 flex-1 gap-1.5 text-[11px]"
          disabled={isLoading || !input.trim()}
          onClick={() => onSendPrompt(buildGenerateMoodboardPrompt(input))}
        >
          <Compass className="h-3 w-3" />
          Start a direction
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 flex-1 gap-1.5 text-[11px]"
          disabled={isLoading || itemCount === 0}
          onClick={() =>
            onSendPrompt(
              buildRefinePrompt(
                input.trim() ||
                  'Improve the overall composition, balance, and visual hierarchy of this board.',
              ),
            )
          }
        >
          <Wand2 className="h-3 w-3" />
          Refine
        </Button>
      </div>
      {needsContinue && (
        <button
          type="button"
          onClick={() =>
            onSendPrompt(
              'Continue where you left off. Complete any remaining canvas tool calls before replying.',
            )
          }
          className="group flex w-full items-center justify-center gap-2 border border-portal-accent/40 bg-portal-accent-soft py-2 text-[11px] font-medium text-portal-accent transition-colors hover:bg-portal-accent hover:text-white"
        >
          <RefreshCw className="h-3 w-3 transition-transform duration-300 group-hover:rotate-180" />
          Continue where we left off
        </button>
      )}
    </div>
  );
}
