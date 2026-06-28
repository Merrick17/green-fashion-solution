'use client';
import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import type { Proposal } from '@repo/types';
import { ProposalStatus } from '@repo/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCreateProposalChangeRequest } from '@/hooks/use-proposals';

type Props = { proposal: Proposal };

export function ProposalSectionChangeRequests({ proposal }: Props) {
  const createChangeRequest = useCreateProposalChangeRequest();
  const sections = proposal.sections ?? [];
  const canRequest = proposal.status === ProposalStatus.SENT;

  if (!canRequest || sections.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-border bg-portal-surface p-4">
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Section feedback
      </h4>
      <div className="space-y-2">
        {sections.map((section) => (
          <SectionChangeRequestRow
            key={section.id}
            proposalId={proposal.id}
            sectionId={section.id}
            sectionTitle={section.title}
            isPending={createChangeRequest.isPending}
            onSubmit={(message) =>
              createChangeRequest.mutate({ id: proposal.id, dto: { message, sectionId: section.id } })
            }
          />
        ))}
      </div>
    </div>
  );
}

type RowProps = {
  proposalId: string;
  sectionId: string;
  sectionTitle: string;
  isPending: boolean;
  onSubmit: (message: string) => void;
};

function SectionChangeRequestRow({ sectionTitle, isPending, onSubmit }: RowProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const submit = () => {
    if (!message.trim()) return;
    onSubmit(message.trim());
    setMessage('');
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="min-w-0 truncate text-sm text-foreground">{sectionTitle}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 shrink-0 gap-1 text-xs">
            <MessageSquarePlus className="h-3 w-3" />
            Request change
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-3">
          <p className="mb-2 text-xs font-medium text-foreground">
            Change request for: <span className="text-muted-foreground">{sectionTitle}</span>
          </p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what you'd like changed in this section…"
            rows={3}
            className="text-xs"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!message.trim() || isPending}
              onClick={submit}
            >
              Submit
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
