'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
interface ProposalActionsProps {
  clientName?: string;
  saving: boolean;
  deleting?: boolean;
  canSave?: boolean;
  proposalId?: string;
  onDownloadPptx?: () => void;
  onDownloadPdf?: () => void;
  onSaveDraft: () => void;
  onSend: () => void;
  onDelete?: () => void;
}
export function ProposalActions({
  clientName,
  saving,
  deleting = false,
  canSave = true,
  proposalId,
  onDownloadPptx,
  onDownloadPdf,
  onSaveDraft,
  onSend,
  onDelete,
}: ProposalActionsProps) {
  const [sendOpen, setSendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {proposalId && onDownloadPptx && (
          <Button type="button" variant="outline" className="gap-1.5" onClick={onDownloadPptx}>
            <Download className="h-3.5 w-3.5" />
            PPTX
          </Button>
        )}
        {proposalId && onDownloadPdf && (
          <Button type="button" variant="outline" className="gap-1.5" onClick={onDownloadPdf}>
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={saving || !canSave}
        >
          Save draft
        </Button>
        <Button onClick={() => setSendOpen(true)} disabled={saving || !canSave}>
          Send to client
        </Button>
        {onDelete && (
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={deleting}
          >
            Delete
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        title="Send proposal to client?"
        description={
          clientName
            ? `This ships the proposal to ${clientName}. They'll be notified and can review, approve, or request changes.`
            : "This ships the proposal to the client. They'll be notified and can review, approve, or request changes."
        }
        confirmLabel="Send to client"
        onConfirm={() => {
          setSendOpen(false);
          onSend();
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this proposal?"
        description="This permanently removes the proposal and its sections. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setDeleteOpen(false);
          onDelete?.();
        }}
      />
    </>
  );
}
