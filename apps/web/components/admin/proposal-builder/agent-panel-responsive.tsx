'use client';
import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ProposalAgentPanel } from '@/components/ai-assistant/proposal-agent-panel';
import type { ProposalDraft } from '@repo/types';
interface AgentPanelResponsiveProps {
  projectId: string;
  proposalId?: string;
  revisionMode?: boolean;
  onDraft: (draft: ProposalDraft) => void;
  onSaved?: (payload: { id?: string }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
function useIsDesktop(): boolean {
  const [is, setIs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIs(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return is;
}
export function AgentPanelResponsive({
  projectId,
  proposalId,
  revisionMode,
  onDraft,
  onSaved,
  open,
  onOpenChange,
}: AgentPanelResponsiveProps) {
  const isDesktop = useIsDesktop();
  if (!open) return null;
  if (isDesktop) {
    return (
      <aside className="flex w-96 shrink-0 border-l border-portal-border">
        <ProposalAgentPanel
          projectId={projectId}
          proposalId={proposalId}
          revisionMode={revisionMode}
          onDraft={onDraft}
          onSaved={onSaved}
          onClose={() => onOpenChange(false)}
        />
      </aside>
    );
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-portal-border">
          <SheetTitle>AI draft assist</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          <ProposalAgentPanel
            projectId={projectId}
            proposalId={proposalId}
            revisionMode={revisionMode}
            onDraft={onDraft}
            onSaved={onSaved}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
