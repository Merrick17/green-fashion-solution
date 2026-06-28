'use client';
import { useState, type ReactNode } from 'react';
import type { Proposal } from '@repo/types';
import { ProposalStatus } from '@repo/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateProposal } from '@/hooks/use-proposals';
type Props = { proposal: Proposal; trigger?: ReactNode };
export function ProposalChangeRequestDialog({ proposal, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sectionId, setSectionId] = useState<string>('__all__');
  const updateProposal = useUpdateProposal();
  const sections = proposal.sections ?? [];
  const submit = () => {
    if (!message.trim()) return;
    updateProposal.mutate(
      {
        id: proposal.id,
        dto: {
          status: ProposalStatus.CHANGES_REQUESTED,
          changeRequestMessage: message.trim(),
          sectionId: sectionId === '__all__' ? undefined : sectionId,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          setMessage('');
          setSectionId('__all__');
        },
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Request Changes</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request changes to proposal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {sections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="section">Section (optional)</Label>
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger id="section">
                  <SelectValue placeholder="Entire proposal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Entire proposal</SelectItem>
                  {sections.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="message">What would you like changed?</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the adjustments you need — fabrics, references, pricing, or style direction."
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={!message.trim() || updateProposal.isPending}
            >
              Submit request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
