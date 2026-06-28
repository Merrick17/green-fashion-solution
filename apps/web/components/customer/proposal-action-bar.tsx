'use client';
import { useState } from 'react';
import { CheckCircle2, MessageSquare, Send, XCircle } from 'lucide-react';
import type { Proposal } from '@repo/types';
import { ProposalStatus } from '@repo/types';
import { Button } from '@/components/ui/button';
import { ProposalChangeRequestDialog } from '@/components/customer/proposal-change-request-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCreateProposalChangeRequest } from '@/hooks/use-proposals';
export function ProposalNotesPanel({
  proposal,
  showHeader = true,
}: {
  proposal: Proposal;
  showHeader?: boolean;
}) {
  const createNote = useCreateProposalChangeRequest();
  const [note, setNote] = useState('');
  const items = proposal.changeRequests ?? [];
  const send = () => {
    if (!note.trim()) return;
    createNote.mutate(
      { id: proposal.id, dto: { message: note.trim() } },
      { onSuccess: () => setNote('') },
    );
  };
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {showHeader && (
        <div className="flex shrink-0 items-center gap-2 p-5 pb-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-xl tracking-tight text-foreground">
            Async Notes
          </h3>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-2">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <MessageSquare className="mb-3 h-8 w-8 text-portal-muted/40" />
            <p className="text-sm text-portal-muted">
              No notes or change requests yet.
            </p>
            <p className="mt-1 text-xs text-portal-muted">
              Feedback you provide will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((req) => {
              const section = req.sectionId
                ? proposal.sections?.find((s) => s.id === req.sectionId)
                : null;
              return (
                <div key={req.id} className=" bg-card p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                      {section ? section.title : 'General'}
                    </span>
                    <span className="text-[10px] font-medium text-portal-muted">
                      {new Date(req.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-portal-foreground">
                    {req.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-portal-border bg-portal-surface p-4">
        <div className="relative">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Add an async note..."
            className="min-h-[80px] w-full resize-none bg-background px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8"
            disabled={!note.trim() || createNote.isPending}
            onClick={send}
            aria-label="Send note"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-portal-muted">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
export function ProposalActionBar({
  proposal,
  onApprove,
  onReject,
}: {
  proposal: Proposal;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const canRespond = proposal.status === ProposalStatus.SENT;
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-portal-border bg-portal-surface px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          {canRespond && (
            <>
              <Button size="sm" className="flex-1" onClick={onApprove}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Approve
              </Button>
              <ProposalChangeRequestDialog
                proposal={proposal}
                trigger={
                  <Button size="sm" variant="outline" className="flex-1">
                    Request change
                  </Button>
                }
              />
              <Button
                size="sm"
                variant="ghost"
                className=" text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onReject}
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Reject</span>
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className=""
            onClick={() => setNotesOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="sr-only">Notes</span>
          </Button>
        </div>
      </div>
      <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] gap-0 p-0">
          <SheetHeader className="border-b border-portal-border">
            <SheetTitle className="font-serif">
              Async Notes &amp; Feedback
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ProposalNotesPanel proposal={proposal} showHeader={false} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
