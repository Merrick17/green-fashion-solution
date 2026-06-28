'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';

interface PromptEnhancerProps {
  input: string;
  onRefined: (text: string) => void;
  context?: 'moodboard' | 'proposal' | 'sourcing';
  disabled?: boolean;
}

export function PromptEnhancer({ input, onRefined, context = 'moodboard', disabled }: PromptEnhancerProps) {
  const [refining, setRefining] = useState(false);
  const getToken = useAuthStore((s) => s.getAccessToken);

  const enhance = async () => {
    const trimmed = input.trim();
    if (!trimmed || refining || disabled) return;
    setRefining(true);
    try {
      // Next.js route handler — use relative URL, not apiClient (which points to NestJS)
      const token = getToken();
      const res = await fetch('/api/ai/v1/refine-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: trimmed, context }),
      });
      if (res.ok) {
        const data = (await res.json()) as { refined?: string };
        if (data.refined) onRefined(data.refined);
      }
    } catch {
      // silently fail — user keeps their original prompt
    } finally {
      setRefining(false);
    }
  };

  if (!input.trim()) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title="Enhance prompt"
      disabled={disabled || refining}
      onClick={enhance}
      className="h-7 w-7 text-portal-accent hover:text-portal-accent hover:bg-portal-accent-soft"
      aria-label="Enhance prompt with AI"
    >
      {refining ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
