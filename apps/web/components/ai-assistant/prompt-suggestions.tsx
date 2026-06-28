'use client';

type SuggestionContext = 'moodboard' | 'proposal' | 'sourcing';

const SUGGESTIONS: Record<SuggestionContext, Array<{ label: string; prompt: string }>> = {
  moodboard: [
    {
      label: 'Minimal SS26 collection',
      prompt: 'Build a minimalist SS26 mood with neutral tones and linen textures',
    },
    {
      label: 'Coastal color story',
      prompt: 'Add a coastal palette with sand, ivory, and soft blue swatches',
    },
    {
      label: 'Editorial grid layout',
      prompt: 'Create an editorial grid layout with evening wear references',
    },
    {
      label: 'Linen texture swatches',
      prompt: 'Add linen texture swatches in natural, ecru, and slate tones',
    },
    {
      label: 'Generate a hero image',
      prompt: 'Generate a large hero fashion image for the center of the board',
    },
  ],
  proposal: [
    {
      label: 'Generate draft',
      prompt: 'Generate a full proposal draft based on the project moodboard and sourcing library',
    },
    {
      label: 'Search linen fabrics',
      prompt: 'Search the sourcing library for linen and natural fiber fabric options',
    },
    {
      label: 'Assign sourcing task',
      prompt: 'Assign a fabric sourcing task to a designer for this collection',
    },
    {
      label: 'Export as PPTX',
      prompt: 'Export the current proposal as a PPTX deck for client presentation',
    },
    {
      label: 'Address change requests',
      prompt: 'Review customer change requests and revise the proposal sections accordingly',
    },
  ],
  sourcing: [
    {
      label: 'Show active tasks',
      prompt: 'List all my active sourcing tasks with priority and due dates',
    },
    {
      label: 'Upload a swatch',
      prompt: 'I want to upload a new fabric swatch — get me a signed upload URL',
    },
    {
      label: 'Search my uploads',
      prompt: 'Search my previously uploaded fabrics for natural fiber options',
    },
    {
      label: 'Add to collection',
      prompt: 'Add my recent fabric uploads to a new collection for this season',
    },
    {
      label: 'Mark task complete',
      prompt: 'Show my in-progress tasks so I can mark one as complete',
    },
  ],
};

interface PromptSuggestionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  compact?: boolean;
  context?: SuggestionContext;
}

export function PromptSuggestions({
  onSelect,
  disabled,
  compact,
  context = 'moodboard',
}: PromptSuggestionsProps) {
  const suggestions = SUGGESTIONS[context];
  return (
    <div
      className={compact ? 'flex flex-wrap gap-1.5' : 'flex flex-col gap-1.5'}
    >
      {suggestions.map(({ label, prompt }) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
          className={`text-left text-xs transition-colors disabled:opacity-50 ${compact ? 'border border-portal-border bg-[var(--canvas-chrome-bg)] px-2.5 py-1.5 text-xs text-portal-muted transition-colors hover:border-portal-accent hover:bg-portal-accent-soft hover:text-foreground disabled:opacity-50' : 'border border-portal-border bg-[var(--canvas-chrome-bg)] px-2.5 py-1.5 text-xs text-portal-muted transition-colors hover:border-portal-accent hover:bg-portal-accent-soft hover:text-foreground disabled:opacity-50 px-3 py-2'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
