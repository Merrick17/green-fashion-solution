'use client';

import { Button } from '@/components/ui/button';
import { PromptSuggestions } from '@/components/ai-assistant/prompt-suggestions';

type ProposalAgentEmptyStateProps = {
  isLoading: boolean;
  revisionMode?: boolean;
  onGenerateDraft: (prompt?: string) => void;
};

export function ProposalAgentEmptyState({
  isLoading,
  revisionMode,
  onGenerateDraft,
}: ProposalAgentEmptyStateProps) {
  return (
    <div className="space-y-4 px-1 pt-1">
      <p className="text-xs leading-relaxed text-portal-muted">
        Build sectioned proposals, search the sourcing library, assign designer tasks, preview
        deck structure, and export PDF/PPTX. Proposals stay DRAFT until you send.
      </p>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          className="h-8 w-full text-xs"
          disabled={isLoading}
          onClick={() => onGenerateDraft()}
        >
          Generate proposal draft
        </Button>
        {revisionMode && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full text-xs"
            disabled={isLoading}
            onClick={() =>
              onGenerateDraft(
                'Review customer change requests and revise the affected proposal sections',
              )
            }
          >
            Address change requests
          </Button>
        )}
      </div>
      <PromptSuggestions
        onSelect={(p) => onGenerateDraft(p)}
        disabled={isLoading}
        context="proposal"
        compact
      />
    </div>
  );
}
