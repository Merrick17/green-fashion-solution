'use client';
import { Sparkles } from 'lucide-react';
import { humanizeToolName } from '@/lib/ai/chat-ui';

interface AiChatLoadingLineProps {
  uploading: boolean;
  runningToolName?: string | null;
}

export function AiChatLoadingLine({ uploading, runningToolName }: AiChatLoadingLineProps) {
  const label = uploading
    ? 'Uploading'
    : runningToolName
      ? humanizeToolName(runningToolName)
      : 'Thinking';
  return (
    <div className="flex gap-2.5">
      <div className="mt-5 flex h-6 w-6 shrink-0 items-center justify-center border border-portal-border bg-portal-surface-muted text-portal-accent">
        <Sparkles className="h-3 w-3" />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-portal-muted">
          Assistant
        </span>
        <div className="border border-portal-border bg-portal-surface-muted px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-[3px]" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-[5px] w-[5px] bg-portal-accent"
                  style={{
                    animation: 'agent-dot 1.4s ease-in-out infinite',
                    animationDelay: `${i * 220}ms`,
                  }}
                />
              ))}
            </span>
            <span className="text-[11px] italic text-portal-muted">{label}…</span>
          </div>
        </div>
      </div>
    </div>
  );
}
